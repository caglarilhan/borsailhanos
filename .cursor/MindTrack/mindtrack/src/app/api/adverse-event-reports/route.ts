import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve adverse event reports
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const eventType = searchParams.get('event_type');
    const severityLevel = searchParams.get('severity_level');
    const causalityAssessment = searchParams.get('causality_assessment');
    const medicationName = searchParams.get('medication_name');
    const outcome = searchParams.get('outcome');
    const daysBack = searchParams.get('days_back');

    let query = supabase
      .from('adverse_event_reports')
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
        )
      `)
      .order('event_date', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (eventType) {
      query = query.eq('event_type', eventType);
    }
    if (severityLevel) {
      query = query.eq('severity_level', severityLevel);
    }
    if (causalityAssessment) {
      query = query.eq('causality_assessment', causalityAssessment);
    }
    if (medicationName) {
      query = query.eq('medication_name', medicationName);
    }
    if (outcome) {
      query = query.eq('outcome', outcome);
    }
    if (daysBack) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(daysBack));
      query = query.gte('event_date', startDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch adverse event reports' }, { status: 500 });
  }
}

// POST - Create new adverse event report
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      event_type,
      severity_level,
      causality_assessment,
      medication_name,
      medication_dose,
      medication_route,
      medication_frequency,
      time_to_onset,
      event_description,
      symptoms_experienced,
      signs_observed,
      laboratory_abnormalities,
      vital_signs_abnormalities,
      treatment_provided,
      outcome,
      outcome_date,
      sequelae_description,
      dechallenge_result,
      rechallenge_result,
      reported_to_fda,
      fda_report_number,
      fda_report_date,
      reported_to_manufacturer,
      manufacturer_report_number,
      manufacturer_report_date,
      reported_by
    } = body;

    // Validate required fields
    if (!patient_id || !event_type || !severity_level || !causality_assessment || !medication_name || !event_description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('adverse_event_reports')
      .insert({
        patient_id,
        event_type,
        severity_level,
        causality_assessment,
        medication_name,
        medication_dose,
        medication_route,
        medication_frequency,
        time_to_onset,
        event_description,
        symptoms_experienced,
        signs_observed,
        laboratory_abnormalities,
        vital_signs_abnormalities,
        treatment_provided,
        outcome,
        outcome_date,
        sequelae_description,
        dechallenge_result,
        rechallenge_result,
        reported_to_fda: reported_to_fda || false,
        fda_report_number,
        fda_report_date,
        reported_to_manufacturer: reported_to_manufacturer || false,
        manufacturer_report_number,
        manufacturer_report_date,
        reported_by
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create adverse event report' }, { status: 500 });
  }
}

// PUT - Update adverse event report
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Adverse event report ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('adverse_event_reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update adverse event report' }, { status: 500 });
  }
}

// DELETE - Delete adverse event report
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Adverse event report ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('adverse_event_reports')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Adverse event report deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete adverse event report' }, { status: 500 });
  }
}











