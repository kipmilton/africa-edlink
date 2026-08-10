-- ============================================================================
-- Serencog Technologies — "Our Team" profiles (management + tutors)
-- Run once in Supabase → SQL Editor (safe to re-run).
-- ============================================================================

create table if not exists public.team_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  role text not null default 'Tutor',
  kind text not null default 'management' check (kind in ('management','tutor')),
  image_url text default '',
  experience text default '',
  email text,
  display_order integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists team_profiles_kind_order_idx on public.team_profiles (kind, display_order);
create unique index if not exists team_profiles_user_idx on public.team_profiles (user_id) where user_id is not null;

grant select on public.team_profiles to anon;
grant select, insert, update, delete on public.team_profiles to authenticated;
grant all on public.team_profiles to service_role;

alter table public.team_profiles enable row level security;

-- Public read for published profiles.
drop policy if exists "team public read" on public.team_profiles;
create policy "team public read" on public.team_profiles
  for select to anon, authenticated using (is_active or public.is_admin());

-- Admins manage every profile (management team included).
drop policy if exists "team admin write" on public.team_profiles;
create policy "team admin write" on public.team_profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Tutors create/edit ONLY their own profile, and only with the 'tutor' kind + role.
drop policy if exists "tutor insert own profile" on public.team_profiles;
create policy "tutor insert own profile" on public.team_profiles
  for insert to authenticated
  with check (user_id = auth.uid() and kind = 'tutor' and role = 'Tutor' and public.is_tutor());

drop policy if exists "tutor update own profile" on public.team_profiles;
create policy "tutor update own profile" on public.team_profiles
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and kind = 'tutor' and role = 'Tutor');

-- Realtime so the public page updates instantly.
do $$ begin
  alter publication supabase_realtime add table public.team_profiles;
exception when duplicate_object then null; end $$;
