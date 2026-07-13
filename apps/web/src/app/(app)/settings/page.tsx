"use client";

import { useState } from "react";
import {
  User,
  ShieldCheck,
  Bell,
  CreditCard,
  Users,
  Plug,
  TriangleAlert,
  Monitor,
  Smartphone,
  Globe,
  Github,
  Slack,
  HardDrive,
  Zap,
  Download,
  BadgeCheck,
  MapPin,
  Calendar,
  Camera,
} from "lucide-react";
import { SettingsNav, type SettingsNavSection } from "@/components/application/settings/settings-nav";
import { SettingsSummary } from "@/components/application/settings/settings-summary";
import { SettingsSection, SettingsRow } from "@/components/application/settings/settings-section";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Toggle } from "@/components/base/toggle/toggle";
import { cx } from "@/utils/cx";

const SECTIONS: SettingsNavSection[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account & Security", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing & Plan", icon: CreditCard },
  { id: "team", label: "Team & Members", icon: Users },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "danger", label: "Danger Zone", icon: TriangleAlert },
];

const selectClassName =
  "w-full rounded-lg bg-primary px-3 py-2 text-[15px] text-primary shadow-xs ring-1 ring-primary ring-inset outline-none focus:ring-2 focus:ring-brand";

const SESSIONS = [
  { device: "MacBook Pro", location: "San Francisco, CA", icon: Monitor, current: true, lastActive: "Active now" },
  { device: "iPhone 16 Pro", location: "San Francisco, CA", icon: Smartphone, current: false, lastActive: "2 hours ago" },
  { device: "Chrome on Windows", location: "New York, NY", icon: Globe, current: false, lastActive: "3 days ago" },
];

const TEAM_MEMBERS = [
  { name: "Alex Kim", email: "alex@noder.io", initials: "AK", role: "Owner" },
  { name: "Jordan Lee", email: "jordan@noder.io", initials: "JL", role: "Admin" },
  { name: "Priya Nair", email: "priya@noder.io", initials: "PN", role: "Editor" },
  { name: "Sam Torres", email: "sam@noder.io", initials: "ST", role: "Viewer" },
];

const INVOICES = [
  { date: "Jun 1, 2026", amount: "$29.00", status: "Paid" },
  { date: "May 1, 2026", amount: "$29.00", status: "Paid" },
  { date: "Apr 1, 2026", amount: "$29.00", status: "Paid" },
];

const INTEGRATIONS = [
  { name: "Slack", description: "Get notified about activity in your team channels.", icon: Slack, connected: true },
  { name: "GitHub", description: "Link repositories to projects and track commits.", icon: Github, connected: true },
  { name: "Google Drive", description: "Import and export documents directly from Drive.", icon: HardDrive, connected: false },
  { name: "Zapier", description: "Automate workflows across thousands of apps.", icon: Zap, connected: false },
];

