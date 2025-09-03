import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Academic Publications API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    const publicationType = searchParams.get('publicationType');
    const status = searchParams.get('status');
    const year = searchParams.get('year');
    const journalName = searchParams.get('journalName');

    let query = supabase
      .from('academic_publications')
      .select('*')
      .order('publication_date', { ascending: false });

    if (clinicId) {
      query = query.eq('clinic_id', clinicId);
    }

    if (publicationType) {
      query = query.eq('publication_type', publicationType);
    }

    if (status) {
      query = query.eq('publication_status', status);
    }

    if (year) {
      query = query.gte('publication_date', `${year}-01-01`).lt('publication_date', `${parseInt(year) + 1}-01-01`);
    }

    if (journalName) {
      query = query.ilike('journal_name', `%${journalName}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch academic publications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from('academic_publications')
      .insert([body])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create academic publication' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const { data, error } = await supabase
      .from('academic_publications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update academic publication' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('academic_publications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ message: 'Academic publication deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete academic publication' }, { status: 500 });
  }
}
