import React from "react";
import type { Metadata } from "next";
import { Globe2, Compass, Layers, AlertCircle, ShieldCheck } from "lucide-react";
import { getWorld110mTopology } from "@/lib/geo/server";
import { GlobalMigrationAtlas } from "@/components/globe";

export const metadata: Metadata = {
  title: "Migration Globe — Global Horn of Africa Corridors & Diaspora",
  description:
    "Interactive 3D orthographic globe and 2D accessible projection tracking international migrant stocks, refugee destinations, and Horn of Africa transit corridors",
};

export default function GlobePage() {
  const worldTopology = getWorld110mTopology();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-ink-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1.5">
          <Globe2 className="h-4 w-4" />
          <span>Global Migration Atlas</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              Migration Globe & Cross-Border Corridors
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Orthographic 3D projection tracking bilateral Ethiopian emigrant stock, diaspora populations, and Horn of Africa transit routes.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>UN DESA & UNHCR Verified Data</span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-md border border-ink-700 bg-ink-900/80 p-4 text-xs text-slate-300">
        <AlertCircle className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Interactive Cartographic Engine: </span>
          D3 Orthographic 3D canvas featuring spherical rotation, great-circle flight arcs, and an accessible 2D Equal Earth fallback for reduced-motion and mobile devices.
        </div>
      </div>

      {/* Master Interactive Globe & Migration Atlas */}
      <GlobalMigrationAtlas initialTopology={worldTopology || undefined} />
    </div>
  );
}
