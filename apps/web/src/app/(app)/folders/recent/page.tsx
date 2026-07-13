import { PageHeader } from "@/components/application/page-header";

export default function RecentFoldersPage() {
  return (
    <>
      <PageHeader title="Recent folders" description="Folders you opened recently." />
      <section className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary ring-inset">
        <p className="text-sm text-secondary">8 recent folders.</p>
      </section>
    </>
  );
}
