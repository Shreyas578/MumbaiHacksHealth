from typing import Dict, List
from app.services.pubmed_service import search_pubmed
from app.services.llm_service import analyze_claim_with_evidence


async def verify_claim(text: str, channel: str = "web") -> Dict:
    """
    Complete verification pipeline for a health claim.
    
    Steps:
    1. Check WHO blockchain registry first
    2. If not found on-chain, search PubMed for evidence
    3. Analyze claim with LLM using evidence
    4. Format sources for response
    
    Args:
        text: The health claim to verify
        channel: Channel from which the claim originated
    
    Returns:
        Dict with:
            - normalized_claim: str
            - verdict: str (True, False, Misleading, Unverified)
            - severity: str (Low, Medium, High)
            - explanation: str
            - sources: List[Dict] with {name, url}
            - channel: str
            - on_chain_verified: bool
            - who_fact_id: Optional[str]
            - verification_method: str
            - blockchain_explorer_url: Optional[str]
    """
    
    # STEP 1: Check blockchain first for WHO-verified facts
    from app.services.blockchain_client import get_blockchain_client
    from pathlib import Path
    import json
    
    blockchain_client = get_blockchain_client()
    
    if blockchain_client.is_available():
        print(f"🔗 Checking blockchain for WHO verification...")
        blockchain_fact = blockchain_client.check_who_fact(text)
        
        if blockchain_fact:
            print(f"✅ WHO fact verified on-chain: {blockchain_fact['fact_id']}")
            
            # Load full fact details from local JSON
            facts_dir = Path(__file__).parent.parent / "data" / "who_facts"
            fact_file = facts_dir / f"{blockchain_fact['fact_id']}.json"
            
            sources = []
            explanation = ""
            normalized_claim = text.strip()
            
            if fact_file.exists():
                with open(fact_file, 'r', encoding='utf-8') as f:
                    who_fact = json.load(f)
                    explanation = who_fact['summary']
                    normalized_claim = who_fact['claim_text']
                    
                    # Format evidence sources
                    sources = [
                        {
                            "name": ev['title'],
                            "url": ev['url']
                        }
                        for ev in who_fact['evidence'][:3]  # Top 3 sources
                    ]
            
            return {
                "normalized_claim": normalized_claim,
                "verdict": blockchain_fact['verdict'].replace("_", " ").title(),
                "severity": blockchain_fact['severity'].title(),
                "explanation": explanation,
                "sources": sources,
                "channel": channel,
                "on_chain_verified": True,
                "who_fact_id": blockchain_fact['fact_id'],
                "verification_method": "WHO Blockchain Registry",
                "blockchain_explorer_url": f"https://somnia-explorer.com/address/{blockchain_client.contract_address}"
            }
    
    # STEP 2: Fallback to AI verification pipeline
    print(f"Searching PubMed for: {text[:100]}")
    evidence = await search_pubmed(text, max_results=5)
    print(f"Found {len(evidence)} PubMed articles")
    
    # Step 3: Analyze with LLM
    print("Analyzing with LLM...")
    analysis = await analyze_claim_with_evidence(text, evidence)
    
    # Step 4: Format sources
    sources = []
    
    # Add PubMed sources that were used by the LLM
    sources_used_urls = set(analysis.get("sources_used", []))
    for ev in evidence:
        if ev["url"] in sources_used_urls or len(sources) < 3:
            sources.append({
                "name": ev["title"][:80] + "..." if len(ev["title"]) > 80 else ev["title"],
                "url": ev["url"]
            })
    
    # Add standard references if no PubMed sources
    if not sources:
        sources = [
            {
                "name": "World Health Organization (WHO)",
                "url": "https://www.who.int/health-topics"
            },
            {
                "name": "Centers for Disease Control and Prevention (CDC)",
                "url": "https://www.cdc.gov/"
            }
        ]
    
    # Step 5: Return formatted result (AI-verified)
    return {
        "normalized_claim": analysis["normalized_claim"],
        "verdict": analysis["verdict"],
        "severity": analysis["severity"],
        "explanation": analysis["explanation"],
        "sources": sources,
        "channel": channel,
        "on_chain_verified": False,
        "who_fact_id": None,
        "verification_method": "AI",
        "blockchain_explorer_url": None
    }
