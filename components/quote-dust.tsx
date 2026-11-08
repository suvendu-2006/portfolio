"use client";

import { useEffect, useRef } from "react";
import { phelpsQuotes } from "@/data/content";

const STEP = 1.5; // Fine-grained sampling for dense, silky dust particles
const HOLD_MS = 2000; // Hold crisp text for 2 seconds before switching
const TRANSITION_MS = 1800; // Total duration of overlapping dust transition

interface ParticleTarget {
  x: number;
  y: number;
  stagger: number; // 0..1 across line for progressive wave
}

interface OutgoingParticle {
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  seed: number;
  delay: number; // ms
}

interface IncomingParticle {
  tx: number;
  ty: number;
  origX: number;
  origY: number;
  delay: number; // ms
}

interface QuoteData {
  lines: string[];
  targets: ParticleTarget[];
}

/**
 * Rotating quotes rendered on a high-performance canvas:
 * - 2-second hold of crisp, elegant Playfair Display typography.
 * - Buttery-smooth overlapping particle transition: the outgoing quote
 *   dissolves into a gentle starry mist while the incoming quote simultaneously
 *   coalesces from ambient dust, seamlessly crossfading into crisp text.
 * - Zero abrupt cuts, zero empty gaps, fully resilient to tab switches and sleep.
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
    let curIdx = 0;
    let nextIdx = 1;

    let outgoingParticles: OutgoingParticle[] = [];
    let incomingParticles: IncomingParticle[] = [];

    let phase: "hold" | "transition" = "hold";
    let holdUntil = performance.now() + HOLD_MS;
    let transStart = 0;

    let raf = 0;
    let disposed = false;
    let inView = true;
    let lastTick = performance.now();

    const setFont = () => {
      const family = getFontFamily();
      ctx.font = `italic 400 ${fontSize}px ${family}`;
    };

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const easeInQuad = (t: number) => t * t;

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

      // Pre-sample particle coordinates for all quotes
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
            if (imgData[pixelIdx] > 65) {
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

    const startTransition = (now: number) => {
      const outQuote = quotesData[curIdx];
      nextIdx = (curIdx + 1) % phelpsQuotes.length;
      const inQuote = quotesData[nextIdx];

      if (!outQuote || !inQuote) {
        curIdx = nextIdx;
        phase = "hold";
        holdUntil = now + HOLD_MS;
        return;
      }

      // Prepare outgoing dust particles
      outgoingParticles = outQuote.targets.map((tgt) => ({
        tx: tgt.x,
        ty: tgt.y,
        vx: (Math.random() - 0.5) * 1.8,
        vy: -0.35 + (Math.random() - 0.5) * 1.3,
        seed: Math.random() * 100,
        delay: tgt.stagger * 260 + Math.random() * 60,
      }));

      // Prepare incoming assembling particles
      incomingParticles = inQuote.targets.map((tgt) => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 32 + Math.random() * 65;
        return {
          tx: tgt.x,
          ty: tgt.y,
          origX: tgt.x + Math.cos(angle) * dist,
          origY: tgt.y + Math.sin(angle) * dist,
          delay: tgt.stagger * 180 + Math.random() * 50,
        };
      });

      transStart = now;
      phase = "transition";
    };

    const tick = (now: number) => {
      if (disposed) return;
      lastTick = now;

      if (document.hidden || !inView) {
        raf = requestAnimationFrame(tick);
        return;
      }

      ctx.clearRect(0, 0, width, cssH);
      ctx.fillStyle = getInk();

      if (phase === "hold") {
        ctx.globalAlpha = 1;
        drawCrisp(curIdx, 1);
        if (now >= holdUntil) {
          startTransition(now);
        }
      } else {
        // phase === "transition"
        const elapsed = now - transStart;

        // --- 1. OUTGOING QUOTE DISSOLVE ---
        // Crisp text of outgoing quote gently fades out in the first 400ms
        const crispOutFade = Math.max(0, 1 - easeInQuad(Math.min(1, elapsed / 400)));
        if (crispOutFade > 0) {
          drawCrisp(curIdx, crispOutFade);
        }

        // Outgoing dust particles drift and disperse upward and outward
        for (const p of outgoingParticles) {
          const localElapsed = elapsed - p.delay;
          if (localElapsed > 0) {
            const prog = Math.min(1, localElapsed / 1150);
            const sweep = Math.pow(prog, 1.3);
            const px = p.tx + p.vx * 70 * sweep + Math.sin(prog * 3.5 + p.seed) * 8;
            const py = p.ty + p.vy * 32 * sweep - 16 * Math.pow(prog, 1.5);
            const alpha = Math.max(0, Math.pow(1 - prog, 1.8));

            if (alpha > 0.01) {
              ctx.globalAlpha = alpha;
              ctx.fillRect(px, py, 1.5, 1.5);
            }
          } else {
            // Particle holds until staggered dissolve wave sweeps through
            const preAlpha = Math.max(0, 1 - elapsed / 400);
            if (preAlpha > 0.01) {
              ctx.globalAlpha = preAlpha;
              ctx.fillRect(p.tx, p.ty, 1.5, 1.5);
            }
          }
        }

        // --- 2. INCOMING QUOTE ASSEMBLY (Seamlessly overlapping!) ---
        // Incoming particles start converging at 260ms into the transition
        const inElapsed = elapsed - 260;
        if (inElapsed > 0) {
          const inTotalProg = Math.min(1, inElapsed / 1400);
          const inEase = easeOutCubic(inTotalProg);

          for (const p of incomingParticles) {
            const localIn = Math.max(0, Math.min(1, (inElapsed - p.delay) / 950));
            const e = easeOutCubic(localIn);

            const curX = p.tx + (p.origX - p.tx) * (1 - e);
            const curY = p.ty + (p.origY - p.ty) * (1 - e);

            // Particles fade in smoothly as they approach, then fade out as crisp text solidifies
            const pFadeIn = Math.min(1, e * 1.5);
            const pFadeOut = Math.max(0, 1 - Math.max(0, (inEase - 0.45) / 0.55));
            const pAlpha = pFadeIn * pFadeOut;

            if (pAlpha > 0.01) {
              ctx.globalAlpha = pAlpha;
              ctx.fillRect(curX, curY, 1.5, 1.5);
            }
          }

          // Crisp text of incoming quote materializes smoothly as particles converge
          const crispInAlpha = Math.max(0, Math.min(1, (inEase - 0.35) / 0.65));
          if (crispInAlpha > 0) {
            drawCrisp(nextIdx, Math.pow(crispInAlpha, 1.3));
          }
        }

        ctx.globalAlpha = 1;

        // Transition completes at TRANSITION_MS
        if (elapsed >= TRANSITION_MS) {
          curIdx = nextIdx;
          if (srRef.current) srRef.current.textContent = phelpsQuotes[curIdx];
          phase = "hold";
          holdUntil = now + HOLD_MS;
          outgoingParticles = [];
          incomingParticles = [];
          ctx.globalAlpha = 1;
          drawCrisp(curIdx, 1);
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
      holdUntil = now + HOLD_MS;
      phase = "hold";
      outgoingParticles = [];
      incomingParticles = [];
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, width, cssH);
      drawCrisp(curIdx, 1);
      raf = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onVisibilityChange);

    // Watchdog timer: checks every 1000ms. If rAF ever stalls, revives it seamlessly.
    const watchdogInterval = window.setInterval(() => {
      if (disposed) return;
      if (!document.hidden && inView) {
        const timeSinceLastTick = performance.now() - lastTick;
        if (timeSinceLastTick > 700) {
          const now = performance.now();
          holdUntil = now + HOLD_MS;
          phase = "hold";
          outgoingParticles = [];
          incomingParticles = [];
          cancelAnimationFrame(raf);
          ctx.clearRect(0, 0, width, cssH);
          drawCrisp(curIdx, 1);
          raf = requestAnimationFrame(tick);
        }
      }
    }, 1000);

    // Re-render immediately on theme change
    const themeObserver = new MutationObserver(() => {
      ctx.clearRect(0, 0, width, cssH);
      drawCrisp(curIdx, 1);
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
        drawCrisp(curIdx, 1);
      }
    };
    window.addEventListener("resize", onResize);

    const onCanvasClick = () => {
      if (phase === "hold") {
        startTransition(performance.now());
      }
    };
    canvas.addEventListener("click", onCanvasClick);

    // Initial setup
    setup();
    prevW = width;

    if (reduced) {
      drawCrisp(curIdx, 1);
      const interval = setInterval(() => {
        curIdx = (curIdx + 1) % phelpsQuotes.length;
        if (srRef.current) srRef.current.textContent = phelpsQuotes[curIdx];
        ctx.clearRect(0, 0, width, cssH);
        drawCrisp(curIdx, 1);
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
    drawCrisp(curIdx, 1);
    phase = "hold";
    holdUntil = performance.now() + HOLD_MS;
    raf = requestAnimationFrame(tick);

    // When web fonts finish loading, update measurements cleanly
    if (document.fonts) {
      document.fonts.ready.then(() => {
        if (disposed) return;
        setup();
        if (phase === "hold") {
          drawCrisp(curIdx, 1);
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
