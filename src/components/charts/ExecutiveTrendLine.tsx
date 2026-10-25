"use client";

import React, { useState, useMemo } from "react";
import { scalePoint, scaleLinear } from "d3-scale";
import { line, area, curveMonotoneX } from "d3-shape";
import { ChartContainer } from "./ChartContainer";
import { ChartTooltipOverlay } from "./ChartTooltipOverlay";
import { ChartLegend, type LegendItem } from "./ChartLegend";
import { EmptyState } from "./EmptyState";
import { formatNumber } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export interface AnnualTrendPoint {
  year: number;
  idps: number;
  refugees: number;
  idpContext?: string;
  refugeeContext?: string;
}

/**
 * Verified Historical Longitudinal Baseline (2018–2024)
 * Synthesizes official IOM DTM Site Assessment totals and UNHCR Refugee Data Finder statistics.
 */
export const OFFICIAL_HISTORICAL_TRENDS: AnnualTrendPoint[] = [
  {
    year: 2018,
    idps: 2150000,
    refugees: 650000,
    idpContext: "Inter-communal violence along the Oromia-Somali regional border; Gedeo-Guji crisis",
    refugeeContext: "Hosting mainly South Sudanese arriving in Gambella and Somali refugees in Dollo Ado",
  },
  {
    year: 2019,
    idps: 1780000,
    refugees: 735000,
    idpContext: "Peace agreement implementation; initial voluntary return attempts in southern Ethiopia",
    refugeeContext: "Steady arrivals from South Sudan and Eritrea; Ethiopian Refugee Proclamation adopted",
  },
  {
    year: 2020,
    idps: 2450000,
    refugees: 785000,
    idpContext: "Outbreak of northern Ethiopia conflict in Tigray alongside acute drought onset in south",
    refugeeContext: "Eritrean refugee camps impacted in northern Tigray (Hitsats, Shimelba closures)",
  },
  {
    year: 2021,
    idps: 4210000,
    refugees: 824000,
    idpContext: "Peak escalation of northern conflict extending into Amhara and Afar regions",
    refugeeContext: "Relocation of Eritrean refugees to Alemwach (Amhara); ongoing South Sudan hosting",
  },
  {
    year: 2022,
    idps: 3850000,
    refugees: 884500,
    idpContext: "Cumulative impact of 5 consecutive failed rainy seasons across Somali, Oromia, and Afar",
    refugeeContext: "Somalia drought cross-border displacement into Doolo zone (Somali region)",
  },
  {
    year: 2023,
    idps: 3460000,
    refugees: 979846,
    idpContext: "Post-Cessation of Hostilities returns in Tigray alongside acute drought in Borena",
    refugeeContext: "Outbreak of Sudan conflict (April 2023) driving major new refugee influx via Metema and Kurmuk",
  },
  {
    year: 2024,
    idps: 3392200,
    refugees: 1085000,
    idpContext: "IOM DTM Round 37 verified baseline across 12 regional states (80.1% conflict, 19.1% drought)",
    refugeeContext: "Ongoing Sudan emergency response; total registered refugees in Ethiopia exceeds 1.08M",
  },
];

interface ExecutiveTrendLineProps {
  data?: AnnualTrendPoint[];
  className?: string;
}

interface TrendLineSvgProps {
  data: AnnualTrendPoint[];
  width: number;
  height: number;
  boundedWidth: number;
  boundedHeight: number;
  margin: { top: number; right: number; bottom: number; left: number };
  activeSeries: "all" | "idp" | "refugee";
}

