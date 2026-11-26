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

// ─── Protected pages ──────────────────────────────────────────────────────────
const PROTECTED_PREFIXES = [
  "/inicio",
  "/inbox",
  "/nova-mensagem",
  "/enviadas",
  "/mural",
  "/perfil",
  "/admin",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

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

  // Server-side protection for authenticated pages
  if (isProtected(pathname)) {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/inicio/:path*",
    "/inbox/:path*",
    "/nova-mensagem/:path*",
    "/enviadas/:path*",
    "/mural/:path*",
    "/perfil/:path*",
    "/admin/:path*",
    // Also run on the login endpoint for rate limiting
    "/api/auth",
  ],
};
