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

-- =========================================================
-- Launch update: Supabase-backed courses, enrollments, cohorts
-- Run this section if your project was created from the earlier schema.
-- =========================================================

-- Rich course fields used by the storefront, course details page, and admin editor.
alter table public.courses add column if not exists title_fr text;
alter table public.courses add column if not exists description_fr text;
alter table public.courses add column if not exists what_en text;
alter table public.courses add column if not exists what_fr text;
alter table public.courses add column if not exists whatsnew_en text;
alter table public.courses add column if not exists whatsnew_fr text;
alter table public.courses add column if not exists for_en text;
alter table public.courses add column if not exists for_fr text;
alter table public.courses add column if not exists base_price_usd numeric not null default 800;
alter table public.courses add column if not exists cohort_size integer not null default 8 check (cohort_size between 5 and 10);

-- Course cohorts assigned by admins to tutors.
create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.courses(slug) on delete cascade,
  number integer not null,
  cluster_code text not null default 'EAST_ANG' check (cluster_code in ('EAST_ANG', 'WEST_ANG', 'WEST_FRA', 'SOUTH_ANG')),
  tutor_email text,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (course_id, cluster_code, number)
);

grant select on public.cohorts to authenticated;
grant insert, update on public.cohorts to authenticated;
grant all on public.cohorts to service_role;
alter table public.cohorts enable row level security;

drop policy if exists "Users read cohorts" on public.cohorts;
create policy "Users read cohorts" on public.cohorts
  for select to authenticated using (true);

drop policy if exists "Authenticated create cohorts for enrollment" on public.cohorts;
create policy "Authenticated create cohorts for enrollment" on public.cohorts
  for insert to authenticated with check (true);

drop policy if exists "Admins update cohorts" on public.cohorts;
create policy "Admins update cohorts" on public.cohorts
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Student enrollment applications. Payment is initialized through regional gateway routing,
-- with sandbox/mock fallbacks until production gateway accounts are ready.
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.courses(slug) on delete restrict,
  cohort_id uuid not null references public.cohorts(id) on delete restrict,
  student_email text not null,
  full_name text not null,
  phone text,
  education text,
  heard_from text,
  payment_option text not null default 'full' check (payment_option in ('full', 'partial')),
  payment_amount numeric,
  payment_currency text,
  payment_status text not null default 'skipped' check (payment_status in ('pending', 'skipped', 'paid')),
  country text,
  language text check (language in ('en', 'fr')),
  preferred_language text check (preferred_language in ('en', 'fr')),
  preferred_time text check (preferred_time in ('7-9', '9-11', '11-1', '2-4', '4-5', '5-7')),
  cluster_code text not null default 'EAST_ANG' check (cluster_code in ('EAST_ANG', 'WEST_ANG', 'WEST_FRA', 'SOUTH_ANG')),
  payment_provider text check (payment_provider in ('paystack', 'flutterwave', 'seerbit')),
  transaction_reference text,
  created_at timestamptz not null default now()
);

-- If enrollments already existed from an earlier attempt, bring it up to the launch schema.
alter table public.enrollments add column if not exists course_id text references public.courses(slug) on delete restrict;
alter table public.enrollments add column if not exists cohort_id uuid references public.cohorts(id) on delete restrict;
alter table public.enrollments add column if not exists student_email text;
alter table public.enrollments add column if not exists full_name text;
alter table public.enrollments add column if not exists phone text;
alter table public.enrollments add column if not exists education text;
alter table public.enrollments add column if not exists heard_from text;
alter table public.enrollments add column if not exists payment_option text default 'full';
alter table public.enrollments add column if not exists payment_amount numeric;
alter table public.enrollments add column if not exists payment_currency text;
alter table public.enrollments add column if not exists payment_status text default 'skipped';
alter table public.enrollments add column if not exists country text;
alter table public.enrollments add column if not exists language text;
alter table public.enrollments add column if not exists preferred_language text;
alter table public.enrollments add column if not exists preferred_time text;
alter table public.enrollments add column if not exists cluster_code text not null default 'EAST_ANG';
alter table public.enrollments add column if not exists payment_provider text;
alter table public.enrollments add column if not exists transaction_reference text;
alter table public.enrollments add column if not exists created_at timestamptz not null default now();
alter table public.cohorts add column if not exists cluster_code text not null default 'EAST_ANG';
alter table public.cohorts drop constraint if exists cohorts_course_id_number_key;
alter table public.cohorts drop constraint if exists cohorts_course_id_cluster_code_number_key;
alter table public.cohorts add constraint cohorts_course_id_cluster_code_number_key unique (course_id, cluster_code, number);
alter table public.cohorts drop constraint if exists cohorts_cluster_code_check;
alter table public.cohorts add constraint cohorts_cluster_code_check
  check (cluster_code in ('EAST_ANG', 'WEST_ANG', 'WEST_FRA', 'SOUTH_ANG'));
