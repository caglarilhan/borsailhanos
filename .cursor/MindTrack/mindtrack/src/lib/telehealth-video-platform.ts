import { SupabaseClient } from '@supabase/supabase-js';
import { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

interface VideoSession {
  id: string;
  patientId: string;
  providerId: string;
  sessionType: 'consultation' | 'therapy' | 'followup' | 'emergency';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'no_show';
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  duration?: number; // in minutes
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

class TelehealthVideoPlatform {
  private supabase: SupabaseClient;
  private io?: SocketIOServer;

  constructor() {
    this.supabase = require('@supabase/supabase-js').createClient(
      NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );
  }

  // Video Session Management
  async createVideoSession(session: Omit<VideoSession, 'id' | 'roomId' | 'meetingUrl'>): Promise<VideoSession> {
    try {
      const roomId = uuidv4();
      const meetingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.mindtrack.com'}/video/${roomId}`;
      
      const newSession: VideoSession = {
        ...session,
        id: uuidv4(),
        roomId,
        meetingUrl
      };

      const { data, error } = await this.supabase
        .from('video_sessions')
        .insert([newSession])
        .select()
        .single();

      if (error) throw error;

      // Create video room
      await this.createVideoRoom({
        roomId,
        name: `${session.sessionType} - ${session.patientId}`,
        description: `Video session for ${session.sessionType}`,
        maxParticipants: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        participants: [session.patientId, session.providerId],
        settings: {
          allowScreenShare: true,
          allowRecording: session.sessionType !== 'emergency',
          allowChat: true,
          allowFileShare: true,
          vrEnabled: session.vrEnabled || false
        }
      });

      return data;
    } catch (error) {
      console.error('Error creating video session:', error);
      throw error;
    }
  }

  async getVideoSessions(patientId?: string, providerId?: string, status?: string): Promise<VideoSession[]> {
    try {
      let query = this.supabase
        .from('video_sessions')
        .select('*')
        .order('scheduledDate', { ascending: false });

      if (patientId) {
        query = query.eq('patientId', patientId);
      }

      if (providerId) {
        query = query.eq('providerId', providerId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching video sessions:', error);
      throw error;
    }
  }

  async updateVideoSession(sessionId: string, updates: Partial<VideoSession>): Promise<VideoSession> {
    try {
      const { data, error } = await this.supabase
        .from('video_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating video session:', error);
      throw error;
    }
  }

  async startVideoSession(sessionId: string): Promise<VideoSession> {
    try {
      const startTime = new Date().toISOString();
      
      const { data, error } = await this.supabase
        .from('video_sessions')
        .update({
          status: 'active',
          startTime
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      // Notify participants via WebSocket
      if (this.io) {
        this.io.to(data.roomId).emit('session_started', {
          sessionId: data.id,
          roomId: data.roomId,
          startTime: data.startTime
        });
      }

      return data;
    } catch (error) {
      console.error('Error starting video session:', error);
      throw error;
    }
  }

  async endVideoSession(sessionId: string, notes?: string, diagnosis?: string, prescription?: string): Promise<VideoSession> {
    try {
      const endTime = new Date().toISOString();
      
      // Get session to calculate duration
      const { data: sessionData } = await this.supabase
        .from('video_sessions')
        .select('startTime')
        .eq('id', sessionId)
        .single();

      let duration = 0;
      if (sessionData?.startTime) {
        const start = new Date(sessionData.startTime);
        const end = new Date(endTime);
        duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // minutes
      }

      const updates: any = {
        status: 'completed',
        endTime,
        duration
      };

      if (notes) updates.notes = notes;
      if (diagnosis) updates.diagnosis = diagnosis;
      if (prescription) updates.prescription = prescription;

      const { data, error } = await this.supabase
        .from('video_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      // Notify participants via WebSocket
      if (this.io) {
        this.io.to(data.roomId).emit('session_ended', {
          sessionId: data.id,
          roomId: data.roomId,
          endTime: data.endTime,
          duration: data.duration
        });
      }

      return data;
    } catch (error) {
      console.error('Error ending video session:', error);
      throw error;
    }
  }

  // Video Room Management
  async createVideoRoom(room: Omit<VideoRoom, 'id'>): Promise<VideoRoom> {
    try {
      const newRoom: VideoRoom = {
        ...room,
        id: uuidv4()
      };

      const { data, error } = await this.supabase
        .from('video_rooms')
        .insert([newRoom])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating video room:', error);
      throw error;
    }
  }

  async getVideoRoom(roomId: string): Promise<VideoRoom | null> {
    try {
      const { data, error } = await this.supabase
        .from('video_rooms')
        .select('*')
        .eq('roomId', roomId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching video room:', error);
      return null;
    }
  }

  async joinVideoRoom(roomId: string, userId: string): Promise<boolean> {
    try {
      const room = await this.getVideoRoom(roomId);
      if (!room) return false;

      if (room.participants.includes(userId)) {
        return true; // Already a participant
      }

      if (room.participants.length >= room.maxParticipants) {
        return false; // Room is full
      }

      const updatedParticipants = [...room.participants, userId];

      const { error } = await this.supabase
        .from('video_rooms')
        .update({ participants: updatedParticipants })
        .eq('roomId', roomId);

      if (error) throw error;

      // Notify other participants via WebSocket
      if (this.io) {
        this.io.to(roomId).emit('participant_joined', {
          userId,
          participants: updatedParticipants
        });
      }

      return true;
    } catch (error) {
      console.error('Error joining video room:', error);
      return false;
    }
  }

  async leaveVideoRoom(roomId: string, userId: string): Promise<void> {
    try {
      const room = await this.getVideoRoom(roomId);
      if (!room) return;

      const updatedParticipants = room.participants.filter(id => id !== userId);

      const { error } = await this.supabase
        .from('video_rooms')
        .update({ participants: updatedParticipants })
        .eq('roomId', roomId);

      if (error) throw error;

      // Notify other participants via WebSocket
      if (this.io) {
        this.io.to(roomId).emit('participant_left', {
          userId,
          participants: updatedParticipants
        });
      }
    } catch (error) {
      console.error('Error leaving video room:', error);
      throw error;
    }
  }

  // VR Therapy Management
  async createVRTherapySession(sessionId: string, vrSession: Omit<VRTherapySession, 'id' | 'sessionId'>): Promise<VRTherapySession> {
    try {
      const newVRSession: VRTherapySession = {
        ...vrSession,
        id: uuidv4(),
        sessionId
      };

      const { data, error } = await this.supabase
        .from('vr_therapy_sessions')
        .insert([newVRSession])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating VR therapy session:', error);
      throw error;
    }
  }

  async getVRTherapySessions(sessionId?: string): Promise<VRTherapySession[]> {
    try {
      let query = this.supabase
        .from('vr_therapy_sessions')
        .select('*');

      if (sessionId) {
        query = query.eq('sessionId', sessionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching VR therapy sessions:', error);
      throw error;
    }
  }

  async updateVRTherapySession(vrSessionId: string, updates: Partial<VRTherapySession>): Promise<VRTherapySession> {
    try {
      const { data, error } = await this.supabase
        .from('vr_therapy_sessions')
        .update(updates)
        .eq('id', vrSessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating VR therapy session:', error);
      throw error;
    }
  }

  // WebRTC Signaling
  async handleWebRTCSignaling(roomId: string, signalData: any): Promise<void> {
    if (this.io) {
      this.io.to(roomId).emit('webrtc_signal', signalData);
    }
  }

  // Recording Management
  async startRecording(sessionId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('video_sessions')
        .update({ recordingUrl: 'recording_in_progress' })
        .eq('id', sessionId);

      if (error) throw error;

      // Notify participants via WebSocket
      if (this.io) {
        const session = await this.getVideoSessions(undefined, undefined, 'active');
        const activeSession = session.find(s => s.id === sessionId);
        if (activeSession) {
          this.io.to(activeSession.roomId).emit('recording_started', { sessionId });
        }
      }

      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }

  async stopRecording(sessionId: string, recordingUrl: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('video_sessions')
        .update({ recordingUrl })
        .eq('id', sessionId);

      if (error) throw error;

      // Notify participants via WebSocket
      if (this.io) {
        const session = await this.getVideoSessions(undefined, undefined, 'active');
        const activeSession = session.find(s => s.id === sessionId);
        if (activeSession) {
          this.io.to(activeSession.roomId).emit('recording_stopped', { sessionId, recordingUrl });
        }
      }

      return true;
    } catch (error) {
      console.error('Error stopping recording:', error);
      return false;
    }
  }

  // Analytics
  async getTelehealthAnalytics(dateRange?: { start: string; end: string }): Promise<any> {
    try {
      let query = this.supabase
        .from('video_sessions')
        .select('*');

      if (dateRange) {
        query = query
          .gte('scheduledDate', dateRange.start)
          .lte('scheduledDate', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;

      const analytics = {
        totalSessions: data?.length || 0,
        completedSessions: data?.filter(s => s.status === 'completed').length || 0,
        cancelledSessions: data?.filter(s => s.status === 'cancelled').length || 0,
        noShowSessions: data?.filter(s => s.status === 'no_show').length || 0,
        averageDuration: this.calculateAverageDuration(data || []),
        sessionTypes: data?.reduce((acc: any, session) => {
          acc[session.sessionType] = (acc[session.sessionType] || 0) + 1;
          return acc;
        }, {}) || {},
        vrSessions: data?.filter(s => s.vrEnabled).length || 0,
        totalRevenue: data?.reduce((sum, session) => sum + (session.cost || 0), 0) || 0
      };

      return analytics;
    } catch (error) {
      console.error('Error calculating telehealth analytics:', error);
      throw error;
    }
  }

  private calculateAverageDuration(sessions: VideoSession[]): number {
    const completedSessions = sessions.filter(s => s.duration && s.duration > 0);
    if (completedSessions.length === 0) return 0;

    const totalDuration = completedSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    return totalDuration / completedSessions.length;
  }

  // Socket.IO Integration
  setSocketIO(io: SocketIOServer): void {
    this.io = io;
  }

  // Emergency Session Handling
  async createEmergencySession(patientId: string, providerId: string): Promise<VideoSession> {
    try {
      const emergencySession = await this.createVideoSession({
        patientId,
        providerId,
        sessionType: 'emergency',
        status: 'scheduled',
        scheduledDate: new Date().toISOString(),
        vrEnabled: false
      });

      // Immediately start the emergency session
      await this.startVideoSession(emergencySession.id);

      return emergencySession;
    } catch (error) {
      console.error('Error creating emergency session:', error);
      throw error;
    }
  }

  // Quality of Service Monitoring
  async logConnectionQuality(sessionId: string, qualityData: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('connection_quality_logs')
        .insert([{
          sessionId,
          timestamp: new Date().toISOString(),
          qualityData
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error logging connection quality:', error);
    }
  }
}

export default TelehealthVideoPlatform;
