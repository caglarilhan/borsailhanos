-- Clinic Members Row Level Security Policies
-- This file defines access control policies for clinic members data

-- Enable RLS on all tables
ALTER TABLE clinic_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CLINIC_MEMBERS POLICIES
-- ============================================================================

-- Policy: Users can view members of their own clinic
CREATE POLICY "Users can view clinic members" ON clinic_members
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id 
            FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Only admins can insert new members
CREATE POLICY "Only admins can add members" ON clinic_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members cm
            JOIN user_profiles up ON cm.user_id = up.user_id
            WHERE cm.user_id = auth.uid()
              AND cm.clinic_id = clinic_id
              AND cm.role = 'admin'
              AND cm.status = 'active'
        )
    );

-- Policy: Only admins can update member roles and status
CREATE POLICY "Only admins can update members" ON clinic_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clinic_members cm
            JOIN user_profiles up ON cm.user_id = up.user_id
            WHERE cm.user_id = auth.uid()
              AND cm.clinic_id = clinic_id
              AND cm.role = 'admin'
              AND cm.status = 'active'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members cm
            JOIN user_profiles up ON cm.user_id = up.user_id
            WHERE cm.user_id = auth.uid()
              AND cm.clinic_id = clinic_id
              AND cm.role = 'admin'
              AND cm.status = 'active'
        )
    );

-- Policy: Only admins can delete members
CREATE POLICY "Only admins can delete members" ON clinic_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM clinic_members cm
            JOIN user_profiles up ON cm.user_id = up.user_id
            WHERE cm.user_id = auth.uid()
              AND cm.clinic_id = clinic_id
              AND cm.role = 'admin'
              AND cm.status = 'active'
        )
        AND user_id != auth.uid() -- Cannot delete yourself
    );

-- ============================================================================
-- MEMBER_PERMISSIONS POLICIES
-- ============================================================================

-- Policy: All authenticated users can view permissions (read-only table)
CREATE POLICY "All users can view permissions" ON member_permissions
    FOR SELECT USING (true);

-- Policy: Only super admins can modify permissions (restrictive)
CREATE POLICY "Only super admins can modify permissions" ON member_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clinic_members cm
            JOIN user_profiles up ON cm.user_id = up.user_id
            WHERE cm.user_id = auth.uid()
              AND cm.clinic_id = clinic_id
              AND cm.role = 'admin'
              AND cm.status = 'active'
        )
    );

-- ============================================================================
-- MEMBER_ACTIVITY_LOG POLICIES
-- ============================================================================

-- Policy: Users can view activity logs for their own clinic
CREATE POLICY "Users can view clinic activity logs" ON member_activity_log
    FOR SELECT USING (
        member_id IN (
            SELECT cm.id FROM clinic_members cm
            JOIN user_profiles up ON cm.user_id = up.user_id
            WHERE up.clinic_id IN (
                SELECT clinic_id 
                FROM user_profiles 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Policy: Users can insert activity logs for their own actions
CREATE POLICY "Users can log their own activity" ON member_activity_log
    FOR INSERT WITH CHECK (
        member_id IN (
            SELECT id FROM clinic_members
            WHERE user_id = auth.uid()
        )
    );

-- ============================================================================
-- MEMBER_INVITATIONS POLICIES
-- ============================================================================

-- Policy: Users can view invitations for their own clinic
CREATE POLICY "Users can view clinic invitations" ON member_invitations
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id 
            FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Only admins and therapists can create invitations
CREATE POLICY "Admins and therapists can create invitations" ON member_invitations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members cm
            JOIN user_profiles up ON cm.user_id = up.user_id
            WHERE cm.user_id = auth.uid()
              AND cm.clinic_id = clinic_id
              AND cm.role IN ('admin', 'therapist')
              AND cm.status = 'active'
        )
    );

-- Policy: Only admins can update invitation status
CREATE POLICY "Only admins can update invitations" ON member_invitations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clinic_members cm
            JOIN user_profiles up ON cm.user_id = up.user_id
            WHERE cm.user_id = auth.uid()
              AND cm.clinic_id = clinic_id
              AND cm.role = 'admin'
              AND cm.status = 'active'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members cm
            JOIN user_profiles up ON cm.user_id = up.user_id
            WHERE cm.user_id = auth.uid()
              AND cm.clinic_id = clinic_id
              AND cm.role = 'admin'
              AND cm.status = 'active'
        )
    );

