import bcrypt

from app.limits import PASSWORD_MAX_BYTES


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    encoded_password = password.encode()
    if len(encoded_password) > PASSWORD_MAX_BYTES:
        return False
    return bcrypt.checkpw(encoded_password, password_hash.encode())
