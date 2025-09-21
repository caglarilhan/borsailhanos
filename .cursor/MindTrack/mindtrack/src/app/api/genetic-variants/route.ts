import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve genetic variants
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const geneSymbol = searchParams.get('gene_symbol');
    const chromosome = searchParams.get('chromosome');
    const clinicalSignificance = searchParams.get('clinical_significance');
    const variantType = searchParams.get('variant_type');
    const isActive = searchParams.get('is_active');

    let query = supabase
      .from('genetic_variants')
      .select('*')
      .order('gene_symbol', { ascending: true });

    if (geneSymbol) {
      query = query.eq('gene_symbol', geneSymbol);
    }
    if (chromosome) {
      query = query.eq('chromosome', chromosome);
    }
    if (clinicalSignificance) {
      query = query.eq('clinical_significance', clinicalSignificance);
    }
    if (variantType) {
      query = query.eq('variant_type', variantType);
    }
    if (isActive) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch genetic variants' }, { status: 500 });
  }
}

// POST - Create genetic variant
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      variant_id,
      gene_symbol,
      gene_name,
      variant_name,
      rs_id,
      chromosome,
      position,
      reference_allele,
      alternate_allele,
      variant_type,
      clinical_significance,
      population_frequency,
      functional_impact,
      is_active
    } = body;

    // Validate required fields
    if (!variant_id || !gene_symbol || !gene_name || !variant_name || !chromosome || !position || !reference_allele || !alternate_allele || !variant_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('genetic_variants')
      .insert({
        variant_id,
        gene_symbol,
        gene_name,
        variant_name,
        rs_id,
        chromosome,
        position,
        reference_allele,
        alternate_allele,
        variant_type,
        clinical_significance,
        population_frequency,
        functional_impact,
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create genetic variant' }, { status: 500 });
  }
}

// PUT - Update genetic variant
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Genetic variant ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('genetic_variants')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update genetic variant' }, { status: 500 });
  }
}

// DELETE - Delete genetic variant
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Genetic variant ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('genetic_variants')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Genetic variant deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete genetic variant' }, { status: 500 });
  }
}



