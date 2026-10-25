# Crisis Drivers & Sectoral Humanitarian Needs Methodology

## 1. Overview & Methodological Safeguards

The Ethiopia Migration & Displacement Observatory tracks displacement triggers and humanitarian vulnerabilities using verified, published primary source datasets:
- **IOM Displacement Tracking Matrix (DTM)** Site Assessments & National Displacement Reports.
- **UN OCHA Humanitarian Needs Overview (HNO 2024)** and Multi-Sector Needs Assessments (MSNA).
- **FEWS NET / IPC Technical Working Group** Acute Food Insecurity Classifications.
- **Inter-Agency Standing Committee (IASC)** and **Sphere Project** humanitarian minimum standards.

---

### 1.1 The Causation Safeguard

> [!IMPORTANT]
> **No Unverified Causal Assertions:**
> In humanitarian reporting (notably IOM DTM), recorded displacement causes represent the **primary trigger** documented by community key informants and local administrators at the assessment site.
> 
> A recorded trigger (e.g., "Conflict" or "Drought") does not imply a single legal, judicial, or monocausal determination. Displacement in the Horn of Africa frequently results from **compounding multi-hazard vulnerabilities**:
> 1. Prolonged drought depletes livestock and grazing pastures, eroding household resilience.
> 2. Resulting resource scarcity intensifies intercommunal competition over diminishing watering points and boundary pastures.
> 3. An armed clash may serve as the proximate trigger that forces flight, even though slow-onset climate degradation was the underlying vulnerability multiplier.
>
> The observatory presents documented triggers side-by-side with environmental and food insecurity indicators without asserting unsupported bivariate causal links.

---

## 2. Documented Displacement Driver Taxonomy

