/**
 * Sector-Specific Humanitarian Needs & Vulnerability Indicators
 * Sources: UN OCHA Humanitarian Needs Overview (HNO 2024), Multi-Sector Needs Assessment (MSNA),
 * IOM DTM Site Assessment Round 37, FEWS NET East Africa Food Security Outlook, and Global Cluster Standards.
 *
 * ETHICAL SCORING PRINCIPLE:
 * The observatory displays sector indicators independently. Missing or unassessed data
 * is never coded as zero or low need. Arbitrary unweighted composite vulnerability indexes
 * are strictly avoided because averaging indicators can dangerously mask life-threatening
 * acute failures in a single sector (such as potable water or child protection).
 */

export type HumanitarianSector = "shelter" | "wash" | "food_security" | "protection" | "health";

export type SeverityLevel = "low" | "moderate" | "severe" | "critical" | "unassessed";

export interface SectorIndicatorDefinition {
  id: string;
  code: string;
  sector: HumanitarianSector;
  name: string;
  shortName: string;
  cluster: string;
  leadAgency: string;
  unit: "percentage" | "individuals" | "index_score";
  definition: string;
  sphereBenchmark: string;
  severityThresholds: {
    low: number;      // e.g. < 20%
    moderate: number; // e.g. 20-40%
    severe: number;   // e.g. 40-60%
    critical: number; // e.g. > 60%
  };
  nationalAverage: number;
  collectionMethodology: string;
  sourceId: string;
  sourceName: string;
  referencePeriod: string;
}

export interface RegionSectorScore {
  indicatorId: string;
  sector: HumanitarianSector;
  value: number | null; // null if unassessed
  severity: SeverityLevel;
  status: "verified" | "suppressed" | "unassessed";
  notes?: string;
}

export interface RegionNeedsProfile {
  regionId: string;
  regionName: string;
  pcode: string;
  assessedSitesCount: number;
  totalIdpCaseload: number;
  foodInsecurityPhase: "Phase 1: Minimal" | "Phase 2: Stressed" | "Phase 3: Crisis" | "Phase 4: Emergency" | "Phase 5: Catastrophe";
  scores: Record<HumanitarianSector, RegionSectorScore>;
  priorityConcerns: string[];
  lastAssessed: string;
  sourceCitation: string;
}

