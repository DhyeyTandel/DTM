FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:0.9 /uv /usr/local/bin/uv

RUN useradd --system --create-home --uid 10001 dtm
WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY alembic.ini ./
COPY alembic ./alembic
COPY app ./app
COPY docker-entrypoint.sh ./
RUN chown -R dtm:dtm /app

USER dtm
ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8000
ENTRYPOINT ["./docker-entrypoint.sh"]
