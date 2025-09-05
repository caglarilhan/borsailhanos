-- Interoperability Schema
-- Comprehensive interoperability and data exchange management for American psychiatrists

-- FHIR Resources
CREATE TABLE IF NOT EXISTS fhir_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id VARCHAR(100) NOT NULL UNIQUE,
    resource_type VARCHAR(50) NOT NULL, -- 'Patient', 'Practitioner', 'Encounter', 'Observation', 'MedicationRequest', 'DiagnosticReport', 'Condition'
    fhir_version VARCHAR(10) NOT NULL DEFAULT 'R4', -- 'R4', 'R5', 'STU3'
    resource_data JSONB NOT NULL,
    patient_id UUID REFERENCES clients(id),
    practitioner_id UUID REFERENCES users(id),
    encounter_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_synced_at TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(20) DEFAULT 'synced', -- 'synced', 'pending', 'failed', 'conflict'
    sync_error TEXT,
    version_number INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE
);

-- FHIR Endpoints
CREATE TABLE IF NOT EXISTS fhir_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id VARCHAR(100) NOT NULL UNIQUE,
    endpoint_name VARCHAR(200) NOT NULL,
    endpoint_url VARCHAR(500) NOT NULL,
    endpoint_type VARCHAR(50) NOT NULL, -- 'fhir_server', 'ehr_system', 'lab_system', 'pharmacy_system', 'imaging_system'
    fhir_version VARCHAR(10) NOT NULL DEFAULT 'R4',
    authentication_type VARCHAR(50) NOT NULL, -- 'oauth2', 'basic_auth', 'api_key', 'smart_on_fhir', 'none'
    client_id VARCHAR(200),
    client_secret VARCHAR(500),
    scope VARCHAR(500),
    token_url VARCHAR(500),
    authorization_url VARCHAR(500),
    supported_resources TEXT[],
    supported_operations TEXT[], -- 'read', 'write', 'search', 'history', 'batch', 'transaction'
    capabilities JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    last_health_check TIMESTAMP WITH TIME ZONE,
    health_status VARCHAR(20) DEFAULT 'unknown', -- 'healthy', 'unhealthy', 'unknown', 'maintenance'
    response_time_ms INTEGER,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Exchange Protocols
CREATE TABLE IF NOT EXISTS data_exchange_protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id VARCHAR(100) NOT NULL UNIQUE,
    protocol_name VARCHAR(200) NOT NULL,
    protocol_type VARCHAR(50) NOT NULL, -- 'hl7_fhir', 'hl7_v2', 'dicom', 'ccda', 'json_api', 'xml_api', 'rest_api'
    protocol_version VARCHAR(20) NOT NULL,
    description TEXT,
    supported_data_types TEXT[],
    supported_operations TEXT[],
    message_format VARCHAR(50), -- 'json', 'xml', 'hl7', 'dicom', 'binary'
    transport_protocol VARCHAR(20) DEFAULT 'https', -- 'https', 'http', 'ftp', 'sftp', 'mllp'
    authentication_required BOOLEAN DEFAULT TRUE,
    encryption_required BOOLEAN DEFAULT TRUE,
    compression_supported BOOLEAN DEFAULT FALSE,
    batch_processing_supported BOOLEAN DEFAULT FALSE,
    real_time_supported BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Standards
CREATE TABLE IF NOT EXISTS api_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    standard_id VARCHAR(100) NOT NULL UNIQUE,
    standard_name VARCHAR(200) NOT NULL,
    standard_type VARCHAR(50) NOT NULL, -- 'rest_api', 'graphql', 'soap', 'grpc', 'webhook', 'sdk'
    version VARCHAR(20) NOT NULL,
    organization VARCHAR(200), -- 'HL7', 'FHIR', 'IHE', 'ONC', 'Custom'
    description TEXT,
    base_url VARCHAR(500),
    authentication_method VARCHAR(50),
    rate_limit_per_minute INTEGER,
    rate_limit_per_hour INTEGER,
    rate_limit_per_day INTEGER,
    supported_formats TEXT[], -- 'json', 'xml', 'csv', 'pdf'
    supported_languages TEXT[], -- 'en', 'es', 'fr', 'de'
    documentation_url VARCHAR(500),
    swagger_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Mapping Rules
