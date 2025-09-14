-- Advanced Security & Compliance Schema
-- Comprehensive security management for American psychiatrists

-- Security Roles and Permissions
CREATE TABLE IF NOT EXISTS security_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(100) NOT NULL UNIQUE,
    role_description TEXT,
    role_type VARCHAR(50) NOT NULL, -- 'system', 'clinical', 'administrative', 'custom'
    permissions JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Security Profiles
CREATE TABLE IF NOT EXISTS user_security_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES security_roles(id),
    security_level VARCHAR(20) NOT NULL DEFAULT 'standard', -- 'basic', 'standard', 'high', 'critical'
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_method VARCHAR(50), -- 'sms', 'email', 'totp', 'hardware', 'biometric'
    mfa_secret VARCHAR(255),
    password_last_changed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    password_expires_at TIMESTAMP WITH TIME ZONE,
    account_locked BOOLEAN DEFAULT FALSE,
    account_locked_until TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip VARCHAR(45),
    session_timeout_minutes INTEGER DEFAULT 30,
    ip_whitelist TEXT[],
    ip_blacklist TEXT[],
    access_hours_start TIME,
    access_hours_end TIME,
    allowed_devices JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Multi-Factor Authentication
CREATE TABLE IF NOT EXISTS mfa_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(200) NOT NULL,
    device_type VARCHAR(50) NOT NULL, -- 'sms', 'email', 'totp', 'hardware', 'biometric'
    device_identifier VARCHAR(255) NOT NULL, -- phone number, email, device ID
    secret_key VARCHAR(255),
    backup_codes TEXT[],
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(100),
    action_type VARCHAR(100) NOT NULL, -- 'login', 'logout', 'create', 'read', 'update', 'delete', 'export', 'print'
    resource_type VARCHAR(100) NOT NULL, -- 'patient', 'medication', 'appointment', 'report'
    resource_id VARCHAR(100),
    action_description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_method VARCHAR(10),
    request_url TEXT,
    request_headers JSONB,
    request_body JSONB,
    response_status INTEGER,
    response_body JSONB,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    risk_level VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
    compliance_category VARCHAR(50), -- 'hipaa', 'sox', 'pci', 'gdpr', 'ccpa'
    data_classification VARCHAR(20), -- 'public', 'internal', 'confidential', 'restricted'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Incidents
CREATE TABLE IF NOT EXISTS security_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id VARCHAR(100) NOT NULL UNIQUE,
    incident_type VARCHAR(50) NOT NULL, -- 'breach', 'unauthorized_access', 'data_loss', 'malware', 'phishing'
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'investigating', 'contained', 'resolved', 'closed'
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    affected_users INTEGER DEFAULT 0,
    affected_patients INTEGER DEFAULT 0,
    data_compromised TEXT[],
    detection_method VARCHAR(100),
    detection_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    containment_timestamp TIMESTAMP WITH TIME ZONE,
    resolution_timestamp TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES users(id),
    investigation_notes TEXT,
    remediation_actions TEXT[],
    lessons_learned TEXT,
    prevention_measures TEXT[],
    regulatory_notification_required BOOLEAN DEFAULT FALSE,
    regulatory_notification_sent BOOLEAN DEFAULT FALSE,
    regulatory_notification_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Encryption Keys
CREATE TABLE IF NOT EXISTS encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name VARCHAR(100) NOT NULL UNIQUE,
    key_type VARCHAR(50) NOT NULL, -- 'aes', 'rsa', 'ec', 'pgp'
    key_size INTEGER NOT NULL,
    key_algorithm VARCHAR(50) NOT NULL,
    encrypted_key TEXT NOT NULL,
    key_version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    rotated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id)
);

-- Data Classification
CREATE TABLE IF NOT EXISTS data_classification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    column_name VARCHAR(100) NOT NULL,
    classification_level VARCHAR(20) NOT NULL, -- 'public', 'internal', 'confidential', 'restricted'
    data_type VARCHAR(50) NOT NULL, -- 'pii', 'phi', 'financial', 'clinical', 'administrative'
    encryption_required BOOLEAN DEFAULT FALSE,
    retention_period_years INTEGER,
    access_restrictions TEXT[],
    compliance_requirements TEXT[], -- 'hipaa', 'sox', 'pci', 'gdpr', 'ccpa'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(table_name, column_name)
);

