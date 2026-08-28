from app.models import Discovery
from sqlalchemy.orm import Session
from app.services.rag.embeddings import embed
from sqlalchemy import select
from app.config import settings

VECTOR_THRESHOLD = settings.VECTOR_THRESHOLD

def search(db: Session, query: str, limit: int = 5) -> list[tuple[Discovery, float]]:
    query_embed = embed(query, "QUESTION_ANSWERING")
    distance = Discovery.embedding.cosine_distance(query_embed)
    stmt = select(Discovery, distance).where(Discovery.embedding.isnot(None), distance < VECTOR_THRESHOLD).order_by(distance).limit(limit)
    #　意味の近さで検索している, 質問ベクトルとの距離が近い順にDBの行を並べる
    search_query_and_discovery = db.execute(stmt).all()
    return search_query_and_discovery

if __name__ == "__main__":
    from app.db import SessionLocal

    db = SessionLocal()
    try:
        results = search(db, "Pythonについて教えて")
        for discovery, distance in results:
            print(discovery.title,"|", distance)
    finally:
        db.close()


