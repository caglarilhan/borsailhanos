'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Download,
  Upload,
  Settings,
  PieChart,
  LineChart,
  AreaChart,
  ScatterChart,
  Gauge,
  Calendar,
  FileText,
  Award,
  Star,
  Zap,
  Brain,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Minus,
  Equal,
  Percent,
  Calculator,
  Database,
  Server,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  WifiOff,
  Plug,
  Unplug,
  Lock,
  Unlock,
  Key,
  Shield,
  Cloud,
  CloudOff,
  Globe,
  Network,
  Link,
  ArrowRight,
  ArrowLeft,
  ArrowUpDown,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  FastForward,
  Rewind,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  Phone,
  Video,
  Camera,
  Image,
  File,
  Folder,
  Archive,
  Bookmark,
  Tag,
  Flag,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  Surprised,
  Confused,
  Sad,
  Happy,
  Wink,
  Kiss,
  Tongue,
  Disappointed,
  Relieved,
  Pensive,
  Worried,
  Sleepy,
  Tired,
  Sick,
  Excited,
  Cool,
  Hot,
  Cold,
  Fire,
  Snow,
  Sun,
  Moon,
  Star as StarIcon,
  Sparkles,
  Rainbow,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Tornado,
  Hurricane,
  Earthquake,
  Volcano,
  Tsunami,
  Flood,
  Drought,
  Heat,
  Cold as ColdIcon,
  Wind,
  Storm,
  Thunder,
  Lightning,
  Rain,
  Snow as SnowIcon,
  Hail,
  Sleet,
  Fog,
  Mist,
  Smoke,
  Dust,
  Sand,
  Mud,
  Ice,
  Water,
  Steam,
  Gas,
  Liquid,
  Solid,
  Plasma,
  Energy,
  Power,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryHigh,
  BatteryFull,
  BatteryCharging,
  BatteryEmpty,
  Plug as PlugIcon,
  Unplug as UnplugIcon,
  Cable,
  Usb,
  Hdmi,
  Ethernet,
  Bluetooth,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  SignalZero,
  SignalOne,
  SignalTwo,
  SignalThree,
  SignalFour,
  SignalFive,
  SignalSix,
  SignalSeven,
  SignalEight,
  SignalNine,
  SignalTen,
  SignalEleven,
  SignalTwelve,
  SignalThirteen,
  SignalFourteen,
  SignalFifteen,
  SignalSixteen,
  SignalSeventeen,
  SignalEighteen,
  SignalNineteen,
  SignalTwenty,
  SignalTwentyOne,
  SignalTwentyTwo,
  SignalTwentyThree,
  SignalTwentyFour,
  SignalTwentyFive,
  SignalTwentySix,
  SignalTwentySeven,
  SignalTwentyEight,
  SignalTwentyNine,
  SignalThirty,
  SignalThirtyOne,
  SignalThirtyTwo,
  SignalThirtyThree,
  SignalThirtyFour,
  SignalThirtyFive,
  SignalThirtySix,
  SignalThirtySeven,
  SignalThirtyEight,
  SignalThirtyNine,
  SignalForty,
  SignalFortyOne,
  SignalFortyTwo,
  SignalFortyThree,
  SignalFortyFour,
  SignalFortyFive,
  SignalFortySix,
  SignalFortySeven,
  SignalFortyEight,
  SignalFortyNine,
  SignalFifty,
  SignalFiftyOne,
  SignalFiftyTwo,
  SignalFiftyThree,
  SignalFiftyFour,
  SignalFiftyFive,
  SignalFiftySix,
  SignalFiftySeven,
  SignalFiftyEight,
  SignalFiftyNine,
  SignalSixty,
  SignalSixtyOne,
  SignalSixtyTwo,
  SignalSixtyThree,
  SignalSixtyFour,
  SignalSixtyFive,
  SignalSixtySix,
  SignalSixtySeven,
  SignalSixtyEight,
  SignalSixtyNine,
  SignalSeventy,
  SignalSeventyOne,
  SignalSeventyTwo,
  SignalSeventyThree,
  SignalSeventyFour,
  SignalSeventyFive,
  SignalSeventySix,
  SignalSeventySeven,
  SignalSeventyEight,
  SignalSeventyNine,
  SignalEighty,
  SignalEightyOne,
  SignalEightyTwo,
  SignalEightyThree,
  SignalEightyFour,
  SignalEightyFive,
  SignalEightySix,
  SignalEightySeven,
  SignalEightyEight,
  SignalEightyNine,
  SignalNinety,
  SignalNinetyOne,
  SignalNinetyTwo,
  SignalNinetyThree,
  SignalNinetyFour,
  SignalNinetyFive,
  SignalNinetySix,
  SignalNinetySeven,
  SignalNinetyEight,
  SignalNinetyNine,
  SignalHundred
} from 'lucide-react';

