/* ============================================================
   /api/spotify — real-time now-playing for the header/footer widget.
   ============================================================ */

import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

interface SpotifyTrack {
  name?: string;
  artists?: { name: string }[];
  album?: {
    images?: { url: string }[];
  };
  external_urls?: {
    spotify?: string;
  };
  duration_ms?: number;
}

interface SpotifyItemContainer {
  track?: SpotifyTrack;
  progress_ms?: number;
  name?: string;
  artists?: { name: string }[];
  album?: { images?: { url: string }[] };
  external_urls?: { spotify?: string };
  duration_ms?: number;
}

export interface TrackResponse {
  playing: boolean;
  title: string | null;
  artist: string | null;
  art: string;
  url: string;
  progressMs: number | null;
  durationMs: number | null;
  idle?: boolean;
}

const VERIFIED_RECENT_TRACK: TrackResponse = {
  playing: false,
  title: "Shiv Tandav Stotram",
  artist: "Shankar Mahadevan",
  art: "https://i.scdn.co/image/ab67616d0000b27363521cf4f0ca24a244f26e8b",
  url: "https://open.spotify.com/track/6NFAlpTFpLrYBrsFuiloH3",
  progressMs: null,
  durationMs: 553430,
};

let lastKnownTrack: TrackResponse = VERIFIED_RECENT_TRACK;
let lastRecentlyPlayedFetchAt = 0;
let cpRetryUntil = 0;
let rpRetryUntil = 0;
let cached: { at: number; body: TrackResponse | null } = { at: 0, body: null };
let accessToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(clientId: string, clientSecret: string, refreshToken: string) {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) throw new Error("token refresh failed: " + res.status);
  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return accessToken as string;
}

function mapTrack(item: SpotifyItemContainer, playing: boolean, progressMs?: number): TrackResponse | null {
  if (!item) return null;
  const t = item.track || item;
  if (!t || !t.name) return null;

  return {
    playing,
    title: t.name,
    artist: Array.isArray(t.artists) ? t.artists.map((a) => a.name).join(", ") : "",
    art: t.album && t.album.images && t.album.images[0] ? t.album.images[0].url : "",
    url: t.external_urls ? t.external_urls.spotify ?? "" : "",
    progressMs: playing ? (progressMs ?? item.progress_ms ?? null) : null,
    durationMs: playing && t.duration_ms ? t.duration_ms : null,
  };
}

export async function GET(req: NextRequest) {
  if (process.env.SPOTIFY_DEMO === "1") {
    return Response.json(
      {
        playing: true,
        title: "Demo track",
        artist: "Spotify widget preview",
        art: "",
        url: "",
        progressMs: 61000,
        durationMs: 244000,
      },
      { headers: NO_CACHE_HEADERS }
    );
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    return Response.json(
      { ok: false, error: "spotify_not_configured" },
      { status: 501, headers: NO_CACHE_HEADERS }
    );
  }

  try {
    const now = Date.now();

    // Micro-cache to absorb simultaneous duplicate requests (400ms)
    if (cached.body && now - cached.at < 400) {
      return Response.json(cached.body, { headers: NO_CACHE_HEADERS });
    }

    const token = await getAccessToken(clientId, clientSecret, refreshToken);
    const headers = { Authorization: `Bearer ${token}` };

    // 1. ALWAYS query currently-playing (handles both playing & paused tracks with 0 lag)
    if (now >= cpRetryUntil) {
      const playingRes = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers,
        cache: "no-store",
      });

      if (playingRes.status === 429) {
        const retryHeader = playingRes.headers.get("retry-after");
        const retrySec = retryHeader ? Math.min(parseInt(retryHeader, 10), 15) : 5;
        cpRetryUntil = now + retrySec * 1000;
      } else if (playingRes.status === 200) {
        const data = await playingRes.json().catch(() => null);
        if (data && data.item) {
          const isPlaying = Boolean(data.is_playing);
          const mapped = mapTrack(data.item, isPlaying, data.progress_ms);
          if (mapped && mapped.title) {
            lastKnownTrack = mapped;
            cached = { at: now, body: mapped };
            return Response.json(mapped, { headers: NO_CACHE_HEADERS });
          }
        }
      }
    }

    // 2. Player is idle (status 204, paused with no item, or transient buffering)
    // If we have a genuine track from earlier in this container session, serve it as Recently played:
    if (lastKnownTrack && lastKnownTrack.title) {
      const idlePayload: TrackResponse = {
        ...lastKnownTrack,
        playing: false,
        progressMs: null,
      };
      cached = { at: now, body: idlePayload };
      return Response.json(idlePayload, { headers: NO_CACHE_HEADERS });
    }

    // 3. Fallback: Query recently-played only on cold start if not rate-limited (max once per 5 min)
    if (now - lastRecentlyPlayedFetchAt > 300000 && now >= rpRetryUntil) {
      lastRecentlyPlayedFetchAt = now;
      try {
        const recentRes = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=3", {
          headers,
          cache: "no-store",
        });

        if (recentRes.ok) {
          const recentData = await recentRes.json().catch(() => null);
          const items = recentData?.items;
          if (Array.isArray(items) && items.length > 0) {
            const mapped = mapTrack(items[0], false);
            if (mapped && mapped.title) {
              lastKnownTrack = mapped;
              cached = { at: now, body: mapped };
              return Response.json(mapped, { headers: NO_CACHE_HEADERS });
            }
          }
        } else if (recentRes.status === 429) {
          const retryHeader = recentRes.headers.get("retry-after");
          const retrySec = retryHeader ? Math.min(parseInt(retryHeader, 10), 60) : 30;
          rpRetryUntil = now + retrySec * 1000;
        }
      } catch {
        // preserve idle state
      }
    }

    // 4. Return idle response without poisoning client state with a fake song.
    // If client already has a real song, it retains it with playing: false.
    // If this is a completely brand new client session, it falls back to VERIFIED_RECENT_TRACK.
    const idlePayload: TrackResponse = {
      ...VERIFIED_RECENT_TRACK,
      idle: true,
      playing: false,
      progressMs: null,
    };
    cached = { at: now, body: idlePayload };
    return Response.json(idlePayload, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    console.error("Spotify API route error:", err);
    const fallback: TrackResponse = {
      ...(lastKnownTrack || VERIFIED_RECENT_TRACK),
      idle: true,
      playing: false,
      progressMs: null,
    };
    return Response.json(fallback, { headers: NO_CACHE_HEADERS });
  }
}
