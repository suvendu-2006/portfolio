"use client";

import { useEffect, useRef, useState } from "react";
import { projects, site, skills, githubUser } from "@/data/content";

type Kind = "cmd" | "out" | "ok" | "err";
interface Line {
  kind: Kind;
  text: string;
  href?: string;
}

const PROMPT = "visitor@shuv:~$";

const out = (text: string): Line => ({ kind: "out", text });
const ok = (text: string, href?: string): Line => ({ kind: "ok", text, href });
const err = (text: string): Line => ({ kind: "err", text });

/**
 * The secret layer — press ` / ~ anywhere (or type "shuv") and a mini
 * terminal drops in. Everything answers from real site data; `book`
 * hands over to the scheduler, `theme` flips the real toggle.
 * Rendered as plain DOM (no framer) so it can never snag.
 */
export function Terminal() {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const buffer = useRef("");

  const close = () => {
    setOpen(false);
    setValue("");
    dismissHint();
  };

  const dismissHint = () => {
    setHint(false);
    try {
      sessionStorage.setItem("shuv-hint", "1");
    } catch {}
  };

  const run = async (raw: string): Promise<Line[]> => {
    const [cmd] = raw.trim().toLowerCase().split(/\s+/);
    switch (cmd) {
      case "help":
        return [
          out("available commands:"),
          out("  whoami      who is shuv"),
          out("  projects    the three systems"),
          out("  skills      what i actually use"),
          out("  spotify     what's playing right now"),
          out("  github      contributions this year"),
          out("  book        open the scheduler"),
          out("  theme       flip dark / light"),
          out("  contact     where to reach me"),
          out("  clear       wipe the screen"),
          out("  exit        close the terminal"),
        ];
      case "whoami":
        return [
          ok(`${site.name} — ${site.role}.`),
          out(`${site.branch} · ${site.college} · ${site.location}`),
          out("currently building: fraud analytics, document AI, multi-agent systems."),
        ];
      case "projects":
        return projects.flatMap((p) => [
          ok(`${p.name} · ${p.status}`, p.repo),
          out(`   ${p.tagline}`),
        ]);
      case "skills":
        return [
          out(
            skills
              .map((s) => `${s.name.toLowerCase()}${s.level ? ` (${s.level.toLowerCase()})` : ""}`)
              .join(" · ")
          ),
        ];
      case "spotify": {
        try {
          const res = await fetch("/api/spotify");
          const d = await res.json();
          if (!d.title) return [out("spotify is quiet right now — try again later.")];
          return [ok(`${d.playing ? "now playing" : "last played"} — "${d.title}" · ${d.artist}`, d.url)];
        } catch {
          return [err("spotify is quiet right now — try again later.")];
        }
      }
      case "github": {
        try {
          const res = await fetch("/api/github");
          const d = await res.json();
          const total = d.total?.[String(new Date().getFullYear())] ?? 0;
          return [
            ok(`${total} contributions in ${new Date().getFullYear()}.`, `https://github.com/${githubUser}`),
          ];
        } catch {
          return [err("github is not responding — try again later.")];
        }
      }
      case "book":
        window.setTimeout(() => {
          window.dispatchEvent(new CustomEvent("shuv:open-booking"));
          close();
        }, 350);
        return [ok("opening the scheduler…")];
      case "theme": {
        const btn = document.getElementById("themeToggle");
        if (btn) {
          const r = btn.getBoundingClientRect();
          btn.dispatchEvent(
            new MouseEvent("click", {
              bubbles: true,
              clientX: r.x + r.width / 2,
              clientY: r.y + r.height / 2,
            })
          );
        }
        return [ok("flipped.")];
      }
      case "contact":
        return [out("the form at the bottom of the page — or run book.")];
      case "clear":
        return [];
      case "exit":
        close();
        return [];
      case "sudo":
        return [err("nice try — you're already the guest of honor here.")];
      default:
        return [err(`command not found: ${cmd} — try help`)];
    }
  };

  const submit = async () => {
    const raw = value;
    if (!raw.trim()) return;
    setValue("");
    setLines((l) => [...l, { kind: "cmd", text: raw }]);
    setHistory((h) => [raw, ...h].slice(0, 30));
    setHistIdx(null);
    if (raw.trim().toLowerCase() === "clear") {
      setLines([]);
      return;
    }
    const result = await run(raw);
    setLines((l) => [...l, ...result]);
  };

  // global trigger keys + one-time whisper hint
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing =
        t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable;
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "`" || e.key === "~") {
        e.preventDefault();
        dismissHint();
        setOpen((o) => !o);
        return;
      }
      if (/^[a-z]$/i.test(e.key)) {
        buffer.current = (buffer.current + e.key.toLowerCase()).slice(-4);
        if (buffer.current === "shuv") {
          buffer.current = "";
          dismissHint();
          setOpen((o) => !o);
        }
      }
    };
    const onOpen = () => {
      dismissHint();
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("shuv:open-terminal", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("shuv:open-terminal", onOpen);
    };
  }, []);

  // the whisper — once per session, a few seconds in
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("shuv-hint") === "1";
    } catch {}
    if (seen) return;
    const show = window.setTimeout(() => setHint(true), 4500);
    const hide = window.setTimeout(() => dismissHint(), 11000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  // focus + keep the output pinned to the bottom
  useEffect(() => {
    if (open) {
      setLines([
        out(`last login: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })} on shuv-ml.vercel.app`),
        out("type help to see what i can do."),
        out(""),
      ]);
      const id = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, open]);

  return (
    <>
      {/* the whisper — bottom-left, once per session, click to open */}
      {hint && !open ? (
        <button
          type="button"
          onClick={() => {
            dismissHint();
            setOpen(true);
          }}
          className="fixed bottom-24 left-5 z-[105] hidden items-center gap-2 rounded-full border border-line bg-panel/90 px-4 py-2 font-mono text-[11px] text-muted shadow-lg backdrop-blur transition-colors hover:border-accent/50 hover:text-accent sm:flex"
        >
          <span className="text-accent">~</span> psst — press ~ for secrets
        </button>
      ) : null}

      {open ? (
        <div
          role="dialog"
          aria-label="Terminal"
          className="fixed left-1/2 top-4 z-[110] w-[min(680px,92vw)] -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-[#0b0b0d]/97 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md"
        >
          {/* title bar */}
          <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]/70" />
            <span className="size-2.5 rounded-full bg-[#febc2e]/70" />
            <span className="size-2.5 rounded-full bg-[#28c840]/70" />
            <span className="ml-2 font-mono text-[11px] text-muted">
              shuv@portfolio — zsh
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close terminal"
              className="ml-auto rounded-md px-2 py-0.5 font-mono text-[11px] text-muted transition-colors hover:text-ink"
            >
              esc
            </button>
          </div>

          {/* output + input */}
          <div
            ref={bodyRef}
            className="scroll-contain max-h-[46vh] overflow-y-auto px-4 py-3 font-mono text-[13px] leading-6"
          >
            {lines.map((line, i) => (
              <div key={i}>
                {line.kind === "cmd" ? (
                  <span>
                    <span className="text-accent">{PROMPT} </span>
                    <span className="text-ink">{line.text}</span>
                  </span>
                ) : line.href ? (
                  <a
                    href={line.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
                  >
                    {line.text}
                  </a>
                ) : (
                  <span
                    className={
                      line.kind === "err"
                        ? "text-[#ff8a7a]"
                        : line.kind === "ok"
                          ? "text-ink"
                          : "text-soft"
                    }
                  >
                    {line.text}
                  </span>
                )}
              </div>
            ))}

            <div className="flex items-center gap-2">
              <span className="shrink-0 text-accent">{PROMPT}</span>
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submit();
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    const next = histIdx === null ? 0 : Math.min(histIdx + 1, history.length - 1);
                    if (history[next] !== undefined) {
                      setHistIdx(next);
                      setValue(history[next]);
                    }
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    if (histIdx === null) return;
                    const next = histIdx - 1;
                    if (next < 0) {
                      setHistIdx(null);
                      setValue("");
                    } else {
                      setHistIdx(next);
                      setValue(history[next]);
                    }
                  }
                }}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                aria-label="Terminal command"
                className="w-full bg-transparent font-mono text-[13px] text-ink caret-accent outline-none placeholder:text-muted"
                placeholder="type a command — help"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
