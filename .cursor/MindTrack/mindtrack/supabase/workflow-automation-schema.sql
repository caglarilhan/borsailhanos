-- Workflow Automation Schema
-- Appointment reminders, payment follow-ups, intake automation

-- Workflow Rules Table
CREATE TABLE IF NOT EXISTS workflow_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('appointment_reminder', 'payment_followup', 'intake_automation', 'custom')),
    trigger_conditions JSONB DEFAULT '{}',
    actions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    execution_count INTEGER DEFAULT 0,
    last_executed TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Executions Table
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES workflow_rules(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    trigger_data JSONB DEFAULT '{}',
    execution_log JSONB DEFAULT '[]',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    error_message TEXT DEFAULT NULL
);

-- Workflow Templates Table
CREATE TABLE IF NOT EXISTS workflow_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('appointment_reminder', 'payment_followup', 'intake_automation', 'custom')),
    trigger_conditions JSONB DEFAULT '{}',
    actions JSONB DEFAULT '[]',
    category VARCHAR(100) DEFAULT 'General',
    tags TEXT[] DEFAULT '{}',
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Triggers Table (for scheduled triggers)
CREATE TABLE IF NOT EXISTS workflow_triggers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES workflow_rules(id) ON DELETE CASCADE,
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('scheduled', 'event', 'condition')),
    trigger_config JSONB DEFAULT '{}',
    next_execution TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Action Logs Table (detailed action execution logs)
CREATE TABLE IF NOT EXISTS workflow_action_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
    action_id VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    message TEXT DEFAULT '',
    error_message TEXT DEFAULT NULL,
    execution_time_ms INTEGER DEFAULT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Workflow Variables Table (for storing workflow state)
