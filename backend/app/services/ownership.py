from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException
import uuid
from app.models import Discovery

def get_owned_discovery(db: Session, discovery_id: uuid.UUID, user_id: uuid.UUID) -> Discovery:
    stmt = select(Discovery).where(Discovery.id == discovery_id, Discovery.user_id == user_id)
    discovery = db.execute(stmt).scalars().one_or_none()
    if discovery is None:
        raise HTTPException(status_code=404, detail="discovery not found")
    return discovery
