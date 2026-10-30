import { about, site } from "@/data/content";
import { MaskReveal } from "@/components/mask-reveal";
import { Reveal } from "@/components/reveal";

export function About() {
  return (
    <section id="about" aria-label="About" className="scroll-mt-20 border-t border-line py-20 sm:py-28">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Reveal>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-accent">
              03 · About
            </p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              <MaskReveal delay={0.08}>About me</MaskReveal>
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="max-w-2xl space-y-4">
            {about.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="text-base leading-relaxed text-soft sm:text-lg">
                {paragraph}
              </p>
            ))}
            <p
              className="mt-8 inline-block -rotate-2 font-hand text-[clamp(30px,2.6vw,40px)] font-semibold leading-none text-ink"
              aria-hidden="true"
            >
              — {site.short}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
