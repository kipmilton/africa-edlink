-- ============================================================================
-- Serencog Technologies — WIPE ALL TEST DATA (fresh start)
-- Keeps ONLY the admin account kipmilton71@gmail.com.
-- ⚠️  DESTRUCTIVE. Run once in Supabase → SQL Editor.
-- ============================================================================

begin;

-- 1. Application data (order respects foreign keys)
truncate table public.assignment_submissions cascade;
truncate table public.assignments cascade;
truncate table public.course_assets cascade;
truncate table public.certificates cascade;
truncate table public.pending_certifications cascade;
truncate table public.chat_messages cascade;
truncate table public.enrollments cascade;
truncate table public.enrollment_drafts cascade;
truncate table public.cohorts cascade;
truncate table public.tutor_applications cascade;
truncate table public.courses cascade;
truncate table public.course_fields cascade;
truncate table public.team_profiles cascade;

-- 2. Remove every user except the admin
delete from public.user_roles
where user_id <> (select id from auth.users where email = 'kipmilton71@gmail.com');

delete from public.profiles
where id <> (select id from auth.users where email = 'kipmilton71@gmail.com');

delete from auth.users
where email <> 'kipmilton71@gmail.com';

-- 3. Make sure the surviving account is an admin
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'kipmilton71@gmail.com'
on conflict (user_id, role) do nothing;

commit;

-- 4. Clear uploaded test files (optional — run only if you want empty buckets)
-- delete from storage.objects where bucket_id in ('course-media','tutor-cvs','assignments');
