// App Constants
class AppConstants {
  // API endpoints
  // Android emülatör: 10.0.2.2, Backend port: 8080 (FastAPI)
  static const String baseUrl = 'http://10.0.2.2:8080';
  static const String apiVersion = '';
  
  // WebSocket
  static const String wsUrl = 'ws://10.0.2.2:8080/signals/stream';
  
  // Refresh intervals
  static const Duration priceRefreshInterval = Duration(seconds: 5);
  static const Duration signalRefreshInterval = Duration(seconds: 30);
  static const Duration portfolioRefreshInterval = Duration(minutes: 1);
  
  // Cache durations
  static const Duration priceCacheDuration = Duration(minutes: 5);
  static const Duration signalCacheDuration = Duration(minutes: 10);
  static const Duration portfolioCacheDuration = Duration(minutes: 15);
  
  // Default symbols
  static const List<String> defaultSymbols = [
    'SISE.IS', 'EREGL.IS', 'TUPRS.IS', 'AKBNK.IS', 'GARAN.IS',
    'AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'
  ];
  
  // App info
  static const String appName = 'BIST AI Smart Trader';
  static const String appVersion = '2.0.0';
  static const String appDescription = 'PRD v2.0 - AI-powered trading assistant';
}
