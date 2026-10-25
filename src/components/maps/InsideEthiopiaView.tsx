"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import type { Topology } from "topojson-specification";
import type { RegionalCaseloadItem, DriverBreakdownItem } from "@/lib/db/types";
import { formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MapSkeleton } from "@/components/ui/LoadingSkeleton";

const EthiopiaChoroplethMap = dynamic(
  () => import("./EthiopiaChoroplethMap").then((mod) => mod.EthiopiaChoroplethMap),
  {
    ssr: false,
    loading: () => (
      <MapSkeleton
        title="Loading Subnational Choropleth Map..."
        minHeight={440}
      />
    ),
  }
);
import { InteractiveFilterBar, TimelineScrubber } from "@/components/shared";
import { StaleDataIndicator } from "@/components/ui/StaleDataIndicator";
import { PartialDataNotice } from "@/components/ui/PartialDataNotice";
import { EmptyState } from "@/components/charts/EmptyState";
import {
  ObservatoryFilterProvider,
  useObservatoryFilters,
} from "@/lib/state/ObservatoryFilterContext";
import {
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Flame,
  CloudSun,
  Waves,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface InsideEthiopiaViewProps {
  regionalCaseloads: RegionalCaseloadItem[];
  driverBreakdown: DriverBreakdownItem[];
  adm1Topology?: Topology;
}

function InsideEthiopiaViewInner({
  regionalCaseloads,
  driverBreakdown,
  adm1Topology,
}: InsideEthiopiaViewProps) {
  const { filters, setRegion, setDriver, setRound, resetFilters, isDefaultState } = useObservatoryFilters();

  // Filter regional caseloads based on active cross-filter state
  const displayedCaseloads = useMemo(() => {
    return regionalCaseloads.filter((r) => {
      // Driver filter
      if (filters.driver !== "all" && r.primaryDriver !== filters.driver) {
        return false;
      }
      return true;
    });
  }, [regionalCaseloads, filters.driver]);

  // Active region details if a single region is selected
  const activeRegion = useMemo(() => {
    if (filters.region === "all") return null;
    return regionalCaseloads.find((r) => r.pcode === filters.region) || null;
  }, [regionalCaseloads, filters.region]);

  // Aggregated totals based on filter
  const totalIdps = useMemo(() => {
    if (activeRegion) return activeRegion.idps;
    return displayedCaseloads.reduce((sum, r) => sum + r.idps, 0);
  }, [displayedCaseloads, activeRegion]);

  const totalReturnees = useMemo(() => {
    if (activeRegion) return activeRegion.returnees;
    return displayedCaseloads.reduce((sum, r) => sum + r.returnees, 0);
  }, [displayedCaseloads, activeRegion]);

  const getDriverIcon = (driver: string) => {
    switch (driver) {
      case "conflict":
        return Flame;
      case "drought":
        return CloudSun;
      case "floods":
        return Waves;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-ink-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-500 uppercase tracking-widest mb-1.5">
          <MapPin className="h-4 w-4" />
          <span>Internal Mobility Module</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              Inside Ethiopia: Internal Displacement
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Subnational analysis of IDP caseloads, returnee village dynamics, and driver corridors across 12 Ethiopian administrative regional states.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono self-start sm:self-auto">
            <span>IOM DTM Round 37 Verified</span>
          </div>
        </div>
      </div>

      {/* Linked Cross-Filter & Deep Link Bar */}
      <InteractiveFilterBar />

      {/* Timeline Round Scrubber */}
      <TimelineScrubber />

      {/* Historical Assessment Stale-Data Indicator */}
      {filters.round && filters.round !== "R37" && (
        <StaleDataIndicator
          reportingDate={
            filters.round === "R26"
              ? "2021-08-31"
              : filters.round === "R28"
              ? "2022-02-28"
              : filters.round === "R31"
              ? "2022-11-30"
              : "2023-08-31"
          }
          round={filters.round}
          sourceName="IOM DTM Site Assessment"
          mode="banner"
          onResetBaseline={() => setRound("R37")}
        />
      )}

      {/* Partial Data Notice when cross-filtered by primary trigger */}
      {filters.driver !== "all" && (
        <PartialDataNotice
          title={`Displacement Trigger Filter: ${filters.driver.toUpperCase()}`}
          reason={`Displaying only regional states where '${filters.driver}' was documented as the primary crisis trigger by key informants. Regions with mixed or alternative drivers are excluded from the current view.`}
          severity="info"
          citation="IOM DTM Round 37 Site Assessment Methodology"
        />
      )}

      {/* Summary KPI Strip (Dynamic based on linked filters) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          className={`border-t-2 transition-colors ${
            filters.metric === "idps"
              ? "border-t-amber-500 bg-ink-900/90 shadow-md shadow-amber-950/20"
              : "border-t-ink-700 bg-ink-900/60"
          }`}
        >
          <CardHeader className="p-4 pb-1">
            <span className="text-[11px] font-mono uppercase text-slate-400">
              {activeRegion ? `${activeRegion.regionName} IDPs` : "Total Monitored IDPs"}
            </span>
            <CardTitle className="text-2xl font-bold font-mono text-amber-400">
              {formatNumber(totalIdps)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-slate-400">
            {activeRegion
              ? `Specific caseload for ${activeRegion.pcode} (${activeRegion.primaryDriver})`
              : filters.driver !== "all"
              ? `Filtered by primary trigger: ${filters.driver}`
              : "Across 12 monitored regional states (Round 37)"}
          </CardContent>
        </Card>

        <Card
          className={`border-t-2 transition-colors ${
            filters.metric === "returnees"
              ? "border-t-emerald-500 bg-ink-900/90 shadow-md shadow-emerald-950/20"
              : "border-t-ink-700 bg-ink-900/60"
          }`}
        >
          <CardHeader className="p-4 pb-1">
            <span className="text-[11px] font-mono uppercase text-slate-400">
              {activeRegion ? `${activeRegion.regionName} Returnees` : "Tracked Returnees"}
            </span>
            <CardTitle className="text-2xl font-bold font-mono text-emerald-400">
              {formatNumber(totalReturnees)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-slate-400">
            {activeRegion
              ? `Village assessment returnees in ${activeRegion.regionName}`
              : "Village assessments of former IDPs returning home"}
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-terracotta-500 bg-ink-900/80">
          <CardHeader className="p-4 pb-1">
            <span className="text-[11px] font-mono uppercase text-slate-400">Primary Cause</span>
            <CardTitle className="text-2xl font-bold font-mono text-slate-100">
              {activeRegion ? activeRegion.primaryDriver.toUpperCase() : "Conflict (80.1%)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-slate-400">
            {activeRegion
              ? `Assessed trigger in ${activeRegion.regionName}`
              : "Followed by prolonged drought (19.1%) & floods"}
          </CardContent>
        </Card>
      </div>

      {/* Interactive Choropleth Map Component */}
      <EthiopiaChoroplethMap caseloads={regionalCaseloads} initialTopology={adm1Topology || undefined} />

      {/* Driver Breakdown Summary Bar (Clicking a card triggers cross-filtering) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Displacement By Primary Trigger Driver
          </h2>
          {filters.driver !== "all" && (
            <button
              type="button"
              onClick={() => setDriver("all")}
              className="text-xs font-mono text-amber-400 hover:text-amber-300"
            >
              Clear Driver Filter
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {driverBreakdown.map((item) => {
            const Icon = getDriverIcon(item.driver);
            const isSelected = filters.driver === item.driver;

            return (
              <button
                key={item.driver}
                type="button"
                onClick={() => setDriver(isSelected ? "all" : (item.driver as any))}
                className={`p-3 rounded-lg border text-left transition-all duration-200 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                  isSelected
                    ? "bg-ink-900 border-amber-500 shadow-lg shadow-amber-950/30 ring-2 ring-amber-400/80"
                    : "border-ink-800 bg-ink-950/70 hover:border-ink-700 hover:bg-ink-900/50"
                }`}
                aria-pressed={isSelected}
                aria-label={`Filter by trigger: ${item.driver}, ${item.percentage}% (${formatNumber(item.totalIdps)} IDPs)`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono uppercase text-slate-300 font-semibold flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-amber-400" />
                    <span>{item.driver}</span>
                  </span>
                  <span className="font-mono text-amber-400 font-bold">{item.percentage}%</span>
                </div>
                <div className="text-lg font-mono font-bold text-slate-100 mt-1">
                  {formatNumber(item.totalIdps)}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-1">
                  Regions: {item.affectedRegions.join(", ")}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Regional Caseload Grid (Clicking a region triggers cross-filtering and opens drawer) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Subnational Regional Caseloads (All 12 Monitored Regions)
          </h2>
          <span className="text-[11px] font-mono text-slate-500">
            Showing {displayedCaseloads.length} of {regionalCaseloads.length} regions
          </span>
        </div>

        {displayedCaseloads.length === 0 ? (
          <EmptyState
            title="No Regions Match Current Filters"
            description="No regional states have primary displacement figures matching the active filter criteria."
            onReset={resetFilters}
            resetText="Reset Observatory Filters"
            suggestions={[
              "Clear the driver trigger filter to view all 12 monitored regions",
              "Select 'All Regions' in the top filter bar",
              "Return to baseline Round 37 if reviewing historical data",
            ]}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedCaseloads.map((reg) => {
              const isSelected = filters.region === reg.pcode;

              return (
                <Card
                  key={reg.pcode}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={`Select ${reg.regionName} (${reg.pcode}): ${formatNumber(reg.idps)} IDPs, ${formatNumber(reg.returnees)} returnees, primary driver ${reg.primaryDriver}`}
                  onClick={() => setRegion(isSelected ? "all" : reg.pcode)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setRegion(isSelected ? "all" : reg.pcode);
                    }
                  }}
                  className={`cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                    isSelected
                      ? "border-amber-500 bg-ink-900 ring-2 ring-amber-400/80 shadow-lg shadow-amber-950/30"
                      : "hover:border-ink-600 bg-ink-900/80"
                  }`}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base text-slate-100">{reg.regionName}</CardTitle>
                        <span className="text-[10px] font-mono text-slate-500">{reg.pcode}</span>
                      </div>
                      <Badge variant={reg.primaryDriver === "conflict" ? "terracotta" : "ember"}>
                        {reg.primaryDriver}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div
                        className={`rounded p-2.5 border transition-colors ${
                          filters.metric === "idps"
                            ? "bg-amber-950/30 border-amber-600/40"
                            : "bg-ink-950/60 border-ink-800"
                        }`}
                      >
                        <span className="text-[10px] font-mono uppercase text-amber-400/90 block">IDPs</span>
                        <span className="text-base font-bold font-mono text-slate-100">{formatNumber(reg.idps)}</span>
                      </div>
                      <div
                        className={`rounded p-2.5 border transition-colors ${
                          filters.metric === "returnees"
                            ? "bg-emerald-950/30 border-emerald-600/40"
                            : "bg-ink-950/60 border-ink-800"
                        }`}
                      >
                        <span className="text-[10px] font-mono uppercase text-emerald-400/90 block">Returnees</span>
                        <span className="text-base font-bold font-mono text-slate-100">{formatNumber(reg.returnees)}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-ink-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="capitalize inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        Confidence: {reg.confidence}
                      </span>
                      <span className={isSelected ? "text-amber-400 font-bold" : ""}>
                        {isSelected ? "Selected on Map" : `Ref: ${reg.reportingDate}`}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Official Citation Footer Callout */}
      <div className="p-4 rounded-lg border border-ink-800 bg-ink-900/60 flex items-start gap-3 text-xs text-slate-400">
        <ShieldCheck className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-slate-300">Official Primary Source Citation</div>
          <p className="mt-0.5 text-slate-400 font-serif italic">
            International Organization for Migration (IOM) Displacement Tracking Matrix (DTM) Ethiopia Site Assessment and Village Assessment Round 37 (August 2024). Open Data under Creative Commons Attribution 4.0 International (CC BY 4.0).
          </p>
        </div>
      </div>
    </div>
  );
}

export function InsideEthiopiaView(props: InsideEthiopiaViewProps) {
  return (
    <ObservatoryFilterProvider syncWithUrl={true}>
      <InsideEthiopiaViewInner {...props} />
    </ObservatoryFilterProvider>
  );
}
