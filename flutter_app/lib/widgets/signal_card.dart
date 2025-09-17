import 'package:flutter/material.dart';
import '../models/trading_signal.dart';

class SignalCard extends StatelessWidget {
  final TradingSignal signal;
  final VoidCallback? onTap;
  
  const SignalCard({
    Key? key,
    required this.signal,
    this.onTap,
  }) : super(key: key);
  
  Color _getSignalColor(String signalType) {
    switch (signalType.toUpperCase()) {
      case 'BUY':
      case 'STRONG_BUY':
        return Colors.green;
      case 'SELL':
      case 'STRONG_SELL':
        return Colors.red;
      case 'HOLD':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }
  
  IconData _getSignalIcon(String signalType) {
    switch (signalType.toUpperCase()) {
      case 'BUY':
      case 'STRONG_BUY':
        return Icons.trending_up;
      case 'SELL':
      case 'STRONG_SELL':
        return Icons.trending_down;
      case 'HOLD':
        return Icons.horizontal_rule;
      default:
        return Icons.help_outline;
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final signalColor = _getSignalColor(signal.signal);
    final signalIcon = _getSignalIcon(signal.signal);
    
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 4,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(signalIcon, color: signalColor, size: 32),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          signal.symbol,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          signal.signal,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: signalColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: signalColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '${(signal.confidence * 100).toStringAsFixed(1)}%',
                      style: TextStyle(
                        color: signalColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              if (signal.aiSignal != null) ...[
                Row(
                  children: [
                    const Icon(Icons.psychology, size: 16, color: Colors.blue),
                    const SizedBox(width: 8),
                    Text(
                      'AI: ${signal.aiSignal}',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: Colors.blue,
                      ),
                    ),
                    if (signal.aiConfidence != null) ...[
                      const SizedBox(width: 8),
                      Text(
                        '(${(signal.aiConfidence! * 100).toStringAsFixed(1)}%)',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 8),
              ],
              Row(
                children: [
                  const Icon(Icons.access_time, size: 16, color: Colors.grey),
                  const SizedBox(width: 8),
                  Text(
                    _formatTimestamp(signal.timestamp),
                    style: const TextStyle(
                      fontSize: 12,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  String _formatTimestamp(String timestamp) {
    try {
      final dateTime = DateTime.parse(timestamp);
      final now = DateTime.now();
      final difference = now.difference(dateTime);
      
      if (difference.inMinutes < 1) {
        return 'Şimdi';
      } else if (difference.inMinutes < 60) {
        return '${difference.inMinutes} dk önce';
      } else if (difference.inHours < 24) {
        return '${difference.inHours} saat önce';
      } else {
        return '${difference.inDays} gün önce';
      }
    } catch (e) {
      return timestamp;
    }
  }
}
