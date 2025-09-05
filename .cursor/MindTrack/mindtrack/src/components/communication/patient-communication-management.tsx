'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Smartphone, 
  Activity, 
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Send,
  FileText,
  Settings,
  Bell,
  Globe,
  Accessibility
} from 'lucide-react';

// Interfaces
interface PatientCommunicationPreferences {
  id: string;
  patient_id: string;
  preferred_language: string;
  preferred_communication_method: string;
  preferred_contact_time: string;
  appointment_reminders: boolean;
  medication_reminders: boolean;
  lab_result_notifications: boolean;
  accessibility_needs: string[];
  communication_barriers: string[];
}

interface CommunicationMessageTemplate {
  id: string;
  template_name: string;
  template_category: string;
  template_type: string;
  template_language: string;
  subject_line: string;
  message_content: string;
  template_status: string;
  approval_status: string;
  usage_count: number;
  personalization_fields: string[];
}

interface PatientCommunicationMessage {
  id: string;
  patient_id: string;
  template_id: string;
  message_type: string;
  message_category: string;
  subject_line: string;
  message_content: string;
  delivery_status: string;
  read_status: string;
  response_required: boolean;
  response_received: boolean;
  priority_level: string;
  confidentiality_level: string;
  created_at: string;
}

export function PatientCommunicationManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [preferences, setPreferences] = useState<PatientCommunicationPreferences[]>([]);
  const [templates, setTemplates] = useState<CommunicationMessageTemplate[]>([]);
  const [messages, setMessages] = useState<PatientCommunicationMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data
  useEffect(() => {
    setPreferences([
      {
        id: '1',
        patient_id: 'patient-1',
        preferred_language: 'en',
        preferred_communication_method: 'email',
        preferred_contact_time: 'afternoon',
        appointment_reminders: true,
        medication_reminders: true,
        lab_result_notifications: true,
        accessibility_needs: ['large_text', 'screen_reader'],
        communication_barriers: ['hearing_impairment']
      },
      {
        id: '2',
        patient_id: 'patient-2',
        preferred_language: 'es',
        preferred_communication_method: 'sms',
        preferred_contact_time: 'morning',
        appointment_reminders: true,
        medication_reminders: false,
        lab_result_notifications: true,
        accessibility_needs: ['high_contrast'],
        communication_barriers: ['language_barrier']
      }
    ]);

    setTemplates([
      {
        id: '1',
        template_name: 'Appointment Reminder',
        template_category: 'appointment',
        template_type: 'email',
        template_language: 'en',
        subject_line: 'Appointment Reminder - {{appointment_date}}',
        message_content: 'Dear {{patient_name}}, this is a reminder of your upcoming appointment on {{appointment_date}} at {{appointment_time}}.',
        template_status: 'active',
        approval_status: 'approved',
        usage_count: 45,
        personalization_fields: ['patient_name', 'appointment_date', 'appointment_time']
      },
      {
        id: '2',
        template_name: 'Medication Reminder',
        template_category: 'medication',
        template_type: 'sms',
        template_language: 'en',
        subject_line: '',
        message_content: 'Reminder: Take your {{medication_name}} at {{medication_time}}.',
        template_status: 'active',
        approval_status: 'approved',
        usage_count: 32,
        personalization_fields: ['medication_name', 'medication_time']
      }
    ]);

    setMessages([
      {
        id: '1',
        patient_id: 'patient-1',
        template_id: '1',
        message_type: 'email',
        message_category: 'appointment',
        subject_line: 'Appointment Reminder - 2024-01-30',
        message_content: 'Dear John Doe, this is a reminder of your upcoming appointment on 2024-01-30 at 2:00 PM.',
        delivery_status: 'delivered',
        read_status: 'read',
        response_required: false,
        response_received: false,
        priority_level: 'normal',
        confidentiality_level: 'standard',
        created_at: '2024-01-25T10:00:00Z'
      },
      {
        id: '2',
        patient_id: 'patient-2',
        template_id: '2',
        message_type: 'sms',
        message_category: 'medication',
        subject_line: '',
        message_content: 'Reminder: Take your Sertraline at 8:00 AM.',
        delivery_status: 'sent',
        read_status: 'unread',
        response_required: false,
        response_received: false,
        priority_level: 'normal',
        confidentiality_level: 'standard',
        created_at: '2024-01-25T08:00:00Z'
      }
    ]);
  }, []);

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Smartphone className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'portal': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'sent': return 'secondary';
      case 'failed': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'normal': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getConfidentialityColor = (level: string) => {
    switch (level) {
      case 'restricted': return 'destructive';
      case 'confidential': return 'secondary';
      case 'standard': return 'default';
      default: return 'default';
    }
  };

  const getTemplateStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'draft': return 'secondary';
      case 'archived': return 'secondary';
      default: return 'default';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      case 'needs_revision': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Patient Communication Management</h2>
          <p className="text-muted-foreground">
            Comprehensive patient communication preferences, templates, and messaging system
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{messages.length}</div>
                <p className="text-xs text-muted-foreground">
                  {messages.filter(m => m.delivery_status === 'delivered').length} delivered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
                <Template className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{templates.length}</div>
                <p className="text-xs text-muted-foreground">
                  {templates.filter(t => t.approval_status === 'approved').length} approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Patient Preferences</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{preferences.length}</div>
                <p className="text-xs text-muted-foreground">
                  {preferences.filter(p => p.appointment_reminders).length} with reminders
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {messages.length > 0 ? Math.round((messages.filter(m => m.response_received).length / messages.length) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average response rate
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>Latest patient communication messages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {messages.slice(0, 3).map((message) => (
                  <div key={message.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Patient {message.patient_id}</p>
                      <p className="text-xs text-muted-foreground">{message.message_category}</p>
                    </div>
                    <div className="flex gap-2">
                      {getMessageTypeIcon(message.message_type)}
                      <Badge variant={getDeliveryStatusColor(message.delivery_status)}>
                        {message.delivery_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Communication Preferences</CardTitle>
                <CardDescription>Patient communication method preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {preferences.slice(0, 3).map((pref) => (
                  <div key={pref.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Patient {pref.patient_id}</p>
                      <p className="text-xs text-muted-foreground">
                        {pref.preferred_language.toUpperCase()} - {pref.preferred_communication_method}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {getMessageTypeIcon(pref.preferred_communication_method)}
                      <Badge variant="default">{pref.preferred_contact_time}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Patient Communication Preferences</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Preferences
            </Button>
          </div>

          <div className="grid gap-4">
            {preferences.map((pref) => (
              <Card key={pref.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Patient {pref.patient_id}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="default">{pref.preferred_language.toUpperCase()}</Badge>
                      {getMessageTypeIcon(pref.preferred_communication_method)}
                    </div>
                  </div>
                  <CardDescription>
                    Preferred contact time: {pref.preferred_contact_time}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium">Appointment Reminders</p>
                      <p className="text-sm text-muted-foreground">
                        {pref.appointment_reminders ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Medication Reminders</p>
                      <p className="text-sm text-muted-foreground">
                        {pref.medication_reminders ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Lab Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        {pref.lab_result_notifications ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Accessibility Needs</p>
                      <p className="text-sm text-muted-foreground">
                        {pref.accessibility_needs.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Communication Barriers:</p>
                    <div className="flex flex-wrap gap-2">
                      {pref.communication_barriers.map((barrier, index) => (
                        <Badge key={index} variant="secondary">{barrier}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Message Templates</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.template_name}</CardTitle>
                    <div className="flex gap-2">
                      {getMessageTypeIcon(template.template_type)}
                      <Badge variant={getTemplateStatusColor(template.template_status)}>
                        {template.template_status}
                      </Badge>
                      <Badge variant={getApprovalStatusColor(template.approval_status)}>
                        {template.approval_status}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {template.template_category} - {template.template_language.toUpperCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Subject Line</p>
                      <p className="text-sm text-muted-foreground">{template.subject_line || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Message Content</p>
                      <p className="text-sm text-muted-foreground">{template.message_content}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Usage Count</p>
                        <p className="text-sm text-muted-foreground">{template.usage_count}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Personalization Fields</p>
                        <p className="text-sm text-muted-foreground">
                          {template.personalization_fields.join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Template ID: {template.id}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Send className="mr-2 h-4 w-4" />
                          Use
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Patient Messages</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </div>

          <div className="grid gap-4">
            {messages.map((message) => (
              <Card key={message.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Patient {message.patient_id}</CardTitle>
                    <div className="flex gap-2">
                      {getMessageTypeIcon(message.message_type)}
                      <Badge variant={getDeliveryStatusColor(message.delivery_status)}>
                        {message.delivery_status}
                      </Badge>
                      <Badge variant={getPriorityColor(message.priority_level)}>
                        {message.priority_level}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {message.message_category} - {new Date(message.created_at).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {message.subject_line && (
                      <div>
                        <p className="text-sm font-medium">Subject</p>
                        <p className="text-sm text-muted-foreground">{message.subject_line}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">Message</p>
                      <p className="text-sm text-muted-foreground">{message.message_content}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Read Status</p>
                        <p className="text-sm text-muted-foreground">{message.read_status}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Confidentiality</p>
                        <Badge variant={getConfidentialityColor(message.confidentiality_level)}>
                          {message.confidentiality_level}
                        </Badge>
                      </div>
                    </div>
                    {message.response_required && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Response required from patient
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure automated notification preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Bell className="h-8 w-8" />
                  <span className="ml-2">Notification settings will be displayed here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accessibility Features</CardTitle>
                <CardDescription>Communication accessibility options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Accessibility className="h-8 w-8" />
                  <span className="ml-2">Accessibility features will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Communication Trends</CardTitle>
                <CardDescription>Patient communication trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <TrendingUp className="h-8 w-8" />
                  <span className="ml-2">Communication trends chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Analytics</CardTitle>
                <CardDescription>Message delivery and response analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Activity className="h-8 w-8" />
                  <span className="ml-2">Delivery analytics chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
