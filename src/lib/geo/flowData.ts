/**
 * Flow & Origin-Destination Migration Pathways
 * Verified humanitarian data sources:
 * - UNHCR Refugee Data Finder (2023)
 * - IOM Displacement Tracking Matrix Site Assessment Round 37 (2024)
 * - IOM Missing Migrants Project & Horn of Africa Flow Monitoring Registry
 */

export interface FlowNode {
  id: string;
  name: string;
  category: "origin" | "hub" | "destination" | "unrecorded";
  color?: string;
  notes?: string;
  isDiffuse?: boolean;
}

export interface FlowLink {
  id: string;
  source: string; // FlowNode id
  target: string; // FlowNode id
  sourceName: string;
  targetName: string;
  volume: number; // Displaced individuals
  driver: "conflict" | "drought" | "floods" | "economic_asylum" | "unspecified";
  corridorName?: string;
  reportingDate: string;
  sourceCitation: string;
  isDiffuseOrigin?: boolean;
  isDiffuseDestination?: boolean;
}

export interface FlowDataset {
  id: string;
  title: string;
  subtitle: string;
  mandateBadge: string;
  mandateVariant: "cyan" | "ochre" | "terracotta" | "sage";
  totalVolume: number;
  reportingPeriod: string;
  citation: string;
  nodes: FlowNode[];
  links: FlowLink[];
}

/**
 * 1. Cross-Border Refugee Inflows into Ethiopia (UNHCR 2023 ProGres)
 * Origin countries -> Ethiopian Refugee Camp Settlements / Host Communities
 */
