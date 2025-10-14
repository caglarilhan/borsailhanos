import 'package:flutter/material.dart';
import '../models/robot_status.dart';

class RobotControlPanel extends StatelessWidget {
  final RobotStatus robotStatus;
  final Function(String) onModeChanged;
  final Function(bool) onAutoTradingToggled;
  
  const RobotControlPanel({
    Key? key,
    required this.robotStatus,
    required this.onModeChanged,
    required this.onAutoTradingToggled,
  }) : super(key: key);
  
  factory RobotControlPanel.adapt({
    Key? key,
    required dynamic robotStatus,
    required Function(String) onModeChanged,
    required Function(bool) onAutoTradingToggled,
  }) {
    final RobotStatus normalized = robotStatus is RobotStatus
        ? robotStatus
        : RobotStatus.fromJson(robotStatus as Map<String, dynamic>);
    return RobotControlPanel(
      key: key,
      robotStatus: normalized,
      onModeChanged: onModeChanged,
      onAutoTradingToggled: onAutoTradingToggled,
    );
  }
  
  Color _getModeColor(String mode) {
    switch (mode.toUpperCase()) {
      case 'AGGRESSIVE':
        return Colors.red;
      case 'NORMAL':
        return Colors.blue;
      case 'SAFE':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Robot Durumu Kartı
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        robotStatus.isRunning ? Icons.play_circle : Icons.pause_circle,
                        color: robotStatus.isRunning ? Colors.green : Colors.red,
                        size: 32,
                      ),
                      const SizedBox(width: 12),
                      Flexible(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Trading Robot',
                              style: Theme.of(context).textTheme.headlineSmall,
                            ),
                            Text(
                              robotStatus.isRunning ? 'Çalışıyor' : 'Durduruldu',
                              style: TextStyle(
                                color: robotStatus.isRunning ? Colors.green : Colors.red,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Flexible(
                        child: _buildStatCard(
                          'Mevcut Sermaye',
                          '₺${robotStatus.currentCapital.toStringAsFixed(2)}',
                          Icons.account_balance_wallet,
                          Colors.blue,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Flexible(
                        child: _buildStatCard(
                          'Toplam Kar',
                          '₺${robotStatus.totalProfit.toStringAsFixed(2)}',
                          Icons.trending_up,
                          robotStatus.totalProfit >= 0 ? Colors.green : Colors.red,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Flexible(
                        child: _buildStatCard(
                          'Aktif Pozisyon',
                          '${robotStatus.activePositions}',
                          Icons.open_in_new,
                          Colors.orange,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Flexible(
                        child: _buildStatCard(
                          'Kazanma Oranı',
                          '${(robotStatus.winRate * 100).toStringAsFixed(1)}%',
                          Icons.trending_up,
                          robotStatus.winRate >= 0.5 ? Colors.green : Colors.red,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Robot Modu Seçimi
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Robot Modu',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Flexible(
                        child: _buildModeButton('AGGRESSIVE', 'Agresif'),
                      ),
                      const SizedBox(width: 8),
                      Flexible(
                        child: _buildModeButton('NORMAL', 'Normal'),
                      ),
                      const SizedBox(width: 8),
                      Flexible(
                        child: _buildModeButton('SAFE', 'Güvenli'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Otomatik Trading Kontrolü
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Otomatik Trading',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 12),
                  SwitchListTile(
                    title: const Text('Otomatik Trading'),
                    subtitle: Text(
                      robotStatus.autoTradingEnabled 
                          ? 'Robot otomatik işlem yapıyor'
                          : 'Robot manuel modda',
                    ),
                    value: robotStatus.autoTradingEnabled,
                    onChanged: onAutoTradingToggled,
                    activeColor: Colors.green,
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Son Güncelleme
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  const Icon(Icons.update, color: Colors.grey),
                  const SizedBox(width: 8),
                  Text(
                    'Son güncelleme: ${_formatTimestamp(robotStatus.lastUpdate)}',
                    style: const TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            title,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: color,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
  
  Widget _buildModeButton(String mode, String label) {
    final isSelected = robotStatus.mode.toUpperCase() == mode.toUpperCase();
    final color = _getModeColor(mode);
    
    return ElevatedButton(
      onPressed: () => onModeChanged(mode),
      style: ElevatedButton.styleFrom(
        backgroundColor: isSelected ? color : Colors.grey.shade200,
        foregroundColor: isSelected ? Colors.white : Colors.black,
        padding: const EdgeInsets.symmetric(vertical: 12),
      ),
      child: Text(
        label,
        style: const TextStyle(fontWeight: FontWeight.w600),
      ),
    );
  }
  
  String _formatTimestamp(String timestamp) {
    try {
      final dateTime = DateTime.parse(timestamp);
      return '${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return timestamp;
    }
  }
}
