"""
🚀 BIST AI Smart Trader - RL Agent (DQN)
========================================

Deep Q-Network ajanı. Her adımda "buy / sell / hold" kararını verir.
Reinforcement Learning ile strateji optimizasyonu.

Özellikler:
- Deep Q-Network implementation
- Experience replay
- Target network
- Epsilon-greedy exploration
- Action selection
- Model training
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
import random
import pickle

# ML Libraries
try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    import torch.nn.functional as F
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("⚠️ PyTorch not available - install with: pip install torch")

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class Experience:
    """Experience replay için deneyim"""
    state: np.ndarray
    action: int
    reward: float
    next_state: np.ndarray
    done: bool
    timestamp: datetime
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data

@dataclass
class TrainingMetrics:
    """Training metrikleri"""
    episode: int
    total_reward: float
    average_reward: float
    loss: float
    epsilon: float
    q_values: List[float]
    timestamp: datetime
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data

class DQNNetwork(nn.Module):
    """Deep Q-Network"""
    
    def __init__(self, state_size: int, action_size: int, hidden_size: int = 128):
        super(DQNNetwork, self).__init__()
        
        self.state_size = state_size
        self.action_size = action_size
        self.hidden_size = hidden_size
        
        # Network layers
        self.fc1 = nn.Linear(state_size, hidden_size)
        self.fc2 = nn.Linear(hidden_size, hidden_size)
        self.fc3 = nn.Linear(hidden_size, hidden_size)
        self.fc4 = nn.Linear(hidden_size, action_size)
        
        # Dropout for regularization
        self.dropout = nn.Dropout(0.2)
        
        # Initialize weights
        self._initialize_weights()
    
    def _initialize_weights(self):
        """Ağırlıkları başlat"""
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.xavier_uniform_(m.weight)
                nn.init.constant_(m.bias, 0)
    
    def forward(self, x):
        """Forward pass"""
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = F.relu(self.fc2(x))
        x = self.dropout(x)
        x = F.relu(self.fc3(x))
        x = self.dropout(x)
        x = self.fc4(x)
        return x

class DQNAgent:
    """Deep Q-Network Agent"""
    
    def __init__(self,
                 state_size: int,
                 action_size: int,
                 learning_rate: float = 0.001,
                 gamma: float = 0.95,
                 epsilon: float = 1.0,
                 epsilon_min: float = 0.01,
                 epsilon_decay: float = 0.995,
                 memory_size: int = 10000,
                 batch_size: int = 32,
                 target_update_freq: int = 100):
        
        self.state_size = state_size
        self.action_size = action_size
        self.learning_rate = learning_rate
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_min = epsilon_min
        self.epsilon_decay = epsilon_decay
        self.memory_size = memory_size
        self.batch_size = batch_size
        self.target_update_freq = target_update_freq
        
        # Device
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"🔧 Using device: {self.device}")
        
        # Networks
        self.q_network = DQNNetwork(state_size, action_size).to(self.device)
        self.target_network = DQNNetwork(state_size, action_size).to(self.device)
        
        # Optimizer
        self.optimizer = optim.Adam(self.q_network.parameters(), lr=learning_rate)
        
        # Experience replay
        self.memory = []
        self.memory_counter = 0
        
        # Training metrics
        self.training_metrics = []
        self.episode_count = 0
        
        # Copy weights to target network
        self._update_target_network()
        
        logger.info(f"✅ DQN Agent initialized: {state_size} states, {action_size} actions")
    
    def _update_target_network(self):
        """Target network'i güncelle"""
        try:
            self.target_network.load_state_dict(self.q_network.state_dict())
            logger.debug("🔄 Target network updated")
            
        except Exception as e:
            logger.error(f"❌ Update target network error: {e}")
    
    def remember(self, state: np.ndarray, action: int, reward: float, 
                 next_state: np.ndarray, done: bool):
        """Deneyimi hafızaya ekle"""
        try:
            experience = Experience(
                state=state,
                action=action,
                reward=reward,
                next_state=next_state,
                done=done,
                timestamp=datetime.now()
            )
            
            if len(self.memory) < self.memory_size:
                self.memory.append(experience)
            else:
                self.memory[self.memory_counter % self.memory_size] = experience
            
            self.memory_counter += 1
            
        except Exception as e:
            logger.error(f"❌ Remember experience error: {e}")
    
    def act(self, state: np.ndarray, training: bool = True) -> int:
        """Aksiyon seç"""
        try:
            if training and np.random.random() <= self.epsilon:
                # Random action (exploration)
                return random.randrange(self.action_size)
            
            # Greedy action (exploitation)
            state_tensor = torch.FloatTensor(state).unsqueeze(0).to(self.device)
            q_values = self.q_network(state_tensor)
            action = q_values.argmax().item()
            
            return action
            
        except Exception as e:
            logger.error(f"❌ Act error: {e}")
            return random.randrange(self.action_size)
    
    def replay(self) -> float:
        """Experience replay ile eğitim"""
        try:
            if len(self.memory) < self.batch_size:
                return 0.0
            
            # Random batch seç
            batch = random.sample(self.memory, self.batch_size)
            
            # Batch'i tensor'lara çevir
            states = torch.FloatTensor([e.state for e in batch]).to(self.device)
            actions = torch.LongTensor([e.action for e in batch]).to(self.device)
            rewards = torch.FloatTensor([e.reward for e in batch]).to(self.device)
            next_states = torch.FloatTensor([e.next_state for e in batch]).to(self.device)
            dones = torch.BoolTensor([e.done for e in batch]).to(self.device)
            
            # Current Q values
            current_q_values = self.q_network(states).gather(1, actions.unsqueeze(1))
            
            # Next Q values from target network
            next_q_values = self.target_network(next_states).max(1)[0].detach()
            target_q_values = rewards + (self.gamma * next_q_values * ~dones)
            
            # Loss hesapla
            loss = F.mse_loss(current_q_values.squeeze(), target_q_values)
            
            # Backward pass
            self.optimizer.zero_grad()
            loss.backward()
            self.optimizer.step()
            
            # Epsilon decay
            if self.epsilon > self.epsilon_min:
                self.epsilon *= self.epsilon_decay
            
            return loss.item()
            
        except Exception as e:
            logger.error(f"❌ Replay error: {e}")
            return 0.0
    
    def train_episode(self, env, max_steps: int = 1000) -> Dict[str, Any]:
        """Episode eğitimi"""
        try:
            state = env.reset()
            total_reward = 0.0
            step_count = 0
            
            for step in range(max_steps):
                # Action seç
                action = self.act(state, training=True)
                
                # Environment step
                next_state, reward, done, info = env.step(action)
                
                # Experience'i hatırla
                self.remember(state, action, reward, next_state, done)
                
                # Eğitim
                loss = self.replay()
                
                # State güncelle
                state = next_state
                total_reward += reward
                step_count += 1
                
                # Episode bitti mi?
                if done:
                    break
            
            # Episode metrikleri
            self.episode_count += 1
            average_reward = total_reward / step_count if step_count > 0 else 0.0
            
            # Q values hesapla
            state_tensor = torch.FloatTensor(state).unsqueeze(0).to(self.device)
            q_values = self.q_network(state_tensor).detach().cpu().numpy().flatten()
            
            # Metrikleri kaydet
            metrics = TrainingMetrics(
                episode=self.episode_count,
                total_reward=total_reward,
                average_reward=average_reward,
                loss=loss,
                epsilon=self.epsilon,
                q_values=q_values.tolist(),
                timestamp=datetime.now()
            )
            
            self.training_metrics.append(metrics)
            
            # Target network güncelle
            if self.episode_count % self.target_update_freq == 0:
                self._update_target_network()
            
            episode_summary = {
                'episode': self.episode_count,
                'total_reward': total_reward,
                'average_reward': average_reward,
                'steps': step_count,
                'epsilon': self.epsilon,
                'loss': loss,
                'q_values': q_values.tolist()
            }
            
            logger.info(f"📊 Episode {self.episode_count}: Reward={total_reward:.2f}, "
                       f"Avg={average_reward:.4f}, Epsilon={self.epsilon:.3f}")
            
            return episode_summary
            
        except Exception as e:
            logger.error(f"❌ Train episode error: {e}")
            return {}
    
    def evaluate(self, env, num_episodes: int = 5) -> Dict[str, Any]:
        """Model değerlendirme"""
        try:
            evaluation_results = []
            
            for episode in range(num_episodes):
                state = env.reset()
                total_reward = 0.0
                step_count = 0
                
                while True:
                    # Greedy action (no exploration)
                    action = self.act(state, training=False)
                    
                    # Environment step
                    next_state, reward, done, info = env.step(action)
                    
                    state = next_state
                    total_reward += reward
                    step_count += 1
                    
                    if done:
                        break
                
                evaluation_results.append({
                    'episode': episode + 1,
                    'total_reward': total_reward,
                    'steps': step_count,
                    'average_reward': total_reward / step_count if step_count > 0 else 0.0
                })
            
            # Özet istatistikler
            total_rewards = [r['total_reward'] for r in evaluation_results]
            average_rewards = [r['average_reward'] for r in evaluation_results]
            
            summary = {
                'num_episodes': num_episodes,
                'mean_total_reward': np.mean(total_rewards),
                'std_total_reward': np.std(total_rewards),
                'mean_average_reward': np.mean(average_rewards),
                'std_average_reward': np.std(average_rewards),
                'episode_results': evaluation_results
            }
            
            logger.info(f"📈 Evaluation: Mean reward={summary['mean_total_reward']:.2f} "
                       f"(±{summary['std_total_reward']:.2f})")
            
            return summary
            
        except Exception as e:
            logger.error(f"❌ Evaluate error: {e}")
            return {}
    
    def save_model(self, file_path: str) -> bool:
        """Modeli kaydet"""
        try:
            model_data = {
                'state_size': self.state_size,
                'action_size': self.action_size,
                'q_network_state_dict': self.q_network.state_dict(),
                'target_network_state_dict': self.target_network.state_dict(),
                'optimizer_state_dict': self.optimizer.state_dict(),
                'epsilon': self.epsilon,
                'episode_count': self.episode_count,
                'training_metrics': [m.to_dict() for m in self.training_metrics]
            }
            
            with open(file_path, 'wb') as f:
                pickle.dump(model_data, f)
            
            logger.info(f"💾 Model saved: {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Save model error: {e}")
            return False
    
    def load_model(self, file_path: str) -> bool:
        """Modeli yükle"""
        try:
            with open(file_path, 'rb') as f:
                model_data = pickle.load(f)
            
            self.q_network.load_state_dict(model_data['q_network_state_dict'])
            self.target_network.load_state_dict(model_data['target_network_state_dict'])
            self.optimizer.load_state_dict(model_data['optimizer_state_dict'])
            self.epsilon = model_data['epsilon']
            self.episode_count = model_data['episode_count']
            
            # Training metrics
            self.training_metrics = [
                TrainingMetrics(**m) for m in model_data['training_metrics']
            ]
            
            logger.info(f"✅ Model loaded: {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Load model error: {e}")
            return False
    
    def get_training_summary(self) -> Dict[str, Any]:
        """Training özetini getir"""
        try:
            if not self.training_metrics:
                return {'total_episodes': 0}
            
            total_episodes = len(self.training_metrics)
            recent_episodes = self.training_metrics[-10:]  # Son 10 episode
            
            recent_rewards = [m.total_reward for m in recent_episodes]
            recent_losses = [m.loss for m in recent_episodes]
            
            summary = {
                'total_episodes': total_episodes,
                'current_epsilon': self.epsilon,
                'recent_avg_reward': np.mean(recent_rewards),
                'recent_avg_loss': np.mean(recent_losses),
                'best_reward': max([m.total_reward for m in self.training_metrics]),
                'worst_reward': min([m.total_reward for m in self.training_metrics]),
                'training_progress': {
                    'episodes': [m.episode for m in self.training_metrics],
                    'rewards': [m.total_reward for m in self.training_metrics],
                    'losses': [m.loss for m in self.training_metrics],
                    'epsilons': [m.epsilon for m in self.training_metrics]
                }
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"❌ Get training summary error: {e}")
            return {}

# Global instance
dqn_agent = None

if __name__ == "__main__":
    async def test_dqn_agent():
        """Test fonksiyonu"""
        logger.info("🧪 Testing DQN Agent...")
        
        if not TORCH_AVAILABLE:
            logger.warning("⚠️ PyTorch not available - skipping test")
            return
        
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
        from rl_env import rl_environment_manager
        env = rl_environment_manager.create_environment("TEST", test_data)
        
        if env:
            # Agent oluştur
            state_size = env.observation_space.shape[0]
            action_size = env.action_space.n
            
            agent = DQNAgent(state_size, action_size)
            
            # Training
            for episode in range(5):
                summary = agent.train_episode(env, max_steps=100)
                logger.info(f"Episode {episode + 1}: {summary}")
            
            # Evaluation
            eval_results = agent.evaluate(env, num_episodes=3)
            logger.info(f"📈 Evaluation: {eval_results}")
            
            # Training summary
            training_summary = agent.get_training_summary()
            logger.info(f"📊 Training summary: {training_summary}")
        
        logger.info("✅ DQN Agent test completed")
    
    # Test çalıştır
    asyncio.run(test_dqn_agent())
