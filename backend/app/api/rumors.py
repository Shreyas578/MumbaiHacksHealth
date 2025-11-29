from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.rumor import RumorRequest, RumorResponse, RumorListResponse, VerdictEnum, SeverityEnum
from app.models.rumor import Rumor
from datetime import datetime

router = APIRouter(prefix="/api", tags=["rumors"])


@router.post("/check_rumor", response_model=RumorResponse, status_code=201)
async def check_rumor(
    request: RumorRequest,
    db: Session = Depends(get_db)
):
    """
    Check a health rumor and return a verification verdict.
    
    Uses AI-powered verification with PubMed evidence search and LLM analysis.
    """
    
    # Import verification service
    from app.services.verification_service import verify_claim
    
    try:
        # Run AI verification pipeline
        verification_result = await verify_claim(request.text, request.channel)
        
        # Create database entry
        db_rumor = Rumor(
            original_text=request.text,
            normalized_claim=verification_result["normalized_claim"],
            verdict=verification_result["verdict"],
            severity=verification_result["severity"],
            explanation=verification_result["explanation"],
            sources=verification_result["sources"],
            channel=verification_result["channel"],
            created_at=datetime.utcnow()
        )
        
        db.add(db_rumor)
        db.commit()
        db.refresh(db_rumor)
        
        # Convert to response model
        return RumorResponse(
            id=db_rumor.id,
            original_text=db_rumor.original_text,
            normalized_claim=db_rumor.normalized_claim,
            verdict=VerdictEnum(db_rumor.verdict),
            severity=SeverityEnum(db_rumor.severity),
            explanation=db_rumor.explanation,
            sources=db_rumor.sources,
            channel=db_rumor.channel,
            created_at=db_rumor.created_at,
            on_chain_verified=verification_result.get("on_chain_verified", False),
            who_fact_id=verification_result.get("who_fact_id"),
            verification_method=verification_result.get("verification_method", "AI"),
            blockchain_explorer_url=verification_result.get("blockchain_explorer_url")
        )

    
    except Exception as e:
        # Log error
        print(f"Verification error: {e}")
        
        # Fallback to safe response
        db_rumor = Rumor(
            original_text=request.text,
            normalized_claim=request.text.strip(),
            verdict="Unverified",
            severity="Medium",
            explanation="We encountered an error verifying this claim. Please consult healthcare professionals for medical advice.",
            sources=[{"name": "WHO", "url": "https://www.who.int/"}],
            channel=request.channel,
            created_at=datetime.utcnow()
        )
        
        db.add(db_rumor)
        db.commit()
        db.refresh(db_rumor)
        
        return RumorResponse(
            id=db_rumor.id,
            original_text=db_rumor.original_text,
            normalized_claim=db_rumor.normalized_claim,
            verdict=VerdictEnum(db_rumor.verdict),
            severity=SeverityEnum(db_rumor.severity),
            explanation=db_rumor.explanation,
            sources=db_rumor.sources,
            channel=db_rumor.channel,
            created_at=db_rumor.created_at
        )


@router.get("/rumors", response_model=RumorListResponse)
async def get_rumors(
    limit: int = 50,
    offset: int = 0,
    verdict: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get a list of verified rumors with optional filtering.
    
    Args:
        limit: Maximum number of rumors to return (default: 50)
        offset: Number of rumors to skip (default: 0)
        verdict: Filter by verdict (True, False, Misleading, Unverified)
        severity: Filter by severity (Low, Medium, High)
    """
    
    # Build query
    query = db.query(Rumor)
    
    # Apply filters
    if verdict:
        query = query.filter(Rumor.verdict == verdict)
    if severity:
        query = query.filter(Rumor.severity == severity)
    
    # Get total count
    total = query.count()
    
    # Get rumors with pagination, ordered by most recent first
    rumors = query.order_by(Rumor.created_at.desc()).offset(offset).limit(limit).all()
    
    # Convert to response models
    rumor_responses = [
        RumorResponse(
            id=rumor.id,
            original_text=rumor.original_text,
            normalized_claim=rumor.normalized_claim,
            verdict=VerdictEnum(rumor.verdict),
            severity=SeverityEnum(rumor.severity),
            explanation=rumor.explanation,
            sources=rumor.sources or [],
            channel=rumor.channel,
            created_at=rumor.created_at
        )
        for rumor in rumors
    ]
    
    return RumorListResponse(total=total, rumors=rumor_responses)


@router.get("/rumors/{rumor_id}", response_model=RumorResponse)
async def get_rumor(
    rumor_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific rumor by ID."""
    
    rumor = db.query(Rumor).filter(Rumor.id == rumor_id).first()
    
    if not rumor:
        raise HTTPException(status_code=404, detail="Rumor not found")
    
    return RumorResponse(
        id=rumor.id,
        original_text=rumor.original_text,
        normalized_claim=rumor.normalized_claim,
        verdict=VerdictEnum(rumor.verdict),
        severity=SeverityEnum(rumor.severity),
        explanation=rumor.explanation,
        sources=rumor.sources or [],
        channel=rumor.channel,
        created_at=rumor.created_at
    )


@router.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    """
    Get statistics about verified rumors.
    
    Returns:
        - total_rumors: Total count of all rumors
        - by_verdict: Breakdown by verdict (True, False, Misleading, Unverified)
        - by_severity: Breakdown by severity (High, Medium, Low)
    """
    from sqlalchemy import func
    
    # Total count
    total_rumors = db.query(Rumor).count()
    
    # Count by verdict
    verdict_counts = db.query(
        Rumor.verdict,
        func.count(Rumor.id)
    ).group_by(Rumor.verdict).all()
    
    by_verdict = {verdict: count for verdict, count in verdict_counts}
    
    # Ensure all verdict types are present
    for verdict_type in ["True", "False", "Misleading", "Unverified"]:
        if verdict_type not in by_verdict:
            by_verdict[verdict_type] = 0
    
    # Count by severity
    severity_counts = db.query(
        Rumor.severity,
        func.count(Rumor.id)
    ).group_by(Rumor.severity).all()
    
    by_severity = {severity: count for severity, count in severity_counts}
    
    # Ensure all severity types are present
    for severity_type in ["High", "Medium", "Low"]:
        if severity_type not in by_severity:
            by_severity[severity_type] = 0
    
    return {
        "total_rumors": total_rumors,
        "by_verdict": by_verdict,
        "by_severity": by_severity
    }
