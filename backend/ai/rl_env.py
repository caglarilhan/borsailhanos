"""
🚀 BIST AI Smart Trader - RL Environment
========================================

BIST verisinde "state-reward-action" çevresi tanımlayan sistem.
AI'nin öğrenme ortamını oluşturur.

Özellikler:
- State representation (fiyat, momentum, RSI, vb.)
- Action space (BUY, SELL, HOLD)
- Reward function (kazanç/zarar bazlı)
- Environment dynamics
- Episode management
"""

import asyncio
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import gym
from gym import spaces
import talib

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class State:
    """RL State representation"""
    timestamp: datetime
    price: float
    volume: float
    technical_indicators: Dict[str, float]
    market_features: Dict[str, float]
    portfolio_state: Dict[str, float]
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data

@dataclass
class Action:
    """RL Action"""
    action_type: str  # 'BUY', 'SELL', 'HOLD'
    quantity: float
    confidence: float
    timestamp: datetime
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data

@dataclass
class Reward:
    """RL Reward"""
    reward_value: float
    reward_type: str  # 'profit', 'risk', 'penalty'
    description: str
    timestamp: datetime
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data

class BISTTradingEnvironment(gym.Env):
    """BIST Trading Environment for Reinforcement Learning"""
    
    def __init__(self, 
                 data: pd.DataFrame,
                 initial_balance: float = 100000.0,
                 transaction_cost: float = 0.001,
                 max_position_size: float = 0.1):
        super().__init__()
        
        # Environment parameters
        self.data = data
        self.initial_balance = initial_balance
        self.transaction_cost = transaction_cost
        self.max_position_size = max_position_size
        
        # Current state
        self.current_step = 0
        self.balance = initial_balance
        self.position = 0.0  # Current position size
        self.entry_price = 0.0
        self.total_trades = 0
        self.winning_trades = 0
        
        # Episode tracking
        self.episode_rewards = []
        self.episode_actions = []
        self.episode_states = []
        
        # Action space: BUY (0), SELL (1), HOLD (2)
        self.action_space = spaces.Discrete(3)
        
        # State space: technical indicators + market features
        self.state_space_size = 20  # Will be calculated dynamically
        self.observation_space = spaces.Box(
            low=-np.inf, 
            high=np.inf, 
            shape=(self.state_space_size,), 
            dtype=np.float32
        )
        
        # Technical indicators
        self.indicators = self._calculate_technical_indicators()
        
        logger.info(f"✅ RL Environment initialized with {len(data)} data points")
    
    def _calculate_technical_indicators(self) -> pd.DataFrame:
        """Teknik indikatörleri hesapla"""
        try:
            df = self.data.copy()
            
            # Price-based indicators
            df['sma_20'] = talib.SMA(df['close'], timeperiod=20)
            df['sma_50'] = talib.SMA(df['close'], timeperiod=50)
            df['ema_12'] = talib.EMA(df['close'], timeperiod=12)
            df['ema_26'] = talib.EMA(df['close'], timeperiod=26)
            
            # Momentum indicators
            df['rsi'] = talib.RSI(df['close'], timeperiod=14)
            df['macd'], df['macd_signal'], df['macd_hist'] = talib.MACD(df['close'])
            
            # Volatility indicators
            df['bb_upper'], df['bb_middle'], df['bb_lower'] = talib.BBANDS(df['close'])
            df['atr'] = talib.ATR(df['high'], df['low'], df['close'], timeperiod=14)
            
            # Volume indicators
            df['volume_sma'] = talib.SMA(df['volume'], timeperiod=20)
            df['volume_ratio'] = df['volume'] / df['volume_sma']
            
            # Price change indicators
            df['price_change'] = df['close'].pct_change()
            df['price_change_5'] = df['close'].pct_change(5)
            df['price_change_20'] = df['close'].pct_change(20)
            
            # Volatility
            df['volatility'] = df['price_change'].rolling(20).std()
            
            # Market regime indicators
            df['trend_strength'] = (df['sma_20'] - df['sma_50']) / df['sma_50']
            df['momentum'] = df['close'] / df['close'].shift(5) - 1
            
            logger.info("✅ Technical indicators calculated")
            return df
            
        except Exception as e:
            logger.error(f"❌ Calculate technical indicators error: {e}")
            return self.data
    
    def _get_state(self) -> np.ndarray:
        """Current state'i getir"""
        try:
            if self.current_step >= len(self.indicators):
                return np.zeros(self.state_space_size)
            
            row = self.indicators.iloc[self.current_step]
            
            # State features
            state_features = [
                row['close'] / row['sma_20'] - 1,  # Price vs SMA20
                row['close'] / row['sma_50'] - 1,  # Price vs SMA50
                row['rsi'] / 100 - 0.5,           # RSI normalized
                row['macd'] / row['close'],       # MACD normalized
                row['macd_signal'] / row['close'], # MACD signal normalized
                row['bb_upper'] / row['close'] - 1, # Bollinger upper
                row['bb_lower'] / row['close'] - 1, # Bollinger lower
                row['volume_ratio'] - 1,          # Volume ratio
                row['price_change'],              # Price change
                row['price_change_5'],            # 5-day change
                row['price_change_20'],           # 20-day change
                row['volatility'],                # Volatility
                row['trend_strength'],            # Trend strength
                row['momentum'],                  # Momentum
                self.position,                    # Current position
                self.balance / self.initial_balance - 1,  # Balance ratio
                self.total_trades / 100,         # Trade count normalized
                self.winning_trades / max(self.total_trades, 1),  # Win rate
                row['atr'] / row['close'],       # ATR normalized
                row['macd_hist'] / row['close']   # MACD histogram
            ]
            
            return np.array(state_features, dtype=np.float32)
            
        except Exception as e:
            logger.error(f"❌ Get state error: {e}")
            return np.zeros(self.state_space_size)
    
    def _calculate_reward(self, action: int, next_price: float) -> float:
        """Reward hesapla"""
        try:
            current_price = self.indicators.iloc[self.current_step]['close']
            
            # Action mapping
            action_map = {0: 'BUY', 1: 'SELL', 2: 'HOLD'}
            action_type = action_map[action]
            
            reward = 0.0
            
            if action_type == 'BUY' and self.position == 0:
                # Buy action
                self.position = self.max_position_size
                self.entry_price = current_price
                reward = -self.transaction_cost  # Transaction cost
            
            elif action_type == 'SELL' and self.position > 0:
                # Sell action
                profit = (next_price - self.entry_price) / self.entry_price
                reward = profit * self.position - self.transaction_cost
                
                # Update statistics
                self.total_trades += 1
                if profit > 0:
                    self.winning_trades += 1
                
                # Reset position
                self.position = 0.0
                self.entry_price = 0.0
            
            elif action_type == 'HOLD':
                # Hold action
                if self.position > 0:
                    # Unrealized P&L
                    unrealized_pnl = (next_price - self.entry_price) / self.entry_price
                    reward = unrealized_pnl * self.position * 0.1  # Small reward for holding
                else:
                    reward = 0.0
            
            # Risk penalty
            if self.position > 0:
                risk = abs(next_price - self.entry_price) / self.entry_price
                if risk > 0.05:  # 5% risk threshold
                    reward -= risk * 0.5  # Risk penalty
            
            # Balance update
            if action_type == 'SELL' and self.position > 0:
                self.balance *= (1 + reward)
            
            return reward
            
        except Exception as e:
            logger.error(f"❌ Calculate reward error: {e}")
            return 0.0
    
    def step(self, action: int) -> Tuple[np.ndarray, float, bool, Dict[str, Any]]:
        """Environment step"""
        try:
            if self.current_step >= len(self.indicators) - 1:
                return self._get_state(), 0.0, True, {}
            
            # Current state
            current_state = self._get_state()
            
            # Next price
            next_price = self.indicators.iloc[self.current_step + 1]['close']
            
            # Calculate reward
            reward = self._calculate_reward(action, next_price)
            
            # Move to next step
            self.current_step += 1
            
            # Check if episode is done
            done = self.current_step >= len(self.indicators) - 1
            
            # Info dictionary
            info = {
                'current_step': self.current_step,
                'balance': self.balance,
                'position': self.position,
                'total_trades': self.total_trades,
                'winning_trades': self.winning_trades,
                'win_rate': self.winning_trades / max(self.total_trades, 1),
                'current_price': next_price
            }
            
            # Track episode data
            self.episode_rewards.append(reward)
            self.episode_actions.append(action)
            self.episode_states.append(current_state)
            
            return self._get_state(), reward, done, info
            
        except Exception as e:
            logger.error(f"❌ Step error: {e}")
            return self._get_state(), 0.0, True, {}
    
    def reset(self) -> np.ndarray:
        """Environment reset"""
        try:
            self.current_step = 0
            self.balance = self.initial_balance
            self.position = 0.0
            self.entry_price = 0.0
            self.total_trades = 0
            self.winning_trades = 0
            
            # Clear episode data
            self.episode_rewards = []
            self.episode_actions = []
            self.episode_states = []
            
            logger.info("✅ Environment reset")
            return self._get_state()
            
        except Exception as e:
            logger.error(f"❌ Reset error: {e}")
            return np.zeros(self.state_space_size)
    
    def render(self, mode='human'):
        """Environment render"""
        try:
            if mode == 'human':
                print(f"Step: {self.current_step}")
                print(f"Balance: {self.balance:.2f}")
                print(f"Position: {self.position:.2f}")
                print(f"Trades: {self.total_trades}")
                print(f"Win Rate: {self.winning_trades / max(self.total_trades, 1):.2%}")
                
        except Exception as e:
            logger.error(f"❌ Render error: {e}")
    
    def get_episode_summary(self) -> Dict[str, Any]:
        """Episode özetini getir"""
        try:
            total_reward = sum(self.episode_rewards)
            final_balance = self.balance
            total_return = (final_balance - self.initial_balance) / self.initial_balance
            
            # Action distribution
            action_counts = {0: 0, 1: 0, 2: 0}
            for action in self.episode_actions:
                action_counts[action] += 1
            
            summary = {
                'total_reward': total_reward,
                'final_balance': final_balance,
                'total_return': total_return,
                'total_trades': self.total_trades,
                'winning_trades': self.winning_trades,
                'win_rate': self.winning_trades / max(self.total_trades, 1),
                'action_distribution': action_counts,
                'episode_length': len(self.episode_rewards)
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"❌ Get episode summary error: {e}")
            return {}

