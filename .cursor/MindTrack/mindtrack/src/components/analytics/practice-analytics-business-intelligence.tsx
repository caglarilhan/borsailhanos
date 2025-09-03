"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3, Target, AlertTriangle, CheckCircle, XCircle, Clock, Calendar, User, Users,
  Settings, Plus, Download, Upload, RefreshCw, Save, Bell, BellOff, Shield, ShieldCheck,
  ShieldAlert, ShieldX, Lock, Unlock, Key, Eye, EyeOff, Database, Server, Activity,
  TrendingUp, TrendingDown, FileText, MapPin, Phone, Mail, MessageSquare,
  Info, HelpCircle, ExternalLink, Link, LinkBreak, GitBranch, Layers, Filter, Search,
  MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ArrowUp, ArrowDown,
  ArrowLeft, ArrowRight, Home, Menu, MoreVertical, X, Check, Star, Heart, ThumbsUp,
  ThumbsDown, Flag, Bookmark, Tag, Archive, Folder, File, FilePlus, FileMinus, FileEdit,
  FileSearch, FileDown, FileUp, FileShare, FileLock, FileUnlock, FileHeart, FileStar,
  FileAward, FileCrown, FileZap, FileTarget, FileShield, FileSettings, FileInfo, FileAlert,
  FileCheckCircle, FileXCircle, FilePlusCircle, FileMinusCircle, FileEditCircle, FileSearchCircle,
  FileDownCircle, FileUpCircle, FileShareCircle, FileLockCircle, FileUnlockCircle, FileHeartCircle,
  FileStarCircle, FileAwardCircle, FileCrownCircle, FileZapCircle, FileTargetCircle, FileShieldCircle,
  FileSettingsCircle, FileInfoCircle, FileAlertCircle, Zap, Globe, Cpu, Memory, HardDrive,
  Wifi, Cloud, BarChart, PieChart, LineChart, ScatterChart, AreaChart, Table, List, Grid,
  Columns, Rows, SortAsc, SortDesc
} from "lucide-react";

// Interfaces
interface PracticeMetrics {
  totalPatients: number;
  activePatients: number;
  newPatients: number;
  returningPatients: number;
  averageSessionDuration: number;
  sessionsPerWeek: number;
  patientRetentionRate: number;
  averageRevenuePerSession: number;
  totalRevenue: number;
  patientSatisfactionScore: number;
  waitlistLength: number;
  averageWaitTime: number;
}

interface PatientAnalytics {
  id: string;
  patientName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  diagnosis: string;
  sessionsAttended: number;
  totalSessions: number;
  lastSession: string;
  nextSession: string;
  progressScore: number;
  satisfactionScore: number;
  paymentStatus: 'current' | 'overdue' | 'paid';
  insuranceProvider: string;
  treatmentPlan: string;
  notes: string;
}

interface BusinessMetrics {
  revenueGrowth: number;
  patientGrowth: number;
  sessionUtilization: number;
  averageSessionValue: number;
  patientLifetimeValue: number;
  acquisitionCost: number;
  retentionRate: number;
  referralRate: number;
  insuranceAcceptanceRate: number;
  selfPayConversionRate: number;
  averageWaitTime: number;
  capacityUtilization: number;
}

