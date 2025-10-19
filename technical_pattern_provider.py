"""
BIST AI Smart Trader - Teknik Formasyon Motoru
ta-lib entegrasyonu ile candlestick, harmonic ve teknik formasyon tespiti
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
import yfinance as yf

# ta-lib için mock implementasyon (gerçek kütüphane yoksa)
try:
    import talib
    TALIB_AVAILABLE = True
except ImportError:
    TALIB_AVAILABLE = False
    print("⚠️ ta-lib kütüphanesi bulunamadı, mock implementasyon kullanılıyor")

class TechnicalPatternProvider:
    def __init__(self):
        # Formasyon türleri
        self.pattern_types = {
            'candlestick': {
                'bullish': [
                    'BULLISH_ENGULFING', 'HAMMER', 'INVERTED_HAMMER', 'PIERCING_LINE',
                    'MORNING_STAR', 'THREE_WHITE_SOLDIERS', 'BULLISH_HARAMI',
                    'BULLISH_BELT_HOLD', 'BULLISH_COUNTERATTACK', 'BULLISH_DOJI_STAR'
                ],
                'bearish': [
                    'BEARISH_ENGULFING', 'HANGING_MAN', 'SHOOTING_STAR', 'DARK_CLOUD_COVER',
                    'EVENING_STAR', 'THREE_BLACK_CROWS', 'BEARISH_HARAMI',
                    'BEARISH_BELT_HOLD', 'BEARISH_COUNTERATTACK', 'BEARISH_DOJI_STAR'
                ],
                'neutral': [
                    'DOJI', 'SPINNING_TOP', 'HIGH_WAVE', 'LONG_LEGGED_DOJI',
                    'GRAVESTONE_DOJI', 'DRAGONFLY_DOJI'
                ]
            },
            'harmonic': [
                'GARTLEY', 'BUTTERFLY', 'BAT', 'CRAB', 'CYPHER', 'SHARK',
                '5_0', 'ALTERNATING_BAT', 'DEEP_CRAB', 'REVERSE_CRAB'
            ],
            'technical': [
                'HEAD_AND_SHOULDERS', 'INVERSE_HEAD_AND_SHOULDERS', 'DOUBLE_TOP',
                'DOUBLE_BOTTOM', 'TRIPLE_TOP', 'TRIPLE_BOTTOM', 'ASCENDING_TRIANGLE',
                'DESCENDING_TRIANGLE', 'SYMMETRICAL_TRIANGLE', 'FLAG', 'PENNANT',
                'WEDGE', 'RECTANGLE', 'DIAMOND'
            ],
            'trend': [
                'EMA_CROSS_UP', 'EMA_CROSS_DOWN', 'MACD_BULLISH_CROSS',
                'MACD_BEARISH_CROSS', 'RSI_OVERSOLD', 'RSI_OVERBOUGHT',
                'BOLLINGER_BOUNCE', 'BOLLINGER_SQUEEZE', 'VOLUME_SPIKE'
            ]
        }
        
        # Formasyon güven skorları
        self.pattern_confidence = {
            'HIGH': 0.8,
            'MEDIUM': 0.6,
            'LOW': 0.4
        }
        
        # Fibonacci seviyeleri
        self.fibonacci_levels = [0.236, 0.382, 0.5, 0.618, 0.786, 1.0, 1.272, 1.618]
    
    def detect_candlestick_patterns(self, ohlc_data: pd.DataFrame) -> List[Dict]:
        """Candlestick formasyonlarını tespit et"""
        try:
            patterns = []
            
            if TALIB_AVAILABLE:
                patterns = self._detect_candlestick_talib(ohlc_data)
            else:
                patterns = self._detect_candlestick_mock(ohlc_data)
            
            return patterns
            
        except Exception as e:
            print(f"⚠️ Candlestick formasyon tespiti hatası: {e}")
            return []
    
    def _detect_candlestick_talib(self, ohlc_data: pd.DataFrame) -> List[Dict]:
        """ta-lib ile candlestick formasyonları"""
        try:
            patterns = []
            open_prices = ohlc_data['Open'].values
            high_prices = ohlc_data['High'].values
            low_prices = ohlc_data['Low'].values
            close_prices = ohlc_data['Close'].values
            
            # Bullish patterns
            bullish_patterns = {
                'BULLISH_ENGULFING': talib.CDLENGULFING(open_prices, high_prices, low_prices, close_prices),
                'HAMMER': talib.CDLHAMMER(open_prices, high_prices, low_prices, close_prices),
                'INVERTED_HAMMER': talib.CDLINVERTEDHAMMER(open_prices, high_prices, low_prices, close_prices),
                'PIERCING_LINE': talib.CDLPIERCING(open_prices, high_prices, low_prices, close_prices),
                'MORNING_STAR': talib.CDLMORNINGSTAR(open_prices, high_prices, low_prices, close_prices),
                'THREE_WHITE_SOLDIERS': talib.CDL3WHITESOLDIERS(open_prices, high_prices, low_prices, close_prices),
                'BULLISH_HARAMI': talib.CDLHARAMI(open_prices, high_prices, low_prices, close_prices)
            }
            
            # Bearish patterns
            bearish_patterns = {
                'BEARISH_ENGULFING': talib.CDLENGULFING(open_prices, high_prices, low_prices, close_prices),
                'HANGING_MAN': talib.CDLHANGINGMAN(open_prices, high_prices, low_prices, close_prices),
                'SHOOTING_STAR': talib.CDLSHOOTINGSTAR(open_prices, high_prices, low_prices, close_prices),
                'DARK_CLOUD_COVER': talib.CDLDARKCLOUDCOVER(open_prices, high_prices, low_prices, close_prices),
                'EVENING_STAR': talib.CDLEVENINGSTAR(open_prices, high_prices, low_prices, close_prices),
                'THREE_BLACK_CROWS': talib.CDL3BLACKCROWS(open_prices, high_prices, low_prices, close_prices),
                'BEARISH_HARAMI': talib.CDLHARAMI(open_prices, high_prices, low_prices, close_prices)
            }
            
            # Neutral patterns
            neutral_patterns = {
                'DOJI': talib.CDLDOJI(open_prices, high_prices, low_prices, close_prices),
                'SPINNING_TOP': talib.CDLSPINNINGTOP(open_prices, high_prices, low_prices, close_prices),
                'HIGH_WAVE': talib.CDLHIGHWAVE(open_prices, high_prices, low_prices, close_prices)
            }
            
            # Son 5 günü kontrol et
            for i in range(max(0, len(ohlc_data) - 5), len(ohlc_data)):
                timestamp = ohlc_data.index[i]
                
                # Bullish patterns
                for pattern_name, pattern_data in bullish_patterns.items():
                    if pattern_data[i] > 0:
                        patterns.append({
                            'pattern': pattern_name,
                            'type': 'candlestick',
                            'direction': 'bullish',
                            'confidence': self.pattern_confidence['HIGH'],
                            'timestamp': timestamp.isoformat() if hasattr(timestamp, 'isoformat') else str(timestamp),
                            'price': close_prices[i],
                            'description': self._get_pattern_description(pattern_name)
                        })
                
                # Bearish patterns
                for pattern_name, pattern_data in bearish_patterns.items():
                    if pattern_data[i] < 0:
                        patterns.append({
                            'pattern': pattern_name,
                            'type': 'candlestick',
                            'direction': 'bearish',
                            'confidence': self.pattern_confidence['HIGH'],
                            'timestamp': timestamp.isoformat() if hasattr(timestamp, 'isoformat') else str(timestamp),
                            'price': close_prices[i],
                            'description': self._get_pattern_description(pattern_name)
                        })
                
                # Neutral patterns
                for pattern_name, pattern_data in neutral_patterns.items():
                    if pattern_data[i] != 0:
                        patterns.append({
                            'pattern': pattern_name,
                            'type': 'candlestick',
                            'direction': 'neutral',
                            'confidence': self.pattern_confidence['MEDIUM'],
                            'timestamp': timestamp.isoformat() if hasattr(timestamp, 'isoformat') else str(timestamp),
                            'price': close_prices[i],
                            'description': self._get_pattern_description(pattern_name)
                        })
            
            return patterns
            
        except Exception as e:
            print(f"⚠️ ta-lib candlestick hatası: {e}")
            return self._detect_candlestick_mock(ohlc_data)
    
    def _detect_candlestick_mock(self, ohlc_data: pd.DataFrame) -> List[Dict]:
        """Mock candlestick formasyonları"""
        try:
            patterns = []
            
            # Son 5 günü kontrol et
            for i in range(max(0, len(ohlc_data) - 5), len(ohlc_data)):
                timestamp = ohlc_data.index[i]
                row = ohlc_data.iloc[i]
                
                # Basit formasyon tespiti
                body_size = abs(row['Close'] - row['Open'])
                total_range = row['High'] - row['Low']
                upper_shadow = row['High'] - max(row['Open'], row['Close'])
                lower_shadow = min(row['Open'], row['Close']) - row['Low']
                
                # Hammer tespiti
                if lower_shadow > 2 * body_size and upper_shadow < body_size * 0.5:
                        patterns.append({
                            'pattern': 'HAMMER',
                            'type': 'candlestick',
                            'direction': 'bullish',
                            'confidence': self.pattern_confidence['HIGH'],
                            'timestamp': timestamp.isoformat() if hasattr(timestamp, 'isoformat') else str(timestamp),
                            'price': float(row['Close']),
                            'description': 'Hammer: Güçlü alım sinyali'
                        })
                
                # Shooting Star tespiti
                elif upper_shadow > 2 * body_size and lower_shadow < body_size * 0.5:
                    patterns.append({
                        'pattern': 'SHOOTING_STAR',
                        'type': 'candlestick',
                        'direction': 'bearish',
                        'confidence': self.pattern_confidence['HIGH'],
                        'timestamp': timestamp.isoformat() if hasattr(timestamp, 'isoformat') else str(timestamp),
                        'price': float(row['Close']),
                        'description': 'Shooting Star: Güçlü satım sinyali'
                    })
                
                # Doji tespiti
                elif body_size < total_range * 0.1:
                    patterns.append({
                        'pattern': 'DOJI',
                        'type': 'candlestick',
                        'direction': 'neutral',
                        'confidence': self.pattern_confidence['MEDIUM'],
                        'timestamp': timestamp.isoformat() if hasattr(timestamp, 'isoformat') else str(timestamp),
                        'price': row['Close'],
                        'description': 'Doji: Belirsizlik, trend değişimi bekleniyor'
                    })
                
                # Engulfing tespiti (basit)
                if i > 0:
                    prev_row = ohlc_data.iloc[i-1]
                    prev_body = abs(prev_row['Close'] - prev_row['Open'])
                    current_body = abs(row['Close'] - row['Open'])
                    
                    # Bullish Engulfing
                    if (prev_row['Close'] < prev_row['Open'] and  # Önceki mum bearish
                        row['Close'] > row['Open'] and  # Şimdiki mum bullish
                        row['Open'] < prev_row['Close'] and  # Açılış önceki kapanıştan düşük
                        row['Close'] > prev_row['Open']):  # Kapanış önceki açılıştan yüksek
                        
                        patterns.append({
                            'pattern': 'BULLISH_ENGULFING',
                            'type': 'candlestick',
                            'direction': 'bullish',
                            'confidence': self.pattern_confidence['HIGH'],
                            'timestamp': timestamp.isoformat() if hasattr(timestamp, 'isoformat') else str(timestamp),
                            'price': row['Close'],
                            'description': 'Bullish Engulfing: Güçlü alım sinyali'
                        })
                    
                    # Bearish Engulfing
                    elif (prev_row['Close'] > prev_row['Open'] and  # Önceki mum bullish
                          row['Close'] < row['Open'] and  # Şimdiki mum bearish
                          row['Open'] > prev_row['Close'] and  # Açılış önceki kapanıştan yüksek
                          row['Close'] < prev_row['Open']):  # Kapanış önceki açılıştan düşük
                        
                        patterns.append({
                            'pattern': 'BEARISH_ENGULFING',
                            'type': 'candlestick',
                            'direction': 'bearish',
                            'confidence': self.pattern_confidence['HIGH'],
                            'timestamp': timestamp.isoformat() if hasattr(timestamp, 'isoformat') else str(timestamp),
                            'price': row['Close'],
                            'description': 'Bearish Engulfing: Güçlü satım sinyali'
                        })
            
            return patterns
            
        except Exception as e:
            print(f"⚠️ Mock candlestick hatası: {e}")
            return []
    
    def detect_harmonic_patterns(self, ohlc_data: pd.DataFrame) -> List[Dict]:
        """Harmonic formasyonlarını tespit et"""
        try:
            patterns = []
            
            # Son 20 günü kontrol et (harmonic patterns için daha fazla veri gerekli)
            if len(ohlc_data) < 20:
                return patterns
            
            # Swing points bul
            swing_points = self._find_swing_points(ohlc_data)
            
            if len(swing_points) < 4:
                return patterns
            
            # Gartley pattern tespiti
            gartley_patterns = self._detect_gartley_pattern(swing_points, ohlc_data)
            patterns.extend(gartley_patterns)
            
            # Butterfly pattern tespiti
            butterfly_patterns = self._detect_butterfly_pattern(swing_points, ohlc_data)
            patterns.extend(butterfly_patterns)
            
            # Bat pattern tespiti
            bat_patterns = self._detect_bat_pattern(swing_points, ohlc_data)
            patterns.extend(bat_patterns)
            
            return patterns
            
        except Exception as e:
            print(f"⚠️ Harmonic formasyon tespiti hatası: {e}")
            return []
    
    def _find_swing_points(self, ohlc_data: pd.DataFrame) -> List[Dict]:
        """Swing noktalarını bul"""
        try:
            swing_points = []
            highs = ohlc_data['High'].values
            lows = ohlc_data['Low'].values
            
            # Basit swing point tespiti
            for i in range(2, len(ohlc_data) - 2):
                # Swing High
                if (highs[i] > highs[i-1] and highs[i] > highs[i-2] and
                    highs[i] > highs[i+1] and highs[i] > highs[i+2]):
                    swing_points.append({
                        'type': 'high',
                        'index': i,
                        'price': highs[i],
                        'timestamp': ohlc_data.index[i]
                    })
                
                # Swing Low
                elif (lows[i] < lows[i-1] and lows[i] < lows[i-2] and
                      lows[i] < lows[i+1] and lows[i] < lows[i+2]):
                    swing_points.append({
                        'type': 'low',
                        'index': i,
                        'price': lows[i],
                        'timestamp': ohlc_data.index[i]
                    })
            
            return swing_points
            
        except Exception as e:
            print(f"⚠️ Swing point tespiti hatası: {e}")
            return []
    
    def _detect_gartley_pattern(self, swing_points: List[Dict], ohlc_data: pd.DataFrame) -> List[Dict]:
        """Gartley pattern tespiti"""
        try:
            patterns = []
            
            # En son 4 swing point'i al
            if len(swing_points) < 4:
                return patterns
            
            recent_swings = swing_points[-4:]
            
            # Gartley pattern: XABCD
            if (recent_swings[0]['type'] == 'high' and  # X
                recent_swings[1]['type'] == 'low' and   # A
                recent_swings[2]['type'] == 'high' and  # B
                recent_swings[3]['type'] == 'low'):     # C
                
                X, A, B, C = recent_swings[0], recent_swings[1], recent_swings[2], recent_swings[3]
                
                # Fibonacci seviyelerini kontrol et
                AB_retracement = abs(B['price'] - A['price']) / abs(X['price'] - A['price'])
                BC_retracement = abs(C['price'] - B['price']) / abs(B['price'] - A['price'])
                
                # Gartley koşulları
                if (0.618 <= AB_retracement <= 0.786 and  # AB = 61.8% - 78.6% of XA
                    0.382 <= BC_retracement <= 0.618):    # BC = 38.2% - 61.8% of AB
                    
                    patterns.append({
                        'pattern': 'GARTLEY',
                        'type': 'harmonic',
                        'direction': 'bullish',
                        'confidence': self.pattern_confidence['HIGH'],
                        'timestamp': C['timestamp'],
                        'price': C['price'],
                        'description': f'Gartley Pattern: AB={AB_retracement:.3f}, BC={BC_retracement:.3f}',
                        'fibonacci_levels': {
                            'AB_retracement': AB_retracement,
                            'BC_retracement': BC_retracement
                        }
                    })
            
            return patterns
            
        except Exception as e:
            print(f"⚠️ Gartley pattern hatası: {e}")
            return []
    
    def _detect_butterfly_pattern(self, swing_points: List[Dict], ohlc_data: pd.DataFrame) -> List[Dict]:
        """Butterfly pattern tespiti"""
        try:
            patterns = []
            
            if len(swing_points) < 4:
                return patterns
            
            recent_swings = swing_points[-4:]
            
            # Butterfly pattern: XABCD
            if (recent_swings[0]['type'] == 'high' and
                recent_swings[1]['type'] == 'low' and
                recent_swings[2]['type'] == 'high' and
                recent_swings[3]['type'] == 'low'):
                
                X, A, B, C = recent_swings[0], recent_swings[1], recent_swings[2], recent_swings[3]
                
                AB_retracement = abs(B['price'] - A['price']) / abs(X['price'] - A['price'])
                BC_retracement = abs(C['price'] - B['price']) / abs(B['price'] - A['price'])
                
                # Butterfly koşulları
                if (0.786 <= AB_retracement <= 1.0 and    # AB = 78.6% - 100% of XA
                    0.382 <= BC_retracement <= 0.618):    # BC = 38.2% - 61.8% of AB
                    
                    patterns.append({
                        'pattern': 'BUTTERFLY',
                        'type': 'harmonic',
                        'direction': 'bullish',
                        'confidence': self.pattern_confidence['HIGH'],
                        'timestamp': C['timestamp'],
                        'price': C['price'],
                        'description': f'Butterfly Pattern: AB={AB_retracement:.3f}, BC={BC_retracement:.3f}',
                        'fibonacci_levels': {
                            'AB_retracement': AB_retracement,
                            'BC_retracement': BC_retracement
                        }
                    })
            
            return patterns
            
        except Exception as e:
            print(f"⚠️ Butterfly pattern hatası: {e}")
            return []
    
    def _detect_bat_pattern(self, swing_points: List[Dict], ohlc_data: pd.DataFrame) -> List[Dict]:
        """Bat pattern tespiti"""
        try:
            patterns = []
            
            if len(swing_points) < 4:
                return patterns
            
            recent_swings = swing_points[-4:]
            
            # Bat pattern: XABCD
            if (recent_swings[0]['type'] == 'high' and
                recent_swings[1]['type'] == 'low' and
                recent_swings[2]['type'] == 'high' and
                recent_swings[3]['type'] == 'low'):
                
                X, A, B, C = recent_swings[0], recent_swings[1], recent_swings[2], recent_swings[3]
                
                AB_retracement = abs(B['price'] - A['price']) / abs(X['price'] - A['price'])
                BC_retracement = abs(C['price'] - B['price']) / abs(B['price'] - A['price'])
                
                # Bat koşulları
                if (0.382 <= AB_retracement <= 0.5 and     # AB = 38.2% - 50% of XA
                    0.382 <= BC_retracement <= 0.618):    # BC = 38.2% - 61.8% of AB
                    
                    patterns.append({
                        'pattern': 'BAT',
                        'type': 'harmonic',
                        'direction': 'bullish',
                        'confidence': self.pattern_confidence['HIGH'],
                        'timestamp': C['timestamp'],
                        'price': C['price'],
                        'description': f'Bat Pattern: AB={AB_retracement:.3f}, BC={BC_retracement:.3f}',
                        'fibonacci_levels': {
                            'AB_retracement': AB_retracement,
                            'BC_retracement': BC_retracement
                        }
                    })
            
            return patterns
            
        except Exception as e:
            print(f"⚠️ Bat pattern hatası: {e}")
            return []
    
    def detect_technical_patterns(self, ohlc_data: pd.DataFrame) -> List[Dict]:
        """Teknik formasyonları tespit et"""
        try:
            patterns = []
            
            # Head and Shoulders tespiti
            hns_patterns = self._detect_head_and_shoulders(ohlc_data)
            patterns.extend(hns_patterns)
            
            # Double Top/Bottom tespiti
            double_patterns = self._detect_double_top_bottom(ohlc_data)
            patterns.extend(double_patterns)
            
            # Triangle tespiti
            triangle_patterns = self._detect_triangles(ohlc_data)
            patterns.extend(triangle_patterns)
            
            return patterns
            
        except Exception as e:
            print(f"⚠️ Teknik formasyon tespiti hatası: {e}")
            return []
    
    def _detect_head_and_shoulders(self, ohlc_data: pd.DataFrame) -> List[Dict]:
        """Head and Shoulders pattern tespiti"""
        try:
            patterns = []
            
            if len(ohlc_data) < 20:
                return patterns
            
            highs = ohlc_data['High'].values
            
            # Basit Head and Shoulders tespiti
            for i in range(10, len(ohlc_data) - 10):
                # Sol omuz, baş, sağ omuz
                left_shoulder = np.max(highs[i-10:i-5])
                head = np.max(highs[i-5:i+5])
                right_shoulder = np.max(highs[i+5:i+10])
                
                # Head and Shoulders koşulları
                if (head > left_shoulder and head > right_shoulder and
                    abs(left_shoulder - right_shoulder) / head < 0.05):  # Omuzlar benzer yükseklikte
                    
                    patterns.append({
                        'pattern': 'HEAD_AND_SHOULDERS',
                        'type': 'technical',
                        'direction': 'bearish',
                        'confidence': self.pattern_confidence['HIGH'],
                        'timestamp': ohlc_data.index[i],
                        'price': ohlc_data.iloc[i]['Close'],
                        'description': f'Head and Shoulders: Baş={head:.2f}, Sol Omuz={left_shoulder:.2f}, Sağ Omuz={right_shoulder:.2f}'
                    })
            
            return patterns
            
        except Exception as e:
            print(f"⚠️ Head and Shoulders hatası: {e}")
            return []
    
    def _detect_double_top_bottom(self, ohlc_data: pd.DataFrame) -> List[Dict]:
        """Double Top/Bottom pattern tespiti"""
        try:
            patterns = []
            
            if len(ohlc_data) < 20:
                return patterns
            
            highs = ohlc_data['High'].values
            lows = ohlc_data['Low'].values
            
            # Double Top tespiti
            for i in range(10, len(ohlc_data) - 10):
                first_peak = np.max(highs[i-10:i])
                second_peak = np.max(highs[i:i+10])
                
                if abs(first_peak - second_peak) / first_peak < 0.02:  # %2 tolerans
                    patterns.append({
                        'pattern': 'DOUBLE_TOP',
                        'type': 'technical',
                        'direction': 'bearish',
                        'confidence': self.pattern_confidence['HIGH'],
                        'timestamp': ohlc_data.index[i],
                        'price': ohlc_data.iloc[i]['Close'],
                        'description': f'Double Top: İlk Tepe={first_peak:.2f}, İkinci Tepe={second_peak:.2f}'
                    })
            
            # Double Bottom tespiti
            for i in range(10, len(ohlc_data) - 10):
                first_trough = np.min(lows[i-10:i])
                second_trough = np.min(lows[i:i+10])
                
                if abs(first_trough - second_trough) / first_trough < 0.02:  # %2 tolerans
                    patterns.append({
                        'pattern': 'DOUBLE_BOTTOM',
                        'type': 'technical',
                        'direction': 'bullish',
                        'confidence': self.pattern_confidence['HIGH'],
                        'timestamp': ohlc_data.index[i],
                        'price': ohlc_data.iloc[i]['Close'],
                        'description': f'Double Bottom: İlk Dip={first_trough:.2f}, İkinci Dip={second_trough:.2f}'
                    })
            
            return patterns
            
        except Exception as e:
            print(f"⚠️ Double Top/Bottom hatası: {e}")
            return []
    
    def _detect_triangles(self, ohlc_data: pd.DataFrame) -> List[Dict]:
        """Triangle pattern tespiti"""
        try:
            patterns = []
            
            if len(ohlc_data) < 15:
                return patterns
            
            # Basit triangle tespiti
            for i in range(15, len(ohlc_data)):
                recent_data = ohlc_data.iloc[i-15:i]
                
                # Ascending Triangle: Yüksek seviyeler sabit, düşük seviyeler yükseliyor
                highs = recent_data['High'].values
                lows = recent_data['Low'].values
                
                high_trend = np.polyfit(range(len(highs)), highs, 1)[0]
                low_trend = np.polyfit(range(len(lows)), lows, 1)[0]
                
                if abs(high_trend) < 0.1 and low_trend > 0.1:  # Ascending Triangle
                    patterns.append({
                        'pattern': 'ASCENDING_TRIANGLE',
                        'type': 'technical',
                        'direction': 'bullish',
                        'confidence': self.pattern_confidence['MEDIUM'],
                        'timestamp': ohlc_data.index[i],
                        'price': ohlc_data.iloc[i]['Close'],
                        'description': f'Ascending Triangle: Yüksek trend={high_trend:.3f}, Düşük trend={low_trend:.3f}'
                    })
                
                elif abs(low_trend) < 0.1 and high_trend < -0.1:  # Descending Triangle
                    patterns.append({
                        'pattern': 'DESCENDING_TRIANGLE',
                        'type': 'technical',
                        'direction': 'bearish',
                        'confidence': self.pattern_confidence['MEDIUM'],
                        'timestamp': ohlc_data.index[i],
                        'price': ohlc_data.iloc[i]['Close'],
                        'description': f'Descending Triangle: Yüksek trend={high_trend:.3f}, Düşük trend={low_trend:.3f}'
                    })
            
            return patterns
            
        except Exception as e:
            print(f"⚠️ Triangle hatası: {e}")
            return []
    
    def detect_trend_patterns(self, ohlc_data: pd.DataFrame) -> List[Dict]:
        """Trend formasyonlarını tespit et"""
        try:
            patterns = []
            
            if len(ohlc_data) < 20:
                return patterns
            
            # EMA Cross patterns
            ema_patterns = self._detect_ema_cross(ohlc_data)
            patterns.extend(ema_patterns)
            
            # MACD patterns
            macd_patterns = self._detect_macd_patterns(ohlc_data)
            patterns.extend(macd_patterns)
            
            # RSI patterns
            rsi_patterns = self._detect_rsi_patterns(ohlc_data)
            patterns.extend(rsi_patterns)
            
            # Bollinger Bands patterns
            bb_patterns = self._detect_bollinger_patterns(ohlc_data)
            patterns.extend(bb_patterns)
            
            return patterns
            
        except Exception as e:
            print(f"⚠️ Trend formasyon tespiti hatası: {e}")
            return []
    
    def _detect_ema_cross(self, ohlc_data: pd.DataFrame) -> List[Dict]:
        """EMA Cross pattern tespiti"""
        try:
            patterns = []
            
            # EMA hesapla
            ema12 = ohlc_data['Close'].ewm(span=12).mean()
            ema26 = ohlc_data['Close'].ewm(span=26).mean()
            
            # Son 5 günü kontrol et
            for i in range(max(0, len(ohlc_data) - 5), len(ohlc_data)):
                if i == 0:
                    continue
                
                # Bullish Cross: EMA12 EMA26'yı yukarı kesiyor
                if (ema12.iloc[i] > ema26.iloc[i] and 
                    ema12.iloc[i-1] <= ema26.iloc[i-1]):
                    
                    patterns.append({
                        'pattern': 'EMA_CROSS_UP',
                        'type': 'trend',
                        'direction': 'bullish',
                        'confidence': self.pattern_confidence['MEDIUM'],
                        'timestamp': ohlc_data.index[i],
                        'price': ohlc_data.iloc[i]['Close'],
                        'description': f'EMA Cross Up: EMA12={ema12.iloc[i]:.2f}, EMA26={ema26.iloc[i]:.2f}'
                    })
                
                # Bearish Cross: EMA12 EMA26'yı aşağı kesiyor
                elif (ema12.iloc[i] < ema26.iloc[i] and 
                      ema12.iloc[i-1] >= ema26.iloc[i-1]):
                    
                    patterns.append({
                        'pattern': 'EMA_CROSS_DOWN',
                        'type': 'trend',
                        'direction': 'bearish',
                        'confidence': self.pattern_confidence['MEDIUM'],
                        'timestamp': ohlc_data.index[i],
                        'price': ohlc_data.iloc[i]['Close'],
                        'description': f'EMA Cross Down: EMA12={ema12.iloc[i]:.2f}, EMA26={ema26.iloc[i]:.2f}'
                    })
            
            return patterns
            
        except Exception as e:
            print(f"⚠️ EMA Cross hatası: {e}")
            return []
    
    def _detect_macd_patterns(self, ohlc_data: pd.DataFrame) -> List[Dict]:
        """MACD pattern tespiti"""
        try:
            patterns = []
            
            # MACD hesapla
            ema12 = ohlc_data['Close'].ewm(span=12).mean()
            ema26 = ohlc_data['Close'].ewm(span=26).mean()
            macd_line = ema12 - ema26
            signal_line = macd_line.ewm(span=9).mean()
            
            # Son 5 günü kontrol et
            for i in range(max(0, len(ohlc_data) - 5), len(ohlc_data)):
                if i == 0:
                    continue
                
                # Bullish Cross: MACD Signal'i yukarı kesiyor
                if (macd_line.iloc[i] > signal_line.iloc[i] and 
                    macd_line.iloc[i-1] <= signal_line.iloc[i-1]):
                    
                    patterns.append({
                        'pattern': 'MACD_BULLISH_CROSS',
                        'type': 'trend',
                        'direction': 'bullish',
                        'confidence': self.pattern_confidence['MEDIUM'],
                        'timestamp': ohlc_data.index[i],
                        'price': ohlc_data.iloc[i]['Close'],
                        'description': f'MACD Bullish Cross: MACD={macd_line.iloc[i]:.3f}, Signal={signal_line.iloc[i]:.3f}'
                    })
                
                # Bearish Cross: MACD Signal'i aşağı kesiyor
                elif (macd_line.iloc[i] < signal_line.iloc[i] and 
                      macd_line.iloc[i-1] >= signal_line.iloc[i-1]):
                    
                    patterns.append({
                        'pattern': 'MACD_BEARISH_CROSS',
                        'type': 'trend',
                        'direction': 'bearish',
                        'confidence': self.pattern_confidence['MEDIUM'],
                        'timestamp': ohlc_data.index[i],
                        'price': ohlc_data.iloc[i]['Close'],
                        'description': f'MACD Bearish Cross: MACD={macd_line.iloc[i]:.3f}, Signal={signal_line.iloc[i]:.3f}'
                    })
            
            return patterns
            
        except Exception as e:
            print(f"⚠️ MACD pattern hatası: {e}")
            return []
    
    def _detect_rsi_patterns(self, ohlc_data: pd.DataFrame) -> List[Dict]:
        """RSI pattern tespiti"""
        try:
            patterns = []
            
            # RSI hesapla
            delta = ohlc_data['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            
            # Son 5 günü kontrol et
            for i in range(max(0, len(ohlc_data) - 5), len(ohlc_data)):
                if i == 0:
                    continue
                
                current_rsi = rsi.iloc[i]
                
                # RSI Oversold
                if current_rsi < 30 and rsi.iloc[i-1] >= 30:
                    patterns.append({
                        'pattern': 'RSI_OVERSOLD',
                        'type': 'trend',
                        'direction': 'bullish',
                        'confidence': self.pattern_confidence['MEDIUM'],
                        'timestamp': ohlc_data.index[i],
                        'price': ohlc_data.iloc[i]['Close'],
                        'description': f'RSI Oversold: RSI={current_rsi:.1f}'
                    })
                
                # RSI Overbought
                elif current_rsi > 70 and rsi.iloc[i-1] <= 70:
                    patterns.append({
                        'pattern': 'RSI_OVERBOUGHT',
                        'type': 'trend',
                        'direction': 'bearish',
                        'confidence': self.pattern_confidence['MEDIUM'],
                        'timestamp': ohlc_data.index[i],
                        'price': ohlc_data.iloc[i]['Close'],
                        'description': f'RSI Overbought: RSI={current_rsi:.1f}'
                    })
            
            return patterns
            
        except Exception as e:
            print(f"⚠️ RSI pattern hatası: {e}")
            return []
    
    def _detect_bollinger_patterns(self, ohlc_data: pd.DataFrame) -> List[Dict]:
        """Bollinger Bands pattern tespiti"""
        try:
            patterns = []
            
            # Bollinger Bands hesapla
            sma20 = ohlc_data['Close'].rolling(window=20).mean()
            std20 = ohlc_data['Close'].rolling(window=20).std()
            upper_band = sma20 + (std20 * 2)
            lower_band = sma20 - (std20 * 2)
            
            # Son 5 günü kontrol et
            for i in range(max(0, len(ohlc_data) - 5), len(ohlc_data)):
                current_price = ohlc_data.iloc[i]['Close']
                current_upper = upper_band.iloc[i]
                current_lower = lower_band.iloc[i]
                
                # Bollinger Bounce (alt banda dokunma)
                if current_price <= current_lower * 1.01:  # %1 tolerans
                    patterns.append({
                        'pattern': 'BOLLINGER_BOUNCE',
                        'type': 'trend',
                        'direction': 'bullish',
                        'confidence': self.pattern_confidence['MEDIUM'],
                        'timestamp': ohlc_data.index[i],
                        'price': current_price,
                        'description': f'Bollinger Bounce: Fiyat={current_price:.2f}, Alt Band={current_lower:.2f}'
                    })
                
                # Bollinger Squeeze (bantlar daralıyor)
                if i > 0:
                    band_width = (current_upper - current_lower) / sma20.iloc[i]
                    prev_band_width = (upper_band.iloc[i-1] - lower_band.iloc[i-1]) / sma20.iloc[i-1]
                    
                    if band_width < 0.1 and band_width < prev_band_width:  # Daralan bantlar
                        patterns.append({
                            'pattern': 'BOLLINGER_SQUEEZE',
                            'type': 'trend',
                            'direction': 'neutral',
                            'confidence': self.pattern_confidence['LOW'],
                            'timestamp': ohlc_data.index[i],
                            'price': current_price,
                            'description': f'Bollinger Squeeze: Band Genişliği={band_width:.3f}'
                        })
            
            return patterns
            
        except Exception as e:
            print(f"⚠️ Bollinger pattern hatası: {e}")
            return []
    
    def get_pattern_description(self, pattern_name: str) -> str:
        """Formasyon açıklaması"""
        descriptions = {
            'HAMMER': 'Hammer: Güçlü alım sinyali, dip noktasında tersine dönüş',
            'SHOOTING_STAR': 'Shooting Star: Güçlü satım sinyali, tepe noktasında tersine dönüş',
            'DOJI': 'Doji: Belirsizlik, trend değişimi bekleniyor',
            'BULLISH_ENGULFING': 'Bullish Engulfing: Güçlü alım sinyali, önceki mumu sarıyor',
            'BEARISH_ENGULFING': 'Bearish Engulfing: Güçlü satım sinyali, önceki mumu sarıyor',
            'GARTLEY': 'Gartley: Fibonacci seviyelerinde harmonic pattern',
            'BUTTERFLY': 'Butterfly: Fibonacci seviyelerinde harmonic pattern',
            'BAT': 'Bat: Fibonacci seviyelerinde harmonic pattern',
            'HEAD_AND_SHOULDERS': 'Head and Shoulders: Güçlü satım sinyali',
            'DOUBLE_TOP': 'Double Top: Güçlü satım sinyali, iki tepe',
            'DOUBLE_BOTTOM': 'Double Bottom: Güçlü alım sinyali, iki dip',
            'ASCENDING_TRIANGLE': 'Ascending Triangle: Yükseliş devamı bekleniyor',
            'DESCENDING_TRIANGLE': 'Descending Triangle: Düşüş devamı bekleniyor',
            'EMA_CROSS_UP': 'EMA Cross Up: Trend değişimi, alım sinyali',
            'EMA_CROSS_DOWN': 'EMA Cross Down: Trend değişimi, satım sinyali',
            'MACD_BULLISH_CROSS': 'MACD Bullish Cross: Momentum artışı',
            'MACD_BEARISH_CROSS': 'MACD Bearish Cross: Momentum azalışı',
            'RSI_OVERSOLD': 'RSI Oversold: Aşırı satım, alım fırsatı',
            'RSI_OVERBOUGHT': 'RSI Overbought: Aşırı alım, satım fırsatı',
            'BOLLINGER_BOUNCE': 'Bollinger Bounce: Alt banda dokunma, yükseliş',
            'BOLLINGER_SQUEEZE': 'Bollinger Squeeze: Volatilite azalışı, patlama bekleniyor'
        }
        
        return descriptions.get(pattern_name, f'{pattern_name}: Teknik formasyon tespit edildi')
    
    def analyze_all_patterns(self, symbol: str, period: str = '1mo') -> Dict:
        """Tüm formasyonları analiz et"""
        try:
            # Veri çek
            ticker = yf.Ticker(symbol)
            ohlc_data = ticker.history(period=period)
            
            if ohlc_data.empty:
                return {
                    'success': False,
                    'error': f'{symbol} için veri bulunamadı',
                    'patterns': []
                }
            
            # Tüm formasyon türlerini tespit et
            all_patterns = []
            
            # Candlestick patterns
            candlestick_patterns = self.detect_candlestick_patterns(ohlc_data)
            all_patterns.extend(candlestick_patterns)
            
            # Harmonic patterns
            harmonic_patterns = self.detect_harmonic_patterns(ohlc_data)
            all_patterns.extend(harmonic_patterns)
            
            # Technical patterns
            technical_patterns = self.detect_technical_patterns(ohlc_data)
            all_patterns.extend(technical_patterns)
            
            # Trend patterns
            trend_patterns = self.detect_trend_patterns(ohlc_data)
            all_patterns.extend(trend_patterns)
            
            # Timestamp'leri string'e çevir
            for pattern in all_patterns:
                if 'timestamp' in pattern:
                    timestamp = pattern['timestamp']
                    if hasattr(timestamp, 'isoformat'):
                        pattern['timestamp'] = timestamp.isoformat()
                    else:
                        pattern['timestamp'] = str(timestamp)
                if 'price' in pattern:
                    pattern['price'] = float(pattern['price'])
            
            # Pattern istatistikleri
            pattern_stats = {
                'total_patterns': len(all_patterns),
                'bullish_patterns': len([p for p in all_patterns if p['direction'] == 'bullish']),
                'bearish_patterns': len([p for p in all_patterns if p['direction'] == 'bearish']),
                'neutral_patterns': len([p for p in all_patterns if p['direction'] == 'neutral']),
                'high_confidence': len([p for p in all_patterns if p['confidence'] >= 0.8]),
                'medium_confidence': len([p for p in all_patterns if 0.6 <= p['confidence'] < 0.8]),
                'low_confidence': len([p for p in all_patterns if p['confidence'] < 0.6])
            }
            
            # Pattern türlerine göre grupla
            pattern_types = {}
            for pattern in all_patterns:
                pattern_type = pattern['type']
                if pattern_type not in pattern_types:
                    pattern_types[pattern_type] = []
                pattern_types[pattern_type].append(pattern)
            
            return {
                'success': True,
                'symbol': symbol,
                'period': period,
                'patterns': all_patterns,
                'pattern_types': pattern_types,
                'statistics': pattern_stats,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"⚠️ {symbol} formasyon analizi hatası: {e}")
            return {
                'success': False,
                'error': f'Formasyon analizi hatası: {str(e)}',
                'patterns': []
            }

# Test fonksiyonu
if __name__ == "__main__":
    provider = TechnicalPatternProvider()
    
    print("🚀 BIST AI Smart Trader - Teknik Formasyon Motoru Test")
    print("=" * 60)
    
    # AKBNK formasyon analizi
    print("\n📊 AKBNK Formasyon Analizi:")
    akbnk_patterns = provider.analyze_all_patterns('AKBNK.IS', period='1mo')
    
    if akbnk_patterns['success']:
        stats = akbnk_patterns['statistics']
        print(f"Toplam Formasyon: {stats['total_patterns']}")
        print(f"Bullish: {stats['bullish_patterns']}, Bearish: {stats['bearish_patterns']}")
        print(f"Yüksek Güven: {stats['high_confidence']}")
        
        # Son 3 formasyonu göster
        recent_patterns = akbnk_patterns['patterns'][-3:]
        for pattern in recent_patterns:
            print(f"- {pattern['pattern']}: {pattern['direction']} ({pattern['confidence']:.2f})")
    else:
        print(f"Hata: {akbnk_patterns['error']}")
    
    # Formasyon türleri
    print("\n🎯 Formasyon Türleri:")
    for pattern_type, patterns in akbnk_patterns.get('pattern_types', {}).items():
        print(f"{pattern_type}: {len(patterns)} formasyon")
