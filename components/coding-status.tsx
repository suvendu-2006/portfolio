"use client";

import { useEffect, useState } from "react";

interface WakaState {
  totalText: string;
  hours: number;
  minutes: number;
  totalSeconds: number;
  activeNow: boolean;
  topProject: string | null;
  languages: string[];
}

interface PushState {
  pushesWeek: number;
  commitsWeek: number;
  lastPushHoursAgo: number | null;
  lastPushRepo: string | null;
}

/**
 * Live developer status — displays real editor work time
 * alongside shipping activity from GitHub.
 *
 * Polled regularly without placeholder or fake states.
 */
export function CodingStatus() {
  const [waka, setWaka] = useState<WakaState | null>(null);
  const [wakaHidden, setWakaHidden] = useState(false);

  const [github, setGithub] = useState<PushState | null>(null);
  const [githubHidden, setGithubHidden] = useState(false);

  useEffect(() => {
    let alive = true;
    const loadWaka = async () => {
      try {
        const res = await fetch("/api/wakatime");
        if (res.status === 501 || !res.ok) {
          if (alive) setWakaHidden(true);
          return;
        }
        const d = await res.json();
        if (!alive) return;
        if (d.totalText !== undefined) {
          setWaka({
            totalText: d.totalText,
            hours: d.hours ?? 0,
            minutes: d.minutes ?? 0,
            totalSeconds: d.totalSeconds ?? 0,
            activeNow: !!d.activeNow,
            topProject: d.topProject ?? null,
            languages: Array.isArray(d.languages) ? d.languages : [],
          });
          setWakaHidden(false);
        }
      } catch {
        /* keep last state on transient network issues */
      }
    };

    loadWaka();
    const id = window.setInterval(loadWaka, 60000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const loadGithub = async () => {
      try {
        const res = await fetch("/api/github-events");
        if (!res.ok) {
          if (alive) setGithubHidden(true);
          return;
        }
        const d = await res.json();
        if (!alive) return;
        setGithub({
          pushesWeek: d.pushesWeek ?? 0,
          commitsWeek: d.commitsWeek ?? 0,
          lastPushHoursAgo: d.lastPushHoursAgo ?? null,
          lastPushRepo: d.lastPushRepo ?? null,
        });
        setGithubHidden(false);
      } catch {
        /* keep last state */
      }
    };

    loadGithub();
    const id = window.setInterval(loadGithub, 300000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  const showWaka = !wakaHidden && waka !== null && waka.totalSeconds > 0;
  const showGithub = !githubHidden && github !== null;

  if (!showWaka && !showGithub) return null;

  return (
    <div className="flex flex-wrap items-stretch gap-3">
      {showWaka ? (
        <div className="inline-flex min-w-[210px] flex-col justify-between gap-2.5 rounded-xl border border-line bg-panel/90 px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="flex items-center gap-2.5 rounded-lg border border-line bg-bg px-3.5 py-2">
            <span
              className={`size-2 shrink-0 rounded-full ${
                waka.activeNow
                  ? "animate-pulse bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                  : "bg-emerald-500/80"
              }`}
              aria-hidden="true"
            />
            <span className="font-display text-base font-bold text-ink">
              {waka.totalText}
            </span>
            <span className="text-xs text-muted">coded today</span>
          </div>

          {waka.topProject ? (
            <p className="text-[11px] text-muted">
              mostly on <span className="font-medium text-soft">{waka.topProject}</span>
            </p>
          ) : null}
        </div>
      ) : null}

      {showGithub ? (
        <div className="inline-flex min-w-[210px] flex-col justify-between gap-2.5 rounded-xl border border-line bg-panel/90 px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="flex items-center gap-2.5 rounded-lg border border-line bg-bg px-3.5 py-2">
            <span
              className={`size-2 shrink-0 rounded-full ${
                github.lastPushHoursAgo !== null && github.lastPushHoursAgo < 3
                  ? "animate-pulse bg-accent shadow-[0_0_8px_rgba(var(--accent-rgb),0.6)]"
                  : github.lastPushHoursAgo !== null && github.lastPushHoursAgo < 24
                    ? "bg-accent/70"
                    : "bg-muted"
              }`}
              aria-hidden="true"
            />
            <span className="font-display text-base font-bold text-ink">
              {github.pushesWeek} {github.pushesWeek === 1 ? "push" : "pushes"}
            </span>
            <span className="text-xs text-muted">this week on GitHub</span>
          </div>

          {github.lastPushRepo ? (
            <p className="text-[11px] text-muted">
              last push on <span className="font-medium text-soft">{github.lastPushRepo}</span>
            </p>
          ) : (
            <p className="text-[11px] text-muted">tracked across active repos</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
