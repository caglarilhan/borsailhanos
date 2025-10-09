"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Users, MessageSquare, Activity, Calendar, User, UserPlus, UserMinus, UserCheck, UserX, Settings, Plus, Download, Upload, RefreshCw, Save, Bell, BellOff, Shield, ShieldCheck,
  ShieldAlert, ShieldX, Lock, Unlock, Key, Eye, EyeOff, Database, Server, Activity as ActivityIcon,
  TrendingUp, TrendingDown, FileText, MapPin, Phone, Mail, MessageSquare as MessageSquareIcon,
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
  Columns, Rows, SortAsc, SortDesc, Video, VideoOff, Mic, MicOff, Headphones, Monitor,
  Smartphone, Tablet, Laptop, Desktop, WifiOff, Signal, SignalHigh, SignalMedium, SignalLow
} from "lucide-react";

// Interfaces
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'provider' | 'assistant' | 'billing' | 'receptionist' | 'student' | 'consultant';
  status: 'online' | 'offline' | 'away' | 'busy' | 'in_meeting';
  avatar: string;
  lastActive: string;
  department: string;
  permissions: string[];
  isActive: boolean;
  joinDate: string;
  performance: TeamMemberPerformance;
}

interface TeamMemberPerformance {
  tasksCompleted: number;
  tasksPending: number;
  responseTime: number;
  satisfactionScore: number;
  availability: number;
  collaborationScore: number;
}

interface CollaborationSession {
  id: string;
  title: string;
  type: 'meeting' | 'consultation' | 'training' | 'review' | 'planning';
  participants: string[];
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  description: string;
  recording: boolean;
  notes: string;
  files: CollaborationFile[];
}

interface CollaborationFile {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'presentation';
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  isShared: boolean;
  permissions: string[];
}

interface TeamActivity {
  id: string;
  type: 'message' | 'file_share' | 'meeting' | 'task_update' | 'status_change' | 'collaboration';
  user: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
}

interface SharedWorkspace {
  id: string;
  name: string;
  description: string;
  members: string[];
  files: CollaborationFile[];
  lastActivity: string;
  isActive: boolean;
  permissions: WorkspacePermissions;
}

interface WorkspacePermissions {
  canView: boolean;
  canEdit: boolean;
  canShare: boolean;
  canDelete: boolean;
  canInvite: boolean;
}

interface CollaborationMetrics {
  totalMembers: number;
  activeMembers: number;
  activeSessions: number;
  totalCollaborations: number;
  averageResponseTime: number;
  satisfactionScore: number;
  productivityGain: number;
}

// Mock Data
const mockTeamMembers: TeamMember[] = [
  {
    id: "TM001",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@mindtrack.com",
    role: "provider",
    status: "online",
    avatar: "/avatars/sarah.jpg",
    lastActive: "2024-12-14T10:30:00Z",
    department: "Clinical Psychology",
    permissions: ["view_patients", "edit_records", "schedule_appointments", "prescribe_medications"],
    isActive: true,
    joinDate: "2023-01-15",
    performance: {
      tasksCompleted: 156,
      tasksPending: 3,
      responseTime: 2.5,
      satisfactionScore: 4.8,
      availability: 95,
      collaborationScore: 4.6
    }
  },
  {
    id: "TM002",
    name: "Dr. Michael Chen",
    email: "michael.chen@mindtrack.com",
    role: "provider",
    status: "in_meeting",
    avatar: "/avatars/michael.jpg",
    lastActive: "2024-12-14T09:45:00Z",
    department: "Psychiatry",
    permissions: ["view_patients", "edit_records", "schedule_appointments", "prescribe_medications"],
    isActive: true,
    joinDate: "2023-03-20",
    performance: {
      tasksCompleted: 142,
      tasksPending: 5,
      responseTime: 3.2,
      satisfactionScore: 4.7,
      availability: 92,
      collaborationScore: 4.5
    }
  },
  {
    id: "TM003",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@mindtrack.com",
    role: "assistant",
    status: "online",
    avatar: "/avatars/emily.jpg",
    lastActive: "2024-12-14T10:25:00Z",
    department: "Administration",
    permissions: ["view_patients", "schedule_appointments", "edit_records"],
    isActive: true,
    joinDate: "2023-06-10",
    performance: {
      tasksCompleted: 89,
      tasksPending: 2,
      responseTime: 1.8,
      satisfactionScore: 4.9,
      availability: 98,
      collaborationScore: 4.8
    }
  }
];

