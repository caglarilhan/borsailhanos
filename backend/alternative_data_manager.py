#!/usr/bin/env python3
"""
🚀 Alternative Data Manager - SPRINT 1
BIST AI Smart Trader v2.0 - %80+ Doğruluk Hedefi
"""

import asyncio
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
import pandas as pd
import numpy as np
import yfinance as yf
import requests
import json
import os
from dataclasses import dataclass

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AlternativeDataConfig:
    """Alternative data konfigürasyonu"""
    finnhub_api_key: str = ""
    yahoo_fallback: bool = True
    kap_oda_enabled: bool = True
    news_sentiment_enabled: bool = True
    cache_duration: int = 300  # 5 dakika
    max_retries: int = 3
    timeout: int = 10

@dataclass
class BISTStockData:
    """BIST hisse verisi"""
    symbol: str
    price: float
    volume: int
    market_cap: float
    pe_ratio: float
    pb_ratio: float
    dividend_yield: float
    sector: str
    industry: str
    timestamp: datetime
    data_source: str
    confidence: float

class FinnhubDataProvider:
    """Finnhub API veri sağlayıcısı"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://finnhub.io/api/v1"
        self.session = requests.Session()
        self.session.headers.update({
            'X-Finnhub-Token': api_key,
            'User-Agent': 'BIST-AI-Trader/2.0'
        })
    
    async def get_stock_quote(self, symbol: str) -> Optional[Dict]:
        """Hisse fiyat bilgisi"""
        try:
            if not symbol.endswith('.IS'):
                symbol = f"{symbol}.IS"
            
            url = f"{self.base_url}/quote"
            params = {'symbol': symbol}
            
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if data.get('c', 0) > 0:
                return {
                    'symbol': symbol,
                    'price': data.get('c', 0),
                    'change': data.get('d', 0),
                    'change_percent': data.get('dp', 0),
                    'high': data.get('h', 0),
                    'low': data.get('l', 0),
                    'open': data.get('o', 0),
                    'previous_close': data.get('pc', 0),
                    'volume': data.get('v', 0),
                    'timestamp': datetime.now()
                }
            return None
            
        except Exception as e:
            logger.warning(f"Finnhub quote hatası {symbol}: {e}")
            return None

class YahooFinanceFallback:
    """Yahoo Finance fallback veri sağlayıcısı"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'BIST-AI-Trader/2.0'
        })
    
    async def get_stock_data(self, symbol: str, period: str = "1d") -> Optional[pd.DataFrame]:
        """Yahoo Finance'den hisse verisi"""
        try:
            if not symbol.endswith('.IS'):
                symbol = f"{symbol}.IS"
            
            # Async olmayan yfinance'i async wrapper ile sarmalayalım
            loop = asyncio.get_event_loop()
            ticker = await loop.run_in_executor(None, yf.Ticker, symbol)
            data = await loop.run_in_executor(None, ticker.history, period)
            
            if not data.empty:
                return data
            return None
            
        except Exception as e:
            logger.warning(f"Yahoo Finance hatası {symbol}: {e}")
            return None
    
    async def get_stock_info(self, symbol: str) -> Optional[Dict]:
        """Yahoo Finance'den hisse bilgisi"""
        try:
            if not symbol.endswith('.IS'):
                symbol = f"{symbol}.IS"
            
            loop = asyncio.get_event_loop()
            ticker = await loop.run_in_executor(None, yf.Ticker, symbol)
            info = await loop.run_in_executor(None, getattr, ticker, 'info')
            
            if info:
                return {
                    'symbol': symbol,
                    'name': info.get('longName', ''),
                    'sector': info.get('sector', ''),
                    'industry': info.get('industry', ''),
                    'market_cap': info.get('marketCap', 0),
                    'pe_ratio': info.get('trailingPE', 0),
                    'pb_ratio': info.get('priceToBook', 0),
                    'dividend_yield': info.get('dividendYield', 0),
                    'timestamp': datetime.now()
                }
            return None
            
        except Exception as e:
            logger.warning(f"Yahoo Finance info hatası {symbol}: {e}")
            return None

