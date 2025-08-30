"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Network, Users, Target, AlertTriangle, CheckCircle, XCircle, Clock, Calendar, User,
  Settings, Plus, Download, Upload, RefreshCw, Save, Bell, BellOff, Shield, ShieldCheck,
  ShieldAlert, ShieldX, Lock, Unlock, Key, Eye, EyeOff, Database, Server, Activity,
  BarChart3, TrendingUp, TrendingDown, FileText, BookOpen, MapPin, Phone, Mail, MessageSquare,
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
interface HealthcareProvider {
  id: string;
  name: string;
  specialty: string;
  organization: string;
  location: string;
  phone: string;
  email: string;
  insuranceAccepted: string[];
  availability: 'available' | 'limited' | 'unavailable';
  rating: number;
  responseTime: number;
  status: 'active' | 'inactive' | 'pending';
  lastUpdated: string;
}

interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  specialty: string;
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  dateCreated: string;
  dateAccepted?: string;
  notes: string;
  insuranceVerified: boolean;
}

interface NetworkMetrics {
  totalProviders: number;
  activeReferrals: number;
  averageResponseTime: number;
  acceptanceRate: number;
  insuranceCoverage: number;
  patientSatisfaction: number;
  networkGrowth: number;
  referralSuccess: number;
}

interface InsuranceNetwork {
  id: string;
  name: string;
  type: 'commercial' | 'medicare' | 'medicaid' | 'private';
  coverage: number;
  providers: number;
  status: 'active' | 'inactive' | 'pending';
  lastVerified: string;
}

// Mock Data
const mockHealthcareProviders: HealthcareProvider[] = [
  {
    id: "HP001",
    name: "Dr. Sarah Williams",
    specialty: "Cardiology",
    organization: "HeartCare Medical Center",
    location: "New York, NY",
    phone: "(212) 555-0123",
    email: "sarah.williams@heartcare.com",
    insuranceAccepted: ["Blue Cross Blue Shield", "Aetna", "Cigna"],
    availability: "available",
    rating: 4.8,
    responseTime: 2,
    status: "active",
    lastUpdated: "2024-12-10"
  },
  {
    id: "HP002",
    name: "Dr. Michael Chen",
    specialty: "Neurology",
    organization: "NeuroCare Institute",
    location: "Los Angeles, CA",
    phone: "(310) 555-0456",
    email: "michael.chen@neurocare.com",
    insuranceAccepted: ["Blue Cross Blue Shield", "UnitedHealth", "Humana"],
    availability: "limited",
    rating: 4.6,
    responseTime: 4,
    status: "active",
    lastUpdated: "2024-12-08"
  },
  {
    id: "HP003",
    name: "Dr. Emily Rodriguez",
    specialty: "Endocrinology",
    organization: "Diabetes & Endocrine Center",
    location: "Chicago, IL",
    phone: "(312) 555-0789",
    email: "emily.rodriguez@endocrine.com",
    insuranceAccepted: ["Medicare", "Medicaid", "Blue Cross Blue Shield"],
    availability: "available",
    rating: 4.9,
    responseTime: 1,
    status: "active",
    lastUpdated: "2024-12-09"
  },
  {
    id: "HP004",
    name: "Dr. James Thompson",
    specialty: "Orthopedics",
    organization: "Sports Medicine Center",
    location: "Miami, FL",
    phone: "(305) 555-0321",
    email: "james.thompson@sportsmed.com",
    insuranceAccepted: ["Aetna", "Cigna", "Humana"],
    availability: "unavailable",
    rating: 4.7,
    responseTime: 6,
    status: "active",
    lastUpdated: "2024-12-05"
  }
];

