import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve insurance claims
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const providerId = searchParams.get('provider_id');
    const insuranceProviderId = searchParams.get('insurance_provider_id');
    const claimStatus = searchParams.get('claim_status');
    const claimType = searchParams.get('claim_type');
    const serviceDateFrom = searchParams.get('service_date_from');
    const serviceDateTo = searchParams.get('service_date_to');

    let query = supabase
      .from('insurance_claims')
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
        ),
        telehealth_sessions (
          id,
          session_type,
          session_status,
          scheduled_start_time
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
    if (claimStatus) {
      query = query.eq('claim_status', claimStatus);
    }
    if (claimType) {
      query = query.eq('claim_type', claimType);
    }
    if (serviceDateFrom) {
      query = query.gte('service_date', serviceDateFrom);
    }
    if (serviceDateTo) {
      query = query.lte('service_date', serviceDateTo);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch insurance claims' }, { status: 500 });
  }
}

// POST - Create insurance claim
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      insurance_provider_id,
      provider_id,
      session_id,
      claim_type,
      service_date,
      service_location,
      diagnosis_codes,
      procedure_codes,
      modifier_codes,
      units,
      billed_amount,
      copay_amount,
      deductible_amount,
      coinsurance_amount
    } = body;

    // Validate required fields
    if (!patient_id || !insurance_provider_id || !provider_id || !claim_type || !service_date || !diagnosis_codes || !procedure_codes || !billed_amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('insurance_claims')
      .insert({
        patient_id,
        insurance_provider_id,
        provider_id,
        session_id,
        claim_type,
        service_date,
        service_location,
        diagnosis_codes,
        procedure_codes,
        modifier_codes,
        units: units || 1,
        billed_amount,
        copay_amount,
        deductible_amount,
        coinsurance_amount
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create insurance claim' }, { status: 500 });
  }
}

// PUT - Update insurance claim
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Claim ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('insurance_claims')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update insurance claim' }, { status: 500 });
  }
}

// DELETE - Delete insurance claim
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Claim ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('insurance_claims')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Insurance claim deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete insurance claim' }, { status: 500 });
  }
}

