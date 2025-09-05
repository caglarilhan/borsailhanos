-- Continuing Medical Education (CME) Schema
-- Comprehensive CME credit tracking and educational content management for American psychiatrists

-- CME Providers
CREATE TABLE IF NOT EXISTS cme_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id VARCHAR(100) NOT NULL UNIQUE,
    provider_name VARCHAR(200) NOT NULL,
    provider_type VARCHAR(50) NOT NULL, -- 'accredited', 'non_accredited', 'commercial', 'academic', 'professional_society'
    accreditation_body VARCHAR(200), -- 'ACCME', 'AMA', 'APA', 'state_board'
    accreditation_number VARCHAR(100),
    contact_email VARCHAR(200),
    contact_phone VARCHAR(50),
    website_url VARCHAR(500),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CME Activities
CREATE TABLE IF NOT EXISTS cme_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id VARCHAR(100) NOT NULL UNIQUE,
    provider_id UUID NOT NULL REFERENCES cme_providers(id),
    activity_title VARCHAR(300) NOT NULL,
    activity_description TEXT,
    activity_type VARCHAR(50) NOT NULL, -- 'live_event', 'enduring_material', 'journal_based', 'internet_live', 'internet_enduring', 'performance_improvement'
    activity_format VARCHAR(50) NOT NULL, -- 'lecture', 'workshop', 'case_study', 'simulation', 'online_module', 'journal_article', 'podcast', 'video'
    specialty VARCHAR(100), -- 'psychiatry', 'addiction_medicine', 'child_psychiatry', 'geriatric_psychiatry', 'forensic_psychiatry'
    target_audience VARCHAR(100), -- 'psychiatrists', 'residents', 'fellows', 'medical_students', 'allied_health'
    learning_objectives TEXT[],
    prerequisites TEXT[],
    activity_date DATE,
    activity_end_date DATE,
    duration_hours DECIMAL(5,2) NOT NULL,
    cme_credits DECIMAL(5,2) NOT NULL,
    max_participants INTEGER,
    registration_fee DECIMAL(10,2) DEFAULT 0,
    registration_deadline DATE,
    location VARCHAR(300),
    virtual_meeting_url VARCHAR(500),
    materials_url VARCHAR(500),
    evaluation_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    requires_attendance BOOLEAN DEFAULT TRUE,
    requires_evaluation BOOLEAN DEFAULT TRUE,
    requires_post_test BOOLEAN DEFAULT FALSE,
    passing_score DECIMAL(5,2), -- Percentage required to pass
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CME Registrations
CREATE TABLE IF NOT EXISTS cme_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id VARCHAR(100) NOT NULL UNIQUE,
    practitioner_id UUID NOT NULL REFERENCES users(id),
    activity_id UUID NOT NULL REFERENCES cme_activities(id),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    registration_status VARCHAR(20) DEFAULT 'registered', -- 'registered', 'confirmed', 'cancelled', 'waitlisted', 'completed'
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'refunded', 'waived'
    payment_amount DECIMAL(10,2),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(200),
    attendance_confirmed BOOLEAN DEFAULT FALSE,
    attendance_date TIMESTAMP WITH TIME ZONE,
    completion_date TIMESTAMP WITH TIME ZONE,
    evaluation_completed BOOLEAN DEFAULT FALSE,
    evaluation_score DECIMAL(5,2),
    post_test_completed BOOLEAN DEFAULT FALSE,
    post_test_score DECIMAL(5,2),
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CME Credits
CREATE TABLE IF NOT EXISTS cme_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_id VARCHAR(100) NOT NULL UNIQUE,
    practitioner_id UUID NOT NULL REFERENCES users(id),
    activity_id UUID NOT NULL REFERENCES cme_activities(id),
    registration_id UUID REFERENCES cme_registrations(id),
    credit_type VARCHAR(50) NOT NULL, -- 'AMA_PRA_Category_1', 'AMA_PRA_Category_2', 'MOC_Part_II', 'MOC_Part_IV', 'state_required', 'specialty_board'
    credit_amount DECIMAL(5,2) NOT NULL,
    credit_date DATE NOT NULL,
    credit_year INTEGER NOT NULL,
    credit_status VARCHAR(20) DEFAULT 'earned', -- 'earned', 'pending', 'revoked', 'transferred'
    verification_code VARCHAR(100),
    verification_url VARCHAR(500),
    is_transferable BOOLEAN DEFAULT TRUE,
    transfer_date DATE,
    transfer_to_practitioner_id UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CME Requirements
