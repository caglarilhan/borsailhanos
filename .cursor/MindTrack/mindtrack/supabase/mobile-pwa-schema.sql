-- Mobile/PWA Schema - Install Prompts, Offline Forms, Push Notifications

-- Create notification_subscriptions table
CREATE TABLE IF NOT EXISTS public.notification_subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text,
  auth text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_subscriptions
CREATE POLICY "Enable read access for own subscriptions" ON public.notification_subscriptions FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Enable insert for own subscriptions" ON public.notification_subscriptions FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable update for own subscriptions" ON public.notification_subscriptions FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Enable delete for own subscriptions" ON public.notification_subscriptions FOR DELETE USING (user_id = auth.uid());

-- Create notification_templates table
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('appointment', 'message', 'reminder', 'alert', 'custom')),
  title text NOT NULL,
  body text NOT NULL,
  data jsonb DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_templates
CREATE POLICY "Enable read access for clinic members" ON public.notification_templates FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = notification_templates.clinic_id)
);

CREATE POLICY "Enable insert for clinic members" ON public.notification_templates FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = notification_templates.clinic_id)
);

CREATE POLICY "Enable update for clinic members" ON public.notification_templates FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = notification_templates.clinic_id)
);

CREATE POLICY "Enable delete for clinic admins" ON public.notification_templates FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.clinic_members WHERE user_id = auth.uid() AND clinic_id = notification_templates.clinic_id AND role = 'admin')
);

-- Create notification_logs table
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id uuid REFERENCES public.notification_templates(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  sent_at timestamp with time zone NOT NULL,
  delivered_at timestamp with time zone,
  clicked_at timestamp with time zone,
  status text NOT NULL CHECK (status IN ('sent', 'delivered', 'clicked', 'failed')),
  error text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_logs
CREATE POLICY "Enable read access for clinic members" ON public.notification_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = (
    SELECT clinic_id FROM public.clinic_members WHERE user_id = notification_logs.user_id
  ))
);

CREATE POLICY "Enable insert for clinic members" ON public.notification_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid())
);

-- Create offline_data table for tracking offline usage
CREATE TABLE IF NOT EXISTS public.offline_data (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type text NOT NULL CHECK (data_type IN ('forms', 'submissions', 'clients', 'appointments')),
  data_id uuid NOT NULL,
  data_content jsonb NOT NULL,
  synced boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.offline_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for offline_data
CREATE POLICY "Enable read access for own data" ON public.offline_data FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Enable insert for own data" ON public.offline_data FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable update for own data" ON public.offline_data FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Enable delete for own data" ON public.offline_data FOR DELETE USING (user_id = auth.uid());

-- Create pwa_installations table
CREATE TABLE IF NOT EXISTS public.pwa_installations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_type text NOT NULL CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser text NOT NULL,
  platform text NOT NULL,
  installed_at timestamp with time zone DEFAULT now() NOT NULL,
  last_used_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true
);

ALTER TABLE public.pwa_installations ENABLE ROW LEVEL SECURITY;

