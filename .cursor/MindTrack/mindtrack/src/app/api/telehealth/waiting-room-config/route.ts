import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');

    if (!clinicId) {
      return NextResponse.json({ error: 'Clinic ID is required' }, { status: 400 });
    }

    const { data: configs, error } = await supabase
      .from('waiting_room_configs')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, configs });
  } catch (e: any) {
    console.error('Error fetching waiting room configs:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clinicId, branding, features, customFields } = await request.json();

    if (!clinicId || !branding || !features) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: config, error } = await supabase
      .from('waiting_room_configs')
      .upsert({
        clinic_id: clinicId,
        branding,
        features,
        custom_fields: customFields || [],
        updated_at: new Date().toISOString()
      }, { onConflict: 'clinic_id' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, config });
  } catch (e: any) {
    console.error('Error saving waiting room config:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
