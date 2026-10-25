/**
 * Global Migration & Cross-Border Corridor Dataset
 * Verified data sources:
 * - UN DESA Population Division (International Migrant Stock 2020 / 2024 revisions)
 * - UNHCR Refugee Data Finder (2023)
 * - IOM Missing Migrants Project & Regional Flow Monitoring Registry (2024)
 */

export interface GlobalPartnerCountry {
  iso: string;
  numericId: string;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  emigrantStocks: Record<number, number>; // Year -> Stock count
  refugeesAbroad: number; // Ethiopian refugees hosted in this country
  refugeesHostedInEthiopia?: number; // Refugees from this country hosted in Ethiopia
  corridor: string;
  notes?: string;
}

export interface MigrationCorridor {
  id: string;
  name: string;
  routeType: "Eastern Route" | "Southern Route" | "Northern Route" | "Transatlantic";
  status: "Active High-Volume" | "Steady Trans-Regional" | "Severely Restricted";
  annualEstimatedVolume: string;
  riskRating: "Extreme" | "High" | "Moderate";
  transitHubs: string[];
  description: string;
  waypoints: [number, number][]; // Line coordinates along corridor
}

export const ETHIOPIA_CENTROID: [number, number] = [38.74, 9.03];

export const GLOBAL_PARTNER_COUNTRIES: GlobalPartnerCountry[] = [
  {
    iso: "USA",
    numericId: "840",
    name: "United States",
    coordinates: [-98.58, 39.83],
    emigrantStocks: { 2010: 175000, 2015: 235000, 2020: 295000, 2024: 325000 },
    refugeesAbroad: 14200,
    corridor: "Transatlantic Diaspora",
    notes: "Largest Ethiopian diaspora globally; major hubs in Washington DC, Seattle, Minneapolis.",
  },
  {
    iso: "SAU",
    numericId: "682",
    name: "Saudi Arabia",
    coordinates: [45.08, 23.88],
    emigrantStocks: { 2010: 110000, 2015: 180000, 2020: 220000, 2024: 260000 },
    refugeesAbroad: 3500,
    corridor: "Eastern Route (Yemen & Gulf)",
    notes: "Primary labor migration destination for domestic, construction, and agricultural workers via the Eastern Route.",
  },
  {
    iso: "ISR",
    numericId: "376",
    name: "Israel",
    coordinates: [34.85, 31.05],
    emigrantStocks: { 2010: 125000, 2015: 140000, 2020: 155000, 2024: 165000 },
    refugeesAbroad: 1200,
    corridor: "Historical Beta Israel & Diaspora",
    notes: "Beta Israel community established through historical aliyah operations (Moses, Solomon) and ongoing family reunification.",
  },
  {
    iso: "SDN",
    numericId: "729",
    name: "Sudan",
    coordinates: [30.22, 12.86],
    emigrantStocks: { 2010: 160000, 2015: 150000, 2020: 145000, 2024: 140000 },
    refugeesAbroad: 72000,
    refugeesHostedInEthiopia: 77430,
    corridor: "Northern Route / Borderland",
    notes: "Historically both a key host for Ethiopian refugees (Tigray crisis) and originator of 77,000+ Sudanese refugees in Amhara & Benishangul.",
  },
  {
    iso: "SSD",
    numericId: "728",
    name: "South Sudan",
    coordinates: [31.31, 6.88],
    emigrantStocks: { 2010: 15000, 2015: 25000, 2020: 32000, 2024: 38000 },
    refugeesAbroad: 2100,
    refugeesHostedInEthiopia: 421438,
    corridor: "Gambela Humanitarian Corridor",
    notes: "Origin of Ethiopia's largest refugee population (421,438 registered in Gambela and Benishangul-Gumuz camps).",
  },
  {
    iso: "SOM",
    numericId: "706",
    name: "Somalia",
    coordinates: [46.20, 5.15],
    emigrantStocks: { 2010: 12000, 2015: 18000, 2020: 22000, 2024: 25000 },
    refugeesAbroad: 4500,
    refugeesHostedInEthiopia: 312185,
    corridor: "Dollo Ado / Somali Regional State",
    notes: "Origin of 312,185 Somali refugees in Dollo Ado and Mirqaan camps driven by conflict and prolonged climatic drought.",
  },
  {
    iso: "ERI",
    numericId: "232",
    name: "Eritrea",
    coordinates: [39.78, 15.18],
    emigrantStocks: { 2010: 8000, 2015: 12000, 2020: 15000, 2024: 18000 },
    refugeesAbroad: 3200,
    refugeesHostedInEthiopia: 168793,
    corridor: "Tigray & Afar Border Entry Corridor",
    notes: "Origin of 168,793 Eritrean refugees hosted across urban Addis Ababa, Tigray, and Afar regional settlements.",
  },
  {
    iso: "KEN",
    numericId: "404",
    name: "Kenya",
    coordinates: [37.91, -0.02],
    emigrantStocks: { 2010: 22000, 2015: 28000, 2020: 35000, 2024: 42000 },
    refugeesAbroad: 34000,
    refugeesHostedInEthiopia: 3200,
    corridor: "Southern Route (Moyale Gateway)",
    notes: "Key Southern Route transit gateway through Moyale; hosts 34,000 Ethiopian refugees in Kakuma, Dadaab, and Nairobi.",
  },
  {
    iso: "DEU",
    numericId: "276",
    name: "Germany",
    coordinates: [10.45, 51.17],
    emigrantStocks: { 2010: 20000, 2015: 28000, 2020: 41000, 2024: 48000 },
    refugeesAbroad: 11500,
    corridor: "European Diaspora & Asylum",
    notes: "Largest destination country for Ethiopian diaspora and asylum-seekers inside the European Union.",
  },
  {
    iso: "ARE",
    numericId: "784",
    name: "United Arab Emirates",
    coordinates: [53.85, 23.42],
    emigrantStocks: { 2010: 15000, 2015: 28000, 2020: 38000, 2024: 45000 },
    refugeesAbroad: 800,
    corridor: "Eastern Route (Gulf Labor Market)",
    notes: "Rapidly growing formal and informal labor migration hub across Dubai and Abu Dhabi.",
  },
  {
    iso: "CAN",
    numericId: "124",
    name: "Canada",
    coordinates: [-106.35, 56.13],
    emigrantStocks: { 2010: 18000, 2015: 25000, 2020: 32000, 2024: 38000 },
    refugeesAbroad: 4200,
    corridor: "North American Diaspora",
    notes: "Vibrant diaspora communities centered in Toronto, Calgary, Edmonton, and Ottawa.",
  },
  {
    iso: "GBR",
    numericId: "826",
    name: "United Kingdom",
    coordinates: [-3.44, 55.38],
    emigrantStocks: { 2010: 19000, 2015: 24000, 2020: 30000, 2024: 35000 },
    refugeesAbroad: 6100,
    corridor: "European Diaspora & Historical Ties",
    notes: "Historical diaspora hub concentrated heavily in Greater London, Birmingham, and Manchester.",
  },
  {
    iso: "ZAF",
    numericId: "710",
    name: "South Africa",
    coordinates: [22.94, -30.56],
    emigrantStocks: { 2010: 12000, 2015: 18000, 2020: 24000, 2024: 29000 },
    refugeesAbroad: 21000,
    corridor: "Southern Route Destination Hub",
    notes: "Primary destination for irregular migrants traveling down the 4,000 km Southern Corridor; major commercial presence in Johannesburg & Durban.",
  },
  {
    iso: "YEM",
    numericId: "887",
    name: "Yemen",
    coordinates: [48.52, 15.55],
    emigrantStocks: { 2010: 18000, 2015: 15000, 2020: 14000, 2024: 12000 },
    refugeesAbroad: 16000,
    refugeesHostedInEthiopia: 8100,
    corridor: "Eastern Route Transit Chokepoint",
    notes: "Dangerous maritime crossing via Gulf of Aden. Despite ongoing civil conflict, tens of thousands transit annually toward Saudi Arabia.",
  },
  {
    iso: "DJI",
    numericId: "262",
    name: "Djibouti",
    coordinates: [42.59, 11.83],
    emigrantStocks: { 2010: 8000, 2015: 9500, 2020: 10500, 2024: 11000 },
    refugeesAbroad: 2800,
    refugeesHostedInEthiopia: 2400,
    corridor: "Eastern Route Staging Hub (Obock)",
    notes: "The northern coastal town of Obock serves as the primary maritime embarkation point for boats crossing the Bab el-Mandeb strait.",
  },
];