// Interfaces
interface RevenueAnalytics {
  id: string;
  analysis_date: string;
  analysis_period_months: number;
  total_revenue: number;
  insurance_revenue: number;
  cash_revenue: number;
  medicare_revenue: number;
  medicaid_revenue: number;
  private_insurance_revenue: number;
  copay_collection: number;
  deductible_collection: number;
  write_offs: number;
  bad_debt: number;
  net_collection_rate: number;
  average_claim_value: number;
  claims_submitted: number;
  claims_paid: number;
  claims_denied: number;
  claims_pending: number;
  denial_rate: number;
  days_in_ar: number;
  cost_per_encounter: number;
  revenue_per_encounter: number;
  profit_margin: number;
  created_at: string;
  updated_at: string;
}

interface PredictiveInsight {
  id: string;
  insight_id: string;
  model_id: string;
  insight_type: 'forecast' | 'prediction' | 'recommendation' | 'alert' | 'trend' | 'anomaly';
  insight_title: string;
  insight_description: string;
  insight_category: 'revenue' | 'patient' | 'clinical' | 'operational' | 'financial' | 'risk';
  confidence_score: number;
  impact_score: number;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  insight_data: any;
  actionable_recommendations?: any;
  expected_outcome?: any;
  risk_factors?: any;
  mitigation_strategies?: any;
  target_audience?: string;
  insight_status: 'active' | 'acknowledged' | 'implemented' | 'dismissed' | 'expired';
  acknowledged_by?: string;
  acknowledged_at?: string;
  implemented_by?: string;
  implemented_at?: string;
  implementation_results?: any;
  created_at: string;
  updated_at: string;
}

