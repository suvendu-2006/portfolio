import { githubUser } from "@/data/content";

/**
 * Cached proxy for the public GitHub contributions calendar.
 * The upstream free API is rate-limited, so the site fetches it at most
 * once an hour and every visitor reads from that cache.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("y") || String(new Date().getFullYear());
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${githubUser}?y=${year}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) {
      return Response.json({ error: "github_unavailable" }, { status: 502 });
    }
    const data = await res.json();
    return Response.json(
      { total: data.total ?? {}, contributions: data.contributions ?? [] },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    );
  } catch {
    return Response.json({ error: "github_unavailable" }, { status: 502 });
  }
}
