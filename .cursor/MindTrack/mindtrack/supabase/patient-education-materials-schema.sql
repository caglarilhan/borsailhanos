-- Patient Education Materials Schema
-- Comprehensive patient education management for American psychiatrists

-- Education materials library
CREATE TABLE IF NOT EXISTS patient_education_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_title VARCHAR(255) NOT NULL,
    material_type VARCHAR(50) NOT NULL, -- 'video', 'audio', 'document', 'interactive', 'infographic', 'brochure'
    material_category VARCHAR(100) NOT NULL, -- 'medication_education', 'condition_education', 'lifestyle_education', 'treatment_education', 'safety_education'
    material_subcategory VARCHAR(100), -- 'depression', 'anxiety', 'bipolar', 'schizophrenia', 'adhd', 'ptsd', 'eating_disorders'
    material_description TEXT NOT NULL,
    material_content TEXT, -- For text-based materials
    material_url VARCHAR(500), -- For external resources
    material_file_path VARCHAR(500), -- For uploaded files
    material_file_size INTEGER, -- File size in bytes
    material_duration INTEGER, -- Duration in seconds for video/audio
    material_language VARCHAR(10) NOT NULL DEFAULT 'en', -- ISO language code
    material_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    material_status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'archived', 'draft'
    accessibility_features TEXT[], -- 'screen_reader', 'closed_captions', 'audio_description', 'large_text', 'high_contrast'
    target_audience VARCHAR(50) NOT NULL, -- 'adult', 'adolescent', 'child', 'family', 'caregiver'
    difficulty_level VARCHAR(20) NOT NULL, -- 'beginner', 'intermediate', 'advanced'
    reading_level VARCHAR(20), -- 'grade_3', 'grade_6', 'grade_9', 'grade_12', 'college'
    estimated_completion_time INTEGER, -- Estimated time in minutes
    learning_objectives TEXT[],
    key_points TEXT[],
    prerequisites TEXT[],
    related_materials UUID[], -- References to other materials
    tags TEXT[],
    keywords TEXT[],
    created_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    review_date DATE,
    approval_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'needs_revision'
    approval_notes TEXT,
    last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient education assignments
