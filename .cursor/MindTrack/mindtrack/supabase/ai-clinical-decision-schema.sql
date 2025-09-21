-- AI Clinical Decision Support System Schema
-- This schema stores AI-generated clinical insights, diagnostic suggestions, and risk assessments

-- AI Clinical Insights Table
CREATE TABLE IF NOT EXISTS ai_clinical_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    clinician_id UUID NOT NULL,
    insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('diagnostic', 'treatment', 'risk', 'medication_interaction', 'session_analysis')),
    
    -- Diagnostic insights
    diagnosis VARCHAR(255),
    dsm5_code VARCHAR(20),
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
    diagnostic_criteria JSONB,
    differential_diagnoses JSONB,
    recommended_assessments JSONB,
    
    -- Treatment insights
    treatment_name VARCHAR(255),
    evidence_level VARCHAR(5) CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
    effectiveness_score INTEGER CHECK (effectiveness_score >= 0 AND effectiveness_score <= 100),
    side_effects JSONB,
    contraindications JSONB,
    monitoring_requirements JSONB,
    
    -- Risk assessment insights
    risk_type VARCHAR(50) CHECK (risk_type IN ('suicide', 'self-harm', 'violence', 'substance-abuse', 'medication-interaction')),
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_factors JSONB,
    risk_recommendations JSONB,
    urgency_level VARCHAR(20) CHECK (urgency_level IN ('immediate', 'within-24h', 'within-week', 'routine')),
    
    -- Session analysis insights
    sentiment_analysis VARCHAR(20) CHECK (sentiment_analysis IN ('positive', 'neutral', 'negative')),
    risk_indicators JSONB,
    session_recommendations JSONB,
    
    -- Medication interaction insights
    medication_interactions JSONB,
    
    -- Metadata
    input_data JSONB NOT NULL, -- Store the input data used for analysis
    ai_model_version VARCHAR(50),
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Model Performance Tracking
CREATE TABLE IF NOT EXISTS ai_model_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    
    -- Performance metrics
    accuracy_score DECIMAL(5,4),
    precision_score DECIMAL(5,4),
    recall_score DECIMAL(5,4),
    f1_score DECIMAL(5,4),
    
    -- Usage statistics
    total_predictions INTEGER DEFAULT 0,
    successful_predictions INTEGER DEFAULT 0,
    failed_predictions INTEGER DEFAULT 0,
    
    -- Timestamps
    last_trained_at TIMESTAMP WITH TIME ZONE,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Feedback and Learning
CREATE TABLE IF NOT EXISTS ai_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    insight_id UUID REFERENCES ai_clinical_insights(id) ON DELETE CASCADE,
    clinician_id UUID NOT NULL,
    
    -- Feedback on AI suggestions
    feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('accurate', 'inaccurate', 'partially_accurate', 'not_applicable')),
    accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
    usefulness_rating INTEGER CHECK (usefulness_rating >= 1 AND usefulness_rating <= 5),
    
    -- Detailed feedback
    feedback_notes TEXT,
    corrections_made JSONB, -- Store any corrections or modifications made
    actual_outcome JSONB, -- Store the actual clinical outcome
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Usage Analytics
CREATE TABLE IF NOT EXISTS ai_usage_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinician_id UUID NOT NULL,
    insight_type VARCHAR(50) NOT NULL,
    
    -- Usage metrics
    daily_usage_count INTEGER DEFAULT 0,
    weekly_usage_count INTEGER DEFAULT 0,
    monthly_usage_count INTEGER DEFAULT 0,
    
    -- Performance metrics
    average_confidence_score DECIMAL(5,2),
    average_processing_time_ms INTEGER,
    
    -- Date tracking
    usage_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(clinician_id, insight_type, usage_date)
);

-- AI Clinical Guidelines
CREATE TABLE IF NOT EXISTS ai_clinical_guidelines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    condition_name VARCHAR(255) NOT NULL,
    dsm5_code VARCHAR(20),
    
    -- Guidelines data
    diagnostic_criteria JSONB NOT NULL,
    treatment_guidelines JSONB NOT NULL,
    risk_factors JSONB NOT NULL,
    assessment_tools JSONB NOT NULL,
    
    -- Evidence levels
    evidence_level VARCHAR(5) CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
    last_updated_source VARCHAR(255),
    last_updated_date DATE,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_clinical_insights_patient_id ON ai_clinical_insights(patient_id);
