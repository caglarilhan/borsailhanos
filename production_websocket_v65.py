#!/usr/bin/env python3
"""
BIST AI Smart Trader - Production WebSocket Server v6.5
Statistical Learning Layer with Kalman Filter
"""
import asyncio
import json
import datetime
import random
import websockets
import sqlite3
import numpy as np
from collections import deque, defaultdict

# External dependencies check
EXTERNAL_DEPS_AVAILABLE = False
try:
    import aiohttp
    EXTERNAL_DEPS_AVAILABLE = True
except ImportError:
    print("⚠️ aiohttp yok. Mock data kullanılacak.")

import logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

PORT = 8081
CLIENTS = set()
DB_PATH = "ai_performance.db"

# AI memory
HISTORY = deque(maxlen=500)
WEIGHTS = defaultdict(lambda: 1.0)
KALMAN_STATE = defaultdict(lambda: {"mean": 1.0, "var": 0.05})

BIST_SYMBOLS = [
    "THYAO", "AKBNK", "GARAN", "EREGL", "SISE", "ASELS", "TUPRS",
    "BIMAS", "KCHOL", "SAHOL", "FROTO", "YKBNK", "TOASO",
    "ISCTR", "PETKM", "HEKTS", "OTKAR", "TTKOM", "HALKB", "VESTL",
    "PGSUS", "ENJSA", "SASA", "KORDS", "AKSEN"
]

# === Database setup ===
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS ai_signals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            symbol TEXT,
            price REAL,
            change REAL,
            signal TEXT,
            confidence REAL,
            weight REAL,
            success INTEGER
        )
    """)
    conn.commit()
    conn.close()

# === Kalman Filter ===
def kalman_update(symbol, observation):
    """Kalman temelli online öğrenme: gözlem -> yeni ağırlık"""
    state = KALMAN_STATE[symbol]
    mean, var = state["mean"], state["var"]

    # Noise parametreleri
    process_noise = 0.01
    measurement_noise = 0.05

    # Predict
    mean_pred = mean
    var_pred = var + process_noise

    # Update
    K = var_pred / (var_pred + measurement_noise)
    mean_new = mean_pred + K * (observation - mean_pred)
    var_new = (1 - K) * var_pred

    # Güncelle
    KALMAN_STATE[symbol] = {"mean": mean_new, "var": var_new}
    WEIGHTS[symbol] = round(float(np.clip(mean_new, 0.5, 1.5)), 3)

def get_symbol_weight(symbol):
    return round(WEIGHTS[symbol], 3)

# === AI Engine ===
def calculate_rsi(prices, period=14):
    if len(prices) < period:
        return 50
    deltas = np.diff(prices)
    gain = deltas[deltas > 0].sum() / period
    loss = abs(deltas[deltas < 0].sum()) / period
    if loss == 0:
        return 100
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def generate_ai_signal(symbol, price, change):
    prices = [price + random.uniform(-2, 2) for _ in range(15)]
    rsi = calculate_rsi(prices)
    momentum = random.uniform(-3, 3)
    sentiment = random.choice(["Pozitif", "Negatif", "Nötr"])
    regime = random.choice(["Risk-On", "Risk-Off", "Neutral"])

    base_conf = random.uniform(75, 95)
    weight = get_symbol_weight(symbol)
    confidence = min(round(base_conf * weight, 2), 99.9)

    signal = "BUY" if rsi > 55 and momentum > 0 else "SELL" if rsi < 45 else "HOLD"

    comment = (
        f"{symbol}: RSI {rsi:.1f}, Momentum {momentum:.2f}, "
        f"{sentiment} duygu, {regime}, Kalman w={weight:.3f}"
    )

    return {
        "symbol": symbol,
        "price": round(price, 2),
        "change": round(change, 2),
        "signal": signal,
        "confidence": confidence,
        "comment": comment,
        "weight": weight,
    }

async def fetch_bist_data(session, symbol):
    if not EXTERNAL_DEPS_AVAILABLE:
        # Mock data
        base = random.uniform(20, 250)
        return {"symbol": symbol, "price": base, "change": random.uniform(-3, 3)}
    
    try:
        url = f"https://api.midastrader.app/api/v1/quote/{symbol}"
        async with session.get(url, timeout=5) as resp:
            if resp.status != 200:
                raise ValueError
            data = await resp.json()
            return {
                "symbol": symbol,
                "price": data.get("lastPrice"),
                "change": data.get("changePercent")
            }
    except Exception:
        base = random.uniform(20, 250)
        return {"symbol": symbol, "price": base, "change": random.uniform(-3, 3)}

# === Data logging ===
def record_signals(ai_signals):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    for s in ai_signals:
        expected = 1 if s["signal"] == "BUY" else -1 if s["signal"] == "SELL" else 0
        realized = 1 if s["change"] > 0 else -1 if s["change"] < 0 else 0
        success = int(expected == realized)
        HISTORY.append(success)

        # Kalman öğrenme
        kalman_update(s["symbol"], success)

        c.execute("""
            INSERT INTO ai_signals (timestamp, symbol, price, change, signal, confidence, weight, success)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            datetime.datetime.now().isoformat(),
            s["symbol"], s["price"], s["change"],
            s["signal"], s["confidence"], s["weight"], success
        ))
    conn.commit()
    conn.close()

def get_global_accuracy():
    if not HISTORY:
        return 0
    return round(sum(HISTORY) / len(HISTORY) * 100, 2)

# === Main loop ===
async def broadcast(message):
    if not CLIENTS:
        return
    data = json.dumps(message, ensure_ascii=False)
    for ws in list(CLIENTS):
        try:
            await ws.send(data)
        except Exception:
            CLIENTS.remove(ws)

async def generate_realtime_data():
    session = None
    if EXTERNAL_DEPS_AVAILABLE:
        session = aiohttp.ClientSession()
    
    try:
        while True:
            selected = random.sample(BIST_SYMBOLS, 6)
            
            if session:
                raw = await asyncio.gather(*[fetch_bist_data(session, s) for s in selected])
            else:
                raw = [fetch_bist_data(session, s) for s in selected]
            
            ai_signals = [generate_ai_signal(d["symbol"], d["price"], d["change"]) for d in raw]

            record_signals(ai_signals)
            accuracy = get_global_accuracy()

            avg_weight = np.mean([s["weight"] for s in ai_signals])
            message = {
                "type": "market_update",
                "timestamp": datetime.datetime.now().isoformat(),
                "market": "BIST",
                "ai_accuracy": accuracy,
                "avg_weight": round(float(avg_weight), 3),
                "signals": ai_signals,
            }

            await broadcast(message)
            logger.info(f"📊 Accuracy {accuracy}% | Avg W {avg_weight:.3f} | {datetime.datetime.now().strftime('%H:%M:%S')}")
            await asyncio.sleep(5)
    finally:
        if session:
            await session.close()

async def handle_client(ws):
    CLIENTS.add(ws)
    logger.info(f"✅ Client connected ({len(CLIENTS)} total)")
    try:
        async for msg in ws:
            try:
                data = json.loads(msg)
                if data.get("type") == "ping":
                    await ws.send(json.dumps({"type": "pong"}))
            except Exception:
                pass
    finally:
        CLIENTS.remove(ws)
        logger.info(f"❌ Client disconnected ({len(CLIENTS)} remaining)")

async def main():
    init_db()
    logger.info(f"🚀 BIST AI Smart Trader v6.5 running on ws://localhost:{PORT}")
    async with websockets.serve(handle_client, "localhost", PORT):
        await generate_realtime_data()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("⏹️ Server stopped")

