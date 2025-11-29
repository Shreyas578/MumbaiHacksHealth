"""
Organization fact publishing API endpoints
Allows organizations to publish blockchain facts and public to browse them
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_org
from app.models.organization import Organization
from app.models.fact_record import FactRecord
from app.schemas.fact import (
    FactPublishRequest,
    FactRecordResponse,
    PublicFactSummary,
    PublicFactListResponse
)


router = APIRouter(prefix="/api", tags=["Organization Facts"])


@router.post("/org/facts", response_model=FactRecordResponse, status_code=status.HTTP_201_CREATED)
async def publish_fact(
    request: FactPublishRequest,
    current_org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """
    Publish a health fact to the database (organization authentication required)
    
    Call this endpoint after successfully publishing a fact to the blockchain.
    Stores the complete WHO fact JSON plus blockchain transaction metadata.
    
    **Authentication**: Requires valid JWT Bearer token.
    """
    # Check if fact_id already exists
    existing_fact = db.query(FactRecord).filter(FactRecord.fact_id == request.fact_id).first()
    if existing_fact:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fact with ID '{request.fact_id}' already exists"
        )
    
    # Check if on_chain_hash already exists (prevents duplicate hashes)
    existing_hash = db.query(FactRecord).filter(FactRecord.on_chain_hash == request.on_chain_hash).first()
    if existing_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fact with hash '{request.on_chain_hash}' already exists"
        )
    
    # Validate verdict enum
    valid_verdicts = ["true", "false", "misleading", "unproven", "partially_true"]
    if request.verdict.lower() not in valid_verdicts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid verdict. Must be one of: {', '.join(valid_verdicts)}"
        )
    
    # Validate severity enum
    valid_severities = ["low", "medium", "high", "critical"]
    if request.severity.lower() not in valid_severities:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid severity. Must be one of: {', '.join(valid_severities)}"
        )
    
    # Create new fact record
    new_fact = FactRecord(
        org_id=current_org.id,
        fact_id=request.fact_id,
        claim_text=request.claim_text,
        verdict=request.verdict.lower(),
        severity=request.severity.lower(),
        summary=request.summary,
        topics=request.topics,
        evidence=[evidence.model_dump() for evidence in request.evidence],
        on_chain_hash=request.on_chain_hash,
        tx_hash=request.tx_hash,
        block_number=request.block_number,
        issued_at=request.issued_at
    )
    
    db.add(new_fact)
    db.commit()
    db.refresh(new_fact)
    
    # Return response with org name
    return FactRecordResponse(
        id=new_fact.id,
        org_id=new_fact.org_id,
        org_name=current_org.name,
        fact_id=new_fact.fact_id,
        claim_text=new_fact.claim_text,
        verdict=new_fact.verdict,
        severity=new_fact.severity,
        summary=new_fact.summary,
        topics=new_fact.topics or [],
        evidence=[],  # Will be populated from JSON
        on_chain_hash=new_fact.on_chain_hash,
        tx_hash=new_fact.tx_hash,
        block_number=new_fact.block_number,
        issued_at=new_fact.issued_at,
        created_at=new_fact.created_at
    )


@router.get("/public/facts", response_model=PublicFactListResponse)
async def get_public_facts(
    limit: int = Query(50, ge=1, le=100, description="Maximum number of facts to return"),
    offset: int = Query(0, ge=0, description="Number of facts to skip"),
    verdict: Optional[str] = Query(None, description="Filter by verdict"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    org_id: Optional[int] = Query(None, description="Filter by organization ID"),
    db: Session = Depends(get_db)
):
    """
    Get list of all published health facts (public, no authentication required)
    
    Returns paginated list of fact summaries with organization attribution.
    Anyone can browse published facts without logging in.
    
    **Filters**:
    - `verdict`: Filter by verdict (true, false, misleading, unproven, partially_true)
    - `severity`: Filter by severity (low, medium, high, critical)
    - `org_id`: Filter by organization ID
    """
    # Build query with join to get organization name
    query = db.query(
        FactRecord.id,
        FactRecord.fact_id,
        FactRecord.claim_text,
        FactRecord.verdict,
        FactRecord.severity,
        FactRecord.issued_at,
        Organization.name.label("org_name")
    ).join(Organization, FactRecord.org_id == Organization.id)
    
    # Apply filters
    if verdict:
        query = query.filter(FactRecord.verdict == verdict.lower())
    if severity:
        query = query.filter(FactRecord.severity == severity.lower())
    if org_id:
        query = query.filter(FactRecord.org_id == org_id)
    
    # Get total count
    total = query.count()
    
    # Get paginated results, ordered by most recent first
    results = query.order_by(FactRecord.issued_at.desc()).offset(offset).limit(limit).all()
    
    # Convert to PublicFactSummary objects
    fact_summaries = [
        PublicFactSummary(
            id=row.id,
            fact_id=row.fact_id,
            claim_text=row.claim_text,
            verdict=row.verdict,
            severity=row.severity,
            org_name=row.org_name,
            issued_at=row.issued_at
        )
        for row in results
    ]
    
    return PublicFactListResponse(total=total, facts=fact_summaries)


@router.get("/public/facts/{fact_id}", response_model=FactRecordResponse)
async def get_fact_detail(
    fact_id: str,
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific fact (public, no authentication required)
    
    Returns complete fact details including summary, evidence, topics, and blockchain metadata.
    
    **Parameters**:
    - `fact_id`: The WHO fact ID (e.g., "who-2025-0001")
    """
    # Query fact with organization join
    fact = db.query(FactRecord).filter(FactRecord.fact_id == fact_id).first()
    
    if not fact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fact with ID '{fact_id}' not found"
        )
    
    # Get organization name
    org = db.query(Organization).filter(Organization.id == fact.org_id).first()
    
    # Convert evidence JSON to EvidenceItem objects (if needed)
    from app.schemas.fact import EvidenceItem
    evidence_items = []
    if fact.evidence:
        evidence_items = [EvidenceItem(**item) for item in fact.evidence]
    
    return FactRecordResponse(
        id=fact.id,
        org_id=fact.org_id,
        org_name=org.name if org else "Unknown",
        fact_id=fact.fact_id,
        claim_text=fact.claim_text,
        verdict=fact.verdict,
        severity=fact.severity,
        summary=fact.summary,
        topics=fact.topics or [],
        evidence=evidence_items,
        on_chain_hash=fact.on_chain_hash,
        tx_hash=fact.tx_hash,
        block_number=fact.block_number,
        issued_at=fact.issued_at,
        created_at=fact.created_at
    )
