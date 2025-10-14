"""
PRD v2.0 - Teknik Formasyon Motoru
EMA Cross, Candlestick, Harmonic, Fractal Break formasyonları
ta-lib ve patternizer ile otomatik formasyon tespiti
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional, Tuple
import json

# ta-lib import (fallback if not available)
try:
    import talib
    TALIB_AVAILABLE = True
except ImportError:
    TALIB_AVAILABLE = False
    logging.warning("⚠️ ta-lib bulunamadı, basit teknik analiz implementasyonu kullanılacak")

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TechnicalFormationEngine:
    """Teknik formasyon tespit motoru"""
    
    def __init__(self):
        self.formation_history = []
        self.signal_thresholds = {
            "ema_cross": {"strength": 0.7, "confidence": 0.8},
            "candlestick": {"strength": 0.6, "confidence": 0.7},
            "harmonic": {"strength": 0.8, "confidence": 0.9},
            "fractal": {"strength": 0.75, "confidence": 0.85}
        }
        
        # Formasyon parametreleri
        self.formation_params = {
            "ema_periods": [20, 50, 100],
            "rsi_period": 14,
            "macd_fast": 12,
            "macd_slow": 26,
            "macd_signal": 9,
            "bollinger_period": 20,
            "bollinger_std": 2,
            "fractal_period": 5
        }
        
        # Candlestick patternleri
        self.candlestick_patterns = {
            "bullish_engulfing": {"pattern": "CDLENGULFING", "type": "bullish"},
            "bearish_engulfing": {"pattern": "CDLENGULFING", "type": "bearish"},
            "hammer": {"pattern": "CDLHAMMER", "type": "bullish"},
            "shooting_star": {"pattern": "CDLSHOOTINGSTAR", "type": "bearish"},
            "doji": {"pattern": "CDLDOJI", "type": "neutral"},
            "morning_star": {"pattern": "CDLMORNINGSTAR", "type": "bullish"},
            "evening_star": {"pattern": "CDLEVENINGSTAR", "type": "bearish"}
        }
        
        # Harmonic pattern parametreleri
        self.harmonic_patterns = {
            "gartley": {"ab_bc": 0.618, "cd_ab": 0.786, "bc_ab": 0.382},
            "butterfly": {"ab_bc": 0.786, "cd_ab": 1.27, "bc_ab": 0.382},
            "bat": {"ab_bc": 0.382, "cd_ab": 0.886, "bc_ab": 0.382},
            "crab": {"ab_bc": 0.382, "cd_ab": 1.618, "bc_ab": 0.382}
        }
    
    def get_price_data(self, symbol: str, period: str = "6mo") -> pd.DataFrame:
        """Hisse için fiyat verilerini çek"""
        try:
            logger.info(f"📊 {symbol} fiyat verileri çekiliyor...")
            
            stock = yf.Ticker(symbol)
            hist = stock.history(period=period)
            
            if hist.empty:
                logger.warning(f"⚠️ {symbol} için fiyat verisi bulunamadı")
                return pd.DataFrame()
            
            # Teknik indikatörleri hesapla
            hist = self._calculate_technical_indicators(hist)
            
            logger.info(f"✅ {symbol} fiyat verileri alındı ({len(hist)} gün)")
            return hist
            
        except Exception as e:
            logger.error(f"❌ {symbol} fiyat veri hatası: {e}")
            return pd.DataFrame()
    
    def _calculate_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Teknik indikatörleri hesapla"""
        try:
            if TALIB_AVAILABLE:
                # ta-lib ile hesaplama
                df['EMA_20'] = talib.EMA(df['Close'], timeperiod=20)
                df['EMA_50'] = talib.EMA(df['Close'], timeperiod=50)
                df['EMA_100'] = talib.EMA(df['Close'], timeperiod=100)
                df['RSI'] = talib.RSI(df['Close'], timeperiod=14)
                df['MACD'], df['MACD_signal'], df['MACD_hist'] = talib.MACD(df['Close'])
                df['BB_upper'], df['BB_middle'], df['BB_lower'] = talib.BBANDS(df['Close'])
                df['ATR'] = talib.ATR(df['High'], df['Low'], df['Close'])
                
                # Candlestick patternleri
                for pattern_name, pattern_config in self.candlestick_patterns.items():
                    pattern_func = getattr(talib, pattern_config["pattern"])
                    df[f'{pattern_name}'] = pattern_func(df['Open'], df['High'], df['Low'], df['Close'])
                
            else:
                # Basit teknik analiz implementasyonu
                df = self._simple_technical_indicators(df)
            
            return df
            
        except Exception as e:
            logger.error(f"❌ Teknik indikatör hesaplama hatası: {e}")
            return df
    
    def _simple_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Basit teknik indikatör implementasyonu"""
        try:
            # EMA hesaplama
            df['EMA_20'] = df['Close'].ewm(span=20).mean()
            df['EMA_50'] = df['Close'].ewm(span=50).mean()
            df['EMA_100'] = df['Close'].ewm(span=100).mean()
            
            # RSI hesaplama
            delta = df['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            df['RSI'] = 100 - (100 / (1 + rs))
            
            # MACD hesaplama
            exp1 = df['Close'].ewm(span=12).mean()
            exp2 = df['Close'].ewm(span=26).mean()
            df['MACD'] = exp1 - exp2
            df['MACD_signal'] = df['MACD'].ewm(span=9).mean()
            df['MACD_hist'] = df['MACD'] - df['MACD_signal']
            
            # Bollinger Bands
            df['BB_middle'] = df['Close'].rolling(window=20).mean()
            bb_std = df['Close'].rolling(window=20).std()
            df['BB_upper'] = df['BB_middle'] + (bb_std * 2)
            df['BB_lower'] = df['BB_middle'] - (bb_std * 2)
            
            # ATR hesaplama
            high_low = df['High'] - df['Low']
            high_close = np.abs(df['High'] - df['Close'].shift())
            low_close = np.abs(df['Low'] - df['Close'].shift())
            ranges = pd.concat([high_low, high_close, low_close], axis=1)
            true_range = np.max(ranges, axis=1)
            df['ATR'] = true_range.rolling(14).mean()
            
            # Basit candlestick patternleri
            df['bullish_engulfing'] = self._detect_bullish_engulfing(df)
            df['bearish_engulfing'] = self._detect_bearish_engulfing(df)
            df['hammer'] = self._detect_hammer(df)
            df['shooting_star'] = self._detect_shooting_star(df)
            df['doji'] = self._detect_doji(df)
            
            return df
            
        except Exception as e:
            logger.error(f"❌ Basit teknik indikatör hatası: {e}")
            return df
    
    def _detect_bullish_engulfing(self, df: pd.DataFrame) -> pd.Series:
        """Bullish Engulfing pattern tespiti"""
        try:
            prev_open = df['Open'].shift(1)
            prev_close = df['Close'].shift(1)
            prev_body = abs(prev_close - prev_open)
            curr_body = abs(df['Close'] - df['Open'])
            
            condition = (
                (prev_close < prev_open) &  # Önceki mum düşüş
                (df['Close'] > df['Open']) &  # Mevcut mum yükseliş
                (df['Open'] < prev_close) &  # Mevcut açılış önceki kapanıştan düşük
                (df['Close'] > prev_open) &  # Mevcut kapanış önceki açılıştan yüksek
                (curr_body > prev_body * 1.1)  # Mevcut gövde öncekinden %10 daha büyük
            )
            
            return condition.astype(int)
            
        except Exception as e:
            logger.error(f"❌ Bullish Engulfing tespit hatası: {e}")
            return pd.Series([0] * len(df))
    
    def _detect_bearish_engulfing(self, df: pd.DataFrame) -> pd.Series:
        """Bearish Engulfing pattern tespiti"""
        try:
            prev_open = df['Open'].shift(1)
            prev_close = df['Close'].shift(1)
            prev_body = abs(prev_close - prev_open)
            curr_body = abs(df['Close'] - df['Open'])
            
            condition = (
                (prev_close > prev_open) &  # Önceki mum yükseliş
                (df['Close'] < df['Open']) &  # Mevcut mum düşüş
                (df['Open'] > prev_close) &  # Mevcut açılış önceki kapanıştan yüksek
                (df['Close'] < prev_open) &  # Mevcut kapanış önceki açılıştan düşük
                (curr_body > prev_body * 1.1)  # Mevcut gövde öncekinden %10 daha büyük
            )
            
            return condition.astype(int)
            
        except Exception as e:
            logger.error(f"❌ Bearish Engulfing tespit hatası: {e}")
            return pd.Series([0] * len(df))
    
    def _detect_hammer(self, df: pd.DataFrame) -> pd.Series:
        """Hammer pattern tespiti"""
        try:
            body = abs(df['Close'] - df['Open'])
            upper_shadow = df['High'] - np.maximum(df['Open'], df['Close'])
            lower_shadow = np.minimum(df['Open'], df['Close']) - df['Low']
            
            condition = (
                (lower_shadow > body * 2) &  # Alt gölge gövdeden 2 kat uzun
                (upper_shadow < body * 0.5) &  # Üst gölge gövdenin yarısından kısa
                (body > 0)  # Pozitif gövde
            )
            
            return condition.astype(int)
            
        except Exception as e:
            logger.error(f"❌ Hammer tespit hatası: {e}")
            return pd.Series([0] * len(df))
    
    def _detect_shooting_star(self, df: pd.DataFrame) -> pd.Series:
        """Shooting Star pattern tespiti"""
        try:
            body = abs(df['Close'] - df['Open'])
            upper_shadow = df['High'] - np.maximum(df['Open'], df['Close'])
            lower_shadow = np.minimum(df['Open'], df['Close']) - df['Low']
            
            condition = (
                (upper_shadow > body * 2) &  # Üst gölge gövdeden 2 kat uzun
                (lower_shadow < body * 0.5) &  # Alt gölge gövdenin yarısından kısa
                (body > 0)  # Pozitif gövde
            )
            
            return condition.astype(int)
            
        except Exception as e:
            logger.error(f"❌ Shooting Star tespit hatası: {e}")
            return pd.Series([0] * len(df))
    
    def _detect_doji(self, df: pd.DataFrame) -> pd.Series:
        """Doji pattern tespiti"""
        try:
            body = abs(df['Close'] - df['Open'])
            total_range = df['High'] - df['Low']
            
            condition = (
                (body < total_range * 0.1) &  # Gövde toplam aralığın %10'undan küçük
                (total_range > 0)  # Pozitif aralık
            )
            
            return condition.astype(int)
            
        except Exception as e:
            logger.error(f"❌ Doji tespit hatası: {e}")
            return pd.Series([0] * len(df))
    
    def detect_ema_cross(self, df: pd.DataFrame) -> List[Dict]:
        """EMA kesişim formasyonlarını tespit et"""
        try:
            formations = []
            
            if 'EMA_20' not in df.columns or 'EMA_50' not in df.columns:
                return formations
            
            # EMA 20/50 kesişimi
            ema20 = df['EMA_20']
            ema50 = df['EMA_50']
            
            # Bullish crossover (EMA 20 > EMA 50)
            bullish_cross = (
                (ema20.shift(1) <= ema50.shift(1)) & 
                (ema20 > ema50)
            )
            
            # Bearish crossover (EMA 20 < EMA 50)
            bearish_cross = (
                (ema20.shift(1) >= ema50.shift(1)) & 
                (ema20 < ema50)
            )
            
            # Bullish crossover tespiti
            bullish_dates = df[bullish_cross].index
            for date in bullish_dates:
                if not pd.isna(date):
                    formations.append({
                        "type": "ema_cross",
                        "subtype": "bullish",
                        "date": date.strftime('%Y-%m-%d'),
                        "strength": self._calculate_ema_strength(df, date, "bullish"),
                        "confidence": self._calculate_ema_confidence(df, date, "bullish"),
                        "price": df.loc[date, 'Close'],
                        "ema20": df.loc[date, 'EMA_20'],
                        "ema50": df.loc[date, 'EMA_50']
                    })
            
            # Bearish crossover tespiti
            bearish_dates = df[bearish_cross].index
            for date in bearish_dates:
                if not pd.isna(date):
                    formations.append({
                        "type": "ema_cross",
                        "subtype": "bearish",
                        "date": date.strftime('%Y-%m-%d'),
                        "strength": self._calculate_ema_strength(df, date, "bearish"),
                        "confidence": self._calculate_ema_confidence(df, date, "bearish"),
                        "price": df.loc[date, 'Close'],
                        "ema20": df.loc[date, 'EMA_20'],
                        "ema50": df.loc[date, 'EMA_50']
                    })
            
            return formations
            
        except Exception as e:
            logger.error(f"❌ EMA kesişim tespit hatası: {e}")
            return []
    
    def _calculate_ema_strength(self, df: pd.DataFrame, date: pd.Timestamp, direction: str) -> float:
        """EMA kesişim gücü hesapla"""
        try:
            if direction == "bullish":
                # EMA 20'nin EMA 50'ye göre gücü
                ema20 = df.loc[date, 'EMA_20']
                ema50 = df.loc[date, 'EMA_50']
                strength = (ema20 - ema50) / ema50
            else:
                # EMA 20'nin EMA 50'ye göre zayıflığı
                ema20 = df.loc[date, 'EMA_20']
                ema50 = df.loc[date, 'EMA_50']
                strength = (ema50 - ema20) / ema50
            
            return min(max(strength, 0), 1)  # 0-1 arası normalize
            
        except Exception as e:
            logger.error(f"❌ EMA güç hesaplama hatası: {e}")
            return 0.5
    
    def _calculate_ema_confidence(self, df: pd.DataFrame, date: pd.Timestamp, direction: str) -> float:
        """EMA kesişim güveni hesapla"""
        try:
            # Son 5 günün trend tutarlılığı
            recent_data = df.loc[date - timedelta(days=5):date]
            
            if len(recent_data) < 3:
                return 0.5
            
            # Trend tutarlılığı
            if direction == "bullish":
                trend_consistency = (recent_data['EMA_20'] > recent_data['EMA_50']).sum() / len(recent_data)
            else:
                trend_consistency = (recent_data['EMA_20'] < recent_data['EMA_50']).sum() / len(recent_data)
            
            # Hacim desteği
            volume_support = recent_data['Volume'].mean() / df['Volume'].mean()
            volume_support = min(volume_support, 2) / 2  # 0-1 arası normalize
            
            # Kombine güven
            confidence = (trend_consistency * 0.7) + (volume_support * 0.3)
            
            return min(max(confidence, 0), 1)
            
        except Exception as e:
            logger.error(f"❌ EMA güven hesaplama hatası: {e}")
            return 0.5
    
    def detect_candlestick_patterns(self, df: pd.DataFrame) -> List[Dict]:
        """Candlestick patternlerini tespit et"""
        try:
            formations = []
            
            for pattern_name, pattern_config in self.candlestick_patterns.items():
                if pattern_name not in df.columns:
                    continue
                
                # Pattern tespiti
                pattern_detected = df[df[pattern_name] != 0]
                
                for date in pattern_detected.index:
                    if not pd.isna(date):
                        formations.append({
                            "type": "candlestick",
                            "subtype": pattern_name,
                            "date": date.strftime('%Y-%m-%d'),
                            "strength": self._calculate_candlestick_strength(df, date, pattern_name),
                            "confidence": self._calculate_candlestick_confidence(df, date, pattern_name),
                            "price": df.loc[date, 'Close'],
                            "pattern_value": df.loc[date, pattern_name],
                            "pattern_type": pattern_config["type"]
                        })
            
            return formations
            
        except Exception as e:
            logger.error(f"❌ Candlestick pattern tespit hatası: {e}")
            return []
    
    def _calculate_candlestick_strength(self, df: pd.DataFrame, date: pd.Timestamp, pattern_name: str) -> float:
        """Candlestick pattern gücü hesapla"""
        try:
            # Pattern değeri
            pattern_value = abs(df.loc[date, pattern_name])
            
            # Maksimum pattern değeri (ta-lib için genellikle 100)
            max_pattern_value = 100
            
            # Normalize güç
            strength = min(pattern_value / max_pattern_value, 1)
            
            return strength
            
        except Exception as e:
            logger.error(f"❌ Candlestick güç hesaplama hatası: {e}")
            return 0.5
    
    def _calculate_candlestick_confidence(self, df: pd.DataFrame, date: pd.Timestamp, pattern_name: str) -> float:
        """Candlestick pattern güveni hesapla"""
        try:
            # Hacim desteği
            current_volume = df.loc[date, 'Volume']
            avg_volume = df['Volume'].mean()
            volume_support = min(current_volume / avg_volume, 2) / 2
            
            # Trend desteği
            recent_data = df.loc[date - timedelta(days=3):date]
            if len(recent_data) >= 2:
                price_trend = (recent_data['Close'].iloc[-1] - recent_data['Close'].iloc[0]) / recent_data['Close'].iloc[0]
                trend_support = abs(price_trend) * 10  # 0-1 arası normalize
                trend_support = min(trend_support, 1)
            else:
                trend_support = 0.5
            
            # Kombine güven
            confidence = (volume_support * 0.6) + (trend_support * 0.4)
            
            return min(max(confidence, 0), 1)
            
        except Exception as e:
            logger.error(f"❌ Candlestick güven hesaplama hatası: {e}")
            return 0.5
    
    def detect_harmonic_patterns(self, df: pd.DataFrame) -> List[Dict]:
        """Harmonic patternleri tespit et"""
        try:
            formations = []
            
            # Gartley pattern tespiti
            gartley_formations = self._detect_gartley_pattern(df)
            formations.extend(gartley_formations)
            
            # Butterfly pattern tespiti
            butterfly_formations = self._detect_butterfly_pattern(df)
            formations.extend(butterfly_formations)
            
            return formations
            
        except Exception as e:
            logger.error(f"❌ Harmonic pattern tespit hatası: {e}")
            return []
    
    def _detect_gartley_pattern(self, df: pd.DataFrame) -> List[Dict]:
        """Gartley pattern tespiti"""
        try:
            formations = []
            
            # Son 50 günlük veri
            recent_data = df.tail(50)
            
            if len(recent_data) < 20:
                return formations
            
            # Swing high/low noktaları bul
            swing_points = self._find_swing_points(recent_data)
            
            if len(swing_points) < 4:
                return formations
            
            # Gartley pattern kontrolü
            for i in range(len(swing_points) - 3):
                X = swing_points[i]
                A = swing_points[i + 1]
                B = swing_points[i + 2]
                C = swing_points[i + 3]
                
                # Fibonacci oranları kontrolü
                ab_ratio = abs(B['price'] - A['price']) / abs(A['price'] - X['price'])
                bc_ratio = abs(C['price'] - B['price']) / abs(B['price'] - A['price'])
                cd_ratio = abs(C['price'] - B['price']) / abs(A['price'] - X['price'])
                
                # Gartley kriterleri
                if (0.55 <= ab_ratio <= 0.65 and  # AB = 0.618 * XA
                    0.35 <= bc_ratio <= 0.45 and  # BC = 0.382 * AB
                    0.75 <= cd_ratio <= 0.85):    # CD = 0.786 * XA
                    
                    formations.append({
                        "type": "harmonic",
                        "subtype": "gartley",
                        "date": C['date'],
                        "strength": self._calculate_harmonic_strength(ab_ratio, bc_ratio, cd_ratio),
                        "confidence": self._calculate_harmonic_confidence(recent_data, C['date']),
                        "price": C['price'],
                        "fibonacci_ratios": {
                            "AB_XA": ab_ratio,
                            "BC_AB": bc_ratio,
                            "CD_XA": cd_ratio
                        },
                        "swing_points": [X, A, B, C]
                    })
            
            return formations
            
        except Exception as e:
            logger.error(f"❌ Gartley pattern tespit hatası: {e}")
            return []
    
    def _detect_butterfly_pattern(self, df: pd.DataFrame) -> List[Dict]:
        """Butterfly pattern tespiti"""
        try:
            formations = []
            
            # Son 50 günlük veri
            recent_data = df.tail(50)
            
            if len(recent_data) < 20:
                return formations
            
            # Swing high/low noktaları bul
            swing_points = self._find_swing_points(recent_data)
            
            if len(swing_points) < 4:
                return formations
            
            # Butterfly pattern kontrolü
            for i in range(len(swing_points) - 3):
                X = swing_points[i]
                A = swing_points[i + 1]
                B = swing_points[i + 2]
                C = swing_points[i + 3]
                
                # Fibonacci oranları kontrolü
                ab_ratio = abs(B['price'] - A['price']) / abs(A['price'] - X['price'])
                bc_ratio = abs(C['price'] - B['price']) / abs(B['price'] - A['price'])
                cd_ratio = abs(C['price'] - B['price']) / abs(A['price'] - X['price'])
                
                # Butterfly kriterleri
                if (0.75 <= ab_ratio <= 0.85 and  # AB = 0.786 * XA
                    0.35 <= bc_ratio <= 0.45 and  # BC = 0.382 * AB
                    1.20 <= cd_ratio <= 1.35):    # CD = 1.27 * XA
                    
                    formations.append({
                        "type": "harmonic",
                        "subtype": "butterfly",
                        "date": C['date'],
                        "strength": self._calculate_harmonic_strength(ab_ratio, bc_ratio, cd_ratio),
                        "confidence": self._calculate_harmonic_confidence(recent_data, C['date']),
                        "price": C['price'],
                        "fibonacci_ratios": {
                            "AB_XA": ab_ratio,
                            "BC_AB": bc_ratio,
                            "CD_XA": cd_ratio
                        },
                        "swing_points": [X, A, B, C]
                    })
            
            return formations
            
        except Exception as e:
            logger.error(f"❌ Butterfly pattern tespit hatası: {e}")
            return []
    
    def _find_swing_points(self, df: pd.DataFrame) -> List[Dict]:
        """Swing high/low noktalarını bul"""
        try:
            swing_points = []
            
            for i in range(2, len(df) - 2):
                # Swing high
                if (df['High'].iloc[i] > df['High'].iloc[i-1] and 
                    df['High'].iloc[i] > df['High'].iloc[i-2] and
                    df['High'].iloc[i] > df['High'].iloc[i+1] and 
                    df['High'].iloc[i] > df['High'].iloc[i+2]):
                    
                    swing_points.append({
                        'date': df.index[i],
                        'price': df['High'].iloc[i],
                        'type': 'high'
                    })
                
                # Swing low
                if (df['Low'].iloc[i] < df['Low'].iloc[i-1] and 
                    df['Low'].iloc[i] < df['Low'].iloc[i-2] and
                    df['Low'].iloc[i] < df['Low'].iloc[i+1] and 
                    df['Low'].iloc[i] < df['Low'].iloc[i+2]):
                    
                    swing_points.append({
                        'date': df.index[i],
                        'price': df['Low'].iloc[i],
                        'type': 'low'
                    })
            
            return swing_points
            
        except Exception as e:
            logger.error(f"❌ Swing point tespit hatası: {e}")
            return []
    
    def _calculate_harmonic_strength(self, ab_ratio: float, bc_ratio: float, cd_ratio: float) -> float:
        """Harmonic pattern gücü hesapla"""
        try:
            # Fibonacci oranlarına yakınlık
            target_ratios = [0.618, 0.382, 0.786]  # Gartley için
            actual_ratios = [ab_ratio, bc_ratio, cd_ratio]
            
            strength_scores = []
            for target, actual in zip(target_ratios, actual_ratios):
                deviation = abs(target - actual) / target
                score = max(0, 1 - deviation)
                strength_scores.append(score)
            
            return np.mean(strength_scores)
            
        except Exception as e:
            logger.error(f"❌ Harmonic güç hesaplama hatası: {e}")
            return 0.5
    
    def _calculate_harmonic_confidence(self, df: pd.DataFrame, date: pd.Timestamp) -> float:
        """Harmonic pattern güveni hesapla"""
        try:
            # Hacim desteği
            current_volume = df.loc[date, 'Volume']
            avg_volume = df['Volume'].mean()
            volume_support = min(current_volume / avg_volume, 2) / 2
            
            # Trend desteği
            recent_data = df.loc[date - timedelta(days=5):date]
            if len(recent_data) >= 3:
                price_trend = (recent_data['Close'].iloc[-1] - recent_data['Close'].iloc[0]) / recent_data['Close'].iloc[0]
                trend_support = abs(price_trend) * 5  # 0-1 arası normalize
                trend_support = min(trend_support, 1)
            else:
                trend_support = 0.5
            
            # Kombine güven
            confidence = (volume_support * 0.4) + (trend_support * 0.6)
            
            return min(max(confidence, 0), 1)
            
        except Exception as e:
            logger.error(f"❌ Harmonic güven hesaplama hatası: {e}")
            return 0.5
    
    def detect_fractal_break(self, df: pd.DataFrame) -> List[Dict]:
        """Fractal break formasyonlarını tespit et"""
        try:
            formations = []
            
            # Fractal high/low tespiti
            fractal_highs = self._find_fractal_highs(df)
            fractal_lows = self._find_fractal_lows(df)
            
            # Fractal break tespiti
            for fractal in fractal_highs:
                break_date = self._find_fractal_break(df, fractal, "high")
                if break_date:
                    formations.append({
                        "type": "fractal",
                        "subtype": "break_high",
                        "date": break_date.strftime('%Y-%m-%d'),
                        "strength": self._calculate_fractal_strength(df, break_date, "high"),
                        "confidence": self._calculate_fractal_confidence(df, break_date, "high"),
                        "price": df.loc[break_date, 'Close'],
                        "fractal_level": fractal['price'],
                        "breakout_price": df.loc[break_date, 'Close']
                    })
            
            for fractal in fractal_lows:
                break_date = self._find_fractal_break(df, fractal, "low")
                if break_date:
                    formations.append({
                        "type": "fractal",
                        "subtype": "break_low",
                        "date": break_date.strftime('%Y-%m-%d'),
                        "strength": self._calculate_fractal_strength(df, break_date, "low"),
                        "confidence": self._calculate_fractal_confidence(df, break_date, "low"),
                        "price": df.loc[break_date, 'Close'],
                        "fractal_level": fractal['price'],
                        "breakout_price": df.loc[break_date, 'Close']
                    })
            
            return formations
            
        except Exception as e:
            logger.error(f"❌ Fractal break tespit hatası: {e}")
            return []
    
    def _find_fractal_highs(self, df: pd.DataFrame) -> List[Dict]:
        """Fractal high noktalarını bul"""
        try:
            fractal_highs = []
            
            for i in range(2, len(df) - 2):
                if (df['High'].iloc[i] > df['High'].iloc[i-1] and 
                    df['High'].iloc[i] > df['High'].iloc[i-2] and
                    df['High'].iloc[i] > df['High'].iloc[i+1] and 
                    df['High'].iloc[i] > df['High'].iloc[i+2]):
                    
                    fractal_highs.append({
                        'date': df.index[i],
                        'price': df['High'].iloc[i]
                    })
            
            return fractal_highs
            
        except Exception as e:
            logger.error(f"❌ Fractal high tespit hatası: {e}")
            return []
    
    def _find_fractal_lows(self, df: pd.DataFrame) -> List[Dict]:
        """Fractal low noktalarını bul"""
        try:
            fractal_lows = []
            
            for i in range(2, len(df) - 2):
                if (df['Low'].iloc[i] < df['Low'].iloc[i-1] and 
                    df['Low'].iloc[i] < df['Low'].iloc[i-2] and
                    df['Low'].iloc[i] < df['Low'].iloc[i+1] and 
                    df['Low'].iloc[i] < df['Low'].iloc[i+2]):
                    
                    fractal_lows.append({
                        'date': df.index[i],
                        'price': df['Low'].iloc[i]
                    })
            
            return fractal_lows
            
        except Exception as e:
            logger.error(f"❌ Fractal low tespit hatası: {e}")
            return []
    
    def _find_fractal_break(self, df: pd.DataFrame, fractal: Dict, fractal_type: str) -> Optional[pd.Timestamp]:
        """Fractal break noktasını bul"""
        try:
            fractal_date = fractal['date']
            fractal_price = fractal['price']
            
            # Fractal sonrası veri
            future_data = df[df.index > fractal_date]
            
            if len(future_data) < 5:
                return None
            
            # Break tespiti
            if fractal_type == "high":
                # Yüksek seviye kırılımı
                break_condition = future_data['Close'] > fractal_price
            else:
                # Düşük seviye kırılımı
                break_condition = future_data['Close'] < fractal_price
            
            break_dates = future_data[break_condition].index
            
            if len(break_dates) > 0:
                return break_dates[0]
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Fractal break tespit hatası: {e}")
            return None
    
    def _calculate_fractal_strength(self, df: pd.DataFrame, date: pd.Timestamp, fractal_type: str) -> float:
        """Fractal break gücü hesapla"""
        try:
            # Breakout gücü
            if fractal_type == "high":
                breakout_strength = (df.loc[date, 'Close'] - df.loc[date, 'Open']) / df.loc[date, 'Open']
            else:
                breakout_strength = (df.loc[date, 'Open'] - df.loc[date, 'Close']) / df.loc[date, 'Open']
            
            # Normalize güç
            strength = min(abs(breakout_strength) * 10, 1)
            
            return strength
            
        except Exception as e:
            logger.error(f"❌ Fractal güç hesaplama hatası: {e}")
            return 0.5
    
    def _calculate_fractal_confidence(self, df: pd.DataFrame, date: pd.Timestamp, fractal_type: str) -> float:
        """Fractal break güveni hesapla"""
        try:
            # Hacim desteği
            current_volume = df.loc[date, 'Volume']
            avg_volume = df['Volume'].mean()
            volume_support = min(current_volume / avg_volume, 2) / 2
            
            # Trend desteği
            recent_data = df.loc[date - timedelta(days=3):date]
            if len(recent_data) >= 2:
                price_trend = (recent_data['Close'].iloc[-1] - recent_data['Close'].iloc[0]) / recent_data['Close'].iloc[0]
                trend_support = abs(price_trend) * 8  # 0-1 arası normalize
                trend_support = min(trend_support, 1)
            else:
                trend_support = 0.5
            
            # Kombine güven
            confidence = (volume_support * 0.5) + (trend_support * 0.5)
            
            return min(max(confidence, 0), 1)
            
        except Exception as e:
            logger.error(f"❌ Fractal güven hesaplama hatası: {e}")
            return 0.5
    
    def analyze_all_formations(self, symbol: str) -> Dict:
        """Tüm formasyonları analiz et"""
        try:
            logger.info(f"🔍 {symbol} için tüm formasyonlar analiz ediliyor...")
            
            # Fiyat verilerini çek
            df = self.get_price_data(symbol)
            if df.empty:
                return {"error": f"{symbol} için fiyat verisi bulunamadı"}
            
            # Tüm formasyonları tespit et
            all_formations = []
            
            # EMA Cross
            ema_formations = self.detect_ema_cross(df)
            all_formations.extend(ema_formations)
            
            # Candlestick Patterns
            candlestick_formations = self.detect_candlestick_patterns(df)
            all_formations.extend(candlestick_formations)
            
            # Harmonic Patterns
            harmonic_formations = self.detect_harmonic_patterns(df)
            all_formations.extend(harmonic_formations)
            
            # Fractal Break
            fractal_formations = self.detect_fractal_break(df)
            all_formations.extend(fractal_formations)
            
            # Formasyonları tarihe göre sırala
            all_formations.sort(key=lambda x: x['date'], reverse=True)
            
            # Sinyal üretimi
            signals = self._generate_formation_signals(all_formations)
            
            # Analiz sonuçları
            analysis_result = {
                "symbol": symbol,
                "analysis_date": datetime.now().isoformat(),
                "total_formations": len(all_formations),
                "formations_by_type": self._group_formations_by_type(all_formations),
                "recent_formations": all_formations[:10],  # Son 10 formasyon
                "signals": signals,
                "technical_indicators": self._get_current_indicators(df),
                "method": "Teknik Formasyon Motoru v2.0"
            }
            
            # Geçmişe kaydet
            self.formation_history.append(analysis_result)
            
            logger.info(f"✅ {symbol} formasyon analizi tamamlandı")
            logger.info(f"📊 Toplam formasyon: {len(all_formations)}")
            logger.info(f"🚨 Sinyal sayısı: {len(signals)}")
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"❌ {symbol} formasyon analiz hatası: {e}")
            return {"error": str(e)}
    
    def _group_formations_by_type(self, formations: List[Dict]) -> Dict:
        """Formasyonları türe göre grupla"""
        try:
            grouped = {}
            for formation in formations:
                formation_type = formation['type']
                if formation_type not in grouped:
                    grouped[formation_type] = []
                grouped[formation_type].append(formation)
            
            return grouped
            
        except Exception as e:
            logger.error(f"❌ Formasyon gruplama hatası: {e}")
            return {}
    
    def _generate_formation_signals(self, formations: List[Dict]) -> List[Dict]:
        """Formasyonlardan sinyal üret"""
        try:
            signals = []
            
            for formation in formations:
                # Sinyal gücü ve güveni kontrol et
                strength = formation.get('strength', 0)
                confidence = formation.get('confidence', 0)
                
                # Eşik değerleri
                strength_threshold = self.signal_thresholds.get(formation['type'], {}).get('strength', 0.6)
                confidence_threshold = self.signal_thresholds.get(formation['type'], {}).get('confidence', 0.7)
                
                if strength >= strength_threshold and confidence >= confidence_threshold:
                    # Sinyal türü belirleme
                    signal_type = self._determine_signal_type(formation)
                    
                    signals.append({
                        "symbol": formation.get('symbol', ''),
                        "signal_type": signal_type,
                        "formation_type": formation['type'],
                        "formation_subtype": formation.get('subtype', ''),
                        "date": formation['date'],
                        "price": formation['price'],
                        "strength": strength,
                        "confidence": confidence,
                        "signal_strength": (strength + confidence) / 2,
                        "description": self._get_signal_description(formation)
                    })
            
            return signals
            
        except Exception as e:
            logger.error(f"❌ Sinyal üretme hatası: {e}")
            return []
    
    def _determine_signal_type(self, formation: Dict) -> str:
        """Formasyon türüne göre sinyal türü belirle"""
        try:
            formation_type = formation['type']
            subtype = formation.get('subtype', '')
            
            if formation_type == "ema_cross":
                return "BUY" if subtype == "bullish" else "SELL"
            elif formation_type == "candlestick":
                pattern_type = formation.get('pattern_type', 'neutral')
                return "BUY" if pattern_type == "bullish" else "SELL" if pattern_type == "bearish" else "HOLD"
            elif formation_type == "harmonic":
                return "BUY"  # Harmonic patternler genellikle reversal
            elif formation_type == "fractal":
                return "BUY" if subtype == "break_high" else "SELL"
            else:
                return "HOLD"
                
        except Exception as e:
            logger.error(f"❌ Sinyal türü belirleme hatası: {e}")
            return "HOLD"
    
    def _get_signal_description(self, formation: Dict) -> str:
        """Sinyal açıklaması oluştur"""
        try:
            formation_type = formation['type']
            subtype = formation.get('subtype', '')
            
            descriptions = {
                "ema_cross": {
                    "bullish": "EMA 20, EMA 50'yi yukarı kesti - Yükseliş sinyali",
                    "bearish": "EMA 20, EMA 50'yi aşağı kesti - Düşüş sinyali"
                },
                "candlestick": {
                    "bullish_engulfing": "Bullish Engulfing pattern - Yükseliş sinyali",
                    "bearish_engulfing": "Bearish Engulfing pattern - Düşüş sinyali",
                    "hammer": "Hammer pattern - Yükseliş sinyali",
                    "shooting_star": "Shooting Star pattern - Düşüş sinyali",
                    "doji": "Doji pattern - Belirsizlik sinyali"
                },
                "harmonic": {
                    "gartley": "Gartley Harmonic pattern - Reversal sinyali",
                    "butterfly": "Butterfly Harmonic pattern - Reversal sinyali"
                },
                "fractal": {
                    "break_high": "Fractal High kırılımı - Yükseliş sinyali",
                    "break_low": "Fractal Low kırılımı - Düşüş sinyali"
                }
            }
            
            return descriptions.get(formation_type, {}).get(subtype, "Formasyon sinyali")
            
        except Exception as e:
            logger.error(f"❌ Sinyal açıklama hatası: {e}")
            return "Formasyon sinyali"
    
    def _get_current_indicators(self, df: pd.DataFrame) -> Dict:
        """Mevcut teknik indikatörleri getir"""
        try:
            if df.empty:
                return {}
            
            latest = df.iloc[-1]
            
            indicators = {
                "price": latest['Close'],
                "ema_20": latest.get('EMA_20', 0),
                "ema_50": latest.get('EMA_50', 0),
                "ema_100": latest.get('EMA_100', 0),
                "rsi": latest.get('RSI', 0),
                "macd": latest.get('MACD', 0),
                "macd_signal": latest.get('MACD_signal', 0),
                "macd_histogram": latest.get('MACD_hist', 0),
                "bb_upper": latest.get('BB_upper', 0),
                "bb_middle": latest.get('BB_middle', 0),
                "bb_lower": latest.get('BB_lower', 0),
                "atr": latest.get('ATR', 0),
                "volume": latest['Volume']
            }
            
            return indicators
            
        except Exception as e:
            logger.error(f"❌ Teknik indikatör hatası: {e}")
            return {}
    
    def get_formation_history(self) -> List[Dict]:
        """Formasyon geçmişini getir"""
        return self.formation_history
    
    def export_formation_report(self, symbol: str, format: str = "json") -> str:
        """Formasyon raporunu dışa aktar"""
        try:
            # Formasyon analizi yap
            analysis = self.analyze_all_formations(symbol)
            
            if "error" in analysis:
                return f"Hata: {analysis['error']}"
            
            if format == "json":
                return json.dumps(analysis, indent=2, ensure_ascii=False)
            elif format == "csv":
                # CSV format için basit implementasyon
                csv_data = "Type,Subtype,Date,Price,Strength,Confidence,Signal_Type,Description\n"
                for formation in analysis["recent_formations"]:
                    csv_data += f"{formation['type']},{formation.get('subtype', '')},"
                    csv_data += f"{formation['date']},{formation['price']},"
                    csv_data += f"{formation['strength']},{formation['confidence']},"
                    csv_data += f"{self._determine_signal_type(formation)},"
                    csv_data += f"{self._get_signal_description(formation)}\n"
                return csv_data
            else:
                return "Desteklenmeyen format"
                
        except Exception as e:
            logger.error(f"❌ Formasyon raporu dışa aktarma hatası: {e}")
            return "Rapor oluşturulamadı"

# Test fonksiyonu
if __name__ == "__main__":
    engine = TechnicalFormationEngine()
    
    # Test formasyon analizi
    logger.info("🧪 Teknik Formasyon Motoru test başlatılıyor...")
    
    # Test hissesi
    test_symbol = "GARAN.IS"
    result = engine.analyze_all_formations(test_symbol)
    logger.info(f"📊 {test_symbol} formasyon analizi: {result}")
    
    # Rapor dışa aktarma
    report = engine.export_formation_report(test_symbol, "json")
    logger.info(f"📋 Formasyon raporu: {report[:200]}...")
