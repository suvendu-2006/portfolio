"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIKLMNOPRSTUVXYZ0123456789※#";

/**
 * Section labels decode like a terminal when they scroll into view —
 * characters resolve left to right, then the real text locks in.
 * Screen readers always get the true text via a visually-hidden copy.
 */
export function Scramble({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [out, setOut] = useState(text);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: number | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        let step = 0;
        const total = text.length + 5;
        timer = window.setInterval(() => {
          step += 1;
          const settled = Math.floor((step / total) * text.length);
          if (settled >= text.length) {
            setOut(text);
            if (timer) window.clearInterval(timer);
            return;
          }
          setOut(
            text.slice(0, settled) +
              text
                .slice(settled)
                .split("")
                .map((c) =>
                  c === " " || c === "·" ? c : CHARS[Math.floor(Math.random() * CHARS.length)]
                )
                .join("")
          );
        }, 42);
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) window.clearInterval(timer);
    };
  }, [text]);

  return (
    <span className="inline-block">
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true" className="tabular-nums">
        {out}
      </span>
    </span>
  );
}
