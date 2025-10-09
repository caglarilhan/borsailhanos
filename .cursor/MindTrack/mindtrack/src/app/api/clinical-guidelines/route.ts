import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve clinical guidelines
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const guidelineType = searchParams.get('guideline_type');
    const category = searchParams.get('category');
    const organization = searchParams.get('organization');
    const status = searchParams.get('status');
    const evidenceLevel = searchParams.get('evidence_level');

    let query = supabase
      .from('clinical_guidelines')
      .select(`
        *,
        creator:users!created_by (
          id,
          first_name,
          last_name
        )
      `)
      .order('effective_date', { ascending: false });

    if (guidelineType) {
      query = query.eq('guideline_type', guidelineType);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (organization) {
      query = query.eq('issuing_organization', organization);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (evidenceLevel) {
      query = query.eq('evidence_level', evidenceLevel);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch clinical guidelines' }, { status: 500 });
  }
}

// POST - Create new clinical guideline
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      guideline_name,
      guideline_code,
      guideline_version,
      guideline_type,
      category,
      subcategory,
      issuing_organization,
      publication_date,
      effective_date,
      expiration_date,
      status,
      evidence_level,
      recommendation_strength,
      target_population,
      exclusion_criteria,
      guideline_summary,
      full_guideline_text,
      key_recommendations,
      clinical_algorithms,
      quality_measures,
      references,
      implementation_notes,
      cost_considerations,
      insurance_coverage,
      regulatory_compliance,
      created_by
    } = body;

    // Validate required fields
    if (!guideline_name || !guideline_code || !guideline_version || !guideline_type || !category || !issuing_organization || !publication_date || !effective_date || !evidence_level || !recommendation_strength || !guideline_summary) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('clinical_guidelines')
      .insert({
        guideline_name,
        guideline_code,
        guideline_version,
        guideline_type,
        category,
        subcategory,
        issuing_organization,
        publication_date,
        effective_date,
        expiration_date,
        status: status || 'active',
        evidence_level,
        recommendation_strength,
        target_population,
        exclusion_criteria,
        guideline_summary,
        full_guideline_text,
        key_recommendations,
        clinical_algorithms,
        quality_measures,
        references,
        implementation_notes,
        cost_considerations,
        insurance_coverage,
        regulatory_compliance,
        created_by
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create clinical guideline' }, { status: 500 });
  }
}

// PUT - Update clinical guideline
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Guideline ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('clinical_guidelines')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update clinical guideline' }, { status: 500 });
  }
}

// DELETE - Delete clinical guideline
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Guideline ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('clinical_guidelines')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Clinical guideline deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete clinical guideline' }, { status: 500 });
  }
}











