"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { geoOrthographic, geoEqualEarth, geoPath, geoGraticule } from "d3-geo";
import type { Topology } from "topojson-specification";
import * as topojson from "topojson-client";
import type { FeatureCollection } from "geojson";
import {
  ETHIOPIA_CENTROID,
  GLOBAL_PARTNER_COUNTRIES,
  MIGRATION_CORRIDORS,
  type GlobalPartnerCountry,
} from "@/lib/geo/migrationData";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { ChartTooltipOverlay } from "@/components/charts/ChartTooltipOverlay";
import { MapSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/charts/ErrorState";
import { EmptyState } from "@/components/charts/EmptyState";
import { formatNumber } from "@/lib/utils";
import {
  Globe2,
  Map as MapIcon,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Compass,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface GlobeViewportProps {
  initialTopology?: Topology;
  selectedMetric: "emigrants" | "refugees_abroad" | "refugees_hosted" | "corridors";
  selectedYear: number;
  selectedCountry: GlobalPartnerCountry | null;
  onSelectCountry: (country: GlobalPartnerCountry | null) => void;
  selectedCorridorId?: string;
  className?: string;
}

interface GlobeSvgCanvasProps {
  worldGeojson: FeatureCollection;
  projectionMode: "3d" | "2d";
  zoom: number;
  rotation: [number, number, number];
  width: number;
  height: number;
  boundedWidth: number;
  boundedHeight: number;
  margin: { top: number; right: number; bottom: number; left: number };
  partnerMap: Map<string, GlobalPartnerCountry>;
  selectedCountry: GlobalPartnerCountry | null;
  selectedMetric: "emigrants" | "refugees_abroad" | "refugees_hosted" | "corridors";
  selectedYear: number;
  selectedCorridorId?: string;
  onSelectCountry: (country: GlobalPartnerCountry) => void;
  centerOnCountry: (coords: [number, number]) => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  graticuleLines: any;
}

function GlobeSvgCanvas({
  worldGeojson,
  projectionMode,
  zoom,
  rotation,
  width,
  height,
  boundedWidth,
  boundedHeight,
  margin,
  partnerMap,
  selectedCountry,
  selectedMetric,
  selectedYear,
  selectedCorridorId,
  onSelectCountry,
  centerOnCountry,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  graticuleLines,
}: GlobeSvgCanvasProps) {
  const [hoveredCountry, setHoveredCountry] = useState<{
    country: GlobalPartnerCountry;
    x: number;
    y: number;
  } | null>(null);

  // Memoize D3 projection, path generator, graticule, country paths, flight arcs, and corridors
  const {
    globeRadius,
    centerPoint,
    ethCoords,
    graticulePath,
    countryFeatures,
    flightArcs,
    corridors,
  } = useMemo(() => {
    const radius = Math.min(boundedWidth, boundedHeight) * 0.45 * zoom;
    const center: [number, number] = [
      margin.left + boundedWidth / 2,
      margin.top + boundedHeight / 2,
    ];

    const proj =
      projectionMode === "3d"
        ? geoOrthographic()
            .scale(radius)
            .translate(center)
            .rotate(rotation)
            .clipAngle(90)
        : geoEqualEarth()
            .scale((boundedWidth / 5.8) * zoom)
            .translate(center);

    const pathGen = geoPath().projection(proj);
    const eth = proj(ETHIOPIA_CENTROID);
    const grat = pathGen(graticuleLines) || "";

    const cFeatures = (worldGeojson.features || []).map((feature: any, idx: number) => {
      const numericId = String(feature.id);
      const isEthiopia = numericId === "231";
      const partner = partnerMap.get(numericId);
      const pathD = pathGen(feature);
      return {
        feature,
        idx,
        numericId,
        isEthiopia,
        partner,
        pathD,
      };
    });

    const arcs = GLOBAL_PARTNER_COUNTRIES.map((partner) => {
      const arcFeature = {
        type: "LineString" as const,
        coordinates: [ETHIOPIA_CENTROID, partner.coordinates],
      };
      return {
        partner,
        pathD: pathGen(arcFeature),
      };
    });

    const corrPaths = MIGRATION_CORRIDORS.map((corridor) => {
      const corridorLine = {
        type: "LineString" as const,
        coordinates: corridor.waypoints,
      };
      return {
        corridor,
        pathD: pathGen(corridorLine),
      };
    });

    return {
      globeRadius: radius,
      centerPoint: center,
      ethCoords: eth,
      graticulePath: grat,
      countryFeatures: cFeatures,
      flightArcs: arcs,
      corridors: corrPaths,
    };
  }, [
    worldGeojson,
    projectionMode,
    zoom,
    rotation,
    boundedWidth,
    boundedHeight,
    margin,
    partnerMap,
    graticuleLines,
  ]);

  return (
    <>
      <svg
        width={width}
        height={height}
        className={`overflow-hidden select-none bg-ink-950/60 rounded-lg border border-ink-800/80 ${
          projectionMode === "3d" ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setHoveredCountry(null);
        }}
      >
        <defs>
          {/* Globe Atmosphere Radial Gradient */}
          <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#202c14" stopOpacity="1" />
            <stop offset="95%" stopColor="#283618" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#606c38" stopOpacity="0.4" />
          </radialGradient>

          {/* Flight Arc Dash Marker */}
          <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bc6c25" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#dda15e" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* 3D Sphere Background (Oceans) */}
        {projectionMode === "3d" && (
          <circle
            cx={centerPoint[0]}
            cy={centerPoint[1]}
            r={globeRadius}
            fill="url(#globeGlow)"
            stroke="var(--ink-700)"
            strokeWidth={1.5}
          />
        )}

        {/* Graticule Grid Lines */}
        <path
          d={graticulePath}
          fill="none"
          stroke="var(--ink-700)"
          strokeWidth={0.6}
          opacity={0.6}
        />

        {/* World Countries Landmass */}
        <g className="transition-all duration-75">
          {countryFeatures.map(({ feature, idx, numericId, isEthiopia, partner, pathD }) => {
            if (!pathD) return null; // Clipped by hemisphere in 3D mode

            const isSelected = selectedCountry?.numericId === numericId;

            let fillColor = "#2d3c1c"; // Base continent color
            if (isEthiopia) {
              fillColor = "#bc6c25"; // Tiger's Eye beacon for Ethiopia
            } else if (isSelected) {
              fillColor = "#606c38"; // Highlight selected partner
            } else if (partner) {
              fillColor =
                selectedMetric === "refugees_hosted" && partner.refugeesHostedInEthiopia
                  ? "#9e551e"
                  : selectedMetric === "refugees_abroad"
                  ? "#c87834"
                  : "#426b66"; // River teal for emigrant destinations
            }

            return (
              <path
                key={feature.id || `world_${idx}`}
                d={pathD}
                fill={fillColor}
                stroke={
                  isEthiopia
                    ? "#dda15e"
                    : isSelected
                    ? "#ffffff"
                    : partner
                    ? "#dda15e"
                    : "var(--ink-700)"
                }
                strokeWidth={isEthiopia ? 1.8 : isSelected ? 1.5 : partner ? 1 : 0.4}
                tabIndex={partner || isEthiopia ? 0 : -1}
                role="img"
                aria-label={
                  isEthiopia
                    ? "Ethiopia (Origin & Host Country)"
                    : partner
                    ? `${partner.name}: ${formatNumber(
                        partner.emigrantStocks[selectedYear] || 0
                      )} emigrants`
                    : feature.properties?.name || "Country"
                }
                className={
                  partner || isEthiopia
                    ? "cursor-pointer transition-colors focus:outline-none focus:stroke-white"
                    : ""
                }
                onMouseEnter={(e) => {
                  if (partner) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredCountry({
                      country: partner,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }
                }}
                onClick={() => {
                  if (partner) {
                    onSelectCountry(partner);
                    if (projectionMode === "3d") {
                      centerOnCountry(partner.coordinates);
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (partner && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onSelectCountry(partner);
                    if (projectionMode === "3d") {
                      centerOnCountry(partner.coordinates);
                    }
                  }
                }}
              />
            );
          })}
        </g>

        {/* Great Circle Flight Arcs from Ethiopia */}
        <g className="pointer-events-none">
          {flightArcs.map(({ partner, pathD }) => {
            if (!pathD) return null; // Clipped on back hemisphere

            const isSelected = selectedCountry?.iso === partner.iso;
            const currentStock = partner.emigrantStocks[selectedYear] || 0;

            return (
              <path
                key={`arc_${partner.iso}`}
                d={pathD}
                fill="none"
                stroke={isSelected ? "#f59e0b" : "url(#arcGradient)"}
                strokeWidth={isSelected ? 2.5 : Math.max(1, Math.min(3, currentStock / 100000))}
                strokeDasharray={isSelected ? "none" : "4 3"}
                opacity={isSelected ? 1 : 0.65}
                className="transition-all duration-200"
              />
            );
          })}
        </g>

        {/* Corridor Route Paths (When Corridors Mode is Active) */}
        {selectedMetric === "corridors" && (
          <g className="pointer-events-none">
            {corridors.map(({ corridor, pathD }) => {
              const isSelected = selectedCorridorId === corridor.id;
              if (!pathD) return null;

              return (
                <path
                  key={corridor.id}
                  d={pathD}
                  fill="none"
                  stroke={
                    corridor.routeType === "Eastern Route"
                      ? "#f59e0b"
                      : corridor.routeType === "Southern Route"
                      ? "#10b981"
                      : "#ef4444"
                  }
                  strokeWidth={isSelected ? 3.5 : 2}
                  opacity={0.9}
                />
              );
            })}
          </g>
        )}

        {/* Ethiopia Origin Beacon Pin */}
        {ethCoords && (
          <g transform={`translate(${ethCoords[0]}, ${ethCoords[1]})`} className="pointer-events-none">
            <circle r={6} fill="#f59e0b" opacity={0.4} className="animate-ping" />
            <circle r={4} fill="#f59e0b" stroke="#ffffff" strokeWidth={1.5} />
          </g>
        )}
      </svg>

      {/* Tooltip Overlay */}
      {hoveredCountry && (
        <ChartTooltipOverlay
          x={boundedWidth / 2}
          y={20}
          containerWidth={width}
          containerHeight={height}
          visible={hoveredCountry !== null}
          title={hoveredCountry.country.name}
          source="UN DESA / UNHCR Global Datasets"
          referenceDate={`${selectedYear}`}
        >
          <div className="space-y-1 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Emigrant Stock ({selectedYear}):</span>
              <strong className="text-cyan-400">
                {formatNumber(hoveredCountry.country.emigrantStocks[selectedYear] || 0)}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Refugees Hosted Abroad:</span>
              <strong className="text-amber-400">
                {formatNumber(hoveredCountry.country.refugeesAbroad)}
              </strong>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-ink-800 text-[11px]">
              <span className="text-slate-400">Corridor:</span>
              <span className="text-slate-200">{hoveredCountry.country.corridor}</span>
            </div>
          </div>
        </ChartTooltipOverlay>
      )}
    </>
  );
}

export function GlobeViewport({
  initialTopology,
  selectedMetric,
  selectedYear,
  selectedCountry,
  onSelectCountry,
  selectedCorridorId,
  className,
}: GlobeViewportProps) {
  // Projection mode: 3D Orthographic Globe vs 2D Equal Earth Map
  const [projectionMode, setProjectionMode] = useState<"3d" | "2d">("3d");

  // Globe spherical rotation [lambda, phi, gamma]
  // Centered by default around Horn of Africa: [-38, -9, 0]
  const [rotation, setRotation] = useState<[number, number, number]>([-38, -9, 0]);

  // Zoom level multiplier (1 = normal fit)
  const [zoom, setZoom] = useState<number>(1);

  // Drag interaction refs
  const isDragging = useRef<boolean>(false);
  const dragStart = useRef<{ x: number; y: number; rotation: [number, number, number] }>({
    x: 0,
    y: 0,
    rotation: [-38, -9, 0],
  });

  // World GeoJSON countries
  const [worldGeojson, setWorldGeojson] = useState<FeatureCollection | null>(() => {
    if (initialTopology && initialTopology.objects?.countries) {
      return topojson.feature(initialTopology, initialTopology.objects.countries) as FeatureCollection;
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(!worldGeojson);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState<number>(0);

  // Load TopoJSON if not passed initially
  useEffect(() => {
    if (worldGeojson) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const boundaryFile = "/data/boundaries/world-110m.topojson";
    const fetchUrl =
      typeof window !== "undefined" && window.location?.origin && window.location.origin !== "null"
        ? `${window.location.origin}${boundaryFile}`
        : boundaryFile;

    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((topo: Topology) => {
        if (!isMounted) return;
        if (topo.objects?.countries) {
          const geo = topojson.feature(topo, topo.objects.countries) as FeatureCollection;
          setWorldGeojson(geo);
        } else {
          throw new Error("Invalid TopoJSON: missing 'countries' object");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "Failed to load world topology");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [worldGeojson, retryKey]);

  // Partner countries map by numeric ID and ISO
  const partnerMap = useMemo(() => {
    const map = new Map<string, GlobalPartnerCountry>();
    for (const c of GLOBAL_PARTNER_COUNTRIES) {
      map.set(c.numericId, c);
      map.set(c.iso, c);
    }
    return map;
  }, []);

  // Graticule generator
  const graticuleLines = useMemo(() => geoGraticule()(), []);

  // Mouse drag handlers for spherical rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (projectionMode !== "3d") return;
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      rotation: [...rotation],
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || projectionMode !== "3d") return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    // Sensible sensitivity coefficient for fluid rotation
    const sensitivity = 0.35 / zoom;
    const nextLambda = dragStart.current.rotation[0] + dx * sensitivity;
    const nextPhi = Math.max(-85, Math.min(85, dragStart.current.rotation[1] - dy * sensitivity));

    setRotation([nextLambda, nextPhi, dragStart.current.rotation[2]]);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const centerOnCountry = (coords: [number, number]) => {
    setRotation([-coords[0], -coords[1], 0]);
  };

  return (
    <div className={`space-y-4 rounded-lg border border-ink-700 bg-ink-900/80 p-5 ${className || ""}`}>
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <Globe2 className="h-4 w-4" />
            <span>Interactive Cartographic Viewport</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-100">
            {projectionMode === "3d" ? "Interactive 3D Migration Globe" : "2D Accessible World Map"}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Spherical rotation, bilateral flight arcs, and key Horn of Africa mobility corridors.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          {/* Projection Mode Switcher */}
          <div className="flex items-center rounded-md bg-ink-950 p-1 border border-ink-800" role="group" aria-label="Projection display mode">
            <button
              type="button"
              onClick={() => setProjectionMode("3d")}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                projectionMode === "3d"
                  ? "bg-cyan-500/20 text-cyan-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Globe2 className="h-3.5 w-3.5" />
              <span>3D Globe</span>
            </button>
            <button
              type="button"
              onClick={() => setProjectionMode("2d")}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                projectionMode === "2d"
                  ? "bg-ink-800 text-slate-100 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span>2D Fallback</span>
            </button>
          </div>

          {/* 3D Rotation Controls */}
          {projectionMode === "3d" && (
            <div className="flex items-center gap-1 rounded-md bg-ink-950 p-1 border border-ink-800" role="group" aria-label="Globe rotation controls">
              <button
                type="button"
                onClick={() => setRotation((r) => [r[0] - 20, r[1], 0])}
                aria-label="Rotate left"
                title="Rotate Left"
                className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-ink-800 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => [r[0] + 20, r[1], 0])}
                aria-label="Rotate right"
                title="Rotate Right"
                className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-ink-800 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRotation([-38, -9, 0])}
                aria-label="Center on Ethiopia"
                title="Center on Ethiopia"
                className="px-2 py-0.5 rounded text-[10px] text-cyan-400 hover:bg-ink-800 flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              >
                <Compass className="h-3 w-3" />
                <span>Center Horn</span>
              </button>
            </div>
          )}

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 rounded-md bg-ink-950 p-1 border border-ink-800" role="group" aria-label="Map zoom controls">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.5, Math.round((z + 0.2) * 10) / 10))}
              aria-label="Zoom in"
              className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-ink-800 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.7, Math.round((z - 0.2) * 10) / 10))}
              aria-label="Zoom out"
              className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-ink-800 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setRotation([-38, -9, 0]);
              }}
              aria-label="Reset view"
              className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 hover:text-slate-100 hover:bg-ink-800 flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative">
        <ChartContainer
          ariaLabel="Global migration atlas and bilateral diaspora corridors"
          minHeight={460}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          {({ width, height, boundedWidth, boundedHeight, margin }) => {
            if (loading) {
              return (
                <MapSkeleton
                  title="Loading global world boundaries and flight corridors..."
                  minHeight={460}
                />
              );
            }

            if (error) {
              return (
                <ErrorState
                  title="World Map Cartography Unavailable"
                  message={error}
                  onRetry={() => setRetryKey((k) => k + 1)}
                  actionText="Retry Loading Boundaries"
                  suggestions={[
                    "Verify connectivity to /data/boundaries/world-110m.topojson",
                    "Try switching to 2D Equal Earth projection mode",
                  ]}
                />
              );
            }

            if (!worldGeojson) {
              return (
                <EmptyState
                  title="No World Geometry Loaded"
                  description="Global geographic polygon data could not be parsed."
                  actionText="Reload Globe"
                  onAction={() => setRetryKey((k) => k + 1)}
                />
              );
            }

            return (
              <GlobeSvgCanvas
                worldGeojson={worldGeojson}
                projectionMode={projectionMode}
                zoom={zoom}
                rotation={rotation}
                width={width}
                height={height}
                boundedWidth={boundedWidth}
                boundedHeight={boundedHeight}
                margin={margin}
                partnerMap={partnerMap}
                selectedCountry={selectedCountry}
                selectedMetric={selectedMetric}
                selectedYear={selectedYear}
                selectedCorridorId={selectedCorridorId}
                onSelectCountry={onSelectCountry}
                centerOnCountry={centerOnCountry}
                handleMouseDown={handleMouseDown}
                handleMouseMove={handleMouseMove}
                handleMouseUp={handleMouseUp}
                graticuleLines={graticuleLines}
              />
            );
          }}
        </ChartContainer>
      </div>

      {/* Legend & Instructions */}
      <div className="pt-2 border-t border-ink-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 border border-white" />
            <span className="text-slate-300">Ethiopia (Origin)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-cyan-600 border border-cyan-400" />
            <span className="text-slate-300">Diaspora Partner State</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-cyan-400 border-dashed" />
            <span className="text-slate-300">Great Circle Flight Arc</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          {projectionMode === "3d"
            ? "Click & drag the globe to rotate. Click any country to inspect bilateral stats."
            : "Accessible 2D equal-area world map view."}
        </div>
      </div>

      {/* Screen Reader Accessible Table Fallback */}
      <table className="sr-only" aria-label="International migration and diaspora partner countries table">
        <caption>
          Bilateral Ethiopian emigrant stock, refugee population, and corridor destination statistics
        </caption>
        <thead>
          <tr>
            <th scope="col">Partner Country</th>
            <th scope="col">ISO</th>
            <th scope="col">Emigrant Stock ({selectedYear})</th>
            <th scope="col">Refugees Abroad</th>
            <th scope="col">Corridor</th>
          </tr>
        </thead>
        <tbody>
          {GLOBAL_PARTNER_COUNTRIES.map((c) => (
            <tr key={c.iso}>
              <th scope="row">{c.name}</th>
              <td>{c.iso}</td>
              <td>{(c.emigrantStocks[selectedYear] || 0).toLocaleString()}</td>
              <td>{c.refugeesAbroad.toLocaleString()}</td>
              <td>{c.corridor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}