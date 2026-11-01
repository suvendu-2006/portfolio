/**
 * Kicks off the WakaTime OAuth flow — redirects the visitor to
 * wakatime.com to approve read_stats access for this site.
 */
export async function GET(request: Request) {
  const clientId = process.env.WAKATIME_CLIENT_ID;
  if (!clientId) {
    return new Response(
      "WakaTime OAuth app not configured yet — WAKATIME_CLIENT_ID is missing.",
      { status: 501, headers: { "Content-Type": "text/plain" } }
    );
  }
  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/wakatime/callback`;
  const authorizeUrl =
    `https://wakatime.com/oauth/authorize` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&response_type=code` +
    `&scope=read_stats` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;
  return Response.redirect(authorizeUrl, 302);
}
