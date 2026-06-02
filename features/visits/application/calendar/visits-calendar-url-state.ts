import {
  formatDateOnlyUtc,
  isDateOnlyString,
  parseDateOnlyUtc,
} from "@/lib/utils/date";
import { z } from "zod";
import {
  type VisitsCalendarView,
  VISITS_CALENDAR_VIEWS,
} from "../../domain/visits-calendar-types";

export const VisitsCalendarViewSchema = z.enum(VISITS_CALENDAR_VIEWS);
export const DEFAULT_VISITS_CALENDAR_VIEW: VisitsCalendarView = "month";
const LEGACY_VISITS_CALENDAR_SEARCH_PARAM_KEYS = [
  "selected",
  "compose",
  "from",
  "to",
] as const;
const VISITS_CALENDAR_OWNED_SEARCH_PARAM_KEYS = [
  "view",
  "date",
  ...LEGACY_VISITS_CALENDAR_SEARCH_PARAM_KEYS,
] as const;

export interface VisitsCalendarUrlState {
  view: VisitsCalendarView;
  anchorIso: string;
}

export interface VisitsCalendarSearchParamsInput {
  view?: string | string[];
  date?: string | string[];
}

export interface VisitsCalendarSearchParams {
  view?: VisitsCalendarView;
  date?: string;
}

export interface VisitsCalendarLocationState {
  urlState: VisitsCalendarUrlState;
  canonicalSearchParams: URLSearchParams;
  shouldCanonicalize: boolean;
}

type VisitsCalendarSearchParamKey = "view" | "date";

type SearchParamsSource =
  | URLSearchParams
  | {
      get: (key: string) => string | null;
    }
  | VisitsCalendarSearchParamsInput;

function isValidDateOnly(value: string | null | undefined): value is string {
  if (!value || !isDateOnlyString(value)) {
    return false;
  }

  try {
    return formatDateOnlyUtc(parseDateOnlyUtc(value)) === value;
  } catch {
    return false;
  }
}

function readParam(
  source: SearchParamsSource,
  key: VisitsCalendarSearchParamKey
) {
  if ("get" in source) {
    return typeof source.get === "function" ? source.get(key) : null;
  }

  const value = source[key];

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function sanitizeSearchParamValue(value: string | null | undefined) {
  return value ?? undefined;
}

function parseVisitsCalendarView(value: string | null | undefined) {
  const parsedView = VisitsCalendarViewSchema.safeParse(value);

  return parsedView.success ? parsedView.data : undefined;
}

// Only shareable params (view, date) are parsed; transient UI state is intentionally excluded.
export function parseVisitsCalendarSearchParams(
  source: SearchParamsSource
): VisitsCalendarSearchParams {
  const readSearchParam = (key: VisitsCalendarSearchParamKey) =>
    sanitizeSearchParamValue(readParam(source, key));

  return {
    view: parseVisitsCalendarView(readSearchParam("view")),
    date: readSearchParam("date"),
  };
}

export function parseVisitsCalendarUrlState(
  searchParams: VisitsCalendarSearchParams,
  todayIso: string
): VisitsCalendarUrlState {
  const anchorIso = isValidDateOnly(searchParams.date)
    ? searchParams.date
    : todayIso;

  return {
    view: searchParams.view ?? DEFAULT_VISITS_CALENDAR_VIEW,
    anchorIso,
  };
}

export function readVisitsCalendarUrlState(
  source: SearchParamsSource,
  todayIso: string,
): VisitsCalendarUrlState {
  return parseVisitsCalendarUrlState(
    parseVisitsCalendarSearchParams(source),
    todayIso,
  );
}

// Durable state only — does not preserve transient UI state (selected day, draft range, composer).
export function buildVisitsCalendarSearchParams(
  state: VisitsCalendarUrlState,
): URLSearchParams {
  const next = new URLSearchParams();

  next.set("view", state.view);
  next.set("date", state.anchorIso);

  return next;
}

function hasVisitsCalendarOwnedSearchParams(source: Pick<URLSearchParams, "has">) {
  return VISITS_CALENDAR_OWNED_SEARCH_PARAM_KEYS.some((key) => source.has(key));
}

export function mergeVisitsCalendarSearchParams(
  source: URLSearchParams,
  state: VisitsCalendarUrlState,
): URLSearchParams {
  const next = new URLSearchParams(source.toString());

  for (const key of VISITS_CALENDAR_OWNED_SEARCH_PARAM_KEYS) {
    next.delete(key);
  }

  const visitsSearchParams = buildVisitsCalendarSearchParams(state);

  visitsSearchParams.forEach((value, key) => {
    next.set(key, value);
  });

  return next;
}

export function readVisitsCalendarLocationState(
  source: URLSearchParams,
  todayIso: string,
): VisitsCalendarLocationState {
  const urlState = readVisitsCalendarUrlState(source, todayIso);
  const canonicalSearchParams = mergeVisitsCalendarSearchParams(source, urlState);

  return {
    urlState,
    canonicalSearchParams,
    shouldCanonicalize:
      hasVisitsCalendarOwnedSearchParams(source) &&
      canonicalSearchParams.toString() !== source.toString(),
  };
}
