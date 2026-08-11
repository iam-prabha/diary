import { Sun, Moon, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { mode, toggle } = useTheme();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-[rgb(var(--paper-line))] bg-[rgb(var(--paper))]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/diary" className="flex items-center gap-2">
          <span className="font-serif-display text-2xl text-[rgb(var(--accent))]">
            ✦
          </span>
          <h1 className="font-serif-display text-xl tracking-wide text-[rgb(var(--ink))]">
            Diary
          </h1>
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <div className="mr-1 hidden items-center gap-2 md:flex">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || user.email}
                  className="size-8 rounded-full border border-[rgb(var(--paper-line))]"
                />
              ) : (
                <span className="grid size-8 place-items-center rounded-full border border-[rgb(var(--paper-line))] bg-[rgb(var(--accent-soft))] text-sm font-semibold text-[rgb(var(--ink))]">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </span>
              )}
              <span className="max-w-[140px] truncate text-sm text-[rgb(var(--ink-soft))]">
                {user.name || user.email}
              </span>
            </div>
          )}
          <Link
            to="/settings"
            aria-label="Settings"
            className="grid size-10 place-items-center rounded-full border border-[rgb(var(--paper-line))] text-[rgb(var(--ink-soft))] transition-colors hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))]"
          >
            <Settings className="size-5" />
          </Link>
          <button
            onClick={signOut}
            aria-label="Sign out"
            title="Sign out"
            className="grid size-10 place-items-center rounded-full border border-[rgb(var(--paper-line))] text-[rgb(var(--ink-soft))] transition-colors hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))]"
          >
            <LogOut className="size-5" />
          </button>
          <button
            onClick={toggle}
            aria-label={
              mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            className="grid size-10 place-items-center rounded-full border border-[rgb(var(--paper-line))] text-[rgb(var(--ink-soft))] transition-colors hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))]"
          >
            {mode === "dark" ? (
              <Sun className="size-5" />
            ) : (
              <Moon className="size-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
