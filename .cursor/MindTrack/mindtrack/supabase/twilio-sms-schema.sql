-- Twilio SMS Integration Schema
-- This schema handles SMS messaging, logs, and status callbacks

-- SMS logs table
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL UNIQUE,
  to TEXT NOT NULL,
  from TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  type TEXT NOT NULL DEFAULT 'custom',
  price TEXT,
  price_unit TEXT,
  error_code TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS status callbacks table
CREATE TABLE IF NOT EXISTS sms_status_callbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT NOT NULL,
  status TEXT NOT NULL,
  to TEXT,
  from TEXT,
  body TEXT,
  error_code TEXT,
  error_message TEXT,
  price TEXT,
  price_unit TEXT,
  callback_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS templates table
CREATE TABLE IF NOT EXISTS sms_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('appointment_reminder', 'appointment_confirmation', 'appointment_cancellation', 'medication_reminder', 'payment_reminder', 'custom')),
  template TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique template names per user
  UNIQUE(user_id, name)
);

-- SMS campaigns table
CREATE TABLE IF NOT EXISTS sms_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_id UUID REFERENCES sms_templates(id) ON DELETE SET NULL,
  recipients JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS opt-outs table
CREATE TABLE IF NOT EXISTS sms_opt_outs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT DEFAULT 'user_request',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique phone numbers
  UNIQUE(phone_number)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sms_logs_user_id ON sms_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_message_id ON sms_logs(message_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON sms_logs(status);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at ON sms_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_sms_logs_type ON sms_logs(type);

CREATE INDEX IF NOT EXISTS idx_sms_status_callbacks_message_id ON sms_status_callbacks(message_id);
CREATE INDEX IF NOT EXISTS idx_sms_status_callbacks_status ON sms_status_callbacks(status);
CREATE INDEX IF NOT EXISTS idx_sms_status_callbacks_created_at ON sms_status_callbacks(created_at);

CREATE INDEX IF NOT EXISTS idx_sms_templates_user_id ON sms_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_templates_type ON sms_templates(type);
CREATE INDEX IF NOT EXISTS idx_sms_templates_active ON sms_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_sms_campaigns_user_id ON sms_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_campaigns_status ON sms_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_sms_campaigns_scheduled_at ON sms_campaigns(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_sms_opt_outs_phone_number ON sms_opt_outs(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_opt_outs_user_id ON sms_opt_outs(user_id);

-- RLS Policies
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_status_callbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_opt_outs ENABLE ROW LEVEL SECURITY;

-- User can only access their own SMS logs
CREATE POLICY "Users can view own sms logs" ON sms_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sms logs" ON sms_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sms logs" ON sms_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Status callbacks are readable by all authenticated users (for webhook processing)
CREATE POLICY "Users can view sms status callbacks" ON sms_status_callbacks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert sms status callbacks" ON sms_status_callbacks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- User can only access their own SMS templates
CREATE POLICY "Users can view own sms templates" ON sms_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sms templates" ON sms_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sms templates" ON sms_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sms templates" ON sms_templates
  FOR DELETE USING (auth.uid() = user_id);

-- User can only access their own SMS campaigns
CREATE POLICY "Users can view own sms campaigns" ON sms_campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sms campaigns" ON sms_campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sms campaigns" ON sms_campaigns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sms campaigns" ON sms_campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- SMS opt-outs are readable by all authenticated users
CREATE POLICY "Users can view sms opt outs" ON sms_opt_outs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert sms opt outs" ON sms_opt_outs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_sms_logs_updated_at
  BEFORE UPDATE ON sms_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_templates_updated_at
  BEFORE UPDATE ON sms_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_campaigns_updated_at
  BEFORE UPDATE ON sms_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check if phone number is opted out
CREATE OR REPLACE FUNCTION is_phone_opted_out(phone_number TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM sms_opt_outs 
    WHERE sms_opt_outs.phone_number = phone_number
  );
END;
$$ language 'plpgsql';

-- Function to get SMS statistics
CREATE OR REPLACE FUNCTION get_sms_statistics(user_uuid UUID, start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL, end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_sent', COUNT(*),
    'delivered', COUNT(*) FILTER (WHERE status = 'delivered'),
    'failed', COUNT(*) FILTER (WHERE status = 'failed'),
    'pending', COUNT(*) FILTER (WHERE status IN ('queued', 'sending')),
    'total_cost', COALESCE(SUM(CAST(price AS DECIMAL)), 0),
    'by_type', json_object_agg(
      type, 
      json_build_object(
        'count', count,
        'delivered', delivered_count,
        'failed', failed_count
      )
    )
  ) INTO result
  FROM (
    SELECT 
      type,
      COUNT(*) as count,
      COUNT(*) FILTER (WHERE status = 'delivered') as delivered_count,
      COUNT(*) FILTER (WHERE status = 'failed') as failed_count
    FROM sms_logs 
    WHERE user_id = user_uuid
      AND (start_date IS NULL OR created_at >= start_date)
      AND (end_date IS NULL OR created_at <= end_date)
    GROUP BY type
  ) stats;
  
  RETURN result;
END;
$$ language 'plpgsql';

-- Function to log SMS activity
CREATE OR REPLACE FUNCTION log_sms_activity(
  user_uuid UUID,
  message_id_param TEXT,
  to_param TEXT,
  from_param TEXT,
  body_param TEXT,
  status_param TEXT,
  type_param TEXT DEFAULT 'custom',
  price_param TEXT DEFAULT NULL,
  price_unit_param TEXT DEFAULT NULL,
  error_code_param TEXT DEFAULT NULL,
  error_message_param TEXT DEFAULT NULL,
  metadata_param JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO sms_logs (
    user_id,
    message_id,
    to,
    from,
    body,
    status,
    type,
    price,
    price_unit,
    error_code,
    error_message,
    metadata
  ) VALUES (
    user_uuid,
    message_id_param,
    to_param,
    from_param,
    body_param,
    status_param,
    type_param,
    price_param,
    price_unit_param,
    error_code_param,
    error_message_param,
    metadata_param
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ language 'plpgsql';



