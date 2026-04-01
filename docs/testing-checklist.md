# Golf Charity Subscription Platform - Testing Checklist

## 1) Test setup

### Environment
- App URL: http://localhost:3000
- Supabase project connected
- `NEXT_PUBLIC_SUPABASE_URL` configured
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` configured
- `ADMIN_EMAILS` configured with at least one admin account
- `NEXT_PUBLIC_WINNER_PROOF_BUCKET` bucket exists in Supabase Storage

### Accounts
- Admin account: email included in `ADMIN_EMAILS`
- Subscriber account A: active subscription
- Subscriber account B: active subscription
- Subscriber account C: inactive subscription (for access checks)

## 2) Required pass/fail matrix

Use this table during QA execution.

| ID | Scenario | Expected Result | Status | Notes |
|---|---|---|---|---|
| T01 | Signup works | User can register and reach dashboard |  |  |
| T02 | Login works | Existing user can sign in |  |  |
| T03 | Add score works | Score is added with selected date |  |  |
| T04 | Score limit enforced | Only latest 5 scores are retained |  |  |
| T05 | Draw generates | Admin can generate draft draw (random/algorithmic) |  |  |
| T06 | Matches calculated | Simulation shows 3/4/5 match buckets |  |  |
| T07 | Admin can approve winners | Admin can approve/reject/mark paid with valid transitions |  |  |
| T08 | Charity selectable | Subscriber can choose and save charity |  |  |
| T09 | Dashboard loads | All dashboard sections render without crash |  |  |
| T10 | Mobile responsive | Pages are usable on mobile viewport widths |  |  |

## 3) Auth and access control

### A. Public routes
1. Open `/`.
2. Confirm landing page renders with CTA buttons.
3. Open invalid route (`/unknown-page`).
4. Confirm custom 404 appears.

### B. Signup/login/logout
1. Open `/signup`, create new user.
2. Confirm redirect to `/dashboard`.
3. Logout from dashboard.
4. Confirm redirect to `/login`.
5. Login with same user.
6. Confirm session persists on refresh.

### C. Protected routes
1. In logged-out state, open `/dashboard`.
2. Confirm redirect to `/login`.
3. In logged-out state, open `/admin`.
4. Confirm redirect to `/login`.

### D. Admin guard
1. Login with non-admin account.
2. Open `/admin`.
3. Confirm redirect to `/dashboard`.
4. Login with admin account.
5. Open `/admin` and confirm access is allowed.

## 4) Subscription and payment flow (mock)

1. Open dashboard subscription section.
2. Select Monthly plan.
3. Confirm message indicates mock payment success.
4. Confirm profile subscription status becomes `active`.
5. Confirm renewal date is populated.
6. Confirm latest payment amount and status are visible.
7. Repeat with Yearly plan and confirm renewal date updates.

## 5) Score management

### Input validation
1. Try score below 1 and above 45.
2. Confirm validation errors appear.
3. Try missing date.
4. Confirm validation blocks submission.

### Rolling logic
1. Add 6 valid scores for same user.
2. Confirm list shows only 5 entries.
3. Confirm oldest score is removed.
4. Confirm order is newest first.

## 6) Charity flow

1. Open profile card in dashboard.
2. Select charity via card selector.
3. Set contribution below 10% and attempt save.
4. Confirm validation blocks save.
5. Set contribution between 10-100 and save.
6. Confirm profile reflects selected charity and saved percentage.

## 7) Draw execution flow (admin)

### Draft creation
1. Open admin draw management.
2. Create random draft draw.
3. Confirm draw appears in list with `draft` status.
4. Create algorithmic draft draw (different date).
5. Confirm draw is created successfully.

### Simulation
1. Click Simulate on a draft draw.
2. Confirm pool and tier summary appears.
3. Confirm no winner status changes are persisted by simulation only.

### Execute + publish
1. Click Execute & publish on a draft draw.
2. Confirm winner records are created.
3. Confirm draw status becomes `published`.
4. Confirm jackpot rollover reflects 5-match winner existence.

## 8) Winner verification flow

### Subscriber proof upload
1. Login as winning subscriber.
2. Open dashboard winnings section.
3. Upload screenshot proof.
4. Confirm proof URL is stored and visible.
5. Confirm admin can open proof link from winner table.

### Admin status transitions
1. For a winner in `pending`, click Approve.
2. Confirm status changes to `approved`.
3. For same winner, click Mark paid.
4. Confirm status changes to `paid`.
5. Try invalid transition (for example `rejected` -> `paid`).
6. Confirm operation is blocked with error.
7. Try approving without proof URL.
8. Confirm operation is blocked.

## 9) Data integrity checks

- `profiles.charity_percentage` remains between 10 and 100.
- `scores.score` always between 1 and 45.
- No user has more than 5 score rows after inserts.
- `winners.match_count` only in 3/4/5.
- Draw numbers always length 5 and within range 1-45.

## 10) Responsive and UX checks

Run tests at these viewport widths:
- 360x800
- 390x844
- 768x1024
- 1280x800
- 1440x900

Verify:
- No horizontal overflow on dashboard/admin/landing.
- Buttons remain tappable on touch devices.
- Tables are usable with horizontal scroll on small screens.
- Critical CTAs remain visible above fold where possible.

## 11) Error handling checks

1. Force invalid URL and confirm custom 404 page.
2. Trigger an intentional runtime error in a test branch and confirm global error page with Retry button appears.
3. Confirm users can recover by navigating via fallback links.

## 12) Final sign-off checklist

- All required pass/fail matrix tests marked complete.
- No blockers in auth, score, draw, winner flows.
- Admin module actions are authorization-protected.
- Build and lint succeed.
- Ready for deployment to Vercel + Supabase.
