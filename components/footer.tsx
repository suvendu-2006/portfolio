import { site, socials } from "@/data/content";

export function Footer() {
  return (
    <footer className="border-t border-line py-8">
      <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-4 px-5 text-xs text-muted sm:flex-row sm:px-8">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <ul className="flex gap-5">
          {socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-ink"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
