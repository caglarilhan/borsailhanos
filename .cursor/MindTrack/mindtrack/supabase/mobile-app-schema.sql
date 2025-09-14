-- Mobile App Development Schema
-- This schema stores mobile app data, device information, and sync status

-- Mobile Devices Table
CREATE TABLE IF NOT EXISTS mobile_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    app_version VARCHAR(50) NOT NULL,
    build_number VARCHAR(50) NOT NULL,
    device_model VARCHAR(255),
    os_version VARCHAR(50),
    screen_size VARCHAR(50),
    storage_total BIGINT,
    storage_available BIGINT,
    push_token VARCHAR(500),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mobile App Configuration
CREATE TABLE IF NOT EXISTS mobile_app_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    offline_mode BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    biometric_auth BOOLEAN DEFAULT FALSE,
    auto_sync BOOLEAN DEFAULT TRUE,
    sync_frequency INTEGER DEFAULT 300, -- seconds
    notification_types JSONB DEFAULT '["appointment", "medication", "message", "reminder"]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, device_id)
);

-- Offline Data Storage
CREATE TABLE IF NOT EXISTS offline_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('patients', 'appointments', 'notes', 'medications')),
    data_key VARCHAR(255) NOT NULL,
    data_value JSONB NOT NULL,
    data_size INTEGER,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_status VARCHAR(50) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'conflict', 'error')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, device_id, data_type, data_key)
);

-- Data Synchronization Log
CREATE TABLE IF NOT EXISTS sync_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    sync_type VARCHAR(50) NOT NULL CHECK (sync_type IN ('manual', 'automatic', 'background')),
    sync_status VARCHAR(50) NOT NULL CHECK (sync_status IN ('started', 'success', 'failed', 'partial')),
    records_synced INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    sync_duration_ms INTEGER,
    error_message TEXT,
    sync_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push Notifications
CREATE TABLE IF NOT EXISTS push_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('appointment', 'medication', 'message', 'reminder', 'system')),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'clicked', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mobile App Analytics
CREATE TABLE IF NOT EXISTS mobile_app_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    session_id VARCHAR(255),
    app_version VARCHAR(50),
    platform VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mobile App Performance Metrics
CREATE TABLE IF NOT EXISTS mobile_performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('load_time', 'memory_usage', 'cpu_usage', 'battery_usage', 'network_latency')),
    metric_value DECIMAL(10,4) NOT NULL,
    metric_unit VARCHAR(20),
    app_version VARCHAR(50),
    platform VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mobile_devices_user_id ON mobile_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_devices_device_id ON mobile_devices(device_id);
CREATE INDEX IF NOT EXISTS idx_mobile_devices_platform ON mobile_devices(platform);
CREATE INDEX IF NOT EXISTS idx_mobile_devices_last_seen ON mobile_devices(last_seen);

CREATE INDEX IF NOT EXISTS idx_mobile_app_config_user_device ON mobile_app_config(user_id, device_id);

CREATE INDEX IF NOT EXISTS idx_offline_data_user_device ON offline_data(user_id, device_id);
CREATE INDEX IF NOT EXISTS idx_offline_data_type ON offline_data(data_type);
CREATE INDEX IF NOT EXISTS idx_offline_data_sync_status ON offline_data(sync_status);

CREATE INDEX IF NOT EXISTS idx_sync_logs_user_device ON sync_logs(user_id, device_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON sync_logs(sync_status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON sync_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_push_notifications_user_device ON push_notifications(user_id, device_id);
CREATE INDEX IF NOT EXISTS idx_push_notifications_status ON push_notifications(status);
CREATE INDEX IF NOT EXISTS idx_push_notifications_scheduled ON push_notifications(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_mobile_analytics_user_device ON mobile_app_analytics(user_id, device_id);
CREATE INDEX IF NOT EXISTS idx_mobile_analytics_event_type ON mobile_app_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_mobile_analytics_timestamp ON mobile_app_analytics(timestamp);

CREATE INDEX IF NOT EXISTS idx_mobile_performance_device ON mobile_performance_metrics(device_id);
CREATE INDEX IF NOT EXISTS idx_mobile_performance_type ON mobile_performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_mobile_performance_timestamp ON mobile_performance_metrics(timestamp);

-- Row Level Security (RLS) Policies
ALTER TABLE mobile_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_app_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for mobile_devices
CREATE POLICY "Users can view their own devices" ON mobile_devices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices" ON mobile_devices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices" ON mobile_devices
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own devices" ON mobile_devices
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for mobile_app_config
CREATE POLICY "Users can view their own config" ON mobile_app_config
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own config" ON mobile_app_config
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own config" ON mobile_app_config
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for offline_data
CREATE POLICY "Users can view their own offline data" ON offline_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own offline data" ON offline_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own offline data" ON offline_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own offline data" ON offline_data
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for sync_logs
CREATE POLICY "Users can view their own sync logs" ON sync_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync logs" ON sync_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for push_notifications
CREATE POLICY "Users can view their own notifications" ON push_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" ON push_notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON push_notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for mobile_app_analytics
CREATE POLICY "Users can view their own analytics" ON mobile_app_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" ON mobile_app_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for mobile_performance_metrics
CREATE POLICY "Users can view their own performance metrics" ON mobile_performance_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own performance metrics" ON mobile_performance_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_mobile_devices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_mobile_app_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_offline_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
CREATE TRIGGER trigger_update_mobile_devices_updated_at
    BEFORE UPDATE ON mobile_devices
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_devices_updated_at();

CREATE TRIGGER trigger_update_mobile_app_config_updated_at
    BEFORE UPDATE ON mobile_app_config
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_app_config_updated_at();

CREATE TRIGGER trigger_update_offline_data_updated_at
    BEFORE UPDATE ON offline_data
    FOR EACH ROW
    EXECUTE FUNCTION update_offline_data_updated_at();

-- Comments for documentation
COMMENT ON TABLE mobile_devices IS 'Stores information about mobile devices registered to users';
COMMENT ON TABLE mobile_app_config IS 'Stores mobile app configuration settings for each user-device pair';
COMMENT ON TABLE offline_data IS 'Stores offline data for mobile devices when not connected to internet';
COMMENT ON TABLE sync_logs IS 'Logs data synchronization events between mobile devices and server';
COMMENT ON TABLE push_notifications IS 'Stores push notifications sent to mobile devices';
COMMENT ON TABLE mobile_app_analytics IS 'Stores analytics events from mobile app usage';
COMMENT ON TABLE mobile_performance_metrics IS 'Stores performance metrics collected from mobile devices';

