-- Clinic Members Management Schema
-- This schema provides comprehensive clinic staff management functionality

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clinic Members Table
-- Stores clinic staff members and their roles/permissions
CREATE TABLE IF NOT EXISTS clinic_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'therapist', 'assistant')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    notes TEXT,
    
    -- Ensure unique user per clinic
    UNIQUE(user_id, clinic_id),
    
    -- Ensure valid role combinations
    CONSTRAINT valid_role_status CHECK (
        (status = 'active' AND role IN ('admin', 'therapist', 'assistant')) OR
        (status = 'inactive' AND role IN ('admin', 'therapist', 'assistant')) OR
        (status = 'pending' AND role IN ('admin', 'therapist', 'assistant'))
    )
);

-- Member Permissions Table
-- Defines granular permissions for each role
CREATE TABLE IF NOT EXISTS member_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role TEXT NOT NULL CHECK (role IN ('admin', 'therapist', 'assistant')),
    resource TEXT NOT NULL, -- 'clients', 'appointments', 'notes', 'billing', 'clinic', 'assessments'
    action TEXT NOT NULL, -- 'create', 'read', 'update', 'delete', 'manage'
    granted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(role, resource, action)
);

-- Member Activity Log
-- Tracks member actions for audit purposes
CREATE TABLE IF NOT EXISTS member_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES clinic_members(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Member Invitations Table
-- Tracks invitation history and status
CREATE TABLE IF NOT EXISTS member_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'therapist', 'assistant')),
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by UUID REFERENCES auth.users(id),
    
    UNIQUE(email, clinic_id, status)
);

-- Member Sessions Table
-- Tracks member login sessions and activity
CREATE TABLE IF NOT EXISTS member_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES clinic_members(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    is_active BOOLEAN DEFAULT true
);

-- Insert default permissions for each role
INSERT INTO member_permissions (role, resource, action, granted) VALUES
-- Admin permissions (full access)
('admin', 'clients', 'create', true),
('admin', 'clients', 'read', true),
('admin', 'clients', 'update', true),
('admin', 'clients', 'delete', true),
('admin', 'clients', 'manage', true),
('admin', 'appointments', 'create', true),
('admin', 'appointments', 'read', true),
('admin', 'appointments', 'update', true),
('admin', 'appointments', 'delete', true),
('admin', 'appointments', 'manage', true),
('admin', 'notes', 'create', true),
('admin', 'notes', 'read', true),
('admin', 'notes', 'update', true),
('admin', 'notes', 'delete', true),
('admin', 'notes', 'manage', true),
('admin', 'billing', 'create', true),
('admin', 'billing', 'read', true),
('admin', 'billing', 'update', true),
('admin', 'billing', 'delete', true),
('admin', 'billing', 'manage', true),
('admin', 'clinic', 'create', true),
('admin', 'clinic', 'read', true),
('admin', 'clinic', 'update', true),
('admin', 'clinic', 'delete', true),
('admin', 'clinic', 'manage', true),
('admin', 'assessments', 'create', true),
('admin', 'assessments', 'read', true),
('admin', 'assessments', 'update', true),
('admin', 'assessments', 'delete', true),
('admin', 'assessments', 'manage', true),

-- Therapist permissions (clinical access)
('therapist', 'clients', 'create', true),
('therapist', 'clients', 'read', true),
('therapist', 'clients', 'update', true),
('therapist', 'clients', 'delete', false),
('therapist', 'clients', 'manage', false),
('therapist', 'appointments', 'create', true),
('therapist', 'appointments', 'read', true),
('therapist', 'appointments', 'update', true),
('therapist', 'appointments', 'delete', false),
('therapist', 'appointments', 'manage', false),
('therapist', 'notes', 'create', true),
('therapist', 'notes', 'read', true),
('therapist', 'notes', 'update', true),
('therapist', 'notes', 'delete', false),
('therapist', 'notes', 'manage', false),
('therapist', 'billing', 'create', true),
('therapist', 'billing', 'read', true),
('therapist', 'billing', 'update', false),
('therapist', 'billing', 'delete', false),
('therapist', 'billing', 'manage', false),
('therapist', 'clinic', 'create', false),
('therapist', 'clinic', 'read', true),
('therapist', 'clinic', 'update', false),
('therapist', 'clinic', 'delete', false),
('therapist', 'clinic', 'manage', false),
('therapist', 'assessments', 'create', true),
('therapist', 'assessments', 'read', true),
('therapist', 'assessments', 'update', true),
('therapist', 'assessments', 'delete', false),
('therapist', 'assessments', 'manage', false),

