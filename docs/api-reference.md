# Backend API Layer & REST Reference

**Project:** Ethiopia Migration & Displacement Observatory  
**Version:** 1.0.0  
**Base URL:** `/api`  
**Status:** Approved & Implemented  
**Date:** October 2026  

---

## 1. Overview & Architectural Principles

The Ethiopia Migration & Displacement Observatory exposes a read-only, high-performance REST API providing programmatic access to verified subnational and national humanitarian mobility records.

### Guiding Principles

1. **Deterministic Data Contracts:** All query parameters and payload bodies are validated at runtime via Zod schemas. Invalid queries receive descriptive `400 Bad Request` payloads rather than silent truncation.
2. **Standardized Response Envelope:** Every route returns an identical JSON envelope containing `success`, `data`, optional `meta` (pagination, params, counts), and `error` (for failures).
3. **Mandate-Preserved Separation:** Populations with distinct legal definitions (IDPs vs. Refugees) cannot be conflated. The API guarantees discrete population channels.
4. **Edge & Browser Caching:** All GET endpoints return HTTP `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`, enabling high-concurrency caching on Edge networks (Vercel/Cloudflare) while automatically revalidating in the background.

---

## 2. Standard Envelope Format

### Successful Response (`200 OK`)

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 32,
    "limit": 50,
    "offset": 0,
    "hasMore": false,
    "params": { ... }
  }
}
```

### Error Response (`400 Bad Request` / `404 Not Found` / `500 Server Error`)

```json
{
  "success": false,
  "error": {
    "code": "INVALID_QUERY_PARAMS",
    "message": "Invalid query parameters provided",
    "details": [
      {
        "code": "invalid_enum_value",
        "path": ["populationType"],
        "message": "Invalid enum value. Expected 'idp' | 'refugee' | 'returnee' | 'asylum_seeker' | 'international_migrant'"
      }
    ]
  }
}
```

---

## 3. Endpoints Specification

### 3.1 `GET /api/observations`

Queries verified displacement and mobility observation records.

#### Query Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | — | Query an individual observation by unique record ID. |
| `locationId` | `string` | — | Filter by P-code (`ET01`, `ET04`, etc.) or country code (`ET`). |
| `populationType` | `enum` | — | One of `idp`, `refugee`, `returnee`, `asylum_seeker`, `international_migrant`. |
| `indicatorId` | `string` | — | Filter by indicator ID (`idp_stock`, `refugee_stock`, `returnee_stock`). |
| `sourceId` | `string` | — | Filter by publishing source (`iom_dtm`, `unhcr`). |
| `driver` | `enum` | — | One of `conflict`, `drought`, `floods`, `seasonal_pastoral`, `other`. |
| `startDate` | `string` | — | Minimum reporting date (`YYYY`, `YYYY-MM`, or `YYYY-MM-DD`). |
| `endDate` | `string` | — | Maximum reporting date (`YYYY`, `YYYY-MM`, or `YYYY-MM-DD`). |
| `limit` | `integer` | `50` | Maximum rows to return (Min: 1, Max: 500). |
| `offset` | `integer` | `0` | Zero-indexed pagination offset. |
| `sortBy` | `enum` | `value` | One of `value`, `reportingDate`, `locationId`. |
| `sortDirection` | `enum` | `desc` | One of `asc`, `desc`. |

#### Example Request

```bash
curl -X GET "https://observatory.et/api/observations?populationType=idp&driver=conflict&sortBy=value&limit=5"
```

#### Example Response Body

```json
{
  "success": true,
  "data": [
    {
      "id": "dtm_r37_idp_national",
      "indicatorId": "idp_stock",
      "locationId": "ET",
      "value": 3392200,
      "reportingDate": "2024-08-31",
      "referencePeriodType": "round",
      "retrievalDate": "2026-10-22T04:00:00.000Z",
      "sourceId": "iom_dtm",
      "populationType": "idp",
      "confidence": "medium",
      "provenance": {
        "sourceId": "iom_dtm",
        "sourceName": "IOM DTM Ethiopia",
        "datasetSnapshotId": "snap_iom_dtm_r37_20240831",
        "retrievalTimestamp": "2026-10-22T04:00:00.000Z",
        "license": "CC BY 4.0",
        "citation": "IOM Displacement Tracking Matrix Ethiopia National Summary Round 37 (August 2024)"
      }
    }
  ],
  "meta": {
    "total": 7,
    "limit": 5,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 3.2 `GET /api/indicators`

Retrieves canonical indicator definitions, standard units, population mapping, aggregation rules, and current observational coverage.

#### Query Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `populationType` | `enum` | Filter by `idp`, `refugee`, `returnee`, etc. |
| `isStock` | `boolean` | Filter by stock counts (`true`) vs. flow counts (`false`). |
| `sourceId` | `string` | Filter by default source (`iom_dtm`, `unhcr`). |

#### Example Request

```bash
curl -X GET "https://observatory.et/api/indicators"
```

---

### 3.3 `GET /api/locations`

Retrieves administrative hierarchies (Admin 0 National, Admin 1 Regional States, Admin 2 Zones), UN OCHA Common Operational Dataset P-codes, Amharic name transliterations, centroids, and observational coverage counts.

#### Query Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `adminLevel` | `integer` | Filter by administrative level (`0` = National, `1` = Regional State). |
| `parentId` | `string` | Filter children by parent ID (`ET` returns all 12 regional states). |
| `pcode` | `string` | Exact P-code match (e.g. `ET01`, `ET04`). |
| `search` | `string` | Case-insensitive search across English, P-code, and alternative aliases. |

#### Example Request

```bash
curl -X GET "https://observatory.et/api/locations?adminLevel=1"
```

---

### 3.4 `GET /api/sources`

Lists official humanitarian data publishers, institutional mandates, licensing terms, update cadences, and observational record counts.

#### Query Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `active` | `boolean` | Filter active data pipelines (`true` / `false`). |

#### Example Request

```bash
curl -X GET "https://observatory.et/api/sources"
```

---

### 3.5 `GET /api/metrics`

Pre-computed high-level summary KPIs for dashboard displays:
- National monitored population totals (IDPs, returnees, refugees, asylum seekers).
- Regional caseload rankings.
- Percentage distributions by primary trigger driver (conflict, drought, floods).
- Bilateral refugee distributions by country of origin.

---

### 3.6 `GET /api/integrity`

Live automated quality and audit assessment of the local database:
- Total checked records.
- Schema compliance count.
- Confirmed zero errors / unverified estimates.
- Covered source identifiers.

---

### 3.7 `GET /api/metadata`

Observatory catalog metadata, specification version, temporal coverage ranges, and self-discovery endpoints index.
