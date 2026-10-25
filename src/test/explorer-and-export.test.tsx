import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React from "react";
import {
  ObservationExplorer,
  DataDictionaryDrawer,
  CitationGuidanceCard,
} from "@/components/explorer";
import {
  sanitizeCsvField,
  exportObservationsToCsv,
  exportObservationsToJson,
} from "@/lib/export/safeExport";
import { getAllObservations } from "@/lib/db";
import DataExplorerPage from "@/app/explorer/page";
import MethodologyPage from "@/app/methodology/page";

describe("Safe Client-Side Export Utilities", () => {
  it("sanitizes CSV formula injection attempts (OWASP)", () => {
    // Starts with =
    expect(sanitizeCsvField("=SUM(A1:A10)")).toBe(`"'=SUM(A1:A10)"`);
    // Starts with +
    expect(sanitizeCsvField("+123456")).toBe(`"'+123456"`);
    // Starts with -
    expect(sanitizeCsvField("-cmd|' /C calc'!A0")).toBe(`"'-cmd|' /C calc'!A0"`);
    // Starts with @
    expect(sanitizeCsvField("@SUM(1,2)")).toBe(`"'@SUM(1,2)"`);
    // Normal string without formula triggers
    expect(sanitizeCsvField("Tigray")).toBe(`"Tigray"`);
    // String with embedded double quotes
    expect(sanitizeCsvField('Tigray "Region"')).toBe(`"Tigray ""Region"""`);
    // Null or undefined
    expect(sanitizeCsvField(null)).toBe('""');
    expect(sanitizeCsvField(undefined)).toBe('""');
  });

  it("exports observations to CSV and JSON without throwing errors", () => {
    const observations = getAllObservations();
    const createObjectURLMock = vi.fn().mockReturnValue("blob:mock-url");
    const revokeObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    expect(() => exportObservationsToCsv(observations)).not.toThrow();
    expect(() => exportObservationsToJson(observations)).not.toThrow();
    expect(createObjectURLMock).toHaveBeenCalledTimes(2);
  });
});

describe("Data Dictionary & Citation Guidance Components", () => {
  it("renders DataDictionaryDrawer with searchable field documentation", () => {
    render(<DataDictionaryDrawer />);

    expect(screen.getByText("Standard Data Dictionary")).toBeInTheDocument();
    expect(screen.getAllByText("id").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("indicatorId").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("locationId").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("value").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("reportingDate").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("retrievalDate").length).toBeGreaterThanOrEqual(1);

    // Search filter inside data dictionary
    const searchInput = screen.getByPlaceholderText(/Search fields or types/i);
    fireEvent.change(searchInput, { target: { value: "retrievalDate" } });

    expect(screen.getByText("retrievalDate")).toBeInTheDocument();
    expect(screen.queryByText("populationType")).not.toBeInTheDocument();
  });

  it("renders CitationGuidanceCard with copyable APA, Chicago, and BibTeX citations for active datasets", () => {
    // Mock navigator.clipboard
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<CitationGuidanceCard />);

    expect(screen.getByText("Citation & Attribution Guidance")).toBeInTheDocument();
    expect(screen.getByText("APA Style (7th Edition)")).toBeInTheDocument();
    expect(screen.getByText("Chicago Manual of Style (17th Edition)")).toBeInTheDocument();
    expect(screen.getByText("BibTeX Format")).toBeInTheDocument();

    // Default is IOM DTM Round 37
    expect(screen.getAllByText(/International Organization for Migration/i).length).toBeGreaterThanOrEqual(1);

    // Click copy APA for IOM DTM
    const copyApaBtn = screen.getByRole("button", { name: "Copy APA Citation" });
    fireEvent.click(copyApaBtn);
    expect(writeTextMock).toHaveBeenCalledTimes(1);
    expect(writeTextMock.mock.calls[0][0]).toContain("Displacement Tracking Matrix");

    // Click copy Chicago
    const copyChicagoBtn = screen.getByRole("button", { name: "Copy Chicago Citation" });
    fireEvent.click(copyChicagoBtn);
    expect(writeTextMock).toHaveBeenCalledTimes(2);

    // Click copy BibTeX
    const copyBibBtn = screen.getByRole("button", { name: "Copy BibTeX Citation" });
    fireEvent.click(copyBibBtn);
    expect(writeTextMock).toHaveBeenCalledTimes(3);

    // Switch dataset to UNHCR 2024
    const unhcrTab = screen.getByRole("tab", { name: /UNHCR Refugee Statistics 2024/i });
    fireEvent.click(unhcrTab);
    expect(screen.getAllByText(/Refugee Data Finder/i).length).toBeGreaterThanOrEqual(1);

    // Copy APA for UNHCR
    fireEvent.click(copyApaBtn);
    expect(writeTextMock).toHaveBeenCalledTimes(4);
    expect(writeTextMock.mock.calls[3][0]).toContain("UNHCR");

    // Switch dataset to UN DESA
    const unDesaTab = screen.getByRole("tab", { name: /UN DESA Migrant Stock/i });
    fireEvent.click(unDesaTab);
    expect(screen.getAllByText(/International Migrant Stock/i).length).toBeGreaterThanOrEqual(1);

    // Copy BibTeX for UN DESA
    fireEvent.click(copyBibBtn);
    expect(writeTextMock).toHaveBeenCalledTimes(5);
    expect(writeTextMock.mock.calls[4][0]).toContain("un_desa_migrant_stock");
  });

  it("renders CitationGuidanceCard embedded within MethodologyPage", () => {
    render(<MethodologyPage />);

    expect(screen.getByText("Academic Citations & BibTeX Generator")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /IOM DTM Round 37/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /UNHCR Refugee Statistics 2024/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /UN DESA Migrant Stock/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy APA Citation" })).toBeInTheDocument();
  });
});

