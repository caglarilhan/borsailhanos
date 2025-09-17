import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'services/api_service.dart';
import 'services/notification_service.dart';
import 'models/trading_signal.dart';
import 'models/robot_status.dart';
import 'widgets/signal_card.dart';
import 'widgets/robot_control_panel.dart';
import 'widgets/performance_chart.dart';
import 'widgets/market_selector.dart';

class AdvancedTradingDashboard extends StatefulWidget {
  const AdvancedTradingDashboard({Key? key}) : super(key: key);

  @override
  State<AdvancedTradingDashboard> createState() => _AdvancedTradingDashboardState();
}

class _AdvancedTradingDashboardState extends State<AdvancedTradingDashboard>
    with TickerProviderStateMixin {
  
  late TabController _tabController;
  String _selectedMarket = 'BIST';
  List<TradingSignal> _signals = [];
  RobotStatus? _robotStatus;
  bool _isLoading = false;
  String? _fcmToken;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _initializeApp();
  }
  
  Future<void> _initializeApp() async {
    // Notification service başlat
    await NotificationService.initialize();
    
    // FCM token al
    _fcmToken = await NotificationService.getFCMToken();
    print('📱 FCM Token: $_fcmToken');
    
    // Topic'lere abone ol
    await NotificationService.subscribeToTopic('bist_signals');
    await NotificationService.subscribeToTopic('us_signals');
    await NotificationService.subscribeToTopic('robot_alerts');
    
    // İlk veri yükle
    await _loadData();
    
    // Periyodik güncelleme başlat
    _startPeriodicUpdates();
  }
  
  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    
    try {
      // Sinyalleri yükle
      final signalsData = await ApiService.getSignals(market: _selectedMarket);
      if (signalsData.containsKey('signals')) {
        _signals = (signalsData['signals'] as Map<String, dynamic>)
            .entries
            .map((e) => TradingSignal.fromJson(e.key, e.value))
            .toList();
      }
      
      // Robot durumunu yükle
      final robotData = await ApiService.getRobotStatus();
      if (!robotData.containsKey('error')) {
        _robotStatus = RobotStatus.fromJson(robotData);
      }
      
    } catch (e) {
      print('❌ Veri yükleme hatası: $e');
      _showErrorSnackBar('Veri yüklenemedi: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }
  
  void _startPeriodicUpdates() {
    // Her 30 saniyede bir güncelle
    Future.delayed(const Duration(seconds: 30), () {
      if (mounted) {
        _loadData();
        _startPeriodicUpdates();
      }
    });
  }
  
  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        duration: const Duration(seconds: 3),
      ),
    );
  }
  
  void _showSuccessSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 2),
      ),
    );
  }
  
  Future<void> _onMarketChanged(String market) async {
    setState(() => _selectedMarket = market);
    await _loadData();
  }
  
  Future<void> _onRefresh() async {
    await _loadData();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('BIST AI Smart Trader'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _onRefresh,
          ),
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {
              NotificationService.showLocalNotification(
                title: 'Test Bildirimi',
                body: 'BIST AI test bildirimi',
              );
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.trending_up), text: 'Sinyaller'),
            Tab(icon: Icon(Icons.smart_toy), text: 'Robot'),
            Tab(icon: Icon(Icons.analytics), text: 'Performans'),
            Tab(icon: Icon(Icons.settings), text: 'Ayarlar'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildSignalsTab(),
                _buildRobotTab(),
                _buildPerformanceTab(),
                _buildSettingsTab(),
              ],
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _onRefresh,
        child: const Icon(Icons.refresh),
      ),
    );
  }
  
  Widget _buildSignalsTab() {
    return Column(
      children: [
        MarketSelector(
          selectedMarket: _selectedMarket,
          onMarketChanged: _onMarketChanged,
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: _onRefresh,
            child: _signals.isEmpty
                ? const Center(
                    child: Text(
                      'Henüz sinyal bulunamadı.\nYenilemek için aşağı çekin.',
                      textAlign: TextAlign.center,
                    ),
                  )
                : ListView.builder(
                    itemCount: _signals.length,
                    itemBuilder: (context, index) {
                      return SignalCard(
                        signal: _signals[index],
                        onTap: () {
                          // Sinyal detayına git
                          _showSignalDetails(_signals[index]);
                        },
                      );
                    },
                  ),
          ),
        ),
      ],
    );
  }
  
  Widget _buildRobotTab() {
    return _robotStatus != null
        ? RobotControlPanel(
            robotStatus: _robotStatus!,
            onModeChanged: (mode) async {
              final result = await ApiService.changeRobotMode(mode);
              if (!result.containsKey('error')) {
                _showSuccessSnackBar('Robot modu değiştirildi: $mode');
                await _loadData();
              } else {
                _showErrorSnackBar('Robot modu değiştirilemedi');
              }
            },
            onAutoTradingToggled: (enabled) async {
              final result = await ApiService.toggleAutoTrading(enabled);
              if (!result.containsKey('error')) {
                _showSuccessSnackBar(
                  enabled ? 'Otomatik trading başlatıldı' : 'Otomatik trading durduruldu',
                );
                await _loadData();
              } else {
                _showErrorSnackBar('Otomatik trading değiştirilemedi');
              }
            },
          )
        : const Center(
            child: Text('Robot durumu yüklenemedi'),
          );
  }
  
  Widget _buildPerformanceTab() {
    return const PerformanceChart();
  }
  
  Widget _buildSettingsTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: ListTile(
            leading: const Icon(Icons.notifications),
            title: const Text('Bildirimler'),
            subtitle: const Text('Push notification ayarları'),
            trailing: const Icon(Icons.arrow_forward_ios),
            onTap: () {
              // Bildirim ayarları sayfasına git
            },
          ),
        ),
        Card(
          child: ListTile(
            leading: const Icon(Icons.security),
            title: const Text('Güvenlik'),
            subtitle: const Text('API anahtarları ve güvenlik'),
            trailing: const Icon(Icons.arrow_forward_ios),
            onTap: () {
              // Güvenlik ayarları sayfasına git
            },
          ),
        ),
        Card(
          child: ListTile(
            leading: const Icon(Icons.info),
            title: const Text('Hakkında'),
            subtitle: const Text('Uygulama bilgileri'),
            trailing: const Icon(Icons.arrow_forward_ios),
            onTap: () {
              _showAboutDialog();
            },
          ),
        ),
        if (_fcmToken != null)
          Card(
            child: ListTile(
              leading: const Icon(Icons.token),
              title: const Text('FCM Token'),
              subtitle: Text(_fcmToken!),
              trailing: IconButton(
                icon: const Icon(Icons.copy),
                onPressed: () {
                  Clipboard.setData(ClipboardData(text: _fcmToken!));
                  _showSuccessSnackBar('Token kopyalandı');
                },
              ),
            ),
          ),
      ],
    );
  }
  
  void _showSignalDetails(TradingSignal signal) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(signal.symbol),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Sinyal: ${signal.signal}'),
            Text('Güven: ${(signal.confidence * 100).toStringAsFixed(1)}%'),
            if (signal.aiSignal != null)
              Text('AI Sinyal: ${signal.aiSignal}'),
            if (signal.aiConfidence != null)
              Text('AI Güven: ${(signal.aiConfidence! * 100).toStringAsFixed(1)}%'),
            Text('Zaman: ${signal.timestamp}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Kapat'),
          ),
        ],
      ),
    );
  }
  
  void _showAboutDialog() {
    showAboutDialog(
      context: context,
      applicationName: 'BIST AI Smart Trader',
      applicationVersion: '2.0.0',
      applicationLegalese: '© 2025 BIST AI',
      children: [
        const Text('Gelişmiş AI destekli trading asistanı'),
        const SizedBox(height: 16),
        const Text('Özellikler:'),
        const Text('• Gerçek zamanlı sinyal analizi'),
        const Text('• Otomatik trading robotu'),
        const Text('• US Market entegrasyonu'),
        const Text('• Push notification sistemi'),
        const Text('• Performans takibi'),
      ],
    );
  }
  
  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
}
