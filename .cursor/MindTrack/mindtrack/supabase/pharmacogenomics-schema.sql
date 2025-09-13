-- Pharmacogenomics Integration Schema
-- This schema stores genetic variants, drug-gene interactions, and personalized treatments

-- Genetic Variants Table
CREATE TABLE IF NOT EXISTS genetic_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    gene VARCHAR(100) NOT NULL,
    variant VARCHAR(100) NOT NULL,
    rs_id VARCHAR(50),
    chromosome VARCHAR(10),
    position BIGINT,
    genotype VARCHAR(100),
    phenotype VARCHAR(100),
    clinical_significance VARCHAR(50) DEFAULT 'uncertain' CHECK (clinical_significance IN ('benign', 'likely_benign', 'uncertain', 'likely_pathogenic', 'pathogenic')),
    allele_frequency DECIMAL(8,6),
    population VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drug-Gene Interactions Table
CREATE TABLE IF NOT EXISTS drug_gene_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    drug_name VARCHAR(255) NOT NULL,
    gene VARCHAR(100) NOT NULL,
    variant VARCHAR(100) NOT NULL,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('metabolizer', 'transporter', 'target', 'enzyme')),
    phenotype VARCHAR(100) NOT NULL,
    recommendation TEXT NOT NULL,
    evidence_level VARCHAR(10) NOT NULL CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
    clinical_action TEXT NOT NULL,
    alternative_drugs TEXT[],
    dosage_adjustment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pharmacogenomic Tests Table
CREATE TABLE IF NOT EXISTS pharmacogenomic_tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(50) NOT NULL CHECK (test_type IN ('panel', 'single_gene', 'whole_genome')),
    genes TEXT[] NOT NULL,
    variants JSONB,
    test_date TIMESTAMP WITH TIME ZONE NOT NULL,
    lab_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'ordered' CHECK (status IN ('ordered', 'processing', 'completed', 'failed')),
    results JSONB,
    interpretation TEXT,
    recommendations TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personalized Treatments Table
CREATE TABLE IF NOT EXISTS personalized_treatments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    medication VARCHAR(255) NOT NULL,
    gene VARCHAR(100) NOT NULL,
    variant VARCHAR(100) NOT NULL,
    phenotype VARCHAR(100) NOT NULL,
    recommended_dosage TEXT NOT NULL,
    alternative_medications TEXT[] NOT NULL,
    contraindications TEXT[] NOT NULL,
    monitoring_requirements TEXT[] NOT NULL,
    risk_factors TEXT[] NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pharmacogenomic Guidelines Table
CREATE TABLE IF NOT EXISTS pharmacogenomic_guidelines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    drug_name VARCHAR(255) NOT NULL,
    gene VARCHAR(100) NOT NULL,
    phenotype VARCHAR(100) NOT NULL,
    recommendation_level VARCHAR(50) NOT NULL CHECK (recommendation_level IN ('strong', 'moderate', 'weak')),
    recommendation_text TEXT NOT NULL,
    dosage_adjustment TEXT,
    alternative_drugs TEXT[],
    monitoring_requirements TEXT[],
    contraindications TEXT[],
    evidence_level VARCHAR(10) NOT NULL CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
    guideline_source VARCHAR(255),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pharmacogenomic Alerts Table
CREATE TABLE IF NOT EXISTS pharmacogenomic_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    medication VARCHAR(255) NOT NULL,
    gene VARCHAR(100) NOT NULL,
    variant VARCHAR(100) NOT NULL,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('contraindication', 'dose_adjustment', 'monitoring', 'alternative_drug')),
    alert_level VARCHAR(50) NOT NULL CHECK (alert_level IN ('critical', 'high', 'moderate', 'low')),
    message TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Pharmacogenomic Analytics Table
CREATE TABLE IF NOT EXISTS pharmacogenomic_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    total_tests INTEGER DEFAULT 0,
    completed_tests INTEGER DEFAULT 0,
    pending_tests INTEGER DEFAULT 0,
    failed_tests INTEGER DEFAULT 0,
    total_variants INTEGER DEFAULT 0,
    pathogenic_variants INTEGER DEFAULT 0,
    drug_interactions_analyzed INTEGER DEFAULT 0,
    personalized_treatments_generated INTEGER DEFAULT 0,
    average_processing_time_days DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gene Information Table
