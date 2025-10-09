-- Conversations and messages for secure messaging
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) on delete cascade,
  title text,
  created_by uuid references public.user_profiles(user_id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id uuid references public.user_profiles(user_id) on delete cascade,
  role text default 'member',
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid references public.user_profiles(user_id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  content text,
  attachment_url text,
  created_at timestamptz not null default now(),
  read_by jsonb default '[]'::jsonb
);

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='conversations' and policyname='allow_all_dev') then
    create policy allow_all_dev on public.conversations for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='conversation_participants' and policyname='allow_all_dev') then
    create policy allow_all_dev on public.conversation_participants for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='messages' and policyname='allow_all_dev') then
    create policy allow_all_dev on public.messages for all using (true) with check (true);
  end if;
end $$;