export default function SettingsPage() {
  const [emailNotifs, setEmailNotifs] = useState({
    product: true,
    security: true,
    digest: false,
    mentions: true,
  });
  const [pushNotifs, setPushNotifs] = useState({
    messages: true,
    comments: true,
    mentions: false,
  });
  const [twoFactor, setTwoFactor] = useState(false);
  const [integrations, setIntegrations] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(INTEGRATIONS.map((i) => [i.name, i.connected])),
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_minmax(0,1fr)_280px]">
        {/* Left column — section navigation */}
        <div className="hidden lg:block">
          <SettingsNav sections={SECTIONS} />
        </div>

        {/* Middle column — main content */}
        <div className="flex min-w-0 flex-col gap-8">
          {/* Profile */}
          <SettingsSection id="profile">
            {/* Social profile hero */}
            <div className="-mx-6">
              <div className="relative h-32 w-full overflow-hidden rounded-t-xl bg-gradient-to-r from-brand-solid via-blue-400 to-violet-400 sm:h-40">
                <button
                  type="button"
                  className="absolute right-3 bottom-3 rounded-lg bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/55"
                >
                  Change cover
                </button>
              </div>

              <div className="px-6">
                <div className="-mt-12 flex items-end justify-between gap-4 sm:-mt-14">
                  <div className="group relative shrink-0 rounded-full ring-4 ring-primary">
                    <Avatar size="2xl" initials="AK" alt="Alex Kim" />
                    <button
                      type="button"
                      aria-label="Change profile photo"
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100"
                    >
                      <Camera className="size-5" strokeWidth={1.75} />
                    </button>
                  </div>
                  <Button color="secondary" size="sm" className="mb-1">
                    Edit profile
                  </Button>
                </div>

                <div className="mt-3">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[19px] font-semibold text-primary">Alex Kim</p>
                    <BadgeCheck className="size-4.5 text-fg-brand-primary" strokeWidth={2} />
                  </div>
                  <p className="text-[15px] text-tertiary">@alexkim</p>
                  <p className="mt-2 max-w-md text-[15px] text-secondary">
                    Building at Noder. Design systems, canvases, and agents.
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-tertiary">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-4" strokeWidth={1.75} />
                      San Francisco, CA
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-4" strokeWidth={1.75} />
                      Joined March 2024
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-5 pb-5 text-[15px]">
                  <span className="text-secondary">
                    <span className="font-semibold text-primary">248</span> Posts
                  </span>
                  <span className="text-secondary">
                    <span className="font-semibold text-primary">12.4K</span> Followers
                  </span>
                  <span className="text-secondary">
                    <span className="font-semibold text-primary">186</span> Following
                  </span>
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Account & Security */}
          <SettingsSection
            id="account"
            title="Account & Security"
            description="Manage two-factor authentication and active sessions."
          >
            <SettingsRow label="Two-factor authentication" description="Require a code from your authenticator app at sign-in.">
              <Toggle isSelected={twoFactor} onChange={setTwoFactor} aria-label="Two-factor authentication" />
            </SettingsRow>

            <div className="py-5">
              <p className="mb-3 text-[15px] font-medium text-secondary">Active sessions</p>
              <div className="flex flex-col gap-3">
                {SESSIONS.map((session) => (
                  <div
                    key={session.device}
                    className="flex items-center justify-between gap-4 rounded-lg bg-secondary px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <session.icon className="size-4.5 text-fg-quaternary" strokeWidth={1.75} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[15px] font-medium text-secondary">{session.device}</p>
                          {session.current && (
                            <Badge color="success" size="sm">
                              This device
                            </Badge>
                          )}
                        </div>
                        <p className="text-[15px] text-tertiary">
                          {session.location} · {session.lastActive}
                        </p>
                      </div>
                    </div>
                    {!session.current && (
                      <Button color="link-destructive" size="sm">
                        Sign out
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="py-5">
              <p className="mb-3 text-[15px] font-medium text-secondary">Connected accounts</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4 rounded-lg bg-secondary px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Github className="size-4.5 text-fg-quaternary" strokeWidth={1.75} />
                    <p className="text-[15px] font-medium text-secondary">GitHub</p>
                    <Badge color="success" size="sm">
                      Connected
                    </Badge>
                  </div>
                  <Button color="secondary" size="sm">
                    Disconnect
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg bg-secondary px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Globe className="size-4.5 text-fg-quaternary" strokeWidth={1.75} />
                    <p className="text-[15px] font-medium text-secondary">Google</p>
                    <Badge color="gray" size="sm">
                      Not connected
                    </Badge>
                  </div>
                  <Button color="secondary" size="sm">
                    Connect
                  </Button>
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection id="notifications" title="Notifications" description="Choose what you want to be notified about, and how.">
            <div className="py-5">
              <p className="mb-3 text-[15px] font-medium text-secondary">Email</p>
              <div className="flex flex-col gap-4">
                <Toggle
                  isSelected={emailNotifs.product}
                  onChange={(v) => setEmailNotifs((s) => ({ ...s, product: v }))}
                  label="Product updates"
                  hint="News about features and improvements."
                />
                <Toggle
                  isSelected={emailNotifs.security}
                  onChange={(v) => setEmailNotifs((s) => ({ ...s, security: v }))}
                  label="Security alerts"
                  hint="Sign-ins from new devices and password changes."
                />
                <Toggle
                  isSelected={emailNotifs.digest}
                  onChange={(v) => setEmailNotifs((s) => ({ ...s, digest: v }))}
                  label="Weekly digest"
                  hint="A summary of activity across your workspace."
                />
                <Toggle
                  isSelected={emailNotifs.mentions}
                  onChange={(v) => setEmailNotifs((s) => ({ ...s, mentions: v }))}
                  label="Mentions & replies"
                  hint="When someone mentions or replies to you."
                />
              </div>
            </div>

            <div className="py-5">
              <p className="mb-3 text-[15px] font-medium text-secondary">Push</p>
              <div className="flex flex-col gap-4">
                <Toggle
                  isSelected={pushNotifs.messages}
                  onChange={(v) => setPushNotifs((s) => ({ ...s, messages: v }))}
                  label="Direct messages"
                />
                <Toggle
                  isSelected={pushNotifs.comments}
                  onChange={(v) => setPushNotifs((s) => ({ ...s, comments: v }))}
                  label="Comments"
                />
                <Toggle
                  isSelected={pushNotifs.mentions}
                  onChange={(v) => setPushNotifs((s) => ({ ...s, mentions: v }))}
                  label="Mentions"
                />
              </div>
            </div>
          </SettingsSection>

          {/* Billing & Plan */}
          <SettingsSection id="billing" title="Billing & Plan" description="Manage your subscription and payment details.">
            <SettingsRow label="Current plan" description="Renews on August 1, 2026.">
              <div className="flex flex-wrap items-center justify-end gap-3">
                <Badge color="brand" size="sm">
                  Current Plan
                </Badge>
                <span className="text-[15px] font-medium text-secondary">Pro — $29/mo</span>
                <Button color="primary" size="sm">
                  Upgrade plan
                </Button>
              </div>
            </SettingsRow>

            <SettingsRow label="Payment method">
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="flex items-center gap-2 text-[15px] text-secondary">
                  <CreditCard className="size-4.5 text-fg-quaternary" strokeWidth={1.75} />
                  •••• •••• •••• 4242
                </div>
                <Button color="secondary" size="sm">
                  Update
                </Button>
              </div>
            </SettingsRow>

            <div className="py-5">
              <p className="mb-3 text-[15px] font-medium text-secondary">Billing history</p>
              <div className="flex flex-col divide-y divide-secondary">
                {INVOICES.map((invoice) => (
                  <div key={invoice.date} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex items-center gap-3">
                      <p className="text-[15px] text-secondary">{invoice.date}</p>
                      <Badge color="success" size="sm">
                        {invoice.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-[15px] font-medium text-secondary">{invoice.amount}</p>
                      <Button color="tertiary" size="sm" iconLeading={Download}>
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SettingsSection>

          {/* Team & Members */}
          <SettingsSection id="team" title="Team & Members" description="Manage who has access to your workspace.">
            <div className="py-5">
              <div className="flex flex-col divide-y divide-secondary">
                {TEAM_MEMBERS.map((member) => (
                  <div key={member.email} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar size="sm" initials={member.initials} alt={member.name} />
                      <div>
                        <p className="text-[15px] font-medium text-secondary">{member.name}</p>
                        <p className="text-[15px] text-tertiary">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge color={member.role === "Owner" ? "brand" : "gray"} size="sm">
                        {member.role}
                      </Badge>
                      {member.role !== "Owner" && (
                        <Button color="link-destructive" size="sm">
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-end">
              <Input aria-label="Invite by email" placeholder="teammate@company.com" size="sm" className="flex-1" />
              <select aria-label="Role" defaultValue="editor" className={cx(selectClassName, "sm:w-32")}>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <Button color="primary" size="sm">
                Send invite
              </Button>
            </div>
          </SettingsSection>

          {/* Integrations */}
          <SettingsSection id="integrations" title="Integrations" description="Connect the tools your team already uses.">
            <div className="flex flex-col divide-y divide-secondary">
              {INTEGRATIONS.map((integration) => (
                <div key={integration.name} className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                      <integration.icon className="size-4.5 text-fg-quaternary" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-secondary">{integration.name}</p>
                      <p className="max-w-sm text-[15px] text-tertiary">{integration.description}</p>
                    </div>
                  </div>
                  <Button
                    color={integrations[integration.name] ? "secondary" : "primary"}
                    size="sm"
                    onClick={() =>
                      setIntegrations((s) => ({ ...s, [integration.name]: !s[integration.name] }))
                    }
                  >
                    {integrations[integration.name] ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              ))}
            </div>
          </SettingsSection>

          {/* Danger Zone */}
          <SettingsSection
            id="danger"
            title="Danger Zone"
            description="These actions are irreversible. Please proceed with caution."
            tone="danger"
          >
            <SettingsRow label="Deactivate account" description="Temporarily disable your account. You can reactivate anytime by signing in.">
              <div className="flex justify-end">
                <Button color="secondary-destructive" size="sm">
                  Deactivate
                </Button>
              </div>
            </SettingsRow>
            <SettingsRow label="Delete account" description="Permanently delete your account and all associated data.">
              <div className="flex justify-end">
                <Button color="primary-destructive" size="sm">
                  Delete account
                </Button>
              </div>
            </SettingsRow>
          </SettingsSection>
        </div>

        {/* Right column — account summary */}
        <div className="hidden lg:block">
          <SettingsSummary />
        </div>
      </div>
    </>
  );
}
