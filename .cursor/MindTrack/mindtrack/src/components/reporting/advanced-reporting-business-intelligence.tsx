"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3, Target, AlertTriangle, CheckCircle, XCircle, Clock, Calendar, User, Users, Settings, Plus, Download, Upload, RefreshCw, Save, Bell, BellOff, Shield, ShieldCheck,
  ShieldAlert, ShieldX, Lock, Unlock, Key, Eye, EyeOff, Database, Server, Activity,
  TrendingUp, TrendingDown, FileText, MapPin, Phone, Mail, MessageSquare,
  Info, HelpCircle, ExternalLink, Link, LinkBreak, GitBranch, Layers, Filter, Search,
  MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ArrowUp, ArrowDown,
  ArrowLeft, ArrowRight, Home, Menu, MoreVertical, X, Check, Star, Heart, ThumbsUp,
  ThumbsDown, Flag, Bookmark, Tag, Archive, Folder, File, FilePlus, FileMinus, FileEdit,
  FileSearch, FileDown, FileUp, FileShare, FileLock, FileUnlock, FileHeart, FileStar,
  FileZap, FileTarget, FileShield, FileSettings, FileInfo, FileAlert,
  FileCheckCircle, FileXCircle, FilePlusCircle, FileMinusCircle, FileEditCircle, FileSearchCircle,
  FileDownCircle, FileUpCircle, FileShareCircle, FileLockCircle, FileUnlockCircle, FileHeartCircle,
  FileStarCircle, FileZapCircle, FileTargetCircle, FileShieldCircle,
  FileSettingsCircle, FileInfoCircle, FileAlertCircle, Zap, Globe, Cpu, Memory, HardDrive,
  Wifi, Cloud, BarChart, PieChart, LineChart, ScatterChart, AreaChart, Table, List, Grid,
  Columns, Rows, SortAsc, SortDesc, DollarSign
} from "lucide-react";

// Interfaces
interface Report {
  id: string;
  name: string;
  category: 'clinical' | 'financial' | 'operational' | 'compliance' | 'analytics' | 'custom';
  description: string;
  type: 'scheduled' | 'on-demand' | 'real-time' | 'dashboard';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  status: 'active' | 'inactive' | 'draft' | 'archived';
  lastGenerated: string;
  nextScheduled: string;
  recipients: string[];
  dataSources: string[];
  metrics: ReportMetric[];
  filters: ReportFilter[];
  visualizations: ReportVisualization[];
}

interface ReportMetric {
  id: string;
  name: string;
  type: 'count' | 'sum' | 'average' | 'percentage' | 'ratio' | 'trend';
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  target: number;
  status: 'on_target' | 'above_target' | 'below_target' | 'critical';
}

interface ReportFilter {
  id: string;
  name: string;
  type: 'date_range' | 'category' | 'status' | 'user' | 'location' | 'custom';
  value: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
  isActive: boolean;
}

interface ReportVisualization {
  id: string;
  type: 'bar_chart' | 'line_chart' | 'pie_chart' | 'table' | 'gauge' | 'heatmap';
  title: string;
  data: any[];
  config: Record<string, any>;
}

interface BusinessIntelligence {
  id: string;
  name: string;
  category: 'kpi' | 'dashboard' | 'alert' | 'insight' | 'forecast';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'pending';
  lastUpdated: string;
  dataPoints: number;
  accuracy: number;
  impact: number;
}

interface ReportingMetrics {
  totalReports: number;
  activeReports: number;
  scheduledReports: number;
  realTimeReports: number;
  averageAccuracy: number;
  dataFreshness: number;
  userAdoption: number;
  insightsGenerated: number;
}

// Mock Data
const mockReports: Report[] = [
  {
    id: "R001",
    name: "Patient Outcomes Report",
    category: "clinical",
    description: "Comprehensive analysis of patient treatment outcomes and progress",
    type: "scheduled",
    frequency: "monthly",
    status: "active",
    lastGenerated: "2024-12-14T10:00:00Z",
    nextScheduled: "2025-01-14T10:00:00Z",
    recipients: ["dr.sarah.johnson", "dr.michael.chen", "clinical.director"],
    dataSources: ["patient_records", "treatment_plans", "outcome_assessments"],
    metrics: [
      {
        id: "RM001",
        name: "Treatment Success Rate",
        type: "percentage",
        value: 78.5,
        unit: "%",
        change: 2.3,
        changeType: "increase",
        target: 75,
        status: "above_target"
      },
      {
        id: "RM002",
        name: "Average Session Attendance",
        type: "average",
        value: 4.2,
        unit: "sessions",
        change: -0.1,
        changeType: "decrease",
        target: 4.5,
        status: "below_target"
      }
    ],
    filters: [
      {
        id: "RF001",
        name: "Date Range",
        type: "date_range",
        value: "2024-11-01 to 2024-12-14",
        operator: "between",
        isActive: true
      }
    ],
    visualizations: [
      {
        id: "RV001",
        type: "bar_chart",
        title: "Outcomes by Treatment Type",
        data: [],
        config: {}
      }
    ]
  },
  {
    id: "R002",
    name: "Financial Performance Dashboard",
    category: "financial",
    description: "Real-time financial metrics and revenue analysis",
    type: "real-time",
    frequency: "daily",
    status: "active",
    lastGenerated: "2024-12-14T15:30:00Z",
    nextScheduled: "2024-12-15T15:30:00Z",
    recipients: ["practice.manager", "dr.sarah.johnson"],
    dataSources: ["billing_system", "payment_processor", "insurance_claims"],
    metrics: [
      {
        id: "RM003",
        name: "Monthly Revenue",
        type: "sum",
        value: 125000,
        unit: "$",
        change: 8.2,
        changeType: "increase",
        target: 120000,
        status: "above_target"
      },
      {
        id: "RM004",
        name: "Collection Rate",
        type: "percentage",
        value: 94.5,
        unit: "%",
        change: 1.2,
        changeType: "increase",
        target: 90,
        status: "above_target"
      }
    ],
    filters: [],
    visualizations: [
      {
        id: "RV002",
        type: "line_chart",
        title: "Revenue Trends",
        data: [],
        config: {}
      }
    ]
  }
];

