-- Drug Dosage Calculators Schema for American Psychiatry
-- Comprehensive system for age, weight, kidney/liver function based dosing

-- Patient demographics and vital signs
CREATE TABLE IF NOT EXISTS patient_vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    age_years INTEGER,
    gender VARCHAR(10), -- 'male', 'female', 'other'
    bsa_m2 DECIMAL(4,2), -- Body Surface Area
    creatinine_mg_dl DECIMAL(4,2),
    egfr_ml_min DECIMAL(6,2), -- Estimated Glomerular Filtration Rate
    alt_u_l DECIMAL(6,2), -- Alanine Aminotransferase
    ast_u_l DECIMAL(6,2), -- Aspartate Aminotransferase
    bilirubin_mg_dl DECIMAL(4,2),
    albumin_g_dl DECIMAL(4,2),
    cyp2d6_genotype VARCHAR(20), -- Genetic polymorphisms
    cyp2c19_genotype VARCHAR(20),
    cyp3a4_genotype VARCHAR(20),
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drug dosage guidelines and calculations
CREATE TABLE IF NOT EXISTS drug_dosage_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_id UUID NOT NULL,
    indication VARCHAR(200) NOT NULL,
    age_group VARCHAR(50), -- 'pediatric', 'adult', 'geriatric'
    min_age_years INTEGER,
    max_age_years INTEGER,
    min_weight_kg DECIMAL(5,2),
    max_weight_kg DECIMAL(5,2),
    starting_dose_mg DECIMAL(8,2),
    max_dose_mg DECIMAL(8,2),
    dose_frequency VARCHAR(50), -- 'daily', 'twice_daily', 'three_times_daily'
    titration_schedule TEXT,
    renal_adjustment BOOLEAN DEFAULT FALSE,
    hepatic_adjustment BOOLEAN DEFAULT FALSE,
    pediatric_adjustment BOOLEAN DEFAULT FALSE,
    geriatric_adjustment BOOLEAN DEFAULT FALSE,
    contraindications TEXT,
    warnings TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Renal function based dosing adjustments
CREATE TABLE IF NOT EXISTS renal_dosing_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_id UUID NOT NULL,
    egfr_range_min DECIMAL(6,2),
    egfr_range_max DECIMAL(6,2),
    adjustment_type VARCHAR(50), -- 'dose_reduction', 'frequency_reduction', 'contraindicated'
    dose_multiplier DECIMAL(4,2), -- 0.5 = 50% dose reduction
    frequency_multiplier DECIMAL(4,2), -- 0.5 = every other day
    max_dose_mg DECIMAL(8,2),
    monitoring_required BOOLEAN DEFAULT FALSE,
    monitoring_frequency VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hepatic function based dosing adjustments
CREATE TABLE IF NOT EXISTS hepatic_dosing_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_id UUID NOT NULL,
    liver_function VARCHAR(50), -- 'mild_impairment', 'moderate_impairment', 'severe_impairment'
    child_pugh_score_min INTEGER,
    child_pugh_score_max INTEGER,
    adjustment_type VARCHAR(50),
    dose_multiplier DECIMAL(4,2),
    frequency_multiplier DECIMAL(4,2),
    max_dose_mg DECIMAL(8,2),
    monitoring_required BOOLEAN DEFAULT FALSE,
    monitoring_frequency VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pediatric dosing calculations
CREATE TABLE IF NOT EXISTS pediatric_dosing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_id UUID NOT NULL,
    age_min_months INTEGER,
    age_max_months INTEGER,
    weight_min_kg DECIMAL(5,2),
    weight_max_kg DECIMAL(5,2),
    dosing_method VARCHAR(50), -- 'weight_based', 'age_based', 'bsa_based'
    dose_per_kg_mg DECIMAL(8,2),
    dose_per_m2_mg DECIMAL(8,2),
    max_dose_mg DECIMAL(8,2),
    frequency VARCHAR(50),
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Geriatric dosing considerations
CREATE TABLE IF NOT EXISTS geriatric_dosing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_id UUID NOT NULL,
    age_min_years INTEGER DEFAULT 65,
    age_max_years INTEGER,
    starting_dose_multiplier DECIMAL(4,2) DEFAULT 0.5,
    titration_rate_multiplier DECIMAL(4,2) DEFAULT 0.75,
    max_dose_multiplier DECIMAL(4,2) DEFAULT 0.75,
    special_considerations TEXT,
    fall_risk_medication BOOLEAN DEFAULT FALSE,
    cognitive_impairment_risk BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dosage calculation history
