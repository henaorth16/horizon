# Data Normalization & Quality Assurance Rules

**Project:** Ethiopia Migration & Displacement Observatory  
**Version:** 1.0  
**Date:** October 2026  
**Status:** Implemented & Tested  

---

## 1. Normalization Architecture

Because external humanitarian publishers use differing terminologies, survey tools, and aggregation intervals, incoming data passes through standardized normalization pipelines before storage.

### 1.1 Population Taxonomy Mappings
Implemented in [`src/lib/normalization/taxonomy.ts`](file:///home/hena/Documents/side%20projects/refugees-data-vis/src/lib/normalization/taxonomy.ts):

| Raw Publisher Terms | Normalized Category | Legal / Policy Mandate | Additive With Others? |
| :--- | :--- | :--- | :--- |
| `IDPs`, `Internal Displacement`, `SA_IDP`, `IDP Individual Caseload` | `idp` | 1998 Guiding Principles (IOM DTM) | **NO** (Must never be added to refugees) |
| `Refugees`, `Mandate Refugees`, `Registered Refugees`, `REF` | `refugee` | 1951 Convention / 1969 OAU (UNHCR) | **NO** |
| `Asylum-seekers`, `Pending Asylum Applicants`, `ASY` | `asylum_seeker` | UNHCR / Ethiopian RRS | **NO** |
| `Returnees`, `Returned IDPs`, `Returned Refugees`, `RET` | `returnee` | Post-Displacement Stabilization | **NO** |
| `Migrant Stock`, `International Migrants`, `Foreign-Born`, `MIG` | `international_migrant` | UN DESA Population Division | **NO** |
| `Host Community`, `HST` | `host_community` | Humanitarian Cluster Coverage | **NO** |

---

### 1.2 Demographic Breakdown Standards
Implemented in [`src/lib/normalization/demographics.ts`](file:///home/hena/Documents/side%20projects/refugees-data-vis/src/lib/normalization/demographics.ts):

#### Sex / Gender Normalization:
- `female`: `["f", "female", "females", "women", "girls"]`
- `male`: `["m", "male", "males", "men", "boys"]`
- `unspecified`: `["u", "unknown", "unspecified", "other", null]`

#### Standard Age Brackets:
Preserves original source age categories while providing crosswalks to:
- `0-4`: Infants and young children (<5 years, nutrition and immunization priority)
- `5-11`: Primary school age
- `12-17`: Adolescents / Secondary school age
- `18-59`: Working age adults
- `60+`: Older persons / Elderly protection

#### Displacement Drivers:
- `conflict`: Armed clashes, intercommunal violence, generalized insecurity
- `drought`: Multi-season precipitation deficit, pastoral pasture failure
- `floods`: Flash floods, riverine flooding (e.g. Awash/Shebelle basins)
- `seasonal_pastoral`: Seasonal movement of livestock and herders
- `other`: Landslides, fires, industrial hazards
- `unspecified`: Unassessed or undisclosed by community leaders

---

### 1.3 Reporting Periods & Date Formats
Implemented in [`src/lib/normalization/periods.ts`](file:///home/hena/Documents/side%20projects/refugees-data-vis/src/lib/normalization/periods.ts):

- **Day-level (`day`):** `YYYY-MM-DD` (e.g., `2024-08-31`)
- **Month-level (`month`):** `YYYY-MM` (e.g., `2024-08`)
- **Round-level (`round`):** `YYYY-R{roundNumber}` (e.g., `2024-R37` for IOM DTM Site Assessment Round 37)
- **Year-level (`year`):** `YYYY` (e.g., `2023` for UNHCR annual figures)
- *Calendar sanity rules reject invalid months (>12) and days (>31).*

---

## 2. Automated Data Quality Rules

Implemented in [`src/lib/quality/rules.ts`](file:///home/hena/Documents/side%20projects/refugees-data-vis/src/lib/quality/rules.ts):

### Rule 1: Zero vs. Missing vs. Suppressed Distinction
- **`0` (Verified Zero):** Site or woreda was assessed; zero displaced persons observed.
- **`null` (Missing / Unassessed):** Site was unvisited, unreachable due to insecurity, or data omitted. Never rendered as zero.
- **`suppressed` (Withheld for Protection):** Caseloads `< 5` or small vulnerable subgroups suppressed to avoid re-identification.

### Rule 2: Non-Negative Constraint
- Any record where `value < 0` is immediately rejected with a critical quality alert (`qa_neg_<id>`).

### Rule 3: Plausibility & Outlier Spike Detection
- Single subnational records exceeding 15 million are flagged as `IMPLAUSIBLE_SPIKE` for manual verification.

### Rule 4: Duplicate Record Deduplication
- Generated composite key:  
  `fingerprint = (locationId, indicatorId, reportingDate, populationType, sex, ageGroup, driver)`
- When two incoming records share identical fingerprints and values, the record is deduplicated cleanly and logged under `info`.

### Rule 5: Conflict Detection
- When two records share an identical fingerprint but contain different values, a `CONFUSION_RISK` warning alert is created, and the existing verified record is preserved.

### Rule 6: Geographic P-Code Verification
- Location IDs must match standardized Ethiopian P-Codes (`ET01`–`ET15`, `ETH`) or valid international ISO-3 codes. Unrecognized codes trigger a `GEOGRAPHIC_MISMATCH` alert.

---

## 3. Idempotent Ingestion Pipeline

Implemented in [`src/lib/ingestion/pipeline.ts`](file:///home/hena/Documents/side%20projects/refugees-data-vis/src/lib/ingestion/pipeline.ts):

1. **Raw Snapshot Capture:** Computes cryptographic SHA-256 hash and writes original unedited payload to `/data/raw/<source>/<snapshot_id>.<format>`.
2. **Deterministic Extraction:** Transforms raw records into `ValidatedObservation` schemas.
3. **Quality Gate:** Filters invalid records, triggers alerts, and logs rejection counts.
4. **Persistent Merge:** Reads `/data/processed/<source>_observations.json` and performs an idempotent upsert based on composite observation keys.
5. **Audit Logging:** Creates an `IngestionRun` record documenting `rowsRead`, `rowsValid`, and `rowsRejected`.
