"""
Opsiyon Analizi Sistemi
Greeks, Volatility, Strike Price analizi
"""

import asyncio
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import logging
from scipy.stats import norm
import math

class OptionsGreeks:
    """Black-Scholes Greeks Calculator"""
    
    @staticmethod
    def black_scholes_call(S: float, K: float, T: float, r: float, sigma: float) -> float:
        """Black-Scholes call option price"""
        if T <= 0:
            return max(S - K, 0)
        
        d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
        d2 = d1 - sigma * np.sqrt(T)
        
        call_price = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
        return call_price
    
    @staticmethod
    def black_scholes_put(S: float, K: float, T: float, r: float, sigma: float) -> float:
        """Black-Scholes put option price"""
        if T <= 0:
            return max(K - S, 0)
        
        d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
        d2 = d1 - sigma * np.sqrt(T)
        
        put_price = K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
        return put_price
    
    @staticmethod
    def calculate_greeks(S: float, K: float, T: float, r: float, sigma: float, option_type: str = 'call') -> Dict:
        """Calculate all Greeks for an option"""
        if T <= 0:
            return {
                'delta': 1.0 if option_type == 'call' and S > K else 0.0,
                'gamma': 0.0,
                'theta': 0.0,
                'vega': 0.0,
                'rho': 0.0
            }
        
        d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
        d2 = d1 - sigma * np.sqrt(T)
        
        # Delta
        if option_type == 'call':
            delta = norm.cdf(d1)
        else:
            delta = norm.cdf(d1) - 1
        
        # Gamma
        gamma = norm.pdf(d1) / (S * sigma * np.sqrt(T))
        
        # Theta
        if option_type == 'call':
            theta = (-S * norm.pdf(d1) * sigma / (2 * np.sqrt(T)) - 
                    r * K * np.exp(-r * T) * norm.cdf(d2)) / 365
        else:
            theta = (-S * norm.pdf(d1) * sigma / (2 * np.sqrt(T)) + 
                    r * K * np.exp(-r * T) * norm.cdf(-d2)) / 365
        
        # Vega
        vega = S * np.sqrt(T) * norm.pdf(d1) / 100
        
        # Rho
        if option_type == 'call':
            rho = K * T * np.exp(-r * T) * norm.cdf(d2) / 100
        else:
            rho = -K * T * np.exp(-r * T) * norm.cdf(-d2) / 100
        
        return {
            'delta': round(delta, 4),
            'gamma': round(gamma, 6),
            'theta': round(theta, 4),
            'vega': round(vega, 4),
            'rho': round(rho, 4)
        }

