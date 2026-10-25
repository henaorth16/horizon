import React from "react";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

export interface ChartSkeletonProps {
  title?: string;
  minHeight?: number;
  className?: string;
}

export function ChartSkeleton({
  title = "Loading visualization...",
  minHeight = 300,
  className,
}: ChartSkeletonProps) {
  return (
    <div
      role="status"
      aria-label={title}
      className={cn(
        "space-y-4 rounded-lg border border-ink-800 bg-ink-900/80 p-5",
        className
      )}
      style={{ minHeight: `${minHeight}px` }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-800 pb-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32 bg-ink-800" />
          <Skeleton className="h-5 w-64 bg-ink-800" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-7 w-20 bg-ink-800" />
          <Skeleton className="h-7 w-20 bg-ink-800" />
        </div>
      </div>

      {/* Axis & Graph Pulse Layout */}
      <div className="relative pt-4 flex flex-col justify-between" style={{ height: `${minHeight - 110}px` }}>
        {/* Horizontal grid lines */}
        <div className="space-y-6 opacity-30">
          <div className="border-b border-dashed border-ink-700 w-full" />
          <div className="border-b border-dashed border-ink-700 w-full" />
          <div className="border-b border-dashed border-ink-700 w-full" />
        </div>

        {/* Vertical simulated bar columns */}
        <div className="flex items-end justify-around gap-2 px-6 h-36">
          <Skeleton className="h-16 w-10 sm:w-14 rounded-t bg-ink-800/90" />
          <Skeleton className="h-28 w-10 sm:w-14 rounded-t bg-amber-500/10 border-amber-500/20" />
          <Skeleton className="h-36 w-10 sm:w-14 rounded-t bg-ink-800/90" />
          <Skeleton className="h-24 w-10 sm:w-14 rounded-t bg-amber-500/10 border-amber-500/20" />
          <Skeleton className="h-32 w-10 sm:w-14 rounded-t bg-ink-800/90" />
        </div>

        {/* Bottom X-axis ticks */}
        <div className="flex justify-around px-6 pt-2 border-t border-ink-800">
          <Skeleton className="h-2.5 w-8 bg-ink-800" />
          <Skeleton className="h-2.5 w-8 bg-ink-800" />
          <Skeleton className="h-2.5 w-8 bg-ink-800" />
          <Skeleton className="h-2.5 w-8 bg-ink-800" />
          <Skeleton className="h-2.5 w-8 bg-ink-800" />
        </div>
      </div>
      <span className="sr-only">{title}</span>
    </div>
  );
}

export interface MapSkeletonProps {
  title?: string;
  minHeight?: number;
  className?: string;
}

export function MapSkeleton({
  title = "Loading administrative boundaries...",
  minHeight = 420,
  className,
}: MapSkeletonProps) {
  return (
    <div
      role="status"
      aria-label={title}
      className={cn(
        "relative rounded-lg border border-ink-800 bg-ink-950 p-6 flex flex-col justify-between overflow-hidden",
        className
      )}
      style={{ minHeight: `${minHeight}px` }}
    >
      {/* Top Header Placeholder */}
      <div className="flex items-center justify-between border-b border-ink-800 pb-3 z-10">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-52 bg-ink-800" />
          <Skeleton className="h-3 w-36 bg-ink-800/80" />
        </div>
        <Skeleton className="h-6 w-28 bg-ink-800 rounded-full" />
      </div>

      {/* Center Radar / Geographic Pulse */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="relative flex items-center justify-center">
          <span className="absolute h-32 w-32 rounded-full bg-amber-500/10 animate-ping opacity-30" />
          <span className="absolute h-20 w-20 rounded-full bg-amber-500/20 animate-pulse" />
          <span className="relative h-6 w-6 rounded-full bg-amber-400/80 flex items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-ink-950" />
          </span>
        </div>
        <p className="mt-4 text-xs font-mono text-slate-400">{title}</p>
      </div>

      {/* Controls & Legend Placeholders */}
      <div className="flex items-end justify-between pt-4 border-t border-ink-900 z-10">
        <div className="flex gap-1.5">
          <Skeleton className="h-8 w-8 rounded bg-ink-900 border border-ink-800" />
          <Skeleton className="h-8 w-8 rounded bg-ink-900 border border-ink-800" />
          <Skeleton className="h-8 w-8 rounded bg-ink-900 border border-ink-800" />
        </div>
        <Skeleton className="h-6 w-48 bg-ink-900 rounded border border-ink-800" />
      </div>
      <span className="sr-only">{title}</span>
    </div>
  );
}

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 5,
  className,
}: TableSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading tabular dataset..."
      className={cn("w-full space-y-3 rounded-lg border border-ink-800 bg-ink-950/80 p-4", className)}
    >
      {/* Table Header */}
      <div className="flex items-center justify-between gap-4 border-b border-ink-800 pb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 bg-ink-800/90" />
        ))}
      </div>

      {/* Table Rows */}
      <div className="space-y-3 pt-1">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center justify-between gap-4 py-1.5 border-b border-ink-900/60">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton
                key={c}
                className={cn(
                  "h-3.5 bg-ink-800/60",
                  c === 0 ? "w-28" : "flex-1"
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">Loading table records...</span>
    </div>
  );
}

