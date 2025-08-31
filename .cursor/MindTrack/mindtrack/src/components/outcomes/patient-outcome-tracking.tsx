"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp, TrendingDown, Target, Activity, Heart, Brain, Users, Calendar, Clock,
  BarChart, PieChart, LineChart, ScatterChart, AreaChart, Zap, Star, CheckCircle, XCircle,
  AlertTriangle, Info, Search, Filter, Download, Upload, RefreshCw, Save, Bell, BellOff,
  Shield, ShieldCheck, ShieldAlert, ShieldX, Lock, Unlock, Key, Eye, EyeOff, Database,
  Server, MapPin, Phone, Mail, MessageSquare, HelpCircle, ExternalLink, Link, LinkBreak,
  GitBranch, Layers, MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, Menu, MoreVertical, X, Check, Flag,
  Bookmark, Archive, Folder, File, FilePlus, FileMinus, FileEdit, FileSearch, FileDown,
  FileUp, FileShare, FileLock, FileUnlock, FileHeart, FileStar, FileZap, FileTarget,
  FileShield, FileSettings, FileInfo, FileAlert, FileCheckCircle, FileXCircle,
  FilePlusCircle, FileMinusCircle, FileEditCircle, FileSearchCircle, FileDownCircle,
  FileUpCircle, FileShareCircle, FileLockCircle, FileUnlockCircle, FileHeartCircle,
  FileStarCircle, FileZapCircle, FileTargetCircle, FileShieldCircle, FileSettingsCircle,
  FileInfoCircle, FileAlertCircle, Globe, Cpu, Memory, HardDrive, Wifi, Cloud, Table,
  List, Grid, Columns, Rows, SortAsc, SortDesc, Lightbulb, Settings, Plus,
  MoreHorizontal as MoreHorizontalIcon
} from "lucide-react";

// Interfaces
interface PatientOutcome {
  id: string;
  patientId: string;
  patientName: string;
  diagnosis: string;
  treatmentStartDate: string;
  currentTreatment: string;
  progressData: ProgressData[];
  symptomSeverity: SymptomSeverity[];
  treatmentEffectiveness: TreatmentEffectiveness;
  recoveryMetrics: RecoveryMetrics;
  relapseRisk: number;
  lastAssessment: string;
  nextAssessment: string;
  status: 'improving' | 'stable' | 'declining' | 'recovered';
}

interface ProgressData {
  date: string;
  overallScore: number;
  depressionScore: number;
  anxietyScore: number;
  functioningScore: number;
  qualityOfLifeScore: number;
  notes: string;
}

interface SymptomSeverity {
  symptom: string;
  baselineScore: number;
  currentScore: number;
  improvement: number;
  trend: 'improving' | 'stable' | 'worsening';
}

interface TreatmentEffectiveness {
  treatment: string;
  effectiveness: number;
  sideEffects: string[];
  compliance: number;
  duration: number;
  costEffectiveness: number;
}

interface RecoveryMetrics {
  recoveryRate: number;
  timeToRecovery: number;
  relapseRate: number;
  functionalImprovement: number;
  qualityOfLifeImprovement: number;
  returnToWork: boolean;
  socialReintegration: number;
}

interface OutcomeMetrics {
  totalPatients: number;
  improvingPatients: number;
  recoveredPatients: number;
  averageRecoveryTime: number;
  averageImprovement: number;
  relapseRate: number;
  treatmentSuccessRate: number;
}

