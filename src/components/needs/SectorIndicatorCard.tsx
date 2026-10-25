"use client";

import React, { useState } from "react";
import { SectorIndicatorDefinition, SeverityLevel } from "@/lib/data/humanitarianNeeds";
import { Badge } from "@/components/ui/Badge";
import {
  Tent,
  Droplets,
  Utensils,
  ShieldCheck,
  HeartPulse,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface SectorIndicatorCardProps {
  definition: SectorIndicatorDefinition;
}

export function SectorIndicatorCard({ definition }: SectorIndicatorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSectorIcon = (sector: string) => {
    switch (sector) {
      case "shelter":
        return Tent;
      case "wash":
        return Droplets;
      case "food_security":
        return Utensils;
      case "protection":
        return ShieldCheck;
      case "health":
        return HeartPulse;
      default:
        return Info;
    }
  };

  const Icon = getSectorIcon(definition.sector);

  const getSeverityBadgeVariant = (val: number): "terracotta" | "ember" | "ochre" | "muted" => {
    if (val >= definition.severityThresholds.critical) return "terracotta";
    if (val >= definition.severityThresholds.severe) return "ember";
    if (val >= definition.severityThresholds.moderate) return "ochre";
    return "muted";
  };

  return (
    <div className="rounded-lg border border-ink-800 bg-ink-900/60 p-4 space-y-3 transition-colors hover:border-ink-700">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-md bg-ink-950 border border-ink-800 text-amber-400">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">{definition.shortName}</h4>
            <div className="text-[11px] font-mono text-slate-400">
              {definition.cluster} • {definition.leadAgency}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xl font-mono font-bold text-slate-100">
            {definition.nationalAverage}%
          </div>
          <Badge variant={getSeverityBadgeVariant(definition.nationalAverage)} size="sm">
            {definition.nationalAverage >= definition.severityThresholds.severe ? "CRITICAL" : "SEVERE"}
          </Badge>
        </div>
      </div>

      {/* Sphere Benchmark Callout */}
      <div className="bg-ink-950/80 rounded border border-ink-800/80 p-2.5 text-xs text-slate-300">
        <div className="flex items-start gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <span className="text-[11px] leading-relaxed">
            <strong className="text-slate-200">Official Benchmark: </strong>
            {definition.sphereBenchmark}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 leading-relaxed">
        {definition.definition}
      </p>

      {/* Expandable Methodology Toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-xs font-mono text-amber-400 pt-1 hover:text-amber-300 transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none rounded px-1"
        aria-expanded={isExpanded}
      >
        <span>{isExpanded ? "Hide Methodology & Thresholds" : "Inspect Definition & Thresholds"}</span>
        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {isExpanded && (
        <div className="pt-2 border-t border-ink-800 space-y-2 text-xs text-slate-300 animate-fadeIn">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              Collection Methodology:
            </span>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-normal">
              {definition.collectionMethodology}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              Severity Thresholds:
            </span>
            <div className="grid grid-cols-4 gap-1.5 pt-1 text-center font-mono text-[10px]">
              <div className="bg-ink-950 p-1.5 rounded border border-ink-800">
                <span className="text-slate-400 block">Low</span>
                <span className="text-slate-200">&lt; {definition.severityThresholds.low}%</span>
              </div>
              <div className="bg-ink-950 p-1.5 rounded border border-ink-800">
                <span className="text-yellow-400 block">Moderate</span>
                <span className="text-slate-200">{definition.severityThresholds.low}–{definition.severityThresholds.moderate}%</span>
              </div>
              <div className="bg-ink-950 p-1.5 rounded border border-ink-800">
                <span className="text-orange-400 block">Severe</span>
                <span className="text-slate-200">{definition.severityThresholds.moderate}–{definition.severityThresholds.severe}%</span>
              </div>
              <div className="bg-ink-950 p-1.5 rounded border border-ink-800">
                <span className="text-red-400 block">Critical</span>
                <span className="text-slate-200">&gt; {definition.severityThresholds.severe}%</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 pt-1">
            Source: {definition.sourceName} ({definition.referencePeriod})
          </div>
        </div>
      )}
    </div>
  );
}
