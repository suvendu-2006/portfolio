"use client";

import { useEffect, useState, useRef } from "react";
import { githubUser } from "@/data/content";
import { HairLine } from "@/components/hairline";
import { MaskReveal } from "@/components/mask-reveal";
import { DrawLine } from "@/components/draw-line";
import { CodingStatus } from "@/components/coding-status";

interface Day {
  date: string;
  count: number;
  level: number;
}

const LEVEL_BG = [
  "bg-line/60", // no contributions
  "bg-accent/25",
  "bg-accent/45",
  "bg-accent/70",
  "bg-accent",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CELL = 11;
const GAP = 3;

function formatDayDate(dateStr: string) {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Live GitHub contribution calendar — a year of commits pulled from
 * the public GitHub API (cached server-side for an hour), rendered in
 * the site's own mint palette.
 */
export function GithubActivity() {
  const [data, setData] = useState<{ total: number; days: Day[] } | null>(null);
  const [failed, setFailed] = useState(false);
  const [tooltip, setTooltip] = useState<{
    day: Day;
    x: number;
    y: number;
    flipBelow: boolean;
  } | null>(null);
  const gridWrapperRef = useRef<HTMLDivElement>(null);

  // first view: the cells cascade in as a wave across the year,
  // and the total counts up alongside them
  const panelRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [instant, setInstant] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInstant(true);
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!shown || !data) return;
    if (instant) {
      setCount(data.total);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const dur = 1300;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * data.total));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shown, data, instant]);

  const showTooltip = (day: Day, el: HTMLElement) => {
    const container = gridWrapperRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    const centerX = elRect.left - containerRect.left + elRect.width / 2;
    const topY = elRect.top - containerRect.top;
    const flipBelow = topY < 48;

    setTooltip({
      day,
      x: centerX,
      y: flipBelow ? topY + elRect.height + 6 : topY - 6,
      flipBelow,
    });
  };

  useEffect(() => {
    // the API route caches upstream for an hour, so fetching on mount is
    // effectively free — no need to gate it behind scroll observers
    let alive = true;
    const year = new Date().getFullYear();
    fetch(`/api/github?y=${year}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("api"))))
      .then((d) => {
        if (!alive) return;
        const days: Day[] = Array.isArray(d.contributions) ? d.contributions : [];
        if (!days.length) throw new Error("empty");
        setData({ total: Number(d.total?.[String(year)] ?? 0), days });
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const year = new Date().getFullYear();
  const days = data?.days ?? [];

  // group days into week columns (padding the first week to its weekday)
  const weeks: Array<Day | null>[] = [];
  if (days.length) {
    const firstWeekday = new Date(days[0].date + "T12:00:00Z").getUTCDay();
    const padded: Array<Day | null> = [
      ...Array.from({ length: firstWeekday }, () => null),
      ...days,
    ];
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push(padded.slice(i, i + 7));
    }
  }

  // month labels: mark the column where a month first appears
  const monthLabels: Array<string | null> = [];
  weeks.forEach((week) => {
    const first = week.find((d): d is Day => !!d);
    if (!first) {
      monthLabels.push(null);
      return;
    }
    const month = Number(first.date.slice(5, 7)) - 1;
    const day = Number(first.date.slice(8, 10));
    if (day > 7) {
      monthLabels.push(null);
      return;
    }
    const label = MONTHS[month];
    const prev = monthLabels[monthLabels.length - 1];
    monthLabels.push(label && label !== prev ? label : null);
  });

  const columns = Math.max(weeks.length, 1);
  const gridTemplate = `repeat(${columns}, ${CELL}px)`;

  return (
    <section aria-label="GitHub activity" className="py-20 sm:py-28">
      <HairLine />
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-accent">
          GitHub · Live
        </p>
        <h2 className="text-balance font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          <MaskReveal delay={0.08}>
            Consistent by{" "}
            <span className="relative inline-block font-serif font-medium text-accent">
              habit
              <DrawLine className="bottom-[-6px] h-[2px] bg-accent/70" delay={0.5} />
            </span>
            .
          </MaskReveal>
        </h2>
        <p className="mb-8 mt-3 max-w-xl text-base leading-relaxed text-soft sm:mb-10">
          A year of commits, pulled live from my GitHub. Every square is a day I shipped
          something.
        </p>

        <div ref={panelRef} className="rounded-2xl border border-line bg-panel/50 p-5 sm:p-6">
          {failed ? (
            <p className="py-8 text-center text-sm text-muted">
              GitHub is not responding right now —{" "}
              <a
                href={`https://github.com/${githubUser}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent hover:underline"
              >
                view my profile directly
              </a>
              .
            </p>
          ) : (
            <>
              <p className="font-display text-lg font-bold text-ink sm:text-xl" aria-live="polite">
                {data ? (
                  <>
                    {count.toLocaleString("en-IN")}{" "}
                    <span className="font-medium text-muted">
                      contributions in {year}
                    </span>
                  </>
                ) : (
                  <span className="inline-block h-6 w-52 animate-pulse rounded-md bg-line/70" />
                )}
              </p>

              <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                <CodingStatus />
              </div>

              <div className="scroll-contain mt-5 overflow-x-auto pb-1 [scrollbar-width:thin]">
                <div
                  ref={gridWrapperRef}
                  onMouseLeave={() => setTooltip(null)}
                  style={{ width: columns * (CELL + GAP) }}
                  className="relative select-none"
                >
                  {/* month labels */}
                  <div
                    className="mb-1.5 grid text-left text-[10px] font-medium text-muted"
                    style={{ gridTemplateColumns: gridTemplate, columnGap: GAP }}
                  >
                    {monthLabels.map((label, i) => (
                      <span key={i} className="h-4 whitespace-nowrap">
                        {label ?? ""}
                      </span>
                    ))}
                  </div>
                  {/* the calendar */}
                  <div
                    className="grid grid-rows-7"
                    style={{
                      gridTemplateColumns: gridTemplate,
                      gridAutoFlow: "column",
                      columnGap: GAP,
                      rowGap: GAP,
                    }}
                    role="img"
                    aria-label={`Contribution calendar for ${year}: ${data ? `${data.total} contributions` : "loading"}`}
                  >
                    {(days.length ? weeks : Array.from({ length: 52 }, () => Array(7).fill(null))).map(
                      (week, w) =>
                        week.map((day, d) => {
                          const key = `${year}-${w}-${d}`;
                          const delay = instant ? 0 : Math.min(w * 14 + d * 8, 850);
                          if (!day)
                            return (
                              <span
                                key={key}
                                className="animate-[cell-in_.35s_cubic-bezier(0.22,1,0.36,1)_both] rounded-[3px]"
                                style={{ width: CELL, height: CELL, animationDelay: `${delay}ms` }}
                              >
                                <span className="block" style={{ width: CELL, height: CELL }} />
                              </span>
                            );
                          return (
                            <span
                              key={key}
                              className="animate-[cell-in_.35s_cubic-bezier(0.22,1,0.36,1)_both]"
                              style={{ width: CELL, height: CELL, animationDelay: `${delay}ms` }}
                            >
                              <span
                                onMouseEnter={(e) => showTooltip(day, e.currentTarget)}
                                onTouchStart={(e) => showTooltip(day, e.currentTarget)}
                                className={`block rounded-[3px] transition-all duration-150 cursor-pointer ${
                                  data ? LEVEL_BG[Math.min(day.level, 4)] : "bg-line/40"
                                } hover:scale-125 hover:ring-2 hover:ring-accent hover:z-20`}
                                style={{ width: CELL, height: CELL }}
                              />
                            </span>
                          );
                        })
                    )}
                  </div>

                  {/* interactive floating commit tooltip */}
                  {tooltip && (
                    <div
                      className={`pointer-events-none absolute z-30 transition-transform duration-75 ease-out ${
                        tooltip.flipBelow ? "-translate-x-1/2 translate-y-0" : "-translate-x-1/2 -translate-y-full"
                      }`}
                      style={{
                        left: Math.max(75, Math.min(columns * (CELL + GAP) - 75, tooltip.x)),
                        top: tooltip.y,
                      }}
                    >
                      <div className="whitespace-nowrap rounded-lg border border-line bg-panel/95 px-3 py-1.5 shadow-2xl backdrop-blur-md">
                        <p className="text-xs font-semibold leading-tight text-ink">
                          <span className={tooltip.day.count > 0 ? "text-accent font-bold" : "text-muted"}>
                            {tooltip.day.count === 0
                              ? "No commits"
                              : `${tooltip.day.count} ${tooltip.day.count === 1 ? "commit" : "commits"}`}
                          </span>
                        </p>
                        <p className="mt-0.5 text-[11px] leading-tight text-soft">
                          on {formatDayDate(tooltip.day.date)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted">
                <span className="flex items-center gap-1.5">
                  less
                  {LEVEL_BG.map((bg, i) => (
                    <span key={i} className={`size-2.5 rounded-[2px] ${bg}`} />
                  ))}
                  more
                </span>
                <a
                  href={`https://github.com/${githubUser}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-accent hover:underline"
                >
                  github.com/{githubUser} →
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