// Mock Data
const mockPatientOutcomes: PatientOutcome[] = [
  {
    id: "PO001",
    patientId: "P12345",
    patientName: "Sarah Johnson",
    diagnosis: "Major Depressive Disorder (MDD)",
    treatmentStartDate: "2024-06-15",
    currentTreatment: "Sertraline 50mg + CBT",
    progressData: [
      {
        date: "2024-06-15",
        overallScore: 65,
        depressionScore: 28,
        anxietyScore: 22,
        functioningScore: 15,
        qualityOfLifeScore: 20,
        notes: "Initial assessment - severe symptoms"
      },
      {
        date: "2024-07-15",
        overallScore: 45,
        depressionScore: 18,
        anxietyScore: 15,
        functioningScore: 12,
        qualityOfLifeScore: 35,
        notes: "1 month follow-up - moderate improvement"
      },
      {
        date: "2024-08-15",
        overallScore: 25,
        depressionScore: 12,
        anxietyScore: 8,
        functioningScore: 5,
        qualityOfLifeScore: 60,
        notes: "2 months follow-up - significant improvement"
      },
      {
        date: "2024-09-15",
        overallScore: 15,
        depressionScore: 8,
        anxietyScore: 5,
        functioningScore: 2,
        qualityOfLifeScore: 80,
        notes: "3 months follow-up - continued improvement"
      }
    ],
    symptomSeverity: [
      {
        symptom: "Depressed Mood",
        baselineScore: 28,
        currentScore: 8,
        improvement: 71.4,
        trend: "improving"
      },
      {
        symptom: "Anxiety",
        baselineScore: 22,
        currentScore: 5,
        improvement: 77.3,
        trend: "improving"
      },
      {
        symptom: "Sleep Disturbance",
        baselineScore: 25,
        currentScore: 10,
        improvement: 60.0,
        trend: "improving"
      }
    ],
    treatmentEffectiveness: {
      treatment: "Sertraline + CBT",
      effectiveness: 85,
      sideEffects: ["mild nausea", "occasional headache"],
      compliance: 95,
      duration: 90,
      costEffectiveness: 78
    },
    recoveryMetrics: {
      recoveryRate: 76.9,
      timeToRecovery: 90,
      relapseRate: 15,
      functionalImprovement: 86.7,
      qualityOfLifeImprovement: 75.0,
      returnToWork: true,
      socialReintegration: 80
    },
    relapseRisk: 12,
    lastAssessment: "2024-09-15",
    nextAssessment: "2024-10-15",
    status: "improving"
  },
  {
    id: "PO002",
    patientId: "P12346",
    patientName: "Michael Chen",
    diagnosis: "Generalized Anxiety Disorder (GAD)",
    treatmentStartDate: "2024-07-01",
    currentTreatment: "Escitalopram 10mg",
    progressData: [
      {
        date: "2024-07-01",
        overallScore: 55,
        depressionScore: 15,
        anxietyScore: 30,
        functioningScore: 10,
        qualityOfLifeScore: 25,
        notes: "Initial assessment - moderate anxiety"
      },
      {
        date: "2024-08-01",
        overallScore: 40,
        depressionScore: 12,
        anxietyScore: 20,
        functioningScore: 8,
        qualityOfLifeScore: 40,
        notes: "1 month follow-up - good response"
      },
      {
        date: "2024-09-01",
        overallScore: 30,
        depressionScore: 10,
        anxietyScore: 15,
        functioningScore: 5,
        qualityOfLifeScore: 55,
        notes: "2 months follow-up - continued improvement"
      }
    ],
    symptomSeverity: [
      {
        symptom: "Excessive Worry",
        baselineScore: 30,
        currentScore: 15,
        improvement: 50.0,
        trend: "improving"
      },
      {
        symptom: "Restlessness",
        baselineScore: 25,
        currentScore: 12,
        improvement: 52.0,
        trend: "improving"
      }
    ],
    treatmentEffectiveness: {
      treatment: "Escitalopram",
      effectiveness: 75,
      sideEffects: ["mild drowsiness"],
      compliance: 90,
      duration: 60,
      costEffectiveness: 82
    },
    recoveryMetrics: {
      recoveryRate: 65.5,
      timeToRecovery: 60,
      relapseRate: 20,
      functionalImprovement: 50.0,
      qualityOfLifeImprovement: 54.5,
      returnToWork: true,
      socialReintegration: 70
    },
    relapseRisk: 18,
    lastAssessment: "2024-09-01",
    nextAssessment: "2024-10-01",
    status: "improving"
  }
];

const mockOutcomeMetrics: OutcomeMetrics = {
  totalPatients: 234,
  improvingPatients: 189,
  recoveredPatients: 67,
  averageRecoveryTime: 85,
  averageImprovement: 72.3,
  relapseRate: 18.5,
  treatmentSuccessRate: 80.8
};

