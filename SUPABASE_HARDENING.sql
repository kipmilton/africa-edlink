-- ============================================================================
-- Serencog Technologies — Production hardening + LMS assignment workflow
-- Run once in Supabase → SQL Editor (safe to re-run).
-- Storage buckets must be created first in Supabase → Storage:
--   course-media (PUBLIC), tutor-cvs (PRIVATE), assignments (PRIVATE)
-- ============================================================================

-- ---------------------------------------------------------------- roles / RPC
create or replace function public.is_admin(_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = 'admin');
$$;

create or replace function public.is_tutor(_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('tutor','admin'));
$$;

grant execute on function public.is_admin(uuid) to anon, authenticated;
grant execute on function public.is_tutor(uuid) to anon, authenticated;

-- ------------------------------------------- block self-service role escalation
-- Roles live ONLY in public.user_roles; profiles.role (if present) is mirrored
-- read-only and can never be written by the owning user.
create or replace function public.prevent_role_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin(auth.uid()) then
    return new;
  end if;
  if to_jsonb(new) ? 'role' and (to_jsonb(new)->>'role') is distinct from (to_jsonb(old)->>'role') then
    raise exception 'Only administrators may change roles';
  end if;
  return new;
end;
$$;

do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='profiles' and column_name='role') then
    drop trigger if exists profiles_no_role_escalation on public.profiles;
    create trigger profiles_no_role_escalation
      before update on public.profiles
      for each row execute function public.prevent_role_escalation();
  end if;
end $$;

-- user_roles: admin-only writes, self-read
alter table public.user_roles enable row level security;
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
drop policy if exists "own roles readable" on public.user_roles;
create policy "own roles readable" on public.user_roles
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "admins manage roles" on public.user_roles;
create policy "admins manage roles" on public.user_roles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------- catalog: admin writes
alter table public.course_fields enable row level security;
alter table public.courses enable row level security;
grant select on public.course_fields, public.courses to anon, authenticated;
grant all on public.course_fields, public.courses to service_role;

drop policy if exists "fields public read" on public.course_fields;
create policy "fields public read" on public.course_fields for select to anon, authenticated using (true);
drop policy if exists "fields admin write" on public.course_fields;
create policy "fields admin write" on public.course_fields for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "courses public read" on public.courses;
create policy "courses public read" on public.courses for select to anon, authenticated using (true);
drop policy if exists "courses admin write" on public.courses;
create policy "courses admin write" on public.courses for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- --------------------------------------------------------------- LMS: assets
create table if not exists public.course_assets (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null,
  title text not null,
  kind text not null default 'resource' check (kind in ('syllabus','resource','recording','reference')),
  file_url text not null,
  file_path text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select on public.course_assets to anon, authenticated;
grant insert, update, delete on public.course_assets to authenticated;
grant all on public.course_assets to service_role;
alter table public.course_assets enable row level security;
drop policy if exists "assets read" on public.course_assets;
create policy "assets read" on public.course_assets for select to anon, authenticated using (true);
drop policy if exists "assets staff write" on public.course_assets;
create policy "assets staff write" on public.course_assets for all to authenticated
  using (public.is_tutor()) with check (public.is_tutor());

-- ---------------------------------------------------------- LMS: assignments
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null,
  cohort_id uuid,
  title text not null,
  description text,
  due_date date,
  reference_url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select on public.assignments to authenticated;
grant insert, update, delete on public.assignments to authenticated;
grant all on public.assignments to service_role;
alter table public.assignments enable row level security;
drop policy if exists "assignments read" on public.assignments;
create policy "assignments read" on public.assignments for select to authenticated using (true);
drop policy if exists "assignments staff write" on public.assignments;
create policy "assignments staff write" on public.assignments for all to authenticated
  using (public.is_tutor()) with check (public.is_tutor());

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  student_email text,
  file_url text,
  file_path text,
  note text,
  grade text,
  feedback text,
  status text not null default 'submitted' check (status in ('submitted','graded')),
  submitted_at timestamptz not null default now(),
  graded_at timestamptz,
  unique (assignment_id, student_id)
);
grant select, insert, update on public.assignment_submissions to authenticated;
grant all on public.assignment_submissions to service_role;
alter table public.assignment_submissions enable row level security;
drop policy if exists "submissions read" on public.assignment_submissions;
create policy "submissions read" on public.assignment_submissions for select to authenticated
  using (student_id = auth.uid() or public.is_tutor());
