import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Caveat, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Preloader } from "@/components/preloader";
import { Terminal } from "@/components/terminal";
import { CommandPalette } from "@/components/command-palette";
import { Nav } from "@/components/nav";
import { site, socials } from "@/data/content";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const serif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const hand = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.short}`,
  },
  description: site.oneLiner,
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description: site.oneLiner,
    url: site.url,
    siteName: `${site.short}'s portfolio`,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@subh792465",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  alternateName: site.short,
  jobTitle: "AI/ML builder",
  description: site.oneLiner,
  address: {
    "@type": "PostalAddress",
    addressRegion: "Odisha",
    addressCountry: "IN",
  },
  affiliation: {
    "@type": "CollegeOrUniversity",
    name: site.college,
  },
  sameAs: socials.map((s) => s.href),
  knowsAbout: ["Machine learning", "Python", "C programming", "Web development"],
};

/** Applied before first paint to avoid a theme flash (default is dark) */
const themeInit = `try{if(localStorage.getItem("theme")==="light")document.documentElement.dataset.theme="light"}catch(_){}`;

const consoleSig = `try{
console.log("%c S. ","background:#5fbdaa;color:#0a0a0b;font-size:26px;font-weight:800;border-radius:10px;padding:2px 14px");
console.log("%c shuv was here. found the secret layer? press ~ on the site.","color:#5fbdaa;font-size:12px;font-family:monospace");
console.log("%c hiring? iitsuvendu@gmail.com","color:#a1a1aa;font-size:12px;font-family:monospace");
}catch(_){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${display.variable} ${body.variable} ${serif.variable} ${hand.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script dangerouslySetInnerHTML={{ __html: consoleSig }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-bg font-body text-ink antialiased">
        <Preloader />
        <Terminal />
        <CommandPalette />
        <Providers>
          <Nav />
          {children}
          <div aria-hidden="true" className="grain" />
        </Providers>
      </body>
    </html>
  );
}
