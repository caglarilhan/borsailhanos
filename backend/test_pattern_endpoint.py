#!/usr/bin/env python3
"""
Pattern endpoint'lerini test et
"""

import requests
import json
import pandas as pd
import numpy as np
from datetime import datetime

def test_pattern_endpoints():
    """Pattern endpoint'lerini test et"""
    base_url = "http://localhost:8001"
    
    print("=== Pattern Endpoint Test ===")
    
    # 1. Health check
    try:
        resp = requests.get(f"{base_url}/health")
        print(f"✅ Health: {resp.status_code}")
    except Exception as e:
        print(f"❌ Health error: {e}")
        return
    
    # 2. Test SISE.IS pattern
    try:
        resp = requests.get(f"{base_url}/analysis/patterns/SISE.IS?timeframe=1d&limit=30")
        print(f"✅ SISE.IS Pattern: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print(f"   Patterns found: {data['total_patterns']}")
            if data['patterns']:
                for p in data['patterns']:
                    print(f"   - {p['pattern_name']}: {p['direction']} (conf: {p['confidence']:.2f})")
    except Exception as e:
        print(f"❌ SISE.IS Pattern error: {e}")
    
    # 3. Test BIST100 scan
    try:
        resp = requests.get(f"{base_url}/analysis/patterns/scan/bist100?max_symbols=5")
        print(f"✅ BIST100 Scan: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print(f"   Symbols scanned: {data['total_symbols_scanned']}")
            print(f"   Patterns found: {data['total_patterns_found']}")
    except Exception as e:
        print(f"❌ BIST100 Scan error: {e}")
    
    # 4. Test with mock data (if no patterns found)
    print("\n=== Mock Data Test ===")
    
    # Create mock OHLC data with pattern
    dates = pd.date_range('2024-01-01', periods=30, freq='D')
    np.random.seed(42)
    
    # Trend up + noise
    trend = np.linspace(100, 120, 30)
    noise = np.random.normal(0, 2, 30)
    prices = trend + noise
    
    # OHLC
    df = pd.DataFrame({
        'Date': dates,
        'Open': prices * 0.99,
        'High': prices * 1.02,
        'Low': prices * 0.98,
        'Close': prices,
        'Volume': np.random.randint(1000000, 5000000, 30)
    })
    
    # Add bullish engulfing pattern
    df.loc[df.index[-2], 'Open'] = 115.0
    df.loc[df.index[-2], 'High'] = 116.0
    df.loc[df.index[-2], 'Low'] = 114.0
    df.loc[df.index[-2], 'Close'] = 114.5  # Red candle
    
    df.loc[df.index[-1], 'Open'] = 114.0
    df.loc[df.index[-1], 'High'] = 117.0
    df.loc[df.index[-1], 'Low'] = 113.5
    df.loc[df.index[-1], 'Close'] = 116.5  # Green candle (engulfing)
    
    print(f"Mock data created:")
    print(f"  Last 2 candles:")
    print(f"    -2: O={df['Open'].iloc[-2]:.2f}, H={df['High'].iloc[-2]:.2f}, L={df['Low'].iloc[-2]:.2f}, C={df['Close'].iloc[-2]:.2f}")
    print(f"    -1: O={df['Open'].iloc[-1]:.2f}, H={df['High'].iloc[-1]:.2f}, L={df['Low'].iloc[-1]:.2f}, C={df['Close'].iloc[-1]:.2f}")
    
    # Test pattern detection directly
    try:
        from analysis.pattern_detection import TechnicalPatternEngine
        
        engine = TechnicalPatternEngine()
        patterns = engine.scan_all_patterns(df, 'TEST.IS')
        
        print(f"\nDirect pattern detection:")
        print(f"  Patterns found: {len(patterns)}")
        for p in patterns:
            print(f"  - {p.pattern_name}: {p.direction} (conf: {p.confidence:.2f})")
            print(f"    Entry: {p.entry_price:.2f}, SL: {p.stop_loss:.2f}, TP: {p.take_profit:.2f}")
            print(f"    R/R: {p.risk_reward:.2f}")
            
    except Exception as e:
        print(f"❌ Direct pattern detection error: {e}")

if __name__ == "__main__":
    test_pattern_endpoints()

