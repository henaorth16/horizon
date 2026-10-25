"use client";

import React, { useState } from "react";
import {
  SECTOR_DEFINITIONS,
  REGIONAL_NEEDS_PROFILES,
  HumanitarianSector,
} from "@/lib/data/humanitarianNeeds";
import { SectorIndicatorCard } from "./SectorIndicatorCard";
import { ZonalNeedsMatrix } from "./ZonalNeedsMatrix";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/charts/EmptyState";
import {
  HeartHandshake,
  ShieldAlert,
  Tent,
  Droplets,
  Utensils,
  ShieldCheck,
  HeartPulse,
  Grid,
  Info,
  Scale,
} from "lucide-react";

export function SectorNeedsExplorerView() {
  const [activeSector, setActiveSector] = useState<HumanitarianSector | "all">("all");

  const sectors: Array<{ key: HumanitarianSector; label: string; icon: any }> = [
    { key: "shelter", label: "Emergency Shelter", icon: Tent },
    { key: "wash", label: "WASH & Water", icon: Droplets },
    { key: "food_security", label: "Food Security (IPC)", icon: Utensils },
    { key: "protection", label: "Child & Gender Protection", icon: ShieldCheck },
    { key: "health", label: "Health & Nutrition", icon: HeartPulse },
  ];

  const filteredDefinitions =
    activeSector === "all"
      ? Object.values(SECTOR_DEFINITIONS)
      : [SECTOR_DEFINITIONS[activeSector]];

  return (
    <div className="space-y-6">
      {/* Ethical Scoring Principle Alert Callout */}
      <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-200/90 leading-relaxed">
        <Scale className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-red-300 font-semibold">Ethical Humanitarian Scoring Principle: </strong>
          The observatory displays individual sector indicators independently based on verified multi-sector needs assessments (MSNA / OCHA HNO 2024). Missing or unassessed data is never treated as zero or low need. We explicitly reject unweighted composite vulnerability indexes, which dangerously conceal catastrophic single-sector deficits (such as lack of potable water or child protection emergencies) beneath aggregated scores.
        </div>
      </div>

      {/* Sector Navigation Filter Bar */}
      <div className="flex items-center justify-between border-b border-ink-800 pb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveSector("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              activeSector === "all"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-ink-900 border border-transparent"
            }`}
          >
            All 5 Clusters
          </button>
          {sectors.map((s) => {
            const Icon = s.icon;
            const isSelected = activeSector === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setActiveSector(s.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                  isSelected
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-ink-900 border border-transparent"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        <Badge variant="terracotta" size="sm" className="hidden sm:inline-flex font-mono">
          OCHA HNO 2024 Benchmarks
        </Badge>
      </div>

      {/* Cluster Indicator Cards */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Official Cluster Indicators & Sphere Project Benchmarks
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            Showing {filteredDefinitions.length} of 5 sectors
          </span>
        </div>

        {filteredDefinitions.length === 0 ? (
          <EmptyState
            title="No Cluster Indicators Available"
            description="No indicators match the selected sector cluster."
            resetText="Show All Clusters"
            onReset={() => setActiveSector("all")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDefinitions.map((def) => (
              <SectorIndicatorCard key={def.id} definition={def} />
            ))}
          </div>
        )}
      </section>

      {/* Zonal Needs Matrix Section */}
      <section className="space-y-3 pt-2">
        <ZonalNeedsMatrix />
      </section>

      {/* IPC Acute Food Insecurity Reference Key */}
      <div className="rounded-lg border border-ink-800 bg-ink-950 p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Utensils className="h-4 w-4 text-green-400" />
          <span>Integrated Food Security Phase Classification (IPC) Technical Reference</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          IPC acute food insecurity classification follows a standardized 5-phase scale agreed upon by FEWS NET, WFP, FAO, and cluster partners:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1 font-mono text-xs">
          <div className="bg-ink-900/90 border border-ink-800 rounded p-2">
            <span className="text-emerald-400 font-bold block text-[11px]">Phase 1: Minimal</span>
            <span className="text-slate-400 text-[10px]">Households meet basic food needs without coping strategies.</span>
          </div>
          <div className="bg-ink-900/90 border border-ink-800 rounded p-2">
            <span className="text-yellow-400 font-bold block text-[11px]">Phase 2: Stressed</span>
            <span className="text-slate-400 text-[10px]">Minimally adequate food consumption; unable to afford non-food assets.</span>
          </div>
          <div className="bg-ink-900/90 border border-orange-500/30 rounded p-2">
            <span className="text-orange-400 font-bold block text-[11px]">Phase 3: Crisis</span>
            <span className="text-slate-400 text-[10px]">Critical food consumption gaps with elevated acute malnutrition.</span>
          </div>
          <div className="bg-ink-900/90 border border-red-500/30 rounded p-2">
            <span className="text-red-400 font-bold block text-[11px]">Phase 4: Emergency</span>
            <span className="text-slate-400 text-[10px]">Large food gaps with high acute malnutrition and excess mortality.</span>
          </div>
          <div className="bg-ink-900/90 border border-purple-500/30 rounded p-2">
            <span className="text-purple-400 font-bold block text-[11px]">Phase 5: Catastrophe</span>
            <span className="text-slate-400 text-[10px]">Complete lack of food/coping options; famine thresholds reached.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
