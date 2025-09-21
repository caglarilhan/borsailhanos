'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Video, 
  Users, 
  Clock, 
  Activity, 
  TrendingUp,
  Shield,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Play,
  Pause,
  Phone,
  Monitor,
  Smartphone,
  Calendar,
  DollarSign,
  FileText,
  Globe
} from 'lucide-react';

// Interfaces
interface TelehealthSession {
  id: string;
  patient_id: string;
  provider_id: string;
  session_type: string;
  session_status: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  actual_start_time?: string;
  actual_end_time?: string;
  session_duration?: number;
  session_platform: string;
  session_url?: string;
  meeting_id?: string;
  billing_code?: string;
  billing_status: string;
  insurance_verified: boolean;
  prior_authorization_required: boolean;
  copay_amount?: number;
  session_quality_score?: number;
  technical_issues: boolean;
  patient_satisfaction_score?: number;
  provider_satisfaction_score?: number;
  state_licensing_verified: boolean;
  cross_state_practice: boolean;
  hipaa_compliant: boolean;
}

interface VirtualWaitingRoom {
  id: string;
  session_id: string;
  patient_id: string;
  provider_id: string;
  waiting_room_url: string;
  patient_joined_time?: string;
  provider_joined_time?: string;
  waiting_duration?: number;
  waiting_room_status: string;
  patient_ready: boolean;
  provider_ready: boolean;
  technical_check_completed: boolean;
  audio_test_passed: boolean;
  video_test_passed: boolean;
  internet_speed_test?: number;
  consent_forms_completed: boolean;
  emergency_contact_verified: boolean;
}

interface TelehealthBillingCode {
  id: string;
  cpt_code: string;
  code_description: string;
  service_type: string;
  session_duration_minutes: number;
  base_reimbursement_rate: number;
  telehealth_modifier: string;
  medicare_coverage: boolean;
  medicaid_coverage: boolean;
  private_insurance_coverage: boolean;
  prior_authorization_required: boolean;
  is_active: boolean;
}

