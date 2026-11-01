import { skills } from "@/data/content";
import { MaskReveal } from "@/components/mask-reveal";
import { Reveal } from "@/components/reveal";
import { Scramble } from "@/components/scramble";
import { DrawLine } from "@/components/draw-line";
import { HairLine } from "@/components/hairline";

export function Skills() {
  return (
    <section id="skills" aria-label="Skills" className="scroll-mt-20 py-20 sm:py-28">
      <HairLine />
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Reveal>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-accent">
              <Scramble text="02 · Skills" />
            </p>
            <h2 className="text-balance font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              <MaskReveal delay={0.08}>
                What I actually{" "}
                <span className="relative inline-block font-serif font-medium text-accent">
                  use
                  <DrawLine className="bottom-[-6px] h-[2px] bg-accent/70" delay={0.5} />
                </span>
              </MaskReveal>
            </h2>
          </Reveal>

          <div>
            {skills.map((skill, i) => (
              <Reveal key={skill.name} delay={i * 0.05}>
                <div
                  className={`group relative flex items-baseline justify-between gap-4 border-t border-line py-5 ${
                    i === skills.length - 1 ? "border-b" : ""
                  }`}
                >
                  {/* accent line that draws down the left edge on hover */}
                  <span
                    aria-hidden="true"
                    className="absolute -left-px bottom-3 top-3 w-0.5 origin-top scale-y-0 rounded-full bg-accent transition-transform duration-500 ease-out group-hover:scale-y-100"
                  />
                  <span className="flex min-w-0 items-baseline gap-3">
                    <span
                      aria-hidden="true"
                      className="ml-2 hidden shrink-0 text-[11px] font-medium tracking-[0.2em] text-accent opacity-0 transition-all duration-500 group-hover:opacity-100 sm:inline"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="inline-block font-display text-2xl font-bold text-ink transition-transform duration-500 ease-out group-hover:translate-x-1.5 sm:text-3xl">
                      {skill.name}
                    </span>
                  </span>
                  {skill.level ? (
                    <span className="shrink-0 rounded-full border border-line px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-soft transition-colors duration-300 group-hover:border-accent/50">
                      {skill.level}
                    </span>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
