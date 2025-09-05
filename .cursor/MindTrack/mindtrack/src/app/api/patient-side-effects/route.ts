import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const medicationName = searchParams.get('medication_name');
    const status = searchParams.get('status');

    let query = supabase
      .from('patient_side_effects')
      .select('*');

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (medicationName) {
      query = query.ilike('medication_name', `%${medicationName}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const body = await request.json();
    const {
      patient_id,
      medication_name,
      side_effect_name,
      severity,
      onset_date,
      duration_days,
      frequency,
      intensity_scale,
      impact_on_daily_life,
      current_status,
      action_taken,
      outcome,
      notes
    } = body;

    const { data, error } = await supabase
      .from('patient_side_effects')
      .insert({
        patient_id,
        medication_name,
        side_effect_name,
        severity,
        onset_date,
        duration_days,
        frequency,
        intensity_scale,
        impact_on_daily_life,
        current_status,
        action_taken,
        outcome,
        notes
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const { data, error } = await supabase
      .from('patient_side_effects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('patient_side_effects')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Patient side effect deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
