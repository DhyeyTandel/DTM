from datetime import UTC, datetime, timedelta

import jwt

from app.domain.errors import NotAuthenticated

REQUIRED_CLAIMS = ["exp", "sub"]


def create_access_token(user_id: int, secret_key: str, algorithm: str, lifetime: timedelta) -> str:
    claims = {"sub": str(user_id), "exp": datetime.now(UTC) + lifetime}
    return jwt.encode(claims, secret_key, algorithm=algorithm)


def read_user_id(token: str, secret_key: str, algorithm: str) -> int:
    try:
        claims = jwt.decode(
            token, secret_key, algorithms=[algorithm], options={"require": REQUIRED_CLAIMS}
        )
        return int(claims["sub"])
    except (jwt.PyJWTError, ValueError) as error:
        raise NotAuthenticated from error
