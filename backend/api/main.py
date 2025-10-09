from fastapi import FastAPI, HTTPException, Query
from typing import List, Optional

# Local imports
try:
    from backend.data.price_layer import fetch_recent_ohlcv
    from backend.services.signals import generate_basic_signals
    from backend.db.firestore_client import get_firestore
    from backend.data.fundamentals import fetch_basic_fundamentals
    from backend.services.mcdm import compute_entropy_topsis
    from backend.services.pattern_adapter import detect_patterns_from_ohlcv
    from backend.services.notifications import get_fcm, should_notify
    from backend.services.rl_agent import SimpleRLAagent, PositionAdvice
    from backend.services.xai import explain_signal
    from backend.services.macro_adapter import get_market_regime_summary
    from backend.services.sentiment import sentiment_tr
    from backend.services.cache import get_signals_cache
    from fastapi.responses import StreamingResponse
    import json
except Exception:  # pragma: no cover
    # Relative import fallback when running as a module/script
    from ..data.price_layer import fetch_recent_ohlcv
    from ..services.signals import generate_basic_signals
    from ..db.firestore_client import get_firestore
    from ..data.fundamentals import fetch_basic_fundamentals
    from ..services.mcdm import compute_entropy_topsis
    from ..services.pattern_adapter import detect_patterns_from_ohlcv
    from ..services.notifications import get_fcm, should_notify
    from ..services.rl_agent import SimpleRLAagent, PositionAdvice
    from ..services.xai import explain_signal
    from ..services.macro_adapter import get_market_regime_summary
    from ..services.sentiment import sentiment_tr
    from ..services.cache import get_signals_cache
    from fastapi.responses import StreamingResponse
    import json


app = FastAPI(title="BIST AI Smart Trader API", version="0.1.0")
@app.get("/explain")
def get_explain(
    symbol: str = Query(...),
    period: str = Query("6mo"),
    interval: str = Query("1d"),
) -> dict:
    try:
        # reuse pipeline pieces for single symbol
        df = fetch_recent_ohlcv(symbol=symbol, period=period, interval=interval)
        funda = fetch_basic_fundamentals([symbol])
        if not funda.empty:
            benefit = [1, 1, 0]
            topsis = compute_entropy_topsis(funda[["NetProfitMargin", "ROE", "DebtEquity"]], benefit)
            topsis_score = float(topsis.get(symbol)) if symbol in topsis.index else None
        else:
            topsis_score = None
        sig = generate_basic_signals(df)
        latest_tags = sig[-1]["tags"] if sig else []
        xai = explain_signal(latest_tags, topsis_score)
        return {"symbol": symbol, "explain": xai, "latest_tags": latest_tags, "topsis": topsis_score}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/signals/stream")
def stream_signals(
    symbols: List[str] = Query(...),
    period: str = Query("6mo"),
    interval: str = Query("1d"),
):
    def event_gen():
        # simple polling-based SSE every ~3s using cached /signals pipeline
        import time

        cache = get_signals_cache()
        cache_key = "|".join(sorted(symbols)) + f"|{period}|{interval}"
        while True:
            try:
                payload = cache.get(cache_key)
                if payload is None:
                    # compute once by delegating to function
                    data = get_signals(symbols=symbols, period=period, interval=interval)
                    payload = data
                yield f"data: {json.dumps(payload)}\n\n"
            except Exception:
                yield "data: {\"error\": \"stream-failed\"}\n\n"
            time.sleep(3)

    return StreamingResponse(event_gen(), media_type="text/event-stream")



@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/prices")
def get_prices(
    symbols: List[str] = Query(..., description="Comma-separated symbols, e.g. SISE.IS,EREGL.IS"),
    period: str = Query("3mo", description="yfinance period, e.g. 1mo,3mo,6mo,1y"),
    interval: str = Query("1d", description="yfinance interval, e.g. 1d,1h,5m"),
) -> dict:
    try:
        data = {}
        fs = get_firestore()
        for symbol in symbols:
            df = fetch_recent_ohlcv(symbol=symbol, period=period, interval=interval)
            records = (
                df.tail(200)
                .reset_index()
                .rename(columns={"Date": "timestamp"})
                .to_dict(orient="records")
            )
            data[symbol] = records
            try:
                fs.write_prices(symbol, records)
            except Exception:
                # no-op on storage failure in Sprint-0
                pass
        return {"prices": data}
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/signals")
def get_signals(
    symbols: List[str] = Query(..., description="Comma-separated symbols, e.g. SISE.IS,EREGL.IS"),
    period: str = Query("6mo"),
    interval: str = Query("1d"),
) -> dict:
    try:
        results = []
        fs = get_firestore()
        # Compute TOPSIS once for the symbol set
        funda = fetch_basic_fundamentals(symbols)
        if not funda.empty:
            # benefit flags: NetProfitMargin (1), ROE (1), DebtEquity (0)
            benefit = [1, 1, 0]
            topsis = compute_entropy_topsis(funda[["NetProfitMargin", "ROE", "DebtEquity"]], benefit)
        else:
            topsis = None

        cache = get_signals_cache()
        cache_key = "|".join(sorted(symbols)) + f"|{period}|{interval}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached
        fcm = get_fcm()
        rl = SimpleRLAagent()
        macro = get_market_regime_summary()
        for symbol in symbols:
            df = fetch_recent_ohlcv(symbol=symbol, period=period, interval=interval)
            sig = generate_basic_signals(df)
            topsis_score = float(topsis.get(symbol)) if topsis is not None and symbol in topsis.index else None
            # pattern tags
            try:
                patterns = detect_patterns_from_ohlcv(df.tail(250))
            except Exception:
                patterns = []
            latest_tags = sig[-1]["tags"] if sig else []
            advice = rl.advise(topsis=topsis_score, latest_tags=latest_tags)
            xai = explain_signal(latest_tags, topsis_score)
            # naive sentiment placeholder from symbol text
            sent = sentiment_tr(f"{symbol} {', '.join(latest_tags)}")
            results.append({
                "symbol": symbol,
                "topsis": topsis_score,
                "signals": sig,
                "patterns": patterns,
                "market_regime": macro,
                "sentiment": sent,
                "position_advice": {
                    "side": advice.side,
                    "size_pct": advice.size_pct,
                    "stop_loss_pct": advice.stop_loss_pct,
                    "take_profit_pct": advice.take_profit_pct,
                },
                "explain": xai,
            })
            try:
                # enrich signals with topsis before writing
                enriched = [dict(s, topsis=topsis_score) for s in sig]
                fs.write_signals(symbol, enriched)
            except Exception:
                pass
            # notifications (best-effort)
            try:
                if should_notify(latest_tags, topsis_score):
                    title = f"{symbol} sinyal"
                    body = ", ".join(latest_tags) + (f" | TOPSIS {topsis_score:.2f}" if topsis_score is not None else "")
                    fcm.send(title=title, body=body, topic="signals")
            except Exception:
                pass
        response = {"signals": results}
        cache.set(cache_key, response)
        return response
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(exc))


# Optional: uvicorn entrypoint
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.api.main:app", host="0.0.0.0", port=8080, reload=False)


