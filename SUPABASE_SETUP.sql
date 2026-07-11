-- =========================================================
-- Afritech Academy — initial Supabase schema
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- (project: jaqfrjhiiphzrtromlxv)
-- =========================================================

-- 1. Roles enum + user_roles table (never store roles on profiles!)
create type public.app_role as enum ('admin', 'tutor', 'student');

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

-- 2. Security definer helper
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "Admins read all roles" on public.user_roles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 3. Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  country text,
  created_at timestamptz not null default now()
);
grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create policy "Profiles publicly readable" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert to authenticated
  with check (auth.uid() = id);

-- 4. Auto-create profile + student role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  insert into public.user_roles (user_id, role) values (new.id, 'student');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- 5. Courses (admin-managed)
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  delivery text not null default 'online' check (delivery in ('online','physical','hybrid')),
  image_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.courses to anon;
grant select on public.courses to authenticated;
grant all on public.courses to service_role;
alter table public.courses enable row level security;

create policy "Published courses are public" on public.courses for select
  using (is_published or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage courses" on public.courses for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- 6. Tutor applications
create table if not exists public.tutor_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  country text,
  specialization text,
  bio text,
  experience text,
  resume_name text,
  resume_size bigint,
  resume_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  assigned_cohort text,
  created_at timestamptz not null default now()
);
grant select on public.tutor_applications to authenticated;
grant all on public.tutor_applications to service_role;
alter table public.tutor_applications enable row level security;

create policy "Admins manage tutor applications" on public.tutor_applications
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Users insert applications" on public.tutor_applications
  for insert to authenticated
  with check (auth.uid() = user_id);

-- 7. Role bootstrap for the three test accounts (run once, after users exist)
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role from auth.users where lower(email) = 'sophia1@gmail.com'
on conflict (user_id, role) do nothing;

insert into public.user_roles (user_id, role)
select id, 'tutor'::public.app_role from auth.users where lower(email) = 'sophia2@gmail.com'
on conflict (user_id, role) do nothing;

-- sophia3 keeps the default 'student' role assigned by the on-signup trigger.

-- 8. Allow admins to also insert user_roles from the client (approve tutor flow)
drop policy if exists "Admins insert roles" on public.user_roles;
create policy "Admins insert roles" on public.user_roles
  for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

-- 9. Enable realtime for tutor_applications so admin dashboards update live.
alter publication supabase_realtime add table public.tutor_applications;
