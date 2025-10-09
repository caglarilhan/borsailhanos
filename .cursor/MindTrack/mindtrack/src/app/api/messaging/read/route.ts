import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId } = await request.json();

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    // Verify user is participant in the conversation
    const { data: message } = await supabase
      .from('messages')
      .select(`
        conversation_id,
        sender_id,
        status,
        conversation_participants!inner(user_id)
      `)
      .eq('id', messageId)
      .eq('conversation_participants.user_id', user.id)
      .single();

    if (!message) {
      return NextResponse.json({ error: 'Message not found or access denied' }, { status: 404 });
    }

    // Don't mark own messages as read
    if (message.sender_id === user.id) {
      return NextResponse.json({ error: 'Cannot mark own message as read' }, { status: 400 });
    }

    // Update message status to read
    const { error } = await supabase
      .from('messages')
      .update({ 
        status: 'read',
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Error marking message as read:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
