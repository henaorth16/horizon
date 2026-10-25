"use client";

import React from "react";
import type { VulnerabilityMetricItem, DemographicProfile } from "@/lib/db/types";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatNumber } from "@/lib/utils";
import { ShieldAlert, Users, HeartHandshake, Baby, Home, Activity } from "lucide-react";
import { EmptyState } from "@/components/charts/EmptyState";

export interface CompositionBarChartProps {
  metrics: VulnerabilityMetricItem[];
  profile?: DemographicProfile;
  className?: string;
}

export function CompositionBarChart({ metrics, profile, className }: CompositionBarChartProps) {
  // Compute broad life-stage composition from profile cohorts if available
  const childrenPct = profile?.cohorts
    ? Math.round(
        profile.cohorts
          .filter((c) => ["0-4", "5-11", "12-17"].includes(c.ageGroup))
          .reduce((sum, c) => sum + c.malePct + c.femalePct, 0) * 10
      ) / 10
    : 56.7;

  const adultsPct = profile?.cohorts
    ? Math.round(
        profile.cohorts
          .filter((c) => c.ageGroup === "18-59")
          .reduce((sum, c) => sum + c.malePct + c.femalePct, 0) * 10
      ) / 10
    : 40.8;

  const elderlyPct = profile?.cohorts
    ? Math.round(
        profile.cohorts
          .filter((c) => c.ageGroup === "60+")
          .reduce((sum, c) => sum + c.malePct + c.femalePct, 0) * 10
      ) / 10
    : 2.5;

  return (
    <div className={`space-y-5 rounded-lg border border-ink-700 bg-ink-900/80 p-5 ${className || ""}`}>
      {/* Header */}
      <div className="border-b border-ink-800 pb-3">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-500 uppercase tracking-wider mb-1">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Vulnerability & Household Structure</span>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-100">
          Population Composition & Critical Vulnerabilities
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Proportions of dependent cohorts, female-headed families, and acute protection profiles.
        </p>
      </div>

      {/* Segmented Macro Age Cohort Bar */}
      <div className="space-y-2 rounded-lg bg-ink-950/60 p-4 border border-ink-800">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-semibold uppercase tracking-wider">
            Broad Life-Stage Composition
          </span>
          <span className="text-slate-400">Total: 100%</span>
        </div>

        {/* Stacked Progress Bar */}
        <div
          role="img"
          aria-label={`Population life-stage composition: Children ${childrenPct}%, Working-age adults ${adultsPct}%, Elderly ${elderlyPct}%`}
          className="flex h-5 w-full overflow-hidden rounded bg-ink-900 border border-ink-800"
        >
          <div
            style={{ width: `${childrenPct}%` }}
            className="bg-amber-500 hover:bg-amber-400 transition-colors flex items-center justify-center text-[10px] font-mono font-bold text-ink-950"
            title={`Children (0–17): ${childrenPct}%`}
          >
            {childrenPct >= 15 ? `${childrenPct}%` : ""}
          </div>
          <div
            style={{ width: `${adultsPct}%` }}
            className="bg-sky-600 hover:bg-sky-500 transition-colors flex items-center justify-center text-[10px] font-mono font-bold text-white"
            title={`Working-Age Adults (18–59): ${adultsPct}%`}
          >
            {adultsPct >= 15 ? `${adultsPct}%` : ""}
          </div>
          <div
            style={{ width: `${elderlyPct}%` }}
            className="bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center text-[10px] font-mono font-bold text-white"
            title={`Elderly (60+): ${elderlyPct}%`}
          >
            {elderlyPct >= 5 ? `${elderlyPct}%` : ""}
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-amber-500" />
            <span className="text-slate-300">Children (&lt;18):</span>
            <strong className="text-amber-400">{childrenPct}%</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-sky-600" />
            <span className="text-slate-300">Adults (18–59):</span>
            <strong className="text-sky-400">{adultsPct}%</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-emerald-600" />
            <span className="text-slate-300">Elderly (60+):</span>
            <strong className="text-emerald-400">{elderlyPct}%</strong>
          </div>
        </div>
      </div>

      {/* Vulnerability Benchmark Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Documented Protection Benchmarks (Non-Additive)
        </h4>

        {metrics.length === 0 ? (
          <EmptyState
            title="No Protection Benchmarks"
            description="Household vulnerability indicators are not enumerated for this target sample."
            suggestions={[
              "Select National Overview to review consolidated vulnerability benchmarks",
              "Check individual cluster assessments for targeted protection indicators",
            ]}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {metrics.map((m) => {
              const Icon =
                m.category === "household"
                  ? Home
                  : m.category === "child"
                  ? Baby
                  : m.category === "disability"
                  ? Activity
                  : HeartHandshake;

              return (
                <Card key={m.id} className="bg-ink-950/70 border-ink-800 hover:border-ink-700 transition-colors">
                  <CardContent className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 text-amber-400" />
                        {m.category}
                      </span>
                      <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                        {m.value}
                      </Badge>
                    </div>

                    <div>
                      <h5 className="text-sm font-semibold text-slate-100">{m.label}</h5>
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-ink-900 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{ width: `${Math.min(100, m.rawPercentage)}%` }}
                        />
                      </div>
                    </div>

                    {m.notes && <p className="text-[11px] text-slate-400 leading-normal">{m.notes}</p>}

                    <div className="pt-1 text-[10px] font-mono text-slate-500 truncate">
                      Source: {m.source}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Screen reader table for broad life-stage composition */}
      <table className="sr-only" aria-label="Broad life-stage demographic composition">
        <caption>Life-stage percentage distribution of affected population</caption>
        <thead>
          <tr>
            <th scope="col">Age Cohort</th>
            <th scope="col">Percentage Share</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Children (0–17)</th>
            <td>{childrenPct}%</td>
          </tr>
          <tr>
            <th scope="row">Working-Age Adults (18–59)</th>
            <td>{adultsPct}%</td>
          </tr>
          <tr>
            <th scope="row">Elderly (60+)</th>
            <td>{elderlyPct}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
