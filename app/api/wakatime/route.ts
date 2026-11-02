/**
 * WakaTime API route — tracks pure manual editor typing time.
 * Filters out "AI Coding" to report only hands-on keyboard coding time.
 */

interface StatusBarResponse {
  cached_at?: string;
  data?: {
    grand_total?: {
      hours?: number;
      minutes?: number;
      total_seconds?: number;
      digital?: string;
      text?: string;
    };
    categories?: Array<{
      name: string;
      total_seconds?: number;
      hours?: number;
      minutes?: number;
      digital?: string;
    }>;
    projects?: Array<{
      name: string;
      total_seconds?: number;
    }>;
    languages?: Array<{
      name: string;
    }>;
  };
}

export async function GET() {
  const apiKey = process.env.WAKATIME_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      {
        totalText: "0m",
        hours: 0,
        minutes: 0,
        totalSeconds: 0,
        activeNow: false,
        topProject: null,
        languages: [],
      },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  }

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

    const json = (await res.json()) as StatusBarResponse;
    const categories = Array.isArray(json.data?.categories) ? json.data.categories : [];

    // Strictly filter for manual keyboard coding (exclude any category with "ai")
    const manualCategories = categories.filter((c) => !c.name.toLowerCase().includes("ai"));

    let totalSeconds = 0;
    if (manualCategories.length > 0) {
      totalSeconds = manualCategories.reduce((sum, c) => sum + Number(c.total_seconds || 0), 0);
    } else if (categories.length === 0) {
      // If no categories array is returned, use grand_total
      totalSeconds = Number(json.data?.grand_total?.total_seconds || 0);
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.round((totalSeconds % 3600) / 60);
    const totalText = hours > 0 ? `${hours}h ${String(minutes).padStart(2, "0")}m` : `${minutes}m`;

    const projects = Array.isArray(json.data?.projects) ? json.data.projects : [];
    const topProject = projects[0]?.name ?? null;

    const languages = Array.isArray(json.data?.languages)
      ? json.data.languages.map((l) => l.name)
      : [];

    const cachedAt = json.cached_at ? new Date(json.cached_at).getTime() : 0;
    const activeNow = totalSeconds > 0 && Date.now() - cachedAt < 10 * 60 * 1000;

    return Response.json(
      {
        totalText,
        hours,
        minutes,
        totalSeconds,
        activeNow,
        topProject,
        languages,
      },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch {
    return Response.json({ error: "wakatime_unavailable" }, { status: 502 });
  }
}
