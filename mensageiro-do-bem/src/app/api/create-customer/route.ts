import { NextResponse } from "next/server";
import {
  asaasErrorJson,
  ensureSandboxCustomer,
  requireAsaasApiKeyOrMessage,
  withAsaasDiagnostics,
} from "@/lib/asaas";

/**
 * Legado Asaas — a UI não chama mais esta rota. Mantida para testes; removível com o Asaas.
 *
 * Route Handler do App Router: executa apenas no servidor Node, fora do bundle do cliente.
 */
type Body = { customerId?: string };

export async function POST(request: Request) {
  if (typeof process === "undefined" || typeof process.env === "undefined") {
    console.error("[create-customer] process.env indisponível (não é ambiente Node servidor).");
    return NextResponse.json(
      { error: "Ambiente de execução inválido: process.env indisponível." },
      { status: 503 },
    );
  }

  const asaasKeyMessage = requireAsaasApiKeyOrMessage();
  if (asaasKeyMessage) {
    return NextResponse.json(
      {
        error:
          "Configuração inválida: ASAAS_API_KEY ausente ou mal formatada.",
        details: asaasKeyMessage,
      },
      { status: 503 },
    );
  }

  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    body = {};
  }
  const sentId =
    typeof body.customerId === "string" ? body.customerId.trim() : "";

  try {
    const result = await withAsaasDiagnostics(
      "POST /api/create-customer",
      async () =>
        ensureSandboxCustomer(sentId.length > 0 ? sentId : undefined),
    );

    return NextResponse.json({
      id: result.id,
      reused: result.reused,
    });
  } catch (e) {
    const payload = asaasErrorJson(e, "Erro ao criar cliente");
    console.error(
      "[Asaas diag:POST /api/create-customer] falha final:",
      payload.error,
      payload.asaasHttpStatus,
      payload.asaasRequestUrl,
    );
    return NextResponse.json(payload, { status: 502 });
  }
}
