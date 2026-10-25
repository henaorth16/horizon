# Scientific Methodology, Non-Additive Principles & Source Precedence

*Ethiopia Migration & Displacement Observatory*  
*Version 1.0 — October 2026*  
*License: Creative Commons Attribution 4.0 International (CC BY 4.0)*

---

## 1. Executive Summary & Purpose

The **Ethiopia Migration & Displacement Observatory** is an open-source humanitarian data synthesis platform designed to provide verified, longitudinal, and subnational intelligence on human mobility across Ethiopia. 

Human mobility in the Horn of Africa is characterized by complex, overlapping, and concurrent drivers—including localized armed conflict, protracted drought cycles in the lowlands, seasonal riverine flooding, and regional cross-border displacement corridors. In this complex operational environment, superficial data aggregation frequently leads to misinformation, double-counting, and misallocation of emergency aid.

This document establishes the scientific principles, taxonomy boundaries, source precedence hierarchy, and statistical disclosure rules governing every visual chart, map, indicator calculation, and data export on this observatory.

---

## 2. The Non-Additive Population Principle

### 2.1 The Fundamental Rule

> **MANDATE ISOLATION RULE**:  
> **Internally Displaced Persons (IDPs), refugees, asylum seekers, returnees, and international migrants MUST NEVER be summed together into a single composite displacement figure.**

Each population category operates under separate international legal frameworks, distinct institutional mandates, independent data collection methodologies, and divergent legal statuses.

```
       ┌─────────────────────────────────────────────────────────────┐
       │              HUMAN MOBILITY IN ETHIOPIA                     │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              │                                               │
    [INTERNAL MOBILITY]                             [CROSS-BORDER MOBILITY]
   Primary: IOM DTM / Gov                          Primary: UNHCR / RRS / UN DESA
              │                                               │
     ┌────────┴────────┐                             ┌────────┴────────┐
     │                 │                             │                 │
   [IDPs]         [Returnees]                   [Refugees]     [Asylum Seekers]
  3,392,200        1,811,400                     979,846            63,747
(Guiding Princ.)  (Post-Return)                (1951 Conv.)      (Under Review)
```

### 2.2 Why Population Categories Cannot Be Added

1. **Risk of Severe Double-Counting**:
   - A former IDP who returns to their community of origin may be tracked in an IOM Village Assessment as a *returnee*, while emergency assistance rosters may still register them under ongoing displacement aid.
   - An individual displaced across an administrative boundary might be captured as an IDP in regional site assessments, while cross-border returnees from Sudan or Somalia might simultaneously register under transitional returnee programs.
2. **Legal and Mandate Divergence**:
   - **IDPs**: Ethiopian citizens who remain within sovereign national borders. Governed under the *1998 UN Guiding Principles on Internal Displacement* and the *African Union Kampala Convention*. Primary coordination is led by the Ethiopian Disaster Risk Management Commission (EDRMC) and the IOM DTM.
   - **Refugees**: Foreign nationals fleeing persecution, conflict, or serious public disorder who have crossed an international border into Ethiopia. Governed under the *1951 Refugee Convention* and *1969 OAU Convention*. Primary coordination is led by UNHCR and Ethiopia's Refugees and Returnees Service (RRS).
   - **Asylum Seekers**: Individuals who have crossed an international frontier and submitted formal applications for refugee status whose claims have not yet been definitively evaluated.
   - **Returnees**: Former IDPs or former refugees who have returned to their habitual residence or community of origin within Ethiopia. They require transitional reintegration monitoring, not emergency flight assistance.
   - **International Migrants**: Persons residing outside their country of birth or citizenship (captured by UN DESA census matrices), including labor migrants, diplomats, and long-term residents.
3. **Analytical Distortion**:
   - Summing 3.4M IDPs and 1.0M refugees into "4.4M displaced persons" misrepresents humanitarian resource requirements, misidentifies the responsible international lead agencies, and conflates internal sovereign civil protection with international refugee law.

---

