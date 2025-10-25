#!/usr/bin/env python3
"""
BIST AI Smart Trader - Data Validator Service
Ensures data quality and consistency across all data sources
"""

import asyncio
import logging
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
import yfinance as yf
import json
import os
from pathlib import Path

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/data_validator.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DataValidator:
    def __init__(self):
        self.validation_config = {
            'quality_threshold': 0.95,  # Minimum 95% data quality
            'completeness_threshold': 0.90,  # Minimum 90% completeness
            'consistency_threshold': 0.85,  # Minimum 85% consistency
            'freshness_hours': 24,  # Data should be less than 24 hours old
            'price_change_limit': 0.20,  # Maximum 20% price change per day
            'volume_spike_limit': 5.0,  # Maximum 5x volume spike
            'missing_data_limit': 0.05  # Maximum 5% missing data
        }
        
        self.validation_results = {}
        self.data_sources = {
            'yfinance': 'https://finance.yahoo.com',
            'finnhub': 'https://finnhub.io/api/v1',
            'local_cache': './data/cache/'
        }
        
        # Create logs directory
        os.makedirs('logs', exist_ok=True)
        
        logger.info("🔍 Data Validator initialized")

    def validate_price_data(self, df: pd.DataFrame, symbol: str) -> Dict[str, Any]:
        """Validate price data quality"""
        validation_result = {
            'symbol': symbol,
            'timestamp': datetime.now().isoformat(),
            'overall_score': 0.0,
            'checks': {},
            'issues': [],
            'recommendations': []
        }
        
        try:
            if df.empty:
                validation_result['issues'].append('Empty dataset')
                validation_result['checks']['completeness'] = 0.0
                return validation_result
            
            # Check 1: Completeness
            total_rows = len(df)
            missing_rows = df.isnull().sum().sum()
            completeness_score = 1 - (missing_rows / (total_rows * len(df.columns)))
            validation_result['checks']['completeness'] = completeness_score
            
            if completeness_score < self.validation_config['completeness_threshold']:
                validation_result['issues'].append(f'Low completeness: {completeness_score:.2%}')
                validation_result['recommendations'].append('Check data source connectivity')
            
            # Check 2: Price consistency
            price_columns = ['Open', 'High', 'Low', 'Close']
            price_consistency_score = 1.0
            
            for col in price_columns:
                if col in df.columns:
                    # Check for negative prices
                    negative_prices = (df[col] <= 0).sum()
                    if negative_prices > 0:
                        validation_result['issues'].append(f'{col} has {negative_prices} negative values')
                        price_consistency_score -= 0.1
                    
                    # Check for extreme price changes
                    if col == 'Close':
                        price_changes = df[col].pct_change().abs()
                        extreme_changes = (price_changes > self.validation_config['price_change_limit']).sum()
                        if extreme_changes > 0:
                            validation_result['issues'].append(f'{extreme_changes} extreme price changes detected')
                            validation_result['recommendations'].append('Verify price data accuracy')
                            price_consistency_score -= 0.05
            
            validation_result['checks']['price_consistency'] = max(0, price_consistency_score)
            
            # Check 3: OHLC consistency
            ohlc_consistency_score = 1.0
            if all(col in df.columns for col in ['Open', 'High', 'Low', 'Close']):
                # High should be >= Open, Low, Close
                high_violations = ((df['High'] < df['Open']) | 
                                 (df['High'] < df['Low']) | 
                                 (df['High'] < df['Close'])).sum()
                
                # Low should be <= Open, High, Close
                low_violations = ((df['Low'] > df['Open']) | 
                                (df['Low'] > df['High']) | 
                                (df['Low'] > df['Close'])).sum()
                
                total_violations = high_violations + low_violations
                if total_violations > 0:
                    validation_result['issues'].append(f'{total_violations} OHLC consistency violations')
                    ohlc_consistency_score -= min(0.5, total_violations / total_rows)
            
            validation_result['checks']['ohlc_consistency'] = max(0, ohlc_consistency_score)
            
            # Check 4: Volume validation
            volume_score = 1.0
            if 'Volume' in df.columns:
                # Check for negative volumes
                negative_volumes = (df['Volume'] < 0).sum()
                if negative_volumes > 0:
                    validation_result['issues'].append(f'{negative_volumes} negative volume values')
                    volume_score -= 0.2
                
                # Check for extreme volume spikes
                volume_changes = df['Volume'].pct_change().abs()
                extreme_volumes = (volume_changes > self.validation_config['volume_spike_limit']).sum()
                if extreme_volumes > 0:
                    validation_result['issues'].append(f'{extreme_volumes} extreme volume spikes')
                    volume_score -= 0.1
            
            validation_result['checks']['volume_consistency'] = max(0, volume_score)
            
            # Check 5: Data freshness
            freshness_score = 1.0
            if 'Date' in df.columns or df.index.name == 'Date':
                last_date = df.index[-1] if df.index.name == 'Date' else df['Date'].iloc[-1]
                if isinstance(last_date, str):
                    last_date = pd.to_datetime(last_date)
                
                hours_old = (datetime.now() - last_date).total_seconds() / 3600
                if hours_old > self.validation_config['freshness_hours']:
                    validation_result['issues'].append(f'Data is {hours_old:.1f} hours old')
                    freshness_score = max(0, 1 - (hours_old - self.validation_config['freshness_hours']) / 24)
            
            validation_result['checks']['freshness'] = freshness_score
            
            # Calculate overall score
            scores = list(validation_result['checks'].values())
            validation_result['overall_score'] = np.mean(scores) if scores else 0.0
            
            # Determine data quality status
            if validation_result['overall_score'] >= self.validation_config['quality_threshold']:
                validation_result['status'] = 'excellent'
            elif validation_result['overall_score'] >= 0.8:
                validation_result['status'] = 'good'
            elif validation_result['overall_score'] >= 0.6:
                validation_result['status'] = 'fair'
            else:
                validation_result['status'] = 'poor'
            
            logger.info(f"✅ Data validation completed for {symbol}: {validation_result['overall_score']:.2%} ({validation_result['status']})")
            
        except Exception as e:
            logger.error(f"❌ Data validation failed for {symbol}: {e}")
            validation_result['issues'].append(f'Validation error: {e}')
            validation_result['overall_score'] = 0.0
            validation_result['status'] = 'error'
        
        return validation_result

    def validate_technical_indicators(self, df: pd.DataFrame, symbol: str) -> Dict[str, Any]:
        """Validate technical indicators"""
        validation_result = {
            'symbol': symbol,
            'timestamp': datetime.now().isoformat(),
            'indicators': {},
            'issues': [],
            'overall_score': 0.0
        }
        
        try:
            # RSI validation
            if 'RSI' in df.columns:
                rsi_values = df['RSI'].dropna()
                rsi_score = 1.0
                
                # RSI should be between 0 and 100
                invalid_rsi = ((rsi_values < 0) | (rsi_values > 100)).sum()
                if invalid_rsi > 0:
                    validation_result['issues'].append(f'{invalid_rsi} invalid RSI values')
                    rsi_score -= 0.3
                
                validation_result['indicators']['RSI'] = rsi_score
            
            # MACD validation
            if 'MACD' in df.columns and 'MACD_Signal' in df.columns:
                macd_score = 1.0
                
                # MACD should be finite
                invalid_macd = (~np.isfinite(df['MACD'])).sum()
                if invalid_macd > 0:
                    validation_result['issues'].append(f'{invalid_macd} invalid MACD values')
                    macd_score -= 0.2
                
                validation_result['indicators']['MACD'] = macd_score
            
            # Moving averages validation
            ma_columns = [col for col in df.columns if col.startswith(('SMA_', 'EMA_'))]
            for col in ma_columns:
                ma_score = 1.0
                ma_values = df[col].dropna()
                
                # MA should be positive
                negative_ma = (ma_values <= 0).sum()
                if negative_ma > 0:
                    validation_result['issues'].append(f'{negative_ma} negative {col} values')
                    ma_score -= 0.2
                
                validation_result['indicators'][col] = ma_score
            
            # Calculate overall score
            if validation_result['indicators']:
                validation_result['overall_score'] = np.mean(list(validation_result['indicators'].values()))
            else:
                validation_result['overall_score'] = 0.0
            
            logger.info(f"✅ Technical indicators validation completed for {symbol}: {validation_result['overall_score']:.2%}")
            
        except Exception as e:
            logger.error(f"❌ Technical indicators validation failed for {symbol}: {e}")
            validation_result['issues'].append(f'Validation error: {e}')
            validation_result['overall_score'] = 0.0
        
        return validation_result

    async def validate_market_data(self, symbols: List[str]) -> Dict[str, Any]:
        """Validate market data for multiple symbols"""
        logger.info(f"🔍 Starting market data validation for {len(symbols)} symbols")
        
        validation_results = {
            'timestamp': datetime.now().isoformat(),
            'symbols': {},
            'overall_quality': 0.0,
            'summary': {
                'total_symbols': len(symbols),
                'excellent': 0,
                'good': 0,
                'fair': 0,
                'poor': 0,
                'error': 0
            }
        }
        
        for symbol in symbols:
            try:
                # Fetch data
                ticker = yf.Ticker(symbol)
                df = ticker.history(period="3mo")
                
                if df.empty:
                    validation_results['symbols'][symbol] = {
                        'status': 'error',
                        'issue': 'No data available'
                    }
                    validation_results['summary']['error'] += 1
                    continue
                
                # Validate price data
                price_validation = self.validate_price_data(df, symbol)
                
                # Validate technical indicators
                df_features = self.prepare_features(df)
                indicator_validation = self.validate_technical_indicators(df_features, symbol)
                
                # Combine results
                symbol_result = {
                    'price_validation': price_validation,
                    'indicator_validation': indicator_validation,
                    'overall_score': (price_validation['overall_score'] + indicator_validation['overall_score']) / 2,
                    'status': price_validation['status']
                }
                
                validation_results['symbols'][symbol] = symbol_result
                
                # Update summary
                status = price_validation['status']
                if status in validation_results['summary']:
                    validation_results['summary'][status] += 1
                
            except Exception as e:
                logger.error(f"❌ Validation failed for {symbol}: {e}")
                validation_results['symbols'][symbol] = {
                    'status': 'error',
                    'issue': str(e)
                }
                validation_results['summary']['error'] += 1
        
        # Calculate overall quality
        scores = [result.get('overall_score', 0) for result in validation_results['symbols'].values() 
                 if isinstance(result, dict) and 'overall_score' in result]
        
        if scores:
            validation_results['overall_quality'] = np.mean(scores)
        
        logger.info(f"✅ Market data validation completed: {validation_results['overall_quality']:.2%} overall quality")
        
        return validation_results

    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepare technical features for validation"""
        df = df.copy()
        
        # Basic technical indicators
        df['SMA_20'] = df['Close'].rolling(window=20).mean()
        df['EMA_12'] = df['Close'].ewm(span=12).mean()
        df['EMA_26'] = df['Close'].ewm(span=26).mean()
        
        # RSI
        delta = df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['RSI'] = 100 - (100 / (1 + rs))
        
        # MACD
        df['MACD'] = df['EMA_12'] - df['EMA_26']
        df['MACD_Signal'] = df['MACD'].ewm(span=9).mean()
        
        return df.dropna()

    def generate_quality_report(self, validation_results: Dict[str, Any]) -> str:
        """Generate a human-readable quality report"""
        report = []
        report.append("=" * 60)
        report.append("BIST AI Smart Trader - Data Quality Report")
        report.append("=" * 60)
        report.append(f"Generated: {validation_results['timestamp']}")
        report.append(f"Overall Quality: {validation_results['overall_quality']:.2%}")
        report.append("")
        
        # Summary
        summary = validation_results['summary']
        report.append("SUMMARY:")
        report.append(f"  Total Symbols: {summary['total_symbols']}")
        report.append(f"  Excellent: {summary['excellent']}")
        report.append(f"  Good: {summary['good']}")
        report.append(f"  Fair: {summary['fair']}")
        report.append(f"  Poor: {summary['poor']}")
        report.append(f"  Error: {summary['error']}")
        report.append("")
        
        # Individual symbol results
        report.append("SYMBOL DETAILS:")
        for symbol, result in validation_results['symbols'].items():
            if isinstance(result, dict) and 'overall_score' in result:
                report.append(f"  {symbol}: {result['overall_score']:.2%} ({result['status']})")
                
                # Add issues if any
                price_issues = result.get('price_validation', {}).get('issues', [])
                indicator_issues = result.get('indicator_validation', {}).get('issues', [])
                
                all_issues = price_issues + indicator_issues
                if all_issues:
                    for issue in all_issues[:3]:  # Show first 3 issues
                        report.append(f"    - {issue}")
            else:
                report.append(f"  {symbol}: ERROR - {result.get('issue', 'Unknown error')}")
        
        report.append("")
        report.append("=" * 60)
        
        return "\n".join(report)

    def save_validation_results(self, results: Dict[str, Any], filename: str = None):
        """Save validation results to file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"validation_results_{timestamp}.json"
        
        results_dir = Path('logs/validation_results')
        results_dir.mkdir(exist_ok=True)
        
        filepath = results_dir / filename
        
        try:
            with open(filepath, 'w') as f:
                json.dump(results, f, indent=2)
            
            logger.info(f"💾 Validation results saved to {filepath}")
            
            # Also save human-readable report
            report = self.generate_quality_report(results)
            report_file = filepath.with_suffix('.txt')
            with open(report_file, 'w') as f:
                f.write(report)
            
            logger.info(f"📄 Quality report saved to {report_file}")
            
        except Exception as e:
            logger.error(f"❌ Failed to save validation results: {e}")

# Global data validator instance
data_validator = DataValidator()

async def main():
    """Main function for testing"""
    symbols = ['THYAO.IS', 'ASELS.IS', 'TUPRS.IS', 'SISE.IS', 'EREGL.IS']
    
    # Validate market data
    results = await data_validator.validate_market_data(symbols)
    
    # Save results
    data_validator.save_validation_results(results)
    
    # Print summary
    print(f"Overall Quality: {results['overall_quality']:.2%}")
    print(f"Summary: {results['summary']}")

if __name__ == "__main__":
    asyncio.run(main())