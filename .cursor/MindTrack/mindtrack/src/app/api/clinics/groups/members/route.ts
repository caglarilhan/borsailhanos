import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

// POST /api/clinics/groups/members
// body: { group_id: string, member_id: string, role?: 'owner'|'admin'|'member'|'viewer' }
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { group_id, member_id, role = 'member' } = body || {};
    if (!group_id || !member_id) return NextResponse.json({ error: 'Missing group_id or member_id' }, { status: 400 });

    // Load current user's clinic membership
    const { data: currentMember, error: cmError } = await supabase
      .from('clinic_members')
      .select('id, clinic_id, role')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    if (cmError || !currentMember) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    // Check group belongs to same clinic
    const { data: group, error: groupError } = await supabase
      .from('clinic_groups')
      .select('id, clinic_id')
      .eq('id', group_id)
      .single();
    if (groupError || !group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    if (group.clinic_id !== currentMember.clinic_id) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    // Only admins can change group memberships (business rule)
    if (currentMember.role !== 'admin') return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });

    const { data, error } = await supabase
      .from('clinic_group_members')
      .insert({ group_id, member_id, role })
      .select()
      .single();
    if (error) return NextResponse.json({ error: 'Failed to add member to group' }, { status: 400 });

    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    console.error('Add group member error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/clinics/groups/members
// body: { group_id: string, member_id: string, role: 'owner'|'admin'|'member'|'viewer' }
export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { group_id, member_id, role } = body || {};
    if (!group_id || !member_id || !role) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const { data: currentMember, error: cmError } = await supabase
      .from('clinic_members')
      .select('id, clinic_id, role')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    if (cmError || !currentMember) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    const { data: group, error: groupError } = await supabase
      .from('clinic_groups')
      .select('id, clinic_id')
      .eq('id', group_id)
      .single();
    if (groupError || !group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    if (group.clinic_id !== currentMember.clinic_id) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    if (currentMember.role !== 'admin') return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });

    const { data, error } = await supabase
      .from('clinic_group_members')
      .update({ role })
      .eq('group_id', group_id)
      .eq('member_id', member_id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: 'Failed to update member role' }, { status: 400 });

    return NextResponse.json(data);
  } catch (e) {
    console.error('Update group member role error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/clinics/groups/members?groupId=...&memberId=...
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const memberId = searchParams.get('memberId');
    if (!groupId || !memberId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const { data: currentMember, error: cmError } = await supabase
      .from('clinic_members')
      .select('id, clinic_id, role')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    if (cmError || !currentMember) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    const { data: group, error: groupError } = await supabase
      .from('clinic_groups')
      .select('id, clinic_id')
      .eq('id', groupId)
      .single();
    if (groupError || !group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    if (group.clinic_id !== currentMember.clinic_id) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    if (currentMember.role !== 'admin') return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });

    const { error } = await supabase
      .from('clinic_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('member_id', memberId);
    if (error) return NextResponse.json({ error: 'Failed to remove member from group' }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Remove group member error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


