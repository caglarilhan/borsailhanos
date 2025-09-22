import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve quality measure reporting
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const practitionerId = searchParams.get('practitioner_id');
    const reportingYear = searchParams.get('reporting_year');
    const reportingStatus = searchParams.get('reporting_status');
    const reportingPeriodStart = searchParams.get('reporting_period_start');
    const reportingPeriodEnd = searchParams.get('reporting_period_end');

    let query = supabase
      .from('quality_measure_reporting')
      .select(`
        *,
        practitioners:users!practitioner_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('reporting_period_start', { ascending: false });

    if (practitionerId) {
      query = query.eq('practitioner_id', practitionerId);
    }
    if (reportingYear) {
      query = query.eq('reporting_year', parseInt(reportingYear));
    }
    if (reportingStatus) {
      query = query.eq('reporting_status', reportingStatus);
    }
    if (reportingPeriodStart) {
      query = query.gte('reporting_period_start', reportingPeriodStart);
    }
    if (reportingPeriodEnd) {
      query = query.lte('reporting_period_end', reportingPeriodEnd);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quality measure reporting' }, { status: 500 });
  }
}

// POST - Create quality measure reporting
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      reporting_period_id,
      practitioner_id,
      reporting_year,
      reporting_period_start,
      reporting_period_end,
      reporting_status,
      submission_date,
      acceptance_date,
      rejection_reason,
      total_measures,
      completed_measures,
      overall_score,
      category_scores,
      performance_improvement_score,
      cost_score,
      promoting_interoperability_score,
      quality_score,
      final_score,
      payment_adjustment
    } = body;

    // Validate required fields
    if (!reporting_period_id || !practitioner_id || !reporting_year || !reporting_period_start || !reporting_period_end) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('quality_measure_reporting')
      .insert({
        reporting_period_id,
        practitioner_id,
        reporting_year,
        reporting_period_start,
        reporting_period_end,
        reporting_status: reporting_status || 'draft',
        submission_date,
        acceptance_date,
        rejection_reason,
        total_measures: total_measures || 0,
        completed_measures: completed_measures || 0,
        overall_score,
        category_scores,
        performance_improvement_score,
        cost_score,
        promoting_interoperability_score,
        quality_score,
        final_score,
        payment_adjustment
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create quality measure reporting' }, { status: 500 });
  }
}

// PUT - Update quality measure reporting
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Quality measure reporting ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('quality_measure_reporting')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update quality measure reporting' }, { status: 500 });
  }
}

// DELETE - Delete quality measure reporting
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Quality measure reporting ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('quality_measure_reporting')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Quality measure reporting deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete quality measure reporting' }, { status: 500 });
  }
}




