import "server-only";

/** Logs detalhados de request/response (prefixo de chave, corpo completo). Desligado em produção salvo `ASAAS_DEBUG=true`. */
function asaasDiagnosticsEnabled(): boolean {
  return (
    process.env.ASAAS_DEBUG === "true" ||
    process.env.NODE_ENV === "development"
  );
}

function diagLog(...args: Parameters<typeof console.log>): void {
  if (asaasDiagnosticsEnabled()) console.log(...args);
}

/**
 * Cliente mínimo da API Asaas v3 (servidor apenas).
 * Sandbox: https://api-sandbox.asaas.com/v3
 * Produção: https://api.asaas.com/v3
 */

/** Origem da API (sem `/v3`). Aceita env com ou sem sufixo `/v3`. */
function getBaseUrl(): string {
  let u = process.env.ASAAS_API_URL?.trim() ?? "";
  u = u.replace(/\/$/, "");
  if (u.endsWith("/v3")) {
    u = u.slice(0, -3).replace(/\/$/, "");
  }
  return u.length > 0 ? u : "https://api-sandbox.asaas.com";
}

let diagnosticsRouteTag: string | null = null;

/**
 * Executa chamadas Asaas com logs de diagnóstico no terminal (rotas API).
 */
export function withAsaasDiagnostics<T>(
  routeTag: string,
  fn: () => Promise<T>,
): Promise<T> {
  const prev = diagnosticsRouteTag;
  diagnosticsRouteTag = routeTag;
  const rawEnvUrl = process.env.ASAAS_API_URL ?? "(não definido)";
  const base = getBaseUrl();
  const key = process.env.ASAAS_API_KEY?.trim();
  diagLog(`[Asaas diag:${routeTag}] ASAAS_API_URL (env)=`, rawEnvUrl);
  diagLog(`[Asaas diag:${routeTag}] base URL resolvida=`, base);
  diagLog(
    `[Asaas diag:${routeTag}] ASAAS_API_KEY definida=`,
    Boolean(key),
    key ? `length=${key.length}` : "",
  );
  if (key) {
    diagLog(
      `[Asaas diag:${routeTag}] ASAAS_API_KEY prefixo (4 primeiros chars)=`,
      key.slice(0, 4),
    );
  }
  return fn().finally(() => {
    diagnosticsRouteTag = prev;
  });
}

function diagTag(): string {
  return diagnosticsRouteTag ?? "asaas";
}

export class AsaasIntegrationError extends Error {
  readonly httpStatus: number;
  readonly responseBody: string;
  readonly requestUrl: string;

  constructor(
    message: string,
    httpStatus: number,
    responseBody: string,
    requestUrl: string,
  ) {
    super(message);
    this.name = "AsaasIntegrationError";
    this.httpStatus = httpStatus;
    this.responseBody = responseBody;
    this.requestUrl = requestUrl;
  }
}

type AsaasFetchResult = {
  status: number;
  bodyText: string;
  url: string;
};

async function asaasFetchRaw(
  url: string,
  init?: RequestInit,
): Promise<AsaasFetchResult> {
  const tag = diagTag();
  const method = init?.method ?? "GET";
  diagLog(`[Asaas diag:${tag}] → ${method} ${url}`);

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      cache: init?.cache ?? "no-store",
    });
  } catch (e) {
    const netMsg = e instanceof Error ? e.message : String(e);
    console.error(
      `[Asaas diag:${tag}] erro de rede ao chamar ${url}:`,
      netMsg,
      e instanceof Error ? e.stack : "",
    );
    throw new AsaasIntegrationError(
      `Falha de rede ao chamar Asaas: ${netMsg}`,
      0,
      "",
      url,
    );
  }

  const bodyText = await res.text();
  diagLog(`[Asaas diag:${tag}] ← HTTP ${res.status} ${url}`);
  diagLog(`[Asaas diag:${tag}] corpo (completo):`, bodyText);

  return { status: res.status, bodyText, url };
}

