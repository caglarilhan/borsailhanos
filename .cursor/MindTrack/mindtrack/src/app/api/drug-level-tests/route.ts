import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve drug level tests
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const medicationId = searchParams.get('medication_id');
    const testType = searchParams.get('test_type');
    const daysBack = searchParams.get('days_back');

    let query = supabase
      .from('drug_level_tests')
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
        )
      `)
      .order('test_date', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (medicationId) {
      query = query.eq('medication_id', medicationId);
    }
    if (testType) {
      query = query.eq('test_type', testType);
    }
    if (daysBack) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(daysBack));
      query = query.gte('test_date', startDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch drug level tests' }, { status: 500 });
  }
}

// POST - Create new drug level test
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      medication_id,
      test_date,
      test_type,
      collection_time,
      last_dose_time,
      last_dose_amount,
      dose_frequency,
      test_result,
      unit,
      therapeutic_range_min,
      therapeutic_range_max,
      toxic_range_min,
      toxic_range_max,
      interpretation,
      clinical_action,
      follow_up_required,
      follow_up_date,
      lab_name,
      lab_reference,
      notes
    } = body;

    // Validate required fields
    if (!patient_id || !medication_id || !test_result || !unit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('drug_level_tests')
      .insert({
        patient_id,
        medication_id,
        test_date: test_date || new Date().toISOString(),
        test_type: test_type || 'random',
        collection_time: collection_time || new Date().toISOString(),
        last_dose_time,
        last_dose_amount,
        dose_frequency,
        test_result,
        unit,
        therapeutic_range_min,
        therapeutic_range_max,
        toxic_range_min,
        toxic_range_max,
        interpretation,
        clinical_action,
        follow_up_required: follow_up_required || false,
        follow_up_date,
        lab_name,
        lab_reference,
        notes
      })
      .select()
      .single();

    if (error) throw error;

    // Create alerts if needed
    if (data.is_toxic) {
      await supabase.rpc('create_drug_level_alert', {
        p_patient_id: patient_id,
        p_medication_id: medication_id,
        p_test_id: data.id,
        p_alert_type: 'toxic',
        p_severity: 'critical',
        p_message: `Toxic drug level detected: ${test_result} ${unit}`,
        p_recommendation: 'Consider dose reduction or discontinuation'
      });
    } else if (data.is_subtherapeutic) {
      await supabase.rpc('create_drug_level_alert', {
        p_patient_id: patient_id,
        p_medication_id: medication_id,
        p_test_id: data.id,
        p_alert_type: 'subtherapeutic',
        p_severity: 'medium',
        p_message: `Subtherapeutic drug level detected: ${test_result} ${unit}`,
        p_recommendation: 'Consider dose increase'
      });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create drug level test' }, { status: 500 });
  }
}

// PUT - Update drug level test
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('drug_level_tests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update drug level test' }, { status: 500 });
  }
}

// DELETE - Delete drug level test
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('drug_level_tests')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Drug level test deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete drug level test' }, { status: 500 });
  }
}


