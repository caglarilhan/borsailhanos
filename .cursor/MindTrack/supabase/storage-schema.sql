-- Supabase Storage schema and policies
-- This file contains storage bucket configurations and RLS policies

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('patient-documents', 'patient-documents', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('medical-images', 'medical-images', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/dicom']),
  ('lab-reports', 'lab-reports', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('prescriptions', 'prescriptions', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('profile-photos', 'profile-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('temp-uploads', 'temp-uploads', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- File metadata table
CREATE TABLE IF NOT EXISTS file_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bucket_name VARCHAR(100) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_file_metadata_user_id ON file_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_file_metadata_bucket_name ON file_metadata(bucket_name);
CREATE INDEX IF NOT EXISTS idx_file_metadata_category ON file_metadata(category);
CREATE INDEX IF NOT EXISTS idx_file_metadata_created_at ON file_metadata(created_at);

-- File access logs table
CREATE TABLE IF NOT EXISTS file_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID REFERENCES file_metadata(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- view, download, delete, share
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for file access logs
CREATE INDEX IF NOT EXISTS idx_file_access_logs_file_id ON file_access_logs(file_id);
CREATE INDEX IF NOT EXISTS idx_file_access_logs_user_id ON file_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_file_access_logs_created_at ON file_access_logs(created_at);

-- File sharing table
CREATE TABLE IF NOT EXISTS file_sharing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID REFERENCES file_metadata(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL,
  shared_with UUID,
  shared_with_email VARCHAR(255),
  permission VARCHAR(20) DEFAULT 'view', -- view, download
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for file sharing
CREATE INDEX IF NOT EXISTS idx_file_sharing_file_id ON file_sharing(file_id);
CREATE INDEX IF NOT EXISTS idx_file_sharing_shared_by ON file_sharing(shared_by);
CREATE INDEX IF NOT EXISTS idx_file_sharing_shared_with ON file_sharing(shared_with);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_file_metadata_updated_at 
  BEFORE UPDATE ON file_metadata 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_sharing_updated_at 
  BEFORE UPDATE ON file_sharing 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for file_metadata
ALTER TABLE file_metadata ENABLE ROW LEVEL SECURITY;

-- Users can view their own files
CREATE POLICY "Users can view own files" ON file_metadata
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own files
CREATE POLICY "Users can insert own files" ON file_metadata
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own files
CREATE POLICY "Users can update own files" ON file_metadata
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own files
CREATE POLICY "Users can delete own files" ON file_metadata
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for file_access_logs
ALTER TABLE file_access_logs ENABLE ROW LEVEL SECURITY;

-- Users can view logs for their own files
CREATE POLICY "Users can view own file logs" ON file_access_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM file_metadata 
      WHERE file_metadata.id = file_access_logs.file_id 
      AND file_metadata.user_id = auth.uid()
    )
  );

-- Users can insert logs for their own files
CREATE POLICY "Users can insert own file logs" ON file_access_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM file_metadata 
      WHERE file_metadata.id = file_access_logs.file_id 
      AND file_metadata.user_id = auth.uid()
    )
  );

-- RLS Policies for file_sharing
ALTER TABLE file_sharing ENABLE ROW LEVEL SECURITY;

-- Users can view shares for their own files
CREATE POLICY "Users can view own file shares" ON file_sharing
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM file_metadata 
      WHERE file_metadata.id = file_sharing.file_id 
      AND file_metadata.user_id = auth.uid()
    )
  );

-- Users can create shares for their own files
CREATE POLICY "Users can create shares for own files" ON file_sharing
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM file_metadata 
      WHERE file_metadata.id = file_sharing.file_id 
      AND file_metadata.user_id = auth.uid()
    )
  );

-- Users can update shares for their own files
CREATE POLICY "Users can update own file shares" ON file_sharing
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM file_metadata 
      WHERE file_metadata.id = file_sharing.file_id 
      AND file_metadata.user_id = auth.uid()
    )
  );

-- Users can delete shares for their own files
CREATE POLICY "Users can delete own file shares" ON file_sharing
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM file_metadata 
      WHERE file_metadata.id = file_sharing.file_id 
      AND file_metadata.user_id = auth.uid()
    )
  );

-- Storage policies for buckets
-- Patient documents bucket - only accessible by file owner
CREATE POLICY "Patient documents access" ON storage.objects
  FOR ALL USING (
    bucket_id = 'patient-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Medical images bucket - only accessible by file owner
CREATE POLICY "Medical images access" ON storage.objects
  FOR ALL USING (
    bucket_id = 'medical-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Lab reports bucket - only accessible by file owner
CREATE POLICY "Lab reports access" ON storage.objects
  FOR ALL USING (
    bucket_id = 'lab-reports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Prescriptions bucket - only accessible by file owner
CREATE POLICY "Prescriptions access" ON storage.objects
  FOR ALL USING (
    bucket_id = 'prescriptions' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Profile photos bucket - public read, owner write
CREATE POLICY "Profile photos public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Profile photos owner write" ON storage.objects
  FOR ALL USING (
    bucket_id = 'profile-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Temp uploads bucket - only accessible by file owner
CREATE POLICY "Temp uploads access" ON storage.objects
  FOR ALL USING (
    bucket_id = 'temp-uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );










