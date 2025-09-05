-- Mobile Health (mHealth) Schema
-- Comprehensive mobile health and wearable device integration for American psychiatrists

-- Mobile Apps
CREATE TABLE IF NOT EXISTS mobile_apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id VARCHAR(100) NOT NULL UNIQUE,
    app_name VARCHAR(200) NOT NULL,
    app_description TEXT,
    app_type VARCHAR(50) NOT NULL, -- 'patient_app', 'provider_app', 'monitoring_app', 'education_app'
    platform VARCHAR(20) NOT NULL, -- 'ios', 'android', 'web', 'cross_platform'
    version VARCHAR(20) NOT NULL,
    app_store_url VARCHAR(500),
    play_store_url VARCHAR(500),
    api_endpoint VARCHAR(500),
    authentication_method VARCHAR(50), -- 'oauth', 'api_key', 'jwt', 'basic_auth'
    features TEXT[], -- Available features
    permissions TEXT[], -- Required permissions
    privacy_policy_url VARCHAR(500),
    terms_of_service_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wearable Devices
CREATE TABLE IF NOT EXISTS wearable_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) NOT NULL UNIQUE,
    device_name VARCHAR(200) NOT NULL,
    device_type VARCHAR(50) NOT NULL, -- 'smartwatch', 'fitness_tracker', 'heart_monitor', 'sleep_tracker', 'mood_tracker'
    manufacturer VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    platform VARCHAR(20) NOT NULL, -- 'ios', 'android', 'web', 'cross_platform'
    supported_metrics TEXT[], -- Heart rate, steps, sleep, etc.
    data_types TEXT[], -- Types of data collected
    connectivity VARCHAR(50), -- 'bluetooth', 'wifi', 'cellular', 'usb'
    battery_life_hours INTEGER,
    water_resistance VARCHAR(50),
    price_range VARCHAR(50), -- 'budget', 'mid_range', 'premium'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Mobile Devices
CREATE TABLE IF NOT EXISTS patient_mobile_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES users(id),
    device_type VARCHAR(50) NOT NULL, -- 'smartphone', 'tablet', 'smartwatch', 'fitness_tracker'
    device_name VARCHAR(200) NOT NULL,
    device_id VARCHAR(100) NOT NULL, -- Unique device identifier
    platform VARCHAR(20) NOT NULL, -- 'ios', 'android', 'web'
    os_version VARCHAR(50),
    app_version VARCHAR(20),
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_frequency VARCHAR(50), -- 'real_time', 'hourly', 'daily', 'weekly'
    is_active BOOLEAN DEFAULT TRUE,
    consent_given BOOLEAN DEFAULT FALSE,
    consent_date DATE,
    privacy_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mobile Health Data
CREATE TABLE IF NOT EXISTS mobile_health_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    device_id UUID REFERENCES patient_mobile_devices(id),
    data_type VARCHAR(50) NOT NULL, -- 'heart_rate', 'steps', 'sleep', 'mood', 'medication_adherence', 'symptoms'
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2),
    metric_unit VARCHAR(20),
    raw_data JSONB, -- Raw sensor data
    processed_data JSONB, -- Processed/analyzed data
    data_quality_score DECIMAL(5,2), -- Data quality assessment
    collection_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    upload_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_source VARCHAR(100), -- Device/app that collected the data
    is_validated BOOLEAN DEFAULT FALSE,
    validation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Remote Patient Monitoring
CREATE TABLE IF NOT EXISTS remote_patient_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitoring_id VARCHAR(100) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES users(id),
    monitoring_type VARCHAR(50) NOT NULL, -- 'continuous', 'scheduled', 'event_triggered', 'on_demand'
    monitoring_frequency VARCHAR(50), -- 'real_time', 'hourly', 'daily', 'weekly'
    monitored_metrics TEXT[] NOT NULL, -- Metrics being monitored
    alert_thresholds JSONB, -- Alert thresholds for each metric
    monitoring_start_date DATE NOT NULL,
    monitoring_end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    patient_consent BOOLEAN DEFAULT FALSE,
    consent_date DATE,
    data_sharing_level VARCHAR(20) DEFAULT 'practitioner', -- 'practitioner', 'team', 'organization'
    monitoring_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mobile Health Alerts
