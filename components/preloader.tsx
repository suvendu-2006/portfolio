"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/* useLayoutEffect that doesn't warn during SSR */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Intro preloader — counter to 100, then the whole curtain lifts and the
 * hero choreography takes over (keyed off html[data-intro] in globals.css).
 * Plays once per browser session; skipped entirely for reduced motion.
 * No JS → component never mounts → page renders normally.
 */
export function Preloader() {
  const [n, setN] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const timers = useRef<number[]>([]);

  useIsoLayoutEffect(() => {
    const html = document.documentElement;
    // a refresh always lands at the very top of the home page —
    // no browser scroll restoration, no hash jump
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);
    const finish = () => {
      html.dataset.intro = "done";
      setLeaving(true);
      timers.current.push(window.setTimeout(() => setGone(true), 780));
    };
    try {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        html.dataset.intro = "done";
        setGone(true);
        return;
      }
      // no session skip — the intro replays on every reload
      html.dataset.intro = "pending";
      const dur = 950;
      const t0 = performance.now();
      let raf = requestAnimationFrame(function tick(now: number) {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setN(Math.round(eased * 100));
        if (p < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          finish();
        }
      });
      return () => cancelAnimationFrame(raf);
    } catch {
      finish();
    }
  }, []);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[89] flex items-center justify-center bg-bg transition-transform duration-[780ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
        leaving ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div
        className={`flex flex-col items-center transition-opacity duration-300 ${
          leaving ? "opacity-0" : "opacity-100"
        }`}
      >
        <span className="font-serif text-6xl text-ink sm:text-7xl">
          Shuv<span className="text-accent">.</span>
        </span>
        <span className="mt-7 h-px w-44 overflow-hidden bg-line">
          <span className="block h-full bg-accent" style={{ width: `${n}%` }} />
        </span>
      </div>

      <span className="absolute bottom-6 left-6 text-[10px] font-medium uppercase tracking-[0.3em] text-muted sm:bottom-8 sm:left-10">
        Suvendu Kumar — Portfolio
      </span>
      <span className="absolute bottom-3 right-6 font-display text-6xl font-extrabold tabular-nums tracking-tight text-ink sm:bottom-6 sm:right-10 sm:text-8xl">
        {n}
        <span className="text-accent">%</span>
      </span>

      <span
        className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-accent"
        style={{ transform: `scaleX(${n / 100})` }}
      />
    </div>
  );
}
