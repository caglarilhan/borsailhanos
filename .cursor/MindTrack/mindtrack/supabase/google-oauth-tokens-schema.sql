-- Google OAuth Tokens Storage Table
-- Stores encrypted Google OAuth tokens for users

CREATE TABLE IF NOT EXISTS google_oauth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_tokens TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure one token record per user
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE google_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for google_oauth_tokens
CREATE POLICY "Users can view their own Google OAuth tokens" ON google_oauth_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Google OAuth tokens" ON google_oauth_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Google OAuth tokens" ON google_oauth_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Google OAuth tokens" ON google_oauth_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_google_oauth_tokens_user_id ON google_oauth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_google_oauth_tokens_expires_at ON google_oauth_tokens(expires_at);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_google_oauth_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_google_oauth_tokens_updated_at
  BEFORE UPDATE ON google_oauth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_google_oauth_tokens_updated_at();

-- Function to clean up expired tokens (optional)
CREATE OR REPLACE FUNCTION cleanup_expired_google_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM google_oauth_tokens 
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW() - INTERVAL '1 day'; -- Keep expired tokens for 1 day
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON google_oauth_tokens TO authenticated;
GRANT USAGE ON SEQUENCE google_oauth_tokens_id_seq TO authenticated;

