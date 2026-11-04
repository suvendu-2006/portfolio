"use client";

import { useEffect, useRef } from "react";
import { phelpsQuotes } from "@/data/content";

const STEP = 2; // px between sampled particles
const HOLD_MS = 4500;
const ASSEMBLE_MS = 1000;
const DUST_MS = 1400;
const STAGGER_MS = 380; // the dissolve sweeps across the text

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
 * Rotating quotes rendered on a canvas with a particle dust animation:
 * particles sweep in and assemble into the quote, hold crisp and legible,
 * then dissolve in a staggered dust sweep into the next quote.
 *
 * Fully optimized for both dark and light modes, high-DPI Retina screens,
 * mobile viewports, and reactive theme toggling.
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

    // Detect light vs dark theme reliably across renders and theme switches
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
      const docVal = getComputedStyle(document.documentElement).getPropertyValue("--font-serif") || "";
      const canvasVal = getComputedStyle(canvas).getPropertyValue("--font-serif") || "";
      const raw = (docVal || canvasVal || "Georgia, serif").trim();
      const first = raw.split(",")[0].trim().replace(/^['"]|['"]$/g, "");
      return first ? `"${first}", "Playfair Display", Georgia, serif` : `"Playfair Display", Georgia, serif`;
    };

    let width = 320;
    let cssH = 120;
    let fontSize = 18;
    let lineHeight = 32;
    let dpr = 1;
    let wraps: string[][] = phelpsQuotes.map(() => [""]);
    let idx = 0;
    let particles: Particle[] = [];
    let phase: "in" | "hold" | "dust" = "hold"; // start in hold so quote is visible immediately
    let t0 = performance.now();
    let holdUntil = performance.now() + HOLD_MS;
    let raf = 0;
    let disposed = false;
    let isHovered = false;

    const setFont = () => {
      const family = getFontFamily();
      ctx.font = `500 ${fontSize}px ${family}`;
    };

    const setup = () => {
      width = canvas.clientWidth || (canvas.parentElement?.clientWidth ?? 320);
      if (width <= 0) width = 320;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Responsive font sizing: 17px on small mobile, up to 21px on desktop
      fontSize = Math.round(Math.max(16, Math.min(21, width * 0.038)));
      lineHeight = Math.round(fontSize * 1.7);
      setFont();

      let maxLines = 1;
      wraps = phelpsQuotes.map((q) => {
        const lines: string[] = [];
        let line = "";
        for (const word of q.split(" ")) {
          const test = line ? `${line} ${word}` : word;
          if (ctx.measureText(test).width > width - 20 && line) {
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

      cssH = maxLines * lineHeight + 16;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      setFont();
    };

    /** Draw the sharp, crisp text */
    const drawCrisp = (alpha: number) => {
      if (alpha <= 0) return;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = getInk();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      setFont();

      const currentLines = wraps[idx] || [];
      const startY = (cssH - currentLines.length * lineHeight) / 2 + lineHeight / 2;
      currentLines.forEach((line, i) => {
        ctx.fillText(line, width / 2, startY + i * lineHeight);
      });
      ctx.globalAlpha = 1;
    };

    /** Sample the rendered text into particle coordinates */
    const sample = (): Particle[] => {
      ctx.clearRect(0, 0, width, cssH);
      drawCrisp(1);

      const dprScale = canvas.width / width;
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const pts: Particle[] = [];

      // Step by 2 user pixels, accounting for device pixel ratio
      const stepPx = Math.max(2, Math.round(STEP * dprScale));

      for (let y = 0; y < canvas.height; y += stepPx) {
        for (let x = 0; x < canvas.width; x += stepPx) {
          const i = (y * canvas.width + x) * 4 + 3;
          // Capture antialiased serifs and letter strokes with threshold 40
          if (data[i] > 40) {
            pts.push({
              tx: x / dprScale,
              ty: y / dprScale,
              dx: (Math.random() - 0.5) * 140,
              dy: (Math.random() - 0.5) * 80,
              vx: Math.random() * 2 - 1,
              vy: Math.random() * 1.6 - 0.8,
              delay: (x / canvas.width) * STAGGER_MS + Math.random() * 60,
            });
          }
        }
      }

      ctx.clearRect(0, 0, width, cssH);
      return pts;
    };

    const startAssemble = (now: number) => {
      particles = sample();
      phase = "in";
      t0 = now;
    };

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    // Keep running smoothly across scroll; observe with generous margin
    // so particles and text are already ready when visible
    let inView = true;
    let pausedAt: number | null = null;
    const visibility = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (!inView && pausedAt === null) {
          pausedAt = performance.now();
        }
        if (inView && pausedAt !== null) {
          const delta = performance.now() - pausedAt;
          pausedAt = null;
          t0 += delta;
          holdUntil += delta;
        }
      },
      { rootMargin: "250px" }
    );
    visibility.observe(canvas);

    // Redraw immediately when theme switches between light and dark
    const themeObserver = new MutationObserver(() => {
      if (phase === "hold") {
        ctx.clearRect(0, 0, width, cssH);
        drawCrisp(1);
      }
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const tick = (now: number) => {
      if (disposed) return;
      if (!inView || pausedAt !== null) {
        raf = requestAnimationFrame(tick);
        return;
      }

      ctx.clearRect(0, 0, width, cssH);
      ctx.fillStyle = getInk();

      if (phase === "in") {
        let done = true;
        // Particles converge into position, text crossfades in
        for (const p of particles) {
          const local = Math.max(0, Math.min(1, (now - t0 - p.delay) / ASSEMBLE_MS));
          if (local < 1) done = false;
          const e = easeOut(local);
          const crisp = Math.max(0, Math.min(1, (local - 0.55) / 0.45));
          ctx.globalAlpha = Math.max(0.15, e * (1 - crisp * 0.85));
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
        if (isHovered) {
          holdUntil = now + HOLD_MS; // keep holding while hovered
        } else if (now >= holdUntil) {
          particles = sample();
          phase = "dust";
          t0 = now;
        }
      } else {
        let done = true;
        // Sharp text fades while particles sweep and drift away like dust
        drawCrisp(1 - Math.min(1, (now - t0) / (DUST_MS * 0.3)));
        for (const p of particles) {
          const local = Math.max(0, Math.min(1, (now - t0 - p.delay) / DUST_MS));
          if (local < 1) done = false;
          const sweep = Math.pow(local, 1.5);
          const px = p.tx + p.vx * 120 * sweep;
          const py = p.ty + p.vy * 52 * sweep + 38 * Math.pow(local, 1.9);
          ctx.globalAlpha = Math.max(0, 1 - local);
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

    const handleResize = () => {
      if (disposed) return;
      setup();
      if (phase === "hold") {
        drawCrisp(1);
      }
    };
    window.addEventListener("resize", handleResize);

    // Initial setup and immediate draw
    setup();
    drawCrisp(1);

    if (reduced) {
      // Reduced motion: static text swap without moving particles
      const cycle = window.setInterval(() => {
        idx = (idx + 1) % phelpsQuotes.length;
        if (srRef.current) srRef.current.textContent = phelpsQuotes[idx];
        ctx.clearRect(0, 0, width, cssH);
        drawCrisp(1);
      }, HOLD_MS);

      return () => {
        disposed = true;
        window.clearInterval(cycle);
        visibility.disconnect();
        themeObserver.disconnect();
        window.removeEventListener("resize", handleResize);
      };
    }

    // When web fonts load, refresh font measurements and re-render
    if (document.fonts) {
      document.fonts.ready.then(() => {
        if (disposed) return;
        setup();
        drawCrisp(1);
      });
    }

    // Start animation loop
    raf = requestAnimationFrame(tick);

    // Interactions
    const onMouseEnter = () => {
      isHovered = true;
    };
    const onMouseLeave = () => {
      isHovered = false;
    };
    const onClick = () => {
      idx = (idx + 1) % phelpsQuotes.length;
      if (srRef.current) srRef.current.textContent = phelpsQuotes[idx];
      startAssemble(performance.now());
    };

    canvas.addEventListener("mouseenter", onMouseEnter);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("click", onClick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      visibility.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mouseenter", onMouseEnter);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <figure className="mx-auto w-full max-w-2xl text-center select-none">
      <canvas
        ref={canvasRef}
        className="block w-full cursor-pointer"
        aria-hidden="true"
        title="Click to advance quote"
      />
      <span ref={srRef} className="sr-only">
        {phelpsQuotes[0]}
      </span>
      <figcaption className="mt-3 text-[11px] font-medium uppercase tracking-[0.24em] text-muted">
        — {author}
      </figcaption>
    </figure>
  );
}