const mockReferrals: Referral[] = [
  {
    id: "REF001",
    patientId: "P001",
    patientName: "Sarah Johnson",
    providerId: "HP001",
    providerName: "Dr. Sarah Williams",
    specialty: "Cardiology",
    reason: "Chest pain evaluation",
    urgency: "urgent",
    status: "accepted",
    dateCreated: "2024-12-08",
    dateAccepted: "2024-12-09",
    notes: "Patient experiencing chest pain, needs cardiac evaluation",
    insuranceVerified: true
  },
  {
    id: "REF002",
    patientId: "P002",
    patientName: "Michael Chen",
    providerId: "HP002",
    providerName: "Dr. Michael Chen",
    specialty: "Neurology",
    reason: "Headache evaluation",
    urgency: "routine",
    status: "pending",
    dateCreated: "2024-12-10",
    notes: "Chronic headaches, possible migraine",
    insuranceVerified: true
  },
  {
    id: "REF003",
    patientId: "P003",
    patientName: "Emily Rodriguez",
    providerId: "HP003",
    providerName: "Dr. Emily Rodriguez",
    specialty: "Endocrinology",
    reason: "Diabetes management",
    urgency: "routine",
    status: "completed",
    dateCreated: "2024-12-05",
    dateAccepted: "2024-12-06",
    notes: "Diabetes management consultation completed",
    insuranceVerified: true
  }
];

const mockNetworkMetrics: NetworkMetrics = {
  totalProviders: 156,
  activeReferrals: 23,
  averageResponseTime: 2.8,
  acceptanceRate: 94.5,
  insuranceCoverage: 98.2,
  patientSatisfaction: 4.7,
  networkGrowth: 12.5,
  referralSuccess: 89.3
};

const mockInsuranceNetworks: InsuranceNetwork[] = [
  {
    id: "INS001",
    name: "Blue Cross Blue Shield",
    type: "commercial",
    coverage: 95.5,
    providers: 89,
    status: "active",
    lastVerified: "2024-12-01"
  },
  {
    id: "INS002",
    name: "Medicare",
    type: "medicare",
    coverage: 98.2,
    providers: 134,
    status: "active",
    lastVerified: "2024-12-01"
  },
  {
    id: "INS003",
    name: "Medicaid",
    type: "medicaid",
    coverage: 92.8,
    providers: 67,
    status: "active",
    lastVerified: "2024-12-01"
  },
  {
    id: "INS004",
    name: "Aetna",
    type: "commercial",
    coverage: 91.3,
    providers: 76,
    status: "active",
    lastVerified: "2024-12-01"
  }
];

