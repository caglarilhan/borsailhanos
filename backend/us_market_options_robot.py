#!/usr/bin/env python3
"""
🎯 US Market Options Trading Robot
US marketlerin options piyasası için özel stratejiler
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

class OptionsStrategyType(Enum):
    """Options strateji türleri"""
    COVERED_CALL = "COVERED_CALL"          # Covered Call
    CASH_SECURED_PUT = "CASH_SECURED_PUT"   # Cash Secured Put
    STRADDLE = "STRADDLE"                   # Straddle
    STRANGLE = "STRANGLE"                   # Strangle
    IRON_CONDOR = "IRON_CONDOR"            # Iron Condor
    BUTTERFLY = "BUTTERFLY"                # Butterfly
    CALENDAR_SPREAD = "CALENDAR_SPREAD"    # Calendar Spread
    DIAGONAL_SPREAD = "DIAGONAL_SPREAD"    # Diagonal Spread

class OptionsSignalType(Enum):
    """Options sinyal türleri"""
    STRONG_BUY_CALL = "STRONG_BUY_CALL"
    BUY_CALL = "BUY_CALL"
    WEAK_BUY_CALL = "WEAK_BUY_CALL"
    STRONG_BUY_PUT = "STRONG_BUY_PUT"
    BUY_PUT = "BUY_PUT"
    WEAK_BUY_PUT = "WEAK_BUY_PUT"
    SELL_CALL = "SELL_CALL"
    SELL_PUT = "SELL_PUT"
    HOLD = "HOLD"

@dataclass
class OptionsSignal:
    """Options sinyali"""
    symbol: str
    action: OptionsSignalType
    strategy: OptionsStrategyType
    strike_price: float
    expiration_date: str
    option_type: str  # "CALL" or "PUT"
    premium: float
    delta: float
    gamma: float
    theta: float
    vega: float
    implied_volatility: float
    confidence: float
    risk_reward: float
    max_profit: float
    max_loss: float
    breakeven: float
    timestamp: datetime
    reasons: List[str]

class USMarketOptionsRobot:
    """US Market Options Trading Robot"""
    
    def __init__(self):
        self.us_symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "NFLX"]
        self.options_config = {
            "min_delta": 0.3,              # Minimum delta
            "max_delta": 0.7,              # Maksimum delta
            "min_iv": 0.15,                # Minimum implied volatility (%15)
            "max_iv": 0.8,                 # Maksimum implied volatility (%80)
            "min_dte": 7,                  # Minimum days to expiration
            "max_dte": 45,                 # Maksimum days to expiration
            "min_premium": 0.5,            # Minimum premium ($0.5)
            "max_premium": 20.0,           # Maksimum premium ($20)
            "min_confidence": 0.6,         # Minimum güven skoru
            "max_positions": 10,           # Maksimum eş zamanlı pozisyon
            "profit_target": 0.5,          # Hedef kar (%50)
            "stop_loss": 0.3,              # Stop loss (%30)
        }
        
        self.active_positions = {}
        self.options_history = []
        self.performance_metrics = {
            "total_trades": 0,
            "winning_trades": 0,
            "losing_trades": 0,
            "total_profit": 0.0,
            "win_rate": 0.0,
            "avg_profit_per_trade": 0.0,
            "max_drawdown": 0.0,
            "sharpe_ratio": 0.0,
            "total_premium_collected": 0.0,
            "total_premium_paid": 0.0
        }
        
    def scan_options_opportunities(self) -> List[OptionsSignal]:
        """Options fırsatlarını tara"""
        try:
            logger.info("🔍 US Market options fırsatları taranıyor...")
            
            signals = []
            for symbol in self.us_symbols:
                try:
                    # Options verisi çek
                    options_data = self._get_options_data(symbol)
                    if not options_data:
                        continue
                    
                    # Options sinyali üret
                    signal = self._generate_options_signal(symbol, options_data)
                    if signal:
                        signals.append(signal)
                        logger.info(f"🎯 {symbol}: {signal.action.value} sinyali - Güven: {signal.confidence:.2f}")
                    
                except Exception as e:
                    logger.error(f"❌ {symbol} options hatası: {e}")
                    continue
            
            # Sinyalleri güven skoruna göre sırala
            signals.sort(key=lambda x: x.confidence, reverse=True)
            
            logger.info(f"✅ {len(signals)} options fırsatı bulundu")
            return signals
            
        except Exception as e:
            logger.error(f"❌ Options tarama hatası: {e}")
            return []
    
    def _get_options_data(self, symbol: str) -> Optional[Dict]:
        """Options verisi çek"""
        try:
            # Mock options data oluştur
            current_price = self._get_current_price(symbol)
            if not current_price:
                return None
            
            # Expiration tarihleri (7-45 gün arası)
            expirations = []
            for i in range(7, 46, 7):  # Her 7 günde bir
                exp_date = datetime.now() + timedelta(days=i)
                expirations.append(exp_date.strftime("%Y-%m-%d"))
            
            # Strike fiyatları (current price ±20%)
            strikes = []
            for i in range(-20, 21, 5):  # Her %5'te bir
                strike = current_price * (1 + i/100)
                strikes.append(round(strike, 2))
            
            # Mock Greeks ve IV
            options_data = {
                "current_price": current_price,
                "expirations": expirations,
                "strikes": strikes,
                "calls": {},
                "puts": {},
                "iv": np.random.uniform(0.2, 0.6),  # %20-60 IV
                "volume": np.random.randint(1000, 10000),
                "open_interest": np.random.randint(500, 5000)
            }
            
            # Call options
            for exp in expirations[:3]:  # İlk 3 expiration
                for strike in strikes:
                    if abs(strike - current_price) / current_price <= 0.15:  # ATM yakını
                        key = f"{exp}_{strike}"
                        options_data["calls"][key] = {
                            "strike": strike,
                            "expiration": exp,
                            "premium": max(0.5, abs(strike - current_price) * 0.1 + np.random.uniform(0.5, 3.0)),
                            "delta": np.random.uniform(0.2, 0.8),
                            "gamma": np.random.uniform(0.01, 0.05),
                            "theta": -np.random.uniform(0.01, 0.05),
                            "vega": np.random.uniform(0.1, 0.3),
                            "iv": np.random.uniform(0.2, 0.6),
                            "volume": np.random.randint(100, 1000),
                            "open_interest": np.random.randint(50, 500)
                        }
            
            # Put options
            for exp in expirations[:3]:
                for strike in strikes:
                    if abs(strike - current_price) / current_price <= 0.15:
                        key = f"{exp}_{strike}"
                        options_data["puts"][key] = {
                            "strike": strike,
                            "expiration": exp,
                            "premium": max(0.5, abs(strike - current_price) * 0.1 + np.random.uniform(0.5, 3.0)),
                            "delta": -np.random.uniform(0.2, 0.8),
                            "gamma": np.random.uniform(0.01, 0.05),
                            "theta": -np.random.uniform(0.01, 0.05),
                            "vega": np.random.uniform(0.1, 0.3),
                            "iv": np.random.uniform(0.2, 0.6),
                            "volume": np.random.randint(100, 1000),
                            "open_interest": np.random.randint(50, 500)
                        }
            
            return options_data
            
        except Exception as e:
            logger.error(f"❌ {symbol} options veri hatası: {e}")
            return None
    
    def _get_current_price(self, symbol: str) -> Optional[float]:
        """Güncel fiyat al"""
        try:
            # Mock fiyatlar
            mock_prices = {
                "AAPL": 150.0,
                "MSFT": 300.0,
                "GOOGL": 120.0,
                "AMZN": 130.0,
                "NVDA": 400.0,
                "META": 250.0,
                "TSLA": 200.0,
                "NFLX": 400.0
            }
            return mock_prices.get(symbol, 100.0)
        except Exception as e:
            logger.error(f"❌ {symbol} fiyat alma hatası: {e}")
            return None
    
    def _generate_options_signal(self, symbol: str, options_data: Dict) -> Optional[OptionsSignal]:
        """Options sinyali üret"""
        try:
            current_price = options_data["current_price"]
            
            # Strateji seçimi
            strategy = self._select_options_strategy(options_data)
            if not strategy:
                return None
            
            # En iyi option'ı bul
            best_option = self._find_best_option(symbol, options_data, strategy)
            if not best_option:
                return None
            
            # Sinyal türünü belirle
            signal_type = self._determine_options_signal_type(best_option, strategy)
            
            # Risk/Reward hesapla
            risk_reward = self._calculate_options_risk_reward(best_option, strategy)
            
            # Güven skoru hesapla
            confidence = self._calculate_options_confidence(best_option, options_data, strategy)
            
            # Greeks hesapla
            delta = best_option["delta"]
            gamma = best_option["gamma"]
            theta = best_option["theta"]
            vega = best_option["vega"]
            iv = best_option["iv"]
            
            # Profit/Loss hesapla
            max_profit, max_loss, breakeven = self._calculate_options_pnl(best_option, strategy)
            
            # Sinyal oluştur
            signal = OptionsSignal(
                symbol=symbol,
                action=signal_type,
                strategy=strategy,
                strike_price=best_option["strike"],
                expiration_date=best_option["expiration"],
                option_type="CALL" if delta > 0 else "PUT",
                premium=best_option["premium"],
                delta=delta,
                gamma=gamma,
                theta=theta,
                vega=vega,
                implied_volatility=iv,
                confidence=confidence,
                risk_reward=risk_reward,
                max_profit=max_profit,
                max_loss=max_loss,
                breakeven=breakeven,
                timestamp=datetime.now(),
                reasons=self._get_options_reasons(best_option, options_data, strategy)
            )
            
            return signal
            
        except Exception as e:
            logger.error(f"❌ {symbol} options sinyal hatası: {e}")
            return None
    
    def _select_options_strategy(self, options_data: Dict) -> Optional[OptionsStrategyType]:
        """Options stratejisi seç"""
        try:
            current_price = options_data["current_price"]
            iv = options_data["iv"]
            
            # IV'ye göre strateji seç
            if iv > 0.5:  # Yüksek IV
                return OptionsStrategyType.STRADDLE
            elif iv > 0.3:  # Orta IV
                return OptionsStrategyType.COVERED_CALL
            else:  # Düşük IV
                return OptionsStrategyType.CASH_SECURED_PUT
                
        except Exception as e:
            logger.error(f"❌ Strateji seçim hatası: {e}")
            return None
    
    def _find_best_option(self, symbol: str, options_data: Dict, strategy: OptionsStrategyType) -> Optional[Dict]:
        """En iyi option'ı bul"""
        try:
            current_price = options_data["current_price"]
            best_option = None
            best_score = 0
            
            # Call options kontrol et
            for key, option in options_data["calls"].items():
                score = self._score_option(option, current_price, strategy)
                if score > best_score:
                    best_score = score
                    best_option = option
            
            # Put options kontrol et
            for key, option in options_data["puts"].items():
                score = self._score_option(option, current_price, strategy)
                if score > best_score:
                    best_score = score
                    best_option = option
            
            return best_option
            
        except Exception as e:
            logger.error(f"❌ En iyi option bulma hatası: {e}")
            return None
    
    def _score_option(self, option: Dict, current_price: float, strategy: OptionsStrategyType) -> float:
        """Option'ı skorla"""
        try:
            score = 0.0
            
            # Delta skoru
            delta = abs(option["delta"])
            if 0.3 <= delta <= 0.7:
                score += 0.3
            elif 0.2 <= delta <= 0.8:
                score += 0.2
            
            # Premium skoru
            premium = option["premium"]
            if 0.5 <= premium <= 20.0:
                score += 0.2
            
            # IV skoru
            iv = option["iv"]
            if 0.15 <= iv <= 0.8:
                score += 0.2
            
            # Volume skoru
            volume = option["volume"]
            if volume > 100:
                score += 0.1
            
            # Open Interest skoru
            oi = option["open_interest"]
            if oi > 50:
                score += 0.1
            
            # Strike distance skoru
            strike = option["strike"]
            distance = abs(strike - current_price) / current_price
            if distance <= 0.1:  # ATM yakını
                score += 0.1
            
            return score
            
        except Exception as e:
            logger.error(f"❌ Option skorlama hatası: {e}")
            return 0.0
    
    def _determine_options_signal_type(self, option: Dict, strategy: OptionsStrategyType) -> OptionsSignalType:
        """Options sinyal türünü belirle"""
        try:
            delta = option["delta"]
            premium = option["premium"]
            
            if strategy == OptionsStrategyType.COVERED_CALL:
                if delta > 0.5 and premium > 2.0:
                    return OptionsSignalType.SELL_CALL
                elif delta > 0.3:
                    return OptionsSignalType.WEAK_BUY_CALL
                else:
                    return OptionsSignalType.HOLD
            
            elif strategy == OptionsStrategyType.CASH_SECURED_PUT:
                if delta < -0.5 and premium > 2.0:
                    return OptionsSignalType.SELL_PUT
                elif delta < -0.3:
                    return OptionsSignalType.WEAK_BUY_PUT
                else:
                    return OptionsSignalType.HOLD
            
            elif strategy == OptionsStrategyType.STRADDLE:
                if premium > 3.0:
                    return OptionsSignalType.STRONG_BUY_CALL
                elif premium > 1.5:
                    return OptionsSignalType.BUY_CALL
                else:
                    return OptionsSignalType.WEAK_BUY_CALL
            
            return OptionsSignalType.HOLD
            
        except Exception as e:
            logger.error(f"❌ Options sinyal türü belirleme hatası: {e}")
            return OptionsSignalType.HOLD
    
    def _calculate_options_risk_reward(self, option: Dict, strategy: OptionsStrategyType) -> float:
        """Options risk/reward hesapla"""
        try:
            premium = option["premium"]
            
            if strategy == OptionsStrategyType.COVERED_CALL:
                # Covered Call: Premium alırsın, upside sınırlı
                max_profit = premium
                max_loss = option["strike"] - premium  # Strike - premium
                return max_profit / max_loss if max_loss > 0 else 0
            
            elif strategy == OptionsStrategyType.CASH_SECURED_PUT:
                # Cash Secured Put: Premium alırsın, downside risk
                max_profit = premium
                max_loss = option["strike"] - premium
                return max_profit / max_loss if max_loss > 0 else 0
            
            elif strategy == OptionsStrategyType.STRADDLE:
                # Straddle: Her iki yönde de kazanç
                max_profit = float('inf')  # Teorik olarak sınırsız
                max_loss = premium
                return 2.0  # Sabit risk/reward
            
            return 1.0
            
        except Exception as e:
            logger.error(f"❌ Risk/reward hesaplama hatası: {e}")
            return 1.0
    
    def _calculate_options_confidence(self, option: Dict, options_data: Dict, strategy: OptionsStrategyType) -> float:
        """Options güven skoru hesapla"""
        try:
            confidence = 0.0
            
            # Delta skoru
            delta = abs(option["delta"])
            if 0.4 <= delta <= 0.6:
                confidence += 0.3
            elif 0.3 <= delta <= 0.7:
                confidence += 0.2
            
            # Premium skoru
            premium = option["premium"]
            if 1.0 <= premium <= 10.0:
                confidence += 0.2
            
            # IV skoru
            iv = option["iv"]
            if 0.2 <= iv <= 0.6:
                confidence += 0.2
            
            # Volume skoru
            volume = option["volume"]
            if volume > 500:
                confidence += 0.1
            elif volume > 100:
                confidence += 0.05
            
            # Open Interest skoru
            oi = option["open_interest"]
            if oi > 200:
                confidence += 0.1
            elif oi > 50:
                confidence += 0.05
            
            # Strateji skoru
            if strategy == OptionsStrategyType.COVERED_CALL:
                confidence += 0.1
            elif strategy == OptionsStrategyType.CASH_SECURED_PUT:
                confidence += 0.1
            
            return min(confidence, 1.0)
            
        except Exception as e:
            logger.error(f"❌ Güven skoru hesaplama hatası: {e}")
            return 0.0
    
    def _calculate_options_pnl(self, option: Dict, strategy: OptionsStrategyType) -> Tuple[float, float, float]:
        """Options P&L hesapla"""
        try:
            premium = option["premium"]
            strike = option["strike"]
            
            if strategy == OptionsStrategyType.COVERED_CALL:
                max_profit = premium
                max_loss = strike - premium
                breakeven = strike - premium
                return max_profit, max_loss, breakeven
            
            elif strategy == OptionsStrategyType.CASH_SECURED_PUT:
                max_profit = premium
                max_loss = strike - premium
                breakeven = strike - premium
                return max_profit, max_loss, breakeven
            
            elif strategy == OptionsStrategyType.STRADDLE:
                max_profit = float('inf')
                max_loss = premium
                breakeven = strike + premium
                return max_profit, max_loss, breakeven
            
            return 0.0, 0.0, 0.0
            
        except Exception as e:
            logger.error(f"❌ P&L hesaplama hatası: {e}")
            return 0.0, 0.0, 0.0
    
    def _get_options_reasons(self, option: Dict, options_data: Dict, strategy: OptionsStrategyType) -> List[str]:
        """Options nedenleri"""
        reasons = []
        
        try:
            # Delta nedenleri
            delta = abs(option["delta"])
            if 0.4 <= delta <= 0.6:
                reasons.append(f"Optimal delta: {delta:.2f}")
            elif delta > 0.6:
                reasons.append(f"Yüksek delta: {delta:.2f}")
            else:
                reasons.append(f"Düşük delta: {delta:.2f}")
            
            # Premium nedenleri
            premium = option["premium"]
            if premium > 2.0:
                reasons.append(f"Yüksek premium: ${premium:.2f}")
            else:
                reasons.append(f"Uygun premium: ${premium:.2f}")
            
            # IV nedenleri
            iv = option["iv"]
            if iv > 0.4:
                reasons.append(f"Yüksek IV: {iv:.1%}")
            else:
                reasons.append(f"Düşük IV: {iv:.1%}")
            
            # Strateji nedenleri
            if strategy == OptionsStrategyType.COVERED_CALL:
                reasons.append("Covered Call stratejisi")
            elif strategy == OptionsStrategyType.CASH_SECURED_PUT:
                reasons.append("Cash Secured Put stratejisi")
            elif strategy == OptionsStrategyType.STRADDLE:
                reasons.append("Straddle stratejisi")
            
            # Volume nedenleri
            volume = option["volume"]
            if volume > 500:
                reasons.append(f"Yüksek hacim: {volume}")
            
            return reasons
            
        except Exception as e:
            logger.error(f"❌ Nedenler oluşturma hatası: {e}")
            return ["Options analizi"]
    
    def execute_options_trade(self, signal: OptionsSignal) -> Dict:
        """Options işlemi gerçekleştir"""
        try:
            logger.info(f"🚀 {signal.symbol} options işlemi başlatılıyor...")
            logger.info(f"   📈 Strateji: {signal.strategy.value}")
            logger.info(f"   🎯 Strike: ${signal.strike_price:.2f}")
            logger.info(f"   📅 Expiration: {signal.expiration_date}")
            logger.info(f"   💰 Premium: ${signal.premium:.2f}")
            logger.info(f"   📊 Delta: {signal.delta:.2f}")
            logger.info(f"   ⚡ Risk/Reward: {signal.risk_reward:.2f}")
            logger.info(f"   🎯 Max Profit: ${signal.max_profit:.2f}")
            logger.info(f"   🛑 Max Loss: ${signal.max_loss:.2f}")
            
            # Pozisyon kaydet
            position_id = f"{signal.symbol}_{signal.strategy.value}_{signal.timestamp.strftime('%Y%m%d_%H%M%S')}"
            self.active_positions[position_id] = {
                "signal": signal,
                "entry_time": signal.timestamp,
                "status": "ACTIVE",
                "current_premium": signal.premium,
                "profit_loss": 0.0
            }
            
            # Performans metriklerini güncelle
            self.performance_metrics["total_trades"] += 1
            
            if signal.action.value.startswith("SELL"):
                self.performance_metrics["total_premium_collected"] += signal.premium
            else:
                self.performance_metrics["total_premium_paid"] += signal.premium
            
            return {
                "status": "SUCCESS",
                "position_id": position_id,
                "message": f"{signal.symbol} options pozisyonu açıldı"
            }
            
        except Exception as e:
            logger.error(f"❌ {signal.symbol} options işlem hatası: {e}")
            return {
                "status": "ERROR",
                "message": str(e)
            }
    
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
                "total_history": len(self.options_history),
                "last_10_trades": self.options_history[-10:] if self.options_history else []
            }
            
        except Exception as e:
            logger.error(f"❌ Performans raporu hatası: {e}")
            return {"error": str(e)}

# Demo fonksiyonu
async def demo_options_robot():
    """Options robot demo"""
    try:
        logger.info("🚀 US Market Options Robot Demo Başlatılıyor...")
        
        robot = USMarketOptionsRobot()
        
        # Options fırsatlarını tara
        signals = robot.scan_options_opportunities()
        
        if signals:
            logger.info(f"🎯 {len(signals)} options fırsatı bulundu!")
            
            # En iyi sinyali al
            best_signal = signals[0]
            logger.info(f"🏆 En iyi fırsat: {best_signal.symbol}")
            
            # İşlemi gerçekleştir
            result = robot.execute_options_trade(best_signal)
            logger.info(f"📊 İşlem sonucu: {result}")
            
        else:
            logger.info("⏸️ Şu an options fırsatı yok")
        
        # Performans raporu
        performance = robot.get_performance_report()
        logger.info(f"📈 Performans: {performance}")
        
    except Exception as e:
        logger.error(f"❌ Demo hatası: {e}")

if __name__ == "__main__":
    asyncio.run(demo_options_robot())
