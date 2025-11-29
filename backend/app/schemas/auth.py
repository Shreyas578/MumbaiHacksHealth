"""
Pydantic schemas for organization authentication
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class OrgRegisterRequest(BaseModel):
    """Request schema for organization registration"""
    name: str = Field(..., min_length=3, max_length=255, description="Organization name")
    email: EmailStr = Field(..., description="Organization email address")
    password: str = Field(..., min_length=8, max_length=100, description="Password (min 8 characters)")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "World Health Organization",
                "email": "contact@who.int",
                "password": "securepassword123"
            }
        }
    )


class OrgLoginRequest(BaseModel):
    """Request schema for organization login"""
    email: EmailStr = Field(..., description="Organization email address")
    password: str = Field(..., description="Password")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "contact@who.int",
                "password": "securepassword123"
            }
        }
    )


class OrgProfile(BaseModel):
    """Organization profile schema"""
    id: int = Field(..., description="Organization ID")
    name: str = Field(..., description="Organization name")
    email: str = Field(..., description="Organization email")
    wallet_address: Optional[str] = Field(None, description="Connected MetaMask wallet address")
    created_at: datetime = Field(..., description="Account creation timestamp")
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "name": "World Health Organization",
                "email": "contact@who.int",
                "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
                "created_at": "2025-01-29T10:00:00Z"
            }
        }
    )


class OrgLoginResponse(BaseModel):
    """Response schema for successful login"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type (always 'bearer')")
    organization: OrgProfile = Field(..., description="Organization profile")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "organization": {
                    "id": 1,
                    "name": "World Health Organization",
                    "email": "contact@who.int",
                    "wallet_address": None,
                    "created_at": "2025-01-29T10:00:00Z"
                }
            }
        }
    )


class WalletAddressUpdate(BaseModel):
    """Request schema for updating wallet address"""
    wallet_address: str = Field(..., min_length=42, max_length=42, description="Ethereum wallet address (0x...)")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"
            }
        }
    )



class OrgRegisterRequest(BaseModel):
    """Request schema for organization registration"""
    name: str = Field(..., min_length=3, max_length=255, description="Organization name")
    email: EmailStr = Field(..., description="Organization email address")
    password: str = Field(..., min_length=8, max_length=100, description="Password (min 8 characters)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "World Health Organization",
                "email": "contact@who.int",
                "password": "securepassword123"
            }
        }


class OrgLoginRequest(BaseModel):
    """Request schema for organization login"""
    email: EmailStr = Field(..., description="Organization email address")
    password: str = Field(..., description="Password")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "contact@who.int",
                "password": "securepassword123"
            }
        }


class OrgLoginResponse(BaseModel):
    """Response schema for successful login"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type (always 'bearer')")
    organization: "OrgProfile" = Field(..., description="Organization profile")
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "organization": {
                    "id": 1,
                    "name": "World Health Organization",
                    "email": "contact@who.int",
                    "wallet_address": None,
                    "created_at": "2025-01-29T10:00:00Z"
                }
            }
        }


class OrgProfile(BaseModel):
    """Organization profile schema"""
    id: int = Field(..., description="Organization ID")
    name: str = Field(..., description="Organization name")
    email: str = Field(..., description="Organization email")
    wallet_address: Optional[str] = Field(None, description="Connected MetaMask wallet address")
    created_at: datetime = Field(..., description="Account creation timestamp")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "World Health Organization",
                "email": "contact@who.int",
                "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
                "created_at": "2025-01-29T10:00:00Z"
            }
        }


class WalletAddressUpdate(BaseModel):
    """Request schema for updating wallet address"""
    wallet_address: str = Field(..., min_length=42, max_length=42, description="Ethereum wallet address (0x...)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"
            }
        }
