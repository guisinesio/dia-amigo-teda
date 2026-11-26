import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { createRateLimiter } from "@/lib/rate-limit";

// ─── Rate limiting ────────────────────────────────────────────────────────────
// 10 login attempts per IP per minute.
const loginLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

// Paths that do not require authentication
const PUBLIC_PATHS = ["/login", "/api/auth", "/api/ping"];

// ─── Proxy ────────────────────────────────────────────────────────────────────
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rate-limit POST /api/auth (login endpoint)
  if (pathname === "/api/auth" && req.method === "POST") {
    const ip = getClientIp(req);
    if (!loginLimiter.check(ip)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Muitas tentativas de login. Aguarde alguns minutos.",
        },
        { status: 429 }
      );
    }
  }

  // Allow public paths without authentication
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // All other routes require a valid session
  const session = await getSessionFromRequest(req);

  if (!session) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Admin pages/APIs require RH role
  if (pathname.startsWith("/admin") && !session.rh) {
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = "/inicio";
    return NextResponse.redirect(homeUrl);
  }

  if (pathname.startsWith("/api/admin") && !session.rh) {
    return NextResponse.json(
      { ok: false, error: "Acesso restrito." },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

// Match all routes except static assets
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|svg|webp|ico|css|js|woff2?|ttf)$).*)",
  ],
};
