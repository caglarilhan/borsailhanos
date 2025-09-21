import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve patient education compliance records
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const periodStart = searchParams.get('period_start');
    const periodEnd = searchParams.get('period_end');
    const minComplianceRate = searchParams.get('min_compliance_rate');
    const daysBack = searchParams.get('days_back');

    let query = supabase
      .from('patient_education_compliance')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        )
      `)
      .order('compliance_period_start', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (periodStart) {
      query = query.gte('compliance_period_start', periodStart);
    }
    if (periodEnd) {
      query = query.lte('compliance_period_end', periodEnd);
    }
    if (minComplianceRate) {
      query = query.gte('compliance_rate', parseFloat(minComplianceRate));
    }
    if (daysBack) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(daysBack));
      query = query.gte('compliance_period_start', startDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patient education compliance records' }, { status: 500 });
  }
}

// POST - Calculate patient education compliance
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      period_start,
      period_end
    } = body;

    // Validate required fields
    if (!patient_id || !period_start || !period_end) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use the database function to calculate compliance
    const { data: complianceResult, error: complianceError } = await supabase.rpc(
      'calculate_patient_education_compliance',
      {
        p_patient_id: patient_id,
        p_period_start: period_start,
        p_period_end: period_end
      }
    );

    if (complianceError) throw complianceError;

    if (complianceResult && complianceResult.length > 0) {
      const compliance = complianceResult[0];
      
      return NextResponse.json({
        compliance_id: compliance.compliance_id,
        compliance_rate: compliance.compliance_rate,
        total_assignments: compliance.total_assignments,
        completed_assignments: compliance.completed_assignments,
        overdue_assignments: compliance.overdue_assignments,
        average_completion_time: compliance.average_completion_time,
        average_assessment_score: compliance.average_assessment_score,
        engagement_score: compliance.engagement_score
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Failed to calculate patient education compliance' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate patient education compliance' }, { status: 500 });
  }
}

// PUT - Update patient education compliance record
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Compliance record ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('patient_education_compliance')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update patient education compliance record' }, { status: 500 });
  }
}

// DELETE - Delete patient education compliance record
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Compliance record ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('patient_education_compliance')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Patient education compliance record deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete patient education compliance record' }, { status: 500 });
  }
}