CREATE TABLE IF NOT EXISTS cme_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_id VARCHAR(100) NOT NULL UNIQUE,
    practitioner_id UUID NOT NULL REFERENCES users(id),
    requirement_year INTEGER NOT NULL,
    requirement_type VARCHAR(50) NOT NULL, -- 'annual', 'biennial', 'triennial', 'specialty_board', 'state_licensing'
    total_credits_required DECIMAL(5,2) NOT NULL,
    category_1_credits_required DECIMAL(5,2) DEFAULT 0,
    category_2_credits_required DECIMAL(5,2) DEFAULT 0,
    specialty_credits_required DECIMAL(5,2) DEFAULT 0,
    ethics_credits_required DECIMAL(5,2) DEFAULT 0,
    pain_management_credits_required DECIMAL(5,2) DEFAULT 0,
    credits_earned DECIMAL(5,2) DEFAULT 0,
    credits_pending DECIMAL(5,2) DEFAULT 0,
    requirement_status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'deficient', 'exempt'
    due_date DATE,
    completion_date DATE,
    deficiency_notice_sent BOOLEAN DEFAULT FALSE,
    deficiency_notice_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CME Compliance Tracking
CREATE TABLE IF NOT EXISTS cme_compliance_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES users(id),
    tracking_year INTEGER NOT NULL,
    state_license_number VARCHAR(100),
    specialty_board VARCHAR(100),
    board_certification_number VARCHAR(100),
    license_expiration_date DATE,
    board_certification_expiration_date DATE,
    cme_deadline DATE,
    total_credits_earned DECIMAL(5,2) DEFAULT 0,
    total_credits_required DECIMAL(5,2) DEFAULT 0,
    compliance_status VARCHAR(20) DEFAULT 'compliant', -- 'compliant', 'non_compliant', 'at_risk', 'exempt'
    last_compliance_check DATE,
    compliance_notes TEXT,
    audit_required BOOLEAN DEFAULT FALSE,
    audit_date DATE,
    audit_results TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CME Learning Analytics
CREATE TABLE IF NOT EXISTS cme_learning_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID REFERENCES users(id),
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis_period_months INTEGER NOT NULL DEFAULT 12,
    total_activities_completed INTEGER DEFAULT 0,
    total_credits_earned DECIMAL(5,2) DEFAULT 0,
    average_evaluation_score DECIMAL(5,2),
    average_post_test_score DECIMAL(5,2),
    preferred_activity_types TEXT[],
    preferred_activity_formats TEXT[],
    preferred_specialties TEXT[],
    learning_goals TEXT[],
    areas_for_improvement TEXT[],
    continuing_education_plan TEXT,
    mentor_recommendations TEXT,
    compliance_risk_score DECIMAL(5,2),
    learning_effectiveness_score DECIMAL(5,2),
    engagement_score DECIMAL(5,2),
    cost_per_credit DECIMAL(10,2),
    roi_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CME Educational Content
