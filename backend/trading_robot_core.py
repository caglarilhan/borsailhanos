import asyncio
import logging
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from enum import Enum
import pandas as pd
import numpy as np

# Mevcut modüllerimizi import ediyoruz
from lightgbm_pipeline import LightGBMPipeline
from prophet_model import ProphetModel
from timegpt_mock import TimeGPTMock
from ensemble_combiner import EnsembleCombiner
from finnhub_websocket_layer import FinnhubWebSocketLayer
from fundamental_data_layer import FundamentalDataLayer

# Logging ayarları
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TradingMode(Enum):
    AGGRESSIVE = "aggressive"
    NORMAL = "normal"
    SAFE = "safe"

@dataclass
class Position:
    symbol: str
    entry_price: float
    quantity: float
    entry_time: datetime
    stop_loss: float
    take_profit: float
    mode: TradingMode
    signal_confidence: float

@dataclass
class RiskParams:
    max_position_size: float  # Toplam sermayenin yüzdesi
    stop_loss: float         # Zarar kesme yüzdesi
    take_profit: float       # Kar alma yüzdesi
    max_positions: int       # Maksimum açık pozisyon sayısı
    timeframe: str           # İşlem zaman dilimi
    min_confidence: float   # Minimum sinyal güveni
    max_drawdown: float      # Maksimum zarar limiti

