# Project Alignment Plan (Project A → functionally identical to Project B)

> **Goal:** Make Project A (`Rihla frontend`) functionally identical to Project B
> (`WiredClient`, the reference product) in features, flows, backend integrations,
> services, state, data flow and business logic — while keeping **only Project A's UI /
> visual design / styling / layout / design language** (`C` theme tokens, Cormorant
> Garamond serif, MUI/Radix styling).
>
> We do **not** copy B's UI and do **not** wholesale-replace A pages. We rebuild A pages
> using B's behavior with A's styling.
>
> **Priority order:** ① location system → ② map → ③ Home data flow → ④ all user
> scenarios → ⑤ remove unnecessary differences.

## Confirmed User Decisions (2026-08-03)
- **Rafiq / Chat:** Full replace — remove the Rafiq drawer entirely; route all chat through the new B-style chat page (conversation sidebar, streaming, voice, image identify).
- **Home:** Full B landing — `/app` becomes the B-style marketing landing (hero, stats, 3 features, 11 cities, CTA); env/safety/POI surfaces move to dedicated pages.
- **Auth routes:** Keep A's existing `/login` and `/signup` (repointed to B logic); add forgot-password and reset-password pages (do **not** adopt `/auth/*` layout).

---

## 1. Feature Inventory — Missing in A (must add)

| Feature | Where it lives in B | What A must add |
|---|---|---|
| **Onboarding flow** · collects profile (gender, nationality, language, budget, travel style, interests, accommodation, arrival/departure) | `[locale]/onboarding/page.tsx` | New onboarding page + fields backed by `updateProfile` (`PATCH /users/me`) |
| **Chat page (full, with conversation sidebar)** | `[locale]/chat/page.tsx` + `components/chat/*` | Replace A's Rafiq drawer/persona `auto/guide/insider` with B's conversation sidebar, streaming, voice, image-identify, contextData, persona set `auto/tour_guide/local_expert/safety_guru` |
| **Map + interactive location layer** | `components/explore/*` (MapView, monument/site cards, SearchBar), `ListMapView`, `TicketMap` | Interactive Leaflet map with location, governorate+category filtering, radius and trip planning |
| **Currency page** (rates + catalog) | `[locale]/currency/page.tsx` + `api/currency.ts` | New currency page: `TARGET_CURRENCIES [USD,EUR,GBP,SAR,AED]`, 4-dp rates, formatMoney/formatDateTime, coins/banknotes catalog from `CurrunciesEG.json` |
| **Tickets page** (monument catalog + prices + opening hours + route map) | `[locale]/tickets/page.tsx` + `components/tickets/*` + `api/egymonuments.ts` | New tickets page backed by `egymonuments.clean.json` + `getRoute` (OSRM) + `TicketMap` |
| **Quests / Journeys** | `[locale]/quests/page.tsx`, `[locale]/quests/[slug]/page.tsx` + `api/journeys.ts` | New quest list + detail pages: `journeysApi.list/get/start/completeStep`, scam & archaeology categories, sequential step unlock, XP/badge toast |
| **Payment result screen** | `[locale]/payment-result/page.tsx` | New page after package purchase redirect |
| **Full Admin suite** (users, stats, audit-logs, ai-usage, geo, payments, system-health) | `[locale]/admin/*` + `api/admin.ts` + `hooks/use-admin.ts` | Replace A's single admin page with the full admin surface + admin layout/guard |
| **Auth pages** (login/register/forgot/reset) | `[locale]/auth/*` | A currently has `/login`, `/signup`; add forgot/reset flow + route alignment |
| **Consistent AuthGuard wrapper** | `components/layout/auth-guard.tsx` | Adopt in A (A has `ProtectedRoute`; unify) |
| **TanStack Query hooks** | `hooks/use-*.ts` | Adopt query-key-driven data layer for geo/chat/wallet/admin/safety/auth |

---

## 2. Site Comparison — Extra in Project A (mark Remove / Keep / Replace)

