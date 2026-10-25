import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "@/components/charts/EmptyState";
import { ErrorState } from "@/components/charts/ErrorState";
import {
  ChartSkeleton,
  MapSkeleton,
  TableSkeleton,
  KpiGridSkeleton,
  PyramidSkeleton,
  SankeySkeleton,
} from "@/components/ui/LoadingSkeleton";
import { StaleDataIndicator } from "@/components/ui/StaleDataIndicator";
import { PartialDataNotice } from "@/components/ui/PartialDataNotice";
import { ExecutiveTrendLine } from "@/components/charts/ExecutiveTrendLine";
import { DriverTimelineChart } from "@/components/drivers/DriverTimelineChart";
import { RegionalComparisonChart } from "@/components/demographics/RegionalComparisonChart";
import { FlowDataTable } from "@/components/flows/FlowDataTable";
import { FlowExplorerView } from "@/components/flows/FlowExplorerView";
import { REFUGEE_INFLOW_DATASET } from "@/lib/geo/flowData";

describe("Visualization Quality, Empty & Error States", () => {
  describe("EmptyState Component with Recommended Next Steps", () => {
    it("renders default title and description", () => {
      render(
        <EmptyState
          title="No Flow Corridors"
          description="No pathways match the selected criteria."
        />
      );
      expect(screen.getByText("No Flow Corridors")).toBeInTheDocument();
      expect(screen.getByText("No pathways match the selected criteria.")).toBeInTheDocument();
    });

    it("renders suggestions list offering actionable next steps", () => {
      render(
        <EmptyState
          title="No Filter Matches"
          description="No records found."
          suggestions={[
            "Broaden geographic filter",
            "Select a different reporting round",
          ]}
        />
      );
      expect(screen.getByText("Recommended Next Steps:")).toBeInTheDocument();
      expect(screen.getByText("Broaden geographic filter")).toBeInTheDocument();
      expect(screen.getByText("Select a different reporting round")).toBeInTheDocument();
    });

    it("fires onReset and onAction handlers when buttons are clicked", () => {
      const handleReset = vi.fn();
      const handleAction = vi.fn();

      render(
        <EmptyState
          description="Filter produced zero results."
          resetText="Clear Filters"
          onReset={handleReset}
          actionText="View Documentation"
          onAction={handleAction}
        />
      );

      fireEvent.click(screen.getByText("Clear Filters"));
      expect(handleReset).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText("View Documentation"));
      expect(handleAction).toHaveBeenCalledTimes(1);
    });
  });

  describe("ErrorState Component with Diagnostic Traces & Recovery", () => {
    it("renders error alert with title and message", () => {
      render(
        <ErrorState
          title="Cartography Fetch Failed"
          message="Failed to retrieve TopoJSON boundary files."
        />
      );
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Cartography Fetch Failed")).toBeInTheDocument();
      expect(screen.getByText("Failed to retrieve TopoJSON boundary files.")).toBeInTheDocument();
    });

    it("toggles diagnostic trace visibility", () => {
      render(
        <ErrorState
          message="Internal server error"
          details="Error: 500 Network timeout after 10000ms"
        />
      );

      const toggleButton = screen.getByText("View diagnostic trace");
      expect(screen.queryByText(/500 Network timeout/)).not.toBeInTheDocument();

      fireEvent.click(toggleButton);
      expect(screen.getByText(/500 Network timeout/)).toBeInTheDocument();

      fireEvent.click(screen.getByText("Hide diagnostic trace"));
      expect(screen.queryByText(/500 Network timeout/)).not.toBeInTheDocument();
    });

    it("renders retry and reset buttons", () => {
      const handleRetry = vi.fn();
      const handleReset = vi.fn();

      render(
        <ErrorState
          message="Failed to connect"
          onRetry={handleRetry}
          actionText="Retry Connection"
          onReset={handleReset}
          resetText="Return to Baseline"
        />
      );

      fireEvent.click(screen.getByText("Retry Connection"));
      expect(handleRetry).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText("Return to Baseline"));
      expect(handleReset).toHaveBeenCalledTimes(1);
    });
  });

  describe("Loading Skeletons (Pulse & Layout Integrity)", () => {
    it("renders ChartSkeleton with accessible status role", () => {
      render(<ChartSkeleton title="Loading trend chart..." minHeight={300} />);
      const skeleton = screen.getByRole("status", { name: "Loading trend chart..." });
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveStyle({ minHeight: "300px" });
    });

    it("renders MapSkeleton with administrative boundary loader", () => {
      render(<MapSkeleton title="Loading admin 1 polygons..." minHeight={440} />);
      const skeleton = screen.getByRole("status", { name: "Loading admin 1 polygons..." });
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveStyle({ minHeight: "440px" });
    });

    it("renders TableSkeleton with specified rows and columns", () => {
      render(<TableSkeleton rows={4} columns={5} />);
      expect(screen.getByRole("status", { name: "Loading tabular dataset..." })).toBeInTheDocument();
      expect(screen.getByText("Loading table records...")).toBeInTheDocument();
    });

    it("renders KpiGridSkeleton with count", () => {
      render(<KpiGridSkeleton count={3} />);
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText("Loading key indicators...")).toBeInTheDocument();
    });

    it("renders specialized PyramidSkeleton for demographic pyramids", () => {
      render(<PyramidSkeleton title="Loading population pyramid..." minHeight={360} />);
      expect(screen.getByRole("status", { name: "Loading population pyramid..." })).toBeInTheDocument();
    });

    it("renders specialized SankeySkeleton for flow corridors", () => {
      render(<SankeySkeleton title="Loading flow corridors..." minHeight={420} />);
      expect(screen.getByRole("status", { name: "Loading flow corridors..." })).toBeInTheDocument();
    });
  });

  describe("StaleDataIndicator & PartialDataNotice", () => {
    it("renders StaleDataIndicator banner for historical assessment round with reset baseline button", () => {
      const handleReset = vi.fn();
      render(
        <StaleDataIndicator
          reportingDate="2022-11-30"
          round="R31"
          sourceName="IOM DTM"
          mode="banner"
          onResetBaseline={handleReset}
        />
      );

      expect(screen.getByText("Historical Assessment Context")).toBeInTheDocument();
      expect(screen.getByText("R31 • 2022-11-30")).toBeInTheDocument();

      const resetButton = screen.getByText("Return to Baseline (Round 37)");
      fireEvent.click(resetButton);
      expect(handleReset).toHaveBeenCalledTimes(1);
    });

    it("renders PartialDataNotice with warning severity and inaccessible zones", () => {
      render(
        <PartialDataNotice
          title="Access Limitation"
          locationName="Tigray Region"
          unassessedZones={["Western Tigray", "Border Woredas"]}
          reason="Seasonal riverine flooding restricted enumerator teams."
        />
      );

      expect(screen.getByText(/Access Limitation — Tigray Region/)).toBeInTheDocument();
      expect(screen.getByText(/Western Tigray, Border Woredas/)).toBeInTheDocument();
      expect(screen.getByText(/An unassessed or blank entry does not imply zero displacement/)).toBeInTheDocument();
    });
  });

  describe("Chart Scale Integrity & Empty Fallbacks", () => {
    it("renders ExecutiveTrendLine empty state when dataset is empty", () => {
      render(<ExecutiveTrendLine data={[]} />);
      expect(screen.getByText("No Annual Trend Data")).toBeInTheDocument();
    });

    it("renders ExecutiveTrendLine with descriptive axis headers and zero baseline", () => {
      render(<ExecutiveTrendLine />);
      expect(screen.getByText("National Trends: Internal Displacement vs. Cross-Border Refugees")).toBeInTheDocument();
      // Y axis scale title and legend
      expect(screen.getAllByText("IDPs (IOM DTM)").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Refugees (UNHCR)").length).toBeGreaterThanOrEqual(1);
      // X axis description
      expect(screen.getByText("Assessment Year (Annual Mid-Year Verified)")).toBeInTheDocument();
    });

    it("renders DriverTimelineChart with scale markings and zero-baseline notice", () => {
      render(<DriverTimelineChart />);
      expect(screen.getByText("Temporal Driver Evolution (2021–2024)")).toBeInTheDocument();
      expect(screen.getByText("Scale: Displaced Individuals (Millions)")).toBeInTheDocument();
      expect(screen.getByText("Zero-Baseline Integrity Preserved")).toBeInTheDocument();
    });

    it("renders RegionalComparisonChart empty state when comparisons array is empty", () => {
      render(<RegionalComparisonChart comparisons={[]} />);
      expect(screen.getByText("No Regional Comparisons Available")).toBeInTheDocument();
    });

    it("renders FlowDataTable empty state when filtered links is empty", () => {
      const emptyDataset = {
        ...REFUGEE_INFLOW_DATASET,
        links: [],
      };
      render(<FlowDataTable dataset={emptyDataset} />);
      expect(screen.getByText("No Matching Flow Records")).toBeInTheDocument();
    });

    it("displays StaleDataIndicator in DriverTimelineChart when historical round is selected", () => {
      render(<DriverTimelineChart />);

      // Initially on Round 37 baseline
      expect(screen.queryByText("Historical Assessment Context")).not.toBeInTheDocument();

      // Click Round 31 button
      const r31Btn = screen.getByRole("button", { name: /Round 31/i });
      fireEvent.click(r31Btn);

      expect(screen.getByText("Historical Assessment Context")).toBeInTheDocument();
      expect(screen.getAllByText(/Round 31/i).length).toBeGreaterThanOrEqual(1);

      // Return to baseline
      const resetBtn = screen.getByText("Return to Baseline (Round 37)");
      fireEvent.click(resetBtn);

      expect(screen.queryByText("Historical Assessment Context")).not.toBeInTheDocument();
    });

    it("renders PartialDataNotice in FlowExplorerView when driver filter is applied", () => {
      render(<FlowExplorerView initialDatasetId="internal_displacement_flows" />);

      expect(screen.queryByText(/Flow Driver Subset: DROUGHT/i)).not.toBeInTheDocument();

      const driverSelect = screen.getByRole("combobox", { name: /Filter flows by displacement driver/i });
      fireEvent.change(driverSelect, { target: { value: "drought" } });

      expect(screen.getByText(/Flow Driver Subset: DROUGHT/i)).toBeInTheDocument();
      expect(screen.getByText(/Displaying only displacement and migration pathways where the corroborated primary trigger is 'drought'/i)).toBeInTheDocument();
    });
  });
});
