import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-ink-950 text-slate-100 font-sans selection:bg-[#dda15e]/30 selection:text-[#283618] dark:selection:text-[#fefae0] transition-colors duration-200">
      <Header />
      <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop Sidebar Navigation */}
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
            <div className="sticky top-24 space-y-6">
              <div>
                <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-medium">
                  Modules
                </p>
                <Navigation />
              </div>
              <div className="rounded-md border border-ink-700 bg-ink-900/70 p-3 text-[11px] text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-200 block mb-0.5">Note</span>
                Non-additive population taxonomy: IDPs, refugees, and migrants reflect independent collection mandates.
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 xl:col-span-10 min-w-0">
            <Breadcrumbs />
            {children}
          </main>
        </div>
      </div>

      <footer className="border-t border-ink-700 bg-ink-900/50 py-6 text-xs text-slate-400 transition-colors">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Ethiopia Migration Observatory. Verified public humanitarian data.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
            <Link href="/terms" className="hover:text-slate-100 transition-colors">Terms</Link>
            <span className="text-ink-700">•</span>
            <Link href="/privacy" className="hover:text-slate-100 transition-colors">Privacy</Link>
            <span className="text-ink-700">•</span>
            <Link href="/attribution" className="hover:text-slate-100 transition-colors">Attribution</Link>
            <span className="text-ink-700">•</span>
            <Link href="/methodology" className="hover:text-slate-100 transition-colors">Methodology</Link>
            <span className="text-ink-700">•</span>
            <Link href="/explorer" className="hover:text-slate-100 transition-colors">Dictionary</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
