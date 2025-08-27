#! /usr/bin/env bash

set -e
set -x

cd backend
uv run python manage.py generate_swagger openapi.json
cd ..
mv backend/openapi.json frontend/
cd frontend
pnpm run openapi-ts
# npx eslint --format ./src/client
