import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://127.0.0.1:8081';
  
  // BIST 100 AI Predictions
  static Future<List<Map<String, dynamic>>> getBist100Predictions({
    String timeframe = '1d',
    int limit = 50,
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/bist100/predictions?timeframe=$timeframe&limit=$limit'),
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return List<Map<String, dynamic>>.from(data['predictions'] ?? []);
      }
      return [];
    } catch (e) {
      print('Error fetching BIST 100 predictions: $e');
      return [];
    }
  }
  
  // Advanced AI Ensemble Predictions
  static Future<List<Map<String, dynamic>>> getEnsemblePredictions({
    String symbols = 'THYAO,ASELS,TUPRS,SISE,EREGL',
    String timeframe = '1d',
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/ai/ensemble/predictions?symbols=$symbols&timeframe=$timeframe'),
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return List<Map<String, dynamic>>.from(data['predictions'] ?? []);
      }
      return [];
    } catch (e) {
      print('Error fetching ensemble predictions: $e');
      return [];
    }
  }
  
  // Harmonic Patterns
  static Future<Map<String, dynamic>> getHarmonicPatterns({
    String symbols = 'THYAO,ASELS,TUPRS,SISE,EREGL',
    String timeframe = '1d',
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/patterns/harmonic/bulk?symbols=$symbols&timeframe=$timeframe'),
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return {};
    } catch (e) {
      print('Error fetching harmonic patterns: $e');
      return {};
    }
  }
  
  // Elliott Waves
  static Future<Map<String, dynamic>> getElliottWaves({
    String symbols = 'THYAO,ASELS,TUPRS,SISE,EREGL',
    String timeframe = '1d',
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/patterns/elliott/bulk?symbols=$symbols&timeframe=$timeframe'),
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return {};
    } catch (e) {
      print('Error fetching Elliott waves: $e');
      return {};
    }
  }
  
  // Crypto Prices
  static Future<List<Map<String, dynamic>>> getCryptoPrices() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/crypto/prices'),
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return List<Map<String, dynamic>>.from(data['prices'] ?? []);
      }
      return [];
    } catch (e) {
      print('Error fetching crypto prices: $e');
      return [];
    }
  }
  
  // Broker Portfolio
  static Future<Map<String, dynamic>> getBrokerPortfolio() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/brokers/portfolio'),
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return {};
    } catch (e) {
      print('Error fetching broker portfolio: $e');
      return {};
    }
  }
  
  // Health Check
  static Future<Map<String, dynamic>> getHealthStatus() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/health'),
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return {};
    } catch (e) {
      print('Error fetching health status: $e');
      return {};
    }
  }
}