function parseJsonSuccessOrThrow(
  status: number,
  bodyText: string,
  requestUrl: string,
): Record<string, unknown> {
  let data: Record<string, unknown>;
  try {
    data = bodyText.length > 0 ? (JSON.parse(bodyText) as Record<string, unknown>) : {};
  } catch (parseErr) {
    const parseMsg =
      parseErr instanceof Error ? parseErr.message : String(parseErr);
    console.error(
      `[Asaas diag:${diagTag()}] JSON inválido:`,
      parseMsg,
      parseErr instanceof Error ? parseErr.stack : "",
    );
    throw new AsaasIntegrationError(
      `Resposta Asaas não é JSON válido (HTTP ${status}). ${parseMsg}`,
      status,
      bodyText,
      requestUrl,
    );
  }

  if (status < 200 || status >= 300) {
    const errs = data.errors as Array<{ description?: string }> | undefined;
    const msg =
      errs?.[0]?.description ??
      (typeof data.errors === "string" ? data.errors : null) ??
      (typeof data.message === "string" ? data.message : null) ??
      `Asaas HTTP ${status}`;
    console.error(`[Asaas diag:${diagTag()}] erro Asaas (mensagem):`, msg);
    throw new AsaasIntegrationError(msg, status, bodyText, requestUrl);
  }

  return data;
}

function getHeaders(): Headers {
  const key = getAsaasApiKey();
  if (!key) {
    throw new Error("ASAAS_API_KEY não configurada.");
  }
  const h = new Headers();
  h.set("Content-Type", "application/json");
  h.set("access_token", key);
  return h;
}

function todaySaoPaulo(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

type AsaasPayment = { id: string };
type AsaasPixQr = { encodedImage: string; payload: string };

/** Se o cliente existir no Asaas, retorna o id; senão `null` (ex.: 404). */
export async function getCustomerIfExists(
  customerId: string,
): Promise<string | null> {
  const base = getBaseUrl();
  const url = `${base}/v3/customers/${encodeURIComponent(customerId)}`;
  const r = await asaasFetchRaw(url, { headers: getHeaders() });
  if (r.status === 404) {
    return null;
  }
  const data = parseJsonSuccessOrThrow(r.status, r.bodyText, r.url);
  const id = data.id;
  return typeof id === "string" ? id : null;
}

/** Cria cliente de teste no sandbox (nome/e-mail fictícios + CPF de teste). */
export async function createSandboxTestCustomer(): Promise<string> {
  const base = getBaseUrl();
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  const cpf = process.env.ASAAS_GUEST_CPF?.trim() ?? "24971563792";

  const url = `${base}/v3/customers`;
  const r = await asaasFetchRaw(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      name: `Cliente Teste ${suffix}`,
      email: `teste.${suffix}@mensageiro-do-bem.local`,
      cpfCnpj: cpf,
    }),
  });
  const data = parseJsonSuccessOrThrow(r.status, r.bodyText, r.url);
  const id = data.id;
  if (typeof id !== "string") {
    throw new AsaasIntegrationError(
      "Resposta Asaas sem id de cliente.",
      r.status,
      r.bodyText,
      r.url,
    );
  }
  return id;
}

/**
 * Garante um id de cliente: reutiliza `existingId` se ainda existir na Asaas;
 * senão cria um novo cliente de teste.
 */
export async function ensureSandboxCustomer(
  existingId: string | undefined,
): Promise<{ id: string; reused: boolean }> {
  const trimmed = existingId?.trim();
  if (trimmed) {
    const found = await getCustomerIfExists(trimmed);
    if (found) return { id: found, reused: true };
  }
  const id = await createSandboxTestCustomer();
  return { id, reused: false };
}

/** Fallback quando `create-payment` não recebe `customerId` no body. */
export async function resolveCustomerId(): Promise<string> {
  const fixed = process.env.ASAAS_CUSTOMER_ID?.trim();
  if (fixed) return fixed;
  const { id } = await ensureSandboxCustomer(undefined);
  return id;
}