## 3. Hierarchy of Source Precedence & Conflict Resolution

When multiple humanitarian agencies report on population movements in the same geographic area, conflicting figures can arise due to differing assessment schedules, methodologies, and access restrictions. The observatory enforces a strict **Hierarchy of Precedence**:

| Domain | Primary Authority | Secondary / Corroborative | Precedence Rule |
| :--- | :--- | :--- | :--- |
| **Internal Displacement (IDPs)** | **IOM DTM** (Site Assessment) | EDRMC, OCHA Situation Reports | IOM DTM round-based assessments take precedence over flash projection estimates. |
| **Returnees (Former IDPs)** | **IOM DTM** (Village Assessment) | Regional DRM Bureaus | IOM DTM village assessments provide verified woreda-level returnee baselines. |
| **Refugees & Asylum Seekers** | **UNHCR** (Refugee Data Finder) | RRS (Ethiopian Government) | UNHCR proGres biometric registration counts supersede general population surveys. |
| **Spatial Boundaries & P-Codes** | **UN OCHA COD-AB** | Ethiopian CSA / Central Mapping | OCHA Common Operational Datasets (COD-AB) are the sole spatial reference for P-codes. |
| **International Migrant Stocks** | **UN DESA Population Division** | World Bank Migration Data | UN DESA bilateral matrices provide standardized 5-year foreign-born baseline stocks. |
| **Crisis Drivers & Triggers** | **IOM DTM Key Informants** | FEWS NET (Drought), ACLED (Conflict) | IOM primary trigger assessments categorize dominant site-level displacement factors. |

### 3.1 Conflict Resolution Protocol

1. **Round Consistency over Continuous Interpolation**:
   - For internal displacement, figures are locked to discrete assessment rounds (e.g., Round 37, August 2024). Rolling projections or partial ad-hoc updates are never merged with round totals to prevent temporal fragmentation.
2. **Mandate Authority Boundary**:
   - If IOM reports on refugees residing in host communities, UNHCR official figures remain the authoritative standard for international protection numbers.
   - If UNHCR notes internal displacement in refugee-hosting zones, IOM DTM figures remain the authoritative standard for IDP totals.
3. **Spatial Normalization**:
   - All regional states are normalized to official ISO 3166-2 / OCHA P-codes (e.g., Tigray: `ET01`, Somali: `ET05`, Oromia: `ET04`).
   - Boundary alterations (such as the formation of South Ethiopia Regional State `ET14` and Central Ethiopia Regional State `ET15`) are reconciled using OCHA COD-AB 2024 definitions.

---

## 4. Active Baseline Datasets & Academic Citations

The observatory maintains three active baseline datasets. All datasets are distributed under **Creative Commons Attribution 4.0 International (CC BY 4.0)**.

### 4.1 IOM DTM Round 37 (August 2024)
- **Scope**: Subnational IDP stock (`3,392,200`) and returnee stock (`1,811,400`) across 12 Ethiopian administrative regional states.
- **Coverage**: 3,293 assessed displacement sites; 2,148 assessed returnee villages.
- **APA**:
  ```text
  International Organization for Migration. (2024). Ethiopia — Displacement Tracking Matrix (DTM) Site Assessment and Village Assessment Round 37 (August 2024) [Data set]. IOM Displacement Tracking Matrix. https://dtm.iom.int/ethiopia
  ```
- **Chicago**:
  ```text
  International Organization for Migration (IOM). "Ethiopia — Displacement Tracking Matrix (DTM) Site Assessment and Village Assessment Round 37 (August 2024)." Geneva: IOM, 2024. https://dtm.iom.int/ethiopia.
  ```
- **BibTeX**:
  ```bibtex
  @misc{iom_dtm_ethiopia_r37_2024,
    author = {{International Organization for Migration}},
    title = {Ethiopia --- Displacement Tracking Matrix (DTM) Site Assessment and Village Assessment Round 37 (August 2024)},
    year = {2024},
    month = {August},
    publisher = {IOM Displacement Tracking Matrix},
    url = {https://dtm.iom.int/ethiopia},
    note = {Accessed via Ethiopia Migration \& Displacement Observatory. Distributed under CC BY 4.0}
  }
  ```

