export function getOptionalString(
  formData: FormData,
  key: string
): string | null {
  const value = String(formData.get(key) ?? "").trim();

  return value ? value : null;
}

export function getOptionalDate(
  formData: FormData,
  key: string
): string | null {
  const value = String(formData.get(key) ?? "").trim();

  return value ? value : null;
}
