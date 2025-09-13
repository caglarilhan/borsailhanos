-- Pharmacogenomics Schema
-- Comprehensive pharmacogenomic testing and analysis for American psychiatrists

-- Genetic Variants
CREATE TABLE IF NOT EXISTS genetic_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id VARCHAR(100) NOT NULL UNIQUE,
    gene_symbol VARCHAR(50) NOT NULL,
    gene_name VARCHAR(200) NOT NULL,
    variant_name VARCHAR(100) NOT NULL,
    rs_id VARCHAR(50), -- dbSNP reference
    chromosome VARCHAR(10) NOT NULL,
    position INTEGER NOT NULL,
    reference_allele VARCHAR(10) NOT NULL,
    alternate_allele VARCHAR(10) NOT NULL,
    variant_type VARCHAR(50) NOT NULL, -- 'snp', 'indel', 'cnv', 'sv'
    clinical_significance VARCHAR(50), -- 'pathogenic', 'likely_pathogenic', 'uncertain_significance', 'likely_benign', 'benign'
    population_frequency DECIMAL(5,4), -- Allele frequency in population
    functional_impact VARCHAR(50), -- 'high', 'moderate', 'low', 'modifier'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drug-Gene Interactions
CREATE TABLE IF NOT EXISTS drug_gene_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interaction_id VARCHAR(100) NOT NULL UNIQUE,
    drug_name VARCHAR(200) NOT NULL,
    drug_id VARCHAR(100), -- RxNorm, NDC, or other drug identifier
    gene_symbol VARCHAR(50) NOT NULL,
    variant_id UUID REFERENCES genetic_variants(id),
    interaction_type VARCHAR(50) NOT NULL, -- 'metabolizer', 'transporter', 'target', 'enzyme'
    interaction_level VARCHAR(20) NOT NULL, -- 'level_1a', 'level_1b', 'level_2a', 'level_2b', 'level_3', 'level_4'
    evidence_level VARCHAR(20) NOT NULL, -- 'strong', 'moderate', 'weak', 'insufficient'
    clinical_guidance TEXT,
    dosing_recommendation TEXT,
    alternative_drugs TEXT[],
    contraindications TEXT[],
    warnings TEXT[],
    monitoring_recommendations TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Genetic Profiles
CREATE TABLE IF NOT EXISTS patient_genetic_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES users(id),
    test_order_id UUID, -- Reference to genetic test order
    test_date DATE NOT NULL,
    test_lab VARCHAR(200),
    test_method VARCHAR(100), -- 'pcr', 'sequencing', 'microarray', 'targeted_panel'
    test_coverage TEXT[], -- Genes/variants tested
    quality_score DECIMAL(5,2), -- Test quality score
    interpretation_date DATE,
    interpreted_by UUID REFERENCES users(id),
    interpretation_notes TEXT,
    clinical_relevance VARCHAR(50), -- 'high', 'moderate', 'low', 'unknown'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Genetic Variants
