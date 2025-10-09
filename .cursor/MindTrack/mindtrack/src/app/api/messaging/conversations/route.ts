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

    // Fetch conversations where user is a participant
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants!inner(
          user_id,
          user_profiles!inner(name)
        ),
        messages(
          id,
          content,
          sent_at,
          sender_id,
          status
        )
      `)
      .eq('clinic_id', clinicId)
      .eq('conversation_participants.user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Transform the data to match our interface
    const transformedConversations = conversations?.map(conv => {
      const participants = conv.conversation_participants
        .map((p: any) => p.user_profiles?.name || 'Unknown')
        .filter(Boolean);
      
      const lastMessage = conv.messages?.[0];
      const unreadCount = conv.messages?.filter((m: any) => 
        m.sender_id !== user.id && m.status !== 'read'
      ).length || 0;

      return {
        id: conv.id,
        participants,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          sentAt: lastMessage.sent_at,
          senderId: lastMessage.sender_id,
          status: lastMessage.status
        } : undefined,
        unreadCount,
        isArchived: conv.is_archived || false,
        createdAt: conv.created_at,
        updatedAt: conv.updated_at
      };
    }) || [];

    return NextResponse.json({ success: true, conversations: transformedConversations });
  } catch (e: any) {
    console.error('Error fetching conversations:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { participantIds, title } = await request.json();

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json({ error: 'Participant IDs are required' }, { status: 400 });
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

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        clinic_id: clinicId,
        title: title || `Conversation with ${participantIds.length} participants`,
        is_archived: false
      })
      .select()
      .single();

    if (convError) throw convError;

    // Add participants (including the creator)
    const allParticipantIds = [...new Set([user.id, ...participantIds])];
    const participants = allParticipantIds.map(participantId => ({
      conversation_id: conversation.id,
      user_id: participantId
    }));

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participants);

    if (participantsError) throw participantsError;

    return NextResponse.json({ success: true, conversation });
  } catch (e: any) {
    console.error('Error creating conversation:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}