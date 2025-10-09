"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Zap, Target, AlertTriangle, CheckCircle, XCircle, Clock, Calendar, User, Users, Settings, Plus, Download, Upload, RefreshCw, Save, Bell, BellOff, Shield, ShieldCheck,
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
  FileSettingsCircle, FileInfoCircle, FileAlertCircle, Globe, Cpu, Memory, HardDrive,
  Wifi, Cloud, BarChart, PieChart, LineChart, ScatterChart, AreaChart, Table, List, Grid,
  Columns, Rows, SortAsc, SortDesc
} from "lucide-react";

// Interfaces
interface Workflow {
  id: string;
  name: string;
  category: 'patient_care' | 'administrative' | 'clinical' | 'billing' | 'compliance' | 'custom';
  description: string;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  lastModified: string;
  createdBy: string;
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'task' | 'approval' | 'notification' | 'integration' | 'condition' | 'action' | 'wait';
  description: string;
  order: number;
  isRequired: boolean;
  assignee: string;
  estimatedTime: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  dependencies: string[];
  actions: WorkflowAction[];
}

interface WorkflowTrigger {
  id: string;
  name: string;
  type: 'event' | 'schedule' | 'manual' | 'condition' | 'webhook';
  description: string;
  isActive: boolean;
  conditions: WorkflowCondition[];
  parameters: Record<string, any>;
}

interface WorkflowCondition {
  id: string;
  name: string;
  type: 'field_comparison' | 'date_range' | 'user_role' | 'status_check' | 'custom';
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: string;
  logic: 'and' | 'or';
}

interface WorkflowAction {
  id: string;
  name: string;
  type: 'send_email' | 'send_sms' | 'create_task' | 'update_field' | 'trigger_integration' | 'schedule_appointment' | 'generate_document' | 'send_notification';
  description: string;
  parameters: Record<string, any>;
  delay: number;
  retryCount: number;
  isRequired: boolean;
}

interface ProcessTemplate {
  id: string;
  name: string;
  category: 'intake' | 'treatment' | 'discharge' | 'followup' | 'billing' | 'compliance';
  description: string;
  isActive: boolean;
  isDefault: boolean;
  steps: ProcessStep[];
  estimatedDuration: number;
  requiredRoles: string[];
  lastModified: string;
  usageCount: number;
}

interface ProcessStep {
  id: string;
  name: string;
  type: 'form' | 'review' | 'approval' | 'notification' | 'integration' | 'document';
  description: string;
  order: number;
  isRequired: boolean;
  assignee: string;
  estimatedTime: number;
  dependencies: string[];
}

interface AutomationMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  automatedProcesses: number;
  manualProcesses: number;
  averageExecutionTime: number;
  successRate: number;
  timeSaved: number;
  efficiencyGain: number;
}

