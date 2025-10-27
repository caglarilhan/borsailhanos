#!/usr/bin/env python3
"""
BIST AI Smart Trader v11.0 - Cognitive Reinforcement Engine
"""
import asyncio, json, datetime, random, sqlite3, numpy as np, logging
from collections import deque, defaultdict

# External deps
try:
    import aiohttp, websockets
    EXTERNAL_DEPS = True
except ImportError:
    print("⚠️ Dependencies missing, using mock")
    EXTERNAL_DEPS = False

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

PORT = 8081
CLIENTS = set()
DB_PATH = "ai_performance.db"

# Memory systems
HISTORY = deque(maxlen=2000)
REPLAY_MEMORY = deque(maxlen=500)
BEHAVIOR_HISTORY = deque(maxlen=300)
CONFIDENCE_BIAS = defaultdict(lambda: 0.0)
KALMAN_STATE = defaultdict(lambda: {"mean": 1.0, "var": 0.05})
WEIGHTS = defaultdict(lambda: 1.0)
RISK_PROFILE = defaultdict(lambda: 0.33)
REGIME_STATE = {"market": "Neutral", "score": 0.0}
SENTIMENT_STATE = {"avg": 0.0, "trend": "Nötr"}

EXPLORATION_RATE = 0.15
LEARNING_RATE = 0.05
PENALTY_DECAY = 0.95
REPLAY_INTERVAL = 60
REWARD_MEMORY_WEIGHT = 0.8

BIST_SYMBOLS = [
    "THYAO","AKBNK","GARAN","EREGL","SISE","ASELS","TUPRS","BIMAS","KCHOL","SAHOL",
    "FROTO","YKBNK","TOASO","ISCTR","PETKM","HEKTS","OTKAR","TTKOM","HALKB","VESTL",
    "PGSUS","ENJSA","SASA","KORDS","AKSEN"
]

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
    )""")
    conn.commit(); conn.close()

def calculate_rsi(prices, period=14):
    if len(prices) < period: return 50
    deltas = np.diff(prices)
    gain, loss = deltas[deltas>0].sum()/period, abs(deltas[deltas<0].sum())/period
    if loss == 0: return 100
    rs = gain/loss
    return 100 - (100/(1+rs))

def detect_market_regime(changes):
    avg, vol, mom = np.mean(changes), np.std(changes), np.sum(np.sign(changes))
    score = avg*10 + mom*0.5 - vol*0.3
    REGIME_STATE["score"] = round(score,2)
    REGIME_STATE["market"] = "Bull" if score>3 else "Bear" if score<-3 else "Sideways"
    return REGIME_STATE["market"]

async def fetch_sentiment():
    await asyncio.sleep(0.2)
    val = random.uniform(-1,1)
    SENTIMENT_STATE["avg"] = round(val,3)
    SENTIMENT_STATE["trend"] = "Pozitif" if val>0.2 else "Negatif" if val<-0.2 else "Nötr"
    return val

def kalman_update(symbol, observation):
    s = KALMAN_STATE[symbol]; mean,var = s["mean"],s["var"]
    mean_pred,var_pred = mean, var+0.01
    K = var_pred/(var_pred+0.05)
    mean_new = mean_pred+K*(observation-mean_pred)
    var_new = (1-K)*var_pred
    KALMAN_STATE[symbol]={"mean":mean_new,"var":var_new}
    WEIGHTS[symbol]=round(np.clip(mean_new,0.5,1.5),3)

def behavior_update(symbol, success):
    prev = CONFIDENCE_BIAS[symbol]
    reward = 1 if success else -1
    CONFIDENCE_BIAS[symbol] = np.clip((prev+LEARNING_RATE*reward)*PENALTY_DECAY,-0.3,0.3)
    BEHAVIOR_HISTORY.append(reward)
    REPLAY_MEMORY.append((symbol, reward))
    return reward

def adjust_confidence(raw, bias): return min(max(raw*(1+bias),50),99.9)

def replay_learning():
    if not REPLAY_MEMORY: return
    grouped = defaultdict(list)
    for sym, reward in REPLAY_MEMORY: grouped[sym].append(reward)
    for sym,rewards in grouped.items():
        avg_reward = np.mean(rewards)
        correction = LEARNING_RATE * avg_reward * REWARD_MEMORY_WEIGHT
        CONFIDENCE_BIAS[sym] = np.clip(CONFIDENCE_BIAS[sym]+correction,-0.3,0.3)

def calculate_risk(symbol, weight, conf, regime, sentiment):
    base = conf/100*weight
    if regime=="Bear": base*=0.6
    elif regime=="Bull": base*=1.2
    if sentiment>0.3: base*=1.1
    elif sentiment<-0.3: base*=0.8
    risk = np.clip(base,0.05,0.45)
    RISK_PROFILE[symbol]=round(float(risk),3)
    return RISK_PROFILE[symbol]

def normalize_portfolio():
    total=sum(RISK_PROFILE.values()) or 1
    for s in RISK_PROFILE: RISK_PROFILE[s]=round(RISK_PROFILE[s]/total,3)

def generate_signal(symbol, price, change, regime, sentiment):
    prices=[price+random.uniform(-2,2) for _ in range(15)]
    rsi=calculate_rsi(prices); mom=random.uniform(-3,3)
    explore=random.random()<EXPLORATION_RATE
    signal=random.choice(["BUY","SELL","HOLD"]) if explore else \
        ("BUY" if rsi>55 and mom>0 else "SELL" if rsi<45 else "HOLD")
    weight=WEIGHTS[symbol]
    raw_conf=min(round(random.uniform(75,95)*weight*(1+sentiment*0.2),2),99.9)
    conf=adjust_confidence(raw_conf,CONFIDENCE_BIAS[symbol])
    risk=calculate_risk(symbol,weight,conf,regime,sentiment)
    normalize_portfolio()
    return {"symbol":symbol,"price":round(price,2),"change":round(change,2),"signal":signal,
            "confidence":conf,"bias":CONFIDENCE_BIAS[symbol],"weight":weight,"risk":risk,
            "regime":regime,"sentiment":sentiment}

def record(ai_signals):
    conn=sqlite3.connect(DB_PATH); c=conn.cursor()
    for s in ai_signals:
        exp=1 if s["signal"]=="BUY" else -1 if s["signal"]=="SELL" else 0
        real=1 if s["change"]>0 else -1 if s["change"]<0 else 0
        success=int(exp==real); reward=behavior_update(s["symbol"],success)
        kalman_update(s["symbol"],success)
        HISTORY.append(success)
        c.execute("""INSERT INTO ai_signals VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                  (None,datetime.datetime.now().isoformat(),s["symbol"],s["price"],s["change"],s["signal"],
                   s["confidence"],s["bias"],s["weight"],s["risk"],s["regime"],s["sentiment"],reward,success))
    conn.commit(); conn.close()

