import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve patient quality measures
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const measureId = searchParams.get('measure_id');
    const practitionerId = searchParams.get('practitioner_id');
    const measurementPeriodStart = searchParams.get('measurement_period_start');
    const measurementPeriodEnd = searchParams.get('measurement_period_end');
    const validationStatus = searchParams.get('validation_status');

    let query = supabase
      .from('patient_quality_measures')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        ),
        quality_measures (
          id,
          measure_id,
          measure_name,
          measure_type,
          measure_domain
        ),
        practitioners:users!practitioner_id (
          id,
          first_name,
          last_name,
          email
        ),
        validators:users!validated_by (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('measurement_date', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (measureId) {
      query = query.eq('measure_id', measureId);
    }
    if (practitionerId) {
      query = query.eq('practitioner_id', practitionerId);
    }
    if (measurementPeriodStart) {
      query = query.gte('measurement_period_start', measurementPeriodStart);
    }
    if (measurementPeriodEnd) {
      query = query.lte('measurement_period_end', measurementPeriodEnd);
    }
    if (validationStatus) {
      query = query.eq('validation_status', validationStatus);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patient quality measures' }, { status: 500 });
  }
}

// POST - Create patient quality measure
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      measure_id,
      practitioner_id,
      measurement_period_start,
      measurement_period_end,
      numerator_value,
      denominator_value,
      exclusion_value,
      performance_rate,
      meets_criteria,
      measurement_date,
      measurement_notes,
      data_source,
      validation_status
    } = body;

    // Validate required fields
    if (!patient_id || !measure_id || !practitioner_id || !measurement_period_start || !measurement_period_end || !measurement_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('patient_quality_measures')
      .insert({
        patient_id,
        measure_id,
        practitioner_id,
        measurement_period_start,
        measurement_period_end,
        numerator_value: numerator_value || 0,
        denominator_value: denominator_value || 0,
        exclusion_value: exclusion_value || 0,
        performance_rate,
        meets_criteria: meets_criteria || false,
        measurement_date,
        measurement_notes,
        data_source,
        validation_status: validation_status || 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create patient quality measure' }, { status: 500 });
  }
}

// PUT - Update patient quality measure
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Patient quality measure ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('patient_quality_measures')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update patient quality measure' }, { status: 500 });
  }
}

// DELETE - Delete patient quality measure
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Patient quality measure ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('patient_quality_measures')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Patient quality measure deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete patient quality measure' }, { status: 500 });
  }
}