// Mock Data
const mockWorkflows: Workflow[] = [
  {
    id: "WF001",
    name: "Patient Intake Process",
    category: "patient_care",
    description: "Automated patient intake workflow with document collection and initial assessment",
    status: "active",
    priority: "high",
    steps: [
      {
        id: "WS001",
        name: "Complete Intake Form",
        type: "task",
        description: "Patient completes online intake form",
        order: 1,
        isRequired: true,
        assignee: "patient",
        estimatedTime: 15,
        status: "completed",
        dependencies: [],
        actions: []
      },
      {
        id: "WS002",
        name: "Review by Provider",
        type: "approval",
        description: "Provider reviews intake information",
        order: 2,
        isRequired: true,
        assignee: "provider",
        estimatedTime: 10,
        status: "completed",
        dependencies: ["WS001"],
        actions: []
      },
      {
        id: "WS003",
        name: "Schedule Initial Appointment",
        type: "action",
        description: "Automatically schedule initial consultation",
        order: 3,
        isRequired: true,
        assignee: "system",
        estimatedTime: 2,
        status: "completed",
        dependencies: ["WS002"],
        actions: [
          {
            id: "WA001",
            name: "Send Confirmation Email",
            type: "send_email",
            description: "Send appointment confirmation to patient",
            parameters: { "template": "appointment_confirmation" },
            delay: 0,
            retryCount: 3,
            isRequired: true
          }
        ]
      }
    ],
    triggers: [
      {
        id: "WT001",
        name: "New Patient Registration",
        type: "event",
        description: "Triggered when new patient registers",
        isActive: true,
        conditions: [],
        parameters: {}
      }
    ],
    conditions: [],
    actions: [],
    lastModified: "2024-12-14",
    createdBy: "dr.sarah.johnson",
    executionCount: 156,
    successRate: 94.2,
    averageExecutionTime: 8.5
  },
  {
    id: "WF002",
    name: "Treatment Plan Approval",
    category: "clinical",
    description: "Multi-step approval process for treatment plan changes",
    status: "active",
    priority: "critical",
    steps: [
      {
        id: "WS004",
        name: "Create Treatment Plan",
        type: "task",
        description: "Provider creates or updates treatment plan",
        order: 1,
        isRequired: true,
        assignee: "provider",
        estimatedTime: 20,
        status: "completed",
        dependencies: [],
        actions: []
      },
      {
        id: "WS005",
        name: "Clinical Review",
        type: "approval",
        description: "Clinical director reviews treatment plan",
        order: 2,
        isRequired: true,
        assignee: "clinical_director",
        estimatedTime: 15,
        status: "in_progress",
        dependencies: ["WS004"],
        actions: []
      },
      {
        id: "WS006",
        name: "Patient Consent",
        type: "approval",
        description: "Patient reviews and consents to treatment plan",
        order: 3,
        isRequired: true,
        assignee: "patient",
        estimatedTime: 10,
        status: "pending",
        dependencies: ["WS005"],
        actions: []
      }
    ],
    triggers: [
      {
        id: "WT002",
        name: "Treatment Plan Update",
        type: "event",
        description: "Triggered when treatment plan is modified",
        isActive: true,
        conditions: [],
        parameters: {}
      }
    ],
    conditions: [],
    actions: [],
    lastModified: "2024-12-10",
    createdBy: "dr.michael.chen",
    executionCount: 89,
    successRate: 87.6,
    averageExecutionTime: 12.3
  }
];

const mockProcessTemplates: ProcessTemplate[] = [
  {
    id: "PT001",
    name: "Standard Intake Process",
    category: "intake",
    description: "Standardized patient intake process with all required steps",
    isActive: true,
    isDefault: true,
    steps: [
      {
        id: "PS001",
        name: "Patient Registration",
        type: "form",
        description: "Complete patient registration form",
        order: 1,
        isRequired: true,
        assignee: "patient",
        estimatedTime: 10,
        dependencies: []
      },
      {
        id: "PS002",
        name: "Insurance Verification",
        type: "integration",
        description: "Verify insurance coverage",
        order: 2,
        isRequired: true,
        assignee: "admin",
        estimatedTime: 5,
        dependencies: ["PS001"]
      },
      {
        id: "PS003",
        name: "Initial Assessment",
        type: "form",
        description: "Complete initial mental health assessment",
        order: 3,
        isRequired: true,
        assignee: "patient",
        estimatedTime: 20,
        dependencies: ["PS002"]
      }
    ],
    estimatedDuration: 35,
    requiredRoles: ["patient", "admin", "provider"],
    lastModified: "2024-12-14",
    usageCount: 234
  }
];

const mockAutomationMetrics: AutomationMetrics = {
  totalWorkflows: 15,
  activeWorkflows: 12,
  automatedProcesses: 8,
  manualProcesses: 4,
  averageExecutionTime: 9.2,
  successRate: 91.5,
  timeSaved: 12.5,
  efficiencyGain: 28.3
};

