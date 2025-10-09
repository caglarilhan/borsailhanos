-- ==== GEREKLİ UZANTILAR ====
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ==== ORTAK SAHİPLİK (owner_id) ====
-- Tüm tablolarda owner_id olacak. Insert'te boş bırakılırsa trigger auth.uid() ile doldurur.

-- ==== TABLOLAR ====
-- Kullanıcı profilleri (abonelik durumu)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null,                  -- auth.uid()
  email text unique,
  is_active boolean default false,
  plan text,                                     -- free, pro, clinic
  renew_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_profiles_user_id on profiles(user_id);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,               -- auth.uid()
  name text not null,
  email text,
  phone text,
  insurance text,
  status text default 'active',
  created_at timestamp with time zone default now()
);

create index if not exists idx_clients_owner_id on clients(owner_id);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  client_id uuid not null references clients(id) on delete cascade,
  date date not null,
  time time not null,
  status text default 'scheduled',
  tele_link text,
  created_at timestamp with time zone default now()
);

create index if not exists idx_appointments_owner_id on appointments(owner_id);
create index if not exists idx_appointments_client_id on appointments(client_id);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  client_id uuid not null references clients(id) on delete cascade,
  type text not null,                        -- SOAP/BIRP/DAP
  content_encrypted text not null,           -- AES-GCM ile şifreleyip yaz
  created_by uuid,                           -- ileride: team üyeleri
  created_at timestamp with time zone default now()
);

-- Not: En az 1 byte şifreli içerik zorunlu (plaintext önleme)
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'notes_content_encrypted_nonempty'
  ) then
    alter table notes add constraint notes_content_encrypted_nonempty check (length(content_encrypted) > 0);
  end if;
end $$;

create index if not exists idx_notes_owner_id on notes(owner_id);
create index if not exists idx_notes_client_id on notes(client_id);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  client_id uuid not null references clients(id) on delete cascade,
  amount numeric not null,
  cpt_code text,                             -- ABD için
  pdf_url text,
  status text default 'unpaid',
  created_at timestamp with time zone default now()
);

create index if not exists idx_invoices_owner_id on invoices(owner_id);
create index if not exists idx_invoices_client_id on invoices(client_id);

create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  client_id uuid references clients(id) on delete set null,
  file_url text not null,
  type text,
  created_at timestamp with time zone default now()
);

create index if not exists idx_files_owner_id on files(owner_id);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,                    -- log da sahibine bağlı
  action text not null,                      -- e.g. CREATE_NOTE
  entity text not null,                      -- e.g. notes:UUID
  meta jsonb default '{}'::jsonb,
  timestamp timestamp with time zone default now()
);

create index if not exists idx_audit_logs_owner_id on audit_logs(owner_id);

-- ==== OWNER_ID OTOMATİK DOLDURAN TRIGGER ====
create or replace function set_owner_id()
returns trigger
language plpgsql
as $$
begin
  if new.owner_id is null then
    new.owner_id := auth.uid();
  end if;
  return new;
end;
$$;

-- Pending appointments queue (self-scheduling için)
create table if not exists pending_appointments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  date date not null,
  time time not null,
  notes text,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- profiles için user_id otomatik doldur
create or replace function set_user_id()
returns trigger
language plpgsql
as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- Tüm tablo ve insert’lere uygula
drop trigger if exists trg_set_user_profiles on profiles;
create trigger trg_set_user_profiles
before insert on profiles
for each row execute function set_user_id();

drop trigger if exists trg_set_owner_clients on clients;
create trigger trg_set_owner_clients
before insert on clients
for each row execute function set_owner_id();

drop trigger if exists trg_set_owner_appointments on appointments;
create trigger trg_set_owner_appointments
before insert on appointments
for each row execute function set_owner_id();

drop trigger if exists trg_set_owner_notes on notes;
create trigger trg_set_owner_notes
before insert on notes
for each row execute function set_owner_id();

drop trigger if exists trg_set_owner_invoices on invoices;
create trigger trg_set_owner_invoices
before insert on invoices
for each row execute function set_owner_id();

drop trigger if exists trg_set_owner_files on files;
create trigger trg_set_owner_files
before insert on files
for each row execute function set_owner_id();

drop trigger if exists trg_set_owner_audit on audit_logs;
create trigger trg_set_owner_audit
before insert on audit_logs
for each row execute function set_owner_id();


-- ==== RLS & POLICIES ====
alter table profiles enable row level security;
alter table clients enable row level security;
alter table appointments enable row level security;
alter table notes enable row level security;
alter table invoices enable row level security;
alter table files enable row level security;
alter table audit_logs enable row level security;

-- profiles: sadece sahibi okuyabilir/güncelleyebilir, insert kendi adına
drop policy if exists p_profiles_select on profiles;
create policy p_profiles_select on profiles for select
  using (user_id = auth.uid());

drop policy if exists p_profiles_insert on profiles;
create policy p_profiles_insert on profiles for insert
  with check (user_id = auth.uid());

drop policy if exists p_profiles_update on profiles;
create policy p_profiles_update on profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- owner_id enforced tablolar: sadece sahibi görebilir/değiştirebilir
drop policy if exists p_clients_select on clients;
create policy p_clients_select on clients for select using (owner_id = auth.uid());
drop policy if exists p_clients_ins on clients;
create policy p_clients_ins on clients for insert with check (owner_id = auth.uid());
drop policy if exists p_clients_upd on clients;
create policy p_clients_upd on clients for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists p_clients_del on clients;
create policy p_clients_del on clients for delete using (owner_id = auth.uid());

drop policy if exists p_appts_select on appointments;
create policy p_appts_select on appointments for select using (owner_id = auth.uid());
drop policy if exists p_appts_ins on appointments;
create policy p_appts_ins on appointments for insert with check (owner_id = auth.uid());
drop policy if exists p_appts_upd on appointments;
create policy p_appts_upd on appointments for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists p_appts_del on appointments;
create policy p_appts_del on appointments for delete using (owner_id = auth.uid());

drop policy if exists p_notes_select on notes;
create policy p_notes_select on notes for select using (owner_id = auth.uid());
drop policy if exists p_notes_ins on notes;
create policy p_notes_ins on notes for insert with check (owner_id = auth.uid());
drop policy if exists p_notes_upd on notes;
create policy p_notes_upd on notes for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists p_notes_del on notes;
create policy p_notes_del on notes for delete using (owner_id = auth.uid());

drop policy if exists p_invoices_select on invoices;
create policy p_invoices_select on invoices for select using (owner_id = auth.uid());
drop policy if exists p_invoices_ins on invoices;
create policy p_invoices_ins on invoices for insert with check (owner_id = auth.uid());
drop policy if exists p_invoices_upd on invoices;
create policy p_invoices_upd on invoices for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists p_invoices_del on invoices;
create policy p_invoices_del on invoices for delete using (owner_id = auth.uid());

drop policy if exists p_files_select on files;
create policy p_files_select on files for select using (owner_id = auth.uid());
drop policy if exists p_files_ins on files;
create policy p_files_ins on files for insert with check (owner_id = auth.uid());
drop policy if exists p_files_upd on files;
create policy p_files_upd on files for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists p_files_del on files;
create policy p_files_del on files for delete using (owner_id = auth.uid());


