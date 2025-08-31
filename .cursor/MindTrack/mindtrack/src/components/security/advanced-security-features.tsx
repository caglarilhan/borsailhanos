"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Shield, Target, AlertTriangle, CheckCircle, XCircle, Clock, Calendar, User, Users,
  Settings, Plus, Download, Upload, RefreshCw, Save, Bell, BellOff, ShieldCheck,
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
interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'login' | 'logout' | 'data_access' | 'data_modification' | 'failed_login' | 'suspicious_activity' | 'breach_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: string;
  ipAddress: string;
  location: string;
  device: string;
  description: string;
  status: 'resolved' | 'investigating' | 'open';
  actionRequired: boolean;
}

interface SecurityPolicy {
  id: string;
  name: string;
  category: 'authentication' | 'authorization' | 'data_protection' | 'network' | 'compliance';
  description: string;
  status: 'active' | 'inactive' | 'draft';
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: string;
  compliance: 'hipaa' | 'gdpr' | 'sox' | 'pci' | 'none';
  enforcement: 'automatic' | 'manual' | 'semi-automatic';
}

interface BiometricAuth {
  id: string;
  type: 'fingerprint' | 'facial_recognition' | 'voice_recognition' | 'retina_scan';
  status: 'enabled' | 'disabled' | 'pending';
  lastUsed: string;
  successRate: number;
  falsePositiveRate: number;
  user: string;
  device: string;
  securityLevel: 'basic' | 'standard' | 'high' | 'enterprise';
}

interface SecurityMetrics {
  totalIncidents: number;
  resolvedIncidents: number;
  openIncidents: number;
  criticalIncidents: number;
  averageResponseTime: number;
  securityScore: number;
  complianceScore: number;
  lastBreachAttempt: string;
  activeThreats: number;
  blockedAttacks: number;
}

// Mock Data
const mockSecurityEvents: SecurityEvent[] = [
  {
    id: "SE001",
    timestamp: "2024-12-14T10:30:00Z",
    type: "login",
    severity: "low",
    user: "dr.sarah.johnson",
    ipAddress: "192.168.1.100",
    location: "New York, NY",
    device: "MacBook Pro",
    description: "Successful login from authorized device",
    status: "resolved",
    actionRequired: false
  },
  {
    id: "SE002",
    timestamp: "2024-12-14T09:15:00Z",
    type: "failed_login",
    severity: "medium",
    user: "unknown",
    ipAddress: "203.45.67.89",
    location: "Unknown",
    device: "Unknown",
    description: "Multiple failed login attempts from suspicious IP",
    status: "investigating",
    actionRequired: true
  },
  {
    id: "SE003",
    timestamp: "2024-12-14T08:45:00Z",
    type: "data_access",
    severity: "low",
    user: "dr.michael.chen",
    ipAddress: "192.168.1.105",
    location: "Boston, MA",
    device: "iPhone 15",
    description: "Patient record accessed during authorized session",
    status: "resolved",
    actionRequired: false
  },
  {
    id: "SE004",
    timestamp: "2024-12-14T07:20:00Z",
    type: "suspicious_activity",
    severity: "high",
    user: "dr.emily.rodriguez",
    ipAddress: "192.168.1.110",
    location: "Los Angeles, CA",
    device: "Windows PC",
    description: "Unusual data export pattern detected",
    status: "investigating",
    actionRequired: true
  },
  {
    id: "SE005",
    timestamp: "2024-12-14T06:30:00Z",
    type: "breach_attempt",
    severity: "critical",
    user: "unknown",
    ipAddress: "185.67.23.45",
    location: "Unknown",
    device: "Unknown",
    description: "SQL injection attempt detected and blocked",
    status: "resolved",
    actionRequired: false
  }
];

const mockSecurityPolicies: SecurityPolicy[] = [
  {
    id: "SP001",
    name: "Multi-Factor Authentication",
    category: "authentication",
    description: "Require MFA for all user logins",
    status: "active",
    priority: "high",
    lastUpdated: "2024-12-01",
    compliance: "hipaa",
    enforcement: "automatic"
  },
  {
    id: "SP002",
    name: "Data Encryption at Rest",
    category: "data_protection",
    description: "Encrypt all patient data stored in database",
    status: "active",
    priority: "critical",
    lastUpdated: "2024-11-15",
    compliance: "hipaa",
    enforcement: "automatic"
  },
  {
    id: "SP003",
    name: "Session Timeout",
    category: "authorization",
    description: "Automatically log out users after 30 minutes of inactivity",
    status: "active",
    priority: "medium",
    lastUpdated: "2024-10-20",
    compliance: "hipaa",
    enforcement: "automatic"
  },
  {
    id: "SP004",
    name: "Audit Logging",
    category: "compliance",
    description: "Log all data access and modifications for audit purposes",
    status: "active",
    priority: "high",
    lastUpdated: "2024-09-30",
    compliance: "hipaa",
    enforcement: "automatic"
  },
  {
    id: "SP005",
    name: "Network Segmentation",
    category: "network",
    description: "Isolate patient data network from general office network",
    status: "active",
    priority: "critical",
    lastUpdated: "2024-08-15",
    compliance: "hipaa",
    enforcement: "automatic"
  }
];

