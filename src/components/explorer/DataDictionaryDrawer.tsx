"use client";

import React, { useState } from "react";
import { BookOpen, Search, ShieldAlert, CheckCircle2, ChevronRight, Hash } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface FieldDoc {
  name: string;
  type: string;
  required: boolean;
  description: string;
  allowedValues?: string[];
  example: string;
  notes?: string;
}

const DATA_DICTIONARY_FIELDS: FieldDoc[] = [
  {
    name: "id",
    type: "string (UUID / Slug)",
    required: true,
    description: "Unique surrogate identifier for the observation record.",
    example: "dtm_r37_idp_ET01",
    notes: "Constructed deterministically from source, round, indicator, and location.",
  },
  {
    name: "indicatorId",
    type: "string",
    required: true,
    description: "Canonical indicator identifier registered in the system indicators catalog.",
    allowedValues: ["idp_stock", "returnee_stock", "refugee_stock", "asylum_seeker_stock", "migrant_stock"],
    example: "idp_stock",
  },
  {
    name: "locationId",
    type: "string (P-Code / ISO-3)",
    required: true,
    description: "Standard administrative geography code conforming to UN OCHA COD-AB gazetteer.",
    example: "ET01 (Tigray), ET05 (Somali), ET (National)",
    notes: "P-codes ensure historical continuity across administrative region border reorganizations.",
  },
  {
    name: "value",
    type: "number (integer >= 0)",
    required: true,
    description: "Headcount of individuals observed. Strictly non-negative.",
    example: "1025400",
    notes: "Distinguishes verified 0 (assessed, no IDPs) from null (unassessed).",
  },
  {
    name: "populationType",
    type: "enum",
    required: true,
    description: "Legal and protection classification of the monitored population cohort.",
    allowedValues: ["idp", "refugee", "returnee", "asylum_seeker", "international_migrant"],
    example: "idp",
    notes: "Mutually exclusive mandates. IDP and Refugee statistics MUST NEVER be summed.",
  },
  {
    name: "reportingDate",
    type: "string (ISO Date: YYYY-MM-DD or YYYY-MM)",
    required: true,
    description: "Observation reference date representing when the field assessment took place.",
    example: "2024-08-31",
    notes: "Stored completely separate from ingestion retrieval timestamp to prevent temporal confusion.",
  },
  {
    name: "referencePeriodType",
    type: "enum",
    required: true,
    description: "Temporal aggregation window of the reported figure.",
    allowedValues: ["round", "month", "quarter", "year", "day"],
    example: "round",
  },
  {
    name: "retrievalDate",
    type: "string (ISO-8601 UTC)",
    required: true,
    description: "Timestamp when the payload was retrieved, validated, and normalized into the local database.",
    example: "2026-10-22T01:37:32.225Z",
    notes: "Immutable audit trail field for reproducible data science.",
  },
  {
    name: "confidence",
    type: "enum",
    required: true,
    description: "Data verification confidence tier based on assessment methodology.",
    allowedValues: ["high (biometric)", "medium (site assessment)", "low (projection)", "unverified"],
    example: "medium",
  },
  {
    name: "driver",
    type: "enum (optional)",
    required: false,
    description: "Primary key-informant reported trigger of displacement.",
    allowedValues: ["conflict", "drought", "floods", "seasonal_pastoral", "other", "unspecified"],
    example: "conflict",
    notes: "Community-reported immediate trigger; does NOT imply single legal causality.",
  },
  {
    name: "provenance.citation",
    type: "string",
    required: true,
    description: "Full attribution citation for the published source dataset.",
    example: "IOM Displacement Tracking Matrix Site Assessment Round 37 (Tigray)",
  },
  {
    name: "provenance.license",
    type: "string",
    required: true,
    description: "Open data license governing redistribution and academic citation.",
    example: "CC BY 4.0",
  },
];

export function DataDictionaryDrawer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedField, setSelectedField] = useState<FieldDoc | null>(DATA_DICTIONARY_FIELDS[0]);

  const filteredFields = DATA_DICTIONARY_FIELDS.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900/60 p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink-800 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-100">Standard Data Dictionary</h3>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search fields or types..."
            aria-label="Search dictionary fields or types"
            className="w-full pl-8 pr-3 py-1 text-xs font-mono bg-ink-950 border border-ink-800 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Field List */}
        <div className="space-y-1 md:border-r border-ink-800 pr-0 md:pr-4 max-h-[360px] overflow-y-auto" role="listbox" aria-label="Data dictionary fields">
          {filteredFields.map((field) => {
            const isSelected = selectedField?.name === field.name;
            return (
              <button
                key={field.name}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => setSelectedField(field)}
                className={`w-full text-left px-2.5 py-2 rounded text-xs font-mono flex items-center justify-between transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                  isSelected
                    ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40"
                    : "text-slate-300 hover:bg-ink-800/60 border border-transparent"
                }`}
              >
                <span className="truncate">{field.name}</span>
                <ChevronRight className={`h-3 w-3 ${isSelected ? "text-amber-400" : "text-slate-600"}`} />
              </button>
            );
          })}
        </div>

        {/* Selected Field Details */}
        {selectedField && (
          <div className="md:col-span-2 bg-ink-950 rounded-lg border border-ink-800 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-mono font-bold text-amber-400">
                  {selectedField.name}
                </h4>
                <span className="text-xs font-mono text-slate-400">
                  Type: <strong className="text-slate-200">{selectedField.type}</strong>
                </span>
              </div>
              <Badge variant={selectedField.required ? "terracotta" : "muted"} size="sm">
                {selectedField.required ? "Required" : "Optional"}
              </Badge>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedField.description}
            </p>

            {/* Allowed values */}
            {selectedField.allowedValues && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                  Allowed Enums:
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedField.allowedValues.map((val) => (
                    <span
                      key={val}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-ink-900 border border-ink-700 text-slate-300"
                    >
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Example */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                Representative Example:
              </span>
              <code className="text-xs font-mono text-slate-200 block p-2 rounded bg-ink-900 border border-ink-800">
                {selectedField.example}
              </code>
            </div>

            {/* Notes */}
            {selectedField.notes && (
              <div className="flex items-start gap-1.5 text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded p-2 mt-2">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">{selectedField.notes}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
