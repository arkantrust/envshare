import { describe, it, expect } from "@jest/globals";
import crypto from "node:crypto";

import { decodeCompositeKey, encodeCompositeKey } from "./encoding";
import { generateKey } from "./encryption";
import { generateId } from "./id";

describe("composite key encoding", () => {
  it("encodes and decodes composite keys", async () => {
    for (let i = 0; i < 10000; i++) {
      const id = generateId();
      const key = new Uint8Array(await crypto.subtle.exportKey("raw", await generateKey()));

      const encoded = encodeCompositeKey(1, id, key);

      const decoded = decodeCompositeKey(encoded);
      expect(decoded.id).toEqual(id);
      expect(decoded.encryptionKey).toEqual(key);
    }
  }, 20_000);
});