export const REFUGEE_INFLOW_DATASET: FlowDataset = {
  id: "refugee_inflows",
  title: "Cross-Border Refugee Inflows to Ethiopia",
  subtitle: "Movement from conflict and crisis origin countries into Ethiopian regional refugee settlements.",
  mandateBadge: "UNHCR 1951 Convention Mandate",
  mandateVariant: "cyan",
  totalVolume: 979846,
  reportingPeriod: "Year-End 2023",
  citation: "UNHCR Global Refugee Data Finder (2023) & Ethiopia Refugee Operations Registry",
  nodes: [
    // Origins (Left Column)
    { id: "ssd", name: "South Sudan", category: "origin", color: "#0284c7" },
    { id: "som", name: "Somalia", category: "origin", color: "#0369a1" },
    { id: "eri", name: "Eritrea", category: "origin", color: "#0284c7" },
    { id: "sdn", name: "Sudan", category: "origin", color: "#075985" },
    {
      id: "diffuse_origins",
      name: "Diffuse / Unrecorded Origins",
      category: "unrecorded",
      color: "#64748b",
      isDiffuse: true,
      notes: "Small-scale arrivals from Yemen, Syria, DR Congo, and unregistered border crossings.",
    },

    // Destinations (Right Column)
    { id: "dest_gambela", name: "Gambela Region Camps", category: "destination", color: "#0ea5e9" },
    { id: "dest_somali", name: "Somali Region Camps (Dollo Ado)", category: "destination", color: "#0284c7" },
    { id: "dest_tigray_afar", name: "Tigray & Afar Border Camps", category: "destination", color: "#38bdf8" },
    { id: "dest_benishangul", name: "Benishangul-Gumuz Camps", category: "destination", color: "#06b6d4" },
    { id: "dest_urban_addis", name: "Urban Addis Ababa (Out-of-Camp)", category: "destination", color: "#22d3ee" },
    {
      id: "dest_dispersed",
      name: "Dispersed Host Communities",
      category: "unrecorded",
      color: "#64748b",
      isDiffuse: true,
      notes: "Refugees co-residing informally with borderland host communities.",
    },
  ],
  links: [
    {
      id: "link_ssd_gambela",
      source: "ssd",
      target: "dest_gambela",
      sourceName: "South Sudan",
      targetName: "Gambela Region Camps",
      volume: 378000,
      driver: "conflict",
      corridorName: "Gambela Humanitarian Corridor",
      reportingDate: "2023-12-31",
      sourceCitation: "UNHCR Refugee Data Finder (2023)",
    },
    {
      id: "link_ssd_benishangul",
      source: "ssd",
      target: "dest_benishangul",
      sourceName: "South Sudan",
      targetName: "Benishangul-Gumuz Camps",
      volume: 43438,
      driver: "conflict",
      corridorName: "Western Borderland Route",
      reportingDate: "2023-12-31",
      sourceCitation: "UNHCR Refugee Data Finder (2023)",
    },
    {
      id: "link_som_dollo",
      source: "som",
      target: "dest_somali",
      sourceName: "Somalia",
      targetName: "Somali Region Camps (Dollo Ado)",
      volume: 294000,
      driver: "drought",
      corridorName: "Dollo Ado & Mirqaan Inflow Axis",
      reportingDate: "2023-12-31",
      sourceCitation: "UNHCR Refugee Data Finder (2023)",
    },
    {
      id: "link_som_urban",
      source: "som",
      target: "dest_urban_addis",
      sourceName: "Somalia",
      targetName: "Urban Addis Ababa (Out-of-Camp)",
      volume: 18185,
      driver: "conflict",
      corridorName: "Urban Integration Policy",
      reportingDate: "2023-12-31",
      sourceCitation: "UNHCR Refugee Data Finder (2023)",
    },
    {
      id: "link_eri_tigray_afar",
      source: "eri",
      target: "dest_tigray_afar",
      sourceName: "Eritrea",
      targetName: "Tigray & Afar Border Camps",
      volume: 124000,
      driver: "conflict",
      corridorName: "Northern Border Inflow Corridor",
      reportingDate: "2023-12-31",
      sourceCitation: "UNHCR Refugee Data Finder (2023)",
    },
    {
      id: "link_eri_urban",
      source: "eri",
      target: "dest_urban_addis",
      sourceName: "Eritrea",
      targetName: "Urban Addis Ababa (Out-of-Camp)",
      volume: 44793,
      driver: "conflict",
      corridorName: "Urban Protection Scheme",
      reportingDate: "2023-12-31",
      sourceCitation: "UNHCR Refugee Data Finder (2023)",
    },
    {
      id: "link_sdn_amhara",
      source: "sdn",
      target: "dest_dispersed",
      sourceName: "Sudan",
      targetName: "Dispersed Host Communities",
      volume: 52000,
      driver: "conflict",
      corridorName: "Metema Border Corridor",
      reportingDate: "2023-12-31",
      sourceCitation: "UNHCR Refugee Data Finder (2023)",
    },
    {
      id: "link_sdn_benishangul",
      source: "sdn",
      target: "dest_benishangul",
      sourceName: "Sudan",
      targetName: "Benishangul-Gumuz Camps",
      volume: 25430,
      driver: "conflict",
      corridorName: "Kurmuk / Sherkole Crossing",
      reportingDate: "2023-12-31",
      sourceCitation: "UNHCR Refugee Data Finder (2023)",
    },
    {
      id: "link_diffuse_urban",
      source: "diffuse_origins",
      target: "dest_urban_addis",
      sourceName: "Diffuse / Unrecorded Origins",
      targetName: "Urban Addis Ababa (Out-of-Camp)",
      volume: 13850,
      driver: "unspecified",
      corridorName: "Secondary Urban Dispersal",
      reportingDate: "2023-12-31",
      sourceCitation: "UNHCR Refugee Data Finder (2023)",
      isDiffuseOrigin: true,
    },
  ],
};

/**
 * 2. Internal Displacement Subnational Corridors (IOM DTM Round 37)
 * Conflict/Drought Origin Zones -> Host Woredas & Collective Sites
 */
