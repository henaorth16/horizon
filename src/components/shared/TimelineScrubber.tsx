"use client";

import React from "react";
import { useObservatoryFilters } from "@/lib/state/ObservatoryFilterContext";
import { RoundFilter } from "@/lib/state/types";
import { Clock, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

interface TimelineRoundMeta {
  round: RoundFilter;
  date: string;
  milestone: string;
}

const ROUNDS_META: TimelineRoundMeta[] = [
  { round: "R26", date: "Aug 2021", milestone: "Conflict Escalation" },
  { round: "R28", date: "Feb 2022", milestone: "Northern Conflict Caseload Peak" },
  { round: "R31", date: "Nov 2022", milestone: "Horn Drought Emergency Peak" },
  { round: "R34", date: "Aug 2023", milestone: "Returnee Village Monitoring" },
  { round: "R37", date: "Aug 2024", milestone: "Current Baseline Assessment" },
];

export function TimelineScrubber() {
  const { filters, setRound } = useObservatoryFilters();

  const currentIndex = ROUNDS_META.findIndex((r) => r.round === filters.round);
  const safeIndex = currentIndex !== -1 ? currentIndex : ROUNDS_META.length - 1;

  const handlePrev = () => {
    if (safeIndex > 0) {
      setRound(ROUNDS_META[safeIndex - 1].round);
    }
  };

  const handleNext = () => {
    if (safeIndex < ROUNDS_META.length - 1) {
      setRound(ROUNDS_META[safeIndex + 1].round);
    }
  };

  return (
    <div className="rounded-lg border border-ink-800 bg-ink-950/80 p-3 sm:p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider">
            Assessment Round Scrubber
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
            {ROUNDS_META[safeIndex].date} ({ROUNDS_META[safeIndex].round})
          </span>
        </div>

        {/* Stepper Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            disabled={safeIndex === 0}
            className="p-1 rounded bg-ink-900 border border-ink-800 text-slate-300 hover:text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            aria-label="Previous assessment round"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={safeIndex === ROUNDS_META.length - 1}
            className="p-1 rounded bg-ink-900 border border-ink-800 text-slate-300 hover:text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            aria-label="Next assessment round"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Scrubber Track */}
      <div className="relative pt-2 pb-1">
        {/* Progress bar background line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-ink-800 rounded -translate-y-1/2 z-0" />
        <div
          className="absolute top-5 left-0 h-1 bg-amber-500 rounded -translate-y-1/2 transition-all duration-300 z-0"
          style={{ width: `${(safeIndex / (ROUNDS_META.length - 1)) * 100}%` }}
        />

        {/* Stepper points */}
        <div className="relative z-10 flex items-center justify-between">
          {ROUNDS_META.map((item, idx) => {
            const isSelected = item.round === filters.round;
            const isPast = idx <= safeIndex;

            return (
              <button
                key={item.round}
                type="button"
                onClick={() => setRound(item.round)}
                className="flex flex-col items-center group rounded focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
                aria-label={`${item.round} (${item.date}): ${item.milestone}`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                    isSelected
                      ? "bg-amber-400 border-amber-300 ring-4 ring-amber-500/20 scale-110"
                      : isPast
                      ? "bg-ink-900 border-amber-500 group-hover:scale-105"
                      : "bg-ink-950 border-ink-700 group-hover:border-ink-500"
                  }`}
                />
                <span
                  className={`text-[10px] font-mono mt-1.5 transition-colors ${
                    isSelected ? "text-amber-400 font-bold" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  {item.round}
                </span>
                <span className="text-[9px] font-mono text-slate-500 hidden sm:block">
                  {item.date}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-[11px] font-mono text-slate-400 text-center sm:text-left pt-0.5 border-t border-ink-800/60">
        <strong className="text-slate-300">Milestone: </strong>
        {ROUNDS_META[safeIndex].milestone}
      </div>
    </div>
  );
}
