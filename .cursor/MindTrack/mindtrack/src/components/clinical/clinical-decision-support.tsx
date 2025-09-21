"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Stethoscope, Pill, AlertTriangle, CheckCircle, XCircle, Info, Search, Filter, Star, Heart, ThumbsUp,
  ThumbsDown, Share, Download, Upload, RefreshCw, Save, Bell, BellOff, Shield, ShieldCheck,
  ShieldAlert, ShieldX, Lock, Unlock, Key, Eye, EyeOff, Database, Server, Activity,
  MapPin, Phone, Mail, MessageSquare, HelpCircle, ExternalLink, Link, LinkBreak, GitBranch, Layers, MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ArrowUp, ArrowDown,
  ArrowLeft, ArrowRight, Home, Menu, MoreVertical, X, Check, Flag, Bookmark, Archive, Folder, File, FilePlus, FileMinus, FileEdit,
  FileSearch, FileDown, FileUp, FileShare, FileLock, FileUnlock, FileHeart, FileStar,
  FileZap, FileTarget, FileShield, FileSettings, FileInfo, FileAlert,
  FileCheckCircle, FileXCircle, FilePlusCircle, FileMinusCircle, FileEditCircle, FileSearchCircle,
  FileDownCircle, FileUpCircle, FileShareCircle, FileLockCircle, FileUnlockCircle, FileHeartCircle,
  FileStarCircle, FileZapCircle, FileTargetCircle, FileShieldCircle,
  FileSettingsCircle, FileInfoCircle, FileAlertCircle, Globe, Cpu, Memory, HardDrive,
  Wifi, Cloud, Table, List, Grid, Columns, Rows, SortAsc, SortDesc, Lightbulb, Settings, Plus, MoreHorizontal as MoreHorizontalIcon,
  TrendingUp, BarChart, PieChart, LineChart, ScatterChart, AreaChart, Target, Zap, Users, Calendar, Clock,
  Book, Library, GraduationCap, Award, Certificate, Diploma, Scroll, Document, Clipboard,
  ClipboardList, ClipboardCheck, ClipboardX, ClipboardCopy, ClipboardPaste, FileText, Tag
} from "lucide-react";

// Interfaces
interface ClinicalDecision {
  id: string;
  patientId: string;
  symptoms: string[];
  diagnosis: string;
  confidence: number;
  differentialDiagnosis: string[];
  treatmentRecommendations: TreatmentRecommendation[];
  drugInteractions: DrugInteraction[];
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  lastUpdated: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
}

interface TreatmentRecommendation {
  id: string;
  treatment: string;
  type: 'medication' | 'therapy' | 'lifestyle' | 'procedure';
  effectiveness: number;
  sideEffects: string[];
  contraindications: string[];
  evidenceSource: string;
  cost: number;
  duration: string;
}

interface DrugInteraction {
  id: string;
  drug1: string;
  drug2: string;
  severity: 'low' | 'moderate' | 'high' | 'severe';
  description: string;
  recommendation: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
}

interface ClinicalGuideline {
  id: string;
  title: string;
  condition: string;
  organization: string;
  year: number;
  recommendations: string[];
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  lastUpdated: string;
}

interface ClinicalMetrics {
  totalDecisions: number;
  acceptedDecisions: number;
  averageConfidence: number;
  evidenceBasedDecisions: number;
  drugInteractionAlerts: number;
  guidelineCompliance: number;
}

// Mock Data
const mockClinicalDecisions: ClinicalDecision[] = [
  {
    id: "CD001",
    patientId: "P12345",
    symptoms: ["depressed mood", "anhedonia", "sleep disturbance", "fatigue", "poor concentration"],
    diagnosis: "Major Depressive Disorder (MDD)",
    confidence: 87.5,
    differentialDiagnosis: ["Dysthymia", "Bipolar Disorder", "Adjustment Disorder", "GAD"],
    treatmentRecommendations: [
      {
        id: "TR001",
        treatment: "Sertraline (Zoloft) 50mg daily",
        type: "medication",
        effectiveness: 85,
        sideEffects: ["nausea", "headache", "insomnia"],
        contraindications: ["MAOI use", "pregnancy"],
        evidenceSource: "APA Guidelines 2023",
        cost: 45,
        duration: "6-12 months"
      },
      {
        id: "TR002",
        treatment: "Cognitive Behavioral Therapy (CBT)",
        type: "therapy",
        effectiveness: 78,
        sideEffects: [],
        contraindications: [],
        evidenceSource: "Cochrane Review 2022",
        cost: 150,
        duration: "12-16 weeks"
      }
    ],
    drugInteractions: [
      {
        id: "DI001",
        drug1: "Sertraline",
        drug2: "Warfarin",
        severity: "moderate",
        description: "Increased bleeding risk",
        recommendation: "Monitor INR closely",
        evidenceLevel: "B"
      }
    ],
    evidenceLevel: "A",
    lastUpdated: "2024-12-14T10:30:00Z",
    status: "accepted"
  },
  {
    id: "CD002",
    patientId: "P12346",
    symptoms: ["excessive worry", "restlessness", "irritability", "muscle tension", "sleep problems"],
    diagnosis: "Generalized Anxiety Disorder (GAD)",
    confidence: 92.3,
    differentialDiagnosis: ["Panic Disorder", "Social Anxiety", "OCD", "MDD"],
    treatmentRecommendations: [
      {
        id: "TR003",
        treatment: "Escitalopram (Lexapro) 10mg daily",
        type: "medication",
        effectiveness: 82,
        sideEffects: ["drowsiness", "nausea", "sexual dysfunction"],
        contraindications: ["MAOI use", "severe liver disease"],
        evidenceSource: "NICE Guidelines 2023",
        cost: 65,
        duration: "6-12 months"
      }
    ],
    drugInteractions: [],
    evidenceLevel: "A",
    lastUpdated: "2024-12-14T09:45:00Z",
    status: "reviewed"
  }
];

