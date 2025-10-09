-- Advanced Analytics Schema
-- Dashboard widgets, custom metrics, and cohort analysis

-- Dashboard Widgets Table
CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('chart', 'metric', 'table', 'cohort')),
    config JSONB DEFAULT '{}',
    position JSONB DEFAULT '{"x": 0, "y": 0, "width": 4, "height": 3}',
    refresh_interval INTEGER DEFAULT NULL,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom Metrics Table
CREATE TABLE IF NOT EXISTS custom_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    formula TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cohort Analyses Table
CREATE TABLE IF NOT EXISTS cohort_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    cohort_type VARCHAR(50) NOT NULL CHECK (cohort_type IN ('retention', 'revenue', 'engagement')),
    time_range VARCHAR(100) DEFAULT '30 days',
    metrics TEXT[] DEFAULT '{}',
    results JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Data Points Table (for storing calculated metrics)
CREATE TABLE IF NOT EXISTS analytics_data_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_id UUID REFERENCES custom_metrics(id) ON DELETE CASCADE,
    widget_id UUID REFERENCES dashboard_widgets(id) ON DELETE CASCADE,
    cohort_id UUID REFERENCES cohort_analyses(id) ON DELETE CASCADE,
    data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('metric', 'widget', 'cohort')),
    value DECIMAL(15,4) DEFAULT NULL,
    metadata JSONB DEFAULT '{}',
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Queries Table (for storing complex queries)
CREATE TABLE IF NOT EXISTS analytics_queries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    query_text TEXT NOT NULL,
    query_type VARCHAR(50) NOT NULL CHECK (query_type IN ('sql', 'aggregation', 'cohort')),
    parameters JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Dashboards Table (for organizing widgets)
CREATE TABLE IF NOT EXISTS analytics_dashboards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    layout JSONB DEFAULT '{}',
    is_default BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard Widget Assignments Table
CREATE TABLE IF NOT EXISTS dashboard_widget_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dashboard_id UUID NOT NULL REFERENCES analytics_dashboards(id) ON DELETE CASCADE,
    widget_id UUID NOT NULL REFERENCES dashboard_widgets(id) ON DELETE CASCADE,
    position JSONB DEFAULT '{"x": 0, "y": 0, "width": 4, "height": 3}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(dashboard_id, widget_id)
);

-- Analytics Alerts Table (for metric thresholds)
CREATE TABLE IF NOT EXISTS analytics_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_id UUID REFERENCES custom_metrics(id) ON DELETE CASCADE,
    widget_id UUID REFERENCES dashboard_widgets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    condition_type VARCHAR(50) NOT NULL CHECK (condition_type IN ('greater_than', 'less_than', 'equals', 'not_equals')),
    threshold_value DECIMAL(15,4) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_triggered TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Reports Table (for scheduled reports)
CREATE TABLE IF NOT EXISTS analytics_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('dashboard', 'metrics', 'cohort', 'custom')),
    config JSONB DEFAULT '{}',
    schedule_type VARCHAR(50) DEFAULT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'custom')),
    schedule_config JSONB DEFAULT '{}',
    recipients TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_generated TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user_id ON dashboard_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_type ON dashboard_widgets(type);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_visible ON dashboard_widgets(is_visible);

CREATE INDEX IF NOT EXISTS idx_custom_metrics_user_id ON custom_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_metrics_category ON custom_metrics(category);
CREATE INDEX IF NOT EXISTS idx_custom_metrics_active ON custom_metrics(is_active);

CREATE INDEX IF NOT EXISTS idx_cohort_analyses_user_id ON cohort_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_cohort_analyses_type ON cohort_analyses(cohort_type);

