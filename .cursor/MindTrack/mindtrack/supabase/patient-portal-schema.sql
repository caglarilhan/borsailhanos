-- Patient Portal Schema
-- Appointment scheduling, document uploads, payment processing

-- Patients Table (extended for portal)
CREATE TABLE IF NOT EXISTS patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    emergency_contact TEXT,
    insurance_info JSONB DEFAULT '{}',
    medical_history TEXT[] DEFAULT '{}',
    allergies TEXT[] DEFAULT '{}',
    medications TEXT[] DEFAULT '{}',
    portal_access_enabled BOOLEAN DEFAULT true,
    last_portal_login TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Documents Table
CREATE TABLE IF NOT EXISTS patient_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('insurance_card', 'id', 'medical_record', 'form', 'other')),
    file_url TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER DEFAULT 0,
    mime_type VARCHAR(100) DEFAULT '',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT DEFAULT '',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Patient Payments Table
CREATE TABLE IF NOT EXISTS patient_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    method VARCHAR(50) DEFAULT 'credit_card' CHECK (method IN ('credit_card', 'bank_transfer', 'cash', 'insurance')),
    transaction_id VARCHAR(255) DEFAULT NULL,
    payment_intent_id VARCHAR(255) DEFAULT NULL,
    stripe_session_id VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    refunded_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    refund_amount DECIMAL(10,2) DEFAULT NULL,
    refund_reason TEXT DEFAULT NULL
);

-- Patient Appointments Table (extended for portal)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER DEFAULT 60,
    type VARCHAR(50) DEFAULT 'consultation' CHECK (type IN ('consultation', 'followup', 'therapy', 'assessment')),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes TEXT DEFAULT '',
    location VARCHAR(20) DEFAULT 'in_person' CHECK (location IN ('in_person', 'telehealth')),
    meeting_link TEXT DEFAULT NULL,
    meeting_id VARCHAR(255) DEFAULT NULL,
    meeting_password VARCHAR(255) DEFAULT NULL,
    reminder_sent BOOLEAN DEFAULT false,
    reminder_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Portal Sessions Table
CREATE TABLE IF NOT EXISTS patient_portal_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Portal Activity Log Table
CREATE TABLE IF NOT EXISTS patient_portal_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('login', 'logout', 'appointment_scheduled', 'appointment_cancelled', 'document_uploaded', 'payment_made', 'profile_updated')),
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address INET DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Portal Preferences Table
CREATE TABLE IF NOT EXISTS patient_portal_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    appointment_reminders BOOLEAN DEFAULT true,
    payment_reminders BOOLEAN DEFAULT true,
    document_notifications BOOLEAN DEFAULT true,
    reminder_frequency INTEGER DEFAULT 24, -- hours before appointment
    preferred_contact_method VARCHAR(20) DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'sms', 'phone')),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(patient_id)
);

