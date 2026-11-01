"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { projects, type Project } from "@/data/content";
import { MaskReveal } from "@/components/mask-reveal";
import { Reveal } from "@/components/reveal";
import { Scramble } from "@/components/scramble";
import { DrawLine } from "@/components/draw-line";
import { FadeImage } from "@/components/fade-image";

const statusStyle: Record<Project["status"], string> = {
  live: "border-accent/40 text-accent",
  beta: "border-line text-soft",
  wip: "border-line text-muted",
};

export function Projects() {
  const [open, setOpen] = useState<Project | null>(null);
  const figRefs = useRef<Array<HTMLSpanElement | null>>([]);

  // scroll parallax: each project image drifts inside its frame as the card
  // crosses the viewport — transform-only, single listener, batched
  // read-then-write so there's no layout thrashing
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const update = () => {
      const vh = window.innerHeight;
      const rects = figRefs.current.map((el) => el && el.getBoundingClientRect());
      figRefs.current.forEach((el, i) => {
        const r = rects[i];
        if (!el || !r || r.bottom < 0 || r.top > vh) return;
        const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh));
        el.style.transform = `translate3d(0, ${(p * -5).toFixed(2)}%, 0) scale(1.12)`;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section id="projects" aria-label="Projects" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent">
            <Scramble text="01 · Projects" />
          </p>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
            ({String(projects.length).padStart(2, "0")} works)
          </p>
        </div>
        <h2 className="mb-3 text-balance font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
          <MaskReveal delay={0.08}>
            Things I&rsquo;ve{" "}
            <span className="relative inline-block font-serif font-medium text-accent">
              shipped
              <DrawLine className="bottom-[-6px] h-[2px] bg-accent/70" delay={0.5} />
            </span>
          </MaskReveal>
        </h2>
        <p className="mb-10 max-w-xl text-base leading-relaxed text-soft sm:mb-14">
          Three systems, each solving a problem I personally cared about. Open a case study for the problem, the build, and the result.
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={i * 0.08}>
              <button
                type="button"
                onClick={() => setOpen(project)}
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
                }}
                aria-haspopup="dialog"
                aria-label={`Open the ${project.name} case study`}
                className="spotlight group flex h-full w-full flex-col overflow-hidden rounded-xl border border-line bg-panel text-left transition-all duration-300 ease-out hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.55)]"
              >
                <figure className="card-shine relative aspect-[4/3] overflow-hidden border-b border-line">
                  <span
                    aria-hidden="true"
                    className="ghost-index absolute left-4 top-3 z-[2] text-5xl sm:text-6xl"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    ref={(el) => {
                      figRefs.current[i] = el;
                    }}
                    className="absolute inset-0 will-change-transform"
                    style={{ transform: "scale(1.12)" }}
                  >
                    <FadeImage
                      src={project.image.src}
                      alt={project.image.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
                      className="project-media object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                      priority={i === 0}
                    />
                  </span>
                </figure>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-lg font-bold text-ink">{project.name}</h3>
                    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] ${statusStyle[project.status]}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-soft">
                    {project.tagline}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-sm font-semibold text-accent">
                      Case study
                      <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">
                        →
                      </span>
                    </span>
                    {project.live ? (
                      <span
                        role="link"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(project.live, "_blank", "noopener,noreferrer");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            window.open(project.live, "_blank", "noopener,noreferrer");
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent transition-colors hover:bg-accent hover:text-bg"
                        title={`Visit ${project.name}`}
                      >
                        Visit ↗
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <ProjectModal project={open} onClose={() => setOpen(null)} />
    </section>
  );
}

function ProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const reduced = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project ? (
        <m.div
          className="fixed inset-0 z-[80] overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label={`${project.name} case study`}
            className="mx-auto my-6 max-w-3xl overflow-hidden rounded-2xl border border-line bg-bg"
            initial={reduced ? false : { opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="group relative aspect-[16/9] w-full overflow-hidden border-b border-line sm:aspect-[21/9]">
              <m.div
                className="absolute inset-0"
                initial={reduced ? false : { scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={project.image.src}
                  alt={project.image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </m.div>
              {project.live ? (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-bg/90 px-3 py-1 text-xs font-semibold text-ink backdrop-blur shadow-sm transition-colors group-hover:border-accent group-hover:text-accent"
                  title={`Visit ${project.name}`}
                >
                  <span>Visit</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null}
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close case study"
                className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full border border-line bg-bg/90 text-ink backdrop-blur transition-colors hover:border-muted"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                  {project.name}
                </h3>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] ${statusStyle[project.status]}`}>
                  {project.status}
                </span>
              </div>

                <dl className="mt-6 space-y-5 text-sm leading-relaxed">
                {[
                  ["Problem", project.problem],
                  ["What I built", project.built],
                  ["Result", project.result],
                ].map(([term, def], i) => (
                  <m.div
                    key={term}
                    initial={reduced ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <dt className="text-xs font-medium uppercase tracking-[0.18em] text-accent">{term}</dt>
                    <dd className="mt-1.5 text-soft">{def}</dd>
                  </m.div>
                ))}
                <div>
                  <dt className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Tech used</dt>
                  {project.stack ? (
                    <dd className="mt-2 space-y-3">
                      {(
                        [
                          ["Frontend", project.stack.frontend],
                          ["Backend", project.stack.backend],
                          ["ML stack", project.stack.ml],
                        ] as const
                      ).map(([label, items]) => (
                        <div key={label}>
                          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
                            {label}
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-2">
                            {items.map((item) => (
                              <span key={item} className="rounded-md border border-line px-2.5 py-1 text-xs text-soft">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </dd>
                  ) : (
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {(project.tech ?? []).map((item) => (
                        <span key={item} className="rounded-md border border-line px-2.5 py-1 text-xs text-soft">
                          {item}
                        </span>
                      ))}
                    </dd>
                  )}
                </div>
              </dl>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {project.live ? (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/20"
                  >
                    <span>Visit</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                ) : null}
                {project.repo ? (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-muted hover:text-accent"
                  >
                    <span>View repository</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                ) : null}
              </div>
            </div>
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
