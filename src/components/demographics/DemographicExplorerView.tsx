"use client";

import React, { useState, useMemo, useEffect } from "react";
import type {
  DemographicProfile,
  VulnerabilityMetricItem,
  RegionalDemographicComparisonItem,
} from "@/lib/db/types";
import type { PopulationType } from "@/lib/contracts";
import { useObservatoryFilters } from "@/lib/state/ObservatoryFilterContext";
import { PopulationPyramid } from "./PopulationPyramid";
import { CompositionBarChart } from "./CompositionBarChart";
import { RegionalComparisonChart } from "./RegionalComparisonChart";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StaleDataIndicator } from "@/components/ui/StaleDataIndicator";
import { PartialDataNotice } from "@/components/ui/PartialDataNotice";
import { PCODE_TO_REGION_NAME } from "@/lib/db/types";
import {
  Users,
  Filter,
  Layers,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  Info,
  ShieldCheck,
  Download,
} from "lucide-react";
import { exportDemographicProfileToCsv } from "@/lib/export/safeExport";

export interface DemographicExplorerViewProps {
  initialIdpProfile: DemographicProfile;
  initialRefugeeProfile: DemographicProfile;
  vulnerabilityMetrics: VulnerabilityMetricItem[];
  regionalComparisons: RegionalDemographicComparisonItem[];
  allProfiles: Record<string, DemographicProfile>; // key: `${popType}_${locId}`
}

