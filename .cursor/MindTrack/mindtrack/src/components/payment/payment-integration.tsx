"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  CreditCard, 
  DollarSign, 
  Receipt, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Calendar,
  User,
  Users,
  Building,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Filter,
  Search,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  Star,
  Heart,
  Zap,
  Brain,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Server,
  Database,
  Cloud,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryHigh,
  BatteryEmpty,
  BatteryWarning,
  BatteryAlert,
  BatteryCheck,
  BatteryX,
  BatteryPlus,
  BatteryMinus,
  BatteryEdit,
  BatterySettings,
  BatteryRefresh,
  BatteryPlay,
  BatteryPause,
  BatteryStop,
  BatteryCopy,
  BatteryShare,
  BatteryDownload,
  BatteryUpload,
  BatteryFilter,
  BatterySearch,
  BatteryEye,
  BatteryEyeOff,
  BatteryLock,
  BatteryUnlock,
  BatteryShield,
  BatteryUser,
  BatteryUserCheck,
  BatteryUserX,
  BatteryPhone,
  BatteryMail,
  BatteryMessageSquare,
  BatteryBell,
  BatteryBellOff,
  BatteryBookOpen,
  BatteryFileText,
  BatteryFileCheck,
  BatteryFileX,
  BatteryFilePlus,
  BatteryFileMinus,
  BatteryFileEdit,
  BatteryFileAlertCircle
} from "lucide-react";

// Payment Integration için gerekli interface'ler
interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet' | 'crypto';
  name: string;
  last4?: string;
  brand?: string;
  expiryDate?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  type: 'payment' | 'refund' | 'subscription' | 'one_time';
  description: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  appointmentId?: string;
  paymentMethodId: string;
  gateway: 'stripe' | 'paypal' | 'square' | 'custom';
  gatewayTransactionId: string;
  fees: number;
  netAmount: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

