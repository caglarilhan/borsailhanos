#!/usr/bin/env python3
"""
Database Connection Pool Manager for BIST AI Smart Trader
AsyncPG connection pooling for PostgreSQL
"""

import asyncpg
import asyncio
import json
from typing import Any, Dict, List, Optional, Union
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Async PostgreSQL database manager with connection pooling"""
    
    def __init__(self, database_url: str = "postgresql://bist_user:bist_password@localhost:5432/bist_ai_trader"):
        self.database_url = database_url
        self.pool = None
        
    async def initialize(self, min_size: int = 5, max_size: int = 20):
        """Initialize connection pool"""
        try:
            self.pool = await asyncpg.create_pool(
                self.database_url,
                min_size=min_size,
                max_size=max_size,
                command_timeout=30,
                server_settings={
                    'application_name': 'bist_ai_trader',
                    'jit': 'off'  # Disable JIT for better performance on small queries
                }
            )
            
            # Test connection
            async with self.pool.acquire() as conn:
                await conn.fetchval('SELECT 1')
            
            logger.info(f"✅ Database pool initialized: {min_size}-{max_size} connections")
            
            # Create tables if they don't exist
            await self.create_tables()
            
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")
            self.pool = None
    
    async def close(self):
        """Close connection pool"""
        if self.pool:
            await self.pool.close()
            logger.info("🔒 Database pool closed")
    
    async def create_tables(self):
        """Create necessary tables"""
        if not self.pool:
            return
            
        try:
            async with self.pool.acquire() as conn:
                # Price data table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS price_data (
                        id SERIAL PRIMARY KEY,
                        symbol VARCHAR(20) NOT NULL,
                        timestamp TIMESTAMP NOT NULL,
                        open_price DECIMAL(10,4),
                        high_price DECIMAL(10,4),
                        low_price DECIMAL(10,4),
                        close_price DECIMAL(10,4),
                        volume BIGINT,
                        created_at TIMESTAMP DEFAULT NOW(),
                        UNIQUE(symbol, timestamp)
                    )
                """)
                
                # AI predictions table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS ai_predictions (
                        id SERIAL PRIMARY KEY,
                        symbol VARCHAR(20) NOT NULL,
                        model_name VARCHAR(50) NOT NULL,
                        prediction_type VARCHAR(20) NOT NULL,
                        prediction_value DECIMAL(10,6),
                        confidence DECIMAL(5,4),
                        features JSONB,
                        timestamp TIMESTAMP NOT NULL,
                        created_at TIMESTAMP DEFAULT NOW()
                    )
                """)
                
                # Trading signals table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS trading_signals (
                        id SERIAL PRIMARY KEY,
                        symbol VARCHAR(20) NOT NULL,
                        signal_type VARCHAR(10) NOT NULL, -- BUY, SELL, HOLD
                        confidence DECIMAL(5,4),
                        entry_price DECIMAL(10,4),
                        stop_loss DECIMAL(10,4),
                        take_profit DECIMAL(10,4),
                        risk_reward DECIMAL(5,2),
                        metadata JSONB,
                        timestamp TIMESTAMP NOT NULL,
                        created_at TIMESTAMP DEFAULT NOW()
                    )
                """)
                
                # Performance metrics table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS performance_metrics (
                        id SERIAL PRIMARY KEY,
                        symbol VARCHAR(20) NOT NULL,
                        metric_name VARCHAR(50) NOT NULL,
                        metric_value DECIMAL(10,6),
                        timeframe VARCHAR(10),
                        timestamp TIMESTAMP NOT NULL,
                        created_at TIMESTAMP DEFAULT NOW()
                    )
                """)
                
                # Model accuracy table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS model_accuracy (
                        id SERIAL PRIMARY KEY,
                        model_name VARCHAR(50) NOT NULL,
                        symbol VARCHAR(20) NOT NULL,
                        accuracy DECIMAL(5,4),
                        precision_score DECIMAL(5,4),
                        recall DECIMAL(5,4),
                        f1_score DECIMAL(5,4),
                        total_predictions INTEGER,
                        correct_predictions INTEGER,
                        period_start TIMESTAMP,
                        period_end TIMESTAMP,
                        created_at TIMESTAMP DEFAULT NOW()
                    )
                """)
                
                # Create indexes for better performance
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_price_data_symbol_timestamp ON price_data(symbol, timestamp)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_ai_predictions_symbol_model ON ai_predictions(symbol, model_name)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_trading_signals_symbol_timestamp ON trading_signals(symbol, timestamp)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_performance_metrics_symbol_metric ON performance_metrics(symbol, metric_name)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_model_accuracy_model_symbol ON model_accuracy(model_name, symbol)")
                
                logger.info("✅ Database tables created/verified")
                
        except Exception as e:
            logger.error(f"Database table creation error: {e}")
    
    async def execute_query(self, query: str, *args) -> Any:
        """Execute a single query"""
        if not self.pool:
            raise RuntimeError("Database pool not initialized")
            
        async with self.pool.acquire() as conn:
            return await conn.fetchval(query, *args)
    
    async def fetch_one(self, query: str, *args) -> Optional[Dict]:
        """Fetch single row"""
        if not self.pool:
            return None
            
        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow(query, *args)
                return dict(row) if row else None
        except Exception as e:
            logger.error(f"Database fetch_one error: {e}")
            return None
    
    async def fetch_all(self, query: str, *args) -> List[Dict]:
        """Fetch multiple rows"""
        if not self.pool:
            return []
            
        try:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch(query, *args)
                return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"Database fetch_all error: {e}")
            return []
    
    async def execute(self, query: str, *args) -> str:
        """Execute query without return"""
        if not self.pool:
            raise RuntimeError("Database pool not initialized")
            
        async with self.pool.acquire() as conn:
            return await conn.execute(query, *args)
    
    async def execute_many(self, query: str, args_list: List[tuple]) -> None:
        """Execute query multiple times"""
        if not self.pool:
            raise RuntimeError("Database pool not initialized")
            
        async with self.pool.acquire() as conn:
            await conn.executemany(query, args_list)
    
    # Data access methods
    async def save_price_data(self, symbol: str, timestamp: datetime, open_price: float, 
                             high_price: float, low_price: float, close_price: float, volume: int):
        """Save price data"""
        query = """
            INSERT INTO price_data (symbol, timestamp, open_price, high_price, low_price, close_price, volume)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (symbol, timestamp) DO UPDATE SET
                open_price = EXCLUDED.open_price,
                high_price = EXCLUDED.high_price,
                low_price = EXCLUDED.low_price,
                close_price = EXCLUDED.close_price,
                volume = EXCLUDED.volume
        """
        await self.execute(query, symbol, timestamp, open_price, high_price, low_price, close_price, volume)
    
    async def get_price_data(self, symbol: str, start_time: datetime, end_time: datetime) -> List[Dict]:
        """Get price data for symbol within time range"""
        query = """
            SELECT * FROM price_data 
            WHERE symbol = $1 AND timestamp BETWEEN $2 AND $3
            ORDER BY timestamp ASC
        """
        return await self.fetch_all(query, symbol, start_time, end_time)
    
    async def save_ai_prediction(self, symbol: str, model_name: str, prediction_type: str, 
                                prediction_value: float, confidence: float, features: Dict, timestamp: datetime):
        """Save AI prediction"""
        query = """
            INSERT INTO ai_predictions (symbol, model_name, prediction_type, prediction_value, confidence, features, timestamp)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        """
        await self.execute(query, symbol, model_name, prediction_type, prediction_value, confidence, json.dumps(features), timestamp)
    
    async def get_ai_predictions(self, symbol: str, model_name: str, limit: int = 100) -> List[Dict]:
        """Get recent AI predictions"""
        query = """
            SELECT * FROM ai_predictions 
            WHERE symbol = $1 AND model_name = $2
            ORDER BY timestamp DESC LIMIT $3
        """
        return await self.fetch_all(query, symbol, model_name, limit)
    
    async def save_trading_signal(self, symbol: str, signal_type: str, confidence: float,
                                 entry_price: float, stop_loss: Optional[float] = None,
                                 take_profit: Optional[float] = None, risk_reward: Optional[float] = None,
                                 metadata: Optional[Dict] = None, timestamp: Optional[datetime] = None):
        """Save trading signal"""
        if timestamp is None:
            timestamp = datetime.now()
            
        query = """
            INSERT INTO trading_signals (symbol, signal_type, confidence, entry_price, stop_loss, take_profit, risk_reward, metadata, timestamp)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        """
        await self.execute(query, symbol, signal_type, confidence, entry_price, stop_loss, take_profit, 
                          risk_reward, json.dumps(metadata) if metadata else None, timestamp)
    
    async def get_trading_signals(self, symbol: str, limit: int = 50) -> List[Dict]:
        """Get recent trading signals"""
        query = """
            SELECT * FROM trading_signals 
            WHERE symbol = $1
            ORDER BY timestamp DESC LIMIT $2
        """
        return await self.fetch_all(query, symbol, limit)
    
    async def save_performance_metric(self, symbol: str, metric_name: str, metric_value: float,
                                     timeframe: str, timestamp: Optional[datetime] = None):
        """Save performance metric"""
        if timestamp is None:
            timestamp = datetime.now()
            
        query = """
            INSERT INTO performance_metrics (symbol, metric_name, metric_value, timeframe, timestamp)
            VALUES ($1, $2, $3, $4, $5)
        """
        await self.execute(query, symbol, metric_name, metric_value, timeframe, timestamp)
    
    async def get_performance_metrics(self, symbol: str, metric_name: str, timeframe: str, limit: int = 100) -> List[Dict]:
        """Get performance metrics"""
        query = """
            SELECT * FROM performance_metrics 
            WHERE symbol = $1 AND metric_name = $2 AND timeframe = $3
            ORDER BY timestamp DESC LIMIT $4
        """
        return await self.fetch_all(query, symbol, metric_name, timeframe, limit)
    
    async def save_model_accuracy(self, model_name: str, symbol: str, accuracy: float,
                                 precision_score: float, recall: float, f1_score: float,
                                 total_predictions: int, correct_predictions: int,
                                 period_start: datetime, period_end: datetime):
        """Save model accuracy metrics"""
        query = """
            INSERT INTO model_accuracy (model_name, symbol, accuracy, precision_score, recall, f1_score,
                                      total_predictions, correct_predictions, period_start, period_end)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        """
        await self.execute(query, model_name, symbol, accuracy, precision_score, recall, f1_score,
                          total_predictions, correct_predictions, period_start, period_end)
    
    async def get_model_accuracy(self, model_name: str, symbol: Optional[str] = None) -> List[Dict]:
        """Get model accuracy metrics"""
        if symbol:
            query = "SELECT * FROM model_accuracy WHERE model_name = $1 AND symbol = $2 ORDER BY created_at DESC"
            return await self.fetch_all(query, model_name, symbol)
        else:
            query = "SELECT * FROM model_accuracy WHERE model_name = $1 ORDER BY created_at DESC"
            return await self.fetch_all(query, model_name)
    
    async def get_pool_stats(self) -> Dict[str, Any]:
        """Get connection pool statistics"""
        if not self.pool:
            return {"status": "disconnected"}
            
        return {
            "status": "connected",
            "size": self.pool.get_size(),
            "min_size": self.pool.get_min_size(),
            "max_size": self.pool.get_max_size(),
            "idle_connections": self.pool.get_idle_size(),
            "busy_connections": self.pool.get_size() - self.pool.get_idle_size()
        }

# Global database instance
db_manager = DatabaseManager()

async def initialize_database(database_url: str = None, min_size: int = 5, max_size: int = 20):
    """Initialize global database manager"""
    if database_url:
        db_manager.database_url = database_url
    await db_manager.initialize(min_size, max_size)

async def close_database():
    """Close global database manager"""
    await db_manager.close()

# Usage examples
"""
# Initialize
await initialize_database()

# Save price data
await db_manager.save_price_data("SISE.IS", datetime.now(), 25.0, 25.5, 24.8, 25.2, 1000000)

# Get price data
prices = await db_manager.get_price_data("SISE.IS", datetime.now() - timedelta(days=1), datetime.now())

# Save AI prediction
await db_manager.save_ai_prediction("SISE.IS", "lightgbm", "direction", 0.85, 0.92, {"rsi": 65}, datetime.now())

# Get AI predictions
predictions = await db_manager.get_ai_predictions("SISE.IS", "lightgbm")
"""
