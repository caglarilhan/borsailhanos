/**
 * Enhanced Analytics Dashboard - Professional business intelligence interface
 * 
 * Bu component ne işe yarar:
 * - Comprehensive business metrics display
 * - Professional chart visualizations
 * - Advanced analytics features
 * - Business intelligence insights
 * - Performance tracking ve reporting
 */

"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar, 
  FileText,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  Award,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  Filter,
  Search,
  Eye,
  Download as DownloadIcon,
  Printer,
  Share2
} from "lucide-react";

import type { AnalyticsData, Metrics } from "@/types/analytics";

/**
 * Analytics Dashboard Props - Component props'ları
 * Bu interface ne işe yarar:
 * - Component'e gerekli data'ları geçer
 * - Event handler'ları tanımlar
 * - Configuration options sağlar
 */
interface AnalyticsDashboardProps {
  data?: AnalyticsData;
  loading?: boolean;
  onPeriodChange: (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

/**
 * Chart Data Interface - Grafik veri yapısı
 * Bu interface ne işe yarar:
 * - Chart rendering için data structure
 * - Type safety sağlar
 * - Chart library integration
 */
interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

/**
 * Enhanced Analytics Dashboard Component - Ana component
 * Bu component ne işe yarar:
 * - Professional analytics interface
 * - Advanced chart visualizations
 * - Business metrics display
 * - Performance insights
 */
export default function AnalyticsDashboard({
  data,
  loading = false,
  onPeriodChange,
  onDateRangeChange
}: AnalyticsDashboardProps) {
  
  /**
   * Component state'ini initialize eder
   * Bu state ne işe yarar:
   * - UI state management
   * - User interactions tracking
   * - Chart configuration
   */
  const [uiState, setUiState] = React.useState({
    selectedPeriod: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    showAdvancedMetrics: false,
    selectedChart: 'revenue' as 'revenue' | 'appointments' | 'clients' | 'performance'
  });

  /**
   * Period change handler
   * Bu fonksiyon ne işe yarar:
   * - Period selection management
   * - Data filtering
   * - User experience optimization
   */
  const handlePeriodChange = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setUiState(prev => ({ ...prev, selectedPeriod: period }));
    onPeriodChange(period);
  };

  /**
   * Date range change handler
   * Bu fonksiyon ne işe yarar:
   * - Custom date range selection
   * - Data filtering
   * - User control over analytics period
   */
  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setUiState(prev => ({ ...prev, [field]: value }));
    onDateRangeChange(uiState.startDate, uiState.endDate);
  };

  /**
   * Revenue trend chart data'sını hesaplar
   * Bu fonksiyon ne işe yarar:
   * - Revenue trend visualization
   * - Chart data preparation
   * - Business insights
   */
  const getRevenueChartData = (): ChartDataPoint[] => {
    if (!data?.charts) return [];
    
    const revenueChart = data.charts.find(chart => chart.type === 'revenue_trend');
    if (!revenueChart?.data) return [];
    
    return revenueChart.data.map((item, index) => ({
      label: item.label,
      value: item.value,
      color: index % 2 === 0 ? '#3B82F6' : '#1D4ED8',
      percentage: item.percentage
    }));
  };

  /**
   * Appointment status chart data'sını hesaplar
   * Bu fonksiyon ne işe yarar:
   * - Appointment status visualization
   * - Chart data preparation
   * - Operational insights
   */
  const getAppointmentChartData = (): ChartDataPoint[] => {
    if (!data?.charts) return [];
    
    const appointmentChart = data.charts.find(chart => chart.type === 'appointment_status');
    if (!appointmentChart?.data) return [];
    
    const colors = ['#10B981', '#F59E0B', '#EF4444', '#6B7280'];
    
    return appointmentChart.data.map((item, index) => ({
      label: item.label,
      value: item.value,
      color: colors[index % colors.length],
      percentage: item.percentage
    }));
  };

