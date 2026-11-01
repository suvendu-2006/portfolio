"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { LetterMatrix } from "@/components/letter-matrix";
import { site } from "@/data/content";

const at = (d: string) => ({ "--d": d }) as CSSProperties;

export function Hero() {
  // the whole hero sinks and fades as you scroll away — cinematic exit
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const vh = window.innerHeight;
        if (y <= vh && heroRef.current) {
          const p = y / vh;
          heroRef.current.style.transform = `translate3d(0, ${y * 0.35}px, 0)`;
          heroRef.current.style.opacity = String(1 - p * 0.9);
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-svh flex-col overflow-hidden"
      aria-label="Introduction"
    >
      <div className="hero-in absolute inset-0" style={at("0.05s")}>
        <LetterMatrix rows={4} cols={7} words={{ 1: "SUVENDU" }} />
      </div>

      {/* vertical ribbon — pulled in from the edge so it's fully visible */}
      <div
        className="hero-slide absolute right-3 top-[34%] z-10 sm:right-5"
        style={at("0.9s")}
      >
        <a
          href="#contact"
          className="rotate-180 rounded-sm bg-accent px-2.5 py-4 text-[10px] font-medium uppercase tracking-[0.22em] text-bg [writing-mode:vertical-rl] transition-transform duration-300 hover:scale-[1.04]"
        >
          Open to work
        </a>
      </div>

      {/* inset hairline frame, Aki-style */}
      <div
        aria-hidden="true"
        className="hero-frame pointer-events-none absolute inset-2 border border-line/70 sm:inset-3"
        style={at("0.2s")}
      />

      {/* role side labels — desktop only, they crowd the word on phones */}
      <p
        aria-hidden="true"
        className="hero-track absolute left-16 top-1/2 hidden -translate-y-1/2 text-sm text-muted sm:block sm:left-24 sm:text-base lg:left-28"
        style={at("0.65s")}
      >
        Machine
      </p>
      <p
        aria-hidden="true"
        className="hero-track absolute right-16 top-1/2 hidden -translate-y-1/2 text-sm text-muted sm:block sm:right-24 sm:text-base lg:right-28"
        style={at("0.65s")}
      >
        Learning
      </p>

      {/* corner details, Aki-style */}
      <div
        className="hero-in absolute bottom-6 left-5 text-[13px] leading-relaxed sm:bottom-10 sm:left-8 lg:left-11 lg:bottom-12 lg:text-base"
        style={at("0.45s")}
      >
        <p className="text-muted">Specialized in</p>
        <p className="text-ink">
          <span className="text-accent">※</span> AI &amp; ML
        </p>
        <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
          20.29° N · 85.82° E
        </p>
      </div>
      <div
        className="hero-in absolute bottom-6 right-5 text-right text-[13px] leading-relaxed sm:bottom-10 sm:right-8 lg:right-11 lg:bottom-12 lg:text-base"
        style={at("0.55s")}
      >
        <p className="text-muted">Curious at heart</p>
        <p className="text-ink">Love for</p>
        <p className="text-ink">
          <span className="text-accent">※</span> AI &amp; Code
        </p>
        <p className="text-ink">&amp; Cricket</p>
      </div>

      {/* education line */}
      <p
        className="hero-in absolute inset-x-0 bottom-[max(108px,15vh)] mx-auto w-fit px-4 text-center text-xs text-muted sm:text-[13px]"
        style={at("0.75s")}
      >
        {`${site.branch} · ${site.college} · ${site.location}`}
      </p>

      {/* scroll hint — a dot forever travelling down the line */}
      <div
        aria-hidden="true"
        className="hero-in absolute inset-x-0 bottom-5 flex flex-col items-center gap-2"
        style={at("1.15s")}
      >
        <span className="text-[9px] font-medium uppercase tracking-[0.32em] text-muted">
          scroll
        </span>
        <span className="relative block h-10 w-px overflow-hidden bg-line">
          <span className="absolute inset-x-0 top-0 h-4 animate-[scrollhint_2.2s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-accent" />
        </span>
      </div>
    </section>
  );
}
