-- Patient Outcome Tracking Schema
-- Comprehensive patient outcome tracking for American psychiatrists

-- Patient outcome measures
CREATE TABLE IF NOT EXISTS patient_outcome_measures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    measure_name VARCHAR(100) NOT NULL, -- 'depression_remission', 'anxiety_improvement', 'functional_recovery', etc.
    measure_category VARCHAR(50) NOT NULL, -- 'clinical', 'functional', 'quality_of_life', 'safety', 'satisfaction'
    measure_type VARCHAR(50) NOT NULL, -- 'binary', 'continuous', 'ordinal', 'categorical'
    baseline_value DECIMAL(10,3),
    baseline_date DATE,
    current_value DECIMAL(10,3) NOT NULL,
    measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_value DECIMAL(10,3),
    target_date DATE,
    improvement_threshold DECIMAL(10,3), -- Minimum change to be considered improvement
    measurement_method VARCHAR(100), -- 'rating_scale', 'clinical_assessment', 'patient_report', 'lab_value'
    measurement_tool VARCHAR(100), -- 'PHQ-9', 'GAD-7', 'SF-36', 'clinical_interview'
    unit_of_measurement VARCHAR(50), -- 'score', 'percentage', 'days', 'count'
    is_achieved BOOLEAN GENERATED ALWAYS AS (
        CASE 
            WHEN target_value IS NULL THEN NULL
            WHEN measure_type = 'binary' THEN current_value = target_value
            WHEN measure_type IN ('continuous', 'ordinal') THEN current_value >= target_value
            ELSE NULL
        END
    ) STORED,
    is_improved BOOLEAN GENERATED ALWAYS AS (
        CASE 
            WHEN baseline_value IS NULL OR improvement_threshold IS NULL THEN NULL
            WHEN measure_type = 'binary' THEN current_value > baseline_value
            WHEN measure_type IN ('continuous', 'ordinal') THEN (current_value - baseline_value) >= improvement_threshold
            ELSE NULL
        END
    ) STORED,
    clinical_significance VARCHAR(50), -- 'clinically_meaningful', 'statistically_significant', 'minimal_change', 'no_change'
    notes TEXT,
    measured_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient outcome goals
CREATE TABLE IF NOT EXISTS patient_outcome_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    goal_name VARCHAR(255) NOT NULL,
    goal_description TEXT,
    goal_category VARCHAR(50) NOT NULL, -- 'clinical', 'functional', 'behavioral', 'social', 'educational'
    goal_type VARCHAR(50) NOT NULL, -- 'short_term', 'medium_term', 'long_term'
    target_date DATE NOT NULL,
    baseline_value DECIMAL(10,3),
    target_value DECIMAL(10,3) NOT NULL,
    measurement_frequency VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'quarterly'
    success_criteria TEXT,
    progress_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_achieved BOOLEAN DEFAULT FALSE,
    achieved_date DATE,
    achievement_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN baseline_value IS NULL OR target_value IS NULL THEN NULL
            WHEN baseline_value = target_value THEN 100.0
            ELSE LEAST(100.0, GREATEST(0.0, ((target_value - baseline_value) / (target_value - baseline_value)) * 100))
        END
    ) STORED,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient outcome tracking sessions
CREATE TABLE IF NOT EXISTS patient_outcome_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    session_type VARCHAR(50) NOT NULL, -- 'initial', 'follow_up', 'crisis', 'discharge', 'annual'
    session_duration_minutes INTEGER,
    primary_diagnosis VARCHAR(255),
    secondary_diagnoses TEXT[],
    session_objectives TEXT[],
    interventions_provided TEXT[],
    outcome_measures_collected TEXT[],
    patient_engagement_level INTEGER CHECK (patient_engagement_level >= 1 AND patient_engagement_level <= 5),
    therapeutic_alliance_rating INTEGER CHECK (therapeutic_alliance_rating >= 1 AND therapeutic_alliance_rating <= 5),
    session_outcome VARCHAR(50), -- 'positive', 'neutral', 'negative', 'mixed'
    clinical_notes TEXT,
    treatment_plan_updates TEXT,
    next_session_date DATE,
    follow_up_required BOOLEAN DEFAULT FALSE,
    crisis_intervention_provided BOOLEAN DEFAULT FALSE,
    medication_changes TEXT,
    referrals_made TEXT[],
    session_conducted_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient outcome analytics
