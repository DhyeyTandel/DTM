from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.dependencies import get_session

router = APIRouter()

DATABASE_UNAVAILABLE_MESSAGE = "Database unavailable"


@router.get("/health")
def get_health(
    session: Annotated[Session, Depends(get_session, scope="function")],
) -> dict[str, str]:
    try:
        session.execute(text("SELECT 1"))
    except OperationalError as error:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE, DATABASE_UNAVAILABLE_MESSAGE
        ) from error
    return {"status": "ok"}
