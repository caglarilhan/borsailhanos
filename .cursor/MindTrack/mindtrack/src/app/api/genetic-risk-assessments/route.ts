import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Genetic Risk Assessments API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const riskCategory = searchParams.get('riskCategory');

    let query = supabase
      .from('genetic_risk_assessments')
      .select('*')
      .order('assessment_date', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    if (riskCategory) {
      query = query.eq('risk_category', riskCategory);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch genetic risk assessments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from('genetic_risk_assessments')
      .insert([body])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create genetic risk assessment' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const { data, error } = await supabase
      .from('genetic_risk_assessments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update genetic risk assessment' }, { status: 500 });
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
      .from('genetic_risk_assessments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ message: 'Genetic risk assessment deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete genetic risk assessment' }, { status: 500 });
  }
}
