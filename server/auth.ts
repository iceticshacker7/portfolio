import { createHash, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";
import { getDb } from "./db.js";
import { HttpError, parseCookies } from "./http.js";

const COOKIE = "session";
const SESSION_DAYS = 7;

export interface Session {
  email: string;
  name?: string;
  picture?: string;
}

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET || "";
  if (secret.length < 32) throw new HttpError(500, "SESSION_SECRET must be at least 32 characters");
  return new TextEncoder().encode(secret);
}

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function createSession(res: ServerResponse, session: Session) {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
  res.setHeader("Set-Cookie", cookie(token, SESSION_DAYS * 86400));
}

export function clearSession(res: ServerResponse) {
  res.setHeader("Set-Cookie", cookie("", 0));
}

function cookie(value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" || process.env.VERCEL ? "; Secure" : "";
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

export async function getSession(req: IncomingMessage): Promise<Session | null> {
  const token = parseCookies(req)[COOKIE];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const email = String(payload.email || "").toLowerCase();
    // Re-check the allowlist so removing an email revokes existing sessions.
    if (!adminEmails().includes(email)) return null;
    return { email, name: payload.name as string | undefined, picture: payload.picture as string | undefined };
  } catch {
    return null;
  }
}

export async function requireAdmin(req: IncomingMessage): Promise<Session> {
  // A custom header can't be sent cross-site without a CORS preflight, which we
  // never grant, so together with SameSite=Strict this blocks CSRF.
  if (req.headers["x-requested-with"] !== "portfolio") throw new HttpError(403, "Missing X-Requested-With header");
  const session = await getSession(req);
  if (!session) throw new HttpError(401, "Not signed in as an admin");
  return session;
}

const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export async function verifyGoogleCredential(credential: string): Promise<Session> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new HttpError(400, "Google sign-in is not configured");
  let payload;
  try {
    ({ payload } = await jwtVerify(credential, googleJwks, {
      audience: clientId,
      issuer: ["accounts.google.com", "https://accounts.google.com"],
    }));
  } catch {
    throw new HttpError(401, "Invalid Google credential");
  }
  const email = String(payload.email || "").toLowerCase();
  if (!payload.email_verified || !adminEmails().includes(email)) {
    throw new HttpError(403, "This Google account is not allowed to manage the portfolio");
  }
  return { email, name: payload.name as string | undefined, picture: payload.picture as string | undefined };
}

// Firebase Authentication (free on the Spark plan) signs users in with Google in the
// browser; the server only verifies the resulting ID token against Google's public keys,
// so no service account or Firebase Admin SDK is needed.
const firebaseJwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

export function firebaseProjectId(): string {
  return process.env.FIREBASE_PROJECT_ID || process.env.VITE_APP_PROJECT_ID || "";
}

export async function verifyFirebaseIdToken(idToken: string): Promise<Session> {
  const projectId = firebaseProjectId();
  if (!projectId) throw new HttpError(400, "Firebase sign-in is not configured");
  let payload;
  try {
    ({ payload } = await jwtVerify(idToken, firebaseJwks, {
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
      algorithms: ["RS256"],
    }));
  } catch {
    throw new HttpError(401, "Invalid Firebase sign-in token");
  }
  const email = String(payload.email || "").toLowerCase();
  if (!payload.email_verified || !adminEmails().includes(email)) {
    throw new HttpError(403, `${email || "This account"} is not allowed to manage the portfolio`);
  }
  return { email, name: payload.name as string | undefined, picture: payload.picture as string | undefined };
}

export function passwordLoginEnabled(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD) && adminEmails().length > 0;
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = createHash("sha256").update(password).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/**
 * Machine-to-machine auth for the LKH sync (see docs/lkh-sync.md): a long random
 * SYNC_TOKEN sent as "Authorization: Bearer <token>". No cookies are involved,
 * so this path needs no CSRF header.
 */
export function requireSyncToken(req: IncomingMessage) {
  const expected = process.env.SYNC_TOKEN || "";
  if (expected.length < 32) throw new HttpError(404, "Sync is not enabled");
  const header = String(req.headers.authorization || "");
  const given = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  if (!given || !timingSafeEqual(a, b)) throw new HttpError(401, "Invalid sync token");
}

/** Fixed-window rate limiter backed by a TTL collection, so it works across serverless instances. */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const db = await getDb();
  const windowStart = Math.floor(Date.now() / 1000 / windowSeconds);
  const id = `${key}:${windowStart}`;
  const doc = await db.collection<{ _id: string; count: number; expiresAt: Date }>("rate_limits").findOneAndUpdate(
    { _id: id },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((windowStart + 1) * windowSeconds * 1000) } },
    { upsert: true, returnDocument: "after" },
  );
  if (doc && doc.count > limit) throw new HttpError(429, "Too many requests, try again later");
}
