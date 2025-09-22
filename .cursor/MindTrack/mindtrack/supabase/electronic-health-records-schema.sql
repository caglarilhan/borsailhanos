-- Electronic Health Records (EHR) Integration Schema
-- Comprehensive EHR management for American psychiatrists

-- FHIR Resources
CREATE TABLE IF NOT EXISTS fhir_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_type VARCHAR(50) NOT NULL, -- 'Patient', 'Practitioner', 'Encounter', 'Observation', 'DiagnosticReport', 'MedicationRequest', 'Procedure'
    resource_id VARCHAR(100) NOT NULL,
    fhir_version VARCHAR(10) NOT NULL DEFAULT 'R4',
    resource_data JSONB NOT NULL,
    patient_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    practitioner_id UUID REFERENCES users(id),
    encounter_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resource_type, resource_id)
);

-- HL7 FHIR Encounters
CREATE TABLE IF NOT EXISTS fhir_encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id VARCHAR(100) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES users(id),
    encounter_class VARCHAR(50) NOT NULL, -- 'AMB', 'EMER', 'IMP', 'ACUTE', 'NONAC', 'PRENC', 'SS', 'VR'
    encounter_type VARCHAR(100) NOT NULL, -- 'psychiatric_evaluation', 'psychotherapy', 'medication_management', 'crisis_intervention'
    status VARCHAR(20) NOT NULL DEFAULT 'planned', -- 'planned', 'arrived', 'triaged', 'in-progress', 'onleave', 'finished', 'cancelled'
    priority VARCHAR(20), -- 'routine', 'urgent', 'asap', 'stat'
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    location VARCHAR(200),
    service_type VARCHAR(100),
    diagnosis_codes TEXT[],
    procedure_codes TEXT[],
    chief_complaint TEXT,
    history_of_present_illness TEXT,
    mental_status_exam TEXT,
    assessment_and_plan TEXT,
    treatment_goals TEXT,
    follow_up_instructions TEXT,
    fhir_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clinical Observations
CREATE TABLE IF NOT EXISTS clinical_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    observation_id VARCHAR(100) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES users(id),
    encounter_id UUID REFERENCES fhir_encounters(id),
    observation_type VARCHAR(100) NOT NULL, -- 'vital_signs', 'mental_status', 'mood', 'anxiety', 'sleep', 'appetite', 'energy', 'concentration'
    observation_category VARCHAR(50) NOT NULL, -- 'vital-signs', 'survey', 'laboratory', 'imaging', 'procedure'
    observation_code VARCHAR(20) NOT NULL, -- LOINC codes
    observation_value TEXT,
    observation_unit VARCHAR(20),
    reference_range TEXT,
    interpretation VARCHAR(50), -- 'normal', 'high', 'low', 'abnormal'
    effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'final', -- 'registered', 'preliminary', 'final', 'amended', 'corrected', 'cancelled'
    fhir_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diagnostic Reports
CREATE TABLE IF NOT EXISTS diagnostic_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id VARCHAR(100) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES users(id),
    encounter_id UUID REFERENCES fhir_encounters(id),
    report_type VARCHAR(100) NOT NULL, -- 'psychiatric_evaluation', 'psychological_testing', 'neuropsychological_assessment', 'laboratory', 'imaging'
    report_category VARCHAR(50) NOT NULL, -- 'diagnostic', 'laboratory', 'imaging', 'pathology'
    report_status VARCHAR(20) DEFAULT 'final', -- 'registered', 'partial', 'preliminary', 'final', 'amended', 'corrected', 'appended', 'cancelled'
    report_date TIMESTAMP WITH TIME ZONE NOT NULL,
    effective_date TIMESTAMP WITH TIME ZONE,
    conclusion TEXT,
    interpretation TEXT,
    findings TEXT,
    recommendations TEXT,
    diagnosis_codes TEXT[],
    procedure_codes TEXT[],
    attachments JSONB, -- File attachments, images, documents
    fhir_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication Requests (Prescriptions)
