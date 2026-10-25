"use client";

import React from "react";
import { GLOBAL_PARTNER_COUNTRIES, type GlobalPartnerCountry } from "@/lib/geo/migrationData";
import { formatNumber } from "@/lib/utils";
import { Trophy, ArrowUpRight, Compass } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/charts/EmptyState";

export interface TopDestinationsRankingProps {
  selectedYear: number;
  selectedMetric: "emigrants" | "refugees_abroad" | "refugees_hosted" | "corridors";
  selectedCountry: GlobalPartnerCountry | null;
  onSelectCountry: (country: GlobalPartnerCountry) => void;
  className?: string;
}

export function TopDestinationsRanking({
  selectedYear,
  selectedMetric,
  selectedCountry,
  onSelectCountry,
  className,
}: TopDestinationsRankingProps) {
  // Sort countries based on active metric
  const sortedCountries = [...GLOBAL_PARTNER_COUNTRIES].sort((a, b) => {
    if (selectedMetric === "refugees_hosted") {
      return (b.refugeesHostedInEthiopia || 0) - (a.refugeesHostedInEthiopia || 0);
    }
    if (selectedMetric === "refugees_abroad") {
      return b.refugeesAbroad - a.refugeesAbroad;
    }
    const valA = a.emigrantStocks[selectedYear] || 0;
    const valB = b.emigrantStocks[selectedYear] || 0;
    return valB - valA;
  });

  const topCountries = sortedCountries.slice(0, 8);
  const maxValue =
    selectedMetric === "refugees_hosted"
      ? topCountries[0]?.refugeesHostedInEthiopia || 1
      : selectedMetric === "refugees_abroad"
      ? topCountries[0]?.refugeesAbroad || 1
      : topCountries[0]?.emigrantStocks[selectedYear] || 1;

  return (
    <div className={`space-y-3 rounded-lg border border-ink-700 bg-ink-900/80 p-5 ${className || ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink-800 pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-0.5">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>Leaderboard</span>
          </div>
          <h4 className="text-sm font-bold text-slate-100">
            {selectedMetric === "refugees_hosted"
              ? "Top Refugee Origin Countries"
              : selectedMetric === "refugees_abroad"
              ? "Top Countries Hosting Ethiopian Refugees"
              : `Top Diaspora Destinations (${selectedYear})`}
          </h4>
        </div>

        <Badge variant="cyan" size="sm" className="font-mono text-[10px]">
          Top {topCountries.length}
        </Badge>
      </div>

      {/* Ranked List */}
      <div className="space-y-2">
        {topCountries.length === 0 ? (
          <EmptyState
            title="No Ranked Countries"
            description="No international migration or refugee partner countries match the active selection."
          />
        ) : (
          topCountries.map((country, index) => {
          const isSelected = selectedCountry?.iso === country.iso;
          const value =
            selectedMetric === "refugees_hosted"
              ? country.refugeesHostedInEthiopia || 0
              : selectedMetric === "refugees_abroad"
              ? country.refugeesAbroad
              : country.emigrantStocks[selectedYear] || 0;

          const pct = Math.max(3, Math.round((value / maxValue) * 100));

          return (
            <div
              key={country.iso}
              role="button"
              tabIndex={0}
              aria-label={`Rank ${index + 1}: ${country.name} (${country.iso}), ${formatNumber(value)} individuals`}
              onClick={() => onSelectCountry(country)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectCountry(country);
                }
              }}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                isSelected
                  ? "border-cyan-500/80 bg-ink-950 shadow-md ring-1 ring-cyan-500/40"
                  : "border-ink-800/80 bg-ink-950/40 hover:border-ink-700 hover:bg-ink-950/70"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded text-[10px] font-bold ${
                      index === 0
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : index === 1
                        ? "bg-slate-300/20 text-slate-300 border border-slate-400/40"
                        : index === 2
                        ? "bg-amber-800/20 text-amber-600 border border-amber-700/40"
                        : "bg-ink-900 text-slate-400"
                    }`}
                  >
                    #{index + 1}
                  </span>
                  <span className="font-semibold text-slate-100">{country.name}</span>
                  <span className="text-[10px] text-slate-500">{country.iso}</span>
                </div>

                <span className="font-bold text-slate-100">{formatNumber(value)}</span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full rounded-full bg-ink-900 overflow-hidden">
                <div
                  className="h-full rounded-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })
        )}
      </div>

      <div className="text-[10px] font-mono text-slate-500 text-right pt-1">
        Click any partner country above to focus globe coordinates.
      </div>
    </div>
  );
}
