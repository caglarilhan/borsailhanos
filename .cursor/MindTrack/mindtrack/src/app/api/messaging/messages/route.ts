import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversation_id');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    // Verify user is participant in conversation
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (!participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        user_profiles!messages_sender_id_fkey(name),
        message_attachments(*)
      `)
      .eq('conversation_id', conversationId)
      .order('sent_at', { ascending: true });

    if (error) throw error;

    // Transform the data
    const transformedMessages = messages?.map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      senderName: msg.user_profiles?.name || 'Unknown',
      content: msg.content,
      attachments: msg.message_attachments?.map((att: any) => ({
        id: att.id,
        filename: att.filename,
        size: att.size,
        type: att.type,
        url: att.url,
        scanned: att.scanned || false,
        scanResult: att.scan_result,
        uploadedAt: att.uploaded_at
      })) || [],
      scheduledFor: msg.scheduled_for,
      sentAt: msg.sent_at,
      readAt: msg.read_at,
      deliveredAt: msg.delivered_at,
      status: msg.status,
      priority: msg.priority,
      confidentiality: msg.confidentiality,
      retentionPeriod: msg.retention_period,
      autoDeleteAt: msg.auto_delete_at
    })) || [];

    return NextResponse.json({ success: true, messages: transformedMessages });
  } catch (e: any) {
    console.error('Error fetching messages:', e);
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

    const formData = await request.formData();
    const conversationId = formData.get('conversationId') as string;
    const content = formData.get('content') as string;
    const priority = formData.get('priority') as string || 'normal';
    const confidentiality = formData.get('confidentiality') as string || 'standard';
    const retentionPeriod = parseInt(formData.get('retentionPeriod') as string) || 30;
    const scheduledFor = formData.get('scheduledFor') as string;

    if (!conversationId || !content) {
      return NextResponse.json({ error: 'Conversation ID and content are required' }, { status: 400 });
    }

    // Verify user is participant in conversation
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (!participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Handle attachments
    const attachments: any[] = [];
    const attachmentFiles: File[] = [];
    
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('attachment_') && value instanceof File) {
        attachmentFiles.push(value);
      }
    }

    // Upload attachments to Supabase Storage
    for (const file of attachmentFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `messaging-attachments/${conversationId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('messaging-attachments')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('messaging-attachments')
        .getPublicUrl(filePath);

      // Scan file for viruses (simplified - in production use proper scanning)
      const scanResult = await scanFile(file);

      attachments.push({
        filename: file.name,
        size: file.size,
        type: file.type,
        url: urlData.publicUrl,
        scanned: true,
        scan_result: scanResult,
        uploaded_at: new Date().toISOString()
      });
    }

    // Create message
    const messageData = {
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      priority,
      confidentiality,
      retention_period: retentionPeriod,
      status: scheduledFor ? 'scheduled' : 'sent',
      sent_at: scheduledFor ? null : new Date().toISOString(),
      scheduled_for: scheduledFor || null,
      auto_delete_at: new Date(Date.now() + retentionPeriod * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (messageError) throw messageError;

    // Insert attachments
    if (attachments.length > 0) {
      const attachmentData = attachments.map(att => ({
        message_id: message.id,
        ...att
      }));

      const { error: attachmentError } = await supabase
        .from('message_attachments')
        .insert(attachmentData);

      if (attachmentError) {
        console.error('Attachment insert error:', attachmentError);
      }
    }

    // Update conversation updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return NextResponse.json({ success: true, message });
  } catch (e: any) {
    console.error('Error sending message:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Simple file scanning function (in production, use proper virus scanning)
async function scanFile(file: File): Promise<'clean' | 'infected' | 'suspicious'> {
  // Simulate scanning delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simple heuristic checks
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif'];
  const suspiciousMimeTypes = ['application/x-executable', 'application/x-msdownload'];
  
  if (suspiciousExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
    return 'suspicious';
  }
  
  if (suspiciousMimeTypes.includes(file.type)) {
    return 'suspicious';
  }
  
  // Check file size (over 100MB is suspicious)
  if (file.size > 100 * 1024 * 1024) {
    return 'suspicious';
  }
  
  return 'clean';
}