interface KeyPerformanceIndicator {
  id: string;
  kpi_id: string;
  kpi_name: string;
  kpi_description?: string;
  kpi_category: 'financial' | 'clinical' | 'operational' | 'patient' | 'provider' | 'quality';
  kpi_type: 'metric' | 'ratio' | 'percentage' | 'count' | 'rate' | 'score';
  measurement_unit?: string;
  calculation_formula?: string;
  data_source?: string;
  target_value?: number;
  current_value?: number;
  previous_value?: number;
  benchmark_value?: number;
  trend_direction?: 'up' | 'down' | 'stable' | 'volatile';
  trend_percentage?: number;
  performance_status: 'excellent' | 'good' | 'neutral' | 'poor' | 'critical';
  alert_thresholds?: any;
  reporting_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PerformanceDashboard {
  id: string;
  dashboard_id: string;
  dashboard_name: string;
  dashboard_description?: string;
  dashboard_type: 'executive' | 'clinical' | 'financial' | 'operational' | 'patient' | 'provider' | 'custom';
  target_audience: 'admin' | 'provider' | 'finance' | 'operations' | 'executive' | 'all';
  dashboard_config: any;
  widget_configs: any;
  refresh_frequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  auto_refresh: boolean;
  is_public: boolean;
  access_permissions?: any;
  last_refreshed_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Mock data
const mockRevenueAnalytics: RevenueAnalytics[] = [
  {
    id: '1',
    analysis_date: '2024-01-20',
    analysis_period_months: 12,
    total_revenue: 1250000.00,
    insurance_revenue: 875000.00,
    cash_revenue: 150000.00,
    medicare_revenue: 400000.00,
    medicaid_revenue: 200000.00,
    private_insurance_revenue: 275000.00,
    copay_collection: 45000.00,
    deductible_collection: 30000.00,
    write_offs: 15000.00,
    bad_debt: 5000.00,
    net_collection_rate: 96.5,
    average_claim_value: 125.50,
    claims_submitted: 8500,
    claims_paid: 8200,
    claims_denied: 200,
    claims_pending: 100,
    denial_rate: 2.4,
    days_in_ar: 28.5,
    cost_per_encounter: 85.25,
    revenue_per_encounter: 147.06,
    profit_margin: 42.0,
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  }
];

const mockPredictiveInsights: PredictiveInsight[] = [
  {
    id: '1',
    insight_id: 'INSIGHT-001',
    model_id: 'MODEL-001',
    insight_type: 'forecast',
    insight_title: 'Revenue Growth Forecast',
    insight_description: 'Based on current trends, revenue is projected to increase by 12% over the next quarter',
    insight_category: 'revenue',
    confidence_score: 87.5,
    impact_score: 85.0,
    urgency_level: 'medium',
    insight_data: {
      projected_revenue: 1400000.00,
      growth_percentage: 12.0,
      timeframe: 'Q2 2024'
    },
    actionable_recommendations: [
      'Increase marketing efforts',
      'Optimize appointment scheduling',
      'Implement patient retention programs'
    ],
    insight_status: 'active',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  },
  {
    id: '2',
    insight_id: 'INSIGHT-002',
    model_id: 'MODEL-002',
    insight_type: 'alert',
    insight_title: 'Patient Attrition Risk',
    insight_description: '15% of patients show high risk of attrition in the next 30 days',
    insight_category: 'patient',
    confidence_score: 92.3,
    impact_score: 78.5,
    urgency_level: 'high',
    insight_data: {
      at_risk_patients: 375,
      risk_percentage: 15.0,
      timeframe: '30 days'
    },
    actionable_recommendations: [
      'Implement patient outreach program',
      'Review treatment plans',
      'Schedule follow-up appointments'
    ],
    insight_status: 'active',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  }
];

const mockKeyPerformanceIndicators: KeyPerformanceIndicator[] = [
  {
    id: '1',
    kpi_id: 'KPI-001',
    kpi_name: 'Net Collection Rate',
    kpi_description: 'Percentage of billed amounts collected',
    kpi_category: 'financial',
    kpi_type: 'percentage',
    measurement_unit: '%',
    target_value: 95.0,
    current_value: 96.5,
    previous_value: 94.8,
    benchmark_value: 93.0,
    trend_direction: 'up',
    trend_percentage: 1.8,
    performance_status: 'excellent',
    reporting_frequency: 'monthly',
    is_active: true,
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  },
  {
    id: '2',
    kpi_id: 'KPI-002',
    kpi_name: 'Patient Satisfaction Score',
    kpi_description: 'Average patient satisfaction rating',
    kpi_category: 'patient',
    kpi_type: 'score',
    measurement_unit: 'out of 5',
    target_value: 4.5,
    current_value: 4.6,
    previous_value: 4.4,
    benchmark_value: 4.2,
    trend_direction: 'up',
    trend_percentage: 4.5,
    performance_status: 'excellent',
    reporting_frequency: 'monthly',
    is_active: true,
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  },
  {
    id: '3',
    kpi_id: 'KPI-003',
    kpi_name: 'Days in A/R',
    kpi_description: 'Average days accounts receivable outstanding',
    kpi_category: 'financial',
    kpi_type: 'metric',
    measurement_unit: 'days',
    target_value: 30.0,
    current_value: 28.5,
    previous_value: 32.1,
    benchmark_value: 35.0,
    trend_direction: 'down',
    trend_percentage: -11.2,
    performance_status: 'excellent',
    reporting_frequency: 'monthly',
    is_active: true,
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  }
];

const mockPerformanceDashboards: PerformanceDashboard[] = [
  {
    id: '1',
    dashboard_id: 'DASH-001',
    dashboard_name: 'Executive Dashboard',
    dashboard_description: 'High-level overview of key business metrics',
    dashboard_type: 'executive',
    target_audience: 'executive',
    dashboard_config: {
      layout: 'grid',
      columns: 3,
      rows: 2
    },
    widget_configs: {
      widgets: [
        { type: 'revenue_chart', position: { x: 0, y: 0 } },
        { type: 'patient_metrics', position: { x: 1, y: 0 } },
        { type: 'kpi_summary', position: { x: 2, y: 0 } }
      ]
    },
    refresh_frequency: 'daily',
    auto_refresh: true,
    is_public: false,
    created_by: 'admin',
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  },
  {
    id: '2',
    dashboard_id: 'DASH-002',
    dashboard_name: 'Clinical Performance',
    dashboard_description: 'Clinical metrics and patient outcomes',
    dashboard_type: 'clinical',
    target_audience: 'provider',
    dashboard_config: {
      layout: 'grid',
      columns: 2,
      rows: 3
    },
    widget_configs: {
      widgets: [
        { type: 'patient_outcomes', position: { x: 0, y: 0 } },
        { type: 'treatment_effectiveness', position: { x: 1, y: 0 } }
      ]
    },
    refresh_frequency: 'weekly',
    auto_refresh: true,
    is_public: false,
    created_by: 'admin',
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  }
];

// Helper functions
const getInsightTypeIcon = (type: string) => {
  switch (type) {
    case 'forecast': return <TrendingUp className="h-4 w-4" />;
    case 'prediction': return <Brain className="h-4 w-4" />;
    case 'recommendation': return <Lightbulb className="h-4 w-4" />;
    case 'alert': return <AlertTriangle className="h-4 w-4" />;
    case 'trend': return <BarChart3 className="h-4 w-4" />;
    case 'anomaly': return <Zap className="h-4 w-4" />;
    default: return <Activity className="h-4 w-4" />;
  }
};

const getInsightCategoryIcon = (category: string) => {
  switch (category) {
    case 'revenue': return <DollarSign className="h-4 w-4" />;
    case 'patient': return <Users className="h-4 w-4" />;
    case 'clinical': return <Activity className="h-4 w-4" />;
    case 'operational': return <Settings className="h-4 w-4" />;
    case 'financial': return <Calculator className="h-4 w-4" />;
    case 'risk': return <Shield className="h-4 w-4" />;
    default: return <Target className="h-4 w-4" />;
  }
};

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'low': return 'default';
    case 'medium': return 'secondary';
    case 'high': return 'destructive';
    case 'critical': return 'destructive';
    default: return 'outline';
  }
};

