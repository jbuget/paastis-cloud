#!/usr/bin/env node
"use strict";

// Bulk re-encrypt Project.apiKeyEnc to the current primary key.
// Usage: node scripts/reenc-api-keys.js [--dry-run] [--batch-size=200]

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

// Minimal .env loader to avoid extra deps
function loadEnvFrom(file) {
  try {
    const p = path.resolve(process.cwd(), file);
    if (!fs.existsSync(p)) return;
    const content = fs.readFileSync(p, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let [, k, v] = m;
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
      if (!(k in process.env)) process.env[k] = v;
    }
  } catch {}
}

// Load .env by default so Node scripts have the same env as Prisma/Next
loadEnvFrom(".env");

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { dryRun: false, batchSize: 200 };
  for (const a of args) {
    if (a === "--dry-run") opts.dryRun = true;
    else if (a.startsWith("--batch-size=")) {
      const n = Number(a.split("=")[1]);
      if (Number.isFinite(n) && n > 0) opts.batchSize = n;
    }
  }
  return opts;
}

function parseKeyring() {
  const raw = process.env.ENCRYPTION_KEYS || ""; // id:base64,id2:base64
  const entries = raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((pair) => {
      const [id, keyB64] = pair.split(":");
      if (!id || !keyB64) return null;
      const buf = Buffer.from(keyB64, "base64");
      if (buf.length !== 32) return null;
      return [id, buf];
    })
    .filter(Boolean);

  const keys = Object.fromEntries(entries);
  const configuredPrimary = process.env.ENCRYPTION_PRIMARY_KEY_ID || null;
  const primaryId = configuredPrimary && keys[configuredPrimary]
    ? configuredPrimary
    : entries[0]?.[0] || null;
  return { primaryId, keys };
}

function legacyKey() {
  const secret = process.env.AUTH_SECRET || "dev-secret-change-me";
  return crypto.createHash("sha256").update(secret).digest();
}

function decrypt(payload) {
  const parts = String(payload).split(":");
  if (parts.length === 5 && parts[0] === "v1") {
    const [, keyId, ivB64, encB64, tagB64] = parts;
    const { keys } = parseKeyring();
    const key = keys[keyId];
    if (!key) throw new Error(`Unknown key id: ${keyId}`);
    const iv = Buffer.from(ivB64, "base64");
    const enc = Buffer.from(encB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return dec.toString("utf8");
  }
  if (parts.length === 3) {
    const [ivB64, encB64, tagB64] = parts;
    const key = legacyKey();
    const iv = Buffer.from(ivB64, "base64");
    const enc = Buffer.from(encB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return dec.toString("utf8");
  }
  throw new Error("Invalid ciphertext format");
}

function encryptV1(plaintext) {
  const { primaryId, keys } = parseKeyring();
  if (!primaryId) throw new Error("No primary key configured (ENCRYPTION_KEYS, ENCRYPTION_PRIMARY_KEY_ID)");
  const key = keys[primaryId];
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${primaryId}:${iv.toString("base64")}:${enc.toString("base64")}:${tag.toString("base64")}`;
}

async function main() {
  const { dryRun, batchSize } = parseArgs();
  const { primaryId } = parseKeyring();
  if (!primaryId) {
    console.error("[ERR] No primary key configured. Set ENCRYPTION_KEYS and ENCRYPTION_PRIMARY_KEY_ID.");
    process.exit(2);
  }

  let cursor = null;
  let processed = 0;
  let updated = 0;
  let failed = 0;

  for (;;) {
    const items = await prisma.project.findMany({
      select: { id: true, apiKeyEnc: true },
      orderBy: { id: "asc" },
      take: batchSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
    if (items.length === 0) break;

    for (const p of items) {
      processed++;
      try {
        const plaintext = decrypt(p.apiKeyEnc);
        const reenc = encryptV1(plaintext);
        if (reenc !== p.apiKeyEnc) {
          if (!dryRun) {
            await prisma.project.update({ where: { id: p.id }, data: { apiKeyEnc: reenc } });
          }
          updated++;
        }
      } catch (e) {
        failed++;
        console.error(`[FAIL] ${p.id}:`, e.message);
      }
    }

    cursor = items[items.length - 1].id;
  }

  console.log(`Done. processed=${processed} updated=${updated} failed=${failed} dryRun=${dryRun}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
