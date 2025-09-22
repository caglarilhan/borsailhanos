#!/usr/bin/env python3
"""
🛡️ Advanced Risk Management System
PRD v2.0 Enhancement - Comprehensive risk management
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import yfinance as yf
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

@dataclass
class RiskMetrics:
    """Risk metrikleri"""
    symbol: str
    var_95: float  # Value at Risk 95%
    var_99: float  # Value at Risk 99%
    cvar_95: float  # Conditional VaR 95%
    max_drawdown: float
    sharpe_ratio: float
    sortino_ratio: float
    calmar_ratio: float
    beta: float
    correlation_market: float
    volatility: float
    skewness: float
    kurtosis: float
    risk_score: float  # 0-100
    timestamp: datetime

@dataclass
class PortfolioRisk:
    """Portföy risk metrikleri"""
    total_var: float
    portfolio_volatility: float
    portfolio_beta: float
    diversification_ratio: float
    concentration_risk: float
    sector_concentration: Dict[str, float]
    correlation_matrix: pd.DataFrame
    risk_budget: Dict[str, float]
    timestamp: datetime

class AdvancedRiskManager:
    """Gelişmiş risk yönetim sistemi"""
    
    def __init__(self):
        self.risk_cache = {}
        self.market_data = None
        
    def calculate_stock_risk(self, symbol: str, period: str = "2y") -> RiskMetrics:
        """Hisse risk metriklerini hesapla"""
        logger.info(f"🛡️ {symbol} risk analizi başlıyor...")
        
        try:
            # Hisse verisi
            stock = yf.Ticker(symbol)
            data = stock.history(period=period)
            
            if data.empty:
                logger.error(f"❌ {symbol} için veri bulunamadı")
                return self._default_risk_metrics(symbol)
            
            # Returns hesapla
            returns = data['Close'].pct_change().dropna()
            
            if len(returns) < 30:
                logger.warning(f"⚠️ {symbol} için yeterli veri yok")
                return self._default_risk_metrics(symbol)
            
            # Market verisi (BIST 100)
            market_data = self._get_market_data()
            
            # Risk metrikleri hesapla
            var_95, var_99 = self._calculate_var(returns)
            cvar_95 = self._calculate_cvar(returns, var_95)
            max_dd = self._calculate_max_drawdown(data['Close'])
            sharpe = self._calculate_sharpe_ratio(returns)
            sortino = self._calculate_sortino_ratio(returns)
            calmar = self._calculate_calmar_ratio(returns, max_dd)
            
            # Beta ve korelasyon
            beta, correlation = self._calculate_beta_correlation(returns, market_data)
            
            # İstatistiksel özellikler
            volatility = returns.std() * np.sqrt(252)  # Yıllık volatilite
            skewness = stats.skew(returns)
            kurtosis = stats.kurtosis(returns)
            
            # Risk skoru (0-100)
            risk_score = self._calculate_risk_score(
                volatility, max_dd, sharpe, beta, skewness, kurtosis
            )
            
            risk_metrics = RiskMetrics(
                symbol=symbol,
                var_95=var_95,
                var_99=var_99,
                cvar_95=cvar_95,
                max_drawdown=max_dd,
                sharpe_ratio=sharpe,
                sortino_ratio=sortino,
                calmar_ratio=calmar,
                beta=beta,
                correlation_market=correlation,
                volatility=volatility,
                skewness=skewness,
                kurtosis=kurtosis,
                risk_score=risk_score,
                timestamp=datetime.now()
            )
            
            self.risk_cache[symbol] = risk_metrics
            
            logger.info(f"✅ {symbol} risk analizi tamamlandı - Risk Skoru: {risk_score:.1f}")
            return risk_metrics
            
        except Exception as e:
            logger.error(f"❌ {symbol} risk analizi hatası: {e}")
            return self._default_risk_metrics(symbol)
    
    def calculate_portfolio_risk(self, portfolio: Dict[str, float]) -> PortfolioRisk:
        """Portföy risk metriklerini hesapla"""
        logger.info(f"🎯 Portföy risk analizi başlıyor...")
        
        try:
            symbols = list(portfolio.keys())
            weights = list(portfolio.values())
            
            # Her hisse için risk metrikleri
            stock_risks = {}
            returns_data = {}
            
            for symbol in symbols:
                risk_metrics = self.calculate_stock_risk(symbol)
                stock_risks[symbol] = risk_metrics
                
                # Returns verisi
                stock = yf.Ticker(symbol)
                data = stock.history(period="1y")
                if not data.empty:
                    returns_data[symbol] = data['Close'].pct_change().dropna()
            
            # Portföy returns
            portfolio_returns = self._calculate_portfolio_returns(returns_data, weights)
            
            # Portföy risk metrikleri
            portfolio_var = self._calculate_var(portfolio_returns)[0]
            portfolio_volatility = portfolio_returns.std() * np.sqrt(252)
            portfolio_beta = self._calculate_portfolio_beta(stock_risks, weights)
            
            # Diversifikasyon
            diversification_ratio = self._calculate_diversification_ratio(stock_risks, weights)
            concentration_risk = self._calculate_concentration_risk(weights)
            
            # Sektör konsantrasyonu
            sector_concentration = self._calculate_sector_concentration(symbols, weights)
            
            # Korelasyon matrisi
            correlation_matrix = self._calculate_portfolio_correlation_matrix(returns_data)
            
            # Risk budget
            risk_budget = self._calculate_risk_budget(stock_risks, weights)
            
            portfolio_risk = PortfolioRisk(
                total_var=portfolio_var,
                portfolio_volatility=portfolio_volatility,
                portfolio_beta=portfolio_beta,
                diversification_ratio=diversification_ratio,
                concentration_risk=concentration_risk,
                sector_concentration=sector_concentration,
                correlation_matrix=correlation_matrix,
                risk_budget=risk_budget,
                timestamp=datetime.now()
            )
            
            logger.info(f"✅ Portföy risk analizi tamamlandı")
            logger.info(f"   Portföy Volatilite: {portfolio_volatility:.2%}")
            logger.info(f"   Diversifikasyon Oranı: {diversification_ratio:.2f}")
            logger.info(f"   Konsantrasyon Riski: {concentration_risk:.2f}")
            
            return portfolio_risk
            
        except Exception as e:
            logger.error(f"❌ Portföy risk analizi hatası: {e}")
            return self._default_portfolio_risk()
    
    def _calculate_var(self, returns: pd.Series) -> Tuple[float, float]:
        """Value at Risk hesapla"""
        try:
            var_95 = np.percentile(returns, 5)  # %5 VaR = %95 güven
            var_99 = np.percentile(returns, 1)  # %1 VaR = %99 güven
            return var_95, var_99
        except:
            return -0.05, -0.10  # Varsayılan değerler
    
    def _calculate_cvar(self, returns: pd.Series, var: float) -> float:
        """Conditional VaR hesapla"""
        try:
            tail_returns = returns[returns <= var]
            if len(tail_returns) > 0:
                return tail_returns.mean()
            else:
                return var
        except:
            return var
    
    def _calculate_max_drawdown(self, prices: pd.Series) -> float:
        """Maximum drawdown hesapla"""
        try:
            peak = prices.expanding().max()
            drawdown = (prices - peak) / peak
            max_dd = drawdown.min()
            return abs(max_dd)
        except:
            return 0.20  # Varsayılan %20
    
    def _calculate_sharpe_ratio(self, returns: pd.Series, risk_free_rate: float = 0.05) -> float:
        """Sharpe ratio hesapla"""
        try:
            excess_returns = returns.mean() * 252 - risk_free_rate
            volatility = returns.std() * np.sqrt(252)
            if volatility > 0:
                return excess_returns / volatility
            else:
                return 0.0
        except:
            return 0.0
    
    def _calculate_sortino_ratio(self, returns: pd.Series, risk_free_rate: float = 0.05) -> float:
        """Sortino ratio hesapla"""
        try:
            excess_returns = returns.mean() * 252 - risk_free_rate
            downside_returns = returns[returns < 0]
            downside_volatility = downside_returns.std() * np.sqrt(252)
            
            if downside_volatility > 0:
                return excess_returns / downside_volatility
            else:
                return 0.0
        except:
            return 0.0
    
    def _calculate_calmar_ratio(self, returns: pd.Series, max_drawdown: float) -> float:
        """Calmar ratio hesapla"""
        try:
            annual_return = returns.mean() * 252
            if max_drawdown > 0:
                return annual_return / max_drawdown
            else:
                return 0.0
        except:
            return 0.0
    
    def _calculate_beta_correlation(self, stock_returns: pd.Series, market_returns: pd.Series) -> Tuple[float, float]:
        """Beta ve korelasyon hesapla"""
        try:
            if market_returns is None or len(market_returns) < 30:
                return 1.0, 0.5  # Varsayılan değerler
            
            # Ortak tarihleri bul
            common_dates = stock_returns.index.intersection(market_returns.index)
            if len(common_dates) < 30:
                return 1.0, 0.5
            
            stock_aligned = stock_returns.loc[common_dates]
            market_aligned = market_returns.loc[common_dates]
            
            # Beta hesapla
            covariance = np.cov(stock_aligned, market_aligned)[0, 1]
            market_variance = np.var(market_aligned)
            
            if market_variance > 0:
                beta = covariance / market_variance
            else:
                beta = 1.0
            
            # Korelasyon hesapla
            correlation = np.corrcoef(stock_aligned, market_aligned)[0, 1]
            if np.isnan(correlation):
                correlation = 0.5
            
            return beta, correlation
            
        except Exception as e:
            logger.error(f"❌ Beta/korelasyon hesaplama hatası: {e}")
            return 1.0, 0.5
    
    def _calculate_risk_score(self, volatility: float, max_dd: float, sharpe: float, 
                            beta: float, skewness: float, kurtosis: float) -> float:
        """Risk skoru hesapla (0-100, düşük = düşük risk)"""
        try:
            # Volatilite skoru (0-30 puan)
            vol_score = max(0, 30 - (volatility * 1000))  # %20 volatilite = 10 puan
            
            # Drawdown skoru (0-25 puan)
            dd_score = max(0, 25 - (max_dd * 100))  # %20 DD = 5 puan
            
            # Sharpe skoru (0-20 puan)
            sharpe_score = min(20, max(0, sharpe * 10))  # 2 Sharpe = 20 puan
            
            # Beta skoru (0-15 puan)
            beta_score = max(0, 15 - abs(beta - 1) * 10)  # Beta 1 = 15 puan
            
            # Skewness skoru (0-5 puan)
            skew_score = max(0, 5 - abs(skewness) * 2)  # Skewness 0 = 5 puan
            
            # Kurtosis skoru (0-5 puan)
            kurt_score = max(0, 5 - max(0, kurtosis - 3) * 2)  # Kurtosis 3 = 5 puan
            
            total_score = vol_score + dd_score + sharpe_score + beta_score + skew_score + kurt_score
            return min(100, max(0, total_score))
            
        except:
            return 50.0  # Varsayılan orta risk
    
    def _get_market_data(self) -> pd.Series:
        """Market verisi (BIST 100 proxy)"""
        try:
            if self.market_data is None:
                # BIST 100 proxy olarak GARAN kullan
                market_stock = yf.Ticker("GARAN.IS")
                data = market_stock.history(period="2y")
                if not data.empty:
                    self.market_data = data['Close'].pct_change().dropna()
            
            return self.market_data
        except:
            return None
    
    def _calculate_portfolio_returns(self, returns_data: Dict[str, pd.Series], 
                                   weights: List[float]) -> pd.Series:
        """Portföy returns hesapla"""
        try:
            # Ortak tarihleri bul
            all_dates = set()
            for returns in returns_data.values():
                all_dates.update(returns.index)
            
            common_dates = sorted(list(all_dates))
            
            # Portföy returns hesapla
            portfolio_returns = pd.Series(0.0, index=common_dates)
            
            for i, (symbol, returns) in enumerate(returns_data.items()):
                weight = weights[i]
                aligned_returns = returns.reindex(common_dates, fill_value=0.0)
                portfolio_returns += weight * aligned_returns
            
            return portfolio_returns
            
        except Exception as e:
            logger.error(f"❌ Portföy returns hesaplama hatası: {e}")
            return pd.Series([0.0] * 100)  # Varsayılan
    
    def _calculate_portfolio_beta(self, stock_risks: Dict[str, RiskMetrics], 
                                weights: List[float]) -> float:
        """Portföy beta hesapla"""
        try:
            portfolio_beta = 0.0
            for i, (symbol, risk) in enumerate(stock_risks.items()):
                portfolio_beta += weights[i] * risk.beta
            
            return portfolio_beta
        except:
            return 1.0
    
    def _calculate_diversification_ratio(self, stock_risks: Dict[str, RiskMetrics], 
                                       weights: List[float]) -> float:
        """Diversifikasyon oranı hesapla"""
        try:
            # Ağırlıklı ortalama volatilite
            weighted_vol = sum(weights[i] * risk.volatility 
                             for i, (symbol, risk) in enumerate(stock_risks.items()))
            
            # Portföy volatilitesi (basitleştirilmiş)
            portfolio_vol = weighted_vol * 0.8  # Diversifikasyon etkisi
            
            if portfolio_vol > 0:
                return weighted_vol / portfolio_vol
            else:
                return 1.0
        except:
            return 1.0
    
    def _calculate_concentration_risk(self, weights: List[float]) -> float:
        """Konsantrasyon riski hesapla (Herfindahl index)"""
        try:
            herfindahl = sum(w**2 for w in weights)
            return herfindahl
        except:
            return 1.0
    
    def _calculate_sector_concentration(self, symbols: List[str], weights: List[float]) -> Dict[str, float]:
        """Sektör konsantrasyonu hesapla"""
        try:
            # Basit sektör mapping
            sector_mapping = {
                'GARAN.IS': 'Banking', 'AKBNK.IS': 'Banking', 'ISCTR.IS': 'Banking', 'YKBNK.IS': 'Banking',
                'SISE.IS': 'Manufacturing', 'EREGL.IS': 'Manufacturing', 'TUPRS.IS': 'Energy',
                'ASELS.IS': 'Technology', 'THYAO.IS': 'Transportation', 'KRDMD.IS': 'Manufacturing'
            }
            
            sector_weights = {}
            for i, symbol in enumerate(symbols):
                sector = sector_mapping.get(symbol, 'Other')
                sector_weights[sector] = sector_weights.get(sector, 0) + weights[i]
            
            return sector_weights
        except:
            return {}
    
    def _calculate_portfolio_correlation_matrix(self, returns_data: Dict[str, pd.Series]) -> pd.DataFrame:
        """Portföy korelasyon matrisi"""
        try:
            symbols = list(returns_data.keys())
            correlation_matrix = pd.DataFrame(index=symbols, columns=symbols)
            
            for sym1 in symbols:
                for sym2 in symbols:
                    if sym1 in returns_data and sym2 in returns_data:
                        corr = returns_data[sym1].corr(returns_data[sym2])
                        correlation_matrix.loc[sym1, sym2] = corr if not np.isnan(corr) else 0.0
                    else:
                        correlation_matrix.loc[sym1, sym2] = 0.0
            
            return correlation_matrix.fillna(0.0)
        except:
            return pd.DataFrame()
    
    def _calculate_risk_budget(self, stock_risks: Dict[str, RiskMetrics], 
                             weights: List[float]) -> Dict[str, float]:
        """Risk budget hesapla"""
        try:
            risk_budget = {}
            total_risk = 0.0
            
            # Toplam risk hesapla
            for i, (symbol, risk) in enumerate(stock_risks.items()):
                contribution = weights[i] * risk.volatility
                risk_budget[symbol] = contribution
                total_risk += contribution
            
            # Risk budget'i normalize et
            if total_risk > 0:
                for symbol in risk_budget:
                    risk_budget[symbol] = risk_budget[symbol] / total_risk
            
            return risk_budget
        except:
            return {}
    
    def _default_risk_metrics(self, symbol: str) -> RiskMetrics:
        """Varsayılan risk metrikleri"""
        return RiskMetrics(
            symbol=symbol,
            var_95=-0.05,
            var_99=-0.10,
            cvar_95=-0.07,
            max_drawdown=0.20,
            sharpe_ratio=0.5,
            sortino_ratio=0.6,
            calmar_ratio=0.3,
            beta=1.0,
            correlation_market=0.5,
            volatility=0.20,
            skewness=0.0,
            kurtosis=3.0,
            risk_score=50.0,
            timestamp=datetime.now()
        )
    
    def _default_portfolio_risk(self) -> PortfolioRisk:
        """Varsayılan portföy risk"""
        return PortfolioRisk(
            total_var=-0.05,
            portfolio_volatility=0.15,
            portfolio_beta=1.0,
            diversification_ratio=1.0,
            concentration_risk=0.5,
            sector_concentration={},
            correlation_matrix=pd.DataFrame(),
            risk_budget={},
            timestamp=datetime.now()
        )

def test_risk_manager():
    """Risk manager test"""
    logger.info("🧪 Advanced Risk Manager test başlıyor...")
    
    risk_manager = AdvancedRiskManager()
    
    # Test symbols
    test_symbols = ["GARAN.IS", "AKBNK.IS", "SISE.IS"]
    
    # Individual stock risk
    for symbol in test_symbols:
        risk_metrics = risk_manager.calculate_stock_risk(symbol)
        logger.info(f"📊 {symbol}: Risk Skoru {risk_metrics.risk_score:.1f}, VaR95: {risk_metrics.var_95:.3f}")
    
    # Portfolio risk
    portfolio = {"GARAN.IS": 0.4, "AKBNK.IS": 0.3, "SISE.IS": 0.3}
    portfolio_risk = risk_manager.calculate_portfolio_risk(portfolio)
    
    logger.info(f"🎯 Portföy Risk Analizi:")
    logger.info(f"   Volatilite: {portfolio_risk.portfolio_volatility:.2%}")
    logger.info(f"   Beta: {portfolio_risk.portfolio_beta:.2f}")
    logger.info(f"   Diversifikasyon: {portfolio_risk.diversification_ratio:.2f}")
    
    return portfolio_risk

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_risk_manager()
