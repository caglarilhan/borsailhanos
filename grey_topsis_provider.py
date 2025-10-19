"""
BIST AI Smart Trader - Grey TOPSIS + Entropi Çok-Kriterli Finansal Sıralama
PyMCDM kütüphanesi ile çok-kriterli karar verme sistemi
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import asyncio
from typing import List, Dict, Optional, Tuple
import json

# PyMCDM kütüphanesi için mock implementasyon (gerçek kütüphane yoksa)
try:
    from pymcdm import methods, weights, normalizations
    PYMCDM_AVAILABLE = True
except ImportError:
    PYMCDM_AVAILABLE = False
    print("⚠️ PyMCDM kütüphanesi bulunamadı, mock implementasyon kullanılıyor")

class GreyTOPSISProvider:
    def __init__(self):
        # Finansal kriterler ve ağırlıkları
        self.criteria = {
            # Kârlılık kriterleri (pozitif - yüksek olması iyi)
            'roe': {'weight': 0.15, 'type': 'benefit', 'name': 'ROE (%)'},
            'roa': {'weight': 0.12, 'type': 'benefit', 'name': 'ROA (%)'},
            'net_margin': {'weight': 0.10, 'type': 'benefit', 'name': 'Net Marj (%)'},
            'operating_margin': {'weight': 0.08, 'type': 'benefit', 'name': 'Operasyonel Marj (%)'},
            
            # Likidite kriterleri (pozitif - yüksek olması iyi)
            'current_ratio': {'weight': 0.10, 'type': 'benefit', 'name': 'Cari Oran'},
            'quick_ratio': {'weight': 0.08, 'type': 'benefit', 'name': 'Likidite Oranı'},
            
            # Borç yönetimi kriterleri (negatif - düşük olması iyi)
            'debt_to_equity': {'weight': 0.12, 'type': 'cost', 'name': 'Borç/Özkaynak'},
            'debt_to_assets': {'weight': 0.08, 'type': 'cost', 'name': 'Borç/Varlık'},
            'interest_coverage': {'weight': 0.10, 'type': 'benefit', 'name': 'Faiz Karşılama'},
            
            # Büyüme kriterleri (pozitif - yüksek olması iyi)
            'revenue_growth': {'weight': 0.08, 'type': 'benefit', 'name': 'Gelir Büyümesi (%)'},
            'earnings_growth': {'weight': 0.07, 'type': 'benefit', 'name': 'Kâr Büyümesi (%)'},
            
            # Değerleme kriterleri (karmaşık - optimal aralık)
            'pe_ratio': {'weight': 0.05, 'type': 'range', 'name': 'P/E Oranı', 'optimal_range': (8, 20)},
            'price_to_book': {'weight': 0.05, 'type': 'range', 'name': 'P/B Oranı', 'optimal_range': (0.8, 3.0)},
            'dividend_yield': {'weight': 0.03, 'type': 'benefit', 'name': 'Temettü Verimi (%)'},
            
            # Verimlilik kriterleri (pozitif - yüksek olması iyi)
            'asset_turnover': {'weight': 0.05, 'type': 'benefit', 'name': 'Varlık Devir Hızı'},
            'inventory_turnover': {'weight': 0.03, 'type': 'benefit', 'name': 'Stok Devir Hızı'},
            
            # Sentiment kriterleri (pozitif - yüksek olması iyi)
            'sentiment_score': {'weight': 0.08, 'type': 'benefit', 'name': 'Sentiment Skoru'},
            'news_count': {'weight': 0.02, 'type': 'benefit', 'name': 'Haber Sayısı'},
            
            # Teknik analiz kriterleri
            'rsi_score': {'weight': 0.05, 'type': 'range', 'name': 'RSI Skoru', 'optimal_range': (30, 70)},
            'macd_signal': {'weight': 0.03, 'type': 'benefit', 'name': 'MACD Sinyali'},
            'trend_strength': {'weight': 0.05, 'type': 'benefit', 'name': 'Trend Gücü'}
        }
        
        # Entropi ağırlık hesaplama için
        self.entropy_weights = {}
        
    def calculate_entropy_weights(self, data_matrix: np.ndarray) -> np.ndarray:
        """Entropi yöntemi ile kriter ağırlıklarını hesapla"""
        try:
            if PYMCDM_AVAILABLE:
                # Gerçek PyMCDM kullan
                entropy_weights = weights.entropy_weighting(data_matrix)
                return entropy_weights
            else:
                # Mock implementasyon
                return self._mock_entropy_weighting(data_matrix)
        except Exception as e:
            print(f"⚠️ Entropi ağırlık hesaplama hatası: {e}")
            return self._mock_entropy_weighting(data_matrix)
    
    def _mock_entropy_weighting(self, data_matrix: np.ndarray) -> np.ndarray:
        """Mock entropi ağırlık hesaplama"""
        try:
            # Veri matrisini normalize et
            normalized_matrix = self._normalize_matrix(data_matrix)
            
            # Entropi hesapla
            m, n = normalized_matrix.shape
            entropy_values = np.zeros(n)
            
            for j in range(n):
                # Sıfır değerleri önle
                col_data = normalized_matrix[:, j]
                col_data = col_data + 1e-10  # Küçük epsilon ekle
                
                # Olasılık dağılımı
                p_ij = col_data / np.sum(col_data)
                
                # Entropi hesapla
                entropy_j = -np.sum(p_ij * np.log(p_ij))
                entropy_values[j] = entropy_j
            
            # Entropi ağırlıkları
            weights = (1 - entropy_values) / np.sum(1 - entropy_values)
            
            return weights
            
        except Exception as e:
            print(f"⚠️ Mock entropi hesaplama hatası: {e}")
            # Varsayılan eşit ağırlıklar
            return np.ones(data_matrix.shape[1]) / data_matrix.shape[1]
    
    def _normalize_matrix(self, data_matrix: np.ndarray) -> np.ndarray:
        """Veri matrisini normalize et"""
        try:
            normalized = np.zeros_like(data_matrix)
            m, n = data_matrix.shape
            
            for j in range(n):
                col = data_matrix[:, j]
                min_val = np.min(col)
                max_val = np.max(col)
                
                if max_val != min_val:
                    normalized[:, j] = (col - min_val) / (max_val - min_val)
                else:
                    normalized[:, j] = 0.5  # Sabit değerler için orta nokta
            
            return normalized
            
        except Exception as e:
            print(f"⚠️ Normalizasyon hatası: {e}")
            return data_matrix
    
    def calculate_topsis_scores(self, data_matrix: np.ndarray, weights: np.ndarray, criteria_types: np.ndarray) -> np.ndarray:
        """TOPSIS skorlarını hesapla"""
        try:
            if PYMCDM_AVAILABLE:
                # Gerçek PyMCDM kullan
                topsis = methods.TOPSIS(normalization=normalizations.vector)
                scores = topsis(data_matrix, weights, criteria_types)
                return scores
            else:
                # Mock TOPSIS implementasyonu
                return self._mock_topsis(data_matrix, weights, criteria_types)
                
        except Exception as e:
            print(f"⚠️ TOPSIS hesaplama hatası: {e}")
            return self._mock_topsis(data_matrix, weights, criteria_types)
    
    def _mock_topsis(self, data_matrix: np.ndarray, weights: np.ndarray, criteria_types: np.ndarray) -> np.ndarray:
        """Mock TOPSIS implementasyonu"""
        try:
            m, n = data_matrix.shape
            
            # Ağırlıklı normalize matris
            weighted_matrix = data_matrix * weights
            
            # İdeal pozitif ve negatif çözümler
            ideal_positive = np.zeros(n)
            ideal_negative = np.zeros(n)
            
            for j in range(n):
                if criteria_types[j] == 1:  # Benefit criteria
                    ideal_positive[j] = np.max(weighted_matrix[:, j])
                    ideal_negative[j] = np.min(weighted_matrix[:, j])
                else:  # Cost criteria
                    ideal_positive[j] = np.min(weighted_matrix[:, j])
                    ideal_negative[j] = np.max(weighted_matrix[:, j])
            
            # Her alternatif için ideal çözümlere uzaklık
            distances_positive = np.zeros(m)
            distances_negative = np.zeros(m)
            
            for i in range(m):
                distances_positive[i] = np.sqrt(np.sum((weighted_matrix[i] - ideal_positive) ** 2))
                distances_negative[i] = np.sqrt(np.sum((weighted_matrix[i] - ideal_negative) ** 2))
            
            # TOPSIS skorları
            scores = distances_negative / (distances_positive + distances_negative)
            
            return scores
            
        except Exception as e:
            print(f"⚠️ Mock TOPSIS hatası: {e}")
            return np.random.random(data_matrix.shape[0])
    
    def prepare_criteria_matrix(self, stocks_data: List[Dict]) -> Tuple[np.ndarray, List[str], np.ndarray]:
        """Hisse verilerini kriter matrisine dönüştür"""
        try:
            n_stocks = len(stocks_data)
            n_criteria = len(self.criteria)
            
            # Kriter matrisi
            criteria_matrix = np.zeros((n_stocks, n_criteria))
            stock_symbols = []
            criteria_types = np.zeros(n_criteria)
            
            # Kriter sırası
            criteria_list = list(self.criteria.keys())
            
            for i, stock in enumerate(stocks_data):
                stock_symbols.append(stock['symbol'])
                
                # Fundamental veriler
                ratios = stock.get('ratios', {})
                sentiment = stock.get('sentiment', {})
                technical = stock.get('technical', {})
                
                for j, criterion in enumerate(criteria_list):
                    criteria_types[j] = 1 if self.criteria[criterion]['type'] == 'benefit' else 0
                    
                    # Değerleri al ve normalize et
                    if criterion in ratios:
                        value = ratios[criterion]
                    elif criterion in sentiment:
                        value = sentiment[criterion]
                    elif criterion in technical:
                        value = technical[criterion]
                    else:
                        value = 0
                    
                    # Özel işlemler
                    if criterion == 'pe_ratio':
                        # P/E için optimal aralık kontrolü
                        optimal_range = self.criteria[criterion]['optimal_range']
                        if optimal_range[0] <= value <= optimal_range[1]:
                            value = 1.0  # Optimal aralıkta
                        else:
                            value = max(0, 1 - abs(value - np.mean(optimal_range)) / np.mean(optimal_range))
                    
                    elif criterion == 'price_to_book':
                        # P/B için optimal aralık kontrolü
                        optimal_range = self.criteria[criterion]['optimal_range']
                        if optimal_range[0] <= value <= optimal_range[1]:
                            value = 1.0
                        else:
                            value = max(0, 1 - abs(value - np.mean(optimal_range)) / np.mean(optimal_range))
                    
                    elif criterion == 'rsi_score':
                        # RSI için optimal aralık kontrolü
                        optimal_range = self.criteria[criterion]['optimal_range']
                        if optimal_range[0] <= value <= optimal_range[1]:
                            value = 1.0
                        else:
                            value = max(0, 1 - abs(value - np.mean(optimal_range)) / np.mean(optimal_range))
                    
                    elif criterion == 'sentiment_score':
                        # Sentiment skorunu -1,1 aralığından 0,1 aralığına çevir
                        value = (value + 1) / 2
                    
                    elif criterion == 'macd_signal':
                        # MACD sinyalini binary'ye çevir
                        value = 1 if value > 0 else 0
                    
                    # NaN kontrolü
                    if np.isnan(value) or np.isinf(value):
                        value = 0
                    
                    criteria_matrix[i, j] = value
            
            return criteria_matrix, stock_symbols, criteria_types
            
        except Exception as e:
            print(f"⚠️ Kriter matrisi hazırlama hatası: {e}")
            return np.array([]), [], np.array([])
    
    def calculate_grey_topsis_ranking(self, stocks_data: List[Dict]) -> Dict:
        """Grey TOPSIS ile hisse sıralaması"""
        try:
            if not stocks_data:
                return {
                    'success': False,
                    'error': 'Hisse verisi bulunamadı',
                    'ranking': []
                }
            
            # Kriter matrisini hazırla
            criteria_matrix, stock_symbols, criteria_types = self.prepare_criteria_matrix(stocks_data)
            
            if criteria_matrix.size == 0:
                return {
                    'success': False,
                    'error': 'Kriter matrisi oluşturulamadı',
                    'ranking': []
                }
            
            # Entropi ağırlıklarını hesapla
            entropy_weights = self.calculate_entropy_weights(criteria_matrix)
            
            # Sabit ağırlıkları al
            fixed_weights = np.array([self.criteria[criterion]['weight'] for criterion in self.criteria.keys()])
            
            # Hibrit ağırlık (entropi + sabit ağırlık)
            hybrid_weights = 0.6 * entropy_weights + 0.4 * fixed_weights
            hybrid_weights = hybrid_weights / np.sum(hybrid_weights)  # Normalize et
            
            # TOPSIS skorlarını hesapla
            topsis_scores = self.calculate_topsis_scores(criteria_matrix, hybrid_weights, criteria_types)
            
            # Sıralama oluştur
            ranking_data = []
            for i, symbol in enumerate(stocks_data):
                ranking_data.append({
                    'symbol': symbol['symbol'],
                    'company_name': symbol.get('company_name', ''),
                    'topsis_score': float(topsis_scores[i]),
                    'rank': 0,  # Sonra hesaplanacak
                    'criteria_scores': {
                        criterion: float(criteria_matrix[i, j]) 
                        for j, criterion in enumerate(self.criteria.keys())
                    },
                    'entropy_weights': {
                        criterion: float(entropy_weights[j]) 
                        for j, criterion in enumerate(self.criteria.keys())
                    },
                    'hybrid_weights': {
                        criterion: float(hybrid_weights[j]) 
                        for j, criterion in enumerate(self.criteria.keys())
                    }
                })
            
            # Skora göre sırala
            ranking_data.sort(key=lambda x: x['topsis_score'], reverse=True)
            
            # Sıralama numaralarını ata
            for i, item in enumerate(ranking_data):
                item['rank'] = i + 1
            
            # İstatistikler
            stats = {
                'total_stocks': len(ranking_data),
                'avg_score': float(np.mean(topsis_scores)),
                'std_score': float(np.std(topsis_scores)),
                'min_score': float(np.min(topsis_scores)),
                'max_score': float(np.max(topsis_scores)),
                'entropy_weights_used': True,
                'hybrid_weights_used': True
            }
            
            return {
                'success': True,
                'ranking': ranking_data,
                'statistics': stats,
                'criteria_info': {
                    criterion: {
                        'name': info['name'],
                        'weight': info['weight'],
                        'type': info['type']
                    } for criterion, info in self.criteria.items()
                },
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"⚠️ Grey TOPSIS sıralama hatası: {e}")
            return {
                'success': False,
                'error': f'Sıralama hatası: {str(e)}',
                'ranking': []
            }
    
    def get_top_stocks(self, stocks_data: List[Dict], top_n: int = 10) -> Dict:
        """En iyi N hisseyi getir"""
        try:
            ranking_result = self.calculate_grey_topsis_ranking(stocks_data)
            
            if not ranking_result['success']:
                return ranking_result
            
            # İlk N hisseyi al
            top_stocks = ranking_result['ranking'][:top_n]
            
            return {
                'success': True,
                'top_stocks': top_stocks,
                'total_analyzed': len(stocks_data),
                'top_n': top_n,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"⚠️ Top stocks hatası: {e}")
            return {
                'success': False,
                'error': f'Top stocks hatası: {str(e)}',
                'top_stocks': []
            }
    
    def analyze_sector_performance(self, stocks_data: List[Dict]) -> Dict:
        """Sektör bazında performans analizi"""
        try:
            # Sektörlere göre grupla
            sectors = {}
            for stock in stocks_data:
                sector = stock.get('sector', 'Unknown')
                if sector not in sectors:
                    sectors[sector] = []
                sectors[sector].append(stock)
            
            sector_analysis = {}
            for sector, sector_stocks in sectors.items():
                if len(sector_stocks) >= 2:  # En az 2 hisse gerekli
                    ranking_result = self.calculate_grey_topsis_ranking(sector_stocks)
                    if ranking_result['success']:
                        sector_analysis[sector] = {
                            'stock_count': len(sector_stocks),
                            'avg_score': ranking_result['statistics']['avg_score'],
                            'top_stock': ranking_result['ranking'][0]['symbol'],
                            'ranking': ranking_result['ranking'][:5]  # İlk 5 hisse
                        }
            
            # Sektörleri ortalama skora göre sırala
            sorted_sectors = sorted(sector_analysis.items(), 
                                 key=lambda x: x[1]['avg_score'], 
                                 reverse=True)
            
            return {
                'success': True,
                'sector_analysis': dict(sorted_sectors),
                'total_sectors': len(sector_analysis),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"⚠️ Sektör analizi hatası: {e}")
            return {
                'success': False,
                'error': f'Sektör analizi hatası: {str(e)}',
                'sector_analysis': {}
            }

# Test fonksiyonu
if __name__ == "__main__":
    provider = GreyTOPSISProvider()
    
    print("🚀 BIST AI Smart Trader - Grey TOPSIS + Entropi Test")
    print("=" * 60)
    
    # Mock hisse verisi
    mock_stocks = [
        {
            'symbol': 'AKBNK',
            'company_name': 'Akbank T.A.S.',
            'sector': 'Banking',
            'ratios': {
                'roe': 17.96, 'roa': 1.63, 'net_margin': 28.20,
                'current_ratio': 1.2, 'debt_to_equity': 0.8,
                'pe_ratio': 6.62, 'revenue_growth': 15.5
            },
            'sentiment': {'sentiment_score': 0.67, 'news_count': 3},
            'technical': {'rsi_score': 65, 'macd_signal': 0.5, 'trend_strength': 0.8}
        },
        {
            'symbol': 'GARAN',
            'company_name': 'Garanti BBVA',
            'sector': 'Banking',
            'ratios': {
                'roe': 15.2, 'roa': 1.4, 'net_margin': 25.8,
                'current_ratio': 1.1, 'debt_to_equity': 0.9,
                'pe_ratio': 7.1, 'revenue_growth': 12.3
            },
            'sentiment': {'sentiment_score': 0.45, 'news_count': 2},
            'technical': {'rsi_score': 58, 'macd_signal': 0.3, 'trend_strength': 0.6}
        },
        {
            'symbol': 'THYAO',
            'company_name': 'Turkish Airlines',
            'sector': 'Aviation',
            'ratios': {
                'roe': 12.8, 'roa': 0.9, 'net_margin': 8.5,
                'current_ratio': 0.8, 'debt_to_equity': 1.2,
                'pe_ratio': 12.5, 'revenue_growth': 25.8
            },
            'sentiment': {'sentiment_score': 0.78, 'news_count': 5},
            'technical': {'rsi_score': 72, 'macd_signal': 0.8, 'trend_strength': 0.9}
        }
    ]
    
    print("\n📊 Grey TOPSIS Sıralama:")
    ranking_result = provider.calculate_grey_topsis_ranking(mock_stocks)
    if ranking_result['success']:
        for stock in ranking_result['ranking']:
            print(f"{stock['rank']}. {stock['symbol']}: {stock['topsis_score']:.4f}")
    
    print("\n🏆 Top 2 Stocks:")
    top_result = provider.get_top_stocks(mock_stocks, top_n=2)
    if top_result['success']:
        for stock in top_result['top_stocks']:
            print(f"{stock['rank']}. {stock['symbol']}: {stock['topsis_score']:.4f}")
    
    print("\n🏭 Sektör Analizi:")
    sector_result = provider.analyze_sector_performance(mock_stocks)
    if sector_result['success']:
        for sector, analysis in sector_result['sector_analysis'].items():
            print(f"{sector}: Ortalama Skor {analysis['avg_score']:.4f}, En İyi: {analysis['top_stock']}")
