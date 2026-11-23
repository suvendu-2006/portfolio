import { about, site } from "@/data/content";
import { MaskReveal } from "@/components/mask-reveal";
import { Reveal } from "@/components/reveal";
import { Scramble } from "@/components/scramble";
import { DrawLine } from "@/components/draw-line";
import { HairLine } from "@/components/hairline";

export function About() {
  return (
    <section id="about" aria-label="About" className="scroll-mt-20 py-20 sm:py-28">
      <HairLine />
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Reveal>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-accent">
              <Scramble text="03 · About" />
            </p>
            <h2 className="text-balance font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              <MaskReveal delay={0.08}>
                About{" "}
                <span className="relative inline-block font-serif font-medium text-accent">
                  me
                  <DrawLine className="bottom-[-6px] h-[2px] bg-accent/70" delay={0.5} />
                </span>
              </MaskReveal>
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="max-w-2xl space-y-4">
            {about.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="text-base leading-relaxed text-soft sm:text-lg">
                {paragraph}
              </p>
            ))}
            <p
              className="relative mt-8 inline-block -rotate-2 font-hand text-[clamp(30px,2.6vw,40px)] font-semibold leading-none text-ink"
              aria-hidden="true"
            >
              — {site.short}
              <DrawLine className="bottom-[-9px] h-[3px] bg-accent/50" delay={0.35} />
            </p>

            <dl className="mt-10 border-t border-line">
              {about.facts.map(([term, def]) => (
                <div
                  key={term}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-3.5"
                >
                  <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
                    {term}
                  </dt>
                  <dd className="text-sm font-medium text-ink">{def}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-4 pt-2">
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-accent bg-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-bg transition-all hover:bg-accent/90 active:scale-95"
              >
                <span>See Resume</span>
                <svg
                  className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </a>
              <a
                href="/Suvendu_Kumar_Sahoo_Resume.pdf"
                download="Suvendu_Kumar_Sahoo_Resume.pdf"
                className="inline-flex items-center gap-2 text-xs font-mono text-muted transition-colors hover:text-ink"
              >
                <svg
                  className="size-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                <span>Download PDF (244 KB)</span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
