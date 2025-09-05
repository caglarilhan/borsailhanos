-- Telehealth & Telemedicine Schema
-- Comprehensive telehealth management for American psychiatrists

-- Telehealth sessions
CREATE TABLE IF NOT EXISTS telehealth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES users(id),
    session_type VARCHAR(50) NOT NULL, -- 'initial_consultation', 'follow_up', 'crisis_intervention', 'group_therapy', 'family_therapy'
    session_status VARCHAR(20) NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'
    scheduled_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    session_duration INTEGER, -- Duration in minutes
    session_platform VARCHAR(50) NOT NULL, -- 'zoom', 'teams', 'doxy', 'custom', 'phone'
    session_url VARCHAR(500),
    meeting_id VARCHAR(100),
    meeting_password VARCHAR(100),
    waiting_room_enabled BOOLEAN DEFAULT TRUE,
    recording_enabled BOOLEAN DEFAULT FALSE,
    recording_consent_obtained BOOLEAN DEFAULT FALSE,
    recording_url VARCHAR(500),
    session_notes TEXT,
    clinical_notes TEXT,
    billing_code VARCHAR(20), -- CPT codes for telehealth
    billing_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'billed', 'paid', 'denied'
    insurance_verified BOOLEAN DEFAULT FALSE,
    prior_authorization_required BOOLEAN DEFAULT FALSE,
    prior_authorization_obtained BOOLEAN DEFAULT FALSE,
    copay_collected BOOLEAN DEFAULT FALSE,
    copay_amount DECIMAL(10,2),
    session_quality_score INTEGER, -- 1-5 rating
    technical_issues BOOLEAN DEFAULT FALSE,
    technical_issues_description TEXT,
    patient_satisfaction_score INTEGER, -- 1-5 rating
    provider_satisfaction_score INTEGER, -- 1-5 rating
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    follow_up_notes TEXT,
    state_licensing_verified BOOLEAN DEFAULT FALSE,
    cross_state_practice BOOLEAN DEFAULT FALSE,
    cross_state_license VARCHAR(100),
    hipaa_compliant BOOLEAN DEFAULT TRUE,
    security_audit_passed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Virtual waiting rooms
