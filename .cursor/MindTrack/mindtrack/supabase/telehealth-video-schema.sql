-- Telehealth Video Platform Schema
-- This schema stores video sessions, rooms, VR therapy, and analytics

-- Video Sessions Table
CREATE TABLE IF NOT EXISTS video_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('consultation', 'therapy', 'followup', 'emergency')),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled', 'no_show')),
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- in minutes
    room_id VARCHAR(255) UNIQUE NOT NULL,
    meeting_url VARCHAR(500) NOT NULL,
    recording_url VARCHAR(500),
    notes TEXT,
    diagnosis TEXT,
    prescription TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    billing_code VARCHAR(100),
    cost DECIMAL(10,2),
    vr_enabled BOOLEAN DEFAULT FALSE,
    vr_session_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video Rooms Table
CREATE TABLE IF NOT EXISTS video_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    max_participants INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    participants TEXT[] DEFAULT '{}',
    settings JSONB DEFAULT '{
        "allowScreenShare": true,
        "allowRecording": true,
        "allowChat": true,
        "allowFileShare": true,
        "vrEnabled": false
    }'::jsonb
);

-- VR Therapy Sessions Table
CREATE TABLE IF NOT EXISTS vr_therapy_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES video_sessions(id),
    therapy_type VARCHAR(50) NOT NULL CHECK (therapy_type IN ('exposure', 'relaxation', 'cognitive', 'social', 'pain_management')),
    vr_environment VARCHAR(255) NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    patient_progress JSONB,
    therapist_notes TEXT,
    effectiveness_score INTEGER CHECK (effectiveness_score >= 1 AND effectiveness_score <= 10),
    patient_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Connection Quality Logs Table
CREATE TABLE IF NOT EXISTS connection_quality_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES video_sessions(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    quality_data JSONB NOT NULL
);

-- Video Session Participants Table
CREATE TABLE IF NOT EXISTS video_session_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES video_sessions(id),
    user_id UUID NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('patient', 'provider', 'observer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    connection_quality JSONB,
    device_info JSONB
);

-- Video Session Chat Messages Table
CREATE TABLE IF NOT EXISTS video_session_chat (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES video_sessions(id),
    user_id UUID NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'link')),
    file_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video Session Recordings Table
CREATE TABLE IF NOT EXISTS video_session_recordings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES video_sessions(id),
    recording_url VARCHAR(500) NOT NULL,
    recording_duration INTEGER, -- in seconds
    file_size BIGINT, -- in bytes
    recording_quality VARCHAR(50) DEFAULT 'HD',
    storage_location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Telehealth Analytics Table
CREATE TABLE IF NOT EXISTS telehealth_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    total_sessions INTEGER DEFAULT 0,
    completed_sessions INTEGER DEFAULT 0,
    cancelled_sessions INTEGER DEFAULT 0,
    no_show_sessions INTEGER DEFAULT 0,
    emergency_sessions INTEGER DEFAULT 0,
    vr_sessions INTEGER DEFAULT 0,
    average_duration_minutes DECIMAL(5,2) DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    connection_issues INTEGER DEFAULT 0,
    quality_score DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency Sessions Table
CREATE TABLE IF NOT EXISTS emergency_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES video_sessions(id),
    emergency_type VARCHAR(50) NOT NULL CHECK (emergency_type IN ('medical', 'psychiatric', 'crisis', 'urgent')),
    priority_level VARCHAR(50) DEFAULT 'high' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
    response_time_seconds INTEGER,
    resolution_status VARCHAR(50) DEFAULT 'active' CHECK (resolution_status IN ('active', 'resolved', 'escalated')),
    escalation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- VR Environments Table
CREATE TABLE IF NOT EXISTS vr_environments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    environment_type VARCHAR(50) NOT NULL CHECK (environment_type IN ('therapeutic', 'relaxation', 'exposure', 'training', 'assessment')),
    vr_scene_url VARCHAR(500),
    vr_assets JSONB,
    recommended_duration INTEGER, -- in minutes
    therapy_types TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video Session Feedback Table
CREATE TABLE IF NOT EXISTS video_session_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES video_sessions(id),
    user_id UUID NOT NULL,
    feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('patient', 'provider', 'technical')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    technical_issues TEXT[],
    satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_sessions_patient_id ON video_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_video_sessions_provider_id ON video_sessions(provider_id);
CREATE INDEX IF NOT EXISTS idx_video_sessions_status ON video_sessions(status);
CREATE INDEX IF NOT EXISTS idx_video_sessions_scheduled_date ON video_sessions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_video_sessions_session_type ON video_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_video_sessions_room_id ON video_sessions(room_id);

CREATE INDEX IF NOT EXISTS idx_video_rooms_room_id ON video_rooms(room_id);
CREATE INDEX IF NOT EXISTS idx_video_rooms_is_active ON video_rooms(is_active);

CREATE INDEX IF NOT EXISTS idx_vr_therapy_sessions_session_id ON vr_therapy_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_vr_therapy_sessions_therapy_type ON vr_therapy_sessions(therapy_type);

CREATE INDEX IF NOT EXISTS idx_connection_quality_logs_session_id ON connection_quality_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_connection_quality_logs_timestamp ON connection_quality_logs(timestamp);

CREATE INDEX IF NOT EXISTS idx_video_session_participants_session_id ON video_session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_video_session_participants_user_id ON video_session_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_video_session_chat_session_id ON video_session_chat(session_id);
CREATE INDEX IF NOT EXISTS idx_video_session_chat_created_at ON video_session_chat(created_at);

