-- Insurance & Billing Integration Schema
-- Comprehensive insurance and billing management for American psychiatrists

-- Insurance providers
CREATE TABLE IF NOT EXISTS insurance_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name VARCHAR(200) NOT NULL,
    provider_code VARCHAR(50) NOT NULL UNIQUE,
    provider_type VARCHAR(50) NOT NULL, -- 'medicare', 'medicaid', 'private', 'commercial', 'self_pay'
    plan_name VARCHAR(200),
    plan_type VARCHAR(100), -- 'HMO', 'PPO', 'EPO', 'POS', 'HDHP'
    coverage_area VARCHAR(100), -- 'national', 'state', 'regional', 'local'
    eligibility_api_endpoint VARCHAR(500),
    prior_auth_api_endpoint VARCHAR(500),
    claims_api_endpoint VARCHAR(500),
    copay_structure JSONB, -- Different copays for different services
    deductible_amount DECIMAL(10,2),
    out_of_pocket_max DECIMAL(10,2),
    mental_health_coverage BOOLEAN DEFAULT TRUE,
    substance_abuse_coverage BOOLEAN DEFAULT TRUE,
    telehealth_coverage BOOLEAN DEFAULT TRUE,
    prior_auth_required BOOLEAN DEFAULT FALSE,
    prior_auth_threshold INTEGER, -- Number of sessions before PA required
    session_limit_per_year INTEGER,
    session_limit_per_month INTEGER,
    copay_amount DECIMAL(10,2),
    coinsurance_percentage DECIMAL(5,2),
    is_active BOOLEAN DEFAULT TRUE,
    effective_date DATE NOT NULL,
    expiration_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient insurance coverage
CREATE TABLE IF NOT EXISTS patient_insurance_coverage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    insurance_provider_id UUID NOT NULL REFERENCES insurance_providers(id),
    policy_number VARCHAR(100) NOT NULL,
    group_number VARCHAR(100),
    subscriber_id VARCHAR(100),
    subscriber_name VARCHAR(200),
    subscriber_relationship VARCHAR(50), -- 'self', 'spouse', 'child', 'other'
    effective_date DATE NOT NULL,
    expiration_date DATE,
    is_primary BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    verification_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'failed', 'expired'
    verification_date DATE,
    verification_method VARCHAR(50), -- 'api', 'phone', 'manual', 'portal'
    verification_notes TEXT,
    copay_amount DECIMAL(10,2),
    deductible_remaining DECIMAL(10,2),
    out_of_pocket_remaining DECIMAL(10,2),
    session_count_used INTEGER DEFAULT 0,
    session_limit INTEGER,
    last_eligibility_check TIMESTAMP WITH TIME ZONE,
    eligibility_status VARCHAR(20), -- 'active', 'inactive', 'terminated', 'pending'
    eligibility_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prior authorization requests
