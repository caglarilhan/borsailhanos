-- Prescription Security Schema
-- Comprehensive prescription security and compliance for American psychiatrists

-- Electronic prescription security
CREATE TABLE IF NOT EXISTS electronic_prescription_security (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL,
    security_level VARCHAR(20) NOT NULL, -- 'standard', 'enhanced', 'maximum'
    encryption_method VARCHAR(50) NOT NULL, -- 'AES-256', 'RSA-2048', 'ECDSA-P256'
    digital_signature TEXT NOT NULL,
    signature_algorithm VARCHAR(50) NOT NULL, -- 'RSA-SHA256', 'ECDSA-SHA256'
    certificate_serial VARCHAR(100) NOT NULL,
    certificate_issuer VARCHAR(255) NOT NULL,
    certificate_expiry DATE NOT NULL,
    timestamp_signature TIMESTAMP WITH TIME ZONE NOT NULL,
    hash_value VARCHAR(255) NOT NULL,
    hash_algorithm VARCHAR(20) NOT NULL, -- 'SHA-256', 'SHA-384', 'SHA-512'
    tamper_detection BOOLEAN DEFAULT TRUE,
    tamper_evidence JSONB,
    access_control_rules JSONB,
    audit_trail_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PDMP (Prescription Drug Monitoring Program) integration
CREATE TABLE IF NOT EXISTS pdmp_integration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    prescription_id UUID NOT NULL,
    pdmp_query_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    pdmp_response JSONB NOT NULL,
    controlled_substances_found JSONB,
    prescription_history JSONB,
    risk_score DECIMAL(3,2), -- 0.00 to 1.00
    risk_factors TEXT[],
    alerts_generated TEXT[],
    prescriber_verification BOOLEAN DEFAULT FALSE,
    prescriber_verification_date TIMESTAMP WITH TIME ZONE,
    prescriber_verification_method VARCHAR(50), -- 'phone', 'fax', 'email', 'in_person'
    state_pdmp_id VARCHAR(100),
    federal_pdmp_id VARCHAR(100),
    query_status VARCHAR(20) NOT NULL, -- 'pending', 'completed', 'failed', 'timeout'
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescription audit trails
CREATE TABLE IF NOT EXISTS prescription_audit_trails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'created', 'modified', 'cancelled', 'dispensed', 'viewed', 'printed', 'transmitted'
    action_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES users(id),
    user_role VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    action_details JSONB,
    before_state JSONB,
    after_state JSONB,
    change_summary TEXT,
    security_context JSONB,
    compliance_flags TEXT[],
    risk_assessment JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DEA compliance tracking
CREATE TABLE IF NOT EXISTS dea_compliance_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL,
    dea_number VARCHAR(20) NOT NULL,
    prescriber_name VARCHAR(255) NOT NULL,
    controlled_substance_schedule VARCHAR(10) NOT NULL, -- 'I', 'II', 'III', 'IV', 'V'
    prescription_date DATE NOT NULL,
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    quantity_prescribed DECIMAL(10,2) NOT NULL,
    days_supply INTEGER NOT NULL,
    refills_authorized INTEGER DEFAULT 0,
    refills_remaining INTEGER DEFAULT 0,
    early_refill_requested BOOLEAN DEFAULT FALSE,
    early_refill_reason TEXT,
    prescriber_verification_required BOOLEAN DEFAULT FALSE,
    prescriber_verification_completed BOOLEAN DEFAULT FALSE,
    prescriber_verification_date TIMESTAMP WITH TIME ZONE,
    prescriber_verification_method VARCHAR(50),
    prescriber_verification_notes TEXT,
    dea_form_required BOOLEAN DEFAULT FALSE,
    dea_form_number VARCHAR(100),
    dea_form_submitted BOOLEAN DEFAULT FALSE,
    dea_form_submission_date DATE,
    compliance_status VARCHAR(20) NOT NULL, -- 'compliant', 'non_compliant', 'pending_review', 'requires_correction'
    compliance_notes TEXT,
    audit_flags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescription fraud detection
CREATE TABLE IF NOT EXISTS prescription_fraud_detection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL,
    fraud_score DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
    fraud_indicators TEXT[],
    risk_factors JSONB,
    suspicious_patterns JSONB,
    patient_risk_profile JSONB,
    prescriber_risk_profile JSONB,
    medication_risk_profile JSONB,
    geographic_risk_factors JSONB,
    temporal_risk_factors JSONB,
    behavioral_risk_factors JSONB,
    fraud_probability DECIMAL(3,2), -- 0.00 to 1.00
    fraud_category VARCHAR(50), -- 'forgery', 'doctor_shopping', 'pharmacy_shopping', 'quantity_manipulation', 'date_manipulation'
    detection_method VARCHAR(50), -- 'rule_based', 'ml_model', 'pattern_analysis', 'anomaly_detection'
    confidence_level DECIMAL(3,2), -- 0.00 to 1.00
    false_positive_probability DECIMAL(3,2), -- 0.00 to 1.00
    investigation_required BOOLEAN DEFAULT FALSE,
    investigation_status VARCHAR(20), -- 'pending', 'in_progress', 'completed', 'dismissed'
    investigation_notes TEXT,
    reported_to_authorities BOOLEAN DEFAULT FALSE,
    report_date DATE,
    report_reference VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescription security analytics
CREATE TABLE IF NOT EXISTS prescription_security_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis_period_months INTEGER NOT NULL DEFAULT 12,
    total_prescriptions INTEGER NOT NULL DEFAULT 0,
    electronic_prescriptions INTEGER NOT NULL DEFAULT 0,
    controlled_substance_prescriptions INTEGER NOT NULL DEFAULT 0,
    pdmp_queries INTEGER NOT NULL DEFAULT 0,
    fraud_detections INTEGER NOT NULL DEFAULT 0,
    security_violations INTEGER NOT NULL DEFAULT 0,
    compliance_violations INTEGER NOT NULL DEFAULT 0,
    average_fraud_score DECIMAL(3,2),
    high_risk_prescriptions INTEGER NOT NULL DEFAULT 0,
    dea_compliance_rate DECIMAL(3,2),
    pdmp_compliance_rate DECIMAL(3,2),
    security_incidents_by_type JSONB,
    fraud_patterns JSONB,
    compliance_trends JSONB,
    risk_distribution JSONB,
    geographic_risk_analysis JSONB,
    temporal_risk_analysis JSONB,
    prescriber_risk_analysis JSONB,
    patient_risk_analysis JSONB,
    medication_risk_analysis JSONB,
    security_improvement_metrics JSONB,
    cost_of_fraud DECIMAL(10,2),
    prevented_fraud_attempts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_electronic_prescription_security_prescription_id ON electronic_prescription_security(prescription_id);
CREATE INDEX IF NOT EXISTS idx_electronic_prescription_security_security_level ON electronic_prescription_security(security_level);
CREATE INDEX IF NOT EXISTS idx_electronic_prescription_security_timestamp ON electronic_prescription_security(timestamp_signature);

CREATE INDEX IF NOT EXISTS idx_pdmp_integration_patient_id ON pdmp_integration(patient_id);
CREATE INDEX IF NOT EXISTS idx_pdmp_integration_prescription_id ON pdmp_integration(prescription_id);
CREATE INDEX IF NOT EXISTS idx_pdmp_integration_query_date ON pdmp_integration(pdmp_query_date);
CREATE INDEX IF NOT EXISTS idx_pdmp_integration_status ON pdmp_integration(query_status);

CREATE INDEX IF NOT EXISTS idx_prescription_audit_trails_prescription_id ON prescription_audit_trails(prescription_id);
CREATE INDEX IF NOT EXISTS idx_prescription_audit_trails_action_type ON prescription_audit_trails(action_type);
CREATE INDEX IF NOT EXISTS idx_prescription_audit_trails_timestamp ON prescription_audit_trails(action_timestamp);
CREATE INDEX IF NOT EXISTS idx_prescription_audit_trails_user_id ON prescription_audit_trails(user_id);

CREATE INDEX IF NOT EXISTS idx_dea_compliance_tracking_prescription_id ON dea_compliance_tracking(prescription_id);
CREATE INDEX IF NOT EXISTS idx_dea_compliance_tracking_patient_id ON dea_compliance_tracking(patient_id);
CREATE INDEX IF NOT EXISTS idx_dea_compliance_tracking_dea_number ON dea_compliance_tracking(dea_number);
CREATE INDEX IF NOT EXISTS idx_dea_compliance_tracking_schedule ON dea_compliance_tracking(controlled_substance_schedule);
CREATE INDEX IF NOT EXISTS idx_dea_compliance_tracking_compliance_status ON dea_compliance_tracking(compliance_status);

CREATE INDEX IF NOT EXISTS idx_prescription_fraud_detection_prescription_id ON prescription_fraud_detection(prescription_id);
CREATE INDEX IF NOT EXISTS idx_prescription_fraud_detection_fraud_score ON prescription_fraud_detection(fraud_score);
CREATE INDEX IF NOT EXISTS idx_prescription_fraud_detection_category ON prescription_fraud_detection(fraud_category);
CREATE INDEX IF NOT EXISTS idx_prescription_fraud_detection_investigation ON prescription_fraud_detection(investigation_required);

CREATE INDEX IF NOT EXISTS idx_prescription_security_analytics_date ON prescription_security_analytics(analysis_date);

-- RLS Policies
ALTER TABLE electronic_prescription_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdmp_integration ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_audit_trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE dea_compliance_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_fraud_detection ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_security_analytics ENABLE ROW LEVEL SECURITY;

-- Electronic prescription security policies
CREATE POLICY "Users can view prescription security for their prescriptions" ON electronic_prescription_security
    FOR SELECT USING (
        prescription_id IN (
            SELECT id FROM prescriptions WHERE prescriber_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert prescription security for their prescriptions" ON electronic_prescription_security
    FOR INSERT WITH CHECK (
        prescription_id IN (
            SELECT id FROM prescriptions WHERE prescriber_id = auth.uid()
        )
    );

CREATE POLICY "Users can update prescription security for their prescriptions" ON electronic_prescription_security
    FOR UPDATE USING (
        prescription_id IN (
            SELECT id FROM prescriptions WHERE prescriber_id = auth.uid()
        )
    );

-- PDMP integration policies
CREATE POLICY "Users can view PDMP data for their patients" ON pdmp_integration
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert PDMP data for their patients" ON pdmp_integration
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update PDMP data for their patients" ON pdmp_integration
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Prescription audit trails policies
CREATE POLICY "Users can view audit trails for their prescriptions" ON prescription_audit_trails
    FOR SELECT USING (
        prescription_id IN (
            SELECT id FROM prescriptions WHERE prescriber_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert audit trails for their prescriptions" ON prescription_audit_trails
    FOR INSERT WITH CHECK (
        prescription_id IN (
            SELECT id FROM prescriptions WHERE prescriber_id = auth.uid()
        )
    );

-- DEA compliance tracking policies
CREATE POLICY "Users can view DEA compliance for their prescriptions" ON dea_compliance_tracking
    FOR SELECT USING (
        prescription_id IN (
            SELECT id FROM prescriptions WHERE prescriber_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert DEA compliance for their prescriptions" ON dea_compliance_tracking
    FOR INSERT WITH CHECK (
        prescription_id IN (
            SELECT id FROM prescriptions WHERE prescriber_id = auth.uid()
        )
    );

CREATE POLICY "Users can update DEA compliance for their prescriptions" ON dea_compliance_tracking
    FOR UPDATE USING (
        prescription_id IN (
            SELECT id FROM prescriptions WHERE prescriber_id = auth.uid()
        )
    );

-- Prescription fraud detection policies
CREATE POLICY "Users can view fraud detection for their prescriptions" ON prescription_fraud_detection
    FOR SELECT USING (
        prescription_id IN (
            SELECT id FROM prescriptions WHERE prescriber_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert fraud detection for their prescriptions" ON prescription_fraud_detection
    FOR INSERT WITH CHECK (
        prescription_id IN (
            SELECT id FROM prescriptions WHERE prescriber_id = auth.uid()
        )
    );

CREATE POLICY "Users can update fraud detection for their prescriptions" ON prescription_fraud_detection
    FOR UPDATE USING (
        prescription_id IN (
            SELECT id FROM prescriptions WHERE prescriber_id = auth.uid()
        )
    );

-- Prescription security analytics policies (system-wide access)
CREATE POLICY "Users can view prescription security analytics" ON prescription_security_analytics
    FOR SELECT USING (true);

CREATE POLICY "Users can insert prescription security analytics" ON prescription_security_analytics
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update prescription security analytics" ON prescription_security_analytics
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete prescription security analytics" ON prescription_security_analytics
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Functions for prescription security

-- Function to detect prescription fraud
CREATE OR REPLACE FUNCTION detect_prescription_fraud(
    p_prescription_id UUID,
    p_patient_id UUID,
    p_prescriber_id UUID,
    p_medication_name VARCHAR(255),
    p_quantity_prescribed DECIMAL(10,2),
    p_days_supply INTEGER,
    p_prescription_date DATE
)
RETURNS TABLE (
    fraud_score DECIMAL(3,2),
    fraud_indicators TEXT[],
    risk_factors JSONB,
    fraud_probability DECIMAL(3,2),
    fraud_category VARCHAR(50),
    confidence_level DECIMAL(3,2)
) AS $$
DECLARE
    v_fraud_score DECIMAL(3,2) := 0.0;
    v_fraud_indicators TEXT[] := '{}';
    v_risk_factors JSONB := '{}';
    v_fraud_probability DECIMAL(3,2) := 0.0;
    v_fraud_category VARCHAR(50) := 'none';
    v_confidence_level DECIMAL(3,2) := 0.0;
    v_recent_prescriptions INTEGER;
    v_early_refill_count INTEGER;
    v_multiple_prescriber_count INTEGER;
    v_high_quantity_flag BOOLEAN := FALSE;
    v_short_supply_flag BOOLEAN := FALSE;
BEGIN
    -- Check for recent prescriptions (doctor shopping)
    SELECT COUNT(*) INTO v_recent_prescriptions
    FROM prescriptions
    WHERE patient_id = p_patient_id
    AND prescription_date >= p_prescription_date - INTERVAL '30 days'
    AND id != p_prescription_id;
    
    IF v_recent_prescriptions > 3 THEN
        v_fraud_score := v_fraud_score + 0.3;
        v_fraud_indicators := array_append(v_fraud_indicators, 'Multiple recent prescriptions');
        v_risk_factors := jsonb_set(v_risk_factors, '{doctor_shopping}', to_jsonb(v_recent_prescriptions));
    END IF;
    
    -- Check for early refills
    SELECT COUNT(*) INTO v_early_refill_count
    FROM prescriptions
    WHERE patient_id = p_patient_id
    AND medication_name = p_medication_name
    AND prescription_date >= p_prescription_date - INTERVAL '90 days'
    AND id != p_prescription_id;
    
    IF v_early_refill_count > 0 THEN
        v_fraud_score := v_fraud_score + 0.2;
        v_fraud_indicators := array_append(v_fraud_indicators, 'Early refill pattern');
        v_risk_factors := jsonb_set(v_risk_factors, '{early_refills}', to_jsonb(v_early_refill_count));
    END IF;
    
    -- Check for multiple prescribers
    SELECT COUNT(DISTINCT prescriber_id) INTO v_multiple_prescriber_count
    FROM prescriptions
    WHERE patient_id = p_patient_id
    AND prescription_date >= p_prescription_date - INTERVAL '90 days'
    AND id != p_prescription_id;
    
    IF v_multiple_prescriber_count > 2 THEN
        v_fraud_score := v_fraud_score + 0.25;
        v_fraud_indicators := array_append(v_fraud_indicators, 'Multiple prescribers');
        v_risk_factors := jsonb_set(v_risk_factors, '{multiple_prescribers}', to_jsonb(v_multiple_prescriber_count));
    END IF;
    
    -- Check for high quantity
    IF p_quantity_prescribed > 100 THEN
        v_high_quantity_flag := TRUE;
        v_fraud_score := v_fraud_score + 0.15;
        v_fraud_indicators := array_append(v_fraud_indicators, 'High quantity prescribed');
        v_risk_factors := jsonb_set(v_risk_factors, '{high_quantity}', to_jsonb(p_quantity_prescribed));
    END IF;
    
    -- Check for short supply period
    IF p_days_supply < 7 THEN
        v_short_supply_flag := TRUE;
        v_fraud_score := v_fraud_score + 0.1;
        v_fraud_indicators := array_append(v_fraud_indicators, 'Short supply period');
        v_risk_factors := jsonb_set(v_risk_factors, '{short_supply}', to_jsonb(p_days_supply));
    END IF;
    
    -- Determine fraud category
    IF v_recent_prescriptions > 3 AND v_multiple_prescriber_count > 2 THEN
        v_fraud_category := 'doctor_shopping';
        v_fraud_probability := 0.8;
    ELSIF v_early_refill_count > 0 AND v_high_quantity_flag THEN
        v_fraud_category := 'quantity_manipulation';
        v_fraud_probability := 0.7;
    ELSIF v_short_supply_flag AND v_high_quantity_flag THEN
        v_fraud_category := 'date_manipulation';
        v_fraud_probability := 0.6;
    ELSE
        v_fraud_category := 'none';
        v_fraud_probability := v_fraud_score;
    END IF;
    
    -- Calculate confidence level
    v_confidence_level := LEAST(v_fraud_score * 1.2, 1.0);
    
    -- Ensure fraud score doesn't exceed 1.0
    v_fraud_score := LEAST(v_fraud_score, 1.0);
    
    RETURN QUERY
    SELECT 
        v_fraud_score,
        v_fraud_indicators,
        v_risk_factors,
        v_fraud_probability,
        v_fraud_category,
        v_confidence_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate prescription security analytics
CREATE OR REPLACE FUNCTION generate_prescription_security_analytics(
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
        'total_prescriptions', (
            SELECT COUNT(*) FROM prescriptions
            WHERE created_at >= v_start_date
        ),
        'electronic_prescriptions', (
            SELECT COUNT(*) FROM electronic_prescription_security
            WHERE created_at >= v_start_date
        ),
        'controlled_substance_prescriptions', (
            SELECT COUNT(*) FROM dea_compliance_tracking
            WHERE created_at >= v_start_date
        ),
        'pdmp_queries', (
            SELECT COUNT(*) FROM pdmp_integration
            WHERE pdmp_query_date >= v_start_date
        ),
        'fraud_detections', (
            SELECT COUNT(*) FROM prescription_fraud_detection
            WHERE created_at >= v_start_date
            AND fraud_score > 0.5
        ),
        'security_violations', (
            SELECT COUNT(*) FROM prescription_audit_trails
            WHERE action_timestamp >= v_start_date
            AND action_type IN ('security_violation', 'unauthorized_access')
        ),
        'compliance_violations', (
            SELECT COUNT(*) FROM dea_compliance_tracking
            WHERE created_at >= v_start_date
            AND compliance_status = 'non_compliant'
        ),
        'average_fraud_score', (
            SELECT AVG(fraud_score) FROM prescription_fraud_detection
            WHERE created_at >= v_start_date
        ),
        'high_risk_prescriptions', (
            SELECT COUNT(*) FROM prescription_fraud_detection
            WHERE created_at >= v_start_date
            AND fraud_score > 0.7
        ),
        'dea_compliance_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN compliance_status = 'compliant' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM dea_compliance_tracking
            WHERE created_at >= v_start_date
        ),
        'pdmp_compliance_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN query_status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM pdmp_integration
            WHERE pdmp_query_date >= v_start_date
        ),
        'security_incidents_by_type', (
            SELECT jsonb_object_agg(
                action_type,
                incident_count
            )
            FROM (
                SELECT 
                    action_type,
                    COUNT(*) as incident_count
                FROM prescription_audit_trails
                WHERE action_timestamp >= v_start_date
                AND action_type IN ('security_violation', 'unauthorized_access', 'tamper_detected')
                GROUP BY action_type
            ) incidents
        ),
        'fraud_patterns', (
            SELECT jsonb_object_agg(
                fraud_category,
                pattern_count
            )
            FROM (
                SELECT 
                    fraud_category,
                    COUNT(*) as pattern_count
                FROM prescription_fraud_detection
                WHERE created_at >= v_start_date
                AND fraud_category != 'none'
                GROUP BY fraud_category
            ) patterns
        ),
        'compliance_trends', (
            SELECT jsonb_build_object(
                'dea_compliance_trend', (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'month', month,
                            'compliance_rate', compliance_rate
                        )
                    )
                    FROM (
                        SELECT 
                            DATE_TRUNC('month', created_at) as month,
                            COUNT(CASE WHEN compliance_status = 'compliant' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL as compliance_rate
                        FROM dea_compliance_tracking
                        WHERE created_at >= v_start_date
                        GROUP BY month
                        ORDER BY month
                    ) trends
                ),
                'pdmp_compliance_trend', (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'month', month,
                            'compliance_rate', compliance_rate
                        )
                    )
                    FROM (
                        SELECT 
                            DATE_TRUNC('month', pdmp_query_date) as month,
                            COUNT(CASE WHEN query_status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL as compliance_rate
                        FROM pdmp_integration
                        WHERE pdmp_query_date >= v_start_date
                        GROUP BY month
                        ORDER BY month
                    ) trends
                )
            )
        )
    ) INTO v_analytics;
    
    RETURN v_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update prescription security analytics
CREATE OR REPLACE FUNCTION update_prescription_security_analytics(
    p_analysis_date DATE DEFAULT CURRENT_DATE,
    p_analysis_period_months INTEGER DEFAULT 12
)
RETURNS VOID AS $$
DECLARE
    v_analytics JSONB;
BEGIN
    SELECT generate_prescription_security_analytics(p_analysis_date, p_analysis_period_months) INTO v_analytics;
    
    INSERT INTO prescription_security_analytics (
        analysis_date,
        analysis_period_months,
        total_prescriptions,
        electronic_prescriptions,
        controlled_substance_prescriptions,
        pdmp_queries,
        fraud_detections,
        security_violations,
        compliance_violations,
        average_fraud_score,
        high_risk_prescriptions,
        dea_compliance_rate,
        pdmp_compliance_rate,
        security_incidents_by_type,
        fraud_patterns,
        compliance_trends
    ) VALUES (
        p_analysis_date,
        p_analysis_period_months,
        (v_analytics->>'total_prescriptions')::INTEGER,
        (v_analytics->>'electronic_prescriptions')::INTEGER,
        (v_analytics->>'controlled_substance_prescriptions')::INTEGER,
        (v_analytics->>'pdmp_queries')::INTEGER,
        (v_analytics->>'fraud_detections')::INTEGER,
        (v_analytics->>'security_violations')::INTEGER,
        (v_analytics->>'compliance_violations')::INTEGER,
        (v_analytics->>'average_fraud_score')::DECIMAL(3,2),
        (v_analytics->>'high_risk_prescriptions')::INTEGER,
        (v_analytics->>'dea_compliance_rate')::DECIMAL(3,2),
        (v_analytics->>'pdmp_compliance_rate')::DECIMAL(3,2),
        v_analytics->'security_incidents_by_type',
        v_analytics->'fraud_patterns',
        v_analytics->'compliance_trends'
    )
    ON CONFLICT (analysis_date) 
    DO UPDATE SET
        analysis_period_months = EXCLUDED.analysis_period_months,
        total_prescriptions = EXCLUDED.total_prescriptions,
        electronic_prescriptions = EXCLUDED.electronic_prescriptions,
        controlled_substance_prescriptions = EXCLUDED.controlled_substance_prescriptions,
        pdmp_queries = EXCLUDED.pdmp_queries,
        fraud_detections = EXCLUDED.fraud_detections,
        security_violations = EXCLUDED.security_violations,
        compliance_violations = EXCLUDED.compliance_violations,
        average_fraud_score = EXCLUDED.average_fraud_score,
        high_risk_prescriptions = EXCLUDED.high_risk_prescriptions,
        dea_compliance_rate = EXCLUDED.dea_compliance_rate,
        pdmp_compliance_rate = EXCLUDED.pdmp_compliance_rate,
        security_incidents_by_type = EXCLUDED.security_incidents_by_type,
        fraud_patterns = EXCLUDED.fraud_patterns,
        compliance_trends = EXCLUDED.compliance_trends,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics when new prescription security record is added
CREATE OR REPLACE FUNCTION trigger_update_prescription_security_analytics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_prescription_security_analytics();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prescription_security_analytics_trigger
    AFTER INSERT OR UPDATE ON electronic_prescription_security
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_prescription_security_analytics();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_prescription_security_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER electronic_prescription_security_updated_at
    BEFORE UPDATE ON electronic_prescription_security
    FOR EACH ROW
    EXECUTE FUNCTION update_prescription_security_updated_at();

CREATE TRIGGER pdmp_integration_updated_at
    BEFORE UPDATE ON pdmp_integration
    FOR EACH ROW
    EXECUTE FUNCTION update_prescription_security_updated_at();

CREATE TRIGGER dea_compliance_tracking_updated_at
    BEFORE UPDATE ON dea_compliance_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_prescription_security_updated_at();

CREATE TRIGGER prescription_fraud_detection_updated_at
    BEFORE UPDATE ON prescription_fraud_detection
    FOR EACH ROW
    EXECUTE FUNCTION update_prescription_security_updated_at();

CREATE TRIGGER prescription_security_analytics_updated_at
    BEFORE UPDATE ON prescription_security_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_prescription_security_updated_at();


