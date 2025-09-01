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
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Users, 
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Star,
  Heart,
  Brain,
  Zap,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Lock,
  Unlock,
  Shield,
  User,
  UserCheck,
  UserX,
  Phone,
  Mail,
  MessageSquare,
  Bell,
  BellOff,
  BookOpen,
  FileText,
  FileCheck,
  FileX,
  FilePlus,
  FileMinus,
  FileEdit,
  FileAlertCircle,
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

// Advanced Analytics için gerekli interface'ler
interface BusinessMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number; // percentage change
  trend: 'up' | 'down' | 'stable';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  category: 'revenue' | 'patients' | 'efficiency' | 'satisfaction' | 'operations';
  target?: number;
  lastUpdated: Date;
}

interface PredictiveInsight {
  id: string;
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: 'high' | 'medium' | 'low';
  category: 'revenue' | 'patients' | 'efficiency' | 'satisfaction' | 'operations';
  prediction: {
    value: number;
    unit: string;
    timeframe: string;
  };
  factors: string[];
  recommendations: string[];
  createdAt: Date;
}

interface CohortAnalysis {
  id: string;
  cohortName: string;
  startDate: Date;
  endDate: Date;
  size: number;
  retention: {
    day1: number;
    day7: number;
    day30: number;
    day90: number;
  };
  revenue: {
    total: number;
    average: number;
    lifetime: number;
  };
  engagement: {
    sessions: number;
    duration: number;
    features: string[];
  };
}

interface FunnelAnalysis {
  id: string;
  name: string;
  stages: {
    name: string;
    count: number;
    conversionRate: number;
    dropoffRate: number;
  }[];
  totalConversion: number;
  averageTime: number; // minutes
  bottlenecks: string[];
  recommendations: string[];
  lastUpdated: Date;
}

interface CustomReport {
  id: string;
  name: string;
  description: string;
  type: 'chart' | 'table' | 'metric' | 'dashboard';
  dataSource: string;
  filters: Record<string, unknown>;
  schedule: 'manual' | 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  lastRun: Date;
  nextRun: Date;
  isActive: boolean;
}