CREATE TABLE IF NOT EXISTS prior_authorization_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    insurance_provider_id UUID NOT NULL REFERENCES insurance_providers(id),
    provider_id UUID NOT NULL REFERENCES users(id),
    request_type VARCHAR(50) NOT NULL, -- 'initial', 'continuation', 'increase', 'change'
    service_type VARCHAR(100) NOT NULL, -- 'psychiatric_evaluation', 'psychotherapy', 'medication_management'
    diagnosis_codes TEXT[] NOT NULL, -- ICD-10 codes
    procedure_codes TEXT[] NOT NULL, -- CPT codes
    requested_sessions INTEGER NOT NULL,
    requested_duration_months INTEGER,
    clinical_justification TEXT NOT NULL,
    treatment_history TEXT,
    previous_treatments TEXT,
    current_medications TEXT,
    functional_impairment TEXT,
    risk_factors TEXT,
    treatment_goals TEXT,
    expected_outcomes TEXT,
    request_status VARCHAR(20) DEFAULT 'submitted', -- 'submitted', 'under_review', 'approved', 'denied', 'partial_approval'
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    review_date TIMESTAMP WITH TIME ZONE,
    decision_date TIMESTAMP WITH TIME ZONE,
    approved_sessions INTEGER,
    approved_duration_months INTEGER,
    denial_reason TEXT,
    appeal_deadline DATE,
    appeal_submitted BOOLEAN DEFAULT FALSE,
    appeal_date TIMESTAMP WITH TIME ZONE,
    appeal_status VARCHAR(20), -- 'submitted', 'under_review', 'approved', 'denied'
    appeal_notes TEXT,
    external_reference_id VARCHAR(100), -- Insurance company reference
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insurance claims
CREATE TABLE IF NOT EXISTS insurance_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    insurance_provider_id UUID NOT NULL REFERENCES insurance_providers(id),
    provider_id UUID NOT NULL REFERENCES users(id),
    session_id UUID REFERENCES telehealth_sessions(id),
    claim_number VARCHAR(100) UNIQUE,
    claim_type VARCHAR(50) NOT NULL, -- 'professional', 'institutional', 'pharmacy'
    service_date DATE NOT NULL,
    service_location VARCHAR(100), -- 'office', 'telehealth', 'hospital', 'home'
    diagnosis_codes TEXT[] NOT NULL, -- ICD-10 codes
    procedure_codes TEXT[] NOT NULL, -- CPT codes
    modifier_codes TEXT[], -- CPT modifiers
    units INTEGER DEFAULT 1,
    billed_amount DECIMAL(10,2) NOT NULL,
    allowed_amount DECIMAL(10,2),
    copay_amount DECIMAL(10,2),
    deductible_amount DECIMAL(10,2),
    coinsurance_amount DECIMAL(10,2),
    patient_responsibility DECIMAL(10,2),
    insurance_payment DECIMAL(10,2),
    write_off_amount DECIMAL(10,2),
    claim_status VARCHAR(20) DEFAULT 'submitted', -- 'submitted', 'processing', 'paid', 'denied', 'pending', 'appealed'
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processing_date TIMESTAMP WITH TIME ZONE,
    payment_date TIMESTAMP WITH TIME ZONE,
    denial_reason TEXT,
    denial_code VARCHAR(20),
    appeal_submitted BOOLEAN DEFAULT FALSE,
    appeal_date TIMESTAMP WITH TIME ZONE,
    appeal_status VARCHAR(20),
    external_claim_id VARCHAR(100), -- Insurance company claim ID
    remittance_advice_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Copay collection tracking
CREATE TABLE IF NOT EXISTS copay_collection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    session_id UUID REFERENCES telehealth_sessions(id),
    claim_id UUID REFERENCES insurance_claims(id),
    copay_amount DECIMAL(10,2) NOT NULL,
    collection_method VARCHAR(50), -- 'cash', 'check', 'credit_card', 'debit_card', 'hsa', 'fsa'
    collection_date TIMESTAMP WITH TIME ZONE,
    collection_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'collected', 'waived', 'written_off'
    payment_reference VARCHAR(100),
    transaction_id VARCHAR(100),
    collection_notes TEXT,
    waived_reason TEXT,
    written_off_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Denial management
CREATE TABLE IF NOT EXISTS claim_denials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES insurance_claims(id) ON DELETE CASCADE,
    denial_code VARCHAR(20) NOT NULL,
    denial_reason TEXT NOT NULL,
    denial_category VARCHAR(50), -- 'medical_necessity', 'coding', 'authorization', 'eligibility', 'timely_filing'
    denial_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    appeal_eligible BOOLEAN DEFAULT TRUE,
    appeal_deadline DATE,
    appeal_submitted BOOLEAN DEFAULT FALSE,
    appeal_date TIMESTAMP WITH TIME ZONE,
    appeal_status VARCHAR(20), -- 'submitted', 'under_review', 'approved', 'denied'
    appeal_notes TEXT,
    corrective_action_taken TEXT,
    prevention_measures TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insurance billing analytics