CREATE TABLE IF NOT EXISTS patient_genetic_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_genetic_profile_id UUID NOT NULL REFERENCES patient_genetic_profiles(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES genetic_variants(id),
    genotype VARCHAR(10) NOT NULL, -- 'AA', 'AT', 'TT', etc.
    allele_1 VARCHAR(10) NOT NULL,
    allele_2 VARCHAR(10) NOT NULL,
    zygosity VARCHAR(20) NOT NULL, -- 'homozygous_reference', 'heterozygous', 'homozygous_alternate'
    variant_allele_frequency DECIMAL(5,4), -- For somatic variants
    read_depth INTEGER, -- Sequencing read depth
    quality_score DECIMAL(5,2), -- Variant call quality
    is_pathogenic BOOLEAN DEFAULT FALSE,
    clinical_significance VARCHAR(50),
    interpretation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pharmacogenomic Recommendations
CREATE TABLE IF NOT EXISTS pharmacogenomic_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_genetic_profile_id UUID NOT NULL REFERENCES patient_genetic_profiles(id) ON DELETE CASCADE,
    drug_name VARCHAR(200) NOT NULL,
    drug_id VARCHAR(100),
    gene_symbol VARCHAR(50) NOT NULL,
    variant_id UUID REFERENCES genetic_variants(id),
    interaction_level VARCHAR(20) NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL, -- 'dose_adjustment', 'drug_selection', 'monitoring', 'contraindication'
    recommendation_text TEXT NOT NULL,
    confidence_level VARCHAR(20) NOT NULL, -- 'high', 'moderate', 'low'
    evidence_strength VARCHAR(20) NOT NULL, -- 'strong', 'moderate', 'weak'
    clinical_guidelines TEXT[],
    references TEXT[],
    is_applied BOOLEAN DEFAULT FALSE,
    applied_date TIMESTAMP WITH TIME ZONE,
    applied_by UUID REFERENCES users(id),
    application_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pharmacogenomic Test Orders
CREATE TABLE IF NOT EXISTS pharmacogenomic_test_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(100) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES users(id),
    test_type VARCHAR(100) NOT NULL, -- 'comprehensive', 'targeted', 'single_gene', 'drug_specific'
    test_panel TEXT[], -- Specific genes/variants to test
    indication TEXT NOT NULL, -- Clinical indication for testing
    test_lab VARCHAR(200),
    lab_order_number VARCHAR(100),
    order_date DATE NOT NULL,
    expected_result_date DATE,
    actual_result_date DATE,
    order_status VARCHAR(20) DEFAULT 'ordered', -- 'ordered', 'sent_to_lab', 'in_progress', 'completed', 'cancelled'
    result_status VARCHAR(20), -- 'pending', 'available', 'reviewed', 'interpreted'
    cost DECIMAL(10,2),
    insurance_coverage BOOLEAN,
    prior_authorization_required BOOLEAN,
    prior_authorization_obtained BOOLEAN,
    consent_obtained BOOLEAN,
    consent_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pharmacogenomic Reports
CREATE TABLE IF NOT EXISTS pharmacogenomic_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id VARCHAR(100) NOT NULL UNIQUE,
    patient_genetic_profile_id UUID NOT NULL REFERENCES patient_genetic_profiles(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL, -- 'comprehensive', 'drug_specific', 'summary'
    report_date DATE NOT NULL,
    generated_by UUID REFERENCES users(id),
    report_content TEXT NOT NULL,
    executive_summary TEXT,
    clinical_recommendations TEXT[],
    drug_interactions TEXT[],
    monitoring_recommendations TEXT[],
    follow_up_recommendations TEXT[],
    limitations TEXT[],
    report_status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'final', 'archived'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pharmacogenomic Guidelines
CREATE TABLE IF NOT EXISTS pharmacogenomic_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guideline_id VARCHAR(100) NOT NULL UNIQUE,
    guideline_name VARCHAR(200) NOT NULL,
    guideline_version VARCHAR(20) NOT NULL,
    organization VARCHAR(200) NOT NULL, -- 'CPIC', 'DPWG', 'FDA', 'EMA'
    drug_name VARCHAR(200) NOT NULL,
    gene_symbol VARCHAR(50) NOT NULL,
    variant_name VARCHAR(100) NOT NULL,
    phenotype VARCHAR(50) NOT NULL, -- 'poor_metabolizer', 'intermediate_metabolizer', 'normal_metabolizer', 'rapid_metabolizer', 'ultra_rapid_metabolizer'
    recommendation_level VARCHAR(20) NOT NULL, -- 'strong', 'moderate', 'optional'
    recommendation_text TEXT NOT NULL,
    dosing_guidance TEXT,
    alternative_drugs TEXT[],
    monitoring_recommendations TEXT[],
    contraindications TEXT[],
    evidence_level VARCHAR(20) NOT NULL, -- 'strong', 'moderate', 'weak'
    last_updated DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pharmacogenomic Analytics
CREATE TABLE IF NOT EXISTS pharmacogenomic_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis_period_months INTEGER NOT NULL DEFAULT 12,
    practitioner_id UUID REFERENCES users(id),
    total_tests_ordered INTEGER NOT NULL DEFAULT 0,
    total_tests_completed INTEGER NOT NULL DEFAULT 0,
    total_patients_tested INTEGER NOT NULL DEFAULT 0,
    average_test_cost DECIMAL(10,2),
    insurance_coverage_rate DECIMAL(5,2),
    prior_authorization_rate DECIMAL(5,2),
    test_completion_rate DECIMAL(5,2),
    recommendation_adoption_rate DECIMAL(5,2),
    drug_interaction_alerts INTEGER NOT NULL DEFAULT 0,
    dose_adjustments_made INTEGER NOT NULL DEFAULT 0,
    contraindications_identified INTEGER NOT NULL DEFAULT 0,
    clinical_outcomes JSONB,
    cost_effectiveness JSONB,
    patient_satisfaction DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_genetic_variants_gene_symbol ON genetic_variants(gene_symbol);
CREATE INDEX IF NOT EXISTS idx_genetic_variants_chromosome ON genetic_variants(chromosome);
CREATE INDEX IF NOT EXISTS idx_genetic_variants_position ON genetic_variants(position);
CREATE INDEX IF NOT EXISTS idx_genetic_variants_clinical_significance ON genetic_variants(clinical_significance);
CREATE INDEX IF NOT EXISTS idx_genetic_variants_active ON genetic_variants(is_active);

CREATE INDEX IF NOT EXISTS idx_drug_gene_interactions_drug_name ON drug_gene_interactions(drug_name);
CREATE INDEX IF NOT EXISTS idx_drug_gene_interactions_gene_symbol ON drug_gene_interactions(gene_symbol);
CREATE INDEX IF NOT EXISTS idx_drug_gene_interactions_variant_id ON drug_gene_interactions(variant_id);
CREATE INDEX IF NOT EXISTS idx_drug_gene_interactions_interaction_level ON drug_gene_interactions(interaction_level);
CREATE INDEX IF NOT EXISTS idx_drug_gene_interactions_active ON drug_gene_interactions(is_active);

CREATE INDEX IF NOT EXISTS idx_patient_genetic_profiles_patient_id ON patient_genetic_profiles(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_genetic_profiles_practitioner_id ON patient_genetic_profiles(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_patient_genetic_profiles_test_date ON patient_genetic_profiles(test_date);
CREATE INDEX IF NOT EXISTS idx_patient_genetic_profiles_active ON patient_genetic_profiles(is_active);

CREATE INDEX IF NOT EXISTS idx_patient_genetic_variants_profile_id ON patient_genetic_variants(patient_genetic_profile_id);
CREATE INDEX IF NOT EXISTS idx_patient_genetic_variants_variant_id ON patient_genetic_variants(variant_id);
CREATE INDEX IF NOT EXISTS idx_patient_genetic_variants_genotype ON patient_genetic_variants(genotype);
CREATE INDEX IF NOT EXISTS idx_patient_genetic_variants_pathogenic ON patient_genetic_variants(is_pathogenic);

CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_recommendations_profile_id ON pharmacogenomic_recommendations(patient_genetic_profile_id);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_recommendations_drug_name ON pharmacogenomic_recommendations(drug_name);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_recommendations_gene_symbol ON pharmacogenomic_recommendations(gene_symbol);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_recommendations_applied ON pharmacogenomic_recommendations(is_applied);

CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_test_orders_patient_id ON pharmacogenomic_test_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_test_orders_practitioner_id ON pharmacogenomic_test_orders(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_test_orders_order_date ON pharmacogenomic_test_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_test_orders_status ON pharmacogenomic_test_orders(order_status);

CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_reports_profile_id ON pharmacogenomic_reports(patient_genetic_profile_id);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_reports_type ON pharmacogenomic_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_reports_date ON pharmacogenomic_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_reports_status ON pharmacogenomic_reports(report_status);

CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_guidelines_drug_name ON pharmacogenomic_guidelines(drug_name);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_guidelines_gene_symbol ON pharmacogenomic_guidelines(gene_symbol);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_guidelines_organization ON pharmacogenomic_guidelines(organization);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_guidelines_active ON pharmacogenomic_guidelines(is_active);

CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_analytics_date ON pharmacogenomic_analytics(analysis_date);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_analytics_practitioner_id ON pharmacogenomic_analytics(practitioner_id);

-- RLS Policies
ALTER TABLE genetic_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_gene_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_genetic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_genetic_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacogenomic_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacogenomic_test_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacogenomic_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacogenomic_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacogenomic_analytics ENABLE ROW LEVEL SECURITY;

-- Genetic variants policies (system-wide read access)
CREATE POLICY "Users can view genetic variants" ON genetic_variants
    FOR SELECT USING (true);

CREATE POLICY "Users can insert genetic variants" ON genetic_variants
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update genetic variants" ON genetic_variants
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete genetic variants" ON genetic_variants
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Drug-gene interactions policies (system-wide read access)
CREATE POLICY "Users can view drug-gene interactions" ON drug_gene_interactions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert drug-gene interactions" ON drug_gene_interactions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update drug-gene interactions" ON drug_gene_interactions
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete drug-gene interactions" ON drug_gene_interactions
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Patient genetic profiles policies
CREATE POLICY "Users can view genetic profiles for their patients" ON patient_genetic_profiles
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can insert genetic profiles for their patients" ON patient_genetic_profiles
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) AND practitioner_id = auth.uid()
    );

CREATE POLICY "Users can update genetic profiles for their patients" ON patient_genetic_profiles
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can delete genetic profiles for their patients" ON patient_genetic_profiles
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

-- Patient genetic variants policies
CREATE POLICY "Users can view genetic variants for their patients" ON patient_genetic_variants
    FOR SELECT USING (
        patient_genetic_profile_id IN (
            SELECT id FROM patient_genetic_profiles 
            WHERE patient_id IN (
                SELECT id FROM clients WHERE owner_id = auth.uid()
            ) OR practitioner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert genetic variants for their patients" ON patient_genetic_variants
    FOR INSERT WITH CHECK (
        patient_genetic_profile_id IN (
            SELECT id FROM patient_genetic_profiles 
            WHERE patient_id IN (
                SELECT id FROM clients WHERE owner_id = auth.uid()
            ) AND practitioner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update genetic variants for their patients" ON patient_genetic_variants
    FOR UPDATE USING (
        patient_genetic_profile_id IN (
            SELECT id FROM patient_genetic_profiles 
            WHERE patient_id IN (
                SELECT id FROM clients WHERE owner_id = auth.uid()
            ) OR practitioner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete genetic variants for their patients" ON patient_genetic_variants
    FOR DELETE USING (
        patient_genetic_profile_id IN (
            SELECT id FROM patient_genetic_profiles 
            WHERE patient_id IN (
                SELECT id FROM clients WHERE owner_id = auth.uid()
            ) OR practitioner_id = auth.uid()
        )
    );

-- Pharmacogenomic recommendations policies
CREATE POLICY "Users can view recommendations for their patients" ON pharmacogenomic_recommendations
    FOR SELECT USING (
        patient_genetic_profile_id IN (
            SELECT id FROM patient_genetic_profiles 
            WHERE patient_id IN (
                SELECT id FROM clients WHERE owner_id = auth.uid()
            ) OR practitioner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert recommendations for their patients" ON pharmacogenomic_recommendations
    FOR INSERT WITH CHECK (
        patient_genetic_profile_id IN (
            SELECT id FROM patient_genetic_profiles 
            WHERE patient_id IN (
                SELECT id FROM clients WHERE owner_id = auth.uid()
            ) AND practitioner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update recommendations for their patients" ON pharmacogenomic_recommendations
    FOR UPDATE USING (
        patient_genetic_profile_id IN (
            SELECT id FROM patient_genetic_profiles 
            WHERE patient_id IN (
                SELECT id FROM clients WHERE owner_id = auth.uid()
            ) OR practitioner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete recommendations for their patients" ON pharmacogenomic_recommendations
    FOR DELETE USING (
        patient_genetic_profile_id IN (
            SELECT id FROM patient_genetic_profiles 
            WHERE patient_id IN (
                SELECT id FROM clients WHERE owner_id = auth.uid()
            ) OR practitioner_id = auth.uid()
        )
    );

-- Pharmacogenomic test orders policies
CREATE POLICY "Users can view test orders for their patients" ON pharmacogenomic_test_orders
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can insert test orders for their patients" ON pharmacogenomic_test_orders
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) AND practitioner_id = auth.uid()
    );

CREATE POLICY "Users can update test orders for their patients" ON pharmacogenomic_test_orders
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

CREATE POLICY "Users can delete test orders for their patients" ON pharmacogenomic_test_orders
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        ) OR practitioner_id = auth.uid()
    );

-- Pharmacogenomic reports policies
CREATE POLICY "Users can view reports for their patients" ON pharmacogenomic_reports
    FOR SELECT USING (
        patient_genetic_profile_id IN (
            SELECT id FROM patient_genetic_profiles 
            WHERE patient_id IN (
                SELECT id FROM clients WHERE owner_id = auth.uid()
            ) OR practitioner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert reports for their patients" ON pharmacogenomic_reports
    FOR INSERT WITH CHECK (
        patient_genetic_profile_id IN (
            SELECT id FROM patient_genetic_profiles 
            WHERE patient_id IN (
                SELECT id FROM clients WHERE owner_id = auth.uid()
            ) AND practitioner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update reports for their patients" ON pharmacogenomic_reports
    FOR UPDATE USING (
        patient_genetic_profile_id IN (
            SELECT id FROM patient_genetic_profiles 
            WHERE patient_id IN (
                SELECT id FROM clients WHERE owner_id = auth.uid()
            ) OR practitioner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete reports for their patients" ON pharmacogenomic_reports
    FOR DELETE USING (
        patient_genetic_profile_id IN (
            SELECT id FROM patient_genetic_profiles 
            WHERE patient_id IN (
                SELECT id FROM clients WHERE owner_id = auth.uid()
            ) OR practitioner_id = auth.uid()
        )
    );

-- Pharmacogenomic guidelines policies (system-wide read access)
CREATE POLICY "Users can view pharmacogenomic guidelines" ON pharmacogenomic_guidelines
    FOR SELECT USING (true);

CREATE POLICY "Users can insert pharmacogenomic guidelines" ON pharmacogenomic_guidelines
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update pharmacogenomic guidelines" ON pharmacogenomic_guidelines
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete pharmacogenomic guidelines" ON pharmacogenomic_guidelines
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Pharmacogenomic analytics policies
CREATE POLICY "Users can view their own analytics" ON pharmacogenomic_analytics
    FOR SELECT USING (practitioner_id = auth.uid() OR practitioner_id IS NULL);

CREATE POLICY "Users can insert their own analytics" ON pharmacogenomic_analytics
    FOR INSERT WITH CHECK (practitioner_id = auth.uid() OR practitioner_id IS NULL);

CREATE POLICY "Users can update their own analytics" ON pharmacogenomic_analytics
    FOR UPDATE USING (practitioner_id = auth.uid() OR practitioner_id IS NULL);

CREATE POLICY "Users can delete their own analytics" ON pharmacogenomic_analytics
    FOR DELETE USING (practitioner_id = auth.uid() OR practitioner_id IS NULL);

-- Functions for Pharmacogenomics

-- Function to generate pharmacogenomic recommendations
CREATE OR REPLACE FUNCTION generate_pharmacogenomic_recommendations(
    p_patient_genetic_profile_id UUID
)
RETURNS TABLE (
    drug_name VARCHAR(200),
    gene_symbol VARCHAR(50),
    interaction_level VARCHAR(20),
    recommendation_type VARCHAR(50),
    recommendation_text TEXT,
    confidence_level VARCHAR(20),
    evidence_strength VARCHAR(20)
) AS $$
DECLARE
    v_patient_variants RECORD;
    v_drug_interaction RECORD;
BEGIN
    -- Get patient's genetic variants
    FOR v_patient_variants IN
        SELECT 
            pgv.variant_id,
            pgv.genotype,
            pgv.zygosity,
            gv.gene_symbol,
            gv.variant_name,
            gv.clinical_significance
        FROM patient_genetic_variants pgv
        JOIN genetic_variants gv ON pgv.variant_id = gv.id
        WHERE pgv.patient_genetic_profile_id = p_patient_genetic_profile_id
    LOOP
        -- Find drug-gene interactions for this variant
        FOR v_drug_interaction IN
            SELECT 
                dgi.drug_name,
                dgi.gene_symbol,
                dgi.interaction_level,
                dgi.evidence_level,
                dgi.clinical_guidance,
                dgi.dosing_recommendation,
                dgi.alternative_drugs,
                dgi.contraindications,
                dgi.warnings,
                dgi.monitoring_recommendations
            FROM drug_gene_interactions dgi
            WHERE dgi.variant_id = v_patient_variants.variant_id
            AND dgi.is_active = TRUE
        LOOP
            -- Generate recommendations based on interaction level
            CASE v_drug_interaction.interaction_level
                WHEN 'level_1a', 'level_1b' THEN
                    RETURN QUERY
                    SELECT 
                        v_drug_interaction.drug_name,
                        v_drug_interaction.gene_symbol,
                        v_drug_interaction.interaction_level,
                        'dose_adjustment'::VARCHAR(50),
                        COALESCE(v_drug_interaction.dosing_recommendation, v_drug_interaction.clinical_guidance),
                        'high'::VARCHAR(20),
                        v_drug_interaction.evidence_level;
                WHEN 'level_2a', 'level_2b' THEN
                    RETURN QUERY
                    SELECT 
                        v_drug_interaction.drug_name,
                        v_drug_interaction.gene_symbol,
                        v_drug_interaction.interaction_level,
                        'monitoring'::VARCHAR(50),
                        COALESCE(v_drug_interaction.monitoring_recommendations[1], v_drug_interaction.clinical_guidance),
                        'moderate'::VARCHAR(20),
                        v_drug_interaction.evidence_level;
                WHEN 'level_3' THEN
                    RETURN QUERY
                    SELECT 
                        v_drug_interaction.drug_name,
                        v_drug_interaction.gene_symbol,
                        v_drug_interaction.interaction_level,
                        'drug_selection'::VARCHAR(50),
                        COALESCE(v_drug_interaction.alternative_drugs[1], v_drug_interaction.clinical_guidance),
                        'moderate'::VARCHAR(20),
                        v_drug_interaction.evidence_level;
                WHEN 'level_4' THEN
                    RETURN QUERY
                    SELECT 
                        v_drug_interaction.drug_name,
                        v_drug_interaction.gene_symbol,
                        v_drug_interaction.interaction_level,
                        'contraindication'::VARCHAR(50),
                        COALESCE(v_drug_interaction.contraindications[1], v_drug_interaction.warnings[1]),
                        'low'::VARCHAR(20),
                        v_drug_interaction.evidence_level;
            END CASE;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate pharmacogenomic analytics
CREATE OR REPLACE FUNCTION generate_pharmacogenomic_analytics(
    p_analysis_date DATE DEFAULT CURRENT_DATE,
    p_analysis_period_months INTEGER DEFAULT 12,
    p_practitioner_id UUID DEFAULT NULL
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
        'practitioner_id', p_practitioner_id,
        'total_tests_ordered', (
            SELECT COUNT(*) FROM pharmacogenomic_test_orders
            WHERE order_date >= v_start_date
            AND (p_practitioner_id IS NULL OR practitioner_id = p_practitioner_id)
        ),
        'total_tests_completed', (
            SELECT COUNT(*) FROM pharmacogenomic_test_orders
            WHERE order_date >= v_start_date
            AND order_status = 'completed'
            AND (p_practitioner_id IS NULL OR practitioner_id = p_practitioner_id)
        ),
        'total_patients_tested', (
            SELECT COUNT(DISTINCT patient_id) FROM pharmacogenomic_test_orders
            WHERE order_date >= v_start_date
            AND (p_practitioner_id IS NULL OR practitioner_id = p_practitioner_id)
        ),
        'average_test_cost', (
            SELECT AVG(cost) FROM pharmacogenomic_test_orders
            WHERE order_date >= v_start_date
            AND (p_practitioner_id IS NULL OR practitioner_id = p_practitioner_id)
        ),
        'insurance_coverage_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN insurance_coverage = TRUE THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM pharmacogenomic_test_orders
            WHERE order_date >= v_start_date
            AND (p_practitioner_id IS NULL OR practitioner_id = p_practitioner_id)
        ),
        'test_completion_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN order_status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM pharmacogenomic_test_orders
            WHERE order_date >= v_start_date
            AND (p_practitioner_id IS NULL OR practitioner_id = p_practitioner_id)
        ),
        'recommendation_adoption_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN is_applied = TRUE THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM pharmacogenomic_recommendations
            WHERE created_at >= v_start_date
            AND (p_practitioner_id IS NULL OR 
                patient_genetic_profile_id IN (
                    SELECT id FROM patient_genetic_profiles 
                    WHERE practitioner_id = p_practitioner_id
                ))
        ),
        'drug_interaction_alerts', (
            SELECT COUNT(*) FROM pharmacogenomic_recommendations
            WHERE created_at >= v_start_date
            AND recommendation_type = 'dose_adjustment'
            AND (p_practitioner_id IS NULL OR 
                patient_genetic_profile_id IN (
                    SELECT id FROM patient_genetic_profiles 
                    WHERE practitioner_id = p_practitioner_id
                ))
        ),
        'dose_adjustments_made', (
            SELECT COUNT(*) FROM pharmacogenomic_recommendations
            WHERE created_at >= v_start_date
            AND recommendation_type = 'dose_adjustment'
            AND is_applied = TRUE
            AND (p_practitioner_id IS NULL OR 
                patient_genetic_profile_id IN (
                    SELECT id FROM patient_genetic_profiles 
                    WHERE practitioner_id = p_practitioner_id
                ))
        ),
        'contraindications_identified', (
            SELECT COUNT(*) FROM pharmacogenomic_recommendations
            WHERE created_at >= v_start_date
            AND recommendation_type = 'contraindication'
            AND (p_practitioner_id IS NULL OR 
                patient_genetic_profile_id IN (
                    SELECT id FROM patient_genetic_profiles 
                    WHERE practitioner_id = p_practitioner_id
                ))
        ),
        'clinical_outcomes', (
            SELECT jsonb_build_object(
                'improved_response_rate', 75.0, -- Mock data
                'reduced_adverse_events', 60.0, -- Mock data
                'better_treatment_adherence', 80.0 -- Mock data
            )
        ),
        'cost_effectiveness', (
            SELECT jsonb_build_object(
                'cost_per_adverse_event_prevented', 2500.0, -- Mock data
                'savings_per_patient', 1200.0, -- Mock data
                'roi_percentage', 180.0 -- Mock data
            )
        )
    ) INTO v_analytics;
    
    RETURN v_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update pharmacogenomic analytics
CREATE OR REPLACE FUNCTION update_pharmacogenomic_analytics(
    p_analysis_date DATE DEFAULT CURRENT_DATE,
    p_analysis_period_months INTEGER DEFAULT 12,
    p_practitioner_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_analytics JSONB;
BEGIN
    SELECT generate_pharmacogenomic_analytics(p_analysis_date, p_analysis_period_months, p_practitioner_id) INTO v_analytics;
    
    INSERT INTO pharmacogenomic_analytics (
        analysis_date,
        analysis_period_months,
        practitioner_id,
        total_tests_ordered,
        total_tests_completed,
        total_patients_tested,
        average_test_cost,
        insurance_coverage_rate,
        prior_authorization_rate,
        test_completion_rate,
        recommendation_adoption_rate,
        drug_interaction_alerts,
        dose_adjustments_made,
        contraindications_identified,
        clinical_outcomes,
        cost_effectiveness
    ) VALUES (
        p_analysis_date,
        p_analysis_period_months,
        p_practitioner_id,
        (v_analytics->>'total_tests_ordered')::INTEGER,
        (v_analytics->>'total_tests_completed')::INTEGER,
        (v_analytics->>'total_patients_tested')::INTEGER,
        (v_analytics->>'average_test_cost')::DECIMAL(10,2),
        (v_analytics->>'insurance_coverage_rate')::DECIMAL(5,2),
        0.0, -- Mock data for prior authorization rate
        (v_analytics->>'test_completion_rate')::DECIMAL(5,2),
        (v_analytics->>'recommendation_adoption_rate')::DECIMAL(5,2),
        (v_analytics->>'drug_interaction_alerts')::INTEGER,
        (v_analytics->>'dose_adjustments_made')::INTEGER,
        (v_analytics->>'contraindications_identified')::INTEGER,
        v_analytics->'clinical_outcomes',
        v_analytics->'cost_effectiveness'
    )
    ON CONFLICT (analysis_date, practitioner_id) 
    DO UPDATE SET
        analysis_period_months = EXCLUDED.analysis_period_months,
        total_tests_ordered = EXCLUDED.total_tests_ordered,
        total_tests_completed = EXCLUDED.total_tests_completed,
        total_patients_tested = EXCLUDED.total_patients_tested,
        average_test_cost = EXCLUDED.average_test_cost,
        insurance_coverage_rate = EXCLUDED.insurance_coverage_rate,
        prior_authorization_rate = EXCLUDED.prior_authorization_rate,
        test_completion_rate = EXCLUDED.test_completion_rate,
        recommendation_adoption_rate = EXCLUDED.recommendation_adoption_rate,
        drug_interaction_alerts = EXCLUDED.drug_interaction_alerts,
        dose_adjustments_made = EXCLUDED.dose_adjustments_made,
        contraindications_identified = EXCLUDED.contraindications_identified,
        clinical_outcomes = EXCLUDED.clinical_outcomes,
        cost_effectiveness = EXCLUDED.cost_effectiveness,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics when new test is ordered
CREATE OR REPLACE FUNCTION trigger_update_pharmacogenomic_analytics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_pharmacogenomic_analytics();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pharmacogenomic_analytics_trigger
    AFTER INSERT OR UPDATE ON pharmacogenomic_test_orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_pharmacogenomic_analytics();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pharmacogenomic_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER genetic_variants_updated_at
    BEFORE UPDATE ON genetic_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacogenomic_updated_at();

CREATE TRIGGER drug_gene_interactions_updated_at
    BEFORE UPDATE ON drug_gene_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacogenomic_updated_at();

CREATE TRIGGER patient_genetic_profiles_updated_at
    BEFORE UPDATE ON patient_genetic_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacogenomic_updated_at();

CREATE TRIGGER patient_genetic_variants_updated_at
    BEFORE UPDATE ON patient_genetic_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacogenomic_updated_at();

CREATE TRIGGER pharmacogenomic_recommendations_updated_at
    BEFORE UPDATE ON pharmacogenomic_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacogenomic_updated_at();

CREATE TRIGGER pharmacogenomic_test_orders_updated_at
    BEFORE UPDATE ON pharmacogenomic_test_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacogenomic_updated_at();

CREATE TRIGGER pharmacogenomic_reports_updated_at
    BEFORE UPDATE ON pharmacogenomic_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacogenomic_updated_at();

CREATE TRIGGER pharmacogenomic_guidelines_updated_at
    BEFORE UPDATE ON pharmacogenomic_guidelines
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacogenomic_updated_at();

CREATE TRIGGER pharmacogenomic_analytics_updated_at
    BEFORE UPDATE ON pharmacogenomic_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacogenomic_updated_at();

