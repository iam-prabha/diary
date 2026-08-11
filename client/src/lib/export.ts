import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { Entry } from "@/types";

function downloadBlob(blob: Blob, filename: string) {
  saveAs(blob, filename);
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 50) || "entry"
  );
}

function entryToMarkdown(entry: Entry): string {
  const date = new Date(entry.createdAt).toLocaleString();
  const tags = entry.tags.map((t) => `#${t.tag.name}`).join(" ");
  return `# ${entry.title}\n\n*${date}*\n\n${entry.contentText}\n\n${tags}\n`;
}

export function exportEntryAsJSON(entry: Entry) {
  const blob = new Blob([JSON.stringify(entry, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, `${slugify(entry.title)}.json`);
}

export function exportEntryAsMarkdown(entry: Entry) {
  const blob = new Blob([entryToMarkdown(entry)], { type: "text/markdown" });
  downloadBlob(blob, `${slugify(entry.title)}.md`);
}

export function exportAllAsJSON(entries: Entry[]) {
  const payload = {
    app: "Diary",
    exportedAt: new Date().toISOString(),
    entries,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  downloadBlob(
    blob,
    `diary-export-${new Date().toISOString().slice(0, 10)}.json`,
  );
}

export async function exportAllAsMarkdown(entries: Entry[]) {
  if (entries.length === 1) {
    const [entry] = entries;
    const blob = new Blob([entryToMarkdown(entry)], { type: "text/markdown" });
    downloadBlob(blob, `${slugify(entry.title)}.md`);
    return;
  }

  const zip = new JSZip();
  const readme = `# Diary Export\n\n${entries.length} entries exported ${new Date().toLocaleString()}\n`;
  zip.file("README.md", readme);
  entries.forEach((entry) =>
    zip.file(`${slugify(entry.title)}.md`, entryToMarkdown(entry)),
  );
  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(
    blob,
    `diary-markdown-${new Date().toISOString().slice(0, 10)}.zip`,
  );
}
