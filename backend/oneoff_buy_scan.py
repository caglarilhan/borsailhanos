#!/usr/bin/env python3
import sys
import json
import traceback
from datetime import datetime

# Ensure backend modules are importable when run from repo root
if '/Users/caglarilhan/borsailhanos/backend' not in sys.path:
    sys.path.append('/Users/caglarilhan/borsailhanos/backend')

try:
    from bist100_scanner import BIST100Scanner
except Exception:
    traceback.print_exc()
    print(json.dumps({"error": "Failed to import BIST100Scanner"}, ensure_ascii=False))
    sys.exit(1)

scanner = BIST100Scanner()
results = []

for symbol in scanner.bist100_symbols:
    try:
        signals = scanner.robot.generate_enhanced_signals(symbol) or []
        for sig in signals:
            action = getattr(sig.action, 'value', str(sig.action))
            if action in ("STRONG_BUY", "BUY", "WEAK_BUY"):
                results.append({
                    "symbol": symbol,
                    "action": action,
                    "entry": float(getattr(sig, 'entry_price', 0) or 0.0),
                    "take_profit": float(getattr(sig, 'take_profit', 0) or 0.0),
                    "stop_loss": float(getattr(sig, 'stop_loss', 0) or 0.0),
                    "risk_reward": float(getattr(sig, 'risk_reward', 0) or 0.0),
                    "confidence": float(getattr(sig, 'confidence', 0) or 0.0),
                    "timeframe": getattr(getattr(sig, 'timeframe', None), 'value', str(getattr(sig, 'timeframe', ''))),
                    "generated_at": datetime.utcnow().isoformat() + 'Z'
                })
    except Exception:
        traceback.print_exc()
        continue

print(json.dumps({
    "generated_at": datetime.utcnow().isoformat() + 'Z',
    "total": len(results),
    "picks": results
}, ensure_ascii=False))
