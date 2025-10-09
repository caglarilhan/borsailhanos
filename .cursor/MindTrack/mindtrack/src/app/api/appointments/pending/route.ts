import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// Hasta talebi: pending appointment kuyruğuna ekle
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { name, email, phone, date, time, notes } = body ?? {};

    if (!name || !email || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Basit queue tablosu (yoksa oluşturulmuş varsayılır): pending_appointments
    // Kolay test için minimal kolonlarla ekliyoruz
    const { error } = await supabase
      .from('pending_appointments')
      .insert({ name, email, phone: phone || null, date, time, notes: notes || null, status: 'pending' });
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status: 500 });
  }
}

// Pending appointment'ları listele (admin/clinic içi kullanım)
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data, error } = await supabase
      .from('pending_appointments')
      .select('*')
      .eq('status', status)
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .range(offset, offset + limit - 1);
    if (error) throw error;

    return NextResponse.json({ ok: true, items: data ?? [], pagination: { limit, offset, hasMore: (data?.length || 0) === limit } });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status: 500 });
  }
}



