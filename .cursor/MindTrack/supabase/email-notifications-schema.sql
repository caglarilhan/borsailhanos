-- Email notifications schema for Supabase
-- This table stores email notification logs and templates

CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  template_type VARCHAR(100) NOT NULL,
  template_data JSONB NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, sent, failed
  message_id VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_notifications_user_id ON email_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_sent_at ON email_notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_notifications_template_type ON email_notifications(template_type);

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  template_type VARCHAR(100) NOT NULL UNIQUE,
  subject VARCHAR(500) NOT NULL,
  html_content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default email templates
INSERT INTO email_templates (name, template_type, subject, html_content) VALUES
(
  'Appointment Reminder',
  'appointmentReminder',
  'Appointment Reminder - MindTrack',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2563eb;">Appointment Reminder</h2>
    <p>Dear {{patientName}},</p>
    <p>This is a reminder for your upcoming appointment:</p>
    <ul>
      <li><strong>Date:</strong> {{appointmentDate}}</li>
      <li><strong>Time:</strong> {{appointmentTime}}</li>
      <li><strong>Doctor:</strong> {{doctorName}}</li>
    </ul>
    <p>Please arrive 15 minutes early for your appointment.</p>
    <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
    <br>
    <p>Best regards,<br>MindTrack Team</p>
  </div>'
),
(
  'Medication Reminder',
  'medicationReminder',
  'Medication Reminder - MindTrack',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2563eb;">Medication Reminder</h2>
    <p>Dear {{patientName}},</p>
    <p>This is a reminder to take your medication:</p>
    <ul>
      <li><strong>Medication:</strong> {{medicationName}}</li>
      <li><strong>Dosage:</strong> {{dosage}}</li>
      <li><strong>Time:</strong> {{time}}</li>
    </ul>
    <p>Please take your medication as prescribed by your doctor.</p>
    <br>
    <p>Best regards,<br>MindTrack Team</p>
  </div>'
),
(
  'Test Results',
  'testResults',
  'Test Results Available - MindTrack',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2563eb;">Test Results Available</h2>
    <p>Dear {{patientName}},</p>
    <p>Your test results are now available:</p>
    <ul>
      <li><strong>Test:</strong> {{testName}}</li>
      <li><strong>Result Date:</strong> {{resultDate}}</li>
      <li><strong>Doctor:</strong> {{doctorName}}</li>
    </ul>
    <p>Please log in to your MindTrack account to view your results.</p>
    <p>If you have any questions, please contact your doctor.</p>
    <br>
    <p>Best regards,<br>MindTrack Team</p>
  </div>'
),
(
  'Prescription Ready',
  'prescriptionReady',
  'Prescription Ready - MindTrack',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2563eb;">Prescription Ready for Pickup</h2>
    <p>Dear {{patientName}},</p>
    <p>Your prescription is ready for pickup:</p>
    <ul>
      <li><strong>Prescription:</strong> {{prescriptionName}}</li>
      <li><strong>Pharmacy:</strong> {{pharmacyName}}</li>
      <li><strong>Pickup Date:</strong> {{pickupDate}}</li>
    </ul>
    <p>Please bring a valid ID when picking up your prescription.</p>
    <br>
    <p>Best regards,<br>MindTrack Team</p>
  </div>'
)
ON CONFLICT (template_type) DO NOTHING;

-- Email preferences table for users
CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  appointment_reminders BOOLEAN DEFAULT true,
  medication_reminders BOOLEAN DEFAULT true,
  test_results BOOLEAN DEFAULT true,
  prescription_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for email preferences
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_email_notifications_updated_at 
  BEFORE UPDATE ON email_notifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at 
  BEFORE UPDATE ON email_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_preferences_updated_at 
  BEFORE UPDATE ON email_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

