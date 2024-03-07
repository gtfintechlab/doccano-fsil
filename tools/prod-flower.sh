#!/usr/bin/env bash

set -o errexit
set -o nounset

cd /doccano/backend

(
  echo "Current directory: $(pwd)"
  ls
  python manage.py wait_for_db

  echo "Starting flower"
  if [[ -n "${FLOWER_BASIC_AUTH:-}" ]]; then
    celery --app=config flower --basic_auth="${FLOWER_BASIC_AUTH}"
  fi
)
