import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// POST: save submission; GET: list by client/template
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { template_id, client_id, submitted_by, data, signature_data_url } = body ?? {};
    if (!template_id || !data) return NextResponse.json({ error: 'Missing template_id or data' }, { status: 400 });

    const payload = {
      template_id,
      client_id: client_id || null,
      submitted_by: submitted_by || null,
      data,
      signature_data_url: signature_data_url || null,
      created_at: new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from('form_submissions')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ item: inserted });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const templateId = searchParams.get('templateId');

    let q = supabase.from('form_submissions').select('*').order('created_at', { ascending: false });
    if (clientId) q = q.eq('client_id', clientId);
    if (templateId) q = q.eq('template_id', templateId);

    const { data, error } = await q;
    if (error) throw error;
    return NextResponse.json({ items: data || [] });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status: 500 });
  }
}


