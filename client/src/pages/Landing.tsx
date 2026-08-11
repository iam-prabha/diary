import { Link } from 'react-router-dom'
import { Lock, PenLine, Download, Sparkles, Search, Feather } from 'lucide-react'

const features = [
  {
    icon: Lock,
    title: 'Private by design',
    description:
      'Sign in with your Google account. Every entry is locked to you — nothing is shared, public, or searchable by others.',
  },
  {
    icon: Feather,
    title: 'Rich journaling',
    description:
      'Write with headings, lists, task lists, quotes, code, highlights, links, and photos. Tag and search to find any thought instantly.',
  },
  {
    icon: Download,
    title: 'Always yours',
    description:
      'Export a single entry or your whole journal as JSON or Markdown — your words stay portable, forever.',
  },
]

const steps = [
  {
    icon: Sparkles,
    title: 'Sign in with Google',
    description: 'One click, no passwords to remember. Your journal is tied to your account.',
  },
  {
    icon: PenLine,
    title: 'Write your thoughts',
    description:
      'A calm, paper-like editor with auto-saved drafts, rich formatting, and photo support.',
  },
  {
    icon: Search,
    title: 'Reflect and find',
    description:
      'Search, filter by tag, and revisit memories. Export anything, anytime.',
  },
]

export function Landing() {
  return (
    <div className="paper-texture flex min-h-screen flex-col">
      <nav className="border-b border-[rgb(var(--paper-line))] bg-[rgb(var(--paper))]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-serif-display text-2xl text-[rgb(var(--accent))]">✦</span>
            <span className="font-serif-display text-xl tracking-wide text-[rgb(var(--ink))]">
              Diary
            </span>
          </div>
          <Link
            to="/login"
            className="rounded-full border border-[rgb(var(--paper-line))] px-5 py-2 text-sm font-medium text-[rgb(var(--ink))] transition-colors hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))]"
          >
            Sign in
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 pb-16 pt-20 text-center">
          <div className="mb-6 grid size-16 place-items-center rounded-full bg-[rgb(var(--accent-soft))]">
            <span className="font-serif-display text-3xl text-[rgb(var(--accent))]">✦</span>
          </div>
          <h1 className="font-serif-display text-5xl leading-tight text-[rgb(var(--ink))] sm:text-6xl">
            Start your thoughts into words
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[rgb(var(--ink-soft))]">
            Diary is a private, paper-themed space for reflection. Write freely,
            organize with tags, and keep your words yours.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--accent))] px-8 py-3.5 text-sm font-medium text-white transition-transform hover:scale-105"
            >
              Get started <span aria-hidden>→</span>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--paper-line))] px-8 py-3.5 text-sm font-medium text-[rgb(var(--ink))] transition-colors hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))]"
            >
              Sign in with Google
            </Link>
          </div>
          <p className="mt-6 text-xs text-[rgb(var(--ink-faint))]">
            Your entries stay private to your Google account.
          </p>
        </section>

        <section className="border-y border-[rgb(var(--paper-line))] bg-[rgb(var(--paper-card))]/60">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="mb-12 text-center font-serif-display text-3xl text-[rgb(var(--ink))]">
              Why you&apos;ll keep coming back
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-[rgb(var(--paper-line))] bg-[rgb(var(--paper-card))] p-6 shadow-sm"
                >
                  <div className="mb-4 grid size-12 place-items-center rounded-full bg-[rgb(var(--accent-soft))]">
                    <f.icon className="size-6 text-[rgb(var(--accent))]" />
                  </div>
                  <h3 className="mb-2 font-serif-display text-xl text-[rgb(var(--ink))]">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[rgb(var(--ink-soft))]">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="mb-12 text-center font-serif-display text-3xl text-[rgb(var(--ink))]">
            How it works
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="relative text-center">
                <div className="mb-4 grid size-12 place-items-center rounded-full border border-[rgb(var(--paper-line))] bg-[rgb(var(--paper-card))] text-[rgb(var(--accent))]">
                  <s.icon className="size-6" />
                </div>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[rgb(var(--ink-faint))]">
                  Step {i + 1}
                </span>
                <h3 className="mb-2 font-serif-display text-xl text-[rgb(var(--ink))]">
                  {s.title}
                </h3>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-[rgb(var(--ink-soft))]">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-[rgb(var(--paper-line))]">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center">
            <h2 className="font-serif-display text-3xl text-[rgb(var(--ink))]">
              Your blank page awaits
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-[rgb(var(--ink-soft))]">
              Sign in and start writing — a thought, a memory, or an idea.
            </p>
            <Link
              to="/login"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[rgb(var(--accent))] px-8 py-3.5 text-sm font-medium text-white transition-transform hover:scale-105"
            >
              Get started
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[rgb(var(--paper-line))] py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-[rgb(var(--ink-faint))] sm:flex-row">
          <span>✦ Diary — your private journal</span>
          <span>React · TypeScript · Express · Prisma · Neon · Cloudinary</span>
        </div>
      </footer>
    </div>
  )
}
