"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  ObservatoryFilterState,
  DEFAULT_FILTER_STATE,
  SanitizedFilterResult,
  ValidationIssue,
  MetricFilter,
  DriverFilter,
  PopulationFilter,
  RoundFilter,
  sanitizeFilterState,
  filtersToQueryString,
  parseQueryStringToFilters,
} from "./types";

interface ObservatoryFilterContextValue {
  filters: ObservatoryFilterState;
  setRegion: (region: string) => void;
  setMetric: (metric: MetricFilter) => void;
  setDriver: (driver: DriverFilter) => void;
  setPopulation: (population: PopulationFilter) => void;
  setRound: (round: RoundFilter) => void;
  setAdminLevel: (level: 1 | 2) => void;
  setFilters: (partial: Partial<ObservatoryFilterState>) => void;
  resetFilters: () => void;
  activeFilterCount: number;
  isDefaultState: boolean;
  validationIssues: ValidationIssue[];
  dismissIssues: () => void;
}

const ObservatoryFilterContext = createContext<ObservatoryFilterContextValue | null>(null);

interface ObservatoryFilterProviderProps {
  children: ReactNode;
  initialFilters?: Partial<ObservatoryFilterState>;
  syncWithUrl?: boolean;
}

/**
 * Inner component that safely interacts with Next.js navigation hooks
 */
function FilterProviderInner({
  children,
  initialFilters,
  syncWithUrl = true,
}: ObservatoryFilterProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state by parsing current URL parameters
  const [filterState, setFilterState] = useState<ObservatoryFilterState>(() => {
    if (searchParams && searchParams.size > 0) {
      const parsed = parseQueryStringToFilters(searchParams);
      return parsed.state;
    }
    if (initialFilters) {
      return sanitizeFilterState(initialFilters).state;
    }
    return DEFAULT_FILTER_STATE;
  });

  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>(() => {
    if (searchParams && searchParams.size > 0) {
      return parseQueryStringToFilters(searchParams).issues;
    }
    return [];
  });

  const currentSearchString = searchParams ? searchParams.toString() : "";
  const prevSearchParamsStringRef = React.useRef(currentSearchString);
  const lastEmittedQueryRef = React.useRef(currentSearchString);

  // Keep state in sync if URL changes externally (e.g. back/forward browser history)
  useEffect(() => {
    if (currentSearchString === prevSearchParamsStringRef.current) {
      return;
    }
    prevSearchParamsStringRef.current = currentSearchString;

    // If search param matches what updateStateAndUrl just emitted, no need to re-parse
    if (currentSearchString === lastEmittedQueryRef.current) {
      return;
    }

    if (searchParams) {
      const { state, issues } = parseQueryStringToFilters(searchParams);
      setFilterState(state);
      if (issues.length > 0) {
        setValidationIssues(issues);
      }
    }
  }, [currentSearchString, searchParams]);

  // Synchronize state changes to URL query string
  const updateStateAndUrl = useCallback(
    (newState: ObservatoryFilterState) => {
      const { state, issues } = sanitizeFilterState(newState);
      setFilterState(state);
      if (issues.length > 0) {
        setValidationIssues(issues);
      }

      if (syncWithUrl && typeof window !== "undefined") {
        const queryString = filtersToQueryString(state);
        const cleanQuery = queryString.replace(/^\?/, "");
        lastEmittedQueryRef.current = cleanQuery;
        const targetUrl = `${pathname}${queryString}`;
        try {
          router.replace(targetUrl, { scroll: false });
        } catch {
          // Safe fallback in test environments
        }
      }
    },
    [pathname, router, syncWithUrl]
  );

  const setRegion = useCallback(
    (region: string) => {
      updateStateAndUrl({ ...filterState, region });
    },
    [filterState, updateStateAndUrl]
  );

  const setMetric = useCallback(
    (metric: MetricFilter) => {
      updateStateAndUrl({ ...filterState, metric });
    },
    [filterState, updateStateAndUrl]
  );

  const setDriver = useCallback(
    (driver: DriverFilter) => {
      updateStateAndUrl({ ...filterState, driver });
    },
    [filterState, updateStateAndUrl]
  );

  const setPopulation = useCallback(
    (population: PopulationFilter) => {
      updateStateAndUrl({ ...filterState, population });
    },
    [filterState, updateStateAndUrl]
  );

  const setRound = useCallback(
    (round: RoundFilter) => {
      updateStateAndUrl({ ...filterState, round });
    },
    [filterState, updateStateAndUrl]
  );

  const setAdminLevel = useCallback(
    (adminLevel: 1 | 2) => {
      updateStateAndUrl({ ...filterState, adminLevel });
    },
    [filterState, updateStateAndUrl]
  );

  const setFilters = useCallback(
    (partial: Partial<ObservatoryFilterState>) => {
      updateStateAndUrl({ ...filterState, ...partial });
    },
    [filterState, updateStateAndUrl]
  );

  const resetFilters = useCallback(() => {
    updateStateAndUrl(DEFAULT_FILTER_STATE);
  }, [updateStateAndUrl]);

  const dismissIssues = useCallback(() => {
    setValidationIssues([]);
  }, []);

  // Compute active non-default filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterState.region !== DEFAULT_FILTER_STATE.region) count++;
    if (filterState.metric !== DEFAULT_FILTER_STATE.metric) count++;
    if (filterState.driver !== DEFAULT_FILTER_STATE.driver) count++;
    if (filterState.population !== DEFAULT_FILTER_STATE.population) count++;
    if (filterState.round !== DEFAULT_FILTER_STATE.round) count++;
    if (filterState.adminLevel !== DEFAULT_FILTER_STATE.adminLevel) count++;
    return count;
  }, [filterState]);

  const isDefaultState = activeFilterCount === 0;

  const value: ObservatoryFilterContextValue = useMemo(
    () => ({
      filters: filterState,
      setRegion,
      setMetric,
      setDriver,
      setPopulation,
      setRound,
      setAdminLevel,
      setFilters,
      resetFilters,
      activeFilterCount,
      isDefaultState,
      validationIssues,
      dismissIssues,
    }),
    [
      filterState,
      setRegion,
      setMetric,
      setDriver,
      setPopulation,
      setRound,
      setAdminLevel,
      setFilters,
      resetFilters,
      activeFilterCount,
      isDefaultState,
      validationIssues,
      dismissIssues,
    ]
  );

  return (
    <ObservatoryFilterContext.Provider value={value}>
      {children}
    </ObservatoryFilterContext.Provider>
  );
}

/**
 * Main ObservatoryFilterProvider wrapped in Suspense for Next.js 16 SSR safety.
 */
export function ObservatoryFilterProvider(props: ObservatoryFilterProviderProps) {
  return (
    <React.Suspense fallback={<>{props.children}</>}>
      <FilterProviderInner {...props} />
    </React.Suspense>
  );
}

/**
 * Custom hook to access and update linked observatory cross-filtering state.
 */
export function useObservatoryFilters(): ObservatoryFilterContextValue {
  const context = useContext(ObservatoryFilterContext);
  if (!context) {
    // Return a standalone default implementation when used outside of Provider
    return {
      filters: DEFAULT_FILTER_STATE,
      setRegion: () => {},
      setMetric: () => {},
      setDriver: () => {},
      setPopulation: () => {},
      setRound: () => {},
      setAdminLevel: () => {},
      setFilters: () => {},
      resetFilters: () => {},
      activeFilterCount: 0,
      isDefaultState: true,
      validationIssues: [],
      dismissIssues: () => {},
    };
  }
  return context;
}
