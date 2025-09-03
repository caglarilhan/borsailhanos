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
  Bell, 
  BellOff, 
  MessageSquare, 
  Send, 
  Mail, 
  Phone, 
  Smartphone, 
  Clock, 
  Calendar,
  Users,
  User,
  UserCheck,
  UserX,
  FileText,
  FilePlus,
  FileCheck,
  FileX,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Star,
  Heart,
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
  Share2,
  Lock,
  Unlock,
  Shield,
  Eye,
  EyeOff,
  Settings2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  LockKeyhole,
  UnlockKeyhole,
  EyeIcon,
  EyeOffIcon,
  AlertCircle,
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
  BatteryFileAlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Brain,
  BookOpen,
  FileText
} from "lucide-react";

// Notification & Communication Hub için gerekli interface'ler
interface Notification {
  id: string;
  type: 'appointment' | 'reminder' | 'alert' | 'message' | 'system';
  title: string;
  message: string;
  recipientId: string;
  recipientType: 'patient' | 'therapist' | 'admin';
  channel: 'email' | 'sms' | 'push' | 'in-app';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledAt: Date;
  sentAt?: Date;
  readAt?: Date;
  metadata: {
    appointmentId?: string;
    patientId?: string;
    templateId?: string;
    customData?: Record<string, unknown>;
  };
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'appointment' | 'reminder' | 'alert' | 'message' | 'system';
  channels: ('email' | 'sms' | 'push' | 'in-app')[];
  subject: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CommunicationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in-app';
  provider: string;
  status: 'active' | 'inactive' | 'error';
  config: {
    apiKey?: string;
    endpoint?: string;
    rateLimit?: number;
    retryAttempts?: number;
  };
  metrics: {
    totalSent: number;
    delivered: number;
    failed: number;
    deliveryRate: number;
    avgResponseTime: number;
  };
  lastUsed: Date;
}

interface AutomatedWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: 'appointment_created' | 'appointment_reminder' | 'assessment_due' | 'medication_reminder' | 'custom';
  conditions: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: string | number;
  }[];
  actions: {
    type: 'send_notification' | 'create_task' | 'update_record' | 'send_email' | 'send_sms';
    config: Record<string, unknown>;
  }[];
  isActive: boolean;
  lastTriggered: Date;
  triggerCount: number;
  successRate: number;
}

interface PatientEngagement {
  patientId: string;
  engagementScore: number; // 0-100
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  };
  responseRate: {
    email: number;
    sms: number;
    push: number;
    inApp: number;
  };
  lastInteraction: Date;
  totalInteractions: number;
  preferredChannel: 'email' | 'sms' | 'push' | 'in-app';
  optOutChannels: string[];
}

