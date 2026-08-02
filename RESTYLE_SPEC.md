# Rihla Client — Style & Layout Conversion Spec

> **Audience:** Anyone restyling the production app **`rihla-client`** (the `WiredClient` repo) to match the visual direction in **`Rihla-frontend`** (Ahmed's design prototype).
> **Goal:** Adopt Ahmed's Egyptian design language (limestone/basalt/nile/faience/solar, dark collapsible sidebar shell, Cormorant Garamond headings, pyramid-key logo) across the current app — **cosmetic + layout** only. **No backend/contract changes.**
> **Status of this spec:** Instructions to fully restyle. **Implementation is NOT done by me here** — this documents exactly what to change, file by file, so the restyle is repeatable.

---

## 1. Source of Truth for the Target Look

| Target | Location |
|---|---|
| Design tokens & dark mode | `Rihla-frontend/src/styles/theme.css` (CSS variables) |
| Design tokens object (inline) | `Rihla-frontend/src/app/App.tsx` → `const C = { ... }` (lines ~14-40) |
| Typography imports | `Rihla-frontend/src/styles/fonts.css` (Cormorant Garamond + Inter) |
| Colors/typography rationale | `Rihla-frontend/src/imports/brand_identity.md` (§4 Visual Language System) |
| Layout shell (sidebar + TopBar) | `Rihla-frontend/src/app/App.tsx` → `AppShell`, `TopBar`, `RafiqDrawer` (lines ~476-530) |
| Logo mark | `App.tsx` → `Glyph`, `GlyphFull` (lines ~49-164) |

Our current app: `rihla-client/` — App Router (`app/[locale]/`), Tailwind v4 theme in `src/styles/globals.css`, pages: `chat, explore, tickets, safety, currency, quests(+detail), memory, profile, wallet, onboarding, auth/*, admin/*, payment-result, leaderboard`.

---

## 2. Design-Token Diff (CSS)

### 2.1 Current (`rihla-client/src/styles/globals.css`)
```
--nile: #0F4C5C            (nile, nile-light, nile-dark)
--sand: #F4EDE4 (light), #EDEDED (dark)
--gold: #C9954A (+gold-dark/gold-light)
--terracotta: #C25A3C (+ light/dark)
--surface: #FFFFFF / #1A2128
--muted, --border, --bg-body, --fg-body
--primary-*: gold scale (500 #C9954A)
--secondary-*: blue scale (500 #0F4C5C)
--font-heading: 'Playfair Display'
--font-body: 'Inter'
--radius-card: 0.75rem, --radius-button: 0.5rem
```

### 2.2 Target (`Rihla-frontend: theme.css` ::root)
```
--background: #F5EFE0      (Limestone)
--foreground: #141008      (Basalt)
--card: #FAF5E8
--card-foreground: #141008
--popover: #FAF5E8
--primary: #C8831A         (Solar / gold — the "keyhole" CTA)
--primary-foreground: #141008
--secondary: #EDE4CC
--secondary-foreground: #141008
--muted: #E8E0CC
--muted-foreground: #7A6845
--accent: #0F3D3E          (Nile Depth — actions/nav/headers)
--accent-foreground: #F5EFE0
--destructive: #B23A2E     (Signal Red — reserved for real danger only)
--border: rgba(27,26,23,0.12)
--input-background: #EDE6D6
--switch-background: #C4B89A
--ring: #0F3D3E
--chart-1..5: #C4623A, #2E9C93, #E8B96A, #8A5A34, #3E7A5C
--radius: 0.75rem
```
**Dark mode** (`.dark`): `--background #1B1A17`, `--foreground #F6F1E7`, `--card #242320`, **`--primary #2E9C93` (faience in dark)**, `--accent #E8B96A`, `--muted #2A2925`, `--destructive #B23A2E`.

### 2.3 Practical rename mapping (so existing classNames keep working)
To avoid rewriting every component's class strings, **map old tokens → new tokens** in `globals.css` and keep old utility names as aliases:

| Current class/var (rihla-client) | New semantic (Ahmed) | Rename alias (keep old working) |
|---|---|---|
| `--nile` `nile` | Nile Depth `#0F3D3E` accent | keep `nile` → map to new hex |
| `--sand` `sand` (bg) | Limestone `#F5EFE0` | keep `sand` → map to `#F5EFE0` |
| `--gold` `gold` | Solar `#C8953A` | keep → map |
| `--terracotta` | Terracotta `#C4623A` (secondary content) | keep |
| `--gold-light` | `#E8C070` sunrise sand | keep |
| — (new) | `faience` `#2E9C93` (AI/companion) | **add** |
| — (new) | `basalt` `#1B1A17` (dark bg) | **add** |
| — (new) | `copper` `#8A5A34` (rewards) | **add** |
| `text-gradient`, `gradient-gold` | solar gradient | keep name, new stops |
| `glass` | warm-tinted glass | keep, warm the blur (add sand/copper hint, not cold blue) |

**Rule (from brand_identity §4.1):** max 2 accent colors per screen. `Nile Depth` + one secondary.

---

## 3. Typography

| Role | Now | Target |
|---|---|---|
| Headings (serif, storyteling) | `Playfair Display` | **`Cormorant Garamond`** (weights 300–600, incl. italic) |
| Body/UI (sans) | `Inter` | **`Inter`** (300–600) |
| Arabic | `Noto Naskh Arabic` | **`Cairo` or `Almarai`** (bilingual) |

**Change:**
- `fonts.css` → `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Inter:wght@300;400;500;600&display=swap')`
- `globals.css` → `--font-heading: 'Cormorant Garamond', Georgia, serif; --font-body: 'Inter', system-ui, sans-serif; --font-arabic: 'Cairo', serif;`
- Keep `h1-h6` mapped to `--font-heading`. Add the Arabic grammar glyphs the app already ships (RTL).

---

## 4. Layout Shell (biggest structural change)

### 4.1 Current
- Top sticky `navbar.tsx` (horizontal links) + `footer.tsx` + bottom `mobile-nav.tsx` (5 tabs).
- Content sits under the navbar in `[locale]/layout.tsx`.

### 4.2 Target (Ahmed's `AppShell`)
- **Desktop:** a **dark, collapsible left sidebar** (`#111009`-style, basalt) with:
  - Brand block: `Glyph` logo + "رحلة Rihla" + `AI Companion` tag.
  - Nav rail: `Home, Explore, Rafiq, Safety, History, Wallet, Profile, Settings` (glyph-vertical stacking, active state = limestone `12` bg + solar dot).
  - Collapse toggle; bottom user chip (avatar initial + name + `Level N`).
- **Mobile:** keep a bottom tab bar (equivalent to `MobileNav`), but re-label/icon per target nav and slot **Rafiq** as the central, emphasized item (faience glow).
- **TopBar:** a slim context header showing current location + a "Ask Rafiq" button that opens a **floating `RafiqDrawer`** (shared, site-aware).

### 4.3 Route mapping: our routes → Ahmed's nav
| Ahmed nav | Our current page/route | Action |
|---|---|---|
| Home | `/` (landing/home) | restyle landing; add a real logged-in home |
| Explore | `/explore` | keep route, restyle |
| Rafiq (chat) | `/chat` + global-bot drawer | make the primary chat entry a **RafiqDrawer** |
| Safety | `/safety` | keep |
| History | `/memory` + `/profile` trip history | consolidate into a journal "history" page |
| Wallet | `/wallet` | keep |
| Profile | `/profile` | keep |
| Settings | (add) | currently none → create `/settings` |
| — legacy | `/tickets`, `/currency`, `/quests`, `/leaderboard` | **keep as sub-features** (can live under Explore/Profile nav or user menu); do not delete |
| — legacy | `/onboarding` | merge into **Arrival wizard** styling |

### 4.4 Files changed
- `src/app/[locale]/layout.tsx` — swap `Navbar`/`Footer` for `Sidebar` + `TopBar`; keep `MobileNav`.
- Create `src/components/layout/AppShell.tsx` + `Sidebar.tsx` (or `AppShell.tsx` with all).
- Create `src/components/layout/TopBar.tsx`, `RafiqDrawer.tsx`.
- `src/components/layout/mobile-nav.tsx` — reorder/relabel per §4.2.
- Keep `GlobalBot` / `EmergencyContacts` overlays wired (they're used by multiple pages).

---

## 5. New Shared Components To Extract

Port Ahmed's inline renderers into reusable components (from `App.tsx`):

| Component | Source lines | Notes |
|---|---|---|
| `RihlaLogo` (`Glyph`, `GlyphFull`) | ~49-100 | SVG pyramid-key; light/dark props; use everywhere incl. navbar/footer/auth |
| `WebField` (input w/ focus ring) | ~166 | reusable input label + solar focus border |
| `TopBar` | ~531-... | location chip + Ask Rafiq |
| `RafiqDrawer` | ~664-... | shared chat sheet; replaced top `Rafiq` page refs |
| `SiteCard` | ~642 | monument card (image, title, tag) with warm shadow |
| `Toggle` | (Settings) | switch styling |
| Primary/solar buttons, status chips | scattered | `solar` CTA, `terracotta` secondary, safety status pills |

Place under `src/components/` (e.g., `src/components/landed/`, `sidecar/`, `chat/`, `ui/`), mirroring our current component folder structure.

---

## 6. Component-Level Restyle Checklist (per page)

**Buttons**
- Primary CTA → `background: var(--primary) (#C8953A); color: #141008; border-radius: 10; box-shadow: 0 3-4px 14px #C8953A40`.
- Secondary/ghost → `background: ${limestone}10; border: 1.5px solid rgba(...28); color: ${limestone}/75`.
- AI action buttons → `faience` (`#2E9C93`) tint or filled.
- Danger/emergency → **only true emergencies** use red; keep amber for caution.

**Cards:** `background: var(--limestone) (#FAF5E8)`, warm shadow `0 2-8px 40px rgba(15,61,62,0.08–0.10)`, radius `0.75rem–1rem`. Update our `.card`/`.card-hover` and page-level card divs.

**Inputs:** use `WebField` pattern (bordered, `input-background`, focus ring `--ring` faience/nile).

**Status treatments:**
| Concept | Color |
|---|---|
| Safety OK / confirm | `Calm Green #3E7A5C` (not red!) |
| Caution | `Alert Amber #D98E2C` |
| True emergency | `Signal Red #B23A2E` ONLY |
| Local/vendor content | `Terracotta #C4623A` |
| AI / intelligence | `Faience #2E9C93` |
| Rewards / tokens | `Copper #8A5A34` |

---

## 7. Rewrite the CSS Files

**Plan (do in this order):**
1. `Rihla-frontend/src/styles/fonts.css` copy → `rihla-client/src/styles/fonts.css` (or inline in globals).
2. Rewrite `rihla-client/src/styles/globals.css`:
   - Replace `:root`/`.dark` blocks with the target palette (limestone/basalt/fai/solar/copper) while keeping the existing semantic aliases (so existing `text-nile`, `bg-sand`, `text-gold`, etc. keep resolving).
   - Update `--font-heading/--font-body/--font-arabic`.
   - Update `@theme inline` with new colors (`--color-faience`, `--color-basalt`, `--color-copper`) + keep primary/secondary scales.
   - Warm the `.glass`/`.glass-card` blur (add sand/copper tint).
   - Update `gradient-gold`, `gradient-hero`, `text-gradient` for solar/limestone.
3. Keep dark mode intact: add `.dark` equivalents matching target dark values (basalt bg, warm faience accent).
4. Optionally set body base background to limestone `#F5EFE0` (light) / basalt (dark).

---

## 8. Step-by-Step Verification

- After each change run:
  - `npm run lint` → `eslint`
  - `npm run build` (or `npx tsc --noEmit` + `npx next build`) — ensures the sidebar/layout refactor compiles.
- Manual check of every route (light + dark): landing, auth, arrival/onboarding, home, explore, chat/rafiq, safety, history/memory, wallet, profile, settings (new), quests, currency, tickets, admin (keep user/admin separation unaffected).
- Confirm **i18n** (`en`/`ar`) still flips direction & fonts; ensure RTL uses `--font-arabic`.
- Confirm **AuthGuard** still gates `/auth`, `/profile`, `/admin` correctly (layout change must not remove guards).

---

## 9. Risks / Non-Goals

**Structural (test carefully):** replacing the top-nav with a sidebar touches `[locale]/layout.tsx`, `mobile-nav.tsx`, and every page container (`min-h-[calc(100vh-4rem)]` paddings may change to accommodate the new rail). Admin pages use their own `admin/layout.tsx` guard — keep admin shell separate.

**Icon consistent:** our pages import named lucide icons (`Navbar`, `mobile-nav`, etc.). Keep using `lucide-react`; just restyle. Extract `RihlaLogo` (the only bespoke SVG).

**Do NOT change:** all data/API contracts, endpoint URLs, auth flows, i18n keys, admin functionality. This is **purely visual/layout.**

---

## 10. Checklist (for the implementer to copy into their task list)

- [ ] 1. Copy `fonts.css` (Cormorant Garamond + Inter) into `rihla-client`.
- [ ] 2. Rewrite `globals.css` tokens → limestone/basalt/faience/solar/copper, keeping old aliases; update `--font-heading/body/arabic`.
- [ ] 3. Build `RihLogo` (Glyph/GlyphFull) component; use in navbar/footer/auth.
- [ ] 4. Build `AppSidebar` (dark, collapsible) + `TopBar`; update `[locale]/layout.tsx`.
- [ ] 5. Build shared `RafiqDrawer` + `SiteCard` + `WebField` + solar buttons.
- [ ] 6. Restyle each page component (home/explore/chat/safety/memory/wallet/profile/settings/quests/currency/tickets) with new tokens.
- [ ] 7. Update `mobile-nav.tsx` (Rafiq emphasized + relabel).
- [ ] 8. Add `/settings` route if missing; keep `/quests`, `/currency`, `/tickets`, `/leaderboard`.
- [ ] 9. Ensure dark-mode + origin `en/ar` intact.
- [ ] 10. Run lint + typecheck + build; manual test all routes.

---

## 11. Reference Files Index

| What | Path |
|---|---|
| Current tokens | `rihla-client/src/styles/globals.css` |
| New tokens | `Rihla-frontend/src/styles/theme.css` |
| Inline token object `C` | `Rihla-frontend/src/app/App.tsx:14-40` |
| Fonts | `Rihla-frontend/src/styles/fonts.css` |
| Logo | `Rihla-frontend/src/app/App.tsx:49-100` |
| AppShell / TopBar / Nav | `Rihla-frontend/src/app/App.tsx:476-549` |
| Brand rationale | `Rihla-frontend/src/imports/brand_identity.md` |
| (current client layout) | `rihla-client/src/app/[locale]/layout.tsx`, `navbar.tsx`, `mobile-nav.tsx` |
| (current client pages) | `rihla-client/src/app/[locale]/*` |

> **Reference implementation note:** the restyle is **guided** by this spec. If you'd like the changes applied to `rihla-client`'s code, that is a separate execution task (this file documents it, it does not mutate any app source).