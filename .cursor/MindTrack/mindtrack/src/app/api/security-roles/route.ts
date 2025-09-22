import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve security roles
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const roleType = searchParams.get('role_type');
    const isActive = searchParams.get('is_active');

    let query = supabase
      .from('security_roles')
      .select('*')
      .order('role_name', { ascending: true });

    if (roleType) {
      query = query.eq('role_type', roleType);
    }
    if (isActive) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch security roles' }, { status: 500 });
  }
}

// POST - Create security role
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      role_name,
      role_description,
      role_type,
      permissions,
      is_active
    } = body;

    // Validate required fields
    if (!role_name || !role_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('security_roles')
      .insert({
        role_name,
        role_description,
        role_type,
        permissions: permissions || {},
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create security role' }, { status: 500 });
  }
}

// PUT - Update security role
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('security_roles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update security role' }, { status: 500 });
  }
}

// DELETE - Delete security role
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('security_roles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Security role deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete security role' }, { status: 500 });
  }
}




