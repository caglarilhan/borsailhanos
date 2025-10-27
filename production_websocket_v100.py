#!/usr/bin/env python3
"""
BIST AI Smart Trader - Production WebSocket Server v10.0
AI Behavioral Reinforcement Engine
"""
import asyncio
import json
import datetime
import random
import sqlite3
import numpy as np
import logging
from collections import deque, defaultdict

# External dependencies check
EXTERNAL_DEPS_AVAILABLE = False
try:
    import aiohttp
    import websockets
    EXTERNAL_DEPS_AVAILABLE = True
except ImportError:
    print("⚠️ aiohttp veya websockets yok. Mock data kullanılacak.")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

PORT = 8081
CLIENTS = set()
DB_PATH = "ai_performance.db"

# === STATE MEMORY ===
HISTORY = deque(maxlen=1500)
BEHAVIOR_HISTORY = deque(maxlen=300)
WEIGHTS = defaultdict(lambda: 1.0)
CONFIDENCE_BIAS = defaultdict(lambda: 0.0)
KALMAN_STATE = defaultdict(lambda: {"mean": 1.0, "var": 0.05})
RISK_PROFILE = defaultdict(lambda: 0.33)
REGIME_STATE = {"market": "Neutral", "score": 0.0}
SENTIMENT_STATE = {"avg": 0.0, "trend": "Nötr"}

EXPLORATION_RATE = 0.15
LEARNING_RATE = 0.05
PENALTY_DECAY = 0.95

BIST_SYMBOLS = [
    "THYAO", "AKBNK", "GARAN", "EREGL", "SISE", "ASELS", "TUPRS",
    "BIMAS", "KCHOL", "SAHOL", "FROTO", "YKBNK", "TOASO",
    "ISCTR", "PETKM", "HEKTS", "OTKAR", "TTKOM", "HALKB", "VESTL",
    "PGSUS", "ENJSA", "SASA", "KORDS", "AKSEN"
]

