#!/usr/bin/env python3
"""
🚀 ELLIOTT WAVE DETECTOR - BIST AI Smart Trader
Pattern sequence: Gartley → Butterfly → Bat → Elliott Waves → Advanced Patterns
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class ElliottWaveDetector:
    """Elliott Wave pattern tespit edici - Accuracy boost için"""
    
    def __init__(self):
        # Fibonacci ratios for Elliott Wave
        self.fib_ratios = {
            '0.236': 0.236, '0.382': 0.382, '0.500': 0.500,
            '0.618': 0.618, '0.786': 0.786, '0.886': 0.886,
            '1.272': 1.272, '1.618': 1.618, '2.000': 2.000,
            '2.618': 2.618, '3.618': 3.618
        }
        
        # Pattern tolerance (percentage)
        self.tolerance = 0.05  # 5% tolerance
        
        # Minimum swing size for pattern detection
        self.min_swing_size = 0.02  # 2% minimum price movement
        
        # Elliott Wave specific ratios
        self.elliott_ratios = {
            'wave_2_retracement_min': 0.500,  # Wave 2: 50-78.6% of Wave 1
            'wave_2_retracement_max': 0.786,
            'wave_3_extension_min': 1.618,  # Wave 3: 161.8% of Wave 1
            'wave_3_extension_max': 2.618,
            'wave_4_retracement_min': 0.236,  # Wave 4: 23.6-38.2% of Wave 3
            'wave_4_retracement_max': 0.382,
            'wave_5_extension_min': 0.618,  # Wave 5: 61.8-100% of Wave 1
            'wave_5_extension_max': 1.000
        }
    
    def find_swing_points(self, highs: np.ndarray, lows: np.ndarray, 
                          window: int = 5) -> Tuple[np.ndarray, np.ndarray]:
        """
        Swing high ve low noktalarını bul
        
        Args:
            highs: High prices array
            lows: Low prices array
            window: Swing detection window size
            
        Returns:
            Tuple of swing highs and lows indices
        """
        swing_highs = []
        swing_lows = []
        
        for i in range(window, len(highs) - window):
            # Swing high detection
            if all(highs[i] >= highs[j] for j in range(i-window, i+window+1)):
                swing_highs.append(i)
            
            # Swing low detection
            if all(lows[i] <= lows[j] for j in range(i-window, i+window+1)):
                swing_lows.append(i)
        
        return np.array(swing_highs), np.array(swing_lows)
    
    def detect_elliott_impulse_wave(self, highs: np.ndarray, lows: np.ndarray, 
                                   prices: np.ndarray) -> List[Dict]:
        """
        Elliott Impulse Wave (5-wave) tespit et
        
        Impulse Wave:
        - Wave 1: Initial move up
        - Wave 2: Retracement (50-78.6%)
        - Wave 3: Strongest move (161.8% of Wave 1)
        - Wave 4: Retracement (23.6-38.2%)
        - Wave 5: Final move (61.8-100% of Wave 1)
        """
        patterns = []
        swing_highs, swing_lows = self.find_swing_points(highs, lows)
        
        # Need at least 5 swing points for Impulse Wave
        if len(swing_highs) < 3 or len(swing_lows) < 2:
            return patterns
        
        # Look for potential Impulse Wave patterns
        for i in range(len(swing_highs) - 2):
            for j in range(len(swing_lows) - 1):
                # Wave 1: Initial move (swing high)
                wave1_start_idx = swing_lows[j]
                wave1_start_price = lows[wave1_start_idx]
                wave1_end_idx = swing_highs[i]
                wave1_end_price = highs[wave1_end_idx]
                wave1_move = wave1_end_price - wave1_start_price
                
                # Wave 2: Retracement (swing low)
                wave2_candidates = [idx for idx in swing_lows if idx > wave1_end_idx]
                if not wave2_candidates:
                    continue
                    
                wave2_idx = wave2_candidates[0]
                wave2_price = lows[wave2_idx]
                wave2_retracement = (wave1_end_price - wave2_price) / wave1_move
                
                # Validate Wave 2 retracement (50-78.6%)
                if not (self.elliott_ratios['wave_2_retracement_min'] <= wave2_retracement <= self.elliott_ratios['wave_2_retracement_max']):
                    continue
                
                # Wave 3: Strongest move (swing high)
                wave3_candidates = [idx for idx in swing_highs if idx > wave2_idx]
                if not wave3_candidates:
                    continue
                    
                wave3_idx = wave3_candidates[0]
                wave3_price = highs[wave3_idx]
                wave3_move = wave3_price - wave2_price
                wave3_extension = wave3_move / wave1_move
                
                # Validate Wave 3 extension (161.8-261.8%)
                if not (self.elliott_ratios['wave_3_extension_min'] <= wave3_extension <= self.elliott_ratios['wave_3_extension_max']):
                    continue
                
                # Wave 4: Retracement (swing low)
                wave4_candidates = [idx for idx in swing_lows if idx > wave3_idx]
                if not wave4_candidates:
                    continue
                    
                wave4_idx = wave4_candidates[0]
                wave4_price = lows[wave4_idx]
                wave4_retracement = (wave3_price - wave4_price) / wave3_move
                
                # Validate Wave 4 retracement (23.6-38.2%)
                if not (self.elliott_ratios['wave_4_retracement_min'] <= wave4_retracement <= self.elliott_ratios['wave_4_retracement_max']):
                    continue
                
                # Wave 5: Final move (swing high)
                wave5_candidates = [idx for idx in swing_highs if idx > wave4_idx]
                if not wave5_candidates:
                    continue
                    
                wave5_idx = wave5_candidates[0]
                wave5_price = highs[wave5_idx]
                wave5_move = wave5_price - wave4_price
                wave5_extension = wave5_move / wave1_move
                
                # Validate Wave 5 extension (61.8-100%)
                if not (self.elliott_ratios['wave_5_extension_min'] <= wave5_extension <= self.elliott_ratios['wave_5_extension_max']):
                    continue
                
                # Create pattern
                pattern = {
                    'pattern_type': 'Elliott Impulse Wave',
                    'waves': {
                        'Wave1': {'index': wave1_end_idx, 'price': wave1_end_price, 'move': wave1_move},
                        'Wave2': {'index': wave2_idx, 'price': wave2_price, 'retracement': wave2_retracement},
                        'Wave3': {'index': wave3_idx, 'price': wave3_price, 'move': wave3_move, 'extension': wave3_extension},
                        'Wave4': {'index': wave4_idx, 'price': wave4_price, 'retracement': wave4_retracement},
                        'Wave5': {'index': wave5_idx, 'price': wave5_price, 'move': wave5_move, 'extension': wave5_extension}
                    },
                    'confidence': self._calculate_impulse_wave_confidence(wave1_move, wave2_retracement, wave3_extension, wave4_retracement, wave5_extension),
                    'signal': 'BUY' if wave5_price > wave3_price else 'SELL',
                    'target': self._calculate_impulse_wave_target(wave1_move, wave2_price, wave3_price, wave4_price, wave5_price),
                    'stop_loss': self._calculate_impulse_wave_stop_loss(wave1_start_price, wave2_price, wave3_price, wave4_price, wave5_price),
                    'wave_characteristics': self._analyze_impulse_wave_characteristics(wave1_move, wave2_retracement, wave3_extension, wave4_retracement, wave5_extension)
                }
                patterns.append(pattern)
        
        return patterns
    
    def detect_elliott_corrective_wave(self, highs: np.ndarray, lows: np.ndarray, 
                                      prices: np.ndarray) -> List[Dict]:
        """
        Elliott Corrective Wave (ABC) tespit et
        
        Corrective Wave:
        - Wave A: Initial decline
        - Wave B: Retracement (38.2-78.6% of A)
        - Wave C: Final decline (100-161.8% of A)
        """
        patterns = []
        swing_highs, swing_lows = self.find_swing_points(highs, lows)
        
        # Need at least 3 swing points for Corrective Wave
        if len(swing_highs) < 2 or len(swing_lows) < 1:
            return patterns
        
        # Look for potential Corrective Wave patterns
        for i in range(len(swing_highs) - 1):
            for j in range(len(swing_lows)):
                # Wave A: Initial decline (swing low)
                wave_a_start_idx = swing_highs[i]
                wave_a_start_price = highs[wave_a_start_idx]
                wave_a_end_idx = swing_lows[j]
                wave_a_end_price = lows[wave_a_end_idx]
                wave_a_move = wave_a_start_price - wave_a_end_price
                
                # Wave B: Retracement (swing high)
                wave_b_candidates = [idx for idx in swing_highs if idx > wave_a_end_idx]
                if not wave_b_candidates:
                    continue
                    
                wave_b_idx = wave_b_candidates[0]
                wave_b_price = highs[wave_b_idx]
                wave_b_retracement = (wave_b_price - wave_a_end_price) / wave_a_move
                
                # Validate Wave B retracement (38.2-78.6%)
                if not (0.382 <= wave_b_retracement <= 0.786):
                    continue
                
                # Wave C: Final decline (swing low)
                wave_c_candidates = [idx for idx in swing_lows if idx > wave_b_idx]
                if not wave_c_candidates:
                    continue
                    
                wave_c_idx = wave_c_candidates[0]
                wave_c_price = lows[wave_c_idx]
                wave_c_move = wave_b_price - wave_c_price
                wave_c_extension = wave_c_move / wave_a_move
                
                # Validate Wave C extension (100-161.8%)
                if not (1.000 <= wave_c_extension <= 1.618):
                    continue
                
                # Create pattern
                pattern = {
                    'pattern_type': 'Elliott Corrective Wave',
                    'waves': {
                        'WaveA': {'index': wave_a_end_idx, 'price': wave_a_end_price, 'move': wave_a_move},
                        'WaveB': {'index': wave_b_idx, 'price': wave_b_price, 'retracement': wave_b_retracement},
                        'WaveC': {'index': wave_c_idx, 'price': wave_c_price, 'move': wave_c_move, 'extension': wave_c_extension}
                    },
                    'confidence': self._calculate_corrective_wave_confidence(wave_a_move, wave_b_retracement, wave_c_extension),
                    'signal': 'BUY' if wave_c_price < wave_a_end_price else 'SELL',
                    'target': self._calculate_corrective_wave_target(wave_a_move, wave_b_price, wave_c_price),
                    'stop_loss': self._calculate_corrective_wave_stop_loss(wave_a_start_price, wave_b_price, wave_c_price),
                    'wave_characteristics': self._analyze_corrective_wave_characteristics(wave_a_move, wave_b_retracement, wave_c_extension)
                }
                patterns.append(pattern)
        
        return patterns
    
    def _calculate_impulse_wave_confidence(self, wave1_move: float, wave2_retracement: float,
                                         wave3_extension: float, wave4_retracement: float, 
                                         wave5_extension: float) -> float:
        """Impulse wave güven skorunu hesapla (0-100)"""
        try:
            confidence = 100.0
            
            # Wave 2 retracement accuracy (50-78.6%)
            wave2_center = (self.elliott_ratios['wave_2_retracement_min'] + self.elliott_ratios['wave_2_retracement_max']) / 2
            wave2_error = abs(wave2_retracement - wave2_center) / wave2_center
            confidence -= wave2_error * 30
            
            # Wave 3 extension accuracy (161.8-261.8%)
            if (self.elliott_ratios['wave_3_extension_min'] <= wave3_extension <= self.elliott_ratios['wave_3_extension_max']):
                confidence += 20
            else:
                confidence -= 30
            
            # Wave 4 retracement accuracy (23.6-38.2%)
            wave4_center = (self.elliott_ratios['wave_4_retracement_min'] + self.elliott_ratios['wave_4_retracement_max']) / 2
            wave4_error = abs(wave4_retracement - wave4_center) / wave4_center
            confidence -= wave4_error * 30
            
            # Wave 5 extension accuracy (61.8-100%)
            if (self.elliott_ratios['wave_5_extension_min'] <= wave5_extension <= self.elliott_ratios['wave_5_extension_max']):
                confidence += 20
            else:
                confidence -= 20
            
            return max(0, min(100, confidence))
            
        except:
            return 0.0
    
    def _calculate_corrective_wave_confidence(self, wave_a_move: float, wave_b_retracement: float,
                                            wave_c_extension: float) -> float:
        """Corrective wave güven skorunu hesapla (0-100)"""
        try:
            confidence = 100.0
            
            # Wave B retracement accuracy (38.2-78.6%)
            wave_b_center = 0.584  # (0.382 + 0.786) / 2
            wave_b_error = abs(wave_b_retracement - wave_b_center) / wave_b_center
            confidence -= wave_b_error * 40
            
            # Wave C extension accuracy (100-161.8%)
            if (1.000 <= wave_c_extension <= 1.618):
                confidence += 30
            else:
                confidence -= 40
            
            return max(0, min(100, confidence))
            
        except:
            return 0.0
    
    def _analyze_impulse_wave_characteristics(self, wave1_move: float, wave2_retracement: float,
                                            wave3_extension: float, wave4_retracement: float, 
                                            wave5_extension: float) -> Dict:
        """Impulse wave karakteristiklerini analiz et"""
        try:
            characteristics = {}
            
            # Wave strength analysis
            characteristics['wave1_strength'] = 'Normal' if wave1_move > 0 else 'Weak'
            characteristics['wave2_quality'] = 'Optimal' if 0.5 <= wave2_retracement <= 0.786 else 'Acceptable'
            characteristics['wave3_strength'] = 'Strong' if wave3_extension >= 2.0 else 'Normal'
            characteristics['wave4_quality'] = 'Optimal' if 0.236 <= wave4_retracement <= 0.382 else 'Acceptable'
            characteristics['wave5_strength'] = 'Strong' if wave5_extension >= 0.8 else 'Normal'
            
            # Pattern quality
            total_extension = wave3_extension + wave5_extension
            characteristics['total_extension'] = total_extension
            characteristics['pattern_quality'] = 'High' if total_extension >= 3.0 else 'Medium'
            
            return characteristics
            
        except:
            return {'error': 'Analysis failed'}
    
    def _analyze_corrective_wave_characteristics(self, wave_a_move: float, wave_b_retracement: float,
                                               wave_c_extension: float) -> Dict:
        """Corrective wave karakteristiklerini analiz et"""
        try:
            characteristics = {}
            
            # Wave quality analysis
            characteristics['wave_a_strength'] = 'Strong' if wave_a_move > 0 else 'Weak'
            characteristics['wave_b_quality'] = 'Optimal' if 0.382 <= wave_b_retracement <= 0.618 else 'Acceptable'
            characteristics['wave_c_strength'] = 'Strong' if wave_c_extension >= 1.2 else 'Normal'
            
            # Pattern symmetry
            symmetry_ratio = wave_c_extension / (1 + wave_b_retracement)
            characteristics['symmetry_ratio'] = symmetry_ratio
            characteristics['symmetry_quality'] = 'High' if 0.8 <= symmetry_ratio <= 1.2 else 'Medium'
            
            return characteristics
            
        except:
            return {'error': 'Analysis failed'}
    
    def _calculate_impulse_wave_target(self, wave1_move: float, wave2_price: float,
                                     wave3_price: float, wave4_price: float, wave5_price: float) -> float:
        """Impulse wave hedef fiyatını hesapla"""
        try:
            # Target is typically 161.8% extension of Wave 5
            wave5_move = wave5_price - wave4_price
            target = wave5_price + (wave5_move * 1.618)
            return target
        except:
            return wave5_price * 1.05  # 5% default target
    
    def _calculate_impulse_wave_stop_loss(self, wave1_start_price: float, wave2_price: float,
                                        wave3_price: float, wave4_price: float, wave5_price: float) -> float:
        """Impulse wave stop loss seviyesini hesapla"""
        try:
            # Stop loss below Wave 4 for bullish pattern
            if wave5_price > wave3_price:  # Bullish
                stop_loss = wave4_price * 0.98  # 2% below Wave 4
            else:  # Bearish
                stop_loss = wave4_price * 1.02  # 2% above Wave 4
            return stop_loss
        except:
            return wave4_price * 0.98  # Default 2% below
    
    def _calculate_corrective_wave_target(self, wave_a_move: float, wave_b_price: float,
                                        wave_c_price: float) -> float:
        """Corrective wave hedef fiyatını hesapla"""
        try:
            # Target is typically 61.8% retracement of Wave C
            wave_c_move = wave_b_price - wave_c_price
            target = wave_c_price + (wave_c_move * 0.618)
            return target
        except:
            return wave_c_price * 1.05  # 5% default target
    
    def _calculate_corrective_wave_stop_loss(self, wave_a_start_price: float, wave_b_price: float,
                                           wave_c_price: float) -> float:
        """Corrective wave stop loss seviyesini hesapla"""
        try:
            # Stop loss below Wave C for bullish pattern
            if wave_c_price < wave_a_start_price:  # Bullish
                stop_loss = wave_c_price * 0.98  # 2% below Wave C
            else:  # Bearish
                stop_loss = wave_c_price * 1.02  # 2% above Wave C
            return stop_loss
        except:
            return wave_c_price * 0.98  # Default 2% below
    
    def detect_all_elliott_waves(self, highs: np.ndarray, lows: np.ndarray, 
                                prices: np.ndarray) -> Dict[str, List[Dict]]:
        """Tüm Elliott Wave pattern'lerini tespit et"""
        patterns = {}
        
        # Impulse waves
        patterns['impulse_wave'] = self.detect_elliott_impulse_wave(highs, lows, prices)
        
        # Corrective waves
        patterns['corrective_wave'] = self.detect_elliott_corrective_wave(highs, lows, prices)
        
        return patterns
    
    def calculate_pattern_score(self, patterns: Dict[str, List[Dict]]) -> float:
        """Pattern'lerin toplam skorunu hesapla (0-100)"""
        if not patterns:
            return 0.0
        
        total_score = 0.0
        total_patterns = 0
        
        for pattern_type, pattern_list in patterns.items():
            for pattern in pattern_list:
                confidence = pattern.get('confidence', 0)
                total_score += confidence
                total_patterns += 1
        
        if total_patterns == 0:
            return 0.0
            
        return total_score / total_patterns
    
    def get_trading_signals(self, patterns: Dict[str, List[Dict]]) -> List[Dict]:
        """Trading sinyallerini çıkar"""
        signals = []
        
        for pattern_type, pattern_list in patterns.items():
            for pattern in pattern_list:
                if pattern_type == 'impulse_wave':
                    entry_price = pattern['waves']['Wave5']['price']
                else:  # corrective_wave
                    entry_price = pattern['waves']['WaveC']['price']
                
                signal = {
                    'pattern_type': pattern['pattern_type'],
                    'signal': pattern['signal'],
                    'confidence': pattern['confidence'],
                    'entry_price': entry_price,
                    'target': pattern['target'],
                    'stop_loss': pattern['stop_loss'],
                    'risk_reward_ratio': abs(pattern['target'] - entry_price) / abs(pattern['stop_loss'] - entry_price),
                    'wave_characteristics': pattern.get('wave_characteristics', {})
                }
                signals.append(signal)
        
        # Sort by confidence
        signals.sort(key=lambda x: x['confidence'], reverse=True)
        return signals