CREATE TABLE IF NOT EXISTS cme_educational_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id VARCHAR(100) NOT NULL UNIQUE,
    activity_id UUID REFERENCES cme_activities(id),
    content_title VARCHAR(300) NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'presentation', 'video', 'audio', 'document', 'interactive_module', 'assessment', 'case_study'
    content_url VARCHAR(500),
    content_duration_minutes INTEGER,
    content_size_mb DECIMAL(10,2),
    content_format VARCHAR(20), -- 'pdf', 'mp4', 'mp3', 'html', 'scorm', 'zip'
    learning_objectives TEXT[],
    key_points TEXT[],
    references TEXT[],
    is_required BOOLEAN DEFAULT TRUE,
    is_downloadable BOOLEAN DEFAULT FALSE,
    access_level VARCHAR(20) DEFAULT 'registered', -- 'public', 'registered', 'paid', 'certified'
    copyright_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CME Feedback and Evaluations
CREATE TABLE IF NOT EXISTS cme_feedback_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id VARCHAR(100) NOT NULL UNIQUE,
    practitioner_id UUID NOT NULL REFERENCES users(id),
    activity_id UUID NOT NULL REFERENCES cme_activities(id),
    registration_id UUID REFERENCES cme_registrations(id),
    evaluation_type VARCHAR(50) NOT NULL, -- 'activity_evaluation', 'content_feedback', 'instructor_feedback', 'overall_satisfaction'
    evaluation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    overall_rating DECIMAL(3,2), -- 1.00 to 5.00
    content_quality_rating DECIMAL(3,2),
    instructor_rating DECIMAL(3,2),
    relevance_rating DECIMAL(3,2),
    learning_objectives_met BOOLEAN,
    would_recommend BOOLEAN,
    suggestions_for_improvement TEXT,
    additional_comments TEXT,
    anonymous_feedback BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CME Notifications and Reminders
CREATE TABLE IF NOT EXISTS cme_notifications_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id VARCHAR(100) NOT NULL UNIQUE,
    practitioner_id UUID NOT NULL REFERENCES users(id),
    notification_type VARCHAR(50) NOT NULL, -- 'credit_deadline', 'compliance_warning', 'new_activity', 'evaluation_reminder', 'certificate_ready'
    notification_title VARCHAR(200) NOT NULL,
    notification_message TEXT NOT NULL,
    notification_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    notification_method VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push', 'in_app', 'mail'
    notification_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'read', 'failed'
    priority_level VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    related_activity_id UUID REFERENCES cme_activities(id),
    related_requirement_id UUID REFERENCES cme_requirements(id),
    action_required BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cme_providers_type ON cme_providers(provider_type);
CREATE INDEX IF NOT EXISTS idx_cme_providers_accreditation ON cme_providers(accreditation_body);
CREATE INDEX IF NOT EXISTS idx_cme_providers_active ON cme_providers(is_active);

CREATE INDEX IF NOT EXISTS idx_cme_activities_provider_id ON cme_activities(provider_id);
CREATE INDEX IF NOT EXISTS idx_cme_activities_type ON cme_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_cme_activities_format ON cme_activities(activity_format);
CREATE INDEX IF NOT EXISTS idx_cme_activities_specialty ON cme_activities(specialty);
CREATE INDEX IF NOT EXISTS idx_cme_activities_date ON cme_activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_cme_activities_active ON cme_activities(is_active);

