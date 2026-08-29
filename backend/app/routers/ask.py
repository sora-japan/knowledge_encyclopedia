from app.schemas import AiResponse, AskRequest 
from fastapi import APIRouter, Depends
from app.db import get_db
from sqlalchemy.orm import Session
from app.services.rag.qa import answer_question

router = APIRouter(
    prefix = "/api/ask",
    tags = ["ask"]
)

@router.post("", response_model=AiResponse, status_code=200)
def ai_answer(payload: AskRequest, db: Session = Depends(get_db)):
    return answer_question(db, payload.question)
