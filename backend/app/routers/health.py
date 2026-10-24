from fastapi import APIRouter, HTTPException, status
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from app.dependencies import SessionDependency

router = APIRouter()

DATABASE_UNAVAILABLE_MESSAGE = "Database unavailable"


@router.get("/health")
def get_health(session: SessionDependency) -> dict[str, str]:
    try:
        session.execute(text("SELECT 1"))
    except OperationalError as error:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE, DATABASE_UNAVAILABLE_MESSAGE
        ) from error
    return {"status": "ok"}