async def fetch_bist_data(session,sym):
    base=random.uniform(20,250)
    return {"symbol":sym,"price":base,"change":random.uniform(-3,3)}

async def broadcast(msg):
    if not CLIENTS: return
    data=json.dumps(msg,ensure_ascii=False)
    for ws in list(CLIENTS):
        try: await ws.send(data)
        except: CLIENTS.remove(ws)

async def realtime_loop():
    session = None
    if EXTERNAL_DEPS:
        session = aiohttp.ClientSession()
    
    try:
        counter=0
        while True:
            counter+=1
            selected=random.sample(BIST_SYMBOLS,8)
            raw=await asyncio.gather(*[fetch_bist_data(session,s) for s in selected])
            regime=detect_market_regime([r["change"] for r in raw])
            sentiment=await fetch_sentiment()
            signals=[generate_signal(r["symbol"],r["price"],r["change"],regime,sentiment) for r in raw]
            record(signals)
            acc=round(sum(HISTORY)/len(HISTORY)*100,2) if HISTORY else 0
            bias_avg=np.mean(list(CONFIDENCE_BIAS.values())) if CONFIDENCE_BIAS else 0
            if counter%REPLAY_INTERVAL==0: replay_learning()
            msg={"type":"market_update","timestamp":datetime.datetime.now().isoformat(),
                 "market":"BIST","regime":regime,"ai_accuracy":acc,"bias_avg":round(bias_avg,3),
                 "sentiment":SENTIMENT_STATE,"portfolio":dict(RISK_PROFILE),"signals":signals}
            await broadcast(msg)
            logger.info(f"🧠 {regime} | Bias {bias_avg:+.3f} | Acc {acc}% | Memory {len(REPLAY_MEMORY)} | Explore {EXPLORATION_RATE}")
            await asyncio.sleep(5)
    finally:
        if session: await session.close()

async def handle_client(ws):
    CLIENTS.add(ws)
    logger.info(f"✅ Client connected ({len(CLIENTS)} total)")
    try:
        async for _ in ws: pass
    finally:
        CLIENTS.remove(ws)
        logger.info(f"❌ Client disconnected ({len(CLIENTS)} remaining)")

async def main():
    import websockets
    init_db()
    logger.info(f"🚀 BIST AI Smart Trader v11.0 running on ws://localhost:{PORT}")
    async with websockets.serve(handle_client,"localhost",PORT):
        await realtime_loop()

if __name__=="__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("⏹️ Server stopped")