CREATE TABLE IF NOT EXISTS insurance_billing_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis_period_months INTEGER NOT NULL DEFAULT 12,
    total_claims INTEGER NOT NULL DEFAULT 0,
    paid_claims INTEGER NOT NULL DEFAULT 0,
    denied_claims INTEGER NOT NULL DEFAULT 0,
    pending_claims INTEGER NOT NULL DEFAULT 0,
    total_billed_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_collected_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_write_off_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    collection_rate DECIMAL(5,2),
    denial_rate DECIMAL(5,2),
    average_payment_time_days INTEGER,
    prior_auth_approval_rate DECIMAL(5,2),
    copay_collection_rate DECIMAL(5,2),
    insurance_provider_performance JSONB, -- Performance by provider
    service_type_performance JSONB, -- Performance by service type
    denial_reasons JSONB, -- Top denial reasons
    appeal_success_rate DECIMAL(5,2),
    revenue_by_insurance JSONB,
    cost_per_claim DECIMAL(10,2),
    net_collection_rate DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_insurance_providers_code ON insurance_providers(provider_code);
CREATE INDEX IF NOT EXISTS idx_insurance_providers_type ON insurance_providers(provider_type);
CREATE INDEX IF NOT EXISTS idx_insurance_providers_active ON insurance_providers(is_active);

CREATE INDEX IF NOT EXISTS idx_patient_insurance_patient_id ON patient_insurance_coverage(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_insurance_provider_id ON patient_insurance_coverage(insurance_provider_id);
CREATE INDEX IF NOT EXISTS idx_patient_insurance_status ON patient_insurance_coverage(verification_status);
CREATE INDEX IF NOT EXISTS idx_patient_insurance_active ON patient_insurance_coverage(is_active);

CREATE INDEX IF NOT EXISTS idx_prior_auth_patient_id ON prior_authorization_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_prior_auth_provider_id ON prior_authorization_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_prior_auth_status ON prior_authorization_requests(request_status);
CREATE INDEX IF NOT EXISTS idx_prior_auth_submission_date ON prior_authorization_requests(submission_date);

CREATE INDEX IF NOT EXISTS idx_insurance_claims_patient_id ON insurance_claims(patient_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_provider_id ON insurance_claims(provider_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON insurance_claims(claim_status);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_service_date ON insurance_claims(service_date);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_submission_date ON insurance_claims(submission_date);

CREATE INDEX IF NOT EXISTS idx_copay_collection_patient_id ON copay_collection(patient_id);
CREATE INDEX IF NOT EXISTS idx_copay_collection_status ON copay_collection(collection_status);
CREATE INDEX IF NOT EXISTS idx_copay_collection_date ON copay_collection(collection_date);

CREATE INDEX IF NOT EXISTS idx_claim_denials_claim_id ON claim_denials(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_denials_code ON claim_denials(denial_code);
CREATE INDEX IF NOT EXISTS idx_claim_denials_date ON claim_denials(denial_date);

CREATE INDEX IF NOT EXISTS idx_insurance_billing_analytics_date ON insurance_billing_analytics(analysis_date);

-- RLS Policies
ALTER TABLE insurance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_insurance_coverage ENABLE ROW LEVEL SECURITY;
ALTER TABLE prior_authorization_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE copay_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_denials ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_billing_analytics ENABLE ROW LEVEL SECURITY;

-- Insurance providers policies (system-wide read access)
CREATE POLICY "Users can view insurance providers" ON insurance_providers
    FOR SELECT USING (true);

CREATE POLICY "Users can insert insurance providers" ON insurance_providers
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update insurance providers" ON insurance_providers
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete insurance providers" ON insurance_providers
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Patient insurance coverage policies
CREATE POLICY "Users can view patient insurance for their patients" ON patient_insurance_coverage
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert patient insurance for their patients" ON patient_insurance_coverage
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update patient insurance for their patients" ON patient_insurance_coverage
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete patient insurance for their patients" ON patient_insurance_coverage
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Prior authorization requests policies
CREATE POLICY "Users can view prior auth for their patients" ON prior_authorization_requests
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR provider_id = auth.uid()
    );

CREATE POLICY "Users can insert prior auth for their patients" ON prior_authorization_requests
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) AND provider_id = auth.uid()
    );

CREATE POLICY "Users can update prior auth for their patients" ON prior_authorization_requests
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR provider_id = auth.uid()
    );

