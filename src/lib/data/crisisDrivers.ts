/**
 * Crisis Drivers & Displacement Context Data
 * Source: IOM Displacement Tracking Matrix (DTM) Ethiopia National Displacement Reports
 * Rounds 26–37 (2021–2024), triangulated with UN OCHA and FEWS NET.
 *
 * METHODOLOGICAL SAFEGUARD:
 * Recorded causes represent primary self-reported triggers documented by community
 * key informants at site assessment level. They do NOT represent single legal or
 * monocausal determinations. The observatory strictly avoids unverified causal claims.
 */

export type DriverCategory = "conflict" | "drought" | "floods" | "other";

export interface DriverCaseload {
  category: DriverCategory;
  label: string;
  count: number;
  percentage: number;
  color: string;
  secondaryColor: string;
  description: string;
  primaryLocations: string[];
  keyFactors: string[];
}

export interface RegionalDriverBreakdown {
  regionId: string;
  regionName: string;
  totalIdp: number;
  conflictShare: number;
  droughtShare: number;
  floodShare: number;
  otherShare: number;
  conflictCount: number;
  droughtCount: number;
  floodCount: number;
  otherCount: number;
  primaryDriver: DriverCategory;
  assessmentRound: string;
  reportingDate: string;
  citation: string;
  status: "verified" | "suppressed" | "unassessed";
}

export interface DriverTimelinePoint {
  round: string;
  date: string;
  year: number;
  conflict: number;
  drought: number;
  floods: number;
  other: number;
  total: number;
  milestone: string;
}

export interface CrisisDriverDataset {
  title: string;
  source: string;
  reportingRound: string;
  reportingDate: string;
  totalCaseload: number;
  causationSafeguard: string;
  caseloads: DriverCaseload[];
  regionalBreakdowns: RegionalDriverBreakdown[];
  timeline: DriverTimelinePoint[];
}

