from app.schemas import AiResponse, AskRequest 
from fastapi import APIRouter, Depends
from app.db import get_db
from sqlalchemy.orm import Session
from app.services.rag.qa import answer_question
from app.services.usage import check_limit
from app.enums import LlmCallKind
from app.auth import get_current_user, CurrentUser

router = APIRouter(
    prefix = "/api/ask",
    tags = ["ask"]
)

@router.post("", response_model=AiResponse, status_code=200)
def ai_answer(payload: AskRequest, db: Session = Depends(get_db), current_user: CurrentUser = Depends(get_current_user)):
    check_limit(db, LlmCallKind.ASK, current_user)
    return answer_question(db, payload.question, current_user)
