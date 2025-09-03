"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TestTube, 
  Brain, 
  Microscope, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  User, 
  Users,
  Settings, 
  Plus, 
  Download, 
  Upload, 
  RefreshCw, 
  Save, 
  Bell, 
  BellOff, 
  Shield, 
  ShieldCheck,
  ShieldAlert, 
  ShieldX, 
  Lock, 
  Unlock, 
  Key, 
  Eye, 
  EyeOff, 
  Database, 
  Server, 
  Network,
  Activity, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BookOpen,
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare, 
  Info, 
  HelpCircle, 
  ExternalLink, 
  Link, 
  LinkBreak,
  GitBranch, 
  Layers, 
  Filter, 
  Search, 
  MoreHorizontal, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  Menu, 
  MoreVertical, 
  X, 
  Check, 
  Star, 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  Bookmark, 
  Tag, 
  Archive, 
  Folder, 
  File,
  FilePlus, 
  FileMinus, 
  FileEdit, 
  FileSearch, 
  FileDownload, 
  FileUpload, 
  FileShare, 
  FileLock,
  FileUnlock, 
  FileHeart, 
  FileStar, 
  FileAward, 
  FileCrown, 
  FileZap, 
  FileTarget, 
  FileShield,
  FileSettings, 
  FileInfo, 
  FileAlert, 
  FileCheckCircle, 
  FileXCircle, 
  FilePlusCircle,
  FileMinusCircle, 
  FileEditCircle, 
  FileSearchCircle, 
  FileDownloadCircle, 
  FileUploadCircle,
  FileShareCircle, 
  FileLockCircle, 
  FileUnlockCircle, 
  FileHeartCircle, 
  FileStarCircle, 
  FileAwardCircle, 
  FileCrownCircle, 
  FileZapCircle, 
  FileTargetCircle, 
  FileShieldCircle,
  FileSettingsCircle, 
  FileInfoCircle, 
  FileAlertCircle, 
  Zap, 
  Globe, 
  Cpu, 
  Memory, 
  HardDrive,
  Wifi, 
  Cloud, 
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
  Stethoscope,
  ActivitySquare,
  BrainCircuit,
  Neuron,
  Synapse,
  CircuitBoard,
  BrainActivity,
  BrainWave,
  BrainScan,
  BrainMri,
  BrainCt,
  BrainXray,
  BrainUltrasound,
  BrainEeg,
  BrainEmg,
  BrainEcg,
  BrainEeg2,
  BrainEmg2,
  BrainEcg2,
  BrainEeg3,
  BrainEmg3,
  BrainEcg3,
  BrainEeg4,
  BrainEmg4,
  BrainEcg4,
  BrainEeg5,
  BrainEmg5,
  BrainEcg5,
  AlertCircle,
  ExclamationTriangle,
  Lightbulb,
  GraduationCap,
  Award,
  Trophy,
  Medal,
  Certificate,
  ScrollText,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileJson,
  FileXml,
  FileCsv,
  FilePdf,
  FileWord,
  FileExcel,
  FilePowerpoint,
  FileZip,
  FileRar,
  File7z,
  FileTar,
  FileGz,
  FileBz2,
  FileXz,
  FileLzma,
  FileLz4,
  FileZstd,
  FileBrotli,
  FileLzop,
  FileLzip,
  FileLrzip,
  FileLz,
  FileLha,
  FileLzh,
  FileCab,
  FileMsi,
  FileDmg,
  FileIso,
  FileVhd,
  FileVmdk,
  FileOva,
  FileOvf,
  FileVbox,
  FileVdi,
  FileHdd,
  FileQcow,
  FileQcow2,
  FileVhdx,
  FileVmdx,
  FileVmx,
  FileVmtx,
  FileOvf,
  FileOva,
  FileVbox,
  FileVdi,
  FileHdd,
  FileQcow,
  FileQcow2,
  FileVhdx,
  FileVmdx,
  FileVmx,
  FileVmtx
} from "lucide-react";