CREATE TABLE IF NOT EXISTS medication_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_request_id VARCHAR(100) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES users(id),
    encounter_id UUID REFERENCES fhir_encounters(id),
    medication_name VARCHAR(200) NOT NULL,
    medication_code VARCHAR(50), -- RxNorm code
    medication_form VARCHAR(50), -- 'tablet', 'capsule', 'liquid', 'injection', 'patch'
    medication_strength VARCHAR(100),
    dosage_instruction TEXT NOT NULL,
    frequency VARCHAR(100),
    route VARCHAR(50), -- 'oral', 'sublingual', 'injection', 'topical', 'inhalation'
    quantity INTEGER,
    quantity_unit VARCHAR(20),
    refills INTEGER DEFAULT 0,
    days_supply INTEGER,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'on-hold', 'cancelled', 'completed', 'entered-in-error', 'stopped', 'draft', 'unknown'
    intent VARCHAR(20) DEFAULT 'order', -- 'proposal', 'plan', 'order', 'original-order', 'reflex-order', 'filler-order', 'instance-order'
    priority VARCHAR(20), -- 'routine', 'urgent', 'asap', 'stat'
    reason_code VARCHAR(50),
    reason_text TEXT,
    fhir_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Procedures
CREATE TABLE IF NOT EXISTS procedures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    procedure_id VARCHAR(100) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES users(id),
    encounter_id UUID REFERENCES fhir_encounters(id),
    procedure_type VARCHAR(100) NOT NULL, -- 'psychiatric_evaluation', 'psychotherapy', 'cognitive_assessment', 'risk_assessment'
    procedure_code VARCHAR(50) NOT NULL, -- CPT codes
    procedure_status VARCHAR(20) DEFAULT 'completed', -- 'preparation', 'in-progress', 'not-done', 'on-hold', 'stopped', 'completed', 'entered-in-error', 'unknown'
    procedure_category VARCHAR(50), -- 'diagnostic', 'therapeutic', 'assessment', 'screening'
    procedure_date TIMESTAMP WITH TIME ZONE NOT NULL,
    procedure_duration_minutes INTEGER,
    procedure_location VARCHAR(200),
    procedure_outcome VARCHAR(100),
    procedure_notes TEXT,
    procedure_results TEXT,
    complications TEXT,
    follow_up_instructions TEXT,
    fhir_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quality Measures (MIPS)
CREATE TABLE IF NOT EXISTS quality_measures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    measure_id VARCHAR(50) NOT NULL UNIQUE,
    measure_name VARCHAR(200) NOT NULL,
    measure_description TEXT,
    measure_category VARCHAR(50) NOT NULL, -- 'quality', 'cost', 'improvement_activities', 'promoting_interoperability'
    measure_type VARCHAR(50) NOT NULL, -- 'process', 'outcome', 'structure', 'patient_experience'
    measure_domain VARCHAR(100), -- 'mental_health', 'substance_abuse', 'preventive_care', 'chronic_care'
    numerator_description TEXT,
    denominator_description TEXT,
    exclusion_description TEXT,
    measure_version VARCHAR(20),
    reporting_year INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quality Measure Reporting
