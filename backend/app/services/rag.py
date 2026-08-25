from google import genai
from app.config import settings
from google.genai import types
from app.models import Discovery

client = genai.Client(api_key=settings.GEMINI_API_KEY)

def build_text(discovery: Discovery) -> str:
    texts = f"""
        タイトル:{discovery.title}
        カテゴリ:{discovery.category}
        タグ:{discovery.tags}
        要約:{discovery.summary}
        原文:{discovery.raw_text}
        """
    return texts 


def embed(texts: str, task_type: str) -> list[float]:
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