-- RLS policies for pwa_installations
CREATE POLICY "Enable read access for own installations" ON public.pwa_installations FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Enable insert for own installations" ON public.pwa_installations FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable update for own installations" ON public.pwa_installations FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Enable delete for own installations" ON public.pwa_installations FOR DELETE USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_user_id ON public.notification_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_endpoint ON public.notification_subscriptions (endpoint);
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_is_active ON public.notification_subscriptions (is_active);
CREATE INDEX IF NOT EXISTS idx_notification_templates_clinic_id ON public.notification_templates (clinic_id);
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON public.notification_templates (type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_is_active ON public.notification_templates (is_active);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON public.notification_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_template_id ON public.notification_logs (template_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON public.notification_logs (sent_at);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON public.notification_logs (status);
CREATE INDEX IF NOT EXISTS idx_offline_data_user_id ON public.offline_data (user_id);
CREATE INDEX IF NOT EXISTS idx_offline_data_data_type ON public.offline_data (data_type);
CREATE INDEX IF NOT EXISTS idx_offline_data_synced ON public.offline_data (synced);
CREATE INDEX IF NOT EXISTS idx_pwa_installations_user_id ON public.pwa_installations (user_id);
CREATE INDEX IF NOT EXISTS idx_pwa_installations_device_type ON public.pwa_installations (device_type);
CREATE INDEX IF NOT EXISTS idx_pwa_installations_installed_at ON public.pwa_installations (installed_at);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notification_subscriptions_updated_at BEFORE UPDATE ON public.notification_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON public.notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offline_data_updated_at BEFORE UPDATE ON public.offline_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up old notification logs
CREATE OR REPLACE FUNCTION cleanup_old_notification_logs()
RETURNS void AS $$
BEGIN
  -- Delete logs older than 90 days
  DELETE FROM public.notification_logs 
  WHERE created_at < now() - interval '90 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up inactive subscriptions
CREATE OR REPLACE FUNCTION cleanup_inactive_subscriptions()
RETURNS void AS $$
BEGIN
  -- Delete subscriptions inactive for more than 30 days
  DELETE FROM public.notification_subscriptions 
  WHERE is_active = false 
  AND updated_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to get notification statistics
CREATE OR REPLACE FUNCTION get_notification_stats(
  p_user_id uuid,
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  total_sent integer;
  total_delivered integer;
  total_clicked integer;
  total_failed integer;
  delivery_rate decimal(5,2);
  click_rate decimal(5,2);
BEGIN
  -- Calculate statistics
  SELECT 
    COUNT(*),
    COUNT(CASE WHEN status = 'delivered' OR status = 'clicked' THEN 1 END),
    COUNT(CASE WHEN status = 'clicked' THEN 1 END),
    COUNT(CASE WHEN status = 'failed' THEN 1 END)
  INTO total_sent, total_delivered, total_clicked, total_failed
  FROM public.notification_logs
  WHERE user_id = p_user_id
    AND (p_start_date IS NULL OR sent_at::date >= p_start_date)
    AND (p_end_date IS NULL OR sent_at::date <= p_end_date);
  
  -- Calculate rates
  delivery_rate := CASE 
    WHEN total_sent > 0 THEN (total_delivered::decimal / total_sent) * 100
    ELSE 0
  END;
  
  click_rate := CASE 
    WHEN total_delivered > 0 THEN (total_clicked::decimal / total_delivered) * 100
    ELSE 0
  END;
  
  -- Build result
  result := jsonb_build_object(
    'totalSent', total_sent,
    'totalDelivered', total_delivered,
    'totalClicked', total_clicked,
    'totalFailed', total_failed,
    'deliveryRate', delivery_rate,
    'clickRate', click_rate
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to track PWA installation
CREATE OR REPLACE FUNCTION track_pwa_installation(
  p_user_id uuid,
  p_device_type text,
  p_browser text,
  p_platform text
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.pwa_installations (
    user_id,
    device_type,
    browser,
    platform
  ) VALUES (
    p_user_id,
    p_device_type,
    p_browser,
    p_platform
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to update PWA usage
CREATE OR REPLACE FUNCTION update_pwa_usage(p_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.pwa_installations 
  SET last_used_at = now()
  WHERE user_id = p_user_id 
    AND is_active = true
    AND last_used_at < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Create function to get offline data summary
CREATE OR REPLACE FUNCTION get_offline_data_summary(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  forms_count integer;
  submissions_count integer;
  clients_count integer;
  appointments_count integer;
  pending_sync integer;
BEGIN
  -- Count data by type
  SELECT 
    COUNT(CASE WHEN data_type = 'forms' THEN 1 END),
    COUNT(CASE WHEN data_type = 'submissions' THEN 1 END),
    COUNT(CASE WHEN data_type = 'clients' THEN 1 END),
    COUNT(CASE WHEN data_type = 'appointments' THEN 1 END),
    COUNT(CASE WHEN synced = false THEN 1 END)
  INTO forms_count, submissions_count, clients_count, appointments_count, pending_sync
  FROM public.offline_data
  WHERE user_id = p_user_id;
  
  -- Build result
  result := jsonb_build_object(
    'forms', forms_count,
    'submissions', submissions_count,
    'clients', clients_count,
    'appointments', appointments_count,
    'pendingSync', pending_sync
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
