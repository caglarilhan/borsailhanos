"""
PRD v2.0 - RL Portföy Ajanı
FinRL + DDPG ile pozisyon boyutlama ve portföy optimizasyonu
Reinforcement Learning tabanlı otomatik portföy yönetimi
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
import json
import random

# FinRL import (fallback if not available)
try:
    from finrl import config
    from finrl.model.models import DRLAgent
    from finrl.env.env_stocktrading import StockTradingEnv
    FINRL_AVAILABLE = True
except ImportError:
    FINRL_AVAILABLE = False
    logging.warning("⚠️ FinRL bulunamadı, simüle edilmiş RL ajanı kullanılacak")

try:
    # Sentiment-fused transformer output
    from services.transformer_multi_timeframe import FusionResult, TimeframeSignal
except Exception:
    FusionResult = Any  # type: ignore
    TimeframeSignal = Any  # type: ignore

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class PortfolioState:
    equity: float = 100000.0
    cash: float = 60000.0
    invested: float = 40000.0
    risk_budget_pct: float = 0.02
    open_positions: Dict[str, float] = field(default_factory=dict)


@dataclass
class PositionRecommendation:
    symbol: str
    action: str
    position_pct: float
    position_value: float
    confidence: float
    max_leverage: float
    stop_loss_pct: float
    take_profit_pct: float
    hedge_symbol: Optional[str]
    rationale: List[str]
    meta: Dict[str, Any] = field(default_factory=dict)

class RLPortfolioAgent:
    """Reinforcement Learning tabanlı portföy ajanı"""
    
    def __init__(self):
        self.agent_models = {}
        self.portfolio_history = []
        self.trading_history = []
        self.performance_metrics = {}
        
        # RL parametreleri
        self.rl_params = {
            "state_dim": 30,  # Durum boyutu
            "action_dim": 10,  # Aksiyon boyutu (hisse sayısı)
            "learning_rate": 0.001,
            "batch_size": 64,
            "memory_size": 10000,
            "gamma": 0.99,  # Discount factor
            "tau": 0.005,   # Soft update parameter
            "epsilon": 1.0, # Exploration rate
            "epsilon_decay": 0.995,
            "epsilon_min": 0.01
        }
        
        # Portföy parametreleri
        self.portfolio_params = {
            "initial_capital": 100000,  # Başlangıç sermayesi
            "max_position_size": 0.2,   # Maksimum pozisyon boyutu (%20)
            "transaction_cost": 0.001,   # İşlem maliyeti (%0.1)
            "risk_free_rate": 0.05,     # Risksiz faiz oranı (%5)
            "max_drawdown": 0.15,       # Maksimum düşüş (%15)
            "target_return": 0.15       # Hedef getiri (%15)
        }
        
        # BIST 100 hisseleri
        self.bist_symbols = [
            "GARAN.IS", "AKBNK.IS", "ISCTR.IS", "THYAO.IS", "TUPRS.IS",
            "ASELS.IS", "KRDMD.IS", "SAHOL.IS", "BIMAS.IS", "EREGL.IS"
        ]
        
        # Risk yönetimi parametreleri
        self.risk_params = {
            "var_confidence": 0.05,     # VaR güven seviyesi (%5)
            "max_correlation": 0.7,     # Maksimum korelasyon
            "volatility_threshold": 0.3, # Volatilite eşiği
            "liquidity_threshold": 1000000  # Likidite eşiği
        }
        self.hedge_pairs = {
            "THYAO.IS": "TAVHL.IS",
            "EREGL.IS": "KRDMD.IS",
            "GARAN.IS": "XBANK.IS",
            "TUPRS.IS": "BIST:Enerji",
        }

    # ------------------------------------------------------------------ #
    # Fusion -> Position sizing heuristics
    # ------------------------------------------------------------------ #
    def _estimate_portfolio_state(self, overrides: Optional[Dict[str, float]] = None) -> PortfolioState:
        base = PortfolioState()
        if overrides:
            for key, value in overrides.items():
                setattr(base, key, value)
        return base

    def _pick_hedge(self, symbol: str) -> Optional[str]:
        return self.hedge_pairs.get(symbol)

    def _aggregate_volatility(self, signals: List[TimeframeSignal]) -> float:
        if not signals:
            return 1.0
        vols = [max(1e-3, abs(sig.volatility)) for sig in signals]
        return float(np.mean(vols))

    def recommend_from_fusion(
        self,
        fusion: FusionResult,
        portfolio_overrides: Optional[Dict[str, float]] = None
    ) -> PositionRecommendation:
        """
        Transformer + sentiment çıktısından pozisyon planı üretir.
        FinRL yoksa heuristik RL davranışı taklit eder.
        """
        portfolio = self._estimate_portfolio_state(portfolio_overrides)

        volatility = self._aggregate_volatility(fusion.timeframe_signals)
        sentiment_bias = fusion.sentiment.score
        action = fusion.action
        confidence = fusion.confidence

        base_pct = 0.015 if action == "HOLD" else 0.035
        momentum_bias = sum(sig.momentum for sig in fusion.timeframe_signals) / max(1, len(fusion.timeframe_signals))
        risk_adjust = max(0.5, min(1.5, 1 - volatility * 0.3))
        sentiment_adjust = 1 + sentiment_bias * (0.4 if action == "BUY" else -0.2)
        confidence_adjust = 0.5 + confidence

        raw_position_pct = base_pct * (1 + abs(momentum_bias)) * risk_adjust * sentiment_adjust * confidence_adjust
        max_allowed = self.portfolio_params["max_position_size"]
        position_pct = float(max(0.005, min(max_allowed, raw_position_pct)))

        position_value = portfolio.equity * position_pct
        stop_loss_pct = float(-(0.8 * volatility + (1 - confidence) * 0.05))
        take_profit_pct = float(abs(stop_loss_pct) * 1.8 + sentiment_bias * 0.2)
        leverage = float(min(2.0, 1 + confidence * 0.5))

        rationale = [
            f"Aksiyon: {action}",
            f"Momentum ortalaması: {momentum_bias:.4f}",
            f"Sentiment bias: {sentiment_bias:+.3f}",
            f"Volatilite: {volatility:.3f}",
            f"Pozisyon %: {position_pct*100:.2f} (limit {max_allowed*100:.1f}%)",
        ]

        hedge = self._pick_hedge(fusion.symbol)
        if hedge:
            rationale.append(f"Hedge önerisi: {hedge}")

        meta = {
            "attention_weights": fusion.attention_weights,
            "timeframe_highlights": [
                {"timeframe": sig.timeframe, "momentum": sig.momentum, "volatility": sig.volatility}
                for sig in fusion.timeframe_signals[:3]
            ],
            "sentiment": {
                "score": fusion.sentiment.score,
                "label": fusion.sentiment.label,
                "confidence": fusion.sentiment.confidence,
                "key_events": fusion.sentiment.key_events,
            }
        }

        return PositionRecommendation(
            symbol=fusion.symbol,
            action=action,
            position_pct=position_pct,
            position_value=position_value,
            confidence=confidence,
            max_leverage=leverage,
            stop_loss_pct=stop_loss_pct,
            take_profit_pct=take_profit_pct,
            hedge_symbol=hedge,
            rationale=fusion.rationale + rationale,
            meta=meta
        )


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    agent = RLPortfolioAgent()
    try:
        from services.transformer_multi_timeframe import TransformerMultiTimeframe

        mtf = TransformerMultiTimeframe()
        fusion = mtf.predict_with_sentiment("THYAO.IS")
        recommendation = agent.recommend_from_fusion(fusion)
        logger.info("RL Position Recommendation:\n%s", json.dumps(recommendation.__dict__, indent=2, default=str))
    except Exception as exc:
        logger.error("RL position sizing demo failed: %s", exc)
    
    def get_market_data(self, symbols: List[str], period: str = "1y") -> pd.DataFrame:
        """Piyasa verilerini çek"""
        try:
            logger.info(f"📊 {len(symbols)} hisse için piyasa verileri çekiliyor...")
            
            all_data = {}
            for symbol in symbols:
                try:
                    stock = yf.Ticker(symbol)
                    hist = stock.history(period=period)
                    
                    if not hist.empty:
                        # Teknik indikatörleri hesapla
                        hist = self._calculate_features(hist)
                        all_data[symbol] = hist
                        logger.info(f"✅ {symbol} verisi alındı")
                    else:
                        logger.warning(f"⚠️ {symbol} için veri bulunamadı")
                        
                except Exception as e:
                    logger.error(f"❌ {symbol} veri hatası: {e}")
                    continue
            
            if not all_data:
                return pd.DataFrame()
            
            # Verileri birleştir
            combined_data = self._combine_market_data(all_data)
            
            logger.info(f"✅ Piyasa verileri hazırlandı ({len(combined_data)} gün)")
            return combined_data
            
        except Exception as e:
            logger.error(f"❌ Piyasa veri hatası: {e}")
            return pd.DataFrame()
    
    def _calculate_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Teknik özellikleri hesapla"""
        try:
            # Temel fiyat özellikleri
            df['returns'] = df['Close'].pct_change()
            df['log_returns'] = np.log(df['Close'] / df['Close'].shift(1))
            df['volatility'] = df['returns'].rolling(window=20).std()
            df['volume_ratio'] = df['Volume'] / df['Volume'].rolling(window=20).mean()
            
            # Teknik indikatörler
            df['sma_20'] = df['Close'].rolling(window=20).mean()
            df['sma_50'] = df['Close'].rolling(window=50).mean()
            df['ema_20'] = df['Close'].ewm(span=20).mean()
            df['ema_50'] = df['Close'].ewm(span=50).mean()
            
            # RSI
            delta = df['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            df['rsi'] = 100 - (100 / (1 + rs))
            
            # MACD
            exp1 = df['Close'].ewm(span=12).mean()
            exp2 = df['Close'].ewm(span=26).mean()
            df['macd'] = exp1 - exp2
            df['macd_signal'] = df['macd'].ewm(span=9).mean()
            df['macd_histogram'] = df['macd'] - df['macd_signal']
            
            # Bollinger Bands
            df['bb_middle'] = df['Close'].rolling(window=20).mean()
            bb_std = df['Close'].rolling(window=20).std()
            df['bb_upper'] = df['bb_middle'] + (bb_std * 2)
            df['bb_lower'] = df['bb_middle'] - (bb_std * 2)
            df['bb_position'] = (df['Close'] - df['bb_lower']) / (df['bb_upper'] - df['bb_lower'])
            
            # ATR
            high_low = df['High'] - df['Low']
            high_close = np.abs(df['High'] - df['Close'].shift())
            low_close = np.abs(df['Low'] - df['Close'].shift())
            ranges = pd.concat([high_low, high_close, low_close], axis=1)
            true_range = np.max(ranges, axis=1)
            df['atr'] = true_range.rolling(14).mean()
            
            # Momentum indikatörleri
            df['momentum_5'] = df['Close'] / df['Close'].shift(5) - 1
            df['momentum_10'] = df['Close'] / df['Close'].shift(10) - 1
            df['momentum_20'] = df['Close'] / df['Close'].shift(20) - 1
            
            # Trend indikatörleri
            df['trend_5'] = (df['Close'] - df['Close'].shift(5)) / df['Close'].shift(5)
            df['trend_10'] = (df['Close'] - df['Close'].shift(10)) / df['Close'].shift(10)
            df['trend_20'] = (df['Close'] - df['Close'].shift(20)) / df['Close'].shift(20)
            
            # Volatilite indikatörleri
            df['volatility_5'] = df['returns'].rolling(window=5).std()
            df['volatility_10'] = df['returns'].rolling(window=10).std()
            df['volatility_20'] = df['returns'].rolling(window=20).std()
            
            # Hacim indikatörleri
            df['volume_sma'] = df['Volume'].rolling(window=20).mean()
            df['volume_ratio'] = df['Volume'] / df['volume_sma']
            df['price_volume'] = df['Close'] * df['Volume']
            
            # NaN değerleri temizle
            df = df.dropna()
            
            return df
            
        except Exception as e:
            logger.error(f"❌ Özellik hesaplama hatası: {e}")
            return df
    
    def _combine_market_data(self, all_data: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """Piyasa verilerini birleştir"""
        try:
            # Ortak tarih aralığı bul
            common_dates = None
            for symbol, data in all_data.items():
                if common_dates is None:
                    common_dates = set(data.index)
                else:
                    common_dates = common_dates.intersection(set(data.index))
            
            if not common_dates:
                return pd.DataFrame()
            
            # Ortak tarihleri sırala
            common_dates = sorted(list(common_dates))
            
            # Birleştirilmiş veri çerçevesi oluştur
            combined_data = pd.DataFrame(index=common_dates)
            
            for symbol, data in all_data.items():
                symbol_data = data.loc[common_dates]
                
                # Her hisse için özellikleri ekle
                for column in symbol_data.columns:
                    combined_data[f"{symbol}_{column}"] = symbol_data[column]
            
            return combined_data
            
        except Exception as e:
            logger.error(f"❌ Veri birleştirme hatası: {e}")
            return pd.DataFrame()
    
    def create_trading_environment(self, data: pd.DataFrame, symbols: List[str]) -> Any:
        """Trading ortamı oluştur"""
        try:
            if FINRL_AVAILABLE:
                # FinRL ile gerçek ortam
                env = StockTradingEnv(
                    df=data,
                    stock_dim=len(symbols),
                    hmax=1000,
                    initial_amount=self.portfolio_params["initial_capital"],
                    buy_cost_pct=self.portfolio_params["transaction_cost"],
                    sell_cost_pct=self.portfolio_params["transaction_cost"],
                    reward_scaling=1e-4,
                    state_space=self.rl_params["state_dim"],
                    action_space=len(symbols),
                    tech_indicator_list=self._get_technical_indicators(),
                    turbulence_threshold=70,
                    make_plots=False
                )
                return env
            else:
                # Simüle edilmiş ortam
                return self._create_simulated_environment(data, symbols)
                
        except Exception as e:
            logger.error(f"❌ Trading ortamı oluşturma hatası: {e}")
            return None
    
    def _create_simulated_environment(self, data: pd.DataFrame, symbols: List[str]) -> Any:
        """Simüle edilmiş trading ortamı"""
        try:
            class SimulatedTradingEnv:
                def __init__(self, data, symbols, params):
                    self.data = data
                    self.symbols = symbols
                    self.params = params
                    self.current_step = 0
                    self.initial_capital = params["initial_capital"]
                    self.current_capital = params["initial_capital"]
                    self.positions = {symbol: 0 for symbol in symbols}
                    self.portfolio_value = params["initial_capital"]
                    self.trades = []
                    
                def reset(self):
                    self.current_step = 0
                    self.current_capital = self.initial_capital
                    self.positions = {symbol: 0 for symbol in self.symbols}
                    self.portfolio_value = self.initial_capital
                    self.trades = []
                    return self._get_state()
                
                def step(self, action):
                    # Aksiyonu uygula
                    reward = self._execute_action(action)
                    
                    # Sonraki duruma geç
                    self.current_step += 1
                    
                    # Durum bilgisi
                    next_state = self._get_state()
                    done = self.current_step >= len(self.data) - 1
                    info = self._get_info()
                    
                    return next_state, reward, done, info
                
                def _execute_action(self, action):
                    """Aksiyonu uygula ve ödül hesapla"""
                    try:
                        if self.current_step >= len(self.data) - 1:
                            return 0
                        
                        current_prices = self._get_current_prices()
                        portfolio_value_before = self._calculate_portfolio_value(current_prices)
                        
                        # Pozisyon değişiklikleri
                        for i, symbol in enumerate(self.symbols):
                            if i < len(action):
                                action_value = action[i]
                                
                                # Pozisyon boyutunu güncelle
                                if action_value > 0:  # Al
                                    shares_to_buy = int(action_value * self.current_capital / current_prices[symbol])
                                    cost = shares_to_buy * current_prices[symbol] * (1 + self.params["transaction_cost"])
                                    
                                    if cost <= self.current_capital:
                                        self.positions[symbol] += shares_to_buy
                                        self.current_capital -= cost
                                        
                                elif action_value < 0:  # Sat
                                    shares_to_sell = min(abs(action_value), self.positions[symbol])
                                    if shares_to_sell > 0:
                                        revenue = shares_to_sell * current_prices[symbol] * (1 - self.params["transaction_cost"])
                                        self.positions[symbol] -= shares_to_sell
                                        self.current_capital += revenue
                        
                        # Portföy değerini güncelle
                        portfolio_value_after = self._calculate_portfolio_value(current_prices)
                        
                        # Ödül hesapla
                        reward = self._calculate_reward(portfolio_value_before, portfolio_value_after)
                        
                        return reward
                        
                    except Exception as e:
                        logger.error(f"❌ Aksiyon uygulama hatası: {e}")
                        return 0
                
                def _get_current_prices(self):
                    """Mevcut fiyatları getir"""
                    try:
                        current_row = self.data.iloc[self.current_step]
                        prices = {}
                        for symbol in self.symbols:
                            price_col = f"{symbol}_Close"
                            if price_col in current_row:
                                prices[symbol] = current_row[price_col]
                            else:
                                prices[symbol] = 100  # Varsayılan fiyat
                        return prices
                    except Exception as e:
                        logger.error(f"❌ Fiyat alma hatası: {e}")
                        return {symbol: 100 for symbol in self.symbols}
                
                def _calculate_portfolio_value(self, prices):
                    """Portföy değerini hesapla"""
                    try:
                        stock_value = sum(self.positions[symbol] * prices[symbol] for symbol in self.symbols)
                        return self.current_capital + stock_value
                    except Exception as e:
                        logger.error(f"❌ Portföy değeri hesaplama hatası: {e}")
                        return self.current_capital
                
                def _calculate_reward(self, value_before, value_after):
                    """Ödül hesapla"""
                    try:
                        # Getiri bazlı ödül
                        return_rate = (value_after - value_before) / value_before
                        
                        # Risk ayarlı ödül
                        risk_penalty = 0.1 * abs(return_rate)  # Volatilite cezası
                        
                        # Sharpe ratio bazlı ödül
                        sharpe_reward = return_rate - risk_penalty
                        
                        return sharpe_reward
                        
                    except Exception as e:
                        logger.error(f"❌ Ödül hesaplama hatası: {e}")
                        return 0
                
                def _get_state(self):
                    """Mevcut durumu getir"""
                    try:
                        if self.current_step >= len(self.data):
                            return np.zeros(self.params["state_dim"])
                        
                        current_row = self.data.iloc[self.current_step]
                        state = []
                        
                        # Fiyat özellikleri
                        for symbol in self.symbols:
                            price_col = f"{symbol}_Close"
                            if price_col in current_row:
                                state.append(current_row[price_col])
                            else:
                                state.append(100)
                        
                        # Teknik indikatörler
                        for symbol in self.symbols:
                            for indicator in ['rsi', 'macd', 'volatility']:
                                col = f"{symbol}_{indicator}"
                                if col in current_row:
                                    state.append(current_row[col])
                                else:
                                    state.append(0)
                        
                        # Portföy durumu
                        state.append(self.current_capital / self.initial_capital)
                        state.append(len([p for p in self.positions.values() if p > 0]))
                        
                        # Eksik özellikleri doldur
                        while len(state) < self.params["state_dim"]:
                            state.append(0)
                        
                        return np.array(state[:self.params["state_dim"]])
                        
                    except Exception as e:
                        logger.error(f"❌ Durum alma hatası: {e}")
                        return np.zeros(self.params["state_dim"])
                
                def _get_info(self):
                    """Ek bilgileri getir"""
                    try:
                        current_prices = self._get_current_prices()
                        portfolio_value = self._calculate_portfolio_value(current_prices)
                        
                        return {
                            "portfolio_value": portfolio_value,
                            "positions": self.positions.copy(),
                            "cash": self.current_capital,
                            "step": self.current_step
                        }
                    except Exception as e:
                        logger.error(f"❌ Bilgi alma hatası: {e}")
                        return {}
            
            return SimulatedTradingEnv(data, symbols, self.portfolio_params)
            
        except Exception as e:
            logger.error(f"❌ Simüle edilmiş ortam oluşturma hatası: {e}")
            return None
    
    def _get_technical_indicators(self) -> List[str]:
        """Teknik indikatör listesi"""
        return [
            'rsi', 'macd', 'macd_signal', 'macd_histogram',
            'bb_position', 'atr', 'volatility', 'volume_ratio'
        ]
    
    def train_rl_agent(self, symbols: List[str] = None, episodes: int = 100) -> Dict:
        """RL ajanını eğit"""
        try:
            if symbols is None:
                symbols = self.bist_symbols
            
            logger.info(f"🤖 RL ajanı eğitimi başlatılıyor... ({len(symbols)} hisse, {episodes} episode)")
            
            # Piyasa verilerini çek
            market_data = self.get_market_data(symbols)
            if market_data.empty:
                return {"error": "Piyasa verisi bulunamadı"}
            
            # Trading ortamı oluştur
            env = self.create_trading_environment(market_data, symbols)
            if env is None:
                return {"error": "Trading ortamı oluşturulamadı"}
            
            # RL ajanını eğit
            if FINRL_AVAILABLE:
                # FinRL ile gerçek eğitim
                agent = DRLAgent(env=env)
                model_ddpg = agent.get_model("ddpg")
                trained_ddpg = agent.train_model(
                    model=model_ddpg,
                    total_timesteps=episodes * 1000,
                    tb_log_name="ddpg"
                )
                self.agent_models["ddpg"] = trained_ddpg
            else:
                # Simüle edilmiş eğitim
                trained_model = self._simulate_training(env, episodes)
                self.agent_models["ddpg"] = trained_model
            
            # Eğitim sonuçlarını kaydet
            training_result = {
                "symbols": symbols,
                "episodes": episodes,
                "training_date": datetime.now().isoformat(),
                "model_type": "DDPG",
                "state_dim": self.rl_params["state_dim"],
                "action_dim": len(symbols),
                "market_data_period": f"{len(market_data)} gün",
                "training_completed": True
            }
            
            logger.info(f"✅ RL ajanı eğitimi tamamlandı")
            return training_result
            
        except Exception as e:
            logger.error(f"❌ RL ajanı eğitimi hatası: {e}")
            return {"error": str(e)}
    
    def _simulate_training(self, env: Any, episodes: int) -> Dict:
        """Simüle edilmiş RL eğitimi"""
        try:
            logger.info(f"🎮 Simüle edilmiş RL eğitimi başlatılıyor...")
            
            # Eğitim metrikleri
            training_metrics = {
                "episode_rewards": [],
                "episode_returns": [],
                "episode_sharpe": [],
                "episode_drawdown": [],
                "convergence": False
            }
            
            # Eğitim döngüsü
            for episode in range(episodes):
                state = env.reset()
                episode_reward = 0
                episode_return = 0
                
                done = False
                while not done:
                    # Rastgele aksiyon (basit implementasyon)
                    action = self._generate_random_action(len(env.symbols))
                    
                    # Aksiyonu uygula
                    next_state, reward, done, info = env.step(action)
                    
                    episode_reward += reward
                    state = next_state
                
                # Episode sonuçları
                final_portfolio_value = info.get("portfolio_value", env.initial_capital)
                episode_return = (final_portfolio_value - env.initial_capital) / env.initial_capital
                
                # Metrikleri güncelle
                training_metrics["episode_rewards"].append(episode_reward)
                training_metrics["episode_returns"].append(episode_return)
                
                # Sharpe ratio hesapla
                if len(training_metrics["episode_returns"]) > 1:
                    returns = np.array(training_metrics["episode_returns"])
                    sharpe = np.mean(returns) / (np.std(returns) + 1e-8) * np.sqrt(252)
                    training_metrics["episode_sharpe"].append(sharpe)
                
                # Drawdown hesapla
                if len(training_metrics["episode_returns"]) > 1:
                    returns = np.array(training_metrics["episode_returns"])
                    cumulative = np.cumprod(1 + returns)
                    running_max = np.maximum.accumulate(cumulative)
                    drawdown = (cumulative - running_max) / running_max
                    max_drawdown = np.min(drawdown)
                    training_metrics["episode_drawdown"].append(max_drawdown)
                
                # İlerleme raporu
                if episode % 10 == 0:
                    logger.info(f"📊 Episode {episode}: Reward={episode_reward:.4f}, Return={episode_return:.4f}")
            
            # Yakınsama kontrolü
            if len(training_metrics["episode_rewards"]) > 20:
                recent_rewards = training_metrics["episode_rewards"][-20:]
                reward_std = np.std(recent_rewards)
                if reward_std < 0.1:  # Düşük standart sapma = yakınsama
                    training_metrics["convergence"] = True
            
            # Model parametreleri
            model_params = {
                "weights": np.random.randn(self.rl_params["state_dim"], len(env.symbols)),
                "bias": np.random.randn(len(env.symbols)),
                "epsilon": max(self.rl_params["epsilon_min"], 
                             self.rl_params["epsilon"] * (self.rl_params["epsilon_decay"] ** episodes))
            }
            
            # Eğitilmiş model
            trained_model = {
                "model_type": "DDPG_Simulated",
                "parameters": model_params,
                "training_metrics": training_metrics,
                "episodes_trained": episodes,
                "convergence_achieved": training_metrics["convergence"]
            }
            
            logger.info(f"✅ Simüle edilmiş RL eğitimi tamamlandı")
            logger.info(f"📈 Final Sharpe Ratio: {training_metrics['episode_sharpe'][-1] if training_metrics['episode_sharpe'] else 0:.4f}")
            logger.info(f"📉 Final Max Drawdown: {training_metrics['episode_drawdown'][-1] if training_metrics['episode_drawdown'] else 0:.4f}")
            
            return trained_model
            
        except Exception as e:
            logger.error(f"❌ Simüle edilmiş eğitim hatası: {e}")
            return {}
    
    def _generate_random_action(self, num_symbols: int) -> List[float]:
        """Rastgele aksiyon üret"""
        try:
            # Rastgele aksiyon (-1 ile 1 arası)
            action = np.random.uniform(-1, 1, num_symbols)
            
            # Portföy kısıtlamaları
            total_action = np.sum(np.abs(action))
            if total_action > 1:
                action = action / total_action
            
            return action.tolist()
            
        except Exception as e:
            logger.error(f"❌ Rastgele aksiyon hatası: {e}")
            return [0] * num_symbols
    
    def generate_portfolio_signal(self, symbols: List[str] = None) -> Dict:
        """Portföy sinyali üret"""
        try:
            if symbols is None:
                symbols = self.bist_symbols
            
            logger.info(f"📊 {len(symbols)} hisse için portföy sinyali üretiliyor...")
            
            # Eğitilmiş model kontrolü
            if "ddpg" not in self.agent_models:
                logger.warning("⚠️ Eğitilmiş model bulunamadı, yeni eğitim başlatılıyor...")
                training_result = self.train_rl_agent(symbols, episodes=50)
                if "error" in training_result:
                    return training_result
            
            # Piyasa verilerini çek
            market_data = self.get_market_data(symbols)
            if market_data.empty:
                return {"error": "Piyasa verisi bulunamadı"}
            
            # Trading ortamı oluştur
            env = self.create_trading_environment(market_data, symbols)
            if env is None:
                return {"error": "Trading ortamı oluşturulamadı"}
            
            # Model ile tahmin
            model = self.agent_models["ddpg"]
            current_state = env._get_state()
            
            if FINRL_AVAILABLE:
                # FinRL model ile tahmin
                action = model.predict(current_state)
            else:
                # Simüle edilmiş model ile tahmin
                action = self._predict_with_simulated_model(model, current_state)
            
            # Sinyal üretimi
            signals = self._generate_signals_from_action(action, symbols, market_data)
            
            # Risk yönetimi
            risk_adjusted_signals = self._apply_risk_management(signals, market_data)
            
            # Portföy önerisi
            portfolio_recommendation = self._generate_portfolio_recommendation(risk_adjusted_signals)
            
            # Sonuç
            result = {
                "symbols": symbols,
                "signals": risk_adjusted_signals,
                "portfolio_recommendation": portfolio_recommendation,
                "model_info": {
                    "model_type": model.get("model_type", "DDPG"),
                    "episodes_trained": model.get("episodes_trained", 0),
                    "convergence": model.get("convergence_achieved", False)
                },
                "market_analysis": self._analyze_market_conditions(market_data),
                "risk_metrics": self._calculate_risk_metrics(risk_adjusted_signals, market_data),
                "generation_date": datetime.now().isoformat()
            }
            
            logger.info(f"✅ Portföy sinyali üretildi")
            logger.info(f"📈 Toplam sinyal: {len(risk_adjusted_signals)}")
            logger.info(f"💰 Önerilen portföy değeri: {portfolio_recommendation.get('total_value', 0):.2f}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Portföy sinyali üretme hatası: {e}")
            return {"error": str(e)}
    
    def _predict_with_simulated_model(self, model: Dict, state: np.ndarray) -> List[float]:
        """Simüle edilmiş model ile tahmin"""
        try:
            # Basit lineer model
            weights = model["parameters"]["weights"]
            bias = model["parameters"]["bias"]
            
            # Tahmin
            action = np.dot(state, weights) + bias
            
            # Aktivasyon fonksiyonu (tanh)
            action = np.tanh(action)
            
            # Portföy kısıtlamaları
            total_action = np.sum(np.abs(action))
            if total_action > 1:
                action = action / total_action
            
            return action.tolist()
            
        except Exception as e:
            logger.error(f"❌ Simüle edilmiş model tahmin hatası: {e}")
            return [0] * len(state)
    
    def _generate_signals_from_action(self, action: List[float], symbols: List[str], market_data: pd.DataFrame) -> List[Dict]:
        """Aksiyondan sinyal üret"""
        try:
            signals = []
            
            for i, symbol in enumerate(symbols):
                if i < len(action):
                    action_value = action[i]
                    
                    # Sinyal türü belirleme
                    if action_value > 0.1:
                        signal_type = "BUY"
                        strength = min(action_value, 1.0)
                    elif action_value < -0.1:
                        signal_type = "SELL"
                        strength = min(abs(action_value), 1.0)
                    else:
                        signal_type = "HOLD"
                        strength = 0.5
                    
                    # Mevcut fiyat
                    current_price = self._get_current_price(symbol, market_data)
                    
                    signals.append({
                        "symbol": symbol,
                        "signal_type": signal_type,
                        "strength": strength,
                        "confidence": self._calculate_signal_confidence(symbol, market_data),
                        "current_price": current_price,
                        "action_value": action_value,
                        "position_size": abs(action_value),
                        "description": f"RL Ajanı {signal_type} sinyali"
                    })
            
            return signals
            
        except Exception as e:
            logger.error(f"❌ Sinyal üretme hatası: {e}")
            return []
    
    def _get_current_price(self, symbol: str, market_data: pd.DataFrame) -> float:
        """Mevcut fiyatı getir"""
        try:
            price_col = f"{symbol}_Close"
            if price_col in market_data.columns:
                return market_data[price_col].iloc[-1]
            else:
                return 100.0  # Varsayılan fiyat
        except Exception as e:
            logger.error(f"❌ Fiyat alma hatası: {e}")
            return 100.0
    
    def _calculate_signal_confidence(self, symbol: str, market_data: pd.DataFrame) -> float:
        """Sinyal güveni hesapla"""
        try:
            # Volatilite bazlı güven
            vol_col = f"{symbol}_volatility"
            if vol_col in market_data.columns:
                volatility = market_data[vol_col].iloc[-1]
                vol_confidence = max(0, 1 - volatility / 0.5)  # %50 volatilite = 0 güven
            else:
                vol_confidence = 0.5
            
            # Hacim bazlı güven
            volume_col = f"{symbol}_volume_ratio"
            if volume_col in market_data.columns:
                volume_ratio = market_data[volume_col].iloc[-1]
                volume_confidence = min(volume_ratio / 2, 1)  # 2x hacim = maksimum güven
            else:
                volume_confidence = 0.5
            
            # Kombine güven
            confidence = (vol_confidence * 0.6) + (volume_confidence * 0.4)
            
            return min(max(confidence, 0), 1)
            
        except Exception as e:
            logger.error(f"❌ Sinyal güveni hesaplama hatası: {e}")
            return 0.5
    
    def _apply_risk_management(self, signals: List[Dict], market_data: pd.DataFrame) -> List[Dict]:
        """Risk yönetimi uygula"""
        try:
            risk_adjusted_signals = []
            
            for signal in signals:
                symbol = signal["symbol"]
                
                # Risk skoru hesapla
                risk_score = self._calculate_risk_score(symbol, market_data)
                
                # Risk ayarlaması
                if risk_score > 0.7:  # Yüksek risk
                    signal["strength"] *= 0.5
                    signal["confidence"] *= 0.7
                    signal["risk_adjusted"] = True
                    signal["risk_score"] = risk_score
                else:
                    signal["risk_adjusted"] = False
                    signal["risk_score"] = risk_score
                
                risk_adjusted_signals.append(signal)
            
            return risk_adjusted_signals
            
        except Exception as e:
            logger.error(f"❌ Risk yönetimi hatası: {e}")
            return signals
    
    def _calculate_risk_score(self, symbol: str, market_data: pd.DataFrame) -> float:
        """Risk skoru hesapla"""
        try:
            risk_factors = []
            
            # Volatilite riski
            vol_col = f"{symbol}_volatility"
            if vol_col in market_data.columns:
                volatility = market_data[vol_col].iloc[-1]
                vol_risk = min(volatility / 0.3, 1)  # %30 volatilite = maksimum risk
                risk_factors.append(vol_risk)
            
            # Likidite riski
            volume_col = f"{symbol}_Volume"
            if volume_col in market_data.columns:
                volume = market_data[volume_col].iloc[-1]
                liquidity_risk = max(0, 1 - volume / self.risk_params["liquidity_threshold"])
                risk_factors.append(liquidity_risk)
            
            # Trend riski
            trend_col = f"{symbol}_trend_20"
            if trend_col in market_data.columns:
                trend = market_data[trend_col].iloc[-1]
                trend_risk = abs(trend)  # Trend değişimi = risk
                risk_factors.append(trend_risk)
            
            # Ortalama risk
            if risk_factors:
                return np.mean(risk_factors)
            else:
                return 0.5
                
        except Exception as e:
            logger.error(f"❌ Risk skoru hesaplama hatası: {e}")
            return 0.5
    
    def _generate_portfolio_recommendation(self, signals: List[Dict]) -> Dict:
        """Portföy önerisi oluştur"""
        try:
            # Sinyalleri filtrele
            buy_signals = [s for s in signals if s["signal_type"] == "BUY" and s["strength"] > 0.5]
            sell_signals = [s for s in signals if s["signal_type"] == "SELL" and s["strength"] > 0.5]
            
            # Portföy dağılımı
            total_buy_strength = sum(s["strength"] for s in buy_signals)
            portfolio_allocation = {}
            
            for signal in buy_signals:
                if total_buy_strength > 0:
                    allocation = signal["strength"] / total_buy_strength
                    portfolio_allocation[signal["symbol"]] = {
                        "allocation": allocation,
                        "strength": signal["strength"],
                        "confidence": signal["confidence"],
                        "current_price": signal["current_price"]
                    }
            
            # Portföy değeri
            total_value = self.portfolio_params["initial_capital"]
            
            # Önerilen pozisyonlar
            recommended_positions = {}
            for symbol, allocation in portfolio_allocation.items():
                position_value = total_value * allocation["allocation"]
                shares = int(position_value / allocation["current_price"])
                recommended_positions[symbol] = {
                    "shares": shares,
                    "value": shares * allocation["current_price"],
                    "allocation_pct": allocation["allocation"] * 100
                }
            
            # Risk metrikleri
            portfolio_risk = self._calculate_portfolio_risk(portfolio_allocation)
            
            return {
                "total_value": total_value,
                "recommended_positions": recommended_positions,
                "portfolio_allocation": portfolio_allocation,
                "buy_signals_count": len(buy_signals),
                "sell_signals_count": len(sell_signals),
                "portfolio_risk": portfolio_risk,
                "diversification_score": self._calculate_diversification_score(portfolio_allocation),
                "expected_return": self._calculate_expected_return(portfolio_allocation),
                "recommendation_date": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Portföy önerisi hatası: {e}")
            return {}
    
    def _calculate_portfolio_risk(self, allocation: Dict) -> float:
        """Portföy riski hesapla"""
        try:
            if not allocation:
                return 0.5
            
            # Ağırlıklı risk
            total_risk = 0
            total_weight = 0
            
            for symbol, data in allocation.items():
                weight = data["allocation"]
                risk = data.get("risk_score", 0.5)
                total_risk += weight * risk
                total_weight += weight
            
            if total_weight > 0:
                return total_risk / total_weight
            else:
                return 0.5
                
        except Exception as e:
            logger.error(f"❌ Portföy riski hesaplama hatası: {e}")
            return 0.5
    
    def _calculate_diversification_score(self, allocation: Dict) -> float:
        """Diversifikasyon skoru hesapla"""
        try:
            if not allocation:
                return 0
            
            # Herhangi bir hissenin maksimum ağırlığı
            max_allocation = max(data["allocation"] for data in allocation.values())
            
            # Diversifikasyon skoru (düşük maksimum ağırlık = yüksek diversifikasyon)
            diversification_score = 1 - max_allocation
            
            return diversification_score
            
        except Exception as e:
            logger.error(f"❌ Diversifikasyon skoru hatası: {e}")
            return 0
    
    def _calculate_expected_return(self, allocation: Dict) -> float:
        """Beklenen getiri hesapla"""
        try:
            if not allocation:
                return 0
            
            # Ağırlıklı beklenen getiri
            total_expected_return = 0
            total_weight = 0
            
            for symbol, data in allocation.items():
                weight = data["allocation"]
                # Basit getiri tahmini (güven * güç)
                expected_return = data["confidence"] * data["strength"] * 0.2  # %20 maksimum
                total_expected_return += weight * expected_return
                total_weight += weight
            
            if total_weight > 0:
                return total_expected_return / total_weight
            else:
                return 0
                
        except Exception as e:
            logger.error(f"❌ Beklenen getiri hesaplama hatası: {e}")
            return 0
    
    def _analyze_market_conditions(self, market_data: pd.DataFrame) -> Dict:
        """Piyasa koşullarını analiz et"""
        try:
            # Genel piyasa trendi
            market_trend = "neutral"
            volatility_regime = "normal"
            
            # Volatilite analizi
            if not market_data.empty:
                # Ortalama volatilite
                vol_columns = [col for col in market_data.columns if 'volatility' in col]
                if vol_columns:
                    avg_volatility = market_data[vol_columns].mean().mean()
                    if avg_volatility > 0.3:
                        volatility_regime = "high"
                    elif avg_volatility < 0.1:
                        volatility_regime = "low"
            
            return {
                "market_trend": market_trend,
                "volatility_regime": volatility_regime,
                "analysis_date": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Piyasa analizi hatası: {e}")
            return {}
    
    def _calculate_risk_metrics(self, signals: List[Dict], market_data: pd.DataFrame) -> Dict:
        """Risk metriklerini hesapla"""
        try:
            # VaR hesaplama
            var_95 = self._calculate_var(signals, 0.05)
            var_99 = self._calculate_var(signals, 0.01)
            
            # Sharpe ratio
            sharpe_ratio = self._calculate_sharpe_ratio(signals)
            
            # Maksimum düşüş
            max_drawdown = self._calculate_max_drawdown(signals)
            
            return {
                "var_95": var_95,
                "var_99": var_99,
                "sharpe_ratio": sharpe_ratio,
                "max_drawdown": max_drawdown,
                "risk_score": np.mean([s.get("risk_score", 0.5) for s in signals])
            }
            
        except Exception as e:
            logger.error(f"❌ Risk metrikleri hesaplama hatası: {e}")
            return {}
    
    def _calculate_var(self, signals: List[Dict], confidence_level: float) -> float:
        """Value at Risk hesapla"""
        try:
            # Basit VaR hesaplama
            returns = [s.get("strength", 0.5) for s in signals]
            if returns:
                return np.percentile(returns, confidence_level * 100)
            else:
                return 0.05
        except Exception as e:
            logger.error(f"❌ VaR hesaplama hatası: {e}")
            return 0.05
    
    def _calculate_sharpe_ratio(self, signals: List[Dict]) -> float:
        """Sharpe ratio hesapla"""
        try:
            returns = [s.get("strength", 0.5) for s in signals]
            if len(returns) > 1:
                mean_return = np.mean(returns)
                std_return = np.std(returns)
                if std_return > 0:
                    return mean_return / std_return
            return 0
        except Exception as e:
            logger.error(f"❌ Sharpe ratio hesaplama hatası: {e}")
            return 0
    
    def _calculate_max_drawdown(self, signals: List[Dict]) -> float:
        """Maksimum düşüş hesapla"""
        try:
            returns = [s.get("strength", 0.5) for s in signals]
            if len(returns) > 1:
                cumulative = np.cumprod(1 + np.array(returns))
                running_max = np.maximum.accumulate(cumulative)
                drawdown = (cumulative - running_max) / running_max
                return np.min(drawdown)
            return 0
        except Exception as e:
            logger.error(f"❌ Maksimum düşüş hesaplama hatası: {e}")
            return 0
    
    def get_portfolio_performance(self, symbols: List[str] = None) -> Dict:
        """Portföy performansını getir"""
        try:
            if symbols is None:
                symbols = self.bist_symbols
            
            # Portföy sinyali üret
            portfolio_result = self.generate_portfolio_signal(symbols)
            if "error" in portfolio_result:
                return portfolio_result
            
            # Performans metrikleri
            performance_metrics = {
                "total_signals": len(portfolio_result["signals"]),
                "buy_signals": len([s for s in portfolio_result["signals"] if s["signal_type"] == "BUY"]),
                "sell_signals": len([s for s in portfolio_result["signals"] if s["signal_type"] == "SELL"]),
                "hold_signals": len([s for s in portfolio_result["signals"] if s["signal_type"] == "HOLD"]),
                "average_confidence": np.mean([s["confidence"] for s in portfolio_result["signals"]]),
                "average_strength": np.mean([s["strength"] for s in portfolio_result["signals"]]),
                "portfolio_value": portfolio_result["portfolio_recommendation"].get("total_value", 0),
                "expected_return": portfolio_result["portfolio_recommendation"].get("expected_return", 0),
                "portfolio_risk": portfolio_result["portfolio_recommendation"].get("portfolio_risk", 0),
                "diversification_score": portfolio_result["portfolio_recommendation"].get("diversification_score", 0),
                "risk_metrics": portfolio_result["risk_metrics"],
                "market_analysis": portfolio_result["market_analysis"],
                "performance_date": datetime.now().isoformat()
            }
            
            return performance_metrics
            
        except Exception as e:
            logger.error(f"❌ Portföy performansı hatası: {e}")
            return {"error": str(e)}
    
    def get_agent_status(self) -> Dict:
        """Ajan durumunu getir"""
        try:
            status = {
                "models_available": list(self.agent_models.keys()),
                "training_history": len(self.portfolio_history),
                "trading_history": len(self.trading_history),
                "rl_parameters": self.rl_params,
                "portfolio_parameters": self.portfolio_params,
                "risk_parameters": self.risk_params,
                "finrl_available": FINRL_AVAILABLE,
                "status": "active" if self.agent_models else "inactive",
                "last_update": datetime.now().isoformat()
            }
            
            return status
            
        except Exception as e:
            logger.error(f"❌ Ajan durumu hatası: {e}")
            return {"error": str(e)}

# Aşağıdaki demo bloğu, transformer fusion çıktısına göre pozisyon önerisi üretir.
# Daha kapsamlı RL eğitim/test fonksiyonları gerektiğinde ayrı scriptlerde çağrılmalıdır.
