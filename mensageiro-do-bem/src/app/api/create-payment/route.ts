/**
 * Legado Asaas — não é mais chamado pela UI (`/receber` usa só `/api/create-pix` + Mercado Pago).
 * Mantido para testes manuais ou integrações antigas; pode ser removido quando o Asaas sair do deploy.
 */
import { NextResponse } from "next/server";
import {
  asaasErrorJson,
  createPixCharge,
  encodedImageToDataUrl,
  fetchPixQrCode,
  requireAsaasApiKeyOrMessage,
  resolveCustomerId,
  withAsaasDiagnostics,
} from "@/lib/asaas";
import { PAYMENT_AMOUNT_OPTIONS } from "@/constants/receber";
import { createPendingPayment } from "@/lib/payments/repository";

type Body = { customerId?: string; amount?: number };

export async function POST(request: Request) {
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

  const allowedValues = PAYMENT_AMOUNT_OPTIONS.map((o) => o.value);
  const defaultValue = allowedValues.includes(1) ? 1 : allowedValues[0] ?? 1;

  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    body = {};
  }
  const customerFromBody =
    typeof body.customerId === "string" ? body.customerId.trim() : "";
  const requestedAmount =
    typeof body.amount === "number" ? body.amount : defaultValue;
  const value = allowedValues.some((v) => v === requestedAmount)
    ? requestedAmount
    : defaultValue;

  try {
    const out = await withAsaasDiagnostics(
      "POST /api/create-payment",
      async () => {
        const customerId =
          customerFromBody.length > 0
            ? customerFromBody
            : await resolveCustomerId();
        const { id: paymentId } = await createPixCharge({
          customerId,
          value,
        });
        const { encodedImage, payload } = await fetchPixQrCode(paymentId);
        return {
          id: paymentId,
          qrCode: encodedImageToDataUrl(encodedImage),
          copiaECola: payload,
        };
      },
    );

    await createPendingPayment({
      gateway: "asaas",
      external_payment_id: out.id,
      amount: value,
    });

    return NextResponse.json(out);
  } catch (e) {
    const payload = asaasErrorJson(e, "Erro ao criar pagamento");
    console.error(
      "[Asaas diag:POST /api/create-payment] falha final:",
      payload.error,
      payload.asaasHttpStatus,
      payload.asaasRequestUrl,
    );
    return NextResponse.json(payload, { status: 502 });
  }
}