CREATE INDEX IF NOT EXISTS idx_analytics_data_points_user_id ON analytics_data_points(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_data_points_metric_id ON analytics_data_points(metric_id);
CREATE INDEX IF NOT EXISTS idx_analytics_data_points_widget_id ON analytics_data_points(widget_id);
CREATE INDEX IF NOT EXISTS idx_analytics_data_points_cohort_id ON analytics_data_points(cohort_id);
CREATE INDEX IF NOT EXISTS idx_analytics_data_points_calculated_at ON analytics_data_points(calculated_at);

CREATE INDEX IF NOT EXISTS idx_analytics_queries_user_id ON analytics_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_queries_type ON analytics_queries(query_type);
CREATE INDEX IF NOT EXISTS idx_analytics_queries_active ON analytics_queries(is_active);

CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_user_id ON analytics_dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_default ON analytics_dashboards(is_default);

CREATE INDEX IF NOT EXISTS idx_dashboard_widget_assignments_dashboard_id ON dashboard_widget_assignments(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widget_assignments_widget_id ON dashboard_widget_assignments(widget_id);

CREATE INDEX IF NOT EXISTS idx_analytics_alerts_user_id ON analytics_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_metric_id ON analytics_alerts(metric_id);
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_widget_id ON analytics_alerts(widget_id);
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_active ON analytics_alerts(is_active);

CREATE INDEX IF NOT EXISTS idx_analytics_reports_user_id ON analytics_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_type ON analytics_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_active ON analytics_reports(is_active);

-- Row Level Security (RLS) Policies
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widget_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;

-- Dashboard Widgets RLS Policies
CREATE POLICY "Users can view their own dashboard widgets" ON dashboard_widgets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dashboard widgets" ON dashboard_widgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard widgets" ON dashboard_widgets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboard widgets" ON dashboard_widgets
    FOR DELETE USING (auth.uid() = user_id);

-- Custom Metrics RLS Policies
CREATE POLICY "Users can view their own custom metrics" ON custom_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom metrics" ON custom_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom metrics" ON custom_metrics
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom metrics" ON custom_metrics
    FOR DELETE USING (auth.uid() = user_id);

-- Cohort Analyses RLS Policies
CREATE POLICY "Users can view their own cohort analyses" ON cohort_analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cohort analyses" ON cohort_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cohort analyses" ON cohort_analyses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cohort analyses" ON cohort_analyses
    FOR DELETE USING (auth.uid() = user_id);

-- Analytics Data Points RLS Policies
CREATE POLICY "Users can view their own analytics data points" ON analytics_data_points
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics data points" ON analytics_data_points
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics data points" ON analytics_data_points
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytics data points" ON analytics_data_points
    FOR DELETE USING (auth.uid() = user_id);

-- Analytics Queries RLS Policies
CREATE POLICY "Users can view their own analytics queries" ON analytics_queries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics queries" ON analytics_queries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics queries" ON analytics_queries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytics queries" ON analytics_queries
    FOR DELETE USING (auth.uid() = user_id);

-- Analytics Dashboards RLS Policies
CREATE POLICY "Users can view their own analytics dashboards" ON analytics_dashboards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics dashboards" ON analytics_dashboards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics dashboards" ON analytics_dashboards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytics dashboards" ON analytics_dashboards
    FOR DELETE USING (auth.uid() = user_id);

-- Dashboard Widget Assignments RLS Policies
CREATE POLICY "Users can view their own dashboard widget assignments" ON dashboard_widget_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM analytics_dashboards 
            WHERE id = dashboard_widget_assignments.dashboard_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own dashboard widget assignments" ON dashboard_widget_assignments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM analytics_dashboards 
            WHERE id = dashboard_widget_assignments.dashboard_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own dashboard widget assignments" ON dashboard_widget_assignments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM analytics_dashboards 
            WHERE id = dashboard_widget_assignments.dashboard_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own dashboard widget assignments" ON dashboard_widget_assignments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM analytics_dashboards 
            WHERE id = dashboard_widget_assignments.dashboard_id 
            AND user_id = auth.uid()
        )
    );

-- Analytics Alerts RLS Policies
CREATE POLICY "Users can view their own analytics alerts" ON analytics_alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics alerts" ON analytics_alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics alerts" ON analytics_alerts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytics alerts" ON analytics_alerts
    FOR DELETE USING (auth.uid() = user_id);

-- Analytics Reports RLS Policies
CREATE POLICY "Users can view their own analytics reports" ON analytics_reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics reports" ON analytics_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics reports" ON analytics_reports
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytics reports" ON analytics_reports
    FOR DELETE USING (auth.uid() = user_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_dashboard_widgets_updated_at BEFORE UPDATE ON dashboard_widgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_metrics_updated_at BEFORE UPDATE ON custom_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cohort_analyses_updated_at BEFORE UPDATE ON cohort_analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_queries_updated_at BEFORE UPDATE ON analytics_queries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_dashboards_updated_at BEFORE UPDATE ON analytics_dashboards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_alerts_updated_at BEFORE UPDATE ON analytics_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_reports_updated_at BEFORE UPDATE ON analytics_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
