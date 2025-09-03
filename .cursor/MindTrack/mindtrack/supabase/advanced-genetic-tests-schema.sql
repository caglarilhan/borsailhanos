-- Advanced Genetic Tests Schema
-- Comprehensive genetic testing management for psychiatric practice

-- Genetic test types and categories
CREATE TABLE IF NOT EXISTS genetic_test_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_name VARCHAR(255) NOT NULL,
    test_category VARCHAR(100) NOT NULL,
    test_description TEXT,
    clinical_indications TEXT[],
    methodology VARCHAR(255),
    turnaround_time_days INTEGER,
    cost_range VARCHAR(100),
    insurance_coverage BOOLEAN DEFAULT false,
    fda_approved BOOLEAN DEFAULT false,
    clinical_utility_score INTEGER CHECK (clinical_utility_score >= 1 AND clinical_utility_score <= 10),
    evidence_level VARCHAR(50),
    references TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient genetic test orders
CREATE TABLE IF NOT EXISTS patient_genetic_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    test_type_id UUID NOT NULL REFERENCES genetic_test_types(id),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    order_status VARCHAR(50) DEFAULT 'pending',
    collection_date TIMESTAMP WITH TIME ZONE,
    lab_id UUID,
    lab_name VARCHAR(255),
    test_cost DECIMAL(10,2),
    insurance_covered BOOLEAN DEFAULT false,
    insurance_coverage_amount DECIMAL(10,2),
    patient_cost DECIMAL(10,2),
    payment_status VARCHAR(50) DEFAULT 'pending',
    clinical_indication TEXT,
    physician_notes TEXT,
    informed_consent_signed BOOLEAN DEFAULT false,
    consent_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Genetic test results
CREATE TABLE IF NOT EXISTS genetic_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_test_id UUID NOT NULL REFERENCES patient_genetic_tests(id) ON DELETE CASCADE,
    result_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    result_status VARCHAR(50) DEFAULT 'pending',
    raw_results JSONB,
    interpreted_results JSONB,
    variant_analysis JSONB,
    risk_assessment JSONB,
    clinical_recommendations TEXT[],
    pharmacogenetic_implications JSONB,
    family_implications TEXT,
    follow_up_recommendations TEXT[],
    result_summary TEXT,
    lab_report_url VARCHAR(500),
    reviewed_by UUID REFERENCES auth.users(id),
    review_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pharmacogenetic variants
CREATE TABLE IF NOT EXISTS pharmacogenetic_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gene_name VARCHAR(100) NOT NULL,
    variant_name VARCHAR(255) NOT NULL,
    rs_id VARCHAR(50),
    chromosome VARCHAR(10),
    position BIGINT,
    reference_allele VARCHAR(10),
    alternate_allele VARCHAR(10),
    variant_type VARCHAR(50),
    clinical_significance VARCHAR(100),
    drug_implications JSONB,
    dosage_recommendations JSONB,
    contraindications TEXT[],
    monitoring_recommendations TEXT[],
    evidence_level VARCHAR(50),
    references TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient genetic variants
CREATE TABLE IF NOT EXISTS patient_genetic_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES pharmacogenetic_variants(id),
    genotype VARCHAR(10),
    allele_frequency DECIMAL(5,4),
    zygosity VARCHAR(20),
    clinical_relevance VARCHAR(100),
    drug_implications JSONB,
    dosage_adjustments JSONB,
    monitoring_required BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Genetic counseling sessions
CREATE TABLE IF NOT EXISTS genetic_counseling_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    counselor_id UUID NOT NULL REFERENCES auth.users(id),
    session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_type VARCHAR(100),
    session_duration_minutes INTEGER,
    session_notes TEXT,
    patient_concerns TEXT[],
    family_history_reviewed BOOLEAN DEFAULT false,
    risk_assessment_discussed BOOLEAN DEFAULT false,
    testing_options_discussed BOOLEAN DEFAULT false,
    informed_consent_discussed BOOLEAN DEFAULT false,
    follow_up_plan TEXT,
    next_session_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Genetic test alerts and notifications
