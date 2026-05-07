# WOPR Game Selection — Reference

A mobile-first React app hosting five turn-based strategy games on a single menu, themed around WarGames (1983).

- **Live**: https://wopr.awrylabs.com
- **Repo**: https://github.com/rhoekstr/wopr
- **Stack**: React 18 + Vite 5, single-file (~2700 LOC), zero non-React dependencies

This document describes the project as built. It supersedes the original PRD.

---

## 1. Project layout

```
wopr/
├── .github/workflows/deploy.yml   # GitHub Actions → GitHub Pages
├── public/
│   └── CNAME                       # contains "wopr.awrylabs.com"
├── src/
│   ├── games.jsx                   # ALL game logic + UI in one file
│   └── main.jsx                    # React entry; mounts <GameRoom />
├── index.html
├── package.json                    # React 18, Vite 5, no other deps
├── package-lock.json               # tracked for reproducible installs
├── vite.config.js                  # base: "/" (custom domain)
├── REFERENCE.md                    # this file
├── README.md
└── .gitignore                      # ignores node_modules/, dist/, .claude/, .vscode/, .idea/, .DS_Store
```

Single-file architecture for `src/games.jsx` was a deliberate choice — keeps the entire codebase in one ~2700-line module so it's easy to grep, easy to deploy, and avoids cross-file plumbing for what is fundamentally a small static SPA.

Editor-local config (`.claude/`, `.vscode/`, `.idea/`) is gitignored — keep your dev tooling preferences local.

## 2. Tech stack

| Field | Value |
|---|---|
| Framework | React 18 with hooks (`useState`, `useEffect`, `useRef`) |
| Build | Vite 5 + `@vitejs/plugin-react` |
| Styling | **Inline styles only** — no Tailwind, no CSS files, no CSS modules |
| Rendering | SVG for game boards; HTML for menus and chrome |
| Dependencies | `react`, `react-dom` only — no game/animation libraries |
| TypeScript | Not used; plain JSX |
| Hosting | GitHub Pages via Actions, deploy from `dist/` |
| Domain | `wopr.awrylabs.com` via Cloudflare CNAME |

## 3. Component hierarchy

```
GameRoom (default export, root router)
├── Menu                        # 5 cards, navigates by setting screen state
├── TicTacToe   ({ onBack })
├── Connect4    ({ onBack })
├── DotsAndBoxes({ onBack })
├── GoGame      ({ onBack })
└── WOPR        ({ onBack })    # the big one
```

`GameRoom` keeps a single `screen` state (`"menu" | "ttt" | "c4" | "dab" | "go" | "wopr"`) and renders the matching component, passing `onBack` to return to the menu.

## 4. Shared design language

### 4.1 Mobile-first layout

Every game's root div uses:
```js
{ minHeight: "100vh", maxWidth: 420, margin: "0 auto", padding: ..., position: "relative" }
```

This caps the column at 420px on desktop, centering it within the body's `#0a0a0a` background. The result: the page looks like a phone column on desktop, full-width on mobile.

### 4.2 Typography

- Font: `'Courier New', monospace` everywhere
- Letter-spacing: 0.1em – 0.5em for headings/labels (gives a CRT-terminal feel)
- Title case for game names; UPPERCASE WITH SPACING for labels

### 4.3 Color palette per game

Each game has its own background and accent color so visual identity differentiates them at a glance:

| Game | BG | Accent |
|---|---|---|
| Menu | `#0a0a0a` | white text |
| TTT | `#0a0a0a` | `#4ade80` green |
| C4 | `#080c14` | `#ef4444` red / `#eab308` yellow |
| DaB | `#111009` | `#c8b89a` parchment |
| Go | `#1a1208` | `#8a7a40` gold (board: `#c8a96e` wood) |
| WOPR | `#000900` | `#00ff41` phosphor green |

Within WOPR, four extra 8-bit accent colors distinguish unit types (see §9.3).

### 4.4 Shared UI primitives (defined once, used across games)

