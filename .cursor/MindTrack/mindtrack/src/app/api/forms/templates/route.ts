import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET: list templates; POST: create/update (upsert by id+version)
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    if (!clinicId) return NextResponse.json({ error: 'Missing clinicId' }, { status: 400 });

    const { data, error } = await supabase
      .from('form_templates')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('updated_at', { ascending: false });
    if (error) throw error;

    return NextResponse.json({ items: data || [] });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, clinic_id, name, description, version, fields } = body ?? {};
    if (!clinic_id || !name || !version || !fields) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const payload = {
      id: id || undefined,
      clinic_id,
      name,
      description: description || null,
      version,
      fields,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('form_templates')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ item: data });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status: 500 });
  }
}


