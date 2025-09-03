-- Medication Tracking and Reminders Schema for American Psychiatry
-- Comprehensive system for medication adherence, refill tracking, and patient reminders

-- Medication adherence tracking
CREATE TABLE IF NOT EXISTS medication_adherence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL,
    prescribed_dose_mg DECIMAL(8,2),
    prescribed_frequency VARCHAR(50),
    total_doses_prescribed INTEGER,
    doses_taken INTEGER DEFAULT 0,
    doses_missed INTEGER DEFAULT 0,
    adherence_rate DECIMAL(5,2),
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'discontinued'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication refill tracking
CREATE TABLE IF NOT EXISTS medication_refills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL,
    prescription_id UUID,
    refill_number INTEGER DEFAULT 1,
    original_quantity INTEGER,
    remaining_quantity INTEGER,
    refill_date DATE,
    next_refill_date DATE,
    refill_reminder_date DATE,
    pharmacy_name VARCHAR(100),
    pharmacy_phone VARCHAR(20),
    refill_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'requested', 'filled', 'picked_up'
    refill_request_date TIMESTAMP WITH TIME ZONE,
    refill_filled_date TIMESTAMP WITH TIME ZONE,
    refill_picked_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication reminders and notifications
CREATE TABLE IF NOT EXISTS medication_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL,
    reminder_type VARCHAR(50), -- 'dose_reminder', 'refill_reminder', 'appointment_reminder', 'lab_reminder'
    reminder_message TEXT,
    reminder_time TIME,
    reminder_frequency VARCHAR(50), -- 'daily', 'twice_daily', 'weekly', 'monthly'
    reminder_days TEXT[], -- ['monday', 'tuesday', etc.]
    reminder_method VARCHAR(50) DEFAULT 'sms', -- 'sms', 'email', 'push_notification', 'phone_call'
    reminder_status VARCHAR(20) DEFAULT 'active', -- 'active', 'sent', 'acknowledged', 'cancelled'
    last_sent_at TIMESTAMP WITH TIME ZONE,
    next_send_at TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication dose tracking (daily logs)
CREATE TABLE IF NOT EXISTS medication_dose_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL,
    dose_date DATE,
    dose_time TIME,
    dose_taken BOOLEAN DEFAULT FALSE,
    dose_skipped BOOLEAN DEFAULT FALSE,
    dose_delayed BOOLEAN DEFAULT FALSE,
    actual_dose_mg DECIMAL(8,2),
    notes TEXT,
    logged_by UUID,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication side effect tracking
CREATE TABLE IF NOT EXISTS medication_side_effects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL,
    side_effect_name VARCHAR(100),
    severity VARCHAR(20), -- 'mild', 'moderate', 'severe'
    onset_date DATE,
    duration_days INTEGER,
    resolved_date DATE,
    action_taken VARCHAR(100), -- 'dose_reduced', 'medication_stopped', 'medication_changed', 'none'
    reported_to_fda BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication effectiveness tracking
CREATE TABLE IF NOT EXISTS medication_effectiveness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL,
    assessment_date DATE,
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 10),
    symptom_improvement VARCHAR(50), -- 'significant', 'moderate', 'minimal', 'none', 'worse'
    side_effects_rating INTEGER CHECK (side_effects_rating >= 1 AND side_effects_rating <= 10),
    overall_satisfaction INTEGER CHECK (overall_satisfaction >= 1 AND overall_satisfaction <= 10),
    continue_medication BOOLEAN,
    assessment_notes TEXT,
    assessed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication compliance reports
CREATE TABLE IF NOT EXISTS medication_compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    report_period_start DATE,
    report_period_end DATE,
    total_medications INTEGER,
    medications_with_adherence_above_80 INTEGER,
    average_adherence_rate DECIMAL(5,2),
    missed_doses_total INTEGER,
    refills_needed INTEGER,
    refills_completed INTEGER,
    side_effects_reported INTEGER,
    effectiveness_assessments INTEGER,
    report_generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS/Email notification logs
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    reminder_id UUID REFERENCES medication_reminders(id),
    notification_type VARCHAR(50), -- 'sms', 'email', 'push_notification', 'phone_call'
    notification_content TEXT,
    recipient VARCHAR(100), -- phone number or email
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_status VARCHAR(20), -- 'sent', 'delivered', 'failed', 'bounced'
    delivery_confirmation TEXT,
    response_received BOOLEAN DEFAULT FALSE,
    response_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient communication preferences