class TradingRobot:
    """
    3 Modlu Trading Robotu:
    - AGGRESSIVE: Yüksek frekans, yüksek risk
    - NORMAL: Orta frekans, orta risk  
    - SAFE: Düşük frekans, düşük risk
    """
    
    def __init__(self, mode: TradingMode, initial_capital: float = 100000):
        self.mode = mode
        self.initial_capital = initial_capital
        self.current_capital = initial_capital
        self.positions: Dict[str, Position] = {}
        self.closed_positions: List[Dict] = []
        self.risk_params = self._get_risk_params()
        self.performance_metrics = {
            'total_trades': 0,
            'winning_trades': 0,
            'losing_trades': 0,
            'total_profit': 0.0,
            'max_drawdown': 0.0,
            'sharpe_ratio': 0.0
        }
        
        # AI modüllerini başlat
        self.lightgbm_pipeline = LightGBMPipeline()
        self.prophet_model = ProphetModel()
        self.timegpt_mock = TimeGPTMock()
        self.ensemble_combiner = EnsembleCombiner(
            self.lightgbm_pipeline, 
            self.prophet_model, 
            self.timegpt_mock
        )
        
        # Veri katmanlarını başlat
        self.ws_layer = FinnhubWebSocketLayer(use_mock=True)
        self.fundamental_layer = FundamentalDataLayer()
        
        logger.info(f"🤖 Trading Robot başlatıldı - Mod: {mode.value}, Başlangıç Sermayesi: {initial_capital:,.2f} ₺")
        logger.info(f"📊 Risk Parametreleri: {self.risk_params}")
    
    def _get_risk_params(self) -> RiskParams:
        """Mod bazlı risk parametrelerini döndür"""
        if self.mode == TradingMode.AGGRESSIVE:
            return RiskParams(
                max_position_size=0.3,    # %30
                stop_loss=0.02,          # %2
                take_profit=0.05,         # %5
                max_positions=5,
                timeframe="5m",
                min_confidence=0.7,
                max_drawdown=0.15         # %15
            )
        elif self.mode == TradingMode.NORMAL:
            return RiskParams(
                max_position_size=0.2,    # %20
                stop_loss=0.05,           # %5
                take_profit=0.12,         # %12
                max_positions=3,
                timeframe="1h",
                min_confidence=0.6,
                max_drawdown=0.10         # %10
            )
        else:  # SAFE
            return RiskParams(
                max_position_size=0.1,    # %10
                stop_loss=0.08,           # %8
                take_profit=0.25,         # %25
                max_positions=2,
                timeframe="1d",
                min_confidence=0.8,
                max_drawdown=0.05         # %5
            )
    
    async def get_market_data(self, symbol: str) -> pd.DataFrame:
        """Piyasa verilerini topla"""
        try:
            # WebSocket'ten anlık veri
            ws_data = await self.ws_layer.get_latest_price(symbol)
            
            # Fundamental veri
            fundamental_data = await self.fundamental_layer.get_financial_ratios(symbol)
            
            # Veriyi DataFrame'e dönüştür
            data = pd.DataFrame({
                'symbol': [symbol],
                'price': [ws_data.get('price', 0)],
                'volume': [ws_data.get('volume', 0)],
                'timestamp': [datetime.now()],
                'pe_ratio': [fundamental_data.get('pe_ratio', 0)],
                'pb_ratio': [fundamental_data.get('pb_ratio', 0)],
                'roe': [fundamental_data.get('roe', 0)],
                'debt_equity': [fundamental_data.get('debt_equity', 0)]
            })
            
            return data
            
        except Exception as e:
            logger.error(f"❌ Veri toplama hatası ({symbol}): {e}")
            return pd.DataFrame()
    
    async def analyze_signal(self, symbol: str) -> Dict:
        """AI ensemble ile sinyal analizi"""
        try:
            # Piyasa verilerini al
            market_data = await self.get_market_data(symbol)
            if market_data.empty:
                return {"action": "HOLD", "reason": "No market data", "confidence": 0.0}
            
            # Ensemble sinyal al
            ensemble_signal = self.ensemble_combiner.get_combined_signal(market_data)
            
            # Mod bazlı filtreleme
            if ensemble_signal['confidence'] < self.risk_params.min_confidence:
                return {
                    "action": "HOLD", 
                    "reason": f"Low confidence ({ensemble_signal['confidence']:.2f} < {self.risk_params.min_confidence})",
                    "confidence": ensemble_signal['confidence']
                }
            
            return {
                "action": ensemble_signal['signal'],
                "reason": f"Ensemble signal with {ensemble_signal['confidence']:.2f} confidence",
                "confidence": ensemble_signal['confidence'],
                "components": ensemble_signal['components']
            }
            
        except Exception as e:
            logger.error(f"❌ Sinyal analizi hatası ({symbol}): {e}")
            return {"action": "HOLD", "reason": f"Analysis error: {e}", "confidence": 0.0}
    
    def calculate_position_size(self, symbol: str, current_price: float, confidence: float) -> float:
        """Position sizing hesapla"""
        try:
            # Temel position size
            base_size = self.current_capital * self.risk_params.max_position_size
            
            # Confidence ile ayarla
            adjusted_size = base_size * confidence
            
            # Maksimum pozisyon sayısı kontrolü
            if len(self.positions) >= self.risk_params.max_positions:
                adjusted_size *= 0.5  # Yarıya düşür
            
            # Minimum işlem büyüklüğü kontrolü
            min_trade = 1000  # 1000 ₺ minimum
            if adjusted_size < min_trade:
                return 0.0
            
            # Lot hesapla (1000 lot = 1 lot)
            quantity = adjusted_size / current_price
            quantity = int(quantity / 1000) * 1000  # 1000'lik katları
            
            return quantity
            
        except Exception as e:
            logger.error(f"❌ Position sizing hatası: {e}")
            return 0.0
    
    def check_risk_limits(self) -> bool:
        """Risk limitlerini kontrol et"""
        try:
            # Drawdown kontrolü
            current_drawdown = (self.initial_capital - self.current_capital) / self.initial_capital
            if current_drawdown > self.risk_params.max_drawdown:
                logger.warning(f"⚠️ Maksimum drawdown aşıldı: {current_drawdown:.2%} > {self.risk_params.max_drawdown:.2%}")
                return False
            
            # Pozisyon sayısı kontrolü
            if len(self.positions) >= self.risk_params.max_positions:
                logger.info(f"ℹ️ Maksimum pozisyon sayısına ulaşıldı: {len(self.positions)}")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Risk kontrolü hatası: {e}")
            return False
    
    async def execute_trade(self, symbol: str, action: str, quantity: float, price: float) -> bool:
        """İşlemi gerçekleştir"""
        try:
            if action == "BUY":
                if symbol in self.positions:
                    logger.info(f"ℹ️ {symbol} zaten açık pozisyonda")
                    return False
                
                # Risk kontrolü
                if not self.check_risk_limits():
                    return False
                
                # Pozisyon aç
                position = Position(
                    symbol=symbol,
                    entry_price=price,
                    quantity=quantity,
                    entry_time=datetime.now(),
                    stop_loss=price * (1 - self.risk_params.stop_loss),
                    take_profit=price * (1 + self.risk_params.take_profit),
                    mode=self.mode,
                    signal_confidence=0.0  # TODO: confidence ekle
                )
                
                self.positions[symbol] = position
                self.current_capital -= quantity * price
                
                logger.info(f"🟢 BUY {symbol}: {quantity} lot @ {price:.2f} ₺")
                return True
                
            elif action == "SELL":
                if symbol not in self.positions:
                    logger.info(f"ℹ️ {symbol} açık pozisyon yok")
                    return False
                
                position = self.positions[symbol]
                profit_loss = (price - position.entry_price) * position.quantity
                
                # Pozisyonu kapat
                self.current_capital += position.quantity * price
                del self.positions[symbol]
                
                # Performans güncelle
                self.performance_metrics['total_trades'] += 1
                if profit_loss > 0:
                    self.performance_metrics['winning_trades'] += 1
                else:
                    self.performance_metrics['losing_trades'] += 1
                
                self.performance_metrics['total_profit'] += profit_loss
                
                # Kapalı pozisyonları kaydet
                self.closed_positions.append({
                    'symbol': symbol,
                    'entry_price': position.entry_price,
                    'exit_price': price,
                    'quantity': position.quantity,
                    'profit_loss': profit_loss,
                    'entry_time': position.entry_time.isoformat(),
                    'exit_time': datetime.now().isoformat(),
                    'mode': position.mode.value
                })
                
                logger.info(f"🔴 SELL {symbol}: {position.quantity} lot @ {price:.2f} ₺ (P/L: {profit_loss:+.2f} ₺)")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"❌ İşlem hatası ({symbol}): {e}")
            return False
    
    def check_stop_loss_take_profit(self, symbol: str, current_price: float) -> Optional[str]:
        """Stop-loss ve take-profit kontrolü"""
        if symbol not in self.positions:
            return None
        
        position = self.positions[symbol]
        
        # Stop-loss kontrolü
        if current_price <= position.stop_loss:
            return "SELL"  # Stop-loss tetiklendi
        
        # Take-profit kontrolü
        if current_price >= position.take_profit:
            return "SELL"  # Take-profit tetiklendi
        
        return None
    
    async def run_trading_cycle(self, symbols: List[str]) -> Dict:
        """Trading döngüsünü çalıştır"""
        try:
            logger.info(f"🔄 Trading döngüsü başlıyor - Mod: {self.mode.value}")
            
            results = {
                'timestamp': datetime.now().isoformat(),
                'mode': self.mode.value,
                'capital': self.current_capital,
                'positions_count': len(self.positions),
                'actions_taken': [],
                'errors': []
            }
            
            # Açık pozisyonları kontrol et
            for symbol in list(self.positions.keys()):
                try:
                    market_data = await self.get_market_data(symbol)
                    if not market_data.empty:
                        current_price = market_data['price'].iloc[0]
                        
                        # Stop-loss/Take-profit kontrolü
                        sl_tp_action = self.check_stop_loss_take_profit(symbol, current_price)
                        if sl_tp_action:
                            await self.execute_trade(symbol, sl_tp_action, self.positions[symbol].quantity, current_price)
                            results['actions_taken'].append({
                                'symbol': symbol,
                                'action': sl_tp_action,
                                'reason': 'Stop-loss/Take-profit triggered',
                                'price': current_price
                            })
                
                except Exception as e:
                    results['errors'].append(f"Pozisyon kontrolü hatası ({symbol}): {e}")
            
            # Yeni sinyaller için analiz
            for symbol in symbols:
                try:
                    # Açık pozisyon kontrolü
                    if symbol in self.positions:
                        continue
                    
                    # Sinyal analizi
                    signal = await self.analyze_signal(symbol)
                    
                    if signal['action'] in ['BUY', 'SELL']:
                        # Piyasa verisi al
                        market_data = await self.get_market_data(symbol)
                        if not market_data.empty:
                            current_price = market_data['price'].iloc[0]
                            
                            if signal['action'] == 'BUY':
                                # Position sizing
                                quantity = self.calculate_position_size(symbol, current_price, signal['confidence'])
                                if quantity > 0:
                                    success = await self.execute_trade(symbol, 'BUY', quantity, current_price)
                                    if success:
                                        results['actions_taken'].append({
                                            'symbol': symbol,
                                            'action': 'BUY',
                                            'reason': signal['reason'],
                                            'price': current_price,
                                            'quantity': quantity,
                                            'confidence': signal['confidence']
                                        })
                
                except Exception as e:
                    results['errors'].append(f"Sinyal analizi hatası ({symbol}): {e}")
            
            # Performans metriklerini güncelle
            self._update_performance_metrics()
            
            logger.info(f"✅ Trading döngüsü tamamlandı - {len(results['actions_taken'])} işlem")
            return results
            
        except Exception as e:
            logger.error(f"❌ Trading döngüsü hatası: {e}")
            return {
                'timestamp': datetime.now().isoformat(),
                'mode': self.mode.value,
                'error': str(e),
                'actions_taken': [],
                'errors': [str(e)]
            }
    
    def _update_performance_metrics(self):
        """Performans metriklerini güncelle"""
        try:
            # Win rate
            if self.performance_metrics['total_trades'] > 0:
                win_rate = self.performance_metrics['winning_trades'] / self.performance_metrics['total_trades']
                self.performance_metrics['win_rate'] = win_rate
            
            # Sharpe ratio (basit hesaplama)
            if self.performance_metrics['total_trades'] > 0:
                avg_profit = self.performance_metrics['total_profit'] / self.performance_metrics['total_trades']
                self.performance_metrics['avg_profit_per_trade'] = avg_profit
            
            # Current drawdown
            current_drawdown = (self.initial_capital - self.current_capital) / self.initial_capital
            if current_drawdown > self.performance_metrics['max_drawdown']:
                self.performance_metrics['max_drawdown'] = current_drawdown
            
        except Exception as e:
            logger.error(f"❌ Performans güncelleme hatası: {e}")
    
    def get_status(self) -> Dict:
        """Robot durumunu döndür"""
        return {
            'mode': self.mode.value,
            'initial_capital': self.initial_capital,
            'current_capital': self.current_capital,
            'total_return': ((self.current_capital - self.initial_capital) / self.initial_capital) * 100,
            'open_positions': len(self.positions),
            'performance_metrics': self.performance_metrics,
            'risk_params': {
                'max_position_size': self.risk_params.max_position_size,
                'stop_loss': self.risk_params.stop_loss,
                'take_profit': self.risk_params.take_profit,
                'max_positions': self.risk_params.max_positions,
                'timeframe': self.risk_params.timeframe,
                'min_confidence': self.risk_params.min_confidence,
                'max_drawdown': self.risk_params.max_drawdown
            }
        }
    
    def save_results(self, filename: str = None):
        """Sonuçları dosyaya kaydet"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"trading_robot_{self.mode.value}_{timestamp}.json"
        
        data = {
            'robot_status': self.get_status(),
            'closed_positions': self.closed_positions,
            'open_positions': {
                symbol: {
                    'entry_price': pos.entry_price,
                    'quantity': pos.quantity,
                    'entry_time': pos.entry_time.isoformat(),
                    'stop_loss': pos.stop_loss,
                    'take_profit': pos.take_profit
                } for symbol, pos in self.positions.items()
            }
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"💾 Sonuçlar kaydedildi: {filename}")
        return filename

