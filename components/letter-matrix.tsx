"use client";

import { useEffect, useRef } from "react";

/**
 * Aki-style letter matrix: a grid of ghost letters with the name
 * in serif at the center. Letters scramble in on mount, ghost
 * letters reshuffle ambiently and flicker on hover.
 * Built imperatively after mount (no SSR randomness → no hydration mismatch).
 */
export function LetterMatrix({
  rows = 4,
  cols = 7,
  words,
}: {
  rows?: number;
  cols?: number;
  /** row index → word rendered in serif */
  words: Record<number, string>;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // sync the scramble-in with the intro preloader: while the curtain is up
    // the word waits, on repeat visits it settles almost immediately
    let introDelay = 250;
    if (document.documentElement.dataset.intro === "pending") introDelay = 1250;
    else if (document.documentElement.dataset.intro === "done") introDelay = 120;

    const randomLetter = (exclude = "") => {
      let ch;
      do {
        ch = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      } while (exclude.includes(ch));
      return ch;
    };

    const flicker = (span: HTMLSpanElement, finalChar: string, cycles: number) => {
      let i = 0;
      const timer = setInterval(() => {
        if (i < cycles) {
          span.textContent = randomLetter(span.dataset.target || "");
          i++;
        } else {
          clearInterval(timer);
          if (finalChar) span.textContent = finalChar;
        }
      }, 70);
      return timer;
    };

    const cleanupTimers: ReturnType<typeof setInterval>[] = [];
    const ghosts: HTMLSpanElement[] = [];
    const words_: HTMLSpanElement[] = [];

    for (let r = 0; r < rows; r++) {
      const rowEl = document.createElement("div");
      rowEl.className = "lm-row";
      const word = words[r] || null;
      const wordStart = word ? Math.floor((cols - word.length) / 2) : -1;
      const used = new Set<string>(word ? word.split("") : []);

      for (let c = 0; c < cols; c++) {
        const span = document.createElement("span");
        span.className = "lm-letter";

        if (word && c >= wordStart && c < wordStart + word.length) {
          const ch = word[c - wordStart];
          span.dataset.target = ch;
          span.textContent = reduced ? ch : randomLetter();
          span.classList.add("lm-word");
          words_.push(span);
        } else {
          const ch = randomLetter(used.size < LETTERS.length ? Array.from(used).join("") : "");
          used.add(ch);
          span.textContent = ch;
          ghosts.push(span);
          span.addEventListener("pointerenter", () => flicker(span, span.textContent || "", 2));
        }
        rowEl.appendChild(span);
      }
      container.appendChild(rowEl);
    }

    if (!reduced) {
      // scramble-in: word letters settle one by one
      words_.forEach((span, i) => {
        const timer = setTimeout(() => {
          const stop = flicker(span, span.dataset.target || "", 4);
          cleanupTimers.push(stop);
        }, introDelay + i * 110);
        cleanupTimers.push(timer as unknown as ReturnType<typeof setInterval>);
      });
      // ambient reshuffle
      const ambient = setInterval(() => {
        const span = ghosts[Math.floor(Math.random() * ghosts.length)];
        if (!span) return;
        const rect = span.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const stop = flicker(span, span.textContent || "", 2);
          cleanupTimers.push(stop);
        }
      }, 1800);
      cleanupTimers.push(ambient);
    }

    // mouse parallax — rows drift at opposite depths, lerped.
    // The loop stops itself when the values settle or the hero scrolls
    // off-screen — it never burns frames for nothing.
    let removeParallax: (() => void) | null = null;
    if (!reduced && window.matchMedia("(pointer: fine)").matches) {
      const rowEls = Array.from(container.children) as HTMLElement[];
      const depthFor = (i: number) =>
        (i - (rows - 1) / 2) / ((rows - 1) / 2 || 1); // -1 … 1 by row
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      const apply = () => {
        rowEls.forEach((row, i) => {
          const d = depthFor(i);
          row.style.transform = `translate3d(${(cx * 14 * d).toFixed(2)}px, ${(cy * 8 * Math.abs(d)).toFixed(2)}px, 0)`;
        });
      };
      const loop = () => {
        cx += (tx - cx) * 0.06;
        cy += (ty - cy) * 0.06;
        apply();
        if (Math.abs(tx - cx) < 0.001 && Math.abs(ty - cy) < 0.001) {
          cx = tx;
          cy = ty;
          raf = 0; // settled — stop the loop until the pointer moves again
          return;
        }
        raf = requestAnimationFrame(loop);
      };
      const wake = () => {
        if (!raf) raf = requestAnimationFrame(loop);
      };
      const onMove = (e: PointerEvent) => {
        tx = (e.clientX / window.innerWidth - 0.5) * 2;
        ty = (e.clientY / window.innerHeight - 0.5) * 2;
        // skip all work while the hero is off-screen
        if (container.getBoundingClientRect().bottom > 0) wake();
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      removeParallax = () => {
        window.removeEventListener("pointermove", onMove);
        cancelAnimationFrame(raf);
      };
    }

    return () => {
      cleanupTimers.forEach((t) => {
        clearInterval(t);
        clearTimeout(t);
      });
      removeParallax?.();
      container.innerHTML = "";
    };
  }, [rows, cols, words]);

  return <div ref={ref} className="lm" aria-hidden="true" />;
}
