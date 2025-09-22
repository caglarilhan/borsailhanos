#!/bin/bash
# BIST AI Smart Trader v2.0 - Investor Demo Launcher

echo "🚀 BIST AI Smart Trader v2.0 - Investor Demo"
echo "============================================="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "⚡ Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements-v2.txt

# Start API server in background
echo "🌐 Starting API server..."
cd backend
python comprehensive_api.py &
API_PID=$!
cd ..

# Wait for API to start
sleep 5

# Start Streamlit dashboard
echo "📊 Starting investor dashboard..."
streamlit run backend/investor_dashboard.py --server.port 8501 &
DASHBOARD_PID=$!

echo ""
echo "✅ Demo başlatıldı!"
echo ""
echo "📊 Investor Dashboard: http://localhost:8501"
echo "🌐 API Documentation: http://localhost:8000/docs"
echo ""
echo "🔍 Available endpoints:"
echo "  - GET /api/v2/health"
echo "  - GET /api/v2/signals/{symbol}"
echo "  - GET /api/v2/ranking"
echo "  - GET /api/v2/portfolio/optimize"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "echo; echo '🛑 Stopping services...'; kill $API_PID $DASHBOARD_PID; exit" INT
wait
