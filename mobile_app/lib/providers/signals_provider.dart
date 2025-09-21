import 'package:flutter/material.dart';
import '../services/api_service.dart';

class SignalsProvider extends ChangeNotifier {
  List<Map<String, dynamic>> _signals = [];
  List<Map<String, dynamic>> _ranking = [];
  bool _isLoading = false;
  
  // Getters
  List<Map<String, dynamic>> get signals => _signals;
  List<Map<String, dynamic>> get ranking => _ranking;
  bool get isLoading => _isLoading;
  
  // Load signals from API
  Future<void> loadSignals() async {
    _isLoading = true;
    notifyListeners();
    
    try {
      // Real API call
      final response = await ApiService.analyzeSignal(symbol: 'SISE.IS');
      
      // Convert API response to signal format
      _signals = [
        {
          'id': '1',
          'symbol': response['symbol'],
          'type': response['action'],
          'confidence': response['confidence'],
          'price': 45.20, // Mock price
          'target': 48.50, // Mock target
          'stop_loss': 43.80, // Mock stop loss
          'timestamp': response['timestamp'],
          'reason': response['reason'],
          'strength': response['confidence'] > 0.8 ? 'STRONG' : 'MEDIUM',
          'patterns_detected': response['patterns_detected'],
          'expected_accuracy': response['expected_accuracy']
        }
      ];
      
    } catch (e) {
      print('Signals yüklenemedi: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  // Load ranking from API
  Future<void> loadRanking() async {
    _isLoading = true;
    notifyListeners();
    
    try {
      // TODO: Implement real API call
      await Future.delayed(const Duration(seconds: 1));
      
      // Mock data for testing
      _ranking = [
        {
          'symbol': 'SISE.IS',
          'topsis_score': 0.85,
          'grey_score': 0.78,
          'fundamental_score': 0.82,
          'technical_score': 0.88,
          'sentiment_score': 0.75,
          'overall_rank': 1
        },
        {
          'symbol': 'EREGL.IS',
          'topsis_score': 0.72,
          'grey_score': 0.68,
          'fundamental_score': 0.75,
          'technical_score': 0.70,
          'sentiment_score': 0.65,
          'overall_rank': 2
        }
      ];
      
    } catch (e) {
      print('Ranking yüklenemedi: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  // Get signal by ID
  Map<String, dynamic>? getSignalById(String id) {
    try {
      return _signals.firstWhere((signal) => signal['id'] == id);
    } catch (e) {
      return null;
    }
  }
  
  // Get signals by type
  List<Map<String, dynamic>> getSignalsByType(String type) {
    return _signals.where((signal) => signal['type'] == type.toUpperCase()).toList();
  }
  
  // Get signals by symbol
  List<Map<String, dynamic>> getSignalsBySymbol(String symbol) {
    return _signals.where((signal) => signal['symbol'] == symbol).toList();
  }
  
  // Add new signal
  void addSignal(Map<String, dynamic> signal) {
    _signals.insert(0, signal);
    notifyListeners();
  }
  
  // Update signal
  void updateSignal(String id, Map<String, dynamic> updates) {
    final index = _signals.indexWhere((signal) => signal['id'] == id);
    if (index != -1) {
      _signals[index].addAll(updates);
      notifyListeners();
    }
  }
  
  // Delete signal
  void deleteSignal(String id) {
    _signals.removeWhere((signal) => signal['id'] == id);
    notifyListeners();
  }
  
  // Get top ranked stocks
  List<Map<String, dynamic>> getTopRanked(int count) {
    final sorted = List<Map<String, dynamic>>.from(_ranking);
    sorted.sort((a, b) => (b['overall_rank'] ?? 0).compareTo(a['overall_rank'] ?? 0));
    return sorted.take(count).toList();
  }
  
  // Refresh all data
  Future<void> refreshAll() async {
    await Future.wait([
      loadSignals(),
      loadRanking(),
    ]);
  }
}