CREATE TABLE IF NOT EXISTS patient_outcome_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    analysis_period_start DATE NOT NULL,
    analysis_period_end DATE NOT NULL,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    total_outcome_measures INTEGER NOT NULL DEFAULT 0,
    total_goals INTEGER NOT NULL DEFAULT 0,
    achieved_goals INTEGER NOT NULL DEFAULT 0,
    goal_achievement_rate DECIMAL(5,2),
    average_session_duration DECIMAL(8,2),
    average_engagement_level DECIMAL(3,2),
    average_therapeutic_alliance DECIMAL(3,2),
    positive_session_rate DECIMAL(5,2),
    crisis_intervention_rate DECIMAL(5,2),
    medication_adherence_rate DECIMAL(5,2),
    functional_improvement_rate DECIMAL(5,2),
    quality_of_life_improvement DECIMAL(5,2),
    symptom_reduction_rate DECIMAL(5,2),
    readmission_rate DECIMAL(5,2),
    emergency_visit_rate DECIMAL(5,2),
    cost_per_session DECIMAL(10,2),
    cost_per_outcome DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Population health outcomes
CREATE TABLE IF NOT EXISTS population_health_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_id UUID REFERENCES practices(id),
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis_period_months INTEGER NOT NULL DEFAULT 12,
    total_patients INTEGER NOT NULL DEFAULT 0,
    active_patients INTEGER NOT NULL DEFAULT 0,
    new_patients INTEGER NOT NULL DEFAULT 0,
    discharged_patients INTEGER NOT NULL DEFAULT 0,
    average_age DECIMAL(5,2),
    gender_distribution JSONB, -- {'male': 45, 'female': 55, 'other': 0}
    diagnosis_distribution JSONB, -- {'depression': 40, 'anxiety': 30, 'bipolar': 15}
    outcome_measures_collected INTEGER NOT NULL DEFAULT 0,
    goal_achievement_rate DECIMAL(5,2),
    average_session_duration DECIMAL(8,2),
    patient_satisfaction_score DECIMAL(3,2),
    clinical_outcome_scores JSONB, -- Average scores by measure type
    functional_recovery_rate DECIMAL(5,2),
    quality_of_life_improvement DECIMAL(5,2),
    readmission_rate DECIMAL(5,2),
    emergency_visit_rate DECIMAL(5,2),
    cost_per_patient DECIMAL(10,2),
    cost_per_outcome DECIMAL(10,2),
    quality_measures JSONB, -- CMS, NCQA, HEDIS measures
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient outcome alerts
CREATE TABLE IF NOT EXISTS patient_outcome_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'goal_not_met', 'deterioration', 'crisis_risk', 'missed_session', 'medication_nonadherence'
    alert_severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    alert_message TEXT NOT NULL,
    trigger_condition TEXT,
    current_value DECIMAL(10,3),
    threshold_value DECIMAL(10,3),
    alert_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    follow_up_required BOOLEAN DEFAULT TRUE,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patient_outcome_measures_patient_id ON patient_outcome_measures(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_outcome_measures_name ON patient_outcome_measures(measure_name);
CREATE INDEX IF NOT EXISTS idx_patient_outcome_measures_category ON patient_outcome_measures(measure_category);
CREATE INDEX IF NOT EXISTS idx_patient_outcome_measures_date ON patient_outcome_measures(measurement_date);
CREATE INDEX IF NOT EXISTS idx_patient_outcome_measures_achieved ON patient_outcome_measures(is_achieved);

CREATE INDEX IF NOT EXISTS idx_patient_outcome_goals_patient_id ON patient_outcome_goals(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_outcome_goals_category ON patient_outcome_goals(goal_category);
CREATE INDEX IF NOT EXISTS idx_patient_outcome_goals_type ON patient_outcome_goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_patient_outcome_goals_target_date ON patient_outcome_goals(target_date);
CREATE INDEX IF NOT EXISTS idx_patient_outcome_goals_active ON patient_outcome_goals(is_active);
CREATE INDEX IF NOT EXISTS idx_patient_outcome_goals_achieved ON patient_outcome_goals(is_achieved);

CREATE INDEX IF NOT EXISTS idx_patient_outcome_sessions_patient_id ON patient_outcome_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_outcome_sessions_date ON patient_outcome_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_patient_outcome_sessions_type ON patient_outcome_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_patient_outcome_sessions_outcome ON patient_outcome_sessions(session_outcome);

CREATE INDEX IF NOT EXISTS idx_patient_outcome_analytics_patient_id ON patient_outcome_analytics(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_outcome_analytics_period ON patient_outcome_analytics(analysis_period_start, analysis_period_end);

CREATE INDEX IF NOT EXISTS idx_population_health_outcomes_practice_id ON population_health_outcomes(practice_id);
CREATE INDEX IF NOT EXISTS idx_population_health_outcomes_date ON population_health_outcomes(analysis_date);

CREATE INDEX IF NOT EXISTS idx_patient_outcome_alerts_patient_id ON patient_outcome_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_outcome_alerts_type ON patient_outcome_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_patient_outcome_alerts_severity ON patient_outcome_alerts(alert_severity);
CREATE INDEX IF NOT EXISTS idx_patient_outcome_alerts_acknowledged ON patient_outcome_alerts(is_acknowledged);
CREATE INDEX IF NOT EXISTS idx_patient_outcome_alerts_resolved ON patient_outcome_alerts(is_resolved);

-- RLS Policies
ALTER TABLE patient_outcome_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_outcome_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_outcome_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_outcome_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE population_health_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_outcome_alerts ENABLE ROW LEVEL SECURITY;

-- Patient outcome measures policies
CREATE POLICY "Users can view outcome measures for their clients" ON patient_outcome_measures
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert outcome measures for their clients" ON patient_outcome_measures
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update outcome measures for their clients" ON patient_outcome_measures
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete outcome measures for their clients" ON patient_outcome_measures
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Patient outcome goals policies
CREATE POLICY "Users can view outcome goals for their clients" ON patient_outcome_goals
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert outcome goals for their clients" ON patient_outcome_goals
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update outcome goals for their clients" ON patient_outcome_goals
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete outcome goals for their clients" ON patient_outcome_goals
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Patient outcome sessions policies
CREATE POLICY "Users can view outcome sessions for their clients" ON patient_outcome_sessions
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert outcome sessions for their clients" ON patient_outcome_sessions
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update outcome sessions for their clients" ON patient_outcome_sessions
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete outcome sessions for their clients" ON patient_outcome_sessions
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Patient outcome analytics policies
CREATE POLICY "Users can view outcome analytics for their clients" ON patient_outcome_analytics
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert outcome analytics for their clients" ON patient_outcome_analytics
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update outcome analytics for their clients" ON patient_outcome_analytics
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete outcome analytics for their clients" ON patient_outcome_analytics
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Population health outcomes policies (practice-level access)
CREATE POLICY "Users can view population health outcomes for their practice" ON population_health_outcomes
    FOR SELECT USING (
        practice_id IN (
            SELECT id FROM practices WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert population health outcomes for their practice" ON population_health_outcomes
    FOR INSERT WITH CHECK (
        practice_id IN (
            SELECT id FROM practices WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update population health outcomes for their practice" ON population_health_outcomes
    FOR UPDATE USING (
        practice_id IN (
            SELECT id FROM practices WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete population health outcomes for their practice" ON population_health_outcomes
    FOR DELETE USING (
        practice_id IN (
            SELECT id FROM practices WHERE owner_id = auth.uid()
        )
    );

-- Patient outcome alerts policies
CREATE POLICY "Users can view outcome alerts for their clients" ON patient_outcome_alerts
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert outcome alerts for their clients" ON patient_outcome_alerts
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update outcome alerts for their clients" ON patient_outcome_alerts
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete outcome alerts for their clients" ON patient_outcome_alerts
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Functions for patient outcome tracking

-- Function to calculate patient outcome metrics
CREATE OR REPLACE FUNCTION calculate_patient_outcome_metrics(
    p_patient_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_sessions BIGINT,
    total_outcome_measures BIGINT,
    total_goals BIGINT,
    achieved_goals BIGINT,
    goal_achievement_rate DECIMAL(5,2),
    average_session_duration DECIMAL(8,2),
    average_engagement_level DECIMAL(3,2),
    average_therapeutic_alliance DECIMAL(3,2),
    positive_session_rate DECIMAL(5,2),
    crisis_intervention_rate DECIMAL(5,2),
    functional_improvement_rate DECIMAL(5,2),
    quality_of_life_improvement DECIMAL(5,2),
    symptom_reduction_rate DECIMAL(5,2)
) AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
BEGIN
    v_start_date := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '1 year');
    v_end_date := COALESCE(p_end_date, CURRENT_DATE);
    
    RETURN QUERY
    WITH session_data AS (
        SELECT 
            COUNT(*) as total_sessions,
            AVG(session_duration_minutes) as avg_duration,
            AVG(patient_engagement_level) as avg_engagement,
            AVG(therapeutic_alliance_rating) as avg_alliance,
            COUNT(*) FILTER (WHERE session_outcome = 'positive') as positive_sessions,
            COUNT(*) FILTER (WHERE crisis_intervention_provided) as crisis_sessions
        FROM patient_outcome_sessions
        WHERE patient_id = p_patient_id
        AND session_date BETWEEN v_start_date AND v_end_date
    ),
    outcome_data AS (
        SELECT 
            COUNT(*) as total_measures,
            COUNT(*) FILTER (WHERE is_improved) as improved_measures,
            COUNT(*) FILTER (WHERE measure_category = 'functional') as functional_measures,
            COUNT(*) FILTER (WHERE measure_category = 'quality_of_life') as qol_measures,
            COUNT(*) FILTER (WHERE measure_category = 'clinical') as clinical_measures
        FROM patient_outcome_measures
        WHERE patient_id = p_patient_id
        AND measurement_date BETWEEN v_start_date AND v_end_date
    ),
    goal_data AS (
        SELECT 
            COUNT(*) as total_goals,
            COUNT(*) FILTER (WHERE is_achieved) as achieved_goals
        FROM patient_outcome_goals
        WHERE patient_id = p_patient_id
        AND created_at::DATE BETWEEN v_start_date AND v_end_date
    )
    SELECT 
        session_data.total_sessions,
        outcome_data.total_measures,
        goal_data.total_goals,
        goal_data.achieved_goals,
        CASE WHEN goal_data.total_goals > 0 THEN (goal_data.achieved_goals::DECIMAL / goal_data.total_goals) * 100 ELSE 0 END,
        session_data.avg_duration,
        session_data.avg_engagement,
        session_data.avg_alliance,
        CASE WHEN session_data.total_sessions > 0 THEN (session_data.positive_sessions::DECIMAL / session_data.total_sessions) * 100 ELSE 0 END,
        CASE WHEN session_data.total_sessions > 0 THEN (session_data.crisis_sessions::DECIMAL / session_data.total_sessions) * 100 ELSE 0 END,
        CASE WHEN outcome_data.functional_measures > 0 THEN (outcome_data.improved_measures::DECIMAL / outcome_data.functional_measures) * 100 ELSE 0 END,
        CASE WHEN outcome_data.qol_measures > 0 THEN (outcome_data.improved_measures::DECIMAL / outcome_data.qol_measures) * 100 ELSE 0 END,
        CASE WHEN outcome_data.clinical_measures > 0 THEN (outcome_data.improved_measures::DECIMAL / outcome_data.clinical_measures) * 100 ELSE 0 END
    FROM session_data, outcome_data, goal_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate patient outcome report
CREATE OR REPLACE FUNCTION generate_patient_outcome_report(
    p_patient_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_report JSONB;
BEGIN
    v_start_date := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '1 year');
    v_end_date := COALESCE(p_end_date, CURRENT_DATE);
    
    SELECT jsonb_build_object(
        'patient_id', p_patient_id,
        'report_period', jsonb_build_object(
            'start_date', v_start_date,
            'end_date', v_end_date
        ),
        'metrics', (
            SELECT jsonb_build_object(
                'total_sessions', total_sessions,
                'total_outcome_measures', total_outcome_measures,
                'total_goals', total_goals,
                'achieved_goals', achieved_goals,
                'goal_achievement_rate', goal_achievement_rate,
                'average_session_duration', average_session_duration,
                'average_engagement_level', average_engagement_level,
                'average_therapeutic_alliance', average_therapeutic_alliance,
                'positive_session_rate', positive_session_rate,
                'crisis_intervention_rate', crisis_intervention_rate,
                'functional_improvement_rate', functional_improvement_rate,
                'quality_of_life_improvement', quality_of_life_improvement,
                'symptom_reduction_rate', symptom_reduction_rate
            )
            FROM calculate_patient_outcome_metrics(p_patient_id, v_start_date, v_end_date)
        ),
        'outcome_measures', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'measure_name', measure_name,
                    'measure_category', measure_category,
                    'baseline_value', baseline_value,
                    'current_value', current_value,
                    'target_value', target_value,
                    'is_achieved', is_achieved,
                    'is_improved', is_improved,
                    'clinical_significance', clinical_significance,
                    'measurement_date', measurement_date
                )
            )
            FROM patient_outcome_measures
            WHERE patient_id = p_patient_id
            AND measurement_date BETWEEN v_start_date AND v_end_date
            ORDER BY measurement_date DESC
        ),
        'goals', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'goal_name', goal_name,
                    'goal_category', goal_category,
                    'goal_type', goal_type,
                    'target_date', target_date,
                    'baseline_value', baseline_value,
                    'target_value', target_value,
                    'is_achieved', is_achieved,
                    'achievement_percentage', achievement_percentage,
                    'progress_notes', progress_notes
                )
            )
            FROM patient_outcome_goals
            WHERE patient_id = p_patient_id
            AND created_at::DATE BETWEEN v_start_date AND v_end_date
            ORDER BY target_date ASC
        ),
        'sessions', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'session_date', session_date,
                    'session_type', session_type,
                    'session_duration_minutes', session_duration_minutes,
                    'patient_engagement_level', patient_engagement_level,
                    'therapeutic_alliance_rating', therapeutic_alliance_rating,
                    'session_outcome', session_outcome,
                    'primary_diagnosis', primary_diagnosis,
                    'clinical_notes', clinical_notes
                )
            )
            FROM patient_outcome_sessions
            WHERE patient_id = p_patient_id
            AND session_date BETWEEN v_start_date AND v_end_date
            ORDER BY session_date DESC
        )
    ) INTO v_report;
    
    RETURN v_report;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update patient outcome analytics
