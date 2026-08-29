from app.enums import LlmCallKind
from sqlalchemy.orm import Session
from app.models import LlmCall
from datetime import datetime
from sqlalchemy import select, func
from zoneinfo import ZoneInfo

def count_today(db: Session, kind: LlmCallKind) -> int:
    """今日（JST基準）その種別を何回呼んだかを返す。

    日付の境界は日本時間の0時。サーバーがUTCでも
    朝9時にリセットされることはない。

    Args:
        db: 呼び出し側のセッション
        kind: 数える種別

    Returns:
        今日の呼び出し回数
    """
    dt = datetime.now(ZoneInfo("Asia/Tokyo"))
    today_zerotime = dt.replace(hour=0, minute=0, second=0, microsecond=0)
    stmt = select(func.count()).select_from(LlmCall).where(
        LlmCall.created_at >= today_zerotime,
        LlmCall.kind == kind
    )
    today_count = db.execute(stmt).scalar()
    return today_count
