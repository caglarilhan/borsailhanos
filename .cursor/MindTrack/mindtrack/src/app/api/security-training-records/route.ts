import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve security training records
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const trainingType = searchParams.get('training_type');
    const status = searchParams.get('status');
    const trainingDateFrom = searchParams.get('training_date_from');
    const trainingDateTo = searchParams.get('training_date_to');

    let query = supabase
      .from('security_training_records')
      .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('training_date', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (trainingType) {
      query = query.eq('training_type', trainingType);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (trainingDateFrom) {
      query = query.gte('training_date', trainingDateFrom);
    }
    if (trainingDateTo) {
      query = query.lte('training_date', trainingDateTo);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch security training records' }, { status: 500 });
  }
}

// POST - Create security training record
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      user_id,
      training_type,
      training_title,
      training_provider,
      training_date,
      completion_date,
      score,
      passing_score,
      status,
      certificate_url,
      expiration_date,
      retake_required,
      retake_date
    } = body;

    // Validate required fields
    if (!user_id || !training_type || !training_title || !training_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('security_training_records')
      .insert({
        user_id,
        training_type,
        training_title,
        training_provider,
        training_date,
        completion_date,
        score,
        passing_score: passing_score || 80.0,
        status: status || 'assigned',
        certificate_url,
        expiration_date,
        retake_required: retake_required || false,
        retake_date
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create security training record' }, { status: 500 });
  }
}

// PUT - Update security training record
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Training record ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('security_training_records')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update security training record' }, { status: 500 });
  }
}

// DELETE - Delete security training record
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Training record ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('security_training_records')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Security training record deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete security training record' }, { status: 500 });
  }
}











