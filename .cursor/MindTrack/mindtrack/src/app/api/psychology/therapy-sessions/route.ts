import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const { data: sessions, error } = await supabase
      .from('therapy_sessions')
      .select(`
        *,
        interventions:session_id (
          id,
          name,
          description,
          duration,
          effectiveness,
          notes,
          tools
        ),
        homework:session_id (
          id,
          title,
          description,
          type,
          due_date,
          status,
          patient_notes,
          therapist_feedback
        )
      `)
      .eq('patient_id', patientId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching therapy sessions:', error);
      return NextResponse.json({ error: 'Failed to fetch therapy sessions' }, { status: 500 });
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error in therapy sessions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      patientId, 
      therapistId, 
      date, 
      duration, 
      type, 
      modality, 
      goals, 
      notes, 
      moodRating, 
      progressNotes, 
      nextSessionPlan 
    } = body;

    if (!patientId || !therapistId || !date || !duration) {
      return NextResponse.json({ error: 'Patient ID, therapist ID, date, and duration are required' }, { status: 400 });
    }

    const { data: session, error } = await supabase
      .from('therapy_sessions')
      .insert({
        patient_id: patientId,
        therapist_id: therapistId,
        date,
        duration,
        type: type || 'individual',
        modality: modality || 'cbt',
        goals: goals || [],
        notes: notes || '',
        mood_rating: moodRating || 5,
        progress_notes: progressNotes || '',
        next_session_plan: nextSessionPlan || ''
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating therapy session:', error);
      return NextResponse.json({ error: 'Failed to create therapy session' }, { status: 500 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error in therapy session creation API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
