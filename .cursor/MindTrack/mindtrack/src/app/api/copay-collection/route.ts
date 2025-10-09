import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve copay collection records
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const sessionId = searchParams.get('session_id');
    const claimId = searchParams.get('claim_id');
    const collectionStatus = searchParams.get('collection_status');
    const collectionMethod = searchParams.get('collection_method');
    const collectionDateFrom = searchParams.get('collection_date_from');
    const collectionDateTo = searchParams.get('collection_date_to');

    let query = supabase
      .from('copay_collection')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        ),
        telehealth_sessions (
          id,
          session_type,
          session_status,
          scheduled_start_time
        ),
        insurance_claims (
          id,
          claim_number,
          claim_status,
          billed_amount
        )
      `)
      .order('created_at', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }
    if (claimId) {
      query = query.eq('claim_id', claimId);
    }
    if (collectionStatus) {
      query = query.eq('collection_status', collectionStatus);
    }
    if (collectionMethod) {
      query = query.eq('collection_method', collectionMethod);
    }
    if (collectionDateFrom) {
      query = query.gte('collection_date', collectionDateFrom);
    }
    if (collectionDateTo) {
      query = query.lte('collection_date', collectionDateTo);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch copay collection records' }, { status: 500 });
  }
}

// POST - Create copay collection record
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      session_id,
      claim_id,
      copay_amount,
      collection_method,
      collection_date,
      collection_status,
      payment_reference,
      transaction_id,
      collection_notes,
      waived_reason,
      written_off_reason
    } = body;

    // Validate required fields
    if (!patient_id || !copay_amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('copay_collection')
      .insert({
        patient_id,
        session_id,
        claim_id,
        copay_amount,
        collection_method,
        collection_date,
        collection_status: collection_status || 'pending',
        payment_reference,
        transaction_id,
        collection_notes,
        waived_reason,
        written_off_reason
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create copay collection record' }, { status: 500 });
  }
}

// PUT - Update copay collection record
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Copay collection ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('copay_collection')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update copay collection record' }, { status: 500 });
  }
}

// DELETE - Delete copay collection record
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Copay collection ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('copay_collection')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Copay collection record deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete copay collection record' }, { status: 500 });
  }
}