CREATE TABLE IF NOT EXISTS quality_measure_reporting (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    measure_id UUID NOT NULL REFERENCES quality_measures(id),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES users(id),
    reporting_period_start DATE NOT NULL,
    reporting_period_end DATE NOT NULL,
    numerator_value INTEGER DEFAULT 0,
    denominator_value INTEGER DEFAULT 0,
    exclusion_value INTEGER DEFAULT 0,
    performance_rate DECIMAL(5,2),
    meets_criteria BOOLEAN DEFAULT FALSE,
    reporting_status VARCHAR(20) DEFAULT 'submitted', -- 'draft', 'submitted', 'accepted', 'rejected'
    submission_date TIMESTAMP WITH TIME ZONE,
    validation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clinical Decision Support Rules
CREATE TABLE IF NOT EXISTS clinical_decision_support_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id VARCHAR(100) NOT NULL UNIQUE,
    rule_name VARCHAR(200) NOT NULL,
    rule_description TEXT,
    rule_category VARCHAR(50) NOT NULL, -- 'drug_interaction', 'allergy_check', 'dosing', 'contraindication', 'monitoring'
    rule_type VARCHAR(50) NOT NULL, -- 'alert', 'reminder', 'guideline', 'protocol'
    rule_trigger VARCHAR(100) NOT NULL, -- 'medication_prescribed', 'diagnosis_added', 'lab_result', 'vital_sign'
    rule_condition JSONB NOT NULL, -- JSON condition logic
    rule_action JSONB NOT NULL, -- JSON action to take
    rule_priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    rule_status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'draft', 'archived'
    applicable_specialties TEXT[], -- Psychiatry, Psychology, etc.
    evidence_level VARCHAR(20), -- 'A', 'B', 'C', 'D'
    last_reviewed_date DATE,
    next_review_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clinical Decision Support Alerts
CREATE TABLE IF NOT EXISTS clinical_decision_support_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id VARCHAR(100) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES users(id),
    encounter_id UUID REFERENCES fhir_encounters(id),
    rule_id UUID NOT NULL REFERENCES clinical_decision_support_rules(id),
    alert_type VARCHAR(50) NOT NULL, -- 'drug_interaction', 'allergy', 'dosing', 'contraindication', 'monitoring'
    alert_severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    alert_title VARCHAR(200) NOT NULL,
    alert_message TEXT NOT NULL,
    alert_recommendation TEXT,
    alert_status VARCHAR(20) DEFAULT 'active', -- 'active', 'acknowledged', 'dismissed', 'resolved'
    alert_acknowledged_by UUID REFERENCES users(id),
    alert_acknowledged_at TIMESTAMP WITH TIME ZONE,
    alert_dismissed_by UUID REFERENCES users(id),
    alert_dismissed_at TIMESTAMP WITH TIME ZONE,
    alert_dismissal_reason TEXT,
    alert_context JSONB, -- Additional context data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interoperability Standards
CREATE TABLE IF NOT EXISTS interoperability_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    standard_name VARCHAR(100) NOT NULL,
    standard_version VARCHAR(20) NOT NULL,
    standard_type VARCHAR(50) NOT NULL, -- 'HL7_FHIR', 'HL7_v2', 'DICOM', 'IHE', 'CDA', 'CCDA'
    standard_description TEXT,
    standard_domain VARCHAR(100), -- 'clinical', 'administrative', 'financial', 'imaging'
    implementation_guide_url VARCHAR(500),
    conformance_profile VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EHR Analytics
CREATE TABLE IF NOT EXISTS ehr_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis_period_months INTEGER NOT NULL DEFAULT 12,
    total_encounters INTEGER NOT NULL DEFAULT 0,
    total_observations INTEGER NOT NULL DEFAULT 0,
    total_diagnostic_reports INTEGER NOT NULL DEFAULT 0,
    total_medication_requests INTEGER NOT NULL DEFAULT 0,
    total_procedures INTEGER NOT NULL DEFAULT 0,
    fhir_compliance_rate DECIMAL(5,2),
    interoperability_score DECIMAL(5,2),
    clinical_decision_support_alerts INTEGER NOT NULL DEFAULT 0,
    quality_measures_performance JSONB,
    meaningful_use_metrics JSONB,
    mips_performance JSONB,
    data_quality_score DECIMAL(5,2),
    user_adoption_rate DECIMAL(5,2),
    system_performance_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fhir_resources_type ON fhir_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_fhir_resources_patient_id ON fhir_resources(patient_id);
CREATE INDEX IF NOT EXISTS idx_fhir_resources_practitioner_id ON fhir_resources(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_fhir_resources_created_at ON fhir_resources(created_at);

CREATE INDEX IF NOT EXISTS idx_fhir_encounters_patient_id ON fhir_encounters(patient_id);
CREATE INDEX IF NOT EXISTS idx_fhir_encounters_practitioner_id ON fhir_encounters(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_fhir_encounters_status ON fhir_encounters(status);
CREATE INDEX IF NOT EXISTS idx_fhir_encounters_start_time ON fhir_encounters(start_time);

CREATE INDEX IF NOT EXISTS idx_clinical_observations_patient_id ON clinical_observations(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_observations_practitioner_id ON clinical_observations(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_clinical_observations_type ON clinical_observations(observation_type);
CREATE INDEX IF NOT EXISTS idx_clinical_observations_effective_date ON clinical_observations(effective_date);

CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_patient_id ON diagnostic_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_practitioner_id ON diagnostic_reports(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_type ON diagnostic_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_date ON diagnostic_reports(report_date);

CREATE INDEX IF NOT EXISTS idx_medication_requests_patient_id ON medication_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_requests_practitioner_id ON medication_requests(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_medication_requests_status ON medication_requests(status);
CREATE INDEX IF NOT EXISTS idx_medication_requests_start_date ON medication_requests(start_date);

CREATE INDEX IF NOT EXISTS idx_procedures_patient_id ON procedures(patient_id);
CREATE INDEX IF NOT EXISTS idx_procedures_practitioner_id ON procedures(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_procedures_type ON procedures(procedure_type);
CREATE INDEX IF NOT EXISTS idx_procedures_date ON procedures(procedure_date);

CREATE INDEX IF NOT EXISTS idx_quality_measures_category ON quality_measures(measure_category);
CREATE INDEX IF NOT EXISTS idx_quality_measures_type ON quality_measures(measure_type);
CREATE INDEX IF NOT EXISTS idx_quality_measures_active ON quality_measures(is_active);

CREATE INDEX IF NOT EXISTS idx_quality_measure_reporting_measure_id ON quality_measure_reporting(measure_id);
CREATE INDEX IF NOT EXISTS idx_quality_measure_reporting_patient_id ON quality_measure_reporting(patient_id);
CREATE INDEX IF NOT EXISTS idx_quality_measure_reporting_period ON quality_measure_reporting(reporting_period_start, reporting_period_end);

CREATE INDEX IF NOT EXISTS idx_clinical_decision_support_rules_category ON clinical_decision_support_rules(rule_category);
CREATE INDEX IF NOT EXISTS idx_clinical_decision_support_rules_type ON clinical_decision_support_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_clinical_decision_support_rules_status ON clinical_decision_support_rules(rule_status);

CREATE INDEX IF NOT EXISTS idx_clinical_decision_support_alerts_patient_id ON clinical_decision_support_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_decision_support_alerts_practitioner_id ON clinical_decision_support_alerts(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_clinical_decision_support_alerts_severity ON clinical_decision_support_alerts(alert_severity);
CREATE INDEX IF NOT EXISTS idx_clinical_decision_support_alerts_status ON clinical_decision_support_alerts(alert_status);

CREATE INDEX IF NOT EXISTS idx_interoperability_standards_type ON interoperability_standards(standard_type);
CREATE INDEX IF NOT EXISTS idx_interoperability_standards_active ON interoperability_standards(is_active);

CREATE INDEX IF NOT EXISTS idx_ehr_analytics_date ON ehr_analytics(analysis_date);

-- RLS Policies
ALTER TABLE fhir_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE fhir_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_measure_reporting ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_decision_support_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_decision_support_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interoperability_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE ehr_analytics ENABLE ROW LEVEL SECURITY;

-- FHIR Resources policies
CREATE POLICY "Users can view FHIR resources for their patients" ON fhir_resources
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can insert FHIR resources for their patients" ON fhir_resources
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) AND practitioner_id = auth.uid()
    );

CREATE POLICY "Users can update FHIR resources for their patients" ON fhir_resources
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can delete FHIR resources for their patients" ON fhir_resources
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

-- FHIR Encounters policies
CREATE POLICY "Users can view encounters for their patients" ON fhir_encounters
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can insert encounters for their patients" ON fhir_encounters
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) AND practitioner_id = auth.uid()
    );

CREATE POLICY "Users can update encounters for their patients" ON fhir_encounters
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can delete encounters for their patients" ON fhir_encounters
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

-- Clinical Observations policies
CREATE POLICY "Users can view observations for their patients" ON clinical_observations
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can insert observations for their patients" ON clinical_observations
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) AND practitioner_id = auth.uid()
    );

CREATE POLICY "Users can update observations for their patients" ON clinical_observations
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can delete observations for their patients" ON clinical_observations
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

-- Diagnostic Reports policies
CREATE POLICY "Users can view diagnostic reports for their patients" ON diagnostic_reports
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can insert diagnostic reports for their patients" ON diagnostic_reports
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) AND practitioner_id = auth.uid()
    );

CREATE POLICY "Users can update diagnostic reports for their patients" ON diagnostic_reports
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can delete diagnostic reports for their patients" ON diagnostic_reports
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

-- Medication Requests policies
CREATE POLICY "Users can view medication requests for their patients" ON medication_requests
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can insert medication requests for their patients" ON medication_requests
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) AND practitioner_id = auth.uid()
    );

