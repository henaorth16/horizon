import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import fs from "fs";
import path from "path";
import { ExecutiveTrendLine } from "@/components/charts/ExecutiveTrendLine";
import { DriverBreakdownChart } from "@/components/drivers/DriverBreakdownChart";
import { DriverTimelineChart } from "@/components/drivers/DriverTimelineChart";
import { SankeyDiagram } from "@/components/flows/SankeyDiagram";
import { FlowDataTable } from "@/components/flows/FlowDataTable";
import { PopulationPyramid } from "@/components/demographics/PopulationPyramid";
import { RegionalComparisonChart } from "@/components/demographics/RegionalComparisonChart";
import { CompositionBarChart } from "@/components/demographics/CompositionBarChart";
import { GlobeViewport } from "@/components/globe/GlobeViewport";
import { CountryDetailDrawer } from "@/components/globe/CountryDetailDrawer";
import { AreaDetailDrawer } from "@/components/maps/AreaDetailDrawer";
import { InsideEthiopiaView } from "@/components/maps/InsideEthiopiaView";
import { Header } from "@/components/layout/Header";
import { getDemographicProfile } from "@/lib/db";
import { REFUGEE_INFLOW_DATASET } from "@/lib/geo/flowData";
import { GLOBAL_PARTNER_COUNTRIES } from "@/lib/geo/migrationData";

