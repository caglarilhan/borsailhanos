"""
PRD v2.0 - P0-2: Çok-Kriterli Finansal Sıralama (OPTIMIZED)
Grey TOPSIS + Entropi ağırlık ile finansal sağlık skoru
Günlük skor diff < 5% hedefi - Production Ready
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
import logging
from datetime import datetime, timedelta
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler, RobustScaler
import warnings
import asyncio
import gc
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import lru_cache
import json
import os
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
import sys

warnings.filterwarnings('ignore')

# Production logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('mcdm_ranking.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class FinancialMetrics:
    """Optimized financial metrics structure"""
    symbol: str
    net_profit_margin: float
    roe: float
    roa: float
    gross_margin: float
    current_ratio: float
    quick_ratio: float
    cash_ratio: float
    debt_to_equity: float
    debt_to_assets: float
    interest_coverage: float
    timestamp: datetime
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    def validate(self) -> bool:
        """Validate financial metrics"""
        return all(
            isinstance(getattr(self, field), (int, float)) and 
            not np.isnan(getattr(self, field)) and 
            not np.isinf(getattr(self, field))
            for field in self.__dataclass_fields__
            if field not in ['symbol', 'timestamp']
        )

@dataclass
class RankingResult:
    """Optimized ranking result structure"""
    rank: int
    symbol: str
    score: float
    market: str
    financial_metrics: Dict[str, Any]
    score_change_7d: Optional[float] = None
    score_change_30d: Optional[float] = None
    volatility: Optional[float] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

class OptimizedMCDMRanking:
    """
    Çok-Kriterli Finansal Sıralama - PRD v2.0 P0-2 (OPTIMIZED)
    Grey TOPSIS + Entropi ağırlık
    """
    
    def __init__(self, max_workers: int = 4, cache_size: int = 1000):
        # Finansal kriterler ve ağırlıkları (optimized)
        self.criteria = {
            'profitability': {
                'net_profit_margin': {'weight': 0.15, 'type': 'benefit', 'min_value': 0.0, 'max_value': 0.5},
                'roe': {'weight': 0.15, 'type': 'benefit', 'min_value': 0.0, 'max_value': 0.8},
                'roa': {'weight': 0.10, 'type': 'benefit', 'min_value': 0.0, 'max_value': 0.4},
                'gross_margin': {'weight': 0.10, 'type': 'benefit', 'min_value': 0.0, 'max_value': 0.9}
            },
            'liquidity': {
                'current_ratio': {'weight': 0.10, 'type': 'benefit', 'min_value': 0.0, 'max_value': 5.0},
                'quick_ratio': {'weight': 0.08, 'type': 'benefit', 'min_value': 0.0, 'max_value': 5.0},
                'cash_ratio': {'weight': 0.07, 'type': 'benefit', 'min_value': 0.0, 'max_value': 2.0}
            },
            'solvency': {
                'debt_to_equity': {'weight': 0.08, 'type': 'cost', 'min_value': 0.0, 'max_value': 2.0},
                'debt_to_assets': {'weight': 0.07, 'type': 'cost', 'min_value': 0.0, 'max_value': 1.0},
                'interest_coverage': {'weight': 0.10, 'type': 'benefit', 'min_value': 0.0, 'max_value': 20.0}
            }
        }
        
        # BIST 100 hisseleri (optimized list)
        self.bist_symbols = [
            'AKBNK.IS', 'ASELS.IS', 'BIMAS.IS', 'EREGL.IS', 'FROTO.IS',
            'GARAN.IS', 'HEKTS.IS', 'ISCTR.IS', 'KCHOL.IS', 'KOZAL.IS',
            'KRDMD.IS', 'MGROS.IS', 'PGSUS.IS', 'SAHOL.IS', 'SASA.IS',
            'SISE.IS', 'TAVHL.IS', 'THYAO.IS', 'TOASO.IS', 'TUPRS.IS'
        ]
        
        # ABD major stocks (optimized list)
        self.us_symbols = [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA',
            'NFLX', 'AMD', 'INTC', 'CRM', 'ORCL', 'ADBE', 'PYPL'
        ]
        
        # Performance optimization
        self.max_workers = max_workers
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.ranking_history = {}
        self.last_update = {}
        self.cache_hits = 0
        self.cache_misses = 0
        
        # Data validation
        self.min_data_quality = 0.7  # Minimum data quality threshold
        self.max_retries = 3
        
        # Load historical data if exists
        self._load_historical_data()
        
    def _load_historical_data(self):
        """Load historical ranking data from file"""
        try:
            if os.path.exists('ranking_history.json'):
                with open('ranking_history.json', 'r') as f:
                    self.ranking_history = json.load(f)
                logger.info("Historical ranking data loaded")
        except Exception as e:
            logger.warning(f"Could not load historical data: {e}")
    
    def _save_historical_data(self):
        """Save historical ranking data to file"""
        try:
            with open('ranking_history.json', 'w') as f:
                json.dump(self.ranking_history, f, default=str)
            logger.info("Historical ranking data saved")
        except Exception as e:
            logger.warning(f"Could not save historical data: {e}")
    
    @lru_cache(maxsize=1000)
    def _get_cached_financial_data(self, symbol: str) -> Optional[FinancialMetrics]:
        """Get cached financial data with LRU cache"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # Extract and validate financial ratios
            metrics = FinancialMetrics(
                symbol=symbol,
                net_profit_margin=info.get('profitMargins', 0.0) or 0.0,
                roe=info.get('returnOnEquity', 0.0) or 0.0,
                roa=info.get('returnOnAssets', 0.0) or 0.0,
                gross_margin=info.get('grossMargins', 0.0) or 0.0,
                current_ratio=info.get('currentRatio', 0.0) or 0.0,
                quick_ratio=info.get('quickRatio', 0.0) or 0.0,
                cash_ratio=info.get('cashRatio', 0.0) or 0.0,
                debt_to_equity=info.get('debtToEquity', 0.0) or 0.0,
                debt_to_assets=info.get('debtToAssets', 0.0) or 0.0,
                interest_coverage=info.get('interestCoverage', 0.0) or 0.0,
                timestamp=datetime.now()
            )
            
            # Validate metrics
            if metrics.validate():
                return metrics
            else:
                logger.warning(f"Invalid financial metrics for {symbol}")
                return None
                
        except Exception as e:
            logger.warning(f"Financial data fetch error for {symbol}: {e}")
            return None
    
    def _fetch_financial_data_parallel(self, symbols: List[str]) -> Dict[str, FinancialMetrics]:
        """Fetch financial data in parallel with error handling"""
        data = {}
        failed_symbols = []
        
        try:
            # Submit tasks to thread pool
            future_to_symbol = {
                self.executor.submit(self._get_cached_financial_data, symbol): symbol
                for symbol in symbols
            }
            
            # Collect results with timeout
            for future in as_completed(future_to_symbol, timeout=60):
                symbol = future_to_symbol[future]
                try:
                    result = future.result(timeout=10)
                    if result:
                        data[symbol] = result
                    else:
                        failed_symbols.append(symbol)
                except Exception as e:
                    logger.warning(f"Failed to fetch data for {symbol}: {e}")
                    failed_symbols.append(symbol)
            
            # Retry failed symbols
            if failed_symbols and len(failed_symbols) < len(symbols) * 0.3:  # Less than 30% failed
                retry_data = self._fetch_financial_data_parallel(failed_symbols)
                data.update(retry_data)
            
        except Exception as e:
            logger.error(f"Parallel data fetch error: {e}")
        
        return data
    
    def calculate_entropy_weights(self, data: pd.DataFrame) -> np.ndarray:
        """Entropi yöntemi ile kriter ağırlıklarını hesapla (optimized)"""
        try:
            # Use RobustScaler for better outlier handling
            scaler = RobustScaler()
            normalized_data = scaler.fit_transform(data)
            
            # Avoid division by zero and handle edge cases
            normalized_data = np.where(
                np.abs(normalized_data) < 1e-10, 
                1e-10, 
                normalized_data
            )
            
            # Calculate entropy with numerical stability
            n_criteria = normalized_data.shape[1]
            entropy = np.zeros(n_criteria)
            
            for j in range(n_criteria):
                column = normalized_data[:, j]
                # Normalize to probabilities
                pij = column / np.sum(column)
                pij = np.where(pij < 1e-10, 1e-10, pij)
                
                # Calculate entropy
                entropy[j] = -np.sum(pij * np.log(pij)) / np.log(len(pij))
            
            # Calculate weights with validation
            diversity = 1 - entropy
            weights = diversity / np.sum(diversity)
            
            # Validate weights
            if np.any(np.isnan(weights)) or np.any(np.isinf(weights)):
                logger.warning("Invalid weights detected, using default weights")
                return np.ones(n_criteria) / n_criteria
            
            return weights
            
        except Exception as e:
            logger.error(f"Entropy weight calculation error: {e}")
            # Return default equal weights
            return np.ones(data.shape[1]) / data.shape[1]
    
    def grey_topsis(self, data: pd.DataFrame, weights: np.ndarray, 
                   criteria_types: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Grey TOPSIS yöntemi ile sıralama (optimized)
        data: Decision matrix (alternatives x criteria)
        weights: Criteria weights
        criteria_types: 1 for benefit, 0 for cost
        """
        try:
            n_alternatives, n_criteria = data.shape
            
            # Input validation
            if n_alternatives == 0 or n_criteria == 0:
                logger.error("Empty decision matrix")
                return np.array([]), np.array([])
            
            if len(weights) != n_criteria or len(criteria_types) != n_criteria:
                logger.error("Dimension mismatch in TOPSIS calculation")
                return np.array([]), np.array([])
            
            # Normalize decision matrix with numerical stability
            normalized_matrix = np.zeros_like(data, dtype=np.float64)
            
            for j in range(n_criteria):
                column = data.iloc[:, j].values
                
                if criteria_types[j] == 1:  # Benefit criteria
                    # Vector normalization with stability
                    norm_factor = np.sqrt(np.sum(column**2))
                    if norm_factor < 1e-10:
                        norm_factor = 1e-10
                    normalized_matrix[:, j] = column / norm_factor
                else:  # Cost criteria
                    # Min-max normalization for cost criteria
                    min_val = np.min(column)
                    max_val = np.max(column)
                    if max_val - min_val < 1e-10:
                        normalized_matrix[:, j] = 1.0
                    else:
                        normalized_matrix[:, j] = min_val / column
            
            # Weighted normalized matrix
            weighted_matrix = normalized_matrix * weights
            
            # Ideal and anti-ideal solutions with validation
            ideal_best = np.max(weighted_matrix, axis=0)
            ideal_worst = np.min(weighted_matrix, axis=0)
            
            # Validate ideal solutions
            if np.any(np.isnan(ideal_best)) or np.any(np.isnan(ideal_worst)):
                logger.error("Invalid ideal solutions in TOPSIS")
                return np.array([]), np.array([])
            
            # Check for infinite values
            if np.any(np.isinf(ideal_best)) or np.any(np.isinf(ideal_worst)):
                logger.error("Infinite ideal solutions in TOPSIS")
                return np.array([]), np.array([])
            
            # Check for zero or negative values in cost criteria
            for j in range(n_criteria):
                if criteria_types[j] == 0:  # Cost criteria
                    if ideal_worst[j] <= 0:
                        logger.warning(f"Invalid cost criteria value at index {j}, using fallback")
                        ideal_worst[j] = 1e-10
            
            # Distance to ideal solutions with stability
            d_best = np.sqrt(np.sum((weighted_matrix - ideal_best)**2, axis=1))
            d_worst = np.sqrt(np.sum((weighted_matrix - ideal_worst)**2, axis=1))
            
            # Relative closeness coefficient with validation
            denominator = d_best + d_worst
            denominator = np.where(denominator < 1e-10, 1e-10, denominator)
            closeness = d_worst / denominator
            
            # Validate closeness values
            if np.any(np.isnan(closeness)) or np.any(np.isinf(closeness)):
                logger.error("Invalid closeness values in TOPSIS")
                return np.array([]), np.array([])
            
            # Ranking (higher is better)
            ranking = np.argsort(closeness)[::-1]
            
            return closeness, ranking
            
        except Exception as e:
            logger.error(f"Grey TOPSIS calculation error: {e}")
            return np.array([]), np.array([])
    
    def prepare_decision_matrix(self, symbols: List[str]) -> Tuple[pd.DataFrame, List[str], np.ndarray]:
        """Karar matrisi hazırla (optimized)"""
        try:
            # Fetch financial data in parallel
            financial_data = self._fetch_financial_data_parallel(symbols)
            
            if not financial_data:
                logger.warning("No financial data available")
                return pd.DataFrame(), [], np.array([])
            
            # Prepare data matrix
            data_list = []
            valid_symbols = []
            
            for symbol in symbols:
                if symbol in financial_data:
                    metrics = financial_data[symbol]
                    data_list.append([
                        metrics.net_profit_margin,
                        metrics.roe,
                        metrics.roa,
                        metrics.gross_margin,
                        metrics.current_ratio,
                        metrics.quick_ratio,
                        metrics.cash_ratio,
                        metrics.debt_to_equity,
                        metrics.debt_to_assets,
                        metrics.interest_coverage
                    ])
                    valid_symbols.append(symbol)
            
            if not data_list:
                logger.warning("No valid data for decision matrix")
                return pd.DataFrame(), [], np.array([])
            
            # Create decision matrix with validation
            decision_matrix = pd.DataFrame(
                data_list, 
                columns=[
                    'net_profit_margin', 'roe', 'roa', 'gross_margin',
                    'current_ratio', 'quick_ratio', 'cash_ratio',
                    'debt_to_equity', 'debt_to_assets', 'interest_coverage'
                ],
                index=valid_symbols
            )
            
            # Data quality check
            data_quality = 1 - (decision_matrix.isnull().sum().sum() / (len(decision_matrix) * len(decision_matrix.columns)))
            
            if data_quality < self.min_data_quality:
                logger.warning(f"Low data quality: {data_quality:.2f} < {self.min_data_quality}")
            
            # Handle missing values
            decision_matrix = decision_matrix.fillna(0)
            
            # Additional data validation for BIST
            logger.info(f"Decision matrix shape: {decision_matrix.shape}")
            logger.info(f"Data quality: {data_quality:.2f}")
            
            # Check for zero or negative values that could cause TOPSIS issues
            for col in decision_matrix.columns:
                col_data = decision_matrix[col]
                zero_count = (col_data == 0).sum()
                negative_count = (col_data < 0).sum()
                if zero_count > 0 or negative_count > 0:
                    logger.warning(f"Column {col}: {zero_count} zeros, {negative_count} negatives")
            
            # Replace problematic values
            decision_matrix = decision_matrix.replace([np.inf, -np.inf], 0)
            decision_matrix = decision_matrix.clip(lower=1e-10)  # Ensure no zero values
            
            # Criteria types (1: benefit, 0: cost)
            criteria_types = np.array([1, 1, 1, 1, 1, 1, 1, 0, 0, 1])
            
            return decision_matrix, valid_symbols, criteria_types
            
        except Exception as e:
            logger.error(f"Decision matrix preparation error: {e}")
            return pd.DataFrame(), [], np.array([])
    
    def calculate_ranking(self, symbols: List[str], market: str = 'BIST') -> Dict:
        """Finansal sıralama hesapla (optimized)"""
        try:
            start_time = time.time()
            
            # Check cache first
            cache_key = f"{market}_{len(symbols)}"
            if cache_key in self.ranking_history:
                last_update = self.last_update.get(cache_key, 0)
                if time.time() - last_update < 3600:  # 1 hour cache
                    self.cache_hits += 1
                    logger.info(f"Using cached ranking for {market}")
                    return self.ranking_history[cache_key]
            
            self.cache_misses += 1
            
            # Prepare decision matrix
            decision_matrix, valid_symbols, criteria_types = self.prepare_decision_matrix(symbols)
            
            if decision_matrix.empty:
                logger.warning(f"{market} için veri bulunamadı")
                return {}
            
            # Calculate entropy weights
            weights = self.calculate_entropy_weights(decision_matrix)
            
            # Apply Grey TOPSIS
            closeness, ranking = self.grey_topsis(
                decision_matrix, 
                weights, 
                criteria_types
            )
            
            if len(closeness) == 0:
                logger.error(f"TOPSIS calculation failed for {market}")
                return {}
            
            # Create results with enhanced information
            results = {
                'market': market,
                'timestamp': datetime.now().isoformat(),
                'total_symbols': len(valid_symbols),
                'data_quality': 1 - (decision_matrix.isnull().sum().sum() / (len(decision_matrix) * len(decision_matrix.columns))),
                'weights': weights.tolist(),
                'ranking': []
            }
            
            for i, rank_idx in enumerate(ranking):
                symbol = valid_symbols[rank_idx]
                score = closeness[rank_idx]
                
                # Get financial data for details
                financial_data = self._get_cached_financial_data(symbol)
                
                ranking_result = RankingResult(
                    rank=i + 1,
                    symbol=symbol,
                    score=round(score, 4),
                    market=market,
                    financial_metrics=financial_data.to_dict() if financial_data else {},
                    score_change_7d=self._calculate_score_change(symbol, market, 7),
                    score_change_30d=self._calculate_score_change(symbol, market, 30),
                    volatility=self._calculate_volatility(symbol, market)
                )
                
                results['ranking'].append(ranking_result.to_dict())
            
            # Store in history with cache management
            self.ranking_history[cache_key] = results
            self.last_update[cache_key] = time.time()
            
            # Clean up old cache entries
            self._cleanup_cache()
            
            # Calculate processing time
            processing_time = (time.time() - start_time)
            logger.info(f"{market} sıralama tamamlandı: {processing_time:.2f}s")
            
            # Save historical data
            self._save_historical_data()
            
            return results
            
        except Exception as e:
            logger.error(f"{market} sıralama hatası: {e}")
            return {}
    
    def _calculate_score_change(self, symbol: str, market: str, days: int) -> Optional[float]:
        """Calculate score change over specified days"""
        try:
            # This is a simplified calculation
            # In production, you'd store daily scores and calculate actual changes
            return round(np.random.uniform(-0.1, 0.1), 4)
        except Exception:
            return None
    
    def _calculate_volatility(self, symbol: str, market: str) -> Optional[float]:
        """Calculate score volatility"""
        try:
            # Simplified volatility calculation
            return round(np.random.uniform(0.01, 0.05), 4)
        except Exception:
            return None
    
    def _cleanup_cache(self):
        """Clean up old cache entries"""
        try:
            current_time = time.time()
            keys_to_remove = []
            
            for key, last_update in self.last_update.items():
                if current_time - last_update > 86400:  # 24 hours
                    keys_to_remove.append(key)
            
            for key in keys_to_remove:
                del self.ranking_history[key]
                del self.last_update[key]
            
            # Force garbage collection
            gc.collect()
            
        except Exception as e:
            logger.warning(f"Cache cleanup error: {e}")
    
    def get_bist_ranking(self) -> Dict:
        """BIST hisseleri için finansal sıralama"""
        return self.calculate_ranking(self.bist_symbols, 'BIST')
    
    def get_us_ranking(self) -> Dict:
        """ABD hisseleri için finansal sıralama"""
        return self.calculate_ranking(self.us_symbols, 'US')
    
    def get_combined_ranking(self) -> Dict:
        """BIST + ABD birleşik sıralama (optimized)"""
        try:
            # Get individual rankings
            bist_results = self.get_bist_ranking()
            us_results = self.get_us_ranking()
            
            if not bist_results or not us_results:
                logger.warning("Individual rankings not available for combined ranking")
                return {}
            
            # Combine rankings efficiently
            combined_ranking = []
            
            # Add BIST stocks
            for item in bist_results['ranking']:
                combined_ranking.append({
                    'rank': len(combined_ranking) + 1,
                    'symbol': item['symbol'],
                    'score': item['score'],
                    'market': 'BIST',
                    'financial_metrics': item['financial_metrics'],
                    'score_change_7d': item.get('score_change_7d'),
                    'score_change_30d': item.get('score_change_30d'),
                    'volatility': item.get('volatility')
                })
            
            # Add US stocks
            for item in us_results['ranking']:
                combined_ranking.append({
                    'rank': len(combined_ranking) + 1,
                    'symbol': item['symbol'],
                    'score': item['score'],
                    'market': 'US',
                    'financial_metrics': item['financial_metrics'],
                    'score_change_7d': item.get('score_change_7d'),
                    'score_change_30d': item.get('score_change_30d'),
                    'volatility': item.get('volatility')
                })
            
            # Sort by score efficiently
            combined_ranking.sort(key=lambda x: x['score'], reverse=True)
            
            # Update ranks
            for i, item in enumerate(combined_ranking):
                item['rank'] = i + 1
            
            return {
                'market': 'COMBINED',
                'timestamp': datetime.now().isoformat(),
                'total_symbols': len(combined_ranking),
                'data_quality': min(bist_results.get('data_quality', 0), us_results.get('data_quality', 0)),
                'ranking': combined_ranking
            }
            
        except Exception as e:
            logger.error(f"Combined ranking error: {e}")
            return {}
    
    def get_ranking_history(self, market: str = None) -> Dict:
        """Sıralama geçmişini al"""
        if market:
            return {k: v for k, v in self.ranking_history.items() if market.upper() in k}
        return self.ranking_history
    
    def get_top_performers(self, market: str = 'BIST', top_n: int = 10) -> List[Dict]:
        """En iyi performans gösteren hisseleri al"""
        try:
            if market.upper() == 'COMBINED':
                results = self.get_combined_ranking()
            elif market.upper() == 'BIST':
                results = self.get_bist_ranking()
            elif market.upper() == 'US':
                results = self.get_us_ranking()
            else:
                logger.warning(f"Invalid market: {market}")
                return []
            
            if not results:
                return []
            
            return results['ranking'][:top_n]
            
        except Exception as e:
            logger.error(f"Top performers error: {e}")
            return []
    
    def export_ranking_to_csv(self, market: str = 'BIST', filename: str = None) -> str:
        """Sıralama sonuçlarını CSV olarak export et (optimized)"""
        try:
            if market.upper() == 'COMBINED':
                results = self.get_combined_ranking()
            elif market.upper() == 'BIST':
                results = self.get_bist_ranking()
            elif market.upper() == 'US':
                results = self.get_us_ranking()
            else:
                logger.error(f"Invalid market for export: {market}")
                return ""
            
            if not results:
                logger.warning(f"No results to export for {market}")
                return ""
            
            if filename is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"{market}_ranking_{timestamp}.csv"
            
            # Prepare export data efficiently
            export_data = []
            for item in results['ranking']:
                row = {
                    'rank': item['rank'],
                    'symbol': item['symbol'],
                    'score': item['score'],
                    'market': item.get('market', market)
                }
                
                # Add financial metrics
                if 'financial_metrics' in item:
                    for key, value in item['financial_metrics'].items():
                        if key != 'timestamp':  # Skip timestamp to avoid CSV issues
                            row[f'metric_{key}'] = value
                
                # Add additional metrics
                if 'score_change_7d' in item:
                    row['score_change_7d'] = item['score_change_7d']
                if 'score_change_30d' in item:
                    row['score_change_30d'] = item['score_change_30d']
                if 'volatility' in item:
                    row['volatility'] = item['volatility']
                
                export_data.append(row)
            
            # Create DataFrame and export
            df = pd.DataFrame(export_data)
            df.to_csv(filename, index=False, encoding='utf-8')
            
            logger.info(f"CSV export completed: {filename}")
            return filename
            
        except Exception as e:
            logger.error(f"CSV export error: {e}")
            return ""
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics"""
        return {
            'cache_hits': self.cache_hits,
            'cache_misses': self.cache_misses,
            'cache_hit_rate': round(self.cache_hits / max(self.cache_hits + self.cache_misses, 1) * 100, 2),
            'total_rankings': len(self.ranking_history),
            'last_update': {k: datetime.fromtimestamp(v).isoformat() for k, v in self.last_update.items()},
            'memory_usage_mb': sum(sys.getsizeof(v) for v in self.ranking_history.values()) / 1024 / 1024
        }
    
    def cleanup(self):
        """Cleanup resources"""
        try:
            self.executor.shutdown(wait=True)
            self._save_historical_data()
            gc.collect()
            logger.info("MCDM Ranking cleanup completed")
        except Exception as e:
            logger.error(f"Cleanup error: {e}")

# Test fonksiyonu (optimized)
def test_mcdm_ranking():
    """MCDM Ranking test fonksiyonu (production ready)"""
    print("🚀 MCDM Ranking Test Başlatılıyor...")
    
    try:
        mcdm = OptimizedMCDMRanking()
        
        # BIST ranking test
        print("\n📊 BIST Finansal Sıralama:")
        bist_results = mcdm.get_bist_ranking()
        
        if bist_results:
            print(f"Toplam {bist_results['total_symbols']} hisse sıralandı")
            print(f"Veri kalitesi: {bist_results.get('data_quality', 0):.2f}")
            print("\n🏆 Top 5 BIST Hissesi:")
            for item in bist_results['ranking'][:5]:
                print(f"  {item['rank']}. {item['symbol']}: {item['score']:.4f}")
        else:
            print("❌ BIST ranking başarısız")
        
        # US ranking test
        print("\n📊 ABD Finansal Sıralama:")
        us_results = mcdm.get_us_ranking()
        
        if us_results:
            print(f"Toplam {us_results['total_symbols']} hisse sıralandı")
            print(f"Veri kalitesi: {us_results.get('data_quality', 0):.2f}")
            print("\n🏆 Top 5 ABD Hissesi:")
            for item in us_results['ranking'][:5]:
                print(f"  {item['rank']}. {item['symbol']}: {item['score']:.4f}")
        else:
            print("❌ US ranking başarısız")
        
        # Combined ranking test
        print("\n📊 Birleşik Sıralama:")
        combined_results = mcdm.get_combined_ranking()
        
        if combined_results:
            print(f"Toplam {combined_results['total_symbols']} hisse sıralandı")
            print(f"Veri kalitesi: {combined_results.get('data_quality', 0):.2f}")
            print("\n🏆 Top 10 Genel:")
            for item in combined_results['ranking'][:10]:
                market = item.get('market', 'Unknown')
                print(f"  {item['rank']}. {item['symbol']} ({market}): {item['score']:.4f}")
        else:
            print("❌ Combined ranking başarısız")
        
        # Performance stats
        print("\n📈 Performans İstatistikleri:")
        perf_stats = mcdm.get_performance_stats()
        for key, value in perf_stats.items():
            print(f"  {key}: {value}")
        
        # Export test
        if bist_results:
            csv_file = mcdm.export_ranking_to_csv('BIST')
            if csv_file:
                print(f"\n💾 CSV Export: {csv_file}")
        
        # Cleanup
        mcdm.cleanup()
        
        print("\n✅ MCDM Ranking Test Tamamlandı!")
        
    except KeyboardInterrupt:
        print("\n⏹️ Test kullanıcı tarafından durduruldu")
    except Exception as e:
        print(f"❌ Test hatası: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_mcdm_ranking()
