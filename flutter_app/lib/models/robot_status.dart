class RobotStatus {
  final String mode;
  final bool isRunning;
  final bool autoTradingEnabled;
  final double currentCapital;
  final double totalProfit;
  final int activePositions;
  final int totalTrades;
  final double winRate;
  final String lastUpdate;
  
  RobotStatus({
    required this.mode,
    required this.isRunning,
    required this.autoTradingEnabled,
    required this.currentCapital,
    required this.totalProfit,
    required this.activePositions,
    required this.totalTrades,
    required this.winRate,
    required this.lastUpdate,
  });
  
  factory RobotStatus.fromJson(Map<String, dynamic> json) {
    return RobotStatus(
      mode: json['mode'] ?? 'UNKNOWN',
      isRunning: json['is_running'] ?? false,
      autoTradingEnabled: json['auto_trading_enabled'] ?? false,
      currentCapital: (json['current_capital'] ?? 0.0).toDouble(),
      totalProfit: (json['total_profit'] ?? 0.0).toDouble(),
      activePositions: json['active_positions'] ?? 0,
      totalTrades: json['total_trades'] ?? 0,
      winRate: (json['win_rate'] ?? 0.0).toDouble(),
      lastUpdate: json['last_update'] ?? DateTime.now().toIso8601String(),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'mode': mode,
      'is_running': isRunning,
      'auto_trading_enabled': autoTradingEnabled,
      'current_capital': currentCapital,
      'total_profit': totalProfit,
      'active_positions': activePositions,
      'total_trades': totalTrades,
      'win_rate': winRate,
      'last_update': lastUpdate,
    };
  }
  
  @override
  String toString() {
    return 'RobotStatus(mode: $mode, isRunning: $isRunning, capital: $currentCapital)';
  }
}
