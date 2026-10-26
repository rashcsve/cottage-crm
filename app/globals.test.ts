import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(path.resolve(process.cwd(), "app/globals.css"), "utf8");

function getThemeTokens(source: string): Map<string, string> {
  const tokens = new Map<string, string>();
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, "");

  for (const block of withoutComments.matchAll(/@theme\s*\{([^}]*)\}/g)) {
    for (const declaration of block[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      tokens.set(declaration[1], declaration[2].trim());
    }
  }

  return tokens;
}

function getRuleBody(source: string, selector: string): string | undefined {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, "");

  for (const rule of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = rule[1].split(",").map((part) => part.trim());

    if (selectors.includes(selector)) {
      return rule[2];
    }
  }

  return undefined;
}

const tokens = getThemeTokens(css);

const LEGACY_COLOUR_ALIASES = [
  "--color-ink",
  "--color-ink-hover",
  "--color-border-strong",
  "--color-success-50",
  "--color-success-200",
  "--color-success-700",
  "--color-warning-50",
  "--color-warning-200",
  "--color-warning-700",
  "--color-danger-50",
  "--color-danger-200",
  "--color-danger-300",
  "--color-danger-500",
  "--color-danger-600",
  "--color-danger-700",
  "--color-danger-900",
  "--color-nav-border",
  "--color-nav-surface",
  "--color-nav-ink",
  "--color-nav-emphasis",
  "--color-nav-muted",
  "--color-nav-faint",
];

describe("globals.css Fjäll tokens", () => {
  it("uses a plain @theme block so tokens stay runtime variables", () => {
    expect(css).toMatch(/@theme\s*\{/);
    expect(css).not.toMatch(/@theme\s+inline/);
  });

  it.each([
    ["--color-page", "#F5F6F3"],
    ["--color-surface", "#FFFFFF"],
    ["--color-muted", "#ECEEEA"],
    ["--color-border", "#DDE1DC"],
    ["--color-ink-primary", "#1B2428"],
    ["--color-ink-secondary", "#3D4A50"],
    ["--color-ink-muted", "#5A676D"],
    ["--color-ink-faint", "#A3ACAA"],
    ["--color-accent", "#6B3F24"],
    ["--color-accent-hover", "#4A2E1B"],
    ["--color-on-accent", "#FFFFFF"],
    ["--color-success", "#2F6B4A"],
    ["--color-warning", "#8A5A00"],
    ["--color-danger", "#B0322A"],
    ["--radius-card", "4px"],
    ["--radius-control", "4px"],
    ["--shadow-card", "none"],
    ["--text-xs", "13px"],
    ["--text-xs--line-height", "1.4"],
    ["--text-sm", "15px"],
    ["--text-sm--line-height", "1.5"],
    ["--text-base", "16px"],
    ["--text-base--line-height", "1.5"],
    ["--text-lg", "17px"],
    ["--text-xl", "20px"],
    ["--text-2xl", "28px"],
    ["--text-3xl", "36px"],
    ["--text-display", "48px"],
  ])("defines spec token %s as %s", (name, value) => {
    expect(tokens.get(name)?.toUpperCase()).toBe(value.toUpperCase());
  });

  it.each([
    ["--text-2xs", "12px"],
    ["--text-stat-sm", "22px"],
    ["--text-stat", "40px"],
    ["--tracking-display", "-0.03em"],
    ["--tracking-heading", "-0.01em"],
    ["--tracking-data", "-0.04em"],
    ["--container-page", "1180px"],
  ])("defines plan addition %s as %s", (name, value) => {
    expect(tokens.get(name)).toBe(value);
  });

  it("points the sans and mono fonts at the next/font variables", () => {
    expect(tokens.get("--font-sans")).toMatch(/var\(--font-schibsted-grotesk/);
    expect(tokens.get("--font-mono")).toMatch(/var\(--font-spline-sans-mono/);
    expect(css).not.toMatch(/geist/i);
  });

  it.each(["border-control", "focus-inset", "grid-previews", "range-band"])(
    "defines the %s utility",
    (name) => {
      expect(css).toMatch(new RegExp(`@utility\\s+${name}\\s*\\{`));
    },
  );

  it.each([...LEGACY_COLOUR_ALIASES, "--font-display"])(
    "no longer defines the legacy alias %s",
    (name) => {
      expect(tokens.has(name)).toBe(false);
      expect(css).not.toContain(`${name}:`);
    },
  );
});

describe("globals.css range-band utility", () => {
  it("draws the calendar draft-range band as top and bottom accent insets", () => {
    const utility = css.match(/@utility\s+range-band\s*\{([^}]*)\}/)?.[1];

    expect(utility).toMatch(
      /box-shadow:\s*inset 0 2px 0 var\(--color-accent\),\s*inset 0 -2px 0 var\(--color-accent\)/,
    );
  });
});

describe("globals.css base layer", () => {
  it("draws one accent focus outline for every element", () => {
    const rule = getRuleBody(css, ":focus-visible");

    expect(rule).toMatch(/outline:\s*2px solid var\(--color-accent\)/);
    expect(rule).toMatch(/outline-offset:\s*2px/);
  });

  it("pads scroll targets below the sticky 72px header", () => {
    expect(getRuleBody(css, "html")).toMatch(/scroll-padding-top:\s*88px/);
  });

  it("colours placeholders with ink-muted", () => {
    expect(getRuleBody(css, "::placeholder")).toMatch(
      /color:\s*var\(--color-ink-muted\)/,
    );
  });

  it("styles the body from tokens", () => {
    const rule = getRuleBody(css, "body");

    expect(rule).toMatch(/background-color:\s*var\(--color-page\)/);
    expect(rule).toMatch(/color:\s*var\(--color-ink-primary\)/);
    expect(rule).toMatch(/font-family:\s*var\(--font-sans\)/);
  });
});
