import pandas as pd
import numpy as np
import yfinance as yf
# TA-Lib yerine ta kütüphanesi kullan
import ta
from datetime import datetime, timedelta
import logging
from typing import List, Dict, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BISTTradingSignals:
    """
    BIST Al-Sat Sinyalleri + Düşme Tahminleri + Tıklanabilir Analiz
    """
    
    def __init__(self):
        self.bist_stocks = [
            "SISE.IS", "EREGL.IS", "TUPRS.IS", "KCHOL.IS", "GARAN.IS",
            "AKBNK.IS", "YKBNK.IS", "THYAO.IS", "ASELS.IS", "BIMAS.IS"
        ]
        
        # Sinyal geçmişi
        self.signal_history = {}
        self.analysis_cache = {}
        
    def get_stock_data(self, symbol: str, period: str = "6mo") -> pd.DataFrame:
        """
        Hisse verisi çeker
        """
        try:
            data = yf.download(symbol, period=period, interval="1d", progress=False)
            
            if data.empty:
                return pd.DataFrame()
            
            # MultiIndex düzelt
            if isinstance(data.columns, pd.MultiIndex):
                data.columns = data.columns.get_level_values(0)
            
            # Gereksiz sütunları kaldır
            data = data[['Open', 'High', 'Low', 'Close', 'Volume']]
            
            # NaN değerleri temizle
            data = data.dropna()
            
            return data
            
        except Exception as e:
            logger.error(f"{symbol} veri çekme hatası: {e}")
            return pd.DataFrame()
    
    def analyze_trading_signals(self, symbol: str, period: str = "6mo") -> Dict:
        """
        Al-sat sinyalleri + düşme tahminleri analizi
        """
        try:
            logger.info(f"🎯 {symbol} al-sat sinyalleri analiz ediliyor...")
            
            # Veri çek
            data = self.get_stock_data(symbol, period)
            if data.empty:
                return {"error": "Veri bulunamadı"}
            
            # Numpy array'e çevir
            close = data['Close'].values.astype(float)
            high = data['High'].values.astype(float)
            low = data['Low'].values.astype(float)
            open_price = data['Open'].values.astype(float)
            volume = data['Volume'].values.astype(float)
            
            # 1. ALIM SİNYALLERİ
            buy_signals = self._detect_buy_signals(close, high, low, open_price, volume)
            
            # 2. SATIM SİNYALLERİ
            sell_signals = self._detect_sell_signals(close, high, low, open_price, volume)
            
            # 3. DÜŞME TAHMİNLERİ
            drop_predictions = self._predict_price_drops(close, high, low, volume)
            
            # 4. TEKNİK FORMASYONLAR
            patterns = self._detect_patterns(close, high, low, open_price, volume)
            
            # 5. Yükseliş Olasılığı (%)
            rise_probability = self._estimate_rise_probability(close, volume, buy_signals, sell_signals, drop_predictions)

            # 6. AL-SAT KARARI
            trading_decision = self._make_trading_decision(buy_signals, sell_signals, drop_predictions, rise_probability)
            
            # 7. ZAMAN TAHMİNLERİ
            time_predictions = self._predict_timing(buy_signals, sell_signals, drop_predictions)
            
            # Sonuç
            result = {
                "symbol": symbol,
                "analysis_date": datetime.now().isoformat(),
                "data_period": period,
                "current_price": float(close[-1]),
                "price_change_1d": float((close[-1] - close[-2]) / close[-2] * 100) if len(close) >= 2 else 0,
                "price_change_5d": float((close[-1] - close[-5]) / close[-5] * 100) if len(close) >= 5 else 0,
                "price_change_20d": float((close[-1] - close[-20]) / close[-20] * 100) if len(close) >= 20 else 0,
                
                "buy_signals": buy_signals,
                "sell_signals": sell_signals,
                "drop_predictions": drop_predictions,
                "patterns": patterns,
                "trading_decision": trading_decision,
                "rise_probability": rise_probability,
                "time_predictions": time_predictions,
                
                "risk_level": self._calculate_risk_level(buy_signals, sell_signals, drop_predictions),
                "confidence_score": self._calculate_confidence_score(buy_signals, sell_signals, patterns),
                "urgency_level": self._calculate_urgency_level(buy_signals, sell_signals, drop_predictions)
            }
            
            # Cache'e kaydet
            self.analysis_cache[symbol] = result
            
            return result
            
        except Exception as e:
            logger.error(f"{symbol} al-sat analiz hatası: {e}")
            return {"error": str(e)}
    
    def _detect_buy_signals(self, close: np.ndarray, high: np.ndarray, 
                           low: np.ndarray, open_price: np.ndarray, volume: np.ndarray) -> Dict:
        """
        Alım sinyalleri tespit eder
        """
        try:
            buy_signals = {
                "ema_cross": False,
                "rsi_oversold": False,
                "macd_bullish": False,
                "volume_surge": False,
                "support_bounce": False,
                "bullish_patterns": [],
                "total_signals": 0
            }
            
            # 1. EMA Cross (Golden Cross)
            ema20 = talib.EMA(close, timeperiod=20)
            ema50 = talib.EMA(close, timeperiod=50)
            
            if len(ema20) >= 2 and len(ema50) >= 2:
                if ema20[-1] > ema50[-1] and ema20[-2] <= ema50[-2]:
                    buy_signals["ema_cross"] = True
                    buy_signals["total_signals"] += 1
            
            # 2. RSI Oversold
            rsi = talib.RSI(close, timeperiod=14)
            if len(rsi) > 0 and rsi[-1] < 30:
                buy_signals["rsi_oversold"] = True
                buy_signals["total_signals"] += 1
            
            # 3. MACD Bullish
            macd, macd_signal, macd_hist = talib.MACD(close)
            if len(macd) >= 2 and len(macd_signal) >= 2:
                if macd[-1] > macd_signal[-1] and macd[-2] <= macd_signal[-2]:
                    buy_signals["macd_bullish"] = True
                    buy_signals["total_signals"] += 1
            
            # 4. Volume Surge
            volume_ma = talib.SMA(volume, timeperiod=20)
            if len(volume_ma) > 0:
                if volume[-1] > volume_ma[-1] * 1.5:
                    buy_signals["volume_surge"] = True
                    buy_signals["total_signals"] += 1
            
            # 5. Support Bounce
            support_level = self._find_support_level(low)
            if support_level and close[-1] <= support_level * 1.02:
                buy_signals["support_bounce"] = True
                buy_signals["total_signals"] += 1
            
            # 6. Bullish Patterns
            bullish_patterns = []
            
            # Hammer
            hammer = talib.CDLHAMMER(open_price, high, low, close)
            if hammer[-1] > 0:
                bullish_patterns.append("Hammer")
                buy_signals["total_signals"] += 1
            
            # Morning Star
            morning_star = talib.CDLMORNINGSTAR(open_price, high, low, close)
            if morning_star[-1] > 0:
                bullish_patterns.append("Morning Star")
                buy_signals["total_signals"] += 1
            
            # Bullish Engulfing
            bullish_engulfing = talib.CDLENGULFING(open_price, high, low, close)
            if bullish_engulfing[-1] > 0:
                bullish_patterns.append("Bullish Engulfing")
                buy_signals["total_signals"] += 1
            
            buy_signals["bullish_patterns"] = bullish_patterns
            
            return buy_signals
            
        except Exception as e:
            logger.error(f"Alım sinyali tespit hatası: {e}")
            return {"total_signals": 0}
    
    def _detect_sell_signals(self, close: np.ndarray, high: np.ndarray, 
                            low: np.ndarray, open_price: np.ndarray, volume: np.ndarray) -> Dict:
        """
        Satım sinyalleri tespit eder
        """
        try:
            sell_signals = {
                "ema_cross": False,
                "rsi_overbought": False,
                "macd_bearish": False,
                "volume_decline": False,
                "resistance_rejection": False,
                "bearish_patterns": [],
                "total_signals": 0
            }
            
            # 1. EMA Cross (Death Cross)
            ema20 = talib.EMA(close, timeperiod=20)
            ema50 = talib.EMA(close, timeperiod=50)
            
            if len(ema20) >= 2 and len(ema50) >= 2:
                if ema20[-1] < ema50[-1] and ema20[-2] >= ema50[-2]:
                    sell_signals["ema_cross"] = True
                    sell_signals["total_signals"] += 1
            
            # 2. RSI Overbought
            rsi = talib.RSI(close, timeperiod=14)
            if len(rsi) > 0 and rsi[-1] > 70:
                sell_signals["rsi_overbought"] = True
                sell_signals["total_signals"] += 1
            
            # 3. MACD Bearish
            macd, macd_signal, macd_hist = talib.MACD(close)
            if len(macd) >= 2 and len(macd_signal) >= 2:
                if macd[-1] < macd_signal[-1] and macd[-2] >= macd_signal[-2]:
                    sell_signals["macd_bearish"] = True
                    sell_signals["total_signals"] += 1
            
            # 4. Volume Decline
            volume_ma = talib.SMA(volume, timeperiod=20)
            if len(volume_ma) > 0:
                if volume[-1] < volume_ma[-1] * 0.5:
                    sell_signals["volume_decline"] = True
                    sell_signals["total_signals"] += 1
            
            # 5. Resistance Rejection
            resistance_level = self._find_resistance_level(high)
            if resistance_level and close[-1] >= resistance_level * 0.98:
                sell_signals["resistance_rejection"] = True
                sell_signals["total_signals"] += 1
            
            # 6. Bearish Patterns
            bearish_patterns = []
            
            # Shooting Star
            shooting_star = talib.CDLSHOOTINGSTAR(open_price, high, low, close)
            if shooting_star[-1] > 0:
                bearish_patterns.append("Shooting Star")
                sell_signals["total_signals"] += 1
            
            # Evening Star
            evening_star = talib.CDLEVENINGSTAR(open_price, high, low, close)
            if evening_star[-1] > 0:
                bearish_patterns.append("Evening Star")
                sell_signals["total_signals"] += 1
            
            # Bearish Engulfing
            bearish_engulfing = talib.CDLENGULFING(open_price, high, low, close)
            if bearish_engulfing[-1] < 0:
                bearish_patterns.append("Bearish Engulfing")
                sell_signals["total_signals"] += 1
            
            sell_signals["bearish_patterns"] = bearish_patterns
            
            return sell_signals
            
        except Exception as e:
            logger.error(f"Satım sinyali tespit hatası: {e}")
            return {"total_signals": 0}
    
    def _predict_price_drops(self, close: np.ndarray, high: np.ndarray, 
                            low: np.ndarray, volume: np.ndarray) -> Dict:
        """
        Düşme tahminleri yapar
        """
        try:
            drop_predictions = {
                "immediate_drop": False,
                "short_term_drop": False,
                "medium_term_drop": False,
                "drop_probability": 0.0,
                "expected_drop_percentage": 0.0,
                "drop_timeframe": "",
                "risk_factors": []
            }
            
            # 1. Anlık düşme riski (1-2 gün)
            immediate_risk = 0
            risk_factors = []
            
            # RSI aşırı alım
            rsi = talib.RSI(close, timeperiod=14)
            if len(rsi) > 0 and rsi[-1] > 75:
                immediate_risk += 30
                risk_factors.append("RSI Aşırı Alım (>75)")
            
            # Fiyat momentum (son 5 gün)
            if len(close) >= 5:
                momentum_5d = (close[-1] - close[-5]) / close[-5] * 100
                if momentum_5d > 8:
                    immediate_risk += 25
                    risk_factors.append(f"5G Aşırı Yükseliş ({momentum_5d:.1f}%)")
            
            # Hacim düşüşü
            volume_ma = talib.SMA(volume, timeperiod=20)
            if len(volume_ma) > 0:
                if volume[-1] < volume_ma[-1] * 0.6:
                    immediate_risk += 20
                    risk_factors.append("Hacim Düşüşü")
            
            # Bollinger Bands üst band
            bb_upper, bb_middle, bb_lower = talib.BBANDS(close, timeperiod=20)
            if len(bb_upper) > 0:
                if close[-1] > bb_upper[-1] * 0.98:
                    immediate_risk += 25
                    risk_factors.append("Bollinger Üst Band")
            
            # Anlık düşme olasılığı
            drop_predictions["immediate_drop"] = immediate_risk > 50
            drop_predictions["drop_probability"] = min(100, immediate_risk)
            drop_predictions["risk_factors"] = risk_factors
            
            # 2. Kısa vadeli düşme (1 hafta)
            if immediate_risk > 40:
                drop_predictions["short_term_drop"] = True
                drop_predictions["expected_drop_percentage"] = 3.0 + (immediate_risk / 100) * 5.0
                drop_predictions["drop_timeframe"] = "1-7 gün"
            
            # 3. Orta vadeli düşme (2-4 hafta)
            if immediate_risk > 60:
                drop_predictions["medium_term_drop"] = True
                drop_predictions["expected_drop_percentage"] = 5.0 + (immediate_risk / 100) * 8.0
                drop_predictions["drop_timeframe"] = "2-4 hafta"
            
            return drop_predictions
            
        except Exception as e:
            logger.error(f"Düşme tahmin hatası: {e}")
            return {"drop_probability": 0.0}
    
    def _detect_patterns(self, close: np.ndarray, high: np.ndarray, 
                         low: np.ndarray, open_price: np.ndarray, volume: np.ndarray) -> Dict:
        """
        Teknik formasyonları tespit eder
        """
        try:
            patterns = {
                "doji": [],
                "hammer": [],
                "shooting_star": [],
                "engulfing": [],
                "morning_star": [],
                "evening_star": [],
                "total_patterns": 0
            }

            if len(close) < 5:
                return patterns

            lookback = min(30, len(close))

            # TA-Lib ile tüm seri için hesapla, son lookback gününde indeksleri al
            doji_arr = talib.CDLDOJI(open_price, high, low, close)
            hammer_arr = talib.CDLHAMMER(open_price, high, low, close)
            shooting_arr = talib.CDLSHOOTINGSTAR(open_price, high, low, close)
            engulf_arr = talib.CDLENGULFING(open_price, high, low, close)
            morning_arr = talib.CDLMORNINGSTAR(open_price, high, low, close)
            evening_arr = talib.CDLEVENINGSTAR(open_price, high, low, close)

            start_idx = len(close) - lookback
            idx_range = range(start_idx, len(close))

            for i in idx_range:
                if doji_arr[i] != 0:
                    patterns["doji"].append(i - len(close))
                    patterns["total_patterns"] += 1
                if hammer_arr[i] > 0:
                    patterns["hammer"].append(i - len(close))
                    patterns["total_patterns"] += 1
                if shooting_arr[i] > 0:
                    patterns["shooting_star"].append(i - len(close))
                    patterns["total_patterns"] += 1
                if engulf_arr[i] != 0:
                    patterns["engulfing"].append(i - len(close))
                    patterns["total_patterns"] += 1
                if morning_arr[i] > 0:
                    patterns["morning_star"].append(i - len(close))
                    patterns["total_patterns"] += 1
                if evening_arr[i] > 0:
                    patterns["evening_star"].append(i - len(close))
                    patterns["total_patterns"] += 1

            return patterns
            
        except Exception as e:
            logger.error(f"Formasyon tespit hatası: {e}")
            return {"total_patterns": 0}
    
    def _make_trading_decision(self, buy_signals: Dict, sell_signals: Dict, 
                              drop_predictions: Dict, rise_probability: float) -> Dict:
        """
        Al-sat kararı verir
        """
        try:
            decision = {
                "action": "HOLD",
                "confidence": 0.0,
                "reason": "",
                "stop_loss": 0.0,
                "take_profit": 0.0,
                "urgency": "LOW"
            }
            
            buy_score = buy_signals.get("total_signals", 0)
            sell_score = sell_signals.get("total_signals", 0)
            drop_risk = drop_predictions.get("drop_probability", 0)
            
            # Karar algoritması
            if (buy_score > sell_score and buy_score >= 2 and drop_risk < 40) or rise_probability >= 65:
                decision["action"] = "BUY"
                decision["confidence"] = max(rise_probability, min(100, buy_score * 25))
                reason_parts = []
                if buy_score > 0:
                    reason_parts.append(f"alım sinyali {buy_score} adet")
                reason_parts.append(f"yükseliş olasılığı %{rise_probability:.1f}")
                decision["reason"] = ", ".join(reason_parts)
                decision["urgency"] = "HIGH" if (buy_score >= 3 or rise_probability >= 75) else "MEDIUM"
                
            elif sell_score > buy_score and sell_score >= 2:
                decision["action"] = "SELL"
                decision["confidence"] = min(100, sell_score * 25)
                decision["reason"] = f"Güçlü satım sinyalleri ({sell_score} adet)"
                decision["urgency"] = "HIGH" if sell_score >= 3 else "MEDIUM"
                
            elif drop_risk > 60:
                decision["action"] = "SELL"
                decision["confidence"] = drop_risk
                decision["reason"] = f"Yüksek düşme riski (%{drop_risk:.1f})"
                decision["urgency"] = "HIGH"
                
            else:
                decision["action"] = "HOLD"
                decision["confidence"] = max(50.0, rise_probability)
                decision["reason"] = f"Belirgin sinyal yok, bekle (yükseliş olasılığı %{rise_probability:.1f})"
                decision["urgency"] = "LOW"
            
            return decision
            
        except Exception as e:
            logger.error(f"Trading karar hatası: {e}")
            return {"action": "HOLD", "confidence": 0.0}
    
    def _predict_timing(self, buy_signals: Dict, sell_signals: Dict, 
                       drop_predictions: Dict) -> Dict:
        """
        Zaman tahminleri yapar
        """
        try:
            timing = {
                "buy_timing": "",
                "sell_timing": "",
                "hold_duration": "",
                "next_signal_date": ""
            }
            
            # Alım zamanı
            if buy_signals.get("total_signals", 0) >= 2:
                if buy_signals.get("ema_cross", False):
                    timing["buy_timing"] = "HEMEN (EMA Cross)"
                elif buy_signals.get("rsi_oversold", False):
                    timing["buy_timing"] = "1-2 gün içinde"
                else:
                    timing["buy_timing"] = "3-5 gün içinde"
            
            # Satım zamanı
            if sell_signals.get("total_signals", 0) >= 2:
                if sell_signals.get("ema_cross", False):
                    timing["sell_timing"] = "HEMEN (EMA Cross)"
                elif sell_signals.get("rsi_overbought", False):
                    timing["sell_timing"] = "1-2 gün içinde"
                else:
                    timing["sell_timing"] = "3-5 gün içinde"
            
            # Düşme zamanı
            if drop_predictions.get("immediate_drop", False):
                timing["sell_timing"] = "HEMEN (Düşme Riski)"
            
            # Bekleme süresi
            if not buy_signals.get("total_signals", 0) and not sell_signals.get("total_signals", 0):
                timing["hold_duration"] = "1-2 hafta"
            
            return timing
            
        except Exception as e:
            logger.error(f"Zaman tahmin hatası: {e}")
            return {}
    
    def _find_support_level(self, low: np.ndarray) -> Optional[float]:
        """Destek seviyesi bulur"""
        try:
            if len(low) < 20:
                return None
            
            # Son 20 günün en düşük noktaları
            recent_lows = low[-20:]
            support_levels = []
            
            for i in range(1, len(recent_lows) - 1):
                if recent_lows[i] < recent_lows[i-1] and recent_lows[i] < recent_lows[i+1]:
                    support_levels.append(recent_lows[i])
            
            if support_levels:
                return np.mean(support_levels)
            return None
            
        except Exception as e:
            return None
    
    def _find_resistance_level(self, high: np.ndarray) -> Optional[float]:
        """Direnç seviyesi bulur"""
        try:
            if len(high) < 20:
                return None
            
            # Son 20 günün en yüksek noktaları
            recent_highs = high[-20:]
            resistance_levels = []
            
            for i in range(1, len(recent_highs) - 1):
                if recent_highs[i] > recent_highs[i-1] and recent_highs[i] > recent_highs[i+1]:
                    resistance_levels.append(recent_highs[i])
            
            if resistance_levels:
                return np.mean(resistance_levels)
            return None
            
        except Exception as e:
            return None
    
    def _calculate_risk_level(self, buy_signals: Dict, sell_signals: Dict, 
                             drop_predictions: Dict) -> str:
        """Risk seviyesi hesaplar"""
        try:
            risk_score = 0
            
            # Düşme riski
            risk_score += drop_predictions.get("drop_probability", 0) * 0.5
            
            # Sinyal çelişkisi
            if buy_signals.get("total_signals", 0) > 0 and sell_signals.get("total_signals", 0) > 0:
                risk_score += 30
            
            # Risk seviyesi
            if risk_score >= 70:
                return "HIGH"
            elif risk_score >= 40:
                return "MEDIUM"
            else:
                return "LOW"
                
        except Exception as e:
            return "MEDIUM"
    
    def _calculate_confidence_score(self, buy_signals: Dict, sell_signals: Dict, 
                                  patterns: Dict) -> float:
        """Güven skoru hesaplar"""
        try:
            confidence = 50.0  # Başlangıç
            
            # Sinyal sayısı
            total_signals = buy_signals.get("total_signals", 0) + sell_signals.get("total_signals", 0)
            if total_signals >= 3:
                confidence += 25
            elif total_signals >= 2:
                confidence += 15
            elif total_signals >= 1:
                confidence += 10
            
            # Formasyon sayısı
            pattern_count = patterns.get("total_patterns", 0)
            if pattern_count >= 5:
                confidence += 15
            elif pattern_count >= 3:
                confidence += 10
            
            return min(100, confidence)
            
        except Exception as e:
            return 50.0
    
    def _calculate_urgency_level(self, buy_signals: Dict, sell_signals: Dict, 
                                drop_predictions: Dict) -> str:
        """Aciliyet seviyesi hesaplar"""
        try:
            urgency_score = 0
            
            # Düşme riski
            if drop_predictions.get("immediate_drop", False):
                urgency_score += 50
            
            # Güçlü sinyaller
            if buy_signals.get("total_signals", 0) >= 3:
                urgency_score += 30
            if sell_signals.get("total_signals", 0) >= 3:
                urgency_score += 30
            
            # Aciliyet seviyesi
            if urgency_score >= 60:
                return "HIGH"
            elif urgency_score >= 30:
                return "MEDIUM"
            else:
                return "LOW"
                
        except Exception as e:
            return "LOW"
    
    def analyze_all_stocks(self, period: str = "6mo") -> Dict:
        """
        Tüm hisseleri analiz eder
        """
        try:
            logger.info(f"🚀 Tüm BIST hisseleri al-sat sinyalleri analiz ediliyor...")
            
            all_results = []
            successful_analyses = 0
            
            for symbol in self.bist_stocks:
                try:
                    result = self.analyze_trading_signals(symbol, period)
                    
                    if "error" not in result:
                        all_results.append(result)
                        successful_analyses += 1
                        
                        # Sinyal durumunu logla
                        action = result['trading_decision']['action']
                        confidence = result['trading_decision']['confidence']
                        logger.info(f"✅ {symbol}: {action} - Güven: {confidence:.1f}%")
                        
                    else:
                        logger.warning(f"⚠️ {symbol}: {result['error']}")
                        
                except Exception as e:
                    logger.error(f"❌ {symbol} analiz hatası: {e}")
                    continue
            
            # Aksiyona göre sırala (önce BUY, sonra SELL), içinde olasılık dikkate al
            action_priority = {"BUY": 3, "SELL": 2, "HOLD": 1}
            all_results.sort(key=lambda x: (
                action_priority.get(x['trading_decision']['action'], 1),
                x.get('rise_probability', 0),
                x['trading_decision']['confidence']
            ), reverse=True)
            
            return {
                "total_stocks": len(self.bist_stocks),
                "successful_analyses": successful_analyses,
                "analysis_date": datetime.now().isoformat(),
                "all_results": all_results,
                "buy_signals": [r for r in all_results if r['trading_decision']['action'] == 'BUY'],
                "sell_signals": [r for r in all_results if r['trading_decision']['action'] == 'SELL'],
                "hold_signals": [r for r in all_results if r['trading_decision']['action'] == 'HOLD'],
                "top_by_probability": sorted(all_results, key=lambda r: r.get('rise_probability', 0), reverse=True)[:5]
            }
            
        except Exception as e:
            logger.error(f"Toplu analiz hatası: {e}")
            return {"error": str(e)}

    def _estimate_rise_probability(self, close: np.ndarray, volume: np.ndarray,
                                   buy_signals: Dict, sell_signals: Dict,
                                   drop_predictions: Dict) -> float:
        """Heuristik yükseliş olasılığı (%) hesaplar (0-100)."""
        try:
            prob = 50.0

            # Trend: EMA20 > EMA50 ve pozitif eğim
            ema20 = talib.EMA(close, timeperiod=20)
            ema50 = talib.EMA(close, timeperiod=50)
            if len(ema20) >= 3 and len(ema50) >= 3:
                if ema20[-1] > ema50[-1]:
                    prob += 8
                if ema20[-1] > ema20[-2] and ema50[-1] >= ema50[-2]:
                    prob += 5

            # Momentum 5g ve 20g
            if len(close) >= 6:
                mom5 = (close[-1] - close[-6]) / close[-6] * 100
                prob += np.clip(mom5, -5, 5)  # -5..+5 puan
            if len(close) >= 21:
                mom20 = (close[-1] - close[-21]) / close[-21] * 100
                prob += np.clip(mom20/2, -5, 5)

            # Hacim: artış olumlu
            vol_ma = talib.SMA(volume, timeperiod=20)
            if len(vol_ma) and vol_ma[-1] > 0:
                vol_ratio = volume[-1] / vol_ma[-1]
                prob += np.clip((vol_ratio - 1.0) * 10, -10, 10)

            # Sinyaller: buy vs sell farkı
            prob += (buy_signals.get('total_signals', 0) - sell_signals.get('total_signals', 0)) * 6

            # Düşüş riski azaltır
            prob -= drop_predictions.get('drop_probability', 0) * 0.4

            return float(np.clip(prob, 0, 100))
        except Exception:
            return 50.0
    
    def get_stock_analysis(self, symbol: str) -> Dict:
        """
        Belirli hisse analizini döndürür (tıklanabilir analiz için)
        """
        try:
            if symbol in self.analysis_cache:
                return self.analysis_cache[symbol]
            else:
                # Analiz yap
                return self.analyze_trading_signals(symbol)
                
        except Exception as e:
            logger.error(f"{symbol} analiz getirme hatası: {e}")
            return {"error": str(e)}

