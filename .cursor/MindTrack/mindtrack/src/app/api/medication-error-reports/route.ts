import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve medication error reports
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const errorType = searchParams.get('error_type');
    const severityLevel = searchParams.get('severity_level');
    const medicationName = searchParams.get('medication_name');
    const patientHarm = searchParams.get('patient_harm');
    const daysBack = searchParams.get('days_back');

    let query = supabase
      .from('medication_error_reports')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        ),
        reporter:users!reported_by (
          id,
          first_name,
          last_name
        ),
        reviewer:users!reviewed_by (
          id,
          first_name,
          last_name
        )
      `)
      .order('error_date', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (errorType) {
      query = query.eq('error_type', errorType);
    }
    if (severityLevel) {
      query = query.eq('severity_level', severityLevel);
    }
    if (medicationName) {
      query = query.eq('medication_name', medicationName);
    }
    if (patientHarm) {
      query = query.eq('patient_harm', patientHarm === 'true');
    }
    if (daysBack) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(daysBack));
      query = query.gte('error_date', startDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch medication error reports' }, { status: 500 });
  }
}

// POST - Create new medication error report
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      error_type,
      error_category,
      severity_level,
      medication_name,
      intended_dose,
      actual_dose,
      intended_route,
      actual_route,
      intended_frequency,
      actual_frequency,
      error_description,
      contributing_factors,
      root_cause_analysis,
      immediate_actions_taken,
      patient_harm,
      harm_description,
      harm_severity,
      corrective_actions,
      preventive_measures,
      reported_to_fda,
      fda_report_number,
      reported_to_state,
      state_report_number,
      internal_review_completed,
      review_date,
      review_notes,
      reported_by,
      reviewed_by
    } = body;

    // Validate required fields
    if (!patient_id || !error_type || !error_category || !severity_level || !medication_name || !error_description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('medication_error_reports')
      .insert({
        patient_id,
        error_type,
        error_category,
        severity_level,
        medication_name,
        intended_dose,
        actual_dose,
        intended_route,
        actual_route,
        intended_frequency,
        actual_frequency,
        error_description,
        contributing_factors,
        root_cause_analysis,
        immediate_actions_taken,
        patient_harm: patient_harm || false,
        harm_description,
        harm_severity,
        corrective_actions,
        preventive_measures,
        reported_to_fda: reported_to_fda || false,
        fda_report_number,
        reported_to_state: reported_to_state || false,
        state_report_number,
        internal_review_completed: internal_review_completed || false,
        review_date,
        review_notes,
        reported_by,
        reviewed_by
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create medication error report' }, { status: 500 });
  }
}

// PUT - Update medication error report
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Error report ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('medication_error_reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update medication error report' }, { status: 500 });
  }
}

// DELETE - Delete medication error report
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Error report ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('medication_error_reports')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Medication error report deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete medication error report' }, { status: 500 });
  }
}



