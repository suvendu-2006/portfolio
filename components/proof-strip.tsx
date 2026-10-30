"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { proofStrip } from "@/data/content";
import { Reveal } from "@/components/reveal";

/** Counts from 0 to the target once the number scrolls into view. */
function CountUp({ value, delay = 0 }: { value: string; delay?: number }) {
  const target = Number(value.replace(/,/g, ""));
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [display, setDisplay] = useState(() => (reduced ? value : "0"));

  useEffect(() => {
    if (reduced || !inView || Number.isNaN(target)) return;
    let raf = 0;
    let timer = 0;
    const duration = 1400;
    const start = () => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(Math.round(eased * target).toLocaleString("en-IN"));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    timer = window.setTimeout(start, delay);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [inView, reduced, target, delay]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
    </span>
  );
}

export function ProofStrip() {
  return (
    <section aria-label="Key numbers" className="border-y border-line bg-panel/50">
      <div className="mx-auto grid max-w-content grid-cols-1 divide-y divide-line px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
        {proofStrip.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.08} className="py-8 sm:py-10">
            <div className="text-center">
              <p className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                <CountUp value={stat.value} delay={i * 150} />
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
                {stat.label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
