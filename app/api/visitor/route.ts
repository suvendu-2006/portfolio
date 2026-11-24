import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "edge";

const BASE_START_COUNT = 0;
const SALT = process.env.VISITOR_SALT || "shuv_portfolio_visitor_secret_salt_2026";

function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.STORAGE_REST_API_URL ||
    process.env.STORAGE_URL ||
    process.env.REDIS_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.STORAGE_REST_API_TOKEN ||
    process.env.STORAGE_TOKEN ||
    process.env.REDIS_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

async function hashString(str: string): Promise<string> {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const redis = getRedis();

    if (!redis) {
      return NextResponse.json({
        count: 1,
        configured: false,
      });
    }

    // Admin reset to make counter strictly real from 0
    if (searchParams.get("reset") === "real") {
      await redis.del("portfolio:unique_visitors");
      await redis.set("portfolio:visitor_count", 0);
      return NextResponse.json({
        ok: true,
        message: "Reset visitor counter to 0 for real tracking",
        count: 0,
        configured: true,
      });
    }

    const current = (await redis.get<number>("portfolio:visitor_count")) ?? BASE_START_COUNT;
    return NextResponse.json({
      count: current,
      configured: true,
    });
  } catch (err) {
    console.error("Visitor count GET error:", err);
    return NextResponse.json({ count: 1, configured: false });
  }
}

export async function POST(req: Request) {
  try {
    const userAgent = req.headers.get("user-agent") || "";
    const isBot = /bot|crawler|spider|crawling|googlebot|bingbot|lighthouse|vercel|pingdom/i.test(
      userAgent
    );

    const redis = getRedis();

    // If redis is not configured yet, return fallback count
    if (!redis) {
      return NextResponse.json({
        count: 1,
        isNew: false,
        configured: false,
      });
    }

    // Initialize base counter if not present
    const existing = await redis.get<number>("portfolio:visitor_count");
    if (existing === null || existing === undefined) {
      await redis.set("portfolio:visitor_count", 0);
    }

    // Do not count automated bots
    if (isBot) {
      const count = (await redis.get<number>("portfolio:visitor_count")) ?? 1;
      return NextResponse.json({ count, isNew: false, configured: true });
    }

    // Read client payload (optional client-generated UUID)
    let body: { vid?: string } = {};
    try {
      body = await req.json();
    } catch {
      // payload is optional
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Hash IP + UA + Client VID + Salt so no personal data is ever recorded
    const rawFingerprint = `${clientIp}::${userAgent}::${body.vid || "novid"}::${SALT}`;
    const hash = await hashString(rawFingerprint);

    // Atomically check if this fingerprint has been recorded in our unique set
    const isMember = await redis.sismember("portfolio:unique_visitors", hash);

    let count = (await redis.get<number>("portfolio:visitor_count")) ?? 0;
    let isNew = false;

    if (!isMember) {
      // Add hash to unique visitors set
      await redis.sadd("portfolio:unique_visitors", hash);
      // Increment total unique visitor counter
      count = await redis.incr("portfolio:visitor_count");
      isNew = true;
    }

    return NextResponse.json({
      count,
      isNew,
      configured: true,
    });
  } catch (err) {
    console.error("Visitor count POST error:", err);
    return NextResponse.json({
      count: 1,
      isNew: false,
      configured: false,
    });
  }
}
