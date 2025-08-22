#!/usr/bin/env python3
"""
BIST AI Smart Trader - Trading Robot
AI sinyallerine göre otomatik al-sat kararları veren robot
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Any, Optional, Tuple
import asyncio
import json
import os

# AI modules
try:
    from ai_models.ensemble_manager import AIEnsembleManager
    from ai_models.macro_regime_detector import MacroRegimeDetector
    from ai_models.sentiment_tr import TurkishSentiment
except ImportError:
    print("⚠️ Using mock modules for testing...")
    
    class MockAIEnsembleManager:
        def get_ensemble_prediction(self, symbol, data):
            return {
                'prediction': np.random.random(10),
                'confidence': np.random.random(10),
                'ensemble_method': 'Mock'
            }
    
    class MockMacroRegimeDetector:
        def update_regime(self):
            return 'bullish', 0.8, {'lightgbm': 0.3, 'catboost': 0.3}
    
    class MockTurkishSentiment:
        def score_symbol_news(self, symbol):
            return 0.1
    
    AIEnsembleManager = MockAIEnsembleManager
    MacroRegimeDetector = MockMacroRegimeDetector
    TurkishSentiment = MockTurkishSentiment

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TradingRobot:
    """AI destekli al-sat robotu"""
    
    def __init__(self, initial_capital: float = 100000, risk_per_trade: float = 0.02):
        """
        Trading Robot başlat
        
        Args:
            initial_capital: Başlangıç sermayesi (TL)
            risk_per_trade: İşlem başına risk oranı (0.02 = %2)
        """
        self.initial_capital = initial_capital
        self.current_capital = initial_capital
        self.risk_per_trade = risk_per_trade
        
        # AI Models
        self.ai_ensemble = AIEnsembleManager()
        self.macro_detector = MacroRegimeDetector()
        self.sentiment_analyzer = TurkishSentiment()
        
        # Portfolio tracking
        self.portfolio = {}  # symbol -> {quantity, avg_price, current_value}
        self.trade_history = []
        self.open_positions = {}
        
        # Risk management
        self.max_position_size = 0.1  # Maksimum %10 tek pozisyon
        self.stop_loss_default = 0.05  # Varsayılan %5 stop loss
        self.take_profit_default = 0.15  # Varsayılan %15 take profit
        
        # Performance metrics
        self.total_trades = 0
        self.winning_trades = 0
        self.losing_trades = 0
        self.total_pnl = 0.0
        self.max_drawdown = 0.0
        
        # Trading signals
        self.signal_threshold = 0.7  # Minimum sinyal güveni
        self.confidence_threshold = 0.6  # Minimum AI güveni
        
        logger.info(f"🤖 Trading Robot başlatıldı - Başlangıç: {initial_capital:,.0f} TL")
    
    def analyze_symbol(self, symbol: str) -> Dict[str, Any]:
        """Tek hisse için kapsamlı analiz"""
        try:
            # Fiyat verisi al
            stock = yf.Ticker(symbol)
            data = stock.history(period="3mo")
            
            if data.empty:
                return {'error': 'Veri bulunamadı'}
            
            # AI Ensemble tahmini
            ai_prediction = self.ai_ensemble.get_ensemble_prediction(symbol, data)
            
            # Makro rejim
            regime, confidence, weights = self.macro_detector.update_regime()
            
            # Sentiment analizi
            sentiment_score = self.sentiment_analyzer.score_symbol_news(symbol)
            
            # Teknik analiz
            technical_signals = self._calculate_technical_signals(data)
            
            # Risk analizi
            risk_metrics = self._calculate_risk_metrics(data)
            
            # Trading sinyali
            trading_signal = self._generate_trading_signal(
                ai_prediction, technical_signals, sentiment_score, regime
            )
            
            return {
                'symbol': symbol,
                'current_price': float(data['Close'].iloc[-1]),
                'ai_prediction': ai_prediction,
                'technical_signals': technical_signals,
                'sentiment_score': sentiment_score,
                'macro_regime': regime,
                'regime_confidence': confidence,
                'risk_metrics': risk_metrics,
                'trading_signal': trading_signal,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ {symbol} analiz hatası: {e}")
            return {'error': str(e)}
    
    def _calculate_technical_signals(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Teknik analiz sinyalleri"""
        try:
            close = data['Close']
            high = data['High']
            low = data['Low']
            volume = data['Volume']
            
            # Moving averages
            sma_20 = close.rolling(20).mean()
            sma_50 = close.rolling(50).mean()
            ema_12 = close.ewm(span=12).mean()
            ema_26 = close.ewm(span=26).mean()
            
            # RSI
            delta = close.diff()
            gain = (delta.where(delta > 0, 0)).rolling(14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            
            # MACD
            macd = ema_12 - ema_26
            macd_signal = macd.ewm(span=9).mean()
            macd_histogram = macd - macd_signal
            
            # Bollinger Bands
            bb_middle = sma_20
            bb_std = close.rolling(20).std()
            bb_upper = bb_middle + (bb_std * 2)
            bb_lower = bb_middle - (bb_std * 2)
            
            # Volume analysis
            volume_sma = volume.rolling(20).mean()
            volume_ratio = volume.iloc[-1] / volume_sma.iloc[-1]
            
            # Current values
            current_price = close.iloc[-1]
            current_rsi = rsi.iloc[-1]
            current_macd = macd.iloc[-1]
            current_macd_signal = macd_signal.iloc[-1]
            
            # Signal generation
            signals = {
                'trend': 'bullish' if sma_20.iloc[-1] > sma_50.iloc[-1] else 'bearish',
                'rsi': 'oversold' if current_rsi < 30 else 'overbought' if current_rsi > 70 else 'neutral',
                'macd': 'bullish' if current_macd > current_macd_signal else 'bearish',
                'bollinger': 'upper' if current_price > bb_upper.iloc[-1] else 'lower' if current_price < bb_lower.iloc[-1] else 'middle',
                'volume': 'high' if volume_ratio > 1.5 else 'low' if volume_ratio < 0.5 else 'normal'
            }
            
            # Signal strength (0-100)
            signal_strength = 0
            
            # Trend strength
            if signals['trend'] == 'bullish':
                signal_strength += 20
            elif signals['trend'] == 'bearish':
                signal_strength -= 20
            
            # RSI strength
            if signals['rsi'] == 'oversold':
                signal_strength += 15
            elif signals['rsi'] == 'overbought':
                signal_strength -= 15
            
            # MACD strength
            if signals['macd'] == 'bullish':
                signal_strength += 15
            elif signals['macd'] == 'bearish':
                signal_strength -= 15
            
            # Bollinger strength
            if signals['bollinger'] == 'lower':
                signal_strength += 10
            elif signals['bollinger'] == 'upper':
                signal_strength -= 10
            
            # Volume strength
            if signals['volume'] == 'high':
                signal_strength += 10
            elif signals['volume'] == 'low':
                signal_strength -= 5
            
            return {
                'signals': signals,
                'signal_strength': signal_strength,
                'values': {
                    'rsi': float(current_rsi) if not pd.isna(current_rsi) else 50.0,
                    'macd': float(current_macd) if not pd.isna(current_macd) else 0.0,
                    'macd_signal': float(current_macd_signal) if not pd.isna(current_macd_signal) else 0.0,
                    'volume_ratio': float(volume_ratio) if not pd.isna(volume_ratio) else 1.0
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Teknik sinyal hesaplama hatası: {e}")
            return {'error': str(e)}
    
    def _calculate_risk_metrics(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Risk metrikleri hesapla"""
        try:
            close = data['Close']
            returns = close.pct_change().dropna()
            
            # Volatilite
            volatility = returns.std() * np.sqrt(252) * 100
            
            # VaR (Value at Risk) - %95 güven seviyesi
            var_95 = np.percentile(returns, 5) * 100
            
            # Maximum drawdown
            cumulative = (1 + returns).cumprod()
            running_max = cumulative.expanding().max()
            drawdown = (cumulative - running_max) / running_max
            max_drawdown = abs(drawdown.min()) * 100
            
            # Sharpe ratio (risk-free rate = 0.15 for Turkey)
            risk_free_rate = 0.15
            excess_returns = returns - risk_free_rate/252
            sharpe_ratio = np.sqrt(252) * excess_returns.mean() / returns.std()
            
            # Current price vs moving averages
            current_price = close.iloc[-1]
            sma_20 = close.rolling(20).mean().iloc[-1]
            sma_50 = close.rolling(50).mean().iloc[-1]
            
            price_vs_sma20 = ((current_price - sma_20) / sma_20) * 100
            price_vs_sma50 = ((current_price - sma_50) / sma_50) * 100
            
            return {
                'volatility': float(volatility),
                'var_95': float(var_95),
                'max_drawdown': float(max_drawdown),
                'sharpe_ratio': float(sharpe_ratio),
                'price_vs_sma20': float(price_vs_sma20),
                'price_vs_sma50': float(price_vs_sma50),
                'risk_level': 'high' if volatility > 40 else 'medium' if volatility > 20 else 'low'
            }
            
        except Exception as e:
            logger.error(f"❌ Risk metrik hesaplama hatası: {e}")
            return {'error': str(e)}
    
    def _generate_trading_signal(self, ai_prediction: Dict, technical_signals: Dict, 
                                sentiment_score: float, macro_regime: str) -> Dict[str, Any]:
        """Trading sinyali oluştur"""
        try:
            # AI confidence
            ai_confidence = np.mean(ai_prediction.get('confidence', [0.5]))
            
            # Technical signal strength
            tech_strength = technical_signals.get('signal_strength', 0)
            
            # Sentiment adjustment - safely handle different types
            if isinstance(sentiment_score, (tuple, list)):
                sentiment_value = float(sentiment_score[0]) if len(sentiment_score) > 0 else 0.5
            else:
                sentiment_value = float(sentiment_score) if sentiment_score is not None else 0.5
            
            sentiment_adjustment = (sentiment_value - 0.5) * 20  # -10 to +10
            
            # Macro regime adjustment - safely handle different types
            if isinstance(macro_regime, (tuple, list)):
                regime_str = str(macro_regime[0]) if len(macro_regime) > 0 else 'neutral'
            else:
                regime_str = str(macro_regime) if macro_regime is not None else 'neutral'
                
            regime_adjustment = 10 if regime_str == 'bullish' else -10 if regime_str == 'bearish' else 0
            
            # Combined signal strength
            combined_strength = tech_strength + sentiment_adjustment + regime_adjustment
            
            # Signal classification
            if combined_strength > 30 and ai_confidence > self.confidence_threshold:
                signal = 'BUY'
                signal_strength = 'STRONG'
            elif combined_strength > 15 and ai_confidence > self.confidence_threshold:
                signal = 'BUY'
                signal_strength = 'MODERATE'
            elif combined_strength < -30 and ai_confidence > self.confidence_threshold:
                signal = 'SELL'
                signal_strength = 'STRONG'
            elif combined_strength < -15 and ai_confidence > self.confidence_threshold:
                signal = 'SELL'
                signal_strength = 'MODERATE'
            else:
                signal = 'HOLD'
                signal_strength = 'WEAK'
            
            # Position sizing recommendation
            if signal == 'BUY':
                if signal_strength == 'STRONG':
                    position_size = min(0.1, self.max_position_size)  # %10
                else:
                    position_size = min(0.05, self.max_position_size)  # %5
            else:
                position_size = 0.0
            
            # Stop loss and take profit
            if signal == 'BUY':
                stop_loss = 0.05  # %5
                take_profit = 0.15  # %15
            elif signal == 'SELL':
                stop_loss = 0.05  # %5
                take_profit = 0.15  # %15
            else:
                stop_loss = 0.0
                take_profit = 0.0
            
            return {
                'action': signal,
                'strength': signal_strength,
                'confidence': float(ai_confidence),
                'combined_score': combined_strength,
                'position_size': position_size,
                'stop_loss': stop_loss,
                'take_profit': take_profit,
                'reasoning': {
                    'technical': tech_strength,
                    'sentiment': sentiment_adjustment,
                    'macro': regime_adjustment,
                    'ai_confidence': ai_confidence
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Trading sinyal oluşturma hatası: {e}")
            return {'error': str(e)}
    
    def execute_trade(self, symbol: str, action: str, quantity: int, 
                     price: float, stop_loss: float = None, take_profit: float = None) -> Dict[str, Any]:
        """Trade'i gerçekleştir"""
        try:
            # Risk check
            if not self._check_risk_limits(symbol, action, quantity, price):
                return {'error': 'Risk limitleri aşıldı'}
            
            # Position management
            if action == 'BUY':
                if symbol in self.portfolio:
                    # Mevcut pozisyonu güncelle
                    current = self.portfolio[symbol]
                    total_cost = (current['quantity'] * current['avg_price']) + (quantity * price)
                    total_quantity = current['quantity'] + quantity
                    new_avg_price = total_cost / total_quantity
                    
                    self.portfolio[symbol] = {
                        'quantity': total_quantity,
                        'avg_price': new_avg_price,
                        'current_value': total_quantity * price
                    }
                else:
                    # Yeni pozisyon
                    self.portfolio[symbol] = {
                        'quantity': quantity,
                        'avg_price': price,
                        'current_value': quantity * price
                    }
                
                # Capital güncelle
                trade_value = quantity * price
                self.current_capital -= trade_value
                
            elif action == 'SELL':
                if symbol not in self.portfolio or self.portfolio[symbol]['quantity'] < quantity:
                    return {'error': 'Yetersiz pozisyon'}
                
                # Pozisyonu güncelle
                current = self.portfolio[symbol]
                remaining_quantity = current['quantity'] - quantity
                
                if remaining_quantity == 0:
                    # Pozisyonu kapat
                    del self.portfolio[symbol]
                else:
                    # Pozisyonu azalt
                    self.portfolio[symbol]['quantity'] = remaining_quantity
                    self.portfolio[symbol]['current_value'] = remaining_quantity * price
                
                # Capital güncelle
                trade_value = quantity * price
                self.current_capital += trade_value
                
                # PnL hesapla
                pnl = (price - current['avg_price']) * quantity
                self.total_pnl += pnl
                
                if pnl > 0:
                    self.winning_trades += 1
                else:
                    self.losing_trades += 1
            
            # Trade history'ye ekle
            trade_record = {
                'timestamp': datetime.now().isoformat(),
                'symbol': symbol,
                'action': action,
                'quantity': quantity,
                'price': price,
                'value': quantity * price,
                'stop_loss': stop_loss,
                'take_profit': take_profit
            }
            
            self.trade_history.append(trade_record)
            self.total_trades += 1
            
            # Open position tracking
            if action == 'BUY':
                self.open_positions[symbol] = {
                    'entry_price': price,
                    'quantity': quantity,
                    'stop_loss': stop_loss or (price * (1 - self.stop_loss_default)),
                    'take_profit': take_profit or (price * (1 + self.take_profit_default)),
                    'entry_time': datetime.now()
                }
            
            logger.info(f"✅ {action} {quantity} {symbol} @ {price:.2f} TL")
            
            return {
                'status': 'success',
                'trade': trade_record,
                'portfolio': self.portfolio,
                'current_capital': self.current_capital
            }
            
        except Exception as e:
            logger.error(f"❌ Trade execution hatası: {e}")
            return {'error': str(e)}
    
    def _check_risk_limits(self, symbol: str, action: str, quantity: int, price: float) -> bool:
        """Risk limitlerini kontrol et"""
        try:
            trade_value = quantity * price
            
            # Position size limit
            if trade_value > (self.current_capital * self.max_position_size):
                logger.warning(f"⚠️ Position size limit aşıldı: {trade_value:,.0f} TL")
                return False
            
            # Capital check
            if action == 'BUY' and trade_value > self.current_capital:
                logger.warning(f"⚠️ Yetersiz capital: {trade_value:,.0f} TL > {self.current_capital:,.0f} TL")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Risk limit kontrol hatası: {e}")
            return False
    
    def get_portfolio_summary(self) -> Dict[str, Any]:
        """Portfolio özeti"""
        try:
            total_value = self.current_capital
            positions = []
            
            for symbol, position in self.portfolio.items():
                # Güncel fiyat al
                try:
                    stock = yf.Ticker(symbol)
                    current_price = stock.info.get('regularMarketPrice', position['avg_price'])
                except:
                    current_price = position['avg_price']
                
                current_value = position['quantity'] * current_price
                total_value += current_value
                
                pnl = current_value - (position['quantity'] * position['avg_price'])
                pnl_percent = (pnl / (position['quantity'] * position['avg_price'])) * 100
                
                positions.append({
                    'symbol': symbol,
                    'quantity': position['quantity'],
                    'avg_price': position['avg_price'],
                    'current_price': current_price,
                    'current_value': current_value,
                    'pnl': pnl,
                    'pnl_percent': pnl_percent
                })
            
            # Performance metrics
            total_return = ((total_value - self.initial_capital) / self.initial_capital) * 100
            win_rate = (self.winning_trades / max(self.total_trades, 1)) * 100
            
            return {
                'total_value': total_value,
                'current_capital': self.current_capital,
                'invested_capital': total_value - self.current_capital,
                'total_return': total_return,
                'total_pnl': self.total_pnl,
                'positions': positions,
                'performance': {
                    'total_trades': self.total_trades,
                    'winning_trades': self.winning_trades,
                    'losing_trades': self.losing_trades,
                    'win_rate': win_rate,
                    'max_drawdown': self.max_drawdown
                },
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Portfolio özet hatası: {e}")
            return {'error': str(e)}
    
    def auto_trade(self, symbols: List[str]) -> Dict[str, Any]:
        """Otomatik trading - tüm semboller için"""
        try:
            results = []
            
            for symbol in symbols:
                logger.info(f"🔍 {symbol} analiz ediliyor...")
                
                # Analiz yap
                analysis = self.analyze_symbol(symbol)
                
                if 'error' in analysis or 'trading_signal' not in analysis:
                    results.append({'symbol': symbol, 'error': analysis.get('error', 'Analiz hatası')})
                    continue
                
                trading_signal = analysis['trading_signal']
                
                if 'action' not in trading_signal or trading_signal['action'] == 'HOLD':
                    results.append({'symbol': symbol, 'action': 'HOLD', 'reason': 'Zayıf sinyal'})
                    continue
                
                # Position sizing
                if trading_signal['action'] == 'BUY':
                    # Yeni pozisyon için capital hesapla
                    available_capital = self.current_capital * trading_signal['position_size']
                    current_price = analysis['current_price']
                    quantity = int(available_capital / current_price)
                    
                    if quantity > 0:
                        # Trade'i gerçekleştir
                        trade_result = self.execute_trade(
                            symbol, 'BUY', quantity, current_price,
                            trading_signal['stop_loss'], trading_signal['take_profit']
                        )
                        
                        if 'error' not in trade_result:
                            results.append({
                                'symbol': symbol,
                                'action': 'BUY',
                                'quantity': quantity,
                                'price': current_price,
                                'value': quantity * current_price,
                                'confidence': trading_signal['confidence']
                            })
                        else:
                            results.append({'symbol': symbol, 'error': trade_result['error']})
                    else:
                        results.append({'symbol': symbol, 'action': 'BUY', 'reason': 'Yetersiz capital'})
                
                elif trading_signal['action'] == 'SELL':
                    # Mevcut pozisyonu kontrol et
                    if symbol in self.portfolio:
                        position = self.portfolio[symbol]
                        quantity = position['quantity']
                        
                        # Trade'i gerçekleştir
                        trade_result = self.execute_trade(
                            symbol, 'SELL', quantity, analysis['current_price']
                        )
                        
                        if 'error' not in trade_result:
                            results.append({
                                'symbol': symbol,
                                'action': 'SELL',
                                'quantity': quantity,
                                'price': analysis['current_price'],
                                'value': quantity * analysis['current_price'],
                                'pnl': trade_result['trade']['value'] - (quantity * position['avg_price'])
                            })
                        else:
                            results.append({'symbol': symbol, 'error': trade_result['error']})
                    else:
                        results.append({'symbol': symbol, 'action': 'SELL', 'reason': 'Pozisyon yok'})
            
            return {
                'auto_trade_results': results,
                'portfolio_summary': self.get_portfolio_summary(),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Auto trade hatası: {e}")
            return {'error': str(e)}
    
    def save_trading_data(self, filename: str = None):
        """Trading verilerini kaydet"""
        try:
            if filename is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"trading_data_{timestamp}.json"
            
            data = {
                'portfolio': self.portfolio,
                'trade_history': self.trade_history,
                'performance': {
                    'total_trades': self.total_trades,
                    'winning_trades': self.winning_trades,
                    'losing_trades': self.losing_trades,
                    'total_pnl': self.total_pnl,
                    'max_drawdown': self.max_drawdown
                },
                'timestamp': datetime.now().isoformat()
            }
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"✅ Trading verileri kaydedildi: {filename}")
            return filename
            
        except Exception as e:
            logger.error(f"❌ Trading veri kaydetme hatası: {e}")
            return None

def test_trading_robot():
    """Test function"""
    print("🤖 Trading Robot Test başlıyor...")
    print("=" * 60)
    
    # Initialize robot
    robot = TradingRobot(initial_capital=100000)
    
    # Test symbols
    test_symbols = ['SISE.IS', 'EREGL.IS', 'TUPRS.IS']
    
    # Analyze symbols
    print("🔍 Semboller analiz ediliyor...")
    for symbol in test_symbols:
        analysis = robot.analyze_symbol(symbol)
        if 'error' not in analysis and 'trading_signal' in analysis:
            try:
                print(f"✅ {symbol}: {analysis['trading_signal']['action']} - Confidence: {analysis['trading_signal']['confidence']:.2f}")
            except:
                print(f"⚠️ {symbol}: Trading signal hatası")
        else:
            print(f"❌ {symbol}: {analysis.get('error', 'Bilinmeyen hata')}")
    
    # Auto trade
    print(f"\n🤖 Auto trading başlatılıyor...")
    auto_trade_results = robot.auto_trade(test_symbols)
    
    if 'error' not in auto_trade_results:
        print(f"✅ Auto trading tamamlandı!")
        print(f"📊 Sonuçlar: {len(auto_trade_results['auto_trade_results'])} işlem")
        
        # Portfolio summary
        portfolio = robot.get_portfolio_summary()
        print(f"💰 Portfolio değeri: {portfolio['total_value']:,.0f} TL")
        print(f"📈 Toplam return: {portfolio['total_return']:.2f}%")
        print(f"🎯 Win rate: {portfolio['performance']['win_rate']:.1f}%")
    else:
        print(f"❌ Auto trading hatası: {auto_trade_results['error']}")
    
    print(f"\n✅ Trading Robot test completed!")

if __name__ == "__main__":
    test_trading_robot()