-- Compliance Frameworks
CREATE TABLE IF NOT EXISTS compliance_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_name VARCHAR(100) NOT NULL UNIQUE,
    framework_version VARCHAR(20) NOT NULL,
    framework_type VARCHAR(50) NOT NULL, -- 'hipaa', 'sox', 'pci', 'gdpr', 'ccpa', 'iso27001', 'nist'
    description TEXT,
    applicable_scope TEXT[],
    requirements JSONB NOT NULL DEFAULT '{}',
    controls JSONB NOT NULL DEFAULT '{}',
    assessment_frequency_months INTEGER DEFAULT 12,
    last_assessment_date DATE,
    next_assessment_date DATE,
    compliance_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'compliant', 'non_compliant'
    compliance_score DECIMAL(5,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Assessments
CREATE TABLE IF NOT EXISTS compliance_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id VARCHAR(100) NOT NULL UNIQUE,
    framework_id UUID NOT NULL REFERENCES compliance_frameworks(id),
    assessor_id UUID NOT NULL REFERENCES users(id),
    assessment_type VARCHAR(50) NOT NULL, -- 'initial', 'periodic', 'remediation', 'audit'
    assessment_date DATE NOT NULL,
    assessment_scope TEXT[],
    findings JSONB NOT NULL DEFAULT '{}',
    gaps JSONB NOT NULL DEFAULT '{}',
    recommendations JSONB NOT NULL DEFAULT '{}',
    risk_level VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    compliance_score DECIMAL(5,2),
    overall_status VARCHAR(20) NOT NULL, -- 'compliant', 'partially_compliant', 'non_compliant'
    remediation_plan TEXT,
    remediation_timeline DATE,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Policies
CREATE TABLE IF NOT EXISTS security_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_name VARCHAR(200) NOT NULL UNIQUE,
    policy_type VARCHAR(50) NOT NULL, -- 'access_control', 'data_protection', 'incident_response', 'password', 'encryption'
    policy_version VARCHAR(20) NOT NULL,
    policy_description TEXT,
    policy_content TEXT NOT NULL,
    applicable_roles TEXT[],
    enforcement_level VARCHAR(20) DEFAULT 'mandatory', -- 'advisory', 'recommended', 'mandatory'
    effective_date DATE NOT NULL,
    expiration_date DATE,
    approval_status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'pending_approval', 'approved', 'active', 'expired'
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    review_frequency_months INTEGER DEFAULT 12,
    last_review_date DATE,
    next_review_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Training Records
CREATE TABLE IF NOT EXISTS security_training_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    training_type VARCHAR(100) NOT NULL, -- 'hipaa', 'security_awareness', 'phishing', 'data_protection'
    training_title VARCHAR(200) NOT NULL,
    training_provider VARCHAR(200),
    training_date DATE NOT NULL,
    completion_date DATE,
    score DECIMAL(5,2),
    passing_score DECIMAL(5,2) DEFAULT 80.0,
    status VARCHAR(20) DEFAULT 'assigned', -- 'assigned', 'in_progress', 'completed', 'failed', 'expired'
    certificate_url VARCHAR(500),
    expiration_date DATE,
    retake_required BOOLEAN DEFAULT FALSE,
    retake_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Analytics
CREATE TABLE IF NOT EXISTS security_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis_period_months INTEGER NOT NULL DEFAULT 12,
    total_login_attempts INTEGER NOT NULL DEFAULT 0,
    successful_logins INTEGER NOT NULL DEFAULT 0,
    failed_logins INTEGER NOT NULL DEFAULT 0,
    mfa_usage_rate DECIMAL(5,2),
    security_incidents INTEGER NOT NULL DEFAULT 0,
    critical_incidents INTEGER NOT NULL DEFAULT 0,
    resolved_incidents INTEGER NOT NULL DEFAULT 0,
    average_resolution_time_hours DECIMAL(8,2),
    compliance_score DECIMAL(5,2),
    policy_violations INTEGER NOT NULL DEFAULT 0,
    training_completion_rate DECIMAL(5,2),
    risk_score DECIMAL(5,2),
    threat_level VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
    security_metrics JSONB,
    compliance_metrics JSONB,
    risk_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_roles_type ON security_roles(role_type);
CREATE INDEX IF NOT EXISTS idx_security_roles_active ON security_roles(is_active);

CREATE INDEX IF NOT EXISTS idx_user_security_profiles_user_id ON user_security_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_security_profiles_role_id ON user_security_profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_security_profiles_security_level ON user_security_profiles(security_level);
CREATE INDEX IF NOT EXISTS idx_user_security_profiles_mfa_enabled ON user_security_profiles(mfa_enabled);

CREATE INDEX IF NOT EXISTS idx_mfa_devices_user_id ON mfa_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_devices_device_type ON mfa_devices(device_type);
CREATE INDEX IF NOT EXISTS idx_mfa_devices_active ON mfa_devices(is_active);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_level ON audit_logs(risk_level);
CREATE INDEX IF NOT EXISTS idx_audit_logs_compliance_category ON audit_logs(compliance_category);

CREATE INDEX IF NOT EXISTS idx_security_incidents_type ON security_incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_security_incidents_detection_timestamp ON security_incidents(detection_timestamp);

CREATE INDEX IF NOT EXISTS idx_encryption_keys_type ON encryption_keys(key_type);
CREATE INDEX IF NOT EXISTS idx_encryption_keys_active ON encryption_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_encryption_keys_expires_at ON encryption_keys(expires_at);

CREATE INDEX IF NOT EXISTS idx_data_classification_table_name ON data_classification(table_name);
CREATE INDEX IF NOT EXISTS idx_data_classification_classification_level ON data_classification(classification_level);
CREATE INDEX IF NOT EXISTS idx_data_classification_data_type ON data_classification(data_type);

CREATE INDEX IF NOT EXISTS idx_compliance_frameworks_type ON compliance_frameworks(framework_type);
CREATE INDEX IF NOT EXISTS idx_compliance_frameworks_active ON compliance_frameworks(is_active);

CREATE INDEX IF NOT EXISTS idx_compliance_assessments_framework_id ON compliance_assessments(framework_id);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_assessor_id ON compliance_assessments(assessor_id);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_assessment_date ON compliance_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_status ON compliance_assessments(overall_status);

CREATE INDEX IF NOT EXISTS idx_security_policies_type ON security_policies(policy_type);
CREATE INDEX IF NOT EXISTS idx_security_policies_approval_status ON security_policies(approval_status);
CREATE INDEX IF NOT EXISTS idx_security_policies_active ON security_policies(is_active);

CREATE INDEX IF NOT EXISTS idx_security_training_records_user_id ON security_training_records(user_id);
CREATE INDEX IF NOT EXISTS idx_security_training_records_training_type ON security_training_records(training_type);
CREATE INDEX IF NOT EXISTS idx_security_training_records_status ON security_training_records(status);
CREATE INDEX IF NOT EXISTS idx_security_training_records_expiration_date ON security_training_records(expiration_date);

CREATE INDEX IF NOT EXISTS idx_security_analytics_date ON security_analytics(analysis_date);

-- RLS Policies
ALTER TABLE security_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mfa_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_classification ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_analytics ENABLE ROW LEVEL SECURITY;

-- Security roles policies (system-wide read access)
CREATE POLICY "Users can view security roles" ON security_roles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert security roles" ON security_roles
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update security roles" ON security_roles
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete security roles" ON security_roles
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- User security profiles policies
CREATE POLICY "Users can view their own security profile" ON user_security_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own security profile" ON user_security_profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all security profiles" ON user_security_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

CREATE POLICY "Admins can insert security profiles" ON user_security_profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

CREATE POLICY "Admins can update security profiles" ON user_security_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

CREATE POLICY "Admins can delete security profiles" ON user_security_profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

-- MFA devices policies
CREATE POLICY "Users can view their own MFA devices" ON mfa_devices
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own MFA devices" ON mfa_devices
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own MFA devices" ON mfa_devices
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own MFA devices" ON mfa_devices
    FOR DELETE USING (user_id = auth.uid());

-- Audit logs policies (system-wide read access for compliance)
CREATE POLICY "Users can view audit logs" ON audit_logs
    FOR SELECT USING (true);

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update audit logs" ON audit_logs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

CREATE POLICY "Admins can delete audit logs" ON audit_logs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

-- Security incidents policies
CREATE POLICY "Users can view security incidents" ON security_incidents
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert security incidents" ON security_incidents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

CREATE POLICY "Admins can update security incidents" ON security_incidents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

CREATE POLICY "Admins can delete security incidents" ON security_incidents
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

-- Encryption keys policies (system-wide read access)
CREATE POLICY "Users can view encryption keys" ON encryption_keys
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert encryption keys" ON encryption_keys
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

CREATE POLICY "Admins can update encryption keys" ON encryption_keys
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

CREATE POLICY "Admins can delete encryption keys" ON encryption_keys
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

-- Data classification policies (system-wide read access)
CREATE POLICY "Users can view data classification" ON data_classification
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert data classification" ON data_classification
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

CREATE POLICY "Admins can update data classification" ON data_classification
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

CREATE POLICY "Admins can delete data classification" ON data_classification
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

-- Compliance frameworks policies (system-wide read access)
CREATE POLICY "Users can view compliance frameworks" ON compliance_frameworks
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert compliance frameworks" ON compliance_frameworks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

CREATE POLICY "Admins can update compliance frameworks" ON compliance_frameworks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

CREATE POLICY "Admins can delete compliance frameworks" ON compliance_frameworks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

-- Compliance assessments policies
CREATE POLICY "Users can view compliance assessments" ON compliance_assessments
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert compliance assessments" ON compliance_assessments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

CREATE POLICY "Admins can update compliance assessments" ON compliance_assessments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

CREATE POLICY "Admins can delete compliance assessments" ON compliance_assessments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

-- Security policies policies (system-wide read access)
CREATE POLICY "Users can view security policies" ON security_policies
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert security policies" ON security_policies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

CREATE POLICY "Admins can update security policies" ON security_policies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

CREATE POLICY "Admins can delete security policies" ON security_policies
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

-- Security training records policies
CREATE POLICY "Users can view their own training records" ON security_training_records
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own training records" ON security_training_records
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own training records" ON security_training_records
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all training records" ON security_training_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

CREATE POLICY "Admins can insert training records" ON security_training_records
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

CREATE POLICY "Admins can update training records" ON security_training_records
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

CREATE POLICY "Admins can delete training records" ON security_training_records
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

-- Security analytics policies (system-wide access)
CREATE POLICY "Users can view security analytics" ON security_analytics
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert security analytics" ON security_analytics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

CREATE POLICY "Admins can update security analytics" ON security_analytics
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

CREATE POLICY "Admins can delete security analytics" ON security_analytics
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_security_profiles usp
            JOIN security_roles sr ON usp.role_id = sr.id
            WHERE usp.user_id = auth.uid()
            AND sr.role_name = 'admin'
        )
    );

