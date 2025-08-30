"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Pill, FileText, AlertTriangle, CheckCircle, XCircle, Clock, Calendar, User, Users,
  Settings, Plus, Download, Upload, RefreshCw, Save, Bell, BellOff, Shield, ShieldCheck,
  ShieldAlert, ShieldX, Lock, Unlock, Key, Eye, EyeOff, Database, Server, Network,
  Activity, BarChart3, TrendingUp, TrendingDown, Target, Brain, BookOpen,
  MapPin, Phone, Mail, MessageSquare, Info, HelpCircle, ExternalLink, Link, LinkBreak,
  GitBranch, Layers, Filter, Search, MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft,
  ChevronRight, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, Menu, MoreVertical, X,
  Check, Star, Heart, ThumbsUp, ThumbsDown, Flag, Bookmark, Tag, Archive, Folder, File,
  FilePlus, FileMinus, FileEdit, FileSearch, FileDown, FileUp, FileShare, FileLock,
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
interface Prescription {
  id: string;
  patientName: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedDate: string;
  status: 'active' | 'completed' | 'discontinued';
  deaNumber: string;
  refills: number;
  instructions: string;
  sideEffects: string[];
  interactions: string[];
  allergies: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface DrugInteraction {
  id: string;
  drug1: string;
  drug2: string;
  severity: 'mild' | 'moderate' | 'severe' | 'contraindicated';
  description: string;
  recommendation: string;
}

interface DEACompliance {
  deaNumber: string;
  status: 'active' | 'expired' | 'suspended';
  expirationDate: string;
  prescribingLimits: {
    schedule1: number;
    schedule2: number;
    schedule3: number;
    schedule4: number;
    schedule5: number;
  };
  recentPrescriptions: number;
  complianceScore: number;
}

interface EPrescribingMetrics {
  totalPrescriptions: number;
  electronicPrescriptions: number;
  paperPrescriptions: number;
  pendingApprovals: number;
  rejectedPrescriptions: number;
  averageProcessingTime: number;
  complianceRate: number;
  errorRate: number;
}

// Mock Data
const mockPrescriptions: Prescription[] = [
  {
    id: "RX001",
    patientName: "Sarah Johnson",
    medicationName: "Sertraline (Zoloft)",
    dosage: "50mg",
    frequency: "Once daily",
    duration: "30 days",
    prescribedDate: "2024-12-10",
    status: "active",
    deaNumber: "DEA1234567",
    refills: 2,
    instructions: "Take with food in the morning",
    sideEffects: ["Nausea", "Insomnia", "Dry mouth"],
    interactions: ["MAO inhibitors", "NSAIDs"],
    allergies: ["Penicillin"],
    priority: "medium"
  },
  {
    id: "RX002",
    patientName: "Michael Chen",
    medicationName: "Bupropion (Wellbutrin)",
    dosage: "150mg",
    frequency: "Twice daily",
    duration: "60 days",
    prescribedDate: "2024-12-08",
    status: "active",
    deaNumber: "DEA1234567",
    refills: 1,
    instructions: "Take in the morning and evening",
    sideEffects: ["Headache", "Agitation", "Weight loss"],
    interactions: ["Alcohol", "Other antidepressants"],
    allergies: ["None known"],
    priority: "high"
  },
  {
    id: "RX003",
    patientName: "Emily Rodriguez",
    medicationName: "Alprazolam (Xanax)",
    dosage: "0.5mg",
    frequency: "As needed",
    duration: "14 days",
    prescribedDate: "2024-12-05",
    status: "active",
    deaNumber: "DEA1234567",
    refills: 0,
    instructions: "Take only when experiencing severe anxiety",
    sideEffects: ["Drowsiness", "Dependency risk", "Memory issues"],
    interactions: ["Opioids", "Alcohol", "Other sedatives"],
    allergies: ["None known"],
    priority: "critical"
  }
];

const mockDrugInteractions: DrugInteraction[] = [
  {
    id: "INT001",
    drug1: "Sertraline",
    drug2: "MAO inhibitors",
    severity: "contraindicated",
    description: "Serotonin syndrome risk",
    recommendation: "Avoid combination"
  },
  {
    id: "INT002",
    drug1: "Bupropion",
    drug2: "Alcohol",
    severity: "moderate",
    description: "Increased seizure risk",
    recommendation: "Limit alcohol consumption"
  },
  {
    id: "INT003",
    drug1: "Alprazolam",
    drug2: "Opioids",
    severity: "severe",
    description: "Respiratory depression risk",
    recommendation: "Monitor closely"
  }
];

const mockDEACompliance: DEACompliance = {
  deaNumber: "DEA1234567",
  status: "active",
  expirationDate: "2025-06-15",
  prescribingLimits: {
    schedule1: 0,
    schedule2: 100,
    schedule3: 500,
    schedule4: 1000,
    schedule5: 2000
  },
  recentPrescriptions: 45,
  complianceScore: 98
};

const mockEPrescribingMetrics: EPrescribingMetrics = {
  totalPrescriptions: 1250,
  electronicPrescriptions: 1180,
  paperPrescriptions: 70,
  pendingApprovals: 15,
  rejectedPrescriptions: 8,
  averageProcessingTime: 2.3,
  complianceRate: 94.4,
  errorRate: 0.6
};

// Utility Functions
const calculatePrescriptionMetrics = () => {
  const activePrescriptions = mockPrescriptions.filter(p => p.status === 'active');
  const criticalPrescriptions = mockPrescriptions.filter(p => p.priority === 'critical');
  const highPriorityPrescriptions = mockPrescriptions.filter(p => p.priority === 'high');
  
  return {
    totalActive: activePrescriptions.length,
    criticalCount: criticalPrescriptions.length,
    highPriorityCount: highPriorityPrescriptions.length,
    averageRefills: mockPrescriptions.reduce((sum, p) => sum + p.refills, 0) / mockPrescriptions.length,
    complianceRate: mockDEACompliance.complianceScore
  };
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'bg-red-500 text-white';
    case 'high': return 'bg-orange-500 text-white';
    case 'medium': return 'bg-yellow-500 text-black';
    case 'low': return 'bg-green-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-blue-100 text-blue-800';
    case 'discontinued': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'contraindicated': return 'bg-red-500 text-white';
    case 'severe': return 'bg-orange-500 text-white';
    case 'moderate': return 'bg-yellow-500 text-black';
    case 'mild': return 'bg-green-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

export default function PrescriptionManagementEPrescribing() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showDrugInteractions, setShowDrugInteractions] = useState(false);
  