CREATE TABLE IF NOT EXISTS mobile_health_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id VARCHAR(100) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    practitioner_id UUID REFERENCES users(id),
    alert_type VARCHAR(50) NOT NULL, -- 'threshold_exceeded', 'data_anomaly', 'device_offline', 'medication_missed', 'symptom_worsening'
    alert_severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    alert_title VARCHAR(200) NOT NULL,
    alert_description TEXT NOT NULL,
    triggered_metric VARCHAR(100),
    threshold_value DECIMAL(10,2),
    actual_value DECIMAL(10,2),
    alert_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    escalation_level INTEGER DEFAULT 1,
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_method VARCHAR(50), -- 'email', 'sms', 'push', 'in_app'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Engagement Activities
CREATE TABLE IF NOT EXISTS patient_engagement_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id VARCHAR(100) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES users(id),
    activity_type VARCHAR(50) NOT NULL, -- 'medication_reminder', 'symptom_check', 'mood_tracking', 'exercise_log', 'education_assignment'
    activity_name VARCHAR(200) NOT NULL,
    activity_description TEXT,
    scheduled_time TIMESTAMP WITH TIME ZONE,
    completed_time TIMESTAMP WITH TIME ZONE,
    completion_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'skipped', 'overdue'
    completion_data JSONB, -- Data collected during activity
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_count INTEGER DEFAULT 0,
    patient_response TEXT,
    engagement_score DECIMAL(5,2), -- Patient engagement score
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mobile Health Analytics
CREATE TABLE IF NOT EXISTS mobile_health_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis_period_months INTEGER NOT NULL DEFAULT 12,
    practitioner_id UUID REFERENCES users(id),
    total_patients_monitored INTEGER NOT NULL DEFAULT 0,
    total_devices_active INTEGER NOT NULL DEFAULT 0,
    total_data_points_collected INTEGER NOT NULL DEFAULT 0,
    average_data_quality_score DECIMAL(5,2),
    patient_engagement_rate DECIMAL(5,2),
    medication_adherence_rate DECIMAL(5,2),
    symptom_tracking_completion_rate DECIMAL(5,2),
    alert_response_time_avg_hours DECIMAL(8,2),
    false_positive_rate DECIMAL(5,2),
    patient_satisfaction_score DECIMAL(5,2),
    cost_per_patient_monitored DECIMAL(10,2),
    roi_percentage DECIMAL(5,2),
    clinical_outcomes JSONB,
    device_usage_statistics JSONB,
    engagement_trends JSONB,
    cost_effectiveness JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mobile Health Integrations
CREATE TABLE IF NOT EXISTS mobile_health_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id VARCHAR(100) NOT NULL UNIQUE,
    integration_name VARCHAR(200) NOT NULL,
    integration_type VARCHAR(50) NOT NULL, -- 'device_api', 'app_api', 'ehr_integration', 'third_party_service'
    provider VARCHAR(200) NOT NULL, -- Company providing the integration
    api_endpoint VARCHAR(500),
    authentication_method VARCHAR(50),
    data_format VARCHAR(50), -- 'json', 'xml', 'hl7', 'fhir'
    supported_data_types TEXT[],
    sync_frequency VARCHAR(50),
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'error', 'maintenance'
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mobile Health Settings
CREATE TABLE IF NOT EXISTS mobile_health_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID REFERENCES users(id),
    patient_id UUID REFERENCES clients(id),
    setting_category VARCHAR(50) NOT NULL, -- 'privacy', 'notifications', 'data_sharing', 'monitoring', 'alerts'
    setting_name VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mobile_apps_type ON mobile_apps(app_type);
CREATE INDEX IF NOT EXISTS idx_mobile_apps_platform ON mobile_apps(platform);
CREATE INDEX IF NOT EXISTS idx_mobile_apps_active ON mobile_apps(is_active);

CREATE INDEX IF NOT EXISTS idx_wearable_devices_type ON wearable_devices(device_type);
CREATE INDEX IF NOT EXISTS idx_wearable_devices_manufacturer ON wearable_devices(manufacturer);
CREATE INDEX IF NOT EXISTS idx_wearable_devices_active ON wearable_devices(is_active);

