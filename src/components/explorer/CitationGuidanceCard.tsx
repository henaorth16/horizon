"use client";

import React, { useState } from "react";
import { Copy, Check, Quote, BookOpen, Layers, Award } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export interface CitationItem {
  id: string;
  name: string;
  agency: string;
  license: string;
  badgeVariant: "ochre" | "cyan" | "indigo" | "default";
  apa: string;
  chicago: string;
  bibtex: string;
}

export const DATASET_CITATIONS: Record<string, CitationItem> = {
  iom_dtm: {
    id: "iom_dtm",
    name: "IOM DTM Round 37",
    agency: "International Organization for Migration (IOM)",
    license: "CC BY 4.0",
    badgeVariant: "ochre",
    apa: `International Organization for Migration. (2024). Ethiopia — Displacement Tracking Matrix (DTM) Site Assessment and Village Assessment Round 37 (August 2024) [Data set]. IOM Displacement Tracking Matrix. https://dtm.iom.int/ethiopia`,
    chicago: `International Organization for Migration (IOM). "Ethiopia — Displacement Tracking Matrix (DTM) Site Assessment and Village Assessment Round 37 (August 2024)." Geneva: IOM, 2024. https://dtm.iom.int/ethiopia.`,
    bibtex: `@misc{iom_dtm_ethiopia_r37_2024,
  author = {{International Organization for Migration}},
  title = {Ethiopia --- Displacement Tracking Matrix (DTM) Site Assessment and Village Assessment Round 37 (August 2024)},
  year = {2024},
  month = {August},
  publisher = {IOM Displacement Tracking Matrix},
  url = {https://dtm.iom.int/ethiopia},
  note = {Accessed via Ethiopia Migration \\& Displacement Observatory. Distributed under CC BY 4.0}
}`,
  },
  unhcr: {
    id: "unhcr",
    name: "UNHCR Refugee Statistics 2024",
    agency: "United Nations High Commissioner for Refugees (UNHCR)",
    license: "CC BY 4.0",
    badgeVariant: "cyan",
    apa: `United Nations High Commissioner for Refugees. (2024). Refugee Data Finder: Forced Displacement in 2023/2024 (Ethiopia Country of Asylum and Origin Reports) [Data set]. UNHCR Global Data Service. https://www.unhcr.org/refugee-statistics/`,
    chicago: `United Nations High Commissioner for Refugees (UNHCR). "Refugee Data Finder: Forced Displacement in 2023/2024 (Ethiopia Reports)." Geneva: UNHCR, 2024. https://www.unhcr.org/refugee-statistics/.`,
    bibtex: `@misc{unhcr_ethiopia_2024,
  author = {{United Nations High Commissioner for Refugees}},
  title = {Refugee Data Finder: Forced Displacement in 2023/2024 (Ethiopia Reports)},
  year = {2024},
  publisher = {UNHCR Global Data Service},
  url = {https://www.unhcr.org/refugee-statistics/},
  note = {Accessed via Ethiopia Migration \\& Displacement Observatory. Distributed under CC BY 4.0}
}`,
  },
  un_desa: {
    id: "un_desa",
    name: "UN DESA Migrant Stock",
    agency: "United Nations Department of Economic and Social Affairs",
    license: "CC BY 4.0 Compatible",
    badgeVariant: "indigo",
    apa: `United Nations, Department of Economic and Social Affairs, Population Division. (2024). International Migrant Stock 2020/2024: By Destination and Origin (United Nations database, POP/DB/MIG/Stock/Rev.2020) [Data set]. United Nations. https://www.un.org/development/desa/pd/`,
    chicago: `United Nations, Department of Economic and Social Affairs, Population Division. "International Migrant Stock: By Destination and Origin." New York: United Nations, 2024. https://www.un.org/development/desa/pd/.`,
    bibtex: `@misc{un_desa_migrant_stock_2024,
  author = {{United Nations Department of Economic and Social Affairs Population Division}},
  title = {International Migrant Stock: By Destination and Origin},
  year = {2024},
  publisher = {United Nations},
  url = {https://www.un.org/development/desa/pd/},
  note = {Accessed via Ethiopia Migration \\& Displacement Observatory. Distributed under CC BY 4.0 Compatible}
}`,
  },
  observatory: {
    id: "observatory",
    name: "Observatory Platform (Combined)",
    agency: "Ethiopia Migration & Displacement Observatory",
    license: "CC BY 4.0",
    badgeVariant: "default",
    apa: `International Organization for Migration, & United Nations High Commissioner for Refugees. (2024). Displacement and Refugee Figures in Ethiopia [Data set]. Retrieved from Ethiopia Migration & Displacement Observatory (https://observatory.et). Licensed under CC BY 4.0.`,
    chicago: `International Organization for Migration (IOM) and UNHCR. "Displacement and Refugee Figures in Ethiopia." Ethiopia Migration & Displacement Observatory, accessed October 2026, https://observatory.et.`,
    bibtex: `@misc{ethiopia_migration_observatory_2026,
  author = {{IOM Displacement Tracking Matrix} and {UNHCR Refugee Data Finder}},
  title = {Ethiopia Migration \\& Displacement Observatory: Normalized Humanitarian Caseloads and Spatial Boundaries},
  year = {2024},
  publisher = {Ethiopia Migration \\& Displacement Observatory},
  url = {https://observatory.et},
  note = {Accessed: 2026-10-24. Distributed under CC BY 4.0}
}`,
  },
};