CREATE OR REPLACE FUNCTION update_patient_outcome_analytics(
    p_patient_id UUID,
    p_analysis_period_start DATE DEFAULT CURRENT_DATE - INTERVAL '1 year',
    p_analysis_period_end DATE DEFAULT CURRENT_DATE
)
RETURNS VOID AS $$
DECLARE
    v_metrics RECORD;
BEGIN
    SELECT * FROM calculate_patient_outcome_metrics(
        p_patient_id, 
        p_analysis_period_start, 
        p_analysis_period_end
    ) INTO v_metrics;
    
    INSERT INTO patient_outcome_analytics (
        patient_id,
        analysis_period_start,
        analysis_period_end,
        total_sessions,
        total_outcome_measures,
        total_goals,
        achieved_goals,
        goal_achievement_rate,
        average_session_duration,
        average_engagement_level,
        average_therapeutic_alliance,
        positive_session_rate,
        crisis_intervention_rate,
        functional_improvement_rate,
        quality_of_life_improvement,
        symptom_reduction_rate
    ) VALUES (
        p_patient_id,
        p_analysis_period_start,
        p_analysis_period_end,
        v_metrics.total_sessions,
        v_metrics.total_outcome_measures,
        v_metrics.total_goals,
        v_metrics.achieved_goals,
        v_metrics.goal_achievement_rate,
        v_metrics.average_session_duration,
        v_metrics.average_engagement_level,
        v_metrics.average_therapeutic_alliance,
        v_metrics.positive_session_rate,
        v_metrics.crisis_intervention_rate,
        v_metrics.functional_improvement_rate,
        v_metrics.quality_of_life_improvement,
        v_metrics.symptom_reduction_rate
    )
    ON CONFLICT (patient_id, analysis_period_start, analysis_period_end) 
    DO UPDATE SET
        total_sessions = EXCLUDED.total_sessions,
        total_outcome_measures = EXCLUDED.total_outcome_measures,
        total_goals = EXCLUDED.total_goals,
        achieved_goals = EXCLUDED.achieved_goals,
        goal_achievement_rate = EXCLUDED.goal_achievement_rate,
        average_session_duration = EXCLUDED.average_session_duration,
        average_engagement_level = EXCLUDED.average_engagement_level,
        average_therapeutic_alliance = EXCLUDED.average_therapeutic_alliance,
        positive_session_rate = EXCLUDED.positive_session_rate,
        crisis_intervention_rate = EXCLUDED.crisis_intervention_rate,
        functional_improvement_rate = EXCLUDED.functional_improvement_rate,
        quality_of_life_improvement = EXCLUDED.quality_of_life_improvement,
        symptom_reduction_rate = EXCLUDED.symptom_reduction_rate,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics when new outcome measure is added
CREATE OR REPLACE FUNCTION trigger_update_patient_outcome_analytics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_patient_outcome_analytics(NEW.patient_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patient_outcome_analytics_trigger
    AFTER INSERT OR UPDATE ON patient_outcome_measures
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_patient_outcome_analytics();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_patient_outcome_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patient_outcome_measures_updated_at
    BEFORE UPDATE ON patient_outcome_measures
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_outcome_updated_at();

CREATE TRIGGER patient_outcome_goals_updated_at
    BEFORE UPDATE ON patient_outcome_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_outcome_updated_at();

CREATE TRIGGER patient_outcome_sessions_updated_at
    BEFORE UPDATE ON patient_outcome_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_outcome_updated_at();

CREATE TRIGGER patient_outcome_analytics_updated_at
    BEFORE UPDATE ON patient_outcome_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_outcome_updated_at();

CREATE TRIGGER population_health_outcomes_updated_at
    BEFORE UPDATE ON population_health_outcomes
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_outcome_updated_at();

CREATE TRIGGER patient_outcome_alerts_updated_at
    BEFORE UPDATE ON patient_outcome_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_outcome_updated_at();


