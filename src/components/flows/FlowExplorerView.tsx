"use client";

import React, { useState } from "react";
import {
  REFUGEE_INFLOW_DATASET,
  INTERNAL_DISPLACEMENT_FLOW_DATASET,
  OUTFLOW_MIGRATION_FLOW_DATASET,
  type FlowDataset,
} from "@/lib/geo/flowData";
import { SankeyDiagram } from "./SankeyDiagram";
import { FlowDataTable } from "./FlowDataTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PartialDataNotice } from "@/components/ui/PartialDataNotice";
import { formatNumber } from "@/lib/utils";
import {
  ArrowRightLeft,
  Table as TableIcon,
  GitCommit,
  Filter,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  BookOpen,
} from "lucide-react";

export interface FlowExplorerViewProps {
  initialDatasetId?: "refugee_inflows" | "internal_displacement_flows" | "outflow_migration_flows";
  className?: string;
}

export function FlowExplorerView({
  initialDatasetId = "refugee_inflows",
  className,
}: FlowExplorerViewProps) {
  // Active dataset
  const [datasetId, setDatasetId] = useState<string>(initialDatasetId);
  // View mode: Visual Sankey Diagram vs Synchronized Table
  const [viewMode, setViewMode] = useState<"sankey" | "table">("sankey");
  // Filters
  const [driverFilter, setDriverFilter] = useState<string>("all");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const activeDataset: FlowDataset =
    datasetId === "internal_displacement_flows"
      ? INTERNAL_DISPLACEMENT_FLOW_DATASET
      : datasetId === "outflow_migration_flows"
      ? OUTFLOW_MIGRATION_FLOW_DATASET
      : REFUGEE_INFLOW_DATASET;

  // Compute summary stats
  const totalVolume = activeDataset.links.reduce((sum, l) => sum + l.volume, 0);
  const diffuseVolume = activeDataset.links
    .filter((l) => l.isDiffuseOrigin || l.isDiffuseDestination)
    .reduce((sum, l) => sum + l.volume, 0);

  const diffuseShare = totalVolume > 0 ? Math.round((diffuseVolume / totalVolume) * 1000) / 10 : 0;

  // Largest single pathway
  const largestLink = [...activeDataset.links].sort((a, b) => b.volume - a.volume)[0];

  return (
    <div className={`space-y-6 ${className || ""}`}>
      {/* Top Filter and Dataset Selection Toolbar */}
      <div className="rounded-lg border border-ink-700 bg-ink-900/90 p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span>Pathways & Flow Controls</span>
          </div>

          {/* View Mode Toggle: Visual Sankey vs Synchronized Table */}
          <div className="flex items-center rounded-md bg-ink-950 p-1 border border-ink-800 text-xs font-mono" role="group" aria-label="View format toggle">
            <button
              type="button"
              onClick={() => setViewMode("sankey")}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                viewMode === "sankey"
                  ? "bg-cyan-500/20 text-cyan-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <GitCommit className="h-3.5 w-3.5" />
              <span>Sankey Diagram</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                viewMode === "table"
                  ? "bg-ink-800 text-slate-100 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Synchronized Table</span>
            </button>
          </div>
        </div>

        {/* Dataset Switcher and Driver Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Dataset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono" role="group" aria-label="Migration flow dataset selection">
            <button
              type="button"
              onClick={() => {
                setDatasetId("refugee_inflows");
                setDriverFilter("all");
                setSelectedNodeId(null);
              }}
              className={`px-3 py-1.5 rounded transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                datasetId === "refugee_inflows"
                  ? "bg-cyan-500/20 text-cyan-400 font-semibold border border-cyan-500/40"
                  : "bg-ink-950 text-slate-400 hover:text-slate-200 border border-ink-800"
              }`}
            >
              Cross-Border Refugee Inflows (UNHCR)
            </button>
            <button
              type="button"
              onClick={() => {
                setDatasetId("internal_displacement_flows");
                setDriverFilter("all");
                setSelectedNodeId(null);
              }}
              className={`px-3 py-1.5 rounded transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                datasetId === "internal_displacement_flows"
                  ? "bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/40"
                  : "bg-ink-950 text-slate-400 hover:text-slate-200 border border-ink-800"
              }`}
            >
              Internal Displacement Corridors (IOM DTM)
            </button>
            <button
              type="button"
              onClick={() => {
                setDatasetId("outflow_migration_flows");
                setDriverFilter("all");
                setSelectedNodeId(null);
              }}
              className={`px-3 py-1.5 rounded transition-colors focus-visible:ring-2 focus-visible:ring-terracotta-400 focus-visible:outline-none ${
                datasetId === "outflow_migration_flows"
                  ? "bg-terracotta-500/20 text-terracotta-400 font-semibold border border-terracotta-500/40"
                  : "bg-ink-950 text-slate-400 hover:text-slate-200 border border-ink-800"
              }`}
            >
              Irregular Outflows (IOM MMC)
            </button>
          </div>

          {/* Trigger Driver Filter */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400 uppercase text-[10px] font-semibold">Filter Driver:</span>
            <select
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
              aria-label="Filter flows by displacement driver"
              className="rounded-md border border-ink-800 bg-ink-950 px-2.5 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <option value="all">All Drivers</option>
              <option value="conflict">Conflict & Insecurity</option>
              <option value="drought">Drought & Climate</option>
              <option value="economic_asylum">Economic & Asylum</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-t-2 border-t-cyan-500 bg-ink-900/80">
          <CardHeader className="p-4 pb-1">
            <span className="text-[11px] font-mono uppercase text-slate-400">Total Monitored Movement</span>
            <CardTitle className="text-2xl font-bold font-mono text-cyan-400">
              {formatNumber(totalVolume)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-slate-400">
            Across {activeDataset.links.length} verified origin-destination corridors
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-amber-500 bg-ink-900/80">
          <CardHeader className="p-4 pb-1">
            <span className="text-[11px] font-mono uppercase text-slate-400">Largest Single Pathway</span>
            <CardTitle className="text-xl font-bold font-mono text-amber-400 truncate">
              {largestLink?.sourceName} → {largestLink?.targetName}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-slate-400">
            {formatNumber(largestLink?.volume || 0)} individuals ({largestLink?.driver})
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-slate-500 bg-ink-900/80">
          <CardHeader className="p-4 pb-1">
            <span className="text-[11px] font-mono uppercase text-slate-400">Diffuse / Unrecorded Volume</span>
            <CardTitle className="text-2xl font-bold font-mono text-slate-300">
              {formatNumber(diffuseVolume)} ({diffuseShare}%)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-slate-400">
            Honest labeling of rapid assessments without corroborated origin woredas
          </CardContent>
        </Card>
      </div>

      {/* Partial Data Notice when cross-filtered by trigger */}
      {driverFilter !== "all" && (
        <PartialDataNotice
          title={`Flow Driver Subset: ${driverFilter.toUpperCase()}`}
          reason={`Displaying only displacement and migration pathways where the corroborated primary trigger is '${driverFilter}'. Corridors triggered by alternative or mixed drivers are excluded.`}
          severity="info"
          citation={activeDataset.citation}
        />
      )}

      {/* Main View: Visual Sankey Diagram vs Synchronized Table */}
      {viewMode === "sankey" ? (
        <SankeyDiagram
          dataset={activeDataset}
          activeDriverFilter={driverFilter}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
        />
      ) : (
        <FlowDataTable dataset={activeDataset} activeDriverFilter={driverFilter} />
      )}

      {/* Methodology Documentation Callout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-ink-800 bg-ink-950/70 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-cyan-400 flex-shrink-0" />
          <span>
            Documentation: Learn how flow ribbons, volume scaling, and diffuse origin classifications are modeled.
          </span>
        </div>
        <a
          href="/methodology#flow-aggregation"
          className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 flex-shrink-0"
        >
          Read Aggregation Algorithms Spec →
        </a>
      </div>
    </div>
  );
}
