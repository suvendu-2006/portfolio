/* ============================================================
   /api/spotify — now-playing for the header/footer widget.

   Set these env vars (Vercel → Settings → Environment Variables,
   or site/.env.local locally) and the widget appears:
     SPOTIFY_CLIENT_ID
     SPOTIFY_CLIENT_SECRET
     SPOTIFY_REFRESH_TOKEN

   Until then the route answers 501 and the widget stays hidden.
   Set SPOTIFY_DEMO=1 to preview the widget with sample data.
   ============================================================ */

export const dynamic = "force-dynamic";

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
  // In currently-playing, item is the track directly.
  // In recently-played, item has a .track property.
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
    return Response.json({
      playing: true,
      title: "Demo track — add your Spotify keys to go live",
      artist: "Spotify widget preview",
      art: "",
      url: "",
      progressMs: 61000,
      durationMs: 244000,
    });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    return Response.json({ ok: false, error: "spotify_not_configured" }, { status: 501 });
  }

  try {
    // server-side cache (10s) — fast updates without hitting Spotify rate-limits
    if (cached.body && Date.now() - cached.at < 10000) {
      return Response.json(cached.body);
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
          return Response.json(cached.body);
        }
      }
    }

    // 2. Fall back to recently played
    const recentRes = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
      headers,
      cache: "no-store",
    });

    if (!recentRes.ok) {
      return Response.json({ error: "spotify_request_failed" }, { status: recentRes.status });
    }

    const recentData = await recentRes.json();
    const item = recentData.items && recentData.items[0];
    const mapped = item ? mapTrack(item, false) : { playing: false, title: null, art: "" };

    cached = {
      at: Date.now(),
      body: mapped,
    };
    return Response.json(cached.body);
  } catch (err) {
    console.error("Spotify API route error:", err);
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
