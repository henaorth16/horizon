# Architecture Decisions & Tech Stack Evaluation

**Project:** Ethiopia Migration & Displacement Observatory  
**Status:** Approved & Implemented  
**Date:** October 2026  

---

## 1. Executive Summary & Philosophy

The Ethiopia Migration & Displacement Observatory is designed to be an authoritative, transparent, and responsive data-journalism platform that visualizes complex migration, displacement, demographic, and humanitarian data. To fulfill these demands reliably, the technology stack prioritizes:

1. **Lightweight, Modular Bundles:** Avoiding heavy monolithic dependencies or black-box charting suites.
2. **Defensive Data Handling:** Runtime validation at every boundary to guard against upstream humanitarian schema drift.
3. **Declarative Rendering with D3 Math:** React owns the DOM and SVG nodes, while D3 provides mathematical scales, shapes, and geographic projections.
4. **Resilience & Caching:** Idempotent local ingestion with raw snapshot retention ensuring that remote API outages never wipe valid data.
5. **Accessibility as a First-Class Requirement:** Accessible color contrasts, screen-reader text alternatives, table fallbacks for charts, and reduced-motion compliance.

---

## 2. Technology Stack & Installed Packages

| Category | Technology / Package | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | `next` | `16.4.2` | App Router, Server Components, Route Handlers, Turbopack |
| **Core UI Runtime** | `react`, `react-dom` | `19.3.0` | React 19 concurrent features and modern hooks |
| **Language** | `typescript` | `5.9.3` | Strict type safety across datasets, contracts, and components |
| **Styling** | `tailwindcss` | `4.3.3` | Utility-first CSS engine with dark observatory theme tokens |
| **Modular D3** | `d3-scale` | `4.0.2` | Continuous, categorical, and quantile scales |
| | `d3-axis` | `3.0.0` | Axis geometry calculations |
| | `d3-shape` | `3.2.0` | Lines, areas, arcs, and Sankey/pie path generators |
| | `d3-geo` | `3.1.1` | Spherical math, GeoJSON path generators, and orthographic projections |
| | `d3-geo-projection` | `4.0.0` | Extended geographic projections for world and regional maps |
| | `d3-array` | `3.2.4` | Statistical rollups, bins, extents, and quantiles |
| | `d3-color` | `3.1.0` | Color manipulation, CIE Lab / Lch interpolation |
| | `d3-interpolate` | `3.0.1` | Smooth data and color interpolators |
| | `d3-selection` | `3.0.0` | Low-level D3 utilities when needed |
| | `d3-zoom` | `3.0.0` | Pan and zoom transformations for map viewports |
| **Topology** | `topojson-client` | `3.1.0` | Decoding TopoJSON geometries (Admin 0, Admin 1, Admin 2) |
| **Validation** | `zod` | `4.6.7` | Runtime data contract validation for all incoming and API data |
| **UI Helpers** | `clsx`, `tailwind-merge` | `2.1.1` / `3.7.0` | Conditional class joining without Tailwind collision conflicts |
| **Icons** | `lucide-react` | `1.60.0` | Accessible, tree-shakeable SVG icons |
| **Testing** | `vitest` | `5.0.5` | High-speed ESM test runner |
| | `@testing-library/react` | `16.3.3` | Component interaction and DOM testing |
| | `@testing-library/jest-dom`| `7.0.1` | Custom matchers for DOM node inspection |
| | `jsdom` | `30.1.3` | Headless browser DOM environment for testing |
| | `@vitejs/plugin-react` | `6.1.2` | Vite React integration for Vitest |
| **Package Manager**| `pnpm` | `11.4.0` | Strict, deterministic, content-addressable dependency store |

---

## 3. Architecture Decision Records (ADRs)

### ADR-001: Next.js App Router (React 19)

- **Context:** The application needs both statically generated marketing/editorial sections and dynamic, parameterized data exploration views with server-side caching.
- **Decision:** Adopt Next.js 16/15+ App Router.
- **Rationale:**
  - Route handlers (`src/app/api/...`) allow typed local API endpoints with built-in cache controls (`revalidate`).
  - Server Components handle metadata generation, SEO, and static documentation rendering without sending unnecessary JavaScript to the client.
  - Interactive visualization widgets are isolated as `"use client"` leaf components.
- **Trade-off:** Requires disciplined boundary management between Server and Client components.

### ADR-002: Modular D3 vs Monolithic D3 vs Chart Wrappers (Recharts/Chart.js)