interface MessageThread {
  id: string;
  participants: string[];
  subject: string;
  messages: {
    id: string;
    senderId: string;
    senderType: 'patient' | 'therapist' | 'admin';
    content: string;
    timestamp: Date;
    readBy: string[];
    attachments?: {
      name: string;
      type: string;
      url: string;
    }[];
  }[];
  status: 'active' | 'archived' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

// Notification & Communication Hub Component - Bildirim ve iletişim merkezi
export function NotificationHub() {
  // State management - Uygulama durumunu yönetmek için
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [channels, setChannels] = useState<CommunicationChannel[]>([]);
  const [workflows, setWorkflows] = useState<AutomatedWorkflow[]>([]);
  const [patientEngagement, setPatientEngagement] = useState<PatientEngagement[]>([]);
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [systemStatus, setSystemStatus] = useState('operational');
  const [deliveryRate, setDeliveryRate] = useState(96.8);

  // Mock data initialization - Test verilerini yüklemek için
  useEffect(() => {
    // Simulated data loading - Gerçek API'den veri çekme simülasyonu
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'appointment',
        title: 'Appointment Reminder',
        message: 'Your appointment with Dr. Smith is scheduled for tomorrow at 2:00 PM',
        recipientId: 'patient_001',
        recipientType: 'patient',
        channel: 'email',
        status: 'delivered',
        priority: 'medium',
        scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        sentAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
        readAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
        metadata: {
          appointmentId: 'apt_001',
          patientId: 'patient_001',
          templateId: 'template_001'
        }
      },
      {
        id: '2',
        type: 'reminder',
        title: 'Medication Reminder',
        message: 'Time to take your medication. Please confirm when taken.',
        recipientId: 'patient_002',
        recipientType: 'patient',
        channel: 'sms',
        status: 'sent',
        priority: 'high',
        scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        metadata: {
          patientId: 'patient_002',
          templateId: 'template_002'
        }
      }
    ];

    const mockTemplates: NotificationTemplate[] = [
      {
        id: '1',
        name: 'Appointment Reminder',
        type: 'appointment',
        channels: ['email', 'sms', 'push'],
        subject: 'Appointment Reminder - {{appointmentDate}}',
        content: 'Dear {{patientName}}, your appointment with {{therapistName}} is scheduled for {{appointmentDate}} at {{appointmentTime}}. Please arrive 10 minutes early.',
        variables: ['patientName', 'therapistName', 'appointmentDate', 'appointmentTime'],
        isActive: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Medication Reminder',
        type: 'reminder',
        channels: ['sms', 'push'],
        subject: 'Medication Reminder',
        content: 'Time to take {{medicationName}}. Please confirm when taken.',
        variables: ['medicationName'],
        isActive: true,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];

    const mockChannels: CommunicationChannel[] = [
      {
        id: '1',
        name: 'Email Service',
        type: 'email',
        provider: 'SendGrid',
        status: 'active',
        config: {
          apiKey: 'sg_***',
          endpoint: 'https://api.sendgrid.com/v3',
          rateLimit: 1000,
          retryAttempts: 3
        },
        metrics: {
          totalSent: 15420,
          delivered: 14980,
          failed: 440,
          deliveryRate: 97.1,
          avgResponseTime: 250
        },
        lastUsed: new Date()
      },
      {
        id: '2',
        name: 'SMS Service',
        type: 'sms',
        provider: 'Twilio',
        status: 'active',
        config: {
          apiKey: 'tw_***',
          endpoint: 'https://api.twilio.com/2010-04-01',
          rateLimit: 500,
          retryAttempts: 2
        },
        metrics: {
          totalSent: 8920,
          delivered: 8640,
          failed: 280,
          deliveryRate: 96.9,
          avgResponseTime: 180
        },
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ];

    const mockWorkflows: AutomatedWorkflow[] = [
      {
        id: '1',
        name: 'Appointment Reminder Workflow',
        description: 'Automatically sends appointment reminders 24 hours before',
        trigger: 'appointment_created',
        conditions: [
          {
            field: 'appointmentType',
            operator: 'equals',
            value: 'therapy'
          }
        ],
        actions: [
          {
            type: 'send_notification',
            config: {
              templateId: 'template_001',
              channels: ['email', 'sms'],
              delay: 24 * 60 * 60 * 1000 // 24 hours
            }
          }
        ],
        isActive: true,
        lastTriggered: new Date(Date.now() - 6 * 60 * 60 * 1000),
        triggerCount: 1247,
        successRate: 98.5
      }
    ];

    const mockPatientEngagement: PatientEngagement[] = [
      {
        patientId: 'patient_001',
        engagementScore: 85,
        communicationPreferences: {
          email: true,
          sms: true,
          push: false,
          inApp: true
        },
        responseRate: {
          email: 92,
          sms: 78,
          push: 0,
          inApp: 95
        },
        lastInteraction: new Date(Date.now() - 2 * 60 * 60 * 1000),
        totalInteractions: 47,
        preferredChannel: 'email',
        optOutChannels: ['push']
      }
    ];

    const mockMessageThreads: MessageThread[] = [
      {
        id: '1',
        participants: ['patient_001', 'therapist_001'],
        subject: 'Treatment Progress Discussion',
        messages: [
          {
            id: 'msg_1',
            senderId: 'therapist_001',
            senderType: 'therapist',
            content: 'How are you feeling with the new medication?',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            readBy: ['patient_001']
          },
          {
            id: 'msg_2',
            senderId: 'patient_001',
            senderType: 'patient',
            content: 'I\'m feeling much better. The side effects have decreased significantly.',
            timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
            readBy: ['therapist_001']
          }
        ],
        status: 'active',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000)
      }
    ];

    setNotifications(mockNotifications);
    setTemplates(mockTemplates);
    setChannels(mockChannels);
    setWorkflows(mockWorkflows);
    setPatientEngagement(mockPatientEngagement);
    setMessageThreads(mockMessageThreads);
  }, []);

