#!/usr/bin/env python3
"""
Quick API Server - Basit Flask backend
"""

from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/')
def root():
    return jsonify({
        "message": "BIST AI Smart Trader API v2.0",
        "status": "active",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0"
    })

@app.route('/api/test')
def test():
    return jsonify({"message": "API çalışıyor!", "timestamp": datetime.now().isoformat()})

@app.route('/api/real/trading_signals')
def trading_signals():
    return jsonify({
        "timestamp": datetime.now().isoformat(),
        "signals": [
            {
                "symbol": "THYAO",
                "action": "BUY",
                "confidence": 0.87,
                "price": 245.50,
                "target": 260.0,
                "stop_loss": 235.0,
                "reason": "EMA Cross + RSI Oversold"
            },
            {
                "symbol": "ASELS",
                "action": "SELL",
                "confidence": 0.74,
                "price": 48.20,
                "target": 42.0,
                "stop_loss": 52.0,
                "reason": "Resistance Break + Volume Spike"
            },
            {
                "symbol": "TUPRS",
                "action": "BUY",
                "confidence": 0.91,
                "price": 180.30,
                "target": 195.0,
                "stop_loss": 170.0,
                "reason": "Bullish Engulfing + MACD Cross"
            }
        ]
    })

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0"
    })

if __name__ == '__main__':
    print("🚀 Starting Quick API Server on http://localhost:8080")
    app.run(host='0.0.0.0', port=8080, debug=True)