-- Assistant permissions (limited access)
('assistant', 'clients', 'create', false),
('assistant', 'clients', 'read', true),
('assistant', 'clients', 'update', false),
('assistant', 'clients', 'delete', false),
('assistant', 'clients', 'manage', false),
('assistant', 'appointments', 'create', true),
('assistant', 'appointments', 'read', true),
('assistant', 'appointments', 'update', false),
('assistant', 'appointments', 'delete', false),
('assistant', 'appointments', 'manage', false),
('assistant', 'notes', 'create', false),
('assistant', 'notes', 'read', true),
('assistant', 'notes', 'update', false),
('assistant', 'notes', 'delete', false),
('assistant', 'notes', 'manage', false),
('assistant', 'billing', 'create', false),
('assistant', 'billing', 'read', true),
('assistant', 'billing', 'update', false),
('assistant', 'billing', 'delete', false),
('assistant', 'billing', 'manage', false),
('assistant', 'clinic', 'create', false),
('assistant', 'clinic', 'read', false),
('assistant', 'clinic', 'update', false),
('assistant', 'clinic', 'delete', false),
('assistant', 'clinic', 'manage', false),
('assistant', 'assessments', 'create', false),
('assistant', 'assessments', 'read', true),
('assistant', 'assessments', 'update', false),
('assistant', 'assessments', 'delete', false),
('assistant', 'assessments', 'manage', false)
ON CONFLICT (role, resource, action) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clinic_members_clinic_id ON clinic_members(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_members_user_id ON clinic_members(user_id);
CREATE INDEX IF NOT EXISTS idx_clinic_members_role ON clinic_members(role);
CREATE INDEX IF NOT EXISTS idx_clinic_members_status ON clinic_members(status);
CREATE INDEX IF NOT EXISTS idx_clinic_members_clinic_role ON clinic_members(clinic_id, role);
CREATE INDEX IF NOT EXISTS idx_clinic_members_clinic_status ON clinic_members(clinic_id, status);

CREATE INDEX IF NOT EXISTS idx_member_permissions_role ON member_permissions(role);
CREATE INDEX IF NOT EXISTS idx_member_permissions_resource ON member_permissions(resource);

CREATE INDEX IF NOT EXISTS idx_member_activity_log_member_id ON member_activity_log(member_id);
CREATE INDEX IF NOT EXISTS idx_member_activity_log_created_at ON member_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_member_activity_log_action ON member_activity_log(action);

CREATE INDEX IF NOT EXISTS idx_member_invitations_clinic_id ON member_invitations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_member_invitations_email ON member_invitations(email);
CREATE INDEX IF NOT EXISTS idx_member_invitations_status ON member_invitations(status);
CREATE INDEX IF NOT EXISTS idx_member_invitations_token ON member_invitations(token);

CREATE INDEX IF NOT EXISTS idx_member_sessions_member_id ON member_sessions(member_id);
CREATE INDEX IF NOT EXISTS idx_member_sessions_token ON member_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_member_sessions_expires_at ON member_sessions(expires_at);

-- Create functions for common operations

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION check_member_permission(
    p_user_id UUID,
    p_clinic_id UUID,
    p_resource TEXT,
    p_action TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    member_role TEXT;
    has_permission BOOLEAN;
BEGIN
    -- Get member's role
    SELECT role INTO member_role
    FROM clinic_members
    WHERE user_id = p_user_id 
      AND clinic_id = p_clinic_id 
      AND status = 'active';
    
    IF member_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check permission
    SELECT granted INTO has_permission
    FROM member_permissions
    WHERE role = member_role 
      AND resource = p_resource 
      AND action = p_action;
    
    RETURN COALESCE(has_permission, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get member's role
CREATE OR REPLACE FUNCTION get_member_role(
    p_user_id UUID,
    p_clinic_id UUID
) RETURNS TEXT AS $$
DECLARE
    member_role TEXT;
BEGIN
    SELECT role INTO member_role
    FROM clinic_members
    WHERE user_id = p_user_id 
      AND clinic_id = p_clinic_id 
      AND status = 'active';
    
    RETURN member_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log member activity
CREATE OR REPLACE FUNCTION log_member_activity(
    p_member_id UUID,
    p_action TEXT,
    p_resource_type TEXT DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO member_activity_log (
        member_id, action, resource_type, resource_id, 
        details, ip_address, user_agent
    ) VALUES (
        p_member_id, p_action, p_resource_type, p_resource_id,
        p_details, p_ip_address, p_user_agent
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations() RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE member_invitations 
    SET status = 'expired' 
    WHERE status = 'pending' AND expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions() RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE member_sessions 
    SET is_active = false 
    WHERE expires_at < NOW() AND is_active = true;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a cron job to clean up expired data (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-data', '0 2 * * *', 'SELECT cleanup_expired_invitations(); SELECT cleanup_expired_sessions();');

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON clinic_members TO authenticated;
GRANT SELECT ON member_permissions TO authenticated;
GRANT SELECT, INSERT ON member_activity_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON member_invitations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON member_sessions TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION check_member_permission(UUID, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_member_role(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_member_activity(UUID, TEXT, TEXT, UUID, JSONB, INET, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_invitations() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_sessions() TO authenticated;
