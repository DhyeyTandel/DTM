from pydantic import BaseModel, ConfigDict, EmailStr

from app.schemas.base import RequestSchema


class RegisterRequest(RequestSchema):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    role: str
