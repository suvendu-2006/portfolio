"use client";

import { useEffect, useState, useRef, useCallback } from "react";

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
  commitsToday: number;
  lastPushHoursAgo: number | null;
  lastPushRepo: string | null;
}

/**
 * Live developer status — displays real editor work time
 * alongside shipping activity from GitHub.
 *
 * Real-time responsive updates with 0 CDN cache delay.
 */
export function CodingStatus() {
  const [waka, setWaka] = useState<WakaState | null>(null);
  const [wakaHidden, setWakaHidden] = useState(false);
  const [displaySeconds, setDisplaySeconds] = useState<number | null>(null);

  const lastSyncRef = useRef<{ totalSeconds: number; syncedAt: number; active: boolean }>({
    totalSeconds: 0,
    syncedAt: 0,
    active: false,
  });

  const [github, setGithub] = useState<PushState | null>(null);
  const [githubHidden, setGithubHidden] = useState(false);

  const loadWaka = useCallback(async () => {
    try {
      const res = await fetch(`/api/wakatime?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { Pragma: "no-cache" },
      });
      if (res.status === 501 || !res.ok) {
        setWakaHidden(true);
        return;
      }
      const d = await res.json();
      if (d.totalText !== undefined) {
        const secs = Number(d.totalSeconds ?? 0);
        const isActive = !!d.activeNow;
        setWaka({
          totalText: d.totalText,
          hours: d.hours ?? 0,
          minutes: d.minutes ?? 0,
          totalSeconds: secs,
          activeNow: isActive,
          topProject: d.topProject ?? null,
          languages: Array.isArray(d.languages) ? d.languages : [],
        });
        lastSyncRef.current = {
          totalSeconds: secs,
          syncedAt: Date.now(),
          active: isActive,
        };
        setDisplaySeconds(secs);
        setWakaHidden(false);
      }
    } catch {
      /* keep last state on transient network issues */
    }
  }, []);

  useEffect(() => {
    loadWaka();
    // Fast 15-second re-poll when page is open
    const id = window.setInterval(loadWaka, 15000);

    const onFocusOrVisible = () => {
      if (document.visibilityState === "visible") {
        loadWaka();
      }
    };

    window.addEventListener("focus", onFocusOrVisible);
    document.addEventListener("visibilitychange", onFocusOrVisible);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocusOrVisible);
      document.removeEventListener("visibilitychange", onFocusOrVisible);
    };
  }, [loadWaka]);

  // While user is actively coding, tick the live duration in real time
  useEffect(() => {
    if (!waka?.activeNow) return;

    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const { totalSeconds, syncedAt, active } = lastSyncRef.current;
      if (!active) return;
      const elapsed = Math.floor((Date.now() - syncedAt) / 1000);
      setDisplaySeconds(totalSeconds + elapsed);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [waka?.activeNow]);

  useEffect(() => {
    let alive = true;
    const loadGithub = async () => {
      try {
        const res = await fetch(`/api/github-events?_t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          if (alive) setGithubHidden(true);
          return;
        }
        const d = await res.json();
        if (!alive) return;
        setGithub({
          pushesWeek: d.pushesWeek ?? 0,
          commitsWeek: d.commitsWeek ?? 0,
          commitsToday: d.commitsToday ?? 0,
          lastPushHoursAgo: d.lastPushHoursAgo ?? null,
          lastPushRepo: d.lastPushRepo ?? null,
        });
        setGithubHidden(false);
      } catch {
        /* keep last state */
      }
    };

    loadGithub();
    const id = window.setInterval(loadGithub, 60000);

    const onFocusOrVisible = () => {
      if (document.visibilityState === "visible") {
        loadGithub();
      }
    };

    window.addEventListener("focus", onFocusOrVisible);
    document.addEventListener("visibilitychange", onFocusOrVisible);

    return () => {
      alive = false;
      window.clearInterval(id);
      window.removeEventListener("focus", onFocusOrVisible);
      document.removeEventListener("visibilitychange", onFocusOrVisible);
    };
  }, []);

  const totalSecs = displaySeconds ?? (waka ? waka.totalSeconds : 0);
  const showWaka = !wakaHidden && waka !== null && totalSecs > 0;
  const showGithub = !githubHidden && github !== null;

  const currentHours = Math.floor(totalSecs / 3600);
  const currentMinutes = Math.round((totalSecs % 3600) / 60);
  const displayText =
    currentHours > 0
      ? `${currentHours}h ${String(currentMinutes).padStart(2, "0")}m`
      : `${currentMinutes}m`;

  if (!showWaka && !showGithub) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {showWaka ? (
        <div className="inline-flex items-center gap-2.5 rounded-xl border border-line bg-panel/90 px-4 py-2.5 sm:px-5 sm:py-3">
          <span
            className={`size-2 shrink-0 rounded-full ${
              waka.activeNow
                ? "animate-pulse bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                : "bg-emerald-500/80"
            }`}
            aria-hidden="true"
          />
          <span className="font-display text-base font-bold text-ink">
            {displayText}
          </span>
          <span className="text-xs text-muted">coded today</span>
        </div>
      ) : null}

      {showGithub ? (
        <div className="inline-flex items-center gap-2.5 rounded-xl border border-line bg-panel/90 px-4 py-2.5 sm:px-5 sm:py-3">
          <span
            className={`size-2 shrink-0 rounded-full ${
              github.commitsToday > 0 || (github.lastPushHoursAgo !== null && github.lastPushHoursAgo < 3)
                ? "animate-pulse bg-accent shadow-[0_0_8px_rgba(var(--accent-rgb),0.6)]"
                : github.lastPushHoursAgo !== null && github.lastPushHoursAgo < 24
                  ? "bg-accent/70"
                  : "bg-muted"
            }`}
            aria-hidden="true"
          />
          <span className="font-display text-base font-bold text-ink">
            {github.commitsToday > 0
              ? `${github.commitsToday} ${github.commitsToday === 1 ? "commit" : "commits"}`
              : `${github.pushesWeek} ${github.pushesWeek === 1 ? "push" : "pushes"}`}
          </span>
          <span className="text-xs text-muted">
            {github.commitsToday > 0 ? "today on GitHub" : "this week on GitHub"}
          </span>
        </div>
      ) : null}
    </div>
  );
}