-- Functions for Security

-- Function to log security event
CREATE OR REPLACE FUNCTION log_security_event(
    p_user_id UUID,
    p_action_type VARCHAR(100),
    p_resource_type VARCHAR(100),
    p_resource_id VARCHAR(100),
    p_action_description TEXT,
    p_ip_address VARCHAR(45),
    p_user_agent TEXT,
    p_success BOOLEAN,
    p_error_message TEXT DEFAULT NULL,
    p_risk_level VARCHAR(20) DEFAULT 'low',
    p_compliance_category VARCHAR(50) DEFAULT NULL,
    p_data_classification VARCHAR(20) DEFAULT 'internal'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action_type,
        resource_type,
        resource_id,
        action_description,
        ip_address,
        user_agent,
        success,
        error_message,
        risk_level,
        compliance_category,
        data_classification
    ) VALUES (
        p_user_id,
        p_action_type,
        p_resource_type,
        p_resource_id,
        p_action_description,
        p_ip_address,
        p_user_agent,
        p_success,
        p_error_message,
        p_risk_level,
        p_compliance_category,
        p_data_classification
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(
    p_user_id UUID,
    p_permission VARCHAR(100)
)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_permission BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM user_security_profiles usp
        JOIN security_roles sr ON usp.role_id = sr.id
        WHERE usp.user_id = p_user_id
        AND usp.is_active = TRUE
        AND sr.is_active = TRUE
        AND sr.permissions ? p_permission
    ) INTO v_has_permission;
    
    RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate security analytics