CREATE TABLE IF NOT EXISTS patient_education_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES patient_education_materials(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES users(id),
    assignment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    priority_level VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    assignment_type VARCHAR(50) NOT NULL, -- 'required', 'recommended', 'optional', 'follow_up'
    assignment_notes TEXT,
    assignment_instructions TEXT,
    completion_requirements TEXT[], -- What constitutes completion
    assessment_required BOOLEAN DEFAULT FALSE,
    assessment_type VARCHAR(50), -- 'quiz', 'survey', 'discussion', 'demonstration'
    assessment_questions JSONB,
    passing_score DECIMAL(3,2), -- 0.00 to 1.00
    retake_allowed BOOLEAN DEFAULT TRUE,
    max_attempts INTEGER DEFAULT 3,
    assignment_status VARCHAR(20) NOT NULL DEFAULT 'assigned', -- 'assigned', 'in_progress', 'completed', 'overdue', 'cancelled'
    completion_date DATE,
    completion_time INTEGER, -- Time spent in minutes
    completion_percentage DECIMAL(3,2), -- 0.00 to 1.00
    assessment_score DECIMAL(3,2), -- 0.00 to 1.00
    assessment_attempts INTEGER DEFAULT 0,
    patient_feedback TEXT,
    patient_rating INTEGER, -- 1-5 star rating
    provider_notes TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    follow_up_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient education progress tracking
CREATE TABLE IF NOT EXISTS patient_education_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    assignment_id UUID NOT NULL REFERENCES patient_education_assignments(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES patient_education_materials(id) ON DELETE CASCADE,
    progress_date DATE NOT NULL DEFAULT CURRENT_DATE,
    progress_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    progress_type VARCHAR(50) NOT NULL, -- 'started', 'paused', 'resumed', 'completed_section', 'completed_material', 'assessment_taken'
    progress_percentage DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
    time_spent INTEGER NOT NULL DEFAULT 0, -- Time spent in minutes
    section_completed VARCHAR(100), -- For materials with sections
    notes TEXT,
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    browser_info VARCHAR(100),
    ip_address INET,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient education assessments
CREATE TABLE IF NOT EXISTS patient_education_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES patient_education_assignments(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES patient_education_materials(id) ON DELETE CASCADE,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    assessment_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    assessment_type VARCHAR(50) NOT NULL, -- 'pre_assessment', 'post_assessment', 'follow_up_assessment'
    questions JSONB NOT NULL, -- Assessment questions and answers
    answers JSONB NOT NULL, -- Patient answers
    score DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
    passing_score DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
    passed BOOLEAN NOT NULL,
    time_taken INTEGER NOT NULL, -- Time taken in minutes
    attempt_number INTEGER NOT NULL DEFAULT 1,
    feedback_provided TEXT,
    areas_for_improvement TEXT[],
    strengths_identified TEXT[],
    recommended_follow_up TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient education compliance tracking
CREATE TABLE IF NOT EXISTS patient_education_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    compliance_period_start DATE NOT NULL,
    compliance_period_end DATE NOT NULL,
    total_assignments INTEGER NOT NULL DEFAULT 0,
    completed_assignments INTEGER NOT NULL DEFAULT 0,
    overdue_assignments INTEGER NOT NULL DEFAULT 0,
    compliance_rate DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
    average_completion_time INTEGER, -- Average time in minutes
    average_assessment_score DECIMAL(3,2),
    engagement_score DECIMAL(3,2), -- Based on time spent, interactions, etc.
    preferred_material_types TEXT[],
    preferred_learning_times TEXT[], -- 'morning', 'afternoon', 'evening'
    preferred_device_types TEXT[],
    barriers_identified TEXT[], -- 'technical', 'time', 'language', 'comprehension', 'motivation'
    support_needed TEXT[],
    improvement_suggestions TEXT[],
    compliance_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient education analytics
CREATE TABLE IF NOT EXISTS patient_education_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis_period_months INTEGER NOT NULL DEFAULT 12,
    total_materials INTEGER NOT NULL DEFAULT 0,
    active_materials INTEGER NOT NULL DEFAULT 0,
    total_assignments INTEGER NOT NULL DEFAULT 0,
    completed_assignments INTEGER NOT NULL DEFAULT 0,
    total_patients INTEGER NOT NULL DEFAULT 0,
    engaged_patients INTEGER NOT NULL DEFAULT 0,
    average_completion_rate DECIMAL(3,2),
    average_assessment_score DECIMAL(3,2),
    average_engagement_score DECIMAL(3,2),
    most_popular_materials JSONB, -- Most accessed materials
    least_popular_materials JSONB, -- Least accessed materials
    material_effectiveness JSONB, -- Effectiveness by material type
    completion_trends JSONB, -- Completion trends over time
    engagement_patterns JSONB, -- When patients are most engaged
    device_usage_patterns JSONB, -- Device usage statistics
    language_preferences JSONB, -- Language usage statistics
    difficulty_level_performance JSONB, -- Performance by difficulty level
    target_audience_performance JSONB, -- Performance by target audience
    accessibility_usage JSONB, -- Accessibility feature usage
    patient_feedback_summary JSONB, -- Summary of patient feedback
    improvement_recommendations JSONB, -- Recommendations for improvement
    cost_effectiveness_metrics JSONB, -- Cost per completion, ROI, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patient_education_materials_type ON patient_education_materials(material_type);
CREATE INDEX IF NOT EXISTS idx_patient_education_materials_category ON patient_education_materials(material_category);
CREATE INDEX IF NOT EXISTS idx_patient_education_materials_status ON patient_education_materials(material_status);
CREATE INDEX IF NOT EXISTS idx_patient_education_materials_language ON patient_education_materials(material_language);
CREATE INDEX IF NOT EXISTS idx_patient_education_materials_target_audience ON patient_education_materials(target_audience);
CREATE INDEX IF NOT EXISTS idx_patient_education_materials_difficulty ON patient_education_materials(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_patient_education_materials_approval ON patient_education_materials(approval_status);

CREATE INDEX IF NOT EXISTS idx_patient_education_assignments_patient_id ON patient_education_assignments(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_education_assignments_material_id ON patient_education_assignments(material_id);
CREATE INDEX IF NOT EXISTS idx_patient_education_assignments_status ON patient_education_assignments(assignment_status);
CREATE INDEX IF NOT EXISTS idx_patient_education_assignments_due_date ON patient_education_assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_patient_education_assignments_priority ON patient_education_assignments(priority_level);

CREATE INDEX IF NOT EXISTS idx_patient_education_progress_patient_id ON patient_education_progress(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_education_progress_assignment_id ON patient_education_progress(assignment_id);
CREATE INDEX IF NOT EXISTS idx_patient_education_progress_material_id ON patient_education_progress(material_id);
CREATE INDEX IF NOT EXISTS idx_patient_education_progress_date ON patient_education_progress(progress_date);

CREATE INDEX IF NOT EXISTS idx_patient_education_assessments_assignment_id ON patient_education_assessments(assignment_id);
CREATE INDEX IF NOT EXISTS idx_patient_education_assessments_patient_id ON patient_education_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_education_assessments_material_id ON patient_education_assessments(material_id);
CREATE INDEX IF NOT EXISTS idx_patient_education_assessments_date ON patient_education_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_patient_education_assessments_type ON patient_education_assessments(assessment_type);

CREATE INDEX IF NOT EXISTS idx_patient_education_compliance_patient_id ON patient_education_compliance(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_education_compliance_period ON patient_education_compliance(compliance_period_start, compliance_period_end);

CREATE INDEX IF NOT EXISTS idx_patient_education_analytics_date ON patient_education_analytics(analysis_date);

-- RLS Policies
ALTER TABLE patient_education_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_education_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_education_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_education_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_education_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_education_analytics ENABLE ROW LEVEL SECURITY;

-- Patient education materials policies (system-wide read access for approved materials)
CREATE POLICY "Users can view approved education materials" ON patient_education_materials
    FOR SELECT USING (approval_status = 'approved' AND material_status = 'active');

CREATE POLICY "Users can insert education materials" ON patient_education_materials
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their education materials" ON patient_education_materials
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their education materials" ON patient_education_materials
    FOR DELETE USING (created_by = auth.uid());

-- Patient education assignments policies
CREATE POLICY "Users can view assignments for their patients" ON patient_education_assignments
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert assignments for their patients" ON patient_education_assignments
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update assignments for their patients" ON patient_education_assignments
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete assignments for their patients" ON patient_education_assignments
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Patient education progress policies
CREATE POLICY "Users can view progress for their patients" ON patient_education_progress
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert progress for their patients" ON patient_education_progress
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Patient education assessments policies
CREATE POLICY "Users can view assessments for their patients" ON patient_education_assessments
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert assessments for their patients" ON patient_education_assessments
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update assessments for their patients" ON patient_education_assessments
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Patient education compliance policies
CREATE POLICY "Users can view compliance for their patients" ON patient_education_compliance
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert compliance for their patients" ON patient_education_compliance
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update compliance for their patients" ON patient_education_compliance
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Patient education analytics policies (system-wide access)
CREATE POLICY "Users can view education analytics" ON patient_education_analytics
    FOR SELECT USING (true);

CREATE POLICY "Users can insert education analytics" ON patient_education_analytics
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update education analytics" ON patient_education_analytics
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete education analytics" ON patient_education_analytics
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Functions for patient education

-- Function to calculate patient education compliance
CREATE OR REPLACE FUNCTION calculate_patient_education_compliance(
    p_patient_id UUID,
    p_period_start DATE,
    p_period_end DATE
)
RETURNS TABLE (
    compliance_id UUID,
    compliance_rate DECIMAL(3,2),
    total_assignments INTEGER,
    completed_assignments INTEGER,
    overdue_assignments INTEGER,
    average_completion_time INTEGER,
    average_assessment_score DECIMAL(3,2),
    engagement_score DECIMAL(3,2)
) AS $$
DECLARE
    v_compliance_id UUID;
    v_total_assignments INTEGER := 0;
    v_completed_assignments INTEGER := 0;
    v_overdue_assignments INTEGER := 0;
    v_compliance_rate DECIMAL(3,2) := 0.0;
    v_average_completion_time INTEGER := 0;
    v_average_assessment_score DECIMAL(3,2) := 0.0;
    v_engagement_score DECIMAL(3,2) := 0.0;
BEGIN
    -- Count total assignments in period
    SELECT COUNT(*) INTO v_total_assignments
    FROM patient_education_assignments
    WHERE patient_id = p_patient_id
    AND assignment_date BETWEEN p_period_start AND p_period_end;
    
    -- Count completed assignments
    SELECT COUNT(*) INTO v_completed_assignments
    FROM patient_education_assignments
    WHERE patient_id = p_patient_id
    AND assignment_date BETWEEN p_period_start AND p_period_end
    AND assignment_status = 'completed';
    
    -- Count overdue assignments
    SELECT COUNT(*) INTO v_overdue_assignments
    FROM patient_education_assignments
    WHERE patient_id = p_patient_id
    AND assignment_date BETWEEN p_period_start AND p_period_end
    AND assignment_status = 'overdue';
    
    -- Calculate compliance rate
    IF v_total_assignments > 0 THEN
        v_compliance_rate := v_completed_assignments::DECIMAL / v_total_assignments::DECIMAL;
    END IF;
    
    -- Calculate average completion time
    SELECT AVG(completion_time) INTO v_average_completion_time
    FROM patient_education_assignments
    WHERE patient_id = p_patient_id
    AND assignment_date BETWEEN p_period_start AND p_period_end
    AND completion_time IS NOT NULL;
    
    -- Calculate average assessment score
    SELECT AVG(assessment_score) INTO v_average_assessment_score
    FROM patient_education_assignments
    WHERE patient_id = p_patient_id
    AND assignment_date BETWEEN p_period_start AND p_period_end
    AND assessment_score IS NOT NULL;
    
    -- Calculate engagement score (simplified algorithm)
    -- Based on completion rate, time spent, and assessment scores
    v_engagement_score := v_compliance_rate * 0.4;
    IF v_average_assessment_score > 0 THEN
        v_engagement_score := v_engagement_score + (v_average_assessment_score * 0.3);
    END IF;
    -- Add time-based engagement (simplified)
    IF v_average_completion_time > 0 THEN
        v_engagement_score := v_engagement_score + 0.3;
    END IF;
    
    -- Ensure engagement score doesn't exceed 1.0
    v_engagement_score := LEAST(v_engagement_score, 1.0);
    
    -- Create or update compliance record
    INSERT INTO patient_education_compliance (
        patient_id,
        compliance_period_start,
        compliance_period_end,
        total_assignments,
        completed_assignments,
        overdue_assignments,
        compliance_rate,
        average_completion_time,
        average_assessment_score,
        engagement_score
    ) VALUES (
        p_patient_id,
        p_period_start,
        p_period_end,
        v_total_assignments,
        v_completed_assignments,
        v_overdue_assignments,
        v_compliance_rate,
        v_average_completion_time,
        v_average_assessment_score,
        v_engagement_score
    )
    ON CONFLICT (patient_id, compliance_period_start, compliance_period_end) 
    DO UPDATE SET
        total_assignments = EXCLUDED.total_assignments,
        completed_assignments = EXCLUDED.completed_assignments,
        overdue_assignments = EXCLUDED.overdue_assignments,
        compliance_rate = EXCLUDED.compliance_rate,
        average_completion_time = EXCLUDED.average_completion_time,
        average_assessment_score = EXCLUDED.average_assessment_score,
        engagement_score = EXCLUDED.engagement_score,
        updated_at = NOW()
    RETURNING id INTO v_compliance_id;
    
    RETURN QUERY
    SELECT 
        v_compliance_id,
        v_compliance_rate,
        v_total_assignments,
        v_completed_assignments,
        v_overdue_assignments,
        v_average_completion_time,
        v_average_assessment_score,
        v_engagement_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate patient education analytics
CREATE OR REPLACE FUNCTION generate_patient_education_analytics(
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
        'total_materials', (
            SELECT COUNT(*) FROM patient_education_materials
            WHERE created_at >= v_start_date
        ),
        'active_materials', (
            SELECT COUNT(*) FROM patient_education_materials
            WHERE created_at >= v_start_date
            AND material_status = 'active'
            AND approval_status = 'approved'
        ),
        'total_assignments', (
            SELECT COUNT(*) FROM patient_education_assignments
            WHERE assignment_date >= v_start_date
        ),
        'completed_assignments', (
            SELECT COUNT(*) FROM patient_education_assignments
            WHERE assignment_date >= v_start_date
            AND assignment_status = 'completed'
        ),
        'total_patients', (
            SELECT COUNT(DISTINCT patient_id) FROM patient_education_assignments
            WHERE assignment_date >= v_start_date
        ),
        'engaged_patients', (
            SELECT COUNT(DISTINCT patient_id) FROM patient_education_assignments
            WHERE assignment_date >= v_start_date
            AND assignment_status IN ('completed', 'in_progress')
        ),
        'average_completion_rate', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN assignment_status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL
                    ELSE 0
                END
            FROM patient_education_assignments
            WHERE assignment_date >= v_start_date
        ),
        'average_assessment_score', (
            SELECT AVG(assessment_score) FROM patient_education_assignments
            WHERE assignment_date >= v_start_date
            AND assessment_score IS NOT NULL
        ),
        'average_engagement_score', (
            SELECT AVG(engagement_score) FROM patient_education_compliance
            WHERE compliance_period_start >= v_start_date
        ),
        'most_popular_materials', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'material_id', material_id,
                    'material_title', material_title,
                    'assignment_count', assignment_count,
                    'completion_rate', completion_rate
                )
            )
            FROM (
                SELECT 
                    pea.material_id,
                    pem.material_title,
                    COUNT(*) as assignment_count,
                    COUNT(CASE WHEN pea.assignment_status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL as completion_rate
                FROM patient_education_assignments pea
                JOIN patient_education_materials pem ON pea.material_id = pem.id
                WHERE pea.assignment_date >= v_start_date
                GROUP BY pea.material_id, pem.material_title
                ORDER BY assignment_count DESC
                LIMIT 10
            ) popular
        ),
        'material_effectiveness', (
            SELECT jsonb_object_agg(
                material_type,
                effectiveness_data
            )
            FROM (
                SELECT 
                    pem.material_type,
                    jsonb_build_object(
                        'completion_rate', COUNT(CASE WHEN pea.assignment_status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL,
                        'average_score', AVG(pea.assessment_score),
                        'average_time', AVG(pea.completion_time)
                    ) as effectiveness_data
                FROM patient_education_assignments pea
                JOIN patient_education_materials pem ON pea.material_id = pem.id
                WHERE pea.assignment_date >= v_start_date
                GROUP BY pem.material_type
            ) effectiveness
        ),
        'completion_trends', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'month', month,
                    'completion_rate', completion_rate,
                    'assignment_count', assignment_count
                )
            )
            FROM (
                SELECT 
                    DATE_TRUNC('month', assignment_date) as month,
                    COUNT(CASE WHEN assignment_status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL as completion_rate,
                    COUNT(*) as assignment_count
                FROM patient_education_assignments
                WHERE assignment_date >= v_start_date
                GROUP BY month
                ORDER BY month
            ) trends
        ),
        'engagement_patterns', (
            SELECT jsonb_build_object(
                'device_usage', (
                    SELECT jsonb_object_agg(
                        device_type,
                        usage_count
                    )
                    FROM (
                        SELECT 
                            device_type,
                            COUNT(*) as usage_count
                        FROM patient_education_progress
                        WHERE progress_date >= v_start_date
                        GROUP BY device_type
                    ) devices
                ),
                'time_patterns', (
                    SELECT jsonb_object_agg(
                        time_period,
                        activity_count
                    )
                    FROM (
                        SELECT 
                            CASE 
                                WHEN EXTRACT(hour FROM progress_time) BETWEEN 6 AND 11 THEN 'morning'
                                WHEN EXTRACT(hour FROM progress_time) BETWEEN 12 AND 17 THEN 'afternoon'
                                WHEN EXTRACT(hour FROM progress_time) BETWEEN 18 AND 23 THEN 'evening'
                                ELSE 'night'
                            END as time_period,
                            COUNT(*) as activity_count
                        FROM patient_education_progress
                        WHERE progress_date >= v_start_date
                        GROUP BY time_period
                    ) times
                )
            )
        )
    ) INTO v_analytics;
    
    RETURN v_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update patient education analytics
CREATE OR REPLACE FUNCTION update_patient_education_analytics(
    p_analysis_date DATE DEFAULT CURRENT_DATE,
    p_analysis_period_months INTEGER DEFAULT 12
)
RETURNS VOID AS $$
DECLARE
    v_analytics JSONB;
BEGIN
    SELECT generate_patient_education_analytics(p_analysis_date, p_analysis_period_months) INTO v_analytics;
    
    INSERT INTO patient_education_analytics (
        analysis_date,
        analysis_period_months,
        total_materials,
        active_materials,
        total_assignments,
        completed_assignments,
        total_patients,
        engaged_patients,
        average_completion_rate,
        average_assessment_score,
        average_engagement_score,
        most_popular_materials,
        material_effectiveness,
        completion_trends,
        engagement_patterns
    ) VALUES (
        p_analysis_date,
        p_analysis_period_months,
        (v_analytics->>'total_materials')::INTEGER,
        (v_analytics->>'active_materials')::INTEGER,
        (v_analytics->>'total_assignments')::INTEGER,
        (v_analytics->>'completed_assignments')::INTEGER,
        (v_analytics->>'total_patients')::INTEGER,
        (v_analytics->>'engaged_patients')::INTEGER,
        (v_analytics->>'average_completion_rate')::DECIMAL(3,2),
        (v_analytics->>'average_assessment_score')::DECIMAL(3,2),
        (v_analytics->>'average_engagement_score')::DECIMAL(3,2),
        v_analytics->'most_popular_materials',
        v_analytics->'material_effectiveness',
        v_analytics->'completion_trends',
        v_analytics->'engagement_patterns'
    )
    ON CONFLICT (analysis_date) 
    DO UPDATE SET
        analysis_period_months = EXCLUDED.analysis_period_months,
        total_materials = EXCLUDED.total_materials,
        active_materials = EXCLUDED.active_materials,
        total_assignments = EXCLUDED.total_assignments,
        completed_assignments = EXCLUDED.completed_assignments,
        total_patients = EXCLUDED.total_patients,
        engaged_patients = EXCLUDED.engaged_patients,
        average_completion_rate = EXCLUDED.average_completion_rate,
        average_assessment_score = EXCLUDED.average_assessment_score,
        average_engagement_score = EXCLUDED.average_engagement_score,
        most_popular_materials = EXCLUDED.most_popular_materials,
        material_effectiveness = EXCLUDED.material_effectiveness,
        completion_trends = EXCLUDED.completion_trends,
        engagement_patterns = EXCLUDED.engagement_patterns,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics when new assignment is added
CREATE OR REPLACE FUNCTION trigger_update_patient_education_analytics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_patient_education_analytics();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patient_education_analytics_trigger
    AFTER INSERT OR UPDATE ON patient_education_assignments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_patient_education_analytics();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_patient_education_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patient_education_materials_updated_at
    BEFORE UPDATE ON patient_education_materials
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_education_updated_at();

CREATE TRIGGER patient_education_assignments_updated_at
    BEFORE UPDATE ON patient_education_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_education_updated_at();

CREATE TRIGGER patient_education_assessments_updated_at
    BEFORE UPDATE ON patient_education_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_education_updated_at();

CREATE TRIGGER patient_education_compliance_updated_at
    BEFORE UPDATE ON patient_education_compliance
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_education_updated_at();

CREATE TRIGGER patient_education_analytics_updated_at
    BEFORE UPDATE ON patient_education_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_education_updated_at();