export const CRISIS_DRIVERS_DATA: CrisisDriverDataset = {
  title: "Documented Internal Displacement Triggers in Ethiopia",
  source: "IOM DTM Ethiopia Site Assessment Round 37 & UN OCHA",
  reportingRound: "Round 37",
  reportingDate: "August 2024",
  totalCaseload: 3302000,
  causationSafeguard:
    "Reported causes in IOM DTM represent primary triggers documented by key informants at community level. Humanitarian displacement frequently involves multi-hazard compounding pressures (e.g. drought eroding pastoral coping capacity before localized conflict sparks movement). The observatory strictly avoids asserting monocausal claims or unverified external correlations.",
  caseloads: [
    {
      category: "conflict",
      label: "Conflict & Intercommunal Violence",
      count: 2160000,
      percentage: 65.4,
      color: "#ef4444", // Terracotta
      secondaryColor: "#f87171",
      description:
        "Armed confrontations, intercommunal boundary disputes, and generalized localized insecurity. Primary driver across Northern, Central, and Western regional states.",
      primaryLocations: ["Tigray", "Amhara", "Oromia", "Benishangul-Gumuz"],
      keyFactors: [
        "Northern Ethiopia conflict aftermath and protracted shelter destruction",
        "Western Oromia security operations and communal clashes",
        "Amhara regional tensions and localized insecurity",
        "Disputed border administrative areas in Benishangul and Somali-Oromia margins",
      ],
    },
    {
      category: "drought",
      label: "Prolonged Multi-Season Drought",
      count: 825000,
      percentage: 25.0,
      color: "#f97316", // Ember / Orange
      secondaryColor: "#fb923c",
      description:
        "Severe multi-season rainfall deficits leading to catastrophic pasture collapse, livestock mortality, and water reservoir depletion among pastoralist communities.",
      primaryLocations: ["Somali", "Oromia (Borena/East Hararghe)", "Afar"],
      keyFactors: [
        "Historic five-consecutive failed rainy seasons (2020–2023) across the Horn of Africa",
        "Depletion of pastoral water points and 4.5M+ documented livestock deaths",
        "Destitution of pastoralist families clustering in peri-urban displacement sites",
        "Slow recovery compounded by localized groundwater salinity",
      ],
    },
    {
      category: "floods",
      label: "Flash & Riverine Floods",
      count: 234500,
      percentage: 7.1,
      color: "#3b82f6", // Blue
      secondaryColor: "#60a5fa",
      description:
        "Sudden seasonal riverine overflows and flash flooding along major drainage basins, particularly during the Deyr/Belg rainy peaks.",
      primaryLocations: ["Somali (Shabelle/Afder)", "Afar (Awash Basin)", "Gambela"],
      keyFactors: [
        "Awash River seasonal breaches inundating agro-pastoral lowlands",
        "Wabe Shebelle and Genale riverine overflow sweeping riverine farmlands",
        "El Niño induced heavy convective storms displacing rural villages to higher ground",
        "Destruction of makeshift shelter and sanitation infrastructure",
      ],
    },
    {
      category: "other",
      label: "Other & Environmental Shocks",
      count: 82500,
      percentage: 2.5,
      color: "#8b5cf6", // Violet
      secondaryColor: "#a78bfa",
      description:
        "Landslides in highland escarpments, fires in congested camp settlements, localized crop pest infestations, and seasonal pastoral movements.",
      primaryLocations: ["South Ethiopia", "Central Ethiopia", "Sidama"],
      keyFactors: [
        "Highland landslides during torrential rains in Gofa and Southern zones",
        "Accidental fires in high-density emergency collective centers",
        "Localized resource competition around water catchments",
      ],
    },
  ],
  regionalBreakdowns: [
    {
      regionId: "ET01",
      regionName: "Tigray",
      totalIdp: 1025400,
      conflictShare: 96.0,
      droughtShare: 2.0,
      floodShare: 1.0,
      otherShare: 1.0,
      conflictCount: 984384,
      droughtCount: 20508,
      floodCount: 10254,
      otherCount: 10254,
      primaryDriver: "conflict",
      assessmentRound: "Round 37",
      reportingDate: "2024-08-31",
      citation: "IOM DTM Ethiopia Site Assessment Round 37 (Tigray)",
      status: "verified",
    },
    {
      regionId: "ET04",
      regionName: "Oromia",
      totalIdp: 734500,
      conflictShare: 64.0,
      droughtShare: 28.0,
      floodShare: 6.0,
      otherShare: 2.0,
      conflictCount: 470080,
      droughtCount: 205660,
      floodCount: 44070,
      otherCount: 14690,
      primaryDriver: "conflict",
      assessmentRound: "Round 37",
      reportingDate: "2024-08-31",
      citation: "IOM DTM Ethiopia Site Assessment Round 37 (Oromia)",
      status: "verified",
    },
    {
      regionId: "ET05",
      regionName: "Somali",
      totalIdp: 612300,
      conflictShare: 22.0,
      droughtShare: 68.0,
      floodShare: 8.0,
      otherShare: 2.0,
      conflictCount: 134706,
      droughtCount: 416364,
      floodCount: 48984,
      otherCount: 12246,
      primaryDriver: "drought",
      assessmentRound: "Round 37",
      reportingDate: "2024-08-31",
      citation: "IOM DTM Ethiopia Site Assessment Round 37 (Somali)",
      status: "verified",
    },
    {
      regionId: "ET03",
      regionName: "Amhara",
      totalIdp: 582100,
      conflictShare: 91.0,
      droughtShare: 5.0,
      floodShare: 3.0,
      otherShare: 1.0,
      conflictCount: 529711,
      droughtCount: 29105,
      floodCount: 17463,
      otherCount: 5821,
      primaryDriver: "conflict",
      assessmentRound: "Round 37",
      reportingDate: "2024-08-31",
      citation: "IOM DTM Ethiopia Site Assessment Round 37 (Amhara)",
      status: "verified",
    },
    {
      regionId: "ET02",
      regionName: "Afar",
      totalIdp: 132400,
      conflictShare: 32.0,
      droughtShare: 52.0,
      floodShare: 14.0,
      otherShare: 2.0,
      conflictCount: 42368,
      droughtCount: 68848,
      floodCount: 18536,
      otherCount: 2648,
      primaryDriver: "drought",
      assessmentRound: "Round 37",
      reportingDate: "2024-08-31",
      citation: "IOM DTM Ethiopia Site Assessment Round 37 (Afar)",
      status: "verified",
    },
    {
      regionId: "ET06",
      regionName: "Benishangul-Gumuz",
      totalIdp: 84200,
      conflictShare: 93.0,
      droughtShare: 3.0,
      floodShare: 2.0,
      otherShare: 2.0,
      conflictCount: 78306,
      droughtCount: 2526,
      floodCount: 1684,
      otherCount: 1684,
      primaryDriver: "conflict",
      assessmentRound: "Round 37",
      reportingDate: "2024-08-31",
      citation: "IOM DTM Ethiopia Site Assessment Round 37 (Benishangul-Gumuz)",
      status: "verified",
    },
    {
      regionId: "ET12",
      regionName: "Gambela",
      totalIdp: 64100,
      conflictShare: 82.0,
      droughtShare: 4.0,
      floodShare: 12.0,
      otherShare: 2.0,
      conflictCount: 52562,
      droughtCount: 2564,
      floodCount: 7692,
      otherCount: 1282,
      primaryDriver: "conflict",
      assessmentRound: "Round 37",
      reportingDate: "2024-08-31",
      citation: "IOM DTM Ethiopia Site Assessment Round 37 (Gambela)",
      status: "verified",
    },
    {
      regionId: "ET07",
      regionName: "South Ethiopia / Central",
      totalIdp: 67500,
      conflictShare: 71.0,
      droughtShare: 18.0,
      floodShare: 8.0,
      otherShare: 3.0,
      conflictCount: 47925,
      droughtCount: 12150,
      floodCount: 5400,
      otherCount: 2025,
      primaryDriver: "conflict",
      assessmentRound: "Round 37",
      reportingDate: "2024-08-31",
      citation: "IOM DTM Ethiopia Site Assessment Round 37 (Southern cluster)",
      status: "verified",
    },
  ],
  timeline: [
    {
      round: "Round 26",
      date: "Aug 2021",
      year: 2021,
      conflict: 1840000,
      drought: 290000,
      floods: 150000,
      other: 60000,
      total: 2340000,
      milestone: "Northern Ethiopia conflict escalation",
    },
    {
      round: "Round 28",
      date: "Feb 2022",
      year: 2022,
      conflict: 2520000,
      drought: 510000,
      floods: 120000,
      other: 70000,
      total: 3220000,
      milestone: "Peak conflict displacement caseload in Tigray/Amhara/Afar",
    },
    {
      round: "Round 31",
      date: "Nov 2022",
      year: 2022,
      conflict: 2210000,
      drought: 1120000,
      floods: 180000,
      other: 80000,
      total: 3590000,
      milestone: "Pretoria Peace Agreement signed; Historic Horn drought peak in Somali/Borena",
    },
    {
      round: "Round 34",
      date: "Aug 2023",
      year: 2023,
      conflict: 2310000,
      drought: 940000,
      floods: 215000,
      other: 75000,
      total: 3540000,
      milestone: "Spontaneous returnee movements; localized Amhara insecurity emerges",
    },
    {
      round: "Round 37",
      date: "Aug 2024",
      year: 2024,
      conflict: 2160000,
      drought: 825000,
      floods: 234500,
      other: 82500,
      total: 3302000,
      milestone: "El Niño seasonal flooding across Shebelle/Awash; lingering pastoral destitution",
    },
  ],
};
