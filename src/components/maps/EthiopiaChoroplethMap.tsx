"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { geoMercator, geoPath } from "d3-geo";
import type { Topology } from "topojson-specification";
import {
  decodeTopojson,
  ETHIOPIA_REGION_PCODES,
  type BoundaryFeatureCollection,
  type BoundaryFeatureProperties,
} from "@/lib/geo/boundaries";
import type { RegionalCaseloadItem } from "@/lib/db/types";
import { PCODE_TO_REGION_NAME } from "@/lib/db/types";
import { useObservatoryFilters } from "@/lib/state/ObservatoryFilterContext";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { ChartTooltipOverlay } from "@/components/charts/ChartTooltipOverlay";
import { AreaDetailDrawer, type SelectedAreaDetails } from "./AreaDetailDrawer";
import { MapSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/charts/EmptyState";
import { ErrorState } from "@/components/charts/ErrorState";
import { formatNumber } from "@/lib/utils";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export interface EthiopiaChoroplethMapProps {
  initialTopology?: Topology;
  initialGeojson?: BoundaryFeatureCollection;
  caseloads: RegionalCaseloadItem[];
  className?: string;
}

interface ChoroplethCanvasProps {
  geojson: BoundaryFeatureCollection;
  caseloadMap: Map<string, RegionalCaseloadItem>;
  metric: "idps" | "returnees";
  adminLevel: 1 | 2;
  selectedArea: SelectedAreaDetails | null;
  handleAreaClick: (area: SelectedAreaDetails) => void;
  width: number;
  height: number;
  boundedWidth: number;
  boundedHeight: number;
  margin: { top: number; right: number; bottom: number; left: number };
  pan: { x: number; y: number };
  zoom: number;
  getColor: (val?: number) => string;
}

function ChoroplethCanvas({
  geojson,
  caseloadMap,
  metric,
  adminLevel,
  selectedArea,
  handleAreaClick,
  width,
  height,
  boundedWidth,
  boundedHeight,
  margin,
  pan,
  zoom,
  getColor,
}: ChoroplethCanvasProps) {
  const [hoveredArea, setHoveredArea] = useState<SelectedAreaDetails | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Memoize D3 projection, pathGenerator, and GeoJSON polygon path computations
  const { featurePaths } = useMemo(() => {
    const projection = geoMercator().fitSize([boundedWidth, boundedHeight], geojson);
    const pathGenerator = geoPath().projection(projection);

    const paths = (geojson.features || []).map((feature, idx) => {
      const props = feature.properties as BoundaryFeatureProperties;
      const pcode = props.pcode || props.id;
      const caseload = caseloadMap.get(pcode);
      const pathD = pathGenerator(feature) || "";

      const areaDetails: SelectedAreaDetails = {
        name: caseload?.regionName || props.name,
        pcode,
        adminLevel: props.adminLevel || adminLevel,
        idps: caseload?.idps || 0,
        returnees: caseload?.returnees || 0,
        primaryDriver: caseload?.primaryDriver,
        confidence: caseload?.confidence,
        reportingDate: caseload?.reportingDate,
        citation: caseload?.citation,
      };

      return {
        feature,
        props,
        pcode,
        caseload,
        pathD,
        areaDetails,
        idx,
      };
    });

    return { featurePaths: paths };
  }, [geojson, boundedWidth, boundedHeight, caseloadMap, adminLevel]);

  return (
    <>
      <svg
        width={width}
        height={height}
        className="overflow-hidden select-none bg-ink-950/40 rounded-lg border border-ink-800/60"
        onMouseLeave={() => setHoveredArea(null)}
      >
        <defs>
          {/* Diagonal Hatch Pattern for Unassessed / Missing Areas */}
          <pattern
            id="missingDataHatch"
            width="8"
            height="8"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="8" stroke="#334155" strokeWidth="2" />
          </pattern>
        </defs>

        <g
          transform={`translate(${margin.left + pan.x}, ${margin.top + pan.y}) scale(${zoom})`}
          style={{ transformOrigin: `${boundedWidth / 2}px ${boundedHeight / 2}px` }}
          className="transition-transform duration-150 ease-out"
        >
          {featurePaths.map(({ props, pcode, caseload, pathD, areaDetails, idx }) => {
            const value = metric === "idps" ? caseload?.idps : caseload?.returnees;
            const fillColor = getColor(value);
            const isSelected = selectedArea?.pcode === pcode;
            const isHovered = hoveredArea?.pcode === pcode;

            return (
              <path
                key={props.id || `feat_${idx}`}
                d={pathD}
                fill={value === undefined ? "url(#missingDataHatch)" : fillColor}
                stroke={isSelected ? "#bc6c25" : isHovered ? "#dda15e" : "var(--ink-700)"}
                strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 0.8}
                tabIndex={0}
                role="button"
                aria-label={`${areaDetails.name} (${areaDetails.pcode}): ${formatNumber(
                  value || 0
                )} ${metric}`}
                className="cursor-pointer transition-colors focus:outline-none focus-visible:stroke-amber-400 focus-visible:stroke-2"
                onFocus={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredArea(areaDetails);
                  setTooltipPos({
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  });
                }}
                onBlur={() => setHoveredArea(null)}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredArea(areaDetails);
                  setTooltipPos({
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  });
                }}
                onClick={() => handleAreaClick(areaDetails)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleAreaClick(areaDetails);
                  }
                }}
              />
            );
          })}
        </g>
      </svg>

      {/* Tooltip Overlay */}
      {hoveredArea && (
        <ChartTooltipOverlay
          x={boundedWidth / 2}
          y={40}
          containerWidth={width}
          containerHeight={height}
          visible={hoveredArea !== null}
          title={hoveredArea.name}
          source="IOM DTM Round 37"
          referenceDate={hoveredArea.reportingDate || "2024-08-31"}
        >
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-400">P-Code:</span>
              <span className="text-slate-200">{hoveredArea.pcode}</span>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span className="text-amber-400">IDP Caseload:</span>
              <strong className="text-slate-100">{formatNumber(hoveredArea.idps)}</strong>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span className="text-emerald-400">Returnees:</span>
              <strong className="text-slate-100">{formatNumber(hoveredArea.returnees)}</strong>
            </div>
            {hoveredArea.primaryDriver && (
              <div className="flex items-center justify-between pt-1 border-t border-ink-800 text-[11px]">
                <span className="text-slate-400">Trigger:</span>
                <span className="capitalize text-amber-300 font-semibold font-mono">
                  {hoveredArea.primaryDriver}
                </span>
              </div>
            )}
          </div>
        </ChartTooltipOverlay>
      )}
    </>
  );
}