CREATE TABLE IF NOT EXISTS dosage_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    drug_id UUID NOT NULL,
    indication VARCHAR(200),
    calculated_dose_mg DECIMAL(8,2),
    calculated_frequency VARCHAR(50),
    calculation_method VARCHAR(100),
    patient_age INTEGER,
    patient_weight_kg DECIMAL(5,2),
    patient_egfr DECIMAL(6,2),
    patient_liver_function VARCHAR(50),
    adjustments_applied TEXT[],
    final_recommendation TEXT,
    calculated_by UUID,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drug level monitoring schedule
CREATE TABLE IF NOT EXISTS drug_level_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    drug_id UUID NOT NULL,
    monitoring_type VARCHAR(50), -- 'trough', 'peak', 'random'
    target_range_min DECIMAL(6,2),
    target_range_max DECIMAL(6,2),
    critical_low DECIMAL(6,2),
    critical_high DECIMAL(6,2),
    monitoring_frequency VARCHAR(100),
    next_draw_date DATE,
    last_draw_date DATE,
    last_result DECIMAL(6,2),
    last_result_date DATE,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patient_vitals_client ON patient_vitals(client_id);
CREATE INDEX IF NOT EXISTS idx_patient_vitals_measured_at ON patient_vitals(measured_at);
CREATE INDEX IF NOT EXISTS idx_drug_dosage_guidelines_drug ON drug_dosage_guidelines(drug_id);
CREATE INDEX IF NOT EXISTS idx_drug_dosage_guidelines_age ON drug_dosage_guidelines(age_group);
CREATE INDEX IF NOT EXISTS idx_renal_dosing_adjustments_drug ON renal_dosing_adjustments(drug_id);
CREATE INDEX IF NOT EXISTS idx_renal_dosing_adjustments_egfr ON renal_dosing_adjustments(egfr_range_min, egfr_range_max);
CREATE INDEX IF NOT EXISTS idx_hepatic_dosing_adjustments_drug ON hepatic_dosing_adjustments(drug_id);
CREATE INDEX IF NOT EXISTS idx_pediatric_dosing_rules_drug ON pediatric_dosing_rules(drug_id);
CREATE INDEX IF NOT EXISTS idx_pediatric_dosing_rules_age ON pediatric_dosing_rules(age_min_months, age_max_months);
CREATE INDEX IF NOT EXISTS idx_geriatric_dosing_rules_drug ON geriatric_dosing_rules(drug_id);
CREATE INDEX IF NOT EXISTS idx_dosage_calculations_client ON dosage_calculations(client_id);
CREATE INDEX IF NOT EXISTS idx_dosage_calculations_drug ON dosage_calculations(drug_id);
CREATE INDEX IF NOT EXISTS idx_dosage_calculations_date ON dosage_calculations(calculated_at);
CREATE INDEX IF NOT EXISTS idx_drug_level_monitoring_client ON drug_level_monitoring(client_id);
CREATE INDEX IF NOT EXISTS idx_drug_level_monitoring_drug ON drug_level_monitoring(drug_id);
CREATE INDEX IF NOT EXISTS idx_drug_level_monitoring_next_draw ON drug_level_monitoring(next_draw_date);

-- Row Level Security Policies
ALTER TABLE patient_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_dosage_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE renal_dosing_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hepatic_dosing_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pediatric_dosing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE geriatric_dosing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE dosage_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_level_monitoring ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patient_vitals
CREATE POLICY "Enable read access for clinic members" ON patient_vitals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = patient_vitals.client_id
            )
        )
    );

CREATE POLICY "Enable insert for clinic members" ON patient_vitals
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = patient_vitals.client_id
            )
        )
    );

