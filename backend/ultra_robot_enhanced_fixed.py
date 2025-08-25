"""
Ultra Trading Robot - Enhanced Version (Fixed)
PRD v2.0 - %80+ Başarı Oranı Hedefi
AI Ensemble + Advanced Risk Management + Portfolio Optimization
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
from ultra_trading_robot import UltraTradingRobot, TimeFrame, StrategyType, TradingSignal

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedSignalType(Enum):
    """Gelişmiş sinyal türleri"""
    STRONG_BUY = "STRONG_BUY"      # Güçlü al
    BUY = "BUY"                     # Al
    WEAK_BUY = "WEAK_BUY"          # Zayıf al
    HOLD = "HOLD"                   # Tut
    WEAK_SELL = "WEAK_SELL"        # Zayıf sat
    SELL = "SELL"                   # Sat
    STRONG_SELL = "STRONG_SELL"    # Güçlü sat

@dataclass
class EnhancedTradingSignal:
    """Gelişmiş trading sinyali"""
    symbol: str
    action: EnhancedSignalType
    timeframe: TimeFrame
    strategy: StrategyType
    confidence: float
    entry_price: float
    stop_loss: float
    take_profit: float
    position_size: float
    risk_reward: float
    timestamp: datetime
    reasons: List[str]
    technical_indicators: Dict
    fundamental_score: float
    sentiment_score: float
    ai_ensemble_score: float
    risk_score: float
    portfolio_score: float
    final_score: float

class UltraRobotEnhancedFixed(UltraTradingRobot):
    """Güçlendirilmiş Ultra Trading Robot (%80+ hedef) - Düzeltilmiş"""
    
    def __init__(self):
        super().__init__()
        
        # Base class config'i güncelle
        self.config["min_risk_reward"] = 1.2  # 2.0 -> 1.2 (daha gerçekçi)
        
        # Gelişmiş konfigürasyon
        self.enhanced_config = {
            "min_confidence": 0.20,        # Minimum güven skoru
            "min_ai_score": 0.30,          # Minimum AI skoru
            "min_risk_score": 0.60,        # Minimum risk skoru
            "min_portfolio_score": 0.50,   # Minimum portföy skoru
            "target_win_rate": 0.80,       # Hedef kazanma oranı
            "max_correlation": 0.5,        # Maksimum korelasyon
            "volatility_target": 0.12,     # Hedef volatilite
            "momentum_weight": 0.3,        # Momentum ağırlığı
            "mean_reversion_weight": 0.2,  # Ortalama dönüşüm ağırlığı
            "trend_weight": 0.5,           # Trend ağırlığı
        }
        
        # AI Ensemble modelleri
        self.ai_models = {
            "momentum": None,
            "mean_reversion": None,
            "trend_following": None,
            "volatility": None,
            "sentiment": None
        }
        
        # Gelişmiş teknik indikatörler
        self.enhanced_indicators = [
            "RSI", "MACD", "Bollinger", "ATR", "Volume",
            "Stochastic", "ADX", "CCI"
        ]
        
        # Risk yönetimi
        self.risk_manager = EnhancedRiskManager()
        
        # Portfolio optimizer
        self.portfolio_optimizer = PortfolioOptimizer()
        
        # Performance tracker
        self.performance_tracker = EnhancedPerformanceTracker()
        
        # Alternative Data Manager (SPRINT 1 entegrasyonu)
        try:
            from alternative_data_manager import AlternativeDataManager, AlternativeDataConfig
            config = AlternativeDataConfig(
                finnhub_api_key="",  # TODO: Environment variable'dan al
                yahoo_fallback=True,
                kap_oda_enabled=True,
                news_sentiment_enabled=True
            )
            self.alternative_data_manager = AlternativeDataManager(config)
            logger.info("✅ Alternative Data Manager entegre edildi")
        except Exception as e:
            logger.warning(f"⚠️ Alternative Data Manager entegrasyon hatası: {e}")
            self.alternative_data_manager = None
        
        # Advanced Feature Engineering (SPRINT 2 entegrasyonu)
        try:
            from advanced_feature_engineering_v2 import AdvancedFeatureEngineer
            self.advanced_feature_engineer = AdvancedFeatureEngineer()
            logger.info("✅ Advanced Feature Engineering entegre edildi")
        except Exception as e:
            logger.warning(f"⚠️ Advanced Feature Engineering entegrasyon hatası: {e}")
            self.advanced_feature_engineer = None
        
        # Sentiment & News Analysis (SPRINT 3 entegrasyonu)
        try:
            from sentiment_news_analyzer import SentimentNewsAnalyzer
            self.sentiment_analyzer = SentimentNewsAnalyzer()
            logger.info("✅ Sentiment & News Analysis entegre edildi")
        except Exception as e:
            logger.warning(f"⚠️ Sentiment & News Analysis entegrasyon hatası: {e}")
            self.sentiment_analyzer = None
        
        # Advanced Ensemble Optimization (SPRINT 4 entegrasyonu)
        try:
            from advanced_ensemble_optimizer import AdvancedEnsembleOptimizer, EnsembleConfig
            config = EnsembleConfig(
                stacking_enabled=True,
                dynamic_weighting=True,
                model_diversity=True,
                cross_validation_folds=5,
                time_series_split=True,
                performance_threshold=0.7
            )
            self.ensemble_optimizer = AdvancedEnsembleOptimizer(config)
            logger.info("✅ Advanced Ensemble Optimization entegre edildi")
        except Exception as e:
            logger.warning(f"⚠️ Advanced Ensemble Optimization entegrasyon hatası: {e}")
            self.ensemble_optimizer = None
    
    def create_enhanced_strategy(self, symbol: str, timeframes: List[TimeFrame]) -> Dict:
        """Gelişmiş strateji oluştur"""
        try:
            logger.info(f"🚀 {symbol} için gelişmiş strateji oluşturuluyor...")
            
            # Temel strateji
            base_strategy = self.create_multi_timeframe_strategy(symbol, timeframes)
            
            # AI modelleri eğit
            self._train_ai_models(symbol, timeframes)
            
            # Gelişmiş konfigürasyon
            enhanced_strategy = {
                **base_strategy,
                "enhanced_config": self.enhanced_config,
                "ai_models": {name: "trained" for name in self.ai_models.keys()},
                "risk_management": self.risk_manager.get_config(),
                "portfolio_optimization": self.portfolio_optimizer.get_config(),
                "performance_targets": {
                    "target_win_rate": self.enhanced_config["target_win_rate"],
                    "target_sharpe": 1.5,
                    "target_max_drawdown": 0.10,
                    "target_return": 0.25
                }
            }
            
            logger.info(f"✅ {symbol} gelişmiş stratejisi oluşturuldu")
            return enhanced_strategy
            
        except Exception as e:
            logger.error(f"❌ Gelişmiş strateji hatası: {e}")
            return {"error": str(e)}
    
    def _train_ai_models(self, symbol: str, timeframes: List[TimeFrame]) -> None:
        """AI modelleri eğit (Advanced Features ile)"""
        try:
            logger.info(f"🧠 {symbol} için AI modelleri eğitiliyor...")
            
            # Her timeframe için veri topla
            for timeframe in timeframes:
                data = self._get_market_data_fixed(symbol, timeframe)
                if not data.empty:
                    # Advanced features ekle
                    if hasattr(self, 'advanced_feature_engineer') and self.advanced_feature_engineer:
                        try:
                            # Market data'yı DataFrame'e çevir
                            if isinstance(data, pd.DataFrame):
                                # Advanced features oluştur (sync wrapper)
                                try:
                                    # Async fonksiyonu sync olarak çağır
                                    import asyncio
                                    loop = asyncio.new_event_loop()
                                    asyncio.set_event_loop(loop)
                                    advanced_features = loop.run_until_complete(
                                        self.advanced_feature_engineer.create_advanced_features(symbol, data)
                                    )
                                    loop.close()
                                except Exception as e:
                                    logger.warning(f"⚠️ Advanced features async hatası: {e}")
                                    advanced_features = None
                                if advanced_features:
                                    logger.info(f"✅ {symbol} için advanced features oluşturuldu")
                                    
                                    # Features'ları data'ya ekle
                                    data['order_flow_imbalance'] = advanced_features.order_flow_imbalance
                                    data['volume_profile'] = advanced_features.volume_profile
                                    data['price_impact'] = advanced_features.price_impact
                                    data['garch_volatility'] = advanced_features.garch_volatility
                                    data['volatility_clustering'] = advanced_features.volatility_clustering
                                    data['realized_volatility'] = advanced_features.realized_volatility
                                    data['sector_rotation'] = advanced_features.sector_rotation
                                    data['market_breadth'] = advanced_features.market_breadth
                                    data['beta'] = advanced_features.beta
                                    data['supertrend'] = advanced_features.supertrend
                                    data['fibonacci_retracement'] = advanced_features.fibonacci_retracement
                                    
                                    # Pivot points
                                    if advanced_features.pivot_points:
                                        data['pivot_position'] = advanced_features.pivot_points.get('position', 0.5)
                                    
                                    logger.info(f"✅ Advanced features data'ya eklendi")
                        except Exception as e:
                            logger.warning(f"⚠️ Advanced features hatası: {e}")
                    
                    # Sentiment analysis ekle
                    if hasattr(self, 'sentiment_analyzer') and self.sentiment_analyzer:
                        try:
                            # Company name (symbol'den çıkar)
                            company_name = symbol.replace('.IS', '')
                            
                            # Sentiment analysis yap (sync wrapper)
                            try:
                                import asyncio
                                loop = asyncio.new_event_loop()
                                asyncio.set_event_loop(loop)
                                sentiment_result = loop.run_until_complete(
                                    self.sentiment_analyzer.analyze_company_sentiment(symbol, company_name)
                                )
                                loop.close()
                            except Exception as e:
                                logger.warning(f"⚠️ Sentiment analysis async hatası: {e}")
                                sentiment_result = None
                            if sentiment_result:
                                logger.info(f"✅ {symbol} için sentiment analysis tamamlandı")
                                
                                # Sentiment features'ları data'ya ekle
                                data['overall_sentiment'] = sentiment_result.overall_sentiment
                                data['news_sentiment_score'] = sentiment_result.news_sentiment_score
                                data['event_sentiment_score'] = sentiment_result.event_sentiment_score
                                data['sentiment_confidence'] = sentiment_result.confidence
                                
                                # Sentiment label'ı numeric'e çevir
                                sentiment_label_map = {'positive': 1.0, 'neutral': 0.0, 'negative': -1.0}
                                data['sentiment_label_numeric'] = sentiment_label_map.get(sentiment_result.sentiment_label, 0.0)
                                
                                logger.info(f"✅ Sentiment features data'ya eklendi")
                        except Exception as e:
                            logger.warning(f"⚠️ Sentiment analysis hatası: {e}")
                    
                    # Momentum modeli
                    self.ai_models["momentum"] = self._train_momentum_model(data)
                    
                    # Mean reversion modeli
                    self.ai_models["mean_reversion"] = self._train_mean_reversion_model(data)
                    
                    # Trend following modeli
                    self.ai_models["trend_following"] = self._train_trend_following_model(data)
                    
                    # Volatility modeli
                    self.ai_models["volatility"] = self._train_volatility_model(data)
                    
                    # Sentiment modeli
                    self.ai_models["sentiment"] = self._train_sentiment_model(data)
            
            logger.info(f"✅ AI modelleri eğitildi")
            
            # Ensemble optimization (SPRINT 4)
            if hasattr(self, 'ensemble_optimizer') and self.ensemble_optimizer:
                try:
                    logger.info(f"🔧 {symbol} için ensemble optimization başlıyor...")
                    
                    # Feature matrix oluştur
                    feature_columns = [col for col in data.columns if col not in ['Open', 'High', 'Low', 'Close', 'Volume']]
                    if feature_columns:
                        X = data[feature_columns].dropna().values
                        y = data['Close'].pct_change().dropna().values
                        
                        # Align data
                        min_len = min(len(X), len(y))
                        if min_len > 20:
                            X = X[:min_len]
                            y = y[:min_len]
                            
                            # Ensemble optimization (sync wrapper)
                            try:
                                import asyncio
                                loop = asyncio.new_event_loop()
                                asyncio.set_event_loop(loop)
                                
                                # Train models
                                loop.run_until_complete(self.ensemble_optimizer.train_all_models(X, y))
                                
                                # Ensemble prediction
                                market_regime = "normal"  # TODO: Market regime detection
                                ensemble_result = loop.run_until_complete(
                                    self.ensemble_optimizer.predict_ensemble(X, symbol, market_regime)
                                )
                                
                                loop.close()
                            except Exception as e:
                                logger.warning(f"⚠️ Ensemble optimization async hatası: {e}")
                                ensemble_result = None
                            
                            if ensemble_result:
                                logger.info(f"✅ {symbol} için ensemble optimization tamamlandı")
                                logger.info(f"   Tahmin: {ensemble_result.prediction:.6f}")
                                logger.info(f"   Güven: {ensemble_result.confidence:.4f}")
                            else:
                                logger.warning(f"⚠️ {symbol} için ensemble optimization başarısız")
                        else:
                            logger.warning(f"⚠️ {symbol} için yeterli veri yok (min: 20, mevcut: {min_len})")
                    else:
                        logger.warning(f"⚠️ {symbol} için feature columns bulunamadı")
                        
                except Exception as e:
                    logger.warning(f"⚠️ Ensemble optimization hatası: {e}")
            
        except Exception as e:
            logger.error(f"❌ AI model eğitimi hatası: {e}")
    
    def _get_market_data_fixed(self, symbol: str, timeframe: TimeFrame) -> pd.DataFrame:
        """Market verisi çek (Alternative Data Manager ile entegre)"""
        try:
            # Alternative Data Manager kullan
            if hasattr(self, 'alternative_data_manager'):
                try:
                    # Comprehensive data al (async wrapper)
                    import asyncio
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    comprehensive_data = loop.run_until_complete(
                        self.alternative_data_manager.get_comprehensive_stock_data(symbol)
                    )
                    loop.close()
                    if comprehensive_data:
                        logger.info(f"✅ Alternative Data Manager'dan veri alındı: {symbol}")
                        
                        # Yahoo Finance fallback ile historical data
                        stock = yf.Ticker(symbol)
                        
                        # Zaman dilimine göre period ayarla
                        if timeframe in [TimeFrame.M1, TimeFrame.M5, TimeFrame.M15, TimeFrame.M30]:
                            period = "60d"  # Son 60 gün
                        elif timeframe in [TimeFrame.H1, TimeFrame.H4]:
                            period = "2y"   # Son 2 yıl
                        else:
                            period = "5y"   # Son 5 yıl
                        
                        # Historical data çek
                        data = stock.history(period=period, interval=timeframe.value)
                        
                        if not data.empty:
                            # Alternative data bilgilerini ekle
                            data['alternative_price'] = comprehensive_data.price
                            data['alternative_volume'] = comprehensive_data.volume
                            data['alternative_sector'] = comprehensive_data.sector
                            data['alternative_pe_ratio'] = comprehensive_data.pe_ratio
                            data['alternative_pb_ratio'] = comprehensive_data.pb_ratio
                            data['alternative_dividend_yield'] = comprehensive_data.dividend_yield
                            data['alternative_confidence'] = comprehensive_data.confidence
                            data['alternative_data_source'] = comprehensive_data.data_source
                            
                            logger.info(f"✅ {timeframe.value}: {len(data)} veri noktası + Alternative Data")
                            return data
                        else:
                            logger.warning(f"⚠️ {timeframe.value}: Historical veri bulunamadı")
                            return pd.DataFrame()
                    else:
                        logger.warning(f"⚠️ Alternative Data Manager'dan veri alınamadı, fallback kullanılıyor")
                except Exception as e:
                    logger.warning(f"⚠️ Alternative Data Manager hatası: {e}, fallback kullanılıyor")
            
            # Fallback: Orijinal Yahoo Finance yöntemi
            stock = yf.Ticker(symbol)
            
            # Zaman dilimine göre period ayarla
            if timeframe in [TimeFrame.M1, TimeFrame.M5, TimeFrame.M15, TimeFrame.M30]:
                period = "60d"  # Son 60 gün
            elif timeframe in [TimeFrame.H1, TimeFrame.H4]:
                period = "2y"   # Son 2 yıl
            else:
                period = "5y"   # Son 5 yıl
            
            # Veri çek
            data = stock.history(period=period, interval=timeframe.value)
            
            if not data.empty:
                logger.info(f"✅ {timeframe.value}: {len(data)} veri noktası (fallback)")
                return data
            else:
                logger.warning(f"⚠️ {timeframe.value}: Veri bulunamadı")
                return pd.DataFrame()
                
        except Exception as e:
            logger.error(f"❌ {timeframe.value} veri çekme hatası: {e}")
            return pd.DataFrame()
    
    def _train_momentum_model(self, data: pd.DataFrame) -> Dict:
        """Momentum modeli eğit"""
        try:
            # RSI, MACD, Stochastic momentum
            rsi = self._calculate_rsi(data['Close'])
            macd = self._calculate_macd(data['Close'])
            stoch = self._calculate_stochastic(data)
            
            # NaN kontrolü
            if pd.isna(rsi.iloc[-1]) or pd.isna(macd["macd"].iloc[-1]) or pd.isna(stoch["k"].iloc[-1]):
                return {"type": "momentum", "score": 0.3, "confidence": 0.3, "indicators": {}}
            
            # Momentum score
            momentum_score = (
                (rsi.iloc[-1] - 50) / 50 +  # RSI momentum
                (macd["macd"].iloc[-1] - macd["signal"].iloc[-1]) / abs(macd["macd"].iloc[-1]) +  # MACD momentum
                (stoch["k"].iloc[-1] - 50) / 50  # Stochastic momentum
            ) / 3
            
            # Skoru normalize et
            momentum_score = max(-1.0, min(1.0, momentum_score))
            
            return {
                "type": "momentum",
                "score": momentum_score,
                "confidence": abs(momentum_score),
                "indicators": {"rsi": rsi.iloc[-1], "macd": macd["macd"].iloc[-1], "stoch": stoch["k"].iloc[-1]}
            }
            
        except Exception as e:
            return {"type": "momentum", "score": 0.3, "confidence": 0.3, "indicators": {}}
    
    def _train_mean_reversion_model(self, data: pd.DataFrame) -> Dict:
        """Mean reversion modeli eğit"""
        try:
            # Bollinger Bands, RSI extremes
            bb = self._calculate_bollinger_bands(data['Close'])
            rsi = self._calculate_rsi(data['Close'])
            
            # NaN kontrolü
            if pd.isna(bb["position"].iloc[-1]) or pd.isna(rsi.iloc[-1]):
                return {"type": "mean_reversion", "score": 0.2, "confidence": 0.2, "indicators": {}}
            
            # Mean reversion score
            bb_position = bb["position"].iloc[-1]
            rsi_extreme = (rsi.iloc[-1] - 50) / 50
            
            mean_reversion_score = 0
            if bb_position < 0.2 and rsi_extreme < -0.3:  # Oversold
                mean_reversion_score = 0.8
            elif bb_position > 0.8 and rsi_extreme > 0.3:  # Overbought
                mean_reversion_score = -0.8
            
            return {
                "type": "mean_reversion",
                "score": mean_reversion_score,
                "confidence": abs(mean_reversion_score),
                "indicators": {"bb_position": bb_position, "rsi": rsi.iloc[-1]}
            }
            
        except Exception as e:
            return {"type": "mean_reversion", "score": 0.2, "confidence": 0.2, "indicators": {}}
    
    def _train_trend_following_model(self, data: pd.DataFrame) -> Dict:
        """Trend following modeli eğit"""
        try:
            # Moving averages, ADX
            sma_20 = data['Close'].rolling(20).mean()
            sma_50 = data['Close'].rolling(50).mean()
            adx = self._calculate_adx(data)
            
            # Trend score
            current_price = data['Close'].iloc[-1]
            sma_20_val = sma_20.iloc[-1]
            sma_50_val = sma_50.iloc[-1]
            adx_val = adx.iloc[-1]
            
            # NaN kontrolü
            if pd.isna(sma_20_val) or pd.isna(sma_50_val) or pd.isna(adx_val):
                return {"type": "trend_following", "score": 0.4, "confidence": 0.4, "indicators": {}}
            
            trend_strength = (adx_val - 25) / 75  # ADX trend strength
            trend_direction = 1 if current_price > sma_20_val > sma_50_val else -1
            
            trend_score = trend_direction * trend_strength
            
            # Skoru normalize et
            trend_score = max(-1.0, min(1.0, trend_score))
            
            return {
                "type": "trend_following",
                "score": trend_score,
                "confidence": abs(trend_score),
                "indicators": {"sma_20": sma_20_val, "sma_50": sma_50_val, "adx": adx_val}
            }
            
        except Exception as e:
            return {"type": "trend_following", "score": 0.4, "confidence": 0.4, "indicators": {}}
    
    def _train_volatility_model(self, data: pd.DataFrame) -> Dict:
        """Volatility modeli eğit"""
        try:
            # ATR, Bollinger width
            atr = self._calculate_atr(data)
            bb = self._calculate_bollinger_bands(data['Close'])
            
            # Volatility score
            current_atr = atr.iloc[-1]
            avg_atr = atr.rolling(20).mean().iloc[-1]
            bb_width = bb["width"].iloc[-1] if "width" in bb else 0.1
            
            # NaN kontrolü
            if pd.isna(current_atr) or pd.isna(avg_atr) or pd.isna(bb_width):
                return {"type": "volatility", "score": 0.1, "confidence": 0.1, "indicators": {}}
            
            volatility_score = (current_atr - avg_atr) / avg_atr + (bb_width - 0.1) / 0.1
            
            # Skoru normalize et
            volatility_score = max(-1.0, min(1.0, volatility_score))
            
            return {
                "type": "volatility",
                "score": volatility_score,
                "confidence": abs(volatility_score),
                "indicators": {"atr": current_atr, "avg_atr": avg_atr, "bb_width": bb_width}
            }
            
        except Exception as e:
            return {"type": "volatility", "score": 0.1, "confidence": 0.1, "indicators": {}}
    
    def _train_sentiment_model(self, data: pd.DataFrame) -> Dict:
        """Sentiment modeli eğit"""
        try:
            # Volume, price action
            volume_ratio = data['Volume'].iloc[-1] / data['Volume'].rolling(20).mean().iloc[-1]
            price_change = (data['Close'].iloc[-1] - data['Close'].iloc[-2]) / data['Close'].iloc[-2]
            
            # NaN kontrolü
            if pd.isna(volume_ratio) or pd.isna(price_change):
                return {"type": "sentiment", "score": 0.1, "confidence": 0.1, "indicators": {}}
            
            # Sentiment score
            sentiment_score = (volume_ratio - 1) * np.sign(price_change)
            
            # Skoru normalize et
            sentiment_score = max(-1.0, min(1.0, sentiment_score))
            
            return {
                "type": "sentiment",
                "score": sentiment_score,
                "confidence": abs(sentiment_score),
                "indicators": {"volume_ratio": volume_ratio, "price_change": price_change}
            }
            
        except Exception as e:
            return {"type": "sentiment", "score": 0.1, "confidence": 0.1, "indicators": {}}
    
    def generate_enhanced_signals(self, symbol: str) -> List[EnhancedTradingSignal]:
        """Gelişmiş sinyaller üret"""
        try:
            if symbol not in self.active_strategies:
                return []
            
            strategy = self.active_strategies[symbol]
            enhanced_signals = []
            
            # Her timeframe için gelişmiş sinyal üret
            for timeframe, config in strategy["timeframes"].items():
                if not config["active"]:
                    continue
                
                # Gelişmiş sinyal üret
                enhanced_signal = self._generate_enhanced_timeframe_signal(symbol, timeframe, config)
                if enhanced_signal:
                    enhanced_signals.append(enhanced_signal)
                    
                    # Strateji güncelle
                    config["signals_generated"] += 1
                    config["last_update"] = datetime.now()
            
            # Sinyal filtreleme ve optimizasyon
            filtered_signals = self._filter_enhanced_signals(enhanced_signals)
            
            # Portfolio allocation güncelle
            self._update_enhanced_portfolio_allocation(symbol, filtered_signals)
            
            return filtered_signals
            
        except Exception as e:
            logger.error(f"❌ Gelişmiş sinyal hatası: {e}")
            return []
    
    def _generate_enhanced_timeframe_signal(self, symbol: str, timeframe: TimeFrame, config: Dict) -> Optional[EnhancedTradingSignal]:
        """Tek timeframe için gelişmiş sinyal üret"""
        try:
            logger.info(f"🔍 {symbol} {timeframe.value} için sinyal üretiliyor...")
            
            # Veri çek
            data = self._get_market_data_fixed(symbol, timeframe)
            if data.empty:
                logger.warning(f"⚠️ {timeframe.value}: Veri boş")
                return None
            
            logger.info(f"📊 {timeframe.value}: {len(data)} veri noktası")
            
            # Gelişmiş teknik analiz
            enhanced_indicators = self._calculate_enhanced_indicators(data, config["indicators"])
            logger.info(f"📈 {timeframe.value}: {len(enhanced_indicators)} indikatör hesaplandı")
            
            # AI ensemble skorları
            ai_scores = self._get_ai_ensemble_scores(symbol, timeframe, data)
            logger.info(f"🧠 {timeframe.value}: AI skorları: {ai_scores}")
            
            # Risk skoru
            risk_score = self.risk_manager.calculate_risk_score(data, enhanced_indicators)
            logger.info(f"⚠️ {timeframe.value}: Risk skoru: {risk_score:.3f}")
            
            # Portfolio skoru
            portfolio_score = self.portfolio_optimizer.calculate_portfolio_score(symbol, timeframe)
            logger.info(f"📊 {timeframe.value}: Portfolio skoru: {portfolio_score:.3f}")
            
            # Final sinyal skoru
            final_score = self._calculate_final_signal_score(enhanced_indicators, ai_scores, risk_score, portfolio_score)
            logger.info(f"🎯 {timeframe.value}: Final skor: {final_score:.3f}")
            
            # Sinyal kararı
            signal_action = self._determine_signal_action(final_score)
            logger.info(f"🚦 {timeframe.value}: Sinyal aksiyonu: {signal_action}")
            
            if signal_action == EnhancedSignalType.HOLD:
                logger.info(f"⏸️ {timeframe.value}: HOLD sinyali")
                return None
            
            # Sinyal oluştur
            signal = self._create_enhanced_signal(
                symbol, timeframe, signal_action, final_score,
                enhanced_indicators, ai_scores, risk_score, portfolio_score
            )
            
            if signal:
                logger.info(f"✅ {timeframe.value}: {signal_action.value} sinyali oluşturuldu")
            else:
                logger.warning(f"⚠️ {timeframe.value}: Sinyal oluşturulamadı")
            
            return signal
            
        except Exception as e:
            logger.error(f"❌ Gelişmiş timeframe sinyali hatası: {e}")
            return None
    
    def _calculate_enhanced_indicators(self, data: pd.DataFrame, indicators: List[str]) -> Dict:
        """Gelişmiş teknik indikatörleri hesapla"""
        try:
            result = {}
            
            # Close price ekle
            result["Close"] = data['Close']
            
            # Temel indikatörler
            if "RSI" in indicators:
                result["RSI"] = self._calculate_rsi(data['Close'])
            
            if "MACD" in indicators:
                macd_data = self._calculate_macd(data['Close'])
                result["MACD"] = macd_data["macd"]
                result["MACD_Signal"] = macd_data["signal"]
            
            if "Bollinger" in indicators:
                bb_data = self._calculate_bollinger_bands(data['Close'])
                result["BB_Upper"] = bb_data["upper"]
                result["BB_Lower"] = bb_data["lower"]
                result["BB_Middle"] = bb_data["middle"]
                # Width hesapla
                if "upper" in bb_data and "lower" in bb_data:
                    result["BB_Width"] = (bb_data["upper"] - bb_data["lower"]) / bb_data["middle"]
                else:
                    result["BB_Width"] = pd.Series([0.1] * len(data))
                # Position hesapla
                if "upper" in bb_data and "lower" in bb_data and "middle" in bb_data:
                    result["BB_Position"] = (data['Close'] - bb_data["lower"]) / (bb_data["upper"] - bb_data["lower"])
                else:
                    result["BB_Position"] = pd.Series([0.5] * len(data))
            
            if "ATR" in indicators:
                result["ATR"] = self._calculate_atr(data)
            
            if "Volume" in indicators:
                result["Volume_SMA"] = data['Volume'].rolling(20).mean()
                result["Volume_Ratio"] = data['Volume'] / result["Volume_SMA"]
            
            # Gelişmiş indikatörler
            if "Stochastic" in indicators:
                stoch_data = self._calculate_stochastic(data)
                result["Stoch_K"] = stoch_data["k"]
                result["Stoch_D"] = stoch_data["d"]
            
            if "ADX" in indicators:
                result["ADX"] = self._calculate_adx(data)
            
            if "CCI" in indicators:
                result["CCI"] = self._calculate_cci(data)
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Gelişmiş indikatör hatası: {e}")
            return {}
    
    def _get_ai_ensemble_scores(self, symbol: str, timeframe: TimeFrame, data: pd.DataFrame) -> Dict:
        """AI ensemble skorları al"""
        try:
            scores = {}
            
            for model_name, model in self.ai_models.items():
                if model and isinstance(model, dict) and "score" in model:
                    # AI model skorunu normalize et
                    ai_score = model["score"]
                    ai_confidence = model["confidence"]
                    
                    # Skoru 0-1 aralığına normalize et
                    normalized_score = (ai_score + 1) / 2  # -1 to 1 -> 0 to 1
                    normalized_confidence = min(1.0, max(0.0, ai_confidence))
                    
                    scores[model_name] = {
                        "score": normalized_score,
                        "confidence": normalized_confidence,
                        "indicators": model.get("indicators", {})
                    }
                else:
                    # Default skorlar
                    default_scores = {
                        "momentum": 0.5,
                        "mean_reversion": 0.5,
                        "trend_following": 0.5,
                        "volatility": 0.5,
                        "sentiment": 0.5
                    }
                    scores[model_name] = {
                        "score": default_scores.get(model_name, 0.5),
                        "confidence": 0.5,
                        "indicators": {}
                    }
            
            return scores
            
        except Exception as e:
            logger.error(f"❌ AI ensemble skor hatası: {e}")
            return {}
    
    def _calculate_final_signal_score(self, indicators: Dict, ai_scores: Dict, risk_score: float, portfolio_score: float) -> float:
        """Final sinyal skoru hesapla"""
        try:
            # Teknik analiz skoru (%30)
            technical_score = self._calculate_technical_score(indicators)
            
            # AI ensemble skoru (%40)
            ai_score = self._calculate_ai_ensemble_score(ai_scores)
            
            # Risk skoru (%20)
            risk_weighted_score = risk_score * 0.2
            
            # Portfolio skoru (%10)
            portfolio_weighted_score = portfolio_score * 0.1
            
            # Final skor
            final_score = (
                technical_score * 0.3 +
                ai_score * 0.4 +
                risk_weighted_score +
                portfolio_weighted_score
            )
            
            return final_score
            
        except Exception as e:
            logger.error(f"❌ Final skor hesaplama hatası: {e}")
            return 0.0
    
    def _calculate_technical_score(self, indicators: Dict) -> float:
        """Teknik analiz skoru hesapla"""
        try:
            score = 0.0
            count = 0
            
            # RSI
            if "RSI" in indicators:
                rsi = indicators["RSI"].iloc[-1] if hasattr(indicators["RSI"], 'iloc') else indicators["RSI"]
                if rsi < 30:
                    score += 0.8  # Oversold
                elif rsi > 70:
                    score -= 0.8  # Overbought
                count += 1
            
            # MACD
            if "MACD" in indicators and "MACD_Signal" in indicators:
                macd = indicators["MACD"].iloc[-1] if hasattr(indicators["MACD"], 'iloc') else indicators["MACD"]
                signal = indicators["MACD_Signal"].iloc[-1] if hasattr(indicators["MACD_Signal"], 'iloc') else indicators["MACD_Signal"]
                if macd > signal:
                    score += 0.6  # Bullish
                else:
                    score -= 0.6  # Bearish
                count += 1
            
            # Bollinger
            if "BB_Position" in indicators:
                bb_pos = indicators["BB_Position"].iloc[-1] if hasattr(indicators["BB_Position"], 'iloc') else indicators["BB_Position"]
                if bb_pos < 0.2:
                    score += 0.7  # Near lower band
                elif bb_pos > 0.8:
                    score -= 0.7  # Near upper band
                count += 1
            
            # Volume
            if "Volume_Ratio" in indicators:
                vol_ratio = indicators["Volume_Ratio"].iloc[-1] if hasattr(indicators["Volume_Ratio"], 'iloc') else indicators["Volume_Ratio"]
                if vol_ratio > 1.5:
                    score += 0.3  # High volume
                count += 1
            
            return score / count if count > 0 else 0.0
            
        except Exception as e:
            logger.error(f"❌ Teknik skor hesaplama hatası: {e}")
            return 0.0
    
    def _calculate_ai_ensemble_score(self, ai_scores: Dict) -> float:
        """AI ensemble skoru hesapla"""
        try:
            total_score = 0.0
            total_weight = 0.0
            
            # Momentum
            if "momentum" in ai_scores:
                momentum_score = ai_scores["momentum"]["score"]
                momentum_weight = self.enhanced_config["momentum_weight"]
                total_score += momentum_score * momentum_weight
                total_weight += momentum_weight
            
            # Mean reversion
            if "mean_reversion" in ai_scores:
                mean_rev_score = ai_scores["mean_reversion"]["score"]
                mean_rev_weight = self.enhanced_config["mean_reversion_weight"]
                total_score += mean_rev_score * mean_rev_weight
                total_weight += mean_rev_weight
            
            # Trend following
            if "trend_following" in ai_scores:
                trend_score = ai_scores["trend_following"]["score"]
                trend_weight = self.enhanced_config["trend_weight"]
                total_score += trend_score * trend_weight
                total_weight += trend_weight
            
            # Volatility
            if "volatility" in ai_scores:
                vol_score = ai_scores["volatility"]["score"]
                vol_weight = 0.1
                total_score += vol_score * vol_weight
                total_weight += vol_weight
            
            # Sentiment
            if "sentiment" in ai_scores:
                sent_score = ai_scores["sentiment"]["score"]
                sent_weight = 0.1
                total_score += sent_score * sent_weight
                total_weight += sent_weight
            
            return total_score / total_weight if total_weight > 0 else 0.0
            
        except Exception as e:
            logger.error(f"❌ AI ensemble skor hatası: {e}")
            return 0.0
    
    def _determine_signal_action(self, final_score: float) -> EnhancedSignalType:
        """Sinyal aksiyonu belirle"""
        try:
            if final_score > 0.6:
                return EnhancedSignalType.STRONG_BUY
            elif final_score > 0.4:
                return EnhancedSignalType.BUY
            elif final_score > 0.2:
                return EnhancedSignalType.WEAK_BUY
            elif final_score < -0.6:
                return EnhancedSignalType.STRONG_SELL
            elif final_score < -0.4:
                return EnhancedSignalType.SELL
            elif final_score < -0.2:
                return EnhancedSignalType.WEAK_SELL
            else:
                return EnhancedSignalType.HOLD
                
        except Exception as e:
            logger.error(f"❌ Sinyal aksiyon hatası: {e}")
            return EnhancedSignalType.HOLD
    
    def _create_enhanced_signal(self, symbol: str, timeframe: TimeFrame, action: EnhancedSignalType,
                               final_score: float, indicators: Dict, ai_scores: Dict,
                               risk_score: float, portfolio_score: float) -> EnhancedTradingSignal:
        """Gelişmiş sinyal oluştur"""
        try:
            current_price = indicators.get("Close", 100)
            
            # Series ise son değeri al
            if hasattr(current_price, 'iloc'):
                current_price = current_price.iloc[-1]
            
            # ATR hesapla
            atr = indicators.get("ATR", pd.Series([current_price * 0.01]))
            if hasattr(atr, 'iloc'):
                atr_value = atr.iloc[-1]
            else:
                atr_value = atr if isinstance(atr, (int, float)) else current_price * 0.01
            
            # Stop loss ve take profit
            if action in [EnhancedSignalType.STRONG_BUY, EnhancedSignalType.BUY, EnhancedSignalType.WEAK_BUY]:
                stop_loss = current_price - (atr_value * 2)
                take_profit = current_price + (atr_value * 3)
            else:
                stop_loss = current_price + (atr_value * 2)
                take_profit = current_price - (atr_value * 3)
            
            # Position sizing
            risk_amount = self.config["max_risk_per_trade"]
            position_size = risk_amount / abs(current_price - stop_loss) if abs(current_price - stop_loss) > 0 else 0
            
            # Risk/reward
            risk_reward = abs(take_profit - current_price) / abs(current_price - stop_loss) if abs(current_price - stop_loss) > 0 else 1.0
            
            # Risk/reward'ı minimum değerle sınırla
            risk_reward = max(1.0, risk_reward)
            
            logger.info(f"🔍 {timeframe.value}: current_price={current_price:.3f}, stop_loss={stop_loss:.3f}, take_profit={take_profit:.3f}, risk_reward={risk_reward:.3f}")
            
            # AI ensemble skoru
            ai_ensemble_score = self._calculate_ai_ensemble_score(ai_scores)
            
            # Sinyal oluştur
            signal = EnhancedTradingSignal(
                symbol=symbol,
                action=action,
                timeframe=timeframe,
                strategy=StrategyType.DAY_TRADING,  # Default
                confidence=min(1.0, max(0.0, abs(final_score))),  # 0-1 aralığına normalize et
                entry_price=float(current_price),
                stop_loss=float(stop_loss),
                take_profit=float(take_profit),
                position_size=float(position_size),
                risk_reward=float(risk_reward),
                timestamp=datetime.now(),
                reasons=[f"Final Score: {final_score:.3f}"],
                technical_indicators=indicators,
                fundamental_score=0.5,  # Placeholder
                sentiment_score=0.5,    # Placeholder
                ai_ensemble_score=ai_ensemble_score,
                risk_score=risk_score,
                portfolio_score=portfolio_score,
                final_score=final_score
            )
            
            return signal
            
        except Exception as e:
            logger.error(f"❌ Gelişmiş sinyal oluşturma hatası: {e}")
            return None
    
    def _filter_enhanced_signals(self, signals: List[EnhancedTradingSignal]) -> List[EnhancedTradingSignal]:
        """Gelişmiş sinyalleri filtrele"""
        try:
            logger.info(f"🔍 {len(signals)} sinyal filtreleniyor...")
            
            if not signals:
                return []
            
            # Confidence filter
            filtered_signals = [s for s in signals if s.confidence > self.enhanced_config["min_confidence"]]
            logger.info(f"✅ Confidence filter: {len(signals)} -> {len(filtered_signals)}")
            for i, s in enumerate(signals):
                logger.info(f"🔍 Sinyal {i+1}: confidence={s.confidence:.3f}, min_confidence={self.enhanced_config['min_confidence']:.3f}")
            
            # AI score filter
            filtered_signals = [s for s in filtered_signals if s.ai_ensemble_score > self.enhanced_config["min_ai_score"]]
            logger.info(f"✅ AI score filter: {len(filtered_signals)} -> {len(filtered_signals)}")
            
            # Risk score filter
            filtered_signals = [s for s in filtered_signals if s.risk_score > self.enhanced_config["min_risk_score"]]
            logger.info(f"✅ Risk score filter: {len(filtered_signals)} -> {len(filtered_signals)}")
            
            # Portfolio score filter
            filtered_signals = [s for s in filtered_signals if s.portfolio_score > self.enhanced_config["min_portfolio_score"]]
            logger.info(f"✅ Portfolio score filter: {len(filtered_signals)} -> {len(filtered_signals)}")
            
            # Risk/reward filter
            filtered_signals = [s for s in filtered_signals if s.risk_reward > self.config["min_risk_reward"]]
            logger.info(f"✅ Risk/reward filter: {len(filtered_signals)} -> {len(filtered_signals)}")
            for i, s in enumerate(filtered_signals):
                logger.info(f"🔍 Sinyal {i+1}: risk_reward={s.risk_reward:.3f}, min_risk_reward={self.config['min_risk_reward']:.3f}")
            
            # Correlation filter
            if self.config["correlation_filter"]:
                filtered_signals = self._apply_enhanced_correlation_filter(filtered_signals)
                logger.info(f"✅ Correlation filter: {len(filtered_signals)} -> {len(filtered_signals)}")
            
            # Portfolio optimization
            optimized_signals = self.portfolio_optimizer.optimize_signals(filtered_signals)
            logger.info(f"✅ Portfolio optimization: {len(filtered_signals)} -> {len(optimized_signals)}")
            
            return optimized_signals
            
        except Exception as e:
            logger.error(f"❌ Gelişmiş sinyal filtreleme hatası: {e}")
            return signals
    
    def _apply_enhanced_correlation_filter(self, signals: List[EnhancedTradingSignal]) -> List[EnhancedTradingSignal]:
        """Gelişmiş korelasyon filtresi"""
        try:
            # Basit korelasyon filtresi (gerçek uygulamada portföy korelasyon matrisi kullanılacak)
            return signals
        except Exception as e:
            logger.error(f"❌ Gelişmiş korelasyon filtresi hatası: {e}")
            return signals
    
    def _update_enhanced_portfolio_allocation(self, symbol: str, signals: List[EnhancedTradingSignal]) -> None:
        """Gelişmiş portföy allocation güncelle"""
        try:
            if symbol not in self.active_strategies:
                return
            
            strategy = self.active_strategies[symbol]
            
            # Her timeframe için allocation güncelle
            for timeframe in strategy["timeframes"]:
                timeframe_signals = [s for s in signals if s.timeframe == timeframe]
                
                if timeframe_signals:
                    # Başarı oranına göre allocation ayarla
                    success_rate = self._calculate_enhanced_success_rate(timeframe_signals)
                    
                    # Allocation adjustment
                    base_allocation = strategy["portfolio_allocation"][timeframe]["allocation"]
                    adjusted_allocation = base_allocation * (1 + (success_rate - 0.5))
                    
                    strategy["portfolio_allocation"][timeframe]["allocation"] = max(0.1, min(0.5, adjusted_allocation))
            
        except Exception as e:
            logger.error(f"❌ Gelişmiş portfolio allocation güncelleme hatası: {e}")
    
    def _calculate_stochastic(self, data: pd.DataFrame, k_period: int = 14, d_period: int = 3) -> Dict:
        """Stochastic oscillator hesapla"""
        try:
            # %K hesapla
            lowest_low = data['Low'].rolling(k_period).min()
            highest_high = data['High'].rolling(k_period).max()
            k = 100 * ((data['Close'] - lowest_low) / (highest_high - lowest_low))
            
            # %D hesapla (K'nın SMA'sı)
            d = k.rolling(d_period).mean()
            
            return {"k": k, "d": d}
        except Exception as e:
            logger.error(f"❌ Stochastic hesaplama hatası: {e}")
            return {"k": pd.Series([50] * len(data)), "d": pd.Series([50] * len(data))}
    
    def _calculate_adx(self, data: pd.DataFrame, period: int = 14) -> pd.Series:
        """ADX (Average Directional Index) hesapla"""
        try:
            # True Range
            tr1 = data['High'] - data['Low']
            tr2 = abs(data['High'] - data['Close'].shift(1))
            tr3 = abs(data['Low'] - data['Close'].shift(1))
            tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
            
            # Directional Movement
            dm_plus = np.where((data['High'] - data['High'].shift(1)) > (data['Low'].shift(1) - data['Low']), 
                              np.maximum(data['High'] - data['High'].shift(1), 0), 0)
            dm_minus = np.where((data['Low'].shift(1) - data['Low']) > (data['High'] - data['High'].shift(1)), 
                               np.maximum(data['Low'].shift(1) - data['Low'], 0), 0)
            
            # Smoothed values
            tr_smooth = tr.rolling(period).mean()
            dm_plus_smooth = pd.Series(dm_plus).rolling(period).mean()
            dm_minus_smooth = pd.Series(dm_minus).rolling(period).mean()
            
            # DI+ ve DI-
            di_plus = 100 * (dm_plus_smooth / tr_smooth)
            di_minus = 100 * (dm_minus_smooth / tr_smooth)
            
            # DX ve ADX
            dx = 100 * abs(di_plus - di_minus) / (di_plus + di_minus)
            adx = dx.rolling(period).mean()
            
            return adx
        except Exception as e:
            logger.error(f"❌ ADX hesaplama hatası: {e}")
            return pd.Series([25] * len(data))
    
    def _calculate_cci(self, data: pd.DataFrame, period: int = 20) -> pd.Series:
        """CCI (Commodity Channel Index) hesapla"""
        try:
            # Typical Price
            tp = (data['High'] + data['Low'] + data['Close']) / 3
            
            # SMA of TP
            sma_tp = tp.rolling(period).mean()
            
            # Mean Deviation
            md = tp.rolling(period).apply(lambda x: np.mean(np.abs(x - x.mean())))
            
            # CCI
            cci = (tp - sma_tp) / (0.015 * md)
            
            return cci
        except Exception as e:
            logger.error(f"❌ CCI hesaplama hatası: {e}")
            return pd.Series([0] * len(data))
    
    def _calculate_enhanced_success_rate(self, signals: List[EnhancedTradingSignal]) -> float:
        """Gelişmiş başarı oranı hesapla"""
        try:
            if not signals:
                return 0.5
            
            # Sinyal kalitesine göre başarı oranı
            total_score = sum(s.final_score for s in signals)
            avg_score = total_score / len(signals)
            
            # Score'u başarı oranına çevir
            success_rate = 0.5 + (avg_score * 0.5)  # 0-1 aralığına normalize et
            
            return max(0.0, min(1.0, success_rate))
            
        except Exception as e:
            logger.error(f"❌ Gelişmiş başarı oranı hesaplama hatası: {e}")
            return 0.5

# Yardımcı sınıflar
class EnhancedRiskManager:
    """Gelişmiş risk yöneticisi"""
    
    def __init__(self):
        self.config = {
            "max_position_size": 0.05,
            "max_portfolio_risk": 0.15,
            "volatility_threshold": 0.25,
            "correlation_threshold": 0.7
        }
    
    def calculate_risk_score(self, data: pd.DataFrame, indicators: Dict) -> float:
        """Risk skoru hesapla"""
        try:
            # Volatilite riski
            volatility_risk = self._calculate_volatility_risk(data)
            
            # Liquidity riski
            liquidity_risk = self._calculate_liquidity_risk(data)
            
            # Market riski
            market_risk = self._calculate_market_risk(data, indicators)
            
            # Toplam risk skoru
            total_risk = (volatility_risk + liquidity_risk + market_risk) / 3
            
            # Risk skorunu 0-1 aralığına normalize et (1 = düşük risk)
            risk_score = 1 - total_risk
            
            return max(0.0, min(1.0, risk_score))
            
        except Exception as e:
            logger.error(f"❌ Risk skor hesaplama hatası: {e}")
            return 0.5
    
    def _calculate_volatility_risk(self, data: pd.DataFrame) -> float:
        """Volatilite riski hesapla"""
        try:
            returns = data['Close'].pct_change().dropna()
            volatility = returns.std()
            return min(1.0, volatility / 0.02)  # %2 volatilite = 1.0 risk
        except:
            return 0.5
    
    def _calculate_liquidity_risk(self, data: pd.DataFrame) -> float:
        """Liquidity riski hesapla"""
        try:
            avg_volume = data['Volume'].rolling(20).mean().iloc[-1]
            current_volume = data['Volume'].iloc[-1]
            volume_ratio = current_volume / avg_volume if avg_volume > 0 else 1
            
            # Düşük volume = yüksek risk
            liquidity_risk = 1 - min(1.0, volume_ratio / 2)
            return liquidity_risk
        except:
            return 0.5
    
    def _calculate_market_risk(self, data: pd.DataFrame, indicators: Dict) -> float:
        """Market riski hesapla"""
        try:
            # Trend strength
            if "ADX" in indicators:
                adx = indicators["ADX"].iloc[-1] if hasattr(indicators["ADX"], 'iloc') else indicators["ADX"]
                trend_risk = 1 - min(1.0, adx / 100)
            else:
                trend_risk = 0.5
            
            # Support/resistance proximity
            if "BB_Position" in indicators:
                bb_pos = indicators["BB_Position"].iloc[-1] if hasattr(indicators["BB_Position"], 'iloc') else indicators["BB_Position"]
                proximity_risk = abs(bb_pos - 0.5) * 2  # 0.5'ten uzak = yüksek risk
            else:
                proximity_risk = 0.5
            
            market_risk = (trend_risk + proximity_risk) / 2
            return market_risk
        except:
            return 0.5
    
    def get_config(self) -> Dict:
        """Risk yöneticisi konfigürasyonu"""
        return self.config

class PortfolioOptimizer:
    """Portföy optimizasyonu"""
    
    def __init__(self):
        self.config = {
            "max_positions": 10,
            "max_risk_per_trade": 0.02,
            "max_portfolio_risk": 0.10,
            "min_risk_reward": 1.2,  # 2.0 -> 1.2 (daha gerçekçi)
            "max_drawdown": 0.15,
            "auto_rebalance": True,
            "stop_loss_trailing": True,
            "partial_profit": True,
            "hedging": True,
            "correlation_filter": True,
        }
    
    def calculate_portfolio_score(self, symbol: str, timeframe: TimeFrame) -> float:
        """Portföy skoru hesapla"""
        try:
            # Basit portföy skoru (gerçek uygulamada Markowitz optimization kullanılacak)
            base_score = 0.7
            
            # Timeframe bazlı ayarlama
            if timeframe in [TimeFrame.M1, TimeFrame.M5, TimeFrame.M15]:
                timeframe_score = 0.8  # Scalping
            elif timeframe in [TimeFrame.H1, TimeFrame.H4]:
                timeframe_score = 0.9  # Swing
            else:
                timeframe_score = 1.0  # Position
            
            # Final skor
            portfolio_score = base_score * timeframe_score
            
            return max(0.0, min(1.0, portfolio_score))
            
        except Exception as e:
            logger.error(f"❌ Portfolio skor hesaplama hatası: {e}")
            return 0.5
    
    def optimize_signals(self, signals: List[EnhancedTradingSignal]) -> List[EnhancedTradingSignal]:
        """Sinyalleri optimize et"""
        try:
            if not signals:
                return []
            
            # Final skora göre sırala
            sorted_signals = sorted(signals, key=lambda x: x.final_score, reverse=True)
            
            # En iyi sinyalleri seç
            max_signals = self.config["max_positions"]
            optimized_signals = sorted_signals[:max_signals]
            
            return optimized_signals
            
        except Exception as e:
            logger.error(f"❌ Sinyal optimizasyon hatası: {e}")
            return signals
    
    def get_config(self) -> Dict:
        """Portföy optimizasyonu konfigürasyonu"""
        return self.config

class EnhancedPerformanceTracker:
    """Gelişmiş performans takibi"""
    
    def __init__(self):
        self.performance_history = {}
        self.target_metrics = {
            "win_rate": 0.80,
            "sharpe_ratio": 1.5,
            "max_drawdown": 0.10,
            "total_return": 0.25
        }
    
    def track_performance(self, symbol: str, signals: List[EnhancedTradingSignal]) -> Dict:
        """Performans takip et"""
        try:
            if not signals:
                return {}
            
            # Sinyal kalitesi
            avg_confidence = np.mean([s.confidence for s in signals])
            avg_ai_score = np.mean([s.ai_ensemble_score for s in signals])
            avg_risk_score = np.mean([s.risk_score for s in signals])
            avg_portfolio_score = np.mean([s.portfolio_score for s in signals])
            
            # Performans metrikleri
            performance = {
                "total_signals": len(signals),
                "avg_confidence": avg_confidence,
                "avg_ai_score": avg_ai_score,
                "avg_risk_score": avg_risk_score,
                "avg_portfolio_score": avg_portfolio_score,
                "signal_quality": (avg_confidence + avg_ai_score + avg_risk_score + avg_portfolio_score) / 4,
                "timestamp": datetime.now().isoformat()
            }
            
            # Geçmişe kaydet
            if symbol not in self.performance_history:
                self.performance_history[symbol] = []
            
            self.performance_history[symbol].append(performance)
            
            return performance
            
        except Exception as e:
            logger.error(f"❌ Performans takip hatası: {e}")
            return {}
    
    def get_performance_summary(self, symbol: str) -> Dict:
        """Performans özeti"""
        try:
            if symbol not in self.performance_history:
                return {}
            
            history = self.performance_history[symbol]
            if not history:
                return {}
            
            # Son 10 performans
            recent_performance = history[-10:]
            
            summary = {
                "total_tracked": len(history),
                "recent_avg_confidence": np.mean([p["avg_confidence"] for p in recent_performance]),
                "recent_avg_ai_score": np.mean([p["avg_ai_score"] for p in recent_performance]),
                "recent_avg_risk_score": np.mean([p["avg_risk_score"] for p in recent_performance]),
                "recent_avg_portfolio_score": np.mean([p["avg_portfolio_score"] for p in recent_performance]),
                "recent_signal_quality": np.mean([p["signal_quality"] for p in recent_performance]),
                "target_metrics": self.target_metrics
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"❌ Performans özeti hatası: {e}")
            return {}

# Test fonksiyonu
if __name__ == "__main__":
    enhanced_robot = UltraRobotEnhancedFixed()
    
    # Test
    logger.info("🚀 Enhanced Ultra Trading Robot (Fixed) hazır!")
    logger.info(f"🎯 Hedef: %{enhanced_robot.enhanced_config['target_win_rate']*100} kazanma oranı")
    logger.info(f"🧠 AI Modelleri: {list(enhanced_robot.ai_models.keys())}")
    logger.info(f"📊 Gelişmiş İndikatörler: {len(enhanced_robot.enhanced_indicators)}")
    
    # Test stratejisi
    test_symbol = "GARAN.IS"
    test_timeframes = [TimeFrame.M5, TimeFrame.M15, TimeFrame.H1]
    
    # Gelişmiş strateji oluştur
    enhanced_strategy = enhanced_robot.create_enhanced_strategy(test_symbol, test_timeframes)
    logger.info(f"📈 {test_symbol} gelişmiş stratejisi oluşturuldu")
    
    # Gelişmiş sinyaller üret
    enhanced_signals = enhanced_robot.generate_enhanced_signals(test_symbol)
    logger.info(f"🎯 {len(enhanced_signals)} gelişmiş sinyal üretildi")
    
    # Performans takip et
    if enhanced_signals:
        performance = enhanced_robot.performance_tracker.track_performance(test_symbol, enhanced_signals)
        logger.info(f"📊 Performans: {performance}")
        
        summary = enhanced_robot.performance_tracker.get_performance_summary(test_symbol)
        logger.info(f"📈 Performans özeti: {summary}")
    
    # Robot durumu
    status = enhanced_robot.get_robot_status()
    logger.info(f"🤖 Enhanced Robot durumu: {status}")
