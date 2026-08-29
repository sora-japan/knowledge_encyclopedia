from app.config import settings
from google import genai
from app.schemas import ExtractedDiscovery
from pydantic import ValidationError
from app.enums import Category
from logging import getLogger
from sqlalchemy.orm import Session
from app.models import Discovery, LlmCall
from app.enums import LlmCallKind
from google.genai._gaos.lib.compat_errors import APIError as InteractionsAPIError
# Interactions API の例外階層が公開されたか → 公開されていれば import を差し替え

client = genai.Client(api_key=settings.GEMINI_API_KEY)

logger = getLogger(__name__)

def analyze_text_with_llm(db: Session, raw_text: str) -> ExtractedDiscovery:
    prompt = f"""
        ユーザーの入力「{raw_text}」
        が本日ユーザーが身につけた知識です。
        この文章を元に、以下のルールを守りつつ、返答してください。
        ・summary は120文字以内
        ・title は30文字以内
        ・tags は0〜5個、内容を特定できる語に限る
        ・カテゴリは下記の８分類から選択
        カテゴリ："プログラミング"、"データ・AI"、"インフラ・ツール"、"ビジネス"、"健康・生活"、"言語・人文"、"科学"、"その他"
        """
    for _ in range(2):
        try:
            interaction = client.interactions.create(
                model=settings.LLM_MODEL,
                input=prompt,
                response_format={
                    "type": "text",
                    "mime_type": "application/json",
                    "schema": ExtractedDiscovery.model_json_schema()
                },
            )
            db.add(LlmCall(kind=LlmCallKind.EXTRACT))
            return ExtractedDiscovery.model_validate_json(interaction.output_text)
        except ValidationError as e:
            logger.warning("検証失敗、プロンプト調節を検討: %s", e)
            prompt += f"\n前回の出力は次の理由で不正でした:{e}"
        except InteractionsAPIError as e:
            logger.warning("LLM API呼び出しに失敗: %s", e)
            break
    logger.warning("LLM抽出に失敗、フォールバックを使用: %s", raw_text[:50])
    return ExtractedDiscovery( # フォールバック
        title=raw_text[:30],
        category=Category.OTHER,
        summary=raw_text[:120],
        tags=[]
    )

# 開発用: プロンプト調整時に python -m app.services.llm で実行
if __name__ == "__main__":
    from app.db import SessionLocal

    db = SessionLocal()
    try:
        tests = [
            "pandasのmergeはDataFrame同士を結合するときに使う",
            "mergeわかった",
            "今日は肩甲骨を寄せる意識で投げたらグルーピングが良くなった",
        ]
        for t in tests:
            print(f"\n--- 入力: {t}")
            print(analyze_text_with_llm(db, t))
    finally:
        db.close()
