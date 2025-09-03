-- Drug Interactions and Warnings Schema for American Psychiatry
-- Comprehensive system for drug-drug, drug-food, and drug-allergy interactions

-- Drug interactions database
CREATE TABLE IF NOT EXISTS drug_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug1_id UUID NOT NULL,
    drug2_id UUID NOT NULL,
    interaction_type VARCHAR(50) NOT NULL, -- 'major', 'moderate', 'minor'
    severity_level VARCHAR(20) NOT NULL, -- 'high', 'medium', 'low'
    mechanism TEXT,
    clinical_significance TEXT,
    management_recommendations TEXT,
    evidence_level VARCHAR(20), -- 'strong', 'moderate', 'weak'
    references TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(drug1_id, drug2_id)
);

-- Drug-food interactions
CREATE TABLE IF NOT EXISTS drug_food_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_id UUID NOT NULL,
    food_item VARCHAR(100) NOT NULL,
    interaction_type VARCHAR(50) NOT NULL,
    mechanism TEXT,
    clinical_significance TEXT,
    recommendations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drug allergies and contraindications
CREATE TABLE IF NOT EXISTS drug_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    drug_name VARCHAR(100) NOT NULL,
    allergy_type VARCHAR(50), -- 'true_allergy', 'intolerance', 'sensitivity'
    reaction_type VARCHAR(100), -- 'rash', 'anaphylaxis', 'gastrointestinal', etc.
    severity VARCHAR(20), -- 'mild', 'moderate', 'severe'
    onset_date DATE,
    notes TEXT,
    confirmed_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drug contraindications
CREATE TABLE IF NOT EXISTS drug_contraindications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_id UUID NOT NULL,
    condition_type VARCHAR(50) NOT NULL, -- 'disease', 'age_group', 'pregnancy', 'organ_function'
    condition_name VARCHAR(100) NOT NULL,
    contraindication_type VARCHAR(50), -- 'absolute', 'relative'
    reason TEXT,
    alternatives TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drug safety alerts and warnings
CREATE TABLE IF NOT EXISTS drug_safety_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_id UUID NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- 'black_box', 'boxed_warning', 'fda_alert', 'recall'
    alert_level VARCHAR(20) NOT NULL, -- 'critical', 'warning', 'info'
    title VARCHAR(200) NOT NULL,
    description TEXT,
    effective_date DATE,
    expiry_date DATE,
    source VARCHAR(100), -- 'FDA', 'manufacturer', 'clinical_trial'
    action_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient-specific drug interaction alerts
CREATE TABLE IF NOT EXISTS patient_drug_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'interaction', 'allergy', 'contraindication', 'safety'
    drug_id UUID,
    related_drug_id UUID,
    alert_message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'acknowledged', 'resolved'
    acknowledged_by UUID,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drug interaction check history
CREATE TABLE IF NOT EXISTS interaction_check_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    check_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    medications_checked TEXT[], -- Array of medication IDs
    interactions_found INTEGER DEFAULT 0,
    allergies_found INTEGER DEFAULT 0,
    contraindications_found INTEGER DEFAULT 0,
    safety_alerts_found INTEGER DEFAULT 0,
    checked_by UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_drug_interactions_drug1 ON drug_interactions(drug1_id);
CREATE INDEX IF NOT EXISTS idx_drug_interactions_drug2 ON drug_interactions(drug2_id);
CREATE INDEX IF NOT EXISTS idx_drug_interactions_severity ON drug_interactions(severity_level);
CREATE INDEX IF NOT EXISTS idx_drug_food_interactions_drug ON drug_food_interactions(drug_id);
CREATE INDEX IF NOT EXISTS idx_drug_allergies_client ON drug_allergies(client_id);
CREATE INDEX IF NOT EXISTS idx_drug_allergies_drug ON drug_allergies(drug_name);
CREATE INDEX IF NOT EXISTS idx_drug_contraindications_drug ON drug_contraindications(drug_id);
CREATE INDEX IF NOT EXISTS idx_drug_safety_alerts_drug ON drug_safety_alerts(drug_id);
CREATE INDEX IF NOT EXISTS idx_drug_safety_alerts_active ON drug_safety_alerts(alert_level) WHERE expiry_date IS NULL OR expiry_date > NOW();
CREATE INDEX IF NOT EXISTS idx_patient_drug_alerts_client ON patient_drug_alerts(client_id);
CREATE INDEX IF NOT EXISTS idx_patient_drug_alerts_status ON patient_drug_alerts(status);
CREATE INDEX IF NOT EXISTS idx_interaction_check_history_client ON interaction_check_history(client_id);
CREATE INDEX IF NOT EXISTS idx_interaction_check_history_date ON interaction_check_history(check_date);

