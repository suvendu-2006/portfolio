"use client";

import { useState } from "react";
import { email } from "@/data/content";
import { MaskReveal } from "@/components/mask-reveal";
import { Reveal } from "@/components/reveal";

type FormState = "idle" | "sending" | "sent" | "error";

export function Contact() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setState("sent");
        setMessage(json.message ?? "Message sent.");
        form.reset();
      } else {
        setState("error");
        setMessage(json.message ?? "Something went wrong.");
      }
    } catch {
      setState("error");
      setMessage("Network error — try again in a moment.");
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

            {email ? (
              <a
                href={`mailto:${email}`}
                className="group mt-8 block rounded-xl border border-line bg-panel p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50"
              >
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Email</p>
                <p className="mt-1 text-lg font-semibold text-ink">{email}</p>
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
                  className="w-full rounded-lg border border-line bg-panel px-4 py-3 text-sm text-ink placeholder:text-muted focus-visible:outline-accent"
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
                  className="w-full rounded-lg border border-line bg-panel px-4 py-3 text-sm text-ink placeholder:text-muted focus-visible:outline-accent"
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
                  className="w-full rounded-lg border border-line bg-panel px-4 py-3 text-sm text-ink placeholder:text-muted focus-visible:outline-accent"
                  placeholder="What's on your mind?"
                />
              </div>
              <button
                type="submit"
                disabled={state === "sending"}
                className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {state === "sending" ? "Sending…" : "Send message"}
              </button>
              <p aria-live="polite" className={`text-sm ${state === "error" ? "text-muted" : "text-accent"}`}>
                {state === "sent" ? message : state === "error" ? message : ""}
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
