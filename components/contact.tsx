"use client";

import { useState } from "react";
import { email as publicEmail } from "@/data/content";
import { MaskReveal } from "@/components/mask-reveal";
import { Reveal } from "@/components/reveal";

type FormState = "idle" | "sending" | "sent" | "error";

export function Contact() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [mailtoUrl, setMailtoUrl] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const senderEmail = String(data.get("email") || "").trim();
    const msgText = String(data.get("message") || "").trim();

    if (!name || !senderEmail || !msgText) return;

    // Guaranteed destination email (never exposed in static HTML)
    const targetEmail = "iitsuvendu@gmail.com";
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${senderEmail}\n\nMessage:\n${msgText}`
    );
    const directMailto = `mailto:${targetEmail}?subject=${subject}&body=${body}`;

    setMailtoUrl(directMailto);
    setState("sending");

    // Trigger direct navigation immediately during user touch/click gesture
    // to bypass mobile browser popup/redirect blockers
    try {
      const link = document.createElement("a");
      link.href = directMailto;
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // Fallback button below ensures 100% reachability
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: senderEmail,
          message: msgText,
        }),
      });

      const json = await res.json().catch(() => ({}));
      setState("sent");

      if (res.ok && json.ok && json.deliveredViaApi) {
        setMessage("Message sent directly — I'll get back to you soon.");
        setMailtoUrl(null);
        form.reset();
      } else {
        setMessage("If your mail app didn't open automatically, tap below:");
      }
    } catch {
      setState("sent");
      setMessage("If your mail app didn't open automatically, tap below:");
    }
  }

  return (
    <section id="contact" aria-label="Contact" className="scroll-mt-20 border-t border-line py-20 sm:py-28">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Reveal>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-accent">
              04 · Contact
            </p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              <MaskReveal delay={0.08}>Let&rsquo;s build something</MaskReveal>
            </h2>
            <p className="mt-3 text-base leading-relaxed text-soft">
              Internships, collaborations, or just a question about one of the projects — all of it lands in the same place.
            </p>

            {publicEmail ? (
              <a
                href={`mailto:${publicEmail}`}
                className="group mt-8 block rounded-xl border border-line bg-panel p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50"
              >
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Email</p>
                <p className="mt-1 text-lg font-semibold text-ink">{publicEmail}</p>
              </a>
            ) : null}
          </Reveal>

          <Reveal delay={0.1}>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="contact-name" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  required
                  autoComplete="name"
                  className="w-full rounded-lg border border-line bg-panel px-4 py-3 text-base sm:text-sm text-ink placeholder:text-muted focus-visible:outline-accent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-line bg-panel px-4 py-3 text-base sm:text-sm text-ink placeholder:text-muted focus-visible:outline-accent"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  className="w-full rounded-lg border border-line bg-panel px-4 py-3 text-base sm:text-sm text-ink placeholder:text-muted focus-visible:outline-accent"
                  placeholder="What's on your mind?"
                />
              </div>
              <button
                type="submit"
                disabled={state === "sending"}
                className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {state === "sending" ? "Preparing message…" : "Send message"}
              </button>

              {message && (
                <p aria-live="polite" className={`text-sm ${state === "error" ? "text-muted" : "text-ink"}`}>
                  {message}
                </p>
              )}

              {state === "sent" && mailtoUrl && (
                <a
                  href={mailtoUrl}
                  className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3.5 text-center text-sm font-bold text-bg shadow-md transition-all hover:brightness-110 active:scale-95"
                >
                  <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Tap Here to Open Mail App &amp; Send
                </a>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
