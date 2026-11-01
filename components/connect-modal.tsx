"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { booking } from "@/data/content";

/* ============================================================
   Time helpers — everything derives from the IST availability
   window and renders in the visitor's timezone (DST-safe).
   ============================================================ */

const IST_TZ = "Asia/Kolkata";

function istTodayYmd(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function istInstant(ymd: string, hhmm: string): number {
  return Date.parse(`${ymd}T${hhmm}:00+05:30`);
}

function timeIn(tz: string, ms: number, hour12: boolean): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12,
  }).format(ms);
}

function prettyTz(tz: string): string {
  return tz.split("/").pop()!.replace(/_/g, " ");
}

/** "Mon–Sat" | "Mon, Wed, Fri" | "Daily" → allowed weekday numbers (Sun=0) */
function allowedWeekdays(days: string): Set<number> {
  const names: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  const out = new Set<number>();
  for (const token of days.split(",")) {
    const t = token.trim().toLowerCase();
    if (t === "daily" || t === "everyday" || t === "all") {
      [0, 1, 2, 3, 4, 5, 6].forEach((d) => out.add(d));
    } else if (t.includes("–") || t.includes("-")) {
      const [a, b] = t.split(/[–-]/).map((s) => names[s.trim().slice(0, 3)]);
      if (a !== undefined && b !== undefined) {
        for (let d = a; ; d = (d + 1) % 7) {
          out.add(d);
          if (d === b) break;
        }
      }
    } else if (names[t.slice(0, 3)] !== undefined) {
      out.add(names[t.slice(0, 3)]);
    }
  }
  return out.size ? out : new Set([1, 2, 3, 4, 5, 6]);
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}

/* ---------- icons ---------- */

const iconCls = "size-3.5 shrink-0 text-accent";
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} aria-hidden="true" {...stroke}>
      <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
      <path d="M15.5 10.5l5-3v9l-5-3" />
    </svg>
  );
}

/* ---------- calendar math ---------- */

interface DayCell {
  ymd: string;
  dayNum: number;
  inMonth: boolean;
  isPast: boolean;
  isToday: boolean;
  allowed: boolean;
}

function buildMonth(view: { y: number; m: number }, allowed: Set<number>): DayCell[] {
  const first = new Date(Date.UTC(view.y, view.m, 1));
  const start = new Date(first);
  start.setUTCDate(1 - first.getUTCDay());
  const todayYmd = istTodayYmd();
  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth();
    const day = d.getUTCDate();
    const ymd = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({
      ymd,
      dayNum: day,
      inMonth: m === view.m,
      isPast: ymd < todayYmd,
      isToday: ymd === todayYmd,
      allowed: allowed.has(d.getUTCDay()),
    });
  }
  return cells;
}

/** 30-minute slots across every IST availability window for one day,
 *  in the visitor's timezone */
function buildSlots(ymd: string, tz: string, hour12: boolean) {
  const now = Date.now();
  const isToday = ymd === istTodayYmd();
  const out: Array<{ instant: number; label: string }> = [];
  for (const w of booking.hours.windows) {
    const [sh, sm] = w.start.split(":").map(Number);
    const [eh, em] = w.end.split(":").map(Number);
    for (let t = sh * 60 + sm; t + 30 <= eh * 60 + em; t += 30) {
      const hh = String(Math.floor(t / 60)).padStart(2, "0");
      const mm = String(t % 60).padStart(2, "0");
      const instant = istInstant(ymd, `${hh}:${mm}`);
      if (isToday && instant < now + 45 * 60 * 1000) continue;
      out.push({ instant, label: timeIn(tz, instant, hour12) });
    }
  }
  return out;
}

/* ============================================================
   The scheduler + trigger
   ============================================================ */