CREATE POLICY "Users can update medication requests for their patients" ON medication_requests
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can delete medication requests for their patients" ON medication_requests
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

-- Procedures policies
CREATE POLICY "Users can view procedures for their patients" ON procedures
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can insert procedures for their patients" ON procedures
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) AND practitioner_id = auth.uid()
    );

CREATE POLICY "Users can update procedures for their patients" ON procedures
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can delete procedures for their patients" ON procedures
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

-- Quality Measures policies (system-wide read access)
CREATE POLICY "Users can view quality measures" ON quality_measures
    FOR SELECT USING (true);

CREATE POLICY "Users can insert quality measures" ON quality_measures
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update quality measures" ON quality_measures
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete quality measures" ON quality_measures
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Quality Measure Reporting policies
CREATE POLICY "Users can view quality measure reporting for their patients" ON quality_measure_reporting
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can insert quality measure reporting for their patients" ON quality_measure_reporting
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) AND practitioner_id = auth.uid()
    );

CREATE POLICY "Users can update quality measure reporting for their patients" ON quality_measure_reporting
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can delete quality measure reporting for their patients" ON quality_measure_reporting
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

-- Clinical Decision Support Rules policies (system-wide read access)
CREATE POLICY "Users can view clinical decision support rules" ON clinical_decision_support_rules
    FOR SELECT USING (true);

