import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(path.resolve(process.cwd(), "app/globals.css"), "utf8");

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

function getBlockBody(source: string, header: string): string | undefined {
  const start = source.indexOf(header);
  if (start === -1) return undefined;

  const open = source.indexOf("{", start);
  let depth = 0;
  for (let end = open; end < source.length; end += 1) {
    if (source[end] === "{") depth += 1;
    if (source[end] === "}") depth -= 1;
    if (depth === 0) return source.slice(open + 1, end);
  }

  return undefined;
}

const NO_PREFERENCE_QUERY = "@media (prefers-reduced-motion: no-preference)";

function splitNoPreferenceBlocks(source: string) {
  let inside = "";
  let outside = source;

  for (;;) {
    const start = outside.indexOf(NO_PREFERENCE_QUERY);
    const body = getBlockBody(outside, NO_PREFERENCE_QUERY);
    if (start === -1 || body === undefined) break;

    const end = outside.indexOf("{", start) + body.length + 2;
    inside += `${body}\n`;
    outside = outside.slice(0, start) + outside.slice(end);
  }

  return { inside, outside };
}

describe("globals.css Fjäll tokens", () => {
  it("uses a plain @theme block so tokens stay runtime variables", () => {
    expect(css).toMatch(/@theme\s*\{/);
    expect(css).not.toMatch(/@theme\s+inline/);
  });
});

describe("globals.css home motion", () => {
  it.each(["motion-fade-in", "motion-press"])(
    "applies the %s utility only under prefers-reduced-motion: no-preference",
    (name) => {
      const body = getBlockBody(css, `@utility ${name} {`) ?? "";
      const { inside, outside } = splitNoPreferenceBlocks(body);

      expect(inside.trim()).not.toBe("");
      expect(outside.trim()).toBe("");
    },
  );

  it("styles [data-reveal] only under prefers-reduced-motion: no-preference", () => {
    const { inside, outside } = splitNoPreferenceBlocks(css);

    expect(inside).toContain('[data-reveal="hidden"]');
    expect(inside).toContain('[data-reveal="shown"]');
    expect(outside).not.toContain("[data-reveal");
  });
});

describe("globals.css base layer", () => {
  it("draws one accent focus outline for every element", () => {
    const rule = getRuleBody(css, ":focus-visible");

    expect(rule).toMatch(/outline:\s*2px solid var\(--color-accent\)/);
    expect(rule).toMatch(/outline-offset:\s*2px/);
  });
});
