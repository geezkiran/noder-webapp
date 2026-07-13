import { PageHeader } from "@/components/application/page-header";

export default function SharedFoldersPage() {
  return (
    <>
      <PageHeader title="Shared folders" description="Folders shared with your team." />
      <section className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary ring-inset">
        <p className="text-sm text-secondary">4 shared folders.</p>
      </section>
    </>
  );
}
