#!/bin/bash

echo "🚀 Starting BIST AI Smart Trader - Full Stack"
echo "================================================"

# Get absolute path
PROJECT_DIR=$(pwd)
cd "$PROJECT_DIR"

# Start WebSocket backend
echo "📡 Starting WebSocket server on port 8081..."
cd "$PROJECT_DIR/backend/api" && python -m uvicorn websocket_server:app --host 0.0.0.0 --port 8081 --reload &
WS_PID=$!
echo "✅ WebSocket server started (PID: $WS_PID)"

# Give WebSocket time to start
sleep 2

# Don't start FastAPI main (optional)
# echo "🔧 Skipping FastAPI main (optional)..."

# Wait a bit for servers to start
sleep 3

# Start Next.js frontend
echo "🎨 Starting Next.js frontend on port 3000..."
cd web-app && npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "✅ All services started!"
echo "================================================"
echo "📊 WebSocket: http://localhost:8081/ws"
echo "🔧 API: http://localhost:8080"
echo "🎨 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo "================================================"

# Wait for Ctrl+C
wait

