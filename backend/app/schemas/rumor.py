from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class VerdictEnum(str, Enum):
    """Possible verdicts for a health claim."""
    TRUE = "True"
    FALSE = "False"
    MISLEADING = "Misleading"
    UNVERIFIED = "Unverified"


class SeverityEnum(str, Enum):
    """Severity levels for health claims."""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class SourceSchema(BaseModel):
    """Schema for a source reference."""
    name: str = Field(..., description="Name of the source (e.g., 'WHO', 'PubMed Article')")
    url: str = Field(..., description="URL to the source")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "WHO COVID-19 Advice",
                "url": "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public"
            }
        }


class RumorRequest(BaseModel):
    """Request schema for checking a rumor."""
    text: str = Field(..., min_length=10, max_length=2000, description="The health claim or rumor to verify")
    channel: Optional[str] = Field(default="web", description="Channel from which the rumor originated")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "Drinking hot water can cure COVID-19",
                "channel": "web"
            }
        }


class RumorResponse(BaseModel):
    """Response schema for a verified rumor."""
    id: int = Field(..., description="Unique identifier for the rumor")
    original_text: str = Field(..., description="Original text submitted by user")
    normalized_claim: str = Field(..., description="Cleaned and normalized claim statement")
    verdict: VerdictEnum = Field(..., description="Verification verdict")
    severity: SeverityEnum = Field(..., description="Severity level of the claim")
    explanation: str = Field(..., description="Simple explanation of the verdict (2-3 sentences)")
    sources: List[SourceSchema] = Field(default_factory=list, description="List of sources used for verification")
    channel: str = Field(..., description="Channel from which the rumor originated")
    created_at: datetime = Field(..., description="Timestamp when the rumor was verified")
    
    # Blockchain verification fields
    on_chain_verified: bool = Field(default=False, description="Whether this fact was verified against WHO blockchain registry")
    who_fact_id: Optional[str] = Field(default=None, description="WHO fact ID if verified on-chain (e.g., 'who-2025-0001')")
    verification_method: str = Field(default="AI", description="Method used for verification: 'WHO Blockchain Registry' or 'AI'")
    blockchain_explorer_url: Optional[str] = Field(default=None, description="URL to view fact on blockchain explorer")

    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "original_text": "Drinking hot water can cure COVID-19",
                "normalized_claim": "Hot water consumption cures COVID-19",
                "verdict": "False",
                "severity": "High",
                "explanation": "There is no scientific evidence that drinking hot water can cure or prevent COVID-19. While staying hydrated is important for overall health, it does not eliminate the virus. Follow WHO guidelines for prevention.",
                "sources": [
                    {
                        "name": "WHO COVID-19 Myth Busters",
                        "url": "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters"
                    }
                ],
                "channel": "web",
                "created_at": "2024-01-15T10:30:00"
            }
        }


class RumorListResponse(BaseModel):
    """Response schema for listing rumors."""
    total: int = Field(..., description="Total number of rumors")
    rumors: List[RumorResponse] = Field(..., description="List of rumors")
    
    class Config:
        json_schema_extra = {
            "example": {
                "total": 1,
                "rumors": [
                    {
                        "id": 1,
                        "original_text": "Drinking hot water can cure COVID-19",
                        "normalized_claim": "Hot water consumption cures COVID-19",
                        "verdict": "False",
                        "severity": "High",
                        "explanation": "There is no scientific evidence...",
                        "sources": [],
                        "channel": "web",
                        "created_at": "2024-01-15T10:30:00"
                    }
                ]
            }
        }