CREATE INDEX IF NOT EXISTS idx_ai_clinical_insights_clinician_id ON ai_clinical_insights(clinician_id);
CREATE INDEX IF NOT EXISTS idx_ai_clinical_insights_insight_type ON ai_clinical_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_clinical_insights_created_at ON ai_clinical_insights(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_clinical_insights_risk_level ON ai_clinical_insights(risk_level);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_insight_id ON ai_feedback(insight_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_clinician_id ON ai_feedback(clinician_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_feedback_type ON ai_feedback(feedback_type);

CREATE INDEX IF NOT EXISTS idx_ai_usage_analytics_clinician_id ON ai_usage_analytics(clinician_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_analytics_usage_date ON ai_usage_analytics(usage_date);

CREATE INDEX IF NOT EXISTS idx_ai_clinical_guidelines_condition ON ai_clinical_guidelines(condition_name);
CREATE INDEX IF NOT EXISTS idx_ai_clinical_guidelines_dsm5_code ON ai_clinical_guidelines(dsm5_code);

-- Row Level Security (RLS) Policies
ALTER TABLE ai_clinical_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for ai_clinical_insights
CREATE POLICY "Clinicians can view their own insights" ON ai_clinical_insights
    FOR SELECT USING (auth.uid() = clinician_id);

CREATE POLICY "Clinicians can insert their own insights" ON ai_clinical_insights
    FOR INSERT WITH CHECK (auth.uid() = clinician_id);

CREATE POLICY "Clinicians can update their own insights" ON ai_clinical_insights
    FOR UPDATE USING (auth.uid() = clinician_id);

CREATE POLICY "Clinicians can delete their own insights" ON ai_clinical_insights
    FOR DELETE USING (auth.uid() = clinician_id);

-- Policies for ai_feedback
CREATE POLICY "Clinicians can view their own feedback" ON ai_feedback
    FOR SELECT USING (auth.uid() = clinician_id);

CREATE POLICY "Clinicians can insert their own feedback" ON ai_feedback
    FOR INSERT WITH CHECK (auth.uid() = clinician_id);

CREATE POLICY "Clinicians can update their own feedback" ON ai_feedback
    FOR UPDATE USING (auth.uid() = clinician_id);

-- Policies for ai_usage_analytics
CREATE POLICY "Clinicians can view their own analytics" ON ai_usage_analytics
    FOR SELECT USING (auth.uid() = clinician_id);

CREATE POLICY "Clinicians can insert their own analytics" ON ai_usage_analytics
    FOR INSERT WITH CHECK (auth.uid() = clinician_id);

CREATE POLICY "Clinicians can update their own analytics" ON ai_usage_analytics
    FOR UPDATE USING (auth.uid() = clinician_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_ai_clinical_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_ai_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_ai_usage_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_ai_clinical_guidelines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
CREATE TRIGGER trigger_update_ai_clinical_insights_updated_at
    BEFORE UPDATE ON ai_clinical_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_clinical_insights_updated_at();

CREATE TRIGGER trigger_update_ai_feedback_updated_at
    BEFORE UPDATE ON ai_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_feedback_updated_at();

CREATE TRIGGER trigger_update_ai_usage_analytics_updated_at
    BEFORE UPDATE ON ai_usage_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_usage_analytics_updated_at();

CREATE TRIGGER trigger_update_ai_clinical_guidelines_updated_at
    BEFORE UPDATE ON ai_clinical_guidelines
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_clinical_guidelines_updated_at();

-- Insert sample clinical guidelines
INSERT INTO ai_clinical_guidelines (condition_name, dsm5_code, diagnostic_criteria, treatment_guidelines, risk_factors, assessment_tools, evidence_level) VALUES
(
    'Major Depressive Disorder',
    '296.20',
    '["Depressed mood most of the day", "Markedly diminished interest in activities", "Significant weight loss or gain", "Insomnia or hypersomnia", "Psychomotor agitation or retardation", "Fatigue or loss of energy", "Feelings of worthlessness or guilt", "Diminished ability to think or concentrate", "Recurrent thoughts of death"]',
    '["Cognitive Behavioral Therapy (CBT)", "Interpersonal Therapy (IPT)", "Selective Serotonin Reuptake Inhibitors (SSRIs)", "Serotonin-Norepinephrine Reuptake Inhibitors (SNRIs)", "Electroconvulsive Therapy (ECT) for severe cases"]',
    '["Previous suicide attempts", "Family history of depression", "Substance abuse", "Chronic medical conditions", "Social isolation", "Recent life stressors"]',
    '["PHQ-9", "Beck Depression Inventory", "Hamilton Rating Scale for Depression", "Montgomery-Asberg Depression Rating Scale"]',
    'A'
),
(
    'Generalized Anxiety Disorder',
    '300.02',
    '["Excessive anxiety and worry", "Difficulty controlling worry", "Restlessness or feeling keyed up", "Being easily fatigued", "Difficulty concentrating", "Irritability", "Muscle tension", "Sleep disturbance"]',
    '["Cognitive Behavioral Therapy (CBT)", "Acceptance and Commitment Therapy (ACT)", "Selective Serotonin Reuptake Inhibitors (SSRIs)", "Buspirone", "Benzodiazepines (short-term)"]',
    '["Family history of anxiety", "Childhood trauma", "Chronic stress", "Medical conditions", "Substance use", "Personality factors"]',
    '["GAD-7", "Beck Anxiety Inventory", "State-Trait Anxiety Inventory", "Penn State Worry Questionnaire"]',
    'A'
),
(
    'Posttraumatic Stress Disorder',
    '309.81',
    '["Exposure to traumatic event", "Intrusive memories or dreams", "Avoidance of trauma-related stimuli", "Negative alterations in cognitions and mood", "Marked alterations in arousal and reactivity"]',
    '["Trauma-Focused Cognitive Behavioral Therapy (TF-CBT)", "Eye Movement Desensitization and Reprocessing (EMDR)", "Prolonged Exposure Therapy", "Selective Serotonin Reuptake Inhibitors (SSRIs)", "Prazosin for nightmares"]',
    '["Previous trauma exposure", "Childhood abuse", "Combat exposure", "Natural disasters", "Accidents", "Interpersonal violence"]',
    '["PCL-5", "Impact of Event Scale", "Trauma Symptom Inventory", "Clinician-Administered PTSD Scale"]',
    'A'
);

-- Comments for documentation
COMMENT ON TABLE ai_clinical_insights IS 'Stores AI-generated clinical insights including diagnostic suggestions, treatment recommendations, and risk assessments';
COMMENT ON TABLE ai_model_performance IS 'Tracks performance metrics of AI models used in clinical decision support';
COMMENT ON TABLE ai_feedback IS 'Stores clinician feedback on AI suggestions for continuous learning and improvement';
COMMENT ON TABLE ai_usage_analytics IS 'Tracks usage patterns and analytics for AI clinical decision support features';
COMMENT ON TABLE ai_clinical_guidelines IS 'Stores evidence-based clinical guidelines used by AI for decision support';


