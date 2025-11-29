"""
Organization authentication API endpoints
Handles registration, login, and profile management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_org
)
from app.models.organization import Organization
from app.schemas.auth import (
    OrgRegisterRequest,
    OrgLoginRequest,
    OrgLoginResponse,
    OrgProfile,
    WalletAddressUpdate
)


router = APIRouter(prefix="/api", tags=["Organization Auth"])


@router.post("/auth/register-org", response_model=OrgProfile, status_code=status.HTTP_201_CREATED)
async def register_organization(
    request: OrgRegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new organization account
    
    Creates a new organization with email/password authentication.
    Email and organization name must be unique.
    """
    # Check if email already exists
    existing_org = db.query(Organization).filter(Organization.email == request.email).first()
    if existing_org:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if organization name already exists
    existing_name = db.query(Organization).filter(Organization.name == request.name).first()
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization name already taken"
        )
    
    # Hash password
    password_hash = hash_password(request.password)
    
    # Create new organization
    new_org = Organization(
        name=request.name,
        email=request.email,
        password_hash=password_hash
    )
    
    db.add(new_org)
    db.commit()
    db.refresh(new_org)
    
    return new_org


@router.post("/auth/login-org", response_model=OrgLoginResponse)
async def login_organization(
    request: OrgLoginRequest,
    db: Session = Depends(get_db)
):
    """
    Login to organization account
    
    Authenticates organization with email/password and returns JWT access token.
    Token is valid for 24 hours by default.
    """
    # Find organization by email
    org = db.query(Organization).filter(Organization.email == request.email).first()
    
    if not org:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(request.password, org.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create JWT token
    access_token = create_access_token(data={"sub": str(org.id)})
    
    return OrgLoginResponse(
        access_token=access_token,
        token_type="bearer",
        organization=org
    )


@router.get("/org/me", response_model=OrgProfile)
async def get_current_organization(
    current_org: Organization = Depends(get_current_org)
):
    """
    Get current authenticated organization profile
    
    Requires valid JWT token in Authorization header.
    Returns organization details including wallet address if connected.
    """
    return current_org


@router.patch("/org/me/wallet", response_model=OrgProfile)
async def update_wallet_address(
    request: WalletAddressUpdate,
    current_org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """
    Update organization's connected wallet address
    
    Called after successful MetaMask wallet connection.
    Stores the Ethereum address for on-chain transaction attribution.
    """
    # Validate wallet address format (basic check)
    if not request.wallet_address.startswith("0x") or len(request.wallet_address) != 42:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Ethereum wallet address format"
        )
    
    # Update wallet address
    current_org.wallet_address = request.wallet_address
    db.commit()
    db.refresh(current_org)
    
    return current_org
