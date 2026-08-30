from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    GEMINI_API_KEY: str
    LLM_MODEL: str
    CORS_ORIGINS: str = "http://localhost:3000"
    EMBEDDING_MODEL: str
    VECTOR_THRESHOLD: float = 0.35
    DAILY_REGISTER_LIMIT: int = 30
    DAILY_ASK_LIMIT: int = 10
    DAILY_EMBED_LIMIT: int = 80

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
