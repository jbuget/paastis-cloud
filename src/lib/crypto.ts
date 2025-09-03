import crypto from "crypto";

// Encryption format versions
// v1: "v1:keyId:iv:ciphertext:tag" (all base64). KeyId comes from ENCRYPTION_KEYS.
// legacy: "iv:ciphertext:tag" using key derived from AUTH_SECRET (kept for backward compatibility).

type Keyring = { primaryId: string | null; keys: Record<string, Buffer> };

function parseKeyring(): Keyring {
  const raw = process.env.ENCRYPTION_KEYS || ""; // format: id:base64,id2:base64
  const entries = raw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((pair) => {
      const [id, keyB64] = pair.split(":");
      if (!id || !keyB64) return null;
      const buf = Buffer.from(keyB64, "base64");
      if (buf.length !== 32) return null; // AES-256 requires 32 bytes
      return [id, buf] as const;
    })
    .filter(Boolean) as Array<readonly [string, Buffer]>;

  const keys: Record<string, Buffer> = {};
  for (const [id, buf] of entries) keys[id] = buf;

  const configuredPrimary = process.env.ENCRYPTION_PRIMARY_KEY_ID || null;
  const primaryId = configuredPrimary && keys[configuredPrimary] ? configuredPrimary : entries[0]?.[0] || null;

  return { primaryId, keys };
}

function legacyKey(): Buffer {
  const secret = process.env.AUTH_SECRET || "dev-secret-change-me";
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptToString(plaintext: string): string {
  const { primaryId, keys } = parseKeyring();
  const iv = crypto.randomBytes(12);
  const key = primaryId ? keys[primaryId] : legacyKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  if (primaryId) {
    return `v1:${primaryId}:${iv.toString("base64")}:${enc.toString("base64")}:${tag.toString("base64")}`;
  }
  // Fallback to legacy format if no keyring configured
  return `${iv.toString("base64")}:${enc.toString("base64")}:${tag.toString("base64")}`;
}

type DecryptMeta = { scheme: "v1" | "legacy"; keyId: string | null };

export function decryptFromString(payload: string): string {
  return decryptWithMetadata(payload).plaintext;
}

export function decryptWithMetadata(payload: string): { plaintext: string; meta: DecryptMeta } {
  const parts = payload.split(":");
  if (parts.length === 5 && parts[0] === "v1") {
    const [, keyId, ivB64, encB64, tagB64] = parts;
    const { keys } = parseKeyring();
    const key = keys[keyId];
    if (!key) throw new Error("Unknown encryption key id");
    const iv = Buffer.from(ivB64, "base64");
    const enc = Buffer.from(encB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return { plaintext: dec.toString("utf8"), meta: { scheme: "v1", keyId } };
  }

  // Legacy format support
  if (parts.length === 3) {
    const [ivB64, encB64, tagB64] = parts;
    const key = legacyKey();
    const iv = Buffer.from(ivB64, "base64");
    const enc = Buffer.from(encB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return { plaintext: dec.toString("utf8"), meta: { scheme: "legacy", keyId: null } };
  }

  throw new Error("Invalid ciphertext format");
}
