import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve insurance providers
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const providerType = searchParams.get('provider_type');
    const isActive = searchParams.get('is_active');
    const coverageArea = searchParams.get('coverage_area');

    let query = supabase
      .from('insurance_providers')
      .select('*')
      .order('provider_name', { ascending: true });

    if (providerType) {
      query = query.eq('provider_type', providerType);
    }
    if (isActive) {
      query = query.eq('is_active', isActive === 'true');
    }
    if (coverageArea) {
      query = query.eq('coverage_area', coverageArea);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch insurance providers' }, { status: 500 });
  }
}

// POST - Create new insurance provider
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      provider_name,
      provider_code,
      provider_type,
      plan_name,
      plan_type,
      coverage_area,
      eligibility_api_endpoint,
      prior_auth_api_endpoint,
      claims_api_endpoint,
      copay_structure,
      deductible_amount,
      out_of_pocket_max,
      mental_health_coverage,
      substance_abuse_coverage,
      telehealth_coverage,
      prior_auth_required,
      prior_auth_threshold,
      session_limit_per_year,
      session_limit_per_month,
      copay_amount,
      coinsurance_percentage,
      is_active,
      effective_date,
      expiration_date
    } = body;

    // Validate required fields
    if (!provider_name || !provider_code || !provider_type || !effective_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('insurance_providers')
      .insert({
        provider_name,
        provider_code,
        provider_type,
        plan_name,
        plan_type,
        coverage_area,
        eligibility_api_endpoint,
        prior_auth_api_endpoint,
        claims_api_endpoint,
        copay_structure,
        deductible_amount,
        out_of_pocket_max,
        mental_health_coverage: mental_health_coverage !== undefined ? mental_health_coverage : true,
        substance_abuse_coverage: substance_abuse_coverage !== undefined ? substance_abuse_coverage : true,
        telehealth_coverage: telehealth_coverage !== undefined ? telehealth_coverage : true,
        prior_auth_required: prior_auth_required || false,
        prior_auth_threshold,
        session_limit_per_year,
        session_limit_per_month,
        copay_amount,
        coinsurance_percentage,
        is_active: is_active !== undefined ? is_active : true,
        effective_date,
        expiration_date
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create insurance provider' }, { status: 500 });
  }
}

// PUT - Update insurance provider
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('insurance_providers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update insurance provider' }, { status: 500 });
  }
}

// DELETE - Delete insurance provider
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('insurance_providers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Insurance provider deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete insurance provider' }, { status: 500 });
  }
}


