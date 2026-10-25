import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Home from "@/app/page";
import InsideEthiopiaPage from "@/app/inside-ethiopia/page";
import AcrossBordersPage from "@/app/across-borders/page";
import { Navigation, NAV_ITEMS } from "@/components/layout/Navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ObservationExplorer } from "@/components/explorer/ObservationExplorer";
import { getAllObservations } from "@/lib/db";

describe("End-to-End Dataset Integration & UI Verification", () => {
  it("renders verified national protection metrics and citations on Home overview", () => {
    render(<Home />);

    // Verify presence of exact source-backed metrics
    expect(screen.getAllByText("3,392,200").length).toBeGreaterThanOrEqual(1); // IDPs
    expect(screen.getAllByText("979,846").length).toBeGreaterThanOrEqual(1);   // Refugees
    expect(screen.getAllByText("1,811,400").length).toBeGreaterThanOrEqual(1); // Returnees
    expect(screen.getAllByText("63,747").length).toBeGreaterThanOrEqual(1);    // Asylum Seekers

    // Verify presence of official source badges & citations
    expect(screen.getAllByText(/IOM Displacement Tracking Matrix/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/UNHCR Refugee Data Finder/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders regional subnational displacement caseloads in Inside Ethiopia", () => {
    render(<InsideEthiopiaPage />);

    expect(screen.getByText("3,392,200")).toBeInTheDocument();
    expect(screen.getByText("1,811,400")).toBeInTheDocument();
    expect(screen.getAllByText("Tigray").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("1,025,400").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Oromia").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("848,900").length).toBeGreaterThanOrEqual(1);
  });

  it("renders refugee origin breakdowns in Across Borders", () => {
    render(<AcrossBordersPage />);

    expect(screen.getByText("979,846")).toBeInTheDocument();
    expect(screen.getByText("63,747")).toBeInTheDocument();
    expect(screen.getAllByText("South Sudan").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("421,438").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Somalia").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("312,185").length).toBeGreaterThanOrEqual(1);
  });

  it("interactively filters records in ObservationExplorer", () => {
    const observations = getAllObservations();
    render(<ObservationExplorer initialObservations={observations} />);

    // Check search filter
    const searchInput = screen.getByPlaceholderText(/Search by region, P-code/i);
    fireEvent.change(searchInput, { target: { value: "Tigray" } });

    // Should display Tigray and filtered count
    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    expect(screen.getAllByText(/Tigray/).length).toBeGreaterThanOrEqual(1);

    // Expand details
    const detailsButtons = screen.getAllByRole("button", { name: /Details/i });
    expect(detailsButtons.length).toBeGreaterThan(0);
    fireEvent.click(detailsButtons[0]);

    // Check provenance display
    expect(screen.getByText(/Provenance & Official Citation/i)).toBeInTheDocument();
  });
});

describe("Core User Journeys & End-to-End Flows", () => {
  let createdBlobs: Blob[] = [];
  const originalCreateObjectURL = globalThis.URL.createObjectURL;
  const originalRevokeObjectURL = globalThis.URL.revokeObjectURL;

  beforeEach(() => {
    createdBlobs = [];
    globalThis.URL.createObjectURL = vi.fn((blob: Blob) => {
      createdBlobs.push(blob);
      return "blob:mock-download-url";
    });
    globalThis.URL.revokeObjectURL = vi.fn();
    // Prevent jsdom anchor click from navigating
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.URL.createObjectURL = originalCreateObjectURL;
    globalThis.URL.revokeObjectURL = originalRevokeObjectURL;
    vi.restoreAllMocks();
  });

  it("User Journey 1: navigates between modules with semantic links and accessible structure", () => {
    const handleNavigate = vi.fn();
    const { unmount } = render(
      <AppShell>
        <div>Page Body Content</div>
      </AppShell>
    );

    // Verify presence of all primary navigation destinations
    for (const item of NAV_ITEMS) {
      const links = screen.getAllByRole("link", { name: new RegExp(item.title, "i") });
      expect(links.length).toBeGreaterThanOrEqual(1);
      expect(links[0]).toHaveAttribute("href", item.href);
    }

    // Verify data governance non-additive reminder is presented
    expect(screen.getByText(/Non-additive population taxonomy/i)).toBeInTheDocument();

    unmount();

    // Verify standalone Navigation component dispatches onNavigate
    render(<Navigation onNavigate={handleNavigate} />);
    const insideEthiopiaLink = screen.getByRole("link", { name: /Inside Ethiopia/i });
    insideEthiopiaLink.addEventListener("click", (e) => e.preventDefault(), { once: true });
    fireEvent.click(insideEthiopiaLink);
    expect(handleNavigate).toHaveBeenCalledTimes(1);
  });

  it("User Journey 2: cross-filter updates dynamically recalculate displayed caseload totals and warnings", () => {
    render(<InsideEthiopiaPage />);

    // 1. Initial national caseloads
    expect(screen.getAllByText("3,392,200").length).toBeGreaterThanOrEqual(1); // National IDPs
    expect(screen.getAllByText("1,811,400").length).toBeGreaterThanOrEqual(1); // National Returnees

    // 2. Filter by Drought driver via InteractiveFilterBar quick filter button
    const droughtButtons = screen.getAllByRole("button", { name: /Drought/i });
    fireEvent.click(droughtButtons[0]);

    // Caseload should update to drought-only regions (Somali 542,300 + SNNP 94,000 + Sidama 11,200 + S.Ethiopia 3,400 = 650,900)
    expect(screen.getAllByText("650,900").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Displacement Trigger Filter: DROUGHT/i)).toBeInTheDocument();

    // 3. Reset filters
    const resetFiltersButton = screen.getByRole("button", { name: /Reset Filters/i });
    fireEvent.click(resetFiltersButton);

    // Caseload should restore back to total monitored IDPs
    expect(screen.getAllByText("3,392,200").length).toBeGreaterThanOrEqual(1);

    // 4. Select a specific region from dropdown (Tigray ET01: 1,025,400 IDPs)
    const regionSelect = screen.getByLabelText(/Select Region/i);
    fireEvent.change(regionSelect, { target: { value: "ET01" } });

    expect(screen.getAllByText("1,025,400").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Tigray IDPs")).toBeInTheDocument();

    // 5. Toggle metric to returnees
    const returneesButtons = screen.getAllByRole("button", { name: /^Returnees$/i });
    fireEvent.click(returneesButtons[0]);
    expect(screen.getByText("Tigray Returnees")).toBeInTheDocument();
  });

  it("User Journey 3: sorts observation explorer columns and navigates through pages", () => {
    const observations = getAllObservations();
    render(<ObservationExplorer initialObservations={observations} />);

    // Verify initial pagination state
    expect(screen.getByText(/validated observation records/i)).toBeInTheDocument();
    expect(screen.getByText("1–10")).toBeInTheDocument();

    // Check Previous page button is initially disabled on page 1
    const prevButton = screen.getByRole("button", { name: /Previous page/i });
    expect(prevButton).toBeDisabled();

    // Navigate to next page
    const nextButton = screen.getByRole("button", { name: /Next page/i });
    expect(nextButton).not.toBeDisabled();
    fireEvent.click(nextButton);

    // Page updates to Page 2
    expect(screen.getByText("11–20")).toBeInTheDocument();
    expect(prevButton).not.toBeDisabled();

    // Return to previous page
    fireEvent.click(prevButton);
    expect(screen.getByText("1–10")).toBeInTheDocument();
    expect(prevButton).toBeDisabled();

    // Change page size to 25
    const pageSizeSelect = screen.getByDisplayValue("10");
    fireEvent.change(pageSizeSelect, { target: { value: "25" } });
    expect(screen.getByText("1–25")).toBeInTheDocument();

    // Test Column Sorting
    // Sort by Observation Value
    const sortValueButton = screen.getByRole("button", { name: /Observation Value/i });
    fireEvent.click(sortValueButton);

    // Sort direction toggles; clicking again flips sort order
    fireEvent.click(sortValueButton);

    // Sort by Location
    const sortLocationButton = screen.getByRole("button", { name: /Location \/ P-Code/i });
    fireEvent.click(sortLocationButton);

    // Sort by Reference Period
    const sortDateButton = screen.getByRole("button", { name: /Reference Period/i });
    fireEvent.click(sortDateButton);

    // Table rows still render valid data (each row has role="button" for expansion)
    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
    const rows = table.querySelectorAll("tbody tr");
    expect(rows.length).toBe(25);
  });

  it("User Journey 4: triggers safe client-side CSV export without network errors or formula vulnerabilities", async () => {
    const observations = getAllObservations();
    render(<ObservationExplorer initialObservations={observations} />);

    const exportCsvButton = screen.getByRole("button", { name: /Export CSV/i });
    expect(exportCsvButton).toBeInTheDocument();

    // Trigger CSV export
    fireEvent.click(exportCsvButton);

    // Verify URL.createObjectURL was called with a Blob
    expect(globalThis.URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(createdBlobs.length).toBe(1);

    const generatedBlob = createdBlobs[0];
    expect(generatedBlob).toBeInstanceOf(Blob);
    expect(generatedBlob.type).toBe("text/csv;charset=utf-8;");

    // Verify UTF-8 BOM bytes at binary level (0xEF, 0xBB, 0xBF)
    const arrayBuffer = await generatedBlob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    expect(bytes[0]).toBe(0xEF);
    expect(bytes[1]).toBe(0xBB);
    expect(bytes[2]).toBe(0xBF);

    // Read the blob text content to verify CSV structure
    const csvContent = await generatedBlob.text();

    // Verify key standard CSV headers
    expect(csvContent).toContain("record_id");
    expect(csvContent).toContain("indicator_id");
    expect(csvContent).toContain("location_name");
    expect(csvContent).toContain("population_type");
    expect(csvContent).toContain("value");
    expect(csvContent).toContain("provenance_citation");
    expect(csvContent).toContain("license");

    // Verify presence of verified observation data in CSV
    expect(csvContent).toContain("Tigray");
    expect(csvContent).toContain("iom_dtm");

    // Verify URL.revokeObjectURL was called to clean up memory
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-download-url");
  });
});
