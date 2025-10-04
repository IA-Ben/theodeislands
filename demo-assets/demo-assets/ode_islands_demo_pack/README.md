# Ode Islands — Immersiv.es/Ticket Demo Pack (Southbank)

**Purpose:** Drop-in assets and specs to implement AI-style feed, Memory Wallet rewards, branching subchapters, event companion surfacing (via feed), after-event recap/achievements, asset upload, and **Presenter Demo Mode** — **without changing existing app structure**.

- No accounts/auth needed.
- Session-scoped progress (local/IDB as you already do).
- Presenter Demo Mode drives canned flows (5-minute Southbank script).

## What’s included
- `configs/feature-flags.json` — toggle features.
- `schemas/*.schema.json` — validate content JSON.
- `data/examples/*.json` — sample content to import.
- `feed/heuristics.json` + `feed/explain-templates.json` — AI-style feed tuning.
- `events/event-bus-contract.md` — lightweight pub/sub events to wire.
- `demo/demoScripts.json` — Presenter flows + shortcuts map.
- `api/mock-ai-suggest.md` — optional override for feed ordering.
- `uploader/uploader-spec.md` — creator drag–drop behaviour & validations.
- `copy/ui-strings.json` — UI copy, toasts, error messages.
- `qa/*` — acceptance criteria, test cases, demo checklist.

**Activation quick start**
1. Load `configs/feature-flags.json` at runtime.
2. Wire events in `events/event-bus-contract.md` (minimal).
3. Import `data/examples/*.json` using your existing loaders.
4. Enable Presenter Demo Mode (`Shift+D`) per `demo/demoScripts.json`.
5. Run through `qa/demo-checklist.md`.

Updated: 2025-10-04
