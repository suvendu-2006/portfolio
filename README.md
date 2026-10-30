# Shuv — Portfolio (Next.js)

Personal portfolio built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion**, dark-first with a circular-reveal light toggle, and a typed content file.

> Local preview: `npm run dev` → http://localhost:3000
> Production: `npm run build && npm start`

## Repo structure

```
site/                         ← this folder IS the repo (git init here, deploy to Vercel)
├─ app/
│  ├─ layout.tsx              # fonts (next/font), metadata, JSON-LD, theme init
│  ├─ page.tsx                # section order lives here
│  ├─ globals.css             # palette variables (dark + light), .u-line hover animation
│  ├─ opengraph-image.tsx     # OG image generated at the edge
│  ├─ sitemap.ts / robots.ts
│  ├─ api/contact/route.ts    # form backend (TODO: wire Resend)
│  └─ api/spotify/route.ts    # header now-playing (needs 3 Spotify env vars)
├─ components/
│  ├─ nav.tsx                 # links + theme toggle + Spotify now-playing
│  ├─ hero.tsx  proof-strip.tsx  projects.tsx (cards + case-study modal)
│  ├─ skills.tsx  about.tsx  contact.tsx  footer.tsx
│  ├─ section-heading.tsx  reveal.tsx  providers.tsx  theme-toggle.tsx
│  └─ spotify-now.tsx
├─ data/
│  └─ content.ts              ← ★ ALL text, projects, skills, links live here
└─ public/images/             # project screenshots
```

## How to edit content

Open **`data/content.ts`** — everything is typed:

| Change | Field |
|---|---|
| Name / role / one-liner | `site` |
| Stats strip | `proofStrip` |
| Projects (text, tech, images) | `projects[]` |
| Skills ("What I actually use") | `skills[]` |
| About paragraphs | `about.body` |
| Social links | `socials` |
| Email (shows the email card) | `email` |

Project images: drop a file into `public/images/` and reference it in `projects[].image`.

## How to deploy

1. `git init && git add -A && git commit -m "portfolio"` inside `site/`, push to GitHub.
2. On [vercel.com](https://vercel.com) → **Add New → Project** → import the repo → Framework preset: **Next.js** → Deploy. Zero config needed.
3. After deploying, put your real domain into `site.url` in `data/content.ts` (used for sitemap/OG/JSON-LD) and add it to the Vercel domain settings.

## Spotify in the header (top-left)

The header opens with the **official Spotify logo**. Once Spotify is connected, a fixed-size two-line lockup appears next to it — a tiny label ("Now playing" / "Recently played") over the song name. Clicking the lockup opens that track on Spotify. It stays silent until the env vars exist, so the site never shows broken data.

To connect it:

1. Create an app at [developer.spotify.com](https://developer.spotify.com/dashboard) (add your Vercel domain as the redirect URL — do this after the first deploy).
2. Visit the authorize URL with scopes `user-read-currently-playing user-read-recently-played`, approve, and copy the `code` from the redirected URL.
3. Exchange it once for a refresh token:
   ```bash
   curl -X POST https://accounts.spotify.com/api/token \
     -H "Authorization: Basic $(printf '%s:%s' "$SPOTIFY_CLIENT_ID" "$SPOTIFY_CLIENT_SECRET" | base64)" \
     -d grant_type=authorization_code -d code=THE_CODE -d redirect_uri=YOUR_REDIRECT_URI
   ```
4. Set `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` in Vercel (and in `site/.env.local` for local dev). The header widget appears automatically.
5. To preview the styling without keys, set `SPOTIFY_DEMO=1` — the widget shows sample data.

## Environment variables

| Var | Required | Purpose |
|---|---|---|
| `RESEND_API_KEY` | only for the contact form | Enables `/api/contact` to deliver messages (see `app/api/contact/route.ts`) |
| `CONTACT_TO_EMAIL` | only for the contact form | Where form messages are delivered |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` / `SPOTIFY_REFRESH_TOKEN` | only for the header widget | Live now-playing (see "Spotify in the header") |
| `SPOTIFY_DEMO` | no | `1` = preview the widget with sample data |

Without them the site builds and runs fine — the form politely reports it isn't connected yet and the Spotify slot stays hidden.

## TODOs you must fill

1. **`site.url`** in `data/content.ts` — your production domain after the first Vercel deploy.
2. **ORBIT AI** — one-line status (`projects[1].result`) + live link when it launches.
3. **Allcited repo link** — `projects[2].repo` currently points to your GitHub profile.
4. **Email** — set `email` in `data/content.ts` (shows the email card) and/or wire `RESEND_API_KEY` for the form.
5. **Replace the ORBIT AI placeholder art** (`public/images/orbit.svg`) with a real screenshot when it ships.

## Quality notes

- **Fonts self-hosted via `next/font`** — four, each with one job: Bricolage Grotesque (section headings), Inter (body), Playfair Display (the hero serif matrices), Caveat (the handwritten "— Shuv" signature in About). Zero layout shift.
- **Animations, kept varied on purpose:** the straight-line hover lives only in the header (nav links + Spotify track); project cards lift with an accent border; skill rows draw an accent line down their left edge with a ghost index; section titles slide up through a mask on scroll; the stats strip counts up; the hero letter matrix scrambles in; the theme toggle plays a circular View-Transition reveal. All disabled under `prefers-reduced-motion`.
- **No image zoom on project hover** (removed by request). Case studies open in a modal with the stack grouped as Frontend / Backend / ML — no "Open live site" buttons anywhere.
- Contact form posts to `/api/contact`; your email address never appears in the HTML.
