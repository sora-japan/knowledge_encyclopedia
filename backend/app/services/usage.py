from app.enums import LlmCallKind
from sqlalchemy.orm import Session
from app.models import LlmCall
from datetime import datetime
from sqlalchemy import select, func
from zoneinfo import ZoneInfo
from app.auth import CurrentUser
from app.config import settings
import uuid

class DailyLimitExceeded(Exception):
    pass

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

# ユーザーごとの日次
def count_today_by_user(db: Session, kind: LlmCallKind, user_id: uuid.UUID) -> int:
    dt = datetime.now(ZoneInfo("Asia/Tokyo"))
    today_zerotime = dt.replace(hour=0, minute=0, second=0, microsecond=0)
    stmt = select(func.count()).select_from(LlmCall).where(
        LlmCall.user_id == user_id,
        LlmCall.created_at >= today_zerotime,
        LlmCall.kind == kind,
    )
    today_count = db.execute(stmt).scalar()
    return today_count

# ユーザーごとの累計を数える？超えているか測る？今回は数えるでやってみました
def count_total_by_user(db: Session, kind: LlmCallKind, user_id: uuid.UUID) -> int:
    stmt = select(func.count()).select_from(LlmCall).where(
        LlmCall.user_id == user_id,
        LlmCall.kind == kind,
    )
    total_count = db.execute(stmt).scalar()
    return total_count

def count_today_by_trial(db: Session, kind: LlmCallKind) -> int:
    dt = datetime.now(ZoneInfo("Asia/Tokyo"))
    today_zerotime = dt.replace(hour=0, minute=0, second=0, microsecond=0)
    stmt = select(func.count()).select_from(LlmCall).where(
        LlmCall.created_at >= today_zerotime,
        LlmCall.kind == kind,
        LlmCall.is_trial == True
    )
    today_count = db.execute(stmt).scalar()
    return today_count


DAILY_LIMITS = {
    LlmCallKind.EXTRACT: settings.DAILY_REGISTER_LIMIT,
    LlmCallKind.ASK: settings.DAILY_ASK_LIMIT,
    LlmCallKind.EMBED: settings.DAILY_EMBED_LIMIT,
}

TRIAL_DAILY_LIMITS = {
    LlmCallKind.EXTRACT: settings.TRIAL_DAILY_REGISTER,
    LlmCallKind.ASK: settings.TRIAL_DAILY_ASK,
    LlmCallKind.EMBED: settings.TRIAL_DAILY_EMBED,
}

TRIAL_TOTAL_LIMITS = {
    LlmCallKind.EXTRACT: settings.TRIAL_TOTAL_REGISTER,
    LlmCallKind.ASK: settings.TRIAL_TOTAL_ASK,
    LlmCallKind.EMBED: settings.TRIAL_TOTAL_EMBED,
}


def check_limit(db: Session, kind: LlmCallKind, current_user: CurrentUser) -> None:
    if current_user.is_allowed:
        count = count_today_by_user(db, kind, current_user.user_id)
        if count >= DAILY_LIMITS[kind]:
            raise DailyLimitExceeded()
    else:
        total = count_total_by_user(db, kind, current_user.user_id)
        if total >= TRIAL_TOTAL_LIMITS[kind]:
            raise DailyLimitExceeded()
        today = count_today_by_trial(db, kind)
        if today >= TRIAL_DAILY_LIMITS[kind]:
            raise DailyLimitExceeded()
