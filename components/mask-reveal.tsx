"use client";

import { m } from "framer-motion";

/**
 * Masked line reveal — the text slides up from behind an overflow mask
 * when it enters the viewport. A different language from the hover
 * underline: scroll-triggered, once, editorial.
 */
export function MaskReveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <span className="block overflow-hidden pb-1">
      <m.span
        className="block"
        initial={{ y: "110%" }}
        whileInView={{ y: "0%" }}
        viewport={{ once: true, margin: "0px 0px -8% 0px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      >
        {children}
      </m.span>
    </span>
  );
}
