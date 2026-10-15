import { z } from "@hono/zod-openapi";

import {
  DEFAULT_TTL_SECONDS,
  MAX_ENCRYPTED_LENGTH,
  MAX_READS,
  MAX_TTL_SECONDS,
} from "@/pkg/constants";

const base58 = /^[1-9A-HJ-NP-Za-km-z]+$/;

export const StoreBody = z
  .object({
    encrypted: z
      .string()
      .min(1)
      .max(MAX_ENCRYPTED_LENGTH)
      .regex(base58)
      .openapi({ description: "AES-GCM ciphertext, base58 encoded." }),
    iv: z
      .string()
      .min(16)
      .max(32)
      .regex(base58)
      .openapi({ description: "Initialization vector, base58 encoded." }),
    reads: z
      .number()
      .int()
      .min(0)
      .max(MAX_READS)
      .openapi({ description: "Reads before deletion. 0 means unlimited." }),
    ttl: z.number().int().min(1).max(MAX_TTL_SECONDS).default(DEFAULT_TTL_SECONDS).openapi({
      description: "Seconds before the document is deleted. Defaults to 7 days, max 30 days.",
    }),
  })
  .openapi("StoreBody");

export const StoreResponse = z.object({ id: z.string() }).openapi("StoreResponse");

export const LoadQuery = z.object({
  id: z
    .string()
    .min(16)
    .max(32)
    .regex(base58)
    .openapi({ param: { name: "id", in: "query" }, description: "Document id." }),
});

export const LoadResponse = z
  .object({
    iv: z.string(),
    encrypted: z.string(),
    remainingReads: z.number().int().nullable(),
  })
  .openapi("LoadResponse");

export const StatsResponse = z
  .object({ reads: z.number().int(), writes: z.number().int() })
  .openapi("StatsResponse");

export const ErrorResponse = z.object({ error: z.string() }).openapi("ErrorResponse");
