interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-display-sm font-semibold text-primary">{title}</h1>
      <p className="mt-2 max-w-2xl text-md text-tertiary">{description}</p>
    </div>
  );
}
