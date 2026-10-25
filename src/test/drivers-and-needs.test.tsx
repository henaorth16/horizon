import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React from "react";
import {
  DriverBreakdownChart,
  DriverTimelineChart,
  DriverRegionalMatrix,
  DriverContextExplorer,
} from "@/components/drivers";
import {
  SectorIndicatorCard,
  ZonalNeedsMatrix,
  SectorNeedsExplorerView,
  NeedsVisualizationGraph,
} from "@/components/needs";
import { SECTOR_DEFINITIONS, REGIONAL_NEEDS_PROFILES } from "@/lib/data/humanitarianNeeds";
import { CRISIS_DRIVERS_DATA } from "@/lib/data/crisisDrivers";
import DriversPage from "@/app/drivers/page";
import HumanitarianNeedsPage from "@/app/humanitarian-needs/page";

describe("Crisis Drivers Visualizations: Components & Logic", () => {
  it("renders DriverBreakdownChart with primary triggers, toggle, and screen-reader table", () => {
    const handleSelect = vi.fn();
    render(
      <DriverBreakdownChart
        onSelectDriver={handleSelect}
        selectedCategory="conflict"
      />
    );

    // Title and subtext
    expect(screen.getByText("Primary Displacement Triggers")).toBeInTheDocument();
    expect(screen.getByText(/Round 37 — August 2024/i)).toBeInTheDocument();

    // Key driver categories (present in both cards and sr-only table)
    expect(screen.getAllByText("Conflict & Intercommunal Violence").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Prolonged Multi-Season Drought").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Flash & Riverine Floods").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Other & Environmental Shocks").length).toBeGreaterThanOrEqual(1);

    // Toggle from percentage to caseload count
    const countToggleBtn = screen.getByRole("button", { name: "Caseload Count" });
    fireEvent.click(countToggleBtn);
    expect(countToggleBtn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByText("2,160,000").length).toBeGreaterThanOrEqual(1);

    // Accessible table for screen readers
    const srTable = screen.getByRole("table", {
      name: /Documented Internal Displacement Triggers in Ethiopia/i,
    });
    expect(srTable).toBeInTheDocument();
    expect(within(srTable).getByText("Conflict & Intercommunal Violence")).toBeInTheDocument();
  });

  it("renders DriverTimelineChart with rounds and milestone context", () => {
    render(<DriverTimelineChart />);

    expect(screen.getByText(/Temporal Driver Evolution \(2021–2024\)/i)).toBeInTheDocument();

    // Check round dates (appear in interactive button and sr-only table)
    expect(screen.getAllByText("Round 26").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Round 37").length).toBeGreaterThanOrEqual(1);

    // Milestones text present
    expect(
      screen.getAllByText(/El Niño seasonal flooding across Shebelle\/Awash/i).length
    ).toBeGreaterThanOrEqual(1);

    // Screen reader table
    const table = screen.getByRole("table", {
      name: /Temporal internal displacement trends by primary driver/i,
    });
    expect(table).toBeInTheDocument();
    expect(within(table).getAllByText("Round 28").length).toBeGreaterThanOrEqual(1);
  });

  it("renders DriverRegionalMatrix and interactively filters by dominant driver", () => {
    render(<DriverRegionalMatrix />);

    expect(screen.getByText("Regional Driver Profiles")).toBeInTheDocument();

    // Check regions
    expect(screen.getByText("Tigray")).toBeInTheDocument();
    expect(screen.getByText("Somali")).toBeInTheDocument();
    expect(screen.getByText("Amhara")).toBeInTheDocument();
    expect(screen.getByText("Oromia")).toBeInTheDocument();

    // Filter to Drought-Dominant only
    const droughtFilterBtn = screen.getByRole("button", { name: /Drought-Dominant/i });
    fireEvent.click(droughtFilterBtn);

    // Somali and Afar are drought-dominant
    expect(screen.getByText("Somali")).toBeInTheDocument();
    expect(screen.getByText("Afar")).toBeInTheDocument();
    // Tigray (conflict-dominant) should now be filtered out
    expect(screen.queryByText("Tigray")).not.toBeInTheDocument();

    // Switch back to All Regions
    const allFilterBtn = screen.getByRole("button", { name: /All Regions/i });
    fireEvent.click(allFilterBtn);
    expect(screen.getByText("Tigray")).toBeInTheDocument();
  });

  it("renders DriverContextExplorer with causation safeguard and tab switches", () => {
    render(<DriverContextExplorer />);

    // Causation safeguard banner
    expect(screen.getByText(/Methodological Causation Safeguard:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/The observatory strictly avoids asserting monocausal claims/i)
    ).toBeInTheDocument();

    // KPI cards (present in top summary cards and child breakdown chart)
    expect(screen.getAllByText(/65\.4%/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/25%/).length).toBeGreaterThanOrEqual(1);

    // Tab buttons
    const regionalTab = screen.getByRole("button", { name: /Regional Matrix/i });
    fireEvent.click(regionalTab);
    expect(screen.getByText("Regional Driver Profiles")).toBeInTheDocument();

    const timelineTab = screen.getByRole("button", { name: /Temporal Evolution/i });
    fireEvent.click(timelineTab);
    expect(screen.getByText(/Temporal Driver Evolution \(2021–2024\)/i)).toBeInTheDocument();
  });
});

describe("Sectoral Humanitarian Needs: Components & Logic", () => {
  it("renders SectorIndicatorCard with Sphere benchmark and expands methodology", () => {
    const shelterDef = SECTOR_DEFINITIONS.shelter;
    render(<SectorIndicatorCard definition={shelterDef} />);

    expect(screen.getByText("Emergency Shelter Deficit")).toBeInTheDocument();
    expect(screen.getByText(/Emergency Shelter & Non-Food Items/i)).toBeInTheDocument();
    expect(screen.getByText(/Sphere Standard: Minimum 3.5 m²/i)).toBeInTheDocument();
    expect(screen.getByText("62.4%")).toBeInTheDocument();

    // Expand methodology
    const expandBtn = screen.getByRole("button", { name: /Inspect Definition & Thresholds/i });
    fireEvent.click(expandBtn);
    expect(screen.getByText(/Multi-Sector Needs Assessment \(MSNA\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Severity Thresholds:/i)).toBeInTheDocument();
  });

  it("renders ZonalNeedsMatrix with sector columns, IPC phases, and regional details", () => {
    render(<ZonalNeedsMatrix />);

    expect(screen.getByText("Multi-Sector Humanitarian Needs Matrix")).toBeInTheDocument();
    expect(screen.getByText("Shelter Deficit")).toBeInTheDocument();
    expect(screen.getByText("WASH Deficit")).toBeInTheDocument();
    expect(screen.getByText("Food IPC 3+")).toBeInTheDocument();
    expect(screen.getByText("Protection Gap")).toBeInTheDocument();
    expect(screen.getByText("Health Gap")).toBeInTheDocument();

    // Regional rows
    expect(screen.getByText("Tigray")).toBeInTheDocument();
    expect(screen.getByText("Somali")).toBeInTheDocument();

    // Click Somali to inspect details
    const somaliRow = screen.getByText("Somali");
    fireEvent.click(somaliRow);
    expect(screen.getByText("Somali Humanitarian Needs Profile")).toBeInTheDocument();
    expect(screen.getByText(/Water trucking dependency across lowland pastoral sites/i)).toBeInTheDocument();
  });

  it("renders SectorNeedsExplorerView with ethical scoring alert and sector filter tabs", () => {
    render(<SectorNeedsExplorerView />);

    // Ethical scoring principle alert
    expect(screen.getByText(/Ethical Humanitarian Scoring Principle:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/We explicitly reject unweighted composite vulnerability indexes/i)
    ).toBeInTheDocument();

    // Filter to WASH only
    const washTab = screen.getByRole("button", { name: /WASH & Water/i });
    fireEvent.click(washTab);

    expect(screen.getByText("Safe Water Deficit")).toBeInTheDocument();
    expect(screen.getByText("Showing 1 of 5 sectors")).toBeInTheDocument();

    // IPC Technical Reference Key
    expect(
      screen.getByText(/Integrated Food Security Phase Classification \(IPC\) Technical Reference/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Phase 4: Emergency")).toBeInTheDocument();
  });

  it("renders NeedsVisualizationGraph with quick shot snapshot cards, cluster bars, and radar views", () => {
    const handleSelect = vi.fn();
    render(<NeedsVisualizationGraph onSelectRegion={handleSelect} />);

    // Quick Shot Snapshot Cards
    expect(screen.getByText("Highest Water Deficit")).toBeInTheDocument();
    expect(screen.getByText("Highest Shelter Gap")).toBeInTheDocument();
    expect(screen.getByText("IPC Phase 4 Emergency")).toBeInTheDocument();
    expect(screen.getByText("Sphere Benchmark Deficit")).toBeInTheDocument();

    // Sub-view toggle buttons
    const clusterBtn = screen.getByRole("button", { name: /Cluster Comparison/i });
    const radarBtn = screen.getByRole("button", { name: /Vulnerability Radar/i });
    const heatGridBtn = screen.getByRole("button", { name: /Heat Matrix/i });

    expect(clusterBtn).toBeInTheDocument();
    expect(radarBtn).toBeInTheDocument();
    expect(heatGridBtn).toBeInTheDocument();

    // Default clustered view shows region bars & Sphere critical threshold markers
    expect(screen.getAllByText("60% Sphere").length).toBeGreaterThanOrEqual(1);

    // Switch to Radar view
    fireEvent.click(radarBtn);
    expect(screen.getByText(/Sector Deficit Footprint vs\. Sphere Standards/i)).toBeInTheDocument();
    expect(screen.getByText(/National Average/i)).toBeInTheDocument();

    // Switch to Heat Matrix view
    fireEvent.click(heatGridBtn);
    expect(screen.getByText("IPC Status")).toBeInTheDocument();
  });

  it("supports switching views in ZonalNeedsMatrix between Table View, Visualization Graph, and Combined mode", () => {
    render(<ZonalNeedsMatrix />);

    // Initial table view
    expect(screen.getByText("Shelter Deficit")).toBeInTheDocument();

    // Click Visualization Graph toggle
    const graphToggleBtn = screen.getByRole("button", { name: /Visualization Graph/i });
    fireEvent.click(graphToggleBtn);
    expect(graphToggleBtn).toHaveAttribute("aria-pressed", "true");

    // Quick shot stats and graph controls are visible
    expect(screen.getByText("Highest Water Deficit")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cluster Comparison/i })).toBeInTheDocument();

    // Click Combined view toggle
    const combinedToggleBtn = screen.getByRole("button", { name: /Combined/i });
    fireEvent.click(combinedToggleBtn);
    expect(combinedToggleBtn).toHaveAttribute("aria-pressed", "true");

    // Both graph and table are rendered
    expect(screen.getByText("Highest Water Deficit")).toBeInTheDocument();
    expect(screen.getAllByText("Shelter Deficit").length).toBeGreaterThanOrEqual(1);

    // Click Table View toggle back
    const tableToggleBtn = screen.getByRole("button", { name: /Table View/i });
    fireEvent.click(tableToggleBtn);
    expect(tableToggleBtn).toHaveAttribute("aria-pressed", "true");
  });
});

describe("Page Integration: DriversPage & HumanitarianNeedsPage", () => {
  it("renders DriversPage cleanly with all analytics modules", () => {
    render(<DriversPage />);

    expect(screen.getByText("Displacement Drivers & Crisis Triggers")).toBeInTheDocument();
    expect(screen.getByText("IOM DTM Round 37 Evidence")).toBeInTheDocument();
    expect(screen.getByText("Primary Displacement Triggers")).toBeInTheDocument();
  });

  it("renders HumanitarianNeedsPage cleanly with all cluster modules", () => {
    render(<HumanitarianNeedsPage />);

    expect(screen.getByText("Humanitarian Needs & Sector Demands")).toBeInTheDocument();
    expect(screen.getByText("OCHA HNO & Cluster Evidence")).toBeInTheDocument();
    expect(screen.getByText("Multi-Sector Humanitarian Needs Matrix")).toBeInTheDocument();
  });
});
