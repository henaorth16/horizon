import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React from "react";
import { GlobeViewport } from "@/components/globe/GlobeViewport";
import { CountryDetailDrawer } from "@/components/globe/CountryDetailDrawer";
import { TopDestinationsRanking } from "@/components/globe/TopDestinationsRanking";
import { CorridorCardList } from "@/components/globe/CorridorCardList";
import { GlobalMigrationAtlas } from "@/components/globe/GlobalMigrationAtlas";
import GlobePage from "@/app/globe/page";
import { getWorld110mTopology } from "@/lib/geo/server";
import { GLOBAL_PARTNER_COUNTRIES } from "@/lib/geo/migrationData";

describe("Global Migration Atlas & 3D Globe Component", () => {
  const worldTopology = getWorld110mTopology();
  const sampleCountry = GLOBAL_PARTNER_COUNTRIES.find((c) => c.iso === "USA")!;

  it("renders GlobeViewport with 3D projection, controls, and accessibility fallback", () => {
    const handleSelect = vi.fn();
    render(
      <GlobeViewport
        initialTopology={worldTopology || undefined}
        selectedMetric="emigrants"
        selectedYear={2024}
        selectedCountry={null}
        onSelectCountry={handleSelect}
      />
    );

    // Header & control bar elements
    expect(screen.getByText("Interactive 3D Migration Globe")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3D Globe" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2D Fallback" })).toBeInTheDocument();

    // 3D rotation controls
    expect(screen.getByRole("button", { name: "Rotate left" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rotate right" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Center on Ethiopia" })).toBeInTheDocument();

    // Zoom controls
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset view" })).toBeInTheDocument();

    // Screen reader accessible table fallback
    expect(
      screen.getByRole("table", {
        name: /International migration and diaspora partner countries table/i,
      })
    ).toBeInTheDocument();
  });

  it("switches projection mode from 3D Globe to 2D Fallback Map", () => {
    render(
      <GlobeViewport
        initialTopology={worldTopology || undefined}
        selectedMetric="emigrants"
        selectedYear={2024}
        selectedCountry={null}
        onSelectCountry={vi.fn()}
      />
    );

    const fallbackBtn = screen.getByRole("button", { name: "2D Fallback" });
    const globeBtn = screen.getByRole("button", { name: "3D Globe" });

    // Initial state: 3D
    expect(screen.getByText("Interactive 3D Migration Globe")).toBeInTheDocument();

    // Switch to 2D
    fireEvent.click(fallbackBtn);
    expect(screen.getByText("2D Accessible World Map")).toBeInTheDocument();

    // Switch back to 3D
    fireEvent.click(globeBtn);
    expect(screen.getByText("Interactive 3D Migration Globe")).toBeInTheDocument();
  });

  it("handles zoom and rotation controls without crashing", () => {
    render(
      <GlobeViewport
        initialTopology={worldTopology || undefined}
        selectedMetric="emigrants"
        selectedYear={2024}
        selectedCountry={null}
        onSelectCountry={vi.fn()}
      />
    );

    const zoomIn = screen.getByRole("button", { name: "Zoom in" });
    const zoomOut = screen.getByRole("button", { name: "Zoom out" });
    const rotateLeft = screen.getByRole("button", { name: "Rotate left" });
    const rotateRight = screen.getByRole("button", { name: "Rotate right" });
    const centerHorn = screen.getByRole("button", { name: "Center on Ethiopia" });

    fireEvent.click(zoomIn);
    fireEvent.click(zoomOut);
    fireEvent.click(rotateLeft);
    fireEvent.click(rotateRight);
    fireEvent.click(centerHorn);

    expect(screen.getByText("Interactive 3D Migration Globe")).toBeInTheDocument();
  });
});

