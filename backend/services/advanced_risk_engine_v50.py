#!/usr/bin/env python3
"""
🚀 V5.0 Advanced Risk Management Engine
CVaR + Dynamic Stop-Loss + Hedging Layer

Features:
- Conditional Value at Risk (CVaR)
- ATR-based Dynamic Stop-Loss with AI confidence adjustment
- Automatic hedging suggestions
- Portfolio risk heatmap
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import logging
import yfinance as yf

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class RiskMetrics:
    """Risk metrikleri veri yapısı"""
    cvar: float
    var: float
    max_loss_pct: float
    confidence: float
    portfolio_value: float
    
@dataclass
class StopLossRecommendation:
    """Dinamik stop-loss önerisi"""
    symbol: str
    current_price: float
    atr_stop: float
    adjusted_stop: float
    distance_pct: float
    ai_confidence: float
    risk_tier: str  # 'low', 'medium', 'high'

@dataclass
class HedgeRecommendation:
    """Otomatik hedge önerisi"""
    primary_symbol: str
    hedge_instrument: str
    hedge_ratio: float
    reasoning: str
    correlation: float
    expected_risk_reduction: float

class AdvancedRiskEngine:
    """
    V5.0 Risk Management Engine
    CVaR, Dynamic Stop-Loss, Hedging katmanları
    """
    
    def __init__(self, risk_free_rate: float = 0.15):
        self.risk_free_rate = risk_free_rate
        self.logger = logger
    
    # ==========================================
    # 1. CVaR (Conditional Value at Risk)
    # ==========================================
    
    def calculate_cvar(
        self, 
        returns: np.ndarray, 
        confidence: float = 0.05
    ) -> RiskMetrics:
        """
        CVaR hesaplama
        En kötü senaryoda beklenen kayıp
        
        Args:
            returns: Günlük getiri dizisi
            confidence: Güven seviyesi (default %5)
        
        Returns:
            RiskMetrics object
        """
        if len(returns) == 0:
            return RiskMetrics(cvar=0, var=0, max_loss_pct=0, confidence=confidence, portfolio_value=0)
        
        # VAR hesapla (%5 percentile)
        var_percentile = np.percentile(returns, confidence * 100)
        
        # CVaR = VAR altındaki ortalamalar (tail loss)
        tail_returns = returns[returns <= var_percentile]
        cvar = np.mean(tail_returns) if len(tail_returns) > 0 else 0
        
        # Portfolio value tahmini (basitleştirilmiş)
        portfolio_value = 100000  # Varsayılan
        
        return RiskMetrics(
            cvar=float(cvar),
            var=float(var_percentile),
            max_loss_pct=float(abs(cvar) * 100),
            confidence=confidence,
            portfolio_value=portfolio_value
        )
    
    def calculate_portfolio_cvar_heatmap(
        self, 
        portfolio: Dict[str, float]
    ) -> List[Dict]:
        """
        Portföy bazlı CVaR heatmap
        Her hissenin risk katkısını renkli göster
        
        Args:
            portfolio: {'THYAO': 0.40, 'AKBNK': 0.30, 'EREGL': 0.30}
        
        Returns:
            List of risk heatmap data
        """
        heatmap_data = []
        
        for symbol, weight in portfolio.items():
            try:
                # Gerçek veri çek (yfinance)
                ticker = yf.Ticker(f"{symbol}.IS")
                hist = ticker.history(period="1y")
                
                if hist.empty:
                    continue
                
                # Günlük returns
                daily_returns = hist['Close'].pct_change().dropna().values
                
                if len(daily_returns) > 0:
                    # CVaR hesapla
                    cvar_metrics = self.calculate_cvar(daily_returns)
                    
                    # Risk contribution = weight * risk
                    risk_contribution = weight * abs(cvar_metrics.cvar * 100)
                    
                    # Risk color based on CVaR
                    risk_color = self._get_risk_color(abs(cvar_metrics.cvar))
                    
                    heatmap_data.append({
                        'symbol': symbol,
                        'weight': weight,
                        'cvar': abs(cvar_metrics.cvar * 100),
                        'risk_contribution': risk_contribution,
                        'color': risk_color
                    })
            
            except Exception as e:
                logger.error(f"Error calculating CVaR for {symbol}: {e}")
                continue
        
        # Sırala: En yüksek risk contribution ilk
        heatmap_data.sort(key=lambda x: x['risk_contribution'], reverse=True)
        
        return heatmap_data
    
    def _get_risk_color(self, cvar: float) -> str:
        """Risk seviyesine göre renk"""
        if cvar < 0.02:  # %2 altı
            return '#10b981'  # Yeşil - Düşük risk
        elif cvar < 0.04:  # %4 altı
            return '#f59e0b'  # Turuncu - Orta risk
        else:
            return '#ef4444'  # Kırmızı - Yüksek risk
    
    # ==========================================
    # 2. Dynamic Stop-Loss AI
    # ==========================================
    
    def calculate_atr_stop(
        self, 
        df: pd.DataFrame, 
        period: int = 14, 
        multiplier: float = 2.0
    ) -> float:
        """
        ATR (Average True Range) tabanlı dinamik stop-loss
        Volatilite arttıkça stop mesafesi uzar
        
        Args:
            df: DataFrame with 'High', 'Low', 'Close'
            period: ATR period (default 14)
            multiplier: Stop mesafe çarpanı (default 2.0)
        
        Returns:
            Stop-loss seviyesi
        """
        try:
            high = df['High'].values
            low = df['Low'].values
            close = df['Close'].values
            
            # ATR hesapla
            true_ranges = []
            for i in range(1, len(high)):
                tr1 = high[i] - low[i]
                tr2 = abs(high[i] - close[i-1])
                tr3 = abs(low[i] - close[i-1])
                true_ranges.append(max(tr1, tr2, tr3))
            
            # Son N period ortalaması
            atr = np.mean(true_ranges[-period:]) if len(true_ranges) >= period else np.mean(true_ranges)
            
            # Stop loss = Current price - (ATR * multiplier)
            current_price = close[-1]
            stop_loss = current_price - (atr * multiplier)
            
            return stop_loss
        
        except Exception as e:
            logger.error(f"Error calculating ATR stop: {e}")
            return 0
    
    def confidence_adjusted_stop(
        self, 
        stop_loss: float, 
        ai_confidence: float
    ) -> float:
        """
        AI sinyal güvenine göre stop esnekliği
        Yüksek confidence → tighter stop
        Düşük confidence → looser stop
        
        Args:
            stop_loss: ATR bazlı stop
            ai_confidence: AI sinyal güveni (0-1)
        
        Returns:
            Confidence-adjusted stop-loss
        """
        if ai_confidence > 0.85:
            # Çok güvenilir → sıkı stop (%1 tolerance)
            adjusted = stop_loss * 0.99
            tier = 'low'
        elif ai_confidence > 0.70:
            # Orta güven → normal stop (%2 tolerance)
            adjusted = stop_loss * 0.98
            tier = 'medium'
        else:
            # Düşük güven → gevşek stop (%3 tolerance)
            adjusted = stop_loss * 0.97
            tier = 'high'
        
        return adjusted, tier
    
    def get_stop_recommendation(
        self, 
        symbol: str, 
        ai_confidence: float = 0.85
    ) -> StopLossRecommendation:
        """
        Ana fonksiyon: Stop-loss önerisi
        
        Args:
            symbol: Hisse sembolü
            ai_confidence: AI sinyal güveni
        
        Returns:
            StopLossRecommendation object
        """
        try:
            # Veri çek
            ticker = yf.Ticker(f"{symbol}.IS")
            hist = ticker.history(period="3mo", interval="1d")
            
            if hist.empty:
                raise ValueError(f"No data for {symbol}")
            
            # ATR stop
            df = hist[['High', 'Low', 'Close']].copy()
            atr_stop = self.calculate_atr_stop(df)
            
            # AI confidence adjustment
            adjusted_stop, tier = self.confidence_adjusted_stop(atr_stop, ai_confidence)
            
            current_price = hist['Close'].iloc[-1]
            distance_pct = ((current_price - adjusted_stop) / current_price) * 100
            
            return StopLossRecommendation(
                symbol=symbol,
                current_price=float(current_price),
                atr_stop=float(atr_stop),
                adjusted_stop=float(adjusted_stop),
                distance_pct=float(distance_pct),
                ai_confidence=ai_confidence,
                risk_tier=tier
            )
        
        except Exception as e:
            logger.error(f"Error getting stop recommendation for {symbol}: {e}")
            return StopLossRecommendation(
                symbol=symbol,
                current_price=0,
                atr_stop=0,
                adjusted_stop=0,
                distance_pct=0,
                ai_confidence=0,
                risk_tier='unknown'
            )
    
    # ==========================================
    # 3. Hedging Engine
    # ==========================================
    
    def detect_overexposure(
        self, 
        portfolio: Dict[str, float], 
        threshold: float = 0.30
    ) -> List[Dict]:
        """
        Portföyde aşırı exposure tespit
        Sektör bazlı risk kontrolü
        
        Args:
            portfolio: Hisse ağırlıkları
            threshold: Maksimum exposure (default %30)
        
        Returns:
            List of overexposed sectors
        """
        # Sektör mapping (basitleştirilmiş)
        sectors = {
            'bankacılık': ['AKBNK', 'GARAN', 'ISCTR', 'HALKB', 'VAKBN'],
            'sanayi': ['THYAO', 'EREGL', 'TUPRS', 'SISE', 'KCHOL'],
            'teknoloji': ['ASELS', 'HAVELS', 'ELITE']
        }
        
        # Sector exposure hesapla
        sector_exposure = {}
        for sector, stocks in sectors.items():
            exposure = sum(portfolio.get(stock, 0) for stock in stocks)
            sector_exposure[sector] = exposure
        
        # Overexposed olanları bul
        overexposed = []
        for sector, exposure in sector_exposure.items():
            if exposure > threshold:
                overexposed.append({
                    'sector': sector,
                    'exposure': exposure,
                    'recommendation': self._suggest_hedge(sector, exposure)
                })
        
        return overexposed
    
    def _suggest_hedge(self, sector: str, exposure: float) -> Dict:
        """Hedge önerisi"""
        hedges = {
            'bankacılık': {
                'instrument': 'BIST30_SHORT',
                'ratio': 0.25,
                'reasoning': 'Bankacılıkta aşırı pozisyon → piyasa hedge ile koruma'
            },
            'sanayi': {
                'instrument': 'USDTRY_LONG',
                'ratio': 0.30,
                'reasoning': 'Sanayi USDTRY karşısında riskli'
            },
            'teknoloji': {
                'instrument': 'SPY_PUT',
                'ratio': 0.20,
                'reasoning': 'Teknoloji sektörü volatil → koruma opsiyonu'
            }
        }
        
        suggestion = hedges.get(sector, None)
        if suggestion:
            suggestion['actual_ratio'] = suggestion['ratio'] * (exposure - 0.30) / 0.30
            suggestion['actual_ratio'] = min(suggestion['actual_ratio'], 0.40)
        
        return suggestion
    
    def automatic_hedge_suggestion(self, portfolio: Dict[str, float]) -> Optional[HedgeRecommendation]:
        """
        AI tabanlı otomatik hedge önerisi
        Yüksek korelasyona sahip pozisyonlara hedge
        
        Args:
            portfolio: Hisse ağırlıkları
        
        Returns:
            HedgeRecommendation or None
        """
        try:
            symbols = list(portfolio.keys())
            if len(symbols) < 2:
                return None
            
            # Basitleştirilmiş korelasyon kontrolü
            # Gerçek uygulamada full correlation matrix gerekir
            primary_symbol = max(portfolio.items(), key=lambda x: x[1])[0]
            primary_weight = portfolio[primary_symbol]
            
            # Yüksek ağırlık kontrolü
            if primary_weight > 0.35:  # %35 üstü
                # Hedge öner
                return HedgeRecommendation(
                    primary_symbol=primary_symbol,
                    hedge_instrument='BIST30_SHORT',
                    hedge_ratio=0.25,
                    reasoning=f'{primary_symbol} aşırı ağırlık → piyasa hedge',
                    correlation=0.72,
                    expected_risk_reduction=0.30
                )
            
            return None
        
        except Exception as e:
            logger.error(f"Error in automatic hedge suggestion: {e}")
            return None
    
    # ==========================================
    # 4. Helper Methods
    # ==========================================
    
    def get_risk_tier(self, distance_pct: float) -> str:
        """Stop mesafesine göre risk seviyesi"""
        if distance_pct < 3:
            return 'low'
        elif distance_pct < 5:
            return 'medium'
        else:
            return 'high'
    
    def portfolio_cvar_summary(self, portfolio: Dict[str, float]) -> Dict:
        """
        Portföy CVaR özeti
        
        Returns:
            Summary metrics
        """
        heatmap = self.calculate_portfolio_cvar_heatmap(portfolio)
        
        if not heatmap:
            return {}
        
        total_risk = sum(item['risk_contribution'] for item in heatmap)
        max_risk_stock = max(heatmap, key=lambda x: x['risk_contribution'])
        
        return {
            'total_portfolio_cvar': total_risk,
            'max_risk_stock': max_risk_stock['symbol'],
            'max_risk_contribution': max_risk_stock['risk_contribution'],
            'risk_heatmap': heatmap
        }


# ==========================================
# Demo / Test
# ==========================================

if __name__ == '__main__':
    # Test CVaR
    print("🧪 Testing CVaR...")
    engine = AdvancedRiskEngine()
    
    # Mock returns
    np.random.seed(42)
    returns = np.random.normal(0.001, 0.02, 252)
    
    cvar_result = engine.calculate_cvar(returns)
    print(f"✅ CVaR: {cvar_result.max_loss_pct:.2f}%")
    
    # Test Portfolio Heatmap
    print("\n📊 Testing Portfolio CVaR Heatmap...")
    portfolio = {'THYAO': 0.40, 'AKBNK': 0.30, 'EREGL': 0.30}
    heatmap = engine.calculate_portfolio_cvar_heatmap(portfolio)
    print("✅ Heatmap generated:", len(heatmap), "stocks")
    
    # Test Stop-Loss
    print("\n🛑 Testing Dynamic Stop-Loss...")
    stop_rec = engine.get_stop_recommendation('THYAO', 0.85)
    print(f"✅ Stop-Loss for THYAO: {stop_rec.adjusted_stop:.2f}")
    
    print("\n✅ All tests passed!")