CREATE TABLE IF NOT EXISTS patient_communication_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    preferred_contact_method VARCHAR(50) DEFAULT 'sms', -- 'sms', 'email', 'phone_call', 'push_notification'
    phone_number VARCHAR(20),
    email_address VARCHAR(100),
    preferred_reminder_time TIME DEFAULT '09:00:00',
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    language_preference VARCHAR(10) DEFAULT 'en',
    reminder_frequency VARCHAR(50) DEFAULT 'daily',
    opt_out_reminders BOOLEAN DEFAULT FALSE,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_medication_adherence_client ON medication_adherence(client_id);
CREATE INDEX IF NOT EXISTS idx_medication_adherence_medication ON medication_adherence(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_adherence_status ON medication_adherence(status);
CREATE INDEX IF NOT EXISTS idx_medication_refills_client ON medication_refills(client_id);
CREATE INDEX IF NOT EXISTS idx_medication_refills_medication ON medication_refills(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_refills_next_date ON medication_refills(next_refill_date);
CREATE INDEX IF NOT EXISTS idx_medication_reminders_client ON medication_reminders(client_id);
CREATE INDEX IF NOT EXISTS idx_medication_reminders_next_send ON medication_reminders(next_send_at);
CREATE INDEX IF NOT EXISTS idx_medication_reminders_status ON medication_reminders(reminder_status);
CREATE INDEX IF NOT EXISTS idx_medication_dose_logs_client ON medication_dose_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_medication_dose_logs_date ON medication_dose_logs(dose_date);
CREATE INDEX IF NOT EXISTS idx_medication_side_effects_client ON medication_side_effects(client_id);
CREATE INDEX IF NOT EXISTS idx_medication_side_effects_medication ON medication_side_effects(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_effectiveness_client ON medication_effectiveness(client_id);
CREATE INDEX IF NOT EXISTS idx_medication_effectiveness_date ON medication_effectiveness(assessment_date);
CREATE INDEX IF NOT EXISTS idx_medication_compliance_reports_client ON medication_compliance_reports(client_id);
CREATE INDEX IF NOT EXISTS idx_medication_compliance_reports_period ON medication_compliance_reports(report_period_start, report_period_end);
CREATE INDEX IF NOT EXISTS idx_notification_logs_client ON notification_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_patient_communication_preferences_client ON patient_communication_preferences(client_id);

-- Row Level Security Policies
ALTER TABLE medication_adherence ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_refills ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_side_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_effectiveness ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_communication_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medication_adherence
CREATE POLICY "Enable read access for clinic members" ON medication_adherence
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = medication_adherence.client_id
            )
        )
    );

CREATE POLICY "Enable insert for clinic members" ON medication_adherence
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = medication_adherence.client_id
            )
        )
    );

CREATE POLICY "Enable update for clinic members" ON medication_adherence
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = medication_adherence.client_id
            )
        )
    );

-- RLS Policies for medication_refills
CREATE POLICY "Enable read access for clinic members" ON medication_refills
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = medication_refills.client_id
            )
        )
    );

CREATE POLICY "Enable insert for clinic members" ON medication_refills
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = medication_refills.client_id
            )
        )
    );

CREATE POLICY "Enable update for clinic members" ON medication_refills
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = medication_refills.client_id
            )
        )
    );

-- RLS Policies for medication_reminders
CREATE POLICY "Enable read access for clinic members" ON medication_reminders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = medication_reminders.client_id
            )
        )
    );

CREATE POLICY "Enable insert for clinic members" ON medication_reminders
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = medication_reminders.client_id
            )
        )
    );

CREATE POLICY "Enable update for clinic members" ON medication_reminders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = medication_reminders.client_id
            )
        )
    );

-- RLS Policies for medication_dose_logs
CREATE POLICY "Enable read access for clinic members" ON medication_dose_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = medication_dose_logs.client_id
            )
        )
    );

CREATE POLICY "Enable insert for clinic members" ON medication_dose_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = medication_dose_logs.client_id
            )
        )
    );

-- RLS Policies for medication_side_effects
CREATE POLICY "Enable read access for clinic members" ON medication_side_effects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = medication_side_effects.client_id
            )
        )
    );

CREATE POLICY "Enable insert for clinic members" ON medication_side_effects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = medication_side_effects.client_id
            )
        )
    );

-- RLS Policies for medication_effectiveness
CREATE POLICY "Enable read access for clinic members" ON medication_effectiveness
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = medication_effectiveness.client_id
            )
        )
    );

CREATE POLICY "Enable insert for clinic members" ON medication_effectiveness
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = medication_effectiveness.client_id
            )
        )
    );

