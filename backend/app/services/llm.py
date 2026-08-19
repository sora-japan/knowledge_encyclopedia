from dotenv import load_dotenv
from google import genai
import os
from app.schemas import ExtractedDiscovery, DiscoveryCreate

load_dotenv()

LLM_MODEL = os.getenv('LLM_MODEL')

client = genai.Client()

# raw_text = DiscoveryCreate.raw_text
# ユーザーが入力したものを受け取る方法を学習しないといけない

raw_text = "今日は肩甲骨を寄せる意識で投げたらグルーピングが良くなった"

prompt = f"""
    ユーザーの入力「{raw_text}」
    が本日ユーザーが身につけた知識です。
    この文章を元に、以下のルールを守りつつ、返答してください。
    ・summary は120文字以内
    ・title は30文字以内
    ・tags は0〜5個
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

recipe = ExtractedDiscovery.model_validate_json(interaction.output_text)
print(recipe)

# print(interaction.output_text)
# for event in stream:
#    print(event)