alter table public.enrollments drop constraint if exists enrollments_cluster_code_check;
alter table public.enrollments add constraint enrollments_cluster_code_check
  check (cluster_code in ('EAST_ANG', 'WEST_ANG', 'WEST_FRA', 'SOUTH_ANG'));
alter table public.enrollments drop constraint if exists enrollments_preferred_language_check;
alter table public.enrollments add constraint enrollments_preferred_language_check
  check (preferred_language is null or preferred_language in ('en', 'fr'));
alter table public.enrollments drop constraint if exists enrollments_preferred_time_check;
alter table public.enrollments add constraint enrollments_preferred_time_check
  check (preferred_time is null or preferred_time in ('7-9', '9-11', '11-1', '2-4', '4-5', '5-7'));
alter table public.enrollments drop constraint if exists enrollments_payment_provider_check;
alter table public.enrollments add constraint enrollments_payment_provider_check
  check (payment_provider is null or payment_provider in ('paystack', 'flutterwave', 'seerbit'));

create table if not exists public.enrollment_drafts (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.courses(slug) on delete restrict,
  student_email text not null,
  student_data jsonb not null default '{}'::jsonb,
  country_code text not null,
  cluster_code text,
  preferred_language text check (preferred_language is null or preferred_language in ('en', 'fr')),
  preferred_time text check (preferred_time is null or preferred_time in ('7-9', '9-11', '11-1', '2-4', '4-5', '5-7')),
  payment_provider text not null check (payment_provider in ('paystack', 'flutterwave', 'seerbit')),
  payment_amount numeric not null,
  payment_currency text not null,
  transaction_reference text not null unique,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  created_at timestamptz not null default now()
);

alter table public.enrollment_drafts add column if not exists cluster_code text;
alter table public.enrollment_drafts add column if not exists preferred_language text;
alter table public.enrollment_drafts add column if not exists preferred_time text;
alter table public.enrollment_drafts drop constraint if exists enrollment_drafts_cluster_code_check;
alter table public.enrollment_drafts add constraint enrollment_drafts_cluster_code_check
  check (cluster_code is null or cluster_code in ('EAST_ANG', 'WEST_ANG', 'WEST_FRA', 'SOUTH_ANG'));
alter table public.enrollment_drafts drop constraint if exists enrollment_drafts_preferred_language_check;
alter table public.enrollment_drafts add constraint enrollment_drafts_preferred_language_check
  check (preferred_language is null or preferred_language in ('en', 'fr'));
alter table public.enrollment_drafts drop constraint if exists enrollment_drafts_preferred_time_check;
alter table public.enrollment_drafts add constraint enrollment_drafts_preferred_time_check
  check (preferred_time is null or preferred_time in ('7-9', '9-11', '11-1', '2-4', '4-5', '5-7'));

grant select, insert, update on public.enrollment_drafts to authenticated;
grant all on public.enrollment_drafts to service_role;
alter table public.enrollment_drafts enable row level security;

drop policy if exists "Users read own enrollment drafts" on public.enrollment_drafts;
create policy "Users read own enrollment drafts" on public.enrollment_drafts
  for select to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or lower(student_email) = lower(auth.jwt()->>'email')
  );

drop policy if exists "Users create own enrollment drafts" on public.enrollment_drafts;
create policy "Users create own enrollment drafts" on public.enrollment_drafts
  for insert to authenticated
  with check (lower(student_email) = lower(auth.jwt()->>'email'));

grant select, insert on public.enrollments to authenticated;
grant all on public.enrollments to service_role;
alter table public.enrollments enable row level security;

drop policy if exists "Users read own enrollments" on public.enrollments;
create policy "Users read own enrollments" on public.enrollments
  for select to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or lower(student_email) = lower(auth.jwt()->>'email')
  );

drop policy if exists "Users create own enrollments" on public.enrollments;
create policy "Users create own enrollments" on public.enrollments
  for insert to authenticated
  with check (lower(student_email) = lower(auth.jwt()->>'email'));

