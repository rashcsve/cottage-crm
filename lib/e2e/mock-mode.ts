export function isE2EMockModeEnabled() {
  return process.env.E2E_MOCKS === "1";
}

export function isClientE2EMockModeEnabled() {
  return process.env.NEXT_PUBLIC_E2E_MOCKS === "1";
}
