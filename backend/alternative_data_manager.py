#!/usr/bin/env python3
"""
🚀 Alternative Data Manager - SPRINT 1
BIST AI Smart Trader v2.0 - %80+ Doğruluk Hedefi
"""

import asyncio
import logging
import time
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
import pandas as pd
import numpy as np
import yfinance as yf
import requests
import json
import os
from dataclasses import dataclass
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

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
    max_retries: int = 5  # Artırıldı
    timeout: int = 15  # Artırıldı
    retry_delay: float = 1.0  # Başlangıç gecikme
    backoff_factor: float = 2.0  # Exponential backoff
    rate_limit_delay: float = 0.1  # Rate limit koruması

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
    """Finnhub API veri sağlayıcısı - Robust Retry Zinciri"""
    
    def __init__(self, api_key: str, config: AlternativeDataConfig):
        self.api_key = api_key
        self.config = config
        self.base_url = "https://finnhub.io/api/v1"
        self.session = requests.Session()
        
        # Robust retry strategy
        retry_strategy = Retry(
            total=config.max_retries,
            backoff_factor=config.backoff_factor,
            status_forcelist=[429, 500, 502, 503, 504],  # Rate limit ve server hataları
            allowed_methods=["HEAD", "GET", "OPTIONS"]  # method_whitelist yerine allowed_methods
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        self.session.headers.update({
            'X-Finnhub-Token': api_key,
            'User-Agent': 'BIST-AI-Trader/2.0',
            'Accept': 'application/json',
            'Connection': 'keep-alive'
        })
        
        # Rate limiting
        self.last_request_time = 0
        self.request_count = 0
        self.rate_limit_reset = time.time() + 60  # 1 dakika sonra reset
    
    async def _rate_limit_guard(self):
        """Rate limit koruması"""
        current_time = time.time()
        
        # Rate limit reset kontrolü
        if current_time > self.rate_limit_reset:
            self.request_count = 0
            self.rate_limit_reset = current_time + 60
        
        # Maksimum 60 istek/dakika (Finnhub limit)
        if self.request_count >= 55:  # Güvenlik marjı
            wait_time = self.rate_limit_reset - current_time
            if wait_time > 0:
                logger.warning(f"🚨 Rate limit yaklaşıldı, {wait_time:.1f}s bekleniyor...")
                await asyncio.sleep(wait_time)
                self.request_count = 0
                self.rate_limit_reset = time.time() + 60
        
        # Minimum gecikme
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.config.rate_limit_delay:
            await asyncio.sleep(self.config.rate_limit_delay - time_since_last)
        
        self.last_request_time = time.time()
        self.request_count += 1
    
    async def get_stock_quote(self, symbol: str) -> Optional[Dict]:
        """Hisse fiyat bilgisi - Robust retry ile"""
        for attempt in range(self.config.max_retries):
            try:
                await self._rate_limit_guard()
                
                # Sembol normalize
                norm = symbol.strip().upper().replace('$', '')
                if '.' in norm:
                    symbol_req = norm
                else:
                    symbol_req = norm if (norm.isalpha() and len(norm) <= 5) else f"{norm}.IS"
                
                url = f"{self.base_url}/quote"
                params = {'symbol': symbol_req}
                
                logger.debug(f"🔄 Finnhub isteği (deneme {attempt + 1}): {symbol_req}")
                
                response = self.session.get(url, params=params, timeout=self.config.timeout)
                
                # HTTP status kontrolü
                if response.status_code == 401:
                    logger.error(f"❌ Finnhub 401 Unauthorized: API key geçersiz")
                    return None
                elif response.status_code == 429:
                    logger.warning(f"⚠️ Finnhub 429 Rate Limited: {symbol_req}")
                    if attempt < self.config.max_retries - 1:
                        wait_time = self.config.retry_delay * (self.config.backoff_factor ** attempt)
                        logger.info(f"⏳ {wait_time:.1f}s bekleniyor...")
                        await asyncio.sleep(wait_time)
                        continue
                elif response.status_code >= 500:
                    logger.warning(f"⚠️ Finnhub server hatası {response.status_code}: {symbol_req}")
                    if attempt < self.config.max_retries - 1:
                        wait_time = self.config.retry_delay * (self.config.backoff_factor ** attempt)
                        await asyncio.sleep(wait_time)
                        continue
                
                response.raise_for_status()
                
                data = response.json()
                
                # Veri kontrolü
                if data.get('c', 0) > 0:
                    logger.debug(f"✅ Finnhub başarılı: {symbol_req}")
                    return {
                        'symbol': symbol_req,
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
                else:
                    logger.warning(f"⚠️ Finnhub boş veri: {symbol_req}")
                    return None
                    
            except requests.exceptions.Timeout:
                logger.warning(f"⏰ Finnhub timeout (deneme {attempt + 1}): {symbol}")
                if attempt < self.config.max_retries - 1:
                    wait_time = self.config.retry_delay * (self.config.backoff_factor ** attempt)
                    await asyncio.sleep(wait_time)
                    continue
                    
            except requests.exceptions.ConnectionError:
                logger.warning(f"🔌 Finnhub bağlantı hatası (deneme {attempt + 1}): {symbol}")
                if attempt < self.config.max_retries - 1:
                    wait_time = self.config.retry_delay * (self.config.backoff_factor ** attempt)
                    await asyncio.sleep(wait_time)
                    continue
                    
            except Exception as e:
                logger.warning(f"❌ Finnhub genel hata (deneme {attempt + 1}): {symbol} - {e}")
                if attempt < self.config.max_retries - 1:
                    wait_time = self.config.retry_delay * (self.config.backoff_factor ** attempt)
                    await asyncio.sleep(wait_time)
                    continue
        
        logger.error(f"❌ Finnhub tüm denemeler başarısız: {symbol}")
        return None

class YahooFinanceFallback:
    """Yahoo Finance fallback veri sağlayıcısı - Robust Retry"""
    
    def __init__(self, config: AlternativeDataConfig):
        self.config = config
        self.session = requests.Session()
        
        # Retry strategy for Yahoo Finance
        retry_strategy = Retry(
            total=config.max_retries,
            backoff_factor=config.backoff_factor,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["HEAD", "GET", "OPTIONS"]  # method_whitelist yerine allowed_methods
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        self.session.headers.update({
            'User-Agent': 'BIST-AI-Trader/2.0',
            'Accept': 'application/json',
            'Connection': 'keep-alive'
        })
        
        # Rate limiting
        self.last_request_time = 0
        self.request_count = 0
        self.rate_limit_reset = time.time() + 60
    
    async def _rate_limit_guard(self):
        """Rate limit koruması"""
        current_time = time.time()
        
        if current_time > self.rate_limit_reset:
            self.request_count = 0
            self.rate_limit_reset = current_time + 60
        
        # Yahoo Finance için daha konservatif limit
        if self.request_count >= 30:  # Güvenlik marjı
            wait_time = self.rate_limit_reset - current_time
            if wait_time > 0:
                logger.warning(f"🚨 Yahoo Finance rate limit yaklaşıldı, {wait_time:.1f}s bekleniyor...")
                await asyncio.sleep(wait_time)
                self.request_count = 0
                self.rate_limit_reset = time.time() + 60
        
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.config.rate_limit_delay * 2:  # Yahoo için daha yavaş
            await asyncio.sleep(self.config.rate_limit_delay * 2 - time_since_last)
        
        self.last_request_time = time.time()
        self.request_count += 1
    
    async def get_stock_data(self, symbol: str, period: str = "1d") -> Optional[pd.DataFrame]:
        """Yahoo Finance'den hisse verisi - Robust retry ile"""
        for attempt in range(self.config.max_retries):
            try:
                await self._rate_limit_guard()
                
                norm = symbol.strip().upper().replace('$', '')
                if '.' in norm:
                    yf_symbol = norm
                else:
                    yf_symbol = norm if (norm.isalpha() and len(norm) <= 5) else f"{norm}.IS"
                
                logger.debug(f"🔄 Yahoo Finance isteği (deneme {attempt + 1}): {yf_symbol}")
                
                # Async wrapper
                loop = asyncio.get_event_loop()
                ticker = await loop.run_in_executor(None, yf.Ticker, yf_symbol)
                data = await loop.run_in_executor(None, ticker.history, period)
                
                if not data.empty:
                    logger.debug(f"✅ Yahoo Finance başarılı: {yf_symbol}")
                    return data
                else:
                    logger.warning(f"⚠️ Yahoo Finance boş veri: {yf_symbol}")
                    if attempt < self.config.max_retries - 1:
                        wait_time = self.config.retry_delay * (self.config.backoff_factor ** attempt)
                        await asyncio.sleep(wait_time)
                        continue
                    
            except Exception as e:
                logger.warning(f"❌ Yahoo Finance hatası (deneme {attempt + 1}): {symbol} - {e}")
                if attempt < self.config.max_retries - 1:
                    wait_time = self.config.retry_delay * (self.config.backoff_factor ** attempt)
                    await asyncio.sleep(wait_time)
                    continue
        
        logger.error(f"❌ Yahoo Finance tüm denemeler başarısız: {symbol}")
        return None
    
    async def get_stock_info(self, symbol: str) -> Optional[Dict]:
        """Yahoo Finance'den hisse bilgisi - Robust retry ile"""
        for attempt in range(self.config.max_retries):
            try:
                await self._rate_limit_guard()
                
                norm = symbol.strip().upper().replace('$', '')
                if '.' in norm:
                    yf_symbol = norm
                else:
                    yf_symbol = norm if (norm.isalpha() and len(norm) <= 5) else f"{norm}.IS"
                
                logger.debug(f"🔄 Yahoo Finance info isteği (deneme {attempt + 1}): {yf_symbol}")
                
                loop = asyncio.get_event_loop()
                ticker = await loop.run_in_executor(None, yf.Ticker, yf_symbol)
                info = await loop.run_in_executor(None, getattr, ticker, 'info')
                
                if info:
                    logger.debug(f"✅ Yahoo Finance info başarılı: {yf_symbol}")
                    return {
                        'symbol': yf_symbol,
                        'name': info.get('longName', ''),
                        'sector': info.get('sector', ''),
                        'industry': info.get('industry', ''),
                        'market_cap': info.get('marketCap', 0),
                        'pe_ratio': info.get('trailingPE', 0),
                        'pb_ratio': info.get('priceToBook', 0),
                        'dividend_yield': info.get('dividendYield', 0),
                        'timestamp': datetime.now()
                    }
                else:
                    logger.warning(f"⚠️ Yahoo Finance info boş: {yf_symbol}")
                    if attempt < self.config.max_retries - 1:
                        wait_time = self.config.retry_delay * (self.config.backoff_factor ** attempt)
                        await asyncio.sleep(wait_time)
                        continue
                    
            except Exception as e:
                logger.warning(f"❌ Yahoo Finance info hatası (deneme {attempt + 1}): {symbol} - {e}")
                if attempt < self.config.max_retries - 1:
                    wait_time = self.config.retry_delay * (self.config.backoff_factor ** attempt)
                    await asyncio.sleep(wait_time)
                    continue
        
        logger.error(f"❌ Yahoo Finance info tüm denemeler başarısız: {symbol}")
        return None

class AlternativeDataManager:
    """Alternative Data Manager - Ana sınıf - Robust Retry"""
    
    def __init__(self, config: AlternativeDataConfig):
        self.config = config
        # Env'den zorunlu anahtar oku; boşsa None bırak
        key = config.finnhub_api_key or os.getenv("FINNHUB_API_KEY", "").strip()
        self.finnhub = FinnhubDataProvider(key, config) if key else None
        self.yahoo_fallback = YahooFinanceFallback(config) if config.yahoo_fallback else None
        self.data_cache = {}
        self.cache_timestamps = {}
        
        logger.info("✅ Alternative Data Manager başlatıldı (Robust Retry)")
        if self.finnhub:
            # Güvenlik gereği anahtar maskelenir
            masked = (self.finnhub.api_key[:4] + "***" + self.finnhub.api_key[-3:]) if self.finnhub.api_key else ""
            logger.info("   - Finnhub: ✅ Aktif (key: %s)", masked)
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

    def get_comprehensive_stock_data_sync(self, symbol: str) -> Optional[BISTStockData]:
        """Senkron ortamdan kapsamlı hisse verisi al (async wrapper)."""
        try:
            # Mevcut event loop var mı?
            try:
                running_loop = asyncio.get_running_loop()
            except RuntimeError:
                running_loop = None

            if running_loop and running_loop.is_running():
                # Aynı thread'de aktif loop varken yeni loop çalıştırılamaz; ayrı thread kullan
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                    future = executor.submit(lambda: asyncio.run(self.get_comprehensive_stock_data(symbol)))
                    return future.result(timeout=60)
            else:
                # Basit senaryo: doğrudan asyncio.run
                return asyncio.run(self.get_comprehensive_stock_data(symbol))
        except Exception as e:
            logger.warning(f"get_comprehensive_stock_data_sync hata: {symbol} - {e}")
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
    """Alternative Data Manager'ı test et - Robust Retry"""
    logger.info("🧪 Alternative Data Manager Test Başlıyor (Robust Retry)...")
    
    # Config - Retry parametreleri ile
    config = AlternativeDataConfig(
        finnhub_api_key=os.getenv("FINNHUB_API_KEY", ""),
        yahoo_fallback=True,
        kap_oda_enabled=True,
        news_sentiment_enabled=True,
        max_retries=5,
        timeout=15,
        retry_delay=1.0,
        backoff_factor=2.0,
        rate_limit_delay=0.1
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
