import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// Pending appointment'ı approve edip gerçek appointments'a taşır
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, client_id } = body ?? {};
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // Pending kaydı al
    const { data: pending, error: e1 } = await supabase
      .from('pending_appointments')
      .select('*')
      .eq('id', id)
      .single();
    if (e1 || !pending) throw e1 || new Error('Not found');

    // İsteğe göre mevcut client_id atanabilir, yoksa sadece isim/e‑posta ile placeholder
    const insertPayload: any = {
      client_id: client_id || null,
      date: pending.date,
      time: pending.time,
      status: 'scheduled'
    };

    const { error: e2 } = await supabase.from('appointments').insert(insertPayload);
    if (e2) throw e2;

    // Pending'i güncelle
    const { error: e3 } = await supabase
      .from('pending_appointments')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', id);
    if (e3) throw e3;

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status: 500 });
  }
}


