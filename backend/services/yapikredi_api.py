#!/usr/bin/env python3
"""
Yapı Kredi Bankası API entegrasyonu
BIST endeksleri ve hisse bilgileri için
"""

import requests
import asyncio
import aiohttp
from datetime import datetime
from typing import Dict, List, Optional, Any
import logging

class YapiKrediAPI:
    def __init__(self):
        self.base_url = "https://api.yapikredi.com.tr/api/stockmarket/v1"
        self.session = None
        self.logger = logging.getLogger(__name__)
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def get_bist_indices(self) -> Dict[str, Any]:
        """BIST endekslerini getir"""
        try:
            url = f"{self.base_url}/bistIndices"
            
            if self.session:
                async with self.session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "success": True,
                            "data": data,
                            "timestamp": datetime.now().isoformat()
                        }
                    else:
                        return {
                            "success": False,
                            "error": f"HTTP {response.status}",
                            "timestamp": datetime.now().isoformat()
                        }
            else:
                # Fallback için sync request
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    return {
                        "success": True,
                        "data": response.json(),
                        "timestamp": datetime.now().isoformat()
                    }
                else:
                    return {
                        "success": False,
                        "error": f"HTTP {response.status_code}",
                        "timestamp": datetime.now().isoformat()
                    }
                    
        except Exception as e:
            self.logger.error(f"BIST indices API hatası: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def get_stock_information(self, symbol: str = None) -> Dict[str, Any]:
        """Hisse bilgilerini getir"""
        try:
            url = f"{self.base_url}/stockInformation"
            params = {}
            
            if symbol:
                params['symbol'] = symbol
                
            if self.session:
                async with self.session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "success": True,
                            "data": data,
                            "symbol": symbol,
                            "timestamp": datetime.now().isoformat()
                        }
                    else:
                        return {
                            "success": False,
                            "error": f"HTTP {response.status}",
                            "symbol": symbol,
                            "timestamp": datetime.now().isoformat()
                        }
            else:
                # Fallback için sync request
                response = requests.get(url, params=params, timeout=10)
                if response.status_code == 200:
                    return {
                        "success": True,
                        "data": response.json(),
                        "symbol": symbol,
                        "timestamp": datetime.now().isoformat()
                    }
                else:
                    return {
                        "success": False,
                        "error": f"HTTP {response.status_code}",
                        "symbol": symbol,
                        "timestamp": datetime.now().isoformat()
                    }
                    
        except Exception as e:
            self.logger.error(f"Stock information API hatası: {e}")
            return {
                "success": False,
                "error": str(e),
                "symbol": symbol,
                "timestamp": datetime.now().isoformat()
            }
    
    def get_bist_indices_sync(self) -> Dict[str, Any]:
        """Sync versiyon - BIST endekslerini getir"""
        try:
            url = f"{self.base_url}/bistIndices"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "data": response.json(),
                    "timestamp": datetime.now().isoformat()
                }
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}",
                    "timestamp": datetime.now().isoformat()
                }
                
        except Exception as e:
            self.logger.error(f"BIST indices sync API hatası: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def get_stock_information_sync(self, symbol: str = None) -> Dict[str, Any]:
        """Sync versiyon - Hisse bilgilerini getir"""
        try:
            url = f"{self.base_url}/stockInformation"
            params = {}
            
            if symbol:
                params['symbol'] = symbol
                
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "data": response.json(),
                    "symbol": symbol,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}",
                    "symbol": symbol,
                    "timestamp": datetime.now().isoformat()
                }
                
        except Exception as e:
            self.logger.error(f"Stock information sync API hatası: {e}")
            return {
                "success": False,
                "error": str(e),
                "symbol": symbol,
                "timestamp": datetime.now().isoformat()
            }

# Global instance
yapikredi_api = YapiKrediAPI()
