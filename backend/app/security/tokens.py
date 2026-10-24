from datetime import UTC, datetime, timedelta

import jwt


def create_access_token(user_id: int, secret_key: str, algorithm: str, lifetime: timedelta) -> str:
    claims = {"sub": str(user_id), "exp": datetime.now(UTC) + lifetime}
    return jwt.encode(claims, secret_key, algorithm=algorithm)