CREATE TABLE IF NOT EXISTS gene_information (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gene_symbol VARCHAR(100) UNIQUE NOT NULL,
    gene_name VARCHAR(255) NOT NULL,
    chromosome VARCHAR(10) NOT NULL,
    gene_start BIGINT,
    gene_end BIGINT,
    gene_description TEXT,
    function_description TEXT,
    associated_diseases TEXT[],
    drug_targets TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Variant Information Table
CREATE TABLE IF NOT EXISTS variant_information (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rs_id VARCHAR(50) UNIQUE NOT NULL,
    gene VARCHAR(100) NOT NULL,
    variant_name VARCHAR(100) NOT NULL,
    chromosome VARCHAR(10) NOT NULL,
    position BIGINT NOT NULL,
    reference_allele VARCHAR(10),
    alternative_allele VARCHAR(10),
    clinical_significance VARCHAR(50),
    population_frequencies JSONB,
    functional_impact VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_genetic_variants_patient_id ON genetic_variants(patient_id);
CREATE INDEX IF NOT EXISTS idx_genetic_variants_gene ON genetic_variants(gene);
CREATE INDEX IF NOT EXISTS idx_genetic_variants_variant ON genetic_variants(variant);
CREATE INDEX IF NOT EXISTS idx_genetic_variants_significance ON genetic_variants(clinical_significance);

CREATE INDEX IF NOT EXISTS idx_drug_gene_interactions_drug_name ON drug_gene_interactions(drug_name);
CREATE INDEX IF NOT EXISTS idx_drug_gene_interactions_gene ON drug_gene_interactions(gene);
CREATE INDEX IF NOT EXISTS idx_drug_gene_interactions_type ON drug_gene_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_drug_gene_interactions_evidence ON drug_gene_interactions(evidence_level);

CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_tests_patient_id ON pharmacogenomic_tests(patient_id);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_tests_status ON pharmacogenomic_tests(status);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_tests_test_date ON pharmacogenomic_tests(test_date);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_tests_test_type ON pharmacogenomic_tests(test_type);

CREATE INDEX IF NOT EXISTS idx_personalized_treatments_patient_id ON personalized_treatments(patient_id);
CREATE INDEX IF NOT EXISTS idx_personalized_treatments_medication ON personalized_treatments(medication);
CREATE INDEX IF NOT EXISTS idx_personalized_treatments_gene ON personalized_treatments(gene);

CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_guidelines_drug_name ON pharmacogenomic_guidelines(drug_name);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_guidelines_gene ON pharmacogenomic_guidelines(gene);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_guidelines_evidence ON pharmacogenomic_guidelines(evidence_level);

CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_alerts_patient_id ON pharmacogenomic_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_alerts_alert_type ON pharmacogenomic_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_alerts_alert_level ON pharmacogenomic_alerts(alert_level);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_alerts_is_read ON pharmacogenomic_alerts(is_read);

CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_analytics_date ON pharmacogenomic_analytics(date);

CREATE INDEX IF NOT EXISTS idx_gene_information_symbol ON gene_information(gene_symbol);
CREATE INDEX IF NOT EXISTS idx_gene_information_chromosome ON gene_information(chromosome);

CREATE INDEX IF NOT EXISTS idx_variant_information_rs_id ON variant_information(rs_id);
CREATE INDEX IF NOT EXISTS idx_variant_information_gene ON variant_information(gene);
CREATE INDEX IF NOT EXISTS idx_variant_information_chromosome ON variant_information(chromosome);

-- Row Level Security (RLS) Policies
ALTER TABLE genetic_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_gene_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacogenomic_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacogenomic_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacogenomic_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacogenomic_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE gene_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_information ENABLE ROW LEVEL SECURITY;

-- Policies for genetic_variants
CREATE POLICY "Users can view genetic variants" ON genetic_variants
    FOR SELECT USING (true);

CREATE POLICY "Users can insert genetic variants" ON genetic_variants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update genetic variants" ON genetic_variants
    FOR UPDATE USING (true);

-- Policies for drug_gene_interactions
CREATE POLICY "Users can view drug gene interactions" ON drug_gene_interactions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert drug gene interactions" ON drug_gene_interactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update drug gene interactions" ON drug_gene_interactions
    FOR UPDATE USING (true);

-- Policies for pharmacogenomic_tests
CREATE POLICY "Users can view pharmacogenomic tests" ON pharmacogenomic_tests
    FOR SELECT USING (true);

CREATE POLICY "Users can insert pharmacogenomic tests" ON pharmacogenomic_tests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update pharmacogenomic tests" ON pharmacogenomic_tests
    FOR UPDATE USING (true);

-- Policies for personalized_treatments
CREATE POLICY "Users can view personalized treatments" ON personalized_treatments
    FOR SELECT USING (true);

CREATE POLICY "Users can insert personalized treatments" ON personalized_treatments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update personalized treatments" ON personalized_treatments
    FOR UPDATE USING (true);

-- Policies for pharmacogenomic_guidelines
CREATE POLICY "Users can view pharmacogenomic guidelines" ON pharmacogenomic_guidelines
    FOR SELECT USING (true);

CREATE POLICY "Users can insert pharmacogenomic guidelines" ON pharmacogenomic_guidelines
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update pharmacogenomic guidelines" ON pharmacogenomic_guidelines
    FOR UPDATE USING (true);

-- Policies for pharmacogenomic_alerts
CREATE POLICY "Users can view pharmacogenomic alerts" ON pharmacogenomic_alerts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert pharmacogenomic alerts" ON pharmacogenomic_alerts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update pharmacogenomic alerts" ON pharmacogenomic_alerts
    FOR UPDATE USING (true);

-- Policies for pharmacogenomic_analytics
CREATE POLICY "Users can view pharmacogenomic analytics" ON pharmacogenomic_analytics
    FOR SELECT USING (true);

CREATE POLICY "Users can insert pharmacogenomic analytics" ON pharmacogenomic_analytics
    FOR INSERT WITH CHECK (true);

-- Policies for gene_information
CREATE POLICY "Users can view gene information" ON gene_information
    FOR SELECT USING (true);

CREATE POLICY "Users can insert gene information" ON gene_information
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update gene information" ON gene_information
    FOR UPDATE USING (true);

-- Policies for variant_information
CREATE POLICY "Users can view variant information" ON variant_information
    FOR SELECT USING (true);

CREATE POLICY "Users can insert variant information" ON variant_information
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update variant information" ON variant_information
    FOR UPDATE USING (true);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_genetic_variants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_drug_gene_interactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_pharmacogenomic_tests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_personalized_treatments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_pharmacogenomic_guidelines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_gene_information_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_variant_information_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
CREATE TRIGGER trigger_update_genetic_variants_updated_at
    BEFORE UPDATE ON genetic_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_genetic_variants_updated_at();

CREATE TRIGGER trigger_update_drug_gene_interactions_updated_at
    BEFORE UPDATE ON drug_gene_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_drug_gene_interactions_updated_at();

CREATE TRIGGER trigger_update_pharmacogenomic_tests_updated_at
    BEFORE UPDATE ON pharmacogenomic_tests
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacogenomic_tests_updated_at();

CREATE TRIGGER trigger_update_personalized_treatments_updated_at
    BEFORE UPDATE ON personalized_treatments
    FOR EACH ROW
    EXECUTE FUNCTION update_personalized_treatments_updated_at();

CREATE TRIGGER trigger_update_pharmacogenomic_guidelines_updated_at
    BEFORE UPDATE ON pharmacogenomic_guidelines
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacogenomic_guidelines_updated_at();

CREATE TRIGGER trigger_update_gene_information_updated_at
    BEFORE UPDATE ON gene_information
    FOR EACH ROW
    EXECUTE FUNCTION update_gene_information_updated_at();

CREATE TRIGGER trigger_update_variant_information_updated_at
    BEFORE UPDATE ON variant_information
    FOR EACH ROW
    EXECUTE FUNCTION update_variant_information_updated_at();

-- Comments for documentation
COMMENT ON TABLE genetic_variants IS 'Stores patient genetic variants with clinical significance';
COMMENT ON TABLE drug_gene_interactions IS 'Stores drug-gene interaction data and recommendations';
COMMENT ON TABLE pharmacogenomic_tests IS 'Stores pharmacogenomic test orders and results';
COMMENT ON TABLE personalized_treatments IS 'Stores personalized treatment plans based on genetics';
COMMENT ON TABLE pharmacogenomic_guidelines IS 'Stores clinical guidelines for pharmacogenomic decisions';
COMMENT ON TABLE pharmacogenomic_alerts IS 'Stores alerts for pharmacogenomic interactions';
COMMENT ON TABLE pharmacogenomic_analytics IS 'Stores daily analytics for pharmacogenomic data';
COMMENT ON TABLE gene_information IS 'Stores reference information about genes';
COMMENT ON TABLE variant_information IS 'Stores reference information about genetic variants';