"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, ShieldAlert } from "lucide-react";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Navigation } from "@/components/layout/Navigation";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-ink-700 bg-ink-950/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 group rounded p-1 focus-visible:ring-2 focus-visible:ring-[#bc6c25] focus-visible:outline-none"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#606c38] font-mono text-xs font-bold text-[#fefae0] shadow-sm group-hover:bg-[#283618] transition-colors">
              ET
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-slate-100 group-hover:text-[#bc6c25] transition-colors">
                Ethiopia Migration & Displacement Observatory
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Evidence & Human Mobility Monitoring
              </span>
            </div>
          </Link>
          <Badge variant="ochre" size="sm" className="hidden sm:inline-flex ml-1.5">
            Beta
          </Badge>
        </div>

        {/* Right side controls: Status, Taxonomy, Theme toggle */}
        <div className="hidden md:flex items-center gap-4">
          <StatusIndicator status="fresh" label="Sources Active" />
          <Link
            href="/methodology"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 transition-colors rounded px-2 py-1 focus-visible:ring-2 focus-visible:ring-[#bc6c25] focus-visible:outline-none"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-[#dda15e]" />
            <span>Taxonomy</span>
          </Link>
          <div className="h-4 w-px bg-ink-700" />
          <ThemeToggle />
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-slate-400 hover:bg-ink-800 hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#bc6c25]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-ink-700 bg-ink-900 px-4 py-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-ink-800">
            <StatusIndicator status="fresh" label="Sources Active" />
            <Link
              href="/methodology"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 text-xs text-slate-400"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-[#dda15e]" />
              <span>Taxonomy</span>
            </Link>
          </div>
          <Navigation onNavigate={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};
