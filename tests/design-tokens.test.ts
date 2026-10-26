import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCANNED_DIRECTORIES = ["app", "features", "shared"];
const SOURCE_FILE = /\.(ts|tsx)$/;
const TEST_FILE = /\.test\.(ts|tsx)$/;

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black";
const COLOUR_UTILITY =
  "bg|text|border|border-[xytrbl]|ring|ring-offset|outline|divide|fill|stroke|from|via|to|decoration|placeholder|caret|accent";
const CLASS_START = String.raw`(?<![\w-])(?:[\w\[\]&:@/.-]*:)?!?`;
const CLASS_END = String.raw`(?![\w-])`;

const FORBIDDEN_PATTERNS: ReadonlyArray<{ rule: string; pattern: RegExp }> = [
  {
    rule: "raw palette class",
    pattern: new RegExp(
      `${CLASS_START}(?:${COLOUR_UTILITY})-(?:${PALETTE})(?:-\\d{2,3})?(?:/\\d+)?${CLASS_END}`,
      "g",
    ),
  },
  {
    rule: "focus-visible:outline-none",
    pattern: /focus-visible:outline-none/g,
  },
  {
    rule: "arbitrary pixel font size",
    pattern: new RegExp(`${CLASS_START}text-\\[\\d+(?:\\.\\d+)?px\\]`, "g"),
  },
  {
    rule: "shadow utility",
    pattern: new RegExp(`${CLASS_START}shadow(?:-[\\w\\[\\](),./_-]+)?${CLASS_END}`, "g"),
  },
  {
    rule: "legacy token",
    pattern: new RegExp(
      `${CLASS_START}(?:${COLOUR_UTILITY})-(?:ink|ink-hover|border-strong|nav-[a-z]+|(?:success|warning|danger)-\\d{2,3})${CLASS_END}|${CLASS_START}font-display${CLASS_END}|--color-(?:nav-[a-z]+|ink-hover|border-strong|ink(?![\\w-])|(?:success|warning|danger)-\\d{2,3})|--font-display`,
      "g",
    ),
  },
];

interface Violation {
  file: string;
  line: number;
  rule: string;
  match: string;
}

function findViolations(source: string, file = "<inline>"): Violation[] {
  const violations: Violation[] = [];
  const lines = source.split("\n");

  lines.forEach((text, index) => {
    for (const { rule, pattern } of FORBIDDEN_PATTERNS) {
      for (const match of text.matchAll(pattern)) {
        violations.push({ file, line: index + 1, rule, match: match[0] });
      }
    }
  });

  return violations;
}

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return listSourceFiles(fullPath);
    }

    return SOURCE_FILE.test(entry.name) && !TEST_FILE.test(entry.name) ? [fullPath] : [];
  });
}

describe("design-token guard patterns", () => {
  it.each([
    ["bg-stone-100", "raw palette class"],
    ["hover:text-emerald-800", "raw palette class"],
    ["md:border-amber-200/60", "raw palette class"],
    ["bg-white", "raw palette class"],
    ["text-white", "raw palette class"],
    ["focus-visible:outline-none", "focus-visible:outline-none"],
    ["text-[15px]", "arbitrary pixel font size"],
    ["shadow-sm", "shadow utility"],
    ["shadow", "shadow utility"],
    ["shadow-[inset_0_2px_0_var(--color-accent)]", "shadow utility"],
    ["text-ink", "legacy token"],
    ["hover:bg-ink-hover", "legacy token"],
    ["border-border-strong", "legacy token"],
    ["bg-nav-surface", "legacy token"],
    ["text-danger-700", "legacy token"],
    ["font-display", "legacy token"],
    ["var(--color-nav-faint)", "legacy token"],
  ])("flags %s as a %s", (className, rule) => {
    const violations = findViolations(`<div className="flex ${className} p-2" />`);

    expect(violations.map((violation) => violation.rule)).toContain(rule);
  });

  it.each([
    "text-ink-primary",
    "text-ink-secondary",
    "text-ink-muted",
    "border-ink-faint",
    "bg-surface",
    "bg-page",
    "bg-muted",
    "border-border",
    "text-accent",
    "bg-accent hover:bg-accent-hover text-on-accent",
    "text-success",
    "text-warning",
    "text-danger",
    "text-2xs",
    "text-stat",
    "text-display",
    "tracking-display",
    "range-band",
    "rounded-card",
    "focus-inset",
  ])("allows the Fjäll class %s", (className) => {
    expect(findViolations(`<div className="${className}" />`)).toEqual([]);
  });
});

describe("design tokens in app, features and shared", () => {
  it("uses only Fjäll semantic tokens", () => {
    const violations = SCANNED_DIRECTORIES.flatMap((directory) =>
      listSourceFiles(path.join(ROOT, directory)),
    ).flatMap((file) =>
      findViolations(readFileSync(file, "utf8"), path.relative(ROOT, file)),
    );

    expect(
      violations.map(
        ({ file, line, rule, match }) => `${file}:${line} ${rule}: ${match}`,
      ),
    ).toEqual([]);
  });
});
