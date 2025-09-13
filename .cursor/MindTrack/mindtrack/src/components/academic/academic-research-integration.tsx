"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap, BookOpen, FileText, Users, Calendar, Clock, Target, Activity, Heart, Brain,
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
  MoreHorizontal as MoreHorizontalIcon, TrendingUp, Award, Certificate, Diploma, Scroll,
  Document, Clipboard, ClipboardList, ClipboardCheck, ClipboardX, ClipboardCopy,
  ClipboardPaste, Tag
} from "lucide-react";

// Interfaces
interface ResearchProject {
  id: string;
  title: string;
  type: 'clinical_trial' | 'observational' | 'systematic_review' | 'meta_analysis' | 'case_study';
  status: 'planning' | 'recruiting' | 'active' | 'completed' | 'published';
  principalInvestigator: string;
  collaborators: string[];
  startDate: string;
  endDate: string;
  budget: number;
  fundingSource: string;
  participants: number;
  enrolled: number;
  completionRate: number;
  publications: Publication[];
  milestones: Milestone[];
  lastUpdated: string;
}

interface Publication {
  id: string;
  title: string;
  journal: string;
  authors: string[];
  publicationDate: string;
  doi: string;
  impactFactor: number;
  citations: number;
  status: 'submitted' | 'under_review' | 'accepted' | 'published' | 'rejected';
  researchProjectId: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completionDate?: string;
}

interface GrantApplication {
  id: string;
  title: string;
  fundingAgency: string;
  amount: number;
  submissionDate: string;
  decisionDate: string;
  status: 'draft' | 'submitted' | 'under_review' | 'funded' | 'rejected';
  researchProjectId: string;
  successRate: number;
}

interface AcademicMetrics {
  totalProjects: number;
  activeProjects: number;
  totalPublications: number;
  totalCitations: number;
  averageImpactFactor: number;
  grantSuccessRate: number;
  totalFunding: number;
  collaborationCount: number;
}

// Mock Data
const mockResearchProjects: ResearchProject[] = [
  {
    id: "RP001",
    title: "Efficacy of Novel Antidepressant in Treatment-Resistant Depression",
    type: "clinical_trial",
    status: "active",
    principalInvestigator: "Dr. Sarah Johnson",
    collaborators: ["Dr. Michael Chen", "Dr. Emily Rodriguez", "Dr. David Kim"],
    startDate: "2024-01-15",
    endDate: "2026-01-15",
    budget: 2500000,
    fundingSource: "NIH R01",
    participants: 300,
    enrolled: 245,
    completionRate: 81.7,
    publications: [
      {
        id: "PUB001",
        title: "Protocol for Novel Antidepressant Trial",
        journal: "Journal of Clinical Psychiatry",
        authors: ["Johnson S", "Chen M", "Rodriguez E"],
        publicationDate: "2024-03-15",
        doi: "10.1000/jcp.2024.001",
        impactFactor: 4.2,
        citations: 12,
        status: "published",
        researchProjectId: "RP001"
      }
    ],
    milestones: [
      {
        id: "M001",
        title: "Protocol Approval",
        description: "IRB and FDA approval obtained",
        dueDate: "2024-02-15",
        status: "completed",
        completionDate: "2024-02-10"
      },
      {
        id: "M002",
        title: "Patient Recruitment Complete",
        description: "All 300 participants enrolled",
        dueDate: "2024-06-15",
        status: "completed",
        completionDate: "2024-05-20"
      },
      {
        id: "M003",
        title: "Interim Analysis",
        description: "6-month safety and efficacy analysis",
        dueDate: "2024-12-15",
        status: "in_progress"
      }
    ],
    lastUpdated: "2024-12-14T10:30:00Z"
  },
  {
    id: "RP002",
    title: "Long-term Outcomes of Telepsychiatry Interventions",
    type: "observational",
    status: "recruiting",
    principalInvestigator: "Dr. Michael Chen",
    collaborators: ["Dr. Sarah Johnson", "Dr. Lisa Wang"],
    startDate: "2024-03-01",
    endDate: "2025-03-01",
    budget: 500000,
    fundingSource: "Private Foundation",
    participants: 150,
    enrolled: 89,
    completionRate: 59.3,
    publications: [],
    milestones: [
      {
        id: "M004",
        title: "Study Design Finalized",
        description: "Protocol and data collection methods approved",
        dueDate: "2024-02-15",
        status: "completed",
        completionDate: "2024-02-10"
      },
      {
        id: "M005",
        title: "50% Recruitment",
        description: "75 participants enrolled",
        dueDate: "2024-08-01",
        status: "in_progress"
      }
    ],
    lastUpdated: "2024-12-14T09:45:00Z"
  }
];

