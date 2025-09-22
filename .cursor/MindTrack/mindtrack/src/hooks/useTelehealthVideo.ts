"use client";

import { useState, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface VideoSession {
  id: string;
  patientId: string;
  providerId: string;
  sessionType: 'consultation' | 'therapy' | 'followup' | 'emergency';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'no_show';
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  roomId: string;
  meetingUrl: string;
  recordingUrl?: string;
  notes?: string;
  diagnosis?: string;
  prescription?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  billingCode?: string;
  cost?: number;
  vrEnabled?: boolean;
  vrSessionData?: any;
}

interface VideoRoom {
  id: string;
  roomId: string;
  name: string;
  description?: string;
  maxParticipants: number;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  participants: string[];
  settings: {
    allowScreenShare: boolean;
    allowRecording: boolean;
    allowChat: boolean;
    allowFileShare: boolean;
    vrEnabled: boolean;
  };
}

interface VRTherapySession {
  id: string;
  sessionId: string;
  therapyType: 'exposure' | 'relaxation' | 'cognitive' | 'social' | 'pain_management';
  vrEnvironment: string;
  duration: number;
  patientProgress: any;
  therapistNotes: string;
  effectivenessScore?: number;
  patientFeedback?: string;
}

interface TelehealthAnalytics {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  noShowSessions: number;
  averageDuration: number;
  sessionTypes: Record<string, number>;
  vrSessions: number;
  totalRevenue: number;
}

export const useTelehealthVideo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
    
    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleApiCall = useCallback(async (url: string, options: RequestInit = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API call failed');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Video Sessions
  const getVideoSessions = useCallback(async (patientId?: string, providerId?: string, status?: string): Promise<VideoSession[]> => {
    const params = new URLSearchParams();
    params.set('action', 'get-sessions');
    if (patientId) params.set('patientId', patientId);
    if (providerId) params.set('providerId', providerId);
    if (status) params.set('status', status);

    const response = await handleApiCall(`/api/telehealth-video?${params.toString()}`);
    return response.data;
  }, [handleApiCall]);

  const createVideoSession = useCallback(async (session: Omit<VideoSession, 'id' | 'roomId' | 'meetingUrl'>): Promise<VideoSession> => {
    const response = await handleApiCall('/api/telehealth-video', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create-session',
        data: session,
      }),
    });
    return response.data;
  }, [handleApiCall]);

  const updateVideoSession = useCallback(async (sessionId: string, updates: Partial<VideoSession>): Promise<VideoSession> => {
    const response = await handleApiCall('/api/telehealth-video', {
      method: 'POST',
      body: JSON.stringify({
        action: 'update-session',
        data: { sessionId, updates },
      }),
    });
    return response.data;
  }, [handleApiCall]);

  const startVideoSession = useCallback(async (sessionId: string): Promise<VideoSession> => {
    const response = await handleApiCall('/api/telehealth-video', {
      method: 'POST',
      body: JSON.stringify({
        action: 'start-session',
        data: { sessionId },
      }),
    });
    return response.data;
  }, [handleApiCall]);

  const endVideoSession = useCallback(async (sessionId: string, notes?: string, diagnosis?: string, prescription?: string): Promise<VideoSession> => {
    const response = await handleApiCall('/api/telehealth-video', {
      method: 'POST',
      body: JSON.stringify({
        action: 'end-session',
        data: { sessionId, notes, diagnosis, prescription },
      }),
    });
    return response.data;
  }, [handleApiCall]);

  // Video Rooms
  const getVideoRoom = useCallback(async (roomId: string): Promise<VideoRoom | null> => {
    const params = new URLSearchParams();
    params.set('action', 'get-room');
    params.set('roomId', roomId);

    const response = await handleApiCall(`/api/telehealth-video?${params.toString()}`);
    return response.data;
  }, [handleApiCall]);

  const createVideoRoom = useCallback(async (room: Omit<VideoRoom, 'id'>): Promise<VideoRoom> => {
    const response = await handleApiCall('/api/telehealth-video', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create-room',
        data: room,
      }),
    });
    return response.data;
  }, [handleApiCall]);

  const joinVideoRoom = useCallback(async (roomId: string, userId: string): Promise<boolean> => {
    const response = await handleApiCall('/api/telehealth-video', {
      method: 'POST',
      body: JSON.stringify({
        action: 'join-room',
        data: { roomId, userId },
      }),
    });
    return response.data.joined;
  }, [handleApiCall]);

  const leaveVideoRoom = useCallback(async (roomId: string, userId: string): Promise<void> => {
    await handleApiCall('/api/telehealth-video', {
      method: 'POST',
      body: JSON.stringify({
        action: 'leave-room',
        data: { roomId, userId },
      }),
    });
  }, [handleApiCall]);

  // VR Therapy Sessions
  const getVRTherapySessions = useCallback(async (sessionId?: string): Promise<VRTherapySession[]> => {
    const params = new URLSearchParams();
    params.set('action', 'get-vr-sessions');
    if (sessionId) params.set('sessionId', sessionId);

    const response = await handleApiCall(`/api/telehealth-video?${params.toString()}`);
    return response.data;
  }, [handleApiCall]);

  const createVRTherapySession = useCallback(async (sessionId: string, vrSession: Omit<VRTherapySession, 'id' | 'sessionId'>): Promise<VRTherapySession> => {
    const response = await handleApiCall('/api/telehealth-video', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create-vr-session',
        data: { sessionId, vrSession },
      }),
    });
    return response.data;
  }, [handleApiCall]);

  const updateVRTherapySession = useCallback(async (vrSessionId: string, updates: Partial<VRTherapySession>): Promise<VRTherapySession> => {
    const response = await handleApiCall('/api/telehealth-video', {
      method: 'POST',
      body: JSON.stringify({
        action: 'update-vr-session',
        data: { vrSessionId, updates },
      }),
    });
    return response.data;
  }, [handleApiCall]);

  // Recording
  const startRecording = useCallback(async (sessionId: string): Promise<boolean> => {
    const response = await handleApiCall('/api/telehealth-video', {
      method: 'POST',
      body: JSON.stringify({
        action: 'start-recording',
        data: { sessionId },
      }),
    });
    return response.data.started;
  }, [handleApiCall]);

  const stopRecording = useCallback(async (sessionId: string, recordingUrl: string): Promise<boolean> => {
    const response = await handleApiCall('/api/telehealth-video', {
      method: 'POST',
      body: JSON.stringify({
        action: 'stop-recording',
        data: { sessionId, recordingUrl },
      }),
    });
    return response.data.stopped;
  }, [handleApiCall]);

  // Emergency Session
  const createEmergencySession = useCallback(async (patientId: string, providerId: string): Promise<VideoSession> => {
    const response = await handleApiCall('/api/telehealth-video', {
      method: 'POST',
      body: JSON.stringify({
        action: 'emergency-session',
        data: { patientId, providerId },
      }),
    });
    return response.data;
  }, [handleApiCall]);

  // Analytics
  const getTelehealthAnalytics = useCallback(async (dateRange?: { start: string; end: string }): Promise<TelehealthAnalytics> => {
    const params = new URLSearchParams();
    params.set('action', 'get-analytics');
    if (dateRange) {
      params.set('startDate', dateRange.start);
      params.set('endDate', dateRange.end);
    }

    const response = await handleApiCall(`/api/telehealth-video?${params.toString()}`);
    return response.data;
  }, [handleApiCall]);

  // WebRTC Signaling
  const sendWebRTCSignal = useCallback((roomId: string, signalData: any) => {
    if (socket && isConnected) {
      socket.emit('webrtc_signal', { roomId, signalData });
    }
  }, [socket, isConnected]);

  const onWebRTCSignal = useCallback((callback: (signalData: any) => void) => {
    if (socket) {
      socket.on('webrtc_signal', callback);
    }
  }, [socket]);

  // Room Events
  const onParticipantJoined = useCallback((callback: (data: any) => void) => {
    if (socket) {
      socket.on('participant_joined', callback);
    }
  }, [socket]);

  const onParticipantLeft = useCallback((callback: (data: any) => void) => {
    if (socket) {
      socket.on('participant_left', callback);
    }
  }, [socket]);

  const onSessionStarted = useCallback((callback: (data: any) => void) => {
    if (socket) {
      socket.on('session_started', callback);
    }
  }, [socket]);

  const onSessionEnded = useCallback((callback: (data: any) => void) => {
    if (socket) {
      socket.on('session_ended', callback);
    }
  }, [socket]);

  const onRecordingStarted = useCallback((callback: (data: any) => void) => {
    if (socket) {
      socket.on('recording_started', callback);
    }
  }, [socket]);

  const onRecordingStopped = useCallback((callback: (data: any) => void) => {
    if (socket) {
      socket.on('recording_stopped', callback);
    }
  }, [socket]);

  // Utility functions
  const formatSessionType = useCallback((sessionType: string): string => {
    return sessionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }, []);

  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-600';
      case 'active':
        return 'text-green-600';
      case 'completed':
        return 'text-gray-600';
      case 'cancelled':
        return 'text-red-600';
      case 'no_show':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  }, []);

  const getStatusBadgeVariant = useCallback((status: string): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'scheduled':
        return 'secondary';
      case 'active':
        return 'default';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'no_show':
        return 'destructive';
      default:
        return 'default';
    }
  }, []);

  const formatDuration = useCallback((duration?: number): string => {
    if (!duration) return 'N/A';
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  return {
    loading,
    error,
    socket,
    isConnected,
    getVideoSessions,
    createVideoSession,
    updateVideoSession,
    startVideoSession,
    endVideoSession,
    getVideoRoom,
    createVideoRoom,
    joinVideoRoom,
    leaveVideoRoom,
    getVRTherapySessions,
    createVRTherapySession,
    updateVRTherapySession,
    startRecording,
    stopRecording,
    createEmergencySession,
    getTelehealthAnalytics,
    sendWebRTCSignal,
    onWebRTCSignal,
    onParticipantJoined,
    onParticipantLeft,
    onSessionStarted,
    onSessionEnded,
    onRecordingStarted,
    onRecordingStopped,
    formatSessionType,
    getStatusColor,
    getStatusBadgeVariant,
    formatDuration,
    formatDate,
  };
};



