"use client";

import { m } from "framer-motion";

/**
 * A hairline that draws itself left→right when it enters the viewport.
 * Position it with utility classes (bottom-*, h-*, bg-*) at the call site.
 */
export function DrawLine({
  className = "",
  delay = 0.4,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <m.span
      aria-hidden="true"
      className={`pointer-events-none absolute left-0 block w-full origin-left rounded-full bg-accent/70 ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
