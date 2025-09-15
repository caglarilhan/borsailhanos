"""
🚀 Grey TOPSIS + Entropi Ranking - BIST AI Smart Trader
Çok kriterli finansal sıralama için Grey TOPSIS + Entropi ağırlık
PyMCDM kullanarak BIST ve ABD hisseleri için ranking
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
import logging
from datetime import datetime
import asyncio
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.decomposition import PCA
import warnings
warnings.filterwarnings('ignore')

# PyMCDM import (eğer yoksa fallback)
try:
    from pymcdm import methods, weights, normalizations
    PYMCDM_AVAILABLE = True
except ImportError:
    PYMCDM_AVAILABLE = False
    print("⚠️ PyMCDM bulunamadı, manuel implementasyon kullanılacak")

class GreyTOPSISEntropyRanking:
    """
    Grey TOPSIS + Entropi ağırlıklı çok kriterli finansal sıralama
    BIST ve ABD hisseleri için optimize edilmiş
    """
    
    def __init__(self):
        # Logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Kriterler ve ağırlıkları
        self.criteria = {
            'return_on_equity': {'weight': 0.25, 'type': 'benefit', 'description': 'Özsermaye Karlılığı'},
            'return_on_assets': {'weight': 0.20, 'type': 'benefit', 'description': 'Varlık Karlılığı'},
            'net_profit_margin': {'weight': 0.20, 'type': 'benefit', 'description': 'Net Kâr Marjı'},
            'debt_to_equity': {'weight': 0.15, 'type': 'cost', 'description': 'Borç/Özsermaye Oranı'},
            'current_ratio': {'weight': 0.10, 'type': 'benefit', 'description': 'Cari Oran'},
            'asset_turnover': {'weight': 0.10, 'type': 'benefit', 'description': 'Varlık Devir Hızı'}
        }
        
        # Sonuçlar
        self.ranking_results = {}
        self.entropy_weights = {}
        self.topsis_scores = {}
        
    def _entropy_weighting(self, data: np.ndarray) -> np.ndarray:
        """Entropi ağırlık hesaplama"""
        try:
            if PYMCDM_AVAILABLE:
                # PyMCDM ile entropi ağırlık
                return weights.entropy_weighting(data)
            else:
                # Manuel entropi ağırlık hesaplama
                return self._manual_entropy_weighting(data)
        except Exception as e:
            self.logger.error(f"❌ Entropi ağırlık hatası: {e}")
            # Eşit ağırlık fallback
            n_criteria = data.shape[1]
            return np.ones(n_criteria) / n_criteria
    
    def _manual_entropy_weighting(self, data: np.ndarray) -> np.ndarray:
        """Manuel entropi ağırlık hesaplama"""
        try:
            # Normalize data (0-1 arası)
            scaler = MinMaxScaler()
            normalized_data = scaler.fit_transform(data)
            
            # Entropi hesapla
            n_alternatives, n_criteria = normalized_data.shape
            entropy = np.zeros(n_criteria)
            
            for j in range(n_criteria):
                # 0'a bölme hatasını önle
                col_data = normalized_data[:, j]
                col_data = col_data[col_data > 0]  # Sadece pozitif değerler
                
                if len(col_data) == 0:
                    entropy[j] = 0
                    continue
                
                # Normalize
                p_ij = col_data / col_data.sum()
                
                # Entropi: -sum(p * log(p))
                entropy[j] = -np.sum(p_ij * np.log(p_ij + 1e-10))
            
            # Entropi varyasyonu
            entropy_variation = 1 - entropy / np.log(n_alternatives)
            
            # Ağırlıklar
            weights = entropy_variation / entropy_variation.sum()
            
            return weights
            
        except Exception as e:
            self.logger.error(f"❌ Manuel entropi hesaplama hatası: {e}")
            # Eşit ağırlık fallback
            n_criteria = data.shape[1]
            return np.ones(n_criteria) / n_criteria
    
    def _grey_normalization(self, data: np.ndarray, criteria_types: np.ndarray) -> np.ndarray:
        """Grey normalization uygula"""
        try:
            if PYMCDM_AVAILABLE:
                # PyMCDM ile grey normalization
                return normalizations.vector(data, criteria_types)
            else:
                # Manuel grey normalization
                return self._manual_grey_normalization(data, criteria_types)
        except Exception as e:
            self.logger.error(f"❌ Grey normalization hatası: {e}")
            # MinMax normalization fallback
            scaler = MinMaxScaler()
            return scaler.fit_transform(data)
    
    def _manual_grey_normalization(self, data: np.ndarray, criteria_types: np.ndarray) -> np.ndarray:
        """Manuel grey normalization"""
        try:
            normalized = np.zeros_like(data)
            n_alternatives, n_criteria = data.shape
            
            for j in range(n_criteria):
                col_data = data[:, j]
                
                if criteria_types[j] == 1:  # Benefit criteria
                    # Larger is better
                    min_val = col_data.min()
                    max_val = col_data.max()
                    if max_val - min_val == 0:
                        normalized[:, j] = 1.0
                    else:
                        normalized[:, j] = (col_data - min_val) / (max_val - min_val)
                else:  # Cost criteria
                    # Smaller is better
                    min_val = col_data.min()
                    max_val = col_data.max()
                    if max_val - min_val == 0:
                        normalized[:, j] = 1.0
                    else:
                        normalized[:, j] = (max_val - col_data) / (max_val - min_val)
            
            return normalized
            
        except Exception as e:
            self.logger.error(f"❌ Manuel grey normalization hatası: {e}")
            # MinMax normalization fallback
            scaler = MinMaxScaler()
            return scaler.fit_transform(data)
    
    def _calculate_topsis(self, normalized_data: np.ndarray, weights: np.ndarray) -> np.ndarray:
        """TOPSIS skor hesaplama"""
        try:
            if PYMCDM_AVAILABLE:
                # PyMCDM ile TOPSIS
                topsis = methods.TOPSIS(normalization=normalizations.vector)
                return topsis(normalized_data, weights, np.ones(len(weights)))
            else:
                # Manuel TOPSIS hesaplama
                return self._manual_topsis(normalized_data, weights)
        except Exception as e:
            self.logger.error(f"❌ TOPSIS hesaplama hatası: {e}")
            # Basit weighted sum fallback
            return np.dot(normalized_data, weights)
    
    def _manual_topsis(self, normalized_data: np.ndarray, weights: np.ndarray) -> np.ndarray:
        """Manuel TOPSIS hesaplama"""
        try:
            # Weighted normalized decision matrix
            weighted_matrix = normalized_data * weights
            
            # Ideal positive and negative solutions
            ideal_positive = weighted_matrix.max(axis=0)
            ideal_negative = weighted_matrix.min(axis=0)
            
            # Distances to ideal solutions
            n_alternatives = normalized_data.shape[0]
            scores = np.zeros(n_alternatives)
            
            for i in range(n_alternatives):
                # Distance to positive ideal
                d_positive = np.sqrt(np.sum((weighted_matrix[i] - ideal_positive) ** 2))
                
                # Distance to negative ideal
                d_negative = np.sqrt(np.sum((weighted_matrix[i] - ideal_negative) ** 2))
                
                # TOPSIS score
                if d_positive + d_negative == 0:
                    scores[i] = 0
                else:
                    scores[i] = d_negative / (d_positive + d_negative)
            
            return scores
            
        except Exception as e:
            self.logger.error(f"❌ Manuel TOPSIS hatası: {e}")
            # Basit weighted sum fallback
            return np.dot(normalized_data, weights)
    
    def prepare_data_matrix(self, financial_data: List[Dict]) -> Tuple[np.ndarray, List[str], np.ndarray]:
        """Finansal veriyi matris formatına çevir"""
        try:
            symbols = []
            data_matrix = []
            criteria_types = []
            
            # Kriter sırasını belirle
            criteria_order = list(self.criteria.keys())
            
            for criterion in criteria_order:
                criteria_types.append(1 if self.criteria[criterion]['type'] == 'benefit' else 0)
            
            # Her hisse için veri topla
            for stock_data in financial_data:
                symbol = stock_data.get('symbol', 'UNKNOWN')
                symbols.append(symbol)
                
                row_data = []
                for criterion in criteria_order:
                    if criterion == 'return_on_equity':
                        value = stock_data.get('dupont', {}).get('ROE', 0)
                    elif criterion == 'return_on_assets':
                        value = stock_data.get('dupont', {}).get('ROA', 0)
                    elif criterion == 'net_profit_margin':
                        value = stock_data.get('ratios', [{}])[0].get('netProfitMargin', 0)
                    elif criterion == 'debt_to_equity':
                        value = stock_data.get('ratios', [{}])[0].get('debtToEquity', 0)
                    elif criterion == 'current_ratio':
                        value = stock_data.get('ratios', [{}])[0].get('currentRatio', 0)
                    elif criterion == 'asset_turnover':
                        value = stock_data.get('dupont', {}).get('Asset_Turnover', 0)
                    else:
                        value = 0
                    
                    # NaN ve None değerleri 0 yap
                    if pd.isna(value) or value is None:
                        value = 0
                    
                    row_data.append(float(value))
                
                data_matrix.append(row_data)
            
            return np.array(data_matrix), symbols, np.array(criteria_types)
            
        except Exception as e:
            self.logger.error(f"❌ Veri matrisi hazırlama hatası: {e}")
            return np.array([]), [], np.array([])
    
    def calculate_ranking(self, financial_data: List[Dict]) -> Dict:
        """Grey TOPSIS + Entropi ile ranking hesapla"""
        try:
            self.logger.info("🚀 Grey TOPSIS + Entropi ranking başlıyor...")
            
            # Veri matrisini hazırla
            data_matrix, symbols, criteria_types = self.prepare_data_matrix(financial_data)
            
            if len(data_matrix) == 0:
                raise ValueError("Veri matrisi boş")
            
            self.logger.info(f"✅ {len(symbols)} hisse için {len(criteria_types)} kriter hazırlandı")
            
            # 1. Entropi ağırlık hesapla
            entropy_weights = self._entropy_weighting(data_matrix)
            self.entropy_weights = dict(zip(self.criteria.keys(), entropy_weights))
            
            self.logger.info("✅ Entropi ağırlıkları hesaplandı")
            
            # 2. Grey normalization
            normalized_data = self._grey_normalization(data_matrix, criteria_types)
            self.logger.info("✅ Grey normalization tamamlandı")
            
            # 3. TOPSIS skor hesapla
            topsis_scores = self._calculate_topsis(normalized_data, entropy_weights)
            self.topsis_scores = dict(zip(symbols, topsis_scores))
            
            self.logger.info("✅ TOPSIS skorları hesaplandı")
            
            # 4. Sonuçları sırala
            ranking_results = []
            for i, symbol in enumerate(symbols):
                ranking_results.append({
                    'rank': 0,  # Geçici
                    'symbol': symbol,
                    'topsis_score': topsis_scores[i],
                    'financial_score': financial_data[i].get('percentage', 0),
                    'dupont_roe': financial_data[i].get('dupont', {}).get('ROE', 0),
                    'piotroski_score': financial_data[i].get('piotroski_f_score', 0),
                    'calculation_date': datetime.now().isoformat()
                })
            
            # TOPSIS skoruna göre sırala
            ranking_results.sort(key=lambda x: x['topsis_score'], reverse=True)
            
            # Rank numaralarını ata
            for i, result in enumerate(ranking_results):
                result['rank'] = i + 1
            
            self.ranking_results = ranking_results
            
            self.logger.info("✅ Ranking tamamlandı")
            
            return {
                'ranking': ranking_results,
                'entropy_weights': self.entropy_weights,
                'topsis_scores': self.topsis_scores,
                'criteria_info': self.criteria,
                'calculation_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"❌ Ranking hesaplama hatası: {e}")
            return {
                'error': str(e),
                'ranking': [],
                'calculation_date': datetime.now().isoformat()
            }
    
    def get_top_stocks(self, n: int = 10) -> List[Dict]:
        """En iyi N hisseyi getir"""
        if not self.ranking_results:
            return []
        
        return self.ranking_results[:n]
    
    def export_ranking_csv(self, filename: str = None) -> str:
        """Ranking sonuçlarını CSV olarak export et"""
        try:
            if not self.ranking_results:
                raise ValueError("Ranking sonuçları yok")
            
            if filename is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"grey_topsis_ranking_{timestamp}.csv"
            
            # DataFrame oluştur
            df = pd.DataFrame(self.ranking_results)
            
            # CSV export
            df.to_csv(filename, index=False, encoding='utf-8')
            
            self.logger.info(f"✅ Ranking CSV export edildi: {filename}")
            return filename
            
        except Exception as e:
            self.logger.error(f"❌ CSV export hatası: {e}")
            return ""

# Test fonksiyonu
async def test_grey_topsis():
    """Grey TOPSIS + Entropi test fonksiyonu"""
    
    # Test finansal veri
    test_financial_data = [
        {
            'symbol': 'SISE.IS',
            'percentage': 85.5,
            'dupont': {'ROE': 0.18, 'ROA': 0.12, 'Asset_Turnover': 1.2},
            'ratios': [{'netProfitMargin': 0.15, 'debtToEquity': 0.4, 'currentRatio': 2.1}],
            'piotroski_f_score': 7
        },
        {
            'symbol': 'EREGL.IS',
            'percentage': 78.2,
            'dupont': {'ROE': 0.15, 'ROA': 0.10, 'Asset_Turnover': 1.0},
            'ratios': [{'netProfitMargin': 0.12, 'debtToEquity': 0.6, 'currentRatio': 1.8}],
            'piotroski_f_score': 6
        },
        {
            'symbol': 'AAPL',
            'percentage': 92.1,
            'dupont': {'ROE': 0.25, 'ROA': 0.18, 'Asset_Turnover': 1.5},
            'ratios': [{'netProfitMargin': 0.22, 'debtToEquity': 0.2, 'currentRatio': 2.5}],
            'piotroski_f_score': 8
        }
    ]
    
    print("🚀 Grey TOPSIS + Entropi test başlıyor...")
    
    try:
        # Ranking hesapla
        ranking_system = GreyTOPSISEntropyRanking()
        results = ranking_system.calculate_ranking(test_financial_data)
        
        if 'error' in results:
            print(f"❌ Hata: {results['error']}")
            return
        
        print("\n📊 Ranking Sonuçları:")
        for stock in results['ranking']:
            print(f"  {stock['rank']}. {stock['symbol']}: {stock['topsis_score']:.4f} | Finansal: {stock['financial_score']:.1f}%")
        
        print("\n⚖️ Entropi Ağırlıkları:")
        for criterion, weight in results['entropy_weights'].items():
            print(f"  {criterion}: {weight:.4f}")
        
        # CSV export
        csv_file = ranking_system.export_ranking_csv()
        print(f"\n💾 CSV export: {csv_file}")
        
    except Exception as e:
        print(f"❌ Test hatası: {e}")

if __name__ == "__main__":
    # Test çalıştır
    asyncio.run(test_grey_topsis())

