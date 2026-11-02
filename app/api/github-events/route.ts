import { githubUser } from "@/data/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Cached proxy for public GitHub push activity + direct commits from the
 * active repos. Computes today's live commit count alongside 7-day stats.
 */
const ACTIVE_REPOS = ["portfolio", "mplads-intelligence-portal", "allcited"];

let memCache: { at: number; data: any } = { at: 0, data: null };

export async function GET() {
  const UA = { "User-Agent": "shuv-portfolio" };
  const now = Date.now();

  // 30-second micro-cache to stay within unauthenticated GitHub rate limits
  if (memCache.data && now - memCache.at < 30000) {
    return Response.json(memCache.data, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  }

  try {
    const weekAgo = new Date(now - 7 * 86400_000).toISOString();

    // Start of today in Asia/Kolkata timezone (UTC + 5:30)
    const kolkataOffsetMs = 5.5 * 3600 * 1000;
    const kolkataNow = new Date(now + kolkataOffsetMs);
    const todayStartKolkata = new Date(
      Date.UTC(kolkataNow.getUTCFullYear(), kolkataNow.getUTCMonth(), kolkataNow.getUTCDate()) -
        kolkataOffsetMs
    ).getTime();

    const [eventsRes, ...commitRes] = await Promise.all([
      fetch(`https://api.github.com/users/${githubUser}/events/public?per_page=30`, {
        headers: UA,
        cache: "no-store",
      }),
      ...ACTIVE_REPOS.map((repo) =>
        fetch(
          `https://api.github.com/repos/${githubUser}/${repo}/commits?since=${weekAgo}&per_page=100`,
          { headers: UA, cache: "no-store" }
        )
      ),
    ]);

    let pushesWeek = 0;
    let eventsCommits = 0;
    let lastPushAt: string | null = null;
    let lastPushRepo: string | null = null;

    if (eventsRes.ok) {
      const events = (await eventsRes.json()) as Array<{
        type: string;
        created_at: string;
        repo?: { name: string };
        payload?: { size?: number };
      }>;
      for (const e of events) {
        const at = new Date(e.created_at).getTime();
        if (now - at > 7 * 86400_000) break;
        if (e.type === "PushEvent") {
          pushesWeek += 1;
          eventsCommits += e.payload?.size ?? 0;
          if (!lastPushAt) {
            lastPushAt = e.created_at;
            lastPushRepo = e.repo?.name.split("/")[1] ?? null;
          }
        }
      }
    }

    // Direct commits from the active repos
    let repoCommits = 0;
    let commitsToday = 0;
    let repoLastAt: string | null = null;
    let repoLastName: string | null = null;

    const commitLists = await Promise.all(
      commitRes.map((r, i) =>
        r.ok
          ? (r.json() as Promise<Array<{ commit: { author: { date: string } } }>>).catch(() => [])
          : Promise.resolve([])
      ).map((p, i) => p.then((list) => ({ list, repo: ACTIVE_REPOS[i] })))
    );

    for (const { list, repo } of commitLists) {
      for (const c of list) {
        repoCommits += 1;
        const at = c.commit.author.date;
        const atMs = new Date(at).getTime();
        if (atMs >= todayStartKolkata) {
          commitsToday += 1;
        }
        if (!repoLastAt || at > repoLastAt) {
          repoLastAt = at;
          repoLastName = repo;
        }
      }
    }

    const commitsWeek = eventsCommits + repoCommits;
    const lastPushAtFinal =
      repoLastAt && (!lastPushAt || repoLastAt > lastPushAt) ? repoLastAt : lastPushAt;
    const lastPushHoursAgo = lastPushAtFinal
      ? Math.round(((now - new Date(lastPushAtFinal).getTime()) / 3600000) * 10) / 10
      : null;
    const lastPushRepoName =
      lastPushAtFinal === repoLastAt && repoLastName ? repoLastName : lastPushRepo;

    const payload = {
      pushesWeek,
      commitsWeek,
      commitsToday,
      lastPushHoursAgo,
      lastPushRepo: lastPushRepoName,
    };

    memCache = { at: now, data: payload };
    return Response.json(payload, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch {
    if (memCache.data) {
      return Response.json(memCache.data, {
        headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
      });
    }
    return Response.json({ error: "github_unavailable" }, { status: 502 });
  }
}
