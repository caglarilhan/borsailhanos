import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scheduledId } = await request.json();

    if (!scheduledId) {
      return NextResponse.json({ error: 'Scheduled ID is required' }, { status: 400 });
    }

    // Verify user owns the scheduled message
    const { data: message } = await supabase
      .from('messages')
      .select('sender_id, status')
      .eq('id', scheduledId)
      .single();

    if (!message) {
      return NextResponse.json({ error: 'Scheduled message not found' }, { status: 404 });
    }

    if (message.sender_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (message.status !== 'scheduled') {
      return NextResponse.json({ error: 'Message is not scheduled' }, { status: 400 });
    }

    // Cancel the scheduled message
    const { error } = await supabase
      .from('messages')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', scheduledId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Error cancelling scheduled message:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