CREATE TABLE IF NOT EXISTS workflow_variables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES workflow_rules(id) ON DELETE CASCADE,
    execution_id UUID REFERENCES workflow_executions(id) ON DELETE CASCADE,
    variable_name VARCHAR(255) NOT NULL,
    variable_value JSONB DEFAULT '{}',
    variable_type VARCHAR(50) DEFAULT 'string',
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Notifications Table (for user notifications about workflow status)
CREATE TABLE IF NOT EXISTS workflow_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES workflow_rules(id) ON DELETE CASCADE,
    execution_id UUID REFERENCES workflow_executions(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('success', 'error', 'warning', 'info')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Statistics Table (for tracking workflow performance)
CREATE TABLE IF NOT EXISTS workflow_statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES workflow_rules(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    execution_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    average_execution_time_ms INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, workflow_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflow_rules_user_id ON workflow_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_rules_trigger_type ON workflow_rules(trigger_type);
CREATE INDEX IF NOT EXISTS idx_workflow_rules_active ON workflow_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_workflow_rules_last_executed ON workflow_rules(last_executed);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_user_id ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at);

CREATE INDEX IF NOT EXISTS idx_workflow_templates_trigger_type ON workflow_templates(trigger_type);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_system ON workflow_templates(is_system);

CREATE INDEX IF NOT EXISTS idx_workflow_triggers_user_id ON workflow_triggers(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_workflow_id ON workflow_triggers(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_next_execution ON workflow_triggers(next_execution);
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_active ON workflow_triggers(is_active);

CREATE INDEX IF NOT EXISTS idx_workflow_action_logs_execution_id ON workflow_action_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_action_logs_action_id ON workflow_action_logs(action_id);
CREATE INDEX IF NOT EXISTS idx_workflow_action_logs_status ON workflow_action_logs(status);
CREATE INDEX IF NOT EXISTS idx_workflow_action_logs_started_at ON workflow_action_logs(started_at);

CREATE INDEX IF NOT EXISTS idx_workflow_variables_user_id ON workflow_variables(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_variables_workflow_id ON workflow_variables(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_variables_execution_id ON workflow_variables(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_variables_name ON workflow_variables(variable_name);
CREATE INDEX IF NOT EXISTS idx_workflow_variables_expires_at ON workflow_variables(expires_at);

CREATE INDEX IF NOT EXISTS idx_workflow_notifications_user_id ON workflow_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_notifications_workflow_id ON workflow_notifications(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_notifications_execution_id ON workflow_notifications(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_notifications_read ON workflow_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_workflow_notifications_created_at ON workflow_notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_workflow_statistics_user_id ON workflow_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_statistics_workflow_id ON workflow_statistics(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_statistics_date ON workflow_statistics(date);

-- Row Level Security (RLS) Policies
ALTER TABLE workflow_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_statistics ENABLE ROW LEVEL SECURITY;

-- Workflow Rules RLS Policies
CREATE POLICY "Users can view their own workflow rules" ON workflow_rules
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflow rules" ON workflow_rules
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow rules" ON workflow_rules
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow rules" ON workflow_rules
    FOR DELETE USING (auth.uid() = user_id);

-- Workflow Executions RLS Policies
CREATE POLICY "Users can view their own workflow executions" ON workflow_executions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflow executions" ON workflow_executions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow executions" ON workflow_executions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow executions" ON workflow_executions
    FOR DELETE USING (auth.uid() = user_id);

-- Workflow Templates RLS Policies (system templates are visible to all)
CREATE POLICY "Users can view workflow templates" ON workflow_templates
    FOR SELECT USING (is_system = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own workflow templates" ON workflow_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow templates" ON workflow_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow templates" ON workflow_templates
    FOR DELETE USING (auth.uid() = user_id);

-- Workflow Triggers RLS Policies
CREATE POLICY "Users can view their own workflow triggers" ON workflow_triggers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflow triggers" ON workflow_triggers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow triggers" ON workflow_triggers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow triggers" ON workflow_triggers
    FOR DELETE USING (auth.uid() = user_id);

-- Workflow Action Logs RLS Policies
CREATE POLICY "Users can view their own workflow action logs" ON workflow_action_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workflow_executions 
            WHERE id = workflow_action_logs.execution_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own workflow action logs" ON workflow_action_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workflow_executions 
            WHERE id = workflow_action_logs.execution_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own workflow action logs" ON workflow_action_logs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workflow_executions 
            WHERE id = workflow_action_logs.execution_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own workflow action logs" ON workflow_action_logs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workflow_executions 
            WHERE id = workflow_action_logs.execution_id 
            AND user_id = auth.uid()
        )
    );

-- Workflow Variables RLS Policies
CREATE POLICY "Users can view their own workflow variables" ON workflow_variables
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflow variables" ON workflow_variables
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow variables" ON workflow_variables
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow variables" ON workflow_variables
    FOR DELETE USING (auth.uid() = user_id);

-- Workflow Notifications RLS Policies
CREATE POLICY "Users can view their own workflow notifications" ON workflow_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflow notifications" ON workflow_notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow notifications" ON workflow_notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow notifications" ON workflow_notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Workflow Statistics RLS Policies
CREATE POLICY "Users can view their own workflow statistics" ON workflow_statistics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflow statistics" ON workflow_statistics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow statistics" ON workflow_statistics
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow statistics" ON workflow_statistics
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
CREATE TRIGGER update_workflow_rules_updated_at BEFORE UPDATE ON workflow_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_templates_updated_at BEFORE UPDATE ON workflow_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_triggers_updated_at BEFORE UPDATE ON workflow_triggers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_variables_updated_at BEFORE UPDATE ON workflow_variables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_statistics_updated_at BEFORE UPDATE ON workflow_statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired workflow variables
CREATE OR REPLACE FUNCTION cleanup_expired_workflow_variables()
RETURNS void AS $$
BEGIN
    DELETE FROM workflow_variables 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
END;
$$ language 'plpgsql';

-- Function to update workflow statistics
CREATE OR REPLACE FUNCTION update_workflow_statistics(
    p_user_id UUID,
    p_workflow_id UUID,
    p_date DATE,
    p_execution_count INTEGER DEFAULT 0,
    p_success_count INTEGER DEFAULT 0,
    p_failure_count INTEGER DEFAULT 0,
    p_average_execution_time_ms INTEGER DEFAULT 0
)
RETURNS void AS $$
BEGIN
    INSERT INTO workflow_statistics (
        user_id, workflow_id, date, execution_count, 
        success_count, failure_count, average_execution_time_ms
    ) VALUES (
        p_user_id, p_workflow_id, p_date, p_execution_count,
        p_success_count, p_failure_count, p_average_execution_time_ms
    )
    ON CONFLICT (user_id, workflow_id, date) 
    DO UPDATE SET
        execution_count = workflow_statistics.execution_count + p_execution_count,
        success_count = workflow_statistics.success_count + p_success_count,
        failure_count = workflow_statistics.failure_count + p_failure_count,
        average_execution_time_ms = CASE 
            WHEN workflow_statistics.execution_count + p_execution_count > 0 
            THEN (workflow_statistics.average_execution_time_ms * workflow_statistics.execution_count + 
                  p_average_execution_time_ms * p_execution_count) / 
                 (workflow_statistics.execution_count + p_execution_count)
            ELSE workflow_statistics.average_execution_time_ms
        END,
        updated_at = NOW();
END;
$$ language 'plpgsql';
