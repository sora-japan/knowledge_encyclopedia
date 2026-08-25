from google import genai
from app.config import settings
from google.genai import types
from app.models import Discovery

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


def embed(texts: str, task_type: str) -> list[float]:
    ef embed(texts: str, task_type: str) -> list[float]:
    """テキストを1536次元のベクトルに変換する。

    task_type は用途に応じて呼び出し側が指定する。
      - 保存する発見側: "RETRIEVAL_DOCUMENT"
      - 検索クエリ側:   "RETRIEVAL_QUERY"
    両者を取り違えると同じベクトル空間に乗らず、検索精度が落ちる。

    次元数を1536に固定しているのは、pgvector のインデックス上限が2000次元のため。
    既定の3072では将来インデックスを張れない。
    品質は3072と同等（MTEB同スコア）。
    """
    result = client.models.embed_content(
        model = settings.EMBEDDING_MODEL,
        contents = texts,
        config = types.EmbedContentConfig(task_type = task_type, output_dimensionality=1536)
    )
    return result.embeddings[0].values 

# if __name__ == "__main__":
#     texts = f"""
#         タイトル:CORSの基礎知識
#         カテゴリ:プログラミング
#         タグ:["CORS","Web開発","セキュリティ","HTTP"]
#         要約:ブラウザのセキュリティ機能であるCORS（Cross-Origin Resource Sharing）について学習しました。異なるドメイン間でのリクエストを安全に制御するための仕組みです。
#         原文:CORSについて
#         """
#     task_type = 'RETRIEVAL_DOCUMENT'
#     result = embed(texts, task_type)
#     print(len(result))
