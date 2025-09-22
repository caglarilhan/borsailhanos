import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve AI recommendation requests
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const requestType = searchParams.get('request_type');
    const status = searchParams.get('status');
    const daysBack = searchParams.get('days_back');

    let query = supabase
      .from('ai_recommendation_requests')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        ),
        ai_recommendation_models (
          id,
          model_name,
          model_version,
          model_type,
          algorithm
        ),
        creator:users!created_by (
          id,
          first_name,
          last_name
        )
      `)
      .order('request_timestamp', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (requestType) {
      query = query.eq('request_type', requestType);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (daysBack) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(daysBack));
      query = query.gte('request_timestamp', startDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch AI recommendation requests' }, { status: 500 });
  }
}

// POST - Create new AI recommendation request
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      request_type,
      clinical_context,
      input_features,
      model_id,
      created_by
    } = body;

    // Validate required fields
    if (!patient_id || !request_type || !clinical_context) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate AI recommendations using the database function
    const { data: recommendations, error: recError } = await supabase.rpc(
      'generate_ai_medication_recommendations',
      {
        p_patient_id: patient_id,
        p_request_type: request_type,
        p_clinical_context: clinical_context,
        p_model_id: model_id
      }
    );

    if (recError) throw recError;

    // Get the created request with recommendations
    const { data: requestData, error: reqError } = await supabase
      .from('ai_recommendation_requests')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        ),
        ai_recommendation_models (
          id,
          model_name,
          model_version,
          model_type,
          algorithm
        ),
        ai_medication_recommendations (
          *,
          ai_recommendation_feedback (
            *
          )
        )
      `)
      .eq('patient_id', patient_id)
      .order('request_timestamp', { ascending: false })
      .limit(1)
      .single();

    if (reqError) throw reqError;

    return NextResponse.json({
      request: requestData,
      recommendations: recommendations
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create AI recommendation request' }, { status: 500 });
  }
}

// PUT - Update AI recommendation request
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('ai_recommendation_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update AI recommendation request' }, { status: 500 });
  }
}

// DELETE - Delete AI recommendation request
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('ai_recommendation_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'AI recommendation request deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete AI recommendation request' }, { status: 500 });
  }
}




