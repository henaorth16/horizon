# Official Public Data Sources & API Research

**Project:** Ethiopia Migration & Displacement Observatory  
**Version:** 1.0  
**Date:** October 2026  
**Status:** Primary Source Verification Complete  

---

## 1. Executive Data Landscape & Mandates

The Ethiopia Migration & Displacement Observatory aggregates official public data across 10 global and regional institutions. Because humanitarian statistics arise from diverse institutional mandates and distinct survey methodologies, data cannot be indiscriminately combined.

### Core Non-Additive Taxonomy:
- **Internally Displaced Persons (IDPs)**: Monitored within Ethiopia by **IOM DTM** under the 1998 UN Guiding Principles.
- **Refugees & Asylum-Seekers**: Registered across borders by **UNHCR & Refugees and Returnees Service (RRS)** under the 1951 Convention.
- **International Migrants**: Estimated globally by **UN DESA Population Division** using national census records.
- **Returnees**: Monitored by **IOM DTM & Government** tracking former IDPs and returnees from abroad.

---

## 2. Source Inventory & Technical Profiles

### 1. IOM Displacement Tracking Matrix (DTM) Ethiopia
- **Primary Mandate:** Internal displacement tracking, village return assessments, and emergency site monitoring.
- **Official Portal:** [https://dtm.iom.int/ethiopia](https://dtm.iom.int/ethiopia)
- **Data Access Method:**
  - Direct HDX distribution: [HDX `eth-iom-dtm-from-api`](https://data.humdata.org/dataset/c5f4bf99-63e3-44e5-8847-296751c667e9)
  - IOM DTM API / CSV export: `eth-iom-dtm-from-api-admin-0-to-2.csv`
  - Site Assessment Round datasets (Rounds 8 through 37+).
- **Geographic Resolution:** Administrative Level 0 (National), Level 1 (Regions), Level 2 (Zones), and Assessment Site coordinates.
- **Demographic Resolution:** Household counts, individual caseloads, sex disaggregation (`numberMales`, `numberFemales`), and primary displacement reasons.
- **Update Frequency:** Round-based (bimonthly site assessments; annual national consolidated updates).
- **Licensing & Terms:** Creative Commons Attribution 4.0 International (CC BY 4.0). Attribution required: *"Source: International Organization for Migration (IOM) DTM Ethiopia"*.
- **Caveats & Limitations:** Physical insecurity and communications blackouts in certain woredas (e.g. historical Tigray/Amhara conflicts) may cause temporal gaps or delayed assessments. Zero values must be distinguished from unassessed woredas.

---

### 2. Humanitarian Data Exchange (HDX) / UN OCHA CKAN
- **Primary Mandate:** Central humanitarian data repository managed by the UN Office for the Coordination of Humanitarian Affairs (OCHA).
- **Official Portal:** [https://data.humdata.org/](https://data.humdata.org/)
- **Data Access Method:**
  - RESTful CKAN Action API v3:
    - Search: `GET https://data.humdata.org/api/3/action/package_search?q={query}`
    - Package Details: `GET https://data.humdata.org/api/3/action/package_show?id={package_id}`
    - Resource URL: `https://data.humdata.org/dataset/{id}/resource/{resource_id}/download/{filename}`
- **Geographic Resolution:** Global to site-level depending on dataset.
- **Licensing & Terms:** Varies by contributor; predominantly CC BY-IGO or CC BY 4.0.
- **Caveats & Limitations:** HDX is an exchange aggregator, not a primary data collector. Each resource metadata record (`dataset_date`, `methodology`, `caveats`) must be parsed and surfaced.

---

### 3. UNHCR Refugee Data Finder API
- **Primary Mandate:** Official United Nations High Commissioner for Refugees population statistics and global trends.
- **Official Portal:** [https://www.unhcr.org/refugee-statistics/](https://www.unhcr.org/refugee-statistics/)
- **Data Access Method:**
  - REST API (JSON):
    - Population by Country of Asylum (COA): `GET https://api.unhcr.org/population/v1/population/?year={year}&coa=ETH`
    - Population by Country of Origin (COO): `GET https://api.unhcr.org/population/v1/population/?year={year}&coo=ETH`
    - Demographic age-sex distribution: `GET https://api.unhcr.org/population/v1/demographics/?year={year}&coa=ETH`
- **Geographic Resolution:** Country of Asylum (COA) and Country of Origin (COO) ISO-3 codes; subnational camp/urban breakdown in UNHCR operational data.
- **Demographic Resolution:** Age groups (`0–4`, `5–11`, `12–17`, `18–59`, `60+`) disaggregated by sex (`female`, `male`).
- **Update Frequency:** Mid-year statistical reports (quarterly/semi-annual) and annual Global Trends publications.
- **Licensing & Terms:** Free public access with mandatory attribution: *"Source: UNHCR Refugee Data Finder"*.
- **Caveats & Limitations:** Reflects formally registered refugees and recognized asylum applicants under UNHCR/government ProGres registration. Spontaneous cross-border arrivals pending registration are excluded until officially recorded.

---

### 4. UN DESA Population Division (International Migrant Stock)
- **Primary Mandate:** Estimates of international migrant stock by destination and origin.
- **Official Portal:** [https://www.un.org/development/desa/pd/content/international-migrant-stock](https://www.un.org/development/desa/pd/content/international-migrant-stock)
- **Data Access Method:** Direct bilateral matrix download (CSV/XLSX) and UN Data API.
- **Geographic Resolution:** National (Admin 0) bilateral matrices (e.g. Ethiopian-born population living in Sudan, Saudi Arabia, USA, Germany, Kenya).
- **Demographic Resolution:** Age brackets and sex totals.
- **Update Frequency:** 5-year cyclical revisions (latest revisions: 2020, 2024).
- **Licensing & Terms:** United Nations Open Data Principles. Attribution required: *"Source: United Nations Department of Economic and Social Affairs, Population Division"*.
- **Caveats & Limitations:** Measures long-term stock (cumulative foreign-born or foreign-citizen population), not dynamic monthly flow or acute crisis displacement.

---

### 5. UNICEF (Children & Education in Displacement)
- **Primary Mandate:** Child protection, unaccompanied and separated minors, child nutrition, and displaced schooling indicators.
- **Official Portal:** [https://data.unicef.org/topic/child-protection/children-on-the-move/](https://data.unicef.org/topic/child-protection/children-on-the-move/)
- **Data Access Method:** UNICEF Data Warehouse REST API and indicator portal.
- **Geographic Resolution:** National and regional survey clusters.
- **Demographic Resolution:** Disaggregated for children under 5, children 5–17, and female-headed adolescent households.
- **Update Frequency:** Annual situational updates and survey rounds (MICS).
- **Licensing & Terms:** CC BY 3.0 IGO.
- **Caveats & Limitations:** Data often derived from multi-cluster surveys conducted periodically rather than real-time registration censuses.

---

### 6. Internal Displacement Monitoring Centre (IDMC)
- **Primary Mandate:** Global Internal Displacement Database (GIDD) and Global Report on Internal Displacement (GRID).
- **Official Portal:** [https://www.internal-displacement.org/database](https://www.internal-displacement.org/database)
- **Data Access Method:**
  - IDMC Public API / GIDD API: `GET https://helix-api.internal-displacement.org/`
  - Direct displacement events and annual stock exports.
- **Geographic Resolution:** Country level with event-level geolocation incidents.
- **Demographic Resolution:** National aggregate stock and flow breakdowns.
- **Update Frequency:** Real-time event updates with annual consolidated validation.
- **Licensing & Terms:** CC BY 3.0 IGO.
- **Caveats & Limitations:** Figures reflect validated secondary triangulation; definitions may differ slightly from operational IOM DTM field counts due to independent deduplication models.

---

### 7. World Bank Open Data
- **Primary Mandate:** Development macro-indicators, poverty metrics, net migration rates, and refugee population by country of asylum.
- **Official Portal:** [https://data.worldbank.org/](https://data.worldbank.org/)
- **Data Access Method:**
  - World Bank API v2: `GET https://api.worldbank.org/v2/country/ETH/indicator/{indicator}?format=json`
  - Example Indicators: `SM.POP.NETM` (Net Migration), `SP.POP.TOTL` (Total Population).
- **Geographic Resolution:** Country Level (ISO-3: `ETH`).
- **Update Frequency:** Annual release with historic time-series back to 1960.
- **Licensing & Terms:** CC BY 4.0.
- **Caveats & Limitations:** Macroeconomic and five-year interpolated net migration models, not suited for immediate operational emergency tracking.

---

### 8. UN OCHA (Common Operational Datasets COD-AB & ReliefWeb)
- **Primary Mandate:** Authoritative boundary definitions (Admin 0, Admin 1, Admin 2) and humanitarian crisis reports.
- **Official Portal:** [https://data.humdata.org/group/eth](https://data.humdata.org/group/eth) & [https://reliefweb.int/](https://reliefweb.int/)
- **Data Access Method:**
  - COD-AB boundary downloads (GeoJSON/Shapefile).
  - ReliefWeb API v1: `GET https://api.reliefweb.int/v1/reports?appname=ethiopia-observatory&query[value]=ethiopia+displacement`
- **Geographic Resolution:** Authoritative P-codes for Ethiopian Regions and Zones.
- **Update Frequency:** Boundary datasets updated as administrative boundaries are gazetted; reports updated continuously.
- **Licensing & Terms:** Public Domain / CC BY-IGO.
- **Caveats & Limitations:** Ethiopian administrative boundaries have experienced realignments (e.g., Sidama Region formation, South West Ethiopia Region, Central Ethiopia, Southern Ethiopia). Using standardized OCHA P-Codes ensures longitudinal consistency.

---

### 9. FEWS NET (Famine Early Warning Systems Network)
- **Primary Mandate:** Integrated Food Security Phase Classification (IPC) mapping drought, flood, and conflict impacts on food access.
- **Official Portal:** [https://fews.net/east-africa/ethiopia](https://fews.net/east-africa/ethiopia)
- **Data Access Method:** FEWS NET Data Portal / IPC Global Platform API.
- **Geographic Resolution:** Livelihood zones and administrative zones.
- **Update Frequency:** Seasonal food security outlooks (quarterly with monthly monitoring).
- **Licensing & Terms:** Public Domain / US Government work.
- **Caveats & Limitations:** IPC phases (1–5) reflect food insecurity severity, which acts as a driver or exacerbator of displacement, not a direct displacement census.

---

### 10. IOM Missing Migrants Project
- **Primary Mandate:** Tracking deaths and disappearances of migrants along migratory routes.
- **Official Portal:** [https://missingmigrants.iom.int/](https://missingmigrants.iom.int/)
- **Data Access Method:** Direct CSV download and REST API.
- **Geographic Resolution:** Incident point coordinates along the Eastern, Southern, and Northern Horn of Africa routes.
- **Demographic Resolution:** Age groups, sex (where identifiable), country of origin.
- **Update Frequency:** Weekly / Monthly incident verification.
- **Licensing & Terms:** CC BY 4.0 International.
- **Caveats & Limitations:** Inherently undercounted due to the clandestine nature of irregular migratory journeys and unrecorded desert/sea fatalities. Numbers represent minimum verified casualties.

---

## 3. Comparative Source Matrix

| Source Provider | Primary Mandate | API / Protocol | Geographic Level | Update Cadence | License |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **IOM DTM** | IDPs & Returnees | HDX CKAN / CSV | Admin 0, 1, 2, Sites | Bimonthly | CC BY 4.0 |
| **UNHCR** | Refugees & Asylum Seekers | REST API (JSON) | Country (COA/COO) | Monthly / Annual | CC BY 4.0 |
| **HDX OCHA** | Central Exchange | CKAN Action API v3 | Multi-level | Continuous | Open / CC BY |
| **UN DESA** | International Migrant Stock | Bilateral Tables | National (Admin 0) | 5-Year Revision | UN Open |
| **IDMC** | Internal Displacement Events | Helix REST API | National & Events | Real-time / Annual | CC BY 3.0 IGO |
| **OCHA COD-AB** | Boundary Geometries & P-Codes | GeoJSON / TopoJSON | Admin 0, 1, 2, 3 | As gazetted | CC BY-IGO |
| **FEWS NET** | Drought & IPC Food Security | Portal / GeoTIFF | Livelihood Zones | Quarterly / Monthly| Public Domain |
| **Missing Migrants**| Transit Fatalities & Incidents | CSV / REST API | Geocoded Incidents | Weekly | CC BY 4.0 |

---

## 4. Architectural Verification

Proof-of-access adapters have been constructed and verified against live upstream endpoints:
1. **UNHCR Refugee Data Finder API Adapter** ([`src/lib/adapters/unhcr.ts`](file:///home/hena/Documents/side%20projects/refugees-data-vis/src/lib/adapters/unhcr.ts)): Verified live payload parsing with Zod validation.
2. **HDX CKAN API Adapter** ([`src/lib/adapters/hdx.ts`](file:///home/hena/Documents/side%20projects/refugees-data-vis/src/lib/adapters/hdx.ts)): Verified package queries and resource resolution.
