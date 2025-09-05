import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

  process.env.SUPABASE_SERVICE_ROLE_KEY!

// Telepsychiatry Sessions API
export async function GET(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const clinicId = searchParams.get('clinicId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabase
      .from('telepsychiatry_sessions')
      .select('*')
      .order('session_date', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    if (clinicId) {
      query = query.eq('clinic_id', clinicId);
    }

    if (status) {
      query = query.eq('session_status', status);
    }

    if (startDate && endDate) {
      query = query.gte('session_date', startDate).lte('session_date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch telepsychiatry sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from('telepsychiatry_sessions')
      .insert([body])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create telepsychiatry session' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const { data, error } = await supabase
      .from('telepsychiatry_sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update telepsychiatry session' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('telepsychiatry_sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ message: 'Telepsychiatry session deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete telepsychiatry session' }, { status: 500 });
  }
}
