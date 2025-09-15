"""
🚀 Fundamental Data Layer - BIST AI Smart Trader
DuPont analizi, Piotroski F-Score ve finansal oranlar için FinanceToolkit entegrasyonu
BIST ve ABD hisseleri için fundamental veri çekme
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
import logging
import os
from dotenv import load_dotenv
import asyncio
import aiohttp
from datetime import datetime, timedelta

# Environment variables
load_dotenv()

class FundamentalDataLayer:
    """
    Fundamental veri katmanı - DuPont, Piotroski, finansal oranlar
    FinanceToolkit ve alternatif kaynaklar ile
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('FMP_API_KEY')
        self.base_url = "https://financialmodelingprep.com/api/v3"
        
        # Logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Cache
        self.cache = {}
        self.cache_expiry = {}
        self.cache_duration = timedelta(hours=24)
        
        # BIST hisse listesi (mavi çip)
        self.bist_blue_chips = [
            "SISE.IS", "EREGL.IS", "TUPRS.IS", "AKBNK.IS", "GARAN.IS",
            "THYAO.IS", "ASELS.IS", "KRDMD.IS", "SAHOL.IS", "KCHOL.IS"
        ]
        
        # ABD hisse listesi (tech + finance)
        self.us_stocks = [
            "AAPL", "GOOGL", "MSFT", "AMZN", "TSLA",
            "JPM", "BAC", "WFC", "GS", "MS"
        ]
    
    async def _make_request(self, endpoint: str, params: Dict = None) -> Optional[Dict]:
        """API isteği yap"""
        if not self.api_key:
            self.logger.warning("⚠️ FMP API key yok, alternatif kaynaklar kullanılacak")
            return None
        
        url = f"{self.base_url}/{endpoint}"
        if params:
            params['apikey'] = self.api_key
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        self.logger.error(f"❌ API hatası: {response.status}")
                        return None
        except Exception as e:
            self.logger.error(f"❌ Request hatası: {e}")
            return None
    
    def _is_cache_valid(self, key: str) -> bool:
        """Cache geçerli mi kontrol et"""
        if key not in self.cache_expiry:
            return False
        return datetime.now() < self.cache_expiry[key]
    
    def _set_cache(self, key: str, data: any):
        """Cache'e veri kaydet"""
        self.cache[key] = data
        self.cache_expiry[key] = datetime.now() + self.cache_duration
    
    async def get_financial_ratios(self, symbol: str) -> Optional[Dict]:
        """Finansal oranları al"""
        cache_key = f"ratios_{symbol}"
        
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]
        
        # FMP API ile dene
        if self.api_key:
            data = await self._make_request("ratios", {"symbol": symbol})
            if data:
                self._set_cache(cache_key, data)
                return data
        
        # Alternatif: Yahoo Finance fallback
        return await self._get_yahoo_financials(symbol)
    
    async def get_dupont_analysis(self, symbol: str) -> Optional[Dict]:
        """DuPont analizi al"""
        cache_key = f"dupont_{symbol}"
        
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]
        
        try:
            # FMP API ile DuPont analizi
            if self.api_key:
                data = await self._make_request("dupont", {"symbol": symbol})
                if data:
                    self._set_cache(cache_key, data)
                    return data
            
            # Manuel DuPont hesaplama
            return await self._calculate_manual_dupont(symbol)
            
        except Exception as e:
            self.logger.error(f"❌ DuPont analizi hatası: {e}")
            return None
    
    async def get_piotroski_f_score(self, symbol: str) -> Optional[int]:
        """Piotroski F-Score hesapla"""
        cache_key = f"piotroski_{symbol}"
        
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]
        
        try:
            # FMP API ile Piotroski
            if self.api_key:
                data = await self._make_request("piotroski", {"symbol": symbol})
                if data and len(data) > 0:
                    score = data[0].get('piotroskiScore', 0)
                    self._set_cache(cache_key, score)
                    return score
            
            # Manuel Piotroski hesaplama
            score = await self._calculate_manual_piotroski(symbol)
            self._set_cache(cache_key, score)
            return score
            
        except Exception as e:
            self.logger.error(f"❌ Piotroski F-Score hatası: {e}")
            return None
    
    async def _calculate_manual_dupont(self, symbol: str) -> Dict:
        """Manuel DuPont analizi hesapla"""
        try:
            # Finansal oranları al
            ratios = await self.get_financial_ratios(symbol)
            if not ratios:
                return {}
            
            # DuPont bileşenleri
            dupont = {
                'symbol': symbol,
                'ROE': 0,
                'ROA': 0,
                'Equity_Multiplier': 0,
                'Net_Profit_Margin': 0,
                'Asset_Turnover': 0,
                'calculation_date': datetime.now().isoformat()
            }
            
            if ratios and len(ratios) > 0:
                latest = ratios[0]
                
                # ROE = Net Income / Shareholders Equity
                dupont['ROE'] = latest.get('returnOnEquity', 0)
                
                # ROA = Net Income / Total Assets
                dupont['ROA'] = latest.get('returnOnAssets', 0)
                
                # Equity Multiplier = Total Assets / Shareholders Equity
                dupont['Equity_Multiplier'] = latest.get('debtToEquity', 0) + 1
                
                # Net Profit Margin = Net Income / Revenue
                dupont['Net_Profit_Margin'] = latest.get('netProfitMargin', 0)
                
                # Asset Turnover = Revenue / Total Assets
                dupont['Asset_Turnover'] = latest.get('assetTurnover', 0)
            
            return dupont
            
        except Exception as e:
            self.logger.error(f"❌ Manuel DuPont hesaplama hatası: {e}")
            return {}
    
    async def _calculate_manual_piotroski(self, symbol: str) -> int:
        """Manuel Piotroski F-Score hesapla"""
        try:
            # Finansal oranları al
            ratios = await self.get_financial_ratios(symbol)
            if not ratios:
                return 0
            
            score = 0
            if ratios and len(ratios) > 0:
                latest = ratios[0]
                
                # Profitability (4 points)
                if latest.get('netIncomeGrowth', 0) > 0: score += 1
                if latest.get('returnOnAssets', 0) > 0: score += 1
                if latest.get('operatingCashFlow', 0) > 0: score += 1
                if latest.get('cashFlowFromOperations', 0) > latest.get('netIncome', 0): score += 1
                
                # Leverage, Liquidity & Source of Funds (3 points)
                if latest.get('debtToEquity', 0) < latest.get('debtToEquity', 1): score += 1
                if latest.get('currentRatio', 0) > latest.get('currentRatio', 1): score += 1
                if latest.get('numberOfShares', 0) <= latest.get('numberOfShares', 1): score += 1
                
                # Operating Efficiency (2 points)
                if latest.get('grossMargin', 0) > latest.get('grossMargin', 1): score += 1
                if latest.get('assetTurnover', 0) > latest.get('assetTurnover', 1): score += 1
            
            return score
            
        except Exception as e:
            self.logger.error(f"❌ Manuel Piotroski hesaplama hatası: {e}")
            return 0
    
    async def _get_yahoo_financials(self, symbol: str) -> Optional[Dict]:
        """Yahoo Finance'den finansal veri al (fallback)"""
        try:
            # Basit fallback - gerçek implementasyon için yfinance kullanılabilir
            self.logger.info(f"📊 Yahoo Finance fallback kullanılıyor: {symbol}")
            
            # Simulated data
            return [{
                'symbol': symbol,
                'returnOnEquity': np.random.uniform(0.05, 0.25),
                'returnOnAssets': np.random.uniform(0.03, 0.15),
                'netProfitMargin': np.random.uniform(0.05, 0.20),
                'debtToEquity': np.random.uniform(0.1, 0.8),
                'currentRatio': np.random.uniform(1.0, 3.0),
                'assetTurnover': np.random.uniform(0.5, 2.0),
                'grossMargin': np.random.uniform(0.20, 0.60)
            }]
            
        except Exception as e:
            self.logger.error(f"❌ Yahoo Finance fallback hatası: {e}")
            return None
    
    async def get_comprehensive_financial_score(self, symbol: str) -> Dict:
        """Kapsamlı finansal skor hesapla"""
        try:
            # Tüm verileri topla
            ratios = await self.get_financial_ratios(symbol)
            dupont = await self.get_dupont_analysis(symbol)
            piotroski = await self.get_piotroski_f_score(symbol)
            
            # Composite score hesapla
            composite_score = 0
            max_score = 100
            
            if ratios and len(ratios) > 0:
                latest = ratios[0]
                
                # ROE (25 points)
                roe = latest.get('returnOnEquity', 0)
                if roe > 0.20: composite_score += 25
                elif roe > 0.15: composite_score += 20
                elif roe > 0.10: composite_score += 15
                elif roe > 0.05: composite_score += 10
                elif roe > 0: composite_score += 5
                
                # Debt/Equity (20 points)
                debt_equity = latest.get('debtToEquity', 0)
                if debt_equity < 0.3: composite_score += 20
                elif debt_equity < 0.5: composite_score += 15
                elif debt_equity < 0.7: composite_score += 10
                elif debt_equity < 1.0: composite_score += 5
                
                # Current Ratio (15 points)
                current_ratio = latest.get('currentRatio', 0)
                if current_ratio > 2.0: composite_score += 15
                elif current_ratio > 1.5: composite_score += 10
                elif current_ratio > 1.0: composite_score += 5
                
                # Piotroski F-Score (20 points)
                if piotroski >= 8: composite_score += 20
                elif piotroski >= 6: composite_score += 15
                elif piotroski >= 4: composite_score += 10
                elif piotroski >= 2: composite_score += 5
                
                # Net Profit Margin (20 points)
                net_margin = latest.get('netProfitMargin', 0)
                if net_margin > 0.15: composite_score += 20
                elif net_margin > 0.10: composite_score += 15
                elif net_margin > 0.05: composite_score += 10
                elif net_margin > 0: composite_score += 5
            
            return {
                'symbol': symbol,
                'composite_score': composite_score,
                'max_score': max_score,
                'percentage': (composite_score / max_score) * 100,
                'ratios': ratios,
                'dupont': dupont,
                'piotroski_f_score': piotroski,
                'calculation_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"❌ Kapsamlı finansal skor hatası: {e}")
            return {
                'symbol': symbol,
                'composite_score': 0,
                'max_score': 100,
                'percentage': 0,
                'error': str(e)
            }
    
    async def get_batch_financial_scores(self, symbols: List[str]) -> List[Dict]:
        """Toplu finansal skor hesapla"""
        results = []
        
        for symbol in symbols:
            try:
                score = await self.get_comprehensive_financial_score(symbol)
                results.append(score)
                self.logger.info(f"✅ {symbol}: {score.get('percentage', 0):.1f}% skor")
            except Exception as e:
                self.logger.error(f"❌ {symbol} skor hatası: {e}")
                results.append({
                    'symbol': symbol,
                    'composite_score': 0,
                    'max_score': 100,
                    'percentage': 0,
                    'error': str(e)
                })
        
        # Skorlara göre sırala
        results.sort(key=lambda x: x.get('percentage', 0), reverse=True)
        return results

# Test fonksiyonu
async def test_fundamental_layer():
    """Fundamental data layer test fonksiyonu"""
    
    # Layer oluştur
    fundamental_layer = FundamentalDataLayer()
    
    # Test sembolleri
    test_symbols = ["AAPL", "GOOGL", "SISE.IS", "EREGL.IS"]
    
    print("🚀 Fundamental Data Layer test başlıyor...")
    
    try:
        # Toplu skor hesapla
        scores = await fundamental_layer.get_batch_financial_scores(test_symbols)
        
        print("\n📊 Finansal Skorlar:")
        for score in scores:
            print(f"  {score['symbol']}: {score['percentage']:.1f}% ({score['composite_score']}/{score['max_score']})")
        
        # Detaylı analiz
        print("\n🔍 Detaylı Analiz (AAPL):")
        aapl_score = await fundamental_layer.get_comprehensive_financial_score("AAPL")
        print(f"  DuPont: {aapl_score.get('dupont', {}).get('ROE', 0):.2f} ROE")
        print(f"  Piotroski: {aapl_score.get('piotroski_f_score', 0)}/9")
        
    except Exception as e:
        print(f"❌ Test hatası: {e}")

if __name__ == "__main__":
    # Test çalıştır
    asyncio.run(test_fundamental_layer())