export const MIGRATION_CORRIDORS: MigrationCorridor[] = [
  {
    id: "corridor_eastern",
    name: "Eastern Route (Yemen & Gulf States)",
    routeType: "Eastern Route",
    status: "Active High-Volume",
    annualEstimatedVolume: "150,000–250,000 journeys",
    riskRating: "Extreme",
    transitHubs: ["Dire Dawa", "Semera", "Obock (Djibouti)", "Bossaso (Somalia)", "Aden (Yemen)", "Sa'ada"],
    description:
      "The busiest maritime and desert irregular transit route in the Horn of Africa. Ethiopian migrants depart Oromia, Amhara, and Tigray through Djibouti or Somaliland, braving treacherous boat crossings across the Gulf of Aden to reach Saudi Arabia.",
    waypoints: [
      [38.74, 9.03],   // Addis Ababa
      [41.86, 9.59],   // Dire Dawa
      [43.29, 11.96],  // Obock, Djibouti
      [45.03, 12.80],  // Aden, Yemen
      [43.76, 16.94],  // Sa'ada, Yemen border
      [46.72, 24.68],  // Riyadh, Saudi Arabia
    ],
  },
  {
    id: "corridor_southern",
    name: "Southern Route (Kenya to South Africa)",
    routeType: "Southern Route",
    status: "Steady Trans-Regional",
    annualEstimatedVolume: "40,000–60,000 journeys",
    riskRating: "High",
    transitHubs: ["Hawassa", "Moyale", "Nairobi", "Dodoma", "Kasumbalesa", "Johannesburg"],
    description:
      "A grueling 4,000-kilometer overland transit corridor through Eastern and Southern Africa. Migrants from southern Ethiopia cross at Moyale, traversing Kenya, Tanzania, Malawi, Zambia, and Zimbabwe to reach commercial opportunities in South Africa.",
    waypoints: [
      [38.74, 9.03],    // Addis Ababa
      [38.48, 7.05],    // Hawassa
      [39.05, 3.53],    // Moyale
      [36.82, -1.29],   // Nairobi, Kenya
      [35.75, -6.18],   // Dodoma, Tanzania
      [28.28, -15.42],  // Lusaka, Zambia
      [28.04, -26.20],  // Johannesburg, South Africa
    ],
  },
  {
    id: "corridor_northern",
    name: "Northern Route (Sudan & Central Mediterranean)",
    routeType: "Northern Route",
    status: "Severely Restricted",
    annualEstimatedVolume: "15,000–25,000 journeys",
    riskRating: "Extreme",
    transitHubs: ["Gondar", "Metema", "Gedaref", "Khartoum", "Kufra (Libya)", "Tripoli"],
    description:
      "Historically the primary pathway toward Europe via Sudan and the Sahara Desert into Libya. Severely disrupted and dangerous since the 2023 Sudan war, with high risks of detention, kidnapping for ransom, and desert abandonment.",
    waypoints: [
      [38.74, 9.03],    // Addis Ababa
      [37.46, 12.60],   // Gondar
      [36.19, 12.96],   // Metema
      [32.53, 15.50],   // Khartoum, Sudan
      [23.29, 24.18],   // Kufra, Libya
      [13.18, 32.88],   // Tripoli, Libya
      [12.56, 41.87],   // Rome, Italy
    ],
  },
];
