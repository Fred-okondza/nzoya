from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App
    APP_NAME: str
    DEBUG: bool

    # Base de données
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    # Resend
    RESEND_API_KEY: str
    FRONTEND_URL: str

    class Config:
        env_file = ".env"

settings = Settings()