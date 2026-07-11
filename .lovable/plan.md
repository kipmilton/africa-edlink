# Pre-hosting hardening plan

Scope: keep every new feature (rolling cohorts, graduation flow, enrollment wizard, ask&answer, verify page, geo currency), restore the old admin/tutor features that were dropped, switch demo auth to real Supabase auth, move state to the database, and finalize localization + perf.

---

## 1. Real Supabase Auth (replace mock)

- Rewrite `src/lib/use-auth.ts` to wrap `supabase.auth` (subscribe with `onAuthStateChange`, expose `user`, `role`, `signOut`).
- Remove demo credential box from `src/routes/auth.tsx`; sign-in/sign-up call `supabase.auth.signInWithPassword` / `signUp`. Sign-up sets `emailRedirectTo: window.location.origin`.
- Load `role` from `public.user_roles` for the current user. Wire `<Navbar/>` + `dashboard` off real session.
- Keep `signInMock` shim removed; update `enroll/$id` sign-in tab to use real auth.

## 2. Database schema (single migration)

New tables (all in `public` with GRANTs + RLS):

- `profiles(id uuid pk → auth.users, full_name, country, preferred_language, created_at)` + trigger to auto-create on signup.
- `app_role` enum already recommended: `admin | tutor | student | tutor_pending`.
- `user_roles(user_id, role)` — plus `has_role(uuid, app_role)` security-definer function.
- `courses(id, slug, title_en, title_fr, desc_en, desc_fr, what_en, what_fr, whatsnew_en, whatsnew_fr, for_en, for_fr, delivery, image, base_price_usd, cohort_size, created_at)`.
- `cohorts(id, course_id, number, tutor_id nullable, completed bool, created_at)`.
- `cohort_students(cohort_id, student_id)`.
- `enrollments(id, course_id, cohort_id, student_id, full_name, email, phone, education, heard_from, payment_option, status, created_at)`.
- `tutor_applications(id, user_id, full_name, email, expertise, motivation, cv_url, status: pending|approved|rejected, created_at, decided_at)` — status transitions drive tutor role grants.
- `recordings(id, cohort_id, tutor_id, title, url, created_at)`.
- `certifications(id, cohort_id, student_id, status: pending|issued, certificate_url, issued_at)`.
- `chats(id, cohort_id, author_id, body, created_at)`.

RLS: students see own enrollments/certs; tutors see their cohorts + related students/chats/recordings; admins see everything. Public SELECT on `courses` only.

Seed:
- 6 real courses (from `src/lib/courses.ts`).
- 1 full cohort for "Full-Stack Development" with 10 seeded student profiles (auth users created via a `supabase-seed.sql` note — actually seeded through `auth.admin.createUser` in a one-off server function OR the user runs a Supabase snippet we ship).
- Role bootstrap SQL for the 3 test accounts (`sophia1@` admin, `sophia2@` tutor, `sophia3@` student).

## 3. Restored features

- **Careers → tutor application flow**: `/careers` gets an "Apply as tutor" form (signed-in only). Submits to `tutor_applications` with status `pending`.
- **Tutor pending page**: dashboard for a user with a pending application shows "Your application is under review".
- **Admin → Tutor Applications tab**: list pending apps with Approve/Reject. Approve inserts `user_roles(role='tutor')` and marks app approved. Rejection updates status.
- **Tutor → Recordings tab**: form to add recording URL/title. If tutor has no assigned cohort, show "No cohort has been assigned to you yet".
- Keep: Graduate School panel, cohort tutor assignment, ask&answer chat, certificates, verify page.

## 4. Data-driven pages

- `src/lib/app-context.tsx` becomes a thin wrapper around React Query hooks that read from Supabase.
- `courses` list, `courses/$id` detail, `enroll/$id`, `dashboard`, `verify/$id` all fetch via TanStack Query.
- `courses/$id` (Learn More) already exists — restyle as standalone detail page with hero + syllabus.
- Remove localStorage persistence of app state (keep only `serenog.lang` and `serenog.geo` cache).

## 5. Localization + currency

- Default currency: **KES** (not USD). `detectCountry()` still runs; on success we switch. FR-speaking countries → `lang = 'fr'` automatically on first visit if user has no saved pref.
- Update `formatPrice` to accept a `basePriceUSD` and convert; keep FX table.
- Language auto-select list: CI, SN, BJ, TG, BF, ML, NE, CM, GA, CG, CF, TD, GQ, FR → `fr`.

## 6. Performance

- Route-level code splitting is on by default; add `staleTime: 60_000` on read queries; `ensureQueryData` in loaders where safe.
- Lazy-load heavy components (dashboard sub-panels).
- Move `detectCountry()` fetch off the render path (fire-and-forget with cached fallback).
- Replace remote font `<link>` preconnects if missing.

## 7. Test-account role bootstrap

We'll ship an SQL snippet the user runs once in Supabase SQL editor (their existing accounts):

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'::app_role from auth.users where email = 'sophia1@gmail.com'
on conflict do nothing;
insert into public.user_roles (user_id, role)
select id, 'tutor'::app_role from auth.users where email = 'sophia2@gmail.com'
on conflict do nothing;
-- sophia3 keeps default 'student'
```

## 8. Out of scope

- Real payment gateway (still "coming soon" modal).
- Real certificate PDF generation (admin-uploaded file kept).
- Email delivery for tutor approval (in-app status only).

---

## Execution order (single pass)

1. Write `supabase/migrations/*_hardening.sql` with all tables, RLS, GRANTs, `has_role`, seed courses, seed cohort + 10 seed profiles (via `auth.users` inserts is not supported → we insert only into `profiles` with synthetic uuids for display; enrollments seeded against those uuids as "external" students, no auth user rows — this keeps the demo cohort visible without abusing service role).
2. Rewrite `use-auth.ts` for real Supabase.
3. Add `src/lib/db.ts` (typed Supabase queries) + React Query hooks in `src/lib/queries.ts`.
4. Rewrite `app-context.tsx` to only own `{lang, currency, country, t}`.
5. Update `auth.tsx` (real auth, remove demo box).
6. Update `dashboard.tsx` (data from queries, restore tutor apps + recordings panels).
7. Add `careers.tsx` tutor apply form.
8. Update `courses.tsx`, `courses/$id.tsx`, `enroll/$id.tsx`, `verify/$id.tsx` to query DB.
9. Currency default KES + auto FR language.
10. Ship SQL snippet for role assignment in chat.

Confirm and I'll execute in a single sweep.
