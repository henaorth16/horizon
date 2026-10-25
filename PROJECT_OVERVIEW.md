# Ethiopia Migration & Displacement Observatory (EMDO)
## Project Overview, Thematic Focuses, Data Sources & Analytical Takeaways

---

## 1. Executive Summary & Project Purpose

The **Ethiopia Migration & Displacement Observatory (EMDO)** is an open-source, humanitarian-grade data synthesis platform and interactive visualization observatory. It provides subnational, longitudinal, and cross-border intelligence on human mobility across Ethiopia and the broader Horn of Africa.

### The Problem It Solves
Human mobility in the Horn of Africa is among the most intricate in the world. Millions of individuals are on the move due to concurrent armed conflicts, historical pastoral clashes, severe climate shocks (such as multi-year drought in the lowlands and seasonal riverine flash floods), and economic migration. However, public and policy discourse often suffers from:
1. **Data Fragmentation**: Humanitarian information is siloed across separate UN agencies, non-governmental organizations, and national databases with differing formats, geographic definitions, and reporting cadences.
2. **Methodological Misrepresentation (Conflation)**: Casual analyses often sum internally displaced persons, cross-border refugees, and returnees into a single monolithic number, creating severe double-counting and legal ambiguity.
3. **Accessibility & Usability Barriers**: Static PDF situation reports and raw spreadsheets prevent decision-makers, researchers, and journalists from interactively exploring subnational geographic trends, demographic pyramids, or crisis corridors.
4. **Privacy & Tracking Risks**: Many modern data dashboards employ commercial tracking pixels and cookies that pose surveillance risks to vulnerable displaced populations.

### The Mission
EMDO reconciles official, verified humanitarian datasets into a cohesive, interactive, zero-tracking analytical observatory. By upholding strict international humanitarian law standards, statistical disclosure controls, and rigorous data pipelines, EMDO transforms complex displacement registries into actionable, transparent, and ethically grounded visual intelligence.

---

## 2. Core Thematic Focuses & Modules

The platform is structured into dedicated analytical modules, each addressing a critical dimension of human mobility:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                     ETHIOPIA MIGRATION & DISPLACEMENT OBSERVATORY                       │
└───────────────────────────────────────────┬─────────────────────────────────────────────┘
                                            │
    ┌───────────────────────────┬───────────┴───────────┬───────────────────────────┐
    │                           │                       │                           │
┌───▼──────────────────┐  ┌─────▼────────────────┐  ┌───▼──────────────────┐  ┌─────▼────────────────┐
│ 1. INSIDE ETHIOPIA   │  │ 2. ACROSS BORDERS    │  │ 3. CRISIS DRIVERS    │  │ 4. DEMOGRAPHICS &    │
│ Subnational IDP &    │  │ Hosted Refugees &    │  │ Conflict vs. Climate │  │    VULNERABILITIES   │
│ Returnee Tracking    │  │ Diaspora Corridors   │  │ Longitudinal Trends  │  │ Age-Sex Pyramids &   │
│ (Admin 1 Choropleth) │  │ (3D Globe / 2D Map)  │  │ Multi-Hazard Shocks  │  │ SDC Suppression      │
└───┬──────────────────┘  └─────┬────────────────┘  └───┬──────────────────┘  └─────┬────────────────┘
    │                           │                       │                           │
    └───────────────────────────┼───────────────────────┴───────────────────────────┘
                                │
    ┌───────────────────────────┴───────────────────────────────────────────────────┐
    │ 5. MULTISECTORAL NEEDS & DATA EXPLORER                                        │
    │ Intersectoral Emergency Gaps (WASH, Shelter, Food) • OWASP CSV & JSON API     │
    └───────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Subnational Internal Displacement (`/inside-ethiopia`)
- **Geographic Scale**: Subnational Admin 1 (12 Regional States: Tigray, Afar, Amhara, Oromia, Somali, Benishangul-Gumuz, Sidama, South West Ethiopia, Central Ethiopia, Southern Ethiopia, Gambela, and Harari, plus Addis Ababa and Dire Dawa chartered cities).
- **Core Caseloads**: 
  - **3,392,200 Internally Displaced Persons (IDPs)** across 3,293 assessed displacement sites.
  - **1,811,400 Tracked Returnees** across 2,148 assessed villages.