const mockCollaborationSessions: CollaborationSession[] = [
  {
    id: "CS001",
    title: "Weekly Team Meeting",
    type: "meeting",
    participants: ["TM001", "TM002", "TM003"],
    startTime: "2024-12-14T09:00:00Z",
    endTime: "2024-12-14T10:00:00Z",
    status: "completed",
    description: "Weekly team meeting to discuss patient cases and practice updates",
    recording: true,
    notes: "Discussed new patient intake process and updated treatment protocols",
    files: [
      {
        id: "CF001",
        name: "Weekly_Meeting_Notes.pdf",
        type: "document",
        size: 2048,
        uploadedBy: "TM001",
        uploadedAt: "2024-12-14T10:05:00Z",
        isShared: true,
        permissions: ["view", "edit"]
      }
    ]
  },
  {
    id: "CS002",
    title: "Case Consultation - Patient A",
    type: "consultation",
    participants: ["TM001", "TM002"],
    startTime: "2024-12-14T14:00:00Z",
    endTime: "2024-12-14T15:00:00Z",
    status: "active",
    description: "Consultation on complex patient case requiring multiple perspectives",
    recording: false,
    notes: "Complex case requiring specialized treatment approach",
    files: []
  }
];

const mockTeamActivities: TeamActivity[] = [
  {
    id: "TA001",
    type: "message",
    user: "TM001",
    description: "Dr. Sarah Johnson sent a message about patient case review",
    timestamp: "2024-12-14T10:30:00Z",
    priority: "medium",
    isRead: false
  },
  {
    id: "TA002",
    type: "file_share",
    user: "TM002",
    description: "Dr. Michael Chen shared treatment plan template",
    timestamp: "2024-12-14T09:45:00Z",
    priority: "low",
    isRead: true
  },
  {
    id: "TA003",
    type: "meeting",
    user: "TM003",
    description: "Emily Rodriguez scheduled team meeting for tomorrow",
    timestamp: "2024-12-14T08:30:00Z",
    priority: "high",
    isRead: false
  }
];

const mockSharedWorkspaces: SharedWorkspace[] = [
  {
    id: "SW001",
    name: "Clinical Team Workspace",
    description: "Shared workspace for clinical team collaboration",
    members: ["TM001", "TM002", "TM003"],
    files: [
      {
        id: "CF002",
        name: "Treatment_Protocols.pdf",
        type: "document",
        size: 5120,
        uploadedBy: "TM001",
        uploadedAt: "2024-12-13T15:30:00Z",
        isShared: true,
        permissions: ["view", "edit"]
      }
    ],
    lastActivity: "2024-12-14T10:30:00Z",
    isActive: true,
    permissions: {
      canView: true,
      canEdit: true,
      canShare: true,
      canDelete: false,
      canInvite: true
    }
  }
];

const mockCollaborationMetrics: CollaborationMetrics = {
  totalMembers: 12,
  activeMembers: 8,
  activeSessions: 2,
  totalCollaborations: 45,
  averageResponseTime: 2.8,
  satisfactionScore: 4.7,
  productivityGain: 32.5
};