const mockBiometricAuth: BiometricAuth[] = [
  {
    id: "BA001",
    type: "fingerprint",
    status: "enabled",
    lastUsed: "2024-12-14T10:30:00Z",
    successRate: 98.5,
    falsePositiveRate: 0.1,
    user: "dr.sarah.johnson",
    device: "MacBook Pro",
    securityLevel: "enterprise"
  },
  {
    id: "BA002",
    type: "facial_recognition",
    status: "enabled",
    lastUsed: "2024-12-14T09:45:00Z",
    successRate: 95.2,
    falsePositiveRate: 0.3,
    user: "dr.michael.chen",
    device: "iPhone 15",
    securityLevel: "high"
  },
  {
    id: "BA003",
    type: "voice_recognition",
    status: "disabled",
    lastUsed: "2024-12-13T16:20:00Z",
    successRate: 92.1,
    falsePositiveRate: 0.5,
    user: "dr.emily.rodriguez",
    device: "Windows PC",
    securityLevel: "standard"
  }
];

const mockSecurityMetrics: SecurityMetrics = {
  totalIncidents: 45,
  resolvedIncidents: 42,
  openIncidents: 3,
  criticalIncidents: 1,
  averageResponseTime: 2.5,
  securityScore: 94,
  complianceScore: 98,
  lastBreachAttempt: "2024-12-14T06:30:00Z",
  activeThreats: 2,
  blockedAttacks: 156
};

