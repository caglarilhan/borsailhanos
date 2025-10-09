"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Target, AlertTriangle, CheckCircle, XCircle, Clock, Calendar, User, Users,
  Settings, Plus, Download, Upload, RefreshCw, Save, Bell, BellOff, Shield, ShieldCheck,
  ShieldAlert, ShieldX, Lock, Unlock, Key, Eye, EyeOff, Database, Server, Network,
  Activity, BarChart3, TrendingUp, TrendingDown, FileText, BookOpen, MapPin, Phone,
  Mail, MessageSquare, Info, HelpCircle, ExternalLink, Link, LinkBreak, GitBranch,
  Layers, Filter, Search, MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft,
  ChevronRight, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, Menu, MoreVertical,
  X, Check, Star, Heart, ThumbsUp, ThumbsDown, Flag, Bookmark, Tag, Archive, Folder,
  File, FilePlus, FileMinus, FileEdit, FileSearch, FileDown, FileUp, FileShare, FileLock,
  FileUnlock, FileHeart, FileStar, FileAward, FileCrown, FileZap, FileTarget, FileShield,
  FileSettings, FileInfo, FileAlert, FileCheckCircle, FileXCircle, FilePlusCircle,
  FileMinusCircle, FileEditCircle, FileSearchCircle, FileDownCircle, FileUpCircle,
  FileShareCircle, FileLockCircle, FileUnlockCircle, FileHeartCircle, FileStarCircle,
  FileAwardCircle, FileCrownCircle, FileZapCircle, FileTargetCircle, FileShieldCircle,
  FileSettingsCircle, FileInfoCircle, FileAlertCircle, Zap, Globe, Cpu, Memory, HardDrive,
  Wifi, Cloud, BarChart, PieChart, LineChart, ScatterChart, AreaChart, Table, List, Grid,
  Columns, Rows, SortAsc, SortDesc
} from "lucide-react";

// Interfaces
interface AssessmentTool {
  id: string;
  name: string;
  category: 'depression' | 'anxiety' | 'bipolar' | 'schizophrenia' | 'adhd' | 'ptsd' | 'ocd' | 'personality';
  description: string;
  questions: number;
  duration: number;
  reliability: number;
  validity: number;
  status: 'active' | 'inactive' | 'draft';
  lastUpdated: string;
  usageCount: number;
}

interface TreatmentProtocol {
  id: string;
  name: string;
  diagnosis: string;
  description: string;
  duration: string;
  successRate: number;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  medications: string[];
  therapies: string[];
  contraindications: string[];
  status: 'active' | 'inactive' | 'experimental';
}

interface MentalHealthMetric {
  id: string;
  patientId: string;
  patientName: string;
  assessmentType: string;
  score: number;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
  date: string;
  notes: string;
}

interface SymptomTracker {
  id: string;
  patientId: string;
  patientName: string;
  symptoms: string[];
  intensity: number;
  frequency: string;
  triggers: string[];
  copingStrategies: string[];
  date: string;
  improvement: number;
}

// Mock Data
const mockAssessmentTools: AssessmentTool[] = [
  {
    id: "PHQ-9",
    name: "Patient Health Questionnaire-9",
    category: "depression",
    description: "9-item depression screening tool",
    questions: 9,
    duration: 5,
    reliability: 0.89,
    validity: 0.92,
    status: "active",
    lastUpdated: "2024-12-01",
    usageCount: 1250
  },
  {
    id: "GAD-7",
    name: "Generalized Anxiety Disorder-7",
    category: "anxiety",
    description: "7-item anxiety screening tool",
    questions: 7,
    duration: 3,
    reliability: 0.87,
    validity: 0.89,
    status: "active",
    lastUpdated: "2024-12-01",
    usageCount: 980
  },
  {
    id: "YMRS",
    name: "Young Mania Rating Scale",
    category: "bipolar",
    description: "11-item mania assessment tool",
    questions: 11,
    duration: 15,
    reliability: 0.91,
    validity: 0.88,
    status: "active",
    lastUpdated: "2024-11-15",
    usageCount: 450
  },
  {
    id: "PANSS",
    name: "Positive and Negative Syndrome Scale",
    category: "schizophrenia",
    description: "30-item schizophrenia assessment",
    questions: 30,
    duration: 45,
    reliability: 0.94,
    validity: 0.90,
    status: "active",
    lastUpdated: "2024-11-20",
    usageCount: 320
  },
  {
    id: "ADHD-RS",
    name: "ADHD Rating Scale",
    category: "adhd",
    description: "18-item ADHD assessment tool",
    questions: 18,
    duration: 10,
    reliability: 0.86,
    validity: 0.85,
    status: "active",
    lastUpdated: "2024-12-05",
    usageCount: 680
  }
];

