'use client';

import { useState, useEffect } from 'react';
import { 
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

interface BrokerAccount {
  account_id: string;
  account_type: string;
  currency: string;
  balance: number;
  available_balance: number;
  blocked_amount: number;
  equity: number;
  margin_used: number;
  margin_available: number;
  last_update: string;
}

interface BrokerPosition {
  symbol: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  market_value: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
  position_type: string;
  broker: string;
  last_update: string;
}

interface BrokerStatus {
  [brokerName: string]: boolean;
}

interface BrokerIntegrationProps {
  isLoading?: boolean;
}

export default function BrokerIntegration({ isLoading }: BrokerIntegrationProps) {
  const [brokerStatus, setBrokerStatus] = useState<BrokerStatus>({});
  const [accounts, setAccounts] = useState<{ [key: string]: BrokerAccount }>({});
  const [positions, setPositions] = useState<BrokerPosition[]>([]);
  const [portfolio, setPortfolio] = useState<any>({});
  const [selectedBroker, setSelectedBroker] = useState<string>('all');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({
    symbol: '',
    quantity: '',
    order_type: 'MARKET',
    price: ''
  });

  useEffect(() => {
    loadBrokerData();
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ symbol: string; quantity?: number; price?: number }>;
      if (custom.detail?.symbol) {
        setOrderForm({
          symbol: custom.detail.symbol,
          quantity: custom.detail.quantity ? String(custom.detail.quantity) : '',
          order_type: 'MARKET',
          price: custom.detail.price ? String(custom.detail.price) : '',
        });
        setShowOrderModal(true);
      }
    };
    window.addEventListener('prefill-broker-order', handler as EventListener);
    return () => window.removeEventListener('prefill-broker-order', handler as EventListener);
  }, []);

  const loadBrokerData = async () => {
    try {
      // Load broker status
      const statusResponse = await fetch('/api/broker/status');
      const statusData = await statusResponse.json();
      setBrokerStatus(statusData.brokers || {});

      // Load accounts
      const accountsResponse = await fetch('/api/broker/accounts');
      const accountsData = await accountsResponse.json();
      setAccounts(accountsData.accounts || {});

      // Load positions
      const positionsResponse = await fetch('/api/broker/positions');
      const positionsData = await positionsResponse.json();
      
      // Flatten positions from all brokers
      const allPositions: BrokerPosition[] = [];
      Object.entries(positionsData.positions || {}).forEach(([broker, brokerPositions]) => {
        if (Array.isArray(brokerPositions)) {
          brokerPositions.forEach((pos: any) => {
            allPositions.push({ ...pos, broker });
          });
        }
      });
      setPositions(allPositions);

      // Load aggregated portfolio
      const portfolioResponse = await fetch('/api/broker/portfolio');
      const portfolioData = await portfolioResponse.json();
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Error loading broker data:', error);
    }
  };

  const initializeBrokers = async () => {
    try {
      const response = await fetch('/api/broker/initialize', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        await loadBrokerData();
        alert('Broker bağlantıları başarıyla kuruldu!');
      } else {
        alert('Broker bağlantıları kurulamadı: ' + data.message);
      }
    } catch (error) {
      console.error('Error initializing brokers:', error);
      alert('Broker bağlantıları kurulurken hata oluştu');
    }
  };

  const placeOrder = async () => {
    try {
      const response = await fetch('/api/broker/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          symbol: orderForm.symbol,
          quantity: parseInt(orderForm.quantity),
          order_type: orderForm.order_type,
          price: orderForm.price ? parseFloat(orderForm.price) : null
        })
      });
      
      const data = await response.json();
      
      if (data.orders) {
        alert('Emirler başarıyla verildi!');
        setShowOrderModal(false);
        setOrderForm({ symbol: '', quantity: '', order_type: 'MARKET', price: '' });
        await loadBrokerData();
      } else {
        alert('Emir verilirken hata oluştu: ' + data.error);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Emir verilirken hata oluştu');
    }
  };

  const getBrokerStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
    ) : (
      <XCircleIcon className="h-5 w-5 text-red-500" />
    );
  };

  const getBrokerStatusColor = (status: boolean) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const filteredPositions = selectedBroker === 'all' 
    ? positions 
    : positions.filter(pos => pos.broker === selectedBroker);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Broker Entegrasyonu</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BuildingOfficeIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">Broker Entegrasyonu</h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              Çoklu Broker
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={initializeBrokers}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Broker Bağlantılarını Kur
            </button>
            <button
              onClick={() => setShowOrderModal(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Emir Ver
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Broker Status */}
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-900 mb-4">Broker Durumu</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(brokerStatus).map(([broker, status]) => (
              <div key={broker} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getBrokerStatusIcon(status)}
                    <h4 className="font-medium text-gray-900">{broker}</h4>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBrokerStatusColor(status)}`}>
                    {status ? 'Bağlı' : 'Bağlantı Yok'}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {status ? 'API bağlantısı aktif' : 'Bağlantı kurulamadı'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Summary */}
        {portfolio.total_balance && (
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Toplam Portföy</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Toplam Bakiye</p>
                <p className="text-xl font-bold text-blue-600">
                  ₺{portfolio.total_balance?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Toplam Sermaye</p>
                <p className="text-xl font-bold text-green-600">
                  ₺{portfolio.total_equity?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Kar/Zarar</p>
                <p className={`text-xl font-bold ${portfolio.total_unrealized_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₺{portfolio.total_unrealized_pnl?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Piyasa Değeri</p>
                <p className="text-xl font-bold text-orange-600">
                  ₺{portfolio.total_market_value?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Account Details */}
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-900 mb-4">Hesap Detayları</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(accounts).map(([broker, account]) => (
              <div key={broker} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{broker}</h4>
                  <span className="text-sm text-gray-500">{account.currency}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bakiye:</span>
                    <span className="text-sm font-medium">₺{account.balance?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Kullanılabilir:</span>
                    <span className="text-sm font-medium">₺{account.available_balance?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sermaye:</span>
                    <span className="text-sm font-medium">₺{account.equity?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Positions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-gray-900">Pozisyonlar</h3>
            <select
              value={selectedBroker}
              onChange={(e) => setSelectedBroker(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">Tüm Brokerlar</option>
              {Object.keys(brokerStatus).map(broker => (
                <option key={broker} value={broker}>{broker}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-3">
            {filteredPositions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Henüz pozisyon yok.</p>
            ) : (
              filteredPositions.map((position, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {position.unrealized_pnl >= 0 ? (
                          <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-gray-900">{position.symbol}</p>
                          <span className="text-sm text-gray-500">({position.broker})</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {position.position_type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">
                            Miktar: {position.quantity.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500">
                            Ort. Fiyat: ₺{position.avg_price.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500">
                            Güncel: ₺{position.current_price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₺{position.market_value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className={`text-sm font-medium ${
                        position.unrealized_pnl >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {position.unrealized_pnl >= 0 ? '+' : ''}₺{position.unrealized_pnl.toFixed(2)}
                      </p>
                      <p className={`text-xs ${
                        position.unrealized_pnl_percent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ({position.unrealized_pnl_percent >= 0 ? '+' : ''}{position.unrealized_pnl_percent.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Emir Ver</h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sembol
                </label>
                <input
                  type="text"
                  value={orderForm.symbol}
                  onChange={(e) => setOrderForm({ ...orderForm, symbol: e.target.value.toUpperCase() })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="THYAO"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Miktar
                </label>
                <input
                  type="number"
                  value={orderForm.quantity}
                  onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emir Türü
                </label>
                <select
                  value={orderForm.order_type}
                  onChange={(e) => setOrderForm({ ...orderForm, order_type: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="MARKET">Piyasa</option>
                  <option value="LIMIT">Limit</option>
                  <option value="STOP">Stop</option>
                </select>
              </div>
              
              {orderForm.order_type !== 'MARKET' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fiyat
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={orderForm.price}
                    onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="325.50"
                  />
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={placeOrder}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Emir Ver
                </button>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
