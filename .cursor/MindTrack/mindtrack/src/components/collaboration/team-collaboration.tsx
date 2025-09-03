"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Activity, 
  BarChart3, 
  TrendingUp, 
  Target, 
  User, 
  UserPlus, 
  UserMinus, 
  UserCheck, 
  UserX, 
  Eye,
  Edit,
  Trash2,
  Copy,
  Share2,
  Send,
  Plus,
  Minus,
  Search,
  Filter,
  MoreHorizontal,
  Bell,
  Settings,
  Video,
  Phone,
  Mail,
  MapPin,
  Globe,
  Lock,
  Unlock,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Download,
  Upload,
  Database,
  GitBranch,
  Layers,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Stop,
  RotateCcw,
  Save,
  Printer,
  Archive,
  RefreshCw,
  Zap,
  Shield,
  Key,
  Database as DatabaseIcon,
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
  FilterIcon,
  SortAsc,
  SortDesc,
  MoreHorizontal as MoreHorizontalIcon
} from "lucide-react";

// Real-time Collaboration & Team Management için gerekli interface'ler
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'therapist' | 'assistant' | 'coordinator' | 'specialist';
  department: 'clinical' | 'administrative' | 'support' | 'management' | 'research';
  status: 'online' | 'offline' | 'busy' | 'away' | 'in-meeting';
  avatar?: string;
  lastSeen: Date;
  skills: string[];
  certifications: string[];
  experience: number; // years
  performance: {
    rating: number;
    completedTasks: number;
    patientSatisfaction: number;
    efficiency: number;
  };
  availability: {
    workingHours: { start: string; end: string };
    timezone: string;
    isAvailable: boolean;
  };
  contact: {
    phone?: string;
    extension?: string;
    location?: string;
  };
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'file' | 'image' | 'link' | 'system';
  timestamp: Date;
  isRead: boolean;
  isEdited: boolean;
  attachments?: {
    name: string;
    url: string;
    size: number;
    type: string;
  }[];
  reactions: {
    userId: string;
    reaction: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
  }[];
  replyTo?: string;
  thread?: ChatMessage[];
}

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  type: 'direct' | 'group' | 'channel' | 'project';
  members: string[];
  admins: string[];
  isPrivate: boolean;
  isArchived: boolean;
  lastMessage?: ChatMessage;
  unreadCount: number;
  pinnedMessages: string[];
  createdAt: Date;
  updatedAt: Date;
  settings: {
    notifications: boolean;
    readReceipts: boolean;
    typingIndicators: boolean;
  };
}

interface SharedWorkspace {
  id: string;
  name: string;
  description: string;
  type: 'project' | 'department' | 'client' | 'research';
  owner: string;
  members: {
    userId: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    permissions: string[];
    joinedAt: Date;
  }[];
  documents: {
    id: string;
    name: string;
    type: 'document' | 'spreadsheet' | 'presentation' | 'form' | 'image';
    url: string;
    size: number;
    lastModified: Date;
    createdBy: string;
    isShared: boolean;
    version: number;
  }[];
  folders: {
    id: string;
    name: string;
    parentId?: string;
    documents: string[];
  }[];
  activity: {
    type: 'document_created' | 'document_edited' | 'member_joined' | 'comment_added';
    userId: string;
    description: string;
    timestamp: Date;
  }[];
  settings: {
    allowComments: boolean;
    versionControl: boolean;
    autoSave: boolean;
    collaborationMode: 'real-time' | 'checkout';
  };
}

