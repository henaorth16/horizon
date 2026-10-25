"use client";

import React, { useState } from "react";
import { CRISIS_DRIVERS_DATA, DriverTimelinePoint } from "@/lib/data/crisisDrivers";
import { formatNumber } from "@/lib/utils";
import { Calendar, Info } from "lucide-react";
import { EmptyState } from "@/components/charts/EmptyState";
import { StaleDataIndicator } from "@/components/ui/StaleDataIndicator";

export function DriverTimelineChart() {
  const { timeline } = CRISIS_DRIVERS_DATA;
  const [selectedPoint, setSelectedPoint] = useState<DriverTimelinePoint | null>(
    timeline && timeline.length > 0 ? timeline[timeline.length - 1] : null
  );

  if (!timeline || timeline.length === 0) {
    return (
      <EmptyState
        title="No Driver Timeline Records"
        description="Historical assessment rounds for crisis triggers are unavailable."
        suggestions={[
          "Verify that crisis driver datasets are loaded",
          "Reload the page to reinitialize records",
        ]}
      />
    );
  }

  const maxCaseload = Math.max(...timeline.map((t) => t.total), 4000000);
  const yTicks = [1000000, 2000000, 3000000, 4000000];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-400" />
            <span>Temporal Driver Evolution (2021–2024)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Documented shifts between conflict and climate (drought & flood) displacement triggers across assessment rounds. Zero-baseline stacked scale.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />
            <span className="text-slate-300">Conflict</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-orange-500 inline-block" />
            <span className="text-slate-300">Drought</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
            <span className="text-slate-300">Floods</span>
          </span>
        </div>
      </div>

      {/* Visual Bar Timeline Grid with Calibrated Y-Axis Scale */}
      <div className="bg-ink-950/80 border border-ink-800 rounded-lg p-4 sm:p-6 space-y-4">
        {/* Y-Axis Label */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
          <span>Scale: Displaced Individuals (Millions)</span>
          <span>Zero-Baseline Integrity Preserved</span>
        </div>

        <div className="relative flex items-end gap-3 min-h-[240px] pt-4 border-b border-ink-800 pb-2">
          {/* Y-Axis Tick Labels & Horizontal Guide Lines */}
          <div className="flex flex-col justify-between h-[180px] w-12 text-right pr-2 text-[10px] font-mono text-slate-400 select-none pb-0.5 border-r border-ink-800">
            {yTicks
              .slice()
              .reverse()
              .map((tick) => (
                <div key={tick} className="relative leading-none">
                  <span>{(tick / 1000000).toFixed(0)}M</span>
                  <div
                    className="absolute left-12 right-[-500px] border-b border-dashed border-ink-800 pointer-events-none opacity-40"
                    style={{ top: "50%" }}
                  />
                </div>
              ))}
            <span className="text-slate-400">0M</span>
          </div>

          {/* Stacked Bars Columns */}
          <div className="flex-1 grid grid-cols-5 gap-2 sm:gap-4 items-end h-[220px]">
            {timeline.map((pt) => {
              const isSelected = selectedPoint?.round === pt.round;
              const conflictH = (pt.conflict / maxCaseload) * 180;
              const droughtH = (pt.drought / maxCaseload) * 180;
              const floodsH = (pt.floods / maxCaseload) * 180;

              return (
                <button
                  key={pt.round}
                  type="button"
                  onClick={() => setSelectedPoint(pt)}
                  className={`flex flex-col items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none rounded transition-transform duration-200 ${
                    isSelected ? "scale-105" : "opacity-85 hover:opacity-100"
                  }`}
                  aria-label={`${pt.round} (${pt.date}): Total ${formatNumber(pt.total)} IDPs`}
                >
                  {/* Total label */}
                  <span className="text-[11px] font-mono text-slate-200 group-hover:text-amber-400 font-semibold">
                    {(pt.total / 1000000).toFixed(2)}M
                  </span>

                  {/* Stacked Bar with Zero Baseline */}
                  <div
                    className={`w-full max-w-[48px] rounded flex flex-col justify-end overflow-hidden transition-all duration-200 border ${
                      isSelected
                        ? "ring-2 ring-amber-400 border-amber-400 shadow-md shadow-amber-950"
                        : "border-transparent group-hover:border-ink-600 bg-ink-900/60"
                    }`}
                    style={{ height: "180px" }}
                  >
                    <div
                      style={{ height: `${floodsH}px` }}
                      className="w-full bg-blue-500/90 transition-all duration-300"
                      title={`Floods: ${formatNumber(pt.floods)}`}
                    />
                    <div
                      style={{ height: `${droughtH}px` }}
                      className="w-full bg-orange-500/90 transition-all duration-300"
                      title={`Drought: ${formatNumber(pt.drought)}`}
                    />
                    <div
                      style={{ height: `${conflictH}px` }}
                      className="w-full bg-red-500/90 transition-all duration-300"
                      title={`Conflict: ${formatNumber(pt.conflict)}`}
                    />
                  </div>

                  {/* Round Date Label */}
                  <div className="text-center pt-1">
                    <div className="text-xs font-semibold text-slate-200">{pt.date}</div>
                    <div className="text-[10px] font-mono text-slate-400">{pt.round}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Milestone Context Callout */}
        {selectedPoint && (
          <div className="bg-ink-900 border border-ink-800 rounded-md p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Info className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {selectedPoint.round} ({selectedPoint.date}):
                  </span>
                  <span className="text-xs font-semibold text-slate-100">
                    {selectedPoint.milestone}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Total documented IDPs:{" "}
                  <strong className="text-slate-200">{formatNumber(selectedPoint.total)}</strong>.
                  Conflict accounted for {formatNumber(selectedPoint.conflict)} (
                  {Math.round((selectedPoint.conflict / selectedPoint.total) * 100)}%), while drought accounted for{" "}
                  {formatNumber(selectedPoint.drought)} (
                  {Math.round((selectedPoint.drought / selectedPoint.total) * 100)}%).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-ink-950 px-3 py-1.5 rounded border border-ink-800 self-start sm:self-auto">
              <span>Conflict: <strong className="text-red-400">{(selectedPoint.conflict / 1000000).toFixed(2)}M</strong></span>
              <span>•</span>
              <span>Drought: <strong className="text-orange-400">{(selectedPoint.drought / 1000000).toFixed(2)}M</strong></span>
              <span>•</span>
              <span>Floods: <strong className="text-blue-400">{(selectedPoint.floods / 1000).toFixed(0)}k</strong></span>
            </div>
          </div>
        )}

        {/* Historical Assessment Stale-Data Indicator for Past Rounds */}
        {selectedPoint && selectedPoint.round !== "Round 37" && (
          <StaleDataIndicator
            reportingDate={selectedPoint.date}
            round={selectedPoint.round}
            sourceName="IOM DTM Site Assessment"
            mode="banner"
            onResetBaseline={() => setSelectedPoint(timeline[timeline.length - 1])}
          />
        )}
      </div>

      {/* Screen Reader Accessible Table */}
      <table className="sr-only">
        <caption>Temporal internal displacement trends by primary driver (2021–2024)</caption>
        <thead>
          <tr>
            <th scope="col">Round</th>
            <th scope="col">Date</th>
            <th scope="col">Conflict IDPs</th>
            <th scope="col">Drought IDPs</th>
            <th scope="col">Flood IDPs</th>
            <th scope="col">Total Documented</th>
            <th scope="col">Milestone Event</th>
          </tr>
        </thead>
        <tbody>
          {timeline.map((t) => (
            <tr key={t.round}>
              <td>{t.round}</td>
              <td>{t.date}</td>
              <td>{t.conflict}</td>
              <td>{t.drought}</td>
              <td>{t.floods}</td>
              <td>{t.total}</td>
              <td>{t.milestone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
