import { githubUser } from "@/data/content";

/**
 * Cached proxy for public GitHub push activity — powers the
 * "shipping now" status card. Unauthenticated, 5-minute cache.
 */
export async function GET() {
  try {
    const res = await fetch(
      `https://api.github.com/users/${githubUser}/events/public?per_page=30`,
      {
        headers: { "User-Agent": "shuv-portfolio" },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) {
      return Response.json({ error: "github_unavailable" }, { status: 502 });
    }
    const events = (await res.json()) as Array<{
      type: string;
      created_at: string;
      repo?: { name: string };
      payload?: { size?: number };
    }>;

    const now = Date.now();
    let pushesWeek = 0;
    let commitsWeek = 0;
    let lastPushAt: string | null = null;
    let lastPushRepo: string | null = null;

    for (const e of events) {
      const at = new Date(e.created_at).getTime();
      if (now - at > 7 * 86400_000) break; // events come newest-first
      if (e.type === "PushEvent") {
        pushesWeek += 1;
        commitsWeek += e.payload?.size ?? 0;
        if (!lastPushAt) {
          lastPushAt = e.created_at;
          lastPushRepo = e.repo?.name.split("/")[1] ?? null;
        }
      }
    }

    const lastPushHoursAgo = lastPushAt
      ? Math.round(((now - new Date(lastPushAt).getTime()) / 3600000) * 10) / 10
      : null;

    return Response.json(
      { pushesWeek, commitsWeek, lastPushHoursAgo, lastPushRepo },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } }
    );
  } catch {
    return Response.json({ error: "github_unavailable" }, { status: 502 });
  }
}
