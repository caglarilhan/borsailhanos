#!/usr/bin/env python3
"""
📊 Accuracy Calculator
Sistem doğruluk oranını hesaplama
"""

import json
import pandas as pd
import numpy as np
import logging
from datetime import datetime, timedelta
import yfinance as yf
from typing import Dict, List, Tuple

logger = logging.getLogger(__name__)

class AccuracyCalculator:
    """Doğruluk hesaplayıcı"""
    
    def __init__(self):
        self.results = {}
        
    def calculate_accuracy(self, symbol: str, entry_price: float, 
                          take_profit: float, stop_loss: float, 
                          timeframe_hours: int = 24) -> Dict:
        """Doğruluk hesapla"""
        try:
            logger.info(f"📊 {symbol} doğruluk analizi başlıyor...")
            
            # Hisse verisi çek
            stock = yf.Ticker(symbol)
            data = stock.history(period="5d", interval="1h")
            
            if data.empty:
                logger.error(f"❌ {symbol} için veri bulunamadı")
                return self._default_result()
            
            # Entry fiyatına en yakın zamanı bul
            entry_time = self._find_entry_time(data, entry_price)
            
            if entry_time is None:
                logger.warning(f"⚠️ {symbol} entry fiyatı bulunamadı")
                return self._default_result()
            
            # Timeframe içindeki fiyat hareketlerini analiz et
            end_time = entry_time + timedelta(hours=timeframe_hours)
            analysis_data = data[(data.index >= entry_time) & (data.index <= end_time)]
            
            if analysis_data.empty:
                logger.warning(f"⚠️ {symbol} analiz verisi bulunamadı")
                return self._default_result()
            
            # Sonuçları hesapla
            result = self._analyze_price_movement(
                symbol, entry_price, take_profit, stop_loss, analysis_data
            )
            
            logger.info(f"✅ {symbol} analizi tamamlandı")
            return result
            
        except Exception as e:
            logger.error(f"❌ {symbol} doğruluk hesaplama hatası: {e}")
            return self._default_result()
    
    def _find_entry_time(self, data: pd.DataFrame, entry_price: float) -> datetime:
        """Entry fiyatına en yakın zamanı bul"""
        try:
            # Entry fiyatına en yakın fiyatı bul
            price_diff = abs(data['Close'] - entry_price)
            closest_idx = price_diff.idxmin()
            return closest_idx
        except:
            return None
    
    def _analyze_price_movement(self, symbol: str, entry_price: float, 
                               take_profit: float, stop_loss: float, 
                               data: pd.DataFrame) -> Dict:
        """Fiyat hareketini analiz et"""
        try:
            # Maksimum ve minimum fiyatları bul
            max_price = data['High'].max()
            min_price = data['Low'].min()
            
            # TP ve SL'e ulaşma kontrolü
            tp_reached = max_price >= take_profit
            sl_reached = min_price <= stop_loss
            
            # Sonuç belirleme
            if tp_reached and not sl_reached:
                result = "SUCCESS"
                success_rate = 100.0
                actual_return = ((take_profit - entry_price) / entry_price) * 100
            elif sl_reached and not tp_reached:
                result = "FAILURE"
                success_rate = 0.0
                actual_return = ((stop_loss - entry_price) / entry_price) * 100
            elif tp_reached and sl_reached:
                # Hangisi önce ulaşıldı?
                tp_time = data[data['High'] >= take_profit].index[0]
                sl_time = data[data['Low'] <= stop_loss].index[0]
                
                if tp_time < sl_time:
                    result = "SUCCESS"
                    success_rate = 100.0
                    actual_return = ((take_profit - entry_price) / entry_price) * 100
                else:
                    result = "FAILURE"
                    success_rate = 0.0
                    actual_return = ((stop_loss - entry_price) / entry_price) * 100
            else:
                # Ne TP ne SL'e ulaşıldı
                final_price = data['Close'].iloc[-1]
                actual_return = ((final_price - entry_price) / entry_price) * 100
                
                if actual_return > 0:
                    result = "PARTIAL_SUCCESS"
                    success_rate = 50.0
                else:
                    result = "PARTIAL_FAILURE"
                    success_rate = 0.0
            
            # Detaylı analiz
            analysis = {
                "symbol": symbol,
                "entry_price": entry_price,
                "take_profit": take_profit,
                "stop_loss": stop_loss,
                "max_price": max_price,
                "min_price": min_price,
                "final_price": data['Close'].iloc[-1],
                "tp_reached": tp_reached,
                "sl_reached": sl_reached,
                "result": result,
                "success_rate": success_rate,
                "actual_return_pct": actual_return,
                "expected_return_pct": ((take_profit - entry_price) / entry_price) * 100,
                "risk_reward_ratio": (take_profit - entry_price) / (entry_price - stop_loss),
                "analysis_period_hours": len(data),
                "timestamp": datetime.now().isoformat()
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"❌ Fiyat hareket analizi hatası: {e}")
            return self._default_result()
    
    def _default_result(self) -> Dict:
        """Varsayılan sonuç"""
        return {
            "symbol": "UNKNOWN",
            "entry_price": 0.0,
            "take_profit": 0.0,
            "stop_loss": 0.0,
            "max_price": 0.0,
            "min_price": 0.0,
            "final_price": 0.0,
            "tp_reached": False,
            "sl_reached": False,
            "result": "UNKNOWN",
            "success_rate": 0.0,
            "actual_return_pct": 0.0,
            "expected_return_pct": 0.0,
            "risk_reward_ratio": 0.0,
            "analysis_period_hours": 0,
            "timestamp": datetime.now().isoformat()
        }
    
    def analyze_recent_signals(self) -> Dict:
        """Son sinyalleri analiz et"""
        logger.info("📊 Son sinyaller analiz ediliyor...")
        
        # Test için manuel sinyaller (gerçek veriler yerine)
        test_signals = [
            {
                "symbol": "ASELS.IS",
                "entry_price": 214.00,
                "take_profit": 227.03,
                "stop_loss": 205.31,
                "timeframe_hours": 24
            },
            {
                "symbol": "YKBNK.IS", 
                "entry_price": 35.60,
                "take_profit": 36.94,
                "stop_loss": 34.71,
                "timeframe_hours": 24
            },
            {
                "symbol": "GARAN.IS",
                "entry_price": 95.50,
                "take_profit": 98.20,
                "stop_loss": 93.80,
                "timeframe_hours": 24
            },
            {
                "symbol": "AKBNK.IS",
                "entry_price": 45.20,
                "take_profit": 46.80,
                "stop_loss": 44.10,
                "timeframe_hours": 24
            },
            {
                "symbol": "SISE.IS",
                "entry_price": 28.50,
                "take_profit": 29.80,
                "stop_loss": 27.90,
                "timeframe_hours": 24
            }
        ]
        
        results = []
        total_success = 0
        total_signals = len(test_signals)
        
        for signal in test_signals:
            result = self.calculate_accuracy(
                signal["symbol"],
                signal["entry_price"],
                signal["take_profit"],
                signal["stop_loss"],
                signal["timeframe_hours"]
            )
            
            results.append(result)
            
            if result["result"] == "SUCCESS":
                total_success += 1
        
        # Genel istatistikler
        overall_success_rate = (total_success / total_signals) * 100 if total_signals > 0 else 0
        
        # Ortalama getiri
        avg_return = np.mean([r["actual_return_pct"] for r in results])
        
        # Risk/Reward oranı
        avg_risk_reward = np.mean([r["risk_reward_ratio"] for r in results])
        
        summary = {
            "total_signals": total_signals,
            "successful_signals": total_success,
            "overall_success_rate": overall_success_rate,
            "average_return_pct": avg_return,
            "average_risk_reward": avg_risk_reward,
            "results": results,
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"✅ Analiz tamamlandı:")
        logger.info(f"   Toplam Sinyal: {total_signals}")
        logger.info(f"   Başarılı: {total_success}")
        logger.info(f"   Başarı Oranı: {overall_success_rate:.1f}%")
        logger.info(f"   Ortalama Getiri: {avg_return:.2f}%")
        logger.info(f"   Ortalama R/R: {avg_risk_reward:.2f}")
        
        return summary

def test_accuracy_calculator():
    """Doğruluk hesaplayıcı test"""
    logger.info("🧪 Accuracy Calculator test başlıyor...")
    
    calculator = AccuracyCalculator()
    summary = calculator.analyze_recent_signals()
    
    logger.info("="*80)
    logger.info("📊 SİSTEM DOĞRULUK RAPORU")
    logger.info("="*80)
    logger.info(f"🎯 Genel Başarı Oranı: {summary['overall_success_rate']:.1f}%")
    logger.info(f"📈 Ortalama Getiri: {summary['average_return_pct']:.2f}%")
    logger.info(f"⚖️ Ortalama Risk/Reward: {summary['average_risk_reward']:.2f}")
    logger.info("")
    
    logger.info("📋 Detaylı Sonuçlar:")
    for result in summary['results']:
        status_emoji = "✅" if result['result'] == "SUCCESS" else "❌" if result['result'] == "FAILURE" else "⚠️"
        logger.info(f"{status_emoji} {result['symbol']}: {result['result']} ({result['actual_return_pct']:+.2f}%)")
    
    logger.info("="*80)
    
    return summary

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_accuracy_calculator()
