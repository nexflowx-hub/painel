# Atlas Global Payments — Worklog

## Task 3-4-5: Backend Architecture Refactoring (Supabase Auth + API V2)

**Date:** 2026-03-05
**Agent:** Code (Task 3-4-5)
**Scope:** Migrate authentication from custom backend to Supabase Auth, update API client for new backend architecture

### Summary

Refactored the Atlas Global Payments Next.js frontend to align with the new backend architecture:
1. **Authentication** migrated from `POST /auth/login` + `POST /auth/logout` + `GET /auth/me` to **Supabase Auth** (signInWithPassword / signUp / signOut / getSession)
2. **API base URL** changed from `https://api-core.nexflowx.tech/api/v1` to `https://api.atlasglobal.digital/api/v1`
3. **All API responses** now auto-unwrapped from `{ data: { ... } }` wrapper in the client `request()` function
4. **Admin routes** added: `/admin/users` and `/admin/payouts/pending`
5. **Health check polling** removed from login page
6. **No more localStorage token management** — Supabase manages its own session tokens

### Files Created

| File | Description |
|------|-------------|
| `src/lib/supabase.ts` | Supabase client with graceful no-op stub when env vars not configured |

### Files Modified

| File | Changes |
|------|---------|
| `src/lib/auth-store.ts` | Complete rewrite: Supabase signInWithPassword/signUp/signOut, removed `api.auth.*` calls, removed localStorage token management, added `register()` + `registerError`, added `getSession()`, `AuthUser` now defined locally with `kyc_level` and `settings` fields |
| `src/lib/api/client.ts` | API Client V2.0: new base URL (`api.atlasglobal.digital`), token from Supabase session, auto-unwraps `{ data: ... }`, removed `auth` export entirely, added `admin` export (listUsers, pendingPayouts), removed `x-api-key` header from deposits, removed `settings.changePassword` |
| `src/lib/api/contracts.ts` | Removed `LoginRequest`, `LoginResponse`, `AuthMeResponse`, `ChangePasswordRequest`, `ChangePasswordResponse`. Updated `UserMeResponse` to inner shape with `kyc_level` + `settings`. Changed `WalletsResponse = Wallet[]`, `StoresResponse = Store[]`, `GatewaysResponse = Gateway[]`, `PaymentLinksResponse = PaymentLink[]`, `ActionTicketsResponse = ActionTicket[]`, `ApiKeysResponse = ApiKey[]`. Added `AdminUser`, `AdminUsersResponse`, `AdminPendingPayout`, `AdminPendingPayoutsResponse`. Updated `DepositResponse`, `CreatePaymentLinkResponse`, `CreateApiKeyResponse` to flat inner shapes |
| `src/hooks/use-wallets.ts` | Updated all hooks to handle unwrapped arrays directly (e.g., `Array.isArray(res)` instead of `res.data`) |
| `src/components/dashboard/login-page.tsx` | Removed health check polling (`/api/health?XTransformPort=3001`), removed `Wifi` icon and backend status indicator, added login/register mode toggle, changed username field to email, added confirm password for registration, uses `authStore.register()` for sign-up |
| `src/components/dashboard/settings-security.tsx` | Password change now uses `supabase.auth.updateUser({ password })` instead of `api.settings.changePassword()`. Removed current password field. NotificationsTab reads `profile.settings` directly (no more `res.data` unwrapping) |
| `src/components/dashboard/api-management.tsx` | Updated base URL display to `api.atlasglobal.digital/api/v1`, removed `/auth/login` endpoint from reference, added admin endpoints (`/admin/users`, `/admin/payouts/pending`) conditionally shown for admin users, updated `ApiKeysResponse` handling for flat array, updated `CreateApiKeyResponse` for flat shape |
| `src/components/dashboard/deposit-widget.tsx` | Fixed `res.data.shareable_url` → `res.shareable_url` after DepositResponse unwrapping |
| `.env` | Updated with `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_ENABLE_DEV_BYPASS` |
| `src/app/api/route.ts` | Replaced with simple status endpoint returning `{ status: "ok", service: "Atlas Global Payments — Frontend", version: "2.0.0", auth: "supabase-jwks" }` |

### Breaking Changes for Callers

- `api.auth` no longer exists (was `api.auth.login`, `api.auth.logout`, `api.auth.me`)
- `api.settings.changePassword` no longer exists (use `supabase.auth.updateUser` instead)
- All response types that previously had `{ data: ... }` wrapper now return the inner type directly
- `AuthUser` type moved from `@/lib/api/contracts` to `@/lib/auth-store`
- Zustand persist key changed from `nexflowx-auth` to `atlas-gp-auth`

### Verified

- ESLint passes with no errors
- TypeScript compilation passes with no new errors (pre-existing errors in unrelated files only)
- Dev server returns 200 on `/`
- DEV BYPASS mode works correctly when Supabase env vars are not configured
