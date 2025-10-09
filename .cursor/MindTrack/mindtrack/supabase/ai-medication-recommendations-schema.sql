-- AI-Powered Medication Recommendations Schema
-- Advanced AI and ML-powered medication recommendations for American psychiatrists

-- AI recommendation models
CREATE TABLE IF NOT EXISTS ai_recommendation_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(100) NOT NULL UNIQUE,
    model_version VARCHAR(50) NOT NULL,
    model_type VARCHAR(50) NOT NULL, -- 'classification', 'regression', 'clustering', 'deep_learning', 'ensemble'
    algorithm VARCHAR(100) NOT NULL, -- 'random_forest', 'neural_network', 'svm', 'gradient_boosting', 'transformer'
    training_dataset VARCHAR(255),
    training_date DATE,
    model_accuracy DECIMAL(5,4), -- 0.0000 to 1.0000
    model_precision DECIMAL(5,4),
    model_recall DECIMAL(5,4),
    model_f1_score DECIMAL(5,4),
    model_auc DECIMAL(5,4),
    validation_metrics JSONB,
    hyperparameters JSONB,
    feature_importance JSONB,
    model_file_path VARCHAR(500),
    model_size_mb DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    is_production_ready BOOLEAN DEFAULT FALSE,
    fda_approval_status VARCHAR(50), -- 'approved', 'pending', 'not_applicable', 'under_review'
    clinical_validation_status VARCHAR(50), -- 'validated', 'pending', 'failed', 'not_required'
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI recommendation requests
CREATE TABLE IF NOT EXISTS ai_recommendation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL, -- 'medication_selection', 'dosage_optimization', 'drug_interaction_check', 'adverse_event_prediction', 'treatment_response'
    clinical_context JSONB NOT NULL, -- Patient demographics, diagnosis, symptoms, lab values, etc.
    input_features JSONB NOT NULL, -- Features used for AI prediction
    model_id UUID REFERENCES ai_recommendation_models(id),
    request_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processing_time_ms INTEGER,
    confidence_score DECIMAL(5,4), -- 0.0000 to 1.0000
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
    error_message TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI medication recommendations
