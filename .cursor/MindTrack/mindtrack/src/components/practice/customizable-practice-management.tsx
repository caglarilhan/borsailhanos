"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Settings, Target, AlertTriangle, CheckCircle, XCircle, Clock, Calendar, User, Users, Plus, Download, Upload, RefreshCw, Save, Bell, BellOff, Shield, ShieldCheck,
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
interface PracticeTemplate {
  id: string;
  name: string;
  category: 'intake' | 'assessment' | 'treatment' | 'discharge' | 'followup' | 'custom';
  description: string;
  isActive: boolean;
  isDefault: boolean;
  fields: PracticeField[];
  workflow: WorkflowStep[];
  lastModified: string;
  createdBy: string;
  usageCount: number;
}

interface PracticeField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number' | 'email' | 'phone';
  label: string;
  placeholder: string;
  required: boolean;
  defaultValue: string;
  options: string[];
  validation: string;
  order: number;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'form' | 'approval' | 'notification' | 'integration' | 'condition' | 'action';
  description: string;
  order: number;
  isRequired: boolean;
  assignee: string;
  estimatedTime: number;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
}

interface WorkflowCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: string;
  logic: 'and' | 'or';
}

interface WorkflowAction {
  id: string;
  type: 'send_email' | 'send_sms' | 'create_task' | 'update_field' | 'trigger_integration' | 'schedule_appointment';
  description: string;
  parameters: Record<string, string>;
  delay: number;
}

interface PracticeSettings {
  id: string;
  category: 'general' | 'appointments' | 'billing' | 'notifications' | 'security' | 'integrations';
  name: string;
  value: string | boolean | number;
  type: 'string' | 'boolean' | 'number' | 'select' | 'multiselect';
  description: string;
  isRequired: boolean;
  options: string[];
  validation: string;
  lastModified: string;
}

interface CustomizationMetrics {
  totalTemplates: number;
  activeTemplates: number;
  customWorkflows: number;
  automationRules: number;
  integrationCount: number;
  customizationScore: number;
  efficiencyGain: number;
  timeSaved: number;
}

