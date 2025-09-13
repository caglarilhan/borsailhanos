import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve virtual waiting rooms
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const patientId = searchParams.get('patient_id');
    const providerId = searchParams.get('provider_id');
    const waitingRoomStatus = searchParams.get('waiting_room_status');

    let query = supabase
      .from('virtual_waiting_rooms')
      .select(`
        *,
        telehealth_sessions (
          id,
          session_type,
          session_status,
          scheduled_start_time
        ),
        clients (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        providers:users!provider_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (providerId) {
      query = query.eq('provider_id', providerId);
    }
    if (waitingRoomStatus) {
      query = query.eq('waiting_room_status', waitingRoomStatus);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch virtual waiting rooms' }, { status: 500 });
  }
}

// POST - Create virtual waiting room
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      session_id,
      patient_id,
      provider_id,
      waiting_room_url,
      patient_ready,
      provider_ready,
      technical_check_completed,
      audio_test_passed,
      video_test_passed,
      internet_speed_test,
      device_compatibility_check,
      browser_compatibility_check,
      consent_forms_completed,
      emergency_contact_verified,
      emergency_protocols_reviewed
    } = body;

    // Validate required fields
    if (!session_id || !patient_id || !provider_id || !waiting_room_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('virtual_waiting_rooms')
      .insert({
        session_id,
        patient_id,
        provider_id,
        waiting_room_url,
        patient_ready: patient_ready || false,
        provider_ready: provider_ready || false,
        technical_check_completed: technical_check_completed || false,
        audio_test_passed: audio_test_passed || false,
        video_test_passed: video_test_passed || false,
        internet_speed_test,
        device_compatibility_check: device_compatibility_check || false,
        browser_compatibility_check: browser_compatibility_check || false,
        consent_forms_completed: consent_forms_completed || false,
        emergency_contact_verified: emergency_contact_verified || false,
        emergency_protocols_reviewed: emergency_protocols_reviewed || false
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create virtual waiting room' }, { status: 500 });
  }
}

// PUT - Update virtual waiting room
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Waiting room ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('virtual_waiting_rooms')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update virtual waiting room' }, { status: 500 });
  }
}

// DELETE - Delete virtual waiting room
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Waiting room ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('virtual_waiting_rooms')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Virtual waiting room deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete virtual waiting room' }, { status: 500 });
  }
}

