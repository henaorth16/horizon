import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Home from "@/app/page";
import { ExecutiveTrendLine, OFFICIAL_HISTORICAL_TRENDS } from "@/components/charts/ExecutiveTrendLine";
import { RegionalSummarySection } from "@/components/dashboard/RegionalSummarySection";
import { getRegionalIdpCaseloads, reloadDatabase } from "@/lib/db";

describe("Overview Dashboard: ExecutiveTrendLine Component", () => {
  it("renders trend line SVG container, non-additive warning, and legend items", () => {
    render(<ExecutiveTrendLine data={OFFICIAL_HISTORICAL_TRENDS} />);

    // Check header and non-additive warning
    expect(screen.getByText(/Executive Displacement Trajectory/i)).toBeInTheDocument();
    expect(screen.getByText(/Non-Additive Principle/i)).toBeInTheDocument();

    // Check legend items
    expect(screen.getByText(/Internally Displaced Persons \(IOM DTM\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Recognized Refugees Hosted \(UNHCR\)/i)).toBeInTheDocument();

    // Check screen reader table fallback
    const srTable = screen.getByLabelText(/Annual displacement historical trends 2018-2024/i);
    expect(srTable).toBeInTheDocument();
    expect(screen.getAllByText("2018").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("2024").length).toBeGreaterThanOrEqual(1);
  });

  it("interactively toggles series filter buttons", () => {
    render(<ExecutiveTrendLine data={OFFICIAL_HISTORICAL_TRENDS} />);

    const idpBtn = screen.getByRole("button", { name: /IDPs Only/i });
    const refBtn = screen.getByRole("button", { name: /Refugees Only/i });
    const dualBtn = screen.getByRole("button", { name: /Dual Comparison/i });

    // Initial state
    expect(dualBtn.className).toContain("bg-ink-800");

    // Click IDPs Only
    fireEvent.click(idpBtn);
    expect(idpBtn.className).toContain("text-amber-400");

    // Click Refugees Only
    fireEvent.click(refBtn);
    expect(refBtn.className).toContain("text-cyan-400");
  });
});

describe("Overview Dashboard: RegionalSummarySection Component", () => {
  beforeEach(() => {
    reloadDatabase();
  });

  it("renders 12 regional states and driver filter buttons", () => {
    const caseloads = getRegionalIdpCaseloads();
    render(<RegionalSummarySection caseloads={caseloads} />);

    expect(screen.getByText(/Regional Caseloads & Crisis Epicenters/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^All/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Conflict/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Drought/i })).toBeInTheDocument();

    // Verify key regions appear
    expect(screen.getByText("Tigray")).toBeInTheDocument();
    expect(screen.getByText("Oromia")).toBeInTheDocument();
    expect(screen.getByText("Somali")).toBeInTheDocument();
    expect(screen.getByText("Amhara")).toBeInTheDocument();
  });

  it("filters regions when clicking driver pills", () => {
    const caseloads = getRegionalIdpCaseloads();
    render(<RegionalSummarySection caseloads={caseloads} />);

    // Filter by Drought
    const droughtBtn = screen.getByRole("button", { name: /^Drought/i });
    fireEvent.click(droughtBtn);

    // Somali should be present, Tigray (conflict) should not be displayed
    expect(screen.getByText("Somali")).toBeInTheDocument();
    expect(screen.queryByText("Tigray")).toBeNull();
  });

  it("filters regions via live text search", () => {
    const caseloads = getRegionalIdpCaseloads();
    render(<RegionalSummarySection caseloads={caseloads} />);

    const searchInput = screen.getByPlaceholderText(/Filter regions by name or P-code/i);
    fireEvent.change(searchInput, { target: { value: "Afar" } });

    expect(screen.getByText("Afar")).toBeInTheDocument();
    expect(screen.queryByText("Tigray")).toBeNull();
  });
});

describe("Overview Dashboard: Full Page Integration", () => {
  beforeEach(() => {
    reloadDatabase();
  });

  it("renders all core overview dashboard sections cleanly", () => {
    render(<Home />);

    // 1. Headline & Methodology Banner
    expect(screen.getByText(/Ethiopia Displacement & Human Mobility Observatory/i)).toBeInTheDocument();
    expect(screen.getByText(/Methodology & Population Distinction:/i)).toBeInTheDocument();

    // 2. Source-Backed KPI Headline Cards
    expect(screen.getAllByText("3,392,200").length).toBeGreaterThanOrEqual(1); // IDPs
    expect(screen.getAllByText("979,846").length).toBeGreaterThanOrEqual(1);   // Refugees
    expect(screen.getAllByText("1,811,400").length).toBeGreaterThanOrEqual(1); // Returnees
    expect(screen.getAllByText("63,747").length).toBeGreaterThanOrEqual(1);    // Asylum Seekers

    // 3. Executive Trend Line
    expect(screen.getByText(/Executive Displacement Trajectory/i)).toBeInTheDocument();

    // 4. Regional Summary Section
    expect(screen.getByText(/Regional Caseloads & Crisis Epicenters/i)).toBeInTheDocument();

    // 5. Topical Modules Quick Links Grid
    expect(screen.getByText(/Inside Ethiopia: Regional Mobility/i)).toBeInTheDocument();
    expect(screen.getByText(/3D Migration Globe/i)).toBeInTheDocument();
    expect(screen.getByText(/Across Borders: Refugees/i)).toBeInTheDocument();
    expect(screen.getByText(/People & Demographics/i)).toBeInTheDocument();
    expect(screen.getByText(/Drivers & Crises/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Humanitarian Needs/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Data Explorer & Exports/i)).toBeInTheDocument();
    expect(screen.getByText(/Sources & Methodology/i)).toBeInTheDocument();

    // 6. Source Provenance & Citations
    expect(screen.getAllByText(/IOM Displacement Tracking Matrix/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/UNHCR Refugee Data Finder/i).length).toBeGreaterThanOrEqual(1);
  });
});
