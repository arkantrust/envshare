import { handle } from "@hono/vercel";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { Redis } from "@upstash/redis";
import { bodyLimit } from "hono/body-limit";
import { HTTPException } from "hono/http-exception";
import { secureHeaders } from "hono/secure-headers";

import {
  ErrorResponse,
  LoadQuery,
  LoadResponse,
  StatsResponse,
  StoreBody,
  StoreResponse,
} from "@/lib/api/schemas";
import { MAX_BODY_BYTES } from "@/pkg/constants";
import { generateId } from "@/pkg/id";

const redis = Redis.fromEnv({ automaticDeserialization: false });

const json = <T extends object>(schema: T, description: string) => ({
  content: { "application/json": { schema } },
  description,
});

/**
 * Atomically reads a document: counts the read, decrements the remaining reads
 * and deletes the document when the limit is reached. Returns nil when missing.
 * remainingReads is -1 for unlimited documents.
 */
const LOAD_SCRIPT = `
local k = KEYS[1]
local enc = redis.call('HGET', k, 'encrypted')
if not enc then return nil end
local iv = redis.call('HGET', k, 'iv')
local rr = redis.call('HGET', k, 'remainingReads')
local remaining = -1
if rr and rr ~= 'null' then
  local n = tonumber(rr)
  if n == nil or n < 1 then
    redis.call('DEL', k)
    return nil
  end
  n = n - 1
  remaining = n
  if n < 1 then
    redis.call('DEL', k)
  else
    redis.call('HSET', k, 'remainingReads', n)
  end
end
redis.call('INCR', 'envshare:metrics:reads')
return { enc, iv, remaining }
`;

const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        { error: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") },
        400,
      );
    }
  },
}).basePath("/api/v1");

app.use(secureHeaders());
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

app.use(
  "/store",
  bodyLimit({
    maxSize: MAX_BODY_BYTES,
    onError: (c) => c.json({ error: "Payload too large" }, 413),
  }),
);

app.openapi(
  createRoute({
    method: "post",
    path: "/store",
    summary: "Store an encrypted document",
    request: { body: { content: { "application/json": { schema: StoreBody } }, required: true } },
    responses: {
      200: json(StoreResponse, "The document id"),
      400: json(ErrorResponse, "Invalid body"),
      413: json(ErrorResponse, "Payload too large"),
    },
  }),
  async (c) => {
    const { encrypted, iv, reads, ttl } = c.req.valid("json");
    const id = generateId();
    const key = ["envshare", id].join(":");

    const tx = redis.multi();
    tx.hset(key, { encrypted, iv, ...(reads > 0 ? { remainingReads: reads } : {}) });
    tx.expire(key, ttl);
    tx.incr("envshare:metrics:writes");
    await tx.exec();

    return c.json({ id }, 200);
  },
);

app.openapi(
  createRoute({
    method: "get",
    path: "/load",
    summary: "Load an encrypted document",
    description: "Counts as a read: the document is deleted once its read limit is reached.",
    request: { query: LoadQuery },
    responses: {
      200: json(LoadResponse, "The encrypted document"),
      400: json(ErrorResponse, "Invalid id"),
      404: json(ErrorResponse, "Not found, expired or already read"),
    },
  }),
  async (c) => {
    const { id } = c.req.valid("query");
    const result = await redis.eval<string[], [string, string, number] | null>(
      LOAD_SCRIPT,
      [["envshare", id].join(":")],
      [],
    );
    if (!result) {
      return c.json({ error: "Not Found" }, 404);
    }
    const [encrypted, iv, remaining] = result;
    return c.json(
      {
        encrypted: String(encrypted),
        iv: String(iv),
        remainingReads: Number(remaining) < 0 ? null : Number(remaining),
      },
      200,
    );
  },
);

app.openapi(
  createRoute({
    method: "get",
    path: "/stats",
    summary: "Usage statistics",
    responses: {
      200: json(StatsResponse, "Total reads and writes"),
      503: json(ErrorResponse, "Stats unavailable"),
    },
  }),
  async (c) => {
    try {
      const [reads, writes] = await redis
        .pipeline()
        .get("envshare:metrics:reads")
        .get("envshare:metrics:writes")
        .exec<[string | null, string | null]>();
      c.header("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
      return c.json({ reads: Number(reads ?? 0), writes: Number(writes ?? 0) }, 200);
    } catch (e) {
      console.error("Failed to load stats", e);
      return c.json({ error: "Stats unavailable" }, 503);
    }
  },
);

app.doc("/openapi.json", {
  openapi: "3.0.3",
  info: {
    title: "EnvShare API",
    version: "1.0.0",
    description: "Store and load client-side encrypted documents. The server never sees the key.",
  },
});
app.get("/docs", Scalar({ url: "/api/v1/openapi.json", theme: "default" }));

export const GET = handle(app);
export const POST = handle(app);