const mockTreatmentProtocols: TreatmentProtocol[] = [
  {
    id: "MDD-001",
    name: "Major Depressive Disorder Protocol",
    diagnosis: "Major Depressive Disorder",
    description: "Evidence-based treatment protocol for MDD",
    duration: "12-16 weeks",
    successRate: 75,
    evidenceLevel: "A",
    medications: ["SSRIs", "SNRIs", "Bupropion"],
    therapies: ["CBT", "IPT", "Mindfulness"],
    contraindications: ["MAO inhibitors", "Pregnancy"],
    status: "active"
  },
  {
    id: "GAD-001",
    name: "Generalized Anxiety Disorder Protocol",
    diagnosis: "Generalized Anxiety Disorder",
    description: "Comprehensive treatment for GAD",
    duration: "8-12 weeks",
    successRate: 70,
    evidenceLevel: "A",
    medications: ["SSRIs", "Benzodiazepines", "Buspirone"],
    therapies: ["CBT", "Exposure Therapy", "Relaxation"],
    contraindications: ["Substance abuse", "Respiratory depression"],
    status: "active"
  },
  {
    id: "BD-001",
    name: "Bipolar Disorder Management",
    diagnosis: "Bipolar Disorder",
    description: "Mood stabilization protocol",
    duration: "Lifetime management",
    successRate: 65,
    evidenceLevel: "A",
    medications: ["Lithium", "Anticonvulsants", "Antipsychotics"],
    therapies: ["Psychoeducation", "Family therapy", "CBT"],
    contraindications: ["Renal impairment", "Thyroid disorders"],
    status: "active"
  }
];

const mockMentalHealthMetrics: MentalHealthMetric[] = [
  {
    id: "MHM001",
    patientId: "P001",
    patientName: "Sarah Johnson",
    assessmentType: "PHQ-9",
    score: 15,
    severity: "moderate",
    trend: "improving",
    date: "2024-12-10",
    notes: "Patient showing improvement with current treatment"
  },
  {
    id: "MHM002",
    patientId: "P002",
    patientName: "Michael Chen",
    assessmentType: "GAD-7",
    score: 12,
    severity: "moderate",
    trend: "stable",
    date: "2024-12-08",
    notes: "Anxiety symptoms stable, continue current protocol"
  },
  {
    id: "MHM003",
    patientId: "P003",
    patientName: "Emily Rodriguez",
    assessmentType: "YMRS",
    score: 8,
    severity: "mild",
    trend: "improving",
    date: "2024-12-05",
    notes: "Mania symptoms well controlled"
  }
];

const mockSymptomTrackers: SymptomTracker[] = [
  {
    id: "ST001",
    patientId: "P001",
    patientName: "Sarah Johnson",
    symptoms: ["Depressed mood", "Sleep disturbance", "Fatigue"],
    intensity: 7,
    frequency: "Daily",
    triggers: ["Work stress", "Social isolation"],
    copingStrategies: ["Exercise", "Social support", "Mindfulness"],
    date: "2024-12-10",
    improvement: 30
  },
  {
    id: "ST002",
    patientId: "P002",
    patientName: "Michael Chen",
    symptoms: ["Excessive worry", "Restlessness", "Concentration problems"],
    intensity: 6,
    frequency: "Most days",
    triggers: ["Performance pressure", "Uncertainty"],
    copingStrategies: ["Deep breathing", "Progressive relaxation", "Time management"],
    date: "2024-12-08",
    improvement: 25
  }
];