// Utility Functions
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'patient_care': return 'bg-blue-500 text-white';
    case 'administrative': return 'bg-green-500 text-white';
    case 'clinical': return 'bg-purple-500 text-white';
    case 'billing': return 'bg-orange-500 text-white';
    case 'compliance': return 'bg-red-500 text-white';
    case 'custom': return 'bg-gray-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500 text-white';
    case 'inactive': return 'bg-gray-500 text-white';
    case 'draft': return 'bg-yellow-500 text-black';
    case 'archived': return 'bg-red-500 text-white';
    case 'pending': return 'bg-yellow-500 text-black';
    case 'in_progress': return 'bg-blue-500 text-white';
    case 'completed': return 'bg-green-500 text-white';
    case 'failed': return 'bg-red-500 text-white';
    case 'skipped': return 'bg-gray-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'critical': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStepTypeColor = (type: string) => {
  switch (type) {
    case 'task': return 'bg-blue-100 text-blue-800';
    case 'approval': return 'bg-green-100 text-green-800';
    case 'notification': return 'bg-purple-100 text-purple-800';
    case 'integration': return 'bg-orange-100 text-orange-800';
    case 'condition': return 'bg-teal-100 text-teal-800';
    case 'action': return 'bg-red-100 text-red-800';
    case 'wait': return 'bg-gray-100 text-gray-800';
    case 'form': return 'bg-blue-100 text-blue-800';
    case 'review': return 'bg-green-100 text-green-800';
    case 'document': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function WorkflowAutomationProcessManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const filteredWorkflows = mockWorkflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || workflow.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || workflow.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-yellow-50 via-white to-orange-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Zap className="h-8 w-8 text-yellow-600" />
            Workflow Automation & Process Management
          </h1>
          <p className="text-gray-600 mt-2">
            Automated workflows and process management for American psychiatrists
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Zap className="h-4 w-4 mr-1" />
            Automated
          </Badge>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <GitBranch className="h-4 w-4 mr-1" />
            Workflows
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Active Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAutomationMetrics.activeWorkflows}</div>
            <p className="text-xs opacity-75 mt-1">Of {mockAutomationMetrics.totalWorkflows} total</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAutomationMetrics.successRate}%</div>
            <p className="text-xs opacity-75 mt-1">High reliability</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Time Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAutomationMetrics.timeSaved}h</div>
            <p className="text-xs opacity-75 mt-1">Per week</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Efficiency Gain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAutomationMetrics.efficiencyGain}%</div>
            <p className="text-xs opacity-75 mt-1">Process improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="processes" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Processes
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workflow Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Workflow Overview
                </CardTitle>
                <CardDescription>
                  Key workflow metrics and performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Workflows</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockAutomationMetrics.activeWorkflows / mockAutomationMetrics.totalWorkflows) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockAutomationMetrics.totalWorkflows}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Automated Processes</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockAutomationMetrics.automatedProcesses / mockAutomationMetrics.totalWorkflows) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockAutomationMetrics.automatedProcesses}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Manual Processes</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockAutomationMetrics.manualProcesses / mockAutomationMetrics.totalWorkflows) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockAutomationMetrics.manualProcesses}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Execution Time</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockAutomationMetrics.averageExecutionTime / 15) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockAutomationMetrics.averageExecutionTime} min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Efficiency Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Efficiency Metrics
                </CardTitle>
                <CardDescription>
                  Time savings and efficiency improvements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Success Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockAutomationMetrics.successRate} className="w-20" />
                      <span className="text-sm font-medium">{mockAutomationMetrics.successRate}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Time Saved</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockAutomationMetrics.timeSaved / 20) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockAutomationMetrics.timeSaved} hours/week</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Efficiency Gain</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockAutomationMetrics.efficiencyGain} className="w-20" />
                      <span className="text-sm font-medium">{mockAutomationMetrics.efficiencyGain}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Workflows</span>
                    <span className="text-sm font-medium text-green-600">{mockAutomationMetrics.activeWorkflows} running</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Workflows */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Recent Workflows
              </CardTitle>
              <CardDescription>
                Recently executed workflows and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockWorkflows.map((workflow) => (
                  <div key={workflow.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Zap className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{workflow.name}</h3>
                      <p className="text-xs text-gray-600">{workflow.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(workflow.category)}>
                        {workflow.category}
                      </Badge>
                      <Badge className={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                      <Badge variant="outline">
                        {workflow.successRate}% success
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Management</CardTitle>
              <CardDescription>
                Manage and configure automated workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Search Workflows</label>
                  <Input
                    placeholder="Search by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-32 mt-1 p-2 border rounded-md text-sm"
                    >
                      <option value="all">All</option>
                      <option value="patient_care">Patient Care</option>
                      <option value="administrative">Administrative</option>
                      <option value="clinical">Clinical</option>
                      <option value="billing">Billing</option>
                      <option value="compliance">Compliance</option>
                      <option value="custom">Custom</option>
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
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflows List */}
          <div className="grid gap-4">
            {filteredWorkflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Zap className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{workflow.name}</h3>
                          <Badge className={getCategoryColor(workflow.category)}>
                            {workflow.category}
                          </Badge>
                          <Badge className={getStatusColor(workflow.status)}>
                            {workflow.status}
                          </Badge>
                          <Badge className={getPriorityColor(workflow.priority)}>
                            {workflow.priority}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{workflow.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Steps:</span>
                            <p className="text-gray-600">{workflow.steps.length}</p>
                          </div>
                          <div>
                            <span className="font-medium">Execution Count:</span>
                            <p className="text-gray-600">{workflow.executionCount}</p>
                          </div>
                          <div>
                            <span className="font-medium">Success Rate:</span>
                            <p className="text-gray-600">{workflow.successRate}%</p>
                          </div>
                          <div>
                            <span className="font-medium">Avg Time:</span>
                            <p className="text-gray-600">{workflow.averageExecutionTime} min</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="font-medium text-sm">Steps:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {workflow.steps.slice(0, 3).map((step, index) => (
                              <Badge key={index} variant="outline" className={`text-xs ${getStepTypeColor(step.type)}`}>
                                {step.name}
                              </Badge>
                            ))}
                            {workflow.steps.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{workflow.steps.length - 3} more
                              </Badge>
                            )}
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
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Processes Tab */}
        <TabsContent value="processes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Process Management
              </CardTitle>
              <CardDescription>
                Manage and optimize business processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockProcessTemplates.map((process) => (
                  <div key={process.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Settings className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{process.name}</h3>
                          <p className="text-gray-600">{process.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(process.category)}>
                          {process.category}
                        </Badge>
                        {process.isDefault && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            Default
                          </Badge>
                        )}
                        {process.isActive ? (
                          <Badge className="bg-green-500 text-white">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-500 text-white">Inactive</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{process.steps.length}</div>
                        <div className="text-sm text-gray-600">Steps</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{process.estimatedDuration}</div>
                        <div className="text-sm text-gray-600">Minutes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{process.usageCount}</div>
                        <div className="text-sm text-gray-600">Uses</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {process.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {step.order}
                            </div>
                            <div className="p-2 bg-white rounded-lg">
                              <Settings className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{step.name}</h4>
                            <p className="text-sm text-gray-600">{step.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStepTypeColor(step.type)}>
                              {step.type}
                            </Badge>
                            <Badge variant="outline">
                              {step.estimatedTime} min
                            </Badge>
                            {step.isRequired && (
                              <Badge className="bg-red-100 text-red-800">Required</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        Edit Process
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

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Automation Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Automation Rules
                </CardTitle>
                <CardDescription>
                  Configure automated triggers and actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Patient Intake Automation</h4>
                    <p className="text-sm text-green-700">
                      Automatically trigger intake process when new patient registers
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                      <Badge variant="outline">156 executions</Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Appointment Reminders</h4>
                    <p className="text-sm text-blue-700">
                      Send automated reminders 24 hours before appointments
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                      <Badge variant="outline">89 executions</Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">Treatment Plan Approval</h4>
                    <p className="text-sm text-purple-700">
                      Multi-step approval workflow for treatment plan changes
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-purple-100 text-purple-800">Active</Badge>
                      <Badge variant="outline">45 executions</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  Automation performance and efficiency metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Success Rate</span>
                      <div className="flex items-center gap-2">
                        <Progress value={mockAutomationMetrics.successRate} className="w-20" />
                        <span className="text-sm font-medium text-green-600">{mockAutomationMetrics.successRate}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Time Saved</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(mockAutomationMetrics.timeSaved / 20) * 100} className="w-20" />
                        <span className="text-sm font-medium text-blue-600">{mockAutomationMetrics.timeSaved} hours/week</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Efficiency Gain</span>
                      <div className="flex items-center gap-2">
                        <Progress value={mockAutomationMetrics.efficiencyGain} className="w-20" />
                        <span className="text-sm font-medium text-purple-600">{mockAutomationMetrics.efficiencyGain}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Workflows</span>
                      <span className="text-sm font-medium text-orange-600">{mockAutomationMetrics.activeWorkflows} running</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Process Templates
              </CardTitle>
              <CardDescription>
                Pre-configured process templates for common workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockProcessTemplates.map((template) => (
                  <div key={template.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{template.name}</h3>
                          <p className="text-gray-600">{template.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                        {template.isDefault && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            Default
                          </Badge>
                        )}
                        {template.isActive ? (
                          <Badge className="bg-green-500 text-white">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-500 text-white">Inactive</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{template.steps.length}</div>
                        <div className="text-sm text-gray-600">Steps</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{template.estimatedDuration}</div>
                        <div className="text-sm text-gray-600">Minutes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{template.requiredRoles.length}</div>
                        <div className="text-sm text-gray-600">Roles</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{template.usageCount}</div>
                        <div className="text-sm text-gray-600">Uses</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <span className="font-medium">Required Roles:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.requiredRoles.map((role, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        Edit Template
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
      </Tabs>
    </div>
  );
}















