/**
 * Cached proxy for WakaTime coding-time data ("coded today").
 * Requires WAKATIME_API_KEY in the environment — without it the route
 * answers 501 and the card hides itself (no fake data, ever).
 */
export async function GET() {
  const key = process.env.WAKATIME_API_KEY;
  if (!key) {
    return Response.json({ error: "wakatime_not_configured" }, { status: 501 });
  }
  try {
    const res = await fetch(
      "https://api.wakatime.com/api/v1/users/current/durations?date=today",
      {
        headers: { Authorization: `Basic ${Buffer.from(key).toString("base64")}` },
        next: { revalidate: 120 },
      }
    );
    if (!res.ok) {
      return Response.json({ error: "wakatime_unavailable" }, { status: 502 });
    }
    const json = await res.json();
    const chunks = Array.isArray(json.data) ? json.data : [];

    // total time as "Hh MMm" (WakaTime gives digital "H:MM")
    const digital = json.cumulative_total?.digital ?? "0:00";
    const [h, m] = digital.split(":").map(Number);
    const totalText = `${h}h ${String(m).padStart(2, "0")}m`;

    // "coding now" = some duration chunk ends within the last 2 minutes.
    // Chunk times are decimal hours from midnight in the account's
    // timezone (set it to Kolkata so this lines up with IST).
    const secsNowIst = (Date.now() / 1000 + 19800) % 86400;
    const latestEnd = chunks.reduce(
      (max: number, c: { time?: number; duration?: number }) =>
        Math.max(max, (c.time || 0) * 3600 + (c.duration || 0)),
      0
    );
    const activeNow = latestEnd > 0 && secsNowIst - latestEnd <= 120;

    const topProject =
      [...chunks].sort((a, b) => (b.duration || 0) - (a.duration || 0))[0]?.project ?? null;

    return Response.json(
      { totalText, activeNow, topProject },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
    );
  } catch {
    return Response.json({ error: "wakatime_unavailable" }, { status: 502 });
  }
}
