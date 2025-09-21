import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve drug level schedules
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const medicationId = searchParams.get('medication_id');
    const activeOnly = searchParams.get('active_only') === 'true';

    let query = supabase
      .from('drug_level_schedules')
      .select(`
        *,
        medications (
          id,
          name,
          generic_name,
          drug_class
        ),
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        ),
        users (
          id,
          first_name,
          last_name
        )
      `)
      .order('next_test_date', { ascending: true });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (medicationId) {
      query = query.eq('medication_id', medicationId);
    }
    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch drug level schedules' }, { status: 500 });
  }
}

// POST - Create new drug level schedule
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      medication_id,
      schedule_type,
      frequency_days,
      next_test_date,
      monitoring_reason,
      created_by
    } = body;

    // Validate required fields
    if (!patient_id || !medication_id || !schedule_type || !frequency_days || !next_test_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('drug_level_schedules')
      .insert({
        patient_id,
        medication_id,
        schedule_type,
        frequency_days,
        next_test_date,
        monitoring_reason,
        created_by
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create drug level schedule' }, { status: 500 });
  }
}

// PUT - Update drug level schedule
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('drug_level_schedules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update drug level schedule' }, { status: 500 });
  }
}

// DELETE - Delete drug level schedule
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('drug_level_schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Drug level schedule deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete drug level schedule' }, { status: 500 });
  }
}



