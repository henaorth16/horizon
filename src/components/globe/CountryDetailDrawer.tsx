"use client";

import React from "react";
import { X, Globe2, ArrowRight, ShieldCheck, MapPin, TrendingUp, Users } from "lucide-react";
import type { GlobalPartnerCountry } from "@/lib/geo/migrationData";
import { Badge } from "@/components/ui/Badge";
import { formatNumber } from "@/lib/utils";

export interface CountryDetailDrawerProps {
  country: GlobalPartnerCountry | null;
  selectedYear: number;
  onClose: () => void;
  className?: string;
}

export function CountryDetailDrawer({
  country,
  selectedYear,
  onClose,
  className,
}: CountryDetailDrawerProps) {
  if (!country) return null;

  const currentStock = country.emigrantStocks[selectedYear] || country.emigrantStocks[2024] || 0;
  const stock2010 = country.emigrantStocks[2010] || currentStock;
  const growthRate =
    stock2010 > 0
      ? Math.round(((currentStock - stock2010) / stock2010) * 100)
      : 0;

  return (
    <div
      role="dialog"
      aria-labelledby="country-drawer-title"
      className={`rounded-lg border border-ink-700 bg-ink-900/95 p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-4 animate-in fade-in slide-in-from-right duration-200 ${
        className || ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-ink-700 pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#426b66] dark:text-[#5b938d] uppercase tracking-wider mb-1 font-medium">
            <Globe2 className="h-3.5 w-3.5" />
            <span>Bilateral Partner Profile</span>
          </div>
          <h3 id="country-drawer-title" className="text-lg font-bold text-slate-100">
            {country.name}
          </h3>
          <span className="text-xs font-mono text-slate-400">
            ISO Code: {country.iso} • Numeric: {country.numericId}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close country drawer"
          className="rounded p-1 text-slate-400 hover:bg-ink-800 hover:text-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-[#bc6c25] focus-visible:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded bg-ink-900/80 p-3 border border-ink-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-cyan-400 block">
            Emigrant Stock ({selectedYear})
          </span>
          <span className="text-xl font-bold font-mono text-slate-100">
            {formatNumber(currentStock)}
          </span>
          <span className="text-[10px] text-slate-400 block">
            UN DESA Bilateral Stock
          </span>
        </div>

        <div className="rounded bg-ink-900/80 p-3 border border-ink-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-amber-400 block">
            Refugees Hosted
          </span>
          <span className="text-xl font-bold font-mono text-slate-100">
            {formatNumber(country.refugeesAbroad)}
          </span>
          <span className="text-[10px] text-slate-400 block">
            Ethiopian refugees abroad
          </span>
        </div>
      </div>

      {/* Historical Growth & Corridor Badges */}
      <div className="space-y-2 text-xs font-mono">
        <div className="flex items-center justify-between py-1.5 border-b border-ink-800/80">
          <span className="text-slate-400">Primary Corridor:</span>
          <Badge variant="cyan" size="sm">
            {country.corridor}
          </Badge>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-ink-800/80">
          <span className="text-slate-400">Growth Since 2010:</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +{growthRate}%
          </span>
        </div>

        {country.refugeesHostedInEthiopia && (
          <div className="flex items-center justify-between py-1.5 border-b border-ink-800/80">
            <span className="text-slate-400">Refugees In Ethiopia:</span>
            <span className="text-amber-300 font-bold">
              {formatNumber(country.refugeesHostedInEthiopia)}
            </span>
          </div>
        )}
      </div>

      {/* Notes / Context */}
      {country.notes && (
        <div className="rounded bg-ink-900/50 p-3 border border-ink-800 text-[11px] text-slate-300 space-y-1 leading-relaxed">
          <span className="font-semibold text-slate-200 block text-[10px] uppercase font-mono text-cyan-400">
            Strategic Overview
          </span>
          <p>{country.notes}</p>
        </div>
      )}

      {/* Citation */}
      <div className="pt-1 text-[10px] font-mono text-slate-500 border-t border-ink-800 flex items-center justify-between">
        <span>Source: UN DESA / UNHCR</span>
        <span>License: Open Data Principles</span>
      </div>
    </div>
  );
}
