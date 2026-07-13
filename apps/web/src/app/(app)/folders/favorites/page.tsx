import { PageHeader } from "@/components/application/page-header";

export default function FavoriteFoldersPage() {
  return (
    <>
      <PageHeader title="Favorite folders" description="Quick access to folders you starred." />
      <section className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary ring-inset">
        <p className="text-sm text-secondary">6 favorite folders.</p>
      </section>
    </>
  );
}
