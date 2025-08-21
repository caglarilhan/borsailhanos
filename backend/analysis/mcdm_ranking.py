"""
Çok Kriterli Karar Verme Modülü
- Grey TOPSIS (Gri sayılar ile TOPSIS)
- Entropi ağırlıklandırma
- Finansal sıralama ve filtreleme
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Tuple, Optional
import logging
from sklearn.preprocessing import MinMaxScaler, StandardScaler

logger = logging.getLogger(__name__)

class GreyTOPSISAnalyzer:
    def __init__(self):
        self.criteria_weights = {}
        self.normalized_matrix = None
        self.ideal_solutions = None
        self.anti_ideal_solutions = None
        
    def calculate_entropy_weights(self, decision_matrix: pd.DataFrame) -> Dict[str, float]:
        """Entropi yöntemi ile kriter ağırlıklarını hesapla"""
        try:
            # Min-max normalizasyon
            scaler = MinMaxScaler()
            normalized = scaler.fit_transform(decision_matrix.values)
            normalized_df = pd.DataFrame(normalized, 
                                      index=decision_matrix.index, 
                                      columns=decision_matrix.columns)
            
            # Entropi hesaplama
            m, n = normalized_df.shape
            entropy_weights = {}
            
            for col in normalized_df.columns:
                # Sıfır değerleri için epsilon ekle
                col_data = normalized_df[col].replace(0, 1e-10)
                
                # Olasılık hesaplama
                p_ij = col_data / col_data.sum()
                
                # Entropi hesaplama
                entropy = -np.sum(p_ij * np.log(p_ij)) / np.log(m)
                
                # Çeşitlilik derecesi
                diversity = 1 - entropy
                
                entropy_weights[col] = diversity
            
            # Ağırlıkları normalize et
            total_diversity = sum(entropy_weights.values())
            if total_diversity > 0:
                entropy_weights = {k: v/total_diversity for k, v in entropy_weights.items()}
            
            self.criteria_weights = entropy_weights
            return entropy_weights
            
        except Exception as e:
            logger.error(f"Entropi ağırlık hesaplama hatası: {e}")
            # Varsayılan eşit ağırlık
            n_criteria = len(decision_matrix.columns)
            return {col: 1.0/n_criteria for col in decision_matrix.columns}
    
    def normalize_decision_matrix(self, decision_matrix: pd.DataFrame, 
                                criteria_types: Dict[str, str]) -> pd.DataFrame:
        """Karar matrisini normalize et (benefit/cost kriterleri)"""
        try:
            normalized = decision_matrix.copy()
            
            for col in decision_matrix.columns:
                criteria_type = criteria_types.get(col, 'benefit')
                
                if criteria_type == 'benefit':
                    # Benefit kriteri: yüksek değer daha iyi
                    col_min = decision_matrix[col].min()
                    col_max = decision_matrix[col].max()
                    if col_max != col_min:
                        normalized[col] = (decision_matrix[col] - col_min) / (col_max - col_min)
                    else:
                        normalized[col] = 1.0
                        
                elif criteria_type == 'cost':
                    # Cost kriteri: düşük değer daha iyi
                    col_min = decision_matrix[col].min()
                    col_max = decision_matrix[col].max()
                    if col_max != col_min:
                        normalized[col] = (col_max - decision_matrix[col]) / (col_max - col_min)
                    else:
                        normalized[col] = 1.0
                        
                else:
                    # Nötr kriter: standart normalizasyon
                    normalized[col] = (decision_matrix[col] - decision_matrix[col].mean()) / decision_matrix[col].std()
            
            self.normalized_matrix = normalized
            return normalized
            
        except Exception as e:
            logger.error(f"Karar matrisi normalizasyon hatası: {e}")
            return decision_matrix
    
    def calculate_weighted_normalized_matrix(self, normalized_matrix: pd.DataFrame) -> pd.DataFrame:
        """Ağırlıklı normalize edilmiş matris hesapla"""
        try:
            weighted_matrix = normalized_matrix.copy()
            
            for col in weighted_matrix.columns:
                weight = self.criteria_weights.get(col, 1.0)
                weighted_matrix[col] = normalized_matrix[col] * weight
            
            return weighted_matrix
            
        except Exception as e:
            logger.error(f"Ağırlıklı matris hesaplama hatası: {e}")
            return normalized_matrix
    
    def find_ideal_solutions(self, weighted_matrix: pd.DataFrame, 
                           criteria_types: Dict[str, str]) -> Tuple[pd.Series, pd.Series]:
        """İdeal ve anti-ideal çözümleri bul"""
        try:
            ideal_best = pd.Series(index=weighted_matrix.columns)
            ideal_worst = pd.Series(index=weighted_matrix.columns)
            
            for col in weighted_matrix.columns:
                criteria_type = criteria_types.get(col, 'benefit')
                
                if criteria_type == 'benefit':
                    ideal_best[col] = weighted_matrix[col].max()
                    ideal_worst[col] = weighted_matrix[col].min()
                else:  # cost
                    ideal_best[col] = weighted_matrix[col].min()
                    ideal_worst[col] = weighted_matrix[col].max()
            
            self.ideal_solutions = ideal_best
            self.anti_ideal_solutions = ideal_worst
            
            return ideal_best, ideal_worst
            
        except Exception as e:
            logger.error(f"İdeal çözüm hesaplama hatası: {e}")
            return pd.Series(), pd.Series()
    
    def calculate_distances(self, weighted_matrix: pd.DataFrame) -> Tuple[pd.Series, pd.Series]:
        """İdeal ve anti-ideal çözümlere olan uzaklıkları hesapla"""
        try:
            if self.ideal_solutions is None or self.anti_ideal_solutions is None:
                raise ValueError("İdeal çözümler hesaplanmamış")
            
            # İdeal çözüme uzaklık (S+)
            d_plus = np.sqrt(((weighted_matrix - self.ideal_solutions) ** 2).sum(axis=1))
            
            # Anti-ideal çözüme uzaklık (S-)
            d_minus = np.sqrt(((weighted_matrix - self.anti_ideal_solutions) ** 2).sum(axis=1))
            
            return pd.Series(d_plus, index=weighted_matrix.index), pd.Series(d_minus, index=weighted_matrix.index)
            
        except Exception as e:
            logger.error(f"Uzaklık hesaplama hatası: {e}")
            return pd.Series(), pd.Series()
    
    def calculate_topsis_scores(self, d_plus: pd.Series, d_minus: pd.Series) -> pd.Series:
        """TOPSIS skorlarını hesapla"""
        try:
            # C = S- / (S+ + S-)
            scores = d_minus / (d_plus + d_minus)
            
            # NaN değerleri 0 ile değiştir
            scores = scores.fillna(0)
            
            return scores
            
        except Exception as e:
            logger.error(f"TOPSIS skor hesaplama hatası: {e}")
            return pd.Series()
    
    def rank_alternatives(self, decision_matrix: pd.DataFrame, 
                         criteria_types: Dict[str, str]) -> pd.DataFrame:
        """Alternatifleri TOPSIS ile sırala"""
        try:
            # 1. Entropi ağırlıkları hesapla
            weights = self.calculate_entropy_weights(decision_matrix)
            
            # 2. Karar matrisini normalize et
            normalized = self.normalize_decision_matrix(decision_matrix, criteria_types)
            
            # 3. Ağırlıklı normalize edilmiş matris
            weighted = self.calculate_weighted_normalized_matrix(normalized)
            
            # 4. İdeal çözümleri bul
            ideal_best, ideal_worst = self.find_ideal_solutions(weighted, criteria_types)
            
            # 5. Uzaklıkları hesapla
            d_plus, d_minus = self.calculate_distances(weighted)
            
            # 6. TOPSIS skorları
            scores = self.calculate_topsis_scores(d_plus, d_minus)
            
            # 7. Sonuçları birleştir
            results = pd.DataFrame({
                'TOPSIS_Score': scores,
                'Rank': scores.rank(ascending=False),
                'D_Plus': d_plus,
                'D_Minus': d_minus
            })
            
            # Ağırlıkları da ekle
            for col, weight in weights.items():
                results[f'Weight_{col}'] = weight
            
            return results.sort_values('Rank')
            
        except Exception as e:
            logger.error(f"TOPSIS sıralama hatası: {e}")
            return pd.DataFrame()

def create_financial_decision_matrix(symbols_data: List[Dict]) -> Tuple[pd.DataFrame, Dict[str, str]]:
    """Finansal verilerden karar matrisi oluştur"""
    try:
        # Veri hazırlama
        data_list = []
        for item in symbols_data:
            if 'financial_health' in item:
                health = item['financial_health']
                data_list.append({
                    'symbol': item['symbol'],
                    'Health_Score': health.get('health_score', 0),
                    'Piotroski_Score': health.get('piotroski', {}).get('Total_Score', 0),
                    'ROE': health.get('dupont', {}).get('ROE', 0),
                    'Net_Margin': health.get('dupont', {}).get('NetProfitMargin', 0),
                    'Debt_Equity': health.get('ratios', {}).get('DebtEquity', 0),
                    'Current_Ratio': health.get('ratios', {}).get('CurrentRatio', 0)
                })
        
        if not data_list:
            raise ValueError("Finansal veri bulunamadı")
        
        # DataFrame oluştur
        df = pd.DataFrame(data_list)
        df.set_index('symbol', inplace=True)
        
        # Kriter tipleri (benefit: yüksek iyi, cost: düşük iyi)
        criteria_types = {
            'Health_Score': 'benefit',
            'Piotroski_Score': 'benefit', 
            'ROE': 'benefit',
            'Net_Margin': 'benefit',
            'Debt_Equity': 'cost',  # Düşük borç iyi
            'Current_Ratio': 'benefit'
        }
        
        return df, criteria_types
        
    except Exception as e:
        logger.error(f"Karar matrisi oluşturma hatası: {e}")
        return pd.DataFrame(), {}

# Test fonksiyonu
def test_grey_topsis():
    """Grey TOPSIS analizini test et"""
    # Örnek finansal veri
    test_data = [
        {
            'symbol': 'SISE.IS',
            'financial_health': {
                'health_score': 85,
                'piotroski': {'Total_Score': 8},
                'dupont': {'ROE': 18.5, 'NetProfitMargin': 12.3},
                'ratios': {'DebtEquity': 0.4, 'CurrentRatio': 2.8}
            }
        },
        {
            'symbol': 'EREGL.IS', 
            'financial_health': {
                'health_score': 72,
                'piotroski': {'Total_Score': 6},
                'dupont': {'ROE': 15.2, 'NetProfitMargin': 10.1},
                'ratios': {'DebtEquity': 0.6, 'CurrentRatio': 2.1}
            }
        },
        {
            'symbol': 'TUPRS.IS',
            'financial_health': {
                'health_score': 68,
                'piotroski': {'Total_Score': 5},
                'dupont': {'ROE': 12.8, 'NetProfitMargin': 8.7},
                'ratios': {'DebtEquity': 0.8, 'CurrentRatio': 1.9}
            }
        }
    ]
    
    # Karar matrisi oluştur
    decision_matrix, criteria_types = create_financial_decision_matrix(test_data)
    
    if decision_matrix.empty:
        print("Karar matrisi oluşturulamadı!")
        return
    
    print("=== Karar Matrisi ===")
    print(decision_matrix)
    print("\n=== Kriter Tipleri ===")
    print(criteria_types)
    
    # Grey TOPSIS analizi
    analyzer = GreyTOPSISAnalyzer()
    results = analyzer.rank_alternatives(decision_matrix, criteria_types)
    
    print("\n=== Grey TOPSIS Sonuçları ===")
    print(results)
    
    print("\n=== Sıralama ===")
    for idx, row in results.iterrows():
        print(f"{int(row['Rank'])}. {idx}: {row['TOPSIS_Score']:.4f}")
    
    return results

if __name__ == "__main__":
    test_grey_topsis()