CREATE TABLE IF NOT EXISTS virtual_waiting_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES telehealth_sessions(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES users(id),
    waiting_room_url VARCHAR(500) NOT NULL,
    patient_joined_time TIMESTAMP WITH TIME ZONE,
    provider_joined_time TIMESTAMP WITH TIME ZONE,
    session_started_time TIMESTAMP WITH TIME ZONE,
    waiting_duration INTEGER, -- Duration in minutes
    waiting_room_status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'in_session', 'ended', 'cancelled'
    patient_ready BOOLEAN DEFAULT FALSE,
    provider_ready BOOLEAN DEFAULT FALSE,
    technical_check_completed BOOLEAN DEFAULT FALSE,
    audio_test_passed BOOLEAN DEFAULT FALSE,
    video_test_passed BOOLEAN DEFAULT FALSE,
    internet_speed_test DECIMAL(5,2), -- Mbps
    device_compatibility_check BOOLEAN DEFAULT FALSE,
    browser_compatibility_check BOOLEAN DEFAULT FALSE,
    security_check_passed BOOLEAN DEFAULT TRUE,
    hipaa_compliance_verified BOOLEAN DEFAULT TRUE,
    consent_forms_completed BOOLEAN DEFAULT FALSE,
    emergency_contact_verified BOOLEAN DEFAULT FALSE,
    emergency_protocols_reviewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Telehealth billing codes
CREATE TABLE IF NOT EXISTS telehealth_billing_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cpt_code VARCHAR(20) NOT NULL,
    code_description TEXT NOT NULL,
    service_type VARCHAR(100) NOT NULL, -- 'psychiatric_evaluation', 'psychotherapy', 'medication_management', 'crisis_intervention'
    session_duration_minutes INTEGER NOT NULL,
    base_reimbursement_rate DECIMAL(10,2) NOT NULL,
    telehealth_modifier VARCHAR(10) NOT NULL, -- '95', 'GT', 'GQ'
    place_of_service_code VARCHAR(10) NOT NULL, -- '02' for telehealth
    medicare_coverage BOOLEAN DEFAULT TRUE,
    medicaid_coverage BOOLEAN DEFAULT TRUE,
    private_insurance_coverage BOOLEAN DEFAULT TRUE,
    state_specific_requirements TEXT[],
    documentation_requirements TEXT[],
    prior_authorization_required BOOLEAN DEFAULT FALSE,
    frequency_limits TEXT, -- 'once_per_day', 'unlimited', 'monthly_limit'
    effective_date DATE NOT NULL,
    expiration_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- State licensing compliance
CREATE TABLE IF NOT EXISTS state_licensing_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES users(id),
    state_code VARCHAR(10) NOT NULL, -- 'CA', 'NY', 'TX', etc.
    state_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    license_type VARCHAR(50) NOT NULL, -- 'medical', 'psychology', 'social_work', 'counseling'
    license_status VARCHAR(20) NOT NULL, -- 'active', 'inactive', 'suspended', 'expired'
    issue_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    renewal_required BOOLEAN DEFAULT TRUE,
    renewal_frequency VARCHAR(20), -- 'annual', 'biennial', 'triennial'
    continuing_education_required BOOLEAN DEFAULT TRUE,
    ce_hours_required INTEGER,
    ce_hours_completed INTEGER DEFAULT 0,
    background_check_required BOOLEAN DEFAULT TRUE,
    background_check_completed BOOLEAN DEFAULT FALSE,
    background_check_date DATE,
    fingerprinting_required BOOLEAN DEFAULT FALSE,
    fingerprinting_completed BOOLEAN DEFAULT FALSE,
    fingerprinting_date DATE,
    malpractice_insurance_required BOOLEAN DEFAULT TRUE,
    malpractice_insurance_provider VARCHAR(100),
    malpractice_insurance_policy_number VARCHAR(100),
    malpractice_insurance_expiration DATE,
    telehealth_authorized BOOLEAN DEFAULT TRUE,
    cross_state_practice_authorized BOOLEAN DEFAULT FALSE,
    interstate_compact_member BOOLEAN DEFAULT FALSE,
    compact_state VARCHAR(10),
    verification_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'failed', 'expired'
    verification_date DATE,
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cross-state practice rules
CREATE TABLE IF NOT EXISTS cross_state_practice_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_state VARCHAR(10) NOT NULL, -- Provider's home state
    patient_state VARCHAR(10) NOT NULL, -- Patient's state
    practice_authorized BOOLEAN NOT NULL,
    authorization_type VARCHAR(50), -- 'full_license', 'temporary_license', 'interstate_compact', 'emergency_authorization'
    requirements TEXT[],
    restrictions TEXT[],
    documentation_required TEXT[],
    notification_required BOOLEAN DEFAULT FALSE,
    notification_recipients TEXT[],
    effective_date DATE NOT NULL,
    expiration_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Telehealth analytics
CREATE TABLE IF NOT EXISTS telehealth_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis_period_months INTEGER NOT NULL DEFAULT 12,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    completed_sessions INTEGER NOT NULL DEFAULT 0,
    cancelled_sessions INTEGER NOT NULL DEFAULT 0,
    no_show_sessions INTEGER NOT NULL DEFAULT 0,
    average_session_duration INTEGER,
    average_waiting_time INTEGER,
    platform_usage JSONB, -- Usage by platform
    session_types JSONB, -- Distribution by session type
    billing_success_rate DECIMAL(3,2),
    insurance_verification_rate DECIMAL(3,2),
    prior_authorization_success_rate DECIMAL(3,2),
    copay_collection_rate DECIMAL(3,2),
    patient_satisfaction_average DECIMAL(3,2),
    provider_satisfaction_average DECIMAL(3,2),
    technical_issues_rate DECIMAL(3,2),
    quality_scores JSONB,
    state_licensing_compliance_rate DECIMAL(3,2),
    cross_state_practice_sessions INTEGER,
    hipaa_compliance_rate DECIMAL(3,2),
    security_audit_pass_rate DECIMAL(3,2),
    cost_per_session DECIMAL(10,2),
    revenue_per_session DECIMAL(10,2),
    roi_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_telehealth_sessions_patient_id ON telehealth_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_telehealth_sessions_provider_id ON telehealth_sessions(provider_id);
CREATE INDEX IF NOT EXISTS idx_telehealth_sessions_status ON telehealth_sessions(session_status);
CREATE INDEX IF NOT EXISTS idx_telehealth_sessions_scheduled ON telehealth_sessions(scheduled_start_time);
CREATE INDEX IF NOT EXISTS idx_telehealth_sessions_platform ON telehealth_sessions(session_platform);
CREATE INDEX IF NOT EXISTS idx_telehealth_sessions_billing ON telehealth_sessions(billing_status);

CREATE INDEX IF NOT EXISTS idx_virtual_waiting_rooms_session_id ON virtual_waiting_rooms(session_id);
CREATE INDEX IF NOT EXISTS idx_virtual_waiting_rooms_patient_id ON virtual_waiting_rooms(patient_id);
CREATE INDEX IF NOT EXISTS idx_virtual_waiting_rooms_provider_id ON virtual_waiting_rooms(provider_id);
CREATE INDEX IF NOT EXISTS idx_virtual_waiting_rooms_status ON virtual_waiting_rooms(waiting_room_status);

CREATE INDEX IF NOT EXISTS idx_telehealth_billing_codes_cpt ON telehealth_billing_codes(cpt_code);
CREATE INDEX IF NOT EXISTS idx_telehealth_billing_codes_service ON telehealth_billing_codes(service_type);
CREATE INDEX IF NOT EXISTS idx_telehealth_billing_codes_active ON telehealth_billing_codes(is_active);

CREATE INDEX IF NOT EXISTS idx_state_licensing_provider_id ON state_licensing_compliance(provider_id);
CREATE INDEX IF NOT EXISTS idx_state_licensing_state ON state_licensing_compliance(state_code);
CREATE INDEX IF NOT EXISTS idx_state_licensing_status ON state_licensing_compliance(license_status);
CREATE INDEX IF NOT EXISTS idx_state_licensing_expiration ON state_licensing_compliance(expiration_date);

CREATE INDEX IF NOT EXISTS idx_cross_state_practice_provider ON cross_state_practice_rules(provider_state);
CREATE INDEX IF NOT EXISTS idx_cross_state_practice_patient ON cross_state_practice_rules(patient_state);
CREATE INDEX IF NOT EXISTS idx_cross_state_practice_active ON cross_state_practice_rules(is_active);

CREATE INDEX IF NOT EXISTS idx_telehealth_analytics_date ON telehealth_analytics(analysis_date);

-- RLS Policies
ALTER TABLE telehealth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_waiting_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE telehealth_billing_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_licensing_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_state_practice_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE telehealth_analytics ENABLE ROW LEVEL SECURITY;

-- Telehealth sessions policies
CREATE POLICY "Users can view sessions for their patients" ON telehealth_sessions
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR provider_id = auth.uid()
    );

