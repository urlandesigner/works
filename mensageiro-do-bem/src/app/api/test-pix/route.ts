import { NextResponse } from "next/server";

type MpPixResponse = {
  id?: number;
  status?: string;
  status_detail?: string;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
    };
  };
};

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "MERCADO_PAGO_ACCESS_TOKEN não configurado no ambiente do servidor.",
      },
      { status: 503 },
    );
  }

  const payerEmail =
    process.env.MERCADO_PAGO_TEST_PAYER_EMAIL?.trim() ??
    "test_user_123456@testuser.com";

  const body = {
    transaction_amount: 1,
    payment_method_id: "pix",
    description: "Teste PIX R$1 - Mensageiro do Bem",
    payer: {
      email: payerEmail,
    },
  };

  let res: Response;
  try {
    res = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Falha de rede",
      },
      { status: 502 },
    );
  }

  const text = await res.text();
  let data: MpPixResponse | Record<string, unknown> = {};
  try {
    data = text ? (JSON.parse(text) as MpPixResponse) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    return NextResponse.json(
      {
        ok: false,
        httpStatus: res.status,
        mercadoPagoResponse: data,
      },
      { status: 502 },
    );
  }

  const mp = data as MpPixResponse;
  const payload = mp.point_of_interaction?.transaction_data?.qr_code ?? "";
  const qrBase64 = mp.point_of_interaction?.transaction_data?.qr_code_base64 ?? "";

  return NextResponse.json({
    ok: true,
    acceptedAmount: 1,
    paymentId: mp.id ?? null,
    status: mp.status ?? null,
    statusDetail: mp.status_detail ?? null,
    payload,
    qrCode: qrBase64 ? `data:image/jpeg;base64,${qrBase64}` : "",
    mercadoPagoResponse: data,
  });
}
