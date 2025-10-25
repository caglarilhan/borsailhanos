"""
🚀 BIST AI Smart Trader - Reward Function System
===============================================

AI için ödül fonksiyonu: kar > 0 → pozitif, risk > limit → negatif.
Strateji doğruluğunu optimize eden reward sistemi.

Özellikler:
- Profit-based rewards
- Risk-based penalties
- Drawdown penalties
- Transaction cost penalties
- Sharpe ratio rewards
- Custom reward functions
"""

import asyncio
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Callable
from dataclasses import dataclass, asdict
from pathlib import Path
import math

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class RewardComponents:
    """Reward bileşenleri"""
    profit_reward: float
    risk_penalty: float
    drawdown_penalty: float
    transaction_penalty: float
    sharpe_reward: float
    custom_reward: float
    total_reward: float
    
    def to_dict(self):
        return asdict(self)

@dataclass
class RewardMetrics:
    """Reward metrikleri"""
    timestamp: datetime
    episode: int
    step: int
    action: str
    reward_components: RewardComponents
    portfolio_value: float
    position_size: float
    current_price: float
    metadata: Dict[str, Any]
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        data['reward_components'] = self.reward_components.to_dict()
        return data

class RewardFunctionSystem:
    """Reward Function System"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or self._get_default_config()
        
        # Reward weights
        self.weights = {
            'profit': self.config.get('profit_weight', 1.0),
            'risk': self.config.get('risk_weight', 0.5),
            'drawdown': self.config.get('drawdown_weight', 0.3),
            'transaction': self.config.get('transaction_weight', 0.1),
            'sharpe': self.config.get('sharpe_weight', 0.2),
            'custom': self.config.get('custom_weight', 0.0)
        }
        
        # Risk parameters
        self.risk_params = {
            'max_drawdown': self.config.get('max_drawdown', 0.1),
            'volatility_threshold': self.config.get('volatility_threshold', 0.2),
            'position_limit': self.config.get('position_limit', 0.2),
            'transaction_cost': self.config.get('transaction_cost', 0.001)
        }
        
        # Portfolio tracking
        self.portfolio_history = []
        self.position_history = []
        self.price_history = []
        
        # Reward metrics
        self.reward_metrics = []
        
        logger.info("✅ Reward Function System initialized")
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Default konfigürasyon"""
        return {
            'profit_weight': 1.0,
            'risk_weight': 0.5,
            'drawdown_weight': 0.3,
            'transaction_weight': 0.1,
            'sharpe_weight': 0.2,
            'custom_weight': 0.0,
            'max_drawdown': 0.1,
            'volatility_threshold': 0.2,
            'position_limit': 0.2,
            'transaction_cost': 0.001
        }
    
    def calculate_reward(self,
                        action: str,
                        current_price: float,
                        next_price: float,
                        position_size: float,
                        portfolio_value: float,
                        episode: int = 0,
                        step: int = 0,
                        metadata: Dict[str, Any] = None) -> Tuple[float, RewardComponents]:
        """Reward hesapla"""
        try:
            # Portfolio ve pozisyon geçmişini güncelle
            self.portfolio_history.append(portfolio_value)
            self.position_history.append(position_size)
            self.price_history.append(current_price)
            
            # Reward bileşenlerini hesapla
            profit_reward = self._calculate_profit_reward(
                action, current_price, next_price, position_size
            )
            
            risk_penalty = self._calculate_risk_penalty(
                position_size, portfolio_value
            )
            
            drawdown_penalty = self._calculate_drawdown_penalty(
                portfolio_value
            )
            
            transaction_penalty = self._calculate_transaction_penalty(
                action, position_size
            )
            
            sharpe_reward = self._calculate_sharpe_reward(
                portfolio_value
            )
            
            custom_reward = self._calculate_custom_reward(
                action, current_price, next_price, position_size, metadata
            )
            
            # Weighted total reward
            total_reward = (
                self.weights['profit'] * profit_reward +
                self.weights['risk'] * risk_penalty +
                self.weights['drawdown'] * drawdown_penalty +
                self.weights['transaction'] * transaction_penalty +
                self.weights['sharpe'] * sharpe_reward +
                self.weights['custom'] * custom_reward
            )
            
            # Reward bileşenleri
            reward_components = RewardComponents(
                profit_reward=profit_reward,
                risk_penalty=risk_penalty,
                drawdown_penalty=drawdown_penalty,
                transaction_penalty=transaction_penalty,
                sharpe_reward=sharpe_reward,
                custom_reward=custom_reward,
                total_reward=total_reward
            )
            
            # Metrikleri kaydet
            reward_metric = RewardMetrics(
                timestamp=datetime.now(),
                episode=episode,
                step=step,
                action=action,
                reward_components=reward_components,
                portfolio_value=portfolio_value,
                position_size=position_size,
                current_price=current_price,
                metadata=metadata or {}
            )
            
            self.reward_metrics.append(reward_metric)
            
            return total_reward, reward_components
            
        except Exception as e:
            logger.error(f"❌ Calculate reward error: {e}")
            return 0.0, RewardComponents(0, 0, 0, 0, 0, 0, 0)
    
    def _calculate_profit_reward(self, action: str, current_price: float, 
                               next_price: float, position_size: float) -> float:
        """Kar bazlı reward"""
        try:
            if action == 'HOLD':
                return 0.0
            
            # Fiyat değişimi
            price_change = (next_price - current_price) / current_price
            
            if action == 'BUY':
                # Alım işlemi - fiyat artarsa pozitif reward
                return price_change * position_size
            
            elif action == 'SELL':
                # Satım işlemi - fiyat düşerse pozitif reward
                return -price_change * position_size
            
            return 0.0
            
        except Exception as e:
            logger.error(f"❌ Calculate profit reward error: {e}")
            return 0.0
    
    def _calculate_risk_penalty(self, position_size: float, portfolio_value: float) -> float:
        """Risk bazlı penalty"""
        try:
            # Pozisyon limiti kontrolü
            if abs(position_size) > self.risk_params['position_limit']:
                excess_position = abs(position_size) - self.risk_params['position_limit']
                return -excess_position * 2.0  # Ağır penalty
            
            # Volatilite kontrolü
            if len(self.price_history) >= 20:
                recent_prices = self.price_history[-20:]
                returns = np.diff(np.log(recent_prices))
                volatility = np.std(returns) * np.sqrt(252)  # Annualized
                
                if volatility > self.risk_params['volatility_threshold']:
                    return -volatility * 0.5  # Volatilite penalty
            
            return 0.0
            
        except Exception as e:
            logger.error(f"❌ Calculate risk penalty error: {e}")
            return 0.0
    
    def _calculate_drawdown_penalty(self, portfolio_value: float) -> float:
        """Drawdown penalty"""
        try:
            if len(self.portfolio_history) < 2:
                return 0.0
            
            # Peak portfolio value
            peak_value = max(self.portfolio_history)
            
            # Current drawdown
            current_drawdown = (peak_value - portfolio_value) / peak_value
            
            if current_drawdown > self.risk_params['max_drawdown']:
                excess_drawdown = current_drawdown - self.risk_params['max_drawdown']
                return -excess_drawdown * 5.0  # Ağır drawdown penalty
            
            return 0.0
            
        except Exception as e:
            logger.error(f"❌ Calculate drawdown penalty error: {e}")
            return 0.0
    
    def _calculate_transaction_penalty(self, action: str, position_size: float) -> float:
        """Transaction cost penalty"""
        try:
            if action in ['BUY', 'SELL']:
                return -self.risk_params['transaction_cost'] * abs(position_size)
            
            return 0.0
            
        except Exception as e:
            logger.error(f"❌ Calculate transaction penalty error: {e}")
            return 0.0
    
    def _calculate_sharpe_reward(self, portfolio_value: float) -> float:
        """Sharpe ratio reward"""
        try:
            if len(self.portfolio_history) < 20:
                return 0.0
            
            # Portfolio returns
            portfolio_values = self.portfolio_history[-20:]
            returns = np.diff(np.log(portfolio_values))
            
            if len(returns) < 2:
                return 0.0
            
            # Sharpe ratio
            mean_return = np.mean(returns)
            std_return = np.std(returns)
            
            if std_return == 0:
                return 0.0
            
            sharpe_ratio = mean_return / std_return
            
            # Sharpe ratio reward (normalized)
            return sharpe_ratio * 0.1
            
        except Exception as e:
            logger.error(f"❌ Calculate sharpe reward error: {e}")
            return 0.0
    
    def _calculate_custom_reward(self, action: str, current_price: float,
                               next_price: float, position_size: float,
                               metadata: Dict[str, Any]) -> float:
        """Custom reward fonksiyonu"""
        try:
            # Bu fonksiyon kullanıcı tarafından özelleştirilebilir
            # Şimdilik basit bir implementasyon
            
            custom_reward = 0.0
            
            # Momentum reward
            if len(self.price_history) >= 5:
                recent_prices = self.price_history[-5:]
                momentum = (recent_prices[-1] - recent_prices[0]) / recent_prices[0]
                
                if action == 'BUY' and momentum > 0:
                    custom_reward += momentum * 0.1
                elif action == 'SELL' and momentum < 0:
                    custom_reward += abs(momentum) * 0.1
            
            # Mean reversion reward
            if len(self.price_history) >= 20:
                recent_prices = self.price_history[-20:]
                mean_price = np.mean(recent_prices)
                current_deviation = (current_price - mean_price) / mean_price
                
                if abs(current_deviation) > 0.05:  # 5% deviation
                    if action == 'SELL' and current_deviation > 0:
                        custom_reward += current_deviation * 0.2
                    elif action == 'BUY' and current_deviation < 0:
                        custom_reward += abs(current_deviation) * 0.2
            
            return custom_reward
            
        except Exception as e:
            logger.error(f"❌ Calculate custom reward error: {e}")
            return 0.0
    
    def add_custom_reward_function(self, name: str, function: Callable):
        """Custom reward fonksiyonu ekle"""
        try:
            if not hasattr(self, 'custom_functions'):
                self.custom_functions = {}
            
            self.custom_functions[name] = function
            logger.info(f"✅ Custom reward function added: {name}")
            
        except Exception as e:
            logger.error(f"❌ Add custom reward function error: {e}")
    
    def get_reward_statistics(self, episode: int = None) -> Dict[str, Any]:
        """Reward istatistiklerini getir"""
        try:
            if episode is not None:
                metrics = [m for m in self.reward_metrics if m.episode == episode]
            else:
                metrics = self.reward_metrics
            
            if not metrics:
                return {'total_rewards': 0}
            
            # İstatistikleri hesapla
            total_rewards = [m.reward_components.total_reward for m in metrics]
            profit_rewards = [m.reward_components.profit_reward for m in metrics]
            risk_penalties = [m.reward_components.risk_penalty for m in metrics]
            drawdown_penalties = [m.reward_components.drawdown_penalty for m in metrics]
            
            stats = {
                'total_rewards': len(metrics),
                'mean_total_reward': np.mean(total_rewards),
                'std_total_reward': np.std(total_rewards),
                'mean_profit_reward': np.mean(profit_rewards),
                'mean_risk_penalty': np.mean(risk_penalties),
                'mean_drawdown_penalty': np.mean(drawdown_penalties),
                'best_reward': max(total_rewards),
                'worst_reward': min(total_rewards),
                'reward_distribution': {
                    'profit': np.mean(profit_rewards),
                    'risk': np.mean(risk_penalties),
                    'drawdown': np.mean(drawdown_penalties),
                    'transaction': np.mean([m.reward_components.transaction_penalty for m in metrics]),
                    'sharpe': np.mean([m.reward_components.sharpe_reward for m in metrics])
                }
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Get reward statistics error: {e}")
            return {}
    
    def reset_episode(self):
        """Episode reset"""
        try:
            self.portfolio_history = []
            self.position_history = []
            self.price_history = []
            
            logger.info("🔄 Reward system episode reset")
            
        except Exception as e:
            logger.error(f"❌ Reset episode error: {e}")
    
    def update_config(self, new_config: Dict[str, Any]):
        """Konfigürasyonu güncelle"""
        try:
            self.config.update(new_config)
            
            # Weights güncelle
            if 'profit_weight' in new_config:
                self.weights['profit'] = new_config['profit_weight']
            if 'risk_weight' in new_config:
                self.weights['risk'] = new_config['risk_weight']
            if 'drawdown_weight' in new_config:
                self.weights['drawdown'] = new_config['drawdown_weight']
            if 'transaction_weight' in new_config:
                self.weights['transaction'] = new_config['transaction_weight']
            if 'sharpe_weight' in new_config:
                self.weights['sharpe'] = new_config['sharpe_weight']
            if 'custom_weight' in new_config:
                self.weights['custom'] = new_config['custom_weight']
            
            # Risk parameters güncelle
            if 'max_drawdown' in new_config:
                self.risk_params['max_drawdown'] = new_config['max_drawdown']
            if 'volatility_threshold' in new_config:
                self.risk_params['volatility_threshold'] = new_config['volatility_threshold']
            if 'position_limit' in new_config:
                self.risk_params['position_limit'] = new_config['position_limit']
            if 'transaction_cost' in new_config:
                self.risk_params['transaction_cost'] = new_config['transaction_cost']
            
            logger.info("✅ Reward system config updated")
            
        except Exception as e:
            logger.error(f"❌ Update config error: {e}")
    
    def get_config(self) -> Dict[str, Any]:
        """Konfigürasyonu getir"""
        return {
            'config': self.config,
            'weights': self.weights,
            'risk_params': self.risk_params
        }

# Global instance
reward_function_system = RewardFunctionSystem()

if __name__ == "__main__":
    async def test_reward_system():
        """Test fonksiyonu"""
        logger.info("🧪 Testing Reward Function System...")
        
        # Test senaryoları
        test_scenarios = [
            {'action': 'BUY', 'current_price': 100, 'next_price': 105, 'position_size': 0.1, 'portfolio_value': 100000},
            {'action': 'SELL', 'current_price': 105, 'next_price': 100, 'position_size': 0.1, 'portfolio_value': 101000},
            {'action': 'HOLD', 'current_price': 100, 'next_price': 100, 'position_size': 0.0, 'portfolio_value': 100000},
        ]
        
        for i, scenario in enumerate(test_scenarios):
            reward, components = reward_function_system.calculate_reward(
                action=scenario['action'],
                current_price=scenario['current_price'],
                next_price=scenario['next_price'],
                position_size=scenario['position_size'],
                portfolio_value=scenario['portfolio_value'],
                episode=1,
                step=i
            )
            
            logger.info(f"Scenario {i+1}: {scenario['action']} - Reward: {reward:.4f}")
            logger.info(f"  Components: Profit={components.profit_reward:.4f}, "
                       f"Risk={components.risk_penalty:.4f}, "
                       f"Drawdown={components.drawdown_penalty:.4f}")
        
        # İstatistikler
        stats = reward_function_system.get_reward_statistics()
        logger.info(f"📊 Reward statistics: {stats}")
        
        logger.info("✅ Reward Function System test completed")
    
    # Test çalıştır
    asyncio.run(test_reward_system())
