const GAS_TOKEN = process.env.GAS_TOKEN;

export interface GasResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

interface CallOptions {
  action: string;
  payload?: Record<string, unknown>;
  /** Cache TTL em segundos. Se omitido, não há cache. */
  revalidate?: number;
}

export async function callGas<T>({ action, payload, revalidate }: CallOptions): Promise<GasResponse<T>> {
  const GAS_URL = process.env.GAS_WEBAPP_URL;
  if (!GAS_URL) throw new Error("GAS_WEBAPP_URL não configurado.");
  if (!GAS_TOKEN) throw new Error("GAS_TOKEN não configurado.");

  const body = JSON.stringify({ action, token: GAS_TOKEN, ...payload });
  const url = `${GAS_URL}?payload=${encodeURIComponent(body)}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 40_000);

  try {
    const fetchOptions: RequestInit = {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
    };

    // Next.js extended fetch cache para actions de leitura
    if (revalidate !== undefined) {
      (fetchOptions as any).next = { revalidate };
    } else {
      (fetchOptions as any).cache = "no-store";
    }

    const res = await fetch(url, fetchOptions);
    const text = await res.text();

    let json: GasResponse<T>;
    try {
      json = JSON.parse(text);
    } catch {
      console.error(`[GAS] Resposta não-JSON na action "${action}":`, text.slice(0, 400));
      return { ok: false, error: "Resposta inesperada do servidor. Tente novamente." };
    }

    if (!json.ok) {
      console.error(`[GAS] action "${action}" erro:`, json.error);
    }

    return json;
  } catch (err: any) {
    if (err.name === "AbortError") {
      console.error(`[GAS] Timeout na action "${action}"`);
      return { ok: false, error: "O servidor demorou para responder. Tente novamente." };
    }
    console.error(`[GAS] Erro na action "${action}":`, err.message);
    return { ok: false, error: "Erro de conexão com o servidor." };
  } finally {
    clearTimeout(timer);
  }
}
