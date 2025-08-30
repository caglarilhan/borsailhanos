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
  User, 
  Calendar, 
  Clock, 
  MessageSquare, 
  FileText, 
  Download, 
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Heart,
  Activity,
  TrendingUp,
  TrendingDown,
  Star,
  Bell,
  Settings,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  BookOpen,
  FileCheck,
  FileX,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Target,
  Brain
} from "lucide-react";

// Patient Portal & Self-Service için gerekli interface'ler
interface PatientAppointment {
  id: string;
  patientId: string;
  therapistId: string;
  therapistName: string;
  date: Date;
  time: string;
  duration: number; // minutes
  type: 'therapy' | 'consultation' | 'follow-up' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
  location: 'in-person' | 'virtual' | 'phone';
  meetingLink?: string;
  reminders: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

interface TreatmentPlan {
  id: string;
  patientId: string;
  therapistId: string;
  diagnosis: string;
  goals: {
    id: string;
    description: string;
    targetDate: Date;
    status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
    progress: number; // 0-100
  }[];
  interventions: {
    id: string;
    type: 'medication' | 'therapy' | 'lifestyle' | 'monitoring';
    name: string;
    description: string;
    frequency: string;
    duration: string;
    status: 'active' | 'completed' | 'discontinued';
  }[];
  progressNotes: {
    id: string;
    date: Date;
    therapist: string;
    content: string;
    mood: 'excellent' | 'good' | 'fair' | 'poor';
    symptoms: string[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface PatientMessage {
  id: string;
  patientId: string;
  therapistId: string;
  sender: 'patient' | 'therapist';
  subject: string;
  content: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: {
    name: string;
    type: string;
    url: string;
    size: number;
  }[];
}

interface PatientDocument {
  id: string;
  patientId: string;
  name: string;
  type: 'consent' | 'assessment' | 'treatment-plan' | 'progress-note' | 'lab-result' | 'prescription' | 'other';
  category: 'medical' | 'administrative' | 'legal' | 'educational';
  fileUrl: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedBy: string;
  description: string;
  tags: string[];
  isShared: boolean;
  accessLevel: 'patient' | 'therapist' | 'admin';
}

interface PatientProfile {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  medicalHistory: {
    conditions: string[];
    medications: string[];
    allergies: string[];
    surgeries: string[];
  };
  preferences: {
    communication: 'email' | 'sms' | 'phone' | 'in-app';
    appointmentReminders: boolean;
    marketingEmails: boolean;
    dataSharing: boolean;
  };
  lastLogin: Date;
  accountStatus: 'active' | 'inactive' | 'suspended';
}

interface PatientDashboard {
  patientId: string;
  upcomingAppointments: number;
  unreadMessages: number;
  pendingDocuments: number;
  treatmentProgress: number; // 0-100
  nextAppointment?: PatientAppointment;
  recentActivity: {
    type: 'appointment' | 'message' | 'document' | 'progress';
    description: string;
    timestamp: Date;
  }[];
  healthMetrics: {
    mood: 'excellent' | 'good' | 'fair' | 'poor';
    sleepHours: number;
    stressLevel: number; // 1-10
    medicationAdherence: number; // 0-100
  };
}

// Patient Portal & Self-Service Component - Hasta portal'ı ve self-service
export function PatientPortal() {
  // State management - Uygulama durumunu yönetmek için
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [messages, setMessages] = useState<PatientMessage[]>([]);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [dashboard, setDashboard] = useState<PatientDashboard | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<PatientAppointment | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<PatientMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBookAppointment, setShowBookAppointment] = useState(false);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [portalUsage, setPortalUsage] = useState(87.5);

  // Mock data initialization - Test verilerini yüklemek için
  useEffect(() => {
    // Simulated data loading - Gerçek API'den veri çekme simülasyonu
    const mockAppointments: PatientAppointment[] = [
      {
        id: '1',
        patientId: 'patient_001',
        therapistId: 'therapist_001',
        therapistName: 'Dr. Sarah Johnson',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        time: '14:00',
        duration: 60,
        type: 'therapy',
        status: 'confirmed',
        notes: 'Follow-up session for depression treatment',
        location: 'virtual',
        meetingLink: 'https://zoom.us/j/123456789',
        reminders: {
          email: true,
          sms: true,
          push: false
        }
      },
      {
        id: '2',
        patientId: 'patient_001',
        therapistId: 'therapist_002',
        therapistName: 'Dr. Michael Chen',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        time: '10:30',
        duration: 45,
        type: 'consultation',
        status: 'scheduled',
        notes: 'Initial consultation for anxiety management',
        location: 'in-person',
        reminders: {
          email: true,
          sms: false,
          push: true
        }
      }
    ];

    const mockTreatmentPlans: TreatmentPlan[] = [
      {
        id: '1',
        patientId: 'patient_001',
        therapistId: 'therapist_001',
        diagnosis: 'Major Depressive Disorder',
        goals: [
          {
            id: 'goal_1',
            description: 'Reduce depressive symptoms by 50%',
            targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'in-progress',
            progress: 65
          },
          {
            id: 'goal_2',
            description: 'Improve sleep quality and duration',
            targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            status: 'in-progress',
            progress: 40
          }
        ],
        interventions: [
          {
            id: 'int_1',
            type: 'medication',
            name: 'Sertraline 50mg',
            description: 'SSRI antidepressant',
            frequency: 'Once daily',
            duration: '6 months',
            status: 'active'
          },
          {
            id: 'int_2',
            type: 'therapy',
            name: 'Cognitive Behavioral Therapy',
            description: 'Weekly therapy sessions',
            frequency: 'Weekly',
            duration: '12 weeks',
            status: 'active'
          }
        ],
        progressNotes: [
          {
            id: 'note_1',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            therapist: 'Dr. Sarah Johnson',
            content: 'Patient showing significant improvement in mood. Sleep quality has improved.',
            mood: 'good',
            symptoms: ['depressed mood', 'insomnia']
          }
        ],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockMessages: PatientMessage[] = [
      {
        id: '1',
        patientId: 'patient_001',
        therapistId: 'therapist_001',
        sender: 'therapist',
        subject: 'Appointment Reminder',
        content: 'Just a reminder that we have our session tomorrow at 2:00 PM. Please prepare any questions you may have.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        read: false,
        priority: 'medium'
      },
      {
        id: '2',
        patientId: 'patient_001',
        therapistId: 'therapist_001',
        sender: 'patient',
        subject: 'Medication Question',
        content: 'I have a question about the side effects of my medication. Can we discuss this in our next session?',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        read: true,
        priority: 'low'
      }
    ];

    const mockDocuments: PatientDocument[] = [
      {
        id: '1',
        patientId: 'patient_001',
        name: 'Treatment Plan - Depression',
        type: 'treatment-plan',
        category: 'medical',
        fileUrl: '/documents/treatment-plan.pdf',
        fileSize: 245760,
        uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        uploadedBy: 'Dr. Sarah Johnson',
        description: 'Comprehensive treatment plan for depression management',
        tags: ['depression', 'treatment', 'plan'],
        isShared: true,
        accessLevel: 'patient'
      },
      {
        id: '2',
        patientId: 'patient_001',
        name: 'Lab Results - Blood Work',
        type: 'lab-result',
        category: 'medical',
        fileUrl: '/documents/lab-results.pdf',
        fileSize: 153600,
        uploadedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        uploadedBy: 'LabCorp',
        description: 'Recent blood work results',
        tags: ['lab', 'blood', 'results'],
        isShared: true,
        accessLevel: 'patient'
      }
    ];

    const mockPatientProfile: PatientProfile = {
      id: 'patient_001',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-05-15'),
      email: 'john.doe@email.com',
      phone: '+1-555-0123',
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1-555-0124',
        email: 'jane.doe@email.com'
      },
      medicalHistory: {
        conditions: ['Depression', 'Anxiety'],
        medications: ['Sertraline 50mg'],
        allergies: ['Penicillin'],
        surgeries: ['Appendectomy - 2015']
      },
      preferences: {
        communication: 'email',
        appointmentReminders: true,
        marketingEmails: false,
        dataSharing: true
      },
      lastLogin: new Date(),
      accountStatus: 'active'
    };

    const mockDashboard: PatientDashboard = {
      patientId: 'patient_001',
      upcomingAppointments: 2,
      unreadMessages: 1,
      pendingDocuments: 0,
      treatmentProgress: 65,
      nextAppointment: mockAppointments[0],
      recentActivity: [
        {
          type: 'appointment',
          description: 'Appointment confirmed with Dr. Johnson',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          type: 'message',
          description: 'New message from Dr. Johnson',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          type: 'progress',
          description: 'Treatment plan updated',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      ],
      healthMetrics: {
        mood: 'good',
        sleepHours: 7.5,
        stressLevel: 4,
        medicationAdherence: 95
      }
    };

    setAppointments(mockAppointments);
    setTreatmentPlans(mockTreatmentPlans);
    setMessages(mockMessages);
    setDocuments(mockDocuments);
    setPatientProfile(mockPatientProfile);
    setDashboard(mockDashboard);
  }, []);

  // Book appointment - Randevu alma
  const bookAppointment = useCallback(async (
    therapistId: string,
    date: Date,
    time: string,
    type: PatientAppointment['type'],
    notes: string
  ) => {
    setLoading(true);
    
    try {
      // Simulated appointment booking - Randevu alma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newAppointment: PatientAppointment = {
        id: `apt_${Date.now()}`,
        patientId: 'patient_001',
        therapistId,
        therapistName: 'Dr. New Therapist',
        date,
        time,
        duration: 60,
        type,
        status: 'scheduled',
        notes,
        location: 'virtual',
        reminders: {
          email: true,
          sms: true,
          push: false
        }
      };
      
      setAppointments(prev => [...prev, newAppointment]);
      
      return newAppointment;
      
    } catch (error) {
      console.error('Appointment booking failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message - Mesaj gönderme
  const sendMessage = useCallback(async (
    therapistId: string,
    subject: string,
    content: string,
    priority: PatientMessage['priority']
  ) => {
    setLoading(true);
    
    try {
      // Simulated message sending - Mesaj gönderme simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newMessage: PatientMessage = {
        id: `msg_${Date.now()}`,
        patientId: 'patient_001',
        therapistId,
        sender: 'patient',
        subject,
        content,
        timestamp: new Date(),
        read: false,
        priority
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      return newMessage;
      
    } catch (error) {
      console.error('Message sending failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update treatment progress - Tedavi ilerlemesini güncelleme
  const updateTreatmentProgress = useCallback(async (
    treatmentPlanId: string,
    goalId: string,
    progress: number
  ) => {
    setLoading(true);
    
    try {
      // Simulated progress update - İlerleme güncelleme simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTreatmentPlans(prev => prev.map(plan => 
        plan.id === treatmentPlanId 
          ? {
              ...plan,
              goals: plan.goals.map(goal => 
                goal.id === goalId 
                  ? { ...goal, progress }
                  : goal
              ),
              updatedAt: new Date()
            }
          : plan
      ));
      
    } catch (error) {
      console.error('Progress update failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Download document - Belge indirme
  const downloadDocument = useCallback(async (documentId: string) => {
    setLoading(true);
    
    try {
      // Simulated document download - Belge indirme simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const document = documents.find(doc => doc.id === documentId);
      if (!document) throw new Error('Document not found');
      
      // Simulate file download - Dosya indirme simülasyonu
      console.log(`Downloading: ${document.name}`);
      
      return document;
      
    } catch (error) {
      console.error('Document download failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [documents]);

  // Calculate portal metrics - Portal metriklerini hesaplama
  const calculatePortalMetrics = useCallback(() => {
    const totalAppointments = appointments.length;
    const upcomingAppointments = appointments.filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed').length;
    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
    const totalMessages = messages.length;
    const unreadMessages = messages.filter(msg => !msg.read).length;
    const totalDocuments = documents.length;
    const sharedDocuments = documents.filter(doc => doc.isShared).length;
    
    return {
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      totalMessages,
      unreadMessages,
      totalDocuments,
      sharedDocuments
    };
  }, [appointments, messages, documents]);

  const metrics = calculatePortalMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🏥 Patient Portal & Self-Service</h2>
          <p className="text-gray-600">Personalized patient experience and self-service capabilities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <User className="h-3 w-3 mr-1" />
            {patientProfile?.firstName} {patientProfile?.lastName}
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="h-3 w-3 mr-1" />
            {portalUsage}% Portal Usage
          </Badge>
        </div>
      </div>

      {/* Patient Dashboard Overview - Hasta Dashboard Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.upcomingAppointments}</div>
            <p className="text-xs text-blue-700">
              {metrics.totalAppointments} total appointments
            </p>
            <Progress value={(metrics.upcomingAppointments / metrics.totalAppointments) * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.unreadMessages}</div>
            <p className="text-xs text-green-700">
              {metrics.totalMessages} total messages
            </p>
            <Progress value={(metrics.unreadMessages / metrics.totalMessages) * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Treatment Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{dashboard?.treatmentProgress || 0}%</div>
            <p className="text-xs text-purple-700">
              Overall treatment progress
            </p>
            <Progress value={dashboard?.treatmentProgress || 0} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Documents</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{metrics.sharedDocuments}</div>
            <p className="text-xs text-orange-700">
              {metrics.totalDocuments} total documents
            </p>
            <Progress value={(metrics.sharedDocuments / metrics.totalDocuments) * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Appointments Management - Randevu Yönetimi */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-blue-900">Appointments</span>
            </div>
            <Button
              onClick={() => setShowBookAppointment(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Schedule and manage your appointments
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border border-blue-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-blue-900">{appointment.therapistName}</div>
                    <div className="text-sm text-blue-600">
                      {appointment.date.toLocaleDateString()} at {appointment.time} • {appointment.duration}min
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'} className="bg-blue-100 text-blue-800">
                      {appointment.status}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {appointment.type}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Appointment Details</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Type: {appointment.type}</div>
                      <div>Location: {appointment.location}</div>
                      <div>Duration: {appointment.duration} minutes</div>
                      {appointment.meetingLink && (
                        <div>Meeting Link: <a href={appointment.meetingLink} className="text-blue-500 underline">Join Meeting</a></div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Reminders</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        Email: {appointment.reminders.email ? 'Enabled' : 'Disabled'}
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        SMS: {appointment.reminders.sms ? 'Enabled' : 'Disabled'}
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        Push: {appointment.reminders.push ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Notes</h4>
                    <p className="text-sm text-blue-600">{appointment.notes}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Treatment Plans - Tedavi Planları */}
      <Card className="border-2 border-purple-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-purple-600" />
            <span className="text-purple-900">Treatment Plans</span>
          </CardTitle>
          <CardDescription className="text-purple-700">
            Your personalized treatment plans and progress tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {treatmentPlans.map((plan) => (
              <div key={plan.id} className="border border-purple-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-purple-900">Treatment Plan - {plan.diagnosis}</div>
                    <div className="text-sm text-purple-600">
                      Created: {plan.createdAt.toLocaleDateString()} • Updated: {plan.updatedAt.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      {plan.goals.length} goals
                    </Badge>
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      {plan.interventions.length} interventions
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Treatment Goals</h4>
                    <div className="space-y-2">
                      {plan.goals.map((goal) => (
                        <div key={goal.id} className="border-l-2 border-purple-300 pl-3">
                          <div className="font-medium text-sm text-purple-900">{goal.description}</div>
                          <div className="text-xs text-purple-600 mb-1">Target: {goal.targetDate.toLocaleDateString()}</div>
                          <div className="flex items-center justify-between">
                            <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                              {goal.status}
                            </Badge>
                            <div className="text-xs text-purple-600">{goal.progress}% complete</div>
                          </div>
                          <Progress value={goal.progress} className="mt-1 h-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Interventions</h4>
                    <div className="space-y-2">
                      {plan.interventions.map((intervention) => (
                        <div key={intervention.id} className="border border-purple-200 rounded p-2">
                          <div className="font-medium text-sm text-purple-900">{intervention.name}</div>
                          <div className="text-xs text-purple-600">{intervention.description}</div>
                          <div className="text-xs text-purple-600">Frequency: {intervention.frequency}</div>
                          <Badge variant={intervention.status === 'active' ? 'default' : 'secondary'} className="text-xs mt-1">
                            {intervention.status}
                          </Badge>
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

      {/* Secure Messaging - Güvenli Mesajlaşma */}
      <Card className="border-2 border-green-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
              <span className="text-green-900">Secure Messaging</span>
            </div>
            <Button
              onClick={() => setShowSendMessage(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </CardTitle>
          <CardDescription className="text-green-700">
            Communicate securely with your healthcare team
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="border border-green-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-green-900">{message.subject}</div>
                    <div className="text-sm text-green-600">
                      {message.sender === 'patient' ? 'You' : 'Therapist'} • {message.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={message.read ? 'secondary' : 'default'} className="bg-green-100 text-green-800">
                      {message.read ? 'Read' : 'Unread'}
                    </Badge>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {message.priority}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Message Content</h4>
                    <p className="text-sm text-green-600">{message.content}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Message Details</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>From: {message.sender === 'patient' ? 'You' : 'Therapist'}</div>
                      <div>Priority: {message.priority}</div>
                      <div>Time: {message.timestamp.toLocaleTimeString()}</div>
                      {message.attachments && message.attachments.length > 0 && (
                        <div>Attachments: {message.attachments.length}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Management - Belge Yönetimi */}
      <Card className="border-2 border-orange-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200">
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-orange-600" />
            <span className="text-orange-900">Document Management</span>
          </CardTitle>
          <CardDescription className="text-orange-700">
            Access and manage your medical documents securely
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {documents.map((document) => (
              <div key={document.id} className="border border-orange-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-orange-900">{document.name}</div>
                    <div className="text-sm text-orange-600">
                      {document.category} • {document.type} • {document.fileSize} bytes
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={document.isShared ? 'default' : 'secondary'} className="bg-orange-100 text-orange-800">
                      {document.isShared ? 'Shared' : 'Private'}
                    </Badge>
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      {document.accessLevel}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-800">Document Info</h4>
                    <div className="space-y-1 text-sm text-orange-600">
                      <div>Type: {document.type}</div>
                      <div>Category: {document.category}</div>
                      <div>Size: {(document.fileSize / 1024).toFixed(1)} KB</div>
                      <div>Uploaded: {document.uploadedAt.toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-800">Description</h4>
                    <p className="text-sm text-orange-600">{document.description}</p>
                    
                    <h5 className="font-semibold text-sm mb-2 mt-3 text-orange-800">Tags</h5>
                    <div className="flex flex-wrap gap-1">
                      {document.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-orange-300 text-orange-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-800">Actions</h4>
                    <div className="space-y-2">
                      <Button
                        onClick={() => downloadDocument(document.id)}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        disabled={loading}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-orange-300 text-orange-700"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
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
