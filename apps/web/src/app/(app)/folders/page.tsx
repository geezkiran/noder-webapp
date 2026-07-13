import { PageHeader } from "@/components/application/page-header";

interface FolderPageProps {
  title: string;
  description: string;
}

function FolderPage({ title, description }: FolderPageProps) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <section className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary ring-inset">
        <p className="text-sm text-secondary">{title} content goes here.</p>
      </section>
    </>
  );
}

export default function FoldersPage() {
  return (
    <FolderPage title="Folders" description="Browse all folders and collections." />
  );
}