class AlternativeDataManager:
    """Alternative Data Manager - Ana sınıf"""
    
    def __init__(self, config: AlternativeDataConfig):
        self.config = config
        self.finnhub = FinnhubDataProvider(config.finnhub_api_key) if config.finnhub_api_key else None
        self.yahoo_fallback = YahooFinanceFallback() if config.yahoo_fallback else None
        self.data_cache = {}
        self.cache_timestamps = {}
        
        logger.info("✅ Alternative Data Manager başlatıldı")
        if self.finnhub:
            logger.info("   - Finnhub: ✅ Aktif")
        else:
            logger.info("   - Finnhub: ❌ API key yok")
        
        if self.yahoo_fallback:
            logger.info("   - Yahoo Finance: ✅ Fallback aktif")
        else:
            logger.info("   - Yahoo Finance: ❌ Devre dışı")
    
    async def get_comprehensive_stock_data(self, symbol: str) -> Optional[BISTStockData]:
        """Kapsamlı hisse verisi"""
        try:
            # Cache kontrolü
            cache_key = f"stock_data_{symbol}"
            if self._is_cache_valid(cache_key):
                return self.data_cache[cache_key]
            
            # 1. Finnhub (Primary)
            if self.finnhub:
                quote_data = await self.finnhub.get_stock_quote(symbol)
                if quote_data:
                    stock_data = BISTStockData(
                        symbol=symbol,
                        price=quote_data.get('price', 0),
                        volume=quote_data.get('volume', 0),
                        market_cap=0,  # TODO: Add market cap
                        pe_ratio=0,    # TODO: Add PE ratio
                        pb_ratio=0,    # TODO: Add PB ratio
                        dividend_yield=0,  # TODO: Add dividend yield
                        sector='',     # TODO: Add sector
                        industry='',   # TODO: Add industry
                        timestamp=datetime.now(),
                        data_source='finnhub',
                        confidence=0.9
                    )
                    
                    # Cache'e kaydet
                    self._cache_data(cache_key, stock_data)
                    return stock_data
            
            # 2. Yahoo Finance (Fallback)
            if self.yahoo_fallback:
                try:
                    # Stock data
                    stock_data = await self.yahoo_fallback.get_stock_data(symbol)
                    stock_info = await self.yahoo_fallback.get_stock_info(symbol)
                    
                    if stock_data is not None and not stock_data.empty:
                        latest = stock_data.iloc[-1]
                        
                        fallback_data = BISTStockData(
                            symbol=symbol,
                            price=latest.get('Close', 0),
                            volume=latest.get('Volume', 0),
                            market_cap=stock_info.get('market_cap', 0) if stock_info else 0,
                            pe_ratio=stock_info.get('pe_ratio', 0) if stock_info else 0,
                            pb_ratio=stock_info.get('pb_ratio', 0) if stock_info else 0,
                            dividend_yield=stock_info.get('dividend_yield', 0) if stock_info else 0,
                            sector=stock_info.get('sector', '') if stock_info else '',
                            industry=stock_info.get('industry', '') if stock_info else '',
                            timestamp=datetime.now(),
                            data_source='yahoo_finance',
                            confidence=0.7
                        )
                        
                        # Cache'e kaydet
                        self._cache_data(cache_key, fallback_data)
                        return fallback_data
                        
                except Exception as e:
                    logger.warning(f"Yahoo Finance fallback hatası {symbol}: {e}")
            
            return None
            
        except Exception as e:
            logger.error(f"Comprehensive data hatası {symbol}: {e}")
            return None
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """Cache geçerli mi kontrol et"""
        if cache_key not in self.cache_timestamps:
            return False
        
        timestamp = self.cache_timestamps[cache_key]
        age = datetime.now() - timestamp
        
        return age.total_seconds() < self.config.cache_duration
    
    def _cache_data(self, cache_key: str, data: Any):
        """Veriyi cache'e kaydet"""
        self.data_cache[cache_key] = data
        self.cache_timestamps[cache_key] = datetime.now()
    
    async def test_data_sources(self) -> Dict[str, bool]:
        """Veri kaynaklarını test et"""
        test_results = {}
        
        # Test symbol
        test_symbol = "GARAN.IS"
        
        # Finnhub test
        if self.finnhub:
            try:
                data = await self.finnhub.get_stock_quote(test_symbol)
                test_results['finnhub'] = data is not None
                logger.info(f"✅ Finnhub test: {'BAŞARILI' if data else 'BAŞARISIZ'}")
            except Exception as e:
                test_results['finnhub'] = False
                logger.error(f"❌ Finnhub test hatası: {e}")
        else:
            test_results['finnhub'] = False
            logger.warning("⚠️ Finnhub API key yok")
        
        # Yahoo Finance test
        if self.yahoo_fallback:
            try:
                data = await self.yahoo_fallback.get_stock_data(test_symbol)
                test_results['yahoo_finance'] = data is not None and not data.empty
                logger.info(f"✅ Yahoo Finance test: {'BAŞARILI' if test_results['yahoo_finance'] else 'BAŞARISIZ'}")
            except Exception as e:
                test_results['yahoo_finance'] = False
                logger.error(f"❌ Yahoo Finance test hatası: {e}")
        else:
            test_results['yahoo_finance'] = False
        
        return test_results
    
    async def get_bist100_symbols(self) -> List[str]:
        """BIST100 sembol listesi"""
        return [
            "GARAN.IS", "AKBNK.IS", "ISCTR.IS", "YKBNK.IS", "THYAO.IS",
            "SISE.IS", "EREGL.IS", "TUPRS.IS", "ASELS.IS", "KRDMD.IS",
            "PGSUS.IS", "SAHOL.IS", "KCHOL.IS", "VESTL.IS", "BIMAS.IS",
            "MGROS.IS", "TCELL.IS", "TTKOM.IS", "DOHOL.IS", "EKGYO.IS",
            "HEKTS.IS", "KERVN.IS", "KERVT.IS", "KOZAL.IS", "KOZAA.IS",
            "LOGO.IS", "MIPTR.IS", "NTHOL.IS", "OYAKC.IS", "PETKM.IS",
            "POLHO.IS", "PRKAB.IS", "PRKME.IS", "SAFKN.IS", "SASA.IS",
            "SMRTG.IS", "TATKS.IS", "TMSN.IS", "TOASO.IS", "TSKB.IS",
            "TTRAK.IS", "ULKER.IS", "VESBE.IS", "YATAS.IS", "YUNSA.IS",
            "ZRGYO.IS", "ACSEL.IS", "ADEL.IS", "ADESE.IS", "AGHOL.IS",
            "AKENR.IS", "AKFGY.IS", "AKGRT.IS", "AKSA.IS", "ALARK.IS",
            "ALBRK.IS", "ALCAR.IS", "ALCTL.IS", "ALGYO.IS", "ALKIM.IS",
            "ALTIN.IS", "ANACM.IS", "ANELE.IS", "ANGEN.IS", "ARCLK.IS"
        ]

