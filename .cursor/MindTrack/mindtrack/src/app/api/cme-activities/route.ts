import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve CME activities
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const activityType = searchParams.get('activity_type');
    const activityFormat = searchParams.get('activity_format');
    const specialty = searchParams.get('specialty');
    const providerId = searchParams.get('provider_id');
    const isActive = searchParams.get('is_active');

    let query = supabase
      .from('cme_activities')
      .select(`
        *,
        cme_providers (
          id,
          provider_name,
          provider_type,
          accreditation_body
        )
      `)
      .order('activity_date', { ascending: false });

    if (activityType) {
      query = query.eq('activity_type', activityType);
    }
    if (activityFormat) {
      query = query.eq('activity_format', activityFormat);
    }
    if (specialty) {
      query = query.eq('specialty', specialty);
    }
    if (providerId) {
      query = query.eq('provider_id', providerId);
    }
    if (isActive) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch CME activities' }, { status: 500 });
  }
}

// POST - Create CME activity
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      activity_id,
      provider_id,
      activity_title,
      activity_description,
      activity_type,
      activity_format,
      specialty,
      target_audience,
      learning_objectives,
      prerequisites,
      activity_date,
      activity_end_date,
      duration_hours,
      cme_credits,
      max_participants,
      registration_fee,
      registration_deadline,
      location,
      virtual_meeting_url,
      materials_url,
      evaluation_url,
      is_active,
      requires_attendance,
      requires_evaluation,
      requires_post_test,
      passing_score
    } = body;

    // Validate required fields
    if (!activity_id || !provider_id || !activity_title || !activity_type || !activity_format || !duration_hours || !cme_credits) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('cme_activities')
      .insert({
        activity_id,
        provider_id,
        activity_title,
        activity_description,
        activity_type,
        activity_format,
        specialty,
        target_audience,
        learning_objectives,
        prerequisites,
        activity_date,
        activity_end_date,
        duration_hours,
        cme_credits,
        max_participants,
        registration_fee: registration_fee || 0,
        registration_deadline,
        location,
        virtual_meeting_url,
        materials_url,
        evaluation_url,
        is_active: is_active !== undefined ? is_active : true,
        requires_attendance: requires_attendance !== undefined ? requires_attendance : true,
        requires_evaluation: requires_evaluation !== undefined ? requires_evaluation : true,
        requires_post_test: requires_post_test || false,
        passing_score
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create CME activity' }, { status: 500 });
  }
}

// PUT - Update CME activity
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'CME activity ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('cme_activities')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update CME activity' }, { status: 500 });
  }
}

// DELETE - Delete CME activity
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'CME activity ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('cme_activities')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'CME activity deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete CME activity' }, { status: 500 });
  }
}











