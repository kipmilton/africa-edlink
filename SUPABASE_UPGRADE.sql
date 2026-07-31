-- Serencog Technologies — platform upgrade migration
-- Run once in the Supabase SQL editor (safe to re-run).

-- =====================================================================
-- 1. COURSE FIELDS (career paths)
-- =====================================================================
create table if not exists public.course_fields (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text default '',
  icon_name text default 'Shield',
  target_audience text not null default 'Adults' check (target_audience in ('Adults','Kids')),
  display_order integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

grant select on public.course_fields to anon;
grant select, insert, update, delete on public.course_fields to authenticated;
grant all on public.course_fields to service_role;

alter table public.course_fields enable row level security;

drop policy if exists "course_fields public read" on public.course_fields;
create policy "course_fields public read" on public.course_fields
  for select to anon, authenticated using (true);

drop policy if exists "course_fields admin write" on public.course_fields;
create policy "course_fields admin write" on public.course_fields
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- 2. COURSES: field, sequencing, difficulty, audience
-- =====================================================================
alter table public.courses add column if not exists field_id uuid references public.course_fields(id) on delete set null;
alter table public.courses add column if not exists step_number integer not null default 1;
alter table public.courses add column if not exists difficulty_level text not null default 'Beginner';
alter table public.courses add column if not exists target_audience text not null default 'Adults';

do $$ begin
  alter table public.courses add constraint courses_difficulty_check
    check (difficulty_level in ('Beginner','Intermediate','Advanced'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.courses add constraint courses_audience_check
    check (target_audience in ('Adults','Kids'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.courses add constraint courses_step_check check (step_number between 1 and 20);
exception when duplicate_object then null; end $$;

create index if not exists courses_field_step_idx on public.courses (field_id, step_number);

-- Seed the launch fields.
insert into public.course_fields (title, slug, description, icon_name, target_audience, display_order)
values
  ('Data Science', 'data-science', 'Analytics, Python and machine learning for African data teams.', 'BarChart3', 'Adults', 1),
  ('Cybersecurity', 'cybersecurity', 'Ethical hacking, SOC operations and digital forensics.', 'Shield', 'Adults', 2),
  ('Full-Stack Software', 'full-stack', 'Modern web engineering from fundamentals to deployment.', 'Code2', 'Adults', 3),
  ('AI Engineering', 'ai-engineering', 'Applied AI, LLMs and production ML systems.', 'Brain', 'Adults', 4),
  ('Kids Tech (7–17)', 'kids-tech', 'Coding, robotics and online safety for young learners.', 'Rocket', 'Kids', 5)
on conflict (slug) do nothing;

-- =====================================================================
-- 3. BILINGUAL MACRO-CLUSTER ROLLING COHORTS
-- =====================================================================
alter table public.cohorts add column if not exists cluster_code text not null default 'EAST_ANG';
alter table public.cohorts add column if not exists language_code text not null default 'en';
alter table public.enrollments add column if not exists cluster_code text not null default 'EAST_ANG';
alter table public.enrollments add column if not exists language_code text not null default 'en';
alter table public.enrollment_drafts add column if not exists language_code text default 'en';

do $$ begin
  alter table public.cohorts add constraint cohorts_cluster_check
    check (cluster_code in ('EAST_ANG','WEST_ANG','WEST_FRA','SOUTH_ANG'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.cohorts add constraint cohorts_language_check check (language_code in ('en','fr'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.enrollments add constraint enrollments_cluster_check
    check (cluster_code in ('EAST_ANG','WEST_ANG','WEST_FRA','SOUTH_ANG'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.enrollments add constraint enrollments_language_check check (language_code in ('en','fr'));
exception when duplicate_object then null; end $$;

-- Composite grouping key = course_id + language_code + cluster_code
create unique index if not exists cohorts_group_number_idx
  on public.cohorts (course_id, language_code, cluster_code, number);
create index if not exists enrollments_group_idx
  on public.enrollments (course_id, language_code, cluster_code);

-- Rolling cohort assignment: fills 5–10 seats then rolls over to N+1.
create or replace function public.assign_grouped_rolling_cohort(
  _course_id text,
  _language_code text,
  _cluster_code text,
  _cohort_size integer default 8
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _size integer := least(10, greatest(5, coalesce(_cohort_size, 8)));
  _cohort_id uuid;
  _next_number integer;
begin
  select c.id into _cohort_id
  from public.cohorts c
  where c.course_id = _course_id
    and c.language_code = _language_code
    and c.cluster_code = _cluster_code
    and coalesce(c.completed, false) = false
    and (
      select count(*) from public.enrollments e where e.cohort_id = c.id
    ) < _size
  order by c.number asc
  limit 1;

  if _cohort_id is not null then
    return _cohort_id;
  end if;

  select coalesce(max(c.number), 0) + 1 into _next_number
  from public.cohorts c
  where c.course_id = _course_id
    and c.language_code = _language_code
    and c.cluster_code = _cluster_code;

  insert into public.cohorts (course_id, number, cluster_code, language_code, completed)
  values (_course_id, _next_number, _cluster_code, _language_code, false)
  returning id into _cohort_id;

  return _cohort_id;
end;
$$;

grant execute on function public.assign_grouped_rolling_cohort(text, text, text, integer) to authenticated, service_role;

-- Realtime for instant admin -> student catalog sync.
do $$ begin
  alter publication supabase_realtime add table public.course_fields;
exception when duplicate_object then null; end $$;