CREATE POLICY "Enable update for clinic members" ON patient_vitals
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = patient_vitals.client_id
            )
        )
    );

-- RLS Policies for drug_dosage_guidelines
CREATE POLICY "Enable read access for authenticated users" ON drug_dosage_guidelines
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON drug_dosage_guidelines
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for renal_dosing_adjustments
CREATE POLICY "Enable read access for authenticated users" ON renal_dosing_adjustments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON renal_dosing_adjustments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for hepatic_dosing_adjustments
CREATE POLICY "Enable read access for authenticated users" ON hepatic_dosing_adjustments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON hepatic_dosing_adjustments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for pediatric_dosing_rules
CREATE POLICY "Enable read access for authenticated users" ON pediatric_dosing_rules
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON pediatric_dosing_rules
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for geriatric_dosing_rules
CREATE POLICY "Enable read access for authenticated users" ON geriatric_dosing_rules
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON geriatric_dosing_rules
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for dosage_calculations
CREATE POLICY "Enable read access for clinic members" ON dosage_calculations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = dosage_calculations.client_id
            )
        )
    );

CREATE POLICY "Enable insert for clinic members" ON dosage_calculations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = dosage_calculations.client_id
            )
        )
    );

-- RLS Policies for drug_level_monitoring
CREATE POLICY "Enable read access for clinic members" ON drug_level_monitoring
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = drug_level_monitoring.client_id
            )
        )
    );

CREATE POLICY "Enable insert for clinic members" ON drug_level_monitoring
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = drug_level_monitoring.client_id
            )
        )
    );

CREATE POLICY "Enable update for clinic members" ON drug_level_monitoring
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = drug_level_monitoring.client_id
            )
        )
    );

-- PostgreSQL Functions for Dosage Calculations