CREATE TABLE IF NOT EXISTS data_mapping_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mapping_id VARCHAR(100) NOT NULL UNIQUE,
    source_system VARCHAR(100) NOT NULL,
    target_system VARCHAR(100) NOT NULL,
    source_field VARCHAR(200) NOT NULL,
    target_field VARCHAR(200) NOT NULL,
    data_type VARCHAR(50) NOT NULL, -- 'string', 'integer', 'decimal', 'date', 'datetime', 'boolean', 'json'
    transformation_rule TEXT,
    validation_rule TEXT,
    default_value VARCHAR(500),
    is_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integration Connections
CREATE TABLE IF NOT EXISTS integration_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id VARCHAR(100) NOT NULL UNIQUE,
    connection_name VARCHAR(200) NOT NULL,
    source_system VARCHAR(100) NOT NULL,
    target_system VARCHAR(100) NOT NULL,
    connection_type VARCHAR(50) NOT NULL, -- 'fhir', 'api', 'database', 'file_transfer', 'message_queue', 'webhook'
    protocol_id UUID REFERENCES data_exchange_protocols(id),
    api_standard_id UUID REFERENCES api_standards(id),
    endpoint_id UUID REFERENCES fhir_endpoints(id),
    authentication_config JSONB,
    connection_config JSONB,
    sync_frequency VARCHAR(50), -- 'real_time', 'hourly', 'daily', 'weekly', 'manual'
    last_sync TIMESTAMP WITH TIME ZONE,
    next_sync TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'error', 'maintenance'
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    success_count INTEGER DEFAULT 0,
    total_records_synced INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Synchronization Logs
CREATE TABLE IF NOT EXISTS data_synchronization_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id VARCHAR(100) NOT NULL UNIQUE,
    connection_id UUID NOT NULL REFERENCES integration_connections(id),
    sync_type VARCHAR(50) NOT NULL, -- 'full_sync', 'incremental_sync', 'real_time_sync', 'manual_sync'
    sync_direction VARCHAR(20) NOT NULL, -- 'inbound', 'outbound', 'bidirectional'
    resource_type VARCHAR(50),
    resource_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    sync_start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_end_time TIMESTAMP WITH TIME ZONE,
    sync_duration_seconds INTEGER,
    sync_status VARCHAR(20) DEFAULT 'running', -- 'running', 'completed', 'failed', 'cancelled'
    error_details TEXT,
    sync_summary JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cross-Platform Compatibility
CREATE TABLE IF NOT EXISTS cross_platform_compatibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compatibility_id VARCHAR(100) NOT NULL UNIQUE,
    platform_name VARCHAR(200) NOT NULL,
    platform_type VARCHAR(50) NOT NULL, -- 'ehr', 'emr', 'his', 'ris', 'lis', 'pharmacy', 'billing', 'mobile_app'
    vendor VARCHAR(200),
    version VARCHAR(50),
    supported_protocols TEXT[],
    supported_formats TEXT[],
    api_compatibility JSONB,
    data_compatibility JSONB,
    security_compatibility JSONB,
    performance_metrics JSONB,
    certification_status VARCHAR(50), -- 'certified', 'pending', 'failed', 'not_applicable'
    certification_date DATE,
    certification_body VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interoperability Analytics
