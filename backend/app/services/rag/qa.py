from app.schemas import AiResponse
from sqlalchemy.orm import Session
from google import genai
from app.schemas import AnsweredQuestion, DiscoveryResponse
from app.config import settings
from app.services.rag.search import search
from logging import getLogger
from app.models import LlmCall
from app.enums import LlmCallKind
from pydantic import ValidationError
from logging import getLogger
from google.genai._gaos.lib.compat_errors import APIError as InteractionsAPIError
# Interactions API の例外階層が公開されたか → 公開されていれば import を差し替え

client = genai.Client(api_key=settings.GEMINI_API_KEY)

logger = getLogger(__name__)

def answer_question(db: Session, question: str) -> AiResponse:
    """質問に対して、記録された発見だけを根拠に回答を生成する。

    ハルシネーション対策として、プロンプトでの指示に加えて2つの機構を持つ。

    1. 検索が0件なら LLM を呼ばずに返す
       一般知識で答える経路が物理的に存在しなくなる。コストもゼロ。

    2. LLM が返した source_ids を検索結果と突き合わせ、実在しないIDを除外する
       構造化出力はキーの存在を保証するが、中身の正しさは保証しない。
       LLM は存在しない出典を捏造することがある（研究では3〜13%）。
       検証後に0件になった場合は、根拠のない回答として answer ごと破棄する。

    プロンプトには raw_text（ユーザーの原文）を含める。
    summary は既に LLM が1回加工したもので、それを根拠に再度生成すると
    加工が二重になり誤りが増幅するため。
    
    source_ids の検証は Advanced RAG の post-retrieval に分類される
    citation / attribution（出典帰属）にあたる手法。
    引用を出させるだけでは不十分で、検証まで行うことで捏造引用を防ぐ。

        Args:
        db: 呼び出し側から渡すセッション
        question: ユーザーの質問文

    Returns:
        AiResponse。sources が空の場合、answer は定型文に差し替わる。
        定型文は3種類あり、状況によって使い分ける。
          - 検索が0件（記録がない）
          - 出典の検証に失敗（LLMが返したIDが実在しない）
          - 生成に失敗（LLMの出力が不正、またはAPI呼び出しの失敗）

        例外は投げない。LLM/API のエラーは内部で捕捉し、
        必ず AiResponse を返すため、呼び出し側で try/except は不要。
    """
    result = search(db, question)
    if not result:
        db.commit()
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
    try:
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
        db.add(LlmCall(kind=LlmCallKind.ASK))
        ai_answer = AnsweredQuestion.model_validate_json(interaction.output_text)
    except ValidationError as e:
        logger.warning("検証失敗、プロンプト調節を検討: %s", e)
        db.commit()
        return AiResponse(answer="回答の生成に失敗しました", sources=[])
    except InteractionsAPIError as e:
        logger.warning("LLM API呼び出しに失敗: %s", e)
        db.commit()
        return AiResponse(answer="回答の生成に失敗しました", sources=[])

        
    sources = []
    for source_id in ai_answer.source_ids:
        if source_id in index:
            sources.append(DiscoveryResponse.model_validate(index[source_id]))
    if not sources:
        logger.warning("出典の検証に失敗: LLMが返したID %s", ai_answer.source_ids)
        db.commit()
        return AiResponse(answer="根拠のある回答が得られませんでした", sources=[])
    db.commit()
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