-- RLS Policies for medication_compliance_reports
CREATE POLICY "Enable read access for clinic members" ON medication_compliance_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = medication_compliance_reports.client_id
            )
        )
    );

CREATE POLICY "Enable insert for clinic members" ON medication_compliance_reports
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = medication_compliance_reports.client_id
            )
        )
    );

-- RLS Policies for notification_logs
CREATE POLICY "Enable read access for clinic members" ON notification_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = notification_logs.client_id
            )
        )
    );

CREATE POLICY "Enable insert for clinic members" ON notification_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = notification_logs.client_id
            )
        )
    );

-- RLS Policies for patient_communication_preferences
CREATE POLICY "Enable read access for clinic members" ON patient_communication_preferences
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = patient_communication_preferences.client_id
            )
        )
    );

CREATE POLICY "Enable insert for clinic members" ON patient_communication_preferences
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = patient_communication_preferences.client_id
            )
        )
    );

CREATE POLICY "Enable update for clinic members" ON patient_communication_preferences
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = patient_communication_preferences.client_id
            )
        )
    );

-- PostgreSQL Functions for Medication Tracking

-- Function to calculate medication adherence rate
CREATE OR REPLACE FUNCTION calculate_adherence_rate(
    patient_id UUID,
    medication_id UUID,
    start_date DATE,
    end_date DATE
)
RETURNS DECIMAL AS $$
DECLARE
    total_doses INTEGER;
    taken_doses INTEGER;
    adherence_rate DECIMAL;
BEGIN
    -- Get total prescribed doses
    SELECT COALESCE(SUM(total_doses_prescribed), 0)
    INTO total_doses
    FROM medication_adherence
    WHERE client_id = patient_id 
    AND medication_id = $2
    AND start_date BETWEEN $3 AND $4;
    
    -- Get taken doses
    SELECT COALESCE(SUM(doses_taken), 0)
    INTO taken_doses
    FROM medication_adherence
    WHERE client_id = patient_id 
    AND medication_id = $2
    AND start_date BETWEEN $3 AND $4;
    
    -- Calculate adherence rate
    IF total_doses > 0 THEN
        adherence_rate := (taken_doses::DECIMAL / total_doses::DECIMAL) * 100;
    ELSE
        adherence_rate := 0;
    END IF;
    
    RETURN adherence_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get upcoming refills
