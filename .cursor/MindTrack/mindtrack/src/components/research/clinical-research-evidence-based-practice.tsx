"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen, Target, AlertTriangle, CheckCircle, XCircle, Clock, Calendar, User, Users,
  Settings, Plus, Download, Upload, RefreshCw, Save, Bell, BellOff, Shield, ShieldCheck,
  ShieldAlert, ShieldX, Lock, Unlock, Key, Eye, EyeOff, Database, Server, Activity,
  BarChart3, TrendingUp, TrendingDown, FileText, MapPin, Phone, Mail, MessageSquare,
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
interface ResearchStudy {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  publicationDate: string;
  studyType: 'RCT' | 'Meta-analysis' | 'Systematic Review' | 'Cohort Study' | 'Case-Control' | 'Observational';
  population: string;
  sampleSize: number;
  duration: string;
  primaryOutcome: string;
  secondaryOutcomes: string[];
  results: string;
  conclusion: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  impactFactor: number;
  citations: number;
  status: 'published' | 'ongoing' | 'completed' | 'recruiting';
  keywords: string[];
}

interface ClinicalGuideline {
  id: string;
  title: string;
  organization: string;
  publicationDate: string;
  lastUpdated: string;
  condition: string;
  targetPopulation: string;
  recommendations: string[];
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  strength: 'Strong' | 'Moderate' | 'Weak';
  status: 'active' | 'draft' | 'archived';
  implementationNotes: string;
}

