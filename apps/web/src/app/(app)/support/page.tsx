import { PageHeader } from "@/components/application/page-header";

export default function SupportPage() {
  return (
    <>
      <PageHeader title="Support" description="Get help from our team. We are online and ready to assist." />
      <section className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary ring-inset">
        <p className="text-sm text-secondary">Support content goes here.</p>
      </section>
    </>
  );
}
