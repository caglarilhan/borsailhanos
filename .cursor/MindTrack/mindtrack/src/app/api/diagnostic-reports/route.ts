import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve diagnostic reports
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const practitionerId = searchParams.get('practitioner_id');
    const encounterId = searchParams.get('encounter_id');
    const reportType = searchParams.get('report_type');
    const reportCategory = searchParams.get('report_category');
    const reportStatus = searchParams.get('report_status');
    const reportDateFrom = searchParams.get('report_date_from');
    const reportDateTo = searchParams.get('report_date_to');

    let query = supabase
      .from('diagnostic_reports')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        ),
        practitioners:users!practitioner_id (
          id,
          first_name,
          last_name,
          email
        ),
        fhir_encounters (
          id,
          encounter_id,
          encounter_type,
          encounter_class
        )
      `)
      .order('report_date', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (practitionerId) {
      query = query.eq('practitioner_id', practitionerId);
    }
    if (encounterId) {
      query = query.eq('encounter_id', encounterId);
    }
    if (reportType) {
      query = query.eq('report_type', reportType);
    }
    if (reportCategory) {
      query = query.eq('report_category', reportCategory);
    }
    if (reportStatus) {
      query = query.eq('report_status', reportStatus);
    }
    if (reportDateFrom) {
      query = query.gte('report_date', reportDateFrom);
    }
    if (reportDateTo) {
      query = query.lte('report_date', reportDateTo);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch diagnostic reports' }, { status: 500 });
  }
}

// POST - Create diagnostic report
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      practitioner_id,
      encounter_id,
      report_type,
      report_category,
      report_status,
      report_date,
      effective_date,
      conclusion,
      interpretation,
      findings,
      recommendations,
      diagnosis_codes,
      procedure_codes,
      attachments,
      fhir_data
    } = body;

    // Validate required fields
    if (!patient_id || !practitioner_id || !report_type || !report_category || !report_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('diagnostic_reports')
      .insert({
        patient_id,
        practitioner_id,
        encounter_id,
        report_type,
        report_category,
        report_status: report_status || 'final',
        report_date,
        effective_date,
        conclusion,
        interpretation,
        findings,
        recommendations,
        diagnosis_codes,
        procedure_codes,
        attachments,
        fhir_data
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create diagnostic report' }, { status: 500 });
  }
}

// PUT - Update diagnostic report
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('diagnostic_reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update diagnostic report' }, { status: 500 });
  }
}

// DELETE - Delete diagnostic report
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('diagnostic_reports')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Diagnostic report deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete diagnostic report' }, { status: 500 });
  }
}