- **Key Capabilities**: Interactive D3.js Admin 1 choropleth maps, zone-level drill-downs, dynamic filtering by displacement driver (conflict vs. climate), and temporal comparison across IOM assessment rounds.

### 2.2 Cross-Border Inflows & Global Corridors (`/across-borders` & `/globe`)
- **Ethiopia as a Regional Sanctuary**: Tracks the **979,846 refugees** and **63,747 registered asylum seekers** hosted within Ethiopia's borders, disaggregated by country of origin:
  - **South Sudan**: 421,438 refugees (primarily settled in Gambela and Benishangul-Gumuz camps).
  - **Somalia**: 312,185 refugees (concentrated in the Somali Region, including the Doolo and Mirqaan influxes).
  - **Eritrea**: 168,793 refugees (historically in Tigray and Afar, now dispersed across urban and regional settlements).
  - **Sudan**: 77,430 refugees (driven by the recent Sudanese civil war via border points such as Metema and Kurmuk).
- **Global Orthographic 3D Globe & 2D Equal Earth Projection**: Visualizes bilateral Ethiopian diaspora corridors (Sudan, Saudi Arabia, USA, Germany, Kenya, South Africa) and irregular transit corridors (Eastern Route to Yemen and the Gulf, Southern Route to South Africa, and Northern Route to Europe).

### 2.3 Crisis Drivers & Multi-Hazard Shocks (`/drivers`)
- **Causal Disaggregation**: Distinguishes primary displacement triggers:
  - **Conflict & Intercommunal Violence**: Dominant in Tigray, Amhara, and parts of Oromia and Benishangul-Gumuz.
  - **Severe Prolonged Drought**: Dominant in the pastoralist lowlands of Somali and southern Oromia (Borena/Guji).
  - **Seasonal Riverine & Flash Flooding**: Recurrent in Afar (Awash basin), Somali (Shabelle/Genale basins), and Gambela.
- **Longitudinal Assessment Shifts**: Examines how climate shocks compound conflict-induced displacement, turning seasonal emergencies into protracted multi-year displacements.

### 2.4 Demographics, Vulnerability & Statistical Disclosure Control (`/demographics`)
- **Age-Sex Population Pyramids**: Granular distribution across 5 key humanitarian cohorts (`0–4`, `5–11`, `12–17`, `18–59`, `60+`) disaggregated by sex.
- **Vulnerability Indicators**: Quantifies female-headed households, pregnant and lactating women (PLW), unaccompanied and separated children (UASC), and persons with disabilities.
- **Statistical Disclosure Control (SDC)**: Implements automated threshold suppression ($N < 5$) to prevent re-identification of small populations in low-count administrative zones.

### 2.5 Multisectoral Humanitarian Needs & Gaps (`/humanitarian-needs`)
- Tracks severe priority gaps across key humanitarian sectors:
  - **Water, Sanitation & Hygiene (WASH)**: Percentage of sites without access to clean drinking water within a 30-minute walk.
  - **Emergency Shelter & Non-Food Items (NFI)**: Overcrowding and substandard makeshift shelter prevalence.
  - **Food Security & Livelihoods**: Primary coping mechanisms and food distribution regularity.
  - **Health & Education**: Displaced children without formal schooling access and health post proximity.

### 2.6 Harmonized Data Explorer & Open Research API (`/explorer`, `/api`)
- **Data Interoperability**: Full-text searchable and filterable table of standardized observation records.
- **Zero-Trust Security**: OWASP-sanitized CSV export (protecting against CSV formula injection) and authenticated JSON envelopes.
- **Academic Citations**: Instant 1-click citation generators formatted in APA, Chicago, and BibTeX for academic and policy citation.

---

## 3. Authoritative Data Sources & Integration Pipeline

The observatory does not collect primary field surveys; instead, it establishes an automated, validated ingestion bridge across official public data providers governed by international mandates.

