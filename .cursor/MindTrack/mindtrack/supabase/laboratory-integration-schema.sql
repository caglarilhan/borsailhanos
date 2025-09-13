-- Advanced Laboratory Integration Schema
-- This schema stores laboratory integrations, results, and analytics

-- Lab Integrations Table
CREATE TABLE IF NOT EXISTS lab_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('hl7', 'api', 'file', 'manual')),
    endpoint VARCHAR(500),
    credentials JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_frequency INTEGER DEFAULT 60, -- minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Results Table
CREATE TABLE IF NOT EXISTS lab_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    test_code VARCHAR(100),
    result VARCHAR(255) NOT NULL,
    unit VARCHAR(50),
    reference_range VARCHAR(255),
    status VARCHAR(50) DEFAULT 'normal' CHECK (status IN ('normal', 'abnormal', 'critical')),
    lab_name VARCHAR(255) NOT NULL,
    ordered_by VARCHAR(255),
    ordered_date TIMESTAMP WITH TIME ZONE NOT NULL,
    result_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    interpretation TEXT,
    recommendations TEXT[],
    integration_id UUID REFERENCES lab_integrations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Alerts Table
CREATE TABLE IF NOT EXISTS lab_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    result_id UUID REFERENCES lab_results(id),
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('critical', 'abnormal', 'followup')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Lab Quality Metrics Table
CREATE TABLE IF NOT EXISTS lab_quality_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    total_results INTEGER DEFAULT 0,
    missing_interpretations INTEGER DEFAULT 0,
    missing_recommendations INTEGER DEFAULT 0,
    incomplete_results INTEGER DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Test Panels Table
CREATE TABLE IF NOT EXISTS lab_test_panels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    test_codes TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Reference Ranges Table
CREATE TABLE IF NOT EXISTS lab_reference_ranges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_code VARCHAR(100) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    age_min INTEGER,
    age_max INTEGER,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'both')),
    normal_min DECIMAL(10,4),
    normal_max DECIMAL(10,4),
    critical_min DECIMAL(10,4),
    critical_max DECIMAL(10,4),
    unit VARCHAR(50),
    interpretation_rules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Orders Table
