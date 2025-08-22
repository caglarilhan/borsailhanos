import pandas as pd
import numpy as np
import yfinance as yf
# TA-Lib yerine ta kütüphanesi kullan
import ta
from typing import List, Dict, Tuple, Optional
import logging
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PatternDetector:
    """
    Otomatik teknik formasyon tespit motoru
    EMA cross, candlestick, harmonic, fractal break
    """
    
    def __init__(self):
        self.patterns = {}
        self.support_resistance = {}
        
    def get_stock_data(self, symbol: str, period: str = "6mo", interval: str = "1d") -> pd.DataFrame:
        """
        Hisse verilerini çeker
        """
        try:
            data = yf.download(symbol, period=period, interval=interval)
            if data.empty:
                raise ValueError(f"{symbol} için veri bulunamadı")
            
            # MultiIndex column'ları düzelt
            if isinstance(data.columns, pd.MultiIndex):
                data.columns = data.columns.get_level_values(0)
            
            # OHLCV verilerini temizle
            data = data.dropna()
            
            # Teknik indikatörleri ekle
            data = self._add_technical_indicators(data)
            
            return data
            
        except Exception as e:
            logger.error(f"{symbol} veri çekme hatası: {e}")
            return pd.DataFrame()
    
    def _add_technical_indicators(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Temel teknik indikatörleri ekler
        """
        try:
            close = data['Close']
            high = data['High']
            low = data['Low']
            open_price = data['Open']
            volume = data['Volume']
            
            # Array'lere dönüştür
            close_array = close.values.astype(float)
            high_array = high.values.astype(float)
            low_array = low.values.astype(float)
            open_array = open_price.values.astype(float)
            volume_array = volume.values.astype(float)
            
            # Trend indikatörleri
                    data['EMA_20'] = ta.trend.ema_indicator(close_array, window=20)
        data['EMA_50'] = ta.trend.ema_indicator(close_array, window=50)
        data['EMA_200'] = ta.trend.ema_indicator(close_array, window=200)
        data['SMA_20'] = ta.trend.sma_indicator(close_array, window=20)
        data['SMA_50'] = ta.trend.sma_indicator(close_array, window=50)
            
            # Momentum indikatörleri
                    data['RSI'] = ta.momentum.rsi(close_array, window=14)
        data['MACD'], data['MACD_Signal'], data['MACD_Hist'] = ta.trend.macd(close_array)
        data['Stoch_K'], data['Stoch_D'] = ta.momentum.stoch(high_array, low_array, close_array)
            
            # Volatilite indikatörleri
            data['ATR'] = talib.ATR(high_array, low_array, close_array, timeperiod=14)
            data['BB_Upper'], data['BB_Middle'], data['BB_Lower'] = talib.BBANDS(close_array)
            
            # Hacim indikatörleri
            data['OBV'] = talib.OBV(close_array, volume_array)
            data['AD'] = talib.AD(high_array, low_array, close_array, volume_array)
            
            return data
            
        except Exception as e:
            logger.error(f"Teknik indikatör ekleme hatası: {e}")
            return data
    
    def detect_ema_crossovers(self, data: pd.DataFrame) -> Dict:
        """
        EMA kesişim sinyallerini tespit eder
        """
        try:
            signals = []
            
            # EMA 20/50 kesişimi
            data['EMA_20_50_Cross_Up'] = (
                (data['EMA_20'].shift(1) < data['EMA_50'].shift(1)) & 
                (data['EMA_20'] > data['EMA_50'])
            )
            
            data['EMA_20_50_Cross_Down'] = (
                (data['EMA_20'].shift(1) > data['EMA_50'].shift(1)) & 
                (data['EMA_20'] < data['EMA_50'])
            )
            
            # EMA 20/200 kesişimi (Golden/Death Cross)
            data['EMA_20_200_Cross_Up'] = (
                (data['EMA_20'].shift(1) < data['EMA_200'].shift(1)) & 
                (data['EMA_20'] > data['EMA_200'])
            )
            
            data['EMA_20_200_Cross_Down'] = (
                (data['EMA_20'].shift(1) > data['EMA_200'].shift(1)) & 
                (data['EMA_20'] < data['EMA_200'])
            )
            
            # Sinyalleri topla
            for i in range(len(data)):
                if data['EMA_20_50_Cross_Up'].iloc[i]:
                    signals.append({
                        'type': 'EMA_20_50_Bullish',
                        'date': data.index[i],
                        'price': data['Close'].iloc[i],
                        'strength': 'Medium',
                        'description': 'EMA 20, EMA 50\'yi yukarı kesiyor (Bullish)'
                    })
                
                elif data['EMA_20_50_Cross_Down'].iloc[i]:
                    signals.append({
                        'type': 'EMA_20_50_Bearish',
                        'date': data.index[i],
                        'price': data['Close'].iloc[i],
                        'strength': 'Medium',
                        'description': 'EMA 20, EMA 50\'yi aşağı kesiyor (Bearish)'
                    })
                
                if data['EMA_20_200_Cross_Up'].iloc[i]:
                    signals.append({
                        'type': 'Golden_Cross',
                        'date': data.index[i],
                        'price': data['Close'].iloc[i],
                        'strength': 'Strong',
                        'description': 'Golden Cross: EMA 20, EMA 200\'ü yukarı kesiyor'
                    })
                
                elif data['EMA_20_200_Cross_Down'].iloc[i]:
                    signals.append({
                        'type': 'Death_Cross',
                        'date': data.index[i],
                        'price': data['Close'].iloc[i],
                        'strength': 'Strong',
                        'description': 'Death Cross: EMA 20, EMA 200\'ü aşağı kesiyor'
                    })
            
            return {
                'signals': signals,
                'total_signals': len(signals),
                'last_signal': signals[-1] if signals else None
            }
            
        except Exception as e:
            logger.error(f"EMA crossover tespit hatası: {e}")
            return {'signals': [], 'total_signals': 0, 'last_signal': None}
    
    def detect_candlestick_patterns(self, data: pd.DataFrame) -> Dict:
        """
        Candlestick formasyonlarını tespit eder
        """
        try:
            patterns = []
            open_price = data['Open']
            high = data['High']
            low = data['Low']
            close = data['Close']
            
            # Array'lere dönüştür
            open_array = open_price.values.astype(float)
            high_array = high.values.astype(float)
            low_array = low.values.astype(float)
            close_array = close.values.astype(float)
            
            # Bullish patterns
            bullish_engulfing = talib.CDLENGULFING(open_array, high_array, low_array, close_array)
            bullish_harami = talib.CDLHARAMI(open_array, high_array, low_array, close_array)
            morning_star = talib.CDLMORNINGSTAR(open_array, high_array, low_array, close_array)
            hammer = talib.CDLHAMMER(open_array, high_array, low_array, close_array)
            doji = talib.CDLDOJI(open_array, high_array, low_array, close_array)
            
            # Bearish patterns
            bearish_engulfing = talib.CDLENGULFING(open_array, high_array, low_array, close_array)
            bearish_harami = talib.CDLHARAMI(open_array, high_array, low_array, close_array)
            evening_star = talib.CDLEVENINGSTAR(open_array, high_array, low_array, close_array)
            shooting_star = talib.CDLSHOOTINGSTAR(open_array, high_array, low_array, close_array)
            
            # Pattern tespiti
            for i in range(len(data)):
                if bullish_engulfing[i] > 0:
                    patterns.append({
                        'type': 'Bullish_Engulfing',
                        'date': data.index[i],
                        'price': close.iloc[i],
                        'strength': 'Strong',
                        'description': 'Bullish Engulfing - Güçlü alım sinyali'
                    })
                
                elif bearish_engulfing[i] < 0:
                    patterns.append({
                        'type': 'Bearish_Engulfing',
                        'date': data.index[i],
                        'price': close.iloc[i],
                        'strength': 'Strong',
                        'description': 'Bearish Engulfing - Güçlü satım sinyali'
                    })
                
                if morning_star[i] > 0:
                    patterns.append({
                        'type': 'Morning_Star',
                        'date': data.index[i],
                        'price': close.iloc[i],
                        'strength': 'Strong',
                        'description': 'Morning Star - Trend dönüşü (Bullish)'
                    })
                
                elif evening_star[i] < 0:
                    patterns.append({
                        'type': 'Evening_Star',
                        'date': data.index[i],
                        'price': close.iloc[i],
                        'strength': 'Strong',
                        'description': 'Evening Star - Trend dönüşü (Bearish)'
                    })
                
                if hammer[i] > 0:
                    patterns.append({
                        'type': 'Hammer',
                        'date': data.index[i],
                        'price': close.iloc[i],
                        'strength': 'Medium',
                        'description': 'Hammer - Desteğe yakın (Bullish)'
                    })
                
                if doji[i] != 0:
                    patterns.append({
                        'type': 'Doji',
                        'date': data.index[i],
                        'price': close.iloc[i],
                        'strength': 'Weak',
                        'description': 'Doji - Kararsızlık sinyali'
                    })
            
            return {
                'patterns': patterns,
                'total_patterns': len(patterns),
                'last_pattern': patterns[-1] if patterns else None
            }
            
        except Exception as e:
            logger.error(f"Candlestick pattern tespit hatası: {e}")
            return {'patterns': [], 'total_patterns': 0, 'last_pattern': None}
    
    def detect_support_resistance(self, data: pd.DataFrame, window: int = 20) -> Dict:
        """
        Support ve resistance seviyelerini tespit eder
        """
        try:
            levels = []
            close = data['Close']
            high = data['High']
            low = data['Low']
            
            # Pivot noktaları bul
            for i in range(window, len(data) - window):
                # Resistance (yüksek nokta)
                if high.iloc[i] == high.iloc[i-window:i+window+1].max():
                    levels.append({
                        'type': 'Resistance',
                        'date': data.index[i],
                        'price': high.iloc[i],
                        'strength': self._calculate_level_strength(data, high.iloc[i], 'resistance'),
                        'description': f'Resistance seviyesi: {high.iloc[i]:.2f}'
                    })
                
                # Support (düşük nokta)
                if low.iloc[i] == low.iloc[i-window:i+window+1].min():
                    levels.append({
                        'type': 'Support',
                        'date': data.index[i],
                        'price': low.iloc[i],
                        'strength': self._calculate_level_strength(data, low.iloc[i], 'support'),
                        'description': f'Support seviyesi: {low.iloc[i]:.2f}'
                    })
            
            return {
                'levels': levels,
                'total_levels': len(levels),
                'support_levels': [l for l in levels if l['type'] == 'Support'],
                'resistance_levels': [l for l in levels if l['type'] == 'Resistance']
            }
            
        except Exception as e:
            logger.error(f"Support/Resistance tespit hatası: {e}")
            return {'levels': [], 'total_levels': 0, 'support_levels': [], 'resistance_levels': []}
    
    def _calculate_level_strength(self, data: pd.DataFrame, level: float, level_type: str) -> str:
        """
        Support/Resistance seviyesinin gücünü hesaplar
        """
        try:
            close = data['Close']
            tolerance = close.std() * 0.1  # %10 tolerans
            
            # Seviyeye yakın dokunuş sayısı
            touches = 0
            for price in close:
                if abs(price - level) <= tolerance:
                    touches += 1
            
            if touches >= 3:
                return 'Strong'
            elif touches >= 2:
                return 'Medium'
            else:
                return 'Weak'
                
        except Exception as e:
            return 'Weak'
    
    def detect_harmonic_patterns(self, data: pd.DataFrame) -> Dict:
        """
        Harmonic formasyonları tespit eder (Gartley, AB=CD, vb.)
        """
        try:
            patterns = []
            close = data['Close']
            
            # Basit harmonic pattern tespiti (Fibonacci retracement)
            for i in range(50, len(data)):
                # Son 50 günlük veri
                recent_data = close.iloc[i-50:i+1]
                
                # Yerel min/max noktaları
                local_min = recent_data.min()
                local_max = recent_data.max()
                
                # Fibonacci seviyeleri
                fib_236 = local_min + (local_max - local_min) * 0.236
                fib_382 = local_min + (local_max - local_min) * 0.382
                fib_500 = local_min + (local_max - local_min) * 0.500
                fib_618 = local_min + (local_max - local_min) * 0.618
                fib_786 = local_min + (local_max - local_min) * 0.786
                
                current_price = close.iloc[i]
                
                # Support/Resistance testleri
                if abs(current_price - fib_236) <= close.std() * 0.05:
                    patterns.append({
                        'type': 'Fibonacci_236',
                        'date': data.index[i],
                        'price': current_price,
                        'level': fib_236,
                        'strength': 'Medium',
                        'description': 'Fibonacci 23.6% seviyesi test ediliyor'
                    })
                
                if abs(current_price - fib_618) <= close.std() * 0.05:
                    patterns.append({
                        'type': 'Fibonacci_618',
                        'date': data.index[i],
                        'price': current_price,
                        'level': fib_618,
                        'strength': 'Strong',
                        'description': 'Fibonacci 61.8% seviyesi test ediliyor'
                    })
            
            return {
                'patterns': patterns,
                'total_patterns': len(patterns),
                'last_pattern': patterns[-1] if patterns else None
            }
            
        except Exception as e:
            logger.error(f"Harmonic pattern tespit hatası: {e}")
            return {'patterns': [], 'total_patterns': 0, 'last_pattern': None}
    
    def analyze_stock(self, symbol: str, period: str = "6mo") -> Dict:
        """
        Ana analiz fonksiyonu - tüm formasyonları tespit eder
        """
        logger.info(f"{symbol} için formasyon analizi başlatılıyor...")
        
        # Veri çek
        data = self.get_stock_data(symbol, period)
        
        if data.empty:
            return {"error": f"{symbol} için veri bulunamadı"}
        
        # Tüm formasyonları tespit et
        ema_signals = self.detect_ema_crossovers(data)
        candlestick_patterns = self.detect_candlestick_patterns(data)
        support_resistance = self.detect_support_resistance(data)
        harmonic_patterns = self.detect_harmonic_patterns(data)
        
        # Son fiyat ve trend bilgisi
        current_price = data['Close'].iloc[-1]
        current_trend = "Bullish" if data['EMA_20'].iloc[-1] > data['EMA_50'].iloc[-1] else "Bearish"
        
        # Risk/Ödül oranı hesapla
        risk_reward = self._calculate_risk_reward(data, support_resistance)
        
        return {
            "symbol": symbol,
            "analysis_date": datetime.now().isoformat(),
            "current_price": float(current_price),
            "current_trend": current_trend,
            "ema_signals": ema_signals,
            "candlestick_patterns": candlestick_patterns,
            "support_resistance": support_resistance,
            "harmonic_patterns": harmonic_patterns,
            "risk_reward_ratio": risk_reward,
            "total_signals": (
                ema_signals['total_signals'] + 
                candlestick_patterns['total_patterns'] + 
                len(harmonic_patterns['patterns'])
            ),
            "data_period": period
        }
    
    def _calculate_risk_reward(self, data: pd.DataFrame, support_resistance: Dict) -> float:
        """
        Risk/Ödül oranını hesaplar
        """
        try:
            current_price = data['Close'].iloc[-1]
            
            # En yakın support ve resistance
            support_levels = support_resistance.get('support_levels', [])
            resistance_levels = support_resistance.get('resistance_levels', [])
            
            if not support_levels or not resistance_levels:
                return 1.0
            
            # En yakın support
            nearest_support = min(support_levels, key=lambda x: abs(x['price'] - current_price))
            # En yakın resistance
            nearest_resistance = min(resistance_levels, key=lambda x: abs(x['price'] - current_price))
            
            # Risk (current_price - support)
            risk = current_price - nearest_support['price']
            # Reward (resistance - current_price)
            reward = nearest_resistance['price'] - current_price
            
            if risk <= 0:
                return 1.0
            
            return reward / risk
            
        except Exception as e:
            return 1.0

# Test fonksiyonu
if __name__ == "__main__":
    # Test hissesi
    symbol = "SISE.IS"
    
    # Pattern detector'ı başlat
    detector = PatternDetector()
    
    # Analiz yap
    result = detector.analyze_stock(symbol)
    
    if "error" not in result:
        print(f"🎯 {symbol} Formasyon Analizi:")
        print("=" * 50)
        print(f"💰 Mevcut Fiyat: {result['current_price']:.2f} TL")
        print(f"📈 Trend: {result['current_trend']}")
        print(f"⚖️ Risk/Ödül Oranı: {result['risk_reward_ratio']:.2f}")
        
        print(f"\n🔄 EMA Sinyalleri: {result['ema_signals']['total_signals']}")
        if result['ema_signals']['last_signal']:
            last_signal = result['ema_signals']['last_signal']
            print(f"   Son: {last_signal['type']} - {last_signal['description']}")
        
        print(f"\n🕯️ Candlestick Formasyonları: {result['candlestick_patterns']['total_patterns']}")
        if result['candlestick_patterns']['last_pattern']:
            last_pattern = result['candlestick_patterns']['last_pattern']
            print(f"   Son: {last_pattern['type']} - {last_pattern['description']}")
        
        print(f"\n📊 Support/Resistance Seviyeleri: {result['support_resistance']['total_levels']}")
        print(f"   Support: {len(result['support_resistance']['support_levels'])}")
        print(f"   Resistance: {len(result['support_resistance']['resistance_levels'])}")
        
        print(f"\n🎵 Harmonic Formasyonlar: {result['harmonic_patterns']['total_patterns']}")
        
        print(f"\n📊 Toplam Sinyal: {result['total_signals']}")
    else:
        print(f"❌ Hata: {result['error']}")
