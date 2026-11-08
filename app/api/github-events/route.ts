import { githubUser } from "@/data/content";
import fallbackContributions from "@/data/github-contributions-fallback.json";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Cached proxy for public GitHub push activity + direct commits from the
 * active repos. Computes this month's live commit count alongside today & weekly stats.
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
    // Start of today and start of current month in Asia/Kolkata timezone (UTC + 5:30)
    const kolkataOffsetMs = 5.5 * 3600 * 1000;
    const kolkataNow = new Date(now + kolkataOffsetMs);
    const currentYear = kolkataNow.getUTCFullYear();
    const currentMonthNum = kolkataNow.getUTCMonth() + 1;
    const currentMonthPrefix = `${currentYear}-${String(currentMonthNum).padStart(2, "0")}`;
    const todayIsoDate = `${currentMonthPrefix}-${String(kolkataNow.getUTCDate()).padStart(2, "0")}`;

    const todayStartKolkata = new Date(
      Date.UTC(kolkataNow.getUTCFullYear(), kolkataNow.getUTCMonth(), kolkataNow.getUTCDate()) -
        kolkataOffsetMs
    ).getTime();

    const monthStartKolkata = new Date(
      Date.UTC(kolkataNow.getUTCFullYear(), kolkataNow.getUTCMonth(), 1) -
        kolkataOffsetMs
    ).getTime();

    const weekAgoMs = now - 7 * 86400_000;
    const sinceIso = new Date(Math.min(monthStartKolkata, weekAgoMs)).toISOString();

    const token = process.env.GITHUB_TOKEN;
    const authHeaders = token
      ? { ...UA, Authorization: `Bearer ${token}` }
      : UA;

    const [eventsRes, calendarRes, ...commitRes] = await Promise.all([
      fetch(`https://api.github.com/users/${githubUser}/events/public?per_page=30`, {
        headers: authHeaders,
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      }).catch(() => null),
      fetch(`https://github-contributions-api.jogruber.de/v4/${githubUser}?y=${currentYear}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      }).catch(() => null),
      ...ACTIVE_REPOS.map((repo) =>
        fetch(
          `https://api.github.com/repos/${githubUser}/${repo}/commits?since=${sinceIso}&per_page=100`,
          { headers: authHeaders, cache: "no-store", signal: AbortSignal.timeout(4000) }
        ).catch(() => null)
      ),
    ]);

    let calendarMonthCommits = 0;
    let calendarTodayCommits = 0;
    if (calendarRes && calendarRes.ok) {
      try {
        const calData = await calendarRes.json();
        if (Array.isArray(calData?.contributions)) {
          for (const item of calData.contributions) {
            if (typeof item.date === "string" && item.date.startsWith(currentMonthPrefix)) {
              calendarMonthCommits += Number(item.count || 0);
            }
            if (item.date === todayIsoDate) {
              calendarTodayCommits = Number(item.count || 0);
            }
          }
        }
      } catch {
        /* fallback to live repo commits or snapshot */
      }
    }

    // Fallback to static snapshot if external calendar unavailable
    if (calendarMonthCommits === 0 && Array.isArray(fallbackContributions.contributions)) {
      for (const item of fallbackContributions.contributions) {
        if (typeof item.date === "string" && item.date.startsWith(currentMonthPrefix)) {
          calendarMonthCommits += Number(item.count || 0);
        }
        if (item.date === todayIsoDate) {
          calendarTodayCommits = Number(item.count || 0);
        }
      }
    }

    let pushesWeek = 0;
    let eventsCommitsWeek = 0;
    let eventsCommitsMonth = 0;
    let lastPushAt: string | null = null;
    let lastPushRepo: string | null = null;

    if (eventsRes && eventsRes.ok) {
      try {
        const events = (await eventsRes.json()) as Array<{
          type: string;
          created_at: string;
          repo?: { name: string };
          payload?: { size?: number };
        }>;
        if (Array.isArray(events)) {
          for (const e of events) {
            const at = new Date(e.created_at).getTime();
            if (e.type === "PushEvent") {
              const count = e.payload?.size ?? 1;
              if (now - at <= 7 * 86400_000) {
                pushesWeek += 1;
                eventsCommitsWeek += count;
              }
              if (at >= monthStartKolkata) {
                eventsCommitsMonth += count;
              }
              if (!lastPushAt) {
                lastPushAt = e.created_at;
                lastPushRepo = e.repo?.name.split("/")[1] ?? null;
              }
            }
          }
        }
      } catch {
        /* ignore parse errors */
      }
    }

    // Direct commits from the active repos
    let repoCommitsWeek = 0;
    let repoCommitsMonth = 0;
    let repoCommitsToday = 0;
    let repoLastAt: string | null = null;
    let repoLastName: string | null = null;

    const commitLists = await Promise.all(
      commitRes.map((r, i) =>
        r && r.ok
          ? (r.json() as Promise<Array<{ commit: { author: { date: string } } }>>).catch(() => [])
          : Promise.resolve([])
      ).map((p, i) => p.then((list) => ({ list: Array.isArray(list) ? list : [], repo: ACTIVE_REPOS[i] })))
    );

    for (const { list, repo } of commitLists) {
      for (const c of list) {
        const at = c.commit?.author?.date;
        if (!at) continue;
        const atMs = new Date(at).getTime();
        if (atMs >= weekAgoMs) {
          repoCommitsWeek += 1;
        }
        if (atMs >= monthStartKolkata) {
          repoCommitsMonth += 1;
        }
        if (atMs >= todayStartKolkata) {
          repoCommitsToday += 1;
        }
        if (!repoLastAt || at > repoLastAt) {
          repoLastAt = at;
          repoLastName = repo;
        }
      }
    }

    const commitsWeek = Math.max(eventsCommitsWeek + repoCommitsWeek, 0);
    const commitsToday = Math.max(calendarTodayCommits, repoCommitsToday);
    const commitsMonth = Math.max(calendarMonthCommits, repoCommitsMonth, eventsCommitsMonth);

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
      commitsMonth,
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