  const metrics = calculatePrescriptionMetrics();
  
  const filteredPrescriptions = mockPrescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.medicationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriority === "all" || prescription.priority === selectedPriority;
    const matchesStatus = selectedStatus === "all" || prescription.status === selectedStatus;
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Pill className="h-8 w-8 text-blue-600" />
            Prescription Management & E-Prescribing
          </h1>
          <p className="text-gray-600 mt-2">
            DEA compliant electronic prescribing system for American psychiatrists
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <ShieldCheck className="h-4 w-4 mr-1" />
            DEA Compliant
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <CheckCircle className="h-4 w-4 mr-1" />
            HIPAA Secure
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockEPrescribingMetrics.totalPrescriptions}</div>
            <p className="text-xs opacity-75 mt-1">Last 30 days</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">E-Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockEPrescribingMetrics.electronicPrescriptions}</div>
            <p className="text-xs opacity-75 mt-1">{mockEPrescribingMetrics.complianceRate}% compliance</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Active Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalActive}</div>
            <p className="text-xs opacity-75 mt-1">{metrics.criticalCount} critical</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">DEA Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDEACompliance.complianceScore}%</div>
            <p className="text-xs opacity-75 mt-1">Score</p>
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
                     <TabsTrigger value="prescriptions" className="flex items-center gap-2">
             <FileText className="h-4 w-4" />
             Prescriptions
           </TabsTrigger>
          <TabsTrigger value="interactions" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Drug Interactions
          </TabsTrigger>
          <TabsTrigger value="dea-compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            DEA Compliance
          </TabsTrigger>
          <TabsTrigger value="e-prescribing" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            E-Prescribing
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Prescriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Prescriptions
                </CardTitle>
                <CardDescription>
                  Latest prescription activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockPrescriptions.slice(0, 3).map((prescription) => (
                  <div key={prescription.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Pill className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">{prescription.patientName}</p>
                        <p className="text-xs text-gray-600">{prescription.medicationName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(prescription.priority)}>
                        {prescription.priority}
                      </Badge>
                      <Badge className={getStatusColor(prescription.status)}>
                        {prescription.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* DEA Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  DEA Status
                </CardTitle>
                <CardDescription>
                  Current DEA compliance information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">DEA Number:</span>
                  <span className="text-sm font-mono">{mockDEACompliance.deaNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {mockDEACompliance.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Expires:</span>
                  <span className="text-sm">{mockDEACompliance.expirationDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Compliance Score:</span>
                  <div className="flex items-center gap-2">
                    <Progress value={mockDEACompliance.complianceScore} className="w-20" />
                    <span className="text-sm font-medium">{mockDEACompliance.complianceScore}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* E-Prescribing Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                E-Prescribing Performance
              </CardTitle>
              <CardDescription>
                Electronic prescribing metrics and compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{mockEPrescribingMetrics.complianceRate}%</div>
                  <div className="text-sm text-gray-600">Compliance Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{mockEPrescribingMetrics.averageProcessingTime}s</div>
                  <div className="text-sm text-gray-600">Avg Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{mockEPrescribingMetrics.errorRate}%</div>
                  <div className="text-sm text-gray-600">Error Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{mockEPrescribingMetrics.pendingApprovals}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Prescription Management</CardTitle>
              <CardDescription>
                Manage and track all prescriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                                 <div className="flex-1">
                   <label className="text-sm font-medium">Search Prescriptions</label>
                   <Input
                     id="search"
                     placeholder="Search by patient or medication..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="mt-1"
                   />
                 </div>
                <div className="flex gap-2">
                                     <div>
                     <label className="text-sm font-medium">Priority</label>
                     <select 
                       value={selectedPriority} 
                       onChange={(e) => setSelectedPriority(e.target.value)}
                       className="w-32 mt-1 p-2 border rounded-md text-sm"
                     >
                       <option value="all">All</option>
                       <option value="critical">Critical</option>
                       <option value="high">High</option>
                       <option value="medium">Medium</option>
                       <option value="low">Low</option>
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
                       <option value="completed">Completed</option>
                       <option value="discontinued">Discontinued</option>
                     </select>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prescriptions List */}
          <div className="grid gap-4">
            {filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Pill className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{prescription.patientName}</h3>
                          <Badge className={getPriorityColor(prescription.priority)}>
                            {prescription.priority}
                          </Badge>
                          <Badge className={getStatusColor(prescription.status)}>
                            {prescription.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Medication:</span>
                            <p className="text-gray-600">{prescription.medicationName}</p>
                          </div>
                          <div>
                            <span className="font-medium">Dosage:</span>
                            <p className="text-gray-600">{prescription.dosage} {prescription.frequency}</p>
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span>
                            <p className="text-gray-600">{prescription.duration}</p>
                          </div>
                          <div>
                            <span className="font-medium">Refills:</span>
                            <p className="text-gray-600">{prescription.refills} remaining</p>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Instructions:</span>
                          <p className="text-gray-600">{prescription.instructions}</p>
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
                         Print
                       </Button>
                    </div>
                  </div>
                  
                  {/* Side Effects & Interactions */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Side Effects:</h4>
                        <div className="flex flex-wrap gap-1">
                          {prescription.sideEffects.map((effect, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {effect}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">Drug Interactions:</h4>
                        <div className="flex flex-wrap gap-1">
                          {prescription.interactions.map((interaction, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-red-50 text-red-700">
                              {interaction}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Drug Interactions Tab */}
        <TabsContent value="interactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Drug Interaction Database
              </CardTitle>
              <CardDescription>
                Check for potential drug interactions and contraindications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDrugInteractions.map((interaction) => (
                  <div key={interaction.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{interaction.drug1}</span>
                        <span className="text-gray-500">+</span>
                        <span className="font-medium">{interaction.drug2}</span>
                      </div>
                      <Badge className={getSeverityColor(interaction.severity)}>
                        {interaction.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{interaction.description}</p>
                    <p className="text-sm font-medium text-red-600">
                      Recommendation: {interaction.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DEA Compliance Tab */}
        <TabsContent value="dea-compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* DEA Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  DEA Information
                </CardTitle>
                <CardDescription>
                  Current DEA license and compliance status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <span className="text-sm font-medium">DEA Number</span>
                     <p className="text-sm font-mono mt-1">{mockDEACompliance.deaNumber}</p>
                   </div>
                   <div>
                     <span className="text-sm font-medium">Status</span>
                     <Badge className="bg-green-100 text-green-800 mt-1">
                       {mockDEACompliance.status}
                     </Badge>
                   </div>
                   <div>
                     <span className="text-sm font-medium">Expiration Date</span>
                     <p className="text-sm mt-1">{mockDEACompliance.expirationDate}</p>
                   </div>
                   <div>
                     <span className="text-sm font-medium">Compliance Score</span>
                     <div className="flex items-center gap-2 mt-1">
                       <Progress value={mockDEACompliance.complianceScore} className="flex-1" />
                       <span className="text-sm font-medium">{mockDEACompliance.complianceScore}%</span>
                     </div>
                   </div>
                 </div>
              </CardContent>
            </Card>

            {/* Prescribing Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Prescribing Limits
                </CardTitle>
                <CardDescription>
                  Current prescribing limits by schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Schedule I:</span>
                    <span className="text-sm text-red-600 font-medium">0 (Prohibited)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Schedule II:</span>
                    <span className="text-sm">{mockDEACompliance.prescribingLimits.schedule2} remaining</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Schedule III:</span>
                    <span className="text-sm">{mockDEACompliance.prescribingLimits.schedule3} remaining</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Schedule IV:</span>
                    <span className="text-sm">{mockDEACompliance.prescribingLimits.schedule4} remaining</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Schedule V:</span>
                    <span className="text-sm">{mockDEACompliance.prescribingLimits.schedule5} remaining</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Compliance Alerts
              </CardTitle>
              <CardDescription>
                Important compliance notifications and reminders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                                 <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                   <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                   <div className="text-green-800">
                     DEA license is active and compliant. All prescriptions are within legal limits.
                   </div>
                 </div>
                 <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                   <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                   <div className="text-yellow-800">
                     DEA license expires in 6 months. Consider renewal process.
                   </div>
                 </div>
                 <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                   <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                   <div className="text-blue-800">
                     Recent audit completed successfully. No compliance issues found.
                   </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* E-Prescribing Tab */}
        <TabsContent value="e-prescribing" className="space-y-6">
          {/* E-Prescribing Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8" />
                  <div>
                    <p className="text-sm opacity-90">Electronic Prescriptions</p>
                    <p className="text-2xl font-bold">{mockEPrescribingMetrics.electronicPrescriptions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8" />
                  <div>
                    <p className="text-sm opacity-90">Compliance Rate</p>
                    <p className="text-2xl font-bold">{mockEPrescribingMetrics.complianceRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8" />
                  <div>
                    <p className="text-sm opacity-90">Avg Processing</p>
                    <p className="text-2xl font-bold">{mockEPrescribingMetrics.averageProcessingTime}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8" />
                  <div>
                    <p className="text-sm opacity-90">Error Rate</p>
                    <p className="text-2xl font-bold">{mockEPrescribingMetrics.errorRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* E-Prescribing Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Features
                </CardTitle>
                <CardDescription>
                  HIPAA compliant e-prescribing security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">End-to-end encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Digital signatures</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Audit trail logging</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">DEA compliance checks</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Integration Features
                </CardTitle>
                <CardDescription>
                  Seamless integration with pharmacy systems
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Pharmacy network integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Insurance verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Drug interaction checking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Allergy screening</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
