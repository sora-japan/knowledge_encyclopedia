from app.schemas import AiResponse, AskRequest 
from fastapi import APIRouter, Depends, HTTPException
from app.db import get_db
from sqlalchemy.orm import Session
from app.services.rag.qa import answer_question
from app.services.usage import count_today
from app.enums import LlmCallKind
from app.config import settings

router = APIRouter(
    prefix = "/api/ask",
    tags = ["ask"]
)

@router.post("", response_model=AiResponse, status_code=200)
def ai_answer(payload: AskRequest, db: Session = Depends(get_db)):
    count = count_today(db, LlmCallKind.ASK)
    if count >= settings.DAILY_ASK_LIMIT:
        raise HTTPException(status_code=429, detail="1日の使用上限に達しました")
    return answer_question(db, payload.question)
