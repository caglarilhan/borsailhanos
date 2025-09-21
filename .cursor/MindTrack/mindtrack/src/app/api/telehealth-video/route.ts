import { NextResponse } from 'next/server';
import TelehealthVideoPlatform from '@/lib/telehealth-video-platform';
import { createClient } from '@supabase/supabase-js';

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const patientId = searchParams.get('patientId');
    const providerId = searchParams.get('providerId');
    const sessionId = searchParams.get('sessionId');
    const roomId = searchParams.get('roomId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const telehealth = new TelehealthVideoPlatform();

    switch (action) {
      case 'get-sessions':
        const sessions = await telehealth.getVideoSessions(patientId || undefined, providerId || undefined, status || undefined);
        return NextResponse.json({ success: true, data: sessions });

      case 'get-room':
        if (!roomId) {
          return NextResponse.json({ success: false, error: 'Room ID required' }, { status: 400 });
        }
        const room = await telehealth.getVideoRoom(roomId);
        return NextResponse.json({ success: true, data: room });

      case 'get-vr-sessions':
        const vrSessions = await telehealth.getVRTherapySessions(sessionId || undefined);
        return NextResponse.json({ success: true, data: vrSessions });

      case 'get-analytics':
        const analyticsDateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined;
        const analytics = await telehealth.getTelehealthAnalytics(analyticsDateRange);
        return NextResponse.json({ success: true, data: analytics });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Telehealth video API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, data } = body;

    const telehealth = new TelehealthVideoPlatform();

    switch (action) {
      case 'create-session':
        const newSession = await telehealth.createVideoSession(data);
        return NextResponse.json({ success: true, data: newSession });

      case 'update-session':
        const updatedSession = await telehealth.updateVideoSession(data.sessionId, data.updates);
        return NextResponse.json({ success: true, data: updatedSession });

      case 'start-session':
        const startedSession = await telehealth.startVideoSession(data.sessionId);
        return NextResponse.json({ success: true, data: startedSession });

      case 'end-session':
        const endedSession = await telehealth.endVideoSession(
          data.sessionId, 
          data.notes, 
          data.diagnosis, 
          data.prescription
        );
        return NextResponse.json({ success: true, data: endedSession });

      case 'create-room':
        const newRoom = await telehealth.createVideoRoom(data);
        return NextResponse.json({ success: true, data: newRoom });

      case 'join-room':
        const joinResult = await telehealth.joinVideoRoom(data.roomId, data.userId);
        return NextResponse.json({ success: true, data: { joined: joinResult } });

      case 'leave-room':
        await telehealth.leaveVideoRoom(data.roomId, data.userId);
        return NextResponse.json({ success: true, message: 'Left room successfully' });

      case 'create-vr-session':
        const newVRSession = await telehealth.createVRTherapySession(data.sessionId, data.vrSession);
        return NextResponse.json({ success: true, data: newVRSession });

      case 'update-vr-session':
        const updatedVRSession = await telehealth.updateVRTherapySession(data.vrSessionId, data.updates);
        return NextResponse.json({ success: true, data: updatedVRSession });

      case 'start-recording':
        const recordingStarted = await telehealth.startRecording(data.sessionId);
        return NextResponse.json({ success: true, data: { started: recordingStarted } });

      case 'stop-recording':
        const recordingStopped = await telehealth.stopRecording(data.sessionId, data.recordingUrl);
        return NextResponse.json({ success: true, data: { stopped: recordingStopped } });

      case 'emergency-session':
        const emergencySession = await telehealth.createEmergencySession(data.patientId, data.providerId);
        return NextResponse.json({ success: true, data: emergencySession });

      case 'log-quality':
        await telehealth.logConnectionQuality(data.sessionId, data.qualityData);
        return NextResponse.json({ success: true, message: 'Quality logged successfully' });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Telehealth video API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


