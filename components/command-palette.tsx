"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { githubUser } from "@/data/content";

interface Item {
  label: string;
  hint: string;
  icon: ReactNode;
  run: () => void;
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const ico = "size-4 shrink-0";

function HashIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ico} aria-hidden="true" {...stroke}>
      <path d="M9 4L7 20M17 4l-2 16M4 9h16M3 15h16" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ico} aria-hidden="true" {...stroke}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ico} aria-hidden="true" {...stroke}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ico} aria-hidden="true" {...stroke}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}
function TerminalIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ico} aria-hidden="true" {...stroke}>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path d="M7 9.5l3.5 3L7 15.5M12.5 15.5H17" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ico} aria-hidden="true" {...stroke}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </svg>
  );
}
function GithubMark() {
  return (
    <svg viewBox="0 0 24 24" className={ico} fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49l-.01-1.72c-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.3 9.3 0 015 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9l-.01 2.81c0 .27.18.6.69.49A10.06 10.06 0 0022 12.25C22 6.58 17.52 2 12 2z" />
    </svg>
  );
}

/**
 * ⌘K command palette — every section and action on the site, searchable
 * from one overlay. The premium front door to the whole experience.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const email = "iitsuvendu@gmail.com";

  const scrollTo = (id: string | null) => {
    if (id === null) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setOpen(false);
  };

  const groups: Array<{ title: string; items: Item[] }> = [
    {
      title: "navigate",
      items: [
        { label: "Home", hint: "back to the top", icon: <ArrowIcon />, run: () => scrollTo(null) },
        { label: "Projects", hint: "the three systems", icon: <HashIcon />, run: () => scrollTo("projects") },
        { label: "Skills", hint: "what i actually use", icon: <HashIcon />, run: () => scrollTo("skills") },
        { label: "GitHub activity", hint: "live contributions", icon: <HashIcon />, run: () => scrollTo("github") },
        { label: "About", hint: "who is shuv", icon: <HashIcon />, run: () => scrollTo("about") },
        { label: "Contact", hint: "let's build something", icon: <HashIcon />, run: () => scrollTo("contact") },
      ],
    },
    {
      title: "actions",
      items: [
        {
          label: "Toggle theme",
          hint: "dark / light",
                    icon: <SunIcon />,
          run: () => {
            document.getElementById("themeToggle")?.dispatchEvent(
              new MouseEvent("click", {
                bubbles: true,
                clientX: window.innerWidth - 60,
                clientY: 28,
              })
            );
            setOpen(false);
          },
        },
        {
          label: "Book a call",
          hint: "pick a slot in your timezone",
                    icon: <CalendarIcon />,
          run: () => {
            setOpen(false);
            window.setTimeout(() => window.dispatchEvent(new CustomEvent("shuv:open-booking")), 200);
          },
        },
        {
          label: "Open terminal",
          hint: "the secret layer",
                    icon: <TerminalIcon />,
          run: () => {
            setOpen(false);
            window.setTimeout(() => window.dispatchEvent(new CustomEvent("shuv:open-terminal")), 200);
          },
        },
        {
          label: "Copy email",
          hint: email,
                    icon: <MailIcon />,
          run: () => {
            navigator.clipboard?.writeText(email).catch(() => {});
            setOpen(false);
          },
        },
        {
          label: "Open GitHub",
          hint: `github.com/${githubUser}`,
                    icon: <GithubMark />,
          run: () => {
            window.open(`https://github.com/${githubUser}`, "_blank", "noopener");
            setOpen(false);
          },
        },
      ],
    },
  ];

  const query = q.trim().toLowerCase();
  const filtered = groups
    .map((g) => ({ ...g, items: g.items.filter((it) => (it.label + " " + it.hint).toLowerCase().includes(query)) }))
    .filter((g) => g.items.length);
  const flat = filtered.flatMap((g) => g.items);

  // keys: ⌘K / ctrl+K toggles; esc, arrows, enter inside
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("shuv:open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("shuv:open-palette", onOpen);
    };
  }, [open]);

  // reset + focus + lock scroll while open
  useEffect(() => {
    if (!open) return;
    setQ("");
    setActive(0);
    const id = window.setTimeout(() => inputRef.current?.focus(), 60);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = "";
    };
  }, [open]);

  // keep the active item in view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, q]);

  const runItem = (item: Item) => {
    item.run();
  };

  let running = -1;

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        >
          <div
            role="dialog"
            aria-label="Command palette"
            className="mx-auto mt-[12vh] w-[min(560px,92vw)] overflow-hidden rounded-xl border border-line bg-[#0b0b0d]/97 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.85)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
              <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((a) => (a + 1) % Math.max(flat.length, 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => (a - 1 + Math.max(flat.length, 1)) % Math.max(flat.length, 1));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    flat[active]?.run();
                  }
                }}
                placeholder="Type a command or search…"
                aria-label="Search commands"
                spellCheck={false}
                autoComplete="off"
                className="w-full bg-transparent font-mono text-sm text-ink caret-accent outline-none placeholder:text-muted"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted transition-colors hover:text-ink"
              >
                esc
              </button>
            </div>

            <div ref={listRef} className="max-h-[46vh] overflow-y-auto p-2 [scrollbar-width:thin]">
              {flat.length ? (
                filtered.map((g) => (
                  <div key={g.title} className="mb-1">
                    <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                      {g.title}
                    </p>
                    {g.items.map((item) => {
                      running += 1;
                      const idx = running;
                      return (
                        <button
                          key={item.label}
                          data-index={idx}
                          type="button"
                          onMouseEnter={() => setActive(idx)}
                          onClick={() => item.run()}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-100 ${
                            active === idx ? "bg-accent/10 text-accent" : "text-soft"
                          }`}
                        >
                          <span className={active === idx ? "text-accent" : "text-muted"}>{item.icon}</span>
                          <span className="flex-1 text-sm font-medium">{item.label}</span>
                          <span className="text-[11px] text-muted">{item.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                ))
              ) : (
                <p className="px-3 py-8 text-center text-sm text-muted">
                  nothing matches &ldquo;{q}&rdquo;
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-[10px] text-muted">
              <span>↑↓ navigate · ↵ select · esc close</span>
              <span className="font-mono">shuv os v2.0</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
