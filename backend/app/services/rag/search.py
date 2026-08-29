from app.models import Discovery
from sqlalchemy.orm import Session
from app.services.rag.embeddings import embed
from sqlalchemy import select
from app.config import settings

VECTOR_THRESHOLD = settings.VECTOR_THRESHOLD

def search(db: Session, query: str, limit: int = 30) -> list[tuple[Discovery, float]]:
    """質問文に意味が近い発見を、コサイン距離が小さい順に取得する。

    質問文を QUESTION_ANSWERING で埋め込み、保存済みのベクトルと比較する。
    距離計算は PostgreSQL の pgvector 側（<=> 演算子）で実行され、
    Python 側では行わない。

    VECTOR_THRESHOLD（既定0.35）以上の距離は除外する。
    該当が1件もない場合は空リストを返すため、呼び出し側は
    「記録にない質問」として扱える。

    距離も返すのは、閾値の再検証（設計書15章）と出典表示に使うため。
    回答生成では使わないので、呼び出し側で捨ててよい。

    Args:
        db: 呼び出し側から渡すセッション。この関数内では作らない
        query: ユーザーの質問文
        limit: 最大取得件数

    Returns:
        (発見, コサイン距離) のリスト。距離の昇順。該当なしなら空
    """
    query_embed = embed(db, query, "QUESTION_ANSWERING")
    distance = Discovery.embedding.cosine_distance(query_embed)
    stmt = select(Discovery, distance).where(Discovery.embedding.isnot(None), distance < VECTOR_THRESHOLD).order_by(distance).limit(limit)
    #　意味の近さで検索している, 質問ベクトルとの距離が近い順にDBの行を並べる
    search_query_and_discovery = db.execute(stmt).all()
    return search_query_and_discovery

if __name__ == "__main__":
    from app.db import SessionLocal

    db = SessionLocal()
    try:
        results = search(db, "カニについて何を学んだか教えて")
        for discovery, distance in results:
            print(discovery.title,"|", distance)
    finally:
        db.close()