interface Subscription {
  id: string;
  patientId: string;
  patientName: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  interval: 'monthly' | 'quarterly' | 'yearly';
  status: 'active' | 'cancelled' | 'paused' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  nextBillingDate: Date;
  paymentMethodId: string;
  gateway: 'stripe' | 'paypal' | 'square' | 'custom';
  gatewaySubscriptionId: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  interval: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
  features: string[];
  isActive: boolean;
  maxPatients?: number;
  maxTherapists?: number;
  maxAppointments?: number;
  includesTelehealth: boolean;
  includesAnalytics: boolean;
  includesAI: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentGateway {
  id: string;
  name: 'stripe' | 'paypal' | 'square' | 'custom';
  displayName: string;
  isActive: boolean;
  isTestMode: boolean;
  apiKey: string;
  secretKey: string;
  webhookUrl: string;
  supportedCurrencies: string[];
  supportedPaymentMethods: string[];
  fees: {
    percentage: number;
    fixed: number;
  };
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Integration Component - Ödeme entegrasyonu sistemi
export function PaymentIntegration() {
  // State management - Uygulama durumunu yönetmek için
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showGatewayConfig, setShowGatewayConfig] = useState(false);

  // Mock data initialization - Test verilerini yüklemek için
  useEffect(() => {
    // Simulated data loading - Gerçek API'den veri çekme simülasyonu
    const mockPaymentMethods: PaymentMethod[] = [
      {
        id: '1',
        type: 'credit_card',
        name: 'Visa ending in 4242',
        last4: '4242',
        brand: 'visa',
        expiryDate: '12/25',
        isDefault: true,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        type: 'digital_wallet',
        name: 'PayPal',
        isDefault: false,
        isActive: true,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      }
    ];

    const mockTransactions: Transaction[] = [
      {
        id: '1',
        amount: 150.00,
        currency: 'USD',
        status: 'completed',
        type: 'payment',
        description: 'Therapy session - Dr. Ayşe Kaya',
        patientId: '1',
        patientName: 'Ahmet Yılmaz',
        therapistId: '1',
        therapistName: 'Dr. Ayşe Kaya',
        appointmentId: 'app_001',
        paymentMethodId: '1',
        gateway: 'stripe',
        gatewayTransactionId: 'txn_123456789',
        fees: 2.90,
        netAmount: 147.10,
        metadata: { sessionType: 'individual', duration: 60 },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        amount: 200.00,
        currency: 'USD',
        status: 'pending',
        type: 'subscription',
        description: 'Monthly subscription - Premium Plan',
        patientId: '2',
        patientName: 'Fatma Demir',
        therapistId: '2',
        therapistName: 'Dr. Mehmet Öz',
        paymentMethodId: '2',
        gateway: 'paypal',
        gatewayTransactionId: 'pay_987654321',
        fees: 5.00,
        netAmount: 195.00,
        metadata: { planType: 'premium', interval: 'monthly' },
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      }
    ];

    const mockSubscriptions: Subscription[] = [
      {
        id: '1',
        patientId: '2',
        patientName: 'Fatma Demir',
        planId: 'premium_monthly',
        planName: 'Premium Monthly Plan',
        amount: 200.00,
        currency: 'USD',
        interval: 'monthly',
        status: 'active',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-01-31'),
        nextBillingDate: new Date('2024-02-01'),
        paymentMethodId: '2',
        gateway: 'paypal',
        gatewaySubscriptionId: 'sub_123456789',
        metadata: { planType: 'premium' },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];

    const mockPaymentPlans: PaymentPlan[] = [
      {
        id: 'basic_monthly',
        name: 'Basic Monthly',
        description: 'Essential features for small practices',
        amount: 99.00,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'Up to 50 patients',
          'Basic analytics',
          'Email support',
          'Standard security'
        ],
        isActive: true,
        maxPatients: 50,
        maxTherapists: 2,
        maxAppointments: 100,
        includesTelehealth: false,
        includesAnalytics: true,
        includesAI: false,
        metadata: { tier: 'basic' },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'premium_monthly',
        name: 'Premium Monthly',
        description: 'Advanced features for growing practices',
        amount: 200.00,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'Unlimited patients',
          'Advanced analytics',
          'AI-powered scheduling',
          'Telehealth integration',
          'Priority support',
          'Advanced security'
        ],
        isActive: true,
        maxPatients: -1, // Unlimited
        maxTherapists: 10,
        maxAppointments: -1, // Unlimited
        includesTelehealth: true,
        includesAnalytics: true,
        includesAI: true,
        metadata: { tier: 'premium' },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];

    const mockPaymentGateways: PaymentGateway[] = [
      {
        id: '1',
        name: 'stripe',
        displayName: 'Stripe',
        isActive: true,
        isTestMode: true,
        apiKey: 'pk_test_...',
        secretKey: 'sk_test_...',
        webhookUrl: 'https://api.mindtrack.com/webhooks/stripe',
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'TRY'],
        supportedPaymentMethods: ['credit_card', 'debit_card', 'digital_wallet'],
        fees: {
          percentage: 2.9,
          fixed: 0.30
        },
        metadata: { environment: 'test' },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: '2',
        name: 'paypal',
        displayName: 'PayPal',
        isActive: true,
        isTestMode: true,
        apiKey: 'client_id_...',
        secretKey: 'client_secret_...',
        webhookUrl: 'https://api.mindtrack.com/webhooks/paypal',
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'TRY'],
        supportedPaymentMethods: ['digital_wallet', 'bank_transfer'],
        fees: {
          percentage: 3.5,
          fixed: 0.35
        },
        metadata: { environment: 'test' },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];

    setPaymentMethods(mockPaymentMethods);
    setTransactions(mockTransactions);
    setSubscriptions(mockSubscriptions);
    setPaymentPlans(mockPaymentPlans);
    setPaymentGateways(mockPaymentGateways);
  }, []);

