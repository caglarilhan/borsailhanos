import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';

class SignalsService {
  static Future<Map<String, dynamic>> fetchSignals({List<String>? symbols}) async {
    final syms = (symbols ?? AppConstants.defaultSymbols).map((e) => 'symbols=$e').join('&');
    final url = Uri.parse('${AppConstants.baseUrl}${AppConstants.apiVersion}/signals?$syms');
    final resp = await http.get(url, headers: {'Accept': 'application/json'});
    if (resp.statusCode != 200) {
      throw Exception('Signals fetch failed: ${resp.statusCode} ${resp.body}');
    }
    return jsonDecode(resp.body) as Map<String, dynamic>;
  }
}
