#!/bin/bash
# BIST AI Smart Trader v2.1 Enhanced - Ultimate Demo Launcher

echo "🚀 BIST AI Smart Trader v2.1 Enhanced - Ultimate Demo"
echo "====================================================="
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
echo "📥 Installing enhanced dependencies..."
pip install -q -r requirements-v2-enhanced.txt

# Start Enhanced API server in background
echo "🌐 Starting Enhanced API server with WebSocket..."
cd backend
python enhanced_api.py &
API_PID=$!
cd ..

# Wait for API to start
sleep 8

# Start Streamlit dashboard
echo "📊 Starting enhanced investor dashboard..."
streamlit run backend/investor_dashboard.py --server.port 8501 &
DASHBOARD_PID=$!

# Wait for dashboard to start
sleep 5

echo ""
echo "✅ Enhanced Demo başlatıldı!"
echo ""
echo "📊 Enhanced Investor Dashboard: http://localhost:8501"
echo "🌐 Enhanced API Documentation: http://localhost:8000/docs"
echo "🔌 WebSocket Endpoint: ws://localhost:8000/ws"
echo ""
echo "🔍 Enhanced API Endpoints:"
echo "  - GET /api/v2.1/health (Enhanced health check)"
echo "  - GET /api/v2.1/signals/{symbol} (Comprehensive signals)"
echo "  - GET /api/v2.1/risk/{symbol} (Advanced risk analysis)"
echo "  - GET /api/v2.1/multi-timeframe/{symbol} (Multi-timeframe analysis)"
echo "  - GET /api/v2.1/market-regime (Market regime detection)"
echo "  - POST /api/v2.1/backtest (Backtesting engine)"
echo "  - WebSocket /ws (Real-time updates)"
echo ""
echo "🎯 New Features:"
echo "  ✅ Market Regime Detection (HMM)"
echo "  ✅ Advanced Risk Management (VaR, CVaR, Sharpe, Sortino)"
echo "  ✅ Multi-Timeframe Analysis (6 timeframes)"
echo "  ✅ Backtesting Engine (MA, RSI strategies)"
echo "  ✅ Real-time Alerts System"
echo "  ✅ WebSocket Real-time Updates"
echo "  ✅ Enhanced Portfolio Optimization"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "echo; echo '🛑 Stopping enhanced services...'; kill $API_PID $DASHBOARD_PID; exit" INT
wait
