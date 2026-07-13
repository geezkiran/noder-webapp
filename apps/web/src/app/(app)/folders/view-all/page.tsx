import { PageHeader } from "@/components/application/page-header";

export default function ViewAllFoldersPage() {
  return (
    <>
      <PageHeader title="View all folders" description="Browse every folder in your workspace." />
      <section className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary ring-inset">
        <p className="text-sm text-secondary">18 folders available.</p>
      </section>
    </>
  );
}
