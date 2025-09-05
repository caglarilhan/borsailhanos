import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');
    const analyteCode = searchParams.get('analyte_code');

    let query = supabase.from('lab_results').select('*');
    if (orderId) query = query.eq('order_id', orderId);
    if (analyteCode) query = query.eq('analyte_code', analyteCode);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { data, error } = await supabase.from('lab_results').insert(body).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...update } = body;
    const { data, error } = await supabase.from('lab_results').update(update).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    const { error } = await supabase.from('lab_results').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: 'Deleted' });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