| Source Provider | Primary Mandate | Ingestion Protocol | Geographic Resolution | Update Cadence | Governing License |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **IOM DTM Ethiopia** | Internally Displaced Persons & Returnees | HDX CKAN API / Round CSV | Admin 0, 1, 2, and Displacement Sites | Bimonthly Site Assessment Rounds | CC BY 4.0 |
| **UNHCR Refugee Data Finder** | Cross-border Refugees & Asylum Seekers | REST API (JSON) | Country of Origin (COO) & Country of Asylum (COA) | Mid-Year & Annual Global Trends | CC BY 4.0 |
| **UN OCHA (HDX & COD-AB)** | Common Operational Administrative Boundaries | TopoJSON / GeoJSON | Admin 0, 1, 2, 3 Standardized P-Codes | Realigned as gazetted | Open / CC BY-IGO |
| **UN DESA Population Division** | International Migrant Stocks | Bilateral Matrix Tables | National (Admin 0) Bilateral Pairs | 5-Year Cyclical Revisions | UN Open Data |
| **IDMC (Internal Displacement Monitoring Centre)** | Disaster & Conflict Displacement Incidents | Helix REST API | National & Geocoded Crisis Events | Real-time & Annual Consolidated | CC BY 3.0 IGO |
| **FEWS NET / IPC** | Drought & Integrated Food Security Phase Classification | IPC Global Data Portal | Livelihood Zones & Admin 2 | Quarterly Outlooks / Monthly Updates | Public Domain |
| **IOM Missing Migrants Project** | Transit Route Fatalities & Disappearances | Incident REST API / CSV | Geocoded Incident Points (Horn of Africa) | Weekly / Monthly Verification | CC BY 4.0 |

### Ingestion Pipeline Architecture & Quality Controls
1. **Zod Schema Validation**: Strict TypeScript validation on every ingested record (`ObservationSchema`, `LocationSchema`, `IndicatorSchema`).
2. **SHA-256 Checksums & Snapshots**: Every raw input file is hashed and immutably versioned in `data/raw/` with verifiable cryptographic audit trails.
3. **P-Code Normalization**: Reconciles changing administrative boundaries (e.g., historical SNNPR re-organization into Sidama `ET14`, South West Ethiopia `ET13`, Central Ethiopia `ET15`, and South Ethiopia `ET16`) using authoritative UN OCHA COD-AB standards.
4. **Resilience & Outage Fallback**: In-memory and local file-backed fallbacks ensure uninterrupted visualization even during upstream UN API outages.

---

## 4. Key Analytical Points & Core Messages the Project Shows

The Ethiopia Migration & Displacement Observatory communicates several vital analytical, legal, and operational realities:

### 1. The Non-Additive Population Rule is Non-Negotiable
- **The Core Rule**: *IDPs, refugees, returnees, and international migrants must never be added together.*
- **Why?**
  - **Legal Distinction**: IDPs (3.39M) are Ethiopian citizens residing within their country, protected under the 1998 UN Guiding Principles and the AU Kampala Convention. In contrast, refugees (979.8K) are foreign nationals crossing international borders, protected under the 1951 Geneva Convention.
  - **Double-Counting Hazard**: Adding returnees (1.81M) to active IDPs creates significant double-counting, as returnees are former IDPs transitioning back into origin communities.
  - **Operational Resource Allocation**: Blending populations misleads humanitarian appeal allocations and distorts institutional mandates (IOM/EDRMC for internal mobility vs. UNHCR/RRS for international asylum).

### 2. The Intersection of Conflict and Climate Shocks
- Displacement in Ethiopia cannot be reduced to a single cause. 
- In regional states like **Somali** and **Oromia**, catastrophic climate shocks (historic multi-year drought followed by severe El Niño floods) destroyed pastoral livelihoods and displaced hundreds of thousands into semi-permanent camps.
- In **Tigray**, **Amhara**, and **Afar**, armed conflicts caused mass sudden displacements, acute infrastructure destruction, and lingering protection risks.
- The observatory shows that **climate displacement is increasingly becoming protracted**, challenging the conventional assumption that climate-displaced communities return quickly after rains arrive.

### 3. Extreme Demographic Vulnerability: A Crisis Borne by Children
- Demographic pyramids across both IDP site assessments and UNHCR refugee registrations reveal that **over 52% of all displaced persons in Ethiopia are children under the age of 18**.
- In several refugee camps (notably Gambela hosting South Sudanese refugees), the child dependency ratio exceeds 60%.
- This demographic reality highlights the acute need for long-term investments in child protection, primary education, trauma support, and nutrition, moving beyond short-term emergency rations.

