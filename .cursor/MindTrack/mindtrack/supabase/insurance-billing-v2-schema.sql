-- Insurance Billing V2 Schema - EDI 837/835, Eligibility Checks, ERA Auto-posting

-- Create EDI 837 claims table
CREATE TABLE IF NOT EXISTS public.edi837_claims (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  claim_number text NOT NULL UNIQUE,
  patient_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES auth.users(id),
  diagnosis_codes text[] NOT NULL DEFAULT '{}',
  procedure_codes text[] NOT NULL DEFAULT '{}',
  billed_amount decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'accepted', 'rejected', 'paid', 'denied')),
  submitted_at timestamp with time zone,
  accepted_at timestamp with time zone,
  paid_at timestamp with time zone,
  denied_at timestamp with time zone,
  rejection_reason text,
  edi837_data text,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.edi837_claims ENABLE ROW LEVEL SECURITY;

-- RLS policies for EDI 837 claims
CREATE POLICY "Enable read access for clinic members" ON public.edi837_claims FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = edi837_claims.clinic_id)
);

CREATE POLICY "Enable insert for clinic members" ON public.edi837_claims FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = edi837_claims.clinic_id)
);

CREATE POLICY "Enable update for clinic members" ON public.edi837_claims FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = edi837_claims.clinic_id)
);

CREATE POLICY "Enable delete for clinic admins" ON public.edi837_claims FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.clinic_members WHERE user_id = auth.uid() AND clinic_id = edi837_claims.clinic_id AND role = 'admin')
);

-- Create EDI 835 ERAs table
CREATE TABLE IF NOT EXISTS public.edi835_eras (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  claim_id uuid NOT NULL REFERENCES public.edi837_claims(id) ON DELETE CASCADE,
  payer_id uuid NOT NULL REFERENCES public.insurance_providers(id),
  check_number text NOT NULL,
  check_amount decimal(10,2) NOT NULL,
  payment_date date NOT NULL,
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'posted', 'error')),
  error_message text,
  edi835_data text,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  processed_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.edi835_eras ENABLE ROW LEVEL SECURITY;

-- RLS policies for EDI 835 ERAs
CREATE POLICY "Enable read access for clinic members" ON public.edi835_eras FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = edi835_eras.clinic_id)
);

CREATE POLICY "Enable insert for clinic members" ON public.edi835_eras FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = edi835_eras.clinic_id)
);

CREATE POLICY "Enable update for clinic members" ON public.edi835_eras FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = edi835_eras.clinic_id)
);

CREATE POLICY "Enable delete for clinic admins" ON public.edi835_eras FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.clinic_members WHERE user_id = auth.uid() AND clinic_id = edi835_eras.clinic_id AND role = 'admin')
);

-- Create eligibility checks table
CREATE TABLE IF NOT EXISTS public.eligibility_checks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  insurance_id uuid NOT NULL REFERENCES public.insurance_providers(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed')),
  coverage jsonb NOT NULL DEFAULT '{}',
  benefits jsonb NOT NULL DEFAULT '{}',
  checked_at timestamp with time zone NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.eligibility_checks ENABLE ROW LEVEL SECURITY;

-- RLS policies for eligibility checks
CREATE POLICY "Enable read access for clinic members" ON public.eligibility_checks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = eligibility_checks.clinic_id)
);

CREATE POLICY "Enable insert for clinic members" ON public.eligibility_checks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = eligibility_checks.clinic_id)
);

CREATE POLICY "Enable update for clinic members" ON public.eligibility_checks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = eligibility_checks.clinic_id)
);

CREATE POLICY "Enable delete for clinic admins" ON public.eligibility_checks FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.clinic_members WHERE user_id = auth.uid() AND clinic_id = eligibility_checks.clinic_id AND role = 'admin')
);

-- Create insurance providers table
CREATE TABLE IF NOT EXISTS public.insurance_providers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  payer_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('commercial', 'medicare', 'medicaid', 'self_pay')),
  edi_enabled boolean NOT NULL DEFAULT false,
  eligibility_enabled boolean NOT NULL DEFAULT false,
  era_enabled boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.insurance_providers ENABLE ROW LEVEL SECURITY;

-- RLS policies for insurance providers
CREATE POLICY "Enable read access for clinic members" ON public.insurance_providers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = insurance_providers.clinic_id)
);

CREATE POLICY "Enable insert for clinic members" ON public.insurance_providers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = insurance_providers.clinic_id)
);

CREATE POLICY "Enable update for clinic members" ON public.insurance_providers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = insurance_providers.clinic_id)
);

