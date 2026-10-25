import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React from "react";
import { PopulationPyramid } from "@/components/demographics/PopulationPyramid";
import { CompositionBarChart } from "@/components/demographics/CompositionBarChart";
import { RegionalComparisonChart } from "@/components/demographics/RegionalComparisonChart";
import { DemographicExplorerView } from "@/components/demographics/DemographicExplorerView";
import DemographicsPage from "@/app/demographics/page";
import {
  getDemographicProfile,
  getVulnerabilityMetrics,
  getRegionalDemographicComparisons,
  PCODE_TO_REGION_NAME,
} from "@/lib/db";

describe("Demographics & Population Explorer: Visualizations", () => {
  const sampleIdpProfile = getDemographicProfile({ populationType: "idp", locationId: "ET" });
  const sampleRefugeeProfile = getDemographicProfile({ populationType: "refugee", locationId: "ET" });
  const sampleUnassessedProfile = getDemographicProfile({ populationType: "idp", locationId: "ET13" });
  const vulnerabilityMetrics = getVulnerabilityMetrics();
  const regionalComparisons = getRegionalDemographicComparisons();

  it("renders PopulationPyramid with preserved source age cohorts and sex balance", () => {
    render(<PopulationPyramid profile={sampleIdpProfile} />);

    expect(screen.getByText(/Population Pyramid: Ethiopia \(National\)/i)).toBeInTheDocument();
    expect(screen.getByText("IOM DTM Mandate")).toBeInTheDocument();
    expect(screen.getByText("2024-08-31")).toBeInTheDocument();

    // Sex balance totals
    expect(screen.getByText("Male")).toBeInTheDocument();
    expect(screen.getByText("Female")).toBeInTheDocument();

    // Preserved source age cohorts (found in SVG text and screen reader table)
    expect(screen.getAllByText("0-4").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("5-11").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("12-17").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("18-59").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("60+").length).toBeGreaterThanOrEqual(1);

    // Screen reader accessible table
    expect(screen.getByRole("table", { name: /Age and sex population table/i })).toBeInTheDocument();
  });

  it("explicitly denotes missing/unassessed breakdowns without invented numbers", () => {
    render(<PopulationPyramid profile={sampleUnassessedProfile} />);

    expect(screen.getByText(/Demographic Breakdown Unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/Breakdown Suppressed \/ Unassessed/i)).toBeInTheDocument();
    expect(screen.getByText(/Source Standard: Incomplete site surveys are never synthetically imputed/i)).toBeInTheDocument();
  });

  it("renders CompositionBarChart with life-stage proportions and protection benchmarks", () => {
    render(<CompositionBarChart metrics={vulnerabilityMetrics} profile={sampleIdpProfile} />);

    expect(screen.getByText("Population Composition & Critical Vulnerabilities")).toBeInTheDocument();
    expect(screen.getByText("Broad Life-Stage Composition")).toBeInTheDocument();
    expect(screen.getByText(/Children \(<18\):/i)).toBeInTheDocument();
    expect(screen.getByText(/Adults \(18–59\):/i)).toBeInTheDocument();
    expect(screen.getByText(/Elderly \(60\+\):/i)).toBeInTheDocument();

    // Non-additive vulnerability benchmarks
    expect(screen.getByText("Women & Children Proportion")).toBeInTheDocument();
    expect(screen.getByText("Female-Headed Households")).toBeInTheDocument();
    expect(screen.getByText("Children Under 5 Years")).toBeInTheDocument();
    expect(screen.getByText("Persons with Disabilities")).toBeInTheDocument();
  });

  it("renders RegionalComparisonChart and toggles ratio metrics", () => {
    const handleSelect = vi.fn();
    render(
      <RegionalComparisonChart
        comparisons={regionalComparisons}
        selectedRegion="ET01"
        onSelectRegion={handleSelect}
      />
    );

    expect(screen.getByText("Regional Caseloads & Demographic Assessment Status")).toBeInTheDocument();

    // Check regional entries
    expect(screen.getByText("Tigray")).toBeInTheDocument();
    expect(screen.getByText("Oromia")).toBeInTheDocument();
    expect(screen.getByText("Amhara")).toBeInTheDocument();

    // Assessed vs unassessed badges
    const assessedBadges = screen.getAllByText("Assessed");
    expect(assessedBadges.length).toBeGreaterThanOrEqual(1);

    // Toggle to Female Ratio
    const femaleBtn = screen.getByRole("button", { name: "Female Ratio" });
    fireEvent.click(femaleBtn);
    expect(screen.getByText("50.7%")).toBeInTheDocument();

    // Toggle to Child Ratio
    const childBtn = screen.getByRole("button", { name: "Child Ratio" });
    fireEvent.click(childBtn);
    expect(screen.getByText("55.6%")).toBeInTheDocument();

    // Click region to select
    const oromiaRow = screen.getByText("Oromia").closest("[role='button']");
    expect(oromiaRow).toBeInTheDocument();
    if (oromiaRow) {
      fireEvent.click(oromiaRow);
      expect(handleSelect).toHaveBeenCalledWith("ET04");
    }
  });

  it("prevents cross-source merging and switches between IDP and Refugee profiles", () => {
    const allProfiles: Record<string, any> = {
      idp_ET: sampleIdpProfile,
      refugee_ET: sampleRefugeeProfile,
      idp_ET01: getDemographicProfile({ populationType: "idp", locationId: "ET01" }),
      idp_ET13: sampleUnassessedProfile,
    };

    render(
      <DemographicExplorerView
        initialIdpProfile={sampleIdpProfile}
        initialRefugeeProfile={sampleRefugeeProfile}
        vulnerabilityMetrics={vulnerabilityMetrics}
        regionalComparisons={regionalComparisons}
        allProfiles={allProfiles}
      />
    );

    // Initial IDP state
    expect(screen.getByText("IOM DTM Mandate")).toBeInTheDocument();
    expect(screen.getByText(/Displaying internal displacement statistics collected under IOM DTM mandate/i)).toBeInTheDocument();

    // Switch to Refugees (UNHCR)
    const refugeeBtn = screen.getByRole("button", { name: "Refugees (UNHCR)" });
    fireEvent.click(refugeeBtn);

    // Mandate badge switches to UNHCR and citation updates
    expect(screen.getByText("UNHCR Mandate")).toBeInTheDocument();
    expect(screen.getByText(/1951 Geneva Refugee Convention/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Year-End 2023/i).length).toBeGreaterThanOrEqual(1);

    // Switch back to IDPs
    const idpBtn = screen.getByRole("button", { name: "IDPs (IOM)" });
    fireEvent.click(idpBtn);
    expect(screen.getByText("IOM DTM Mandate")).toBeInTheDocument();

    // Select Tigray from region dropdown
    const regionSelect = screen.getByLabelText(/Administrative Jurisdiction/i);
    fireEvent.change(regionSelect, { target: { value: "ET01" } });

    expect(screen.getByText(/Population Pyramid: Tigray/i)).toBeInTheDocument();
  });

  it("renders full DemographicsPage without errors", () => {
    render(<DemographicsPage />);

    expect(screen.getByText(/People & Demographics/i)).toBeInTheDocument();
    expect(screen.getByText(/Demographic Data Standards:/i)).toBeInTheDocument();
    expect(screen.getByText(/Preserving Source Brackets \(Non-Merged\)/i)).toBeInTheDocument();
  });
});