-- Row Level Security Policies
ALTER TABLE drug_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_food_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_contraindications ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_safety_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_drug_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_check_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for drug_interactions
CREATE POLICY "Enable read access for authenticated users" ON drug_interactions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON drug_interactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON drug_interactions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for drug_food_interactions
CREATE POLICY "Enable read access for authenticated users" ON drug_food_interactions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON drug_food_interactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for drug_allergies
CREATE POLICY "Enable read access for clinic members" ON drug_allergies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = drug_allergies.client_id
            )
        )
    );

CREATE POLICY "Enable insert for clinic members" ON drug_allergies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = drug_allergies.client_id
            )
        )
    );

CREATE POLICY "Enable update for clinic members" ON drug_allergies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = drug_allergies.client_id
            )
        )
    );

-- RLS Policies for drug_contraindications
CREATE POLICY "Enable read access for authenticated users" ON drug_contraindications
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON drug_contraindications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for drug_safety_alerts
CREATE POLICY "Enable read access for authenticated users" ON drug_safety_alerts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON drug_safety_alerts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for patient_drug_alerts
CREATE POLICY "Enable read access for clinic members" ON patient_drug_alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = patient_drug_alerts.client_id
            )
        )
    );

CREATE POLICY "Enable insert for clinic members" ON patient_drug_alerts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = patient_drug_alerts.client_id
            )
        )
    );

CREATE POLICY "Enable update for clinic members" ON patient_drug_alerts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = patient_drug_alerts.client_id
            )
        )
    );

-- RLS Policies for interaction_check_history
CREATE POLICY "Enable read access for clinic members" ON interaction_check_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = interaction_check_history.client_id
            )
        )
    );

CREATE POLICY "Enable insert for clinic members" ON interaction_check_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = interaction_check_history.client_id
            )
        )
    );

-- PostgreSQL Functions for Drug Interactions