const getPerformanceStatusColor = (status: string) => {
  switch (status) {
    case 'excellent': return 'default';
    case 'good': return 'secondary';
    case 'neutral': return 'outline';
    case 'poor': return 'destructive';
    case 'critical': return 'destructive';
    default: return 'outline';
  }
};

const getTrendIcon = (direction: string) => {
  switch (direction) {
    case 'up': return <ArrowUp className="h-4 w-4 text-green-600" />;
    case 'down': return <ArrowDown className="h-4 w-4 text-red-600" />;
    case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
    case 'volatile': return <Equal className="h-4 w-4 text-yellow-600" />;
    default: return <Activity className="h-4 w-4" />;
  }
};

const getDashboardTypeIcon = (type: string) => {
  switch (type) {
    case 'executive': return <Award className="h-4 w-4" />;
    case 'clinical': return <Activity className="h-4 w-4" />;
    case 'financial': return <DollarSign className="h-4 w-4" />;
    case 'operational': return <Settings className="h-4 w-4" />;
    case 'patient': return <Users className="h-4 w-4" />;
    case 'provider': return <Star className="h-4 w-4" />;
    case 'custom': return <Target className="h-4 w-4" />;
    default: return <BarChart3 className="h-4 w-4" />;
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export function BusinessIntelligenceManagement() {
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics[]>(mockRevenueAnalytics);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>(mockPredictiveInsights);
  const [keyPerformanceIndicators, setKeyPerformanceIndicators] = useState<KeyPerformanceIndicator[]>(mockKeyPerformanceIndicators);
  const [performanceDashboards, setPerformanceDashboards] = useState<PerformanceDashboard[]>(mockPerformanceDashboards);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Overview stats
  const totalRevenue = revenueAnalytics[0]?.total_revenue || 0;
  const netCollectionRate = revenueAnalytics[0]?.net_collection_rate || 0;
  const profitMargin = revenueAnalytics[0]?.profit_margin || 0;
  const activeInsights = predictiveInsights.filter(insight => insight.insight_status === 'active').length;
  const criticalInsights = predictiveInsights.filter(insight => insight.urgency_level === 'critical').length;
  const excellentKPIs = keyPerformanceIndicators.filter(kpi => kpi.performance_status === 'excellent').length;
  const totalDashboards = performanceDashboards.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Business Intelligence</h2>
          <p className="text-muted-foreground">
            Advanced analytics dashboard, predictive modeling, and performance metrics for American psychiatrists
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Dashboard
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Net collection rate: {formatPercentage(netCollectionRate)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictive Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInsights}</div>
            <p className="text-xs text-muted-foreground">
              {criticalInsights} critical insights
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KPI Performance</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{excellentKPIs}</div>
            <p className="text-xs text-muted-foreground">
              {keyPerformanceIndicators.length} total KPIs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dashboards</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDashboards}</div>
            <p className="text-xs text-muted-foreground">
              Profit margin: {formatPercentage(profitMargin)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="insights">Predictive Insights</TabsTrigger>
          <TabsTrigger value="kpis">Key Performance Indicators</TabsTrigger>
          <TabsTrigger value="dashboards">Performance Dashboards</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Predictive Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Predictive Insights</CardTitle>
                <CardDescription>Latest AI-powered insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {predictiveInsights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getInsightTypeIcon(insight.insight_type)}
                      <div>
                        <p className="font-medium">{insight.insight_title}</p>
                        <p className="text-sm text-muted-foreground">
                          {insight.insight_category} • {insight.confidence_score}% confidence
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getUrgencyColor(insight.urgency_level)}>
                        {insight.urgency_level}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(insight.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Key Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
                <CardDescription>Critical business metrics and trends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {keyPerformanceIndicators.slice(0, 3).map((kpi) => (
                  <div key={kpi.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTrendIcon(kpi.trend_direction || 'stable')}
                      <div>
                        <p className="font-medium">{kpi.kpi_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {kpi.kpi_category} • {kpi.measurement_unit}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getPerformanceStatusColor(kpi.performance_status)}>
                        {kpi.performance_status}
                      </Badge>
                      <p className="text-sm font-semibold mt-1">
                        {kpi.current_value}{kpi.measurement_unit}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Revenue Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics Summary</CardTitle>
              <CardDescription>Financial performance overview and trends</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueAnalytics.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(revenueAnalytics[0].insurance_revenue)}
                    </div>
                    <p className="text-sm text-muted-foreground">Insurance Revenue</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(revenueAnalytics[0].cash_revenue)}
                    </div>
                    <p className="text-sm text-muted-foreground">Cash Revenue</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(revenueAnalytics[0].average_claim_value)}
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Claim Value</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {revenueAnalytics[0].days_in_ar} days
                    </div>
                    <p className="text-sm text-muted-foreground">Days in A/R</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Analytics Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Comprehensive financial performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueAnalytics.length > 0 && (
                <div className="space-y-6">
                  {/* Revenue Breakdown */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(revenueAnalytics[0].insurance_revenue)}
                        </div>
                        <p className="text-sm text-muted-foreground">Insurance Revenue</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                          {formatCurrency(revenueAnalytics[0].cash_revenue)}
                        </div>
                        <p className="text-sm text-muted-foreground">Cash Revenue</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-purple-600">
                          {formatCurrency(revenueAnalytics[0].medicare_revenue)}
                        </div>
                        <p className="text-sm text-muted-foreground">Medicare Revenue</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-orange-600">
                          {formatCurrency(revenueAnalytics[0].medicaid_revenue)}
                        </div>
                        <p className="text-sm text-muted-foreground">Medicaid Revenue</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-red-600">
                          {formatCurrency(revenueAnalytics[0].private_insurance_revenue)}
                        </div>
                        <p className="text-sm text-muted-foreground">Private Insurance</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-gray-600">
                          {formatCurrency(revenueAnalytics[0].copay_collection)}
                        </div>
                        <p className="text-sm text-muted-foreground">Copay Collection</p>
                      </div>
                    </div>
                  </div>

                  {/* Claims Performance */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Claims Performance</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-green-600">
                          {revenueAnalytics[0].claims_submitted.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">Claims Submitted</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                          {revenueAnalytics[0].claims_paid.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">Claims Paid</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-red-600">
                          {revenueAnalytics[0].claims_denied.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">Claims Denied</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-yellow-600">
                          {revenueAnalytics[0].claims_pending.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">Claims Pending</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Financial Metrics</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-green-600">
                          {formatPercentage(revenueAnalytics[0].net_collection_rate)}
                        </div>
                        <p className="text-sm text-muted-foreground">Net Collection Rate</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                          {formatPercentage(revenueAnalytics[0].denial_rate)}
                        </div>
                        <p className="text-sm text-muted-foreground">Denial Rate</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-purple-600">
                          {formatPercentage(revenueAnalytics[0].profit_margin)}
                        </div>
                        <p className="text-sm text-muted-foreground">Profit Margin</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-orange-600">
                          {revenueAnalytics[0].days_in_ar} days
                        </div>
                        <p className="text-sm text-muted-foreground">Days in A/R</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictive Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Predictive Insights</CardTitle>
              <CardDescription>AI-powered insights and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictiveInsights.map((insight) => (
                  <div key={insight.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getInsightTypeIcon(insight.insight_type)}
                      <div>
                        <h3 className="font-semibold">{insight.insight_title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {insight.insight_description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{insight.insight_type}</Badge>
                          <Badge variant="outline">{insight.insight_category}</Badge>
                          <Badge variant="outline">{insight.confidence_score}% confidence</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <Badge variant={getUrgencyColor(insight.urgency_level)}>
                          {insight.urgency_level}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          Impact: {insight.impact_score}%
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Key Performance Indicators Tab */}
        <TabsContent value="kpis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>Critical business metrics and performance tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {keyPerformanceIndicators.map((kpi) => (
                  <div key={kpi.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getTrendIcon(kpi.trend_direction || 'stable')}
                      <div>
                        <h3 className="font-semibold">{kpi.kpi_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {kpi.kpi_description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{kpi.kpi_category}</Badge>
                          <Badge variant="outline">{kpi.kpi_type}</Badge>
                          <Badge variant="outline">{kpi.reporting_frequency}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <Badge variant={getPerformanceStatusColor(kpi.performance_status)}>
                          {kpi.performance_status}
                        </Badge>
                        <p className="text-sm font-semibold mt-1">
                          {kpi.current_value}{kpi.measurement_unit}
                        </p>
                        {kpi.trend_percentage && (
                          <p className="text-xs text-muted-foreground">
                            {kpi.trend_percentage > 0 ? '+' : ''}{kpi.trend_percentage}%
                          </p>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Dashboards Tab */}
        <TabsContent value="dashboards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Dashboards</CardTitle>
              <CardDescription>Customizable dashboards for different audiences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceDashboards.map((dashboard) => (
                  <div key={dashboard.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getDashboardTypeIcon(dashboard.dashboard_type)}
                      <div>
                        <h3 className="font-semibold">{dashboard.dashboard_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {dashboard.dashboard_description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{dashboard.dashboard_type}</Badge>
                          <Badge variant="outline">{dashboard.target_audience}</Badge>
                          <Badge variant="outline">{dashboard.refresh_frequency}</Badge>
                          {dashboard.is_public && (
                            <Badge variant="outline">Public</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {dashboard.last_refreshed_at && formatDate(dashboard.last_refreshed_at)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Auto-refresh: {dashboard.auto_refresh ? 'On' : 'Off'}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}




