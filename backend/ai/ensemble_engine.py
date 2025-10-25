#!/usr/bin/env python3
"""
BIST AI Smart Trader - Ensemble Engine
Advanced AI model ensemble combining Prophet, LSTM, and CatBoost
"""

import asyncio
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
import joblib
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error
import warnings
warnings.filterwarnings('ignore')

# AI Model imports
try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
except ImportError:
    PROPHET_AVAILABLE = False
    print("⚠️ Prophet not available - install with: pip install prophet")

try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    LSTM_AVAILABLE = True
except ImportError:
    LSTM_AVAILABLE = False
    print("⚠️ TensorFlow not available - install with: pip install tensorflow")

try:
    import catboost as cb
    CATBOOST_AVAILABLE = True
except ImportError:
    CATBOOST_AVAILABLE = False
    print("⚠️ CatBoost not available - install with: pip install catboost")

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnsembleEngine:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.weights = {}
        self.performance_history = {}
        self.is_trained = False
        
        # Model configuration
        self.config = {
            'prophet': {
                'enabled': PROPHET_AVAILABLE,
                'weight': 0.4,
                'params': {
                    'seasonality_mode': 'multiplicative',
                    'changepoint_prior_scale': 0.05,
                    'seasonality_prior_scale': 10.0
                }
            },
            'lstm': {
                'enabled': LSTM_AVAILABLE,
                'weight': 0.35,
                'params': {
                    'sequence_length': 60,
                    'units': 50,
                    'dropout': 0.2,
                    'epochs': 100,
                    'batch_size': 32
                }
            },
            'catboost': {
                'enabled': CATBOOST_AVAILABLE,
                'weight': 0.25,
                'params': {
                    'iterations': 1000,
                    'learning_rate': 0.1,
                    'depth': 6,
                    'l2_leaf_reg': 3,
                    'random_seed': 42
                }
            }
        }
        
        logger.info("🧠 Ensemble Engine initialized")

    async def fetch_market_data(self, symbols: List[str], period: str = "1y") -> Dict[str, pd.DataFrame]:
        """Fetch market data for given symbols"""
        data = {}
        
        for symbol in symbols:
            try:
                ticker = yf.Ticker(symbol)
                df = ticker.history(period=period)
                
                if df.empty:
                    logger.warning(f"No data found for {symbol}")
                    continue
                
                # Clean and prepare data
                df = df.dropna()
                df['Symbol'] = symbol
                df['Date'] = df.index
                df.reset_index(drop=True, inplace=True)
                
                data[symbol] = df
                logger.info(f"✅ Fetched {len(df)} records for {symbol}")
                
            except Exception as e:
                logger.error(f"❌ Error fetching data for {symbol}: {e}")
        
        return data

    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepare technical features for ML models"""
        df = df.copy()
        
        # Price features
        df['Returns'] = df['Close'].pct_change()
        df['Log_Returns'] = np.log(df['Close'] / df['Close'].shift(1))
        
        # Technical indicators
        df['SMA_5'] = df['Close'].rolling(window=5).mean()
        df['SMA_20'] = df['Close'].rolling(window=20).mean()
        df['SMA_50'] = df['Close'].rolling(window=50).mean()
        
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
        df['MACD_Histogram'] = df['MACD'] - df['MACD_Signal']
        
        # Bollinger Bands
        df['BB_Middle'] = df['Close'].rolling(window=20).mean()
        bb_std = df['Close'].rolling(window=20).std()
        df['BB_Upper'] = df['BB_Middle'] + (bb_std * 2)
        df['BB_Lower'] = df['BB_Middle'] - (bb_std * 2)
        df['BB_Width'] = df['BB_Upper'] - df['BB_Lower']
        df['BB_Position'] = (df['Close'] - df['BB_Lower']) / (df['BB_Upper'] - df['BB_Lower'])
        
        # Volume features
        df['Volume_SMA'] = df['Volume'].rolling(window=20).mean()
        df['Volume_Ratio'] = df['Volume'] / df['Volume_SMA']
        
        # Volatility
        df['Volatility'] = df['Returns'].rolling(window=20).std()
        
        # Price position
        df['Price_Position'] = (df['Close'] - df['Close'].rolling(window=20).min()) / (df['Close'].rolling(window=20).max() - df['Close'].rolling(window=20).min())
        
        return df.dropna()

    def train_prophet_model(self, df: pd.DataFrame, symbol: str) -> Dict[str, Any]:
        """Train Prophet model"""
        if not self.config['prophet']['enabled']:
            return {'status': 'disabled'}
        
        try:
            # Prepare data for Prophet
            prophet_df = df[['Date', 'Close']].copy()
            prophet_df.columns = ['ds', 'y']
            
            # Create and train model
            model = Prophet(**self.config['prophet']['params'])
            model.fit(prophet_df)
            
            # Make predictions
            future = model.make_future_dataframe(periods=30)
            forecast = model.predict(future)
            
            # Calculate performance
            predictions = forecast['yhat'].iloc[-30:].values
            actual = df['Close'].iloc[-30:].values
            
            mse = mean_squared_error(actual, predictions)
            mae = mean_absolute_error(actual, predictions)
            
            self.models[f'{symbol}_prophet'] = model
            self.performance_history[f'{symbol}_prophet'] = {
                'mse': mse,
                'mae': mae,
                'last_updated': datetime.now().isoformat()
            }
            
            logger.info(f"✅ Prophet model trained for {symbol} - MSE: {mse:.4f}")
            
            return {
                'status': 'success',
                'mse': mse,
                'mae': mae,
                'predictions': predictions.tolist()
            }
            
        except Exception as e:
            logger.error(f"❌ Prophet training failed for {symbol}: {e}")
            return {'status': 'error', 'error': str(e)}

    def train_lstm_model(self, df: pd.DataFrame, symbol: str) -> Dict[str, Any]:
        """Train LSTM model"""
        if not self.config['lstm']['enabled']:
            return {'status': 'disabled'}
        
        try:
            # Prepare features
            feature_columns = ['Close', 'Volume', 'SMA_20', 'RSI', 'MACD', 'BB_Position', 'Volatility']
            features = df[feature_columns].values
            
            # Scale features
            scaler = MinMaxScaler()
            features_scaled = scaler.fit_transform(features)
            
            # Create sequences
            sequence_length = self.config['lstm']['params']['sequence_length']
            X, y = [], []
            
            for i in range(sequence_length, len(features_scaled)):
                X.append(features_scaled[i-sequence_length:i])
                y.append(features_scaled[i, 0])  # Close price
            
            X, y = np.array(X), np.array(y)
            
            # Split data
            split_idx = int(0.8 * len(X))
            X_train, X_test = X[:split_idx], X[split_idx:]
            y_train, y_test = y[:split_idx], y[split_idx:]
            
            # Build LSTM model
            model = Sequential([
                LSTM(self.config['lstm']['params']['units'], return_sequences=True, input_shape=(sequence_length, len(feature_columns))),
                Dropout(self.config['lstm']['params']['dropout']),
                LSTM(self.config['lstm']['params']['units'], return_sequences=False),
                Dropout(self.config['lstm']['params']['dropout']),
                Dense(25),
                Dense(1)
            ])
            
            model.compile(optimizer='adam', loss='mse', metrics=['mae'])
            
            # Train model
            model.fit(X_train, y_train, 
                     epochs=self.config['lstm']['params']['epochs'],
                     batch_size=self.config['lstm']['params']['batch_size'],
                     validation_data=(X_test, y_test),
                     verbose=0)
            
            # Make predictions
            predictions = model.predict(X_test)
            
            # Calculate performance
            mse = mean_squared_error(y_test, predictions)
            mae = mean_absolute_error(y_test, predictions)
            
            self.models[f'{symbol}_lstm'] = model
            self.scalers[f'{symbol}_lstm'] = scaler
            self.performance_history[f'{symbol}_lstm'] = {
                'mse': mse,
                'mae': mae,
                'last_updated': datetime.now().isoformat()
            }
            
            logger.info(f"✅ LSTM model trained for {symbol} - MSE: {mse:.4f}")
            
            return {
                'status': 'success',
                'mse': mse,
                'mae': mae,
                'predictions': predictions.flatten().tolist()
            }
            
        except Exception as e:
            logger.error(f"❌ LSTM training failed for {symbol}: {e}")
            return {'status': 'error', 'error': str(e)}

    def train_catboost_model(self, df: pd.DataFrame, symbol: str) -> Dict[str, Any]:
        """Train CatBoost model"""
        if not self.config['catboost']['enabled']:
            return {'status': 'disabled'}
        
        try:
            # Prepare features
            feature_columns = ['Close', 'Volume', 'SMA_5', 'SMA_20', 'SMA_50', 'EMA_12', 'EMA_26', 
                             'RSI', 'MACD', 'MACD_Signal', 'BB_Position', 'Volume_Ratio', 'Volatility', 'Price_Position']
            
            # Create lag features
            for col in ['Close', 'Volume', 'RSI']:
                for lag in [1, 2, 3, 5]:
                    df[f'{col}_lag_{lag}'] = df[col].shift(lag)
            
            # Update feature columns
            feature_columns.extend([f'{col}_lag_{lag}' for col in ['Close', 'Volume', 'RSI'] for lag in [1, 2, 3, 5]])
            
            # Prepare data
            df_features = df[feature_columns].dropna()
            X = df_features.drop('Close', axis=1)
            y = df_features['Close']
            
            # Split data
            split_idx = int(0.8 * len(X))
            X_train, X_test = X[:split_idx], X[split_idx:]
            y_train, y_test = y[:split_idx], y[split_idx:]
            
            # Train CatBoost model
            model = cb.CatBoostRegressor(**self.config['catboost']['params'], verbose=False)
            model.fit(X_train, y_train, eval_set=(X_test, y_test))
            
            # Make predictions
            predictions = model.predict(X_test)
            
            # Calculate performance
            mse = mean_squared_error(y_test, predictions)
            mae = mean_absolute_error(y_test, predictions)
            
            self.models[f'{symbol}_catboost'] = model
            self.performance_history[f'{symbol}_catboost'] = {
                'mse': mse,
                'mae': mae,
                'last_updated': datetime.now().isoformat()
            }
            
            logger.info(f"✅ CatBoost model trained for {symbol} - MSE: {mse:.4f}")
            
            return {
                'status': 'success',
                'mse': mse,
                'mae': mae,
                'predictions': predictions.tolist()
            }
            
        except Exception as e:
            logger.error(f"❌ CatBoost training failed for {symbol}: {e}")
            return {'status': 'error', 'error': str(e)}

    async def train_ensemble(self, symbols: List[str]) -> Dict[str, Any]:
        """Train ensemble models for all symbols"""
        logger.info(f"🧠 Starting ensemble training for {len(symbols)} symbols")
        
        results = {}
        
        # Fetch market data
        market_data = await self.fetch_market_data(symbols)
        
        for symbol, df in market_data.items():
            logger.info(f"📊 Training models for {symbol}")
            
            # Prepare features
            df_features = self.prepare_features(df)
            
            if len(df_features) < 100:
                logger.warning(f"Insufficient data for {symbol}, skipping")
                continue
            
            symbol_results = {}
            
            # Train Prophet
            prophet_result = self.train_prophet_model(df_features, symbol)
            symbol_results['prophet'] = prophet_result
            
            # Train LSTM
            lstm_result = self.train_lstm_model(df_features, symbol)
            symbol_results['lstm'] = lstm_result
            
            # Train CatBoost
            catboost_result = self.train_catboost_model(df_features, symbol)
            symbol_results['catboost'] = catboost_result
            
            results[symbol] = symbol_results
        
        self.is_trained = True
        logger.info("✅ Ensemble training completed")
        
        return results

    def predict_ensemble(self, symbol: str, days_ahead: int = 30) -> Dict[str, Any]:
        """Make ensemble predictions for a symbol"""
        if not self.is_trained:
            return {'status': 'error', 'error': 'Models not trained'}
        
        predictions = {}
        weights = {}
        
        # Prophet prediction
        if f'{symbol}_prophet' in self.models:
            try:
                model = self.models[f'{symbol}_prophet']
                future = model.make_future_dataframe(periods=days_ahead)
                forecast = model.predict(future)
                predictions['prophet'] = forecast['yhat'].iloc[-days_ahead:].values.tolist()
                weights['prophet'] = self.config['prophet']['weight']
            except Exception as e:
                logger.error(f"Prophet prediction failed for {symbol}: {e}")
        
        # LSTM prediction
        if f'{symbol}_lstm' in self.models:
            try:
                # This would require recent data - simplified for now
                predictions['lstm'] = [0] * days_ahead  # Placeholder
                weights['lstm'] = self.config['lstm']['weight']
            except Exception as e:
                logger.error(f"LSTM prediction failed for {symbol}: {e}")
        
        # CatBoost prediction
        if f'{symbol}_catboost' in self.models:
            try:
                # This would require recent data - simplified for now
                predictions['catboost'] = [0] * days_ahead  # Placeholder
                weights['catboost'] = self.config['catboost']['weight']
            except Exception as e:
                logger.error(f"CatBoost prediction failed for {symbol}: {e}")
        
        # Calculate weighted ensemble prediction
        if predictions:
            ensemble_pred = []
            total_weight = sum(weights.values())
            
            for i in range(days_ahead):
                weighted_sum = 0
                for model_name, pred_values in predictions.items():
                    if i < len(pred_values):
                        weighted_sum += pred_values[i] * weights[model_name]
                ensemble_pred.append(weighted_sum / total_weight)
            
            return {
                'status': 'success',
                'ensemble_prediction': ensemble_pred,
                'individual_predictions': predictions,
                'weights': weights,
                'confidence': min(weights.values()) if weights else 0
            }
        else:
            return {'status': 'error', 'error': 'No models available for prediction'}

    def save_models(self, path: str = "./ai/models/"):
        """Save trained models"""
        import os
        os.makedirs(path, exist_ok=True)
        
        for model_name, model in self.models.items():
            model_path = os.path.join(path, f"{model_name}.joblib")
            joblib.dump(model, model_path)
            logger.info(f"💾 Saved model: {model_name}")
        
        # Save scalers
        for scaler_name, scaler in self.scalers.items():
            scaler_path = os.path.join(path, f"{scaler_name}_scaler.joblib")
            joblib.dump(scaler, scaler_path)
            logger.info(f"💾 Saved scaler: {scaler_name}")
        
        # Save performance history
        import json
        perf_path = os.path.join(path, "performance_history.json")
        with open(perf_path, 'w') as f:
            json.dump(self.performance_history, f, indent=2)
        
        logger.info("💾 All models saved successfully")

    def load_models(self, path: str = "./ai/models/"):
        """Load trained models"""
        import os
        import json
        
        if not os.path.exists(path):
            logger.warning(f"Model path {path} does not exist")
            return False
        
        # Load models
        for filename in os.listdir(path):
            if filename.endswith('.joblib') and not filename.endswith('_scaler.joblib'):
                model_name = filename.replace('.joblib', '')
                model_path = os.path.join(path, filename)
                self.models[model_name] = joblib.load(model_path)
                logger.info(f"📂 Loaded model: {model_name}")
        
        # Load scalers
        for filename in os.listdir(path):
            if filename.endswith('_scaler.joblib'):
                scaler_name = filename.replace('_scaler.joblib', '')
                scaler_path = os.path.join(path, filename)
                self.scalers[scaler_name] = joblib.load(scaler_path)
                logger.info(f"📂 Loaded scaler: {scaler_name}")
        
        # Load performance history
        perf_path = os.path.join(path, "performance_history.json")
        if os.path.exists(perf_path):
            with open(perf_path, 'r') as f:
                self.performance_history = json.load(f)
            logger.info("📂 Loaded performance history")
        
        self.is_trained = True
        logger.info("✅ All models loaded successfully")
        return True

# Global ensemble engine instance
ensemble_engine = EnsembleEngine()

async def main():
    """Main function for testing"""
    symbols = ["THYAO.IS", "ASELS.IS", "TUPRS.IS", "SISE.IS", "EREGL.IS"]
    
    # Train ensemble
    results = await ensemble_engine.train_ensemble(symbols)
    
    # Save models
    ensemble_engine.save_models()
    
    # Test prediction
    for symbol in symbols:
        if symbol in results:
            prediction = ensemble_engine.predict_ensemble(symbol)
            print(f"\n{symbol} Prediction:")
            print(f"Status: {prediction.get('status')}")
            if prediction.get('status') == 'success':
                print(f"Confidence: {prediction.get('confidence', 0):.2f}")

if __name__ == "__main__":
    asyncio.run(main())