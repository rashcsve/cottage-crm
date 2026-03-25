interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="space-y-2">
      <h2 className="text-3xl font-semibold tracking-tight text-stone-900">
        {title}
      </h2>

      {description && (
        <p className="max-w-2xl text-sm text-stone-500">{description}</p>
      )}
    </header>
  );
}
