"use client";

import { useEffect, useRef } from "react";
import { phelpsQuotes } from "@/data/content";

const STEP = 1.5; // Fine-grained sampling for dense, crisp particles
const HOLD_MS = 3000; // Hold crisp text for exactly 3 seconds
const DUST_MS = 1400; // Organic, gentle dissolve sweep
const ASSEMBLE_MS = 950; // Smooth particle assembly sweep

interface ParticleTarget {
  x: number;
  y: number;
  stagger: number; // 0..1 across line for progressive wave
}

interface ActiveParticle {
  tx: number;
  ty: number;
  origX: number;
  origY: number;
  vx: number;
  vy: number;
  delay: number; // ms
}

interface QuoteData {
  lines: string[];
  targets: ParticleTarget[];
}

/**
 * Rotating quotes rendered on a high-performance, non-blocking canvas:
 * 1. Holds crisp Playfair Display quote for 3 seconds.
 * 2. Dissolves in an organic staggered dust sweep.
 * 3. Immediately transitions into the next quote as particles converge.
 * 4. Zero frozen states, zero stalls on tab switch/sleep with watchdog recovery.
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

    const isLightMode = () => {
      const doc = document.documentElement;
      return (
        doc.dataset.theme === "light" ||
        doc.getAttribute("data-theme") === "light"
      );
    };

    const getInk = () => {
      return isLightMode() ? "rgb(24, 24, 27)" : "rgb(244, 244, 245)";
    };

    const getFontFamily = () => {
      const rawFamily =
        getComputedStyle(canvas).getPropertyValue("--font-serif") ||
        getComputedStyle(document.documentElement).getPropertyValue("--font-serif") ||
        "Georgia, serif";
      const first = rawFamily.split(",")[0].trim().replace(/^['"]|['"]$/g, "");
      return first ? `"${first}", "Playfair Display", Georgia, serif` : `"Playfair Display", Georgia, serif`;
    };

    let width = 320;
    let cssH = 120;
    let fontSize = 18;
    let lineHeight = 32;
    let dpr = 1;
    let quotesData: QuoteData[] = [];
    let idx = 0;
    let activeParticles: ActiveParticle[] = [];
    let phase: "in" | "hold" | "dust" = "hold";
    let t0 = performance.now();
    let holdUntil = performance.now() + HOLD_MS;
    let raf = 0;
    let disposed = false;
    let inView = true;
    let lastTick = performance.now();

    const setFont = () => {
      const family = getFontFamily();
      ctx.font = `italic 400 ${fontSize}px ${family}`;
    };

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const wrapQuote = (text: string, maxWidth: number) => {
      const words = text.split(" ");
      const lines: string[] = [];
      let line = "";
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
      return lines;
    };

    const drawCrisp = (quoteIdx: number, alpha: number) => {
      if (alpha <= 0 || !quotesData[quoteIdx]) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = getInk();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      setFont();
      const quote = quotesData[quoteIdx];
      const totalH = quote.lines.length * lineHeight;
      const startY = (cssH - totalH) / 2 + lineHeight / 2;
      quote.lines.forEach((line, i) => {
        ctx.fillText(line, width / 2, startY + i * lineHeight);
      });
      ctx.restore();
    };

    const setup = () => {
      const newWidth = canvas.clientWidth || (canvas.parentElement?.clientWidth ?? 320);
      width = Math.max(280, newWidth);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      fontSize = Math.round(Math.max(16, Math.min(21, width * 0.036)));
      lineHeight = Math.round(fontSize * 1.72);
      setFont();

      const maxTextWidth = Math.max(260, width - 24);
      const wrappedQuotes = phelpsQuotes.map((q) => wrapQuote(`“${q}”`, maxTextWidth));
      const maxLines = Math.max(...wrappedQuotes.map((lines) => lines.length), 1);
      cssH = maxLines * lineHeight + 18;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      setFont();

      // Pre-sample particle coordinates with high sensitivity (>70 alpha) so thin serifs never clip
      quotesData = wrappedQuotes.map((lines) => {
        ctx.clearRect(0, 0, width, cssH);
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        setFont();
        const totalH = lines.length * lineHeight;
        const startY = (cssH - totalH) / 2 + lineHeight / 2;
        lines.forEach((line, i) => {
          ctx.fillText(line, width / 2, startY + i * lineHeight);
        });

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const targets: ParticleTarget[] = [];
        const step = STEP * dpr;

        for (let y = 0; y < canvas.height; y += step) {
          for (let x = 0; x < canvas.width; x += step) {
            const pixelIdx = (Math.round(y) * canvas.width + Math.round(x)) * 4 + 3;
            if (imgData[pixelIdx] > 70) {
              const canvasX = x / dpr;
              const canvasY = y / dpr;
              targets.push({
                x: canvasX,
                y: canvasY,
                stagger: Math.max(0, Math.min(1, canvasX / width)),
              });
            }
          }
        }
        return { lines, targets };
      });

      ctx.clearRect(0, 0, width, cssH);
    };

    const startAssemble = (targetIdx: number, now: number) => {
      idx = targetIdx;
      if (srRef.current) srRef.current.textContent = phelpsQuotes[idx];
      const quote = quotesData[idx];
      if (!quote || quote.targets.length === 0) {
        phase = "hold";
        holdUntil = now + HOLD_MS;
        return;
      }
      activeParticles = quote.targets.map((tgt) => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 65;
        return {
          tx: tgt.x,
          ty: tgt.y,
          origX: tgt.x + Math.cos(angle) * dist,
          origY: tgt.y + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 1.6,
          vy: Math.random() * 1.2 - 0.6,
          delay: tgt.stagger * 180 + Math.random() * 45,
        };
      });
      phase = "in";
      t0 = now;
    };

    const startDust = (now: number) => {
      const quote = quotesData[idx];
      if (!quote || quote.targets.length === 0) {
        startAssemble((idx + 1) % phelpsQuotes.length, now);
        return;
      }
      activeParticles = quote.targets.map((tgt) => ({
        tx: tgt.x,
        ty: tgt.y,
        origX: tgt.x,
        origY: tgt.y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -0.3 + (Math.random() - 0.5) * 1.2,
        delay: tgt.stagger * 240 + Math.random() * 60,
      }));
      phase = "dust";
      t0 = now;
    };

    const tick = (now: number) => {
      if (disposed) return;
      lastTick = now;

      if (document.hidden || !inView) {
        raf = requestAnimationFrame(tick);
        return;
      }

      // Hard watchdog: if any phase has stalled longer than 7 seconds, auto-recover smoothly
      if (now - t0 > 7000) {
        phase = "hold";
        holdUntil = now + HOLD_MS;
        t0 = now;
        activeParticles = [];
        ctx.clearRect(0, 0, width, cssH);
        drawCrisp(idx, 1);
        raf = requestAnimationFrame(tick);
        return;
      }

      ctx.clearRect(0, 0, width, cssH);
      ctx.fillStyle = getInk();

      if (phase === "in") {
        const elapsed = now - t0;
        const overallProg = Math.min(1, elapsed / ASSEMBLE_MS);
        const eProg = easeOutCubic(overallProg);

        for (const p of activeParticles) {
          const local = Math.max(0, Math.min(1, (elapsed - p.delay) / (ASSEMBLE_MS * 0.85)));
          const e = easeOutCubic(local);

          const curX = p.tx + (p.origX - p.tx) * (1 - e);
          const curY = p.ty + (p.origY - p.ty) * (1 - e);

          // Particles smoothly fade out as crisp text takes over
          const pAlpha = Math.max(0, 1 - Math.max(0, (eProg - 0.3) / 0.7));
          ctx.globalAlpha = pAlpha;
          ctx.fillRect(curX, curY, 2, 2);
        }

        // Crisp text smoothly materializes
        const crispAlpha = Math.max(0, Math.min(1, (eProg - 0.25) / 0.75));
        if (crispAlpha > 0) {
          drawCrisp(idx, crispAlpha);
        }

        if (overallProg >= 1) {
          phase = "hold";
          holdUntil = now + HOLD_MS;
          activeParticles = [];
          ctx.globalAlpha = 1;
          drawCrisp(idx, 1);
        }
      } else if (phase === "hold") {
        ctx.globalAlpha = 1;
        drawCrisp(idx, 1);
        if (now >= holdUntil) {
          startDust(now);
        }
      } else {
        // phase === "dust"
        const elapsed = now - t0;

        // Crisp text gently dissolves in first 400ms
        const crispFade = Math.max(0, 1 - elapsed / 400);
        if (crispFade > 0) {
          drawCrisp(idx, crispFade);
        }

        for (const p of activeParticles) {
          const local = Math.max(0, Math.min(1, (elapsed - p.delay) / DUST_MS));
          if (local > 0) {
            const sweep = Math.pow(local, 1.3);
            const px = p.tx + p.vx * 80 * sweep;
            const py = p.ty + p.vy * 35 * sweep + 22 * Math.pow(local, 1.7);
            ctx.globalAlpha = Math.max(0, 1 - local);
            ctx.fillRect(px, py, 2, 2);
          } else {
            // Particle holding position until staggered dissolve wave reaches it
            ctx.globalAlpha = Math.max(0, 1 - elapsed / 500);
            ctx.fillRect(p.tx, p.ty, 2, 2);
          }
        }
        ctx.globalAlpha = 1;

        if (elapsed >= DUST_MS) {
          startAssemble((idx + 1) % phelpsQuotes.length, now);
        }
      }

      raf = requestAnimationFrame(tick);
    };

    // Viewport intersection observer: only animate when in or near viewport
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
          if (inView) {
            // Ensure rAF is actively looping when visible
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(tick);
          }
        },
        { rootMargin: "150px" }
      );
      observer.observe(canvas);
    }

    // Tab visibility recovery: instantly resume crisp text and restart timer
    const onVisibilityChange = () => {
      if (document.hidden) return;
      const now = performance.now();
      t0 = now;
      holdUntil = now + HOLD_MS;
      phase = "hold";
      activeParticles = [];
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, width, cssH);
      drawCrisp(idx, 1);
      raf = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onVisibilityChange);

    // Watchdog timer: checks every 1000ms. If rAF ever dies or gets stuck, revives it.
    const watchdogInterval = window.setInterval(() => {
      if (disposed) return;
      if (!document.hidden && inView) {
        const timeSinceLastTick = performance.now() - lastTick;
        if (timeSinceLastTick > 600) {
          // rAF loop stalled — revive it immediately
          const now = performance.now();
          t0 = now;
          holdUntil = now + HOLD_MS;
          phase = "hold";
          activeParticles = [];
          cancelAnimationFrame(raf);
          ctx.clearRect(0, 0, width, cssH);
          drawCrisp(idx, 1);
          raf = requestAnimationFrame(tick);
        }
      }
    }, 1000);

    // Re-render immediately on theme change
    const themeObserver = new MutationObserver(() => {
      ctx.clearRect(0, 0, width, cssH);
      drawCrisp(idx, 1);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    let prevW = 0;
    const onResize = () => {
      if (disposed) return;
      const curW = canvas.clientWidth || (canvas.parentElement?.clientWidth ?? 320);
      if (Math.abs(curW - prevW) > 6) {
        prevW = curW;
        setup();
        drawCrisp(idx, 1);
      }
    };
    window.addEventListener("resize", onResize);

    const onCanvasClick = () => {
      startDust(performance.now());
    };
    canvas.addEventListener("click", onCanvasClick);

    // Initial setup
    setup();
    prevW = width;

    if (reduced) {
      drawCrisp(idx, 1);
      const interval = setInterval(() => {
        idx = (idx + 1) % phelpsQuotes.length;
        if (srRef.current) srRef.current.textContent = phelpsQuotes[idx];
        ctx.clearRect(0, 0, width, cssH);
        drawCrisp(idx, 1);
      }, HOLD_MS);

      return () => {
        disposed = true;
        clearInterval(interval);
        clearInterval(watchdogInterval);
        observer?.disconnect();
        themeObserver.disconnect();
        document.removeEventListener("visibilitychange", onVisibilityChange);
        window.removeEventListener("focus", onVisibilityChange);
        window.removeEventListener("resize", onResize);
        canvas.removeEventListener("click", onCanvasClick);
      };
    }

    // Start with the first quote rendered crisply
    drawCrisp(idx, 1);
    phase = "hold";
    holdUntil = performance.now() + HOLD_MS;
    raf = requestAnimationFrame(tick);

    // When web fonts finish loading, update measurements cleanly
    if (document.fonts) {
      document.fonts.ready.then(() => {
        if (disposed) return;
        setup();
        if (phase === "hold") {
          drawCrisp(idx, 1);
        }
      });
    }

    if (srRef.current) srRef.current.textContent = phelpsQuotes[0];

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearInterval(watchdogInterval);
      observer?.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onVisibilityChange);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("click", onCanvasClick);
    };
  }, []);

  return (
    <figure className="mx-auto w-full max-w-2xl text-center select-none">
      <canvas
        ref={canvasRef}
        className="block w-full cursor-pointer"
        aria-hidden="true"
        title="Click to view next quote"
      />
      <span ref={srRef} className="sr-only" />
      <figcaption className="mt-3 text-[11px] font-medium uppercase tracking-[0.24em] text-muted">
        — {author}
      </figcaption>
    </figure>
  );
}
