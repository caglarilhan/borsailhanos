import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve telehealth billing codes
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const cptCode = searchParams.get('cpt_code');
    const serviceType = searchParams.get('service_type');
    const isActive = searchParams.get('is_active');
    const medicareCoverage = searchParams.get('medicare_coverage');
    const medicaidCoverage = searchParams.get('medicaid_coverage');

    let query = supabase
      .from('telehealth_billing_codes')
      .select('*')
      .order('cpt_code', { ascending: true });

    if (cptCode) {
      query = query.eq('cpt_code', cptCode);
    }
    if (serviceType) {
      query = query.eq('service_type', serviceType);
    }
    if (isActive) {
      query = query.eq('is_active', isActive === 'true');
    }
    if (medicareCoverage) {
      query = query.eq('medicare_coverage', medicareCoverage === 'true');
    }
    if (medicaidCoverage) {
      query = query.eq('medicaid_coverage', medicaidCoverage === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch telehealth billing codes' }, { status: 500 });
  }
}

// POST - Create new telehealth billing code
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      cpt_code,
      code_description,
      service_type,
      session_duration_minutes,
      base_reimbursement_rate,
      telehealth_modifier,
      place_of_service_code,
      medicare_coverage,
      medicaid_coverage,
      private_insurance_coverage,
      state_specific_requirements,
      documentation_requirements,
      prior_authorization_required,
      frequency_limits,
      effective_date,
      expiration_date,
      is_active
    } = body;

    // Validate required fields
    if (!cpt_code || !code_description || !service_type || !session_duration_minutes || !base_reimbursement_rate || !telehealth_modifier || !place_of_service_code || !effective_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('telehealth_billing_codes')
      .insert({
        cpt_code,
        code_description,
        service_type,
        session_duration_minutes,
        base_reimbursement_rate,
        telehealth_modifier,
        place_of_service_code,
        medicare_coverage: medicare_coverage !== undefined ? medicare_coverage : true,
        medicaid_coverage: medicaid_coverage !== undefined ? medicaid_coverage : true,
        private_insurance_coverage: private_insurance_coverage !== undefined ? private_insurance_coverage : true,
        state_specific_requirements,
        documentation_requirements,
        prior_authorization_required: prior_authorization_required || false,
        frequency_limits,
        effective_date,
        expiration_date,
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create telehealth billing code' }, { status: 500 });
  }
}

// PUT - Update telehealth billing code
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Billing code ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('telehealth_billing_codes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update telehealth billing code' }, { status: 500 });
  }
}

// DELETE - Delete telehealth billing code
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Billing code ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('telehealth_billing_codes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Telehealth billing code deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete telehealth billing code' }, { status: 500 });
  }
}




