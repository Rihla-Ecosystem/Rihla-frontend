# FEATURE EXTRACTION AND MIGRATION PLAN

**Project B (analyzed source):** `rihla-client` — an Egypt-focused, AI-driven smart travel assistant (Next.js 16 App Router, React 19, TypeScript, Tailwind v4).
**Migration target:** Project A (the original project whose UI/design is to be preserved) — apply Project B's features, backend integrations, and business logic while keeping Project A's look and feel.

This document is the complete blueprint for extracting every feature, API, and architectural pattern from Project B and re-building them inside Project A.

---

## 1. Project B Overview

### 1.1 What this project does
Rihla is a full-stack, bilingual (English/Arabic), AI-assisted travel companion for visitors to Egypt. It pairs an interactive heritage map with an OpenAI-powered conversational assistant (text, voice, and image), live city-level safety intelligence, a currency/denomination reference, an Egyptian monument ticket and pricing catalog, a token-based wallet economy, quest/XP gamification, a rich user profile, and a full admin operations dashboard.

### 1.2 Main purpose
Act as a single "travel concierge" that answers questions, locates heritage sites on a map, surfaces safety advisories with AI briefings, explains Egyptian money, and lets travelers buy monument tickets and token packages — all while building engagement through XP and badges.

### 1.3 Main user experience
A user signs up (with optional traveler preferences), gets a location-aware experience (chat + explore + safety pages), and can switch between conversation personas (Auto, Tour Guide, Local Expert, Safety Guru) via a floating `GlobalBot` or a full `/chat` page. Persistent chrome wraps everything (navbar, footer, mobile nav, emergency contacts, floating bot) and everything is bilingual. Privileged users get an `/admin` suite.

### 1.4 Core features (summary)
- Authentication: register/login/password reset, JWT + refresh, persisted Zustand session.
- Location system: GPS, city defaults, reverse geocoding via the `geo` microservice.
- Interactive Leaflet map: heritage sites, POIs, search-radius circles, governorate boundaries, trip routing.
- AI assistant: text streaming, voice, image identification, personas, conversation history.
- Safety intelligence: city risk score/gauge, alerts feed, source health, AI safety briefing.
- Travel exploration: search/filter by category and governorate, site details, prices, navigation, trip planner.
- Currency reference: coins/banknotes, exchange rates vs USD/EUR/GBP/SAR/AED.
- Wallet & token economy: balance, transactions, token packages with Stripe checkout, payment-result screen.
- Gamification: quests with steps, XP, badges; profile shows XP/level/badges/trip history.
- Admin console: stats, system health, payments, AI usage/limits, geo-point CRUD, users (ban/roles), audit logs.

---

## 2. Complete User Scenarios From Project B

> Each scenario records goal, entry point, steps, involved pages/components/hooks, services, backend endpoints, required data, and the (a) loading, (b) error, (c) empty states.

### 2.1 Register / Onboarding
- **Goal:** Create an account, optionally capturing traveler preferences.
- **Entry:** Landing page → `/auth/register`.
- **Steps:** Fill `displayName` / `email` / `password` / `confirm`; optionally gender, nationality, budgetLevel, travelStyle, interests, accommodationType, arrivalDate, departureDate; submit; view email-verification screen.
- **Pages/components:** `/auth/register`, `RegisterForm`.
- **Hooks:** `authApi.register` (calls `coreClient.post("/auth/register")`), react-hook-form + zod (`registerSchema`).
- **APIs:** `POST /auth/register`.
- **Data:** `RegisterPayload`.
- **Loading:** `isSubmitting` spinner. **Error:** inline `setError`. **Empty:** success "check your email" screen.

### 2.2 Login + Session Restore
- **Goal:** Authenticate and restore the persisted session across reloads.
- **Entry point:** `/auth/login`, or any guarded page after reload.
- **Steps:** Enter `email` / `password` → login → store tokens/user → redirect home → on next load `SessionProvider.hydrate()` restores from `localStorage`; `useMe()` re-validates the profile.
- **Components/Hooks:** `LoginForm`, `SessionProvider`, `useLogin`, `useMe`, `useAuthStore` (+ `hydrate`).
- **APIs:** `POST /auth/login`, `GET /users/me`.
- **Data:** `LoginResponse`, `User`.
- **Loading:** `isSubmitting`. **Error:** invalid-credentials message. **Empty:** none.