export const INTERNAL_DISPLACEMENT_FLOW_DATASET: FlowDataset = {
  id: "internal_displacement_flows",
  title: "Subnational Internal Displacement Corridors",
  subtitle: "Movement from primary conflict and drought epicenter zones into IDP hosting sites.",
  mandateBadge: "IOM DTM Round 37 Mandate",
  mandateVariant: "ochre",
  totalVolume: 1532000,
  reportingPeriod: "August 2024",
  citation: "IOM Displacement Tracking Matrix Site Assessment Round 37 (Flow Monitoring Crosswalk)",
  nodes: [
    // Origins
    { id: "orig_west_tigray", name: "Western Tigray Epicenter", category: "origin", color: "#d97706" },
    { id: "orig_north_wollo", name: "North Wollo & Wag Hemra", category: "origin", color: "#b45309" },
    { id: "orig_guji_borena", name: "Guji & Southern Oromia", category: "origin", color: "#d97706" },
    { id: "orig_shabelle_dawa", name: "Shabelle & Dawa Drought Basin", category: "origin", color: "#92400e" },
    { id: "orig_afar_border", name: "Afar Northern Borderlands", category: "origin", color: "#b45309" },
    {
      id: "orig_unrecorded",
      name: "Unrecorded Origin Woredas",
      category: "unrecorded",
      color: "#64748b",
      isDiffuse: true,
      notes: "Rapid site assessments capturing arrival counts without verified village-of-origin confirmation.",
    },

    // Destinations
    { id: "dest_central_tigray", name: "Central Tigray Sites (Shire/Axum)", category: "destination", color: "#f59e0b" },
    { id: "dest_south_wollo", name: "South Wollo Sites (Dessie/Kombolcha)", category: "destination", color: "#f59e0b" },
    { id: "dest_gedeo_borena", name: "Gedeo & Borena Resettlement", category: "destination", color: "#fbbf24" },
    { id: "dest_gode_dollo", name: "Gode & Dollo Ado Collective Sites", category: "destination", color: "#f59e0b" },
    { id: "dest_semera_awash", name: "Semera & Awash Settlements", category: "destination", color: "#fbbf24" },
    {
      id: "dest_diffuse_host",
      name: "Dispersed Family Host Units",
      category: "unrecorded",
      color: "#64748b",
      isDiffuse: true,
      notes: "IDPs living outside formal collective centers with kin and host families.",
    },
  ],
  links: [
    {
      id: "link_tigray_flow",
      source: "orig_west_tigray",
      target: "dest_central_tigray",
      sourceName: "Western Tigray Epicenter",
      targetName: "Central Tigray Sites (Shire/Axum)",
      volume: 420000,
      driver: "conflict",
      corridorName: "Tigray Internal Displacement Axis",
      reportingDate: "2024-08-31",
      sourceCitation: "IOM DTM Round 37",
    },
    {
      id: "link_amhara_flow",
      source: "orig_north_wollo",
      target: "dest_south_wollo",
      sourceName: "North Wollo & Wag Hemra",
      targetName: "South Wollo Sites (Dessie/Kombolcha)",
      volume: 285000,
      driver: "conflict",
      corridorName: "Amhara Highland Insecurity Route",
      reportingDate: "2024-08-31",
      sourceCitation: "IOM DTM Round 37",
    },
    {
      id: "link_shabelle_flow",
      source: "orig_shabelle_dawa",
      target: "dest_gode_dollo",
      sourceName: "Shabelle & Dawa Drought Basin",
      targetName: "Gode & Dollo Ado Collective Sites",
      volume: 310000,
      driver: "drought",
      corridorName: "Pastoral Drought Movement Corridor",
      reportingDate: "2024-08-31",
      sourceCitation: "IOM DTM Round 37",
    },
    {
      id: "link_oromia_flow",
      source: "orig_guji_borena",
      target: "dest_gedeo_borena",
      sourceName: "Guji & Southern Oromia",
      targetName: "Gedeo & Borena Resettlement",
      volume: 240000,
      driver: "conflict",
      corridorName: "Southern Oromia Intercommunal Axis",
      reportingDate: "2024-08-31",
      sourceCitation: "IOM DTM Round 37",
    },
    {
      id: "link_afar_flow",
      source: "orig_afar_border",
      target: "dest_semera_awash",
      sourceName: "Afar Northern Borderlands",
      targetName: "Semera & Awash Settlements",
      volume: 112000,
      driver: "conflict",
      corridorName: "Afar Border Insecurity Axis",
      reportingDate: "2024-08-31",
      sourceCitation: "IOM DTM Round 37",
    },
    {
      id: "link_unrecorded_diffuse",
      source: "orig_unrecorded",
      target: "dest_diffuse_host",
      sourceName: "Unrecorded Origin Woredas",
      targetName: "Dispersed Family Host Units",
      volume: 165000,
      driver: "unspecified",
      corridorName: "Non-Site Informal Accommodations",
      reportingDate: "2024-08-31",
      sourceCitation: "IOM DTM Round 37",
      isDiffuseOrigin: true,
      isDiffuseDestination: true,
    },
  ],
};

/**
 * 3. Outflow International Migration Corridors (IOM & Regional Data)
 * Departure regions -> Major transit routes & destination countries
 */
