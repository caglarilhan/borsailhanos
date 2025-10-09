from fastapi import FastAPI, HTTPException
from typing import List, Dict
import logging
from datetime import datetime

# Sistem importları (varsa yerel modüllerden içe aktar)
try:
    from backend.nobel_mathematical_system import NobelMathematicalSystem
except Exception:  # pragma: no cover
    from nobel_mathematical_system import NobelMathematicalSystem

try:
    from backend.ultimate_accuracy_booster import UltimateAccuracyBooster
except Exception:  # pragma: no cover
    from ultimate_accuracy_booster import UltimateAccuracyBooster

from backend.config_loader import load_config

cfg = load_config("config.yaml")
log_level = getattr(logging, str(cfg.get("logging", {}).get("level", "INFO")).upper(), logging.INFO)
logging.basicConfig(level=log_level)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Ultra-High Accuracy Trading Signal API",
    description="MVP API for generating ultra-high accuracy trading signals using advanced AI and mathematical models.",
    version="1.0.0"
)

# Sistemleri başlat
nobel_system = NobelMathematicalSystem()
booster_system = UltimateAccuracyBooster()
try:
    from backend.calendar_ingest import CalendarIngest
    from backend.event_impact_model import EventImpactModel
    from backend.pre_event_derisk import PreEventDeRisk
    from backend.sentiment_shock_detector import SentimentShockDetector
    from backend.regime_vol_model import RegimeVolModel
    from backend.news_ingestion import summarize_sentiment
except Exception:  # pragma: no cover
    from calendar_ingest import CalendarIngest
    from event_impact_model import EventImpactModel
    from pre_event_derisk import PreEventDeRisk
    from sentiment_shock_detector import SentimentShockDetector
    from regime_vol_model import RegimeVolModel
    from news_ingestion import summarize_sentiment

calendar_ingest = CalendarIngest()
event_model = EventImpactModel()
derisk = PreEventDeRisk()
shock = SentimentShockDetector()
regime_model = RegimeVolModel()


@app.get("/health", summary="API Sağlık Kontrolü")
async def health_check() -> Dict:
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.get("/signals", summary="Hisse Sinyalleri Üret")
async def get_signals(symbols: str) -> List[Dict]:
    """
    Örnek: /signals?symbols=SISE.IS,ASELS.IS
    """
    if not symbols:
        raise HTTPException(status_code=400, detail="symbols parametresi zorunludur")

    symbol_list = [s.strip().upper() for s in symbols.split(',') if s.strip()]
    if not symbol_list:
        raise HTTPException(status_code=400, detail="Geçerli sembol bulunamadı")

    all_signals: List[Dict] = []

    for symbol in symbol_list:
        try:
            nobel_signal_obj = nobel_system.analyze_stock(symbol)
            if nobel_signal_obj:
                all_signals.append({
                    "system": "NobelMathematical",
                    **nobel_signal_obj.to_dict()
                })

            booster_signal_obj = booster_system.boost_accuracy(symbol)
            if booster_signal_obj:
                all_signals.append({
                    "system": "UltimateAccuracyBooster",
                    **booster_signal_obj.to_dict()
                })
        except Exception as e:  # pragma: no cover
            logger.error(f"❌ {symbol} için sinyal üretilirken hata: {e}")
            all_signals.append({"symbol": symbol, "error": f"Sinyal üretilemedi: {str(e)}"})

    if not all_signals:
        raise HTTPException(status_code=404, detail="Sinyal bulunamadı")

    return all_signals


@app.get("/upcoming_events", summary="Yaklaşan olaylar (takvim)")
async def upcoming_events(days: int = 7) -> List[Dict]:
    events = calendar_ingest.fetch_upcoming(days_ahead=days)
    return [e.to_dict() for e in events]


@app.get("/events_risk", summary="Olay temelli risk tahmini")
async def events_risk(days: int = 7) -> List[Dict]:
    events = calendar_ingest.fetch_upcoming(days_ahead=days)
    out: List[Dict] = []
    for ev in events:
        impact = event_model.estimate(ev.source, ev.importance, ev.when)
        item = {
            **ev.to_dict(),
            "impact": impact.to_dict(),
        }
        advice = derisk.advise(impact.risk_score, impact.half_life_days)
        item["advice"] = advice.to_dict()
        out.append(item)
    return out


@app.get("/risk", summary="Genel piyasa riski (proxy)")
async def risk(symbol: str = "XU100.IS") -> Dict:
    shock_res = shock.detect_shock(symbol)
    reg = regime_model.analyze(symbol)
    level = "HIGH" if shock_res.shock_score > 0.6 or reg.regime == "Risk-Off" else ("MEDIUM" if shock_res.shock_score > 0.3 else "LOW")
    return {
        "symbol": symbol,
        "level": level,
        "shock": shock_res.to_dict(),
        "regime": reg.to_dict(),
        "timestamp": datetime.now().isoformat(),
    }

@app.get("/market_regime", summary="Piyasa rejimi (proxy)")
async def market_regime(symbol: str = "XU100.IS") -> Dict:
    reg = regime_model.analyze(symbol)
    return reg.to_dict()


@app.get("/news", summary="Haber akışı ve basit sentiment özeti")
async def news(symbol: str, count: int = 10) -> Dict:
    return summarize_sentiment(symbol, count=count)

if __name__ == "__main__":  # pragma: no cover
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


