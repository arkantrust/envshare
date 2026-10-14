import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

export const runtime = "edge";

const redis = Redis.fromEnv();

export async function GET() {
  try {
    const [reads, writes] = await redis
      .pipeline()
      .get("envshare:metrics:reads")
      .get("envshare:metrics:writes")
      .exec<[number | null, number | null]>();

    return NextResponse.json(
      { reads: reads ?? 0, writes: writes ?? 0 },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (e) {
    console.error("Failed to load stats", e);
    return NextResponse.json({ error: "Stats unavailable" }, { status: 503 });
  }
}
