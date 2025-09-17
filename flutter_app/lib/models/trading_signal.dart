class TradingSignal {
  final String symbol;
  final String signal;
  final double confidence;
  final String? aiSignal;
  final double? aiConfidence;
  final Map<String, dynamic>? analysis;
  final String timestamp;
  
  TradingSignal({
    required this.symbol,
    required this.signal,
    required this.confidence,
    this.aiSignal,
    this.aiConfidence,
    this.analysis,
    required this.timestamp,
  });
  
  factory TradingSignal.fromJson(String symbol, Map<String, dynamic> json) {
    return TradingSignal(
      symbol: symbol,
      signal: json['signal'] ?? 'UNKNOWN',
      confidence: (json['confidence'] ?? 0.0).toDouble(),
      aiSignal: json['analysis']?['ai_signal'],
      aiConfidence: json['analysis']?['ai_confidence']?.toDouble(),
      analysis: json['analysis'],
      timestamp: json['timestamp'] ?? DateTime.now().toIso8601String(),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'symbol': symbol,
      'signal': signal,
      'confidence': confidence,
      'aiSignal': aiSignal,
      'aiConfidence': aiConfidence,
      'analysis': analysis,
      'timestamp': timestamp,
    };
  }
  
  @override
  String toString() {
    return 'TradingSignal(symbol: $symbol, signal: $signal, confidence: $confidence)';
  }
}
