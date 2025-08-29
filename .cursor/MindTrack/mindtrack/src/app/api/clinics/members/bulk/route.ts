import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

// POST /api/clinics/members/bulk
// body: { action: 'invite'|'role_update'|'csv_import', payload: any }
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, payload } = body || {};
    if (!action) return NextResponse.json({ error: 'Missing action' }, { status: 400 });

    // Find active clinic for current user
    const { data: currentMember, error: cmError } = await supabase
      .from('clinic_members')
      .select('clinic_id, role')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    if (cmError || !currentMember) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    // Only admins can perform bulk operations
    if (currentMember.role !== 'admin') return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });

    if (action === 'invite') {
      // payload: { invites: { email: string, role: 'admin'|'therapist'|'assistant' }[] }
      const invites = (payload?.invites || []).filter((x: any) => x?.email);
      const results: any[] = [];
      for (const inv of invites) {
        const { data: existingUser, error: userErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', inv.email)
          .single();
        if (!userErr && existingUser) {
          const { data: member, error: addErr } = await supabase
            .from('clinic_members')
            .insert({
              clinic_id: currentMember.clinic_id,
              user_id: existingUser.id,
              role: inv.role ?? 'assistant',
              status: 'pending'
            })
            .select('id, status')
            .single();
          results.push({ email: inv.email, ok: !addErr, detail: addErr?.message, memberId: member?.id });
        } else {
          // No user yet → create invitation record (if table exists); fallback: return planned
          results.push({ email: inv.email, ok: true, planned: true });
        }
      }
      return NextResponse.json({ success: true, results });
    }

    if (action === 'role_update') {
      // payload: { updates: { member_id: string, role: 'admin'|'therapist'|'assistant' }[] }
      const updates = payload?.updates || [];
      const results: any[] = [];
      for (const u of updates) {
        const { error: updErr } = await supabase
          .from('clinic_members')
          .update({ role: u.role })
          .eq('id', u.member_id)
          .eq('clinic_id', currentMember.clinic_id);
        results.push({ memberId: u.member_id, ok: !updErr, detail: updErr?.message });
      }
      return NextResponse.json({ success: true, results });
    }

    if (action === 'csv_import') {
      // payload: { rows: { email: string, role?: string }[] }
      const rows = (payload?.rows || []).filter((r: any) => r?.email);
      const results: any[] = [];
      for (const r of rows) {
        const role = ['admin','therapist','assistant'].includes(r.role) ? r.role : 'assistant';
        const { data: existingUser, error: userErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', r.email)
          .single();
        if (!userErr && existingUser) {
          const { error: addErr } = await supabase
            .from('clinic_members')
            .insert({ clinic_id: currentMember.clinic_id, user_id: existingUser.id, role, status: 'pending' });
          results.push({ email: r.email, ok: !addErr, detail: addErr?.message });
        } else {
          results.push({ email: r.email, ok: true, planned: true });
        }
      }
      return NextResponse.json({ success: true, results });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (e) {
    console.error('Bulk members error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


