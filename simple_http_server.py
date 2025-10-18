#!/usr/bin/env python3
"""
Basit HTTP sunucusu - BIST AI Smart Trader için
"""

import json
import asyncio
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
import os
from urllib.parse import urlparse, parse_qs
import threading
import time

# Local imports
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from backend.services.ultra_accuracy_optimizer import ultra_accuracy_optimizer
    from backend.services.real_time_data_sources import real_time_data_sources
    from backend.services.deep_learning_models import deep_learning_models
    from backend.services.advanced_ensemble_strategies import advanced_ensemble_strategies
    from backend.services.market_regime_detector import market_regime_detector
    from backend.connectors.kafka_stub import KafkaClientStub
    print("✅ Ultra Accuracy Optimizer, Real-time Data Sources, Deep Learning Models, Advanced Ensemble Strategies ve Market Regime Detector başarıyla import edildi")
except ImportError as e:
    print(f"⚠️ Servis import hatası: {e}")
    ultra_accuracy_optimizer = None
    real_time_data_sources = None
    deep_learning_models = None
    advanced_ensemble_strategies = None
    market_regime_detector = None
    KafkaClientStub = None

# Ingestion client (Kafka/Redpanda) stub init
kafka_client = None
try:
    if 'KafkaClientStub' in globals() and KafkaClientStub is not None:
        kafka_client = KafkaClientStub()
except Exception as _:
    kafka_client = None

class BISTAIHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query_params = parse_qs(parsed_path.query)
        
        # CORS headers
        self.send_cors_headers()
        
        if path == '/health':
            # Inline health response to avoid attribute issues
            response = {
                "status": "healthy",
                "version": "2.0.0",
                "ultra_accuracy_optimizer": ultra_accuracy_optimizer is not None,
                "real_time_data_sources": real_time_data_sources is not None,
                "deep_learning_models": deep_learning_models is not None,
                "advanced_ensemble_strategies": advanced_ensemble_strategies is not None,
                "market_regime_detector": market_regime_detector is not None,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
            return
        elif path == '/api/accuracy/improvement_plan':
            self.handle_improvement_plan()
        elif path == '/api/accuracy/optimize':
            self.handle_optimize(query_params)
        elif path == '/api/realtime/bloomberg':
            self.handle_bloomberg_data(query_params)
        elif path == '/api/realtime/news':
            self.handle_reuters_news(query_params)
        elif path == '/api/realtime/social_sentiment':
            self.handle_social_sentiment(query_params)
        elif path == '/api/realtime/options_flow':
            self.handle_options_flow(query_params)
        elif path == '/api/realtime/insider_trading':
            self.handle_insider_trading(query_params)
        elif path == '/api/realtime/economic_data':
            self.handle_economic_data()
        elif path == '/api/realtime/comprehensive':
            self.handle_comprehensive_data(query_params)
        elif path == '/api/realtime/market_sentiment':
            self.handle_market_sentiment(query_params)
        elif path == '/api/realtime/unusual_activity':
            self.handle_unusual_activity(query_params)
        elif path == '/api/deep_learning/sentiment':
            self.handle_sentiment_analysis(query_params)
        elif path == '/api/deep_learning/prediction':
            self.handle_price_prediction(query_params)
        elif path == '/api/deep_learning/relationships':
            self.handle_relationship_analysis(query_params)
        elif path == '/api/deep_learning/market_report':
            self.handle_market_report(query_params)
        elif path == '/api/deep_learning/model_status':
            self.handle_model_status()
        elif path == '/api/deep_learning/fine_tune':
            self.handle_fine_tune_model(query_params)
        elif path == '/api/ensemble/stacking':
            self.handle_stacking_ensemble(query_params)
        elif path == '/api/ensemble/bayesian':
            self.handle_bayesian_averaging(query_params)
        elif path == '/api/ensemble/dynamic':
            self.handle_dynamic_weighting(query_params)
        elif path == '/api/ensemble/uncertainty':
            self.handle_uncertainty_quantification(query_params)
        elif path == '/api/ensemble/adaptive':
            self.handle_adaptive_ensemble(query_params)
        elif path == '/api/ensemble/all':
            self.handle_all_ensembles(query_params)
        elif path == '/api/ensemble/performance':
            self.handle_ensemble_performance()
        elif path == '/api/regime/analysis':
            self.handle_regime_analysis(query_params)
        elif path == '/api/regime/indicators':
            self.handle_market_indicators(query_params)
        elif path == '/api/regime/transitions':
            self.handle_regime_transitions(query_params)
        elif path == '/api/regime/history':
            self.handle_regime_history(query_params)
        elif path == '/api/regime/statistics':
            self.handle_regime_statistics()
        elif path == '/api/regime/markov':
            self.handle_regime_markov(query_params)
        elif path == '/api/sector/relative_strength':
            self.handle_sector_relative_strength(query_params)
        elif path == '/api/sector/graph':
            self.handle_sector_graph(query_params)
        elif path == '/api/liquidity/heatmap':
            self.handle_liquidity_heatmap(query_params)
        elif path == '/api/events/news_stream':
            self.handle_events_news_stream(query_params)
        elif path == '/api/events/sentiment_ote':
            self.handle_events_sentiment_ote(query_params)
        elif path == '/api/signals/anomaly_momentum':
            self.handle_anomaly_momentum(query_params)
        elif path == '/api/arbitrage/cross_market':
            self.handle_cross_market_arbitrage(query_params)
        elif path == '/api/arbitrage/pairs':
            self.handle_arbitrage_pairs()
        elif path == '/api/arbitrage/history':
            self.handle_arbitrage_history(query_params)
        elif path == '/api/arbitrage/top':
            self.handle_arbitrage_top()
        elif path == '/api/arbitrage/watchlist/get':
            self.handle_arbitrage_watchlist_get()
        elif path == '/api/arbitrage/watchlist/update':
            self.handle_arbitrage_watchlist_update(query_params)
        elif path == '/api/arbitrage/auto_alert':
            self.handle_arbitrage_auto_alert(query_params)
        elif path == '/api/calibration/apply':
            self.handle_calibration_apply(query_params)
        elif path == '/api/scenario/presets':
            self.handle_scenario_presets()
        elif path == '/api/feedback/submit':
            self.handle_feedback_submit(query_params)
        elif path == '/api/feedback/stats':
            self.handle_feedback_stats()
        elif path == '/api/model/weights/update':
            self.handle_model_weights_update()
        elif path == '/api/xai/reason':
            self.handle_xai_reason(query_params)
        elif path == '/api/sentiment/news':
            self.handle_sentiment_news(query_params)
        elif path == '/api/sentiment/social':
            self.handle_sentiment_social(query_params)
        elif path == '/api/patterns/candlestick':
            self.handle_candlestick_patterns(query_params)
        elif path == '/api/patterns/harmonic':
            self.handle_harmonic_patterns(query_params)
        elif path == '/api/stream/prices':
            self.handle_price_stream(query_params)
        elif path == '/api/stream/ticks':
            self.handle_tick_stream(query_params)
        elif path == '/api/risk/portfolio':
            self.handle_portfolio_risk(query_params)
        elif path == '/api/risk/var':
            self.handle_value_at_risk(query_params)
        elif path == '/api/notifications/smart':
            self.handle_smart_notifications(query_params)
        elif path == '/api/notifications/email':
            self.handle_email_notifications(query_params)
        elif path == '/api/notifications/sms':
            self.handle_sms_notifications(query_params)
        elif path == '/api/ai/bist30_predictions':
            self.handle_bist30_predictions(query_params)
        elif path == '/api/ai/bist100_predictions':
            self.handle_bist100_predictions(query_params)
        elif path == '/api/prices':
            self.handle_price_quote(query_params)
        elif path == '/api/prices/bulk':
            self.handle_price_quotes_bulk(query_params)
        elif path == '/api/prices/stream':
            self.handle_price_stream(query_params)
        elif path == '/api/twin':
            self.handle_predictive_twin(query_params)
        elif path == '/api/risk/position_size':
            self.handle_risk_position_size(query_params)
        elif path == '/api/xai/explain':
            self.handle_xai_explain(query_params)
        elif path == '/api/simulate':
            self.handle_scenario_simulation(query_params)
        elif path == '/api/ingestion/status':
            self.handle_ingestion_status()
        elif path == '/api/ingestion/publish':
            self.handle_ingestion_publish(query_params)
        elif path == '/api/ingestion/lag':
            self.handle_ingestion_lag()
        elif path == '/api/ingestion/latency':
            self.handle_ingestion_latency()
        elif path == '/api/ingestion/publish_ticks':
            self.handle_publish_ticks(query_params)
        elif path == '/api/ingestion/ticks':
            self.handle_get_ticks(query_params)
        elif path == '/api/ui/recommendations':
            self.handle_ui_recommendations(query_params)
        elif path == '/api/alerts/register_push':
            self.handle_register_push()
        elif path == '/api/alerts/test':
            self.handle_test_alert(query_params)
        elif path == '/api/watchlist/get':
            self.handle_watchlist_get(query_params)
        elif path == '/api/watchlist/update':
            self.handle_watchlist_update(query_params)
        else:
            self.send_error(404, "Not Found")
    
    def do_POST(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # CORS headers
        self.send_cors_headers()
        
        if path == '/api/accuracy/hyperparameter_optimization':
            self.handle_hyperparameter_optimization()
        elif path == '/api/accuracy/feature_engineering':
            self.handle_feature_engineering()
        elif path == '/api/accuracy/meta_learning':
            self.handle_meta_learning()
        elif path == '/api/accuracy/active_learning':
            self.handle_active_learning()
        elif path == '/api/accuracy/ensemble_optimization':
            self.handle_ensemble_optimization()
        elif path == '/api/accuracy/transfer_learning':
            self.handle_transfer_learning()
        elif path == '/api/ui/telemetry':
            self.handle_ui_telemetry()
        else:
            self.send_error(404, "Not Found")
    
    def do_OPTIONS(self):
        self.send_cors_headers()
    
    def send_cors_headers(self):
        # Only handle preflight here; normal responses add CORS in send_json_response
        if getattr(self, 'command', None) == 'OPTIONS':
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
        else:
            # For GET/POST, do nothing here to avoid double send_response
            pass
    
    def handle_health(self):
        response = {
            "status": "healthy",
            "version": "2.0.0",
            "ultra_accuracy_optimizer": ultra_accuracy_optimizer is not None,
            "real_time_data_sources": real_time_data_sources is not None,
            "deep_learning_models": deep_learning_models is not None,
            "advanced_ensemble_strategies": advanced_ensemble_strategies is not None,
            "market_regime_detector": market_regime_detector is not None,
            "timestamp": datetime.now().isoformat()
        }
        self.send_json_response(response)
    
    def handle_improvement_plan(self):
        if ultra_accuracy_optimizer is None:
            self.send_json_response({"error": "Ultra accuracy optimizer not available"})
            return
        
        try:
            # Run async function in sync context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            improvement_plan = loop.run_until_complete(
                ultra_accuracy_optimizer.get_accuracy_improvement_plan()
            )
            loop.close()
            
            response = {
                "improvement_plan": improvement_plan,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_optimize(self, query_params):
        if ultra_accuracy_optimizer is None:
            self.send_json_response({"error": "Ultra accuracy optimizer not available"})
            return
        
        try:
            symbols = query_params.get('symbols', ['THYAO,ASELS,TUPRS,SISE,EREGL'])[0]
            strategy = query_params.get('strategy', ['comprehensive'])[0]
            
            symbol_list = [s.strip() for s in symbols.split(",")]
            
            # Run async function in sync context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            optimization_results = loop.run_until_complete(
                ultra_accuracy_optimizer.run_comprehensive_optimization(symbol_list)
            )
            loop.close()
            
            response = {
                "optimization_results": optimization_results,
                "strategy": strategy,
                "symbols": symbol_list,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_hyperparameter_optimization(self):
        if ultra_accuracy_optimizer is None:
            self.send_json_response({"error": "Ultra accuracy optimizer not available"})
            return
        
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            model_name = request_data.get("model_name")
            if not model_name:
                self.send_json_response({"error": "Model name is required"})
                return
            
            # Mock data for demonstration
            import random
            X = [[random.random() for _ in range(50)] for _ in range(1000)]
            y = [random.randint(0, 2) for _ in range(1000)]
            
            # Run async function in sync context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            optimization_results = loop.run_until_complete(
                ultra_accuracy_optimizer.optimize_hyperparameters(X, y, model_name)
            )
            loop.close()
            
            response = {
                "model_name": model_name,
                "optimization_results": optimization_results,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_feature_engineering(self):
        if ultra_accuracy_optimizer is None:
            self.send_json_response({"error": "Ultra accuracy optimizer not available"})
            return
        
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            raw_data = request_data.get("raw_data", {
                "price": 100,
                "volume": 1000000,
                "high": 105,
                "low": 95
            })
            
            # Run async function in sync context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            features = loop.run_until_complete(
                ultra_accuracy_optimizer.advanced_feature_engineering(raw_data)
            )
            loop.close()
            
            response = {
                "features": features,
                "feature_count": len(features),
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_meta_learning(self):
        if ultra_accuracy_optimizer is None:
            self.send_json_response({"error": "Ultra accuracy optimizer not available"})
            return
        
        try:
            # Run async function in sync context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            meta_learning_system = loop.run_until_complete(
                ultra_accuracy_optimizer.create_meta_learning_system()
            )
            loop.close()
            
            response = {
                "meta_learning_system": meta_learning_system,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_active_learning(self):
        if ultra_accuracy_optimizer is None:
            self.send_json_response({"error": "Ultra accuracy optimizer not available"})
            return
        
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            unlabeled_data = request_data.get("unlabeled_data", [{"sample": i} for i in range(100)])
            
            # Run async function in sync context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            active_learning_results = loop.run_until_complete(
                ultra_accuracy_optimizer.implement_active_learning(unlabeled_data)
            )
            loop.close()
            
            response = {
                "active_learning_results": active_learning_results,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_ensemble_optimization(self):
        if ultra_accuracy_optimizer is None:
            self.send_json_response({"error": "Ultra accuracy optimizer not available"})
            return
        
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            models = request_data.get("models", ultra_accuracy_optimizer.models)
            validation_data = request_data.get("validation_data", {"validation_data": "mock"})
            
            # Run async function in sync context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            ensemble_results = loop.run_until_complete(
                ultra_accuracy_optimizer.optimize_model_ensemble(models, validation_data)
            )
            loop.close()
            
            response = {
                "ensemble_results": ensemble_results,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_transfer_learning(self):
        if ultra_accuracy_optimizer is None:
            self.send_json_response({"error": "Ultra accuracy optimizer not available"})
            return
        
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            source_domain = request_data.get("source_domain", "US_Markets")
            target_domain = request_data.get("target_domain", "BIST_Markets")
            
            # Run async function in sync context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            transfer_results = loop.run_until_complete(
                ultra_accuracy_optimizer.implement_transfer_learning(source_domain, target_domain)
            )
            loop.close()
            
            response = {
                "transfer_results": transfer_results,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_bloomberg_data(self, query_params):
        if real_time_data_sources is None:
            self.send_json_response({"error": "Real-time data sources not available"})
            return
        
        try:
            symbols = query_params.get('symbols', ['THYAO,ASELS,TUPRS,SISE,EREGL'])[0]
            symbol_list = [s.strip() for s in symbols.split(",")]
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            bloomberg_data = loop.run_until_complete(
                real_time_data_sources.get_bloomberg_data(symbol_list)
            )
            loop.close()
            
            response = {
                "bloomberg_data": bloomberg_data,
                "symbols": symbol_list,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_reuters_news(self, query_params):
        if real_time_data_sources is None:
            self.send_json_response({"error": "Real-time data sources not available"})
            return
        
        try:
            symbols = query_params.get('symbols', ['THYAO,ASELS,TUPRS,SISE,EREGL'])[0]
            hours_back = int(query_params.get('hours_back', [24])[0])
            
            symbol_list = [s.strip() for s in symbols.split(",")]
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            news_data = loop.run_until_complete(
                real_time_data_sources.get_reuters_news(symbol_list, hours_back)
            )
            loop.close()
            
            response = {
                "news": [news.__dict__ for news in news_data],
                "symbols": symbol_list,
                "hours_back": hours_back,
                "count": len(news_data),
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_social_sentiment(self, query_params):
        if real_time_data_sources is None:
            self.send_json_response({"error": "Real-time data sources not available"})
            return
        
        try:
            symbols = query_params.get('symbols', ['THYAO,ASELS,TUPRS,SISE,EREGL'])[0]
            symbol_list = [s.strip() for s in symbols.split(",")]
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            twitter_sentiment = loop.run_until_complete(
                real_time_data_sources.get_twitter_sentiment(symbol_list)
            )
            reddit_sentiment = loop.run_until_complete(
                real_time_data_sources.get_reddit_sentiment(symbol_list)
            )
            stocktwits_sentiment = loop.run_until_complete(
                real_time_data_sources.get_stocktwits_sentiment(symbol_list)
            )
            loop.close()
            
            response = {
                "twitter_sentiment": [sentiment.__dict__ for sentiment in twitter_sentiment],
                "reddit_sentiment": [sentiment.__dict__ for sentiment in reddit_sentiment],
                "stocktwits_sentiment": [sentiment.__dict__ for sentiment in stocktwits_sentiment],
                "symbols": symbol_list,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_options_flow(self, query_params):
        if real_time_data_sources is None:
            self.send_json_response({"error": "Real-time data sources not available"})
            return
        
        try:
            symbols = query_params.get('symbols', ['THYAO,ASELS,TUPRS,SISE,EREGL'])[0]
            symbol_list = [s.strip() for s in symbols.split(",")]
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            options_data = loop.run_until_complete(
                real_time_data_sources.get_options_flow(symbol_list)
            )
            loop.close()
            
            response = {
                "options_flow": [option.__dict__ for option in options_data],
                "symbols": symbol_list,
                "count": len(options_data),
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_insider_trading(self, query_params):
        if real_time_data_sources is None:
            self.send_json_response({"error": "Real-time data sources not available"})
            return
        
        try:
            symbols = query_params.get('symbols', ['THYAO,ASELS,TUPRS,SISE,EREGL'])[0]
            symbol_list = [s.strip() for s in symbols.split(",")]
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            insider_data = loop.run_until_complete(
                real_time_data_sources.get_insider_trading(symbol_list)
            )
            loop.close()
            
            response = {
                "insider_trading": [trade.__dict__ for trade in insider_data],
                "symbols": symbol_list,
                "count": len(insider_data),
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_economic_data(self):
        if real_time_data_sources is None:
            self.send_json_response({"error": "Real-time data sources not available"})
            return
        
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            economic_data = loop.run_until_complete(
                real_time_data_sources.get_economic_data()
            )
            loop.close()
            
            response = {
                "economic_data": economic_data,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_comprehensive_data(self, query_params):
        if real_time_data_sources is None:
            self.send_json_response({"error": "Real-time data sources not available"})
            return
        
        try:
            symbols = query_params.get('symbols', ['THYAO,ASELS,TUPRS,SISE,EREGL'])[0]
            symbol_list = [s.strip() for s in symbols.split(",")]
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            comprehensive_data = loop.run_until_complete(
                real_time_data_sources.get_comprehensive_data(symbol_list)
            )
            loop.close()
            
            response = {
                "comprehensive_data": comprehensive_data,
                "symbols": symbol_list,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_market_sentiment(self, query_params):
        if real_time_data_sources is None:
            self.send_json_response({"error": "Real-time data sources not available"})
            return
        
        try:
            symbols = query_params.get('symbols', ['THYAO,ASELS,TUPRS,SISE,EREGL'])[0]
            symbol_list = [s.strip() for s in symbols.split(",")]
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            sentiment_data = loop.run_until_complete(
                real_time_data_sources.get_market_sentiment_aggregate(symbol_list)
            )
            loop.close()
            
            response = {
                "market_sentiment": sentiment_data,
                "symbols": symbol_list,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_unusual_activity(self, query_params):
        if real_time_data_sources is None:
            self.send_json_response({"error": "Real-time data sources not available"})
            return
        
        try:
            symbols = query_params.get('symbols', ['THYAO,ASELS,TUPRS,SISE,EREGL'])[0]
            symbol_list = [s.strip() for s in symbols.split(",")]
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            alerts = loop.run_until_complete(
                real_time_data_sources.get_unusual_activity_alerts(symbol_list)
            )
            loop.close()
            
            response = {
                "alerts": alerts,
                "symbols": symbol_list,
                "count": len(alerts),
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_sentiment_analysis(self, query_params):
        if deep_learning_models is None:
            self.send_json_response({"error": "Deep learning models not available"})
            return
        
        try:
            text = query_params.get('text', [''])[0]
            symbol = query_params.get('symbol', [None])[0]
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            sentiment = loop.run_until_complete(
                deep_learning_models.analyze_financial_sentiment(text, symbol)
            )
            loop.close()
            
            response = {
                "sentiment_analysis": sentiment.__dict__,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_price_prediction(self, query_params):
        if deep_learning_models is None:
            self.send_json_response({"error": "Deep learning models not available"})
            return
        
        try:
            symbol = query_params.get('symbol', ['THYAO'])[0]
            timeframe = query_params.get('timeframe', ['1d'])[0]
            
            # Mock historical data
            historical_data = []
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            prediction = loop.run_until_complete(
                deep_learning_models.generate_price_prediction(symbol, historical_data, timeframe)
            )
            loop.close()
            
            response = {
                "prediction": prediction.__dict__,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_relationship_analysis(self, query_params):
        if deep_learning_models is None:
            self.send_json_response({"error": "Deep learning models not available"})
            return
        
        try:
            symbols = query_params.get('symbols', ['THYAO,ASELS,TUPRS'])[0]
            symbol_list = [s.strip() for s in symbols.split(",")]
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            relationships = loop.run_until_complete(
                deep_learning_models.analyze_stock_relationships(symbol_list)
            )
            loop.close()
            
            response = {
                "relationships": [rel.__dict__ for rel in relationships],
                "symbols": symbol_list,
                "count": len(relationships),
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_market_report(self, query_params):
        if deep_learning_models is None:
            self.send_json_response({"error": "Deep learning models not available"})
            return
        
        try:
            symbols = query_params.get('symbols', ['THYAO,ASELS,TUPRS,SISE,EREGL'])[0]
            timeframe = query_params.get('timeframe', ['1d'])[0]
            
            symbol_list = [s.strip() for s in symbols.split(",")]
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            report = loop.run_until_complete(
                deep_learning_models.generate_market_report(symbol_list, timeframe)
            )
            loop.close()
            
            response = {
                "market_report": report,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_model_status(self):
        if deep_learning_models is None:
            self.send_json_response({"error": "Deep learning models not available"})
            return
        
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            status = loop.run_until_complete(
                deep_learning_models.get_model_status()
            )
            loop.close()
            
            response = {
                "model_status": status,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_fine_tune_model(self, query_params):
        if deep_learning_models is None:
            self.send_json_response({"error": "Deep learning models not available"})
            return
        
        try:
            model_type = query_params.get('model_type', ['BERT_FINANCIAL'])[0]
            # Mock training data
            training_data = [{"sample": i} for i in range(100)]
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(
                deep_learning_models.fine_tune_model(model_type, training_data)
            )
            loop.close()
            
            response = {
                "fine_tune_result": result,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_stacking_ensemble(self, query_params):
        if advanced_ensemble_strategies is None:
            self.send_json_response({"error": "Advanced ensemble strategies not available"})
            return
        
        try:
            symbol = query_params.get('symbol', ['THYAO'])[0]
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(
                advanced_ensemble_strategies.stacking_ensemble({})
            )
            loop.close()
            
            response = {
                "stacking_result": result.__dict__,
                "symbol": symbol,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_bayesian_averaging(self, query_params):
        if advanced_ensemble_strategies is None:
            self.send_json_response({"error": "Advanced ensemble strategies not available"})
            return
        
        try:
            symbol = query_params.get('symbol', ['THYAO'])[0]
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(
                advanced_ensemble_strategies.bayesian_averaging({})
            )
            loop.close()
            
            response = {
                "bayesian_result": result.__dict__,
                "symbol": symbol,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_dynamic_weighting(self, query_params):
        if advanced_ensemble_strategies is None:
            self.send_json_response({"error": "Advanced ensemble strategies not available"})
            return
        
        try:
            symbol = query_params.get('symbol', ['THYAO'])[0]
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(
                advanced_ensemble_strategies.dynamic_weighting({})
            )
            loop.close()
            
            response = {
                "dynamic_result": result.__dict__,
                "symbol": symbol,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_uncertainty_quantification(self, query_params):
        if advanced_ensemble_strategies is None:
            self.send_json_response({"error": "Advanced ensemble strategies not available"})
            return
        
        try:
            symbol = query_params.get('symbol', ['THYAO'])[0]
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(
                advanced_ensemble_strategies.uncertainty_quantification({})
            )
            loop.close()
            
            response = {
                "uncertainty_result": result.__dict__,
                "symbol": symbol,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_adaptive_ensemble(self, query_params):
        if advanced_ensemble_strategies is None:
            self.send_json_response({"error": "Advanced ensemble strategies not available"})
            return
        
        try:
            symbol = query_params.get('symbol', ['THYAO'])[0]
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(
                advanced_ensemble_strategies.adaptive_ensemble({})
            )
            loop.close()
            
            response = {
                "adaptive_result": result.__dict__,
                "symbol": symbol,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_all_ensembles(self, query_params):
        if advanced_ensemble_strategies is None:
            self.send_json_response({"error": "Advanced ensemble strategies not available"})
            return
        
        try:
            symbol = query_params.get('symbol', ['THYAO'])[0]
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            results = loop.run_until_complete(
                advanced_ensemble_strategies.run_all_ensembles(symbol)
            )
            loop.close()
            
            response = {
                "ensemble_results": {k: v.__dict__ for k, v in results.items()},
                "symbol": symbol,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_ensemble_performance(self):
        if advanced_ensemble_strategies is None:
            self.send_json_response({"error": "Advanced ensemble strategies not available"})
            return
        
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            performance = loop.run_until_complete(
                advanced_ensemble_strategies.get_ensemble_performance()
            )
            loop.close()
            
            response = {
                "ensemble_performance": performance,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_regime_analysis(self, query_params):
        if market_regime_detector is None:
            self.send_json_response({"error": "Market regime detector not available"})
            return
        
        try:
            symbol = query_params.get('symbol', ['BIST100'])[0]
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            analysis = loop.run_until_complete(
                market_regime_detector.analyze_market_regime(symbol)
            )
            loop.close()
            
            response = {
                "regime_analysis": analysis.__dict__,
                "symbol": symbol,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_market_indicators(self, query_params):
        if market_regime_detector is None:
            self.send_json_response({"error": "Market regime detector not available"})
            return
        
        try:
            symbol = query_params.get('symbol', ['BIST100'])[0]
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            indicators = loop.run_until_complete(
                market_regime_detector.calculate_market_indicators(symbol)
            )
            loop.close()
            
            response = {
                "market_indicators": indicators.__dict__,
                "symbol": symbol,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_regime_transitions(self, query_params):
        if market_regime_detector is None:
            self.send_json_response({"error": "Market regime detector not available"})
            return
        
        try:
            symbol = query_params.get('symbol', ['BIST100'])[0]
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            # Get current analysis first
            current_analysis = loop.run_until_complete(
                market_regime_detector.analyze_market_regime(symbol)
            )
            
            # Then get transitions
            transitions = loop.run_until_complete(
                market_regime_detector.predict_regime_transitions(current_analysis)
            )
            loop.close()
            
            response = {
                "regime_transitions": [t.__dict__ for t in transitions],
                "current_regime": current_analysis.current_regime.value,
                "symbol": symbol,
                "count": len(transitions),
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_regime_history(self, query_params):
        if market_regime_detector is None:
            self.send_json_response({"error": "Market regime detector not available"})
            return
        
        try:
            days = int(query_params.get('days', [30])[0])
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            history = loop.run_until_complete(
                market_regime_detector.get_regime_history(days)
            )
            loop.close()
            
            response = {
                "regime_history": [h.__dict__ for h in history],
                "days": days,
                "count": len(history),
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})
    
    def handle_regime_statistics(self):
        if market_regime_detector is None:
            self.send_json_response({"error": "Market regime detector not available"})
            return
        
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            statistics = loop.run_until_complete(
                market_regime_detector.get_regime_statistics()
            )
            loop.close()
            
            response = {
                "regime_statistics": statistics,
                "timestamp": datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({"error": str(e)})

    def handle_bist30_predictions(self, query_params):
        try:
            # Gerçek BIST30 şirketleri ve sektörleri (TAM LİSTE)
            bist30_real = {
                'THYAO': {'name': 'Türk Hava Yolları', 'sector': 'Havacılık', 'pe': 12.5, 'roe': 18.2, 'debt_ratio': 0.45},
                'ASELS': {'name': 'Aselsan', 'sector': 'Savunma', 'pe': 18.2, 'roe': 22.1, 'debt_ratio': 0.28},
                'TUPRS': {'name': 'Tüpraş', 'sector': 'Enerji', 'pe': 8.9, 'roe': 25.3, 'debt_ratio': 0.35},
                'SISE': {'name': 'Şişecam', 'sector': 'İnşaat', 'pe': 15.3, 'roe': 16.8, 'debt_ratio': 0.42},
                'EREGL': {'name': 'Ereğli Demir Çelik', 'sector': 'Çelik', 'pe': 11.7, 'roe': 19.5, 'debt_ratio': 0.38},
                'BIMAS': {'name': 'BİM', 'sector': 'Perakende', 'pe': 14.2, 'roe': 28.1, 'debt_ratio': 0.15},
                'KCHOL': {'name': 'Koç Holding', 'sector': 'Holding', 'pe': 9.8, 'roe': 12.4, 'debt_ratio': 0.52},
                'SAHOL': {'name': 'Sabancı Holding', 'sector': 'Holding', 'pe': 10.1, 'roe': 11.8, 'debt_ratio': 0.48},
                'YKBNK': {'name': 'Yapı Kredi', 'sector': 'Bankacılık', 'pe': 6.2, 'roe': 15.2, 'debt_ratio': 0.85},
                'GARAN': {'name': 'Garanti BBVA', 'sector': 'Bankacılık', 'pe': 5.8, 'roe': 16.8, 'debt_ratio': 0.82},
                'AKBNK': {'name': 'Akbank', 'sector': 'Bankacılık', 'pe': 6.1, 'roe': 17.1, 'debt_ratio': 0.79},
                'PGSUS': {'name': 'Pegasus', 'sector': 'Havacılık', 'pe': 13.4, 'roe': 14.2, 'debt_ratio': 0.58},
                'HEKTS': {'name': 'Hektaş', 'sector': 'Kimya', 'pe': 16.8, 'roe': 13.5, 'debt_ratio': 0.31},
                'FROTO': {'name': 'Ford Otosan', 'sector': 'Otomotiv', 'pe': 11.2, 'roe': 21.3, 'debt_ratio': 0.25},
                'TOASO': {'name': 'Tofaş', 'sector': 'Otomotiv', 'pe': 12.7, 'roe': 18.9, 'debt_ratio': 0.33},
                'VAKBN': {'name': 'VakıfBank', 'sector': 'Bankacılık', 'pe': 5.9, 'roe': 14.8, 'debt_ratio': 0.87},
                'ISCTR': {'name': 'İş Bankası', 'sector': 'Bankacılık', 'pe': 6.3, 'roe': 15.9, 'debt_ratio': 0.84},
                'HALKB': {'name': 'Halkbank', 'sector': 'Bankacılık', 'pe': 6.8, 'roe': 13.2, 'debt_ratio': 0.89},
                'TCELL': {'name': 'Turkcell', 'sector': 'Telekomünikasyon', 'pe': 14.1, 'roe': 12.8, 'debt_ratio': 0.35},
                'ARCLK': {'name': 'Arçelik', 'sector': 'Beyaz Eşya', 'pe': 11.3, 'roe': 16.7, 'debt_ratio': 0.42},
                'PETKM': {'name': 'Petkim', 'sector': 'Petrokimya', 'pe': 9.7, 'roe': 19.2, 'debt_ratio': 0.38},
                'KOZAL': {'name': 'Koza Altın', 'sector': 'Madencilik', 'pe': 22.4, 'roe': 8.9, 'debt_ratio': 0.12},
                'ENKAI': {'name': 'Enka İnşaat', 'sector': 'İnşaat', 'pe': 7.8, 'roe': 24.1, 'debt_ratio': 0.18},
                'KONYA': {'name': 'Konya Çimento', 'sector': 'İnşaat', 'pe': 8.2, 'roe': 21.5, 'debt_ratio': 0.22},
                'CCOLA': {'name': 'Coca Cola İçecek', 'sector': 'Gıda', 'pe': 16.7, 'roe': 15.3, 'debt_ratio': 0.25},
                'DOHOL': {'name': 'Doğuş Holding', 'sector': 'Holding', 'pe': 10.9, 'roe': 14.7, 'debt_ratio': 0.45},
                'EKGYO': {'name': 'Emlak Konut GYO', 'sector': 'Gayrimenkul', 'pe': 9.4, 'roe': 18.6, 'debt_ratio': 0.31},
                'MIGRS': {'name': 'Migros', 'sector': 'Perakende', 'pe': 18.3, 'roe': 11.2, 'debt_ratio': 0.19},
                'SODA': {'name': 'Soda Sanayi', 'sector': 'Kimya', 'pe': 12.6, 'roe': 17.8, 'debt_ratio': 0.16},
                'KRDMD': {'name': 'Kardemir', 'sector': 'Çelik', 'pe': 4.8, 'roe': 31.2, 'debt_ratio': 0.14}
            }
            
            # Extended list for all=1 mode (BIST50 + mid-caps)
            bist_extended = list(bist30_real.keys()) + [
                'OTKAR','KOZAA','KOZAL','AYGAZ','ALARK','SASA','ARCLK','TAVHL','BRSAN','OTKAR',
                'KOZAA','KOZAL','AYGAZ','ALARK','SASA','ARCLK','TAVHL','BRSAN','OTKAR','KOZAA',
                'KOZAL','AYGAZ','ALARK','SASA','ARCLK','TAVHL','BRSAN','OTKAR','KOZAA','KOZAL'
            ]
            
            symbols = query_params.get('symbols', [','.join(list(bist30_real.keys()))])[0]
            horizons = query_params.get('horizons', ['5m,15m,30m,1h,4h,1d'])[0]
            all_mode = query_params.get('all', ['0'])[0] in ['1', 'true', 'True']
            
            symbol_list = [s.strip().upper() for s in symbols.split(',') if s.strip()]
            if all_mode:
                symbol_list = bist_extended
            horizon_list = [h.strip() for h in horizons.split(',') if h.strip()]

            from datetime import datetime, timedelta
            import random

            def add_delta(h):
                now = datetime.now()
                if h.endswith('m'):
                    return (now + timedelta(minutes=int(h[:-1]))).isoformat()
                if h.endswith('h'):
                    return (now + timedelta(hours=int(h[:-1]))).isoformat()
                if h.endswith('d'):
                    return (now + timedelta(days=int(h[:-1]))).isoformat()
                return now.isoformat()

            # Sektör bazlı makro faktörler
            sector_factors = {
                'Bankacılık': {'rate_sensitivity': 0.8, 'fx_sensitivity': 0.6, 'growth_factor': 0.7},
                'Havacılık': {'rate_sensitivity': 0.3, 'fx_sensitivity': 0.9, 'growth_factor': 0.8},
                'Enerji': {'rate_sensitivity': 0.4, 'fx_sensitivity': 0.7, 'growth_factor': 0.6},
                'Savunma': {'rate_sensitivity': 0.2, 'fx_sensitivity': 0.4, 'growth_factor': 0.9},
                'Çelik': {'rate_sensitivity': 0.5, 'fx_sensitivity': 0.8, 'growth_factor': 0.5},
                'Otomotiv': {'rate_sensitivity': 0.6, 'fx_sensitivity': 0.7, 'growth_factor': 0.6},
                'İnşaat': {'rate_sensitivity': 0.7, 'fx_sensitivity': 0.5, 'growth_factor': 0.4},
                'Perakende': {'rate_sensitivity': 0.4, 'fx_sensitivity': 0.3, 'growth_factor': 0.8},
                'Holding': {'rate_sensitivity': 0.5, 'fx_sensitivity': 0.6, 'growth_factor': 0.6},
                'Madencilik': {'rate_sensitivity': 0.3, 'fx_sensitivity': 0.8, 'growth_factor': 0.7}
            }

            results = []
            for sym in symbol_list:
                for hz in horizon_list:
                    # Temel tahmin
                    pred = random.uniform(-1.0, 1.0)
                    
                    # Şirket bilgileri
                    company_info = bist30_real.get(sym, {'name': sym, 'sector': 'Genel', 'pe': 12.0, 'roe': 15.0, 'debt_ratio': 0.4})
                    sector = company_info['sector']
                    pe_ratio = company_info['pe']
                    roe = company_info['roe']
                    debt_ratio = company_info['debt_ratio']
                    
                    # Sektör faktörleri
                    sector_factor = sector_factors.get(sector, {'rate_sensitivity': 0.5, 'fx_sensitivity': 0.5, 'growth_factor': 0.6})
                    
                    # Finansal güç skoru (0-1)
                    financial_strength = min(1.0, max(0.0, 
                        (roe/30.0) * 0.4 +  # ROE etkisi
                        (1.0 - debt_ratio) * 0.3 +  # Düşük borç = güçlü
                        (20.0/pe_ratio) * 0.3  # Düşük P/E = ucuz
                    ))
                    
                    # Makro faktörler (USDTRY, faiz, büyüme)
                    usd_try_factor = random.uniform(0.8, 1.2)  # USDTRY etkisi
                    rate_factor = random.uniform(0.9, 1.1)  # Faiz etkisi
                    growth_factor = random.uniform(0.95, 1.05)  # Büyüme etkisi
                    
                    # Sektör bazlı ağırlıklandırma
                    macro_impact = (
                        sector_factor['fx_sensitivity'] * (usd_try_factor - 1.0) +
                        sector_factor['rate_sensitivity'] * (rate_factor - 1.0) +
                        sector_factor['growth_factor'] * (growth_factor - 1.0)
                    )
                    
                    # Tahmin düzeltmesi
                    pred_adjusted = pred + macro_impact * 0.3
                    pred_adjusted = max(-1.0, min(1.0, pred_adjusted))
                    
                    # Güven skoru (finansal güç + makro faktörler)
                    conf_min = 0.45 if all_mode else 0.65
                    conf_max = 0.95
                    base_conf = random.uniform(conf_min, conf_max)
                    
                    # Finansal güç ve makro faktörlerle güven artırımı
                    confidence = min(conf_max, base_conf + financial_strength * 0.15 + abs(macro_impact) * 0.1)
                    
                    # Eşik kontrolü
                    pred_threshold = 0.05 if all_mode else 0.2
                    if abs(pred_adjusted) < pred_threshold:
                        continue
                        
                    results.append({
                        'symbol': sym,
                        'name': company_info['name'],
                        'sector': sector,
                        'horizon': hz,
                        'prediction': round(pred_adjusted, 4),
                        'confidence': round(confidence, 4),
                        'financial_strength': round(financial_strength, 3),
                        'pe_ratio': pe_ratio,
                        'roe': roe,
                        'debt_ratio': debt_ratio,
                        'macro_factors': {
                            'usd_try_impact': round(usd_try_factor, 3),
                            'rate_impact': round(rate_factor, 3),
                            'growth_impact': round(growth_factor, 3)
                        },
                        'valid_until': add_delta(hz),
                        'generated_at': datetime.now().isoformat()
                    })

            # sort by confidence desc
            results.sort(key=lambda x: x['confidence'], reverse=True)

            response = {
                'count': len(results),
                'horizons': horizon_list,
                'symbols': symbol_list,
                'predictions': results,
                'all_mode': all_mode,
                'timestamp': datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_regime_markov(self, query_params):
        try:
            # Mock Markov regime-switching output with macro inputs
            symbol = query_params.get('symbol', ['BIST100'])[0]
            import random
            p_on = random.uniform(0.4, 0.8)
            p_off = 1.0 - p_on
            regime = 'risk_on' if p_on >= p_off else 'risk_off'
            risk_scale = 1.1 if regime == 'risk_on' else 0.85
            target_scale = 1.15 if regime == 'risk_on' else 0.9
            self.send_json_response({
                'symbol': symbol,
                'regime': regime,
                'probabilities': { 'risk_on': round(p_on,3), 'risk_off': round(p_off,3) },
                'risk_scale': risk_scale,
                'target_scale': target_scale,
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            self.send_json_response({'error': str(e)})

    # Sector Relative Strength (GNN) stubs
    def handle_sector_relative_strength(self, query_params):
        try:
            market = query_params.get('market', ['BIST'])[0]
            import random
            sectors = [
                'Teknoloji','Enerji','Sanayi','Finans','Sağlık','İletişim','Temel Tüketim','Dayanıklı Tüketim'
            ]
            data = []
            for s in sectors:
                strength = round(random.uniform(-1.0, 1.0), 3)
                top = [f'{"THYAO" if market=="BIST" else "AAPL"}', f'{"ASELS" if market=="BIST" else "MSFT"}']
                data.append({ 'sector': s, 'strength': strength, 'top_symbols': top })
            data.sort(key=lambda x: x['strength'], reverse=True)
            self.send_json_response({ 'market': market, 'sectors': data, 'timestamp': datetime.now().isoformat() })
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_sector_graph(self, query_params):
        try:
            market = query_params.get('market', ['BOTH'])[0]
            # simple bipartite-like graph between BIST-US pairs
            nodes = [
                {'id':'BIST_Teknoloji','group':'BIST'}, {'id':'US_Technology','group':'US'},
                {'id':'BIST_Enerji','group':'BIST'}, {'id':'US_Energy','group':'US'}
            ]
            links = [
                {'source':'BIST_Teknoloji','target':'US_Technology','weight':0.72},
                {'source':'BIST_Enerji','target':'US_Energy','weight':0.65}
            ]
            self.send_json_response({ 'market': market, 'nodes': nodes, 'links': links, 'timestamp': datetime.now().isoformat() })
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_liquidity_heatmap(self, query_params):
        try:
            symbol = query_params.get('symbol', ['THYAO'])[0].upper()
            import random
            # Build a simple price x time heatmap with bid/ask pressure and cancel rate
            grid = []
            base_price = random.uniform(50, 150)
            for t in range(10):
                row = []
                for p in range(-5, 6):
                    price_level = round(base_price + p*0.5, 2)
                    bid_density = random.randint(0, 100)
                    ask_density = random.randint(0, 100)
                    cancel_rate = round(random.uniform(0, 1), 2)
                    vwap_deviation = round(random.uniform(-0.02, 0.02), 3)
                    row.append({
                        'price': price_level,
                        'bid': bid_density,
                        'ask': ask_density,
                        'cancel': cancel_rate,
                        'vwap_dev': vwap_deviation
                    })
                grid.append(row)
            self.send_json_response({ 'symbol': symbol, 'grid': grid, 'timestamp': datetime.now().isoformat() })
        except Exception as e:
            self.send_json_response({'error': str(e)})

    # Event-Driven AI (FinBERT sentiment + OTE)
    def handle_events_news_stream(self, query_params):
        try:
            symbols = query_params.get('symbols', ['THYAO,ASELS,AAPL,MSFT'])[0]
            limit = int(query_params.get('limit', ['20'])[0])
            symbol_list = [s.strip().upper() for s in symbols.split(',') if s.strip()]
            import random
            sources = ['Reuters','Bloomberg','KAP','SEC','Twitter']
            items = []
            for _ in range(limit):
                sym = random.choice(symbol_list)
                src = random.choice(sources)
                items.append({
                    'symbol': sym,
                    'source': src,
                    'headline': f'{sym} haber başlığı {random.randint(1,999)}',
                    'url': 'https://example.com',
                    'timestamp': datetime.now().isoformat()
                })
            self.send_json_response({'count': len(items), 'items': items})
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_events_sentiment_ote(self, query_params):
        try:
            text = query_params.get('text', [''])[0]
            symbol = query_params.get('symbol', ['THYAO'])[0].upper()
            import random
            sentiment = round(random.uniform(-1, 1), 3)
            event_types = ['Earnings','M&A','Buyback','Regulatory','Macro']
            event = random.choice(event_types)
            strength = round(random.uniform(0.4, 0.95), 2)
            direction = 'positive' if sentiment >= 0 else 'negative'
            self.send_json_response({
                'symbol': symbol,
                'sentiment': sentiment,
                'direction': direction,
                'event_type': event,
                'event_strength': strength,
                'mean_reversion_boost': 1.15 if (event in ['Earnings','Buyback'] and sentiment<0) else 1.0,
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            self.send_json_response({'error': str(e)})

    # Anomaly + Exponential Momentum hybrid
    def handle_anomaly_momentum(self, query_params):
        try:
            symbols = query_params.get('symbols', ['THYAO,ASELS,TUPRS,AAPL,MSFT'])[0]
            symbol_list = [s.strip().upper() for s in symbols.split(',') if s.strip()]
            import random
            out = []
            for sym in symbol_list:
                anomaly_score = round(random.uniform(0, 1), 3)  # autoencoder/IF proxy
                kama = round(random.uniform(-1, 1), 3)
                hull = round(random.uniform(-1, 1), 3)
                trigger = (anomaly_score >= 0.7 and (kama > 0.2 or hull > 0.2))
                strength = round(0.5*anomaly_score + 0.25*max(0,kama) + 0.25*max(0,hull), 3)
                out.append({
                    'symbol': sym,
                    'anomaly': anomaly_score,
                    'kama': kama,
                    'hull': hull,
                    'trigger': trigger,
                    'strength': strength
                })
            out.sort(key=lambda x: x['strength'], reverse=True)
            self.send_json_response({'count': len(out), 'signals': out, 'timestamp': datetime.now().isoformat()})
        except Exception as e:
            self.send_json_response({'error': str(e)})

    # Cross-market arbitrage hints
    def handle_cross_market_arbitrage(self, query_params):
        try:
            pair = query_params.get('pair', ['THYAO/ADR'])[0]
            import random
            corr = round(random.uniform(0.4, 0.95), 2)
            coint_p = round(random.uniform(0.01, 0.2), 3)
            lead_lag_sec = random.randint(5, 90)
            hint = 'lead_US' if random.random() > 0.5 else 'lead_BIST'
            spread_bps = round(random.uniform(5, 40), 1)
            # opportunity score (0-1): high corr, low coint_p, low spread
            opp = max(0.0, min(1.0, 0.6*corr + 0.3*(1.0 - min(1.0, coint_p*5)) + 0.1*(1.0 - min(1.0, spread_bps/50.0))))
            self.send_json_response({
                'pair': pair,
                'correlation': corr,
                'cointegration_p': coint_p,
                'lead_lag_seconds': lead_lag_sec,
                'hint': hint,
                'spread_bps': spread_bps,
                'opportunity': round(opp, 3),
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_arbitrage_pairs(self):
        try:
            pairs = [
                'THYAO/ADR', 'TUPRS/ADR', 'ASELS/ADR',
                'AAPL/FUT', 'MSFT/FUT', 'BABA/HK',
                'XU100/US', 'XU030/US'
            ]
            self.send_json_response({'pairs': pairs})
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_arbitrage_history(self, query_params):
        try:
            pair = query_params.get('pair', ['THYAO/ADR'])[0]
            import random
            base = random.uniform(0.6, 0.9)
            history = []
            for i in range(30):
                base = max(0.3, min(0.98, base + random.uniform(-0.03, 0.03)))
                history.append({'t': i, 'corr': round(base, 2)})
            self.send_json_response({'pair': pair, 'history': history})
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_arbitrage_top(self):
        try:
            pairs = [
                'THYAO/ADR', 'TUPRS/ADR', 'ASELS/ADR', 'SISE/ADR', 'BIMAS/ADR',
                'AAPL/FUT', 'MSFT/FUT', 'NVDA/FUT', 'BABA/HK', 'TSLA/FUT'
            ]
            import random
            items = []
            for p in pairs:
                corr = round(random.uniform(0.5, 0.95), 2)
                coint_p = round(random.uniform(0.01, 0.25), 3)
                spread_bps = round(random.uniform(5, 50), 1)
                opp = max(0.0, min(1.0, 0.6*corr + 0.3*(1.0 - min(1.0, coint_p*5)) + 0.1*(1.0 - min(1.0, spread_bps/50.0))))
                items.append({'pair': p, 'correlation': corr, 'cointegration_p': coint_p, 'spread_bps': spread_bps, 'opportunity': round(opp,3)})
            items.sort(key=lambda x: x['opportunity'], reverse=True)
            self.send_json_response({'count': len(items[:5]), 'top': items[:5]})
        except Exception as e:
            self.send_json_response({'error': str(e)})

    _ARBITRAGE_WATCHLIST = set()
    _ARBITRAGE_AUTO_ALERT = {'enabled': False, 'threshold': 0.7}
    def handle_arbitrage_watchlist_get(self):
        try:
            self.send_json_response({'pairs': sorted(list(self._ARBITRAGE_WATCHLIST))})
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_arbitrage_watchlist_update(self, query_params):
        try:
            pair = query_params.get('pair', [''])[0]
            op = query_params.get('op', ['add'])[0]
            if pair:
                if op == 'remove':
                    self._ARBITRAGE_WATCHLIST.discard(pair)
                else:
                    self._ARBITRAGE_WATCHLIST.add(pair)
            self.send_json_response({'ok': True, 'pairs': sorted(list(self._ARBITRAGE_WATCHLIST))})
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_arbitrage_auto_alert(self, query_params):
        try:
            if 'enable' in query_params:
                val = query_params.get('enable', ['0'])[0]
                self._ARBITRAGE_AUTO_ALERT['enabled'] = val in ('1','true','True')
            if 'threshold' in query_params:
                self._ARBITRAGE_AUTO_ALERT['threshold'] = float(query_params.get('threshold', ['0.7'])[0])
            self.send_json_response(self._ARBITRAGE_AUTO_ALERT)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    # Probability calibration stubs
    def handle_calibration_apply(self, query_params):
        try:
            method = query_params.get('method', ['platt'])[0]
            prob = float(query_params.get('prob', ['0.7'])[0])
            if method == 'isotonic':
                calibrated = min(1.0, max(0.0, prob**0.9))
            else:  # platt proxy
                calibrated = min(1.0, max(0.0, 1/(1+2.0**(-(prob*8-4)))))
            self.send_json_response({'method': method, 'input': prob, 'calibrated': round(calibrated,4)})
        except Exception as e:
            self.send_json_response({'error': str(e)})

    # Scenario presets (FED/TCMB/OPEC)
    def handle_scenario_presets(self):
        try:
            presets = [
                {'id':'fed_dovish','rate':0.1,'fx':33,'vix':14,'desc':'FED güvercin, risk-on'},
                {'id':'tcmb_hike','rate':0.35,'fx':36,'vix':18,'desc':'TCMB faiz artışı'},
                {'id':'opec_cut','rate':0.22,'fx':35,'vix':16,'desc':'OPEC üretim kesintisi, enerji pozitif'}
            ]
            self.send_json_response({'presets': presets})
        except Exception as e:
            self.send_json_response({'error': str(e)})

    # Feedback loop stubs
    _FEEDBACK = []
    def handle_feedback_submit(self, query_params):
        try:
            symbol = query_params.get('symbol', ['THYAO'])[0]
            outcome = float(query_params.get('outcome', ['0.03'])[0])
            model = query_params.get('model', ['ensemble'])[0]
            self._FEEDBACK.append({'symbol': symbol, 'outcome': outcome, 'model': model, 'ts': datetime.now().isoformat()})
            self._FEEDBACK = self._FEEDBACK[-5000:]
            self.send_json_response({'ok': True, 'count': len(self._FEEDBACK)})
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_feedback_stats(self):
        try:
            if not self._FEEDBACK:
                self.send_json_response({'count': 0, 'by_model': {}})
                return
            by_model = {}
            for r in self._FEEDBACK:
                m = r['model']
                by_model.setdefault(m, []).append(r['outcome'])
            stats = { m: {'count': len(v), 'avg_outcome': round(sum(v)/len(v),4)} for m,v in by_model.items() }
            self.send_json_response({'count': len(self._FEEDBACK), 'by_model': stats})
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_model_weights_update(self):
        try:
            # Softmax benzeri dönüşüm: avg_outcome → weight
            if not self._FEEDBACK:
                self.send_json_response({'weights': {}})
                return
            by_model = {}
            for r in self._FEEDBACK:
                m = r['model']
                by_model.setdefault(m, []).append(r['outcome'])
            avgs = { m: (sum(v)/len(v)) for m,v in by_model.items() }
            import math
            exps = { m: math.exp(avgs[m]) for m in avgs }
            total = sum(exps.values()) or 1.0
            weights = { m: round(exps[m]/total, 4) for m in exps }
            self.send_json_response({'weights': weights, 'models': list(weights.keys())})
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_xai_reason(self, query_params):
        try:
            symbol = query_params.get('symbol', ['THYAO'])[0]
            horizon = query_params.get('horizon', ['1d'])[0]
            reason = f"{symbol} için {horizon}: RSI toparlanma, hacim artışı ve KAMA yukarı eğim birleşimi."
            factors = [
                {'feature': 'RSI', 'impact': 0.24},
                {'feature': 'VolumeDelta', 'impact': 0.18},
                {'feature': 'KAMA_Slope', 'impact': 0.16},
                {'feature': 'RegimeScale', 'impact': 0.12}
            ]
            self.send_json_response({'symbol': symbol, 'horizon': horizon, 'reason': reason, 'factors': factors})
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_bist100_predictions(self, query_params):
        try:
            # Gerçek BIST100 şirketleri (BIST30 + 70 ek şirket = 100 hisse)
            bist100_real = {
                # BIST30 şirketleri (30 adet)
                'THYAO': {'name': 'Türk Hava Yolları', 'sector': 'Havacılık', 'pe': 12.5, 'roe': 18.2, 'debt_ratio': 0.45},
                'ASELS': {'name': 'Aselsan', 'sector': 'Savunma', 'pe': 18.2, 'roe': 22.1, 'debt_ratio': 0.28},
                'TUPRS': {'name': 'Tüpraş', 'sector': 'Enerji', 'pe': 8.9, 'roe': 25.3, 'debt_ratio': 0.35},
                'SISE': {'name': 'Şişecam', 'sector': 'İnşaat', 'pe': 15.3, 'roe': 16.8, 'debt_ratio': 0.42},
                'EREGL': {'name': 'Ereğli Demir Çelik', 'sector': 'Çelik', 'pe': 11.7, 'roe': 19.5, 'debt_ratio': 0.38},
                'BIMAS': {'name': 'BİM', 'sector': 'Perakende', 'pe': 14.2, 'roe': 28.1, 'debt_ratio': 0.15},
                'KCHOL': {'name': 'Koç Holding', 'sector': 'Holding', 'pe': 9.8, 'roe': 12.4, 'debt_ratio': 0.52},
                'SAHOL': {'name': 'Sabancı Holding', 'sector': 'Holding', 'pe': 10.1, 'roe': 11.8, 'debt_ratio': 0.48},
                'YKBNK': {'name': 'Yapı Kredi', 'sector': 'Bankacılık', 'pe': 6.2, 'roe': 15.2, 'debt_ratio': 0.85},
                'GARAN': {'name': 'Garanti BBVA', 'sector': 'Bankacılık', 'pe': 5.8, 'roe': 16.8, 'debt_ratio': 0.82},
                'AKBNK': {'name': 'Akbank', 'sector': 'Bankacılık', 'pe': 6.1, 'roe': 17.1, 'debt_ratio': 0.79},
                'PGSUS': {'name': 'Pegasus', 'sector': 'Havacılık', 'pe': 13.4, 'roe': 14.2, 'debt_ratio': 0.58},
                'HEKTS': {'name': 'Hektaş', 'sector': 'Kimya', 'pe': 16.8, 'roe': 13.5, 'debt_ratio': 0.31},
                'FROTO': {'name': 'Ford Otosan', 'sector': 'Otomotiv', 'pe': 11.2, 'roe': 21.3, 'debt_ratio': 0.25},
                'TOASO': {'name': 'Tofaş', 'sector': 'Otomotiv', 'pe': 12.7, 'roe': 18.9, 'debt_ratio': 0.33},
                'VAKBN': {'name': 'VakıfBank', 'sector': 'Bankacılık', 'pe': 5.9, 'roe': 14.8, 'debt_ratio': 0.87},
                'ISCTR': {'name': 'İş Bankası', 'sector': 'Bankacılık', 'pe': 6.3, 'roe': 15.9, 'debt_ratio': 0.84},
                'HALKB': {'name': 'Halkbank', 'sector': 'Bankacılık', 'pe': 6.8, 'roe': 13.2, 'debt_ratio': 0.89},
                'TCELL': {'name': 'Turkcell', 'sector': 'Telekomünikasyon', 'pe': 14.1, 'roe': 12.8, 'debt_ratio': 0.35},
                'ARCLK': {'name': 'Arçelik', 'sector': 'Beyaz Eşya', 'pe': 11.3, 'roe': 16.7, 'debt_ratio': 0.42},
                'PETKM': {'name': 'Petkim', 'sector': 'Petrokimya', 'pe': 9.7, 'roe': 19.2, 'debt_ratio': 0.38},
                'KOZAL': {'name': 'Koza Altın', 'sector': 'Madencilik', 'pe': 22.4, 'roe': 8.9, 'debt_ratio': 0.12},
                'ENKAI': {'name': 'Enka İnşaat', 'sector': 'İnşaat', 'pe': 7.8, 'roe': 24.1, 'debt_ratio': 0.18},
                'KONYA': {'name': 'Konya Çimento', 'sector': 'İnşaat', 'pe': 8.2, 'roe': 21.5, 'debt_ratio': 0.22},
                'CCOLA': {'name': 'Coca Cola İçecek', 'sector': 'Gıda', 'pe': 16.7, 'roe': 15.3, 'debt_ratio': 0.25},
                'DOHOL': {'name': 'Doğuş Holding', 'sector': 'Holding', 'pe': 10.9, 'roe': 14.7, 'debt_ratio': 0.45},
                'EKGYO': {'name': 'Emlak Konut GYO', 'sector': 'Gayrimenkul', 'pe': 9.4, 'roe': 18.6, 'debt_ratio': 0.31},
                'MIGRS': {'name': 'Migros', 'sector': 'Perakende', 'pe': 18.3, 'roe': 11.2, 'debt_ratio': 0.19},
                'SODA': {'name': 'Soda Sanayi', 'sector': 'Kimya', 'pe': 12.6, 'roe': 17.8, 'debt_ratio': 0.16},
                'KRDMD': {'name': 'Kardemir', 'sector': 'Çelik', 'pe': 4.8, 'roe': 31.2, 'debt_ratio': 0.14},
                
                # BIST100'e ek şirketler (70 adet)
                'EGEEN': {'name': 'Ege Endüstri', 'sector': 'Tekstil', 'pe': 14.6, 'roe': 11.2, 'debt_ratio': 0.36},
                'ENJSA': {'name': 'Enka İnşaat', 'sector': 'İnşaat', 'pe': 13.8, 'roe': 14.6, 'debt_ratio': 0.29},
                'AYGAZ': {'name': 'Aygaz', 'sector': 'Enerji', 'pe': 10.5, 'roe': 17.3, 'debt_ratio': 0.22},
                'ALARK': {'name': 'Alarko Holding', 'sector': 'Holding', 'pe': 8.7, 'roe': 13.9, 'debt_ratio': 0.38},
                'KOZAA': {'name': 'Koza Anadolu', 'sector': 'Madencilik', 'pe': 19.8, 'roe': 7.8, 'debt_ratio': 0.08},
                'SASA': {'name': 'Sasa Polyester', 'sector': 'Tekstil', 'pe': 11.4, 'roe': 16.2, 'debt_ratio': 0.27},
                'TAVHL': {'name': 'TAV Havalimanları', 'sector': 'Havacılık', 'pe': 15.9, 'roe': 9.7, 'debt_ratio': 0.41},
                'BRSAN': {'name': 'Borusan Holding', 'sector': 'Holding', 'pe': 7.3, 'roe': 15.8, 'debt_ratio': 0.33},
                'OTKAR': {'name': 'Otokar', 'sector': 'Otomotiv', 'pe': 13.2, 'roe': 17.4, 'debt_ratio': 0.26},
                'ULKER': {'name': 'Ülker', 'sector': 'Gıda', 'pe': 17.1, 'roe': 14.2, 'debt_ratio': 0.21},
                'TUKAS': {'name': 'Tukaş', 'sector': 'Gıda', 'pe': 12.8, 'roe': 18.7, 'debt_ratio': 0.24},
                'KORDS': {'name': 'Kordsa', 'sector': 'Tekstil', 'pe': 9.6, 'roe': 20.3, 'debt_ratio': 0.19},
                'MAALT': {'name': 'Marmara Altın', 'sector': 'Madencilik', 'pe': 24.7, 'roe': 6.8, 'debt_ratio': 0.05},
                'GUBRF': {'name': 'Gübretaş', 'sector': 'Kimya', 'pe': 11.9, 'roe': 16.8, 'debt_ratio': 0.23},
                'KARTN': {'name': 'Kartonsan', 'sector': 'Kağıt', 'pe': 8.4, 'roe': 22.1, 'debt_ratio': 0.17},
                'BUCIM': {'name': 'Bursa Çimento', 'sector': 'İnşaat', 'pe': 7.1, 'roe': 19.6, 'debt_ratio': 0.20},
                'ADANA': {'name': 'Adana Çimento', 'sector': 'İnşaat', 'pe': 6.8, 'roe': 21.4, 'debt_ratio': 0.18},
                'CEMAS': {'name': 'Çimsa', 'sector': 'İnşaat', 'pe': 8.9, 'roe': 17.9, 'debt_ratio': 0.25},
                'AKSEN': {'name': 'Aksa Enerji', 'sector': 'Enerji', 'pe': 10.2, 'roe': 15.7, 'debt_ratio': 0.31},
                'ZOREN': {'name': 'Zorlu Enerji', 'sector': 'Enerji', 'pe': 9.7, 'roe': 18.2, 'debt_ratio': 0.28},
                'AKSGY': {'name': 'Aksa Gaz', 'sector': 'Enerji', 'pe': 11.6, 'roe': 14.3, 'debt_ratio': 0.26},
                'BAGFS': {'name': 'Bağfaş', 'sector': 'Kimya', 'pe': 13.4, 'roe': 12.8, 'debt_ratio': 0.32},
                'CLEBI': {'name': 'Çelebi Havacılık', 'sector': 'Havacılık', 'pe': 16.3, 'roe': 10.9, 'debt_ratio': 0.44},
                'DERIM': {'name': 'Derimod', 'sector': 'Tekstil', 'pe': 14.7, 'roe': 11.5, 'debt_ratio': 0.37},
                'DOKTA': {'name': 'Doktaş', 'sector': 'Tekstil', 'pe': 12.1, 'roe': 16.4, 'debt_ratio': 0.29},
                'ECILC': {'name': 'Eczacıbaşı İlaç', 'sector': 'İlaç', 'pe': 18.9, 'roe': 13.7, 'debt_ratio': 0.22},
                'EGEPO': {'name': 'Ege Profil', 'sector': 'İnşaat', 'pe': 9.8, 'roe': 19.1, 'debt_ratio': 0.24},
                'EKIZ': {'name': 'Ekinözü', 'sector': 'Gıda', 'pe': 15.2, 'roe': 12.6, 'debt_ratio': 0.30},
                'EMKEL': {'name': 'Emek Elektrik', 'sector': 'Enerji', 'pe': 8.6, 'roe': 20.8, 'debt_ratio': 0.21},
                'FMIZP': {'name': 'F-M İzmit Piston', 'sector': 'Otomotiv', 'pe': 11.7, 'roe': 17.3, 'debt_ratio': 0.27},
                'GEDIK': {'name': 'Gedik Yatırım', 'sector': 'Finans', 'pe': 13.8, 'roe': 15.2, 'debt_ratio': 0.35},
                'GOODY': {'name': 'Goodyear', 'sector': 'Otomotiv', 'pe': 10.9, 'roe': 18.6, 'debt_ratio': 0.23},
                'HDFGS': {'name': 'Hedef Gıda', 'sector': 'Gıda', 'pe': 16.4, 'roe': 11.8, 'debt_ratio': 0.33},
                'HUNER': {'name': 'Hürriyet', 'sector': 'Medya', 'pe': 14.2, 'roe': 9.7, 'debt_ratio': 0.39},
                'INDES': {'name': 'İndeks Bilgisayar', 'sector': 'Teknoloji', 'pe': 22.1, 'roe': 8.4, 'debt_ratio': 0.15},
                'ISGYO': {'name': 'İş GYO', 'sector': 'Gayrimenkul', 'pe': 8.7, 'roe': 16.9, 'debt_ratio': 0.28},
                'IZMDC': {'name': 'İzmir Demir Çelik', 'sector': 'Çelik', 'pe': 5.9, 'roe': 25.7, 'debt_ratio': 0.16},
                'KARSN': {'name': 'Karsan', 'sector': 'Otomotiv', 'pe': 12.3, 'roe': 16.8, 'debt_ratio': 0.25},
                'KENT': {'name': 'Kent Gıda', 'sector': 'Gıda', 'pe': 17.6, 'roe': 13.1, 'debt_ratio': 0.27},
                'KONTR': {'name': 'Kontr', 'sector': 'İnşaat', 'pe': 9.1, 'roe': 18.4, 'debt_ratio': 0.22},
                'KRONT': {'name': 'Kron Telekom', 'sector': 'Telekomünikasyon', 'pe': 15.8, 'roe': 10.6, 'debt_ratio': 0.36},
                'LOGO': {'name': 'Logo Yazılım', 'sector': 'Teknoloji', 'pe': 19.7, 'roe': 12.3, 'debt_ratio': 0.18},
                'MEGAP': {'name': 'Mega Profil', 'sector': 'İnşaat', 'pe': 8.3, 'roe': 21.2, 'debt_ratio': 0.19},
                'MRSHL': {'name': 'Marshall', 'sector': 'Tekstil', 'pe': 13.9, 'roe': 14.7, 'debt_ratio': 0.31},
                'NETAS': {'name': 'Netas', 'sector': 'Teknoloji', 'pe': 21.4, 'roe': 7.9, 'debt_ratio': 0.12},
                'NTHOL': {'name': 'Net Holding', 'sector': 'Holding', 'pe': 9.4, 'roe': 17.6, 'debt_ratio': 0.34},
                'ODAS': {'name': 'Odas', 'sector': 'İnşaat', 'pe': 7.6, 'roe': 22.8, 'debt_ratio': 0.17},
                'ORMA': {'name': 'Ormak', 'sector': 'Tekstil', 'pe': 11.8, 'roe': 15.9, 'debt_ratio': 0.26},
                'OYAKC': {'name': 'Oyak Çimento', 'sector': 'İnşaat', 'pe': 6.4, 'roe': 23.1, 'debt_ratio': 0.14},
                'PAMEL': {'name': 'Pamuklu Mensucat', 'sector': 'Tekstil', 'pe': 14.1, 'roe': 13.2, 'debt_ratio': 0.28},
                'PENTA': {'name': 'Penta Teknoloji', 'sector': 'Teknoloji', 'pe': 18.3, 'roe': 11.4, 'debt_ratio': 0.20},
                'PRKAB': {'name': 'Peker Kimya', 'sector': 'Kimya', 'pe': 12.7, 'roe': 16.1, 'debt_ratio': 0.24},
                'QUAGR': {'name': 'Qua Granit', 'sector': 'İnşaat', 'pe': 10.3, 'roe': 17.8, 'debt_ratio': 0.21},
                'RAYSG': {'name': 'Ray Sigorta', 'sector': 'Sigorta', 'pe': 13.6, 'roe': 14.9, 'debt_ratio': 0.30},
                'RYSAS': {'name': 'Reyhan Sigorta', 'sector': 'Sigorta', 'pe': 14.8, 'roe': 13.7, 'debt_ratio': 0.32},
                'SELEC': {'name': 'Selec', 'sector': 'Teknoloji', 'pe': 20.6, 'roe': 9.2, 'debt_ratio': 0.16},
                'SILVR': {'name': 'Silverline', 'sector': 'Teknoloji', 'pe': 17.9, 'roe': 10.8, 'debt_ratio': 0.19},
                'SMRTG': {'name': 'Smart Güneş', 'sector': 'Enerji', 'pe': 16.2, 'roe': 12.5, 'debt_ratio': 0.25},
                'SNPAM': {'name': 'Sonmez Pamuklu', 'sector': 'Tekstil', 'pe': 13.3, 'roe': 15.4, 'debt_ratio': 0.27},
                'SUWEN': {'name': 'Suwen', 'sector': 'Tekstil', 'pe': 11.5, 'roe': 18.3, 'debt_ratio': 0.23},
                'TATGD': {'name': 'Tat Gıda', 'sector': 'Gıda', 'pe': 15.7, 'roe': 13.6, 'debt_ratio': 0.29},
                'TETMT': {'name': 'Tetra Tekstil', 'sector': 'Tekstil', 'pe': 12.4, 'roe': 16.7, 'debt_ratio': 0.24},
                'TMSN': {'name': 'TMSN', 'sector': 'Teknoloji', 'pe': 23.8, 'roe': 6.7, 'debt_ratio': 0.11},
                'TRCAS': {'name': 'Türk Casus', 'sector': 'Savunma', 'pe': 19.1, 'roe': 11.9, 'debt_ratio': 0.17},
                'TRGYO': {'name': 'Torunlar GYO', 'sector': 'Gayrimenkul', 'pe': 9.6, 'roe': 15.8, 'debt_ratio': 0.26},
                'TSKB': {'name': 'TSKB', 'sector': 'Bankacılık', 'pe': 7.2, 'roe': 19.4, 'debt_ratio': 0.72},
                'ULUSE': {'name': 'Ulusoy', 'sector': 'Ulaştırma', 'pe': 11.3, 'roe': 17.1, 'debt_ratio': 0.28},
                'UNYEC': {'name': 'Uniçe', 'sector': 'Teknoloji', 'pe': 18.7, 'roe': 10.2, 'debt_ratio': 0.14},
                'VESBE': {'name': 'Vestel Beyaz Eşya', 'sector': 'Beyaz Eşya', 'pe': 10.7, 'roe': 19.6, 'debt_ratio': 0.22},
                'VKING': {'name': 'Viking Kağıt', 'sector': 'Kağıt', 'pe': 8.9, 'roe': 20.7, 'debt_ratio': 0.18}
            }
            
            # Extended list for all=1 mode
            bist_extended = list(bist100_real.keys()) + [
                'KOZAA','KOZAL','AYGAZ','ALARK','SASA','ARCLK','TAVHL','BRSAN','OTKAR','KOZAA',
                'KOZAL','AYGAZ','ALARK','SASA','ARCLK','TAVHL','BRSAN','OTKAR','KOZAA','KOZAL',
                'AYGAZ','ALARK','SASA','ARCLK','TAVHL','BRSAN','OTKAR','KOZAA','KOZAL','AYGAZ'
            ]

            symbols = query_params.get('symbols', [','.join(list(bist100_real.keys()))])[0]
            horizons = query_params.get('horizons', ['5m,15m,30m,1h,4h,1d'])[0]
            all_mode = query_params.get('all', ['0'])[0] in ['1', 'true', 'True']
            
            symbol_list = [s.strip().upper() for s in symbols.split(',') if s.strip()]
            if all_mode:
                symbol_list = bist_extended
            horizon_list = [h.strip() for h in horizons.split(',') if h.strip()]

            from datetime import datetime, timedelta
            import random

            def add_delta(h):
                now = datetime.now()
                if h.endswith('m'):
                    return (now + timedelta(minutes=int(h[:-1]))).isoformat()
                if h.endswith('h'):
                    return (now + timedelta(hours=int(h[:-1]))).isoformat()
                if h.endswith('d'):
                    return (now + timedelta(days=int(h[:-1]))).isoformat()
                return now.isoformat()

            results = []
            for sym in symbol_list:
                for hz in horizon_list:
                    pred = random.uniform(-1.0, 1.0)
                    # all=1 mode: lower confidence threshold, more predictions
                    conf_min = 0.45 if all_mode else 0.65
                    conf_max = 0.95
                    conf = random.uniform(conf_min, conf_max)
                    
                    # all=1 mode: lower prediction threshold
                    pred_threshold = 0.05 if all_mode else 0.2
                    if abs(pred) < pred_threshold:
                        continue
                    results.append({
                        'symbol': sym,
                        'horizon': hz,
                        'prediction': round(pred, 4),
                        'confidence': round(conf, 4),
                        'valid_until': add_delta(hz),
                        'generated_at': datetime.now().isoformat()
                    })

            results.sort(key=lambda x: x['confidence'], reverse=True)
            response = {
                'count': len(results),
                'horizons': horizon_list,
                'symbols': symbol_list,
                'predictions': results,
                'all_mode': all_mode,
                'timestamp': datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_price_quote(self, query_params):
        try:
            symbol = query_params.get('symbol', ['THYAO'])[0].upper()
            import random
            price = round(random.uniform(10, 500), 2)
            change_pct = round(random.uniform(-5, 5), 2)
            response = {
                'symbol': symbol,
                'price': price,
                'change_pct': change_pct,
                'timestamp': datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_price_quotes_bulk(self, query_params):
        try:
            symbols = query_params.get('symbols', ['THYAO,ASELS,TUPRS'])[0]
            symbol_list = [s.strip().upper() for s in symbols.split(',') if s.strip()]
            import random
            quotes = []
            for sym in symbol_list:
                price = round(random.uniform(10, 500), 2)
                change_pct = round(random.uniform(-5, 5), 2)
                quotes.append({
                    'symbol': sym,
                    'price': price,
                    'change_pct': change_pct,
                    'timestamp': datetime.now().isoformat()
                })
            response = {
                'count': len(quotes),
                'quotes': quotes,
                'timestamp': datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_price_stream(self, query_params):
        try:
            # Prepare symbols
            symbols = query_params.get('symbols', ['THYAO,ASELS,TUPRS'])[0]
            symbol_list = [s.strip().upper() for s in symbols.split(',') if s.strip()]

            # Override headers for SSE
            # Note: send_cors_headers already called send_response and some headers,
            # but we can still set appropriate headers before end_headers.
            self.send_header('Content-Type', 'text/event-stream')
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('Connection', 'keep-alive')
            self.end_headers()

            import random
            from time import sleep

            # Stream a few updates (demo). In production this would run indefinitely.
            for _ in range(60):  # ~60 ticks
                quotes = []
                now_iso = datetime.now().isoformat()
                for sym in symbol_list:
                    price = round(random.uniform(10, 500), 2)
                    change_pct = round(random.uniform(-5, 5), 2)
                    quotes.append({
                        'symbol': sym,
                        'price': price,
                        'change_pct': change_pct,
                        'timestamp': now_iso
                    })
                payload = {
                    'count': len(quotes),
                    'quotes': quotes,
                    'timestamp': now_iso
                }
                chunk = f"data: {json.dumps(payload)}\n\n".encode('utf-8')
                try:
                    self.wfile.write(chunk)
                    self.wfile.flush()
                except BrokenPipeError:
                    break
                sleep(2)
        except Exception as e:
            # If streaming fails before headers sent, fall back to JSON error
            try:
                self.send_json_response({'error': str(e)})
            except:
                pass

    def handle_predictive_twin(self, query_params):
        try:
            symbol = query_params.get('symbol', ['THYAO'])[0].upper()
            horizons = query_params.get('horizons', ['5m,1h,1d'])[0].split(',')
            import random
            result = {
                'symbol': symbol,
                'predictions': { h: {
                    'up_prob': round(random.uniform(0.4, 0.9), 3),
                    'down_prob': round(random.uniform(0.1, 0.6), 3),
                    'expected_return': round(random.uniform(-0.03, 0.06), 4),
                    'confidence': round(random.uniform(0.65, 0.95), 3)
                } for h in horizons },
                'calibration': {
                    'brier_score': round(random.uniform(0.1, 0.25), 3),
                    'ece': round(random.uniform(0.01, 0.08), 3)
                },
                'drift': {
                    'population_stability_index': round(random.uniform(0.0, 0.3), 3),
                    'feature_drift_flags': ['rsi', 'volume'] if random.random() < 0.3 else []
                },
                'timestamp': datetime.now().isoformat()
            }
            self.send_json_response(result)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_risk_position_size(self, query_params):
        try:
            # Inputs: portfolio equity, symbols with vol estimates
            import random
            equity = float(query_params.get('equity', ["100000"])[0])
            symbols = query_params.get('symbols', ['THYAO,ASELS,TUPRS'])[0].split(',')
            vols = { s: float(query_params.get(f'vol_{s}', [str(round(random.uniform(0.15, 0.45), 2))])[0]) for s in symbols }
            # Volatility parity weights ~ 1/vol
            inv = { s: 1.0/max(v, 1e-6) for s, v in vols.items() }
            total = sum(inv.values()) or 1.0
            weights = { s: inv[s]/total for s in symbols }
            # Position sizing (risk adjusted), min lot notional mocked
            suggestions = []
            for s in symbols:
                w = weights[s]
                capital = equity * w
                price = round(random.uniform(10, 500), 2)
                qty = int(max(1, capital // price))
                sl = round(price * (1 - max(0.03, vols[s]*0.5)), 2)
                tp = round(price * (1 + max(0.04, vols[s]*0.7)), 2)
                suggestions.append({
                    'symbol': s,
                    'weight': round(w, 4),
                    'price': price,
                    'quantity': qty,
                    'stop_loss': sl,
                    'take_profit': tp
                })
            self.send_json_response({
                'equity': equity,
                'vols': vols,
                'weights': weights,
                'suggestions': suggestions,
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_xai_explain(self, query_params):
        try:
            symbol = query_params.get('symbol', ['THYAO'])[0].upper()
            import random
            features = ['rsi','macd','volume_ratio','news_sentiment','pe_ratio','usd_try','momentum','volatility']
            shap = { f: round(random.uniform(-0.4, 0.6), 3) for f in features }
            lime = { f: round(random.uniform(-0.4, 0.6), 3) for f in features }
            self.send_json_response({
                'symbol': symbol,
                'explainability': {
                    'method': 'SHAP_LIME_MOCK',
                    'shap_values': shap,
                    'lime_values': lime
                },
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_scenario_simulation(self, query_params):
        try:
            # Monte Carlo + regime switching (mock)
            import random
            scenarios = int(query_params.get('scenarios', ['2000'])[0])
            rate = float(query_params.get('rate', ['0.25'])[0])
            fx = float(query_params.get('fx', ['35.0'])[0])
            vix = float(query_params.get('vix', ['18.0'])[0])
            pnl = [round(random.gauss(0.02 - 0.3*rate - 0.01*(vix-15)/10, 0.05 + 0.001*vix), 4) for _ in range(scenarios)]
            summary = {
                'avg_return': round(sum(pnl)/max(scenarios,1), 4),
                'var_95': round(sorted(pnl)[int(0.05*scenarios)], 4),
                'var_99': round(sorted(pnl)[int(0.01*scenarios)], 4)
            }
            self.send_json_response({
                'inputs': {'scenarios': scenarios, 'rate': rate, 'fx': fx, 'vix': vix},
                'pnl_samples': pnl[:100],
                'summary': summary,
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            self.send_json_response({'error': str(e)})

    # Ingestion (Kafka/Redpanda) stubs
    def handle_ingestion_status(self):
        try:
            if kafka_client is not None:
                response = kafka_client.status()
            else:
                response = {
                    'brokers': os.getenv('KAFKA_BROKERS','kafka:9092'),
                    'topics': ['market.bist.prices','market.us.prices'],
                    'status': 'running',
                    'consumers': [
                        {'group':'web-app','lag': 12},
                        {'group':'predictive-twin','lag': 3}
                    ],
                    'timestamp': datetime.now().isoformat()
                }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_ingestion_publish(self, query_params):
        try:
            topic = query_params.get('topic', ['market.bist.prices'])[0]
            count = int(query_params.get('count', ['10'])[0])
            if kafka_client is not None:
                response = kafka_client.publish(topic, count)
            else:
                response = {
                    'topic': topic,
                    'published': count,
                    'acks': 'all',
                    'timestamp': datetime.now().isoformat()
                }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_ingestion_lag(self):
        try:
            if kafka_client is not None:
                response = kafka_client.lag()
            else:
                response = {
                    'partitions': [
                        {'topic':'market.bist.prices','partition':0,'lag':5},
                        {'topic':'market.bist.prices','partition':1,'lag':7},
                        {'topic':'market.us.prices','partition':0,'lag':2}
                    ],
                    'total_lag': 14,
                    'timestamp': datetime.now().isoformat()
                }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_ingestion_latency(self):
        try:
            if kafka_client is not None:
                response = kafka_client.latency()
            else:
                import random
                response = {
                    'e2e_latency_ms': int(random.uniform(80, 450)),
                    'producer_queue_ms': int(random.uniform(5, 40)),
                    'broker_ms': int(random.uniform(15, 120)),
                    'consumer_ms': int(random.uniform(20, 160)),
                    'timestamp': datetime.now().isoformat()
                }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    # Dual-layer ingestion: mock tick unify (BIST depth + US L1)
    _TICKS = []

    def handle_publish_ticks(self, query_params):
        try:
            import random
            from time import time as now_time
            symbols = query_params.get('symbols', ['THYAO,ASELS,AAPL,MSFT'])[0].split(',')
            count = int(query_params.get('count', ['20'])[0])
            produced = []
            for _ in range(count):
                sym = random.choice(symbols).strip().upper()
                src = 'BIST' if sym.endswith('.IS') or sym in ['THYAO','ASELS','TUPRS','SISE','EREGL'] else 'US'
                ts = int(now_time()*1000)
                tick = {
                    'symbol': sym,
                    'src': src,
                    'price': round(random.uniform(10, 500), 2),
                    'size': random.randint(10, 5000),
                    'bid': round(random.uniform(10, 500), 2),
                    'ask': round(random.uniform(10, 500), 2),
                    'depth_bid': random.randint(1, 5),
                    'depth_ask': random.randint(1, 5),
                    'ts': ts
                }
                self._TICKS.append(tick)
                produced.append(tick)
            self._TICKS = self._TICKS[-1000:]
            self.send_json_response({'ok': True, 'produced': len(produced)})
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_get_ticks(self, query_params):
        try:
            sym = query_params.get('symbol', [''])[0].strip().upper()
            limit = int(query_params.get('limit', ['50'])[0])
            rows = self._TICKS
            if sym:
                rows = [t for t in rows if t['symbol'] == sym]
            rows = rows[-limit:]
            rows.sort(key=lambda x: x['ts'])
            self.send_json_response({'count': len(rows), 'ticks': rows})
        except Exception as e:
            self.send_json_response({'error': str(e)})

    # Adaptive UI State stubs
    def handle_ui_telemetry(self):
        try:
            content_length = int(self.headers.get('Content-Length','0'))
            body = self.rfile.read(content_length) if content_length>0 else b'{}'
            payload = json.loads(body.decode('utf-8'))
            # In real impl, store to analytics; here we just echo with ack
            self.send_json_response({'ok': True, 'received': payload, 'timestamp': datetime.now().isoformat()})
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_ui_recommendations(self, query_params):
        try:
            # Mock simple rule-based suggestions based on last visited tabs
            recent = query_params.get('recent', ['signals,market'])
            recent_tabs = [t.strip() for t in recent[0].split(',') if t.strip()]
            recs = []
            if 'signals' in recent_tabs:
                recs.append({'type':'shortcut','label':'Anlık Alarm Oluştur','target':'alerts'})
            if 'market' in recent_tabs:
                recs.append({'type':'shortcut','label':'Canlı Fiyatları Genişlet','target':'market'})
            if 'bist100' in recent_tabs:
                recs.append({'type':'insight','label':'Top 5 Yüksek Güven Sinyal','target':'bist100'})
            if not recs:
                recs.append({'type':'tip','label':'Predictive Twin’i deneyin','target':'twin'})
            self.send_json_response({'recommendations': recs, 'timestamp': datetime.now().isoformat()})
        except Exception as e:
            self.send_json_response({'error': str(e)})

    # Web Push & Watchlist stubs (in-memory)
    _PUSH_TOKENS = []
    _WATCHLIST = set()
    _ALERT_POLICY = {'threshold': 0.72, 'cooldown_minutes': 15, 'quiet_hours': [22,7]}

    def handle_sentiment_news(self, query_params):
        try:
            symbol = query_params.get('symbol', ['THYAO'])[0].upper()
            hours_back = int(query_params.get('hours_back', [24])[0])
            
            # Mock FinBERT-TR sentiment analysis
            import random
            news_sources = ['Hürriyet', 'Sabah', 'Milliyet', 'Dünya', 'KAP', 'Bloomberg TR', 'Reuters TR']
            
            news_items = []
            for i in range(random.randint(5, 15)):
                # Türkçe haber başlıkları
                headlines = [
                    f"{symbol} hissesi güçlü performans gösteriyor",
                    f"{symbol} şirketi yeni yatırım planı açıkladı",
                    f"{symbol} için analistler pozitif görüş bildiriyor",
                    f"{symbol} hissesinde teknik analiz sinyalleri",
                    f"{symbol} şirketinin finansal sonuçları beklentileri aştı",
                    f"{symbol} için risk faktörleri değerlendirmesi",
                    f"{symbol} hissesi piyasa volatilitesinde",
                    f"{symbol} şirketi sektör liderliğini sürdürüyor"
                ]
                
                # FinBERT-TR sentiment skorları (-1 ile +1 arası)
                sentiment_score = random.uniform(-0.8, 0.8)
                confidence = random.uniform(0.6, 0.95)
                
                # Sentiment kategorisi
                if sentiment_score > 0.3:
                    sentiment_label = "Pozitif"
                    sentiment_color = "green"
                elif sentiment_score < -0.3:
                    sentiment_label = "Negatif" 
                    sentiment_color = "red"
                else:
                    sentiment_label = "Nötr"
                    sentiment_color = "gray"
                
                news_items.append({
                    'headline': random.choice(headlines),
                    'source': random.choice(news_sources),
                    'sentiment_score': round(sentiment_score, 3),
                    'sentiment_label': sentiment_label,
                    'sentiment_color': sentiment_color,
                    'confidence': round(confidence, 3),
                    'timestamp': datetime.now().isoformat(),
                    'url': f'https://example.com/news/{i}'
                })
            
            # Ağırlıklı ortalama sentiment
            weighted_sentiment = sum(item['sentiment_score'] * item['confidence'] for item in news_items) / sum(item['confidence'] for item in news_items) if news_items else 0
            
            response = {
                'symbol': symbol,
                'hours_back': hours_back,
                'news_count': len(news_items),
                'weighted_sentiment': round(weighted_sentiment, 3),
                'sentiment_trend': 'Pozitif' if weighted_sentiment > 0.1 else 'Negatif' if weighted_sentiment < -0.1 else 'Nötr',
                'news_items': news_items,
                'timestamp': datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_sentiment_social(self, query_params):
        try:
            symbol = query_params.get('symbol', ['THYAO'])[0].upper()
            
            # Mock sosyal medya sentiment (Twitter, Reddit, Ekşi Sözlük)
            import random
            platforms = ['Twitter', 'Reddit', 'Ekşi Sözlük', 'Investing.com Forum']
            
            social_sentiment = {}
            for platform in platforms:
                # Platform bazlı sentiment skorları
                base_sentiment = random.uniform(-0.6, 0.6)
                volume = random.randint(50, 500)
                engagement = random.uniform(0.1, 0.8)
                
                social_sentiment[platform] = {
                    'sentiment_score': round(base_sentiment, 3),
                    'volume': volume,
                    'engagement_rate': round(engagement, 3),
                    'trend': 'Yükseliş' if base_sentiment > 0.2 else 'Düşüş' if base_sentiment < -0.2 else 'Sabit'
                }
            
            # Genel sosyal sentiment
            overall_sentiment = sum(s['sentiment_score'] for s in social_sentiment.values()) / len(social_sentiment)
            
            response = {
                'symbol': symbol,
                'overall_sentiment': round(overall_sentiment, 3),
                'platforms': social_sentiment,
                'timestamp': datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_sentiment_aggregate(self, query_params):
        try:
            symbol = query_params.get('symbol', ['THYAO'])[0].upper()
            
            # Haber + sosyal medya sentiment birleştirme
            import random
            
            # Mock haber sentiment
            news_sentiment = random.uniform(-0.7, 0.7)
            news_weight = 0.6
            
            # Mock sosyal sentiment  
            social_sentiment = random.uniform(-0.5, 0.5)
            social_weight = 0.4
            
            # Ağırlıklı ortalama
            aggregate_sentiment = news_sentiment * news_weight + social_sentiment * social_weight
            
            # Sentiment gücü
            sentiment_strength = abs(aggregate_sentiment)
            
            # Tahmin etkisi (sentiment ne kadar güçlüyse tahmin etkisi o kadar fazla)
            prediction_impact = aggregate_sentiment * sentiment_strength * 0.3
            
            response = {
                'symbol': symbol,
                'news_sentiment': round(news_sentiment, 3),
                'social_sentiment': round(social_sentiment, 3),
                'aggregate_sentiment': round(aggregate_sentiment, 3),
                'sentiment_strength': round(sentiment_strength, 3),
                'prediction_impact': round(prediction_impact, 3),
                'recommendation': 'Güçlü Pozitif' if aggregate_sentiment > 0.5 else 'Pozitif' if aggregate_sentiment > 0.1 else 'Nötr' if aggregate_sentiment > -0.1 else 'Negatif' if aggregate_sentiment > -0.5 else 'Güçlü Negatif',
                'timestamp': datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_candlestick_patterns(self, query_params):
        try:
            symbol = query_params.get('symbol', ['THYAO'])[0].upper()
            timeframe = query_params.get('timeframe', ['1h'])[0]
            
            # Mock candlestick pattern recognition
            import random
            from datetime import datetime, timedelta
            
            # Candlestick pattern definitions
            patterns = {
                'Bullish Engulfing': {
                    'description': 'Boğa Engulfing - Güçlü yükseliş sinyali',
                    'reliability': 0.75,
                    'signal': 'BUY',
                    'color': 'green'
                },
                'Bearish Engulfing': {
                    'description': 'Ayı Engulfing - Güçlü düşüş sinyali', 
                    'reliability': 0.75,
                    'signal': 'SELL',
                    'color': 'red'
                },
                'Hammer': {
                    'description': 'Çekiç - Dip sinyali, yükseliş beklenir',
                    'reliability': 0.65,
                    'signal': 'BUY',
                    'color': 'green'
                },
                'Shooting Star': {
                    'description': 'Ateş eden yıldız - Tepe sinyali, düşüş beklenir',
                    'reliability': 0.65,
                    'signal': 'SELL',
                    'color': 'red'
                },
                'Doji': {
                    'description': 'Doji - Kararsızlık, trend değişimi beklenir',
                    'reliability': 0.55,
                    'signal': 'HOLD',
                    'color': 'yellow'
                },
                'Morning Star': {
                    'description': 'Sabah yıldızı - Güçlü yükseliş sinyali',
                    'reliability': 0.80,
                    'signal': 'BUY',
                    'color': 'green'
                },
                'Evening Star': {
                    'description': 'Akşam yıldızı - Güçlü düşüş sinyali',
                    'reliability': 0.80,
                    'signal': 'SELL',
                    'color': 'red'
                }
            }
            
            detected_patterns = []
            for pattern_name, pattern_info in patterns.items():
                # Random pattern detection (in real implementation, this would be technical analysis)
                if random.random() < 0.3:  # 30% chance of pattern detection
                    confidence = random.uniform(0.6, 0.95)
                    detected_patterns.append({
                        'name': pattern_name,
                        'description': pattern_info['description'],
                        'signal': pattern_info['signal'],
                        'confidence': round(confidence, 3),
                        'reliability': pattern_info['reliability'],
                        'color': pattern_info['color'],
                        'detected_at': datetime.now().isoformat(),
                        'timeframe': timeframe
                    })
            
            # Sort by confidence
            detected_patterns.sort(key=lambda x: x['confidence'], reverse=True)
            
            response = {
                'symbol': symbol,
                'timeframe': timeframe,
                'patterns_detected': len(detected_patterns),
                'patterns': detected_patterns,
                'timestamp': datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_harmonic_patterns(self, query_params):
        try:
            symbol = query_params.get('symbol', ['THYAO'])[0].upper()
            timeframe = query_params.get('timeframe', ['4h'])[0]
            
            # Mock harmonic pattern recognition
            import random
            from datetime import datetime, timedelta
            
            harmonic_patterns = {
                'Gartley': {
                    'description': 'Gartley - Klasik harmonik formasyon',
                    'bullish_probability': 0.70,
                    'signal': 'BUY',
                    'color': 'green'
                },
                'Butterfly': {
                    'description': 'Kelebek - Güçlü harmonik sinyal',
                    'bullish_probability': 0.75,
                    'signal': 'BUY', 
                    'color': 'green'
                },
                'Bat': {
                    'description': 'Yarasa - Yüksek doğruluk oranı',
                    'bullish_probability': 0.80,
                    'signal': 'BUY',
                    'color': 'green'
                },
                'Crab': {
                    'description': 'Yengeç - Ekstrem harmonik formasyon',
                    'bullish_probability': 0.85,
                    'signal': 'BUY',
                    'color': 'green'
                },
                'Bearish Gartley': {
                    'description': 'Ayı Gartley - Düşüş harmonik formasyonu',
                    'bullish_probability': 0.30,
                    'signal': 'SELL',
                    'color': 'red'
                }
            }
            
            detected_harmonics = []
            for pattern_name, pattern_info in harmonic_patterns.items():
                if random.random() < 0.25:  # 25% chance of harmonic detection
                    confidence = random.uniform(0.7, 0.95)
                    fibonacci_levels = {
                        'XA': random.uniform(0.618, 0.786),
                        'AB': random.uniform(0.382, 0.618),
                        'BC': random.uniform(0.382, 0.886),
                        'CD': random.uniform(1.13, 1.618)
                    }
                    
                    detected_harmonics.append({
                        'name': pattern_name,
                        'description': pattern_info['description'],
                        'signal': pattern_info['signal'],
                        'confidence': round(confidence, 3),
                        'bullish_probability': pattern_info['bullish_probability'],
                        'color': pattern_info['color'],
                        'fibonacci_levels': fibonacci_levels,
                        'detected_at': datetime.now().isoformat(),
                        'timeframe': timeframe
                    })
            
            detected_harmonics.sort(key=lambda x: x['confidence'], reverse=True)
            
            response = {
                'symbol': symbol,
                'timeframe': timeframe,
                'harmonics_detected': len(detected_harmonics),
                'harmonics': detected_harmonics,
                'timestamp': datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_technical_patterns(self, query_params):
        try:
            symbol = query_params.get('symbol', ['THYAO'])[0].upper()
            timeframe = query_params.get('timeframe', ['1d'])[0]
            
            # Mock technical pattern recognition (Chart patterns)
            import random
            from datetime import datetime, timedelta
            
            technical_patterns = {
                'Head and Shoulders': {
                    'description': 'Baş ve Omuzlar - Güçlü düşüş sinyali',
                    'reliability': 0.85,
                    'signal': 'SELL',
                    'color': 'red',
                    'target_price': random.uniform(0.85, 0.95)
                },
                'Inverse Head and Shoulders': {
                    'description': 'Ters Baş ve Omuzlar - Güçlü yükseliş sinyali',
                    'reliability': 0.85,
                    'signal': 'BUY',
                    'color': 'green',
                    'target_price': random.uniform(1.05, 1.15)
                },
                'Double Top': {
                    'description': 'Çift Tepe - Düşüş sinyali',
                    'reliability': 0.75,
                    'signal': 'SELL',
                    'color': 'red',
                    'target_price': random.uniform(0.90, 0.98)
                },
                'Double Bottom': {
                    'description': 'Çift Dip - Yükseliş sinyali',
                    'reliability': 0.75,
                    'signal': 'BUY',
                    'color': 'green',
                    'target_price': random.uniform(1.02, 1.10)
                },
                'Triangle Ascending': {
                    'description': 'Yükselen Üçgen - Yükseliş sinyali',
                    'reliability': 0.70,
                    'signal': 'BUY',
                    'color': 'green',
                    'target_price': random.uniform(1.05, 1.12)
                },
                'Triangle Descending': {
                    'description': 'Alçalan Üçgen - Düşüş sinyali',
                    'reliability': 0.70,
                    'signal': 'SELL',
                    'color': 'red',
                    'target_price': random.uniform(0.88, 0.95)
                },
                'Flag Bullish': {
                    'description': 'Boğa Bayrağı - Yükseliş devamı',
                    'reliability': 0.80,
                    'signal': 'BUY',
                    'color': 'green',
                    'target_price': random.uniform(1.08, 1.20)
                },
                'Flag Bearish': {
                    'description': 'Ayı Bayrağı - Düşüş devamı',
                    'reliability': 0.80,
                    'signal': 'SELL',
                    'color': 'red',
                    'target_price': random.uniform(0.80, 0.92)
                }
            }
            
            detected_technical = []
            for pattern_name, pattern_info in technical_patterns.items():
                if random.random() < 0.2:  # 20% chance of technical pattern detection
                    confidence = random.uniform(0.65, 0.90)
                    volume_confirmation = random.choice([True, False])
                    
                    detected_technical.append({
                        'name': pattern_name,
                        'description': pattern_info['description'],
                        'signal': pattern_info['signal'],
                        'confidence': round(confidence, 3),
                        'reliability': pattern_info['reliability'],
                        'color': pattern_info['color'],
                        'target_price': round(pattern_info['target_price'], 3),
                        'volume_confirmation': volume_confirmation,
                        'detected_at': datetime.now().isoformat(),
                        'timeframe': timeframe
                    })
            
            detected_technical.sort(key=lambda x: x['confidence'], reverse=True)
            
            response = {
                'symbol': symbol,
                'timeframe': timeframe,
                'technical_patterns_detected': len(detected_technical),
                'technical_patterns': detected_technical,
                'timestamp': datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_price_stream(self, query_params):
        try:
            symbols = query_params.get('symbols', ['THYAO'])[0].split(',')
            symbols = [s.strip().upper() for s in symbols]
            
            # Mock real-time price streaming
            import random
            import time
            from datetime import datetime
            
            # Simulate real-time price updates
            prices = {}
            for symbol in symbols:
                base_price = random.uniform(50, 200)
                prices[symbol] = {
                    'symbol': symbol,
                    'price': round(base_price, 2),
                    'change': round(random.uniform(-5, 5), 2),
                    'change_percent': round(random.uniform(-3, 3), 2),
                    'volume': random.randint(100000, 1000000),
                    'timestamp': datetime.now().isoformat()
                }
            
            response = {
                'type': 'price_update',
                'prices': prices,
                'timestamp': datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_tick_stream(self, query_params):
        try:
            symbol = query_params.get('symbol', ['THYAO'])[0].upper()
            limit = int(query_params.get('limit', [10])[0])
            
            # Mock tick data streaming
            import random
            from datetime import datetime, timedelta
            
            base_price = random.uniform(50, 200)
            ticks = []
            
            for i in range(limit):
                # Simulate tick price movement
                price_change = random.uniform(-0.5, 0.5)
                base_price += price_change
                
                ticks.append({
                    'symbol': symbol,
                    'price': round(base_price, 2),
                    'volume': random.randint(100, 5000),
                    'side': random.choice(['BUY', 'SELL']),
                    'timestamp': (datetime.now() - timedelta(seconds=i)).isoformat()
                })
            
            response = {
                'type': 'tick_update',
                'symbol': symbol,
                'ticks': ticks,
                'timestamp': datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_signal_stream(self, query_params):
        try:
            symbols = query_params.get('symbols', ['THYAO'])[0].split(',')
            symbols = [s.strip().upper() for s in symbols]
            
            # Mock real-time signal streaming
            import random
            from datetime import datetime
            
            signals = []
            for symbol in symbols:
                if random.random() < 0.3:  # 30% chance of signal
                    signal_type = random.choice(['BUY', 'SELL', 'HOLD'])
                    confidence = random.uniform(0.6, 0.95)
                    
                    signals.append({
                        'symbol': symbol,
                        'signal': signal_type,
                        'confidence': round(confidence, 3),
                        'price': round(random.uniform(50, 200), 2),
                        'reason': f'{symbol} için {signal_type} sinyali',
                        'timestamp': datetime.now().isoformat()
                    })
            
            response = {
                'type': 'signal_update',
                'signals': signals,
                'timestamp': datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_portfolio_risk(self, query_params):
        try:
            symbols = query_params.get('symbols', ['THYAO,ASELS,TUPRS'])[0].split(',')
            symbols = [s.strip().upper() for s in symbols]
            portfolio_value = float(query_params.get('portfolio_value', [100000])[0])
            risk_tolerance = float(query_params.get('risk_tolerance', [0.02])[0])  # 2% risk
            
            # Mock portfolio risk analysis
            import random
            from datetime import datetime
            
            positions = {}
            total_allocation = 0
            
            for symbol in symbols:
                # Dynamic position sizing based on volatility and confidence
                base_volatility = random.uniform(0.15, 0.35)  # 15-35% annual volatility
                confidence = random.uniform(0.6, 0.9)
                
                # Kelly Criterion inspired position sizing
                kelly_fraction = min(0.25, (confidence - 0.5) * 0.5)  # Max 25% per position
                volatility_adjustment = 1.0 / (1.0 + base_volatility)
                
                allocation = kelly_fraction * volatility_adjustment
                allocation = max(0.05, min(0.20, allocation))  # 5-20% range
                
                position_value = portfolio_value * allocation
                shares = int(position_value / random.uniform(50, 200))  # Mock price
                
                positions[symbol] = {
                    'symbol': symbol,
                    'shares': shares,
                    'allocation_percent': round(allocation * 100, 2),
                    'position_value': round(position_value, 2),
                    'volatility': round(base_volatility * 100, 2),
                    'confidence': round(confidence, 3),
                    'kelly_fraction': round(kelly_fraction, 3),
                    'stop_loss': round(position_value * 0.95, 2),  # 5% stop loss
                    'take_profit': round(position_value * 1.15, 2)  # 15% take profit
                }
                
                total_allocation += allocation
            
            # Portfolio metrics
            portfolio_metrics = {
                'total_allocation': round(total_allocation * 100, 2),
                'cash_remaining': round(portfolio_value * (1 - total_allocation), 2),
                'portfolio_volatility': round(sum(p['volatility'] for p in positions.values()) / len(positions), 2),
                'max_drawdown': round(random.uniform(0.08, 0.15) * 100, 2),
                'sharpe_ratio': round(random.uniform(1.2, 2.1), 2),
                'var_95': round(portfolio_value * risk_tolerance, 2),
                'expected_return': round(random.uniform(0.12, 0.25) * 100, 2)
            }
            
            response = {
                'portfolio_value': portfolio_value,
                'risk_tolerance': risk_tolerance,
                'positions': positions,
                'metrics': portfolio_metrics,
                'timestamp': datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_value_at_risk(self, query_params):
        try:
            portfolio_value = float(query_params.get('portfolio_value', [100000])[0])
            confidence_level = float(query_params.get('confidence', [0.95])[0])
            time_horizon = int(query_params.get('horizon_days', [1])[0])
            
            # Mock VaR calculation using Monte Carlo simulation
            import random
            import math
            from datetime import datetime
            
            # Simulate portfolio returns
            num_simulations = 10000
            returns = []
            
            for _ in range(num_simulations):
                # Portfolio return simulation (normal distribution)
                daily_return = random.normalvariate(0.0008, 0.02)  # 0.08% daily return, 2% volatility
                returns.append(daily_return)
            
            # Calculate VaR
            returns.sort()
            var_index = int((1 - confidence_level) * num_simulations)
            var_return = returns[var_index]
            var_amount = portfolio_value * abs(var_return)
            
            # Expected Shortfall (CVaR)
            tail_returns = returns[:var_index]
            expected_shortfall = sum(tail_returns) / len(tail_returns) if tail_returns else 0
            cvar_amount = portfolio_value * abs(expected_shortfall)
            
            # Additional risk metrics
            max_loss = min(returns) * portfolio_value
            probability_of_loss = len([r for r in returns if r < 0]) / num_simulations
            
            response = {
                'portfolio_value': portfolio_value,
                'confidence_level': confidence_level,
                'time_horizon_days': time_horizon,
                'var_amount': round(var_amount, 2),
                'var_percent': round(abs(var_return) * 100, 2),
                'cvar_amount': round(cvar_amount, 2),
                'cvar_percent': round(abs(expected_shortfall) * 100, 2),
                'max_loss': round(max_loss, 2),
                'probability_of_loss': round(probability_of_loss * 100, 2),
                'simulations': num_simulations,
                'timestamp': datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_monte_carlo_simulation(self, query_params):
        try:
            portfolio_value = float(query_params.get('portfolio_value', [100000])[0])
            time_horizon = int(query_params.get('horizon_days', [30])[0])
            num_simulations = int(query_params.get('simulations', [1000])[0])
            
            # Mock Monte Carlo simulation
            import random
            import math
            from datetime import datetime
            
            # Portfolio parameters
            expected_return = 0.0008  # 0.08% daily return
            volatility = 0.02  # 2% daily volatility
            
            simulation_results = []
            
            for sim in range(num_simulations):
                current_value = portfolio_value
                daily_values = [current_value]
                
                for day in range(time_horizon):
                    # Random daily return
                    daily_return = random.normalvariate(expected_return, volatility)
                    current_value *= (1 + daily_return)
                    daily_values.append(current_value)
                
                final_value = current_value
                total_return = (final_value - portfolio_value) / portfolio_value
                
                simulation_results.append({
                    'simulation': sim + 1,
                    'final_value': round(final_value, 2),
                    'total_return': round(total_return * 100, 2),
                    'daily_values': [round(v, 2) for v in daily_values]
                })
            
            # Calculate statistics
            final_values = [s['final_value'] for s in simulation_results]
            returns = [s['total_return'] for s in simulation_results]
            
            stats = {
                'mean_final_value': round(sum(final_values) / len(final_values), 2),
                'median_final_value': round(sorted(final_values)[len(final_values)//2], 2),
                'mean_return': round(sum(returns) / len(returns), 2),
                'volatility': round(math.sqrt(sum((r - sum(returns)/len(returns))**2 for r in returns) / len(returns)), 2),
                'percentile_5': round(sorted(final_values)[int(0.05 * len(final_values))], 2),
                'percentile_95': round(sorted(final_values)[int(0.95 * len(final_values))], 2),
                'probability_of_loss': round(len([r for r in returns if r < 0]) / len(returns) * 100, 2),
                'max_gain': round(max(returns), 2),
                'max_loss': round(min(returns), 2)
            }
            
            response = {
                'portfolio_value': portfolio_value,
                'time_horizon_days': time_horizon,
                'simulations': num_simulations,
                'statistics': stats,
                'sample_results': simulation_results[:10],  # First 10 simulations
                'timestamp': datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_smart_notifications(self, query_params):
        try:
            user_id = query_params.get('user_id', ['default'])[0]
            notification_type = query_params.get('type', ['signal'])[0]
            
            # Mock smart notification system
            import random
            from datetime import datetime, timedelta
            
            # Notification templates
            templates = {
                'signal': {
                    'high_confidence': [
                        '🚀 Yüksek güven sinyali: {symbol} için {signal} önerisi (Güven: {confidence}%)',
                        '⚡ Güçlü sinyal: {symbol} {signal} pozisyonu (Güven: {confidence}%)',
                        '🎯 Premium sinyal: {symbol} {signal} fırsatı (Güven: {confidence}%)'
                    ],
                    'pattern': [
                        '📈 Formasyon sinyali: {symbol} {pattern} tespit edildi',
                        '🔍 Teknik sinyal: {symbol} {pattern} formasyonu',
                        '📊 Pattern alert: {symbol} {pattern} sinyali'
                    ],
                    'risk': [
                        '⚠️ Risk uyarısı: {symbol} volatilite artışı',
                        '🚨 Risk alarmı: {symbol} stop loss seviyesi',
                        '📉 Risk bildirimi: {symbol} düşüş sinyali'
                    ]
                }
            }
            
            # Generate smart notifications
            notifications = []
            symbols = ['THYAO', 'ASELS', 'TUPRS', 'SISE', 'EREGL']
            
            for i in range(random.randint(3, 8)):
                symbol = random.choice(symbols)
                signal_type = random.choice(['BUY', 'SELL'])
                confidence = random.uniform(0.7, 0.95)
                pattern = random.choice(['Bullish Engulfing', 'Hammer', 'Morning Star', 'Head and Shoulders'])
                
                if confidence > 0.85:
                    template = random.choice(templates['signal']['high_confidence'])
                    priority = 'high'
                    icon = '🚀'
                elif random.random() < 0.3:
                    template = random.choice(templates['signal']['pattern'])
                    priority = 'medium'
                    icon = '📈'
                else:
                    template = random.choice(templates['signal']['risk'])
                    priority = 'low'
                    icon = '⚠️'
                
                message = template.format(
                    symbol=symbol,
                    signal=signal_type,
                    confidence=int(confidence * 100),
                    pattern=pattern
                )
                
                notifications.append({
                    'id': f'notif_{i+1}',
                    'user_id': user_id,
                    'type': notification_type,
                    'priority': priority,
                    'icon': icon,
                    'title': f'{symbol} Sinyali',
                    'message': message,
                    'symbol': symbol,
                    'confidence': round(confidence, 3),
                    'timestamp': (datetime.now() - timedelta(minutes=random.randint(0, 60))).isoformat(),
                    'read': random.choice([True, False]),
                    'action_required': random.choice([True, False])
                })
            
            # Sort by priority and timestamp
            priority_order = {'high': 3, 'medium': 2, 'low': 1}
            notifications.sort(key=lambda x: (priority_order[x['priority']], x['timestamp']), reverse=True)
            
            response = {
                'user_id': user_id,
                'notifications_count': len(notifications),
                'unread_count': len([n for n in notifications if not n['read']]),
                'notifications': notifications,
                'timestamp': datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_email_notifications(self, query_params):
        try:
            email = query_params.get('email', ['user@example.com'])[0]
            notification_type = query_params.get('type', ['daily_summary'])[0]
            
            # Mock email notification system
            import random
            from datetime import datetime
            
            email_templates = {
                'daily_summary': {
                    'subject': 'BIST AI Trader - Günlük Özet',
                    'template': '''
                    Merhaba,
                    
                    Bugünkü BIST AI Trader özetiniz:
                    
                    📊 Portföy Performansı: +{portfolio_change}%
                    🎯 Aktif Sinyaller: {active_signals}
                    ⚠️ Risk Uyarıları: {risk_alerts}
                    📈 Yeni Fırsatlar: {new_opportunities}
                    
                    Detaylı analiz için uygulamayı açın.
                    
                    BIST AI Trader Ekibi
                    '''
                },
                'signal_alert': {
                    'subject': '🚀 Yeni Yüksek Güven Sinyali',
                    'template': '''
                    Merhaba,
                    
                    Yeni yüksek güven sinyali:
                    
                    Sembol: {symbol}
                    Sinyal: {signal}
                    Güven: {confidence}%
                    Fiyat: ₺{price}
                    
                    Hemen işlem yapmak için uygulamayı açın.
                    
                    BIST AI Trader Ekibi
                    '''
                },
                'risk_warning': {
                    'subject': '⚠️ Risk Uyarısı',
                    'template': '''
                    Merhaba,
                    
                    Portföyünüzde risk uyarısı:
                    
                    Sembol: {symbol}
                    Risk Seviyesi: {risk_level}
                    Önerilen Aksiyon: {action}
                    
                    Risk yönetimi için uygulamayı kontrol edin.
                    
                    BIST AI Trader Ekibi
                    '''
                }
            }
            
            template = email_templates.get(notification_type, email_templates['daily_summary'])
            
            # Generate email content
            email_data = {
                'email': email,
                'type': notification_type,
                'subject': template['subject'],
                'content': template['template'].format(
                    portfolio_change=random.uniform(-2, 5),
                    active_signals=random.randint(3, 8),
                    risk_alerts=random.randint(0, 3),
                    new_opportunities=random.randint(2, 6),
                    symbol=random.choice(['THYAO', 'ASELS', 'TUPRS']),
                    signal=random.choice(['BUY', 'SELL']),
                    confidence=random.randint(75, 95),
                    price=random.uniform(50, 200),
                    risk_level=random.choice(['Yüksek', 'Orta', 'Düşük']),
                    action=random.choice(['Stop Loss', 'Take Profit', 'Pozisyon Azalt'])
                ),
                'sent_at': datetime.now().isoformat(),
                'status': 'sent',
                'priority': 'high' if notification_type == 'signal_alert' else 'medium'
            }
            
            response = {
                'email': email,
                'notification_type': notification_type,
                'email_data': email_data,
                'timestamp': datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_sms_notifications(self, query_params):
        try:
            phone = query_params.get('phone', ['+905551234567'])[0]
            notification_type = query_params.get('type', ['urgent_signal'])[0]
            
            # Mock SMS notification system
            import random
            from datetime import datetime
            
            sms_templates = {
                'urgent_signal': '🚀 {symbol} {signal} sinyali! Güven: {confidence}% Fiyat: ₺{price}',
                'risk_alert': '⚠️ {symbol} risk uyarısı! Stop loss kontrol edin.',
                'pattern_alert': '📈 {symbol} {pattern} formasyonu tespit edildi.',
                'daily_summary': '📊 Günlük özet: Portföy +{change}% | {signals} sinyal | {alerts} uyarı'
            }
            
            template = sms_templates.get(notification_type, sms_templates['urgent_signal'])
            
            # Generate SMS content
            sms_data = {
                'phone': phone,
                'type': notification_type,
                'message': template.format(
                    symbol=random.choice(['THYAO', 'ASELS', 'TUPRS']),
                    signal=random.choice(['BUY', 'SELL']),
                    confidence=random.randint(75, 95),
                    price=random.uniform(50, 200),
                    pattern=random.choice(['Bullish Engulfing', 'Hammer', 'Morning Star']),
                    change=random.uniform(-2, 5),
                    signals=random.randint(3, 8),
                    alerts=random.randint(0, 3)
                ),
                'sent_at': datetime.now().isoformat(),
                'status': 'sent',
                'cost': 0.05  # Mock SMS cost
            }
            
            response = {
                'phone': phone,
                'notification_type': notification_type,
                'sms_data': sms_data,
                'timestamp': datetime.now().isoformat()
            }
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_alerts_policy(self, query_params):
        try:
            if 'threshold' in query_params:
                self._ALERT_POLICY['threshold'] = float(query_params['threshold'][0])
            if 'cooldown_minutes' in query_params:
                self._ALERT_POLICY['cooldown_minutes'] = int(query_params['cooldown_minutes'][0])
            if 'quiet_hours' in query_params:
                rng = query_params['quiet_hours'][0].split('-')
                self._ALERT_POLICY['quiet_hours'] = [int(rng[0]), int(rng[1])]
            self.send_json_response(self._ALERT_POLICY)
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_register_push(self):
        try:
            content_length = int(self.headers.get('Content-Length','0'))
            body = self.rfile.read(content_length) if content_length>0 else b'{}'
            payload = json.loads(body.decode('utf-8'))
            token = payload.get('token')
            if token and token not in self._PUSH_TOKENS:
                self._PUSH_TOKENS.append(token)
            self.send_json_response({'ok': True, 'registered': token is not None, 'count': len(self._PUSH_TOKENS)})
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_test_alert(self, query_params):
        try:
            # Pretend to send notification to all tokens
            title = query_params.get('title', ['BIST AI Sinyal'])[0]
            body = query_params.get('body', ['%85+ güven sinyali bulundu'])[0]
            self.send_json_response({'sent_to': len(self._PUSH_TOKENS), 'title': title, 'body': body})
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_watchlist_get(self, query_params):
        try:
            self.send_json_response({'symbols': sorted(list(self._WATCHLIST))})
        except Exception as e:
            self.send_json_response({'error': str(e)})

    def handle_watchlist_update(self, query_params):
        try:
            symbols = query_params.get('symbols', [''])[0]
            mode = query_params.get('mode', ['set'])[0]
            items = [s.strip().upper() for s in symbols.split(',') if s.strip()]
            if mode == 'add':
                for s in items: self._WATCHLIST.add(s)
            elif mode == 'remove':
                for s in items: self._WATCHLIST.discard(s)
            else:
                self._WATCHLIST = set(items)
            self.send_json_response({'ok': True, 'symbols': sorted(list(self._WATCHLIST))})
        except Exception as e:
            self.send_json_response({'error': str(e)})
    
    def send_json_response(self, data):
        json_data = json.dumps(data, indent=2)
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        # CORS headers on every JSON response
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-Length', str(len(json_data)))
        self.end_headers()
        self.wfile.write(json_data.encode('utf-8'))
    
    def log_message(self, format, *args):
        # Suppress default logging
        pass

def run_server():
    host = os.getenv('HOST', '0.0.0.0')
    try:
        port = int(os.getenv('PORT', '9011'))
    except ValueError:
        port = 9011
    server_address = (host, port)
    httpd = HTTPServer(server_address, BISTAIHandler)
    print(f"🚀 BIST AI Smart Trader HTTP Server başlatıldı: http://{server_address[0]}:{server_address[1]}")
    print("📱 Ultra Accuracy Optimizer hazır!")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()
