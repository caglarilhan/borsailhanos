import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve mobile health data
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const deviceId = searchParams.get('device_id');
    const dataType = searchParams.get('data_type');
    const metricName = searchParams.get('metric_name');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = supabase
      .from('mobile_health_data')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        ),
        patient_mobile_devices (
          id,
          device_name,
          device_type,
          platform
        )
      `)
      .order('collection_timestamp', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (deviceId) {
      query = query.eq('device_id', deviceId);
    }
    if (dataType) {
      query = query.eq('data_type', dataType);
    }
    if (metricName) {
      query = query.eq('metric_name', metricName);
    }
    if (startDate) {
      query = query.gte('collection_timestamp', startDate);
    }
    if (endDate) {
      query = query.lte('collection_timestamp', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch mobile health data' }, { status: 500 });
  }
}

// POST - Create mobile health data
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      device_id,
      data_type,
      metric_name,
      metric_value,
      metric_unit,
      raw_data,
      processed_data,
      data_quality_score,
      collection_timestamp,
      upload_timestamp,
      data_source,
      is_validated,
      validation_notes
    } = body;

    // Validate required fields
    if (!patient_id || !data_type || !metric_name || !collection_timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('mobile_health_data')
      .insert({
        patient_id,
        device_id,
        data_type,
        metric_name,
        metric_value,
        metric_unit,
        raw_data,
        processed_data,
        data_quality_score,
        collection_timestamp,
        upload_timestamp: upload_timestamp || new Date().toISOString(),
        data_source,
        is_validated: is_validated || false,
        validation_notes
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create mobile health data' }, { status: 500 });
  }
}

// PUT - Update mobile health data
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Mobile health data ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('mobile_health_data')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update mobile health data' }, { status: 500 });
  }
}

// DELETE - Delete mobile health data
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Mobile health data ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('mobile_health_data')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Mobile health data deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete mobile health data' }, { status: 500 });
  }
}