CREATE POLICY "Users can insert sessions for their patients" ON telehealth_sessions
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) AND provider_id = auth.uid()
    );

CREATE POLICY "Users can update sessions for their patients" ON telehealth_sessions
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR provider_id = auth.uid()
    );

CREATE POLICY "Users can delete sessions for their patients" ON telehealth_sessions
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR provider_id = auth.uid()
    );

-- Virtual waiting rooms policies
CREATE POLICY "Users can view waiting rooms for their sessions" ON virtual_waiting_rooms
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR provider_id = auth.uid()
    );

CREATE POLICY "Users can insert waiting rooms for their sessions" ON virtual_waiting_rooms
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) AND provider_id = auth.uid()
    );

CREATE POLICY "Users can update waiting rooms for their sessions" ON virtual_waiting_rooms
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR provider_id = auth.uid()
    );

-- Telehealth billing codes policies (system-wide read access)
CREATE POLICY "Users can view telehealth billing codes" ON telehealth_billing_codes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert telehealth billing codes" ON telehealth_billing_codes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update telehealth billing codes" ON telehealth_billing_codes
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete telehealth billing codes" ON telehealth_billing_codes
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- State licensing compliance policies
CREATE POLICY "Users can view their own licensing" ON state_licensing_compliance
    FOR SELECT USING (provider_id = auth.uid());

CREATE POLICY "Users can insert their own licensing" ON state_licensing_compliance
    FOR INSERT WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Users can update their own licensing" ON state_licensing_compliance
    FOR UPDATE USING (provider_id = auth.uid());

CREATE POLICY "Users can delete their own licensing" ON state_licensing_compliance
    FOR DELETE USING (provider_id = auth.uid());

