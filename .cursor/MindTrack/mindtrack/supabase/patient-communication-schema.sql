-- Patient Communication Schema
-- Comprehensive patient communication management for American psychiatrists

-- Patient communication preferences
CREATE TABLE IF NOT EXISTS patient_communication_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en', -- ISO language code
    preferred_communication_method VARCHAR(50) NOT NULL DEFAULT 'email', -- 'email', 'sms', 'phone', 'portal', 'mail'
    preferred_contact_time VARCHAR(50), -- 'morning', 'afternoon', 'evening', 'anytime'
    preferred_contact_days TEXT[], -- ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    emergency_contact_method VARCHAR(50) NOT NULL DEFAULT 'phone',
    emergency_contact_number VARCHAR(20),
    appointment_reminders BOOLEAN DEFAULT TRUE,
    appointment_reminder_method VARCHAR(50) DEFAULT 'email',
    appointment_reminder_timing INTEGER DEFAULT 24, -- Hours before appointment
    medication_reminders BOOLEAN DEFAULT TRUE,
    medication_reminder_method VARCHAR(50) DEFAULT 'sms',
    medication_reminder_timing INTEGER DEFAULT 1, -- Hours before medication time
    lab_result_notifications BOOLEAN DEFAULT TRUE,
    lab_result_method VARCHAR(50) DEFAULT 'email',
    prescription_ready_notifications BOOLEAN DEFAULT TRUE,
    prescription_ready_method VARCHAR(50) DEFAULT 'sms',
    billing_notifications BOOLEAN DEFAULT TRUE,
    billing_notification_method VARCHAR(50) DEFAULT 'email',
    marketing_communications BOOLEAN DEFAULT FALSE,
    marketing_communication_method VARCHAR(50) DEFAULT 'email',
    accessibility_needs TEXT[], -- 'large_text', 'high_contrast', 'screen_reader', 'audio_description'
    communication_barriers TEXT[], -- 'hearing_impairment', 'visual_impairment', 'language_barrier', 'cognitive_impairment'
    special_instructions TEXT,
    opt_out_date DATE,
    opt_out_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communication message templates
CREATE TABLE IF NOT EXISTS communication_message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(255) NOT NULL,
    template_category VARCHAR(100) NOT NULL, -- 'appointment', 'medication', 'lab_results', 'billing', 'general', 'emergency'
    template_subcategory VARCHAR(100), -- 'reminder', 'confirmation', 'cancellation', 'reschedule', 'follow_up'
    template_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'phone', 'portal', 'mail'
    template_language VARCHAR(10) NOT NULL DEFAULT 'en',
    subject_line VARCHAR(255), -- For email templates
    message_content TEXT NOT NULL,
    message_content_html TEXT, -- HTML version for email
    message_content_sms TEXT, -- SMS version (shorter)
    message_content_audio TEXT, -- Audio script for phone calls
    personalization_fields TEXT[], -- Fields that can be personalized
    required_fields TEXT[], -- Fields that must be filled
    optional_fields TEXT[], -- Fields that can be optionally filled
    template_variables JSONB, -- Default values for variables
    template_status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'draft', 'archived'
    approval_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'needs_revision'
    approval_notes TEXT,
    usage_count INTEGER DEFAULT 0,
    last_used_date DATE,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approval_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient communication messages
