-- Financial Reports Schema - A/R Aging, Claim Funnel, No-Show Heatmap

-- Create financial_reports table for caching
CREATE TABLE IF NOT EXISTS public.financial_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  report_type text NOT NULL CHECK (report_type IN ('ar_aging', 'claim_funnel', 'no_show_heatmap', 'summary')),
  period text NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  date_range text NOT NULL,
  report_data jsonb NOT NULL,
  generated_at timestamp with time zone DEFAULT now() NOT NULL,
  expires_at timestamp with time zone NOT NULL
);

ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for financial_reports
CREATE POLICY "Enable read access for clinic members" ON public.financial_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = financial_reports.clinic_id)
);

CREATE POLICY "Enable insert for clinic members" ON public.financial_reports FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = financial_reports.clinic_id)
);

CREATE POLICY "Enable update for clinic members" ON public.financial_reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = financial_reports.clinic_id)
);

CREATE POLICY "Enable delete for clinic admins" ON public.financial_reports FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.clinic_members WHERE user_id = auth.uid() AND clinic_id = financial_reports.clinic_id AND role = 'admin')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_financial_reports_clinic_id ON public.financial_reports (clinic_id);
CREATE INDEX IF NOT EXISTS idx_financial_reports_type_period ON public.financial_reports (report_type, period);
CREATE INDEX IF NOT EXISTS idx_financial_reports_expires_at ON public.financial_reports (expires_at);

-- Create function to clean up expired reports
CREATE OR REPLACE FUNCTION cleanup_expired_financial_reports()
RETURNS void AS $$
BEGIN
  DELETE FROM public.financial_reports 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically clean up expired reports (runs daily)
-- Note: This would typically be set up as a cron job in production
-- For now, we'll rely on manual cleanup or application-level cleanup

-- Add financial report fields to existing tables if they don't exist
-- These fields might already exist in other schemas, so we use IF NOT EXISTS

-- Add no-show tracking to appointments if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'appointments' AND column_name = 'no_show_reason') THEN
    ALTER TABLE public.appointments ADD COLUMN no_show_reason text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'appointments' AND column_name = 'no_show_fee_charged') THEN
    ALTER TABLE public.appointments ADD COLUMN no_show_fee_charged boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'appointments' AND column_name = 'no_show_fee_amount') THEN
    ALTER TABLE public.appointments ADD COLUMN no_show_fee_amount decimal(10,2) DEFAULT 0;
  END IF;
END $$;

-- Add claim tracking fields to insurance_claims if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'insurance_claims' AND column_name = 'submitted_at') THEN
    ALTER TABLE public.insurance_claims ADD COLUMN submitted_at timestamp with time zone;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'insurance_claims' AND column_name = 'processed_at') THEN
    ALTER TABLE public.insurance_claims ADD COLUMN processed_at timestamp with time zone;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'insurance_claims' AND column_name = 'paid_at') THEN
    ALTER TABLE public.insurance_claims ADD COLUMN paid_at timestamp with time zone;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'insurance_claims' AND column_name = 'denied_at') THEN
    ALTER TABLE public.insurance_claims ADD COLUMN denied_at timestamp with time zone;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'insurance_claims' AND column_name = 'denial_reason') THEN
    ALTER TABLE public.insurance_claims ADD COLUMN denial_reason text;
  END IF;
END $$;

-- Add A/R tracking fields to invoices if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'invoices' AND column_name = 'due_date') THEN
    ALTER TABLE public.invoices ADD COLUMN due_date date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'invoices' AND column_name = 'days_overdue') THEN
    ALTER TABLE public.invoices ADD COLUMN days_overdue integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'invoices' AND column_name = 'collection_attempts') THEN
    ALTER TABLE public.invoices ADD COLUMN collection_attempts integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'invoices' AND column_name = 'last_collection_attempt') THEN
    ALTER TABLE public.invoices ADD COLUMN last_collection_attempt timestamp with time zone;
  END IF;
END $$;

-- Create function to update days_overdue for invoices
CREATE OR REPLACE FUNCTION update_invoice_days_overdue()
RETURNS void AS $$
BEGIN
  UPDATE public.invoices 
  SET days_overdue = GREATEST(0, CURRENT_DATE - due_date)
  WHERE status != 'paid' AND due_date IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate financial report summary