const mockPublications: Publication[] = [
  {
    id: "PUB001",
    title: "Protocol for Novel Antidepressant Trial",
    journal: "Journal of Clinical Psychiatry",
    authors: ["Johnson S", "Chen M", "Rodriguez E"],
    publicationDate: "2024-03-15",
    doi: "10.1000/jcp.2024.001",
    impactFactor: 4.2,
    citations: 12,
    status: "published",
    researchProjectId: "RP001"
  },
  {
    id: "PUB002",
    title: "Efficacy of CBT in Anxiety Disorders: Meta-analysis",
    journal: "American Journal of Psychiatry",
    authors: ["Chen M", "Johnson S", "Wang L"],
    publicationDate: "2024-06-20",
    doi: "10.1000/ajp.2024.002",
    impactFactor: 8.5,
    citations: 28,
    status: "published",
    researchProjectId: "RP002"
  },
  {
    id: "PUB003",
    title: "Digital Phenotyping in Depression",
    journal: "Nature Mental Health",
    authors: ["Rodriguez E", "Kim D", "Johnson S"],
    publicationDate: "2024-09-10",
    doi: "10.1000/nmh.2024.003",
    impactFactor: 12.3,
    citations: 45,
    status: "published",
    researchProjectId: "RP001"
  }
];

const mockGrantApplications: GrantApplication[] = [
  {
    id: "GA001",
    title: "Novel Antidepressant Development",
    fundingAgency: "NIH",
    amount: 2500000,
    submissionDate: "2023-10-15",
    decisionDate: "2024-02-15",
    status: "funded",
    researchProjectId: "RP001",
    successRate: 85
  },
  {
    id: "GA002",
    title: "Telepsychiatry Effectiveness Study",
    fundingAgency: "Private Foundation",
    amount: 500000,
    submissionDate: "2024-01-20",
    decisionDate: "2024-05-20",
    status: "funded",
    researchProjectId: "RP002",
    successRate: 92
  },
  {
    id: "GA003",
    title: "AI-Powered Diagnostic Tools",
    fundingAgency: "NSF",
    amount: 800000,
    submissionDate: "2024-03-01",
    decisionDate: "2024-07-01",
    status: "under_review",
    researchProjectId: "RP003",
    successRate: 65
  }
];

const mockAcademicMetrics: AcademicMetrics = {
  totalProjects: 12,
  activeProjects: 8,
  totalPublications: 45,
  totalCitations: 1234,
  averageImpactFactor: 6.8,
  grantSuccessRate: 78.5,
  totalFunding: 8500000,
  collaborationCount: 23
};

