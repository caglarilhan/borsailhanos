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
    const sessionId = searchParams.get('session_id');
    const clientId = searchParams.get('client_id');

    let query = supabase
      .from('recording_consents')
      .select('*')
      .order('signed_at', { ascending: false });

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }
    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data: consents, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, consents });
  } catch (e: any) {
    console.error('Error fetching recording consents:', e);
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

    const { 
      sessionId, 
      clientId, 
      consentType, 
      purpose, 
      retentionPeriod, 
      sharedWith, 
      clientSignature, 
      signedAt, 
      ipAddress, 
      userAgent 
    } = await request.json();

    if (!sessionId || !clientId || !consentType || !purpose || !clientSignature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: consent, error } = await supabase
      .from('recording_consents')
      .insert({
        session_id: sessionId,
        client_id: clientId,
        consent_type: consentType,
        purpose,
        retention_period: retentionPeriod || 365,
        shared_with: sharedWith || [],
        client_signature: clientSignature,
        signed_at: signedAt || new Date().toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, consent });
  } catch (e: any) {
    console.error('Error saving recording consent:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
