"use client";

import { useEffect, useState } from "react";
import { m, useReducedMotion } from "framer-motion";

type DocumentWithViewTransitions = Document & {
  startViewTransition?: (updateCallback: () => void) => { ready: Promise<void> };
};

/**
 * Theme toggle. Uses the View Transitions API for the circular reveal —
 * the new theme sweeps out from the button with a strong cinematic ease
 * while the old theme dims and sinks beneath it (see the ::view-transition
 * rules in globals.css); falls back to a soft color crossfade where
 * unsupported. The sun/moon icon spins in when it swaps.
 */
export function ThemeToggle() {
  const [light, setLight] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    setLight(document.documentElement.dataset.theme === "light");
  }, []);

  function applyTheme(next: "dark" | "light") {
    if (next === "light") document.documentElement.dataset.theme = "light";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "dark" ? "#0a0a0b" : "#fafaf9");
  }

  function onToggle(e: React.MouseEvent<HTMLButtonElement>) {
    const next = light ? "dark" : "light";
    const apply = () => {
      applyTheme(next);
      setLight(next === "light");
    };

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as DocumentWithViewTransitions;

    if (!doc.startViewTransition || prefersReduced) {
      apply();
      return;
    }

    // capture coordinates synchronously
    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = doc.startViewTransition(apply);
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 750,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  }

  return (
    <button
      type="button"
      id="themeToggle"
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      onClick={onToggle}
      className="grid size-9 place-items-center rounded-full border border-line text-soft transition-colors hover:border-muted hover:text-ink sm:size-8"
    >
      <m.span
        key={light ? "moon" : "sun"}
        className="block"
        initial={reduced ? false : { rotate: -120, scale: 0.5, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {light ? (
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        )}
      </m.span>
    </button>
  );
}