### 2.3 Forgot / Reset Password
- **Goal:** Recover access via email token.
- **Steps:** Enter email → success screen → follow link → enter new password with token → success → navigate home.
- **Pages/Components:** `/auth/forgot-password`, `/auth/reset-password`, `ForgotPasswordForm`, `ResetPasswordForm`.
- **APIs:** `POST /auth/forgot-password`, `POST /auth/reset-password` (both use raw `fetch` and `NEXT_PUBLIC_CORE_API_URL`).
- **Data:** `ForgotPasswordInput`, `ResetPasswordInput`.
- **Loading/Error:** `isSubmitting` / `setError`. **Empty:** inline "check your email" screens.

### 2.4 Home / Onboarding
- **Goal:** Land on the welcome page with stats + tooling; optionally complete the onboarding wizard.
- **Steps:** `/` hero (stats, city grid, feature CTAs) → `/onboarding` multi-step flow saves enrichment via `authApi.updateProfile`.
- **Pages:** `/` (`HomePage`), `/onboarding` (wrapped in `AuthGuard`).
- **APIs:** `PATCH /users/me`.
- **Loading/Error:** `Loader2` spinner / inline error. **Empty:** none (largely static hero content).

### 2.5 Chat with Personas (full page)
- **Goal:** Multi-turn, persona-aware AI conversation with optional voice and image input.
- **Entry point:** `/chat`.
- **Steps:** Create/select conversation → type a message (or record voice / upload image) → select persona → stream the reply → see conversation list in sidebar; delete a conversation.
- **Pages:** `/chat`.
- **Components:** `ChatSidebar`, `ChatMessage`, `ChatInput`, `MarkdownContent`.
- **Hooks/store:** `useChatStore` (`sendMessage`, `sendVoice`, `sendImage`, `updateMediaMessage`, `deleteConversation`), `useConversations` / `useDeleteConversation`, `chatApi.*`.
- **APIs:** `GET /chat/conversations`, `POST /chat/messages`, `POST /chat/voice`, `POST /chat/identify`, `DELETE /chat/conversations/:id`.
- **Data:** `ChatMessage`, `Conversation`, `ChatResult`, `VoiceResult`, `IdentifyResult`.
- **Loading:** `isStreaming` shimmer. **Error:** store `error`. **Empty:** `EmptyState` when no messages.

### 2.6 Floating GlobalBot (every page except /chat)
- **Goal:** Quick Q&A without leaving the current page.
- **Entry point:** Any page where `GlobalBot` is mounted (hidden on `/chat`).
- **Behavior:** Picks persona (`auto` everywhere, `safety_guru` on `/safety`) and mode (`explore` / `safety`), sets suggestion chips, opens `LocationBot` that sends text or uses `chatApi.sendMessage` with an optional location.
- **Components:** `GlobalBot`, `LocationBot`.
- **APIs:** `POST /chat/messages`.
- **Data/UX:** Location from `navigator.geolocation` with `DEFAULT_LOCATION` (Cairo) fallback.

### 2.7 Explore Heritage Map
- **Goal:** Discover heritage sites around a location, filter, review details, and build a trip.
- **Entry point:** `/explore`.
- **Steps:** Request location (grant/deny) → choose search radius (1/2/5/10/25 km) → see list/markers → filter by category/governorate → open a site (`SiteCard` / `MonumentCard` with navigation) → choose "Route" and get `getTripPlan` ordered stops.
- **Pages:** `/explore`.
- **Components:** `MapView` (Leaflet), `FitBounds`, `MapClickCatcher`, `SearchBar`, `SiteCard`, `MonumentCard`, `EmptyState`, `ErrorMessage`.
- **Hooks:** `useNearbySites`, `useGovernorates`, `geoApi.getTripPlan`, `useGeoStore`.
- **APIs:** `GET /geo/nearby?lat&lon&radius`, `GET /geo/trip-plan`, `GET /geo/governorates`.
- **Data:** `Site[]`, `GeoPoi[]`, `TripPlan`.
- **Loading:** `Loader2` on map while tiles load. **Error:** `ErrorMessage` (retry). **Empty:** `EmptyState`.

