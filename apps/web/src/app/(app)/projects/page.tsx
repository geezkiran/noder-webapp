import { PageHeader } from "@/components/application/page-header";

export default function ProjectsPage() {
  return (
    <>
      <PageHeader title="Projects" description="Manage and browse your active projects." />
      <section className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary ring-inset">
        <p className="text-sm text-secondary">Projects content goes here.</p>
      </section>
    </>
  );
}
