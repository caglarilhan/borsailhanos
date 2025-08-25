-- ==== GEREKLİ UZANTILAR ====
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ==== ORTAK SAHİPLİK (owner_id) ====
-- Tüm tablolarda owner_id olacak. Insert'te boş bırakılırsa trigger auth.uid() ile doldurur.

-- ==== TABLOLAR ====
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

-- Tüm tablo ve insert’lere uygula
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