- **Context:** Visualizations include custom choropleths of Ethiopian administrative zones, population pyramids, Sankey flow diagrams, and a 3D/orthographic globe. Pre-packaged charting libraries (such as Chart.js or Recharts) impose rigid DOM structures, poor geographic projection support, and bundle bloat.
- **Decision:** Install only granular, modular D3 packages (`d3-scale`, `d3-geo`, `d3-shape`, etc.) without the monolithic `d3` bundle.
- **Pattern:** Use the "React for DOM, D3 for Math" pattern:
  - D3 functions compute SVG paths (`d3.geoPath()`), scale values (`d3.scaleLinear()`), and axis ticks.
  - React renders `<svg>`, `<path>`, `<rect>`, and `<g>` elements directly in JSX.
  - This preserves React's virtual DOM reconciliation and enables standard unit testing with Vitest and Testing Library.
- **Trade-off:** Requires writing custom SVG layout wrappers rather than dropping in off-the-shelf chart components, but delivers total design control and superior rendering performance.

### ADR-003: Geographic Data Handling with TopoJSON

- **Context:** Administrative boundary GeoJSON files for Ethiopia (Regions, Zones, Woredas) can be large (10MB+), leading to slow network transfers and sluggish mobile interaction.
- **Decision:** Use `topojson-client` to decode compact TopoJSON topologies at runtime on the client or pre-converted during the build step.
- **Rationale:** TopoJSON eliminates shared boundary redundancy, reducing payload sizes by 70–85% compared to raw GeoJSON while preserving boundary topology and shared borders.

### ADR-004: Runtime Validation with Zod

- **Context:** Humanitarian data sources (IOM DTM, HDX, UNHCR, IDMC) frequently update schemas, alter column names, or output unexpected null/string types for numerical values.
- **Decision:** Use Zod schemas to validate all data ingested from external sources and all data returned by internal API endpoints.
- **Rationale:**
  - Guarantees compile-time TypeScript type inference directly from runtime schemas.
  - Generates clear, actionable validation error messages if an upstream API changes.
  - Rejects malformed observations before they enter the application state or database.

### ADR-005: Local Storage, Caching, and Ingestion Architecture

- **Context:** Ingestion pipelines must be repeatable, idempotent, and resilient against third-party API downtime or rate-limiting.
- **Decision:**
  - Raw ingested payloads are preserved in a versioned local JSON cache (`/data/raw/<source>/<timestamp>.json`).
  - Normalized, validated observations are stored in structured JSON/SQLite stores with explicit composite keys `(location_id, indicator_id, reporting_period, population_type)`.
  - Upstream network failures trigger warnings and fall back to the last known-good snapshot rather than erasing valid data.

### ADR-006: Styling System — Editorial Dark Observatory

- **Context:** Editorial data-journalism aesthetics require deep dark surfaces, sharp high-contrast typography, and restrained warm accents (amber, terracotta, cyan for neutral categories) to avoid visual fatigue and ensure color-blind accessibility.
- **Decision:** Use Tailwind CSS v4 with custom theme tokens.
- **Rationale:** Utility classes ensure zero CSS runtime overhead and rapid responsive prototyping. Color scales will adhere strictly to WCAG AA/AAA contrast ratios against dark backgrounds.

### ADR-007: Testing Stack — Vitest + React Testing Library

- **Context:** We need fast, reliable unit tests for normalization rules, Zod schemas, data aggregations, and SVG rendering without the overhead of heavy configuration.
- **Decision:** Use Vitest with `jsdom` and `@testing-library/react`.
- **Rationale:**
  - Vitest provides native ESM and TypeScript execution out of the box with near-instant hot-reloading.
  - Compatible with Jest DOM assertions (`toBeInTheDocument()`, `toHaveAttribute()`).
  - Complements Playwright for upcoming end-to-end browser tests.

---

## 4. Verification & Validation Summary

The configured stack was verified via the following checks:
- **Dependency Installation:** Successfully installed modular D3, TopoJSON, Zod, Vitest, Testing Library, and Lucide React via `pnpm`.
- **Unit Testing:** Ran `pnpm test` verifying Zod schema validation and D3 scale generation in 1.95s (all tests passing).
- **TypeScript Strict Check:** Ran `pnpm typecheck` (`tsc --noEmit`) with zero errors.
- **Production Build:** Ran `pnpm build` with Turbopack, generating static pages and route types cleanly in 8.9s.