CREATE TABLE IF NOT EXISTS interoperability_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis_period_months INTEGER NOT NULL DEFAULT 12,
    total_connections INTEGER DEFAULT 0,
    active_connections INTEGER DEFAULT 0,
    total_syncs INTEGER DEFAULT 0,
    successful_syncs INTEGER DEFAULT 0,
    failed_syncs INTEGER DEFAULT 0,
    average_sync_time_seconds DECIMAL(8,2),
    total_records_exchanged INTEGER DEFAULT 0,
    data_quality_score DECIMAL(5,2),
    system_uptime_percentage DECIMAL(5,2),
    error_rate_percentage DECIMAL(5,2),
    performance_metrics JSONB,
    compliance_metrics JSONB,
    cost_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interoperability Settings
CREATE TABLE IF NOT EXISTS interoperability_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_category VARCHAR(50) NOT NULL, -- 'fhir', 'api', 'security', 'performance', 'monitoring', 'backup'
    setting_name VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    setting_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fhir_resources_type ON fhir_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_fhir_resources_patient_id ON fhir_resources(patient_id);
CREATE INDEX IF NOT EXISTS idx_fhir_resources_practitioner_id ON fhir_resources(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_fhir_resources_sync_status ON fhir_resources(sync_status);
CREATE INDEX IF NOT EXISTS idx_fhir_resources_created_at ON fhir_resources(created_at);

CREATE INDEX IF NOT EXISTS idx_fhir_endpoints_type ON fhir_endpoints(endpoint_type);
CREATE INDEX IF NOT EXISTS idx_fhir_endpoints_health_status ON fhir_endpoints(health_status);
CREATE INDEX IF NOT EXISTS idx_fhir_endpoints_active ON fhir_endpoints(is_active);

CREATE INDEX IF NOT EXISTS idx_data_exchange_protocols_type ON data_exchange_protocols(protocol_type);
CREATE INDEX IF NOT EXISTS idx_data_exchange_protocols_active ON data_exchange_protocols(is_active);

CREATE INDEX IF NOT EXISTS idx_api_standards_type ON api_standards(standard_type);
CREATE INDEX IF NOT EXISTS idx_api_standards_organization ON api_standards(organization);
CREATE INDEX IF NOT EXISTS idx_api_standards_active ON api_standards(is_active);

CREATE INDEX IF NOT EXISTS idx_data_mapping_rules_source_system ON data_mapping_rules(source_system);
CREATE INDEX IF NOT EXISTS idx_data_mapping_rules_target_system ON data_mapping_rules(target_system);
CREATE INDEX IF NOT EXISTS idx_data_mapping_rules_active ON data_mapping_rules(is_active);

CREATE INDEX IF NOT EXISTS idx_integration_connections_source_system ON integration_connections(source_system);
CREATE INDEX IF NOT EXISTS idx_integration_connections_target_system ON integration_connections(target_system);
CREATE INDEX IF NOT EXISTS idx_integration_connections_type ON integration_connections(connection_type);
CREATE INDEX IF NOT EXISTS idx_integration_connections_status ON integration_connections(sync_status);
CREATE INDEX IF NOT EXISTS idx_integration_connections_active ON integration_connections(is_active);

CREATE INDEX IF NOT EXISTS idx_data_sync_logs_connection_id ON data_synchronization_logs(connection_id);
CREATE INDEX IF NOT EXISTS idx_data_sync_logs_sync_type ON data_synchronization_logs(sync_type);
CREATE INDEX IF NOT EXISTS idx_data_sync_logs_status ON data_synchronization_logs(sync_status);
CREATE INDEX IF NOT EXISTS idx_data_sync_logs_start_time ON data_synchronization_logs(sync_start_time);

CREATE INDEX IF NOT EXISTS idx_cross_platform_compatibility_type ON cross_platform_compatibility(platform_type);
CREATE INDEX IF NOT EXISTS idx_cross_platform_compatibility_vendor ON cross_platform_compatibility(vendor);
CREATE INDEX IF NOT EXISTS idx_cross_platform_compatibility_certification ON cross_platform_compatibility(certification_status);
CREATE INDEX IF NOT EXISTS idx_cross_platform_compatibility_active ON cross_platform_compatibility(is_active);

CREATE INDEX IF NOT EXISTS idx_interoperability_analytics_date ON interoperability_analytics(analysis_date);

CREATE INDEX IF NOT EXISTS idx_interoperability_settings_category ON interoperability_settings(setting_category);
CREATE INDEX IF NOT EXISTS idx_interoperability_settings_active ON interoperability_settings(is_active);

-- RLS Policies
ALTER TABLE fhir_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE fhir_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exchange_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_mapping_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_synchronization_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_platform_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE interoperability_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE interoperability_settings ENABLE ROW LEVEL SECURITY;

-- FHIR resources policies
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
        ) OR practitioner_id = auth.uid()
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

