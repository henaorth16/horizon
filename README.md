# Ethiopia Migration & Displacement Observatory

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.2-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3.0-blue?logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0.5-729B1B?logo=vitest)](https://vitest.dev/)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-amber.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Zero Tracking](https://img.shields.io/badge/Tracking-Zero%20Cookies-emerald.svg)](https://observatory.et/privacy)

A public, humanitarian-grade data synthesis platform and interactive visualization observatory providing subnational and longitudinal intelligence on human mobility across Ethiopia. 

The observatory reconciles verified humanitarian datasets from the **International Organization for Migration (IOM DTM)**, the **United Nations High Commissioner for Refugees (UNHCR)**, the **United Nations Office for the Coordination of Humanitarian Affairs (OCHA HDX)**, and the **United Nations Department of Economic and Social Affairs (UN DESA)**.

---

## Key Features

- **Subnational Choropleth Mapping**: Admin 1 regional displacement tracking across 12 Ethiopian administrative regional states with synchronized metric and driver cross-filtering.
- **Interactive 3D Migration Globe & 2D Equal Earth Projection**: Global orthographic projection rendering bilateral migration corridors, hosted refugee origins, and diaspora destinations with WCAG-compliant high-contrast fallbacks.
- **Demographics & Population Pyramids**: Age-sex cohort breakdowns with automated Statistical Disclosure Control (SDC suppression for cells $< 5$).
- **Drivers & Crisis Corridors**: Temporal tracking of displacement triggers (conflict, drought, riverine flash floods) across assessment rounds.
- **Harmonized Data Explorer**: Searchable, sortable, and paginated records with OWASP-sanitized CSV export and authenticated JSON envelopes.
- **Academic Citation Generator**: Instant copy-to-clipboard APA, Chicago, and BibTeX citations for active baseline datasets.
- **Strict Zero-Tracking Architecture**: Zero tracking cookies, zero third-party commercial pixels, and ephemeral URL-based state synchronization.

---

## The Non-Additive Population Rule

In accordance with international humanitarian law and statistical integrity standards:

> **IDP, refugee, returnee, and migrant caseloads must NEVER be summed into a combined figure.**

- **3,392,200 Internally Displaced Persons (IDPs)** *(IOM DTM Round 37)* — Ethiopian citizens displaced internally by conflict or climate shocks governed under the 1998 Guiding Principles on Internal Displacement.
- **1,811,400 Tracked Returnees** *(IOM DTM Round 37)* — Former IDPs who have returned to their communities of origin undergoing transitional stabilization.
- **979,846 Hosted Refugees** *(UNHCR Year-End 2023/2024)* — Foreign nationals fleeing persecution or war governed under the 1951 Geneva Refugee Convention and 1969 OAU Convention.
- **63,747 Asylum Seekers** *(UNHCR Year-End 2023/2024)* — Registered individual asylum claims pending status adjudication.

*Detailed documentation on taxonomy isolation and source precedence is available in [docs/methodology.md](docs/methodology.md).*

---

## Prerequisites

Before setting up the project locally, ensure you have the following installed:

- **Node.js**: Version `20.x` or higher (`node -v`)
- **pnpm**: Version `9.x` or higher (`corepack enable pnpm` or `npm install -g pnpm`)

---

## Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/refugees-data-vis.git
   cd refugees-data-vis
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```

3. **Install dependencies**:
   ```bash
   pnpm install
   ```

4. **Start the development server**:
   ```bash
   pnpm dev
   ```

5. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Test Commands

The codebase maintains strict automated test coverage across contracts, normalization rules, chart primitives, accessibility, and end-to-end user journeys:

```bash
# Run the complete test suite (240+ tests across 23 test suites)
pnpm test

# Run Vitest in interactive watch mode
pnpm test:watch

# Execute TypeScript compiler typecheck (strict mode)
pnpm typecheck

# Run Next.js ESLint verification
pnpm lint

# Build optimized production bundle with Next.js Turbopack
pnpm build

# Verify live upstream API connectivity (optional network check)
pnpm proof-of-access
```

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS APP ROUTER                              │
│       Pages: Overview (/), Inside Ethiopia (/inside-ethiopia),         │
│     Migration Globe (/globe), Across Borders (/across-borders),        │
│       Demographics (/demographics), Data Explorer (/explorer),         │
│          Methodology (/methodology), Terms (/terms), Privacy (/privacy)│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    │                               │                               │
┌───▼─────────────────────┐ ┌───────▼─────────────────────┐ ┌───────▼─────────────────────┐
│ PRESENTATION & D3 MAPS  │ │ FILTER & STATE SYNC         │ │ DATA & SDC EXPORT           │
│ • D3 Choropleth (Adm1)  │ │ • URL SearchParams sync     │ │ • OWASP CSV sanitization    │
│ • D3 3D Globe / 2D Map  │ │ • Ephemeral in-memory state │ │ • SDC threshold (< 5)       │
│ • Sankey & Pyramids     │ │ • Zero tracking cookies     │ │ • JSON metadata envelope    │
└───┬─────────────────────┘ └─────────────────────────────┘ └───┬─────────────────────┘
    │                                                           │
    └───────────────────────────────┬───────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    DATA CONTRACTS & REPOSITORY LAYER                   │
│ • Zod Schemas (Observations, Indicators, Locations, Snapshots)         │
│ • Idempotent Ingestion Pipeline (SHA-256 Checksums, Quality Rules)     │
│ • Local In-Memory Fallback Cache (Outage & Corruption Resilience)      │
└────────────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```text
├── data/
│   ├── processed/          # Validated JSON observation datasets (IOM, UNHCR)
│   └── raw/                # Immutable, versioned raw ingestion snapshots
├── docs/
│   ├── methodology.md      # Non-additive principles & source precedence rules
│   ├── data-dictionary.md  # Schema fields, P-codes, and data contracts
│   └── ...                 # Architectural decision records
├── src/
│   ├── app/                # Next.js App Router route segments and API routes
│   │   ├── (modules)/      # Feature pages (inside-ethiopia, globe, explorer...)
│   │   ├── terms/          # Terms of use & humanitarian charter
│   │   ├── privacy/        # Privacy policy & zero-tracking commitment
│   │   └── attribution/    # CC BY 4.0 source accreditations & citations
│   ├── components/
│   │   ├── charts/         # ExecutiveTrendLine, EmptyState, ErrorState
│   │   ├── demographics/   # PopulationPyramid, CompositionBarChart
│   │   ├── explorer/       # ObservationExplorer, CitationGuidanceCard
│   │   ├── globe/          # GlobeViewport, GlobalMigrationAtlas
│   │   ├── layout/         # AppShell, Navigation, Header, Breadcrumbs
│   │   ├── maps/           # EthiopiaChoroplethMap, InsideEthiopiaView
│   │   └── ui/             # Badges, Cards, Skeletons, StaleDataIndicators
│   ├── lib/
│   │   ├── adapters/       # UNHCR API and OCHA HDX CKAN ingestion clients
│   │   ├── contracts/      # Zod validation schemas for all data models
│   │   ├── db/             # Local database repository, query engine, fallbacks
│   │   ├── export/         # Safe CSV & JSON exports with formula sanitization
│   │   ├── geo/            # TopoJSON boundary loaders and flow calculators
│   │   └── state/          # ObservatoryFilterContext & URL deep-linking
│   └── test/               # Comprehensive Vitest & React Testing Library tests
```

---

## Data Providers & Attributions

All primary data is redistributed in accordance with **Creative Commons Attribution 4.0 International (CC BY 4.0)**:

- **IOM DTM (International Organization for Migration)**: Displacement Tracking Matrix Site Assessment & Village Assessment Round 37 (August 2024).
- **UNHCR (United Nations High Commissioner for Refugees)**: Refugee Data Finder and Operational Data Portal (2023/2024 Year-End Report).
- **OCHA HDX (Humanitarian Data Exchange)**: Common Operational Datasets for Administrative Boundaries (COD-AB).
- **UN DESA (Department of Economic and Social Affairs)**: International Migrant Stock 2020/2024 Revision.

For complete academic citations in APA, Chicago, and BibTeX, visit [`/attribution`](https://observatory.et/attribution) or consult [`docs/methodology.md`](docs/methodology.md).

---

## Privacy Policy & Ethics

- **Zero Tracking Cookies**: No user profiling, no advertising cookies, no persistent cross-site tracking beacons.
- **Statistical Disclosure Control**: Individual counts $< 5$ are suppressed in demographic breakdowns to eliminate deductive re-identification risks for displaced persons.
- **Humanitarian Purpose**: Data is compiled strictly for informational, analytical, and policy planning purposes.
