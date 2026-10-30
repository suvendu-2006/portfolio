import { NextResponse } from "next/server";

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

  const toEmail = process.env.CONTACT_TO_EMAIL || "iitsuvendu@gmail.com";

  // If RESEND_API_KEY is configured in Vercel / environment, deliver directly via Resend API
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>",
          to: toEmail,
          reply_to: email,
          subject: `Portfolio message from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        }),
      });

      if (res.ok) {
        return NextResponse.json({
          ok: true,
          message: "Message sent — I'll get back to you soon.",
        });
      }

      const err = await res.json().catch(() => null);
      console.error("Resend error:", err);
    } catch (err) {
      console.error("Failed to send email via Resend:", err);
    }
  }

  // Seamless fallback when RESEND_API_KEY is pending:
  // Returns mailto payload so client can trigger direct mail compose to toEmail
  const subject = `Portfolio message from ${name}`;
  const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
  const mailto = `mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return NextResponse.json({
    ok: true,
    fallback: "mailto",
    mailto,
    message: "Opening your email app to complete sending to Suvendu...",
  });
}
