from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    DATABASE_URL: str = "sqlite+aiosqlite:///./health_fact_guardian.db"
    LLM_API_KEY: str = ""
    LLM_PROVIDER: str = "ollama"  # "ollama" or "openai"
    LLM_MODEL: str = "llama3.2:3b"  # For ollama, use model name; for openai, use gpt-3.5-turbo
    PUBMED_EMAIL: str = ""  # Optional: your email for NCBI
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    # Blockchain configuration
    SOMNIA_RPC_URL: str = "https://dream-rpc.somnia.network"
    SOMNIA_PRIVATE_KEY: str = ""
    WEB3_PROVIDER_URL: str = "https://dream-rpc.somnia.network"
    HEALTH_FACT_REGISTRY_ADDRESS: str = ""
    
    # JWT Authentication
    JWT_SECRET: str = "change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24
    
    PROJECT_NAME: str = "Health Fact Guardian"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings()
