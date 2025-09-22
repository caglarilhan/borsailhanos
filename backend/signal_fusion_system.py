#!/usr/bin/env python3
"""
🔮 Multi-Dimensional Signal Fusion System
Combining all signals for maximum accuracy
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import json

logger = logging.getLogger(__name__)

@dataclass
class FusedSignal:
    """Birleştirilmiş sinyal"""
    symbol: str
    final_signal: str
    confidence: float
    expected_accuracy: float
    entry_price: float
    take_profit: float
    stop_loss: float
    fusion_score: float
    component_signals: Dict[str, Dict]
    risk_reward: float
    timestamp: datetime

class SignalFusionSystem:
    """Sinyal füzyon sistemi"""
    
    def __init__(self):
        self.fusion_weights = {
            'ultra_accuracy': 0.30,      # Ultra ML system
            'grey_topsis': 0.15,         # Financial ranking
            'technical_patterns': 0.20,  # Pattern detection
            'ai_ensemble': 0.15,         # AI predictions
            'sentiment': 0.10,           # Sentiment analysis
            'market_regime': 0.10        # Market regime
        }
        
        self.confidence_threshold = 0.75
        self.fusion_history = []
        
    def fuse_signals(self, symbol: str, component_signals: Dict[str, Any]) -> Optional[FusedSignal]:
        """Sinyalleri birleştir"""
        logger.info(f"🔮 {symbol} sinyalleri birleştiriliyor...")
        
        try:
            if not component_signals:
                logger.warning(f"⚠️ {symbol} için sinyal bulunamadı")
                return None
            
            # 1. Signal standardization
            standardized_signals = self._standardize_signals(component_signals)
            
            # 2. Weight adjustment based on recent performance
            adjusted_weights = self._adjust_weights_dynamically(standardized_signals)
            
            # 3. Multi-dimensional fusion
            fusion_result = self._perform_fusion(standardized_signals, adjusted_weights)
            
            # 4. Confidence calculation
            confidence = self._calculate_fusion_confidence(standardized_signals, fusion_result)
            
            # 5. Expected accuracy prediction
            expected_accuracy = self._predict_expected_accuracy(fusion_result, confidence)
            
            # 6. Price targets optimization
            entry_price, take_profit, stop_loss = self._optimize_price_targets(
                symbol, fusion_result, standardized_signals
            )
            
            # 7. Risk-reward calculation
            risk_reward = self._calculate_risk_reward(entry_price, take_profit, stop_loss)
            
            # Final signal determination
            final_signal = self._determine_final_signal(fusion_result, confidence)
            
            fused_signal = FusedSignal(
                symbol=symbol,
                final_signal=final_signal,
                confidence=confidence,
                expected_accuracy=expected_accuracy,
                entry_price=entry_price,
                take_profit=take_profit,
                stop_loss=stop_loss,
                fusion_score=fusion_result['score'],
                component_signals=standardized_signals,
                risk_reward=risk_reward,
                timestamp=datetime.now()
            )
            
            # History kaydet
            self.fusion_history.append(fused_signal)
            
            logger.info(f"✅ {symbol} fusion tamamlandı: {final_signal} (Conf: {confidence:.2f}, Acc: {expected_accuracy:.2f})")
            return fused_signal
            
        except Exception as e:
            logger.error(f"❌ {symbol} fusion hatası: {e}")
            return None
    
    def _standardize_signals(self, component_signals: Dict[str, Any]) -> Dict[str, Dict]:
        """Sinyalleri standardize et"""
        standardized = {}
        
        # Ultra Accuracy System
        if 'ultra_accuracy' in component_signals:
            ultra = component_signals['ultra_accuracy']
            standardized['ultra_accuracy'] = {
                'signal': ultra.signal if hasattr(ultra, 'signal') else 'HOLD',
                'confidence': ultra.confidence if hasattr(ultra, 'confidence') else 0.5,
                'strength': ultra.accuracy_prediction if hasattr(ultra, 'accuracy_prediction') else 0.5,
                'weight': self.fusion_weights['ultra_accuracy']
            }
        
        # Grey TOPSIS
        if 'grey_topsis' in component_signals:
            topsis = component_signals['grey_topsis']
            topsis_score = topsis.get('topsis_score', 0.5) if isinstance(topsis, dict) else 0.5
            
            # TOPSIS score'a göre sinyal
            if topsis_score > 0.8:
                signal = 'STRONG_BUY'
            elif topsis_score > 0.6:
                signal = 'BUY'
            elif topsis_score < 0.4:
                signal = 'SELL'
            else:
                signal = 'HOLD'
            
            standardized['grey_topsis'] = {
                'signal': signal,
                'confidence': min(1.0, topsis_score),
                'strength': topsis_score,
                'weight': self.fusion_weights['grey_topsis']
            }
        
        # Technical Patterns
        if 'technical_patterns' in component_signals:
            patterns = component_signals['technical_patterns']
            if patterns:
                # En yüksek confidence'lı pattern'i al
                best_pattern = max(patterns, key=lambda x: x.get('confidence', 0))
                pattern_signal = self._pattern_to_signal(best_pattern)
                
                standardized['technical_patterns'] = {
                    'signal': pattern_signal,
                    'confidence': best_pattern.get('confidence', 0.5),
                    'strength': best_pattern.get('confidence', 0.5),
                    'weight': self.fusion_weights['technical_patterns']
                }
        
        # AI Ensemble
        if 'ai_ensemble' in component_signals:
            ai = component_signals['ai_ensemble']
            if ai and ai.get('prediction') is not None:
                prediction = ai['prediction']
                confidence = ai.get('confidence', 0.5)
                
                # Prediction'a göre sinyal
                if prediction > 0.02:
                    signal = 'STRONG_BUY'
                elif prediction > 0.01:
                    signal = 'BUY'
                elif prediction < -0.01:
                    signal = 'SELL'
                else:
                    signal = 'HOLD'
                
                standardized['ai_ensemble'] = {
                    'signal': signal,
                    'confidence': confidence,
                    'strength': abs(prediction),
                    'weight': self.fusion_weights['ai_ensemble']
                }
        
        # Sentiment Analysis
        if 'sentiment' in component_signals:
            sentiment = component_signals['sentiment']
            if sentiment:
                sentiment_score = sentiment.get('overall_sentiment', 0.0)
                confidence = sentiment.get('confidence', 0.5)
                
                # Sentiment'e göre sinyal
                if sentiment_score > 0.3:
                    signal = 'BUY'
                elif sentiment_score < -0.3:
                    signal = 'SELL'
                else:
                    signal = 'HOLD'
                
                standardized['sentiment'] = {
                    'signal': signal,
                    'confidence': confidence,
                    'strength': abs(sentiment_score),
                    'weight': self.fusion_weights['sentiment']
                }
        
        # Market Regime
        if 'market_regime' in component_signals:
            regime = component_signals['market_regime']
            regime_type = regime.get('regime', 'NEUTRAL')
            regime_confidence = regime.get('confidence', 0.5)
            
            # Regime'e göre sinyal bias
            if regime_type == 'RISK_ON':
                signal = 'BUY'
                strength = 0.7
            elif regime_type == 'RISK_OFF':
                signal = 'SELL' 
                strength = 0.7
            else:
                signal = 'HOLD'
                strength = 0.5
            
            standardized['market_regime'] = {
                'signal': signal,
                'confidence': regime_confidence,
                'strength': strength,
                'weight': self.fusion_weights['market_regime']
            }
        
        return standardized
    
    def _pattern_to_signal(self, pattern: Dict) -> str:
        """Pattern'den sinyale çevir"""
        pattern_type = pattern.get('type', '').upper()
        
        if any(word in pattern_type for word in ['BULLISH', 'BUY', 'BREAKOUT']):
            return 'BUY'
        elif any(word in pattern_type for word in ['BEARISH', 'SELL']):
            return 'SELL'
        else:
            return 'HOLD'
    
    def _adjust_weights_dynamically(self, signals: Dict[str, Dict]) -> Dict[str, float]:
        """Ağırlıkları dinamik olarak ayarla"""
        adjusted_weights = self.fusion_weights.copy()
        
        # Recent performance'a göre ağırlık ayarlama
        for signal_type, signal_data in signals.items():
            confidence = signal_data.get('confidence', 0.5)
            
            # Yüksek confidence'lı sinyallerin ağırlığını artır
            if confidence > 0.8:
                adjusted_weights[signal_type] *= 1.2
            elif confidence < 0.5:
                adjusted_weights[signal_type] *= 0.8
        
        # Normalize
        total_weight = sum(adjusted_weights.values())
        for signal_type in adjusted_weights:
            adjusted_weights[signal_type] /= total_weight
        
        return adjusted_weights
    
    def _perform_fusion(self, signals: Dict[str, Dict], weights: Dict[str, float]) -> Dict:
        """Füzyon gerçekleştir"""
        signal_scores = {'BUY': 0, 'SELL': 0, 'HOLD': 0}
        weighted_confidence = 0
        weighted_strength = 0
        
        for signal_type, signal_data in signals.items():
            weight = weights.get(signal_type, 0)
            signal = signal_data['signal']
            confidence = signal_data['confidence']
            strength = signal_data['strength']
            
            # Vote with weight
            if signal in ['STRONG_BUY', 'BUY']:
                signal_scores['BUY'] += weight * confidence * (2 if signal == 'STRONG_BUY' else 1)
            elif signal in ['STRONG_SELL', 'SELL']:
                signal_scores['SELL'] += weight * confidence * (2 if signal == 'STRONG_SELL' else 1)
            else:
                signal_scores['HOLD'] += weight * confidence
            
            weighted_confidence += weight * confidence
            weighted_strength += weight * strength
        
        # Dominant signal
        dominant_signal = max(signal_scores, key=signal_scores.get)
        dominant_score = signal_scores[dominant_signal]
        
        # Fusion score
        total_score = sum(signal_scores.values())
        fusion_score = dominant_score / total_score if total_score > 0 else 0
        
        return {
            'signal': dominant_signal,
            'score': fusion_score,
            'confidence': weighted_confidence,
            'strength': weighted_strength,
            'vote_distribution': signal_scores
        }
    
    def _calculate_fusion_confidence(self, signals: Dict[str, Dict], 
                                   fusion_result: Dict) -> float:
        """Füzyon confidence hesapla"""
        base_confidence = fusion_result['confidence']
        fusion_score = fusion_result['score']
        
        # Signal agreement bonus
        agreement_bonus = 0
        total_signals = len(signals)
        if total_signals > 1:
            # Check how many signals agree with dominant
            dominant_signal = fusion_result['signal']
            agreeing_signals = sum(1 for s in signals.values() 
                                 if self._signals_agree(s['signal'], dominant_signal))
            agreement_ratio = agreeing_signals / total_signals
            agreement_bonus = agreement_ratio * 0.2  # Max 20% bonus
        
        # Diversity penalty (if too few signals)
        diversity_penalty = 0
        if total_signals < 3:
            diversity_penalty = (3 - total_signals) * 0.1
        
        final_confidence = min(1.0, base_confidence * fusion_score + agreement_bonus - diversity_penalty)
        
        return final_confidence
    
    def _signals_agree(self, signal1: str, signal2: str) -> bool:
        """İki sinyal uyumlu mu?"""
        buy_signals = ['STRONG_BUY', 'BUY']
        sell_signals = ['STRONG_SELL', 'SELL']
        
        return ((signal1 in buy_signals and signal2 in buy_signals) or
                (signal1 in sell_signals and signal2 in sell_signals) or
                (signal1 == 'HOLD' and signal2 == 'HOLD'))
    
    def _predict_expected_accuracy(self, fusion_result: Dict, confidence: float) -> float:
        """Beklenen doğruluğu tahmin et"""
        base_accuracy = 0.6  # Baseline
        
        # Confidence bonus
        confidence_bonus = (confidence - 0.5) * 0.4  # Max 20% bonus
        
        # Fusion score bonus
        fusion_bonus = fusion_result['score'] * 0.2  # Max 20% bonus
        
        # Signal strength bonus
        strength_bonus = fusion_result['strength'] * 0.1  # Max 10% bonus
        
        expected_accuracy = min(0.95, base_accuracy + confidence_bonus + fusion_bonus + strength_bonus)
        
        return expected_accuracy
    
    def _optimize_price_targets(self, symbol: str, fusion_result: Dict, 
                              signals: Dict[str, Dict]) -> Tuple[float, float, float]:
        """Fiyat hedeflerini optimize et"""
        try:
            # Default values
            entry_price = 100.0
            take_profit = 105.0
            stop_loss = 97.0
            
            # Component signals'den price target'ları topla
            price_targets = []
            
            for signal_type, signal_data in signals.items():
                if 'price_targets' in signal_data:
                    price_targets.append(signal_data['price_targets'])
            
            # Fusion confidence'a göre aggressive/conservative ayarlama
            confidence = fusion_result['confidence']
            
            if fusion_result['signal'] in ['BUY', 'STRONG_BUY']:
                # Bullish targets
                if confidence > 0.8:
                    # High confidence: Aggressive targets
                    take_profit = entry_price * 1.08  # 8% target
                    stop_loss = entry_price * 0.96    # 4% stop
                else:
                    # Low confidence: Conservative targets
                    take_profit = entry_price * 1.04  # 4% target
                    stop_loss = entry_price * 0.98    # 2% stop
            
            elif fusion_result['signal'] in ['SELL', 'STRONG_SELL']:
                # Bearish targets (short)
                if confidence > 0.8:
                    take_profit = entry_price * 0.92  # 8% down target
                    stop_loss = entry_price * 1.04    # 4% up stop
                else:
                    take_profit = entry_price * 0.96  # 4% down target
                    stop_loss = entry_price * 1.02    # 2% up stop
            
            return entry_price, take_profit, stop_loss
            
        except Exception as e:
            logger.error(f"❌ Price target optimization hatası: {e}")
            return 100.0, 105.0, 97.0
    
    def _calculate_risk_reward(self, entry: float, tp: float, sl: float) -> float:
        """Risk/Reward oranını hesapla"""
        try:
            risk = abs(entry - sl)
            reward = abs(tp - entry)
            
            if risk > 0:
                return reward / risk
            else:
                return 1.0
        except:
            return 1.0
    
    def _determine_final_signal(self, fusion_result: Dict, confidence: float) -> str:
        """Final sinyali belirle"""
        base_signal = fusion_result['signal']
        
        # Confidence threshold kontrolü
        if confidence < self.confidence_threshold:
            return 'HOLD'  # Düşük confidence'da bekle
        
        # Strong signal için daha yüksek threshold
        if confidence > 0.9 and base_signal in ['BUY', 'SELL']:
            return f'STRONG_{base_signal}'
        
        return base_signal
    
    def get_fusion_statistics(self) -> Dict:
        """Füzyon istatistikleri"""
        if not self.fusion_history:
            return {"error": "No fusion history"}
        
        recent_fusions = self.fusion_history[-50:]  # Son 50
        
        # Signal distribution
        signal_dist = {}
        for fusion in recent_fusions:
            signal = fusion.final_signal
            signal_dist[signal] = signal_dist.get(signal, 0) + 1
        
        # Average metrics
        avg_confidence = np.mean([f.confidence for f in recent_fusions])
        avg_expected_accuracy = np.mean([f.expected_accuracy for f in recent_fusions])
        avg_risk_reward = np.mean([f.risk_reward for f in recent_fusions])
        
        return {
            'total_fusions': len(self.fusion_history),
            'recent_fusions': len(recent_fusions),
            'signal_distribution': signal_dist,
            'average_confidence': avg_confidence,
            'average_expected_accuracy': avg_expected_accuracy,
            'average_risk_reward': avg_risk_reward,
            'fusion_weights': self.fusion_weights,
            'timestamp': datetime.now().isoformat()
        }

