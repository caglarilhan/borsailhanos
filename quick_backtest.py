#!/usr/bin/env python3
"""
Hızlı Backtest - BIST ve US sinyalleri için performans ölçümü
%80+ kazanma hedefi için mevcut durumu değerlendirme
"""

import json
import pandas as pd
import yfinance as yf
import numpy as np
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Tuple
import warnings
warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_signals():
    """Snapshot'tan sinyalleri yükle"""
    try:
        with open('data/forecast_signals.json', 'r') as f:
            raw = f.read()
        # JSON temizleme
        last_brace = raw.rfind('}')
        if last_brace != -1:
            raw_clean = raw[:last_brace+1]
        else:
            raw_clean = raw.strip().rstrip('%')
        snap = json.loads(raw_clean)
        return snap.get('signals', [])
    except Exception as e:
        logger.error(f"Sinyal yükleme hatası: {e}")
        return []

def get_historical_data(symbol: str, days: int = 90) -> pd.DataFrame:
    """Geçmiş veri çek"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        ticker = yf.Ticker(symbol)
        data = ticker.history(start=start_date, end=end_date)
        
        if data.empty:
            logger.warning(f"❌ {symbol} için veri bulunamadı")
            return pd.DataFrame()
        
        logger.info(f"✅ {symbol}: {len(data)} günlük veri yüklendi")
        return data
    except Exception as e:
        logger.error(f"❌ {symbol} veri hatası: {e}")
        return pd.DataFrame()

def simulate_signal_performance(signal: dict, historical_data: pd.DataFrame) -> dict:
    """Sinyal performansını simüle et"""
    try:
        symbol = signal['symbol']
        entry_price = signal['entry_price']
        stop_loss = signal.get('stop_loss', 0)
        take_profit = signal.get('take_profit', 0)
        action = signal['action']
        confidence = signal.get('confidence', 0)
        
        if historical_data.empty:
            return {
                'symbol': symbol,
                'action': action,
                'confidence': confidence,
                'result': 'NO_DATA',
                'pnl_pct': 0,
                'win': False
            }
        
        # Son 30 gün fiyat hareketi
        recent_data = historical_data.tail(30)
        if len(recent_data) < 5:
            return {
                'symbol': symbol,
                'action': action,
                'confidence': confidence,
                'result': 'INSUFFICIENT_DATA',
                'pnl_pct': 0,
                'win': False
            }
        
        # Basit simülasyon: son fiyatla entry karşılaştırması
        current_price = recent_data['Close'].iloc[-1]
        
        if action in ['BUY', 'STRONG_BUY']:
            # Long pozisyon
            pnl_pct = (current_price - entry_price) / entry_price
            
            # SL/TP kontrolü
            max_price = recent_data['High'].max()
            min_price = recent_data['Low'].min()
            
            hit_sl = stop_loss > 0 and min_price <= stop_loss
            hit_tp = take_profit > 0 and max_price >= take_profit
            
            if hit_sl:
                pnl_pct = (stop_loss - entry_price) / entry_price
                result = 'STOP_LOSS'
            elif hit_tp:
                pnl_pct = (take_profit - entry_price) / entry_price
                result = 'TAKE_PROFIT'
            else:
                result = 'OPEN'
            
        elif action in ['SELL', 'STRONG_SELL']:
            # Short pozisyon
            pnl_pct = (entry_price - current_price) / entry_price
            result = 'OPEN'
        else:
            # WEAK_BUY, WEAK_SELL, HOLD
            pnl_pct = (current_price - entry_price) / entry_price * 0.5  # Zayıf sinyal, yarı pozisyon
            result = 'WEAK'
        
        win = pnl_pct > 0
        
        return {
            'symbol': symbol,
            'action': action,
            'confidence': confidence,
            'result': result,
            'pnl_pct': pnl_pct,
            'win': win,
            'entry_price': entry_price,
            'current_price': current_price
        }
        
    except Exception as e:
        logger.error(f"❌ {signal['symbol']} simülasyon hatası: {e}")
        return {
            'symbol': signal['symbol'],
            'action': signal.get('action', ''),
            'confidence': signal.get('confidence', 0),
            'result': 'ERROR',
            'pnl_pct': 0,
            'win': False
        }

def run_backtest():
    """Ana backtest fonksiyonu"""
    logger.info("🚀 Hızlı Backtest başlatılıyor...")
    
    # Sinyalleri yükle
    signals = load_signals()
    if not signals:
        logger.error("❌ Sinyal bulunamadı!")
        return
    
    logger.info(f"📊 {len(signals)} sinyal yüklendi")
    
    # Sembolleri grupla
    symbols = list(set([s['symbol'] for s in signals]))
    bist_symbols = [s for s in symbols if '.IS' in s]
    us_symbols = [s for s in symbols if '.IS' not in s]
    
    logger.info(f"📈 BIST sembolleri: {len(bist_symbols)}")
    logger.info(f"🇺🇸 US sembolleri: {len(us_symbols)}")
    
    # Veri yükle ve test et
    results = []
    
    for symbol in symbols[:20]:  # İlk 20 sembol ile hızlı test
        logger.info(f"🔍 {symbol} test ediliyor...")
        
        # Veriyi çek
        data = get_historical_data(symbol, days=90)
        
        # Bu sembole ait sinyalleri bul
        symbol_signals = [s for s in signals if s['symbol'] == symbol]
        
        for signal in symbol_signals[:3]:  # Sembol başına max 3 sinyal
            result = simulate_signal_performance(signal, data)
            results.append(result)
    
    # Sonuçları analiz et
    logger.info(f"📊 {len(results)} sinyal test edildi")
    
    if not results:
        logger.error("❌ Test edilebilir sinyal bulunamadı!")
        return
    
    # Genel metrikler
    total_signals = len(results)
    wins = sum([1 for r in results if r['win']])
    win_rate = wins / total_signals if total_signals > 0 else 0
    
    # PnL metrikleri
    pnls = [r['pnl_pct'] for r in results if r['result'] not in ['NO_DATA', 'INSUFFICIENT_DATA', 'ERROR']]
    avg_pnl = np.mean(pnls) if pnls else 0
    total_pnl = np.sum(pnls) if pnls else 0
    
    # BUY sinyalleri için precision
    buy_signals = [r for r in results if r['action'] in ['BUY', 'STRONG_BUY']]
    buy_wins = sum([1 for r in buy_signals if r['win']])
    buy_precision = buy_wins / len(buy_signals) if buy_signals else 0
    
    # Confidence grupları
    high_conf = [r for r in results if r['confidence'] >= 0.8]
    high_conf_wins = sum([1 for r in high_conf if r['win']])
    high_conf_precision = high_conf_wins / len(high_conf) if high_conf else 0
    
    # BIST vs US
    bist_results = [r for r in results if '.IS' in r['symbol']]
    us_results = [r for r in results if '.IS' not in r['symbol']]
    
    bist_win_rate = sum([1 for r in bist_results if r['win']]) / len(bist_results) if bist_results else 0
    us_win_rate = sum([1 for r in us_results if r['win']]) / len(us_results) if us_results else 0
    
    # Sharpe ve profit factor
    sharpe = np.mean(pnls) / np.std(pnls) if pnls and np.std(pnls) > 0 else 0
    
    positive_pnls = [p for p in pnls if p > 0]
    negative_pnls = [abs(p) for p in pnls if p < 0]
    profit_factor = sum(positive_pnls) / sum(negative_pnls) if negative_pnls else float('inf')
    
    # Rapor
    print("\n" + "="*60)
    print("🎯 BIST AI SMART TRADER - HIZLI BACKTEST RAPORU")
    print("="*60)
    print(f"📊 Toplam sinyal: {total_signals}")
    print(f"📈 Test edilen: {len(pnls)}")
    print(f"⏰ Test dönemi: Son 90 gün")
    print()
    
    print("🏆 GENEL PERFORMANS")
    print("-"*40)
    print(f"Win Rate: {win_rate:.1%} ({'🟢' if win_rate >= 0.6 else '🔴'})")
    print(f"Ortalama PnL: {avg_pnl:.2%}")
    print(f"Toplam PnL: {total_pnl:.2%}")
    print(f"Sharpe Ratio: {sharpe:.2f} ({'🟢' if sharpe >= 1.0 else '🔴'})")
    print(f"Profit Factor: {profit_factor:.2f} ({'🟢' if profit_factor >= 1.5 else '🔴'})")
    print()
    
    print("📊 SINYAL KALİTESİ")
    print("-"*40)
    print(f"BUY Precision: {buy_precision:.1%} ({'🟢' if buy_precision >= 0.75 else '🔴'})")
    print(f"High Confidence (≥0.8): {high_conf_precision:.1%} ({len(high_conf)} sinyal)")
    print()
    
    print("🌍 PAZAR KARŞILAŞTIRMASI")
    print("-"*40)
    print(f"BIST Win Rate: {bist_win_rate:.1%} ({len(bist_results)} sinyal)")
    print(f"US Win Rate: {us_win_rate:.1%} ({len(us_results)} sinyal)")
    print()
    
    print("🎯 %80+ KAZANMA HEDEFİ İÇİN")
    print("-"*40)
    if win_rate >= 0.8:
        print("✅ Hedef BAŞARILDI! Win rate ≥%80")
    elif win_rate >= 0.6:
        print(f"⚠️ Hedef yakın ({win_rate:.1%}), kalibrasyon gerekli")
        print("💡 Öneriler:")
        print("   - Confidence threshold artırılmalı (≥0.9)")
        print("   - Risk filtreleri sıkılaştırılmalı")
        print("   - Walk-forward kalibrasyonu uygulanmalı")
    else:
        print(f"❌ Hedef uzak ({win_rate:.1%}), majör iyileştirme gerekli")
        print("💡 Acil önlemler:")
        print("   - Signal filtering logic gözden geçirilmeli")
        print("   - Entry/exit koşulları sıkılaştırılmalı")
        print("   - Model ensemble weights ayarlanmalı")
    
    print()
    print("📈 SONRAKİ ADIMLAR")
    print("-"*40)
    print("1. Walk-forward kalibrasyon (eşik ayarı)")
    print("2. Risk circuit-breaker sıkılaştırma")
    print("3. XAI ile sinyal açıklamaları")
    print("4. Broker paper trading entegrasyonu")
    print("5. Multi-channel notification aktive etme")
    print()
    
    return {
        'total_signals': total_signals,
        'win_rate': win_rate,
        'buy_precision': buy_precision,
        'high_conf_precision': high_conf_precision,
        'avg_pnl': avg_pnl,
        'sharpe': sharpe,
        'profit_factor': profit_factor,
        'bist_win_rate': bist_win_rate,
        'us_win_rate': us_win_rate
    }

if __name__ == "__main__":
    try:
        results = run_backtest()
        if results:
            logger.info("🎯 Backtest tamamlandı!")
        else:
            logger.error("❌ Backtest başarısız!")
    except Exception as e:
        logger.error(f"❌ Backtest hatası: {e}")
