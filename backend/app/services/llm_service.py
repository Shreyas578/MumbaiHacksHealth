import json
import httpx
from typing import List, Dict, Optional
from app.core.config import settings


# Check which LLM provider to use
USE_OLLAMA = settings.LLM_PROVIDER == "ollama"
OLLAMA_BASE_URL = "http://localhost:11434"


async def analyze_with_ollama(prompt: str) -> Dict:
    """Analyze claim using local Ollama model."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": settings.LLM_MODEL,  # e.g., "llama3.2:3b"
                    "prompt": prompt,
                    "stream": False,
                    "format": "json"
                }
            )
            response.raise_for_status()
            result = response.json()
            
            # Extract and parse the response
            response_text = result.get("response", "{}")
            return json.loads(response_text)
            
    except Exception as e:
        print(f"Ollama error: {e}")
        raise


async def analyze_claim_with_evidence(
    claim: str,
    evidence: List[Dict]
) -> Dict:
    """
    Analyze a health claim using LLM with provided evidence.
    
    Supports both Ollama (local) and OpenAI (cloud) providers.
    
    Args:
        claim: The health claim to analyze
        evidence: List of evidence from PubMed (title, abstract, url)
    
    Returns:
        Dict with: normalized_claim, verdict, severity, explanation, sources_used
    """
    
    # Build evidence context
    evidence_text = ""
    if evidence:
        evidence_text = "\n\nAvailable Medical Evidence:\n"
        for i, ev in enumerate(evidence[:5], 1):
            evidence_text += f"\n{i}. Title: {ev['title']}\n"
            evidence_text += f"   PubMed: {ev['url']}\n"
            if ev.get('abstract'):
                evidence_text += f"   Info: {ev['abstract'][:200]}...\n"
    else:
        evidence_text = "\n\nNo specific medical evidence found in PubMed for this claim."
    
    # Construct prompt
    prompt = f"""You are a medical fact-checking AI assistant. Analyze the following health claim using the provided evidence from medical literature.

CLAIM TO VERIFY:
"{claim}"
{evidence_text}

INSTRUCTIONS:
1. Normalize the claim into a clear, concise statement
2. Determine the verdict: "True", "False", "Misleading", or "Unverified"
3. Assess severity: "Low", "Medium", or "High" (based on health impact if false information spreads)
4. Provide a simple 2-3 sentence explanation in non-technical language
5. List which sources you used (if any)

SAFETY REQUIREMENTS:
- NEVER provide personal medical advice
- ALWAYS recommend consulting healthcare professionals
- Use cautious, evidence-based language  
- If evidence is weak/absent, use "Unverified"
- For dangerous claims, use severity "High"

Return ONLY a JSON object with this exact structure:
{{
  "normalized_claim": "clear statement of the claim",
  "verdict": "True|False|Misleading|Unverified",
  "severity": "Low|Medium|High",
  "explanation": "2-3 sentence explanation in simple language",
  "sources_used": ["PubMed URL 1", "PubMed URL 2"]
}}"""

    try:
        # Try Ollama first if configured
        if USE_OLLAMA:
            print(f"Using Ollama model: {settings.LLM_MODEL}")
            result = await analyze_with_ollama(prompt)
        else:
            # Use OpenAI if available
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.LLM_API_KEY) if settings.LLM_API_KEY else None
            
            if not client:
                return get_fallback_response(claim)
            
            print("Using OpenAI")
            response = await client.chat.completions.create(
                model=settings.LLM_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a medical fact-checking assistant. Provide accurate, evidence-based analysis while maintaining safety and never giving personal medical advice."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=500,
                response_format={"type": "json_object"}
            )
            
            result_text = response.choices[0].message.content
            result = json.loads(result_text)
        
        # Validate required fields
        required_fields = ["normalized_claim", "verdict", "severity", "explanation"]
        for field in required_fields:
            if field not in result:
                raise ValueError(f"Missing required field: {field}")
        
        # Ensure sources_used is a list
        if "sources_used" not in result:
            result["sources_used"] = []
        
        return result
    
    except Exception as e:
        print(f"Error in LLM analysis: {e}")
        return get_fallback_response(claim)


def get_fallback_response(claim: str) -> Dict:
    """Return a safe fallback response when LLM analysis fails."""
    return {
        "normalized_claim": claim.strip(),
        "verdict": "Unverified",
        "severity": "Medium",
        "explanation": (
            "We were unable to verify this claim at this time. "
            "Please consult healthcare professionals and check trusted sources like WHO, CDC, or ICMR for accurate health information. "
            "This system is for informational purposes only and does not provide medical advice."
        ),
        "sources_used": []
    }