-- Cross-state practice rules policies (system-wide read access)
CREATE POLICY "Users can view cross-state practice rules" ON cross_state_practice_rules
    FOR SELECT USING (true);

CREATE POLICY "Users can insert cross-state practice rules" ON cross_state_practice_rules
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update cross-state practice rules" ON cross_state_practice_rules
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete cross-state practice rules" ON cross_state_practice_rules
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Telehealth analytics policies (system-wide access)
CREATE POLICY "Users can view telehealth analytics" ON telehealth_analytics
    FOR SELECT USING (true);

CREATE POLICY "Users can insert telehealth analytics" ON telehealth_analytics
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update telehealth analytics" ON telehealth_analytics
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete telehealth analytics" ON telehealth_analytics
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Functions for telehealth

-- Function to start telehealth session
CREATE OR REPLACE FUNCTION start_telehealth_session(
    p_session_id UUID,
    p_provider_id UUID
)
RETURNS TABLE (
    session_id UUID,
    waiting_room_url VARCHAR(500),
    meeting_id VARCHAR(100),
    meeting_password VARCHAR(100),
    session_status VARCHAR(20)
) AS $$
DECLARE
    v_session_id UUID;
    v_waiting_room_url VARCHAR(500);
    v_meeting_id VARCHAR(100);
    v_meeting_password VARCHAR(100);
    v_session_status VARCHAR(20);
BEGIN
    -- Get session details
    SELECT 
        ts.id,
        ts.session_url,
        ts.meeting_id,
        ts.meeting_password,
        ts.session_status
    INTO 
        v_session_id,
        v_waiting_room_url,
        v_meeting_id,
        v_meeting_password,
        v_session_status
    FROM telehealth_sessions ts
    WHERE ts.id = p_session_id
    AND ts.provider_id = p_provider_id;
    
    -- Update session status to in_progress
    UPDATE telehealth_sessions
    SET 
        session_status = 'in_progress',
        actual_start_time = NOW(),
        updated_at = NOW()
    WHERE id = p_session_id;
    
    -- Create or update waiting room
    INSERT INTO virtual_waiting_rooms (
        session_id,
        patient_id,
        provider_id,
        waiting_room_url,
        provider_joined_time,
        waiting_room_status
    )
    SELECT 
        p_session_id,
        patient_id,
        provider_id,
        v_waiting_room_url,
        NOW(),
        'active'
    FROM telehealth_sessions
    WHERE id = p_session_id
    ON CONFLICT (session_id) 
    DO UPDATE SET
        provider_joined_time = NOW(),
        waiting_room_status = 'active',
        updated_at = NOW();
    
    RETURN QUERY
    SELECT 
        v_session_id,
        v_waiting_room_url,
        v_meeting_id,
        v_meeting_password,
        'in_progress';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to end telehealth session
CREATE OR REPLACE FUNCTION end_telehealth_session(
    p_session_id UUID,
    p_provider_id UUID,
    p_session_notes TEXT DEFAULT NULL,
    p_clinical_notes TEXT DEFAULT NULL,
    p_quality_score INTEGER DEFAULT NULL,
    p_technical_issues BOOLEAN DEFAULT FALSE,
    p_technical_issues_description TEXT DEFAULT NULL
)
RETURNS TABLE (
    session_id UUID,
    session_duration INTEGER,
    session_status VARCHAR(20)
) AS $$
DECLARE
    v_session_id UUID;
    v_session_duration INTEGER;
    v_session_status VARCHAR(20) := 'completed';
BEGIN
    -- Calculate session duration
    SELECT 
        EXTRACT(EPOCH FROM (NOW() - actual_start_time)) / 60
    INTO v_session_duration
    FROM telehealth_sessions
    WHERE id = p_session_id
    AND provider_id = p_provider_id;
    
    -- Update session
    UPDATE telehealth_sessions
    SET 
        session_status = v_session_status,
        actual_end_time = NOW(),
        session_duration = v_session_duration,
        session_notes = p_session_notes,
        clinical_notes = p_clinical_notes,
        session_quality_score = p_quality_score,
        technical_issues = p_technical_issues,
        technical_issues_description = p_technical_issues_description,
        updated_at = NOW()
    WHERE id = p_session_id
    AND provider_id = p_provider_id
    RETURNING id INTO v_session_id;
    
    -- Update waiting room status
    UPDATE virtual_waiting_rooms
    SET 
        waiting_room_status = 'ended',
        session_started_time = NOW(),
        updated_at = NOW()
    WHERE session_id = p_session_id;
    
    RETURN QUERY
    SELECT 
        v_session_id,
        v_session_duration,
        v_session_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate telehealth analytics
