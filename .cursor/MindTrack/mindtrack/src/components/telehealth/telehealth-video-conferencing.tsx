"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Share2, 
  Monitor, 
  Camera, 
  CameraOff,
  Users,
  User,
  UserCheck,
  UserX,
  MessageSquare,
  Send,
  FileText,
  FilePlus,
  FileCheck,
  FileX,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Share,
  Lock,
  Unlock,
  Shield,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  BookOpen,
  Activity,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Star,
  Heart,
  Brain,
  Settings2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  LockKeyhole,
  UnlockKeyhole,
  EyeIcon,
  EyeOffIcon,
  AlertTriangle,
  Info,
  HelpCircle,
  ExternalLink,
  Link,
  Link2,
  LinkBreak,
  LinkBreak2,
  Network,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryHigh,
  BatteryEmpty,
  BatteryWarning,
  BatteryAlert,
  BatteryCheck,
  BatteryX,
  BatteryPlus,
  BatteryMinus,
  BatteryEdit,
  BatterySettings,
  BatteryRefresh,
  BatteryPlay,
  BatteryPause,
  BatteryStop,
  BatteryCopy,
  BatteryShare,
  BatteryDownload,
  BatteryUpload,
  BatteryFilter,
  BatterySearch,
  BatteryEye,
  BatteryEyeOff,
  BatteryLock,
  BatteryUnlock,
  BatteryShield,
  BatteryUser,
  BatteryUserCheck,
  BatteryUserX,
  BatteryPhone,
  BatteryMail,
  BatteryMessageSquare,
  BatteryBell,
  BatteryBellOff,
  BatteryBookOpen,
  BatteryFileText,
  BatteryFileCheck,
  BatteryFileX,
  BatteryFilePlus,
  BatteryFileMinus,
  BatteryFileEdit,
  BatteryFileAlertCircle
} from "lucide-react";

// Telehealth & Video Conferencing için gerekli interface'ler
interface VideoSession {
  id: string;
  title: string;
  type: 'individual' | 'group' | 'assessment' | 'followup';
  status: 'scheduled' | 'waiting' | 'active' | 'completed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  participants: {
    id: string;
    name: string;
    role: 'patient' | 'therapist' | 'observer';
    joinedAt?: Date;
    leftAt?: Date;
    isActive: boolean;
    videoEnabled: boolean;
    audioEnabled: boolean;
    screenSharing: boolean;
  }[];
  recording: {
    enabled: boolean;
    startTime?: Date;
    endTime?: Date;
    fileUrl?: string;
    size?: number; // MB
  };
  chat: {
    messages: {
      id: string;
      senderId: string;
      senderName: string;
      content: string;
      timestamp: Date;
      type: 'text' | 'file' | 'system';
    }[];
  };
  notes: {
    id: string;
    therapistId: string;
    content: string;
    timestamp: Date;
    type: 'session' | 'assessment' | 'prescription';
  }[];
  quality: {
    video: 'hd' | 'sd' | 'low';
    audio: 'high' | 'medium' | 'low';
    connection: 'excellent' | 'good' | 'poor';
    bandwidth: number; // Mbps
  };
}

interface VirtualWaitingRoom {
  id: string;
  name: string;
  capacity: number;
  currentPatients: number;
  waitTime: number; // minutes
  status: 'open' | 'closed' | 'full';
  patients: {
    id: string;
    name: string;
    checkInTime: Date;
    estimatedWaitTime: number;
    priority: 'urgent' | 'normal' | 'low';
    status: 'waiting' | 'called' | 'in-session' | 'completed';
    notes: string;
  }[];
  announcements: {
    id: string;
    message: string;
    timestamp: Date;
    type: 'info' | 'warning' | 'urgent';
  }[];
}

interface EPrescription {
  id: string;
  patientId: string;
  therapistId: string;
  sessionId: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    quantity: number;
  }[];
  diagnosis: string;
  notes: string;
  issuedAt: Date;
  expiresAt: Date;
  status: 'draft' | 'issued' | 'filled' | 'expired';
  pharmacy?: {
    name: string;
    address: string;
    phone: string;
  };
}

interface GroupSession {
  id: string;
  title: string;
  type: 'support' | 'therapy' | 'education' | 'workshop';
  maxParticipants: number;
  currentParticipants: number;
  startTime: Date;
  endTime: Date;
  facilitator: {
    id: string;
    name: string;
    credentials: string;
  };
  participants: {
    id: string;
    name: string;
    joinedAt: Date;
    isActive: boolean;
    participationLevel: 'active' | 'passive' | 'observer';
  }[];
  topics: string[];
  materials: {
    id: string;
    name: string;
    type: 'document' | 'video' | 'presentation';
    url: string;
  }[];
  recording: {
    enabled: boolean;
    consent: boolean;
    fileUrl?: string;
  };
}

