import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve drug-gene interactions
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const drugName = searchParams.get('drug_name');
    const geneSymbol = searchParams.get('gene_symbol');
    const interactionLevel = searchParams.get('interaction_level');
    const evidenceLevel = searchParams.get('evidence_level');
    const isActive = searchParams.get('is_active');

    let query = supabase
      .from('drug_gene_interactions')
      .select(`
        *,
        genetic_variants (
          id,
          variant_id,
          gene_symbol,
          variant_name,
          clinical_significance
        )
      `)
      .order('drug_name', { ascending: true });

    if (drugName) {
      query = query.eq('drug_name', drugName);
    }
    if (geneSymbol) {
      query = query.eq('gene_symbol', geneSymbol);
    }
    if (interactionLevel) {
      query = query.eq('interaction_level', interactionLevel);
    }
    if (evidenceLevel) {
      query = query.eq('evidence_level', evidenceLevel);
    }
    if (isActive) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch drug-gene interactions' }, { status: 500 });
  }
}

// POST - Create drug-gene interaction
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      interaction_id,
      drug_name,
      drug_id,
      gene_symbol,
      variant_id,
      interaction_type,
      interaction_level,
      evidence_level,
      clinical_guidance,
      dosing_recommendation,
      alternative_drugs,
      contraindications,
      warnings,
      monitoring_recommendations,
      is_active
    } = body;

    // Validate required fields
    if (!interaction_id || !drug_name || !gene_symbol || !interaction_type || !interaction_level || !evidence_level) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('drug_gene_interactions')
      .insert({
        interaction_id,
        drug_name,
        drug_id,
        gene_symbol,
        variant_id,
        interaction_type,
        interaction_level,
        evidence_level,
        clinical_guidance,
        dosing_recommendation,
        alternative_drugs,
        contraindications,
        warnings,
        monitoring_recommendations,
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create drug-gene interaction' }, { status: 500 });
  }
}

// PUT - Update drug-gene interaction
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Drug-gene interaction ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('drug_gene_interactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update drug-gene interaction' }, { status: 500 });
  }
}

// DELETE - Delete drug-gene interaction
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Drug-gene interaction ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('drug_gene_interactions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Drug-gene interaction deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete drug-gene interaction' }, { status: 500 });
  }
}
