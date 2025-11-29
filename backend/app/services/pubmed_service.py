import httpx
import re
from typing import List, Dict, Optional
from app.core.config import settings


async def extract_keywords(claim: str) -> List[str]:
    """Extract key medical/health terms from the claim for PubMed search."""
    # Remove common words and focus on medical terms
    stopwords = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'can', 'will', 'does', 'is', 'are', 'was', 'were', 'be', 'been', 'being'}
    
    # Clean and tokenize
    words = re.findall(r'\b[a-zA-Z]+\b', claim.lower())
    keywords = [w for w in words if w not in stopwords and len(w) >= 4]
    
    # Take up to 5 most relevant keywords
    return keywords[:5]


async def search_pubmed(claim: str, max_results: int = 5) -> List[Dict]:
    """
    Search PubMed for relevant medical articles related to the claim.
    
    Uses NCBI E-utilities API (ESearch + ESummary).
    
    Args:
        claim: The health claim to search for
        max_results: Maximum number of articles to return
    
    Returns:
        List of evidence dictionaries with title, abstract, pubmed_id, url
    """
    try:
        # Extract keywords from claim
        keywords = await extract_keywords(claim)
        query = " AND ".join(keywords)
        
        if not query:
            query = claim[:100]  # Fallback to truncated claim
        
        # Step 1: ESearch - Get PubMed IDs
        esearch_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
        esearch_params = {
            "db": "pubmed",
            "term": query,
            "retmax": max_results,
            "retmode": "json",
            "sort": "relevance"
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            esearch_response = await client.get(esearch_url, params=esearch_params)
            esearch_response.raise_for_status()
            esearch_data = esearch_response.json()
        
        # Extract PubMed IDs
        id_list = esearch_data.get("esearchresult", {}).get("idlist", [])
        
        if not id_list:
            return []
        
        # Step 2: ESummary - Get article details
        esummary_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
        esummary_params = {
            "db": "pubmed",
            "id": ",".join(id_list),
            "retmode": "json"
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            esummary_response = await client.get(esummary_url, params=esummary_params)
            esummary_response.raise_for_status()
            esummary_data = esummary_response.json()
        
        # Parse results
        evidence_list = []
        result_data = esummary_data.get("result", {})
        
        for pmid in id_list:
            if pmid in result_data:
                article = result_data[pmid]
                
                # Extract title
                title = article.get("title", "No title available")
                
                # Try to get abstract (not always available in summary)
                # For full abstract, would need EFetch, but keeping it simple for hackathon
                authors = article.get("authors", [])
                author_names = [a.get("name", "") for a in authors[:3]]
                
                # Create source entry
                evidence_list.append({
                    "title": title,
                    "abstract": f"Authors: {', '.join(author_names)}" if author_names else "Abstract not available via summary API",
                    "pubmed_id": pmid,
                    "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
                })
        
        return evidence_list
    
    except httpx.TimeoutException:
        print("PubMed API timeout")
        return []
    except httpx.HTTPError as e:
        print(f"PubMed API error: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error in PubMed search: {e}")
        return []
