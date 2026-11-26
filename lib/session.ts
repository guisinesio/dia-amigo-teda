import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const COOKIE_NAME = "da_session";

/**
 * Inactivity timeout: session expires after this many hours without activity.
 * Centralised here — change SESSION_TIMEOUT_HOURS in .env to adjust.
 */
export const SESSION_TIMEOUT_HOURS = parseInt(
  process.env.SESSION_TIMEOUT_HOURS ?? "8"
);
const JWT_EXPIRY = `${SESSION_TIMEOUT_HOURS}h` as const;

function getSecret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET não configurado.");
  return new TextEncoder().encode(s);
}

export interface SessionPayload extends JWTPayload {
  matricula: string;
  nome: string;
  setor: string;
  fotoDriveId?: string | null;
  rh: boolean;
}

export async function createSession(
  payload: Omit<SessionPayload, keyof JWTPayload>
) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // No maxAge / expires → session cookie.
    // Browsers delete session cookies when the window/tab is closed,
    // requiring the user to log in again on the next visit.
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(
  req: NextRequest
): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Re-issue the session cookie with a fresh expiry, implementing a sliding
 * inactivity window. Call this from any authenticated action to keep the
 * session alive while the user is active.
 */
export async function refreshSession(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  // Strip standard JWT claims so createSession can re-sign cleanly.
  const { iat, exp, nbf, jti, iss, sub, aud, ...payload } = session;
  await createSession(payload as Omit<SessionPayload, keyof JWTPayload>);
  return true;
}
