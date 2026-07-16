"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, ArrowBigUp, Bookmark, GitBranch } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useCompose } from "@/contexts/compose-context";
import { createNode } from "@/lib/api/nodes";
import { getHierarchyTree } from "@/lib/api/hierarchy";
import { ApiError, type HierarchyTreeNode, type NodeBlock } from "@/lib/api/types";
import { cx } from "@/utils/cx";

interface BranchOption {
  id: string;
  label: string;
}

// Flatten the hierarchy tree into an indented, selectable list. Only approved
// branches can receive posts (the backend rejects everything else).
function flattenBranches(nodes: HierarchyTreeNode[], depth = 0, acc: BranchOption[] = []): BranchOption[] {
  for (const node of nodes) {
    if (node.status === "approved") {
      acc.push({ id: node.id, label: `${"  ".repeat(depth)}${node.name}` });
    }
    if (node.children?.length) flattenBranches(node.children, depth + 1, acc);
  }
  return acc;
}

const TITLE_MAX = 120;
const SUMMARY_MAX = 280;

export default function ComposePage() {
  const router = useRouter();
  const { status } = useAuth();
  const { notifyPostCreated } = useCompose();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [branchId, setBranchId] = useState("");

  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleRef = useRef<HTMLInputElement>(null);

  const close = () => {
    if (submitting) return;
    router.back();
  };

  // Load branches on mount; focus the title field.
  useEffect(() => {
    setBranchesLoading(true);
    getHierarchyTree()
      .then((tree) => setBranches(flattenBranches(tree)))
      .catch(() => setError("Couldn't load branches. Try again."))
      .finally(() => setBranchesLoading(false));
    const t = setTimeout(() => titleRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) router.back();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [submitting, router]);

  const canSubmit = title.trim().length > 0 && branchId.length > 0 && !submitting;

  // Live-preview values that mirror how the post renders in the detail card.
  const selectedBranchLabel = branches.find((b) => b.id === branchId)?.label.trim() ?? "";
  const previewTags = tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    const bodyBlocks: NodeBlock[] = body.trim() ? [{ type: "text", content: body.trim() }] : [];
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 10);

    setSubmitting(true);
    setError(null);
    try {
      const node = await createNode({
        title: title.trim(),
        summary: summary.trim() || undefined,
        hierarchy_node_id: branchId,
        body: bodyBlocks,
        tags: tagList,
      });
      notifyPostCreated(node);
      // The shell selects the new post; /latest renders it in the detail view.
      router.push("/latest");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.code === "unauthorized"
            ? "Please sign in to post."
            : err.message
          : "Something went wrong. Try again.";
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Write a post"
      className="fixed inset-0 z-50 flex flex-col bg-neutral-50 dark:bg-[#0a0a0a]"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b border-secondary bg-neutral-50/95 px-4 py-3 backdrop-blur dark:bg-[#0a0a0a]/95 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex size-9 items-center justify-center rounded-lg text-quaternary transition-colors hover:bg-secondary hover:text-secondary"
          >
            <X className="size-5" />
          </button>
          <h2 className="text-lg font-semibold text-primary">Write a post</h2>
        </div>
        <button
          type="submit"
          disabled={!canSubmit}
          className={cx(
            "flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white transition-colors",
            canSubmit ? "bg-brand-solid hover:bg-brand-solid_hover" : "cursor-not-allowed bg-neutral-400 dark:bg-neutral-700",
          )}
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {submitting ? "Posting…" : "Post"}
        </button>
      </header>

      {/* Body — left: live preview · right: form */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:gap-12">
          {/* Left: live preview of the detail card */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="canvas-card mx-auto flex w-full max-w-xs flex-col overflow-hidden rounded-2xl border-[0.5px] border-gray-300 bg-white shadow-sm dark:border-neutral-800 dark:bg-[#1a1a1a]">
              <div className="flex flex-col p-3.5">
                {selectedBranchLabel && (
                  <span className="truncate text-xs text-tertiary">{selectedBranchLabel}</span>
                )}

                <p
                  className={cx(
                    "mt-1 line-clamp-2 text-sm font-semibold",
                    title.trim() ? "text-primary" : "text-quaternary",
                  )}
                >
                  {title.trim() || "Your title"}
                </p>

                {summary.trim() && (
                  <p className="mt-1.5 line-clamp-4 text-sm leading-relaxed text-secondary">{summary.trim()}</p>
                )}

                {previewTags.length > 0 && (
                  <div className="mt-2 pb-3 flex flex-wrap gap-1.5">
                    {previewTags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-tertiary"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto flex items-center gap-3 border-t border-secondary pt-3 text-quaternary">
                  <span className="flex items-center gap-1 text-xs">
                    <ArrowBigUp className="size-3.5" />0
                  </span>
                  <span className="flex items-center gap-1 text-xs">
                    <Bookmark className="size-3.5" />0
                  </span>
                  <span className="flex items-center gap-1 text-xs">
                    <GitBranch className="size-3.5" />0
                  </span>
                  <span className="ml-auto text-xs text-tertiary">now</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="compose-title" className="text-sm font-medium text-secondary">
              Title
            </label>
            <input
              id="compose-title"
              ref={titleRef}
              type="text"
              value={title}
              maxLength={TITLE_MAX}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A clear, specific title"
              className="w-full rounded-xl border border-secondary bg-transparent px-3.5 py-2.5 text-base text-primary outline-none placeholder-quaternary focus:border-brand md:text-sm"
            />
          </div>

          {/* Branch */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-secondary">Branch</span>
            {branchesLoading ? (
              <p className="text-sm text-quaternary">Loading branches…</p>
            ) : branches.length === 0 ? (
              <p className="text-sm text-quaternary">No branches available.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {branches.map((b) => {
                  const selected = branchId === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setBranchId(selected ? "" : b.id)}
                      className={cx(
                        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                        selected
                          ? "border-brand bg-brand-solid text-white"
                          : "border-secondary text-secondary hover:bg-secondary hover:text-primary",
                      )}
                    >
                      {b.label.trim()}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="compose-summary" className="text-sm font-medium text-secondary">
              Summary
            </label>
            <input
              id="compose-summary"
              type="text"
              value={summary}
              maxLength={SUMMARY_MAX}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="One line describing the post"
              className="w-full rounded-xl border border-secondary bg-transparent px-3.5 py-2.5 text-base text-primary outline-none placeholder-quaternary focus:border-brand md:text-sm"
            />
          </div>

          {/* Body */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="compose-body" className="text-sm font-medium text-secondary">
              Body
            </label>
            <textarea
              id="compose-body"
              value={body}
              rows={8}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your post…"
              className="w-full resize-y rounded-xl border border-secondary bg-transparent px-3.5 py-2.5 text-base text-primary outline-none placeholder-quaternary focus:border-brand md:text-sm"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="compose-tags" className="text-sm font-medium text-secondary">
              Tags
            </label>
            <input
              id="compose-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="python, decorators"
              className="w-full rounded-xl border border-secondary bg-transparent px-3.5 py-2.5 text-base text-primary outline-none placeholder-quaternary focus:border-brand md:text-sm"
            />
          </div>

          {error && <p className="text-sm text-error-primary">{error}</p>}
          </div>
        </div>
      </div>
    </form>
  );
}
