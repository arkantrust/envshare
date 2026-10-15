export const ID_LENGTH = 16;
export const ENCRYPTION_KEY_LENGTH = 128;
export const LATEST_KEY_VERSION = 2;

/** Plaintext limit enforced by the client (16kb); AES-GCM adds a 16 byte tag and base58 ~1.37x. */
export const MAX_ENCRYPTED_LENGTH = 24_000;
export const MAX_BODY_BYTES = 32 * 1024;
export const MAX_READS = 100_000;
export const MAX_TTL_SECONDS = 30 * 24 * 60 * 60;
export const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60;