-- Patient Portal Messages Table
CREATE TABLE IF NOT EXISTS patient_portal_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_type VARCHAR(20) DEFAULT 'provider' CHECK (sender_type IN ('provider', 'patient', 'system')),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    message_type VARCHAR(50) DEFAULT 'general' CHECK (message_type IN ('general', 'appointment', 'payment', 'document', 'system')),
    related_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    related_payment_id UUID REFERENCES patient_payments(id) ON DELETE SET NULL,
    related_document_id UUID REFERENCES patient_documents(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Portal Notifications Table
CREATE TABLE IF NOT EXISTS patient_portal_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    action_url TEXT DEFAULT NULL,
    action_text VARCHAR(100) DEFAULT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Portal Forms Table
CREATE TABLE IF NOT EXISTS patient_portal_forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    form_template_id UUID REFERENCES form_templates(id) ON DELETE SET NULL,
    form_name VARCHAR(255) NOT NULL,
    form_data JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    review_notes TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_portal_access ON patients(portal_access_enabled);

CREATE INDEX IF NOT EXISTS idx_patient_documents_patient_id ON patient_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_documents_type ON patient_documents(type);
CREATE INDEX IF NOT EXISTS idx_patient_documents_status ON patient_documents(status);
CREATE INDEX IF NOT EXISTS idx_patient_documents_uploaded_at ON patient_documents(uploaded_at);

CREATE INDEX IF NOT EXISTS idx_patient_payments_patient_id ON patient_payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_payments_status ON patient_payments(status);
CREATE INDEX IF NOT EXISTS idx_patient_payments_method ON patient_payments(method);
CREATE INDEX IF NOT EXISTS idx_patient_payments_created_at ON patient_payments(created_at);
CREATE INDEX IF NOT EXISTS idx_patient_payments_due_date ON patient_payments(due_date);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_provider_id ON appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_type ON appointments(type);

CREATE INDEX IF NOT EXISTS idx_patient_portal_sessions_patient_id ON patient_portal_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_portal_sessions_token ON patient_portal_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_patient_portal_sessions_expires_at ON patient_portal_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_patient_portal_sessions_active ON patient_portal_sessions(is_active);

CREATE INDEX IF NOT EXISTS idx_patient_portal_activity_patient_id ON patient_portal_activity(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_portal_activity_type ON patient_portal_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_patient_portal_activity_created_at ON patient_portal_activity(created_at);

CREATE INDEX IF NOT EXISTS idx_patient_portal_preferences_patient_id ON patient_portal_preferences(patient_id);

CREATE INDEX IF NOT EXISTS idx_patient_portal_messages_patient_id ON patient_portal_messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_portal_messages_sender_id ON patient_portal_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_patient_portal_messages_read ON patient_portal_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_patient_portal_messages_type ON patient_portal_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_patient_portal_messages_created_at ON patient_portal_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_patient_portal_notifications_patient_id ON patient_portal_notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_portal_notifications_read ON patient_portal_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_patient_portal_notifications_type ON patient_portal_notifications(type);
CREATE INDEX IF NOT EXISTS idx_patient_portal_notifications_created_at ON patient_portal_notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_patient_portal_forms_patient_id ON patient_portal_forms(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_portal_forms_template_id ON patient_portal_forms(form_template_id);
CREATE INDEX IF NOT EXISTS idx_patient_portal_forms_status ON patient_portal_forms(status);
CREATE INDEX IF NOT EXISTS idx_patient_portal_forms_created_at ON patient_portal_forms(created_at);

-- Row Level Security (RLS) Policies
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_portal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_portal_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_portal_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_portal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_portal_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_portal_forms ENABLE ROW LEVEL SECURITY;

-- Patients RLS Policies
CREATE POLICY "Users can view their own patient record" ON patients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own patient record" ON patients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Providers can view patient records" ON patients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM providers 
            WHERE id = auth.uid() 
            AND is_active = true
        )
    );

-- Patient Documents RLS Policies
CREATE POLICY "Patients can view their own documents" ON patient_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = patient_documents.patient_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can upload their own documents" ON patient_documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = patient_documents.patient_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can delete their own documents" ON patient_documents
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = patient_documents.patient_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can view patient documents" ON patient_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM providers 
            WHERE id = auth.uid() 
            AND is_active = true
        )
    );

-- Patient Payments RLS Policies
CREATE POLICY "Patients can view their own payments" ON patient_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = patient_payments.patient_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can create their own payments" ON patient_payments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = patient_payments.patient_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can update their own payments" ON patient_payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = patient_payments.patient_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can view patient payments" ON patient_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM providers 
            WHERE id = auth.uid() 
            AND is_active = true
        )
    );

-- Appointments RLS Policies
CREATE POLICY "Patients can view their own appointments" ON appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = appointments.patient_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can create their own appointments" ON appointments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = appointments.patient_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can update their own appointments" ON appointments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = appointments.patient_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can view appointments" ON appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM providers 
            WHERE id = auth.uid() 
            AND is_active = true
        )
    );

