"""
🚀 BIST AI Smart Trader - RL Trainer
====================================

Reinforcement Learning ajanını eğiten sistem.
Geçmiş veride ajanı eğitir, Q-tablosu/model ağı kaydeder.

Özellikler:
- DQN training
- Experience replay
- Target network updates
- Training progress tracking
- Model checkpointing
- Performance monitoring
"""

import asyncio
import json
import logging
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
from collections import deque
import random

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class TrainingConfig:
    """Training configuration"""
    episodes: int = 1000
    max_steps_per_episode: int = 1000
    learning_rate: float = 0.001
    gamma: float = 0.95
    epsilon_start: float = 1.0
    epsilon_end: float = 0.01
    epsilon_decay: float = 0.995
    batch_size: int = 32
    memory_size: int = 10000
    target_update_frequency: int = 100
    save_frequency: int = 50
    device: str = 'cpu'

@dataclass
class TrainingMetrics:
    """Training metrics"""
    episode: int
    total_reward: float
    average_reward: float
    epsilon: float
    loss: float
    q_values: List[float]
    steps: int
    timestamp: datetime
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data

class DQNNetwork(nn.Module):
    """Deep Q-Network"""
    
    def __init__(self, input_size: int, hidden_size: int, output_size: int):
        super(DQNNetwork, self).__init__()
        
        self.network = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            nn.ReLU(),
            nn.Linear(hidden_size, hidden_size),
            nn.ReLU(),
            nn.Linear(hidden_size, hidden_size),
            nn.ReLU(),
            nn.Linear(hidden_size, output_size)
        )
    
    def forward(self, x):
        return self.network(x)

class ExperienceReplay:
    """Experience Replay Buffer"""
    
    def __init__(self, capacity: int):
        self.buffer = deque(maxlen=capacity)
    
    def push(self, state, action, reward, next_state, done):
        """Add experience to buffer"""
        self.buffer.append((state, action, reward, next_state, done))
    
    def sample(self, batch_size: int):
        """Sample batch from buffer"""
        return random.sample(self.buffer, batch_size)
    
    def __len__(self):
        return len(self.buffer)

