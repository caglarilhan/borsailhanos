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
  Pill, 
  TrendingUp, 
  TrendingDown, 
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
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon, 
  Target, 
  Brain, 
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
  Dna,
  Microscope,
  TestTube,
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
  BrainEcg5
} from "lucide-react";

// Interfaces for Advanced Medication Management
interface Medication {
  id: string;
  clientId: string;
  clientName: string;
  medicationName: string;
  genericName: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'discontinued' | 'completed' | 'on-hold';
  deaNumber: string;
  refillsRemaining: number;
  instructions: string;
  sideEffects: string[];
  drugInteractions: string[];
  allergies: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  effectivenessRating?: number;
  sideEffectsRating?: number;
  adherenceRate: number;
  lastTitration?: string;
  nextFollowUp?: string;
  createdAt: string;
  updatedAt: string;
}

interface MedicationTitration {
  id: string;
  medicationId: string;
  clientId: string;
  titrationDate: string;
  oldDosage?: string;
  newDosage: string;
  reason: string;
  effectivenessRating?: number;
  sideEffectsRating?: number;
  notes: string;
  createdAt: string;
}

interface SideEffect {
  id: string;
  medicationId: string;
  clientId: string;
  sideEffectName: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  onsetDate: string;
  resolutionDate?: string;
  status: 'active' | 'resolved' | 'improving';
  actionTaken: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface PharmacogenomicTest {
  id: string;
  clientId: string;
  testName: string;
  testDate: string;
  labName: string;
  testResults: any;
  interpretation: string;
  recommendations: any[];
  status: 'ordered' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
}

interface DrugLevel {
  id: string;
  medicationId: string;
  clientId: string;
  testDate: string;
  drugLevel: number;
  unit: string;
  therapeuticRangeMin: number;
  therapeuticRangeMax: number;
  toxicRangeMin: number;
  toxicRangeMax: number;
  interpretation: string;
  recommendations: string;
  labName: string;
  createdAt: string;
}

interface MedicationMetrics {
  totalMedications: number;
  activeMedications: number;
  criticalMedications: number;
  averageAdherenceRate: number;
  medicationsNeedingTitration: number;
  abnormalDrugLevels: number;
  sideEffectsReported: number;
  pharmacogenomicTestsCompleted: number;
}

// Mock Data
const mockMedications: Medication[] = [
  {
    id: "MED001",
    clientId: "CLIENT001",
    clientName: "Sarah Johnson",
    medicationName: "Sertraline (Zoloft)",
    genericName: "Sertraline",
    dosage: "50mg",
    frequency: "Once daily",
    route: "oral",
    startDate: "2024-11-15",
    status: "active",
    deaNumber: "DEA1234567",
    refillsRemaining: 2,
    instructions: "Take with food in the morning",
    sideEffects: ["Nausea", "Insomnia", "Dry mouth"],
    drugInteractions: ["MAO inhibitors", "NSAIDs"],
    allergies: ["Penicillin"],
    priority: "medium",
    effectivenessRating: 8,
    sideEffectsRating: 3,
    adherenceRate: 95,
    lastTitration: "2024-12-01",
    nextFollowUp: "2024-12-15",
    createdAt: "2024-11-15T10:00:00Z",
    updatedAt: "2024-12-01T14:30:00Z"
  },
  {
    id: "MED002",
    clientId: "CLIENT002",
    clientName: "Michael Chen",
    medicationName: "Lithium Carbonate",
    genericName: "Lithium",
    dosage: "900mg",
    frequency: "Twice daily",
    route: "oral",
    startDate: "2024-10-20",
    status: "active",
    deaNumber: "DEA1234567",
    refillsRemaining: 1,
    instructions: "Take with meals, monitor blood levels",
    sideEffects: ["Tremor", "Polyuria", "Weight gain"],
    drugInteractions: ["Diuretics", "NSAIDs"],
    allergies: ["None known"],
    priority: "high",
    effectivenessRating: 9,
    sideEffectsRating: 5,
    adherenceRate: 88,
    lastTitration: "2024-11-25",
    nextFollowUp: "2024-12-20",
    createdAt: "2024-10-20T09:00:00Z",
    updatedAt: "2024-11-25T16:45:00Z"
  },
  {
    id: "MED003",
    clientId: "CLIENT003",
    clientName: "Emily Rodriguez",
    medicationName: "Alprazolam (Xanax)",
    genericName: "Alprazolam",
    dosage: "0.5mg",
    frequency: "As needed",
    route: "oral",
    startDate: "2024-12-05",
    status: "active",
    deaNumber: "DEA1234567",
    refillsRemaining: 0,
    instructions: "Take only when experiencing severe anxiety",
    sideEffects: ["Drowsiness", "Dependency risk", "Memory issues"],
    drugInteractions: ["Opioids", "Alcohol", "Other sedatives"],
    allergies: ["None known"],
    priority: "critical",
    effectivenessRating: 7,
    sideEffectsRating: 6,
    adherenceRate: 92,
    lastTitration: "2024-12-10",
    nextFollowUp: "2024-12-25",
    createdAt: "2024-12-05T11:00:00Z",
    updatedAt: "2024-12-10T13:20:00Z"
  }
];

const mockTitrations: MedicationTitration[] = [
  {
    id: "TIT001",
    medicationId: "MED001",
    clientId: "CLIENT001",
    titrationDate: "2024-12-01",
    oldDosage: "25mg",
    newDosage: "50mg",
    reason: "Inadequate response to lower dose",
    effectivenessRating: 8,
    sideEffectsRating: 3,
    notes: "Patient tolerating well, mood improvement noted",
    createdAt: "2024-12-01T14:30:00Z"
  },
  {
    id: "TIT002",
    medicationId: "MED002",
    clientId: "CLIENT002",
    titrationDate: "2024-11-25",
    oldDosage: "600mg",
    newDosage: "900mg",
    reason: "Lithium level below therapeutic range",
    effectivenessRating: 9,
    sideEffectsRating: 5,
    notes: "Lithium level now 0.8 mEq/L, within therapeutic range",
    createdAt: "2024-11-25T16:45:00Z"
  }
];

const mockSideEffects: SideEffect[] = [
  {
    id: "SE001",
    medicationId: "MED001",
    clientId: "CLIENT001",
    sideEffectName: "Nausea",
    severity: "mild",
    onsetDate: "2024-11-20",
    status: "improving",
    actionTaken: "Take with food",
    notes: "Improving with food intake",
    createdAt: "2024-11-20T08:00:00Z",
    updatedAt: "2024-12-01T10:00:00Z"
  },
  {
    id: "SE002",
    medicationId: "MED002",
    clientId: "CLIENT002",
    sideEffectName: "Tremor",
    severity: "moderate",
    onsetDate: "2024-11-30",
    status: "active",
    actionTaken: "Monitor closely",
    notes: "Fine tremor in hands, may need dose adjustment",
    createdAt: "2024-11-30T14:00:00Z",
    updatedAt: "2024-12-01T09:00:00Z"
  }
];

const mockPharmacogenomicTests: PharmacogenomicTest[] = [
  {
    id: "PGT001",
    clientId: "CLIENT001",
    testName: "CYP2D6 Genotyping",
    testDate: "2024-11-10",
    labName: "Genomics Lab",
    testResults: {
      cyp2d6_status: "intermediate_metabolizer",
      alleles: ["*1", "*4"],
      activity_score: 1.0
    },
    interpretation: "Intermediate metabolizer of CYP2D6 substrates",
    recommendations: [
      "Consider lower starting dose for CYP2D6 substrates",
      "Monitor for side effects",
      "May need dose adjustment for certain antidepressants"
    ],
    status: "completed",
    createdAt: "2024-11-10T10:00:00Z"
  }
];

const mockDrugLevels: DrugLevel[] = [
  {
    id: "DL001",
    medicationId: "MED002",
    clientId: "CLIENT002",
    testDate: "2024-11-25",
    drugLevel: 0.8,
    unit: "mEq/L",
    therapeuticRangeMin: 0.6,
    therapeuticRangeMax: 1.2,
    toxicRangeMin: 1.5,
    toxicRangeMax: 2.0,
    interpretation: "Therapeutic",
    recommendations: "Continue current dose, monitor monthly",
    labName: "LabCorp",
    createdAt: "2024-11-25T16:45:00Z"
  }
];

const mockMedicationMetrics: MedicationMetrics = {
  totalMedications: 15,
  activeMedications: 12,
  criticalMedications: 3,
  averageAdherenceRate: 91.5,
  medicationsNeedingTitration: 2,
  abnormalDrugLevels: 1,
  sideEffectsReported: 8,
  pharmacogenomicTestsCompleted: 5
};

// Utility Functions
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200';
    case 'discontinued': return 'bg-red-100 text-red-800 border-red-200';
    case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'on-hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'life-threatening': return 'bg-red-100 text-red-800 border-red-200';
    case 'severe': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'mild': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function AdvancedMedicationManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showTitrationModal, setShowTitrationModal] = useState(false);
  const [showSideEffectModal, setShowSideEffectModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const filteredMedications = mockMedications.filter(medication => {
    const matchesSearch = medication.medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medication.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || medication.status === filterStatus;
    const matchesPriority = filterPriority === "all" || medication.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Pill className="h-8 w-8 text-blue-600" />
            Advanced Medication Management
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive medication management with pharmacogenomics and therapeutic drug monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Dna className="h-4 w-4 mr-1" />
            Pharmacogenomics
          </Badge>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            <TestTube className="h-4 w-4 mr-1" />
            TDM
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Medications</CardTitle>
            <Pill className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMedicationMetrics.totalMedications}</div>
            <p className="text-xs text-muted-foreground">
              {mockMedicationMetrics.activeMedications} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adherence Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMedicationMetrics.averageAdherenceRate}%</div>
            <Progress value={mockMedicationMetrics.averageAdherenceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Medications</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMedicationMetrics.criticalMedications}</div>
            <p className="text-xs text-muted-foreground">
              Require close monitoring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PGx Tests</CardTitle>
            <Dna className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMedicationMetrics.pharmacogenomicTestsCompleted}</div>
            <p className="text-xs text-muted-foreground">
              Genetic tests completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="titrations">Titrations</TabsTrigger>
          <TabsTrigger value="side-effects">Side Effects</TabsTrigger>
          <TabsTrigger value="pharmacogenomics">Pharmacogenomics</TabsTrigger>
          <TabsTrigger value="drug-levels">Drug Levels</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Medication Activity
                </CardTitle>
                <CardDescription>
                  Latest medication changes and titrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTitrations.slice(0, 3).map((titration) => (
                    <div key={titration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Dosage Change</p>
                        <p className="text-xs text-gray-600">
                          {titration.oldDosage} → {titration.newDosage}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">
                          {new Date(titration.titrationDate).toLocaleDateString()}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          Titration
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
                  Medication Alerts
                </CardTitle>
                <CardDescription>
                  Critical issues requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-sm text-red-800">Critical Medication</span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      Alprazolam requires close monitoring - dependency risk
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-sm text-yellow-800">Follow-up Due</span>
                    </div>
                    <p className="text-xs text-yellow-600 mt-1">
                      Lithium level monitoring due in 3 days
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Dna className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm text-blue-800">PGx Result Available</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      CYP2D6 test results ready for review
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search medications or patients..."
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
                <option value="active">Active</option>
                <option value="discontinued">Discontinued</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <Button onClick={() => setShowAddMedication(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </div>
          </div>

          {/* Medications List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMedications.map((medication) => (
              <Card key={medication.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{medication.medicationName}</CardTitle>
                      <CardDescription>{medication.clientName}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(medication.priority)}>
                        {medication.priority}
                      </Badge>
                      <Badge className={getStatusColor(medication.status)}>
                        {medication.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Dosage:</span>
                        <p className="text-gray-600">{medication.dosage} {medication.frequency}</p>
                      </div>
                      <div>
                        <span className="font-medium">Adherence:</span>
                        <p className="text-gray-600">{medication.adherenceRate}%</p>
                      </div>
                      <div>
                        <span className="font-medium">Refills:</span>
                        <p className="text-gray-600">{medication.refillsRemaining} remaining</p>
                      </div>
                      <div>
                        <span className="font-medium">Effectiveness:</span>
                        <p className="text-gray-600">{medication.effectivenessRating}/10</p>
                      </div>
                    </div>
                    
                    {medication.sideEffects.length > 0 && (
                      <div>
                        <span className="font-medium text-sm">Side Effects:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {medication.sideEffects.slice(0, 3).map((effect, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {effect}
                            </Badge>
                          ))}
                          {medication.sideEffects.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{medication.sideEffects.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMedication(medication)}
                      >
                        <FileEdit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTitrationModal(true)}
                      >
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Titrate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSideEffectModal(true)}
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Side Effect
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Titrations Tab */}
        <TabsContent value="titrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Medication Titrations
              </CardTitle>
              <CardDescription>
                Dosage adjustments and effectiveness tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTitrations.map((titration) => (
                  <div key={titration.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">Dosage Change</h4>
                        <p className="text-sm text-gray-600">
                          {titration.oldDosage} → {titration.newDosage}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {new Date(titration.titrationDate).toLocaleDateString()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Reason:</span>
                        <p className="text-gray-600">{titration.reason}</p>
                      </div>
                      <div>
                        <span className="font-medium">Effectiveness:</span>
                        <p className="text-gray-600">{titration.effectivenessRating}/10</p>
                      </div>
                      <div>
                        <span className="font-medium">Side Effects:</span>
                        <p className="text-gray-600">{titration.sideEffectsRating}/10</p>
                      </div>
                    </div>
                    {titration.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="font-medium text-sm">Notes:</span>
                        <p className="text-sm text-gray-600 mt-1">{titration.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Side Effects Tab */}
        <TabsContent value="side-effects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Side Effects Monitoring
              </CardTitle>
              <CardDescription>
                Track and manage medication side effects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSideEffects.map((sideEffect) => (
                  <div key={sideEffect.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{sideEffect.sideEffectName}</h4>
                        <p className="text-sm text-gray-600">
                          Onset: {new Date(sideEffect.onsetDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getSeverityColor(sideEffect.severity)}>
                        {sideEffect.severity}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Status:</span>
                        <Badge variant="outline" className="ml-2">
                          {sideEffect.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Action Taken:</span>
                        <p className="text-gray-600">{sideEffect.actionTaken}</p>
                      </div>
                    </div>
                    {sideEffect.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="font-medium text-sm">Notes:</span>
                        <p className="text-sm text-gray-600 mt-1">{sideEffect.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pharmacogenomics Tab */}
        <TabsContent value="pharmacogenomics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dna className="h-5 w-5" />
                Pharmacogenomic Testing
              </CardTitle>
              <CardDescription>
                Genetic testing for personalized medication selection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPharmacogenomicTests.map((test) => (
                  <div key={test.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{test.testName}</h4>
                        <p className="text-sm text-gray-600">
                          {test.labName} • {new Date(test.testDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {test.status}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-sm">Interpretation:</span>
                        <p className="text-sm text-gray-600 mt-1">{test.interpretation}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm">Recommendations:</span>
                        <ul className="text-sm text-gray-600 mt-1 space-y-1">
                          {test.recommendations.map((rec, index) => (
                            <li key={index}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drug Levels Tab */}
        <TabsContent value="drug-levels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Therapeutic Drug Monitoring
              </CardTitle>
              <CardDescription>
                Monitor drug levels for optimal therapeutic effect
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDrugLevels.map((drugLevel) => (
                  <div key={drugLevel.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">Drug Level Test</h4>
                        <p className="text-sm text-gray-600">
                          {drugLevel.labName} • {new Date(drugLevel.testDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {drugLevel.interpretation}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Level:</span>
                        <p className="text-gray-600">{drugLevel.drugLevel} {drugLevel.unit}</p>
                      </div>
                      <div>
                        <span className="font-medium">Therapeutic Range:</span>
                        <p className="text-gray-600">
                          {drugLevel.therapeuticRangeMin} - {drugLevel.therapeuticRangeMax} {drugLevel.unit}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Toxic Range:</span>
                        <p className="text-gray-600">
                          {drugLevel.toxicRangeMin} - {drugLevel.toxicRangeMax} {drugLevel.unit}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Recommendations:</span>
                        <p className="text-gray-600">{drugLevel.recommendations}</p>
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
