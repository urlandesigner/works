import { NextResponse } from "next/server";
import { PAYMENT_AMOUNT_OPTIONS } from "@/constants/receber";
import { createPendingPayment } from "@/lib/payments/repository";

type Body = { value?: number; valor?: number; amount?: number };

type MercadoPagoPaymentResponse = {
  id?: number | string;
  transaction_amount?: number;
  status?: string;
  status_detail?: string;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
    };
  };
};

export async function POST(request: Request) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    return NextResponse.json(
      {
        error:
          "Configuração inválida: MERCADO_PAGO_ACCESS_TOKEN ausente ou mal formatado.",
      },
      { status: 503 },
    );
  }

  const allowedValues = PAYMENT_AMOUNT_OPTIONS.map((o) => o.value);
  const isAllowedAmount = (n: number) =>
    PAYMENT_AMOUNT_OPTIONS.some((o) => o.value === n);
  const defaultValue = allowedValues.includes(1) ? 1 : (allowedValues[0] ?? 1);

  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    body = {};
  }

  const fromBody =
    typeof body.value === "number"
      ? body.value
      : typeof body.valor === "number"
        ? body.valor
        : typeof body.amount === "number"
          ? body.amount
          : undefined;

  const explicitAmount = fromBody !== undefined;

  if (explicitAmount) {
    if (!Number.isFinite(fromBody)) {
      return NextResponse.json(
        { error: "Valor inválido. Envie um número no campo `value`." },
        { status: 400 },
      );
    }
    if (!isAllowedAmount(fromBody)) {
      return NextResponse.json(
        {
          error:
            "Valor não permitido. Use um dos valores disponíveis na página (R$1, R$5, R$10 ou R$20).",
        },
        { status: 400 },
      );
    }
  }

  const valor = explicitAmount ? fromBody! : defaultValue;
  if (valor <= 0 || !isAllowedAmount(valor)) {
    return NextResponse.json(
      { error: "Valor inválido." },
      { status: 400 },
    );
  }

  const payerEmail =
    process.env.MERCADO_PAGO_TEST_PAYER_EMAIL?.trim() ??
    "pagamento@mensageirodobem.com";

  const payload = {
    transaction_amount: valor,
    payment_method_id: "pix",
    description: "Mensagem — Mensageiro do Bem",
    payer: {
      email: payerEmail,
    },
  } as const;

  let response: Response;
  try {
    response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Falha de rede";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const text = await response.text();
  let data: MercadoPagoPaymentResponse | Record<string, unknown> = {};
  try {
    data = text
      ? (JSON.parse(text) as MercadoPagoPaymentResponse)
      : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    console.error("[create-pix] Mercado Pago HTTP", response.status);
    return NextResponse.json(
      {
        error: "Mercado Pago retornou erro ao criar PIX.",
        httpStatus: response.status,
      },
      { status: 502 },
    );
  }

  const mp = data as MercadoPagoPaymentResponse;
  const qrCode = mp.point_of_interaction?.transaction_data?.qr_code ?? "";
  const qrBase64 = mp.point_of_interaction?.transaction_data?.qr_code_base64 ?? "";
  if (!qrCode || !qrBase64 || !mp.id) {
    return NextResponse.json(
      {
        error: "Não foi possível gerar o QR Code PIX no momento.",
        httpStatus: response.status,
      },
      { status: 502 },
    );
  }

  const normalized = {
    paymentId: String(mp.id),
    amount:
      typeof mp.transaction_amount === "number"
        ? mp.transaction_amount
        : valor,
    status: mp.status ?? null,
    qrCode,
    qrCodeBase64: qrBase64,
  };

  await createPendingPayment({
    gateway: "mercado_pago",
    external_payment_id: normalized.paymentId,
    amount: normalized.amount,
  });

  return NextResponse.json(normalized);
}
