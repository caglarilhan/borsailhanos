import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Retrieve drug interactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const drug1Id = searchParams.get('drug1Id');
    const drug2Id = searchParams.get('drug2Id');
    const severityLevel = searchParams.get('severityLevel');
    const interactionType = searchParams.get('interactionType');

    let query = supabase
      .from('drug_interactions')
      .select(`
        *,
        drug1:medications!drug_interactions_drug1_id_fkey(name),
        drug2:medications!drug_interactions_drug2_id_fkey(name)
      `)
      .order('created_at', { ascending: false });

    if (drug1Id) {
      query = query.eq('drug1_id', drug1Id);
    }
    if (drug2Id) {
      query = query.eq('drug2_id', drug2Id);
    }
    if (severityLevel) {
      query = query.eq('severity_level', severityLevel);
    }
    if (interactionType) {
      query = query.eq('interaction_type', interactionType);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch drug interactions' }, { status: 500 });
  }
}

// POST - Create new drug interaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { drug1_id, drug2_id, interaction_type, severity_level, mechanism, clinical_significance, management_recommendations, evidence_level, references } = body;

    const { data, error } = await supabase
      .from('drug_interactions')
      .insert({
        drug1_id,
        drug2_id,
        interaction_type,
        severity_level,
        mechanism,
        clinical_significance,
        management_recommendations,
        evidence_level,
        references
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create drug interaction' }, { status: 500 });
  }
}

// PUT - Update drug interaction
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const { data, error } = await supabase
      .from('drug_interactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update drug interaction' }, { status: 500 });
  }
}

// DELETE - Delete drug interaction
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('drug_interactions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Drug interaction deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete drug interaction' }, { status: 500 });
  }
}