drop policy if exists "submissions student insert" on public.assignment_submissions;
create policy "submissions student insert" on public.assignment_submissions for insert to authenticated
  with check (student_id = auth.uid());
drop policy if exists "submissions student update" on public.assignment_submissions;
create policy "submissions student update" on public.assignment_submissions for update to authenticated
  using (student_id = auth.uid() and status = 'submitted')
  with check (student_id = auth.uid());
drop policy if exists "submissions tutor grade" on public.assignment_submissions;
create policy "submissions tutor grade" on public.assignment_submissions for update to authenticated
  using (public.is_tutor()) with check (public.is_tutor());

-- ------------------------------------------------- tutor applications / RLS
alter table public.tutor_applications enable row level security;
grant select, insert on public.tutor_applications to authenticated;
grant update on public.tutor_applications to authenticated;
grant all on public.tutor_applications to service_role;
drop policy if exists "applicants read own" on public.tutor_applications;
create policy "applicants read own" on public.tutor_applications for select to authenticated
  using (email = auth.jwt() ->> 'email' or public.is_admin());
drop policy if exists "applicants insert own" on public.tutor_applications;
create policy "applicants insert own" on public.tutor_applications for insert to authenticated
  with check (email = auth.jwt() ->> 'email');
drop policy if exists "admins review applications" on public.tutor_applications;
create policy "admins review applications" on public.tutor_applications for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------ enrollments / cohorts
alter table public.enrollments enable row level security;
alter table public.cohorts enable row level security;
grant select on public.cohorts to anon, authenticated;
grant select, insert on public.enrollments to authenticated;
grant all on public.enrollments, public.cohorts to service_role;
drop policy if exists "cohorts read" on public.cohorts;
create policy "cohorts read" on public.cohorts for select to anon, authenticated using (true);
drop policy if exists "cohorts staff write" on public.cohorts;
create policy "cohorts staff write" on public.cohorts for all to authenticated
  using (public.is_tutor()) with check (public.is_tutor());
drop policy if exists "enrollments read own" on public.enrollments;
create policy "enrollments read own" on public.enrollments for select to authenticated
  using (student_email = auth.jwt() ->> 'email' or public.is_tutor());
drop policy if exists "enrollments insert own" on public.enrollments;
create policy "enrollments insert own" on public.enrollments for insert to authenticated
  with check (student_email = auth.jwt() ->> 'email');

-- ------------------------------------------------------------ storage policies
-- course-media: public read, tutor/admin write
drop policy if exists "course media public read" on storage.objects;
create policy "course media public read" on storage.objects for select
  using (bucket_id = 'course-media');
drop policy if exists "course media staff write" on storage.objects;
create policy "course media staff write" on storage.objects for insert to authenticated
  with check (bucket_id = 'course-media' and public.is_tutor());
drop policy if exists "course media staff modify" on storage.objects;
create policy "course media staff modify" on storage.objects for update to authenticated
  using (bucket_id = 'course-media' and public.is_tutor());
drop policy if exists "course media staff delete" on storage.objects;
create policy "course media staff delete" on storage.objects for delete to authenticated
  using (bucket_id = 'course-media' and public.is_admin());

-- tutor-cvs: applicant writes into own folder, admin-only read
drop policy if exists "cv applicant upload" on storage.objects;
create policy "cv applicant upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'tutor-cvs' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "cv admin read" on storage.objects;
create policy "cv admin read" on storage.objects for select to authenticated
  using (bucket_id = 'tutor-cvs' and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text));

-- assignments: students own folder, tutors/admins full read
drop policy if exists "assignment student upload" on storage.objects;
create policy "assignment student upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'assignments' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_tutor()));
drop policy if exists "assignment read" on storage.objects;
create policy "assignment read" on storage.objects for select to authenticated
  using (bucket_id = 'assignments' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_tutor()));