export function DemographicExplorerView({
  initialIdpProfile,
  initialRefugeeProfile,
  vulnerabilityMetrics,
  regionalComparisons,
  allProfiles,
}: DemographicExplorerViewProps) {
  // Filter States (synchronized with unified observatory filters)
  const { filters, setRegion: setGlobalRegion, setPopulation: setGlobalPopulation } =
    useObservatoryFilters();

  const [populationType, setPopulationType] = useState<PopulationType>(
    filters.population === "refugee" ? "refugee" : "idp"
  );
  const [selectedLocation, setSelectedLocation] = useState<string>(
    filters.region && filters.region !== "all" ? filters.region : "ET"
  );
  const [selectedRound, setSelectedRound] = useState<string>("r37");
  const [selectedDriver, setSelectedDriver] = useState<string>("all");

  useEffect(() => {
    if (filters.population === "refugee" || filters.population === "idp") {
      setPopulationType(filters.population);
    }
  }, [filters.population]);

  useEffect(() => {
    if (filters.region && filters.region !== "all") {
      setSelectedLocation(filters.region);
    }
  }, [filters.region]);

  // Prevent cross-source merging: resolve active profile strictly by population type & location
  const activeProfile = useMemo<DemographicProfile>(() => {
    if (populationType === "refugee") {
      return initialRefugeeProfile;
    }

    const key = `idp_${selectedLocation}`;
    if (allProfiles[key]) {
      return allProfiles[key];
    }

    // Return unassessed placeholder profile if region lacks demographic records
    const locName = PCODE_TO_REGION_NAME[selectedLocation] || selectedLocation;
    return {
      populationType: "idp",
      locationId: selectedLocation,
      locationName: locName,
      cohorts: [],
      totalSample: 0,
      maleTotal: 0,
      femaleTotal: 0,
      maleRatio: 0,
      femaleRatio: 0,
      hasDemographicBreakdown: false,
      missingReason: `Granular age-sex disaggregation was not assessed in ${locName} during IOM DTM Round 37. Multi-informant site assessments only collected aggregate village caseloads.`,
      reportingDate: "2024-08-31",
      citation: "IOM Displacement Tracking Matrix Site Assessment Round 37",
      license: "CC BY 4.0",
    };
  }, [populationType, selectedLocation, allProfiles, initialRefugeeProfile]);

  // Reset filters to default
  const handleResetFilters = () => {
    setPopulationType("idp");
    setSelectedLocation("ET");
    setSelectedRound("r37");
    setSelectedDriver("all");
    setGlobalPopulation("idp");
    setGlobalRegion("ET");
  };

  return (
    <div className="space-y-6">
      {/* Filter Toolbar Card */}
      <div className="rounded-lg border border-ink-700 bg-ink-900/90 p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5" />
            <span>Interactive Demographic Filters</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportDemographicProfileToCsv(activeProfile)}
              className="gap-1.5 font-mono text-xs whitespace-nowrap focus-visible:ring-2 focus-visible:ring-emerald-400"
              title="Export demographic profile with statistical disclosure control (suppressing values < 5)"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>Export Demographics</span>
            </Button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono text-slate-400 hover:text-slate-100 hover:bg-ink-800 transition-colors border border-ink-800 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          {/* 1. Population Type */}
          <div className="space-y-1.5">
            <label className="text-slate-400 block font-semibold uppercase text-[10px] tracking-wider">
              Population Mandate
            </label>
            <div className="flex rounded-md bg-ink-950 p-1 border border-ink-800" role="group" aria-label="Population mandate selection">
              <button
                type="button"
                onClick={() => {
                  setPopulationType("idp");
                  setGlobalPopulation("idp");
                }}
                className={`flex-1 py-1 px-2 rounded text-center transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                  populationType === "idp"
                    ? "bg-amber-500/20 text-amber-400 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                IDPs (IOM)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPopulationType("refugee");
                  setGlobalPopulation("refugee");
                  setSelectedLocation("ET"); // Refugees reported nationally in this profile
                  setGlobalRegion("ET");
                }}
                className={`flex-1 py-1 px-2 rounded text-center transition-colors focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none ${
                  populationType === "refugee"
                    ? "bg-sky-500/20 text-sky-400 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Refugees (UNHCR)
              </button>
            </div>
          </div>

          {/* 2. Region / Jurisdiction */}
          <div className="space-y-1.5">
            <label
              htmlFor="region-select"
              className="text-slate-400 block font-semibold uppercase text-[10px] tracking-wider"
            >
              Administrative Jurisdiction
            </label>
            <select
              id="region-select"
              value={selectedLocation}
              disabled={populationType === "refugee"}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                setGlobalRegion(e.target.value);
              }}
              className="w-full rounded-md border border-ink-800 bg-ink-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50"
            >
              <option value="ET">Ethiopia (National Overview)</option>
              {Object.entries(PCODE_TO_REGION_NAME)
                .filter(([p]) => p !== "ET")
                .map(([pcode, name]) => (
                  <option key={pcode} value={pcode}>
                    {name} ({pcode})
                  </option>
                ))}
            </select>
          </div>

          {/* 3. Reporting Round / Cycle */}
          <div className="space-y-1.5">
            <label
              htmlFor="round-select"
              className="text-slate-400 block font-semibold uppercase text-[10px] tracking-wider"
            >
              Assessment Round / Period
            </label>
            <select
              id="round-select"
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              className="w-full rounded-md border border-ink-800 bg-ink-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <option value="r37">IOM DTM Round 37 (August 2024)</option>
              <option value="r36">IOM DTM Round 36 (April 2024)</option>
              <option value="y2023">UNHCR Global Data Finder (Year-End 2023)</option>
            </select>
          </div>

          {/* 4. Displacement Reason / Trigger */}
          <div className="space-y-1.5">
            <label
              htmlFor="driver-select"
              className="text-slate-400 block font-semibold uppercase text-[10px] tracking-wider"
            >
              Displacement Reason
            </label>
            <select
              id="driver-select"
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full rounded-md border border-ink-800 bg-ink-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <option value="all">All Displacement Triggers</option>
              <option value="conflict">Conflict & Insecurity</option>
              <option value="drought">Prolonged Drought</option>
              <option value="floods">Flash & Seasonal Floods</option>
            </select>
          </div>
        </div>

        {/* Anti-Cross-Source Merging Notice */}
        <div className="flex items-start gap-2.5 rounded bg-ink-950/80 p-2.5 text-xs text-slate-400 border border-ink-800">
          <Info className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-slate-200">Legal Mandate Partition: </span>
            {populationType === "idp"
              ? "Displaying internal displacement statistics collected under IOM DTM mandate. IDP statistics are never summed with cross-border refugee stock."
              : "Displaying prima facie hosted refugee statistics under UNHCR mandate and the 1951 Geneva Refugee Convention."}
          </div>
        </div>
      </div>

      {/* Historical Assessment Stale-Data Warning */}
      {selectedRound !== "r37" && (
        <StaleDataIndicator
          reportingDate={selectedRound === "r36" ? "2024-04-30" : "2023-12-31"}
          round={selectedRound.toUpperCase()}
          sourceName={populationType === "refugee" ? "UNHCR Refugee Data Finder" : "IOM DTM"}
          mode="banner"
          onResetBaseline={() => setSelectedRound("r37")}
        />
      )}

      {/* Driver Sub-Sample Partial Data Warning */}
      {selectedDriver !== "all" && (
        <PartialDataNotice
          title="Displacement Trigger Sub-Sample Notice"
          locationName={activeProfile.locationName}
          reason={`Age-sex household enumeration for ${activeProfile.locationName} reflects the total surveyed caseload. Stratifying disaggregated age-sex cohorts by primary trigger '${selectedDriver}' requires cluster-level microdata.`}
          severity="info"
          citation="IOM DTM Site Assessment Methodology Standard"
        />
      )}

      {/* Population Pyramid Main Visualization */}
      <PopulationPyramid profile={activeProfile} />

      {/* Grid: Composition Chart & Subnational Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Population Composition & Vulnerability Bar Chart */}
        <div className="lg:col-span-6">
          <CompositionBarChart metrics={vulnerabilityMetrics} profile={activeProfile} />
        </div>

        {/* Right: Regional Comparison Chart */}
        <div className="lg:col-span-6">
          <RegionalComparisonChart
            comparisons={regionalComparisons}
            selectedRegion={selectedLocation}
            onSelectRegion={(pcode) => {
              if (populationType === "refugee") {
                setPopulationType("idp");
              }
              setSelectedLocation(pcode);
            }}
          />
        </div>
      </div>
    </div>
  );
}
