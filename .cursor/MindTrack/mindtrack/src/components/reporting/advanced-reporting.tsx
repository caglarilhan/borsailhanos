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
  Download,
  Upload,
  Calendar,
  Clock,
  Users,
  DollarSign,
  FileText,
  Settings,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Eye,
  EyeOff,
  Filter,
  Search,
  RefreshCw,
  Zap,
  Target,
  Award,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Activity,
  Database,
  BarChart,
  PieChartIcon,
  LineChartIcon,
  ScatterChart,
  AreaChart,
  Table,
  List,
  Grid,
  Columns,
  Rows,
  FilterIcon,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Stop,
  RotateCcw,
  Save,
  Printer,
  Mail,
  MessageSquare,
  Bell,
  Bookmark,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Shield,
  Lock,
  Unlock,
  Key,
  User,
  UserCheck,
  UserX,
  Users as UsersIcon,
  UserPlus,
  UserMinus,
  UserCog,
  UserEdit,
  UserSearch,
  UserX as UserXIcon,
  UserCheck as UserCheckIcon,
  UserPlus as UserPlusIcon,
  UserMinus as UserMinusIcon,
  UserCog as UserCogIcon,
  UserEdit as UserEditIcon,
  UserSearch as UserSearchIcon
} from "lucide-react";

// Advanced Reporting & Business Intelligence için gerekli interface'ler
interface CustomReport {
  id: string;
  name: string;
  description: string;
  type: 'dashboard' | 'analytics' | 'financial' | 'operational' | 'clinical' | 'custom';
  category: 'kpi' | 'performance' | 'trends' | 'comparison' | 'forecast' | 'audit';
  dataSource: string;
  refreshInterval: number; // minutes
  isActive: boolean;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastRun: Date;
  nextRun: Date;
  widgets: {
    id: string;
    type: 'chart' | 'table' | 'metric' | 'gauge' | 'list' | 'map';
    title: string;
    data: any;
    position: { x: number; y: number; width: number; height: number };
    config: any;
  }[];
  filters: {
    id: string;
    name: string;
    type: 'date' | 'dropdown' | 'text' | 'number' | 'boolean';
    value: any;
    options?: any[];
  }[];
  permissions: {
    view: string[];
    edit: string[];
    share: string[];
    export: string[];
  };
}

interface KPIMetric {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'clinical' | 'patient' | 'staff' | 'quality';
  type: 'count' | 'percentage' | 'currency' | 'duration' | 'ratio' | 'score';
  currentValue: number;
  targetValue: number;
  previousValue: number;
  change: number; // percentage
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  unit: string;
  calculation: string;
  dataSource: string;
  refreshInterval: number;
  lastUpdated: Date;
  history: {
    date: Date;
    value: number;
  }[];
  alerts: {
    id: string;
    type: 'threshold' | 'trend' | 'anomaly';
    condition: string;
    isActive: boolean;
    lastTriggered?: Date;
  }[];
}

interface DataVisualization {
  id: string;
  name: string;
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'funnel' | 'radar';
  title: string;
  description: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
      fill?: boolean;
    }[];
  };
  options: {
    responsive: boolean;
    maintainAspectRatio: boolean;
    plugins: any;
    scales?: any;
  };
  filters: {
    id: string;
    name: string;
    type: 'date' | 'category' | 'value';
    value: any;
  }[];
  drillDown: {
    enabled: boolean;
    levels: {
      level: number;
      field: string;
      label: string;
    }[];
  };
  exportOptions: {
    formats: ('pdf' | 'png' | 'csv' | 'excel')[];
    enabled: boolean;
  };
}

interface DrillDownAnalytics {
  id: string;
  name: string;
  level: number;
  parentId?: string;
  data: {
    dimension: string;
    value: string;
    metrics: {
      name: string;
      value: number;
      change: number;
    }[];
  }[];
  filters: {
    field: string;
    operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
    value: any;
  }[];
  sortBy: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  exportData: {
    format: 'csv' | 'excel' | 'json';
    includeHeaders: boolean;
    dateFormat: string;
  };
}

interface ReportSchedule {
  id: string;
  name: string;
  reportId: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  time: string; // HH:MM
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
  dayOfMonth?: number; // 1-31
  timezone: string;
  isActive: boolean;
  lastRun?: Date;
  nextRun: Date;
  recipients: {
    email: string;
    name: string;
    format: 'pdf' | 'excel' | 'csv' | 'html';
  }[];
  conditions: {
    id: string;
    type: 'threshold' | 'schedule' | 'manual';
    condition: string;
    isActive: boolean;
  }[];
  delivery: {
    method: 'email' | 'ftp' | 'api' | 'storage';
    config: any;
  };
}

