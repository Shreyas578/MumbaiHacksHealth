from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from datetime import datetime
from app.core.database import Base


class Rumor(Base):
    """Database model for storing health rumors and their verification results."""
    
    __tablename__ = "rumors"
    
    id = Column(Integer, primary_key=True, index=True)
    original_text = Column(Text, nullable=False)
    normalized_claim = Column(Text, nullable=False)
    verdict = Column(String(50), nullable=False)  # True, False, Misleading, Unverified
    severity = Column(String(20), nullable=False)  # Low, Medium, High
    explanation = Column(Text, nullable=False)
    sources = Column(JSON, nullable=True)  # List of source objects
    channel = Column(String(50), default="web")  # web, whatsapp_sim, etc.
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Rumor(id={self.id}, verdict={self.verdict}, severity={self.severity})>"
