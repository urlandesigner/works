import { NextResponse } from "next/server";
import { fetchPaymentStatus, requireAsaasApiKeyOrMessage } from "@/lib/asaas";
import { fetchMercadoPagoPaymentStatus } from "@/lib/mercado-pago";
import {
  markPaymentAsPaid,
  providerParamToGateway,
} from "@/lib/payments/repository";

/** Status Asaas considerados “pago” para liberar a mensagem. */
const PAID_STATUSES = new Set(["RECEIVED", "CONFIRMED"]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json(
      { error: "Informe o id da cobrança (parâmetro id)." },
      { status: 400 },
    );
  }

  /** Checkout atual: Mercado Pago. `asaas` permanece só para consultas legadas. */
  const provider =
    url.searchParams.get("provider")?.trim() === "asaas"
      ? "asaas"
      : "mercado-pago";

  try {
    if (provider === "mercado-pago") {
      const { status, paid } = await fetchMercadoPagoPaymentStatus(id);
      if (paid) {
        await markPaymentAsPaid({
          gateway: providerParamToGateway("mercado-pago"),
          external_payment_id: id,
        });
      }
      return NextResponse.json({ status, paid, provider: "mercado-pago" });
    }

    const missing = requireAsaasApiKeyOrMessage();
    if (missing) {
      return NextResponse.json({ error: missing }, { status: 503 });
    }

    const status = await fetchPaymentStatus(id);
    const paid = PAID_STATUSES.has(status);
    if (paid) {
      await markPaymentAsPaid({
        gateway: providerParamToGateway("asaas"),
        external_payment_id: id,
      });
    }

    return NextResponse.json({ status, paid, provider: "asaas" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao consultar";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
