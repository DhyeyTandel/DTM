#!/bin/sh
set -e

alembic upgrade head
python -m app.seed

exec gunicorn "app.main:create_production_app()" \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
