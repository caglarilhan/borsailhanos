-- Telehealth Pro Schema - Waiting Room Branding, Group Sessions, Recording Consent

-- Create waiting_room_configs table
CREATE TABLE IF NOT EXISTS public.waiting_room_configs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  branding jsonb NOT NULL DEFAULT '{}',
  features jsonb NOT NULL DEFAULT '{}',
  custom_fields jsonb NOT NULL DEFAULT '[]',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.waiting_room_configs ENABLE ROW LEVEL SECURITY;

-- RLS policies for waiting_room_configs
CREATE POLICY "Enable read access for clinic members" ON public.waiting_room_configs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = waiting_room_configs.clinic_id)
);

CREATE POLICY "Enable insert for clinic admins" ON public.waiting_room_configs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.clinic_members WHERE user_id = auth.uid() AND clinic_id = waiting_room_configs.clinic_id AND role = 'admin')
);

CREATE POLICY "Enable update for clinic admins" ON public.waiting_room_configs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.clinic_members WHERE user_id = auth.uid() AND clinic_id = waiting_room_configs.clinic_id AND role = 'admin')
);

CREATE POLICY "Enable delete for clinic admins" ON public.waiting_room_configs FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.clinic_members WHERE user_id = auth.uid() AND clinic_id = waiting_room_configs.clinic_id AND role = 'admin')
);

-- Create recording_consents table
CREATE TABLE IF NOT EXISTS public.recording_consents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid NOT NULL REFERENCES public.video_sessions(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  consent_type text NOT NULL CHECK (consent_type IN ('audio', 'video', 'both')),
  purpose text NOT NULL CHECK (purpose IN ('treatment', 'training', 'research', 'quality_assurance')),
  retention_period integer NOT NULL DEFAULT 365,
  shared_with text[] NOT NULL DEFAULT '{}',
  client_signature text NOT NULL,
  signed_at timestamp with time zone NOT NULL,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.recording_consents ENABLE ROW LEVEL SECURITY;

-- RLS policies for recording_consents
CREATE POLICY "Enable read access for clinic members and client" ON public.recording_consents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = (SELECT clinic_id FROM public.clients WHERE id = recording_consents.client_id))
  OR client_id = (SELECT id FROM public.clients WHERE owner_id = auth.uid())
);

CREATE POLICY "Enable insert for clinic members and client" ON public.recording_consents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = (SELECT clinic_id FROM public.clients WHERE id = recording_consents.client_id))
  OR client_id = (SELECT id FROM public.clients WHERE owner_id = auth.uid())
);

-- Create group_sessions table (enhanced)
CREATE TABLE IF NOT EXISTS public.group_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('support', 'therapy', 'education', 'workshop')),
  max_participants integer NOT NULL DEFAULT 10,
  current_participants integer NOT NULL DEFAULT 0,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  facilitator_id uuid NOT NULL REFERENCES auth.users(id),
  session_topic text,
  materials text[],
  waiting_room_config_id uuid REFERENCES public.waiting_room_configs(id),
  recording_consent_required boolean NOT NULL DEFAULT false,
  session_notes text,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.group_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for group_sessions
CREATE POLICY "Enable read access for clinic members" ON public.group_sessions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = group_sessions.clinic_id)
);

CREATE POLICY "Enable insert for clinic members" ON public.group_sessions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = group_sessions.clinic_id)
);

CREATE POLICY "Enable update for clinic members" ON public.group_sessions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = group_sessions.clinic_id)
);

CREATE POLICY "Enable delete for clinic admins" ON public.group_sessions FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.clinic_members WHERE user_id = auth.uid() AND clinic_id = group_sessions.clinic_id AND role = 'admin')
);

-- Create group_session_participants table
CREATE TABLE IF NOT EXISTS public.group_session_participants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_session_id uuid NOT NULL REFERENCES public.group_sessions(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  joined_at timestamp with time zone DEFAULT now(),
  left_at timestamp with time zone,
  status text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'joined', 'left', 'removed')),
  recording_consent_id uuid REFERENCES public.recording_consents(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.group_session_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for group_session_participants
CREATE POLICY "Enable read access for clinic members and participant" ON public.group_session_participants FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = (SELECT clinic_id FROM public.group_sessions WHERE id = group_session_participants.group_session_id))
  OR client_id = (SELECT id FROM public.clients WHERE owner_id = auth.uid())
);

CREATE POLICY "Enable insert for clinic members" ON public.group_session_participants FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = (SELECT clinic_id FROM public.group_sessions WHERE id = group_session_participants.group_session_id))
);

CREATE POLICY "Enable update for clinic members and participant" ON public.group_session_participants FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = (SELECT clinic_id FROM public.group_sessions WHERE id = group_session_participants.group_session_id))
  OR client_id = (SELECT id FROM public.clients WHERE owner_id = auth.uid())
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_waiting_room_configs_clinic_id ON public.waiting_room_configs (clinic_id);
CREATE INDEX IF NOT EXISTS idx_recording_consents_session_id ON public.recording_consents (session_id);
CREATE INDEX IF NOT EXISTS idx_recording_consents_client_id ON public.recording_consents (client_id);
CREATE INDEX IF NOT EXISTS idx_group_sessions_clinic_id ON public.group_sessions (clinic_id);
CREATE INDEX IF NOT EXISTS idx_group_sessions_facilitator_id ON public.group_sessions (facilitator_id);
CREATE INDEX IF NOT EXISTS idx_group_sessions_start_time ON public.group_sessions (start_time);
CREATE INDEX IF NOT EXISTS idx_group_session_participants_group_session_id ON public.group_session_participants (group_session_id);
CREATE INDEX IF NOT EXISTS idx_group_session_participants_client_id ON public.group_session_participants (client_id);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_waiting_room_configs_updated_at BEFORE UPDATE ON public.waiting_room_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_group_sessions_updated_at BEFORE UPDATE ON public.group_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
