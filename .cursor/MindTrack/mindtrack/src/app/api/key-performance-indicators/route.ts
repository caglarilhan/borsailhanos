import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve key performance indicators
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const kpiCategory = searchParams.get('kpi_category');
    const kpiType = searchParams.get('kpi_type');
    const performanceStatus = searchParams.get('performance_status');
    const isActive = searchParams.get('is_active');

    let query = supabase
      .from('key_performance_indicators')
      .select('*')
      .order('kpi_name', { ascending: true });

    if (kpiCategory) {
      query = query.eq('kpi_category', kpiCategory);
    }
    if (kpiType) {
      query = query.eq('kpi_type', kpiType);
    }
    if (performanceStatus) {
      query = query.eq('performance_status', performanceStatus);
    }
    if (isActive) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch key performance indicators' }, { status: 500 });
  }
}

// POST - Create key performance indicator
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      kpi_id,
      kpi_name,
      kpi_description,
      kpi_category,
      kpi_type,
      measurement_unit,
      calculation_formula,
      data_source,
      target_value,
      current_value,
      previous_value,
      benchmark_value,
      trend_direction,
      trend_percentage,
      performance_status,
      alert_thresholds,
      reporting_frequency,
      is_active
    } = body;

    // Validate required fields
    if (!kpi_id || !kpi_name || !kpi_category || !kpi_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('key_performance_indicators')
      .insert({
        kpi_id,
        kpi_name,
        kpi_description,
        kpi_category,
        kpi_type,
        measurement_unit,
        calculation_formula,
        data_source,
        target_value,
        current_value,
        previous_value,
        benchmark_value,
        trend_direction,
        trend_percentage,
        performance_status: performance_status || 'neutral',
        alert_thresholds,
        reporting_frequency: reporting_frequency || 'monthly',
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create key performance indicator' }, { status: 500 });
  }
}

// PUT - Update key performance indicator
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Key performance indicator ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('key_performance_indicators')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update key performance indicator' }, { status: 500 });
  }
}

// DELETE - Delete key performance indicator
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Key performance indicator ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('key_performance_indicators')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Key performance indicator deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete key performance indicator' }, { status: 500 });
  }
}