export function TelehealthTelemedicineManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sessions, setSessions] = useState<TelehealthSession[]>([]);
  const [waitingRooms, setWaitingRooms] = useState<VirtualWaitingRoom[]>([]);
  const [billingCodes, setBillingCodes] = useState<TelehealthBillingCode[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data
  useEffect(() => {
    setSessions([
      {
        id: '1',
        patient_id: 'patient-1',
        provider_id: 'provider-1',
        session_type: 'initial_consultation',
        session_status: 'completed',
        scheduled_start_time: '2024-01-25T14:00:00Z',
        scheduled_end_time: '2024-01-25T15:00:00Z',
        actual_start_time: '2024-01-25T14:05:00Z',
        actual_end_time: '2024-01-25T14:55:00Z',
        session_duration: 50,
        session_platform: 'zoom',
        session_url: 'https://zoom.us/j/123456789',
        meeting_id: '123456789',
        billing_code: '99213',
        billing_status: 'paid',
        insurance_verified: true,
        prior_authorization_required: false,
        copay_amount: 25.00,
        session_quality_score: 5,
        technical_issues: false,
        patient_satisfaction_score: 5,
        provider_satisfaction_score: 4,
        state_licensing_verified: true,
        cross_state_practice: false,
        hipaa_compliant: true
      },
      {
        id: '2',
        patient_id: 'patient-2',
        provider_id: 'provider-1',
        session_type: 'follow_up',
        session_status: 'scheduled',
        scheduled_start_time: '2024-01-26T10:00:00Z',
        scheduled_end_time: '2024-01-26T10:30:00Z',
        session_platform: 'teams',
        session_url: 'https://teams.microsoft.com/l/meetup-join/...',
        billing_code: '99214',
        billing_status: 'pending',
        insurance_verified: true,
        prior_authorization_required: true,
        copay_amount: 30.00,
        state_licensing_verified: true,
        cross_state_practice: true,
        hipaa_compliant: true
      }
    ]);

    setWaitingRooms([
      {
        id: '1',
        session_id: '1',
        patient_id: 'patient-1',
        provider_id: 'provider-1',
        waiting_room_url: 'https://zoom.us/waiting-room/123456789',
        patient_joined_time: '2024-01-25T13:55:00Z',
        provider_joined_time: '2024-01-25T14:00:00Z',
        waiting_duration: 5,
        waiting_room_status: 'ended',
        patient_ready: true,
        provider_ready: true,
        technical_check_completed: true,
        audio_test_passed: true,
        video_test_passed: true,
        internet_speed_test: 25.5,
        consent_forms_completed: true,
        emergency_contact_verified: true
      }
    ]);

    setBillingCodes([
      {
        id: '1',
        cpt_code: '99213',
        code_description: 'Office or other outpatient visit for the evaluation and management of an established patient',
        service_type: 'psychiatric_evaluation',
        session_duration_minutes: 20,
        base_reimbursement_rate: 150.00,
        telehealth_modifier: '95',
        medicare_coverage: true,
        medicaid_coverage: true,
        private_insurance_coverage: true,
        prior_authorization_required: false,
        is_active: true
      },
      {
        id: '2',
        cpt_code: '99214',
        code_description: 'Office or other outpatient visit for the evaluation and management of an established patient',
        service_type: 'psychiatric_evaluation',
        session_duration_minutes: 30,
        base_reimbursement_rate: 200.00,
        telehealth_modifier: '95',
        medicare_coverage: true,
        medicaid_coverage: true,
        private_insurance_coverage: true,
        prior_authorization_required: true,
        is_active: true
      }
    ]);
  }, []);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'zoom': return <Video className="h-4 w-4" />;
      case 'teams': return <Monitor className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'doxy': return <Smartphone className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'scheduled': return 'default';
      case 'cancelled': return 'destructive';
      case 'no_show': return 'destructive';
      default: return 'default';
    }
  };

  const getBillingStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'billed': return 'secondary';
      case 'pending': return 'secondary';
      case 'denied': return 'destructive';
      default: return 'default';
    }
  };

  const getWaitingRoomStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'secondary';
      case 'in_session': return 'default';
      case 'ended': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Telehealth & Telemedicine Management</h2>
          <p className="text-muted-foreground">
            Comprehensive telehealth sessions, virtual waiting rooms, and billing management
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Session
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="waiting-rooms">Waiting Rooms</TabsTrigger>
          <TabsTrigger value="billing">Billing Codes</TabsTrigger>
          <TabsTrigger value="licensing">State Licensing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sessions.length}</div>
                <p className="text-xs text-muted-foreground">
                  {sessions.filter(s => s.session_status === 'completed').length} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Waiting Rooms</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{waitingRooms.length}</div>
                <p className="text-xs text-muted-foreground">
                  {waitingRooms.filter(w => w.waiting_room_status === 'active').length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Billing Codes</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{billingCodes.length}</div>
                <p className="text-xs text-muted-foreground">
                  {billingCodes.filter(b => b.is_active).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">HIPAA Compliance</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sessions.length > 0 ? Math.round((sessions.filter(s => s.hipaa_compliant).length / sessions.length) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Compliance rate
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>Latest telehealth sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Patient {session.patient_id}</p>
                      <p className="text-xs text-muted-foreground">{session.session_type}</p>
                    </div>
                    <div className="flex gap-2">
                      {getPlatformIcon(session.session_platform)}
                      <Badge variant={getSessionStatusColor(session.session_status)}>
                        {session.session_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Usage</CardTitle>
                <CardDescription>Telehealth platform distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {['zoom', 'teams', 'phone', 'doxy'].map((platform) => {
                  const count = sessions.filter(s => s.session_platform === platform).length;
                  return (
                    <div key={platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(platform)}
                        <span className="text-sm font-medium capitalize">{platform}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{count} sessions</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Telehealth Sessions</h3>
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
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Patient {session.patient_id}</CardTitle>
                    <div className="flex gap-2">
                      {getPlatformIcon(session.session_platform)}
                      <Badge variant={getSessionStatusColor(session.session_status)}>
                        {session.session_status}
                      </Badge>
                      <Badge variant={getBillingStatusColor(session.billing_status)}>
                        {session.billing_status}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {session.session_type} - {new Date(session.scheduled_start_time).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">
                        {session.session_duration ? `${session.session_duration} min` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Billing Code</p>
                      <p className="text-sm text-muted-foreground">{session.billing_code || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Copay</p>
                      <p className="text-sm text-muted-foreground">
                        {session.copay_amount ? `$${session.copay_amount}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Quality Score</p>
                      <p className="text-sm text-muted-foreground">
                        {session.session_quality_score ? `${session.session_quality_score}/5` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Insurance Verified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">HIPAA Compliant</span>
                      </div>
                      {session.cross_state_practice && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Cross-State</span>
                        </div>
                      )}
                    </div>
                    {session.technical_issues && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Technical issues reported during session
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="waiting-rooms" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Virtual Waiting Rooms</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Waiting Room
            </Button>
          </div>

          <div className="grid gap-4">
            {waitingRooms.map((room) => (
              <Card key={room.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Session {room.session_id}</CardTitle>
                    <Badge variant={getWaitingRoomStatusColor(room.waiting_room_status)}>
                      {room.waiting_room_status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Patient {room.patient_id} - Provider {room.provider_id}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Waiting Duration</p>
                        <p className="text-sm text-muted-foreground">
                          {room.waiting_duration ? `${room.waiting_duration} min` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Internet Speed</p>
                        <p className="text-sm text-muted-foreground">
                          {room.internet_speed_test ? `${room.internet_speed_test} Mbps` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Technical Checks:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          {room.audio_test_passed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">Audio Test</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {room.video_test_passed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">Video Test</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {room.consent_forms_completed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">Consent Forms</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {room.emergency_contact_verified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">Emergency Contact</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Waiting Room URL: {room.waiting_room_url.substring(0, 50)}...
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Play className="mr-2 h-4 w-4" />
                          Join
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Telehealth Billing Codes</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Billing Code
            </Button>
          </div>

          <div className="grid gap-4">
            {billingCodes.map((code) => (
              <Card key={code.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{code.cpt_code}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="default">{code.telehealth_modifier}</Badge>
                      <Badge variant={code.is_active ? 'default' : 'secondary'}>
                        {code.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {code.service_type} - {code.session_duration_minutes} minutes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Description</p>
                      <p className="text-sm text-muted-foreground">{code.code_description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Reimbursement Rate</p>
                        <p className="text-sm text-muted-foreground">${code.base_reimbursement_rate}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Prior Auth Required</p>
                        <p className="text-sm text-muted-foreground">
                          {code.prior_authorization_required ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Coverage:</p>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          {code.medicare_coverage ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">Medicare</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {code.medicaid_coverage ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">Medicaid</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {code.private_insurance_coverage ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">Private Insurance</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="licensing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>State Licensing</CardTitle>
                <CardDescription>Provider licensing compliance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <FileText className="h-8 w-8" />
                  <span className="ml-2">State licensing information will be displayed here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cross-State Practice</CardTitle>
                <CardDescription>Interstate practice authorization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Globe className="h-8 w-8" />
                  <span className="ml-2">Cross-state practice rules will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Session Analytics</CardTitle>
                <CardDescription>Telehealth session trends and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <TrendingUp className="h-8 w-8" />
                  <span className="ml-2">Session analytics chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
                <CardDescription>Session quality and satisfaction metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Activity className="h-8 w-8" />
                  <span className="ml-2">Quality metrics chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}



