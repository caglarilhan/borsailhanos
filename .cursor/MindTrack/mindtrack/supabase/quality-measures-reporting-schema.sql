-- Quality Measures & Reporting Schema
-- Comprehensive quality reporting for American psychiatrists

-- Quality Measure Categories
CREATE TABLE IF NOT EXISTS quality_measure_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(100) NOT NULL UNIQUE,
    category_description TEXT,
    category_type VARCHAR(50) NOT NULL, -- 'mips', 'hedis', 'cms', 'custom'
    reporting_year INTEGER NOT NULL,
    weight_percentage DECIMAL(5,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quality Measures
CREATE TABLE IF NOT EXISTS quality_measures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    measure_id VARCHAR(50) NOT NULL UNIQUE,
    measure_name VARCHAR(200) NOT NULL,
    measure_description TEXT,
    measure_category_id UUID NOT NULL REFERENCES quality_measure_categories(id),
    measure_type VARCHAR(50) NOT NULL, -- 'process', 'outcome', 'structure', 'patient_experience', 'efficiency'
    measure_domain VARCHAR(100), -- 'mental_health', 'substance_abuse', 'preventive_care', 'chronic_care'
    numerator_description TEXT,
    denominator_description TEXT,
    exclusion_description TEXT,
    measure_version VARCHAR(20),
    reporting_year INTEGER NOT NULL,
    cpt_codes TEXT[],
    icd10_codes TEXT[],
    age_range_min INTEGER,
    age_range_max INTEGER,
    gender_restriction VARCHAR(20), -- 'male', 'female', 'all'
    specialty_restriction TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Quality Measures
CREATE TABLE IF NOT EXISTS patient_quality_measures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    measure_id UUID NOT NULL REFERENCES quality_measures(id),
    practitioner_id UUID NOT NULL REFERENCES users(id),
    measurement_period_start DATE NOT NULL,
    measurement_period_end DATE NOT NULL,
    numerator_value INTEGER DEFAULT 0,
    denominator_value INTEGER DEFAULT 0,
    exclusion_value INTEGER DEFAULT 0,
    performance_rate DECIMAL(5,2),
    meets_criteria BOOLEAN DEFAULT FALSE,
    measurement_date DATE NOT NULL,
    measurement_notes TEXT,
    data_source VARCHAR(100), -- 'ehr', 'claims', 'manual', 'patient_survey'
    validation_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'validated', 'rejected', 'needs_review'
    validated_by UUID REFERENCES users(id),
    validated_at TIMESTAMP WITH TIME ZONE,
    validation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quality Measure Reporting
CREATE TABLE IF NOT EXISTS quality_measure_reporting (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporting_period_id VARCHAR(100) NOT NULL UNIQUE,
    practitioner_id UUID NOT NULL REFERENCES users(id),
    reporting_year INTEGER NOT NULL,
    reporting_period_start DATE NOT NULL,
    reporting_period_end DATE NOT NULL,
    reporting_status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'submitted', 'accepted', 'rejected', 'under_review'
    submission_date TIMESTAMP WITH TIME ZONE,
    acceptance_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    total_measures INTEGER DEFAULT 0,
    completed_measures INTEGER DEFAULT 0,
    overall_score DECIMAL(5,2),
    category_scores JSONB, -- Scores by category
    performance_improvement_score DECIMAL(5,2),
    cost_score DECIMAL(5,2),
    promoting_interoperability_score DECIMAL(5,2),
    quality_score DECIMAL(5,2),
    final_score DECIMAL(5,2),
    payment_adjustment DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HEDIS Measures
CREATE TABLE IF NOT EXISTS hedis_measures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hedis_id VARCHAR(50) NOT NULL UNIQUE,
    measure_name VARCHAR(200) NOT NULL,
    measure_description TEXT,
    measure_category VARCHAR(100) NOT NULL, -- 'effectiveness_of_care', 'access_to_care', 'experience_of_care'
    measure_type VARCHAR(50) NOT NULL, -- 'rate', 'count', 'percentage'
    numerator_specification TEXT,
    denominator_specification TEXT,
    exclusion_specification TEXT,
    age_range_min INTEGER,
    age_range_max INTEGER,
    gender_restriction VARCHAR(20),
    reporting_year INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HEDIS Reporting
CREATE TABLE IF NOT EXISTS hedis_reporting (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hedis_measure_id UUID NOT NULL REFERENCES hedis_measures(id),
    practitioner_id UUID NOT NULL REFERENCES users(id),
    reporting_year INTEGER NOT NULL,
    reporting_period_start DATE NOT NULL,
    reporting_period_end DATE NOT NULL,
    numerator_value INTEGER DEFAULT 0,
    denominator_value INTEGER DEFAULT 0,
    exclusion_value INTEGER DEFAULT 0,
    performance_rate DECIMAL(5,2),
    benchmark_rate DECIMAL(5,2),
    percentile_rank INTEGER,
    reporting_status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'submitted', 'accepted', 'rejected'
    submission_date TIMESTAMP WITH TIME ZONE,
    validation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CMS Quality Reporting
CREATE TABLE IF NOT EXISTS cms_quality_reporting (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporting_id VARCHAR(100) NOT NULL UNIQUE,
    practitioner_id UUID NOT NULL REFERENCES users(id),
    reporting_year INTEGER NOT NULL,
    reporting_type VARCHAR(50) NOT NULL, -- 'pqrs', 'mips', 'value_based'
    reporting_period_start DATE NOT NULL,
    reporting_period_end DATE NOT NULL,
    reporting_status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'submitted', 'accepted', 'rejected'
    submission_method VARCHAR(50), -- 'ehr', 'registry', 'claims', 'cms_web_interface'
    submission_date TIMESTAMP WITH TIME ZONE,
    acceptance_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    total_measures INTEGER DEFAULT 0,
    completed_measures INTEGER DEFAULT 0,
    overall_score DECIMAL(5,2),
    payment_adjustment DECIMAL(5,2),
    bonus_payment DECIMAL(10,2),
    penalty_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Analytics
CREATE TABLE IF NOT EXISTS performance_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis_period_months INTEGER NOT NULL DEFAULT 12,
    practitioner_id UUID REFERENCES users(id),
    total_patients INTEGER NOT NULL DEFAULT 0,
    total_encounters INTEGER NOT NULL DEFAULT 0,
    quality_measures_performance JSONB,
    hedis_performance JSONB,
    cms_performance JSONB,
    patient_satisfaction_score DECIMAL(5,2),
    readmission_rate DECIMAL(5,2),
    length_of_stay_avg DECIMAL(8,2),
    cost_per_patient DECIMAL(10,2),
    efficiency_score DECIMAL(5,2),
    outcome_measures JSONB,
    benchmark_comparison JSONB,
    trend_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outcome Tracking
CREATE TABLE IF NOT EXISTS outcome_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES users(id),
    outcome_type VARCHAR(100) NOT NULL, -- 'clinical', 'functional', 'quality_of_life', 'satisfaction'
    outcome_measure VARCHAR(100) NOT NULL, -- 'phq9', 'gad7', 'hamd', 'cgi', 'sf36'
    baseline_value DECIMAL(10,2),
    baseline_date DATE,
    target_value DECIMAL(10,2),
    target_date DATE,
    current_value DECIMAL(10,2),
    current_date DATE,
    improvement_percentage DECIMAL(5,2),
    goal_achieved BOOLEAN DEFAULT FALSE,
    measurement_frequency VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'quarterly'
    last_measurement_date DATE,
    next_measurement_date DATE,
    measurement_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quality Improvement Plans
CREATE TABLE IF NOT EXISTS quality_improvement_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name VARCHAR(200) NOT NULL,
    plan_description TEXT,
    target_measure_id UUID REFERENCES quality_measures(id),
    current_performance DECIMAL(5,2),
    target_performance DECIMAL(5,2),
    improvement_strategies TEXT[],
    implementation_timeline DATE,
    responsible_person UUID REFERENCES users(id),
    budget_required DECIMAL(10,2),
    expected_outcomes TEXT,
    success_metrics TEXT[],
    plan_status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'approved', 'in_progress', 'completed', 'cancelled'
    start_date DATE,
    end_date DATE,
    actual_performance DECIMAL(5,2),
    lessons_learned TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quality Reports
CREATE TABLE IF NOT EXISTS quality_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id VARCHAR(100) NOT NULL UNIQUE,
    report_name VARCHAR(200) NOT NULL,
    report_type VARCHAR(50) NOT NULL, -- 'mips', 'hedis', 'cms', 'custom', 'dashboard'
    report_period_start DATE NOT NULL,
    report_period_end DATE NOT NULL,
    practitioner_id UUID REFERENCES users(id),
    report_status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'generated', 'published', 'archived'
    report_data JSONB NOT NULL DEFAULT '{}',
    report_metrics JSONB NOT NULL DEFAULT '{}',
    report_charts JSONB NOT NULL DEFAULT '{}',
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    report_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quality_measure_categories_type ON quality_measure_categories(category_type);
CREATE INDEX IF NOT EXISTS idx_quality_measure_categories_year ON quality_measure_categories(reporting_year);
CREATE INDEX IF NOT EXISTS idx_quality_measure_categories_active ON quality_measure_categories(is_active);

CREATE INDEX IF NOT EXISTS idx_quality_measures_category_id ON quality_measures(measure_category_id);
CREATE INDEX IF NOT EXISTS idx_quality_measures_type ON quality_measures(measure_type);
CREATE INDEX IF NOT EXISTS idx_quality_measures_domain ON quality_measures(measure_domain);
CREATE INDEX IF NOT EXISTS idx_quality_measures_year ON quality_measures(reporting_year);
CREATE INDEX IF NOT EXISTS idx_quality_measures_active ON quality_measures(is_active);

CREATE INDEX IF NOT EXISTS idx_patient_quality_measures_patient_id ON patient_quality_measures(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_quality_measures_measure_id ON patient_quality_measures(measure_id);
CREATE INDEX IF NOT EXISTS idx_patient_quality_measures_practitioner_id ON patient_quality_measures(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_patient_quality_measures_period ON patient_quality_measures(measurement_period_start, measurement_period_end);
CREATE INDEX IF NOT EXISTS idx_patient_quality_measures_validation ON patient_quality_measures(validation_status);

CREATE INDEX IF NOT EXISTS idx_quality_measure_reporting_practitioner_id ON quality_measure_reporting(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_quality_measure_reporting_year ON quality_measure_reporting(reporting_year);
CREATE INDEX IF NOT EXISTS idx_quality_measure_reporting_period ON quality_measure_reporting(reporting_period_start, reporting_period_end);
CREATE INDEX IF NOT EXISTS idx_quality_measure_reporting_status ON quality_measure_reporting(reporting_status);

CREATE INDEX IF NOT EXISTS idx_hedis_measures_category ON hedis_measures(measure_category);
CREATE INDEX IF NOT EXISTS idx_hedis_measures_type ON hedis_measures(measure_type);
CREATE INDEX IF NOT EXISTS idx_hedis_measures_year ON hedis_measures(reporting_year);
CREATE INDEX IF NOT EXISTS idx_hedis_measures_active ON hedis_measures(is_active);

CREATE INDEX IF NOT EXISTS idx_hedis_reporting_measure_id ON hedis_reporting(hedis_measure_id);
CREATE INDEX IF NOT EXISTS idx_hedis_reporting_practitioner_id ON hedis_reporting(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_hedis_reporting_year ON hedis_reporting(reporting_year);
CREATE INDEX IF NOT EXISTS idx_hedis_reporting_period ON hedis_reporting(reporting_period_start, reporting_period_end);

CREATE INDEX IF NOT EXISTS idx_cms_quality_reporting_practitioner_id ON cms_quality_reporting(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_cms_quality_reporting_year ON cms_quality_reporting(reporting_year);
CREATE INDEX IF NOT EXISTS idx_cms_quality_reporting_type ON cms_quality_reporting(reporting_type);
CREATE INDEX IF NOT EXISTS idx_cms_quality_reporting_period ON cms_quality_reporting(reporting_period_start, reporting_period_end);

CREATE INDEX IF NOT EXISTS idx_performance_analytics_date ON performance_analytics(analysis_date);
CREATE INDEX IF NOT EXISTS idx_performance_analytics_practitioner_id ON performance_analytics(practitioner_id);

CREATE INDEX IF NOT EXISTS idx_outcome_tracking_patient_id ON outcome_tracking(patient_id);
CREATE INDEX IF NOT EXISTS idx_outcome_tracking_practitioner_id ON outcome_tracking(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_outcome_tracking_type ON outcome_tracking(outcome_type);
CREATE INDEX IF NOT EXISTS idx_outcome_tracking_measure ON outcome_tracking(outcome_measure);

CREATE INDEX IF NOT EXISTS idx_quality_improvement_plans_status ON quality_improvement_plans(plan_status);
CREATE INDEX IF NOT EXISTS idx_quality_improvement_plans_responsible ON quality_improvement_plans(responsible_person);

CREATE INDEX IF NOT EXISTS idx_quality_reports_type ON quality_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_quality_reports_period ON quality_reports(report_period_start, report_period_end);
CREATE INDEX IF NOT EXISTS idx_quality_reports_status ON quality_reports(report_status);

-- RLS Policies
ALTER TABLE quality_measure_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_quality_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_measure_reporting ENABLE ROW LEVEL SECURITY;
ALTER TABLE hedis_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE hedis_reporting ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_quality_reporting ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcome_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_improvement_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_reports ENABLE ROW LEVEL SECURITY;

-- Quality measure categories policies (system-wide read access)
CREATE POLICY "Users can view quality measure categories" ON quality_measure_categories
    FOR SELECT USING (true);

CREATE POLICY "Users can insert quality measure categories" ON quality_measure_categories
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update quality measure categories" ON quality_measure_categories
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete quality measure categories" ON quality_measure_categories
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Quality measures policies (system-wide read access)
CREATE POLICY "Users can view quality measures" ON quality_measures
    FOR SELECT USING (true);

CREATE POLICY "Users can insert quality measures" ON quality_measures
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update quality measures" ON quality_measures
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete quality measures" ON quality_measures
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Patient quality measures policies
CREATE POLICY "Users can view patient quality measures for their patients" ON patient_quality_measures
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can insert patient quality measures for their patients" ON patient_quality_measures
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) AND practitioner_id = auth.uid()
    );

CREATE POLICY "Users can update patient quality measures for their patients" ON patient_quality_measures
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can delete patient quality measures for their patients" ON patient_quality_measures
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

-- Quality measure reporting policies
CREATE POLICY "Users can view their own quality measure reporting" ON quality_measure_reporting
    FOR SELECT USING (practitioner_id = auth.uid());

CREATE POLICY "Users can insert their own quality measure reporting" ON quality_measure_reporting
    FOR INSERT WITH CHECK (practitioner_id = auth.uid());

CREATE POLICY "Users can update their own quality measure reporting" ON quality_measure_reporting
    FOR UPDATE USING (practitioner_id = auth.uid());

CREATE POLICY "Users can delete their own quality measure reporting" ON quality_measure_reporting
    FOR DELETE USING (practitioner_id = auth.uid());

-- HEDIS measures policies (system-wide read access)
CREATE POLICY "Users can view HEDIS measures" ON hedis_measures
    FOR SELECT USING (true);

CREATE POLICY "Users can insert HEDIS measures" ON hedis_measures
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update HEDIS measures" ON hedis_measures
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete HEDIS measures" ON hedis_measures
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- HEDIS reporting policies
CREATE POLICY "Users can view their own HEDIS reporting" ON hedis_reporting
    FOR SELECT USING (practitioner_id = auth.uid());

CREATE POLICY "Users can insert their own HEDIS reporting" ON hedis_reporting
    FOR INSERT WITH CHECK (practitioner_id = auth.uid());

CREATE POLICY "Users can update their own HEDIS reporting" ON hedis_reporting
    FOR UPDATE USING (practitioner_id = auth.uid());

CREATE POLICY "Users can delete their own HEDIS reporting" ON hedis_reporting
    FOR DELETE USING (practitioner_id = auth.uid());

-- CMS quality reporting policies
CREATE POLICY "Users can view their own CMS quality reporting" ON cms_quality_reporting
    FOR SELECT USING (practitioner_id = auth.uid());

CREATE POLICY "Users can insert their own CMS quality reporting" ON cms_quality_reporting
    FOR INSERT WITH CHECK (practitioner_id = auth.uid());

CREATE POLICY "Users can update their own CMS quality reporting" ON cms_quality_reporting
    FOR UPDATE USING (practitioner_id = auth.uid());

CREATE POLICY "Users can delete their own CMS quality reporting" ON cms_quality_reporting
    FOR DELETE USING (practitioner_id = auth.uid());

-- Performance analytics policies
CREATE POLICY "Users can view their own performance analytics" ON performance_analytics
    FOR SELECT USING (practitioner_id = auth.uid() OR practitioner_id IS NULL);

CREATE POLICY "Users can insert their own performance analytics" ON performance_analytics
    FOR INSERT WITH CHECK (practitioner_id = auth.uid() OR practitioner_id IS NULL);

CREATE POLICY "Users can update their own performance analytics" ON performance_analytics
    FOR UPDATE USING (practitioner_id = auth.uid() OR practitioner_id IS NULL);

CREATE POLICY "Users can delete their own performance analytics" ON performance_analytics
    FOR DELETE USING (practitioner_id = auth.uid() OR practitioner_id IS NULL);

-- Outcome tracking policies
CREATE POLICY "Users can view outcome tracking for their patients" ON outcome_tracking
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can insert outcome tracking for their patients" ON outcome_tracking
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) AND practitioner_id = auth.uid()
    );

CREATE POLICY "Users can update outcome tracking for their patients" ON outcome_tracking
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can delete outcome tracking for their patients" ON outcome_tracking
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

-- Quality improvement plans policies
CREATE POLICY "Users can view quality improvement plans" ON quality_improvement_plans
    FOR SELECT USING (true);

CREATE POLICY "Users can insert quality improvement plans" ON quality_improvement_plans
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update quality improvement plans" ON quality_improvement_plans
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete quality improvement plans" ON quality_improvement_plans
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Quality reports policies
CREATE POLICY "Users can view their own quality reports" ON quality_reports
    FOR SELECT USING (practitioner_id = auth.uid() OR practitioner_id IS NULL);

CREATE POLICY "Users can insert their own quality reports" ON quality_reports
    FOR INSERT WITH CHECK (practitioner_id = auth.uid() OR practitioner_id IS NULL);

CREATE POLICY "Users can update their own quality reports" ON quality_reports
    FOR UPDATE USING (practitioner_id = auth.uid() OR practitioner_id IS NULL);

CREATE POLICY "Users can delete their own quality reports" ON quality_reports
    FOR DELETE USING (practitioner_id = auth.uid() OR practitioner_id IS NULL);

-- Functions for Quality Measures

-- Function to calculate quality measure performance
CREATE OR REPLACE FUNCTION calculate_quality_measure_performance(
    p_measure_id UUID,
    p_practitioner_id UUID,
    p_period_start DATE,
    p_period_end DATE
)
RETURNS TABLE (
    measure_id UUID,
    practitioner_id UUID,
    numerator_value INTEGER,
    denominator_value INTEGER,
    exclusion_value INTEGER,
    performance_rate DECIMAL(5,2),
    meets_criteria BOOLEAN
) AS $$
DECLARE
    v_numerator INTEGER := 0;
    v_denominator INTEGER := 0;
    v_exclusion INTEGER := 0;
    v_performance_rate DECIMAL(5,2) := 0.00;
    v_meets_criteria BOOLEAN := FALSE;
BEGIN
    -- Calculate numerator, denominator, and exclusions
    SELECT 
        COALESCE(SUM(numerator_value), 0),
        COALESCE(SUM(denominator_value), 0),
        COALESCE(SUM(exclusion_value), 0)
    INTO 
        v_numerator,
        v_denominator,
        v_exclusion
    FROM patient_quality_measures
    WHERE measure_id = p_measure_id
    AND practitioner_id = p_practitioner_id
    AND measurement_period_start >= p_period_start
    AND measurement_period_end <= p_period_end;
    
    -- Calculate performance rate
    IF v_denominator > 0 THEN
        v_performance_rate := (v_numerator::DECIMAL / v_denominator::DECIMAL) * 100;
    END IF;
    
    -- Determine if meets criteria (assuming 80% threshold)
    v_meets_criteria := v_performance_rate >= 80.0;
    
    RETURN QUERY
    SELECT 
        p_measure_id,
        p_practitioner_id,
        v_numerator,
        v_denominator,
        v_exclusion,
        v_performance_rate,
        v_meets_criteria;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate performance analytics
CREATE OR REPLACE FUNCTION generate_performance_analytics(
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
        'total_patients', (
            SELECT COUNT(DISTINCT patient_id) FROM patient_quality_measures
            WHERE measurement_period_start >= v_start_date
            AND (p_practitioner_id IS NULL OR practitioner_id = p_practitioner_id)
        ),
        'total_encounters', (
            SELECT COUNT(*) FROM fhir_encounters
            WHERE start_time >= v_start_date
            AND (p_practitioner_id IS NULL OR practitioner_id = p_practitioner_id)
        ),
        'quality_measures_performance', (
            SELECT jsonb_object_agg(
                qm.measure_name,
                jsonb_build_object(
                    'numerator', COALESCE(SUM(pqm.numerator_value), 0),
                    'denominator', COALESCE(SUM(pqm.denominator_value), 0),
                    'performance_rate', 
                        CASE 
                            WHEN COALESCE(SUM(pqm.denominator_value), 0) > 0 THEN 
                                COALESCE(SUM(pqm.numerator_value), 0)::DECIMAL / COALESCE(SUM(pqm.denominator_value), 0)::DECIMAL * 100
                            ELSE 0
                        END
                )
            )
            FROM quality_measures qm
            LEFT JOIN patient_quality_measures pqm ON qm.id = pqm.measure_id
            WHERE pqm.measurement_period_start >= v_start_date
            AND (p_practitioner_id IS NULL OR pqm.practitioner_id = p_practitioner_id)
            GROUP BY qm.id, qm.measure_name
        ),
        'hedis_performance', (
            SELECT jsonb_object_agg(
                hm.measure_name,
                jsonb_build_object(
                    'numerator', COALESCE(SUM(hr.numerator_value), 0),
                    'denominator', COALESCE(SUM(hr.denominator_value), 0),
                    'performance_rate', 
                        CASE 
                            WHEN COALESCE(SUM(hr.denominator_value), 0) > 0 THEN 
                                COALESCE(SUM(hr.numerator_value), 0)::DECIMAL / COALESCE(SUM(hr.denominator_value), 0)::DECIMAL * 100
                            ELSE 0
                        END
                )
            )
            FROM hedis_measures hm
            LEFT JOIN hedis_reporting hr ON hm.id = hr.hedis_measure_id
            WHERE hr.reporting_period_start >= v_start_date
            AND (p_practitioner_id IS NULL OR hr.practitioner_id = p_practitioner_id)
            GROUP BY hm.id, hm.measure_name
        ),
        'cms_performance', (
            SELECT jsonb_object_agg(
                reporting_type,
                jsonb_build_object(
                    'total_reports', COUNT(*),
                    'average_score', AVG(overall_score),
                    'payment_adjustment', AVG(payment_adjustment)
                )
            )
            FROM cms_quality_reporting
            WHERE reporting_period_start >= v_start_date
            AND (p_practitioner_id IS NULL OR practitioner_id = p_practitioner_id)
            GROUP BY reporting_type
        ),
        'outcome_measures', (
            SELECT jsonb_object_agg(
                outcome_measure,
                jsonb_build_object(
                    'total_patients', COUNT(DISTINCT patient_id),
                    'average_improvement', AVG(improvement_percentage),
                    'goal_achievement_rate', 
                        CASE 
                            WHEN COUNT(*) > 0 THEN 
                                COUNT(CASE WHEN goal_achieved = TRUE THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                            ELSE 0
                        END
                )
            )
            FROM outcome_tracking
            WHERE current_date >= v_start_date
            AND (p_practitioner_id IS NULL OR practitioner_id = p_practitioner_id)
            GROUP BY outcome_measure
        ),
        'benchmark_comparison', (
            SELECT jsonb_build_object(
                'national_average', 75.0, -- Mock data
                'state_average', 78.0, -- Mock data
                'peer_average', 82.0, -- Mock data
                'practice_performance', AVG(overall_score)
            )
            FROM quality_measure_reporting
            WHERE reporting_period_start >= v_start_date
            AND (p_practitioner_id IS NULL OR practitioner_id = p_practitioner_id)
        ),
        'trend_analysis', (
            SELECT jsonb_build_object(
                'performance_trend', 'improving', -- Mock data
                'trend_percentage', 5.2, -- Mock data
                'monthly_variation', 2.1 -- Mock data
            )
        )
    ) INTO v_analytics;
    
    RETURN v_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update performance analytics
CREATE OR REPLACE FUNCTION update_performance_analytics(
    p_analysis_date DATE DEFAULT CURRENT_DATE,
    p_analysis_period_months INTEGER DEFAULT 12,
    p_practitioner_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_analytics JSONB;
BEGIN
    SELECT generate_performance_analytics(p_analysis_date, p_analysis_period_months, p_practitioner_id) INTO v_analytics;
    
    INSERT INTO performance_analytics (
        analysis_date,
        analysis_period_months,
        practitioner_id,
        total_patients,
        total_encounters,
        quality_measures_performance,
        hedis_performance,
        cms_performance,
        outcome_measures,
        benchmark_comparison,
        trend_analysis
    ) VALUES (
        p_analysis_date,
        p_analysis_period_months,
        p_practitioner_id,
        (v_analytics->>'total_patients')::INTEGER,
        (v_analytics->>'total_encounters')::INTEGER,
        v_analytics->'quality_measures_performance',
        v_analytics->'hedis_performance',
        v_analytics->'cms_performance',
        v_analytics->'outcome_measures',
        v_analytics->'benchmark_comparison',
        v_analytics->'trend_analysis'
    )
    ON CONFLICT (analysis_date, practitioner_id) 
    DO UPDATE SET
        analysis_period_months = EXCLUDED.analysis_period_months,
        total_patients = EXCLUDED.total_patients,
        total_encounters = EXCLUDED.total_encounters,
        quality_measures_performance = EXCLUDED.quality_measures_performance,
        hedis_performance = EXCLUDED.hedis_performance,
        cms_performance = EXCLUDED.cms_performance,
        outcome_measures = EXCLUDED.outcome_measures,
        benchmark_comparison = EXCLUDED.benchmark_comparison,
        trend_analysis = EXCLUDED.trend_analysis,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics when new quality measure is added
CREATE OR REPLACE FUNCTION trigger_update_performance_analytics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_performance_analytics();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER performance_analytics_trigger
    AFTER INSERT OR UPDATE ON patient_quality_measures
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_performance_analytics();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quality_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quality_measure_categories_updated_at
    BEFORE UPDATE ON quality_measure_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_quality_updated_at();

CREATE TRIGGER quality_measures_updated_at
    BEFORE UPDATE ON quality_measures
    FOR EACH ROW
    EXECUTE FUNCTION update_quality_updated_at();

CREATE TRIGGER patient_quality_measures_updated_at
    BEFORE UPDATE ON patient_quality_measures
    FOR EACH ROW
    EXECUTE FUNCTION update_quality_updated_at();

CREATE TRIGGER quality_measure_reporting_updated_at
    BEFORE UPDATE ON quality_measure_reporting
    FOR EACH ROW
    EXECUTE FUNCTION update_quality_updated_at();

CREATE TRIGGER hedis_measures_updated_at
    BEFORE UPDATE ON hedis_measures
    FOR EACH ROW
    EXECUTE FUNCTION update_quality_updated_at();

CREATE TRIGGER hedis_reporting_updated_at
    BEFORE UPDATE ON hedis_reporting
    FOR EACH ROW
    EXECUTE FUNCTION update_quality_updated_at();

CREATE TRIGGER cms_quality_reporting_updated_at
    BEFORE UPDATE ON cms_quality_reporting
    FOR EACH ROW
    EXECUTE FUNCTION update_quality_updated_at();

CREATE TRIGGER performance_analytics_updated_at
    BEFORE UPDATE ON performance_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_quality_updated_at();

CREATE TRIGGER outcome_tracking_updated_at
    BEFORE UPDATE ON outcome_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_quality_updated_at();

CREATE TRIGGER quality_improvement_plans_updated_at
    BEFORE UPDATE ON quality_improvement_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_quality_updated_at();

CREATE TRIGGER quality_reports_updated_at
    BEFORE UPDATE ON quality_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_quality_updated_at();


