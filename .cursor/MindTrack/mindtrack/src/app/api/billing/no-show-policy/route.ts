import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET: policy fetch; POST: update toggle & fee amount & cutoff
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    if (!clientId) return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });

    const { data, error } = await supabase
      .from('client_no_show_policies')
      .select('*')
      .eq('client_id', clientId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;

    return NextResponse.json({ policy: data || null });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { clientId, enabled, feeCents, cutoffHours } = body ?? {};
    if (!clientId) return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });

    const payload = {
      client_id: clientId,
      enabled: Boolean(enabled),
      fee_cents: typeof feeCents === 'number' ? feeCents : 5000,
      cutoff_hours: typeof cutoffHours === 'number' ? cutoffHours : 24,
      updated_at: new Date().toISOString(),
    };

    // upsert
    const { data, error } = await supabase
      .from('client_no_show_policies')
      .upsert(payload, { onConflict: 'client_id' })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ policy: data });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status: 500 });
  }
}


