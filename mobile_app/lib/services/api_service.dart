import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://localhost:8000';
  static const String productionUrl = 'https://your-app-name.railway.app';
  
  static String get apiUrl {
    // Production'da Railway URL'ini kullan
    return const bool.fromEnvironment('dart.vm.product') 
        ? productionUrl 
        : baseUrl;
  }

  // Health check
  static Future<Map<String, dynamic>> healthCheck() async {
    try {
      final response = await http.get(
        Uri.parse('$apiUrl/'),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Health check failed: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('API connection error: $e');
    }
  }

  // Signal analysis
  static Future<Map<String, dynamic>> analyzeSignal({
    required String symbol,
    String timeframe = '1d',
    String mode = 'normal',
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$apiUrl/signals'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'symbol': symbol,
          'timeframe': timeframe,
          'mode': mode,
        }),
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Signal analysis failed: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Signal analysis error: $e');
    }
  }

  // Pattern test
  static Future<Map<String, dynamic>> testPatterns() async {
    try {
      final response = await http.get(
        Uri.parse('$apiUrl/patterns/test'),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Pattern test failed: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Pattern test error: $e');
    }
  }

  // API info
  static Future<Map<String, dynamic>> getApiInfo() async {
    try {
      final response = await http.get(
        Uri.parse('$apiUrl/api/info'),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('API info failed: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('API info error: $e');
    }
  }
}