export const SECTOR_DEFINITIONS: Record<HumanitarianSector, SectorIndicatorDefinition> = {
  shelter: {
    id: "hno_shelter_deficit_pct",
    code: "ESNFI_DEFICIT",
    sector: "shelter",
    name: "Displaced Households in Substandard or Inadequate Shelter",
    shortName: "Emergency Shelter Deficit",
    cluster: "Emergency Shelter & Non-Food Items (ES/NFI) Cluster",
    leadAgency: "UNHCR / IOM",
    unit: "percentage",
    definition:
      "Percentage of displaced households residing in makeshift emergency structures, damaged residences, open communal hangars, or public schools lacking weatherproofing, privacy, or essential NFI kits (plastic tarpaulins, thermal blankets, jerrycans).",
    sphereBenchmark: "Sphere Standard: Minimum 3.5 m² of covered living area per person, structurally sound with durable weather envelope.",
    severityThresholds: {
      low: 20,
      moderate: 40,
      severe: 60,
      critical: 80,
    },
    nationalAverage: 62.4,
    collectionMethodology:
      "Multi-Sector Needs Assessment (MSNA) and IOM DTM Site Assessment household observation verification.",
    sourceId: "ocha_hno",
    sourceName: "UN OCHA Ethiopia Humanitarian Needs Overview 2024",
    referencePeriod: "2024",
  },
  wash: {
    id: "hno_wash_potable_deficit_pct",
    code: "WASH_DEFICIT",
    sector: "wash",
    name: "Displacement Sites Lacking Minimum Potable Water Access",
    shortName: "Safe Water Deficit",
    cluster: "Water, Sanitation and Hygiene (WASH) Cluster",
    leadAgency: "UNICEF",
    unit: "percentage",
    definition:
      "Percentage of displacement sites where potable drinking water supply is below Sphere minimum standards (<15 liters/person/day) or water collection transit exceeds 30 minutes round-trip.",
    sphereBenchmark: "Sphere Standard: Minimum 15 liters of potable drinking water per person per day within 500 meters or 15-minute wait.",
    severityThresholds: {
      low: 25,
      moderate: 45,
      severe: 65,
      critical: 80,
    },
    nationalAverage: 54.8,
    collectionMethodology:
      "WASH Cluster site-level infrastructure mapping and water point functionality assessments.",
    sourceId: "ocha_hno",
    sourceName: "WASH Cluster Ethiopia / IOM DTM Round 37",
    referencePeriod: "2024",
  },
  food_security: {
    id: "fews_ipc_acute_food_insecurity_pct",
    code: "IPC_PHASE3_PLUS",
    sector: "food_security",
    name: "Population Facing IPC Acute Food Insecurity (Phase 3+)",
    shortName: "Acute Food Insecurity (IPC 3+)",
    cluster: "Food Security & Agriculture Cluster",
    leadAgency: "WFP / FAO / FEWS NET",
    unit: "percentage",
    definition:
      "Percentage of assessed population categorized in Integrated Food Security Phase Classification (IPC) Phase 3 (Crisis), Phase 4 (Emergency), or Phase 5 (Catastrophe), requiring urgent emergency food assistance.",
    sphereBenchmark: "IPC Global Standard: Phase 3 indicates critical food consumption gaps with above-average acute malnutrition and asset depletion.",
    severityThresholds: {
      low: 15,
      moderate: 30,
      severe: 50,
      critical: 70,
    },
    nationalAverage: 48.2,
    collectionMethodology:
      "FEWS NET / IPC Multi-Partner Acute Food Insecurity Analysis based on household food consumption scores and coping strategies.",
    sourceId: "fews_net",
    sourceName: "FEWS NET East Africa / Ethiopia IPC Acute Analysis",
    referencePeriod: "Mid-2024 Projection",
  },
  protection: {
    id: "hno_protection_acute_gap_pct",
    code: "PROT_ACUTE_GAP",
    sector: "protection",
    name: "Displacement Sites with Acute Child & Gender Protection Gaps",
    shortName: "Protection & GBV Risk Gaps",
    cluster: "Protection Cluster (Child Protection / GBV AoR)",
    leadAgency: "UNHCR / UNICEF / UNFPA",
    unit: "percentage",
    definition:
      "Percentage of displacement sites reporting unaccompanied or separated minors, absent child-friendly safe spaces, or lack of gender-segregated illuminated sanitation facilities causing elevated GBV vulnerability.",
    sphereBenchmark: "IASC Guidelines: 100% of displacement facilities must provide gender-segregated, lockable sanitation and active protection referral desks.",
    severityThresholds: {
      low: 20,
      moderate: 40,
      severe: 60,
      critical: 75,
    },
    nationalAverage: 58.1,
    collectionMethodology:
      "Protection Cluster Safety Audits, DTM Protection modules, and key informant community leader interviews.",
    sourceId: "ocha_hno",
    sourceName: "Global Protection Cluster Ethiopia / UNHCR",
    referencePeriod: "2024",
  },
  health: {
    id: "hno_health_facility_distance_pct",
    code: "HEALTH_ACCESS_GAP",
    sector: "health",
    name: "Displacement Sites Without Functioning Primary Health Services",
    shortName: "Primary Healthcare Gap",
    cluster: "Health Cluster",
    leadAgency: "WHO / Ethiopian Ministry of Health",
    unit: "percentage",
    definition:
      "Percentage of displacement sites where the nearest functioning primary healthcare post or mobile outreach health clinic is located more than 5 kilometers away or non-functional due to conflict damage.",
    sphereBenchmark: "WHO Standard: 1 functioning basic health unit per 10,000 population within 1 hour walking distance.",
    severityThresholds: {
      low: 20,
      moderate: 35,
      severe: 55,
      critical: 70,
    },
    nationalAverage: 46.5,
    collectionMethodology:
      "Health Cluster HeRAMS (Health Resources and Services Availability Monitoring System) mapping.",
    sourceId: "ocha_hno",
    sourceName: "Health Cluster Ethiopia / WHO",
    referencePeriod: "2024",
  },
};

