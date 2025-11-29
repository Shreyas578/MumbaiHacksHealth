from pydantic import BaseModel, Field
from typing import Dict


class StatsResponse(BaseModel):
    """Response schema for statistics endpoint."""
    total_rumors: int = Field(..., description="Total number of rumors verified")
    by_verdict: Dict[str, int] = Field(..., description="Count by verdict type")
    by_severity: Dict[str, int] = Field(..., description="Count by severity level")
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_rumors": 100,
                "by_verdict": {
                    "True": 15,
                    "False": 35,
                    "Misleading": 25,
                    "Unverified": 25
                },
                "by_severity": {
                    "High": 20,
                    "Medium": 50,
                    "Low": 30
                }
            }
        }