const mockClinicalGuidelines: ClinicalGuideline[] = [
  {
    id: "CG001",
    title: "Treatment of Major Depressive Disorder",
    condition: "MDD",
    organization: "American Psychiatric Association",
    year: 2023,
    recommendations: [
      "First-line: SSRIs or SNRIs",
      "Consider psychotherapy for mild to moderate cases",
      "Monitor for suicidal ideation",
      "Assess response at 4-6 weeks"
    ],
    evidenceLevel: "A",
    lastUpdated: "2024-12-01T00:00:00Z"
  },
  {
    id: "CG002",
    title: "Management of Generalized Anxiety Disorder",
    condition: "GAD",
    organization: "NICE",
    year: 2023,
    recommendations: [
      "First-line: SSRIs or SNRIs",
      "Consider CBT as adjunct",
      "Monitor for side effects",
      "Regular follow-up appointments"
    ],
    evidenceLevel: "A",
    lastUpdated: "2024-11-15T00:00:00Z"
  }
];

const mockClinicalMetrics: ClinicalMetrics = {
  totalDecisions: 156,
  acceptedDecisions: 142,
  averageConfidence: 89.2,
  evidenceBasedDecisions: 148,
  drugInteractionAlerts: 23,
  guidelineCompliance: 94.8
};

