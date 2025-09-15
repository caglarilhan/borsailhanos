#!/usr/bin/env python3
"""
🚀 US Market Scalping Robot
US marketlerin hızlı hareketleri için özel scalping stratejisi
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional, Tuple, Any
import asyncio
import json
from dataclasses import dataclass
from enum import Enum

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ScalpingSignalType(Enum):
    """Scalping sinyal türleri"""
    STRONG_SCALP = "STRONG_SCALP"      # Güçlü scalping fırsatı
    SCALP = "SCALP"                     # Scalping fırsatı
    WEAK_SCALP = "WEAK_SCALP"          # Zayıf scalping fırsatı
    HOLD = "HOLD"                       # Bekle
    REVERSE_SCALP = "REVERSE_SCALP"    # Ters scalping

@dataclass
class ScalpingSignal:
    """Scalping sinyali"""
    symbol: str
    action: ScalpingSignalType
    entry_price: float
    target_price: float
    stop_loss: float
    confidence: float
    timeframe: str
    volume_spike: float
    volatility: float
    momentum: float
    timestamp: datetime
    reasons: List[str]
    risk_reward: float
    position_size: float

class USMarketScalpingRobot:
    """US Market Scalping Robot"""
    
    def __init__(self):
        self.us_symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "NFLX"]
        self.scalping_config = {
            "min_volume_spike": 1.1,      # Minimum hacim artışı
            "max_volatility": 0.08,        # Maksimum volatilite (%8)
            "min_momentum": 0.001,         # Minimum momentum (%0.5 → %0.1)
            "target_profit": 0.01,         # Hedef kar (%1)
            "stop_loss": 0.005,            # Stop loss (%0.5)
            "max_position_time": 300,      # Maksimum pozisyon süresi (5dk)
            "min_confidence": 0.2,         # Minimum güven skoru (0.3 → 0.2)
            "max_positions": 5,            # Maksimum eş zamanlı pozisyon
        }
        
        self.active_positions = {}
        self.scalping_history = []
        self.performance_metrics = {
            "total_trades": 0,
            "winning_trades": 0,
            "losing_trades": 0,
            "total_profit": 0.0,
            "win_rate": 0.0,
            "avg_profit_per_trade": 0.0,
            "max_drawdown": 0.0,
            "sharpe_ratio": 0.0
        }
        
    def scan_scalping_opportunities(self) -> List[ScalpingSignal]:
        """Scalping fırsatlarını tara"""
        try:
            logger.info("🔍 US Market scalping fırsatları taranıyor...")
            
            signals = []
            for symbol in self.us_symbols:
                try:
                    # 1 dakikalık veri çek
                    data = self._get_realtime_data(symbol, "1m", 100)
                    if data.empty:
                        continue
                    
                    # Scalping sinyali üret
                    signal = self._generate_scalping_signal(symbol, data)
                    if signal:
                        signals.append(signal)
                        logger.info(f"🎯 {symbol}: {signal.action.value} sinyali - Güven: {signal.confidence:.2f}")
                    
                except Exception as e:
                    logger.error(f"❌ {symbol} scalping hatası: {e}")
                    continue
            
            # Sinyalleri güven skoruna göre sırala
            signals.sort(key=lambda x: x.confidence, reverse=True)
            
            logger.info(f"✅ {len(signals)} scalping fırsatı bulundu")
            return signals
            
        except Exception as e:
            logger.error(f"❌ Scalping tarama hatası: {e}")
            return []
    
    def _get_realtime_data(self, symbol: str, interval: str = "1m", period: int = 8) -> pd.DataFrame:
        """Gerçek zamanlı veri çek - Mock data ile test"""
        try:
            # Mock data oluştur (test için)
            dates = pd.date_range(start=datetime.now() - timedelta(days=7), periods=1000, freq='1min')
            
            # Gerçekçi mock data
            np.random.seed(42)  # Tutarlılık için
            base_price = 150.0 if symbol == "AAPL" else 300.0
            
            prices = []
            volumes = []
            current_price = base_price
            
            for i in range(len(dates)):
                # Fiyat hareketi - daha volatil
                change = np.random.normal(0, 0.003)  # %0.3 volatilite
                current_price *= (1 + change)
                prices.append(current_price)
                
                # Hacim - spike'lar ekle
                base_volume = 2000000
                if i % 50 == 0:  # Her 50 dakikada bir hacim spike
                    volume = base_volume * np.random.uniform(1.5, 3.0)
                else:
                    volume = base_volume * np.random.uniform(0.8, 1.2)
                volumes.append(int(volume))
            
            data = pd.DataFrame({
                'Open': prices,
                'High': [p * (1 + abs(np.random.normal(0, 0.002))) for p in prices],
                'Low': [p * (1 - abs(np.random.normal(0, 0.002))) for p in prices],
                'Close': prices,
                'Volume': volumes
            }, index=dates)
            
            # Teknik indikatörler ekle
            data = self._add_scalping_indicators(data)
            return data
            
        except Exception as e:
            logger.error(f"❌ {symbol} mock data hatası: {e}")
            return pd.DataFrame()
    
    def _add_scalping_indicators(self, data: pd.DataFrame) -> pd.DataFrame:
        """Scalping için teknik indikatörler ekle"""
        try:
            # Hacim ortalaması
            data['volume_ma'] = data['Volume'].rolling(20).mean()
            data['volume_spike'] = data['Volume'] / data['volume_ma']
            
            # Fiyat momentumu
            data['price_change'] = data['Close'].pct_change()
            data['momentum'] = data['Close'].rolling(5).apply(lambda x: (x[-1] - x[0]) / x[0])
            
            # Volatilite
            data['volatility'] = data['Close'].rolling(10).std() / data['Close'].rolling(10).mean()
            
            # RSI (hızlı)
            data['rsi'] = self._calculate_rsi(data['Close'], 14)
            
            # Bollinger Bands
            data['bb_upper'], data['bb_middle'], data['bb_lower'] = self._calculate_bollinger_bands(data['Close'])
            data['bb_position'] = (data['Close'] - data['bb_lower']) / (data['bb_upper'] - data['bb_lower'])
            
            # MACD (hızlı)
            data['macd'], data['macd_signal'] = self._calculate_macd(data['Close'])
            
            return data
            
        except Exception as e:
            logger.error(f"❌ İndikatör hesaplama hatası: {e}")
            return data
    
    def _generate_scalping_signal(self, symbol: str, data: pd.DataFrame) -> Optional[ScalpingSignal]:
        """Scalping sinyali üret"""
        try:
            if len(data) < 20:
                return None
            
            latest = data.iloc[-1]
            prev = data.iloc[-2]
            
            # Scalping koşullarını kontrol et
            conditions = self._check_scalping_conditions(latest, prev)
            
            # Debug için koşulları logla
            logger.info(f"🔍 {symbol} koşulları:")
            logger.info(f"   Volume spike: {latest['volume_spike']:.2f} (min: {self.scalping_config['min_volume_spike']})")
            logger.info(f"   Volatility: {latest['volatility']:.4f} (max: {self.scalping_config['max_volatility']})")
            logger.info(f"   Momentum: {latest['momentum']:.4f} (min: {self.scalping_config['min_momentum']})")
            logger.info(f"   RSI: {latest['rsi']:.1f}")
            logger.info(f"   Valid: {conditions['valid']}")
            
            if not conditions['valid']:
                return None
            
            # Sinyal türünü belirle
            signal_type = self._determine_signal_type(conditions)
            
            # Fiyat hedefleri hesapla
            entry_price = latest['Close']
            target_price = self._calculate_target_price(entry_price, signal_type)
            stop_loss = self._calculate_stop_loss(entry_price, signal_type)
            
            # Güven skoru hesapla
            confidence = self._calculate_scalping_confidence(conditions, latest)
            
            # Risk/Reward hesapla
            risk_reward = abs(target_price - entry_price) / abs(entry_price - stop_loss)
            
            # Pozisyon boyutu hesapla
            position_size = self._calculate_position_size(confidence, risk_reward)
            
            # Sinyal oluştur
            signal = ScalpingSignal(
                symbol=symbol,
                action=signal_type,
                entry_price=entry_price,
                target_price=target_price,
                stop_loss=stop_loss,
                confidence=confidence,
                timeframe="1m",
                volume_spike=latest['volume_spike'],
                volatility=latest['volatility'],
                momentum=latest['momentum'],
                timestamp=datetime.now(),
                reasons=conditions['reasons'],
                risk_reward=risk_reward,
                position_size=position_size
            )
            
            return signal
            
        except Exception as e:
            logger.error(f"❌ {symbol} sinyal üretme hatası: {e}")
            return None
    
    def _check_scalping_conditions(self, latest: pd.Series, prev: pd.Series) -> Dict:
        """Scalping koşullarını kontrol et"""
        conditions = {
            'valid': False,
            'reasons': []
        }
        
        try:
            # Hacim spike kontrolü
            if latest['volume_spike'] >= self.scalping_config['min_volume_spike']:
                conditions['reasons'].append(f"Hacim spike: {latest['volume_spike']:.2f}x")
            else:
                return conditions
            
            # Volatilite kontrolü
            if latest['volatility'] <= self.scalping_config['max_volatility']:
                conditions['reasons'].append(f"Düşük volatilite: {latest['volatility']:.3f}")
            else:
                return conditions
            
            # Momentum kontrolü
            if abs(latest['momentum']) >= self.scalping_config['min_momentum']:
                conditions['reasons'].append(f"Güçlü momentum: {latest['momentum']:.3f}")
            else:
                return conditions
            
            # RSI kontrolü
            if 30 <= latest['rsi'] <= 70:
                conditions['reasons'].append(f"RSI uygun: {latest['rsi']:.1f}")
            else:
                return conditions
            
            # Bollinger Bands kontrolü
            if 0.2 <= latest['bb_position'] <= 0.8:
                conditions['reasons'].append(f"BB pozisyon uygun: {latest['bb_position']:.2f}")
            else:
                return conditions
            
            # MACD kontrolü
            if latest['macd'] > latest['macd_signal']:
                conditions['reasons'].append("MACD pozitif")
            else:
                conditions['reasons'].append("MACD negatif")
            
            conditions['valid'] = True
            return conditions
            
        except Exception as e:
            logger.error(f"❌ Koşul kontrol hatası: {e}")
            return conditions
    
    def _determine_signal_type(self, conditions: Dict) -> ScalpingSignalType:
        """Sinyal türünü belirle"""
        try:
            reasons = conditions['reasons']
            
            # Güçlü sinyal koşulları
            strong_signals = 0
            for reason in reasons:
                if "spike" in reason.lower() and float(reason.split(":")[1].split("x")[0]) >= 2.0:
                    strong_signals += 1
                elif "momentum" in reason.lower() and abs(float(reason.split(":")[1])) >= 0.03:
                    strong_signals += 1
                elif "rsi" in reason.lower():
                    strong_signals += 1
            
            if strong_signals >= 3:
                return ScalpingSignalType.STRONG_SCALP
            elif strong_signals >= 2:
                return ScalpingSignalType.SCALP
            elif strong_signals >= 1:
                return ScalpingSignalType.WEAK_SCALP
            else:
                return ScalpingSignalType.HOLD
                
        except Exception as e:
            logger.error(f"❌ Sinyal türü belirleme hatası: {e}")
            return ScalpingSignalType.HOLD
    
    def _calculate_target_price(self, entry_price: float, signal_type: ScalpingSignalType) -> float:
        """Hedef fiyat hesapla"""
        target_profit = self.scalping_config['target_profit']
        
        if signal_type in [ScalpingSignalType.STRONG_SCALP, ScalpingSignalType.SCALP]:
            return entry_price * (1 + target_profit)
        else:
            return entry_price * (1 + target_profit * 0.5)
    
    def _calculate_stop_loss(self, entry_price: float, signal_type: ScalpingSignalType) -> float:
        """Stop loss hesapla"""
        stop_loss = self.scalping_config['stop_loss']
        
        if signal_type in [ScalpingSignalType.STRONG_SCALP, ScalpingSignalType.SCALP]:
            return entry_price * (1 - stop_loss)
        else:
            return entry_price * (1 - stop_loss * 1.5)
    
    def _calculate_scalping_confidence(self, conditions: Dict, latest: pd.Series) -> float:
        """Scalping güven skoru hesapla"""
        try:
            confidence = 0.0
            
            # Hacim spike skoru
            volume_score = min(latest['volume_spike'] / 3.0, 1.0) * 0.3
            confidence += volume_score
            
            # Momentum skoru
            momentum_score = min(abs(latest['momentum']) / 0.05, 1.0) * 0.25
            confidence += momentum_score
            
            # Volatilite skoru (düşük volatilite iyi)
            volatility_score = max(0, 1.0 - latest['volatility'] / 0.05) * 0.2
            confidence += volatility_score
            
            # RSI skoru
            rsi_score = 0.0
            if 40 <= latest['rsi'] <= 60:
                rsi_score = 0.15
            elif 30 <= latest['rsi'] <= 70:
                rsi_score = 0.1
            confidence += rsi_score
            
            # Bollinger Bands skoru
            bb_score = 0.0
            if 0.3 <= latest['bb_position'] <= 0.7:
                bb_score = 0.1
            confidence += bb_score
            
            return min(confidence, 1.0)
            
        except Exception as e:
            logger.error(f"❌ Güven skoru hesaplama hatası: {e}")
            return 0.0
    
    def _calculate_position_size(self, confidence: float, risk_reward: float) -> float:
        """Pozisyon boyutu hesapla"""
        try:
            base_size = 0.1  # %10 temel pozisyon
            
            # Güven skoru ile çarp
            size = base_size * confidence
            
            # Risk/Reward ile ayarla
            if risk_reward >= 2.0:
                size *= 1.2
            elif risk_reward >= 1.5:
                size *= 1.0
            else:
                size *= 0.8
            
            return min(size, 0.2)  # Maksimum %20
            
        except Exception as e:
            logger.error(f"❌ Pozisyon boyutu hesaplama hatası: {e}")
            return 0.05
    
    def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """RSI hesapla"""
        try:
            delta = prices.diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            return rsi
        except:
            return pd.Series([50] * len(prices), index=prices.index)
    
    def _calculate_bollinger_bands(self, prices: pd.Series, period: int = 20, std_dev: int = 2) -> Tuple[pd.Series, pd.Series, pd.Series]:
        """Bollinger Bands hesapla"""
        try:
            sma = prices.rolling(window=period).mean()
            std = prices.rolling(window=period).std()
            upper = sma + (std * std_dev)
            lower = sma - (std * std_dev)
            return upper, sma, lower
        except:
            return prices, prices, prices
    
    def _calculate_macd(self, prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> Tuple[pd.Series, pd.Series]:
        """MACD hesapla"""
        try:
            ema_fast = prices.ewm(span=fast).mean()
            ema_slow = prices.ewm(span=slow).mean()
            macd = ema_fast - ema_slow
            macd_signal = macd.ewm(span=signal).mean()
            return macd, macd_signal
        except:
            return pd.Series([0] * len(prices), index=prices.index), pd.Series([0] * len(prices), index=prices.index)
    
    def execute_scalping_trade(self, signal: ScalpingSignal) -> Dict:
        """Scalping işlemi gerçekleştir"""
        try:
            logger.info(f"🚀 {signal.symbol} scalping işlemi başlatılıyor...")
            logger.info(f"   📈 Giriş: ${signal.entry_price:.2f}")
            logger.info(f"   🎯 Hedef: ${signal.target_price:.2f}")
            logger.info(f"   🛑 Stop: ${signal.stop_loss:.2f}")
            logger.info(f"   💰 Pozisyon: %{signal.position_size*100:.1f}")
            logger.info(f"   ⚡ Risk/Reward: {signal.risk_reward:.2f}")
            
            # Pozisyon kaydet
            position_id = f"{signal.symbol}_{signal.timestamp.strftime('%Y%m%d_%H%M%S')}"
            self.active_positions[position_id] = {
                "signal": signal,
                "entry_time": signal.timestamp,
                "status": "ACTIVE",
                "current_price": signal.entry_price,
                "profit_loss": 0.0
            }
            
            # Performans metriklerini güncelle
            self.performance_metrics["total_trades"] += 1
            
            return {
                "status": "SUCCESS",
                "position_id": position_id,
                "message": f"{signal.symbol} scalping pozisyonu açıldı"
            }
            
        except Exception as e:
            logger.error(f"❌ {signal.symbol} scalping işlem hatası: {e}")
            return {
                "status": "ERROR",
                "message": str(e)
            }
    
    def monitor_positions(self) -> Dict:
        """Aktif pozisyonları izle"""
        try:
            logger.info(f"👀 {len(self.active_positions)} aktif pozisyon izleniyor...")
            
            closed_positions = []
            for position_id, position in list(self.active_positions.items()):
                signal = position["signal"]
                
                # Güncel fiyat al
                current_price = self._get_current_price(signal.symbol)
                if not current_price:
                    continue
                
                # Kar/Zarar hesapla
                profit_loss = (current_price - signal.entry_price) / signal.entry_price
                position["current_price"] = current_price
                position["profit_loss"] = profit_loss
                
                # Pozisyon kapatma koşulları
                should_close = False
                close_reason = ""
                
                # Hedef fiyata ulaştı
                if current_price >= signal.target_price:
                    should_close = True
                    close_reason = "Hedef fiyata ulaşıldı"
                
                # Stop loss'a ulaştı
                elif current_price <= signal.stop_loss:
                    should_close = True
                    close_reason = "Stop loss tetiklendi"
                
                # Maksimum süre doldu
                elif (datetime.now() - position["entry_time"]).seconds >= self.scalping_config["max_position_time"]:
                    should_close = True
                    close_reason = "Maksimum süre doldu"
                
                if should_close:
                    # Pozisyonu kapat
                    self._close_position(position_id, close_reason, profit_loss)
                    closed_positions.append(position_id)
            
            return {
                "status": "SUCCESS",
                "closed_positions": len(closed_positions),
                "active_positions": len(self.active_positions)
            }
            
        except Exception as e:
            logger.error(f"❌ Pozisyon izleme hatası: {e}")
            return {"status": "ERROR", "message": str(e)}
    
    def _get_current_price(self, symbol: str) -> Optional[float]:
        """Güncel fiyat al"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            return info.get('regularMarketPrice') or info.get('currentPrice')
        except Exception as e:
            logger.error(f"❌ {symbol} fiyat alma hatası: {e}")
            return None
    
    def _close_position(self, position_id: str, reason: str, profit_loss: float):
        """Pozisyonu kapat"""
        try:
            position = self.active_positions[position_id]
            signal = position["signal"]
            
            logger.info(f"🔒 {signal.symbol} pozisyonu kapatılıyor: {reason}")
            logger.info(f"   💰 Kar/Zarar: %{profit_loss*100:.2f}")
            
            # Performans metriklerini güncelle
            if profit_loss > 0:
                self.performance_metrics["winning_trades"] += 1
            else:
                self.performance_metrics["losing_trades"] += 1
            
            self.performance_metrics["total_profit"] += profit_loss
            
            # Geçmişe ekle
            self.scalping_history.append({
                "position_id": position_id,
                "symbol": signal.symbol,
                "entry_price": signal.entry_price,
                "exit_price": position["current_price"],
                "profit_loss": profit_loss,
                "reason": reason,
                "duration": (datetime.now() - position["entry_time"]).seconds
            })
            
            # Aktif pozisyonlardan kaldır
            del self.active_positions[position_id]
            
        except Exception as e:
            logger.error(f"❌ Pozisyon kapatma hatası: {e}")
    
    def get_performance_report(self) -> Dict:
        """Performans raporu al"""
        try:
            total_trades = self.performance_metrics["total_trades"]
            if total_trades > 0:
                win_rate = self.performance_metrics["winning_trades"] / total_trades
                avg_profit = self.performance_metrics["total_profit"] / total_trades
                
                self.performance_metrics["win_rate"] = win_rate
                self.performance_metrics["avg_profit_per_trade"] = avg_profit
            
            return {
                "performance_metrics": self.performance_metrics,
                "active_positions": len(self.active_positions),
                "total_history": len(self.scalping_history),
                "last_10_trades": self.scalping_history[-10:] if self.scalping_history else []
            }
            
        except Exception as e:
            logger.error(f"❌ Performans raporu hatası: {e}")
            return {"error": str(e)}

# Demo fonksiyonu
async def demo_scalping_robot():
    """Scalping robot demo"""
    try:
        logger.info("🚀 US Market Scalping Robot Demo Başlatılıyor...")
        
        robot = USMarketScalpingRobot()
        
        # Scalping fırsatlarını tara
        signals = robot.scan_scalping_opportunities()
        
        if signals:
            logger.info(f"🎯 {len(signals)} scalping fırsatı bulundu!")
            
            # En iyi sinyali al
            best_signal = signals[0]
            logger.info(f"🏆 En iyi fırsat: {best_signal.symbol}")
            
            # İşlemi gerçekleştir
            result = robot.execute_scalping_trade(best_signal)
            logger.info(f"📊 İşlem sonucu: {result}")
            
            # Pozisyonları izle
            monitor_result = robot.monitor_positions()
            logger.info(f"👀 İzleme sonucu: {monitor_result}")
            
        else:
            logger.info("⏸️ Şu an scalping fırsatı yok")
        
        # Performans raporu
        performance = robot.get_performance_report()
        logger.info(f"📈 Performans: {performance}")
        
    except Exception as e:
        logger.error(f"❌ Demo hatası: {e}")

if __name__ == "__main__":
    asyncio.run(demo_scalping_robot())
