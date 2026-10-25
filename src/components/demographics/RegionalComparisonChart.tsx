"use client";

import React, { useState } from "react";
import type { RegionalDemographicComparisonItem } from "@/lib/db/types";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { BarChart3, AlertCircle, CheckCircle2, Filter } from "lucide-react";
import { EmptyState } from "@/components/charts/EmptyState";

export interface RegionalComparisonChartProps {
  comparisons: RegionalDemographicComparisonItem[];
  selectedRegion?: string;
  onSelectRegion?: (pcode: string) => void;
  className?: string;
}

export function RegionalComparisonChart({
  comparisons,
  selectedRegion,
  onSelectRegion,
  className,
}: RegionalComparisonChartProps) {
  const [metricView, setMetricView] = useState<"caseload" | "femaleRatio" | "childRatio">("caseload");

  if (!comparisons || comparisons.length === 0) {
    return (
      <EmptyState
        title="No Regional Comparisons Available"
        description="No subnational demographic comparison data was retrieved for the current monitoring cycle."
        suggestions={[
          "Ensure regional baseline data is loaded",
          "Switch population type or period",
        ]}
      />
    );
  }

  const maxIdps = Math.max(...comparisons.map((c) => c.totalIdps), 1);

  return (
    <div className={`space-y-4 rounded-lg border border-ink-700 bg-ink-900/80 p-5 ${className || ""}`}>
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-800 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-500 uppercase tracking-wider mb-1">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Subnational Comparison</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-100">
            Regional Caseloads & Demographic Assessment Status
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-regional analysis comparing verified IDP figures and demographic disaggregation coverage.
          </p>
        </div>

        {/* Metric View Toggle */}
        <div className="flex items-center rounded-md bg-ink-950 p-1 border border-ink-800 text-xs font-mono" role="group" aria-label="Metric view selection">
          <button
            type="button"
            onClick={() => setMetricView("caseload")}
            className={`px-2.5 py-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              metricView === "caseload"
                ? "bg-ink-800 text-slate-100 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            IDP Caseload
          </button>
          <button
            type="button"
            onClick={() => setMetricView("femaleRatio")}
            className={`px-2.5 py-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              metricView === "femaleRatio"
                ? "bg-amber-500/20 text-amber-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Female Ratio
          </button>
          <button
            type="button"
            onClick={() => setMetricView("childRatio")}
            className={`px-2.5 py-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              metricView === "childRatio"
                ? "bg-sky-500/20 text-sky-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Child Ratio
          </button>
        </div>
      </div>

      {/* Regional Comparison Bars List */}
      <div className="space-y-2.5 pt-1">
        {comparisons.map((c) => {
          const isSelected = selectedRegion === c.pcode;
          const barWidth = Math.round((c.totalIdps / maxIdps) * 100);

          return (
            <div
              key={c.pcode}
              role="button"
              tabIndex={0}
              aria-label={`${c.regionName} (${c.pcode}): ${formatNumber(c.totalIdps)} IDPs, Driver: ${c.primaryDriver}, Female Ratio: ${c.femaleRatio ?? 'N/A'}%, Child Ratio: ${c.childRatio ?? 'N/A'}%`}
              onClick={() => onSelectRegion?.(c.pcode)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectRegion?.(c.pcode);
                }
              }}
              className={`rounded-lg border p-3 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                isSelected
                  ? "border-amber-500/80 bg-ink-950 shadow-md ring-1 ring-amber-500/40"
                  : "border-ink-800/80 bg-ink-950/50 hover:border-ink-700 hover:bg-ink-950/80"
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-xs font-mono mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-100">{c.regionName}</span>
                  <span className="text-[10px] text-slate-400">{c.pcode}</span>

                  {c.hasDemographics ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      <span>Assessed</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-ink-900 px-1.5 py-0.5 rounded border border-ink-800">
                      <AlertCircle className="h-2.5 w-2.5 text-slate-500" />
                      <span>Unassessed Breakdown</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      c.primaryDriver === "conflict"
                        ? "terracotta"
                        : c.primaryDriver === "drought"
                        ? "ember"
                        : "cyan"
                    }
                    size="sm"
                  >
                    {c.primaryDriver}
                  </Badge>

                  <span className="text-sm font-bold text-slate-100">
                    {metricView === "caseload"
                      ? formatNumber(c.totalIdps)
                      : metricView === "femaleRatio"
                      ? c.femaleRatio !== undefined
                        ? `${c.femaleRatio}%`
                        : "N/A"
                      : c.childRatio !== undefined
                      ? `${c.childRatio}%`
                      : "N/A"}
                  </span>
                </div>
              </div>

              {/* Bar Fill */}
              <div className="h-2 w-full rounded-full bg-ink-900 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    metricView === "femaleRatio"
                      ? "bg-amber-500"
                      : metricView === "childRatio"
                      ? "bg-sky-500"
                      : "bg-amber-500"
                  }`}
                  style={{
                    width:
                      metricView === "caseload"
                        ? `${Math.max(2, barWidth)}%`
                        : metricView === "femaleRatio"
                        ? `${c.femaleRatio || 0}%`
                        : `${c.childRatio || 0}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] font-mono text-slate-400 text-right pt-2 border-t border-ink-800">
        Click any regional state above to synchronize the population pyramid to that jurisdiction.
      </div>
    </div>
  );
}