interface CitationGuidanceCardProps {
  initialDatasetKey?: string;
  className?: string;
}

export function CitationGuidanceCard({ initialDatasetKey = "iom_dtm", className = "" }: CitationGuidanceCardProps) {
  const [selectedKey, setSelectedKey] = useState<string>(initialDatasetKey);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeCitation = DATASET_CITATIONS[selectedKey] || DATASET_CITATIONS.iom_dtm;

  const handleCopy = (text: string, formatId: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    const fullKey = `${selectedKey}_${formatId}`;
    setCopiedKey(fullKey);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className={`rounded-xl border border-ink-800 bg-ink-900/60 p-4 sm:p-5 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink-800 pb-3">
        <div className="flex items-center gap-2">
          <Quote className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-100">Citation & Attribution Guidance</h3>
        </div>
        <Badge variant={activeCitation.badgeVariant} size="sm" className="font-mono self-start sm:self-auto">
          {activeCitation.license}
        </Badge>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        Select an active humanitarian dataset to generate verified copy-to-clipboard citations in APA, Chicago, or BibTeX formats:
      </p>

      {/* Dataset Selector Tabs */}
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Select dataset for citation">
        {Object.values(DATASET_CITATIONS).map((ds) => {
          const isSelected = selectedKey === ds.id;
          return (
            <button
              key={ds.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedKey(ds.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none flex items-center gap-1.5 ${
                isSelected
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold"
                  : "bg-ink-950 border border-ink-800 text-slate-400 hover:text-slate-200 hover:bg-ink-900"
              }`}
            >
              <span>{ds.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Dataset Overview Pill */}
      <div className="p-2.5 rounded-md bg-ink-950 border border-ink-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-mono text-[11px]">Primary Agency:</span>
        <span className="font-medium text-slate-200">{activeCitation.agency}</span>
      </div>

      {/* Formats Grid */}
      <div className="space-y-3 pt-1">
        {/* APA Style */}
        <div className="bg-ink-950 rounded-lg border border-ink-800 p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase text-slate-400">
              APA Style (7th Edition)
            </span>
            <button
              type="button"
              onClick={() => handleCopy(activeCitation.apa, "apa")}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 hover:text-amber-300 focus-visible:ring-2 focus-visible:ring-amber-400 rounded px-1.5 py-0.5"
              aria-label="Copy APA Citation"
              title={`Copy APA Citation for ${activeCitation.name}`}
            >
              {copiedKey === `${selectedKey}_apa` ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              <span>{copiedKey === `${selectedKey}_apa` ? "Copied APA" : "Copy APA"}</span>
            </button>
          </div>
          <p className="text-xs text-slate-300 font-serif leading-relaxed italic">
            {activeCitation.apa}
          </p>
        </div>

        {/* Chicago Style */}
        <div className="bg-ink-950 rounded-lg border border-ink-800 p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase text-slate-400">
              Chicago Manual of Style (17th Edition)
            </span>
            <button
              type="button"
              onClick={() => handleCopy(activeCitation.chicago, "chicago")}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 hover:text-amber-300 focus-visible:ring-2 focus-visible:ring-amber-400 rounded px-1.5 py-0.5"
              aria-label="Copy Chicago Citation"
              title={`Copy Chicago Citation for ${activeCitation.name}`}
            >
              {copiedKey === `${selectedKey}_chicago` ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              <span>{copiedKey === `${selectedKey}_chicago` ? "Copied Chicago" : "Copy Chicago"}</span>
            </button>
          </div>
          <p className="text-xs text-slate-300 font-serif leading-relaxed">
            {activeCitation.chicago}
          </p>
        </div>

        {/* BibTeX */}
        <div className="bg-ink-950 rounded-lg border border-ink-800 p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase text-slate-400">
              BibTeX Format
            </span>
            <button
              type="button"
              onClick={() => handleCopy(activeCitation.bibtex, "bibtex")}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1.5 py-0.5"
              aria-label="Copy BibTeX Citation"
              title={`Copy BibTeX Citation for ${activeCitation.name}`}
            >
              {copiedKey === `${selectedKey}_bibtex` ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              <span>{copiedKey === `${selectedKey}_bibtex` ? "Copied BibTeX" : "Copy BibTeX"}</span>
            </button>
          </div>
          <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2 bg-ink-900 rounded border border-ink-800 leading-tight">
            {activeCitation.bibtex}
          </pre>
        </div>
      </div>
    </div>
  );
}