-- FHIR endpoints policies (system-wide read access)
CREATE POLICY "Users can view FHIR endpoints" ON fhir_endpoints
    FOR SELECT USING (true);

CREATE POLICY "Users can insert FHIR endpoints" ON fhir_endpoints
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update FHIR endpoints" ON fhir_endpoints
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete FHIR endpoints" ON fhir_endpoints
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Data exchange protocols policies (system-wide read access)
CREATE POLICY "Users can view data exchange protocols" ON data_exchange_protocols
    FOR SELECT USING (true);

CREATE POLICY "Users can insert data exchange protocols" ON data_exchange_protocols
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update data exchange protocols" ON data_exchange_protocols
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete data exchange protocols" ON data_exchange_protocols
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- API standards policies (system-wide read access)
CREATE POLICY "Users can view API standards" ON api_standards
    FOR SELECT USING (true);

CREATE POLICY "Users can insert API standards" ON api_standards
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update API standards" ON api_standards
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete API standards" ON api_standards
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Data mapping rules policies (system-wide read access)
CREATE POLICY "Users can view data mapping rules" ON data_mapping_rules
    FOR SELECT USING (true);

CREATE POLICY "Users can insert data mapping rules" ON data_mapping_rules
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update data mapping rules" ON data_mapping_rules
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete data mapping rules" ON data_mapping_rules
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Integration connections policies (system-wide read access)
CREATE POLICY "Users can view integration connections" ON integration_connections
    FOR SELECT USING (true);

CREATE POLICY "Users can insert integration connections" ON integration_connections
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update integration connections" ON integration_connections
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete integration connections" ON integration_connections
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Data synchronization logs policies (system-wide read access)
CREATE POLICY "Users can view synchronization logs" ON data_synchronization_logs
    FOR SELECT USING (true);

CREATE POLICY "Users can insert synchronization logs" ON data_synchronization_logs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update synchronization logs" ON data_synchronization_logs
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete synchronization logs" ON data_synchronization_logs
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Cross-platform compatibility policies (system-wide read access)
CREATE POLICY "Users can view cross-platform compatibility" ON cross_platform_compatibility
    FOR SELECT USING (true);

CREATE POLICY "Users can insert cross-platform compatibility" ON cross_platform_compatibility
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update cross-platform compatibility" ON cross_platform_compatibility
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete cross-platform compatibility" ON cross_platform_compatibility
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Interoperability analytics policies (system-wide read access)
CREATE POLICY "Users can view interoperability analytics" ON interoperability_analytics
    FOR SELECT USING (true);

CREATE POLICY "Users can insert interoperability analytics" ON interoperability_analytics
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update interoperability analytics" ON interoperability_analytics
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete interoperability analytics" ON interoperability_analytics
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Interoperability settings policies (system-wide read access)
CREATE POLICY "Users can view interoperability settings" ON interoperability_settings
    FOR SELECT USING (true);

CREATE POLICY "Users can insert interoperability settings" ON interoperability_settings
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update interoperability settings" ON interoperability_settings
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete interoperability settings" ON interoperability_settings
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Functions for Interoperability