// Utility Functions
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'depression': return 'bg-blue-500 text-white';
    case 'anxiety': return 'bg-green-500 text-white';
    case 'bipolar': return 'bg-purple-500 text-white';
    case 'schizophrenia': return 'bg-red-500 text-white';
    case 'adhd': return 'bg-orange-500 text-white';
    case 'ptsd': return 'bg-indigo-500 text-white';
    case 'ocd': return 'bg-pink-500 text-white';
    case 'personality': return 'bg-gray-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-500 text-white';
    case 'severe': return 'bg-orange-500 text-white';
    case 'moderate': return 'bg-yellow-500 text-black';
    case 'mild': return 'bg-green-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'improving': return 'text-green-600';
    case 'stable': return 'text-blue-600';
    case 'declining': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

const getEvidenceLevelColor = (level: string) => {
  switch (level) {
    case 'A': return 'bg-green-500 text-white';
    case 'B': return 'bg-blue-500 text-white';
    case 'C': return 'bg-yellow-500 text-black';
    case 'D': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

export default function SpecializedMentalHealthTools() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const filteredAssessmentTools = mockAssessmentTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || tool.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalAssessments = mockAssessmentTools.length;
  const activeAssessments = mockAssessmentTools.filter(t => t.status === 'active').length;
  const totalUsage = mockAssessmentTools.reduce((sum, tool) => sum + tool.usageCount, 0);
  const averageReliability = mockAssessmentTools.reduce((sum, tool) => sum + tool.reliability, 0) / totalAssessments;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            Specialized Mental Health Tools
          </h1>
          <p className="text-gray-600 mt-2">
            Evidence-based assessment tools and treatment protocols for American psychiatrists
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <ShieldCheck className="h-4 w-4 mr-1" />
            Evidence-Based
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <CheckCircle className="h-4 w-4 mr-1" />
            FDA Approved
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Assessment Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssessments}</div>
            <p className="text-xs opacity-75 mt-1">{activeAssessments} active</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage.toLocaleString()}</div>
            <p className="text-xs opacity-75 mt-1">Assessments completed</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Reliability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(averageReliability * 100).toFixed(1)}%</div>
            <p className="text-xs opacity-75 mt-1">Average reliability</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Treatment Protocols</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTreatmentProtocols.length}</div>
            <p className="text-xs opacity-75 mt-1">Evidence-based protocols</p>
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
          <TabsTrigger value="assessments" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="protocols" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Protocols
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="symptoms" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Symptoms
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assessment Tools Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Assessment Tools Summary
                </CardTitle>
                <CardDescription>
                  Overview of available mental health assessment tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockAssessmentTools.slice(0, 3).map((tool) => (
                  <div key={tool.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">{tool.name}</p>
                        <p className="text-xs text-gray-600">{tool.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(tool.category)}>
                        {tool.category}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">
                        {tool.questions} Q
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Treatment Protocols Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Treatment Protocols
                </CardTitle>
                <CardDescription>
                  Evidence-based treatment protocols
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockTreatmentProtocols.slice(0, 3).map((protocol) => (
                  <div key={protocol.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">{protocol.name}</p>
                        <p className="text-xs text-gray-600">{protocol.diagnosis}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getEvidenceLevelColor(protocol.evidenceLevel)}>
                        Level {protocol.evidenceLevel}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">
                        {protocol.successRate}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Mental Health Metrics
              </CardTitle>
              <CardDescription>
                Latest patient assessment results and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockMentalHealthMetrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Brain className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{metric.patientName}</h3>
                        <p className="text-sm text-gray-600">{metric.assessmentType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold">{metric.score}</div>
                        <div className="text-xs text-gray-600">Score</div>
                      </div>
                      <Badge className={getSeverityColor(metric.severity)}>
                        {metric.severity}
                      </Badge>
                      <div className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                        {metric.trend}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Tools</CardTitle>
              <CardDescription>
                Browse and manage mental health assessment tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Search Tools</label>
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
                      <option value="depression">Depression</option>
                      <option value="anxiety">Anxiety</option>
                      <option value="bipolar">Bipolar</option>
                      <option value="schizophrenia">Schizophrenia</option>
                      <option value="adhd">ADHD</option>
                      <option value="ptsd">PTSD</option>
                      <option value="ocd">OCD</option>
                      <option value="personality">Personality</option>
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
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Tools List */}
          <div className="grid gap-4">
            {filteredAssessmentTools.map((tool) => (
              <Card key={tool.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Brain className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{tool.name}</h3>
                          <Badge className={getCategoryColor(tool.category)}>
                            {tool.category}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800">
                            {tool.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{tool.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Questions:</span>
                            <p className="text-gray-600">{tool.questions}</p>
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span>
                            <p className="text-gray-600">{tool.duration} min</p>
                          </div>
                          <div>
                            <span className="font-medium">Reliability:</span>
                            <p className="text-gray-600">{(tool.reliability * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <span className="font-medium">Usage:</span>
                            <p className="text-gray-600">{tool.usageCount.toLocaleString()}</p>
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
                        <FileDown className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Protocols Tab */}
        <TabsContent value="protocols" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Treatment Protocols
              </CardTitle>
              <CardDescription>
                Evidence-based treatment protocols for various mental health conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockTreatmentProtocols.map((protocol) => (
                  <div key={protocol.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Target className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{protocol.name}</h3>
                          <p className="text-gray-600">{protocol.diagnosis}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getEvidenceLevelColor(protocol.evidenceLevel)}>
                          Level {protocol.evidenceLevel}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          {protocol.successRate}% Success
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{protocol.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Medications</h4>
                        <div className="flex flex-wrap gap-1">
                          {protocol.medications.map((med, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {med}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Therapies</h4>
                        <div className="flex flex-wrap gap-1">
                          {protocol.therapies.map((therapy, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-blue-50">
                              {therapy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">Contraindications</h4>
                      <div className="flex flex-wrap gap-1">
                        {protocol.contraindications.map((contra, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-red-50 text-red-700">
                            {contra}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-4">
                      <span className="text-sm text-gray-600">Duration: {protocol.duration}</span>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View Protocol
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileDown className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Mental Health Metrics
              </CardTitle>
              <CardDescription>
                Track patient progress and treatment outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockMentalHealthMetrics.map((metric) => (
                  <div key={metric.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Brain className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{metric.patientName}</h3>
                          <p className="text-sm text-gray-600">{metric.assessmentType}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{metric.date}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{metric.score}</div>
                        <div className="text-xs text-gray-600">Assessment Score</div>
                      </div>
                      <div className="text-center">
                        <Badge className={getSeverityColor(metric.severity)}>
                          {metric.severity}
                        </Badge>
                        <div className="text-xs text-gray-600 mt-1">Severity</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${getTrendColor(metric.trend)}`}>
                          {metric.trend}
                        </div>
                        <div className="text-xs text-gray-600">Trend</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">Notes</div>
                        <div className="text-xs text-gray-600 mt-1">{metric.notes}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Symptoms Tab */}
        <TabsContent value="symptoms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Symptom Tracking
              </CardTitle>
              <CardDescription>
                Monitor patient symptoms and coping strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockSymptomTrackers.map((tracker) => (
                  <div key={tracker.id} className="p-6 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Brain className="h-6 w-6 text-purple-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{tracker.patientName}</h3>
                          <p className="text-sm text-gray-600">{tracker.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{tracker.intensity}/10</div>
                          <div className="text-xs text-gray-600">Intensity</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{tracker.improvement}%</div>
                          <div className="text-xs text-gray-600">Improvement</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Symptoms</h4>
                        <div className="flex flex-wrap gap-1">
                          {tracker.symptoms.map((symptom, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-red-50 text-red-700">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Frequency: {tracker.frequency}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Triggers</h4>
                        <div className="flex flex-wrap gap-1">
                          {tracker.triggers.map((trigger, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-orange-50 text-orange-700">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">Coping Strategies</h4>
                      <div className="flex flex-wrap gap-1">
                        {tracker.copingStrategies.map((strategy, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700">
                            {strategy}
                          </Badge>
                        ))}
                      </div>
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















