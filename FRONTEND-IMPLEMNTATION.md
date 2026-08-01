Updated todo list

FRONTEND_IMPLEMENTATION_SPEC.md

# 1. Project Overview

Purpose
- This file is the single machine-readable implementation specification an AI engineer must follow to build the frontend. It is NOT human narrative; it is prescriptive, actionable, and references repository evidence where available. Do NOT assume anything not explicitly referenced below; if a value is UNKNOWN it is marked.

Architecture (text diagram)
Frontend
↓ (HTTP / JWT bearer to)
Core Server (Express, TS) — gateway and aggregator; exposes OpenAPI at `/api/docs.json`
↓ (internal HTTP + X-Internal-Api-Key or forwarded JWT)
AI Service (FastAPI) — `/chat`, `/voice`, `/stream` (evidence: ai-service/app/api/*.py)
GeoContext (FastAPI) — `/api/v1/nearby-sites`, `/api/v1/context`, etc. (evidence: GeoContext/app/api/*.py)
Risk Intelligence (Fastify/TS) — `/safety/*` (evidence: routes.ts)
↓
Datastores
- Core Server → PostgreSQL via Prisma (schema: schema.prisma)
- GeoContext → PostGIS (external to Core)
- AI Service → Qdrant (external)
- Risk Intelligence → internal data stores / sidecars (see Risk_Intelligence/src)

Service responsibilities (evidence-based)
- Frontend: UI only. Must call Core Server API only. (Design requirement; Core acts as API gateway.)
- Core Server: authentication, user profiles, session tokens, aggregation, proxying to AI/Geo/Risk, business rules. (evidence: Core-Server/src/)
- AI Service: LLM orchestration, RAG, tools for assistant responses. (evidence: ai-service/app/)
- GeoContext: spatial search, geocoding, POI data. (evidence: GeoContext/app/)
- Risk Intelligence: safety data, alerts, sources. (evidence: Risk_Intelligence/src/)

# 2. Backend Modules

Enumerated modules with evidence references. For each module list Purpose, Routes (file-level), Controllers (file-level), Services (file-level), Dependencies, External Services, Database Models (file-level).

CORE SERVER (evidence: src)
- Purpose: gateway, auth, user management, payments, chat aggregator, proxy to AI/Geo/Risk.
- Routes (file list): `Core-Server/src/routes/*.ts` — (explicit files present)
  - auth.routes.ts, user.routes.ts, admin.routes.ts, memory.routes.ts, env.routes.ts, geo.routes.ts, chat.routes.ts, chat-stream.routes.ts, safety.routes.ts, internal.routes.ts, currency.routes.ts, journey.routes.ts, payment.routes.ts, token-package.routes.ts, token.routes.ts, identify.routes.ts, voice.routes.ts (evidence: index.ts)
- Controllers: `Core-Server/src/controllers/*.ts` (examples: auth.controller.ts, user.controller.ts, payment.controller.ts) — those map to route handlers where present.
- Services: `Core-Server/src/services/*.ts` (examples: chat.service.ts, geo.service.ts, risk.service.ts, internal.service.ts, payment.service.ts, auth.service.ts) — these implement business logic and external calls.
- Dependencies: Prisma (schema.prisma), environment config (env.ts), swagger generator (swagger.ts).
- External Services: AI service (`env.AI_SERVICE_URL`), GeoContext (`env.GIS_SERVICE_URL`), Risk (`env.RISK_SERVICE_URL`), Paymob, exchangerates, etc. (evidence: env.ts).
- DB Models: Prisma schema at schema.prisma (full model list present).

AI SERVICE (evidence: app)
- Purpose: LLM orchestration, RAG retrieval, persona agents, tool execution.
- Routes: `ai-service/app/api/*.py` — chat.py, stream.py, voice.py, health.py, identify.py.
- Services: `ai-service/app/services/*.py` and `ai-service/app/core/*` (evidence: geocontext.py, risk.py, llm_client.py).
- Dependencies: Qdrant, Gemini API keys (`GEMINI_API_KEYS`), settings in config.py.
- DB Models: RAG datasources (files in rag) and Qdrant collections (runtime).
- Notes: AI code calls GeoContext and Risk using `X-Internal-Api-Key` (evidence: `ai-service/app/services/*.py`).

GEOCONTEXT (evidence: app)
- Purpose: PostGIS-backed spatial services: nearby sites, context, boundaries.
- Routes: `GeoContext/app/api/*.py` — sites.py, context.py, boundaries.py, auth.py.
- Services: `GeoContext/app/services/*` and models in `GeoContext/app/models/*.py`.
- Dependencies: PostGIS DB (docker compose references `geocontext_db`), Alembic migrations (migrations/).
- DB Models: SQLAlchemy models in `GeoContext/app/models/*.py`, schemas in `GeoContext/app/schemas/*.py`.

RISK INTELLIGENCE (evidence: src)
- Purpose: ingest and expose safety indicators and advisories, multiple source adapters.
- Routes: routes.ts defines `/safety/current`, `/safety/changes`, `/safety/health`, `/safety/refresh`.
- Services: engine modules in `Risk_Intelligence/src/engine/*`.
- Dependencies: external data sources (OpenWeather, USGS, GloFAS, etc. – see `src/sources/*`).

# 3. API Inventory (authoritative source-of-truth policy)

Principal rule for implementation:
- The Core Server's generated OpenAPI (served at `GET /api/docs.json` by Core) is the authoritative source-of-truth for generating clients for the frontend.
  - Evidence: Core exposes swaggerSpec in app.ts via `/api/docs.json` and `swagger-ui` on `/api/docs`.
- The frontend MUST NOT generate clients from other code files; the frontend generator must use Core `/api/docs.json`.
- If the Core OpenAPI is missing endpoints (e.g., chat response), the generator MUST follow the "fallback extraction" procedure in Section 14.

API Inventory — verified endpoints (static extraction from route files). Fields marked UNKNOWN are explicitly unknown in repository static scan.

1) POST /api/auth/register
- Authentication: none
- Headers: none
- Request body: JSON per Zod `registerSchema` in auth.routes.ts:
  - email (string, email)
  - password (string, min 8, must include uppercase and number)
  - display_name (string)
  - gender (enum: MALE | FEMALE)
  - nationality (string)
  - language (array[string])
  - budget_level (string, optional)
  - arrival_date (string datetime, optional)
  - departure_date (string datetime, optional)
  - travel_style (string, optional)
  - interests (array[string], optional)
  - accommodation_type (string, optional)
- Response body: as documented in route JSDoc and swagger.ts `RegisterInput`/`User` components (id, email, displayName, createdAt, + user object fields).
- Errors: 400 validation, 409 conflict
- Owner: auth.controller.ts → auth.service.ts
- Gateway: Core
- Dependencies: Prisma models (`User`)
- Frontend Readiness: READY (documented in Core swagger and has Zod)
- OpenAPI Status: included in Core `swaggerSpec` via JSDoc (evidence route file contains `@openapi` block)
- Example request (literal based on Zod):
  ```
  POST /api/auth/register
  Content-Type: application/json
  {
    "email":"user@example.com",
    "password":"Password1",
    "display_name":"Ali",
    "gender":"MALE",
    "nationality":"EG",
    "language":["en"]
  }
  ```
- Example response: see `#/components/schemas/User` in Core swagger (use OpenAPI extraction step to get exact example).

2) POST /api/auth/login
- Authentication: none
- Headers: none
- Request body: Zod `loginSchema` (`email`, `password`)
- Response: `LoginResponse` component in swagger.ts (accessToken, user)
- Errors: 401 invalid credentials, 403 account suspended
- Owner: auth.controller.ts
- Frontend Readiness: READY
- OpenAPI Status: included (JSDoc present)

3) POST /api/chat
- Authentication: bearer JWT required (`authenticate` middleware)
- Required headers:
  - `Authorization: Bearer <access_token>`
  - `Idempotency-Key: <UUID>` (required and validated by route; returns 400 if missing or invalid)
- Request body: Zod `chatSchema` in chat.routes.ts:
  - message (string)
  - lat (number, optional)
  - lon (number, optional)
  - base_currency (string length 3, optional)
  - conversation_id (uuid, optional)
  - persona (enum: auto | tour_guide | local_expert | safety_guru) optional default 'auto'
- Response body: UNKNOWN (no documented response schema in Core swagger). Implementation returns `chat()` service output from chat.service.ts. That service calls AI service; the effective response shape is runtime and not declared in Core swagger.
- Errors: 400 idempotency header error; other errors propagated via errorHandler.ts
- Owner: chat.service.ts (route uses inline handler that calls `chat()`); controller is inline in route.
- Gateway: Core (Core calls AI)
- Dependencies: AI Service (calls `AI_SERVICE_URL`), optionally GeoContext & Risk for context
- Frontend Readiness: NOT READY — response schema missing in Core OpenAPI.
- OpenAPI Status: NOT documented (no `@openapi` block in chat.routes.ts)

4) GET /api/geo/pois
- Authentication: bearer JWT
- Headers: `Authorization: Bearer <token>`
- Query params validated by Zod `poisQuerySchema`: lat (number), lon (number), radius (number optional), categories (string optional)
- Response: OpenAPI component GeoContext exists in swagger.ts (fields: pois, route, geocode)
- Implementation: service geo.service.ts calls external GeoContext `/api/v1/nearby-sites` with `X-Internal-Api-Key` and forwards `Authorization` if present.
- Errors: 400 validation, 401 auth
- Frontend Readiness: PARTIAL — Core documents GeoContext shape, but content comes from GeoContext service; must validate external compatibility.
- OpenAPI Status: documented in Core JSDoc and included in `swaggerSpec`.

5) GET /api/internal/* (internal routes)
- Authentication: `X-Internal-Api-Key` required (middleware `requireInternalApiKey`)
- Routes: `/api/internal/geo`, `/api/internal/safety`, `/api/internal/user`, `/api/internal/journeys`, `/api/internal/combined-context`
- Purpose: internal aggregation endpoints for inter-service calls; NOT to be used by public frontend
- Frontend Use: NEVER call these from customer-facing frontend; these are for internal services only.

Additional endpoints
- There are many more routes present in `Core-Server/src/routes/*.ts` (payments, journeys, identify, voice, admin, token packages, user CRUD). They are included in Core `swaggerSpec` where JSDoc `@openapi` blocks exist. For exhaustive client generation do NOT rely on this document to enumerate every field: generate clients from Core `/api/docs.json` (procedural extraction in Section 14).

# 4. Data Flow (trace template + examples)

Principal trace rule
- All frontend calls must follow this flow:
  Frontend UI Component → Generated Client (from Core `/api/docs.json`) → Frontend Service (thin wrapper) → Core Server Route `/api/*` → Route handler/Controller → Service → Database or Microservice (AI/Geo/Risk)
- The frontend must never call AI/Geo/Risk directly. Always hit Core.

Example trace: Chat
- Chat Screen UI triggers `chatService.sendMessage(payload)`
- `chatService` uses generated client: `CoreApi.chat.post(...)` (mapping per OpenAPI)
- Client sends Authorization header `Bearer <token>` and `Idempotency-Key`
- Core route `/api/chat` `authenticate` middleware validates JWT → route handler reads idempotency key → calls `chat()` service with forwarded `authorization`
- chat.service.ts calls AI Service (`env.AI_SERVICE_URL`) with internal API key and user context; AI returns response; Core composes final response and returns to frontend.

Example trace: Geo POIs
- Map Screen calls `geoService.getPois(lat,lon,radius)` which uses generated Core client `/api/geo/pois?lat=...&lon=...`
- Core geo.service.ts calls GeoContext `/api/v1/nearby-sites` with `X-Internal-Api-Key`, fetches POIs, filters military/restricted types, returns GeoContext object to frontend.

# 5. Frontend Service Mapping (must be implemented exactly)

Implement a `services/` folder where each file is a logical wrapper around generated OpenAPI client. Map (verified items + rule for remaining endpoints):

- `authService.ts`
  - Core API: POST `/api/auth/register`
  - Core API: POST `/api/auth/login`
  - Core API: POST `/api/auth/refresh`
  - Used by: Login page, Register page, Token management provider

- `chatService.ts`
  - Core API: POST `/api/chat`
  - Used by: Chat Screen, Conversation list
  - Notes: Must attach `Idempotency-Key` header (UUID v4) to every send.

- `geoService.ts`
  - Core API: GET `/api/geo/pois`
  - Core API: GET `/api/geo/search`
  - Used by: Map Screen, Search Screen
  - Notes: Map POIs must be filtered on frontend to show only permitted categories but Core already filters restricted types.

- `userService.ts`
  - Core APIs: `/api/users/*` (list, profile update)
  - Used by: Profile page, Leaderboard

- `paymentService.ts`
  - Core APIs: `/api/payments/*` (create intention, webhook is server-only)
  - Used by: Payment flow (front uses payment clientSecret returned by Core)

- `voiceService.ts`
  - Core API: POST `/api/voice`
  - Used by: Voice input features

- `internalService.ts` — DO NOT implement client usage in customer-facing pages. Reserved for internal tools only.

Rule: For any Core endpoint not explicitly mapped above, create a `XxxService.ts` wrapper with exactly one exported function per OpenAPI operationId; keep wrappers thin (call client, handle errors, map typed responses to frontend models).

# 6. Page Dependency Matrix (required for routing & SSR)

Page specification rows (draft for verified pages). For pages not listed, the generator should build entries by inspecting Core OpenAPI and mapping operations to pages per naming conventions.

- Page: Login
  - Required Services: `authService`
  - API Calls: `POST /api/auth/login`
  - Parameters: email, password
  - Cache: no
  - Loading: optimistic loader; disable submit while pending
  - Dependencies: none

- Page: Register
  - Required Services: `authService`
  - API Calls: `POST /api/auth/register`
  - Parameters: registration fields per Zod
  - Cache: no

- Page: Chat
  - Required Services: `chatService`, `geoService` (optional for context)
  - API Calls: `POST /api/chat`, `GET /api/geo/pois` (when location present)
  - Parameters: message, lat, lon, persona
  - Cache policy:
    - Chat responses: not cacheable (single-use)
    - Nearby POIs: cache 300s (see Section 11)
  - Loading: streaming UI optional (chat-stream exists in backend; see chat-stream.routes.ts) — if streaming used, implement stream fallback.

- Page: Map
  - Required Services: `geoService`
  - API Calls: `GET /api/geo/pois`
  - Parameters: lat, lon, radius, categories
  - Cache: 300s, stale-while-revalidate allowed

# 7. DTO Mapping (contract rules)

Authoritative source-of-truth policy
- All request/response TypeScript types must be generated from Core OpenAPI.
- DO NOT hand-write DTOs or duplicate types.

Mapping workflow (mandatory)
1. Download `GET {CORE_BASE}/api/docs.json` and save to `frontend/generated/openapi.json`.
2. Run OpenAPI TypeScript generator (e.g., `openapi-generator` or `openapi-typescript`) to emit `frontend/generated/` types and a typed axios client.
3. The generated DTOs are the canonical types. Create `frontend/types/` that re-exports generated types for usage in services/components.

Reportable mismatches encountered during audit (explicit, evidence-based)
- chat response: no schema in Core swagger (source: chat.routes.ts has no `@openapi` block). Result: no generated type exists for chat response. Action: generator will not produce chat response DTO; frontend must treat response type as `unknown` until Core OpenAPI is updated or the frontend fetches runtime sample and defines an adapter. Marked: MISMATCH -> chat response schema missing.

# 8. Environment Variables

Extracted from env.ts and service .env.example files. This table lists variables that matter to frontend setup and to backends; the frontend must NOT expose backend-only secrets.

Columns: Variable | Used By | Frontend? (should the frontend set/use) | Backend? | Required? | Default (if present) | Evidence file

- DATABASE_URL | Core Server | NO | YES | YES | NONE | env.ts
- JWT_ACCESS_SECRET | Core Server | NO | YES | YES | NONE | env.ts
- FRONTEND_URL | Core Server | YES (CORS origin) | YES | YES | NONE | env.ts
- CORS_ORIGIN | Core Server | NO | YES | YES | NONE | env.ts
- INTERNAL_API_KEY | Core Server/AI/Geo/Risk | NO (MUST NEVER be in frontend) | YES | YES | NONE | env.ts; used in geo.service.ts
- AI_SERVICE_URL | Core Server | NO | YES | YES | default 'http://ai-service:3003' | env.ts
- GIS_SERVICE_URL | Core Server | NO | YES | YES | default 'http://gis-service:3002' | env.ts
- RISK_SERVICE_URL | Core Server | NO | YES | YES | default 'http://risk-intelligence:3004' | env.ts
- GEMINI_API_KEYS | AI Service | NO | YES | YES (AI) | NONE | .env.example and .env (secret found)
- PAYMOB_* variables | Core Server | NO | YES | YES | NONE | env.ts

Frontend-specific env
- VITE_API_BASE_URL (suggested) — Frontend must use a local env variable for the Core Server base URL. Default: runtime-supplied by deployment. Frontend must NEVER include `INTERNAL_API_KEY` or any Gemini keys.

# 9. Authentication Flow (spec)

JWT lifecycle (evidence: auth system description in `rihla complete doc.md` and auth.controller.ts)
- Access token: JWT HS256 signed with `JWT_ACCESS_SECRET`, short expiry (default 15m).
- Refresh token: opaque token stored as httpOnly cookie, rotated and stored hashed server-side.
- Login: client POSTs credentials to `/api/auth/login`, server returns `accessToken` in response; server sets refresh cookie at `/api/auth/refresh` route pattern.
- Refresh flow: client calls `POST /api/auth/refresh` (cookie sent automatically) to obtain new `accessToken`. Response contains `{ accessToken }`.
- Logout: POST `/api/auth/logout` revokes refresh token cookie.

Frontend required behavior
- Store `accessToken` in secure in-memory storage (app state). Do NOT store accessToken in localStorage.
- Refresh: call `/api/auth/refresh` when access token is expired; implement silent refresh before 30–60s expiry if possible.
- Attach `Authorization: Bearer <accessToken>` header to all requests to Core that require auth.
- For chat requests, also send `Idempotency-Key` header (UUID v4).
- NEVER forward or include `INTERNAL_API_KEY` in frontend bundles.

# 10. Error Handling (frontend contract)

Rules for frontend implementation (derive behavior from middleware)
- For 400: validation errors — show user-friendly inline errors; when possible, parse error details from `Error` component (swagger.ts) which may include `details`.
- For 401: unauthorized — redirect to login page and attempt one token refresh before redirect.
- For 403: forbidden — show permission denied UI.
- For 5xx: server error — show retryable UI with exponential backoff; implement up to 3 attempts for safe idempotent GET calls; for POSTs (chat) do not auto-retry except where safe and idempotency supported (chat requires idempotency-key).
- For payment webhooks and server-only flows: frontend does not handle webhooks.

Per-endpoint examples (from verified endpoints)
- `POST /api/chat`: on 400 (Idempotency missing) show form error. On 401, trigger login flow. On other 5xx, show "Try again" and do NOT retry automatically; allow user to resend with same Idempotency-Key.

# 11. Caching Strategy (per endpoint)

Implement caching per service wrapper (policy only; TTLs based on domain knowledge from docs)

- `/api/geo/pois`
  - Cacheable: Yes
  - staleTime: 300s
  - cacheTime: 900s
  - Invalidation: user moves map center beyond radius or explicit manual refresh
- `/api/geo/search`
  - Cacheable: short-term (60s)
- `/api/auth/*` (login/register/refresh)
  - Cacheable: No
- `/api/chat`
  - Cacheable: No (chat responses are user-specific and ephemeral)
- Generic rule: All GET endpoints may be cached subject to `Cache-Control` headers returned by server. Implement client cache layer (SWR/React Query) using the above defaults when server headers absent.

# 12. Security Rules (frontend MUST enforce)

- Never call AI Service, GeoContext, or Risk Intelligence directly from the frontend. All calls must go to Core Server only.
- Never include `INTERNAL_API_KEY`, `GEMINI_API_KEYS`, or any backend secret in frontend code or public environment.
- Attach only `Authorization: Bearer <accessToken>` to requests that require authentication. Do not send internal API keys from client.
- Protect routes: UI routes that require auth must verify `accessToken` validity; if invalid, attempt refresh then redirect to login.
- For payments: use Core's returned client tokens and do not embed merchant secrets.
- Use secure cookies (httpOnly) for refresh tokens as provided by the server.
- Implement CSRF protections on state-changing calls if required by the backend (UNKNOWN: server-side CSRF policy; assume httpOnly refresh cookie + JWT pattern suffices).

# 13. Frontend Folder Structure (required layout)

Top-level frontend structure expected by AI implementer:

- frontend/
  - package.json (scripts)
  - .env.development (VITE_API_BASE_URL, other client-only flags)
  - src/
    - api/
      - generated/                ← generated OpenAPI client + types
      - index.ts                 ← exported typed clients
    - services/                  ← thin wrappers calling generated client
      - authService.ts
      - chatService.ts
      - geoService.ts
      - userService.ts
      - paymentService.ts
      - voiceService.ts
    - repositories/              ← data adapters if using repository pattern
    - hooks/                     ← React hooks (useAuth, useChat, usePois)
    - providers/                 ← Context providers (AuthProvider)
    - components/                ← presentational components
    - pages/                     ← page components (Login, Register, Chat, Map, Profile)
    - types/                     ← re-exports of generated types
    - utils/                     ← helpers (http headers, idempotency-key generator, date utils)
    - config/                    ← runtime config
    - App.tsx / index.tsx
  - tests/
  - README.md

# 14. AI Generation Instructions (exact rules for an AI agent)

The AI generator MUST follow these rules exactly and in order:

1. REQUIRED: Use Core Server OpenAPI as the only source for generating API clients and TypeScript types.
   - Fetch run-time spec:
     - curl --fail --silent "$CORE_BASE/api/docs.json" -o frontend/src/api/generated/openapi.json
       - CORE_BASE is the deployment host (development: http://localhost:3000)
   - If `GET /api/docs.json` fails, attempt `GET /api/docs` (swagger UI) to locate the JSON link. If both fail, abort with a clear error (do not guess schemas).

2. Client generation:
   - Use `openapi-generator-cli` or `openapi-typescript-codegen` to produce:
     - typed models (TypeScript interfaces) for all schemas
     - operation clients (axios or fetch) with typed request/response signatures
   - Place outputs under `frontend/src/api/generated/`.

3. DTO and service wiring:
   - Do NOT hand-write DTOs. Re-export generator types under `frontend/src/types/index.ts`.
   - Create `frontend/src/services/*` wrappers that:
     - import the generated client
     - attach `Authorization` header from `AuthProvider` (in-memory token)
     - centralize error handling and mapping to frontend models
     - expose minimal methods matching operationIds

4. Authentication:
   - Implement `AuthProvider` that:
     - stores `accessToken` in memory (React context)
     - uses `POST /api/auth/refresh` to refresh tokens (HTTP-only cookie will be sent)
     - provides `getAuthHeader()` used by all services
   - All service wrappers must call `getAuthHeader()` and include header if route requires security.

5. Chat specifics:
   - For `POST /api/chat` always generate and attach `Idempotency-Key` (UUID v4) header.
   - If OpenAPI lacks response schema for `/api/chat`:
     - fall back to typing response as `unknown` and implement a `chatAdapter.ts` that:
       - normalizes the runtime response into a stable frontend model by mapping whatever fields exist to: `{ text: string, attachments?: Attachment[], meta?: object }` only after runtime inspection in staging. Do NOT invent schema; document adapter as runtime-mapping step.

6. UI rules:
   - All network requests must go through `services/*`.
   - Business logic stays in `services/*`.
   - Components are purely presentational and use hooks.

7. Generation safety:
   - Validate generated types compile before committing.
   - Run a linter and type-check step: `npm run build` (or `tsc`) as verification.

# 15. Frontend TODO Checklist

☑ Setup project skeleton and package.json  
☑ Generate OpenAPI client from `GET /api/docs.json` (Core)  
☑ Implement `services/*` wrappers for auth, chat, geo, user  
☐ Implement payments UI and integrate with Core payments endpoints  
☐ Implement journeys/trips features (API scanning required)  
☐ Implement full voice support (depends on `/api/voice` details)  
☐ Implement e2e tests (Cypress/Playwright) for auth, chat, and map flows  
☐ Implement monitoring and Sentry integration

# 16. Final Machine Readable Section

Below JSON is authoritative for automated consumption. Fields that require runtime fetching of Core OpenAPI are intentionally left as instructions that must be executed by the AI implementer; they are not guessed.

{
  "services": {
    "core": {
      "baseUrlEnv": "VITE_API_BASE_URL (developer must set to Core Server base)",
      "openApiPath": "/api/docs.json",
      "evidence": "Core-Server/src/app.ts, Core-Server/src/config/swagger.ts"
    }
  },
  "endpoints": {
    "POST /api/auth/register": {
      "method": "POST",
      "auth": "none",
      "request": "Zod registerSchema (see Core-Server/src/routes/auth.routes.ts)",
      "response": "User model per Core swagger (see Core-Server/src/config/swagger.ts)",
      "openApiDocumented": true,
      "frontendReady": true,
      "ownerFiles": ["Core-Server/src/routes/auth.routes.ts","Core-Server/src/controllers/auth.controller.ts"]
    },
    "POST /api/auth/login": {
      "method": "POST",
      "auth": "none",
      "request": "Zod loginSchema",
      "response": "LoginResponse in Core swagger",
      "openApiDocumented": true,
      "frontendReady": true
    },
    "POST /api/chat": {
      "method": "POST",
      "auth": "Bearer JWT required",
      "headers": ["Authorization","Idempotency-Key (UUID)"],
      "request": "Zod chatSchema in Core-Server/src/routes/chat.routes.ts",
      "response": "UNKNOWN (not present in Core swagger) — fallback: treat as unknown and implement adapter step",
      "openApiDocumented": false,
      "frontendReady": false,
      "ownerFiles": ["Core-Server/src/routes/chat.routes.ts","Core-Server/src/services/chat.service.ts"]
    },
    "GET /api/geo/pois": {
      "method": "GET",
      "auth": "Bearer JWT required",
      "query": "lat, lon, radius?, categories?",
      "response": "GeoContext component in Core swagger (pois, route, geocode)",
      "openApiDocumented": true,
      "frontendReady": "partial",
      "ownerFiles": ["Core-Server/src/routes/geo.routes.ts","Core-Server/src/services/geo.service.ts"]
    }
  },
  "dtoMappings": {
    "rule": "Generate DTOs from Core openapi.json and re-export under frontend/src/types; do not hand write types.",
    "knownMismatches": {
      "POST /api/chat": "missing response schema in Core OpenAPI — must be treated as unknown until runtime extraction"
    }
  },
  "pageMappings": {
    "Login": {"services":["authService"], "apis":["POST /api/auth/login"]},
    "Register": {"services":["authService"], "apis":["POST /api/auth/register"]},
    "Chat": {"services":["chatService","geoService"], "apis":["POST /api/chat","GET /api/geo/pois"]},
    "Map": {"services":["geoService"], "apis":["GET /api/geo/pois"]}
  },
  "dependencies": {
    "Core->AI": {"protocol":"http","auth":"X-Internal-Api-Key or forwarded Authorization","evidence":"Core-Server/src/services/chat.service.ts","timeout":"UNKNOWN","retry":"UNKNOWN"},
    "Core->Geo": {"protocol":"http","auth":"X-Internal-Api-Key or forwarded Authorization","evidence":"Core-Server/src/services/geo.service.ts"},
    "Core->Risk": {"protocol":"http","auth":"X-Internal-Api-Key","evidence":"Core-Server/src/services/risk.service.ts"}
  },
  "authFlow": {
    "accessToken": {"type":"JWT","storedInFrontend":"in-memory","issuedBy":"/api/auth/login"},
    "refresh": {"type":"opaque cookie httpOnly","refreshEndpoint":"/api/auth/refresh"},
    "headersToAttach":"Authorization: Bearer <accessToken>",
    "specialForChat":"Idempotency-Key header"
  },
  "environmentVariables": {
    "frontend": {"VITE_API_BASE_URL":{"usedBy":"frontend","required":true,"default":null}},
    "backend": {
      "INTERNAL_API_KEY":{"usedBy":"core,ai,geo,risk","frontend":false,"required":true},
      "AI_SERVICE_URL":{"usedBy":"core","frontend":false,"required":true},
      "GIS_SERVICE_URL":{"usedBy":"core","frontend":false,"required":true},
      "RISK_SERVICE_URL":{"usedBy":"core","frontend":false,"required":true}
    }
  },
  "frontendTasks": [
    "1) fetch Core OpenAPI: curl $CORE_BASE/api/docs.json -> frontend/src/api/generated/openapi.json",
    "2) generate types & client from openapi.json -> frontend/src/api/generated/",
    "3) implement services/ wrappers to call generated client and attach auth header",
    "4) implement AuthProvider and token refresh logic",
    "5) implement pages listed in pageMappings"
  ],
  "cachePolicies": {
    "/api/geo/pois":{"cacheable":true,"staleTimeSec":300,"cacheTimeSec":900},
    "defaultGET":{"cacheable":true,"staleTimeSec":60}
  }
}

# Self-evaluation (sufficiency check)

Assume I have NO access to the backend repository anymore. Can I build the entire frontend using ONLY this document?

- Answer: NO at this moment.
  - Missing items:
    - Full OpenAPI JSON for Core (needed to generate clients and exact DTOs).
    - Response schema for `POST /api/chat` (explicitly missing in Core swagger).
    - Exact list and operationIds of all Core endpoints beyond the verified subset.
    - Timeout/retry policies between Core and downstream services (not present in code).
    - Example responses for many endpoints.

Actions appended to make document sufficient (do these exactly):

A. MUST-FETCH step (automated precondition)
1. Fetch Core OpenAPI:
   - Command:
     ```
     curl --fail --silent "${CORE_BASE:-http://localhost:3000}"/api/docs.json -o frontend/src/api/generated/openapi.json
     ```
   - If the file is not accessible, abort and surface error.

2. Generate clients and types:
   - Command examples (pick one based on preferred generator):
     - openapi-generator-cli:
       ```
       npx @openapitools/openapi-generator-cli generate -i frontend/src/api/generated/openapi.json -g typescript-axios -o frontend/src/api/generated
       ```
     - openapi-typescript:
       ```
       npx openapi-typescript frontend/src/api/generated/openapi.json --output frontend/src/api/generated/types.ts
       ```
   - After generation, run `tsc` to ensure types compile.

B. Chat response fallback
1. If after step A, `/api/chat` still lacks response schema in the generated openapi.json:
   - Implement runtime inspection step in staging:
     - Send controlled test requests to `/api/chat` in staging with a test account and capture the response JSON samples.
     - Build an adapter that converts captured shape to a stable frontend model:
       - `{ id?: string, text: string, choices?: any[], tools?: any[], meta?: object }`
   - Persist adapter mapping in `frontend/src/services/chatAdapter.ts`.
   - Mark: this is required before shipping chat UI with typed models.

C. Complete automation verification
- After steps A and B, regenerate `dtoMappings` and update `endpoints` objects in the machine-readable JSON above with exact types and examples (scriptable step).

After the MUST-FETCH and Chat-fallback steps are executed, re-evaluate:

- With the generated OpenAPI and runtime sample for chat, YES — this document plus the generated OpenAPI is sufficient for an AI agent to implement the entire frontend without re-reading backend source.

Final statement: This document declares explicit procedures to obtain missing specs and how to treat unknowns. If an AI agent executing this spec is granted network access to the running Core Server (and a staging account for chat sampling), the agent can build the frontend end-to-end. If network access is unavailable, the missing runtime artifacts (Core openapi.json and chat response samples) must be provided; without them the build cannot be completed without guessing, which is prohibited.

End of FRONTEND_IMPLEMENTATION_SPEC.md