def test_signal_fusion():
    """Signal fusion test"""
    logger.info("🧪 Signal Fusion System test başlıyor...")
    
    fusion_system = SignalFusionSystem()
    
    # Mock component signals
    test_signals = {
        'ultra_accuracy': type('UltraSignal', (), {
            'signal': 'STRONG_BUY',
            'confidence': 0.92,
            'accuracy_prediction': 0.88
        })(),
        'grey_topsis': {
            'topsis_score': 0.85,
            'financial_health': 90
        },
        'technical_patterns': [
            {
                'type': 'BULLISH_ENGULFING',
                'confidence': 0.78,
                'entry_price': 100.0
            }
        ],
        'ai_ensemble': {
            'prediction': 0.025,
            'confidence': 0.82
        },
        'sentiment': {
            'overall_sentiment': 0.4,
            'confidence': 0.75
        },
        'market_regime': {
            'regime': 'RISK_ON',
            'confidence': 0.8
        }
    }
    
    # Fusion
    fused_signal = fusion_system.fuse_signals("GARAN.IS", test_signals)
    
    if fused_signal:
        logger.info("="*80)
        logger.info("🔮 SIGNAL FUSION RESULT")
        logger.info("="*80)
        logger.info(f"Symbol: {fused_signal.symbol}")
        logger.info(f"Final Signal: {fused_signal.final_signal}")
        logger.info(f"Confidence: {fused_signal.confidence:.3f}")
        logger.info(f"Expected Accuracy: {fused_signal.expected_accuracy:.3f}")
        logger.info(f"Fusion Score: {fused_signal.fusion_score:.3f}")
        logger.info(f"Risk/Reward: {fused_signal.risk_reward:.2f}")
        logger.info(f"Entry: {fused_signal.entry_price:.2f}")
        logger.info(f"Take Profit: {fused_signal.take_profit:.2f}")
        logger.info(f"Stop Loss: {fused_signal.stop_loss:.2f}")
        logger.info("="*80)
    
    # Statistics
    stats = fusion_system.get_fusion_statistics()
    logger.info(f"📊 Fusion Statistics: {stats}")
    
    return fused_signal

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_signal_fusion()