### 2.8 Tickets Catalog
- **Goal:** Review monuments & ticket prices, hours, images; get route to a chosen one.
- **Entry point:** `/tickets` + `TicketMap`.
- **Steps:** Load catalog → filter by governorate/category → select a monument → see prices/hours/images → from current location get route → open monument page externally.
- **Components:** `MonumentCard`, `TicketMap`, filters, `EmptyState`.
- **Hooks:** `egymonumentsApi.getMonuments()` (module-cached `fetch("/egymonuments.clean.json")`), `geoApi.getRoute`.
- **APIs:** `GET /monuments` (static), `GET /geo/route`.
- **Data:** `Monument` catalog: `prices`, `openingHours`, `images`, `url`, `governorate`.
- **Loading:** initial catalog loader. **Error:** loader/retry. **Empty:** search-empty message.

### 2.9 Safety Hub
- **Scenario:** Traveler checks city risk level.
- **Entry point:** `/safety` with optional `?city=` param.
- **Steps:** default Cairo → load `CityRisk` + events + source health → pick city (11 Egypt cities) → animate risk gauge → optionally ask AI for a briefing → expand events.
- **Pages:** `/safety`.
- **Components:** `RiskGauge`, `EventsList`, `SourceHealth`, `SafeGuide`, `AiGuide`.
- **Hooks:** `useRiskSummary`, `useRiskEvents`, `useSourceHealth`, `useCityRisk`, `safetyApi`.
- **APIs:** `GET /safety/city/:city`, `GET /safety/events`, `GET /safety/sources`, plus `POST /chat/messages` for the AI briefing.
- **Data:** `CityRisk`, `SafetyEvent[]`, `SourceHealthEntry[]`.
- **Loading:** spinners; `refetchInterval` 15s (events/risk), 30s (sources). **Error:** inline. **Empty:** "no events".

### 2.10 Wallet / Token Top-Up
- **Goal:** View token balance and history, buy tokens.
- **Entry:** `/wallet` (AuthGuard).
- **Components:** `BalanceCard`, `TransactionList`, `PackageGrid`.
- **APIs:** `GET /tokens/wallet`, `GET /tokens/transactions`, `GET /tokens/packages`, `POST /tokens/packages/:id/purchase`.
- **Data:** `WalletTransaction`, `TokenPackage`.
- **Loading/Error/empty:** spinner / message / `balance=0` state.

### 2.11 Payment Result (redirect back)
- **Entry:** `/payment-result?success=true|false|pending&error=`.
- **Component:** `PaymentResultPage`.
- **API:** `walletApi.getBalance` to show updated balance.
- **States:** success / pending / failed / unknown with appropriate icons.

### 2.12 Quests / Goals / XP
- **Entry:** `/quests` and `/quests/[slug]`; pick quest → start → complete each step → toast `stepsCompleted/xpAwarded/badgesAwarded`.
- **Components:** `QuestCard`, quest detail `step` list, progress /total percentage.
- **Hooks:** `journeysApi.list/get/start/completeStep`.
- **APIs:** `GET /journeys`, `GET /journeys/:slug`, `POST /journeys/:slug/start`, `POST /journeys/:slug/steps/complete`.
- **Data:** `Journey`, `JourneyStep`, `CompleteStepResult`.
- **Loading:** `LoadingSpinner`. **Error:** `ErrorMessage`. **Empty:** "no quests".

### 2.13 Profile
- **Goal:** View own profile (avatar, nationality, gender), badges, XP/level, trip history, quests progress.
- **Entry:** `/profile` (AuthGuard).
- **Components:** `ProfileCard`, `BadgesGrid`, `TripHistory`.
- **Hooks:** `authStore.user` + `authApi.getBadges` + `core.get("/trips")` + `journeysApi.list`.
- **APIs:** `GET /users/:id/badges`, `GET /trips`, `GET /journeys`.
- **Loading / error / empty:** spinner, error fallback, "No badges/trips".

