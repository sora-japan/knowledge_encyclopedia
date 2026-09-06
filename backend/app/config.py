from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    GEMINI_API_KEY: str
    LLM_MODEL: str
    CORS_ORIGINS: str = "http://localhost:3000"
    EMBEDDING_MODEL: str
    VECTOR_THRESHOLD: float = 0.35
    SUPABASE_URL: str
    ALLOWED_EMAILS: str
    DAILY_REGISTER_LIMIT: int = 30
    DAILY_ASK_LIMIT: int = 10
    DAILY_EMBED_LIMIT: int = 80
    TRIAL_TOTAL_REGISTER: int = 10
    TRIAL_TOTAL_ASK: int = 10
    TRIAL_TOTAL_EMBED: int = 40
    TRIAL_DAILY_REGISTER: int = 30
    TRIAL_DAILY_ASK: int = 30
    TRIAL_DAILY_EMBED: int = 120
    model_config = SettingsConfigDict(env_file=".env")
    @property
    def allowed_email_set(self) -> set[str]:
        email_list = self.ALLOWED_EMAILS.split(',')
        result = set()
        for email in email_list:
            cleaned = email.strip().lower()
            if cleaned != "":
                result.add(cleaned)
        return result

settings = Settings()
