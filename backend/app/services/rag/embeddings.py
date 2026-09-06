from google import genai
from app.config import settings
from google.genai import types
from app.models import Discovery, LlmCall
from app.enums import LlmCallKind
from sqlalchemy.orm import Session
from app.services.usage import check_limit
from app.auth import CurrentUser

client = genai.Client(api_key=settings.GEMINI_API_KEY)

def build_text(discovery: Discovery) -> str:
    """発見1件を、埋め込み用の1つのテキストにまとめる。

    title / category / tags / summary / raw_text をラベル付きで連結する。
    ラベルを付けるのは、埋め込みモデルに構造を認識させるため。
    重要度の高い項目を先頭に置いているのは、入力上限（約2048トークン）を
    超えた場合に後方から切り捨てられるため。
    """
    texts = f"""
        タイトル:{discovery.title}
        カテゴリ:{discovery.category}
        タグ:{discovery.tags}
        要約:{discovery.summary}
        原文:{discovery.raw_text}
        """
    return texts 


def embed(db: Session, texts: str, task_type: str, current_user: CurrentUser) -> list[float]:
    """テキストを1536次元のベクトルに変換する。

    task_type は用途に応じて呼び出し側が指定する。
      - 保存する発見側: "RETRIEVAL_DOCUMENT"
      - 質問する側："QUESTION_ANSWERING"
      「質問文なら QUESTION_ANSWERING、単語検索なら RETRIEVAL_QUERY」「質問と答えは意味的に似ていないため、専用の最適化がある」
    両者を取り違えると同じベクトル空間に乗らず、検索精度が落ちる。

    次元数を1536に固定しているのは、pgvector のインデックス上限が2000次元のため。
    既定の3072では将来インデックスを張れない。
    品質は3072と同等（MTEB同スコア）。

    呼び出しを llm_calls に記録する（kind="embed"）。
    commit はしない。呼び出し側のトランザクションに乗せるため、
    db.commit() を忘れると記録されず、日次上限の判定から漏れる。

    Args:
        db: 呼び出し側のセッション。記録のためだけに使う
        texts: 埋め込む文字列
        task_type: RETRIEVAL_DOCUMENT / QUESTION_ANSWERING など
        current_user: 上限判定と llm_calls への記録に使う

    Returns:
        1536個の浮動小数点数のリスト
    
    呼び出しの前に上限を確認する。
    上限に達している場合は API を呼ばずに例外を投げるため、課金が発生しない。
    許可リスト内は日次、試用側は累計と試用全体の日次の両方を見る。

    Raises:
        DailyLimitExceeded: 上限に達している場合（main.py で 429 に変換される）
    
    """
    check_limit(db, LlmCallKind.EMBED, current_user)
    result = client.models.embed_content(
        model = settings.EMBEDDING_MODEL,
        contents = texts,
        config = types.EmbedContentConfig(task_type = task_type, output_dimensionality=1536)
    )
    db.add(LlmCall(
        kind=LlmCallKind.EMBED,
        user_id=current_user.user_id,
        is_trial=current_user.is_trial,
    ))
    return result.embeddings[0].values 
