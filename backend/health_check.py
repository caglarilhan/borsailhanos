#!/usr/bin/env python3
"""
BIST AI Smart Trader - Health Check Service
Comprehensive health monitoring for all system components
"""

import asyncio
import aiohttp
import psutil
import time
import logging
from datetime import datetime
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HealthChecker:
    def __init__(self):
        self.app = FastAPI(title="BIST AI Health Check Service")
        self.start_time = time.time()
        
        # CORS middleware
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        # Health endpoints
        self.app.get("/api/health")(self.health_check)
        self.app.get("/api/health/detailed")(self.detailed_health_check)
        self.app.get("/api/health/services")(self.services_health_check)
        self.app.get("/api/health/metrics")(self.metrics_health_check)
        
        logger.info("🏥 Health Check Service initialized")

    async def check_database(self) -> Dict[str, Any]:
        """Check database connectivity"""
        try:
            # Try to connect to database
            import sqlite3
            conn = sqlite3.connect('bist_ai.db')
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            conn.close()
            
            return {
                "status": "healthy",
                "response_time": 0.001,
                "error": None
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "response_time": 0,
                "error": str(e)
            }

    async def check_realtime_server(self) -> Dict[str, Any]:
        """Check realtime server connectivity"""
        try:
            async with aiohttp.ClientSession() as session:
                start_time = time.time()
                async with session.get('http://localhost:8081/api/health', timeout=5) as response:
                    response_time = time.time() - start_time
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "status": "healthy",
                            "response_time": response_time,
                            "connected_clients": data.get("connected_clients", 0),
                            "error": None
                        }
                    else:
                        return {
                            "status": "unhealthy",
                            "response_time": response_time,
                            "error": f"HTTP {response.status}"
                        }
        except Exception as e:
            return {
                "status": "unhealthy",
                "response_time": 0,
                "error": str(e)
            }

    async def check_ai_models(self) -> Dict[str, Any]:
        """Check AI models availability"""
        try:
            import os
            model_path = "./ai/models/"
            
            if not os.path.exists(model_path):
                return {
                    "status": "unhealthy",
                    "response_time": 0,
                    "error": "Model directory not found"
                }
            
            # Check for model files
            model_files = [f for f in os.listdir(model_path) if f.endswith(('.pkl', '.joblib', '.h5', '.pt'))]
            
            if len(model_files) == 0:
                return {
                    "status": "warning",
                    "response_time": 0,
                    "error": "No model files found",
                    "model_count": 0
                }
            
            return {
                "status": "healthy",
                "response_time": 0.001,
                "model_count": len(model_files),
                "models": model_files[:5],  # Show first 5 models
                "error": None
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "response_time": 0,
                "error": str(e)
            }

    async def check_external_apis(self) -> Dict[str, Any]:
        """Check external API connectivity"""
        apis = {
            "yfinance": "https://finance.yahoo.com",
            "finnhub": "https://finnhub.io/api/v1",
            "news_api": "https://newsapi.org/v2"
        }
        
        results = {}
        
        for api_name, api_url in apis.items():
            try:
                async with aiohttp.ClientSession() as session:
                    start_time = time.time()
                    async with session.get(api_url, timeout=5) as response:
                        response_time = time.time() - start_time
                        results[api_name] = {
                            "status": "healthy" if response.status < 400 else "warning",
                            "response_time": response_time,
                            "http_status": response.status,
                            "error": None
                        }
            except Exception as e:
                results[api_name] = {
                    "status": "unhealthy",
                    "response_time": 0,
                    "error": str(e)
                }
        
        return results

    async def get_system_metrics(self) -> Dict[str, Any]:
        """Get system performance metrics"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                "cpu_usage": cpu_percent,
                "memory_usage": memory.percent,
                "memory_available": memory.available,
                "disk_usage": disk.percent,
                "disk_free": disk.free,
                "uptime": time.time() - self.start_time
            }
        except Exception as e:
            return {
                "error": str(e),
                "uptime": time.time() - self.start_time
            }

    async def health_check(self):
        """Basic health check endpoint"""
        try:
            # Quick checks
            database_status = await self.check_database()
            realtime_status = await self.check_realtime_server()
            
            overall_status = "healthy"
            if database_status["status"] != "healthy" or realtime_status["status"] != "healthy":
                overall_status = "unhealthy"
            
            return {
                "status": overall_status,
                "timestamp": datetime.now().isoformat(),
                "uptime": time.time() - self.start_time,
                "services": {
                    "database": database_status["status"],
                    "realtime": realtime_status["status"]
                }
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def detailed_health_check(self):
        """Detailed health check with all components"""
        try:
            # Run all checks in parallel
            database_status = await self.check_database()
            realtime_status = await self.check_realtime_server()
            ai_models_status = await self.check_ai_models()
            external_apis_status = await self.check_external_apis()
            system_metrics = await self.get_system_metrics()
            
            # Determine overall status
            service_statuses = [
                database_status["status"],
                realtime_status["status"],
                ai_models_status["status"]
            ]
            
            if "unhealthy" in service_statuses:
                overall_status = "unhealthy"
            elif "warning" in service_statuses:
                overall_status = "warning"
            else:
                overall_status = "healthy"
            
            return {
                "status": overall_status,
                "timestamp": datetime.now().isoformat(),
                "uptime": time.time() - self.start_time,
                "services": {
                    "database": database_status,
                    "realtime": realtime_status,
                    "ai_models": ai_models_status,
                    "external_apis": external_apis_status
                },
                "system_metrics": system_metrics
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def services_health_check(self):
        """Check individual services"""
        try:
            services = {}
            
            # Database
            services["database"] = await self.check_database()
            
            # Realtime Server
            services["realtime"] = await self.check_realtime_server()
            
            # AI Models
            services["ai_models"] = await self.check_ai_models()
            
            # External APIs
            services["external_apis"] = await self.check_external_apis()
            
            return {
                "timestamp": datetime.now().isoformat(),
                "services": services
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def metrics_health_check(self):
        """Get system metrics"""
        try:
            metrics = await self.get_system_metrics()
            
            return {
                "timestamp": datetime.now().isoformat(),
                "metrics": metrics
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def start(self):
        """Start the health check service"""
        logger.info("🏥 Starting Health Check Service on port 8001")
        
        uvicorn.run(
            self.app,
            host="0.0.0.0",
            port=8001,
            log_level="info"
        )

if __name__ == "__main__":
    health_checker = HealthChecker()
    health_checker.start()
