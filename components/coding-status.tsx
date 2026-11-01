"use client";

import { useEffect, useState } from "react";

interface WakaState {
  totalText: string;
  activeNow: boolean;
  topProject: string | null;
}

/**
 * "Coded today" status card — real editor time from WakaTime, polled
 * every two minutes. Hides itself entirely until WAKATIME_API_KEY is
 * configured (no fake states).
 */
export function CodingStatus() {
  const [state, setState] = useState<WakaState | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/wakatime");
        if (res.status === 501) {
          if (alive) setHidden(true);
          return;
        }
        const d = await res.json();
        if (!alive) return;
        if (d.totalText) {
          setState({ totalText: d.totalText, activeNow: !!d.activeNow, topProject: d.topProject ?? null });
          setHidden(false);
        }
      } catch {
        /* keep the last state; transient network blips shouldn't hide the card */
      }
    };
    load();
    const id = window.setInterval(load, 120000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  if (hidden || !state) return null;

  return (
    <div className="inline-flex flex-col gap-2.5 rounded-xl border border-line bg-panel/90 px-5 py-4">
      <div className="flex items-center gap-2.5">
        <span
          className={`size-2 rounded-full ${
            state.activeNow ? "animate-pulse bg-accent" : "bg-muted"
          }`}
          aria-hidden="true"
        />
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink">
          {state.activeNow ? "Coding now" : "Off the keys"}
        </span>
      </div>
      <div className="flex items-center gap-2.5 rounded-lg border border-line bg-bg px-3.5 py-2">
        <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </svg>
        <span className="font-display text-base font-bold text-ink">{state.totalText}</span>
        <span className="text-xs text-muted">coded today</span>
      </div>
      {state.topProject ? (
        <p className="text-[11px] text-muted">
          mostly on <span className="font-medium text-soft">{state.topProject}</span>
        </p>
      ) : null}
    </div>
  );
}
