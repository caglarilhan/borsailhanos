"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Users, 
  MessageSquare, 
  Video, 
  Phone, 
  Calendar,
  User,
  Shield,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff,
  FileText,
  Download,
  Eye,
  EyeOff,
  Settings,
  Bell,
  BellOff,
  Heart,
  Activity,
  TrendingUp,
  Info
} from "lucide-react";

/**
 * Virtual Waiting Room Component - Telehealth için sanal bekleme odası
 * 
 * Bu component ne işe yarar:
 * - Client'ları meeting öncesi karşılar
 * - Meeting bilgilerini gösterir
 * - Connection test yapar
 * - Pre-session forms sunar
 * - Estimated wait time gösterir
 * - Security information verir
 * - Technical support sağlar
 */
interface WaitingClient {
  id: string;
  name: string;
  appointmentTime: Date;
  estimatedWaitTime: number; // minutes
  status: 'waiting' | 'ready' | 'in-session' | 'completed';
  priority: 'normal' | 'urgent' | 'emergency';
  connectionTested: boolean;
  formsCompleted: boolean;
  notes?: string;
}

interface WaitTimeEstimate {
  currentPosition: number;
  totalWaiting: number;
  averageWaitTime: number;
  estimatedWaitMinutes: number;
}

interface ConnectionTest {
  videoQuality: 'excellent' | 'good' | 'poor' | 'failed';
  audioQuality: 'excellent' | 'good' | 'poor' | 'failed';
  internetSpeed: number; // Mbps
  latency: number; // ms
  overallScore: number; // 0-100
}

