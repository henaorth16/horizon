import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Global mock for next/navigation across Vitest jsdom test environments
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/inside-ethiopia",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Global mock for navigator.clipboard
if (typeof navigator !== "undefined") {
  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText: vi.fn().mockImplementation(() => Promise.resolve()),
    },
    configurable: true,
    writable: true,
  });
}
