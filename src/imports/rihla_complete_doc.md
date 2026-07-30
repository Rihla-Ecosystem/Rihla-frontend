# Rihla Tourism AI Platform — Complete Documentation

> A microservice-based intelligent tourism assistant platform for Egypt.
> Four services: **Core-Server**, **AI-Service**, **GeoContext**, **Risk_Intelligence**

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Core-Server (Express.js + Prisma + PostgreSQL)](#2-core-server)
3. [AI-Service (FastAPI + Gemini + Qdrant)](#3-ai-service)
4. [GeoContext (FastAPI + PostGIS)](#4-geocontext)
5. [Risk_Intelligence (Fastify + File-based)](#5-risk_intelligence)
6. [Microservice Communication](#6-microservice-communication)
7. [Complete API Endpoint Specifications](#7-complete-api-endpoint-specifications)
8. [Database Schemas](#8-database-schemas)

---

## 1. System Architecture

```
Frontend (Mobile / Web)
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Core-Server (port 3000)                         │
│              Express.js + Prisma ORM + PostgreSQL                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Auth     │  │ Chat     │  │Payment   │  │ Internal          │  │
│  │ Service  │  │ Service  │  │Service   │  │ Service           │  │
│  └──────────┘  └────┬─────┘  └──────────┘  │ (context agg)    │  │
│                     │                       └───────────────────┘  │
│         ┌───────────┼──────────────┐                               │
│         ▼           ▼              ▼                               │
│  ┌────────────┐ ┌──────────┐ ┌──────────────────┐                  │
│  │http-client │ │http-client│ │   http-client    │                  │
│  │(geo svc)   │ │(risk svc) │ │(currency svc)    │                  │
│  └─────┬──────┘ └────┬─────┘ └──────────────────┘                  │
└────────┼─────────────┼─────────────────────────────────────────────┘
         │             │
         ▼             ▼
┌─────────────────┐  ┌──────────────────────────────────┐
│  GeoContext     │  │  Risk_Intelligence                │
│  FastAPI+PG     │  │  Fastify (file-based)             │
│  (port 8000)    │  │  (port 3000/3001)                 │
│  PostGIS        │  │  11 external APIs                 │
│  6,629 spatial  │  │  15 source adapters               │
│  records        │  │  11 Egyptian cities               │
└─────────────────┘  └──────────────────────────────────┘
         │
         └──────────────────────────────────────┐
                                                ▼
                                    ┌─────────────────────────┐
                                    │   AI-Service            │
                                    │   FastAPI + Gemini      │
                                    │   (port 3003)           │
                                    │                         │
                                    │  ┌───────────────────┐  │
                                    │  │  Qdrant (RAG)     │  │
                                    │  │  7 collections    │  │
                                    │  │  768-dim vectors  │  │
                                    │  │  Cosine distance  │  │
                                    │  └───────────────────┘  │
                                    │                         │
                                    │  3 Persona Agents       │
                                    │  9 Tools                │
                                    │  3 Gemini API Keys      │
                                    │  Round-robin failover   │
                                    └─────────────────────────┘
```

### Authentication Between Services

| Direction | Method | Header |
|-----------|--------|--------|
| Frontend → Core-Server | JWT Bearer | `Authorization: Bearer <access_token>` |
| Core-Server → AI/Geo/Risk | Internal API Key | `X-Internal-Api-Key: <shared_secret>` |
| Core-Server → AI/Geo/Risk | User JWT forwarded | `Authorization: Bearer <user_token>` |

---

## 2. Core-Server

**Stack**: Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL

### 2.1 Server Startup Flow

```
src/index.ts
  └── prisma.$connect()          // Connect to PostgreSQL
  └── app.listen(PORT)           // Start Express on port 3000

src/app.ts
  └── helmet()                   // Security headers
  └── cors()                     // CORS with configured origin
  └── cookieParser()             // Refresh token cookies
  └── express.json()             // Body parsing
  └── Routes mounted under /api
  └── Global error handler
```

### 2.2 Complete Chat Request Lifecycle

```
POST /api/chat
Headers: Authorization: Bearer <JWT>
Body: { message, lat?, lon?, persona?, conversation_id?, base_currency? }

  STEP 1: Middleware Pipeline
    ├── helmet()                           // Security headers
    ├── cors()                             // CORS check
    ├── cookieParser()                     // Parse cookies
    ├── express.json()                     // Parse JSON body
    ├── authenticate (middleware/auth.ts)  // Verify JWT → req.user
    │     └── Extract Bearer token
    │     └── jwt.verify(token, JWT_ACCESS_SECRET)
    │     └── Set req.user = { userId, role }
    └── validate(chatSchema)               // Zod validation

  STEP 2: Chat Service (services/chat.service.ts)
    ├── Fetch user profile (name, nationality, interests, budget, etc.)
    ├── Fetch user preferences (key/value pairs)
    ├── Parallel context gathering (with .catch(() => null)):
    │     ├── GET GeoContext   /api/v1/nearby-sites?lat&lon&radius=1000
    │     ├── GET Risk_Intel   /safety/current?lat&lon
    │     ├── GET Currency     exchangerate.host API (cached 900s)
    │     └── GET Env Service  (stub → returns {})
    ├── Fetch journey progress (gamification)
    ├── Conversation management (create/load + history)
    └── POST to ai-service /chat with full payload

  STEP 3: Response
    └── { response, conversation_id, persona, blocked?, reason?,
          environment, geography, safety, currency, user_journeys }
```

### 2.3 Auth System — Token Mechanics

**Access Token** (JWT):
```
Algorithm: HS256
Payload:  { sub: user.id, role: role.name }
Expiry:   15 minutes (configurable)
Secret:   JWT_ACCESS_SECRET (min 32 chars)
```

**Refresh Token** (Opaque):
```
Generation: crypto.randomBytes(32).toString('hex') → 64 hex chars
Storage:    SHA-256 hash in refresh_tokens table (raw never persisted)
Expiry:     30 days
Rotation:   Old revoked, new created — in a single Prisma transaction
Cookie:     httpOnly, secure (prod), sameSite strict, path=/api/auth, 30-day maxAge
```

### 2.4 Payment Flow — Paymob Integration

**Phase 1 — Create Intention:**
```
1. Validate tokenPackageId + billing_data (Zod)
2. Lookup TokenPackage (active, positive price/tokens)
3. Create PENDING Payment record with snapshot data
4. POST to Paymob /v1/intention/ with:
     { amount (cents), currency (EGP), payment_methods, billing_data,
       items, special_reference: payment.id, redirection_url, notification_url }
5. Return { paymentId, intentionId, clientSecret, amount, tokens }
6. Frontend uses clientSecret → Paymob iframe/redirect
```

**Phase 2 — Webhook Processing:**
```
POST /api/payments/paymob/webhook?hmac=<sha512>

1. HMAC verification:
     └── Concatenate 20 fields in specific order
     └── HMAC-SHA512(concatenated, PAYMOB_HMAC_SECRET)
     └── Compare with ?hmac using crypto.timingSafeEqual()
2. Extract paymentId from merchant_order_id
3. Business validation (integration ID, currency, amount match)
4. Atomic success (Prisma $transaction):
     ├── updateMany Payment WHERE id AND status=PENDING → COMPLETED
     ├── Upsert TokenWallet (increment balance)
     └── Create TokenTransaction (type: GRANT, source: PURCHASE)
5. Idempotency: second arrival detects already-COMPLETED → silent return
```

### 2.5 XP & Gamification System

**Level Computation** (`xp.service.ts`):
```
XP needed for level N → N+1: round(100 * N^1.5)
  Level 1→2:   100 XP
  Level 2→3:   283 XP
  Level 3→4:   520 XP
  Level 10→11: 3,162 XP
```

**XP Award Events**:
| Event | XP | Where Triggered |
|-------|----|-----------------|
| Registration | 5 | auth.service.ts |
| Email Verified | 10 | auth.service.ts |
| Daily Login | 5 | auth.service.ts (once/day) |
| Profile Completed | 20 | user.service.ts |

**Badge Evaluation** — runs after every XP award:
- `Welcome Aboard` — awarded to everyone
- `Verified` — awarded if email verified
- `Century Club` — awarded when message_sent count >= threshold

### 2.6 Database Schema (18 models)

```
User ──→ Role
  ├──→ EmailVerificationToken
  ├──→ PasswordResetToken
  ├──→ RefreshToken
  ├──→ UserBadge ──→ Badge
  ├──→ XpTransaction
  ├──→ Conversation ──→ Message
  ├──→ TripHistory
  ├──→ UserPreference
  ├──→ UserFeedback
  ├──→ UserJourney ──→ UserJourneyStep ──→ JourneyStep ──→ Journey
  ├──→ Payment ──→ TokenPackage
  ├──→ TokenWallet ──→ TokenTransaction
  └──→ AuditLog
```

---

## 3. AI-Service

**Stack**: FastAPI (Python), Google Gemini, LangChain, Qdrant vector DB

### 3.1 Startup Flow

```
Lifespan (async context manager):

  1. Initialize GeminiClient
       └── Load all API keys from comma-separated GEMINI_API_KEYS env
       └── Each key: fail_count, cooldown, status (ACTIVE/DEGRADED/COOLDOWN)

  2. Initialize VectorStore
       └── Connect to Qdrant (host=qdrant, port=6333, prefer_grpc=true)
       └── Create 7 collections if missing:
             rihla_attractions, rihla_monuments, rihla_emergency,
             rihla_legal, rihla_currency, rihla_scams, rihla_advisories
       └── All: 768-dim vectors, cosine distance

  3. Background: _auto_ingest()
       └── Check if any collection has points
       └── If empty: ingest_all() reads 44 data files → chunks → embeds → upserts

  4. Yield → App runs
  5. Shutdown: Close Qdrant connection
```

### 3.2 Supervisor — The Brain

```
route_and_respond(message, persona, context):

  1. INPUT GUARDRAILS
       ├── Prompt injection?    (10 regex patterns)
       ├── Military content?    (13 regex patterns)
       └── PII detected?        (SSN, credit card, passport)

  2. INTENT DETECTION (if persona="auto")
       └── Keyword scoring across 3 personas
       └── tour_guide: history, attraction, museum, pyramid, temple...
       └── safety_guru: safe, danger, scam, risk, emergency...
       └── local_expert: food, eat, restaurant, shop, bargain...
       └── Default: tour_guide

  3. BUILD SYSTEM PROMPT
       └── Persona identity + tone + knowledge boundaries
       └── User context (name, nationality, budget, interests)
       └── Environmental context (nearby sites, weather, safety)
       └── 7 HARD RULES (no military, no negativity, etc.)

  4. FIRST LLM CALL (with all 9 tool definitions)
       └── Gemini.generate_with_tools(system_prompt, message, TOOL_DEFINITIONS)

  5. TOOL EXECUTION (if LLM called tools)
       └── For each function_call: call_tool(name, args)
       └── Concatenate results

  6. SECOND LLM CALL (with tool results)
       └── Gemini.generate(system_prompt, message + tool_results)

  7. OUTPUT GUARDRAILS
       ├── Military content detected? → Regenerate with stricter prompt
       └── PII detected? → [REDACTED]

  8. Return { response, persona, blocked?, reason? }
```

### 3.3 9 Agent Tools

| Tool | Type | Implementation |
|------|------|---------------|
| `get_nearby_attractions(lat, lon, radius)` | HTTP | GET GeoContext `/api/v1/nearby-sites` |
| `search_attractions(query, category, city)` | RAG | Embed query → search `rihla_attractions` (top 5) |
| `get_safety_info(city)` | HTTP | GET Risk_Intel `/safety/current?city=` |
| `get_emergency_contacts(context_type)` | RAG | Search `rihla_emergency` (top 3) |
| `get_legal_guidelines(topic)` | RAG | Search `rihla_legal` (6 topic categories) |
| `get_currency_info(denomination, base_currency)` | RAG | Search `rihla_currency` |
| `get_scam_warnings(category, severity)` | RAG | Search `rihla_scams` (top 5) |
| `recommend_itinerary(interests, days, budget, cities, style, base_currency)` | Multi-step | LLM suggests cities → parallel per-city fetches (RAG + safety) → LLM generates structured JSON → parse → markdown |

### 3.4 Round-Robin LLM Client

```python
class GeminiClient:
    MAX_RETRIES = 10

    def _get_next_available_key(self):
        # Round-robin through keys, skip cooldown keys
        for _ in range(len(self.keys)):
            key = self.keys[self._round_robin_index % len(self.keys)]
            self._round_robin_index += 1
            if key.is_available():
                return key
        return None  # All keys exhausted

    # On failure: mark_failed() → 60s cooldown, fail_count++
    # On success: mark_success() → reset fail_count, restore ACTIVE
    # Retry: recursive call with _retry_count+1 → next key
```

**Generation methods:**
- `generate()` — Standard text (supports streaming)
- `generate_with_tools()` — Function calling
- `generate_with_image()` — Multimodal (temp=0.3)
- `generate_with_audio()` — Multimodal (temp=0.5)

### 3.5 RAG Pipeline

**Ingestion:**
```
7 categories → 44 data files

For each category:
  1. Discover files (JSON or Markdown)
  2. Read + Chunk:
       JSON array  → one chunk per object
       JSON object → one chunk per key-value (>50 chars)
       Markdown    → sliding window (800 words, 120 overlap)
  3. Embed: Gemini text-embedding-004 → 768-dim vector
  4. Upsert: Qdrant rihla_{category} with hash-based IDs
```

**Retrieval:**
```
retrieve(query, collection, top_k=5):
  1. embed(query) → 768-dim vector
  2. Qdrant search → cosine nearest neighbors
  3. Return [{text, score, metadata}]
```

### 3.6 Persona System Prompts

**Tour Guide**: "You are an enthusiastic and knowledgeable Egyptian tour guide named Rihla. Speak with passion about Egypt's 7000-year history..." — Covers history, archaeology, attractions, itineraries.

**Local Expert**: "You are a friendly local Egyptian who knows the real Cairo. Speak warmly and conversationally, like a friend giving insider tips..." — Covers food, shopping, customs, bargaining.

**Safety Guru**: "You are a proactive but calm travel safety advisor for Egypt. Be informative and watchful, never alarmist..." — Covers scams, emergencies, advisories, legal rights.

### 3.7 Guardrails (Regex-based)

**Input (pre-LLM):**
| Category | Patterns | Example |
|----------|----------|---------|
| Prompt injection | 10 patterns | "ignore previous instructions", "you are now", "DAN" |
| Military content | 13 patterns | "military", "army", "missile", "restricted area" |
| PII | 4 patterns | SSN, credit card numbers, passport numbers |

**Output (post-LLM):**
| Detection | Action |
|-----------|--------|
| Military content | Regenerate with stricter prompt |
| PII | Replace with `[REDACTED]` |

---

## 4. GeoContext

**Stack**: FastAPI (Python), PostgreSQL + PostGIS, SQLAlchemy, GeoAlchemy2

### 4.1 Spatial Database

**Boundaries** (`boundaries` table):
| Column | Type | Notes |
|--------|------|-------|
| geometry | `GEOMETRY(GEOMETRY, 4326)` | MultiPolygon |
| level | VARCHAR(50) | `country` (1) or `governorate` (27) |
| name, name_en, name_ar | VARCHAR | Trilingual |
| osm_type, osm_id | VARCHAR, BIGINT | `UNIQUE(osm_type, osm_id)` |

**Sites** (`sites` table):
| Column | Type | Notes |
|--------|------|-------|
| geometry | `GEOMETRY(POINT, 4326)` | Points only |
| categories | `TEXT[]` (GIN indexed) | Array: archaeological, islamic, christian... |
| site_type | VARCHAR | `tourist` or `infrastructure` |
| details | JSONB | Extra metadata |
| osm_type, osm_id | VARCHAR, BIGINT | `UNIQUE(osm_type, osm_id)` |

**Restricted Zones** (`restricted_zones` table):
| Column | Type | Notes |
|--------|------|-------|
| geometry | `GEOMETRY(GEOMETRY, 4326)` | MultiPolygon |
| zone_type | VARCHAR | `restricted`, `protected`, `caution` |
| subtype | VARCHAR | `military`, `protected`, `manual_risk`, `informal_settlement` |
| source | VARCHAR | `osm` or `manual` |
| osm_type, osm_id | NULLABLE | Partial unique index (only when `osm_id IS NOT NULL`) |

**Spatial Indexes**: GIST on all geometry columns.

### 4.2 Spatial Context Query

```
GET /api/v1/context?lat=30.0444&lon=31.2357&radius=2000

1. Check Egypt boundary:
   ST_Contains(boundary.geometry, ST_SetSRID(ST_MakePoint(lon, lat), 4326))
   → If no match: return empty (short-circuit)

2. Find governorate:
   ST_Contains(boundary.geometry, point) WHERE level = 'governorate'

3. Find nearby tourist sites:
   ST_DWithin(site.geometry::geography, point::geography, radius)
   ORDER BY ST_Distance(site.geometry::geography, point::geography)
   → ::geography cast gives true geodesic meters on WGS84 spheroid

4. Find nearby infrastructure:
   Same as (3) but site_type = 'infrastructure'

5. Find area advisories:
   ST_Intersects(zone.geometry, point)
   → Returns all restricted zones containing the point

6. At-site detection:
   Closest site within 50m → at_site, others → nearby_sites
```

### 4.3 Ingestion Pipeline

```
SOURCE_MAP: 10 GeoJSON files → Boundary, Site, RestrictedZone

For each file:
  1. load_geojson_features()       — Lazy generator from GeoJSON
  2. normalize_feature()            — Extract OSM ID, geometry (Shapely→EWKT), names
  3. Deduplicate                    — In-memory (osm_type, osm_id) set
  4. Batch upsert (500 records)     — PostgreSQL INSERT ON CONFLICT DO UPDATE
       └── Sites: category merge via ARRAY(SELECT DISTINCT UNNEST(...))
       └── RestrictedZone: partial index handles NULL osm_id (manual zones)

Total: ~6,629 records
  - 1 country boundary
  - 27 governorate boundaries
  - 3,570+ tourist sites (archaeological, islamic, christian)
  - 3,000+ restricted zones (military, protected, informal settlements)
```

### 4.4 Admin Panel (SQLAdmin)

**Auth**: Paste JWT into password field → stored in encrypted session cookie

**Audit Logging**: Every create/update/delete logs to `audit_logs`:
- `admin_identifier` (from JWT), `action` (create/update/delete), `target_type` (tablename), `target_id`, `details` (JSONB of changed fields)

**Read-only AuditLog**: Append-only, no edit/delete allowed.

---

## 5. Risk_Intelligence

**Stack**: Fastify (TypeScript), Node-cron, file-based persistence

### 5.1 Complete Polling Lifecycle

```
CRON trigger
  │
  ▼
1. acquireLock(sourceName)
   └── File mutex (open "wx"), stale after 2× interval
  │
  ▼
2. readCheckpoint(sourceName)
   └── data/checkpoints/<name>.json (cursor for next poll)
   └── Returns default { lastUpdateTime: null, bootstrapped: false } if missing
  │
  ▼
3. buildRequest() or fetchData()
   ├── Simple: adapter.buildURL(checkpoint) → fetchWithRetry() → adapter.parse()
   └── Complex: adapter.fetchData() (multi-API, auth flows, simulated data)
  │
  ▼
4. Severity Classification (7 classifiers)
   ├── earthquakeSeverity(mag)    — M≥6.5 critical
   ├── uvIndexSeverity(uv)        — UV≥11 critical
   ├── tempSeverity(celsius)      — ≥45°C critical
   ├── aqiSeverity(aqi)           — AQI≥5 critical
   ├── fireConfidenceSeverity(%)  — ≥80%+FRP≥50 critical
   ├── advisoryLevelSeverity(n)   — Level 4 critical
   └── textMatchSeverity(text)    — Keyword matching
  │
  ▼
5. nextCheckpoint(raw, events, prev)
   ├── Time cursor: lastUpdateTime = API response timestamp
   ├── Content hash: SHA-256 of response (skip if unchanged)
   └── Seen IDs: array (capped 200) of processed items
  │
  ▼
6. mergeIntoCurrentState(sourceName, events)
   ├── Remove all existing events from same source (source replacement model)
   ├── Dedup by source::rawRef key
   ├── Assign TTL (weather 2h, health 7d, unrest 48h, default 24h)
   ├── Group by city (nearestCity() or explicit assignment)
   ├── Compute overallRisk (highest severity per city)
   └── Atomic write: tmp + rename (crash-safe)
  │
  ▼
7. writeCheckpointAtomic()
   └── tmp-{uuid}.json → rename() → target (POSIX atomic)
  │
  ▼
8. releaseLock()
```

### 5.2 Source Adapters

**No-auth (HTTP GET + retry):**
| Source | Fetches | Key Detail |
|--------|---------|------------|
| USGS Earthquake | M≥3 quakes Egypt bbox | `starttime` cursor from checkpoint |
| EMSC Seismic | Seismic events 10° radius | Time cursor |
| NOAA Tsunami | Global tsunami alerts | CAP XML → JSON parser |
| GDELT Unrest | Egypt protest/clash news | 30s timeout, keyword filter |
| ReliefWeb | Egypt humanitarian reports | Pre-approved appname |
| UK FCDO Advisory | Egypt travel advisory | SHA-256 content hash dedup |
| WHO Outbreak | Disease outbreak news | `seenIds[]` array (capped 200) |
| CDC Travel Health | Travel health notices | Level + text classifier |

**With API key (with fallback):**
| Source | Fallback When Key Missing |
|--------|--------------------------|
| OpenWeather (UV+Temp) | Sinusoidal simulated: `30°C + sin(now/10000)*2` |
| OpenWeather Air (AQI) | Simulated AQI |
| NASA FIRMS (fires) | Returns empty array |

**Disabled/Deferred:**
| Source | Status | Reason |
|--------|--------|--------|
| ACLED Unrest | `enabled: false` | Complex OAuth2, no keys |
| GloFAS (flood) | `enabled: false` | Requires CDS API + Python |
| Numbeo Crime | Stub | Commercial API, uses static data |
| GeoSure Safety | Stub | Deferred |

### 5.3 Severity Classifiers

```
  textMatchSeverity(text):
    critical:  "death", "fatal", "kill", "emergency", "evacuate"
    warning:   "outbreak", "casualt", "injured", "severe", "pandemic"
    advisory:  "risk", "unrest", "protest", "clash", "caution", "threat"
    info:      default

  earthquakeSeverity(mag):
    mag >= 6.5 → critical
    mag >= 5.0 → warning
    mag >= 3.5 → advisory
    else       → info

  uvIndexSeverity(uv):
    uv >= 11 → critical
    uv >= 8  → warning
    uv >= 6  → advisory
    else     → info

  tempSeverity(celsius):
    celsius >= 45 → critical
    celsius >= 40 → warning
    celsius >= 36 → advisory
    celsius < 0   → advisory
    else          → info

  aqiSeverity(aqi):
    aqi >= 5 → critical
    aqi >= 4 → warning
    aqi >= 3 → advisory
    else     → info

  fireConfidenceSeverity(confidence%, frp):
    confidence >= 80% AND frp >= 50 → critical
    confidence >= 60%               → warning
    confidence >= 30%               → advisory
    else                            → info

  advisoryLevelSeverity(level):
    level >= 4 → critical
    level == 3 → warning
    level == 2 → advisory
    else       → info
```

### 5.4 City Mapping

```typescript
EGYPT_CITIES = {
  cairo:           { lat: 30.0444, lon: 31.2357 },
  giza:            { lat: 29.9773, lon: 31.1325 },
  alexandria:      { lat: 31.2001, lon: 29.9187 },
  luxor:           { lat: 25.6872, lon: 32.6396 },
  aswan:           { lat: 24.0889, lon: 32.8998 },
  hurghada:        { lat: 27.2579, lon: 33.8116 },
  sharm_el_sheikh: { lat: 27.9158, lon: 34.3300 },
  dahab:           { lat: 28.5091, lon: 34.5136 },
  marsa_matruh:    { lat: 31.3543, lon: 27.2373 },
  siwa_oasis:      { lat: 29.2032, lon: 25.5197 },
  port_said:       { lat: 31.2653, lon: 32.3019 },
}

nearestCity(lat, lon):
  // Euclidean distance (Math.hypot) — accurate enough at Egypt's latitudes
  // Returns city name or null
```

Events without coordinates (national advisories) go into `"unknown"` city bucket.

### 5.5 File-Based Persistence

```
data/
├── checkpoints/
│   ├── usgs_earthquake.json       # Cursor: lastUpdateTime
│   ├── openweather_current.json   # Cursor: lastUpdateTime
│   ├── gdelt_unrest.json          # Cursor: lastUpdateTime
│   ├── fcdo_advisory.json         # Cursor: contentHash (SHA-256)
│   ├── who_outbreak.json          # Cursor: seenIds[]
│   └── ... (15 sources)
├── current_state.json             # { city: { events[], overallRisk } }
├── event_log.json                 # Chronological events (max 1000)
├── fetch_errors.log               # Error log
└── static_safety_notes.json       # Pre-curated per-city safety notes

Atomic write pattern:
  1. writeFile(tmp-{uuid}.json, data)
  2. rename(tmp-{uuid}.json, target.json)  // POSIX atomic
```

**Locks:**
- **Per-source lock**: File mutex (`open(lockPath, "wx")`). Stale after 2× cron interval.
- **State write lock**: Promise-chain mutex (sequentializes concurrent writes).

### 5.6 Dashboard

Self-contained dark-themed SPA (`src/public/dashboard.html`):
- **City grid**: Color-coded risk cards
- **Source health table**: Expandable rows with per-source events
- **Event feed**: Scrollable chronological log
- Auto-refresh every 15 seconds, preserves expand/collapse state

---

## 6. Microservice Communication

### 6.1 End-to-End Chat Flow (Complete)

```
User App
  │
  │ POST /api/chat { message, lat, lon, persona }
  │ Authorization: Bearer <JWT>
  ▼
Core-Server
  │
  ├── Auth: verify JWT → req.user
  ├── Validate: Zod chatSchema
  │
  ├── Fetch user profile + preferences (PostgreSQL)
  │
  ├── Parallel context (all .catch(() => null)):
  │   ├── GeoContext     GET /api/v1/nearby-sites?lat&lon&radius=1000
  │   ├── Risk_Intel     GET /safety/current?lat&lon
  │   └── exchangerate   GET exchangerate.host (cached 900s)
  │
  ├── Fetch journey progress (gamification)
  ├── Create/load conversation + message history
  │
  │ POST /chat { message, persona, user, history, geography, safety, currency }
  │ X-Internal-Api-Key: <shared>
  │ Authorization: Bearer <JWT> (forwarded)
  ▼
AI-Service
  │
  ├── Auth: verify Internal-Key or JWT
  ├── Guardrails: check_input(message) → PASS
  ├── Intent detection: "tour_guide" (keyword scoring)
  ├── Build system prompt with context
  │
  ├── Gemini.generate_with_tools(system_prompt, message, all 9 tools)
  │     └── Gemini decides: call search_attractions(query)
  │         └── RAG search: embed → Qdrant rihla_attractions → top 5
  │
  ├── Gemini.generate(system_prompt, message + tool_results)
  │
  ├── Guardrails: check_output(response) → PASS
  │
  └── Return { response, persona }
  │
  ▼
Core-Server
  │
  ├── Save assistant message to PostgreSQL
  └── Return JSON to User App
```

### 6.2 Internal API Calls

| Caller | Service | Endpoint | Frequency |
|--------|---------|----------|-----------|
| Core-Server Chat | GeoContext | `GET /api/v1/nearby-sites` | Per chat (if lat/lon) |
| Core-Server Chat | Risk_Intel | `GET /safety/current` | Per chat (if lat/lon) |
| Core-Server Chat | exchangerate.host | `GET /latest?base=` | Per chat (cached 900s) |
| Core-Server Chat | AI-Service | `POST /chat` or `/chat/stream` | Per chat |
| Core-Server Voice | AI-Service | `POST /voice` | Per voice request |
| Core-Server Identify | AI-Service | `POST /identify` | Per identify request |
| AI-Service Tool | GeoContext | `GET /api/v1/nearby-sites` | When tool called |
| AI-Service Tool | Risk_Intel | `GET /safety/current` | When tool called |

---

## 7. Complete API Endpoint Specifications

### 7.1 Core-Server (39 endpoints)

Base URL: `http://core-server:3000/api`

#### Auth Routes (`/auth`)

| Method | Path | Auth | Rate Limit | Description |
|--------|------|------|------------|-------------|
| POST | `/auth/register` | Public | 5/hour | Register new user |
| GET | `/auth/verify-email` | Public | — | Verify email with token |
| POST | `/auth/resend-verification` | Public | 1/60s | Resend verification email |
| POST | `/auth/login` | Public | 5/15min | Login, returns JWT + refresh cookie |
| POST | `/auth/logout` | Cookie | — | Revoke refresh token |
| POST | `/auth/logout-all` | Bearer JWT | — | Revoke all refresh tokens |
| POST | `/auth/refresh` | Cookie | — | Refresh access token |
| POST | `/auth/forgot-password` | Public | 3/hour | Request password reset |
| POST | `/auth/reset-password` | Public | — | Reset password with token |

##### `POST /auth/register`
```
Request Body:
{
  "email":           string (email format)         [required]
  "password":        string (min 8, 1 uppercase, 1 digit)  [required]
  "display_name":    string (1-100)                [required]
  "gender":          "MALE" | "FEMALE"            [required]
  "nationality":     string (1-100)               [required]
  "language":        string[] (min 1, each 2-10)  [required]
  "budget_level":    string (max 50)              [optional]
  "arrival_date":    string (ISO datetime)        [optional]
  "departure_date":  string (ISO datetime)        [optional]
  "travel_style":    string (max 50)              [optional]
  "interests":       string[]                     [optional]
  "accommodation_type": string (max 50)           [optional]
}

Response 201:
{
  "id":          "uuid",
  "email":       "string",
  "displayName": "string",
  "createdAt":   "datetime"
}

Response 400: { "error": "Validation error", "details": [...] }
Response 409: { "error": "Email already registered" }
```

##### `POST /auth/login`
```
Request Body:
{
  "email":    string (email format)   [required]
  "password": string (min 1)          [required]
}

Response 200:
{
  "accessToken": "string (JWT)",
  "user": {
    "id": "uuid",
    "email": "string",
    "displayName": "string",
    "role": "string",
    "xp": "number",
    "level": "number"
  }
}
Set-Cookie: refreshToken=<opaque>; HttpOnly; Secure; SameSite=Strict; Path=/api/auth; Max-Age=2592000

Response 401: { "error": "Invalid email or password" }
Response 403: { "error": "Account is suspended" } | { "error": "Email not verified" }
```

##### `POST /auth/refresh`
```
Request: (refresh token from cookie, no body)

Response 200:
{
  "accessToken": "string (new JWT)"
}
Set-Cookie: refreshToken=<new_opaque>; (rotation)

Response 401: { "error": "Invalid or expired refresh token" }
```

#### User Routes (`/users`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users/me` | Bearer JWT | Get own profile |
| PATCH | `/users/me` | Bearer JWT | Update own profile |
| POST | `/users/me/avatar` | Bearer JWT | Upload avatar (multipart) |
| DELETE | `/users/me/avatar` | Bearer JWT | Remove avatar |
| DELETE | `/users/me` | Bearer JWT | Delete own account |
| GET | `/users/:id/badges` | Public | Get user badges |
| GET | `/leaderboard` | Public | Get leaderboard |

##### `GET /users/me`
```
Response 200:
{
  "id": "uuid",
  "email": "string",
  "displayName": "string",
  "gender": "MALE|FEMALE",
  "nationality": "string",
  "language": ["string"],
  "avatarUrl": "string|null",
  "bio": "string|null",
  "xp": "number",
  "level": "number",
  "budgetLevel": "string|null",
  "travelStyle": "string|null",
  "interests": ["string"]|null,
  "accommodationType": "string|null",
  "arrivalDate": "datetime|null",
  "departureDate": "datetime|null",
  "isEmailVerified": "boolean",
  "createdAt": "datetime"
}
```

##### `PATCH /users/me`
```
Request Body (all optional):
{
  "display_name":       string (1-100)
  "avatar_url":         string (url)
  "bio":                string (max 500)
  "gender":             "MALE"|"FEMALE"
  "nationality":        string (1-100)
  "language":           string[] (each 2-10)
  "budget_level":       string (max 50)
  "arrival_date":       string (ISO datetime)
  "departure_date":     string (ISO datetime)
  "travel_style":       string (max 50)
  "interests":          string[]
  "accommodation_type": string (max 50)
}
```

#### Chat Routes (`/chat`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/chat/` | Bearer JWT | Send message (non-streaming) |
| POST | `/chat/stream` | Bearer JWT | Send message (SSE streaming) |

##### `POST /chat/`
```
Request Body:
{
  "message":         string (1-10000)                             [required]
  "lat":             number (-90 to 90)                           [optional]
  "lon":             number (-180 to 180)                         [optional]
  "base_currency":   string (3 chars, e.g. "USD")                [optional]
  "conversation_id": string (uuid)                                [optional]
  "persona":         "auto"|"tour_guide"|"local_expert"|"safety_guru"  [optional, default "auto"]
}

Response 200:
{
  "response":        "string",
  "conversation_id": "uuid",
  "persona":         "string",
  "blocked":         boolean,
  "reason":          "string|null",
  "environment":     object|null,
  "geography":       object|null,
  "safety":          object|null,
  "currency":        object|null,
  "user_journeys":   object|null
}
```

##### `POST /chat/stream`
```
Request Body:
{
  "message":         string (1-10000)                             [required]
  "lat":             number (-90 to 90)                           [optional]
  "lon":             number (-180 to 180)                         [optional]
  "conversation_id": string (uuid)                                [optional]
  "persona":         "auto"|"tour_guide"|"local_expert"|"safety_guru"  [optional]
}

Response 200: text/event-stream
Headers: Content-Type: text/event-stream, Cache-Control: no-cache, Connection: keep-alive, X-Accel-Buffering: no

Events:
  data: {"token": "chunk_text"}\n\n
  data: [DONE]\n\n
```

#### Memory Routes (`/memory`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/memory/history` | Bearer JWT | List trip history |
| POST | `/memory/history` | Bearer JWT | Create trip record |
| DELETE | `/memory/history/:id` | Bearer JWT | Delete trip record |
| GET | `/memory/preferences` | Bearer JWT | Get preferences |
| POST | `/memory/preferences` | Bearer JWT | Set preference |
| POST | `/memory/feedback` | Bearer JWT | Submit feedback |
| GET | `/memory/summary` | Bearer JWT | Get memory summary |

##### `POST /memory/history`
```
Request Body:
{
  "title":       string (1-255)        [required]
  "destination": string (1-255)        [required]
  "start_date":  string (ISO datetime) [required]
  "end_date":    string (ISO datetime) [required]
  "itinerary":   any                   [optional]
  "notes":       string (max 5000)     [optional]
}
```

##### `POST /memory/preferences`
```
Request Body:
{
  "key":   string (1-100)  [required]
  "value": any             [required]
}
```

##### `POST /memory/feedback`
```
Request Body:
{
  "type":        string (1-50)           [required]
  "target_id":   string (uuid)           [optional]
  "target_type": string (max 50)         [optional]
  "rating":      integer (1-5)           [optional]
  "comment":     string (max 2000)       [optional]
}
```

#### Admin Routes (`/admin`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/admin/users` | Bearer JWT | admin, moderator | List all users |
| PATCH | `/admin/users/:id/role` | Bearer JWT | admin | Change user role |
| PATCH | `/admin/users/:id/ban` | Bearer JWT | admin, moderator | Toggle ban |
| GET | `/admin/audit-logs` | Bearer JWT | admin | View audit logs |

#### Token & Payment Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/tokens/wallet` | Bearer JWT | Get wallet balance |
| GET | `/tokens/transactions` | Bearer JWT | Get transaction history |
| GET | `/token-packages/` | Public | List available packages |
| POST | `/payments/intention` | Bearer JWT | Create payment intention |
| POST | `/payments/paymob/webhook` | Public (HMAC) | Paymob webhook |

##### `POST /payments/intention`
```
Request Body:
{
  "tokenPackageId": integer (positive)          [required]
  "billing_data": {
    "first_name":     string (trim, min 1)      [required]
    "last_name":      string (trim, min 1)      [required]
    "email":          string (email format)     [required]
    "phone_number":   string (trim, min 1)      [required]
    "apartment":      string (trim)             [optional]
    "floor":          string (trim)             [optional]
    "street":         string (trim)             [optional]
    "building":       string (trim)             [optional]
    "shipping_method": string (trim)            [optional]
    "postal_code":    string (trim)             [optional]
    "city":           string (trim, min 1)      [optional]
    "country":        string (trim, min 1)      [optional]
    "state":          string (trim)             [optional]
  }
}

Response 201:
{
  "paymentId":      "uuid",
  "intentionId":    "string (Paymob)",
  "clientSecret":   "string",
  "amount":         "number (cents)",
  "currency":       "EGP",
  "tokens":         "number",
  "packageName":    "string"
}
```

##### `POST /payments/paymob/webhook`
```
Query: ?hmac=<sha512_hex_string>
Body: Standard Paymob webhook payload

Response 200: { "success": true }
Response 400: Invalid HMAC
Response 409: Payment state conflict
```

#### Geo & Environment Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/env/` | Bearer JWT | Get environmental context |
| GET | `/geo/pois` | Bearer JWT | Get points of interest |
| GET | `/geo/search` | Bearer JWT | Search places |
| GET | `/geo/sites-by-governorate` | Bearer JWT | Sites by governorate |
| GET | `/safety/` | Bearer JWT | Get safety context |

##### `GET /geo/pois`
```
Query Params:
  lat:        number (-90 to 90)        [required]
  lon:        number (-180 to 180)      [required]
  radius:     number (positive)         [optional]
  categories: string                    [optional]
```

##### `GET /geo/search`
```
Query Params:
  q:   string (min 1)                   [required]
  lat: number (-90 to 90)               [optional]
  lon: number (-180 to 180)             [optional]
```

#### Other Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/voice/` | Bearer JWT | Process voice (multipart) |
| POST | `/identify/` | Bearer JWT | Identify landmark (multipart) |
| GET | `/currency/info` | Bearer JWT | Get currency info |
| GET | `/currency/rates` | Bearer JWT | Get exchange rates |
| GET | `/journeys/` | Bearer JWT | List user journeys |
| POST | `/journeys/:slug/start` | Bearer JWT | Start journey |
| POST | `/journeys/:slug/steps/complete` | Bearer JWT | Complete journey step |

##### `POST /voice/`
```
Request: multipart/form-data
  audio:           File (binary)          [required]
  lat:             number (coerced)       [optional]
  lon:             number (coerced)       [optional]
  conversation_id: string                 [optional]
```

##### `POST /identify/`
```
Request: multipart/form-data
  image:   File (binary)          [required]
  lat:     number (coerced)       [optional]
  lon:     number (coerced)       [optional]
  radius:  number (coerced)       [optional, default 500]
```

#### Internal Routes (`/internal`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/internal/geo` | Internal Key | Full geo context |
| GET | `/internal/safety` | Internal Key | Full safety context |
| GET | `/internal/user` | Internal Key | User context |
| GET | `/internal/journeys` | Internal Key | Journey progress |
| GET | `/internal/combined-context` | Internal Key | Combined context |

Internal routes use `X-Internal-Api-Key` header (not user JWT).

---

### 7.2 AI-Service (7 endpoints)

Base URL: `http://ai-service:3003`

#### Chat Routes (prefix: `/chat`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/chat` | JWT or Internal Key | Send chat message |
| POST | `/chat/stream` | JWT or Internal Key | Streaming chat (SSE) |

##### `POST /chat`
```
Request Body:
{
  "message":         string (1-10000)              [required]
  "conversation_id": string                        [optional]
  "persona":         string (default "auto")       [optional]
  "lat":             float                         [optional]
  "lon":             float                         [optional]
  "user":            object (profile data)         [optional]
  "environment":     object                        [optional]
  "geography":       object                        [optional]
  "safety":          object                        [optional]
  "user_journeys":   object                        [optional]
}

Response 200:
{
  "response":        "string",
  "conversation_id": "string|null",
  "persona":         "string|null",
  "blocked":         boolean,
  "reason":          "string|null"
}
```

##### `POST /chat/stream`
```
Request Body: Same as POST /chat but without geography/safety/user_journeys

Response 200: text/event-stream
Headers: Content-Type: text/event-stream

Events:
  data: {"token": "chunk_text"}\n\n
  data: {"done": true, "full_response": "..."}\n\n
  data: [DONE]\n\n

Error event:
  data: {"error": "Message blocked", "reason": "..."}\n\n
```

#### Voice Routes (prefix: `/voice`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/voice` | JWT or Internal Key | Process audio input |

##### `POST /voice`
```
Request: multipart/form-data
  audio:           File (binary)              [required]
  lat:             float (form)               [optional]
  lon:             float (form)               [optional]
  conversation_id: string (form)              [optional]

Response 200:
{
  "text_response":   "string",
  "audio_response":  "string|null",
  "conversation_id": "string|null"
}
```

#### Identify Routes (prefix: `/identify`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/identify` | JWT or Internal Key | Identify landmark from image |

##### `POST /identify`
```
Request: multipart/form-data
  image:  File (binary)              [required]
  lat:    float (form)               [optional]
  lon:    float (form)               [optional]
  radius: integer (form)             [optional, default 500]

Response 200:
{
  "name":              "string",
  "name_ar":           "string|null",
  "description":       "string",
  "category":          "string|null",
  "historical_period": "string|null",
  "wikipedia_url":     "string|null",
  "image_url":         "string|null",
  "nearby_sites":      ["..."]|null,
  "cached":            boolean
}
```

#### Health Routes (no prefix)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | Public | Basic health check |
| GET | `/readyz` | Public | Readiness probe |
| GET | `/health/keys` | Public | LLM key statuses |

##### `GET /health`
```
Response 200:
{
  "status":  "ok",
  "service": "Rihla AI Service",
  "version": "0.1.0"
}
```

##### `GET /readyz`
```
Response 200:
{
  "status": "ok",
  "checks": {
    "llm": {
      "status":      "ok|not_initialized",
      "active_keys": "number",
      "total_keys":  "number"
    },
    "vector_store": {
      "status":      "ok|error|not_initialized",
      "collections": ["rihla_attractions", ...],
      "message":     "string|null"
    }
  }
}

Response 503: { "status": "degraded", ... }
```

---

### 7.3 GeoContext (16 endpoints)

Base URL: `http://geocontext:8000`

#### Context Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/context` | JWT or Internal Key | Get spatial context |

##### `GET /api/v1/context`
```
Query Params:
  lat:    float (-90 to 90)          [required]
  lon:    float (-180 to 180)        [required]
  radius: float (0-5000, default 1000) [optional]

Response 200:
{
  "in_egypt":       boolean,
  "governorate":    "string|null",
  "at_site": {
    "name":            "string",
    "name_en":         "string|null",
    "name_ar":         "string|null",
    "categories":      ["string"],
    "details":         object|null,
    "distance_meters": float,
    "lat":             float,
    "lon":             float
  } | null,
  "nearby_sites":    [ SiteResult ],
  "nearby_services": [ SiteResult ],
  "area_advisories": [
    {
      "advisory_type": "restricted|protected|caution",
      "name":          "string|null",
      "subtype":       "string",
      "source":        "string",
      "reason":        "string|null"
    }
  ]
}
```

#### Nearby Sites Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/nearby-sites` | JWT or Internal Key | Get nearby sites |
| GET | `/api/v1/nearby-sites/by-governorate` | JWT or Internal Key | Sites by governorate |

##### `GET /api/v1/nearby-sites`
```
Query Params:
  lat:      float (-90 to 90)          [required]
  lon:      float (-180 to 180)        [required]
  radius:   float (0-5000, default 1000) [optional]
  category: string                     [optional]

Response 200:
[
  {
    "id":              "uuid",
    "name":            "string",
    "name_en":         "string|null",
    "name_ar":         "string|null",
    "categories":      ["string"],
    "details":         object|null,
    "governorate":     "string|null",
    "distance_meters": float,
    "lat":             float,
    "lon":             float
  }
]
```

##### `GET /api/v1/nearby-sites/by-governorate`
```
Query Params:
  governorate_name: string      [required]
  category:         string      [optional]

Response 200: [ NearbySiteResponse ] (distance_meters = 0.0)
Response 404: { "detail": "Governorate not found" }
```

#### Sites CRUD (Admin)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/api/v1/sites` | JWT or Internal Key | — | List sites |
| GET | `/api/v1/sites/:id` | JWT or Internal Key | — | Get single site |
| POST | `/api/v1/sites` | Bearer JWT | admin | Create site |
| PUT | `/api/v1/sites/:id` | Bearer JWT | admin | Update site |
| DELETE | `/api/v1/sites/:id` | Bearer JWT | admin | Delete site |

##### `POST /api/v1/sites`
```
Request Body:
{
  "osm_type":   string             [required]
  "osm_id":     integer            [required]
  "name":       string             [required]
  "name_en":    string|null        [optional]
  "name_ar":    string|null        [optional]
  "details":    object|null        [optional]
  "categories": ["string"]         [required]
  "site_type":  string (default "tourist")  [optional]
  "lat":        float (-90 to 90)  [required]
  "lon":        float (-180 to 180)[required]
}

Response 201: SiteResponse
```

#### Boundaries CRUD (Admin)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/api/v1/boundaries` | JWT or Internal Key | — | List boundaries |
| GET | `/api/v1/boundaries/:id` | JWT or Internal Key | — | Get single boundary |
| POST | `/api/v1/boundaries` | Bearer JWT | admin | Create boundary |
| PUT | `/api/v1/boundaries/:id` | Bearer JWT | admin | Update boundary |
| DELETE | `/api/v1/boundaries/:id` | Bearer JWT | admin | Delete boundary |

#### Restricted Zones CRUD (Admin)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/api/v1/restricted-zones` | JWT or Internal Key | — | List zones |
| GET | `/api/v1/restricted-zones/:id` | JWT or Internal Key | — | Get single zone |
| POST | `/api/v1/restricted-zones` | Bearer JWT | admin | Create zone |
| PUT | `/api/v1/restricted-zones/:id` | Bearer JWT | admin | Update zone |
| DELETE | `/api/v1/restricted-zones/:id` | Bearer JWT | admin | Delete zone |

#### Health Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/healthz` | Public | Liveness probe |
| GET | `/readyz` | Public | Readiness probe |

##### `GET /healthz`
```
Response 200: { "status": "ok" }
```

##### `GET /readyz`
```
Response 200: { "status": "ready" }
Response 503: { "detail": "Database connection is not ready" }
```

---

### 7.4 Risk_Intelligence (4 endpoints)

Base URL: `http://risk-intelligence:3000`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Public | Dashboard HTML |
| GET | `/safety/current` | Public | Current risk state |
| GET | `/safety/changes` | Public | Event log since timestamp |
| GET | `/safety/health` | Public | Source health status |
| POST | `/safety/refresh` | Internal Key or Admin JWT | Force refresh sources |

##### `GET /safety/current`
```
Query Params:
  city: string (optional) — filter by city name

Response (all cities):
{
  "cairo": {
    "updatedAt":   "ISO timestamp",
    "events":      [ RiskEvent ],
    "overallRisk": "info|advisory|warning|critical"
  },
  "alexandria": { ... },
  ...
}

Response (specific city):
{
  "city":        "string",
  "updatedAt":   "ISO timestamp",
  "events":      [ RiskEvent ],
  "overallRisk": "string",
  "staticNote":  "string|null"
}

Response 404: { "error": "no data for city: {city}" }
```

##### `GET /safety/changes`
```
Query Params:
  since: string (ISO timestamp)     [required]
  city:  string                     [optional]

Response 200:
{
  "events": [
    {
      "loggedAt":  "ISO timestamp",
      "source":    "string",
      "city":      "string",
      "severity":  "info|advisory|warning|critical",
      "category":  "string",
      "headline":  "string",
      "rawRef":    "string"
    }
  ],
  "count": number
}

Response 400: { "error": "missing required query param: since" }
```

##### `GET /safety/health`
```
Response 200:
{
  "status":  "ok",
  "time":    "ISO timestamp",
  "sources": [
    {
      "name":               "string",
      "status":             "ok|error|pending",
      "lastSuccessAt":      "ISO timestamp|null",
      "lastError":          "string|null",
      "consecutiveFailures": number,
      "autoDisabled":       boolean
    }
  ]
}
```

##### `POST /safety/refresh`
```
Headers: X-Internal-Api-Key: <key>  OR  Authorization: Bearer <admin_JWT>

Query Params:
  source: string (optional) — specific source name

Response (single source):
{
  "source": "string",
  "status": "ok|error",
  "events": number,
  "error":  "string|null"
}

Response (all sources):
{
  "refreshed": number,
  "sources": [ { "name": "...", ... } ]
}

Response 401: { "error": "Authentication required" }
Response 403: { "error": "Admin privileges required for direct access" }
Response 404: { "error": "unknown source: {source}" }
```

---

## 8. Database Schemas

### 8.1 Core-Server PostgreSQL (Prisma — 18 models)

**Key Models:**

```prisma
model User {
  id              String   @id @default(uuid())
  email           String   @unique
  password        String   // bcrypt hashed
  displayName     String
  gender          Gender?
  nationality     String?
  language        String[]
  avatarUrl       String?
  bio             String?
  xp              Int      @default(0)
  level           Int      @default(1)
  budgetLevel     String?
  travelStyle     String?
  interests       String[]
  accommodationType String?
  arrivalDate     DateTime?
  departureDate   DateTime?
  isEmailVerified Boolean  @default(false)
  isBanned        Boolean  @default(false)
  isDeleted       Boolean  @default(false)
  deletedAt       DateTime?
  lastLoginAt     DateTime?
  roleId          Int      @default(1)
  role            Role     @relation(fields: [roleId], references: [id])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  refreshTokens        RefreshToken[]
  conversations        Conversation[]
  payments             Payment[]
  tokenWallet          TokenWallet?
  xpTransactions       XpTransaction[]
  userBadges           UserBadge[]
  tripHistories        TripHistory[]
  preferences          UserPreference[]
  feedbacks            UserFeedback[]
  summaries            InteractionSummary[]
  userJourneys         UserJourney[]
  auditLogsAsActor     AuditLog[]       @relation("actor")
  auditLogsAsTarget    AuditLog[]       @relation("target")

  @@index([email])
  @@index([roleId])
}

model TokenWallet {
  id           String   @id @default(uuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id], onDelete: Restrict)
  tokenBalance Int      @default(0)
  status       String   @default("ACTIVE")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  transactions TokenTransaction[]

  @@index([userId])
}

model TokenTransaction {
  id          String   @id @default(uuid())
  walletId    String
  wallet      TokenWallet @relation(fields: [walletId], references: [id])
  type        TokenTransactionType @default(GRANT)
  source      TokenTransactionSource @default(PURCHASE)
  tokens      Int
  referenceId String?
  paymentId   String?
  payment     Payment? @relation(fields: [paymentId], references: [id])
  description String?
  createdAt   DateTime @default(now())

  @@unique([source, referenceId])
  @@index([walletId])
  @@index([walletId, createdAt])
  @@index([source])
}

model Payment {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Restrict)
  tokenPackageId  Int?
  tokenPackage    TokenPackage? @relation(fields: [tokenPackageId], references: [id])
  status          PaymentStatus @default(PENDING)
  provider        PaymentProvider @default(PAYMOB)
  providerIntentionId String?
  providerTransactionId String?
  packageNameSnapshot   String?
  tokensSnapshot        Int?
  priceSnapshot         Decimal?
  currencySnapshot      String?
  paidAt          DateTime?
  failureReason   String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  tokenTransactions TokenTransaction[]
  @@index([userId])
  @@index([status, createdAt])
  @@index([providerIntentionId])
}
```

**Enums:**
```prisma
enum Gender { MALE, FEMALE }
enum PaymentStatus { PENDING, COMPLETED, FAILED, REFUNDED, VOIDED }
enum PaymentProvider { PAYMOB }
enum TokenTransactionType { GRANT, CONSUME, REFUND, BONUS, ADJUSTMENT }
enum TokenTransactionSource { CHAT, IMAGE, FILE_UPLOAD, OCR, VOICE, PURCHASE, ADMIN }
```

### 8.2 GeoContext PostgreSQL (PostGIS — 4 tables)

```sql
CREATE TABLE boundaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    osm_type VARCHAR(50) NOT NULL,
    osm_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    name_ar VARCHAR(255),
    level VARCHAR(50) NOT NULL,
    geometry GEOMETRY(GEOMETRY, 4326) NOT NULL,
    UNIQUE (osm_type, osm_id)
);
CREATE INDEX ix_boundaries_level ON boundaries (level);
CREATE INDEX ix_boundaries_geometry ON boundaries USING GIST (geometry);

CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    osm_type VARCHAR(50) NOT NULL,
    osm_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    name_ar VARCHAR(255),
    categories TEXT[] NOT NULL,
    details JSONB,
    site_type VARCHAR(50) NOT NULL DEFAULT 'tourist',
    geometry GEOMETRY(POINT, 4326) NOT NULL,
    UNIQUE (osm_type, osm_id)
);
CREATE INDEX ix_sites_categories ON sites USING GIN (categories);
CREATE INDEX ix_sites_site_type ON sites (site_type);
CREATE INDEX ix_sites_geometry ON sites USING GIST (geometry);

CREATE TABLE restricted_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    osm_type VARCHAR(50),
    osm_id BIGINT,
    name VARCHAR(255),
    reason TEXT,
    subtype VARCHAR(100) NOT NULL,
    zone_type VARCHAR(50) NOT NULL DEFAULT 'restricted',
    source VARCHAR(100) NOT NULL,
    geometry GEOMETRY(GEOMETRY, 4326) NOT NULL,
    UNIQUE (osm_type, osm_id) WHERE osm_id IS NOT NULL
);
CREATE INDEX ix_restricted_zones_subtype ON restricted_zones (subtype);
CREATE INDEX ix_restricted_zones_zone_type ON restricted_zones (zone_type);
CREATE INDEX ix_restricted_zones_geometry ON restricted_zones USING GIST (geometry);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    admin_identifier VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(100) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    details JSONB
);
CREATE INDEX ix_audit_logs_admin_identifier ON audit_logs (admin_identifier);
CREATE INDEX ix_audit_logs_target_type ON audit_logs (target_type);
```

### 8.3 Risk_Intelligence (File-based JSON)

**current_state.json:**
```json
{
  "cairo": {
    "updatedAt": "2026-07-30T12:00:00.000Z",
    "events": [
      {
        "source": "openweather_current",
        "rawRef": "openweathermap.org::uv::cairo",
        "headline": "UV Index: 9.2 (Very High)",
        "severity": "warning",
        "category": "weather",
        "city": "cairo",
        "lat": 30.0444,
        "lon": 31.2357,
        "effectiveTime": "2026-07-30T12:00:00.000Z",
        "expiresTime": "2026-07-30T14:00:00.000Z"
      }
    ],
    "overallRisk": "warning"
  }
}
```

**checkpoint format (example — USGS):**
```json
{
  "lastUpdateTime": "2026-07-30T11:55:00.000Z",
  "lastSuccessAt": "2026-07-30T12:00:00.000Z",
  "lastError": null,
  "bootstrapped": true,
  "consecutiveFailures": 0,
  "autoDisabled": false
}
```

---

## End of Documentation