class OptionsAnalyzer:
    """Options analysis engine"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.greeks_calculator = OptionsGreeks()
        
        # Mock underlying assets
        self.underlying_assets = {
            'THYAO': {'price': 325.50, 'volatility': 0.35, 'dividend_yield': 0.028},
            'ASELS': {'price': 88.40, 'volatility': 0.42, 'dividend_yield': 0.015},
            'TUPRS': {'price': 145.20, 'volatility': 0.28, 'dividend_yield': 0.042},
            'SISE': {'price': 45.80, 'volatility': 0.38, 'dividend_yield': 0.031},
            'EREGL': {'price': 67.30, 'volatility': 0.45, 'dividend_yield': 0.029}
        }
        
        # Risk-free rate (Turkey 10-year bond yield)
        self.risk_free_rate = 0.25  # 25% (high due to inflation)
    
    def get_strike_prices(self, underlying_price: float, num_strikes: int = 10) -> List[float]:
        """Generate strike prices around current price"""
        strikes = []
        step = underlying_price * 0.05  # 5% steps
        
        for i in range(-num_strikes//2, num_strikes//2 + 1):
            strike = underlying_price + (i * step)
            if strike > 0:
                strikes.append(round(strike, 2))
        
        return sorted(strikes)
    
    def get_expiration_dates(self) -> List[str]:
        """Get available expiration dates"""
        dates = []
        current_date = datetime.now()
        
        # Weekly options (next 4 weeks)
        for i in range(1, 5):
            exp_date = current_date + timedelta(weeks=i)
            dates.append(exp_date.strftime('%Y-%m-%d'))
        
        # Monthly options (next 3 months)
        for i in range(1, 4):
            exp_date = current_date + timedelta(days=30*i)
            dates.append(exp_date.strftime('%Y-%m-%d'))
        
        return dates
    
    def calculate_time_to_expiry(self, expiration_date: str) -> float:
        """Calculate time to expiry in years"""
        exp_date = datetime.strptime(expiration_date, '%Y-%m-%d')
        current_date = datetime.now()
        days_to_expiry = (exp_date - current_date).days
        
        if days_to_expiry <= 0:
            return 0.001  # Very small value for expired options
        
        return days_to_expiry / 365.0
    
    async def analyze_option_chain(self, symbol: str, expiration_date: str) -> Dict:
        """Analyze complete option chain"""
        try:
            if symbol not in self.underlying_assets:
                return {"error": f"Symbol {symbol} not supported"}
            
            underlying = self.underlying_assets[symbol]
            S = underlying['price']
            sigma = underlying['volatility']
            r = self.risk_free_rate
            
            T = self.calculate_time_to_expiry(expiration_date)
            strikes = self.get_strike_prices(S)
            
            option_chain = {
                'symbol': symbol,
                'underlying_price': S,
                'expiration_date': expiration_date,
                'time_to_expiry': T,
                'risk_free_rate': r,
                'volatility': sigma,
                'calls': [],
                'puts': [],
                'last_update': datetime.now().isoformat()
            }
            
            # Calculate call options
            for strike in strikes:
                call_price = self.greeks_calculator.black_scholes_call(S, strike, T, r, sigma)
                call_greeks = self.greeks_calculator.calculate_greeks(S, strike, T, r, sigma, 'call')
                
                option_chain['calls'].append({
                    'strike': strike,
                    'price': round(call_price, 2),
                    'intrinsic_value': max(S - strike, 0),
                    'time_value': round(call_price - max(S - strike, 0), 2),
                    'moneyness': 'ITM' if S > strike else 'OTM' if S < strike else 'ATM',
                    'greeks': call_greeks
                })
            
            # Calculate put options
            for strike in strikes:
                put_price = self.greeks_calculator.black_scholes_put(S, strike, T, r, sigma)
                put_greeks = self.greeks_calculator.calculate_greeks(S, strike, T, r, sigma, 'put')
                
                option_chain['puts'].append({
                    'strike': strike,
                    'price': round(put_price, 2),
                    'intrinsic_value': max(strike - S, 0),
                    'time_value': round(put_price - max(strike - S, 0), 2),
                    'moneyness': 'ITM' if S < strike else 'OTM' if S > strike else 'ATM',
                    'greeks': put_greeks
                })
            
            return option_chain
            
        except Exception as e:
            self.logger.error(f"Error analyzing option chain for {symbol}: {e}")
            return {"error": str(e)}
    
    async def get_volatility_surface(self, symbol: str) -> Dict:
        """Get volatility surface for symbol"""
        try:
            if symbol not in self.underlying_assets:
                return {"error": f"Symbol {symbol} not supported"}
            
            underlying = self.underlying_assets[symbol]
            S = underlying['price']
            base_vol = underlying['volatility']
            
            strikes = self.get_strike_prices(S, 15)
            expirations = self.get_expiration_dates()[:6]  # First 6 expirations
            
            volatility_surface = {
                'symbol': symbol,
                'underlying_price': S,
                'strikes': strikes,
                'expirations': expirations,
                'volatility_matrix': [],
                'last_update': datetime.now().isoformat()
            }
            
            # Generate volatility matrix (smile/skew effect)
            for i, exp_date in enumerate(expirations):
                T = self.calculate_time_to_expiry(exp_date)
                vol_row = []
                
                for j, strike in enumerate(strikes):
                    # Volatility smile/skew simulation
                    moneyness = strike / S
                    
                    if moneyness < 0.9:  # Deep OTM puts
                        vol = base_vol * (1.2 + 0.1 * np.sin(j * 0.5))
                    elif moneyness > 1.1:  # Deep OTM calls
                        vol = base_vol * (1.1 + 0.05 * np.sin(j * 0.3))
                    else:  # ATM and near ATM
                        vol = base_vol * (1.0 + 0.02 * np.sin(j * 0.2))
                    
                    # Time decay effect
                    vol *= (1 + 0.1 * i / len(expirations))
                    
                    vol_row.append(round(vol, 4))
                
                volatility_surface['volatility_matrix'].append(vol_row)
            
            return volatility_surface
            
        except Exception as e:
            self.logger.error(f"Error getting volatility surface for {symbol}: {e}")
            return {"error": str(e)}
    
    async def analyze_strategy(self, symbol: str, strategy_type: str, params: Dict) -> Dict:
        """Analyze options strategy"""
        try:
            if symbol not in self.underlying_assets:
                return {"error": f"Symbol {symbol} not supported"}
            
            underlying = self.underlying_assets[symbol]
            S = underlying['price']
            sigma = underlying['volatility']
            r = self.risk_free_rate
            
            analysis = {
                'symbol': symbol,
                'strategy_type': strategy_type,
                'underlying_price': S,
                'analysis': {},
                'greeks': {},
                'profit_loss': [],
                'breakeven_points': [],
                'max_profit': 0,
                'max_loss': 0,
                'last_update': datetime.now().isoformat()
            }
            
            if strategy_type == 'long_call':
                analysis.update(self._analyze_long_call(S, sigma, r, params))
            elif strategy_type == 'long_put':
                analysis.update(self._analyze_long_put(S, sigma, r, params))
            elif strategy_type == 'covered_call':
                analysis.update(self._analyze_covered_call(S, sigma, r, params))
            elif strategy_type == 'protective_put':
                analysis.update(self._analyze_protective_put(S, sigma, r, params))
            elif strategy_type == 'straddle':
                analysis.update(self._analyze_straddle(S, sigma, r, params))
            elif strategy_type == 'strangle':
                analysis.update(self._analyze_strangle(S, sigma, r, params))
            elif strategy_type == 'iron_condor':
                analysis.update(self._analyze_iron_condor(S, sigma, r, params))
            
            return analysis
            
        except Exception as e:
            self.logger.error(f"Error analyzing strategy for {symbol}: {e}")
            return {"error": str(e)}
    
    def _analyze_long_call(self, S: float, sigma: float, r: float, params: Dict) -> Dict:
        """Analyze long call strategy"""
        strike = params.get('strike', S)
        expiration = params.get('expiration', '2024-01-15')
        T = self.calculate_time_to_expiry(expiration)
        
        call_price = self.greeks_calculator.black_scholes_call(S, strike, T, r, sigma)
        call_greeks = self.greeks_calculator.calculate_greeks(S, strike, T, r, sigma, 'call')
        
        # Profit/Loss analysis
        price_range = np.linspace(S * 0.7, S * 1.3, 50)
        pnl = []
        
        for price in price_range:
            intrinsic = max(price - strike, 0)
            pnl_value = intrinsic - call_price
            pnl.append(pnl_value)
        
        return {
            'analysis': {
                'cost': call_price,
                'breakeven': strike + call_price,
                'max_profit': 'Unlimited',
                'max_loss': call_price
            },
            'greeks': call_greeks,
            'profit_loss': [{'price': float(p), 'pnl': float(pl)} for p, pl in zip(price_range, pnl)],
            'breakeven_points': [strike + call_price],
            'max_profit': float('inf'),
            'max_loss': call_price
        }
    
    def _analyze_long_put(self, S: float, sigma: float, r: float, params: Dict) -> Dict:
        """Analyze long put strategy"""
        strike = params.get('strike', S)
        expiration = params.get('expiration', '2024-01-15')
        T = self.calculate_time_to_expiry(expiration)
        
        put_price = self.greeks_calculator.black_scholes_put(S, strike, T, r, sigma)
        put_greeks = self.greeks_calculator.calculate_greeks(S, strike, T, r, sigma, 'put')
        
        # Profit/Loss analysis
        price_range = np.linspace(S * 0.7, S * 1.3, 50)
        pnl = []
        
        for price in price_range:
            intrinsic = max(strike - price, 0)
            pnl_value = intrinsic - put_price
            pnl.append(pnl_value)
        
        return {
            'analysis': {
                'cost': put_price,
                'breakeven': strike - put_price,
                'max_profit': strike - put_price,
                'max_loss': put_price
            },
            'greeks': put_greeks,
            'profit_loss': [{'price': float(p), 'pnl': float(pl)} for p, pl in zip(price_range, pnl)],
            'breakeven_points': [strike - put_price],
            'max_profit': strike - put_price,
            'max_loss': put_price
        }
    
    def _analyze_covered_call(self, S: float, sigma: float, r: float, params: Dict) -> Dict:
        """Analyze covered call strategy"""
        strike = params.get('strike', S * 1.05)
        expiration = params.get('expiration', '2024-01-15')
        T = self.calculate_time_to_expiry(expiration)
        
        call_price = self.greeks_calculator.black_scholes_call(S, strike, T, r, sigma)
        call_greeks = self.greeks_calculator.calculate_greeks(S, strike, T, r, sigma, 'call')
        
        # Covered call Greeks (stock + short call)
        total_delta = 1.0 - call_greeks['delta']  # Long stock, short call
        total_gamma = -call_greeks['gamma']
        total_theta = -call_greeks['theta']
        total_vega = -call_greeks['vega']
        
        # Profit/Loss analysis
        price_range = np.linspace(S * 0.8, S * 1.2, 50)
        pnl = []
        
        for price in price_range:
            stock_pnl = price - S
            call_pnl = call_price - max(price - strike, 0)
            total_pnl = stock_pnl + call_pnl
            pnl.append(total_pnl)
        
        return {
            'analysis': {
                'net_credit': call_price,
                'breakeven': S - call_price,
                'max_profit': strike - S + call_price,
                'max_loss': 'Unlimited (if stock falls)'
            },
            'greeks': {
                'delta': round(total_delta, 4),
                'gamma': round(total_gamma, 6),
                'theta': round(total_theta, 4),
                'vega': round(total_vega, 4),
                'rho': round(-call_greeks['rho'], 4)
            },
            'profit_loss': [{'price': float(p), 'pnl': float(pl)} for p, pl in zip(price_range, pnl)],
            'breakeven_points': [S - call_price],
            'max_profit': strike - S + call_price,
            'max_loss': float('-inf')
        }
    
    def _analyze_protective_put(self, S: float, sigma: float, r: float, params: Dict) -> Dict:
        """Analyze protective put strategy"""
        strike = params.get('strike', S * 0.95)
        expiration = params.get('expiration', '2024-01-15')
        T = self.calculate_time_to_expiry(expiration)
        
        put_price = self.greeks_calculator.black_scholes_put(S, strike, T, r, sigma)
        put_greeks = self.greeks_calculator.calculate_greeks(S, strike, T, r, sigma, 'put')
        
        # Protective put Greeks (stock + long put)
        total_delta = 1.0 + put_greeks['delta']
        total_gamma = put_greeks['gamma']
        total_theta = put_greeks['theta']
        total_vega = put_greeks['vega']
        
        # Profit/Loss analysis
        price_range = np.linspace(S * 0.8, S * 1.2, 50)
        pnl = []
        
        for price in price_range:
            stock_pnl = price - S
            put_pnl = max(strike - price, 0) - put_price
            total_pnl = stock_pnl + put_pnl
            pnl.append(total_pnl)
        
        return {
            'analysis': {
                'cost': put_price,
                'breakeven': S + put_price,
                'max_profit': 'Unlimited (if stock rises)',
                'max_loss': S - strike + put_price
            },
            'greeks': {
                'delta': round(total_delta, 4),
                'gamma': round(total_gamma, 6),
                'theta': round(total_theta, 4),
                'vega': round(total_vega, 4),
                'rho': round(put_greeks['rho'], 4)
            },
            'profit_loss': [{'price': float(p), 'pnl': float(pl)} for p, pl in zip(price_range, pnl)],
            'breakeven_points': [S + put_price],
            'max_profit': float('inf'),
            'max_loss': S - strike + put_price
        }
    
    def _analyze_straddle(self, S: float, sigma: float, r: float, params: Dict) -> Dict:
        """Analyze long straddle strategy"""
        strike = params.get('strike', S)
        expiration = params.get('expiration', '2024-01-15')
        T = self.calculate_time_to_expiry(expiration)
        
        call_price = self.greeks_calculator.black_scholes_call(S, strike, T, r, sigma)
        put_price = self.greeks_calculator.black_scholes_put(S, strike, T, r, sigma)
        
        call_greeks = self.greeks_calculator.calculate_greeks(S, strike, T, r, sigma, 'call')
        put_greeks = self.greeks_calculator.calculate_greeks(S, strike, T, r, sigma, 'put')
        
        # Straddle Greeks (long call + long put)
        total_delta = call_greeks['delta'] + put_greeks['delta']
        total_gamma = call_greeks['gamma'] + put_greeks['gamma']
        total_theta = call_greeks['theta'] + put_greeks['theta']
        total_vega = call_greeks['vega'] + put_greeks['vega']
        
        total_cost = call_price + put_price
        
        # Profit/Loss analysis
        price_range = np.linspace(S * 0.7, S * 1.3, 50)
        pnl = []
        
        for price in price_range:
            call_pnl = max(price - strike, 0) - call_price
            put_pnl = max(strike - price, 0) - put_price
            total_pnl = call_pnl + put_pnl
            pnl.append(total_pnl)
        
        return {
            'analysis': {
                'cost': total_cost,
                'breakeven_low': strike - total_cost,
                'breakeven_high': strike + total_cost,
                'max_profit': 'Unlimited (in both directions)',
                'max_loss': total_cost
            },
            'greeks': {
                'delta': round(total_delta, 4),
                'gamma': round(total_gamma, 6),
                'theta': round(total_theta, 4),
                'vega': round(total_vega, 4),
                'rho': round(call_greeks['rho'] + put_greeks['rho'], 4)
            },
            'profit_loss': [{'price': float(p), 'pnl': float(pl)} for p, pl in zip(price_range, pnl)],
            'breakeven_points': [strike - total_cost, strike + total_cost],
            'max_profit': float('inf'),
            'max_loss': total_cost
        }
    
    def _analyze_strangle(self, S: float, sigma: float, r: float, params: Dict) -> Dict:
        """Analyze long strangle strategy"""
        call_strike = params.get('call_strike', S * 1.05)
        put_strike = params.get('put_strike', S * 0.95)
        expiration = params.get('expiration', '2024-01-15')
        T = self.calculate_time_to_expiry(expiration)
        
        call_price = self.greeks_calculator.black_scholes_call(S, call_strike, T, r, sigma)
        put_price = self.greeks_calculator.black_scholes_put(S, put_strike, T, r, sigma)
        
        call_greeks = self.greeks_calculator.calculate_greeks(S, call_strike, T, r, sigma, 'call')
        put_greeks = self.greeks_calculator.calculate_greeks(S, put_strike, T, r, sigma, 'put')
        
        # Strangle Greeks (long call + long put)
        total_delta = call_greeks['delta'] + put_greeks['delta']
        total_gamma = call_greeks['gamma'] + put_greeks['gamma']
        total_theta = call_greeks['theta'] + put_greeks['theta']
        total_vega = call_greeks['vega'] + put_greeks['vega']
        
        total_cost = call_price + put_price
        
        # Profit/Loss analysis
        price_range = np.linspace(S * 0.7, S * 1.3, 50)
        pnl = []
        
        for price in price_range:
            call_pnl = max(price - call_strike, 0) - call_price
            put_pnl = max(put_strike - price, 0) - put_price
            total_pnl = call_pnl + put_pnl
            pnl.append(total_pnl)
        
        return {
            'analysis': {
                'cost': total_cost,
                'breakeven_low': put_strike - total_cost,
                'breakeven_high': call_strike + total_cost,
                'max_profit': 'Unlimited (in both directions)',
                'max_loss': total_cost
            },
            'greeks': {
                'delta': round(total_delta, 4),
                'gamma': round(total_gamma, 6),
                'theta': round(total_theta, 4),
                'vega': round(total_vega, 4),
                'rho': round(call_greeks['rho'] + put_greeks['rho'], 4)
            },
            'profit_loss': [{'price': float(p), 'pnl': float(pl)} for p, pl in zip(price_range, pnl)],
            'breakeven_points': [put_strike - total_cost, call_strike + total_cost],
            'max_profit': float('inf'),
            'max_loss': total_cost
        }
    
    def _analyze_iron_condor(self, S: float, sigma: float, r: float, params: Dict) -> Dict:
        """Analyze iron condor strategy"""
        # Iron condor: Sell call spread + Sell put spread
        call_strike_short = params.get('call_strike_short', S * 1.02)
        call_strike_long = params.get('call_strike_long', S * 1.05)
        put_strike_short = params.get('put_strike_short', S * 0.98)
        put_strike_long = params.get('put_strike_long', S * 0.95)
        expiration = params.get('expiration', '2024-01-15')
        T = self.calculate_time_to_expiry(expiration)
        
        # Calculate option prices
        call_short_price = self.greeks_calculator.black_scholes_call(S, call_strike_short, T, r, sigma)
        call_long_price = self.greeks_calculator.black_scholes_call(S, call_strike_long, T, r, sigma)
        put_short_price = self.greeks_calculator.black_scholes_put(S, put_strike_short, T, r, sigma)
        put_long_price = self.greeks_calculator.black_scholes_put(S, put_strike_long, T, r, sigma)
        
        # Net credit received
        net_credit = call_short_price - call_long_price + put_short_price - put_long_price
        
        # Profit/Loss analysis
        price_range = np.linspace(S * 0.9, S * 1.1, 50)
        pnl = []
        
        for price in price_range:
            # Call spread P&L
            call_spread_pnl = (call_short_price - call_long_price) - (
                max(price - call_strike_short, 0) - max(price - call_strike_long, 0)
            )
            
            # Put spread P&L
            put_spread_pnl = (put_short_price - put_long_price) - (
                max(put_strike_short - price, 0) - max(put_strike_long - price, 0)
            )
            
            total_pnl = call_spread_pnl + put_spread_pnl
            pnl.append(total_pnl)
        
        return {
            'analysis': {
                'net_credit': net_credit,
                'max_profit': net_credit,
                'max_loss': (call_strike_long - call_strike_short) - net_credit,
                'profit_zone': f"{put_strike_short} - {call_strike_short}"
            },
            'greeks': {
                'delta': 0.0,  # Market neutral
                'gamma': 0.0,
                'theta': 0.0,
                'vega': 0.0,
                'rho': 0.0
            },
            'profit_loss': [{'price': float(p), 'pnl': float(pl)} for p, pl in zip(price_range, pnl)],
            'breakeven_points': [put_strike_short - net_credit, call_strike_short + net_credit],
            'max_profit': net_credit,
            'max_loss': (call_strike_long - call_strike_short) - net_credit
        }

# Global options analyzer instance
options_analyzer = OptionsAnalyzer()
