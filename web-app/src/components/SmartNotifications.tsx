'use client';

import { useState, useEffect } from 'react';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
import { 
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  message: string;
  symbol: string;
  confidence: number;
  timestamp: string;
  read: boolean;
  action_required: boolean;
}

interface EmailData {
  email: string;
  type: string;
  subject: string;
  content: string;
  sent_at: string;
  status: string;
  priority: string;
}

interface SMSData {
  phone: string;
  type: string;
  message: string;
  sent_at: string;
  status: string;
  cost: number;
}

export default function SmartNotifications() {
  const [activeTab, setActiveTab] = useState<'smart' | 'email' | 'sms'>('smart');
  const [loading, setLoading] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [emailData, setEmailData] = useState<EmailData | null>(null);
  const [smsData, setSMSData] = useState<SMSData | null>(null);
  const [email, setEmail] = useState<string>('user@example.com');
  const [phone, setPhone] = useState<string>('+905551234567');

  const fetchSmartNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/smart?user_id=default&type=signal`);
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Smart notifications fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailNotification = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/email?email=${email}&type=daily_summary`);
      const data = await response.json();
      setEmailData(data.email_data);
    } catch (error) {
      console.error('Email notification fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSMSNotification = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/sms?phone=${phone}&type=urgent_signal`);
      const data = await response.json();
      setSMSData(data.sms_data);
    } catch (error) {
      console.error('SMS notification fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'smart') fetchSmartNotifications();
    else if (activeTab === 'email') fetchEmailNotification();
    else if (activeTab === 'sms') fetchSMSNotification();
  }, [activeTab, email, phone]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case 'medium': return <InformationCircleIcon className="h-5 w-5 text-yellow-600" />;
      case 'low': return <InformationCircleIcon className="h-5 w-5 text-blue-600" />;
      default: return <InformationCircleIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Smart Notifications</h2>
        <div className="flex items-center gap-4">
          {activeTab === 'smart' && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
            >
              Tümünü Okundu İşaretle
            </button>
          )}
          <button
            onClick={() => {
              if (activeTab === 'smart') fetchSmartNotifications();
              else if (activeTab === 'email') fetchEmailNotification();
              else if (activeTab === 'sms') fetchSMSNotification();
            }}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Yükleniyor...' : 'Yenile'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'smart', name: 'Akıllı Bildirimler', icon: BellIcon },
            { id: 'email', name: 'E-posta Bildirimleri', icon: EnvelopeIcon },
            { id: 'sms', name: 'SMS Bildirimleri', icon: DevicePhoneMobileIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Smart Notifications Tab */}
      {activeTab === 'smart' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Akıllı Bildirimler</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Toplam: {notifications.length}</span>
                <span>Okunmamış: {notifications.filter(n => !n.read).length}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                  notification.priority === 'high' ? 'border-l-red-500' : 
                  notification.priority === 'medium' ? 'border-l-yellow-500' : 
                  'border-l-blue-500'
                } ${!notification.read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{notification.icon}</span>
                      {getPriorityIcon(notification.priority)}
                      <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                        {notification.priority.toUpperCase()}
                      </span>
                      {notification.action_required && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          Aksiyon Gerekli
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Sembol: {notification.symbol}</span>
                      <span>Güven: {(notification.confidence * 100).toFixed(1)}%</span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {new Date(notification.timestamp).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-gray-400 hover:text-green-600"
                        title="Okundu işaretle"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Notifications Tab */}
      {activeTab === 'email' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">E-posta Bildirimleri</h3>
            <div className="flex items-center gap-4 mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="E-posta adresi"
              />
              <button
                onClick={fetchEmailNotification}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Test E-postası Gönder
              </button>
            </div>
          </div>

          {emailData && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h4 className="text-lg font-semibold text-gray-900">{emailData.subject}</h4>
                <div className="text-sm text-gray-600 mt-2">
                  <span>Gönderilen: {new Date(emailData.sent_at).toLocaleString('tr-TR')}</span>
                  <span className="ml-4">Durum: {emailData.status}</span>
                  <span className="ml-4">Öncelik: {emailData.priority}</span>
                </div>
              </div>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {emailData.content}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SMS Notifications Tab */}
      {activeTab === 'sms' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SMS Bildirimleri</h3>
            <div className="flex items-center gap-4 mb-4">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Telefon numarası"
              />
              <button
                onClick={fetchSMSNotification}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Test SMS Gönder
              </button>
            </div>
          </div>

          {smsData && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h4 className="text-lg font-semibold text-gray-900">SMS Bildirimi</h4>
                <div className="text-sm text-gray-600 mt-2">
                  <span>Telefon: {smsData.phone}</span>
                  <span className="ml-4">Gönderilen: {new Date(smsData.sent_at).toLocaleString('tr-TR')}</span>
                  <span className="ml-4">Durum: {smsData.status}</span>
                  <span className="ml-4">Maliyet: ₺{smsData.cost}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">{smsData.message}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}