const mockBusinessIntelligence: BusinessIntelligence[] = [
  {
    id: "BI001",
    name: "Patient Retention Prediction",
    category: "forecast",
    description: "AI-powered prediction of patient retention rates",
    priority: "high",
    status: "active",
    lastUpdated: "2024-12-14T12:00:00Z",
    dataPoints: 1250,
    accuracy: 87.3,
    impact: 85
  },
  {
    id: "BI002",
    name: "Revenue Optimization Alert",
    category: "alert",
    description: "Real-time alerts for revenue optimization opportunities",
    priority: "critical",
    status: "active",
    lastUpdated: "2024-12-14T14:15:00Z",
    dataPoints: 450,
    accuracy: 92.1,
    impact: 95
  }
];

const mockReportingMetrics: ReportingMetrics = {
  totalReports: 25,
  activeReports: 18,
  scheduledReports: 12,
  realTimeReports: 6,
  averageAccuracy: 89.5,
  dataFreshness: 94.2,
  userAdoption: 76.8,
  insightsGenerated: 156
};

// Utility Functions
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'clinical': return 'bg-blue-500 text-white';
    case 'financial': return 'bg-green-500 text-white';
    case 'operational': return 'bg-purple-500 text-white';
    case 'compliance': return 'bg-orange-500 text-white';
    case 'analytics': return 'bg-teal-500 text-white';
    case 'custom': return 'bg-gray-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500 text-white';
    case 'inactive': return 'bg-gray-500 text-white';
    case 'draft': return 'bg-yellow-500 text-black';
    case 'archived': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'critical': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function AdvancedReportingBusinessIntelligence() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || report.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || report.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-indigo-600" />
            Advanced Reporting & Business Intelligence
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive reporting and business intelligence for American psychiatrists
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            <BarChart3 className="h-4 w-4 mr-1" />
            Advanced Analytics
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <TrendingUp className="h-4 w-4 mr-1" />
            Business Intelligence
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Active Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockReportingMetrics.activeReports}</div>
            <p className="text-xs opacity-75 mt-1">Of {mockReportingMetrics.totalReports} total</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Data Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockReportingMetrics.averageAccuracy}%</div>
            <p className="text-xs opacity-75 mt-1">High quality data</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">User Adoption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockReportingMetrics.userAdoption}%</div>
            <p className="text-xs opacity-75 mt-1">Active users</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Insights Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockReportingMetrics.insightsGenerated}</div>
            <p className="text-xs opacity-75 mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Intelligence
          </TabsTrigger>
          <TabsTrigger value="dashboards" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Dashboards
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reporting Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Reporting Overview
                </CardTitle>
                <CardDescription>
                  Key reporting metrics and performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Reports</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockReportingMetrics.activeReports / mockReportingMetrics.totalReports) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockReportingMetrics.totalReports}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Scheduled Reports</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockReportingMetrics.scheduledReports / mockReportingMetrics.totalReports) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockReportingMetrics.scheduledReports}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Real-time Reports</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockReportingMetrics.realTimeReports / mockReportingMetrics.totalReports) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockReportingMetrics.realTimeReports}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Data Freshness</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockReportingMetrics.dataFreshness} className="w-20" />
                      <span className="text-sm font-medium">{mockReportingMetrics.dataFreshness}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Intelligence */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Business Intelligence
                </CardTitle>
                <CardDescription>
                  AI-powered insights and predictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Insights Generated</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockReportingMetrics.insightsGenerated / 200) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockReportingMetrics.insightsGenerated}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Accuracy</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockReportingMetrics.averageAccuracy} className="w-20" />
                      <span className="text-sm font-medium">{mockReportingMetrics.averageAccuracy}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">User Adoption</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockReportingMetrics.userAdoption} className="w-20" />
                      <span className="text-sm font-medium">{mockReportingMetrics.userAdoption}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Alerts</span>
                    <span className="text-sm font-medium text-green-600">12 active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Reports
              </CardTitle>
              <CardDescription>
                Recently generated reports and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReports.map((report) => (
                  <div key={report.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{report.name}</h3>
                      <p className="text-xs text-gray-600">{report.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(report.category)}>
                        {report.category}
                      </Badge>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Reports Management</CardTitle>
              <CardDescription>
                Manage and configure reports and dashboards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Search Reports</label>
                  <Input
                    placeholder="Search by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-32 mt-1 p-2 border rounded-md text-sm"
                    >
                      <option value="all">All</option>
                      <option value="clinical">Clinical</option>
                      <option value="financial">Financial</option>
                      <option value="operational">Operational</option>
                      <option value="compliance">Compliance</option>
                      <option value="analytics">Analytics</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <select 
                      value={selectedStatus} 
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-32 mt-1 p-2 border rounded-md text-sm"
                    >
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{report.name}</h3>
                          <Badge className={getCategoryColor(report.category)}>
                            {report.category}
                          </Badge>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{report.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Type:</span>
                            <p className="text-gray-600">{report.type}</p>
                          </div>
                          <div>
                            <span className="font-medium">Frequency:</span>
                            <p className="text-gray-600">{report.frequency}</p>
                          </div>
                          <div>
                            <span className="font-medium">Last Generated:</span>
                            <p className="text-gray-600">{report.lastGenerated}</p>
                          </div>
                          <div>
                            <span className="font-medium">Recipients:</span>
                            <p className="text-gray-600">{report.recipients.length}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="font-medium text-sm">Metrics:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {report.metrics.slice(0, 3).map((metric, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {metric.name}: {metric.value}{metric.unit}
                              </Badge>
                            ))}
                            {report.metrics.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{report.metrics.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Intelligence Tab */}
        <TabsContent value="intelligence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Business Intelligence
              </CardTitle>
              <CardDescription>
                AI-powered insights and predictive analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockBusinessIntelligence.map((bi) => (
                  <div key={bi.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{bi.name}</h3>
                          <p className="text-gray-600">{bi.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(bi.priority)}>
                          {bi.priority}
                        </Badge>
                        <Badge className={getStatusColor(bi.status)}>
                          {bi.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{bi.dataPoints}</div>
                        <div className="text-sm text-gray-600">Data Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{bi.accuracy}%</div>
                        <div className="text-sm text-gray-600">Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{bi.impact}%</div>
                        <div className="text-sm text-gray-600">Impact</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{bi.lastUpdated}</div>
                        <div className="text-sm text-gray-600">Last Updated</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboards Tab */}
        <TabsContent value="dashboards" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clinical Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Clinical Dashboard
                </CardTitle>
                <CardDescription>
                  Real-time clinical metrics and patient outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Patients</span>
                      <span className="text-sm font-medium text-green-600">156</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Treatment Success Rate</span>
                      <span className="text-sm font-medium text-blue-600">78.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Session Attendance</span>
                      <span className="text-sm font-medium text-orange-600">4.2</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">High Risk Patients</span>
                      <span className="text-sm font-medium text-red-600">23</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Dashboard
                </CardTitle>
                <CardDescription>
                  Revenue tracking and financial performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Monthly Revenue</span>
                      <span className="text-sm font-medium text-green-600">$125,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Collection Rate</span>
                      <span className="text-sm font-medium text-blue-600">94.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Outstanding Invoices</span>
                      <span className="text-sm font-medium text-orange-600">$8,450</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Profit Margin</span>
                      <span className="text-sm font-medium text-purple-600">32.8%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Analytics
                </CardTitle>
                <CardDescription>
                  Key performance indicators and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Patient Satisfaction</span>
                      <div className="flex items-center gap-2">
                        <Progress value={92} className="w-20" />
                        <span className="text-sm font-medium text-green-600">92%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Provider Efficiency</span>
                      <div className="flex items-center gap-2">
                        <Progress value={87} className="w-20" />
                        <span className="text-sm font-medium text-blue-600">87%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Resource Utilization</span>
                      <div className="flex items-center gap-2">
                        <Progress value={78} className="w-20" />
                        <span className="text-sm font-medium text-orange-600">78%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Compliance Score</span>
                      <div className="flex items-center gap-2">
                        <Progress value={96} className="w-20" />
                        <span className="text-sm font-medium text-purple-600">96%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Predictive Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Predictive Analytics
                </CardTitle>
                <CardDescription>
                  AI-powered predictions and forecasts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Patient Retention Prediction</h4>
                    <p className="text-sm text-green-700">
                      High probability of patient retention for next quarter
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-green-100 text-green-800">87% Accuracy</Badge>
                      <Badge variant="outline">Next 3 months</Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Revenue Forecast</h4>
                    <p className="text-sm text-blue-700">
                      Expected 12% revenue increase in Q1 2025
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-blue-100 text-blue-800">92% Confidence</Badge>
                      <Badge variant="outline">Q1 2025</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}







