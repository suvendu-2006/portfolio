"use client";

import { useEffect, useState } from "react";
import { githubUser } from "@/data/content";
import { HairLine } from "@/components/hairline";
import { MaskReveal } from "@/components/mask-reveal";
import { DrawLine } from "@/components/draw-line";

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

/**
 * Live GitHub contribution calendar — a year of commits pulled from
 * the public GitHub API (cached server-side for an hour), rendered in
 * the site's own mint palette.
 */
export function GithubActivity() {
  const [data, setData] = useState<{ total: number; days: Day[] } | null>(null);
  const [failed, setFailed] = useState(false);

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

        <div className="rounded-2xl border border-line bg-panel/50 p-5 sm:p-6">
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
                    {data.total.toLocaleString("en-IN")}{" "}
                    <span className="font-medium text-muted">
                      contributions in {year}
                    </span>
                  </>
                ) : (
                  <span className="inline-block h-6 w-52 animate-pulse rounded-md bg-line/70" />
                )}
              </p>

              <div className="scroll-contain mt-5 overflow-x-auto pb-1 [scrollbar-width:thin]">
                <div style={{ width: columns * (CELL + GAP) }}>
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
                          const key = `${w}-${d}`;
                          if (!day)
                            return <span key={key} className="rounded-[3px]" style={{ width: CELL, height: CELL }} />;
                          return (
                            <span
                              key={key}
                              title={
                                day.count
                                  ? `${day.count} contribution${day.count > 1 ? "s" : ""} on ${day.date}`
                                  : `No contributions on ${day.date}`
                              }
                              className={`rounded-[3px] transition-colors duration-200 ${
                                data ? LEVEL_BG[Math.min(day.level, 4)] : "bg-line/40"
                              }`}
                              style={{ width: CELL, height: CELL }}
                            />
                          );
                        })
                    )}
                  </div>
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
