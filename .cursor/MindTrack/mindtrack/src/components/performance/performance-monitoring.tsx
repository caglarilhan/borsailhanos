"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Gauge, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  Play, 
  Pause, 
  Stop, 
  RefreshCw, 
  Settings, 
  Eye, 
  Download, 
  Upload, 
  Database, 
  GitBranch, 
  Layers, 
  Filter, 
  Search, 
  MoreHorizontal,
  Bell,
  Calendar,
  Clock,
  User,
  Users,
  Info,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Edit,
  Trash2,
  Copy,
  Share2,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Save,
  Printer,
  Archive,
  Shield,
  Key,
  Lock,
  Unlock,
  Globe,
  MapPin,
  Phone,
  Mail,
  Video,
  Image,
  File,
  Folder,
  BarChart,
  PieChart,
  LineChart,
  ScatterChart,
  AreaChart,
  Table,
  List,
  Grid,
  Columns,
  Rows,
  SortAsc,
  SortDesc,
  FilterIcon,
  Search as SearchIcon,
  Database as DatabaseIcon,
  BarChart3,
  Target,
  Brain,
  BookOpen,
  Tag,
  MessageSquare,
  FileText,
  Cpu,
  HardDrive,
  Wifi,
  Server
} from "lucide-react";

// Performance Monitoring & Optimization için gerekli interface'ler
interface PerformanceMetric {
  id: string;
  name: string;
  category: 'system' | 'application' | 'database' | 'network' | 'user-experience';
  value: number;
  unit: string;
  threshold: {
    warning: number;
    critical: number;
  };
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  timestamp: Date;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

interface SystemResource {
  id: string;
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'database';
  name: string;
  current: number;
  max: number;
  unit: string;
  utilization: number;
  status: 'normal' | 'warning' | 'critical';
  trends: {
    timestamp: Date;
    value: number;
  }[];
  alerts: {
    id: string;
    type: 'warning' | 'critical';
    message: string;
    timestamp: Date;
    isResolved: boolean;
  }[];
  optimization: {
    suggestions: string[];
    priority: 'low' | 'medium' | 'high';
    estimatedImpact: string;
  };
}

interface ApplicationPerformance {
  id: string;
  endpoint: string;
  method: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
  status: 'healthy' | 'degraded' | 'down';
  metrics: {
    p50: number;
    p95: number;
    p99: number;
    requestsPerSecond: number;
    concurrentUsers: number;
  };
  bottlenecks: {
    type: 'database' | 'cache' | 'external-api' | 'cpu' | 'memory';
    description: string;
    impact: number;
    recommendations: string[];
  }[];
  optimization: {
    applied: string[];
    pending: string[];
    results: {
      improvement: number;
      description: string;
    }[];
  };
}

interface DatabasePerformance {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'elasticsearch';
  connectionPool: {
    active: number;
    idle: number;
    max: number;
    utilization: number;
  };
  queries: {
    total: number;
    slow: number;
    avgExecutionTime: number;
    slowestQueries: {
      query: string;
      executionTime: number;
      frequency: number;
    }[];
  };
  indexes: {
    total: number;
    unused: number;
    missing: number;
    recommendations: string[];
  };
  performance: {
    readLatency: number;
    writeLatency: number;
    throughput: number;
    cacheHitRate: number;
  };
  maintenance: {
    lastVacuum: Date;
    lastAnalyze: Date;
    fragmentation: number;
    recommendations: string[];
  };
}

interface NetworkPerformance {
  id: string;
  endpoint: string;
  latency: number;
  bandwidth: number;
  packetLoss: number;
  jitter: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  metrics: {
    downloadSpeed: number;
    uploadSpeed: number;
    ping: number;
    connectionQuality: number;
  };
  issues: {
    type: 'high-latency' | 'packet-loss' | 'bandwidth-limitation' | 'connectivity';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    impact: string;
  }[];
  optimization: {
    suggestions: string[];
    implemented: string[];
    results: {
      improvement: number;
      metric: string;
    }[];
  };
}

interface UserExperience {
  id: string;
  metric: 'page-load-time' | 'time-to-interactive' | 'first-contentful-paint' | 'largest-contentful-paint' | 'cumulative-layout-shift';
  value: number;
  target: number;
  score: number; // 0-100
  status: 'good' | 'needs-improvement' | 'poor';
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  timestamp: Date;
  breakdown: {
    dns: number;
    tcp: number;
    tls: number;
    ttfb: number;
    download: number;
    processing: number;
  };
  opportunities: {
    type: string;
    description: string;
    potentialSavings: number;
    impact: 'low' | 'medium' | 'high';
  }[];
}

interface PerformanceAlert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  category: 'system' | 'application' | 'database' | 'network' | 'user-experience';
  metric: string;
  currentValue: number;
  threshold: number;
  timestamp: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  actions: {
    type: 'acknowledge' | 'resolve' | 'escalate';
    label: string;
    description: string;
  }[];
  assignedTo?: string;
  notes: string[];
}

interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'system' | 'application' | 'database' | 'network' | 'user-experience';
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: {
    performance: number;
    cost: number;
    effort: number;
  };
  status: 'pending' | 'in-progress' | 'implemented' | 'rejected';
  implementation: {
    steps: string[];
    estimatedTime: number;
    resources: string[];
    risks: string[];
  };
  results?: {
    before: number;
    after: number;
    improvement: number;
    notes: string;
  };
  createdDate: Date;
  updatedDate: Date;
  assignedTo?: string;
}

// Performance Monitoring & Optimization Component - Performans izleme ve optimizasyon
export function PerformanceMonitoring() {
  // State management - Durum yönetimi
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [systemResources, setSystemResources] = useState<SystemResource[]>([]);
  const [applicationPerformance, setApplicationPerformance] = useState<ApplicationPerformance[]>([]);
  const [databasePerformance, setDatabasePerformance] = useState<DatabasePerformance[]>([]);
  const [networkPerformance, setNetworkPerformance] = useState<NetworkPerformance[]>([]);
  const [userExperience, setUserExperience] = useState<UserExperience[]>([]);
  const [performanceAlerts, setPerformanceAlerts] = useState<PerformanceAlert[]>([]);
  const [optimizationRecommendations, setOptimizationRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<PerformanceMetric | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOptimization, setShowOptimization] = useState(false);
  const [overallPerformance, setOverallPerformance] = useState(94.2);

  // Mock data initialization - Test verilerini yükleme
  useEffect(() => {
    // Simulated data loading - Test verisi simülasyonu
    const mockPerformanceMetrics: PerformanceMetric[] = [
      {
        id: '1',
        name: 'Page Load Time',
        category: 'user-experience',
        value: 1.8,
        unit: 'seconds',
        threshold: {
          warning: 2.0,
          critical: 3.0
        },
        status: 'normal',
        trend: 'down',
        timestamp: new Date(),
        description: 'Average page load time across all pages',
        impact: 'medium',
        recommendations: [
          'Optimize image sizes',
          'Implement lazy loading',
          'Use CDN for static assets'
        ]
      }
    ];

    const mockSystemResources: SystemResource[] = [
      {
        id: '1',
        type: 'cpu',
        name: 'CPU Utilization',
        current: 65,
        max: 100,
        unit: '%',
        utilization: 65,
        status: 'normal',
        trends: [
          { timestamp: new Date(Date.now() - 60 * 60 * 1000), value: 60 },
          { timestamp: new Date(Date.now() - 30 * 60 * 1000), value: 65 },
          { timestamp: new Date(), value: 65 }
        ],
        alerts: [],
        optimization: {
          suggestions: [
            'Optimize database queries',
            'Implement caching strategies',
            'Scale horizontally if needed'
          ],
          priority: 'medium',
          estimatedImpact: '15-20% improvement'
        }
      }
    ];

    const mockApplicationPerformance: ApplicationPerformance[] = [
      {
        id: '1',
        endpoint: '/api/patients',
        method: 'GET',
        responseTime: 245,
        throughput: 1250,
        errorRate: 0.12,
        availability: 99.8,
        status: 'healthy',
        metrics: {
          p50: 180,
          p95: 320,
          p99: 450,
          requestsPerSecond: 1250,
          concurrentUsers: 500
        },
        bottlenecks: [
          {
            type: 'database',
            description: 'Slow query execution on patient search',
            impact: 0.15,
            recommendations: [
              'Add database indexes',
              'Optimize query structure',
              'Implement query caching'
            ]
          }
        ],
        optimization: {
          applied: [
            'Added database indexes',
            'Implemented Redis caching'
          ],
          pending: [
            'Query optimization',
            'Connection pooling'
          ],
          results: [
            {
              improvement: 25,
              description: 'Response time reduced by 25%'
            }
          ]
        }
      }
    ];

    const mockDatabasePerformance: DatabasePerformance[] = [
      {
        id: '1',
        name: 'PostgreSQL Main DB',
        type: 'postgresql',
        connectionPool: {
          active: 45,
          idle: 15,
          max: 100,
          utilization: 60
        },
        queries: {
          total: 12500,
          slow: 125,
          avgExecutionTime: 45,
          slowestQueries: [
            {
              query: 'SELECT * FROM patients WHERE name ILIKE $1',
              executionTime: 1200,
              frequency: 150
            }
          ]
        },
        indexes: {
          total: 25,
          unused: 3,
          missing: 2,
          recommendations: [
            'Add index on patients.name',
            'Add index on appointments.date',
            'Remove unused index on old_table'
          ]
        },
        performance: {
          readLatency: 15,
          writeLatency: 25,
          throughput: 850,
          cacheHitRate: 92.5
        },
        maintenance: {
          lastVacuum: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          lastAnalyze: new Date(Date.now() - 24 * 60 * 60 * 1000),
          fragmentation: 8.5,
          recommendations: [
            'Schedule regular VACUUM',
            'Update table statistics',
            'Monitor index usage'
          ]
        }
      }
    ];

    const mockNetworkPerformance: NetworkPerformance[] = [
      {
        id: '1',
        endpoint: 'api.mindtrack.com',
        latency: 45,
        bandwidth: 100,
        packetLoss: 0.02,
        jitter: 5,
        status: 'excellent',
        metrics: {
          downloadSpeed: 95,
          uploadSpeed: 85,
          ping: 45,
          connectionQuality: 98
        },
        issues: [],
        optimization: {
          suggestions: [
            'Implement CDN',
            'Enable HTTP/2',
            'Optimize image delivery'
          ],
          implemented: [
            'CDN implementation',
            'Gzip compression'
          ],
          results: [
            {
              improvement: 30,
              metric: 'Page load time'
            }
          ]
        }
      }
    ];

    const mockUserExperience: UserExperience[] = [
      {
        id: '1',
        metric: 'page-load-time',
        value: 1.8,
        target: 2.0,
        score: 85,
        status: 'good',
        device: 'desktop',
        browser: 'Chrome 120.0',
        location: 'New York',
        timestamp: new Date(),
        breakdown: {
          dns: 15,
          tcp: 25,
          tls: 35,
          ttfb: 120,
          download: 800,
          processing: 400
        },
        opportunities: [
          {
            type: 'image-optimization',
            description: 'Optimize images to reduce download time',
            potentialSavings: 200,
            impact: 'medium'
          }
        ]
      }
    ];

    const mockPerformanceAlerts: PerformanceAlert[] = [
      {
        id: '1',
        title: 'High CPU Utilization',
        description: 'CPU usage has exceeded 80% threshold',
        severity: 'warning',
        category: 'system',
        metric: 'cpu_utilization',
        currentValue: 85,
        threshold: 80,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isResolved: false,
        actions: [
          {
            type: 'acknowledge',
            label: 'Acknowledge',
            description: 'Mark alert as acknowledged'
          },
          {
            type: 'resolve',
            label: 'Resolve',
            description: 'Mark alert as resolved'
          }
        ],
        notes: []
      }
    ];

    const mockOptimizationRecommendations: OptimizationRecommendation[] = [
      {
        id: '1',
        title: 'Implement Database Query Caching',
        description: 'Add Redis caching layer for frequently accessed database queries',
        category: 'database',
        priority: 'high',
        impact: {
          performance: 85,
          cost: 25,
          effort: 60
        },
        status: 'pending',
        implementation: {
          steps: [
            'Set up Redis instance',
            'Identify cacheable queries',
            'Implement cache layer',
            'Monitor cache hit rates'
          ],
          estimatedTime: 8,
          resources: ['Backend Developer', 'DevOps Engineer'],
          risks: ['Cache invalidation complexity', 'Memory usage increase']
        },
        createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];

    setPerformanceMetrics(mockPerformanceMetrics);
    setSystemResources(mockSystemResources);
    setApplicationPerformance(mockApplicationPerformance);
    setDatabasePerformance(mockDatabasePerformance);
    setNetworkPerformance(mockNetworkPerformance);
    setUserExperience(mockUserExperience);
    setPerformanceAlerts(mockPerformanceAlerts);
    setOptimizationRecommendations(mockOptimizationRecommendations);
  }, []);

  // Optimize performance - Performans optimizasyonu
  const optimizePerformance = useCallback(async (
    recommendationId: string,
    action: string
  ) => {
    setLoading(true);
    
    try {
      // Simulated optimization - Optimizasyon simülasyonu
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update recommendation status
      setOptimizationRecommendations(prev => prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, status: 'implemented', updatedDate: new Date() }
          : rec
      ));
      
      return { success: true, message: 'Optimization applied successfully' };
      
    } catch (error) {
      console.error('Optimization failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Resolve alert - Uyarı çözme
  const resolveAlert = useCallback(async (
    alertId: string,
    resolution: string
  ) => {
    setLoading(true);
    
    try {
      // Simulated alert resolution - Uyarı çözme simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPerformanceAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              isResolved: true, 
              resolvedAt: new Date(),
              notes: [...alert.notes, resolution]
            }
          : alert
      ));
      
      return { success: true, message: 'Alert resolved successfully' };
      
    } catch (error) {
      console.error('Alert resolution failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate performance metrics - Performans metriklerini hesaplama
  const calculatePerformanceMetrics = useCallback(() => {
    const totalMetrics = performanceMetrics.length;
    const normalMetrics = performanceMetrics.filter(m => m.status === 'normal').length;
    const criticalMetrics = performanceMetrics.filter(m => m.status === 'critical').length;
    const totalAlerts = performanceAlerts.length;
    const activeAlerts = performanceAlerts.filter(a => !a.isResolved).length;
    const totalRecommendations = optimizationRecommendations.length;
    const implementedRecommendations = optimizationRecommendations.filter(r => r.status === 'implemented').length;
    
    return {
      totalMetrics,
      normalMetrics,
      criticalMetrics,
      healthRate: totalMetrics > 0 ? Math.round((normalMetrics / totalMetrics) * 100) : 0,
      totalAlerts,
      activeAlerts,
      alertResolutionRate: totalAlerts > 0 ? Math.round(((totalAlerts - activeAlerts) / totalAlerts) * 100) : 0,
      totalRecommendations,
      implementedRecommendations,
      implementationRate: totalRecommendations > 0 ? Math.round((implementedRecommendations / totalRecommendations) * 100) : 0
    };
  }, [performanceMetrics, performanceAlerts, optimizationRecommendations]);

  const metrics = calculatePerformanceMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">⚡ Performance Monitoring & Optimization</h2>
          <p className="text-gray-600">Real-time performance monitoring and optimization</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Gauge className="h-3 w-3 mr-1" />
            {overallPerformance}% Performance
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="h-3 w-3 mr-1" />
            {metrics.healthRate}% Health
          </Badge>
        </div>
      </div>

      {/* Performance Overview - Performans Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">System Health</CardTitle>
            <Gauge className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.healthRate}%</div>
            <p className="text-xs text-blue-700">
              {metrics.normalMetrics}/{metrics.totalMetrics} metrics normal
            </p>
            <Progress value={metrics.healthRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.activeAlerts}</div>
            <p className="text-xs text-green-700">
              {metrics.totalAlerts} total alerts
            </p>
            <Progress value={metrics.alertResolutionRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Optimizations</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{metrics.implementedRecommendations}</div>
            <p className="text-xs text-purple-700">
              {metrics.totalRecommendations} total recommendations
            </p>
            <Progress value={metrics.implementationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{metrics.criticalMetrics}</div>
            <p className="text-xs text-orange-700">
              Critical performance issues
            </p>
            <Progress value={metrics.criticalMetrics > 0 ? 100 : 0} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* System Resources - Sistem Kaynakları */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Cpu className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-blue-900">System Resources</span>
            </div>
            <Button
              onClick={() => setShowOptimization(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              Optimize
            </Button>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Monitor system resource utilization
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {systemResources.map((resource) => (
              <div key={resource.id} className="border border-blue-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-blue-900">{resource.name}</div>
                    <div className="text-sm text-blue-600">{resource.type.toUpperCase()} Resource</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={resource.status === 'normal' ? 'default' : 'secondary'} className="bg-blue-100 text-blue-800">
                      {resource.status}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {resource.utilization}% utilized
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Current Status</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Current: {resource.current} {resource.unit}</div>
                      <div>Maximum: {resource.max} {resource.unit}</div>
                      <div>Utilization: {resource.utilization}%</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Optimization</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Priority: {resource.optimization.priority}</div>
                      <div>Impact: {resource.optimization.estimatedImpact}</div>
                      <div>Suggestions: {resource.optimization.suggestions.length}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Alerts</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Total: {resource.alerts.length}</div>
                      <div>Active: {resource.alerts.filter(a => !a.isResolved).length}</div>
                      <div>Resolved: {resource.alerts.filter(a => a.isResolved).length}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Alerts - Performans Uyarıları */}
      <Card className="border-2 border-red-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200">
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2 text-red-600" />
            <span className="text-red-900">Performance Alerts</span>
          </CardTitle>
          <CardDescription className="text-red-700">
            Active performance alerts and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {performanceAlerts.map((alert) => (
              <div key={alert.id} className="border border-red-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-red-900">{alert.title}</div>
                    <div className="text-sm text-red-600">{alert.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={alert.severity === 'critical' ? 'default' : 'secondary'} className="bg-red-100 text-red-800">
                      {alert.severity}
                    </Badge>
                    <Badge variant="outline" className="border-red-300 text-red-700">
                      {alert.category}
                    </Badge>
                    {!alert.isResolved && (
                      <Badge variant="default" className="bg-orange-500 text-white">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-red-800">Metrics</h4>
                    <div className="space-y-1 text-sm text-red-600">
                      <div>Current: {alert.currentValue}</div>
                      <div>Threshold: {alert.threshold}</div>
                      <div>Metric: {alert.metric}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-red-800">Status</h4>
                    <div className="space-y-1 text-sm text-red-600">
                      <div>Created: {alert.timestamp.toLocaleString()}</div>
                      <div>Resolved: {alert.isResolved ? 'Yes' : 'No'}</div>
                      {alert.resolvedAt && (
                        <div>Resolved At: {alert.resolvedAt.toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-red-800">Actions</h4>
                    <div className="space-y-2">
                      {alert.actions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full border-red-300 text-red-700"
                          onClick={() => resolveAlert(alert.id, `Action: ${action.label}`)}
                        >
                          {action.label}
                        </Button>
                      ))}
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
