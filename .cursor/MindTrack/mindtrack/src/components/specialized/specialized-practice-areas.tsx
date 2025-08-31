"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Target, Brain, Heart, Users, Calendar, Clock, Activity, TrendingUp, BarChart, PieChart, LineChart, ScatterChart, AreaChart, Zap, Star, CheckCircle, XCircle,
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
  MoreHorizontal as MoreHorizontalIcon, BookOpen, FileText, Award, Certificate, Diploma, Scroll,
  Document, Clipboard, ClipboardList, ClipboardCheck, ClipboardX, ClipboardCopy,
  ClipboardPaste, Tag, GraduationCap, Edit
} from "lucide-react";

// Interfaces
interface SpecializedArea {
  id: string;
  name: string;
  category: 'child_adolescent' | 'geriatric' | 'addiction' | 'forensic' | 'consultation_liaison' | 'emergency' | 'community' | 'research';
  description: string;
  patientCount: number;
  activeProtocols: number;
  successRate: number;
  averageSessionLength: number;
  revenue: number;
  protocols: TreatmentProtocol[];
  assessments: Assessment[];
  templates: PracticeTemplate[];
  lastUpdated: string;
  status: 'active' | 'developing' | 'paused';
}

interface TreatmentProtocol {
  id: string;
  name: string;
  description: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  duration: string;
  sessions: number;
  successRate: number;
  cost: number;
  insuranceCoverage: string[];
  contraindications: string[];
  sideEffects: string[];
}

interface Assessment {
  id: string;
  name: string;
  type: 'screening' | 'diagnostic' | 'outcome' | 'risk';
  duration: number;
  reliability: number;
  validity: number;
  cost: number;
  insuranceCoverage: boolean;
  digitalVersion: boolean;
}

interface PracticeTemplate {
  id: string;
  name: string;
  type: 'intake' | 'assessment' | 'treatment_plan' | 'progress_note' | 'discharge';
  description: string;
  fields: TemplateField[];
  usageCount: number;
  rating: number;
  lastModified: string;
}

interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'textarea' | 'checkbox' | 'radio';
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

interface SpecializedMetrics {
  totalAreas: number;
  activeAreas: number;
  totalPatients: number;
  averageSuccessRate: number;
  totalRevenue: number;
  protocolCount: number;
  assessmentCount: number;
  templateCount: number;
}

