import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve patient outcome measures
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const measureName = searchParams.get('measure_name');
    const measureCategory = searchParams.get('measure_category');
    const daysBack = searchParams.get('days_back');

    let query = supabase
      .from('patient_outcome_measures')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        ),
        measurer:users!measured_by (
          id,
          first_name,
          last_name
        )
      `)
      .order('measurement_date', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (measureName) {
      query = query.eq('measure_name', measureName);
    }
    if (measureCategory) {
      query = query.eq('measure_category', measureCategory);
    }
    if (daysBack) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(daysBack));
      query = query.gte('measurement_date', startDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patient outcome measures' }, { status: 500 });
  }
}

// POST - Create new patient outcome measure
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      measure_name,
      measure_category,
      measure_type,
      baseline_value,
      baseline_date,
      current_value,
      measurement_date,
      target_value,
      target_date,
      improvement_threshold,
      measurement_method,
      measurement_tool,
      unit_of_measurement,
      notes,
      measured_by
    } = body;

    // Validate required fields
    if (!patient_id || !measure_name || !measure_category || !measure_type || !current_value) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('patient_outcome_measures')
      .insert({
        patient_id,
        measure_name,
        measure_category,
        measure_type,
        baseline_value,
        baseline_date,
        current_value,
        measurement_date: measurement_date || new Date().toISOString().split('T')[0],
        target_value,
        target_date,
        improvement_threshold,
        measurement_method,
        measurement_tool,
        unit_of_measurement,
        notes,
        measured_by
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create patient outcome measure' }, { status: 500 });
  }
}

// PUT - Update patient outcome measure
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Measure ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('patient_outcome_measures')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update patient outcome measure' }, { status: 500 });
  }
}

// DELETE - Delete patient outcome measure
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Measure ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('patient_outcome_measures')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Patient outcome measure deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete patient outcome measure' }, { status: 500 });
  }
}


