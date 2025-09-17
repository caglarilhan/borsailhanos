import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

/**
 * POST /api/assessments
 * Create a new assessment
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const assessmentData = await request.json();
    
    const { 
      client_id, 
      type, 
      score, 
      max_score, 
      severity, 
      answers, 
      notes 
    } = assessmentData;

    // Validate required fields
    if (!client_id || !type || score === undefined || !answers) {
      return NextResponse.json({ 
        error: 'Missing required fields: client_id, type, score, answers' 
      }, { status: 400 });
    }

    // Verify client exists and user has access
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, clinic_id')
      .eq('id', client_id)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Verify user has access to this client's clinic
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !userProfile?.clinic_id) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    if (client.clinic_id !== userProfile.clinic_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create assessment record
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        client_id,
        therapist_id: user.id,
        clinic_id: userProfile.clinic_id,
        type,
        score,
        max_score,
        severity,
        notes,
        answers: answers, // Store as JSON
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (assessmentError) {
      console.error('Error creating assessment:', assessmentError);
      return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      assessment: {
        id: assessment.id,
        client_id: assessment.client_id,
        type: assessment.type,
        score: assessment.score,
        max_score: assessment.max_score,
        severity: assessment.severity,
        notes: assessment.notes,
        created_at: assessment.created_at
      }
    });

  } catch (error) {
    console.error('Assessment API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/assessments
 * Get assessments for a client or clinic
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user's clinic ID
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !userProfile?.clinic_id) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Build query
    let query = supabase
      .from('assessments')
      .select(`
        id,
        client_id,
        therapist_id,
        type,
        score,
        max_score,
        severity,
        notes,
        answers,
        created_at,
        clients!inner(
          id,
          first_name,
          last_name
        ),
        user_profiles!inner(
          id,
          full_name
        )
      `)
      .eq('clinic_id', userProfile.clinic_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by client if specified
    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data: assessments, error: assessmentsError } = await query;

    if (assessmentsError) {
      console.error('Error fetching assessments:', assessmentsError);
      return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      assessments: assessments || [],
      pagination: {
        limit,
        offset,
        hasMore: (assessments?.length || 0) === limit
      }
    });

  } catch (error) {
    console.error('Assessment GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}