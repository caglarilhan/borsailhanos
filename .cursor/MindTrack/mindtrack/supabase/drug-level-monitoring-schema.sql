-- Drug Level Monitoring Schema
-- Comprehensive drug level monitoring for psychiatric medications

-- Drug level monitoring tests
CREATE TABLE IF NOT EXISTS drug_level_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    test_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    test_type VARCHAR(50) NOT NULL, -- 'trough', 'peak', 'random', 'steady_state'
    collection_time TIMESTAMP WITH TIME ZONE NOT NULL,
    last_dose_time TIMESTAMP WITH TIME ZONE,
    last_dose_amount DECIMAL(10,2),
    dose_frequency VARCHAR(50), -- 'daily', 'twice_daily', 'three_times_daily', etc.
    test_result DECIMAL(10,3) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- 'ng/mL', 'mcg/mL', 'mg/L', etc.
    therapeutic_range_min DECIMAL(10,3),
    therapeutic_range_max DECIMAL(10,3),
    toxic_range_min DECIMAL(10,3),
    toxic_range_max DECIMAL(10,3),
    is_therapeutic BOOLEAN GENERATED ALWAYS AS (
        test_result >= therapeutic_range_min AND test_result <= therapeutic_range_max
    ) STORED,
    is_subtherapeutic BOOLEAN GENERATED ALWAYS AS (
        test_result < therapeutic_range_min
    ) STORED,
    is_toxic BOOLEAN GENERATED ALWAYS AS (
        test_result > toxic_range_max
    ) STORED,
    interpretation TEXT,
    clinical_action TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    lab_name VARCHAR(255),
    lab_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drug level monitoring schedules
CREATE TABLE IF NOT EXISTS drug_level_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    schedule_type VARCHAR(50) NOT NULL, -- 'routine', 'dose_adjustment', 'toxicity_monitoring', 'efficacy_monitoring'
    frequency_days INTEGER NOT NULL DEFAULT 7, -- days between tests
    next_test_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    monitoring_reason TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drug level alerts