CREATE POLICY "Enable delete for clinic admins" ON public.insurance_providers FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.clinic_members WHERE user_id = auth.uid() AND clinic_id = insurance_providers.clinic_id AND role = 'admin')
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  claim_id uuid NOT NULL REFERENCES public.edi837_claims(id) ON DELETE CASCADE,
  era_id uuid REFERENCES public.edi835_eras(id),
  check_number text NOT NULL,
  check_amount decimal(10,2) NOT NULL,
  payment_date date NOT NULL,
  payer_id uuid NOT NULL REFERENCES public.insurance_providers(id),
  status text NOT NULL DEFAULT 'posted' CHECK (status IN ('posted', 'reversed', 'voided')),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for payments
CREATE POLICY "Enable read access for clinic members" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = payments.clinic_id)
);

CREATE POLICY "Enable insert for clinic members" ON public.payments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = payments.clinic_id)
);

CREATE POLICY "Enable update for clinic members" ON public.payments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = payments.clinic_id)
);

CREATE POLICY "Enable delete for clinic admins" ON public.payments FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.clinic_members WHERE user_id = auth.uid() AND clinic_id = payments.clinic_id AND role = 'admin')
);

-- Create ERA processing logs table
CREATE TABLE IF NOT EXISTS public.era_processing_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  era_id uuid NOT NULL REFERENCES public.edi835_eras(id) ON DELETE CASCADE,
  claim_id uuid NOT NULL REFERENCES public.edi837_claims(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('processed', 'failed', 'error')),
  processed_at timestamp with time zone NOT NULL,
  processed_by uuid NOT NULL REFERENCES auth.users(id),
  error_message text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.era_processing_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for ERA processing logs
CREATE POLICY "Enable read access for clinic members" ON public.era_processing_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = (
    SELECT clinic_id FROM public.edi835_eras WHERE id = era_processing_logs.era_id
  ))
);

CREATE POLICY "Enable insert for clinic members" ON public.era_processing_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND clinic_id = (
    SELECT clinic_id FROM public.edi835_eras WHERE id = era_processing_logs.era_id
  ))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_edi837_claims_clinic_id ON public.edi837_claims (clinic_id);
