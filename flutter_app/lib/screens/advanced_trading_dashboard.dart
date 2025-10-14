import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';
import '../services/api_service.dart';
import '../services/notification_service.dart';
import '../services/websocket_service.dart';
import '../services/yapikredi_service.dart';
import '../services/social_trading_service.dart';
import '../services/paper_trading_service.dart';
import '../services/technical_analysis_service.dart';
import '../services/ai_models_service.dart';
import '../services/watchlist_service.dart';
import '../services/crypto_service.dart';
import '../services/education_service.dart';
import '../services/god_mode_service.dart';
import '../services/xai_service.dart';
import '../services/backtesting_service.dart';
import '../services/macro_regime_service.dart';
import '../services/freemium_service.dart';
import '../models/trading_signal.dart';
import '../models/robot_status.dart';
import '../widgets/signal_card.dart';
import '../widgets/robot_control_panel.dart';
import '../widgets/performance_chart.dart';
import '../widgets/market_selector.dart';

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
  final WebSocketService _websocketService = WebSocketService();
  Map<String, dynamic> _realtimePrices = {};
  StreamSubscription? _websocketSubscription;
  List<Map<String, dynamic>> _bistIndices = [];
  List<Map<String, dynamic>> _bist100Stocks = [];
  List<Map<String, dynamic>> _topTraders = [];
  List<Map<String, dynamic>> _socialFeed = [];
  Map<String, dynamic> _paperPortfolio = {};
  List<Map<String, dynamic>> _leaderboard = [];
  
  // AI Models state
  Map<String, dynamic> _aiModelStatus = {};
  Map<String, dynamic> _ensembleSignal = {};
  bool _isTrainingAI = false;
  
  // Watchlist & Portfolio state
  List<Map<String, dynamic>> _watchlists = [];
  List<Map<String, dynamic>> _portfolios = [];
  
  // Crypto state
  List<Map<String, dynamic>> _cryptoList = [];
  List<Map<String, dynamic>> _trendingCryptos = [];
  Map<String, List<Map<String, dynamic>>> _cryptoGainersLosers = {};
  
  // Education state
  List<Map<String, dynamic>> _courses = [];
  List<Map<String, dynamic>> _articles = [];
  Map<String, dynamic> _userProgress = {};
  
  // God Mode state
  Map<String, dynamic> _godModeData = {};
  bool _isGodModeActive = false;
  String? _fcmToken;
  
  // XAI data
  Map<String, dynamic>? _xaiData;
  
  // Backtesting data
  Map<String, dynamic>? _backtestingData;
  
  // Macro regime data
  Map<String, dynamic>? _macroRegimeData;
  
  // Freemium data
  Map<String, dynamic>? _freemiumData;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
    _initializeApp();
  }
  
  Future<void> _initializeApp() async {
    // Notification service başlat
    await NotificationService.initialize();
    
    // FCM token al
    _fcmToken = await NotificationService.getFCMToken();
    print('📱 FCM Token: $_fcmToken');
    
    // WebSocket bağlantısı
    await _initializeWebSocket();
    
    // Topic'lere abone ol
    await NotificationService.subscribeToTopic('bist_signals');
    await NotificationService.subscribeToTopic('us_signals');
    await NotificationService.subscribeToTopic('robot_alerts');
    
    // İlk veri yükle
    await _loadData();
    await _loadYapiKrediData();
    await _loadSocialTradingData();
    await _loadPaperTradingData();
    await _loadAIModelsData();
    await _loadWatchlistData();
    await _loadCryptoData();
    await _loadEducationData();
    await _loadGodModeData();
    await _loadXAIData();
    await _loadBacktestingData();
    await _loadMacroRegimeData();
    await _loadFreemiumData();
    
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
          PopupMenuButton<String>(
            onSelected: (value) async {
              if (value == 'logout') {
                await _logout();
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(Icons.logout, color: Colors.red),
                    SizedBox(width: 8),
                    Text('Çıkış Yap'),
                  ],
                ),
              ),
            ],
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.trending_up), text: 'Sinyaller'),
            Tab(icon: Icon(Icons.smart_toy), text: 'Robot'),
            Tab(icon: Icon(Icons.analytics), text: 'Performans'),
            Tab(icon: Icon(Icons.psychology), text: 'AI Analiz'),
            Tab(icon: Icon(Icons.settings), text: 'Ayarlar'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RepaintBoundary(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildSignalsTab(),
                  _buildRobotTab(),
                  _buildPerformanceTab(),
                  _buildAIAnalysisTab(),
                  _buildSettingsTab(),
                ],
              ),
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
        
        // BIST Endeksleri Kartı (Yapı Kredi)
        if (_selectedMarket == 'BIST' && _bistIndices.isNotEmpty)
          Container(
            margin: const EdgeInsets.all(16),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.trending_up, color: Colors.blue),
                        const SizedBox(width: 8),
                        const Text(
                          'BIST Endeksleri',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.blue.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text(
                            'Yapı Kredi',
                            style: TextStyle(fontSize: 12, color: Colors.blue),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ...(_bistIndices.map((index) => _buildIndexRow(index))),
                  ],
                ),
              ),
            ),
          ),
        
        // Özet kartı ekle
        if (_signals.isNotEmpty) _buildSummaryCard(),
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
                        final signal = _signals[index];
                        return SignalCard(
                          signal: signal,
                          realtimePrice: _realtimePrices[signal.symbol],
                          onTap: () {
                            // Sinyal detayına git
                            _showSignalDetails(signal);
                          },
                        );
                      },
                  ),
          ),
        ),
      ],
    );
  }
  
  Widget _buildIndexRow(Map<String, dynamic> index) {
    final name = index['name'] ?? 'N/A';
    final value = index['value'] ?? 0.0;
    final change = index['change'] ?? 0.0;
    
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Expanded(
            child: Text(
              name,
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Text(
            value.toStringAsFixed(2),
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: change >= 0 ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              '${change >= 0 ? '+' : ''}${change.toStringAsFixed(2)}%',
              style: TextStyle(
                color: change >= 0 ? Colors.green : Colors.red,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildSummaryCard() {
    final buySignals = _signals.where((s) => s.signal == 'BUY').length;
    final sellSignals = _signals.where((s) => s.signal == 'SELL').length;
    final holdSignals = _signals.where((s) => s.signal == 'HOLD').length;
    final avgConfidence = _signals.isNotEmpty 
        ? _signals.map((s) => s.confidence).reduce((a, b) => a + b) / _signals.length 
        : 0.0;
    
    return Container(
      margin: const EdgeInsets.all(8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '📊 ${_selectedMarket} Market Özeti',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildSummaryItem('🟢 BUY', buySignals, Colors.green),
              ),
              Expanded(
                child: _buildSummaryItem('🔴 SELL', sellSignals, Colors.red),
              ),
              Expanded(
                child: _buildSummaryItem('🟡 HOLD', holdSignals, Colors.orange),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Toplam Sinyal: ${_signals.length}',
                style: Theme.of(context).textTheme.bodySmall,
              ),
              Text(
                'Ort. Güven: ${(avgConfidence * 100).toStringAsFixed(1)}%',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: avgConfidence > 0.7 ? Colors.green : Colors.orange,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
  
  Widget _buildSummaryItem(String label, int count, Color color) {
    return Column(
      children: [
        Text(
          count.toString(),
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: color,
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
  
  Widget _buildAIAnalysisTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Seçenek Analizi Kartı
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.psychology, color: Colors.blue),
                    const SizedBox(width: 8),
                    const Text(
                      'Seçenek Analizi',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Text('US Market seçenekleri için gelişmiş analiz'),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: () => _showOptionsAnalysis(),
                  icon: const Icon(Icons.analytics),
                  label: const Text('Seçenek Analizi Başlat'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
        
        const SizedBox(height: 16),
        
        // Toplu Analiz Kartı
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.select_all, color: Colors.green),
                    const SizedBox(width: 8),
                    const Text(
                      'Toplu Analiz',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Text('Birden fazla hisseyi seçerek toplu analiz yapın'),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _showBulkAnalysis(),
                        icon: const Icon(Icons.analytics),
                        label: const Text('Toplu Analiz'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _showStockSelector(),
                        icon: const Icon(Icons.checklist),
                        label: const Text('Hisse Seç'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.orange,
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        
        const SizedBox(height: 16),
        
        // AI Özellikler Kartı
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.auto_awesome, color: Colors.purple),
                    const SizedBox(width: 8),
                    const Text(
                      'AI Özellikler',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _buildAIFeature('🧠', 'Kapsamlı Analiz', 'RSI, MACD, Bollinger Bands, Volatilite'),
                _buildAIFeature('📊', 'Seçenek Analizi', 'Implied Volatility, Put/Call Ratio, Max Pain'),
                _buildAIFeature('🎯', 'AI Skoru', '0-100 arası yapay zeka puanlama'),
                _buildAIFeature('⚠️', 'Risk Analizi', 'Yüksek/Orta/Düşük risk seviyeleri'),
                _buildAIFeature('📈', 'Trend Tespiti', 'Bullish/Bearish trend analizi'),
              ],
            ),
          ),
        ),
      ],
    );
  }
  
  Widget _buildAIFeature(String emoji, String title, String description) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 20)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                Text(
                  description,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildSocialTradingTab() {
    return Column(
      children: [
        // En iyi trader'lar
        if (_topTraders.isNotEmpty)
          Container(
            margin: const EdgeInsets.all(16),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.people, color: Colors.blue),
                        const SizedBox(width: 8),
                        const Text(
                          'En İyi Trader\'lar',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.blue.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text(
                            'Sosyal Trading',
                            style: TextStyle(fontSize: 12, color: Colors.blue),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ...(_topTraders.map((trader) => _buildTraderRow(trader))),
                  ],
                ),
              ),
            ),
          ),
        
        // Sosyal feed
        if (_socialFeed.isNotEmpty)
          Expanded(
            child: ListView.builder(
              itemCount: _socialFeed.length,
              itemBuilder: (context, index) {
                final feedItem = _socialFeed[index];
                return _buildFeedItem(feedItem);
              },
            ),
          ),
      ],
    );
  }

  Widget _buildTraderRow(Map<String, dynamic> trader) {
    final name = trader['name'] ?? 'N/A';
    final avatar = trader['avatar'] ?? '👤';
    final followers = trader['followers_count'] ?? 0;
    final winRate = trader['win_rate'] ?? 0.0;
    final totalReturn = trader['total_return'] ?? 0.0;
    final verified = trader['verified'] ?? false;
    
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Text(avatar, style: const TextStyle(fontSize: 24)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      name,
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    if (verified) ...[
                      const SizedBox(width: 4),
                      const Icon(Icons.verified, size: 16, color: Colors.blue),
                    ],
                  ],
                ),
                Text(
                  '${followers.toString()} takipçi • ${(winRate * 100).toStringAsFixed(1)}% başarı',
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${(totalReturn * 100).toStringAsFixed(1)}%',
                style: TextStyle(
                  color: totalReturn >= 0 ? Colors.green : Colors.red,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.blue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'Takip Et',
                  style: TextStyle(fontSize: 12, color: Colors.blue),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFeedItem(Map<String, dynamic> feedItem) {
    final traderName = feedItem['trader_name'] ?? 'N/A';
    final traderAvatar = feedItem['trader_avatar'] ?? '👤';
    final content = feedItem['content'] ?? '';
    final symbol = feedItem['symbol'] ?? '';
    final action = feedItem['action'] ?? '';
    final likes = feedItem['likes'] ?? 0;
    final comments = feedItem['comments'] ?? 0;
    final verified = feedItem['verified'] ?? false;
    
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(traderAvatar, style: const TextStyle(fontSize: 24)),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            traderName,
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                          if (verified) ...[
                            const SizedBox(width: 4),
                            const Icon(Icons.verified, size: 16, color: Colors.blue),
                          ],
                        ],
                      ),
                      Text(
                        '$symbol • $action',
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ),
                Text(
                  '${DateTime.now().hour}:${DateTime.now().minute}',
                  style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(content),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(Icons.favorite_border, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 4),
                Text('$likes', style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                const SizedBox(width: 16),
                Icon(Icons.comment_outlined, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 4),
                Text('$comments', style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                const Spacer(),
                Icon(Icons.share_outlined, size: 16, color: Colors.grey[600]),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaperTradingTab() {
    return Column(
      children: [
        // Portföy özeti
        if (_paperPortfolio.isNotEmpty)
          Container(
            margin: const EdgeInsets.all(16),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.account_balance, color: Colors.green),
                        const SizedBox(width: 8),
                        const Text(
                          'Paper Trading Portföyü',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.green.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text(
                            'Sanal',
                            style: TextStyle(fontSize: 12, color: Colors.green),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: _buildPortfolioMetric(
                            'Toplam Değer',
                            '₺${(_paperPortfolio['total_value'] ?? 0).toStringAsFixed(0)}',
                            Colors.blue,
                          ),
                        ),
                        Expanded(
                          child: _buildPortfolioMetric(
                            'Nakit',
                            '₺${(_paperPortfolio['cash'] ?? 0).toStringAsFixed(0)}',
                            Colors.grey,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _buildPortfolioMetric(
                            'Toplam Getiri',
                            '${((_paperPortfolio['total_return'] ?? 0) * 100).toStringAsFixed(1)}%',
                            (_paperPortfolio['total_return'] ?? 0) >= 0 ? Colors.green : Colors.red,
                          ),
                        ),
                        Expanded(
                          child: _buildPortfolioMetric(
                            'Günlük Getiri',
                            '${((_paperPortfolio['daily_return'] ?? 0) * 100).toStringAsFixed(1)}%',
                            (_paperPortfolio['daily_return'] ?? 0) >= 0 ? Colors.green : Colors.red,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        
        // Leaderboard
        if (_leaderboard.isNotEmpty)
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      const Icon(Icons.emoji_events, color: Colors.amber),
                      const SizedBox(width: 8),
                      const Text(
                        'Leaderboard',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                Expanded(
                  child: ListView.builder(
                    itemCount: _leaderboard.length,
                    itemBuilder: (context, index) {
                      final item = _leaderboard[index];
                      return _buildLeaderboardItem(item, index + 1);
                    },
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildPortfolioMetric(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildLeaderboardItem(Map<String, dynamic> item, int rank) {
    final totalReturn = item['total_return'] ?? 0.0;
    final portfolioValue = item['portfolio_value'] ?? 0.0;
    final winRate = item['win_rate'] ?? 0.0;
    
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: rank <= 3 ? Colors.amber : Colors.grey[300],
                borderRadius: BorderRadius.circular(16),
              ),
              child: Center(
                child: Text(
                  rank.toString(),
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: rank <= 3 ? Colors.white : Colors.black,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'User ${item['user_id']}',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  Text(
                    '₺${portfolioValue.toStringAsFixed(0)} • ${(winRate * 100).toStringAsFixed(1)}% başarı',
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
            Text(
              '${(totalReturn * 100).toStringAsFixed(1)}%',
              style: TextStyle(
                color: totalReturn >= 0 ? Colors.green : Colors.red,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTechnicalAnalysisTab() {
    return Column(
      children: [
        // Teknik analiz özeti
        Container(
          margin: const EdgeInsets.all(16),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.analytics, color: Colors.purple),
                      const SizedBox(width: 8),
                      const Text(
                        'Gelişmiş Teknik Analiz',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.purple.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          '50+ İndikatör',
                          style: TextStyle(fontSize: 12, color: Colors.purple),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Trend Analizi',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: _buildIndicatorCard('SMA', 'Yükseliş', Colors.green),
                      ),
                      Expanded(
                        child: _buildIndicatorCard('EMA', 'Yükseliş', Colors.green),
                      ),
                      Expanded(
                        child: _buildIndicatorCard('MACD', 'Pozitif', Colors.blue),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _buildIndicatorCard('RSI', 'Aşırı Alım', Colors.orange),
                      ),
                      Expanded(
                        child: _buildIndicatorCard('Bollinger', 'Daralma', Colors.purple),
                      ),
                      Expanded(
                        child: _buildIndicatorCard('Volume', 'Yüksek', Colors.red),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
        
        // İndikatör listesi
        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: [
              _buildIndicatorSection('Trend İndikatörleri', [
                'Simple Moving Average (SMA)',
                'Exponential Moving Average (EMA)',
                'Weighted Moving Average (WMA)',
                'Triangular Moving Average (TMA)',
                'Kaufman Adaptive Moving Average (KAMA)',
                'Variable Index Dynamic Average (VIDYA)',
              ]),
              _buildIndicatorSection('Momentum İndikatörleri', [
                'Relative Strength Index (RSI)',
                'Stochastic Oscillator',
                'Williams %R',
                'Rate of Change (ROC)',
                'Commodity Channel Index (CCI)',
                'Money Flow Index (MFI)',
              ]),
              _buildIndicatorSection('Volatilite İndikatörleri', [
                'Bollinger Bands',
                'Average True Range (ATR)',
                'Standard Deviation',
                'Donchian Channels',
                'Keltner Channels',
                'Volatility Index',
              ]),
              _buildIndicatorSection('Volume İndikatörleri', [
                'Volume Weighted Average Price (VWAP)',
                'On Balance Volume (OBV)',
                'Accumulation/Distribution Line',
                'Chaikin Money Flow',
                'Volume Rate of Change',
                'Ease of Movement',
              ]),
              _buildIndicatorSection('Oscillator İndikatörleri', [
                'MACD (Moving Average Convergence Divergence)',
                'MACD Signal',
                'MACD Histogram',
                'Ultimate Oscillator',
                'Awesome Oscillator',
                'Percentage Price Oscillator (PPO)',
              ]),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAIModelsTab() {
    return Column(
      children: [
        // AI Model durumu
        Container(
          margin: const EdgeInsets.all(16),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.auto_awesome, color: Colors.deepPurple),
                      const SizedBox(width: 8),
                      const Text(
                        'Gelişmiş AI Modelleri',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.deepPurple.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '${_aiModelStatus['models_count'] ?? 0}/3 Aktif',
                          style: const TextStyle(fontSize: 12, color: Colors.deepPurple),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Model durumları
                  Row(
                    children: [
                      Expanded(
                        child: _buildModelStatusCard(
                          'LightGBM',
                          _aiModelStatus['lightgbm_trained'] ?? false,
                          Colors.blue,
                        ),
                      ),
                      Expanded(
                        child: _buildModelStatusCard(
                          'LSTM',
                          _aiModelStatus['lstm_trained'] ?? false,
                          Colors.green,
                        ),
                      ),
                      Expanded(
                        child: _buildModelStatusCard(
                          'TimeGPT',
                          _aiModelStatus['timegpt_trained'] ?? false,
                          Colors.orange,
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Eğitim butonu
                  ElevatedButton.icon(
                    onPressed: _isTrainingAI ? null : _trainAIModels,
                    icon: _isTrainingAI 
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.play_arrow),
                    label: Text(_isTrainingAI ? 'Eğitiliyor...' : 'Modelleri Eğit'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.deepPurple,
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 48),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        
        // Ensemble sinyal
        if (_ensembleSignal.isNotEmpty)
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.psychology, color: Colors.purple),
                        const SizedBox(width: 8),
                        const Text(
                          'Ensemble AI Sinyali',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: _getSignalColor(_ensembleSignal['action'] ?? 'HOLD').withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            _ensembleSignal['action'] ?? 'HOLD',
                            style: TextStyle(
                              fontSize: 12,
                              color: _getSignalColor(_ensembleSignal['action'] ?? 'HOLD'),
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    
                    Row(
                      children: [
                        Expanded(
                          child: _buildSignalMetric(
                            'Güven',
                            '${((_ensembleSignal['confidence'] ?? 0) * 100).toStringAsFixed(1)}%',
                            Colors.blue,
                          ),
                        ),
                        Expanded(
                          child: _buildSignalMetric(
                            'Tahmin',
                            '${((_ensembleSignal['prediction'] ?? 0) * 100).toStringAsFixed(2)}%',
                            Colors.green,
                          ),
                        ),
                        Expanded(
                          child: _buildSignalMetric(
                            'Sembol',
                            _ensembleSignal['symbol'] ?? 'N/A',
                            Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        
        // AI model detayları
        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: [
              _buildAIModelSection('LightGBM', 'Gradient Boosting', [
                'Yüksek performanslı gradient boosting',
                'Otomatik özellik seçimi',
                'Overfitting koruması',
                'Hızlı eğitim süresi',
              ]),
              _buildAIModelSection('LSTM', 'Deep Learning', [
                'Zaman serisi tahmini',
                'Uzun vadeli bağımlılıklar',
                'Sıralı veri analizi',
                'Non-linear pattern tespiti',
              ]),
              _buildAIModelSection('TimeGPT', 'Transformer', [
                'Çok değişkenli tahmin',
                'Attention mechanism',
                'Scalable architecture',
                'State-of-the-art accuracy',
              ]),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildIndicatorCard(String name, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(8),
      margin: const EdgeInsets.symmetric(horizontal: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Text(
            name,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 10,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIndicatorSection(String title, List<String> indicators) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        children: indicators.map((indicator) => ListTile(
          dense: true,
          title: Text(
            indicator,
            style: const TextStyle(fontSize: 14),
          ),
          trailing: const Icon(Icons.arrow_forward_ios, size: 16),
          onTap: () {
            // İndikatör detay sayfasına git
          },
        )).toList(),
      ),
    );
  }

  Widget _buildModelStatusCard(String name, bool isTrained, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      margin: const EdgeInsets.symmetric(horizontal: 4),
      decoration: BoxDecoration(
        color: isTrained ? color.withOpacity(0.1) : Colors.grey.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isTrained ? color : Colors.grey,
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Icon(
            isTrained ? Icons.check_circle : Icons.circle_outlined,
            color: isTrained ? color : Colors.grey,
            size: 24,
          ),
          const SizedBox(height: 8),
          Text(
            name,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: isTrained ? color : Colors.grey,
            ),
          ),
          Text(
            isTrained ? 'Aktif' : 'Pasif',
            style: TextStyle(
              fontSize: 10,
              color: isTrained ? color : Colors.grey,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSignalMetric(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildAIModelSection(String title, String subtitle, List<String> features) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
        ),
        children: features.map((feature) => ListTile(
          dense: true,
          leading: const Icon(Icons.check_circle_outline, size: 16, color: Colors.green),
          title: Text(
            feature,
            style: const TextStyle(fontSize: 14),
          ),
        )).toList(),
      ),
    );
  }

  Color _getSignalColor(String action) {
    switch (action.toUpperCase()) {
      case 'BUY':
        return Colors.green;
      case 'SELL':
        return Colors.red;
      case 'HOLD':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  Future<void> _trainAIModels() async {
    setState(() {
      _isTrainingAI = true;
    });

    try {
      final result = await AIModelsService.trainModelsForWidget(
        symbol: 'AAPL',
        period: '1y',
      );

      if (result['success'] == true) {
        // Başarılı eğitim sonrası verileri yenile
        await _loadAIModelsData();
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('AI modelleri başarıyla eğitildi! ${result['trained_models']} model aktif.'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('AI model eğitimi başarısız: ${result['error'] ?? 'Bilinmeyen hata'}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('AI model eğitimi hatası: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() {
        _isTrainingAI = false;
      });
    }
  }

  Widget _buildWatchlistTab() {
    return Column(
      children: [
        // Watchlist özeti
        Container(
          margin: const EdgeInsets.all(16),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.list, color: Colors.blue),
                      const SizedBox(width: 8),
                      const Text(
                        'Watchlist Yönetimi',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.blue.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '${_watchlists.length} Liste',
                          style: const TextStyle(fontSize: 12, color: Colors.blue),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Watchlist listesi
                  ...(_watchlists.map((watchlist) => _buildWatchlistItem(watchlist))),
                  
                  const SizedBox(height: 16),
                  
                  // Yeni watchlist butonu
                  ElevatedButton.icon(
                    onPressed: _createNewWatchlist,
                    icon: const Icon(Icons.add),
                    label: const Text('Yeni Watchlist'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 48),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        
        // Watchlist detayları
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _watchlists.length,
            itemBuilder: (context, index) {
              final watchlist = _watchlists[index];
              return _buildWatchlistDetailCard(watchlist);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildPortfolioTab() {
    return Column(
      children: [
        // Portfolio özeti
        Container(
          margin: const EdgeInsets.all(16),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.account_balance_wallet, color: Colors.green),
                      const SizedBox(width: 8),
                      const Text(
                        'Portfolio Yönetimi',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.green.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '${_portfolios.length} Portfolio',
                          style: const TextStyle(fontSize: 12, color: Colors.green),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Portfolio listesi
                  ...(_portfolios.map((portfolio) => _buildPortfolioItem(portfolio))),
                  
                  const SizedBox(height: 16),
                  
                  // Yeni portfolio butonu
                  ElevatedButton.icon(
                    onPressed: _createNewPortfolio,
                    icon: const Icon(Icons.add),
                    label: const Text('Yeni Portfolio'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 48),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        
        // Portfolio detayları
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _portfolios.length,
            itemBuilder: (context, index) {
              final portfolio = _portfolios[index];
              return _buildPortfolioDetailCard(portfolio);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildCryptoTab() {
    return Column(
      children: [
        // Crypto özeti
        Container(
          margin: const EdgeInsets.all(16),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.currency_bitcoin, color: Colors.orange),
                      const SizedBox(width: 8),
                      const Text(
                        'Kripto Para Takibi',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.orange.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '${_cryptoList.length} Crypto',
                          style: const TextStyle(fontSize: 12, color: Colors.orange),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Trending crypto'lar
                  if (_trendingCryptos.isNotEmpty) ...[
                    const Text(
                      'Trending Crypto\'lar',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      height: 120,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: _trendingCryptos.length,
                        itemBuilder: (context, index) {
                          final crypto = _trendingCryptos[index];
                          return _buildCryptoCard(crypto);
                        },
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
        
        // Crypto listesi
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _cryptoList.length,
            itemBuilder: (context, index) {
              final crypto = _cryptoList[index];
              return _buildCryptoListItem(crypto);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildEducationTab() {
    return Column(
      children: [
        // Eğitim özeti
        Container(
          margin: const EdgeInsets.all(16),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.school, color: Colors.purple),
                      const SizedBox(width: 8),
                      const Text(
                        'Eğitim Merkezi',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.purple.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '${_courses.length} Kurs',
                          style: const TextStyle(fontSize: 12, color: Colors.purple),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Kullanıcı ilerlemesi
                  if (_userProgress.isNotEmpty) ...[
                    Row(
                      children: [
                        Expanded(
                          child: _buildProgressMetric(
                            'Tamamlanan Kurslar',
                            '${_userProgress['courses_completed'] ?? 0}',
                            Colors.blue,
                          ),
                        ),
                        Expanded(
                          child: _buildProgressMetric(
                            'Quiz Skoru',
                            '${(_userProgress['total_score'] ?? 0).toStringAsFixed(0)}%',
                            Colors.green,
                          ),
                        ),
                        Expanded(
                          child: _buildProgressMetric(
                            'Başarımlar',
                            '${(_userProgress['achievements'] ?? []).length}',
                            Colors.orange,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                  ],
                  
                  // Kurs listesi
                  const Text(
                    'Kurslar',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                ],
              ),
            ),
          ),
        ),
        
        // Kurs ve makale listesi
        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: [
              // Kurslar
              ...(_courses.map((course) => _buildCourseCard(course))),
              
              const SizedBox(height: 16),
              
              // Makaleler
              const Text(
                'Son Makaleler',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              ...(_articles.map((article) => _buildArticleCard(article))),
            ],
          ),
        ),
      ],
    );
  }

  // Watchlist helper widgets
  Widget _buildWatchlistItem(Map<String, dynamic> watchlist) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.blue.withOpacity(0.05),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.blue.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          const Icon(Icons.list, color: Colors.blue, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  watchlist['name'] ?? 'Watchlist',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                Text(
                  '${watchlist['symbols']?.length ?? 0} sembol',
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () => _deleteWatchlist(watchlist['id']),
            icon: const Icon(Icons.delete, color: Colors.red, size: 20),
          ),
        ],
      ),
    );
  }

  Widget _buildWatchlistDetailCard(Map<String, dynamic> watchlist) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.list, color: Colors.blue),
                const SizedBox(width: 8),
                Text(
                  watchlist['name'] ?? 'Watchlist',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${watchlist['symbols']?.length ?? 0} sembol',
                    style: const TextStyle(fontSize: 12, color: Colors.blue),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            
            // Sembol listesi
            if (watchlist['symbols'] != null && watchlist['symbols'].isNotEmpty) ...[
              const Text(
                'Semboller:',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: (watchlist['symbols'] as List).map((symbol) => 
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.blue.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      symbol,
                      style: const TextStyle(fontSize: 12, color: Colors.blue),
                    ),
                  ),
                ).toList(),
              ),
            ] else ...[
              const Text(
                'Henüz sembol eklenmemiş',
                style: TextStyle(color: Colors.grey),
              ),
            ],
          ],
        ),
      ),
    );
  }

  // Portfolio helper widgets
  Widget _buildPortfolioItem(Map<String, dynamic> portfolio) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.green.withOpacity(0.05),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.green.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          const Icon(Icons.account_balance_wallet, color: Colors.green, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  portfolio['name'] ?? 'Portfolio',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                Text(
                  'Toplam: \$${(portfolio['total_value'] ?? 0).toStringAsFixed(2)}',
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () => _deletePortfolio(portfolio['id']),
            icon: const Icon(Icons.delete, color: Colors.red, size: 20),
          ),
        ],
      ),
    );
  }

  Widget _buildPortfolioDetailCard(Map<String, dynamic> portfolio) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.account_balance_wallet, color: Colors.green),
                const SizedBox(width: 8),
                Text(
                  portfolio['name'] ?? 'Portfolio',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '\$${(portfolio['total_value'] ?? 0).toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 12, color: Colors.green),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            
            // Portfolio detayları
            Row(
              children: [
                Expanded(
                  child: _buildPortfolioMetric(
                    'Toplam Değer',
                    '\$${(portfolio['total_value'] ?? 0).toStringAsFixed(2)}',
                    Colors.green,
                  ),
                ),
                Expanded(
                  child: _buildPortfolioMetric(
                    'Günlük Değişim',
                    '${(portfolio['daily_change'] ?? 0).toStringAsFixed(2)}%',
                    (portfolio['daily_change'] ?? 0) >= 0 ? Colors.green : Colors.red,
                  ),
                ),
                Expanded(
                  child: _buildPortfolioMetric(
                    'Pozisyonlar',
                    '${portfolio['positions']?.length ?? 0}',
                    Colors.blue,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // Crypto helper widgets
  Widget _buildCryptoCard(Map<String, dynamic> crypto) {
    return Container(
      width: 120,
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.orange.withOpacity(0.05),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.orange.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            crypto['symbol'] ?? 'N/A',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
          ),
          const SizedBox(height: 4),
          Text(
            '\$${(crypto['price'] ?? 0).toStringAsFixed(2)}',
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 4),
          Text(
            '${(crypto['change_24h'] ?? 0).toStringAsFixed(2)}%',
            style: TextStyle(
              fontSize: 12,
              color: (crypto['change_24h'] ?? 0) >= 0 ? Colors.green : Colors.red,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCryptoListItem(Map<String, dynamic> crypto) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: const Icon(Icons.currency_bitcoin, color: Colors.orange),
        title: Text(
          crypto['symbol'] ?? 'N/A',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text('${crypto['name'] ?? 'N/A'}'),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '\$${(crypto['price'] ?? 0).toStringAsFixed(2)}',
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            Text(
              '${(crypto['change_24h'] ?? 0).toStringAsFixed(2)}%',
              style: TextStyle(
                fontSize: 12,
                color: (crypto['change_24h'] ?? 0) >= 0 ? Colors.green : Colors.red,
              ),
            ),
          ],
        ),
        onTap: () => _showCryptoDetails(crypto),
      ),
    );
  }

  // Education helper widgets
  Widget _buildProgressMetric(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: Colors.grey),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildCourseCard(Map<String, dynamic> course) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.play_circle, color: Colors.purple),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    course['title'] ?? 'Kurs',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.purple.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${course['duration'] ?? 0} dk',
                    style: const TextStyle(fontSize: 12, color: Colors.purple),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              course['description'] ?? 'Açıklama yok',
              style: TextStyle(fontSize: 14, color: Colors.grey[600]),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: LinearProgressIndicator(
                    value: (course['progress'] ?? 0) / 100,
                    backgroundColor: Colors.grey[300],
                    valueColor: const AlwaysStoppedAnimation<Color>(Colors.purple),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '${course['progress'] ?? 0}%',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildArticleCard(Map<String, dynamic> article) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: const Icon(Icons.article, color: Colors.blue),
        title: Text(
          article['title'] ?? 'Makale',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          article['summary'] ?? 'Özet yok',
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '${article['read_time'] ?? 0} dk',
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
          ],
        ),
        onTap: () => _showArticleDetails(article),
      ),
    );
  }


  // Action functions
  void _createNewWatchlist() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Yeni Watchlist'),
        content: const TextField(
          decoration: InputDecoration(
            labelText: 'Watchlist Adı',
            hintText: 'Örn: Teknoloji Hisseleri',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('İptal'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // TODO: Implement watchlist creation
            },
            child: const Text('Oluştur'),
          ),
        ],
      ),
    );
  }

  void _createNewPortfolio() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Yeni Portfolio'),
        content: const TextField(
          decoration: InputDecoration(
            labelText: 'Portfolio Adı',
            hintText: 'Örn: Ana Portfolio',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('İptal'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // TODO: Implement portfolio creation
            },
            child: const Text('Oluştur'),
          ),
        ],
      ),
    );
  }

  void _deleteWatchlist(String id) {
    // TODO: Implement watchlist deletion
  }

  void _deletePortfolio(String id) {
    // TODO: Implement portfolio deletion
  }

  void _showCryptoDetails(Map<String, dynamic> crypto) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(crypto['symbol'] ?? 'Crypto'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Fiyat: \$${(crypto['price'] ?? 0).toStringAsFixed(2)}'),
            Text('24s Değişim: ${(crypto['change_24h'] ?? 0).toStringAsFixed(2)}%'),
            Text('Market Cap: \$${(crypto['market_cap'] ?? 0).toStringAsFixed(0)}'),
            Text('Volume: \$${(crypto['volume'] ?? 0).toStringAsFixed(0)}'),
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

  void _showArticleDetails(Map<String, dynamic> article) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(article['title'] ?? 'Makale'),
        content: SingleChildScrollView(
          child: Text(article['content'] ?? 'İçerik bulunamadı'),
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

  Widget _buildXAITab() {
    if (_xaiData == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // XAI Header
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.psychology, color: Colors.purple, size: 28),
                      SizedBox(width: 8),
                      Text(
                        '🧠 Explainable AI (XAI)',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.purple,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 8),
                  Text(
                    'SHAP ve LIME ile sinyal açıklamaları',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
          ),
          SizedBox(height: 16),

          // Feature Importance
          if (_xaiData!['feature_importance'] != null)
            _buildXAIFeatureImportance(),
          SizedBox(height: 16),

          // Model Interpretability
          if (_xaiData!['model_interpretability'] != null)
            _buildXAIModelInterpretability(),
          SizedBox(height: 16),

          // Explanation History
          if (_xaiData!['explanation_history'] != null)
            _buildXAIExplanationHistory(),
        ],
      ),
    );
  }

  Widget _buildXAIFeatureImportance() {
    final featureData = _xaiData!['feature_importance'];
    final features = featureData['features'] as List<dynamic>? ?? [];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '📊 Özellik Önem Skorları',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 12),
            ...features.map((feature) => _buildFeatureImportanceItem(feature)).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureImportanceItem(Map<String, dynamic> feature) {
    final name = feature['name'] ?? 'Unknown';
    final importance = (feature['importance'] ?? 0.0).toDouble();
    final impact = feature['impact'] ?? 'neutral';
    
    Color impactColor = Colors.grey;
    if (impact == 'positive') impactColor = Colors.green;
    else if (impact == 'negative') impactColor = Colors.red;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: Text(name, style: TextStyle(fontWeight: FontWeight.w500)),
          ),
          Expanded(
            flex: 3,
            child: LinearProgressIndicator(
              value: importance,
              backgroundColor: Colors.grey[300],
              valueColor: AlwaysStoppedAnimation<Color>(impactColor),
            ),
          ),
          SizedBox(width: 8),
          Text(
            '${(importance * 100).toStringAsFixed(1)}%',
            style: TextStyle(fontSize: 12, color: impactColor),
          ),
        ],
      ),
    );
  }

  Widget _buildXAIModelInterpretability() {
    final interpretabilityData = _xaiData!['model_interpretability'];
    final score = (interpretabilityData['interpretability_score'] ?? 0.0).toDouble();
    final confidence = (interpretabilityData['confidence'] ?? 0.0).toDouble();
    final quality = interpretabilityData['explanation_quality'] ?? 'unknown';

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '🔍 Model Yorumlanabilirliği',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildXAIMetric('Yorumlanabilirlik', '${(score * 100).toStringAsFixed(1)}%', Colors.blue),
                ),
                SizedBox(width: 16),
                Expanded(
                  child: _buildXAIMetric('Güven', '${(confidence * 100).toStringAsFixed(1)}%', Colors.green),
                ),
              ],
            ),
            SizedBox(height: 12),
            Text(
              'Kalite: $quality',
              style: TextStyle(color: Colors.grey[600]),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildXAIMetric(String label, String value, Color color) {
    return Container(
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildXAIExplanationHistory() {
    final historyData = _xaiData!['explanation_history'];
    final history = historyData['history'] as List<dynamic>? ?? [];
    final avgAccuracy = (historyData['average_accuracy'] ?? 0.0).toDouble();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '📈 Açıklama Geçmişi',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                _buildXAIMetric('Ort. Doğruluk', '${(avgAccuracy * 100).toStringAsFixed(1)}%', Colors.orange),
              ],
            ),
            SizedBox(height: 12),
            ...history.map((item) => _buildExplanationHistoryItem(item)).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildExplanationHistoryItem(Map<String, dynamic> item) {
    final signal = item['signal'] ?? 'UNKNOWN';
    final confidence = (item['confidence'] ?? 0.0).toDouble();
    final explanation = item['explanation'] ?? 'No explanation';
    final accuracy = (item['accuracy'] ?? 0.0).toDouble();
    final date = DateTime.tryParse(item['date'] ?? '') ?? DateTime.now();

    Color signalColor = Colors.grey;
    if (signal == 'BUY') signalColor = Colors.green;
    else if (signal == 'SELL') signalColor = Colors.red;

    return Container(
      margin: EdgeInsets.only(bottom: 8),
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                signal,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: signalColor,
                ),
              ),
              Text(
                '${(confidence * 100).toStringAsFixed(1)}%',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
          SizedBox(height: 4),
          Text(
            explanation,
            style: TextStyle(fontSize: 12),
          ),
          SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Doğruluk: ${(accuracy * 100).toStringAsFixed(1)}%',
                style: TextStyle(
                  fontSize: 11,
                  color: accuracy > 0.7 ? Colors.green : Colors.orange,
                ),
              ),
              Text(
                '${date.day}/${date.month}',
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.grey[500],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBacktestingTab() {
    if (_backtestingData == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Backtesting Header
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.analytics, color: Colors.indigo, size: 28),
                      SizedBox(width: 8),
                      Text(
                        '📊 Auto-Backtest Sistemi',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.indigo,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 8),
                  Text(
                    'vectorbt-pro ile gelişmiş backtesting',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
          ),
          SizedBox(height: 16),

          // Available Strategies
          if (_backtestingData!['strategies'] != null)
            _buildBacktestingStrategies(),
          SizedBox(height: 16),

          // Strategy Comparison
          if (_backtestingData!['comparison'] != null)
            _buildBacktestingComparison(),
          SizedBox(height: 16),

          // Backtest History
          if (_backtestingData!['history'] != null)
            _buildBacktestingHistory(),
        ],
      ),
    );
  }

  Widget _buildBacktestingStrategies() {
    final strategiesData = _backtestingData!['strategies'];
    final strategies = strategiesData['strategies'] as List<dynamic>? ?? [];
    final descriptions = strategiesData['descriptions'] as Map<String, dynamic>? ?? {};

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '🎯 Mevcut Stratejiler',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 12),
            ...strategies.map((strategy) => _buildStrategyItem(strategy, descriptions[strategy] ?? 'Açıklama yok')).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildStrategyItem(String strategy, String description) {
    return Container(
      margin: EdgeInsets.only(bottom: 8),
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.indigo.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.indigo.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            strategy.toUpperCase(),
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.indigo,
            ),
          ),
          SizedBox(height: 4),
          Text(
            description,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBacktestingComparison() {
    final comparisonData = _backtestingData!['comparison'];
    final strategies = comparisonData['strategies'] as Map<String, dynamic>? ?? {};
    final bestStrategy = comparisonData['best_strategy'] ?? '';

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '📈 Strateji Karşılaştırması',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    'En İyi: $bestStrategy',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.green,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 12),
            ...strategies.entries.map((entry) => _buildStrategyComparisonItem(entry.key, entry.value)).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildStrategyComparisonItem(String strategy, Map<String, dynamic> metrics) {
    final totalReturn = (metrics['total_return'] ?? 0.0).toDouble();
    final sharpeRatio = (metrics['sharpe_ratio'] ?? 0.0).toDouble();
    final winRate = (metrics['win_rate'] ?? 0.0).toDouble();
    final maxDrawdown = (metrics['max_drawdown'] ?? 0.0).toDouble();

    return Container(
      margin: EdgeInsets.only(bottom: 8),
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            strategy.toUpperCase(),
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.indigo,
            ),
          ),
          SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: _buildBacktestingMetric('Toplam Getiri', '${(totalReturn * 100).toStringAsFixed(1)}%', 
                    totalReturn >= 0 ? Colors.green : Colors.red),
              ),
              SizedBox(width: 8),
              Expanded(
                child: _buildBacktestingMetric('Sharpe Ratio', sharpeRatio.toStringAsFixed(2), 
                    sharpeRatio >= 0.5 ? Colors.green : Colors.orange),
              ),
            ],
          ),
          SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: _buildBacktestingMetric('Kazanma Oranı', '${(winRate * 100).toStringAsFixed(1)}%', 
                    winRate >= 0.6 ? Colors.green : Colors.orange),
              ),
              SizedBox(width: 8),
              Expanded(
                child: _buildBacktestingMetric('Max Drawdown', '${(maxDrawdown * 100).toStringAsFixed(1)}%', 
                    maxDrawdown >= -0.1 ? Colors.green : Colors.red),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBacktestingMetric(String label, String value, Color color) {
    return Container(
      padding: EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBacktestingHistory() {
    final historyData = _backtestingData!['history'];
    final totalBacktests = historyData['total_backtests'] ?? 0;
    final cacheKeys = historyData['cache_keys'] as List<dynamic>? ?? [];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '📊 Backtest Geçmişi',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildBacktestingMetric('Toplam Test', totalBacktests.toString(), Colors.blue),
                ),
                SizedBox(width: 16),
                Expanded(
                  child: _buildBacktestingMetric('Cache Boyutu', cacheKeys.length.toString(), Colors.purple),
                ),
              ],
            ),
            SizedBox(height: 12),
            if (cacheKeys.isNotEmpty) ...[
              Text(
                'Son Testler:',
                style: TextStyle(fontWeight: FontWeight.w500),
              ),
              SizedBox(height: 8),
              ...cacheKeys.take(5).map((key) => Padding(
                padding: EdgeInsets.only(bottom: 4),
                child: Text(
                  '• $key',
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                ),
              )).toList(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildMacroRegimeTab() {
    if (_macroRegimeData == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Macro Regime Header
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.trending_up, color: Colors.teal, size: 28),
                      SizedBox(width: 8),
                      Text(
                        '🌍 Makro Rejim Algılayıcı',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.teal,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 8),
                  Text(
                    'HMM ile piyasa rejimi tespiti',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
          ),
          SizedBox(height: 16),

          // Current Regime
          if (_macroRegimeData!['current'] != null)
            _buildCurrentRegime(),
          SizedBox(height: 16),

          // Macro Indicators
          if (_macroRegimeData!['analysis'] != null)
            _buildMacroIndicators(),
          SizedBox(height: 16),

          // Regime Recommendations
          if (_macroRegimeData!['recommendations'] != null)
            _buildRegimeRecommendations(),
        ],
      ),
    );
  }

  Widget _buildCurrentRegime() {
    final currentData = _macroRegimeData!['current'];
    final currentRegime = currentData['current_regime'] ?? 'unknown';
    final probabilities = currentData['regime_probabilities'] as Map<String, dynamic>? ?? {};

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '📊 Güncel Rejim',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 12),
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _getRegimeColor(currentRegime).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: _getRegimeColor(currentRegime).withOpacity(0.3)),
              ),
              child: Column(
                children: [
                  Text(
                    _getRegimeDisplayName(currentRegime),
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: _getRegimeColor(currentRegime),
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    _getRegimeDescription(currentRegime),
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
            SizedBox(height: 16),
            Text(
              'Rejim Olasılıkları:',
              style: TextStyle(fontWeight: FontWeight.w500),
            ),
            SizedBox(height: 8),
            ...probabilities.entries.map((entry) => _buildRegimeProbability(entry.key, entry.value)).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildRegimeProbability(String regime, double probability) {
    return Container(
      margin: EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Expanded(
            child: Text(
              _getRegimeDisplayName(regime),
              style: TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            child: LinearProgressIndicator(
              value: probability,
              backgroundColor: Colors.grey[300],
              valueColor: AlwaysStoppedAnimation<Color>(_getRegimeColor(regime)),
            ),
          ),
          SizedBox(width: 8),
          Text(
            '${(probability * 100).toStringAsFixed(1)}%',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: _getRegimeColor(regime),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMacroIndicators() {
    final analysisData = _macroRegimeData!['analysis'];
    final indicators = analysisData['macro_indicators'] as Map<String, dynamic>? ?? {};

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '📈 Makro Göstergeler',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 12),
            ...indicators.entries.map((entry) => _buildMacroIndicator(entry.key, entry.value)).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildMacroIndicator(String indicator, Map<String, dynamic> data) {
    final latestPrice = (data['latest_price'] ?? 0.0).toDouble();
    final priceChange = (data['price_change'] ?? 0.0).toDouble();
    final trend = data['trend'] ?? 'flat';

    return Container(
      margin: EdgeInsets.only(bottom: 12),
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _getIndicatorDisplayName(indicator),
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.teal,
                  ),
                ),
                Text(
                  latestPrice.toStringAsFixed(2),
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${priceChange >= 0 ? '+' : ''}${(priceChange * 100).toStringAsFixed(2)}%',
                style: TextStyle(
                  color: priceChange >= 0 ? Colors.green : Colors.red,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: _getTrendColor(trend).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  _getTrendDisplayName(trend),
                  style: TextStyle(
                    fontSize: 10,
                    color: _getTrendColor(trend),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRegimeRecommendations() {
    final recommendations = _macroRegimeData!['recommendations'] as Map<String, dynamic>? ?? {};
    final currentRegime = _macroRegimeData!['current']['current_regime'] ?? 'neutral';
    final currentRecommendations = recommendations[currentRegime] as Map<String, dynamic>? ?? {};

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '💡 Yatırım Önerileri',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 12),
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _getRegimeColor(currentRegime).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: _getRegimeColor(currentRegime).withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    currentRecommendations['description'] ?? 'Açıklama yok',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[700],
                    ),
                  ),
                  SizedBox(height: 16),
                  _buildRecommendationSection('Önerilen Varlıklar', currentRecommendations['recommended_assets']),
                  SizedBox(height: 12),
                  _buildRecommendationSection('Kaçınılacak Varlıklar', currentRecommendations['avoid_assets']),
                  SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _buildRecommendationMetric('Strateji', currentRecommendations['strategy']),
                      ),
                      SizedBox(width: 8),
                      Expanded(
                        child: _buildRecommendationMetric('Pozisyon', currentRecommendations['position_sizing']),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecommendationSection(String title, dynamic items) {
    final itemList = items as List<dynamic>? ?? [];
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.teal,
          ),
        ),
        SizedBox(height: 4),
        Wrap(
          spacing: 4,
          runSpacing: 4,
          children: itemList.map((item) => Container(
            padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.teal.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.teal.withOpacity(0.3)),
            ),
            child: Text(
              item.toString(),
              style: TextStyle(
                fontSize: 12,
                color: Colors.teal,
                fontWeight: FontWeight.w500,
              ),
            ),
          )).toList(),
        ),
      ],
    );
  }

  Widget _buildRecommendationMetric(String label, dynamic value) {
    return Container(
      padding: EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              color: Colors.grey[600],
            ),
          ),
          SizedBox(height: 4),
          Text(
            value?.toString() ?? 'N/A',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Colors.teal,
            ),
          ),
        ],
      ),
    );
  }

  Color _getRegimeColor(String regime) {
    switch (regime) {
      case 'risk_off':
        return Colors.red;
      case 'risk_on':
        return Colors.green;
      case 'neutral':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  String _getRegimeDisplayName(String regime) {
    switch (regime) {
      case 'risk_off':
        return 'Risk-Off';
      case 'risk_on':
        return 'Risk-On';
      case 'neutral':
        return 'Nötr';
      default:
        return 'Bilinmiyor';
    }
  }

  String _getRegimeDescription(String regime) {
    switch (regime) {
      case 'risk_off':
        return 'Güvenli limanlar tercih edilir';
      case 'risk_on':
        return 'Riskli varlıklar tercih edilir';
      case 'neutral':
        return 'Belirsizlik hakim';
      default:
        return 'Rejim belirlenemedi';
    }
  }

  String _getIndicatorDisplayName(String indicator) {
    switch (indicator) {
      case 'usdtry':
        return 'USD/TRY';
      case 'cds':
        return 'CDS Spread';
      case 'xu030':
        return 'BIST 100';
      case 'vix':
        return 'VIX';
      case 'sp500':
        return 'S&P 500';
      case 'gold':
        return 'Altın';
      case 'oil':
        return 'Petrol';
      default:
        return indicator.toUpperCase();
    }
  }

  Color _getTrendColor(String trend) {
    switch (trend) {
      case 'up':
        return Colors.green;
      case 'down':
        return Colors.red;
      case 'flat':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  String _getTrendDisplayName(String trend) {
    switch (trend) {
      case 'up':
        return 'Yükseliş';
      case 'down':
        return 'Düşüş';
      case 'flat':
        return 'Yatay';
      default:
        return 'Belirsiz';
    }
  }

  Widget _buildFreemiumTab() {
    if (_freemiumData == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Freemium Header
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.star, color: Colors.amber, size: 28),
                      SizedBox(width: 8),
                      Text(
                        '💎 Premium Abonelik',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.amber,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Freemium model ile premium özellikler',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
          ),
          SizedBox(height: 16),

          // Current Subscription
          if (_freemiumData!['user_subscription'] != null)
            _buildCurrentSubscription(),
          SizedBox(height: 16),

          // Subscription Tiers
          if (_freemiumData!['tiers'] != null)
            _buildSubscriptionTiers(),
          SizedBox(height: 16),

          // Upgrade Recommendations
          if (_freemiumData!['recommendations'] != null)
            _buildUpgradeRecommendations(),
        ],
      ),
    );
  }

  Widget _buildCurrentSubscription() {
    final userSubscription = _freemiumData!['user_subscription'];
    final subscription = userSubscription['subscription'] ?? 'free';
    final subscriptionName = userSubscription['subscription_name'] ?? 'Ücretsiz';
    final usageStats = userSubscription['usage_stats'] as Map<String, dynamic>? ?? {};
    final limits = userSubscription['limits'] as Map<String, dynamic>? ?? {};

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '📊 Mevcut Abonelik',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 12),
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _getSubscriptionColor(subscription).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: _getSubscriptionColor(subscription).withOpacity(0.3)),
              ),
              child: Column(
                children: [
                  Text(
                    subscriptionName,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: _getSubscriptionColor(subscription),
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    _getSubscriptionDescription(subscription),
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
            SizedBox(height: 16),
            Text(
              'Kullanım Durumu:',
              style: TextStyle(fontWeight: FontWeight.w500),
            ),
            SizedBox(height: 8),
            ...usageStats.entries.map((entry) => _buildUsageStat(entry.key, entry.value, limits)).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildUsageStat(String statName, dynamic currentValue, Map<String, dynamic> limits) {
    final limit = limits[statName] ?? 0;
    final usage = (currentValue as num).toDouble();
    final percentage = limit > 0 ? (usage / limit * 100) : 0;
    final isNearLimit = percentage > 80;

    return Container(
      margin: EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Expanded(
            child: Text(
              _getStatDisplayName(statName),
              style: TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            child: LinearProgressIndicator(
              value: percentage / 100,
              backgroundColor: Colors.grey[300],
              valueColor: AlwaysStoppedAnimation<Color>(
                isNearLimit ? Colors.red : Colors.green,
              ),
            ),
          ),
          SizedBox(width: 8),
          Text(
            '${usage.toInt()}/${limit}',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: isNearLimit ? Colors.red : Colors.green,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubscriptionTiers() {
    final tiersData = _freemiumData!['tiers']['tiers'] as Map<String, dynamic>? ?? {};

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '💎 Abonelik Seviyeleri',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 12),
            ...tiersData.entries.map((entry) => _buildTierCard(entry.key, entry.value)).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildTierCard(String tierKey, Map<String, dynamic> tierData) {
    final name = tierData['name'] ?? 'Bilinmiyor';
    final price = (tierData['price'] ?? 0).toDouble();
    final features = tierData['features'] as List<dynamic>? ?? [];
    final limits = tierData['limits'] as Map<String, dynamic>? ?? {};

    return Container(
      margin: EdgeInsets.only(bottom: 12),
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _getSubscriptionColor(tierKey).withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _getSubscriptionColor(tierKey).withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  name,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: _getSubscriptionColor(tierKey),
                  ),
                ),
              ),
              Text(
                price > 0 ? '₺${price.toStringAsFixed(2)}' : 'Ücretsiz',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: _getSubscriptionColor(tierKey),
                ),
              ),
            ],
          ),
          SizedBox(height: 8),
          Text(
            'Özellikler:',
            style: TextStyle(fontWeight: FontWeight.w500),
          ),
          SizedBox(height: 4),
          Wrap(
            spacing: 4,
            runSpacing: 4,
            children: features.take(3).map((feature) => Container(
              padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: _getSubscriptionColor(tierKey).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: _getSubscriptionColor(tierKey).withOpacity(0.3)),
              ),
              child: Text(
                _getFeatureDisplayName(feature),
                style: TextStyle(
                  fontSize: 10,
                  color: _getSubscriptionColor(tierKey),
                  fontWeight: FontWeight.w500,
                ),
              ),
            )).toList(),
          ),
          if (features.length > 3)
            Text(
              '+${features.length - 3} daha...',
              style: TextStyle(
                fontSize: 10,
                color: Colors.grey[600],
                fontStyle: FontStyle.italic,
              ),
            ),
          SizedBox(height: 8),
          ElevatedButton(
            onPressed: () => _upgradeSubscription(tierKey),
            style: ElevatedButton.styleFrom(
              backgroundColor: _getSubscriptionColor(tierKey),
              foregroundColor: Colors.white,
            ),
            child: Text('Yükselt'),
          ),
        ],
      ),
    );
  }

  Widget _buildUpgradeRecommendations() {
    final recommendations = _freemiumData!['recommendations'];
    final recommendationList = recommendations['recommendations'] as List<dynamic>? ?? [];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '💡 Yükseltme Önerileri',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 12),
            if (recommendationList.isEmpty)
              Container(
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.green.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.check_circle, color: Colors.green),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Mevcut aboneliğiniz ihtiyaçlarınızı karşılıyor!',
                        style: TextStyle(
                          color: Colors.green,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              )
            else
              ...recommendationList.map((rec) => _buildRecommendationItem(rec)).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildRecommendationItem(Map<String, dynamic> recommendation) {
    final type = recommendation['type'] ?? 'unknown';
    final feature = recommendation['feature'] ?? 'unknown';
    final recText = recommendation['recommendation'] ?? 'Yükseltme önerisi';

    return Container(
      margin: EdgeInsets.only(bottom: 8),
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.orange.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.orange.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(Icons.lightbulb, color: Colors.orange, size: 20),
          SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _getRecommendationTitle(type, feature),
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.orange,
                  ),
                ),
                Text(
                  recText,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[700],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _upgradeSubscription(String tierKey) {
    // Abonelik yükseltme işlemi
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$tierKey aboneliğine yükseltme işlemi başlatıldı'),
        backgroundColor: Colors.green,
      ),
    );
  }

  Color _getSubscriptionColor(String subscription) {
    switch (subscription) {
      case 'free':
        return Colors.grey;
      case 'basic':
        return Colors.blue;
      case 'premium':
        return Colors.purple;
      case 'pro':
        return Colors.amber;
      case 'god_mode':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _getSubscriptionDescription(String subscription) {
    switch (subscription) {
      case 'free':
        return 'Temel özellikler ve sınırlı kullanım';
      case 'basic':
        return 'Gelişmiş özellikler ve daha fazla kullanım';
      case 'premium':
        return 'Tüm premium özellikler ve AI modelleri';
      case 'pro':
        return 'Profesyonel özellikler ve API erişimi';
      case 'god_mode':
        return 'Sınırsız erişim ve tüm özellikler';
      default:
        return 'Bilinmeyen abonelik';
    }
  }

  String _getStatDisplayName(String statName) {
    switch (statName) {
      case 'signals_today':
        return 'Günlük Sinyaller';
      case 'api_calls_today':
        return 'Günlük API Çağrıları';
      case 'backtest_runs_this_month':
        return 'Aylık Backtest';
      case 'real_time_minutes_used':
        return 'Gerçek Zamanlı Dakika';
      default:
        return statName;
    }
  }

  String _getFeatureDisplayName(String feature) {
    switch (feature) {
      case 'temel_sinyaller':
        return 'Temel Sinyaller';
      case 'gelişmiş_sinyaller':
        return 'Gelişmiş Sinyaller';
      case 'ai_modelleri':
        return 'AI Modelleri';
      case 'sentiment_analiz':
        return 'Sentiment Analiz';
      case 'xai_açıklamalar':
        return 'XAI Açıklamalar';
      case 'backtesting':
        return 'Backtesting';
      case 'makro_rejim':
        return 'Makro Rejim';
      case 'sosyal_trading':
        return 'Sosyal Trading';
      case 'paper_trading':
        return 'Paper Trading';
      case 'crypto_trading':
        return 'Crypto Trading';
      case 'eğitim_modülü':
        return 'Eğitim Modülü';
      case 'api_erişimi':
        return 'API Erişimi';
      case 'white_label':
        return 'White Label';
      case 'unlimited_signals':
        return 'Sınırsız Sinyaller';
      case 'unlimited_watchlists':
        return 'Sınırsız Watchlist';
      case 'unlimited_portfolios':
        return 'Sınırsız Portfolio';
      case 'unlimited_alerts':
        return 'Sınırsız Alert';
      case 'unlimited_api_calls':
        return 'Sınırsız API';
      case 'unlimited_backtest_runs':
        return 'Sınırsız Backtest';
      case 'unlimited_real_time_data':
        return 'Sınırsız Gerçek Zamanlı';
      case 'all_premium_features':
        return 'Tüm Premium Özellikler';
      case 'god_mode_exclusive':
        return 'God Mode Özel';
      default:
        return feature;
    }
  }

  String _getRecommendationTitle(String type, String feature) {
    if (type == 'usage_limit') {
      return 'Kullanım Limiti Aşıldı';
    } else if (type == 'feature_access') {
      return 'Özellik Erişimi Gerekli';
    } else {
      return 'Yükseltme Önerisi';
    }
  }

  Widget _buildGodModeTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // God Mode Header
        Container(
          margin: const EdgeInsets.only(bottom: 16),
          child: Card(
            color: _isGodModeActive ? Colors.amber.withOpacity(0.1) : Colors.grey.withOpacity(0.1),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
                    children: [
                      Icon(
                        _isGodModeActive ? Icons.star : Icons.star_border,
                        color: _isGodModeActive ? Colors.amber : Colors.grey,
                        size: 32,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _godModeData['badge'] ?? '👑 GOD MODE',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: _isGodModeActive ? Colors.amber : Colors.grey,
                              ),
                            ),
                            Text(
                              _godModeData['description'] ?? 'Tüm premium özelliklere sınırsız erişim',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: _isGodModeActive ? Colors.green : Colors.red,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      _isGodModeActive ? 'AKTİF' : 'PASİF',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),

        // God Mode Features
        if (_isGodModeActive) ...[
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Premium Özellikler',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    ...(_godModeData['dashboard']?['premium_features'] ?? []).map<Widget>((feature) => 
                      Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.green.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.green.withOpacity(0.3)),
                        ),
                        child: Row(
                          children: [
                            Text(
                              feature['icon'] ?? '✅',
                              style: const TextStyle(fontSize: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    feature['name'] ?? 'Özellik',
                                    style: const TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                  Text(
                                    feature['description'] ?? 'Açıklama',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.green,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text(
                                'AKTİF',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ).toList(),
                  ],
                ),
              ),
            ),
          ),

          // God Mode Analytics
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'God Mode İstatistikleri',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    if (_godModeData['analytics'] != null) ...[
                      _buildGodModeMetric('Toplam Sinyal', '${_godModeData['analytics']['features_usage']?['signals_generated'] ?? 0}'),
                      _buildGodModeMetric('Başarı Oranı', '%${_godModeData['analytics']['performance']?['win_rate'] ?? 0}'),
                      _buildGodModeMetric('Toplam Kâr', '₺${_godModeData['analytics']['performance']?['total_return'] ?? 0}'),
                      _buildGodModeMetric('Sharpe Oranı', '${_godModeData['analytics']['performance']?['sharpe_ratio'] ?? 0}'),
                      _buildGodModeMetric('AI Doğruluğu', '%${_godModeData['analytics']['ai_models']?['ensemble']?['accuracy'] ?? 0}'),
                      _buildGodModeMetric('API Çağrısı', '${_godModeData['analytics']['features_usage']?['api_calls_made'] ?? 0}'),
                    ],
                  ],
                ),
              ),
            ),
          ),

          // God Mode System Status
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Sistem Durumu',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    if (_godModeData['dashboard']?['system_status'] != null) ...[
                      ...(_godModeData['dashboard']['system_status'] as Map<String, dynamic>).entries.map<Widget>((entry) => 
                        Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            children: [
                              Icon(
                                entry.value == 'active' ? Icons.check_circle : Icons.error,
                                color: entry.value == 'active' ? Colors.green : Colors.red,
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  entry.key.replaceAll('_', ' ').toUpperCase(),
                                  style: const TextStyle(fontWeight: FontWeight.w500),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: entry.value == 'active' ? Colors.green : Colors.red,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  entry.value.toUpperCase(),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ).toList(),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ] else ...[
          // God Mode Activation
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    const Icon(
                      Icons.star_border,
                      size: 64,
                      color: Colors.grey,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'God Mode Aktif Değil',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Test için God Mode\'u aktifleştirin',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: _activateGodMode,
                      icon: const Icon(Icons.star),
                      label: const Text('God Mode\'u Aktifleştir'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.amber,
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildGodModeMetric(String label, String value) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(fontWeight: FontWeight.w500),
          ),
          Text(
            value,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.blue,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _activateGodMode() async {
    try {
      final result = await GodModeService.activateGodMode();
      if (result['success'] == true) {
        await _loadGodModeData();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('👑 God Mode aktifleştirildi!'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('God Mode aktifleştirilemedi: ${result['message']}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Hata: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
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
        const Text('• Seçenek analizi'),
        const Text('• Toplu analiz'),
      ],
    );
  }
  
  void _showOptionsAnalysis() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('📊 Seçenek Analizi'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('US Market seçenekleri analiz ediliyor...'),
            SizedBox(height: 16),
            Text('• AAPL: Call/Put oranları analiz ediliyor'),
            Text('• TSLA: Implied Volatility hesaplanıyor'),
            Text('• NVDA: Max Pain seviyesi tespit ediliyor'),
            SizedBox(height: 16),
            Text('Analiz tamamlandığında sonuçlar gösterilecek.'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Kapat'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _showSuccessSnackBar('Seçenek analizi başlatıldı!');
            },
            child: const Text('Analiz Başlat'),
          ),
        ],
      ),
    );
  }
  
  void _showBulkAnalysis() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('🔍 Toplu Analiz'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Analiz türü seçin:'),
            SizedBox(height: 16),
            Text('• Kapsamlı Analiz: RSI, MACD, AI Skoru'),
            Text('• Teknik Analiz: Sadece teknik göstergeler'),
            Text('• Seçenek Analizi: Options verileri'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('İptal'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _showStockSelector();
            },
            child: const Text('Hisse Seç'),
          ),
        ],
      ),
    );
  }
  
  void _showStockSelector() {
    final allStocks = _selectedMarket == 'BIST' 
        ? ['SISE.IS', 'EREGL.IS', 'TUPRS.IS', 'AKBNK.IS', 'GARAN.IS', 'ISCTR.IS', 'THYAO.IS', 'KCHOL.IS']
        : ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];
    
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) {
          final selectedStocks = <String>{};
          
          return AlertDialog(
            title: Text('📋 ${_selectedMarket} Hisselerini Seçin'),
            content: SizedBox(
              width: double.maxFinite,
              height: 300,
              child: ListView.builder(
                itemCount: allStocks.length,
                itemBuilder: (context, index) {
                  final stock = allStocks[index];
                  return CheckboxListTile(
                    title: Text(stock),
                    value: selectedStocks.contains(stock),
                    onChanged: (bool? value) {
                      setState(() {
                        if (value == true) {
                          selectedStocks.add(stock);
                        } else {
                          selectedStocks.remove(stock);
                        }
                      });
                    },
                  );
                },
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('İptal'),
              ),
              ElevatedButton(
                onPressed: selectedStocks.isEmpty 
                    ? null 
                    : () {
                        Navigator.pop(context);
                        _performBulkAnalysis(selectedStocks.toList());
                      },
                child: Text('Analiz Et (${selectedStocks.length})'),
              ),
            ],
          );
        },
      ),
    );
  }
  
  Future<void> _performBulkAnalysis(List<String> selectedStocks) async {
    setState(() => _isLoading = true);
    
    try {
      // API çağrısı simülasyonu
      await Future.delayed(const Duration(seconds: 2));
      
      _showSuccessSnackBar('${selectedStocks.length} hisse analiz edildi!');
      
      // Sonuçları göster
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('📊 Analiz Sonuçları'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Analiz edilen: ${selectedStocks.length} hisse'),
              const SizedBox(height: 16),
              const Text('Sonuçlar:'),
              const Text('• 🟢 BUY: 3 hisse'),
              const Text('• 🔴 SELL: 1 hisse'),
              const Text('• 🟡 HOLD: 4 hisse'),
              const SizedBox(height: 16),
              const Text('Ortalama AI Skoru: 72.5'),
              const Text('Risk Seviyesi: Orta'),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Kapat'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _showSuccessSnackBar('Detaylı rapor hazırlanıyor...');
              },
              child: const Text('Detaylı Rapor'),
            ),
          ],
        ),
      );
      
    } catch (e) {
      _showErrorSnackBar('Analiz hatası: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }
  
  Future<void> _logout() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('session_token');
      await prefs.remove('user_email');
      await prefs.remove('user_name');
      
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/auth');
      }
    } catch (e) {
      print('Logout hatası: $e');
    }
  }

  Future<void> _loadYapiKrediData() async {
    try {
      // BIST endekslerini yükle
      final indices = await YapiKrediService.getBistIndicesForWidget();
      setState(() {
        _bistIndices = indices;
      });
      
      // BIST 100 hisselerini yükle
      final stocks = await YapiKrediService.getBist100ForWidget();
      setState(() {
        _bist100Stocks = stocks;
      });
      
      print('✅ Yapı Kredi verileri yüklendi: ${indices.length} endeks, ${stocks.length} hisse');
      
    } catch (e) {
      print('❌ Yapı Kredi veri yükleme hatası: $e');
    }
  }

  Future<void> _loadSocialTradingData() async {
    try {
      // En iyi trader'ları yükle
      final traders = await SocialTradingService.getTradersForWidget();
      setState(() {
        _topTraders = traders;
      });
      
      // Sosyal feed'i yükle
      final feed = await SocialTradingService.getFeedForWidget();
      setState(() {
        _socialFeed = feed;
      });
      
      print('✅ Sosyal trading verileri yüklendi: ${traders.length} trader, ${feed.length} feed');
      
    } catch (e) {
      print('❌ Sosyal trading veri yükleme hatası: $e');
    }
  }

  Future<void> _loadPaperTradingData() async {
    try {
      // Paper trading portföyünü yükle
      final portfolio = await PaperTradingService.getPortfolioForWidget('demo_user');
      setState(() {
        _paperPortfolio = portfolio;
      });
      
      // Leaderboard'u yükle
      final leaderboard = await PaperTradingService.getLeaderboardForWidget();
      setState(() {
        _leaderboard = leaderboard;
      });
      
      print('✅ Paper trading verileri yüklendi: portfolio, ${leaderboard.length} sıralama');
      
    } catch (e) {
      print('❌ Paper trading veri yükleme hatası: $e');
    }
  }
  
  Future<void> _loadAIModelsData() async {
    try {
      final status = await AIModelsService.getModelStatusForWidget();
      final signal = await AIModelsService.getEnsembleSignalForWidget(symbol: 'AAPL');
      
      setState(() {
        _aiModelStatus = status;
        _ensembleSignal = signal;
      });
      
      print('✅ AI models verileri yüklendi: status, signal');
      
    } catch (e) {
      print('❌ AI models veri yükleme hatası: $e');
    }
  }
  
  Future<void> _loadWatchlistData() async {
    try {
      // Demo watchlist verileri
      setState(() {
        _watchlists = [
          {
            'id': 'wl_1',
            'name': 'BIST 100',
            'symbols': ['THYAO', 'TUPRS', 'SISE', 'EREGL', 'AKBNK'],
            'created_at': DateTime.now().subtract(Duration(days: 7)).toIso8601String(),
          },
          {
            'id': 'wl_2',
            'name': 'Teknoloji',
            'symbols': ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'],
            'created_at': DateTime.now().subtract(Duration(days: 3)).toIso8601String(),
          }
        ];
        
        _portfolios = [
          {
            'id': 'pf_1',
            'name': 'Ana Portföy',
            'total_value': 12500.0,
            'total_return': 2500.0,
            'total_return_percent': 25.0,
            'created_at': DateTime.now().subtract(Duration(days: 30)).toIso8601String(),
          }
        ];
      });
      
      print('✅ Watchlist verileri yüklendi: ${_watchlists.length} watchlist, ${_portfolios.length} portfolio');
      
    } catch (e) {
      print('❌ Watchlist veri yükleme hatası: $e');
    }
  }
  
  Future<void> _loadCryptoData() async {
    try {
      final cryptoList = await CryptoService.getCryptoListForWidget(limit: 10);
      final trending = await CryptoService.getTrendingCryptosForWidget();
      final gainersLosers = await CryptoService.getGainersLosersForWidget();
      
      setState(() {
        _cryptoList = cryptoList;
        _trendingCryptos = trending;
        _cryptoGainersLosers = gainersLosers;
      });
      
      print('✅ Crypto verileri yüklendi: ${cryptoList.length} crypto, ${trending.length} trending');
      
    } catch (e) {
      print('❌ Crypto veri yükleme hatası: $e');
    }
  }
  
  Future<void> _loadEducationData() async {
    try {
      final courses = await EducationService.getCoursesForWidget();
      final articles = await EducationService.getArticlesForWidget(limit: 5);
      final progress = await EducationService.getUserProgressForWidget(userId: 'demo_user');
      
      setState(() {
        _courses = courses;
        _articles = articles;
        _userProgress = progress;
      });
      
      print('✅ Eğitim verileri yüklendi: ${courses.length} kurs, ${articles.length} makale');
      
    } catch (e) {
      print('❌ Eğitim veri yükleme hatası: $e');
    }
  }

  Future<void> _loadGodModeData() async {
    try {
      final godModeData = await GodModeService.getGodModeForWidget();
      
      setState(() {
        _godModeData = godModeData;
        _isGodModeActive = godModeData['god_mode'] ?? false;
      });
      
      print('✅ God Mode verileri yüklendi: ${godModeData['god_mode'] ? 'Aktif' : 'Pasif'}');
      
    } catch (e) {
      print('❌ God Mode veri yükleme hatası: $e');
    }
  }

  Future<void> _loadXAIData() async {
    try {
      // Demo sembol için XAI verisi al
      final xaiData = await XAIService.getXAIForWidget('AAPL');
      if (mounted) {
        setState(() {
          _xaiData = xaiData;
        });
      }
      print('✅ XAI verileri yüklendi: ${xaiData['status']}');
    } catch (e) {
      print('❌ XAI veri yükleme hatası: $e');
      // Demo veri kullan
      if (mounted) {
        setState(() {
          _xaiData = XAIService.getDemoXAI('AAPL');
        });
      }
    }
  }

  Future<void> _loadBacktestingData() async {
    try {
      // Demo sembol için backtesting verisi al
      final backtestingData = await BacktestingService.getBacktestingForWidget('AAPL');
      if (mounted) {
        setState(() {
          _backtestingData = backtestingData;
        });
      }
      print('✅ Backtesting verileri yüklendi: ${backtestingData['status']}');
    } catch (e) {
      print('❌ Backtesting veri yükleme hatası: $e');
      // Demo veri kullan
      if (mounted) {
        setState(() {
          _backtestingData = BacktestingService.getDemoBacktesting('AAPL');
        });
      }
    }
  }

  Future<void> _loadMacroRegimeData() async {
    try {
      // Makro rejim verisi al
      final macroRegimeData = await MacroRegimeService.getMacroRegimeForWidget();
      if (mounted) {
        setState(() {
          _macroRegimeData = macroRegimeData;
        });
      }
      print('✅ Makro rejim verileri yüklendi: ${macroRegimeData['status']}');
    } catch (e) {
      print('❌ Makro rejim veri yükleme hatası: $e');
      // Demo veri kullan
      if (mounted) {
        setState(() {
          _macroRegimeData = MacroRegimeService.getDemoMacroRegime();
        });
      }
    }
  }

  Future<void> _loadFreemiumData() async {
    try {
      // Freemium verisi al
      final freemiumData = await FreemiumService.getFreemiumForWidget('demo@test.com');
      if (mounted) {
        setState(() {
          _freemiumData = freemiumData;
        });
      }
      print('✅ Freemium verileri yüklendi: ${freemiumData['status']}');
    } catch (e) {
      print('❌ Freemium veri yükleme hatası: $e');
      // Demo veri kullan
      if (mounted) {
        setState(() {
          _freemiumData = FreemiumService.getDemoFreemium();
        });
      }
    }
  }

  Future<void> _initializeWebSocket() async {
    try {
      await _websocketService.connect();
      
      // WebSocket mesajlarını dinle
      _websocketSubscription = _websocketService.messageStream.listen((message) {
        if (message['type'] == 'price_update') {
          setState(() {
            _realtimePrices[message['symbol']] = message['data'];
          });
        }
      });
      
      // Popüler hisseleri subscribe et
      final popularStocks = _selectedMarket == 'BIST' 
          ? ['SISE.IS', 'EREGL.IS', 'TUPRS.IS', 'AKBNK.IS', 'GARAN.IS']
          : ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
          
      for (final stock in popularStocks) {
        _websocketService.subscribe(stock);
      }
      
      print('✅ WebSocket bağlantısı kuruldu');
      
    } catch (e) {
      print('❌ WebSocket bağlantı hatası: $e');
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _websocketSubscription?.cancel();
    _websocketService.dispose();
    super.dispose();
  }
}