CREATE TABLE IF NOT EXISTS patient_communication_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    template_id UUID REFERENCES communication_message_templates(id),
    message_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'phone', 'portal', 'mail'
    message_category VARCHAR(100) NOT NULL, -- 'appointment', 'medication', 'lab_results', 'billing', 'general', 'emergency'
    message_subcategory VARCHAR(100), -- 'reminder', 'confirmation', 'cancellation', 'reschedule', 'follow_up'
    subject_line VARCHAR(255),
    message_content TEXT NOT NULL,
    message_content_html TEXT,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    recipient_address TEXT,
    sender_id UUID NOT NULL REFERENCES users(id),
    scheduled_send_time TIMESTAMP WITH TIME ZONE,
    actual_send_time TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked'
    delivery_confirmation TEXT,
    delivery_error_message TEXT,
    read_status VARCHAR(20) DEFAULT 'unread', -- 'unread', 'read', 'archived'
    read_timestamp TIMESTAMP WITH TIME ZONE,
    response_required BOOLEAN DEFAULT FALSE,
    response_received BOOLEAN DEFAULT FALSE,
    response_timestamp TIMESTAMP WITH TIME ZONE,
    response_content TEXT,
    response_method VARCHAR(50), -- 'email', 'sms', 'phone', 'portal'
    priority_level VARCHAR(20) NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    confidentiality_level VARCHAR(20) NOT NULL DEFAULT 'standard', -- 'standard', 'confidential', 'restricted'
    hipaa_compliant BOOLEAN DEFAULT TRUE,
    encryption_used BOOLEAN DEFAULT FALSE,
    encryption_method VARCHAR(50),
    retention_period INTEGER DEFAULT 7, -- Days to retain the message
    auto_delete_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communication notifications
CREATE TABLE IF NOT EXISTS communication_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- 'appointment_reminder', 'medication_reminder', 'lab_result', 'prescription_ready', 'billing', 'general'
    notification_method VARCHAR(50) NOT NULL, -- 'email', 'sms', 'phone', 'portal', 'push'
    notification_title VARCHAR(255) NOT NULL,
    notification_content TEXT NOT NULL,
    notification_data JSONB, -- Additional data for the notification
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_time TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(20) NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'sent', 'delivered', 'failed', 'cancelled'
    delivery_confirmation TEXT,
    delivery_error_message TEXT,
    read_status VARCHAR(20) DEFAULT 'unread', -- 'unread', 'read', 'dismissed'
    read_timestamp TIMESTAMP WITH TIME ZONE,
    action_required BOOLEAN DEFAULT FALSE,
    action_taken BOOLEAN DEFAULT FALSE,
    action_timestamp TIMESTAMP WITH TIME ZONE,
    action_details TEXT,
    priority_level VARCHAR(20) NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communication analytics
