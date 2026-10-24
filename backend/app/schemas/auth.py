from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from app.limits import PASSWORD_MAX_BYTES, PASSWORD_MIN_BYTES
from app.schemas.base import RequestSchema


class RegisterRequest(RequestSchema):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_must_fit_the_byte_limits(cls, password: str) -> str:
        if not PASSWORD_MIN_BYTES <= len(password.encode()) <= PASSWORD_MAX_BYTES:
            raise ValueError(f"Password must be {PASSWORD_MIN_BYTES} to {PASSWORD_MAX_BYTES} bytes")
        return password


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    role: str
