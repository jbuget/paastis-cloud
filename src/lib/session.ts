import { cookies } from "next/headers";
import crypto from "crypto";

type SessionPayload = {
  sub: string; // user identifier (email)
  iat: number; // issued at (unix seconds)
  exp: number; // expiry (unix seconds)
};

const SESSION_COOKIE = "session";

function getSecret() {
  return process.env.AUTH_SECRET || "dev-secret-change-me";
}

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function signSession(payload: SessionPayload) {
  const secret = getSecret();
  const header = { alg: "HS256", typ: "JWT" };
  const encHeader = base64url(JSON.stringify(header));
  const encPayload = base64url(JSON.stringify(payload));
  const data = `${encHeader}.${encPayload}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest();
  const encSig = base64url(signature);
  return `${data}.${encSig}`;
}

export function verifySession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const secret = getSecret();
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [encHeader, encPayload, encSig] = parts;
  const data = `${encHeader}.${encPayload}`;
  const expected = base64url(
    crypto.createHmac("sha256", secret).update(data).digest()
  );
  if (expected !== encSig) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(encPayload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
        "utf8"
      )
    ) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(email: string, days = 7) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + days * 24 * 60 * 60;
  const token = signSession({ sub: email, iat: now, exp });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(exp * 1000),
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getSessionFromCookies()) !== null;
}
