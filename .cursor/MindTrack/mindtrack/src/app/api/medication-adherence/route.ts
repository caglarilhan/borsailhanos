import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Retrieve medication adherence data
export async function GET(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const medicationId = searchParams.get('medicationId');
    const status = searchParams.get('status');

    let query = supabase
      .from('medication_adherence')
      .select(`
        *,
        medication:medications(name)
      `)
      .order('created_at', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (medicationId) {
      query = query.eq('medication_id', medicationId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch medication adherence' }, { status: 500 });
  }
}

// POST - Create new medication adherence record
export async function POST(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const body = await request.json();
    const { 
      client_id, 
      medication_id, 
      prescribed_dose_mg, 
      prescribed_frequency, 
      total_doses_prescribed,
      start_date,
      end_date,
      notes 
    } = body;

    const { data, error } = await supabase
      .from('medication_adherence')
      .insert({
        client_id,
        medication_id,
        prescribed_dose_mg,
        prescribed_frequency,
        total_doses_prescribed,
        start_date,
        end_date,
        notes
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create medication adherence record' }, { status: 500 });
  }
}

// PUT - Update medication adherence record
export async function PUT(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const { data, error } = await supabase
      .from('medication_adherence')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update medication adherence record' }, { status: 500 });
  }
}

// DELETE - Delete medication adherence record
export async function DELETE(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('medication_adherence')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Medication adherence record deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete medication adherence record' }, { status: 500 });
  }
}