export function VirtualWaitingRoom() {
  // State management for waiting room
  const [clients, setClients] = useState<WaitingClient[]>([
    {
      id: '1',
      name: 'John Smith',
      appointmentTime: new Date(Date.now() + 15 * 60 * 1000),
      estimatedWaitTime: 8,
      status: 'waiting',
      priority: 'normal',
      connectionTested: true,
      formsCompleted: true,
      notes: 'First session, prefers video off initially'
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      appointmentTime: new Date(Date.now() + 30 * 60 * 1000),
      estimatedWaitTime: 15,
      status: 'waiting',
      priority: 'urgent',
      connectionTested: false,
      formsCompleted: false
    },
    {
      id: '3',
      name: 'Mike Johnson',
      appointmentTime: new Date(Date.now() + 45 * 60 * 1000),
      estimatedWaitTime: 22,
      status: 'waiting',
      priority: 'normal',
      connectionTested: true,
      formsCompleted: true
    }
  ]);

  const [currentClient, setCurrentClient] = useState<WaitingClient | null>(null);
  const [waitTimeEstimate, setWaitTimeEstimate] = useState<WaitTimeEstimate>({
    currentPosition: 1,
    totalWaiting: 3,
    averageWaitTime: 12,
    estimatedWaitMinutes: 8
  });

  const [connectionTest, setConnectionTest] = useState<ConnectionTest>({
    videoQuality: 'excellent',
    audioQuality: 'good',
    internetSpeed: 25.5,
    latency: 45,
    overallScore: 87
  });

  const [isConnectionTestRunning, setIsConnectionTestRunning] = useState(false);
  const [showForms, setShowForms] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  /**
   * Start connection test function - Connection kalitesini test eder
   * Bu fonksiyon ne işe yarar:
   * - Video quality test'i başlatır
   * - Audio quality test'i başlatır
   * - Internet speed test'i yapar
   * - Latency test'i yapar
   * - Overall score hesaplar
   */
  const startConnectionTest = async () => {
    setIsConnectionTestRunning(true);
    
    // Simulate connection test
    setTimeout(() => {
      const newTest: ConnectionTest = {
        videoQuality: Math.random() > 0.3 ? 'excellent' : Math.random() > 0.5 ? 'good' : 'poor',
        audioQuality: Math.random() > 0.2 ? 'excellent' : Math.random() > 0.6 ? 'good' : 'poor',
        internetSpeed: Math.random() * 50 + 10,
        latency: Math.random() * 100 + 20,
        overallScore: Math.floor(Math.random() * 40 + 60)
      };
      
      setConnectionTest(newTest);
      setIsConnectionTestRunning(false);
    }, 3000);
  };

  /**
   * Admit client function - Client'ı meeting'e kabul eder
   * Bu fonksiyon ne işe yarar:
   * - Client'ı waiting list'ten çıkarır
   * - Meeting'e yönlendirir
   * - Status'u günceller
   * - Next client'ı hazırlar
   */
  const admitClient = (clientId: string) => {
    setClients(prev => prev.map(client => 
      client.id === clientId 
        ? { ...client, status: 'in-session' as const }
        : client
    ));
    
    // Update current client
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setCurrentClient(client);
    }
    
    // Update wait time estimates
    updateWaitTimeEstimates();
  };

  /**
   * Update wait time estimates function - Bekleme sürelerini günceller
   * Bu fonksiyon ne işe yarar:
   * - Current position'ı günceller
   * - Average wait time'ı hesaplar
   * - Estimated wait time'ı günceller
   */
  const updateWaitTimeEstimates = () => {
    const waitingClients = clients.filter(c => c.status === 'waiting');
    const newEstimate: WaitTimeEstimate = {
      currentPosition: 1,
      totalWaiting: waitingClients.length,
      averageWaitTime: Math.round(waitingClients.reduce((sum, c) => sum + c.estimatedWaitTime, 0) / waitingClients.length),
      estimatedWaitMinutes: Math.round(waitingClients.reduce((sum, c) => sum + c.estimatedWaitTime, 0) / waitingClients.length)
    };
    
    setWaitTimeEstimate(newEstimate);
  };

  /**
   * Get priority color function - Priority level'a göre renk döner
   * Bu fonksiyon ne işe yarar:
   * - Priority badge'leri için renk seçer
   * - Visual hierarchy sağlar
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  /**
   * Get status color function - Status'a göre renk döner
   * Bu fonksiyon ne işe yarar:
   * - Status badge'leri için renk seçer
   * - Visual feedback sağlar
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'in-session': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get connection quality color function - Connection quality'ye göre renk döner
   * Bu fonksiyon ne işe yarar:
   * - Connection quality indicator'ları için renk seçer
   * - Quality-based visual feedback sağlar
   */
  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Virtual Waiting Room</h1>
          <p className="text-gray-600">Welcome to MindTrack Telehealth. We&apos;ll be with you shortly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Waiting Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{waitTimeEstimate.currentPosition}</div>
                    <div className="text-sm text-gray-600">Your Position</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{waitTimeEstimate.estimatedWaitMinutes} min</div>
                    <div className="text-sm text-gray-600">Estimated Wait</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{waitTimeEstimate.totalWaiting}</div>
                    <div className="text-sm text-gray-600">People Waiting</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{waitTimeEstimate.averageWaitTime} min</div>
                    <div className="text-sm text-gray-600">Average Wait</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{Math.round((waitTimeEstimate.currentPosition / (waitTimeEstimate.totalWaiting + 1)) * 100)}%</span>
                  </div>
                  <Progress value={(waitTimeEstimate.currentPosition / (waitTimeEstimate.totalWaiting + 1)) * 100} />
                </div>
              </CardContent>
            </Card>

            {/* Connection Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  Connection Test
                </CardTitle>
                <CardDescription>
                  Test your internet connection before the session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Video Quality:</span>
                    <Badge className={getConnectionQualityColor(connectionTest.videoQuality)}>
                      {connectionTest.videoQuality}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Audio Quality:</span>
                    <Badge className={getConnectionQualityColor(connectionTest.audioQuality)}>
                      {connectionTest.audioQuality}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Internet Speed:</span>
                    <span className="text-sm">{connectionTest.internetSpeed.toFixed(1)} Mbps</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Latency:</span>
                    <span className="text-sm">{connectionTest.latency} ms</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Score:</span>
                    <div className="flex items-center gap-2">
                      <Progress value={connectionTest.overallScore} className="w-20" />
                      <span className="text-sm font-medium">{connectionTest.overallScore}/100</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={startConnectionTest} 
                    disabled={isConnectionTestRunning}
                    className="w-full"
                  >
                    {isConnectionTestRunning ? 'Testing...' : 'Run Connection Test'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pre-Session Forms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Pre-Session Forms
                </CardTitle>
                <CardDescription>
                  Complete these forms to speed up your session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Consent Form</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Medical History</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm font-medium">Current Symptoms</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Forms
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Waiting List
                </CardTitle>
                <CardDescription>
                  {clients.filter(c => c.status === 'waiting').length} people waiting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clients
                    .filter(client => client.status === 'waiting')
                    .sort((a, b) => a.estimatedWaitTime - b.estimatedWaitTime)
                    .map((client, index) => (
                      <div key={client.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                              {index + 1}
                            </div>
                            <span className="text-sm font-medium">{client.name}</span>
                          </div>
                          <Badge className={getPriorityColor(client.priority)}>
                            {client.priority}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Wait: {client.estimatedWaitTime} min</span>
                          <div className="flex items-center gap-1">
                            {client.connectionTested ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <AlertCircle className="h-3 w-3 text-yellow-500" />
                            )}
                            {client.formsCompleted ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <AlertCircle className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                        </div>
                        
                        {client.notes && (
                          <p className="text-xs text-gray-600 mt-2 italic">&quot;{client.notes}&quot;</p>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Session Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Enable Notifications
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Health Tips
                </Button>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>End-to-end encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>HIPAA compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Secure connection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Privacy protected</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