CREATE TABLE IF NOT EXISTS communication_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis_period_months INTEGER NOT NULL DEFAULT 12,
    total_messages INTEGER NOT NULL DEFAULT 0,
    total_notifications INTEGER NOT NULL DEFAULT 0,
    email_messages INTEGER NOT NULL DEFAULT 0,
    sms_messages INTEGER NOT NULL DEFAULT 0,
    phone_calls INTEGER NOT NULL DEFAULT 0,
    portal_messages INTEGER NOT NULL DEFAULT 0,
    mail_messages INTEGER NOT NULL DEFAULT 0,
    delivered_messages INTEGER NOT NULL DEFAULT 0,
    failed_messages INTEGER NOT NULL DEFAULT 0,
    read_messages INTEGER NOT NULL DEFAULT 0,
    responded_messages INTEGER NOT NULL DEFAULT 0,
    delivery_rate DECIMAL(3,2),
    read_rate DECIMAL(3,2),
    response_rate DECIMAL(3,2),
    average_response_time INTEGER, -- Average response time in hours
    most_used_templates JSONB, -- Most frequently used templates
    communication_preferences JSONB, -- Patient communication preferences analysis
    delivery_methods_performance JSONB, -- Performance by delivery method
    message_categories_performance JSONB, -- Performance by message category
    language_preferences JSONB, -- Language usage statistics
    accessibility_usage JSONB, -- Accessibility feature usage
    peak_communication_times JSONB, -- When patients are most responsive
    communication_trends JSONB, -- Communication trends over time
    patient_satisfaction_scores JSONB, -- Patient satisfaction with communication
    cost_effectiveness_metrics JSONB, -- Cost per message, ROI, etc.
    compliance_metrics JSONB, -- HIPAA compliance metrics
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patient_communication_preferences_patient_id ON patient_communication_preferences(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_communication_preferences_language ON patient_communication_preferences(preferred_language);
CREATE INDEX IF NOT EXISTS idx_patient_communication_preferences_method ON patient_communication_preferences(preferred_communication_method);

CREATE INDEX IF NOT EXISTS idx_communication_message_templates_category ON communication_message_templates(template_category);
CREATE INDEX IF NOT EXISTS idx_communication_message_templates_type ON communication_message_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_communication_message_templates_language ON communication_message_templates(template_language);
CREATE INDEX IF NOT EXISTS idx_communication_message_templates_status ON communication_message_templates(template_status);
CREATE INDEX IF NOT EXISTS idx_communication_message_templates_approval ON communication_message_templates(approval_status);

CREATE INDEX IF NOT EXISTS idx_patient_communication_messages_patient_id ON patient_communication_messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_communication_messages_template_id ON patient_communication_messages(template_id);
CREATE INDEX IF NOT EXISTS idx_patient_communication_messages_type ON patient_communication_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_patient_communication_messages_category ON patient_communication_messages(message_category);
CREATE INDEX IF NOT EXISTS idx_patient_communication_messages_status ON patient_communication_messages(delivery_status);
CREATE INDEX IF NOT EXISTS idx_patient_communication_messages_scheduled ON patient_communication_messages(scheduled_send_time);
CREATE INDEX IF NOT EXISTS idx_patient_communication_messages_sent ON patient_communication_messages(actual_send_time);

CREATE INDEX IF NOT EXISTS idx_communication_notifications_patient_id ON communication_notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_communication_notifications_type ON communication_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_communication_notifications_method ON communication_notifications(notification_method);
CREATE INDEX IF NOT EXISTS idx_communication_notifications_status ON communication_notifications(delivery_status);
CREATE INDEX IF NOT EXISTS idx_communication_notifications_scheduled ON communication_notifications(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_communication_notifications_sent ON communication_notifications(sent_time);

CREATE INDEX IF NOT EXISTS idx_communication_analytics_date ON communication_analytics(analysis_date);

-- RLS Policies
ALTER TABLE patient_communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_communication_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_analytics ENABLE ROW LEVEL SECURITY;

-- Patient communication preferences policies
CREATE POLICY "Users can view preferences for their patients" ON patient_communication_preferences
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert preferences for their patients" ON patient_communication_preferences
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update preferences for their patients" ON patient_communication_preferences
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete preferences for their patients" ON patient_communication_preferences
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Communication message templates policies (system-wide read access for approved templates)
CREATE POLICY "Users can view approved message templates" ON communication_message_templates
    FOR SELECT USING (approval_status = 'approved' AND template_status = 'active');

CREATE POLICY "Users can insert message templates" ON communication_message_templates
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their message templates" ON communication_message_templates
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their message templates" ON communication_message_templates
    FOR DELETE USING (created_by = auth.uid());

-- Patient communication messages policies
CREATE POLICY "Users can view messages for their patients" ON patient_communication_messages
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages for their patients" ON patient_communication_messages
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update messages for their patients" ON patient_communication_messages
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Communication notifications policies
CREATE POLICY "Users can view notifications for their patients" ON communication_notifications
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert notifications for their patients" ON communication_notifications
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update notifications for their patients" ON communication_notifications
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Communication analytics policies (system-wide access)
CREATE POLICY "Users can view communication analytics" ON communication_analytics
    FOR SELECT USING (true);

CREATE POLICY "Users can insert communication analytics" ON communication_analytics
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update communication analytics" ON communication_analytics
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete communication analytics" ON communication_analytics
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Functions for patient communication

-- Function to send patient communication
CREATE OR REPLACE FUNCTION send_patient_communication(
    p_patient_id UUID,
    p_template_id UUID,
    p_message_type VARCHAR(50),
    p_message_category VARCHAR(100),
    p_message_subcategory VARCHAR(100),
    p_subject_line VARCHAR(255),
    p_message_content TEXT,
    p_sender_id UUID,
    p_scheduled_send_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_priority_level VARCHAR(20) DEFAULT 'normal',
    p_confidentiality_level VARCHAR(20) DEFAULT 'standard'
)
RETURNS TABLE (
    message_id UUID,
    delivery_status VARCHAR(20),
    scheduled_time TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_message_id UUID;
    v_delivery_status VARCHAR(20) := 'pending';
    v_scheduled_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Set scheduled time
    IF p_scheduled_send_time IS NULL THEN
        v_scheduled_time := NOW();
    ELSE
        v_scheduled_time := p_scheduled_send_time;
    END IF;
    
    -- Create communication message
    INSERT INTO patient_communication_messages (
        patient_id,
        template_id,
        message_type,
        message_category,
        message_subcategory,
        subject_line,
        message_content,
        sender_id,
        scheduled_send_time,
        delivery_status,
        priority_level,
        confidentiality_level,
        hipaa_compliant,
        encryption_used
    ) VALUES (
        p_patient_id,
        p_template_id,
        p_message_type,
        p_message_category,
        p_message_subcategory,
        p_subject_line,
        p_message_content,
        p_sender_id,
        v_scheduled_time,
        v_delivery_status,
        p_priority_level,
        p_confidentiality_level,
        TRUE, -- HIPAA compliant by default
        CASE WHEN p_confidentiality_level = 'restricted' THEN TRUE ELSE FALSE END
    ) RETURNING id INTO v_message_id;
    
    -- Update template usage count
    IF p_template_id IS NOT NULL THEN
        UPDATE communication_message_templates
        SET usage_count = usage_count + 1,
            last_used_date = CURRENT_DATE
        WHERE id = p_template_id;
    END IF;
    
    RETURN QUERY
    SELECT 
        v_message_id,
        v_delivery_status,
        v_scheduled_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate communication analytics
CREATE OR REPLACE FUNCTION generate_communication_analytics(
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
        'total_messages', (
            SELECT COUNT(*) FROM patient_communication_messages
            WHERE created_at >= v_start_date
        ),
        'total_notifications', (
            SELECT COUNT(*) FROM communication_notifications
            WHERE created_at >= v_start_date
        ),
        'email_messages', (
            SELECT COUNT(*) FROM patient_communication_messages
            WHERE created_at >= v_start_date
            AND message_type = 'email'
        ),
        'sms_messages', (
            SELECT COUNT(*) FROM patient_communication_messages
            WHERE created_at >= v_start_date
            AND message_type = 'sms'
        ),
        'phone_calls', (
            SELECT COUNT(*) FROM patient_communication_messages
            WHERE created_at >= v_start_date
            AND message_type = 'phone'
        ),
        'portal_messages', (
            SELECT COUNT(*) FROM patient_communication_messages
            WHERE created_at >= v_start_date
            AND message_type = 'portal'
        ),
        'mail_messages', (
            SELECT COUNT(*) FROM patient_communication_messages
            WHERE created_at >= v_start_date
            AND message_type = 'mail'
        ),
        'delivered_messages', (
            SELECT COUNT(*) FROM patient_communication_messages
            WHERE created_at >= v_start_date
            AND delivery_status = 'delivered'
        ),
        'failed_messages', (
            SELECT COUNT(*) FROM patient_communication_messages
            WHERE created_at >= v_start_date
            AND delivery_status = 'failed'
        ),
        'read_messages', (
            SELECT COUNT(*) FROM patient_communication_messages
            WHERE created_at >= v_start_date
            AND read_status = 'read'
        ),
        'responded_messages', (
            SELECT COUNT(*) FROM patient_communication_messages
            WHERE created_at >= v_start_date
            AND response_received = TRUE
        ),
        'delivery_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN delivery_status = 'delivered' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM patient_communication_messages
            WHERE created_at >= v_start_date
        ),
        'read_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN read_status = 'read' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM patient_communication_messages
            WHERE created_at >= v_start_date
        ),
        'response_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN response_received = TRUE THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM patient_communication_messages
            WHERE created_at >= v_start_date
        ),
        'average_response_time', (
            SELECT AVG(
                EXTRACT(EPOCH FROM (response_timestamp - actual_send_time)) / 3600
            )::INTEGER
            FROM patient_communication_messages
            WHERE created_at >= v_start_date
            AND response_received = TRUE
            AND response_timestamp IS NOT NULL
            AND actual_send_time IS NOT NULL
        ),
        'most_used_templates', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'template_id', template_id,
                    'template_name', template_name,
                    'usage_count', usage_count,
                    'delivery_rate', delivery_rate
                )
            )
            FROM (
                SELECT 
                    pcm.template_id,
                    cmt.template_name,
                    COUNT(*) as usage_count,
                    COUNT(CASE WHEN pcm.delivery_status = 'delivered' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL as delivery_rate
                FROM patient_communication_messages pcm
                JOIN communication_message_templates cmt ON pcm.template_id = cmt.id
                WHERE pcm.created_at >= v_start_date
                GROUP BY pcm.template_id, cmt.template_name
                ORDER BY usage_count DESC
                LIMIT 10
            ) templates
        ),
        'communication_preferences', (
            SELECT jsonb_object_agg(
                preferred_communication_method,
                method_count
            )
            FROM (
                SELECT 
                    preferred_communication_method,
                    COUNT(*) as method_count
                FROM patient_communication_preferences
                GROUP BY preferred_communication_method
            ) preferences
        ),
        'delivery_methods_performance', (
            SELECT jsonb_object_agg(
                message_type,
                performance_data
            )
            FROM (
                SELECT 
                    message_type,
                    jsonb_build_object(
                        'total_messages', COUNT(*),
                        'delivery_rate', COUNT(CASE WHEN delivery_status = 'delivered' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL,
                        'read_rate', COUNT(CASE WHEN read_status = 'read' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL,
                        'response_rate', COUNT(CASE WHEN response_received = TRUE THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ) as performance_data
                FROM patient_communication_messages
                WHERE created_at >= v_start_date
                GROUP BY message_type
            ) methods
        ),
        'message_categories_performance', (
            SELECT jsonb_object_agg(
                message_category,
                category_performance
            )
            FROM (
                SELECT 
                    message_category,
                    jsonb_build_object(
                        'total_messages', COUNT(*),
                        'delivery_rate', COUNT(CASE WHEN delivery_status = 'delivered' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL,
                        'read_rate', COUNT(CASE WHEN read_status = 'read' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL,
                        'response_rate', COUNT(CASE WHEN response_received = TRUE THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ) as category_performance
                FROM patient_communication_messages
                WHERE created_at >= v_start_date
                GROUP BY message_category
            ) categories
        ),
        'language_preferences', (
            SELECT jsonb_object_agg(
                preferred_language,
                language_count
            )
            FROM (
                SELECT 
                    preferred_language,
                    COUNT(*) as language_count
                FROM patient_communication_preferences
                GROUP BY preferred_language
            ) languages
        ),
        'communication_trends', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'month', month,
                    'total_messages', total_messages,
                    'delivery_rate', delivery_rate,
                    'read_rate', read_rate
                )
            )
            FROM (
                SELECT 
                    DATE_TRUNC('month', created_at) as month,
                    COUNT(*) as total_messages,
                    COUNT(CASE WHEN delivery_status = 'delivered' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL as delivery_rate,
                    COUNT(CASE WHEN read_status = 'read' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL as read_rate
                FROM patient_communication_messages
                WHERE created_at >= v_start_date
                GROUP BY month
                ORDER BY month
            ) trends
        )
    ) INTO v_analytics;
    
    RETURN v_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update communication analytics
CREATE OR REPLACE FUNCTION update_communication_analytics(
    p_analysis_date DATE DEFAULT CURRENT_DATE,
    p_analysis_period_months INTEGER DEFAULT 12
)
RETURNS VOID AS $$
DECLARE
    v_analytics JSONB;
BEGIN
    SELECT generate_communication_analytics(p_analysis_date, p_analysis_period_months) INTO v_analytics;
    
    INSERT INTO communication_analytics (
        analysis_date,
        analysis_period_months,
        total_messages,
        total_notifications,
        email_messages,
        sms_messages,
        phone_calls,
        portal_messages,
        mail_messages,
        delivered_messages,
        failed_messages,
        read_messages,
        responded_messages,
        delivery_rate,
        read_rate,
        response_rate,
        average_response_time,
        most_used_templates,
        communication_preferences,
        delivery_methods_performance,
        message_categories_performance,
        language_preferences,
        communication_trends
    ) VALUES (
        p_analysis_date,
        p_analysis_period_months,
        (v_analytics->>'total_messages')::INTEGER,
        (v_analytics->>'total_notifications')::INTEGER,
        (v_analytics->>'email_messages')::INTEGER,
        (v_analytics->>'sms_messages')::INTEGER,
        (v_analytics->>'phone_calls')::INTEGER,
        (v_analytics->>'portal_messages')::INTEGER,
        (v_analytics->>'mail_messages')::INTEGER,
        (v_analytics->>'delivered_messages')::INTEGER,
        (v_analytics->>'failed_messages')::INTEGER,
        (v_analytics->>'read_messages')::INTEGER,
        (v_analytics->>'responded_messages')::INTEGER,
        (v_analytics->>'delivery_rate')::DECIMAL(3,2),
        (v_analytics->>'read_rate')::DECIMAL(3,2),
        (v_analytics->>'response_rate')::DECIMAL(3,2),
        (v_analytics->>'average_response_time')::INTEGER,
        v_analytics->'most_used_templates',
        v_analytics->'communication_preferences',
        v_analytics->'delivery_methods_performance',
        v_analytics->'message_categories_performance',
        v_analytics->'language_preferences',
        v_analytics->'communication_trends'
    )
    ON CONFLICT (analysis_date) 
    DO UPDATE SET
        analysis_period_months = EXCLUDED.analysis_period_months,
        total_messages = EXCLUDED.total_messages,
        total_notifications = EXCLUDED.total_notifications,
        email_messages = EXCLUDED.email_messages,
        sms_messages = EXCLUDED.sms_messages,
        phone_calls = EXCLUDED.phone_calls,
        portal_messages = EXCLUDED.portal_messages,
        mail_messages = EXCLUDED.mail_messages,
        delivered_messages = EXCLUDED.delivered_messages,
        failed_messages = EXCLUDED.failed_messages,
        read_messages = EXCLUDED.read_messages,
        responded_messages = EXCLUDED.responded_messages,
        delivery_rate = EXCLUDED.delivery_rate,
        read_rate = EXCLUDED.read_rate,
        response_rate = EXCLUDED.response_rate,
        average_response_time = EXCLUDED.average_response_time,
        most_used_templates = EXCLUDED.most_used_templates,
        communication_preferences = EXCLUDED.communication_preferences,
        delivery_methods_performance = EXCLUDED.delivery_methods_performance,
        message_categories_performance = EXCLUDED.message_categories_performance,
        language_preferences = EXCLUDED.language_preferences,
        communication_trends = EXCLUDED.communication_trends,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics when new message is sent
CREATE OR REPLACE FUNCTION trigger_update_communication_analytics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_communication_analytics();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER communication_analytics_trigger
    AFTER INSERT OR UPDATE ON patient_communication_messages
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_communication_analytics();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_communication_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patient_communication_preferences_updated_at
    BEFORE UPDATE ON patient_communication_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_communication_updated_at();

CREATE TRIGGER communication_message_templates_updated_at
    BEFORE UPDATE ON communication_message_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_communication_updated_at();

CREATE TRIGGER patient_communication_messages_updated_at
    BEFORE UPDATE ON patient_communication_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_communication_updated_at();

CREATE TRIGGER communication_notifications_updated_at
    BEFORE UPDATE ON communication_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_communication_updated_at();

CREATE TRIGGER communication_analytics_updated_at
    BEFORE UPDATE ON communication_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_communication_updated_at();