// Mock Data
const mockPracticeTemplates: PracticeTemplate[] = [
  {
    id: "PT001",
    name: "Standard Intake Form",
    category: "intake",
    description: "Comprehensive patient intake form with medical history and current symptoms",
    isActive: true,
    isDefault: true,
    fields: [
      {
        id: "F001",
        name: "patient_name",
        type: "text",
        label: "Patient Name",
        placeholder: "Enter full name",
        required: true,
        defaultValue: "",
        options: [],
        validation: "required",
        order: 1
      },
      {
        id: "F002",
        name: "date_of_birth",
        type: "date",
        label: "Date of Birth",
        placeholder: "MM/DD/YYYY",
        required: true,
        defaultValue: "",
        options: [],
        validation: "required,date",
        order: 2
      },
      {
        id: "F003",
        name: "primary_concern",
        type: "textarea",
        label: "Primary Concern",
        placeholder: "Describe your main concern",
        required: true,
        defaultValue: "",
        options: [],
        validation: "required,min_length:10",
        order: 3
      },
      {
        id: "F004",
        name: "medication_history",
        type: "textarea",
        label: "Current Medications",
        placeholder: "List all current medications",
        required: false,
        defaultValue: "",
        options: [],
        validation: "",
        order: 4
      }
    ],
    workflow: [
      {
        id: "WS001",
        name: "Complete Intake Form",
        type: "form",
        description: "Patient completes intake form",
        order: 1,
        isRequired: true,
        assignee: "patient",
        estimatedTime: 15,
        conditions: [],
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
        conditions: [],
        actions: []
      }
    ],
    lastModified: "2024-12-14",
    createdBy: "dr.sarah.johnson",
    usageCount: 156
  },
  {
    id: "PT002",
    name: "Depression Assessment",
    category: "assessment",
    description: "PHQ-9 depression screening with follow-up questions",
    isActive: true,
    isDefault: false,
    fields: [
      {
        id: "F005",
        name: "phq9_score",
        type: "number",
        label: "PHQ-9 Total Score",
        placeholder: "0-27",
        required: true,
        defaultValue: "",
        options: [],
        validation: "required,min:0,max:27",
        order: 1
      },
      {
        id: "F006",
        name: "severity_level",
        type: "select",
        label: "Severity Level",
        placeholder: "Select severity",
        required: true,
        defaultValue: "",
        options: ["Minimal", "Mild", "Moderate", "Moderately Severe", "Severe"],
        validation: "required",
        order: 2
      },
      {
        id: "F007",
        name: "suicide_risk",
        type: "radio",
        label: "Suicide Risk Assessment",
        placeholder: "",
        required: true,
        defaultValue: "",
        options: ["None", "Low", "Moderate", "High"],
        validation: "required",
        order: 3
      }
    ],
    workflow: [
      {
        id: "WS003",
        name: "Complete Assessment",
        type: "form",
        description: "Complete depression assessment",
        order: 1,
        isRequired: true,
        assignee: "patient",
        estimatedTime: 10,
        conditions: [],
        actions: []
      },
      {
        id: "WS004",
        name: "Risk Evaluation",
        type: "condition",
        description: "Evaluate suicide risk",
        order: 2,
        isRequired: true,
        assignee: "provider",
        estimatedTime: 5,
        conditions: [
          {
            id: "WC001",
            field: "suicide_risk",
            operator: "equals",
            value: "High",
            logic: "and"
          }
        ],
        actions: [
          {
            id: "WA001",
            type: "send_notification",
            description: "Send urgent notification to provider",
            parameters: { "priority": "high", "recipient": "provider" },
            delay: 0
          }
        ]
      }
    ],
    lastModified: "2024-12-10",
    createdBy: "dr.michael.chen",
    usageCount: 89
  },
  {
    id: "PT003",
    name: "Treatment Plan Template",
    category: "treatment",
    description: "Comprehensive treatment plan with goals and interventions",
    isActive: true,
    isDefault: false,
    fields: [
      {
        id: "F008",
        name: "diagnosis",
        type: "select",
        label: "Primary Diagnosis",
        placeholder: "Select diagnosis",
        required: true,
        defaultValue: "",
        options: ["Major Depressive Disorder", "Generalized Anxiety Disorder", "Bipolar Disorder", "PTSD", "ADHD"],
        validation: "required",
        order: 1
      },
      {
        id: "F009",
        name: "treatment_goals",
        type: "textarea",
        label: "Treatment Goals",
        placeholder: "List specific, measurable goals",
        required: true,
        defaultValue: "",
        options: [],
        validation: "required,min_length:20",
        order: 2
      },
      {
        id: "F010",
        name: "interventions",
        type: "multiselect",
        label: "Interventions",
        placeholder: "Select interventions",
        required: true,
        defaultValue: "",
        options: ["CBT", "DBT", "Medication Management", "Group Therapy", "Family Therapy"],
        validation: "required",
        order: 3
      }
    ],
    workflow: [
      {
        id: "WS005",
        name: "Create Treatment Plan",
        type: "form",
        description: "Provider creates treatment plan",
        order: 1,
        isRequired: true,
        assignee: "provider",
        estimatedTime: 20,
        conditions: [],
        actions: []
      },
      {
        id: "WS006",
        name: "Patient Review",
        type: "approval",
        description: "Patient reviews and approves plan",
        order: 2,
        isRequired: true,
        assignee: "patient",
        estimatedTime: 10,
        conditions: [],
        actions: []
      }
    ],
    lastModified: "2024-12-08",
    createdBy: "dr.emily.rodriguez",
    usageCount: 234
  }
];

const mockPracticeSettings: PracticeSettings[] = [
  {
    id: "PS001",
    category: "general",
    name: "Practice Name",
    value: "MindTrack Psychiatry",
    type: "string",
    description: "Name of the practice",
    isRequired: true,
    options: [],
    validation: "required",
    lastModified: "2024-12-14"
  },
  {
    id: "PS002",
    category: "appointments",
    name: "Default Appointment Duration",
    value: 60,
    type: "number",
    description: "Default duration for new appointments in minutes",
    isRequired: true,
    options: [],
    validation: "required,min:15,max:180",
    lastModified: "2024-12-14"
  },
  {
    id: "PS003",
    category: "appointments",
    name: "Allow Online Booking",
    value: true,
    type: "boolean",
    description: "Allow patients to book appointments online",
    isRequired: false,
    options: [],
    validation: "",
    lastModified: "2024-12-14"
  },
  {
    id: "PS004",
    category: "notifications",
    name: "Appointment Reminders",
    value: "email,sms",
    type: "multiselect",
    description: "Methods for sending appointment reminders",
    isRequired: false,
    options: ["email", "sms", "push"],
    validation: "",
    lastModified: "2024-12-14"
  },
  {
    id: "PS005",
    category: "billing",
    name: "Auto-Generate Invoices",
    value: true,
    type: "boolean",
    description: "Automatically generate invoices after appointments",
    isRequired: false,
    options: [],
    validation: "",
    lastModified: "2024-12-14"
  },
  {
    id: "PS006",
    category: "security",
    name: "Session Timeout",
    value: 30,
    type: "number",
    description: "Session timeout in minutes",
    isRequired: true,
    options: [],
    validation: "required,min:5,max:120",
    lastModified: "2024-12-14"
  }
];

