from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api import rumors, auth_org, org_facts

# Import models to ensure they're registered with SQLAlchemy
from app.models.rumor import Rumor
from app.models.organization import Organization
from app.models.fact_record import FactRecord

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI Health Crisis Agent for verifying medical rumors"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(rumors.router)
app.include_router(auth_org.router)
app.include_router(org_facts.router)


@app.get("/health")
async def health_check():
    """Health check endpoint to verify the API is running."""
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to Health Fact Guardian API",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "check_rumor": "POST /api/check_rumor",
            "list_rumors": "GET /api/rumors",
            "get_rumor": "GET /api/rumors/{id}",
            "register_org": "POST /api/auth/register-org",
            "login_org": "POST /api/auth/login-org",
            "get_org_profile": "GET /api/org/me",
            "publish_fact": "POST /api/org/facts",
            "browse_facts": "GET /api/public/facts",
            "get_fact_detail": "GET /api/public/facts/{fact_id}"
        }
    }
