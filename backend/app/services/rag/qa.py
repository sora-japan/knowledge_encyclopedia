from app.schemas import AiResponse
from sqlalchemy.orm import Session
from google import genai
from app.schemas import AnsweredQuestion, DiscoveryResponse
from app.config import settings
from app.services.rag.search import search
from logging import getLogger

client = genai.Client(api_key=settings.GEMINI_API_KEY)

logger = getLogger(__name__)

def answer_question(db: Session, question: str) -> AiResponse:
    result = search(db, question)
    if not result:
        return AiResponse(answer="該当する知識が見つかりませんでした", sources=[])
    # prompt組み立て
    # 内包表記で書くと、index = {d.id: d for d, _ in result}
    index = {}
    prompt = ""
    for discovery, _ in result:
        index[discovery.id] = discovery # キーと値
        prompt += f"""
            ---
            ID : {discovery.id}
            タイトル : {discovery.title}
            カテゴリー : {discovery.category}
            タグ : {discovery.tags}
            要約 : {discovery.summary}
            原文 : {discovery.raw_text}
            ---
            """

    interaction = client.interactions.create(
        model=settings.LLM_MODEL,
        input=f"""ユーザーからの質問 : 「{question}」
            使用した記録のIDをsource_idsに入れてください。
            下記の記録だけを根拠に質問に答えてください\n""" + prompt,
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": AnsweredQuestion.model_json_schema()
            },
        )
    ai_answer = AnsweredQuestion.model_validate_json(interaction.output_text)
    sources = []
    for source_id in ai_answer.source_ids:
        if source_id in index:
            sources.append(DiscoveryResponse.model_validate(index[source_id]))
    if not sources:
        logger.warning("出典の検証に失敗: LLMが返したID %s", ai_answer.source_ids)
        return AiResponse(answer="根拠のある回答が得られませんでした", sources=[])
    return AiResponse(answer=ai_answer.answer, sources=sources)

if __name__ == "__main__":
    from app.db import SessionLocal

    db = SessionLocal()
    try:
        res = answer_question(db, "料理について何を学んだか教えて")
        print(res.answer)
        for s in res.sources:
            print(s.title)
    finally:
        db.close()