CREATE TABLE IF NOT EXISTS lab_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    ordered_by VARCHAR(255) NOT NULL,
    ordered_date TIMESTAMP WITH TIME ZONE NOT NULL,
    priority VARCHAR(50) DEFAULT 'routine' CHECK (priority IN ('stat', 'urgent', 'routine')),
    status VARCHAR(50) DEFAULT 'ordered' CHECK (status IN ('ordered', 'collected', 'processing', 'completed', 'cancelled')),
    test_panel_id UUID REFERENCES lab_test_panels(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Specimens Table
CREATE TABLE IF NOT EXISTS lab_specimens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES lab_orders(id),
    specimen_type VARCHAR(100) NOT NULL,
    collection_date TIMESTAMP WITH TIME ZONE,
    collection_method VARCHAR(100),
    volume DECIMAL(8,2),
    volume_unit VARCHAR(20),
    storage_conditions VARCHAR(255),
    expiration_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'collected' CHECK (status IN ('collected', 'processing', 'analyzed', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Processing Log Table
CREATE TABLE IF NOT EXISTS lab_processing_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    result_id UUID REFERENCES lab_results(id),
    integration_id UUID REFERENCES lab_integrations(id),
    processing_step VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'skipped')),
    error_message TEXT,
    processing_time_ms INTEGER,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Analytics Cache Table
CREATE TABLE IF NOT EXISTS lab_analytics_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    cache_data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lab_integrations_type ON lab_integrations(type);
CREATE INDEX IF NOT EXISTS idx_lab_integrations_active ON lab_integrations(is_active);

CREATE INDEX IF NOT EXISTS idx_lab_results_patient_id ON lab_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_test_name ON lab_results(test_name);
CREATE INDEX IF NOT EXISTS idx_lab_results_status ON lab_results(status);
CREATE INDEX IF NOT EXISTS idx_lab_results_result_date ON lab_results(result_date);
CREATE INDEX IF NOT EXISTS idx_lab_results_integration_id ON lab_results(integration_id);

CREATE INDEX IF NOT EXISTS idx_lab_alerts_patient_id ON lab_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_alerts_result_id ON lab_alerts(result_id);
CREATE INDEX IF NOT EXISTS idx_lab_alerts_alert_type ON lab_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_lab_alerts_is_read ON lab_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_lab_alerts_created_at ON lab_alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_lab_quality_metrics_date ON lab_quality_metrics(date);

CREATE INDEX IF NOT EXISTS idx_lab_test_panels_active ON lab_test_panels(is_active);

CREATE INDEX IF NOT EXISTS idx_lab_reference_ranges_test_code ON lab_reference_ranges(test_code);
CREATE INDEX IF NOT EXISTS idx_lab_reference_ranges_gender ON lab_reference_ranges(gender);

CREATE INDEX IF NOT EXISTS idx_lab_orders_patient_id ON lab_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_order_number ON lab_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON lab_orders(status);
CREATE INDEX IF NOT EXISTS idx_lab_orders_ordered_date ON lab_orders(ordered_date);

CREATE INDEX IF NOT EXISTS idx_lab_specimens_order_id ON lab_specimens(order_id);
CREATE INDEX IF NOT EXISTS idx_lab_specimens_status ON lab_specimens(status);

CREATE INDEX IF NOT EXISTS idx_lab_processing_log_result_id ON lab_processing_log(result_id);
CREATE INDEX IF NOT EXISTS idx_lab_processing_log_integration_id ON lab_processing_log(integration_id);
CREATE INDEX IF NOT EXISTS idx_lab_processing_log_status ON lab_processing_log(status);

CREATE INDEX IF NOT EXISTS idx_lab_analytics_cache_key ON lab_analytics_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_lab_analytics_cache_expires ON lab_analytics_cache(expires_at);

-- Row Level Security (RLS) Policies
ALTER TABLE lab_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_test_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reference_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_specimens ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_processing_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_analytics_cache ENABLE ROW LEVEL SECURITY;

-- Policies for lab_integrations
CREATE POLICY "Users can view lab integrations" ON lab_integrations
    FOR SELECT USING (true);

CREATE POLICY "Users can insert lab integrations" ON lab_integrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update lab integrations" ON lab_integrations
    FOR UPDATE USING (true);

-- Policies for lab_results
CREATE POLICY "Users can view lab results" ON lab_results
    FOR SELECT USING (true);

CREATE POLICY "Users can insert lab results" ON lab_results
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update lab results" ON lab_results
    FOR UPDATE USING (true);

-- Policies for lab_alerts
CREATE POLICY "Users can view lab alerts" ON lab_alerts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert lab alerts" ON lab_alerts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update lab alerts" ON lab_alerts
    FOR UPDATE USING (true);

-- Policies for lab_quality_metrics
CREATE POLICY "Users can view lab quality metrics" ON lab_quality_metrics
    FOR SELECT USING (true);

CREATE POLICY "Users can insert lab quality metrics" ON lab_quality_metrics
    FOR INSERT WITH CHECK (true);

-- Policies for lab_test_panels
CREATE POLICY "Users can view lab test panels" ON lab_test_panels
    FOR SELECT USING (true);

CREATE POLICY "Users can insert lab test panels" ON lab_test_panels
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update lab test panels" ON lab_test_panels
    FOR UPDATE USING (true);

-- Policies for lab_reference_ranges
CREATE POLICY "Users can view lab reference ranges" ON lab_reference_ranges
    FOR SELECT USING (true);

CREATE POLICY "Users can insert lab reference ranges" ON lab_reference_ranges
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update lab reference ranges" ON lab_reference_ranges
    FOR UPDATE USING (true);

-- Policies for lab_orders
CREATE POLICY "Users can view lab orders" ON lab_orders
    FOR SELECT USING (true);

CREATE POLICY "Users can insert lab orders" ON lab_orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update lab orders" ON lab_orders
    FOR UPDATE USING (true);

-- Policies for lab_specimens
CREATE POLICY "Users can view lab specimens" ON lab_specimens
    FOR SELECT USING (true);

CREATE POLICY "Users can insert lab specimens" ON lab_specimens
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update lab specimens" ON lab_specimens
    FOR UPDATE USING (true);

-- Policies for lab_processing_log
CREATE POLICY "Users can view lab processing log" ON lab_processing_log
    FOR SELECT USING (true);

CREATE POLICY "Users can insert lab processing log" ON lab_processing_log
    FOR INSERT WITH CHECK (true);

-- Policies for lab_analytics_cache
CREATE POLICY "Users can view lab analytics cache" ON lab_analytics_cache
    FOR SELECT USING (true);

CREATE POLICY "Users can insert lab analytics cache" ON lab_analytics_cache
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update lab analytics cache" ON lab_analytics_cache
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete lab analytics cache" ON lab_analytics_cache
    FOR DELETE USING (true);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_lab_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_lab_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_lab_test_panels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_lab_reference_ranges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_lab_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_lab_specimens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
CREATE TRIGGER trigger_update_lab_integrations_updated_at
    BEFORE UPDATE ON lab_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_lab_integrations_updated_at();

CREATE TRIGGER trigger_update_lab_results_updated_at
    BEFORE UPDATE ON lab_results
    FOR EACH ROW
    EXECUTE FUNCTION update_lab_results_updated_at();

CREATE TRIGGER trigger_update_lab_test_panels_updated_at
    BEFORE UPDATE ON lab_test_panels
    FOR EACH ROW
    EXECUTE FUNCTION update_lab_test_panels_updated_at();

CREATE TRIGGER trigger_update_lab_reference_ranges_updated_at
    BEFORE UPDATE ON lab_reference_ranges
    FOR EACH ROW
    EXECUTE FUNCTION update_lab_reference_ranges_updated_at();

CREATE TRIGGER trigger_update_lab_orders_updated_at
    BEFORE UPDATE ON lab_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_lab_orders_updated_at();

CREATE TRIGGER trigger_update_lab_specimens_updated_at
    BEFORE UPDATE ON lab_specimens
    FOR EACH ROW
    EXECUTE FUNCTION update_lab_specimens_updated_at();

-- Comments for documentation
COMMENT ON TABLE lab_integrations IS 'Stores laboratory system integrations and configurations';
COMMENT ON TABLE lab_results IS 'Stores laboratory test results with interpretations and recommendations';
COMMENT ON TABLE lab_alerts IS 'Stores alerts generated from lab results';
COMMENT ON TABLE lab_quality_metrics IS 'Stores daily quality control metrics for lab data';
COMMENT ON TABLE lab_test_panels IS 'Stores predefined test panels and their components';
COMMENT ON TABLE lab_reference_ranges IS 'Stores reference ranges for different lab tests by age and gender';
COMMENT ON TABLE lab_orders IS 'Stores lab orders and their status';
COMMENT ON TABLE lab_specimens IS 'Stores specimen information for lab orders';
COMMENT ON TABLE lab_processing_log IS 'Logs processing steps for lab results';
COMMENT ON TABLE lab_analytics_cache IS 'Caches analytics data for performance';
