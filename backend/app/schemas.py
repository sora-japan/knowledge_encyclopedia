from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import date, datetime
import uuid
from app.enums import Category

class DiscoveryCreate(BaseModel):
    raw_text: str = Field(min_length = 1, max_length = 1000)
    discovered_at: date | None = None

class DiscoveryUpdate(BaseModel):
    title: str = Field(min_length = 1, max_length = 30, description="タイトル")
    category: Category
    summary: str = Field(min_length = 1, max_length = 120, description="要約")
    tags: list[str] = Field(min_length = 0, max_length = 5) 
    discovered_at: date

class DiscoveryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    raw_text: str
    title: str
    category: Category
    summary: str
    tags: list[str]
    discovered_at: date
    created_at: datetime
    updated_at: datetime

class ExtractedDiscovery(BaseModel):
    title: str = Field(min_length = 1, max_length = 30)
    category: Category
    summary: str = Field(min_length = 1, max_length = 120)
    tags: list[str] = Field(min_length = 0, max_length = 5)
    @field_validator("title", "summary", "tags", mode="before")
    @classmethod
    def shorten_the_text(cls, value, info):
        if info.field_name == "title":
            return value[:30]
        if info.field_name == "summary":
            return value[:120]
        if info.field_name == "tags":
            return value[:5]
        return value


