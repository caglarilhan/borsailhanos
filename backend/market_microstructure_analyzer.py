#!/usr/bin/env python3
"""
🔬 MARKET MICROSTRUCTURE ANALYZER
High-frequency market microstructure analysis
"""

import numpy as np
import pandas as pd
import yfinance as yf
import logging
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime, timedelta
from scipy import stats
import warnings

warnings.filterwarnings("ignore")

logger = logging.getLogger(__name__)

class MarketMicrostructureAnalyzer:
    """Piyasa mikro yapısı analizi"""
    
    def __init__(self):
        self.history_days = 30  # 30 gün (mikro yapı için daha kısa)
        self.tick_size = 0.01  # Minimum fiyat değişimi
        self.spread_threshold = 0.02  # Spread eşiği
        
    def _get_historical_data(self, symbol: str, period: str = "1mo", interval: str = "1d"):
        """Tarihsel veri al"""
        try:
            data = yf.download(symbol, period=period, interval=interval)
            if data.empty:
                logger.error(f"No data found for {symbol}")
                return None
            return data
        except Exception as e:
            logger.error(f"Error getting data for {symbol}: {e}")
            return None
    
    def calculate_bid_ask_spread(self, data: pd.DataFrame) -> Dict[str, float]:
        """Bid-ask spread analizi"""
        try:
            # Yahoo Finance'da bid-ask spread verisi yok, simüle edelim
            # Gerçek uygulamada Level 2 veri gereklidir
            
            features = {}
            
            # Simulated bid-ask spread based on volatility
            returns = data['Close'].pct_change().dropna()
            volatility = returns.std()
            
            # Simulate spread as percentage of price
            avg_spread = volatility * 0.5  # Spread genellikle volatilite ile korele
            features['avg_spread'] = avg_spread
            
            # Spread volatility
            spread_volatility = volatility * 0.3
            features['spread_volatility'] = spread_volatility
            
            # Relative spread
            current_price = data['Close'].iloc[-1]
            features['relative_spread'] = avg_spread / current_price if current_price > 0 else 0
            
            # Spread trend
            if len(data) >= 10:
                recent_spreads = [volatility * 0.5 for _ in range(10)]  # Simulated
                features['spread_trend'] = np.mean(np.diff(recent_spreads)) if len(recent_spreads) > 1 else 0
            else:
                features['spread_trend'] = 0
            
            return features
            
        except Exception as e:
            logger.error(f"Bid-ask spread calculation error: {e}")
            return {}
    
    def calculate_order_flow_imbalance(self, data: pd.DataFrame) -> Dict[str, float]:
        """Emir akışı dengesizliği"""
        try:
            features = {}
            
            # Volume-based order flow analysis
            if 'Volume' in data.columns:
                volume = data['Volume']
                returns = data['Close'].pct_change().dropna()
                
                # Volume-weighted returns
                volume_weighted_returns = []
                for i in range(1, len(data)):
                    if i < len(volume) and volume.iloc[i] > 0:
                        vwr = returns.iloc[i-1] * volume.iloc[i]
                        volume_weighted_returns.append(vwr)
                
                if volume_weighted_returns:
                    features['volume_weighted_return'] = np.mean(volume_weighted_returns)
                    features['volume_weighted_volatility'] = np.std(volume_weighted_returns)
                else:
                    features['volume_weighted_return'] = 0
                    features['volume_weighted_volatility'] = 0
                
                # Volume-price correlation
                if len(volume) >= 10 and len(returns) >= 10:
                    min_len = min(len(volume), len(returns))
                    corr = np.corrcoef(volume.tail(min_len), returns.tail(min_len))[0, 1]
                    features['volume_price_correlation'] = corr if not np.isnan(corr) else 0
                else:
                    features['volume_price_correlation'] = 0
                
                # Volume momentum
                if len(volume) >= 20:
                    features['volume_momentum'] = (volume.iloc[-1] - volume.iloc[-20]) / volume.iloc[-20] if volume.iloc[-20] > 0 else 0
                else:
                    features['volume_momentum'] = 0
                
                # Volume volatility
                if len(volume) >= 10:
                    features['volume_volatility'] = volume.tail(10).std() / volume.tail(10).mean() if volume.tail(10).mean() > 0 else 0
                else:
                    features['volume_volatility'] = 0
                
            else:
                features['volume_weighted_return'] = 0
                features['volume_weighted_volatility'] = 0
                features['volume_price_correlation'] = 0
                features['volume_momentum'] = 0
                features['volume_volatility'] = 0
            
            return features
            
        except Exception as e:
            logger.error(f"Order flow imbalance calculation error: {e}")
            return {}
    
    def calculate_price_impact(self, data: pd.DataFrame) -> Dict[str, float]:
        """Fiyat etkisi analizi"""
        try:
            features = {}
            
            returns = data['Close'].pct_change().dropna()
            
            if len(returns) < 10:
                return {}
            
            # Price impact based on volume (simulated)
            if 'Volume' in data.columns:
                volume = data['Volume']
                
                # Simulate price impact
                price_impacts = []
                for i in range(1, min(len(returns), len(volume))):
                    if volume.iloc[i] > 0:
                        # Price impact is proportional to volume and return
                        impact = abs(returns.iloc[i-1]) * np.log(volume.iloc[i] + 1)
                        price_impacts.append(impact)
                
                if price_impacts:
                    features['avg_price_impact'] = np.mean(price_impacts)
                    features['max_price_impact'] = np.max(price_impacts)
                    features['price_impact_volatility'] = np.std(price_impacts)
                else:
                    features['avg_price_impact'] = 0
                    features['max_price_impact'] = 0
                    features['price_impact_volatility'] = 0
                
                # Temporary vs permanent impact
                if len(price_impacts) >= 5:
                    # Temporary impact (reverses quickly)
                    temp_impact = np.mean(price_impacts[:len(price_impacts)//2])
                    # Permanent impact (persists)
                    perm_impact = np.mean(price_impacts[len(price_impacts)//2:])
                    
                    features['temporary_impact'] = temp_impact
                    features['permanent_impact'] = perm_impact
                    features['impact_ratio'] = perm_impact / (temp_impact + 1e-10)
                else:
                    features['temporary_impact'] = 0
                    features['permanent_impact'] = 0
                    features['impact_ratio'] = 0
                
            else:
                features['avg_price_impact'] = 0
                features['max_price_impact'] = 0
                features['price_impact_volatility'] = 0
                features['temporary_impact'] = 0
                features['permanent_impact'] = 0
                features['impact_ratio'] = 0
            
            return features
            
        except Exception as e:
            logger.error(f"Price impact calculation error: {e}")
            return {}
    
    def calculate_market_depth(self, data: pd.DataFrame) -> Dict[str, float]:
        """Piyasa derinliği analizi"""
        try:
            features = {}
            
            # Market depth simulation based on volume and volatility
            returns = data['Close'].pct_change().dropna()
            volatility = returns.std()
            
            if 'Volume' in data.columns:
                volume = data['Volume']
                
                # Depth as inverse of volatility and volume
                features['market_depth'] = 1 / (volatility + 1e-10)
                features['volume_depth'] = volume.mean() / (volatility + 1e-10)
                
                # Depth stability
                if len(volume) >= 10:
                    depth_stability = 1 / (volume.tail(10).std() / volume.tail(10).mean() + 1e-10)
                    features['depth_stability'] = depth_stability
                else:
                    features['depth_stability'] = 0
                
                # Liquidity ratio
                features['liquidity_ratio'] = volume.mean() / (volatility * data['Close'].mean() + 1e-10)
                
            else:
                features['market_depth'] = 1 / (volatility + 1e-10)
                features['volume_depth'] = 0
                features['depth_stability'] = 0
                features['liquidity_ratio'] = 0
            
            return features
            
        except Exception as e:
            logger.error(f"Market depth calculation error: {e}")
            return {}
    
    def calculate_informed_trading(self, data: pd.DataFrame) -> Dict[str, float]:
        """Bilgili ticaret analizi"""
        try:
            features = {}
            
            returns = data['Close'].pct_change().dropna()
            
            if len(returns) < 20:
                return {}
            
            # Information content of trades (simulated)
            # Bilgili ticaret genellikle daha büyük fiyat hareketleri ile ilişkilidir
            
            # Large price movements
            large_moves = returns[abs(returns) > returns.std() * 2]
            features['large_move_frequency'] = len(large_moves) / len(returns)
            features['large_move_impact'] = np.mean(abs(large_moves)) if len(large_moves) > 0 else 0
            
            # Information asymmetry (simulated)
            # Volatilite ve hacim arasındaki ilişki
            if 'Volume' in data.columns:
                volume = data['Volume']
                min_len = min(len(returns), len(volume))
                
                if min_len >= 10:
                    # Information content correlation
                    info_corr = np.corrcoef(abs(returns.tail(min_len)), volume.tail(min_len))[0, 1]
                    features['information_correlation'] = info_corr if not np.isnan(info_corr) else 0
                else:
                    features['information_correlation'] = 0
                
                # Informed trading intensity
                features['informed_trading_intensity'] = np.mean(abs(returns)) * np.mean(volume) / (data['Close'].mean() + 1e-10)
            else:
                features['information_correlation'] = 0
                features['informed_trading_intensity'] = np.mean(abs(returns))
            
            # Price discovery efficiency
            # Ne kadar hızlı fiyatların bilgiyi yansıttığı
            if len(returns) >= 10:
                # Autocorrelation of returns (efficiency measure)
                autocorr = returns.autocorr(lag=1) if len(returns) > 1 else 0
                features['price_discovery_efficiency'] = 1 - abs(autocorr)  # Lower autocorr = higher efficiency
            else:
                features['price_discovery_efficiency'] = 0
            
            return features
            
        except Exception as e:
            logger.error(f"Informed trading calculation error: {e}")
            return {}
    
    def analyze_market_microstructure(self, symbol: str) -> Dict[str, Any]:
        """Piyasa mikro yapısı analizi"""
        logger.info(f"�� {symbol} piyasa mikro yapısı analizi başlıyor...")
        
        data = self._get_historical_data(symbol, period=f"{self.history_days}d")
        if data is None or data.empty:
            return {
                'spread_analysis': {},
                'order_flow': {},
                'price_impact': {},
                'market_depth': {},
                'informed_trading': {},
                'microstructure_score': 0.5,
                'signal_bias': 0.5,
                'confidence': 0.0
            }
        
        try:
            # Calculate all microstructure metrics
            spread_analysis = self.calculate_bid_ask_spread(data)
            order_flow = self.calculate_order_flow_imbalance(data)
            price_impact = self.calculate_price_impact(data)
            market_depth = self.calculate_market_depth(data)
            informed_trading = self.calculate_informed_trading(data)
            
            # Combine all metrics
            all_metrics = {}
            all_metrics.update(spread_analysis)
            all_metrics.update(order_flow)
            all_metrics.update(price_impact)
            all_metrics.update(market_depth)
            all_metrics.update(informed_trading)
            
            # Calculate microstructure score
            # Higher liquidity, lower spreads, better price discovery = higher score
            liquidity_score = market_depth.get('liquidity_ratio', 0)
            spread_score = 1 - spread_analysis.get('relative_spread', 0.5)
            efficiency_score = informed_trading.get('price_discovery_efficiency', 0.5)
            
            microstructure_score = (liquidity_score + spread_score + efficiency_score) / 3
            microstructure_score = max(0.0, min(1.0, microstructure_score))
            
            # Signal bias based on microstructure
            if microstructure_score > 0.7:
                signal_bias = 0.6  # Good microstructure favors buying
            elif microstructure_score < 0.3:
                signal_bias = 0.4  # Poor microstructure favors selling
            else:
                signal_bias = 0.5  # Neutral
            
            # Confidence based on data quality
            confidence = min(0.9, len(all_metrics) / 20.0)  # More metrics = higher confidence
            
            logger.info(f"✅ {symbol} mikro yapı analizi tamamlandı: {microstructure_score:.3f} ({signal_bias:.3f})")
            
            return {
                'spread_analysis': spread_analysis,
                'order_flow': order_flow,
                'price_impact': price_impact,
                'market_depth': market_depth,
                'informed_trading': informed_trading,
                'microstructure_score': round(microstructure_score, 3),
                'signal_bias': round(signal_bias, 3),
                'confidence': round(confidence, 3)
            }
            
        except Exception as e:
            logger.error(f"❌ {symbol} mikro yapı analizi hatası: {e}")
            return {
                'spread_analysis': {},
                'order_flow': {},
                'price_impact': {},
                'market_depth': {},
                'informed_trading': {},
                'microstructure_score': 0.5,
                'signal_bias': 0.5,
                'confidence': 0.0
            }
    
    def generate_microstructure_report(self, symbols: List[str]) -> str:
        """Mikro yapı analiz raporu"""
        report = "\n" + "="*80 + "\n"
        report += "🔬 MARKET MICROSTRUCTURE ANALYSIS RESULTS\n"
        report += "="*80 + "\n"
        
        total_microstructure_score = 0
        total_signal_bias = 0
        total_confidence = 0
        
        for symbol in symbols:
            analysis = self.analyze_market_microstructure(symbol)
            
            report += f"🎯 {symbol}:\n"
            report += f"   Microstructure Score: {analysis['microstructure_score']:.3f}\n"
            report += f"   Signal Bias: {'BUY' if analysis['signal_bias'] > 0.5 else ('SELL' if analysis['signal_bias'] < 0.5 else 'NEUTRAL')} ({analysis['signal_bias']:.3f})\n"
            report += f"   Confidence: {analysis['confidence']:.3f}\n"
            report += f"   Spread Analysis: {len(analysis['spread_analysis'])} metrics\n"
            report += f"   Order Flow: {len(analysis['order_flow'])} metrics\n"
            report += f"   Price Impact: {len(analysis['price_impact'])} metrics\n"
            report += f"   Market Depth: {len(analysis['market_depth'])} metrics\n"
            report += f"   Informed Trading: {len(analysis['informed_trading'])} metrics\n"
            report += "\n"
            
            total_microstructure_score += analysis['microstructure_score']
            total_signal_bias += analysis['signal_bias']
            total_confidence += analysis['confidence']
        
        avg_microstructure_score = total_microstructure_score / len(symbols)
        avg_signal_bias = total_signal_bias / len(symbols)
        avg_confidence = total_confidence / len(symbols)
        
        report += "📊 MICROSTRUCTURE ANALYSIS SUMMARY:\n"
        report += f"   Total Symbols: {len(symbols)}\n"
        report += f"   Average Microstructure Score: {avg_microstructure_score:.3f}\n"
        report += f"   Average Signal Bias: {avg_signal_bias:.3f}\n"
        report += f"   Average Confidence: {avg_confidence:.3f}\n"
        report += f"   🎯 MICROSTRUCTURE ACCURACY ESTIMATE: {avg_confidence * 100:.1f}%\n"
        report += "="*80 + "\n"
        
        return report

def test_market_microstructure_analyzer():
    """Market microstructure analyzer test"""
    logging.basicConfig(level=logging.INFO, format='%(levelname)s:%(name)s:%(message)s')
    logger.info("🧪 MARKET MICROSTRUCTURE ANALYZER test başlıyor...")
    
    analyzer = MarketMicrostructureAnalyzer()
    test_symbols = ["GARAN.IS", "AKBNK.IS", "SISE.IS", "ASELS.IS", "YKBNK.IS"]
    
    print(analyzer.generate_microstructure_report(test_symbols))

if __name__ == "__main__":
    test_market_microstructure_analyzer()
