import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useEntries } from "@/stores/useEntries";
import { useTags } from "@/stores/useTags";
import { Editor } from "@/components/editor/Editor";
import { TagInput } from "@/components/tags/TagInput";
import { MediaUploader } from "@/components/media/MediaUploader";
import { Loading } from "@/components/ui/Loading";
import type { Media } from "@/types";
import { toaster } from "@/components/ui/Toaster";

const DRAFT_KEY = "diary-draft";

export function EntryEdit() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { upsertEntry } = useEntries();
  const { tags: allTags, fetchTags } = useTags();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    if (!id) {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft && !hasLoadedOnce.current) {
        try {
          const d = JSON.parse(draft);
          setTitle(d.title ?? "");
          setContent(d.content ?? "");
          setTags(d.tags ?? []);
          setMedia(d.media ?? []);
        } catch {}
      }
      hasLoadedOnce.current = true;
      setLoaded(true);
      return;
    }
    api.get(`/entries/${id}`).then((res) => {
      const e = res.data;
      setTitle(e.title);
      setContent(e.content);
      setTags(e.tags.map((t: { tag: { name: string } }) => t.tag.name));
      setMedia(e.media);
      setLoaded(true);
      hasLoadedOnce.current = true;
    });
  }, [id]);

  useEffect(() => {
    fetchTags(true);
  }, [fetchTags]);

  useEffect(() => {
    setDirty(true);
  }, [title, content, tags, media]);

  useEffect(() => {
    if (!loaded || isEditing) return;
    const timer = setInterval(() => {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ title, content, tags, media }),
      );
    }, 30000);
    return () => clearInterval(timer);
  }, [loaded, isEditing, title, content, tags, media]);

  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    },
    [dirty],
  );

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [handleBeforeUnload]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toaster.error("Title and content are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        content,
        tags,
        media: media.map(
          ({ url, mimeType, size, width, height, cloudinaryId }) => ({
            url,
            mimeType,
            size,
            width,
            height,
            cloudinaryId,
          }),
        ),
      };
      const res = isEditing
        ? await api.patch(`/entries/${id}`, payload)
        : await api.post("/entries", payload);
      upsertEntry(res.data);
      if (!isEditing) localStorage.removeItem(DRAFT_KEY);
      toaster.success("Entry saved");
      navigate(`/entry/${res.data.id}`);
    } catch (e) {
      toaster.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <Loading />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-[rgb(var(--ink-soft))] hover:text-[rgb(var(--accent))]"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          {dirty && (
            <span className="hidden text-xs text-[rgb(var(--ink-faint))] sm:inline">
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--accent))] px-5 py-2 touch-target text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {isEditing ? "Save changes" : "Save entry"}
          </button>
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Entry title…"
        maxLength={200}
        className="mb-4 w-full border-0 bg-transparent font-serif-display text-4xl text-[rgb(var(--ink))] placeholder:text-[rgb(var(--ink-faint))] focus:outline-none"
      />

      <TagInput allTags={allTags} selected={tags} onChange={setTags} />

      <div className="mt-4">
        <Editor content={content} onChange={setContent} />
      </div>

      <div className="mt-6">
        <MediaUploader media={media} onChange={setMedia} />
      </div>
    </div>
  );
}