describe("CountryDetailDrawer & Leaderboard Components", () => {
  const sampleCountry = GLOBAL_PARTNER_COUNTRIES.find((c) => c.iso === "USA")!;

  it("renders CountryDetailDrawer with bilateral stock and historical growth", () => {
    const handleClose = vi.fn();
    render(
      <CountryDetailDrawer
        country={sampleCountry}
        selectedYear={2024}
        onClose={handleClose}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("United States")).toBeInTheDocument();
    expect(screen.getByText(/ISO Code: USA/i)).toBeInTheDocument();
    expect(screen.getByText("325,000")).toBeInTheDocument();
    expect(screen.getByText("14,200")).toBeInTheDocument();
    expect(screen.getByText("Transatlantic Diaspora")).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: "Close country drawer" });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders null in CountryDetailDrawer when country is null", () => {
    const { container } = render(
      <CountryDetailDrawer country={null} selectedYear={2024} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders TopDestinationsRanking leaderboard and handles country selection", () => {
    const handleSelect = vi.fn();
    render(
      <TopDestinationsRanking
        selectedYear={2024}
        selectedMetric="emigrants"
        selectedCountry={null}
        onSelectCountry={handleSelect}
      />
    );

    expect(screen.getByText("Top Diaspora Destinations (2024)")).toBeInTheDocument();
    expect(screen.getByText("United States")).toBeInTheDocument();
    expect(screen.getByText("Saudi Arabia")).toBeInTheDocument();
    expect(screen.getByText("Israel")).toBeInTheDocument();

    // Select Saudi Arabia
    const saudiRow = screen.getByText("Saudi Arabia").closest("[role='button']");
    expect(saudiRow).toBeInTheDocument();
    if (saudiRow) {
      fireEvent.click(saudiRow);
      expect(handleSelect).toHaveBeenCalledWith(
        expect.objectContaining({ iso: "SAU", name: "Saudi Arabia" })
      );
    }
  });

  it("renders CorridorCardList with Horn of Africa routes", () => {
    const handleSelect = vi.fn();
    render(
      <CorridorCardList
        selectedCorridorId="corridor_eastern"
        onSelectCorridor={handleSelect}
      />
    );

    expect(screen.getByText("Major Horn of Africa Transit Corridors")).toBeInTheDocument();
    expect(screen.getByText("Eastern Route (Yemen & Gulf States)")).toBeInTheDocument();
    expect(screen.getByText("Southern Route (Kenya to South Africa)")).toBeInTheDocument();
    expect(screen.getByText("Northern Route (Sudan & Central Mediterranean)")).toBeInTheDocument();

    // Click Southern Route
    const southernCard = screen
      .getByText("Southern Route (Kenya to South Africa)")
      .closest("[role='button']");
    expect(southernCard).toBeInTheDocument();
    if (southernCard) {
      fireEvent.click(southernCard);
      expect(handleSelect).toHaveBeenCalledWith("corridor_southern");
    }
  });
});

describe("GlobalMigrationAtlas & Page Integration", () => {
  const worldTopology = getWorld110mTopology();

  it("interactively updates time slider and metric selection in GlobalMigrationAtlas", () => {
    render(<GlobalMigrationAtlas initialTopology={worldTopology || undefined} />);

    // Check KPI Cards
    expect(screen.getByText("Global Ethiopian Diaspora")).toBeInTheDocument();
    expect(screen.getByText("Ethiopian Refugees Abroad")).toBeInTheDocument();
    expect(screen.getByText("Primary Irregular Axis")).toBeInTheDocument();

    // Check Timeline buttons
    const btn2010 = screen.getByRole("button", { name: "2010" });
    const btn2020 = screen.getByRole("button", { name: "2020" });

    // Switch year to 2010
    fireEvent.click(btn2010);
    expect(screen.getByText(/Active Reporting Year:/i)).toBeInTheDocument();
    expect(screen.getAllByText("2010").length).toBeGreaterThanOrEqual(1);

    // Switch year to 2020
    fireEvent.click(btn2020);
    expect(screen.getAllByText("2020").length).toBeGreaterThanOrEqual(1);

    // Switch metric to Refugees Abroad
    const refugeesAbroadBtn = screen.getByRole("button", { name: "Refugees Abroad (UNHCR)" });
    fireEvent.click(refugeesAbroadBtn);
    expect(screen.getByText(/Top Countries Hosting Ethiopian Refugees/i)).toBeInTheDocument();
  });

  it("renders full GlobePage without errors", () => {
    render(<GlobePage />);

    expect(screen.getByText(/Migration Globe & Cross-Border Corridors/i)).toBeInTheDocument();
    expect(screen.getByText(/UN DESA & UNHCR Verified Data/i)).toBeInTheDocument();
    expect(screen.getByText(/Interactive Cartographic Engine:/i)).toBeInTheDocument();
  });
});
