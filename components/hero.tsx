"use client";

import { LetterMatrix } from "@/components/letter-matrix";
import { Reveal } from "@/components/reveal";
import { site } from "@/data/content";

export function Hero() {
  return (
    <section
      className="relative flex min-h-svh flex-col overflow-hidden"
      aria-label="Introduction"
    >
      <Reveal className="absolute inset-0" delay={0.1}>
        <LetterMatrix rows={4} cols={7} words={{ 1: "SUVENDU" }} />
      </Reveal>

      {/* vertical ribbon — pulled in from the edge so it's fully visible */}
      <Reveal delay={0.7} className="absolute right-3 top-[34%] z-10 sm:right-5">
        <a
          href="#contact"
          className="rotate-180 rounded-sm bg-accent px-2.5 py-4 text-[10px] font-medium uppercase tracking-[0.22em] text-bg [writing-mode:vertical-rl] transition-transform duration-300 hover:scale-[1.04]"
        >
          Open to internships
        </a>
      </Reveal>

      {/* role side labels */}
      <p className="absolute left-16 top-1/2 -translate-y-1/2 text-sm text-muted sm:left-24 sm:text-base lg:left-28" aria-hidden="true">
        Machine
      </p>
      <p className="absolute right-16 top-1/2 -translate-y-1/2 text-sm text-muted sm:right-24 sm:text-base lg:right-28" aria-hidden="true">
        Learning
      </p>

      {/* corner details, Aki-style */}
      <div className="absolute bottom-6 left-5 text-[13px] leading-relaxed sm:bottom-10 sm:left-8 lg:left-11 lg:bottom-12 lg:text-base">
        <p className="text-muted">Specialized in</p>
        <p className="text-ink">
          <span className="text-accent">※</span> AI &amp; ML
        </p>
      </div>
      <div className="absolute bottom-6 right-5 text-right text-[13px] leading-relaxed sm:bottom-10 sm:right-8 lg:right-11 lg:bottom-12 lg:text-base">
        <p className="text-muted">Curious at heart</p>
        <p className="text-ink">Love for</p>
        <p className="text-ink">
          <span className="text-accent">※</span> AI &amp; Code
        </p>
        <p className="text-ink">&amp; Cricket</p>
      </div>

      {/* education line */}
      <p className="absolute inset-x-0 bottom-[max(108px,15vh)] mx-auto w-fit px-4 text-center text-xs text-muted sm:text-[13px]">
        {`${site.branch} · ${site.college} · ${site.location}`}
      </p>
    </section>
  );
}
