import asyncio
import logging
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import pandas as pd
import numpy as np

from trading_robot_core import TradingRobot, TradingMode
from broker_integration import BrokerManager, BrokerType, OrderRequest

logger = logging.getLogger(__name__)

class UltraAggressiveMode(TradingRobot):
    """
    Ultra Agresif Mod - Günlük Yüksek Kazanç İçin
    Scalping ve Day Trading Stratejileri
    """
    
    def __init__(self, initial_capital: float = 100000):
        # Ultra agresif parametreler
        self.mode = TradingMode.AGGRESSIVE
        self.initial_capital = initial_capital
        self.current_capital = initial_capital
        
        # Ultra agresif risk parametreleri
        self.ultra_params = {
            'max_position_size': 0.8,    # %80 (normal %30) - TÜM PARAYI KULLAN
            'stop_loss': 0.02,           # %2 (normal %2) - Biraz daha geniş
            'take_profit': 0.08,         # %8 (normal %5) - ÇOK DAHA YÜKSEK
            'max_positions': 15,         # 15 pozisyon (normal 5) - DAHA FAZLA
            'timeframe': '30s',          # 30 saniye (normal 1m) - DAHA HIZLI
            'min_confidence': 0.7,       # %70 güven (normal %80) - DAHA FAZLA SİNYAL
            'max_drawdown': 0.30,        # %30 (normal %20) - DAHA YÜKSEK RİSK
            'scalping_enabled': True,    # Scalping aktif
            'day_trading_enabled': True, # Day trading aktif
            'max_daily_trades': 100,     # Günlük max 100 işlem (normal 50)
            'profit_target_daily': 0.50, # Günlük %50 hedef (normal %5)
            'profit_target_weekly': 2.0, # Haftalık %200 hedef
            'profit_target_monthly': 5.0 # Aylık %500 hedef
        }
        
        # Günlük takip
        self.daily_stats = {
            'trades_today': 0,
            'profit_today': 0.0,
            'start_time': datetime.now(),
            'last_reset': datetime.now().date()
        }
        
        # AI modüllerini başlat
        super().__init__(self.mode, initial_capital)
        
        logger.info("🔥 Ultra Agresif Mod başlatıldı!")
        logger.info(f"💰 Hedef: Günlük %{self.ultra_params['profit_target_daily']*100} kazanç")
        logger.info(f"📈 Haftalık Hedef: %{self.ultra_params['profit_target_weekly']*100} kazanç")
        logger.info(f"🚀 Aylık Hedef: %{self.ultra_params['profit_target_monthly']*100} kazanç")
        logger.info(f"⚡ Maksimum: {self.ultra_params['max_daily_trades']} işlem/gün")
        logger.info(f"💸 Position Size: %{self.ultra_params['max_position_size']*100} (TÜM PARA)")
    
    def _get_risk_params(self):
        """Ultra agresif risk parametreleri"""
        from dataclasses import dataclass
        
        @dataclass
        class RiskParams:
            max_position_size: float
            stop_loss: float
            take_profit: float
            max_positions: int
            timeframe: str
            min_confidence: float
            max_drawdown: float
        
        return RiskParams(
            max_position_size=self.ultra_params['max_position_size'],
            stop_loss=self.ultra_params['stop_loss'],
            take_profit=self.ultra_params['take_profit'],
            max_positions=self.ultra_params['max_positions'],
            timeframe=self.ultra_params['timeframe'],
            min_confidence=self.ultra_params['min_confidence'],
            max_drawdown=self.ultra_params['max_drawdown']
        )
    
    async def scalping_strategy(self, symbol: str) -> Dict:
        """Ultra agresif scalping stratejisi - 30 saniye-5 dakika tutma"""
        try:
            # 30 saniyelik veri al
            market_data = await self.get_market_data(symbol)
            if market_data.empty:
                return {"action": "HOLD", "reason": "No data", "confidence": 0.0}
            
            current_price = market_data['price'].iloc[0]
            volume = market_data['volume'].iloc[0]
            
            # Ultra hızlı teknik analiz
            rsi = self._calculate_rsi(market_data, 7)  # Daha kısa periyot
            macd_signal = self._calculate_macd_signal(market_data)
            volume_spike = volume > self._get_avg_volume(symbol) * 1.2  # Daha düşük eşik
            
            # Momentum analizi
            price_change = self._calculate_price_change(market_data, 5)  # Son 5 veri
            momentum = self._calculate_momentum(market_data)
            
            # Ultra agresif scalping sinyali - DAHA FAZLA SİNYAL
            if (rsi < 35 or price_change > 0.01) and (macd_signal > 0 or momentum > 0):
                return {
                    "action": "BUY",
                    "reason": "Ultra Scalping: Momentum + RSI/MACD",
                    "confidence": 0.75,
                    "hold_time": "30s-5min"
                }
            elif (rsi > 65 or price_change < -0.01) and (macd_signal < 0 or momentum < 0):
                return {
                    "action": "SELL", 
                    "reason": "Ultra Scalping: Reverse Momentum + RSI/MACD",
                    "confidence": 0.75,
                    "hold_time": "30s-5min"
                }
            
            # Ek sinyaller - DAHA FAZLA FIRSAT
            if volume_spike and abs(price_change) > 0.005:
                return {
                    "action": "BUY" if price_change > 0 else "SELL",
                    "reason": "Ultra Scalping: Volume Spike + Price Move",
                    "confidence": 0.70,
                    "hold_time": "30s-2min"
                }
            
            return {"action": "HOLD", "reason": "No ultra scalping signal", "confidence": 0.0}
            
        except Exception as e:
            logger.error(f"❌ Ultra scalping stratejisi hatası: {e}")
            return {"action": "HOLD", "reason": f"Error: {e}", "confidence": 0.0}
    
    async def day_trading_strategy(self, symbol: str) -> Dict:
        """Day trading stratejisi - 2-4 saat tutma"""
        try:
            # 5 dakikalık veri al
            market_data = await self.get_market_data(symbol)
            if market_data.empty:
                return {"action": "HOLD", "reason": "No data", "confidence": 0.0}
            
            # Trend analizi
            ema_20 = self._calculate_ema(market_data, 20)
            ema_50 = self._calculate_ema(market_data, 50)
            current_price = market_data['price'].iloc[0]
            
            # Trend sinyali
            if ema_20 > ema_50 and current_price > ema_20:
                return {
                    "action": "BUY",
                    "reason": "Day Trading: Uptrend + Price > EMA20",
                    "confidence": 0.75,
                    "hold_time": "2-4h"
                }
            elif ema_20 < ema_50 and current_price < ema_20:
                return {
                    "action": "SELL",
                    "reason": "Day Trading: Downtrend + Price < EMA20", 
                    "confidence": 0.75,
                    "hold_time": "2-4h"
                }
            
            return {"action": "HOLD", "reason": "No day trading signal", "confidence": 0.0}
            
        except Exception as e:
            logger.error(f"❌ Day trading stratejisi hatası: {e}")
            return {"action": "HOLD", "reason": f"Error: {e}", "confidence": 0.0}
    
    async def ultra_aggressive_cycle(self, symbols: List[str]) -> Dict:
        """Ultra agresif trading döngüsü"""
        try:
            # Günlük reset kontrolü
            self._check_daily_reset()
            
            # Günlük limit kontrolü
            if self.daily_stats['trades_today'] >= self.ultra_params['max_daily_trades']:
                return {
                    'timestamp': datetime.now().isoformat(),
                    'mode': 'ultra_aggressive',
                    'message': 'Günlük işlem limiti doldu',
                    'actions_taken': [],
                    'daily_profit': self.daily_stats['profit_today']
                }
            
            # Günlük kazanç hedefi kontrolü
            daily_return = (self.current_capital - self.initial_capital) / self.initial_capital
            if daily_return >= self.ultra_params['profit_target_daily']:
                return {
                    'timestamp': datetime.now().isoformat(),
                    'mode': 'ultra_aggressive', 
                    'message': 'Günlük kazanç hedefi ulaşıldı',
                    'actions_taken': [],
                    'daily_profit': self.daily_stats['profit_today']
                }
            
            results = {
                'timestamp': datetime.now().isoformat(),
                'mode': 'ultra_aggressive',
                'actions_taken': [],
                'errors': []
            }
            
            # Her sembol için strateji uygula
            for symbol in symbols:
                try:
                    # Scalping stratejisi
                    if self.ultra_params['scalping_enabled']:
                        scalping_signal = await self.scalping_strategy(symbol)
                        if scalping_signal['action'] in ['BUY', 'SELL']:
                            success = await self._execute_ultra_trade(symbol, scalping_signal)
                            if success:
                                results['actions_taken'].append({
                                    'symbol': symbol,
                                    'action': scalping_signal['action'],
                                    'strategy': 'scalping',
                                    'confidence': scalping_signal['confidence'],
                                    'hold_time': scalping_signal.get('hold_time', '5-15min')
                                })
                                self.daily_stats['trades_today'] += 1
                    
                    # Day trading stratejisi
                    if self.ultra_params['day_trading_enabled']:
                        day_signal = await self.day_trading_strategy(symbol)
                        if day_signal['action'] in ['BUY', 'SELL']:
                            success = await self._execute_ultra_trade(symbol, day_signal)
                            if success:
                                results['actions_taken'].append({
                                    'symbol': symbol,
                                    'action': day_signal['action'],
                                    'strategy': 'day_trading',
                                    'confidence': day_signal['confidence'],
                                    'hold_time': day_signal.get('hold_time', '2-4h')
                                })
                                self.daily_stats['trades_today'] += 1
                
                except Exception as e:
                    results['errors'].append(f"Strateji hatası ({symbol}): {e}")
            
            # Günlük kazancı güncelle
            self.daily_stats['profit_today'] = self.current_capital - self.initial_capital
            results['daily_profit'] = self.daily_stats['profit_today']
            results['daily_trades'] = self.daily_stats['trades_today']
            
            return results
            
        except Exception as e:
            logger.error(f"❌ Ultra agresif döngü hatası: {e}")
            return {
                'timestamp': datetime.now().isoformat(),
                'mode': 'ultra_aggressive',
                'error': str(e),
                'actions_taken': [],
                'errors': [str(e)]
            }
    
    async def _execute_ultra_trade(self, symbol: str, signal: Dict) -> bool:
        """Ultra agresif işlem gerçekleştir"""
        try:
            # Confidence kontrolü
            if signal['confidence'] < self.ultra_params['min_confidence']:
                return False
            
            # Piyasa verisi al
            market_data = await self.get_market_data(symbol)
            if market_data.empty:
                return False
            
            current_price = market_data['price'].iloc[0]
            
            # Position sizing (ultra agresif)
            quantity = self._calculate_ultra_position_size(symbol, current_price, signal['confidence'])
            if quantity <= 0:
                return False
            
            # İşlemi gerçekleştir
            success = await self.execute_trade(symbol, signal['action'], quantity, current_price)
            
            if success:
                logger.info(f"🔥 Ultra Agresif: {signal['action']} {symbol} @ {current_price}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"❌ Ultra işlem hatası: {e}")
            return False
    
    def _calculate_ultra_position_size(self, symbol: str, price: float, confidence: float) -> float:
        """Ultra agresif position sizing - TÜM PARAYI KULLAN"""
        try:
            # TÜM PARAYI KULLAN stratejisi
            available_capital = self.current_capital * 0.95  # %95'ini kullan
            
            # Confidence ile ayarla
            adjusted_size = available_capital * confidence
            
            # Günlük işlem sayısına göre ayarla - DAHA AZ AZALT
            if self.daily_stats['trades_today'] > 50:
                adjusted_size *= 0.7  # %30 azalt (normal %50)
            elif self.daily_stats['trades_today'] > 80:
                adjusted_size *= 0.5  # %50 azalt
            
            # Minimum işlem büyüklüğü - DAHA DÜŞÜK
            min_trade = 100  # 100 ₺ minimum (normal 500)
            if adjusted_size < min_trade:
                return 0.0
            
            # Lot hesapla - DAHA KÜÇÜK LOTLAR
            quantity = adjusted_size / price
            quantity = int(quantity / 50) * 50  # 50'lik katları (normal 100)
            
            # Maksimum lot kontrolü
            max_lot = 10000  # Maksimum 10K lot
            if quantity > max_lot:
                quantity = max_lot
            
            return quantity
            
        except Exception as e:
            logger.error(f"❌ Ultra position sizing hatası: {e}")
            return 0.0
    
    def _check_daily_reset(self):
        """Günlük istatistikleri sıfırla"""
        today = datetime.now().date()
        if today > self.daily_stats['last_reset']:
            self.daily_stats['trades_today'] = 0
            self.daily_stats['profit_today'] = 0.0
            self.daily_stats['last_reset'] = today
            self.daily_stats['start_time'] = datetime.now()
            logger.info("🔄 Günlük istatistikler sıfırlandı")
    
    def _calculate_rsi(self, data: pd.DataFrame, period: int = 14) -> float:
        """RSI hesapla"""
        try:
            if len(data) < period:
                return 50.0
            
            prices = data['price'].values
            deltas = np.diff(prices)
            gains = np.where(deltas > 0, deltas, 0)
            losses = np.where(deltas < 0, -deltas, 0)
            
            avg_gain = np.mean(gains[-period:])
            avg_loss = np.mean(losses[-period:])
            
            if avg_loss == 0:
                return 100.0
            
            rs = avg_gain / avg_loss
            rsi = 100 - (100 / (1 + rs))
            
            return rsi
        except:
            return 50.0
    
    def _calculate_macd_signal(self, data: pd.DataFrame) -> float:
        """MACD sinyali hesapla"""
        try:
            if len(data) < 26:
                return 0.0
            
            prices = data['price'].values
            ema_12 = np.mean(prices[-12:])
            ema_26 = np.mean(prices[-26:])
            
            macd = ema_12 - ema_26
            return macd
        except:
            return 0.0
    
    def _calculate_ema(self, data: pd.DataFrame, period: int) -> float:
        """EMA hesapla"""
        try:
            if len(data) < period:
                return data['price'].iloc[-1]
            
            prices = data['price'].values
            alpha = 2 / (period + 1)
            ema = prices[0]
            
            for price in prices[1:]:
                ema = alpha * price + (1 - alpha) * ema
            
            return ema
        except:
            return data['price'].iloc[-1]
    
    def _get_avg_volume(self, symbol: str) -> float:
        """Ortalama hacim hesapla"""
        try:
            # Basit ortalama (gerçekte daha karmaşık olabilir)
            return 1000000  # 1M lot varsayılan
        except:
            return 1000000
    
    def _calculate_price_change(self, data: pd.DataFrame, periods: int = 5) -> float:
        """Fiyat değişimi hesapla"""
        try:
            if len(data) < periods:
                return 0.0
            
            prices = data['price'].values
            current_price = prices[-1]
            past_price = prices[-periods]
            
            return (current_price - past_price) / past_price
        except:
            return 0.0
    
    def _calculate_momentum(self, data: pd.DataFrame, periods: int = 3) -> float:
        """Momentum hesapla"""
        try:
            if len(data) < periods:
                return 0.0
            
            prices = data['price'].values
            momentum = 0.0
            
            for i in range(1, periods):
                if i < len(prices):
                    momentum += (prices[-i] - prices[-i-1]) / prices[-i-1]
            
            return momentum / (periods - 1)
        except:
            return 0.0
    
    def get_ultra_status(self) -> Dict:
        """Ultra agresif durum raporu"""
        status = self.get_status()
        
        return {
            **status,
            'ultra_params': self.ultra_params,
            'daily_stats': self.daily_stats,
            'daily_return': (self.current_capital - self.initial_capital) / self.initial_capital,
            'target_reached': (self.current_capital - self.initial_capital) / self.initial_capital >= self.ultra_params['profit_target_daily']
        }

# Demo fonksiyonu
async def ultra_aggressive_demo():
    """Ultra agresif mod demo"""
    try:
        logger.info("🔥 Ultra Agresif Mod Demo Başlıyor!")
        
        # Ultra agresif robot oluştur
        robot = UltraAggressiveMode(initial_capital=50000)
        
        symbols = ["SISE.IS", "EREGL.IS", "TUPRS.IS"]
        
        # 10 döngü çalıştır
        for cycle in range(10):
            logger.info(f"🔄 Ultra Agresif Döngü {cycle + 1}/10")
            
            result = await robot.ultra_aggressive_cycle(symbols)
            
            if result['actions_taken']:
                logger.info(f"   📈 {len(result['actions_taken'])} işlem gerçekleşti")
                for action in result['actions_taken']:
                    logger.info(f"      {action['action']} {action['symbol']} ({action['strategy']})")
            
            logger.info(f"   💰 Günlük Kazanç: {result.get('daily_profit', 0):,.2f} ₺")
            logger.info(f"   📊 Günlük İşlem: {result.get('daily_trades', 0)}")
            
            await asyncio.sleep(1)  # 1 saniye bekle
        
        # Final durum
        final_status = robot.get_ultra_status()
        logger.info("🔥 Ultra Agresif Demo Tamamlandı!")
        logger.info(f"💰 Toplam Kazanç: {final_status['total_profit']:,.2f} ₺")
        logger.info(f"📈 Toplam Getiri: {final_status['total_return']:.2f}%")
        logger.info(f"🎯 Hedef Ulaşıldı: {final_status['target_reached']}")
        
        return final_status
        
    except Exception as e:
        logger.error(f"❌ Ultra agresif demo hatası: {e}")
        return None

if __name__ == "__main__":
    asyncio.run(ultra_aggressive_demo())