// Utility Functions
const getEvidenceLevelColor = (level: string) => {
  switch (level) {
    case 'A': return 'bg-green-500 text-white';
    case 'B': return 'bg-blue-500 text-white';
    case 'C': return 'bg-yellow-500 text-black';
    case 'D': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'low': return 'bg-green-100 text-green-800';
    case 'moderate': return 'bg-yellow-100 text-yellow-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'severe': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500 text-black';
    case 'reviewed': return 'bg-blue-500 text-white';
    case 'accepted': return 'bg-green-500 text-white';
    case 'rejected': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getTreatmentTypeColor = (type: string) => {
  switch (type) {
    case 'medication': return 'bg-purple-100 text-purple-800';
    case 'therapy': return 'bg-blue-100 text-blue-800';
    case 'lifestyle': return 'bg-green-100 text-green-800';
    case 'procedure': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function ClinicalDecisionSupport() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedEvidenceLevel, setSelectedEvidenceLevel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const filteredDecisions = mockClinicalDecisions.filter(decision => {
    const matchesEvidence = selectedEvidenceLevel === "all" || decision.evidenceLevel === selectedEvidenceLevel;
    const matchesStatus = selectedStatus === "all" || decision.status === selectedStatus;
    
    return matchesEvidence && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            Clinical Decision Support
          </h1>
          <p className="text-gray-600 mt-2">
            AI-powered clinical decision support for evidence-based psychiatry
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Stethoscope className="h-4 w-4 mr-1" />
            Clinical
          </Badge>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            <Brain className="h-4 w-4 mr-1" />
            AI-Powered
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockClinicalMetrics.totalDecisions}</div>
            <p className="text-xs opacity-75 mt-1">Clinical decisions made</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Accepted Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockClinicalMetrics.acceptedDecisions}</div>
            <p className="text-xs opacity-75 mt-1">{((mockClinicalMetrics.acceptedDecisions / mockClinicalMetrics.totalDecisions) * 100).toFixed(1)}% acceptance rate</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Average Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockClinicalMetrics.averageConfidence}%</div>
            <p className="text-xs opacity-75 mt-1">High confidence decisions</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Guideline Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockClinicalMetrics.guidelineCompliance}%</div>
            <p className="text-xs opacity-75 mt-1">Evidence-based practice</p>
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
          <TabsTrigger value="decisions" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Decisions
          </TabsTrigger>
          <TabsTrigger value="guidelines" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Guidelines
          </TabsTrigger>
          <TabsTrigger value="interactions" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Drug Interactions
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Decision Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Decision Performance
                </CardTitle>
                <CardDescription>
                  Clinical decision support system performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Decisions</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockClinicalMetrics.totalDecisions / 200) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockClinicalMetrics.totalDecisions}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Accepted Decisions</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockClinicalMetrics.acceptedDecisions / mockClinicalMetrics.totalDecisions) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockClinicalMetrics.acceptedDecisions}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Evidence-Based</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockClinicalMetrics.evidenceBasedDecisions / mockClinicalMetrics.totalDecisions) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockClinicalMetrics.evidenceBasedDecisions}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Confidence</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockClinicalMetrics.averageConfidence} className="w-20" />
                      <span className="text-sm font-medium">{mockClinicalMetrics.averageConfidence}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Drug Interaction Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Drug Interaction Alerts
                </CardTitle>
                <CardDescription>
                  Recent drug interaction alerts and warnings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Alerts</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockClinicalMetrics.drugInteractionAlerts / 50) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockClinicalMetrics.drugInteractionAlerts}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Severe Interactions</span>
                    <span className="text-sm font-medium text-red-600">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Moderate Interactions</span>
                    <span className="text-sm font-medium text-yellow-600">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Low Interactions</span>
                    <span className="text-sm font-medium text-green-600">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Decisions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Recent Clinical Decisions
              </CardTitle>
              <CardDescription>
                Latest AI-powered clinical decisions and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockClinicalDecisions.map((decision) => (
                  <div key={decision.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Brain className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{decision.diagnosis}</h3>
                      <p className="text-xs text-gray-600">Patient: {decision.patientId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        {decision.confidence}% confidence
                      </Badge>
                      <Badge className={getEvidenceLevelColor(decision.evidenceLevel)}>
                        Level {decision.evidenceLevel}
                      </Badge>
                      <Badge className={getStatusColor(decision.status)}>
                        {decision.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Decisions Tab */}
        <TabsContent value="decisions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Clinical Decision Management</CardTitle>
              <CardDescription>
                Review and manage AI-powered clinical decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div>
                  <label className="text-sm font-medium">Evidence Level</label>
                  <select 
                    value={selectedEvidenceLevel} 
                    onChange={(e) => setSelectedEvidenceLevel(e.target.value)}
                    className="w-40 mt-1 p-2 border rounded-md text-sm"
                  >
                    <option value="all">All Levels</option>
                    <option value="A">Level A</option>
                    <option value="B">Level B</option>
                    <option value="C">Level C</option>
                    <option value="D">Level D</option>
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
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Decisions List */}
          <div className="grid gap-4">
            {filteredDecisions.map((decision) => (
              <Card key={decision.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Brain className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{decision.diagnosis}</h3>
                          <Badge className={getEvidenceLevelColor(decision.evidenceLevel)}>
                            Level {decision.evidenceLevel}
                          </Badge>
                          <Badge className={getStatusColor(decision.status)}>
                            {decision.status}
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-800">
                            {decision.confidence}% confidence
                          </Badge>
                        </div>
                        <p className="text-gray-600">Patient ID: {decision.patientId}</p>
                        <div className="mt-3">
                          <span className="font-medium text-sm">Symptoms:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {decision.symptoms.map((symptom, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="font-medium text-sm">Differential Diagnosis:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {decision.differentialDiagnosis.map((diagnosis, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {diagnosis}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                      <Button variant="outline" size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Guidelines Tab */}
        <TabsContent value="guidelines" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Clinical Guidelines
              </CardTitle>
              <CardDescription>
                Evidence-based clinical guidelines and treatment protocols
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockClinicalGuidelines.map((guideline) => (
                  <div key={guideline.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Book className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{guideline.title}</h3>
                          <p className="text-gray-600">{guideline.organization} - {guideline.year}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getEvidenceLevelColor(guideline.evidenceLevel)}>
                          Level {guideline.evidenceLevel}
                        </Badge>
                        <Badge variant="outline">
                          {guideline.condition}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <span className="font-medium">Key Recommendations:</span>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {guideline.recommendations.map((recommendation, index) => (
                          <li key={index}>{recommendation}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Full Guideline
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drug Interactions Tab */}
        <TabsContent value="interactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Drug Interaction Database
              </CardTitle>
              <CardDescription>
                Comprehensive drug interaction checking and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockClinicalDecisions.flatMap(decision => 
                  decision.drugInteractions.map(interaction => (
                    <div key={interaction.id} className="p-6 border rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Pill className="h-6 w-6 text-red-600" />
                          <div>
                            <h3 className="text-lg font-semibold">{interaction.drug1} + {interaction.drug2}</h3>
                            <p className="text-gray-600">{interaction.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(interaction.severity)}>
                            {interaction.severity}
                          </Badge>
                          <Badge className={getEvidenceLevelColor(interaction.evidenceLevel)}>
                            Level {interaction.evidenceLevel}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium">Recommendation:</span>
                          <p className="text-sm text-gray-600 mt-1">{interaction.recommendation}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Set Alert
                        </Button>
                        <Button variant="outline" size="sm">
                          <Info className="h-4 w-4 mr-1" />
                          More Info
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







