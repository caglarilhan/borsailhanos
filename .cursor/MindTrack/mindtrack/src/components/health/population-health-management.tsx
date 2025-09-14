"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Users, Target, AlertTriangle, CheckCircle, XCircle, Clock, Calendar, User, Settings, Plus, Download, Upload, RefreshCw, Save, Bell, BellOff, Shield, ShieldCheck,
  ShieldAlert, ShieldX, Lock, Unlock, Key, Eye, EyeOff, Database, Server, Activity,
  TrendingUp, TrendingDown, FileText, MapPin, Phone, Mail, MessageSquare,
  Info, HelpCircle, ExternalLink, Link, LinkBreak, GitBranch, Layers, Filter, Search,
  MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ArrowUp, ArrowDown,
  ArrowLeft, ArrowRight, Home, Menu, MoreVertical, X, Check, Star, Heart, ThumbsUp,
  ThumbsDown, Flag, Bookmark, Tag, Archive, Folder, File, FilePlus, FileMinus, FileEdit,
  FileSearch, FileDown, FileUp, FileShare, FileLock, FileUnlock, FileHeart, FileStar,
  FileZap, FileTarget, FileShield, FileSettings, FileInfo, FileAlert,
  FileCheckCircle, FileXCircle, FilePlusCircle, FileMinusCircle, FileEditCircle, FileSearchCircle,
  FileDownCircle, FileUpCircle, FileShareCircle, FileLockCircle, FileUnlockCircle, FileHeartCircle,
  FileStarCircle, FileZapCircle, FileTargetCircle, FileShieldCircle,
  FileSettingsCircle, FileInfoCircle, FileAlertCircle, Zap, Globe, Cpu, Memory, HardDrive,
  Wifi, Cloud, BarChart, PieChart, LineChart, ScatterChart, AreaChart, Table, List, Grid,
  Columns, Rows, SortAsc, SortDesc, BarChart3
} from "lucide-react";

// Interfaces
interface PopulationSegment {
  id: string;
  name: string;
  ageRange: string;
  gender: string;
  location: string;
  size: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  primaryConditions: string[];
  averageAge: number;
  insuranceType: string;
  socioeconomicStatus: string;
  lastUpdated: string;
}

interface HealthTrend {
  id: string;
  condition: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentage: number;
  timePeriod: string;
  affectedPopulation: number;
  severity: 'mild' | 'moderate' | 'severe';
  riskFactors: string[];
  recommendations: string[];
  lastUpdated: string;
}

interface CommunityHealth {
  id: string;
  community: string;
  population: number;
  healthScore: number;
  accessToCare: number;
  mentalHealthPrevalence: number;
  substanceUseRate: number;
  suicideRate: number;
  socialDeterminants: {
    education: number;
    income: number;
    housing: number;
    transportation: number;
    foodSecurity: number;
  };
  interventions: string[];
  outcomes: string[];
  lastUpdated: string;
}

interface PopulationMetrics {
  totalPopulation: number;
  activePatients: number;
  highRiskPatients: number;
  averageHealthScore: number;
  populationGrowth: number;
  healthDisparities: number;
  accessToCare: number;
  mentalHealthPrevalence: number;
  substanceUseRate: number;
  suicideRate: number;
}