// Utility Functions
const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'emergency': return 'bg-red-500 text-white';
    case 'urgent': return 'bg-orange-500 text-white';
    case 'routine': return 'bg-green-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'accepted': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-blue-100 text-blue-800';
    case 'declined': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getAvailabilityColor = (availability: string) => {
  switch (availability) {
    case 'available': return 'bg-green-500 text-white';
    case 'limited': return 'bg-yellow-500 text-black';
    case 'unavailable': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getInsuranceTypeColor = (type: string) => {
  switch (type) {
    case 'commercial': return 'bg-blue-500 text-white';
    case 'medicare': return 'bg-green-500 text-white';
    case 'medicaid': return 'bg-purple-500 text-white';
    case 'private': return 'bg-orange-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

export default function HealthcareNetworkIntegration() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const filteredProviders = mockHealthcareProviders.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "all" || provider.specialty === selectedSpecialty;
    const matchesStatus = selectedStatus === "all" || provider.status === selectedStatus;
    
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const pendingReferrals = mockReferrals.filter(r => r.status === 'pending').length;
  const acceptedReferrals = mockReferrals.filter(r => r.status === 'accepted').length;
  const completedReferrals = mockReferrals.filter(r => r.status === 'completed').length;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-green-50 via-white to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Network className="h-8 w-8 text-green-600" />
            Healthcare Network Integration
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive healthcare provider network and referral management system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <ShieldCheck className="h-4 w-4 mr-1" />
            HIPAA Compliant
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <CheckCircle className="h-4 w-4 mr-1" />
            Network Verified
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Network Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockNetworkMetrics.totalProviders}</div>
            <p className="text-xs opacity-75 mt-1">+{mockNetworkMetrics.networkGrowth}% this month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Active Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockNetworkMetrics.activeReferrals}</div>
            <p className="text-xs opacity-75 mt-1">{mockNetworkMetrics.acceptanceRate}% acceptance rate</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockNetworkMetrics.averageResponseTime}h</div>
            <p className="text-xs opacity-75 mt-1">Average response time</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Insurance Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockNetworkMetrics.insuranceCoverage}%</div>
            <p className="text-xs opacity-75 mt-1">Network coverage</p>
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
          <TabsTrigger value="providers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Providers
          </TabsTrigger>
          <TabsTrigger value="referrals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Referrals
          </TabsTrigger>
          <TabsTrigger value="insurance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Insurance
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Network Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Network Status
                </CardTitle>
                <CardDescription>
                  Current healthcare network performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{mockNetworkMetrics.totalProviders}</div>
                    <div className="text-sm text-gray-600">Total Providers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{mockNetworkMetrics.activeReferrals}</div>
                    <div className="text-sm text-gray-600">Active Referrals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{mockNetworkMetrics.averageResponseTime}h</div>
                    <div className="text-sm text-gray-600">Avg Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{mockNetworkMetrics.acceptanceRate}%</div>
                    <div className="text-sm text-gray-600">Acceptance Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Referrals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recent Referrals
                </CardTitle>
                <CardDescription>
                  Latest referral activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockReferrals.slice(0, 3).map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">{referral.patientName}</p>
                        <p className="text-xs text-gray-600">{referral.providerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getUrgencyColor(referral.urgency)}>
                        {referral.urgency}
                      </Badge>
                      <Badge className={getStatusColor(referral.status)}>
                        {referral.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Insurance Networks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Insurance Network Coverage
              </CardTitle>
              <CardDescription>
                Insurance network performance and coverage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mockInsuranceNetworks.map((network) => (
                  <div key={network.id} className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-semibold mb-2">{network.name}</div>
                    <Badge className={getInsuranceTypeColor(network.type)}>
                      {network.type}
                    </Badge>
                    <div className="mt-2">
                      <div className="text-2xl font-bold text-blue-600">{network.coverage}%</div>
                      <div className="text-sm text-gray-600">Coverage</div>
                    </div>
                    <div className="mt-1">
                      <div className="text-sm font-medium">{network.providers}</div>
                      <div className="text-xs text-gray-600">Providers</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Healthcare Providers</CardTitle>
              <CardDescription>
                Browse and manage healthcare provider network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Search Providers</label>
                  <Input
                    placeholder="Search by name, specialty, or organization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <div>
                    <label className="text-sm font-medium">Specialty</label>
                    <select 
                      value={selectedSpecialty} 
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-32 mt-1 p-2 border rounded-md text-sm"
                    >
                      <option value="all">All</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Endocrinology">Endocrinology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Gastroenterology">Gastroenterology</option>
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
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Providers List */}
          <div className="grid gap-4">
            {filteredProviders.map((provider) => (
              <Card key={provider.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{provider.name}</h3>
                          <Badge className="bg-blue-100 text-blue-800">
                            {provider.specialty}
                          </Badge>
                          <Badge className={getAvailabilityColor(provider.availability)}>
                            {provider.availability}
                          </Badge>
                          <Badge className={getStatusColor(provider.status)}>
                            {provider.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{provider.organization}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Location:</span>
                            <p className="text-gray-600">{provider.location}</p>
                          </div>
                          <div>
                            <span className="font-medium">Phone:</span>
                            <p className="text-gray-600">{provider.phone}</p>
                          </div>
                          <div>
                            <span className="font-medium">Rating:</span>
                            <p className="text-gray-600">{provider.rating}/5.0</p>
                          </div>
                          <div>
                            <span className="font-medium">Response:</span>
                            <p className="text-gray-600">{provider.responseTime}h</p>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Insurance Accepted:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {provider.insuranceAccepted.map((insurance, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {insurance}
                              </Badge>
                            ))}
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
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-6">
          {/* Referral Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8" />
                  <div>
                    <p className="text-sm opacity-90">Pending</p>
                    <p className="text-2xl font-bold">{pendingReferrals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8" />
                  <div>
                    <p className="text-sm opacity-90">Accepted</p>
                    <p className="text-2xl font-bold">{acceptedReferrals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8" />
                  <div>
                    <p className="text-sm opacity-90">Completed</p>
                    <p className="text-2xl font-bold">{completedReferrals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referrals List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Referral Management
              </CardTitle>
              <CardDescription>
                Track and manage patient referrals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReferrals.map((referral) => (
                  <div key={referral.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-semibold">{referral.patientName}</h3>
                          <p className="text-sm text-gray-600">{referral.providerName} - {referral.specialty}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getUrgencyColor(referral.urgency)}>
                          {referral.urgency}
                        </Badge>
                        <Badge className={getStatusColor(referral.status)}>
                          {referral.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Reason:</span>
                        <p className="text-gray-600">{referral.reason}</p>
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>
                        <p className="text-gray-600">{referral.dateCreated}</p>
                      </div>
                      <div>
                        <span className="font-medium">Insurance:</span>
                        <Badge className={referral.insuranceVerified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {referral.insuranceVerified ? "Verified" : "Not Verified"}
                        </Badge>
                      </div>
                    </div>
                    
                    {referral.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="font-medium text-sm">Notes:</span>
                        <p className="text-sm text-gray-600 mt-1">{referral.notes}</p>
                      </div>
                    )}
                    
                    <div className="mt-3 flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Contact Provider
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

        {/* Insurance Tab */}
        <TabsContent value="insurance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Insurance Network Management
              </CardTitle>
              <CardDescription>
                Manage insurance networks and coverage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockInsuranceNetworks.map((network) => (
                  <div key={network.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Shield className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{network.name}</h3>
                          <p className="text-gray-600">Insurance Network</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getInsuranceTypeColor(network.type)}>
                          {network.type}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          {network.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{network.coverage}%</div>
                        <div className="text-sm text-gray-600">Coverage Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{network.providers}</div>
                        <div className="text-sm text-gray-600">Network Providers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">Last Verified</div>
                        <div className="text-sm text-gray-600">{network.lastVerified}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View Network
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Update Coverage
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Analytics
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
            {/* Network Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Network Performance
                </CardTitle>
                <CardDescription>
                  Key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Acceptance Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockNetworkMetrics.acceptanceRate} className="w-20" />
                      <span className="text-sm font-medium">{mockNetworkMetrics.acceptanceRate}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Response Time</span>
                    <div className="flex items-center gap-2">
                      <Progress value={100 - (mockNetworkMetrics.averageResponseTime * 10)} className="w-20" />
                      <span className="text-sm font-medium">{mockNetworkMetrics.averageResponseTime}h</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Patient Satisfaction</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockNetworkMetrics.patientSatisfaction * 20} className="w-20" />
                      <span className="text-sm font-medium">{mockNetworkMetrics.patientSatisfaction}/5.0</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Referral Success</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockNetworkMetrics.referralSuccess} className="w-20" />
                      <span className="text-sm font-medium">{mockNetworkMetrics.referralSuccess}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Network Growth
                </CardTitle>
                <CardDescription>
                  Network expansion metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">+{mockNetworkMetrics.networkGrowth}%</div>
                    <div className="text-sm text-gray-600">Monthly Growth</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{mockNetworkMetrics.totalProviders}</div>
                      <div className="text-xs text-gray-600">Total Providers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{mockNetworkMetrics.insuranceCoverage}%</div>
                      <div className="text-xs text-gray-600">Insurance Coverage</div>
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
