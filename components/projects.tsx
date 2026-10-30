"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { projects, type Project } from "@/data/content";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";

const statusStyle: Record<Project["status"], string> = {
  live: "border-accent/40 text-accent",
  beta: "border-line text-soft",
  wip: "border-line text-muted",
};

export function Projects() {
  const [open, setOpen] = useState<Project | null>(null);

  return (
    <section id="projects" aria-label="Projects" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <SectionHeading
          index="01 · Projects"
          title="Things I've shipped"
          description="Three systems, each solving a problem I personally cared about. Open a case study for the problem, the build, and the result."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={i * 0.08}>
              <button
                type="button"
                onClick={() => setOpen(project)}
                aria-haspopup="dialog"
                aria-label={`Open the ${project.name} case study`}
                className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-line bg-panel text-left transition-all duration-300 ease-out hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.55)]"
              >
                <figure className="card-shine relative aspect-[4/3] overflow-hidden border-b border-line">
                  <Image
                    src={project.image.src}
                    alt={project.image.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
                    className="object-cover object-top"
                    priority={i === 0}
                  />
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
                  <p className="mt-4 flex items-center gap-1 text-sm font-semibold text-accent">
                    Case study
                    <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">
                      →
                    </span>
                  </p>
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
            initial={reduced ? false : { opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[21/9] w-full border-b border-line">
              <Image
                src={project.image.src}
                alt={project.image.alt}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close case study"
                className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-line bg-bg/90 text-ink backdrop-blur transition-colors hover:border-muted"
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
                ].map(([term, def]) => (
                  <div key={term}>
                    <dt className="text-xs font-medium uppercase tracking-[0.18em] text-accent">{term}</dt>
                    <dd className="mt-1.5 text-soft">{def}</dd>
                  </div>
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

              {project.repo ? (
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-muted"
                  >
                    View repo ↗
                  </a>
                </div>
              ) : null}
            </div>
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