- **`<BackButton onBack />`** — fixed top-left "← MENU". High-contrast (white/gray on translucent black with bright border), accessible from any game screen.
- **`<ModeBar mode onChange />`** — three-button toggle: vs CPU / vs Human / CPU vs CPU.
- **`<DiffBar difficulty onChange />`** — four-button toggle: Easy / Medium / Hard / Impossible.
- **`MODES`, `MODE_LABELS`, `DIFFICULTIES`, `DIFF_LABELS`, `DIFF_COLORS`** — shared constants.

All four toggles use the same visual pattern: filled when active (game-accent color), transparent with bright border when inactive. Inactive states are deliberately readable (`#aaa`/`#bbb`), not dim.

### 4.5 Stable config layout

Where a game's mode/difficulty selectors can hide (e.g. DiffBar hides in vs-Human mode), a placeholder div with the same height is rendered in its place. This prevents the play surface from shifting when the user toggles modes.

A 16px spacer between the last config row and the first play-surface element creates a clean breathing line between configuration and game state.

### 4.6 Win/turn message grammar

The human player is labeled **PLAYER** (not "YOU") so all generated messages read naturally: "PLAYER's turn", "PLAYER wins!", "PLAYER goes first". This is consistent across all four non-WOPR games.

## 5. Tic-Tac-Toe

Standard 3×3. Three modes: vs CPU, vs Human (pass-and-play), CPU vs CPU.

**AI levels:**
- **Easy** — 90% random plays; rarely takes wins or blocks.
- **Medium** — Always wins-in-1, blocks losing-in-1, then heuristic centre→corners→random.
- **Hard** — Same as Medium with no random fallback.
- **Impossible** — Full minimax; never loses.

Score tally per side persists across games until mode changes. Win flashes the winning line; the player who didn't go first last game goes first next game.

Function namespace: `ttt*` (`tttCheckWinner`, `tttGetCpuMove`, `tttMinimax`).

## 6. Connect Four

Standard 7×6 vertical drop. Animated piece drop with quadratic easing.

**AI levels** (depth-N alpha-beta with center-first move ordering):
- **Easy** — 50% random move, 50% depth-2.
- **Medium** — depth-4.
- **Hard** — depth-6.
- **Impossible** — depth-8.

Move ordering: center column first (`[3,2,4,1,5,0,6]`) — faster cutoffs.

The AI prefers any non-losing move; among non-losers it picks the one with the highest leaf-counted win rate (random tiebreak). This avoids both blunders and overly drawish play.

Function namespace: `c4*` (`c4Apply`, `c4GetBestCol`, `c4Evaluate`).

## 7. Dots & Boxes

Classic Lucas (1889) game. Three board sizes (4×4, 6×6, 8×8). Three modes.

**State** (`dab_makeState`):
- `h[r][c]` — N+1 rows × N cols of horizontal edges
- `v[r][c]` — N rows × N+1 cols of vertical edges
- `boxes[r][c]` — owner of each box (`null | "P1" | "P2"`)
- `turn`, `scores`, `done`, `lastMove`

A box closes when all four edges are placed. Closing a box gives the player a free turn (they go again).