CREATE TABLE IF NOT EXISTS drug_level_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    test_id UUID REFERENCES drug_level_tests(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'subtherapeutic', 'toxic', 'missing_test', 'schedule_overdue'
    severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    alert_message TEXT NOT NULL,
    clinical_recommendation TEXT,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drug level trends and analytics
CREATE TABLE IF NOT EXISTS drug_level_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    analysis_date DATE NOT NULL,
    time_period_days INTEGER NOT NULL DEFAULT 30,
    total_tests INTEGER NOT NULL DEFAULT 0,
    therapeutic_tests INTEGER NOT NULL DEFAULT 0,
    subtherapeutic_tests INTEGER NOT NULL DEFAULT 0,
    toxic_tests INTEGER NOT NULL DEFAULT 0,
    average_level DECIMAL(10,3),
    min_level DECIMAL(10,3),
    max_level DECIMAL(10,3),
    level_variability DECIMAL(10,3), -- coefficient of variation
    adherence_score DECIMAL(5,2), -- percentage
    dose_adjustments INTEGER DEFAULT 0,
    clinical_outcomes TEXT, -- 'improved', 'stable', 'worsened'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_drug_level_tests_patient_id ON drug_level_tests(patient_id);
CREATE INDEX IF NOT EXISTS idx_drug_level_tests_medication_id ON drug_level_tests(medication_id);
CREATE INDEX IF NOT EXISTS idx_drug_level_tests_test_date ON drug_level_tests(test_date);
CREATE INDEX IF NOT EXISTS idx_drug_level_tests_result ON drug_level_tests(test_result);
CREATE INDEX IF NOT EXISTS idx_drug_level_tests_therapeutic ON drug_level_tests(is_therapeutic);
CREATE INDEX IF NOT EXISTS idx_drug_level_tests_toxic ON drug_level_tests(is_toxic);

CREATE INDEX IF NOT EXISTS idx_drug_level_schedules_patient_id ON drug_level_schedules(patient_id);
CREATE INDEX IF NOT EXISTS idx_drug_level_schedules_medication_id ON drug_level_schedules(medication_id);
CREATE INDEX IF NOT EXISTS idx_drug_level_schedules_next_test ON drug_level_schedules(next_test_date);
CREATE INDEX IF NOT EXISTS idx_drug_level_schedules_active ON drug_level_schedules(is_active);

CREATE INDEX IF NOT EXISTS idx_drug_level_alerts_patient_id ON drug_level_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_drug_level_alerts_medication_id ON drug_level_alerts(medication_id);
CREATE INDEX IF NOT EXISTS idx_drug_level_alerts_type ON drug_level_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_drug_level_alerts_severity ON drug_level_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_drug_level_alerts_acknowledged ON drug_level_alerts(is_acknowledged);
CREATE INDEX IF NOT EXISTS idx_drug_level_alerts_resolved ON drug_level_alerts(resolved);

CREATE INDEX IF NOT EXISTS idx_drug_level_analytics_patient_id ON drug_level_analytics(patient_id);
CREATE INDEX IF NOT EXISTS idx_drug_level_analytics_medication_id ON drug_level_analytics(medication_id);
CREATE INDEX IF NOT EXISTS idx_drug_level_analytics_date ON drug_level_analytics(analysis_date);

-- RLS Policies
ALTER TABLE drug_level_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_level_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_level_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_level_analytics ENABLE ROW LEVEL SECURITY;

-- Drug level tests policies
CREATE POLICY "Users can view drug level tests for their clients" ON drug_level_tests
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert drug level tests for their clients" ON drug_level_tests
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update drug level tests for their clients" ON drug_level_tests
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete drug level tests for their clients" ON drug_level_tests
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Drug level schedules policies
CREATE POLICY "Users can view drug level schedules for their clients" ON drug_level_schedules
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert drug level schedules for their clients" ON drug_level_schedules
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update drug level schedules for their clients" ON drug_level_schedules
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete drug level schedules for their clients" ON drug_level_schedules
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Drug level alerts policies
CREATE POLICY "Users can view drug level alerts for their clients" ON drug_level_alerts
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert drug level alerts for their clients" ON drug_level_alerts
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update drug level alerts for their clients" ON drug_level_alerts
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete drug level alerts for their clients" ON drug_level_alerts
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Drug level analytics policies
CREATE POLICY "Users can view drug level analytics for their clients" ON drug_level_analytics
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert drug level analytics for their clients" ON drug_level_analytics
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update drug level analytics for their clients" ON drug_level_analytics
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete drug level analytics for their clients" ON drug_level_analytics
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Functions for drug level monitoring

-- Function to calculate drug level trends
CREATE OR REPLACE FUNCTION calculate_drug_level_trends(
    p_patient_id UUID,
    p_medication_id UUID,
    p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    average_level DECIMAL(10,3),
    min_level DECIMAL(10,3),
    max_level DECIMAL(10,3),
    level_variability DECIMAL(10,3),
    therapeutic_percentage DECIMAL(5,2),
    trend_direction VARCHAR(20)
) AS $$
DECLARE
    v_start_date TIMESTAMP WITH TIME ZONE;
BEGIN
    v_start_date := NOW() - INTERVAL '1 day' * p_days_back;
    
    RETURN QUERY
    WITH level_data AS (
        SELECT 
            test_result,
            test_date,
            therapeutic_range_min,
            therapeutic_range_max,
            CASE 
                WHEN test_result >= therapeutic_range_min AND test_result <= therapeutic_range_max 
                THEN 1 ELSE 0 
            END as is_therapeutic
        FROM drug_level_tests
        WHERE patient_id = p_patient_id
        AND medication_id = p_medication_id
        AND test_date >= v_start_date
        ORDER BY test_date
    ),
    stats AS (
        SELECT 
            AVG(test_result) as avg_level,
            MIN(test_result) as min_level,
            MAX(test_result) as max_level,
            STDDEV(test_result) as std_dev,
            AVG(is_therapeutic::DECIMAL) * 100 as therapeutic_pct,
            COUNT(*) as test_count
        FROM level_data
    ),
    trend AS (
        SELECT 
            CASE 
                WHEN COUNT(*) < 2 THEN 'insufficient_data'
                WHEN AVG(CASE WHEN test_date >= NOW() - INTERVAL '7 days' THEN test_result END) > 
                     AVG(CASE WHEN test_date < NOW() - INTERVAL '7 days' THEN test_result END) 
                THEN 'increasing'
                WHEN AVG(CASE WHEN test_date >= NOW() - INTERVAL '7 days' THEN test_result END) < 
                     AVG(CASE WHEN test_date < NOW() - INTERVAL '7 days' THEN test_result END) 
                THEN 'decreasing'
                ELSE 'stable'
            END as direction
        FROM level_data
    )
    SELECT 
        stats.avg_level,
        stats.min_level,
        stats.max_level,
        CASE 
            WHEN stats.avg_level > 0 THEN (stats.std_dev / stats.avg_level) * 100
            ELSE 0
        END as variability,
        stats.therapeutic_pct,
        trend.direction
    FROM stats, trend;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create drug level alerts
CREATE OR REPLACE FUNCTION create_drug_level_alert(
    p_patient_id UUID,
    p_medication_id UUID,
    p_test_id UUID DEFAULT NULL,
    p_alert_type VARCHAR(50),
    p_severity VARCHAR(20) DEFAULT 'medium',
    p_message TEXT,
    p_recommendation TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_alert_id UUID;
BEGIN
    INSERT INTO drug_level_alerts (
        patient_id,
        medication_id,
        test_id,
        alert_type,
        severity,
        alert_message,
        clinical_recommendation
    ) VALUES (
        p_patient_id,
        p_medication_id,
        p_test_id,
        p_alert_type,
        p_severity,
        p_message,
        p_recommendation
    ) RETURNING id INTO v_alert_id;
    
    RETURN v_alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update drug level analytics
CREATE OR REPLACE FUNCTION update_drug_level_analytics(
    p_patient_id UUID,
    p_medication_id UUID,
    p_analysis_date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID AS $$
DECLARE
    v_days_back INTEGER := 30;
    v_start_date DATE := p_analysis_date - INTERVAL '1 day' * v_days_back;
BEGIN
    INSERT INTO drug_level_analytics (
        patient_id,
        medication_id,
        analysis_date,
        time_period_days,
        total_tests,
        therapeutic_tests,
        subtherapeutic_tests,
        toxic_tests,
        average_level,
        min_level,
        max_level,
        level_variability,
        adherence_score
    )
    SELECT 
        p_patient_id,
        p_medication_id,
        p_analysis_date,
        v_days_back,
        COUNT(*),
        COUNT(*) FILTER (WHERE is_therapeutic),
        COUNT(*) FILTER (WHERE is_subtherapeutic),
        COUNT(*) FILTER (WHERE is_toxic),
        AVG(test_result),
        MIN(test_result),
        MAX(test_result),
        CASE 
            WHEN AVG(test_result) > 0 THEN (STDDEV(test_result) / AVG(test_result)) * 100
            ELSE 0
        END,
        85.0 -- Placeholder adherence score
    FROM drug_level_tests
    WHERE patient_id = p_patient_id
    AND medication_id = p_medication_id
    AND test_date::DATE >= v_start_date
    AND test_date::DATE <= p_analysis_date
    ON CONFLICT (patient_id, medication_id, analysis_date) 
    DO UPDATE SET
        total_tests = EXCLUDED.total_tests,
        therapeutic_tests = EXCLUDED.therapeutic_tests,
        subtherapeutic_tests = EXCLUDED.subtherapeutic_tests,
        toxic_tests = EXCLUDED.toxic_tests,
        average_level = EXCLUDED.average_level,
        min_level = EXCLUDED.min_level,
        max_level = EXCLUDED.max_level,
        level_variability = EXCLUDED.level_variability,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics when new test is added
CREATE OR REPLACE FUNCTION trigger_update_drug_level_analytics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_drug_level_analytics(NEW.patient_id, NEW.medication_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER drug_level_test_analytics_trigger
    AFTER INSERT OR UPDATE ON drug_level_tests
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_drug_level_analytics();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_drug_level_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER drug_level_tests_updated_at
    BEFORE UPDATE ON drug_level_tests
    FOR EACH ROW
    EXECUTE FUNCTION update_drug_level_updated_at();

CREATE TRIGGER drug_level_schedules_updated_at
    BEFORE UPDATE ON drug_level_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_drug_level_updated_at();

CREATE TRIGGER drug_level_alerts_updated_at
    BEFORE UPDATE ON drug_level_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_drug_level_updated_at();

CREATE TRIGGER drug_level_analytics_updated_at
    BEFORE UPDATE ON drug_level_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_drug_level_updated_at();











