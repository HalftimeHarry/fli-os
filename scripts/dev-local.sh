#!/usr/bin/env bash
set -euo pipefail

PB_BIN="/tmp/pocketbase_0.27.1_linux_amd64/pocketbase"
PB_DATA_DIR="/tmp/fli-os-local/pb_data"
PB_HTTP_URL="http://127.0.0.1:8090"
APP_PORT="5173"

if [[ ! -x "$PB_BIN" ]]; then
  echo "PocketBase binary not found at $PB_BIN"
  echo "Download or install it there before using this script."
  exit 1
fi

mkdir -p "$PB_DATA_DIR"

if ! ss -lnt 2>/dev/null | grep -q ':8090 '; then
  echo "Starting local PocketBase on $PB_HTTP_URL"
  "$PB_BIN" --dir "$PB_DATA_DIR" serve --http=0.0.0.0:8090 > /tmp/fli-os-local/pb.log 2>&1 &
  PB_PID=$!
  trap 'kill "$PB_PID" 2>/dev/null || true' EXIT

  for _ in $(seq 1 60); do
    if curl -fsS "$PB_HTTP_URL/api/health" >/dev/null 2>&1; then
      break
    fi
    sleep 0.5
  done

  if ! curl -fsS "$PB_HTTP_URL/api/health" >/dev/null 2>&1; then
    echo "PocketBase did not become healthy on $PB_HTTP_URL"
    exit 1
  fi
else
  echo "PocketBase already running on $PB_HTTP_URL"
  PB_PID=""
fi

export PUBLIC_POCKETBASE_URL="$PB_HTTP_URL"

echo "Starting app dev server on http://127.0.0.1:$APP_PORT"
exec npm run dev -- --host 0.0.0.0 --port "$APP_PORT"
