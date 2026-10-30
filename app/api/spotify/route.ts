/* ============================================================
   /api/spotify — now-playing for the footer widget.

   Set these env vars (Vercel → Settings → Environment Variables,
   or site/.env.local locally) and the widget appears:
     SPOTIFY_CLIENT_ID
     SPOTIFY_CLIENT_SECRET
     SPOTIFY_REFRESH_TOKEN
   How to get them is documented in site/README.md.

   Until then the route answers 501 and the widget stays hidden,
   so the site never shows broken or placeholder data.
   Set SPOTIFY_DEMO=1 to preview the widget with sample data.
   ============================================================ */

export const dynamic = "force-dynamic";

let cached: { at: number; body: unknown } = { at: 0, body: null };
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

function mapTrack(item: {
  track: {
    name: string;
    artists: { name: string }[];
    album?: { images?: { url: string }[] };
    external_urls?: { spotify?: string };
    duration_ms?: number;
  };
  progress_ms?: number;
}, playing: boolean) {
  const t = item.track;
  return {
    playing,
    title: t.name,
    artist: t.artists.map((a) => a.name).join(", "),
    art: t.album && t.album.images && t.album.images[0] ? t.album.images[0].url : "",
    url: t.external_urls ? t.external_urls.spotify ?? "" : "",
    progressMs: playing ? item.progress_ms ?? null : null,
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
    // server-side cache — Spotify rate-limits the API
    if (cached.body && Date.now() - cached.at < 45000) {
      return Response.json(cached.body);
    }

    const token = await getAccessToken(clientId, clientSecret, refreshToken);
    const headers = { Authorization: `Bearer ${token}` };

    // currently playing first…
    let r = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers,
      cache: "no-store",
    });
    if (r.ok) {
      const data = await r.json().catch(() => null);
      if (data && data.item && data.is_playing) {
        cached = { at: Date.now(), body: mapTrack(data.item, true) };
        return Response.json(cached.body);
      }
    }

    // …fall back to last played
    r = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
      headers,
      cache: "no-store",
    });
    if (!r.ok) return Response.json({ error: "spotify_request_failed" }, { status: r.status });
    const data = await r.json();
    const item = data.items && data.items[0];
    cached = {
      at: Date.now(),
      body: item ? mapTrack(item, false) : { playing: false, title: null },
    };
    return Response.json(cached.body);
  } catch {
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
