"use client";

import { useEffect, useState } from "react";

/** Live IST clock for the footer — Odisha local time. */
export function LocalTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = () =>
      setTime(
        new Intl.DateTimeFormat("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "Asia/Kolkata",
        }).format(new Date())
      );
    fmt();
    const id = setInterval(fmt, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <p suppressHydrationWarning className="tabular-nums">
      Odisha, IN — {time} IST
    </p>
  );
}
