"use client";

import React, { useState } from "react";
import {
  REGIONAL_NEEDS_PROFILES,
  SECTOR_DEFINITIONS,
  RegionNeedsProfile,
  HumanitarianSector,
  SeverityLevel,
} from "@/lib/data/humanitarianNeeds";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/charts/EmptyState";
import { NeedsVisualizationGraph } from "./NeedsVisualizationGraph";
import {
  Grid,
  Tent,
  Droplets,
  Utensils,
  ShieldCheck,
  HeartPulse,
  AlertTriangle,
  Info,
  BarChart3,
  Table as TableIcon,
  LayoutGrid,
} from "lucide-react";

export function ZonalNeedsMatrix() {
  const [viewMode, setViewMode] = useState<"table" | "graph" | "combined">("table");
  const [selectedProfile, setSelectedProfile] = useState<RegionNeedsProfile | null>(
    REGIONAL_NEEDS_PROFILES.length > 0 ? REGIONAL_NEEDS_PROFILES[0] : null
  );

  if (REGIONAL_NEEDS_PROFILES.length === 0) {
    return (
      <EmptyState
        title="No Zonal Needs Profiles Available"
        description="Regional humanitarian cluster needs assessment profiles could not be loaded."
        suggestions={["Check that humanitarianNeeds dataset is initialized", "Reload the page to retry"]}
      />
    );
  }

  const getSeverityStyle = (severity: SeverityLevel) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-300 border-red-500/40 font-bold";
      case "severe":
        return "bg-orange-500/20 text-orange-300 border-orange-500/40 font-semibold";
      case "moderate":
        return "bg-yellow-500/15 text-yellow-300 border-yellow-500/30";
      case "low":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
      case "unassessed":
      default:
        return "bg-ink-800/50 text-slate-500 border-ink-700 italic";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and View Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Grid className="h-4 w-4 text-amber-400" />
            <span>Multi-Sector Humanitarian Needs Matrix</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Independent sectoral deficit percentages across verified displacement sites (OCHA HNO & IOM DTM).
          </p>
        </div>

        {/* View Mode Switcher & Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          {/* View Mode Toggle */}
          <div
            className="flex items-center gap-1 bg-ink-950 p-1 rounded-md border border-ink-800 text-xs font-mono self-start sm:self-auto"
            role="group"
            aria-label="Needs display mode selection"
          >
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                viewMode === "table"
                  ? "bg-ink-800 text-amber-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              aria-pressed={viewMode === "table"}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Table View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("graph")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                viewMode === "graph"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              aria-pressed={viewMode === "graph"}
            >
              <BarChart3 className="h-3.5 w-3.5 text-amber-400" />
              <span>Visualization Graph</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("combined")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                viewMode === "combined"
                  ? "bg-ink-800 text-amber-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              aria-pressed={viewMode === "combined"}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Combined</span>
            </button>
          </div>

          {/* Severity Legend */}
          <div className="flex items-center gap-2 text-[11px] font-mono flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />
              <span className="text-slate-300">Critical (&gt;60%)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-500 inline-block" />
              <span className="text-slate-300">Severe (40–60%)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-yellow-500 inline-block" />
              <span className="text-slate-300">Moderate (20–40%)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-600 inline-block" />
              <span className="text-slate-400">Unassessed</span>
            </span>
          </div>
        </div>
      </div>

      {/* Visualization Graph Component (rendered in graph or combined mode) */}
      {(viewMode === "graph" || viewMode === "combined") && (
        <NeedsVisualizationGraph
          selectedRegionId={selectedProfile?.regionId}
          onSelectRegion={(profile) => setSelectedProfile(profile)}
        />
      )}

      {/* Interactive Matrix Table (rendered in table or combined mode) */}
      {(viewMode === "table" || viewMode === "combined") && (
        <div className="overflow-x-auto rounded-lg border border-ink-800 bg-ink-950/70">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-ink-900 border-b border-ink-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
              <tr>
                <th scope="col" className="p-3 pl-4 min-w-[140px]">Regional State</th>
                <th scope="col" className="p-3 text-center min-w-[100px]">
                  <div className="flex items-center justify-center gap-1">
                    <Tent className="h-3 w-3 text-amber-400" />
                    <span>Shelter Deficit</span>
                  </div>
                </th>
                <th scope="col" className="p-3 text-center min-w-[100px]">
                  <div className="flex items-center justify-center gap-1">
                    <Droplets className="h-3 w-3 text-blue-400" />
                    <span>WASH Deficit</span>
                  </div>
                </th>
                <th scope="col" className="p-3 text-center min-w-[110px]">
                  <div className="flex items-center justify-center gap-1">
                    <Utensils className="h-3 w-3 text-green-400" />
                    <span>Food IPC 3+</span>
                  </div>
                </th>
                <th scope="col" className="p-3 text-center min-w-[100px]">
                  <div className="flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-purple-400" />
                    <span>Protection Gap</span>
                  </div>
                </th>
                <th scope="col" className="p-3 text-center min-w-[100px]">
                  <div className="flex items-center justify-center gap-1">
                    <HeartPulse className="h-3 w-3 text-rose-400" />
                    <span>Health Gap</span>
                  </div>
                </th>
                <th scope="col" className="p-3 text-center min-w-[110px] pr-4">IPC Phase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800/60">
              {REGIONAL_NEEDS_PROFILES.map((profile) => {
                const isSelected = selectedProfile?.regionId === profile.regionId;

                return (
                  <tr
                    key={profile.regionId}
                    tabIndex={0}
                    role="button"
                    aria-label={`Inspect ${profile.regionName} needs profile: ${formatNumber(profile.totalIdpCaseload)} IDPs`}
                    onClick={() => setSelectedProfile(profile)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedProfile(profile);
                      }
                    }}
                    className={`cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                      isSelected ? "bg-ink-800/80 ring-1 ring-amber-500/50" : "hover:bg-ink-900/50"
                    }`}
                  >
                    <td className="p-3 pl-4 font-semibold text-slate-100">
                      <div>{profile.regionName}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {formatNumber(profile.totalIdpCaseload)} IDPs ({profile.assessedSitesCount} sites)
                      </div>
                    </td>

                    {/* Shelter */}
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-[11px] font-mono border ${getSeverityStyle(
                          profile.scores.shelter.severity
                        )}`}
                      >
                        {profile.scores.shelter.value !== null
                          ? `${profile.scores.shelter.value}%`
                          : "Unassessed"}
                      </span>
                    </td>

                    {/* WASH */}
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-[11px] font-mono border ${getSeverityStyle(
                          profile.scores.wash.severity
                        )}`}
                      >
                        {profile.scores.wash.value !== null
                          ? `${profile.scores.wash.value}%`
                          : "Unassessed"}
                      </span>
                    </td>

                    {/* Food Security */}
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-[11px] font-mono border ${getSeverityStyle(
                          profile.scores.food_security.severity
                        )}`}
                      >
                        {profile.scores.food_security.value !== null
                          ? `${profile.scores.food_security.value}%`
                          : "Unassessed"}
                      </span>
                    </td>

                    {/* Protection */}
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-[11px] font-mono border ${getSeverityStyle(
                          profile.scores.protection.severity
                        )}`}
                      >
                        {profile.scores.protection.value !== null
                          ? `${profile.scores.protection.value}%`
                          : "Unassessed"}
                      </span>
                    </td>

                    {/* Health */}
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-[11px] font-mono border ${getSeverityStyle(
                          profile.scores.health.severity
                        )}`}
                      >
                        {profile.scores.health.value !== null
                          ? `${profile.scores.health.value}%`
                          : "Unassessed"}
                      </span>
                    </td>

                    {/* IPC Phase Badge */}
                    <td className="p-3 text-center pr-4">
                      <Badge
                        variant={
                          profile.foodInsecurityPhase.includes("Emergency")
                            ? "terracotta"
                            : profile.foodInsecurityPhase.includes("Crisis")
                            ? "ember"
                            : "muted"
                        }
                        size="sm"
                      >
                        {profile.foodInsecurityPhase.split(":")[0]}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected Region Detailed Vulnerability Assessment */}
      {selectedProfile && (
        <div className="rounded-lg border border-amber-500/40 bg-ink-900/90 p-4 sm:p-5 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-100">
                  {selectedProfile.regionName} Humanitarian Needs Profile
                </h4>
                <Badge variant="ochre" size="sm">
                  {selectedProfile.assessedSitesCount} ASSESSED SITES
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Citation: {selectedProfile.sourceCitation} • Assessment Cycle: {selectedProfile.lastAssessed}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="text-xs font-mono text-slate-300 bg-ink-950 px-3 py-1.5 rounded border border-ink-800">
                IDP Caseload: <strong className="text-amber-400">{formatNumber(selectedProfile.totalIdpCaseload)}</strong>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                aria-label="Close region details"
                className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1.5 bg-ink-950 rounded border border-ink-800 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
              >
                Close
              </button>
            </div>
          </div>

          {/* Sector-by-sector notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-ink-950 p-3 rounded border border-ink-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Tent className="h-3.5 w-3.5 text-amber-400" />
                  <span>Emergency Shelter & NFI</span>
                </span>
                <span className="font-mono text-red-400 font-bold">{selectedProfile.scores.shelter.value}%</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {selectedProfile.scores.shelter.notes}
              </p>
            </div>

            <div className="bg-ink-950 p-3 rounded border border-ink-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Droplets className="h-3.5 w-3.5 text-blue-400" />
                  <span>Water, Sanitation & Hygiene</span>
                </span>
                <span className="font-mono text-red-400 font-bold">{selectedProfile.scores.wash.value}%</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {selectedProfile.scores.wash.notes}
              </p>
            </div>

            <div className="bg-ink-950 p-3 rounded border border-ink-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Utensils className="h-3.5 w-3.5 text-green-400" />
                  <span>Food Security & Nutrition</span>
                </span>
                <span className="font-mono text-red-400 font-bold">{selectedProfile.scores.food_security.value}%</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {selectedProfile.scores.food_security.notes}
              </p>
            </div>

            <div className="bg-ink-950 p-3 rounded border border-ink-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                  <span>Child & Gender Protection</span>
                </span>
                <span className="font-mono text-red-400 font-bold">{selectedProfile.scores.protection.value}%</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {selectedProfile.scores.protection.notes}
              </p>
            </div>
          </div>

          {/* Priority Cluster Concerns */}
          <div className="bg-ink-950/60 p-3 rounded border border-ink-800 space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Priority Cluster Action Demands:
            </span>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              {selectedProfile.priorityConcerns.map((concern, idx) => (
                <li key={idx} className="leading-snug">
                  {concern}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
