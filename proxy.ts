import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/api/auth", "/api/debug"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  const session = await getSessionFromRequest(req);

  if (!session) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && !session.rh) {
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = "/inicio";
    return NextResponse.redirect(homeUrl);
  }

  if (pathname.startsWith("/api/admin") && !session.rh) {
    return NextResponse.json({ ok: false, error: "Acesso restrito." }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