export const OUTFLOW_MIGRATION_FLOW_DATASET: FlowDataset = {
  id: "outflow_migration_flows",
  title: "Cross-Border Irregular Outflow Corridors",
  subtitle: "Movement from Ethiopian departure hubs along major Horn of Africa irregular transit routes.",
  mandateBadge: "IOM Missing Migrants & Flow Monitoring",
  mandateVariant: "terracotta",
  totalVolume: 278000,
  reportingPeriod: "Annual Estimate (2024)",
  citation: "IOM Regional Flow Monitoring Network (Horn of Africa) & Mixed Migration Centre",
  nodes: [
    // Origins / Departures
    { id: "dep_amhara_tigray", name: "Amhara & Tigray Departures", category: "origin", color: "#c2410c" },
    { id: "dep_oromia_central", name: "Oromia & Central Hubs", category: "origin", color: "#ea580c" },
    { id: "dep_southern_pastoral", name: "Southern & Pastoral Areas", category: "origin", color: "#c2410c" },
    {
      id: "dep_diffuse",
      name: "Diffuse / Unspecified Departures",
      category: "unrecorded",
      color: "#64748b",
      isDiffuse: true,
      notes: "Undocumented departures without registered regional origin point.",
    },

    // Destinations / Corridors
    { id: "route_eastern", name: "Eastern Route (Saudi Arabia / Gulf)", category: "destination", color: "#f97316" },
    { id: "route_southern", name: "Southern Route (South Africa)", category: "destination", color: "#10b981" },
    { id: "route_northern", name: "Northern Route (Europe / Libya)", category: "destination", color: "#ef4444" },
    {
      id: "route_clandestine",
      name: "Clandestine / Unrecorded En-Route",
      category: "unrecorded",
      color: "#64748b",
      isDiffuse: true,
      notes: "Migrants stranded, detained, or missing along unmonitored desert/sea crossings.",
    },
  ],
  links: [
    {
      id: "link_outflow_eastern_1",
      source: "dep_oromia_central",
      target: "route_eastern",
      sourceName: "Oromia & Central Hubs",
      targetName: "Eastern Route (Saudi Arabia / Gulf)",
      volume: 125000,
      driver: "economic_asylum",
      corridorName: "Eastern Gulf Route",
      reportingDate: "2024-06-30",
      sourceCitation: "IOM Flow Monitoring (Djibouti/Yemen)",
    },
    {
      id: "link_outflow_eastern_2",
      source: "dep_amhara_tigray",
      target: "route_eastern",
      sourceName: "Amhara & Tigray Departures",
      targetName: "Eastern Route (Saudi Arabia / Gulf)",
      volume: 55000,
      driver: "conflict",
      corridorName: "Eastern Gulf Route",
      reportingDate: "2024-06-30",
      sourceCitation: "IOM Flow Monitoring (Djibouti/Yemen)",
    },
    {
      id: "link_outflow_southern",
      source: "dep_southern_pastoral",
      target: "route_southern",
      sourceName: "Southern & Pastoral Areas",
      targetName: "Southern Route (South Africa)",
      volume: 52000,
      driver: "economic_asylum",
      corridorName: "Southern Overland Corridor",
      reportingDate: "2024-06-30",
      sourceCitation: "IOM Flow Monitoring (Moyale/Tanzania)",
    },
    {
      id: "link_outflow_northern",
      source: "dep_amhara_tigray",
      target: "route_northern",
      sourceName: "Amhara & Tigray Departures",
      targetName: "Northern Route (Europe / Libya)",
      volume: 18000,
      driver: "conflict",
      corridorName: "Northern Desert Corridor",
      reportingDate: "2024-06-30",
      sourceCitation: "IOM Missing Migrants Project",
    },
    {
      id: "link_outflow_clandestine",
      source: "dep_diffuse",
      target: "route_clandestine",
      sourceName: "Diffuse / Unspecified Departures",
      targetName: "Clandestine / Unrecorded En-Route",
      volume: 28000,
      driver: "unspecified",
      corridorName: "Unmonitored Pathways",
      reportingDate: "2024-06-30",
      sourceCitation: "Mixed Migration Centre Triangulation",
      isDiffuseOrigin: true,
      isDiffuseDestination: true,
    },
  ],
};
