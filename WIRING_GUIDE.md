# Rihla Frontend — Wiring Guide

> **Audience:** Ahmed (implementation owner of `Rihla-frontend`).
> **Goal:** Convert the static, Figma-generated UI into a fully functional, live application connected to the real Rihla backend.
> **Status of this app:** This is a design-accuracy prototype. All screens, data, and navigation are **hardcoded**. This guide maps every screen to a real API endpoint and gives the exact request/response shapes to wire in.

Successful wiring = every screen shows **live data** + **real auth** replaces the `go()` navigator mock, with loading / empty / error states handled.

---

## 1. Architecture Target

Keep the existing structure — the design is correct. Wire *around* it rather than rewriting it.

```
src/
  app/
    App.tsx            # screen/page router (keep the visualization)
    page.tsx           # <App /> entry (keep)
    layout.tsx         # imports styles (keep); add providers
  lib/api/             # ALREADY CORRECT pattern — reuse as-is
    client.ts          # axios + 401 refresh interceptor
    config.ts          # getApiBaseUrl() + timeouts
    token-manager.ts   # access-token persistence + logout
    index.ts           # barrel
    types.ts           # ApiResponse<T>, AuthTokens, etc.
```

### Required: point the API at the real backend
The only config you must change:

```ts
// .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

The Core-Server base URL is `http://localhost:3000/api`. All endpoint paths below are **relative to that** (no `/api` prefix needed — it's already in the base).

### Required: add real state & auth guards
Your `lib/api` already handles token persistence (`rihla_access_token`) and auto-refresh on `401`. You **do not** need to rewrite it. You *do* need:

- a global auth store (mirror `rihla-client/src/lib/stores/auth-store.ts`) holding `{ accessToken, refreshToken, user, set(), logout() }`
- a small `AuthGuard` wrapper: if no token → redirect to `login`; on `tokenManager` 401 logout → redirect to `login`.
- **Normalize response envelope**: the API returns `{ success: boolean, data: T, message? }`. Your current `apiClient` returns raw axios; wrap or destructure `response.data.data`.

---

## 2. Base Endpoint Map (Core-Server)

| Area | Endpoint (relative to `/api`) | Methods |
|---|---|---|
| Auth | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password` | POST |
| Profile | `/users/me` | GET, PATCH |
| Chat / Rafiq | `/chat`, `/chat/conversations`, `/chat/conversations/:id/messages` | POST / GET |
| Safety | `/safety/events`, `/safety/sources` | GET |
| Currency | `/currency/rates`, `/currency/info` | GET |
| Quests / badges | `/journeys`, `/journeys/:slug`, `/journeys/:slug/start`, `/journeys/:slug/steps/complete` | GET / POST |
| Wallet | `/tokens/wallet`, `/tokens/transactions`, `/token-packages`, `/payments/intention`, `/wallet/confirm` | GET / POST |
| Memory | `/memory/history`, `/memory/preferences`, `/memory/summary` | GET |
| Geo | `/geo/governorates`, `/geo/sites-by-governorate`, `/geo/country`, `/geo/pois`, `/geo/search` | GET |
| Admin | `/admin/stats`, `/admin/users`, `/admin/audit-logs`, `/admin/payments`, `/admin/ai-usage`, `/admin/system/health` | GET/PATCH/POST |

Secondary (independent services):
- Monument catalog: static JSON `/egymonuments.clean.json` (served from `public/`)
- Emergency contacts: static JSON `/Emergency_Contacts.json` (from `public/`)

---

## 3. Screen → Endpoint Matrix

Each row = **his component → real datasource → request → response → UI state handling**.

### 3.1 Landing (`WebLanding`)
- **Datasource:** static marketing content — **no API**. Keep hardcoded copy/stats.
- **Actionable buttons:** `go("signup")`, `go("login")` → these become real `router.push`/navigation now, **only after a successful auth**.

### 3.2 Sign Up (`WebSignUp` — 2 steps)
- `POST /auth/register`
- **Body (step 1):**
  ```jsonc
  { "display_name": "Sara Al-Rashid", "email": "sara@example.com", "password": "..." }
  ```
- **Body (step 2 — travel profile, merged onto step 1):**
  ```jsonc
  { "nationality": "German", "gender": "FEMALE", "travel_style": "Explorer" }
  ```
  The Core `register` accepts `nationality`, `gender` (`"MALE" | "FEMALE"`), `travel_style` among others; `language` array of 2-char codes, `budget_level`, `interests`, `accommodation_type`, `arrival_date`/`departure_date` (`ISO-8601`).
- **Response:** `{ success, user: { id, email, display_name, ... , xp: 0, level: 1 }, tokens? }` — persist `user` + tokens in the auth store, then **`go("arrival")`.
- **Auto-grant:** the backend auto-creates an active token wallet + a `GRANT` signup bonus on registration. Show "Welcome +{SIGNUP_TOKEN_GRANT} tokens" if desired.
- **"Continue with Google":** no Google OAuth endpoint yet — **hide or disable** (or mark `coming soon`).

### 3.3 Login (`WebLogin`)
- `POST /auth/login`
- **Body:** `{ "email": "...", "password": "..." }`
- **Response:** `{ accessToken, refreshToken, user }` → store tokens, then **`go("home")`**.
- Handle `401` → "Invalid credentials" inline error.
- **Forgot password:** `POST /auth/forgot-password` `{ email }` → into an actual reset flow page (`/auth/reset-password` with `token`).

### 3.4 Arrival (`WebArrival` — first 24hrs)
- This is a **marketing/onboarding wizard**. The `WEB_TIPS` array is **content**, so it stays static.
- **Optional:** persist user's completion — no endpoint today. Otherwise fully static; the final button `Unlock Egypt` → `go("home")` (protected).

### 3.5 App shell + TopBar (`AppShell`, `TopBar`)
- **User identity** for the sidebar footer ("Sara … Level 4", avatar initial) → `GET /users/me` → `displayName`, `xp`, `level`. Load once on mount, store in auth store.
- **Location chip** (`Giza Plateau, Cairo`, lat/lon, accuracy) → optionally from `geoApi.getCurrentPosition`/`/geo/country` + browser geolocation. Best-effort; fall back to static label.

### 3.6 Home (`PageHome`)
- **Site grid** (`ALL_SITES.slice(0,4)`) → **static** `egymonuments.clean.json` (keep the built-in curated list), not the API. `SiteCard` link → `goSite(id)`.
- **"Ask Rafiq"** → opens `RafiqDrawer` (see §3.11).
- **Safety snapshot / local tip** → `GET /safety/events` (top 1 + `location`) and `GET /safety/sources` (live source count).

### 3.7 Explore (`PageExplore`)
- **Map + sites** → `geoClient` (base `http://localhost:8000/api/v1`): `GET /geo/governorates`, `GET /geo/sites-by-governorate?governorate=...`, `GET /geo/country`, plus static `egymonuments.clean.json` fused by name.
- **Search/filter** by governorate → local filter over the fused list.
- **Site list row** (`SiteCard` list) → same fused monument data.

