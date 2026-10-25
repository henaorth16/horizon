"use client";

import React, { useState, useMemo } from "react";
import type { FlowDataset, FlowLink } from "@/lib/geo/flowData";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, ArrowUpDown, ShieldCheck, Database } from "lucide-react";
import { EmptyState } from "@/components/charts/EmptyState";

export interface FlowDataTableProps {
  dataset: FlowDataset;
  activeDriverFilter?: string;
  minVolumeThreshold?: number;
  className?: string;
}

export function FlowDataTable({
  dataset,
  activeDriverFilter = "all",
  minVolumeThreshold = 0,
  className,
}: FlowDataTableProps) {
  const [sortBy, setSortBy] = useState<"volume" | "sourceName" | "targetName">("volume");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Filter links
  const filteredLinks = useMemo(() => {
    return dataset.links.filter((l) => {
      if (activeDriverFilter !== "all" && l.driver !== activeDriverFilter) return false;
      if (l.volume < minVolumeThreshold) return false;
      return true;
    });
  }, [dataset.links, activeDriverFilter, minVolumeThreshold]);

  // Sort links
  const sortedLinks = useMemo(() => {
    return [...filteredLinks].sort((a, b) => {
      const dir = sortDirection === "desc" ? -1 : 1;
      if (sortBy === "volume") {
        return (a.volume - b.volume) * dir;
      }
      if (sortBy === "sourceName") {
        return a.sourceName.localeCompare(b.sourceName) * dir;
      }
      if (sortBy === "targetName") {
        return a.targetName.localeCompare(b.targetName) * dir;
      }
      return 0;
    });
  }, [filteredLinks, sortBy, sortDirection]);

  const totalVolume = useMemo(() => {
    return sortedLinks.reduce((sum, l) => sum + l.volume, 0);
  }, [sortedLinks]);

  const toggleSort = (field: "volume" | "sourceName" | "targetName") => {
    if (sortBy === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  return (
    <div className={`space-y-3 rounded-lg border border-ink-700 bg-ink-900/80 p-5 ${className || ""}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-800 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-0.5">
            <Database className="h-3.5 w-3.5" />
            <span>Synchronized Accessible Data Table</span>
          </div>
          <h4 className="text-base font-bold text-slate-100">
            {dataset.title} — Tabular Pathways
          </h4>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Total Filtered Volume:</span>
          <strong className="text-cyan-400 font-bold">{formatNumber(totalVolume)}</strong>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-md border border-ink-800 bg-ink-950/60">
        <table className="w-full text-left text-xs font-mono text-slate-300">
          <thead className="bg-ink-900/90 text-[11px] text-slate-400 uppercase border-b border-ink-800">
            <tr>
              <th
                scope="col"
                role="columnheader"
                tabIndex={0}
                aria-sort={sortBy === "sourceName" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                className="p-3 cursor-pointer hover:text-slate-100 rounded focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                onClick={() => toggleSort("sourceName")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleSort("sourceName");
                  }
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span>Origin / Departure</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                scope="col"
                role="columnheader"
                tabIndex={0}
                aria-sort={sortBy === "targetName" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                className="p-3 cursor-pointer hover:text-slate-100 rounded focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                onClick={() => toggleSort("targetName")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleSort("targetName");
                  }
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span>Target Destination</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                scope="col"
                role="columnheader"
                tabIndex={0}
                aria-sort={sortBy === "volume" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                className="p-3 text-right cursor-pointer hover:text-slate-100 rounded focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                onClick={() => toggleSort("volume")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleSort("volume");
                  }
                }}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Individuals</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th scope="col" className="p-3 text-right">Share (%)</th>
              <th scope="col" className="p-3">Primary Trigger</th>
              <th scope="col" className="p-3">Corridor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800/60">
            {sortedLinks.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4">
                  <EmptyState
                    title="No Matching Flow Records"
                    description="No origin-destination pathways match the selected driver category or volume cutoff."
                    suggestions={[
                      "Adjust the minimum volume filter",
                      "Select 'All Drivers' to see all displacement categories",
                    ]}
                  />
                </td>
              </tr>
            ) : (
              sortedLinks.map((link) => {
              const share = totalVolume > 0 ? Math.round((link.volume / totalVolume) * 1000) / 10 : 0;
              const isDiffuse = link.isDiffuseOrigin || link.isDiffuseDestination;

              return (
                <tr key={link.id} className="hover:bg-ink-900/40 transition-colors">
                  <td className="p-3 font-semibold text-slate-200">
                    <div className="flex items-center gap-1.5">
                      {link.isDiffuseOrigin && <AlertTriangle className="h-3 w-3 text-amber-400 flex-shrink-0" />}
                      <span>{link.sourceName}</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      {link.isDiffuseDestination && <AlertTriangle className="h-3 w-3 text-amber-400 flex-shrink-0" />}
                      <span>{link.targetName}</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-100">
                    {formatNumber(link.volume)}
                  </td>
                  <td className="p-3 text-right text-cyan-400">
                    {share}%
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={
                        link.driver === "conflict"
                          ? "terracotta"
                          : link.driver === "drought"
                          ? "ochre"
                          : "cyan"
                      }
                      size="sm"
                    >
                      {link.driver}
                    </Badge>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px]">
                    {link.corridorName || "Direct Pathway"}
                  </td>
                </tr>
              );
            })
            )}
          </tbody>
          <tfoot className="bg-ink-900/90 font-bold border-t border-ink-800 text-slate-200">
            <tr>
              <td colSpan={2} className="p-3">Total Verified Pathways</td>
              <td className="p-3 text-right text-cyan-400">{formatNumber(totalVolume)}</td>
              <td className="p-3 text-right">100%</td>
              <td colSpan={2} className="p-3 text-slate-500 font-normal text-[10px]">
                Source: {dataset.citation}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
