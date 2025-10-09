"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  ScreenShare, 
  Monitor, 
  Camera, 
  CameraOff,
  Users,
  Clock,
  Calendar,
  Play,
  Pause,
  Square,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Settings,
  FileText,
  Activity,
  Zap,
  Shield,
  Headphones,
  Eye
} from 'lucide-react';
import { useTelehealthVideo } from '@/hooks/useTelehealthVideo';

export default function TelehealthVideoPlatform() {
  const {
    loading,
    error,
    isConnected,
    getVideoSessions,
    createVideoSession,
    startVideoSession,
    endVideoSession,
    joinVideoRoom,
    leaveVideoRoom,
    getVRTherapySessions,
    createVRTherapySession,
    startRecording,
    stopRecording,
    createEmergencySession,
    getTelehealthAnalytics,
    formatSessionType,
    getStatusColor,
    getStatusBadgeVariant,
    formatDuration,
    formatDate,
  } = useTelehealthVideo();

  const [sessions, setSessions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string>('');

  const [newSession, setNewSession] = useState({
    patientId: '',
    providerId: '',
    sessionType: 'consultation' as 'consultation' | 'therapy' | 'followup' | 'emergency',
    scheduledDate: '',
    vrEnabled: false
  });

  const [newVRSession, setNewVRSession] = useState({
    therapyType: 'exposure' as 'exposure' | 'relaxation' | 'cognitive' | 'social' | 'pain_management',
    vrEnvironment: '',
    duration: 30,
    therapistNotes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessionsData, analyticsData] = await Promise.all([
        getVideoSessions(selectedPatient, selectedProvider),
        getTelehealthAnalytics()
      ]);
      
      setSessions(sessionsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCreateSession = async () => {
    try {
      await createVideoSession({
        ...newSession,
        status: 'scheduled'
      });
      setNewSession({
        patientId: '',
        providerId: '',
        sessionType: 'consultation',
        scheduledDate: '',
        vrEnabled: false
      });
      loadData();
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleStartSession = async (sessionId: string) => {
    try {
      const session = await startVideoSession(sessionId);
      setCurrentRoom(session.roomId);
      setIsVideoOn(true);
      setIsAudioOn(true);
      loadData();
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      await endVideoSession(sessionId);
      setCurrentRoom('');
      setIsVideoOn(false);
      setIsAudioOn(false);
      setIsScreenSharing(false);
      setIsRecording(false);
      loadData();
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      const joined = await joinVideoRoom(roomId, 'current-user');
      if (joined) {
        setCurrentRoom(roomId);
        setIsVideoOn(true);
        setIsAudioOn(true);
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      if (currentRoom) {
        await leaveVideoRoom(currentRoom, 'current-user');
        setCurrentRoom('');
        setIsVideoOn(false);
        setIsAudioOn(false);
        setIsScreenSharing(false);
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  const handleStartRecording = async (sessionId: string) => {
    try {
      const started = await startRecording(sessionId);
      if (started) {
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const handleStopRecording = async (sessionId: string) => {
    try {
      const stopped = await stopRecording(sessionId, 'recording-url');
      if (stopped) {
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const handleEmergencySession = async () => {
    try {
      const emergencySession = await createEmergencySession('emergency-patient', 'emergency-provider');
      setCurrentRoom(emergencySession.roomId);
      setIsVideoOn(true);
      setIsAudioOn(true);
      loadData();
    } catch (error) {
      console.error('Error creating emergency session:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Video className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Telehealth Video Platform</h1>
          <p className="text-gray-600">Integrated video conferencing with VR therapy support</p>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {currentRoom && (
              <Badge variant="outline">
                Room: {currentRoom}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="video">Video Call</TabsTrigger>
          <TabsTrigger value="vr">VR Therapy</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Video className="h-5 w-5" />
                  <span>Total Sessions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalSessions || 0}</div>
                <p className="text-sm text-gray-600">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Completed</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{analytics?.completedSessions || 0}</div>
                <p className="text-sm text-gray-600">Successful sessions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  <span>VR Sessions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{analytics?.vrSessions || 0}</div>
                <p className="text-sm text-gray-600">VR therapy sessions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Avg Duration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.averageDuration?.toFixed(1) || 0}m</div>
                <p className="text-sm text-gray-600">Session length</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Telehealth Features</CardTitle>
              <CardDescription>Comprehensive video conferencing and VR therapy capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Video Conferencing</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">HD Video & Audio</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Screen Sharing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Session Recording</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Chat & File Share</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">VR Therapy</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Exposure Therapy</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Relaxation Environments</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Cognitive Training</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Pain Management</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Video Sessions</span>
              </CardTitle>
              <CardDescription>Manage video consultation sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient-id">Patient ID</Label>
                  <Input
                    id="patient-id"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    placeholder="Enter patient ID"
                  />
                </div>
                <div>
                  <Label htmlFor="provider-id">Provider ID</Label>
                  <Input
                    id="provider-id"
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    placeholder="Enter provider ID"
                  />
                </div>
              </div>
              <Button onClick={loadData} disabled={loading}>
                <FileText className="h-4 w-4 mr-2" />
                Load Sessions
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule New Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-patient-id">Patient ID</Label>
                  <Input
                    id="new-patient-id"
                    value={newSession.patientId}
                    onChange={(e) => setNewSession(prev => ({ ...prev, patientId: e.target.value }))}
                    placeholder="Enter patient ID"
                  />
                </div>
                <div>
                  <Label htmlFor="new-provider-id">Provider ID</Label>
                  <Input
                    id="new-provider-id"
                    value={newSession.providerId}
                    onChange={(e) => setNewSession(prev => ({ ...prev, providerId: e.target.value }))}
                    placeholder="Enter provider ID"
                  />
                </div>
                <div>
                  <Label htmlFor="session-type">Session Type</Label>
                  <Select value={newSession.sessionType} onValueChange={(value: any) => setNewSession(prev => ({ ...prev, sessionType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="therapy">Therapy</SelectItem>
                      <SelectItem value="followup">Follow-up</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="scheduled-date">Scheduled Date</Label>
                  <Input
                    id="scheduled-date"
                    type="datetime-local"
                    value={newSession.scheduledDate}
                    onChange={(e) => setNewSession(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="vr-enabled"
                  checked={newSession.vrEnabled}
                  onChange={(e) => setNewSession(prev => ({ ...prev, vrEnabled: e.target.checked }))}
                />
                <Label htmlFor="vr-enabled">Enable VR Therapy</Label>
              </div>
              <Button onClick={handleCreateSession} disabled={loading}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Session
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{formatSessionType(session.sessionType)} Session</span>
                    <Badge variant={getStatusBadgeVariant(session.status)}>
                      {session.status.toUpperCase()}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Patient: {session.patientId} • Provider: {session.providerId}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Scheduled</Label>
                      <div className="text-sm">{formatDate(session.scheduledDate)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Duration</Label>
                      <div className="text-sm">{formatDuration(session.duration)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">VR Enabled</Label>
                      <div className="text-sm">{session.vrEnabled ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {session.status === 'scheduled' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleStartSession(session.id)}
                        disabled={loading}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Session
                      </Button>
                    )}
                    {session.status === 'active' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleJoinRoom(session.roomId)}
                          disabled={loading}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Join Room
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEndSession(session.id)}
                          disabled={loading}
                        >
                          <Square className="h-4 w-4 mr-2" />
                          End Session
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="video" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Video className="h-5 w-5" />
                <span>Video Call Controls</span>
              </CardTitle>
              <CardDescription>Control your video call session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant={isVideoOn ? "default" : "outline"}
                  onClick={() => setIsVideoOn(!isVideoOn)}
                >
                  {isVideoOn ? <Camera className="h-4 w-4 mr-2" /> : <CameraOff className="h-4 w-4 mr-2" />}
                  {isVideoOn ? 'Video On' : 'Video Off'}
                </Button>
                
                <Button
                  variant={isAudioOn ? "default" : "outline"}
                  onClick={() => setIsAudioOn(!isAudioOn)}
                >
                  {isAudioOn ? <Mic className="h-4 w-4 mr-2" /> : <MicOff className="h-4 w-4 mr-2" />}
                  {isAudioOn ? 'Audio On' : 'Audio Off'}
                </Button>
                
                <Button
                  variant={isScreenSharing ? "default" : "outline"}
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                >
                  <ScreenShare className="h-4 w-4 mr-2" />
                  {isScreenSharing ? 'Stop Share' : 'Share Screen'}
                </Button>
                
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={() => setIsRecording(!isRecording)}
                >
                  {isRecording ? <Square className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>
              </div>

              {currentRoom && (
                <div className="flex justify-center">
                  <Button
                    variant="destructive"
                    onClick={handleLeaveRoom}
                    disabled={loading}
                  >
                    <PhoneOff className="h-4 w-4 mr-2" />
                    Leave Call
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video Display Area */}
          <Card>
            <CardHeader>
              <CardTitle>Video Call</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                {currentRoom ? (
                  <div className="text-center text-white">
                    <Video className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg">Video call in progress</p>
                    <p className="text-sm text-gray-400">Room: {currentRoom}</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <VideoOff className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg">No active call</p>
                    <p className="text-sm">Join a session to start video call</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>VR Therapy Sessions</span>
              </CardTitle>
              <CardDescription>Manage VR therapy sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vr-therapy-type">Therapy Type</Label>
                  <Select value={newVRSession.therapyType} onValueChange={(value: any) => setNewVRSession(prev => ({ ...prev, therapyType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exposure">Exposure Therapy</SelectItem>
                      <SelectItem value="relaxation">Relaxation</SelectItem>
                      <SelectItem value="cognitive">Cognitive Training</SelectItem>
                      <SelectItem value="social">Social Skills</SelectItem>
                      <SelectItem value="pain_management">Pain Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vr-environment">VR Environment</Label>
                  <Input
                    id="vr-environment"
                    value={newVRSession.vrEnvironment}
                    onChange={(e) => setNewVRSession(prev => ({ ...prev, vrEnvironment: e.target.value }))}
                    placeholder="e.g., Beach, Forest, Office"
                  />
                </div>
                <div>
                  <Label htmlFor="vr-duration">Duration (minutes)</Label>
                  <Input
                    id="vr-duration"
                    type="number"
                    value={newVRSession.duration}
                    onChange={(e) => setNewVRSession(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="therapist-notes">Therapist Notes</Label>
                  <Input
                    id="therapist-notes"
                    value={newVRSession.therapistNotes}
                    onChange={(e) => setNewVRSession(prev => ({ ...prev, therapistNotes: e.target.value }))}
                    placeholder="Session notes..."
                  />
                </div>
              </div>
              <Button onClick={() => {}} disabled={loading}>
                <Eye className="h-4 w-4 mr-2" />
                Start VR Session
              </Button>
            </CardContent>
          </Card>

          {/* VR Display Area */}
          <Card>
            <CardHeader>
              <CardTitle>VR Environment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Eye className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg">VR Therapy Environment</p>
                  <p className="text-sm text-gray-300">Immersive therapeutic experience</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>Emergency Video Session</span>
              </CardTitle>
              <CardDescription>Create immediate emergency video consultation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">Emergency Video Consultation</p>
                <p className="text-gray-600 mb-4">
                  This will create an immediate video session for emergency situations.
                </p>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleEmergencySession}
                  disabled={loading}
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Start Emergency Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Telehealth Analytics</span>
              </CardTitle>
              <CardDescription>Comprehensive analytics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{analytics.totalSessions}</div>
                      <div className="text-sm text-gray-600">Total Sessions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{analytics.completedSessions}</div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{analytics.vrSessions}</div>
                      <div className="text-sm text-gray-600">VR Sessions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">${analytics.totalRevenue}</div>
                      <div className="text-sm text-gray-600">Total Revenue</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Session Types Distribution</h3>
                    <div className="space-y-2">
                      {Object.entries(analytics.sessionTypes).map(([sessionType, count]) => (
                        <div key={sessionType} className="flex justify-between items-center">
                          <span className="text-sm">{formatSessionType(sessionType)}</span>
                          <Badge variant="outline">{count as number}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}