CREATE POLICY "Users can delete prior auth for their patients" ON prior_authorization_requests
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR provider_id = auth.uid()
    );

-- Insurance claims policies
CREATE POLICY "Users can view claims for their patients" ON insurance_claims
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR provider_id = auth.uid()
    );

CREATE POLICY "Users can insert claims for their patients" ON insurance_claims
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) AND provider_id = auth.uid()
    );

CREATE POLICY "Users can update claims for their patients" ON insurance_claims
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR provider_id = auth.uid()
    );

CREATE POLICY "Users can delete claims for their patients" ON insurance_claims
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR provider_id = auth.uid()
    );

-- Copay collection policies
CREATE POLICY "Users can view copay collection for their patients" ON copay_collection
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert copay collection for their patients" ON copay_collection
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update copay collection for their patients" ON copay_collection
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete copay collection for their patients" ON copay_collection
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Claim denials policies
CREATE POLICY "Users can view claim denials for their claims" ON claim_denials
    FOR SELECT USING (
        claim_id IN (
            SELECT id FROM insurance_claims 
            WHERE patient_id IN (
                SELECT id FROM clients WHERE owner_id = auth.uid()
            ) OR provider_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert claim denials for their claims" ON claim_denials
    FOR INSERT WITH CHECK (
        claim_id IN (
            SELECT id FROM insurance_claims 
            WHERE patient_id IN (
                SELECT id FROM clients WHERE owner_id = auth.uid()
            ) OR provider_id = auth.uid()
        )
    );

CREATE POLICY "Users can update claim denials for their claims" ON claim_denials
    FOR UPDATE USING (
        claim_id IN (
            SELECT id FROM insurance_claims 
            WHERE patient_id IN (
                SELECT id FROM clients WHERE owner_id = auth.uid()
            ) OR provider_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete claim denials for their claims" ON claim_denials
    FOR DELETE USING (
        claim_id IN (
            SELECT id FROM insurance_claims 
            WHERE patient_id IN (
                SELECT id FROM clients WHERE owner_id = auth.uid()
            ) OR provider_id = auth.uid()
        )
    );

-- Insurance billing analytics policies (system-wide access)
CREATE POLICY "Users can view insurance billing analytics" ON insurance_billing_analytics
    FOR SELECT USING (true);

CREATE POLICY "Users can insert insurance billing analytics" ON insurance_billing_analytics
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update insurance billing analytics" ON insurance_billing_analytics
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete insurance billing analytics" ON insurance_billing_analytics
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Functions for insurance billing

-- Function to verify insurance eligibility
CREATE OR REPLACE FUNCTION verify_insurance_eligibility(
    p_patient_id UUID,
    p_insurance_provider_id UUID
)
RETURNS TABLE (
    patient_id UUID,
    insurance_provider_id UUID,
    eligibility_status VARCHAR(20),
    verification_date TIMESTAMP WITH TIME ZONE,
    copay_amount DECIMAL(10,2),
    deductible_remaining DECIMAL(10,2),
    session_count_used INTEGER,
    session_limit INTEGER
) AS $$
DECLARE
    v_patient_id UUID;
    v_insurance_provider_id UUID;
    v_eligibility_status VARCHAR(20) := 'active';
    v_verification_date TIMESTAMP WITH TIME ZONE := NOW();
    v_copay_amount DECIMAL(10,2);
    v_deductible_remaining DECIMAL(10,2);
    v_session_count_used INTEGER;
    v_session_limit INTEGER;
BEGIN
    -- Get patient insurance coverage
    SELECT 
        pic.patient_id,
        pic.insurance_provider_id,
        pic.copay_amount,
        pic.deductible_remaining,
        pic.session_count_used,
        pic.session_limit
    INTO 
        v_patient_id,
        v_insurance_provider_id,
        v_copay_amount,
        v_deductible_remaining,
        v_session_count_used,
        v_session_limit
    FROM patient_insurance_coverage pic
    WHERE pic.patient_id = p_patient_id
    AND pic.insurance_provider_id = p_insurance_provider_id
    AND pic.is_active = TRUE;
    
    -- Update verification status
    UPDATE patient_insurance_coverage
    SET 
        verification_status = 'verified',
        verification_date = v_verification_date,
        last_eligibility_check = v_verification_date,
        eligibility_status = v_eligibility_status,
        updated_at = NOW()
    WHERE patient_id = p_patient_id
    AND insurance_provider_id = p_insurance_provider_id;
    
    RETURN QUERY
    SELECT 
        v_patient_id,
        v_insurance_provider_id,
        v_eligibility_status,
        v_verification_date,
        v_copay_amount,
        v_deductible_remaining,
        v_session_count_used,
        v_session_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit prior authorization
CREATE OR REPLACE FUNCTION submit_prior_authorization(
    p_patient_id UUID,
    p_insurance_provider_id UUID,
    p_provider_id UUID,
    p_request_type VARCHAR(50),
    p_service_type VARCHAR(100),
    p_diagnosis_codes TEXT[],
    p_procedure_codes TEXT[],
    p_requested_sessions INTEGER,
    p_clinical_justification TEXT
)
RETURNS TABLE (
    prior_auth_id UUID,
    request_status VARCHAR(20),
    submission_date TIMESTAMP WITH TIME ZONE,
    external_reference_id VARCHAR(100)
) AS $$
DECLARE
    v_prior_auth_id UUID;
    v_request_status VARCHAR(20) := 'submitted';
    v_submission_date TIMESTAMP WITH TIME ZONE := NOW();
    v_external_reference_id VARCHAR(100);
BEGIN
    -- Generate external reference ID
    v_external_reference_id := 'PA-' || EXTRACT(EPOCH FROM NOW())::TEXT;
    
    -- Insert prior authorization request
    INSERT INTO prior_authorization_requests (
        patient_id,
        insurance_provider_id,
        provider_id,
        request_type,
        service_type,
        diagnosis_codes,
        procedure_codes,
        requested_sessions,
        clinical_justification
    ) VALUES (
        p_patient_id,
        p_insurance_provider_id,
        p_provider_id,
        p_request_type,
        p_service_type,
        p_diagnosis_codes,
        p_procedure_codes,
        p_requested_sessions,
        p_clinical_justification
    ) RETURNING id INTO v_prior_auth_id;
    
    RETURN QUERY
    SELECT 
        v_prior_auth_id,
        v_request_status,
        v_submission_date,
        v_external_reference_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit insurance claim
CREATE OR REPLACE FUNCTION submit_insurance_claim(
    p_patient_id UUID,
    p_insurance_provider_id UUID,
    p_provider_id UUID,
    p_service_date DATE,
    p_diagnosis_codes TEXT[],
    p_procedure_codes TEXT[],
    p_billed_amount DECIMAL(10,2),
    p_session_id UUID DEFAULT NULL
)
RETURNS TABLE (
    claim_id UUID,
    claim_number VARCHAR(100),
    claim_status VARCHAR(20),
    submission_date TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_claim_id UUID;
    v_claim_number VARCHAR(100);
    v_claim_status VARCHAR(20) := 'submitted';
    v_submission_date TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
    -- Generate claim number
    v_claim_number := 'CLM-' || EXTRACT(EPOCH FROM NOW())::TEXT;
    
    -- Insert insurance claim
    INSERT INTO insurance_claims (
        patient_id,
        insurance_provider_id,
        provider_id,
        session_id,
        claim_number,
        service_date,
        diagnosis_codes,
        procedure_codes,
        billed_amount
    ) VALUES (
        p_patient_id,
        p_insurance_provider_id,
        p_provider_id,
        p_session_id,
        v_claim_number,
        p_service_date,
        p_diagnosis_codes,
        p_procedure_codes,
        p_billed_amount
    ) RETURNING id INTO v_claim_id;
    
    RETURN QUERY
    SELECT 
        v_claim_id,
        v_claim_number,
        v_claim_status,
        v_submission_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate insurance billing analytics
CREATE OR REPLACE FUNCTION generate_insurance_billing_analytics(
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
        'total_claims', (
            SELECT COUNT(*) FROM insurance_claims
            WHERE created_at >= v_start_date
        ),
        'paid_claims', (
            SELECT COUNT(*) FROM insurance_claims
            WHERE created_at >= v_start_date
            AND claim_status = 'paid'
        ),
        'denied_claims', (
            SELECT COUNT(*) FROM insurance_claims
            WHERE created_at >= v_start_date
            AND claim_status = 'denied'
        ),
        'pending_claims', (
            SELECT COUNT(*) FROM insurance_claims
            WHERE created_at >= v_start_date
            AND claim_status IN ('submitted', 'processing', 'pending')
        ),
        'total_billed_amount', (
            SELECT COALESCE(SUM(billed_amount), 0) FROM insurance_claims
            WHERE created_at >= v_start_date
        ),
        'total_collected_amount', (
            SELECT COALESCE(SUM(insurance_payment), 0) FROM insurance_claims
            WHERE created_at >= v_start_date
            AND claim_status = 'paid'
        ),
        'collection_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN claim_status = 'paid' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM insurance_claims
            WHERE created_at >= v_start_date
        ),
        'denial_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN claim_status = 'denied' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM insurance_claims
            WHERE created_at >= v_start_date
        ),
        'average_payment_time_days', (
            SELECT AVG(EXTRACT(EPOCH FROM (payment_date - submission_date)) / 86400)
            FROM insurance_claims
            WHERE created_at >= v_start_date
            AND payment_date IS NOT NULL
        ),
        'prior_auth_approval_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN request_status = 'approved' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM prior_authorization_requests
            WHERE created_at >= v_start_date
        ),
        'copay_collection_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN collection_status = 'collected' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM copay_collection
            WHERE created_at >= v_start_date
        ),
        'insurance_provider_performance', (
            SELECT jsonb_object_agg(
                ip.provider_name,
                jsonb_build_object(
                    'total_claims', COUNT(ic.id),
                    'paid_claims', COUNT(CASE WHEN ic.claim_status = 'paid' THEN 1 END),
                    'denied_claims', COUNT(CASE WHEN ic.claim_status = 'denied' THEN 1 END),
                    'collection_rate', 
                        CASE 
                            WHEN COUNT(ic.id) > 0 THEN 
                                COUNT(CASE WHEN ic.claim_status = 'paid' THEN 1 END)::DECIMAL / COUNT(ic.id)::DECIMAL
                            ELSE 0
                        END
                )
            )
            FROM insurance_providers ip
            LEFT JOIN insurance_claims ic ON ip.id = ic.insurance_provider_id
            WHERE ic.created_at >= v_start_date OR ic.created_at IS NULL
            GROUP BY ip.id, ip.provider_name
        ),
        'denial_reasons', (
            SELECT jsonb_object_agg(
                denial_code,
                denial_count
            )
            FROM (
                SELECT 
                    cd.denial_code,
                    COUNT(*) as denial_count
                FROM claim_denials cd
                JOIN insurance_claims ic ON cd.claim_id = ic.id
                WHERE ic.created_at >= v_start_date
                GROUP BY cd.denial_code
                ORDER BY denial_count DESC
                LIMIT 10
            ) top_denials
        ),
        'appeal_success_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN appeal_status = 'approved' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM claim_denials
            WHERE appeal_submitted = TRUE
            AND created_at >= v_start_date
        )
    ) INTO v_analytics;
    
    RETURN v_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update insurance billing analytics