interface ActivityFeed {
  id: string;
  userId: string;
  type: 'task_completed' | 'document_shared' | 'meeting_scheduled' | 'comment_added' | 'status_update';
  title: string;
  description: string;
  data: any;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'work' | 'personal' | 'system' | 'notification';
  relatedItems: {
    type: string;
    id: string;
    name: string;
  }[];
  actions: {
    type: 'view' | 'edit' | 'approve' | 'reject' | 'comment';
    label: string;
    url?: string;
  }[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  assigner: string;
  dueDate: Date;
  completedDate?: Date;
  estimatedHours: number;
  actualHours?: number;
  tags: string[];
  attachments: {
    name: string;
    url: string;
    type: string;
  }[];
  comments: {
    id: string;
    userId: string;
    content: string;
    timestamp: Date;
  }[];
  subtasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  dependencies: string[];
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TeamPerformance {
  id: string;
  teamId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalMembers: number;
    activeMembers: number;
    averageResponseTime: number;
    taskCompletionRate: number;
    collaborationScore: number;
    communicationEfficiency: number;
    projectSuccessRate: number;
    clientSatisfaction: number;
  };
  individualPerformance: {
    userId: string;
    name: string;
    tasksCompleted: number;
    tasksAssigned: number;
    averageRating: number;
    responseTime: number;
    collaborationScore: number;
  }[];
  trends: {
    date: Date;
    productivity: number;
    collaboration: number;
    satisfaction: number;
  }[];
  insights: {
    type: 'improvement' | 'achievement' | 'concern' | 'recommendation';
    title: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
    priority: 'low' | 'medium' | 'high';
  }[];
}

// Real-time Collaboration & Team Management Component - Anlık işbirliği ve takım yönetimi
export function TeamCollaboration() {
  // State management - Durum yönetimi
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [sharedWorkspaces, setSharedWorkspaces] = useState<SharedWorkspace[]>([]);
  const [activityFeeds, setActivityFeeds] = useState<ActivityFeed[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance | null>(null);
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<SharedWorkspace | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [collaborationScore, setCollaborationScore] = useState(92.3);

  // Mock data initialization - Test verilerini yükleme
  useEffect(() => {
    // Simulated data loading - Test verisi simülasyonu
    const mockTeamMembers: TeamMember[] = [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@mindtrack.com',
        role: 'therapist',
        department: 'clinical',
        status: 'online',
        lastSeen: new Date(),
        skills: ['Cognitive Behavioral Therapy', 'Trauma Therapy', 'Group Therapy'],
        certifications: ['Licensed Clinical Psychologist', 'CBT Specialist'],
        experience: 8,
        performance: {
          rating: 4.8,
          completedTasks: 156,
          patientSatisfaction: 96.5,
          efficiency: 94.2
        },
        availability: {
          workingHours: { start: '09:00', end: '17:00' },
          timezone: 'America/New_York',
          isAvailable: true
        },
        contact: {
          phone: '+1-555-0123',
          extension: '101',
          location: 'Office 201'
        }
      },
      {
        id: '2',
        name: 'Mike Chen',
        email: 'mike.chen@mindtrack.com',
        role: 'manager',
        department: 'management',
        status: 'in-meeting',
        lastSeen: new Date(Date.now() - 30 * 60 * 1000),
        skills: ['Team Leadership', 'Project Management', 'Strategic Planning'],
        certifications: ['PMP', 'Scrum Master'],
        experience: 12,
        performance: {
          rating: 4.6,
          completedTasks: 89,
          patientSatisfaction: 92.1,
          efficiency: 91.8
        },
        availability: {
          workingHours: { start: '08:00', end: '18:00' },
          timezone: 'America/New_York',
          isAvailable: false
        },
        contact: {
          phone: '+1-555-0124',
          extension: '102',
          location: 'Office 301'
        }
      }
    ];

    const mockChatRooms: ChatRoom[] = [
      {
        id: '1',
        name: 'Clinical Team',
        description: 'General discussion for clinical staff',
        type: 'group',
        members: ['1', '2', '3', '4'],
        admins: ['1'],
        isPrivate: false,
        isArchived: false,
        lastMessage: {
          id: 'msg1',
          senderId: '1',
          senderName: 'Dr. Sarah Johnson',
          content: 'Great session today everyone!',
          type: 'text',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          isRead: true,
          isEdited: false,
          reactions: []
        },
        unreadCount: 0,
        pinnedMessages: [],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 15 * 60 * 1000),
        settings: {
          notifications: true,
          readReceipts: true,
          typingIndicators: true
        }
      }
    ];

    const mockSharedWorkspaces: SharedWorkspace[] = [
      {
        id: '1',
        name: 'Patient Care Project',
        description: 'Collaborative workspace for patient care initiatives',
        type: 'project',
        owner: '1',
        members: [
          {
            userId: '1',
            role: 'owner',
            permissions: ['read', 'write', 'admin'],
            joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
          },
          {
            userId: '2',
            role: 'editor',
            permissions: ['read', 'write'],
            joinedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
          }
        ],
        documents: [
          {
            id: 'doc1',
            name: 'Treatment Protocols',
            type: 'document',
            url: '/documents/treatment-protocols.docx',
            size: 2048576,
            lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            createdBy: '1',
            isShared: true,
            version: 3
          }
        ],
        folders: [
          {
            id: 'folder1',
            name: 'Clinical Guidelines',
            documents: ['doc1']
          }
        ],
        activity: [
          {
            type: 'document_edited',
            userId: '1',
            description: 'Updated treatment protocols',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ],
        settings: {
          allowComments: true,
          versionControl: true,
          autoSave: true,
          collaborationMode: 'real-time'
        }
      }
    ];

    const mockActivityFeeds: ActivityFeed[] = [
      {
        id: '1',
        userId: '1',
        type: 'task_completed',
        title: 'Patient Assessment Completed',
        description: 'Dr. Sarah Johnson completed patient assessment for John Doe',
        data: { patientId: '123', taskId: 'task1' },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: false,
        priority: 'medium',
        category: 'work',
        relatedItems: [
          {
            type: 'patient',
            id: '123',
            name: 'John Doe'
          }
        ],
        actions: [
          {
            type: 'view',
            label: 'View Details',
            url: '/patients/123'
          }
        ]
      }
    ];

    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Complete Patient Assessment',
        description: 'Conduct comprehensive assessment for new patient',
        status: 'completed',
        priority: 'high',
        assignee: '1',
        assigner: '2',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        estimatedHours: 2,
        actualHours: 1.5,
        tags: ['clinical', 'assessment', 'urgent'],
        attachments: [
          {
            name: 'Assessment Form',
            url: '/forms/assessment.pdf',
            type: 'pdf'
          }
        ],
        comments: [
          {
            id: 'comment1',
            userId: '1',
            content: 'Assessment completed successfully',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          }
        ],
        subtasks: [
          {
            id: 'subtask1',
            title: 'Review medical history',
            completed: true
          },
          {
            id: 'subtask2',
            title: 'Conduct initial interview',
            completed: true
          }
        ],
        dependencies: [],
        progress: 100,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ];

    const mockTeamPerformance: TeamPerformance = {
      id: '1',
      teamId: 'clinical_team',
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      metrics: {
        totalMembers: 8,
        activeMembers: 7,
        averageResponseTime: 2.5,
        taskCompletionRate: 94.2,
        collaborationScore: 92.3,
        communicationEfficiency: 89.7,
        projectSuccessRate: 96.8,
        clientSatisfaction: 94.5
      },
      individualPerformance: [
        {
          userId: '1',
          name: 'Dr. Sarah Johnson',
          tasksCompleted: 156,
          tasksAssigned: 160,
          averageRating: 4.8,
          responseTime: 1.2,
          collaborationScore: 95.1
        }
      ],
      trends: [
        {
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          productivity: 92.1,
          collaboration: 89.3,
          satisfaction: 94.2
        }
      ],
      insights: [
        {
          type: 'achievement',
          title: 'High Patient Satisfaction',
          description: 'Team achieved 94.5% patient satisfaction rate',
          impact: 'positive',
          priority: 'medium'
        }
      ]
    };

    setTeamMembers(mockTeamMembers);
    setChatRooms(mockChatRooms);
    setSharedWorkspaces(mockSharedWorkspaces);
    setActivityFeeds(mockActivityFeeds);
    setTasks(mockTasks);
    setTeamPerformance(mockTeamPerformance);
  }, []);

