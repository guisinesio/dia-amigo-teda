import { refreshSession } from "@/lib/session";
import { ok, err } from "@/lib/api-helpers";

/**
 * POST /api/auth/refresh
 * Re-issues the session cookie with a fresh expiry (sliding window).
 * Called by the client whenever the user is active, to keep the session alive.
 */
export async function POST() {
  const refreshed = await refreshSession();
  if (!refreshed) return err("Sessão expirada.", 401);
  return ok({ refreshed: true });
}