**AI levels:**
- **Easy** — 50% random, 50% takes any closing move.
- **Medium** — Classify moves into wins / safe / risky (don't give opponent a chain). Plays wins, then safe randomly, then least-bad heuristic risky.
- **Hard / Impossible** — Iterative deepening alpha-beta minimax with a heuristic evaluator. Time budget: 3000ms / 6000ms respectively. Heuristic: score difference × 100 + chain-prediction penalties + early-game centrality.

Note: Hard/Impossible AI blocks the main thread during its budget — a "Thinking…" indicator appears in the UI. A Web Worker would fix this; deferred as accepted limitation given the small budget.

Function namespace: `dab_*` (`dab_apply`, `dab_minimax`, `dab_classify`).

## 8. Go (囲棋)

Three board sizes (5×5, 7×7, 9×9). Three difficulty levels (Easy / Medium / Hard — no Impossible).

**Rules engine** (`go_*`):
- Stones are placed on intersections, not in cells.
- Captures: a group with no liberties is removed.
- Suicide: placing a stone whose own group would have no liberties is illegal (unless it captures).
- Ko: a board position cannot exactly recur. Tracked via a `Set<boardKey>` in component state.
- Game ends after two consecutive passes.

**Scoring** (Chinese rules, simplified): stones + enclosed-territory regions. White receives a 6.5 komi.

**AI**:
- **Easy** — Random legal move that isn't self-atari or own-territory fill.
- **Medium** — Captures > atari escapes > top-3 heuristic-ranked safe moves.
- **Hard** — Best capture (max stones taken) > best atari escape > top-2 ranked moves. Heuristic combines centrality, group liberties, and territory estimate.

The AI passes when there are no captures available, the board has enough stones (N×2 minimum), and all empty regions are cleanly territorial (only touching one color).

**Known minor display bug**: the per-side captures display shows the OWN color's prisoners taken by the opponent, when convention is to show prisoners taken BY each player. Low-impact; deferred.

Function namespace: `go_*` (`go_tryPlace`, `go_scoreBoard`, `go_getCpuMove`).

## 9. Global Thermonuclear War (WOPR)

The most mechanically rich game. WarGames-themed CRT-green aesthetic. Models the nuclear triad with strategic AI personalities, a phase machine, and a peaceful end condition.

### 9.1 Map

- 360 × 420 SVG, viewBox in pixel space
- Country outlines from [mapsicon](https://github.com/djaiss/mapsicon) (CC BY 4.0): real Russia and USA SVG paths, transformed via SVG `<g transform="matrix(...)">` to fit upper and lower halves of the canvas
- Cities and unit positions are placed via lat/lon → pixel mapping with hand-tuned tweaks where the rendered outline differs from the linear projection

### 9.2 Triad units

Each side has THREE distinct platform types:

| Platform | Count/side | Missiles each | Targetable? | Interceptable? | Per-round limit |
|---|---|---|---|---|---|
| Silo (ICBM) | 8 | 2 | YES (preemptive strike disables) | YES | up to 2 missiles |
| SSBN (sub) | 2 | 2 | NO | YES | up to 2 missiles |
| Bomber | 3 | 1 | NO | NO | 1 sortie |

Total per side: 8×2 + 2×2 + 3×1 = **23 launches max** if everything is fired. After firing, a source is `launched: true` and out for the rest of the game.

### 9.3 Color codes (8-bit palette)

Distinct colors for at-a-glance unit identification regardless of side:

- **Cities**: side color — green (USA `#00ff41`) or pink (USSR `#ff66aa`)
- **Silos**: orange `#ff8c00` (everyone)
- **SSBNs**: blue `#3aa0ff` (everyone)
- **Bombers**: gold `#ffdd00` (everyone)
- **Destroyed**: red `#ff3030` overlay/marker
- **Selected**: hot phosphor `#00ff41` glow ring

USSR cities are deliberately PINK rather than amber to avoid clashing with silo orange.

### 9.4 Cities

10 per side at approximate real lat/lon. Each starts with:
- `alive: true`
- `interceptors: 2`
- `casualties: 0` (only set when destroyed)
- `bias`: a random `1 ± 30%` perturbation, used by the AI for target ranking. Different each game; never shown.

Population (in millions) is preset and shown as casualty estimates when destroyed.

### 9.5 Regions

USA cities/silos are tagged `west | central | south | east`. USSR `west | central | east`. Region matters for intercept chance (§9.10).

### 9.6 Mode + side selection

The intro screen uses the standard ModeBar / DiffBar UI plus a side toggle:

- **vs CPU** — human plays USA or USSR (toggle); CPU plays the other.
- **vs Human** — both sides human (pass-and-play).
- **CPU vs CPU** — watchable simulation; both sides AI.

Internally, the UI selection is resolved via `wopr_resolveModes(uiMode, difficulty, humanSide)` into per-side `usMode` / `ruMode` strings (`"human"` or a difficulty level).

### 9.7 CPU personalities

When a side is CPU-controlled, it gets one of six personalities at game start (re-rolled each new game):

| Personality | Base launch rate | Pass rate | Target priority | Intercept stacking |
|---|---|---|---|---|
| firstStrike | 0.95 | 0.05 | silos first, then population | low |
| populationStrike | 0.65 | 0.10 | highest population × bias | medium |
| decapitation | 0.70 | 0.15 | silos exclusively until exhausted | medium |
| defenseHeavy | 0.30 | 0.30 | convenient | max stack |
| deescalatory | 0.10 | 0.60 | low-population cities only | high stack |
| erratic | random | random | random | random |

Difficulty multiplies the personality's base rates with noise:
- **Easy** — 0.7×–1.3× noise, 25% chance of an obvious mistake (target a destroyed city, etc.)
- **Medium** — 0.85×–1.15× noise
- **Hard / Impossible** — full base rate, no degradation

Pass probability rises sharply when the opponent passes (×2.5–4 depending on personality), and when own cities have taken >50% casualties (×1.4 across all personalities). 20% noise is layered on every decision so CPU behavior never feels mechanical.

### 9.8 Phase machine

Each round runs through five phases:

1. `us_launch` — USA picks targets (CPU or human)
2. `ru_launch` — USSR picks targets (blind to USA's choices)
3. `us_intercept` — USA assigns interceptors against incoming USSR missiles
4. `ru_intercept` — USSR assigns interceptors against incoming USA missiles
5. `resolve` — apply silo preemption, intercepts, strikes, casualties, mark fired sources, adjust DEFCON, check end conditions

`intro` is the pre-game mode screen. `gameover` is the terminal state.

A `useEffect` watches `state.phase` and the per-side modes; if the active side is a CPU, after a short delay (1.3s in CPU vs CPU, 0.7s otherwise) it auto-picks launches/intercepts and advances the phase.

### 9.9 Launch UI

In a launch phase, the active human side:
1. Clicks one of their alive sources (silo, sub, bomber) — pulse ring confirms selection.
2. Clicks any enemy city or silo — adds to the launch queue with `{siloId, targetId, targetSide, isBomber}`.
3. Repeat for up to 2 missiles per silo/sub or 1 sortie per bomber.
4. Click "✓ CONFIRM LAUNCH ORDERS".

Outgoing arcs are dotted and color-coded. Missiles fired from the same silo arc in opposite directions (variant flag in `renderArc`) so they're visually distinguishable.

### 9.10 Intercept UI

In an intercept phase, the active human side sees enemy missiles in flight:
- Each incoming missile renders with a **solid trail behind** (already traveled) + **dashed path ahead**, with a small missile icon at the curve midpoint, oriented along the travel direction. A numbered badge floats above the missile.
- **Bomber sorties cannot be intercepted** and don't appear as numbered targets — they fly through.
- Tap own city to select an interceptor source (city pulse ring), then tap a numbered missile to assign.

**Intercept chance**: 90% if interceptor city is in the same region as the target, 70% otherwise. Multiple interceptors stack — three independent rolls compound the missile-survival probability to `(1-p)^N`.

**Intercept cap**: `max(0, 20 − own_launches × 3)` per round. Total interceptors are 10 cities × 2 = 20. Heavy offense buys lighter defense.

**Auto-assign**: two buttons (`AUTO ×1` / `AUTO ×2`) pre-fill an intercept plan: target highest-population missiles first, prefer same-region cities, stop at the cap. The human can still add or remove individual assignments before confirming.

### 9.11 Resolve step

Order of operations in `wopr_resolveRound`:

1. **Silo preemption**: any silo struck by an incoming missile is destroyed BEFORE its missiles count as launched. (If you hit Moscow's silo in time, those 2 ICBMs never fire.)
2. **Intercepts**: each assigned interceptor rolls its `chance`. Successful blocks are tracked in a `Set<missileIdx>`.
3. **Strikes resolve**:
   - Missiles in `blocked` are skipped.
   - Bomber sorties roll an independent 60% reach check (40% AAA shoot-down).
   - Surviving strikes destroy the targeted city (with 50–90% population casualties) or silo.
4. **Mark fired sources** — silos, subs, bombers all flagged `launched: true`.
5. **DEFCON adjustment** — see §9.12.
6. **Clear queues**, increment round.
7. **End condition check** — see §9.13.

### 9.12 DEFCON

Custom semantics (inverted from real-world DEFCON for game-design clarity):

- **DEFCON 3** — peacetime/normal (initial state)
- **DEFCON 4–5** — escalation; rises +1 each round there's at least one launch (cap at 5)
- **DEFCON 2** — de-escalation floor; falls −1 each round with no launches (floor at 2)

The DefconBar lights up `level` blocks from left and uses a single tone color (red at 5, amber at 4, bright green ≤3) so high tension reads as alarming.

### 9.13 End conditions

In priority order:

1. **Both sides annihilated** (all cities destroyed) → `"A STRANGE GAME. THE ONLY WINNING MOVE IS NOT TO PLAY."`
2. **One side annihilated** → other side wins; total casualties displayed.
3. **All sources expended** on both sides (no silos/subs/bombers remaining) → silo stalemate.
4. **DEFCON 2 reached with no launches this round** → de-escalation peace; `"DEFCON 2 — DE-ESCALATION ACHIEVED. THE ONLY WINNING MOVE IS NOT TO PLAY. STAND DOWN INITIATED."`

(4) is the most common ending in CPU vs CPU sims because de-escalatory and defenseHeavy personalities tend to mutually back down.

### 9.14 Help modal

A "?" button at the top-right of every WOPR screen opens a Field Manual modal explaining UNITS, FLOW, INTERCEPTS, and END conditions in one phone-screen-tall card. Click outside or on the ✕ to dismiss.

### 9.15 Balance numbers (CPU vs CPU, 200 games)

Per the in-tree simulator (`/tmp/wopr_sim2.mjs` style), with current settings (8 silos / 2 subs / 3 bombers / 2 interceptors per city):

- ~43% conclusive (one side wins or mutual annihilation)
- ~45% peace (DEFCON 2 de-escalation)
- ~13% silo stalemate
- 0% round-cap timeouts
- Average game length: 4 rounds
- Average casualties: 10M USA / 12M USSR
- Average cities surviving: 4.5/10 each side

These produce satisfying short games with clear stakes — different from the original PRD's 5-silo / 30-interceptor configuration, which had 89% silo stalemate with negligible casualties.

### 9.16 WOPR namespace

All WOPR functions and constants are prefixed `wopr_*` (lowercase) or `WOPR_*` (uppercase) to avoid collisions with other games' code in the single-file architecture.

## 10. Build, dev, deploy

```bash
npm install          # one-time setup
npm run dev          # localhost:5173, hot reload
npm run build        # writes dist/
npm run preview      # serves dist/ locally
```

### 10.1 GitHub Pages flow

`.github/workflows/deploy.yml` runs on push to `main` and on `workflow_dispatch`:

1. checkout
2. setup-node 20 + npm cache
3. `npm ci` → `npm run build`
4. `actions/configure-pages@v5` with **`enablement: true`** (auto-creates the Pages site on first run if Pages is off; harmless on subsequent runs)
5. `actions/upload-pages-artifact@v3` (path `dist/`)
6. `actions/deploy-pages@v4`

Required workflow permissions (declared at the top of the YAML):
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

`public/CNAME` contains `wopr.awrylabs.com` and is copied verbatim into `dist/CNAME` by Vite, which GitHub Pages reads to bind the custom domain. Vite's `base: "/"` works because the custom domain treats the site as root.

### 10.2 First-time bootstrap (one-time)

The very first deploy after creating the repo had two snags that the workflow alone couldn't solve:

1. **Pages site didn't exist** → `configure-pages` failed with "Get Pages site failed" until we set `enablement: true`.
2. **Default `GITHUB_TOKEN` lacks permission to create a Pages site for a brand-new repo** → even with `enablement: true`, the API call returned "Resource not accessible by integration".

The clean workaround was to enable Pages once via the API with a personal token (the `gh` CLI, which is already authenticated), then let the workflow take over for all future deploys:

```bash
# Enable Pages with build_type=workflow (so deploys come from Actions, not legacy branch builds)
gh api -X POST /repos/rhoekstr/wopr/pages -f build_type=workflow

# Bind the custom domain
gh api -X PUT  /repos/rhoekstr/wopr/pages -f cname=wopr.awrylabs.com

# After Let's Encrypt cert provisions (~5–15 min after DNS verifies), enforce HTTPS
gh api -X PUT  /repos/rhoekstr/wopr/pages -F https_enforced=true
```

After that, every push to `main` rebuilds and redeploys automatically; no further manual steps.

### 10.3 DNS setup (Cloudflare)

For `awrylabs.com`, all records pointing at GitHub Pages are **DNS-only** (proxy off — orange cloud disabled). Cloudflare proxying breaks GitHub's DNS verification (returns Cloudflare IPs instead of GitHub's) and Let's Encrypt's HTTP-01 challenge for cert provisioning.

| Type | Name | Value | Proxy |
|---|---|---|---|
| CNAME | `wopr` | `rhoekstr.github.io` | DNS only |
| A | `awrylabs.com` | `185.199.108.153` | DNS only |
| A | `awrylabs.com` | `185.199.109.153` | DNS only |
| A | `awrylabs.com` | `185.199.110.153` | DNS only |
| A | `awrylabs.com` | `185.199.111.153` | DNS only |
| AAAA | `awrylabs.com` | `2606:50c0:8000::153` | DNS only |
| AAAA | `awrylabs.com` | `2606:50c0:8001::153` | DNS only |
| AAAA | `awrylabs.com` | `2606:50c0:8002::153` | DNS only |
| AAAA | `awrylabs.com` | `2606:50c0:8003::153` | DNS only |
| CNAME | `www` | `rhoekstr.github.io` | DNS only |

All four GitHub Pages apex IPs (and IPv6 equivalents) are listed for redundancy. Once cert provisioning is complete and HTTPS is enforced, Cloudflare proxying CAN be re-enabled with Cloudflare's SSL mode set to **Full** (not "Full Strict") to accept GitHub's Let's Encrypt cert — but doing so isn't necessary for the site to work, and proxy-on adds complexity around cert renewal.

### 10.4 Health check

If something goes wrong with HTTPS, the GitHub Pages health endpoint exposes the live verification state:

```bash
gh api /repos/rhoekstr/wopr/pages/health | jq '.domain'
```

Useful fields: `dns_resolves`, `is_proxied`, `has_cname_record`, `is_cname_to_github_user_domain`, `is_served_by_pages`, `responds_to_https`, `https_error`, `is_https_eligible`.

## 11. Accepted limitations / future work

- **Animated arcs during resolve** — currently arcs reveal statically. Could animate via `requestAnimationFrame` for cinematic flair.
- **Typewriter effect on end-state quotes** — quotes appear all at once; would feel more WarGames-y per character.
- **Smoke puffs on fired silos** — implemented as static circles; could animate.
- **Web Worker for DaB AI** — Hard/Impossible block the main thread during their thinking budget. Acceptable for now.
- **Go captures display** — shows the wrong side's prisoners; minor display polish needed.
- **GTW replay** — `commanderBias` is randomized but not seeded for replay determinism.
- **Sound effects / music** — not in scope.
- **Persistence** — no localStorage; each visit is fresh.
- **Online multiplayer** — out of scope; vs-Human is pass-and-play only.

## 12. Single-file map (line ranges in `src/games.jsx`)

Approximate guidance for navigation. Line numbers shift when you edit; use `grep` to re-anchor:

- ~1–62 — imports, shared constants (`DIFFICULTIES`, `MODES`), `ModeBar`/`DiffBar`/`BackButton`
- ~63–302 — Tic-Tac-Toe
- ~303–662 — Connect Four
- ~663–985 — Dots & Boxes
- ~988–1590 — Go (rules engine + AI + component)
- ~1593–3019 — WOPR
  - ~1593–1740 — colors, map outlines, city/silo/sub/bomber data, personalities
  - ~1740–1900 — helpers, init, CPU AI (launches + pass + intercepts)
  - ~1931–2080 — `wopr_resolveRound`
  - ~2082–2100 — `WOPR_DefconBar`
  - ~2103–2196 — `WOPR_HelpModal`
  - ~2207–end — `WOPR` main component (state, handlers, renderers, JSX)
- ~3021–end — `GAMES` array, `Menu`, `GameRoom` router

Quick navigation:

```bash
grep -nE "^// ═══" src/games.jsx        # major game sections
grep -nE "^// ── " src/games.jsx         # WOPR sub-sections
grep -nE "^function " src/games.jsx      # all functions
grep -n "^const WOPR_" src/games.jsx     # WOPR constants
```