### 2.14 Currency / Money Reference
- **Entry:** `/currency`.
- **Components:** coin/banknote cards, exchange-rate panel (USD/EUR/GBP/SAR/AED), `formatMoney`, `formatRate`.
- **Hooks:** `currencyApi.getRates` / `getInfo` / `getCatalog`.
- **APIs:** `GET /currency/rates?base=EGP`, `GET /currency/info`, `GET /currency/catalog`.

### 2.15 Admin Suite
- **Login as admin →** `AdminGuard` routes to `/admin` dashboard.
- **Dashboard:** `adminApi.getStats` / `getMonthlyStats` / `getAiUsage` → `StatsCards`, charts (Recharts) over Table/chart mode.
- **System health:** `adminApi.getSystemHealth` → service + model status.
- **Payments:** `adminApi.getPayments` pagination + status filter.
- **AI usage:** `adminApi.getAiUsage` token/latency chart.
- **Geo points CRUD:** `geoApi.getAdminSites/create/update/delete`.
- **Users:** `adminApi.getUsers` + `ban/unban/changeRole` (debounced search).
- **Audit:** `adminApi.getAuditLogs` table.
- **Access:** `AdminGuard` enforces `user.role === "admin"`.

---

## 3. Complete Feature Inventory

Each feature: name / description / why / responsible files / dependencies / backend endpoints / data structures / UI strain.

### 3.1 Authentication
- **Login & Signup**
  - Mature email/password login; a rich register captures traveler preferences; JWT + refresh cookie.
  - *Why:* gate premium features + personalize onboarding.
  - *Files:* `src/lib/api/auth.ts`, `src/lib/validations/auth.ts`, `src/components/auth/*`, pages under `src/app/[locale]/auth/*`.
  - *Deps:* `coreClient`, zod, react-hook-form.
  - *Endpoints:* `POST /auth/login`, `POST /auth/register`, `POST /auth/forgot-password`, `POST /auth/reset-password`.
  - *Data:* `User`, `LoginResponse`, `RegisterPayload`.
