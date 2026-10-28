export const COUPLE_IDS = [
  "couple-1",
  "couple-2",
  "couple-3",
  "couple-4",
  "admin",
] as const;

export type CoupleId = (typeof COUPLE_IDS)[number];

export const FALLBACK_COUPLE: CoupleId = "admin";

export interface Couple {
  id: CoupleId;
  label: string;
}

export function getVisitCoupleLabel(
  visit: { couple: CoupleId | null; coupleLabel: string | null },
  noCoupleLabel: string
): string | null {
  return visit.couple === null ? noCoupleLabel : visit.coupleLabel;
}

export interface CoupleColorClasses {
  fill: string;
  band: string;
  checkedFill: string;
  edge: string;
  swatch: string;
}

const COUPLE_COLOR_CLASSES: Record<CoupleId | "none", CoupleColorClasses> = {
  none: {
    fill: "border border-dashed border-ink-muted",
    band: "bg-muted",
    checkedFill: "has-checked:bg-border",
    edge: "border-ink-muted",
    swatch: "border border-dashed border-ink-muted",
  },
  admin: {
    fill: "bg-border",
    band: "bg-border",
    checkedFill: "has-checked:bg-border",
    edge: "border-ink-muted",
    swatch: "bg-ink-muted",
  },
  "couple-1": {
    fill: "bg-couple-1",
    band: "bg-couple-1",
    checkedFill: "has-checked:bg-couple-1",
    edge: "border-couple-1-edge",
    swatch: "bg-couple-1-edge",
  },
  "couple-2": {
    fill: "bg-couple-2",
    band: "bg-couple-2",
    checkedFill: "has-checked:bg-couple-2",
    edge: "border-couple-2-edge",
    swatch: "bg-couple-2-edge",
  },
  "couple-3": {
    fill: "bg-couple-3",
    band: "bg-couple-3",
    checkedFill: "has-checked:bg-couple-3",
    edge: "border-couple-3-edge",
    swatch: "bg-couple-3-edge",
  },
  "couple-4": {
    fill: "bg-couple-4",
    band: "bg-couple-4",
    checkedFill: "has-checked:bg-couple-4",
    edge: "border-couple-4-edge",
    swatch: "bg-couple-4-edge",
  },
};

export function getCoupleColorClasses(couple: CoupleId | null): CoupleColorClasses {
  return COUPLE_COLOR_CLASSES[couple ?? "none"];
}