// Utility Functions
const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-red-500 text-white';
    case 'provider': return 'bg-blue-500 text-white';
    case 'assistant': return 'bg-green-500 text-white';
    case 'billing': return 'bg-orange-500 text-white';
    case 'receptionist': return 'bg-purple-500 text-white';
    case 'student': return 'bg-gray-500 text-white';
    case 'consultant': return 'bg-teal-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return 'bg-green-500 text-white';
    case 'offline': return 'bg-gray-500 text-white';
    case 'away': return 'bg-yellow-500 text-black';
    case 'busy': return 'bg-orange-500 text-white';
    case 'in_meeting': return 'bg-purple-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getActivityTypeColor = (type: string) => {
  switch (type) {
    case 'message': return 'bg-blue-100 text-blue-800';
    case 'file_share': return 'bg-green-100 text-green-800';
    case 'meeting': return 'bg-purple-100 text-purple-800';
    case 'task_update': return 'bg-orange-100 text-orange-800';
    case 'status_change': return 'bg-teal-100 text-teal-800';
    case 'collaboration': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
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

const getSessionTypeColor = (type: string) => {
  switch (type) {
    case 'meeting': return 'bg-blue-100 text-blue-800';
    case 'consultation': return 'bg-green-100 text-green-800';
    case 'training': return 'bg-purple-100 text-purple-800';
    case 'review': return 'bg-orange-100 text-orange-800';
    case 'planning': return 'bg-teal-100 text-teal-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function RealTimeCollaborationTeamManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const filteredMembers = mockTeamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || member.role === selectedRole;
    const matchesStatus = selectedStatus === "all" || member.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Real-time Collaboration & Team Management
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time collaboration tools and team management for American psychiatrists
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Users className="h-4 w-4 mr-1" />
            Team
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <MessageSquare className="h-4 w-4 mr-1" />
            Collaboration
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCollaborationMetrics.activeMembers}</div>
            <p className="text-xs opacity-75 mt-1">Of {mockCollaborationMetrics.totalMembers} total</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCollaborationMetrics.activeSessions}</div>
            <p className="text-xs opacity-75 mt-1">Real-time collaboration</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Satisfaction Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCollaborationMetrics.satisfactionScore}/5</div>
            <p className="text-xs opacity-75 mt-1">Team satisfaction</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Productivity Gain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCollaborationMetrics.productivityGain}%</div>
            <p className="text-xs opacity-75 mt-1">Through collaboration</p>
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
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="collaboration" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Collaboration
          </TabsTrigger>
          <TabsTrigger value="workspaces" className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Workspaces
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Overview
                </CardTitle>
                <CardDescription>
                  Key team metrics and performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Members</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockCollaborationMetrics.activeMembers / mockCollaborationMetrics.totalMembers) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockCollaborationMetrics.totalMembers}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Members</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockCollaborationMetrics.activeMembers / mockCollaborationMetrics.totalMembers) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockCollaborationMetrics.activeMembers}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Sessions</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockCollaborationMetrics.activeSessions / 5) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockCollaborationMetrics.activeSessions}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Collaborations</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockCollaborationMetrics.totalCollaborations / 100) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockCollaborationMetrics.totalCollaborations}</span>
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
                  Team performance and collaboration metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Satisfaction Score</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockCollaborationMetrics.satisfactionScore / 5) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockCollaborationMetrics.satisfactionScore}/5</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Productivity Gain</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockCollaborationMetrics.productivityGain} className="w-20" />
                      <span className="text-sm font-medium">{mockCollaborationMetrics.productivityGain}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Response Time</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockCollaborationMetrics.averageResponseTime / 10) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockCollaborationMetrics.averageResponseTime} min</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Collaborations</span>
                    <span className="text-sm font-medium text-green-600">{mockCollaborationMetrics.activeSessions} ongoing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activities
              </CardTitle>
              <CardDescription>
                Latest team activities and interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTeamActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{activity.description}</h3>
                      <p className="text-xs text-gray-600">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getActivityTypeColor(activity.type)}>
                        {activity.type}
                      </Badge>
                      <Badge className={getPriorityColor(activity.priority)}>
                        {activity.priority}
                      </Badge>
                      {!activity.isRead && (
                        <Badge className="bg-red-500 text-white">New</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Manage team members and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Search Members</label>
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <select 
                      value={selectedRole} 
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-32 mt-1 p-2 border rounded-md text-sm"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="provider">Provider</option>
                      <option value="assistant">Assistant</option>
                      <option value="billing">Billing</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="student">Student</option>
                      <option value="consultant">Consultant</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <select 
                      value={selectedStatus} 
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-32 mt-1 p-2 border rounded-md text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="away">Away</option>
                      <option value="busy">Busy</option>
                      <option value="in_meeting">In Meeting</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Members List */}
          <div className="grid gap-4">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status).replace('text-white', '').replace('text-black', '')}`}></div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{member.name}</h3>
                          <Badge className={getRoleColor(member.role)}>
                            {member.role}
                          </Badge>
                          <Badge className={getStatusColor(member.status)}>
                            {member.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{member.email}</p>
                        <p className="text-sm text-gray-500">{member.department}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Tasks Completed:</span>
                            <p className="text-gray-600">{member.performance.tasksCompleted}</p>
                          </div>
                          <div>
                            <span className="font-medium">Response Time:</span>
                            <p className="text-gray-600">{member.performance.responseTime} min</p>
                          </div>
                          <div>
                            <span className="font-medium">Satisfaction:</span>
                            <p className="text-gray-600">{member.performance.satisfactionScore}/5</p>
                          </div>
                          <div>
                            <span className="font-medium">Availability:</span>
                            <p className="text-gray-600">{member.performance.availability}%</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="font-medium text-sm">Permissions:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {member.permissions.slice(0, 3).map((permission, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                            {member.permissions.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{member.permissions.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm">
                        <User className="h-4 w-4 mr-1" />
                        Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Collaboration Tab */}
        <TabsContent value="collaboration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Collaboration Sessions
              </CardTitle>
              <CardDescription>
                Active and scheduled collaboration sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockCollaborationSessions.map((session) => (
                  <div key={session.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Video className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{session.title}</h3>
                          <p className="text-gray-600">{session.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSessionTypeColor(session.type)}>
                          {session.type}
                        </Badge>
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                        {session.recording && (
                          <Badge variant="outline" className="bg-red-50 text-red-700">
                            Recording
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{session.participants.length}</div>
                        <div className="text-sm text-gray-600">Participants</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {new Date(session.startTime).toLocaleTimeString()}
                        </div>
                        <div className="text-sm text-gray-600">Start Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{session.files.length}</div>
                        <div className="text-sm text-gray-600">Shared Files</div>
                      </div>
                    </div>
                    
                    {session.files.length > 0 && (
                      <div className="mb-4">
                        <span className="font-medium">Shared Files:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {session.files.map((file) => (
                            <Badge key={file.id} variant="outline" className="text-xs">
                              {file.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Video className="h-4 w-4 mr-1" />
                        Join Session
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View Notes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workspaces Tab */}
        <TabsContent value="workspaces" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Shared Workspaces
              </CardTitle>
              <CardDescription>
                Collaborative workspaces and file sharing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockSharedWorkspaces.map((workspace) => (
                  <div key={workspace.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Folder className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{workspace.name}</h3>
                          <p className="text-gray-600">{workspace.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          {workspace.members.length} members
                        </Badge>
                        {workspace.isActive ? (
                          <Badge className="bg-green-500 text-white">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-500 text-white">Inactive</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{workspace.members.length}</div>
                        <div className="text-sm text-gray-600">Members</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{workspace.files.length}</div>
                        <div className="text-sm text-gray-600">Files</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {new Date(workspace.lastActivity).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600">Last Activity</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {workspace.permissions.canEdit ? 'Edit' : 'View'}
                        </div>
                        <div className="text-sm text-gray-600">Permissions</div>
                      </div>
                    </div>
                    
                    {workspace.files.length > 0 && (
                      <div className="mb-4">
                        <span className="font-medium">Files:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {workspace.files.map((file) => (
                            <Badge key={file.id} variant="outline" className="text-xs">
                              {file.name} ({file.size} KB)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Folder className="h-4 w-4 mr-1" />
                        Open Workspace
                      </Button>
                      <Button variant="outline" size="sm">
                        <UserPlus className="h-4 w-4 mr-1" />
                        Invite Member
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Team Activity Feed
              </CardTitle>
              <CardDescription>
                Real-time activity feed and team interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTeamActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm">{activity.description}</h3>
                        {!activity.isRead && (
                          <Badge className="bg-red-500 text-white text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge className={getActivityTypeColor(activity.type)}>
                          {activity.type}
                        </Badge>
                        <Badge className={getPriorityColor(activity.priority)}>
                          {activity.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4" />
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















