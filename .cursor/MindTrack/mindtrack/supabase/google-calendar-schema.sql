-- Google Calendar Integration Schema
-- This schema handles Google Calendar OAuth tokens and synchronization

-- User Google tokens table
CREATE TABLE IF NOT EXISTS user_google_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  expiry_date TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  google_user_id TEXT NOT NULL,
  google_email TEXT NOT NULL,
  google_name TEXT,
  google_picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one token per user
  UNIQUE(user_id)
);

-- Calendar events sync table
CREATE TABLE IF NOT EXISTS calendar_events_sync (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID, -- Reference to appointments table if exists
  google_event_id TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  attendees JSONB DEFAULT '[]'::jsonb,
  conference_link TEXT,
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'failed')),
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one sync record per Google event
  UNIQUE(google_event_id)
);

-- Calendar sync logs table
CREATE TABLE IF NOT EXISTS calendar_sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('oauth', 'event_create', 'event_update', 'event_delete', 'sync_all')),
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')),
  message TEXT,
  error_details JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_google_tokens_user_id ON user_google_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_google_tokens_google_user_id ON user_google_tokens(google_user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_sync_user_id ON calendar_events_sync(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_sync_appointment_id ON calendar_events_sync(appointment_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_sync_google_event_id ON calendar_events_sync(google_event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_sync_logs_user_id ON calendar_sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_sync_logs_created_at ON calendar_sync_logs(created_at);

-- RLS Policies
ALTER TABLE user_google_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync_logs ENABLE ROW LEVEL SECURITY;

-- User can only access their own Google tokens
CREATE POLICY "Users can view own google tokens" ON user_google_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own google tokens" ON user_google_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own google tokens" ON user_google_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own google tokens" ON user_google_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- User can only access their own calendar events sync
CREATE POLICY "Users can view own calendar events sync" ON calendar_events_sync
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar events sync" ON calendar_events_sync
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events sync" ON calendar_events_sync
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events sync" ON calendar_events_sync
  FOR DELETE USING (auth.uid() = user_id);

-- User can only access their own sync logs
CREATE POLICY "Users can view own calendar sync logs" ON calendar_sync_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar sync logs" ON calendar_sync_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_user_google_tokens_updated_at
  BEFORE UPDATE ON user_google_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_sync_updated_at
  BEFORE UPDATE ON calendar_events_sync
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_google_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM user_google_tokens 
  WHERE expiry_date < NOW() - INTERVAL '7 days';
END;
$$ language 'plpgsql';

-- Function to get user's Google Calendar connection status
CREATE OR REPLACE FUNCTION get_user_google_calendar_status(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  token_record user_google_tokens%ROWTYPE;
  result JSON;
BEGIN
  SELECT * INTO token_record 
  FROM user_google_tokens 
  WHERE user_id = user_uuid;
  
  IF token_record.id IS NULL THEN
    result := json_build_object(
      'connected', false,
      'profile', null
    );
  ELSE
    result := json_build_object(
      'connected', true,
      'profile', json_build_object(
        'id', token_record.google_user_id,
        'email', token_record.google_email,
        'name', token_record.google_name,
        'picture', token_record.google_picture
      ),
      'token_expires_at', token_record.expiry_date
    );
  END IF;
  
  RETURN result;
END;
$$ language 'plpgsql';

-- Function to log calendar sync activities
CREATE OR REPLACE FUNCTION log_calendar_sync(
  user_uuid UUID,
  sync_type_param TEXT,
  status_param TEXT,
  message_param TEXT DEFAULT NULL,
  error_details_param JSONB DEFAULT NULL,
  metadata_param JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO calendar_sync_logs (
    user_id,
    sync_type,
    status,
    message,
    error_details,
    metadata
  ) VALUES (
    user_uuid,
    sync_type_param,
    status_param,
    message_param,
    error_details_param,
    metadata_param
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ language 'plpgsql';