CREATE INDEX IF NOT EXISTS idx_video_session_recordings_session_id ON video_session_recordings(session_id);

CREATE INDEX IF NOT EXISTS idx_telehealth_analytics_date ON telehealth_analytics(date);

CREATE INDEX IF NOT EXISTS idx_emergency_sessions_session_id ON emergency_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_emergency_sessions_priority_level ON emergency_sessions(priority_level);

CREATE INDEX IF NOT EXISTS idx_vr_environments_environment_type ON vr_environments(environment_type);
CREATE INDEX IF NOT EXISTS idx_vr_environments_is_active ON vr_environments(is_active);

CREATE INDEX IF NOT EXISTS idx_video_session_feedback_session_id ON video_session_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_video_session_feedback_feedback_type ON video_session_feedback(feedback_type);

-- Row Level Security (RLS) Policies
ALTER TABLE video_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE vr_therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_quality_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_session_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_session_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE telehealth_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vr_environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_session_feedback ENABLE ROW LEVEL SECURITY;

-- Policies for video_sessions
CREATE POLICY "Users can view video sessions" ON video_sessions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert video sessions" ON video_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update video sessions" ON video_sessions
    FOR UPDATE USING (true);

-- Policies for video_rooms
CREATE POLICY "Users can view video rooms" ON video_rooms
    FOR SELECT USING (true);

CREATE POLICY "Users can insert video rooms" ON video_rooms
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update video rooms" ON video_rooms
    FOR UPDATE USING (true);

-- Policies for vr_therapy_sessions
CREATE POLICY "Users can view vr therapy sessions" ON vr_therapy_sessions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert vr therapy sessions" ON vr_therapy_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update vr therapy sessions" ON vr_therapy_sessions
    FOR UPDATE USING (true);

-- Policies for connection_quality_logs
CREATE POLICY "Users can view connection quality logs" ON connection_quality_logs
    FOR SELECT USING (true);

CREATE POLICY "Users can insert connection quality logs" ON connection_quality_logs
    FOR INSERT WITH CHECK (true);

-- Policies for video_session_participants
CREATE POLICY "Users can view video session participants" ON video_session_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can insert video session participants" ON video_session_participants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update video session participants" ON video_session_participants
    FOR UPDATE USING (true);

-- Policies for video_session_chat
CREATE POLICY "Users can view video session chat" ON video_session_chat
    FOR SELECT USING (true);

CREATE POLICY "Users can insert video session chat" ON video_session_chat
    FOR INSERT WITH CHECK (true);

-- Policies for video_session_recordings
CREATE POLICY "Users can view video session recordings" ON video_session_recordings
    FOR SELECT USING (true);

CREATE POLICY "Users can insert video session recordings" ON video_session_recordings
    FOR INSERT WITH CHECK (true);

-- Policies for telehealth_analytics
CREATE POLICY "Users can view telehealth analytics" ON telehealth_analytics
    FOR SELECT USING (true);

CREATE POLICY "Users can insert telehealth analytics" ON telehealth_analytics
    FOR INSERT WITH CHECK (true);

-- Policies for emergency_sessions
CREATE POLICY "Users can view emergency sessions" ON emergency_sessions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert emergency sessions" ON emergency_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update emergency sessions" ON emergency_sessions
    FOR UPDATE USING (true);

-- Policies for vr_environments
CREATE POLICY "Users can view vr environments" ON vr_environments
    FOR SELECT USING (true);

CREATE POLICY "Users can insert vr environments" ON vr_environments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update vr environments" ON vr_environments
    FOR UPDATE USING (true);

-- Policies for video_session_feedback
CREATE POLICY "Users can view video session feedback" ON video_session_feedback
    FOR SELECT USING (true);

CREATE POLICY "Users can insert video session feedback" ON video_session_feedback
    FOR INSERT WITH CHECK (true);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_video_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_vr_therapy_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_vr_environments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
CREATE TRIGGER trigger_update_video_sessions_updated_at
    BEFORE UPDATE ON video_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_video_sessions_updated_at();

CREATE TRIGGER trigger_update_vr_therapy_sessions_updated_at
    BEFORE UPDATE ON vr_therapy_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_vr_therapy_sessions_updated_at();

CREATE TRIGGER trigger_update_vr_environments_updated_at
    BEFORE UPDATE ON vr_environments
    FOR EACH ROW
    EXECUTE FUNCTION update_vr_environments_updated_at();

-- Comments for documentation
COMMENT ON TABLE video_sessions IS 'Stores video consultation sessions with scheduling and status';
COMMENT ON TABLE video_rooms IS 'Stores video room configurations and participant management';
COMMENT ON TABLE vr_therapy_sessions IS 'Stores VR therapy session data and progress tracking';
COMMENT ON TABLE connection_quality_logs IS 'Logs connection quality metrics for video sessions';
COMMENT ON TABLE video_session_participants IS 'Tracks participants in video sessions';
COMMENT ON TABLE video_session_chat IS 'Stores chat messages during video sessions';
COMMENT ON TABLE video_session_recordings IS 'Stores recording information for video sessions';
COMMENT ON TABLE telehealth_analytics IS 'Stores daily analytics for telehealth platform';
COMMENT ON TABLE emergency_sessions IS 'Stores emergency video session data';
COMMENT ON TABLE vr_environments IS 'Stores VR environment configurations';
COMMENT ON TABLE video_session_feedback IS 'Stores feedback from video session participants';
