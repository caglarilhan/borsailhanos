"""
🚀 BIST AI Smart Trader - Predictive Twin Engine
==============================================

"X olursa ne olurdu?" tarzı Monte Carlo / Prophet forecast simülasyonu.
Senaryo tabanlı tahmin sistemi.

Özellikler:
- Monte Carlo simülasyonu
- Prophet forecast
- Senaryo analizi
- Risk hesaplama
- Portfolio simülasyonu
"""

import asyncio
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import random

# ML Libraries
try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
except ImportError:
    PROPHET_AVAILABLE = False
    print("⚠️ Prophet not available - install with: pip install prophet")

try:
    from scipy import stats
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False
    print("⚠️ SciPy not available")

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class Scenario:
    """Senaryo tanımı"""
    name: str
    description: str
    parameters: Dict[str, Any]
    probability: float
    impact: str  # 'positive', 'negative', 'neutral'
    
    def to_dict(self):
        return asdict(self)

@dataclass
class SimulationResult:
    """Simülasyon sonucu"""
    symbol: str
    scenario: str
    current_price: float
    predicted_price: float
    price_change: float
    price_change_pct: float
    confidence_interval: Tuple[float, float]
    probability: float
    risk_score: float
    expected_return: float
    volatility: float
    simulation_data: List[Dict[str, float]]
    timestamp: datetime
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data

@dataclass
class PortfolioSimulation:
    """Portföy simülasyonu"""
    symbols: List[str]
    weights: List[float]
    scenarios: List[str]
    portfolio_value: float
    expected_return: float
    portfolio_volatility: float
    sharpe_ratio: float
    max_drawdown: float
    simulation_results: List[SimulationResult]
    timestamp: datetime
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data

class PredictiveTwinEngine:
    """Predictive Twin Engine"""
    
    def __init__(self, data_dir: str = "backend/ai/data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Senaryo tanımları
        self.scenarios = self._initialize_scenarios()
        
        # Simülasyon parametreleri
        self.simulation_params = {
            'monte_carlo_runs': 1000,
            'forecast_days': 30,
            'confidence_level': 0.95,
            'volatility_window': 20
        }
    
    def _initialize_scenarios(self) -> Dict[str, Scenario]:
        """Senaryoları başlat"""
        scenarios = {
            'bull_market': Scenario(
                name='Bull Market',
                description='Güçlü yükseliş trendi',
                parameters={
                    'trend_multiplier': 1.5,
                    'volatility_multiplier': 0.8,
                    'volume_multiplier': 1.3
                },
                probability=0.3,
                impact='positive'
            ),
            'bear_market': Scenario(
                name='Bear Market',
                description='Düşüş trendi',
                parameters={
                    'trend_multiplier': -1.2,
                    'volatility_multiplier': 1.5,
                    'volume_multiplier': 1.2
                },
                probability=0.2,
                impact='negative'
            ),
            'sideways_market': Scenario(
                name='Sideways Market',
                description='Yatay hareket',
                parameters={
                    'trend_multiplier': 0.1,
                    'volatility_multiplier': 0.6,
                    'volume_multiplier': 0.8
                },
                probability=0.3,
                impact='neutral'
            ),
            'high_volatility': Scenario(
                name='High Volatility',
                description='Yüksek volatilite',
                parameters={
                    'trend_multiplier': 0.0,
                    'volatility_multiplier': 2.0,
                    'volume_multiplier': 1.5
                },
                probability=0.15,
                impact='neutral'
            ),
            'low_volatility': Scenario(
                name='Low Volatility',
                description='Düşük volatilite',
                parameters={
                    'trend_multiplier': 0.2,
                    'volatility_multiplier': 0.4,
                    'volume_multiplier': 0.7
                },
                probability=0.05,
                impact='neutral'
            )
        }
        
        return scenarios
    
    def calculate_historical_volatility(self, prices: List[float], window: int = 20) -> float:
        """Tarihsel volatilite hesapla"""
        try:
            if len(prices) < window:
                return 0.02  # Default volatilite
            
            returns = np.diff(np.log(prices[-window:]))
            volatility = np.std(returns) * np.sqrt(252)  # Yıllık volatilite
            
            return float(volatility)
            
        except Exception as e:
            logger.error(f"❌ Calculate volatility error: {e}")
            return 0.02
    
    def calculate_historical_return(self, prices: List[float], window: int = 20) -> float:
        """Tarihsel getiri hesapla"""
        try:
            if len(prices) < window:
                return 0.0
            
            returns = np.diff(np.log(prices[-window:]))
            avg_return = np.mean(returns) * 252  # Yıllık getiri
            
            return float(avg_return)
            
        except Exception as e:
            logger.error(f"❌ Calculate return error: {e}")
            return 0.0
    
    def monte_carlo_simulation(self, 
                              current_price: float,
                              expected_return: float,
                              volatility: float,
                              days: int,
                              runs: int) -> List[Dict[str, float]]:
        """Monte Carlo simülasyonu"""
        try:
            results = []
            dt = 1/252  # Günlük zaman adımı
            
            for run in range(runs):
                price_path = [current_price]
                
                for day in range(days):
                    # Random walk
                    random_shock = np.random.normal(0, 1)
                    price_change = expected_return * dt + volatility * np.sqrt(dt) * random_shock
                    
                    new_price = price_path[-1] * np.exp(price_change)
                    price_path.append(new_price)
                
                # Son fiyat
                final_price = price_path[-1]
                price_change_pct = (final_price - current_price) / current_price * 100
                
                results.append({
                    'run': run,
                    'final_price': final_price,
                    'price_change_pct': price_change_pct,
                    'max_price': max(price_path),
                    'min_price': min(price_path),
                    'volatility': np.std(np.diff(np.log(price_path))) * np.sqrt(252)
                })
            
            return results
            
        except Exception as e:
            logger.error(f"❌ Monte Carlo simulation error: {e}")
            return []
    
    def prophet_forecast(self, 
                        historical_data: pd.DataFrame,
                        days: int) -> Dict[str, Any]:
        """Prophet ile tahmin"""
        try:
            if not PROPHET_AVAILABLE:
                logger.warning("⚠️ Prophet not available")
                return {}
            
            # Prophet için veri hazırla
            prophet_data = historical_data[['ds', 'y']].copy()
            
            # Model oluştur
            model = Prophet(
                changepoint_prior_scale=0.05,
                seasonality_prior_scale=10.0,
                holidays_prior_scale=10.0,
                seasonality_mode='multiplicative'
            )
            
            # Modeli eğit
            model.fit(prophet_data)
            
            # Gelecek için dataframe oluştur
            future = model.make_future_dataframe(periods=days)
            
            # Tahmin yap
            forecast = model.predict(future)
            
            # Sonuçları al
            last_forecast = forecast.tail(days)
            
            return {
                'forecast': last_forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].to_dict('records'),
                'trend': float(last_forecast['trend'].iloc[-1]),
                'seasonal': float(last_forecast['seasonal'].iloc[-1]) if 'seasonal' in last_forecast.columns else 0,
                'confidence_interval': (
                    float(last_forecast['yhat_lower'].iloc[-1]),
                    float(last_forecast['yhat_upper'].iloc[-1])
                )
            }
            
        except Exception as e:
            logger.error(f"❌ Prophet forecast error: {e}")
            return {}
    
    async def simulate_scenario(self,
                               symbol: str,
                               scenario_name: str,
                               current_price: float,
                               historical_data: Optional[pd.DataFrame] = None) -> SimulationResult:
        """Senaryo simülasyonu"""
        try:
            if scenario_name not in self.scenarios:
                raise ValueError(f"Unknown scenario: {scenario_name}")
            
            scenario = self.scenarios[scenario_name]
            
            # Tarihsel verilerden volatilite ve getiri hesapla
            if historical_data is not None and not historical_data.empty:
                prices = historical_data['y'].tolist()
                base_volatility = self.calculate_historical_volatility(prices)
                base_return = self.calculate_historical_return(prices)
            else:
                # Default değerler
                base_volatility = 0.25  # %25 yıllık volatilite
                base_return = 0.08      # %8 yıllık getiri
            
            # Senaryo parametrelerini uygula
            scenario_return = base_return * scenario.parameters['trend_multiplier']
            scenario_volatility = base_volatility * scenario.parameters['volatility_multiplier']
            
            # Monte Carlo simülasyonu
            simulation_data = self.monte_carlo_simulation(
                current_price=current_price,
                expected_return=scenario_return,
                volatility=scenario_volatility,
                days=self.simulation_params['forecast_days'],
                runs=self.simulation_params['monte_carlo_runs']
            )
            
            if not simulation_data:
                raise Exception("Simulation failed")
            
            # İstatistikleri hesapla
            final_prices = [run['final_price'] for run in simulation_data]
            price_changes = [run['price_change_pct'] for run in simulation_data]
            
            predicted_price = np.mean(final_prices)
            price_change = predicted_price - current_price
            price_change_pct = price_change / current_price * 100
            
            # Güven aralığı
            confidence_level = self.simulation_params['confidence_level']
            alpha = 1 - confidence_level
            lower_bound = np.percentile(final_prices, (alpha/2) * 100)
            upper_bound = np.percentile(final_prices, (1 - alpha/2) * 100)
            
            # Risk skoru (volatilite bazlı)
            risk_score = min(scenario_volatility * 100, 100)
            
            # Beklenen getiri
            expected_return = np.mean(price_changes)
            
            # Volatilite
            volatility = np.std(price_changes)
            
            result = SimulationResult(
                symbol=symbol,
                scenario=scenario_name,
                current_price=current_price,
                predicted_price=predicted_price,
                price_change=price_change,
                price_change_pct=price_change_pct,
                confidence_interval=(lower_bound, upper_bound),
                probability=scenario.probability,
                risk_score=risk_score,
                expected_return=expected_return,
                volatility=volatility,
                simulation_data=simulation_data,
                timestamp=datetime.now()
            )
            
            logger.info(f"✅ Scenario simulation completed: {symbol} - {scenario_name}")
            return result
            
        except Exception as e:
            logger.error(f"❌ Simulate scenario error: {e}")
            raise
    
    async def simulate_multiple_scenarios(self,
                                        symbol: str,
                                        current_price: float,
                                        historical_data: Optional[pd.DataFrame] = None) -> List[SimulationResult]:
        """Çoklu senaryo simülasyonu"""
        try:
            results = []
            
            for scenario_name in self.scenarios.keys():
                try:
                    result = await self.simulate_scenario(
                        symbol=symbol,
                        scenario_name=scenario_name,
                        current_price=current_price,
                        historical_data=historical_data
                    )
                    results.append(result)
                except Exception as e:
                    logger.error(f"❌ Scenario {scenario_name} failed: {e}")
                    continue
            
            logger.info(f"✅ Multiple scenario simulation completed: {len(results)} scenarios")
            return results
            
        except Exception as e:
            logger.error(f"❌ Multiple scenario simulation error: {e}")
            return []
    
    async def simulate_portfolio(self,
                               symbols: List[str],
                               weights: List[float],
                               current_prices: List[float],
                               historical_data: Optional[Dict[str, pd.DataFrame]] = None) -> PortfolioSimulation:
        """Portföy simülasyonu"""
        try:
            if len(symbols) != len(weights) or len(symbols) != len(current_prices):
                raise ValueError("Symbols, weights, and prices must have the same length")
            
            if abs(sum(weights) - 1.0) > 0.01:
                raise ValueError("Weights must sum to 1.0")
            
            portfolio_results = []
            portfolio_value = sum(w * p for w, p in zip(weights, current_prices))
            
            # Her sembol için simülasyon
            for symbol, weight, price in zip(symbols, weights, current_prices):
                hist_data = historical_data.get(symbol) if historical_data else None
                
                # En olası senaryo ile simülasyon
                most_likely_scenario = max(self.scenarios.keys(), 
                                         key=lambda s: self.scenarios[s].probability)
                
                result = await self.simulate_scenario(
                    symbol=symbol,
                    scenario_name=most_likely_scenario,
                    current_price=price,
                    historical_data=hist_data
                )
                
                portfolio_results.append(result)
            
            # Portföy istatistikleri
            portfolio_return = sum(w * r.expected_return for w, r in zip(weights, portfolio_results))
            portfolio_volatility = np.sqrt(sum(w**2 * r.volatility**2 for w, r in zip(weights, portfolio_results)))
            
            # Sharpe ratio (risk-free rate = 0.05)
            risk_free_rate = 0.05
            sharpe_ratio = (portfolio_return - risk_free_rate) / portfolio_volatility if portfolio_volatility > 0 else 0
            
            # Max drawdown (basit hesaplama)
            max_drawdown = max(r.risk_score for r in portfolio_results)
            
            portfolio_sim = PortfolioSimulation(
                symbols=symbols,
                weights=weights,
                scenarios=[r.scenario for r in portfolio_results],
                portfolio_value=portfolio_value,
                expected_return=portfolio_return,
                portfolio_volatility=portfolio_volatility,
                sharpe_ratio=sharpe_ratio,
                max_drawdown=max_drawdown,
                simulation_results=portfolio_results,
                timestamp=datetime.now()
            )
            
            logger.info(f"✅ Portfolio simulation completed: {len(symbols)} assets")
            return portfolio_sim
            
        except Exception as e:
            logger.error(f"❌ Portfolio simulation error: {e}")
            raise
    
    def get_scenario_recommendations(self, results: List[SimulationResult]) -> List[str]:
        """Senaryo önerilerini getir"""
        try:
            recommendations = []
            
            # En iyi senaryo
            best_scenario = max(results, key=lambda r: r.expected_return)
            worst_scenario = min(results, key=lambda r: r.expected_return)
            
            recommendations.append(f"🎯 En iyi senaryo: {best_scenario.scenario} (%{best_scenario.expected_return:.1f} beklenen getiri)")
            recommendations.append(f"⚠️ En kötü senaryo: {worst_scenario.scenario} (%{worst_scenario.expected_return:.1f} beklenen getiri)")
            
            # Risk analizi
            high_risk_scenarios = [r for r in results if r.risk_score > 70]
            if high_risk_scenarios:
                recommendations.append(f"🚨 Yüksek riskli senaryolar: {', '.join(r.scenario for r in high_risk_scenarios)}")
            
            # Volatilite analizi
            high_vol_scenarios = [r for r in results if r.volatility > 20]
            if high_vol_scenarios:
                recommendations.append(f"📈 Yüksek volatilite senaryoları: {', '.join(r.scenario for r in high_vol_scenarios)}")
            
            return recommendations
            
        except Exception as e:
            logger.error(f"❌ Get scenario recommendations error: {e}")
            return ["Öneri oluşturulamadı"]
    
    def get_statistics(self) -> Dict[str, Any]:
        """İstatistikleri getir"""
        try:
            stats = {
                'total_scenarios': len(self.scenarios),
                'simulation_params': self.simulation_params,
                'prophet_available': PROPHET_AVAILABLE,
                'scipy_available': SCIPY_AVAILABLE,
                'scenario_probabilities': {name: s.probability for name, s in self.scenarios.items()}
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Get statistics error: {e}")
            return {}

# Global instance
predictive_twin_engine = PredictiveTwinEngine()

if __name__ == "__main__":
    async def test_predictive_twin():
        """Test fonksiyonu"""
        logger.info("🧪 Testing Predictive Twin Engine...")
        
        # Test verisi
        test_data = pd.DataFrame({
            'ds': pd.date_range(start='2023-01-01', end='2024-01-01', freq='D'),
            'y': [100 + i * 0.1 + random.uniform(-2, 2) for i in range(366)]
        })
        
        # Tek senaryo simülasyonu
        result = await predictive_twin_engine.simulate_scenario(
            symbol="THYAO",
            scenario_name="bull_market",
            current_price=245.50,
            historical_data=test_data
        )
        
        logger.info(f"✅ Test simulation: {result.scenario} - {result.price_change_pct:.1f}%")
        
        # Çoklu senaryo simülasyonu
        results = await predictive_twin_engine.simulate_multiple_scenarios(
            symbol="THYAO",
            current_price=245.50,
            historical_data=test_data
        )
        
        logger.info(f"✅ Multiple scenarios: {len(results)} results")
        
        # Öneriler
        recommendations = predictive_twin_engine.get_scenario_recommendations(results)
        for rec in recommendations:
            logger.info(f"💡 {rec}")
        
        logger.info("✅ Predictive Twin Engine test completed")
    
    # Test çalıştır
    asyncio.run(test_predictive_twin())
