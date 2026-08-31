from fastapi import APIRouter, Depends, Query, HTTPException, Response
from app.schemas import DiscoveryCreate, DiscoveryResponse, DiscoveryUpdate 
from app.models import Discovery
from app.db import get_db
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import Annotated
import uuid
from app.services.llm import analyze_text_with_llm
from zoneinfo import ZoneInfo
from datetime import datetime
from app.config import settings
from app.services.rag.embeddings import build_text, embed
from app.services.usage import count_today
from app.enums import LlmCallKind

router = APIRouter(
    prefix = "/api/discoveries",
    tags = ["discoveries"]
)

# 何かを実行中であっても、他の処理を実行できる実行処理 async 非同期処理
# データを送信したい時、post
# ユーザーから２項目受け取り、８項目返す
@router.post("", response_model=DiscoveryResponse, status_code=201)
def create_discovery(payload: DiscoveryCreate,response: Response, db: Session = Depends(get_db)):
    """発見を1件登録する。

    raw_text を LLM に渡して title/category/summary/tags を生成し、
    さらに検索用のベクトルを生成して保存する。
    LLM 抽出に失敗した場合もフォールバック値で登録は成功する
    （原文を失わないことを優先する設計）。

    discovered_at が未指定なら日本時間の当日を入れる。
    日次上限のカウントは created_at（JST基準）で行い、
    LLM を呼ぶ前に判定してコスト流出を防ぐ。

    Returns:
        登録した発見。X-Daily-Remaining ヘッダーに本日の残り登録可能数を含む。

    Raises:
        HTTPException: 429 本日の登録上限に達している場合
    """
    dt = datetime.now(ZoneInfo("Asia/Tokyo"))
    count = count_today(db, LlmCallKind.EXTRACT)
    if count >= settings.DAILY_REGISTER_LIMIT:
        raise HTTPException(status_code=429, detail="1日の登録上限に達しました")
    if payload.discovered_at is None:
        discovered_at = dt.date()
    else:
        discovered_at = payload.discovered_at
    ai_result = analyze_text_with_llm(db, payload.raw_text)
    discovery = Discovery(
        raw_text=payload.raw_text, 
        title=ai_result.title, 
        category=ai_result.category,
        summary=ai_result.summary,
        tags=ai_result.tags,
        discovered_at=discovered_at, 
        source_urls=payload.source_urls,
    )
    text = build_text(discovery)
    discovery.embedding = embed(db, text, "RETRIEVAL_DOCUMENT")
    db.add(discovery)
    db.commit()
    db.refresh(discovery)
    response.headers["X-Daily-Remaining"] = str(settings.DAILY_REGISTER_LIMIT - (count + 1))
    return discovery

# get一覧
@router.get("", response_model=list[DiscoveryResponse])
def list_discovery(limit: Annotated[int, Query(ge=1, le=100)] = 50, offset: Annotated[int, Query(ge=0)] = 0, db: Session = Depends(get_db)):
    stmt = select(Discovery).order_by(Discovery.discovered_at.desc(), Discovery.created_at.desc()).limit(limit).offset(offset)
    db_list = db.execute(stmt).scalars().all()
    return db_list

# get詳細
@router.get("/{discovery_id}", response_model=DiscoveryResponse)
def detail_discovery(discovery_id: uuid.UUID, db: Session = Depends(get_db)):
    discovery = db.get(Discovery, discovery_id)
    if discovery is None:
        raise HTTPException(status_code=404, detail="discovery not found")
    return discovery

# db: Annotated[Session, Depends(get_db)]とdb: Session = Depends(get_db)は同じ意味になる。学習のため、2つを使用
@router.put("/{discovery_id}", response_model=DiscoveryResponse)
def update_discovery(discovery_id: uuid.UUID, payload: DiscoveryUpdate, db: Annotated[Session, Depends(get_db)]):
    discovery = db.get(Discovery, discovery_id)
    if discovery is None:
        raise HTTPException(status_code=404, detail="discovery not found")
    discovery.title = payload.title
    discovery.category = payload.category
    discovery.summary = payload.summary
    discovery.tags = payload.tags
    discovery.discovered_at = payload.discovered_at
    text = build_text(discovery)
    discovery.embedding = embed(db, text, "RETRIEVAL_DOCUMENT")
    db.commit()
    db.refresh(discovery)
    return discovery

@router.delete("/{discovery_id}", status_code=204)
def delete_discovery(discovery_id: uuid.UUID, db: Annotated[Session, Depends(get_db)]):
    discovery = db.get(Discovery, discovery_id)
    if discovery is None:
        raise HTTPException(status_code=404, detail="discovery not found")
    db.delete(discovery)
    db.commit()