- **Session management**
  - *Files:* `src/lib/stores/auth-store.ts`, `src/providers/session-provider.tsx`, `src/lib/api/client.ts` (`refreshAccessToken`, 401 retry).
  - Persists `accessToken` + user in localStorage via zustand+persist; `hydrate()` runs once at boot; request interceptor injects Bearer; response interceptor on 401 posts `POST /auth/refresh`` single-flight (waits for a shared `refreshPromise`) with `withCredentials`.
  - *Data:* `AuthState`.

### 3.2 Location system
- *Files:* `src/lib/api/geo.ts`, `src/lib/hooks/use-geo.ts`, `/explore`, `/tickets`, `GlobalBot`.
- Browser `getCurrentPosition`, municipality, radius attach, localStorage latency; reverse geocode.
- *Endpoints:* `GET /geo/geocode/reverse`, `GET /geo/nearby`, `GET /geo/sites`, `GET /geo/trip-plan`, `GET /geo/governorates`.
- *UI:* permission prompts, "Locating…" lob, "denied" cards, radius chips.

### 3.3 Maps & GIS
- *Files:* `src/components/explore/map-view.tsx`, `fit-bounds.tsx`, `map-click-catcher.tsx`, `src/components/tickets/ticket-map.tsx`.
- Leaflet + react-leaflet (dynamically imported, SSR disabled), tile layers, `Marker`/`Popup`/`Polyline`/`Circle` (radius)/`GeoJSON` (boundaries/tooltips).
- *Data:* `Site[]`, `GeoRoute`, `GeoJsonGeometry`.

### 3.4 AI assistant
- *Files:* `src/lib/stores/chat-store.ts`, `src/lib/api/chat.ts`, `components/chat/*`, `GlobalBot`, `LocationBot`.
- Streams via `appendStreamToken`/`finalizeStream`; voice (`sendVoice`, MediaRecorder) and image (`sendImage`) inputs; moderation `blocked`+`reason`; enriched `contextData` (environment/geography/safety/currency).
- *Endpoints:* `GET /chat/conversations`, `POST /chat/messages`, `POST /chat/voice`, `POST /chat/identify`, `DELETE /chat/conversations/:id`.
- *Data:* `ChatSendParams`, `ChatResult`, `VoiceResult`, `IdentifyResult`.

### 3.5 Safety system
- *Files:* `src/lib/api/safety.ts`, safety components, `/safety` page.
- Risk score `low/moderate/high/critical` gauge; events with severity colors; source health status; AI briefing (client builds a `safety_guru` persona prompt).
- *Endpoints:* `GET /safety/city/:city`, `GET /safety/events`, `GET /safety/sources`.

### 3.6 Explore system (sites + monuments)
- Heritage catalog with rich search/filter; monument prices/hours.
- *Files:* `geo.ts`, `egymonuments.ts`, `src/components/explore/*`, `/tickets` page.
- *Endpoints:* `GET /geo/sites`, `GET /geo/nearby`, `GET /monuments` (static), `GET /geo/trip-plan`.
- *Data:* `Site`, `Monument`, `GeoPoi`.

### 3.7 Gamification: quests / XP / badges
- *Files:* `src/lib/api/journeys.ts`, `src/app/[locale]/quests/*`, `src/components/profile/*`, `/profile`.
- Guided tours (journeys) with step completion awarding XP + badges.
- *Endpoints:* `GET /journeys`, `GET /journeys/:slug`, `POST /journeys/:slug/start`, `POST /journeys/:slug/steps/complete`.
- *Data:* `Journey`, `JourneyStep`, `CompleteStepResult` (XP + badges).

### 3.8 Wallet / token economy
- *Files:* `src/lib/api/wallet.ts`, `/wallet`, `BalanceCard`, `TransactionList`, `PackageGrid`, `/payment-result`.
- *Endpoints:* `GET /tokens/wallet`, `GET /tokens/transactions`, `GET /tokens/packages`, `POST /tokens/packages/:id/purchase`.
- *Data:* `BackendTx`→`WalletTransaction`, `BackendPackage`→`TokenPackage` (client mappers).

### 3.9 Currency & money guide
- *Files:* `src/lib/api/currency.ts`, `/currency` page.
- *Endpoints:* `GET /currency/rates?base=EGP`, `GET /currency/info`, `GET /currency/catalog`.

### 3.10 Emergency contacts (global)
- *Files:* `src/components/shared/emergency-contacts.tsx`, `public/Emergency_Contacts.json`.

### 3.11 Admin
- *Files:* `src/lib/api/admin.ts`, `/admin/*`, admin components.
- *Endpoints:* stats, monthly, ai-usage, health, payments, users, ban/unban/role, audit.

---

## 4. API Integration Documentation

Every entry: **Feature | Method | Endpoint | Request → Response | Consumers**.

| Feature | Method | Endpoint | Request → Response | Consumers |
|---|---|---|---|---|
| Login | POST | `/auth/login` | `{email,password}` → `{accessToken,refreshToken,user}` | `auth-api`, `login-form` |
| Register | POST | `/auth/register` | `RegisterPayload` → `{user}` | `register-form` |
| Forgot password | POST | `/auth/forgot-password` | `{email}` | `forgotPwdForm` |
| Reset password | POST | `/auth/reset-password` | `{password,token}` | `resetPwdForm` |
| Who am I | GET | `/users/me` | – → `User` | `useMe`, session hydrate |
| Update profile | PATCH | `/users/me` | `Partial<User>` | `onboarding`, `profile` |
| Badges | GET | `/users/:id/badges` | – → `Badge[]` | `auth-api` (profile) |
| Trips | GET | `/trips` | – → `Trip[]` | `profile` |
| Governorates | GET | `/geo/governorates` | – → `Governorate[]` | `use-governorates` |
| Sites (all/filtered) | GET | `/geo/sites` | `?governorate&category` → `GeoPoi[]` | `explore` |
| Nearby | GET | `/geo/nearby` | `?lat&lon&radius` → `GeoPoi[]` | `use-nearby-sites` |
| Route A→B | GET | `/geo/route` | `?start_lat&start_lon&end_lat&end_lon` → `GeoRoute` | `tickets`, `explore` |
| Trip planner | GET | `/geo/trip-plan` | `{stops...}` → `TripPlan` | `explore` |
| Reverse geocode | GET | `/geo/geocode/reverse` | `?lat&lon` → `{city}` | `explore`, `chat` |
| Geo admin CRUD | GET/POST/PATCH/DELETE | `/geo/sites[...]` | `GeoPoi` | `admin/geo` |
| Conversations | GET | `/chat/conversations` | → `Conversation[]` | `use-conversations` |
| Send message | POST | `/chat/messages` | `{message,persona?,location?,conversation_id?}` → `ChatResult` | `chat-store`, `GlobalBot` |
| Voice message | POST | `/chat/voice` | FormData (audio,mime,persona,location) → `VoiceResult` | `chat-input` |
| Identify image | POST | `/chat/identify` | FormData (file,location) → `IdentifyResult` | `chat-input` |
| Delete conversation | DELETE | `/chat/conversations/:id` | – | `chat-sidebar` |
| Safety events | GET | `/safety/events` | → `SafetyEvent[]` (15s) | `EventsList` |
| Safety sources | GET | `/safety/sources` | → `SourceHealthEntry[]` (30s) | `SourceHealth` |
| City risk | GET | `/safety/city/:city` | → `CityRisk` | `RiskGauge` |
| Wallet balance | GET | `/tokens/wallet` | → `{balance,status}` | `BalanceCard` |
| Transactions | GET | `/tokens/transactions` | → `WalletTransaction[]` | `TransactionList` |
| Token packages | GET | `/tokens/packages` | → `TokenPackage[]` | `PackageGrid` |
| Purchase | POST | `/tokens/packages/:id/purchase` | – → `{checkoutUrl}` | `wareWallet` |
| Journeys | GET | `/journeys` | → `Journey[]` | `quest-list` |
| Journey detail | GET | `/journeys/:slug` | → `Journey` | `quest-detail` |
| Start journey | POST | `/journeys/:slug/start` | – | `quest-detail` |
| Complete step | POST | `/journeys/:slug/steps/complete` | `{step_number}` → `CompleteStepResult` | `quest-detail` |
| Currency rates | GET | `/currency/rates` | `?base=EGP` | `currency` |
| Currency info | GET | `/currency/info` | – | `currency` |
| Currency catalog | GET | `/currency/catalog` | – | `currency` |
| Admin stats | GET | `/admin/stats` | – | `admin-dashboard` |
| Monthly stats | GET | `/admin/stats/monthly` | – | `admin` charts |
| AI usage | GET | `/admin/ai-usage` | – | `admin-ai` |
| System health | GET | `/admin/health` | – | `admin` |
| Payments | GET | `/admin/payments` | `page,limit,status` | `admin-pay` |
| Users list | GET | `/admin/users` | `query,page,limit` | `admin-users` |
| Ban user | POST | `/admin/users/:id/ban` | – | `admin-users` |
| Unban user | DELETE | `/admin/users/:id/ban` | – | `admin-users` |
| Change role | POST | `/admin/users/:id/role` | `{roleId}` | `admin-users` |
| Audit logs | GET | `/admin/audit` | `page,limit` | `admin-audit` |

**Static / JSON:** `GET /egymonuments.clean.json` (module-cached `fetch`), `GET /Emergency_Contacts.json`, `GET /CurrunciesEG.json`.

---

## 5. Project B Architecture Explanation

### 5.1 Folder structure
```
src/
  app/
    layout.tsx                      # ThemeProvider, HTML (RTL-aware)
    [locale]/layout.tsx             # i18n → Query → Session; Navbar/Footer/MobileNav
    [locale]/ (page.tsx, chat, explore, safety, currency, wallet, profile,
               quests, tickets, payment-result, onboarding, auth/*, admin/*)
  components/
    admin/ auth/ chat/ explore/ layout/ profile/ safety/ shared/ wallet/
  lib/
    api/       client.ts (axios), auth, chat, geo, safety, wallet,
               journeys, currency, admin, egymonuments
    hooks/     use-auth, use-geo, use-safety, use-wallet, use-chat, use-admin
    stores/    auth-store, chat-store, geo-store, ui-store
    i18n/      config.ts, request.ts
    utils/     constants, cn, format, coordinates
    validation/ auth.ts (zod)
    types.ts
  providers/   query-provider, session-provider, theme-provider
  middleware.ts  # next-intl locale handling
messages/      en.json, ar.json
scripts/       enrichment + curation scripts
public/images/ logo-dark.svg, logo.svg
```

### 5.2 Component architecture
- Pages are `"use client"` when interactive; server `layout` + `generateMetadata`.
- Leaflet maps dynamically imported with `ssr:false`.
- Shared `EmptyState`, `ErrorMessage`, `LoadingSpinner` reused everywhere.
- Feature components encapsulate their own API calls and data mapping.

### 5.3 Data flow
1. Page (client) → try, identify, and map → `page` (client) → another (React Query) → API client (Axios) → token + refresh interceptors → backend.
2. `useChatStore` performs async actions that call `chatApi` directly (not via query library) because it must stream deltas.
3. Auth: form → `authApi.login` → `setAuth` → persisted via zustand/persist → interceptor reads `accessToken` → 401 → single-flight `refreshPromise`.

### 5.4 State management (two systems)
- **Zustand** for client-owned/persisted state: `auth-store` (persist), `chat-store` (streaming), `geo-store` (map UI), `ui-store` (sidebar flags + locale).
- **React Query** for server-cache state: hooks wrap every GET; `staleTime` 60s, `retry:1`.
- **Middleware** V11 for next-intl locale resolution.

### 5.5 Service layer
- One API object per domain (`authApi`, `geoApi`, ...) sharing a base `client.ts`.
- Two axios instances (`coreClient`, `geoClient`) with base URLs from env and shared interceptors.
- Typed return promises, including client mappers (`mapTransaction`, `mapPackage`).

---

## 6. Migration Plan: Project B → Project A

Targets grouped by priority. Each entry: **what / why / required files / dependencies / integration approach**.

### Tier A — Must migrate (critical)
1. **Authentication + session**
   - *Why:* precondition for all customer-facing and admin features.
   - *Files:* `lib/api/auth.ts`, `lib/stores/auth-store.ts`, `providers/session-provider.tsx`, `lib/api/client.ts`.
   - *Deps:* axios, zustand, react-query.
   - *Integration:* mount SessionProvider in Project A layout; reuse `AuthGuard`/`AdminGuard`; wire env base URLs.
2. **API client + refresh interceptor**
   - *Why:* required by every backend call.
   - *Files:* `client.ts` (two axios instances, bearer + single-flight 401 refresh).
   - *Integration:* keeping both Project A env names; ensure endpoints match Project B backend.
3. **Chat page + streaming**
   - *Why:* highest product value (the AI assistant).
   - *Files:* `api/chat.ts`, `stores/chat-store.ts`, `components/chat/*` (sidebar, input, message, markdown).
   - *Integration:* mount in Project A layout; add persona selector + voice/image input.
4. **Safety hub**
   - *Why:* differentiates and drives letter trust.
   - *Files:* `api/safety.ts`, `/safety` page + gauge/events/sources/AiGuide components.
5. **Geo/Explore map** (Leaflet, nearby, trip).
6. **Quests + Profile (XP, badges, trips)** — retention loop.

### Tier B — Should migrate (strong UX wins)
1. Emergency contacts drawer (single component + JSON).
2. Currency reference & rates.
3. Tickets (monument catalog + map + route).
4. Voice + image assistant inputs.
5. Onboarding wizard.
6. Token wallet (mock purchase flow if business plan).
7. Admin dashboards.

### Tier C — Optional
1. Recharts admin charts.
2. Source-health micro-status UI.
3. Route polyline display.
4. AI `contextData` reveal (environment/geography/safety/currency sources).
5. Persona-aware suggestions via `GlobalBot`.
6. Theming/`next-themes` + RTL/`ar` locales (only if Project A lacks i18n).

---

## 7. Step-by-Step Rebuild Strategy

### Phase 1 — Foundation
- Add deps: `axios`, `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`, `leaflet`, `react-leaflet`, `framer-motion`, `lucide-react`, `recharts`, `react-markdown`.
- Port `client.ts` (core/geo), `auth-store`, `session-provider`, `query-provider`, `auth-guard`, `admin-guard`, `types.ts`, `validations/auth.ts`, `utils/*`.
- Configure middleware for i18n + set env vars.

### Phase 2 — Core experience
- Home + Onboarding.
- Chat page (sidebar, input, streaming, personas, voice/image) behind `AuthGuard`.
- Explore page + Leaflet `MapView` (markers, radius, filters, trip plan).
- `use-geo` hooks + geolocation handling.

### Phase 3 — Advanced
- Safety (risk gauge, event list, AI guide).
- Quests (journeys list/detail, completeStep + XP toast).
- Wallet (balance, packages, purchase redirect, payment-result).
- Currency + Tickets (maps, catalog).
- Admin pages + charts + paywall/ops.

### Phase 4 — Testing
- Verify all APIs against the running backend.
- Mobile/responsive + i18n pass.
- Run `next build`.
- Resolve Leaflet SSR (`dynamic` imports with `ssr:false`).
- Ensure logout invalidates queries and clears persisted stores.

---

## 8. UI Preservation Strategy

Guessing rules for Project A:
- **Keep** Project A's existing components and styling classes; do not swap in Project B counterparts.
- Introduce new behavior through new **hooks/services/stores** imported into existing Project A files.
- **Port the whole API client + stores** (data-layer logic) — do not touch the view layer.
- When a Project A page needs a new section (Safety / Quests / Wallet), reuse the existing wrapper/typography/card kit and only add content snapshots.
- Drive guards from `useAuthStore` inside the layout instead of duplicating nav links.
- Introduce `GlobalBot` only if Project A's chrome allows a floating element; otherwise keep it at page level.
- Do **not** change animations, colors, or typographic choices; adapt todo-status UI to Project A.

---

## 9. Final Implementation Checklist

**Foundation**
- [ ] `package.json` has all backend deps.
- [ ] `lib/api/client.ts` with core/geo instances and token interceptors.
- [ ] `lib/stores/auth-store.ts` + `providers/session-provider`.
- [ ] global `QueryClient` mounted in layout.
- [ ] Types for `User`, `Site`, `Monument`, `Chat`, `Safety`, `Wallet`.
- [ ] `AuthGuard` and `AdminGuard` reachable.

**Features**
- [ ] Register / Login / Password-reset pages.
- [ ] Home + Onboarding wizard.
- [ ] Chat: sidebar, input (text/voice/image), persona, streaming tokens, moderation `blocked` banner.
- [ ] Explore: map + markers + radius + filters + trip route.
- [ ] Tickets: monument card + map route.
- [ ] Safety: risk summary, events, sources, AI guide.
- [ ] Quests: list/detail, start , completeStep + XP toast.
- [ ] Wallet: balance, transactions, packages + purchase redirect + payment-result.
- [ ] Profile: badges, trips, XP/level.
- [ ] Admin: stats, users (ban/role), payments, AI usage, geo CRUD, audit.
- [ ] Currency: rates + catalog.

**Cross-cutting**
- [ ] Emergency contacts component globally mounted.
- [ ] En/Ar locales exported.
- [ ] Consistent error / loading / empty states everywhere.
- [ ] `next build` passes.
- [ ] Env vars set: `NEXT_PUBLIC_CORE_API_URL`, `NEXT_PUBLIC_GEO_API_URL`.