class RLEnvironmentManager:
    """RL Environment Manager"""
    
    def __init__(self, data_dir: str = "backend/ai/data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Environment cache
        self.environments: Dict[str, BISTTradingEnvironment] = {}
        
        # Environment configurations
        self.env_configs = {
            'default': {
                'initial_balance': 100000.0,
                'transaction_cost': 0.001,
                'max_position_size': 0.1
            },
            'aggressive': {
                'initial_balance': 100000.0,
                'transaction_cost': 0.0005,
                'max_position_size': 0.2
            },
            'conservative': {
                'initial_balance': 100000.0,
                'transaction_cost': 0.002,
                'max_position_size': 0.05
            }
        }
    
    def create_environment(self, 
                          symbol: str,
                          data: pd.DataFrame,
                          config_name: str = 'default') -> BISTTradingEnvironment:
        """Environment oluştur"""
        try:
            config = self.env_configs.get(config_name, self.env_configs['default'])
            
            env = BISTTradingEnvironment(
                data=data,
                initial_balance=config['initial_balance'],
                transaction_cost=config['transaction_cost'],
                max_position_size=config['max_position_size']
            )
            
            self.environments[symbol] = env
            
            logger.info(f"✅ Environment created for {symbol} with {config_name} config")
            return env
            
        except Exception as e:
            logger.error(f"❌ Create environment error: {e}")
            return None
    
    def get_environment(self, symbol: str) -> Optional[BISTTradingEnvironment]:
        """Environment getir"""
        return self.environments.get(symbol)
    
    def list_environments(self) -> List[str]:
        """Environment listesi"""
        return list(self.environments.keys())
    
    def clear_environments(self):
        """Environment'ları temizle"""
        self.environments.clear()
        logger.info("🧹 Environments cleared")

# Global instance
rl_environment_manager = RLEnvironmentManager()

if __name__ == "__main__":
    async def test_rl_environment():
        """Test fonksiyonu"""
        logger.info("🧪 Testing RL Environment...")
        
        # Test verisi oluştur
        dates = pd.date_range(start='2023-01-01', end='2023-12-31', freq='D')
        test_data = pd.DataFrame({
            'date': dates,
            'open': np.random.randn(len(dates)).cumsum() + 100,
            'high': np.random.randn(len(dates)).cumsum() + 105,
            'low': np.random.randn(len(dates)).cumsum() + 95,
            'close': np.random.randn(len(dates)).cumsum() + 100,
            'volume': np.random.randint(1000, 10000, len(dates))
        })
        
        # Environment oluştur
        env = rl_environment_manager.create_environment("TEST", test_data)
        
        if env:
            # Test episode
            state = env.reset()
            logger.info(f"✅ Initial state shape: {state.shape}")
            
            # Random actions
            for step in range(10):
                action = env.action_space.sample()
                next_state, reward, done, info = env.step(action)
                logger.info(f"Step {step}: Action={action}, Reward={reward:.4f}")
                
                if done:
                    break
            
            # Episode summary
            summary = env.get_episode_summary()
            logger.info(f"📊 Episode summary: {summary}")
        
        logger.info("✅ RL Environment test completed")
    
    # Test çalıştır
    asyncio.run(test_rl_environment())