CREATE OR REPLACE FUNCTION update_insurance_billing_analytics(
    p_analysis_date DATE DEFAULT CURRENT_DATE,
    p_analysis_period_months INTEGER DEFAULT 12
)
RETURNS VOID AS $$
DECLARE
    v_analytics JSONB;
BEGIN
    SELECT generate_insurance_billing_analytics(p_analysis_date, p_analysis_period_months) INTO v_analytics;
    
    INSERT INTO insurance_billing_analytics (
        analysis_date,
        analysis_period_months,
        total_claims,
        paid_claims,
        denied_claims,
        pending_claims,
        total_billed_amount,
        total_collected_amount,
        collection_rate,
        denial_rate,
        average_payment_time_days,
        prior_auth_approval_rate,
        copay_collection_rate,
        insurance_provider_performance,
        denial_reasons,
        appeal_success_rate
    ) VALUES (
        p_analysis_date,
        p_analysis_period_months,
        (v_analytics->>'total_claims')::INTEGER,
        (v_analytics->>'paid_claims')::INTEGER,
        (v_analytics->>'denied_claims')::INTEGER,
        (v_analytics->>'pending_claims')::INTEGER,
        (v_analytics->>'total_billed_amount')::DECIMAL(12,2),
        (v_analytics->>'total_collected_amount')::DECIMAL(12,2),
        (v_analytics->>'collection_rate')::DECIMAL(5,2),
        (v_analytics->>'denial_rate')::DECIMAL(5,2),
        (v_analytics->>'average_payment_time_days')::INTEGER,
        (v_analytics->>'prior_auth_approval_rate')::DECIMAL(5,2),
        (v_analytics->>'copay_collection_rate')::DECIMAL(5,2),
        v_analytics->'insurance_provider_performance',
        v_analytics->'denial_reasons',
        (v_analytics->>'appeal_success_rate')::DECIMAL(5,2)
    )
    ON CONFLICT (analysis_date) 
    DO UPDATE SET
        analysis_period_months = EXCLUDED.analysis_period_months,
        total_claims = EXCLUDED.total_claims,
        paid_claims = EXCLUDED.paid_claims,
        denied_claims = EXCLUDED.denied_claims,
        pending_claims = EXCLUDED.pending_claims,
        total_billed_amount = EXCLUDED.total_billed_amount,
        total_collected_amount = EXCLUDED.total_collected_amount,
        collection_rate = EXCLUDED.collection_rate,
        denial_rate = EXCLUDED.denial_rate,
        average_payment_time_days = EXCLUDED.average_payment_time_days,
        prior_auth_approval_rate = EXCLUDED.prior_auth_approval_rate,
        copay_collection_rate = EXCLUDED.copay_collection_rate,
        insurance_provider_performance = EXCLUDED.insurance_provider_performance,
        denial_reasons = EXCLUDED.denial_reasons,
        appeal_success_rate = EXCLUDED.appeal_success_rate,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics when new claim is added
