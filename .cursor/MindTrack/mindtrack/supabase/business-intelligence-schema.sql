-- Business Intelligence Schema
-- Comprehensive business intelligence and analytics management for American psychiatrists

-- Revenue Analytics
CREATE TABLE IF NOT EXISTS revenue_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis_period_months INTEGER NOT NULL DEFAULT 12,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    insurance_revenue DECIMAL(12,2) DEFAULT 0,
    cash_revenue DECIMAL(12,2) DEFAULT 0,
    medicare_revenue DECIMAL(12,2) DEFAULT 0,
    medicaid_revenue DECIMAL(12,2) DEFAULT 0,
    private_insurance_revenue DECIMAL(12,2) DEFAULT 0,
    copay_collection DECIMAL(12,2) DEFAULT 0,
    deductible_collection DECIMAL(12,2) DEFAULT 0,
    write_offs DECIMAL(12,2) DEFAULT 0,
    bad_debt DECIMAL(12,2) DEFAULT 0,
    net_collection_rate DECIMAL(5,2) DEFAULT 0,
    average_claim_value DECIMAL(8,2) DEFAULT 0,
    claims_submitted INTEGER DEFAULT 0,
    claims_paid INTEGER DEFAULT 0,
    claims_denied INTEGER DEFAULT 0,
    claims_pending INTEGER DEFAULT 0,
    denial_rate DECIMAL(5,2) DEFAULT 0,
    days_in_ar DECIMAL(6,2) DEFAULT 0,
    cost_per_encounter DECIMAL(8,2) DEFAULT 0,
    revenue_per_encounter DECIMAL(8,2) DEFAULT 0,
    profit_margin DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Analytics