CREATE POLICY "Users can insert clinical decision support rules" ON clinical_decision_support_rules
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update clinical decision support rules" ON clinical_decision_support_rules
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete clinical decision support rules" ON clinical_decision_support_rules
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Clinical Decision Support Alerts policies
CREATE POLICY "Users can view alerts for their patients" ON clinical_decision_support_alerts
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can insert alerts for their patients" ON clinical_decision_support_alerts
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) AND practitioner_id = auth.uid()
    );

CREATE POLICY "Users can update alerts for their patients" ON clinical_decision_support_alerts
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can delete alerts for their patients" ON clinical_decision_support_alerts
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

-- Interoperability Standards policies (system-wide read access)
CREATE POLICY "Users can view interoperability standards" ON interoperability_standards
    FOR SELECT USING (true);

CREATE POLICY "Users can insert interoperability standards" ON interoperability_standards
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update interoperability standards" ON interoperability_standards
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete interoperability standards" ON interoperability_standards
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- EHR Analytics policies (system-wide access)
CREATE POLICY "Users can view EHR analytics" ON ehr_analytics
    FOR SELECT USING (true);

CREATE POLICY "Users can insert EHR analytics" ON ehr_analytics
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update EHR analytics" ON ehr_analytics
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete EHR analytics" ON ehr_analytics
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Functions for EHR

