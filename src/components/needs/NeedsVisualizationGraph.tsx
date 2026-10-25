"use client";

import React, { useState, useMemo } from "react";
import {
  REGIONAL_NEEDS_PROFILES,
  SECTOR_DEFINITIONS,
  RegionNeedsProfile,
  HumanitarianSector,
  SeverityLevel,
} from "@/lib/data/humanitarianNeeds";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import {
  Tent,
  Droplets,
  Utensils,
  ShieldCheck,
  HeartPulse,
  BarChart3,
  Compass,
  LayoutGrid,
  ArrowUpDown,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles,
  Flame,
  ShieldAlert,
} from "lucide-react";

interface NeedsVisualizationGraphProps {
  selectedRegionId?: string | null;
  onSelectRegion?: (profile: RegionNeedsProfile) => void;
}

type GraphSubView = "clustered" | "radar" | "heatgrid";
type SortOption = "caseload" | "shelter" | "wash" | "food_security" | "protection" | "health";
type FilterOption = "all" | "emergency_only" | "critical_only";

export function NeedsVisualizationGraph({
  selectedRegionId,
  onSelectRegion,
}: NeedsVisualizationGraphProps) {
  const [subView, setSubView] = useState<GraphSubView>("clustered");
  const [sortBy, setSortBy] = useState<SortOption>("caseload");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [radarRegionId, setRadarRegionId] = useState<string>(
    selectedRegionId || REGIONAL_NEEDS_PROFILES[0]?.regionId || "ET01"
  );
  const [hoveredPoint, setHoveredPoint] = useState<{
    regionName: string;
    sector: string;
    value: number;
    severity: string;
    notes?: string;
  } | null>(null);

  // Sync radar selection if prop changes
  React.useEffect(() => {
    if (selectedRegionId) {
      setRadarRegionId(selectedRegionId);
    }
  }, [selectedRegionId]);

  // Sector metadata array for iteration
  const sectorList: Array<{
    key: HumanitarianSector;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgBadge: string;
    nationalAvg: number;
  }> = [
    {
      key: "shelter",
      name: "Emergency Shelter",
      icon: Tent,
      color: "text-amber-400",
      bgBadge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      nationalAvg: SECTOR_DEFINITIONS.shelter.nationalAverage,
    },
    {
      key: "wash",
      name: "WASH & Water",
      icon: Droplets,
      color: "text-sky-400",
      bgBadge: "bg-sky-500/20 text-sky-300 border-sky-500/40",
      nationalAvg: SECTOR_DEFINITIONS.wash.nationalAverage,
    },
    {
      key: "food_security",
      name: "Food Security (IPC 3+)",
      icon: Utensils,
      color: "text-emerald-400",
      bgBadge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      nationalAvg: SECTOR_DEFINITIONS.food_security.nationalAverage,
    },
    {
      key: "protection",
      name: "Protection & Safety",
      icon: ShieldCheck,
      color: "text-purple-400",
      bgBadge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      nationalAvg: SECTOR_DEFINITIONS.protection.nationalAverage,
    },
    {
      key: "health",
      name: "Health & Nutrition",
      icon: HeartPulse,
      color: "text-rose-400",
      bgBadge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      nationalAvg: SECTOR_DEFINITIONS.health.nationalAverage,
    },
  ];

  // Filter and sort regional profiles
  const processedProfiles = useMemo(() => {
    let list = [...REGIONAL_NEEDS_PROFILES];

    // Filter
    if (filterBy === "emergency_only") {
      list = list.filter((p) => p.foodInsecurityPhase.includes("Emergency"));
    } else if (filterBy === "critical_only") {
      list = list.filter((p) =>
        Object.values(p.scores).some((s) => s.severity === "critical")
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "caseload") {
        return b.totalIdpCaseload - a.totalIdpCaseload;
      }
      const valA = a.scores[sortBy]?.value ?? 0;
      const valB = b.scores[sortBy]?.value ?? 0;
      return valB - valA;
    });

    return list;
  }, [filterBy, sortBy]);

  // Selected radar profile
  const activeRadarProfile = useMemo(() => {
    return (
      REGIONAL_NEEDS_PROFILES.find((p) => p.regionId === radarRegionId) ||
      REGIONAL_NEEDS_PROFILES[0]
    );
  }, [radarRegionId]);

  // Quick shot highlight metrics
  const quickShotStats = useMemo(() => {
    let highestWash = { region: "", val: 0 };
    let highestShelter = { region: "", val: 0 };
    let emergencyCount = 0;
    let criticalCount = 0;

    REGIONAL_NEEDS_PROFILES.forEach((p) => {
      if ((p.scores.wash.value ?? 0) > highestWash.val) {
        highestWash = { region: p.regionName, val: p.scores.wash.value! };
      }
      if ((p.scores.shelter.value ?? 0) > highestShelter.val) {
        highestShelter = { region: p.regionName, val: p.scores.shelter.value! };
      }
      if (p.foodInsecurityPhase.includes("Emergency")) {
        emergencyCount++;
      }
      const hasCritical = Object.values(p.scores).some((s) => (s.value ?? 0) >= 60);
      if (hasCritical) criticalCount++;
    });

    return { highestWash, highestShelter, emergencyCount, criticalCount };
  }, []);

  const getSeverityColor = (val: number | null) => {
    if (val === null) return "bg-ink-800 text-slate-500 border-ink-700";
    if (val >= 60) return "bg-red-500/20 text-red-300 border-red-500/40 font-bold";
    if (val >= 40) return "bg-orange-500/20 text-orange-300 border-orange-500/40 font-semibold";
    if (val >= 20) return "bg-yellow-500/15 text-yellow-300 border-yellow-500/30";
    return "bg-blue-500/15 text-blue-300 border-blue-500/30";
  };

  const getSeverityBarColor = (val: number | null) => {
    if (val === null) return "bg-ink-700";
    if (val >= 60) return "bg-red-500";
    if (val >= 40) return "bg-amber-500";
    if (val >= 20) return "bg-yellow-400";
    return "bg-sky-400";
  };

  // Radar chart mathematical coordinates computation
  const radarCoords = useMemo(() => {
    const size = 320;
    const center = size / 2;
    const radius = 110;
    const sectorsCount = 5;

    // Angle step (starting at top: -PI/2)
    const getAngle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / sectorsCount;

    // Axis endpoints
    const axes = sectorList.map((sec, i) => {
      const angle = getAngle(i);
      return {
        ...sec,
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
        labelX: center + (radius + 28) * Math.cos(angle),
        labelY: center + (radius + 20) * Math.sin(angle),
        angle,
      };
    });

    // Concentric grid polygons (20%, 40%, 60%, 80%, 100%)
    const rings = [20, 40, 60, 80, 100].map((pct) => {
      const r = (radius * pct) / 100;
      const points = Array.from({ length: sectorsCount }).map((_, i) => {
        const angle = getAngle(i);
        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
      });
      return { pct, pointsString: points.join(" ") };
    });

    // Profile polygon points
    const getPolygonPoints = (profile: RegionNeedsProfile) => {
      return sectorList.map((sec, i) => {
        const angle = getAngle(i);
        const val = profile.scores[sec.key]?.value ?? 0;
        const r = (radius * Math.min(100, Math.max(0, val))) / 100;
        return {
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
          val,
          sector: sec.name,
        };
      });
    };

    // National average polygon points
    const nationalPoints = sectorList.map((sec, i) => {
      const angle = getAngle(i);
      const val = sec.nationalAvg;
      const r = (radius * Math.min(100, Math.max(0, val))) / 100;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        val,
      };
    });

    const currentPoints = getPolygonPoints(activeRadarProfile);

    return {
      size,
      center,
      radius,
      axes,
      rings,
      currentPoints,
      currentPointsString: currentPoints.map((p) => `${p.x},${p.y}`).join(" "),
      nationalPointsString: nationalPoints.map((p) => `${p.x},${p.y}`).join(" "),
      nationalPoints,
    };
  }, [activeRadarProfile]);

  return (
    <div className="space-y-4 rounded-xl border border-ink-800 bg-ink-950/80 p-4 sm:p-5 shadow-lg">
      {/* Quick Shot Executive Snapshot Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-red-400 uppercase tracking-wider font-semibold">
            <Droplets className="h-3.5 w-3.5 text-sky-400" />
            <span>Highest Water Deficit</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-100 flex items-baseline gap-1.5">
            <span>{quickShotStats.highestWash.val}%</span>
            <span className="text-xs font-sans text-red-300 font-medium">
              {quickShotStats.highestWash.region}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Severe pastoral borehole salinization & drying berkhads.
          </p>
        </div>

        <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
            <Tent className="h-3.5 w-3.5 text-amber-400" />
            <span>Highest Shelter Gap</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-100 flex items-baseline gap-1.5">
            <span>{quickShotStats.highestShelter.val}%</span>
            <span className="text-xs font-sans text-amber-300 font-medium">
              {quickShotStats.highestShelter.region}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Congested collective camps and makeshift weatherproofing deficits.
          </p>
        </div>

        <div className="rounded-lg border border-orange-500/30 bg-orange-950/20 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-orange-400 uppercase tracking-wider font-semibold">
            <Utensils className="h-3.5 w-3.5 text-emerald-400" />
            <span>IPC Phase 4 Emergency</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-100 flex items-baseline gap-1.5">
            <span>{quickShotStats.emergencyCount} Regions</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Tigray, Somali & Afar face catastrophic food consumption gaps.
          </p>
        </div>

        <div className="rounded-lg border border-purple-500/30 bg-purple-950/20 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-purple-400 uppercase tracking-wider font-semibold">
            <ShieldAlert className="h-3.5 w-3.5 text-purple-400" />
            <span>Sphere Benchmark Deficit</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-100 flex items-baseline gap-1.5">
            <span>{quickShotStats.criticalCount} of {REGIONAL_NEEDS_PROFILES.length}</span>
            <span className="text-xs font-sans text-purple-300 font-medium">Regions</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Breach critical Sphere emergency threshold (&gt;60%) in ≥1 cluster.
          </p>
        </div>
      </div>

      {/* Visual Mode Navigation & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-y border-ink-800 py-3">
        {/* Sub-view switcher */}
        <div className="flex items-center gap-1 bg-ink-900 p-1 rounded-lg border border-ink-800 self-start">
          <button
            type="button"
            onClick={() => setSubView("clustered")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              subView === "clustered"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5 text-amber-400" />
            <span>Cluster Comparison</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView("radar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              subView === "radar"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Compass className="h-3.5 w-3.5 text-amber-400" />
            <span>Vulnerability Radar</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView("heatgrid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              subView === "heatgrid"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5 text-amber-400" />
            <span>Heat Matrix</span>
          </button>
        </div>

        {/* Filter and Sort options */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {subView !== "radar" && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3" />
                <span>Sort:</span>
              </span>
              <select
                aria-label="Sort visualization data by metric"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-ink-900 border border-ink-800 rounded px-2 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
              >
                <option value="caseload">IDP Caseload</option>
                <option value="shelter">Shelter Deficit</option>
                <option value="wash">WASH Deficit</option>
                <option value="food_security">Food IPC 3+</option>
                <option value="protection">Protection Gap</option>
                <option value="health">Health Gap</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFilterBy("all")}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                filterBy === "all"
                  ? "bg-ink-800 text-slate-100 font-bold border border-ink-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All ({REGIONAL_NEEDS_PROFILES.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterBy("emergency_only")}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                filterBy === "emergency_only"
                  ? "bg-red-500/20 text-red-300 font-bold border border-red-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Emergency IPC 4
            </button>
            <button
              type="button"
              onClick={() => setFilterBy("critical_only")}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                filterBy === "critical_only"
                  ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Critical (&gt;60%)
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: Multi-Cluster Clustered Comparison View */}
      {subView === "clustered" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-1 pb-1">
            <span className="font-mono text-[11px]">
              Showing {processedProfiles.length} monitored regional states with 5-cluster deficit bars.
            </span>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                <span>&gt;60% Critical</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                <span>40–60% Severe</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                <span>20–40% Moderate</span>
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {processedProfiles.map((profile) => {
              const isSelected =
                selectedRegionId === profile.regionId || radarRegionId === profile.regionId;

              return (
                <div
                  key={profile.regionId}
                  tabIndex={0}
                  role="button"
                  aria-label={`Inspect ${profile.regionName} humanitarian profile: ${formatNumber(profile.totalIdpCaseload)} IDPs`}
                  onClick={() => {
                    setRadarRegionId(profile.regionId);
                    if (onSelectRegion) onSelectRegion(profile);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setRadarRegionId(profile.regionId);
                      if (onSelectRegion) onSelectRegion(profile);
                    }
                  }}
                  className={`p-3 rounded-lg border transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                    isSelected
                      ? "border-amber-500/60 bg-ink-900/90 shadow-md ring-1 ring-amber-500/30"
                      : "border-ink-800/80 bg-ink-900/40 hover:bg-ink-900/70 hover:border-ink-700"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">{profile.regionName}</span>
                      <span className="text-xs font-mono text-amber-400">
                        {formatNumber(profile.totalIdpCaseload)} IDPs
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        ({profile.assessedSitesCount} sites)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          profile.foodInsecurityPhase.includes("Emergency")
                            ? "terracotta"
                            : profile.foodInsecurityPhase.includes("Crisis")
                            ? "ember"
                            : "muted"
                        }
                        size="sm"
                      >
                        {profile.foodInsecurityPhase.split(":")[0]}
                      </Badge>
                      <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                        {profile.lastAssessed}
                      </span>
                    </div>
                  </div>

                  {/* 5-Sector Bar Grid with Sphere 60% Critical Indicator */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
                    {sectorList.map((sec) => {
                      const score = profile.scores[sec.key];
                      const val = score?.value ?? 0;
                      const Icon = sec.icon;

                      return (
                        <div
                          key={sec.key}
                          className="bg-ink-950/70 p-2 rounded border border-ink-800/60 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="flex items-center gap-1 text-slate-300 truncate font-medium">
                              <Icon className="h-3 w-3 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{sec.name.split(" ")[0]}</span>
                            </span>
                            <span
                              className={`font-mono text-xs font-bold ${
                                val >= 60
                                  ? "text-red-400"
                                  : val >= 40
                                  ? "text-orange-400"
                                  : "text-yellow-400"
                              }`}
                            >
                              {val}%
                            </span>
                          </div>

                          {/* Relative Progress Bar with Sphere 60% Marker */}
                          <div className="relative h-2 w-full bg-ink-900 rounded overflow-hidden">
                            <div
                              className={`h-full rounded transition-all duration-300 ${getSeverityBarColor(
                                val
                              )}`}
                              style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                            />
                            {/* Sphere 60% threshold tick line */}
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-red-400/80 z-10"
                              style={{ left: "60%" }}
                              title="Sphere Critical Threshold (60%)"
                            />
                          </div>

                          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-1">
                            <span>0%</span>
                            <span className="text-red-400/90">60% Sphere</span>
                            <span>100%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: 5-Axis Vulnerability Radar / Pentagon Spider Chart */}
      {subView === "radar" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-ink-900/60 p-3 rounded-lg border border-ink-800">
            <div>
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-amber-400" />
                <span>Sector Deficit Footprint vs. Sphere Standards</span>
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Displays multi-cluster vulnerability geometry. An outward bulge indicates severe single-sector deficits.
              </p>
            </div>

            {/* Region Selector Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {REGIONAL_NEEDS_PROFILES.map((p) => {
                const isSelected = p.regionId === radarRegionId;
                return (
                  <button
                    key={p.regionId}
                    type="button"
                    onClick={() => {
                      setRadarRegionId(p.regionId);
                      if (onSelectRegion) onSelectRegion(p);
                    }}
                    className={`px-2.5 py-1 text-xs rounded font-medium transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                      isSelected
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold"
                        : "bg-ink-950 text-slate-400 hover:text-slate-200 border border-ink-800"
                    }`}
                  >
                    {p.regionName}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* SVG Radar Chart Canvas */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center p-2">
              <svg
                viewBox={`0 0 ${radarCoords.size} ${radarCoords.size}`}
                className="w-full max-w-[340px] sm:max-w-[380px] overflow-visible select-none"
                role="img"
                aria-label={`Humanitarian Vulnerability Radar for ${activeRadarProfile.regionName}`}
              >
                {/* Concentric Grid Rings */}
                {radarCoords.rings.map((ring) => (
                  <polygon
                    key={ring.pct}
                    points={ring.pointsString}
                    fill={ring.pct === 60 ? "rgba(239, 68, 68, 0.05)" : "none"}
                    stroke={
                      ring.pct === 60
                        ? "rgba(239, 68, 68, 0.6)"
                        : "rgba(255, 255, 255, 0.12)"
                    }
                    strokeWidth={ring.pct === 60 ? "1.5" : "1"}
                    strokeDasharray={ring.pct === 60 ? "3 3" : undefined}
                  />
                ))}

                {/* Ring percentage indicators */}
                <text
                  x={radarCoords.center + 4}
                  y={radarCoords.center - (radarCoords.radius * 60) / 100 - 2}
                  fontSize="8"
                  fontFamily="monospace"
                  fill="#f87171"
                  textAnchor="start"
                >
                  60% Critical
                </text>
                <text
                  x={radarCoords.center + 4}
                  y={radarCoords.center - radarCoords.radius - 2}
                  fontSize="8"
                  fontFamily="monospace"
                  fill="#94a3b8"
                  textAnchor="start"
                >
                  100%
                </text>

                {/* Radial Spokes */}
                {radarCoords.axes.map((axis, i) => (
                  <line
                    key={axis.key}
                    x1={radarCoords.center}
                    y1={radarCoords.center}
                    x2={axis.x}
                    y2={axis.y}
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="1"
                  />
                ))}

                {/* National Average Baseline Polygon (Dashed Grey/Amber) */}
                <polygon
                  points={radarCoords.nationalPointsString}
                  fill="rgba(255, 255, 255, 0.03)"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeOpacity="0.6"
                />

                {/* Active Region Polygon (Vibrant Gradient Fill) */}
                <polygon
                  points={radarCoords.currentPointsString}
                  fill="rgba(217, 119, 6, 0.25)"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  className="transition-all duration-300"
                />

                {/* Data Points on Vertices */}
                {radarCoords.currentPoints.map((point, i) => (
                  <g key={i}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="4.5"
                      fill={point.val >= 60 ? "#ef4444" : "#f59e0b"}
                      stroke="#0f172a"
                      strokeWidth="2"
                      className="cursor-pointer transition-transform hover:scale-125"
                    />
                    <text
                      x={point.x}
                      y={point.y - 8}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill="#ffffff"
                      textAnchor="middle"
                    >
                      {point.val}%
                    </text>
                  </g>
                ))}

                {/* Outer Labels */}
                {radarCoords.axes.map((axis) => {
                  const isTop = axis.labelY < radarCoords.center;
                  return (
                    <text
                      key={axis.key}
                      x={axis.labelX}
                      y={axis.labelY}
                      fontSize="9.5"
                      fontFamily="sans-serif"
                      fontWeight="600"
                      fill="#e2e8f0"
                      textAnchor={
                        Math.abs(axis.labelX - radarCoords.center) < 15
                          ? "middle"
                          : axis.labelX > radarCoords.center
                          ? "start"
                          : "end"
                      }
                      dominantBaseline={isTop ? "auto" : "hanging"}
                    >
                      {axis.name}
                    </text>
                  );
                })}
              </svg>

              {/* Radar Legend */}
              <div className="flex items-center gap-4 text-[11px] font-mono mt-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-amber-400 inline-block" />
                  <span className="text-slate-200 font-semibold">{activeRadarProfile.regionName}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-b border-dashed border-slate-400 inline-block" />
                  <span className="text-slate-400">National Average</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-b border-dashed border-red-500 inline-block" />
                  <span className="text-red-400">Sphere 60% Threshold</span>
                </span>
              </div>
            </div>

            {/* Profile Detail Card next to Radar */}
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-ink-900 p-4 rounded-lg border border-ink-800 space-y-3">
                <div className="flex items-center justify-between border-b border-ink-800 pb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">
                      {activeRadarProfile.regionName} Vulnerability Profile
                    </h4>
                    <span className="text-[11px] font-mono text-amber-400">
                      {formatNumber(activeRadarProfile.totalIdpCaseload)} Documented IDPs
                    </span>
                  </div>
                  <Badge
                    variant={
                      activeRadarProfile.foodInsecurityPhase.includes("Emergency")
                        ? "terracotta"
                        : "ember"
                    }
                    size="sm"
                  >
                    {activeRadarProfile.foodInsecurityPhase.split(":")[0]}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  {sectorList.map((sec) => {
                    const score = activeRadarProfile.scores[sec.key];
                    const val = score?.value ?? 0;
                    const diff = val - sec.nationalAvg;
                    const Icon = sec.icon;

                    return (
                      <div
                        key={sec.key}
                        className="flex items-center justify-between p-2 rounded bg-ink-950/80 border border-ink-800/60"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-300 truncate font-medium">{sec.name}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className={`font-bold ${val >= 60 ? "text-red-400" : "text-amber-400"}`}>
                            {val}%
                          </span>
                          <span
                            className={`text-[10px] ${
                              diff > 0 ? "text-red-400" : "text-emerald-400"
                            }`}
                          >
                            ({diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Priority action bullet */}
                <div className="pt-1 text-[11px] text-slate-400">
                  <strong className="text-slate-300 font-semibold block mb-1">
                    Primary Operational Bottleneck:
                  </strong>
                  <span className="italic leading-relaxed">
                    &ldquo;{activeRadarProfile.priorityConcerns[0]}&rdquo;
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Heat Matrix Grid with Severity Indicators */}
      {subView === "heatgrid" && (
        <div className="space-y-2">
          <div className="overflow-x-auto rounded-lg border border-ink-800 bg-ink-950">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-ink-900 border-b border-ink-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <tr>
                  <th scope="col" className="p-3 pl-4">Regional State</th>
                  <th scope="col" className="p-3 text-right">IDP Caseload</th>
                  {sectorList.map((sec) => {
                    const Icon = sec.icon;
                    return (
                      <th key={sec.key} scope="col" className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Icon className="h-3.5 w-3.5 text-slate-400" />
                          <span>{sec.name.split(" ")[0]}</span>
                        </div>
                      </th>
                    );
                  })}
                  <th scope="col" className="p-3 text-center pr-4">IPC Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800/60">
                {processedProfiles.map((profile) => {
                  const isSelected =
                    selectedRegionId === profile.regionId || radarRegionId === profile.regionId;

                  return (
                    <tr
                      key={profile.regionId}
                      tabIndex={0}
                      role="button"
                      aria-label={`Inspect ${profile.regionName}`}
                      onClick={() => {
                        setRadarRegionId(profile.regionId);
                        if (onSelectRegion) onSelectRegion(profile);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setRadarRegionId(profile.regionId);
                          if (onSelectRegion) onSelectRegion(profile);
                        }
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-ink-800/90 ring-1 ring-amber-500/50" : "hover:bg-ink-900/50"
                      }`}
                    >
                      <td className="p-3 pl-4 font-semibold text-slate-100">
                        {profile.regionName}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-400">
                        {formatNumber(profile.totalIdpCaseload)}
                      </td>

                      {sectorList.map((sec) => {
                        const score = profile.scores[sec.key];
                        const val = score?.value ?? 0;

                        return (
                          <td key={sec.key} className="p-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-mono border ${getSeverityColor(
                                  val
                                )}`}
                              >
                                {val}%
                              </span>
                              <div className="w-12 h-1 bg-ink-900 rounded overflow-hidden">
                                <div
                                  className={`h-full ${getSeverityBarColor(val)}`}
                                  style={{ width: `${val}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        );
                      })}

                      <td className="p-3 text-center pr-4">
                        <Badge
                          variant={
                            profile.foodInsecurityPhase.includes("Emergency")
                              ? "terracotta"
                              : "ember"
                          }
                          size="sm"
                        >
                          {profile.foodInsecurityPhase.split(":")[0]}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Accessible screen reader summary */}
      <div className="sr-only">
        <h4>Screen Reader Humanitarian Needs Dataset</h4>
        <table>
          <thead>
            <tr>
              <th>Region</th>
              <th>Caseload</th>
              <th>Shelter</th>
              <th>WASH</th>
              <th>Food</th>
              <th>Protection</th>
              <th>Health</th>
            </tr>
          </thead>
          <tbody>
            {REGIONAL_NEEDS_PROFILES.map((p) => (
              <tr key={p.regionId}>
                <td>{p.regionName}</td>
                <td>{p.totalIdpCaseload}</td>
                <td>{p.scores.shelter.value}%</td>
                <td>{p.scores.wash.value}%</td>
                <td>{p.scores.food_security.value}%</td>
                <td>{p.scores.protection.value}%</td>
                <td>{p.scores.health.value}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
