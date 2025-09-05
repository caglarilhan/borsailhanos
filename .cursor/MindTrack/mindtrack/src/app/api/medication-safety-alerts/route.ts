import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve medication safety alerts
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const alertType = searchParams.get('alert_type');
    const severityLevel = searchParams.get('severity_level');
    const medicationName = searchParams.get('medication_name');
    const isActive = searchParams.get('is_active');
    const daysBack = searchParams.get('days_back');

    let query = supabase
      .from('medication_safety_alerts')
      .select(`
        *,
        creator:users!created_by (
          id,
          first_name,
          last_name
        )
      `)
      .order('effective_date', { ascending: false });

    if (alertType) {
      query = query.eq('alert_type', alertType);
    }
    if (severityLevel) {
      query = query.eq('severity_level', severityLevel);
    }
    if (medicationName) {
      query = query.eq('medication_name', medicationName);
    }
    if (isActive) {
      query = query.eq('is_active', isActive === 'true');
    }
    if (daysBack) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(daysBack));
      query = query.gte('effective_date', startDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch medication safety alerts' }, { status: 500 });
  }
}

// POST - Create new medication safety alert
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      alert_name,
      alert_code,
      alert_type,
      severity_level,
      medication_name,
      medication_class,
      alert_description,
      alert_details,
      affected_population,
      risk_factors,
      symptoms_to_watch,
      recommended_actions,
      contraindications,
      monitoring_requirements,
      reporting_requirements,
      fda_alert_number,
      fda_alert_date,
      fda_alert_url,
      dea_schedule,
      black_box_warning,
      boxed_warning_text,
      pregnancy_category,
      lactation_warning,
      pediatric_warning,
      geriatric_warning,
      renal_warning,
      hepatic_warning,
      cardiac_warning,
      psychiatric_warning,
      is_active,
      effective_date,
      expiration_date,
      created_by
    } = body;

    // Validate required fields
    if (!alert_name || !alert_code || !alert_type || !severity_level || !medication_name || !alert_description || !effective_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('medication_safety_alerts')
      .insert({
        alert_name,
        alert_code,
        alert_type,
        severity_level,
        medication_name,
        medication_class,
        alert_description,
        alert_details,
        affected_population,
        risk_factors,
        symptoms_to_watch,
        recommended_actions,
        contraindications,
        monitoring_requirements,
        reporting_requirements,
        fda_alert_number,
        fda_alert_date,
        fda_alert_url,
        dea_schedule,
        black_box_warning: black_box_warning || false,
        boxed_warning_text,
        pregnancy_category,
        lactation_warning: lactation_warning || false,
        pediatric_warning: pediatric_warning || false,
        geriatric_warning: geriatric_warning || false,
        renal_warning: renal_warning || false,
        hepatic_warning: hepatic_warning || false,
        cardiac_warning: cardiac_warning || false,
        psychiatric_warning: psychiatric_warning || false,
        is_active: is_active !== undefined ? is_active : true,
        effective_date,
        expiration_date,
        created_by
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create medication safety alert' }, { status: 500 });
  }
}

// PUT - Update medication safety alert
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('medication_safety_alerts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update medication safety alert' }, { status: 500 });
  }
}

// DELETE - Delete medication safety alert
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('medication_safety_alerts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Medication safety alert deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete medication safety alert' }, { status: 500 });
  }
}