-- Patient Portal Sessions RLS Policies
CREATE POLICY "Patients can view their own portal sessions" ON patient_portal_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = patient_portal_sessions.patient_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can create their own portal sessions" ON patient_portal_sessions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = patient_portal_sessions.patient_id 
            AND user_id = auth.uid()
        )
    );

-- Patient Portal Activity RLS Policies
CREATE POLICY "Patients can view their own portal activity" ON patient_portal_activity
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = patient_portal_activity.patient_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can create their own portal activity" ON patient_portal_activity
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = patient_portal_activity.patient_id 
            AND user_id = auth.uid()
        )
    );

-- Patient Portal Preferences RLS Policies
CREATE POLICY "Patients can view their own portal preferences" ON patient_portal_preferences
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = patient_portal_preferences.patient_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can create their own portal preferences" ON patient_portal_preferences
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = patient_portal_preferences.patient_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can update their own portal preferences" ON patient_portal_preferences
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = patient_portal_preferences.patient_id 
            AND user_id = auth.uid()
        )
    );

-- Patient Portal Messages RLS Policies
CREATE POLICY "Patients can view their own portal messages" ON patient_portal_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = patient_portal_messages.patient_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can create their own portal messages" ON patient_portal_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = patient_portal_messages.patient_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can update their own portal messages" ON patient_portal_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = patient_portal_messages.patient_id 
            AND user_id = auth.uid()
        )
    );

-- Patient Portal Notifications RLS Policies
CREATE POLICY "Patients can view their own portal notifications" ON patient_portal_notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = patient_portal_notifications.patient_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can update their own portal notifications" ON patient_portal_notifications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = patient_portal_notifications.patient_id 
            AND user_id = auth.uid()
        )
    );

-- Patient Portal Forms RLS Policies
CREATE POLICY "Patients can view their own portal forms" ON patient_portal_forms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = patient_portal_forms.patient_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can create their own portal forms" ON patient_portal_forms
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = patient_portal_forms.patient_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can update their own portal forms" ON patient_portal_forms
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE id = patient_portal_forms.patient_id 
            AND user_id = auth.uid()
        )
    );

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_portal_preferences_updated_at BEFORE UPDATE ON patient_portal_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_portal_messages_updated_at BEFORE UPDATE ON patient_portal_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_portal_forms_updated_at BEFORE UPDATE ON patient_portal_forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log patient portal activity
CREATE OR REPLACE FUNCTION log_patient_portal_activity(
    p_patient_id UUID,
    p_activity_type VARCHAR(50),
    p_description TEXT,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
    INSERT INTO patient_portal_activity (
        patient_id, activity_type, description, metadata
    ) VALUES (
        p_patient_id, p_activity_type, p_description, p_metadata
    );
END;
$$ language 'plpgsql';

-- Function to create patient portal session
CREATE OR REPLACE FUNCTION create_patient_portal_session(
    p_patient_id UUID,
    p_session_token VARCHAR(255),
    p_expires_at TIMESTAMP WITH TIME ZONE,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    session_id UUID;
BEGIN
    -- Deactivate existing sessions
    UPDATE patient_portal_sessions 
    SET is_active = false 
    WHERE patient_id = p_patient_id AND is_active = true;

    -- Create new session
    INSERT INTO patient_portal_sessions (
        patient_id, session_token, expires_at, ip_address, user_agent
    ) VALUES (
        p_patient_id, p_session_token, p_expires_at, p_ip_address, p_user_agent
    ) RETURNING id INTO session_id;

    -- Log activity
    PERFORM log_patient_portal_activity(
        p_patient_id, 
        'login', 
        'Patient logged into portal',
        jsonb_build_object('session_id', session_id)
    );

    RETURN session_id;
END;
$$ language 'plpgsql';

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_portal_sessions()
RETURNS void AS $$
BEGIN
    UPDATE patient_portal_sessions 
    SET is_active = false 
    WHERE expires_at < NOW() AND is_active = true;
END;
$$ language 'plpgsql';