CREATE OR REPLACE FUNCTION get_upcoming_refills(
    patient_id UUID,
    days_ahead INTEGER DEFAULT 30
)
RETURNS TABLE(
    medication_name VARCHAR(100),
    refill_date DATE,
    remaining_quantity INTEGER,
    pharmacy_name VARCHAR(100),
    pharmacy_phone VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.name as medication_name,
        mr.refill_date,
        mr.remaining_quantity,
        mr.pharmacy_name,
        mr.pharmacy_phone
    FROM medication_refills mr
    JOIN medications m ON mr.medication_id = m.id
    WHERE mr.client_id = patient_id
    AND mr.refill_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 day' * days_ahead
    AND mr.refill_status = 'pending'
    ORDER BY mr.refill_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get missed doses
CREATE OR REPLACE FUNCTION get_missed_doses(
    patient_id UUID,
    days_back INTEGER DEFAULT 7
)
RETURNS TABLE(
    medication_name VARCHAR(100),
    dose_date DATE,
    dose_time TIME,
    days_missed INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.name as medication_name,
        mdl.dose_date,
        mdl.dose_time,
        CURRENT_DATE - mdl.dose_date as days_missed
    FROM medication_dose_logs mdl
    JOIN medications m ON mdl.medication_id = m.id
    WHERE mdl.client_id = patient_id
    AND mdl.dose_skipped = TRUE
    AND mdl.dose_date >= CURRENT_DATE - INTERVAL '1 day' * days_back
    ORDER BY mdl.dose_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create medication reminder
CREATE OR REPLACE FUNCTION create_medication_reminder(
    patient_id UUID,
    medication_id UUID,
    reminder_type VARCHAR(50),
    reminder_message TEXT,
    reminder_time TIME,
    reminder_frequency VARCHAR(50),
    reminder_method VARCHAR(50)
)
RETURNS UUID AS $$
DECLARE
    reminder_id UUID;
BEGIN
    INSERT INTO medication_reminders (
        client_id, medication_id, reminder_type, reminder_message,
        reminder_time, reminder_frequency, reminder_method, next_send_at
    ) VALUES (
        patient_id, medication_id, reminder_type, reminder_message,
        reminder_time, reminder_frequency, reminder_method,
        CURRENT_DATE + reminder_time::INTERVAL
    ) RETURNING id INTO reminder_id;
    
    RETURN reminder_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log medication dose
CREATE OR REPLACE FUNCTION log_medication_dose(
    patient_id UUID,
    medication_id UUID,
    dose_date DATE,
    dose_time TIME,
    dose_taken BOOLEAN,
    actual_dose_mg DECIMAL(8,2),
    notes TEXT
)
RETURNS UUID AS $$
DECLARE
    dose_log_id UUID;
BEGIN
    INSERT INTO medication_dose_logs (
        client_id, medication_id, dose_date, dose_time,
        dose_taken, dose_skipped, actual_dose_mg, notes, logged_by
    ) VALUES (
        patient_id, medication_id, dose_date, dose_time,
        dose_taken, NOT dose_taken, actual_dose_mg, notes, auth.uid()
    ) RETURNING id INTO dose_log_id;
    
    -- Update adherence tracking
    UPDATE medication_adherence
    SET 
        doses_taken = doses_taken + CASE WHEN dose_taken THEN 1 ELSE 0 END,
        doses_missed = doses_missed + CASE WHEN NOT dose_taken THEN 1 ELSE 0 END,
        adherence_rate = calculate_adherence_rate(patient_id, medication_id, start_date, end_date)
    WHERE client_id = patient_id AND medication_id = $2;
    
    RETURN dose_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate compliance report
CREATE OR REPLACE FUNCTION generate_compliance_report(
    patient_id UUID,
    report_start_date DATE,
    report_end_date DATE
)
RETURNS UUID AS $$
DECLARE
    report_id UUID;
    total_meds INTEGER;
    adherent_meds INTEGER;
    avg_adherence DECIMAL;
    total_missed INTEGER;
    refills_needed INTEGER;
    refills_completed INTEGER;
    side_effects_count INTEGER;
    effectiveness_count INTEGER;
BEGIN
    -- Calculate report metrics
    SELECT COUNT(DISTINCT medication_id) INTO total_meds
    FROM medication_adherence
    WHERE client_id = patient_id
    AND start_date BETWEEN report_start_date AND report_end_date;
    
    SELECT COUNT(*) INTO adherent_meds
    FROM medication_adherence
    WHERE client_id = patient_id
    AND start_date BETWEEN report_start_date AND report_end_date
    AND adherence_rate >= 80;
    
    SELECT AVG(adherence_rate) INTO avg_adherence
    FROM medication_adherence
    WHERE client_id = patient_id
    AND start_date BETWEEN report_start_date AND report_end_date;
    
    SELECT COALESCE(SUM(doses_missed), 0) INTO total_missed
    FROM medication_adherence
    WHERE client_id = patient_id
    AND start_date BETWEEN report_start_date AND report_end_date;
    
    SELECT COUNT(*) INTO refills_needed
    FROM medication_refills
    WHERE client_id = patient_id
    AND refill_date BETWEEN report_start_date AND report_end_date;
    
    SELECT COUNT(*) INTO refills_completed
    FROM medication_refills
    WHERE client_id = patient_id
    AND refill_date BETWEEN report_start_date AND report_end_date
    AND refill_status = 'filled';
    
    SELECT COUNT(*) INTO side_effects_count
    FROM medication_side_effects
    WHERE client_id = patient_id
    AND onset_date BETWEEN report_start_date AND report_end_date;
    
    SELECT COUNT(*) INTO effectiveness_count
    FROM medication_effectiveness
    WHERE client_id = patient_id
    AND assessment_date BETWEEN report_start_date AND report_end_date;
    
    -- Insert report
    INSERT INTO medication_compliance_reports (
        client_id, report_period_start, report_period_end,
        total_medications, medications_with_adherence_above_80,
        average_adherence_rate, missed_doses_total,
        refills_needed, refills_completed,
        side_effects_reported, effectiveness_assessments,
        generated_by
    ) VALUES (
        patient_id, report_start_date, report_end_date,
        total_meds, adherent_meds, avg_adherence, total_missed,
        refills_needed, refills_completed,
        side_effects_count, effectiveness_count,
        auth.uid()
    ) RETURNING id INTO report_id;
    
    RETURN report_id;
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

CREATE TRIGGER update_medication_adherence_updated_at BEFORE UPDATE ON medication_adherence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_refills_updated_at BEFORE UPDATE ON medication_refills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_reminders_updated_at BEFORE UPDATE ON medication_reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_side_effects_updated_at BEFORE UPDATE ON medication_side_effects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_effectiveness_updated_at BEFORE UPDATE ON medication_effectiveness
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_communication_preferences_updated_at BEFORE UPDATE ON patient_communication_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
