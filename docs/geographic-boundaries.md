# Geographic Boundaries & Cartographic Assets

**Project:** Ethiopia Migration & Displacement Observatory  
**Version:** 1.0  
**Date:** October 2026  
**Status:** Geometries Acquired & Optimized  

---

## 1. Geographic Datasets Inventory

To ensure fast web rendering and cartographic fidelity across desktop and mobile devices, boundary geometries have been converted to lightweight TopoJSON format and staged in `/public/data/boundaries/`:

| Boundary Asset | Coverage | Admin Level | Feature Count | File Size (TopoJSON) | Source & License |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `eth-adm0.topojson` | Ethiopia National Border | Level 0 | 1 polygon | **25 KB** | UN OCHA COD-AB / geoBoundaries (CC BY 4.0) |
| `eth-adm1.topojson` | Regional States | Level 1 | 11–15 regions | **70 KB** | UN OCHA COD-AB / geoBoundaries (CC BY 4.0) |
| `eth-adm2.topojson` | Administrative Zones | Level 2 | 74–107 zones | **155 KB** | UN OCHA COD-AB / geoBoundaries (CC BY 4.0) |
| `world-110m.topojson`| Global Country Borders | Level 0 | 177 countries | **106 KB** | Natural Earth / World Atlas (Public Domain) |

*Total cartographic asset bundle: **~356 KB** (under 100 KB gzipped), enabling sub-second map loading.*

---

## 2. Coordinate Reference System (CRS) & Projection

- **Storage Format:** Standard geographic coordinates in **WGS 84 (EPSG:4326)**, latitude and longitude in decimal degrees.
- **Client Rendering Projections:**
  - **Ethiopia Choropleth (`/inside-ethiopia`):** Projected using `d3.geoConicEqualArea()` or `d3.geoMercator()` fitted directly to the Ethiopian bounding envelope:
    ```typescript
    const projection = d3.geoMercator().fitSize([width, height], geojsonFeatureCollection);
    ```
  - **Migration Globe (`/globe`):** Projected using `d3.geoOrthographic()` centered at `[39.5, 9.0]` (Ethiopia centroid) with interactive mouse/touch drag rotation.
  - **2D World Fallback:** Projected using `d3.geoEqualEarth()` for color-blind safe, equal-area international migration flow rendering.

---

## 3. Administrative P-Code Alignment & Hierarchy

To guarantee that observations from **IOM DTM** and **UN OCHA** join seamlessly with map features without name misspelling discrepancies, all features are indexed by official UN P-Codes:

| Region Name | P-Code | Normalized ID | Primary Operational Zones |
| :--- | :--- | :--- | :--- |
| **Tigray** | `ET01` | `ET-TI` | Central, Eastern, North Western, Southern, Western, South Eastern |
| **Afar** | `ET02` | `ET-AF` | Zone 1 (Awsi), Zone 2 (Kilbati), Zone 3 (Gabi), Zone 4 (Fanti), Zone 5 (Hari) |
| **Amhara** | `ET03` | `ET-AM` | Central Gondar, North Gondar, South Gondar, North Wollo, South Wollo, Wag Hamra |
| **Oromia** | `ET04` | `ET-OR` | East Hararghe, West Hararghe, Guji, West Guji, Borena, Bale, East Wollega |
| **Somali** | `ET05` | `ET-SO` | Doolo, Shabelle, Jarar, Korahe, Liban, Afder, Erer, Nogob, Siti |
| **Benishangul-Gumuz** | `ET06` | `ET-BE` | Metekel, Kamashi, Assoa, Mao-Komo |
| **SNNPR / South** | `ET07` | `ET-SN` | Gedeo, Konso, South Omo, Wolayita, Keffa, Bench Sheko |
| **Gambela** | `ET12` | `ET-GA` | Agnewak, Nuwer, Mezhenger, Itang Special Woreda |
| **Harari** | `ET13` | `ET-HA` | Harari Urban & Rural |
| **Addis Ababa** | `ET14` | `ET-AA` | Addis Ababa City Administration |
| **Dire Dawa** | `ET15` | `ET-DD` | Dire Dawa City Administration |

---

## 4. Contextual Administrative Boundary Reorganizations

Users and analysts should be aware of recent administrative reorganizations within the Federal Democratic Republic of Ethiopia:

1. **Sidama Region (2020):** Formed from the former Sidama Zone of SNNPR following a constitutional referendum.
2. **South West Ethiopia Peoples' Region (2021):** Formed from Keffa, Sheka, Bench Sheko, Dawro, West Omo, and Konta.
3. **Central Ethiopia & Southern Ethiopia Regions (2023):** SNNPR was formally restructured into two separate regional administrations.
4. **Longitudinal Compatibility:**  
   Because historical IOM DTM assessments (Rounds 8–28) reference SNNPR as a single entity, the observatory data normalization pipeline preserves both the legacy consolidated P-code (`ET07`) and maps newer sub-regional assessments where reported.

---

## 5. Cartographic Neutrality & Legal Disclaimer

- The designations employed and the presentation of material on these maps do not imply the expression of any opinion whatsoever on the part of the Ethiopia Migration & Displacement Observatory concerning the legal status of any country, territory, city, or area, or of its authorities, or concerning the delimitation of its frontiers or boundaries.
- Boundary data is sourced from UN OCHA Common Operational Datasets (COD-AB) and geoBoundaries Open Access under Creative Commons Attribution licenses.