// Mock Data
const mockSpecializedAreas: SpecializedArea[] = [
  {
    id: "SA001",
    name: "Child & Adolescent Psychiatry",
    category: "child_adolescent",
    description: "Specialized mental health care for children and adolescents with developmental, behavioral, and emotional disorders",
    patientCount: 156,
    activeProtocols: 8,
    successRate: 82.5,
    averageSessionLength: 45,
    revenue: 450000,
    protocols: [
      {
        id: "TP001",
        name: "CBT for Adolescent Depression",
        description: "Cognitive Behavioral Therapy protocol for treating depression in adolescents",
        evidenceLevel: "A",
        duration: "12 weeks",
        sessions: 16,
        successRate: 78,
        cost: 2400,
        insuranceCoverage: ["Medicare", "Medicaid", "Private Insurance"],
        contraindications: ["Severe psychosis", "Active substance abuse"],
        sideEffects: ["Temporary increase in anxiety", "Emotional discomfort"]
      },
      {
        id: "TP002",
        name: "ADHD Behavioral Management",
        description: "Comprehensive behavioral management for ADHD in children",
        evidenceLevel: "A",
        duration: "8 weeks",
        sessions: 12,
        successRate: 85,
        cost: 1800,
        insuranceCoverage: ["Medicare", "Medicaid", "Private Insurance"],
        contraindications: ["Severe oppositional behavior"],
        sideEffects: ["Initial resistance to change"]
      }
    ],
    assessments: [
      {
        id: "A001",
        name: "ADHD Rating Scale",
        type: "diagnostic",
        duration: 20,
        reliability: 0.89,
        validity: 0.92,
        cost: 25,
        insuranceCoverage: true,
        digitalVersion: true
      },
      {
        id: "A002",
        name: "Child Depression Inventory",
        type: "screening",
        duration: 15,
        reliability: 0.85,
        validity: 0.88,
        cost: 20,
        insuranceCoverage: true,
        digitalVersion: true
      }
    ],
    templates: [
      {
        id: "T001",
        name: "Child Intake Assessment",
        type: "intake",
        description: "Comprehensive intake assessment for child and adolescent patients",
        fields: [
          { id: "F001", name: "Patient Name", type: "text", required: true },
          { id: "F002", name: "Age", type: "number", required: true },
          { id: "F003", name: "Presenting Problem", type: "textarea", required: true },
          { id: "F004", name: "Family History", type: "textarea", required: false },
          { id: "F005", name: "Developmental History", type: "textarea", required: false }
        ],
        usageCount: 234,
        rating: 4.8,
        lastModified: "2024-11-15"
      }
    ],
    lastUpdated: "2024-12-14T10:30:00Z",
    status: "active"
  },
  {
    id: "SA002",
    name: "Addiction Psychiatry",
    category: "addiction",
    description: "Specialized treatment for substance use disorders and behavioral addictions",
    patientCount: 89,
    activeProtocols: 6,
    successRate: 67.3,
    averageSessionLength: 60,
    revenue: 320000,
    protocols: [
      {
        id: "TP003",
        name: "MAT for Opioid Use Disorder",
        description: "Medication-Assisted Treatment protocol for opioid addiction",
        evidenceLevel: "A",
        duration: "12 months",
        sessions: 52,
        successRate: 65,
        cost: 4800,
        insuranceCoverage: ["Medicare", "Medicaid", "Private Insurance"],
        contraindications: ["Severe liver disease", "Active psychosis"],
        sideEffects: ["Nausea", "Constipation", "Drowsiness"]
      }
    ],
    assessments: [
      {
        id: "A003",
        name: "CAGE Questionnaire",
        type: "screening",
        duration: 5,
        reliability: 0.82,
        validity: 0.85,
        cost: 0,
        insuranceCoverage: true,
        digitalVersion: true
      }
    ],
    templates: [
      {
        id: "T002",
        name: "Addiction Assessment",
        type: "assessment",
        description: "Comprehensive addiction assessment and treatment planning",
        fields: [
          { id: "F006", name: "Substance Use History", type: "textarea", required: true },
          { id: "F007", name: "Withdrawal Symptoms", type: "multiselect", required: false, options: ["Nausea", "Tremors", "Anxiety", "Insomnia", "Seizures"] },
          { id: "F008", name: "Previous Treatment", type: "textarea", required: false }
        ],
        usageCount: 156,
        rating: 4.6,
        lastModified: "2024-10-20"
      }
    ],
    lastUpdated: "2024-12-14T09:45:00Z",
    status: "active"
  },
  {
    id: "SA003",
    name: "Geriatric Psychiatry",
    category: "geriatric",
    description: "Mental health care for older adults with age-related psychiatric conditions",
    patientCount: 123,
    activeProtocols: 5,
    successRate: 74.2,
    averageSessionLength: 50,
    revenue: 380000,
    protocols: [
      {
        id: "TP004",
        name: "Depression Treatment in Elderly",
        description: "Specialized depression treatment for geriatric patients",
        evidenceLevel: "A",
        duration: "16 weeks",
        sessions: 20,
        successRate: 72,
        cost: 3000,
        insuranceCoverage: ["Medicare", "Medicaid", "Private Insurance"],
        contraindications: ["Severe dementia", "Active psychosis"],
        sideEffects: ["Dizziness", "Dry mouth", "Constipation"]
      }
    ],
    assessments: [
      {
        id: "A004",
        name: "Geriatric Depression Scale",
        type: "screening",
        duration: 10,
        reliability: 0.88,
        validity: 0.90,
        cost: 15,
        insuranceCoverage: true,
        digitalVersion: true
      }
    ],
    templates: [
      {
        id: "T003",
        name: "Geriatric Assessment",
        type: "intake",
        description: "Comprehensive geriatric psychiatric assessment",
        fields: [
          { id: "F009", name: "Age", type: "number", required: true },
          { id: "F010", name: "Medical History", type: "textarea", required: true },
          { id: "F011", name: "Medications", type: "textarea", required: true },
          { id: "F012", name: "Cognitive Status", type: "select", required: true, options: ["Normal", "Mild Impairment", "Moderate Impairment", "Severe Impairment"] }
        ],
        usageCount: 189,
        rating: 4.7,
        lastModified: "2024-11-10"
      }
    ],
    lastUpdated: "2024-12-14T08:30:00Z",
    status: "active"
  }
];

