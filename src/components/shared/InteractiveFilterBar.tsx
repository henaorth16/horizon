"use client";

import React from "react";
import {
  useObservatoryFilters,
} from "@/lib/state/ObservatoryFilterContext";
import {
  VALID_METRICS,
  VALID_DRIVERS,
  VALID_REGION_PCODES,
  MetricFilter,
  DriverFilter,
} from "@/lib/state/types";
import { PCODE_TO_REGION_NAME } from "@/lib/db/types";
import {
  RotateCcw,
  Filter,
  MapPin,
  AlertTriangle,
  Flame,
  CloudSun,
  Waves,
  X,
  Share2,
  Check,
} from "lucide-react";

export function InteractiveFilterBar() {
  const {
    filters,
    setRegion,
    setMetric,
    setDriver,
    resetFilters,
    activeFilterCount,
    isDefaultState,
    validationIssues,
    dismissIssues,
  } = useObservatoryFilters();

  const [copiedLink, setCopiedLink] = React.useState(false);

  const regionOptions = [
    { pcode: "all", name: "All Ethiopia (National)" },
    { pcode: "ET01", name: "Tigray (ET01)" },
    { pcode: "ET02", name: "Afar (ET02)" },
    { pcode: "ET03", name: "Amhara (ET03)" },
    { pcode: "ET04", name: "Oromia (ET04)" },
    { pcode: "ET05", name: "Somali (ET05)" },
    { pcode: "ET06", name: "Benishangul-Gumuz (ET06)" },
    { pcode: "ET07", name: "South Ethiopia / SNNP (ET07)" },
    { pcode: "ET10", name: "Sidama (ET10)" },
    { pcode: "ET12", name: "Gambela (ET12)" },
    { pcode: "ET13", name: "Harari (ET13)" },
    { pcode: "ET14", name: "Addis Ababa (ET14)" },
    { pcode: "ET15", name: "Dire Dawa (ET15)" },
  ];

  const handleShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-3">
      {/* Validation Issue Notice (if invalid comparative combination was submitted) */}
      {validationIssues.length > 0 && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200 flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-amber-300 font-semibold">Comparative Parameter Sanitized:</strong>
              {validationIssues.map((issue, idx) => (
                <div key={idx} className="text-[11px] leading-relaxed">
                  • {issue.reason}
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={dismissIssues}
            className="text-amber-400 hover:text-amber-200 p-0.5 rounded focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            aria-label="Dismiss warning"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Filter Bar */}
      <div className="rounded-lg border border-ink-700 bg-ink-900/90 p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Active Filter Icon & Badge */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 mr-1">
            <Filter className="h-3.5 w-3.5 text-[#bc6c25] dark:text-[#dda15e]" />
            <span>Cross-Filter:</span>
            {!isDefaultState && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#dda15e]/20 text-[#854b0e] dark:text-[#dda15e] text-[10px] font-bold border border-[#dda15e]/40">
                {activeFilterCount} Active
              </span>
            )}
          </div>

          {/* Region Dropdown */}
          <div className="flex items-center gap-1 bg-ink-850 px-2.5 py-1.5 rounded-md border border-ink-700 text-xs">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={filters.region}
              onChange={(e) => setRegion(e.target.value)}
              aria-label="Select Region"
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1 rounded focus-visible:ring-2 focus-visible:ring-[#bc6c25]"
            >
              {regionOptions.map((opt) => (
                <option key={opt.pcode} value={opt.pcode} className="bg-ink-900 text-slate-200">
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          {/* Metric Toggle */}
          <div className="flex items-center rounded-md bg-ink-850 p-1 border border-ink-700 text-xs font-mono">
            <button
              type="button"
              onClick={() => setMetric("idps")}
              className={`px-2.5 py-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-[#bc6c25] focus-visible:outline-none ${
                filters.metric === "idps"
                  ? "bg-[#dda15e]/25 text-[#854b0e] dark:text-[#dda15e] font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              IDP Caseload
            </button>
            <button
              type="button"
              onClick={() => setMetric("returnees")}
              className={`px-2.5 py-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-[#bc6c25] focus-visible:outline-none ${
                filters.metric === "returnees"
                  ? "bg-[#606c38]/20 text-[#283618] dark:text-[#fefae0] font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Returnees
            </button>
          </div>

          {/* Driver Quick Filter Pills */}
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setDriver("all")}
              className={`px-2 py-1 rounded border transition-colors focus-visible:ring-2 focus-visible:ring-[#bc6c25] focus-visible:outline-none ${
                filters.driver === "all"
                  ? "bg-ink-800 text-slate-200 border-ink-700 font-medium"
                  : "border-ink-700 text-slate-400 hover:text-slate-200 bg-ink-850"
              }`}
            >
              All Drivers
            </button>
            <button
              type="button"
              onClick={() => setDriver("conflict")}
              className={`px-2 py-1 rounded border transition-colors flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[#bc6c25] focus-visible:outline-none ${
                filters.driver === "conflict"
                  ? "bg-[#bc6c25]/20 text-[#853010] dark:text-red-300 border-[#bc6c25]/40 font-semibold"
                  : "border-ink-700 text-slate-400 hover:text-slate-200 bg-ink-850"
              }`}
            >
              <Flame className="h-3 w-3 text-[#bc6c25]" />
              <span>Conflict</span>
            </button>
            <button
              type="button"
              onClick={() => setDriver("drought")}
              className={`px-2 py-1 rounded border transition-colors flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[#bc6c25] focus-visible:outline-none ${
                filters.driver === "drought"
                  ? "bg-[#dda15e]/25 text-[#854b0e] dark:text-orange-300 border-[#dda15e]/40 font-semibold"
                  : "border-ink-700 text-slate-400 hover:text-slate-200 bg-ink-850"
              }`}
            >
              <CloudSun className="h-3 w-3 text-[#dda15e]" />
              <span>Drought</span>
            </button>
            <button
              type="button"
              onClick={() => setDriver("floods")}
              className={`px-2 py-1 rounded border transition-colors flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[#bc6c25] focus-visible:outline-none ${
                filters.driver === "floods"
                  ? "bg-[#426b66]/20 text-[#164e63] dark:text-cyan-300 border-[#426b66]/40 font-semibold"
                  : "border-ink-700 text-slate-400 hover:text-slate-200 bg-ink-850"
              }`}
            >
              <Waves className="h-3 w-3 text-[#426b66]" />
              <span>Floods</span>
            </button>
          </div>
        </div>

        {/* Action Controls: Share Link & Reset */}
        <div className="flex items-center gap-2 self-start lg:self-auto pt-1 lg:pt-0">
          <button
            type="button"
            onClick={handleShareLink}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-slate-300 bg-ink-850 rounded border border-ink-700 hover:bg-ink-800 hover:text-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-[#bc6c25] focus-visible:outline-none"
            title="Copy shareable deep link with current filter selections"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-[#606c38]" /> : <Share2 className="h-3.5 w-3.5 text-[#bc6c25] dark:text-[#dda15e]" />}
            <span>{copiedLink ? "Link Copied!" : "Share Link"}</span>
          </button>

          {!isDefaultState && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-[#bc6c25] dark:text-[#dda15e] bg-ink-850 rounded border border-ink-700 hover:bg-ink-800 transition-colors focus-visible:ring-2 focus-visible:ring-[#bc6c25] focus-visible:outline-none"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