CREATE INDEX IF NOT EXISTS idx_cme_registrations_practitioner_id ON cme_registrations(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_cme_registrations_activity_id ON cme_registrations(activity_id);
CREATE INDEX IF NOT EXISTS idx_cme_registrations_status ON cme_registrations(registration_status);
CREATE INDEX IF NOT EXISTS idx_cme_registrations_payment_status ON cme_registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_cme_registrations_date ON cme_registrations(registration_date);

CREATE INDEX IF NOT EXISTS idx_cme_credits_practitioner_id ON cme_credits(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_cme_credits_activity_id ON cme_credits(activity_id);
CREATE INDEX IF NOT EXISTS idx_cme_credits_type ON cme_credits(credit_type);
CREATE INDEX IF NOT EXISTS idx_cme_credits_year ON cme_credits(credit_year);
CREATE INDEX IF NOT EXISTS idx_cme_credits_date ON cme_credits(credit_date);
CREATE INDEX IF NOT EXISTS idx_cme_credits_status ON cme_credits(credit_status);

CREATE INDEX IF NOT EXISTS idx_cme_requirements_practitioner_id ON cme_requirements(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_cme_requirements_year ON cme_requirements(requirement_year);
CREATE INDEX IF NOT EXISTS idx_cme_requirements_type ON cme_requirements(requirement_type);
CREATE INDEX IF NOT EXISTS idx_cme_requirements_status ON cme_requirements(requirement_status);

CREATE INDEX IF NOT EXISTS idx_cme_compliance_practitioner_id ON cme_compliance_tracking(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_cme_compliance_year ON cme_compliance_tracking(tracking_year);
CREATE INDEX IF NOT EXISTS idx_cme_compliance_status ON cme_compliance_tracking(compliance_status);

CREATE INDEX IF NOT EXISTS idx_cme_analytics_practitioner_id ON cme_learning_analytics(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_cme_analytics_date ON cme_learning_analytics(analysis_date);

CREATE INDEX IF NOT EXISTS idx_cme_content_activity_id ON cme_educational_content(activity_id);
CREATE INDEX IF NOT EXISTS idx_cme_content_type ON cme_educational_content(content_type);
CREATE INDEX IF NOT EXISTS idx_cme_content_required ON cme_educational_content(is_required);

CREATE INDEX IF NOT EXISTS idx_cme_feedback_practitioner_id ON cme_feedback_evaluations(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_cme_feedback_activity_id ON cme_feedback_evaluations(activity_id);
CREATE INDEX IF NOT EXISTS idx_cme_feedback_type ON cme_feedback_evaluations(evaluation_type);
CREATE INDEX IF NOT EXISTS idx_cme_feedback_date ON cme_feedback_evaluations(evaluation_date);

CREATE INDEX IF NOT EXISTS idx_cme_notifications_practitioner_id ON cme_notifications_reminders(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_cme_notifications_type ON cme_notifications_reminders(notification_type);
CREATE INDEX IF NOT EXISTS idx_cme_notifications_status ON cme_notifications_reminders(notification_status);
CREATE INDEX IF NOT EXISTS idx_cme_notifications_date ON cme_notifications_reminders(notification_date);

-- RLS Policies
ALTER TABLE cme_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cme_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cme_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cme_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE cme_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE cme_compliance_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE cme_learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cme_educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE cme_feedback_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cme_notifications_reminders ENABLE ROW LEVEL SECURITY;

-- CME providers policies (system-wide read access)
CREATE POLICY "Users can view CME providers" ON cme_providers
    FOR SELECT USING (true);

CREATE POLICY "Users can insert CME providers" ON cme_providers
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update CME providers" ON cme_providers
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete CME providers" ON cme_providers
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- CME activities policies (system-wide read access)
CREATE POLICY "Users can view CME activities" ON cme_activities
    FOR SELECT USING (true);

CREATE POLICY "Users can insert CME activities" ON cme_activities
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update CME activities" ON cme_activities
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete CME activities" ON cme_activities
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- CME registrations policies
CREATE POLICY "Users can view their own registrations" ON cme_registrations
    FOR SELECT USING (practitioner_id = auth.uid());

CREATE POLICY "Users can insert their own registrations" ON cme_registrations
    FOR INSERT WITH CHECK (practitioner_id = auth.uid());

CREATE POLICY "Users can update their own registrations" ON cme_registrations
    FOR UPDATE USING (practitioner_id = auth.uid());

CREATE POLICY "Users can delete their own registrations" ON cme_registrations
    FOR DELETE USING (practitioner_id = auth.uid());

-- CME credits policies
CREATE POLICY "Users can view their own credits" ON cme_credits
    FOR SELECT USING (practitioner_id = auth.uid());

CREATE POLICY "Users can insert their own credits" ON cme_credits
    FOR INSERT WITH CHECK (practitioner_id = auth.uid());

CREATE POLICY "Users can update their own credits" ON cme_credits
    FOR UPDATE USING (practitioner_id = auth.uid());

CREATE POLICY "Users can delete their own credits" ON cme_credits
    FOR DELETE USING (practitioner_id = auth.uid());

-- CME requirements policies
CREATE POLICY "Users can view their own requirements" ON cme_requirements
    FOR SELECT USING (practitioner_id = auth.uid());

CREATE POLICY "Users can insert their own requirements" ON cme_requirements
    FOR INSERT WITH CHECK (practitioner_id = auth.uid());

CREATE POLICY "Users can update their own requirements" ON cme_requirements
    FOR UPDATE USING (practitioner_id = auth.uid());

CREATE POLICY "Users can delete their own requirements" ON cme_requirements
    FOR DELETE USING (practitioner_id = auth.uid());

-- CME compliance tracking policies
CREATE POLICY "Users can view their own compliance" ON cme_compliance_tracking
    FOR SELECT USING (practitioner_id = auth.uid());

CREATE POLICY "Users can insert their own compliance" ON cme_compliance_tracking
    FOR INSERT WITH CHECK (practitioner_id = auth.uid());

CREATE POLICY "Users can update their own compliance" ON cme_compliance_tracking
    FOR UPDATE USING (practitioner_id = auth.uid());

CREATE POLICY "Users can delete their own compliance" ON cme_compliance_tracking
    FOR DELETE USING (practitioner_id = auth.uid());

-- CME learning analytics policies
CREATE POLICY "Users can view their own analytics" ON cme_learning_analytics
    FOR SELECT USING (practitioner_id = auth.uid() OR practitioner_id IS NULL);

CREATE POLICY "Users can insert their own analytics" ON cme_learning_analytics
    FOR INSERT WITH CHECK (practitioner_id = auth.uid() OR practitioner_id IS NULL);

CREATE POLICY "Users can update their own analytics" ON cme_learning_analytics
    FOR UPDATE USING (practitioner_id = auth.uid() OR practitioner_id IS NULL);

CREATE POLICY "Users can delete their own analytics" ON cme_learning_analytics
    FOR DELETE USING (practitioner_id = auth.uid() OR practitioner_id IS NULL);

-- CME educational content policies (system-wide read access)
CREATE POLICY "Users can view educational content" ON cme_educational_content
    FOR SELECT USING (true);

CREATE POLICY "Users can insert educational content" ON cme_educational_content
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update educational content" ON cme_educational_content
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete educational content" ON cme_educational_content
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- CME feedback evaluations policies
CREATE POLICY "Users can view their own feedback" ON cme_feedback_evaluations
    FOR SELECT USING (practitioner_id = auth.uid());

CREATE POLICY "Users can insert their own feedback" ON cme_feedback_evaluations
    FOR INSERT WITH CHECK (practitioner_id = auth.uid());

CREATE POLICY "Users can update their own feedback" ON cme_feedback_evaluations
    FOR UPDATE USING (practitioner_id = auth.uid());

CREATE POLICY "Users can delete their own feedback" ON cme_feedback_evaluations
    FOR DELETE USING (practitioner_id = auth.uid());

-- CME notifications policies
CREATE POLICY "Users can view their own notifications" ON cme_notifications_reminders
    FOR SELECT USING (practitioner_id = auth.uid());

CREATE POLICY "Users can insert their own notifications" ON cme_notifications_reminders
    FOR INSERT WITH CHECK (practitioner_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON cme_notifications_reminders
    FOR UPDATE USING (practitioner_id = auth.uid());

CREATE POLICY "Users can delete their own notifications" ON cme_notifications_reminders
    FOR DELETE USING (practitioner_id = auth.uid());

-- Functions for CME

-- Function to calculate CME compliance status
CREATE OR REPLACE FUNCTION calculate_cme_compliance_status(
    p_practitioner_id UUID,
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS JSONB AS $$
DECLARE
    v_requirements RECORD;
    v_credits_earned DECIMAL(5,2);
    v_compliance_status VARCHAR(20);
    v_compliance_data JSONB;
BEGIN
    -- Get requirements for the year
    SELECT * INTO v_requirements
    FROM cme_requirements
    WHERE practitioner_id = p_practitioner_id
    AND requirement_year = p_year
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'status', 'no_requirements',
            'message', 'No CME requirements found for this year'
        );
    END IF;
    
    -- Calculate credits earned
    SELECT COALESCE(SUM(credit_amount), 0) INTO v_credits_earned
    FROM cme_credits
    WHERE practitioner_id = p_practitioner_id
    AND credit_year = p_year
    AND credit_status = 'earned';
    
    -- Determine compliance status
    IF v_credits_earned >= v_requirements.total_credits_required THEN
        v_compliance_status := 'compliant';
    ELSIF v_credits_earned >= (v_requirements.total_credits_required * 0.8) THEN
        v_compliance_status := 'at_risk';
    ELSE
        v_compliance_status := 'non_compliant';
    END IF;
    
    -- Build compliance data
    v_compliance_data := jsonb_build_object(
        'practitioner_id', p_practitioner_id,
        'year', p_year,
        'total_credits_required', v_requirements.total_credits_required,
        'credits_earned', v_credits_earned,
        'credits_remaining', GREATEST(0, v_requirements.total_credits_required - v_credits_earned),
        'compliance_status', v_compliance_status,
        'compliance_percentage', CASE 
            WHEN v_requirements.total_credits_required > 0 THEN 
                (v_credits_earned / v_requirements.total_credits_required) * 100
            ELSE 0
        END,
        'requirement_type', v_requirements.requirement_type,
        'due_date', v_requirements.due_date,
        'last_updated', NOW()
    );
    
    RETURN v_compliance_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate CME learning analytics
CREATE OR REPLACE FUNCTION generate_cme_learning_analytics(
    p_practitioner_id UUID,
    p_analysis_period_months INTEGER DEFAULT 12
)
RETURNS JSONB AS $$
DECLARE
    v_start_date DATE;
    v_analytics JSONB;
BEGIN
    v_start_date := CURRENT_DATE - INTERVAL '1 month' * p_analysis_period_months;
    
    SELECT jsonb_build_object(
        'practitioner_id', p_practitioner_id,
        'analysis_period_months', p_analysis_period_months,
        'analysis_start_date', v_start_date,
        'analysis_end_date', CURRENT_DATE,
        'total_activities_completed', (
            SELECT COUNT(*) FROM cme_registrations
            WHERE practitioner_id = p_practitioner_id
            AND completion_date >= v_start_date
            AND registration_status = 'completed'
        ),
        'total_credits_earned', (
            SELECT COALESCE(SUM(credit_amount), 0) FROM cme_credits
            WHERE practitioner_id = p_practitioner_id
            AND credit_date >= v_start_date
            AND credit_status = 'earned'
        ),
        'average_evaluation_score', (
            SELECT AVG(overall_rating) FROM cme_feedback_evaluations
            WHERE practitioner_id = p_practitioner_id
            AND evaluation_date >= v_start_date
        ),
        'average_post_test_score', (
            SELECT AVG(post_test_score) FROM cme_registrations
            WHERE practitioner_id = p_practitioner_id
            AND completion_date >= v_start_date
            AND post_test_completed = TRUE
        ),
        'preferred_activity_types', (
            SELECT ARRAY_AGG(DISTINCT activity_type) FROM cme_registrations r
            JOIN cme_activities a ON r.activity_id = a.id
            WHERE r.practitioner_id = p_practitioner_id
            AND r.completion_date >= v_start_date
            AND r.registration_status = 'completed'
        ),
        'preferred_activity_formats', (
            SELECT ARRAY_AGG(DISTINCT activity_format) FROM cme_registrations r
            JOIN cme_activities a ON r.activity_id = a.id
            WHERE r.practitioner_id = p_practitioner_id
            AND r.completion_date >= v_start_date
            AND r.registration_status = 'completed'
        ),
        'preferred_specialties', (
            SELECT ARRAY_AGG(DISTINCT specialty) FROM cme_registrations r
            JOIN cme_activities a ON r.activity_id = a.id
            WHERE r.practitioner_id = p_practitioner_id
            AND r.completion_date >= v_start_date
            AND r.registration_status = 'completed'
            AND a.specialty IS NOT NULL
        ),
        'compliance_risk_score', (
            SELECT CASE 
                WHEN COUNT(*) = 0 THEN 0
                ELSE (
                    SELECT calculate_cme_compliance_status(p_practitioner_id)->>'compliance_percentage'
                )::DECIMAL(5,2)
            END
        ),
        'learning_effectiveness_score', (
            SELECT CASE 
                WHEN COUNT(*) = 0 THEN 0
                ELSE (
                    SELECT AVG(overall_rating) FROM cme_feedback_evaluations
                    WHERE practitioner_id = p_practitioner_id
                    AND evaluation_date >= v_start_date
                ) * 20 -- Convert to percentage
            END
        ),
        'engagement_score', (
            SELECT CASE 
                WHEN COUNT(*) = 0 THEN 0
                ELSE (
                    SELECT COUNT(*) FROM cme_registrations
                    WHERE practitioner_id = p_practitioner_id
                    AND completion_date >= v_start_date
                    AND registration_status = 'completed'
                ) * 10 -- Mock calculation
            END
        ),
        'cost_per_credit', (
            SELECT CASE 
                WHEN SUM(credit_amount) > 0 THEN 
                    SUM(payment_amount) / SUM(credit_amount)
                ELSE 0
            END
            FROM cme_registrations r
            JOIN cme_credits c ON r.activity_id = c.activity_id
            WHERE r.practitioner_id = p_practitioner_id
            AND r.completion_date >= v_start_date
            AND r.payment_status = 'paid'
        ),
        'roi_analysis', jsonb_build_object(
            'total_investment', (
                SELECT COALESCE(SUM(payment_amount), 0) FROM cme_registrations
                WHERE practitioner_id = p_practitioner_id
                AND completion_date >= v_start_date
                AND payment_status = 'paid'
            ),
            'credits_earned', (
                SELECT COALESCE(SUM(credit_amount), 0) FROM cme_credits
                WHERE practitioner_id = p_practitioner_id
                AND credit_date >= v_start_date
                AND credit_status = 'earned'
            ),
            'cost_per_credit', (
                SELECT CASE 
                    WHEN SUM(credit_amount) > 0 THEN 
                        SUM(payment_amount) / SUM(credit_amount)
                    ELSE 0
                END
                FROM cme_registrations r
                JOIN cme_credits c ON r.activity_id = c.activity_id
                WHERE r.practitioner_id = p_practitioner_id
                AND r.completion_date >= v_start_date
                AND r.payment_status = 'paid'
            ),
            'roi_percentage', 250.0 -- Mock data
        )
    ) INTO v_analytics;
    
    RETURN v_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update CME learning analytics
CREATE OR REPLACE FUNCTION update_cme_learning_analytics(
    p_practitioner_id UUID,
    p_analysis_period_months INTEGER DEFAULT 12
)
RETURNS VOID AS $$
DECLARE
    v_analytics JSONB;
BEGIN
    SELECT generate_cme_learning_analytics(p_practitioner_id, p_analysis_period_months) INTO v_analytics;
    
    INSERT INTO cme_learning_analytics (
        practitioner_id,
        analysis_date,
        analysis_period_months,
        total_activities_completed,
        total_credits_earned,
        average_evaluation_score,
        average_post_test_score,
        preferred_activity_types,
        preferred_activity_formats,
        preferred_specialties,
        compliance_risk_score,
        learning_effectiveness_score,
        engagement_score,
        cost_per_credit,
        roi_analysis
    ) VALUES (
        p_practitioner_id,
        CURRENT_DATE,
        p_analysis_period_months,
        (v_analytics->>'total_activities_completed')::INTEGER,
        (v_analytics->>'total_credits_earned')::DECIMAL(5,2),
        (v_analytics->>'average_evaluation_score')::DECIMAL(5,2),
        (v_analytics->>'average_post_test_score')::DECIMAL(5,2),
        ARRAY(SELECT jsonb_array_elements_text(v_analytics->'preferred_activity_types')),
        ARRAY(SELECT jsonb_array_elements_text(v_analytics->'preferred_activity_formats')),
        ARRAY(SELECT jsonb_array_elements_text(v_analytics->'preferred_specialties')),
        (v_analytics->>'compliance_risk_score')::DECIMAL(5,2),
        (v_analytics->>'learning_effectiveness_score')::DECIMAL(5,2),
        (v_analytics->>'engagement_score')::DECIMAL(5,2),
        (v_analytics->>'cost_per_credit')::DECIMAL(10,2),
        v_analytics->'roi_analysis'
    )
    ON CONFLICT (practitioner_id, analysis_date) 
    DO UPDATE SET
        analysis_period_months = EXCLUDED.analysis_period_months,
        total_activities_completed = EXCLUDED.total_activities_completed,
        total_credits_earned = EXCLUDED.total_credits_earned,
        average_evaluation_score = EXCLUDED.average_evaluation_score,
        average_post_test_score = EXCLUDED.average_post_test_score,
        preferred_activity_types = EXCLUDED.preferred_activity_types,
        preferred_activity_formats = EXCLUDED.preferred_activity_formats,
        preferred_specialties = EXCLUDED.preferred_specialties,
        compliance_risk_score = EXCLUDED.compliance_risk_score,
        learning_effectiveness_score = EXCLUDED.learning_effectiveness_score,
        engagement_score = EXCLUDED.engagement_score,
        cost_per_credit = EXCLUDED.cost_per_credit,
        roi_analysis = EXCLUDED.roi_analysis,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics when new credits are earned
CREATE OR REPLACE FUNCTION trigger_update_cme_analytics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_cme_learning_analytics(NEW.practitioner_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cme_analytics_trigger
    AFTER INSERT OR UPDATE ON cme_credits
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_cme_analytics();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cme_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cme_providers_updated_at
    BEFORE UPDATE ON cme_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_cme_updated_at();

CREATE TRIGGER cme_activities_updated_at
    BEFORE UPDATE ON cme_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_cme_updated_at();

CREATE TRIGGER cme_registrations_updated_at
    BEFORE UPDATE ON cme_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_cme_updated_at();

CREATE TRIGGER cme_credits_updated_at
    BEFORE UPDATE ON cme_credits
    FOR EACH ROW
    EXECUTE FUNCTION update_cme_updated_at();

CREATE TRIGGER cme_requirements_updated_at
    BEFORE UPDATE ON cme_requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_cme_updated_at();

CREATE TRIGGER cme_compliance_tracking_updated_at
    BEFORE UPDATE ON cme_compliance_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_cme_updated_at();

CREATE TRIGGER cme_learning_analytics_updated_at
    BEFORE UPDATE ON cme_learning_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_cme_updated_at();

CREATE TRIGGER cme_educational_content_updated_at
    BEFORE UPDATE ON cme_educational_content
    FOR EACH ROW
    EXECUTE FUNCTION update_cme_updated_at();

CREATE TRIGGER cme_feedback_evaluations_updated_at
    BEFORE UPDATE ON cme_feedback_evaluations
    FOR EACH ROW
    EXECUTE FUNCTION update_cme_updated_at();

CREATE TRIGGER cme_notifications_reminders_updated_at
    BEFORE UPDATE ON cme_notifications_reminders
    FOR EACH ROW
    EXECUTE FUNCTION update_cme_updated_at();