CREATE INDEX IF NOT EXISTS idx_patient_mobile_devices_patient_id ON patient_mobile_devices(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_mobile_devices_practitioner_id ON patient_mobile_devices(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_patient_mobile_devices_device_type ON patient_mobile_devices(device_type);
CREATE INDEX IF NOT EXISTS idx_patient_mobile_devices_active ON patient_mobile_devices(is_active);

CREATE INDEX IF NOT EXISTS idx_mobile_health_data_patient_id ON mobile_health_data(patient_id);
CREATE INDEX IF NOT EXISTS idx_mobile_health_data_device_id ON mobile_health_data(device_id);
CREATE INDEX IF NOT EXISTS idx_mobile_health_data_type ON mobile_health_data(data_type);
CREATE INDEX IF NOT EXISTS idx_mobile_health_data_timestamp ON mobile_health_data(collection_timestamp);
CREATE INDEX IF NOT EXISTS idx_mobile_health_data_validated ON mobile_health_data(is_validated);

CREATE INDEX IF NOT EXISTS idx_remote_patient_monitoring_patient_id ON remote_patient_monitoring(patient_id);
CREATE INDEX IF NOT EXISTS idx_remote_patient_monitoring_practitioner_id ON remote_patient_monitoring(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_remote_patient_monitoring_type ON remote_patient_monitoring(monitoring_type);
CREATE INDEX IF NOT EXISTS idx_remote_patient_monitoring_active ON remote_patient_monitoring(is_active);

CREATE INDEX IF NOT EXISTS idx_mobile_health_alerts_patient_id ON mobile_health_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_mobile_health_alerts_practitioner_id ON mobile_health_alerts(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_mobile_health_alerts_type ON mobile_health_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_mobile_health_alerts_severity ON mobile_health_alerts(alert_severity);
CREATE INDEX IF NOT EXISTS idx_mobile_health_alerts_timestamp ON mobile_health_alerts(alert_timestamp);
CREATE INDEX IF NOT EXISTS idx_mobile_health_alerts_acknowledged ON mobile_health_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_mobile_health_alerts_resolved ON mobile_health_alerts(resolved);

CREATE INDEX IF NOT EXISTS idx_patient_engagement_activities_patient_id ON patient_engagement_activities(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_engagement_activities_practitioner_id ON patient_engagement_activities(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_patient_engagement_activities_type ON patient_engagement_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_patient_engagement_activities_status ON patient_engagement_activities(completion_status);
CREATE INDEX IF NOT EXISTS idx_patient_engagement_activities_scheduled ON patient_engagement_activities(scheduled_time);

CREATE INDEX IF NOT EXISTS idx_mobile_health_analytics_date ON mobile_health_analytics(analysis_date);
CREATE INDEX IF NOT EXISTS idx_mobile_health_analytics_practitioner_id ON mobile_health_analytics(practitioner_id);

CREATE INDEX IF NOT EXISTS idx_mobile_health_integrations_type ON mobile_health_integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_mobile_health_integrations_provider ON mobile_health_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_mobile_health_integrations_status ON mobile_health_integrations(sync_status);
CREATE INDEX IF NOT EXISTS idx_mobile_health_integrations_active ON mobile_health_integrations(is_active);

CREATE INDEX IF NOT EXISTS idx_mobile_health_settings_practitioner_id ON mobile_health_settings(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_mobile_health_settings_patient_id ON mobile_health_settings(patient_id);
CREATE INDEX IF NOT EXISTS idx_mobile_health_settings_category ON mobile_health_settings(setting_category);

-- RLS Policies
ALTER TABLE mobile_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_mobile_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE remote_patient_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_health_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_engagement_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_health_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_health_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_health_settings ENABLE ROW LEVEL SECURITY;

-- Mobile apps policies (system-wide read access)
CREATE POLICY "Users can view mobile apps" ON mobile_apps
    FOR SELECT USING (true);

CREATE POLICY "Users can insert mobile apps" ON mobile_apps
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update mobile apps" ON mobile_apps
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete mobile apps" ON mobile_apps
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Wearable devices policies (system-wide read access)
CREATE POLICY "Users can view wearable devices" ON wearable_devices
    FOR SELECT USING (true);

CREATE POLICY "Users can insert wearable devices" ON wearable_devices
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update wearable devices" ON wearable_devices
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete wearable devices" ON wearable_devices
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Patient mobile devices policies
CREATE POLICY "Users can view mobile devices for their patients" ON patient_mobile_devices
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can insert mobile devices for their patients" ON patient_mobile_devices
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) AND practitioner_id = auth.uid()
    );

CREATE POLICY "Users can update mobile devices for their patients" ON patient_mobile_devices
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can delete mobile devices for their patients" ON patient_mobile_devices
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

-- Mobile health data policies
CREATE POLICY "Users can view health data for their patients" ON mobile_health_data
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert health data for their patients" ON mobile_health_data
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update health data for their patients" ON mobile_health_data
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete health data for their patients" ON mobile_health_data
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Remote patient monitoring policies
CREATE POLICY "Users can view monitoring for their patients" ON remote_patient_monitoring
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can insert monitoring for their patients" ON remote_patient_monitoring
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) AND practitioner_id = auth.uid()
    );

CREATE POLICY "Users can update monitoring for their patients" ON remote_patient_monitoring
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can delete monitoring for their patients" ON remote_patient_monitoring
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

-- Mobile health alerts policies
CREATE POLICY "Users can view alerts for their patients" ON mobile_health_alerts
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can insert alerts for their patients" ON mobile_health_alerts
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update alerts for their patients" ON mobile_health_alerts
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can delete alerts for their patients" ON mobile_health_alerts
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

-- Patient engagement activities policies
CREATE POLICY "Users can view engagement activities for their patients" ON patient_engagement_activities
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can insert engagement activities for their patients" ON patient_engagement_activities
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) AND practitioner_id = auth.uid()
    );

CREATE POLICY "Users can update engagement activities for their patients" ON patient_engagement_activities
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can delete engagement activities for their patients" ON patient_engagement_activities
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

-- Mobile health analytics policies
CREATE POLICY "Users can view their own analytics" ON mobile_health_analytics
    FOR SELECT USING (practitioner_id = auth.uid() OR practitioner_id IS NULL);

CREATE POLICY "Users can insert their own analytics" ON mobile_health_analytics
    FOR INSERT WITH CHECK (practitioner_id = auth.uid() OR practitioner_id IS NULL);

CREATE POLICY "Users can update their own analytics" ON mobile_health_analytics
    FOR UPDATE USING (practitioner_id = auth.uid() OR practitioner_id IS NULL);

CREATE POLICY "Users can delete their own analytics" ON mobile_health_analytics
    FOR DELETE USING (practitioner_id = auth.uid() OR practitioner_id IS NULL);

-- Mobile health integrations policies (system-wide read access)
CREATE POLICY "Users can view mobile health integrations" ON mobile_health_integrations
    FOR SELECT USING (true);

CREATE POLICY "Users can insert mobile health integrations" ON mobile_health_integrations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update mobile health integrations" ON mobile_health_integrations
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete mobile health integrations" ON mobile_health_integrations
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Mobile health settings policies
CREATE POLICY "Users can view their own settings" ON mobile_health_settings
    FOR SELECT USING (practitioner_id = auth.uid() OR patient_id IN (
        SELECT id FROM clients WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own settings" ON mobile_health_settings
    FOR INSERT WITH CHECK (practitioner_id = auth.uid() OR patient_id IN (
        SELECT id FROM clients WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Users can update their own settings" ON mobile_health_settings
    FOR UPDATE USING (practitioner_id = auth.uid() OR patient_id IN (
        SELECT id FROM clients WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own settings" ON mobile_health_settings
    FOR DELETE USING (practitioner_id = auth.uid() OR patient_id IN (
        SELECT id FROM clients WHERE owner_id = auth.uid()
    ));

-- Functions for Mobile Health

-- Function to generate mobile health analytics
CREATE OR REPLACE FUNCTION generate_mobile_health_analytics(
    p_analysis_date DATE DEFAULT CURRENT_DATE,
    p_analysis_period_months INTEGER DEFAULT 12,
    p_practitioner_id UUID DEFAULT NULL
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
        'practitioner_id', p_practitioner_id,
        'total_patients_monitored', (
            SELECT COUNT(DISTINCT patient_id) FROM remote_patient_monitoring
            WHERE monitoring_start_date >= v_start_date
            AND (p_practitioner_id IS NULL OR practitioner_id = p_practitioner_id)
        ),
        'total_devices_active', (
            SELECT COUNT(DISTINCT device_id) FROM patient_mobile_devices
            WHERE created_at >= v_start_date
            AND is_active = TRUE
            AND (p_practitioner_id IS NULL OR practitioner_id = p_practitioner_id)
        ),
        'total_data_points_collected', (
            SELECT COUNT(*) FROM mobile_health_data
            WHERE collection_timestamp >= v_start_date
            AND (p_practitioner_id IS NULL OR patient_id IN (
                SELECT id FROM clients WHERE owner_id = p_practitioner_id
            ))
        ),
        'average_data_quality_score', (
            SELECT AVG(data_quality_score) FROM mobile_health_data
            WHERE collection_timestamp >= v_start_date
            AND (p_practitioner_id IS NULL OR patient_id IN (
                SELECT id FROM clients WHERE owner_id = p_practitioner_id
            ))
        ),
        'patient_engagement_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN completion_status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM patient_engagement_activities
            WHERE created_at >= v_start_date
            AND (p_practitioner_id IS NULL OR practitioner_id = p_practitioner_id)
        ),
        'medication_adherence_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN completion_status = 'completed' AND activity_type = 'medication_reminder' THEN 1 END)::DECIMAL / COUNT(CASE WHEN activity_type = 'medication_reminder' THEN 1 END)::DECIMAL
                    ELSE 0
                END
            FROM patient_engagement_activities
            WHERE created_at >= v_start_date
            AND (p_practitioner_id IS NULL OR practitioner_id = p_practitioner_id)
        ),
        'symptom_tracking_completion_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN completion_status = 'completed' AND activity_type = 'symptom_check' THEN 1 END)::DECIMAL / COUNT(CASE WHEN activity_type = 'symptom_check' THEN 1 END)::DECIMAL
                    ELSE 0
                END
            FROM patient_engagement_activities
            WHERE created_at >= v_start_date
            AND (p_practitioner_id IS NULL OR practitioner_id = p_practitioner_id)
        ),
        'alert_response_time_avg_hours', (
            SELECT AVG(EXTRACT(EPOCH FROM (acknowledged_at - alert_timestamp)) / 3600)
            FROM mobile_health_alerts
            WHERE alert_timestamp >= v_start_date
            AND acknowledged = TRUE
            AND (p_practitioner_id IS NULL OR practitioner_id = p_practitioner_id)
        ),
        'false_positive_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN resolved = TRUE AND resolution_notes ILIKE '%false positive%' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM mobile_health_alerts
            WHERE alert_timestamp >= v_start_date
            AND (p_practitioner_id IS NULL OR practitioner_id = p_practitioner_id)
        ),
        'clinical_outcomes', (
            SELECT jsonb_build_object(
                'improved_adherence', 85.0, -- Mock data
                'reduced_hospitalizations', 25.0, -- Mock data
                'better_symptom_control', 78.0, -- Mock data
                'increased_patient_satisfaction', 92.0 -- Mock data
            )
        ),
        'device_usage_statistics', (
            SELECT jsonb_object_agg(
                device_type,
                jsonb_build_object(
                    'total_devices', COUNT(*),
                    'active_devices', COUNT(CASE WHEN is_active = TRUE THEN 1 END),
                    'average_usage_hours', 12.5 -- Mock data
                )
            )
            FROM patient_mobile_devices
            WHERE created_at >= v_start_date
            AND (p_practitioner_id IS NULL OR practitioner_id = p_practitioner_id)
            GROUP BY device_type
        ),
        'engagement_trends', (
            SELECT jsonb_build_object(
                'daily_active_users', 75.0, -- Mock data
                'weekly_active_users', 85.0, -- Mock data
                'monthly_active_users', 92.0, -- Mock data
                'engagement_trend', 'increasing' -- Mock data
            )
        ),
        'cost_effectiveness', (
            SELECT jsonb_build_object(
                'cost_per_patient_per_month', 45.0, -- Mock data
                'savings_per_patient', 200.0, -- Mock data
                'roi_percentage', 350.0 -- Mock data
            )
        )
    ) INTO v_analytics;
    
    RETURN v_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update mobile health analytics
CREATE OR REPLACE FUNCTION update_mobile_health_analytics(
    p_analysis_date DATE DEFAULT CURRENT_DATE,
    p_analysis_period_months INTEGER DEFAULT 12,
    p_practitioner_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_analytics JSONB;
BEGIN
    SELECT generate_mobile_health_analytics(p_analysis_date, p_analysis_period_months, p_practitioner_id) INTO v_analytics;
    
    INSERT INTO mobile_health_analytics (
        analysis_date,
        analysis_period_months,
        practitioner_id,
        total_patients_monitored,
        total_devices_active,
        total_data_points_collected,
        average_data_quality_score,
        patient_engagement_rate,
        medication_adherence_rate,
        symptom_tracking_completion_rate,
        alert_response_time_avg_hours,
        false_positive_rate,
        patient_satisfaction_score,
        cost_per_patient_monitored,
        roi_percentage,
        clinical_outcomes,
        device_usage_statistics,
        engagement_trends,
        cost_effectiveness
    ) VALUES (
        p_analysis_date,
        p_analysis_period_months,
        p_practitioner_id,
        (v_analytics->>'total_patients_monitored')::INTEGER,
        (v_analytics->>'total_devices_active')::INTEGER,
        (v_analytics->>'total_data_points_collected')::INTEGER,
        (v_analytics->>'average_data_quality_score')::DECIMAL(5,2),
        (v_analytics->>'patient_engagement_rate')::DECIMAL(5,2),
        (v_analytics->>'medication_adherence_rate')::DECIMAL(5,2),
        (v_analytics->>'symptom_tracking_completion_rate')::DECIMAL(5,2),
        (v_analytics->>'alert_response_time_avg_hours')::DECIMAL(8,2),
        (v_analytics->>'false_positive_rate')::DECIMAL(5,2),
        4.2, -- Mock data for patient satisfaction
        (v_analytics->'cost_effectiveness'->>'cost_per_patient_per_month')::DECIMAL(10,2),
        (v_analytics->'cost_effectiveness'->>'roi_percentage')::DECIMAL(5,2),
        v_analytics->'clinical_outcomes',
        v_analytics->'device_usage_statistics',
        v_analytics->'engagement_trends',
        v_analytics->'cost_effectiveness'
    )
    ON CONFLICT (analysis_date, practitioner_id) 
    DO UPDATE SET
        analysis_period_months = EXCLUDED.analysis_period_months,
        total_patients_monitored = EXCLUDED.total_patients_monitored,
        total_devices_active = EXCLUDED.total_devices_active,
        total_data_points_collected = EXCLUDED.total_data_points_collected,
        average_data_quality_score = EXCLUDED.average_data_quality_score,
        patient_engagement_rate = EXCLUDED.patient_engagement_rate,
        medication_adherence_rate = EXCLUDED.medication_adherence_rate,
        symptom_tracking_completion_rate = EXCLUDED.symptom_tracking_completion_rate,
        alert_response_time_avg_hours = EXCLUDED.alert_response_time_avg_hours,
        false_positive_rate = EXCLUDED.false_positive_rate,
        patient_satisfaction_score = EXCLUDED.patient_satisfaction_score,
        cost_per_patient_monitored = EXCLUDED.cost_per_patient_monitored,
        roi_percentage = EXCLUDED.roi_percentage,
        clinical_outcomes = EXCLUDED.clinical_outcomes,
        device_usage_statistics = EXCLUDED.device_usage_statistics,
        engagement_trends = EXCLUDED.engagement_trends,
        cost_effectiveness = EXCLUDED.cost_effectiveness,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics when new data is collected
CREATE OR REPLACE FUNCTION trigger_update_mobile_health_analytics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_mobile_health_analytics();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mobile_health_analytics_trigger
    AFTER INSERT OR UPDATE ON mobile_health_data
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_mobile_health_analytics();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_mobile_health_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mobile_apps_updated_at
    BEFORE UPDATE ON mobile_apps
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_health_updated_at();

CREATE TRIGGER wearable_devices_updated_at
    BEFORE UPDATE ON wearable_devices
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_health_updated_at();

CREATE TRIGGER patient_mobile_devices_updated_at
    BEFORE UPDATE ON patient_mobile_devices
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_health_updated_at();

CREATE TRIGGER mobile_health_data_updated_at
    BEFORE UPDATE ON mobile_health_data
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_health_updated_at();

CREATE TRIGGER remote_patient_monitoring_updated_at
    BEFORE UPDATE ON remote_patient_monitoring
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_health_updated_at();

CREATE TRIGGER mobile_health_alerts_updated_at
    BEFORE UPDATE ON mobile_health_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_health_updated_at();

CREATE TRIGGER patient_engagement_activities_updated_at
    BEFORE UPDATE ON patient_engagement_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_health_updated_at();

CREATE TRIGGER mobile_health_analytics_updated_at
    BEFORE UPDATE ON mobile_health_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_health_updated_at();

CREATE TRIGGER mobile_health_integrations_updated_at
    BEFORE UPDATE ON mobile_health_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_health_updated_at();

CREATE TRIGGER mobile_health_settings_updated_at
    BEFORE UPDATE ON mobile_health_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_health_updated_at();
