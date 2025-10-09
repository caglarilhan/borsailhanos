import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve CME registrations
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const practitionerId = searchParams.get('practitioner_id');
    const activityId = searchParams.get('activity_id');
    const registrationStatus = searchParams.get('registration_status');
    const paymentStatus = searchParams.get('payment_status');

    let query = supabase
      .from('cme_registrations')
      .select(`
        *,
        practitioners:users!practitioner_id (
          id,
          first_name,
          last_name,
          email
        ),
        cme_activities (
          id,
          activity_title,
          activity_type,
          activity_format,
          cme_credits,
          activity_date
        )
      `)
      .order('registration_date', { ascending: false });

    if (practitionerId) {
      query = query.eq('practitioner_id', practitionerId);
    }
    if (activityId) {
      query = query.eq('activity_id', activityId);
    }
    if (registrationStatus) {
      query = query.eq('registration_status', registrationStatus);
    }
    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch CME registrations' }, { status: 500 });
  }
}

// POST - Create CME registration
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      registration_id,
      practitioner_id,
      activity_id,
      registration_status,
      payment_status,
      payment_amount,
      payment_method,
      payment_reference,
      attendance_confirmed,
      attendance_date,
      completion_date,
      evaluation_completed,
      evaluation_score,
      post_test_completed,
      post_test_score,
      certificate_issued,
      certificate_url,
      notes
    } = body;

    // Validate required fields
    if (!registration_id || !practitioner_id || !activity_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('cme_registrations')
      .insert({
        registration_id,
        practitioner_id,
        activity_id,
        registration_status: registration_status || 'registered',
        payment_status: payment_status || 'pending',
        payment_amount,
        payment_method,
        payment_reference,
        attendance_confirmed: attendance_confirmed || false,
        attendance_date,
        completion_date,
        evaluation_completed: evaluation_completed || false,
        evaluation_score,
        post_test_completed: post_test_completed || false,
        post_test_score,
        certificate_issued: certificate_issued || false,
        certificate_url,
        notes
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create CME registration' }, { status: 500 });
  }
}

// PUT - Update CME registration
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'CME registration ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('cme_registrations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update CME registration' }, { status: 500 });
  }
}

// DELETE - Delete CME registration
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'CME registration ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('cme_registrations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'CME registration deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete CME registration' }, { status: 500 });
  }
}