// Mock Data
const mockPopulationSegments: PopulationSegment[] = [
  {
    id: "PS001",
    name: "Young Adults (18-25)",
    ageRange: "18-25",
    gender: "All",
    location: "Urban",
    size: 1250,
    riskLevel: "high",
    primaryConditions: ["Anxiety", "Depression", "Substance Use", "ADHD"],
    averageAge: 21.5,
    insuranceType: "Mixed",
    socioeconomicStatus: "Varied",
    lastUpdated: "2024-12-14"
  },
  {
    id: "PS002",
    name: "Working Professionals (26-45)",
    ageRange: "26-45",
    gender: "All",
    location: "Suburban",
    size: 2100,
    riskLevel: "medium",
    primaryConditions: ["Stress", "Burnout", "Depression", "Anxiety"],
    averageAge: 35.2,
    insuranceType: "Private",
    socioeconomicStatus: "Middle Class",
    lastUpdated: "2024-12-14"
  },
  {
    id: "PS003",
    name: "Seniors (65+)",
    ageRange: "65+",
    gender: "All",
    location: "Rural",
    size: 850,
    riskLevel: "medium",
    primaryConditions: ["Depression", "Anxiety", "Cognitive Decline", "Grief"],
    averageAge: 72.8,
    insuranceType: "Medicare",
    socioeconomicStatus: "Fixed Income",
    lastUpdated: "2024-12-14"
  },
  {
    id: "PS004",
    name: "Adolescents (13-17)",
    ageRange: "13-17",
    gender: "All",
    location: "Mixed",
    size: 950,
    riskLevel: "critical",
    primaryConditions: ["Depression", "Anxiety", "Self-harm", "Eating Disorders"],
    averageAge: 15.3,
    insuranceType: "Parent Coverage",
    socioeconomicStatus: "Varied",
    lastUpdated: "2024-12-14"
  }
];

const mockHealthTrends: HealthTrend[] = [
  {
    id: "HT001",
    condition: "Major Depressive Disorder",
    trend: "increasing",
    percentage: 12.5,
    timePeriod: "Last 6 months",
    affectedPopulation: 525,
    severity: "moderate",
    riskFactors: ["Social isolation", "Economic stress", "Limited access to care"],
    recommendations: ["Increase telehealth access", "Implement screening programs", "Provide community support"],
    lastUpdated: "2024-12-14"
  },
  {
    id: "HT002",
    condition: "Anxiety Disorders",
    trend: "increasing",
    percentage: 8.3,
    timePeriod: "Last 6 months",
    affectedPopulation: 348,
    severity: "moderate",
    riskFactors: ["Work stress", "Social media", "Uncertainty"],
    recommendations: ["Stress management programs", "Digital wellness initiatives", "Workplace mental health support"],
    lastUpdated: "2024-12-14"
  },
  {
    id: "HT003",
    condition: "Substance Use Disorders",
    trend: "stable",
    percentage: 5.2,
    timePeriod: "Last 6 months",
    affectedPopulation: 218,
    severity: "severe",
    riskFactors: ["Economic hardship", "Social isolation", "Mental health conditions"],
    recommendations: ["Harm reduction programs", "Integrated treatment", "Community outreach"],
    lastUpdated: "2024-12-14"
  },
  {
    id: "HT004",
    condition: "Suicide Risk",
    trend: "decreasing",
    percentage: -3.1,
    timePeriod: "Last 6 months",
    affectedPopulation: 45,
    severity: "critical",
    riskFactors: ["Previous attempts", "Mental health conditions", "Access to means"],
    recommendations: ["Crisis intervention", "Safety planning", "Follow-up care"],
    lastUpdated: "2024-12-14"
  }
];

const mockCommunityHealth: CommunityHealth[] = [
  {
    id: "CH001",
    community: "Downtown Metro",
    population: 45000,
    healthScore: 72,
    accessToCare: 85,
    mentalHealthPrevalence: 18.5,
    substanceUseRate: 8.2,
    suicideRate: 12.3,
    socialDeterminants: {
      education: 78,
      income: 65,
      housing: 72,
      transportation: 85,
      foodSecurity: 68
    },
    interventions: ["Mental health awareness campaigns", "Crisis intervention teams", "Community support groups"],
    outcomes: ["Reduced stigma", "Increased help-seeking", "Better crisis response"],
    lastUpdated: "2024-12-14"
  },
  {
    id: "CH002",
    community: "Suburban Heights",
    population: 32000,
    healthScore: 81,
    accessToCare: 92,
    mentalHealthPrevalence: 15.2,
    substanceUseRate: 6.8,
    suicideRate: 9.7,
    socialDeterminants: {
      education: 88,
      income: 82,
      housing: 85,
      transportation: 78,
      foodSecurity: 85
    },
    interventions: ["Workplace wellness programs", "Family counseling services", "Prevention education"],
    outcomes: ["Improved work-life balance", "Stronger family support", "Early intervention"],
    lastUpdated: "2024-12-14"
  },
  {
    id: "CH003",
    community: "Rural Valley",
    population: 18000,
    healthScore: 65,
    accessToCare: 45,
    mentalHealthPrevalence: 22.1,
    substanceUseRate: 12.5,
    suicideRate: 18.9,
    socialDeterminants: {
      education: 62,
      income: 58,
      housing: 65,
      transportation: 45,
      foodSecurity: 72
    },
    interventions: ["Telehealth expansion", "Mobile crisis teams", "Community health workers"],
    outcomes: ["Improved access", "Reduced isolation", "Better crisis management"],
    lastUpdated: "2024-12-14"
  }
];

