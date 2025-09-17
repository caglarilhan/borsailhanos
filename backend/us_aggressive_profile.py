"""
US Aggressive Trading Profile
=============================

Bu profil ABD piyasası için agresif scalping/day trading ayarlarını içerir.
"""

US_AGGRESSIVE_PROFILE = {
    "profile": "US_AGGRESSIVE",
    "symbols": [
        "SPY", "QQQ", "NVDA", "TSLA", "AMD", "META", "AMZN", "MSFT", "TQQQ", "SOXL"
    ],
    "timeframe": "1m",
    "entry": {
        "orb_minutes": 5,
        "ema_fast": 9,
        "ema_slow": 21,
        "macd_confirm": True,
        "need_vwap_above_for_longs": True
    },
    "risk": {
        "per_trade_risk_pct": 0.01,
        "daily_max_loss_pct": 0.03,
        "max_drawdown_pct": 0.10,
        "cooldown_after_losses": 2,
        "max_concurrent_positions": 1,
        "time_stop_minutes": 8
    },
    "bracket": {
        "stop_pct": 0.006,
        "take_pct": 0.012,
        "trailing_pct": 0.004
    },
    "filters": {
        "min_volume_1m": 300000,
        "max_spread_bps": 2
    },
    "session": {
        "trade_open_minutes": 90,
        "avoid_premarket": True
    }
}


