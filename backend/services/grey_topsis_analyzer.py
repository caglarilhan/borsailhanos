"""
PRD v2.0 - Grey TOPSIS + Entropi Ağırlıklı Çok Kriterli Finansal Sıralama
PyMCDM ile finansal sağlık skoru ve Top N hisse filtreleme
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional, Tuple
import json

# PyMCDM import (fallback if not available)
try:
    from pymcdm import methods, weights, normalizations
    PYDMCDM_AVAILABLE = True
except ImportError:
    PYDMCDM_AVAILABLE = False
    logging.warning("⚠️ PyMCDM bulunamadı, basit TOPSIS implementasyonu kullanılacak")

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GreyTOPSISAnalyzer:
    """Grey TOPSIS + Entropi ağırlıklı çok kriterli finansal sıralama"""
    
    def __init__(self):
        self.criteria_weights = {}
        self.stock_data = {}
        self.ranking_history = []
        
        # Finansal kriterler ve ağırlıkları
        self.financial_criteria = {
            "net_profit_margin": {"weight": 0.15, "type": "benefit", "description": "Net Kâr Marjı"},
            "roe": {"weight": 0.20, "type": "benefit", "description": "Özkaynak Karlılığı"},
            "roa": {"weight": 0.15, "type": "benefit", "description": "Varlık Karlılığı"},
            "debt_equity": {"weight": 0.10, "type": "cost", "description": "Borç/Özkaynak"},
            "current_ratio": {"weight": 0.10, "type": "benefit", "description": "Cari Oran"},
            "pe_ratio": {"weight": 0.10, "type": "cost", "description": "F/K Oranı"},
            "pb_ratio": {"weight": 0.10, "type": "cost", "description": "PD/DD Oranı"},
            "dividend_yield": {"weight": 0.10, "type": "benefit", "description": "Temettü Verimi"}
        }
        
        # BIST 100 hisseleri
        self.bist_symbols = [
            "GARAN.IS", "AKBNK.IS", "ISCTR.IS", "THYAO.IS", "TUPRS.IS",
            "ASELS.IS", "KRDMD.IS", "SAHOL.IS", "BIMAS.IS", "EREGL.IS",
            "SISE.IS", "KOZAL.IS", "PETKM.IS", "TCELL.IS", "VAKBN.IS",
            "ARCLK.IS", "KCHOL.IS", "TOASO.IS", "ENKAI.IS", "MGROS.IS"
        ]
        
    def get_financial_data(self, symbol: str) -> Dict:
        """Hisse için finansal verileri çek"""
        try:
            logger.info(f"📊 {symbol} finansal verileri çekiliyor...")
            
            # Yahoo Finance'den temel veriler
            stock = yf.Ticker(symbol)
            info = stock.info
            
            # Fiyat verisi
            hist = stock.history(period="1y")
            if hist.empty:
                return {}
            
            current_price = hist['Close'].iloc[-1]
            
            # Finansal oranlar (simüle edilmiş - gerçek uygulamada FMP API kullanılabilir)
            financial_data = {
                "symbol": symbol,
                "current_price": current_price,
                "market_cap": info.get('marketCap', 0),
                "net_profit_margin": self._simulate_financial_ratio("net_profit_margin"),
                "roe": self._simulate_financial_ratio("roe"),
                "roa": self._simulate_financial_ratio("roa"),
                "debt_equity": self._simulate_financial_ratio("debt_equity"),
                "current_ratio": self._simulate_financial_ratio("current_ratio"),
                "pe_ratio": info.get('trailingPE', self._simulate_financial_ratio("pe_ratio")),
                "pb_ratio": info.get('priceToBook', self._simulate_financial_ratio("pb_ratio")),
                "dividend_yield": info.get('dividendYield', self._simulate_financial_ratio("dividend_yield")),
                "volume": hist['Volume'].iloc[-1],
                "avg_volume": hist['Volume'].mean(),
                "volatility": hist['Close'].pct_change().std() * np.sqrt(252),
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"✅ {symbol} finansal verileri alındı")
            return financial_data
            
        except Exception as e:
            logger.error(f"❌ {symbol} finansal veri hatası: {e}")
            return {}
    
    def _simulate_financial_ratio(self, ratio_type: str) -> float:
        """Finansal oran simülasyonu (gerçek uygulamada FMP API kullanılacak)"""
        np.random.seed(hash(ratio_type) % 2**32)
        
        if ratio_type == "net_profit_margin":
            return np.random.uniform(5, 25)  # %5-25
        elif ratio_type == "roe":
            return np.random.uniform(8, 30)   # %8-30
        elif ratio_type == "roa":
            return np.random.uniform(3, 15)   # %3-15
        elif ratio_type == "debt_equity":
            return np.random.uniform(0.2, 1.5)  # 0.2-1.5
        elif ratio_type == "current_ratio":
            return np.random.uniform(1.0, 3.0)  # 1.0-3.0
        elif ratio_type == "pe_ratio":
            return np.random.uniform(8, 25)     # 8-25
        elif ratio_type == "pb_ratio":
            return np.random.uniform(0.8, 4.0)  # 0.8-4.0
        elif ratio_type == "dividend_yield":
            return np.random.uniform(1, 8)      # %1-8
        else:
            return 0.0
    
    def calculate_entropy_weights(self, criteria_matrix: np.ndarray) -> np.ndarray:
        """Entropi ağırlıklandırma"""
        try:
            if PYDMCDM_AVAILABLE:
                # PyMCDM ile entropi ağırlıklandırma
                weights_array = weights.entropy_weighting(criteria_matrix)
                return weights_array
            else:
                # Basit entropi implementasyonu
                return self._simple_entropy_weighting(criteria_matrix)
                
        except Exception as e:
            logger.error(f"❌ Entropi ağırlıklandırma hatası: {e}")
            # Varsayılan eşit ağırlık
            return np.ones(criteria_matrix.shape[1]) / criteria_matrix.shape[1]
    
    def _simple_entropy_weighting(self, criteria_matrix: np.ndarray) -> np.ndarray:
        """Basit entropi ağırlıklandırma implementasyonu"""
        try:
            # Normalizasyon
            normalized_matrix = criteria_matrix / criteria_matrix.sum(axis=0)
            
            # Entropi hesaplama
            entropy = -np.sum(normalized_matrix * np.log(normalized_matrix + 1e-10), axis=0)
            
            # Ağırlık hesaplama
            weights = (1 - entropy) / np.sum(1 - entropy)
            
            return weights
            
        except Exception as e:
            logger.error(f"❌ Basit entropi hatası: {e}")
            return np.ones(criteria_matrix.shape[1]) / criteria_matrix.shape[1]
    
    def calculate_topsis_score(self, criteria_matrix: np.ndarray, weights: np.ndarray, criteria_types: np.ndarray) -> np.ndarray:
        """TOPSIS skoru hesapla"""
        try:
            if PYDMCDM_AVAILABLE:
                # PyMCDM ile TOPSIS
                topsis = methods.TOPSIS(normalization=normalizations.vector)
                scores = topsis(criteria_matrix, weights, criteria_types)
                return scores
            else:
                # Basit TOPSIS implementasyonu
                return self._simple_topsis(criteria_matrix, weights, criteria_types)
                
        except Exception as e:
            logger.error(f"❌ TOPSIS hesaplama hatası: {e}")
            return np.zeros(criteria_matrix.shape[0])
    
    def _simple_topsis(self, criteria_matrix: np.ndarray, weights: np.ndarray, criteria_types: np.ndarray) -> np.ndarray:
        """Basit TOPSIS implementasyonu"""
        try:
            # Normalizasyon
            normalized_matrix = criteria_matrix / np.sqrt(np.sum(criteria_matrix**2, axis=0))
            
            # Ağırlıklandırma
            weighted_matrix = normalized_matrix * weights
            
            # İdeal pozitif ve negatif çözümler
            ideal_positive = np.max(weighted_matrix, axis=0)
            ideal_negative = np.min(weighted_matrix, axis=0)
            
            # Cost kriterleri için ters çevir
            for i, criteria_type in enumerate(criteria_types):
                if criteria_type == 0:  # Cost
                    ideal_positive[i], ideal_negative[i] = ideal_negative[i], ideal_positive[i]
            
            # Mesafe hesaplama
            distance_positive = np.sqrt(np.sum((weighted_matrix - ideal_positive)**2, axis=1))
            distance_negative = np.sqrt(np.sum((weighted_matrix - ideal_negative)**2, axis=1))
            
            # TOPSIS skoru
            scores = distance_negative / (distance_positive + distance_negative)
            
            return scores
            
        except Exception as e:
            logger.error(f"❌ Basit TOPSIS hatası: {e}")
            return np.zeros(criteria_matrix.shape[0])
    
    def rank_stocks(self, symbols: List[str] = None) -> Dict:
        """Hisse senetlerini sırala"""
        try:
            if symbols is None:
                symbols = self.bist_symbols
            
            logger.info(f"🚀 {len(symbols)} hisse için Grey TOPSIS sıralaması başlatılıyor...")
            
            # Finansal verileri çek
            financial_data = []
            valid_symbols = []
            
            for symbol in symbols:
                data = self.get_financial_data(symbol)
                if data:
                    financial_data.append(data)
                    valid_symbols.append(symbol)
            
            if not financial_data:
                return {"error": "Geçerli finansal veri bulunamadı"}
            
            # Kriterler matrisi oluştur
            criteria_matrix = []
            criteria_names = list(self.financial_criteria.keys())
            
            for data in financial_data:
                row = []
                for criteria in criteria_names:
                    value = data.get(criteria, 0)
                    row.append(value)
                criteria_matrix.append(row)
            
            criteria_matrix = np.array(criteria_matrix)
            
            # Entropi ağırlıkları hesapla
            entropy_weights = self.calculate_entropy_weights(criteria_matrix)
            
            # Kriter tipleri (1: benefit, 0: cost)
            criteria_types = np.array([
                1 if self.financial_criteria[name]["type"] == "benefit" else 0
                for name in criteria_names
            ])
            
            # TOPSIS skorları hesapla
            topsis_scores = self.calculate_topsis_score(criteria_matrix, entropy_weights, criteria_types)
            
            # Sonuçları sırala
            results = []
            for i, symbol in enumerate(valid_symbols):
                results.append({
                    "symbol": symbol,
                    "topsis_score": round(topsis_scores[i], 4),
                    "rank": 0,  # Sıralama sonra yapılacak
                    "financial_data": financial_data[i],
                    "criteria_scores": dict(zip(criteria_names, criteria_matrix[i]))
                })
            
            # Sıralama
            results.sort(key=lambda x: x["topsis_score"], reverse=True)
            for i, result in enumerate(results):
                result["rank"] = i + 1
            
            # Top N hisseler
            top_n = min(10, len(results))
            top_stocks = results[:top_n]
            
            # Analiz sonuçları
            analysis_result = {
                "total_stocks": len(results),
                "top_n": top_n,
                "ranking_date": datetime.now().isoformat(),
                "entropy_weights": dict(zip(criteria_names, entropy_weights)),
                "criteria_types": dict(zip(criteria_names, criteria_types)),
                "top_stocks": top_stocks,
                "all_rankings": results,
                "method": "Grey TOPSIS + Entropi Ağırlıklandırma"
            }
            
            # Geçmişe kaydet
            self.ranking_history.append(analysis_result)
            
            logger.info(f"✅ Grey TOPSIS sıralaması tamamlandı")
            logger.info(f"🏆 En iyi hisse: {top_stocks[0]['symbol']} (Skor: {top_stocks[0]['topsis_score']})")
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"❌ Grey TOPSIS sıralama hatası: {e}")
            return {"error": str(e)}
    
    def get_top_n_stocks(self, n: int = 10) -> Dict:
        """Top N hisse senetlerini getir"""
        try:
            if not self.ranking_history:
                # Yeni sıralama yap
                ranking_result = self.rank_stocks()
                if "error" in ranking_result:
                    return ranking_result
            
            latest_ranking = self.ranking_history[-1]
            top_n = latest_ranking["top_stocks"][:n]
            
            return {
                "top_n": n,
                "stocks": top_n,
                "ranking_date": latest_ranking["ranking_date"],
                "method": latest_ranking["method"]
            }
            
        except Exception as e:
            logger.error(f"❌ Top N hisse hatası: {e}")
            return {"error": str(e)}
    
    def get_stock_analysis(self, symbol: str) -> Dict:
        """Belirli bir hisse için detaylı analiz"""
        try:
            # Finansal veri
            financial_data = self.get_financial_data(symbol)
            if not financial_data:
                return {"error": f"{symbol} için veri bulunamadı"}
            
            # Sıralama içindeki pozisyon
            ranking_position = None
            if self.ranking_history:
                latest_ranking = self.ranking_history[-1]
                for stock in latest_ranking["all_rankings"]:
                    if stock["symbol"] == symbol:
                        ranking_position = stock
                        break
            
            # Kriter bazında analiz
            criteria_analysis = {}
            for criteria, config in self.financial_criteria.items():
                value = financial_data.get(criteria, 0)
                criteria_analysis[criteria] = {
                    "value": value,
                    "weight": config["weight"],
                    "type": config["type"],
                    "description": config["description"],
                    "score": self._calculate_criteria_score(value, criteria, config["type"])
                }
            
            return {
                "symbol": symbol,
                "financial_data": financial_data,
                "ranking_position": ranking_position,
                "criteria_analysis": criteria_analysis,
                "overall_score": ranking_position["topsis_score"] if ranking_position else 0,
                "analysis_date": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ {symbol} analiz hatası: {e}")
            return {"error": str(e)}
    
    def _calculate_criteria_score(self, value: float, criteria: str, criteria_type: str) -> float:
        """Kriter bazında skor hesapla"""
        try:
            # Basit skorlama (0-1 arası)
            if criteria_type == "benefit":
                # Yüksek değer = yüksek skor
                if criteria in ["net_profit_margin", "roe", "roa"]:
                    return min(value / 30, 1.0)  # %30 max
                elif criteria == "current_ratio":
                    return min(value / 3.0, 1.0)  # 3.0 max
                elif criteria == "dividend_yield":
                    return min(value / 8, 1.0)  # %8 max
            else:  # cost
                # Düşük değer = yüksek skor
                if criteria in ["debt_equity", "pe_ratio", "pb_ratio"]:
                    return max(0, 1 - value / 5.0)  # 5.0 max
            
            return 0.5  # Varsayılan
            
        except Exception as e:
            logger.error(f"❌ Kriter skoru hatası: {e}")
            return 0.5
    
    def get_ranking_history(self) -> List[Dict]:
        """Sıralama geçmişini getir"""
        return self.ranking_history
    
    def export_ranking_report(self, format: str = "json") -> str:
        """Sıralama raporunu dışa aktar"""
        try:
            if not self.ranking_history:
                return "Sıralama geçmişi bulunamadı"
            
            latest_ranking = self.ranking_history[-1]
            
            if format == "json":
                return json.dumps(latest_ranking, indent=2, ensure_ascii=False)
            elif format == "csv":
                # CSV format için basit implementasyon
                csv_data = "Symbol,Rank,TOPSIS_Score,Net_Profit_Margin,ROE,ROA,Debt_Equity,Current_Ratio,PE_Ratio,PB_Ratio,Dividend_Yield\n"
                for stock in latest_ranking["top_stocks"]:
                    csv_data += f"{stock['symbol']},{stock['rank']},{stock['topsis_score']},"
                    csv_data += f"{stock['criteria_scores']['net_profit_margin']},{stock['criteria_scores']['roe']},"
                    csv_data += f"{stock['criteria_scores']['roa']},{stock['criteria_scores']['debt_equity']},"
                    csv_data += f"{stock['criteria_scores']['current_ratio']},{stock['criteria_scores']['pe_ratio']},"
                    csv_data += f"{stock['criteria_scores']['pb_ratio']},{stock['criteria_scores']['dividend_yield']}\n"
                return csv_data
            else:
                return "Desteklenmeyen format"
                
        except Exception as e:
            logger.error(f"❌ Rapor dışa aktarma hatası: {e}")
            return "Rapor oluşturulamadı"

# Test fonksiyonu
if __name__ == "__main__":
    analyzer = GreyTOPSISAnalyzer()
    
    # Test sıralaması
    logger.info("🧪 Grey TOPSIS test başlatılıyor...")
    
    # Top 5 hisse
    result = analyzer.get_top_n_stocks(5)
    logger.info(f"📊 Top 5 hisse: {result}")
    
    # Detaylı analiz
    if result.get("stocks"):
        top_stock = result["stocks"][0]["symbol"]
        analysis = analyzer.get_stock_analysis(top_stock)
        logger.info(f"🔍 {top_stock} detaylı analiz: {analysis}")
    
    # Rapor dışa aktarma
    report = analyzer.export_ranking_report("json")
    logger.info(f"📋 Rapor: {report[:200]}...")
