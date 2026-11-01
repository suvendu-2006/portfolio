import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  const data = await req.json().catch(() => null);
  const name = typeof data?.name === "string" ? data.name.trim() : "Portfolio Visitor";
  const email = typeof data?.email === "string" ? data.email.trim() : "";
  const message = typeof data?.message === "string" ? data.message.trim() : "";
  const isMeeting = data?.type === "meeting";
  const meetingDetails = data?.meetingDetails || null;

  if (!email || (!message && !isMeeting)) {
    return NextResponse.json(
      { ok: false, message: "Email is required." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json(
      { ok: false, message: "Email service not configured (missing RESEND_API_KEY)" },
      { status: 503 }
    );
  }
  const toEmail =
    process.env.CONTACT_TO_EMAIL || "sahoosuvendukumar84@gmail.com";

  try {
    const resend = new Resend(apiKey);

    const emailSubject = isMeeting
      ? `📅 Google Meet Call Request: ${name} · ${meetingDetails?.date || "New Slot"}`
      : `Portfolio message from ${name}`;

    const textContent = isMeeting
      ? `Google Meet 30-min Call Request!\n\nVisitor Name: ${name}\nVisitor Email: ${email}\nDate: ${meetingDetails?.date || "N/A"}\nTime (IST): ${meetingDetails?.timeIst || "N/A"}\nVisitor Local Time: ${meetingDetails?.timeLocal || "N/A"}\nTimezone: ${meetingDetails?.timezone || "N/A"}\n\nHit 'Reply' to email ${name} with your Google Meet link.`
      : `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

    const htmlContent = isMeeting
      ? `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #10b981; border-radius: 12px; background: #ffffff;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <span style="font-size: 26px;">📅</span>
            <h2 style="color: #0f172a; margin: 0; font-size: 20px; font-weight: 700;">Google Meet Call Request</h2>
          </div>
          <p style="color: #475569; font-size: 14px; margin-top: 0;">A visitor requested a 30-minute Google Meet call from your portfolio scheduler.</p>
          
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 18px 0;">
            <p style="margin: 0 0 8px 0; font-size: 15px; color: #166534;"><strong>🗓️ Requested Day:</strong> ${meetingDetails?.date || "N/A"}</p>
            <p style="margin: 0 0 8px 0; font-size: 15px; color: #166534;"><strong>⏰ Slot (IST):</strong> ${meetingDetails?.timeIst || "N/A"}</p>
            <p style="margin: 0; font-size: 13.5px; color: #15803d;"><strong>🌍 Visitor Local Time:</strong> ${meetingDetails?.timeLocal || "N/A"}</p>
          </div>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 18px 0;">
            <p style="margin: 0 0 6px 0; font-size: 14px; color: #334155;"><strong>👤 Visitor Name:</strong> ${name}</p>
            <p style="margin: 0; font-size: 14px; color: #334155;"><strong>✉️ Visitor Email:</strong> <a href="mailto:${email}" style="color: #0284c7; font-weight: 600; text-decoration: underline;">${email}</a></p>
          </div>

          <p style="font-size: 13px; color: #64748b; margin-top: 20px; line-height: 1.5;">
            💡 <strong>Next Step:</strong> Simply hit <strong>"Reply"</strong> to email ${name} directly with your Google Meet link or calendar invitation.
          </p>
        </div>
      `
      : `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #10b981; margin-top: 0;">New Message from Portfolio</h2>
          <p style="margin: 8px 0;"><strong>Sender Name:</strong> ${name}</p>
          <p style="margin: 8px 0;"><strong>Sender Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
          <p style="margin-bottom: 6px;"><strong>Message:</strong></p>
          <div style="background-color: #f9fafb; padding: 14px 18px; border-radius: 6px; border-left: 4px solid #10b981; white-space: pre-wrap; font-size: 15px; color: #1f2937;">${message}</div>
          <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">Hit "Reply" to reply directly to ${name} (${email}).</p>
        </div>
      `;

    const { data: resData, error } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: [toEmail],
      replyTo: email,
      subject: emailSubject,
      text: textContent,
      html: htmlContent,
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