// Advanced Analytics Component - Gelişmiş analitik sistemi
export function AdvancedAnalytics() {
  // State management - Uygulama durumunu yönetmek için
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetric[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
  const [cohortAnalyses, setCohortAnalyses] = useState<CohortAnalysis[]>([]);
  const [funnelAnalyses, setFunnelAnalyses] = useState<FunnelAnalysis[]>([]);
  const [customReports, setCustomReports] = useState<CustomReport[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<BusinessMetric | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<PredictiveInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateReport, setShowCreateReport] = useState(false);
  const [showPredictiveAnalysis, setShowPredictiveAnalysis] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Mock data initialization - Test verilerini yüklemek için
  useEffect(() => {
    // Simulated data loading - Gerçek API'den veri çekme simülasyonu
    const mockBusinessMetrics: BusinessMetric[] = [
      {
        id: '1',
        name: 'Monthly Recurring Revenue',
        value: 45000,
        unit: 'USD',
        change: 12.5,
        trend: 'up',
        period: 'monthly',
        category: 'revenue',
        target: 50000,
        lastUpdated: new Date()
      },
      {
        id: '2',
        name: 'Patient Retention Rate',
        value: 87.3,
        unit: '%',
        change: 2.1,
        trend: 'up',
        period: 'monthly',
        category: 'patients',
        target: 90,
        lastUpdated: new Date()
      },
      {
        id: '3',
        name: 'Average Session Duration',
        value: 45.2,
        unit: 'minutes',
        change: -1.8,
        trend: 'down',
        period: 'weekly',
        category: 'efficiency',
        lastUpdated: new Date()
      },
      {
        id: '4',
        name: 'Patient Satisfaction Score',
        value: 4.6,
        unit: '/5',
        change: 0.2,
        trend: 'up',
        period: 'monthly',
        category: 'satisfaction',
        target: 4.8,
        lastUpdated: new Date()
      }
    ];

    const mockPredictiveInsights: PredictiveInsight[] = [
      {
        id: '1',
        title: 'Revenue Growth Prediction',
        description: 'Based on current trends, revenue is expected to grow by 15% in the next quarter',
        confidence: 85,
        impact: 'high',
        category: 'revenue',
        prediction: {
          value: 51750,
          unit: 'USD',
          timeframe: 'Next Quarter'
        },
        factors: [
          'Increasing patient acquisition rate',
          'Higher average session value',
          'Improved retention metrics'
        ],
        recommendations: [
          'Focus on high-value patient segments',
          'Optimize pricing strategy',
          'Enhance patient experience'
        ],
        createdAt: new Date()
      },
      {
        id: '2',
        title: 'Patient Churn Risk',
        description: '15% of patients show signs of potential churn in the next 30 days',
        confidence: 72,
        impact: 'medium',
        category: 'patients',
        prediction: {
          value: 15,
          unit: '%',
          timeframe: 'Next 30 Days'
        },
        factors: [
          'Decreased session frequency',
          'Lower engagement scores',
          'Missed appointments'
        ],
        recommendations: [
          'Implement re-engagement campaigns',
          'Offer personalized incentives',
          'Improve communication frequency'
        ],
        createdAt: new Date()
      }
    ];

    const mockCohortAnalyses: CohortAnalysis[] = [
      {
        id: '1',
        cohortName: 'Q1 2024 New Patients',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        size: 150,
        retention: {
          day1: 100,
          day7: 85,
          day30: 72,
          day90: 68
        },
        revenue: {
          total: 67500,
          average: 450,
          lifetime: 612
        },
        engagement: {
          sessions: 8.5,
          duration: 42,
          features: ['Appointments', 'Messages', 'Resources']
        }
      }
    ];

    const mockFunnelAnalyses: FunnelAnalysis[] = [
      {
        id: '1',
        name: 'Patient Onboarding Funnel',
        stages: [
          { name: 'Sign Up', count: 1000, conversionRate: 100, dropoffRate: 0 },
          { name: 'Profile Complete', count: 850, conversionRate: 85, dropoffRate: 15 },
          { name: 'First Appointment', count: 680, conversionRate: 68, dropoffRate: 17 },
          { name: 'Second Appointment', count: 544, conversionRate: 54.4, dropoffRate: 13.6 },
          { name: 'Active Patient', count: 435, conversionRate: 43.5, dropoffRate: 10.9 }
        ],
        totalConversion: 43.5,
        averageTime: 14, // days
        bottlenecks: [
          'Profile completion takes too long',
          'First appointment scheduling friction'
        ],
        recommendations: [
          'Simplify profile completion process',
          'Implement one-click appointment booking',
          'Add onboarding progress indicators'
        ],
        lastUpdated: new Date()
      }
    ];

    const mockCustomReports: CustomReport[] = [
      {
        id: '1',
        name: 'Weekly Revenue Report',
        description: 'Comprehensive revenue analysis with patient segmentation',
        type: 'dashboard',
        dataSource: 'transactions_db',
        filters: { period: 'weekly', includeRefunds: false },
        schedule: 'weekly',
        recipients: ['admin@mindtrack.com', 'finance@mindtrack.com'],
        lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        id: '2',
        name: 'Patient Satisfaction Trends',
        description: 'Monthly patient satisfaction analysis with trend visualization',
        type: 'chart',
        dataSource: 'feedback_db',
        filters: { period: 'monthly', minRating: 3 },
        schedule: 'monthly',
        recipients: ['operations@mindtrack.com'],
        lastRun: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      }
    ];

    setBusinessMetrics(mockBusinessMetrics);
    setPredictiveInsights(mockPredictiveInsights);
    setCohortAnalyses(mockCohortAnalyses);
    setFunnelAnalyses(mockFunnelAnalyses);
    setCustomReports(mockCustomReports);
  }, []);

  // Generate predictive insights - Tahminsel içgörüler oluşturma
  const generatePredictiveInsights = useCallback(async () => {
    setLoading(true);
    
    try {
      // Simulated predictive analysis - Tahminsel analiz simülasyonu
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // AI-powered predictive insights - AI destekli tahminsel içgörüler
      const newInsights: PredictiveInsight[] = [
        {
          id: `insight_${Date.now()}`,
          title: 'Seasonal Revenue Pattern',
          description: 'Revenue typically increases by 20% during holiday seasons',
          confidence: 78,
          impact: 'medium',
          category: 'revenue',
          prediction: {
            value: 54000,
            unit: 'USD',
            timeframe: 'Holiday Season'
          },
          factors: [
            'Historical seasonal patterns',
            'Increased patient demand',
            'Marketing campaign effectiveness'
          ],
          recommendations: [
            'Prepare for increased demand',
            'Optimize staffing schedules',
            'Launch seasonal promotions'
          ],
          createdAt: new Date()
        },
        {
          id: `insight_${Date.now() + 1}`,
          title: 'Feature Adoption Prediction',
          description: 'Telehealth feature adoption expected to reach 75% in 3 months',
          confidence: 82,
          impact: 'high',
          category: 'efficiency',
          prediction: {
            value: 75,
            unit: '%',
            timeframe: '3 Months'
          },
          factors: [
            'Current adoption rate trends',
            'Patient feedback scores',
            'Feature improvement roadmap'
          ],
          recommendations: [
            'Enhance telehealth features',
            'Provide training for patients',
            'Monitor adoption metrics'
          ],
          createdAt: new Date()
        }
      ];
      
      setPredictiveInsights(prev => [...newInsights, ...prev]);
      
      return newInsights;
      
    } catch (error) {
      console.error('Predictive insights generation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create custom report - Özel rapor oluşturma
  const createCustomReport = useCallback(async (
    name: string,
    description: string,
    type: CustomReport['type'],
    dataSource: string,
    filters: Record<string, unknown>,
    schedule: CustomReport['schedule'],
    recipients: string[]
  ) => {
    setLoading(true);
    
    try {
      // Simulated report creation - Rapor oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newReport: CustomReport = {
        id: `report_${Date.now()}`,
        name,
        description,
        type,
        dataSource,
        filters,
        schedule,
        recipients,
        lastRun: new Date(),
        nextRun: schedule === 'daily' ? new Date(Date.now() + 24 * 60 * 60 * 1000) :
                 schedule === 'weekly' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) :
                 new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
      };
      
      setCustomReports(prev => [...prev, newReport]);
      setShowCreateReport(false);
      
      return newReport;
      
    } catch (error) {
      console.error('Custom report creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate business health score - İş sağlığı skoru hesaplama
  const calculateBusinessHealthScore = useCallback(() => {
    if (businessMetrics.length === 0) return 0;
    
    // Business health scoring algorithm - İş sağlığı puanlama algoritması
    let score = 0;
    let totalWeight = 0;
    
    businessMetrics.forEach(metric => {
      let weight = 1;
      let metricScore = 0;
      
      // Assign weights based on category - Kategoriye göre ağırlık atama
      switch (metric.category) {
        case 'revenue':
          weight = 3;
          break;
        case 'patients':
          weight = 2.5;
          break;
        case 'satisfaction':
          weight = 2;
          break;
        case 'efficiency':
          weight = 1.5;
          break;
        case 'operations':
          weight = 1;
          break;
      }
      
      // Calculate metric score - Metrik skoru hesaplama
      if (metric.target) {
        const achievement = (metric.value / metric.target) * 100;
        metricScore = Math.min(achievement, 100);
      } else {
        // For metrics without targets, use trend - Hedef olmayan metrikler için trend kullan
        if (metric.trend === 'up') metricScore = 80;
        else if (metric.trend === 'stable') metricScore = 60;
        else metricScore = 40;
      }
      
      score += metricScore * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? Math.round(score / totalWeight) : 0;
  }, [businessMetrics]);

  const businessHealthScore = calculateBusinessHealthScore();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📈 Advanced Analytics</h2>
          <p className="text-gray-600">Business intelligence and predictive analytics for data-driven decisions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Brain className="h-3 w-3 mr-1" />
            {predictiveInsights.length} AI Insights
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            {businessHealthScore}% Business Health
          </Badge>
        </div>
      </div>

      {/* Business Health Overview - İş Sağlığı Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Health Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessHealthScore}%</div>
            <p className="text-xs text-muted-foreground">
              {businessHealthScore >= 80 ? 'Excellent' : businessHealthScore >= 60 ? 'Good' : 'Needs attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictive Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictiveInsights.length}</div>
            <p className="text-xs text-muted-foreground">
              {predictiveInsights.filter(i => i.impact === 'high').length} high impact
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customReports.filter(r => r.isActive).length}</div>
            <p className="text-xs text-muted-foreground">
              Automated reporting enabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Accuracy</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">
              +0.3% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Business Metrics Dashboard - İş Metrikleri Paneli */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Key Business Metrics
            </div>
            <Button
              onClick={() => setShowPredictiveAnalysis(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Brain className="h-4 w-4 mr-2" />
              Generate Insights
            </Button>
          </CardTitle>
          <CardDescription>
            Real-time business performance indicators and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {businessMetrics.map((metric) => (
              <div key={metric.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{metric.name}</div>
                    <div className="text-sm text-gray-600">{metric.period} metric</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {metric.value.toLocaleString()}{metric.unit}
                    </div>
                    <div className={`text-sm ${
                      metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change >= 0 ? '+' : ''}{metric.change}%
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Target:</span>
                    <span className="text-sm font-semibold">
                      {metric.target ? `${metric.target.toLocaleString()}${metric.unit}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Trend:</span>
                    <Badge variant="outline" className={
                      metric.trend === 'up' ? 'text-green-600' :
                      metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }>
                      {metric.trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                      {metric.trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                      {metric.trend}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictive Insights - Tahminsel İçgörüler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            AI-Powered Predictive Insights
          </CardTitle>
          <CardDescription>
            Machine learning insights for strategic decision making
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictiveInsights.map((insight) => (
              <div key={insight.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{insight.title}</div>
                    <div className="text-sm text-gray-600">{insight.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={insight.impact === 'high' ? 'destructive' : 'secondary'}>
                      {insight.impact} impact
                    </Badge>
                    <Badge variant="outline">
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Prediction</h4>
                    <div className="text-lg font-bold">
                      {insight.prediction.value.toLocaleString()}{insight.prediction.unit}
                    </div>
                    <div className="text-sm text-gray-600">{insight.prediction.timeframe}</div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Key Factors</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {insight.factors.slice(0, 3).map((factor, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Recommendations</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {insight.recommendations.slice(0, 3).map((rec, index) => (
                        <li key={index} className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-500" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
            
            {predictiveInsights.length === 0 && (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No predictive insights yet</p>
                <p className="text-sm text-gray-400">Click "Generate Insights" to create AI-powered predictions</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Funnel Analysis - Huni Analizi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Conversion Funnel Analysis
          </CardTitle>
          <CardDescription>
            Track user journey and identify conversion bottlenecks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnelAnalyses.map((funnel) => (
              <div key={funnel.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-semibold">{funnel.name}</div>
                    <div className="text-sm text-gray-600">
                      Total conversion: {funnel.totalConversion}% • Avg time: {funnel.averageTime} days
                    </div>
                  </div>
                  <Badge variant="outline">
                    {funnel.stages.length} stages
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {funnel.stages.map((stage, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-20 text-sm font-medium">{stage.name}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{stage.count} users</span>
                          <span className="text-sm text-gray-600">{stage.conversionRate}%</span>
                        </div>
                        <Progress value={stage.conversionRate} className="h-2" />
                      </div>
                      {index < funnel.stages.length - 1 && (
                        <div className="text-red-500 text-sm">
                          -{stage.dropoffRate}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-sm mb-2">Bottlenecks & Recommendations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-red-600 mb-1">Bottlenecks:</h5>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {funnel.bottlenecks.map((bottleneck, index) => (
                          <li key={index} className="flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
                            {bottleneck}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-green-600 mb-1">Recommendations:</h5>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {funnel.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Reports - Özel Raporlar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Custom Reports
            </div>
            <Button
              onClick={() => setShowCreateReport(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </CardTitle>
          <CardDescription>
            Automated reports and scheduled analytics delivery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {report.type === 'chart' && <BarChart3 className="h-5 w-5 text-blue-600" />}
                    {report.type === 'table' && <FileText className="h-5 w-5 text-green-600" />}
                    {report.type === 'metric' && <Activity className="h-5 w-5 text-purple-600" />}
                    {report.type === 'dashboard' && <PieChart className="h-5 w-5 text-orange-600" />}
                    <div>
                      <div className="font-semibold">{report.name}</div>
                      <div className="text-sm text-gray-600">{report.description}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={report.isActive ? 'default' : 'secondary'}>
                    {report.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">
                    {report.schedule}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
            
            {customReports.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No custom reports created</p>
                <p className="text-sm text-gray-400">Create your first automated report to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

