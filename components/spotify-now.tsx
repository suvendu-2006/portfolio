"use client";

import { useEffect, useState } from "react";

interface Track {
  playing: boolean;
  title: string;
  artist: string;
  url: string;
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
 * Header brand slot (far left): the Spotify logo plus a fixed-size,
 * two-line lockup — tiny label on top ("Recently played" / "Now playing"),
 * song name below. Clicking the whole lockup opens the track on Spotify.
 * Renders the logo alone until Spotify is connected
 * (see app/api/spotify/route.ts).
 */
export function SpotifyBrand() {
  const [track, setTrack] = useState<Track | null>(null);

  useEffect(() => {
    let alive = true;

    async function poll() {
      try {
        const res = await fetch("/api/spotify", { cache: "no-store" });
        if (!res.ok) {
          if (alive) setTrack(null);
          return;
        }
        const data = await res.json();
        if (alive) setTrack(data && data.title ? data : null);
      } catch {
        /* network hiccup — keep whatever we had */
      }
    }

    poll();
    const id = setInterval(poll, 45000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const lockup = track ? (
    <span className="flex w-36 flex-col gap-0.5 sm:w-44">
      <span className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className={`size-1.5 shrink-0 rounded-full ${
            track.playing ? "bg-[#1db954] motion-safe:animate-pulse" : "bg-muted"
          }`}
        />
        <span className="text-[8.5px] font-medium uppercase tracking-[0.18em] text-muted">
          {track.playing ? "Now playing" : "Recently played"}
        </span>
      </span>
      <span className="truncate text-[13px] font-semibold leading-tight text-ink">
        {track.title}
      </span>
    </span>
  ) : null;

  if (track && track.url) {
    return (
      <a
        href={track.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open on Spotify: ${track.title} by ${track.artist}`}
        title={`${track.title} — ${track.artist} · opens on Spotify`}
        className="flex min-w-0 items-center gap-2.5 transition-opacity duration-300 hover:opacity-80"
      >
        <SpotifyLogo className="size-[22px] shrink-0" />
        {lockup}
      </a>
    );
  }

  return (
    <a
      href="#main"
      aria-label="Back to top"
      className="flex items-center gap-2.5"
    >
      <SpotifyLogo className="size-[22px] shrink-0" />
      {lockup}
    </a>
  );
}
