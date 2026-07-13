import { PageHeader } from "@/components/application/page-header";

export default function ReportingPage() {
  return (
    <>
      <PageHeader title="Reporting" description="Analytics and reports across your workspace." />
      <section className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary ring-inset">
        <p className="text-sm text-secondary">Reporting content goes here.</p>
      </section>
    </>
  );
}
