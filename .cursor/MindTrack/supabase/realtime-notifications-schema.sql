-- Real-time notifications schema for Supabase
-- This file contains tables and policies for notification system

-- Notification types table
CREATE TABLE IF NOT EXISTS notification_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default notification types
INSERT INTO notification_types (name, description, icon, color) VALUES
('appointment_reminder', 'Appointment Reminders', 'calendar', 'blue'),
('medication_reminder', 'Medication Reminders', 'pill', 'green'),
('lab_result', 'Lab Results', 'activity', 'orange'),
('payment_reminder', 'Payment Reminders', 'credit-card', 'red'),
('system_update', 'System Updates', 'settings', 'gray'),
('security_alert', 'Security Alerts', 'shield', 'red'),
('prescription_ready', 'Prescription Ready', 'file-text', 'purple'),
('appointment_cancelled', 'Appointment Cancelled', 'x-circle', 'red'),
('appointment_rescheduled', 'Appointment Rescheduled', 'refresh-cw', 'yellow')
ON CONFLICT (name) DO NOTHING;

-- User notification settings table
CREATE TABLE IF NOT EXISTS user_notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  appointment_reminders BOOLEAN DEFAULT true,
  medication_reminders BOOLEAN DEFAULT true,
  lab_results BOOLEAN DEFAULT true,
  payment_reminders BOOLEAN DEFAULT true,
  system_updates BOOLEAN DEFAULT false,
  security_alerts BOOLEAN DEFAULT true,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user notification settings
CREATE INDEX IF NOT EXISTS idx_user_notification_settings_user_id ON user_notification_settings(user_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type_id UUID NOT NULL REFERENCES notification_types(id),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional data for the notification
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url VARCHAR(500),
  action_text VARCHAR(100),
  expires_at TIMESTAMP WITH TIME ZONE,
  sent_via_email BOOLEAN DEFAULT false,
  sent_via_sms BOOLEAN DEFAULT false,
  sent_via_push BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type_id ON notifications(type_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);

-- Notification delivery logs table
CREATE TABLE IF NOT EXISTS notification_delivery_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  delivery_method VARCHAR(20) NOT NULL, -- email, sms, push, websocket
  status VARCHAR(20) NOT NULL, -- pending, sent, delivered, failed
  external_id VARCHAR(200), -- ID from external service (email provider, SMS provider, etc.)
  error_message TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notification delivery logs
CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_notification_id ON notification_delivery_logs(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_status ON notification_delivery_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_delivery_method ON notification_delivery_logs(delivery_method);

-- Notification templates table
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type_id UUID NOT NULL REFERENCES notification_types(id),
  name VARCHAR(100) NOT NULL,
  subject_template VARCHAR(200),
  message_template TEXT NOT NULL,
  email_template TEXT,
  sms_template TEXT,
  push_template TEXT,
  variables JSONB, -- Available variables for template
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for notification templates
CREATE INDEX IF NOT EXISTS idx_notification_templates_type_id ON notification_templates(type_id);

-- Insert default notification templates
INSERT INTO notification_templates (type_id, name, subject_template, message_template, email_template, sms_template, push_template, variables) 
SELECT 
  nt.id,
  'default_' || nt.name,
  CASE nt.name
    WHEN 'appointment_reminder' THEN 'Appointment Reminder - {{appointment_date}}'
    WHEN 'medication_reminder' THEN 'Medication Reminder - {{medication_name}}'
    WHEN 'lab_result' THEN 'Lab Results Available'
    WHEN 'payment_reminder' THEN 'Payment Reminder'
    ELSE 'Notification from MindTrack'
  END,
  CASE nt.name
    WHEN 'appointment_reminder' THEN 'Your appointment with {{doctor_name}} on {{appointment_date}} at {{appointment_time}} is coming up.'
    WHEN 'medication_reminder' THEN 'Time to take your {{medication_name}} {{dosage}}. {{instructions}}'
    WHEN 'lab_result' THEN 'Your {{test_name}} results are now available in your patient portal.'
    WHEN 'payment_reminder' THEN 'Your payment of {{amount}} is due on {{due_date}}.'
    ELSE 'You have a new notification from MindTrack.'
  END,
  NULL,
  NULL,
  NULL,
  CASE nt.name
    WHEN 'appointment_reminder' THEN '["appointment_date", "appointment_time", "doctor_name"]'::jsonb
    WHEN 'medication_reminder' THEN '["medication_name", "dosage", "instructions"]'::jsonb
    WHEN 'lab_result' THEN '["test_name"]'::jsonb
    WHEN 'payment_reminder' THEN '["amount", "due_date"]'::jsonb
    ELSE '[]'::jsonb
  END
FROM notification_types nt
ON CONFLICT DO NOTHING;

-- WebSocket connections table (for tracking active connections)
CREATE TABLE IF NOT EXISTS websocket_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  socket_id VARCHAR(100) NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Indexes for websocket connections
CREATE INDEX IF NOT EXISTS idx_websocket_connections_user_id ON websocket_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_websocket_connections_socket_id ON websocket_connections(socket_id);
CREATE INDEX IF NOT EXISTS idx_websocket_connections_is_active ON websocket_connections(is_active);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_notification_types_updated_at 
  BEFORE UPDATE ON notification_types 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notification_settings_updated_at 
  BEFORE UPDATE ON user_notification_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON notifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at 
  BEFORE UPDATE ON notification_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read, etc.)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_notification_settings
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own notification settings
CREATE POLICY "Users can view own notification settings" ON user_notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings" ON user_notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings" ON user_notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for websocket_connections
ALTER TABLE websocket_connections ENABLE ROW LEVEL SECURITY;

-- Users can view their own websocket connections
CREATE POLICY "Users can view own websocket connections" ON websocket_connections
  FOR SELECT USING (auth.uid() = user_id);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type_name VARCHAR(100),
  p_title VARCHAR(200),
  p_message TEXT,
  p_priority VARCHAR(20) DEFAULT 'normal',
  p_data JSONB DEFAULT NULL,
  p_action_url VARCHAR(500) DEFAULT NULL,
  p_action_text VARCHAR(100) DEFAULT NULL,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_type_id UUID;
  v_notification_id UUID;
BEGIN
  -- Get notification type ID
  SELECT id INTO v_type_id 
  FROM notification_types 
  WHERE name = p_type_name AND is_active = true;
  
  IF v_type_id IS NULL THEN
    RAISE EXCEPTION 'Notification type % not found or inactive', p_type_name;
  END IF;
  
  -- Create notification
  INSERT INTO notifications (
    user_id, type_id, title, message, priority, data, 
    action_url, action_text, expires_at
  ) VALUES (
    p_user_id, v_type_id, p_title, p_message, p_priority, p_data,
    p_action_url, p_action_text, p_expires_at
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications 
  SET is_read = true, read_at = NOW()
  WHERE id = p_notification_id AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM notifications
  WHERE user_id = p_user_id 
    AND is_read = false 
    AND (expires_at IS NULL OR expires_at > NOW());
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;










