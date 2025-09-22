#!/usr/bin/env python3
"""
🧮 Grey TOPSIS + Entropy Financial Ranking System
PRD v2.0 - Çok kriterli finansal sıralama modülü
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import yfinance as yf
from datetime import datetime, timedelta

# PyMCDM imports
try:
    from pymcdm import methods, weights, normalizations
    PYMDCM_AVAILABLE = True
except ImportError:
    PYMDCM_AVAILABLE = False
    logging.warning("PyMCDM not available. Install with: pip install pymcdm")

logger = logging.getLogger(__name__)

@dataclass
class FinancialMetrics:
    """Finansal metrikler"""
    symbol: str
    net_profit_margin: float
    roe: float
    roa: float
    debt_equity: float
    current_ratio: float
    quick_ratio: float
    pe_ratio: float
    pb_ratio: float
    dividend_yield: float
    revenue_growth: float
    eps_growth: float
    market_cap: float
    sector: str

class GreyTOPSISRanker:
    """Grey TOPSIS + Entropy finansal sıralama sistemi"""
    
    def __init__(self):
        self.criteria_weights = None
        self.normalized_data = None
        self.rankings = None
        
    def calculate_financial_metrics(self, symbols: List[str]) -> List[FinancialMetrics]:
        """Hisse sembolleri için finansal metrikleri hesapla"""
        logger.info(f"📊 {len(symbols)} hisse için finansal metrikler hesaplanıyor...")
        
        metrics_list = []
        
        for symbol in symbols:
            try:
                stock = yf.Ticker(symbol)
                info = stock.info
                financials = stock.financials
                balance_sheet = stock.balance_sheet
                
                # Temel finansal oranlar
                net_profit_margin = self._safe_get(info, 'profitMargins', 0.0)
                roe = self._safe_get(info, 'returnOnEquity', 0.0)
                roa = self._safe_get(info, 'returnOnAssets', 0.0)
                debt_equity = self._safe_get(info, 'debtToEquity', 0.0)
                current_ratio = self._safe_get(info, 'currentRatio', 0.0)
                quick_ratio = self._safe_get(info, 'quickRatio', 0.0)
                pe_ratio = self._safe_get(info, 'trailingPE', 0.0)
                pb_ratio = self._safe_get(info, 'priceToBook', 0.0)
                dividend_yield = self._safe_get(info, 'dividendYield', 0.0)
                market_cap = self._safe_get(info, 'marketCap', 0.0)
                sector = self._safe_get(info, 'sector', 'Unknown')
                
                # Büyüme oranları
                revenue_growth = self._calculate_growth_rate(financials, 'Total Revenue')
                eps_growth = self._calculate_growth_rate(financials, 'Net Income')
                
                metrics = FinancialMetrics(
                    symbol=symbol,
                    net_profit_margin=net_profit_margin * 100,  # Yüzde olarak
                    roe=roe * 100,
                    roa=roa * 100,
                    debt_equity=debt_equity,
                    current_ratio=current_ratio,
                    quick_ratio=quick_ratio,
                    pe_ratio=pe_ratio,
                    pb_ratio=pb_ratio,
                    dividend_yield=dividend_yield * 100,
                    revenue_growth=revenue_growth,
                    eps_growth=eps_growth,
                    market_cap=market_cap,
                    sector=sector
                )
                
                metrics_list.append(metrics)
                logger.info(f"✅ {symbol}: ROE={metrics.roe:.2f}%, Debt/Equity={metrics.debt_equity:.2f}")
                
            except Exception as e:
                logger.error(f"❌ {symbol} finansal metrik hatası: {e}")
                continue
        
        logger.info(f"📈 {len(metrics_list)} hisse için finansal metrikler tamamlandı")
        return metrics_list
    
    def _safe_get(self, data: dict, key: str, default: float) -> float:
        """Güvenli veri çekme"""
        try:
            value = data.get(key, default)
            return float(value) if value is not None else default
        except (ValueError, TypeError):
            return default
    
    def _calculate_growth_rate(self, financials: pd.DataFrame, metric: str) -> float:
        """Büyüme oranı hesapla"""
        try:
            if metric in financials.index:
                values = financials.loc[metric].dropna()
                if len(values) >= 2:
                    latest = values.iloc[0]
                    previous = values.iloc[1]
                    if previous != 0:
                        return ((latest - previous) / abs(previous)) * 100
            return 0.0
        except Exception:
            return 0.0
    
    def create_decision_matrix(self, metrics_list: List[FinancialMetrics]) -> Tuple[np.ndarray, List[str], List[str]]:
        """Karar matrisi oluştur"""
        logger.info("📊 Karar matrisi oluşturuluyor...")
        
        # Kriterler (pozitif = yüksek değer iyi, negatif = düşük değer iyi)
        criteria = [
            'net_profit_margin',  # +
            'roe',               # +
            'roa',               # +
            'debt_equity',       # - (düşük borç iyi)
            'current_ratio',     # +
            'quick_ratio',       # +
            'pe_ratio',          # - (düşük PE iyi)
            'pb_ratio',          # - (düşük PB iyi)
            'dividend_yield',    # +
            'revenue_growth',    # +
            'eps_growth',        # +
            'market_cap'         # + (büyük şirket iyi)
        ]
        
        criteria_names = [
            'Net Profit Margin (%)',
            'ROE (%)',
            'ROA (%)',
            'Debt/Equity',
            'Current Ratio',
            'Quick Ratio',
            'PE Ratio',
            'PB Ratio',
            'Dividend Yield (%)',
            'Revenue Growth (%)',
            'EPS Growth (%)',
            'Market Cap'
        ]
        
        # Alternatifler (hisse sembolleri)
        alternatives = [m.symbol for m in metrics_list]
        
        # Karar matrisi
        matrix = np.zeros((len(alternatives), len(criteria)))
        
        for i, metrics in enumerate(metrics_list):
            matrix[i, 0] = metrics.net_profit_margin
            matrix[i, 1] = metrics.roe
            matrix[i, 2] = metrics.roa
            matrix[i, 3] = metrics.debt_equity
            matrix[i, 4] = metrics.current_ratio
            matrix[i, 5] = metrics.quick_ratio
            matrix[i, 6] = metrics.pe_ratio
            matrix[i, 7] = metrics.pb_ratio
            matrix[i, 8] = metrics.dividend_yield
            matrix[i, 9] = metrics.revenue_growth
            matrix[i, 10] = metrics.eps_growth
            matrix[i, 11] = metrics.market_cap / 1e9  # Milyar olarak normalize et
        
        logger.info(f"✅ Karar matrisi: {matrix.shape[0]} alternatif x {matrix.shape[1]} kriter")
        return matrix, alternatives, criteria_names
    
    def calculate_entropy_weights(self, matrix: np.ndarray) -> np.ndarray:
        """Entropy yöntemi ile ağırlık hesapla"""
        logger.info("🧮 Entropy ağırlıkları hesaplanıyor...")
        
        if not PYMDCM_AVAILABLE:
            # Basit entropy hesaplama
            return self._simple_entropy_weights(matrix)
        
        try:
            # PyMCDM ile entropy ağırlık hesaplama
            weights_calc = weights.EntropyWeight()
            w = weights_calc(matrix)
            logger.info(f"✅ Entropy ağırlıkları: {w}")
            return w
        except Exception as e:
            logger.error(f"❌ Entropy ağırlık hatası: {e}")
            return self._simple_entropy_weights(matrix)
    
    def _simple_entropy_weights(self, matrix: np.ndarray) -> np.ndarray:
        """Basit entropy ağırlık hesaplama"""
        # Min-max normalizasyon
        normalized = (matrix - matrix.min(axis=0)) / (matrix.max(axis=0) - matrix.min(axis=0) + 1e-8)
        
        # Entropy hesaplama
        entropy = np.zeros(matrix.shape[1])
        for j in range(matrix.shape[1]):
            col = normalized[:, j]
            col = col / (col.sum() + 1e-8)  # Normalize
            col = col[col > 0]  # Sıfır olmayan değerler
            if len(col) > 0:
                entropy[j] = -np.sum(col * np.log(col + 1e-8))
        
        # Ağırlık hesaplama
        weights = (1 - entropy) / (len(entropy) - entropy.sum())
        return weights
    
    def apply_grey_topsis(self, matrix: np.ndarray, weights: np.ndarray, 
                         criteria_types: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Grey TOPSIS uygula"""
        logger.info("🎯 Grey TOPSIS uygulanıyor...")
        
        if not PYMDCM_AVAILABLE:
            return self._simple_topsis(matrix, weights, criteria_types)
        
        try:
            # PyMCDM ile TOPSIS
            topsis = methods.TOPSIS(normalization=normalizations.vector)
            scores = topsis(matrix, weights, criteria_types)
            
            # Sıralama
            rankings = np.argsort(scores)[::-1]  # Yüksekten düşüğe
            
            logger.info(f"✅ Grey TOPSIS tamamlandı: {len(scores)} skor")
            return scores, rankings
            
        except Exception as e:
            logger.error(f"❌ Grey TOPSIS hatası: {e}")
            return self._simple_topsis(matrix, weights, criteria_types)
    
    def _simple_topsis(self, matrix: np.ndarray, weights: np.ndarray, 
                      criteria_types: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Basit TOPSIS implementasyonu"""
        # Normalizasyon
        normalized = matrix / np.sqrt(np.sum(matrix**2, axis=0))
        
        # Ağırlıklı normalize matris
        weighted = normalized * weights
        
        # İdeal çözümler
        ideal_positive = np.zeros(matrix.shape[1])
        ideal_negative = np.zeros(matrix.shape[1])
        
        for j in range(matrix.shape[1]):
            if criteria_types[j] == 1:  # Pozitif kriter
                ideal_positive[j] = weighted[:, j].max()
                ideal_negative[j] = weighted[:, j].min()
            else:  # Negatif kriter
                ideal_positive[j] = weighted[:, j].min()
                ideal_negative[j] = weighted[:, j].max()
        
        # Mesafe hesaplama
        distances_positive = np.sqrt(np.sum((weighted - ideal_positive)**2, axis=1))
        distances_negative = np.sqrt(np.sum((weighted - ideal_negative)**2, axis=1))
        
        # TOPSIS skorları
        scores = distances_negative / (distances_positive + distances_negative + 1e-8)
        
        # Sıralama
        rankings = np.argsort(scores)[::-1]
        
        return scores, rankings
    
    def rank_stocks(self, symbols: List[str]) -> Dict[str, Dict]:
        """Hisse sıralaması yap"""
        logger.info(f"🏆 {len(symbols)} hisse için Grey TOPSIS sıralaması başlıyor...")
        
        # 1. Finansal metrikleri hesapla
        metrics_list = self.calculate_financial_metrics(symbols)
        
        if len(metrics_list) < 2:
            logger.error("❌ Yeterli finansal veri yok")
            return {}
        
        # 2. Karar matrisi oluştur
        matrix, alternatives, criteria_names = self.create_decision_matrix(metrics_list)
        
        # 3. Entropy ağırlıkları hesapla
        weights = self.calculate_entropy_weights(matrix)
        
        # 4. Kriter tipleri (1=pozitif, 0=negatif)
        criteria_types = np.array([1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1])
        
        # 5. Grey TOPSIS uygula
        scores, rankings = self.apply_grey_topsis(matrix, weights, criteria_types)
        
        # 6. Sonuçları organize et
        results = {}
        for i, rank in enumerate(rankings):
            symbol = alternatives[rank]
            metrics = next(m for m in metrics_list if m.symbol == symbol)
            
            results[symbol] = {
                'rank': i + 1,
                'topsis_score': float(scores[rank]),
                'financial_health': self._calculate_financial_health_score(metrics),
                'metrics': {
                    'net_profit_margin': metrics.net_profit_margin,
                    'roe': metrics.roe,
                    'roa': metrics.roa,
                    'debt_equity': metrics.debt_equity,
                    'current_ratio': metrics.current_ratio,
                    'pe_ratio': metrics.pe_ratio,
                    'dividend_yield': metrics.dividend_yield,
                    'revenue_growth': metrics.revenue_growth,
                    'market_cap': metrics.market_cap,
                    'sector': metrics.sector
                }
            }
        
        logger.info(f"✅ Grey TOPSIS sıralaması tamamlandı: {len(results)} hisse")
        return results
    
    def _calculate_financial_health_score(self, metrics: FinancialMetrics) -> float:
        """Finansal sağlık skoru hesapla (0-100)"""
        score = 0
        
        # Kârlılık (30 puan)
        if metrics.net_profit_margin > 10:
            score += 30
        elif metrics.net_profit_margin > 5:
            score += 20
        elif metrics.net_profit_margin > 0:
            score += 10
        
        # Verimlilik (25 puan)
        if metrics.roe > 15:
            score += 25
        elif metrics.roe > 10:
            score += 20
        elif metrics.roe > 5:
            score += 15
        elif metrics.roe > 0:
            score += 10
        
        # Borç yapısı (20 puan)
        if metrics.debt_equity < 0.3:
            score += 20
        elif metrics.debt_equity < 0.5:
            score += 15
        elif metrics.debt_equity < 1.0:
            score += 10
        elif metrics.debt_equity < 2.0:
            score += 5
        
        # Likidite (15 puan)
        if metrics.current_ratio > 2.0:
            score += 15
        elif metrics.current_ratio > 1.5:
            score += 12
        elif metrics.current_ratio > 1.0:
            score += 8
        
        # Değerleme (10 puan)
        if 5 < metrics.pe_ratio < 20:
            score += 10
        elif 10 < metrics.pe_ratio < 25:
            score += 8
        elif 15 < metrics.pe_ratio < 30:
            score += 5
        
        return min(score, 100)

def test_grey_topsis():
    """Grey TOPSIS test fonksiyonu"""
    logger.info("🧪 Grey TOPSIS test başlıyor...")
    
    # Test sembolleri
    test_symbols = [
        "GARAN.IS", "AKBNK.IS", "ISCTR.IS", "YKBNK.IS", "THYAO.IS",
        "SISE.IS", "EREGL.IS", "TUPRS.IS", "ASELS.IS", "KRDMD.IS"
    ]
    
    ranker = GreyTOPSISRanker()
    results = ranker.rank_stocks(test_symbols)
    
    # Sonuçları göster
    logger.info("="*80)
    logger.info("🏆 GREY TOPSIS + ENTROPY SIRALAMA SONUÇLARI")
    logger.info("="*80)
    
    for symbol, data in results.items():
        logger.info(f"{data['rank']:2d}. {symbol:10s} | Skor: {data['topsis_score']:.4f} | Sağlık: {data['financial_health']:.1f}/100")
        logger.info(f"     ROE: {data['metrics']['roe']:6.2f}% | Debt/Eq: {data['metrics']['debt_equity']:5.2f} | PE: {data['metrics']['pe_ratio']:6.2f}")
    
    logger.info("="*80)
    return results

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_grey_topsis()