CREATE TABLE IF NOT EXISTS patient_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis_period_months INTEGER NOT NULL DEFAULT 12,
    total_patients INTEGER DEFAULT 0,
    new_patients INTEGER DEFAULT 0,
    returning_patients INTEGER DEFAULT 0,
    active_patients INTEGER DEFAULT 0,
    inactive_patients INTEGER DEFAULT 0,
    patient_retention_rate DECIMAL(5,2) DEFAULT 0,
    average_visits_per_patient DECIMAL(6,2) DEFAULT 0,
    patient_satisfaction_score DECIMAL(4,2) DEFAULT 0,
    no_show_rate DECIMAL(5,2) DEFAULT 0,
    cancellation_rate DECIMAL(5,2) DEFAULT 0,
    rescheduling_rate DECIMAL(5,2) DEFAULT 0,
    patient_demographics JSONB,
    geographic_distribution JSONB,
    insurance_distribution JSONB,
    age_distribution JSONB,
    gender_distribution JSONB,
    diagnosis_distribution JSONB,
    treatment_outcomes JSONB,
    patient_lifetime_value DECIMAL(10,2) DEFAULT 0,
    patient_acquisition_cost DECIMAL(8,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider Performance Analytics
CREATE TABLE IF NOT EXISTS provider_performance_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES users(id),
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis_period_months INTEGER NOT NULL DEFAULT 12,
    total_encounters INTEGER DEFAULT 0,
    total_patients INTEGER DEFAULT 0,
    average_encounter_duration DECIMAL(6,2) DEFAULT 0,
    patient_satisfaction_score DECIMAL(4,2) DEFAULT 0,
    clinical_outcomes_score DECIMAL(4,2) DEFAULT 0,
    documentation_quality_score DECIMAL(4,2) DEFAULT 0,
    coding_accuracy_score DECIMAL(4,2) DEFAULT 0,
    compliance_score DECIMAL(4,2) DEFAULT 0,
    productivity_score DECIMAL(4,2) DEFAULT 0,
    revenue_generated DECIMAL(12,2) DEFAULT 0,
    cost_per_encounter DECIMAL(8,2) DEFAULT 0,
    revenue_per_encounter DECIMAL(8,2) DEFAULT 0,
    utilization_rate DECIMAL(5,2) DEFAULT 0,
    efficiency_score DECIMAL(4,2) DEFAULT 0,
    quality_measures_score DECIMAL(4,2) DEFAULT 0,
    patient_outcomes JSONB,
    clinical_metrics JSONB,
    financial_metrics JSONB,
    operational_metrics JSONB,
    benchmark_comparison JSONB,
    performance_trends JSONB,
    improvement_areas JSONB,
    strengths JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Predictive Models
CREATE TABLE IF NOT EXISTS predictive_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id VARCHAR(100) NOT NULL UNIQUE,
    model_name VARCHAR(200) NOT NULL,
    model_type VARCHAR(50) NOT NULL, -- 'revenue_forecast', 'patient_attrition', 'no_show_prediction', 'treatment_outcome', 'risk_assessment', 'demand_forecast'
    model_description TEXT,
    model_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    algorithm VARCHAR(100) NOT NULL, -- 'linear_regression', 'random_forest', 'neural_network', 'time_series', 'clustering', 'classification'
    training_data_period_months INTEGER NOT NULL DEFAULT 24,
    model_accuracy DECIMAL(5,2),
    model_precision DECIMAL(5,2),
    model_recall DECIMAL(5,2),
    model_f1_score DECIMAL(5,2),
    model_parameters JSONB,
    feature_importance JSONB,
    validation_results JSONB,
    last_trained_at TIMESTAMP WITH TIME ZONE,
    last_prediction_at TIMESTAMP WITH TIME ZONE,
    prediction_frequency VARCHAR(50) DEFAULT 'daily', -- 'real_time', 'hourly', 'daily', 'weekly', 'monthly'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Predictive Insights
CREATE TABLE IF NOT EXISTS predictive_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insight_id VARCHAR(100) NOT NULL UNIQUE,
    model_id UUID NOT NULL REFERENCES predictive_models(id),
    insight_type VARCHAR(50) NOT NULL, -- 'forecast', 'prediction', 'recommendation', 'alert', 'trend', 'anomaly'
    insight_title VARCHAR(200) NOT NULL,
    insight_description TEXT NOT NULL,
    insight_category VARCHAR(50) NOT NULL, -- 'revenue', 'patient', 'clinical', 'operational', 'financial', 'risk'
    confidence_score DECIMAL(5,2) NOT NULL,
    impact_score DECIMAL(5,2) NOT NULL,
    urgency_level VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    insight_data JSONB NOT NULL,
    actionable_recommendations JSONB,
    expected_outcome JSONB,
    risk_factors JSONB,
    mitigation_strategies JSONB,
    target_audience VARCHAR(100), -- 'admin', 'provider', 'finance', 'operations', 'all'
    insight_status VARCHAR(20) DEFAULT 'active', -- 'active', 'acknowledged', 'implemented', 'dismissed', 'expired'
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    implemented_by UUID REFERENCES users(id),
    implemented_at TIMESTAMP WITH TIME ZONE,
    implementation_results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Dashboards
CREATE TABLE IF NOT EXISTS performance_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id VARCHAR(100) NOT NULL UNIQUE,
    dashboard_name VARCHAR(200) NOT NULL,
    dashboard_description TEXT,
    dashboard_type VARCHAR(50) NOT NULL, -- 'executive', 'clinical', 'financial', 'operational', 'patient', 'provider', 'custom'
    target_audience VARCHAR(100) NOT NULL, -- 'admin', 'provider', 'finance', 'operations', 'executive', 'all'
    dashboard_config JSONB NOT NULL,
    widget_configs JSONB NOT NULL,
    refresh_frequency VARCHAR(50) DEFAULT 'daily', -- 'real_time', 'hourly', 'daily', 'weekly', 'monthly'
    auto_refresh BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT FALSE,
    access_permissions JSONB,
    last_refreshed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Key Performance Indicators
CREATE TABLE IF NOT EXISTS key_performance_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_id VARCHAR(100) NOT NULL UNIQUE,
    kpi_name VARCHAR(200) NOT NULL,
    kpi_description TEXT,
    kpi_category VARCHAR(50) NOT NULL, -- 'financial', 'clinical', 'operational', 'patient', 'provider', 'quality'
    kpi_type VARCHAR(50) NOT NULL, -- 'metric', 'ratio', 'percentage', 'count', 'rate', 'score'
    measurement_unit VARCHAR(50),
    calculation_formula TEXT,
    data_source VARCHAR(100),
    target_value DECIMAL(12,4),
    current_value DECIMAL(12,4),
    previous_value DECIMAL(12,4),
    benchmark_value DECIMAL(12,4),
    trend_direction VARCHAR(20), -- 'up', 'down', 'stable', 'volatile'
    trend_percentage DECIMAL(5,2),
    performance_status VARCHAR(20) DEFAULT 'neutral', -- 'excellent', 'good', 'neutral', 'poor', 'critical'
    alert_thresholds JSONB,
    reporting_frequency VARCHAR(50) DEFAULT 'monthly', -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Intelligence Reports
CREATE TABLE IF NOT EXISTS business_intelligence_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id VARCHAR(100) NOT NULL UNIQUE,
    report_name VARCHAR(200) NOT NULL,
    report_description TEXT,
    report_type VARCHAR(50) NOT NULL, -- 'financial', 'clinical', 'operational', 'patient', 'provider', 'compliance', 'custom'
    report_category VARCHAR(50) NOT NULL, -- 'summary', 'detailed', 'analytical', 'predictive', 'comparative', 'trend'
    report_config JSONB NOT NULL,
    data_filters JSONB,
    report_parameters JSONB,
    output_format VARCHAR(50) DEFAULT 'pdf', -- 'pdf', 'excel', 'csv', 'json', 'html', 'dashboard'
    schedule_config JSONB,
    is_scheduled BOOLEAN DEFAULT FALSE,
    last_generated_at TIMESTAMP WITH TIME ZONE,
    next_generation_at TIMESTAMP WITH TIME ZONE,
    generation_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'generating', 'completed', 'failed', 'cancelled'
    generation_error TEXT,
    file_path VARCHAR(500),
    file_size_bytes BIGINT,
    access_permissions JSONB,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Quality Metrics
CREATE TABLE IF NOT EXISTS data_quality_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_id VARCHAR(100) NOT NULL UNIQUE,
    metric_name VARCHAR(200) NOT NULL,
    metric_category VARCHAR(50) NOT NULL, -- 'completeness', 'accuracy', 'consistency', 'timeliness', 'validity', 'uniqueness'
    data_source VARCHAR(100) NOT NULL,
    metric_description TEXT,
    measurement_period VARCHAR(50) DEFAULT 'daily', -- 'hourly', 'daily', 'weekly', 'monthly'
    current_score DECIMAL(5,2) NOT NULL,
    target_score DECIMAL(5,2) NOT NULL,
    previous_score DECIMAL(5,2),
    trend_direction VARCHAR(20), -- 'improving', 'declining', 'stable'
    quality_issues JSONB,
    improvement_recommendations JSONB,
    data_governance_rules JSONB,
    validation_rules JSONB,
    error_logs JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Intelligence Settings
CREATE TABLE IF NOT EXISTS business_intelligence_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_category VARCHAR(50) NOT NULL, -- 'dashboard', 'reporting', 'analytics', 'predictive', 'alerts', 'data_quality'
    setting_name VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    setting_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_date ON revenue_analytics(analysis_date);
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_period ON revenue_analytics(analysis_period_months);

CREATE INDEX IF NOT EXISTS idx_patient_analytics_date ON patient_analytics(analysis_date);
CREATE INDEX IF NOT EXISTS idx_patient_analytics_period ON patient_analytics(analysis_period_months);

CREATE INDEX IF NOT EXISTS idx_provider_performance_provider_id ON provider_performance_analytics(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_performance_date ON provider_performance_analytics(analysis_date);
CREATE INDEX IF NOT EXISTS idx_provider_performance_period ON provider_performance_analytics(analysis_period_months);

CREATE INDEX IF NOT EXISTS idx_predictive_models_type ON predictive_models(model_type);
CREATE INDEX IF NOT EXISTS idx_predictive_models_algorithm ON predictive_models(algorithm);
CREATE INDEX IF NOT EXISTS idx_predictive_models_active ON predictive_models(is_active);

CREATE INDEX IF NOT EXISTS idx_predictive_insights_model_id ON predictive_insights(model_id);
CREATE INDEX IF NOT EXISTS idx_predictive_insights_type ON predictive_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_predictive_insights_category ON predictive_insights(insight_category);
CREATE INDEX IF NOT EXISTS idx_predictive_insights_status ON predictive_insights(insight_status);
CREATE INDEX IF NOT EXISTS idx_predictive_insights_urgency ON predictive_insights(urgency_level);

CREATE INDEX IF NOT EXISTS idx_performance_dashboards_type ON performance_dashboards(dashboard_type);
CREATE INDEX IF NOT EXISTS idx_performance_dashboards_audience ON performance_dashboards(target_audience);
CREATE INDEX IF NOT EXISTS idx_performance_dashboards_public ON performance_dashboards(is_public);

CREATE INDEX IF NOT EXISTS idx_kpis_category ON key_performance_indicators(kpi_category);
CREATE INDEX IF NOT EXISTS idx_kpis_type ON key_performance_indicators(kpi_type);
CREATE INDEX IF NOT EXISTS idx_kpis_status ON key_performance_indicators(performance_status);
CREATE INDEX IF NOT EXISTS idx_kpis_active ON key_performance_indicators(is_active);

CREATE INDEX IF NOT EXISTS idx_bi_reports_type ON business_intelligence_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_bi_reports_category ON business_intelligence_reports(report_category);
CREATE INDEX IF NOT EXISTS idx_bi_reports_status ON business_intelligence_reports(generation_status);
CREATE INDEX IF NOT EXISTS idx_bi_reports_scheduled ON business_intelligence_reports(is_scheduled);

CREATE INDEX IF NOT EXISTS idx_data_quality_category ON data_quality_metrics(metric_category);
CREATE INDEX IF NOT EXISTS idx_data_quality_source ON data_quality_metrics(data_source);
CREATE INDEX IF NOT EXISTS idx_data_quality_active ON data_quality_metrics(is_active);

CREATE INDEX IF NOT EXISTS idx_bi_settings_category ON business_intelligence_settings(setting_category);
CREATE INDEX IF NOT EXISTS idx_bi_settings_active ON business_intelligence_settings(is_active);

-- RLS Policies
ALTER TABLE revenue_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_performance_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_intelligence_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_intelligence_settings ENABLE ROW LEVEL SECURITY;

-- Revenue analytics policies (system-wide read access)
CREATE POLICY "Users can view revenue analytics" ON revenue_analytics
    FOR SELECT USING (true);

CREATE POLICY "Users can insert revenue analytics" ON revenue_analytics
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update revenue analytics" ON revenue_analytics
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete revenue analytics" ON revenue_analytics
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Patient analytics policies (system-wide read access)
CREATE POLICY "Users can view patient analytics" ON patient_analytics
    FOR SELECT USING (true);

CREATE POLICY "Users can insert patient analytics" ON patient_analytics
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update patient analytics" ON patient_analytics
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete patient analytics" ON patient_analytics
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Provider performance analytics policies
CREATE POLICY "Users can view provider performance analytics" ON provider_performance_analytics
    FOR SELECT USING (
        provider_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can insert provider performance analytics" ON provider_performance_analytics
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update provider performance analytics" ON provider_performance_analytics
    FOR UPDATE USING (
        provider_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can delete provider performance analytics" ON provider_performance_analytics
    FOR DELETE USING (
        provider_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Predictive models policies (system-wide read access)
CREATE POLICY "Users can view predictive models" ON predictive_models
    FOR SELECT USING (true);

CREATE POLICY "Users can insert predictive models" ON predictive_models
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update predictive models" ON predictive_models
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete predictive models" ON predictive_models
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Predictive insights policies (system-wide read access)
CREATE POLICY "Users can view predictive insights" ON predictive_insights
    FOR SELECT USING (true);

CREATE POLICY "Users can insert predictive insights" ON predictive_insights
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update predictive insights" ON predictive_insights
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete predictive insights" ON predictive_insights
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Performance dashboards policies
CREATE POLICY "Users can view performance dashboards" ON performance_dashboards
    FOR SELECT USING (
        is_public = TRUE OR 
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can insert performance dashboards" ON performance_dashboards
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update performance dashboards" ON performance_dashboards
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can delete performance dashboards" ON performance_dashboards
    FOR DELETE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Key performance indicators policies (system-wide read access)
CREATE POLICY "Users can view key performance indicators" ON key_performance_indicators
    FOR SELECT USING (true);

CREATE POLICY "Users can insert key performance indicators" ON key_performance_indicators
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update key performance indicators" ON key_performance_indicators
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete key performance indicators" ON key_performance_indicators
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Business intelligence reports policies
CREATE POLICY "Users can view business intelligence reports" ON business_intelligence_reports
    FOR SELECT USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can insert business intelligence reports" ON business_intelligence_reports
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update business intelligence reports" ON business_intelligence_reports
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can delete business intelligence reports" ON business_intelligence_reports
    FOR DELETE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Data quality metrics policies (system-wide read access)
CREATE POLICY "Users can view data quality metrics" ON data_quality_metrics
    FOR SELECT USING (true);

CREATE POLICY "Users can insert data quality metrics" ON data_quality_metrics
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update data quality metrics" ON data_quality_metrics
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete data quality metrics" ON data_quality_metrics
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Business intelligence settings policies (system-wide read access)
CREATE POLICY "Users can view business intelligence settings" ON business_intelligence_settings
    FOR SELECT USING (true);

CREATE POLICY "Users can insert business intelligence settings" ON business_intelligence_settings
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update business intelligence settings" ON business_intelligence_settings
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete business intelligence settings" ON business_intelligence_settings
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Functions for Business Intelligence

-- Function to generate revenue analytics
CREATE OR REPLACE FUNCTION generate_revenue_analytics(
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
        'analysis_start_date', v_start_date,
        'analysis_end_date', p_analysis_date,
        'total_revenue', 1250000.00, -- Mock data
        'insurance_revenue', 875000.00, -- Mock data
        'cash_revenue', 150000.00, -- Mock data
        'medicare_revenue', 400000.00, -- Mock data
        'medicaid_revenue', 200000.00, -- Mock data
        'private_insurance_revenue', 275000.00, -- Mock data
        'copay_collection', 45000.00, -- Mock data
        'deductible_collection', 30000.00, -- Mock data
        'write_offs', 15000.00, -- Mock data
        'bad_debt', 5000.00, -- Mock data
        'net_collection_rate', 96.5, -- Mock data
        'average_claim_value', 125.50, -- Mock data
        'claims_submitted', 8500, -- Mock data
        'claims_paid', 8200, -- Mock data
        'claims_denied', 200, -- Mock data
        'claims_pending', 100, -- Mock data
        'denial_rate', 2.4, -- Mock data
        'days_in_ar', 28.5, -- Mock data
        'cost_per_encounter', 85.25, -- Mock data
        'revenue_per_encounter', 147.06, -- Mock data
        'profit_margin', 42.0 -- Mock data
    ) INTO v_analytics;
    
    RETURN v_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate patient analytics
CREATE OR REPLACE FUNCTION generate_patient_analytics(
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
        'analysis_start_date', v_start_date,
        'analysis_end_date', p_analysis_date,
        'total_patients', 2500, -- Mock data
        'new_patients', 450, -- Mock data
        'returning_patients', 2050, -- Mock data
        'active_patients', 1800, -- Mock data
        'inactive_patients', 700, -- Mock data
        'patient_retention_rate', 82.0, -- Mock data
        'average_visits_per_patient', 4.2, -- Mock data
        'patient_satisfaction_score', 4.6, -- Mock data
        'no_show_rate', 8.5, -- Mock data
        'cancellation_rate', 12.3, -- Mock data
        'rescheduling_rate', 15.7, -- Mock data
        'patient_demographics', jsonb_build_object(
            'age_groups', jsonb_build_object(
                '18-25', 15.2,
                '26-35', 22.8,
                '36-45', 28.5,
                '46-55', 18.7,
                '56-65', 10.3,
                '65+', 4.5
            ),
            'gender_distribution', jsonb_build_object(
                'male', 45.2,
                'female', 52.8,
                'other', 2.0
            )
        ),
        'geographic_distribution', jsonb_build_object(
            'urban', 65.5,
            'suburban', 28.3,
            'rural', 6.2
        ),
        'insurance_distribution', jsonb_build_object(
            'medicare', 35.2,
            'medicaid', 18.7,
            'private_insurance', 42.1,
            'self_pay', 4.0
        ),
        'patient_lifetime_value', 2850.00, -- Mock data
        'patient_acquisition_cost', 125.50 -- Mock data
    ) INTO v_analytics;
    
    RETURN v_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate predictive insights
CREATE OR REPLACE FUNCTION generate_predictive_insights(
    p_model_id UUID,
    p_insight_type VARCHAR(50),
    p_confidence_threshold DECIMAL(5,2) DEFAULT 75.0
)
RETURNS JSONB AS $$
DECLARE
    v_insight JSONB;
BEGIN
    SELECT jsonb_build_object(
        'model_id', p_model_id,
        'insight_type', p_insight_type,
        'confidence_threshold', p_confidence_threshold,
        'insights', jsonb_build_array(
            jsonb_build_object(
                'insight_id', 'INSIGHT-001',
                'title', 'Revenue Growth Forecast',
                'description', 'Based on current trends, revenue is projected to increase by 12% over the next quarter',
                'confidence_score', 87.5,
                'impact_score', 85.0,
                'urgency_level', 'medium',
                'recommendations', jsonb_build_array(
                    'Increase marketing efforts',
                    'Optimize appointment scheduling',
                    'Implement patient retention programs'
                )
            ),
            jsonb_build_object(
                'insight_id', 'INSIGHT-002',
                'title', 'Patient Attrition Risk',
                'description', '15% of patients show high risk of attrition in the next 30 days',
                'confidence_score', 92.3,
                'impact_score', 78.5,
                'urgency_level', 'high',
                'recommendations', jsonb_build_array(
                    'Implement patient outreach program',
                    'Review treatment plans',
                    'Schedule follow-up appointments'
                )
            )
        )
    ) INTO v_insight;
    
    RETURN v_insight;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics when new data is available
CREATE OR REPLACE FUNCTION trigger_update_business_intelligence()
RETURNS TRIGGER AS $$
BEGIN
    -- Update relevant analytics based on the table that was modified
    IF TG_TABLE_NAME = 'revenue_analytics' THEN
        PERFORM generate_revenue_analytics();
    ELSIF TG_TABLE_NAME = 'patient_analytics' THEN
        PERFORM generate_patient_analytics();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_intelligence_trigger
    AFTER INSERT OR UPDATE ON revenue_analytics
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_business_intelligence();

CREATE TRIGGER business_intelligence_trigger_patient
    AFTER INSERT OR UPDATE ON patient_analytics
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_business_intelligence();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_business_intelligence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER revenue_analytics_updated_at
    BEFORE UPDATE ON revenue_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_business_intelligence_updated_at();

CREATE TRIGGER patient_analytics_updated_at
    BEFORE UPDATE ON patient_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_business_intelligence_updated_at();

CREATE TRIGGER provider_performance_analytics_updated_at
    BEFORE UPDATE ON provider_performance_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_business_intelligence_updated_at();

CREATE TRIGGER predictive_models_updated_at
    BEFORE UPDATE ON predictive_models
    FOR EACH ROW
    EXECUTE FUNCTION update_business_intelligence_updated_at();

CREATE TRIGGER predictive_insights_updated_at
    BEFORE UPDATE ON predictive_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_business_intelligence_updated_at();

CREATE TRIGGER performance_dashboards_updated_at
    BEFORE UPDATE ON performance_dashboards
    FOR EACH ROW
    EXECUTE FUNCTION update_business_intelligence_updated_at();

CREATE TRIGGER key_performance_indicators_updated_at
    BEFORE UPDATE ON key_performance_indicators
    FOR EACH ROW
    EXECUTE FUNCTION update_business_intelligence_updated_at();

CREATE TRIGGER business_intelligence_reports_updated_at
    BEFORE UPDATE ON business_intelligence_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_business_intelligence_updated_at();

CREATE TRIGGER data_quality_metrics_updated_at
    BEFORE UPDATE ON data_quality_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_business_intelligence_updated_at();

CREATE TRIGGER business_intelligence_settings_updated_at
    BEFORE UPDATE ON business_intelligence_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_business_intelligence_updated_at();