interface PerformanceIndicators {
  kpi: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  status: 'exceeding' | 'meeting' | 'below' | 'critical';
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

// Mock Data
const mockPracticeMetrics: PracticeMetrics = {
  totalPatients: 156,
  activePatients: 89,
  newPatients: 12,
  returningPatients: 77,
  averageSessionDuration: 45,
  sessionsPerWeek: 32,
  patientRetentionRate: 87.5,
  averageRevenuePerSession: 185,
  totalRevenue: 5920,
  patientSatisfactionScore: 4.8,
  waitlistLength: 23,
  averageWaitTime: 8.5
};

const mockPatientAnalytics: PatientAnalytics[] = [
  {
    id: "PA001",
    patientName: "John Smith",
    age: 34,
    gender: "male",
    diagnosis: "Major Depressive Disorder",
    sessionsAttended: 8,
    totalSessions: 12,
    lastSession: "2024-12-14",
    nextSession: "2024-12-21",
    progressScore: 75,
    satisfactionScore: 4.5,
    paymentStatus: "current",
    insuranceProvider: "Blue Cross Blue Shield",
    treatmentPlan: "CBT + Medication Management",
    notes: "Good progress with CBT techniques"
  },
  {
    id: "PA002",
    patientName: "Sarah Johnson",
    age: 28,
    gender: "female",
    diagnosis: "Generalized Anxiety Disorder",
    sessionsAttended: 15,
    totalSessions: 20,
    lastSession: "2024-12-13",
    nextSession: "2024-12-20",
    progressScore: 85,
    satisfactionScore: 5.0,
    paymentStatus: "paid",
    insuranceProvider: "Aetna",
    treatmentPlan: "Exposure Therapy + Relaxation Techniques",
    notes: "Excellent response to exposure therapy"
  },
  {
    id: "PA003",
    patientName: "Michael Brown",
    age: 42,
    gender: "male",
    diagnosis: "Bipolar Disorder",
    sessionsAttended: 6,
    totalSessions: 8,
    lastSession: "2024-12-12",
    nextSession: "2024-12-19",
    progressScore: 60,
    satisfactionScore: 4.0,
    paymentStatus: "overdue",
    insuranceProvider: "Cigna",
    treatmentPlan: "Medication Management + Psychoeducation",
    notes: "Stable on current medication regimen"
  },
  {
    id: "PA004",
    patientName: "Emily Davis",
    age: 31,
    gender: "female",
    diagnosis: "Post-Traumatic Stress Disorder",
    sessionsAttended: 22,
    totalSessions: 25,
    lastSession: "2024-12-11",
    nextSession: "2024-12-18",
    progressScore: 90,
    satisfactionScore: 4.8,
    paymentStatus: "current",
    insuranceProvider: "UnitedHealth",
    treatmentPlan: "EMDR + Trauma-Focused CBT",
    notes: "Significant improvement in PTSD symptoms"
  },
  {
    id: "PA005",
    patientName: "David Wilson",
    age: 39,
    gender: "male",
    diagnosis: "ADHD",
    sessionsAttended: 4,
    totalSessions: 6,
    lastSession: "2024-12-10",
    nextSession: "2024-12-17",
    progressScore: 70,
    satisfactionScore: 4.2,
    paymentStatus: "paid",
    insuranceProvider: "Humana",
    treatmentPlan: "Behavioral Therapy + Medication",
    notes: "Responding well to stimulant medication"
  }
];

const mockBusinessMetrics: BusinessMetrics = {
  revenueGrowth: 15.2,
  patientGrowth: 8.7,
  sessionUtilization: 92.5,
  averageSessionValue: 185,
  patientLifetimeValue: 2200,
  acquisitionCost: 150,
  retentionRate: 87.5,
  referralRate: 23.4,
  insuranceAcceptanceRate: 78.9,
  selfPayConversionRate: 65.2,
  averageWaitTime: 8.5,
  capacityUtilization: 88.3
};

const mockPerformanceIndicators: PerformanceIndicators[] = [
  {
    kpi: "Patient Retention Rate",
    currentValue: 87.5,
    targetValue: 85.0,
    unit: "%",
    status: "exceeding",
    trend: "up",
    percentage: 102.9
  },
  {
    kpi: "Average Revenue per Session",
    currentValue: 185,
    targetValue: 180,
    unit: "$",
    status: "exceeding",
    trend: "up",
    percentage: 102.8
  },
  {
    kpi: "Session Utilization",
    currentValue: 92.5,
    targetValue: 90.0,
    unit: "%",
    status: "exceeding",
    trend: "up",
    percentage: 102.8
  },
  {
    kpi: "Patient Satisfaction Score",
    currentValue: 4.8,
    targetValue: 4.5,
    unit: "/5",
    status: "exceeding",
    trend: "up",
    percentage: 106.7
  },
  {
    kpi: "Average Wait Time",
    currentValue: 8.5,
    targetValue: 7.0,
    unit: "days",
    status: "below",
    trend: "down",
    percentage: 121.4
  },
  {
    kpi: "Insurance Acceptance Rate",
    currentValue: 78.9,
    targetValue: 80.0,
    unit: "%",
    status: "below",
    trend: "down",
    percentage: 98.6
  }
];

// Utility Functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'exceeding': return 'bg-green-500 text-white';
    case 'meeting': return 'bg-blue-500 text-white';
    case 'below': return 'bg-yellow-500 text-black';
    case 'critical': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'up': return 'text-green-600';
    case 'down': return 'text-red-600';
    case 'stable': return 'text-gray-600';
    default: return 'text-gray-600';
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'current': return 'bg-green-500 text-white';
    case 'overdue': return 'bg-red-500 text-white';
    case 'paid': return 'bg-blue-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getProgressColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export default function PracticeAnalyticsBusinessIntelligence() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDiagnosis, setSelectedDiagnosis] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  
  const filteredPatients = mockPatientAnalytics.filter(patient => {
    const matchesSearch = patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiagnosis = selectedDiagnosis === "all" || patient.diagnosis === selectedDiagnosis;
    const matchesPaymentStatus = selectedPaymentStatus === "all" || patient.paymentStatus === selectedPaymentStatus;
    
    return matchesSearch && matchesDiagnosis && matchesPaymentStatus;
  });

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Practice Analytics & Business Intelligence
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive practice analytics and business intelligence for American psychiatrists
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Activity className="h-4 w-4 mr-1" />
            Real-time
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <TrendingUp className="h-4 w-4 mr-1" />
            Growing
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPracticeMetrics.totalPatients}</div>
            <p className="text-xs opacity-75 mt-1">{mockPracticeMetrics.activePatients} active</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{mockBusinessMetrics.revenueGrowth}%</div>
            <p className="text-xs opacity-75 mt-1">This month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Retention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPracticeMetrics.patientRetentionRate}%</div>
            <p className="text-xs opacity-75 mt-1">Patient retention</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPracticeMetrics.patientSatisfactionScore}/5</div>
            <p className="text-xs opacity-75 mt-1">Patient satisfaction</p>
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
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Patients
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Practice Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Practice Summary
                </CardTitle>
                <CardDescription>
                  Key practice metrics and performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{mockPracticeMetrics.totalPatients}</div>
                    <div className="text-sm text-gray-600">Total Patients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{mockPracticeMetrics.activePatients}</div>
                    <div className="text-sm text-gray-600">Active Patients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{mockPracticeMetrics.sessionsPerWeek}</div>
                    <div className="text-sm text-gray-600">Sessions/Week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{mockPracticeMetrics.averageSessionDuration}</div>
                    <div className="text-sm text-gray-600">Avg Session (min)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance Indicators
                </CardTitle>
                <CardDescription>
                  KPI tracking and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {mockPerformanceIndicators.slice(0, 4).map((indicator, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{indicator.kpi}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={indicator.percentage} className="w-20" />
                        <span className="text-sm font-medium">{indicator.currentValue}{indicator.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Business Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Business Metrics
              </CardTitle>
              <CardDescription>
                Key business performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+{mockBusinessMetrics.revenueGrowth}%</div>
                  <div className="text-sm text-gray-600">Revenue Growth</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">+{mockBusinessMetrics.patientGrowth}%</div>
                  <div className="text-sm text-gray-600">Patient Growth</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{mockBusinessMetrics.sessionUtilization}%</div>
                  <div className="text-sm text-gray-600">Session Utilization</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">${mockBusinessMetrics.averageSessionValue}</div>
                  <div className="text-sm text-gray-600">Avg Session Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">${mockBusinessMetrics.patientLifetimeValue}</div>
                  <div className="text-sm text-gray-600">Patient Lifetime Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">${mockBusinessMetrics.acquisitionCost}</div>
                  <div className="text-sm text-gray-600">Acquisition Cost</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">{mockBusinessMetrics.retentionRate}%</div>
                  <div className="text-sm text-gray-600">Retention Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">{mockBusinessMetrics.referralRate}%</div>
                  <div className="text-sm text-gray-600">Referral Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Analytics</CardTitle>
              <CardDescription>
                Detailed patient analytics and progress tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Search Patients</label>
                  <Input
                    placeholder="Search by patient name or diagnosis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <div>
                    <label className="text-sm font-medium">Diagnosis</label>
                    <select 
                      value={selectedDiagnosis} 
                      onChange={(e) => setSelectedDiagnosis(e.target.value)}
                      className="w-40 mt-1 p-2 border rounded-md text-sm"
                    >
                      <option value="all">All Diagnoses</option>
                      <option value="Major Depressive Disorder">MDD</option>
                      <option value="Generalized Anxiety Disorder">GAD</option>
                      <option value="Bipolar Disorder">Bipolar</option>
                      <option value="Post-Traumatic Stress Disorder">PTSD</option>
                      <option value="ADHD">ADHD</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Payment Status</label>
                    <select 
                      value={selectedPaymentStatus} 
                      onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                      className="w-32 mt-1 p-2 border rounded-md text-sm"
                    >
                      <option value="all">All</option>
                      <option value="current">Current</option>
                      <option value="overdue">Overdue</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patients List */}
          <div className="grid gap-4">
            {filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{patient.patientName}</h3>
                          <Badge className="bg-gray-100 text-gray-800">
                            {patient.age} years, {patient.gender}
                          </Badge>
                          <Badge className="bg-purple-100 text-purple-800">
                            {patient.diagnosis}
                          </Badge>
                          <Badge className={getPaymentStatusColor(patient.paymentStatus)}>
                            {patient.paymentStatus}
                          </Badge>
                        </div>
                        <p className="text-gray-600">Treatment Plan: {patient.treatmentPlan}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Sessions:</span>
                            <p className="text-gray-600">{patient.sessionsAttended}/{patient.totalSessions}</p>
                          </div>
                          <div>
                            <span className="font-medium">Progress Score:</span>
                            <p className={`text-gray-600 ${getProgressColor(patient.progressScore)}`}>
                              {patient.progressScore}%
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Satisfaction:</span>
                            <p className="text-gray-600">{patient.satisfactionScore}/5</p>
                          </div>
                          <div>
                            <span className="font-medium">Insurance:</span>
                            <p className="text-gray-600">{patient.insuranceProvider}</p>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Last Session:</span>
                          <p className="text-gray-600">{patient.lastSession}</p>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Next Session:</span>
                          <p className="text-gray-600">{patient.nextSession}</p>
                        </div>
                        {patient.notes && (
                          <div className="text-sm">
                            <span className="font-medium">Notes:</span>
                            <p className="text-gray-600">{patient.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Progress
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Performance Tracking
              </CardTitle>
              <CardDescription>
                Key performance indicators and metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockPerformanceIndicators.map((indicator, index) => (
                  <div key={index} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Target className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{indicator.kpi}</h3>
                          <p className="text-gray-600">Target: {indicator.targetValue}{indicator.unit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(indicator.status)}>
                          {indicator.status}
                        </Badge>
                        <Badge className={getTrendColor(indicator.trend)}>
                          {indicator.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                          {indicator.trend === 'down' && <TrendingDown className="h-4 w-4" />}
                          {indicator.trend === 'stable' && <Activity className="h-4 w-4" />}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{indicator.currentValue}{indicator.unit}</div>
                        <div className="text-sm text-gray-600">Current Value</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{indicator.targetValue}{indicator.unit}</div>
                        <div className="text-sm text-gray-600">Target Value</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${indicator.percentage >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                          {indicator.percentage}%
                        </div>
                        <div className="text-sm text-gray-600">Performance</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Performance vs Target</span>
                        <span className="text-sm text-gray-600">{indicator.percentage}%</span>
                      </div>
                      <Progress value={indicator.percentage} className="w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Analytics
                </CardTitle>
                <CardDescription>
                  Revenue growth and financial performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Revenue Growth</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockBusinessMetrics.revenueGrowth} className="w-20" />
                      <span className="text-sm font-medium text-green-600">+{mockBusinessMetrics.revenueGrowth}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Patient Growth</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockBusinessMetrics.patientGrowth} className="w-20" />
                      <span className="text-sm font-medium text-blue-600">+{mockBusinessMetrics.patientGrowth}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Session Utilization</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockBusinessMetrics.sessionUtilization} className="w-20" />
                      <span className="text-sm font-medium">{mockBusinessMetrics.sessionUtilization}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Capacity Utilization</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockBusinessMetrics.capacityUtilization} className="w-20" />
                      <span className="text-sm font-medium">{mockBusinessMetrics.capacityUtilization}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Patient Analytics
                </CardTitle>
                <CardDescription>
                  Patient acquisition and retention metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Retention Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockBusinessMetrics.retentionRate} className="w-20" />
                      <span className="text-sm font-medium">{mockBusinessMetrics.retentionRate}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Referral Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockBusinessMetrics.referralRate} className="w-20" />
                      <span className="text-sm font-medium">{mockBusinessMetrics.referralRate}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Insurance Acceptance</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockBusinessMetrics.insuranceAcceptanceRate} className="w-20" />
                      <span className="text-sm font-medium">{mockBusinessMetrics.insuranceAcceptanceRate}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Self-Pay Conversion</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockBusinessMetrics.selfPayConversionRate} className="w-20" />
                      <span className="text-sm font-medium">{mockBusinessMetrics.selfPayConversionRate}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Key Insights
                </CardTitle>
                <CardDescription>
                  Actionable business insights and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Strong Performance</h4>
                    <p className="text-sm text-green-700">
                      Patient retention rate is exceeding target by 2.9%. Consider expanding capacity to accommodate growth.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Revenue Growth</h4>
                    <p className="text-sm text-blue-700">
                      Revenue growth at 15.2% exceeds industry average. Focus on maintaining quality while scaling.
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Wait Time Alert</h4>
                    <p className="text-sm text-yellow-700">
                      Average wait time of 8.5 days exceeds target. Consider adding more appointment slots.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recommendations
                </CardTitle>
                <CardDescription>
                  Strategic recommendations for practice improvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Expand Capacity</h4>
                      <p className="text-sm text-gray-600">Add more appointment slots to reduce wait times</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Improve Insurance Relations</h4>
                      <p className="text-sm text-gray-600">Work on increasing insurance acceptance rate</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Optimize Scheduling</h4>
                      <p className="text-sm text-gray-600">Improve session utilization and reduce no-shows</p>
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




