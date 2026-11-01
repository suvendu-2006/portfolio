import { site, socials } from "@/data/content";
import { LocalTime } from "@/components/local-time";
import { FooterWordmark } from "@/components/footer-wordmark";
import { HairLine } from "@/components/hairline";
import { QuoteDust } from "@/components/quote-dust";

export function Footer() {
  return (
    <footer className="overflow-hidden">
      <HairLine />
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <div className="mt-12 flex justify-center sm:mt-16">
          <div className="w-full max-w-2xl">
            <QuoteDust author="Michael Phelps" />
          </div>
        </div>
        <FooterWordmark text={site.name.split(" ")[0].toUpperCase()} />

        <div className="mt-8 flex flex-col items-center gap-4 border-t border-line py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-xs text-muted sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <ul className="flex gap-2">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-2 py-2 transition-colors hover:text-ink"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <LocalTime />
            <a href="#main" className="inline-block px-2 py-2 transition-colors hover:text-ink">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
