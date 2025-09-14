import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve claim denials
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const claimId = searchParams.get('claim_id');
    const denialCode = searchParams.get('denial_code');
    const denialCategory = searchParams.get('denial_category');
    const appealEligible = searchParams.get('appeal_eligible');
    const appealStatus = searchParams.get('appeal_status');

    let query = supabase
      .from('claim_denials')
      .select(`
        *,
        insurance_claims (
          id,
          claim_number,
          claim_status,
          billed_amount,
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
          )
        )
      `)
      .order('denial_date', { ascending: false });

    if (claimId) {
      query = query.eq('claim_id', claimId);
    }
    if (denialCode) {
      query = query.eq('denial_code', denialCode);
    }
    if (denialCategory) {
      query = query.eq('denial_category', denialCategory);
    }
    if (appealEligible) {
      query = query.eq('appeal_eligible', appealEligible === 'true');
    }
    if (appealStatus) {
      query = query.eq('appeal_status', appealStatus);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch claim denials' }, { status: 500 });
  }
}

// POST - Create claim denial record
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      claim_id,
      denial_code,
      denial_reason,
      denial_category,
      appeal_eligible,
      appeal_deadline,
      corrective_action_taken,
      prevention_measures
    } = body;

    // Validate required fields
    if (!claim_id || !denial_code || !denial_reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('claim_denials')
      .insert({
        claim_id,
        denial_code,
        denial_reason,
        denial_category,
        appeal_eligible: appeal_eligible !== undefined ? appeal_eligible : true,
        appeal_deadline,
        corrective_action_taken,
        prevention_measures
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create claim denial record' }, { status: 500 });
  }
}

// PUT - Update claim denial record
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Claim denial ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('claim_denials')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update claim denial record' }, { status: 500 });
  }
}

// DELETE - Delete claim denial record
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Claim denial ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('claim_denials')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Claim denial record deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete claim denial record' }, { status: 500 });
  }
}


