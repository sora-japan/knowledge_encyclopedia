from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    GEMINI_API_KEY: str
    LLM_MODEL: str
    DAILY_LIMIT: int = 30

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
