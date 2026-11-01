import { githubUser } from "@/data/content";

/**
 * Cached proxy for public GitHub push activity + direct commits from the
 * active repos. Push events only exist for pushes made while a repo was
 * public, so the portfolio's own commits come straight from its commits
 * endpoint — this is what makes today's work show up immediately.
 */
const ACTIVE_REPOS = ["portfolio", "mplads-intelligence-portal", "allcited"];

export async function GET() {
  const UA = { "User-Agent": "shuv-portfolio" };
  try {
    const now = Date.now();
    const weekAgo = new Date(now - 7 * 86400_000).toISOString();

    const [eventsRes, ...commitRes] = await Promise.all([
      fetch(`https://api.github.com/users/${githubUser}/events/public?per_page=30`, {
        headers: UA,
        next: { revalidate: 300 },
      }),
      ...ACTIVE_REPOS.map((repo) =>
        fetch(
          `https://api.github.com/repos/${githubUser}/${repo}/commits?since=${weekAgo}&per_page=100`,
          { headers: UA, next: { revalidate: 300 } }
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

    // direct commits from the active repos — these exist even for pushes
    // that happened while a repo was still private
    let repoCommits = 0;
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

    return Response.json(
      { pushesWeek, commitsWeek, lastPushHoursAgo, lastPushRepo: lastPushRepoName },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } }
    );
  } catch {
    return Response.json({ error: "github_unavailable" }, { status: 502 });
  }
}