// Utility Functions
const getProjectTypeColor = (type: string) => {
  switch (type) {
    case 'clinical_trial': return 'bg-blue-500 text-white';
    case 'observational': return 'bg-green-500 text-white';
    case 'systematic_review': return 'bg-purple-500 text-white';
    case 'meta_analysis': return 'bg-orange-500 text-white';
    case 'case_study': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'planning': return 'bg-yellow-500 text-black';
    case 'recruiting': return 'bg-blue-500 text-white';
    case 'active': return 'bg-green-500 text-white';
    case 'completed': return 'bg-purple-500 text-white';
    case 'published': return 'bg-indigo-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getMilestoneStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-gray-100 text-gray-800';
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'overdue': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPublicationStatusColor = (status: string) => {
  switch (status) {
    case 'submitted': return 'bg-yellow-100 text-yellow-800';
    case 'under_review': return 'bg-blue-100 text-blue-800';
    case 'accepted': return 'bg-green-100 text-green-800';
    case 'published': return 'bg-purple-100 text-purple-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getGrantStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'submitted': return 'bg-yellow-100 text-yellow-800';
    case 'under_review': return 'bg-blue-100 text-blue-800';
    case 'funded': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function AcademicResearchIntegration() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProjectType, setSelectedProjectType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const filteredProjects = mockResearchProjects.filter(project => {
    const matchesType = selectedProjectType === "all" || project.type === selectedProjectType;
    const matchesStatus = selectedStatus === "all" || project.status === selectedStatus;
    
    return matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-purple-50 via-white to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-purple-600" />
            Academic & Research Integration
          </h1>
          <p className="text-gray-600 mt-2">
            Clinical trial management, research protocols, and academic collaboration tools
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <GraduationCap className="h-4 w-4 mr-1" />
            Academic
          </Badge>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            <BookOpen className="h-4 w-4 mr-1" />
            Research
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAcademicMetrics.activeProjects}</div>
            <p className="text-xs opacity-75 mt-1">Of {mockAcademicMetrics.totalProjects} total</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Publications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAcademicMetrics.totalPublications}</div>
            <p className="text-xs opacity-75 mt-1">{mockAcademicMetrics.totalCitations} citations</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Grant Success</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAcademicMetrics.grantSuccessRate}%</div>
            <p className="text-xs opacity-75 mt-1">Success rate</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Funding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(mockAcademicMetrics.totalFunding / 1000000).toFixed(1)}M</div>
            <p className="text-xs opacity-75 mt-1">Research funding</p>
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
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="publications" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Publications
          </TabsTrigger>
          <TabsTrigger value="grants" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Grants
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Research Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Research Performance
                </CardTitle>
                <CardDescription>
                  Key academic and research performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Projects</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockAcademicMetrics.activeProjects / mockAcademicMetrics.totalProjects) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockAcademicMetrics.totalProjects}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Projects</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockAcademicMetrics.activeProjects / mockAcademicMetrics.totalProjects) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockAcademicMetrics.activeProjects}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Publications</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockAcademicMetrics.totalPublications / 100) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockAcademicMetrics.totalPublications}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Citations</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockAcademicMetrics.totalCitations / 2000) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockAcademicMetrics.totalCitations}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Academic Impact
                </CardTitle>
                <CardDescription>
                  Research impact and collaboration metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Impact Factor</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockAcademicMetrics.averageImpactFactor / 15) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockAcademicMetrics.averageImpactFactor}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Grant Success Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockAcademicMetrics.grantSuccessRate} className="w-20" />
                      <span className="text-sm font-medium">{mockAcademicMetrics.grantSuccessRate}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Collaborations</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockAcademicMetrics.collaborationCount / 50) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockAcademicMetrics.collaborationCount}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Funding</span>
                    <span className="text-sm font-medium text-green-600">${(mockAcademicMetrics.totalFunding / 1000000).toFixed(1)}M</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Research Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Recent Research Projects
              </CardTitle>
              <CardDescription>
                Latest research projects and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockResearchProjects.map((project) => (
                  <div key={project.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{project.title}</h3>
                      <p className="text-xs text-gray-600">PI: {project.principalInvestigator}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getProjectTypeColor(project.type)}>
                        {project.type.replace('_', ' ')}
                      </Badge>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        {project.completionRate}% complete
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Research Project Management</CardTitle>
              <CardDescription>
                Manage and track research projects and clinical trials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div>
                  <label className="text-sm font-medium">Project Type</label>
                  <select 
                    value={selectedProjectType} 
                    onChange={(e) => setSelectedProjectType(e.target.value)}
                    className="w-40 mt-1 p-2 border rounded-md text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="clinical_trial">Clinical Trial</option>
                    <option value="observational">Observational</option>
                    <option value="systematic_review">Systematic Review</option>
                    <option value="meta_analysis">Meta Analysis</option>
                    <option value="case_study">Case Study</option>
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
                    <option value="planning">Planning</option>
                    <option value="recruiting">Recruiting</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects List */}
          <div className="grid gap-4">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <BookOpen className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{project.title}</h3>
                          <Badge className={getProjectTypeColor(project.type)}>
                            {project.type.replace('_', ' ')}
                          </Badge>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                          <Badge variant="outline">
                            ${(project.budget / 1000000).toFixed(1)}M
                          </Badge>
                        </div>
                        <p className="text-gray-600">PI: {project.principalInvestigator}</p>
                        <p className="text-sm text-gray-500">Funding: {project.fundingSource}</p>
                        
                        <div className="mt-3">
                          <span className="font-medium text-sm">Progress:</span>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1 text-sm">
                            <div>
                              <span className="text-gray-600">Enrolled:</span>
                              <p className="font-medium">{project.enrolled}/{project.participants}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Completion:</span>
                              <p className="font-medium">{project.completionRate}%</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Publications:</span>
                              <p className="font-medium">{project.publications.length}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Collaborators:</span>
                              <p className="font-medium">{project.collaborators.length}</p>
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
                        <FileText className="h-4 w-4 mr-1" />
                        Reports
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Publications Tab */}
        <TabsContent value="publications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Publication Management
              </CardTitle>
              <CardDescription>
                Track publications, citations, and academic impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockPublications.map((publication) => (
                  <div key={publication.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{publication.title}</h3>
                          <p className="text-gray-600">{publication.journal}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPublicationStatusColor(publication.status)}>
                          {publication.status}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          IF: {publication.impactFactor}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          {publication.citations} citations
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="font-medium">Authors:</span>
                        <p className="text-sm text-gray-600">{publication.authors.join(', ')}</p>
                      </div>
                      <div>
                        <span className="font-medium">Published:</span>
                        <p className="text-sm text-gray-600">{new Date(publication.publicationDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">DOI:</span>
                        <p className="text-sm text-gray-600">{publication.doi}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Paper
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

        {/* Grants Tab */}
        <TabsContent value="grants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Grant Management
              </CardTitle>
              <CardDescription>
                Track grant applications, funding, and success rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockGrantApplications.map((grant) => (
                  <div key={grant.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Award className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{grant.title}</h3>
                          <p className="text-gray-600">{grant.fundingAgency}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getGrantStatusColor(grant.status)}>
                          {grant.status}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          ${(grant.amount / 1000000).toFixed(1)}M
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          {grant.successRate}% success
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="font-medium">Submitted:</span>
                        <p className="text-sm text-gray-600">{new Date(grant.submissionDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Decision:</span>
                        <p className="text-sm text-gray-600">{new Date(grant.decisionDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span>
                        <p className="text-sm text-gray-600">${grant.amount.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Application
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Progress Report
                      </Button>
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





