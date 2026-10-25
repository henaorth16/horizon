import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React from "react";
import { SankeyDiagram } from "@/components/flows/SankeyDiagram";
import { FlowDataTable } from "@/components/flows/FlowDataTable";
import { FlowExplorerView } from "@/components/flows/FlowExplorerView";
import AcrossBordersPage from "@/app/across-borders/page";
import {
  REFUGEE_INFLOW_DATASET,
  INTERNAL_DISPLACEMENT_FLOW_DATASET,
  OUTFLOW_MIGRATION_FLOW_DATASET,
} from "@/lib/geo/flowData";

describe("Flow & Sankey Visualizations: Primitives", () => {
  it("renders SankeyDiagram with source nodes, target nodes, and volume ribbons", () => {
    const handleSelect = vi.fn();
    render(
      <SankeyDiagram
        dataset={REFUGEE_INFLOW_DATASET}
        activeDriverFilter="all"
        selectedNodeId={null}
        onSelectNode={handleSelect}
      />
    );

    // Title and Mandate Badge
    expect(screen.getByText("Cross-Border Refugee Inflows to Ethiopia")).toBeInTheDocument();
    expect(screen.getByText("UNHCR 1951 Convention Mandate")).toBeInTheDocument();

    // Key origin nodes (Left column)
    expect(screen.getAllByText("South Sudan").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Somalia").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Eritrea").length).toBeGreaterThanOrEqual(1);

    // Honest diffuse / unrecorded origin node
    expect(screen.getAllByText(/Diffuse \/ Unrecorded Origins/i).length).toBeGreaterThanOrEqual(1);

    // Key destination nodes (Right column)
    expect(screen.getAllByText("Gambela Region Camps").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Somali Region Camps (Dollo Ado)").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Dispersed Host Communities/i).length).toBeGreaterThanOrEqual(1);

    // Screen reader accessible fallback table
    expect(
      screen.getByRole("table", {
        name: /Sankey displacement flow table for Cross-Border Refugee Inflows to Ethiopia/i,
      })
    ).toBeInTheDocument();

    // Node click
    const somaliaNode = screen.getByRole("button", { name: /Somalia:/i });
    fireEvent.click(somaliaNode);
    expect(handleSelect).toHaveBeenCalledWith("som");
  });

  it("handles driver filtering and node selection in SankeyDiagram", () => {
    render(
      <SankeyDiagram
        dataset={REFUGEE_INFLOW_DATASET}
        activeDriverFilter="drought"
        selectedNodeId="som"
      />
    );

    // Drought driver active: Somalia to Dollo Ado
    expect(screen.getAllByText("Somalia").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Somali Region Camps (Dollo Ado)").length).toBeGreaterThanOrEqual(1);
  });

  it("renders FlowDataTable with sortable columns and grand totals", () => {
    render(<FlowDataTable dataset={REFUGEE_INFLOW_DATASET} activeDriverFilter="all" />);

    expect(screen.getByText(/Tabular Pathways/i)).toBeInTheDocument();
    expect(screen.getByText("Origin / Departure")).toBeInTheDocument();
    expect(screen.getByText("Target Destination")).toBeInTheDocument();
    expect(screen.getByText("Individuals")).toBeInTheDocument();
    expect(screen.getByText("Share (%)")).toBeInTheDocument();

    // Grand totals
    expect(screen.getByText("Total Verified Pathways")).toBeInTheDocument();
    expect(screen.getAllByText("993,696").length).toBeGreaterThanOrEqual(1);

    // Sorting by Destination header
    const destHeader = screen.getByText("Target Destination");
    fireEvent.click(destHeader);
    expect(destHeader).toBeInTheDocument();
  });
});

describe("FlowExplorerView & Cross-Borders Integration", () => {
  it("interactively switches datasets and toggles between Sankey and Table views", () => {
    render(<FlowExplorerView initialDatasetId="refugee_inflows" />);

    // Initial state: Refugee Inflows
    expect(screen.getByText("Cross-Border Refugee Inflows to Ethiopia")).toBeInTheDocument();
    expect(screen.getByText(/Across 9 verified origin-destination corridors/i)).toBeInTheDocument();

    // Toggle to Internal Displacement Corridors (IOM DTM)
    const idpBtn = screen.getByRole("button", {
      name: "Internal Displacement Corridors (IOM DTM)",
    });
    fireEvent.click(idpBtn);

    expect(screen.getByText("Subnational Internal Displacement Corridors")).toBeInTheDocument();
    expect(screen.getByText("IOM DTM Round 37 Mandate")).toBeInTheDocument();
    expect(screen.getAllByText(/Western Tigray Epicenter/i).length).toBeGreaterThanOrEqual(1);

    // Toggle to Irregular Outflows (IOM MMC)
    const outflowBtn = screen.getByRole("button", {
      name: "Irregular Outflows (IOM MMC)",
    });
    fireEvent.click(outflowBtn);

    expect(screen.getByText("Cross-Border Irregular Outflow Corridors")).toBeInTheDocument();
    expect(screen.getByText("IOM Missing Migrants & Flow Monitoring")).toBeInTheDocument();

    // Switch view mode to Synchronized Table
    const tableBtn = screen.getByRole("button", { name: /Synchronized Table/i });
    fireEvent.click(tableBtn);

    expect(screen.getByText(/Tabular Pathways/i)).toBeInTheDocument();
    expect(screen.getByText("Total Verified Pathways")).toBeInTheDocument();

    // Switch view mode back to Sankey
    const sankeyBtn = screen.getByRole("button", { name: /Sankey Diagram/i });
    fireEvent.click(sankeyBtn);

    expect(screen.getByText("Cross-Border Irregular Outflow Corridors")).toBeInTheDocument();
  });

  it("filters pathways by crisis driver", () => {
    render(<FlowExplorerView initialDatasetId="internal_displacement_flows" />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "drought" } });

    // Shabelle & Dawa Drought Basin should remain
    expect(screen.getAllByText(/Shabelle & Dawa/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders full AcrossBordersPage without errors", () => {
    render(<AcrossBordersPage />);

    expect(screen.getByText(/Across Borders: Refugees & Asylum Seekers/i)).toBeInTheDocument();
    expect(screen.getByText(/Displacement Corridors & Origin-Destination Pathways/i)).toBeInTheDocument();
    expect(screen.getByText("Cross-Border Refugee Inflows to Ethiopia")).toBeInTheDocument();
  });
});
