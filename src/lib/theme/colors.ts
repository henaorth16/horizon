/**
 * Observatory Cozy Earth-Tone Design System & Color Tokens
 * 
 * Five Core Colors:
 * - Olive Green: #606c38
 * - Dark Moss / Deep Forest: #283618
 * - Cornsilk / Cozy Light Background: #fefae0
 * - Earth Yellow / Warm Sand: #dda15e
 * - Tiger's Eye / Cinnamon Rust: #bc6c25
 */

export const COZY_PALETTE = {
  // 5 Core Anchor Colors
  cream: "#fefae0",     // Cornsilk (Cozy Light Background)
  forest: "#283618",    // Dark Moss (Cozy Dark Mode Base / Light Mode Primary Text)
  olive: "#606c38",     // Earthy Olive Green
  sand: "#dda15e",      // Earth Yellow / Warm Ochre
  rust: "#bc6c25",      // Tiger's Eye / Cinnamon Amber Rust

  // Extended Harmonious Component Variants
  creamLight: "#fffef7",
  creamDark: "#f4edd0",
  forestDark: "#18220f",
  forestLight: "#374a21",
  oliveLight: "#788949",
  oliveDark: "#4b552b",
  sandLight: "#e8b67b",
  sandDark: "#c58641",
  rustLight: "#cf7c33",
  rustDark: "#985116",

  // Specialized Indicator Variants
  terracotta: "#cb5a36", // Conflict / High urgency
  river: "#426b66",      // River teal / Cross-border refugees
  plum: "#795267",       // Dusty Heather plum / Asylum seekers
  sage: "#5c7b46",       // Returnees / Resilience
  clay: "#a86940",       // International migrants / Diaspora
  gold: "#e5a93c",       // Nutrition / Food security
} as const;

export const OBSERVATORY_COLORS = {
  // Theme Anchors
  palette: COZY_PALETTE,

  // Base Surfaces (Default Light Mode / Dark Mode)
  surfaces: {
    base: "#fefae0",       // Light default cornsilk
    card: "#ffffff",       // Clean light card
    elevated: "#fcf8e3",   // Elevated subtle panel
    border: "#e3dbbc",     // Warm sand divider
    borderFocus: "#bc6c25",// Focus ring

    darkBase: "#18220f",   // Deep forest dark mode
    darkCard: "#212c15",
    darkElevated: "#283618",
    darkBorder: "#435627",
  },

  // Typography
  text: {
    primary: "#283618",    // Deep Moss Green: Headlines & metrics in light mode
    secondary: "#4c5b33",  // Warm Olive: Labels, body text
    muted: "#68754e",      // Soft Muted: Secondary notes
    faint: "#8b976f",      // Footnotes & metadata
    inverse: "#fefae0",    // Cornsilk text on dark surfaces
  },

  // Editorial Accents
  accents: {
    ochre: "#dda15e",      // Warm Amber / Sand
    ochreLight: "#e8b67b",
    terracotta: "#bc6c25", // Tiger's Eye / Primary Action
    ember: "#cf7b32",      // Warm Cinnamon
    cyan: "#426b66",       // River Teal / Cross-border
    indigo: "#795267",     // Dusty Plum
    sage: "#606c38",       // Olive Green
  },

  // Population Category Colors (Consistent across charts and legends)
  population: {
    idp: "#dda15e",              // IDPs (Earth Sand / Ochre)
    refugee: "#426b66",          // Refugees (River Teal)
    asylumSeeker: "#795267",     // Asylum Seekers (Dusty Plum)
    returnee: "#606c38",         // Returnees (Olive Green)
    internationalMigrant: "#a86940", // Migrants (Warm Clay)
    hostCommunity: "#68754e",    // Host Community (Olive Slate)
  },

  // Displacement Drivers Colors
  drivers: {
    conflict: "#bc6c25",         // Tiger's Eye / Rust Terracotta
    drought: "#dda15e",          // Earth Sand / Amber
    floods: "#426b66",           // River Teal
    other: "#795267",            // Dusty Plum
    unknown: "#8b976f",          // Muted Sage
  },

  // Severity Scale (Choropleth & Matrix)
  severity: [
    "#f4edd0", // Level 0 / Minimal
    "#edd0a7", // Level 1 / Low (Soft Sand)
    "#dda15e", // Level 2 / Moderate (Earth Yellow)
    "#cf7b32", // Level 3 / High (Warm Amber)
    "#bc6c25", // Level 4 / Very High (Tiger's Eye Rust)
    "#8a3f12", // Level 5 / Catastrophic (Deep Terracotta)
  ],

  // Data Freshness & Pipeline Status
  status: {
    fresh: "#606c38",   // Olive Green: Updated within expected schedule
    stale: "#dda15e",   // Earth Yellow: Due for update
    outdated: "#cf7b32",// Cinnamon: Upstream overdue
    error: "#bc6c25",   // Rust: Ingestion pipeline failure
    unknown: "#8b976f", // Muted Sage: Status unverified
  },
} as const;

export type PopulationCategory = keyof typeof OBSERVATORY_COLORS.population;
export type DriverCategory = keyof typeof OBSERVATORY_COLORS.drivers;
export type FreshnessStatus = keyof typeof OBSERVATORY_COLORS.status;
