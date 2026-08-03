export function isDemoModeEnabled() {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "1";
}

export function isClientDemoModeEnabled() {
  return isDemoModeEnabled();
}
