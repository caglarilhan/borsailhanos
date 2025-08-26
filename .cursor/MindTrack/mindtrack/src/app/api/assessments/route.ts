import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';
import type { AssessmentType } from '@/types/assessments';

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const type = searchParams.get('type') as AssessmentType;

    let query = supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data: assessments, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 400 });
    }

    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Assessments API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { client_id, type, score, max_score, severity, answers, notes } = body;

    // Validation
    if (!client_id || !type || score === undefined || !max_score || !severity || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create assessment
    const { data: assessment, error } = await supabase
      .from('assessments')
      .insert({
        client_id,
        type,
        score,
        max_score,
        severity,
        answers,
        notes
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create assessment' }, { status: 400 });
    }

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    console.error('Create assessment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
