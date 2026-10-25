"use client";

import React, { useState, useMemo } from "react";
import type { FlowDataset, FlowNode, FlowLink } from "@/lib/geo/flowData";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { ChartTooltipOverlay } from "@/components/charts/ChartTooltipOverlay";
import { EmptyState } from "@/components/charts/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatNumber } from "@/lib/utils";
import {
  ArrowRightLeft,
  AlertTriangle,
  Info,
  ShieldCheck,
  Maximize2,
  Calendar,
  Sparkles,
} from "lucide-react";

export interface SankeyDiagramProps {
  dataset: FlowDataset;
  activeDriverFilter?: string;
  minVolumeThreshold?: number;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string | null) => void;
  className?: string;
}

export function SankeyDiagram({
  dataset,
  activeDriverFilter = "all",
  minVolumeThreshold = 0,
  selectedNodeId,
  onSelectNode,
  className,
}: SankeyDiagramProps) {
  const [hoveredLink, setHoveredLink] = useState<{
    link: FlowLink;
    x: number;
    y: number;
  } | null>(null);

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Filter links
  const filteredLinks = useMemo(() => {
    return dataset.links.filter((link) => {
      if (activeDriverFilter !== "all" && link.driver !== activeDriverFilter) {
        return false;
      }
      if (link.volume < minVolumeThreshold) {
        return false;
      }
      return true;
    });
  }, [dataset.links, activeDriverFilter, minVolumeThreshold]);

  // Aggregate active volume
  const activeTotalVolume = useMemo(() => {
    return filteredLinks.reduce((sum, l) => sum + l.volume, 0);
  }, [filteredLinks]);

  // Determine connected nodes
  const activeNodeIds = useMemo(() => {
    const set = new Set<string>();
    for (const l of filteredLinks) {
      set.add(l.source);
      set.add(l.target);
    }
    return set;
  }, [filteredLinks]);

  return (
    <div className={`space-y-4 rounded-lg border border-ink-700 bg-ink-900/80 p-5 ${className || ""}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span>Origin-Destination Flow Pathways</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-100">{dataset.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{dataset.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={dataset.mandateVariant} size="sm" className="font-mono">
            {dataset.mandateBadge}
          </Badge>
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-ink-950 px-2.5 py-1 rounded border border-ink-800">
            <Calendar className="h-3 w-3 text-slate-500" />
            <span>{dataset.reportingPeriod}</span>
          </div>
        </div>
      </div>

      {/* Sankey Layout Chart Viewport */}
      {filteredLinks.length === 0 ? (
        <EmptyState
          title="No Flow Corridors Match Filter"
          description="No origin-destination pathways meet the selected driver category or minimum volume threshold."
          suggestions={[
            "Lower or reset the minimum volume threshold slider",
            "Switch the driver filter back to 'All Drivers'",
            "Select an alternative migration or refugee flow dataset",
          ]}
        />
      ) : (
        <div className="relative">
          {/* Column Direction Labels */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider px-2 pb-2">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <span>← Origins / Departure Areas</span>
            </span>
            <span className="text-slate-500 hidden sm:inline">
              Corridor Volume: {formatNumber(activeTotalVolume)}
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <span>Destinations & Asylum Hubs →</span>
            </span>
          </div>

          <ChartContainer
            ariaLabel={`Sankey diagram for ${dataset.title}`}
            minHeight={420}
            margin={{ top: 20, right: 10, bottom: 20, left: 10 }}
          >
          {({ width, height, boundedWidth, boundedHeight, margin }) => {
            const nodeWidth = 140;
            const nodeGap = 12;

            // Separate nodes into sources (origins) and targets (destinations)
            const sourceNodesList = dataset.nodes.filter(
              (n) => (n.category === "origin" || (n.category === "unrecorded" && n.id.includes("orig"))) && activeNodeIds.has(n.id)
            );
            const targetNodesList = dataset.nodes.filter(
              (n) => (n.category === "destination" || (n.category === "unrecorded" && !n.id.includes("orig"))) && activeNodeIds.has(n.id)
            );

            // Compute volume per node
            const sourceVolumes = new Map<string, number>();
            const targetVolumes = new Map<string, number>();

            for (const l of filteredLinks) {
              sourceVolumes.set(l.source, (sourceVolumes.get(l.source) || 0) + l.volume);
              targetVolumes.set(l.target, (targetVolumes.get(l.target) || 0) + l.volume);
            }

            // Calculate vertical positions for Source Nodes (Left Column)
            const sourceTotal = Math.max(1, Array.from(sourceVolumes.values()).reduce((a, b) => a + b, 0));
            const sourceAvailableHeight = Math.max(60, boundedHeight - (sourceNodesList.length - 1) * nodeGap);

            let currentSourceY = margin.top;
            const sourceNodeLayout = new Map<string, { x: number; y: number; width: number; height: number; node: FlowNode }>();

            for (const node of sourceNodesList) {
              const vol = sourceVolumes.get(node.id) || 0;
              const h = Math.max(24, Math.floor((vol / sourceTotal) * sourceAvailableHeight));
              sourceNodeLayout.set(node.id, {
                x: margin.left,
                y: currentSourceY,
                width: nodeWidth,
                height: h,
                node,
              });
              currentSourceY += h + nodeGap;
            }

            // Calculate vertical positions for Target Nodes (Right Column)
            const targetTotal = Math.max(1, Array.from(targetVolumes.values()).reduce((a, b) => a + b, 0));
            const targetAvailableHeight = Math.max(60, boundedHeight - (targetNodesList.length - 1) * nodeGap);

            let currentTargetY = margin.top;
            const targetNodeLayout = new Map<string, { x: number; y: number; width: number; height: number; node: FlowNode }>();
            const targetX = margin.left + boundedWidth - nodeWidth;

            for (const node of targetNodesList) {
              const vol = targetVolumes.get(node.id) || 0;
              const h = Math.max(24, Math.floor((vol / targetTotal) * targetAvailableHeight));
              targetNodeLayout.set(node.id, {
                x: targetX,
                y: currentTargetY,
                width: nodeWidth,
                height: h,
                node,
              });
              currentTargetY += h + nodeGap;
            }

            // Track link vertical offsets on source and target nodes to stack them
            const sourceOffsets = new Map<string, number>();
            const targetOffsets = new Map<string, number>();

            return (
              <>
                <svg
                  width={width}
                  height={height}
                  className="overflow-hidden select-none bg-ink-950/40 rounded-lg border border-ink-800/60"
                  onMouseLeave={() => {
                    setHoveredLink(null);
                    setHoveredNodeId(null);
                  }}
                >
                  <defs>
                    {/* Linear Gradients for Link Ribbons */}
                    {filteredLinks.map((link) => {
                      const isConflict = link.driver === "conflict";
                      const isDrought = link.driver === "drought";
                      const startColor = isConflict ? "#bc6c25" : isDrought ? "#c58641" : "#426b66";
                      const endColor = isConflict ? "#cb5a36" : isDrought ? "#dda15e" : "#606c38";

                      return (
                        <linearGradient key={`grad_${link.id}`} id={`grad_${link.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={startColor} stopOpacity={0.65} />
                          <stop offset="100%" stopColor={endColor} stopOpacity={0.75} />
                        </linearGradient>
                      );
                    })}

                    {/* Diffuse Pattern */}
                    <pattern id="diffuseStripe" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="6" stroke="#475569" strokeWidth="1.5" />
                    </pattern>
                  </defs>

                  {/* Flow Ribbons (Connecting Links) */}
                  <g className="transition-opacity duration-200">
                    {filteredLinks.map((link) => {
                      const sLayout = sourceNodeLayout.get(link.source);
                      const tLayout = targetNodeLayout.get(link.target);
                      if (!sLayout || !tLayout) return null;

                      // Proportional link height on source
                      const sOffset = sourceOffsets.get(link.source) || 0;
                      const sNodeVol = sourceVolumes.get(link.source) || 1;
                      const linkHeightOnSource = Math.max(2, (link.volume / sNodeVol) * sLayout.height);

                      // Proportional link height on target
                      const tOffset = targetOffsets.get(link.target) || 0;
                      const tNodeVol = targetVolumes.get(link.target) || 1;
                      const linkHeightOnTarget = Math.max(2, (link.volume / tNodeVol) * tLayout.height);

                      // Update accumulated offsets
                      sourceOffsets.set(link.source, sOffset + linkHeightOnSource);
                      targetOffsets.set(link.target, tOffset + linkHeightOnTarget);

                      const x0 = sLayout.x + sLayout.width;
                      const y0_top = sLayout.y + sOffset;
                      const y0_bot = y0_top + linkHeightOnSource;

                      const x1 = tLayout.x;
                      const y1_top = tLayout.y + tOffset;
                      const y1_bot = y1_top + linkHeightOnTarget;

                      const xi = (x0 + x1) / 2;

                      // Closed Cubic Bézier Ribbon Path
                      const ribbonPath = `
                        M ${x0},${y0_top}
                        C ${xi},${y0_top} ${xi},${y1_top} ${x1},${y1_top}
                        L ${x1},${y1_bot}
                        C ${xi},${y1_bot} ${xi},${y0_bot} ${x0},${y0_bot}
                        Z
                      `;

                      const isLinkHovered = hoveredLink?.link.id === link.id;
                      const isConnectedToNode =
                        hoveredNodeId === link.source ||
                        hoveredNodeId === link.target ||
                        selectedNodeId === link.source ||
                        selectedNodeId === link.target;

                      const opacity = isLinkHovered
                        ? 0.95
                        : isConnectedToNode
                        ? 0.85
                        : hoveredNodeId || selectedNodeId
                        ? 0.15
                        : 0.6;

                      return (
                        <path
                          key={link.id}
                          d={ribbonPath}
                          fill={`url(#grad_${link.id})`}
                          stroke={isLinkHovered ? "#ffffff" : isConnectedToNode ? "#fcd34d" : "transparent"}
                          strokeWidth={isLinkHovered ? 1.5 : 0.5}
                          strokeDasharray={link.isDiffuseOrigin || link.isDiffuseDestination ? "3 3" : undefined}
                          opacity={opacity}
                          className="cursor-pointer transition-all duration-150 hover:brightness-125 outline-none focus-visible:stroke-amber-400 focus-visible:stroke-2"
                          tabIndex={0}
                          role="img"
                          aria-label={`${link.sourceName} to ${link.targetName}: ${formatNumber(link.volume)} displaced individuals`}
                          onFocus={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredLink({
                              link,
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                          }}
                          onBlur={() => setHoveredLink(null)}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredLink({
                              link,
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                          }}
                          onMouseLeave={() => setHoveredLink(null)}
                        />
                      );
                    })}
                  </g>

                  {/* Source Nodes (Left Column) */}
                  <g>
                    {Array.from(sourceNodeLayout.values()).map(({ x, y, width: w, height: h, node }) => {
                      const isHovered = hoveredNodeId === node.id || selectedNodeId === node.id;
                      const vol = sourceVolumes.get(node.id) || 0;

                      return (
                        <g
                          key={node.id}
                          transform={`translate(${x}, ${y})`}
                          className="cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                          tabIndex={0}
                          role="button"
                          aria-label={`${node.name}: ${formatNumber(vol)} individuals`}
                          onClick={() => onSelectNode?.(selectedNodeId === node.id ? null : node.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onSelectNode?.(selectedNodeId === node.id ? null : node.id);
                            }
                          }}
                          onFocus={() => setHoveredNodeId(node.id)}
                          onBlur={() => setHoveredNodeId(null)}
                          onMouseEnter={() => setHoveredNodeId(node.id)}
                          onMouseLeave={() => setHoveredNodeId(null)}
                        >
                          <rect
                            width={w}
                            height={h}
                            rx={4}
                            fill={node.isDiffuse ? "url(#diffuseStripe)" : node.color || "#0284c7"}
                            stroke={isHovered ? "#ffffff" : node.isDiffuse ? "#94a3b8" : "#0f172a"}
                            strokeWidth={isHovered ? 2 : 1}
                            className="transition-all duration-150"
                          />

                          <foreignObject width={w} height={h} className="pointer-events-none p-1.5 overflow-hidden">
                            <div className="flex h-full flex-col justify-center text-xs font-mono">
                              <span className="truncate font-semibold text-slate-100 flex items-center gap-1">
                                {node.isDiffuse && <AlertTriangle className="h-3 w-3 text-amber-400 flex-shrink-0" />}
                                <span className="truncate">{node.name}</span>
                              </span>
                              {h >= 36 && (
                                <span className="text-[10px] text-slate-300 font-bold truncate">
                                  {formatNumber(vol)}
                                </span>
                              )}
                            </div>
                          </foreignObject>
                        </g>
                      );
                    })}
                  </g>

                  {/* Target Nodes (Right Column) */}
                  <g>
                    {Array.from(targetNodeLayout.values()).map(({ x, y, width: w, height: h, node }) => {
                      const isHovered = hoveredNodeId === node.id || selectedNodeId === node.id;
                      const vol = targetVolumes.get(node.id) || 0;

                      return (
                        <g
                          key={node.id}
                          transform={`translate(${x}, ${y})`}
                          className="cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                          tabIndex={0}
                          role="button"
                          aria-label={`${node.name}: ${formatNumber(vol)} individuals`}
                          onClick={() => onSelectNode?.(selectedNodeId === node.id ? null : node.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onSelectNode?.(selectedNodeId === node.id ? null : node.id);
                            }
                          }}
                          onFocus={() => setHoveredNodeId(node.id)}
                          onBlur={() => setHoveredNodeId(null)}
                          onMouseEnter={() => setHoveredNodeId(node.id)}
                          onMouseLeave={() => setHoveredNodeId(null)}
                        >
                          <rect
                            width={w}
                            height={h}
                            rx={4}
                            fill={node.isDiffuse ? "url(#diffuseStripe)" : node.color || "#0ea5e9"}
                            stroke={isHovered ? "#ffffff" : node.isDiffuse ? "#94a3b8" : "#0f172a"}
                            strokeWidth={isHovered ? 2 : 1}
                            className="transition-all duration-150"
                          />

                          <foreignObject width={w} height={h} className="pointer-events-none p-1.5 overflow-hidden">
                            <div className="flex h-full flex-col justify-center text-xs font-mono">
                              <span className="truncate font-semibold text-slate-100 flex items-center gap-1">
                                {node.isDiffuse && <AlertTriangle className="h-3 w-3 text-amber-400 flex-shrink-0" />}
                                <span className="truncate">{node.name}</span>
                              </span>
                              {h >= 36 && (
                                <span className="text-[10px] text-slate-300 font-bold truncate">
                                  {formatNumber(vol)}
                                </span>
                              )}
                            </div>
                          </foreignObject>
                        </g>
                      );
                    })}
                  </g>
                </svg>

                {/* Tooltip Overlay */}
                {hoveredLink && (
                  <ChartTooltipOverlay
                    x={boundedWidth / 2}
                    y={15}
                    containerWidth={width}
                    containerHeight={height}
                    visible={hoveredLink !== null}
                    title={`${hoveredLink.link.sourceName} → ${hoveredLink.link.targetName}`}
                    source={hoveredLink.link.sourceCitation}
                    referenceDate={hoveredLink.link.reportingDate}
                  >
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Flow Volume:</span>
                        <strong className="text-cyan-400 text-sm">
                          {formatNumber(hoveredLink.link.volume)}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Dataset Share:</span>
                        <strong className="text-slate-200">
                          {activeTotalVolume > 0
                            ? `${Math.round((hoveredLink.link.volume / activeTotalVolume) * 1000) / 10}%`
                            : "0%"}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-ink-800 text-[11px]">
                        <span className="text-slate-400">Trigger:</span>
                        <span className="capitalize text-amber-400 font-semibold">
                          {hoveredLink.link.driver}
                        </span>
                      </div>
                      {hoveredLink.link.corridorName && (
                        <div className="text-[10px] text-slate-400 pt-0.5">
                          Corridor: {hoveredLink.link.corridorName}
                        </div>
                      )}
                      {(hoveredLink.link.isDiffuseOrigin || hoveredLink.link.isDiffuseDestination) && (
                        <div className="text-[10px] text-amber-400/90 pt-1 border-t border-ink-800 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Honest Standard: Unrecorded or diffuse multi-stage transit.</span>
                        </div>
                      )}
                    </div>
                  </ChartTooltipOverlay>
                )}
              </>
            );
          }}
        </ChartContainer>
      </div>
      )}

      {/* Footer Notes and Legend */}
      <div className="pt-2 border-t border-ink-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-5 rounded-sm bg-cyan-600" />
            <span className="text-slate-300">Verified Direct Flow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-5 rounded-sm border border-dashed border-slate-500 bg-slate-800" />
            <span className="text-slate-300">Diffuse / Unrecorded Pathway</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Hover over any node or ribbon to inspect exact caseload volumes and proportions.
        </div>
      </div>

      {/* Screen Reader Accessible Table Fallback */}
      <table className="sr-only" aria-label={`Sankey displacement flow table for ${dataset.title}`}>
        <caption>
          Verified origin-destination displacement movements for {dataset.title}
        </caption>
        <thead>
          <tr>
            <th scope="col">Origin Location</th>
            <th scope="col">Target Destination</th>
            <th scope="col">Displaced Individuals</th>
            <th scope="col">Primary Trigger</th>
            <th scope="col">Corridor Name</th>
            <th scope="col">Reporting Period</th>
          </tr>
        </thead>
        <tbody>
          {filteredLinks.map((link) => (
            <tr key={link.id}>
              <th scope="row">{link.sourceName}</th>
              <td>{link.targetName}</td>
              <td>{link.volume.toLocaleString()}</td>
              <td>{link.driver}</td>
              <td>{link.corridorName || "Direct Pathway"}</td>
              <td>{link.reportingDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
