## Overview
Turn the current prototype into a functional (mock-backed) app covering role-based auth, localized currency, cohort logic, chat, graduation lifecycle, and public enrollment flows. Everything is client-side using React state + localStorage (no Supabase writes yet) so the demo works end-to-end with the three hardcoded test accounts.

## Scope

### 1. Auth simulation & routing
- Rewrite `src/lib/use-auth.ts` to be a mock auth store backed by localStorage keyed on the three test emails:
  - `sophia1@gmail.com` → admin
  - `sophia2@gmail.com` → tutor
  - `sophia3@gmail.com` → student (customer)
  - Any other email → student
- Password field is accepted but not validated (demo).
- `/auth` page: on submit, sets the mock user and navigates directly to `/dashboard`; dashboard picks the role-specific view automatically.
- Navbar shows public nav when signed out; user chip + sign-out when signed in.
- Ensure every dashboard button/tab wires to real component state (no dead handlers).

### 2. Geolocation currency
- Add `src/lib/currency.ts`:
  - `detectCurrency()` maps country → currency (KE→KES, NG→NGN, GH→GHS, CI/SN/BJ/TG/BF/ML/NE→XOF, CM/GA/CG/CF/TD→XAF, default USD).
  - Country detected via `Intl.DateTimeFormat().resolvedOptions().timeZone` heuristic + fetch to `https://ipapi.co/json/` with graceful fallback; cached in localStorage.
  - `formatPrice(baseUSD, currency)` with static FX rates.
- Currency exposed through `AppContext`.

### 3. Editable courses & cohorts
- Extend `LocalCourse` with `basePriceUSD`, `cohortSize` (5–10), `cohorts: Cohort[]`.
- `Cohort` = `{ id, number, students: Enrollment[], full: boolean, tutorId?: string, completed: boolean }`.
- Admin course modal: add/edit price + cohort size; edit existing courses (not just add).
- Enrollment auto-assigns the next non-full cohort; opens a new one when full.
- Admin "Assign Tutor" action per full cohort → sets `tutorId`.
- Persist state to localStorage.

### 4. Ask & Answer chat
- New component `AskAnswer.tsx` inside student & tutor dashboards.
- Messages stored per cohort in context (`chats: Record<cohortId, Message[]>`).
- Student sees only chats for their cohort; tutor sees chats for cohorts assigned to them.

### 5. Graduate school flow
- Tutor "Mark course as complete" → confirm modal → "Proceed to Certify" → checklist of cohort students → "Submit for Approval" pushes entries to `pendingCertifications` in context.
- Admin "Graduate School" tab: table (student name, course, upload cert file → data URL); "Certify to Submit" moves entry to `certificates`.
- Student "Certificates" tab shows their certificates with a "Share on LinkedIn" button that opens `linkedin.com/sharing/share-offsite/?url=<verify-url>` and a direct link to `/verify/$id`.
- New public route `src/routes/verify.$id.tsx`: institution header/footer + verified badge + certificate image.

### 6. Public course actions
- New route `src/routes/courses.$id.tsx` (Learn More): description, outline, localized price, Enroll Now CTA.
- New route `src/routes/enroll.$id.tsx`:
  - If signed in: enrollment form only.
  - If not: sign-in/create-account tabs above the form (form data preserved).
  - Fields per spec (personal, education, payment radio with detected currency price, Proceed to Payment button).
  - Submit: creates enrollment, assigns to next cohort, opens "Payment Gateway Integration Coming Soon" modal.
- Update "Learn More" / "Enroll Now" buttons across homepage, courses list, course cards.

## Technical notes
- All persistence is `localStorage` (no Supabase writes). The Supabase client stays wired but only for future use — the current SQL setup is retained.
- FX rates are hardcoded constants (USD → KES 129, NGN 1600, GHS 15, XOF 600, XAF 600).
- Country lookup uses `ipapi.co` (no key needed); failure defaults to USD/US.
- Router: new files `courses.$id.tsx`, `enroll.$id.tsx`, `verify.$id.tsx`; `routeTree.gen.ts` will regenerate automatically.
- Dashboard file grows large; will split into per-role subcomponents under `src/components/dashboard/` for maintainability.

## Out of scope
- Real Supabase writes/RLS (kept as future step; SQL file already present).
- Real payment gateway.
- Real certificate PDF generation (uploaded file/image is displayed as-is).
