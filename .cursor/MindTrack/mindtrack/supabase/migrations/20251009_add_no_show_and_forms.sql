-- Client no-show policy table
create table if not exists public.client_no_show_policies (
  client_id uuid primary key references public.clients(id) on delete cascade,
  enabled boolean not null default false,
  fee_cents integer not null default 5000,
  cutoff_hours integer not null default 24,
  updated_at timestamptz not null default now()
);

-- Form templates
create table if not exists public.form_templates (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  name text not null,
  description text,
  version integer not null default 1,
  fields jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_form_templates_clinic on public.form_templates(clinic_id);

-- Form submissions
create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.form_templates(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  submitted_by uuid references public.user_profiles(user_id) on delete set null,
  data jsonb not null,
  signature_data_url text,
  created_at timestamptz not null default now()
);
create index if not exists idx_form_submissions_template on public.form_submissions(template_id);
create index if not exists idx_form_submissions_client on public.form_submissions(client_id);

-- Audit logs (if not exists)
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  action text not null,
  entity text not null,
  meta jsonb,
  timestamp timestamptz not null default now()
);

-- RLS policies (basic allow by clinic linkage) - adjust as needed
alter table public.client_no_show_policies enable row level security;
alter table public.form_templates enable row level security;
alter table public.form_submissions enable row level security;
alter table public.audit_logs enable row level security;

-- Simple permissive policies for initial setup (tighten in prod)
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'client_no_show_policies' and policyname = 'allow_all_dev'
  ) then
    create policy allow_all_dev on public.client_no_show_policies for all using (true) with check (true);
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'form_templates' and policyname = 'allow_all_dev'
  ) then
    create policy allow_all_dev on public.form_templates for all using (true) with check (true);
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'form_submissions' and policyname = 'allow_all_dev'
  ) then
    create policy allow_all_dev on public.form_submissions for all using (true) with check (true);
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'audit_logs' and policyname = 'allow_all_dev'
  ) then
    create policy allow_all_dev on public.audit_logs for all using (true) with check (true);
  end if;
end $$;


