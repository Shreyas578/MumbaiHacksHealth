"""
Pydantic schemas for fact records (organization-published facts)
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class EvidenceItem(BaseModel):
    """Evidence item schema matching WHO fact JSON schema"""
    url: str = Field(..., description="URL to evidence source")
    title: str = Field(..., description="Title of evidence source")
    checksum: Optional[str] = Field(None, description="SHA-256 checksum of source")
    accessed_at: str = Field(..., description="ISO 8601 timestamp when accessed")


class FactPublishRequest(BaseModel):
    """
    Request schema for publishing a fact to the database
    
    Called after successful blockchain transaction. Includes the complete
    WHO fact JSON plus blockchain transaction metadata.
    """
    # WHO Fact JSON fields
    fact_id: str = Field(..., min_length=3, max_length=50, description="Unique fact ID (e.g., 'who-2025-0001')")
    claim_text: str = Field(..., min_length=10, description="The health claim being verified")
    verdict: str = Field(..., description="Verdict: true, false, misleading, unproven, partially_true")
    severity: str = Field(..., description="Severity: low, medium, high, critical")
    summary: str = Field(..., min_length=20, description="Summary explanation of the verdict")
    topics: List[str] = Field(default_factory=list, description="List of relevant topics")
    evidence: List[EvidenceItem] = Field(default_factory=list, description="List of evidence sources")
    issued_at: datetime = Field(..., description="WHO issuance timestamp")
    
    # Blockchain metadata
    on_chain_hash: str = Field(..., min_length=66, max_length=66, description="SHA-256 hash of canonical JSON (0x...)")
    tx_hash: str = Field(..., min_length=66, max_length=66, description="Ethereum transaction hash")
    block_number: Optional[int] = Field(None, description="Block number where transaction was mined")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "fact_id": "who-2025-0001",
                "claim_text": "Drinking hot water can cure COVID-19",
                "verdict": "false",
                "severity": "high",
                "summary": "There is no scientific evidence that drinking hot water prevents or cures COVID-19.",
                "topics": ["COVID-19", "misinformation", "prevention"],
                "evidence": [
                    {
                        "url": "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters",
                        "title": "WHO COVID-19 Myth Busters",
                        "checksum": "sha256:abc123...",
                        "accessed_at": "2025-01-29T10:00:00Z"
                    }
                ],
                "issued_at": "2025-01-29T10:00:00Z",
                "on_chain_hash": "0xa1b2c3d4e5f6...",
                "tx_hash": "0x1234567890abcdef...",
                "block_number": 12345678
            }
        }
    )


class FactRecordResponse(BaseModel):
    """Response schema for a single fact record"""
    id: int = Field(..., description="Database record ID")
    org_id: int = Field(..., description="Organization ID that published this fact")
    org_name: str = Field(..., description="Organization name")
    
    # WHO Fact fields
    fact_id: str
    claim_text: str
    verdict: str
    severity: str
    summary: str
    topics: List[str]
    evidence: List[EvidenceItem]
    
    # Blockchain metadata
    on_chain_hash: str
    tx_hash: str
    block_number: Optional[int]
    
    # Timestamps
    issued_at: datetime
    created_at: datetime
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "org_id": 1,
                "org_name": "World Health Organization",
                "fact_id": "who-2025-0001",
                "claim_text": "Drinking hot water can cure COVID-19",
                "verdict": "false",
                "severity": "high",
                "summary": "There is no scientific evidence...",
                "topics": ["COVID-19", "misinformation"],
                "evidence": [],
                "on_chain_hash": "0xa1b2c3d4...",
                "tx_hash": "0x1234567890...",
                "block_number": 12345678,
                "issued_at": "2025-01-29T10:00:00Z",
                "created_at": "2025-01-29T11:00:00Z"
            }
        }
    )


class PublicFactSummary(BaseModel):
    """Minimal fact summary for public browsing (list view)"""
    id: int
    fact_id: str
    claim_text: str
    verdict: str
    severity: str
    org_name: str
    issued_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class PublicFactListResponse(BaseModel):
    """Response schema for public fact list with pagination"""
    total: int = Field(..., description="Total number of facts")
    facts: List[PublicFactSummary] = Field(..., description="List of fact summaries")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "total": 42,
                "facts": [
                    {
                        "id": 1,
                        "fact_id": "who-2025-0001",
                        "claim_text": "Drinking hot water can cure COVID-19",
                        "verdict": "false",
                        "severity": "high",
                        "org_name": "World Health Organization",
                        "issued_at": "2025-01-29T10:00:00Z"
                    }
                ]
            }
        }
    )