  // Send notification - Bildirim gönderme
  const sendNotification = useCallback(async (
    templateId: string,
    recipientId: string,
    recipientType: Notification['recipientType'],
    channels: Notification['channel'][],
    customData?: Record<string, unknown>
  ) => {
    setLoading(true);
    
    try {
      // Simulated notification sending - Bildirim gönderme simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const template = templates.find(t => t.id === templateId);
      if (!template) throw new Error('Template not found');
      
      // Create notifications for each channel - Her kanal için bildirim oluştur
      const newNotifications: Notification[] = channels.map(channel => ({
        id: `notif_${Date.now()}_${channel}`,
        type: template.type,
        title: template.subject,
        message: template.content,
        recipientId,
        recipientType,
        channel,
        status: 'sent',
        priority: 'medium',
        scheduledAt: new Date(),
        sentAt: new Date(),
        metadata: {
          templateId,
          customData
        }
      }));
      
      setNotifications(prev => [...prev, ...newNotifications]);
      
      return newNotifications;
      
    } catch (error) {
      console.error('Notification sending failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [templates]);

  // Create notification template - Bildirim şablonu oluşturma
  const createNotificationTemplate = useCallback(async (
    name: string,
    type: NotificationTemplate['type'],
    channels: NotificationTemplate['channels'],
    subject: string,
    content: string,
    variables: string[]
  ) => {
    setLoading(true);
    
    try {
      // Simulated template creation - Şablon oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newTemplate: NotificationTemplate = {
        id: `template_${Date.now()}`,
        name,
        type,
        channels,
        subject,
        content,
        variables,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setTemplates(prev => [...prev, newTemplate]);
      
      return newTemplate;
      
    } catch (error) {
      console.error('Template creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create automated workflow - Otomatik iş akışı oluşturma
  const createAutomatedWorkflow = useCallback(async (
    name: string,
    description: string,
    trigger: AutomatedWorkflow['trigger'],
    conditions: AutomatedWorkflow['conditions'],
    actions: AutomatedWorkflow['actions']
  ) => {
    setLoading(true);
    
    try {
      // Simulated workflow creation - İş akışı oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const newWorkflow: AutomatedWorkflow = {
        id: `workflow_${Date.now()}`,
        name,
        description,
        trigger,
        conditions,
        actions,
        isActive: true,
        lastTriggered: new Date(),
        triggerCount: 0,
        successRate: 100
      };
      
      setWorkflows(prev => [...prev, newWorkflow]);
      
      return newWorkflow;
      
    } catch (error) {
      console.error('Workflow creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message - Mesaj gönderme
  const sendMessage = useCallback(async (
    threadId: string,
    senderId: string,
    senderType: MessageThread['messages'][0]['senderType'],
    content: string
  ) => {
    setLoading(true);
    
    try {
      // Simulated message sending - Mesaj gönderme simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMessage = {
        id: `msg_${Date.now()}`,
        senderId,
        senderType,
        content,
        timestamp: new Date(),
        readBy: []
      };
      
      setMessageThreads(prev => prev.map(thread => 
        thread.id === threadId 
          ? { ...thread, messages: [...thread.messages, newMessage], updatedAt: new Date() }
          : thread
      ));
      
      return newMessage;
      
    } catch (error) {
      console.error('Message sending failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate communication metrics - İletişim metriklerini hesaplama
  const calculateCommunicationMetrics = useCallback(() => {
    const totalNotifications = notifications.length;
    const deliveredNotifications = notifications.filter(n => n.status === 'delivered' || n.status === 'read').length;
    const failedNotifications = notifications.filter(n => n.status === 'failed').length;
    const totalWorkflows = workflows.length;
    const activeWorkflows = workflows.filter(w => w.isActive).length;
    const totalMessages = messageThreads.reduce((sum, thread) => sum + thread.messages.length, 0);
    const avgEngagementScore = patientEngagement.length > 0 
      ? Math.round(patientEngagement.reduce((sum, patient) => sum + patient.engagementScore, 0) / patientEngagement.length)
      : 0;
    
    return {
      totalNotifications,
      deliveredNotifications,
      failedNotifications,
      deliveryRate: totalNotifications > 0 ? Math.round((deliveredNotifications / totalNotifications) * 100) : 0,
      totalWorkflows,
      activeWorkflows,
      totalMessages,
      avgEngagementScore
    };
  }, [notifications, workflows, messageThreads, patientEngagement]);

  const metrics = calculateCommunicationMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🔔 Notification & Communication Hub</h2>
          <p className="text-gray-600">Multi-channel communication and automated notification system</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Bell className="h-3 w-3 mr-1" />
            {metrics.deliveryRate}% Delivery Rate
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Activity className="h-3 w-3 mr-1" />
            {metrics.avgEngagementScore}% Engagement
          </Badge>
        </div>
      </div>

      {/* Communication Overview - İletişim Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications Sent</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalNotifications}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.deliveredNotifications} delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeWorkflows}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalWorkflows} total workflows
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              Across {messageThreads.length} threads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Operational</div>
            <p className="text-xs text-muted-foreground">
              All channels active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notification Templates - Bildirim Şablonları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Notification Templates
            </div>
            <Button
              onClick={() => setShowCreateTemplate(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardTitle>
          <CardDescription>
            Pre-configured notification templates for different scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{template.name}</div>
                    <div className="text-sm text-gray-600">
                      Type: {template.type} • Channels: {template.channels.join(', ')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={template.isActive ? 'default' : 'secondary'}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      {template.variables.length} variables
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Subject</h4>
                    <p className="text-sm text-gray-600">{template.subject}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Content Preview</h4>
                    <p className="text-sm text-gray-600">{template.content.substring(0, 100)}...</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Created: {template.createdAt.toLocaleDateString()}</span>
                    <span>Updated: {template.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Communication Channels - İletişim Kanalları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Network className="h-5 w-5 mr-2" />
            Communication Channels
          </CardTitle>
          <CardDescription>
            Multi-channel communication infrastructure and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {channels.map((channel) => (
              <div key={channel.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{channel.name}</div>
                    <div className="text-sm text-gray-600">
                      Provider: {channel.provider} • Type: {channel.type}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={channel.status === 'active' ? 'default' : 'destructive'}>
                      {channel.status}
                    </Badge>
                    <Badge variant="outline">
                      {channel.metrics.deliveryRate}% delivery rate
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Performance Metrics</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Total Sent: {channel.metrics.totalSent.toLocaleString()}</div>
                      <div>Delivered: {channel.metrics.delivered.toLocaleString()}</div>
                      <div>Failed: {channel.metrics.failed.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Response Time</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Average: {channel.metrics.avgResponseTime}ms</div>
                      <div>Rate Limit: {channel.config.rateLimit}/min</div>
                      <div>Retry Attempts: {channel.config.retryAttempts}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Last Activity</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Last Used: {channel.lastUsed.toLocaleDateString()}</div>
                      <div>Status: {channel.status}</div>
                      <div>Provider: {channel.provider}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automated Workflows - Otomatik İş Akışları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Automated Workflows
            </div>
            <Button
              onClick={() => setShowCreateWorkflow(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </CardTitle>
          <CardDescription>
            Automated communication workflows and triggers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{workflow.name}</div>
                    <div className="text-sm text-gray-600">
                      Trigger: {workflow.trigger} • {workflow.actions.length} actions
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                      {workflow.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      {workflow.successRate}% success rate
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{workflow.description}</p>
                    
                    <h5 className="font-semibold text-sm mb-2 mt-3">Conditions</h5>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {workflow.conditions.map((condition, index) => (
                        <li key={index}>
                          {condition.field} {condition.operator} {condition.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Performance</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Trigger Count: {workflow.triggerCount}</div>
                      <div>Success Rate: {workflow.successRate}%</div>
                      <div>Last Triggered: {workflow.lastTriggered.toLocaleDateString()}</div>
                    </div>
                    
                    <h5 className="font-semibold text-sm mb-2 mt-3">Actions</h5>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {workflow.actions.map((action, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                          {action.type}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Patient Engagement - Hasta Katılımı */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Patient Engagement
          </CardTitle>
          <CardDescription>
            Patient communication preferences and engagement metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patientEngagement.map((patient) => (
              <div key={patient.patientId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">Patient {patient.patientId}</div>
                    <div className="text-sm text-gray-600">
                      Engagement Score: {patient.engagementScore}% • Preferred: {patient.preferredChannel}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={patient.engagementScore >= 80 ? 'default' : 'secondary'}>
                      {patient.engagementScore >= 80 ? 'High' : 'Medium'} Engagement
                    </Badge>
                    <Badge variant="outline">
                      {patient.totalInteractions} interactions
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Communication Preferences</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Email</span>
                        <Badge variant={patient.communicationPreferences.email ? 'default' : 'secondary'}>
                          {patient.communicationPreferences.email ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>SMS</span>
                        <Badge variant={patient.communicationPreferences.sms ? 'default' : 'secondary'}>
                          {patient.communicationPreferences.sms ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Push</span>
                        <Badge variant={patient.communicationPreferences.push ? 'default' : 'secondary'}>
                          {patient.communicationPreferences.push ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Response Rates</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Email: {patient.responseRate.email}%</div>
                      <div>SMS: {patient.responseRate.sms}%</div>
                      <div>Push: {patient.responseRate.push}%</div>
                      <div>In-App: {patient.responseRate.inApp}%</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Activity</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Last Interaction: {patient.lastInteraction.toLocaleDateString()}</div>
                      <div>Total Interactions: {patient.totalInteractions}</div>
                      <div>Opt-out Channels: {patient.optOutChannels.join(', ') || 'None'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Message Threads - Mesaj Konuları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Message Threads
            </div>
            <Button
              onClick={() => sendMessage('1', 'therapist_001', 'therapist', 'How are you feeling today?')}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </CardTitle>
          <CardDescription>
            In-app messaging and communication threads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messageThreads.map((thread) => (
              <div key={thread.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{thread.subject}</div>
                    <div className="text-sm text-gray-600">
                      {thread.participants.length} participants • {thread.messages.length} messages
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={thread.status === 'active' ? 'default' : 'secondary'}>
                      {thread.status}
                    </Badge>
                    <Badge variant="outline">
                      {thread.messages.length} messages
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {thread.messages.slice(-3).map((message) => (
                    <div key={message.id} className="border-l-4 border-blue-500 pl-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{message.senderType}</div>
                        <div className="text-xs text-gray-500">{message.timestamp.toLocaleDateString()}</div>
                      </div>
                      <div className="text-sm text-gray-600">{message.content}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Read by: {message.readBy.length} participants
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Created: {thread.createdAt.toLocaleDateString()}</span>
                    <span>Updated: {thread.updatedAt.toLocaleDateString()}</span>
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