CREATE TABLE IF NOT EXISTS genetic_test_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL,
    alert_message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    action_required BOOLEAN DEFAULT false,
    action_description TEXT,
    alert_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active',
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Genetic test analytics
CREATE TABLE IF NOT EXISTS genetic_test_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_type_id UUID NOT NULL REFERENCES genetic_test_types(id),
    total_orders INTEGER DEFAULT 0,
    positive_results INTEGER DEFAULT 0,
    negative_results INTEGER DEFAULT 0,
    inconclusive_results INTEGER DEFAULT 0,
    average_turnaround_time_days DECIMAL(5,2),
    cost_effectiveness_score DECIMAL(3,2),
    clinical_impact_score DECIMAL(3,2),
    patient_satisfaction_score DECIMAL(3,2),
    analysis_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patient_genetic_tests_patient_id ON patient_genetic_tests(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_genetic_tests_status ON patient_genetic_tests(order_status);
CREATE INDEX IF NOT EXISTS idx_genetic_test_results_patient_test_id ON genetic_test_results(patient_test_id);
CREATE INDEX IF NOT EXISTS idx_genetic_test_results_status ON genetic_test_results(result_status);
CREATE INDEX IF NOT EXISTS idx_patient_genetic_variants_patient_id ON patient_genetic_variants(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_genetic_variants_variant_id ON patient_genetic_variants(variant_id);
CREATE INDEX IF NOT EXISTS idx_genetic_counseling_sessions_patient_id ON genetic_counseling_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_genetic_test_alerts_patient_id ON genetic_test_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_genetic_test_alerts_status ON genetic_test_alerts(status);

-- RLS Policies
ALTER TABLE genetic_test_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_genetic_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE genetic_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacogenetic_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_genetic_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE genetic_counseling_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE genetic_test_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE genetic_test_analytics ENABLE ROW LEVEL SECURITY;

-- Genetic test types policies
CREATE POLICY "Genetic test types viewable by authenticated users" ON genetic_test_types
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Genetic test types insertable by healthcare providers" ON genetic_test_types
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Patient genetic tests policies
CREATE POLICY "Patient genetic tests viewable by patient and provider" ON patient_genetic_tests
    FOR SELECT USING (
        auth.uid() = patient_id OR 
        auth.uid() IN (
            SELECT provider_id FROM patient_providers WHERE patient_id = patient_genetic_tests.patient_id
        )
    );

CREATE POLICY "Patient genetic tests insertable by healthcare providers" ON patient_genetic_tests
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Patient genetic tests updatable by healthcare providers" ON patient_genetic_tests
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Genetic test results policies
CREATE POLICY "Genetic test results viewable by patient and provider" ON genetic_test_results
    FOR SELECT USING (
        auth.uid() IN (
            SELECT patient_id FROM patient_genetic_tests WHERE id = patient_test_id
        ) OR 
        auth.uid() IN (
            SELECT provider_id FROM patient_providers 
            WHERE patient_id IN (
                SELECT patient_id FROM patient_genetic_tests WHERE id = patient_test_id
            )
        )
    );

CREATE POLICY "Genetic test results insertable by healthcare providers" ON genetic_test_results
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Patient genetic variants policies
CREATE POLICY "Patient genetic variants viewable by patient and provider" ON patient_genetic_variants
    FOR SELECT USING (
        auth.uid() = patient_id OR 
        auth.uid() IN (
            SELECT provider_id FROM patient_providers WHERE patient_id = patient_genetic_variants.patient_id
        )
    );

CREATE POLICY "Patient genetic variants insertable by healthcare providers" ON patient_genetic_variants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Genetic counseling sessions policies
CREATE POLICY "Genetic counseling sessions viewable by patient and counselor" ON genetic_counseling_sessions
    FOR SELECT USING (
        auth.uid() = patient_id OR auth.uid() = counselor_id
    );

CREATE POLICY "Genetic counseling sessions insertable by counselors" ON genetic_counseling_sessions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Genetic test alerts policies
CREATE POLICY "Genetic test alerts viewable by patient and provider" ON genetic_test_alerts
    FOR SELECT USING (
        auth.uid() = patient_id OR 
        auth.uid() IN (
            SELECT provider_id FROM patient_providers WHERE patient_id = genetic_test_alerts.patient_id
        )
    );

-- PostgreSQL Functions

-- Function to calculate genetic risk score
CREATE OR REPLACE FUNCTION calculate_genetic_risk_score(
    patient_uuid UUID,
    condition_name VARCHAR(255)
) RETURNS DECIMAL(3,2) AS $$
DECLARE
    risk_score DECIMAL(3,2) := 0.0;
    variant_record RECORD;
BEGIN
    FOR variant_record IN 
        SELECT pv.clinical_relevance, pv.genotype
        FROM patient_genetic_variants pv
        JOIN pharmacogenetic_variants pgv ON pv.variant_id = pgv.id
        WHERE pv.patient_id = patient_uuid
        AND pgv.clinical_significance ILIKE '%' || condition_name || '%'
    LOOP
        -- Calculate risk based on variant type and genotype
        CASE variant_record.clinical_relevance
            WHEN 'high_risk' THEN risk_score := risk_score + 0.3;
            WHEN 'moderate_risk' THEN risk_score := risk_score + 0.2;
            WHEN 'low_risk' THEN risk_score := risk_score + 0.1;
            ELSE risk_score := risk_score + 0.05;
        END CASE;
    END LOOP;
    
    RETURN LEAST(risk_score, 1.0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pharmacogenetic recommendations
CREATE OR REPLACE FUNCTION get_pharmacogenetic_recommendations(
    patient_uuid UUID,
    medication_name VARCHAR(255)
) RETURNS JSONB AS $$
DECLARE
    recommendations JSONB := '{}';
    variant_record RECORD;
BEGIN
    FOR variant_record IN 
        SELECT pv.genotype, pv.dosage_adjustments, pv.drug_implications
        FROM patient_genetic_variants pv
        JOIN pharmacogenetic_variants pgv ON pv.variant_id = pgv.id
        WHERE pv.patient_id = patient_uuid
        AND pgv.drug_implications::text ILIKE '%' || medication_name || '%'
    LOOP
        recommendations := recommendations || jsonb_build_object(
            'genotype', variant_record.genotype,
            'dosage_adjustments', variant_record.dosage_adjustments,
            'drug_implications', variant_record.drug_implications
        );
    END LOOP;
    
    RETURN recommendations;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create genetic test alert
CREATE OR REPLACE FUNCTION create_genetic_test_alert(
    patient_uuid UUID,
    alert_type VARCHAR(100),
    alert_message TEXT,
    severity VARCHAR(20) DEFAULT 'medium'
) RETURNS UUID AS $$
DECLARE
    alert_id UUID;
BEGIN
    INSERT INTO genetic_test_alerts (
        patient_id, alert_type, alert_message, severity
    ) VALUES (
        patient_uuid, alert_type, alert_message, severity
    ) RETURNING id INTO alert_id;
    
    RETURN alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update genetic test analytics
CREATE OR REPLACE FUNCTION update_genetic_test_analytics() RETURNS VOID AS $$
BEGIN
    INSERT INTO genetic_test_analytics (
        test_type_id,
        total_orders,
        positive_results,
        negative_results,
        inconclusive_results,
        average_turnaround_time_days,
        cost_effectiveness_score,
        clinical_impact_score,
        patient_satisfaction_score
    )
    SELECT 
        gt.id,
        COUNT(pt.id) as total_orders,
        COUNT(CASE WHEN gtr.result_status = 'positive' THEN 1 END) as positive_results,
        COUNT(CASE WHEN gtr.result_status = 'negative' THEN 1 END) as negative_results,
        COUNT(CASE WHEN gtr.result_status = 'inconclusive' THEN 1 END) as inconclusive_results,
        AVG(EXTRACT(DAY FROM (gtr.result_date - pt.order_date))) as avg_turnaround_time,
        0.75 as cost_effectiveness_score, -- Placeholder
        0.80 as clinical_impact_score, -- Placeholder
        0.85 as patient_satisfaction_score -- Placeholder
    FROM genetic_test_types gt
    LEFT JOIN patient_genetic_tests pt ON gt.id = pt.test_type_id
    LEFT JOIN genetic_test_results gtr ON pt.id = gtr.patient_test_id
    GROUP BY gt.id
    ON CONFLICT (test_type_id, analysis_date) 
    DO UPDATE SET
        total_orders = EXCLUDED.total_orders,
        positive_results = EXCLUDED.positive_results,
        negative_results = EXCLUDED.negative_results,
        inconclusive_results = EXCLUDED.inconclusive_results,
        average_turnaround_time_days = EXCLUDED.average_turnaround_time_days,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_genetic_test_types_updated_at
    BEFORE UPDATE ON genetic_test_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_genetic_tests_updated_at
    BEFORE UPDATE ON patient_genetic_tests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_genetic_test_results_updated_at
    BEFORE UPDATE ON genetic_test_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pharmacogenetic_variants_updated_at
    BEFORE UPDATE ON pharmacogenetic_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_genetic_variants_updated_at
    BEFORE UPDATE ON patient_genetic_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_genetic_counseling_sessions_updated_at
    BEFORE UPDATE ON genetic_counseling_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_genetic_test_alerts_updated_at
    BEFORE UPDATE ON genetic_test_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_genetic_test_analytics_updated_at
    BEFORE UPDATE ON genetic_test_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