interface EvidenceDatabase {
  id: string;
  name: string;
  type: 'systematic_review' | 'meta_analysis' | 'clinical_trial' | 'case_study' | 'expert_opinion';
  condition: string;
  intervention: string;
  outcome: string;
  effectSize: number;
  confidenceInterval: string;
  pValue: number;
  sampleSize: number;
  quality: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

interface ResearchMetrics {
  totalStudies: number;
  activeStudies: number;
  publishedStudies: number;
  averageImpactFactor: number;
  totalCitations: number;
  evidenceLevelA: number;
  evidenceLevelB: number;
  evidenceLevelC: number;
  evidenceLevelD: number;
  researchCollaborations: number;
  fundingAmount: number;
}

// Mock Data
const mockResearchStudies: ResearchStudy[] = [
  {
    id: "RS001",
    title: "Efficacy of Cognitive Behavioral Therapy vs. Pharmacotherapy in Major Depressive Disorder",
    authors: ["Dr. Sarah Johnson", "Dr. Michael Chen", "Dr. Emily Rodriguez"],
    journal: "Journal of Clinical Psychiatry",
    publicationDate: "2024-11-15",
    studyType: "RCT",
    population: "Adults with MDD",
    sampleSize: 240,
    duration: "12 weeks",
    primaryOutcome: "Reduction in HAM-D scores",
    secondaryOutcomes: ["Response rate", "Remission rate", "Quality of life"],
    results: "CBT showed non-inferiority to pharmacotherapy with fewer side effects",
    conclusion: "CBT should be considered as first-line treatment for mild to moderate MDD",
    evidenceLevel: "A",
    impactFactor: 4.8,
    citations: 156,
    status: "published",
    keywords: ["CBT", "MDD", "Pharmacotherapy", "RCT"]
  },
  {
    id: "RS002",
    title: "Long-term Outcomes of Early Intervention in Psychosis",
    authors: ["Dr. James Thompson", "Dr. Lisa Wang"],
    journal: "Schizophrenia Research",
    publicationDate: "2024-10-20",
    studyType: "Cohort Study",
    population: "First-episode psychosis patients",
    sampleSize: 180,
    duration: "5 years",
    primaryOutcome: "Functional recovery",
    secondaryOutcomes: ["Symptom severity", "Hospitalization rates", "Employment status"],
    results: "Early intervention significantly improved long-term functional outcomes",
    conclusion: "Early intervention programs should be standard of care",
    evidenceLevel: "B",
    impactFactor: 3.9,
    citations: 89,
    status: "published",
    keywords: ["Early intervention", "Psychosis", "Functional recovery", "Cohort"]
  },
  {
    id: "RS003",
    title: "Meta-analysis of Antidepressant Efficacy in Treatment-Resistant Depression",
    authors: ["Dr. Robert Smith", "Dr. Jennifer Lee"],
    journal: "American Journal of Psychiatry",
    publicationDate: "2024-12-01",
    studyType: "Meta-analysis",
    population: "Treatment-resistant depression patients",
    sampleSize: 1250,
    duration: "8 weeks",
    primaryOutcome: "Response rate",
    secondaryOutcomes: ["Remission rate", "Side effects", "Dropout rates"],
    results: "Combined therapy showed superior efficacy over monotherapy",
    conclusion: "Combination strategies should be considered for TRD",
    evidenceLevel: "A",
    impactFactor: 5.2,
    citations: 234,
    status: "published",
    keywords: ["TRD", "Antidepressants", "Meta-analysis", "Combination therapy"]
  }
];

const mockClinicalGuidelines: ClinicalGuideline[] = [
  {
    id: "CG001",
    title: "APA Practice Guideline for Treatment of Major Depressive Disorder",
    organization: "American Psychiatric Association",
    publicationDate: "2024-01-15",
    lastUpdated: "2024-11-30",
    condition: "Major Depressive Disorder",
    targetPopulation: "Adults with MDD",
    recommendations: [
      "Screen all patients for depression",
      "Use evidence-based treatments",
      "Monitor treatment response",
      "Consider combination therapy for non-responders"
    ],
    evidenceLevel: "A",
    strength: "Strong",
    status: "active",
    implementationNotes: "Guideline should be implemented in all psychiatric practices"
  },
  {
    id: "CG002",
    title: "NICE Guidelines for Anxiety Disorders",
    organization: "National Institute for Health and Care Excellence",
    publicationDate: "2024-03-20",
    lastUpdated: "2024-10-15",
    condition: "Anxiety Disorders",
    targetPopulation: "Adults with anxiety disorders",
    recommendations: [
      "Offer CBT as first-line treatment",
      "Consider medication for severe cases",
      "Provide psychoeducation",
      "Monitor for side effects"
    ],
    evidenceLevel: "A",
    strength: "Strong",
    status: "active",
    implementationNotes: "Guidelines are evidence-based and widely accepted"
  },
  {
    id: "CG003",
    title: "CANMAT Guidelines for Bipolar Disorder",
    organization: "Canadian Network for Mood and Anxiety Treatments",
    publicationDate: "2024-06-10",
    lastUpdated: "2024-12-01",
    condition: "Bipolar Disorder",
    targetPopulation: "Adults with bipolar disorder",
    recommendations: [
      "Use mood stabilizers as first-line",
      "Monitor for mood episodes",
      "Provide psychoeducation",
      "Consider adjunctive therapies"
    ],
    evidenceLevel: "B",
    strength: "Moderate",
    status: "active",
    implementationNotes: "Guidelines require regular updates based on new evidence"
  }
];

const mockEvidenceDatabase: EvidenceDatabase[] = [
  {
    id: "ED001",
    name: "CBT vs. Pharmacotherapy in Depression",
    type: "meta_analysis",
    condition: "Major Depressive Disorder",
    intervention: "Cognitive Behavioral Therapy",
    outcome: "Depression severity reduction",
    effectSize: 0.85,
    confidenceInterval: "0.72-0.98",
    pValue: 0.001,
    sampleSize: 1250,
    quality: "high",
    lastUpdated: "2024-11-15"
  },
  {
    id: "ED002",
    name: "Early Intervention in Psychosis",
    type: "systematic_review",
    condition: "First-episode psychosis",
    intervention: "Early intervention program",
    outcome: "Functional recovery",
    effectSize: 0.92,
    confidenceInterval: "0.78-1.06",
    pValue: 0.002,
    sampleSize: 890,
    quality: "high",
    lastUpdated: "2024-10-20"
  },
  {
    id: "ED003",
    name: "Antidepressant Combination Therapy",
    type: "clinical_trial",
    condition: "Treatment-resistant depression",
    intervention: "Combination antidepressant therapy",
    outcome: "Response rate",
    effectSize: 0.76,
    confidenceInterval: "0.65-0.87",
    pValue: 0.005,
    sampleSize: 450,
    quality: "medium",
    lastUpdated: "2024-12-01"
  }
];

const mockResearchMetrics: ResearchMetrics = {
  totalStudies: 45,
  activeStudies: 12,
  publishedStudies: 33,
  averageImpactFactor: 4.2,
  totalCitations: 1250,
  evidenceLevelA: 15,
  evidenceLevelB: 18,
  evidenceLevelC: 8,
  evidenceLevelD: 4,
  researchCollaborations: 28,
  fundingAmount: 2500000
};

// Utility Functions
const getStudyTypeColor = (type: string) => {
  switch (type) {
    case 'RCT': return 'bg-green-500 text-white';
    case 'Meta-analysis': return 'bg-blue-500 text-white';
    case 'Systematic Review': return 'bg-purple-500 text-white';
    case 'Cohort Study': return 'bg-orange-500 text-white';
    case 'Case-Control': return 'bg-red-500 text-white';
    case 'Observational': return 'bg-gray-500 text-white';
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

const getStrengthColor = (strength: string) => {
  switch (strength) {
    case 'Strong': return 'bg-green-500 text-white';
    case 'Moderate': return 'bg-yellow-500 text-black';
    case 'Weak': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getQualityColor = (quality: string) => {
  switch (quality) {
    case 'high': return 'bg-green-500 text-white';
    case 'medium': return 'bg-yellow-500 text-black';
    case 'low': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

export default function ClinicalResearchEvidenceBasedPractice() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudyType, setSelectedStudyType] = useState("all");
  const [selectedEvidenceLevel, setSelectedEvidenceLevel] = useState("all");
  
  const filteredStudies = mockResearchStudies.filter(study => {
    const matchesSearch = study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         study.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         study.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStudyType = selectedStudyType === "all" || study.studyType === selectedStudyType;
    const matchesEvidenceLevel = selectedEvidenceLevel === "all" || study.evidenceLevel === selectedEvidenceLevel;
    
    return matchesSearch && matchesStudyType && matchesEvidenceLevel;
  });

  const totalEvidenceLevelA = mockResearchMetrics.evidenceLevelA;
  const totalEvidenceLevelB = mockResearchMetrics.evidenceLevelB;
  const totalEvidenceLevelC = mockResearchMetrics.evidenceLevelC;
  const totalEvidenceLevelD = mockResearchMetrics.evidenceLevelD;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            Clinical Research & Evidence-Based Practice
          </h1>
          <p className="text-gray-600 mt-2">
            Evidence-based clinical research and practice guidelines for American psychiatrists
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            <ShieldCheck className="h-4 w-4 mr-1" />
            Evidence-Based
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <CheckCircle className="h-4 w-4 mr-1" />
            Peer Reviewed
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Studies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockResearchMetrics.totalStudies}</div>
            <p className="text-xs opacity-75 mt-1">{mockResearchMetrics.activeStudies} active</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Impact Factor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockResearchMetrics.averageImpactFactor}</div>
            <p className="text-xs opacity-75 mt-1">Average impact factor</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Citations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockResearchMetrics.totalCitations.toLocaleString()}</div>
            <p className="text-xs opacity-75 mt-1">Total citations</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Funding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(mockResearchMetrics.fundingAmount / 1000000).toFixed(1)}M</div>
            <p className="text-xs opacity-75 mt-1">Total funding</p>
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
          <TabsTrigger value="studies" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Studies
          </TabsTrigger>
          <TabsTrigger value="guidelines" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Guidelines
          </TabsTrigger>
          <TabsTrigger value="evidence" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Evidence
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Research Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Research Summary
                </CardTitle>
                <CardDescription>
                  Overview of clinical research activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{mockResearchMetrics.totalStudies}</div>
                    <div className="text-sm text-gray-600">Total Studies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{mockResearchMetrics.publishedStudies}</div>
                    <div className="text-sm text-gray-600">Published</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{mockResearchMetrics.activeStudies}</div>
                    <div className="text-sm text-gray-600">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{mockResearchMetrics.researchCollaborations}</div>
                    <div className="text-sm text-gray-600">Collaborations</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evidence Levels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Evidence Levels
                </CardTitle>
                <CardDescription>
                  Distribution of evidence levels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Level A (Strong)</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(totalEvidenceLevelA / mockResearchMetrics.totalStudies) * 100} className="w-20" />
                      <span className="text-sm font-medium">{totalEvidenceLevelA}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Level B (Moderate)</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(totalEvidenceLevelB / mockResearchMetrics.totalStudies) * 100} className="w-20" />
                      <span className="text-sm font-medium">{totalEvidenceLevelB}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Level C (Weak)</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(totalEvidenceLevelC / mockResearchMetrics.totalStudies) * 100} className="w-20" />
                      <span className="text-sm font-medium">{totalEvidenceLevelC}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Level D (Expert Opinion)</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(totalEvidenceLevelD / mockResearchMetrics.totalStudies) * 100} className="w-20" />
                      <span className="text-sm font-medium">{totalEvidenceLevelD}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Studies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Research Studies
              </CardTitle>
              <CardDescription>
                Latest published clinical research
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockResearchStudies.slice(0, 3).map((study) => (
                  <div key={study.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{study.title}</h3>
                        <p className="text-xs text-gray-600">{study.authors.join(", ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStudyTypeColor(study.studyType)}>
                        {study.studyType}
                      </Badge>
                      <Badge className={getEvidenceLevelColor(study.evidenceLevel)}>
                        Level {study.evidenceLevel}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">
                        {study.citations} citations
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Studies Tab */}
        <TabsContent value="studies" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Research Studies</CardTitle>
              <CardDescription>
                Browse and search clinical research studies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Search Studies</label>
                  <Input
                    placeholder="Search by title, authors, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <div>
                    <label className="text-sm font-medium">Study Type</label>
                    <select 
                      value={selectedStudyType} 
                      onChange={(e) => setSelectedStudyType(e.target.value)}
                      className="w-32 mt-1 p-2 border rounded-md text-sm"
                    >
                      <option value="all">All</option>
                      <option value="RCT">RCT</option>
                      <option value="Meta-analysis">Meta-analysis</option>
                      <option value="Systematic Review">Systematic Review</option>
                      <option value="Cohort Study">Cohort Study</option>
                      <option value="Case-Control">Case-Control</option>
                      <option value="Observational">Observational</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Evidence Level</label>
                    <select 
                      value={selectedEvidenceLevel} 
                      onChange={(e) => setSelectedEvidenceLevel(e.target.value)}
                      className="w-32 mt-1 p-2 border rounded-md text-sm"
                    >
                      <option value="all">All</option>
                      <option value="A">Level A</option>
                      <option value="B">Level B</option>
                      <option value="C">Level C</option>
                      <option value="D">Level D</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Studies List */}
          <div className="grid gap-4">
            {filteredStudies.map((study) => (
              <Card key={study.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <BookOpen className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{study.title}</h3>
                          <Badge className={getStudyTypeColor(study.studyType)}>
                            {study.studyType}
                          </Badge>
                          <Badge className={getEvidenceLevelColor(study.evidenceLevel)}>
                            Level {study.evidenceLevel}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800">
                            {study.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600">Authors: {study.authors.join(", ")}</p>
                        <p className="text-gray-600">Journal: {study.journal}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Population:</span>
                            <p className="text-gray-600">{study.population}</p>
                          </div>
                          <div>
                            <span className="font-medium">Sample Size:</span>
                            <p className="text-gray-600">{study.sampleSize}</p>
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span>
                            <p className="text-gray-600">{study.duration}</p>
                          </div>
                          <div>
                            <span className="font-medium">Impact Factor:</span>
                            <p className="text-gray-600">{study.impactFactor}</p>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Primary Outcome:</span>
                          <p className="text-gray-600">{study.primaryOutcome}</p>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Results:</span>
                          <p className="text-gray-600">{study.results}</p>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Conclusion:</span>
                          <p className="text-gray-600">{study.conclusion}</p>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Keywords:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {study.keywords.map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        View
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

        {/* Guidelines Tab */}
        <TabsContent value="guidelines" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Clinical Practice Guidelines
              </CardTitle>
              <CardDescription>
                Evidence-based clinical practice guidelines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockClinicalGuidelines.map((guideline) => (
                  <div key={guideline.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Target className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{guideline.title}</h3>
                          <p className="text-gray-600">{guideline.organization}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getEvidenceLevelColor(guideline.evidenceLevel)}>
                          Level {guideline.evidenceLevel}
                        </Badge>
                        <Badge className={getStrengthColor(guideline.strength)}>
                          {guideline.strength}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          {guideline.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="font-medium">Condition:</span>
                        <p className="text-gray-600">{guideline.condition}</p>
                      </div>
                      <div>
                        <span className="font-medium">Target Population:</span>
                        <p className="text-gray-600">{guideline.targetPopulation}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Key Recommendations:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {guideline.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-4">
                      <span className="font-medium">Implementation Notes:</span>
                      <p className="text-sm text-gray-600 mt-1">{guideline.implementationNotes}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span>Published: {guideline.publicationDate}</span>
                        <span className="mx-2">•</span>
                        <span>Updated: {guideline.lastUpdated}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          View Guideline
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileDown className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidence Tab */}
        <TabsContent value="evidence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Evidence Database
              </CardTitle>
              <CardDescription>
                Systematic evidence synthesis and meta-analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockEvidenceDatabase.map((evidence) => (
                  <div key={evidence.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Database className="h-6 w-6 text-purple-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{evidence.name}</h3>
                          <p className="text-gray-600">{evidence.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <Badge className={getQualityColor(evidence.quality)}>
                        {evidence.quality} quality
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="font-medium">Condition:</span>
                        <p className="text-gray-600">{evidence.condition}</p>
                      </div>
                      <div>
                        <span className="font-medium">Intervention:</span>
                        <p className="text-gray-600">{evidence.intervention}</p>
                      </div>
                      <div>
                        <span className="font-medium">Outcome:</span>
                        <p className="text-gray-600">{evidence.outcome}</p>
                      </div>
                      <div>
                        <span className="font-medium">Sample Size:</span>
                        <p className="text-gray-600">{evidence.sampleSize.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{evidence.effectSize}</div>
                        <div className="text-sm text-gray-600">Effect Size</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{evidence.confidenceInterval}</div>
                        <div className="text-sm text-gray-600">95% CI</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{evidence.pValue}</div>
                        <div className="text-sm text-gray-600">P-value</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">Last Updated</div>
                        <div className="text-sm text-gray-600">{evidence.lastUpdated}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Forest Plot
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Research Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Research Performance
                </CardTitle>
                <CardDescription>
                  Key research performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Publication Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockResearchMetrics.publishedStudies / mockResearchMetrics.totalStudies) * 100} className="w-20" />
                      <span className="text-sm font-medium">{((mockResearchMetrics.publishedStudies / mockResearchMetrics.totalStudies) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Impact Factor</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockResearchMetrics.averageImpactFactor / 10) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockResearchMetrics.averageImpactFactor}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Citation Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockResearchMetrics.totalCitations / 2000) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockResearchMetrics.totalCitations.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Collaboration Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockResearchMetrics.researchCollaborations / 50) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockResearchMetrics.researchCollaborations}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Research Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Research Trends
                </CardTitle>
                <CardDescription>
                  Research activity and funding trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">${(mockResearchMetrics.fundingAmount / 1000000).toFixed(1)}M</div>
                    <div className="text-sm text-gray-600">Total Funding</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{mockResearchMetrics.totalStudies}</div>
                      <div className="text-xs text-gray-600">Total Studies</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{mockResearchMetrics.activeStudies}</div>
                      <div className="text-xs text-gray-600">Active Studies</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600">Evidence Level Distribution</div>
                    <div className="flex justify-center gap-2 mt-2">
                      <Badge className="bg-green-500 text-white">A: {totalEvidenceLevelA}</Badge>
                      <Badge className="bg-blue-500 text-white">B: {totalEvidenceLevelB}</Badge>
                      <Badge className="bg-yellow-500 text-black">C: {totalEvidenceLevelC}</Badge>
                      <Badge className="bg-red-500 text-white">D: {totalEvidenceLevelD}</Badge>
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





