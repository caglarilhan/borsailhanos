import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's clinic
    const { data: clinicMember } = await supabase
      .from('clinic_members')
      .select('clinic_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!clinicMember?.clinic_id) {
      return NextResponse.json({ error: 'No active clinic found' }, { status: 400 });
    }

    const clinicId = clinicMember.clinic_id as string;

    // Fetch scheduled messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        conversations!inner(clinic_id),
        user_profiles!messages_sender_id_fkey(name)
      `)
      .eq('conversations.clinic_id', clinicId)
      .eq('sender_id', user.id)
      .eq('status', 'scheduled')
      .not('scheduled_for', 'is', null)
      .order('scheduled_for', { ascending: true });

    if (error) throw error;

    // Transform the data
    const scheduledMessages = messages?.map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      content: msg.content,
      scheduledFor: msg.scheduled_for,
      status: msg.status,
      createdAt: msg.created_at
    })) || [];

    return NextResponse.json({ success: true, scheduledMessages });
  } catch (e: any) {
    console.error('Error fetching scheduled messages:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
