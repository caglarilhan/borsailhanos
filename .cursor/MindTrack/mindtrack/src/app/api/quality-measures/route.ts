import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve quality measures
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const measureCategory = searchParams.get('measure_category');
    const measureType = searchParams.get('measure_type');
    const measureDomain = searchParams.get('measure_domain');
    const reportingYear = searchParams.get('reporting_year');
    const isActive = searchParams.get('is_active');

    let query = supabase
      .from('quality_measures')
      .select('*')
      .order('measure_name', { ascending: true });

    if (measureCategory) {
      query = query.eq('measure_category', measureCategory);
    }
    if (measureType) {
      query = query.eq('measure_type', measureType);
    }
    if (measureDomain) {
      query = query.eq('measure_domain', measureDomain);
    }
    if (reportingYear) {
      query = query.eq('reporting_year', parseInt(reportingYear));
    }
    if (isActive) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quality measures' }, { status: 500 });
  }
}

// POST - Create quality measure
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      measure_id,
      measure_name,
      measure_description,
      measure_category,
      measure_type,
      measure_domain,
      numerator_description,
      denominator_description,
      exclusion_description,
      measure_version,
      reporting_year,
      is_active
    } = body;

    // Validate required fields
    if (!measure_id || !measure_name || !measure_category || !measure_type || !reporting_year) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('quality_measures')
      .insert({
        measure_id,
        measure_name,
        measure_description,
        measure_category,
        measure_type,
        measure_domain,
        numerator_description,
        denominator_description,
        exclusion_description,
        measure_version,
        reporting_year,
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create quality measure' }, { status: 500 });
  }
}

// PUT - Update quality measure
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Quality measure ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('quality_measures')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update quality measure' }, { status: 500 });
  }
}

// DELETE - Delete quality measure
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Quality measure ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('quality_measures')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Quality measure deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete quality measure' }, { status: 500 });
  }
}


