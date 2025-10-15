'use client';

import React, { useState, useEffect } from 'react';
import { 
  BellIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckIcon,
  XMarkIcon,
  Cog6ToothIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  symbol?: string;
  data: { [key: string]: any };
  timestamp: string;
  is_read: boolean;
  is_delivered: boolean;
}

interface NotificationRule {
  user_id: string;
  symbol: string;
  rule_type: string;
  condition: { [key: string]: any };
  priority: string;
  is_active: boolean;
  created_at: string;
  last_triggered?: string;
  trigger_count: number;
}

interface SmartNotificationsProps {
  isLoading?: boolean;
}

const API_BASE_URL = 'http://127.0.0.1:8081';

const SmartNotifications: React.FC<SmartNotificationsProps> = ({ isLoading }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [activeTab, setActiveTab] = useState<'notifications' | 'rules' | 'settings'>('notifications');
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [newRule, setNewRule] = useState({
    symbol: '',
    rule_type: 'PRICE_ALERT',
    condition: { price: 0, type: 'above' },
    priority: 'MEDIUM'
  });

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/user/demo_user?limit=50`);
      const data = await response.json();
      
      if (data.notifications) {
        setNotifications(data.notifications);
      } else {
        generateMockNotifications();
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      generateMockNotifications();
    }
  };

  const fetchRules = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/rules/demo_user`);
      const data = await response.json();
      
      if (data.rules) {
        setRules(data.rules);
      } else {
        generateMockRules();
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
      generateMockRules();
    }
  };

  const generateMockNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        user_id: 'demo_user',
        type: 'AI_SIGNAL',
        priority: 'HIGH',
        title: '🟢 THYAO AI Sinyali',
        message: 'AI BUY sinyali - Güven: %91',
        symbol: 'THYAO',
        data: {
          prediction: 'BUY',
          confidence: 0.91,
          price_target: 340.75,
          stop_loss: 310.25
        },
        timestamp: new Date().toISOString(),
        is_read: false,
        is_delivered: true
      },
      {
        id: '2',
        user_id: 'demo_user',
        type: 'PATTERN_DETECTED',
        priority: 'MEDIUM',
        title: '📊 ASELS Formasyon Tespit Edildi',
        message: 'Gartley Bullish formasyonu tespit edildi (Güven: %87)',
        symbol: 'ASELS',
        data: {
          pattern_type: 'Gartley',
          direction: 'Bullish',
          confidence: 0.87,
          target_price: 95.20
        },
        timestamp: new Date(Date.now() - 300000).toISOString(),
        is_read: false,
        is_delivered: true
      },
      {
        id: '3',
        user_id: 'demo_user',
        type: 'PRICE_ALERT',
        priority: 'LOW',
        title: '💰 TUPRS Fiyat Uyarısı',
        message: 'TUPRS fiyatı ₺145.00 üzerinde - Mevcut: ₺147.30',
        symbol: 'TUPRS',
        data: {
          current_price: 147.30,
          trigger_price: 145.00,
          alert_type: 'above',
          change_percent: 1.59
        },
        timestamp: new Date(Date.now() - 600000).toISOString(),
        is_read: true,
        is_delivered: true
      },
      {
        id: '4',
        user_id: 'demo_user',
        type: 'RISK_WARNING',
        priority: 'CRITICAL',
        title: '⚠️ Günlük Kayıp Uyarısı',
        message: 'Portföyünüzde %3.2 günlük kayıp tespit edildi',
        symbol: null,
        data: {
          risk_type: 'DAILY_LOSS',
          loss_percent: 3.2,
          total_value: 100000
        },
        timestamp: new Date(Date.now() - 900000).toISOString(),
        is_read: false,
        is_delivered: true
      }
    ];
    
    setNotifications(mockNotifications);
  };

  const generateMockRules = () => {
    const mockRules: NotificationRule[] = [
      {
        user_id: 'demo_user',
        symbol: 'THYAO',
        rule_type: 'PRICE_ALERT',
        condition: { price: 340.00, type: 'above' },
        priority: 'HIGH',
        is_active: true,
        created_at: new Date().toISOString(),
        last_triggered: new Date().toISOString(),
        trigger_count: 3
      },
      {
        user_id: 'demo_user',
        symbol: 'ASELS',
        rule_type: 'AI_SIGNAL',
        condition: { min_confidence: 0.85, signal_types: ['BUY', 'SELL'] },
        priority: 'MEDIUM',
        is_active: true,
        created_at: new Date().toISOString(),
        trigger_count: 1
      },
      {
        user_id: 'demo_user',
        symbol: 'TUPRS',
        rule_type: 'PATTERN_ALERT',
        condition: { pattern_type: 'Gartley', min_confidence: 0.8 },
        priority: 'MEDIUM',
        is_active: true,
        created_at: new Date().toISOString(),
        trigger_count: 2
      }
    ];
    
    setRules(mockRules);
  };

  useEffect(() => {
    fetchNotifications();
    fetchRules();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600 bg-red-100 border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'LOW': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'AI_SIGNAL': return '🤖';
      case 'PATTERN_DETECTED': return '📊';
      case 'PRICE_ALERT': return '💰';
      case 'RISK_WARNING': return '⚠️';
      case 'MARKET_EVENT': return '📈';
      case 'PORTFOLIO_UPDATE': return '💼';
      case 'NEWS_ALERT': return '📰';
      case 'VOLATILITY_SPIKE': return '⚡';
      default: return '🔔';
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/read/demo_user/${notificationId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const createRule = async () => {
    try {
      const rule: NotificationRule = {
        user_id: 'demo_user',
        symbol: newRule.symbol,
        rule_type: newRule.rule_type,
        condition: newRule.condition,
        priority: newRule.priority,
        is_active: true,
        created_at: new Date().toISOString(),
        trigger_count: 0
      };

      const response = await fetch(`${API_BASE_URL}/api/notifications/rules/demo_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule)
      });

      if (response.ok) {
        setRules(prev => [...prev, rule]);
        setShowCreateRule(false);
        setNewRule({
          symbol: '',
          rule_type: 'PRICE_ALERT',
          condition: { price: 0, type: 'above' },
          priority: 'MEDIUM'
        });
      }
    } catch (error) {
      console.error('Error creating rule:', error);
    }
  };

  const deleteRule = async (ruleIndex: number) => {
    try {
      const rule = rules[ruleIndex];
      const response = await fetch(`${API_BASE_URL}/api/notifications/rules/demo_user/${rule.symbol}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRules(prev => prev.filter((_, index) => index !== ruleIndex));
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Akıllı Bildirimler</h2>
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
                      <div className="h-3 bg-gray-300 rounded w-48"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-12"></div>
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
            <BellIconSolid className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Akıllı Bildirimler</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                {unreadCount} okunmamış
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Tab Selector */}
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'notifications'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Bildirimler
              </button>
              <button
                onClick={() => setActiveTab('rules')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'rules'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Kurallar
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'settings'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Ayarlar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Bildirim yok</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Henüz bildirim almadınız.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className={`border rounded-lg p-4 ${!notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{getTypeIcon(notification.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{new Date(notification.timestamp).toLocaleString()}</span>
                          {notification.symbol && (
                            <span className="font-medium">{notification.symbol}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Okundu olarak işaretle"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Bildirim Kuralları</h3>
              <button
                onClick={() => setShowCreateRule(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Kural Ekle
              </button>
            </div>

            {rules.length === 0 ? (
              <div className="text-center py-12">
                <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Kural yok</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Bildirim kuralı oluşturarak başlayın.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {rules.map((rule, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{rule.symbol}</h4>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {rule.rule_type}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(rule.priority)}`}>
                            {rule.priority}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Koşul: {JSON.stringify(rule.condition)}</p>
                          <p>Tetiklenme: {rule.trigger_count} kez</p>
                          {rule.last_triggered && (
                            <p>Son tetiklenme: {new Date(rule.last_triggered).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => deleteRule(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Kuralı Sil"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Bildirim Ayarları</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Push Bildirimleri</p>
                  <p className="text-sm text-gray-500">Mobil ve web push bildirimleri</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">E-posta Bildirimleri</p>
                  <p className="text-sm text-gray-500">Önemli bildirimler için e-posta</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">SMS Bildirimleri</p>
                  <p className="text-sm text-gray-500">Kritik uyarılar için SMS</p>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Ses Bildirimleri</p>
                  <p className="text-sm text-gray-500">Bildirim sesleri</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sessiz Saatler</label>
              <div className="flex items-center space-x-4">
                <input
                  type="time"
                  defaultValue="22:00"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="time"
                  defaultValue="08:00"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Öncelik Filtresi</label>
              <div className="space-y-2">
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((priority) => (
                  <label key={priority} className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded mr-2" />
                    <span className="text-sm text-gray-700">{priority}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Risk Toleransı</label>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full">
                <option value="LOW">Düşük</option>
                <option value="MEDIUM" selected>Orta</option>
                <option value="HIGH">Yüksek</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Create Rule Modal */}
      {showCreateRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Yeni Bildirim Kuralı</h3>
              <button
                onClick={() => setShowCreateRule(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Hisse Senedi</label>
                <input
                  type="text"
                  value={newRule.symbol}
                  onChange={(e) => setNewRule({ ...newRule, symbol: e.target.value })}
                  placeholder="Örn: THYAO"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Kural Tipi</label>
                <select
                  value={newRule.rule_type}
                  onChange={(e) => setNewRule({ ...newRule, rule_type: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="PRICE_ALERT">Fiyat Uyarısı</option>
                  <option value="AI_SIGNAL">AI Sinyali</option>
                  <option value="PATTERN_ALERT">Formasyon Uyarısı</option>
                </select>
              </div>
              
              {newRule.rule_type === 'PRICE_ALERT' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hedef Fiyat</label>
                    <input
                      type="number"
                      value={newRule.condition.price}
                      onChange={(e) => setNewRule({
                        ...newRule,
                        condition: { ...newRule.condition, price: parseFloat(e.target.value) }
                      })}
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Uyarı Tipi</label>
                    <select
                      value={newRule.condition.type}
                      onChange={(e) => setNewRule({
                        ...newRule,
                        condition: { ...newRule.condition, type: e.target.value }
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="above">Fiyat üzerinde</option>
                      <option value="below">Fiyat altında</option>
                    </select>
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Öncelik</label>
                <select
                  value={newRule.priority}
                  onChange={(e) => setNewRule({ ...newRule, priority: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="LOW">Düşük</option>
                  <option value="MEDIUM">Orta</option>
                  <option value="HIGH">Yüksek</option>
                  <option value="CRITICAL">Kritik</option>
                </select>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={createRule}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Kural Oluştur
                </button>
                <button
                  onClick={() => setShowCreateRule(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
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
};

export default SmartNotifications;
