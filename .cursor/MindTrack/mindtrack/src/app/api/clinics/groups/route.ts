import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

// GET /api/clinics/groups
export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch groups for user's active clinic (RLS enforces scope)
    const { data: groups, error } = await supabase
      .from('clinic_groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
    }

    return NextResponse.json(groups);
  } catch (e) {
    console.error('Groups GET error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/clinics/groups
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Find active clinic for user
    const { data: cm, error: cmError } = await supabase
      .from('clinic_members')
      .select('clinic_id, role, id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (cmError || !cm) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // Only admin can create groups (business rule), RLS will also guard
    if (cm.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: group, error } = await supabase
      .from('clinic_groups')
      .insert({
        clinic_id: cm.clinic_id,
        name: body.name,
        description: body.description,
        group_type: body.group_type ?? 'team',
        privacy: body.privacy ?? 'private',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create group' }, { status: 400 });
    }

    // Add creator as owner in clinic_group_members
    await supabase
      .from('clinic_group_members')
      .insert({ group_id: group.id, member_id: cm.id, role: 'owner' });

    return NextResponse.json(group, { status: 201 });
  } catch (e) {
    console.error('Groups POST error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/clinics/groups
export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const { data: cm, error: cmError } = await supabase
      .from('clinic_members')
      .select('clinic_id, role')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (cmError || !cm) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    if (cm.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: updated, error } = await supabase
      .from('clinic_groups')
      .update({
        name: body.name,
        description: body.description,
        group_type: body.group_type,
        privacy: body.privacy,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update group' }, { status: 400 });
    }

    return NextResponse.json(updated);
  } catch (e) {
    console.error('Groups PUT error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/clinics/groups?id=...
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // RLS will ensure scoping; additionally we can check admin
    const { data: cm, error: cmError } = await supabase
      .from('clinic_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (cmError || !cm || cm.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { error } = await supabase
      .from('clinic_groups')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete group' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Groups DELETE error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