// Advanced Reporting & Business Intelligence Component - Gelişmiş raporlama ve iş zekası
export function AdvancedReporting() {
  // State management - Uygulama durumunu yönetmek için
  const [customReports, setCustomReports] = useState<CustomReport[]>([]);
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([]);
  const [dataVisualizations, setDataVisualizations] = useState<DataVisualization[]>([]);
  const [drillDownAnalytics, setDrillDownAnalytics] = useState<DrillDownAnalytics[]>([]);
  const [reportSchedules, setReportSchedules] = useState<ReportSchedule[]>([]);
  const [selectedReport, setSelectedReport] = useState<CustomReport | null>(null);
  const [selectedKPI, setSelectedKPI] = useState<KPIMetric | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateReport, setShowCreateReport] = useState(false);
  const [showCreateKPI, setShowCreateKPI] = useState(false);
  const [reportPerformance, setReportPerformance] = useState(94.2);

  // Mock data initialization - Test verilerini yüklemek için
  useEffect(() => {
    // Simulated data loading - Gerçek API'den veri çekme simülasyonu
    const mockCustomReports: CustomReport[] = [
      {
        id: '1',
        name: 'Financial Performance Dashboard',
        description: 'Comprehensive financial metrics and performance indicators',
        type: 'financial',
        category: 'kpi',
        dataSource: 'financial_system',
        refreshInterval: 60,
        isActive: true,
        isPublic: false,
        createdBy: 'admin@mindtrack.com',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
        nextRun: new Date(Date.now() + 58 * 60 * 1000),
        widgets: [
          {
            id: 'widget_1',
            type: 'chart',
            title: 'Revenue Trend',
            data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], datasets: [{ label: 'Revenue', data: [12000, 15000, 14000, 18000, 16000] }] },
            position: { x: 0, y: 0, width: 6, height: 4 },
            config: { type: 'line' }
          }
        ],
        filters: [
          {
            id: 'filter_1',
            name: 'Date Range',
            type: 'date',
            value: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() }
          }
        ],
        permissions: {
          view: ['admin', 'manager'],
          edit: ['admin'],
          share: ['admin'],
          export: ['admin', 'manager']
        }
      }
    ];

    const mockKPIMetrics: KPIMetric[] = [
      {
        id: '1',
        name: 'Monthly Revenue',
        description: 'Total monthly revenue from all services',
        category: 'financial',
        type: 'currency',
        currentValue: 45000,
        targetValue: 50000,
        previousValue: 42000,
        change: 7.14,
        trend: 'up',
        status: 'good',
        unit: 'USD',
        calculation: 'SUM(revenue)',
        dataSource: 'financial_system',
        refreshInterval: 60,
        lastUpdated: new Date(),
        history: [
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), value: 42000 },
          { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), value: 43000 },
          { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), value: 44000 },
          { date: new Date(), value: 45000 }
        ],
        alerts: [
          {
            id: 'alert_1',
            type: 'threshold',
            condition: 'value < 40000',
            isActive: true
          }
        ]
      },
      {
        id: '2',
        name: 'Patient Satisfaction Score',
        description: 'Average patient satisfaction rating',
        category: 'patient',
        type: 'score',
        currentValue: 4.6,
        targetValue: 4.5,
        previousValue: 4.4,
        change: 4.55,
        trend: 'up',
        status: 'excellent',
        unit: '/5',
        calculation: 'AVG(satisfaction_score)',
        dataSource: 'patient_surveys',
        refreshInterval: 1440,
        lastUpdated: new Date(),
        history: [
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), value: 4.4 },
          { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), value: 4.5 },
          { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), value: 4.5 },
          { date: new Date(), value: 4.6 }
        ],
        alerts: [
          {
            id: 'alert_2',
            type: 'threshold',
            condition: 'value < 4.0',
            isActive: true
          }
        ]
      }
    ];

    const mockDataVisualizations: DataVisualization[] = [
      {
        id: '1',
        name: 'Revenue by Service Type',
        type: 'pie',
        title: 'Revenue Distribution',
        description: 'Revenue breakdown by service categories',
        data: {
          labels: ['Therapy', 'Consultation', 'Assessment', 'Group Sessions'],
          datasets: [{
            label: 'Revenue',
            data: [25000, 12000, 8000, 5000],
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: { enabled: true }
          }
        },
        filters: [
          {
            id: 'filter_1',
            name: 'Time Period',
            type: 'date',
            value: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() }
          }
        ],
        drillDown: {
          enabled: true,
          levels: [
            { level: 1, field: 'service_type', label: 'Service Type' },
            { level: 2, field: 'therapist', label: 'Therapist' }
          ]
        },
        exportOptions: {
          formats: ['pdf', 'png', 'csv'],
          enabled: true
        }
      }
    ];

    const mockDrillDownAnalytics: DrillDownAnalytics[] = [
      {
        id: '1',
        name: 'Revenue Analysis',
        level: 1,
        data: [
          {
            dimension: 'Service Type',
            value: 'Therapy',
            metrics: [
              { name: 'Revenue', value: 25000, change: 12.5 },
              { name: 'Sessions', value: 150, change: 8.3 },
              { name: 'Avg. Session Value', value: 167, change: 3.8 }
            ]
          }
        ],
        filters: [
          {
            field: 'date',
            operator: 'between',
            value: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() }
          }
        ],
        sortBy: {
          field: 'revenue',
          direction: 'desc'
        },
        pagination: {
          page: 1,
          pageSize: 10,
          total: 25
        },
        exportData: {
          format: 'csv',
          includeHeaders: true,
          dateFormat: 'YYYY-MM-DD'
        }
      }
    ];

    const mockReportSchedules: ReportSchedule[] = [
      {
        id: '1',
        name: 'Weekly Financial Report',
        reportId: '1',
        frequency: 'weekly',
        time: '09:00',
        dayOfWeek: 1, // Monday
        timezone: 'America/New_York',
        isActive: true,
        nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        recipients: [
          {
            email: 'manager@mindtrack.com',
            name: 'Manager',
            format: 'pdf'
          }
        ],
        conditions: [
          {
            id: 'condition_1',
            type: 'schedule',
            condition: 'weekly',
            isActive: true
          }
        ],
        delivery: {
          method: 'email',
          config: {
            subject: 'Weekly Financial Report',
            body: 'Please find attached the weekly financial report.'
          }
        }
      }
    ];

    setCustomReports(mockCustomReports);
    setKpiMetrics(mockKPIMetrics);
    setDataVisualizations(mockDataVisualizations);
    setDrillDownAnalytics(mockDrillDownAnalytics);
    setReportSchedules(mockReportSchedules);
  }, []);

  // Create custom report - Özel rapor oluşturma
  const createCustomReport = useCallback(async (
    name: string,
    description: string,
    type: CustomReport['type'],
    dataSource: string
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
        category: 'kpi',
        dataSource,
        refreshInterval: 60,
        isActive: true,
        isPublic: false,
        createdBy: 'current_user',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastRun: new Date(),
        nextRun: new Date(Date.now() + 60 * 60 * 1000),
        widgets: [],
        filters: [],
        permissions: {
          view: ['current_user'],
          edit: ['current_user'],
          share: ['current_user'],
          export: ['current_user']
        }
      };
      
      setCustomReports(prev => [...prev, newReport]);
      
      return newReport;
      
    } catch (error) {
      console.error('Report creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create KPI metric - KPI metriği oluşturma
  const createKPIMetric = useCallback(async (
    name: string,
    description: string,
    category: KPIMetric['category'],
    type: KPIMetric['type'],
    targetValue: number
  ) => {
    setLoading(true);
    
    try {
      // Simulated KPI creation - KPI oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newKPI: KPIMetric = {
        id: `kpi_${Date.now()}`,
        name,
        description,
        category,
        type,
        currentValue: 0,
        targetValue,
        previousValue: 0,
        change: 0,
        trend: 'stable',
        status: 'fair',
        unit: type === 'currency' ? 'USD' : type === 'percentage' ? '%' : '',
        calculation: 'SUM(value)',
        dataSource: 'system',
        refreshInterval: 60,
        lastUpdated: new Date(),
        history: [],
        alerts: []
      };
      
      setKpiMetrics(prev => [...prev, newKPI]);
      
      return newKPI;
      
    } catch (error) {
      console.error('KPI creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Export report - Rapor dışa aktarma
  const exportReport = useCallback(async (
    reportId: string,
    format: 'pdf' | 'excel' | 'csv' | 'png'
  ) => {
    setLoading(true);
    
    try {
      // Simulated report export - Rapor dışa aktarma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const report = customReports.find(r => r.id === reportId);
      if (!report) throw new Error('Report not found');
      
      // Simulate file download - Dosya indirme simülasyonu
      console.log(`Exporting ${report.name} as ${format}`);
      
      return { report, format };
      
    } catch (error) {
      console.error('Report export failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [customReports]);

  // Schedule report - Rapor zamanlama
  const scheduleReport = useCallback(async (
    reportId: string,
    frequency: ReportSchedule['frequency'],
    time: string,
    recipients: ReportSchedule['recipients']
  ) => {
    setLoading(true);
    
    try {
      // Simulated report scheduling - Rapor zamanlama simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newSchedule: ReportSchedule = {
        id: `schedule_${Date.now()}`,
        name: `Scheduled Report`,
        reportId,
        frequency,
        time,
        timezone: 'America/New_York',
        isActive: true,
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
        recipients,
        conditions: [],
        delivery: {
          method: 'email',
          config: {}
        }
      };
      
      setReportSchedules(prev => [...prev, newSchedule]);
      
      return newSchedule;
      
    } catch (error) {
      console.error('Report scheduling failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate reporting metrics - Raporlama metriklerini hesaplama
  const calculateReportingMetrics = useCallback(() => {
    const totalReports = customReports.length;
    const activeReports = customReports.filter(r => r.isActive).length;
    const totalKPIs = kpiMetrics.length;
    const excellentKPIs = kpiMetrics.filter(k => k.status === 'excellent').length;
    const totalSchedules = reportSchedules.length;
    const activeSchedules = reportSchedules.filter(s => s.isActive).length;
    
    return {
      totalReports,
      activeReports,
      reportActivationRate: totalReports > 0 ? Math.round((activeReports / totalReports) * 100) : 0,
      totalKPIs,
      excellentKPIs,
      kpiExcellenceRate: totalKPIs > 0 ? Math.round((excellentKPIs / totalKPIs) * 100) : 0,
      totalSchedules,
      activeSchedules,
      scheduleActivationRate: totalSchedules > 0 ? Math.round((activeSchedules / totalSchedules) * 100) : 0
    };
  }, [customReports, kpiMetrics, reportSchedules]);

  const metrics = calculateReportingMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📊 Advanced Reporting & Business Intelligence</h2>
          <p className="text-gray-600">Comprehensive reporting and business intelligence tools</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <BarChart3 className="h-3 w-3 mr-1" />
            {metrics.totalReports} Reports
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="h-3 w-3 mr-1" />
            {reportPerformance}% Performance
          </Badge>
        </div>
      </div>

      {/* Reporting Overview - Raporlama Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Active Reports</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.activeReports}</div>
            <p className="text-xs text-blue-700">
              {metrics.totalReports} total reports
            </p>
            <Progress value={metrics.reportActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">KPI Excellence</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.excellentKPIs}</div>
            <p className="text-xs text-green-700">
              {metrics.totalKPIs} total KPIs
            </p>
            <Progress value={metrics.kpiExcellenceRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Scheduled Reports</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{metrics.activeSchedules}</div>
            <p className="text-xs text-purple-700">
              {metrics.totalSchedules} total schedules
            </p>
            <Progress value={metrics.scheduleActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Data Visualizations</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{dataVisualizations.length}</div>
            <p className="text-xs text-orange-700">
              Active charts and graphs
            </p>
            <Progress value={75} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* KPI Metrics Dashboard - KPI Metrikleri Dashboard'ı */}
      <Card className="border-2 border-green-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-600" />
              <span className="text-green-900">KPI Metrics</span>
            </div>
            <Button
              onClick={() => setShowCreateKPI(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create KPI
            </Button>
          </CardTitle>
          <CardDescription className="text-green-700">
            Key Performance Indicators and business metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {kpiMetrics.map((kpi) => (
              <div key={kpi.id} className="border border-green-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-green-900">{kpi.name}</div>
                    <div className="text-sm text-green-600">{kpi.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={kpi.status === 'excellent' ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
                      {kpi.status}
                    </Badge>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {kpi.category}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Current Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Current Value:</span>
                        <span className="text-green-900 font-medium">{kpi.currentValue} {kpi.unit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Target Value:</span>
                        <span className="text-green-900 font-medium">{kpi.targetValue} {kpi.unit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Change:</span>
                        <span className={`font-medium ${kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {kpi.change >= 0 ? '+' : ''}{kpi.change}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Trend Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <span className="text-green-600 mr-2">Trend:</span>
                        {kpi.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : kpi.trend === 'down' ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : (
                          <Activity className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="ml-1 text-green-900 capitalize">{kpi.trend}</span>
                      </div>
                      <div className="text-sm text-green-600">
                        Last Updated: {kpi.lastUpdated.toLocaleDateString()}
                      </div>
                      <div className="text-sm text-green-600">
                        Refresh: {kpi.refreshInterval} min
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Alerts</h4>
                    <div className="space-y-1">
                      {kpi.alerts.map((alert) => (
                        <div key={alert.id} className="flex items-center text-sm">
                          <AlertTriangle className="h-3 w-3 mr-1 text-orange-500" />
                          <span className="text-green-600">{alert.condition}</span>
                          <Badge variant={alert.isActive ? 'default' : 'secondary'} className="ml-2 text-xs">
                            {alert.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Reports - Özel Raporlar */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-blue-900">Custom Reports</span>
            </div>
            <Button
              onClick={() => setShowCreateReport(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Create and manage custom reports and dashboards
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {customReports.map((report) => (
              <div key={report.id} className="border border-blue-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-blue-900">{report.name}</div>
                    <div className="text-sm text-blue-600">{report.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={report.isActive ? 'default' : 'secondary'} className="bg-blue-100 text-blue-800">
                      {report.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {report.type}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {report.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Report Details</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Type: {report.type}</div>
                      <div>Category: {report.category}</div>
                      <div>Data Source: {report.dataSource}</div>
                      <div>Refresh: {report.refreshInterval} min</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Widgets</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Total Widgets: {report.widgets.length}</div>
                      <div>Chart Widgets: {report.widgets.filter(w => w.type === 'chart').length}</div>
                      <div>Table Widgets: {report.widgets.filter(w => w.type === 'table').length}</div>
                      <div>Metric Widgets: {report.widgets.filter(w => w.type === 'metric').length}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Actions</h4>
                    <div className="space-y-2">
                      <Button
                        onClick={() => exportReport(report.id, 'pdf')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={loading}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-blue-300 text-blue-700"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Visualizations - Veri Görselleştirme */}
      <Card className="border-2 border-orange-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200">
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-orange-600" />
            <span className="text-orange-900">Data Visualizations</span>
          </CardTitle>
          <CardDescription className="text-orange-700">
            Interactive charts and data visualizations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {dataVisualizations.map((viz) => (
              <div key={viz.id} className="border border-orange-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-orange-900">{viz.name}</div>
                    <div className="text-sm text-orange-600">{viz.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      {viz.type}
                    </Badge>
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      {viz.drillDown.enabled ? 'Drill-down' : 'Static'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-800">Chart Configuration</h4>
                    <div className="space-y-1 text-sm text-orange-600">
                      <div>Type: {viz.type}</div>
                      <div>Datasets: {viz.data.datasets.length}</div>
                      <div>Data Points: {viz.data.labels.length}</div>
                      <div>Responsive: {viz.options.responsive ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-800">Export Options</h4>
                    <div className="space-y-1 text-sm text-orange-600">
                      <div>Available Formats: {viz.exportOptions.formats.join(', ')}</div>
                      <div>Export Enabled: {viz.exportOptions.enabled ? 'Yes' : 'No'}</div>
                      <div>Drill-down Levels: {viz.drillDown.levels.length}</div>
                      <div>Filters: {viz.filters.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Scheduling - Rapor Zamanlama */}
      <Card className="border-2 border-purple-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-purple-600" />
            <span className="text-purple-900">Report Scheduling</span>
          </CardTitle>
          <CardDescription className="text-purple-700">
            Automated report delivery and scheduling
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {reportSchedules.map((schedule) => (
              <div key={schedule.id} className="border border-purple-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-purple-900">{schedule.name}</div>
                    <div className="text-sm text-purple-600">
                      {schedule.frequency} at {schedule.time} ({schedule.timezone})
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={schedule.isActive ? 'default' : 'secondary'} className="bg-purple-100 text-purple-800">
                      {schedule.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      {schedule.frequency}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Schedule Details</h4>
                    <div className="space-y-1 text-sm text-purple-600">
                      <div>Frequency: {schedule.frequency}</div>
                      <div>Time: {schedule.time}</div>
                      <div>Timezone: {schedule.timezone}</div>
                      <div>Next Run: {schedule.nextRun.toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Recipients</h4>
                    <div className="space-y-1 text-sm text-purple-600">
                      {schedule.recipients.map((recipient, index) => (
                        <div key={index}>
                          {recipient.name} ({recipient.email}) - {recipient.format}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Delivery</h4>
                    <div className="space-y-1 text-sm text-purple-600">
                      <div>Method: {schedule.delivery.method}</div>
                      <div>Conditions: {schedule.conditions.length}</div>
                      {schedule.lastRun && (
                        <div>Last Run: {schedule.lastRun.toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

