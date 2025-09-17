import 'package:flutter/material.dart';

class MarketSelector extends StatelessWidget {
  final String selectedMarket;
  final Function(String) onMarketChanged;
  
  const MarketSelector({
    Key? key,
    required this.selectedMarket,
    required this.onMarketChanged,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Market Seçimi',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildMarketButton('BIST', 'Borsa İstanbul'),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMarketButton('US', 'NASDAQ/NYSE'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildMarketButton(String market, String label) {
    final isSelected = selectedMarket == market;
    
    return ElevatedButton(
      onPressed: () => onMarketChanged(market),
      style: ElevatedButton.styleFrom(
        backgroundColor: isSelected ? Colors.blue : Colors.grey.shade200,
        foregroundColor: isSelected ? Colors.white : Colors.black,
        padding: const EdgeInsets.symmetric(vertical: 16),
      ),
      child: Column(
        children: [
          Icon(
            market == 'BIST' ? Icons.business : Icons.public,
            size: 24,
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