# Test fonksiyonu
if __name__ == "__main__":
    print("🎯 BIST TRADING SIGNALS - TEST BAŞLATILIYOR...")
    print("=" * 60)
    
    # Trading signals sistemini başlat
    signals = BISTTradingSignals()
    
    # Tüm hisseleri analiz et
    print("📊 BIST hisseleri al-sat sinyalleri analiz ediliyor...")
    results = signals.analyze_all_stocks(period="6mo")
    
    if "error" not in results:
        print(f"✅ Toplam {results['successful_analyses']} hisse analiz edildi!")
        
        # BUY olasılığı en yüksek ilk 5 aday (aksiyon ne olursa olsun görünür)
        if results.get('top_by_probability'):
            print(f"\n🔮 YÜKSELİŞ OLASILIĞI EN YÜKSEK ADAYLAR (Top 5):")
            print("-" * 60)
            for r in results['top_by_probability']:
                print(f"   {r['symbol']}: %{r.get('rise_probability', 0):.1f} - Aksiyon: {r['trading_decision']['action']} (Güven: {r['trading_decision']['confidence']:.1f}%)")

        # BUY sinyalleri (olasılık ile)
        if results['buy_signals']:
            print(f"\n🟢 BUY SİNYALLERİ ({len(results['buy_signals'])} adet):")
            print("-" * 60)
            for stock in results['buy_signals']:
                decision = stock['trading_decision']
                print(f"   {stock['symbol']}: {decision['action']} - Olasılık: %{stock.get('rise_probability', 0):.1f} - Güven: {decision['confidence']:.1f}%")
                print(f"      Sebep: {decision['reason']}")
                print(f"      Aciliyet: {decision['urgency']}")
                print()
        
        # SELL sinyalleri
        if results['sell_signals']:
            print(f"🔴 SELL SİNYALLERİ ({len(results['sell_signals'])} adet):")
            print("-" * 60)
            for stock in results['sell_signals']:
                decision = stock['trading_decision']
                drop_pred = stock['drop_predictions']
                print(f"   {stock['symbol']}: {decision['action']} - Güven: {decision['confidence']:.1f}%")
                print(f"      Sebep: {decision['reason']}")
                if drop_pred.get('drop_probability', 0) > 0:
                    print(f"      Düşme Riski: %{drop_pred['drop_probability']:.1f}")
                print()
        
        # HOLD sinyalleri
        if results['hold_signals']:
            print(f"🟡 HOLD SİNYALLERİ ({len(results['hold_signals'])} adet):")
            print("-" * 60)
            for stock in results['hold_signals'][:5]:  # İlk 5'i göster
                decision = stock['trading_decision']
                print(f"   {stock['symbol']}: {decision['action']} - Güven: {decision['confidence']:.1f}%")
        
        # Detaylı analiz örneği
        if results['buy_signals']:
            print(f"\n🔍 DETAYLI ANALİZ ÖRNEĞİ ({results['buy_signals'][0]['symbol']}):")
            print("-" * 60)
            
            top_stock = results['buy_signals'][0]
            print(f"Symbol: {top_stock['symbol']}")
            print(f"Fiyat: {top_stock['current_price']:.2f} TL")
            print(f"1G Değişim: {top_stock['price_change_1d']:.2f}%")
            print(f"5G Değişim: {top_stock['price_change_5d']:.2f}%")
            print(f"20G Değişim: {top_stock['price_change_20d']:.2f}%")
            
            decision = top_stock['trading_decision']
            print(f"Karar: {decision['action']} (Olasılık: %{top_stock.get('rise_probability', 0):.1f})")
            print(f"Güven: {decision['confidence']:.1f}%")
            print(f"Sebep: {decision['reason']}")
            print(f"Aciliyet: {decision['urgency']}")
            
            buy_signals = top_stock['buy_signals']
            print(f"Alım Sinyalleri: {buy_signals['total_signals']} adet")
            if buy_signals['ema_cross']:
                print("   ✅ EMA Cross (Golden Cross)")
            if buy_signals['rsi_oversold']:
                print("   ✅ RSI Oversold")
            if buy_signals['macd_bullish']:
                print("   ✅ MACD Bullish")
            if buy_signals['volume_surge']:
                print("   ✅ Volume Surge")
            if buy_signals['support_bounce']:
                print("   ✅ Support Bounce")
            
            patterns = top_stock['patterns']
            print(f"Formasyonlar: {patterns['total_patterns']} adet")
            if patterns['doji']:
                print(f"   📊 Doji: {len(patterns['doji'])} adet")
            if patterns['hammer']:
                print(f"   🔨 Hammer: {len(patterns['hammer'])} adet")
            if patterns['morning_star']:
                print(f"   🌅 Morning Star: {len(patterns['morning_star'])} adet")
            
            timing = top_stock['time_predictions']
            if timing.get('buy_timing'):
                print(f"Alım Zamanı: {timing['buy_timing']}")
            if timing.get('hold_duration'):
                print(f"Bekleme Süresi: {timing['hold_duration']}")
        
    else:
        print(f"❌ Analiz hatası: {results['error']}")
    
    print("\n✅ Test tamamlandı!")
