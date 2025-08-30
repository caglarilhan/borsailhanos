"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Video, 
  Phone, 
  MessageSquare,
  Users,
  Clock,
  Calendar,
  User,
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
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  FileText,
  BookOpen,
  MapPin,
  Mail,
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
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  MonitorOff,
  WifiOff,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Battery,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  BatteryEmpty
} from "lucide-react";

// Telepsychiatry & Virtual Care için interface'ler
interface VirtualSession {
  id: string;
  patientId: string;
  psychiatristId: string;
  sessionType: 'individual' | 'group' | 'family' | 'consultation';
  platform: 'zoom' | 'teams' | 'doxy' | 'custom';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  scheduledAt: Date;
  startedAt: Date;
  endedAt: Date;
  duration: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  recording: {
    enabled: boolean;
    consent: boolean;
    url: string;
    duration: number;
  };
  notes: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface VirtualWaitingRoom {
  id: string;
  sessionId: string;
  patients: {
    patientId: string;
    name: string;
    checkInTime: Date;
    waitTime: number;
    status: 'waiting' | 'in-session' | 'completed' | 'left';
    priority: 'normal' | 'urgent' | 'emergency';
  }[];
  maxCapacity: number;
  currentCapacity: number;
  averageWaitTime: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ScreenSharing {
  id: string;
  sessionId: string;
  sharedBy: string;
  sharedAt: Date;
  endedAt: Date;
  duration: number;
  contentType: 'document' | 'image' | 'video' | 'presentation' | 'other';
  contentName: string;
  contentUrl: string;
  participants: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EPrescribing {
  id: string;
  patientId: string;
  psychiatristId: string;
  medication: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    refills: number;
    instructions: string;
  };
  pharmacy: {
    name: string;
    address: string;
    phone: string;
    npi: string;
  };
  status: 'draft' | 'sent' | 'filled' | 'picked-up' | 'cancelled';
  sentAt: Date;
  filledAt: Date;
  pickedUpAt: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface VirtualGroupSession {
  id: string;
  name: string;
  type: 'support-group' | 'therapy-group' | 'educational' | 'peer-support';
  facilitatorId: string;
  participants: {
    patientId: string;
    name: string;
    role: 'participant' | 'co-facilitator' | 'observer';
    joinTime: Date;
    leaveTime: Date;
  }[];
  maxParticipants: number;
  currentParticipants: number;
  scheduledAt: Date;
  startedAt: Date;
  endedAt: Date;
  duration: number;
  topic: string;
  materials: string[];
  recording: {
    enabled: boolean;
    consent: boolean;
    url: string;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Telepsychiatry & Virtual Care Component
export function TelepsychiatryVirtualCare() {
  const [virtualSessions, setVirtualSessions] = useState<VirtualSession[]>([]);
  const [waitingRooms, setWaitingRooms] = useState<VirtualWaitingRoom[]>([]);
  const [screenSharing, setScreenSharing] = useState<ScreenSharing[]>([]);
  const [ePrescribing, setEPrescribing] = useState<EPrescribing[]>([]);
  const [groupSessions, setGroupSessions] = useState<VirtualGroupSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [overallSessionQuality, setOverallSessionQuality] = useState(94.5);

  // Mock data initialization
  useEffect(() => {
    const mockVirtualSessions: VirtualSession[] = [
      {
        id: '1',
        patientId: 'patient_123',
        psychiatristId: 'dr_smith',
        sessionType: 'individual',
        platform: 'zoom',
        status: 'completed',
        scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
        endedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 65 * 60 * 1000),
        duration: 60,
        connectionQuality: 'excellent',
        recording: {
          enabled: true,
          consent: true,
          url: 'https://zoom.us/recording/123456',
          duration: 60
        },
        notes: 'Patient showed improvement in mood. Continue current medication.',
        createdBy: 'dr.smith@mindtrack.com',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];

    const mockWaitingRooms: VirtualWaitingRoom[] = [
      {
        id: '1',
        sessionId: 'session_456',
        patients: [
          {
            patientId: 'patient_789',
            name: 'Jane Doe',
            checkInTime: new Date(Date.now() - 15 * 60 * 1000),
            waitTime: 15,
            status: 'waiting',
            priority: 'normal'
          }
        ],
        maxCapacity: 10,
        currentCapacity: 1,
        averageWaitTime: 12,
        createdBy: 'system@mindtrack.com',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        updatedAt: new Date()
      }
    ];

    const mockScreenSharing: ScreenSharing[] = [
      {
        id: '1',
        sessionId: 'session_123',
        sharedBy: 'dr.smith@mindtrack.com',
        sharedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
        endedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
        duration: 10,
        contentType: 'document',
        contentName: 'Treatment Plan.pdf',
        contentUrl: 'https://mindtrack.com/documents/treatment-plan.pdf',
        participants: ['patient_123', 'dr_smith'],
        createdBy: 'dr.smith@mindtrack.com',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];

    const mockEPrescribing: EPrescribing[] = [
      {
        id: '1',
        patientId: 'patient_123',
        psychiatristId: 'dr_smith',
        medication: {
          name: 'Sertraline',
          dosage: '50mg',
          frequency: 'Once daily',
          duration: '30 days',
          quantity: 30,
          refills: 2,
          instructions: 'Take with food in the morning'
        },
        pharmacy: {
          name: 'CVS Pharmacy',
          address: '123 Main St, New York, NY 10001',
          phone: '212-555-0123',
          npi: '1234567890'
        },
        status: 'filled',
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        filledAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        pickedUpAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        createdBy: 'dr.smith@mindtrack.com',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ];

    const mockGroupSessions: VirtualGroupSession[] = [
      {
        id: '1',
        name: 'Depression Support Group',
        type: 'support-group',
        facilitatorId: 'dr_johnson',
        participants: [
          {
            patientId: 'patient_456',
            name: 'John Smith',
            role: 'participant',
            joinTime: new Date(Date.now() - 60 * 60 * 1000),
            leaveTime: new Date(Date.now() - 30 * 60 * 1000)
          }
        ],
        maxParticipants: 12,
        currentParticipants: 8,
        scheduledAt: new Date(Date.now() - 90 * 60 * 1000),
        startedAt: new Date(Date.now() - 60 * 60 * 1000),
        endedAt: new Date(Date.now() - 30 * 60 * 1000),
        duration: 90,
        topic: 'Coping with Depression',
        materials: ['depression-coping-guide.pdf', 'mindfulness-exercises.pdf'],
        recording: {
          enabled: true,
          consent: true,
          url: 'https://zoom.us/recording/group-123'
        },
        createdBy: 'dr.johnson@mindtrack.com',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000)
      }
    ];

    setVirtualSessions(mockVirtualSessions);
    setWaitingRooms(mockWaitingRooms);
    setScreenSharing(mockScreenSharing);
    setEPrescribing(mockEPrescribing);
    setGroupSessions(mockGroupSessions);
  }, []);

  // Calculate telehealth metrics
  const calculateTelehealthMetrics = useCallback(() => {
    const totalSessions = virtualSessions.length;
    const completedSessions = virtualSessions.filter(session => session.status === 'completed').length;
    const totalGroupSessions = groupSessions.length;
    const activeGroupSessions = groupSessions.filter(session => session.status === 'in-progress').length;
    const totalPrescriptions = ePrescribing.length;
    const filledPrescriptions = ePrescribing.filter(prescription => prescription.status === 'filled').length;
    
    return {
      totalSessions,
      completedSessions,
      completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
      totalGroupSessions,
      activeGroupSessions,
      groupSessionRate: totalGroupSessions > 0 ? Math.round((activeGroupSessions / totalGroupSessions) * 100) : 0,
      totalPrescriptions,
      filledPrescriptions,
      prescriptionFillRate: totalPrescriptions > 0 ? Math.round((filledPrescriptions / totalPrescriptions) * 100) : 0
    };
  }, [virtualSessions, groupSessions, ePrescribing]);

  const metrics = calculateTelehealthMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📱 Telepsychiatry & Virtual Care</h2>
          <p className="text-gray-600">Comprehensive virtual care platform for remote psychiatric services</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Video className="h-3 w-3 mr-1" />
            {metrics.completedSessions} Sessions
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <SignalHigh className="h-3 w-3 mr-1" />
            {overallSessionQuality}% Quality
          </Badge>
        </div>
      </div>

      {/* Telehealth Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Virtual Sessions</CardTitle>
            <Video className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.completedSessions}</div>
            <p className="text-xs text-blue-700">
              {metrics.totalSessions} total sessions
            </p>
            <Progress value={metrics.completionRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Group Sessions</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.activeGroupSessions}</div>
            <p className="text-xs text-green-700">
              {metrics.totalGroupSessions} total sessions
            </p>
            <Progress value={metrics.groupSessionRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">E-Prescribing</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{metrics.filledPrescriptions}</div>
            <p className="text-xs text-purple-700">
              {metrics.totalPrescriptions} total prescriptions
            </p>
            <Progress value={metrics.prescriptionFillRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Waiting Room</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{waitingRooms.length}</div>
            <p className="text-xs text-orange-700">
              active rooms
            </p>
            <Progress value={100} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Virtual Sessions */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Video className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-blue-900">Virtual Sessions</span>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Individual, group, and family therapy sessions via video conferencing
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {virtualSessions.map((session) => (
              <div key={session.id} className="border border-blue-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-blue-900">Session #{session.id}</div>
                    <div className="text-sm text-blue-600">{session.sessionType} • {session.platform}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={session.status === 'completed' ? 'default' : 'secondary'} className="bg-blue-100 text-blue-800">
                      {session.status}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {session.duration} min
                    </Badge>
                    <Badge variant="outline" className={`border-blue-300 ${session.connectionQuality === 'excellent' ? 'text-green-700' : 'text-orange-700'}`}>
                      {session.connectionQuality}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Session Details</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Type: {session.sessionType}</div>
                      <div>Platform: {session.platform}</div>
                      <div>Duration: {session.duration} minutes</div>
                      <div>Quality: {session.connectionQuality}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Timing</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Scheduled: {session.scheduledAt.toLocaleString()}</div>
                      <div>Started: {session.startedAt.toLocaleString()}</div>
                      <div>Ended: {session.endedAt.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Recording</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Enabled: {session.recording.enabled ? 'Yes' : 'No'}</div>
                      <div>Consent: {session.recording.consent ? 'Yes' : 'No'}</div>
                      <div>Duration: {session.recording.duration} min</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