| A feature | Location in A | Decision | Rationale |
|---|---|---|---|
| **Dashboard Home under `/app`** (env/safety/POI cards + quick actions) | `src/app/app/page.tsx` (1627 lines) | **Replace** | B's Home is a marketing landing (`/` + `[locale]/` page). User explicitly wants Home to behave like B. Keep A's visual language, but adopt B's landing structure (hero, stats 6,600+/11/3/15, 3 feature cards, 11 cities, CTA). Only proportional sections; drop env+POI dashboards. |
| **Rafiq drawer + `/app/rafiq`** | `rafiqDrawer.tsx`, `app/rafiq/page.tsx` | **Replace** | B uses a dedicated chat page with conversation sidebar, personas `auto/tour_guide/local_expert/safety_guru`, streaming/voice/image. Rebuild as B chat using A styling. |
| **History page** (`/app/history`) | `app/history/page.tsx` | **Keep** | B folds trip history into Profile (`/memory/history`). Keep A's page but source from same endpoint. |
| **Settings page** (`/app/settings`) | `app/settings/page.tsx` | **Keep** | No direct B equivalent; keep as A-only, minor. |
| **Emergency safety** (`/app/safety/emergency`) | `app/safety/emergency/page.tsx` | **Remove→migrate** | B has no separate emergency route; fold into `/safety`/AI-guide. |
| **Arrival page** | `app/arrival/page.tsx` | **Replace** | Superseded by B's onboarding flow. |
| **Site detail** (`/app/sites/[siteId]`) | `app/sites/[siteId]/page.tsx` | **Replace→unify** | B uses `mapPoiToSite` Site model + Explore/tickets as primary; unify detail with B Site shape & `getSite`. |
| **Currency denominations / coin swap (in wallet)** | `walletService` | **Replace** | B uses a dedicated `/currency` page + `currencyApi`; the A wallet currency-converter is replaced by B currency page. |
| **Wallet spend log (localStorage) + ATM mock** | `walletService.addSpendItem/getSpendLog/getNearbyATMs` | **Replace** | B wallet = BalanceCard + TransactionList + PackageGrid via `/tokens/wallet`, `/tokens/transactions`, `/tokens/packages`; remove local spend/ATM mock flows. |
| **Admin filters (single page)** | `app/admin/page.tsx`, `adminService.ts` | **Replace** | Replace with B's multi-route admin + `adminApi`. |
| **Env / Safety home dashboards** | `envService.ts`, `homeService.ts` | **Replace** | Folded into B's `/safety` page & AI-guide; remove from Home. |

---

## 3. Page-by-Page Comparison & Rebuild Guidance

### Root / Public
| Page | B | A (today) | Plan |
|---|---|---|---|
| `/` landing | Marketing landing (hero/stats/features/cities/CTA) | `/src/app/page.tsx` landing (20742b) | Keep A's visual design; align copy/sections to B landing (features → Chat/Explore/Safety; stats 4; 11 cities; CTA). |
| `/login`, `/register` | `[locale]/auth/login`, `[locale]/auth/register` | `/login`, `/signup` | Keep A routes/pages; add flag-powered B auth actions via store; add forgot/reset. |

### Authenticated app
| Page | B | A (today) | Rebuild approach (A styling, B behavior) |
|---|---|---|---|
| Home | `[locale]/page` (landing) | `/app` dashboard | Convert `/app` → landing layout (A visual); move app functions to their pages. |
| Chat | `[locale]/chat` | `/app/rafiq` draw & page | New chat page: sidebar+conversations, personas, streaming, voice, identify. |
| Explore | `[locale]/explore` | `/app/explore` | Rebuild with MapView, radius (1000…25000), categories (heritage+infrastructure), governorates, search, trip planner (nearest neighbor/OSRM fallback). |
| Site detail | Site cards → `getSite` | `/app/sites/[siteId]` | Rebuild to `Site` shape (nameAr, images, rating, visitDuration, bestTime, tips). |
| Tickets | `[locale]/tickets` | none | Add monuments catalog + prices + hours + route map. |
| Currency | `[locale]/currency` | wallet-converter | Add dedicated currency page. |
| Wallet | `[locale]/wallet` (BalanceCard+TxList+Packages) | `/app/wallet` | Rebuild to B data contracts (`/tokens/*`); remove local spend log. |
| Safety | `[locale]/safety` | `/app/safety` | Align to `safetyApi` (city risk, source health, AI guide, events). |
| Profile | `[locale]/profile` (ProfileCard+badges+trips+journeys) | `/app/profile` | Keep A ProfileCard; add badges, trip history (`/memory/history`), journey progress. |
| Quests | `[locale]/quests` + `[slug]` | none | Add. |
| Onboarding | `[locale]/onboarding` | `/arrival` | Add onboarding; repoint arrival. |
| Payment result | `[locale]/payment-result` | none | Add. |
| Admin | `[locale]/admin/*` (6 routes) | `/app/admin` single | Split into 6 routes + admin layout/guard. |

