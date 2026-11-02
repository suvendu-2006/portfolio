import { githubUser } from "@/data/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Proxy for the public GitHub contributions calendar.
 * Serves fresh data with low-latency cache.
 */
let cache: { at: number; data: any } = { at: 0, data: null };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("y") || String(new Date().getFullYear());

  if (cache.data && Date.now() - cache.at < 60000) {
    return Response.json(cache.data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  }

  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${githubUser}?y=${year}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      if (cache.data) {
        return Response.json(cache.data, {
          headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
        });
      }
      return Response.json({ error: "github_unavailable" }, { status: 502 });
    }
    const data = await res.json();
    const payload = { total: data.total ?? {}, contributions: data.contributions ?? [] };
    cache = { at: Date.now(), data: payload };
    return Response.json(payload, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  } catch {
    if (cache.data) {
      return Response.json(cache.data, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
      });
    }
    return Response.json({ error: "github_unavailable" }, { status: 502 });
  }
}
