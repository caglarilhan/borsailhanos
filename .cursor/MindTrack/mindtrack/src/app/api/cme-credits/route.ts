import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve CME credits
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const practitionerId = searchParams.get('practitioner_id');
    const activityId = searchParams.get('activity_id');
    const creditType = searchParams.get('credit_type');
    const creditYear = searchParams.get('credit_year');
    const creditStatus = searchParams.get('credit_status');

    let query = supabase
      .from('cme_credits')
      .select(`
        *,
        practitioners:users!practitioner_id (
          id,
          first_name,
          last_name,
          email
        ),
        cme_activities (
          id,
          activity_title,
          activity_type,
          activity_format,
          provider_id
        ),
        cme_registrations (
          id,
          registration_id,
          registration_status
        )
      `)
      .order('credit_date', { ascending: false });

    if (practitionerId) {
      query = query.eq('practitioner_id', practitionerId);
    }
    if (activityId) {
      query = query.eq('activity_id', activityId);
    }
    if (creditType) {
      query = query.eq('credit_type', creditType);
    }
    if (creditYear) {
      query = query.eq('credit_year', parseInt(creditYear));
    }
    if (creditStatus) {
      query = query.eq('credit_status', creditStatus);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch CME credits' }, { status: 500 });
  }
}

// POST - Create CME credit
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      credit_id,
      practitioner_id,
      activity_id,
      registration_id,
      credit_type,
      credit_amount,
      credit_date,
      credit_year,
      credit_status,
      verification_code,
      verification_url,
      is_transferable,
      transfer_date,
      transfer_to_practitioner_id,
      notes
    } = body;

    // Validate required fields
    if (!credit_id || !practitioner_id || !activity_id || !credit_type || !credit_amount || !credit_date || !credit_year) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('cme_credits')
      .insert({
        credit_id,
        practitioner_id,
        activity_id,
        registration_id,
        credit_type,
        credit_amount,
        credit_date,
        credit_year,
        credit_status: credit_status || 'earned',
        verification_code,
        verification_url,
        is_transferable: is_transferable !== undefined ? is_transferable : true,
        transfer_date,
        transfer_to_practitioner_id,
        notes
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create CME credit' }, { status: 500 });
  }
}

// PUT - Update CME credit
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'CME credit ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('cme_credits')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update CME credit' }, { status: 500 });
  }
}

// DELETE - Delete CME credit
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'CME credit ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('cme_credits')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'CME credit deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete CME credit' }, { status: 500 });
  }
}
