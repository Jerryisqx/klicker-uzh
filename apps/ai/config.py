from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "Klicker AI Question Generator"
    PDF_DIR: Path = Path("tmp")
    
    # Database settings
    DATABASE_URL: str = "postgresql://klicker:klicker@localhost:5432/klicker"
    
    # Default values
    DEFAULT_OWNER_ID: str = "76047345-3801-4628-ae7b-adbebcfe8821"
    
    class Config:
        env_file = ".env"