CREATE OR REPLACE FUNCTION generate_telehealth_analytics(
    p_analysis_date DATE DEFAULT CURRENT_DATE,
    p_analysis_period_months INTEGER DEFAULT 12
)
RETURNS JSONB AS $$
DECLARE
    v_start_date DATE;
    v_analytics JSONB;
BEGIN
    v_start_date := p_analysis_date - INTERVAL '1 month' * p_analysis_period_months;
    
    SELECT jsonb_build_object(
        'analysis_date', p_analysis_date,
        'analysis_period_months', p_analysis_period_months,
        'total_sessions', (
            SELECT COUNT(*) FROM telehealth_sessions
            WHERE created_at >= v_start_date
        ),
        'completed_sessions', (
            SELECT COUNT(*) FROM telehealth_sessions
            WHERE created_at >= v_start_date
            AND session_status = 'completed'
        ),
        'cancelled_sessions', (
            SELECT COUNT(*) FROM telehealth_sessions
            WHERE created_at >= v_start_date
            AND session_status = 'cancelled'
        ),
        'no_show_sessions', (
            SELECT COUNT(*) FROM telehealth_sessions
            WHERE created_at >= v_start_date
            AND session_status = 'no_show'
        ),
        'average_session_duration', (
            SELECT AVG(session_duration) FROM telehealth_sessions
            WHERE created_at >= v_start_date
            AND session_duration IS NOT NULL
        ),
        'average_waiting_time', (
            SELECT AVG(waiting_duration) FROM virtual_waiting_rooms
            WHERE created_at >= v_start_date
            AND waiting_duration IS NOT NULL
        ),
        'platform_usage', (
            SELECT jsonb_object_agg(
                session_platform,
                platform_count
            )
            FROM (
                SELECT 
                    session_platform,
                    COUNT(*) as platform_count
                FROM telehealth_sessions
                WHERE created_at >= v_start_date
                GROUP BY session_platform
            ) platforms
        ),
        'session_types', (
            SELECT jsonb_object_agg(
                session_type,
                type_count
            )
            FROM (
                SELECT 
                    session_type,
                    COUNT(*) as type_count
                FROM telehealth_sessions
                WHERE created_at >= v_start_date
                GROUP BY session_type
            ) types
        ),
        'billing_success_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN billing_status = 'paid' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM telehealth_sessions
            WHERE created_at >= v_start_date
        ),
        'insurance_verification_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN insurance_verified = TRUE THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM telehealth_sessions
            WHERE created_at >= v_start_date
        ),
        'patient_satisfaction_average', (
            SELECT AVG(patient_satisfaction_score) FROM telehealth_sessions
            WHERE created_at >= v_start_date
            AND patient_satisfaction_score IS NOT NULL
        ),
        'provider_satisfaction_average', (
            SELECT AVG(provider_satisfaction_score) FROM telehealth_sessions
            WHERE created_at >= v_start_date
            AND provider_satisfaction_score IS NOT NULL
        ),
        'technical_issues_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN technical_issues = TRUE THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM telehealth_sessions
            WHERE created_at >= v_start_date
        ),
        'hipaa_compliance_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN hipaa_compliant = TRUE THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM telehealth_sessions
            WHERE created_at >= v_start_date
        ),
        'state_licensing_compliance_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN state_licensing_verified = TRUE THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM telehealth_sessions
            WHERE created_at >= v_start_date
        ),
        'cross_state_practice_sessions', (
            SELECT COUNT(*) FROM telehealth_sessions
            WHERE created_at >= v_start_date
            AND cross_state_practice = TRUE
        )
    ) INTO v_analytics;
    
    RETURN v_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update telehealth analytics
CREATE OR REPLACE FUNCTION update_telehealth_analytics(
    p_analysis_date DATE DEFAULT CURRENT_DATE,
    p_analysis_period_months INTEGER DEFAULT 12
)
RETURNS VOID AS $$
DECLARE
    v_analytics JSONB;
