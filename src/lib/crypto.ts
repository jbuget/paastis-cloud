import crypto from "crypto";

// AES-256-GCM helpers with secret-derived key

function getKey() {
  const secret = process.env.AUTH_SECRET || "dev-secret-change-me";
  // Derive a 32-byte key with SHA-256 (simple, deterministic).
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptToString(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12); // GCM recommended IV size
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Store as base64 parts joined by ':' to keep it simple in a text column
  return `${iv.toString("base64")}:${enc.toString("base64")}:${tag.toString("base64")}`;
}

export function decryptFromString(payload: string): string {
  const [ivB64, encB64, tagB64] = payload.split(":");
  if (!ivB64 || !encB64 || !tagB64) throw new Error("Invalid ciphertext format");
  const key = getKey();
  const iv = Buffer.from(ivB64, "base64");
  const enc = Buffer.from(encB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString("utf8");
}

