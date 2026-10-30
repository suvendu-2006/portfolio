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

let cached: { at: number; body: unknown } = { at: 0, body: null };
let accessToken: string | null = null;
let tokenExpiry = 0;

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

function mapTrack(item: SpotifyItemContainer, playing: boolean, progressMs?: number) {
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
        title: "Demo track — add your Spotify keys to go live",
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
    // 1-second micro-cache to prevent double-fetch while staying near instantaneous
    if (cached.body && Date.now() - cached.at < 1000) {
      return Response.json(cached.body, { headers: NO_CACHE_HEADERS });
    }

    const token = await getAccessToken(clientId, clientSecret, refreshToken);
    const headers = { Authorization: `Bearer ${token}` };

    // 1. Check currently playing first
    const playingRes = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers,
      cache: "no-store",
    });

    if (playingRes.status === 200) {
      const data = await playingRes.json().catch(() => null);
      if (data && data.item && data.is_playing) {
        const mapped = mapTrack(data.item, true, data.progress_ms);
        if (mapped) {
          cached = { at: Date.now(), body: mapped };
          return Response.json(cached.body, { headers: NO_CACHE_HEADERS });
        }
      }
    }

    // 2. Fall back to recently played
    const recentRes = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
      headers,
      cache: "no-store",
    });

    if (!recentRes.ok) {
      return Response.json(
        { error: "spotify_request_failed" },
        { status: recentRes.status, headers: NO_CACHE_HEADERS }
      );
    }

    const recentData = await recentRes.json();
    const item = recentData.items && recentData.items[0];
    const mapped = item ? mapTrack(item, false) : { playing: false, title: null, art: "" };

    cached = {
      at: Date.now(),
      body: mapped,
    };
    return Response.json(cached.body, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    console.error("Spotify API route error:", err);
    return Response.json({ error: "server_error" }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
