import { useState } from "react";
import {
  Moon,
  Sun,
  Download,
  Info,
  AlertTriangle,
  ChevronLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { entriesApi } from "@/lib/api";
import { exportAllAsJSON, exportAllAsMarkdown } from "@/lib/export";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { toaster } from "@/components/ui/Toaster";

export function Settings() {
  const { mode, toggle } = useTheme();
  const [exporting, setExporting] = useState<"json" | "md" | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmCount, setDeleteConfirmCount] = useState(0);

  const handleExport = async (format: "json" | "md") => {
    setExporting(format);
    try {
      const data = await entriesApi.list({ limit: 50 });
      let all = [...data.entries];
      let page = 2;
      while (data.pagination && page <= data.pagination.totalPages) {
        const next = await entriesApi.list({ limit: 50, page });
        all = [...all, ...next.entries];
        page++;
      }
      if (format === "json") exportAllAsJSON(all);
      else exportAllAsMarkdown(all);
      toaster.success("Export ready");
    } catch (e) {
      toaster.error((e as Error).message);
    } finally {
      setExporting(null);
    }
  };

  const handleDeleteAll = () => {
    if (deleteConfirmCount < 2) {
      setDeleteConfirmCount((c) => c + 1);
      return;
    }
    toaster.info("Bulk delete not enabled in demo");
    setShowDeleteConfirm(false);
    setDeleteConfirmCount(0);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Link
          to="/diary"
          className="inline-flex items-center gap-2 text-sm text-[rgb(var(--ink-soft))] hover:text-[rgb(var(--accent))]"
        >
          <ChevronLeft className="size-4" /> Back
        </Link>
        <h1 className="font-serif-display text-3xl text-[rgb(var(--ink))]">
          Settings
        </h1>
      </div>

      <section className="mb-6 rounded-2xl border border-[rgb(var(--paper-line))] bg-[rgb(var(--paper-card))] p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[rgb(var(--ink-faint))]">
          Appearance
        </h2>
        <button
          onClick={toggle}
          className="flex w-full items-center justify-between rounded-xl border border-[rgb(var(--paper-line))] px-4 py-3 text-sm text-[rgb(var(--ink))] hover:border-[rgb(var(--accent))]"
        >
          <span className="flex items-center gap-3">
            {mode === "dark" ? (
              <Moon className="size-4 text-[rgb(var(--accent))]" />
            ) : (
              <Sun className="size-4 text-[rgb(var(--accent))]" />
            )}
            {mode === "dark" ? "Dark paper" : "Light paper"}
          </span>
          <span
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${mode === "dark" ? "bg-[rgb(var(--accent))]" : "bg-[rgb(var(--paper-line))]"}`}
          >
            <span
              className={`absolute inline-block size-4 rounded-full bg-white shadow transition-all ${mode === "dark" ? "translate-x-6" : "translate-x-1"}`}
            />
          </span>
        </button>
      </section>

      <section className="mb-6 rounded-2xl border border-[rgb(var(--paper-line))] bg-[rgb(var(--paper-card))] p-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[rgb(var(--ink-faint))]">
          <Download className="size-4" /> Export
        </h2>
        <p className="mb-4 text-sm text-[rgb(var(--ink-soft))]">
          Download all your entries. JSON preserves full formatting; Markdown is
          human-readable.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExport("json")}
            disabled={exporting !== null}
            className="rounded-full bg-[rgb(var(--accent))] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {exporting === "json" ? "Exporting…" : "Export as JSON"}
          </button>
          <button
            onClick={() => handleExport("md")}
            disabled={exporting !== null}
            className="rounded-full border border-[rgb(var(--paper-line))] px-5 py-2.5 text-sm font-medium text-[rgb(var(--ink))] transition-colors hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))] disabled:opacity-50"
          >
            {exporting === "md" ? "Exporting…" : "Export as Markdown"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50/50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-red-500">
          <AlertTriangle className="size-4" /> Danger zone
        </h2>
        <p className="mb-4 text-sm text-[rgb(var(--ink-soft))]">
          Permanently delete all entries, tags, and media. This cannot be
          undone.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="rounded-full bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
        >
          Delete all data
        </button>
      </section>

      <section className="mt-6 rounded-2xl border border-[rgb(var(--paper-line))] bg-[rgb(var(--paper-card))] p-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[rgb(var(--ink-faint))]">
          <Info className="size-4" /> About
        </h2>
        <div className="space-y-2 text-sm text-[rgb(var(--ink-soft))]">
          <p>
            <strong className="text-[rgb(var(--ink))]">Diary</strong> v0.1.0
          </p>
          <p>
            React · TypeScript · Tailwind · Zustand · Express · Prisma ·
            Cloudinary · Neon
          </p>
          <p>Built for personal journaling across devices.</p>
        </div>
      </section>

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteConfirmCount(0);
        }}
        onConfirm={handleDeleteAll}
        title={
          deleteConfirmCount < 2
            ? `Are you sure? (${deleteConfirmCount + 1}/3)`
            : "Final warning"
        }
        message={
          deleteConfirmCount < 2
            ? "This will permanently delete all your journal entries. Continue?"
            : "This is your last confirmation. All data will be destroyed."
        }
        confirmLabel={deleteConfirmCount < 2 ? "Continue" : "Delete everything"}
      />
    </div>
  );
}
