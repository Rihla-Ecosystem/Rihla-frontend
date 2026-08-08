# MIGRATION EXECUTION PLAN

Source: **../WiredClient** (rihla-client, Project B — feature/business-logic reference)
Target: **current directory** (rihla-next, Project A — UI/design preserved)

Scope confirmed by product owner:
1. Currency + Tickets (static catalogs)
2. AI: streaming chat + voice + image identification + personas
3. Admin suite (Core `/admin/*`)

Explicitly NOT in scope: password reset / email-verify (owner declined).

---

## Ground truth (real running backend, verified via curl)

| Service | Base | Live endpoints |
|---|---|---|
| Core | `http://localhost:3000/api` | `/auth/*`, `/users/me`, `/users/{id}/badges`, `/geo/pois`, `/geo/search`, `/env`, `/admin/*` (users, users/{id}/role, users/{id}/ban, token-packages, payments, audit-logs) |
| AI | `http://localhost:3003` | `/chat`, `/chat/stream`, `/voice`, `/identify` |
| GIS | `http://localhost:8005/api/v1` | `/context`, `/nearby-sites`, `/sites`, `/governorates`, `/restricted-zones` |

> Frontend routes to Core via `NEXT_PUBLIC_API_BASE_URL` (`src/api/index.ts`). AI endpoints must be hit directly at `http://localhost:3003` (not proxied by Core OpenAPI).

### Key constraint
A large portion of Project B's documented API (**`/tokens/wallet`, `/journeys/quests`, `/currency/rates`, `/safety/events`**) does **not** exist on the real backend. Project A already implements many features with live sources (wallet uses `open.er-api.com`, safety/env/geo return real API). This plan ONLY extracts features that map to real, reachable endpoints, and ports Project B's *client-side/business logic* (never replacing A's UI).

---

## Migration rules (unchanged from source plan)
- Keep Project A UI unchanged. Never replace A components with B components.
- Extract logic (API clients, services, types, mapping, streaming/voice/image handling) from B.
- Wire logic into A's existing pages/components/styling.
- Add loading/error/empty states everywhere; no fake data.

---

## Phase 1 — Foundation & static catalogs
- [x] Port `public/CurrunciesEG.json`, `public/egymonuments.clean.json` into A `public/`.
- [x] Create `src/services/currencyService.ts` (EGP denominations catalog fetch).
- [x] Create `src/services/monumentsService.ts` (catalog fetch, lookup/alias helper ported from B's `egymonuments.ts`).
- [ ] Add AI base URL to `.env.local` (`NEXT_PUBLIC_AI_API_URL=http://localhost:3003`) — not needed: AI endpoints are served by Core directly.

## Phase 2 — Currency + Tickets (UI via A design)
- [x] Wire currency denominations into the existing Wallet page (coin/banknote cards).
- [x] Wire monument ticket catalog into site detail via name-match enrichment (`applyMonumentToSite`).
- [x] Build + verify.

## Phase 3 — AI assistant (stream + voice + image + personas)
- [x] Upgrade `src/services/chatService.ts`: add `streamMessage`, `voice`, `identify`, `PERSONAS`, `Persona` type (uses A `getAuthHeader` + Core base URL).
- [x] Add types for stream events/`VoiceResult`/`IdentifyResult`.
- [x] Rafiq page + drawer: streaming token render, persona selector, mic (MediaRecorder), image-upload identify.
- [x] Build + verify.

## Phase 4 — Admin suite (Core `/admin/*`)
- [x] Create `src/services/adminService.ts` (users, ban/unban, role, token-packages/status, payments, audit-logs).
- [x] Add `/app/admin` page (gated by role) using A design system.
- [x] Link admin nav item in AppShell (visible only when role matches); route registered in layout.
- [x] Build + verify.

## Phase 5 — Testing
- [x] Remove any remaining mock/fallback fake data only where a real source exists (spend log starts empty; profile no fake fallbacks; journey impact uses real trips/XP).
- [x] Verify loading/error/empty states (admin has stats cards, empty states, refresh).
- [x] Final `npm run build` passes (17 static routes incl. `/app/admin`).

## Phase 6 — UI improvement (A design, real data only)
### A — Rafiq states (`rafiqDrawer.tsx`)
- [x] Persona description blurb under selector.
- [x] "Listening… tap to stop" + recording-seconds timer + REC indicator while mic recording.
- [x] "Uploading image…" banner while identifying + "Identified: {name}" chip on success.
- [x] "Rafiq is thinking…" label under the loading dots (hidden once tokens stream).
- [x] State-aware input placeholder (uploading / recording / ask). Build passed.

### B — Site tickets & opening hours (`SiteBodyLeft.tsx`, site detail page)
- [x] Store matched `Monument` in site detail state and pass to `SiteBodyLeft`.
- [x] "Tickets & Admission" panel (Egyptian/Foreign × Adult/Student, LE prices) from catalog.
- [x] "Opening Hours" panel (Summer / Winter / Ramadan) from catalog.
- [x] Panels hidden when no catalog match (empty/absent state). Build passed.

### C — Profile honesty + travel history (`profile/page.tsx`)
- [x] Removed fake "Sara Al-Rashid", "550" XP fallback, "Jul 2026", "sara@example.com", fake "2,420 EGP"/"12 kg CO₂" impact metrics.
- [x] Render real `historyService.getTrips()` as Travel History with empty state.
- [x] Journey Impact now shows real journeys/XP/badges. Build passed.

### Phase D — Wallet real data (`wallet` page + services)
- [x] Spend log now starts empty (`EMPTY_SPEND_LOG`; `INITIAL_SPEND_LOG` removed), explanatory empty state kept.
- [x] Real `xp` drives the Journey XP card (no fake `badges*150+100`).
- [x] New public `packagesService.getTokenPackages()` → `GET /wallet/packages` (backend contract); Token Packages panel with real prices + "coming soon" empty state. Never uses admin endpoints for users.
- [x] `packagesService.ts` created; `TokenPackage` type. Build passed.

### Phase E — Explore ticket chips + home quick actions
- [x] Explore sites enriched with real monument admission/hours (`monumentLookupRef` + `applyMonumentToSite`).
- [x] Ticket price chip on list rows and grid cards.
- [x] Home quick-actions strip (Explore, Rafiq, Wallet, Profile, Journeys). Build passed.

### Phase F — Admin filters (`admin/page.tsx`)
- [x] Users: name/email search box; count reflects filtered result.
- [x] Token packages: All / Active / Inactive status filter; empty states for both.
- Build passed.

---

## Migration rules respected
- A's `apiClient` (openapi-fetch) stays for Core endpoints. AI service hit directly.
- No Project B React components are imported into A. Only logic/types/services are ported and adapted.
- All new UI uses A's inline-style design system (`C` theme constants, atoms).