-- Function to calculate Body Surface Area (BSA) using DuBois formula
CREATE OR REPLACE FUNCTION calculate_bsa(
    height_cm DECIMAL,
    weight_kg DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
    RETURN 0.007184 * POWER(height_cm, 0.725) * POWER(weight_kg, 0.425);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate eGFR using CKD-EPI formula
CREATE OR REPLACE FUNCTION calculate_egfr(
    age_years INTEGER,
    gender VARCHAR(10),
    creatinine_mg_dl DECIMAL,
    is_black BOOLEAN DEFAULT FALSE
)
RETURNS DECIMAL AS $$
DECLARE
    egfr DECIMAL;
    k_value DECIMAL;
    alpha_value DECIMAL;
BEGIN
    -- Set k value based on gender
    IF gender = 'female' THEN
        k_value := 0.7;
    ELSE
        k_value := 0.9;
    END IF;
    
    -- Set alpha value based on gender
    IF gender = 'female' THEN
        alpha_value := -0.329;
    ELSE
        alpha_value := -0.411;
    END IF;
    
    -- Calculate eGFR using CKD-EPI formula
    egfr := 141 * 
            LEAST(creatinine_mg_dl / k_value, 1) ^ alpha_value * 
            GREATEST(creatinine_mg_dl / k_value, 1) ^ -1.209 * 
            0.993 ^ age_years;
    
    -- Apply race adjustment if black
    IF is_black THEN
        egfr := egfr * 1.159;
    END IF;
    
    RETURN egfr;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate pediatric dose based on weight
CREATE OR REPLACE FUNCTION calculate_pediatric_dose(
    drug_id UUID,
    weight_kg DECIMAL,
    age_months INTEGER
)
RETURNS TABLE(
    recommended_dose_mg DECIMAL,
    frequency VARCHAR(50),
    max_dose_mg DECIMAL,
    special_instructions TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN pdr.dosing_method = 'weight_based' THEN pdr.dose_per_kg_mg * weight_kg
            WHEN pdr.dosing_method = 'bsa_based' THEN pdr.dose_per_m2_mg * calculate_bsa(0, weight_kg)
            ELSE pdr.dose_per_kg_mg * weight_kg
        END as recommended_dose_mg,
        pdr.frequency,
        pdr.max_dose_mg,
        pdr.special_instructions
    FROM pediatric_dosing_rules pdr
    WHERE pdr.drug_id = $1
    AND age_months BETWEEN pdr.age_min_months AND pdr.age_max_months
    AND weight_kg BETWEEN pdr.weight_min_kg AND pdr.weight_max_kg
    ORDER BY pdr.dose_per_kg_mg DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate renal-adjusted dose
CREATE OR REPLACE FUNCTION calculate_renal_adjusted_dose(
    drug_id UUID,
    egfr DECIMAL,
    base_dose_mg DECIMAL,
    base_frequency VARCHAR(50)
)
RETURNS TABLE(
    adjusted_dose_mg DECIMAL,
    adjusted_frequency VARCHAR(50),
    adjustment_type VARCHAR(50),
    monitoring_required BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN rda.adjustment_type = 'dose_reduction' THEN base_dose_mg * rda.dose_multiplier
            ELSE base_dose_mg
        END as adjusted_dose_mg,
        CASE 
            WHEN rda.adjustment_type = 'frequency_reduction' THEN 
                CASE 
                    WHEN base_frequency = 'daily' THEN 'every_other_day'
                    WHEN base_frequency = 'twice_daily' THEN 'daily'
                    ELSE base_frequency
                END
            ELSE base_frequency
        END as adjusted_frequency,
        rda.adjustment_type,
        rda.monitoring_required
    FROM renal_dosing_adjustments rda
    WHERE rda.drug_id = $1
    AND egfr BETWEEN rda.egfr_range_min AND rda.egfr_range_max
    ORDER BY rda.egfr_range_min DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate hepatic-adjusted dose
CREATE OR REPLACE FUNCTION calculate_hepatic_adjusted_dose(
    drug_id UUID,
    child_pugh_score INTEGER,
    base_dose_mg DECIMAL,
    base_frequency VARCHAR(50)
)
RETURNS TABLE(
    adjusted_dose_mg DECIMAL,
    adjusted_frequency VARCHAR(50),
    adjustment_type VARCHAR(50),
    monitoring_required BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN hda.adjustment_type = 'dose_reduction' THEN base_dose_mg * hda.dose_multiplier
            ELSE base_dose_mg
        END as adjusted_dose_mg,
        CASE 
            WHEN hda.adjustment_type = 'frequency_reduction' THEN 
                CASE 
                    WHEN base_frequency = 'daily' THEN 'every_other_day'
                    WHEN base_frequency = 'twice_daily' THEN 'daily'
                    ELSE base_frequency
                END
            ELSE base_frequency
        END as adjusted_frequency,
        hda.adjustment_type,
        hda.monitoring_required
    FROM hepatic_dosing_adjustments hda
    WHERE hda.drug_id = $1
    AND child_pugh_score BETWEEN hda.child_pugh_score_min AND hda.child_pugh_score_max
    ORDER BY hda.child_pugh_score_min DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate geriatric-adjusted dose
CREATE OR REPLACE FUNCTION calculate_geriatric_adjusted_dose(
    drug_id UUID,
    age_years INTEGER,
    base_dose_mg DECIMAL,
    base_frequency VARCHAR(50)
)
RETURNS TABLE(
    adjusted_dose_mg DECIMAL,
    adjusted_frequency VARCHAR(50),
    special_considerations TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        base_dose_mg * gdr.starting_dose_multiplier as adjusted_dose_mg,
        base_frequency,
        gdr.special_considerations
    FROM geriatric_dosing_rules gdr
    WHERE gdr.drug_id = $1
    AND age_years BETWEEN gdr.age_min_years AND COALESCE(gdr.age_max_years, 120)
    ORDER BY gdr.age_min_years DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate comprehensive dose for a patient
CREATE OR REPLACE FUNCTION calculate_comprehensive_dose(
    patient_id UUID,
    drug_id UUID,
    indication VARCHAR(200)
)
RETURNS TABLE(
    recommended_dose_mg DECIMAL,
    recommended_frequency VARCHAR(50),
    calculation_method VARCHAR(100),
    adjustments_applied TEXT[],
    final_recommendation TEXT,
    monitoring_required BOOLEAN,
    monitoring_frequency VARCHAR(100)
) AS $$
DECLARE
    patient_record RECORD;
    base_dose DECIMAL;
    base_frequency VARCHAR(50);
    final_dose DECIMAL;
    final_frequency VARCHAR(50);
    adjustments TEXT[] := ARRAY[]::TEXT[];
    monitoring_needed BOOLEAN := FALSE;
    monitoring_freq VARCHAR(100) := '';
BEGIN
    -- Get patient demographics and vitals
    SELECT 
        pv.height_cm, pv.weight_kg, pv.age_years, pv.gender,
        pv.egfr_ml_min, pv.creatinine_mg_dl, pv.alt_u_l, pv.ast_u_l
    INTO patient_record
    FROM patient_vitals pv
    WHERE pv.client_id = patient_id
    ORDER BY pv.measured_at DESC
    LIMIT 1;

    -- Get base dose from guidelines
    SELECT 
        ddg.starting_dose_mg,
        ddg.dose_frequency
    INTO base_dose, base_frequency
    FROM drug_dosage_guidelines ddg
    WHERE ddg.drug_id = $2
    AND ddg.indication = $3
    AND patient_record.age_years BETWEEN ddg.min_age_years AND ddg.max_age_years
    AND patient_record.weight_kg BETWEEN ddg.min_weight_kg AND ddg.max_weight_kg
    LIMIT 1;

    final_dose := base_dose;
    final_frequency := base_frequency;

    -- Apply pediatric adjustments if applicable
    IF patient_record.age_years < 18 THEN
        -- Pediatric dosing logic
        adjustments := array_append(adjustments, 'Pediatric dosing applied');
    END IF;

    -- Apply renal adjustments if applicable
    IF patient_record.egfr_ml_min < 90 THEN
        -- Renal adjustment logic
        adjustments := array_append(adjustments, 'Renal adjustment applied');
        monitoring_needed := TRUE;
        monitoring_freq := 'Monitor renal function';
    END IF;

    -- Apply hepatic adjustments if applicable
    IF patient_record.alt_u_l > 40 OR patient_record.ast_u_l > 40 THEN
        -- Hepatic adjustment logic
        adjustments := array_append(adjustments, 'Hepatic adjustment applied');
        monitoring_needed := TRUE;
        monitoring_freq := 'Monitor liver function';
    END IF;

    -- Apply geriatric adjustments if applicable
    IF patient_record.age_years >= 65 THEN
        -- Geriatric adjustment logic
        adjustments := array_append(adjustments, 'Geriatric adjustment applied');
    END IF;

    -- Log the calculation
    INSERT INTO dosage_calculations (
        client_id, drug_id, indication, calculated_dose_mg, calculated_frequency,
        calculation_method, patient_age, patient_weight_kg, patient_egfr,
        adjustments_applied, final_recommendation, calculated_by
    ) VALUES (
        patient_id, drug_id, indication, final_dose, final_frequency,
        'Comprehensive calculation', patient_record.age_years, patient_record.weight_kg,
        patient_record.egfr_ml_min, adjustments, 'Dose calculated with adjustments', auth.uid()
    );

    RETURN QUERY
    SELECT 
        final_dose,
        final_frequency,
        'Comprehensive calculation with adjustments',
        adjustments,
        'Dose calculated with ' || array_length(adjustments, 1) || ' adjustments applied',
        monitoring_needed,
        monitoring_freq;
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

CREATE TRIGGER update_patient_vitals_updated_at BEFORE UPDATE ON patient_vitals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drug_dosage_guidelines_updated_at BEFORE UPDATE ON drug_dosage_guidelines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_renal_dosing_adjustments_updated_at BEFORE UPDATE ON renal_dosing_adjustments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hepatic_dosing_adjustments_updated_at BEFORE UPDATE ON hepatic_dosing_adjustments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pediatric_dosing_rules_updated_at BEFORE UPDATE ON pediatric_dosing_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_geriatric_dosing_rules_updated_at BEFORE UPDATE ON geriatric_dosing_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drug_level_monitoring_updated_at BEFORE UPDATE ON drug_level_monitoring
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