-- Policy: Only admins can delete invitations
CREATE POLICY "Only admins can delete invitations" ON member_invitations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM clinic_members cm
            JOIN user_profiles up ON cm.user_id = up.user_id
            WHERE cm.user_id = auth.uid()
              AND cm.clinic_id = clinic_id
              AND cm.role = 'admin'
              AND cm.status = 'active'
        )
    );

-- ============================================================================
-- MEMBER_SESSIONS POLICIES
-- ============================================================================

-- Policy: Users can view their own sessions
CREATE POLICY "Users can view their own sessions" ON member_sessions
    FOR SELECT USING (
        member_id IN (
            SELECT id FROM clinic_members
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can create their own sessions
CREATE POLICY "Users can create their own sessions" ON member_sessions
    FOR INSERT WITH CHECK (
        member_id IN (
            SELECT id FROM clinic_members
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can update their own sessions
CREATE POLICY "Users can update their own sessions" ON member_sessions
    FOR UPDATE USING (
        member_id IN (
            SELECT id FROM clinic_members
            WHERE user_id = auth.uid()
        )
    ) WITH CHECK (
        member_id IN (
            SELECT id FROM clinic_members
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can delete their own sessions
CREATE POLICY "Users can delete their own sessions" ON member_sessions
    FOR DELETE USING (
        member_id IN (
            SELECT id FROM clinic_members
            WHERE user_id = auth.uid()
        )
    );

-- ============================================================================
-- ADDITIONAL SECURITY MEASURES
-- ============================================================================

-- Create a function to automatically log member actions
CREATE OR REPLACE FUNCTION log_member_action()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the action
    INSERT INTO member_activity_log (
        member_id,
        action,
        resource_type,
        resource_id,
        details
    ) VALUES (
        (SELECT id FROM clinic_members WHERE user_id = auth.uid() LIMIT 1),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object(
            'old', to_jsonb(OLD),
            'new', to_jsonb(NEW),
            'timestamp', now()
        )
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic logging
CREATE TRIGGER log_clinic_members_changes
    AFTER INSERT OR UPDATE OR DELETE ON clinic_members
    FOR EACH ROW EXECUTE FUNCTION log_member_action();

CREATE TRIGGER log_member_invitations_changes
    AFTER INSERT OR UPDATE OR DELETE ON member_invitations
    FOR EACH ROW EXECUTE FUNCTION log_member_action();

-- Create a function to validate clinic membership
CREATE OR REPLACE FUNCTION validate_clinic_membership()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure user belongs to the clinic
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = NEW.user_id
          AND clinic_id = NEW.clinic_id
    ) THEN
        RAISE EXCEPTION 'User must belong to the clinic before becoming a member';
    END IF;
    
    -- Ensure at least one admin remains if changing role
    IF TG_OP = 'UPDATE' AND OLD.role = 'admin' AND NEW.role != 'admin' THEN
        IF (
            SELECT COUNT(*) FROM clinic_members
            WHERE clinic_id = NEW.clinic_id
              AND role = 'admin'
              AND status = 'active'
              AND user_id != NEW.user_id
        ) = 0 THEN
            RAISE EXCEPTION 'Cannot remove the last admin from the clinic';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for membership validation
CREATE TRIGGER validate_clinic_membership_trigger
    BEFORE INSERT OR UPDATE ON clinic_members
    FOR EACH ROW EXECUTE FUNCTION validate_clinic_membership();

-- Create a function to check invitation limits
CREATE OR REPLACE FUNCTION check_invitation_limits()
RETURNS TRIGGER AS $$
DECLARE
    pending_count INTEGER;
    max_pending INTEGER := 10; -- Maximum pending invitations per clinic
BEGIN
    -- Count pending invitations for this clinic
    SELECT COUNT(*) INTO pending_count
    FROM member_invitations
    WHERE clinic_id = NEW.clinic_id
      AND status = 'pending';
    
    -- Check if limit exceeded
    IF pending_count >= max_pending THEN
        RAISE EXCEPTION 'Maximum pending invitations limit reached for this clinic';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for invitation limits
CREATE TRIGGER check_invitation_limits_trigger
    BEFORE INSERT ON member_invitations
    FOR EACH ROW EXECUTE FUNCTION check_invitation_limits();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON clinic_members TO authenticated;
GRANT SELECT ON member_permissions TO authenticated;
GRANT SELECT, INSERT ON member_activity_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON member_invitations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON member_sessions TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
