#!/usr/bin/env bash
set -euo pipefail

# Activate venv if exists
if [ -d "../.venv" ]; then
  source ../.venv/bin/activate
elif [ -d "venv" ]; then
  source venv/bin/activate
fi

# Kill existing uvicorn on 8001
if lsof -i :8001 -t >/dev/null 2>&1; then
  kill -9 $(lsof -i :8001 -t)
fi

# Start
python -m uvicorn fastapi_main:app --host 0.0.0.0 --port 8001 --reload | cat