  // Send message - Mesaj gönderme
  const sendMessage = useCallback(async (
    chatRoomId: string,
    content: string,
    type: ChatMessage['type'] = 'text'
  ) => {
    setLoading(true);
    
    try {
      // Simulated message sending - Mesaj gönderme simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        senderId: 'current_user',
        senderName: 'Current User',
        content,
        type,
        timestamp: new Date(),
        isRead: false,
        isEdited: false,
        reactions: []
      };
      
      // Update chat room with new message
      setChatRooms(prev => prev.map(room => 
        room.id === chatRoomId 
          ? { 
              ...room, 
              lastMessage: newMessage,
              unreadCount: room.unreadCount + 1,
              updatedAt: new Date()
            }
          : room
      ));
      
      return newMessage;
      
    } catch (error) {
      console.error('Message sending failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create task - Görev oluşturma
  const createTask = useCallback(async (
    title: string,
    description: string,
    assignee: string,
    dueDate: Date,
    priority: Task['priority']
  ) => {
    setLoading(true);
    
    try {
      // Simulated task creation - Görev oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newTask: Task = {
        id: `task_${Date.now()}`,
        title,
        description,
        status: 'todo',
        priority,
        assignee,
        assigner: 'current_user',
        dueDate,
        estimatedHours: 2,
        tags: [],
        attachments: [],
        comments: [],
        subtasks: [],
        dependencies: [],
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setTasks(prev => [...prev, newTask]);
      
      return newTask;
      
    } catch (error) {
      console.error('Task creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate collaboration metrics - İşbirliği metriklerini hesaplama
  const calculateCollaborationMetrics = useCallback(() => {
    const totalMembers = teamMembers.length;
    const onlineMembers = teamMembers.filter(m => m.status === 'online').length;
    const totalChatRooms = chatRooms.length;
    const activeChatRooms = chatRooms.filter(c => !c.isArchived).length;
    const totalWorkspaces = sharedWorkspaces.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const unreadActivities = activityFeeds.filter(a => !a.isRead).length;
    
    return {
      totalMembers,
      onlineMembers,
      memberOnlineRate: totalMembers > 0 ? Math.round((onlineMembers / totalMembers) * 100) : 0,
      totalChatRooms,
      activeChatRooms,
      chatRoomActivationRate: totalChatRooms > 0 ? Math.round((activeChatRooms / totalChatRooms) * 100) : 0,
      totalWorkspaces,
      totalTasks,
      completedTasks,
      taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      unreadActivities
    };
  }, [teamMembers, chatRooms, sharedWorkspaces, tasks, activityFeeds]);

  const metrics = calculateCollaborationMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">👥 Real-time Collaboration & Team Management</h2>
          <p className="text-gray-600">Team collaboration and real-time communication tools</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Users className="h-3 w-3 mr-1" />
            {metrics.onlineMembers}/{metrics.totalMembers} Online
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="h-3 w-3 mr-1" />
            {collaborationScore}% Collaboration
          </Badge>
        </div>
      </div>

      {/* Team Overview - Takım Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Online Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.onlineMembers}</div>
            <p className="text-xs text-blue-700">
              {metrics.totalMembers} total members
            </p>
            <Progress value={metrics.memberOnlineRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Task Completion</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.completedTasks}</div>
            <p className="text-xs text-green-700">
              {metrics.totalTasks} total tasks
            </p>
            <Progress value={metrics.taskCompletionRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Active Chat Rooms</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{metrics.activeChatRooms}</div>
            <p className="text-xs text-purple-700">
              {metrics.totalChatRooms} total rooms
            </p>
            <Progress value={metrics.chatRoomActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Shared Workspaces</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{metrics.totalWorkspaces}</div>
            <p className="text-xs text-orange-700">
              Collaborative spaces
            </p>
            <Progress value={85} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Team Members - Takım Üyeleri */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-blue-900">Team Members</span>
            </div>
            <Button
              onClick={() => setShowCreateTask(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Manage team members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="border border-blue-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-blue-900">{member.name}</div>
                      <div className="text-sm text-blue-600">{member.role} • {member.department}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={member.status === 'online' ? 'default' : 'secondary'} className="bg-blue-100 text-blue-800">
                      {member.status}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {member.experience} years
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Performance</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Rating: {member.performance.rating}/5</div>
                      <div>Tasks: {member.performance.completedTasks}</div>
                      <div>Satisfaction: {member.performance.patientSatisfaction}%</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Skills</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      {member.skills.slice(0, 3).map((skill, index) => (
                        <div key={index} className="text-xs bg-blue-50 px-2 py-1 rounded">
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Contact</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>{member.email}</div>
                      {member.contact.phone && (
                        <div>{member.contact.phone}</div>
                      )}
                      {member.contact.location && (
                        <div>{member.contact.location}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Rooms - Sohbet Odaları */}
      <Card className="border-2 border-purple-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-purple-600" />
            <span className="text-purple-900">Chat Rooms</span>
          </CardTitle>
          <CardDescription className="text-purple-700">
            Real-time communication channels
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {chatRooms.map((room) => (
              <div key={room.id} className="border border-purple-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-purple-900">{room.name}</div>
                    <div className="text-sm text-purple-600">{room.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={room.isPrivate ? 'default' : 'secondary'} className="bg-purple-100 text-purple-800">
                      {room.isPrivate ? 'Private' : 'Public'}
                    </Badge>
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      {room.type}
                    </Badge>
                    {room.unreadCount > 0 && (
                      <Badge variant="default" className="bg-red-500 text-white">
                        {room.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Last Message</h4>
                    {room.lastMessage && (
                      <div className="text-sm text-purple-600">
                        <div className="font-medium">{room.lastMessage.senderName}</div>
                        <div className="truncate">{room.lastMessage.content}</div>
                        <div className="text-xs text-purple-500">
                          {room.lastMessage.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Settings</h4>
                    <div className="space-y-1 text-sm text-purple-600">
                      <div>Notifications: {room.settings.notifications ? 'On' : 'Off'}</div>
                      <div>Read Receipts: {room.settings.readReceipts ? 'On' : 'Off'}</div>
                      <div>Typing Indicators: {room.settings.typingIndicators ? 'On' : 'Off'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shared Workspaces - Paylaşımlı Çalışma Alanları */}
      <Card className="border-2 border-orange-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-orange-600" />
              <span className="text-orange-900">Shared Workspaces</span>
            </div>
            <Button
              onClick={() => setShowCreateWorkspace(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Workspace
            </Button>
          </CardTitle>
          <CardDescription className="text-orange-700">
            Collaborative document and project spaces
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {sharedWorkspaces.map((workspace) => (
              <div key={workspace.id} className="border border-orange-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-orange-900">{workspace.name}</div>
                    <div className="text-sm text-orange-600">{workspace.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      {workspace.type}
                    </Badge>
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      {workspace.members.length} members
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-800">Documents</h4>
                    <div className="space-y-1 text-sm text-orange-600">
                      <div>Total: {workspace.documents.length}</div>
                      <div>Shared: {workspace.documents.filter(d => d.isShared).length}</div>
                      <div>Folders: {workspace.folders.length}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-800">Recent Activity</h4>
                    <div className="space-y-1 text-sm text-orange-600">
                      {workspace.activity.slice(0, 2).map((activity, index) => (
                        <div key={index} className="text-xs">
                          {activity.description}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-800">Settings</h4>
                    <div className="space-y-1 text-sm text-orange-600">
                      <div>Comments: {workspace.settings.allowComments ? 'On' : 'Off'}</div>
                      <div>Version Control: {workspace.settings.versionControl ? 'On' : 'Off'}</div>
                      <div>Auto Save: {workspace.settings.autoSave ? 'On' : 'Off'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed - Etkinlik Akışı */}
      <Card className="border-2 border-green-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-600" />
              <span className="text-green-900">Activity Feed</span>
            </div>
            <Badge variant="outline" className="border-green-300 text-green-700">
              {metrics.unreadActivities} unread
            </Badge>
          </CardTitle>
          <CardDescription className="text-green-700">
            Recent team activities and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {activityFeeds.map((activity) => (
              <div key={activity.id} className="border border-green-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-green-900">{activity.title}</div>
                    <div className="text-sm text-green-600">{activity.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={activity.priority === 'high' ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
                      {activity.priority}
                    </Badge>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {activity.category}
                    </Badge>
                    {!activity.isRead && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-green-600">
                  {activity.timestamp.toLocaleString()}
                </div>
                
                {activity.actions.length > 0 && (
                  <div className="mt-3 flex space-x-2">
                    {activity.actions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="border-green-300 text-green-700"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




