"use client";

import { useEffect, useState } from "react";

interface VisitorPillProps {
  onClick?: () => void;
  className?: string;
}

export function VisitorPill({ onClick, className = "" }: VisitorPillProps) {
  const [count, setCount] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Retrieve or generate persistent anonymous client identifier
    let vid = "";
    try {
      vid = localStorage.getItem("shuv_vid") || "";
      if (!vid) {
        vid = "v_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem("shuv_vid", vid);
      }
    } catch {
      // localStorage disabled/restricted
    }

    // Ping visitor counter API
    async function recordVisitor() {
      try {
        const res = await fetch("/api/visitor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vid }),
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.count === "number") {
            setCount(data.count);
          }
        }
      } catch (err) {
        // Fallback gracefully
      }
    }

    recordVisitor();
  }, []);

  const formatted = count !== null ? count.toLocaleString("en-US") : "—";

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <a
      href="#contact"
      onClick={handleClick}
      title="Click to say hi!"
      aria-label={`You are visitor number ${formatted}. Click to jump to the contact form to say hi.`}
      className={`group relative inline-flex items-center gap-2 rounded-full border border-line/80 bg-panel/90 px-6 py-2.5 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:border-accent/50 hover:bg-panel hover:shadow-lg active:scale-95 ${className}`}
    >
      {/* Subtle pulsing live indicator dot */}
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/60 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-accent" />
      </span>

      <span className="font-mono text-[13px] tracking-wide text-soft transition-colors group-hover:text-ink sm:text-sm">
        Say hi, visitor{" "}
        <strong
          className="font-bold text-ink transition-colors group-hover:text-accent"
          suppressHydrationWarning
        >
          {mounted && count !== null ? formatted : "—"}
        </strong>
      </span>
    </a>
  );
}