describe("WCAG 2.1 AA Accessibility & Keyboard Navigation", () => {
  it("includes prefers-reduced-motion media query in globals.css", () => {
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");

    expect(cssContent).toContain("@media (prefers-reduced-motion: reduce)");
    expect(cssContent).toContain("animation-duration: 0.01ms !important");
    expect(cssContent).toContain("transition-duration: 0.01ms !important");
  });

  it("verifies chart SVGs and containers have accessible aria-labels", () => {
    const nationalTrendData = [
      { year: 2021, idps: 2100000, refugees: 800000 },
      { year: 2022, idps: 2700000, refugees: 880000 },
      { year: 2023, idps: 3400000, refugees: 950000 },
      { year: 2024, idps: 3300000, refugees: 1050000 },
    ];

    render(<ExecutiveTrendLine data={nationalTrendData} />);

    // SVG container must provide descriptive accessible label
    const chartImg = screen.getByRole("img", {
      name: /Historical displacement trajectories in Ethiopia/i,
    });
    expect(chartImg).toBeInTheDocument();

    // Data points have accessible keyboard buttons with aria-labels
    const pointButtons = screen.getAllByRole("button", { name: /Year 2024:/i });
    expect(pointButtons.length).toBeGreaterThanOrEqual(1);

    // Screen reader accessible fallback table
    const table = screen.getByRole("table", {
      name: /Annual displacement historical trends 2018-2024/i,
    });
    expect(table).toHaveClass("sr-only");
  });

  it("verifies PopulationPyramid includes sr-only summary table and keyboard-accessible bars", () => {
    const idpProfile = getDemographicProfile({ populationType: "idp", locationId: "ET" });
    render(<PopulationPyramid profile={idpProfile} />);

    const table = screen.getByRole("table", {
      name: /Age and sex population table for Ethiopia/i,
    });
    expect(table).toHaveClass("sr-only");

    // Bars have role='img' and aria-labels
    const maleBars = screen.getAllByRole("img", { name: /Male age/i });
    expect(maleBars.length).toBeGreaterThan(0);
  });

  it("verifies SankeyDiagram includes sr-only summary table and keyboard triggers on nodes", () => {
    const dataset = REFUGEE_INFLOW_DATASET;
    const handleSelectNode = vi.fn();

    render(<SankeyDiagram dataset={dataset} onSelectNode={handleSelectNode} />);

    // Screen reader table
    const table = screen.getByRole("table", {
      name: /Sankey displacement flow table/i,
    });
    expect(table).toHaveClass("sr-only");

    // Interactive nodes with role='button' respond to Enter & Space keyboard triggers
    const somaliaNode = screen.getByRole("button", { name: /Somalia/i });
    expect(somaliaNode).toBeInTheDocument();

    fireEvent.keyDown(somaliaNode, { key: "Enter" });
    expect(handleSelectNode).toHaveBeenCalled();

    fireEvent.keyDown(somaliaNode, { key: " " });
    expect(handleSelectNode).toHaveBeenCalled();
  });

  it("verifies RegionalComparisonChart responds to Enter/Space keyboard triggers and has focus classes", () => {
    const handleSelect = vi.fn();
    const comparisons = [
      {
        pcode: "ET01",
        regionName: "Tigray",
        totalIdps: 980000,
        totalReturnees: 45000,
        primaryDriver: "conflict",
        femaleRatio: 51.2,
        childRatio: 54.1,
        hasDemographics: true,
      },
      {
        pcode: "ET04",
        regionName: "Oromia",
        totalIdps: 840000,
        totalReturnees: 52000,
        primaryDriver: "conflict",
        femaleRatio: 50.7,
        childRatio: 55.6,
        hasDemographics: true,
      },
    ];

    render(
      <RegionalComparisonChart
        comparisons={comparisons}
        selectedRegion="ET01"
        onSelectRegion={handleSelect}
      />
    );

    const tigrayCard = screen.getByRole("button", {
      name: /Tigray \(ET01\): 980,000 IDPs/i,
    });
    expect(tigrayCard).toHaveClass("focus-visible:ring-2");

    fireEvent.keyDown(tigrayCard, { key: "Enter" });
    expect(handleSelect).toHaveBeenCalledWith("ET01");

    fireEvent.keyDown(tigrayCard, { key: " " });
    expect(handleSelect).toHaveBeenCalledWith("ET01");
  });

  it("verifies Header mobile toggle button has accessible aria-label and visible focus ring", () => {
    render(<Header />);

    const menuButton = screen.getByRole("button", { name: /Toggle Navigation Menu/i });
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveClass("focus-visible:ring-2");
  });

  it("verifies FlowDataTable sortable headers respond to Enter/Space and declare aria-sort", () => {
    render(<FlowDataTable dataset={REFUGEE_INFLOW_DATASET} />);

    const volumeHeader = screen.getByRole("columnheader", { name: /Individuals/i });
    expect(volumeHeader).toHaveClass("focus-visible:ring-2");
    expect(volumeHeader).toHaveAttribute("tabindex", "0");
    expect(volumeHeader).toHaveAttribute("aria-sort", "descending");

    // Toggle sort via Enter
    fireEvent.keyDown(volumeHeader, { key: "Enter" });
    expect(volumeHeader).toHaveAttribute("aria-sort", "ascending");

    // Toggle sort via Space
    fireEvent.keyDown(volumeHeader, { key: " " });
    expect(volumeHeader).toHaveAttribute("aria-sort", "descending");
  });

  it("verifies CompositionBarChart has role='img' on life-stage bar and sr-only table", () => {
    render(<CompositionBarChart metrics={[]} />);

    const lifeStageBar = screen.getByRole("img", {
      name: /Population life-stage composition/i,
    });
    expect(lifeStageBar).toBeInTheDocument();

    const table = screen.getByRole("table", {
      name: /Broad life-stage demographic composition/i,
    });
    expect(table).toHaveClass("sr-only");
  });

  it("verifies AreaDetailDrawer and CountryDetailDrawer close buttons have visible focus rings", () => {
    const handleCloseArea = vi.fn();
    render(
      <AreaDetailDrawer
        area={{
          name: "Borena",
          pcode: "ET0408",
          adminLevel: 2,
          idps: 120000,
          returnees: 5000,
          primaryDriver: "drought",
        }}
        onClose={handleCloseArea}
      />
    );

    const closeAreaBtn = screen.getByRole("button", { name: /Close detail drawer/i });
    expect(closeAreaBtn).toHaveClass("focus-visible:ring-2");

    const handleCloseCountry = vi.fn();
    render(
      <CountryDetailDrawer
        country={GLOBAL_PARTNER_COUNTRIES[0]}
        selectedYear={2024}
        onClose={handleCloseCountry}
      />
    );

    const closeCountryBtn = screen.getByRole("button", { name: /Close country drawer/i });
    expect(closeCountryBtn).toHaveClass("focus-visible:ring-2");
  });

  it("verifies InsideEthiopiaView regional cards are keyboard navigable with focus rings", () => {
    const regionalCaseloads = [
      {
        pcode: "ET01",
        regionName: "Tigray",
        idps: 980000,
        returnees: 45000,
        primaryDriver: "conflict",
        reportingDate: "2024-08-31",
        confidence: "high" as const,
        citation: "IOM DTM Round 37",
      },
    ];
    const driverBreakdown = [
      {
        driver: "conflict",
        percentage: 80.1,
        totalIdps: 980000,
        affectedRegions: ["Tigray"],
      },
    ];

    render(
      <InsideEthiopiaView
        regionalCaseloads={regionalCaseloads}
        driverBreakdown={driverBreakdown}
      />
    );

    const tigrayCard = screen.getByRole("button", { name: /Select Tigray/i });
    expect(tigrayCard).toHaveClass("focus-visible:ring-2");
    expect(tigrayCard).toHaveAttribute("tabindex", "0");

    fireEvent.keyDown(tigrayCard, { key: "Enter" });
    expect(tigrayCard).toHaveAttribute("aria-pressed", "true");
  });
});