// Utility Functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'improving': return 'bg-green-500 text-white';
    case 'stable': return 'bg-blue-500 text-white';
    case 'declining': return 'bg-red-500 text-white';
    case 'recovered': return 'bg-purple-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'improving': return 'bg-green-100 text-green-800';
    case 'stable': return 'bg-blue-100 text-blue-800';
    case 'worsening': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getRelapseRiskColor = (risk: number) => {
  if (risk < 10) return 'bg-green-100 text-green-800';
  if (risk < 20) return 'bg-yellow-100 text-yellow-800';
  if (risk < 30) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

export default function PatientOutcomeTracking() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDiagnosis, setSelectedDiagnosis] = useState("all");
  
  const filteredOutcomes = mockPatientOutcomes.filter(outcome => {
    const matchesStatus = selectedStatus === "all" || outcome.status === selectedStatus;
    const matchesDiagnosis = selectedDiagnosis === "all" || outcome.diagnosis.includes(selectedDiagnosis);
    
    return matchesStatus && matchesDiagnosis;
  });

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-green-50 via-white to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            Patient Outcome Tracking
          </h1>
          <p className="text-gray-600 mt-2">
            Longitudinal patient progress monitoring and treatment effectiveness analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <TrendingUp className="h-4 w-4 mr-1" />
            Outcomes
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Target className="h-4 w-4 mr-1" />
            Progress
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockOutcomeMetrics.totalPatients}</div>
            <p className="text-xs opacity-75 mt-1">Active outcome tracking</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Improving Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockOutcomeMetrics.improvingPatients}</div>
            <p className="text-xs opacity-75 mt-1">{((mockOutcomeMetrics.improvingPatients / mockOutcomeMetrics.totalPatients) * 100).toFixed(1)}% improvement rate</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Recovered Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockOutcomeMetrics.recoveredPatients}</div>
            <p className="text-xs opacity-75 mt-1">{((mockOutcomeMetrics.recoveredPatients / mockOutcomeMetrics.totalPatients) * 100).toFixed(1)}% recovery rate</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockOutcomeMetrics.treatmentSuccessRate}%</div>
            <p className="text-xs opacity-75 mt-1">Treatment effectiveness</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Patients
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recovery Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recovery Metrics
                </CardTitle>
                <CardDescription>
                  Overall patient recovery and improvement metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Recovery Time</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockOutcomeMetrics.averageRecoveryTime / 120) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockOutcomeMetrics.averageRecoveryTime} days</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Improvement</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockOutcomeMetrics.averageImprovement} className="w-20" />
                      <span className="text-sm font-medium">{mockOutcomeMetrics.averageImprovement}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Relapse Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockOutcomeMetrics.relapseRate} className="w-20" />
                      <span className="text-sm font-medium">{mockOutcomeMetrics.relapseRate}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Treatment Success</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockOutcomeMetrics.treatmentSuccessRate} className="w-20" />
                      <span className="text-sm font-medium">{mockOutcomeMetrics.treatmentSuccessRate}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Patient Status Distribution
                </CardTitle>
                <CardDescription>
                  Current status of all tracked patients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Improving</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockOutcomeMetrics.improvingPatients / mockOutcomeMetrics.totalPatients) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockOutcomeMetrics.improvingPatients}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Recovered</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockOutcomeMetrics.recoveredPatients / mockOutcomeMetrics.totalPatients) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockOutcomeMetrics.recoveredPatients}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Stable</span>
                    <span className="text-sm font-medium text-blue-600">28</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Declining</span>
                    <span className="text-sm font-medium text-red-600">17</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Patient Outcomes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Patient Outcomes
              </CardTitle>
              <CardDescription>
                Latest patient progress updates and assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPatientOutcomes.map((outcome) => (
                  <div key={outcome.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{outcome.patientName}</h3>
                      <p className="text-xs text-gray-600">{outcome.diagnosis}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        {outcome.recoveryMetrics.recoveryRate}% recovery
                      </Badge>
                      <Badge className={getStatusColor(outcome.status)}>
                        {outcome.status}
                      </Badge>
                      <Badge className={getRelapseRiskColor(outcome.relapseRisk)}>
                        {outcome.relapseRisk}% relapse risk
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Outcome Management</CardTitle>
              <CardDescription>
                Filter and manage patient outcome tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select 
                    value={selectedStatus} 
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-40 mt-1 p-2 border rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="improving">Improving</option>
                    <option value="stable">Stable</option>
                    <option value="declining">Declining</option>
                    <option value="recovered">Recovered</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Diagnosis</label>
                  <select 
                    value={selectedDiagnosis} 
                    onChange={(e) => setSelectedDiagnosis(e.target.value)}
                    className="w-40 mt-1 p-2 border rounded-md text-sm"
                  >
                    <option value="all">All Diagnoses</option>
                    <option value="MDD">MDD</option>
                    <option value="GAD">GAD</option>
                    <option value="Bipolar">Bipolar</option>
                    <option value="PTSD">PTSD</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patients List */}
          <div className="grid gap-4">
            {filteredOutcomes.map((outcome) => (
              <Card key={outcome.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{outcome.patientName}</h3>
                          <Badge className={getStatusColor(outcome.status)}>
                            {outcome.status}
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-800">
                            {outcome.recoveryMetrics.recoveryRate}% recovery
                          </Badge>
                          <Badge className={getRelapseRiskColor(outcome.relapseRisk)}>
                            {outcome.relapseRisk}% relapse risk
                          </Badge>
                        </div>
                        <p className="text-gray-600">{outcome.diagnosis}</p>
                        <p className="text-sm text-gray-500">Treatment: {outcome.currentTreatment}</p>
                        
                        <div className="mt-3">
                          <span className="font-medium text-sm">Key Metrics:</span>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1 text-sm">
                            <div>
                              <span className="text-gray-600">Recovery Rate:</span>
                              <p className="font-medium">{outcome.recoveryMetrics.recoveryRate}%</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Time to Recovery:</span>
                              <p className="font-medium">{outcome.recoveryMetrics.timeToRecovery} days</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Functional Improvement:</span>
                              <p className="font-medium">{outcome.recoveryMetrics.functionalImprovement}%</p>
                            </div>
                            <div>
                              <span className="text-gray-600">QoL Improvement:</span>
                              <p className="font-medium">{outcome.recoveryMetrics.qualityOfLifeImprovement}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Track Progress
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progress Tracking
              </CardTitle>
              <CardDescription>
                Detailed progress tracking and symptom severity monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockPatientOutcomes.map((outcome) => (
                  <div key={outcome.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{outcome.patientName}</h3>
                          <p className="text-gray-600">{outcome.diagnosis}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(outcome.status)}>
                          {outcome.status}
                        </Badge>
                        <Badge variant="outline">
                          {outcome.recoveryMetrics.recoveryRate}% recovery
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Progress Data */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Progress Timeline:</h4>
                      <div className="space-y-2">
                        {outcome.progressData.map((data, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                            <div className="text-sm font-medium">{new Date(data.date).toLocaleDateString()}</div>
                            <div className="flex-1">
                              <div className="flex justify-between text-sm">
                                <span>Overall Score: {data.overallScore}</span>
                                <span>Depression: {data.depressionScore}</span>
                                <span>Anxiety: {data.anxietyScore}</span>
                                <span>Functioning: {data.functioningScore}</span>
                              </div>
                              <Progress value={100 - (data.overallScore / 70) * 100} className="mt-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Symptom Severity */}
                    <div className="mt-4">
                      <h4 className="font-medium mb-3">Symptom Severity Changes:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {outcome.symptomSeverity.map((symptom, index) => (
                          <div key={index} className="p-3 border rounded">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">{symptom.symptom}</span>
                              <Badge className={getTrendColor(symptom.trend)}>
                                {symptom.trend}
                              </Badge>
                            </div>
                            <div className="text-sm space-y-1">
                              <div>Baseline: {symptom.baselineScore}</div>
                              <div>Current: {symptom.currentScore}</div>
                              <div className="font-medium text-green-600">
                                Improvement: {symptom.improvement}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Outcome Analytics
              </CardTitle>
              <CardDescription>
                Advanced analytics and insights for treatment effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Treatment Effectiveness */}
                <div className="space-y-4">
                  <h4 className="font-medium">Treatment Effectiveness Analysis:</h4>
                  {mockPatientOutcomes.map((outcome) => (
                    <div key={outcome.id} className="p-4 border rounded">
                      <h5 className="font-medium mb-2">{outcome.patientName}</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Effectiveness:</span>
                          <span>{outcome.treatmentEffectiveness.effectiveness}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Compliance:</span>
                          <span>{outcome.treatmentEffectiveness.compliance}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cost Effectiveness:</span>
                          <span>{outcome.treatmentEffectiveness.costEffectiveness}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{outcome.treatmentEffectiveness.duration} days</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recovery Metrics */}
                <div className="space-y-4">
                  <h4 className="font-medium">Recovery Metrics Summary:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded text-center">
                      <div className="text-2xl font-bold text-green-600">{mockOutcomeMetrics.averageImprovement}%</div>
                      <div className="text-sm text-gray-600">Average Improvement</div>
                    </div>
                    <div className="p-4 border rounded text-center">
                      <div className="text-2xl font-bold text-blue-600">{mockOutcomeMetrics.averageRecoveryTime}</div>
                      <div className="text-sm text-gray-600">Avg Recovery Time (days)</div>
                    </div>
                    <div className="p-4 border rounded text-center">
                      <div className="text-2xl font-bold text-purple-600">{mockOutcomeMetrics.treatmentSuccessRate}%</div>
                      <div className="text-sm text-gray-600">Treatment Success Rate</div>
                    </div>
                    <div className="p-4 border rounded text-center">
                      <div className="text-2xl font-bold text-red-600">{mockOutcomeMetrics.relapseRate}%</div>
                      <div className="text-sm text-gray-600">Relapse Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