class RLTrainer:
    """RL Trainer"""
    
    def __init__(self, 
                 config: TrainingConfig,
                 data_dir: str = "backend/ai/data"):
        self.config = config
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Training state
        self.episode = 0
        self.epsilon = config.epsilon_start
        self.training_metrics = []
        
        # Networks
        self.device = torch.device(config.device)
        self.q_network = None
        self.target_network = None
        self.optimizer = None
        
        # Experience replay
        self.memory = ExperienceReplay(config.memory_size)
        
        # Training history
        self.training_history = []
        
        logger.info("✅ RL Trainer initialized")
    
    def initialize_networks(self, input_size: int, output_size: int):
        """Initialize neural networks"""
        try:
            hidden_size = 128
            
            # Q-Network
            self.q_network = DQNNetwork(input_size, hidden_size, output_size).to(self.device)
            self.target_network = DQNNetwork(input_size, hidden_size, output_size).to(self.device)
            
            # Copy weights to target network
            self.target_network.load_state_dict(self.q_network.state_dict())
            
            # Optimizer
            self.optimizer = optim.Adam(self.q_network.parameters(), lr=self.config.learning_rate)
            
            logger.info(f"✅ Networks initialized (input: {input_size}, output: {output_size})")
            
        except Exception as e:
            logger.error(f"❌ Initialize networks error: {e}")
            raise
    
    def select_action(self, state: np.ndarray) -> int:
        """Action selection with epsilon-greedy"""
        try:
            if random.random() < self.epsilon:
                # Random action
                return random.randint(0, 2)  # 0: hold, 1: buy, 2: sell
            
            # Greedy action
            state_tensor = torch.FloatTensor(state).unsqueeze(0).to(self.device)
            q_values = self.q_network(state_tensor)
            action = q_values.argmax().item()
            
            return action
            
        except Exception as e:
            logger.error(f"❌ Select action error: {e}")
            return 0  # Default to hold
    
    def store_experience(self, state, action, reward, next_state, done):
        """Store experience in replay buffer"""
        try:
            self.memory.push(state, action, reward, next_state, done)
        except Exception as e:
            logger.error(f"❌ Store experience error: {e}")
    
    def train_step(self) -> float:
        """Single training step"""
        try:
            if len(self.memory) < self.config.batch_size:
                return 0.0
            
            # Sample batch
            batch = self.memory.sample(self.config.batch_size)
            states, actions, rewards, next_states, dones = zip(*batch)
            
            # Convert to tensors
            states = torch.FloatTensor(states).to(self.device)
            actions = torch.LongTensor(actions).to(self.device)
            rewards = torch.FloatTensor(rewards).to(self.device)
            next_states = torch.FloatTensor(next_states).to(self.device)
            dones = torch.BoolTensor(dones).to(self.device)
            
            # Current Q values
            current_q_values = self.q_network(states).gather(1, actions.unsqueeze(1))
            
            # Next Q values from target network
            next_q_values = self.target_network(next_states).max(1)[0].detach()
            target_q_values = rewards + (self.config.gamma * next_q_values * ~dones)
            
            # Loss
            loss = nn.MSELoss()(current_q_values.squeeze(), target_q_values)
            
            # Backward pass
            self.optimizer.zero_grad()
            loss.backward()
            self.optimizer.step()
            
            return loss.item()
            
        except Exception as e:
            logger.error(f"❌ Train step error: {e}")
            return 0.0
    
    def update_target_network(self):
        """Update target network"""
        try:
            self.target_network.load_state_dict(self.q_network.state_dict())
        except Exception as e:
            logger.error(f"❌ Update target network error: {e}")
    
    def decay_epsilon(self):
        """Decay epsilon"""
        self.epsilon = max(self.config.epsilon_end, 
                         self.epsilon * self.config.epsilon_decay)
    
    async def train_episode(self, env) -> TrainingMetrics:
        """Train single episode"""
        try:
            state = env.reset()
            total_reward = 0
            steps = 0
            episode_losses = []
            episode_q_values = []
            
            for step in range(self.config.max_steps_per_episode):
                # Select action
                action = self.select_action(state)
                
                # Take action
                next_state, reward, done, info = env.step(action)
                
                # Store experience
                self.store_experience(state, action, reward, next_state, done)
                
                # Train
                loss = self.train_step()
                episode_losses.append(loss)
                
                # Get Q values for logging
                state_tensor = torch.FloatTensor(state).unsqueeze(0).to(self.device)
                q_values = self.q_network(state_tensor).detach().cpu().numpy()
                episode_q_values.append(q_values.tolist())
                
                # Update state
                state = next_state
                total_reward += reward
                steps += 1
                
                if done:
                    break
            
            # Update target network
            if self.episode % self.config.target_update_frequency == 0:
                self.update_target_network()
            
            # Decay epsilon
            self.decay_epsilon()
            
            # Create metrics
            metrics = TrainingMetrics(
                episode=self.episode,
                total_reward=total_reward,
                average_reward=total_reward / max(steps, 1),
                epsilon=self.epsilon,
                loss=np.mean(episode_losses) if episode_losses else 0.0,
                q_values=episode_q_values[-1] if episode_q_values else [0, 0, 0],
                steps=steps,
                timestamp=datetime.now()
            )
            
            self.training_metrics.append(metrics)
            self.episode += 1
            
            return metrics
            
        except Exception as e:
            logger.error(f"❌ Train episode error: {e}")
            return TrainingMetrics(
                episode=self.episode,
                total_reward=0.0,
                average_reward=0.0,
                epsilon=self.epsilon,
                loss=0.0,
                q_values=[0, 0, 0],
                steps=0,
                timestamp=datetime.now()
            )
    
    async def train(self, env) -> List[TrainingMetrics]:
        """Full training loop"""
        try:
            logger.info(f"🚀 Starting RL training for {self.config.episodes} episodes...")
            
            # Initialize networks
            state_size = env.observation_space.shape[0]
            action_size = env.action_space.n
            self.initialize_networks(state_size, action_size)
            
            # Training loop
            for episode in range(self.config.episodes):
                metrics = await self.train_episode(env)
                
                # Log progress
                if episode % 10 == 0:
                    logger.info(f"Episode {episode}: Reward={metrics.total_reward:.2f}, "
                              f"Epsilon={metrics.epsilon:.3f}, Loss={metrics.loss:.4f}")
                
                # Save checkpoint
                if episode % self.config.save_frequency == 0:
                    await self.save_checkpoint(episode)
                
                # Early stopping
                if len(self.training_metrics) >= 100:
                    recent_rewards = [m.total_reward for m in self.training_metrics[-100:]]
                    if np.mean(recent_rewards) > 1000:  # Good performance threshold
                        logger.info(f"🎯 Early stopping at episode {episode}")
                        break
            
            # Final save
            await self.save_checkpoint(self.episode, final=True)
            
            logger.info("✅ RL training completed")
            
            return self.training_metrics
            
        except Exception as e:
            logger.error(f"❌ Training error: {e}")
            return []
    
    async def save_checkpoint(self, episode: int, final: bool = False):
        """Save training checkpoint"""
        try:
            checkpoint_dir = self.data_dir / "checkpoints"
            checkpoint_dir.mkdir(parents=True, exist_ok=True)
            
            # Model state
            model_state = {
                'episode': episode,
                'q_network_state_dict': self.q_network.state_dict(),
                'target_network_state_dict': self.target_network.state_dict(),
                'optimizer_state_dict': self.optimizer.state_dict(),
                'epsilon': self.epsilon,
                'config': asdict(self.config)
            }
            
            # Save model
            model_file = checkpoint_dir / f"model_episode_{episode}.pth"
            torch.save(model_state, model_file)
            
            # Save training metrics
            metrics_file = checkpoint_dir / f"metrics_episode_{episode}.json"
            with open(metrics_file, 'w') as f:
                json.dump([m.to_dict() for m in self.training_metrics], f, indent=2)
            
            if final:
                # Save final model
                final_model_file = checkpoint_dir / "final_model.pth"
                torch.save(model_state, final_model_file)
                
                logger.info(f"💾 Final model saved: {final_model_file}")
            
            logger.info(f"💾 Checkpoint saved: episode {episode}")
            
        except Exception as e:
            logger.error(f"❌ Save checkpoint error: {e}")
    
    async def load_checkpoint(self, checkpoint_file: str):
        """Load training checkpoint"""
        try:
            checkpoint = torch.load(checkpoint_file, map_location=self.device)
            
            # Load model state
            self.q_network.load_state_dict(checkpoint['q_network_state_dict'])
            self.target_network.load_state_dict(checkpoint['target_network_state_dict'])
            self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
            
            # Load training state
            self.episode = checkpoint['episode']
            self.epsilon = checkpoint['epsilon']
            
            logger.info(f"✅ Checkpoint loaded: episode {self.episode}")
            
        except Exception as e:
            logger.error(f"❌ Load checkpoint error: {e}")
    
    def get_training_progress(self) -> Dict[str, Any]:
        """Get training progress"""
        try:
            if not self.training_metrics:
                return {
                    'episode': 0,
                    'average_reward': 0.0,
                    'epsilon': self.config.epsilon_start,
                    'loss': 0.0,
                    'progress_percentage': 0.0
                }
            
            latest_metrics = self.training_metrics[-1]
            
            return {
                'episode': latest_metrics.episode,
                'average_reward': latest_metrics.average_reward,
                'epsilon': latest_metrics.epsilon,
                'loss': latest_metrics.loss,
                'progress_percentage': (latest_metrics.episode / self.config.episodes) * 100,
                'total_episodes': self.config.episodes
            }
            
        except Exception as e:
            logger.error(f"❌ Get training progress error: {e}")
            return {}
    
    def get_training_statistics(self) -> Dict[str, Any]:
        """Get training statistics"""
        try:
            if not self.training_metrics:
                return {}
            
            rewards = [m.total_reward for m in self.training_metrics]
            losses = [m.loss for m in self.training_metrics]
            epsilons = [m.epsilon for m in self.training_metrics]
            
            return {
                'total_episodes': len(self.training_metrics),
                'average_reward': np.mean(rewards),
                'max_reward': np.max(rewards),
                'min_reward': np.min(rewards),
                'average_loss': np.mean(losses),
                'final_epsilon': epsilons[-1],
                'training_time': (self.training_metrics[-1].timestamp - self.training_metrics[0].timestamp).total_seconds()
            }
            
        except Exception as e:
            logger.error(f"❌ Get training statistics error: {e}")
            return {}

# Global instance
rl_trainer = RLTrainer(TrainingConfig())

if __name__ == "__main__":
    async def test_rl_trainer():
        """Test RL Trainer"""
        logger.info("🧪 Testing RL Trainer...")
        
        # Mock environment for testing
        class MockEnv:
            def __init__(self):
                self.observation_space = type('Space', (), {'shape': (10,)})()
                self.action_space = type('Space', (), {'n': 3})()
            
            def reset(self):
                return np.random.randn(10)
            
            def step(self, action):
                next_state = np.random.randn(10)
                reward = np.random.randn()
                done = np.random.random() < 0.1
                info = {}
                return next_state, reward, done, info
        
        # Test training
        env = MockEnv()
        config = TrainingConfig(episodes=10, max_steps_per_episode=50)
        trainer = RLTrainer(config)
        
        # Train
        metrics = await trainer.train(env)
        
        logger.info(f"✅ Training completed: {len(metrics)} episodes")
        
        # Get statistics
        stats = trainer.get_training_statistics()
        logger.info(f"📊 Training statistics: {stats}")
        
        logger.info("✅ RL Trainer test completed")
    
    # Test çalıştır
    asyncio.run(test_rl_trainer())
