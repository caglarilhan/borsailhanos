-- Advanced Lab Tracking Schema

-- Labs: orders, panels, results, alerts, mappings, analytics
CREATE TABLE IF NOT EXISTS lab_panels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_code VARCHAR(64) UNIQUE NOT NULL,
    panel_name VARCHAR(255) NOT NULL,
    description TEXT,
    analytes JSONB NOT NULL, -- [{code, name, unit, method}]
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab_reference_ranges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analyte_code VARCHAR(64) NOT NULL,
    unit VARCHAR(32) NOT NULL,
    reference_low DECIMAL(10,4),
    reference_high DECIMAL(10,4),
    age_min INTEGER,
    age_max INTEGER,
    sex VARCHAR(16),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ordering_provider UUID REFERENCES auth.users(id),
    order_date TIMESTAMPTZ DEFAULT now(),
    order_status VARCHAR(32) DEFAULT 'ordered', -- ordered|collected|in_progress|completed|cancelled
    panel_code VARCHAR(64) REFERENCES lab_panels(panel_code),
    individual_analytes JSONB, -- optional list of analytes if not full panel
    priority VARCHAR(16) DEFAULT 'routine', -- routine|urgent|stat
    clinical_indication TEXT,
    external_lab_id VARCHAR(128),
    collection_datetime TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
    analyte_code VARCHAR(64) NOT NULL,
    result_value DECIMAL(18,6),
    unit VARCHAR(32),
    reference_low DECIMAL(10,4),
    reference_high DECIMAL(10,4),
    flag VARCHAR(16), -- low|normal|high|critical_low|critical_high
    result_datetime TIMESTAMPTZ DEFAULT now(),
    method VARCHAR(64),
    performing_lab VARCHAR(128),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab_critical_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES lab_orders(id) ON DELETE CASCADE,
    analyte_code VARCHAR(64) NOT NULL,
    result_value DECIMAL(18,6),
    unit VARCHAR(32),
    threshold TEXT, -- description of critical threshold
    severity VARCHAR(16) DEFAULT 'critical',
    alert_message TEXT NOT NULL,
    status VARCHAR(16) DEFAULT 'active', -- active|acknowledged|resolved
    alerted_at TIMESTAMPTZ DEFAULT now(),
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab_external_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor VARCHAR(64) NOT NULL, -- e.g., LabCorp, Quest
    external_code VARCHAR(64) NOT NULL,
    internal_code VARCHAR(64) NOT NULL, -- analyte_code or panel_code
    mapping_type VARCHAR(16) NOT NULL, -- analyte|panel
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (vendor, external_code, mapping_type)
);

CREATE TABLE IF NOT EXISTS lab_trend_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analyte_code VARCHAR(64) NOT NULL,
    last_30d_avg DECIMAL(18,6),
    last_90d_avg DECIMAL(18,6),
    slope_30d DECIMAL(18,6),
    slope_90d DECIMAL(18,6),
    last_value DECIMAL(18,6),
    last_flag VARCHAR(16),
    analysis_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(patient_id, analyte_code, analysis_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON lab_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_lab_results_order ON lab_results(order_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_analyte ON lab_results(analyte_code);
CREATE INDEX IF NOT EXISTS idx_lab_alerts_patient ON lab_critical_alerts(patient_id);

-- RLS
ALTER TABLE lab_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reference_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_critical_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_external_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_trend_analytics ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "lab panels readable by authenticated" ON lab_panels
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "lab ranges readable by authenticated" ON lab_reference_ranges
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "lab orders patient/provider read" ON lab_orders
  FOR SELECT USING (
    auth.uid() = patient_id OR auth.uid() IN (
      SELECT provider_id FROM patient_providers WHERE patient_id = lab_orders.patient_id
    )
  );
CREATE POLICY "lab orders provider insert" ON lab_orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "lab orders provider update" ON lab_orders
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "lab results patient/provider read" ON lab_results
  FOR SELECT USING (
    auth.uid() IN (SELECT patient_id FROM lab_orders WHERE id = order_id) OR auth.uid() IN (
      SELECT provider_id FROM patient_providers WHERE patient_id IN (SELECT patient_id FROM lab_orders WHERE id = order_id)
    )
  );
CREATE POLICY "lab results provider insert" ON lab_results
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "lab alerts patient/provider read" ON lab_critical_alerts
  FOR SELECT USING (
    auth.uid() = patient_id OR auth.uid() IN (
      SELECT provider_id FROM patient_providers WHERE patient_id = lab_critical_alerts.patient_id
    )
  );
CREATE POLICY "lab alerts provider update" ON lab_critical_alerts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Helpers
CREATE OR REPLACE FUNCTION mark_lab_alert_acknowledged(alert_uuid UUID, by_user UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE lab_critical_alerts
     SET status = 'acknowledged', acknowledged_by = by_user, acknowledged_at = now(), updated_at = now()
   WHERE id = alert_uuid;
END;$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION compute_lab_flag(val DECIMAL, low DECIMAL, high DECIMAL)
RETURNS VARCHAR AS $$
BEGIN
  IF low IS NULL OR high IS NULL OR val IS NULL THEN RETURN 'normal'; END IF;
  IF val < low THEN RETURN 'low'; END IF;
  IF val > high THEN RETURN 'high'; END IF;
  RETURN 'normal';
END;$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION update_lab_trends()
RETURNS VOID AS $$
BEGIN
  INSERT INTO lab_trend_analytics (patient_id, analyte_code, last_30d_avg, last_90d_avg, slope_30d, slope_90d, last_value, last_flag)
  SELECT lo.patient_id,
         lr.analyte_code,
         AVG(lr.result_value) FILTER (WHERE lr.result_datetime >= now() - interval '30 days') AS last_30d_avg,
         AVG(lr.result_value) FILTER (WHERE lr.result_datetime >= now() - interval '90 days') AS last_90d_avg,
         0.0 AS slope_30d,
         0.0 AS slope_90d,
         (ARRAY(SELECT lr2.result_value FROM lab_results lr2 WHERE lr2.order_id = lr.order_id AND lr2.analyte_code = lr.analyte_code ORDER BY lr2.result_datetime DESC LIMIT 1))[1] AS last_value,
         (ARRAY(SELECT lr2.flag FROM lab_results lr2 WHERE lr2.order_id = lr.order_id AND lr2.analyte_code = lr.analyte_code ORDER BY lr2.result_datetime DESC LIMIT 1))[1] AS last_flag
  FROM lab_results lr
  JOIN lab_orders lo ON lo.id = lr.order_id
  GROUP BY lo.patient_id, lr.analyte_code
  ON CONFLICT (patient_id, analyte_code, analysis_date)
  DO UPDATE SET
    last_30d_avg = EXCLUDED.last_30d_avg,
    last_90d_avg = EXCLUDED.last_90d_avg,
    last_value = EXCLUDED.last_value,
    last_flag = EXCLUDED.last_flag,
    updated_at = now();
END;$$ LANGUAGE plpgsql SECURITY DEFINER;

-- updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_upd_lab_panels BEFORE UPDATE ON lab_panels FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_upd_lab_ranges BEFORE UPDATE ON lab_reference_ranges FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_upd_lab_orders BEFORE UPDATE ON lab_orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_upd_lab_results BEFORE UPDATE ON lab_results FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_upd_lab_alerts BEFORE UPDATE ON lab_critical_alerts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_upd_lab_mappings BEFORE UPDATE ON lab_external_mappings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_upd_lab_trends BEFORE UPDATE ON lab_trend_analytics FOR EACH ROW EXECUTE FUNCTION set_updated_at();
