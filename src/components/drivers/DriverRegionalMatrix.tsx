"use client";

import React, { useState } from "react";
import { CRISIS_DRIVERS_DATA, RegionalDriverBreakdown } from "@/lib/data/crisisDrivers";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Filter, Layers, Flame, CloudSun } from "lucide-react";
import { EmptyState } from "@/components/charts/EmptyState";

export function DriverRegionalMatrix() {
  const { regionalBreakdowns } = CRISIS_DRIVERS_DATA;
  const [filterMode, setFilterMode] = useState<"all" | "conflict" | "drought">("all");
  const [selectedRegion, setSelectedRegion] = useState<RegionalDriverBreakdown | null>(null);

  const filteredRegions = regionalBreakdowns.filter((r) => {
    if (filterMode === "conflict") return r.primaryDriver === "conflict";
    if (filterMode === "drought") return r.primaryDriver === "drought";
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Controls & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-400" />
            <span>Regional Driver Profiles</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Breakdown of primary reported triggers across assessed regional states (IOM DTM Round 37).
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 self-start" role="group" aria-label="Filter regions by dominant driver">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`px-2.5 py-1 text-xs rounded border transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              filterMode === "all"
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40 font-semibold"
                : "border-ink-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            All Regions ({regionalBreakdowns.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("conflict")}
            className={`px-2.5 py-1 text-xs rounded border transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              filterMode === "conflict"
                ? "bg-red-500/20 text-red-400 border-red-500/40 font-semibold"
                : "border-ink-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Flame className="h-3 w-3" />
            <span>Conflict-Dominant</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("drought")}
            className={`px-2.5 py-1 text-xs rounded border transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              filterMode === "drought"
                ? "bg-orange-500/20 text-orange-400 border-orange-500/40 font-semibold"
                : "border-ink-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <CloudSun className="h-3 w-3" />
            <span>Drought-Dominant</span>
          </button>
        </div>
      </div>

      {/* Regional Table / Grid */}
      {filteredRegions.length === 0 ? (
        <EmptyState
          title="No Regions Match Trigger Filter"
          description={`No monitored regional states have '${filterMode}' as their primary reported displacement driver.`}
          resetText="Show All Regions"
          onReset={() => setFilterMode("all")}
          suggestions={[
            "Switch filter to 'All Regions' to see full nationwide coverage",
            "Review regions where this trigger is secondary in the composition bar",
          ]}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-ink-800 bg-ink-950/70">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-ink-900 border-b border-ink-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
            <tr>
              <th scope="col" className="p-3 pl-4">Regional State</th>
              <th scope="col" className="p-3 text-right">Documented IDPs</th>
              <th scope="col" className="p-3">Primary Trigger</th>
              <th scope="col" className="p-3 min-w-[180px]">Driver Composition</th>
              <th scope="col" className="p-3 text-right pr-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800/60">
            {filteredRegions.map((region) => {
              const isSelected = selectedRegion?.regionId === region.regionId;
              const isConflict = region.primaryDriver === "conflict";

              return (
                <tr
                  key={region.regionId}
                  tabIndex={0}
                  role="button"
                  aria-label={`Inspect ${region.regionName}: ${formatNumber(region.totalIdp)} IDPs, Primary trigger ${region.primaryDriver}`}
                  onClick={() => setSelectedRegion(isSelected ? null : region)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedRegion(isSelected ? null : region);
                    }
                  }}
                  className={`cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                    isSelected ? "bg-ink-800/80" : "hover:bg-ink-900/50"
                  }`}
                >
                  <td className="p-3 pl-4 font-semibold text-slate-100">
                    <div>{region.regionName}</div>
                    <div className="text-[10px] font-mono text-slate-500">{region.regionId}</div>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-200">
                    {formatNumber(region.totalIdp)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${
                        isConflict
                          ? "bg-red-500/15 text-red-400 border-red-500/30"
                          : "bg-orange-500/15 text-orange-400 border-orange-500/30"
                      }`}
                    >
                      {isConflict ? <Flame className="h-3 w-3" /> : <CloudSun className="h-3 w-3" />}
                      <span className="capitalize">{region.primaryDriver}</span>
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      {/* Stacked mini bar */}
                      <div className="h-2 w-full rounded overflow-hidden flex bg-ink-900 border border-ink-800">
                        <div
                          style={{ width: `${region.conflictShare}%` }}
                          className="bg-red-500"
                          title={`Conflict: ${region.conflictShare}%`}
                        />
                        <div
                          style={{ width: `${region.droughtShare}%` }}
                          className="bg-orange-500"
                          title={`Drought: ${region.droughtShare}%`}
                        />
                        <div
                          style={{ width: `${region.floodShare}%` }}
                          className="bg-blue-500"
                          title={`Floods: ${region.floodShare}%`}
                        />
                        <div
                          style={{ width: `${region.otherShare}%` }}
                          className="bg-purple-500"
                          title={`Other: ${region.otherShare}%`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="text-red-400">{region.conflictShare}% Confl.</span>
                        <span className="text-orange-400">{region.droughtShare}% Drt.</span>
                        <span className="text-blue-400">{region.floodShare}% Fld.</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right pr-4 font-mono text-[11px] text-amber-400">
                    {isSelected ? "Hide" : "Inspect"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      {/* Selected Region Drawer / Details */}
      {selectedRegion && (
        <div className="rounded-lg border border-amber-500/40 bg-ink-900/90 p-4 space-y-3 transition-all animate-fadeIn">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-100">
                  {selectedRegion.regionName} ({selectedRegion.regionId})
                </h4>
                <Badge variant={selectedRegion.primaryDriver === "conflict" ? "terracotta" : "ember"} size="sm">
                  {selectedRegion.primaryDriver.toUpperCase()} DOMINANT
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Citation: {selectedRegion.citation} • Assessed: {selectedRegion.reportingDate}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedRegion(null)}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-ink-950 rounded border border-ink-800 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
            <div className="bg-ink-950 p-2.5 rounded border border-ink-800">
              <span className="text-slate-400 block text-[10px] uppercase">Conflict Trigger</span>
              <strong className="text-red-400 text-sm">
                {formatNumber(selectedRegion.conflictCount)}
              </strong>
              <span className="text-slate-500 text-[10px] block">
                {selectedRegion.conflictShare}% of regional total
              </span>
            </div>
            <div className="bg-ink-950 p-2.5 rounded border border-ink-800">
              <span className="text-slate-400 block text-[10px] uppercase">Drought Trigger</span>
              <strong className="text-orange-400 text-sm">
                {formatNumber(selectedRegion.droughtCount)}
              </strong>
              <span className="text-slate-500 text-[10px] block">
                {selectedRegion.droughtShare}% of regional total
              </span>
            </div>
            <div className="bg-ink-950 p-2.5 rounded border border-ink-800">
              <span className="text-slate-400 block text-[10px] uppercase">Floods Trigger</span>
              <strong className="text-blue-400 text-sm">
                {formatNumber(selectedRegion.floodCount)}
              </strong>
              <span className="text-slate-500 text-[10px] block">
                {selectedRegion.floodShare}% of regional total
              </span>
            </div>
            <div className="bg-ink-950 p-2.5 rounded border border-ink-800">
              <span className="text-slate-400 block text-[10px] uppercase">Other Triggers</span>
              <strong className="text-purple-400 text-sm">
                {formatNumber(selectedRegion.otherCount)}
              </strong>
              <span className="text-slate-500 text-[10px] block">
                {selectedRegion.otherShare}% of regional total
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
