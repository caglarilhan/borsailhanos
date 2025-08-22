#!/usr/bin/env python3
"""
Redis Cache Manager for BIST AI Smart Trader
High-performance caching with async support
"""

import redis.asyncio as redis
import os
import json
import logging
from typing import Any, Callable, Optional
from functools import wraps

logger = logging.getLogger(__name__)

class CacheManager:
    def __init__(self):
        self._redis: Optional[redis.Redis] = None
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    async def connect(self):
        if self._redis is None:
            try:
                self._redis = redis.from_url(self.redis_url, decode_responses=True)
                await self._redis.ping()
                logger.info("✅ Redis cache bağlantısı başarılı.")
            except Exception as e:
                logger.error(f"❌ Redis cache bağlantı hatası: {e}")
                self._redis = None

    async def disconnect(self):
        if self._redis:
            await self._redis.close()
            self._redis = None
            logger.info("🛑 Redis cache bağlantısı kapatıldı.")

    async def get(self, key: str) -> Optional[Any]:
        if not self._redis:
            return None
        try:
            value = await self._redis.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Cache get hatası for key {key}: {e}")
            return None

    async def set(self, key: str, value: Any, ex: int = 300): # ex: expiration in seconds
        if not self._redis:
            return
        try:
            await self._redis.set(key, json.dumps(value), ex=ex)
        except Exception as e:
            logger.error(f"Cache set hatası for key {key}: {e}")

    async def delete(self, key: str):
        if not self._redis:
            return
        try:
            await self._redis.delete(key)
        except Exception as e:
            logger.error(f"Cache delete hatası for key {key}: {e}")

    async def get_stats(self) -> dict:
        if not self._redis:
            return {"status": "disconnected", "error": "Redis client not initialized"}
        try:
            info = await self._redis.info()
            return {
                "status": "connected",
                "uptime_in_seconds": info.get("uptime_in_seconds"),
                "connected_clients": info.get("connected_clients"),
                "used_memory_human": info.get("used_memory_human"),
                "total_keys": info.get("db0", {}).get("keys"),
                "hits": info.get("keyspace_hits"),
                "misses": info.get("keyspace_misses"),
                "hit_rate": info.get("keyspace_hits", 0) / (info.get("keyspace_hits", 0) + info.get("keyspace_misses", 0)) if (info.get("keyspace_hits", 0) + info.get("keyspace_misses", 0)) > 0 else 0
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}

cache_manager = CacheManager()

async def initialize_cache():
    await cache_manager.connect()

async def close_cache():
    await cache_manager.disconnect()

def cached_ops(ex: int = 300):
    """Decorator to cache the results of an async function."""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Create a cache key from function name and arguments
            # Simple serialization for demonstration
            key_parts = [func.__name__] + [str(arg) for arg in args] + [f"{k}={v}" for k, v in kwargs.items()]
            cache_key = ":".join(key_parts)

            cached_result = await cache_manager.get(cache_key)
            if cached_result:
                logger.debug(f"Cache hit for {cache_key}")
                return cached_result
            
            logger.debug(f"Cache miss for {cache_key}, executing function...")
            result = await func(*args, **kwargs)
            await cache_manager.set(cache_key, result, ex=ex)
            return result
        return wrapper
    return decorator

# Example usage (not directly in FastAPI_main, but for other modules)
async def cache_result(key: str, data: Any, ex: int = 300):
    await cache_manager.set(key, data, ex)

async def get_cached_result(key: str) -> Optional[Any]:
    return await cache_manager.get(key)
