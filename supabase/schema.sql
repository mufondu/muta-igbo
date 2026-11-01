-- Mụta Igbo: Supabase schema. Run once in the Supabase SQL editor.
-- Parents sign in (Google or email/password). Child profiles live INSIDE the parent's
-- app_state document, so children never have their own login.

-- 1) One synced state document per parent account.
create table if not exists public.app_state (
  user_id           uuid primary key references auth.users (id) on delete cascade,
  state             jsonb  not null,
  client_updated_at bigint not null default 0,          -- ms since epoch, set by the app
  updated_at        timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "app_state: read own" on public.app_state;
create policy "app_state: read own"   on public.app_state for select using (auth.uid() = user_id);
drop policy if exists "app_state: insert own" on public.app_state;
create policy "app_state: insert own" on public.app_state for insert with check (auth.uid() = user_id);
drop policy if exists "app_state: update own" on public.app_state;
create policy "app_state: update own" on public.app_state for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "app_state: delete own" on public.app_state;
create policy "app_state: delete own" on public.app_state for delete using (auth.uid() = user_id);

-- Lets a signed-in parent permanently delete their own account. The client cannot delete
-- auth users directly, so this runs as the function owner. app_state and usage_events rows
-- are removed automatically by their ON DELETE CASCADE foreign keys.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- 2) Usage events for interest/engagement stats. Names of children must NEVER go in props.
create table if not exists public.usage_events (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  event      text not null check (char_length(event) <= 64),
  props      jsonb not null default '{}'::jsonb check (pg_column_size(props) <= 2048),
  created_at timestamptz not null default now()
);

create index if not exists usage_events_event_time on public.usage_events (event, created_at desc);
create index if not exists usage_events_user_time  on public.usage_events (user_id, created_at desc);

alter table public.usage_events enable row level security;

-- Parents can write their own events and read them back. Aggregate stats are read by YOU
-- in the SQL editor (it bypasses RLS). Do not create a public VIEW over this table: views
-- run as their owner and would expose every user's events through the API.
drop policy if exists "usage_events: insert own" on public.usage_events;
create policy "usage_events: insert own" on public.usage_events for insert with check (auth.uid() = user_id);
drop policy if exists "usage_events: read own" on public.usage_events;
create policy "usage_events: read own"   on public.usage_events for select using (auth.uid() = user_id);
