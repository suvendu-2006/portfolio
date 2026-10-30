"use client";

import { useEffect, useState } from "react";
import { m, useScroll } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { SpotifyBrand } from "@/components/spotify-now";

const links = [
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const { scrollYProgress } = useScroll();
  const [active, setActive] = useState("");

  // highlight the nav link of the section currently on screen
  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.4;
      let current = "";
      for (const { href } of links) {
        const el = document.getElementById(href.slice(1));
        if (el && el.getBoundingClientRect().top <= line) current = href.slice(1);
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-md">
      <m.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-accent"
        style={{ scaleX: scrollYProgress }}
      />
      <div className="mx-auto flex h-14 max-w-content items-center justify-between px-5">
        <SpotifyBrand />
        <nav aria-label="Primary" className="flex items-center gap-1 overflow-x-auto sm:gap-2">
          {links.map((link, i) => {
            const isActive = active === link.href.slice(1);
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? "true" : undefined}
                className={`u-line u-line-tight rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-[13px] ${
                  isActive ? "text-ink" : "text-soft hover:text-ink"
                }`}
              >
                <span className={`mr-1.5 hidden text-[10px] sm:inline ${isActive ? "text-accent" : "text-muted"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {link.label}
              </a>
            );
          })}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
