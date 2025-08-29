import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

// POST /api/clinics/members/onboarding/complete
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { member_id, onboarding } = body || {};
    if (!member_id || !onboarding) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    // Verify member belongs to current user or user is admin
    const { data: meMember, error: meErr } = await supabase
      .from('clinic_members')
      .select('id, user_id, clinic_id, role, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    if (meErr || !meMember) return NextResponse.json({ error: 'Clinic membership not found' }, { status: 404 });

    const { data: target, error: tErr } = await supabase
      .from('clinic_members')
      .select('id, user_id, clinic_id')
      .eq('id', member_id)
      .single();
    if (tErr || !target) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    if (target.clinic_id !== meMember.clinic_id) return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    if (target.user_id !== user.id && meMember.role !== 'admin') return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });

    // Persist onboarding payload in a simple table if exists, otherwise attach to member notes
    const { error: updErr } = await supabase
      .from('clinic_members')
      .update({ status: 'active', notes: JSON.stringify({ onboarding, completed_at: new Date().toISOString() }) })
      .eq('id', member_id);
    if (updErr) return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Onboarding complete error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


