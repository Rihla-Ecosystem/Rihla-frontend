# Rihla-frontend (Ahmed) — Context

> Auto-loaded when working here. Keep SHORT.
> Mid-task state: `read CONTEXT.md` (relevant section) first.

## What
**Design prototype only** — Figma-exported, hardcoded screens. NOT the live app. Intended to be wired to the real backend. Next.js 15 + React 18, MUI + shadcn/ui (radix + tailwind v4), react-router.

## Status & key doc
- All screens/static data in `src/app/App.tsx` (3k+ lines). Do NOT treat as production data.
- **`WIRING_GUIDE.md`** maps every screen → real Core-Server endpoint + request/response shapes. Read it before wiring anything.
- Other docs: `RESTYLE_SPEC.md` (visual), `ATTRIBUTIONS.md`, design docs under `src/imports/`.

## Run
- `npm i` then `npm run dev` (Next 15)
- Env: set `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api` to point at the real backend

## API layer (already scaffolded — reuse)
- `src/lib/api/client.ts` — axios + 401 refresh + queue subscribers
- `src/lib/api/config.ts` · `token-manager.ts` · `types.ts`

## Standing rules (enforced reflex)
1. At the end of every task, append a 3–6 line checkpoint to `CONTEXT.md`.
2. Before replacing any hardcoded screen, re-read the relevant `WIRING_GUIDE.md` section.
3. Only read what you need — never dump whole files into replies.
4. Never commit/log `.env` secrets. Contrast code style before committing.