import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React from "react";
import {
  ExecutiveTrendLine,
  OFFICIAL_HISTORICAL_TRENDS,
} from "@/components/charts/ExecutiveTrendLine";
import { PopulationPyramid } from "@/components/demographics/PopulationPyramid";
import { SankeyDiagram } from "@/components/flows/SankeyDiagram";
import { EthiopiaChoroplethMap } from "@/components/maps/EthiopiaChoroplethMap";
import { getDemographicProfile, getRegionalIdpCaseloads } from "@/lib/db";
import { REFUGEE_INFLOW_DATASET } from "@/lib/geo/flowData";
import { getEthiopiaAdm1Topology } from "@/lib/geo/server";
import type { DemographicProfile } from "@/lib/db/types";

describe("Chart Component & Interaction Tests: ExecutiveTrendLine", () => {
  it("renders on valid data with axes, series lines, and non-additive warning", () => {
    render(<ExecutiveTrendLine data={OFFICIAL_HISTORICAL_TRENDS} />);

    expect(
      screen.getByText("National Trends: Internal Displacement vs. Cross-Border Refugees")
    ).toBeInTheDocument();
    expect(screen.getByText(/Non-Additive Principle:/i)).toBeInTheDocument();

    // Verify series toggle buttons
    expect(screen.getByRole("button", { name: "Dual Comparison" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "IDPs Only (IOM)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refugees Only (UNHCR)" })).toBeInTheDocument();

    // Verify legend items
    expect(screen.getByText(/Internally Displaced Persons \(IOM DTM\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Recognized Refugees Hosted \(UNHCR\)/i)).toBeInTheDocument();

    // Verify SVG container
    expect(screen.getByRole("img", { name: /Historical displacement trajectories in Ethiopia/i })).toBeInTheDocument();
  });

  it("falls back to EmptyState when data is empty", () => {
    render(<ExecutiveTrendLine data={[]} />);

    expect(screen.getByText("No Annual Trend Data")).toBeInTheDocument();
    expect(
      screen.getByText("No annual displacement observations were found matching the selected historical parameters.")
    ).toBeInTheDocument();
    expect(screen.getByText("Reset your series selection to 'Dual Comparison'")).toBeInTheDocument();
  });

  it("displays tooltip overlay on hovering a data point focus target", () => {
    render(<ExecutiveTrendLine data={OFFICIAL_HISTORICAL_TRENDS} />);

    const point2024 = screen.getByRole("button", { name: /Year 2024/i });
    expect(point2024).toBeInTheDocument();

    // Hover over 2024 point
    fireEvent.mouseEnter(point2024);

    // Tooltip should be visible with values and historical context
    expect(screen.getByText("Year 2024")).toBeInTheDocument();
    expect(screen.getAllByText("3,392,200").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("1,085,000").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/IOM DTM Round 37 verified baseline/i).length).toBeGreaterThanOrEqual(2);
  });

  it("handles series filter change button toggles", () => {
    render(<ExecutiveTrendLine data={OFFICIAL_HISTORICAL_TRENDS} />);

    const idpOnlyBtn = screen.getByRole("button", { name: "IDPs Only (IOM)" });
    const refOnlyBtn = screen.getByRole("button", { name: "Refugees Only (UNHCR)" });
    const dualBtn = screen.getByRole("button", { name: "Dual Comparison" });

    // Switch to IDPs Only
    fireEvent.click(idpOnlyBtn);
    expect(idpOnlyBtn).toHaveClass("bg-amber-500/20");

    // Switch to Refugees Only
    fireEvent.click(refOnlyBtn);
    expect(refOnlyBtn).toHaveClass("bg-cyan-500/20");

    // Switch back to Dual Comparison
    fireEvent.click(dualBtn);
    expect(dualBtn).toHaveClass("bg-ink-800");
  });
});

