#!/bin/bash
# =========================================================
# 💹 BIST AI SMART TRADER – FULL AUTONOMOUS SYSTEM v6.0
# =========================================================
# Author: Çağlar İlhan
# =========================================================

LOG_DIR="logs"
PORTS=(8080 8081 3000)

mkdir -p "$LOG_DIR"

echo "🔧 Port temizliği..."
for port in "${PORTS[@]}"; do
  pid=$(lsof -ti tcp:$port)
  if [ -n "$pid" ]; then
    kill -9 $pid 2>/dev/null
  fi
done
sleep 1

echo "✅ Portlar temiz"

if [ -d ".venv" ]; then
  source .venv/bin/activate
fi

echo "🚀 Servisler başlatılıyor..."

python3 production_backend_v52.py > "$LOG_DIR/backend.log" 2>&1 &
sleep 2

python3 production_websocket_v110.py > "$LOG_DIR/websocket.log" 2>&1 &
sleep 2

cd web-app && npm run dev > "../$LOG_DIR/frontend.log" 2>&1 &
cd ..
sleep 5

echo "═══════════════════════════════════════"
echo "✅ BIST AI SMART TRADER AKTIF!"
echo "═══════════════════════════════════════"
echo "Web:     http://localhost:3000"
echo "API:     http://localhost:8080/api/health"
echo "WS:      ws://localhost:8081/ws"
echo "═══════════════════════════════════════"
echo "Loglar: logs/*.log"
echo "Ctrl+C ile çıkabilirsin"

# Terminal monitoring
while true; do
  clear
  echo "╔════════════════════════════════════╗"
  echo "║ 💹 BIST AI SMART TRADER MONITOR  ║"
  echo "╚════════════════════════════════════╝"
  echo "🕒 $(date '+%d %b %Y %H:%M:%S')"
  echo ""
  for port in "${PORTS[@]}"; do
    if lsof -i :$port >/dev/null; then
      echo "✅ Port $port aktif"
    else
      echo "❌ Port $port kapalı"
    fi
  done
  echo ""
  echo "🪵 Loglar:"
  ls -lh logs/*.log 2>/dev/null | awk '{print "• "$9" ("$5")"}'
  echo ""
  echo "Ctrl+C → Çıkış"
  sleep 10
done