const mockSpecializedMetrics: SpecializedMetrics = {
  totalAreas: 8,
  activeAreas: 6,
  totalPatients: 368,
  averageSuccessRate: 74.7,
  totalRevenue: 1150000,
  protocolCount: 19,
  assessmentCount: 12,
  templateCount: 15
};

// Utility Functions
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'child_adolescent': return 'bg-blue-500 text-white';
    case 'geriatric': return 'bg-purple-500 text-white';
    case 'addiction': return 'bg-orange-500 text-white';
    case 'forensic': return 'bg-red-500 text-white';
    case 'consultation_liaison': return 'bg-green-500 text-white';
    case 'emergency': return 'bg-yellow-500 text-black';
    case 'community': return 'bg-indigo-500 text-white';
    case 'research': return 'bg-pink-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500 text-white';
    case 'developing': return 'bg-yellow-500 text-black';
    case 'paused': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
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

const getAssessmentTypeColor = (type: string) => {
  switch (type) {
    case 'screening': return 'bg-blue-100 text-blue-800';
    case 'diagnostic': return 'bg-green-100 text-green-800';
    case 'outcome': return 'bg-purple-100 text-purple-800';
    case 'risk': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function SpecializedPracticeAreas() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const filteredAreas = mockSpecializedAreas.filter(area => {
    const matchesCategory = selectedCategory === "all" || area.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || area.status === selectedStatus;
    
    return matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Target className="h-8 w-8 text-indigo-600" />
            Specialized Practice Areas
          </h1>
          <p className="text-gray-600 mt-2">
            Specialized treatment protocols and practice templates for different psychiatric specialties
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            <Target className="h-4 w-4 mr-1" />
            Specialized
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Brain className="h-4 w-4 mr-1" />
            Practice
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Active Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSpecializedMetrics.activeAreas}</div>
            <p className="text-xs opacity-75 mt-1">Of {mockSpecializedMetrics.totalAreas} total</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSpecializedMetrics.totalPatients}</div>
            <p className="text-xs opacity-75 mt-1">Specialized care patients</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSpecializedMetrics.averageSuccessRate}%</div>
            <p className="text-xs opacity-75 mt-1">Average across areas</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(mockSpecializedMetrics.totalRevenue / 1000000).toFixed(1)}M</div>
            <p className="text-xs opacity-75 mt-1">Specialized services</p>
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
          <TabsTrigger value="areas" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Areas
          </TabsTrigger>
          <TabsTrigger value="protocols" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Protocols
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Specialized Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Specialized Performance
                </CardTitle>
                <CardDescription>
                  Performance metrics across specialized practice areas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Areas</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockSpecializedMetrics.activeAreas / mockSpecializedMetrics.totalAreas) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockSpecializedMetrics.activeAreas}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Patients</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockSpecializedMetrics.totalPatients / 500) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockSpecializedMetrics.totalPatients}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Success Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockSpecializedMetrics.averageSuccessRate} className="w-20" />
                      <span className="text-sm font-medium">{mockSpecializedMetrics.averageSuccessRate}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Revenue</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockSpecializedMetrics.totalRevenue / 2000000) * 100} className="w-20" />
                      <span className="text-sm font-medium">${(mockSpecializedMetrics.totalRevenue / 1000000).toFixed(1)}M</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resource Counts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Available Resources
                </CardTitle>
                <CardDescription>
                  Treatment protocols, assessments, and templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Treatment Protocols</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockSpecializedMetrics.protocolCount / 30) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockSpecializedMetrics.protocolCount}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Assessments</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockSpecializedMetrics.assessmentCount / 20) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockSpecializedMetrics.assessmentCount}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Practice Templates</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockSpecializedMetrics.templateCount / 25) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockSpecializedMetrics.templateCount}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Specialized Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recent Specialized Areas
              </CardTitle>
              <CardDescription>
                Latest specialized practice areas and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSpecializedAreas.map((area) => (
                  <div key={area.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Target className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{area.name}</h3>
                      <p className="text-xs text-gray-600">{area.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(area.category)}>
                        {area.category.replace('_', ' ')}
                      </Badge>
                      <Badge className={getStatusColor(area.status)}>
                        {area.status}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">
                        {area.successRate}% success
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Areas Tab */}
        <TabsContent value="areas" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Specialized Practice Management</CardTitle>
              <CardDescription>
                Manage and track specialized practice areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-40 mt-1 p-2 border rounded-md text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="child_adolescent">Child & Adolescent</option>
                    <option value="geriatric">Geriatric</option>
                    <option value="addiction">Addiction</option>
                    <option value="forensic">Forensic</option>
                    <option value="consultation_liaison">Consultation-Liaison</option>
                    <option value="emergency">Emergency</option>
                    <option value="community">Community</option>
                    <option value="research">Research</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select 
                    value={selectedStatus} 
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-40 mt-1 p-2 border rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="developing">Developing</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Areas List */}
          <div className="grid gap-4">
            {filteredAreas.map((area) => (
              <Card key={area.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Target className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{area.name}</h3>
                          <Badge className={getCategoryColor(area.category)}>
                            {area.category.replace('_', ' ')}
                          </Badge>
                          <Badge className={getStatusColor(area.status)}>
                            {area.status}
                          </Badge>
                          <Badge variant="outline">
                            ${(area.revenue / 1000).toFixed(0)}K revenue
                          </Badge>
                        </div>
                        <p className="text-gray-600">{area.description}</p>
                        
                        <div className="mt-3">
                          <span className="font-medium text-sm">Performance:</span>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1 text-sm">
                            <div>
                              <span className="text-gray-600">Patients:</span>
                              <p className="font-medium">{area.patientCount}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Success Rate:</span>
                              <p className="font-medium">{area.successRate}%</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Protocols:</span>
                              <p className="font-medium">{area.activeProtocols}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Session Length:</span>
                              <p className="font-medium">{area.averageSessionLength} min</p>
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
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
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
                <BookOpen className="h-5 w-5" />
                Treatment Protocols
              </CardTitle>
              <CardDescription>
                Evidence-based treatment protocols for specialized practice areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockSpecializedAreas.flatMap(area => 
                  area.protocols.map(protocol => (
                    <div key={protocol.id} className="p-6 border rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                          <div>
                            <h3 className="text-lg font-semibold">{protocol.name}</h3>
                            <p className="text-gray-600">{area.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getEvidenceLevelColor(protocol.evidenceLevel)}>
                            Level {protocol.evidenceLevel}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800">
                            {protocol.successRate}% success
                          </Badge>
                          <Badge variant="outline">
                            ${protocol.cost}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="font-medium">Duration:</span>
                          <p className="text-sm text-gray-600">{protocol.duration}</p>
                        </div>
                        <div>
                          <span className="font-medium">Sessions:</span>
                          <p className="text-sm text-gray-600">{protocol.sessions}</p>
                        </div>
                        <div>
                          <span className="font-medium">Insurance:</span>
                          <p className="text-sm text-gray-600">{protocol.insuranceCoverage.join(', ')}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div>
                          <span className="font-medium">Description:</span>
                          <p className="text-sm text-gray-600 mt-1">{protocol.description}</p>
                        </div>
                        <div>
                          <span className="font-medium">Contraindications:</span>
                          <p className="text-sm text-gray-600 mt-1">{protocol.contraindications.join(', ')}</p>
                        </div>
                        <div>
                          <span className="font-medium">Side Effects:</span>
                          <p className="text-sm text-gray-600 mt-1">{protocol.sideEffects.join(', ')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Protocol
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Practice Templates
              </CardTitle>
              <CardDescription>
                Customizable practice templates for specialized areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockSpecializedAreas.flatMap(area => 
                  area.templates.map(template => (
                    <div key={template.id} className="p-6 border rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-6 w-6 text-green-600" />
                          <div>
                            <h3 className="text-lg font-semibold">{template.name}</h3>
                            <p className="text-gray-600">{area.name} - {template.type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-800">
                            {template.usageCount} uses
                          </Badge>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            {template.rating}/5 rating
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div>
                          <span className="font-medium">Description:</span>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        </div>
                        <div>
                          <span className="font-medium">Fields ({template.fields.length}):</span>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                            {template.fields.map(field => (
                              <div key={field.id} className="text-sm">
                                <span className="font-medium">{field.name}</span>
                                <span className="text-gray-600 ml-1">({field.type})</span>
                                {field.required && <span className="text-red-600 ml-1">*</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview Template
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Customize
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
