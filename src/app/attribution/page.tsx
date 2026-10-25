import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ExternalLink, Award, ShieldCheck, Database, Layers, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Data Attribution & Upstream Providers — Ethiopia Migration & Displacement Observatory",
  description:
    "Explicit credits and CC BY 4.0 licensing acknowledgments for UNHCR, IOM DTM, OCHA HDX, and UN DESA.",
};

export default function AttributionPage() {
  const providers = [
    {
      id: "unhcr",
      name: "United Nations High Commissioner for Refugees (UNHCR)",
      portal: "UNHCR Refugee Data Finder & Operational Data Portal (ODP)",
      url: "https://www.unhcr.org/refugee-statistics/",
      license: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
      badgeColor: "cyan" as const,
      mandate: "Cross-Border Refugees & Registered Asylum Seekers",
      metricsCovered: "979,846 refugees and 63,747 asylum seekers hosted in Ethiopia",
      formalCitation:
        "United Nations High Commissioner for Refugees (UNHCR), Refugee Data Finder (2023/2024 Year-End Assessment). Geneva: UNHCR Global Data Service. Open Data under CC BY 4.0.",
      details:
        "Data collection relies on UNHCR's proGres v4 biometric registration database, camp-level verification exercises, and urban reception center registrations conducted in partnership with Ethiopia's Refugees and Returnees Service (RRS).",
    },
    {
      id: "iom_dtm",
      name: "International Organization for Migration — Displacement Tracking Matrix (IOM DTM)",
      portal: "IOM DTM Ethiopia Portal & Global Displacement Database",
      url: "https://dtm.iom.int/ethiopia",
      license: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
      badgeColor: "ochre" as const,
      mandate: "Internal Displacement (IDPs) & Tracked Returnees",
      metricsCovered: "3,392,200 IDPs and 1,811,400 returnees across 12 regional states",
      formalCitation:
        "International Organization for Migration (IOM), Displacement Tracking Matrix (DTM) Ethiopia Site Assessment and Village Assessment Round 37 (August 2024). Addis Ababa: IOM Ethiopia. Open Data under CC BY 4.0.",
      details:
        "Collected through key informant interviews with woreda officials, community leaders, and camp managers, triangulated with site visits and physical shelter counts across thousands of displacement sites and returnee villages.",
    },
    {
      id: "ocha_hdx",
      name: "United Nations OCHA — Humanitarian Data Exchange (HDX)",
      portal: "Humanitarian Data Exchange (HDX) / Centre for Humanitarian Data",
      url: "https://data.humdata.org/group/eth",
      license: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
      badgeColor: "terracotta" as const,
      mandate: "Administrative Boundaries (COD-AB) & Inter-Sector Needs",
      metricsCovered: "Administrative Levels 0, 1, and 2 P-codes and Humanitarian Needs Overview indicators",
      formalCitation:
        "United Nations Office for the Coordination of Humanitarian Affairs (OCHA), Ethiopia Common Operational Datasets (COD-AB) and Humanitarian Needs Overview (HNO). The Hague: Centre for Humanitarian Data. Open Data under CC BY 4.0.",
      details:
        "Provides official Common Operational Datasets for administrative boundaries (Adm0 national, Adm1 regional states, and Adm2 zones) and standardized P-code lookups utilized for geographic normalization throughout this observatory.",
    },
    {
      id: "un_desa",
      name: "United Nations DESA — Population Division",
      portal: "UN DESA International Migrant Stock",
      url: "https://www.un.org/development/desa/pd/content/international-migrant-stock",
      license: "Creative Commons Attribution 4.0 International (CC BY 4.0 Compatible)",
      badgeColor: "indigo" as const,
      mandate: "International Migrant Stocks & Global Demographic Matrices",
      metricsCovered: "Bilateral migration corridor flows and foreign-born population stocks",
      formalCitation:
        "United Nations, Department of Economic and Social Affairs, Population Division (2020/2024 Revision). International Migrant Stock: By Destination and Origin (United Nations database, POP/DB/MIG/Stock/Rev.2020). New York: United Nations.",
      details:
        "Bilateral matrix of foreign-born and foreign-citizen populations residing in Ethiopia and Ethiopian-born populations residing internationally, derived from national population censuses and demographic surveys.",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-ink-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 uppercase tracking-widest mb-1.5">
          <Award className="h-4 w-4" />
          <span>Accreditation & Provenance</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              Data Attribution & Provider Accreditations
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Explicit attribution, open license documentation, and formal academic citations for primary humanitarian data originators.
            </p>
          </div>
          <Badge variant="cyan" size="md" className="self-start sm:self-auto font-mono">
            CC BY 4.0 Compliant
          </Badge>
        </div>
      </div>

      {/* Purpose Banner */}
      <Card className="border-l-4 border-l-cyan-500 bg-cyan-500/5">
        <CardHeader className="p-5 pb-2">
          <CardTitle className="text-sm text-slate-100 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span>Humanitarian Purpose & Attribution Charter</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-1 text-xs text-slate-300 leading-relaxed space-y-2">
          <p>
            All datasets referenced on this observatory remain the intellectual and operational property of their respective originating agencies.
            We explicitly acknowledge and thank <strong>UNHCR</strong>, <strong>IOM DTM</strong>, <strong>OCHA HDX</strong>, and <strong>UN DESA</strong> for
            maintaining open humanitarian data infrastructures under the <strong>Creative Commons Attribution 4.0 International (CC BY 4.0)</strong> standard.
          </p>
          <p className="text-slate-400">
            This repository synthesizes these feeds exclusively for non-commercial humanitarian research, public accountability, and policy analysis.
            We preserve all original source timestamps, dataset snapshot IDs, and licensing envelopes.
          </p>
        </CardContent>
      </Card>

      {/* Upstream Providers Detailed Cards */}
      <div className="space-y-6">
        {providers.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b border-ink-800/80 bg-ink-900/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base text-slate-100">{p.name}</CardTitle>
                  <span className="text-xs font-mono text-slate-400">{p.mandate}</span>
                </div>
                <Badge variant={p.badgeColor} size="sm" className="self-start sm:self-auto font-mono text-[11px]">
                  {p.license}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 text-xs space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                  Scope & Protection Caseload Covered
                </span>
                <p className="text-slate-200 font-medium">{p.metricsCovered}</p>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                  Methodology & Collection Process
                </span>
                <p className="text-slate-400 leading-relaxed">{p.details}</p>
              </div>

              <div className="p-3 rounded-md bg-ink-950 border border-ink-800 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block">
                  Official Academic Citation
                </span>
                <p className="text-slate-300 font-serif italic text-xs leading-relaxed">
                  &ldquo;{p.formalCitation}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                <span className="text-slate-500">Official Portal:</span>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                >
                  <span>{p.portal}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Non-Additive Taxonomy Notice */}
      <Card className="border border-ink-800 bg-ink-900/60 p-5">
        <div className="flex items-start gap-3">
          <Layers className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h3 className="font-semibold text-slate-200">Non-Additive Population Taxonomy Rule</h3>
            <p className="text-slate-400 leading-relaxed">
              When citing or reproducing data from this observatory, downstream authors must adhere to the international protection principle:
              <strong> IDP, refugee, returnee, and migrant stocks must never be summed into a combined figure</strong>.
              Each population operates under distinct legal definitions, registration mandates, and return statuses. Combining them introduces
              double-counting and violates scientific reporting integrity.
            </p>
          </div>
        </div>
      </Card>

      {/* Navigation Footer */}
      <div className="rounded-lg border border-ink-700 bg-ink-900/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          <span>Related policies:</span>
        </div>
        <div className="flex items-center gap-4 font-mono">
          <Link href="/terms" className="text-[#bc6c25] dark:text-[#dda15e] hover:underline">Terms of Use</Link>
          <span className="text-ink-700">•</span>
          <Link href="/privacy" className="text-[#bc6c25] dark:text-[#dda15e] hover:underline">Privacy Policy</Link>
          <span className="text-ink-700">•</span>
          <Link href="/methodology" className="text-[#bc6c25] dark:text-[#dda15e] hover:underline">Methodology</Link>
        </div>
      </div>
    </div>
  );
}