-- Function to create FHIR encounter
CREATE OR REPLACE FUNCTION create_fhir_encounter(
    p_patient_id UUID,
    p_practitioner_id UUID,
    p_encounter_class VARCHAR(50),
    p_encounter_type VARCHAR(100),
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_chief_complaint TEXT DEFAULT NULL,
    p_diagnosis_codes TEXT[] DEFAULT NULL,
    p_procedure_codes TEXT[] DEFAULT NULL
)
RETURNS TABLE (
    encounter_id UUID,
    fhir_encounter_id VARCHAR(100),
    status VARCHAR(20)
) AS $$
DECLARE
    v_encounter_id UUID;
    v_fhir_encounter_id VARCHAR(100);
    v_status VARCHAR(20) := 'in-progress';
BEGIN
    -- Generate FHIR encounter ID
    v_fhir_encounter_id := 'ENC-' || EXTRACT(EPOCH FROM NOW())::TEXT;
    
    -- Insert FHIR encounter
    INSERT INTO fhir_encounters (
        encounter_id,
        patient_id,
        practitioner_id,
        encounter_class,
        encounter_type,
        start_time,
        chief_complaint,
        diagnosis_codes,
        procedure_codes
    ) VALUES (
        v_fhir_encounter_id,
        p_patient_id,
        p_practitioner_id,
        p_encounter_class,
        p_encounter_type,
        p_start_time,
        p_chief_complaint,
        p_diagnosis_codes,
        p_procedure_codes
    ) RETURNING id INTO v_encounter_id;
    
    RETURN QUERY
    SELECT 
        v_encounter_id,
        v_fhir_encounter_id,
        v_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add clinical observation
