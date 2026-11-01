"use client";

"use client";

import { useEffect, useState } from "react";
import { site, socials } from "@/data/content";
import { LocalTime } from "@/components/local-time";
import { FooterWordmark } from "@/components/footer-wordmark";
import { HairLine } from "@/components/hairline";
import { QuoteDust } from "@/components/quote-dust";

export function Footer() {
  // scroll progress for the back-to-top ring
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const ring = 2 * Math.PI * 21;

  return (
    <footer className="overflow-hidden">
      <HairLine />
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <div className="mt-12 flex justify-center sm:mt-16">
          <div className="w-full max-w-2xl">
            <QuoteDust author="Michael Phelps" />
          </div>
        </div>
        <FooterWordmark text={site.name.split(" ")[0].toUpperCase()} />

        <div className="mt-8 flex flex-col items-center gap-4 border-t border-line py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-xs text-muted sm:flex-row sm:justify-between">
          <p>
            Copyright <span suppressHydrationWarning>{new Date().getFullYear()}</span> {site.name}.
          </p>
          <ul className="flex gap-2">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-2 py-2 transition-colors hover:text-ink"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <LocalTime />
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("shuv:open-terminal"))}
              aria-label="Open terminal"
              title="Open terminal"
              className="inline-block px-2 py-2 font-mono text-muted transition-colors hover:text-accent"
            >
              ~
            </button>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label={`Back to top — ${Math.round(progress * 100)}% scrolled`}
              className="relative grid size-12 place-items-center rounded-full border border-line text-soft transition-colors hover:border-accent/60 hover:text-accent"
            >
              <svg viewBox="0 0 48 48" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
                <circle cx="24" cy="24" r="21" fill="none" stroke="rgb(var(--line))" strokeWidth="1.5" />
                <circle
                  cx="24"
                  cy="24"
                  r="21"
                  fill="none"
                  stroke="rgb(var(--accent))"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray={ring}
                  strokeDashoffset={ring * (1 - progress)}
                />
              </svg>
              <svg viewBox="0 0 24 24" className="relative size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
