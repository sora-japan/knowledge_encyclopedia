from app.models import Discovery
from sqlalchemy.orm import Session
from app.services.rag.embeddings import embed
from sqlalchemy import select

def search(db: Session, query: str, limit: int = 5) -> list[Discovery]:
    query_embed = embed(query, "QUESTION_ANSWERING")
    stmt = select(Discovery).where(Discovery.embedding.isnot(None))
    stmt = stmt.order_by(Discovery.embedding.cosine_distance(query_embed)).limit(limit)
    #　意味の近さで検索している, 質問ベクトルとの距離が近い順にDBの行を並べる
    search_query_and_discovery = db.execute(stmt).scalars().all()
    return search_query_and_discovery

if __name__ == "__main__":
    from app.db import SessionLocal

    db = SessionLocal()
    try:
        results = search(db, "Pythonについて何を学んだか教えて")
        for d in results:
            print(d.title, "|", d.category)
    finally:
        db.close()


