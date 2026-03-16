type SectionHeaderProps = {
  title: string;
  description?: string;
};

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <h3 className="text-2xl font-semibold">{title}</h3>
      {description && <p className="mt-2 text-stone-600">{description}</p>}
    </div>
  );
}
