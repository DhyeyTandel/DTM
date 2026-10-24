from datetime import UTC, datetime, timedelta

import jwt

from app.domain.errors import NotAuthenticated

SUBJECT_CLAIM = "sub"
EXPIRY_CLAIM = "exp"
REQUIRED_CLAIMS = [EXPIRY_CLAIM, SUBJECT_CLAIM]


def create_access_token(user_id: int, secret_key: str, algorithm: str, lifetime: timedelta) -> str:
    claims = {SUBJECT_CLAIM: str(user_id), EXPIRY_CLAIM: datetime.now(UTC) + lifetime}
    return jwt.encode(claims, secret_key, algorithm=algorithm)


def read_user_id(token: str, secret_key: str, algorithm: str) -> int:
    try:
        claims = jwt.decode(
            token, secret_key, algorithms=[algorithm], options={"require": REQUIRED_CLAIMS}
        )
        return int(claims[SUBJECT_CLAIM])
    except (jwt.PyJWTError, ValueError) as error:
        raise NotAuthenticated from error
