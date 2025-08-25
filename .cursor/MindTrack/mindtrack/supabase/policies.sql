-- ==== RLS AÇ ====
alter table clients      enable row level security;
alter table appointments enable row level security;
alter table notes        enable row level security;
alter table invoices     enable row level security;
alter table files        enable row level security;
alter table audit_logs   enable row level security;

-- ==== CLIENTS ====
drop policy if exists "clients_select" on clients;
create policy "clients_select" on clients
for select using (owner_id = auth.uid());

drop policy if exists "clients_insert" on clients;
create policy "clients_insert" on clients
for insert with check (owner_id = auth.uid());

drop policy if exists "clients_update" on clients;
create policy "clients_update" on clients
for update using (owner_id = auth.uid());

drop policy if exists "clients_delete" on clients;
create policy "clients_delete" on clients
for delete using (owner_id = auth.uid());

-- ==== APPOINTMENTS ====
drop policy if exists "appts_all" on appointments;
create policy "appts_all" on appointments
for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ==== NOTES ====
drop policy if exists "notes_all" on notes;
create policy "notes_all" on notes
for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ==== INVOICES ====
drop policy if exists "invoices_all" on invoices;
create policy "invoices_all" on invoices
for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ==== FILES ====
drop policy if exists "files_all" on files;
create policy "files_all" on files
for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ==== AUDIT_LOGS (sadece kendi loglarını görsün, insert serbest) ====
drop policy if exists "audit_select" on audit_logs;
create policy "audit_select" on audit_logs
for select using (owner_id = auth.uid());

drop policy if exists "audit_insert" on audit_logs;
create policy "audit_insert" on audit_logs
for insert with check (owner_id = auth.uid());

