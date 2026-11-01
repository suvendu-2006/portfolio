"use client";

import { useEffect, useState } from "react";

interface PushState {
  pushesWeek: number;
  commitsWeek: number;
  lastPushHoursAgo: number | null;
  lastPushRepo: string | null;
}

/**
 * Live shipping status — real push activity from GitHub's public
 * events, polled every five minutes. States derive from the data:
 * shipping now (recent push) / pushed today / quiet day.
 */
export function CodingStatus() {
  const [state, setState] = useState<PushState | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/github-events");
        if (!res.ok) {
          if (alive) setHidden(true);
          return;
        }
        const d = await res.json();
        if (!alive) return;
        setState({
          pushesWeek: d.pushesWeek ?? 0,
          commitsWeek: d.commitsWeek ?? 0,
          lastPushHoursAgo: d.lastPushHoursAgo ?? null,
          lastPushRepo: d.lastPushRepo ?? null,
        });
        setHidden(false);
      } catch {
        /* keep last state on transient blips */
      }
    };
    load();
    const id = window.setInterval(load, 300000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  if (hidden || !state) return null;

  const { pushesWeek, commitsWeek, lastPushHoursAgo, lastPushRepo } = state;
  const shippingNow = lastPushHoursAgo !== null && lastPushHoursAgo < 3;
  const shippedToday = lastPushHoursAgo !== null && lastPushHoursAgo < 24;

  const label = shippingNow
    ? "Shipping now"
    : shippedToday
      ? "Shipped today"
      : lastPushHoursAgo !== null
        ? `Last push ${Math.round(lastPushHoursAgo)}h ago`
        : "On GitHub";

  return (
    <div className="inline-flex flex-col gap-2.5 rounded-xl border border-line bg-panel/90 px-5 py-4">
      <div className="flex items-center gap-2.5">
        <span
          className={`size-2 rounded-full ${
            shippingNow ? "animate-pulse bg-accent" : shippedToday ? "bg-accent/60" : "bg-muted"
          }`}
          aria-hidden="true"
        />
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2.5 rounded-lg border border-line bg-bg px-3.5 py-2">
        <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </svg>
        <span className="font-display text-base font-bold text-ink">
          {pushesWeek} {pushesWeek === 1 ? "push" : "pushes"}
        </span>
        <span className="text-xs text-muted">this week on GitHub</span>
      </div>
      {lastPushRepo ? (
        <p className="text-[11px] text-muted">
          last push on <span className="font-medium text-soft">{lastPushRepo}</span>
        </p>
      ) : null}
    </div>
  );
}