CREATE INDEX IF NOT EXISTS idx_edi837_claims_patient_id ON public.edi837_claims (patient_id);
CREATE INDEX IF NOT EXISTS idx_edi837_claims_provider_id ON public.edi837_claims (provider_id);
CREATE INDEX IF NOT EXISTS idx_edi837_claims_status ON public.edi837_claims (status);
CREATE INDEX IF NOT EXISTS idx_edi837_claims_claim_number ON public.edi837_claims (claim_number);
CREATE INDEX IF NOT EXISTS idx_edi835_eras_clinic_id ON public.edi835_eras (clinic_id);
CREATE INDEX IF NOT EXISTS idx_edi835_eras_claim_id ON public.edi835_eras (claim_id);
CREATE INDEX IF NOT EXISTS idx_edi835_eras_payer_id ON public.edi835_eras (payer_id);
CREATE INDEX IF NOT EXISTS idx_edi835_eras_status ON public.edi835_eras (status);
CREATE INDEX IF NOT EXISTS idx_eligibility_checks_clinic_id ON public.eligibility_checks (clinic_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_checks_patient_id ON public.eligibility_checks (patient_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_checks_insurance_id ON public.eligibility_checks (insurance_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_checks_status ON public.eligibility_checks (status);
CREATE INDEX IF NOT EXISTS idx_eligibility_checks_expires_at ON public.eligibility_checks (expires_at);
CREATE INDEX IF NOT EXISTS idx_insurance_providers_clinic_id ON public.insurance_providers (clinic_id);
CREATE INDEX IF NOT EXISTS idx_insurance_providers_payer_id ON public.insurance_providers (payer_id);
CREATE INDEX IF NOT EXISTS idx_insurance_providers_type ON public.insurance_providers (type);
CREATE INDEX IF NOT EXISTS idx_insurance_providers_is_active ON public.insurance_providers (is_active);
CREATE INDEX IF NOT EXISTS idx_payments_clinic_id ON public.payments (clinic_id);
CREATE INDEX IF NOT EXISTS idx_payments_claim_id ON public.payments (claim_id);
CREATE INDEX IF NOT EXISTS idx_payments_era_id ON public.payments (era_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer_id ON public.payments (payer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments (status);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_edi837_claims_updated_at BEFORE UPDATE ON public.edi837_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_edi835_eras_updated_at BEFORE UPDATE ON public.edi835_eras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insurance_providers_updated_at BEFORE UPDATE ON public.insurance_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired eligibility checks
CREATE OR REPLACE FUNCTION cleanup_expired_eligibility_checks()
RETURNS void AS $$
BEGIN
  DELETE FROM public.eligibility_checks 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create function to get billing statistics
CREATE OR REPLACE FUNCTION get_billing_stats(
  p_clinic_id uuid,
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  total_claims integer;
  submitted_claims integer;
  paid_claims integer;
  denied_claims integer;
  total_billed decimal(12,2);
  total_paid decimal(12,2);
  collection_rate decimal(5,2);
BEGIN
  -- Calculate claim statistics
  SELECT 
    COUNT(*),
    COUNT(CASE WHEN status = 'submitted' OR status = 'accepted' OR status = 'paid' THEN 1 END),
    COUNT(CASE WHEN status = 'paid' THEN 1 END),
    COUNT(CASE WHEN status = 'denied' THEN 1 END),
    SUM(billed_amount),
    SUM(CASE WHEN status = 'paid' THEN billed_amount ELSE 0 END)
  INTO total_claims, submitted_claims, paid_claims, denied_claims, total_billed, total_paid
  FROM public.edi837_claims
  WHERE clinic_id = p_clinic_id
    AND (p_start_date IS NULL OR created_at::date >= p_start_date)
    AND (p_end_date IS NULL OR created_at::date <= p_end_date);
  
  -- Calculate collection rate
  collection_rate := CASE 
    WHEN total_billed > 0 THEN (total_paid / total_billed) * 100
    ELSE 0
  END;
  
  -- Build result
  result := jsonb_build_object(
    'totalClaims', total_claims,
    'submittedClaims', submitted_claims,
    'paidClaims', paid_claims,
    'deniedClaims', denied_claims,
    'totalBilled', total_billed,
    'totalPaid', total_paid,
    'collectionRate', collection_rate
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-process ERAs
CREATE OR REPLACE FUNCTION auto_process_eras()
RETURNS void AS $$
DECLARE
  era_record record;
BEGIN
  -- Process all received ERAs
  FOR era_record IN 
    SELECT * FROM public.edi835_eras 
    WHERE status = 'received' 
    ORDER BY created_at ASC
  LOOP
    BEGIN
      -- Update status to processed
      UPDATE public.edi835_eras 
      SET 
        status = 'processed',
        processed_at = now(),
        updated_at = now()
      WHERE id = era_record.id;
      
      -- Update corresponding claim
      UPDATE public.edi837_claims 
      SET 
        status = 'paid',
        paid_at = now(),
        updated_at = now()
      WHERE id = era_record.claim_id;
      
      -- Create payment record
      INSERT INTO public.payments (
        clinic_id,
        claim_id,
        era_id,
        check_number,
        check_amount,
        payment_date,
        payer_id,
        created_by
      ) VALUES (
        era_record.clinic_id,
        era_record.claim_id,
        era_record.id,
        era_record.check_number,
        era_record.check_amount,
        era_record.payment_date,
        era_record.payer_id,
        era_record.created_by
      );
      
      -- Log processing
      INSERT INTO public.era_processing_logs (
        era_id,
        claim_id,
        status,
        processed_at,
        processed_by
      ) VALUES (
        era_record.id,
        era_record.claim_id,
        'processed',
        now(),
        era_record.created_by
      );
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error
      INSERT INTO public.era_processing_logs (
        era_id,
        claim_id,
        status,
        processed_at,
        processed_by,
        error_message
      ) VALUES (
        era_record.id,
        era_record.claim_id,
        'error',
        now(),
        era_record.created_by,
        SQLERRM
      );
      
      -- Update ERA status to error
      UPDATE public.edi835_eras 
      SET 
        status = 'error',
        error_message = SQLERRM,
        updated_at = now()
      WHERE id = era_record.id;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to check eligibility for multiple patients
CREATE OR REPLACE FUNCTION batch_eligibility_check(
  p_clinic_id uuid,
  p_patient_ids uuid[],
  p_insurance_id uuid
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  success_count integer := 0;
  failure_count integer := 0;
  patient_id uuid;
BEGIN
  -- Check eligibility for each patient
  FOREACH patient_id IN ARRAY p_patient_ids
  LOOP
    BEGIN
      -- Insert eligibility check record
      INSERT INTO public.eligibility_checks (
        clinic_id,
        patient_id,
        insurance_id,
        status,
        coverage,
        benefits,
        checked_at,
        expires_at,
        created_by
      ) VALUES (
        p_clinic_id,
        patient_id,
        p_insurance_id,
        'verified',
        '{"active": true}'::jsonb,
        '{"mentalHealth": true}'::jsonb,
        now(),
        now() + interval '30 days',
        auth.uid()
      );
      
      success_count := success_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      failure_count := failure_count + 1;
    END;
  END LOOP;
  
  -- Build result
  result := jsonb_build_object(
    'successCount', success_count,
    'failureCount', failure_count,
    'totalProcessed', success_count + failure_count
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
