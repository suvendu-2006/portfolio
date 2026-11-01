"use client";

import { useEffect, useRef } from "react";
import { phelpsQuotes } from "@/data/content";

const STEP = 2; // px between sampled particles
const HOLD_MS = 3000;
const ASSEMBLE_MS = 1000;
const DUST_MS = 1500;
const STAGGER_MS = 420; // the dissolve sweeps across the line

interface Particle {
  tx: number;
  ty: number; // assembled position
  dx: number;
  dy: number; // assemble start offset
  vx: number;
  vy: number; // dust drift direction (-1…1)
  delay: number; // per-particle stagger
}

/**
 * Rotating quotes rendered on a canvas — the text is ALWAYS particles:
 * it sweeps in, holds as its dot-matrix self for five seconds, then
 * dissolves in a staggered sweep into the next quote. No mode switch,
 * so the animation can never snag between "text" and "particles".
 * All motion is computed from timestamps — smooth at any frame rate.
 */
export function QuoteDust({ author }: { author: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const srRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const rawFamily = getComputedStyle(canvas).getPropertyValue("--font-serif") || "Georgia, serif";
    const firstFamily = rawFamily.split(",")[0].trim().replace(/^['"]|['"]$/g, "") || "Georgia";
    const inkRaw =
      getComputedStyle(document.documentElement).getPropertyValue("--ink") || "244 244 245";
    const ink = `rgb(${inkRaw.trim().split(/\s+/).join(",")})`;

    let width = 320;
    let cssH = 120;
    let fontSize = 19;
    let lineHeight = 34;
    let wraps: string[][] = phelpsQuotes.map(() => [""]);
    let idx = 0;
    let particles: Particle[] = [];
    let phase: "in" | "hold" | "dust" = "in";
    let t0 = 0;
    let holdUntil = 0;
    let raf = 0;
    let disposed = false;

    const setFont = () => {
      ctx.font = `500 ${fontSize}px "${firstFamily}"`;
    };

    const setup = () => {
      width = canvas.clientWidth || 320;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      fontSize = Math.round(Math.max(16, Math.min(21, width * 0.034)));
      lineHeight = Math.round(fontSize * 1.75);
      setFont();
      let maxLines = 1;
      wraps = phelpsQuotes.map((q) => {
        const lines: string[] = [];
        let line = "";
        for (const word of q.split(" ")) {
          const test = line ? `${line} ${word}` : word;
          if (ctx.measureText(test).width > width - 8 && line) {
            lines.push(line);
            line = word;
          } else {
            line = test;
          }
        }
        if (line) lines.push(line);
        maxLines = Math.max(maxLines, lines.length);
        return lines;
      });
      cssH = maxLines * lineHeight + 8;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      setFont();
    };

    /** paint the current text and read it back as particle targets */
    const sample = (): Particle[] => {
      ctx.clearRect(0, 0, width, cssH);
      ctx.fillStyle = ink;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      wraps[idx].forEach((line, i) => {
        ctx.fillText(line, width / 2, 4 + lineHeight / 2 + i * lineHeight);
      });
      const dpr = canvas.width / width;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const pts: Particle[] = [];
      for (let y = 0; y < canvas.height; y += STEP * dpr) {
        for (let x = 0; x < canvas.width; x += STEP * dpr) {
          const i = (Math.round(y) * canvas.width + Math.round(x)) * 4 + 3;
          if (data[i] > 120) {
            pts.push({
              tx: x / dpr,
              ty: y / dpr,
              dx: 0,
              dy: 0,
              vx: Math.random() * 2 - 1,
              vy: Math.random() * 1.6 - 0.8,
              delay: (x / dpr / width) * STAGGER_MS + Math.random() * 80,
            });
          }
        }
      }
      ctx.clearRect(0, 0, width, cssH);
      return pts;
    };

    const startAssemble = (now: number) => {
      particles = sample();
      for (const p of particles) {
        p.dx = (Math.random() - 0.5) * 150;
        p.dy = (Math.random() - 0.5) * 90;
      }
      phase = "in";
      t0 = now;
    };

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    /** the sharp text, faded by `alpha` — this is what the hold shows */
    const drawCrisp = (alpha: number) => {
      if (alpha <= 0) return;
      ctx.globalAlpha = alpha;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      wraps[idx].forEach((line, i) => {
        ctx.fillText(line, width / 2, 4 + lineHeight / 2 + i * lineHeight);
      });
      ctx.globalAlpha = 1;
    };

    // freeze the whole clock while the quote is off-screen — no battery
    // burn, and the cycle resumes exactly where it left
    let pausedAt: number | null = null;
    let inView = false;
    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!inView && pausedAt === null) pausedAt = performance.now();
      if (inView && pausedAt !== null) {
        const delta = performance.now() - pausedAt;
        pausedAt = null;
        t0 += delta;
        holdUntil += delta;
      }
    });
    visibility.observe(canvas);

    const tick = (now: number) => {
      if (disposed) return;
      if (!inView || pausedAt !== null) {
        raf = requestAnimationFrame(tick);
        return;
      }
      ctx.clearRect(0, 0, width, cssH);
      ctx.fillStyle = ink;

      if (phase === "in") {
        let done = true;
        // dots converge, then the sharp text crossfades in over them —
        // so the handoff is a gradual dissolve, never a swap
        for (const p of particles) {
          const local = Math.max(0, Math.min(1, (now - t0 - p.delay) / ASSEMBLE_MS));
          if (local < 1) done = false;
          const e = easeOut(local);
          const crisp = Math.max(0, Math.min(1, (local - 0.55) / 0.45));
          ctx.globalAlpha = e * (1 - crisp);
          ctx.fillRect(p.tx + p.dx * (1 - e), p.ty + p.dy * (1 - e), 2, 2);
        }
        const minLocal = Math.min(1, (now - t0) / (ASSEMBLE_MS + STAGGER_MS));
        drawCrisp(Math.max(0, Math.min(1, (minLocal - 0.55) / 0.45)));
        if (done) {
          phase = "hold";
          holdUntil = now + HOLD_MS;
        }
      } else if (phase === "hold") {
        drawCrisp(1);
        if (now >= holdUntil) {
          // freeze the crisp text as particles right where it sits
          particles = sample();
          phase = "dust";
          t0 = now;
        }
      } else {
        let done = true;
        // the sharp text fades out quickly while the dots carry the motion
        drawCrisp(1 - Math.min(1, (now - t0) / (DUST_MS * 0.3)));
        for (const p of particles) {
          const local = Math.max(0, Math.min(1, (now - t0 - p.delay) / DUST_MS));
          if (local < 1) done = false;
          const sweep = Math.pow(local, 1.5);
          const px = p.tx + p.vx * 120 * sweep;
          const py = p.ty + p.vy * 52 * sweep + 38 * Math.pow(local, 1.9);
          ctx.globalAlpha = 1 - local;
          ctx.fillRect(px, py, 2, 2);
        }
        ctx.globalAlpha = 1;
        if (done) {
          idx = (idx + 1) % phelpsQuotes.length;
          if (srRef.current) srRef.current.textContent = phelpsQuotes[idx];
          startAssemble(now);
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      setup();
      if (reduced) {
        // reduced motion: no moving particles — a static dot-matrix quote
        // that swaps every HOLD_MS
        particles = sample();
        const staticDraw = () => {
          ctx.clearRect(0, 0, width, cssH);
          ctx.fillStyle = ink;
          drawCrisp(1);
        };
        staticDraw();
        const cycle = window.setInterval(() => {
          idx = (idx + 1) % phelpsQuotes.length;
          if (srRef.current) srRef.current.textContent = phelpsQuotes[idx];
          particles = sample();
          staticDraw();
        }, HOLD_MS);
        return () => {
          disposed = true;
          window.clearInterval(cycle);
          window.removeEventListener("resize", start);
        };
      }
      document.fonts.load(`500 24px "${firstFamily}"`).catch(() => {});
      document.fonts.ready.then(() => {
        if (disposed) return;
        setup();
        startAssemble(performance.now());
      });
      startAssemble(performance.now());
      raf = requestAnimationFrame(tick);
      return () => {
        disposed = true;
        cancelAnimationFrame(raf);
        visibility.disconnect();
        window.removeEventListener("resize", start);
      };
    };

    if (srRef.current) srRef.current.textContent = phelpsQuotes[0];
    const cleanup = start();
    return cleanup;
  }, []);

  return (
    <figure className="mx-auto w-full max-w-2xl text-center">
      <canvas ref={canvasRef} className="block w-full" aria-hidden="true" />
      <span ref={srRef} className="sr-only" />
      <figcaption className="mt-3 text-[11px] font-medium uppercase tracking-[0.24em] text-muted">
        — {author}
      </figcaption>
    </figure>
  );
}
