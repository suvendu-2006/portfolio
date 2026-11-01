"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useScroll } from "framer-motion";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  // smart nav: hides while scrolling down, returns the moment you scroll up
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (mobileMenuOpen) {
        setHidden(false);
      } else if (y > lastY + 6 && y > 140) {
        setHidden(true);
      } else if (y < lastY - 6 || y < 140) {
        setHidden(false);
      }
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileMenuOpen]);

  // highlight the nav link of the section currently on screen
  // (rAF-throttled — one rect pass per frame max)
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const line = window.innerHeight * 0.4;
      let current = "";
      for (const { href } of links) {
        const el = document.getElementById(href.slice(1));
        if (el && el.getBoundingClientRect().top <= line) current = href.slice(1);
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 640) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    const targetId = href.replace("#", "");
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const headerOffset = 64;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      window.history.pushState(null, "", href);
    }
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-sm sm:backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <m.div
          aria-hidden="true"
          className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-accent"
          style={{ scaleX: scrollYProgress }}
        />
        <div className="mx-auto flex h-14 max-w-content items-center justify-between gap-2 px-3.5 sm:px-5">
          <SpotifyBrand />

          {/* Desktop Navigation Links */}
          <nav aria-label="Primary" className="hidden sm:flex items-center gap-1 sm:gap-2">
            {links.map((link, i) => {
              const isActive = active === link.href.slice(1);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  aria-current={isActive ? "true" : undefined}
                  className={`u-line u-line-tight shrink-0 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                    isActive ? "text-ink" : "text-soft hover:text-ink"
                  }`}
                >
                  <span className={`mr-1.5 text-[10px] ${isActive ? "text-accent" : "text-muted"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {link.label}
                </a>
              );
            })}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("shuv:open-palette"))}
              aria-label="Open command palette"
              title="Command palette (⌘K)"
              className="hidden items-center gap-1.5 rounded-md border border-line px-2 py-1 font-mono text-[10px] text-muted transition-colors hover:border-accent/50 hover:text-accent lg:flex"
            >
              ⌘K
            </button>
            <ThemeToggle />
          </nav>

          {/* Mobile Action Buttons (Theme Toggle + Hamburger Menu) */}
          <div className="flex sm:hidden items-center gap-1.5">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="flex size-8 items-center justify-center rounded-lg border border-line bg-panel/80 text-ink transition-colors hover:border-accent/40 active:scale-95"
            >
              {mobileMenuOpen ? (
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <m.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative z-50 border-b border-line bg-bg/95 backdrop-blur-2xl sm:hidden shadow-lg"
            >
              <nav aria-label="Mobile Navigation" className="flex flex-col gap-1 px-4 py-3">
                {links.map((link, i) => {
                  const isActive = active === link.href.slice(1);
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className={`flex items-center justify-between rounded-lg px-3.5 py-3 text-[15px] font-semibold transition-colors active:scale-[0.98] ${
                        isActive ? "bg-accent/10 text-accent" : "text-soft hover:bg-panel hover:text-ink active:bg-panel"
                      }`}
                    >
                      <span>{link.label}</span>
                      <span className="text-xs font-mono text-muted">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </a>
                  );
                })}
              </nav>
            </m.div>
          )}
        </AnimatePresence>
      </header>

      {/* Dimmed backdrop when mobile menu is open — tapping anywhere closes it */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 top-14 z-40 bg-black/50 backdrop-blur-[2px] sm:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
}
