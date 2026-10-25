"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  BookOpen,
  Quote,
  X,
  RotateCcw,
  Clock,
  Layers,
} from "lucide-react";
import type { ValidatedObservation } from "@/lib/contracts";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/charts/EmptyState";
import { PCODE_TO_REGION_NAME } from "@/lib/db/types";
import { exportObservationsToCsv, exportObservationsToJson } from "@/lib/export/safeExport";
import { DataDictionaryDrawer } from "./DataDictionaryDrawer";
import { CitationGuidanceCard } from "./CitationGuidanceCard";

interface ObservationExplorerProps {
  initialObservations: ValidatedObservation[];
}

type SortField = "value" | "location" | "reportingDate" | "retrievalDate" | "populationType";
type SortDirection = "asc" | "desc";

export function ObservationExplorer({ initialObservations }: ObservationExplorerProps) {
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPopulation, setSelectedPopulation] = useState<string>("all");
  const [selectedDriver, setSelectedDriver] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedConfidence, setSelectedConfidence] = useState<string>("all");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("value");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Expanded Row & View Drawers
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"table" | "dictionary" | "citation">("table");

  // Unique locations in dataset for dropdown
  const uniqueLocations = useMemo(() => {
    const set = new Set<string>();
    initialObservations.forEach((o) => set.add(o.locationId));
    return Array.from(set).sort();
  }, [initialObservations]);

  // Handle column header sort clicks
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  // Check if any filter is actively applied
  const isFiltered =
    Boolean(searchQuery.trim()) ||
    selectedPopulation !== "all" ||
    selectedDriver !== "all" ||
    selectedSource !== "all" ||
    selectedLocation !== "all" ||
    selectedConfidence !== "all";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedPopulation("all");
    setSelectedDriver("all");
    setSelectedSource("all");
    setSelectedLocation("all");
    setSelectedConfidence("all");
    setCurrentPage(1);
  };

  // Filtered and Sorted observations
  const filteredAndSortedRecords = useMemo(() => {
    const filtered = initialObservations.filter((obs) => {
      // Population filter
      if (selectedPopulation !== "all" && obs.populationType !== selectedPopulation) {
        return false;
      }

      // Source filter
      if (selectedSource !== "all" && obs.sourceId !== selectedSource) {
        return false;
      }

      // Location filter
      if (selectedLocation !== "all" && obs.locationId !== selectedLocation) {
        return false;
      }

      // Confidence filter
      if (selectedConfidence !== "all" && obs.confidence !== selectedConfidence) {
        return false;
      }

      // Driver filter
      if (selectedDriver !== "all") {
        if (obs.breakdown?.driver !== selectedDriver) return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const regionName = (PCODE_TO_REGION_NAME[obs.locationId] || "").toLowerCase();
        const pcode = obs.locationId.toLowerCase();
        const indicator = obs.indicatorId.toLowerCase();
        const popType = obs.populationType.toLowerCase();
        const citation = (obs.provenance?.citation || "").toLowerCase();
        const sourceName = (obs.provenance?.sourceName || obs.sourceId).toLowerCase();

        return (
          pcode.includes(query) ||
          regionName.includes(query) ||
          indicator.includes(query) ||
          popType.includes(query) ||
          citation.includes(query) ||
          sourceName.includes(query)
        );
      }

      return true;
    });

    // Sorting
    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "value":
          comparison = a.value - b.value;
          break;
        case "location": {
          const nameA = PCODE_TO_REGION_NAME[a.locationId] || a.locationId;
          const nameB = PCODE_TO_REGION_NAME[b.locationId] || b.locationId;
          comparison = nameA.localeCompare(nameB);
          break;
        }
        case "reportingDate":
          comparison = a.reportingDate.localeCompare(b.reportingDate);
          break;
        case "retrievalDate":
          comparison = a.retrievalDate.localeCompare(b.retrievalDate);
          break;
        case "populationType":
          comparison = a.populationType.localeCompare(b.populationType);
          break;
        default:
          comparison = 0;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [
    initialObservations,
    searchQuery,
    selectedPopulation,
    selectedDriver,
    selectedSource,
    selectedLocation,
    selectedConfidence,
    sortField,
    sortDirection,
  ]);

  // Aggregate sum of currently filtered records
  const totalCountInView = useMemo(() => {
    return filteredAndSortedRecords.reduce((sum, r) => sum + r.value, 0);
  }, [filteredAndSortedRecords]);

  // Pagination calculation
  const totalRecords = filteredAndSortedRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedRecords = filteredAndSortedRecords.slice(startIndex, endIndex);

  // Safe Export Handlers
  const handleExportCsv = () => {
    exportObservationsToCsv(filteredAndSortedRecords);
  };

  const handleExportJson = () => {
    exportObservationsToJson(filteredAndSortedRecords);
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "idp":
        return "ochre";
      case "refugee":
        return "cyan";
      case "returnee":
        return "sage";
      case "asylum_seeker":
        return "indigo";
      default:
        return "muted";
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-slate-500 opacity-60" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 text-amber-400" />
    ) : (
      <ArrowDown className="h-3 w-3 text-amber-400" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Segmented Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-800 pb-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("table")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "table"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-ink-900 border border-transparent"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Observation Records ({filteredAndSortedRecords.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dictionary")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "dictionary"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-ink-900 border border-transparent"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Data Dictionary</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("citation")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "citation"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-ink-900 border border-transparent"
            }`}
          >
            <Quote className="h-3.5 w-3.5" />
            <span>Citation Guidance</span>
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCsv}
            className="gap-1.5 font-mono text-xs whitespace-nowrap"
            title="Safe CSV export with OWASP formula injection protection"
          >
            <Download className="h-3.5 w-3.5 text-amber-400" />
            <span>Export CSV</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportJson}
            className="gap-1.5 font-mono text-xs whitespace-nowrap"
            title="Export authenticated JSON dataset with metadata envelope"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </Button>
        </div>
      </div>

      {/* Tab: Data Dictionary */}
      {activeTab === "dictionary" && <DataDictionaryDrawer />}

      {/* Tab: Citation Guidance */}
      {activeTab === "citation" && <CitationGuidanceCard />}

      {/* Tab: Main Observation Explorer Table */}
      {activeTab === "table" && (
        <div className="space-y-4">
          {/* Search and Filters Bar */}
          <div className="rounded-lg border border-ink-700 bg-ink-900/90 p-4 space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by region, P-code (e.g. ET01), indicator, or citation..."
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-ink-950 border border-ink-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Reset Filters */}
              {isFiltered && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-amber-400 bg-ink-950 rounded border border-ink-800 hover:bg-ink-800 transition-colors whitespace-nowrap"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-ink-800 text-xs">
              {/* Population Type */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Population Category
                </label>
                <select
                  value={selectedPopulation}
                  onChange={(e) => {
                    setSelectedPopulation(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-ink-950 border border-ink-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Populations (Partitioned)</option>
                  <option value="idp">IDPs (Internal Displacement)</option>
                  <option value="returnee">Returnees</option>
                  <option value="refugee">Refugees Hosted</option>
                  <option value="asylum_seeker">Asylum Seekers</option>
                </select>
              </div>

              {/* Primary Driver */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Primary Driver
                </label>
                <select
                  value={selectedDriver}
                  onChange={(e) => {
                    setSelectedDriver(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-ink-950 border border-ink-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Drivers</option>
                  <option value="conflict">Conflict & Violence</option>
                  <option value="drought">Drought Shocks</option>
                  <option value="floods">Floods & Inundation</option>
                </select>
              </div>

              {/* Publishing Source */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Publishing Source
                </label>
                <select
                  value={selectedSource}
                  onChange={(e) => {
                    setSelectedSource(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-ink-950 border border-ink-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Official Sources</option>
                  <option value="iom_dtm">IOM DTM (Internal Mobility)</option>
                  <option value="unhcr">UNHCR (Refugee Data Finder)</option>
                </select>
              </div>

              {/* Region / Location */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Location / Region
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-ink-950 border border-ink-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Locations</option>
                  {uniqueLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {PCODE_TO_REGION_NAME[loc] ? `${PCODE_TO_REGION_NAME[loc]} (${loc})` : loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Confidence / Quality */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Verification Quality
                </label>
                <select
                  value={selectedConfidence}
                  onChange={(e) => {
                    setSelectedConfidence(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-ink-950 border border-ink-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Confidence Tiers</option>
                  <option value="high">High (Biometric / Verified)</option>
                  <option value="medium">Medium (Site Assessment)</option>
                  <option value="low">Low (Rapid Projection)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Query Status Banner & Page Size Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs font-mono text-slate-400">
            <div>
              <span>Showing </span>
              <strong className="text-slate-200">
                {totalRecords > 0 ? startIndex + 1 : 0}–{endIndex}
              </strong>
              <span> of </span>
              <strong className="text-slate-200">{totalRecords}</strong>
              <span> validated observation records</span>
              {totalRecords !== initialObservations.length && (
                <span className="text-slate-500"> (filtered from {initialObservations.length} total)</span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div>
                <span>Total Caseload in View: </span>
                <strong className="text-amber-400">{formatNumber(totalCountInView)}</strong>
              </div>

              {/* Page size dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-[11px]">Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-ink-950 border border-ink-800 rounded px-2 py-0.5 text-slate-300 text-xs focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>

          {/* Observation Table */}
          <div className="overflow-x-auto rounded-lg border border-ink-700 bg-ink-900/60">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-ink-800 bg-ink-950/80 font-mono text-slate-400 text-[11px] uppercase tracking-wider">
                  {/* Population & Indicator */}
                  <th className="p-3">
                    <button
                      type="button"
                      onClick={() => handleSort("populationType")}
                      className="flex items-center gap-1.5 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded px-1"
                    >
                      <span>Population & Indicator</span>
                      {renderSortIndicator("populationType")}
                    </button>
                  </th>

                  {/* Location / P-code */}
                  <th className="p-3">
                    <button
                      type="button"
                      onClick={() => handleSort("location")}
                      className="flex items-center gap-1.5 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded px-1"
                    >
                      <span>Location / P-Code</span>
                      {renderSortIndicator("location")}
                    </button>
                  </th>

                  {/* Value */}
                  <th className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleSort("value")}
                      className="inline-flex items-center gap-1.5 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded px-1 ml-auto"
                    >
                      <span>Observation Value</span>
                      {renderSortIndicator("value")}
                    </button>
                  </th>

                  {/* Reporting Date */}
                  <th className="p-3">
                    <button
                      type="button"
                      onClick={() => handleSort("reportingDate")}
                      className="flex items-center gap-1.5 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded px-1"
                    >
                      <span>Reference Period</span>
                      {renderSortIndicator("reportingDate")}
                    </button>
                  </th>

                  {/* Retrieval Timestamp */}
                  <th className="p-3 hidden lg:table-cell">
                    <button
                      type="button"
                      onClick={() => handleSort("retrievalDate")}
                      className="flex items-center gap-1.5 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded px-1"
                    >
                      <span>Retrieved UTC</span>
                      {renderSortIndicator("retrievalDate")}
                    </button>
                  </th>

                  {/* Driver / Breakdown */}
                  <th className="p-3">Driver / Breakdown</th>

                  {/* Confidence / Quality */}
                  <th className="p-3">Quality Tier</th>

                  {/* Actions / Details */}
                  <th className="p-3 text-center">Citation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800">
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6">
                      <EmptyState
                        title="No Observation Records Found"
                        description={
                          searchQuery.trim()
                            ? `No records matched your search query "${searchQuery}" under the current filter combinations.`
                            : "No records matched the selected population, driver, source, or confidence filters."
                        }
                        resetText="Reset Explorer Filters"
                        onReset={handleResetFilters}
                        suggestions={[
                          "Broaden your population selection to 'All Populations'",
                          "Clear specific search keywords from the search bar",
                          "Reset the verification quality tier filter to 'All Tiers'",
                        ]}
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((obs) => {
                    const isExpanded = expandedRowId === obs.id;
                    const regionName = PCODE_TO_REGION_NAME[obs.locationId] || obs.locationId;
                    const sourceName = obs.provenance?.sourceName || obs.sourceId;

                    return (
                      <React.Fragment key={obs.id}>
                        <tr
                          tabIndex={0}
                          role="button"
                          aria-expanded={isExpanded}
                          aria-label={`Observation ${obs.id}: ${regionName}, ${formatNumber(obs.value)} ${obs.indicatorId}`}
                          className={`hover:bg-ink-800/40 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                            isExpanded ? "bg-ink-800/30" : ""
                          }`}
                          onClick={() => setExpandedRowId(isExpanded ? null : obs.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setExpandedRowId(isExpanded ? null : obs.id);
                            }
                          }}
                        >
                          {/* Population & Indicator */}
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Badge variant={getBadgeVariant(obs.populationType)} size="sm">
                                {obs.populationType.replace("_", " ")}
                              </Badge>
                              <span className="font-mono text-slate-300">{obs.indicatorId}</span>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="p-3">
                            <div className="font-medium text-slate-200">{regionName}</div>
                            <div className="text-[10px] font-mono text-slate-400">{obs.locationId}</div>
                          </td>

                          {/* Observation Value */}
                          <td className="p-3 text-right font-mono font-semibold text-slate-100">
                            {formatNumber(obs.value)}
                          </td>

                          {/* Reporting Period */}
                          <td className="p-3 font-mono text-slate-300">
                            <div>{obs.reportingDate}</div>
                            <div className="text-[10px] text-slate-500 capitalize">
                              {obs.referencePeriodType}
                            </div>
                          </td>

                          {/* Retrieval Date */}
                          <td className="p-3 font-mono text-[11px] text-slate-400 hidden lg:table-cell">
                            {obs.retrievalDate.slice(0, 19).replace("T", " ")}
                          </td>

                          {/* Driver / Breakdown */}
                          <td className="p-3">
                            {obs.breakdown?.driver ? (
                              <span className="capitalize text-amber-300 font-mono">
                                {obs.breakdown.driver}
                              </span>
                            ) : obs.breakdown?.originLocationId ? (
                              <span className="text-cyan-300 font-mono text-[11px]">
                                Origin: {obs.breakdown.originLocationId}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-mono">—</span>
                            )}
                          </td>

                          {/* Confidence / Quality */}
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-300 capitalize">
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                              {obs.confidence}
                            </span>
                          </td>

                          {/* Details Toggle Button */}
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-amber-400"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                              <span>Details</span>
                            </button>
                          </td>
                        </tr>

                        {/* Expandable Provenance & Audit Metadata Drawer */}
                        {isExpanded && (
                          <tr className="bg-ink-950/70 border-b border-ink-800">
                            <td colSpan={8} className="p-4 space-y-2 text-xs">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                                    Provenance & Official Citation
                                  </div>
                                  <p className="text-slate-200 font-normal leading-relaxed">
                                    {obs.provenance?.citation || "No citation recorded."}
                                  </p>
                                  <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400">
                                    <span>
                                      Source: <strong className="text-slate-200">{sourceName}</strong>
                                    </span>
                                    <span>
                                      License:{" "}
                                      <strong className="text-slate-200">
                                        {obs.provenance?.license || "CC BY 4.0"}
                                      </strong>
                                    </span>
                                    <span>
                                      Method:{" "}
                                      <strong className="text-emerald-400 capitalize">{obs.confidence}</strong>
                                    </span>
                                  </div>
                                </div>

                                <div>
                                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                                    Audit & Temporal Metadata
                                  </div>
                                  <div className="space-y-1 font-mono text-[11px] text-slate-400">
                                    <div>
                                      Record ID: <span className="text-slate-300">{obs.id}</span>
                                    </div>
                                    <div>
                                      Snapshot ID:{" "}
                                      <span className="text-slate-300">{obs.provenance?.datasetSnapshotId}</span>
                                    </div>
                                    <div>
                                      Retrieved UTC: <span className="text-slate-300">{obs.retrievalDate}</span>
                                    </div>
                                    <div>
                                      Reference Period:{" "}
                                      <span className="text-slate-300">
                                        {obs.reportingDate} ({obs.referencePeriodType})
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs font-mono">
              <div className="text-slate-400">
                Page <strong className="text-slate-200">{currentPageSafe}</strong> of{" "}
                <strong className="text-slate-200">{totalPages}</strong>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto" role="navigation" aria-label="Pagination">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPageSafe === 1}
                  aria-label="First page"
                  className="px-2.5 py-1 rounded bg-ink-950 border border-ink-800 text-slate-300 hover:bg-ink-800 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
                >
                  First
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPageSafe === 1}
                  aria-label="Previous page"
                  className="px-2.5 py-1 rounded bg-ink-950 border border-ink-800 text-slate-300 hover:bg-ink-800 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
                >
                  Prev
                </button>

                {/* Page number buttons */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPageSafe > 3) {
                    pageNum = Math.min(totalPages - 4 + i, currentPageSafe - 2 + i);
                  }
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded flex items-center justify-center border transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                        currentPageSafe === pageNum
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold"
                          : "bg-ink-950 border-ink-800 text-slate-400 hover:text-slate-200 hover:bg-ink-800"
                      }`}
                      aria-current={currentPageSafe === pageNum ? "page" : undefined}
                      aria-label={`Page ${pageNum}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPageSafe === totalPages}
                  aria-label="Next page"
                  className="px-2.5 py-1 rounded bg-ink-950 border border-ink-800 text-slate-300 hover:bg-ink-800 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPageSafe === totalPages}
                  aria-label="Last page"
                  className="px-2.5 py-1 rounded bg-ink-950 border border-ink-800 text-slate-300 hover:bg-ink-800 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
