"""
FactRecord model for organization-published health facts
Stores on-chain fact metadata for public browsing
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class FactRecord(Base):
    """
    FactRecord model for WHO-style health facts published by organizations
    
    This table stores the off-chain metadata for facts that have been published
    to the blockchain via HealthFactRegistry contract. Each record links to an
    organization and includes the complete fact JSON plus blockchain metadata.
    """
    __tablename__ = "fact_records"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign key to Organization
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    
    # WHO Fact fields (matching JSON schema)
    fact_id = Column(String(50), nullable=False, unique=True, index=True)  # e.g., "who-2025-0001"
    claim_text = Column(Text, nullable=False)
    verdict = Column(String(20), nullable=False)  # true, false, misleading, unproven, partially_true
    severity = Column(String(20), nullable=False)  # low, medium, high, critical
    summary = Column(Text, nullable=False)
    topics = Column(JSON, nullable=True)  # Array of topic strings
    evidence = Column(JSON, nullable=True)  # Array of evidence objects
    
    # Blockchain metadata
    on_chain_hash = Column(String(66), nullable=False, index=True)  # 0x + 64 hex chars (SHA-256)
    tx_hash = Column(String(66), nullable=False, index=True)  # Ethereum transaction hash
    block_number = Column(Integer, nullable=True)  # Block number where tx was mined
    
    # Timestamps
    issued_at = Column(DateTime(timezone=True), nullable=False)  # WHO issuance timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationship to Organization (establishes bidirectional link)
    organization = relationship("Organization", backref="published_facts")
    
    def __repr__(self):
        return f"<FactRecord(id={self.id}, fact_id='{self.fact_id}', verdict='{self.verdict}', org_id={self.org_id})>"