export function ConnectWithMe() {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  const visitorTz = typeof window !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : IST_TZ;
  const allowed = allowedWeekdays(booking.hours.days);

  const now = new Date();
  const [view, setView] = useState(() => ({ y: now.getUTCFullYear(), m: now.getUTCMonth() }));
  const [selYmd, setSelYmd] = useState<string | null>(null);
  const [selSlot, setSelSlot] = useState<number | null>(null);
  const [hour12, setHour12] = useState(true);

  /* connect flow: ask the visitor's name → their initial fills the second
     circle → clicking "Connect with me" slides the two circles together
     and opens the scheduler */
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [bookingStatus, setBookingStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [asking, setAsking] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const connectTimer = useRef<number | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("shuv-visitor");
      if (saved) {
        setVisitorName(saved);
        setConnected(true);
      }
      const savedEmail = sessionStorage.getItem("shuv-visitor-email");
      if (savedEmail) {
        setVisitorEmail(savedEmail);
      }
    } catch {}
    return () => {
      if (connectTimer.current) window.clearTimeout(connectTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const openModal = () => {
    const t = new Date();
    setView({ y: t.getUTCFullYear(), m: t.getUTCMonth() });
    setSelYmd(null);
    setSelSlot(null);
    setBookingStatus("idle");
    setStatusMessage("");
    setOpen(true);
  };

  // the terminal's `book` command hands over to the scheduler
  useEffect(() => {
    const onOpen = () => openModal();
    window.addEventListener("shuv:open-booking", onOpen);
    return () => window.removeEventListener("shuv:open-booking", onOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // completing a booking clears the whole ritual — the next click asks for
  // the name again, fresh, not the same one
  const completeAndReset = () => {
    setOpen(false);
    setVisitorName("");
    setConnected(false);
    setAsking(false);
    setBookingStatus("idle");
    setStatusMessage("");
    try {
      sessionStorage.removeItem("shuv-visitor");
    } catch {}
  };

  const finishConnect = () => {
    const name = visitorName.trim();
    if (!name) {
      nameRef.current?.focus();
      return;
    }
    try {
      sessionStorage.setItem("shuv-visitor", name);
    } catch {}
    setAsking(false);
    setConnected(true);
    connectTimer.current = window.setTimeout(openModal, 650); // let the circles meet
  };

  const onCapsuleClick = () => {
    if (connected) {
      openModal();
      return;
    }
    if (!visitorName.trim()) {
      setAsking(true);
      window.setTimeout(() => nameRef.current?.focus(), 60);
      return;
    }
    finishConnect();
  };

  const cells = buildMonth(view, allowed);
  const currentKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}`;
  const viewKey = `${view.y}-${view.m}`;
  const maxDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 1));
  const atStart = viewKey === currentKey;
  const atEnd = view.y === maxDate.getUTCFullYear() && view.m === maxDate.getUTCMonth();
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(Date.UTC(view.y, view.m, 1)));

  const slots = selYmd ? buildSlots(selYmd, visitorTz, hour12) : [];
  const selDate = selYmd ? new Date(istInstant(selYmd, "12:00")) : null;
  const selDateLabel = selDate
    ? new Intl.DateTimeFormat("en-US", { timeZone: IST_TZ, weekday: "short" }).format(selDate) +
      " " +
      ordinal(Number(selYmd!.slice(8)))
    : "";
  const selSlotLabel = selSlot ? timeIn(visitorTz, selSlot, hour12) : "";

  const confirm = selSlot
    ? booking.meetLink
      ? { href: booking.meetLink, label: "Continue on Google Calendar", external: true }
      : {
          href: `mailto:${booking.email}?subject=${encodeURIComponent(`Meeting request — ${selDateLabel} · ${timeIn(IST_TZ, selSlot, false)} IST`)}&body=${encodeURIComponent(
            `Hi Suvendu!\n\n${visitorName.trim() ? `I'm ${visitorName.trim()}.\n\n` : ""}I'd like to book a 30-minute Google Meet call.\n\nDay: ${selDateLabel}\nSlot: ${timeIn(IST_TZ, selSlot, false)}\u2013${timeIn(IST_TZ, selSlot + 30 * 60 * 1000, false)} IST (${booking.hours.days}, ${booking.hours.windows.map((w) => `${w.start}\u2013${w.end}`).join(" & ")} IST)\nThat's ${selSlotLabel}\u2013${timeIn(visitorTz, selSlot + 30 * 60 * 1000, true)} in my time (${visitorTz}).\n\nThanks!`
          )}`,
          label: "Request this slot",
          external: false,
        }
    : null;

  const visitorInitial = visitorName.trim() ? (Array.from(visitorName.trim())[0] ?? "").toUpperCase() : null;
  const whatsappText = encodeURIComponent(
    visitorName.trim()
      ? `Hi Suvendu! I'm ${visitorName.trim()} — found you via your portfolio. Are you free for a quick call?`
      : "Hi Suvendu! Found you via your portfolio — are you free for a quick call?"
  );

  const rawWhatsapp = booking.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const cleanWhatsapp = rawWhatsapp.replace(/[^0-9]/g, "");
  const whatsappHref = cleanWhatsapp
    ? `https://wa.me/${cleanWhatsapp}?text=${whatsappText}`
    : `https://api.whatsapp.com/send?text=${whatsappText}`;

  const handleRequestSlot = async () => {
    if (!selSlot || !selDateLabel) return;
    const email = visitorEmail.trim();
    if (!email || !email.includes("@")) {
      setStatusMessage("Please enter a valid email so Suvendu can send you the Google Meet link.");
      emailRef.current?.focus();
      return;
    }

    try {
      sessionStorage.setItem("shuv-visitor-email", email);
    } catch {}

    setBookingStatus("sending");
    setStatusMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: visitorName.trim() || "Portfolio Visitor",
          email,
          type: "meeting",
          message: `Google Meet 30-minute call requested from portfolio scheduler for ${selDateLabel} at ${timeIn(IST_TZ, selSlot, false)} IST.`,
          meetingDetails: {
            date: selDateLabel,
            timeIst: `${timeIn(IST_TZ, selSlot, false)}\u2013${timeIn(IST_TZ, selSlot + 30 * 60 * 1000, false)} IST`,
            timeLocal: `${selSlotLabel}\u2013${timeIn(visitorTz, selSlot + 30 * 60 * 1000, true)} in visitor time (${visitorTz})`,
            timezone: visitorTz,
          },
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.ok) {
        setBookingStatus("sent");
        setStatusMessage("✓ Meeting request sent! Notification delivered to Suvendu's Gmail. You'll receive the Google Meet invite shortly.");
      } else {
        setBookingStatus("error");
        setStatusMessage(json.message || "Failed to deliver request. You can open in mail app below.");
      }
    } catch {
      setBookingStatus("error");
      setStatusMessage("Network error. You can open in mail app below.");
    }
  };

  return (
    <>
      <div className="mt-8 inline-flex flex-col items-start">
        {/* the CTA — a quiet card: his "S", a plus, and the visitor's circle.
            Name first; then the circles meet and the scheduler opens. */}
        <button
          type="button"
          onClick={onCapsuleClick}
          className="connect-cta group relative inline-flex items-center gap-3 rounded-2xl bg-panel py-2.5 pl-3 pr-6 text-sm font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent/10"
        >
          <span className={`pair relative z-[2] flex items-center ${connected ? "connected" : ""}`} aria-hidden="true">
            <span className="c-s grid size-9 place-items-center rounded-full bg-accent font-display text-sm font-bold text-bg">
              S
            </span>
            <span className="c-plus">+</span>
            <span
              className={`c-v grid size-9 place-items-center rounded-full border font-display text-sm font-bold ${
                visitorInitial ? "border-accent/60 bg-bg text-accent" : "border-dashed border-muted/60 text-muted"
              }`}
            >
              {visitorInitial ?? "?"}
            </span>
          </span>
          <span className="relative z-[2]">{connected ? "Let's connect" : "Connect with me"}</span>
          <span
            aria-hidden="true"
            className="relative z-[2] transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </button>

        {/* the ask — a small name input while the circles are apart */}
        {asking && !connected ? (
          <m.div
            initial={reduced ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2.5"
          >
            <input
              ref={nameRef}
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") finishConnect();
                if (e.key === "Escape") setAsking(false);
              }}
              placeholder="Your name?"
              aria-label="Your name"
              maxLength={40}
              className="w-52 rounded-full border border-line bg-panel px-4 py-2 text-sm text-ink placeholder:text-muted focus-visible:outline-accent"
            />
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">↵ enter</span>
          </m.div>
        ) : null}
      </div>

      {/* portal to <body>: framer-transformed ancestors would trap position:fixed */}
      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <m.div
                  className="scroll-contain fixed inset-0 z-[80] overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setOpen(false)}
                >
                  <m.div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Book a call with Suvendu"
                    className="relative mx-auto my-6 w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-bg"
                    initial={reduced ? false : { opacity: 0, y: 32, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduced ? undefined : { opacity: 0, y: 24, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6">
                      {/* header */}
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-display text-xl font-extrabold tracking-tight text-ink">
                          Let&rsquo;s connect{visitorName.trim() ? `, ${visitorName.trim()}` : ""}
                          <span className="text-accent">.</span>
                        </h3>
                        <button
                          ref={closeRef}
                          type="button"
                          onClick={() => setOpen(false)}
                          aria-label="Close booking"
                          className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-ink transition-colors hover:border-muted"
                        >
                          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                            <path d="M6 6l12 12M18 6L6 18" />
                          </svg>
                        </button>
                      </div>
                      <p className="mt-1.5 flex items-center gap-x-2 text-xs text-muted">
                        <VideoIcon /> Google Meet
                      </p>

                      {/* one thing at a time: calendar first, then slots */}
                      <div className="mt-6 min-h-[400px]">
                        {selYmd === null && (
                          <div>
                            <div className="flex items-center justify-between">
                            <p className="font-display text-base font-bold text-ink">
                              {monthLabel} <span className="font-medium text-muted">{view.y}</span>
                            </p>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => setView(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }))}
                                disabled={atStart}
                                aria-label="Previous month"
                                className="grid size-8 place-items-center rounded-lg border border-line text-soft transition-colors hover:border-accent/50 hover:text-ink disabled:cursor-default disabled:opacity-35 disabled:hover:border-line disabled:hover:text-soft"
                              >
                                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                  <path d="M14.5 6l-6 6 6 6" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => setView(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }))}
                                disabled={atEnd}
                                aria-label="Next month"
                                className="grid size-8 place-items-center rounded-lg border border-line text-soft transition-colors hover:border-accent/50 hover:text-ink disabled:cursor-default disabled:opacity-35 disabled:hover:border-line disabled:hover:text-soft"
                              >
                                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                  <path d="M9.5 6l6 6-6 6" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                              <span key={d} className="py-1">
                                {d}
                              </span>
                            ))}
                          </div>

                          <div className="mt-1 grid grid-cols-7 gap-1">
                            {cells.map((c) => {
                              const bookable = c.inMonth && c.allowed && !c.isPast;
                              const selected = selYmd === c.ymd;
                              const label = new Intl.DateTimeFormat("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              }).format(new Date(Date.UTC(Number(c.ymd.slice(0, 4)), Number(c.ymd.slice(5, 7)) - 1, Number(c.ymd.slice(8)))));
                              return (
                                <button
                                  key={c.ymd}
                                  type="button"
                                  disabled={!bookable}
                                  aria-label={label + (bookable ? " — available" : "")}
                                  aria-pressed={selected}
                                  onClick={() => {
                                    setSelYmd(c.ymd);
                                    setSelSlot(null);
                                  }}
                                  className={`relative flex aspect-square items-center justify-center rounded-lg text-sm transition-colors duration-200 tabular-nums ${
                                    selected
                                      ? "bg-accent font-semibold text-bg"
                                      : bookable
                                        ? "bg-panel text-ink hover:bg-accent/15"
                                        : "text-muted/40"
                                  }`}
                                >
                                  {c.dayNum}
                                  {c.isToday ? (
                                    <span
                                      aria-hidden="true"
                                      className={`absolute bottom-1 size-1 rounded-full ${selected ? "bg-bg" : "bg-accent"}`}
                                    />
                                  ) : null}
                                </button>
                              );
                            })}
                          </div>
                          </div>
                          )}
                          {selYmd !== null && (
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelYmd(null);
                                    setSelSlot(null);
                                  }}
                                  aria-label="Back to calendar"
                                  className="grid size-8 shrink-0 place-items-center rounded-lg border border-line text-soft transition-colors hover:border-accent/50 hover:text-ink"
                                >
                                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                    <path d="M14.5 6l-6 6 6 6" />
                                  </svg>
                                </button>
                                <p className="flex-1 font-display text-base font-bold text-ink">{selDateLabel}</p>
                                <div className="flex rounded-lg border border-line p-0.5" role="group" aria-label="Time format">
                                  {(["12h", "24h"] as const).map((m12) => (
                                    <button
                                      key={m12}
                                      type="button"
                                      aria-pressed={(m12 === "12h") === hour12}
                                      onClick={() => setHour12(m12 === "12h")}
                                      className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
                                        (m12 === "12h") === hour12 ? "bg-accent text-bg" : "text-muted hover:text-ink"
                                      }`}
                                    >
                                      {m12}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <p className="mt-1 text-[11px] text-muted">times in {prettyTz(visitorTz)}</p>

                          <div className="scroll-contain mt-3 max-h-60 space-y-1.5 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
                            {selYmd ? (
                              slots.length ? (
                                slots.map((s) => (
                                  <button
                                    key={s.instant}
                                    type="button"
                                    aria-pressed={selSlot === s.instant}
                                    onClick={() => setSelSlot(s.instant)}
                                    className={`w-full rounded-lg px-3 py-2.5 text-sm font-medium tabular-nums transition-colors duration-200 ${
                                      selSlot === s.instant
                                        ? "bg-accent text-bg"
                                        : "bg-panel text-ink hover:bg-accent/15"
                                    }`}
                                  >
                                    {s.label}
                                  </button>
                                ))
                              ) : (
                                <p className="py-6 text-center text-xs text-muted">
                                  No slots left for this day — pick another.
                                </p>
                              )
                            ) : (
                              <div className="flex h-full min-h-40 items-center justify-center rounded-xl border border-dashed border-line px-4">
                                <p className="text-center text-xs leading-relaxed text-muted">
                                  Available days are highlighted — tap one to see times in your timezone.
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 min-h-[3.25rem] space-y-2.5">
                            {bookingStatus === "sent" ? (
                              <div className="rounded-xl border border-accent/40 bg-accent/10 p-3.5 text-center">
                                <p className="text-xs font-bold text-accent">
                                  ✓ Meeting request received!
                                </p>
                                <p className="mt-1 text-[11.5px] leading-relaxed text-soft">
                                  Gmail notification delivered to Suvendu. I&rsquo;ll review and email you the Google Meet link!
                                </p>
                                <button
                                  type="button"
                                  onClick={completeAndReset}
                                  className="mt-2.5 inline-block rounded-md bg-accent px-3.5 py-1 text-xs font-semibold text-bg transition-opacity hover:opacity-90"
                                >
                                  Close
                                </button>
                              </div>
                            ) : selSlot ? (
                              booking.meetLink ? (
                                <a
                                  href={booking.meetLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={completeAndReset}
                                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-bg transition-transform duration-300 hover:-translate-y-0.5"
                                >
                                  Continue on Google Calendar
                                  <span aria-hidden="true">→</span>
                                </a>
                              ) : (
                                <div className="space-y-2">
                                  <div className="space-y-1">
                                    <input
                                      ref={emailRef}
                                      type="email"
                                      value={visitorEmail}
                                      onChange={(e) => {
                                        setVisitorEmail(e.target.value);
                                        if (statusMessage) setStatusMessage("");
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleRequestSlot();
                                      }}
                                      placeholder="Your email (to receive Meet invite)"
                                      className="w-full rounded-lg border border-line bg-panel px-3.5 py-2 text-xs text-ink placeholder:text-muted focus-visible:outline-accent"
                                    />
                                    {statusMessage && (
                                      <p className={`text-[11px] ${bookingStatus === "error" ? "text-red-400" : "text-accent"}`}>
                                        {statusMessage}
                                      </p>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    disabled={bookingStatus === "sending"}
                                    onClick={handleRequestSlot}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
                                  >
                                    {bookingStatus === "sending" ? "Sending Request..." : "Request this slot →"}
                                  </button>

                                  {confirm && (
                                    <p className="text-center text-[10px] text-muted">
                                      Prefer email app?{" "}
                                      <a
                                        href={confirm.href}
                                        className="text-soft underline hover:text-ink"
                                      >
                                        Open prefilled draft
                                      </a>
                                    </p>
                                  )}
                                </div>
                              )
                            ) : (
                              <p aria-live="polite" className="text-center text-[11px] leading-relaxed text-muted">
                                {slots.length ? "Select a time — I'll confirm with a Meet link." : "\u00A0"}
                              </p>
                            )}
                          </div>
                            </div>
                          )}
                      </div>

                      <p className="mt-6 border-t border-line pt-4 text-center text-xs text-muted">
                        Prefer typing?{" "}
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-accent hover:underline"
                        >
                          Message me on WhatsApp
                        </a>{" "}
                        — {cleanWhatsapp ? "opens straight into a chat." : "chat with me directly."}
                      </p>
                    </div>
                  </m.div>
                </m.div>
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
    </>
  );
}