# Test fonksiyonu
def test_elliott_wave_detector():
    """Elliott Wave detector'ı test et"""
    print("🧪 Testing Elliott Wave Detector...")
    
    # Test data oluştur
    np.random.seed(42)
    n_samples = 200
    
    # Simulated price data with Elliott Wave characteristics
    base_price = 100
    trend = np.cumsum(np.random.randn(n_samples) * 0.01)
    prices = base_price + trend
    
    # High and Low prices
    highs = prices + np.random.uniform(0.5, 2.0, n_samples)
    lows = prices - np.random.uniform(0.5, 2.0, n_samples)
    
    # Detector oluştur
    detector = ElliottWaveDetector()
    
    # Pattern'leri tespit et
    patterns = detector.detect_all_elliott_waves(highs, lows, prices)
    
    # Sonuçları göster
    print(f"📊 Detected Elliott Wave Patterns:")
    for pattern_type, pattern_list in patterns.items():
        print(f"  {pattern_type}: {len(pattern_list)} patterns")
    
    # Trading sinyallerini al
    signals = detector.get_trading_signals(patterns)
    print(f"📈 Trading Signals: {len(signals)}")
    
    # Pattern skorunu hesapla
    score = detector.calculate_pattern_score(patterns)
    print(f"🎯 Pattern Score: {score:.2f}/100")
    
    return patterns, signals, score

if __name__ == "__main__":
    try:
        patterns, signals, score = test_elliott_wave_detector()
        print("✅ Elliott Wave Detector test completed!")
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