CREATE TABLE IF NOT EXISTS ai_medication_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES ai_recommendation_requests(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    medication_class VARCHAR(100),
    recommended_dosage VARCHAR(100),
    dosage_form VARCHAR(50), -- 'tablet', 'capsule', 'liquid', 'injection', 'patch'
    frequency VARCHAR(50), -- 'daily', 'twice_daily', 'as_needed', 'weekly'
    duration_days INTEGER,
    confidence_score DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    recommendation_rank INTEGER NOT NULL, -- 1 = best recommendation
    reasoning_explanation TEXT,
    expected_efficacy DECIMAL(5,4), -- 0.0000 to 1.0000
    expected_tolerability DECIMAL(5,4), -- 0.0000 to 1.0000
    risk_score DECIMAL(5,4), -- 0.0000 to 1.0000
    contraindications TEXT[],
    drug_interactions TEXT[],
    monitoring_requirements TEXT[],
    alternative_medications TEXT[],
    pharmacogenomic_factors JSONB,
    clinical_evidence JSONB, -- Supporting clinical studies, guidelines
    cost_considerations JSONB, -- Insurance coverage, generic alternatives
    is_accepted BOOLEAN,
    acceptance_reason TEXT,
    rejection_reason TEXT,
    accepted_by UUID REFERENCES users(id),
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI recommendation feedback
CREATE TABLE IF NOT EXISTS ai_recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID NOT NULL REFERENCES ai_medication_recommendations(id) ON DELETE CASCADE,
    feedback_type VARCHAR(50) NOT NULL, -- 'acceptance', 'rejection', 'modification', 'outcome', 'side_effect'
    feedback_score INTEGER CHECK (feedback_score >= 1 AND feedback_score <= 5), -- 1 = poor, 5 = excellent
    feedback_text TEXT,
    clinical_outcome VARCHAR(50), -- 'effective', 'ineffective', 'adverse_event', 'no_change', 'worsened'
    side_effects_experienced TEXT[],
    adherence_level DECIMAL(5,4), -- 0.0000 to 1.0000
    patient_satisfaction INTEGER CHECK (patient_satisfaction >= 1 AND patient_satisfaction <= 5),
    provider_satisfaction INTEGER CHECK (provider_satisfaction >= 1 AND provider_satisfaction <= 5),
    follow_up_notes TEXT,
    feedback_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    provided_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI model performance tracking
CREATE TABLE IF NOT EXISTS ai_model_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES ai_recommendation_models(id) ON DELETE CASCADE,
    evaluation_date DATE NOT NULL,
    evaluation_period_days INTEGER NOT NULL,
    total_recommendations INTEGER NOT NULL DEFAULT 0,
    accepted_recommendations INTEGER NOT NULL DEFAULT 0,
    rejected_recommendations INTEGER NOT NULL DEFAULT 0,
    effective_recommendations INTEGER NOT NULL DEFAULT 0,
    ineffective_recommendations INTEGER NOT NULL DEFAULT 0,
    adverse_events INTEGER NOT NULL DEFAULT 0,
    average_confidence_score DECIMAL(5,4),
    average_feedback_score DECIMAL(3,2),
    average_acceptance_rate DECIMAL(5,4),
    average_effectiveness_rate DECIMAL(5,4),
    average_adverse_event_rate DECIMAL(5,4),
    model_drift_score DECIMAL(5,4), -- Measure of model performance degradation
    calibration_score DECIMAL(5,4), -- Measure of confidence calibration
    bias_metrics JSONB, -- Fairness and bias metrics
    performance_metrics JSONB, -- Additional performance metrics
    recommendations_for_improvement TEXT[],
    is_model_retraining_needed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI recommendation analytics
CREATE TABLE IF NOT EXISTS ai_recommendation_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis_period_months INTEGER NOT NULL DEFAULT 1,
    total_requests INTEGER NOT NULL DEFAULT 0,
    total_recommendations INTEGER NOT NULL DEFAULT 0,
    average_confidence_score DECIMAL(5,4),
    average_processing_time_ms INTEGER,
    most_recommended_medications JSONB, -- Top medications by frequency
    most_effective_medications JSONB, -- Top medications by effectiveness
    most_rejected_medications JSONB, -- Most frequently rejected medications
    recommendation_acceptance_rate DECIMAL(5,4),
    clinical_outcome_distribution JSONB, -- Distribution of clinical outcomes
    side_effect_frequency JSONB, -- Frequency of side effects by medication
    provider_satisfaction_distribution JSONB, -- Distribution of provider satisfaction scores
    patient_satisfaction_distribution JSONB, -- Distribution of patient satisfaction scores
    cost_effectiveness_metrics JSONB, -- Cost-effectiveness analysis
    pharmacogenomic_impact_metrics JSONB, -- Impact of pharmacogenomic factors
    model_performance_summary JSONB, -- Summary of all model performances
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_recommendation_models_name ON ai_recommendation_models(model_name);
CREATE INDEX IF NOT EXISTS idx_ai_recommendation_models_type ON ai_recommendation_models(model_type);
CREATE INDEX IF NOT EXISTS idx_ai_recommendation_models_active ON ai_recommendation_models(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_recommendation_models_production ON ai_recommendation_models(is_production_ready);

CREATE INDEX IF NOT EXISTS idx_ai_recommendation_requests_patient_id ON ai_recommendation_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendation_requests_type ON ai_recommendation_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_ai_recommendation_requests_model_id ON ai_recommendation_requests(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendation_requests_timestamp ON ai_recommendation_requests(request_timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_recommendation_requests_status ON ai_recommendation_requests(status);

CREATE INDEX IF NOT EXISTS idx_ai_medication_recommendations_request_id ON ai_medication_recommendations(request_id);
CREATE INDEX IF NOT EXISTS idx_ai_medication_recommendations_medication ON ai_medication_recommendations(medication_name);
CREATE INDEX IF NOT EXISTS idx_ai_medication_recommendations_confidence ON ai_medication_recommendations(confidence_score);
CREATE INDEX IF NOT EXISTS idx_ai_medication_recommendations_rank ON ai_medication_recommendations(recommendation_rank);
CREATE INDEX IF NOT EXISTS idx_ai_medication_recommendations_accepted ON ai_medication_recommendations(is_accepted);

CREATE INDEX IF NOT EXISTS idx_ai_recommendation_feedback_recommendation_id ON ai_recommendation_feedback(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendation_feedback_type ON ai_recommendation_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_ai_recommendation_feedback_score ON ai_recommendation_feedback(feedback_score);
CREATE INDEX IF NOT EXISTS idx_ai_recommendation_feedback_date ON ai_recommendation_feedback(feedback_date);

CREATE INDEX IF NOT EXISTS idx_ai_model_performance_model_id ON ai_model_performance(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_model_performance_date ON ai_model_performance(evaluation_date);

CREATE INDEX IF NOT EXISTS idx_ai_recommendation_analytics_date ON ai_recommendation_analytics(analysis_date);

-- RLS Policies
ALTER TABLE ai_recommendation_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_medication_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendation_analytics ENABLE ROW LEVEL SECURITY;

-- AI recommendation models policies
CREATE POLICY "Users can view AI recommendation models" ON ai_recommendation_models
    FOR SELECT USING (true);

CREATE POLICY "Users can insert AI recommendation models" ON ai_recommendation_models
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update AI recommendation models" ON ai_recommendation_models
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete AI recommendation models" ON ai_recommendation_models
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- AI recommendation requests policies
CREATE POLICY "Users can view AI requests for their clients" ON ai_recommendation_requests
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert AI requests for their clients" ON ai_recommendation_requests
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update AI requests for their clients" ON ai_recommendation_requests
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete AI requests for their clients" ON ai_recommendation_requests
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- AI medication recommendations policies
CREATE POLICY "Users can view AI recommendations for their clients" ON ai_medication_recommendations
    FOR SELECT USING (
        request_id IN (
            SELECT id FROM ai_recommendation_requests 
            WHERE patient_id IN (
                SELECT id FROM clients WHERE owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert AI recommendations for their clients" ON ai_medication_recommendations
    FOR INSERT WITH CHECK (
        request_id IN (
            SELECT id FROM ai_recommendation_requests 
            WHERE patient_id IN (
                SELECT id FROM clients WHERE owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update AI recommendations for their clients" ON ai_medication_recommendations
    FOR UPDATE USING (
        request_id IN (
            SELECT id FROM ai_recommendation_requests 
            WHERE patient_id IN (
                SELECT id FROM clients WHERE owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete AI recommendations for their clients" ON ai_medication_recommendations
    FOR DELETE USING (
        request_id IN (
            SELECT id FROM ai_recommendation_requests 
            WHERE patient_id IN (
                SELECT id FROM clients WHERE owner_id = auth.uid()
            )
        )
    );

-- AI recommendation feedback policies
CREATE POLICY "Users can view AI feedback for their clients" ON ai_recommendation_feedback
    FOR SELECT USING (
        recommendation_id IN (
            SELECT id FROM ai_medication_recommendations 
            WHERE request_id IN (
                SELECT id FROM ai_recommendation_requests 
                WHERE patient_id IN (
                    SELECT id FROM clients WHERE owner_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can insert AI feedback for their clients" ON ai_recommendation_feedback
    FOR INSERT WITH CHECK (
        recommendation_id IN (
            SELECT id FROM ai_medication_recommendations 
            WHERE request_id IN (
                SELECT id FROM ai_recommendation_requests 
                WHERE patient_id IN (
                    SELECT id FROM clients WHERE owner_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can update AI feedback for their clients" ON ai_recommendation_feedback
    FOR UPDATE USING (
        recommendation_id IN (
            SELECT id FROM ai_medication_recommendations 
            WHERE request_id IN (
                SELECT id FROM ai_recommendation_requests 
                WHERE patient_id IN (
                    SELECT id FROM clients WHERE owner_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can delete AI feedback for their clients" ON ai_recommendation_feedback
    FOR DELETE USING (
        recommendation_id IN (
            SELECT id FROM ai_medication_recommendations 
            WHERE request_id IN (
                SELECT id FROM ai_recommendation_requests 
                WHERE patient_id IN (
                    SELECT id FROM clients WHERE owner_id = auth.uid()
                )
            )
        )
    );

-- AI model performance policies (system-wide access)
CREATE POLICY "Users can view AI model performance" ON ai_model_performance
    FOR SELECT USING (true);

CREATE POLICY "Users can insert AI model performance" ON ai_model_performance
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update AI model performance" ON ai_model_performance
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete AI model performance" ON ai_model_performance
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- AI recommendation analytics policies (system-wide access)
CREATE POLICY "Users can view AI recommendation analytics" ON ai_recommendation_analytics
    FOR SELECT USING (true);

CREATE POLICY "Users can insert AI recommendation analytics" ON ai_recommendation_analytics
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update AI recommendation analytics" ON ai_recommendation_analytics
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete AI recommendation analytics" ON ai_recommendation_analytics
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Functions for AI-powered medication recommendations

-- Function to generate AI medication recommendations
CREATE OR REPLACE FUNCTION generate_ai_medication_recommendations(
    p_patient_id UUID,
    p_request_type VARCHAR(50),
    p_clinical_context JSONB,
    p_model_id UUID DEFAULT NULL
)
RETURNS TABLE (
    request_id UUID,
    recommendation_id UUID,
    medication_name VARCHAR(255),
    confidence_score DECIMAL(5,4),
    recommendation_rank INTEGER,
    reasoning_explanation TEXT,
    expected_efficacy DECIMAL(5,4),
    expected_tolerability DECIMAL(5,4),
    risk_score DECIMAL(5,4)
) AS $$
DECLARE
    v_request_id UUID;
    v_model_id UUID;
    v_recommendation_id UUID;
    v_medication_name VARCHAR(255);
    v_confidence_score DECIMAL(5,4);
    v_rank INTEGER := 1;
    v_reasoning TEXT;
    v_efficacy DECIMAL(5,4);
    v_tolerability DECIMAL(5,4);
    v_risk DECIMAL(5,4);
BEGIN
    -- Get the best available model if not specified
    IF p_model_id IS NULL THEN
        SELECT id INTO v_model_id
        FROM ai_recommendation_models
        WHERE is_active = TRUE AND is_production_ready = TRUE
        ORDER BY model_accuracy DESC, created_at DESC
        LIMIT 1;
    ELSE
        v_model_id := p_model_id;
    END IF;

    -- Create recommendation request
    INSERT INTO ai_recommendation_requests (
        patient_id,
        request_type,
        clinical_context,
        input_features,
        model_id,
        status
    ) VALUES (
        p_patient_id,
        p_request_type,
        p_clinical_context,
        p_clinical_context, -- Using clinical context as input features for now
        v_model_id,
        'processing'
    ) RETURNING id INTO v_request_id;

    -- Simulate AI recommendations (in real implementation, this would call ML model)
    -- For demonstration, we'll generate mock recommendations based on clinical context
    
    -- Extract diagnosis from clinical context
    DECLARE
        v_diagnosis VARCHAR(255);
        v_age INTEGER;
        v_gender VARCHAR(10);
    BEGIN
        v_diagnosis := p_clinical_context->>'primary_diagnosis';
        v_age := (p_clinical_context->>'age')::INTEGER;
        v_gender := p_clinical_context->>'gender';
        
        -- Generate recommendations based on diagnosis
        IF v_diagnosis ILIKE '%depression%' THEN
            -- Depression recommendations
            INSERT INTO ai_medication_recommendations (
                request_id, medication_name, medication_class, recommended_dosage,
                dosage_form, frequency, duration_days, confidence_score, recommendation_rank,
                reasoning_explanation, expected_efficacy, expected_tolerability, risk_score
            ) VALUES (
                v_request_id, 'Sertraline', 'SSRI', '50mg',
                'tablet', 'daily', 90, 0.85, 1,
                'First-line SSRI with good efficacy and tolerability profile for depression',
                0.78, 0.82, 0.15
            ) RETURNING id INTO v_recommendation_id;
            
            INSERT INTO ai_medication_recommendations (
                request_id, medication_name, medication_class, recommended_dosage,
                dosage_form, frequency, duration_days, confidence_score, recommendation_rank,
                reasoning_explanation, expected_efficacy, expected_tolerability, risk_score
            ) VALUES (
                v_request_id, 'Escitalopram', 'SSRI', '10mg',
                'tablet', 'daily', 90, 0.82, 2,
                'Alternative SSRI with excellent tolerability and good efficacy',
                0.75, 0.88, 0.12
            );
            
            INSERT INTO ai_medication_recommendations (
                request_id, medication_name, medication_class, recommended_dosage,
                dosage_form, frequency, duration_days, confidence_score, recommendation_rank,
                reasoning_explanation, expected_efficacy, expected_tolerability, risk_score
            ) VALUES (
                v_request_id, 'Bupropion', 'NDRI', '150mg',
                'tablet', 'daily', 90, 0.78, 3,
                'Non-SSRI option with minimal sexual side effects',
                0.72, 0.85, 0.18
            );
            
        ELSIF v_diagnosis ILIKE '%anxiety%' THEN
            -- Anxiety recommendations
            INSERT INTO ai_medication_recommendations (
                request_id, medication_name, medication_class, recommended_dosage,
                dosage_form, frequency, duration_days, confidence_score, recommendation_rank,
                reasoning_explanation, expected_efficacy, expected_tolerability, risk_score
            ) VALUES (
                v_request_id, 'Sertraline', 'SSRI', '25mg',
                'tablet', 'daily', 90, 0.88, 1,
                'First-line SSRI for anxiety disorders with proven efficacy',
                0.82, 0.80, 0.14
            );
            
            INSERT INTO ai_medication_recommendations (
                request_id, medication_name, medication_class, recommended_dosage,
                dosage_form, frequency, duration_days, confidence_score, recommendation_rank,
                reasoning_explanation, expected_efficacy, expected_tolerability, risk_score
            ) VALUES (
                v_request_id, 'Venlafaxine', 'SNRI', '37.5mg',
                'tablet', 'daily', 90, 0.80, 2,
                'SNRI option for patients with comorbid depression and anxiety',
                0.78, 0.75, 0.20
            );
            
        ELSIF v_diagnosis ILIKE '%bipolar%' THEN
            -- Bipolar recommendations
            INSERT INTO ai_medication_recommendations (
                request_id, medication_name, medication_class, recommended_dosage,
                dosage_form, frequency, duration_days, confidence_score, recommendation_rank,
                reasoning_explanation, expected_efficacy, expected_tolerability, risk_score
            ) VALUES (
                v_request_id, 'Lithium', 'Mood Stabilizer', '300mg',
                'tablet', 'twice_daily', 90, 0.90, 1,
                'Gold standard mood stabilizer for bipolar disorder',
                0.85, 0.70, 0.25
            );
            
            INSERT INTO ai_medication_recommendations (
                request_id, medication_name, medication_class, recommended_dosage,
                dosage_form, frequency, duration_days, confidence_score, recommendation_rank,
                reasoning_explanation, expected_efficacy, expected_tolerability, risk_score
            ) VALUES (
                v_request_id, 'Lamotrigine', 'Mood Stabilizer', '25mg',
                'tablet', 'daily', 90, 0.85, 2,
                'Alternative mood stabilizer with good tolerability profile',
                0.80, 0.85, 0.15
            );
        END IF;
    END;

    -- Update request status
    UPDATE ai_recommendation_requests 
    SET status = 'completed', processing_time_ms = 150 -- Simulated processing time
    WHERE id = v_request_id;

    -- Return recommendations
    RETURN QUERY
    SELECT 
        v_request_id,
        amr.id,
        amr.medication_name,
        amr.confidence_score,
        amr.recommendation_rank,
        amr.reasoning_explanation,
        amr.expected_efficacy,
        amr.expected_tolerability,
        amr.risk_score
    FROM ai_medication_recommendations amr
    WHERE amr.request_id = v_request_id
    ORDER BY amr.recommendation_rank;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update AI model performance
CREATE OR REPLACE FUNCTION update_ai_model_performance(
    p_model_id UUID,
    p_evaluation_date DATE DEFAULT CURRENT_DATE,
    p_evaluation_period_days INTEGER DEFAULT 30
)
RETURNS VOID AS $$
DECLARE
    v_start_date DATE;
    v_performance RECORD;
BEGIN
    v_start_date := p_evaluation_date - INTERVAL '1 day' * p_evaluation_period_days;
    
    -- Calculate performance metrics
    SELECT 
        COUNT(*) as total_recommendations,
        COUNT(*) FILTER (WHERE is_accepted = TRUE) as accepted_recommendations,
        COUNT(*) FILTER (WHERE is_accepted = FALSE) as rejected_recommendations,
        COUNT(*) FILTER (WHERE EXISTS (
            SELECT 1 FROM ai_recommendation_feedback arf 
            WHERE arf.recommendation_id = amr.id 
            AND arf.clinical_outcome = 'effective'
        )) as effective_recommendations,
        COUNT(*) FILTER (WHERE EXISTS (
            SELECT 1 FROM ai_recommendation_feedback arf 
            WHERE arf.recommendation_id = amr.id 
            AND arf.clinical_outcome = 'ineffective'
        )) as ineffective_recommendations,
        COUNT(*) FILTER (WHERE EXISTS (
            SELECT 1 FROM ai_recommendation_feedback arf 
            WHERE arf.recommendation_id = amr.id 
            AND arf.clinical_outcome = 'adverse_event'
        )) as adverse_events,
        AVG(confidence_score) as avg_confidence_score,
        AVG(arf.feedback_score) as avg_feedback_score
    INTO v_performance
    FROM ai_medication_recommendations amr
    LEFT JOIN ai_recommendation_feedback arf ON arf.recommendation_id = amr.id
    WHERE amr.request_id IN (
        SELECT id FROM ai_recommendation_requests 
        WHERE model_id = p_model_id 
        AND request_timestamp >= v_start_date
    );
    
    -- Insert or update performance record
    INSERT INTO ai_model_performance (
        model_id,
        evaluation_date,
        evaluation_period_days,
        total_recommendations,
        accepted_recommendations,
        rejected_recommendations,
        effective_recommendations,
        ineffective_recommendations,
        adverse_events,
        average_confidence_score,
        average_feedback_score,
        average_acceptance_rate,
        average_effectiveness_rate,
        average_adverse_event_rate
    ) VALUES (
        p_model_id,
        p_evaluation_date,
        p_evaluation_period_days,
        COALESCE(v_performance.total_recommendations, 0),
        COALESCE(v_performance.accepted_recommendations, 0),
        COALESCE(v_performance.rejected_recommendations, 0),
        COALESCE(v_performance.effective_recommendations, 0),
        COALESCE(v_performance.ineffective_recommendations, 0),
        COALESCE(v_performance.adverse_events, 0),
        COALESCE(v_performance.avg_confidence_score, 0),
        COALESCE(v_performance.avg_feedback_score, 0),
        CASE WHEN v_performance.total_recommendations > 0 
             THEN v_performance.accepted_recommendations::DECIMAL / v_performance.total_recommendations 
             ELSE 0 END,
        CASE WHEN v_performance.total_recommendations > 0 
             THEN v_performance.effective_recommendations::DECIMAL / v_performance.total_recommendations 
             ELSE 0 END,
        CASE WHEN v_performance.total_recommendations > 0 
             THEN v_performance.adverse_events::DECIMAL / v_performance.total_recommendations 
             ELSE 0 END
    )
    ON CONFLICT (model_id, evaluation_date) 
    DO UPDATE SET
        evaluation_period_days = EXCLUDED.evaluation_period_days,
        total_recommendations = EXCLUDED.total_recommendations,
        accepted_recommendations = EXCLUDED.accepted_recommendations,
        rejected_recommendations = EXCLUDED.rejected_recommendations,
        effective_recommendations = EXCLUDED.effective_recommendations,
        ineffective_recommendations = EXCLUDED.ineffective_recommendations,
        adverse_events = EXCLUDED.adverse_events,
        average_confidence_score = EXCLUDED.average_confidence_score,
        average_feedback_score = EXCLUDED.average_feedback_score,
        average_acceptance_rate = EXCLUDED.average_acceptance_rate,
        average_effectiveness_rate = EXCLUDED.average_effectiveness_rate,
        average_adverse_event_rate = EXCLUDED.average_adverse_event_rate,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate AI recommendation analytics
CREATE OR REPLACE FUNCTION generate_ai_recommendation_analytics(
    p_analysis_date DATE DEFAULT CURRENT_DATE,
    p_analysis_period_months INTEGER DEFAULT 1
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
        'total_requests', (
            SELECT COUNT(*) FROM ai_recommendation_requests 
            WHERE request_timestamp >= v_start_date
        ),
        'total_recommendations', (
            SELECT COUNT(*) FROM ai_medication_recommendations amr
            JOIN ai_recommendation_requests arr ON arr.id = amr.request_id
            WHERE arr.request_timestamp >= v_start_date
        ),
        'average_confidence_score', (
            SELECT AVG(confidence_score) FROM ai_medication_recommendations amr
            JOIN ai_recommendation_requests arr ON arr.id = amr.request_id
            WHERE arr.request_timestamp >= v_start_date
        ),
        'average_processing_time_ms', (
            SELECT AVG(processing_time_ms) FROM ai_recommendation_requests 
            WHERE request_timestamp >= v_start_date AND processing_time_ms IS NOT NULL
        ),
        'most_recommended_medications', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'medication_name', medication_name,
                    'recommendation_count', recommendation_count,
                    'average_confidence', average_confidence
                )
            )
            FROM (
                SELECT 
                    medication_name,
                    COUNT(*) as recommendation_count,
                    AVG(confidence_score) as average_confidence
                FROM ai_medication_recommendations amr
                JOIN ai_recommendation_requests arr ON arr.id = amr.request_id
                WHERE arr.request_timestamp >= v_start_date
                GROUP BY medication_name
                ORDER BY recommendation_count DESC
                LIMIT 10
            ) top_meds
        ),
        'recommendation_acceptance_rate', (
            SELECT 
                CASE WHEN COUNT(*) > 0 
                     THEN COUNT(*) FILTER (WHERE is_accepted = TRUE)::DECIMAL / COUNT(*) 
                     ELSE 0 END
            FROM ai_medication_recommendations amr
            JOIN ai_recommendation_requests arr ON arr.id = amr.request_id
            WHERE arr.request_timestamp >= v_start_date
        ),
        'clinical_outcome_distribution', (
            SELECT jsonb_object_agg(
                COALESCE(clinical_outcome, 'unknown'),
                outcome_count
            )
            FROM (
                SELECT 
                    clinical_outcome,
                    COUNT(*) as outcome_count
                FROM ai_recommendation_feedback arf
                JOIN ai_medication_recommendations amr ON amr.id = arf.recommendation_id
                JOIN ai_recommendation_requests arr ON arr.id = amr.request_id
                WHERE arr.request_timestamp >= v_start_date
                GROUP BY clinical_outcome
            ) outcomes
        ),
        'provider_satisfaction_distribution', (
            SELECT jsonb_object_agg(
                provider_satisfaction::TEXT,
                satisfaction_count
            )
            FROM (
                SELECT 
                    provider_satisfaction,
                    COUNT(*) as satisfaction_count
                FROM ai_recommendation_feedback arf
                JOIN ai_medication_recommendations amr ON amr.id = arf.recommendation_id
                JOIN ai_recommendation_requests arr ON arr.id = amr.request_id
                WHERE arr.request_timestamp >= v_start_date
                AND provider_satisfaction IS NOT NULL
                GROUP BY provider_satisfaction
            ) satisfaction
        )
    ) INTO v_analytics;
    
    RETURN v_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_recommendation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_recommendation_models_updated_at
    BEFORE UPDATE ON ai_recommendation_models
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_recommendation_updated_at();

CREATE TRIGGER ai_recommendation_requests_updated_at
    BEFORE UPDATE ON ai_recommendation_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_recommendation_updated_at();

CREATE TRIGGER ai_medication_recommendations_updated_at
    BEFORE UPDATE ON ai_medication_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_recommendation_updated_at();

CREATE TRIGGER ai_recommendation_feedback_updated_at
    BEFORE UPDATE ON ai_recommendation_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_recommendation_updated_at();

CREATE TRIGGER ai_model_performance_updated_at
    BEFORE UPDATE ON ai_model_performance
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_recommendation_updated_at();

CREATE TRIGGER ai_recommendation_analytics_updated_at
    BEFORE UPDATE ON ai_recommendation_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_recommendation_updated_at();











