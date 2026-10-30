"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Masked line reveal — the text slides up from behind an overflow mask
 * when it enters the viewport.
 *
 * Two rules learned the hard way:
 * 1. The IntersectionObserver must observe the unclipped WRAPPER, not the
 *    translated child — a child translated 110% down sits fully outside
 *    the overflow mask and never intersects, so the reveal never fires.
 * 2. Use a plain IntersectionObserver + CSS transition instead of framer's
 *    whileInView here — whileInView proved flaky for this nested case.
 */
export function MaskReveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span ref={ref} className="block overflow-hidden pb-1">
      <span
        className="block transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          transform: shown ? "translateY(0%)" : "translateY(110%)",
          transitionDelay: `${delay}s`,
        }}
      >
        {children}
      </span>
    </span>
  );
}