describe("Chart Component & Interaction Tests: PopulationPyramid", () => {
  const sampleProfile = getDemographicProfile({ populationType: "idp", locationId: "ET" });

  it("renders on valid demographic profile data with balanced sex headers and age cohorts", () => {
    render(<PopulationPyramid profile={sampleProfile} />);

    expect(screen.getByText(/Population Pyramid: Ethiopia \(National\)/i)).toBeInTheDocument();
    expect(screen.getByText("Male")).toBeInTheDocument();
    expect(screen.getByText("Female")).toBeInTheDocument();

    // Verify age cohort bars exist using exact role and regex prefix to distinguish male from female
    expect(screen.getByRole("img", { name: /^Male age 0-4/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /^Female age 0-4/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /^Male age 18-59/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /^Female age 18-59/i })).toBeInTheDocument();
  });

  it("falls back to EmptyState when cohorts array is empty", () => {
    const emptyProfile: DemographicProfile = {
      ...sampleProfile,
      cohorts: [],
    };

    render(<PopulationPyramid profile={emptyProfile} />);

    expect(screen.getByText("No Demographic Cohort Data")).toBeInTheDocument();
    expect(
      screen.getByText(/No age and sex demographic cohort records are available for Ethiopia \(National\)/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Select a different administrative region or national overview")).toBeInTheDocument();
  });

  it("displays unassessed notice when hasDemographicBreakdown is false", () => {
    const unassessedProfile: DemographicProfile = {
      ...sampleProfile,
      hasDemographicBreakdown: false,
      missingReason: "Security constraints prevented site enumeration.",
    };

    render(<PopulationPyramid profile={unassessedProfile} />);

    expect(screen.getByText(/Breakdown Suppressed \/ Unassessed/i)).toBeInTheDocument();
    expect(screen.getByText("Security constraints prevented site enumeration.")).toBeInTheDocument();
  });

  it("displays tooltip overlay on hovering a demographic cohort bar", () => {
    render(<PopulationPyramid profile={sampleProfile} />);

    const maleCohortBar = screen.getByRole("img", { name: /^Male age 0-4/i });
    expect(maleCohortBar).toBeInTheDocument();

    // Hover over Male 0-4 bar
    fireEvent.mouseEnter(maleCohortBar);

    expect(screen.getByText("Age Cohort 0-4 (Male)")).toBeInTheDocument();
    expect(screen.getByText("Estimated Stock:")).toBeInTheDocument();
    expect(screen.getByText("Cohort Proportion:")).toBeInTheDocument();
  });
});

describe("Chart Component & Interaction Tests: SankeyDiagram", () => {
  it("renders on valid flow dataset with source and target nodes", () => {
    const handleSelectNode = vi.fn();
    render(
      <SankeyDiagram
        dataset={REFUGEE_INFLOW_DATASET}
        activeDriverFilter="all"
        selectedNodeId={null}
        onSelectNode={handleSelectNode}
      />
    );

    expect(screen.getByText("Cross-Border Refugee Inflows to Ethiopia")).toBeInTheDocument();
    expect(screen.getAllByText("South Sudan").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Somalia").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Gambela Region Camps").length).toBeGreaterThanOrEqual(1);
  });

  it("falls back to EmptyState when filteredLinks is empty", () => {
    const emptyDataset = {
      ...REFUGEE_INFLOW_DATASET,
      links: [],
    };

    render(<SankeyDiagram dataset={emptyDataset} />);

    expect(screen.getByText("No Flow Corridors Match Filter")).toBeInTheDocument();
    expect(screen.getByText("Lower or reset the minimum volume threshold slider")).toBeInTheDocument();
  });

  it("displays tooltip overlay on hovering a flow ribbon path", () => {
    render(<SankeyDiagram dataset={REFUGEE_INFLOW_DATASET} />);

    const ribbon = screen.getByLabelText(/South Sudan to Gambela Region Camps/i);
    expect(ribbon).toBeInTheDocument();

    // Hover over ribbon
    fireEvent.mouseEnter(ribbon);

    expect(screen.getByText("South Sudan → Gambela Region Camps")).toBeInTheDocument();
    expect(screen.getByText("Flow Volume:")).toBeInTheDocument();
    expect(screen.getByText("Dataset Share:")).toBeInTheDocument();
  });

  it("calls onSelectNode callback when a destination node is clicked", () => {
    const handleSelectNode = vi.fn();
    render(
      <SankeyDiagram
        dataset={REFUGEE_INFLOW_DATASET}
        onSelectNode={handleSelectNode}
      />
    );

    const somaliaNode = screen.getByRole("button", { name: /Somalia:/i });
    fireEvent.click(somaliaNode);

    expect(handleSelectNode).toHaveBeenCalledWith("som");
  });
});

describe("Chart Component & Interaction Tests: EthiopiaChoroplethMap", () => {
  const sampleCaseloads = getRegionalIdpCaseloads();
  const adm1Topology = getEthiopiaAdm1Topology();

  it("renders on valid data with region paths, controls, and accessibility elements", () => {
    render(
      <EthiopiaChoroplethMap
        caseloads={sampleCaseloads}
        initialTopology={adm1Topology || undefined}
      />
    );

    expect(screen.getByText("Ethiopia Administrative Displacement Choropleth")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Admin 1 (Regions)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Admin 2 (Zones)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "IDP Caseload" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Returnees" })).toBeInTheDocument();

    // Tigray region path
    expect(screen.getByRole("button", { name: /Tigray/i })).toBeInTheDocument();
  });

  it("falls back to EmptyState when caseloads array is empty", () => {
    render(
      <EthiopiaChoroplethMap
        caseloads={[]}
        initialTopology={adm1Topology || undefined}
      />
    );

    expect(screen.getByText("No Displacement Caseload Data")).toBeInTheDocument();
    expect(
      screen.getByText("No subnational IDP or returnee caseload records are available for the current filters.")
    ).toBeInTheDocument();
    expect(screen.getByText("Reset active filters to view all administrative areas")).toBeInTheDocument();
  });

  it("falls back to EmptyState when boundary features array is empty", () => {
    render(
      <EthiopiaChoroplethMap
        caseloads={sampleCaseloads}
        initialGeojson={{
          type: "FeatureCollection",
          features: [],
        }}
      />
    );

    expect(screen.getByText("Boundary Data Unavailable")).toBeInTheDocument();
    expect(
      screen.getByText("Administrative polygon boundaries could not be parsed for this administrative level.")
    ).toBeInTheDocument();
  });

  it("displays tooltip overlay on hovering an administrative region path", () => {
    render(
      <EthiopiaChoroplethMap
        caseloads={sampleCaseloads}
        initialTopology={adm1Topology || undefined}
      />
    );

    const tigrayPath = screen.getByRole("button", { name: /Tigray/i });
    fireEvent.mouseEnter(tigrayPath);

    expect(screen.getByText("P-Code:")).toBeInTheDocument();
    expect(screen.getAllByText("ET01").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("1,025,400").length).toBeGreaterThanOrEqual(1);
  });

  it("handles filter toggles and area selection callback to open detail drawer", () => {
    render(
      <EthiopiaChoroplethMap
        caseloads={sampleCaseloads}
        initialTopology={adm1Topology || undefined}
      />
    );

    // Toggle metric to Returnees
    const returneesBtn = screen.getByRole("button", { name: "Returnees" });
    fireEvent.click(returneesBtn);
    expect(screen.getByText(/Returnee Scale:/i)).toBeInTheDocument();

    // Click Tigray region path
    const tigrayPath = screen.getByRole("button", { name: /Tigray/i });
    fireEvent.click(tigrayPath);

    // Detail drawer appears
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole("heading", { name: "Tigray" })).toBeInTheDocument();
    expect(within(dialog).getByText("P-Code: ET01")).toBeInTheDocument();
  });
});
