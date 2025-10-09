-- Messaging V2 Schema - Read Receipts, Scheduled Messages, Attachment Scanning

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  title text,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Enable read access for participants" ON public.conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = conversations.id AND user_id = auth.uid())
);

CREATE POLICY "Enable insert for clinic members" ON public.conversations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = conversations.clinic_id)
);

CREATE POLICY "Enable update for participants" ON public.conversations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = conversations.id AND user_id = auth.uid())
);

CREATE POLICY "Enable delete for clinic admins" ON public.conversations FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.clinic_members WHERE user_id = auth.uid() AND clinic_id = conversations.clinic_id AND role = 'admin')
);

-- Create conversation_participants table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamp with time zone DEFAULT now() NOT NULL,
  left_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true
);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversation_participants
CREATE POLICY "Enable read access for participants" ON public.conversation_participants FOR SELECT USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.conversation_participants cp2 
    WHERE cp2.conversation_id = conversation_participants.conversation_id 
    AND cp2.user_id = auth.uid()
  )
);

CREATE POLICY "Enable insert for clinic members" ON public.conversation_participants FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = (
    SELECT clinic_id FROM public.conversations WHERE id = conversation_participants.conversation_id
  ))
);

CREATE POLICY "Enable update for participants" ON public.conversation_participants FOR UPDATE USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.conversation_participants cp2 
    WHERE cp2.conversation_id = conversation_participants.conversation_id 
    AND cp2.user_id = auth.uid()
  )
);

CREATE POLICY "Enable delete for participants" ON public.conversation_participants FOR DELETE USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.conversation_participants cp2 
    WHERE cp2.conversation_id = conversation_participants.conversation_id 
    AND cp2.user_id = auth.uid()
  )
);

-- Create messages table (enhanced)
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'scheduled', 'sent', 'delivered', 'read', 'failed', 'cancelled')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  confidentiality text NOT NULL DEFAULT 'standard' CHECK (confidentiality IN ('standard', 'confidential', 'restricted')),
  retention_period integer NOT NULL DEFAULT 30,
  scheduled_for timestamp with time zone,
  sent_at timestamp with time zone,
  delivered_at timestamp with time zone,
  read_at timestamp with time zone,
  auto_delete_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for messages
CREATE POLICY "Enable read access for participants" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);

CREATE POLICY "Enable insert for participants" ON public.messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);

CREATE POLICY "Enable update for sender" ON public.messages FOR UPDATE USING (
  sender_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Enable delete for sender" ON public.messages FOR DELETE USING (
  sender_id = auth.uid()
);

-- Create message_attachments table
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  filename text NOT NULL,
  size integer NOT NULL,
  type text NOT NULL,
  url text NOT NULL,
  scanned boolean NOT NULL DEFAULT false,
  scan_result text CHECK (scan_result IN ('clean', 'infected', 'suspicious')),
  uploaded_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_attachments
CREATE POLICY "Enable read access for message participants" ON public.message_attachments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = message_attachments.message_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Enable insert for message participants" ON public.message_attachments FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = message_attachments.message_id AND cp.user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_clinic_id ON public.conversations (clinic_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations (updated_at);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON public.conversation_participants (conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants (user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON public.messages (sent_at);
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages (status);
CREATE INDEX IF NOT EXISTS idx_messages_scheduled_for ON public.messages (scheduled_for);
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON public.message_attachments (message_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to process scheduled messages
CREATE OR REPLACE FUNCTION process_scheduled_messages()
RETURNS void AS $$
BEGIN
  -- Update scheduled messages that are due
  UPDATE public.messages 
  SET 
    status = 'sent',
    sent_at = now(),
    updated_at = now()
  WHERE 
    status = 'scheduled' 
    AND scheduled_for <= now();
    
  -- Update conversation updated_at for sent messages
  UPDATE public.conversations 
  SET updated_at = now()
  WHERE id IN (
    SELECT DISTINCT conversation_id 
    FROM public.messages 
    WHERE status = 'sent' 
    AND sent_at >= now() - interval '1 minute'
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up expired messages
CREATE OR REPLACE FUNCTION cleanup_expired_messages()
RETURNS void AS $$
BEGIN
  -- Delete messages that have passed their auto_delete_at date
  DELETE FROM public.messages 
  WHERE auto_delete_at IS NOT NULL 
  AND auto_delete_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create function to get conversation summary
CREATE OR REPLACE FUNCTION get_conversation_summary(p_conversation_id uuid, p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  last_message jsonb;
  unread_count integer;
  participants jsonb;
BEGIN
  -- Get last message
  SELECT jsonb_build_object(
    'id', m.id,
    'content', m.content,
    'sentAt', m.sent_at,
    'senderId', m.sender_id,
    'status', m.status
  )
  INTO last_message
  FROM public.messages m
  WHERE m.conversation_id = p_conversation_id
  ORDER BY m.sent_at DESC
  LIMIT 1;
  
  -- Get unread count
  SELECT COUNT(*)
  INTO unread_count
  FROM public.messages m
  WHERE m.conversation_id = p_conversation_id
    AND m.sender_id != p_user_id
    AND m.status != 'read';
  
  -- Get participants
  SELECT jsonb_agg(
    jsonb_build_object(
      'userId', cp.user_id,
      'name', up.name,
      'joinedAt', cp.joined_at
    )
  )
  INTO participants
  FROM public.conversation_participants cp
  JOIN public.user_profiles up ON cp.user_id = up.user_id
  WHERE cp.conversation_id = p_conversation_id
    AND cp.is_active = true;
  
  -- Build result
  result := jsonb_build_object(
    'lastMessage', last_message,
    'unreadCount', unread_count,
    'participants', participants
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create storage bucket for messaging attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('messaging-attachments', 'messaging-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for messaging attachments
CREATE POLICY "Enable read access for conversation participants" ON storage.objects FOR SELECT USING (
  bucket_id = 'messaging-attachments' AND
  EXISTS (
    SELECT 1 FROM public.message_attachments ma
    JOIN public.messages m ON ma.message_id = m.id
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE ma.url LIKE '%' || name AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Enable insert for conversation participants" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'messaging-attachments' AND
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.user_id = auth.uid()
  )
);

CREATE POLICY "Enable update for conversation participants" ON storage.objects FOR UPDATE USING (
  bucket_id = 'messaging-attachments' AND
  EXISTS (
    SELECT 1 FROM public.message_attachments ma
    JOIN public.messages m ON ma.message_id = m.id
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE ma.url LIKE '%' || name AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Enable delete for message sender" ON storage.objects FOR DELETE USING (
  bucket_id = 'messaging-attachments' AND
  EXISTS (
    SELECT 1 FROM public.message_attachments ma
    JOIN public.messages m ON ma.message_id = m.id
    WHERE ma.url LIKE '%' || name AND m.sender_id = auth.uid()
  )
);