### 4.2 UNHCR Refugee Statistics 2024
- **Scope**: Refugee stock (`979,846`) and pending asylum seekers (`63,747`) hosted in Ethiopia by country of origin (South Sudan, Somalia, Eritrea, Sudan).
- **APA**:
  ```text
  United Nations High Commissioner for Refugees. (2024). Refugee Data Finder: Forced Displacement in 2023/2024 (Ethiopia Country of Asylum and Origin Reports) [Data set]. UNHCR Global Data Service. https://www.unhcr.org/refugee-statistics/
  ```
- **Chicago**:
  ```text
  United Nations High Commissioner for Refugees (UNHCR). "Refugee Data Finder: Forced Displacement in 2023/2024 (Ethiopia Reports)." Geneva: UNHCR, 2024. https://www.unhcr.org/refugee-statistics/.
  ```
- **BibTeX**:
  ```bibtex
  @misc{unhcr_ethiopia_2024,
    author = {{United Nations High Commissioner for Refugees}},
    title = {Refugee Data Finder: Forced Displacement in 2023/2024 (Ethiopia Reports)},
    year = {2024},
    publisher = {UNHCR Global Data Service},
    url = {https://www.unhcr.org/refugee-statistics/},
    note = {Accessed via Ethiopia Migration \& Displacement Observatory. Distributed under CC BY 4.0}
  }
  ```

### 4.3 UN DESA International Migrant Stock (2020/2024 Revision)
- **Scope**: Foreign-born resident population in Ethiopia and Ethiopian-born diaspora abroad across global migration corridors.
- **APA**:
  ```text
  United Nations, Department of Economic and Social Affairs, Population Division. (2024). International Migrant Stock 2020/2024: By Destination and Origin (United Nations database, POP/DB/MIG/Stock/Rev.2020) [Data set]. United Nations. https://www.un.org/development/desa/pd/
  ```
- **Chicago**:
  ```text
  United Nations, Department of Economic and Social Affairs, Population Division. "International Migrant Stock: By Destination and Origin." New York: United Nations, 2024. https://www.un.org/development/desa/pd/.
  ```
- **BibTeX**:
  ```bibtex
  @misc{un_desa_migrant_stock_2024,
    author = {{United Nations Department of Economic and Social Affairs Population Division}},
    title = {International Migrant Stock: By Destination and Origin},
    year = {2024},
    publisher = {United Nations},
    url = {https://www.un.org/development/desa/pd/},
    note = {Accessed via Ethiopia Migration \& Displacement Observatory. Distributed under CC BY 4.0 Compatible}
  }
  ```

---

## 5. Statistical Disclosure Control (SDC) & Individual Privacy

Under humanitarian data ethics guidelines, public data dissemination must protect vulnerable individuals from potential identification, targeting, or discrimination.

1. **Suppression Threshold ($k = 5$)**:
   - In all small-area demographic breakdowns, age-sex population pyramids, and exported CSV/JSON files, any cell where the headcount is strictly greater than zero and less than five ($0 < x < 5$) is systematically suppressed and reported as `"<5"`.
2. **Formula Injection Sanitization (OWASP)**:
   - Exported CSV files prepend an apostrophe (`'`) to any text field beginning with `=`, `+`, `-`, `@`, `\t`, or `\r` to prevent automated code execution in spreadsheet software.
3. **Zero-Tracking Architecture**:
   - The observatory sets **zero tracking cookies**, uses **zero third-party commercial analytics**, and preserves user anonymity.

---

## 6. Verification and Maintenance

This methodology is validated via automated unit, contract, and integration tests in the observatory codebase:
- Contracts: `src/test/contracts.test.ts`
- Normalization: `src/test/normalization.test.ts`
- Integration: `src/test/integration.test.tsx`
- Adapter Resilience: `src/test/adapters.test.ts`
