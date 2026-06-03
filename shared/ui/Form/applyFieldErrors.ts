export function applyFieldErrors<TFieldName extends string>(
  fields: readonly TFieldName[],
  fieldErrors: Partial<Record<TFieldName, string | undefined>> | undefined,
  onError: (name: TFieldName, message: string) => void,
): TFieldName | null {
  let firstInvalidField: TFieldName | null = null;

  for (const fieldName of fields) {
    const message = fieldErrors?.[fieldName];

    if (!message) {
      continue;
    }

    onError(fieldName, message);

    if (!firstInvalidField) {
      firstInvalidField = fieldName;
    }
  }

  return firstInvalidField;
}
