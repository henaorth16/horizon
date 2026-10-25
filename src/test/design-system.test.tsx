import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { EmptyState } from "@/components/charts/EmptyState";
import { formatNumber, formatPercent, formatEditorialDate } from "@/lib/utils";
import { ObservationSchema, LocationSchema } from "@/lib/contracts/observations";

describe("Design System & UI Primitives", () => {
  it("renders Badge component with variants", () => {
    const { rerender } = render(<Badge variant="ochre">IDP Stock</Badge>);
    expect(screen.getByText("IDP Stock")).toBeInTheDocument();

    rerender(<Badge variant="cyan">Refugees</Badge>);
    expect(screen.getByText("Refugees")).toBeInTheDocument();
  });

  it("renders Card and nested components", () => {
    render(
      <Card glow>
        <CardTitle>Somali Region</CardTitle>
        <CardContent>540,000 Displaced</CardContent>
      </Card>
    );
    expect(screen.getByText("Somali Region")).toBeInTheDocument();
    expect(screen.getByText("540,000 Displaced")).toBeInTheDocument();
  });

  it("renders Button and triggers click handler", () => {
    const handleClick = vi.fn();
    render(
      <Button variant="primary" onClick={handleClick}>
        Export CSV
      </Button>
    );
    const btn = screen.getByRole("button", { name: /Export CSV/i });
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders StatusIndicator with pulse state", () => {
    render(<StatusIndicator status="fresh" label="Operational" />);
    expect(screen.getByText("Operational")).toBeInTheDocument();
  });

  it("renders EmptyState with action button", () => {
    const handleReset = vi.fn();
    render(
      <EmptyState
        title="No Records"
        description="No observations match this date filter."
        actionText="Reset Filter"
        onAction={handleReset}
      />
    );
    expect(screen.getByText("No Records")).toBeInTheDocument();
    const actionBtn = screen.getByText("Reset Filter");
    fireEvent.click(actionBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});

describe("Formatters & Utility Functions", () => {
  it("formats numbers with standard commas and compact notation", () => {
    expect(formatNumber(1250000)).toBe("1,250,000");
    expect(formatNumber(3400000, { compact: true })).toBe("3.4M");
    expect(formatNumber(null)).toBe("—");
    expect(formatNumber(undefined)).toBe("—");
  });

  it("formats percentages accurately", () => {
    expect(formatPercent(42.567, 1)).toBe("42.6%");
    expect(formatPercent(null)).toBe("—");
  });

  it("formats ISO dates into editorial representations", () => {
    expect(formatEditorialDate("2024-08-15")).toMatch(/Aug 2024/);
    expect(formatEditorialDate(null)).toBe("Unknown");
  });
});

describe("Data Contracts Validation", () => {
  it("validates valid Location schema", () => {
    const valid = LocationSchema.parse({
      id: "ET-TI",
      code: "ET01",
      name: "Tigray",
      adminLevel: 1,
    });
    expect(valid.name).toBe("Tigray");
  });

  it("rejects invalid location adminLevel", () => {
    expect(() =>
      LocationSchema.parse({
        id: "ET-UNKNOWN",
        code: "ET99",
        name: "Unknown",
        adminLevel: 9, // Invalid adminLevel
      })
    ).toThrow();
  });

  it("validates valid Observation schema", () => {
    const valid = ObservationSchema.parse({
      id: "obs_001",
      indicatorId: "idp_stock",
      locationId: "ET-AM",
      value: 620000,
      reportingDate: "2024-06",
      retrievalDate: "2024-07-01T00:00:00Z",
      sourceId: "iom_dtm",
      populationType: "idp",
      breakdown: {
        driver: "conflict",
      },
    });
    expect(valid.value).toBe(620000);
  });

  it("rejects negative observation values", () => {
    expect(() =>
      ObservationSchema.parse({
        id: "obs_002",
        indicatorId: "idp_stock",
        locationId: "ET-OR",
        value: -500, // Negative
        reportingDate: "2024-06",
        retrievalDate: "2024-07-01",
        sourceId: "iom_dtm",
        populationType: "idp",
      })
    ).toThrow();
  });
});
