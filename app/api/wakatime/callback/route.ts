/**
 * WakaTime OAuth callback — exchanges the authorization code for tokens
 * and shows the refresh token once, so it can be stored in the site's
 * environment (the same pattern as the Spotify connection).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return new Response(
      page("Authorization failed or was cancelled — no code came back."),
      { status: 400, headers: { "Content-Type": "text/html" } }
    );
  }
  const clientId = process.env.WAKATIME_CLIENT_ID;
  const clientSecret = process.env.WAKATIME_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return new Response(page("WakaTime OAuth app not configured yet."), {
      status: 501,
      headers: { "Content-Type": "text/html" },
    });
  }
  const redirectUri = `${url.origin}/api/wakatime/callback`;

  const tokenRes = await fetch("https://wakatime.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }),
  });
  if (!tokenRes.ok) {
    return new Response(page(`Token exchange failed (${tokenRes.status}).`), {
      status: 502,
      headers: { "Content-Type": "text/html" },
    });
  }
  const token = (await tokenRes.json()) as { refresh_token?: string };
  if (!token.refresh_token) {
    return new Response(page("No refresh token came back — try authorizing again."), {
      status: 502,
      headers: { "Content-Type": "text/html" },
    });
  }

  return new Response(
    page(
      `<h1>Connected ✓</h1>
       <p>Copy this refresh token and send it to your AI assistant to finish the setup:</p>
       <div class="token">${token.refresh_token}</div>
       <p class="note">It lives only in the site's environment — it never appears on the public site.</p>`
    ),
    { headers: { "Content-Type": "text/html" } }
  );
}

function page(inner: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>WakaTime connected — Suvendu's portfolio</title>
<style>
  body { background: #0a0a0b; color: #f4f4f5; font-family: ui-monospace, Menlo, monospace;
         display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 24px; }
  .card { max-width: 560px; border: 1px solid #27272a; border-radius: 16px; padding: 32px;
          background: #111113; }
  h1 { color: #5fbdaa; font-size: 22px; margin: 0 0 8px; }
  p { color: #a1a1aa; font-size: 14px; line-height: 1.6; }
  .token { background: #0a0a0b; border: 1px solid #27272a; border-radius: 8px;
           padding: 12px; font-size: 12px; word-break: break-all; color: #5fbdaa; }
  .note { font-size: 12px; color: #71717a; }
</style>
</head>
<body><div class="card">${inner}</div></body>
</html>`;
}