CREATE OR REPLACE FUNCTION add_clinical_observation(
    p_patient_id UUID,
    p_practitioner_id UUID,
    p_encounter_id UUID,
    p_observation_type VARCHAR(100),
    p_observation_code VARCHAR(20),
    p_observation_value TEXT,
    p_observation_unit VARCHAR(20) DEFAULT NULL,
    p_interpretation VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE (
    observation_id UUID,
    fhir_observation_id VARCHAR(100),
    status VARCHAR(20)
) AS $$
DECLARE
    v_observation_id UUID;
    v_fhir_observation_id VARCHAR(100);
    v_status VARCHAR(20) := 'final';
BEGIN
    -- Generate FHIR observation ID
    v_fhir_observation_id := 'OBS-' || EXTRACT(EPOCH FROM NOW())::TEXT;
    
    -- Insert clinical observation
    INSERT INTO clinical_observations (
        observation_id,
        patient_id,
        practitioner_id,
        encounter_id,
        observation_type,
        observation_code,
        observation_value,
        observation_unit,
        interpretation
    ) VALUES (
        v_fhir_observation_id,
        p_patient_id,
        p_practitioner_id,
        p_encounter_id,
        p_observation_type,
        p_observation_code,
        p_observation_value,
        p_observation_unit,
        p_interpretation
    ) RETURNING id INTO v_observation_id;
    
    RETURN QUERY
    SELECT 
        v_observation_id,
        v_fhir_observation_id,
        v_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate EHR analytics
CREATE OR REPLACE FUNCTION generate_ehr_analytics(
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
        'total_encounters', (
            SELECT COUNT(*) FROM fhir_encounters
            WHERE created_at >= v_start_date
        ),
        'total_observations', (
            SELECT COUNT(*) FROM clinical_observations
            WHERE created_at >= v_start_date
        ),
        'total_diagnostic_reports', (
            SELECT COUNT(*) FROM diagnostic_reports
            WHERE created_at >= v_start_date
        ),
        'total_medication_requests', (
            SELECT COUNT(*) FROM medication_requests
            WHERE created_at >= v_start_date
        ),
        'total_procedures', (
            SELECT COUNT(*) FROM procedures
            WHERE created_at >= v_start_date
        ),
        'fhir_compliance_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN fhir_data IS NOT NULL THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM fhir_resources
            WHERE created_at >= v_start_date
        ),
        'clinical_decision_support_alerts', (
            SELECT COUNT(*) FROM clinical_decision_support_alerts
            WHERE created_at >= v_start_date
        ),
        'quality_measures_performance', (
            SELECT jsonb_object_agg(
                qm.measure_name,
                jsonb_build_object(
                    'numerator', COALESCE(SUM(qmr.numerator_value), 0),
                    'denominator', COALESCE(SUM(qmr.denominator_value), 0),
                    'performance_rate', 
                        CASE 
                            WHEN COALESCE(SUM(qmr.denominator_value), 0) > 0 THEN 
                                COALESCE(SUM(qmr.numerator_value), 0)::DECIMAL / COALESCE(SUM(qmr.denominator_value), 0)::DECIMAL
                            ELSE 0
                        END
                )
            )
            FROM quality_measures qm
            LEFT JOIN quality_measure_reporting qmr ON qm.id = qmr.measure_id
            WHERE qmr.created_at >= v_start_date OR qmr.created_at IS NULL
            GROUP BY qm.id, qm.measure_name
        ),
        'meaningful_use_metrics', (
            SELECT jsonb_build_object(
                'electronic_prescribing_rate', (
                    SELECT 
                        CASE 
                            WHEN COUNT(*) > 0 THEN 
                                COUNT(CASE WHEN fhir_data IS NOT NULL THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                            ELSE 0
                        END
                    FROM medication_requests
                    WHERE created_at >= v_start_date
                ),
                'clinical_decision_support_rate', (
                    SELECT 
                        CASE 
                            WHEN COUNT(*) > 0 THEN 
                                COUNT(CASE WHEN alert_status = 'acknowledged' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                            ELSE 0
                        END
                    FROM clinical_decision_support_alerts
                    WHERE created_at >= v_start_date
                ),
                'interoperability_score', (
                    SELECT AVG(interoperability_score) FROM ehr_analytics
                    WHERE analysis_date >= v_start_date
                )
            )
        ),
        'mips_performance', (
            SELECT jsonb_build_object(
                'quality_score', (
                    SELECT AVG(performance_rate) FROM quality_measure_reporting
                    WHERE created_at >= v_start_date
                ),
                'improvement_activities_score', 85.0, -- Mock score
                'promoting_interoperability_score', 90.0, -- Mock score
                'cost_score', 75.0 -- Mock score
            )
        ),
        'data_quality_score', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        (
                            COUNT(CASE WHEN fhir_data IS NOT NULL THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL +
                            COUNT(CASE WHEN status = 'final' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                        ) / 2
                    ELSE 0
                END
            FROM fhir_resources
            WHERE created_at >= v_start_date
        )
    ) INTO v_analytics;
    
    RETURN v_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update EHR analytics
CREATE OR REPLACE FUNCTION update_ehr_analytics(
    p_analysis_date DATE DEFAULT CURRENT_DATE,
    p_analysis_period_months INTEGER DEFAULT 12
)
RETURNS VOID AS $$
DECLARE
    v_analytics JSONB;
BEGIN
    SELECT generate_ehr_analytics(p_analysis_date, p_analysis_period_months) INTO v_analytics;
    
    INSERT INTO ehr_analytics (
        analysis_date,
        analysis_period_months,
        total_encounters,
        total_observations,
        total_diagnostic_reports,
        total_medication_requests,
        total_procedures,
        fhir_compliance_rate,
        clinical_decision_support_alerts,
        quality_measures_performance,
        meaningful_use_metrics,
        mips_performance,
        data_quality_score
    ) VALUES (
        p_analysis_date,
        p_analysis_period_months,
        (v_analytics->>'total_encounters')::INTEGER,
        (v_analytics->>'total_observations')::INTEGER,
        (v_analytics->>'total_diagnostic_reports')::INTEGER,
        (v_analytics->>'total_medication_requests')::INTEGER,
        (v_analytics->>'total_procedures')::INTEGER,
        (v_analytics->>'fhir_compliance_rate')::DECIMAL(5,2),
        (v_analytics->>'clinical_decision_support_alerts')::INTEGER,
        v_analytics->'quality_measures_performance',
        v_analytics->'meaningful_use_metrics',
        v_analytics->'mips_performance',
        (v_analytics->>'data_quality_score')::DECIMAL(5,2)
    )
    ON CONFLICT (analysis_date) 
    DO UPDATE SET
        analysis_period_months = EXCLUDED.analysis_period_months,
        total_encounters = EXCLUDED.total_encounters,
        total_observations = EXCLUDED.total_observations,
        total_diagnostic_reports = EXCLUDED.total_diagnostic_reports,
        total_medication_requests = EXCLUDED.total_medication_requests,
        total_procedures = EXCLUDED.total_procedures,
        fhir_compliance_rate = EXCLUDED.fhir_compliance_rate,
        clinical_decision_support_alerts = EXCLUDED.clinical_decision_support_alerts,
        quality_measures_performance = EXCLUDED.quality_measures_performance,
        meaningful_use_metrics = EXCLUDED.meaningful_use_metrics,
        mips_performance = EXCLUDED.mips_performance,
        data_quality_score = EXCLUDED.data_quality_score,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics when new encounter is added
CREATE OR REPLACE FUNCTION trigger_update_ehr_analytics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_ehr_analytics();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ehr_analytics_trigger
    AFTER INSERT OR UPDATE ON fhir_encounters
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_ehr_analytics();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ehr_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fhir_resources_updated_at
    BEFORE UPDATE ON fhir_resources
    FOR EACH ROW
    EXECUTE FUNCTION update_ehr_updated_at();

CREATE TRIGGER fhir_encounters_updated_at
    BEFORE UPDATE ON fhir_encounters
    FOR EACH ROW
    EXECUTE FUNCTION update_ehr_updated_at();

CREATE TRIGGER clinical_observations_updated_at
    BEFORE UPDATE ON clinical_observations
    FOR EACH ROW
    EXECUTE FUNCTION update_ehr_updated_at();

CREATE TRIGGER diagnostic_reports_updated_at
    BEFORE UPDATE ON diagnostic_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_ehr_updated_at();

CREATE TRIGGER medication_requests_updated_at
    BEFORE UPDATE ON medication_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_ehr_updated_at();

CREATE TRIGGER procedures_updated_at
    BEFORE UPDATE ON procedures
    FOR EACH ROW
    EXECUTE FUNCTION update_ehr_updated_at();

CREATE TRIGGER quality_measures_updated_at
    BEFORE UPDATE ON quality_measures
    FOR EACH ROW
    EXECUTE FUNCTION update_ehr_updated_at();

CREATE TRIGGER quality_measure_reporting_updated_at
    BEFORE UPDATE ON quality_measure_reporting
    FOR EACH ROW
    EXECUTE FUNCTION update_ehr_updated_at();

CREATE TRIGGER clinical_decision_support_rules_updated_at
    BEFORE UPDATE ON clinical_decision_support_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_ehr_updated_at();

CREATE TRIGGER clinical_decision_support_alerts_updated_at
    BEFORE UPDATE ON clinical_decision_support_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_ehr_updated_at();

CREATE TRIGGER interoperability_standards_updated_at
    BEFORE UPDATE ON interoperability_standards
    FOR EACH ROW
    EXECUTE FUNCTION update_ehr_updated_at();

CREATE TRIGGER ehr_analytics_updated_at
    BEFORE UPDATE ON ehr_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_ehr_updated_at();