const mockCustomizationMetrics: CustomizationMetrics = {
  totalTemplates: 12,
  activeTemplates: 8,
  customWorkflows: 15,
  automationRules: 23,
  integrationCount: 7,
  customizationScore: 85,
  efficiencyGain: 32,
  timeSaved: 8.5
};

// Utility Functions
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'intake': return 'bg-blue-500 text-white';
    case 'assessment': return 'bg-green-500 text-white';
    case 'treatment': return 'bg-purple-500 text-white';
    case 'discharge': return 'bg-orange-500 text-white';
    case 'followup': return 'bg-teal-500 text-white';
    case 'custom': return 'bg-gray-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getFieldTypeColor = (type: string) => {
  switch (type) {
    case 'text': return 'bg-blue-100 text-blue-800';
    case 'textarea': return 'bg-green-100 text-green-800';
    case 'select': return 'bg-purple-100 text-purple-800';
    case 'checkbox': return 'bg-orange-100 text-orange-800';
    case 'radio': return 'bg-teal-100 text-teal-800';
    case 'date': return 'bg-red-100 text-red-800';
    case 'number': return 'bg-yellow-100 text-yellow-800';
    case 'email': return 'bg-indigo-100 text-indigo-800';
    case 'phone': return 'bg-pink-100 text-pink-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getWorkflowTypeColor = (type: string) => {
  switch (type) {
    case 'form': return 'bg-blue-100 text-blue-800';
    case 'approval': return 'bg-green-100 text-green-800';
    case 'notification': return 'bg-purple-100 text-purple-800';
    case 'integration': return 'bg-orange-100 text-orange-800';
    case 'condition': return 'bg-teal-100 text-teal-800';
    case 'action': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function CustomizablePracticeManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const filteredTemplates = mockPracticeTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "active" && template.isActive) ||
                         (selectedStatus === "inactive" && !template.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="h-8 w-8 text-purple-600" />
            Customizable Practice Management
          </h1>
          <p className="text-gray-600 mt-2">
            Customize workflows, templates, and practice settings for American psychiatrists
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Settings className="h-4 w-4 mr-1" />
            Customizable
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Zap className="h-4 w-4 mr-1" />
            Automated
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Customization Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCustomizationMetrics.customizationScore}%</div>
            <p className="text-xs opacity-75 mt-1">Practice optimization</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Efficiency Gain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCustomizationMetrics.efficiencyGain}%</div>
            <p className="text-xs opacity-75 mt-1">Time saved</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Active Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCustomizationMetrics.activeTemplates}</div>
            <p className="text-xs opacity-75 mt-1">Of {mockCustomizationMetrics.totalTemplates} total</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Time Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCustomizationMetrics.timeSaved}h</div>
            <p className="text-xs opacity-75 mt-1">Per week</p>
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
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automation
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customization Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Customization Overview
                </CardTitle>
                <CardDescription>
                  Practice customization metrics and performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Templates</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockCustomizationMetrics.activeTemplates / mockCustomizationMetrics.totalTemplates) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockCustomizationMetrics.totalTemplates}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Templates</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockCustomizationMetrics.activeTemplates / mockCustomizationMetrics.totalTemplates) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockCustomizationMetrics.activeTemplates}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Custom Workflows</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockCustomizationMetrics.customWorkflows / 20) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockCustomizationMetrics.customWorkflows}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Automation Rules</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockCustomizationMetrics.automationRules / 30) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockCustomizationMetrics.automationRules}</span>
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
                    <span className="text-sm font-medium">Efficiency Gain</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockCustomizationMetrics.efficiencyGain} className="w-20" />
                      <span className="text-sm font-medium">{mockCustomizationMetrics.efficiencyGain}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Time Saved</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockCustomizationMetrics.timeSaved / 10) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockCustomizationMetrics.timeSaved} hours/week</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Integration Count</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockCustomizationMetrics.integrationCount / 10) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockCustomizationMetrics.integrationCount}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Customization Score</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockCustomizationMetrics.customizationScore} className="w-20" />
                      <span className="text-sm font-medium">{mockCustomizationMetrics.customizationScore}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Templates
              </CardTitle>
              <CardDescription>
                Recently used and modified templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPracticeTemplates.slice(0, 3).map((template) => (
                  <div key={template.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{template.name}</h3>
                      <p className="text-xs text-gray-600">{template.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                      <Badge variant="outline">
                        {template.usageCount} uses
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Practice Templates</CardTitle>
              <CardDescription>
                Manage and customize practice templates and forms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Search Templates</label>
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
                      <option value="intake">Intake</option>
                      <option value="assessment">Assessment</option>
                      <option value="treatment">Treatment</option>
                      <option value="discharge">Discharge</option>
                      <option value="followup">Follow-up</option>
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
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Templates List */}
          <div className="grid gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{template.name}</h3>
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
                        <p className="text-gray-600">{template.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Fields:</span>
                            <p className="text-gray-600">{template.fields.length}</p>
                          </div>
                          <div>
                            <span className="font-medium">Workflow Steps:</span>
                            <p className="text-gray-600">{template.workflow.length}</p>
                          </div>
                          <div>
                            <span className="font-medium">Usage Count:</span>
                            <p className="text-gray-600">{template.usageCount}</p>
                          </div>
                          <div>
                            <span className="font-medium">Last Modified:</span>
                            <p className="text-gray-600">{template.lastModified}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="font-medium text-sm">Fields:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.fields.slice(0, 3).map((field, index) => (
                              <Badge key={index} variant="outline" className={`text-xs ${getFieldTypeColor(field.type)}`}>
                                {field.label}
                              </Badge>
                            ))}
                            {template.fields.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.fields.length - 3} more
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
                        Preview
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Custom Workflows
              </CardTitle>
              <CardDescription>
                Design and manage custom workflows for practice processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockPracticeTemplates.map((template) => (
                  <div key={template.id} className="p-6 border rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg font-semibold">{template.name}</h3>
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {template.workflow.map((step, index) => (
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
                            <Badge className={getWorkflowTypeColor(step.type)}>
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
                        Edit Workflow
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

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Practice Settings
              </CardTitle>
              <CardDescription>
                Configure practice settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockPracticeSettings.map((setting) => (
                  <div key={setting.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{setting.name}</h3>
                        <p className="text-gray-600">{setting.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          {setting.category}
                        </Badge>
                        {setting.isRequired && (
                          <Badge className="bg-red-100 text-red-800">Required</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Current Value:</span>
                        <p className="text-gray-600 mt-1">
                          {typeof setting.value === 'boolean' 
                            ? (setting.value ? 'Enabled' : 'Disabled')
                            : setting.value}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>
                        <p className="text-gray-600 mt-1">{setting.type}</p>
                      </div>
                    </div>
                    
                    {setting.options.length > 0 && (
                      <div className="mt-4">
                        <span className="font-medium">Options:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {setting.options.map((option, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {option}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        Edit Setting
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View History
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
                  Configure automated workflows and triggers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Appointment Reminders</h4>
                    <p className="text-sm text-green-700">
                      Automatically send reminders 24 hours before appointments
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                      <Badge variant="outline">23 rules</Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Follow-up Scheduling</h4>
                    <p className="text-sm text-blue-700">
                      Automatically schedule follow-up appointments based on treatment plans
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                      <Badge variant="outline">15 rules</Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">Document Generation</h4>
                    <p className="text-sm text-purple-700">
                      Generate progress notes and treatment summaries automatically
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-purple-100 text-purple-800">Active</Badge>
                      <Badge variant="outline">8 rules</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integration Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Integration Status
                </CardTitle>
                <CardDescription>
                  Connected services and integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Integrations</span>
                      <span className="text-sm font-medium text-green-600">{mockCustomizationMetrics.integrationCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">EHR Systems</span>
                      <span className="text-sm font-medium">3 connected</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Payment Processors</span>
                      <span className="text-sm font-medium">2 connected</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Communication Tools</span>
                      <span className="text-sm font-medium">2 connected</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Epic EHR</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Cerner EHR</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Stripe Payments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Zoom Video</span>
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