  // Add payment method - Ödeme yöntemi ekleme
  const addPaymentMethod = useCallback(async (paymentData: Partial<PaymentMethod>) => {
    setLoading(true);
    
    try {
      // Simulated API call - API çağrısı simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPaymentMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: paymentData.type || 'credit_card',
        name: paymentData.name || 'New Payment Method',
        last4: paymentData.last4,
        brand: paymentData.brand,
        expiryDate: paymentData.expiryDate,
        isDefault: paymentMethods.length === 0, // İlk ödeme yöntemi varsayılan olur
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setPaymentMethods(prev => [...prev, newPaymentMethod]);
      setShowAddPaymentMethod(false);
      
    } catch (error) {
      console.error('Failed to add payment method:', error);
    } finally {
      setLoading(false);
    }
  }, [paymentMethods.length]);

  // Process payment - Ödeme işleme
  const processPayment = useCallback(async (
    amount: number,
    currency: string,
    paymentMethodId: string,
    description: string,
    metadata: Record<string, unknown>
  ) => {
    setLoading(true);
    
    try {
      // Simulated payment processing - Ödeme işleme simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId);
      const gateway = paymentGateways.find(gw => gw.isActive);
      
      if (!paymentMethod || !gateway) {
        throw new Error('Invalid payment method or gateway');
      }
      
      // Calculate fees - Ücret hesaplama
      const fees = (amount * gateway.fees.percentage / 100) + gateway.fees.fixed;
      const netAmount = amount - fees;
      
      const newTransaction: Transaction = {
        id: `txn_${Date.now()}`,
        amount,
        currency,
        status: 'completed',
        type: 'payment',
        description,
        patientId: 'current_patient', // Gerçek uygulamada context'ten alınır
        patientName: 'Current Patient',
        therapistId: 'current_therapist',
        therapistName: 'Current Therapist',
        paymentMethodId,
        gateway: gateway.name,
        gatewayTransactionId: `gateway_${Date.now()}`,
        fees,
        netAmount,
        metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      return newTransaction;
      
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [paymentMethods, paymentGateways]);

  // Create subscription - Abonelik oluşturma
  const createSubscription = useCallback(async (
    planId: string,
    paymentMethodId: string,
    patientId: string,
    patientName: string
  ) => {
    setLoading(true);
    
    try {
      // Simulated subscription creation - Abonelik oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const plan = paymentPlans.find(p => p.id === planId);
      const gateway = paymentGateways.find(gw => gw.isActive);
      
      if (!plan || !gateway) {
        throw new Error('Invalid plan or gateway');
      }
      
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      
      const newSubscription: Subscription = {
        id: `sub_${Date.now()}`,
        patientId,
        patientName,
        planId,
        planName: plan.name,
        amount: plan.amount,
        currency: plan.currency,
        interval: plan.interval,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
        nextBillingDate: nextMonth,
        paymentMethodId,
        gateway: gateway.name,
        gatewaySubscriptionId: `gateway_sub_${Date.now()}`,
        metadata: { planType: plan.id },
        createdAt: now,
        updatedAt: now
      };
      
      setSubscriptions(prev => [...prev, newSubscription]);
      
      return newSubscription;
      
    } catch (error) {
      console.error('Subscription creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [paymentPlans, paymentGateways]);

  // Calculate revenue metrics - Gelir metriklerini hesaplama
  const calculateRevenueMetrics = useCallback(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Monthly revenue - Aylık gelir
    const monthlyRevenue = transactions
      .filter(t => t.status === 'completed' && t.createdAt >= thisMonth)
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Last month revenue - Geçen ay geliri
    const lastMonthRevenue = transactions
      .filter(t => t.status === 'completed' && t.createdAt >= lastMonth && t.createdAt < thisMonth)
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Revenue growth - Gelir büyümesi
    const revenueGrowth = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
    
    // Active subscriptions - Aktif abonelikler
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    
    // Monthly recurring revenue - Aylık tekrarlayan gelir
    const mrr = subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + s.amount, 0);
    
    return {
      monthlyRevenue,
      lastMonthRevenue,
      revenueGrowth,
      activeSubscriptions,
      mrr
    };
  }, [transactions, subscriptions]);

  const revenueMetrics = calculateRevenueMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">💳 Payment Integration</h2>
          <p className="text-gray-600">Secure payment processing and subscription management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Shield className="h-3 w-3 mr-1" />
            PCI Compliant
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            {paymentGateways.filter(g => g.isActive).length} Gateways Active
          </Badge>
        </div>
      </div>

      {/* Revenue Overview - Gelir Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueMetrics.monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {revenueMetrics.revenueGrowth >= 0 ? (
                <span className="text-green-600">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +{revenueMetrics.revenueGrowth.toFixed(1)}% from last month
                </span>
              ) : (
                <span className="text-red-600">
                  <TrendingDown className="h-3 w-3 inline mr-1" />
                  {revenueMetrics.revenueGrowth.toFixed(1)}% from last month
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueMetrics.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueMetrics.mrr.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Predictable monthly income
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">
              +0.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Management - Ödeme Yöntemleri Yönetimi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Methods
            </div>
            <Button
              onClick={() => setShowAddPaymentMethod(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </CardTitle>
          <CardDescription>
            Manage your payment methods and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {method.type === 'credit_card' && <CreditCard className="h-5 w-5 text-blue-600" />}
                    {method.type === 'digital_wallet' && <Wallet className="h-5 w-5 text-green-600" />}
                    {method.type === 'bank_transfer' && <Building className="h-5 w-5 text-purple-600" />}
                    <div>
                      <div className="font-semibold">{method.name}</div>
                      <div className="text-sm text-gray-600">
                        {method.type === 'credit_card' && method.last4 && `•••• ${method.last4}`}
                        {method.type === 'credit_card' && method.expiryDate && ` • Expires ${method.expiryDate}`}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {method.isDefault && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Default
                    </Badge>
                  )}
                  <Badge variant={method.isActive ? 'default' : 'secondary'}>
                    {method.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
            
            {paymentMethods.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No payment methods added</p>
                <p className="text-sm text-gray-400">Add a payment method to start accepting payments</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Plans - Ödeme Planları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Payment Plans
            </div>
            <Button
              onClick={() => setShowCreatePlan(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </CardTitle>
          <CardDescription>
            Manage subscription plans and pricing tiers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paymentPlans.map((plan) => (
              <div key={plan.id} className="border rounded-lg p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${plan.amount}</div>
                    <div className="text-sm text-gray-600">per {plan.interval}</div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit Plan
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions - Son İşlemler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Recent Transactions
          </CardTitle>
          <CardDescription>
            Monitor payment transactions and revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {transaction.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {transaction.status === 'pending' && <Clock className="h-4 w-4 text-yellow-500" />}
                    {transaction.status === 'failed' && <AlertCircle className="h-4 w-4 text-red-500" />}
                    <div>
                      <div className="font-semibold">{transaction.description}</div>
                      <div className="text-sm text-gray-600">
                        {transaction.patientName} • {transaction.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${transaction.amount.toFixed(2)}</div>
                  <Badge 
                    variant={
                      transaction.status === 'completed' ? 'default' :
                      transaction.status === 'pending' ? 'secondary' : 'destructive'
                    }
                  >
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
            
            {transactions.length === 0 && (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No transactions yet</p>
                <p className="text-sm text-gray-400">Transactions will appear here once payments are processed</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Gateway Configuration - Ödeme Geçidi Yapılandırması */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Payment Gateway Configuration
            </div>
            <Button
              onClick={() => setShowGatewayConfig(true)}
              variant="outline"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </CardTitle>
          <CardDescription>
            Manage payment gateway settings and API configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentGateways.map((gateway) => (
              <div key={gateway.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">{gateway.displayName}</div>
                      <div className="text-sm text-gray-600">
                        {gateway.supportedCurrencies.join(', ')} • {gateway.fees.percentage}% + ${gateway.fees.fixed}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={gateway.isActive ? 'default' : 'secondary'}>
                    {gateway.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {gateway.isTestMode && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      Test Mode
                    </Badge>
                  )}
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    View Config
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