-- Function to check drug interactions for a patient
CREATE OR REPLACE FUNCTION check_patient_drug_interactions(
    patient_id UUID,
    medication_ids UUID[]
)
RETURNS TABLE(
    interaction_id UUID,
    drug1_name VARCHAR(100),
    drug2_name VARCHAR(100),
    interaction_type VARCHAR(50),
    severity_level VARCHAR(20),
    clinical_significance TEXT,
    management_recommendations TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        di.id,
        m1.name as drug1_name,
        m2.name as drug2_name,
        di.interaction_type,
        di.severity_level,
        di.clinical_significance,
        di.management_recommendations
    FROM drug_interactions di
    JOIN medications m1 ON di.drug1_id = m1.id
    JOIN medications m2 ON di.drug2_id = m2.id
    WHERE (di.drug1_id = ANY(medication_ids) AND di.drug2_id = ANY(medication_ids))
       OR (di.drug2_id = ANY(medication_ids) AND di.drug1_id = ANY(medication_ids));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check drug allergies for a patient
CREATE OR REPLACE FUNCTION check_patient_drug_allergies(
    patient_id UUID,
    medication_ids UUID[]
)
RETURNS TABLE(
    allergy_id UUID,
    drug_name VARCHAR(100),
    allergy_type VARCHAR(50),
    reaction_type VARCHAR(100),
    severity VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        da.id,
        da.drug_name,
        da.allergy_type,
        da.reaction_type,
        da.severity
    FROM drug_allergies da
    JOIN medications m ON da.drug_name ILIKE '%' || m.name || '%'
    WHERE da.client_id = patient_id 
    AND m.id = ANY(medication_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check drug contraindications for a patient
CREATE OR REPLACE FUNCTION check_patient_contraindications(
    patient_id UUID,
    medication_ids UUID[]
)
RETURNS TABLE(
    contraindication_id UUID,
    drug_name VARCHAR(100),
    condition_name VARCHAR(100),
    contraindication_type VARCHAR(50),
    reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.id,
        m.name as drug_name,
        dc.condition_name,
        dc.contraindication_type,
        dc.reason
    FROM drug_contraindications dc
    JOIN medications m ON dc.drug_id = m.id
    WHERE m.id = ANY(medication_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active safety alerts for medications
CREATE OR REPLACE FUNCTION get_active_safety_alerts(
    medication_ids UUID[]
)
RETURNS TABLE(
    alert_id UUID,
    drug_name VARCHAR(100),
    alert_type VARCHAR(50),
    alert_level VARCHAR(20),
    title VARCHAR(200),
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dsa.id,
        m.name as drug_name,
        dsa.alert_type,
        dsa.alert_level,
        dsa.title,
        dsa.description
    FROM drug_safety_alerts dsa
    JOIN medications m ON dsa.drug_id = m.id
    WHERE m.id = ANY(medication_ids)
    AND (dsa.expiry_date IS NULL OR dsa.expiry_date > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create patient drug alerts
CREATE OR REPLACE FUNCTION create_patient_drug_alerts(
    patient_id UUID,
    medication_ids UUID[]
)
RETURNS INTEGER AS $$
DECLARE
    alert_count INTEGER := 0;
    interaction_record RECORD;
    allergy_record RECORD;
    contraindication_record RECORD;
    safety_alert_record RECORD;
BEGIN
    -- Check for drug interactions
    FOR interaction_record IN 
        SELECT * FROM check_patient_drug_interactions(patient_id, medication_ids)
    LOOP
        INSERT INTO patient_drug_alerts (
            client_id, alert_type, drug_id, alert_message, severity
        ) VALUES (
            patient_id, 
            'interaction', 
            NULL, 
            'Drug interaction detected: ' || interaction_record.drug1_name || ' + ' || interaction_record.drug2_name || ' - ' || interaction_record.clinical_significance,
            interaction_record.severity_level
        );
        alert_count := alert_count + 1;
    END LOOP;

    -- Check for drug allergies
    FOR allergy_record IN 
        SELECT * FROM check_patient_drug_allergies(patient_id, medication_ids)
    LOOP
        INSERT INTO patient_drug_alerts (
            client_id, alert_type, drug_id, alert_message, severity
        ) VALUES (
            patient_id, 
            'allergy', 
            NULL, 
            'Drug allergy detected: ' || allergy_record.drug_name || ' - ' || allergy_record.reaction_type,
            allergy_record.severity
        );
        alert_count := alert_count + 1;
    END LOOP;

    -- Check for contraindications
    FOR contraindication_record IN 
        SELECT * FROM check_patient_contraindications(patient_id, medication_ids)
    LOOP
        INSERT INTO patient_drug_alerts (
            client_id, alert_type, drug_id, alert_message, severity
        ) VALUES (
            patient_id, 
            'contraindication', 
            NULL, 
            'Contraindication detected: ' || contraindication_record.drug_name || ' - ' || contraindication_record.condition_name,
            CASE WHEN contraindication_record.contraindication_type = 'absolute' THEN 'high' ELSE 'medium' END
        );
        alert_count := alert_count + 1;
    END LOOP;

    -- Check for safety alerts
    FOR safety_alert_record IN 
        SELECT * FROM get_active_safety_alerts(medication_ids)
    LOOP
        INSERT INTO patient_drug_alerts (
            client_id, alert_type, drug_id, alert_message, severity
        ) VALUES (
            patient_id, 
            'safety', 
            NULL, 
            'Safety alert: ' || safety_alert_record.drug_name || ' - ' || safety_alert_record.title,
            safety_alert_record.alert_level
        );
        alert_count := alert_count + 1;
    END LOOP;

    -- Log the interaction check
    INSERT INTO interaction_check_history (
        client_id, medications_checked, interactions_found, allergies_found, 
        contraindications_found, safety_alerts_found, checked_by
    ) VALUES (
        patient_id, 
        medication_ids, 
        (SELECT COUNT(*) FROM check_patient_drug_interactions(patient_id, medication_ids)),
        (SELECT COUNT(*) FROM check_patient_drug_allergies(patient_id, medication_ids)),
        (SELECT COUNT(*) FROM check_patient_contraindications(patient_id, medication_ids)),
        (SELECT COUNT(*) FROM get_active_safety_alerts(medication_ids)),
        auth.uid()
    );

    RETURN alert_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_drug_interactions_updated_at BEFORE UPDATE ON drug_interactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drug_food_interactions_updated_at BEFORE UPDATE ON drug_food_interactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drug_allergies_updated_at BEFORE UPDATE ON drug_allergies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drug_contraindications_updated_at BEFORE UPDATE ON drug_contraindications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drug_safety_alerts_updated_at BEFORE UPDATE ON drug_safety_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_drug_alerts_updated_at BEFORE UPDATE ON patient_drug_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
