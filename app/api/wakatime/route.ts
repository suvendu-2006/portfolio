/**
 * WakaTime "coded today" API route.
 *
 * Supports two authentication methods:
 * 1. Direct WAKATIME_API_KEY (Basic auth) via the plugin status_bar/today endpoint.
 * 2. OAuth2 refresh token (Bearer auth) via durations endpoint.
 *
 * Never serves fake or simulated data — if neither auth method is configured,
 * it returns HTTP 501 so the UI cleanly hides or falls back.
 */

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getOAuthAccessToken(): Promise<string | null> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }
  const refresh = process.env.WAKATIME_REFRESH_TOKEN;
  const clientId = process.env.WAKATIME_CLIENT_ID;
  const clientSecret = process.env.WAKATIME_CLIENT_SECRET;
  if (!refresh || !clientId || !clientSecret) return null;

  try {
    const res = await fetch("https://wakatime.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    if (!res.ok) return null;
    const token = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!token.access_token) return null;
    cachedToken = {
      token: token.access_token,
      expiresAt: Date.now() + (token.expires_in ?? 7200) * 1000,
    };
    return cachedToken.token;
  } catch {
    return null;
  }
}

export async function GET() {
  const apiKey = process.env.WAKATIME_API_KEY?.trim();

  // Primary: Official WakaTime plugin status_bar/today endpoint with API Key
  if (apiKey) {
    try {
      const basicAuth = Buffer.from(apiKey).toString("base64");
      const res = await fetch("https://wakatime.com/api/v1/users/current/status_bar/today", {
        headers: {
          Authorization: `Basic ${basicAuth}`,
        },
        next: { revalidate: 60 },
      });

      if (!res.ok) {
        return Response.json({ error: "wakatime_unavailable" }, { status: 502 });
      }

      const json = await res.json();
      const grandTotal = json.data?.grand_total ?? {};
      const hours = Number(grandTotal.hours || 0);
      const minutes = Number(grandTotal.minutes || 0);
      const totalSeconds = Number(grandTotal.total_seconds || 0);
      const digital = grandTotal.digital ?? "0:00";

      const totalText =
        totalSeconds === 0
          ? "0m"
          : hours > 0
            ? `${hours}h ${String(minutes).padStart(2, "0")}m`
            : `${minutes}m`;

      const projects = Array.isArray(json.data?.projects) ? json.data.projects : [];
      const topProject = projects[0]?.name ?? null;

      const languages = Array.isArray(json.data?.languages)
        ? json.data.languages.map((l: { name: string }) => l.name)
        : [];

      // Active now: heartbeats in WakaTime update cached_at every ~2 mins.
      // If cached_at was within 10 minutes and user logged some time today.
      const cachedAt = json.cached_at ? new Date(json.cached_at).getTime() : 0;
      const activeNow = totalSeconds > 0 && Date.now() - cachedAt < 10 * 60 * 1000;

      return Response.json(
        {
          totalText,
          hours,
          minutes,
          totalSeconds,
          digital,
          activeNow,
          topProject,
          languages,
          humanReadable: grandTotal.text ?? totalText,
        },
        { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
      );
    } catch {
      return Response.json({ error: "wakatime_unavailable" }, { status: 502 });
    }
  }

  // Fallback: OAuth access token via durations endpoint
  const accessToken = await getOAuthAccessToken();
  if (!accessToken) {
    return Response.json({ error: "wakatime_not_connected" }, { status: 501 });
  }

  try {
    const res = await fetch("https://api.wakatime.com/api/v1/users/current/durations?date=today", {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 120 },
    });
    if (!res.ok) {
      return Response.json({ error: "wakatime_unavailable" }, { status: 502 });
    }
    const json = await res.json();
    const chunks = Array.isArray(json.data) ? json.data : [];

    const digital = json.cumulative_total?.digital ?? "0:00";
    const [h, m] = digital.split(":").map(Number);
    const totalText = `${h}h ${String(m).padStart(2, "0")}m`;

    const secsNowIst = (Date.now() / 1000 + 19800) % 86400;
    const latestEnd = chunks.reduce(
      (max: number, c: { time?: number; duration?: number }) =>
        Math.max(max, (c.time || 0) * 3600 + (c.duration || 0)),
      0
    );
    const activeNow = latestEnd > 0 && secsNowIst - latestEnd <= 120;

    const topProject =
      [...chunks].sort(
        (a: { duration?: number }, b: { duration?: number }) =>
          (b.duration || 0) - (a.duration || 0)
      )[0]?.project ?? null;

    return Response.json(
      { totalText, activeNow, topProject },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
    );
  } catch {
    return Response.json({ error: "wakatime_unavailable" }, { status: 502 });
  }
}
