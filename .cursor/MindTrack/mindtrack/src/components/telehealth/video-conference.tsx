"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Monitor,
  MonitorOff,
  Users,
  Settings,
  MessageSquare,
  Share2,
  Record,
  StopCircle,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  User,
  Shield,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff
} from "lucide-react";

/**
 * Video Conference Component - Telehealth için video konferans arayüzü
 * 
 * Bu component ne işe yarar:
 * - Video ve ses kontrolü
 * - Screen sharing
 * - Chat functionality
 * - Recording management
 * - Security controls
 * - Participant management
 * - Quality monitoring
 */
interface Participant {
  id: string;
  name: string;
  role: 'host' | 'participant' | 'observer';
  isVideoOn: boolean;
  isAudioOn: boolean;
  isScreenSharing: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  joinTime: Date;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'alert';
}

export function VideoConference() {
  // State management for video conference
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [meetingId, setMeetingId] = useState('MT-' + Math.random().toString(36).substr(2, 9).toUpperCase());
  const [meetingPassword, setMeetingPassword] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [isWaitingRoom, setIsWaitingRoom] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');

  // Participants and chat state
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      role: 'host',
      isVideoOn: true,
      isAudioOn: true,
      isScreenSharing: false,
      connectionQuality: 'excellent',
      joinTime: new Date()
    },
    {
      id: '2',
      name: 'John Smith',
      role: 'participant',
      isVideoOn: true,
      isAudioOn: false,
      isScreenSharing: false,
      connectionQuality: 'good',
      joinTime: new Date(Date.now() - 5 * 60 * 1000)
    }
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      senderId: 'system',
      senderName: 'System',
      message: 'John Smith joined the meeting',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: 'system'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [waitingParticipants, setWaitingParticipants] = useState<Participant[]>([]);

  // Refs for video elements
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  /**
   * Video toggle function - Local video'yu açıp kapatır
   * Bu fonksiyon ne işe yarar:
   * - Video stream'i enable/disable eder
   * - UI state'i günceller
   * - Participant list'te status'u günceller
   */
  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    // Video stream logic burada implement edilebilir
    console.log(`Video ${!isVideoOn ? 'enabled' : 'disabled'}`);
  };

  /**
   * Audio toggle function - Local audio'yu açıp kapatır
   * Bu fonksiyon ne işe yarar:
   * - Audio stream'i enable/disable eder
   * - UI state'i günceller
   * - Participant list'te status'u günceller
   */
  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    // Audio stream logic burada implement edilebilir
    console.log(`Audio ${!isAudioOn ? 'enabled' : 'disabled'}`);
  };

  /**
   * Screen sharing toggle function - Screen sharing'i başlatır/durdurur
   * Bu fonksiyon ne işe yarar:
   * - Screen sharing stream'i başlatır
   * - UI state'i günceller
   * - Participant list'te screen sharing status'u günceller
   */
  const toggleScreenSharing = () => {
    setIsScreenSharing(!isScreenSharing);
    // Screen sharing logic burada implement edilebilir
    console.log(`Screen sharing ${!isScreenSharing ? 'started' : 'stopped'}`);
  };

  /**
   * Recording toggle function - Meeting recording'i başlatır/durdurur
   * Bu fonksiyon ne işe yarar:
   * - Recording stream'i başlatır
   * - Recording status'u günceller
   * - Recording indicator'ı gösterir
   */
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Recording logic burada implement edilebilir
    console.log(`Recording ${!isRecording ? 'started' : 'stopped'}`);
  };

  /**
   * End meeting function - Meeting'i sonlandırır
   * Bu fonksiyon ne işe yarar:
   * - Tüm stream'leri durdurur
   * - Participant'ları disconnect eder
   * - Recording'i durdurur
   * - Meeting cleanup yapar
   */
  const endMeeting = () => {
    if (confirm('Are you sure you want to end the meeting?')) {
      // Meeting end logic burada implement edilebilir
      console.log('Meeting ended');
      // Redirect to post-meeting page
    }
  };

  /**
   * Send chat message function - Chat mesajı gönderir
   * Bu fonksiyon ne işe yarar:
   * - Chat mesajını ekler
   * - Mesajı diğer participant'lara gönderir
   * - Chat history'yi günceller
   */
  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        senderId: '1', // Current user ID
        senderName: 'Dr. Sarah Johnson',
        message: newMessage,
        timestamp: new Date(),
        type: 'text'
      };
      
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Send message to other participants logic burada implement edilebilir
      console.log('Message sent:', message);
    }
  };

  /**
   * Admit participant function - Waiting room'dan participant'ı kabul eder
   * Bu fonksiyon ne işe yarar:
   * - Participant'ı waiting room'dan çıkarır
   * - Main meeting'e ekler
   * - Participant list'i günceller
   */
  const admitParticipant = (participantId: string) => {
    const participant = waitingParticipants.find(p => p.id === participantId);
    if (participant) {
      setParticipants(prev => [...prev, participant]);
      setWaitingParticipants(prev => prev.filter(p => p.id !== participantId));
      
      // Add system message
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: 'system',
        senderName: 'System',
        message: `${participant.name} joined the meeting`,
        timestamp: new Date(),
        type: 'system'
      };
      setChatMessages(prev => [...prev, systemMessage]);
    }
  };

  /**
   * Connection quality indicator - Connection kalitesini gösterir
   * Bu fonksiyon ne işe yarar:
   * - Connection quality'yi hesaplar
   * - Visual indicator gösterir
   * - Quality-based recommendations verir
   */
  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  /**
   * Connection quality icon - Connection quality için icon gösterir
   * Bu fonksiyon ne işe yarar:
   * - Quality level'a göre icon seçer
   * - Visual feedback sağlar
   */
  const getConnectionQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return <Wifi className="h-4 w-4" />;
      case 'good': return <Wifi className="h-4 w-4" />;
      case 'poor': return <WifiOff className="h-4 w-4" />;
      default: return <Wifi className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Video className="h-6 w-6 text-blue-400" />
              <h1 className="text-xl font-bold">MindTrack Telehealth</h1>
            </div>
            <Badge variant="outline" className="text-green-400 border-green-400">
              {isRecording ? 'Recording' : 'Live'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`${getConnectionQualityColor(connectionQuality)}`}>
                {getConnectionQualityIcon(connectionQuality)}
              </div>
              <span className="text-sm capitalize">{connectionQuality}</span>
            </div>
            
            <div className="text-sm text-gray-400">
              Meeting ID: {meetingId}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Local Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              <div className="absolute bottom-4 left-4">
                <Badge variant="secondary" className="bg-black/50 text-white">
                  You (Host)
                </Badge>
              </div>
              {!isVideoOn && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <VideoOff className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">Video Off</p>
                  </div>
                </div>
              )}
            </div>

            {/* Remote Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              <div className="absolute bottom-4 left-4">
                <Badge variant="secondary" className="bg-black/50 text-white">
                  John Smith
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700">
          <div className="p-4">
            {/* Participants */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participants ({participants.length})
              </h3>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3 p-2 bg-gray-700 rounded">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-medium">
                      {participant.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{participant.name}</span>
                        <Badge variant="outline" size="sm" className="text-xs">
                          {participant.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {participant.isVideoOn ? (
                          <Video className="h-3 w-3 text-green-400" />
                        ) : (
                          <VideoOff className="h-3 w-3 text-red-400" />
                        )}
                        {participant.isAudioOn ? (
                          <Mic className="h-3 w-3 text-green-400" />
                        ) : (
                          <MicOff className="h-3 w-3 text-red-400" />
                        )}
                        {participant.isScreenSharing && (
                          <Monitor className="h-3 w-3 text-blue-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsChatOpen(!isChatOpen)}
                >
                  {isChatOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              {isChatOpen && (
                <div className="space-y-3">
                  <div className="h-32 overflow-y-auto bg-gray-700 rounded p-2 space-y-2">
                    {chatMessages.map((message) => (
                      <div key={message.id} className="text-xs">
                        <span className="font-medium text-blue-400">
                          {message.senderName}:
                        </span>{' '}
                        <span className="text-gray-300">{message.message}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          sendMessage();
                        }
                      }}
                    />
                    <Button size="sm" onClick={sendMessage}>
                      Send
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Waiting Room */}
            {waitingParticipants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  Waiting Room ({waitingParticipants.length})
                </h3>
                <div className="space-y-2">
                  {waitingParticipants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                      <span className="text-sm">{participant.name}</span>
                      <Button size="sm" onClick={() => admitParticipant(participant.id)}>
                        Admit
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="flex items-center justify-center gap-4">
          {/* Video Control */}
          <Button
            variant={isVideoOn ? "default" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full w-12 h-12"
          >
            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          {/* Audio Control */}
          <Button
            variant={isAudioOn ? "default" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full w-12 h-12"
          >
            {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          {/* Screen Sharing */}
          <Button
            variant={isScreenSharing ? "destructive" : "outline"}
            size="lg"
            onClick={toggleScreenSharing}
            className="rounded-full w-12 h-12"
          >
            {isScreenSharing ? <StopCircle className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
          </Button>

          {/* Recording */}
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="lg"
            onClick={toggleRecording}
            className="rounded-full w-12 h-12"
          >
            {isRecording ? <StopCircle className="h-5 w-5" /> : <Record className="h-5 w-5" />}
          </Button>

          {/* End Meeting */}
          <Button
            variant="destructive"
            size="lg"
            onClick={endMeeting}
            className="rounded-full w-12 h-12"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