// Telehealth & Video Conferencing Component - Sanal sağlık hizmetleri ve video konferans sistemi
export function TelehealthVideoConferencing() {
  // State management - Uygulama durumunu yönetmek için
  const [videoSessions, setVideoSessions] = useState<VideoSession[]>([]);
  const [virtualWaitingRooms, setVirtualWaitingRooms] = useState<VirtualWaitingRoom[]>([]);
  const [ePrescriptions, setEPrescriptions] = useState<EPrescription[]>([]);
  const [groupSessions, setGroupSessions] = useState<GroupSession[]>([]);
  const [currentSession, setCurrentSession] = useState<VideoSession | null>(null);
  const [selectedWaitingRoom, setSelectedWaitingRoom] = useState<VirtualWaitingRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showCreateGroupSession, setShowCreateGroupSession] = useState(false);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  // Mock data initialization - Test verilerini yüklemek için
  useEffect(() => {
    // Simulated data loading - Gerçek API'den veri çekme simülasyonu
    const mockVideoSessions: VideoSession[] = [
      {
        id: '1',
        title: 'Initial Consultation - John Doe',
        type: 'individual',
        status: 'active',
        startTime: new Date(Date.now() - 30 * 60 * 1000),
        duration: 60,
        participants: [
          {
            id: 'therapist_001',
            name: 'Dr. Sarah Johnson',
            role: 'therapist',
            joinedAt: new Date(Date.now() - 30 * 60 * 1000),
            isActive: true,
            videoEnabled: true,
            audioEnabled: true,
            screenSharing: false
          },
          {
            id: 'patient_001',
            name: 'John Doe',
            role: 'patient',
            joinedAt: new Date(Date.now() - 25 * 60 * 1000),
            isActive: true,
            videoEnabled: true,
            audioEnabled: true,
            screenSharing: false
          }
        ],
        recording: {
          enabled: true,
          startTime: new Date(Date.now() - 30 * 60 * 1000),
          fileUrl: '/recordings/session_001.mp4',
          size: 45.2
        },
        chat: {
          messages: [
            {
              id: 'msg_1',
              senderId: 'therapist_001',
              senderName: 'Dr. Sarah Johnson',
              content: 'Welcome John! How are you feeling today?',
              timestamp: new Date(Date.now() - 25 * 60 * 1000),
              type: 'text'
            },
            {
              id: 'msg_2',
              senderId: 'patient_001',
              senderName: 'John Doe',
              content: 'Thank you, I\'ve been feeling quite anxious lately.',
              timestamp: new Date(Date.now() - 24 * 60 * 1000),
              type: 'text'
            }
          ]
        },
        notes: [
          {
            id: 'note_1',
            therapistId: 'therapist_001',
            content: 'Patient reports increased anxiety levels. Recommended cognitive behavioral therapy techniques.',
            timestamp: new Date(Date.now() - 20 * 60 * 1000),
            type: 'session'
          }
        ],
        quality: {
          video: 'hd',
          audio: 'high',
          connection: 'excellent',
          bandwidth: 15.5
        }
      },
      {
        id: '2',
        title: 'Follow-up Session - Jane Smith',
        type: 'followup',
        status: 'scheduled',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        duration: 45,
        participants: [
          {
            id: 'therapist_001',
            name: 'Dr. Sarah Johnson',
            role: 'therapist',
            isActive: false,
            videoEnabled: false,
            audioEnabled: false,
            screenSharing: false
          },
          {
            id: 'patient_002',
            name: 'Jane Smith',
            role: 'patient',
            isActive: false,
            videoEnabled: false,
            audioEnabled: false,
            screenSharing: false
          }
        ],
        recording: {
          enabled: false
        },
        chat: {
          messages: []
        },
        notes: [],
        quality: {
          video: 'hd',
          audio: 'high',
          connection: 'good',
          bandwidth: 12.0
        }
      }
    ];

    const mockVirtualWaitingRooms: VirtualWaitingRoom[] = [
      {
        id: '1',
        name: 'General Psychiatry',
        capacity: 20,
        currentPatients: 8,
        waitTime: 15,
        status: 'open',
        patients: [
          {
            id: 'patient_003',
            name: 'Mike Wilson',
            checkInTime: new Date(Date.now() - 30 * 60 * 1000),
            estimatedWaitTime: 10,
            priority: 'normal',
            status: 'waiting',
            notes: 'Follow-up appointment'
          },
          {
            id: 'patient_004',
            name: 'Lisa Brown',
            checkInTime: new Date(Date.now() - 15 * 60 * 1000),
            estimatedWaitTime: 5,
            priority: 'urgent',
            status: 'called',
            notes: 'Crisis intervention needed'
          }
        ],
        announcements: [
          {
            id: 'ann_1',
            message: 'Dr. Johnson will be available in 5 minutes',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            type: 'info'
          }
        ]
      }
    ];

    const mockEPrescriptions: EPrescription[] = [
      {
        id: '1',
        patientId: 'patient_001',
        therapistId: 'therapist_001',
        sessionId: '1',
        medications: [
          {
            name: 'Sertraline',
            dosage: '50mg',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'Take with food in the morning',
            quantity: 30
          }
        ],
        diagnosis: 'Generalized Anxiety Disorder',
        notes: 'Patient shows improvement with current treatment plan',
        issuedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'issued',
        pharmacy: {
          name: 'City Pharmacy',
          address: '123 Main St, City',
          phone: '+1-555-0123'
        }
      }
    ];

    const mockGroupSessions: GroupSession[] = [
      {
        id: '1',
        title: 'Anxiety Support Group',
        type: 'support',
        maxParticipants: 12,
        currentParticipants: 8,
        startTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 5.5 * 60 * 60 * 1000),
        facilitator: {
          id: 'therapist_002',
          name: 'Dr. Michael Chen',
          credentials: 'Licensed Clinical Psychologist'
        },
        participants: [
          {
            id: 'patient_005',
            name: 'Alex Johnson',
            joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            isActive: true,
            participationLevel: 'active'
          },
          {
            id: 'patient_006',
            name: 'Maria Garcia',
            joinedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            isActive: true,
            participationLevel: 'active'
          }
        ],
        topics: [
          'Coping strategies for anxiety',
          'Mindfulness techniques',
          'Building resilience'
        ],
        materials: [
          {
            id: 'mat_1',
            name: 'Anxiety Management Guide',
            type: 'document',
            url: '/materials/anxiety_guide.pdf'
          },
          {
            id: 'mat_2',
            name: 'Mindfulness Meditation Video',
            type: 'video',
            url: '/materials/mindfulness_video.mp4'
          }
        ],
        recording: {
          enabled: true,
          consent: true
        }
      }
    ];

    setVideoSessions(mockVideoSessions);
    setVirtualWaitingRooms(mockVirtualWaitingRooms);
    setEPrescriptions(mockEPrescriptions);
    setGroupSessions(mockGroupSessions);
  }, []);

  // Start video session - Video seansı başlatma
  const startVideoSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    
    try {
      // Simulated session start - Seans başlatma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setVideoSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            status: 'active' as const,
            startTime: new Date()
          };
        }
        return session;
      }));
      
      const session = videoSessions.find(s => s.id === sessionId);
      setCurrentSession(session || null);
      
      return session;
      
    } catch (error) {
      console.error('Video session start failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [videoSessions]);

  // End video session - Video seansını sonlandırma
  const endVideoSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    
    try {
      // Simulated session end - Seans sonlandırma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setVideoSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            status: 'completed' as const,
            endTime: new Date()
          };
        }
        return session;
      }));
      
      setCurrentSession(null);
      
    } catch (error) {
      console.error('Video session end failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create e-prescription - E-reçete oluşturma
  const createEPrescription = useCallback(async (
    patientId: string,
    medications: EPrescription['medications'],
    diagnosis: string,
    notes: string
  ) => {
    setLoading(true);
    
    try {
      // Simulated prescription creation - Reçete oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newPrescription: EPrescription = {
        id: `prescription_${Date.now()}`,
        patientId,
        therapistId: 'therapist_001', // Current therapist
        sessionId: currentSession?.id || '',
        medications,
        diagnosis,
        notes,
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'issued'
      };
      
      setEPrescriptions(prev => [...prev, newPrescription]);
      
      return newPrescription;
      
    } catch (error) {
      console.error('E-prescription creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  // Create group session - Grup seansı oluşturma
  const createGroupSession = useCallback(async (
    title: string,
    type: GroupSession['type'],
    maxParticipants: number,
    startTime: Date,
    endTime: Date,
    topics: string[]
  ) => {
    setLoading(true);
    
    try {
      // Simulated group session creation - Grup seansı oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newGroupSession: GroupSession = {
        id: `group_${Date.now()}`,
        title,
        type,
        maxParticipants,
        currentParticipants: 0,
        startTime,
        endTime,
        facilitator: {
          id: 'therapist_001',
          name: 'Dr. Sarah Johnson',
          credentials: 'Licensed Clinical Psychologist'
        },
        participants: [],
        topics,
        materials: [],
        recording: {
          enabled: false,
          consent: false
        }
      };
      
      setGroupSessions(prev => [...prev, newGroupSession]);
      setShowCreateGroupSession(false);
      
      return newGroupSession;
      
    } catch (error) {
      console.error('Group session creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send chat message - Sohbet mesajı gönderme
  const sendChatMessage = useCallback(async (content: string) => {
    if (!content.trim() || !currentSession) return;
    
    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'therapist_001', // Current user
      senderName: 'Dr. Sarah Johnson',
      content: content.trim(),
      timestamp: new Date(),
      type: 'text' as const
    };
    
    setVideoSessions(prev => prev.map(session => {
      if (session.id === currentSession.id) {
        return {
          ...session,
          chat: {
            ...session.chat,
            messages: [...session.chat.messages, newMessage]
          }
        };
      }
      return session;
    }));
    
    setChatMessage('');
  }, [currentSession]);

  // Toggle recording - Kayıt açma/kapama
  const toggleRecording = useCallback(async () => {
    if (!currentSession) return;
    
    setLoading(true);
    
    try {
      // Simulated recording toggle - Kayıt açma/kapama simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newRecordingState = !recording;
      setRecording(newRecordingState);
      
      setVideoSessions(prev => prev.map(session => {
        if (session.id === currentSession.id) {
          return {
            ...session,
            recording: {
              ...session.recording,
              enabled: newRecordingState,
              startTime: newRecordingState ? new Date() : session.recording.startTime,
              endTime: !newRecordingState ? new Date() : session.recording.endTime
            }
          };
        }
        return session;
      }));
      
    } catch (error) {
      console.error('Recording toggle failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentSession, recording]);

  // Calculate session statistics - Seans istatistiklerini hesaplama
  const calculateSessionStats = useCallback(() => {
    const totalSessions = videoSessions.length;
    const activeSessions = videoSessions.filter(s => s.status === 'active').length;
    const completedSessions = videoSessions.filter(s => s.status === 'completed').length;
    const totalDuration = videoSessions.reduce((sum, session) => sum + session.duration, 0);
    
    return {
      totalSessions,
      activeSessions,
      completedSessions,
      totalDuration,
      averageDuration: totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0
    };
  }, [videoSessions]);

  const sessionStats = calculateSessionStats();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📞 Telehealth & Video Conferencing</h2>
          <p className="text-gray-600">Virtual healthcare delivery and remote patient care</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Video className="h-3 w-3 mr-1" />
            {sessionStats.activeSessions} Active Sessions
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Users className="h-3 w-3 mr-1" />
            {virtualWaitingRooms.reduce((sum, room) => sum + room.currentPatients, 0)} Patients Waiting
          </Badge>
        </div>
      </div>

      {/* Session Statistics - Seans İstatistikleri */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {sessionStats.completedSessions} completed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats.activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats.averageDuration}m</div>
            <p className="text-xs text-muted-foreground">
              Per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiting Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {virtualWaitingRooms.reduce((sum, room) => sum + room.currentPatients, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all waiting rooms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Video Sessions - Aktif Video Seansları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Video className="h-5 w-5 mr-2" />
              Video Sessions
            </div>
            <Button
              onClick={() => setShowCreateSession(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Session
            </Button>
          </CardTitle>
          <CardDescription>
            Manage active and scheduled video consultations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {videoSessions.map((session) => (
              <div key={session.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{session.title}</div>
                    <div className="text-sm text-gray-600">
                      {session.type} • {session.duration} minutes
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                      {session.status}
                    </Badge>
                    <Badge variant="outline">
                      {session.participants.length} participants
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Participants</h4>
                    <div className="space-y-1">
                      {session.participants.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{participant.name}</span>
                          <div className="flex items-center space-x-1">
                            {participant.videoEnabled && <Video className="h-3 w-3 text-green-500" />}
                            {participant.audioEnabled && <Mic className="h-3 w-3 text-green-500" />}
                            {participant.screenSharing && <Share2 className="h-3 w-3 text-blue-500" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Quality</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Video: {session.quality.video.toUpperCase()}</div>
                      <div>Audio: {session.quality.audio}</div>
                      <div>Connection: {session.quality.connection}</div>
                      <div>Bandwidth: {session.quality.bandwidth} Mbps</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Actions</h4>
                    <div className="space-y-2">
                      {session.status === 'scheduled' && (
                        <Button
                          onClick={() => startVideoSession(session.id)}
                          size="sm"
                          className="w-full"
                          disabled={loading}
                        >
                          <Video className="h-3 w-3 mr-1" />
                          Start Session
                        </Button>
                      )}
                      {session.status === 'active' && (
                        <Button
                          onClick={() => endVideoSession(session.id)}
                          size="sm"
                          variant="destructive"
                          className="w-full"
                          disabled={loading}
                        >
                          <PhoneOff className="h-3 w-3 mr-1" />
                          End Session
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
                
                {session.recording.enabled && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Recording: {session.recording.startTime?.toLocaleTimeString()}</span>
                      {session.recording.fileUrl && (
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {videoSessions.length === 0 && (
              <div className="text-center py-8">
                <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No video sessions scheduled</p>
                <p className="text-sm text-gray-400">Create your first video session to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Virtual Waiting Rooms - Sanal Bekleme Odaları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Virtual Waiting Rooms
          </CardTitle>
          <CardDescription>
            Manage patient queues and wait times
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {virtualWaitingRooms.map((room) => (
              <div key={room.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{room.name}</div>
                    <div className="text-sm text-gray-600">
                      {room.currentPatients}/{room.capacity} patients • {room.waitTime} min wait
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={room.status === 'open' ? 'default' : 'secondary'}>
                      {room.status}
                    </Badge>
                    <Badge variant="outline">
                      {room.currentPatients} waiting
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Patients in Queue</h4>
                    <div className="space-y-2">
                      {room.patients.slice(0, 5).map((patient) => (
                        <div key={patient.id} className="flex items-center justify-between text-sm">
                          <div>
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-gray-600">
                              Wait: {patient.estimatedWaitTime} min • {patient.priority}
                            </div>
                          </div>
                          <Badge variant={patient.priority === 'urgent' ? 'destructive' : 'secondary'}>
                            {patient.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Recent Announcements</h4>
                    <div className="space-y-2">
                      {room.announcements.slice(0, 3).map((announcement) => (
                        <div key={announcement.id} className="text-sm">
                          <div className="text-gray-600">{announcement.message}</div>
                          <div className="text-xs text-gray-500">
                            {announcement.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* E-Prescriptions - E-Reçeteler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              E-Prescriptions
            </div>
            <Button
              onClick={() => createEPrescription('patient_001', [], '', '')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Prescription
            </Button>
          </CardTitle>
          <CardDescription>
            Digital prescription management and pharmacy integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ePrescriptions.map((prescription) => (
              <div key={prescription.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">Prescription #{prescription.id}</div>
                    <div className="text-sm text-gray-600">
                      {prescription.diagnosis} • {prescription.medications.length} medications
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={prescription.status === 'issued' ? 'default' : 'secondary'}>
                      {prescription.status}
                    </Badge>
                    <Badge variant="outline">
                      {prescription.issuedAt.toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Medications</h4>
                    <div className="space-y-2">
                      {prescription.medications.map((med, index) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium">{med.name} {med.dosage}</div>
                          <div className="text-gray-600">
                            {med.frequency} • {med.duration}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Details</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Diagnosis: {prescription.diagnosis}</div>
                      <div>Expires: {prescription.expiresAt.toLocaleDateString()}</div>
                      {prescription.pharmacy && (
                        <div>Pharmacy: {prescription.pharmacy.name}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                {prescription.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <h4 className="font-semibold text-sm mb-2">Notes</h4>
                    <p className="text-sm text-gray-600">{prescription.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Group Sessions - Grup Seansları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Group Sessions
            </div>
            <Button
              onClick={() => setShowCreateGroupSession(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Group Session
            </Button>
          </CardTitle>
          <CardDescription>
            Support groups, therapy sessions, and educational workshops
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {groupSessions.map((session) => (
              <div key={session.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{session.title}</div>
                    <div className="text-sm text-gray-600">
                      {session.type} • {session.currentParticipants}/{session.maxParticipants} participants
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {session.startTime.toLocaleDateString()}
                    </Badge>
                    <Badge variant="outline">
                      {session.facilitator.name}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Topics</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {session.topics.map((topic, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Materials</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      {session.materials.map((material) => (
                        <div key={material.id} className="flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          {material.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Actions</h4>
                    <div className="space-y-2">
                      <Button size="sm" className="w-full">
                        <Video className="h-3 w-3 mr-1" />
                        Join Session
                      </Button>
                      <Button size="sm" variant="outline" className="w-full">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {groupSessions.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No group sessions scheduled</p>
                <p className="text-sm text-gray-400">Create your first group session to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