export interface KpiGridSkeletonProps {
  count?: number;
  className?: string;
}

export function KpiGridSkeleton({ count = 3, className }: KpiGridSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading key indicators..."
      className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-ink-800 bg-ink-900/80 p-4 space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-28 bg-ink-800" />
            <Skeleton className="h-4 w-14 rounded-full bg-ink-800" />
          </div>
          <Skeleton className="h-8 w-36 bg-ink-800" />
          <Skeleton className="h-3 w-48 bg-ink-800/60" />
        </div>
      ))}
      <span className="sr-only">Loading key indicators...</span>
    </div>
  );
}

export interface PyramidSkeletonProps {
  title?: string;
  minHeight?: number;
  className?: string;
}

export function PyramidSkeleton({
  title = "Loading demographic disaggregation...",
  minHeight = 360,
  className,
}: PyramidSkeletonProps) {
  return (
    <div
      role="status"
      aria-label={title}
      className={cn(
        "space-y-4 rounded-lg border border-ink-800 bg-ink-900/80 p-5",
        className
      )}
      style={{ minHeight: `${minHeight}px` }}
    >
      {/* Header Placeholder */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-800 pb-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-36 bg-ink-800" />
          <Skeleton className="h-5 w-60 bg-ink-800" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 bg-ink-800 rounded-full" />
        </div>
      </div>

      {/* Sex Balance Header */}
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-10 rounded bg-ink-950 border border-ink-800" />
        <Skeleton className="h-10 rounded bg-ink-950 border border-ink-800" />
      </div>

      {/* Symmetrical Pyramid Bar Rows */}
      <div className="space-y-3 pt-2">
        {[
          { l: 20, r: 24 },
          { l: 45, r: 48 },
          { l: 60, r: 65 },
          { l: 75, r: 72 },
          { l: 90, r: 88 },
        ].map((row, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            {/* Male bar (leftward) */}
            <div className="flex-1 flex justify-end">
              <Skeleton
                className="h-5 rounded bg-sky-950/60 border border-sky-800/30"
                style={{ width: `${row.l}%` }}
              />
            </div>
            {/* Center age label */}
            <Skeleton className="h-4 w-12 rounded bg-ink-800" />
            {/* Female bar (rightward) */}
            <div className="flex-1 flex justify-start">
              <Skeleton
                className="h-5 rounded bg-amber-950/60 border border-amber-800/30"
                style={{ width: `${row.r}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom axis tick skeletons */}
      <div className="flex justify-between pt-4 border-t border-ink-800 px-6">
        <Skeleton className="h-2.5 w-8 bg-ink-800" />
        <Skeleton className="h-2.5 w-16 bg-ink-800" />
        <Skeleton className="h-2.5 w-8 bg-ink-800" />
      </div>
      <span className="sr-only">{title}</span>
    </div>
  );
}

export interface SankeySkeletonProps {
  title?: string;
  minHeight?: number;
  className?: string;
}

export function SankeySkeleton({
  title = "Loading origin-destination flow corridors...",
  minHeight = 420,
  className,
}: SankeySkeletonProps) {
  return (
    <div
      role="status"
      aria-label={title}
      className={cn(
        "space-y-4 rounded-lg border border-ink-800 bg-ink-900/80 p-5",
        className
      )}
      style={{ minHeight: `${minHeight}px` }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-800 pb-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-40 bg-ink-800" />
          <Skeleton className="h-5 w-64 bg-ink-800" />
        </div>
        <Skeleton className="h-6 w-28 bg-ink-800 rounded-full" />
      </div>

      {/* Nodes and Flow Ribbons layout */}
      <div className="relative flex justify-between items-center py-4 px-2" style={{ height: `${minHeight - 120}px` }}>
        {/* Origin Nodes (Left) */}
        <div className="space-y-4 w-32">
          <Skeleton className="h-14 w-full rounded bg-ink-800 border border-ink-700" />
          <Skeleton className="h-20 w-full rounded bg-ink-800 border border-ink-700" />
          <Skeleton className="h-16 w-full rounded bg-ink-800 border border-ink-700" />
        </div>

        {/* Center Simulated Flow Pulses */}
        <div className="flex-1 mx-6 flex flex-col justify-around h-full opacity-30">
          <div className="h-8 w-full rounded-full bg-cyan-500/20 border border-cyan-500/30 animate-pulse" />
          <div className="h-12 w-full rounded-full bg-amber-500/20 border border-amber-500/30 animate-pulse delay-75" />
          <div className="h-6 w-full rounded-full bg-indigo-500/20 border border-indigo-500/30 animate-pulse delay-150" />
        </div>

        {/* Target Nodes (Right) */}
        <div className="space-y-4 w-32">
          <Skeleton className="h-24 w-full rounded bg-ink-800 border border-ink-700" />
          <Skeleton className="h-16 w-full rounded bg-ink-800 border border-ink-700" />
          <Skeleton className="h-12 w-full rounded bg-ink-800 border border-ink-700" />
        </div>
      </div>
      <span className="sr-only">{title}</span>
    </div>
  );
}
