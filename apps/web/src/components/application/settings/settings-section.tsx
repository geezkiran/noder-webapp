import type { ReactNode } from "react";

interface SettingsSectionProps {
  id: string;
  title?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  tone?: "default" | "danger";
}

export function SettingsSection({ id, title, description, children, actions, tone = "default" }: SettingsSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-6 rounded-xl bg-primary shadow-xs"
    >
      {title && (
        <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
          <div>
            <h2 className={tone === "danger" ? "text-[17px] font-semibold text-error-primary" : "text-[17px] font-semibold text-primary"}>
              {title}
            </h2>
            {description && <p className="mt-1 max-w-lg text-[15px] text-tertiary">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="flex flex-col px-6">{children}</div>
    </section>
  );
}

export function SettingsRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-sm">
        <p className="text-[15px] font-medium text-secondary">{label}</p>
        {description && <p className="mt-0.5 text-[15px] text-tertiary">{description}</p>}
      </div>
      <div className="shrink-0 sm:w-72">{children}</div>
    </div>
  );
}
