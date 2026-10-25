"use client";

import React, { useState } from "react";
import { CRISIS_DRIVERS_DATA, DriverCaseload } from "@/lib/data/crisisDrivers";
import { formatNumber } from "@/lib/utils";
import { Flame, CloudSun, Waves, Sparkles, MapPin, CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/charts/EmptyState";

interface DriverBreakdownChartProps {
  onSelectDriver?: (driver: DriverCaseload) => void;
  selectedCategory?: string | null;
}

export function DriverBreakdownChart({
  onSelectDriver,
  selectedCategory,
}: DriverBreakdownChartProps) {
  const [metricMode, setMetricMode] = useState<"percentage" | "count">("percentage");
  const { caseloads, totalCaseload, reportingRound, reportingDate } = CRISIS_DRIVERS_DATA;

  if (!caseloads || caseloads.length === 0) {
    return (
      <EmptyState
        title="No Displacement Trigger Data"
        description="Crisis trigger breakdowns are unavailable for the selected assessment cycle."
        suggestions={[
          "Ensure crisis driver dataset is loaded",
          "Reload the page to re-initialize data",
        ]}
      />
    );
  }

  const getDriverIcon = (cat: string) => {
    switch (cat) {
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
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>Primary Displacement Triggers</span>
            <span className="text-xs font-mono text-slate-400">
              ({reportingRound} — {reportingDate})
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Key-informant assessed primary trigger across {formatNumber(totalCaseload)} documented IDPs.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-ink-950 p-1 rounded-md border border-ink-800 text-xs self-start">
          <button
            type="button"
            onClick={() => setMetricMode("percentage")}
            className={`px-2.5 py-1 rounded transition-colors ${
              metricMode === "percentage"
                ? "bg-ink-800 text-amber-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
            aria-pressed={metricMode === "percentage"}
          >
            Percentage Share (%)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode("count")}
            className={`px-2.5 py-1 rounded transition-colors ${
              metricMode === "count"
                ? "bg-ink-800 text-amber-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
            aria-pressed={metricMode === "count"}
          >
            Caseload Count
          </button>
        </div>
      </div>

      {/* Stacked Proportional Bar Strip */}
      <div className="space-y-1.5">
        <div
          className="h-7 w-full rounded-md overflow-hidden flex bg-ink-950 border border-ink-800"
          role="img"
          aria-label="Stacked distribution of displacement drivers"
        >
          {caseloads.map((driver) => {
            const isSelected = selectedCategory === driver.category;
            return (
              <button
                key={driver.category}
                type="button"
                onClick={() => onSelectDriver?.(driver)}
                title={`${driver.label}: ${driver.percentage}% (${formatNumber(driver.count)} IDPs)`}
                style={{
                  width: `${driver.percentage}%`,
                  backgroundColor: driver.color,
                }}
                className={`h-full transition-all duration-200 relative group focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                  isSelected ? "brightness-125 ring-2 ring-white" : "hover:brightness-110"
                }`}
                aria-label={`${driver.label}: ${driver.percentage}%`}
              >
                <span className="sr-only">
                  {driver.label}: {driver.percentage}% ({formatNumber(driver.count)} IDPs)
                </span>
              </button>
            );
          })}
        </div>

        {/* Bar Legend / Percentages */}
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 px-0.5">
          {caseloads.map((d) => (
            <span key={d.category} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: d.color }} />
              <span className="text-slate-300">{d.label.split(" ")[0]}</span>:{" "}
              <strong className="text-slate-100">{d.percentage}%</strong>
            </span>
          ))}
        </div>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
        {caseloads.map((driver) => {
          const Icon = getDriverIcon(driver.category);
          const isSelected = selectedCategory === driver.category;

          return (
            <div
              key={driver.category}
              onClick={() => onSelectDriver?.(driver)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectDriver?.(driver);
                }
              }}
              tabIndex={0}
              role="button"
              aria-pressed={isSelected}
              className={`rounded-lg border p-4 text-left transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                isSelected
                  ? "bg-ink-900 border-amber-500 shadow-lg shadow-amber-950/20"
                  : "bg-ink-900/60 border-ink-800 hover:border-ink-700 hover:bg-ink-900/90"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="p-2 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: `${driver.color}20`, color: driver.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100 leading-tight">
                      {driver.label}
                    </h4>
                    <span className="text-xs font-mono text-slate-400 capitalize">
                      Primary Trigger
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-mono font-bold text-slate-100">
                    {metricMode === "percentage"
                      ? `${driver.percentage}%`
                      : formatNumber(driver.count)}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {metricMode === "percentage"
                      ? `${formatNumber(driver.count)} IDPs`
                      : `${driver.percentage}% of total`}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                {driver.description}
              </p>

              {/* Primary locations */}
              <div className="mt-3 pt-2.5 border-t border-ink-800/80 flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="h-3 w-3 text-slate-500 flex-shrink-0" />
                <span className="text-[11px] truncate">
                  <strong className="text-slate-300">Hotspots: </strong>
                  {driver.primaryLocations.join(", ")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Screen Reader Table Alternative */}
      <table className="sr-only">
        <caption>Documented Internal Displacement Triggers in Ethiopia</caption>
        <thead>
          <tr>
            <th scope="col">Driver Category</th>
            <th scope="col">Displaced Individuals</th>
            <th scope="col">Percentage Share</th>
            <th scope="col">Primary Hotspot Regions</th>
          </tr>
        </thead>
        <tbody>
          {caseloads.map((d) => (
            <tr key={d.category}>
              <td>{d.label}</td>
              <td>{d.count}</td>
              <td>{d.percentage}%</td>
              <td>{d.primaryLocations.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
