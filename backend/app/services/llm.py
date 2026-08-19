from dotenv import load_dotenv
from google import genai
import os
from app.schemas import ExtractedDiscovery

load_dotenv()

LLM_MODEL = os.getenv('LLM_MODEL')

client = genai.Client()

def analyze_text_with_llm(raw_text: str) -> ExtractedDiscovery:
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
    interaction = client.interactions.create(
        model=LLM_MODEL,
        input=prompt,
        # stream=True,
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": ExtractedDiscovery.model_json_schema()
        },
    )
    return ExtractedDiscovery.model_validate_json(interaction.output_text)