-- Seed/update the initial course catalog in Supabase.
insert into public.courses (
  slug, title, title_fr, description, description_fr, delivery, image_url,
  what_en, what_fr, whatsnew_en, whatsnew_fr, for_en, for_fr, base_price_usd, cohort_size, is_published
) values
  ('fullstack', 'Full Stack Development', 'Développement Full Stack', 'Build production-ready web apps end-to-end with React, Node and PostgreSQL.', 'Créez des applications web complètes avec React, Node et PostgreSQL.', 'online', '', 'Full Stack engineering is the craft of building both the user-facing interface and the server, database and APIs that power it.', 'L''ingénierie Full Stack consiste à construire à la fois l''interface utilisateur et le serveur, la base de données et les APIs qui l''alimentent.', 'Now includes TanStack Start, Server Components and edge deployment to Cloudflare.', 'Inclut désormais TanStack Start, les Server Components et le déploiement edge sur Cloudflare.', 'Aspiring software engineers, bootcamp graduates, and self-taught coders aiming for their first dev role.', 'Futurs ingénieurs logiciels, diplômés de bootcamp et autodidactes visant un premier poste de développeur.', 900, 8, true),
  ('ai', 'Artificial Intelligence', 'Intelligence Artificielle', 'From transformers to LLM agents — ship AI products that work.', 'Des transformeurs aux agents LLM — livrez des produits IA qui fonctionnent.', 'online', '', 'AI is the discipline of building systems that perceive, reason and act on data the way humans would.', 'L''IA est la discipline de construction de systèmes qui perçoivent, raisonnent et agissent comme des humains.', 'Updated with multimodal models, retrieval-augmented generation and agentic workflows.', 'Mis à jour avec les modèles multimodaux, RAG et les workflows agentiques.', 'Developers, researchers and product builders ready to integrate AI into real apps.', 'Développeurs, chercheurs et créateurs prêts à intégrer l''IA dans de vraies apps.', 1200, 8, true),
  ('ml', 'Machine Learning', 'Apprentissage Automatique', 'Master regression, classification, and modern deep learning pipelines.', 'Maîtrisez la régression, la classification et le deep learning moderne.', 'physical', '', 'Machine Learning is teaching computers to find patterns and make predictions without being explicitly programmed.', 'Le ML consiste à apprendre aux machines à trouver des motifs et à prédire sans être explicitement programmées.', 'Hands-on MLOps tracks with Vertex AI and Hugging Face spaces.', 'Modules MLOps pratiques avec Vertex AI et Hugging Face.', 'Data-curious developers, analysts moving into modeling, and STEM graduates.', 'Développeurs curieux des données, analystes en transition et diplômés STEM.', 1100, 8, true),
  ('analytics', 'Data Analytics', 'Analyse de Données', 'SQL, dashboards and storytelling for business decisions.', 'SQL, tableaux de bord et storytelling pour les décisions métier.', 'online', '', 'Data Analytics is the practice of turning raw data into insights stakeholders can act on.', 'L''analyse de données transforme les données brutes en insights exploitables.', 'New modules on Power BI, Looker Studio and African market case studies.', 'Nouveaux modules sur Power BI, Looker Studio et études de cas africaines.', 'Business professionals, marketers and ops leads who want data fluency.', 'Professionnels métier, marketeurs et chefs ops voulant maîtriser la donnée.', 700, 8, true),
  ('ds', 'Data Science', 'Science des Données', 'Python, statistics and modelling to extract value from data.', 'Python, statistiques et modélisation pour valoriser la donnée.', 'physical', '', 'Data Science blends statistics, programming and domain expertise to solve real-world problems with data.', 'La science des données mêle statistiques, programmation et expertise métier pour résoudre des problèmes réels.', 'Refreshed capstones on fintech fraud detection and agritech yield prediction.', 'Projets renouvelés en détection de fraude fintech et prédiction agritech.', 'Engineers, statisticians and researchers moving into data-driven roles.', 'Ingénieurs, statisticiens et chercheurs en transition vers la data.', 1000, 8, true),
  ('cyber', 'Cybersecurity', 'Cybersécurité', 'Defend systems, run red-team exercises and earn industry certs.', 'Défendez les systèmes, menez des exercices red team et certifiez-vous.', 'online', '', 'Cybersecurity is the practice of protecting systems, networks and data from digital attacks.', 'La cybersécurité protège les systèmes, réseaux et données contre les attaques numériques.', 'New labs on cloud security, mobile-money fraud and SOC playbooks.', 'Nouveaux labs sur la sécurité cloud, fraude mobile money et playbooks SOC.', 'IT professionals, sysadmins and developers focused on secure software.', 'Professionnels IT, sysadmins et développeurs axés sur la sécurité.', 950, 8, true)
on conflict (slug) do update set
  title = excluded.title,
  title_fr = excluded.title_fr,
  description = excluded.description,
  description_fr = excluded.description_fr,
  delivery = excluded.delivery,
  what_en = excluded.what_en,
  what_fr = excluded.what_fr,
  whatsnew_en = excluded.whatsnew_en,
  whatsnew_fr = excluded.whatsnew_fr,
  for_en = excluded.for_en,
  for_fr = excluded.for_fr,
  base_price_usd = excluded.base_price_usd,
  cohort_size = excluded.cohort_size,
  is_published = excluded.is_published,
  updated_at = now();

alter publication supabase_realtime add table public.courses;
alter publication supabase_realtime add table public.cohorts;
alter publication supabase_realtime add table public.enrollments;
alter publication supabase_realtime add table public.enrollment_drafts;
