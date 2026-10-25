import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navigation, NAV_ITEMS } from "@/components/layout/Navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import InsideEthiopiaPage from "@/app/inside-ethiopia/page";
import GlobePage from "@/app/globe/page";
import AcrossBordersPage from "@/app/across-borders/page";
import DemographicsPage from "@/app/demographics/page";
import DriversPage from "@/app/drivers/page";
import HumanitarianNeedsPage from "@/app/humanitarian-needs/page";
import DataExplorerPage from "@/app/explorer/page";
import MethodologyPage from "@/app/methodology/page";


describe("Observatory Navigation & App Shell", () => {
  it("defines all 9 core observatory sections in NAV_ITEMS", () => {
    const titles = NAV_ITEMS.map((item) => item.title);
    expect(titles).toContain("Overview");
    expect(titles).toContain("Inside Ethiopia");
    expect(titles).toContain("Migration Globe");
    expect(titles).toContain("Across Borders");
    expect(titles).toContain("People & Demographics");
    expect(titles).toContain("Drivers & Crises");
    expect(titles).toContain("Humanitarian Needs");
    expect(titles).toContain("Data Explorer");
    expect(titles).toContain("Sources & Methodology");
    expect(NAV_ITEMS.length).toBe(9);
  });

  it("renders Navigation with active route highlighted", () => {
    render(<Navigation />);
    const activeLink = screen.getByRole("link", { name: /Inside Ethiopia/i });
    expect(activeLink).toBeInTheDocument();
    expect(activeLink.className).toContain("text-amber-400");
  });

  it("renders Breadcrumbs with current path mapped", () => {
    render(<Breadcrumbs />);
    expect(screen.getByText("Observatory")).toBeInTheDocument();
    expect(screen.getByText("Inside Ethiopia")).toBeInTheDocument();
  });
});

describe("Observatory Placeholder Route Pages", () => {
  it("renders Inside Ethiopia page", () => {
    render(<InsideEthiopiaPage />);
    expect(screen.getByText(/Inside Ethiopia: Internal Displacement/i)).toBeInTheDocument();
    expect(screen.getAllByText("Tigray").length).toBeGreaterThanOrEqual(1);
  });

  it("renders Migration Globe page", () => {
    render(<GlobePage />);
    expect(screen.getByText(/Migration Globe & Cross-Border Corridors/i)).toBeInTheDocument();
  });

  it("renders Across Borders page", () => {
    render(<AcrossBordersPage />);
    expect(screen.getByText(/Across Borders: Refugees & Asylum Seekers/i)).toBeInTheDocument();
  });

  it("renders Demographics page", () => {
    render(<DemographicsPage />);
    expect(screen.getByText(/People & Demographics/i)).toBeInTheDocument();
  });

  it("renders Drivers page", () => {
    render(<DriversPage />);
    expect(screen.getByText(/Displacement Drivers & Crisis Triggers/i)).toBeInTheDocument();
  });

  it("renders Humanitarian Needs page", () => {
    render(<HumanitarianNeedsPage />);
    expect(screen.getByText(/Humanitarian Needs & Sector Demands/i)).toBeInTheDocument();
  });

  it("renders Data Explorer page", () => {
    render(<DataExplorerPage />);
    expect(screen.getByText(/Observation Data Explorer & Exports/i)).toBeInTheDocument();
  });

  it("renders Methodology page", () => {
    render(<MethodologyPage />);
    expect(screen.getByText(/Data Sources, Taxonomies & Limitations/i)).toBeInTheDocument();
    expect(screen.getByText(/Internally Displaced Persons \(IDPs\)/i)).toBeInTheDocument();
  });
});