-- Function to generate interoperability analytics
CREATE OR REPLACE FUNCTION generate_interoperability_analytics(
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
        'analysis_start_date', v_start_date,
        'analysis_end_date', p_analysis_date,
        'total_connections', (
            SELECT COUNT(*) FROM integration_connections
            WHERE created_at >= v_start_date
        ),
        'active_connections', (
            SELECT COUNT(*) FROM integration_connections
            WHERE created_at >= v_start_date
            AND is_active = TRUE
            AND sync_status = 'active'
        ),
        'total_syncs', (
            SELECT COUNT(*) FROM data_synchronization_logs
            WHERE sync_start_time >= v_start_date
        ),
        'successful_syncs', (
            SELECT COUNT(*) FROM data_synchronization_logs
            WHERE sync_start_time >= v_start_date
            AND sync_status = 'completed'
        ),
        'failed_syncs', (
            SELECT COUNT(*) FROM data_synchronization_logs
            WHERE sync_start_time >= v_start_date
            AND sync_status = 'failed'
        ),
        'average_sync_time_seconds', (
            SELECT AVG(sync_duration_seconds) FROM data_synchronization_logs
            WHERE sync_start_time >= v_start_date
            AND sync_status = 'completed'
            AND sync_duration_seconds IS NOT NULL
        ),
        'total_records_exchanged', (
            SELECT COALESCE(SUM(resource_count), 0) FROM data_synchronization_logs
            WHERE sync_start_time >= v_start_date
            AND sync_status = 'completed'
        ),
        'data_quality_score', (
            SELECT AVG(
                CASE 
                    WHEN error_count = 0 THEN 100.0
                    WHEN resource_count = 0 THEN 0.0
                    ELSE ((success_count::DECIMAL / resource_count::DECIMAL) * 100)
                END
            ) FROM data_synchronization_logs
            WHERE sync_start_time >= v_start_date
            AND sync_status = 'completed'
        ),
        'system_uptime_percentage', 99.5, -- Mock data
        'error_rate_percentage', (
            SELECT CASE 
                WHEN COUNT(*) = 0 THEN 0
                ELSE (COUNT(CASE WHEN sync_status = 'failed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100
            END
            FROM data_synchronization_logs
            WHERE sync_start_time >= v_start_date
        ),
        'performance_metrics', jsonb_build_object(
            'average_response_time_ms', 150.0, -- Mock data
            'peak_throughput_per_hour', 10000, -- Mock data
            'concurrent_connections', 50, -- Mock data
            'data_volume_gb_per_day', 25.5 -- Mock data
        ),
        'compliance_metrics', jsonb_build_object(
            'hipaa_compliance', 100.0, -- Mock data
            'fhir_compliance', 98.5, -- Mock data
            'api_standards_compliance', 95.0, -- Mock data
            'security_compliance', 99.0 -- Mock data
        ),
        'cost_analysis', jsonb_build_object(
            'integration_cost_per_month', 2500.0, -- Mock data
            'data_transfer_cost', 150.0, -- Mock data
            'maintenance_cost', 500.0, -- Mock data
            'total_cost_savings', 15000.0 -- Mock data
        )
    ) INTO v_analytics;
    
    RETURN v_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update interoperability analytics
CREATE OR REPLACE FUNCTION update_interoperability_analytics(
    p_analysis_date DATE DEFAULT CURRENT_DATE,
    p_analysis_period_months INTEGER DEFAULT 12
)
RETURNS VOID AS $$
DECLARE
    v_analytics JSONB;
BEGIN
    SELECT generate_interoperability_analytics(p_analysis_date, p_analysis_period_months) INTO v_analytics;
    
    INSERT INTO interoperability_analytics (
        analysis_date,
        analysis_period_months,
        total_connections,
        active_connections,
        total_syncs,
        successful_syncs,
        failed_syncs,
        average_sync_time_seconds,
        total_records_exchanged,
        data_quality_score,
        system_uptime_percentage,
        error_rate_percentage,
        performance_metrics,
        compliance_metrics,
        cost_analysis
    ) VALUES (
        p_analysis_date,
        p_analysis_period_months,
        (v_analytics->>'total_connections')::INTEGER,
        (v_analytics->>'active_connections')::INTEGER,
        (v_analytics->>'total_syncs')::INTEGER,
        (v_analytics->>'successful_syncs')::INTEGER,
        (v_analytics->>'failed_syncs')::INTEGER,
        (v_analytics->>'average_sync_time_seconds')::DECIMAL(8,2),
        (v_analytics->>'total_records_exchanged')::INTEGER,
        (v_analytics->>'data_quality_score')::DECIMAL(5,2),
        (v_analytics->>'system_uptime_percentage')::DECIMAL(5,2),
        (v_analytics->>'error_rate_percentage')::DECIMAL(5,2),
        v_analytics->'performance_metrics',
        v_analytics->'compliance_metrics',
        v_analytics->'cost_analysis'
    )
    ON CONFLICT (analysis_date) 
    DO UPDATE SET
        analysis_period_months = EXCLUDED.analysis_period_months,
        total_connections = EXCLUDED.total_connections,
        active_connections = EXCLUDED.active_connections,
        total_syncs = EXCLUDED.total_syncs,
        successful_syncs = EXCLUDED.successful_syncs,
        failed_syncs = EXCLUDED.failed_syncs,
        average_sync_time_seconds = EXCLUDED.average_sync_time_seconds,
        total_records_exchanged = EXCLUDED.total_records_exchanged,
        data_quality_score = EXCLUDED.data_quality_score,
        system_uptime_percentage = EXCLUDED.system_uptime_percentage,
        error_rate_percentage = EXCLUDED.error_rate_percentage,
        performance_metrics = EXCLUDED.performance_metrics,
        compliance_metrics = EXCLUDED.compliance_metrics,
        cost_analysis = EXCLUDED.cost_analysis,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics when new sync logs are created
CREATE OR REPLACE FUNCTION trigger_update_interoperability_analytics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_interoperability_analytics();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER interoperability_analytics_trigger
    AFTER INSERT OR UPDATE ON data_synchronization_logs
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_interoperability_analytics();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_interoperability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fhir_resources_updated_at
    BEFORE UPDATE ON fhir_resources
    FOR EACH ROW
    EXECUTE FUNCTION update_interoperability_updated_at();

CREATE TRIGGER fhir_endpoints_updated_at
    BEFORE UPDATE ON fhir_endpoints
    FOR EACH ROW
    EXECUTE FUNCTION update_interoperability_updated_at();

CREATE TRIGGER data_exchange_protocols_updated_at
    BEFORE UPDATE ON data_exchange_protocols
    FOR EACH ROW
    EXECUTE FUNCTION update_interoperability_updated_at();

CREATE TRIGGER api_standards_updated_at
    BEFORE UPDATE ON api_standards
    FOR EACH ROW
    EXECUTE FUNCTION update_interoperability_updated_at();

CREATE TRIGGER data_mapping_rules_updated_at
    BEFORE UPDATE ON data_mapping_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_interoperability_updated_at();

CREATE TRIGGER integration_connections_updated_at
    BEFORE UPDATE ON integration_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_interoperability_updated_at();

CREATE TRIGGER cross_platform_compatibility_updated_at
    BEFORE UPDATE ON cross_platform_compatibility
    FOR EACH ROW
    EXECUTE FUNCTION update_interoperability_updated_at();

CREATE TRIGGER interoperability_analytics_updated_at
    BEFORE UPDATE ON interoperability_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_interoperability_updated_at();

CREATE TRIGGER interoperability_settings_updated_at
    BEFORE UPDATE ON interoperability_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_interoperability_updated_at();
