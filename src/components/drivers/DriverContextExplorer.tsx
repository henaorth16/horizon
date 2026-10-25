"use client";

import React, { useState } from "react";
import { CRISIS_DRIVERS_DATA, DriverCaseload } from "@/lib/data/crisisDrivers";
import { DriverBreakdownChart } from "./DriverBreakdownChart";
import { DriverTimelineChart } from "./DriverTimelineChart";
import { DriverRegionalMatrix } from "./DriverRegionalMatrix";
import { formatNumber } from "@/lib/utils";
import {
  AlertCircle,
  Flame,
  CloudSun,
  Waves,
  Sparkles,
  ShieldAlert,
  BarChart3,
  Layers,
  Clock,
  ExternalLink,
} from "lucide-react";

export function DriverContextExplorer() {
  const [activeTab, setActiveTab] = useState<"overview" | "regional" | "timeline">("overview");
  const [selectedDriver, setSelectedDriver] = useState<DriverCaseload | null>(
    CRISIS_DRIVERS_DATA.caseloads[0]
  );

  const { caseloads, totalCaseload, causationSafeguard, reportingRound, reportingDate, source } =
    CRISIS_DRIVERS_DATA;

  return (
    <div className="space-y-6">
      {/* Causation Safeguard Callout */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200/90 leading-relaxed">
        <ShieldAlert className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300 font-semibold">Methodological Causation Safeguard: </strong>
          {causationSafeguard}
        </div>
      </div>

      {/* Driver KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {caseloads.map((d) => {
          const isSelected = selectedDriver?.category === d.category;
          return (
            <button
              key={d.category}
              type="button"
              onClick={() => setSelectedDriver(d)}
              className={`rounded-lg border p-4 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                isSelected
                  ? "bg-ink-900 border-amber-500/80 shadow-md shadow-amber-950/30"
                  : "bg-ink-900/60 border-ink-800 hover:border-ink-700 hover:bg-ink-900/90"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-300 truncate">{d.label.split(" ")[0]}</span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
              </div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-slate-100">
                {d.percentage}%
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-1">
                {formatNumber(d.count)} IDPs
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation Segmented Switcher */}
      <div className="flex items-center justify-between border-b border-ink-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              activeTab === "overview"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-ink-900"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Driver Breakdown</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("regional")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              activeTab === "regional"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-ink-900"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Regional Matrix</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("timeline")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              activeTab === "timeline"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-ink-900"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Temporal Evolution</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
          Source: {source} ({reportingDate})
        </div>
      </div>

      {/* Active Tab View */}
      <div className="rounded-xl border border-ink-800 bg-ink-900/40 p-4 sm:p-6">
        {activeTab === "overview" && (
          <DriverBreakdownChart
            selectedCategory={selectedDriver?.category}
            onSelectDriver={(d) => setSelectedDriver(d)}
          />
        )}
        {activeTab === "regional" && <DriverRegionalMatrix />}
        {activeTab === "timeline" && <DriverTimelineChart />}
      </div>

      {/* Selected Driver Deep Context Panel */}
      {selectedDriver && (
        <div className="rounded-lg border border-ink-800 bg-ink-950 p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink-800 pb-3">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: selectedDriver.color }}
              />
              <h4 className="text-sm font-bold text-slate-100">
                Context Analysis: {selectedDriver.label}
              </h4>
              <span className="text-xs font-mono text-amber-400 font-semibold">
                ({selectedDriver.percentage}% of total IDP caseload)
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              National Volume: {formatNumber(selectedDriver.count)} individuals
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {selectedDriver.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="bg-ink-900/80 rounded border border-ink-800 p-3 space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Contributing Structural Factors
              </span>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {selectedDriver.keyFactors.map((kf, i) => (
                  <li key={i} className="leading-snug">
                    {kf}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-ink-900/80 rounded border border-ink-800 p-3 space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Primary Geographical Hotspots
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedDriver.primaryLocations.map((loc) => (
                  <span
                    key={loc}
                    className="px-2 py-0.5 rounded text-xs font-mono bg-ink-950 border border-ink-700 text-slate-200"
                  >
                    {loc}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 pt-2 leading-relaxed">
                Source: {source} ({reportingRound}). Reported during verified woreda and site assessments.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