CREATE OR REPLACE FUNCTION generate_financial_summary(
  p_clinic_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  total_ar decimal(12,2) := 0;
  avg_days_ar decimal(6,2) := 0;
  collection_rate decimal(5,2) := 0;
  no_show_rate decimal(5,2) := 0;
  total_claims integer := 0;
  paid_claims integer := 0;
  denied_claims integer := 0;
BEGIN
  -- Calculate total A/R
  SELECT COALESCE(SUM(amount), 0)
  INTO total_ar
  FROM public.invoices
  WHERE clinic_id = p_clinic_id
    AND status != 'paid'
    AND created_at::date BETWEEN p_start_date AND p_end_date;
  
  -- Calculate average days in A/R
  SELECT COALESCE(AVG(days_overdue), 0)
  INTO avg_days_ar
  FROM public.invoices
  WHERE clinic_id = p_clinic_id
    AND status != 'paid'
    AND created_at::date BETWEEN p_start_date AND p_end_date;
  
  -- Calculate collection rate
  SELECT COALESCE(
    (SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) / 
     NULLIF(SUM(amount), 0)) * 100, 0
  )
  INTO collection_rate
  FROM public.invoices
  WHERE clinic_id = p_clinic_id
    AND created_at::date BETWEEN p_start_date AND p_end_date;
  
  -- Calculate no-show rate
  SELECT COALESCE(
    (COUNT(CASE WHEN status = 'no_show' THEN 1 END) / 
     NULLIF(COUNT(*), 0)) * 100, 0
  )
  INTO no_show_rate
  FROM public.appointments
  WHERE clinic_id = p_clinic_id
    AND date BETWEEN p_start_date AND p_end_date;
  
  -- Calculate claims metrics
  SELECT 
    COUNT(*),
    COUNT(CASE WHEN status = 'paid' THEN 1 END),
    COUNT(CASE WHEN status = 'denied' THEN 1 END)
  INTO total_claims, paid_claims, denied_claims
  FROM public.insurance_claims
  WHERE clinic_id = p_clinic_id
    AND created_at::date BETWEEN p_start_date AND p_end_date;
  
  -- Build result
  result := jsonb_build_object(
    'totalAR', total_ar,
    'avgDaysInAR', avg_days_ar,
    'collectionRate', collection_rate,
    'noShowRate', no_show_rate,
    'totalClaims', total_claims,
    'paidClaims', paid_claims,
    'deniedClaims', denied_claims
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate A/R aging report
CREATE OR REPLACE FUNCTION generate_ar_aging_report(
  p_clinic_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  aging_data jsonb;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'period', period,
      'amount', amount,
      'percentage', percentage,
      'count', count
    )
  )
  INTO aging_data
  FROM (
    SELECT 
      CASE 
        WHEN days_overdue <= 30 THEN '0-30'
        WHEN days_overdue <= 60 THEN '31-60'
        WHEN days_overdue <= 90 THEN '61-90'
        ELSE '90+'
      END as period,
      SUM(amount) as amount,
      COUNT(*) as count,
      (SUM(amount) / NULLIF((SELECT SUM(amount) FROM public.invoices WHERE clinic_id = p_clinic_id AND status != 'paid'), 0)) * 100 as percentage
    FROM public.invoices
    WHERE clinic_id = p_clinic_id
      AND status != 'paid'
      AND created_at::date BETWEEN p_start_date AND p_end_date
    GROUP BY period
    ORDER BY 
      CASE period
        WHEN '0-30' THEN 1
        WHEN '31-60' THEN 2
        WHEN '61-90' THEN 3
        WHEN '90+' THEN 4
      END
  ) t;
  
  result := jsonb_build_object('aRAging', COALESCE(aging_data, '[]'::jsonb));
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate claim funnel report
CREATE OR REPLACE FUNCTION generate_claim_funnel_report(
  p_clinic_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  funnel_data jsonb;
  total_claims integer;
BEGIN
  -- Get total claims for percentage calculation
  SELECT COUNT(*)
  INTO total_claims
  FROM public.insurance_claims
  WHERE clinic_id = p_clinic_id
    AND created_at::date BETWEEN p_start_date AND p_end_date;
  
  SELECT jsonb_agg(
    jsonb_build_object(
      'stage', stage,
      'count', count,
      'amount', amount,
      'percentage', percentage
    )
  )
  INTO funnel_data
  FROM (
    SELECT 
      status as stage,
      COUNT(*) as count,
      SUM(amount) as amount,
      (COUNT(*) / NULLIF(total_claims, 0)) * 100 as percentage
    FROM public.insurance_claims
    WHERE clinic_id = p_clinic_id
      AND created_at::date BETWEEN p_start_date AND p_end_date
    GROUP BY status
    ORDER BY 
      CASE status
        WHEN 'submitted' THEN 1
        WHEN 'processing' THEN 2
        WHEN 'paid' THEN 3
        WHEN 'denied' THEN 4
      END
  ) t;
  
  result := jsonb_build_object('claimFunnel', COALESCE(funnel_data, '[]'::jsonb));
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate no-show heatmap report
CREATE OR REPLACE FUNCTION generate_no_show_heatmap_report(
  p_clinic_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  heatmap_data jsonb;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'day', day,
      'hour', hour,
      'noShowRate', no_show_rate,
      'totalAppointments', total_appointments
    )
  )
  INTO heatmap_data
  FROM (
    SELECT 
      CASE EXTRACT(DOW FROM date)
        WHEN 1 THEN 'Mon'
        WHEN 2 THEN 'Tue'
        WHEN 3 THEN 'Wed'
        WHEN 4 THEN 'Thu'
        WHEN 5 THEN 'Fri'
        WHEN 6 THEN 'Sat'
        WHEN 0 THEN 'Sun'
      END as day,
      EXTRACT(HOUR FROM time::time) as hour,
      (COUNT(CASE WHEN status = 'no_show' THEN 1 END) / NULLIF(COUNT(*), 0)) * 100 as no_show_rate,
      COUNT(*) as total_appointments
    FROM public.appointments
    WHERE clinic_id = p_clinic_id
      AND date BETWEEN p_start_date AND p_end_date
    GROUP BY EXTRACT(DOW FROM date), EXTRACT(HOUR FROM time::time)
    ORDER BY EXTRACT(DOW FROM date), EXTRACT(HOUR FROM time::time)
  ) t;
  
  result := jsonb_build_object('noShowHeatmap', COALESCE(heatmap_data, '[]'::jsonb));
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
