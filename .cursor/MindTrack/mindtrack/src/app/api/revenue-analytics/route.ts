import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve revenue analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const analysisDate = searchParams.get('analysis_date');
    const analysisPeriodMonths = searchParams.get('analysis_period_months');

    let query = supabase
      .from('revenue_analytics')
      .select('*')
      .order('analysis_date', { ascending: false });

    if (analysisDate) {
      query = query.eq('analysis_date', analysisDate);
    }
    if (analysisPeriodMonths) {
      query = query.eq('analysis_period_months', parseInt(analysisPeriodMonths));
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch revenue analytics' }, { status: 500 });
  }
}

// POST - Create revenue analytics
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      analysis_date,
      analysis_period_months,
      total_revenue,
      insurance_revenue,
      cash_revenue,
      medicare_revenue,
      medicaid_revenue,
      private_insurance_revenue,
      copay_collection,
      deductible_collection,
      write_offs,
      bad_debt,
      net_collection_rate,
      average_claim_value,
      claims_submitted,
      claims_paid,
      claims_denied,
      claims_pending,
      denial_rate,
      days_in_ar,
      cost_per_encounter,
      revenue_per_encounter,
      profit_margin
    } = body;

    // Validate required fields
    if (!analysis_date || !analysis_period_months) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('revenue_analytics')
      .insert({
        analysis_date,
        analysis_period_months,
        total_revenue: total_revenue || 0,
        insurance_revenue: insurance_revenue || 0,
        cash_revenue: cash_revenue || 0,
        medicare_revenue: medicare_revenue || 0,
        medicaid_revenue: medicaid_revenue || 0,
        private_insurance_revenue: private_insurance_revenue || 0,
        copay_collection: copay_collection || 0,
        deductible_collection: deductible_collection || 0,
        write_offs: write_offs || 0,
        bad_debt: bad_debt || 0,
        net_collection_rate: net_collection_rate || 0,
        average_claim_value: average_claim_value || 0,
        claims_submitted: claims_submitted || 0,
        claims_paid: claims_paid || 0,
        claims_denied: claims_denied || 0,
        claims_pending: claims_pending || 0,
        denial_rate: denial_rate || 0,
        days_in_ar: days_in_ar || 0,
        cost_per_encounter: cost_per_encounter || 0,
        revenue_per_encounter: revenue_per_encounter || 0,
        profit_margin: profit_margin || 0
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create revenue analytics' }, { status: 500 });
  }
}

// PUT - Update revenue analytics
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Revenue analytics ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('revenue_analytics')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update revenue analytics' }, { status: 500 });
  }
}

// DELETE - Delete revenue analytics
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Revenue analytics ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('revenue_analytics')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Revenue analytics deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete revenue analytics' }, { status: 500 });
  }
}




