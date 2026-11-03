"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { phelpsQuotes } from "@/data/content";

const HOLD_MS = 5000;

/**
 * Rotating quotes rendered with guaranteed high-contrast typography
 * and an elegant staggered drift animation. Works flawlessly in both
 * light and dark modes on mobile and desktop without blank canvas states.
 */
export function QuoteDust({ author }: { author: string }) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(true);

  // Pause rotation when not visible in viewport to save CPU / battery
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const nextQuote = useCallback(() => {
    setIndex((prev) => (prev + 1) % phelpsQuotes.length);
  }, []);

  useEffect(() => {
    if (isPaused || !isInView) return;

    const timer = setInterval(() => {
      nextQuote();
    }, HOLD_MS);

    return () => clearInterval(timer);
  }, [isPaused, isInView, nextQuote]);

  const currentQuote = phelpsQuotes[index];
  const words = currentQuote.split(" ");

  return (
    <figure
      ref={containerRef}
      className="group relative mx-auto w-full max-w-2xl px-4 text-center select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={nextQuote}
      title="Click to view next quote"
    >
      <div className="relative flex min-h-[5.5rem] items-center justify-center sm:min-h-[4.5rem]">
        <AnimatePresence mode="wait">
          <m.blockquote
            key={index}
            aria-live="polite"
            className="font-serif italic text-base leading-relaxed tracking-wide text-ink sm:text-lg md:text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.25 : 0.4 }}
          >
            {reduced ? (
              <span>“{currentQuote}”</span>
            ) : (
              <span>
                “
                {words.map((word, i) => (
                  <span key={`${index}-${i}`}>
                    <m.span
                      className="inline-block"
                      initial={{
                        opacity: 0,
                        y: 7,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -7,
                      }}
                      transition={{
                        duration: 0.35,
                        delay: i * 0.022,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      {word}
                    </m.span>
                    {i < words.length - 1 ? " " : ""}
                  </span>
                ))}
                ”
              </span>
            )}
          </m.blockquote>
        </AnimatePresence>
      </div>

      <figcaption className="mt-3 text-[11px] font-medium uppercase tracking-[0.24em] text-muted transition-colors group-hover:text-soft">
        — {author}
      </figcaption>
    </figure>
  );
}
