import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Retrieve drug allergies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const drugName = searchParams.get('drugName');
    const severity = searchParams.get('severity');
    const allergyType = searchParams.get('allergyType');

    let query = supabase
      .from('drug_allergies')
      .select('*')
      .order('created_at', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (drugName) {
      query = query.ilike('drug_name', `%${drugName}%`);
    }
    if (severity) {
      query = query.eq('severity', severity);
    }
    if (allergyType) {
      query = query.eq('allergy_type', allergyType);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch drug allergies' }, { status: 500 });
  }
}

// POST - Create new drug allergy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_id, drug_name, allergy_type, reaction_type, severity, onset_date, notes, confirmed_by } = body;

    const { data, error } = await supabase
      .from('drug_allergies')
      .insert({
        client_id,
        drug_name,
        allergy_type,
        reaction_type,
        severity,
        onset_date,
        notes,
        confirmed_by
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create drug allergy' }, { status: 500 });
  }
}

// PUT - Update drug allergy
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const { data, error } = await supabase
      .from('drug_allergies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update drug allergy' }, { status: 500 });
  }
}

// DELETE - Delete drug allergy
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('drug_allergies')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Drug allergy deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete drug allergy' }, { status: 500 });
  }
}