describe("ObservationExplorer Interactive Table & Controls", () => {
  it("supports multifaceted filtering, column sorting, pagination, and tabs", () => {
    const observations = getAllObservations();
    render(<ObservationExplorer initialObservations={observations} />);

    // Check tab navigation
    expect(screen.getByRole("button", { name: /Observation Records/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Data Dictionary/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Citation Guidance/i })).toBeInTheDocument();

    // Search input
    const searchInput = screen.getByPlaceholderText(/Search by region, P-code/i);
    fireEvent.change(searchInput, { target: { value: "Tigray" } });
    expect(screen.getAllByText(/Tigray/).length).toBeGreaterThanOrEqual(1);

    // Reset filters
    const resetBtn = screen.getByRole("button", { name: /Reset Filters/i });
    fireEvent.click(resetBtn);
    expect(searchInput).toHaveValue("");

    // Sort by Location
    const sortLocationBtn = screen.getByRole("button", { name: /Location \/ P-Code/i });
    fireEvent.click(sortLocationBtn);

    // Details drawer expansion
    const detailsButtons = screen.getAllByRole("button", { name: /Details/i });
    expect(detailsButtons.length).toBeGreaterThan(0);
    fireEvent.click(detailsButtons[0]);
    expect(screen.getByText(/Provenance & Official Citation/i)).toBeInTheDocument();

    // Switch to Data Dictionary tab
    const dictTab = screen.getByRole("button", { name: /Data Dictionary/i });
    fireEvent.click(dictTab);
    expect(screen.getByText("Standard Data Dictionary")).toBeInTheDocument();

    // Switch to Citation tab
    const citationTab = screen.getByRole("button", { name: /Citation Guidance/i });
    fireEvent.click(citationTab);
    expect(screen.getByText("Citation & Attribution Guidance")).toBeInTheDocument();
  });

  it("renders DataExplorerPage cleanly with database integrity verification", () => {
    render(<DataExplorerPage />);

    expect(screen.getByText("Observation Data Explorer & Exports")).toBeInTheDocument();
    expect(screen.getByText(/Database Integrity:/i)).toBeInTheDocument();
    expect(screen.getByText(/Citation & Export Safeguards:/i)).toBeInTheDocument();
  });
});
