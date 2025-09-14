import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve prior authorization requests
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const providerId = searchParams.get('provider_id');
    const insuranceProviderId = searchParams.get('insurance_provider_id');
    const requestStatus = searchParams.get('request_status');
    const requestType = searchParams.get('request_type');

    let query = supabase
      .from('prior_authorization_requests')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        ),
        insurance_providers (
          id,
          provider_name,
          provider_code,
          provider_type
        ),
        providers:users!provider_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('submission_date', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (providerId) {
      query = query.eq('provider_id', providerId);
    }
    if (insuranceProviderId) {
      query = query.eq('insurance_provider_id', insuranceProviderId);
    }
    if (requestStatus) {
      query = query.eq('request_status', requestStatus);
    }
    if (requestType) {
      query = query.eq('request_type', requestType);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prior authorization requests' }, { status: 500 });
  }
}

// POST - Create prior authorization request
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      insurance_provider_id,
      provider_id,
      request_type,
      service_type,
      diagnosis_codes,
      procedure_codes,
      requested_sessions,
      requested_duration_months,
      clinical_justification,
      treatment_history,
      previous_treatments,
      current_medications,
      functional_impairment,
      risk_factors,
      treatment_goals,
      expected_outcomes
    } = body;

    // Validate required fields
    if (!patient_id || !insurance_provider_id || !provider_id || !request_type || !service_type || !diagnosis_codes || !procedure_codes || !requested_sessions || !clinical_justification) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('prior_authorization_requests')
      .insert({
        patient_id,
        insurance_provider_id,
        provider_id,
        request_type,
        service_type,
        diagnosis_codes,
        procedure_codes,
        requested_sessions,
        requested_duration_months,
        clinical_justification,
        treatment_history,
        previous_treatments,
        current_medications,
        functional_impairment,
        risk_factors,
        treatment_goals,
        expected_outcomes
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create prior authorization request' }, { status: 500 });
  }
}

// PUT - Update prior authorization request
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Prior authorization ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('prior_authorization_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update prior authorization request' }, { status: 500 });
  }
}

// DELETE - Delete prior authorization request
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Prior authorization ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('prior_authorization_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Prior authorization request deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete prior authorization request' }, { status: 500 });
  }
}


