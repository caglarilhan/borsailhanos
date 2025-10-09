import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve telehealth sessions
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const providerId = searchParams.get('provider_id');
    const sessionStatus = searchParams.get('session_status');
    const sessionType = searchParams.get('session_type');
    const platform = searchParams.get('platform');
    const daysBack = searchParams.get('days_back');

    let query = supabase
      .from('telehealth_sessions')
      .select(`
        *,
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
      .order('scheduled_start_time', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (providerId) {
      query = query.eq('provider_id', providerId);
    }
    if (sessionStatus) {
      query = query.eq('session_status', sessionStatus);
    }
    if (sessionType) {
      query = query.eq('session_type', sessionType);
    }
    if (platform) {
      query = query.eq('session_platform', platform);
    }
    if (daysBack) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(daysBack));
      query = query.gte('scheduled_start_time', startDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch telehealth sessions' }, { status: 500 });
  }
}

// POST - Create new telehealth session
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      provider_id,
      session_type,
      scheduled_start_time,
      scheduled_end_time,
      session_platform,
      session_url,
      meeting_id,
      meeting_password,
      waiting_room_enabled,
      recording_enabled,
      billing_code,
      insurance_verified,
      prior_authorization_required,
      prior_authorization_obtained,
      copay_amount,
      state_licensing_verified,
      cross_state_practice,
      cross_state_license,
      follow_up_required,
      follow_up_date
    } = body;

    // Validate required fields
    if (!patient_id || !provider_id || !session_type || !scheduled_start_time || !scheduled_end_time || !session_platform) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('telehealth_sessions')
      .insert({
        patient_id,
        provider_id,
        session_type,
        scheduled_start_time,
        scheduled_end_time,
        session_platform,
        session_url,
        meeting_id,
        meeting_password,
        waiting_room_enabled: waiting_room_enabled !== undefined ? waiting_room_enabled : true,
        recording_enabled: recording_enabled || false,
        billing_code,
        insurance_verified: insurance_verified || false,
        prior_authorization_required: prior_authorization_required || false,
        prior_authorization_obtained: prior_authorization_obtained || false,
        copay_amount,
        state_licensing_verified: state_licensing_verified || false,
        cross_state_practice: cross_state_practice || false,
        cross_state_license,
        follow_up_required: follow_up_required || false,
        follow_up_date
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create telehealth session' }, { status: 500 });
  }
}

// PUT - Update telehealth session
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('telehealth_sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update telehealth session' }, { status: 500 });
  }
}

// DELETE - Delete telehealth session
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('telehealth_sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Telehealth session deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete telehealth session' }, { status: 500 });
  }
}











