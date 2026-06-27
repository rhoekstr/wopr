# CLAUDE.md

Canonical, version-controlled guide for working in this repo. Keep it in sync with the code and
[`REFERENCE.md`](./REFERENCE.md) (the full architecture + gameplay spec).

## What WOPR is
A mobile-first **React + Vite** app hosting five turn-based strategy games on one menu — Tic-Tac-Toe,
Connect Four, Dots & Boxes, Go, and a WarGames-styled Global Thermonuclear War. Live at
**wopr.awrylabs.com**. Awry Labs: privacy-first, no tracking.

## Build / run / deploy
```bash
npm install
npm run dev        # Vite dev server (HMR)
npm run build      # → dist/
npm run preview    # serve the build
```
**Deploy is automatic:** a push to `main` builds via GitHub Actions and publishes to GitHub Pages. The
custom domain is bound by `public/CNAME` (Vite copies it into `dist/`) plus a Cloudflare DNS
`CNAME wopr → rhoekstr.github.io`. **Don't delete `public/CNAME`** — losing it breaks the custom domain
on the next deploy. Because main auto-deploys, **main is always shippable**.

## Architecture
React 18 (function components), Vite 5, ESM. The app shell is the game-selection menu; each game is a
self-contained component under `src/`, owning its own turn state and win detection. The full
architecture and per-game gameplay spec is in `REFERENCE.md` — read it before changing a game, and
update it in the same change.

## Conventions
- React function components + hooks; keep each game self-contained; shared UI in the shell.
- **Mobile-first** — the menu and every game must work on a phone screen first.
- No tracking / analytics (Awry brand rule).
- Commits: branch from `main`.

## Docs
- **CLAUDE.md** (this) — orientation, build/deploy, conventions.
- **README.md** — short front door.
- **REFERENCE.md** — full architecture + gameplay spec (source of truth; keep current with game changes).
