"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  ArrowRight,
  CheckCircle2,
  ArrowUpDown,
} from "lucide-react";
import type { RegionalCaseloadItem } from "@/lib/db/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/charts/EmptyState";
import { formatNumber } from "@/lib/utils";

interface RegionalSummarySectionProps {
  caseloads: RegionalCaseloadItem[];
}

export function RegionalSummarySection({ caseloads }: RegionalSummarySectionProps) {
  const [selectedDriver, setSelectedDriver] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"idps" | "returnees" | "name">("idps");

  const filteredCaseloads = useMemo(() => {
    return caseloads
      .filter((r) => {
        if (selectedDriver !== "all" && r.primaryDriver !== selectedDriver) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          return (
            r.regionName.toLowerCase().includes(q) ||
            r.pcode.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "idps") return b.idps - a.idps;
        if (sortBy === "returnees") return b.returnees - a.returnees;
        if (sortBy === "name") return a.regionName.localeCompare(b.regionName);
        return 0;
      });
  }, [caseloads, selectedDriver, searchQuery, sortBy]);

  const driverCounts = useMemo(() => {
    const counts = { conflict: 0, drought: 0, floods: 0 };
    for (const c of caseloads) {
      if (c.primaryDriver === "conflict") counts.conflict++;
      if (c.primaryDriver === "drought") counts.drought++;
      if (c.primaryDriver === "floods") counts.floods++;
    }
    return counts;
  }, [caseloads]);

  return (
    <section className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#bc6c25] uppercase tracking-wider mb-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>Subnational Geography</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100">
            Regional Caseloads & Crisis Epicenters
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified mobility figures across all 12 monitored regional states (IOM DTM Round 37 Baseline).
          </p>
        </div>

        <Link
          href="/inside-ethiopia"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#bc6c25] hover:text-[#9f571b] dark:text-[#dda15e] self-start sm:self-auto font-semibold"
        >
          <span>Detailed Subnational View</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 rounded-lg border border-ink-700 bg-ink-900/60 p-3 text-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter regions by name or P-code (e.g., Tigray, ET04)..."
            aria-label="Filter regions by name or P-code"
            className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-ink-850 border border-ink-700 rounded text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#bc6c25] focus-visible:ring-2 focus-visible:ring-[#bc6c25]"
          />
        </div>

        {/* Driver Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-[11px] font-mono" role="group" aria-label="Filter by displacement driver">
          <button
            type="button"
            onClick={() => setSelectedDriver("all")}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#bc6c25] focus-visible:outline-none ${
              selectedDriver === "all"
                ? "bg-ink-800 text-slate-100 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All ({caseloads.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedDriver("conflict")}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#bc6c25] focus-visible:outline-none ${
              selectedDriver === "conflict"
                ? "bg-[#bc6c25]/20 text-[#853010] dark:text-red-300 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Conflict ({driverCounts.conflict})
          </button>
          <button
            type="button"
            onClick={() => setSelectedDriver("drought")}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#bc6c25] focus-visible:outline-none ${
              selectedDriver === "drought"
                ? "bg-[#dda15e]/25 text-[#854b0e] dark:text-orange-300 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Drought ({driverCounts.drought})
          </button>
          <button
            type="button"
            onClick={() => setSelectedDriver("floods")}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#bc6c25] focus-visible:outline-none ${
              selectedDriver === "floods"
                ? "bg-[#426b66]/20 text-[#164e63] dark:text-cyan-300 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Floods ({driverCounts.floods})
          </button>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 self-end md:self-auto">
          <ArrowUpDown className="h-3 w-3" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "idps" | "returnees" | "name")}
            aria-label="Sort regional caseloads"
            className="bg-ink-850 border border-ink-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#bc6c25]"
          >
            <option value="idps">Sort by IDPs (Highest)</option>
            <option value="returnees">Sort by Returnees</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Grid of Regional Cards */}
      {filteredCaseloads.length === 0 ? (
        <EmptyState
          title="No Regions Found"
          description={
            searchQuery.trim()
              ? `No regional states match search query "${searchQuery}".`
              : `No regions match trigger filter "${selectedDriver}".`
          }
          resetText="Clear Search & Filters"
          onReset={() => {
            setSelectedDriver("all");
            setSearchQuery("");
          }}
          suggestions={[
            "Check spelling of the region or P-code",
            "Select 'All Drivers' to broaden results",
          ]}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredCaseloads.map((r) => (
            <Card
              key={r.pcode}
              className="hover:border-ink-600 transition-colors bg-ink-900/60"
            >
              <CardHeader className="p-3.5 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-100">
                      {r.regionName}
                    </CardTitle>
                    <span className="text-[10px] font-mono text-slate-400">{r.pcode}</span>
                  </div>
                  <Badge
                    variant={
                      r.primaryDriver === "conflict"
                        ? "rust"
                        : r.primaryDriver === "drought"
                        ? "sand"
                        : "cyan"
                    }
                    size="sm"
                  >
                    {r.primaryDriver}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3.5 pt-1 text-xs">
                <div className="grid grid-cols-2 gap-2 my-2">
                  <div className="rounded bg-ink-850 p-2 border border-ink-700">
                    <span className="text-[9px] font-mono uppercase text-[#bc6c25] dark:text-[#dda15e] block font-medium">
                      IDPs
                    </span>
                    <span className="text-sm font-bold font-mono text-slate-100">
                      {formatNumber(r.idps)}
                    </span>
                  </div>
                  <div className="rounded bg-ink-850 p-2 border border-ink-700">
                    <span className="text-[9px] font-mono uppercase text-[#606c38] block font-medium">
                      Returnees
                    </span>
                    <span className="text-sm font-bold font-mono text-slate-100">
                      {formatNumber(r.returnees)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-ink-700/60">
                  <span className="capitalize flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-[#606c38]" />
                    {r.confidence} Conf.
                  </span>
                  <span>Ref: {r.reportingDate}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