### 4. The "Returnee Gap": Returning Does Not Equal Recovery
- With **1,811,400 returnees** tracked across over 2,100 villages, the data reveals a stark "Returnee Gap":
  - Returning populations frequently return to destroyed housing, looted agricultural tools, damaged water schemes, and contested land titles.
  - A substantial percentage of returnee communities face severe secondary vulnerability, showing that return does not equal durable solution without targeted post-displacement stabilization.

### 5. Ethiopia’s Dual Role as Sanctuary and Displacement Epicenter
- Ethiopia occupies a unique, pivotal position in the Horn of Africa:
  - **Major Country of Asylum**: Ethiopia is Africa's third-largest refugee-hosting nation, sheltering nearly 1 million refugees fleeing violence in South Sudan, Somalia, Eritrea, and Sudan.
  - **Major Country of Internal Displacement**: Ethiopia simultaneously hosts nearly 3.4 million internally displaced citizens.
  - **Major Origin & Transit Hub**: Ethiopia sits at the crossroads of outbound migration routes, with tens of thousands attempting perilous journeys across the Gulf of Aden (Eastern Route) or through the Sahara (Northern Route).

### 6. Ethical Humanitarian Data Governance & Zero-Surveillance Architecture
- Protecting vulnerable populations requires more than legal compliance; it demands privacy-respecting technology:
  - **Zero Commercial Tracking**: EMDO contains zero advertising tags, zero commercial tracking cookies, and zero behavioral telemetry.
  - **URL-Synced Ephemeral State**: User filter selections and geographic drill-downs are synchronized exclusively via URL query parameters, enabling seamless bookmarking and sharing without server-side user tracking.
  - **Automatic Statistical Disclosure Control (SDC)**: Sub-threshold counts ($N < 5$) are suppressed across demographic visualizations and data exports to prevent the identification of vulnerable households in remote woredas.

---

## 5. Technology Stack & Design System

The platform is engineered using modern, high-performance web standards:

- **Framework**: Next.js 16 (App Router) & React 19.
- **Styling**: Tailwind CSS v4 with a custom humanitarian design token system (Emergency Red, Climate Teal, Displaced Amber, Ocean Cyan).
- **Visualization Primitives**: D3.js (orthographic projection, Equal Earth projection, choropleth geo-path generators, demographic pyramids, flow arcs).
- **Validation & Integrity**: Zod schemas, SHA-256 integrity verification, and Vitest test suite (240+ unit and contract tests).
- **Accessibility**: Strict WCAG 2.1 AA compliance with keyboard navigation, screen-reader data tables alongside charts, and high-contrast color palettes.

---

## 6. Repository Quick Reference

- **Methodology & Non-Additive Rules**: [`docs/methodology.md`](file:///home/hena/Documents/side%20projects/refugees-data-vis/docs/methodology.md)
- **Data Dictionary & Schema Contracts**: [`docs/data-dictionary.md`](file:///home/hena/Documents/side%20projects/refugees-data-vis/docs/data-dictionary.md)
- **Data Sources & API Integrations**: [`docs/data-sources.md`](file:///home/hena/Documents/side%20projects/refugees-data-vis/docs/data-sources.md)
- **Subnational Regional Module**: [`src/app/inside-ethiopia/page.tsx`](file:///home/hena/Documents/side%20projects/refugees-data-vis/src/app/inside-ethiopia/page.tsx)
- **3D Migration Globe**: [`src/app/globe/page.tsx`](file:///home/hena/Documents/side%20projects/refugees-data-vis/src/app/globe/page.tsx)
- **Harmonized Data Explorer**: [`src/app/explorer/page.tsx`](file:///home/hena/Documents/side%20projects/refugees-data-vis/src/app/explorer/page.tsx)
- **Demographics & Vulnerabilities**: [`src/app/demographics/page.tsx`](file:///home/hena/Documents/side%20projects/refugees-data-vis/src/app/demographics/page.tsx)
- **Humanitarian Sectoral Needs**: [`src/app/humanitarian-needs/page.tsx`](file:///home/hena/Documents/side%20projects/refugees-data-vis/src/app/humanitarian-needs/page.tsx)

---

*Authored for the Ethiopia Migration & Displacement Observatory. Distributed under Creative Commons Attribution 4.0 International (CC BY 4.0).*
