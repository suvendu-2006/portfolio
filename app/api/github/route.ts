import { githubUser } from "@/data/content";
import fallbackData from "@/data/github-contributions-fallback.json";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Robust proxy for the public GitHub contributions calendar.
 * Serves fresh data with low-latency cache and multi-tiered fallback:
 * 1. GitHub GraphQL API (if GITHUB_TOKEN is set in env)
 * 2. Unofficial contributions API (jogruber.de) with fast 3.5s timeout
 * 3. Direct GitHub HTML scrape with fast 3.5s timeout
 * 4. High-fidelity static snapshot seed (ensures UI NEVER displays an error)
 */
let cache: { at: number; data: any } = { at: 0, data: null };

const LEVEL_MAP: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

async function fetchFromGraphQL(user: string, token: string) {
  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "shuv-portfolio",
    },
    body: JSON.stringify({ query, variables: { login: user } }),
    signal: AbortSignal.timeout(4000),
    cache: "no-store",
  });

  if (!res.ok) return null;
  const json = await res.json();
  const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!cal || !Array.isArray(cal.weeks)) return null;

  const days: Array<{ date: string; count: number; level: number }> = [];
  for (const week of cal.weeks) {
    if (Array.isArray(week.contributionDays)) {
      for (const d of week.contributionDays) {
        days.push({
          date: d.date,
          count: d.contributionCount,
          level: LEVEL_MAP[d.contributionLevel] ?? 0,
        });
      }
    }
  }

  const currentYear = String(new Date().getFullYear());
  return {
    total: {
      [currentYear]: cal.totalContributions,
      lastYear: cal.totalContributions,
    },
    contributions: days,
  };
}

async function fetchFromJogruber(user: string, year: string) {
  const res = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${user}?y=${year}`,
    {
      cache: "no-store",
      signal: AbortSignal.timeout(3500),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data.contributions) || data.contributions.length === 0) return null;
  return {
    total: data.total ?? {},
    contributions: data.contributions,
  };
}

async function fetchFromDirectScrape(user: string, year: string) {
  const res = await fetch(`https://github.com/users/${user}/contributions`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(3500),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const html = await res.text();

  const days: Array<{ date: string; count: number; level: number }> = [];
  const dayRegex = /data-date="([0-9-]+)"[^>]*data-level="([0-9]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = dayRegex.exec(html)) !== null) {
    days.push({
      date: match[1],
      count: Number(match[2]) > 0 ? Number(match[2]) : 0,
      level: Number(match[2]),
    });
  }

  if (!days.length) return null;

  const totalMatch = html.match(/([0-9,]+)\s+contributions/);
  const totalCount = totalMatch ? parseInt(totalMatch[1].replace(/,/g, ""), 10) : days.length;

  return {
    total: {
      [year]: totalCount,
      lastYear: totalCount,
    },
    contributions: days,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("y") || String(new Date().getFullYear());

  if (cache.data && Date.now() - cache.at < 60000) {
    return Response.json(cache.data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  }

  // 1. Try GraphQL if token available
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    try {
      const gqlData = await fetchFromGraphQL(githubUser, token);
      if (gqlData && gqlData.contributions.length > 0) {
        cache = { at: Date.now(), data: gqlData };
        return Response.json(gqlData, {
          headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
        });
      }
    } catch {
      /* continue to fallback tiers */
    }
  }

  // 2. Try Jogruber API (fast timeout)
  try {
    const jogData = await fetchFromJogruber(githubUser, year);
    if (jogData && jogData.contributions.length > 0) {
      cache = { at: Date.now(), data: jogData };
      return Response.json(jogData, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
      });
    }
  } catch {
    /* continue to next tier */
  }

  // 3. Try direct GitHub scrape
  try {
    const scrapeData = await fetchFromDirectScrape(githubUser, year);
    if (scrapeData && scrapeData.contributions.length > 0) {
      cache = { at: Date.now(), data: scrapeData };
      return Response.json(scrapeData, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
      });
    }
  } catch {
    /* continue to static fallback */
  }

  // 4. Return cached data if present
  if (cache.data) {
    return Response.json(cache.data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  }

  // 5. Ultimate fallback: static high-fidelity snapshot so visitor NEVER sees an error
  const fallbackPayload = {
    total: fallbackData.total,
    contributions: fallbackData.contributions,
  };
  return Response.json(fallbackPayload, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}
