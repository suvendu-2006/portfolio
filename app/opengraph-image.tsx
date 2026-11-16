import { ImageResponse } from "next/og";
import { site } from "@/data/content";

export const runtime = "edge";
export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: "#0a0a0b",
          color: "#f4f4f5",
        }}
      >
        <div
          style={{
            color: "#5fbdaa",
            fontSize: 22,
            letterSpacing: 8,
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          {`${site.location} · AI/ML`}
        </div>
        <div
          style={{
            fontSize: 92,
            fontWeight: 800,
            display: "flex",
            marginTop: 28,
            letterSpacing: -2,
          }}
        >
          {`${site.name}.`}
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#a1a1aa",
            display: "flex",
            marginTop: 24,
            lineHeight: 1.4,
          }}
        >
          AI/ML builder who ships real systems
        </div>
        <div
          style={{
            marginTop: 44,
            display: "flex",
            gap: 14,
            fontSize: 20,
            color: "#8b8b93",
          }}
        >
          <span style={{ display: "flex" }}>SATARK-MPLADS</span>
          <span style={{ display: "flex", color: "#5fbdaa" }}>·</span>
          <span style={{ display: "flex" }}>ORBIT AI</span>
          <span style={{ display: "flex", color: "#5fbdaa" }}>·</span>
          <span style={{ display: "flex" }}>Allcited</span>
        </div>
      </div>
    ),
    size
  );
}