export function EthiopiaChoroplethMap({
  initialTopology,
  initialGeojson,
  caseloads,
  className,
}: EthiopiaChoroplethMapProps) {
  const { filters, setRegion, setMetric: setGlobalMetric, setAdminLevel: setGlobalAdminLevel } =
    useObservatoryFilters();

  const [adminLevel, setAdminLevel] = useState<1 | 2>(filters.adminLevel || 1);
  const [metric, setMetric] = useState<"idps" | "returnees">(
    filters.metric === "returnees" ? "returnees" : "idps"
  );

  // Keep in sync with global filters if they change externally
  const prevFilterAdminRef = useRef(filters.adminLevel);
  useEffect(() => {
    if (filters.adminLevel !== prevFilterAdminRef.current) {
      prevFilterAdminRef.current = filters.adminLevel;
      if (filters.adminLevel) {
        setAdminLevel(filters.adminLevel);
      }
    }
  }, [filters.adminLevel]);

  const prevFilterMetricRef = useRef(filters.metric);
  useEffect(() => {
    if (filters.metric !== prevFilterMetricRef.current) {
      prevFilterMetricRef.current = filters.metric;
      if (filters.metric === "idps" || filters.metric === "returnees") {
        setMetric(filters.metric);
      }
    }
  }, [filters.metric]);

  // Topology / GeoJSON State
  const [geojson, setGeojson] = useState<BoundaryFeatureCollection | null>(() => {
    if (initialGeojson) return initialGeojson;
    if (initialTopology) return decodeTopojson(initialTopology);
    return null;
  });
  const [loading, setLoading] = useState<boolean>(!initialGeojson && !initialTopology);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState<number>(0);
  const loadedAdminLevelRef = useRef<number | null>(
    initialGeojson || initialTopology ? (adminLevel || 1) : null
  );

  // Interaction State
  const [selectedArea, setSelectedArea] = useState<SelectedAreaDetails | null>(null);

  // Zoom & Pan State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map of caseload by P-code
  const caseloadMap = useMemo(() => {
    const map = new Map<string, RegionalCaseloadItem>();
    for (const c of caseloads) {
      map.set(c.pcode, c);
    }
    return map;
  }, [caseloads]);

  // Synchronize selection with global ObservatoryFilterContext
  useEffect(() => {
    if (filters.region && filters.region !== "all") {
      const match = caseloadMap.get(filters.region);
      if (match) {
        setSelectedArea({
          name: match.regionName,
          pcode: match.pcode,
          adminLevel: 1,
          idps: match.idps,
          returnees: match.returnees,
          primaryDriver: match.primaryDriver,
          confidence: match.confidence,
          reportingDate: match.reportingDate,
          citation: match.citation,
        });
      }
    } else if (filters.region === "all" && selectedArea) {
      setSelectedArea(null);
    }
  }, [filters.region, caseloadMap]);

  // Dynamic fetch boundary TopoJSON when adminLevel or retryKey changes
  useEffect(() => {
    if (loadedAdminLevelRef.current === adminLevel && geojson && retryKey === 0) {
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const boundaryFile =
      adminLevel === 1
        ? "/data/boundaries/ethiopia-adm1.topojson"
        : "/data/boundaries/ethiopia-adm2.topojson";

    const fetchUrl =
      typeof window !== "undefined" && window.location?.origin && window.location.origin !== "null"
        ? `${window.location.origin}${boundaryFile}`
        : boundaryFile;

    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch ${boundaryFile}`);
        return res.json();
      })
      .then((topo: Topology) => {
        if (!isMounted) return;
        const decoded = decodeTopojson(topo);
        setGeojson(decoded);
        loadedAdminLevelRef.current = adminLevel;
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "Failed to load boundary datasets");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [adminLevel, retryKey, geojson]);

  // Color Scale Quantiles
  const idpThresholds = [100000, 300000, 600000, 1000000];
  const idpColors = ["#fefae0", "#f5e6b8", "#dda15e", "#bc6c25", "#8c440a"];

  const returneeThresholds = [50000, 150000, 300000, 600000];
  const returneeColors = ["#f0f4e4", "#d3e0b5", "#8fa160", "#606c38", "#283618"];

  const getColor = (value?: number): string => {
    if (value === undefined || value === null) return "var(--ink-800)"; // Unassessed
    const thresholds = metric === "idps" ? idpThresholds : returneeThresholds;
    const colors = metric === "idps" ? idpColors : returneeColors;

    for (let i = 0; i < thresholds.length; i++) {
      if (value < thresholds[i]) return colors[i];
    }
    return colors[colors.length - 1];
  };

  const handleZoomIn = () => setZoom((z) => Math.min(3, Math.round((z + 0.3) * 10) / 10));
  const handleZoomOut = () => setZoom((z) => Math.max(0.7, Math.round((z - 0.3) * 10) / 10));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleAreaClick = (area: SelectedAreaDetails) => {
    setSelectedArea((prev) => (prev?.pcode === area.pcode ? null : area));
    setRegion(area.pcode === filters.region ? "all" : area.pcode);
  };

  if (!caseloads || caseloads.length === 0) {
    return (
      <EmptyState
        title="No Displacement Caseload Data"
        description="No subnational IDP or returnee caseload records are available for the current filters."
        suggestions={[
          "Reset active filters to view all administrative areas",
          "Switch between IDP and Returnee displacement metrics",
          "Verify that baseline assessment datasets are loaded",
        ]}
      />
    );
  }

  return (
    <div className={`space-y-4 rounded-lg border border-ink-700 bg-ink-900/80 p-5 ${className || ""}`}>
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-500 uppercase tracking-wider mb-1">
            <MapPin className="h-4 w-4" />
            <span>Interactive Subnational Choropleth</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-100">
            Ethiopia Administrative Displacement Choropleth
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified caseloads mapped across regional states (Admin 1) and administrative zones (Admin 2).
          </p>
        </div>

        {/* Controls Grid */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          {/* Admin Level Selector */}
          <div className="flex items-center rounded-md bg-ink-950 p-1 border border-ink-800" role="group" aria-label="Administrative level">
            <button
              type="button"
              onClick={() => {
                setAdminLevel(1);
                setGlobalAdminLevel(1);
              }}
              className={`px-2.5 py-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                adminLevel === 1
                  ? "bg-ink-800 text-slate-100 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Admin 1 (Regions)
            </button>
            <button
              type="button"
              onClick={() => {
                setAdminLevel(2);
                setGlobalAdminLevel(2);
              }}
              className={`px-2.5 py-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                adminLevel === 2
                  ? "bg-ink-800 text-slate-100 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Admin 2 (Zones)
            </button>
          </div>

          {/* Metric Selector */}
          <div className="flex items-center rounded-md bg-ink-950 p-1 border border-ink-800" role="group" aria-label="Displacement metric">
            <button
              type="button"
              onClick={() => {
                setMetric("idps");
                setGlobalMetric("idps");
              }}
              className={`px-2.5 py-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                metric === "idps"
                  ? "bg-amber-500/20 text-amber-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              IDP Caseload
            </button>
            <button
              type="button"
              onClick={() => {
                setMetric("returnees");
                setGlobalMetric("returnees");
              }}
              className={`px-2.5 py-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                metric === "returnees"
                  ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Returnees
            </button>
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 rounded-md bg-ink-950 p-1 border border-ink-800" role="group" aria-label="Map zoom controls">
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Zoom in"
              className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-ink-800 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Zoom out"
              className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-ink-800 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              aria-label="Reset zoom"
              className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 hover:text-slate-100 hover:bg-ink-800 flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Viewport & Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className={`relative ${selectedArea ? "lg:col-span-8" : "lg:col-span-12"}`}>
          <ChartContainer
            ariaLabel="Subnational displacement and returnee choropleth map"
            minHeight={440}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            {({ width, height, boundedWidth, boundedHeight, margin }) => {
              if (loading) {
                return (
                  <MapSkeleton
                    title={`Loading administrative boundaries (Admin ${adminLevel})...`}
                    minHeight={440}
                  />
                );
              }

              if (error) {
                return (
                  <ErrorState
                    title="Administrative Boundaries Unavailable"
                    message={error}
                    onRetry={() => setRetryKey((k) => k + 1)}
                    actionText="Retry Fetch"
                    suggestions={[
                      "Verify network connectivity to boundary assets",
                      "Check if public/data/boundaries TopoJSON files are accessible",
                    ]}
                  />
                );
              }

              if (!geojson || geojson.features.length === 0) {
                return (
                  <EmptyState
                    title="Boundary Data Unavailable"
                    description="Administrative polygon boundaries could not be parsed for this administrative level."
                    suggestions={[
                      "Toggle between Admin 1 (Regions) and Admin 2 (Zones)",
                      "Reload the view to refresh boundary cache",
                    ]}
                  />
                );
              }

              return (
                <ChoroplethCanvas
                  geojson={geojson}
                  caseloadMap={caseloadMap}
                  metric={metric}
                  adminLevel={adminLevel}
                  selectedArea={selectedArea}
                  handleAreaClick={handleAreaClick}
                  width={width}
                  height={height}
                  boundedWidth={boundedWidth}
                  boundedHeight={boundedHeight}
                  margin={margin}
                  pan={pan}
                  zoom={zoom}
                  getColor={getColor}
                />
              );
            }}
          </ChartContainer>
        </div>

        {/* Selected Area Contextual Detail Drawer */}
        {selectedArea && (
          <div className="lg:col-span-4 sticky top-6">
            <AreaDetailDrawer
              area={selectedArea}
              onClose={() => {
                setSelectedArea(null);
                setRegion("all");
              }}
            />
          </div>
        )}
      </div>

      {/* Choropleth Dynamic Scale Legend */}
      <div className="pt-3 border-t border-ink-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 uppercase tracking-wider text-[11px]">
            {metric === "idps" ? "IDP Scale" : "Returnee Scale"}:
          </span>

          {(metric === "idps" ? idpColors : returneeColors).map((color, idx) => {
            const thresholds = metric === "idps" ? idpThresholds : returneeThresholds;
            const label =
              idx === 0
                ? `< ${formatNumber(thresholds[0])}`
                : idx === thresholds.length
                ? `≥ ${formatNumber(thresholds[thresholds.length - 1])}`
                : `${formatNumber(thresholds[idx - 1])} – ${formatNumber(thresholds[idx])}`;

            return (
              <div key={color} className="flex items-center gap-1.5">
                <span className="h-3 w-5 rounded-sm border border-black/40" style={{ backgroundColor: color }} />
                <span className="text-[10px] text-slate-300">{label}</span>
              </div>
            );
          })}

          {/* Missing / Unassessed Indicator */}
          <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-ink-700">
            <span className="h-3 w-5 rounded-sm border border-slate-700 bg-slate-800" />
            <span className="text-[10px] text-slate-400">Unassessed</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Click any region or zone to open the contextual detail audit drawer.
        </div>
      </div>

      {/* Screen Reader Table Fallback */}
      <table className="sr-only" aria-label="Subnational displacement caseload table">
        <caption>Verified IDP and returnee caseloads across Ethiopian administrative areas</caption>
        <thead>
          <tr>
            <th scope="col">Region / Area</th>
            <th scope="col">P-Code</th>
            <th scope="col">IDP Caseload</th>
            <th scope="col">Returnees</th>
            <th scope="col">Primary Trigger</th>
          </tr>
        </thead>
        <tbody>
          {caseloads.map((c) => (
            <tr key={c.pcode}>
              <th scope="row">{c.regionName}</th>
              <td>{c.pcode}</td>
              <td>{c.idps.toLocaleString()}</td>
              <td>{c.returnees.toLocaleString()}</td>
              <td>{c.primaryDriver}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}