---

## 4. Data Flow & Integration Alignment

### 1) HTTP client (A) → B pattern
- A uses `openapi-fetch` `apiClient` (`/api/client.ts`) + `tokenManager`.
- B uses axios `coreClient` / `geoClient` (`lib/api/client.ts`):
  - `coreClient` base `NEXT_PUBLIC_CORE_API_URL || http://localhost:3000/api`, `withCredentials`, single-flight `POST /auth/refresh`, Bearer injected from store, 401 with `_retried` retry.
  - `geoClient` base `NEXT_PUBLIC_GEO_API_URL || http://localhost:8000/api/v1`, no refresh.
- **Plan:** Introduce A-compatible axios clients mirroring this (keep A's style) or keep openapi-fetch but guarantee equivalent behaviors. Must support: Bearer injection from auth, single-flight refresh, and same endpoints.

### 2) State management
- B: Zustand `persist` stores: `auth-store` (user, accessToken, isAuthenticated, hydrate), `geo-store` (mapCenter `[26.8206,30.8025]`, zoom 7, selectedCategory/governorate, sites, isLoading), `chat-store` (conversations, currentConversationId, messages Record<convId>, persona, isStreaming, contextData, sendMessage/sendVoice/sendImage), `ui-store` (sidebarOpen, contextSidebar, locale).
- A: React Context (`AuthProvider`, `useLocation`) + component state, no client store.
- **Plan:** adopt Zustand stores in A's styling for auth/geo/chat/ui; wire `LocationProvider` into geo-store; expose `useLocation`→geo-store.

### 3) Data layer (queries)
- B: **TanStack Query** hooks per domain (`use-geo`, `use-chat`, `use-wallet`, `use-admin`, `use-safety`, `use-auth`).
- A: imperative services (`services/*.ts`) with `useEffect`.
- **Plan:** A may keep service layer but must match B query-key invalidation & business logic (e.g., setting, list, invalidate). Prefer adding QueryClient to match behavior.

### 4) Domain data contracts to adopt in A
- **Site** (from `types.ts` + `mapPoiToSite`): id, name, nameAr, latitude, longitude, category, governorate, description, images, rating, visitDuration, bestTime, tips.
- **GeoPoi / Governorate** (with GeoJSON `Polygon`/`MultiPolygon` geometry), `TripPlan` (coordinates, distanceMeters, durationSeconds, orderedStops), haversine.
- **Monument** (`egymonuments`): prices (egyptian/foreigner adult/student), opening_hours (summer/winter/ramadan), images, url; alias groups (`ALIAS_GROUPS`) + `normalizeName`, `buildMonumentLookup`.
- **Persona**: `auto|tour_guide|local_expert|safety_guru`. ChatResult incl. `environment/geography/safety/currency` + `blocked/reason`; VoiceResult (`text_…`, `audio_…`, `…_url`), IdentifyResult.
- **WalletTransaction / TokenPackage**: types `granular`; `mapTx` (grant/bonus/refund→reward, adjustment→sign, consume→spend); endpoints `/tokens/wallet`, `/tokens/transactions`, `/tokens/packages`.
- **Journey / JourneyStep / CompleteStepResult**; **SafetyEvent/CityRisk/SourceHealth**; **Admin** records (stats/users/audit/system health/payments/AiUsage); **ExchangeRates / EgyptianCurrency** catalog.
- **auth User**: fields xp/level/role/gender/nationality/language/budgetLevel/travelStyle/interests/accommodationType/arrivalDate/departureDate/isEmailVerified/createdAt.

### 5) Location system
- B explores uses `Navigator.geolocation` with RADIUS_OPTIONS, `LocationStatus idle|locating|granted|denied`, `CITY_TO_GOVERNORATE` map, `DEFAULT_LOCATION {30.0444,31.2357}`.
- A has `LocationProvider`/`useLocation` with status `success`. 
- **Plan:** re-map A's location provider to match B's geo-store/status and coordinate (lat/lon) convention; unify governorate detection (`honorary fallback`).

---

## 5. User Journey Comparison (target = B parity)

| Journey | B | A (today) | Gap |
|---|---|---|---|
| **Register/Login** → Onboarding → main app | `/auth/register·login` → `/onboarding` (profile) → app | `/signup`/`/login` → `/arrival` | Replace arrival with onboarding; unify auth store |
| **Discover & plan** | Home landing → Explore (map, radius, categories, trip) → Site/Ticket | `/app` dashboard → explore | Move to landing+explore |
| **Ask Rafiq** | Home → Chat (sidebar, streaming, voice, image identify) → context guests | `/app/rafiq` drawer | Full chat page |
| **Stay safe** | Safety (city selector, AI guide, events, sources) + quests (scam) | `/app/safety` | Align city/risk/api; add scam quests |
| **Budget & money** | Wallet (tokens/balance/transactions/packages) + Currency + tickets prices | `/app/wallet` + converter | Split into wallet+currency+tickets; real tokens |
| **Progress** | Profile (ProfileCard/badges/trips/journeys) + Quests | `/app/profile` | Add badges/trips/journeys + quests |
| **Purchase flow** | Wallet → package → payment-result | none | Add payment-result |
| **Admin** | Admin layout → users/audit/ai-usage/geo/payments/system-health | single admin | 6 routes + guard |

---

## 6. Architecture migration (A style, B behavior)

- Add `axios` `coreClient`/`geoClient` equivalents with refresh single-flight + Bearer injection.
- Add Zustand stores: `auth-store`, `geo-store`, `chat-store`, `ui-store` (persist keys: `rihla-…`).
- Add TanStack Query provider + `use-*` hooks (or A-style hooks with identical query keys/logic).
- Adopt B page set under A's route aliases, rewriting each with A's `C` theme / Cormorant / tailwind / Radix.

---

## 7. Implementation Order (restaking A)

### Phase 1 — Location & Data Infrastructure
1. Add `coreClient`/`geoClient` (refresh + Bearer + base URLs) in A `lib/api`.
2. Add Zustand `auth-store`, `geo-store`, `chat-store`, `ui-store` + TanStack Query provider.
3. Re-map `LocationProvider`/`useLocation` → B geo statuses/coordinates; wire `geo-store`.
4. Add geo API + hooks (`useGovernorates`, `useSitesByGovernorate`, `useNearbySites`, `useSite`, mutations) mapping to `Site`/`mapPoiToSite`/TripPlan/haversine.

### Phase 2 — Map & Explore
- Build interactive Leaflet MapView (A styling) integrating geo-store + radius + category/governorate filters + trip planner (OSRM + nearest-neighbor fallback).

### Phase 3 — Home data flow
- Convert home (`/app`) to B landing layout/structure (hero + stats + features + cities + CTA) while keeping A's design; remove env/POI dashboard cards (move to their pages). Add per-city drill into explore.

### Phase 4 — All user scenarios
- Onboarding (replaces arrival), wallet (tokens contracts), currency page, tickets page, quests + quest detail + profile badges/trips/journeys, safety city/API, payment-result, auth forgot/reset, chat page view (conversation sidebar + streaming/voice/identify existing service wiring to B persona set).

### Phase 5 — Remove unnecessary differences
- Delete A-only conflicts (arrival, emergency, standalone admin filters, local wallet spend/ATM mocks, currency-in-wallet) and unify wrappers (`OpenAuth`/`safety`), routes, nav.

### Verification
- `npm run build` green after each phase.
- End-to-end parity smoke: register→onboarding→home→explore(map)→chat→tickets→currency→wallet→safety→quests→profile→admin.

---

## Notes / Risks
- No code changes until this plan is confirmed by the user.
- `geoClient` GIS backend (B `localhost:8000/api/v1`) previously had JWT/DB issues — verify against B expectations during Phase 1/2 before map goes live; A may need the same env base.
- Keep A's design language tokens (`C` in `src/lib/constants/theme.ts`) untouched.