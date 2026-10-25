"use client";

import React from "react";
import { MIGRATION_CORRIDORS, type MigrationCorridor } from "@/lib/geo/migrationData";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Navigation2, AlertOctagon, ShieldAlert, ArrowRight } from "lucide-react";

export interface CorridorCardListProps {
  selectedCorridorId?: string;
  onSelectCorridor?: (corridorId: string) => void;
  className?: string;
}

export function CorridorCardList({
  selectedCorridorId,
  onSelectCorridor,
  className,
}: CorridorCardListProps) {
  return (
    <div className={`space-y-3 ${className || ""}`}>
      <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
        <Navigation2 className="h-3.5 w-3.5" />
        <span>Major Horn of Africa Transit Corridors</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MIGRATION_CORRIDORS.map((c) => {
          const isSelected = selectedCorridorId === c.id;

          return (
            <Card
              key={c.id}
              role="button"
              tabIndex={0}
              aria-label={`${c.name} (${c.routeType}): ${c.annualEstimatedVolume} estimated annual flow, ${c.riskRating} risk level`}
              onClick={() => onSelectCorridor?.(c.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectCorridor?.(c.id);
                }
              }}
              className={`transition-all cursor-pointer border focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                isSelected
                  ? "border-cyan-500 bg-ink-950 ring-1 ring-cyan-500/50 shadow-xl"
                  : "border-ink-800 bg-ink-900/80 hover:border-ink-700 hover:bg-ink-900"
              }`}
            >
              <CardHeader className="p-4 pb-2 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Badge
                    variant={
                      c.routeType === "Eastern Route"
                        ? "ochre"
                        : c.routeType === "Southern Route"
                        ? "sage"
                        : "terracotta"
                    }
                    size="sm"
                    className="font-mono text-[10px]"
                  >
                    {c.status}
                  </Badge>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      c.riskRating === "Extreme"
                        ? "text-red-400 bg-red-950/40 border-red-900/40"
                        : "text-amber-400 bg-amber-950/40 border-amber-900/40"
                    }`}
                  >
                    <AlertOctagon className="h-2.5 w-2.5" />
                    <span>{c.riskRating} Risk</span>
                  </span>
                </div>

                <CardTitle className="text-sm font-bold text-slate-100">{c.name}</CardTitle>
              </CardHeader>

              <CardContent className="p-4 pt-1 space-y-2.5 text-xs">
                <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-3">
                  {c.description}
                </p>

                <div className="space-y-1.5 pt-1 border-t border-ink-800/80 font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Est. Annual Flow:</span>
                    <span className="text-slate-200 font-semibold">{c.annualEstimatedVolume}</span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500">Key Hubs:</span>
                    <span className="text-slate-300 text-right truncate max-w-[160px]">
                      {c.transitHubs.slice(0, 3).join(" • ")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
