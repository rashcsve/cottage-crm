export function FieldHint({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} className="mt-1 text-sm text-ink-muted">
      {message}
    </p>
  );
}