export async function createPixCharge(input: {
  customerId: string;
  value: number;
  description?: string;
}): Promise<AsaasPayment> {
  const base = getBaseUrl();
  const url = `${base}/v3/payments`;
  const r = await asaasFetchRaw(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      customer: input.customerId,
      billingType: "PIX",
      value: input.value,
      dueDate: todaySaoPaulo(),
      description: input.description ?? "Mensagem — Mensageiro do Bem",
    }),
  });
  const data = parseJsonSuccessOrThrow(r.status, r.bodyText, r.url);
  const id = data.id;
  if (typeof id !== "string") {
    throw new AsaasIntegrationError(
      "Resposta Asaas sem id de cobrança.",
      r.status,
      r.bodyText,
      r.url,
    );
  }
  return { id };
}

export async function fetchPixQrCode(paymentId: string): Promise<AsaasPixQr> {
  const base = getBaseUrl();
  const url = `${base}/v3/payments/${paymentId}/pixQrCode`;
  const r = await asaasFetchRaw(url, { headers: getHeaders() });
  const data = parseJsonSuccessOrThrow(r.status, r.bodyText, r.url);
  const encodedImage = data.encodedImage;
  const payload = data.payload;
  if (typeof encodedImage !== "string" || typeof payload !== "string") {
    throw new AsaasIntegrationError(
      "QR PIX incompleto na resposta Asaas.",
      r.status,
      r.bodyText,
      r.url,
    );
  }
  return { encodedImage, payload };
}

export async function fetchPaymentStatus(
  paymentId: string,
): Promise<string> {
  const base = getBaseUrl();
  const url = `${base}/v3/payments/${paymentId}`;
  const r = await asaasFetchRaw(url, { headers: getHeaders() });
  const data = parseJsonSuccessOrThrow(r.status, r.bodyText, r.url);
  const status = data.status;
  return typeof status === "string" ? status : "UNKNOWN";
}

export function encodedImageToDataUrl(encodedImage: string): string {
  if (encodedImage.startsWith("data:")) return encodedImage;
  return `data:image/png;base64,${encodedImage}`;
}

/** Chave obrigatória para rotas de pagamento; retorna mensagem para o cliente. */
export function requireAsaasApiKeyOrMessage(): string | null {
  const key = getAsaasApiKey();
  return key
    ? null
    : "Configure ASAAS_API_KEY no .env com a chave da API Asaas (sandbox ou produção).";
}

/**
 * Normaliza chave da Asaas para evitar erro comum em `.env`:
 * token copiado como `\$aact...` (com barra invertida antes do `$`).
 */
function getAsaasApiKey(): string | null {
  const raw = process.env.ASAAS_API_KEY;
  if (!raw) return null;
  let key = raw.trim();
  if (!key) return null;

  if (
    key.startsWith("\\$") &&
    (key.includes("aact_") || key.includes("aach_"))
  ) {
    key = key.slice(1);
  }

  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }

  return key || null;
}

function jsonFromAsaasError(e: unknown): {
  error: string;
  asaasHttpStatus: number;
  asaasResponseBody: string;
  asaasRequestUrl: string;
} {
  if (e instanceof AsaasIntegrationError) {
    return {
      error: e.message,
      asaasHttpStatus: e.httpStatus,
      asaasResponseBody: e.responseBody,
      asaasRequestUrl: e.requestUrl,
    };
  }
  const message = e instanceof Error ? e.message : "Erro desconhecido";
  const stack = e instanceof Error ? e.stack : undefined;
  console.error(`[Asaas diag:${diagTag()}] exceção não-Asaas:`, message, stack);
  return {
    error: message,
    asaasHttpStatus: 0,
    asaasResponseBody: "",
    asaasRequestUrl: "",
  };
}

export function asaasErrorJson(e: unknown, fallback: string) {
  const j = jsonFromAsaasError(e);
  if (!j.error) j.error = fallback;
  return j;
}
