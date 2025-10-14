import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://127.0.0.1:8081';
  
  // Trading sinyalleri al
  static Future<Map<String, dynamic>> getSignals({
    String? symbols,
    bool includeSentiment = true,
    bool includeXai = true,
    String market = 'BIST',
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/signals').replace(
        queryParameters: {
          if (symbols != null) 'symbols': symbols,
          'include_sentiment': includeSentiment.toString(),
          'include_xai': includeXai.toString(),
          'market': market,
        },
      );
      
      final response = await http.get(uri);
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('API Error: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ API Error: $e');
      return {'error': e.toString()};
    }
  }
  
  // Market bilgileri al
  static Future<Map<String, dynamic>> getMarkets() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/markets'));
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('API Error: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Markets API Error: $e');
      return {'error': e.toString()};
    }
  }
  
  // Trading robot durumu
  static Future<Map<String, dynamic>> getRobotStatus() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/robot/status'));
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('API Error: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Robot Status API Error: $e');
      return {'error': e.toString()};
    }
  }
  
  // Robot modunu değiştir
  static Future<Map<String, dynamic>> changeRobotMode(String mode) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/robot/mode'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'mode': mode}),
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('API Error: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Robot Mode Change API Error: $e');
      return {'error': e.toString()};
    }
  }
  
  // Auto trading başlat/durdur
  static Future<Map<String, dynamic>> toggleAutoTrading(bool enabled) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/robot/auto-trading'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'enabled': enabled}),
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('API Error: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Auto Trading Toggle API Error: $e');
      return {'error': e.toString()};
    }
  }
  
  // Performance raporu
  static Future<Map<String, dynamic>> getPerformanceReport() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/robot/performance'));
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('API Error: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Performance Report API Error: $e');
      return {'error': e.toString()};
    }
  }
  
  // US Market özellikleri
  static Future<Map<String, dynamic>> getUSMarketScalping() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/us-market/scalping'));
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('API Error: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ US Market Scalping API Error: $e');
      return {'error': e.toString()};
    }
  }
  
  static Future<Map<String, dynamic>> getUSMarketOptions() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/us-market/options'));
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('API Error: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ US Market Options API Error: $e');
      return {'error': e.toString()};
    }
  }
  
  static Future<Map<String, dynamic>> getUSMarketSentiment() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/us-market/sentiment'));
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('API Error: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ US Market Sentiment API Error: $e');
      return {'error': e.toString()};
    }
  }
  
  static Future<Map<String, dynamic>> getUSMarketTechnical() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/us-market/technical'));
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('API Error: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ US Market Technical API Error: $e');
      return {'error': e.toString()};
    }
  }
}
