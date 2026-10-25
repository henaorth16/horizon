import React from "react";
import { AlertCircle, Calendar, History, ArrowRight } from "lucide-react";
import { StatusIndicator } from "./StatusIndicator";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface StaleDataIndicatorProps {
  reportingDate: string;
  round?: string;
  sourceName?: string;
  thresholdDays?: number;
  mode?: "badge" | "banner";
  onResetBaseline?: () => void;
  className?: string;
}

export function StaleDataIndicator({
  reportingDate,
  round,
  sourceName = "IOM DTM",
  thresholdDays = 180,
  mode = "banner",
  onResetBaseline,
  className,
}: StaleDataIndicatorProps) {
  // Check age relative to reference date (August 2024 baseline reference date or system date)
  const isHistoricalRound = round && round !== "R37";
  
  // Calculate age
  const refDate = new Date(reportingDate);
  const now = new Date("2024-08-31"); // Baseline cutoff or current epoch
  const diffDays = Math.floor((now.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24));
  const isStale = isHistoricalRound || diffDays > thresholdDays;

  if (mode === "badge") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono border",
          isStale
            ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
          className
        )}
      >
        <StatusIndicator status={isStale ? "stale" : "fresh"} pulse={!isStale} />
        <Calendar className="h-3 w-3" />
        <span>
          {round ? `${round} • ` : ""}
          {reportingDate}
        </span>
        {isStale && <span className="text-[10px] uppercase font-bold text-amber-400 ml-1">Historical</span>}
      </div>
    );
  }

  // Banner mode
  if (!isStale) {
    return (
      <div
        className={cn(
          "rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-300 flex items-center justify-between gap-2",
          className
        )}
      >
        <div className="flex items-center gap-2 font-mono">
          <StatusIndicator status="fresh" pulse={true} />
          <span>
            Verified Baseline: {sourceName} {round ? `${round} ` : ""}({reportingDate}) — Active Monitored Caseload
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Historical assessment alert"
      className={cn(
        "rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-500/20 text-amber-400 flex-shrink-0 border border-amber-500/40">
          <History className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-300">Historical Assessment Context</span>
            <span className="rounded bg-amber-950/80 px-2 py-0.5 text-[10px] font-mono text-amber-400 border border-amber-800">
              {round ? `${round} • ` : ""}
              {reportingDate}
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed max-w-2xl">
            You are reviewing historical displacement figures from{" "}
            <strong>{sourceName} {round ? `(${round})` : ""}</strong> collected on {reportingDate}. Caseload
            distribution, returnee rates, and primary triggers have evolved in subsequent monitoring rounds.
          </p>
        </div>
      </div>

      {onResetBaseline && (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onResetBaseline}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-mono bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40"
        >
          <span>Return to Baseline (Round 37)</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