CREATE OR REPLACE FUNCTION trigger_update_insurance_billing_analytics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_insurance_billing_analytics();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER insurance_billing_analytics_trigger
    AFTER INSERT OR UPDATE ON insurance_claims
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_insurance_billing_analytics();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_insurance_billing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER insurance_providers_updated_at
    BEFORE UPDATE ON insurance_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_insurance_billing_updated_at();

CREATE TRIGGER patient_insurance_coverage_updated_at
    BEFORE UPDATE ON patient_insurance_coverage
    FOR EACH ROW
    EXECUTE FUNCTION update_insurance_billing_updated_at();

CREATE TRIGGER prior_authorization_requests_updated_at
    BEFORE UPDATE ON prior_authorization_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_insurance_billing_updated_at();

CREATE TRIGGER insurance_claims_updated_at
    BEFORE UPDATE ON insurance_claims
    FOR EACH ROW
    EXECUTE FUNCTION update_insurance_billing_updated_at();

CREATE TRIGGER copay_collection_updated_at
    BEFORE UPDATE ON copay_collection
    FOR EACH ROW
    EXECUTE FUNCTION update_insurance_billing_updated_at();

CREATE TRIGGER claim_denials_updated_at
    BEFORE UPDATE ON claim_denials
    FOR EACH ROW
    EXECUTE FUNCTION update_insurance_billing_updated_at();

CREATE TRIGGER insurance_billing_analytics_updated_at
    BEFORE UPDATE ON insurance_billing_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_insurance_billing_updated_at();