# === DATABASE ===
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
            bias REAL,
            weight REAL,
            risk_alloc REAL,
            regime TEXT,
            sentiment REAL,
            reward REAL,
            success INTEGER
        )
    """)
    conn.commit()
    conn.close()

# === KALMAN ===
def kalman_update(symbol, observation):
    state = KALMAN_STATE[symbol]
    mean, var = state["mean"], state["var"]
    process_noise = 0.01
    measurement_noise = 0.05
    mean_pred = mean
    var_pred = var + process_noise
    K = var_pred / (var_pred + measurement_noise)
    mean_new = mean_pred + K * (observation - mean_pred)
    var_new = (1 - K) * var_pred
    KALMAN_STATE[symbol] = {"mean": mean_new, "var": var_new}
    WEIGHTS[symbol] = round(float(np.clip(mean_new, 0.5, 1.5)), 3)

# === REGIME DETECTION ===
def detect_market_regime(changes):
    avg_change = np.mean(changes)
    vol = np.std(changes)
    momentum = np.sum(np.sign(changes))
    score = avg_change * 10 + momentum * 0.5 - vol * 0.3
    REGIME_STATE["score"] = round(score, 2)
    if score > 3:
        REGIME_STATE["market"] = "Bull"
    elif score < -3:
        REGIME_STATE["market"] = "Bear"
    else:
        REGIME_STATE["market"] = "Sideways"
    return REGIME_STATE["market"]

# === SENTIMENT ===
async def fetch_sentiment():
    await asyncio.sleep(0.2)
    val = random.uniform(-1, 1)
    SENTIMENT_STATE["avg"] = round(val, 3)
    SENTIMENT_STATE["trend"] = (
        "Pozitif" if val > 0.2 else "Negatif" if val < -0.2 else "Nötr"
    )
    return val

# === BEHAVIORAL ENGINE ===
def behavior_update(symbol, success):
    prev_bias = CONFIDENCE_BIAS[symbol]
    reward = 1 if success else -1
    new_bias = prev_bias + LEARNING_RATE * reward
    new_bias *= PENALTY_DECAY
    CONFIDENCE_BIAS[symbol] = float(np.clip(new_bias, -0.3, 0.3))
    BEHAVIOR_HISTORY.append(reward)
    return reward

def adjust_confidence(raw_conf, bias):
    adjusted = raw_conf * (1 + bias)
    return min(max(adjusted, 50), 99.9)

# === RISK ENGINE ===
def calculate_risk_allocation(symbol, weight, confidence, regime, sentiment):
    base_risk = confidence / 100 * weight
    if regime == "Bear":
        base_risk *= 0.6
    elif regime == "Bull":
        base_risk *= 1.2
    if sentiment > 0.3:
        base_risk *= 1.1
    elif sentiment < -0.3:
        base_risk *= 0.8
    risk_score = np.clip(base_risk, 0.05, 0.45)
    RISK_PROFILE[symbol] = round(float(risk_score), 3)
    return RISK_PROFILE[symbol]

def normalize_portfolio():
    total = sum(RISK_PROFILE.values())
    if total == 0:
        return
    for sym in RISK_PROFILE:
        RISK_PROFILE[sym] = round(RISK_PROFILE[sym] / total, 3)

# === AI SIGNAL ===
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

def generate_ai_signal(symbol, price, change, regime, sentiment):
    prices = [price + random.uniform(-2, 2) for _ in range(15)]
    rsi = calculate_rsi(prices)
    momentum = random.uniform(-3, 3)
    explore = random.random() < EXPLORATION_RATE
    
    if explore:
        signal = random.choice(["BUY", "SELL", "HOLD"])
    else:
        signal = "BUY" if rsi > 55 and momentum > 0 else "SELL" if rsi < 45 else "HOLD"
    
    base_conf = random.uniform(75, 95)
    weight = WEIGHTS[symbol]
    raw_conf = min(round(base_conf * weight * (1 + sentiment * 0.2), 2), 99.9)
    adjusted_conf = adjust_confidence(raw_conf, CONFIDENCE_BIAS[symbol])
    risk_alloc = calculate_risk_allocation(symbol, weight, adjusted_conf, regime, sentiment)
    normalize_portfolio()
    
    comment = (
        f"{symbol}: RSI {rsi:.1f}, Mom {momentum:.2f}, Sent {sentiment:+.2f}, {regime}, "
        f"Bias {CONFIDENCE_BIAS[symbol]:+.2f}, Explore {explore}"
    )
    
    return {
        "symbol": symbol,
        "price": round(price, 2),
        "change": round(change, 2),
        "signal": signal,
        "confidence": adjusted_conf,
        "bias": CONFIDENCE_BIAS[symbol],
        "weight": weight,
        "risk_alloc": risk_alloc,
        "regime": regime,
        "sentiment": sentiment,
        "comment": comment,
    }

# === DATA FETCHER ===
async def fetch_bist_data(session, symbol):
    if not EXTERNAL_DEPS_AVAILABLE:
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

# === LOGGER ===
def record_signals(ai_signals):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    for s in ai_signals:
        expected = 1 if s["signal"] == "BUY" else -1 if s["signal"] == "SELL" else 0
        realized = 1 if s["change"] > 0 else -1 if s["change"] < 0 else 0
        success = int(expected == realized)
        reward = behavior_update(s["symbol"], success)
        HISTORY.append(success)
        kalman_update(s["symbol"], success)
        
        c.execute("""
            INSERT INTO ai_signals (timestamp, symbol, price, change, signal, confidence, bias, weight, risk_alloc, regime, sentiment, reward, success)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            datetime.datetime.now().isoformat(),
            s["symbol"], s["price"], s["change"], s["signal"],
            s["confidence"], s["bias"], s["weight"], s["risk_alloc"],
            s["regime"], s["sentiment"], reward, success
        ))
    conn.commit()
    conn.close()

def get_accuracy():
    if not HISTORY:
        return 0
    return round(sum(HISTORY) / len(HISTORY) * 100, 2)

# === BROADCAST ===
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
            selected = random.sample(BIST_SYMBOLS, 8)
            
            if session:
                raw = await asyncio.gather(*[fetch_bist_data(session, s) for s in selected])
            else:
                raw = [fetch_bist_data(session, s) for s in selected]
            
            changes = [d["change"] for d in raw if d["change"] is not None]
            regime = detect_market_regime(changes)
            sentiment = await fetch_sentiment()
            ai_signals = [generate_ai_signal(d["symbol"], d["price"], d["change"], regime, sentiment) for d in raw]
            
            record_signals(ai_signals)
            acc = round(sum(HISTORY)/len(HISTORY)*100, 2) if HISTORY else 0
            avg_bias = np.mean(list(CONFIDENCE_BIAS.values())) if CONFIDENCE_BIAS else 0
            
            message = {
                "type": "market_update",
                "timestamp": datetime.datetime.now().isoformat(),
                "market": "BIST",
                "regime": regime,
                "ai_accuracy": acc,
                "avg_bias": round(avg_bias, 3),
                "sentiment_trend": SENTIMENT_STATE["trend"],
                "portfolio": dict(RISK_PROFILE),
                "signals": ai_signals,
            }
            
            await broadcast(message)
            logger.info(f"🧠 {regime} | Bias {avg_bias:+.3f} | Acc {acc}% | Explore {EXPLORATION_RATE}")
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
    import websockets
    init_db()
    logger.info(f"🚀 BIST AI Smart Trader v10.0 running on ws://localhost:{PORT}")
    async with websockets.serve(handle_client, "localhost", PORT):
        await generate_realtime_data()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("⏹️ Server stopped")

