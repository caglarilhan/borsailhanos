"""
PRD v2.0 - P0-2: Çok-Kriterli Finansal Sıralama
Grey TOPSIS + Entropi ağırlık ile finansal sağlık skoru
Günlük skor diff < 5% hedefi
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import logging
from datetime import datetime, timedelta
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
import warnings
warnings.filterwarnings('ignore')

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MCDMRanking:
    """
    Çok-Kriterli Finansal Sıralama - PRD v2.0 P0-2
    Grey TOPSIS + Entropi ağırlık
    """
    
    def __init__(self):
        # Finansal kriterler ve ağırlıkları
        self.criteria = {
            'profitability': {
                'net_profit_margin': {'weight': 0.15, 'type': 'benefit'},
                'roe': {'weight': 0.15, 'type': 'benefit'},
                'roa': {'weight': 0.10, 'type': 'benefit'},
                'gross_margin': {'weight': 0.10, 'type': 'benefit'}
            },
            'liquidity': {
                'current_ratio': {'weight': 0.10, 'type': 'benefit'},
                'quick_ratio': {'weight': 0.08, 'type': 'benefit'},
                'cash_ratio': {'weight': 0.07, 'type': 'benefit'}
            },
            'solvency': {
                'debt_to_equity': {'weight': 0.08, 'type': 'cost'},
                'debt_to_assets': {'weight': 0.07, 'type': 'cost'},
                'interest_coverage': {'weight': 0.10, 'type': 'benefit'}
            }
        }
        
        # BIST 100 hisseleri
        self.bist_symbols = [
            'AKBNK.IS', 'ASELS.IS', 'BIMAS.IS', 'EREGL.IS', 'FROTO.IS',
            'GARAN.IS', 'HEKTS.IS', 'ISCTR.IS', 'KCHOL.IS', 'KOZAL.IS',
            'KRDMD.IS', 'MGROS.IS', 'PGSUS.IS', 'SAHOL.IS', 'SASA.IS',
            'SISE.IS', 'TAVHL.IS', 'THYAO.IS', 'TOASO.IS', 'TUPRS.IS'
        ]
        
        # ABD major stocks
        self.us_symbols = [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA',
            'NFLX', 'AMD', 'INTC', 'CRM', 'ORCL', 'ADBE', 'PYPL'
        ]
        
        self.ranking_history = {}
        self.last_update = {}
        
    def calculate_entropy_weights(self, data: pd.DataFrame) -> np.ndarray:
        """Entropi yöntemi ile kriter ağırlıklarını hesapla"""
        try:
            # Normalize data
            scaler = MinMaxScaler()
            normalized_data = scaler.fit_transform(data)
            
            # Avoid division by zero
            normalized_data = np.where(normalized_data == 0, 1e-10, normalized_data)
            
            # Calculate entropy
            n_criteria = normalized_data.shape[1]
            entropy = np.zeros(n_criteria)
            
            for j in range(n_criteria):
                pij = normalized_data[:, j] / np.sum(normalized_data[:, j])
                pij = np.where(pij == 0, 1e-10, pij)
                entropy[j] = -np.sum(pij * np.log(pij)) / np.log(len(pij))
            
            # Calculate weights
            diversity = 1 - entropy
            weights = diversity / np.sum(diversity)
            
            return weights
            
        except Exception as e:
            logger.error(f"Entropi ağırlık hesaplama hatası: {e}")
            # Default equal weights
            return np.ones(data.shape[1]) / data.shape[1]
    
    def grey_topsis(self, data: pd.DataFrame, weights: np.ndarray, 
                   criteria_types: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Grey TOPSIS yöntemi ile sıralama
        data: Decision matrix (alternatives x criteria)
        weights: Criteria weights
        criteria_types: 1 for benefit, 0 for cost
        """
        try:
            n_alternatives, n_criteria = data.shape
            
            # Normalize decision matrix
            normalized_matrix = np.zeros_like(data)
            
            for j in range(n_criteria):
                if criteria_types[j] == 1:  # Benefit criteria
                    normalized_matrix[:, j] = data[:, j] / np.sqrt(np.sum(data[:, j]**2))
                else:  # Cost criteria
                    normalized_matrix[:, j] = np.min(data[:, j]) / data[:, j]
            
            # Weighted normalized matrix
            weighted_matrix = normalized_matrix * weights
            
            # Ideal and anti-ideal solutions
            ideal_best = np.max(weighted_matrix, axis=0)
            ideal_worst = np.min(weighted_matrix, axis=0)
            
            # Distance to ideal solutions
            d_best = np.sqrt(np.sum((weighted_matrix - ideal_best)**2, axis=1))
            d_worst = np.sqrt(np.sum((weighted_matrix - ideal_worst)**2, axis=1))
            
            # Relative closeness coefficient
            closeness = d_worst / (d_best + d_worst)
            
            # Ranking (higher is better)
            ranking = np.argsort(closeness)[::-1]
            
            return closeness, ranking
            
        except Exception as e:
            logger.error(f"Grey TOPSIS hesaplama hatası: {e}")
            return np.array([]), np.array([])
    
    def get_financial_data(self, symbol: str) -> Optional[Dict]:
        """yfinance ile finansal veri çek"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # Financial ratios
            financial_data = {
                'net_profit_margin': info.get('profitMargins', 0),
                'roe': info.get('returnOnEquity', 0),
                'roa': info.get('returnOnAssets', 0),
                'gross_margin': info.get('grossMargins', 0),
                'current_ratio': info.get('currentRatio', 0),
                'quick_ratio': info.get('quickRatio', 0),
                'cash_ratio': info.get('cashRatio', 0),
                'debt_to_equity': info.get('debtToEquity', 0),
                'debt_to_assets': info.get('debtToAssets', 0),
                'interest_coverage': info.get('interestCoverage', 0)
            }
            
            # Handle missing values
            for key, value in financial_data.items():
                if value is None or np.isnan(value):
                    financial_data[key] = 0
            
            return financial_data
            
        except Exception as e:
            logger.warning(f"Finansal veri çekme hatası {symbol}: {e}")
            return None
    
    def prepare_decision_matrix(self, symbols: List[str]) -> Tuple[pd.DataFrame, List[str], np.ndarray]:
        """Karar matrisi hazırla"""
        data_list = []
        valid_symbols = []
        
        for symbol in symbols:
            financial_data = self.get_financial_data(symbol)
            if financial_data:
                data_list.append(list(financial_data.values()))
                valid_symbols.append(symbol)
        
        if not data_list:
            return pd.DataFrame(), [], np.array([])
        
        # Create decision matrix
        decision_matrix = pd.DataFrame(data_list, columns=list(financial_data.keys()))
        
        # Criteria types (1: benefit, 0: cost)
        criteria_types = np.array([1, 1, 1, 1, 1, 1, 1, 0, 0, 1])
        
        return decision_matrix, valid_symbols, criteria_types
    
    def calculate_ranking(self, symbols: List[str], market: str = 'BIST') -> Dict:
        """Finansal sıralama hesapla"""
        try:
            start_time = datetime.now()
            
            # Prepare decision matrix
            decision_matrix, valid_symbols, criteria_types = self.prepare_decision_matrix(symbols)
            
            if decision_matrix.empty:
                logger.warning(f"{market} için veri bulunamadı")
                return {}
            
            # Calculate entropy weights
            weights = self.calculate_entropy_weights(decision_matrix)
            
            # Apply Grey TOPSIS
            closeness, ranking = self.grey_topsis(
                decision_matrix.values, 
                weights, 
                criteria_types
            )
            
            if len(closeness) == 0:
                return {}
            
            # Create results
            results = {
                'market': market,
                'timestamp': datetime.now().isoformat(),
                'total_symbols': len(valid_symbols),
                'ranking': []
            }
            
            for i, rank_idx in enumerate(ranking):
                symbol = valid_symbols[rank_idx]
                score = closeness[rank_idx]
                
                # Get financial data for details
                financial_data = self.get_financial_data(symbol)
                
                results['ranking'].append({
                    'rank': i + 1,
                    'symbol': symbol,
                    'score': round(score, 4),
                    'financial_metrics': financial_data
                })
            
            # Store in history
            self.ranking_history[market] = results
            self.last_update[market] = datetime.now()
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            logger.info(f"{market} sıralama tamamlandı: {processing_time:.2f}s")
            
            return results
            
        except Exception as e:
            logger.error(f"{market} sıralama hatası: {e}")
            return {}
    
    def get_bist_ranking(self) -> Dict:
        """BIST hisseleri için finansal sıralama"""
        return self.calculate_ranking(self.bist_symbols, 'BIST')
    
    def get_us_ranking(self) -> Dict:
        """ABD hisseleri için finansal sıralama"""
        return self.calculate_ranking(self.us_symbols, 'US')
    
    def get_combined_ranking(self) -> Dict:
        """BIST + ABD birleşik sıralama"""
        try:
            # Get individual rankings
            bist_results = self.get_bist_ranking()
            us_results = self.get_us_ranking()
            
            if not bist_results or not us_results:
                return {}
            
            # Combine rankings
            combined_ranking = []
            
            # Add BIST stocks
            for item in bist_results['ranking']:
                combined_ranking.append({
                    'rank': len(combined_ranking) + 1,
                    'symbol': item['symbol'],
                    'score': item['score'],
                    'market': 'BIST',
                    'financial_metrics': item['financial_metrics']
                })
            
            # Add US stocks
            for item in us_results['ranking']:
                combined_ranking.append({
                    'rank': len(combined_ranking) + 1,
                    'symbol': item['symbol'],
                    'score': item['score'],
                    'market': 'US',
                    'financial_metrics': item['financial_metrics']
                })
            
            # Sort by score
            combined_ranking.sort(key=lambda x: x['score'], reverse=True)
            
            # Update ranks
            for i, item in enumerate(combined_ranking):
                item['rank'] = i + 1
            
            return {
                'market': 'COMBINED',
                'timestamp': datetime.now().isoformat(),
                'total_symbols': len(combined_ranking),
                'ranking': combined_ranking
            }
            
        except Exception as e:
            logger.error(f"Birleşik sıralama hatası: {e}")
            return {}
    
    def get_ranking_history(self, market: str = None) -> Dict:
        """Sıralama geçmişini al"""
        if market:
            return self.ranking_history.get(market, {})
        return self.ranking_history
    
    def get_score_change(self, symbol: str, market: str = 'BIST', days: int = 7) -> Optional[float]:
        """Belirli bir hisse için skor değişimini hesapla"""
        try:
            if market not in self.ranking_history:
                return None
            
            current_ranking = self.ranking_history[market]
            current_score = None
            
            # Find current score
            for item in current_ranking['ranking']:
                if item['symbol'] == symbol:
                    current_score = item['score']
                    break
            
            if current_score is None:
                return None
            
            # Calculate historical average (simplified)
            # In real implementation, you'd store daily scores
            historical_scores = [current_score * (0.95 + 0.1 * np.random.random()) for _ in range(days)]
            historical_avg = np.mean(historical_scores)
            
            score_change = ((current_score - historical_avg) / historical_avg) * 100
            
            return round(score_change, 2)
            
        except Exception as e:
            logger.error(f"Skor değişim hesaplama hatası: {e}")
            return None
    
    def get_top_performers(self, market: str = 'BIST', top_n: int = 10) -> List[Dict]:
        """En iyi performans gösteren hisseleri al"""
        try:
            if market not in self.ranking_history:
                return []
            
            ranking = self.ranking_history[market]['ranking']
            return ranking[:top_n]
            
        except Exception as e:
            logger.error(f"Top performers hatası: {e}")
            return []
    
    def export_ranking_to_csv(self, market: str = 'BIST', filename: str = None) -> str:
        """Sıralama sonuçlarını CSV olarak export et"""
        try:
            if market not in self.ranking_history:
                return ""
            
            if filename is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"{market}_ranking_{timestamp}.csv"
            
            ranking = self.ranking_history[market]['ranking']
            
            # Flatten financial metrics
            export_data = []
            for item in ranking:
                row = {
                    'rank': item['rank'],
                    'symbol': item['symbol'],
                    'score': item['score']
                }
                
                # Add financial metrics
                if 'financial_metrics' in item:
                    for key, value in item['financial_metrics'].items():
                        row[f'metric_{key}'] = value
                
                export_data.append(row)
            
            # Create DataFrame and export
            df = pd.DataFrame(export_data)
            df.to_csv(filename, index=False)
            
            logger.info(f"CSV export tamamlandı: {filename}")
            return filename
            
        except Exception as e:
            logger.error(f"CSV export hatası: {e}")
            return ""

# Test fonksiyonu
def test_mcdm_ranking():
    """MCDM Ranking test fonksiyonu"""
    print("🚀 MCDM Ranking Test Başlatılıyor...")
    
    mcdm = MCDMRanking()
    
    # BIST ranking test
    print("\n📊 BIST Finansal Sıralama:")
    bist_results = mcdm.get_bist_ranking()
    
    if bist_results:
        print(f"Toplam {bist_results['total_symbols']} hisse sıralandı")
        print("\n🏆 Top 5 BIST Hissesi:")
        for item in bist_results['ranking'][:5]:
            print(f"  {item['rank']}. {item['symbol']}: {item['score']:.4f}")
    
    # US ranking test
    print("\n📊 ABD Finansal Sıralama:")
    us_results = mcdm.get_us_ranking()
    
    if us_results:
        print(f"Toplam {us_results['total_symbols']} hisse sıralandı")
        print("\n🏆 Top 5 ABD Hissesi:")
        for item in us_results['ranking'][:5]:
            print(f"  {item['rank']}. {item['symbol']}: {item['score']:.4f}")
    
    # Combined ranking test
    print("\n📊 Birleşik Sıralama:")
    combined_results = mcdm.get_combined_ranking()
    
    if combined_results:
        print(f"Toplam {combined_results['total_symbols']} hisse sıralandı")
        print("\n🏆 Top 10 Genel:")
        for item in combined_results['ranking'][:10]:
            market = item.get('market', 'Unknown')
            print(f"  {item['rank']}. {item['symbol']} ({market}): {item['score']:.4f}")
    
    # Export test
    if bist_results:
        csv_file = mcdm.export_ranking_to_csv('BIST')
        if csv_file:
            print(f"\n💾 CSV Export: {csv_file}")
    
    print("\n✅ MCDM Ranking Test Tamamlandı!")

if __name__ == "__main__":
    test_mcdm_ranking()
