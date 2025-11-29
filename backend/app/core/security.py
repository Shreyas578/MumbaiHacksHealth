"""
Security utilities for authentication and authorization
Handles password hashing, JWT token creation/verification, and auth dependencies
"""

import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.organization import Organization


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings from environment
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", "24"))

# HTTP Bearer token scheme
security = HTTPBearer()


def hash_password(password: str) -> str:
    """Hash a plain text password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against a hashed password"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token
    
    Args:
        data: Dictionary to encode in the token (e.g., {"sub": "org_id"})
        expires_delta: Optional expiry duration (defaults to JWT_EXPIRY_HOURS)
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS)
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """
    Decode and verify a JWT access token
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload
        
    Raises:
        JWTError: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError as e:
        raise e


async def get_current_org(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Organization:
    """
    Dependency to get the current authenticated organization from JWT token
    
    Args:
        credentials: HTTP Bearer credentials from request header
        db: Database session
        
    Returns:
        Current Organization object
        
    Raises:
        HTTPException: If token is invalid or organization not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        org_id: str = payload.get("sub")
        
        if org_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Get organization from database
    org = db.query(Organization).filter(Organization.id == int(org_id)).first()
    
    if org is None:
        raise credentials_exception
    
    return org
