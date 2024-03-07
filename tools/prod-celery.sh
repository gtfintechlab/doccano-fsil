#!/usr/bin/env bash

set -o errexit
set -o nounset

cd /doccano/backend

(
  echo "Current directory: $(pwd)"
  ls
  python manage.py wait_for_db

  echo "Starting celery"
  "celery" --app=config worker --loglevel=info --pool=solo
)
