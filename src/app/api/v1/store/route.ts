import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { generateId } from "@/pkg/id";

export const runtime = "edge";

type StoreRequest = {
  encrypted: string;
  ttl?: number;
  reads: number;
  iv: string;
};

const redis = Redis.fromEnv();

export async function POST(req: NextRequest) {
  const { encrypted, ttl, reads, iv } = (await req.json()) as StoreRequest;

  const id = generateId();
  const key = ["envshare", id].join(":");

  const tx = redis.multi();

  tx.hset(key, {
    remainingReads: reads > 0 ? reads : null,
    encrypted,
    iv,
  });
  if (ttl) {
    tx.expire(key, ttl);
  }
  tx.incr("envshare:metrics:writes");

  await tx.exec();

  return NextResponse.json({ id });
}