CREATE OR REPLACE FUNCTION generate_security_analytics(
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
        'total_login_attempts', (
            SELECT COUNT(*) FROM audit_logs
            WHERE action_type = 'login'
            AND timestamp >= v_start_date
        ),
        'successful_logins', (
            SELECT COUNT(*) FROM audit_logs
            WHERE action_type = 'login'
            AND success = TRUE
            AND timestamp >= v_start_date
        ),
        'failed_logins', (
            SELECT COUNT(*) FROM audit_logs
            WHERE action_type = 'login'
            AND success = FALSE
            AND timestamp >= v_start_date
        ),
        'mfa_usage_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN mfa_enabled = TRUE THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM user_security_profiles
            WHERE created_at >= v_start_date
        ),
        'security_incidents', (
            SELECT COUNT(*) FROM security_incidents
            WHERE detection_timestamp >= v_start_date
        ),
        'critical_incidents', (
            SELECT COUNT(*) FROM security_incidents
            WHERE detection_timestamp >= v_start_date
            AND severity = 'critical'
        ),
        'resolved_incidents', (
            SELECT COUNT(*) FROM security_incidents
            WHERE detection_timestamp >= v_start_date
            AND status = 'resolved'
        ),
        'average_resolution_time_hours', (
            SELECT AVG(EXTRACT(EPOCH FROM (resolution_timestamp - detection_timestamp)) / 3600)
            FROM security_incidents
            WHERE detection_timestamp >= v_start_date
            AND resolution_timestamp IS NOT NULL
        ),
        'compliance_score', (
            SELECT AVG(compliance_score) FROM compliance_assessments
            WHERE assessment_date >= v_start_date
        ),
        'policy_violations', (
            SELECT COUNT(*) FROM audit_logs
            WHERE timestamp >= v_start_date
            AND risk_level IN ('high', 'critical')
        ),
        'training_completion_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM security_training_records
            WHERE training_date >= v_start_date
        ),
        'risk_score', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        AVG(
                            CASE 
                                WHEN severity = 'critical' THEN 100
                                WHEN severity = 'high' THEN 75
                                WHEN severity = 'medium' THEN 50
                                WHEN severity = 'low' THEN 25
                                ELSE 0
                            END
                        )
                    ELSE 0
                END
            FROM security_incidents
            WHERE detection_timestamp >= v_start_date
        ),
        'security_metrics', (
            SELECT jsonb_build_object(
                'login_success_rate', 
                    CASE 
                        WHEN COUNT(*) > 0 THEN 
                            COUNT(CASE WHEN success = TRUE THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                        ELSE 0
                    END,
                'mfa_adoption_rate',
                    CASE 
                        WHEN COUNT(*) > 0 THEN 
                            COUNT(CASE WHEN mfa_enabled = TRUE THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                        ELSE 0
                    END,
                'incident_response_time',
                    AVG(EXTRACT(EPOCH FROM (resolution_timestamp - detection_timestamp)) / 3600)
            )
            FROM audit_logs al
            LEFT JOIN user_security_profiles usp ON al.user_id = usp.user_id
            LEFT JOIN security_incidents si ON al.user_id = si.assigned_to
            WHERE al.timestamp >= v_start_date
        ),
        'compliance_metrics', (
            SELECT jsonb_object_agg(
                cf.framework_name,
                jsonb_build_object(
                    'compliance_score', AVG(ca.compliance_score),
                    'assessment_count', COUNT(ca.id),
                    'last_assessment', MAX(ca.assessment_date)
                )
            )
            FROM compliance_frameworks cf
            LEFT JOIN compliance_assessments ca ON cf.id = ca.framework_id
            WHERE ca.assessment_date >= v_start_date OR ca.assessment_date IS NULL
            GROUP BY cf.id, cf.framework_name
        ),
        'risk_metrics', (
            SELECT jsonb_build_object(
                'total_incidents', COUNT(*),
                'critical_incidents', COUNT(CASE WHEN severity = 'critical' THEN 1 END),
                'high_incidents', COUNT(CASE WHEN severity = 'high' THEN 1 END),
                'medium_incidents', COUNT(CASE WHEN severity = 'medium' THEN 1 END),
                'low_incidents', COUNT(CASE WHEN severity = 'low' THEN 1 END),
                'open_incidents', COUNT(CASE WHEN status = 'open' THEN 1 END),
                'resolved_incidents', COUNT(CASE WHEN status = 'resolved' THEN 1 END)
            )
            FROM security_incidents
            WHERE detection_timestamp >= v_start_date
        )
    ) INTO v_analytics;
    
    RETURN v_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update security analytics
CREATE OR REPLACE FUNCTION update_security_analytics(
    p_analysis_date DATE DEFAULT CURRENT_DATE,
    p_analysis_period_months INTEGER DEFAULT 12
)
RETURNS VOID AS $$
DECLARE
    v_analytics JSONB;
BEGIN
    SELECT generate_security_analytics(p_analysis_date, p_analysis_period_months) INTO v_analytics;
    
    INSERT INTO security_analytics (
        analysis_date,
        analysis_period_months,
        total_login_attempts,
        successful_logins,
        failed_logins,
        mfa_usage_rate,
        security_incidents,
        critical_incidents,
        resolved_incidents,
        average_resolution_time_hours,
        compliance_score,
        policy_violations,
        training_completion_rate,
        risk_score,
        security_metrics,
        compliance_metrics,
        risk_metrics
    ) VALUES (
        p_analysis_date,
        p_analysis_period_months,
        (v_analytics->>'total_login_attempts')::INTEGER,
        (v_analytics->>'successful_logins')::INTEGER,
        (v_analytics->>'failed_logins')::INTEGER,
        (v_analytics->>'mfa_usage_rate')::DECIMAL(5,2),
        (v_analytics->>'security_incidents')::INTEGER,
        (v_analytics->>'critical_incidents')::INTEGER,
        (v_analytics->>'resolved_incidents')::INTEGER,
        (v_analytics->>'average_resolution_time_hours')::DECIMAL(8,2),
        (v_analytics->>'compliance_score')::DECIMAL(5,2),
        (v_analytics->>'policy_violations')::INTEGER,
        (v_analytics->>'training_completion_rate')::DECIMAL(5,2),
        (v_analytics->>'risk_score')::DECIMAL(5,2),
        v_analytics->'security_metrics',
        v_analytics->'compliance_metrics',
        v_analytics->'risk_metrics'
    )
    ON CONFLICT (analysis_date) 
    DO UPDATE SET
        analysis_period_months = EXCLUDED.analysis_period_months,
        total_login_attempts = EXCLUDED.total_login_attempts,
        successful_logins = EXCLUDED.successful_logins,
        failed_logins = EXCLUDED.failed_logins,
        mfa_usage_rate = EXCLUDED.mfa_usage_rate,
        security_incidents = EXCLUDED.security_incidents,
        critical_incidents = EXCLUDED.critical_incidents,
        resolved_incidents = EXCLUDED.resolved_incidents,
        average_resolution_time_hours = EXCLUDED.average_resolution_time_hours,
        compliance_score = EXCLUDED.compliance_score,
        policy_violations = EXCLUDED.policy_violations,
        training_completion_rate = EXCLUDED.training_completion_rate,
        risk_score = EXCLUDED.risk_score,
        security_metrics = EXCLUDED.security_metrics,
        compliance_metrics = EXCLUDED.compliance_metrics,
        risk_metrics = EXCLUDED.risk_metrics,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics when new incident is added
CREATE OR REPLACE FUNCTION trigger_update_security_analytics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_security_analytics();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER security_analytics_trigger
    AFTER INSERT OR UPDATE ON security_incidents
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_security_analytics();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_security_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER security_roles_updated_at
    BEFORE UPDATE ON security_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_security_updated_at();

CREATE TRIGGER user_security_profiles_updated_at
    BEFORE UPDATE ON user_security_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_security_updated_at();

CREATE TRIGGER mfa_devices_updated_at
    BEFORE UPDATE ON mfa_devices
    FOR EACH ROW
    EXECUTE FUNCTION update_security_updated_at();

CREATE TRIGGER security_incidents_updated_at
    BEFORE UPDATE ON security_incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_security_updated_at();

CREATE TRIGGER encryption_keys_updated_at
    BEFORE UPDATE ON encryption_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_security_updated_at();

CREATE TRIGGER data_classification_updated_at
    BEFORE UPDATE ON data_classification
    FOR EACH ROW
    EXECUTE FUNCTION update_security_updated_at();

CREATE TRIGGER compliance_frameworks_updated_at
    BEFORE UPDATE ON compliance_frameworks
    FOR EACH ROW
    EXECUTE FUNCTION update_security_updated_at();

CREATE TRIGGER compliance_assessments_updated_at
    BEFORE UPDATE ON compliance_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_security_updated_at();

CREATE TRIGGER security_policies_updated_at
    BEFORE UPDATE ON security_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_security_updated_at();

CREATE TRIGGER security_training_records_updated_at
    BEFORE UPDATE ON security_training_records
    FOR EACH ROW
    EXECUTE FUNCTION update_security_updated_at();

CREATE TRIGGER security_analytics_updated_at
    BEFORE UPDATE ON security_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_security_updated_at();