// Utility Functions
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'low': return 'bg-green-500 text-white';
    case 'medium': return 'bg-yellow-500 text-black';
    case 'high': return 'bg-orange-500 text-white';
    case 'critical': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'resolved': return 'bg-green-500 text-white';
    case 'investigating': return 'bg-yellow-500 text-black';
    case 'open': return 'bg-red-500 text-white';
    case 'active': return 'bg-green-500 text-white';
    case 'inactive': return 'bg-gray-500 text-white';
    case 'draft': return 'bg-blue-500 text-white';
    case 'enabled': return 'bg-green-500 text-white';
    case 'disabled': return 'bg-red-500 text-white';
    case 'pending': return 'bg-yellow-500 text-black';
    default: return 'bg-gray-500 text-white';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low': return 'bg-green-500 text-white';
    case 'medium': return 'bg-yellow-500 text-black';
    case 'high': return 'bg-orange-500 text-white';
    case 'critical': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getComplianceColor = (compliance: string) => {
  switch (compliance) {
    case 'hipaa': return 'bg-blue-500 text-white';
    case 'gdpr': return 'bg-purple-500 text-white';
    case 'sox': return 'bg-green-500 text-white';
    case 'pci': return 'bg-orange-500 text-white';
    case 'none': return 'bg-gray-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

export default function AdvancedSecurityFeatures() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const filteredEvents = mockSecurityEvents.filter(event => {
    const matchesSearch = event.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === "all" || event.severity === selectedSeverity;
    const matchesStatus = selectedStatus === "all" || event.status === selectedStatus;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-red-50 via-white to-orange-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-600" />
            Advanced Security Features
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive security and compliance management for American psychiatrists
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <ShieldCheck className="h-4 w-4 mr-1" />
            HIPAA Compliant
          </Badge>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <Lock className="h-4 w-4 mr-1" />
            Zero Trust
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Security Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSecurityMetrics.securityScore}%</div>
            <p className="text-xs opacity-75 mt-1">Excellent security posture</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSecurityMetrics.complianceScore}%</div>
            <p className="text-xs opacity-75 mt-1">HIPAA compliant</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Blocked Attacks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSecurityMetrics.blockedAttacks}</div>
            <p className="text-xs opacity-75 mt-1">This month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSecurityMetrics.averageResponseTime}h</div>
            <p className="text-xs opacity-75 mt-1">Average response</p>
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
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="biometric" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Biometric
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Overview
                </CardTitle>
                <CardDescription>
                  Current security status and metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Incidents</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockSecurityMetrics.resolvedIncidents / mockSecurityMetrics.totalIncidents) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockSecurityMetrics.totalIncidents}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Resolved Incidents</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockSecurityMetrics.resolvedIncidents / mockSecurityMetrics.totalIncidents) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockSecurityMetrics.resolvedIncidents}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Open Incidents</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockSecurityMetrics.openIncidents / mockSecurityMetrics.totalIncidents) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockSecurityMetrics.openIncidents}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Critical Incidents</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockSecurityMetrics.criticalIncidents / mockSecurityMetrics.totalIncidents) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockSecurityMetrics.criticalIncidents}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Threat Intelligence */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Threat Intelligence
                </CardTitle>
                <CardDescription>
                  Active threats and security alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Threats</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockSecurityMetrics.activeThreats / 10) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockSecurityMetrics.activeThreats}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Blocked Attacks</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockSecurityMetrics.blockedAttacks / 200) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockSecurityMetrics.blockedAttacks}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Last Breach Attempt</span>
                    <span className="text-sm font-medium text-green-600">Blocked</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Response Time</span>
                    <span className="text-sm font-medium">{mockSecurityMetrics.averageResponseTime} hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Security Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Security Events
              </CardTitle>
              <CardDescription>
                Latest security events and incidents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSecurityEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Shield className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{event.description}</h3>
                      <p className="text-xs text-gray-600">{event.user} • {event.ipAddress}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>
                Monitor and manage security events and incidents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Search Events</label>
                  <Input
                    placeholder="Search by user or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <div>
                    <label className="text-sm font-medium">Severity</label>
                    <select 
                      value={selectedSeverity} 
                      onChange={(e) => setSelectedSeverity(e.target.value)}
                      className="w-32 mt-1 p-2 border rounded-md text-sm"
                    >
                      <option value="all">All</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
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
                      <option value="resolved">Resolved</option>
                      <option value="investigating">Investigating</option>
                      <option value="open">Open</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <div className="grid gap-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Shield className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{event.type.replace('_', ' ')}</h3>
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{event.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">User:</span>
                            <p className="text-gray-600">{event.user}</p>
                          </div>
                          <div>
                            <span className="font-medium">IP Address:</span>
                            <p className="text-gray-600">{event.ipAddress}</p>
                          </div>
                          <div>
                            <span className="font-medium">Location:</span>
                            <p className="text-gray-600">{event.location}</p>
                          </div>
                          <div>
                            <span className="font-medium">Device:</span>
                            <p className="text-gray-600">{event.device}</p>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Timestamp:</span>
                          <p className="text-gray-600">{event.timestamp}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        Investigate
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

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Policies
              </CardTitle>
              <CardDescription>
                Manage security policies and compliance requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockSecurityPolicies.map((policy) => (
                  <div key={policy.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Shield className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{policy.name}</h3>
                          <p className="text-gray-600">{policy.category.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(policy.priority)}>
                          {policy.priority}
                        </Badge>
                        <Badge className={getStatusColor(policy.status)}>
                          {policy.status}
                        </Badge>
                        <Badge className={getComplianceColor(policy.compliance)}>
                          {policy.compliance.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <span className="font-medium">Description:</span>
                      <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="font-medium">Enforcement:</span>
                        <p className="text-gray-600">{policy.enforcement}</p>
                      </div>
                      <div>
                        <span className="font-medium">Last Updated:</span>
                        <p className="text-gray-600">{policy.lastUpdated}</p>
                      </div>
                      <div>
                        <span className="font-medium">Compliance:</span>
                        <p className="text-gray-600">{policy.compliance.toUpperCase()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        Edit Policy
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Biometric Tab */}
        <TabsContent value="biometric" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Biometric Authentication
              </CardTitle>
              <CardDescription>
                Manage biometric authentication methods and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockBiometricAuth.map((auth) => (
                  <div key={auth.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Key className="h-6 w-6 text-purple-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{auth.type.replace('_', ' ')}</h3>
                          <p className="text-gray-600">{auth.user} • {auth.device}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(auth.status)}>
                          {auth.status}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800">
                          {auth.securityLevel}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{auth.successRate}%</div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{auth.falsePositiveRate}%</div>
                        <div className="text-sm text-gray-600">False Positive</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{auth.lastUsed}</div>
                        <div className="text-sm text-gray-600">Last Used</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{auth.securityLevel}</div>
                        <div className="text-sm text-gray-600">Security Level</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* HIPAA Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  HIPAA Compliance
                </CardTitle>
                <CardDescription>
                  HIPAA compliance status and requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Compliance</span>
                    <div className="flex items-center gap-2">
                      <Progress value={98} className="w-20" />
                      <span className="text-sm font-medium text-green-600">98%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Data Encryption</span>
                    <span className="text-sm font-medium text-green-600">✓ Compliant</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Access Controls</span>
                    <span className="text-sm font-medium text-green-600">✓ Compliant</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Audit Logging</span>
                    <span className="text-sm font-medium text-green-600">✓ Compliant</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Training Requirements</span>
                    <span className="text-sm font-medium text-yellow-600">⚠ Due Soon</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Security Recommendations
                </CardTitle>
                <CardDescription>
                  Actionable security improvements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Strong Security Posture</h4>
                    <p className="text-sm text-green-700">
                      Current security measures are effective. Continue monitoring and regular updates.
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Update Training</h4>
                    <p className="text-sm text-yellow-700">
                      Schedule HIPAA training refresher for all staff members.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Consider Advanced Features</h4>
                    <p className="text-sm text-blue-700">
                      Evaluate implementing advanced threat detection and response capabilities.
                    </p>
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
