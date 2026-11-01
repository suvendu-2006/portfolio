"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A section divider that draws itself left→right the first time it
 * scrolls into view (same IO + CSS-transition pattern as MaskReveal).
 */
export function HairLine({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
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
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      { rootMargin: "0px 0px -5% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`h-px w-full origin-left bg-line transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        shown ? "scale-x-100" : "scale-x-0"
      } ${className}`}
    />
  );
}
