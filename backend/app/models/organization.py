"""
Organization model for health organizations that can publish verified health facts
"""

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class Organization(Base):
    """
    Organization model for health authorities (WHO, CDC, ICMR, etc.)
    
    Organizations can register, login, connect wallets, and publish health facts on-chain.
    """
    __tablename__ = "organizations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    wallet_address = Column(String(255), nullable=True, index=True)  # MetaMask address
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<Organization(id={self.id}, name='{self.name}', email='{self.email}')>"
