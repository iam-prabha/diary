import { authApi } from "@/lib/api";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

export function Login() {
  const [searchParams] = useSearchParams();
  const authError = searchParams.get("auth") === "error";

  useEffect(() => {
    if (authError) {
      const params = new URLSearchParams(window.location.search);
      params.delete("auth");
      const next = params.toString();
      window.history.replaceState({}, "", next ? `?${next}` : window.location.pathname);
    }
  }, [authError]);

  return (
    <div className="paper-texture flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-[rgb(var(--paper-line))] bg-[rgb(var(--paper-card))] p-10 text-center shadow-xl">
        <div className="mb-2 font-serif-display text-5xl text-[rgb(var(--accent))]">✦</div>
        <h1 className="font-serif-display text-2xl text-[rgb(var(--ink))]">Diary</h1>
        <p className="mt-2 text-sm text-[rgb(var(--ink-soft))]">
          Your private space to write, reflect, and remember.
        </p>

        {authError && (
          <p className="mt-4 rounded-lg bg-[rgb(var(--accent-soft))] px-3 py-2 text-xs text-[rgb(var(--ink))]">
            Sign-in failed. Please try again.
          </p>
        )}

        <a
          href={authApi.googleUrl()}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[rgb(var(--accent))] px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#fff"
              d="M21.35 11.1H12v2.9h5.35c-.5 2.5-2.6 4.2-5.35 4.2-3.2 0-5.8-2.6-5.8-5.8s2.6-5.8 5.8-5.8c1.5 0 2.9.55 3.9 1.6l2.1-2.1C16.7 4.3 14.5 3.4 12 3.4c-4.75 0-8.6 3.85-8.6 8.6s3.85 8.6 8.6 8.6c4.6 0 8.15-3.2 8.15-8.8 0-.5-.05-1-.15-1.5z"
            />
          </svg>
          Sign in with Google
        </a>

        <p className="mt-6 text-[11px] text-[rgb(var(--ink-faint))]">
          Your entries stay private to your Google account.
        </p>
      </div>
    </div>
  );
}