BEGIN
    SELECT generate_telehealth_analytics(p_analysis_date, p_analysis_period_months) INTO v_analytics;
    
    INSERT INTO telehealth_analytics (
        analysis_date,
        analysis_period_months,
        total_sessions,
        completed_sessions,
        cancelled_sessions,
        no_show_sessions,
        average_session_duration,
        average_waiting_time,
        platform_usage,
        session_types,
        billing_success_rate,
        insurance_verification_rate,
        patient_satisfaction_average,
        provider_satisfaction_average,
        technical_issues_rate,
        hipaa_compliance_rate,
        state_licensing_compliance_rate,
        cross_state_practice_sessions
    ) VALUES (
        p_analysis_date,
        p_analysis_period_months,
        (v_analytics->>'total_sessions')::INTEGER,
        (v_analytics->>'completed_sessions')::INTEGER,
        (v_analytics->>'cancelled_sessions')::INTEGER,
        (v_analytics->>'no_show_sessions')::INTEGER,
        (v_analytics->>'average_session_duration')::INTEGER,
        (v_analytics->>'average_waiting_time')::INTEGER,
        v_analytics->'platform_usage',
        v_analytics->'session_types',
        (v_analytics->>'billing_success_rate')::DECIMAL(3,2),
        (v_analytics->>'insurance_verification_rate')::DECIMAL(3,2),
        (v_analytics->>'patient_satisfaction_average')::DECIMAL(3,2),
        (v_analytics->>'provider_satisfaction_average')::DECIMAL(3,2),
        (v_analytics->>'technical_issues_rate')::DECIMAL(3,2),
        (v_analytics->>'hipaa_compliance_rate')::DECIMAL(3,2),
        (v_analytics->>'state_licensing_compliance_rate')::DECIMAL(3,2),
        (v_analytics->>'cross_state_practice_sessions')::INTEGER
    )
    ON CONFLICT (analysis_date) 
    DO UPDATE SET
        analysis_period_months = EXCLUDED.analysis_period_months,
        total_sessions = EXCLUDED.total_sessions,
        completed_sessions = EXCLUDED.completed_sessions,
        cancelled_sessions = EXCLUDED.cancelled_sessions,
        no_show_sessions = EXCLUDED.no_show_sessions,
        average_session_duration = EXCLUDED.average_session_duration,
        average_waiting_time = EXCLUDED.average_waiting_time,
        platform_usage = EXCLUDED.platform_usage,
        session_types = EXCLUDED.session_types,
        billing_success_rate = EXCLUDED.billing_success_rate,
        insurance_verification_rate = EXCLUDED.insurance_verification_rate,
        patient_satisfaction_average = EXCLUDED.patient_satisfaction_average,
        provider_satisfaction_average = EXCLUDED.provider_satisfaction_average,
        technical_issues_rate = EXCLUDED.technical_issues_rate,
        hipaa_compliance_rate = EXCLUDED.hipaa_compliance_rate,
        state_licensing_compliance_rate = EXCLUDED.state_licensing_compliance_rate,
        cross_state_practice_sessions = EXCLUDED.cross_state_practice_sessions,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics when new session is added
CREATE OR REPLACE FUNCTION trigger_update_telehealth_analytics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_telehealth_analytics();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER telehealth_analytics_trigger
    AFTER INSERT OR UPDATE ON telehealth_sessions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_telehealth_analytics();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_telehealth_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER telehealth_sessions_updated_at
    BEFORE UPDATE ON telehealth_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_telehealth_updated_at();

CREATE TRIGGER virtual_waiting_rooms_updated_at
    BEFORE UPDATE ON virtual_waiting_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_telehealth_updated_at();

CREATE TRIGGER telehealth_billing_codes_updated_at
    BEFORE UPDATE ON telehealth_billing_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_telehealth_updated_at();

CREATE TRIGGER state_licensing_compliance_updated_at
    BEFORE UPDATE ON state_licensing_compliance
    FOR EACH ROW
    EXECUTE FUNCTION update_telehealth_updated_at();

CREATE TRIGGER cross_state_practice_rules_updated_at
    BEFORE UPDATE ON cross_state_practice_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_telehealth_updated_at();

CREATE TRIGGER telehealth_analytics_updated_at
    BEFORE UPDATE ON telehealth_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_telehealth_updated_at();
