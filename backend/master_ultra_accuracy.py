#!/usr/bin/env python3
"""
🚀 Master Ultra-High Accuracy System
Target: 90%+ accuracy through complete integration
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import asyncio
import json

# Import all modules
from ultra_accuracy_system import UltraAccuracySystem
from adaptive_learning_system import AdaptiveLearningSystem, TradeResult
from signal_fusion_system import SignalFusionSystem
from grey_topsis_ranker import GreyTOPSISRanker
from technical_pattern_detector import TechnicalPatternDetector
from ai_ensemble_system import AIEnsembleSystem
from sentiment_analyzer import SentimentAnalyzer
from market_regime_detector import MarketRegimeDetector

logger = logging.getLogger(__name__)

@dataclass
class MasterSignal:
    """Master ultra sinyal"""
    symbol: str
    signal: str
    confidence: float
    expected_accuracy: float
    entry_price: float
    take_profit: float
    stop_loss: float
    risk_reward: float
    fusion_score: float
    component_analysis: Dict
    reasoning: List[str]
    timestamp: datetime

class MasterUltraAccuracySystem:
    """Master ultra doğruluk sistemi"""
    
    def __init__(self):
        # Initialize all subsystems
        self.ultra_system = UltraAccuracySystem()
        self.learning_system = AdaptiveLearningSystem()
        self.fusion_system = SignalFusionSystem()
        
        # Core systems
        self.topsis_ranker = GreyTOPSISRanker()
        self.pattern_detector = TechnicalPatternDetector()
        self.ai_ensemble = AIEnsembleSystem()
        self.sentiment_analyzer = SentimentAnalyzer()
        self.regime_detector = MarketRegimeDetector()
        
        # Performance tracking
        self.master_accuracy = 0.0
        self.signal_history = []
        
    async def generate_master_signal(self, symbol: str) -> Optional[MasterSignal]:
        """Master ultra sinyal üret"""
        logger.info(f"�� {symbol} için MASTER ULTRA ACCURACY analizi başlıyor...")
        
        try:
            # 1. Collect all component signals
            component_signals = await self._collect_all_signals(symbol)
            
            if not component_signals:
                logger.error(f"❌ {symbol} için sinyal bulunamadı")
                return None
            
            # 2. Apply signal fusion
            fused_signal = self.fusion_system.fuse_signals(symbol, component_signals)
            
            if not fused_signal:
                logger.error(f"❌ {symbol} fusion başarısız")
                return None
            
            # 3. Apply adaptive learning corrections
            corrected_signal = self._apply_learning_corrections(fused_signal, component_signals)
            
            # 4. Final validation and confidence boost
            validated_signal = self._final_validation(corrected_signal, component_signals)
            
            # 5. Generate reasoning
            reasoning = self._generate_reasoning(validated_signal, component_signals)
            
            # 6. Create master signal
            master_signal = MasterSignal(
                symbol=symbol,
                signal=validated_signal.final_signal,
                confidence=validated_signal.confidence,
                expected_accuracy=validated_signal.expected_accuracy,
                entry_price=validated_signal.entry_price,
                take_profit=validated_signal.take_profit,
                stop_loss=validated_signal.stop_loss,
                risk_reward=validated_signal.risk_reward,
                fusion_score=validated_signal.fusion_score,
                component_analysis=component_signals,
                reasoning=reasoning,
                timestamp=datetime.now()
            )
            
            # 7. Record for learning
            self.signal_history.append(master_signal)
            
            logger.info(f"✅ {symbol} MASTER SIGNAL: {master_signal.signal} "
                       f"(Conf: {master_signal.confidence:.2f}, "
                       f"Exp.Acc: {master_signal.expected_accuracy:.2f})")
            
            return master_signal
            
        except Exception as e:
            logger.error(f"❌ {symbol} master signal hatası: {e}")
            return None
    
    async def _collect_all_signals(self, symbol: str) -> Dict:
        """Tüm sinyalleri topla"""
        signals = {}
        
        try:
            # 1. Ultra Accuracy System
            logger.info(f"🔬 {symbol} Ultra Accuracy analizi...")
            ultra_signal = self.ultra_system.generate_ultra_signal(symbol)
            if ultra_signal:
                signals['ultra_accuracy'] = ultra_signal
            
            # 2. Financial Ranking
            logger.info(f"🧮 {symbol} TOPSIS analizi...")
            topsis_ranking = self.topsis_ranker.rank_stocks([symbol])
            if topsis_ranking:
                signals['grey_topsis'] = topsis_ranking.get(symbol, {})
            
            # 3. Technical Patterns
            logger.info(f"📈 {symbol} Pattern analizi...")
            patterns = self.pattern_detector.detect_all_patterns(symbol)
            if patterns:
                signals['technical_patterns'] = [
                    {
                        'type': p.pattern_type.value,
                        'confidence': p.confidence,
                        'entry_price': p.entry_price,
                        'take_profit': p.take_profit,
                        'stop_loss': p.stop_loss
                    } for p in patterns
                ]
            
            # 4. AI Ensemble
            logger.info(f"🤖 {symbol} AI Ensemble analizi...")
            ai_prediction = self.ai_ensemble.predict_ensemble(symbol)
            if ai_prediction:
                signals['ai_ensemble'] = {
                    'prediction': ai_prediction.prediction,
                    'confidence': ai_prediction.confidence,
                    'lightgbm_pred': ai_prediction.lightgbm_pred,
                    'lstm_pred': ai_prediction.lstm_pred,
                    'timegpt_pred': ai_prediction.timegpt_pred
                }
            
            # 5. Sentiment Analysis
            logger.info(f"📰 {symbol} Sentiment analizi...")
            sentiment = self.sentiment_analyzer.analyze_stock_sentiment(symbol)
            if sentiment:
                signals['sentiment'] = {
                    'overall_sentiment': sentiment.overall_sentiment,
                    'confidence': sentiment.confidence,
                    'news_count': sentiment.news_count,
                    'positive_news': sentiment.positive_news,
                    'negative_news': sentiment.negative_news
                }
            
            # 6. Market Regime
            logger.info(f"🌊 Market Regime analizi...")
            market_regime = self.regime_detector.detect_market_regime()
            if market_regime:
                signals['market_regime'] = {
                    'regime': market_regime.regime,
                    'confidence': market_regime.confidence,
                    'volatility': market_regime.volatility,
                    'trend_strength': market_regime.trend_strength
                }
            
            logger.info(f"✅ {symbol}: {len(signals)} komponent sinyal toplandı")
            return signals
            
        except Exception as e:
            logger.error(f"❌ {symbol} sinyal toplama hatası: {e}")
            return {}
    
    def _apply_learning_corrections(self, fused_signal, component_signals):
        """Öğrenme düzeltmelerini uygula"""
        try:
            # Learning system'den historical performance al
            performance_report = self.learning_system.get_performance_report()
            
            if performance_report.get('error'):
                return fused_signal
            
            # Recent accuracy
            recent_accuracy = performance_report['performance_summary']['accuracy']
            
            # Confidence adjustment based on recent performance
            if recent_accuracy > 0.8:
                # High recent accuracy: Boost confidence
                fused_signal.confidence = min(1.0, fused_signal.confidence * 1.1)
                fused_signal.expected_accuracy = min(0.95, fused_signal.expected_accuracy * 1.05)
            elif recent_accuracy < 0.6:
                # Low recent accuracy: Be more conservative
                fused_signal.confidence = max(0.3, fused_signal.confidence * 0.9)
                fused_signal.expected_accuracy = max(0.5, fused_signal.expected_accuracy * 0.95)
            
            return fused_signal
            
        except Exception as e:
            logger.error(f"❌ Learning correction hatası: {e}")
            return fused_signal
    
    def _final_validation(self, signal, component_signals):
        """Final validasyon"""
        try:
            # Multi-layer validation
            validation_score = 0.0
            
            # 1. Component agreement validation
            agreement_count = 0
            total_components = len(component_signals)
            
            for comp_name, comp_data in component_signals.items():
                if self._component_agrees_with_signal(comp_data, signal.final_signal):
                    agreement_count += 1
            
            agreement_ratio = agreement_count / total_components if total_components > 0 else 0
            validation_score += agreement_ratio * 0.4  # 40% weight
            
            # 2. Market condition validation
            market_regime = component_signals.get('market_regime', {})
            if self._signal_aligns_with_regime(signal.final_signal, market_regime):
                validation_score += 0.3  # 30% weight
            
            # 3. Risk-reward validation
            if signal.risk_reward >= 1.5:  # Good risk-reward
                validation_score += 0.2  # 20% weight
            elif signal.risk_reward >= 1.0:
                validation_score += 0.1
            
            # 4. Technical confirmation
            patterns = component_signals.get('technical_patterns', [])
            if patterns and any(p.get('confidence', 0) > 0.7 for p in patterns):
                validation_score += 0.1  # 10% weight
            
            # Apply validation boost
            if validation_score > 0.7:
                signal.confidence = min(1.0, signal.confidence * 1.15)
                signal.expected_accuracy = min(0.95, signal.expected_accuracy * 1.1)
            elif validation_score < 0.4:
                signal.confidence = max(0.2, signal.confidence * 0.85)
                signal.expected_accuracy = max(0.5, signal.expected_accuracy * 0.9)
            
            return signal
            
        except Exception as e:
            logger.error(f"❌ Final validation hatası: {e}")
            return signal
    
    def _component_agrees_with_signal(self, comp_data, final_signal) -> bool:
        """Komponent sinyal ile uyumlu mu?"""
        try:
            if isinstance(comp_data, dict):
                # TOPSIS
                if 'topsis_score' in comp_data:
                    score = comp_data['topsis_score']
                    if final_signal in ['STRONG_BUY', 'BUY'] and score > 0.6:
                        return True
                    elif final_signal in ['SELL', 'STRONG_SELL'] and score < 0.4:
                        return True
                
                # AI Ensemble
                elif 'prediction' in comp_data:
                    pred = comp_data['prediction']
                    if final_signal in ['STRONG_BUY', 'BUY'] and pred > 0.01:
                        return True
                    elif final_signal in ['SELL', 'STRONG_SELL'] and pred < -0.01:
                        return True
                
                # Sentiment
                elif 'overall_sentiment' in comp_data:
                    sentiment = comp_data['overall_sentiment']
                    if final_signal in ['STRONG_BUY', 'BUY'] and sentiment > 0.1:
                        return True
                    elif final_signal in ['SELL', 'STRONG_SELL'] and sentiment < -0.1:
                        return True
            
            elif isinstance(comp_data, list):  # Patterns
                for pattern in comp_data:
                    pattern_type = pattern.get('type', '').upper()
                    if final_signal in ['STRONG_BUY', 'BUY'] and 'BULLISH' in pattern_type:
                        return True
                    elif final_signal in ['SELL', 'STRONG_SELL'] and 'BEARISH' in pattern_type:
                        return True
            
            elif hasattr(comp_data, 'signal'):  # Ultra accuracy
                comp_signal = comp_data.signal
                buy_signals = ['STRONG_BUY', 'BUY']
                sell_signals = ['STRONG_SELL', 'SELL']
                
                if final_signal in buy_signals and comp_signal in buy_signals:
                    return True
                elif final_signal in sell_signals and comp_signal in sell_signals:
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"❌ Component agreement check hatası: {e}")
            return False
    
    def _signal_aligns_with_regime(self, signal: str, regime_data: Dict) -> bool:
        """Sinyal market regime ile uyumlu mu?"""
        try:
            regime = regime_data.get('regime', 'NEUTRAL')
            
            if regime == 'RISK_ON' and signal in ['STRONG_BUY', 'BUY']:
                return True
            elif regime == 'RISK_OFF' and signal in ['SELL', 'STRONG_SELL']:
                return True
            elif regime == 'NEUTRAL' and signal == 'HOLD':
                return True
            
            return False
            
        except:
            return False
    
    def _generate_reasoning(self, signal, component_signals) -> List[str]:
        """Reasoning üret"""
        reasoning = []
        
        try:
            # Main signal reasoning
            reasoning.append(f"Ana Sinyal: {signal.final_signal} ({signal.confidence:.1%} güven)")
            reasoning.append(f"Beklenen Doğruluk: {signal.expected_accuracy:.1%}")
            reasoning.append(f"Risk/Reward: {signal.risk_reward:.2f}")
            
            # Component contributions
            if 'ultra_accuracy' in component_signals:
                ultra = component_signals['ultra_accuracy']
                reasoning.append(f"Ultra ML System: {ultra.signal} ({ultra.confidence:.1%})")
            
            if 'grey_topsis' in component_signals:
                topsis = component_signals['grey_topsis']
                score = topsis.get('topsis_score', 0)
                reasoning.append(f"Finansal Sağlık Skoru: {score:.2f}")
            
            patterns = component_signals.get('technical_patterns', [])
            if patterns:
                best_pattern = max(patterns, key=lambda x: x.get('confidence', 0))
                reasoning.append(f"En Güçlü Pattern: {best_pattern.get('type', 'N/A')}")
            
            ai_data = component_signals.get('ai_ensemble', {})
            if ai_data:
                pred = ai_data.get('prediction', 0)
                reasoning.append(f"AI Tahmin: {pred:+.1%} getiri")
            
            sentiment_data = component_signals.get('sentiment', {})
            if sentiment_data:
                sentiment = sentiment_data.get('overall_sentiment', 0)
                reasoning.append(f"Haber Sentiment: {'Pozitif' if sentiment > 0 else 'Negatif' if sentiment < 0 else 'Nötr'}")
            
            regime_data = component_signals.get('market_regime', {})
            if regime_data:
                regime = regime_data.get('regime', 'NEUTRAL')
                reasoning.append(f"Market Rejimi: {regime}")
            
            return reasoning
            
        except Exception as e:
            logger.error(f"❌ Reasoning generation hatası: {e}")
            return ["Reasoning generation failed"]
    
    async def analyze_portfolio(self, symbols: List[str]) -> List[MasterSignal]:
        """Portföy analizi"""
        logger.info(f"🚀 {len(symbols)} sembol için MASTER ULTRA ACCURACY portföy analizi...")
        
        master_signals = []
        
        for symbol in symbols:
            try:
                master_signal = await self.generate_master_signal(symbol)
                if master_signal:
                    master_signals.append(master_signal)
                    
                # Rate limiting
                await asyncio.sleep(1)
                
            except Exception as e:
                logger.error(f"❌ {symbol} analiz hatası: {e}")
                continue
        
        # Sort by expected accuracy and confidence
        master_signals.sort(
            key=lambda x: (x.expected_accuracy * x.confidence), 
            reverse=True
        )
        
        logger.info(f"✅ {len(master_signals)} MASTER SIGNAL oluşturuldu")
        return master_signals
    
    def get_system_statistics(self) -> Dict:
        """Sistem istatistikleri"""
        try:
            if not self.signal_history:
                return {"error": "No signal history"}
            
            recent_signals = self.signal_history[-50:]
            
            # Signal distribution
            signal_dist = {}
            for signal in recent_signals:
                sig_type = signal.signal
                signal_dist[sig_type] = signal_dist.get(sig_type, 0) + 1
            
            # Average metrics
            avg_confidence = np.mean([s.confidence for s in recent_signals])
            avg_expected_accuracy = np.mean([s.expected_accuracy for s in recent_signals])
            avg_risk_reward = np.mean([s.risk_reward for s in recent_signals])
            
            # Best signals
            best_signals = sorted(recent_signals, 
                                key=lambda x: x.expected_accuracy * x.confidence, 
                                reverse=True)[:5]
            
            return {
                'total_signals': len(self.signal_history),
                'recent_signals': len(recent_signals),
                'signal_distribution': signal_dist,
                'average_confidence': avg_confidence,
                'average_expected_accuracy': avg_expected_accuracy,
                'average_risk_reward': avg_risk_reward,
                'best_recent_signals': [
                    {
                        'symbol': s.symbol,
                        'signal': s.signal,
                        'confidence': s.confidence,
                        'expected_accuracy': s.expected_accuracy
                    } for s in best_signals
                ],
                'system_accuracy_target': 0.90,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Statistics generation hatası: {e}")
            return {"error": str(e)}

async def test_master_ultra_accuracy():
    """Master ultra accuracy test"""
    logger.info("🧪 MASTER ULTRA ACCURACY SYSTEM test başlıyor...")
    
    master_system = MasterUltraAccuracySystem()
    
    # Test symbols
    test_symbols = ["GARAN.IS", "AKBNK.IS", "SISE.IS"]
    
    # Analyze portfolio
    master_signals = await master_system.analyze_portfolio(test_symbols)
    
    logger.info("="*100)
    logger.info("🚀 MASTER ULTRA ACCURACY RESULTS")
    logger.info("="*100)
    
    for i, signal in enumerate(master_signals):
        logger.info(f"🎯 #{i+1} {signal.symbol}:")
        logger.info(f"   Signal: {signal.signal}")
        logger.info(f"   Confidence: {signal.confidence:.3f}")
        logger.info(f"   Expected Accuracy: {signal.expected_accuracy:.3f} (Target: 90%+)")
        logger.info(f"   Risk/Reward: {signal.risk_reward:.2f}")
        logger.info(f"   Entry: {signal.entry_price:.2f} | TP: {signal.take_profit:.2f} | SL: {signal.stop_loss:.2f}")
        logger.info(f"   Reasoning: {signal.reasoning[:3]}")  # İlk 3 reasoning
        logger.info("")
    
    # System statistics
    stats = master_system.get_system_statistics()
    logger.info("📊 SYSTEM STATISTICS:")
    logger.info(f"   Average Expected Accuracy: {stats.get('average_expected_accuracy', 0):.1%}")
    logger.info(f"   Average Confidence: {stats.get('average_confidence', 0):.1%}")
    logger.info(f"   Average Risk/Reward: {stats.get('average_risk_reward', 0):.2f}")
    
    # Target check
    target_accuracy = 0.90
    avg_exp_acc = stats.get('average_expected_accuracy', 0)
    
    if avg_exp_acc >= target_accuracy:
        logger.info(f"�� TARGET ACHIEVED! Expected accuracy {avg_exp_acc:.1%} >= {target_accuracy:.1%}")
    else:
        logger.info(f"🎯 TARGET IN PROGRESS: {avg_exp_acc:.1%} / {target_accuracy:.1%}")
    
    logger.info("="*100)
    
    return master_signals

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(test_master_ultra_accuracy())
