import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve pharmacogenomic recommendations
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientGeneticProfileId = searchParams.get('patient_genetic_profile_id');
    const drugName = searchParams.get('drug_name');
    const geneSymbol = searchParams.get('gene_symbol');
    const recommendationType = searchParams.get('recommendation_type');
    const confidenceLevel = searchParams.get('confidence_level');
    const isApplied = searchParams.get('is_applied');

    let query = supabase
      .from('pharmacogenomic_recommendations')
      .select(`
        *,
        patient_genetic_profiles (
          id,
          patient_id,
          test_date,
          clinical_relevance
        ),
        genetic_variants (
          id,
          variant_id,
          gene_symbol,
          variant_name,
          clinical_significance
        ),
        applied_by_user:users!applied_by (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (patientGeneticProfileId) {
      query = query.eq('patient_genetic_profile_id', patientGeneticProfileId);
    }
    if (drugName) {
      query = query.eq('drug_name', drugName);
    }
    if (geneSymbol) {
      query = query.eq('gene_symbol', geneSymbol);
    }
    if (recommendationType) {
      query = query.eq('recommendation_type', recommendationType);
    }
    if (confidenceLevel) {
      query = query.eq('confidence_level', confidenceLevel);
    }
    if (isApplied) {
      query = query.eq('is_applied', isApplied === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pharmacogenomic recommendations' }, { status: 500 });
  }
}

// POST - Create pharmacogenomic recommendation
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_genetic_profile_id,
      drug_name,
      drug_id,
      gene_symbol,
      variant_id,
      interaction_level,
      recommendation_type,
      recommendation_text,
      confidence_level,
      evidence_strength,
      clinical_guidelines,
      references,
      is_applied,
      applied_date,
      applied_by,
      application_notes
    } = body;

    // Validate required fields
    if (!patient_genetic_profile_id || !drug_name || !gene_symbol || !interaction_level || !recommendation_type || !recommendation_text || !confidence_level || !evidence_strength) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('pharmacogenomic_recommendations')
      .insert({
        patient_genetic_profile_id,
        drug_name,
        drug_id,
        gene_symbol,
        variant_id,
        interaction_level,
        recommendation_type,
        recommendation_text,
        confidence_level,
        evidence_strength,
        clinical_guidelines,
        references,
        is_applied: is_applied || false,
        applied_date,
        applied_by,
        application_notes
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create pharmacogenomic recommendation' }, { status: 500 });
  }
}

// PUT - Update pharmacogenomic recommendation
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Pharmacogenomic recommendation ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('pharmacogenomic_recommendations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update pharmacogenomic recommendation' }, { status: 500 });
  }
}

// DELETE - Delete pharmacogenomic recommendation
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Pharmacogenomic recommendation ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('pharmacogenomic_recommendations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Pharmacogenomic recommendation deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete pharmacogenomic recommendation' }, { status: 500 });
  }
}