# Test fonksiyonu
async def test_alternative_data_manager():
    """Alternative Data Manager'ı test et"""
    logger.info("🧪 Alternative Data Manager Test Başlıyor...")
    
    # Config
    config = AlternativeDataConfig(
        finnhub_api_key=os.getenv("FINNHUB_API_KEY", ""),
        yahoo_fallback=True,
        kap_oda_enabled=True,
        news_sentiment_enabled=True
    )
    
    # Manager oluştur
    manager = AlternativeDataManager(config)
    
    # Veri kaynaklarını test et
    test_results = await manager.test_data_sources()
    
    # Test sonuçları
    logger.info("📊 Test Sonuçları:")
    for source, result in test_results.items():
        status = "✅ BAŞARILI" if result else "❌ BAŞARISIZ"
        logger.info(f"   {source}: {status}")
    
    # Kapsamlı veri testi
    test_symbol = "GARAN.IS"
    logger.info(f"🔍 {test_symbol} için kapsamlı veri testi...")
    
    comprehensive_data = await manager.get_comprehensive_stock_data(test_symbol)
    
    if comprehensive_data:
        logger.info(f"✅ Kapsamlı veri başarılı:")
        logger.info(f"   Fiyat: {comprehensive_data.price}")
        logger.info(f"   Hacim: {comprehensive_data.volume}")
        logger.info(f"   Sektör: {comprehensive_data.sector}")
        logger.info(f"   Veri Kaynağı: {comprehensive_data.data_source}")
        logger.info(f"   Güven: {comprehensive_data.confidence}")
    else:
        logger.error(f"❌ Kapsamlı veri başarısız")
    
    return test_results, comprehensive_data

if __name__ == "__main__":
    # Test çalıştır
    asyncio.run(test_alternative_data_manager())
