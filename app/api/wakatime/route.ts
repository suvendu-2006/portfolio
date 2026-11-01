/**
 * WakaTime "coded today" — real editor time via OAuth2 (API-key auth was
 * retired by WakaTime for reading data). Uses WAKATIME_REFRESH_TOKEN +
 * WAKATIME_CLIENT_ID/SECRET to mint short-lived access tokens, then
 * reads today's durations. Without those env vars the route answers 501
 * and the card hides itself (no fake data, ever).
 */

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }
  const refresh = process.env.WAKATIME_REFRESH_TOKEN;
  const clientId = process.env.WAKATIME_CLIENT_ID;
  const clientSecret = process.env.WAKATIME_CLIENT_SECRET;
  if (!refresh || !clientId || !clientSecret) return null;

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
}

export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return Response.json({ error: "wakatime_not_connected" }, { status: 501 });
  }
  try {
    const res = await fetch(
      "https://api.wakatime.com/api/v1/users/current/durations?date=today",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 120 },
      }
    );
    if (!res.ok) {
      return Response.json({ error: "wakatime_unavailable" }, { status: 502 });
    }
    const json = await res.json();
    const chunks = Array.isArray(json.data) ? json.data : [];

    const digital = json.cumulative_total?.digital ?? "0:00";
    const [h, m] = digital.split(":").map(Number);
    const totalText = `${h}h ${String(m).padStart(2, "0")}m`;

    // "coding now" = a duration chunk ends within the last 2 minutes.
    // Chunk times are decimal hours from midnight in the account timezone
    // (set WakaTime to Kolkata so this lines up with IST).
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
