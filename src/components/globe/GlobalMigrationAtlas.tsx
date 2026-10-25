"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import type { Topology } from "topojson-specification";
import { TopDestinationsRanking } from "./TopDestinationsRanking";
import { CorridorCardList } from "./CorridorCardList";
import { CountryDetailDrawer } from "./CountryDetailDrawer";
import { MapSkeleton } from "@/components/ui/LoadingSkeleton";

const GlobeViewport = dynamic(
  () => import("./GlobeViewport").then((mod) => mod.GlobeViewport),
  {
    ssr: false,
    loading: () => (
      <MapSkeleton
        title="Loading global world boundaries and flight corridors..."
        minHeight={460}
      />
    ),
  }
);
import {
  GLOBAL_PARTNER_COUNTRIES,
  MIGRATION_CORRIDORS,
  type GlobalPartnerCountry,
} from "@/lib/geo/migrationData";
import { formatNumber } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StaleDataIndicator } from "@/components/ui/StaleDataIndicator";
import {
  Globe2,
  Calendar,
  Layers,
  ShieldCheck,
  TrendingUp,
  Compass,
  ArrowRight,
} from "lucide-react";

export interface GlobalMigrationAtlasProps {
  initialTopology?: Topology;
  className?: string;
}

export function GlobalMigrationAtlas({ initialTopology, className }: GlobalMigrationAtlasProps) {
  // State
  const [selectedMetric, setSelectedMetric] = useState<
    "emigrants" | "refugees_abroad" | "refugees_hosted" | "corridors"
  >("emigrants");
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedCountry, setSelectedCountry] = useState<GlobalPartnerCountry | null>(null);
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>("corridor_eastern");

  // Historical years available for UN DESA migrant stocks
  const availableYears = [2010, 2015, 2020, 2024];

  // Calculate total global diaspora stock for selected year
  const totalDiasporaStock = GLOBAL_PARTNER_COUNTRIES.reduce(
    (sum, c) => sum + (c.emigrantStocks[selectedYear] || 0),
    0
  );

  const totalRefugeesAbroad = GLOBAL_PARTNER_COUNTRIES.reduce(
    (sum, c) => sum + c.refugeesAbroad,
    0
  );

  return (
    <div className={`space-y-6 ${className || ""}`}>
      {/* Top Filter and Time Slider Toolbar */}
      <div className="rounded-lg border border-ink-700 bg-ink-900/90 p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Layers className="h-3.5 w-3.5" />
            <span>Atlas Controls & Historical Dimension</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Calendar className="h-3.5 w-3.5 text-cyan-400" />
            <span>Active Reporting Year: <strong className="text-slate-100">{selectedYear}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Metric Selector Buttons */}
          <div className="lg:col-span-7 flex flex-wrap items-center gap-1.5 text-xs font-mono" role="group" aria-label="International migration metric selection">
            <button
              type="button"
              onClick={() => setSelectedMetric("emigrants")}
              className={`px-3 py-1.5 rounded transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                selectedMetric === "emigrants"
                  ? "bg-cyan-500/20 text-cyan-400 font-semibold border border-cyan-500/40"
                  : "bg-ink-950 text-slate-400 hover:text-slate-200 border border-ink-800"
              }`}
            >
              Emigrant Stock (UN DESA)
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric("refugees_abroad")}
              className={`px-3 py-1.5 rounded transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                selectedMetric === "refugees_abroad"
                  ? "bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/40"
                  : "bg-ink-950 text-slate-400 hover:text-slate-200 border border-ink-800"
              }`}
            >
              Refugees Abroad (UNHCR)
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric("refugees_hosted")}
              className={`px-3 py-1.5 rounded transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                selectedMetric === "refugees_hosted"
                  ? "bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/40"
                  : "bg-ink-950 text-slate-400 hover:text-slate-200 border border-ink-800"
              }`}
            >
              Refugees Hosted in Ethiopia
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric("corridors")}
              className={`px-3 py-1.5 rounded transition-colors focus-visible:ring-2 focus-visible:ring-terracotta-400 focus-visible:outline-none ${
                selectedMetric === "corridors"
                  ? "bg-terracotta-500/20 text-terracotta-400 font-semibold border border-terracotta-500/40"
                  : "bg-ink-950 text-slate-400 hover:text-slate-200 border border-ink-800"
              }`}
            >
              Transit Corridors (IOM)
            </button>
          </div>

          {/* Time Slider (Available when viewing emigrant stock) */}
          <div className="lg:col-span-5 flex items-center justify-end gap-3 bg-ink-950/80 p-2 rounded-lg border border-ink-800 text-xs font-mono" role="group" aria-label="Timeline years">
            <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">
              Timeline:
            </span>
            <div className="flex items-center gap-1">
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYear(yr)}
                  disabled={selectedMetric !== "emigrants"}
                  className={`px-2 py-1 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                    selectedYear === yr
                      ? "bg-cyan-500 text-ink-950 font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-ink-900"
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Historical UN DESA Period Stale Data Notice */}
      {selectedYear !== 2024 && (
        <StaleDataIndicator
          reportingDate={`${selectedYear}-12-31`}
          round={`UN DESA ${selectedYear}`}
          sourceName="UN DESA Population Division"
          mode="banner"
          onResetBaseline={() => setSelectedYear(2024)}
        />
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-t-2 border-t-cyan-500 bg-ink-900/80">
          <CardHeader className="p-4 pb-1">
            <span className="text-[11px] font-mono uppercase text-slate-400">Global Ethiopian Diaspora</span>
            <CardTitle className="text-2xl font-bold font-mono text-cyan-400">
              {formatNumber(totalDiasporaStock)}+
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-slate-400">
            Recorded foreign-born stock across top destination countries ({selectedYear})
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-amber-500 bg-ink-900/80">
          <CardHeader className="p-4 pb-1">
            <span className="text-[11px] font-mono uppercase text-slate-400">Ethiopian Refugees Abroad</span>
            <CardTitle className="text-2xl font-bold font-mono text-amber-400">
              {formatNumber(totalRefugeesAbroad)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-slate-400">
            Hosted primarily across Sudan, Kenya, South Africa, and Yemen
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-emerald-500 bg-ink-900/80">
          <CardHeader className="p-4 pb-1">
            <span className="text-[11px] font-mono uppercase text-slate-400">Primary Irregular Axis</span>
            <CardTitle className="text-2xl font-bold font-mono text-slate-100">
              Eastern Route
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-slate-400">
            ~150,000–250,000 annual journeys crossing Gulf of Aden to Saudi Arabia
          </CardContent>
        </Card>
      </div>

      {/* Main Map & Rankings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Globe Viewport */}
        <div className={selectedCountry ? "lg:col-span-8" : "lg:col-span-8"}>
          <GlobeViewport
            initialTopology={initialTopology}
            selectedMetric={selectedMetric}
            selectedYear={selectedYear}
            selectedCountry={selectedCountry}
            onSelectCountry={setSelectedCountry}
            selectedCorridorId={selectedCorridorId}
          />
        </div>

        {/* Right Sidebar: Country Detail Drawer or Leaderboard */}
        <div className="lg:col-span-4 space-y-4">
          {selectedCountry ? (
            <CountryDetailDrawer
              country={selectedCountry}
              selectedYear={selectedYear}
              onClose={() => setSelectedCountry(null)}
            />
          ) : null}

          <TopDestinationsRanking
            selectedYear={selectedYear}
            selectedMetric={selectedMetric}
            selectedCountry={selectedCountry}
            onSelectCountry={(c) => setSelectedCountry(c)}
          />
        </div>
      </div>

      {/* Corridor Cards Section */}
      <CorridorCardList
        selectedCorridorId={selectedCorridorId}
        onSelectCorridor={(id) => {
          setSelectedCorridorId(id);
          setSelectedMetric("corridors");
        }}
      />
    </div>
  );
}