### 3.8 Site Detail (`PageSiteDetail`)
- **Site fields** → the matching record from `/egymonuments.clean.json` (by `siteId`): title, images, description/story, `coordinates`.
- **"Ask Rafiq"** → `RafiqDrawer` (see §3.11).
- **"Nearby sites"** → same fused list filtered by `coordinates` distance (or `geo` `nearby`).

### 3.9 History / Journey journal (`PageHistory`)
- **Goal:** replace the mocked [`HISTORY`, stories, `rafiqNote`, XP] array.
- **Primary:** `GET /memory/history` → `TripHistory[]` (`id, title, destination, startDate, endDate, itinerary?, notes`).
- **XP / level / badges** → from `GET /users/me` (`xp`, `level`) + `GET /journeys` (quest progress) → joined as a "journey" timeline.
- Keep journal styling; bind rows to the returned data.

### 3.10 Wallet (`PageWallet`)
- **Balance + spend** → `GET /tokens/wallet` `{ balance, status }`, `GET /tokens/transactions?page=1&limit=20` `{ items: [ { id, type, source, tokens, createdAt, referenceId } ] }`.
- **Packages grid** → `GET /token-packages` `[ { id, name, code, tokens, price, popular } ]`.
- **Purchase** → `POST /payments/intention` → `data.checkoutUrl` → redirect; then `POST /confirm` with `paymentId`.
- **Live EGP rates** → `GET /currency/rates`.
- **Refer to your existing working pattern** for the share/auth-refresh logic.

### 3.11 Rafiq — AI Chat (`PageRafiq`, `RafiqDrawer`)
- **Replace `INITIAL_MSGS` + `CANNED_RESPONSES`** with the real chat API.
- **Chat endpoint:** `POST /chat`
  - Request `{ "message": "...", "conversation_id": "uuid?", "persona": "auto", "user": {...profile}, "history": [...] }`
  - Server appends `user_journeys` and context automatically.
  - Response: `{ data : { reply, conversation_id, ... } }` — see real `chatApi.createMessage`.
- **Conversation list:** `GET /chat/conversations` → `[ { id, title, createdAt } ]`.
- **Persona selection** (`Auto/TourGuide/LocalExpert/SafetyGuru`) → sent as `persona` field on each chat request.
- **Autional:** if the server supports SSE streaming, switch to `text/event-stream`; otherwise render the single `reply`.
- **AI attribution footer** ("15 live sources active") → bind count to `/safety/sources`.

