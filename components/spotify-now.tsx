"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, m } from "framer-motion";

interface Track {
  playing: boolean;
  title: string;
  artist: string;
  url: string;
  art?: string;
  progressMs?: number | null;
  durationMs?: number | null;
}

/** The official Spotify mark. */
export function SpotifyLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="#1DB954" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.56.3z" />
    </svg>
  );
}

/**
 * Header brand slot (far left):
 * Shows the song's album poster inside a circular spinning vinyl disc.
 * On mobile (< sm): Compact 32px disc to guarantee zero overlap with "Projects",
 * expandable on tap into a clean floating card.
 * On desktop (>= sm): Full inline song title & artist lockup.
 */
export function SpotifyBrand() {
  const [track, setTrack] = useState<Track | null>(null);
  const [openMobile, setOpenMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/spotify?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { Pragma: "no-cache" },
      });
      if (res.status === 501) {
        setTrack(null);
        return;
      }
      if (!res.ok) return;

      const data = await res.json();
      if (data && data.title) {
        setTrack((prev) => {
          if (
            prev &&
            prev.title === data.title &&
            prev.playing === data.playing &&
            prev.art === data.art
          ) {
            return prev;
          }
          return data;
        });
      }
    } catch {
      /* preserve existing track on transient network blip */
    }
  }, []);

  useEffect(() => {
    poll();
    const id = setInterval(poll, 2500);

    const onVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        poll();
      }
    };

    window.addEventListener("focus", onVisibilityOrFocus);
    document.addEventListener("visibilitychange", onVisibilityOrFocus);

    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onVisibilityOrFocus);
      document.removeEventListener("visibilitychange", onVisibilityOrFocus);
    };
  }, [poll]);

  // Close mobile popup on outside click or scroll
  useEffect(() => {
    if (!openMobile) return;
    const onOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenMobile(false);
      }
    };
    const onScroll = () => setOpenMobile(false);

    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
      window.removeEventListener("scroll", onScroll);
    };
  }, [openMobile]);

  const albumArtLogo = (
    <button
      type="button"
      onClick={() => setOpenMobile((v) => !v)}
      className="relative size-8 shrink-0 cursor-pointer transition-transform active:scale-95 sm:cursor-default sm:active:scale-100"
      aria-label="Toggle Spotify playback info"
    >
      {track?.art ? (
        <div
          className={`relative size-8 overflow-hidden rounded-full border border-line bg-panel shadow-sm ${
            track.playing ? "animate-[spin_8s_linear_infinite]" : ""
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={track.art}
            alt={track.title}
            className="size-full object-cover"
          />
          {/* Vinyl center hole */}
          <span className="absolute inset-0 m-auto size-2 rounded-full border border-black/50 bg-bg" />
        </div>
      ) : (
        <SpotifyLogo className="size-[22px] shrink-0" />
      )}
      {track?.art && (
        <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-black ring-1 ring-bg">
          <SpotifyLogo className="size-2.5" />
        </span>
      )}
    </button>
  );

  return (
    <div
      ref={containerRef}
      onMouseEnter={poll}
      className="relative flex shrink-0 items-center gap-2.5 cursor-default select-none"
    >
      {albumArtLogo}

      {/* Desktop Inline Lockup (hidden on mobile to guarantee zero overlap with nav links) */}
      {track && track.title && (
        <span className="hidden sm:flex max-w-[170px] lg:max-w-[240px] flex-col gap-0.5">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={`size-1.5 shrink-0 rounded-full ${
                track.playing ? "bg-[#1db954] motion-safe:animate-pulse" : "bg-muted"
              }`}
            />
            <span className="truncate text-[8.5px] font-medium uppercase tracking-[0.16em] text-muted">
              {track.playing ? "Now playing" : "Recently played"}
            </span>
          </span>
          <span className="truncate text-[12.5px] font-semibold leading-tight text-ink">
            {track.title}
          </span>
          {track.artist && (
            <span className="truncate text-[10.5px] leading-tight text-muted">
              {track.artist}
            </span>
          )}
        </span>
      )}

      {/* Mobile Floating Card (opens on tap, perfectly positioned without colliding with Projects) */}
      <AnimatePresence>
        {openMobile && track && track.title && (
          <m.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-11 z-[70] w-64 rounded-xl border border-line bg-panel/95 p-3.5 shadow-2xl backdrop-blur-xl sm:hidden"
          >
            <div className="flex items-start gap-3">
              {track.art && (
                <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={track.art} alt={track.title} className="size-full object-cover" />
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className={`size-1.5 shrink-0 rounded-full ${
                      track.playing ? "bg-[#1db954] motion-safe:animate-pulse" : "bg-muted"
                    }`}
                  />
                  <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-accent">
                    {track.playing ? "Now playing" : "Recently played"}
                  </span>
                </span>
                <span className="truncate text-sm font-bold text-ink">
                  {track.title}
                </span>
                {track.artist && (
                  <span className="truncate text-xs text-muted">
                    {track.artist}
                  </span>
                )}
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
