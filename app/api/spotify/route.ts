/* ============================================================
   /api/spotify — real-time now-playing for the header/footer widget.
   ============================================================ */

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
}

let lastKnownTrack: TrackResponse | null = null;
let lastRecentlyPlayedFetchAt = 0;
let retryAfterUntil = 0;
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

export async function GET() {
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
    // 300ms micro-cache to prevent duplicate hits from simultaneous client events
    if (cached.body && Date.now() - cached.at < 300) {
      return Response.json(cached.body, { headers: NO_CACHE_HEADERS });
    }

    const token = await getAccessToken(clientId, clientSecret, refreshToken);
    const headers = { Authorization: `Bearer ${token}` };

    // 1. Check currently active/paused track in player first (real-time live)
    const playingRes = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers,
      cache: "no-store",
    });

    if (playingRes.status === 200) {
      const data = await playingRes.json().catch(() => null);
      if (data && data.item) {
        const isPlaying = Boolean(data.is_playing);
        const mapped = mapTrack(data.item, isPlaying, data.progress_ms);
        if (mapped && mapped.title) {
          lastKnownTrack = mapped;
          cached = { at: Date.now(), body: mapped };
          return Response.json(cached.body, { headers: NO_CACHE_HEADERS });
        }
      }
    }

    // 2. If idle (204 or no active track), fetch real recently-played history from Spotify
    const now = Date.now();
    if (now - lastRecentlyPlayedFetchAt > 30000 && now > retryAfterUntil) {
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
            }
          }
        } else if (recentRes.status === 429) {
          const retryHeader = recentRes.headers.get("retry-after");
          const retrySec = retryHeader ? parseInt(retryHeader, 10) : 3600;
          retryAfterUntil = now + retrySec * 1000;
        }
      } catch {
        // preserve lastKnownTrack
      }
    }

    // If we have a verified track from this session, serve it as Recently played
    if (lastKnownTrack && lastKnownTrack.title) {
      const idlePayload: TrackResponse = {
        ...lastKnownTrack,
        playing: false,
        progressMs: null,
      };
      cached = { at: Date.now(), body: idlePayload };
      return Response.json(idlePayload, { headers: NO_CACHE_HEADERS });
    }

    // Genuinely no data available from Spotify right now (NEVER return fake placeholder songs)
    const emptyPayload: TrackResponse = {
      playing: false,
      title: null,
      artist: null,
      art: "",
      url: "",
      progressMs: null,
      durationMs: null,
    };
    cached = { at: Date.now(), body: emptyPayload };
    return Response.json(emptyPayload, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    console.error("Spotify API route error:", err);
    return Response.json(
      { playing: false, title: null, artist: null, art: "", url: "" },
      { headers: NO_CACHE_HEADERS }
    );
  }
}
