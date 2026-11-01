"use client";

import { useState } from "react";
import { email as publicEmail } from "@/data/content";
import { MaskReveal } from "@/components/mask-reveal";
import { Reveal } from "@/components/reveal";
import { Scramble } from "@/components/scramble";
import { DrawLine } from "@/components/draw-line";
import { HairLine } from "@/components/hairline";
import { ConnectWithMe } from "@/components/connect-modal";

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

    setState("sending");
    setMessage("");
    setMailtoUrl(null);

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

      if (res.ok && json.ok && json.deliveredViaApi) {
        setState("sent");
        setMessage("Message sent directly — I'll get back to you soon!");
        form.reset();
      } else {
        setState("error");
        setMessage(
          json.message || "Couldn't send directly. You can send via mail app below:"
        );
        if (json.mailto) {
          setMailtoUrl(json.mailto);
        } else {
          const subject = encodeURIComponent(`Portfolio message from ${name}`);
          const body = encodeURIComponent(
            `Name: ${name}\nEmail: ${senderEmail}\n\nMessage:\n${msgText}`
          );
          setMailtoUrl(`mailto:sahoosuvendukumar84@gmail.com?subject=${subject}&body=${body}`);
        }
      }
    } catch {
      setState("error");
      setMessage("Network error. You can send via your mail app directly:");
      const subject = encodeURIComponent(`Portfolio message from ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${senderEmail}\n\nMessage:\n${msgText}`
      );
      setMailtoUrl(`mailto:sahoosuvendukumar84@gmail.com?subject=${subject}&body=${body}`);
    }
  }

  return (
    <section id="contact" aria-label="Contact" className="scroll-mt-20 py-20 sm:py-28">
      <HairLine />
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Reveal>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-accent">
              <Scramble text="04 · Contact" />
            </p>
            <h2 className="text-balance font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              <MaskReveal delay={0.08}>
                Let&rsquo;s build{" "}
                <span className="relative inline-block font-serif font-medium text-accent">
                  something
                  <DrawLine className="bottom-[-6px] h-[2px] bg-accent/70" delay={0.55} />
                </span>
              </MaskReveal>
            </h2>
            <p className="mt-3 text-base leading-relaxed text-soft">
              Internships, collaborations, or just a question about one of the projects — all of it lands in the same place.
            </p>

            <ConnectWithMe />

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
                className="btn-sheen rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {state === "sending" ? "Sending…" : "Send message"}
              </button>

              {message && (
                <p
                  aria-live="polite"
                  className={`text-sm ${
                    state === "sent" ? "text-accent font-medium" : "text-muted"
                  }`}
                >
                  {message}
                </p>
              )}

              {state === "error" && mailtoUrl && (
                <a
                  href={mailtoUrl}
                  className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3.5 text-center text-sm font-bold text-bg shadow-md transition-all hover:brightness-110 active:scale-95"
                >
                  <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Open Mail App to Send
                </a>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
