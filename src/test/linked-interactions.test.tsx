import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React from "react";
import {
  sanitizeFilterState,
  filtersToQueryString,
  parseQueryStringToFilters,
  DEFAULT_FILTER_STATE,
} from "@/lib/state/types";
import {
  ObservatoryFilterProvider,
  useObservatoryFilters,
} from "@/lib/state/ObservatoryFilterContext";
import { InteractiveFilterBar } from "@/components/shared/InteractiveFilterBar";
import { TimelineScrubber } from "@/components/shared/TimelineScrubber";
import { InsideEthiopiaView } from "@/components/maps/InsideEthiopiaView";
import { getRegionalIdpCaseloads, getDisplacementByDriver } from "@/lib/db";
import InsideEthiopiaPage from "@/app/inside-ethiopia/page";

describe("Unified State Model: Validation & Incompatibility Guards", () => {
  it("retains valid filter states cleanly", () => {
    const result = sanitizeFilterState({
      region: "ET01",
      metric: "idps",
      driver: "conflict",
      population: "idp",
      round: "R37",
      adminLevel: 1,
    });

    expect(result.hasInvalidCombination).toBe(false);
    expect(result.issues).toHaveLength(0);
    expect(result.state.region).toBe("ET01");
    expect(result.state.metric).toBe("idps");
    expect(result.state.driver).toBe("conflict");
  });

  it("sanitizes invalid region codes back to 'all' with an explanatory issue", () => {
    const result = sanitizeFilterState({
      region: "ET99_INVALID",
    });

    expect(result.hasInvalidCombination).toBe(true);
    expect(result.state.region).toBe("all");
    expect(result.issues[0].parameter).toBe("region");
    expect(result.issues[0].reason).toContain("not recognized in official UN OCHA gazetteer");
  });

  it("enforces Mandate Isolation: prevents refugees from being combined with IDP returnees", () => {
    const result = sanitizeFilterState({
      population: "refugee",
      metric: "returnees",
    });

    expect(result.hasInvalidCombination).toBe(true);
    expect(result.state.metric).toBe("refugees");
    expect(result.issues.some((i) => i.parameter === "metric")).toBe(true);
  });

  it("enforces Mandate Isolation: prevents refugees from being combined with internal climate drivers", () => {
    const result = sanitizeFilterState({
      population: "refugee",
      driver: "drought",
    });

    expect(result.hasInvalidCombination).toBe(true);
    expect(result.state.driver).toBe("all");
    expect(result.issues.some((i) => i.parameter === "driver")).toBe(true);
  });

  it("sanitizes unverified assessment rounds to baseline Round 37", () => {
    const result = sanitizeFilterState({
      round: "R99",
    });

    expect(result.state.round).toBe("R37");
    expect(result.issues[0].parameter).toBe("round");
  });
});

describe("URL Query String Synchronization", () => {
  it("serializes non-default parameters into concise query strings", () => {
    const state = {
      ...DEFAULT_FILTER_STATE,
      region: "ET01",
      metric: "returnees" as const,
      driver: "conflict" as const,
    };

    const qs = filtersToQueryString(state);
    expect(qs).toContain("region=ET01");
    expect(qs).toContain("metric=returnees");
    expect(qs).toContain("driver=conflict");
  });

  it("returns empty string when all parameters are default", () => {
    const qs = filtersToQueryString(DEFAULT_FILTER_STATE);
    expect(qs).toBe("");
  });

  it("parses URLSearchParams back into validated filter states", () => {
    const params = new URLSearchParams("region=ET05&driver=drought&round=R34");
    const result = parseQueryStringToFilters(params);

    expect(result.state.region).toBe("ET05");
    expect(result.state.driver).toBe("drought");
    expect(result.state.round).toBe("R34");
  });
});

describe("InteractiveFilterBar & TimelineScrubber Controls", () => {
  it("renders InteractiveFilterBar and triggers filter updates", () => {
    render(
      <ObservatoryFilterProvider initialFilters={{ region: "all", driver: "all" }}>
        <InteractiveFilterBar />
      </ObservatoryFilterProvider>
    );

    expect(screen.getByText("Cross-Filter:")).toBeInTheDocument();
    expect(screen.getByText("IDP Caseload")).toBeInTheDocument();
    expect(screen.getByText("Returnees")).toBeInTheDocument();

    // Select Conflict driver pill
    const conflictPill = screen.getByRole("button", { name: /Conflict/i });
    fireEvent.click(conflictPill);

    // Active filter badge appears
    expect(screen.getByText(/1 Active/i)).toBeInTheDocument();

    // Reset button appears and restores default
    const resetBtn = screen.getByRole("button", { name: /Reset Filters/i });
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);

    expect(screen.queryByText(/Active/i)).not.toBeInTheDocument();
  });

  it("renders TimelineScrubber and scrubs across assessment rounds", () => {
    render(
      <ObservatoryFilterProvider initialFilters={{ round: "R37" }}>
        <TimelineScrubber />
      </ObservatoryFilterProvider>
    );

    expect(screen.getByText("Assessment Round Scrubber")).toBeInTheDocument();
    expect(screen.getByText("Current Baseline Assessment")).toBeInTheDocument();

    // Click Round 28
    const r28Btn = screen.getByRole("button", { name: /R28/i });
    fireEvent.click(r28Btn);

    expect(screen.getByText("Northern Conflict Caseload Peak")).toBeInTheDocument();
  });
});

describe("Linked Cross-Filtering Integration on InsideEthiopiaPage", () => {
  it("renders InsideEthiopiaPage with interactive filters and cross-filtered cards", () => {
    render(<InsideEthiopiaPage />);

    expect(screen.getByText("Inside Ethiopia: Internal Displacement")).toBeInTheDocument();
    expect(screen.getByText("Cross-Filter:")).toBeInTheDocument();
    expect(screen.getByText("Assessment Round Scrubber")).toBeInTheDocument();
    expect(screen.getByText(/Subnational Regional Caseloads/i)).toBeInTheDocument();

    // Filter to Drought driver (from InteractiveFilterBar pill)
    const droughtButtons = screen.getAllByRole("button", { name: /Drought/i });
    expect(droughtButtons.length).toBeGreaterThan(0);
    fireEvent.click(droughtButtons[0]);

    // Somali and Sidama are drought-driven regions
    expect(screen.getByRole("heading", { name: "Somali" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sidama" })).toBeInTheDocument();

    // Tigray (conflict-driven) should be filtered out from displayed regional cards
    expect(screen.queryByRole("heading", { name: "Tigray" })).not.toBeInTheDocument();

    // Reset filters
    const resetBtn = screen.getByRole("button", { name: /Reset Filters/i });
    fireEvent.click(resetBtn);

    // Tigray returns to the cards
    expect(screen.getByRole("heading", { name: "Tigray" })).toBeInTheDocument();
  });
});
