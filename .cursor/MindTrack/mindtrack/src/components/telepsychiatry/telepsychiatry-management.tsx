"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Video, 
  Phone, 
  Monitor, 
  Activity, 
  AlertTriangle, 
  Calendar, 
  Clock,
  Users,
  Shield,
  Wifi,
  Smartphone,
  Heart,
  Brain,
  Pill,
  MessageSquare,
  Plus,
  Search,
  Filter,
  Download,
  Share2,
  Play,
  Pause,
  Square
} from "lucide-react";

interface TelepsychiatrySession {
  id: string;
  clientName: string;
  sessionDate: string;
  sessionType: string;
  duration: number;
  platform: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  meetingUrl: string;
  meetingId: string;
  billingCode: string;
  insuranceAuth: string;
}

interface RemoteMonitoringDevice {
  id: string;
  deviceType: string;
  deviceName: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastDataSync: string;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  alertsEnabled: boolean;
  adherenceRate: number;
}

interface DigitalTherapeutic {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'completed' | 'discontinued';
  sessionsCompleted: number;
  totalSessions: number;
  effectivenessRating: number;
  adherenceRate: number;
}

interface CrisisIntervention {
  id: string;
  clientName: string;
  crisisType: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  interventionMethod: string;
  crisisDate: string;
  resolved: boolean;
  resolutionTime: number;
}

const TelepsychiatryManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const telepsychiatrySessions: TelepsychiatrySession[] = [
    {
      id: "1",
      clientName: "Sarah Johnson",
      sessionDate: "2024-02-15",
      sessionType: "Follow-up",
      duration: 45,
      platform: "Zoom",
      status: "completed",
      meetingUrl: "https://zoom.us/j/123456789",
      meetingId: "123456789",
      billingCode: "90853",
      insuranceAuth: "AUTH-2024-001"
    },
    {
      id: "2",
      clientName: "Michael Chen",
      sessionDate: "2024-02-16",
      sessionType: "Initial",
      duration: 60,
      platform: "Doxy.me",
      status: "scheduled",
      meetingUrl: "https://doxy.me/dr.smith",
      meetingId: "dr.smith",
      billingCode: "90791",
      insuranceAuth: "AUTH-2024-002"
    },
    {
      id: "3",
      clientName: "Emily Rodriguez",
      sessionDate: "2024-02-14",
      sessionType: "Emergency",
      duration: 30,
      platform: "Phone",
      status: "completed",
      meetingUrl: "",
      meetingId: "",
      billingCode: "90863",
      insuranceAuth: "AUTH-2024-003"
    }
  ];

  const remoteDevices: RemoteMonitoringDevice[] = [
    {
      id: "1",
      deviceType: "Smartphone App",
      deviceName: "MoodTracker Pro",
      status: "active",
      lastDataSync: "2024-02-15 14:30",
      dataQuality: "excellent",
      alertsEnabled: true,
      adherenceRate: 85
    },
    {
      id: "2",
      deviceType: "Smart Watch",
      deviceName: "Apple Watch Series 8",
      status: "active",
      lastDataSync: "2024-02-15 15:45",
      dataQuality: "good",
      alertsEnabled: true,
      adherenceRate: 92
    },
    {
      id: "3",
      deviceType: "Sleep Tracker",
      deviceName: "Oura Ring",
      status: "maintenance",
      lastDataSync: "2024-02-14 08:15",
      dataQuality: "fair",
      alertsEnabled: false,
      adherenceRate: 67
    }
  ];

  const digitalTherapeutics: DigitalTherapeutic[] = [
    {
      id: "1",
      name: "CBT-i Coach",
      type: "Sleep Therapy",
      status: "active",
      sessionsCompleted: 8,
      totalSessions: 12,
      effectivenessRating: 8,
      adherenceRate: 75
    },
    {
      id: "2",
      name: "Woebot",
      type: "CBT App",
      status: "active",
      sessionsCompleted: 15,
      totalSessions: 20,
      effectivenessRating: 7,
      adherenceRate: 88
    },
    {
      id: "3",
      name: "Calm",
      type: "Mindfulness",
      status: "completed",
      sessionsCompleted: 30,
      totalSessions: 30,
      effectivenessRating: 9,
      adherenceRate: 95
    }
  ];

  const crisisInterventions: CrisisIntervention[] = [
    {
      id: "1",
      clientName: "David Wilson",
      crisisType: "Suicidal Ideation",
      severity: "high",
      interventionMethod: "Video Call",
      crisisDate: "2024-02-14 22:30",
      resolved: true,
      resolutionTime: 45
    },
    {
      id: "2",
      clientName: "Lisa Thompson",
      crisisType: "Anxiety Attack",
      severity: "moderate",
      interventionMethod: "Phone",
      crisisDate: "2024-02-15 16:20",
      resolved: true,
      resolutionTime: 25
    },
    {
      id: "3",
      clientName: "James Brown",
      crisisType: "Psychosis",
      severity: "critical",
      interventionMethod: "Emergency Services",
      crisisDate: "2024-02-13 19:15",
      resolved: false,
      resolutionTime: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviceStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Telepsychiatry & Remote Care</h2>
          <p className="text-muted-foreground">
            Comprehensive telepsychiatry and remote monitoring management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="monitoring">Remote Monitoring</TabsTrigger>
          <TabsTrigger value="digital-therapeutics">Digital Therapeutics</TabsTrigger>
          <TabsTrigger value="crisis-interventions">Crisis Interventions</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{telepsychiatrySessions.length}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
                <Monitor className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {remoteDevices.filter(d => d.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Remote monitoring
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Digital Therapeutics</CardTitle>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{digitalTherapeutics.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active programs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Crisis Interventions</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {crisisInterventions.filter(c => !c.resolved).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pending resolution
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>
                  Latest telepsychiatry sessions and status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {telepsychiatrySessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{session.clientName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {session.sessionType} • {session.platform} • {session.duration}min
                      </p>
                    </div>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Monitoring</CardTitle>
                <CardDescription>
                  Remote monitoring device status and data quality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {remoteDevices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{device.deviceName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {device.deviceType} • Adherence: {device.adherenceRate}%
                      </p>
                    </div>
                    <Badge className={getDeviceStatusColor(device.status)}>
                      {device.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Telepsychiatry Sessions</CardTitle>
              <CardDescription>
                Manage and track all telepsychiatry sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {telepsychiatrySessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{session.clientName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {session.sessionDate} • {session.sessionType} • {session.duration} minutes
                        </p>
                      </div>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label className="text-sm font-medium">Platform</Label>
                        <div className="flex items-center mt-1">
                          {session.platform === 'Zoom' && <Video className="h-4 w-4 mr-2" />}
                          {session.platform === 'Phone' && <Phone className="h-4 w-4 mr-2" />}
                          <span className="text-sm">{session.platform}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Meeting Details</Label>
                        <p className="text-sm mt-1 text-muted-foreground">
                          ID: {session.meetingId}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Billing</Label>
                        <p className="text-sm mt-1 text-muted-foreground">
                          Code: {session.billingCode}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      {session.status === 'scheduled' && (
                        <Button size="sm" variant="outline">
                          <Play className="h-3 w-3 mr-1" />
                          Start Session
                        </Button>
                      )}
                      {session.status === 'in_progress' && (
                        <Button size="sm" variant="outline">
                          <Square className="h-3 w-3 mr-1" />
                          End Session
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Notes
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Remote Monitoring Devices</CardTitle>
              <CardDescription>
                Monitor patient data from various remote devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {remoteDevices.map((device) => (
                  <div key={device.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{device.deviceName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {device.deviceType} • Last sync: {device.lastDataSync}
                        </p>
                      </div>
                      <Badge className={getDeviceStatusColor(device.status)}>
                        {device.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label className="text-sm font-medium">Data Quality</Label>
                        <Badge variant="outline" className="mt-1">
                          {device.dataQuality.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Adherence Rate</Label>
                        <div className="mt-2">
                          <Progress value={device.adherenceRate} className="h-2" />
                          <p className="text-sm text-muted-foreground mt-1">
                            {device.adherenceRate}%
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Alerts</Label>
                        <Badge variant={device.alertsEnabled ? "default" : "secondary"} className="mt-1">
                          {device.alertsEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Activity className="h-3 w-3 mr-1" />
                        View Data
                      </Button>
                      <Button size="sm" variant="outline">
                        <Wifi className="h-3 w-3 mr-1" />
                        Sync Now
                      </Button>
                      <Button size="sm" variant="outline">
                        <Shield className="h-3 w-3 mr-1" />
                        Settings
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="digital-therapeutics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Digital Therapeutics</CardTitle>
              <CardDescription>
                Manage digital therapeutic interventions and apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {digitalTherapeutics.map((therapeutic) => (
                  <div key={therapeutic.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{therapeutic.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {therapeutic.type} • {therapeutic.sessionsCompleted}/{therapeutic.totalSessions} sessions
                        </p>
                      </div>
                      <Badge variant={therapeutic.status === 'active' ? 'default' : 'secondary'}>
                        {therapeutic.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label className="text-sm font-medium">Progress</Label>
                        <div className="mt-2">
                          <Progress value={(therapeutic.sessionsCompleted / therapeutic.totalSessions) * 100} className="h-2" />
                          <p className="text-sm text-muted-foreground mt-1">
                            {Math.round((therapeutic.sessionsCompleted / therapeutic.totalSessions) * 100)}% complete
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Effectiveness</Label>
                        <div className="mt-2">
                          <div className="text-2xl font-bold text-blue-600">
                            {therapeutic.effectivenessRating}/10
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Patient rating
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Adherence</Label>
                        <div className="mt-2">
                          <Progress value={therapeutic.adherenceRate} className="h-2" />
                          <p className="text-sm text-muted-foreground mt-1">
                            {therapeutic.adherenceRate}%
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Play className="h-3 w-3 mr-1" />
                        Continue
                      </Button>
                      <Button size="sm" variant="outline">
                        <Activity className="h-3 w-3 mr-1" />
                        Analytics
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Feedback
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crisis-interventions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crisis Interventions</CardTitle>
              <CardDescription>
                Track and manage crisis interventions and emergency responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crisisInterventions.map((crisis) => (
                  <div key={crisis.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{crisis.clientName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {crisis.crisisDate} • {crisis.interventionMethod}
                        </p>
                      </div>
                      <Badge className={getSeverityColor(crisis.severity)}>
                        {crisis.severity.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label className="text-sm font-medium">Crisis Type</Label>
                        <p className="text-sm mt-1 font-medium">{crisis.crisisType}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Resolution Status</Label>
                        <Badge variant={crisis.resolved ? "default" : "destructive"} className="mt-1">
                          {crisis.resolved ? "Resolved" : "Pending"}
                        </Badge>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Resolution Time</Label>
                        <p className="text-sm mt-1">
                          {crisis.resolved ? `${crisis.resolutionTime} minutes` : "Ongoing"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      {!crisis.resolved && (
                        <Button size="sm" variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Emergency Response
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Documentation
                      </Button>
                      <Button size="sm" variant="outline">
                        <Shield className="h-3 w-3 mr-1" />
                        Safety Plan
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Telepsychiatry Compliance</CardTitle>
              <CardDescription>
                HIPAA compliance and regulatory requirements for telepsychiatry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">HIPAA Compliance</h3>
                    <Badge variant="default">Compliant</Badge>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">Encryption Status</Label>
                      <Badge variant="default" className="mt-1">AES-256 Enabled</Badge>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Audit Logging</Label>
                      <Badge variant="default" className="mt-1">Active</Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Recent Compliance Checks</Label>
                    <ul className="text-sm mt-1 text-muted-foreground list-disc list-inside">
                      <li>Platform encryption verified - 2024-02-15</li>
                      <li>Consent documentation reviewed - 2024-02-14</li>
                      <li>Emergency procedures updated - 2024-02-13</li>
                      <li>State licensing verified - 2024-02-12</li>
                    </ul>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">State Licensing</h3>
                    <Badge variant="default">Valid</Badge>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">License Status</Label>
                      <p className="text-sm mt-1">Active in 5 states</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Expiration</Label>
                      <p className="text-sm mt-1">2025-12-31</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TelepsychiatryManagement;
