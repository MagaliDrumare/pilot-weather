# Optimization Strategy: Multi-Agent Patterns

## 1. Fan-Out / Fan-In (N Researchers → Synthesizer)

**Pattern:** Launch N independent research agents in parallel, each investigating a different dimension of the same problem. A synthesizer then merges all findings into a unified recommendation.

**How we used it — Codebase Optimization:**

```
┌─────────────┐
│   Problem    │  "How best should I optimize this codebase?"
└──────┬──────┘
       │
  ┌────┼────┐
  ▼    ▼    ▼
┌───┐┌───┐┌───┐
│ A1││ A2││ A3│   3 agents launched in parallel
│Perf││QA ││DX │   Each with a different research focus
└─┬─┘└─┬─┘└─┬─┘
  │    │    │
  ▼    ▼    ▼
┌─────────────┐
│ Synthesizer │   Merge findings, resolve conflicts, rank priorities
└──────┬──────┘
       ▼
┌─────────────┐
│   Action    │   Prioritized optimization plan
└─────────────┘
```

**Agent assignments:**
- **Agent 1 — Performance:** Bundle size, network requests, React rendering, map optimization
- **Agent 2 — Code Quality:** Error handling, architecture, missing features, accessibility
- **Agent 3 — Developer Experience:** Build tooling, testing, linting, CSS approach

**Why it works:** Each agent explores its domain without bias from the others. The synthesizer identifies patterns that appear across multiple agents (consensus signals) and resolves contradictions.

**Result:** Identified 12 optimization opportunities across 3 dimensions, prioritized into 5 actionable steps.

---

## 2. Stochastic Multi-Agent Consensus

**Pattern:** Launch N agents (N ≥ 5) to independently research the *same* problem from different angles. Each agent explores a different solution space. The synthesizer identifies convergence points (consensus) and unique insights (dissent).

**How we used it — Geographical Waypoint Naming:**

```
┌──────────────────┐
│     Problem       │  "Replace WPT1/WPT2/WPT3 with real place names"
└────────┬─────────┘
         │
  ┌──┬───┼───┬──┐
  ▼  ▼   ▼   ▼  ▼
┌──┐┌──┐┌──┐┌──┐┌──┐
│A1││A2││A3││A4││A5│   5 agents, same problem, different angles
│API││Off││Avn││Map││Hyb│
└┬─┘└┬─┘└┬─┘└┬─┘└┬─┘
 │   │   │   │   │
 ▼   ▼   ▼   ▼   ▼
┌──────────────────┐
│    Consensus      │   Score approaches by how many agents converge
│    Matrix         │   Flag dissenting opinions
└────────┬─────────┘
         ▼
┌──────────────────┐
│  Winning Strategy │   Hybrid 3-tier approach
└──────────────────┘
```

**Agent assignments:**
- **Agent 1 — Reverse Geocoding APIs:** Nominatim, BigDataCloud, GeoNames, LocationIQ
- **Agent 2 — Offline/Client-Side:** Bundled datasets, nearest-airport lookup, NPM packages
- **Agent 3 — Aviation-Specific:** NAVAIDs, FIR names, OpenAIP, OurAirports
- **Agent 4 — Leaflet/Map Plugins:** Leaflet geocoder, Esri ArcGIS, Mapbox
- **Agent 5 — Hybrid Design:** Multi-tier strategy combining best of all approaches

**Consensus matrix:**

| Approach | Agents that proposed it | Consensus score |
|----------|------------------------|-----------------|
| Nearest airport from existing data | A2, A5 | Strong |
| BigDataCloud (no API key) | A1, A5 | Strong |
| Esri reverse geocode | A4 | Moderate |
| Bundled NAVAID data | A3 | Dissent |
| Tiered fallback strategy | A1, A2, A4, A5 | Very Strong |

**Dissent noted:** Agent 3 (aviation specialist) argued pilots prefer NAVAID identifiers over city names — a valid UX concern flagged for future consideration.

**Result:** The hybrid 3-tier approach won by consensus:
- Tier 1: Airport endpoints → use existing `airports.js` city data (0 cost)
- Tier 2: Intermediate points → nearest airport within 50 NM (instant)
- Tier 3: Fallback → BigDataCloud reverse geocode with localStorage cache

---

## 3. Pipeline (Sequential Agent Chain)

**Pattern:** Chain agents sequentially where each agent's output feeds the next. Used for build → deploy workflows where order matters.

**How we used it — Ship Optimized App:**

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Agent 1   │───▶│ Agent 2   │───▶│ Agent 3   │
│ Optimize  │    │ Push to   │    │ Deploy to │
│ Codebase  │    │ GitHub    │    │ Vercel    │
└──────────┘    └──────────┘    └──────────┘
     │               │               │
     ▼               ▼               ▼
  MetarPanel     git commit      vercel --prod
  React.memo     git push        Live URL
  Error state    
```

**Agent assignments:**
- **Agent 1 — Optimize:** Wire MetarPanel, add React.memo, add error handling
- **Agent 2 — Push:** Commit changes, create GitHub repo, push to main
- **Agent 3 — Deploy:** Build production bundle, deploy to Vercel

**Parallel variant:** All 3 agents launched simultaneously. Agent 2 pushes whatever is on disk (doesn't wait for Agent 1). Agent 3 deploys independently. This trades strict ordering for speed — subsequent pipeline runs catch up.

**Result:** Code optimized, pushed to GitHub, and live on Vercel in a single command cycle.

---

## When to Use Each Pattern

| Pattern | Best for | Agent count | Execution |
|---------|----------|-------------|-----------|
| **Fan-out/Fan-in** | Exploring a problem across known dimensions | 3-5 | Parallel |
| **Stochastic Consensus** | Finding the best solution when many approaches exist | 5+ | Parallel |
| **Pipeline** | Sequential workflows (build → test → deploy) | 2-4 | Sequential or parallel |

## Key Principles

1. **Brief each agent like a new colleague** — full context, clear scope, no assumptions
2. **Independent research prevents groupthink** — agents don't see each other's work
3. **The synthesizer is the human** — you decide what consensus means and which dissent matters
4. **Cache agent results** — consensus findings become reusable project knowledge
5. **Parallel by default** — launch all agents simultaneously unless outputs are dependencies
