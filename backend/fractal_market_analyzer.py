#!/usr/bin/env python3
"""
🔮 FRACTAL MARKET ANALYZER
Fractal geometry and chaos theory based market analysis
"""

import numpy as np
import pandas as pd
import yfinance as yf
import logging
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
from scipy import stats
from sklearn.preprocessing import StandardScaler
import warnings

warnings.filterwarnings("ignore")

logger = logging.getLogger(__name__)

class FractalMarketAnalyzer:
    """Fractal market analizi"""
    
    def __init__(self):
        self.history_days = 252  # 1 yıl
        self.fractal_dimensions = [2, 3, 4, 5]  # Farklı fractal boyutları
        self.hurst_threshold = 0.5  # Hurst exponent eşiği
        self.lyapunov_threshold = 0.0  # Lyapunov exponent eşiği
        
    def _get_historical_data(self, symbol: str, period: str = "1y", interval: str = "1d"):
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
    
    def calculate_hurst_exponent(self, prices: np.ndarray) -> float:
        """Hurst exponent hesapla (trend persistence)"""
        try:
            if len(prices) < 20:
                return 0.5
            
            # Log returns
            returns = np.diff(np.log(prices))
            
            # R/S analysis
            n = len(returns)
            rs_values = []
            
            for lag in range(10, min(n//4, 50), 5):
                # Rescaled range
                mean_return = np.mean(returns[:lag])
                deviations = returns[:lag] - mean_return
                cumulative_deviations = np.cumsum(deviations)
                
                R = np.max(cumulative_deviations) - np.min(cumulative_deviations)
                S = np.std(returns[:lag])
                
                if S > 0:
                    rs_values.append(R / S)
            
            if len(rs_values) < 2:
                return 0.5
            
            # Linear regression to find Hurst exponent
            lags = np.arange(10, 10 + len(rs_values) * 5, 5)[:len(rs_values)]
            log_lags = np.log(lags)
            log_rs = np.log(rs_values)
            
            slope, _, _, _, _ = stats.linregress(log_lags, log_rs)
            hurst = slope
            
            return max(0.0, min(1.0, hurst))  # Clamp between 0 and 1
            
        except Exception as e:
            logger.error(f"Hurst calculation error: {e}")
            return 0.5
    
    def calculate_fractal_dimension(self, prices: np.ndarray) -> float:
        """Fractal dimension hesapla (box-counting method)"""
        try:
            if len(prices) < 50:
                return 1.5
            
            # Normalize prices
            prices_norm = (prices - np.min(prices)) / (np.max(prices) - np.min(prices))
            
            # Box counting for different box sizes
            box_sizes = np.logspace(0.5, 2, 10).astype(int)
            box_counts = []
            
            for box_size in box_sizes:
                if box_size >= len(prices_norm):
                    continue
                    
                # Count boxes needed to cover the curve
                boxes_needed = 0
                for i in range(0, len(prices_norm) - box_size, box_size):
                    box_min = np.min(prices_norm[i:i+box_size])
                    box_max = np.max(prices_norm[i:i+box_size])
                    boxes_needed += int(np.ceil((box_max - box_min) * len(prices_norm) / box_size))
                
                if boxes_needed > 0:
                    box_counts.append(boxes_needed)
                else:
                    box_counts.append(1)
            
            if len(box_counts) < 2:
                return 1.5
            
            # Linear regression to find fractal dimension
            log_box_sizes = np.log(box_sizes[:len(box_counts)])
            log_box_counts = np.log(box_counts)
            
            slope, _, _, _, _ = stats.linregress(log_box_sizes, log_box_counts)
            fractal_dim = -slope
            
            return max(1.0, min(2.0, fractal_dim))  # Clamp between 1 and 2
            
        except Exception as e:
            logger.error(f"Fractal dimension calculation error: {e}")
            return 1.5
    
    def calculate_lyapunov_exponent(self, prices: np.ndarray) -> float:
        """Lyapunov exponent hesapla (chaos measure)"""
        try:
            if len(prices) < 100:
                return 0.0
            
            # Log returns
            returns = np.diff(np.log(prices))
            
            # Embedding dimension
            m = 3
            tau = 1  # Time delay
            
            # Reconstruct phase space
            n = len(returns) - (m - 1) * tau
            if n < 20:
                return 0.0
            
            phase_space = np.zeros((n, m))
            for i in range(m):
                phase_space[:, i] = returns[i*tau:i*tau+n]
            
            # Find nearest neighbors and calculate divergence
            lyapunov_sum = 0.0
            valid_pairs = 0
            
            for i in range(n - 10):
                # Find nearest neighbor
                distances = np.linalg.norm(phase_space[i:i+1] - phase_space, axis=1)
                distances[i] = np.inf  # Exclude self
                
                nearest_idx = np.argmin(distances)
                if nearest_idx >= n - 10:
                    continue
                
                # Calculate divergence over time
                divergence = np.linalg.norm(phase_space[i+1] - phase_space[nearest_idx+1])
                initial_distance = np.linalg.norm(phase_space[i] - phase_space[nearest_idx])
                
                if initial_distance > 0 and divergence > 0:
                    lyapunov_sum += np.log(divergence / initial_distance)
                    valid_pairs += 1
            
            if valid_pairs > 0:
                lyapunov = lyapunov_sum / valid_pairs
                return max(-1.0, min(1.0, lyapunov))  # Clamp between -1 and 1
            
            return 0.0
            
        except Exception as e:
            logger.error(f"Lyapunov calculation error: {e}")
            return 0.0
    
    def detect_fractal_patterns(self, prices: np.ndarray) -> Dict:
        """Fractal pattern tespiti"""
        try:
            patterns = {
                'self_similarity': 0.0,
                'scaling_law': 0.0,
                'power_law': 0.0,
                'multifractal': 0.0
            }
            
            if len(prices) < 50:
                return patterns
            
            # Self-similarity test
            returns = np.diff(np.log(prices))
            
            # Test at different time scales
            scales = [1, 2, 4, 8]
            variances = []
            
            for scale in scales:
                if scale >= len(returns):
                    continue
                    
                # Aggregate returns at different scales
                aggregated = []
                for i in range(0, len(returns) - scale + 1, scale):
                    aggregated.append(np.sum(returns[i:i+scale]))
                
                if len(aggregated) > 1:
                    variances.append(np.var(aggregated))
            
            # Check scaling law (variance should scale with time)
            if len(variances) >= 2:
                log_scales = np.log(scales[:len(variances)])
                log_variances = np.log(variances)
                
                slope, _, r_value, _, _ = stats.linregress(log_scales, log_variances)
                patterns['scaling_law'] = abs(r_value)  # Correlation coefficient
                patterns['self_similarity'] = min(1.0, abs(slope))  # Scaling exponent
            
            # Power law distribution test
            if len(returns) > 20:
                abs_returns = np.abs(returns)
                hist, bin_edges = np.histogram(abs_returns, bins=20)
                bin_centers = (bin_edges[:-1] + bin_edges[1:]) / 2
                
                # Remove zero bins
                non_zero_mask = hist > 0
                if np.sum(non_zero_mask) >= 3:
                    log_bins = np.log(bin_centers[non_zero_mask])
                    log_hist = np.log(hist[non_zero_mask])
                    
                    slope, _, r_value, _, _ = stats.linregress(log_bins, log_hist)
                    patterns['power_law'] = abs(r_value)  # Goodness of power law fit
            
            # Multifractal analysis (simplified)
            if len(returns) > 100:
                # Calculate moments at different scales
                q_values = [1, 2, 3, 4]
                scales = [1, 2, 4, 8]
                
                tau_q = []
                for q in q_values:
                    tau_values = []
                    for scale in scales:
                        if scale >= len(returns):
                            continue
                        
                        # Calculate partition function
                        partition_sum = 0
                        for i in range(0, len(returns) - scale + 1, scale):
                            partition_sum += np.abs(np.sum(returns[i:i+scale])) ** q
                        
                        if partition_sum > 0:
                            tau_values.append(np.log(partition_sum))
                    
                    if len(tau_values) >= 2:
                        log_scales = np.log(scales[:len(tau_values)])
                        slope, _, r_value, _, _ = stats.linregress(log_scales, tau_values)
                        tau_q.append(slope)
                
                # Multifractal strength
                if len(tau_q) >= 2:
                    patterns['multifractal'] = min(1.0, np.std(tau_q))
            
            return patterns
            
        except Exception as e:
            logger.error(f"Fractal pattern detection error: {e}")
            return {'self_similarity': 0.0, 'scaling_law': 0.0, 'power_law': 0.0, 'multifractal': 0.0}
    
    def analyze_fractal_market(self, symbol: str) -> Dict:
        """Fractal market analizi"""
        logger.info(f"🔮 {symbol} fractal market analizi başlıyor...")
        
        data = self._get_historical_data(symbol, period=f"{self.history_days}d")
        if data is None or data.empty:
            return {
                'hurst_exponent': 0.5,
                'fractal_dimension': 1.5,
                'lyapunov_exponent': 0.0,
                'fractal_patterns': {'self_similarity': 0.0, 'scaling_law': 0.0, 'power_law': 0.0, 'multifractal': 0.0},
                'market_regime': 'NEUTRAL',
                'signal_bias': 0.5,
                'confidence': 0.0
            }
        
        prices = data['Close'].values
        
        # Calculate fractal metrics
        hurst = self.calculate_hurst_exponent(prices)
        fractal_dim = self.calculate_fractal_dimension(prices)
        lyapunov = self.calculate_lyapunov_exponent(prices)
        patterns = self.detect_fractal_patterns(prices)
        
        # Market regime classification
        if hurst > 0.6:
            if fractal_dim > 1.7:
                market_regime = 'TRENDING_CHAOTIC'
                signal_bias = 0.6
            else:
                market_regime = 'TRENDING_REGULAR'
                signal_bias = 0.7
        elif hurst < 0.4:
            if fractal_dim > 1.7:
                market_regime = 'MEAN_REVERTING_CHAOTIC'
                signal_bias = 0.4
            else:
                market_regime = 'MEAN_REVERTING_REGULAR'
                signal_bias = 0.3
        else:
            market_regime = 'RANDOM_WALK'
            signal_bias = 0.5
        
        # Adjust for chaos level
        if lyapunov > 0.1:
            signal_bias = 0.5  # High chaos reduces confidence
        elif lyapunov < -0.1:
            signal_bias = 0.5  # High stability also reduces confidence
        
        # Pattern-based adjustments
        pattern_strength = np.mean(list(patterns.values()))
        if pattern_strength > 0.7:
            signal_bias = 0.5 + (signal_bias - 0.5) * 1.2  # Enhance signal
        elif pattern_strength < 0.3:
            signal_bias = 0.5 + (signal_bias - 0.5) * 0.8  # Reduce signal
        
        # Clamp signal bias
        signal_bias = max(0.1, min(0.9, signal_bias))
        
        # Calculate confidence
        confidence = min(0.9, (abs(hurst - 0.5) + abs(fractal_dim - 1.5) + abs(lyapunov) + pattern_strength) / 4)
        
        logger.info(f"✅ {symbol} fractal analizi tamamlandı: {market_regime} ({signal_bias:.3f})")
        
        return {
            'hurst_exponent': round(hurst, 3),
            'fractal_dimension': round(fractal_dim, 3),
            'lyapunov_exponent': round(lyapunov, 3),
            'fractal_patterns': {k: round(v, 3) for k, v in patterns.items()},
            'market_regime': market_regime,
            'signal_bias': round(signal_bias, 3),
            'confidence': round(confidence, 3)
        }
    
    def generate_fractal_report(self, symbols: List[str]) -> str:
        """Fractal analiz raporu"""
        report = "\n" + "="*80 + "\n"
        report += "🔮 FRACTAL MARKET ANALYSIS RESULTS\n"
        report += "="*80 + "\n"
        
        total_hurst = 0
        total_fractal_dim = 0
        total_lyapunov = 0
        total_confidence = 0
        total_signal_bias = 0
        
        for symbol in symbols:
            analysis = self.analyze_fractal_market(symbol)
            
            report += f"🎯 {symbol}:\n"
            report += f"   Hurst Exponent: {analysis['hurst_exponent']:.3f} ({'Trending' if analysis['hurst_exponent'] > 0.5 else 'Mean-reverting'})\n"
            report += f"   Fractal Dimension: {analysis['fractal_dimension']:.3f} ({'Complex' if analysis['fractal_dimension'] > 1.5 else 'Simple'})\n"
            report += f"   Lyapunov Exponent: {analysis['lyapunov_exponent']:.3f} ({'Chaotic' if analysis['lyapunov_exponent'] > 0 else 'Stable'})\n"
            report += f"   Market Regime: {analysis['market_regime']}\n"
            report += f"   Signal Bias: {'BUY' if analysis['signal_bias'] > 0.5 else ('SELL' if analysis['signal_bias'] < 0.5 else 'NEUTRAL')} ({analysis['signal_bias']:.3f})\n"
            report += f"   Confidence: {analysis['confidence']:.3f}\n"
            report += f"   Patterns: {analysis['fractal_patterns']}\n"
            report += "\n"
            
            total_hurst += analysis['hurst_exponent']
            total_fractal_dim += analysis['fractal_dimension']
            total_lyapunov += analysis['lyapunov_exponent']
            total_confidence += analysis['confidence']
            total_signal_bias += analysis['signal_bias']
        
        avg_hurst = total_hurst / len(symbols)
        avg_fractal_dim = total_fractal_dim / len(symbols)
        avg_lyapunov = total_lyapunov / len(symbols)
        avg_confidence = total_confidence / len(symbols)
        avg_signal_bias = total_signal_bias / len(symbols)
        
        report += "📊 FRACTAL ANALYSIS SUMMARY:\n"
        report += f"   Total Symbols: {len(symbols)}\n"
        report += f"   Average Hurst Exponent: {avg_hurst:.3f}\n"
        report += f"   Average Fractal Dimension: {avg_fractal_dim:.3f}\n"
        report += f"   Average Lyapunov Exponent: {avg_lyapunov:.3f}\n"
        report += f"   Average Confidence: {avg_confidence:.3f}\n"
        report += f"   Average Signal Bias: {avg_signal_bias:.3f}\n"
        report += f"   🎯 FRACTAL ACCURACY ESTIMATE: {avg_confidence * 100:.1f}%\n"
        report += "="*80 + "\n"
        
        return report

def test_fractal_market_analyzer():
    """Fractal market analyzer test"""
    logging.basicConfig(level=logging.INFO, format='%(levelname)s:%(name)s:%(message)s')
    logger.info("🧪 FRACTAL MARKET ANALYZER test başlıyor...")
    
    analyzer = FractalMarketAnalyzer()
    test_symbols = ["GARAN.IS", "AKBNK.IS", "SISE.IS", "ASELS.IS", "YKBNK.IS"]
    
    print(analyzer.generate_fractal_report(test_symbols))

if __name__ == "__main__":
    test_fractal_market_analyzer()
