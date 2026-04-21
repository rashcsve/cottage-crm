import { afterEach, vi } from "vitest";
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { createElement } from "react";
import type { ReactNode } from "react";

/**
 * Clean up DOM after each test
 */
afterEach(() => {
  cleanup();
});

/**
 * Mock next-intl hooks used in components
 */
vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => {
    return (key: string) => key; // Return key as-is for testing
  }),
  useLocale: vi.fn(() => "en"),
  getTranslations: vi.fn(async () => {
    return (key: string) => key;
  }),
}));

/**
 * Mock next/navigation (used by some components)
 */
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => "/tasks"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

/**
 * Mock shared i18n navigation layer used by localized UI
 */
vi.mock("@/i18n/navigation", () => ({
  Link: vi.fn(
    ({
      href,
      children,
      ...props
    }: {
      href: string | { pathname?: string };
      children: ReactNode;
    }) =>
      createElement(
        "a",
        {
          ...props,
          href: typeof href === "string" ? href : href.pathname,
        },
        children
      )
  ),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => "/tasks"),
  redirect: vi.fn(),
  getPathname: vi.fn(
    ({
      href,
      locale,
    }: {
      href: string | { pathname?: string };
      locale: string;
    }) => {
      const pathname = typeof href === "string" ? href : (href.pathname ?? "/");

      if (locale === "cs") {
        return pathname;
      }

      if (pathname === "/") {
        return `/${locale}`;
      }

      return `/${locale}${pathname}`;
    }
  ),
}));

vi.mock("@/i18n/revalidation", () => ({
  getLocalizedPathnames: vi.fn(),
  revalidateLocalizedPath: vi.fn(),
  revalidateLocalizedPaths: vi.fn(),
}));

/**
 * Mock next/cache (server-only)
 */
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("server-only", () => ({}));

/**
 * Mock Supabase (used in server functions)
 * Will be more specific in individual test files
 */
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({})),
}));

/**
 * Global browser APIs mocks (only if needed by components)
 * Add these if components actually use them
 */

// Mock matchMedia for responsive design tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver (needed by some UI libraries)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver (needed by some UI libraries)
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock crypto.randomUUID if used
if (!global.crypto) {
  global.crypto = {
    randomUUID: vi.fn(() => `uuid-${Math.random()}`),
    subtle: {} as SubtleCrypto,
    getRandomValues: vi.fn((array: Uint8Array) => array),
  } as Crypto;
}