// Interfaces for Laboratory Tests & Brain Imaging
interface LaboratoryTest {
  id: string;
  clientId: string;
  clientName: string;
  testName: string;
  testCategory: string;
  testDate: string;
  labName: string;
  orderingProvider: string;
  status: 'ordered' | 'in-progress' | 'completed' | 'cancelled' | 'abnormal';
  results: any;
  referenceRanges: any;
  interpretation: string;
  clinicalSignificance: string;
  followUpRequired: boolean;
  followUpDate?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface PsychiatricLabTest {
  id: string;
  labTestId: string;
  clientId: string;
  testType: 'lithium' | 'depakote' | 'lamictal' | 'metabolic_panel' | 'thyroid' | 'hormone' | 'drug_screen' | 'genetic';
  medicationRelated: boolean;
  medicationName?: string;
  therapeuticRangeMin?: number;
  therapeuticRangeMax?: number;
  toxicRangeMin?: number;
  toxicRangeMax?: number;
  resultValue?: number;
  unit?: string;
  isAbnormal: boolean;
  abnormalityType?: string;
  clinicalAction: string;
  createdAt: string;
}

interface BrainImaging {
  id: string;
  clientId: string;
  clientName: string;
  imagingType: 'mri' | 'ct' | 'pet' | 'spect' | 'eeg' | 'fmri' | 'dti';
  studyDate: string;
  facilityName: string;
  radiologist: string;
  orderingProvider: string;
  clinicalIndication: string;
  technique: string;
  findings: string;
  impression: string;
  recommendations: string;
  status: 'ordered' | 'in-progress' | 'completed' | 'cancelled';
  reportUrl?: string;
  imagesUrl?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface NeuropsychologicalAssessment {
  id: string;
  clientId: string;
  clientName: string;
  assessmentDate: string;
  assessor: string;
  referralReason: string;
  clinicalHistory: string;
  testBattery: any;
  results: any;
  interpretation: string;
  recommendations: string;
  followUpDate?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface CognitiveDomain {
  id: string;
  neuropsychAssessmentId: string;
  clientId: string;
  domainName: 'memory' | 'attention' | 'executive_function' | 'language' | 'visuospatial' | 'processing_speed';
  testName: string;
  rawScore?: number;
  scaledScore?: number;
  percentile?: number;
  tScore?: number;
  interpretation: string;
  clinicalSignificance: string;
  createdAt: string;
}

interface CrisisIntervention {
  id: string;
  clientId: string;
  clientName: string;
  crisisDate: string;
  crisisType: 'suicide_risk' | 'violence_risk' | 'psychosis' | 'mania' | 'severe_depression' | 'substance_abuse' | 'other';
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  presentingProblem: string;
  riskFactors: any;
  protectiveFactors: any;
  interventionProvided: string;
  safetyPlan: string;
  disposition: string;
  followUpRequired: boolean;
  followUpDate?: string;
  emergencyContactNotified: boolean;
  policeInvolved: boolean;
  hospitalizationRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SafetyPlan {
  id: string;
  clientId: string;
  crisisInterventionId?: string;
  planDate: string;
  triggers: any;
  warningSigns: any;
  copingStrategies: any;
  emergencyContacts: any;
  professionalContacts: any;
  crisisResources: any;
  safetyMeasures: string;
  reviewDate?: string;
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
  updatedAt: string;
}

interface LabImagingMetrics {
  totalLabTests: number;
  abnormalResults: number;
  pendingResults: number;
  brainImagingStudies: number;
  neuropsychologicalAssessments: number;
  crisisInterventions: number;
  activeSafetyPlans: number;
  followUpRequired: number;
}

// Mock Data
const mockLaboratoryTests: LaboratoryTest[] = [
  {
    id: "LAB001",
    clientId: "CLIENT001",
    clientName: "Sarah Johnson",
    testName: "Comprehensive Metabolic Panel",
    testCategory: "Metabolic",
    testDate: "2024-12-10",
    labName: "LabCorp",
    orderingProvider: "Dr. Smith",
    status: "completed",
    results: {
      glucose: 95,
      bun: 15,
      creatinine: 0.9,
      sodium: 140,
      potassium: 4.0,
      chloride: 102,
      co2: 24,
      calcium: 9.5
    },
    referenceRanges: {
      glucose: { min: 70, max: 100 },
      bun: { min: 7, max: 20 },
      creatinine: { min: 0.6, max: 1.2 },
      sodium: { min: 135, max: 145 },
      potassium: { min: 3.5, max: 5.0 },
      chloride: { min: 96, max: 106 },
      co2: { min: 22, max: 28 },
      calcium: { min: 8.5, max: 10.5 }
    },
    interpretation: "All values within normal limits",
    clinicalSignificance: "Normal metabolic function",
    followUpRequired: false,
    notes: "Baseline metabolic panel for medication monitoring",
    createdAt: "2024-12-10T08:00:00Z",
    updatedAt: "2024-12-10T14:30:00Z"
  },
  {
    id: "LAB002",
    clientId: "CLIENT002",
    clientName: "Michael Chen",
    testName: "Lithium Level",
    testCategory: "Therapeutic Drug Monitoring",
    testDate: "2024-12-08",
    labName: "Quest Diagnostics",
    orderingProvider: "Dr. Johnson",
    status: "completed",
    results: {
      lithium: 0.8
    },
    referenceRanges: {
      lithium: { min: 0.6, max: 1.2 }
    },
    interpretation: "Therapeutic level",
    clinicalSignificance: "Lithium level within therapeutic range",
    followUpRequired: true,
    followUpDate: "2024-12-22",
    notes: "Monthly lithium monitoring",
    createdAt: "2024-12-08T09:00:00Z",
    updatedAt: "2024-12-08T16:45:00Z"
  }
];

const mockPsychiatricLabTests: PsychiatricLabTest[] = [
  {
    id: "PLT001",
    labTestId: "LAB002",
    clientId: "CLIENT002",
    testType: "lithium",
    medicationRelated: true,
    medicationName: "Lithium Carbonate",
    therapeuticRangeMin: 0.6,
    therapeuticRangeMax: 1.2,
    toxicRangeMin: 1.5,
    toxicRangeMax: 2.0,
    resultValue: 0.8,
    unit: "mEq/L",
    isAbnormal: false,
    clinicalAction: "Continue current dose, monitor monthly",
    createdAt: "2024-12-08T16:45:00Z"
  }
];

const mockBrainImaging: BrainImaging[] = [
  {
    id: "IMG001",
    clientId: "CLIENT003",
    clientName: "Emily Rodriguez",
    imagingType: "mri",
    studyDate: "2024-11-20",
    facilityName: "Memorial Hospital",
    radiologist: "Dr. Williams",
    orderingProvider: "Dr. Brown",
    clinicalIndication: "Rule out organic causes of cognitive decline",
    technique: "3T MRI with contrast",
    findings: "Normal brain parenchyma. No mass lesions or significant atrophy.",
    impression: "Normal brain MRI",
    recommendations: "No follow-up imaging required",
    status: "completed",
    reportUrl: "https://example.com/report1.pdf",
    imagesUrl: "https://example.com/images1",
    followUpRequired: false,
    createdAt: "2024-11-20T10:00:00Z",
    updatedAt: "2024-11-20T15:30:00Z"
  }
];

const mockNeuropsychologicalAssessments: NeuropsychologicalAssessment[] = [
  {
    id: "NP001",
    clientId: "CLIENT001",
    clientName: "Sarah Johnson",
    assessmentDate: "2024-12-05",
    assessor: "Dr. Davis",
    referralReason: "Memory complaints and attention difficulties",
    clinicalHistory: "Patient reports forgetfulness and difficulty concentrating",
    testBattery: {
      memory: ["WMS-IV", "CVLT-II"],
      attention: ["CPT-3", "TMT"],
      executive: ["WCST", "Stroop"],
      language: ["BNT", "COWAT"],
      visuospatial: ["RCFT", "JLO"],
      processing: ["SDMT", "PASAT"]
    },
    results: {
      memory: { scaled_score: 85, percentile: 16 },
      attention: { scaled_score: 78, percentile: 7 },
      executive: { scaled_score: 82, percentile: 12 },
      language: { scaled_score: 95, percentile: 37 },
      visuospatial: { scaled_score: 88, percentile: 21 },
      processing: { scaled_score: 75, percentile: 5 }
    },
    interpretation: "Mild cognitive impairment with attention and processing speed deficits",
    recommendations: "Cognitive rehabilitation and regular monitoring",
    followUpDate: "2024-06-05",
    status: "completed",
    createdAt: "2024-12-05T09:00:00Z",
    updatedAt: "2024-12-05T16:00:00Z"
  }
];

const mockCrisisInterventions: CrisisIntervention[] = [
  {
    id: "CRISIS001",
    clientId: "CLIENT004",
    clientName: "David Wilson",
    crisisDate: "2024-12-12T14:30:00Z",
    crisisType: "suicide_risk",
    riskLevel: "high",
    presentingProblem: "Patient expressed suicidal ideation with plan",
    riskFactors: ["Recent job loss", "Depression", "Substance use"],
    protectiveFactors: ["Family support", "Previous treatment success"],
    interventionProvided: "Safety assessment, crisis intervention, safety planning",
    safetyPlan: "Removed access to firearms, increased family monitoring",
    disposition: "Outpatient with daily check-ins",
    followUpRequired: true,
    followUpDate: "2024-12-13",
    emergencyContactNotified: true,
    policeInvolved: false,
    hospitalizationRequired: false,
    createdAt: "2024-12-12T14:30:00Z",
    updatedAt: "2024-12-12T16:00:00Z"
  }
];

const mockSafetyPlans: SafetyPlan[] = [
  {
    id: "SP001",
    clientId: "CLIENT004",
    crisisInterventionId: "CRISIS001",
    planDate: "2024-12-12",
    triggers: ["Job stress", "Financial problems", "Relationship conflicts"],
    warningSigns: ["Increased isolation", "Sleep changes", "Hopelessness"],
    copingStrategies: ["Call crisis hotline", "Contact therapist", "Exercise"],
    emergencyContacts: [
      { name: "Crisis Hotline", phone: "988" },
      { name: "Dr. Smith", phone: "555-0123" }
    ],
    professionalContacts: [
      { name: "Dr. Johnson", phone: "555-0456" },
      { name: "Case Manager", phone: "555-0789" }
    ],
    crisisResources: [
      "National Suicide Prevention Lifeline: 988",
      "Crisis Text Line: Text HOME to 741741"
    ],
    safetyMeasures: "Remove access to firearms, increase family monitoring",
    reviewDate: "2024-12-26",
    status: "active",
    createdAt: "2024-12-12T16:00:00Z",
    updatedAt: "2024-12-12T16:00:00Z"
  }
];

const mockLabImagingMetrics: LabImagingMetrics = {
  totalLabTests: 25,
  abnormalResults: 3,
  pendingResults: 2,
  brainImagingStudies: 8,
  neuropsychologicalAssessments: 12,
  crisisInterventions: 5,
  activeSafetyPlans: 3,
  followUpRequired: 7
};

// Utility Functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 border-green-200';
    case 'abnormal': return 'bg-red-100 text-red-800 border-red-200';
    case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'ordered': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getRiskLevelColor = (riskLevel: string) => {
  switch (riskLevel) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getImagingTypeIcon = (imagingType: string) => {
  switch (imagingType) {
    case 'mri': return BrainMri;
    case 'ct': return BrainCt;
    case 'pet': return BrainScan;
    case 'eeg': return BrainEeg;
    case 'fmri': return BrainActivity;
    default: return Brain;
  }
};

export default function LaboratoryImagingManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const filteredLabTests = mockLaboratoryTests.filter(test => {
    const matchesSearch = test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || test.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-green-50 via-white to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TestTube className="h-8 w-8 text-green-600" />
            Laboratory & Imaging Management
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive laboratory testing and brain imaging for psychiatric care
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Microscope className="h-4 w-4 mr-1" />
            Lab Tests
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Brain className="h-4 w-4 mr-1" />
            Imaging
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lab Tests</CardTitle>
            <TestTube className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLabImagingMetrics.totalLabTests}</div>
            <p className="text-xs text-muted-foreground">
              {mockLabImagingMetrics.pendingResults} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abnormal Results</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLabImagingMetrics.abnormalResults}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brain Imaging</CardTitle>
            <Brain className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLabImagingMetrics.brainImagingStudies}</div>
            <p className="text-xs text-muted-foreground">
              Studies completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crisis Interventions</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLabImagingMetrics.crisisInterventions}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lab-tests">Lab Tests</TabsTrigger>
          <TabsTrigger value="brain-imaging">Brain Imaging</TabsTrigger>
          <TabsTrigger value="neuropsych">Neuropsych</TabsTrigger>
          <TabsTrigger value="crisis">Crisis</TabsTrigger>
          <TabsTrigger value="safety-plans">Safety Plans</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Lab Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Recent Lab Results
                </CardTitle>
                <CardDescription>
                  Latest laboratory test results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLaboratoryTests.slice(0, 3).map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{test.testName}</p>
                        <p className="text-xs text-gray-600">{test.clientName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">
                          {new Date(test.testDate).toLocaleDateString()}
                        </p>
                        <Badge className={getStatusColor(test.status)}>
                          {test.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Critical Alerts
                </CardTitle>
                <CardDescription>
                  Issues requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-sm text-red-800">Abnormal Lab Result</span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      Elevated liver enzymes in patient on Depakote
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-sm text-yellow-800">Follow-up Due</span>
                    </div>
                    <p className="text-xs text-yellow-600 mt-1">
                      Lithium level monitoring due in 2 days
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm text-blue-800">Imaging Result</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      MRI report available for review
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lab Tests Tab */}
        <TabsContent value="lab-tests" className="space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search lab tests or patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="ordered">Ordered</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="abnormal">Abnormal</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Order Test
              </Button>
            </div>
          </div>

          {/* Lab Tests List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredLabTests.map((test) => (
              <Card key={test.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{test.testName}</CardTitle>
                      <CardDescription>{test.clientName}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(test.status)}>
                      {test.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Date:</span>
                        <p className="text-gray-600">{new Date(test.testDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Lab:</span>
                        <p className="text-gray-600">{test.labName}</p>
                      </div>
                      <div>
                        <span className="font-medium">Category:</span>
                        <p className="text-gray-600">{test.testCategory}</p>
                      </div>
                      <div>
                        <span className="font-medium">Provider:</span>
                        <p className="text-gray-600">{test.orderingProvider}</p>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-sm">Interpretation:</span>
                      <p className="text-sm text-gray-600 mt-1">{test.interpretation}</p>
                    </div>

                    {test.followUpRequired && (
                      <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">
                          Follow-up required: {test.followUpDate}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        <FileDownload className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Brain Imaging Tab */}
        <TabsContent value="brain-imaging" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Brain Imaging Studies
              </CardTitle>
              <CardDescription>
                MRI, CT, PET, and other brain imaging studies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockBrainImaging.map((imaging) => {
                  const ImagingIcon = getImagingTypeIcon(imaging.imagingType);
                  return (
                    <div key={imaging.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <ImagingIcon className="h-6 w-6 text-blue-600" />
                          <div>
                            <h4 className="font-medium">{imaging.imagingType.toUpperCase()}</h4>
                            <p className="text-sm text-gray-600">{imaging.clientName}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(imaging.status)}>
                          {imaging.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Date:</span>
                          <p className="text-gray-600">{new Date(imaging.studyDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="font-medium">Facility:</span>
                          <p className="text-gray-600">{imaging.facilityName}</p>
                        </div>
                        <div>
                          <span className="font-medium">Radiologist:</span>
                          <p className="text-gray-600">{imaging.radiologist}</p>
                        </div>
                        <div>
                          <span className="font-medium">Indication:</span>
                          <p className="text-gray-600">{imaging.clinicalIndication}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <span className="font-medium text-sm">Impression:</span>
                        <p className="text-sm text-gray-600 mt-1">{imaging.impression}</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm">
                          <FileDownload className="h-4 w-4 mr-1" />
                          Report
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileImage className="h-4 w-4 mr-1" />
                          Images
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Neuropsych Tab */}
        <TabsContent value="neuropsych" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainActivity className="h-5 w-5" />
                Neuropsychological Assessments
              </CardTitle>
              <CardDescription>
                Cognitive assessments and domain-specific testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockNeuropsychologicalAssessments.map((assessment) => (
                  <div key={assessment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">Neuropsychological Assessment</h4>
                        <p className="text-sm text-gray-600">{assessment.clientName}</p>
                      </div>
                      <Badge className={getStatusColor(assessment.status)}>
                        {assessment.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Date:</span>
                        <p className="text-gray-600">{new Date(assessment.assessmentDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Assessor:</span>
                        <p className="text-gray-600">{assessment.assessor}</p>
                      </div>
                      <div>
                        <span className="font-medium">Reason:</span>
                        <p className="text-gray-600">{assessment.referralReason}</p>
                      </div>
                      <div>
                        <span className="font-medium">Follow-up:</span>
                        <p className="text-gray-600">{assessment.followUpDate}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <span className="font-medium text-sm">Interpretation:</span>
                      <p className="text-sm text-gray-600 mt-1">{assessment.interpretation}</p>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <span className="font-medium text-sm">Recommendations:</span>
                      <p className="text-sm text-gray-600 mt-1">{assessment.recommendations}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Crisis Tab */}
        <TabsContent value="crisis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Crisis Interventions
              </CardTitle>
              <CardDescription>
                Emergency psychiatric interventions and risk assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCrisisInterventions.map((crisis) => (
                  <div key={crisis.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{crisis.crisisType.replace('_', ' ').toUpperCase()}</h4>
                        <p className="text-sm text-gray-600">{crisis.clientName}</p>
                      </div>
                      <Badge className={getRiskLevelColor(crisis.riskLevel)}>
                        {crisis.riskLevel}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Date:</span>
                        <p className="text-gray-600">{new Date(crisis.crisisDate).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Disposition:</span>
                        <p className="text-gray-600">{crisis.disposition}</p>
                      </div>
                      <div>
                        <span className="font-medium">Hospitalization:</span>
                        <p className="text-gray-600">{crisis.hospitalizationRequired ? 'Required' : 'Not Required'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Police Involved:</span>
                        <p className="text-gray-600">{crisis.policeInvolved ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <span className="font-medium text-sm">Presenting Problem:</span>
                      <p className="text-sm text-gray-600 mt-1">{crisis.presentingProblem}</p>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <span className="font-medium text-sm">Intervention:</span>
                      <p className="text-sm text-gray-600 mt-1">{crisis.interventionProvided}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Safety Plans Tab */}
        <TabsContent value="safety-plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Safety Plans
              </CardTitle>
              <CardDescription>
                Patient safety plans and crisis prevention strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSafetyPlans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">Safety Plan</h4>
                        <p className="text-sm text-gray-600">Created: {new Date(plan.planDate).toLocaleDateString()}</p>
                      </div>
                      <Badge className={getStatusColor(plan.status)}>
                        {plan.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Review Date:</span>
                        <p className="text-gray-600">{plan.reviewDate}</p>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <p className="text-gray-600">{plan.status}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <span className="font-medium text-sm">Safety Measures:</span>
                      <p className="text-sm text-gray-600 mt-1">{plan.safetyMeasures}</p>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <span className="font-medium text-sm">Emergency Contacts:</span>
                      <div className="text-sm text-gray-600 mt-1">
                        {plan.emergencyContacts.map((contact: any, index: number) => (
                          <div key={index} className="flex justify-between">
                            <span>{contact.name}:</span>
                            <span>{contact.phone}</span>
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
      </Tabs>
    </div>
  );
}