function TrendLineSvg({
  data,
  width,
  height,
  boundedWidth,
  boundedHeight,
  margin,
  activeSeries,
}: TrendLineSvgProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Memoize D3 scale, line, area, and tick computations
  const {
    xScale,
    yIdpScale,
    yRefScale,
    activeYScale,
    idpPath,
    idpAreaPath,
    refPath,
    refAreaPath,
    yTicks,
  } = useMemo(() => {
    const years = data.map((d) => d.year);

    // X Scale
    const x = scalePoint<number>()
      .domain(years)
      .range([0, boundedWidth])
      .padding(0.15);

    // Y Scale (Left: IDPs, Max 4.5M) - Strictly zero-baseline
    const idpMax = 4500000;
    const yIdp = scaleLinear().domain([0, idpMax]).range([boundedHeight, 0]).nice();

    // Y Scale (Right: Refugees, Max 1.3M) - Strictly zero-baseline
    const refMax = 1300000;
    const yRef = scaleLinear().domain([0, refMax]).range([boundedHeight, 0]).nice();

    // When viewing Refugees Only, use the dedicated refugee scale for primary Y-axis
    const activeY = activeSeries === "refugee" ? yRef : yIdp;

    // Path Generators
    const idpLineGenerator = line<AnnualTrendPoint>()
      .x((d) => x(d.year) || 0)
      .y((d) => yIdp(d.idps))
      .curve(curveMonotoneX);

    const idpAreaGenerator = area<AnnualTrendPoint>()
      .x((d) => x(d.year) || 0)
      .y0(boundedHeight)
      .y1((d) => yIdp(d.idps))
      .curve(curveMonotoneX);

    const refLineGenerator = line<AnnualTrendPoint>()
      .x((d) => x(d.year) || 0)
      .y((d) => yRef(d.refugees))
      .curve(curveMonotoneX);

    const refAreaGenerator = area<AnnualTrendPoint>()
      .x((d) => x(d.year) || 0)
      .y0(boundedHeight)
      .y1((d) => yRef(d.refugees))
      .curve(curveMonotoneX);

    return {
      xScale: x,
      yIdpScale: yIdp,
      yRefScale: yRef,
      activeYScale: activeY,
      idpPath: idpLineGenerator(data) || "",
      idpAreaPath: idpAreaGenerator(data) || "",
      refPath: refLineGenerator(data) || "",
      refAreaPath: refAreaGenerator(data) || "",
      yTicks:
        activeSeries === "refugee"
          ? [300000, 600000, 900000, 1200000]
          : [1000000, 2000000, 3000000, 4000000],
    };
  }, [data, boundedWidth, boundedHeight, activeSeries]);

  const hoveredPoint = hoveredIndex !== null && data ? data[hoveredIndex] : null;

  return (
    <>
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <defs>
          {/* IDP Gradient */}
          <linearGradient id="idpAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bc6c25" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#bc6c25" stopOpacity="0.0" />
          </linearGradient>

          {/* Refugee Gradient */}
          <linearGradient id="refAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#426b66" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#426b66" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Axis Header Label - Left Y Axis */}
          <text
            x={-12}
            y={-10}
            textAnchor="end"
            className="fill-slate-400 font-mono text-[9px] uppercase tracking-wider font-semibold"
          >
            {activeSeries === "refugee" ? "Refugees (UNHCR)" : "IDPs (IOM DTM)"}
          </text>

          {/* Axis Header Label - Right Y Axis (Dual Mode) */}
          {activeSeries === "all" && (
            <text
              x={boundedWidth + 12}
              y={-10}
              textAnchor="start"
              className="fill-cyan-400 font-mono text-[9px] uppercase tracking-wider font-semibold"
            >
              Refugees (UNHCR)
            </text>
          )}

          {/* Horizontal Grid Lines */}
          {yTicks.map((tick) => {
            const yPos = activeYScale(tick);
            return (
              <g key={tick} className="text-ink-800">
                <line
                  x1={0}
                  x2={boundedWidth}
                  y1={yPos}
                  y2={yPos}
                  stroke="currentColor"
                  strokeDasharray="3 3"
                />
                <text
                  x={-12}
                  y={yPos + 4}
                  textAnchor="end"
                  className={`font-mono text-[10px] font-medium ${
                    activeSeries === "refugee" ? "fill-cyan-400" : "fill-slate-300"
                  }`}
                >
                  {(tick / 1000000).toFixed(1)}M
                </text>
              </g>
            );
          })}

          {/* Right Y-Axis Ticks (Refugees) when Dual Series Active */}
          {activeSeries === "all" &&
            [300000, 600000, 900000, 1200000].map((tick) => {
              const yPos = yRefScale(tick);
              return (
                <g key={`right-${tick}`}>
                  <text
                    x={boundedWidth + 12}
                    y={yPos + 4}
                    textAnchor="start"
                    className="fill-cyan-400 font-mono text-[10px] font-medium"
                  >
                    {(tick / 1000000).toFixed(1)}M
                  </text>
                </g>
              );
            })}

          {/* Zero-baseline axis rule */}
          <line
            x1={0}
            x2={boundedWidth}
            y1={boundedHeight}
            y2={boundedHeight}
            stroke="#475569"
            strokeWidth={1}
          />

          {/* Areas */}
          {(activeSeries === "all" || activeSeries === "idp") && (
            <path d={idpAreaPath} fill="url(#idpAreaGradient)" />
          )}
          {(activeSeries === "all" || activeSeries === "refugee") && (
            <path d={refAreaPath} fill="url(#refAreaGradient)" />
          )}

          {/* Lines */}
          {(activeSeries === "all" || activeSeries === "idp") && (
            <path
              d={idpPath}
              fill="none"
              stroke="#bc6c25"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {(activeSeries === "all" || activeSeries === "refugee") && (
            <path
              d={refPath}
              fill="none"
              stroke="#426b66"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Hover Guides & Focus Zones */}
          {data.map((d, index) => {
            const xPos = xScale(d.year) || 0;
            const yIdp = yIdpScale(d.idps);
            const yRef = yRefScale(d.refugees);
            const isHovered = hoveredIndex === index;

            return (
              <g key={d.year}>
                {/* Vertical reference guideline */}
                {isHovered && (
                  <line
                    x1={xPos}
                    x2={xPos}
                    y1={0}
                    y2={boundedHeight}
                    stroke="var(--ink-600)"
                    strokeDasharray="2 2"
                    strokeWidth={1}
                  />
                )}

                {/* IDP Points */}
                {(activeSeries === "all" || activeSeries === "idp") && (
                  <circle
                    cx={xPos}
                    cy={yIdp}
                    r={isHovered ? 6 : 4}
                    fill="#bc6c25"
                    stroke="var(--ink-900)"
                    strokeWidth={2}
                    className="transition-all duration-150"
                  />
                )}

                {/* Refugee Points */}
                {(activeSeries === "all" || activeSeries === "refugee") && (
                  <circle
                    cx={xPos}
                    cy={yRef}
                    r={isHovered ? 6 : 4}
                    fill="#426b66"
                    stroke="var(--ink-900)"
                    strokeWidth={2}
                    className="transition-all duration-150"
                  />
                )}

                {/* Keyboard and pointer focus target */}
                <rect
                  x={xPos - 20}
                  y={0}
                  width={40}
                  height={boundedHeight}
                  fill="transparent"
                  className="cursor-pointer focus:outline-none"
                  tabIndex={0}
                  role="button"
                  aria-label={`Year ${d.year}: ${formatNumber(d.idps)} IDPs, ${formatNumber(
                    d.refugees
                  )} Refugees`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onFocus={() => setHoveredIndex(index)}
                  onBlur={() => setHoveredIndex(null)}
                />

                {/* X-Axis Year Labels */}
                <text
                  x={xPos}
                  y={boundedHeight + 22}
                  textAnchor="middle"
                  className={`font-mono text-xs transition-colors ${
                    isHovered ? "fill-amber-400 font-bold" : "fill-slate-400"
                  }`}
                >
                  {d.year}
                </text>
              </g>
            );
          })}

          {/* X-Axis Description Label */}
          <text
            x={boundedWidth / 2}
            y={boundedHeight + 36}
            textAnchor="middle"
            className="fill-slate-400 font-mono text-[9px] uppercase tracking-wider font-semibold"
          >
            Assessment Year (Annual Mid-Year Verified)
          </text>
        </g>
      </svg>

      {/* Interactive Tooltip Overlay */}
      {hoveredPoint && (
        <ChartTooltipOverlay
          x={(xScale(hoveredPoint.year) || 0) + margin.left}
          y={
            (activeSeries === "refugee"
              ? yRefScale(hoveredPoint.refugees)
              : yIdpScale(hoveredPoint.idps)) + margin.top
          }
          containerWidth={width}
          containerHeight={height}
          visible={hoveredIndex !== null}
          title={`Year ${hoveredPoint.year}`}
          source="IOM DTM & UNHCR"
          referenceDate={`Mid-Year ${hoveredPoint.year}`}
        >
          <div className="space-y-2 text-xs">
            {(activeSeries === "all" || activeSeries === "idp") && (
              <div className="space-y-0.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span>IDPs (IOM DTM):</span>
                  </span>
                  <strong className="text-slate-100 font-bold">
                    {formatNumber(hoveredPoint.idps)}
                  </strong>
                </div>
                {hoveredPoint.idpContext && (
                  <p className="text-[10px] text-slate-400 leading-snug pl-3.5">
                    {hoveredPoint.idpContext}
                  </p>
                )}
              </div>
            )}

            {(activeSeries === "all" || activeSeries === "refugee") && (
              <div className="space-y-0.5 pt-1 border-t border-ink-800">
                <div className="flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    <span>Refugees (UNHCR):</span>
                  </span>
                  <strong className="text-slate-100 font-bold">
                    {formatNumber(hoveredPoint.refugees)}
                  </strong>
                </div>
                {hoveredPoint.refugeeContext && (
                  <p className="text-[10px] text-slate-400 leading-snug pl-3.5">
                    {hoveredPoint.refugeeContext}
                  </p>
                )}
              </div>
            )}
          </div>
        </ChartTooltipOverlay>
      )}
    </>
  );
}

export function ExecutiveTrendLine({
  data = OFFICIAL_HISTORICAL_TRENDS,
  className,
}: ExecutiveTrendLineProps) {
  const [activeSeries, setActiveSeries] = useState<"all" | "idp" | "refugee">("all");

  const legendItems: LegendItem[] = [
    {
      id: "idp",
      label: "Internally Displaced Persons (IOM DTM)",
      color: "#bc6c25",
      value: "3.39M (2024)",
    },
    {
      id: "refugee",
      label: "Recognized Refugees Hosted (UNHCR)",
      color: "#426b66",
      value: "1.08M (2024)",
    },
  ];

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No Annual Trend Data"
        description="No annual displacement observations were found matching the selected historical parameters."
        suggestions={[
          "Ensure baseline datasets are fully initialized",
          "Reset your series selection to 'Dual Comparison'",
          "Verify the time horizon spans 2018 through 2024",
        ]}
      />
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-ink-700 bg-ink-900/80 p-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-500 uppercase tracking-wider mb-1">
            <span>Executive Displacement Trajectory (2018 – 2024)</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-100">
            National Trends: Internal Displacement vs. Cross-Border Refugees
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Annual mid-year and round verified caseloads. Dual independent trajectories plotted simultaneously.
          </p>
        </div>

        {/* Series Filter Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-md bg-ink-950 border border-ink-800 self-start sm:self-auto text-xs font-mono" role="group" aria-label="Series comparison filter">
          <button
            type="button"
            onClick={() => setActiveSeries("all")}
            className={`px-2.5 py-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              activeSeries === "all"
                ? "bg-ink-800 text-slate-100 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Dual Comparison
          </button>
          <button
            type="button"
            onClick={() => setActiveSeries("idp")}
            className={`px-2.5 py-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              activeSeries === "idp"
                ? "bg-amber-500/20 text-amber-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            IDPs Only (IOM)
          </button>
          <button
            type="button"
            onClick={() => setActiveSeries("refugee")}
            className={`px-2.5 py-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
              activeSeries === "refugee"
                ? "bg-cyan-500/20 text-cyan-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Refugees Only (UNHCR)
          </button>
        </div>
      </div>

      {/* Mandate Notice */}
      <div className="flex items-center gap-2 text-[11px] font-mono text-amber-300/80 bg-amber-500/5 border border-amber-500/20 rounded px-3 py-1.5">
        <AlertCircle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
        <span>
          Non-Additive Principle: IDPs (IOM DTM) and Refugees (UNHCR) are governed under distinct international mandates and must never be summed into a combined total.
        </span>
      </div>

      {/* SVG Chart Container */}
      <div className="relative">
        <ChartContainer
          ariaLabel="Historical displacement trajectories in Ethiopia from 2018 to 2024"
          minHeight={320}
          margin={{ top: 25, right: 35, bottom: 40, left: 65 }}
          className={className}
        >
          {(dimensions) => (
            <TrendLineSvg
              {...dimensions}
              data={data}
              activeSeries={activeSeries}
            />
          )}
        </ChartContainer>
      </div>

      {/* Legend & Methodology Note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-ink-800 text-xs text-slate-400">
        <ChartLegend items={legendItems} />
        <span className="font-mono text-[11px] text-slate-500">
          Left scale: IDPs (Amber) • Right scale: Refugees (Cyan)
        </span>
      </div>

      {/* Screen Reader Accessible Data Table Fallback */}
      <table className="sr-only" aria-label="Annual displacement historical trends 2018-2024">
        <caption>Annual verified counts of IDPs and Refugees in Ethiopia</caption>
        <thead>
          <tr>
            <th scope="col">Year</th>
            <th scope="col">IDPs (IOM DTM)</th>
            <th scope="col">Refugees Hosted (UNHCR)</th>
            <th scope="col">Historical Context</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.year}>
              <th scope="row">{d.year}</th>
              <td>{d.idps.toLocaleString()}</td>
              <td>{d.refugees.toLocaleString()}</td>
              <td>{`${d.idpContext || ""}; ${d.refugeeContext || ""}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}