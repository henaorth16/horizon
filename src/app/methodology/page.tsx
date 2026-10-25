import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ShieldCheck, Scale, FileText, ExternalLink, Award, Cookie } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CitationGuidanceCard } from "@/components/explorer/CitationGuidanceCard";

export const metadata: Metadata = {
  title: "Sources & Methodology — Ethiopia Migration Observatory",
  description: "Official data providers, population taxonomies, survey methodologies, and analytical limitations",
};

export default function MethodologyPage() {
  const sources = [
    {
      publisher: "IOM Displacement Tracking Matrix (DTM)",
      mandate: "Internal Displacement (IDPs) & Returnees",
      frequency: "Round-based (Bimonthly)",
      methodology: "Mobility Tracking at woreda/site level via key informant interviews.",
      url: "https://dtm.iom.int/ethiopia",
      license: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
    },
    {
      publisher: "UNHCR (Refugee Data Finder & ProGres)",
      mandate: "Refugees & Registered Asylum Seekers",
      frequency: "Monthly / Quarterly",
      methodology: "Biometric individual registration system across camps and urban centers.",
      url: "https://www.unhcr.org/refugee-statistics/",
      license: "UNHCR Data Terms & Conditions (CC BY 4.0 Compatible)",
    },
    {
      publisher: "UN DESA Population Division",
      mandate: "International Migrant Stock",
      frequency: "Biennial / 5-Year Revisions",
      methodology: "Census and demographic survey foreign-born / foreign-citizen counts.",
      url: "https://www.un.org/development/desa/pd/",
      license: "UN Open Data Principles",
    },
    {
      publisher: "Internal Displacement Monitoring Centre (IDMC)",
      mandate: "Global Internal Displacement Figures (GRID)",
      frequency: "Annual validated synthesis",
      methodology: "Triangulated satellite, government, and humanitarian assessments.",
      url: "https://www.internal-displacement.org/",
      license: "CC BY 3.0 IGO",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-ink-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-500 uppercase tracking-widest mb-1.5">
          <BookOpen className="h-4 w-4" />
          <span>Scientific Governance & Methodology</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              Data Sources, Taxonomies & Limitations
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Ethical documentation of operational definitions, data originators, collection constraints, and analytical integrity rules.
            </p>
          </div>
          <Badge variant="ochre" size="md" className="self-start sm:self-auto font-mono">
            Methodology V1.0
          </Badge>
        </div>
      </div>

      {/* Core Taxonomies Card */}
      <section className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Population Category Definitions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-slate-100">Internally Displaced Persons (IDPs)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 text-xs text-slate-400 space-y-1.5">
              <p>Persons forced to leave their homes due to armed conflict, intercommunal violence, or natural disasters, who remain within national borders.</p>
              <p className="font-mono text-[10px] text-amber-400/90">Governed under the 1998 Guiding Principles on Internal Displacement.</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-cyan-500">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-slate-100">Refugees</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 text-xs text-slate-400 space-y-1.5">
              <p>Persons outside their country of origin due to well-founded fear of persecution, conflict, violence, or serious public disturbance.</p>
              <p className="font-mono text-[10px] text-cyan-400/90">Governed under the 1951 Refugee Convention & 1969 OAU Convention.</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-slate-100">Returnees</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 text-xs text-slate-400 space-y-1.5">
              <p>Former IDPs or cross-border refugees who have returned to their habitual residence or community of origin within Ethiopia.</p>
              <p className="font-mono text-[10px] text-emerald-400/90">Monitored during the stabilization and reintegration transition.</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-slate-100">International Migrants</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 text-xs text-slate-400 space-y-1.5">
              <p>Any person who changes their country of usual residence, including labor migrants and documented foreign-born residents.</p>
              <p className="font-mono text-[10px] text-purple-400/90">Measured via UN DESA demographic stock assessments.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Primary Data Publishers Table */}
      <section className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Official Public Publishers
        </h2>
        <div className="space-y-3">
          {sources.map((s) => (
            <Card key={s.publisher} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink-800 pb-2 mb-2">
                <span className="font-semibold text-slate-100 text-sm">{s.publisher}</span>
                <span className="text-xs font-mono text-amber-400">{s.mandate}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-400">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Update Cadence</span>
                  <span>{s.frequency}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Licensing</span>
                  <span className="font-mono text-[11px] text-slate-300">{s.license}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Primary Portal</span>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]">
                    <span>Visit Source</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Copy-to-Clipboard Citations */}
      <section className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Academic Citations & BibTeX Generator
        </h2>
        <CitationGuidanceCard />
      </section>

      {/* Governance, Attribution & Privacy Quick Links */}
      <section className="space-y-3 pt-4 border-t border-ink-700">
        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Governance, Legal & Ethics Portals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/attribution" className="block group">
            <Card className="p-4 h-full transition-colors group-hover:border-cyan-500/50">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-cyan-400" />
                <span className="font-semibold text-slate-100 text-sm group-hover:text-cyan-300">Data Attribution</span>
              </div>
              <p className="text-xs text-slate-400">
                Explicit source credits and CC BY 4.0 academic citations for UNHCR, IOM DTM, OCHA HDX, and UN DESA.
              </p>
            </Card>
          </Link>

          <Link href="/terms" className="block group">
            <Card className="p-4 h-full transition-colors group-hover:border-amber-500/50">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="h-4 w-4 text-amber-400" />
                <span className="font-semibold text-slate-100 text-sm group-hover:text-amber-300">Terms of Use</span>
              </div>
              <p className="text-xs text-slate-400">
                Informational and humanitarian usage guidelines, non-commercial research principles, and agency independence.
              </p>
            </Card>
          </Link>

          <Link href="/privacy" className="block group">
            <Card className="p-4 h-full transition-colors group-hover:border-emerald-500/50">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold text-slate-100 text-sm group-hover:text-emerald-300">Privacy & Zero-Tracking</span>
              </div>
              <p className="text-xs text-slate-400">
                Guarantee of zero tracking cookies, client-side ephemeral state, and statistical disclosure control (SDC &lt; 5).
              </p>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