In alignment with IOM DTM standard taxonomy and [`src/lib/normalization/taxonomy.ts`](file:///home/hena/Documents/side%20projects/refugees-data-vis/src/lib/normalization/taxonomy.ts):

| Driver Code | Primary Classification | Description & Context in Ethiopia |
| :--- | :--- | :--- |
| `conflict` | Conflict & Intercommunal Violence | Clashes between armed entities, intercommunal boundary disputes, and localized civil insecurity. Documented as the primary trigger for ~65.4% of IDPs in Round 37 (prominent in Tigray, Amhara, Oromia, and Benishangul-Gumuz). |
| `drought` | Prolonged Multi-Season Drought | Multi-season rainfall failure resulting in catastrophic pasture collapse, livestock mortality, and groundwater depletion. Accounts for ~25.0% of IDPs (concentrated in Somali, lowland Oromia/Borena, and southern Afar). |
| `floods` | Flash & Riverine Flooding | Sudden seasonal riverine overflows along major drainage basins (Awash, Wabe Shebelle, Baro) and flash inundation. Accounts for ~7.1% of IDPs. |
| `other` | Other Environmental & Social Shocks | Highland landslides, accidental fires in dense collective settlements, localized crop pest invasions, and seasonal movements. Accounts for ~2.5% of IDPs. |

---

## 3. Sector-Specific Humanitarian Needs Indicators

The observatory monitors 5 core humanitarian cluster sectors using explicit indicator definitions and international Sphere / WHO / IPC standards.

### 3.1 Emergency Shelter & Non-Food Items (ES/NFI)
- **Indicator ID:** `hno_shelter_deficit_pct`
- **Cluster & Lead Agency:** Emergency Shelter / NFI Cluster (UNHCR / IOM).
- **Indicator Definition:** The percentage of displaced households residing in substandard or emergency shelters (makeshift shelters made from sticks and salvaged cloth, damaged homes, schools, open hangars, or tents) lacking weatherproofing, privacy, or essential household NFI kits.
- **Sphere Project Minimum Benchmark:** Minimum **3.5 m² of covered living area per person**, structurally sound, culturally adequate, and weatherproof.
- **Severity Thresholds:**
  - *Low:* $< 20\%$
  - *Moderate:* $20\% \text{ to } 40\%$
  - *Severe:* $40\% \text{ to } 60\%$
  - *Critical:* $> 60\%$

### 3.2 Water, Sanitation & Hygiene (WASH)
- **Indicator ID:** `hno_wash_potable_deficit_pct`
- **Cluster & Lead Agency:** WASH Cluster (UNICEF).
- **Indicator Definition:** The percentage of displacement sites where drinking water access is below minimum survival thresholds ($< 15\text{ liters/person/day}$) or round-trip water collection journey exceeds 30 minutes.
- **Sphere Project Minimum Benchmark:** Minimum **15 liters of potable drinking water per person per day** from a protected source within 500 meters or a 15-minute queuing time.
- **Severity Thresholds:**
  - *Low:* $< 25\%$
  - *Moderate:* $25\% \text{ to } 45\%$
  - *Severe:* $45\% \text{ to } 65\%$
  - *Critical:* $> 65\%$

### 3.3 Acute Food Insecurity (IPC Classification)
- **Indicator ID:** `fews_ipc_acute_food_insecurity_pct`
- **Cluster & Lead Agency:** Food Security & Agriculture Cluster (FEWS NET / WFP / FAO).
- **Indicator Definition:** The percentage of assessed woreda population classified in IPC Phase 3 (Crisis), Phase 4 (Emergency), or Phase 5 (Catastrophe).
- **IPC Global Standard:**
  - *Phase 1 (Minimal):* Households meet essential food and non-food needs without unsustainable coping mechanisms.
  - *Phase 2 (Stressed):* Minimally adequate food consumption; cannot afford non-food expenditures.
  - *Phase 3 (Crisis):* Food consumption gaps accompanied by high or above-usual acute malnutrition.
  - *Phase 4 (Emergency):* Large food consumption gaps with very high acute malnutrition and excess mortality.
  - *Phase 5 (Catastrophe/Famine):* Extreme lack of food; starvation, death, and destitution evident.

### 3.4 Protection (Child Protection & GBV)
- **Indicator ID:** `hno_protection_acute_gap_pct`
- **Cluster & Lead Agency:** Protection Cluster / Child Protection & GBV AoR (UNHCR / UNICEF / UNFPA).
- **Indicator Definition:** The percentage of displacement sites reporting unaccompanied/separated children, lack of safe child-friendly spaces, or absence of segregated, illuminated, and lockable latrines.
- **IASC Guidelines Standard:** 100% of displacement sites must provide gender-segregated, lockable sanitation facilities and active referral desks for gender-based violence (GBV) and child protection.

### 3.5 Primary Healthcare & Nutrition
- **Indicator ID:** `hno_health_facility_distance_pct`
- **Cluster & Lead Agency:** Health Cluster (WHO / Ministry of Health).
- **Indicator Definition:** The percentage of displacement sites where the nearest functioning primary healthcare post or mobile outreach clinic is $> 5\text{ km}$ away or non-functional due to conflict damage.
- **WHO Benchmark:** 1 basic primary healthcare facility per 10,000 population within 1 hour walking distance.

---

## 4. Rejection of Synthetic Composite Indexes

> [!CAUTION]
> **Ethical Principle: Rejection of Composite Vulnerability Scores**
> Many dashboards attempt to compute a single "Overall Vulnerability Index" (e.g. 7.2/10) by taking an unweighted or arbitrary weighted average across shelter, WASH, food security, and protection.
> 
> The observatory explicitly **rejects this practice** for three reasons:
> 1. **Masking Life-Threatening Deficits:** An area with 90% water failure (imminent cholera outbreak) and 20% shelter deficit would average to 55%, falsely appearing "moderate" while individuals face mortal risk.
> 2. **Arbitrary Weighting:** Assigning mathematical weights (e.g., $30\%$ food, $20\%$ shelter) reflects analyst assumption rather than empirical humanitarian priority.
> 3. **Honest Missing Data:** When an indicator has not been assessed in an active conflict zone, averaging the remaining indicators falsely lowers the perceived need. Missing or unassessed cells must always be rendered explicitly as **Unassessed**, never imputed as zero.
