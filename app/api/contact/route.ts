import { NextResponse } from "next/server";
import { Resend } from "resend";

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

  const apiKey =
    process.env.RESEND_API_KEY || "RESEND_API_KEY_REDACTED";
  const toEmail =
    process.env.CONTACT_TO_EMAIL || "sahoosuvendukumar84@gmail.com";

  try {
    const resend = new Resend(apiKey);

    const { data: resData, error } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: [toEmail],
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 8px;">
          <h2 style="color: #10b981; margin-top: 0;">New Message from Portfolio</h2>
          <p style="margin: 8px 0;"><strong>Sender Name:</strong> ${name}</p>
          <p style="margin: 8px 0;"><strong>Sender Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
          <p style="margin-bottom: 6px;"><strong>Message:</strong></p>
          <div style="background-color: #f9fafb; padding: 14px 18px; border-radius: 6px; border-left: 4px solid #10b981; white-space: pre-wrap; font-size: 15px; color: #1f2937;">${message}</div>
          <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">Hit "Reply" to reply directly to ${name} (${email}).</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(error.message);
    }

    return NextResponse.json({
      ok: true,
      deliveredViaApi: true,
      id: resData?.id,
      message: "Message sent — I'll get back to you soon.",
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to deliver message via API";
    console.error("Failed to send email via Resend:", errorMessage);

    // Fallback: mailto link for client if needed
    const subject = `Portfolio message from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const mailto = `mailto:${toEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    return NextResponse.json(
      {
        ok: false,
        deliveredViaApi: false,
        fallback: "mailto",
        mailto,
        message: "Couldn't send via mail server. Tap below to send via your mail app.",
      },
      { status: 500 }
    );
  }
}
