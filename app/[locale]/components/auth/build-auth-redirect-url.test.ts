import { describe, expect, it } from "vitest";

import {
  buildLoginErrorPath,
  buildOAuthCallbackUrl,
  buildPostLoginPath,
} from "./build-auth-redirect-url";

describe("buildOAuthCallbackUrl", () => {
  it("has no locale prefix for the default locale", () => {
    expect(buildOAuthCallbackUrl("http://localhost:3000", "cs")).toBe(
      "http://localhost:3000/auth/callback",
    );
  });

  it("prefixes the callback with /en for English", () => {
    expect(buildOAuthCallbackUrl("https://chata.example", "en")).toBe(
      "https://chata.example/en/auth/callback",
    );
  });

  it("falls back to the default locale for an unsupported locale", () => {
    expect(buildOAuthCallbackUrl("https://chata.example", "de")).toBe(
      "https://chata.example/auth/callback",
    );
  });

  it("does not double the slash when the origin has a trailing slash", () => {
    expect(buildOAuthCallbackUrl("https://chata.example/", "en")).toBe(
      "https://chata.example/en/auth/callback",
    );
  });
});

describe("buildPostLoginPath", () => {
  it("returns the dashboard path without prefix for the default locale", () => {
    expect(buildPostLoginPath("cs")).toBe("/overview");
  });

  it("returns the /en-prefixed dashboard path for English", () => {
    expect(buildPostLoginPath("en")).toBe("/en/overview");
  });

  it("falls back to the default locale for an unsupported locale", () => {
    expect(buildPostLoginPath("https://evil.example")).toBe("/overview");
  });
});

describe("buildLoginErrorPath", () => {
  it("returns the login path with the oauth error for the default locale", () => {
    expect(buildLoginErrorPath("cs")).toBe("/login?error=oauth");
  });

  it("returns the /en-prefixed login path with the oauth error for English", () => {
    expect(buildLoginErrorPath("en")).toBe("/en/login?error=oauth");
  });

  it("falls back to the default locale for an unsupported locale", () => {
    expect(buildLoginErrorPath("")).toBe("/login?error=oauth");
  });
});
