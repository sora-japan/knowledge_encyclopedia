import jwt
from jwt import PyJWKClient
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from fastapi import HTTPException, Cookie
from dataclasses import dataclass
import uuid
from app.config import settings
import logging

logger = logging.getLogger(__name__)

jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
jwks_client = PyJWKClient(jwks_url)

# 依存関数が返す型
@dataclass
class CurrentUser:
    user_id: uuid.UUID
    is_allowed: bool
    @property
    def is_trial(self) -> bool:
        return not self.is_allowed

# トークンを検証し、payloadを返す
def verify_token(token: str) -> dict:
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            key=signing_key.key,
            algorithms=["ES256"],
            audience="authenticated",
            issuer=f"{settings.SUPABASE_URL}/auth/v1",
        )
    except ExpiredSignatureError as e:
        logger.info(f"トークンの有効期限が切れています: {e}")
        raise HTTPException(status_code=401, detail="認証が必要です")
    except InvalidTokenError as e:# audience/issuer/署名不正が全部ここに入る
        logger.warning(f"トークン検証に失敗:  type={type(e).__name__}: {e}")
        raise HTTPException(status_code=401, detail="認証が必要です")
    except Exception as e:
        logger.error(f"想定外のエラーです: type={type(e).__name__}: {e}")
        raise HTTPException(status_code=401, detail="認証が必要です")
    return payload

def get_current_user(app_access_token: str | None = Cookie(default=None)) -> CurrentUser:
    if not app_access_token:
        raise HTTPException(status_code=401, detail="認証が必要です")
    payload = verify_token(app_access_token)
    sub = payload.get("sub")
    if sub is None:
        logger.warning("subがありません")
        raise HTTPException(status_code=401, detail="認証が必要です")
    try:
        user_id = uuid.UUID(sub)
    except ValueError as e:
        logger.warning(f"subの形が不正です: {e}")
        raise HTTPException(status_code=401, detail="認証が必要です")
    email = payload.get("email")
    if email is None:
        email = "no_email"
    email = email.lower()
    is_allowed = email in settings.allowed_email_set
    return CurrentUser(user_id=user_id, is_allowed=is_allowed)
