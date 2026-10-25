"use client";

import React, { useState } from "react";
import { scaleLinear } from "d3-scale";
import type { DemographicProfile, DemographicAgeSexCohort } from "@/lib/db/types";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { ChartTooltipOverlay } from "@/components/charts/ChartTooltipOverlay";
import { EmptyState } from "@/components/charts/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatNumber } from "@/lib/utils";
import { Users, AlertTriangle, ShieldCheck, Calendar, Info } from "lucide-react";

export interface PopulationPyramidProps {
  profile: DemographicProfile;
  className?: string;
}

export function PopulationPyramid({ profile, className }: PopulationPyramidProps) {
  const [hoveredCohort, setHoveredCohort] = useState<{
    ageGroup: string;
    sex: "male" | "female";
    count: number;
    pct: number;
    x: number;
    y: number;
  } | null>(null);

  // Missing Breakdown Fallback
  if (!profile.hasDemographicBreakdown) {
    return (
      <div
        className={`rounded-lg border border-dashed border-ink-600 bg-ink-950/60 p-8 text-center space-y-4 ${
          className || ""
        }`}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1.5 max-w-lg mx-auto">
          <Badge variant="ochre" size="sm" className="font-mono">
            Breakdown Suppressed / Unassessed
          </Badge>
          <h3 className="text-base font-bold text-slate-100">
            Demographic Breakdown Unavailable for {profile.locationName}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {profile.missingReason ||
              "Field assessments for this specific location or assessment round recorded aggregate caseloads without full age-sex household enumerations."}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded bg-ink-900 px-3 py-1.5 text-xs text-slate-400 border border-ink-800">
          <Info className="h-3.5 w-3.5 text-slate-400" />
          <span>Source Standard: Incomplete site surveys are never synthetically imputed.</span>
        </div>
      </div>
    );
  }

  // Empty Cohorts Fallback
  if (!profile || !profile.cohorts || profile.cohorts.length === 0) {
    return (
      <EmptyState
        title="No Demographic Cohort Data"
        description={`No age and sex demographic cohort records are available for ${
          profile?.locationName || "this location"
        }.`}
        suggestions={[
          "Select a different administrative region or national overview",
          "Toggle between IDP and Refugee population profiles",
          "Verify that demographic breakdown datasets are loaded",
        ]}
      />
    );
  }

  // Determine max percentage for symmetrical scale
  const maxPct = Math.max(
    ...profile.cohorts.map((c) => Math.max(c.malePct, c.femalePct)),
    15
  );

  return (
    <div className={`space-y-4 rounded-lg border border-ink-700 bg-ink-900/80 p-5 ${className || ""}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <Users className="h-3.5 w-3.5" />
            <span>Age & Sex Disaggregation</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-100">
            Population Pyramid: {profile.locationName}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Preserved source cohorts for {profile.populationType.toUpperCase()} population (Sample:{" "}
            {formatNumber(profile.totalSample)} individuals).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={profile.populationType === "refugee" ? "cyan" : "ochre"}
            size="sm"
            className="font-mono"
          >
            {profile.populationType === "refugee" ? "UNHCR Mandate" : "IOM DTM Mandate"}
          </Badge>
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-ink-950 px-2.5 py-1 rounded border border-ink-800">
            <Calendar className="h-3 w-3 text-slate-500" />
            <span>{profile.reportingDate}</span>
          </div>
        </div>
      </div>

      {/* Sex Balance Header */}
      <div className="grid grid-cols-2 gap-4 text-xs font-mono border-b border-ink-800/60 pb-3">
        <div className="flex items-center justify-between bg-ink-950/70 p-2.5 rounded border border-sky-950/50">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-sky-500" />
            <span className="text-sky-300 font-semibold">Male</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-100 mr-1.5">{formatNumber(profile.maleTotal)}</span>
            <span className="text-sky-400">({profile.maleRatio}%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-ink-950/70 p-2.5 rounded border border-amber-950/50">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-amber-300 font-semibold">Female</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-100 mr-1.5">{formatNumber(profile.femaleTotal)}</span>
            <span className="text-amber-400">({profile.femaleRatio}%)</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative">
        <ChartContainer
          ariaLabel={`Population pyramid for ${profile.locationName}`}
          minHeight={320}
          margin={{ top: 20, right: 20, bottom: 35, left: 20 }}
        >
          {({ width, height, boundedWidth, boundedHeight, margin }) => {
            const centerGap = 64; // Space for age bracket labels
            const barHeight = Math.min(32, Math.floor((boundedHeight - 30) / profile.cohorts.length) - 6);
            const sideWidth = (boundedWidth - centerGap) / 2;
            const centerX = margin.left + sideWidth + centerGap / 2;

            // X Scales
            const scalePct = scaleLinear().domain([0, maxPct]).range([0, sideWidth]);

            // Grid tick values (e.g. 5%, 10%, 15%, 20%)
            const ticks = [5, 10, 15, 20].filter((t) => t <= maxPct);

            return (
              <>
                <svg
                  width={width}
                  height={height}
                  className="overflow-hidden select-none bg-ink-950/30 rounded-lg"
                  onMouseLeave={() => setHoveredCohort(null)}
                >
                  {/* Grid Lines */}
                  {ticks.map((t) => {
                    const leftX = centerX - centerGap / 2 - scalePct(t);
                    const rightX = centerX + centerGap / 2 + scalePct(t);

                    return (
                      <g key={t} opacity={0.35}>
                        {/* Left Male Tick */}
                        <line
                          x1={leftX}
                          x2={leftX}
                          y1={margin.top}
                          y2={margin.top + boundedHeight - 15}
                          stroke="#334155"
                          strokeDasharray="3 3"
                        />
                        <text
                          x={leftX}
                          y={margin.top + boundedHeight}
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize={10}
                          fontFamily="monospace"
                        >
                          {t}%
                        </text>

                        {/* Right Female Tick */}
                        <line
                          x1={rightX}
                          x2={rightX}
                          y1={margin.top}
                          y2={margin.top + boundedHeight - 15}
                          stroke="#334155"
                          strokeDasharray="3 3"
                        />
                        <text
                          x={rightX}
                          y={margin.top + boundedHeight}
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize={10}
                          fontFamily="monospace"
                        >
                          {t}%
                        </text>
                      </g>
                    );
                  })}

                  {/* Descriptive Bottom Axis Direction Labels */}
                  <g className="select-none">
                    <text
                      x={centerX - centerGap / 2 - sideWidth / 2}
                      y={margin.top + boundedHeight + 14}
                      textAnchor="middle"
                      fill="#426b66"
                      fontSize={9}
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      ← MALE SHARE (%)
                    </text>
                    <text
                      x={centerX}
                      y={margin.top + boundedHeight + 14}
                      textAnchor="middle"
                      fill="var(--slate-400)"
                      fontSize={9}
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      AGE COHORT
                    </text>
                    <text
                      x={centerX + centerGap / 2 + sideWidth / 2}
                      y={margin.top + boundedHeight + 14}
                      textAnchor="middle"
                      fill="#bc6c25"
                      fontSize={9}
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      FEMALE SHARE (%) →
                    </text>
                  </g>

                  {/* Cohort Bars (Rendered bottom to top: 60+ at top, 0-4 at bottom) */}
                  {[...profile.cohorts].reverse().map((cohort, idx) => {
                    const y = margin.top + idx * (barHeight + 8);
                    const maleBarWidth = scalePct(cohort.malePct);
                    const femaleBarWidth = scalePct(cohort.femalePct);

                    const maleX = centerX - centerGap / 2 - maleBarWidth;
                    const femaleX = centerX + centerGap / 2;

                    return (
                      <g key={cohort.ageGroup} className="group">
                        {/* Male Bar (Leftward) */}
                        <rect
                          x={maleX}
                          y={y}
                          width={maleBarWidth}
                          height={barHeight}
                          rx={3}
                          fill="#426b66"
                          className="transition-all hover:opacity-85 cursor-pointer outline-none focus-visible:stroke-white focus-visible:stroke-2"
                          tabIndex={0}
                          role="img"
                          aria-label={`Male age ${cohort.ageGroup}: ${formatNumber(cohort.male)} (${
                            cohort.malePct
                          }%)`}
                          onFocus={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredCohort({
                              ageGroup: cohort.ageGroup,
                              sex: "male",
                              count: cohort.male,
                              pct: cohort.malePct,
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                          }}
                          onBlur={() => setHoveredCohort(null)}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredCohort({
                              ageGroup: cohort.ageGroup,
                              sex: "male",
                              count: cohort.male,
                              pct: cohort.malePct,
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                          }}
                        />

                        {/* Male Value Label */}
                        <text
                          x={maleX - 6}
                          y={y + barHeight / 2 + 3}
                          textAnchor="end"
                          fill="#94a3b8"
                          fontSize={10}
                          fontFamily="monospace"
                        >
                          {cohort.malePct}%
                        </text>

                        {/* Center Age Label */}
                        <g transform={`translate(${centerX}, ${y + barHeight / 2})`}>
                          <rect
                            x={-24}
                            y={-9}
                            width={48}
                            height={18}
                            rx={4}
                            fill="var(--ink-850)"
                            stroke="var(--ink-700)"
                            strokeWidth={1}
                          />
                          <text
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="var(--slate-100)"
                            fontSize={10}
                            fontFamily="monospace"
                            fontWeight="600"
                          >
                            {cohort.ageGroup}
                          </text>
                        </g>

                        {/* Female Bar (Rightward) */}
                        <rect
                          x={femaleX}
                          y={y}
                          width={femaleBarWidth}
                          height={barHeight}
                          rx={3}
                          fill="#bc6c25"
                          className="transition-all hover:opacity-85 cursor-pointer outline-none focus-visible:stroke-white focus-visible:stroke-2"
                          tabIndex={0}
                          role="img"
                          aria-label={`Female age ${cohort.ageGroup}: ${formatNumber(cohort.female)} (${
                            cohort.femalePct
                          }%)`}
                          onFocus={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredCohort({
                              ageGroup: cohort.ageGroup,
                              sex: "female",
                              count: cohort.female,
                              pct: cohort.femalePct,
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                          }}
                          onBlur={() => setHoveredCohort(null)}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredCohort({
                              ageGroup: cohort.ageGroup,
                              sex: "female",
                              count: cohort.female,
                              pct: cohort.femalePct,
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                          }}
                        />

                        {/* Female Value Label */}
                        <text
                          x={femaleX + femaleBarWidth + 6}
                          y={y + barHeight / 2 + 3}
                          textAnchor="start"
                          fill="#94a3b8"
                          fontSize={10}
                          fontFamily="monospace"
                        >
                          {cohort.femalePct}%
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Tooltip Overlay */}
                {hoveredCohort && (
                  <ChartTooltipOverlay
                    x={boundedWidth / 2}
                    y={10}
                    containerWidth={width}
                    containerHeight={height}
                    visible={hoveredCohort !== null}
                    title={`Age Cohort ${hoveredCohort.ageGroup} (${
                      hoveredCohort.sex === "male" ? "Male" : "Female"
                    })`}
                    source={profile.citation}
                    referenceDate={profile.reportingDate}
                  >
                    <div className="space-y-1 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Estimated Stock:</span>
                        <strong className="text-slate-100">{formatNumber(hoveredCohort.count)}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Cohort Proportion:</span>
                        <strong
                          className={hoveredCohort.sex === "male" ? "text-sky-400" : "text-amber-400"}
                        >
                          {hoveredCohort.pct}%
                        </strong>
                      </div>
                    </div>
                  </ChartTooltipOverlay>
                )}
              </>
            );
          }}
        </ChartContainer>
      </div>

      {/* Editorial Footer Citation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-ink-800 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Citation: {profile.citation}</span>
        </div>
        <div>License: {profile.license}</div>
      </div>

      {/* Screen Reader Accessible Table */}
      <table className="sr-only" aria-label={`Age and sex population table for ${profile.locationName}`}>
        <caption>
          Demographic age and sex distribution for {profile.populationType} population in {profile.locationName}
        </caption>
        <thead>
          <tr>
            <th scope="col">Age Bracket</th>
            <th scope="col">Male (Count)</th>
            <th scope="col">Male (%)</th>
            <th scope="col">Female (Count)</th>
            <th scope="col">Female (%)</th>
            <th scope="col">Total Cohort</th>
          </tr>
        </thead>
        <tbody>
          {profile.cohorts.map((c) => (
            <tr key={c.ageGroup}>
              <th scope="row">{c.ageGroup}</th>
              <td>{c.male.toLocaleString()}</td>
              <td>{c.malePct}%</td>
              <td>{c.female.toLocaleString()}</td>
              <td>{c.femalePct}%</td>
              <td>{c.total.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
