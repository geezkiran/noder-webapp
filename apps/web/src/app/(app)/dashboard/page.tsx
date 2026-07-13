import { PageHeader } from "@/components/application/page-header";

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Overview of activity, metrics, and recent updates." />
      <section className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary ring-inset">
        <p className="text-sm text-secondary">Dashboard content goes here.</p>
      </section>
    </>
  );
}