### 3.12 Profile (`PageProfile`)
- **Stats block** → `GET /users/me` (`xp`, `level`).
- **Governorate progress map** → join `/geo/governorates` (visited count) with `/memory/history` destinations.
- **Badges grid (`BADGES`)** → `GET /users/me` include `badges: [{ id, name, description, iconUrl, awardedAt }]` (Core already returns these) OR `GET /journeys` for quest-badge source of truth.
- **"Rafiq queries / conversations"** stat → `GET /chat/conversations?.length`.

### 3.13 Settings (`Settings`)
- **Rafiq persona** → store locally (UI only) OR persist later; today no backend field — keep client-state.
- **Language i18n** (`en`/`ar`) → app-level route `[locale]` + `next-intl` messages; not a backend call.
- **Notification toggles** → `PATCH /users/me` with `preferences` object (backend `UserPreference` row) as best-effort.

### 3.14 Safety (`PageSafety`)
- **Datasource:** `GET /safety/events` (risk events), `GET /safety/sources` (source health list), `GET /scurrency/rates` for the rate note.
- Map the UI risk-gauge → event `severity`; AI guide → `RafiqDrawer` with safety persona.

### 3.15 Emergency Help (`PageEmergency`)
- **Contacts** (`EMERGENCY_NUMBERS`) → static `Emergency_Contacts.json` (`public/`) — includes `126`, `123`, `122`, `180`. Keep the static build hardcoded or fetch the JSON; either works — prefer fetch.
- **SOS + "share location"** → browser geolocation (`navigator.geolocation`) + `tel:` link for the number. No remote API backend required.
- **Arabic phrases** → static (keep).

---

## 4. Data Replacement Cheat-sheet (concrete variables)

| Your file | Hardcoded constant | Replace with |
|---|---|---|
| `App.tsx` (Landing) | hero copy/stats | keep |
| `App.tsx` (SignUp) | form defaults | `POST /auth/register` |
| `App.tsx` (Login) | — | `POST /auth/login` |
| `ALL_SITES` | array of monuments | `geoClient` merged with `egymonuments.clean.json` (`fetch("/egymonuments.clean.json")`) |
| `WEB_TIPS` | static tips | keep |
| `NAV_ITEMS` | static nav | keep (adds routing) |
| `TopBar` location | static string | `GET /geo/...` + geolocation (or keep) |
| `INITIAL_MSGS`/`CANNED_RESPONSES` | canned chat | `POST /chat` |
| `PageHistory` `HISTORY`/`rafiqNote` | mock journal | `GET /memory/history` |
| `PageWallet` rates/spend/packages | mock | `GET /currency/rates`, `/tokens/wallet`, `/tokens/transactions`, `/token-packages` |
| `PageProfile` `BADGES` | mock badges | `GET /users/me` `.badges` + `GET /journeys` |
| `EMERGENCY_NUMBERS` | mock contacts | `fetch("/Emergency_Contacts.json")` (or keep) |
| `PageSafety` events | mock | `GET /safety/events` + `/safety/sources` |
| sidebar username/level | "Sara … Level 4" | `GET /users/me` |
| `PageSiteDetail` content | mock site | fetched monument record (by `siteId`) |

---

## 5. Token / Auth Integration Notes

- Your `tokenManager` already handles `refresh` + re-queue on 401; **wire it to React** by subscribing to localStorage/`rihla:logout` and updating the auth store.
- A user with a valid access token hitting `/users/me` must switch the app from `landing`/`login` to the authenticated `AppShell`. Persist `accessToken` across refreshes (localStorage) and bootstrap `user` via `GET /users/me` on load.
- Protect `Page*,` except `Landing/Login/SignUp/Arrival`. Route protection = the `go()` switcher + `AuthGuard`.

**Recommended setup order (do one screen, verify, move on):**
1. `.env` + real axios base (works from `Landing`→`SignUp`→`Home`).
2. Auth store + `GET /users/me` on mount (sidebar/identity live).
3. Rafiq chat (`PageRafiq`, `RafiqDrawer`) — the center of the companion.
4. Explore/History/Wallet/Profile.
5. Safety/Currency (data) + Emergency (static/geolocation).

---

## 6. Handoff checklist

**You own / implement:**
- Pointing the client at `http://localhost:3000/api`.
- Building an auth store + guards on top of `lib/api`.
- Replacing every hardcoded data array in §3/§4 with the live queries (+ loading / empty / error).
- Mapping persona + i18n.
- Deploying the static JSON (`/egymonuments.clean.json`, `/Emergency_Contacts.json`) from `public/`.

**That I already provide externally:**
- Fully working `src/lib/api/` in this repo (client, config, token-manager, types).
- The complete Core-Server backend at `http://localhost:3000/api` (all endpoints above are live).
- The Geo-Server at `http://localhost:3001` OR fallback monument JSON.
- Design tokens, fonts, and all styling already present in this prototype.

> **Note:** The Core-Server backends **already fully wired** in the monorepo (`WiredClient`-style client) for reference in `rihla-client` — if you're ever unsure of a payload, its `src/lib/api/*.ts` files are the source of truth for exact request/response shapes.