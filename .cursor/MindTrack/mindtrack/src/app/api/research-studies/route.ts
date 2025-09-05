import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Research Studies API
export async function GET(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    const studyType = searchParams.get('studyType');
    const status = searchParams.get('status');
    const principalInvestigator = searchParams.get('principalInvestigator');

    let query = supabase
      .from('research_studies')
      .select('*')
      .order('created_at', { ascending: false });

    if (clinicId) {
      query = query.eq('clinic_id', clinicId);
    }

    if (studyType) {
      query = query.eq('study_type', studyType);
    }

    if (status) {
      query = query.eq('study_status', status);
    }

    if (principalInvestigator) {
      query = query.ilike('principal_investigator', `%${principalInvestigator}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch research studies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from('research_studies')
      .insert([body])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create research study' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const { data, error } = await supabase
      .from('research_studies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update research study' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('research_studies')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ message: 'Research study deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete research study' }, { status: 500 });
  }
}