const mockPopulationMetrics: PopulationMetrics = {
  totalPopulation: 95000,
  activePatients: 4200,
  highRiskPatients: 680,
  averageHealthScore: 73,
  populationGrowth: 2.3,
  healthDisparities: 15.8,
  accessToCare: 74,
  mentalHealthPrevalence: 18.6,
  substanceUseRate: 9.2,
  suicideRate: 13.6
};

// Utility Functions
const getRiskLevelColor = (riskLevel: string) => {
  switch (riskLevel) {
    case 'low': return 'bg-green-500 text-white';
    case 'medium': return 'bg-yellow-500 text-black';
    case 'high': return 'bg-orange-500 text-white';
    case 'critical': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'increasing': return 'text-red-600';
    case 'decreasing': return 'text-green-600';
    case 'stable': return 'text-blue-600';
    default: return 'text-gray-600';
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'mild': return 'bg-green-500 text-white';
    case 'moderate': return 'bg-yellow-500 text-black';
    case 'severe': return 'bg-orange-500 text-white';
    case 'critical': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

export default function PopulationHealthManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState("all");
  const [selectedTrend, setSelectedTrend] = useState("all");
  
  const filteredSegments = mockPopulationSegments.filter(segment => {
    const matchesSearch = segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         segment.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = selectedRiskLevel === "all" || segment.riskLevel === selectedRiskLevel;
    
    return matchesSearch && matchesRisk;
  });

  const filteredTrends = mockHealthTrends.filter(trend => {
    const matchesSearch = trend.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrend = selectedTrend === "all" || trend.trend === selectedTrend;
    
    return matchesSearch && matchesTrend;
  });

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Population Health Management
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive population health analytics and community health monitoring for American psychiatrists
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <BarChart3 className="h-4 w-4 mr-1" />
            Population Analytics
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Target className="h-4 w-4 mr-1" />
            Health Trends
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Population</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPopulationMetrics.totalPopulation.toLocaleString()}</div>
            <p className="text-xs opacity-75 mt-1">+{mockPopulationMetrics.populationGrowth}% growth</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPopulationMetrics.averageHealthScore}%</div>
            <p className="text-xs opacity-75 mt-1">Average population health</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">High Risk Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPopulationMetrics.highRiskPatients}</div>
            <p className="text-xs opacity-75 mt-1">Need immediate attention</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Access to Care</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPopulationMetrics.accessToCare}%</div>
            <p className="text-xs opacity-75 mt-1">Population coverage</p>
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
          <TabsTrigger value="segments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Segments
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="communities" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Communities
          </TabsTrigger>
          <TabsTrigger value="interventions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Interventions
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Population Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Population Overview
                </CardTitle>
                <CardDescription>
                  Key population health metrics and demographics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Patients</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockPopulationMetrics.activePatients / mockPopulationMetrics.totalPopulation) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockPopulationMetrics.activePatients.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">High Risk Patients</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockPopulationMetrics.highRiskPatients / mockPopulationMetrics.activePatients) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockPopulationMetrics.highRiskPatients}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Mental Health Prevalence</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockPopulationMetrics.mentalHealthPrevalence} className="w-20" />
                      <span className="text-sm font-medium">{mockPopulationMetrics.mentalHealthPrevalence}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Substance Use Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockPopulationMetrics.substanceUseRate} className="w-20" />
                      <span className="text-sm font-medium">{mockPopulationMetrics.substanceUseRate}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Disparities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Health Disparities
                </CardTitle>
                <CardDescription>
                  Health equity and access disparities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Health Disparities Index</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockPopulationMetrics.healthDisparities} className="w-20" />
                      <span className="text-sm font-medium">{mockPopulationMetrics.healthDisparities}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Access to Care</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockPopulationMetrics.accessToCare} className="w-20" />
                      <span className="text-sm font-medium">{mockPopulationMetrics.accessToCare}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Suicide Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockPopulationMetrics.suicideRate / 25) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockPopulationMetrics.suicideRate} per 100k</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Population Growth</span>
                    <span className="text-sm font-medium text-green-600">+{mockPopulationMetrics.populationGrowth}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Health Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Health Trends
              </CardTitle>
              <CardDescription>
                Latest population health trends and patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockHealthTrends.slice(0, 3).map((trend) => (
                  <div key={trend.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{trend.condition}</h3>
                      <p className="text-xs text-gray-600">{trend.affectedPopulation} affected • {trend.timePeriod}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTrendColor(trend.trend)}>
                        {trend.trend}
                      </Badge>
                      <Badge className={getSeverityColor(trend.severity)}>
                        {trend.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Population Segments</CardTitle>
              <CardDescription>
                Analyze and manage population segments by demographics and risk factors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Search Segments</label>
                  <Input
                    placeholder="Search by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <div>
                    <label className="text-sm font-medium">Risk Level</label>
                    <select 
                      value={selectedRiskLevel} 
                      onChange={(e) => setSelectedRiskLevel(e.target.value)}
                      className="w-32 mt-1 p-2 border rounded-md text-sm"
                    >
                      <option value="all">All</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Segments List */}
          <div className="grid gap-4">
            {filteredSegments.map((segment) => (
              <Card key={segment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{segment.name}</h3>
                          <Badge className={getRiskLevelColor(segment.riskLevel)}>
                            {segment.riskLevel}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{segment.location} • {segment.ageRange} • {segment.size.toLocaleString()} people</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Average Age:</span>
                            <p className="text-gray-600">{segment.averageAge} years</p>
                          </div>
                          <div>
                            <span className="font-medium">Insurance:</span>
                            <p className="text-gray-600">{segment.insuranceType}</p>
                          </div>
                          <div>
                            <span className="font-medium">Socioeconomic:</span>
                            <p className="text-gray-600">{segment.socioeconomicStatus}</p>
                          </div>
                          <div>
                            <span className="font-medium">Last Updated:</span>
                            <p className="text-gray-600">{segment.lastUpdated}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="font-medium text-sm">Primary Conditions:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {segment.primaryConditions.map((condition, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        Analyze
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Health Trends</CardTitle>
              <CardDescription>
                Monitor health trends and patterns across the population
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Search Conditions</label>
                  <Input
                    placeholder="Search by condition..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <div>
                    <label className="text-sm font-medium">Trend</label>
                    <select 
                      value={selectedTrend} 
                      onChange={(e) => setSelectedTrend(e.target.value)}
                      className="w-32 mt-1 p-2 border rounded-md text-sm"
                    >
                      <option value="all">All</option>
                      <option value="increasing">Increasing</option>
                      <option value="decreasing">Decreasing</option>
                      <option value="stable">Stable</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trends List */}
          <div className="grid gap-4">
            {filteredTrends.map((trend) => (
              <Card key={trend.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{trend.condition}</h3>
                          <Badge className={getTrendColor(trend.trend)}>
                            {trend.trend}
                          </Badge>
                          <Badge className={getSeverityColor(trend.severity)}>
                            {trend.severity}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{trend.affectedPopulation} affected • {trend.timePeriod}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Change:</span>
                            <p className={`font-medium ${getTrendColor(trend.trend)}`}>{trend.percentage > 0 ? '+' : ''}{trend.percentage}%</p>
                          </div>
                          <div>
                            <span className="font-medium">Affected:</span>
                            <p className="text-gray-600">{trend.affectedPopulation.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="font-medium">Period:</span>
                            <p className="text-gray-600">{trend.timePeriod}</p>
                          </div>
                          <div>
                            <span className="font-medium">Last Updated:</span>
                            <p className="text-gray-600">{trend.lastUpdated}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="font-medium text-sm">Risk Factors:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {trend.riskFactors.map((factor, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="font-medium text-sm">Recommendations:</span>
                          <ul className="text-sm text-gray-600 mt-1 space-y-1">
                            {trend.recommendations.map((rec, index) => (
                              <li key={index}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        Analyze
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Communities Tab */}
        <TabsContent value="communities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Community Health
              </CardTitle>
              <CardDescription>
                Community health analysis and social determinants of health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockCommunityHealth.map((community) => (
                  <div key={community.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-6 w-6 text-purple-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{community.community}</h3>
                          <p className="text-gray-600">{community.population.toLocaleString()} population</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          Health Score: {community.healthScore}%
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          Access: {community.accessToCare}%
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{community.mentalHealthPrevalence}%</div>
                        <div className="text-sm text-gray-600">Mental Health Prevalence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{community.substanceUseRate}%</div>
                        <div className="text-sm text-gray-600">Substance Use Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{community.suicideRate}</div>
                        <div className="text-sm text-gray-600">Suicide Rate (per 100k)</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <span className="font-medium">Social Determinants:</span>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{community.socialDeterminants.education}%</div>
                          <div className="text-xs text-gray-600">Education</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{community.socialDeterminants.income}%</div>
                          <div className="text-xs text-gray-600">Income</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{community.socialDeterminants.housing}%</div>
                          <div className="text-xs text-gray-600">Housing</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">{community.socialDeterminants.transportation}%</div>
                          <div className="text-xs text-gray-600">Transportation</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">{community.socialDeterminants.foodSecurity}%</div>
                          <div className="text-xs text-gray-600">Food Security</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <span className="font-medium">Interventions:</span>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        {community.interventions.map((intervention, index) => (
                          <li key={index}>• {intervention}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-4">
                      <span className="font-medium">Outcomes:</span>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        {community.outcomes.map((outcome, index) => (
                          <li key={index}>• {outcome}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        Analyze
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interventions Tab */}
        <TabsContent value="interventions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Intervention Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Intervention Recommendations
                </CardTitle>
                <CardDescription>
                  Evidence-based interventions for population health improvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">High Priority Interventions</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Expand telehealth access in rural areas</li>
                      <li>• Implement universal mental health screening</li>
                      <li>• Establish crisis intervention teams</li>
                      <li>• Develop community support networks</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Medium Priority Interventions</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Workplace mental health programs</li>
                      <li>• School-based prevention programs</li>
                      <li>• Family counseling services</li>
                      <li>• Digital wellness initiatives</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Long-term Strategies</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Policy advocacy for mental health parity</li>
                      <li>• Social determinants of health programs</li>
                      <li>• Research and data collection</li>
                      <li>• Professional development and training</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Success Metrics
                </CardTitle>
                <CardDescription>
                  Key performance indicators for population health interventions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Reduction in Suicide Rate</span>
                      <div className="flex items-center gap-2">
                        <Progress value={75} className="w-20" />
                        <span className="text-sm font-medium text-green-600">-25%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Improved Access to Care</span>
                      <div className="flex items-center gap-2">
                        <Progress value={80} className="w-20" />
                        <span className="text-sm font-medium text-green-600">+15%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Reduced Stigma</span>
                      <div className="flex items-center gap-2">
                        <Progress value={65} className="w-20" />
                        <span className="text-sm font-medium text-green-600">+20%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Early Intervention</span>
                      <div className="flex items-center gap-2">
                        <Progress value={90} className="w-20" />
                        <span className="text-sm font-medium text-green-600">+30%</span>
                      </div>
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






