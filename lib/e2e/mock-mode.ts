export function isE2EMockModeEnabled() {
  return process.env.E2E_MOCKS === "1" || process.env.DEMO_MODE === "1";
}

export function isClientE2EMockModeEnabled() {
  return process.env.NEXT_PUBLIC_E2E_MOCKS === "1" || process.env.NEXT_PUBLIC_DEMO_MODE === "1";
}