export const REGIONAL_NEEDS_PROFILES: RegionNeedsProfile[] = [
  {
    regionId: "ET01",
    regionName: "Tigray",
    pcode: "ET01",
    assessedSitesCount: 684,
    totalIdpCaseload: 1025400,
    foodInsecurityPhase: "Phase 4: Emergency",
    scores: {
      shelter: {
        indicatorId: "hno_shelter_deficit_pct",
        sector: "shelter",
        value: 78.5,
        severity: "critical",
        status: "verified",
        notes: "Severe damage to public schools and makeshift camp structures; high congestion.",
      },
      wash: {
        indicatorId: "hno_wash_potable_deficit_pct",
        sector: "wash",
        value: 61.2,
        severity: "severe",
        status: "verified",
        notes: "Groundwater motorized pumps non-functional due to electrical grid outages.",
      },
      food_security: {
        indicatorId: "fews_ipc_acute_food_insecurity_pct",
        sector: "food_security",
        value: 68.0,
        severity: "critical",
        status: "verified",
        notes: "Agricultural input deficits and supply disruption; severe food consumption deficits.",
      },
      protection: {
        indicatorId: "hno_protection_acute_gap_pct",
        sector: "protection",
        value: 74.3,
        severity: "critical",
        status: "verified",
        notes: "Unaccompanied children separated during conflict; high psychosocial trauma demand.",
      },
      health: {
        indicatorId: "hno_health_facility_distance_pct",
        sector: "health",
        value: 59.4,
        severity: "severe",
        status: "verified",
        notes: "Partial rehabilitation of rural health centers; chronic medical supply stockouts.",
      },
    },
    priorityConcerns: [
      "School congestion preventing educational resumption",
      "Critical food consumption gap under IPC Phase 4",
      "Psychosocial and specialized child protection gaps",
    ],
    lastAssessed: "August 2024",
    sourceCitation: "IOM DTM R37 & OCHA HNO Tigray Cluster Needs Overview",
  },
  {
    regionId: "ET05",
    regionName: "Somali",
    pcode: "ET05",
    assessedSitesCount: 478,
    totalIdpCaseload: 612300,
    foodInsecurityPhase: "Phase 4: Emergency",
    scores: {
      shelter: {
        indicatorId: "hno_shelter_deficit_pct",
        sector: "shelter",
        value: 66.8,
        severity: "severe",
        status: "verified",
        notes: "Traditional buul shelters degraded by wind and localized riverine flooding.",
      },
      wash: {
        indicatorId: "hno_wash_potable_deficit_pct",
        sector: "wash",
        value: 82.4,
        severity: "critical",
        status: "verified",
        notes: "Acute borehole salinization and drying of berkhads across pastoralist woredas.",
      },
      food_security: {
        indicatorId: "fews_ipc_acute_food_insecurity_pct",
        sector: "food_security",
        value: 71.5,
        severity: "critical",
        status: "verified",
        notes: "Catastrophic loss of pastoral milk production following 4.5M livestock deaths.",
      },
      protection: {
        indicatorId: "hno_protection_acute_gap_pct",
        sector: "protection",
        value: 51.2,
        severity: "severe",
        status: "verified",
        notes: "Long water transit journeys exposing women and girls to harassment.",
      },
      health: {
        indicatorId: "hno_health_facility_distance_pct",
        sector: "health",
        value: 64.7,
        severity: "severe",
        status: "verified",
        notes: "Severe Acute Malnutrition (SAM) admissions high; mobile teams underfunded.",
      },
    },
    priorityConcerns: [
      "Water trucking dependency across lowland pastoral sites",
      "Emergency nutrition treatment for children under five",
      "Durable solutions for destitute former pastoralists",
    ],
    lastAssessed: "August 2024",
    sourceCitation: "IOM DTM R37 & FEWS NET Horn of Africa Drought Review",
  },
  {
    regionId: "ET04",
    regionName: "Oromia",
    pcode: "ET04",
    assessedSitesCount: 562,
    totalIdpCaseload: 734500,
    foodInsecurityPhase: "Phase 3: Crisis",
    scores: {
      shelter: {
        indicatorId: "hno_shelter_deficit_pct",
        sector: "shelter",
        value: 58.2,
        severity: "severe",
        status: "verified",
        notes: "Host community absorption strain in urban fringes; spontaneous settlements.",
      },
      wash: {
        indicatorId: "hno_wash_potable_deficit_pct",
        sector: "wash",
        value: 49.3,
        severity: "severe",
        status: "verified",
        notes: "Water trucking required in Borena; localized shortages in East Hararghe.",
      },
      food_security: {
        indicatorId: "fews_ipc_acute_food_insecurity_pct",
        sector: "food_security",
        value: 44.1,
        severity: "severe",
        status: "verified",
        notes: "Borena pastoralists in IPC Phase 3/4; Western farming areas recovering.",
      },
      protection: {
        indicatorId: "hno_protection_acute_gap_pct",
        sector: "protection",
        value: 61.5,
        severity: "critical",
        status: "verified",
        notes: "Access constraints due to active security operations in western zones.",
      },
      health: {
        indicatorId: "hno_health_facility_distance_pct",
        sector: "health",
        value: 39.8,
        severity: "moderate",
        status: "verified",
        notes: "Primary health network largely operational in central zones.",
      },
    },
    priorityConcerns: [
      "Protection access in remote western woreda pockets",
      "Restocking support for pastoralists in Borena zone",
      "Shelter material kits for host-community displaced",
    ],
    lastAssessed: "August 2024",
    sourceCitation: "IOM DTM R37 & OCHA Oromia Sub-Office Cluster Report",
  },
  {
    regionId: "ET03",
    regionName: "Amhara",
    pcode: "ET03",
    assessedSitesCount: 421,
    totalIdpCaseload: 582100,
    foodInsecurityPhase: "Phase 3: Crisis",
    scores: {
      shelter: {
        indicatorId: "hno_shelter_deficit_pct",
        sector: "shelter",
        value: 64.0,
        severity: "severe",
        status: "verified",
        notes: "Overcrowding in North Wollo and Wag Hamra collective centers.",
      },
      wash: {
        indicatorId: "hno_wash_potable_deficit_pct",
        sector: "wash",
        value: 52.8,
        severity: "severe",
        status: "verified",
        notes: "Spring caps damaged in highland zones; limited water trucking access.",
      },
      food_security: {
        indicatorId: "fews_ipc_acute_food_insecurity_pct",
        sector: "food_security",
        value: 46.2,
        severity: "severe",
        status: "verified",
        notes: "Meher harvest disruption in conflict-affected woredas.",
      },
      protection: {
        indicatorId: "hno_protection_acute_gap_pct",
        sector: "protection",
        value: 57.6,
        severity: "severe",
        status: "verified",
        notes: "Intermittent movement restrictions impacting aid delivery.",
      },
      health: {
        indicatorId: "hno_health_facility_distance_pct",
        sector: "health",
        value: 48.1,
        severity: "severe",
        status: "verified",
        notes: "Medical supply chains interrupted by road security checkpoints.",
      },
    },
    priorityConcerns: [
      "Access corridors for humanitarian food and medicine convoys",
      "Winterization and thermal blankets in high-altitude centers",
      "Rehabilitation of vandalized municipal water infrastructure",
    ],
    lastAssessed: "August 2024",
    sourceCitation: "IOM DTM R37 & Amhara Regional Disaster Risk Management",
  },
  {
    regionId: "ET02",
    regionName: "Afar",
    pcode: "ET02",
    assessedSitesCount: 142,
    totalIdpCaseload: 132400,
    foodInsecurityPhase: "Phase 4: Emergency",
    scores: {
      shelter: {
        indicatorId: "hno_shelter_deficit_pct",
        sector: "shelter",
        value: 52.1,
        severity: "severe",
        status: "verified",
        notes: "Thermal stress from high ambient temperatures in open lowland settlements.",
      },
      wash: {
        indicatorId: "hno_wash_potable_deficit_pct",
        sector: "wash",
        value: 74.2,
        severity: "critical",
        status: "verified",
        notes: "High salinity in Awash basin boreholes; extreme water trucking costs.",
      },
      food_security: {
        indicatorId: "fews_ipc_acute_food_insecurity_pct",
        sector: "food_security",
        value: 63.8,
        severity: "critical",
        status: "verified",
        notes: "Drought and conflict impact on rangeland forage; severe malnutrition rates.",
      },
      protection: {
        indicatorId: "hno_protection_acute_gap_pct",
        sector: "protection",
        value: 46.5,
        severity: "severe",
        status: "verified",
        notes: "Sparse settlement patterns isolating vulnerable female-headed households.",
      },
      health: {
        indicatorId: "hno_health_facility_distance_pct",
        sector: "health",
        value: 68.3,
        severity: "critical",
        status: "verified",
        notes: "Vast distances to nearest hospital; limited functional ambulance services.",
      },
    },
    priorityConcerns: [
      "Mobile medical outreach for nomadic and displaced pastoralists",
      "Desalination and solar-powered water pumping systems",
      "Supplementary feeding for lactating mothers and infants",
    ],
    lastAssessed: "August 2024",
    sourceCitation: "IOM DTM R37 & Afar Regional Health & Disaster Bureau",
  },
  {
    regionId: "ET06",
    regionName: "Benishangul-Gumuz",
    pcode: "ET06",
    assessedSitesCount: 96,
    totalIdpCaseload: 84200,
    foodInsecurityPhase: "Phase 3: Crisis",
    scores: {
      shelter: {
        indicatorId: "hno_shelter_deficit_pct",
        sector: "shelter",
        value: 54.3,
        severity: "severe",
        status: "verified",
        notes: "Returnee houses in Metekel zone heavily damaged; reconstruction pending.",
      },
      wash: {
        indicatorId: "hno_wash_potable_deficit_pct",
        sector: "wash",
        value: 41.5,
        severity: "moderate",
        status: "verified",
        notes: "Hand pumps in Metekel partially restored; Kamashi access limited.",
      },
      food_security: {
        indicatorId: "fews_ipc_acute_food_insecurity_pct",
        sector: "food_security",
        value: 38.6,
        severity: "moderate",
        status: "verified",
        notes: "Subsistence farming resuming in pacified woredas.",
      },
      protection: {
        indicatorId: "hno_protection_acute_gap_pct",
        sector: "protection",
        value: 49.0,
        severity: "severe",
        status: "verified",
        notes: "Intercommunal reconciliation ongoing; land title disputes.",
      },
      health: {
        indicatorId: "hno_health_facility_distance_pct",
        sector: "health",
        value: 42.1,
        severity: "moderate",
        status: "verified",
        notes: "Kamashi zone health posts cut off during rainy season.",
      },
    },
    priorityConcerns: [
      "Durable returnee shelter construction kits",
      "Reconciliation dialogues and land dispute mediation",
      "Kamashi zone humanitarian supply corridors",
    ],
    lastAssessed: "August 2024",
    sourceCitation: "IOM DTM R37 & BGRS Regional Disaster Risk Commission",
  },
  {
    regionId: "ET12",
    regionName: "Gambela",
    pcode: "ET12",
    assessedSitesCount: 78,
    totalIdpCaseload: 64100,
    foodInsecurityPhase: "Phase 3: Crisis",
    scores: {
      shelter: {
        indicatorId: "hno_shelter_deficit_pct",
        sector: "shelter",
        value: 47.9,
        severity: "severe",
        status: "verified",
        notes: "Seasonal flood inundation destroying thatch dwellings near river banks.",
      },
      wash: {
        indicatorId: "hno_wash_potable_deficit_pct",
        sector: "wash",
        value: 38.4,
        severity: "moderate",
        status: "verified",
        notes: "River water consumption during displacement; high waterborne disease risk.",
      },
      food_security: {
        indicatorId: "fews_ipc_acute_food_insecurity_pct",
        sector: "food_security",
        value: 42.0,
        severity: "severe",
        status: "verified",
        notes: "Flooding washed away maize farmlands along Baro river.",
      },
      protection: {
        indicatorId: "hno_protection_acute_gap_pct",
        sector: "protection",
        value: 52.8,
        severity: "severe",
        status: "verified",
        notes: "Tensions between refugee host communities and internal evacuees.",
      },
      health: {
        indicatorId: "hno_health_facility_distance_pct",
        sector: "health",
        value: 36.5,
        severity: "moderate",
        status: "verified",
        notes: "Malaria endemic zone; mosquito net stockouts.",
      },
    },
    priorityConcerns: [
      "Flood-resilient shelter relocation assistance",
      "Water purification chemicals and cholera prevention kits",
      "Joint host-refugee resource sharing committees",
    ],
    lastAssessed: "August 2024",
    sourceCitation: "IOM DTM R37 & Gambela Regional Health & Water Bureau",
  },
  {
    regionId: "ET07",
    regionName: "South Ethiopia / Central",
    pcode: "ET07",
    assessedSitesCount: 84,
    totalIdpCaseload: 67500,
    foodInsecurityPhase: "Phase 2: Stressed",
    scores: {
      shelter: {
        indicatorId: "hno_shelter_deficit_pct",
        sector: "shelter",
        value: 39.2,
        severity: "moderate",
        status: "verified",
        notes: "Gofa landslide evacuees accommodated in emergency shelters and schools.",
      },
      wash: {
        indicatorId: "hno_wash_potable_deficit_pct",
        sector: "wash",
        value: 32.1,
        severity: "moderate",
        status: "verified",
        notes: "Gravity spring water systems functioning across highland zones.",
      },
      food_security: {
        indicatorId: "fews_ipc_acute_food_insecurity_pct",
        sector: "food_security",
        value: 28.5,
        severity: "moderate",
        status: "verified",
        notes: "Root crop availability mitigating cereal deficit.",
      },
      protection: {
        indicatorId: "hno_protection_acute_gap_pct",
        sector: "protection",
        value: 34.6,
        severity: "moderate",
        status: "verified",
        notes: "Landslide orphan support and psychosocial trauma counseling.",
      },
      health: {
        indicatorId: "hno_health_facility_distance_pct",
        sector: "health",
        value: 29.3,
        severity: "moderate",
        status: "verified",
        notes: "Zonal hospital access within reachable radius.",
      },
    },
    priorityConcerns: [
      "Geotechnical relocation for landslide-prone escarpments",
      "Psychosocial counseling for trauma-affected households",
      "Enset / perennial crop restoration assistance",
    ],
    lastAssessed: "August 2024",
    sourceCitation: "IOM DTM R37 & Gofa Emergency Response Center",
  },
];
