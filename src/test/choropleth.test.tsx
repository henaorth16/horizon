import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React from "react";
import { EthiopiaChoroplethMap } from "@/components/maps/EthiopiaChoroplethMap";
import { AreaDetailDrawer } from "@/components/maps/AreaDetailDrawer";
import { getEthiopiaAdm1Topology } from "@/lib/geo/server";
import { getRegionalIdpCaseloads } from "@/lib/db";

describe("Interactive Ethiopia Choropleth Map Component", () => {
  const sampleCaseloads = getRegionalIdpCaseloads();
  const adm1Topology = getEthiopiaAdm1Topology();

  it("renders choropleth SVG container, controls, and accessibility elements", () => {
    render(
      <EthiopiaChoroplethMap
        caseloads={sampleCaseloads}
        initialTopology={adm1Topology || undefined}
      />
    );

    // Header & control bar elements
    expect(screen.getByText("Ethiopia Administrative Displacement Choropleth")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Admin 1 (Regions)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Admin 2 (Zones)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "IDP Caseload" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Returnees" })).toBeInTheDocument();

    // Zoom controls
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset zoom" })).toBeInTheDocument();

    // Screen reader fallback table
    expect(screen.getByRole("table", { name: /Subnational displacement caseload table/i })).toBeInTheDocument();
    expect(screen.getByText("Verified IDP and returnee caseloads across Ethiopian administrative areas")).toBeInTheDocument();

    // Dynamic legend
    expect(screen.getByText(/IDP Scale:/i)).toBeInTheDocument();
    expect(screen.getByText("Unassessed")).toBeInTheDocument();
  });

  it("switches metric from IDPs to Returnees dynamically", () => {
    render(
      <EthiopiaChoroplethMap
        caseloads={sampleCaseloads}
        initialTopology={adm1Topology || undefined}
      />
    );

    const returneesBtn = screen.getByRole("button", { name: "Returnees" });
    const idpsBtn = screen.getByRole("button", { name: "IDP Caseload" });

    // Initial state: IDP Scale is displayed
    expect(screen.getByText(/IDP Scale:/i)).toBeInTheDocument();

    // Switch to Returnees
    fireEvent.click(returneesBtn);
    expect(screen.getByText(/Returnee Scale:/i)).toBeInTheDocument();

    // Switch back to IDPs
    fireEvent.click(idpsBtn);
    expect(screen.getByText(/IDP Scale:/i)).toBeInTheDocument();
  });

  it("handles zoom controls without crashing", () => {
    render(
      <EthiopiaChoroplethMap
        caseloads={sampleCaseloads}
        initialTopology={adm1Topology || undefined}
      />
    );

    const zoomIn = screen.getByRole("button", { name: "Zoom in" });
    const zoomOut = screen.getByRole("button", { name: "Zoom out" });
    const resetZoom = screen.getByRole("button", { name: "Reset zoom" });

    fireEvent.click(zoomIn);
    fireEvent.click(zoomIn);
    fireEvent.click(zoomOut);
    fireEvent.click(resetZoom);

    // Map container remains intact
    expect(screen.getByText("Ethiopia Administrative Displacement Choropleth")).toBeInTheDocument();
  });

  it("selects an area on click and renders the contextual detail drawer", () => {
    render(
      <EthiopiaChoroplethMap
        caseloads={sampleCaseloads}
        initialTopology={adm1Topology || undefined}
      />
    );

    // Find region button paths (e.g. Tigray)
    const tigrayPath = screen.getByRole("button", { name: /Tigray/i });
    expect(tigrayPath).toBeInTheDocument();

    // Click Tigray path to open detail drawer
    fireEvent.click(tigrayPath);

    // Drawer dialog should appear
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole("heading", { name: "Tigray" })).toBeInTheDocument();
    expect(within(dialog).getByText("P-Code: ET01")).toBeInTheDocument();
    expect(within(dialog).getByText("1,025,400")).toBeInTheDocument();
    expect(within(dialog).getByText("1,210,000")).toBeInTheDocument();

    // Close the drawer
    const closeBtn = screen.getByRole("button", { name: "Close detail drawer" });
    fireEvent.click(closeBtn);

    // Drawer dialog should be removed
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("AreaDetailDrawer Isolated Component", () => {
  it("renders selected region metrics, verification badge, and citation", () => {
    const handleClose = vi.fn();
    const mockArea = {
      name: "Amhara",
      pcode: "ET03",
      adminLevel: 1,
      idps: 605200,
      returnees: 210000,
      primaryDriver: "conflict",
      confidence: "high",
      reportingDate: "2024-08-31",
      citation: "IOM DTM Ethiopia — National Displacement Report 37",
    };

    render(<AreaDetailDrawer area={mockArea} onClose={handleClose} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Amhara" })).toBeInTheDocument();
    expect(screen.getByText("P-Code: ET03")).toBeInTheDocument();
    expect(screen.getByText("605,200")).toBeInTheDocument();
    expect(screen.getByText("210,000")).toBeInTheDocument();
    expect(screen.getByText("Admin 1 Regional State")).toBeInTheDocument();
    expect(screen.getByText("conflict")).toBeInTheDocument();
    expect(screen.getByText("high")).toBeInTheDocument();
    expect(screen.getByText("IOM DTM Ethiopia — National Displacement Report 37")).toBeInTheDocument();
    expect(screen.getByText(/Inspect Amhara in Data Explorer/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: "Close detail drawer" });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders null if area is not provided", () => {
    const { container } = render(<AreaDetailDrawer area={null} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
