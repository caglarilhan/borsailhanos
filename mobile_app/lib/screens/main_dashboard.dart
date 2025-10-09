import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/market_data_provider.dart';
import '../providers/signals_provider.dart';
import '../providers/portfolio_provider.dart';

class MainDashboard extends StatefulWidget {
  const MainDashboard({super.key});

  @override
  State<MainDashboard> createState() => _MainDashboardState();
}

class _MainDashboardState extends State<MainDashboard> {
  int _currentIndex = 0;
  
  final List<Widget> _screens = [
    const HomeTab(),
    const SignalsTab(),
    const PortfolioTab(),
    const SettingsTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        selectedItemColor: Theme.of(context).colorScheme.primary,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Ana Sayfa',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.trending_up),
            label: 'Sinyaller',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.account_balance_wallet),
            label: 'Portföy',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: 'Ayarlar',
          ),
        ],
      ),
    );
  }
}

// Home Tab
class HomeTab extends StatelessWidget {
  const HomeTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('BIST AI Smart Trader'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {
              // TODO: Show notifications
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              // TODO: Refresh data
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          // TODO: Refresh all data
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Market Overview Card
              _buildMarketOverviewCard(context),
              
              const SizedBox(height: 20),
              
              // Quick Actions
              _buildQuickActionsCard(context),
              
              const SizedBox(height: 20),
              
              // Recent Signals
              _buildRecentSignalsCard(context),
              
              const SizedBox(height: 20),
              
              // Portfolio Summary
              _buildPortfolioSummaryCard(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMarketOverviewCard(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.analytics,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 8),
                Text(
                  'Piyasa Genel Görünüm',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildMarketStat(
                    'BIST 100',
                    '+2.5%',
                    Colors.green,
                    Icons.trending_up,
                  ),
                ),
                Expanded(
                  child: _buildMarketStat(
                    'USD/TRY',
                    '-1.2%',
                    Colors.red,
                    Icons.trending_down,
                  ),
                ),
                Expanded(
                  child: _buildMarketStat(
                    'XU030',
                    '+1.8%',
                    Colors.green,
                    Icons.trending_up,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMarketStat(String label, String value, Color color, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 4),
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

  Widget _buildQuickActionsCard(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hızlı İşlemler',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildActionButton(
                    'Yeni Sinyal',
                    Icons.add_alert,
                    Colors.blue,
                    () {
                      // TODO: Navigate to new signal
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildActionButton(
                    'Portföy Ekle',
                    Icons.add_circle,
                    Colors.green,
                    () {
                      // TODO: Navigate to add portfolio
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildActionButton(
                    'Analiz',
                    Icons.analytics,
                    Colors.orange,
                    () {
                      // TODO: Navigate to analysis
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(String label, IconData icon, Color color, VoidCallback onPressed) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      child: Column(
        children: [
          Icon(icon, size: 20),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 12),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildRecentSignalsCard(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Son Sinyaller',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    // TODO: Navigate to all signals
                  },
                  child: const Text('Tümünü Gör'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // Mock signals
            _buildSignalItem('SISE.IS', 'BUY', 0.85, Colors.green),
            const SizedBox(height: 12),
            _buildSignalItem('EREGL.IS', 'SELL', 0.72, Colors.red),
          ],
        ),
      ),
    );
  }

  Widget _buildSignalItem(String symbol, String type, double confidence, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              type,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  symbol,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  'Güven: ${(confidence * 100).toInt()}%',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          Icon(
            type == 'BUY' ? Icons.trending_up : Icons.trending_down,
            color: color,
          ),
        ],
      ),
    );
  }

  Widget _buildPortfolioSummaryCard(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Portföy Özeti',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildPortfolioStat(
                    'Toplam Değer',
                    '₺15,000',
                    Colors.blue,
                  ),
                ),
                Expanded(
                  child: _buildPortfolioStat(
                    'Günlük P&L',
                    '+₺160',
                    Colors.green,
                  ),
                ),
                Expanded(
                  child: _buildPortfolioStat(
                    'Aylık Değişim',
                    '+8.2%',
                    Colors.green,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPortfolioStat(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 4),
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
}

// Signals Tab
class SignalsTab extends StatelessWidget {
  const SignalsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return _SignalsContent();
  }
}

class _SignalsContent extends StatefulWidget {
  @override
  State<_SignalsContent> createState() => _SignalsContentState();
}

class _SignalsContentState extends State<_SignalsContent> {
  bool _loading = true;
  String? _error;
  List<dynamic> _signals = [];

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await SignalsService.fetchSignals(symbols: ['SISE.IS']);
      setState(() {
        _signals = (data['signals'] as List<dynamic>);
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Sinyalleri'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetch,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Hata: $_error'))
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _signals.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final item = _signals[index] as Map<String, dynamic>;
                    final symbol = item['symbol'] as String? ?? '-';
                    final topsis = item['topsis'] as num?;
                    final advice = item['position_advice'] as Map<String, dynamic>?;
                    final side = advice != null ? (advice['side'] as String? ?? 'HOLD') : 'HOLD';
                    final tags = (item['signals'] as List<dynamic>?)?.isNotEmpty == true
                        ? ((item['signals'] as List<dynamic>).last as Map<String, dynamic>)['tags'] as List<dynamic>? ?? []
                        : [];
                    return Card(
                      child: ListTile(
                        title: Text(symbol),
                        subtitle: Text('Tags: ${tags.join(', ')}'),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(side, style: TextStyle(color: side == 'BUY' ? Colors.green : (side == 'SELL' ? Colors.red : Colors.grey))),
                            if (topsis != null) Text('TOPSIS ${(topsis as num).toStringAsFixed(2)}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}

// Portfolio Tab
class PortfolioTab extends StatelessWidget {
  const PortfolioTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Portföy'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // TODO: Add position
            },
          ),
        ],
      ),
      body: const Center(
        child: Text('Portföy burada görüntülenecek'),
      ),
    );
  }
}

// Settings Tab
class SettingsTab extends StatelessWidget {
  const SettingsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ayarlar'),
      ),
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              ListTile(
                leading: const Icon(Icons.dark_mode),
                title: const Text('Karanlık Mod'),
                trailing: Switch(
                  value: authProvider.isDarkMode,
                  onChanged: (value) {
                    authProvider.toggleDarkMode();
                  },
                ),
              ),
              ListTile(
                leading: const Icon(Icons.logout),
                title: const Text('Çıkış Yap'),
                onTap: () async {
                  await authProvider.logout();
                  if (context.mounted) {
                    Navigator.pushReplacementNamed(context, '/login');
                  }
                },
              ),
            ],
          );
        },
      ),
    );
  }
}
