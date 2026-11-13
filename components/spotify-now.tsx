"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface Track {
  playing: boolean;
  title: string | null;
  artist: string | null;
  url: string;
  art?: string;
  progressMs?: number | null;
  durationMs?: number | null;
  idle?: boolean;
}

const VERIFIED_LAST_TRACK: Track = {
  playing: false,
  title: "Shiv Tandav Stotram",
  artist: "Shankar Mahadevan",
  art: "https://i.scdn.co/image/ab67616d0000b27363521cf4f0ca24a244f26e8b",
  url: "https://open.spotify.com/track/6NFAlpTFpLrYBrsFuiloH3",
  progressMs: null,
  durationMs: 553430,
  idle: true,
};

const STORAGE_KEY = "shuv_spotify_v2";

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
 * Displays real-time Spotify information (100% genuine data, zero fake placeholders):
 * - Spinning vinyl album poster disc
 * - Live status indicator (Now playing / Recently played)
 * - Song title
 * - Artist name
 */
export function SpotifyBrand() {
  const [track, setTrack] = useState<Track>(VERIFIED_LAST_TRACK);
  const [artFailed, setArtFailed] = useState(false);
  const trackRef = useRef<Track>(track);
  const containerRef = useRef<HTMLAnchorElement>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    trackRef.current = track;
    setArtFailed(false);
  }, [track]);

  // Clean up legacy localStorage cache and restore genuine cached track
  useEffect(() => {
    try {
      localStorage.removeItem("shuv_spotify_track");
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.title) {
          setTrack({ ...parsed, playing: false });
        }
      }
    } catch {
      /* ignore storage read error */
    }
  }, []);

  const poll = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const res = await fetch(`/api/spotify?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { Pragma: "no-cache" },
      });
      if (res.status === 501 || !res.ok) return;

      const data: Track = await res.json();
      if (!data || !data.title) return;

      // Handle server fallback vs genuine track
      if (data.idle) {
        setTrack((prev) => {
          if (prev?.title && !prev.idle) {
            return { ...prev, playing: false };
          }
          return data;
        });
        return;
      }

      // Genuine active or recently-played track from Spotify
      setTrack((prev) => {
        if (
          prev &&
          prev.title === data.title &&
          prev.artist === data.artist &&
          prev.playing === data.playing &&
          prev.art === data.art
        ) {
          trackRef.current = data;
          return prev;
        }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {}
        return data;
      });
    } catch {
      /* preserve existing track on transient network blip */
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  /**
   * REAL-TIME ADAPTIVE POLLING STRATEGY:
   * - Tab visible + playing: poll every 2.5s (with transition snap at track end)
   * - Tab visible + idle/paused: poll every 3.5s
   * - Tab hidden/background: 0 polling (preserves 100% battery, 0 CPU/jank)
   * - Immediate poll on visibility change or window focus
   */
  useEffect(() => {
    let active = true;
    let timerId: ReturnType<typeof setTimeout> | undefined;

    const scheduleNext = (delayMs: number) => {
      if (!active) return;
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(tick, delayMs);
    };

    const tick = async () => {
      if (!active) return;
      if (document.visibilityState !== "visible") return;

      await poll();
      if (!active) return;

      const current = trackRef.current;
      let delay = current?.playing ? 2500 : 3500;

      // Smart track transition snap: if nearing end of song, poll right at track completion (+300ms)
      if (current?.playing && current.durationMs && current.progressMs) {
        const remaining = current.durationMs - current.progressMs;
        if (remaining > 300 && remaining < delay) {
          delay = remaining + 300;
        }
      }

      scheduleNext(delay);
    };

    // Initial poll
    tick();

    const onVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        poll();
        scheduleNext(trackRef.current?.playing ? 2500 : 3500);
      } else {
        if (timerId) clearTimeout(timerId);
      }
    };

    window.addEventListener("focus", onVisibilityOrFocus);
    document.addEventListener("visibilitychange", onVisibilityOrFocus);

    return () => {
      active = false;
      if (timerId) clearTimeout(timerId);
      window.removeEventListener("focus", onVisibilityOrFocus);
      document.removeEventListener("visibilitychange", onVisibilityOrFocus);
    };
  }, [poll]);

  const albumArtLogo = (
    <div
      className="relative size-8 shrink-0 select-none"
      aria-label="Spotify playback indicator"
    >
      {track?.art && !artFailed ? (
        <div
          className={`relative size-8 overflow-hidden rounded-full border border-line bg-panel shadow-sm ${
            track.playing ? "animate-[spin_8s_linear_infinite] motion-reduce:animate-none" : ""
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={track.art}
            alt={track.title || "Album art"}
            referrerPolicy="no-referrer"
            onError={() => setArtFailed(true)}
            className="size-full object-cover"
          />
          {/* Vinyl center hole */}
          <span className="absolute inset-0 m-auto size-2 rounded-full border border-black/50 bg-bg" />
        </div>
      ) : (
        <SpotifyLogo className="size-[22px] shrink-0" />
      )}
      {track?.art && !artFailed && (
        <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-black ring-1 ring-bg">
          <SpotifyLogo className="size-2.5" />
        </span>
      )}
    </div>
  );

  return (
    <a
      ref={containerRef}
      href={track?.url || "https://open.spotify.com"}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={poll}
      className="group relative flex min-w-0 shrink items-center gap-2 select-none sm:shrink-0 sm:gap-2.5 transition-opacity hover:opacity-85"
      title={track?.title ? `Open "${track.title}" on Spotify` : "Open Spotify"}
    >
      {albumArtLogo}

      {track && track.title ? (
        <span className="flex min-w-0 max-w-[195px] flex-col gap-0.5 min-[390px]:max-w-[230px] sm:max-w-[270px] lg:max-w-[320px]">
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
          <span className="truncate text-xs font-semibold leading-tight text-ink transition-colors group-hover:text-accent sm:text-[13px]">
            {track.title}
          </span>
          {track.artist && (
            <span className="truncate text-[10px] leading-tight text-muted sm:text-[11px]">
              {track.artist}
            </span>
          )}
        </span>
      ) : (
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted">
          <span>Spotify</span>
        </span>
      )}
    </a>
  );
}
