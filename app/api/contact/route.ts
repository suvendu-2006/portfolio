import { NextResponse } from "next/server";

/**
 * Contact form backend — TODO (yours to wire):
 *
 * The form on the site posts JSON { name, email, message } here. To receive
 * the messages, either:
 *   1. Sign up at resend.com (free tier), verify your domain or use your own
 *      email as the "from", then set RESEND_API_KEY in your environment
 *      (.env.local locally, Vercel dashboard in production), and uncomment
 *      the send block below; or
 *   2. Point the form at a form service (e.g. Formspree) instead.
 *
 * Your email address is never rendered into the site's HTML either way.
 */
export async function POST(req: Request) {
  const data = await req.json().catch(() => null);
  const name = typeof data?.name === "string" ? data.name.trim() : "";
  const email = typeof data?.email === "string" ? data.email.trim() : "";
  const message = typeof data?.message === "string" ? data.message.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, message: "All fields are required." },
      { status: 400 }
    );
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "The form backend isn't connected yet (TODO: add RESEND_API_KEY). Reach out via LinkedIn, X or GitHub for now.",
      },
      { status: 501 }
    );
  }

  // TODO: uncomment after adding RESEND_API_KEY + a verified "from" address
  // const res = await fetch("https://api.resend.com/emails", {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     from: "portfolio@yourdomain.com",
  //     to: process.env.CONTACT_TO_EMAIL,
  //     reply_to: email,
  //     subject: `Portfolio message from ${name}`,
  //     text: message,
  //   }),
  // });
  // if (!res.ok) return NextResponse.json({ ok: false, message: "Send failed." }, { status: 502 });
  // return NextResponse.json({ ok: true, message: "Message sent — I'll get back to you soon." });

  return NextResponse.json(
    { ok: false, message: "TODO: send block is commented out in app/api/contact/route.ts." },
    { status: 501 }
  );
}
