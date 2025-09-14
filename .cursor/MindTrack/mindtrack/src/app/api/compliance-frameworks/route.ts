import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve compliance frameworks
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const frameworkType = searchParams.get('framework_type');
    const isActive = searchParams.get('is_active');
    const complianceStatus = searchParams.get('compliance_status');

    let query = supabase
      .from('compliance_frameworks')
      .select('*')
      .order('framework_name', { ascending: true });

    if (frameworkType) {
      query = query.eq('framework_type', frameworkType);
    }
    if (isActive) {
      query = query.eq('is_active', isActive === 'true');
    }
    if (complianceStatus) {
      query = query.eq('compliance_status', complianceStatus);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch compliance frameworks' }, { status: 500 });
  }
}

// POST - Create compliance framework
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      framework_name,
      framework_version,
      framework_type,
      description,
      applicable_scope,
      requirements,
      controls,
      assessment_frequency_months,
      is_active
    } = body;

    // Validate required fields
    if (!framework_name || !framework_version || !framework_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('compliance_frameworks')
      .insert({
        framework_name,
        framework_version,
        framework_type,
        description,
        applicable_scope,
        requirements: requirements || {},
        controls: controls || {},
        assessment_frequency_months: assessment_frequency_months || 12,
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create compliance framework' }, { status: 500 });
  }
}

// PUT - Update compliance framework
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Framework ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('compliance_frameworks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update compliance framework' }, { status: 500 });
  }
}

// DELETE - Delete compliance framework
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Framework ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('compliance_frameworks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Compliance framework deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete compliance framework' }, { status: 500 });
  }
}