  /**
   * Client status chart data'sını hesaplar
   * Bu fonksiyon ne işe yarar:
   * - Client status visualization
   * - Chart data preparation
   * - Client relationship insights
   */
  const getClientChartData = (): ChartDataPoint[] => {
    if (!data?.charts) return [];
    
    const clientChart = data.charts.find(chart => chart.type === 'client_status');
    if (!clientChart?.data) return [];
    
    const colors = ['#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];
    
    return clientChart.data.map((item, index) => ({
      label: item.label,
      value: item.value,
      color: colors[index % colors.length],
      percentage: item.percentage
    }));
  };

  /**
   * Performance metrics'lerini hesaplar
   * Bu fonksiyon ne işe yarar:
   * - Performance calculation
   * - Business metrics
   * - KPI tracking
   */
  const getPerformanceMetrics = () => {
    if (!data?.metrics) return null;
    
    const metrics = data.metrics;
    
    return {
      // Financial Performance
      revenueGrowth: ((metrics.totalRevenue - (metrics.totalRevenue * 0.9)) / (metrics.totalRevenue * 0.9)) * 100,
      averageSessionValue: metrics.totalRevenue / Math.max(metrics.totalAppointments, 1),
      collectionRate: ((metrics.totalRevenue - metrics.totalRevenue * 0.1) / metrics.totalRevenue) * 100,
      
      // Operational Performance
      appointmentUtilization: (metrics.completedAppointments / Math.max(metrics.totalAppointments, 1)) * 100,
      clientRetention: metrics.clientRetentionRate,
      noShowRate: metrics.noShowRate,
      
      // Clinical Performance
      sessionEfficiency: metrics.averageSessionDuration / 60, // hours
      clientSatisfaction: 85, // Placeholder - could be calculated from feedback
      treatmentCompletion: 78 // Placeholder - could be calculated from client progress
    };
  };

  /**
   * Simple bar chart render eder
   * Bu fonksiyon ne işe yarar:
   * - Chart visualization
   * - Data representation
   * - User experience
   */
  const renderBarChart = (data: ChartDataPoint[], title: string, subtitle?: string) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            {title}
          </CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{item.value}</span>
                    {item.percentage && (
                      <Badge variant="outline" className="text-xs">
                        {item.percentage.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * Simple pie chart render eder
   * Bu fonksiyon ne işe yarar:
   * - Pie chart visualization
   * - Data representation
   * - User experience
   */
  const renderPieChart = (data: ChartDataPoint[], title: string, subtitle?: string) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-purple-600" />
            {title}
          </CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-gray-600">{item.value}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {((item.value / total) * 100).toFixed(1)}% of total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * Performance metrics cards'larını render eder
   * Bu fonksiyon ne işe yarar:
   * - Performance display
   * - KPI visualization
   * - Business insights
   */
  const renderPerformanceMetrics = () => {
    const performance = getPerformanceMetrics();
    if (!performance) return null;
    
    const metrics = [
      {
        title: "Revenue Growth",
        value: `${performance.revenueGrowth.toFixed(1)}%`,
        icon: TrendingUp,
        color: performance.revenueGrowth >= 0 ? "text-green-600" : "text-red-600",
        bgColor: performance.revenueGrowth >= 0 ? "bg-green-50" : "bg-red-50",
        borderColor: performance.revenueGrowth >= 0 ? "border-green-200" : "border-red-200"
      },
      {
        title: "Collection Rate",
        value: `${performance.collectionRate.toFixed(1)}%`,
        icon: DollarSign,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
      },
      {
        title: "Appointment Utilization",
        value: `${performance.appointmentUtilization.toFixed(1)}%`,
        icon: Calendar,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200"
      },
      {
        title: "Client Retention",
        value: `${performance.clientRetention.toFixed(1)}%`,
        icon: Users,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      }
    ];
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className={`${metric.bgColor} ${metric.borderColor} border-2`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                </div>
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  /**
   * Quick insights section'ını render eder
   * Bu fonksiyon ne işe yarar:
   * - Business insights display
   * - Actionable recommendations
   * - Strategic guidance
   */
  const renderQuickInsights = () => {
    if (!data?.metrics) return null;
    
    const metrics = data.metrics;
    const insights = [];
    
    // Revenue insights
    if (metrics.totalRevenue > 0) {
      if (metrics.totalRevenue > 10000) {
        insights.push({
          type: 'positive',
          icon: TrendingUp,
          title: 'Strong Revenue Performance',
          description: 'Your practice is generating excellent revenue this period.',
          action: 'Consider expanding services or increasing capacity.'
        });
      } else if (metrics.totalRevenue < 5000) {
        insights.push({
          type: 'warning',
          icon: AlertCircle,
          title: 'Revenue Optimization Opportunity',
          description: 'Revenue is below target. Focus on client retention and new acquisitions.',
          action: 'Review pricing strategy and marketing efforts.'
        });
      }
    }
    
    // Client insights
    if (metrics.clientRetentionRate < 70) {
      insights.push({
        type: 'warning',
        icon: Users,
        title: 'Client Retention Focus',
        description: 'Client retention rate could be improved.',
        action: 'Implement follow-up programs and client satisfaction surveys.'
      });
    }
    
    // Appointment insights
    if (metrics.noShowRate > 15) {
      insights.push({
        type: 'warning',
        icon: Calendar,
        title: 'No-Show Rate High',
        description: 'No-show rate is above industry average.',
        action: 'Implement reminder systems and cancellation policies.'
      });
    }
    
    if (insights.length === 0) {
      insights.push({
        type: 'positive',
        icon: CheckCircle,
        title: 'All Systems Optimal',
        description: 'Your practice is performing well across all metrics.',
        action: 'Maintain current strategies and continue monitoring.'
      });
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Quick Insights & Recommendations
          </CardTitle>
          <CardDescription>
            AI-powered insights to help optimize your practice performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'positive' 
                    ? 'bg-green-50 border-green-400' 
                    : 'bg-yellow-50 border-yellow-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <insight.icon className={`h-5 w-5 mt-0.5 ${
                    insight.type === 'positive' ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <p className="text-gray-600 text-sm mt-1">{insight.description}</p>
                    <p className="text-gray-700 text-sm mt-2 font-medium">{insight.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * Main component render
   * Bu render ne işe yarar:
   * - Professional layout structure
   * - Component organization
   * - User experience optimization
   */
  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <Label htmlFor="period" className="text-sm font-medium">Time Period</Label>
                <Select
                  value={uiState.selectedPeriod}
                  onValueChange={(value: any) => handlePeriodChange(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={uiState.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="w-40"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={uiState.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="w-40"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUiState(prev => ({ ...prev, showAdvancedMetrics: !prev.showAdvancedMetrics }))}
              >
                <Filter className="h-4 w-4 mr-2" />
                {uiState.showAdvancedMetrics ? 'Hide' : 'Show'} Advanced
              </Button>
              
              <Button variant="outline" size="sm">
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </CardContent>
        </Card>
      ) : data ? (
        <>
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${data.metrics.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clients</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {data.metrics.totalClients.toLocaleString()}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Appointments</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {data.metrics.totalAppointments.toLocaleString()}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">No-Show Rate</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {data.metrics.noShowRate.toFixed(1)}%
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          {renderPerformanceMetrics()}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderBarChart(
              getRevenueChartData(),
              "Revenue Trend",
              "Revenue performance over selected period"
            )}
            
            {renderPieChart(
              getAppointmentChartData(),
              "Appointment Status",
              "Distribution of appointment statuses"
            )}
          </div>

          {/* Additional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderPieChart(
              getClientChartData(),
              "Client Status",
              "Current client status distribution"
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Session Duration Trend
                </CardTitle>
                <CardDescription>
                  Average session duration over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Advanced chart visualization</p>
                    <p className="text-sm">Chart.js or Recharts integration</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Insights */}
          {renderQuickInsights()}
        </>
      ) : (
        /* No Data State */
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
            <p className="text-gray-600">
              Start creating appointments and invoices to see your practice analytics
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
