import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve patient insurance coverage
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const insuranceProviderId = searchParams.get('insurance_provider_id');
    const verificationStatus = searchParams.get('verification_status');
    const isActive = searchParams.get('is_active');
    const isPrimary = searchParams.get('is_primary');

    let query = supabase
      .from('patient_insurance_coverage')
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
          provider_type,
          plan_name,
          plan_type
        )
      `)
      .order('created_at', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (insuranceProviderId) {
      query = query.eq('insurance_provider_id', insuranceProviderId);
    }
    if (verificationStatus) {
      query = query.eq('verification_status', verificationStatus);
    }
    if (isActive) {
      query = query.eq('is_active', isActive === 'true');
    }
    if (isPrimary) {
      query = query.eq('is_primary', isPrimary === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patient insurance coverage' }, { status: 500 });
  }
}

// POST - Create patient insurance coverage
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      insurance_provider_id,
      policy_number,
      group_number,
      subscriber_id,
      subscriber_name,
      subscriber_relationship,
      effective_date,
      expiration_date,
      is_primary,
      is_active,
      copay_amount,
      deductible_remaining,
      out_of_pocket_remaining,
      session_limit
    } = body;

    // Validate required fields
    if (!patient_id || !insurance_provider_id || !policy_number || !effective_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('patient_insurance_coverage')
      .insert({
        patient_id,
        insurance_provider_id,
        policy_number,
        group_number,
        subscriber_id,
        subscriber_name,
        subscriber_relationship,
        effective_date,
        expiration_date,
        is_primary: is_primary !== undefined ? is_primary : true,
        is_active: is_active !== undefined ? is_active : true,
        copay_amount,
        deductible_remaining,
        out_of_pocket_remaining,
        session_limit
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create patient insurance coverage' }, { status: 500 });
  }
}

// PUT - Update patient insurance coverage
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Coverage ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('patient_insurance_coverage')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update patient insurance coverage' }, { status: 500 });
  }
}

// DELETE - Delete patient insurance coverage
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Coverage ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('patient_insurance_coverage')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Patient insurance coverage deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete patient insurance coverage' }, { status: 500 });
  }
}


