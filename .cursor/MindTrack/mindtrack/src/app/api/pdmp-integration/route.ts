import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve PDMP integration records
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const prescriptionId = searchParams.get('prescription_id');
    const queryStatus = searchParams.get('query_status');
    const daysBack = searchParams.get('days_back');

    let query = supabase
      .from('pdmp_integration')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        ),
        prescriptions (
          id,
          medication_name,
          prescriber_id
        )
      `)
      .order('pdmp_query_date', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (prescriptionId) {
      query = query.eq('prescription_id', prescriptionId);
    }
    if (queryStatus) {
      query = query.eq('query_status', queryStatus);
    }
    if (daysBack) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(daysBack));
      query = query.gte('pdmp_query_date', startDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch PDMP integration records' }, { status: 500 });
  }
}

// POST - Create new PDMP integration record
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      prescription_id,
      pdmp_response,
      controlled_substances_found,
      prescription_history,
      risk_score,
      risk_factors,
      alerts_generated,
      prescriber_verification,
      prescriber_verification_date,
      prescriber_verification_method,
      state_pdmp_id,
      federal_pdmp_id,
      query_status,
      error_message,
      retry_count
    } = body;

    // Validate required fields
    if (!patient_id || !prescription_id || !pdmp_response || !query_status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('pdmp_integration')
      .insert({
        patient_id,
        prescription_id,
        pdmp_response,
        controlled_substances_found,
        prescription_history,
        risk_score,
        risk_factors,
        alerts_generated,
        prescriber_verification: prescriber_verification || false,
        prescriber_verification_date,
        prescriber_verification_method,
        state_pdmp_id,
        federal_pdmp_id,
        query_status,
        error_message,
        retry_count: retry_count || 0
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create PDMP integration record' }, { status: 500 });
  }
}

// PUT - Update PDMP integration record
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'PDMP integration record ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('pdmp_integration')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update PDMP integration record' }, { status: 500 });
  }
}

// DELETE - Delete PDMP integration record
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'PDMP integration record ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('pdmp_integration')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'PDMP integration record deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete PDMP integration record' }, { status: 500 });
  }
}




