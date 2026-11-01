"use client";

import { useRef } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";

/** The giant outlined wordmark rises into place as the footer scrolls in. */
export function FooterWordmark({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["34%", "0%"]);

  return (
    <m.p
      ref={ref}
      aria-hidden="true"
      style={reduced ? undefined : { y }}
      className="wordmark mt-10 w-fit text-[clamp(52px,13.5vw,176px)]"
    >
      {text}
    </m.p>
  );
}
