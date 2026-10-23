/**
 * Consulta status de pagamento na API Mercado Pago (server-side apenas).
 */
export async function fetchMercadoPagoPaymentStatus(paymentId: string): Promise<{
  status: string;
  paid: boolean;
}> {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "Configuração inválida: MERCADO_PAGO_ACCESS_TOKEN ausente ou mal formatado.",
    );
  }

  const url = `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const text = await res.text();
  let data: { status?: string } = {};
  try {
    data = text ? (JSON.parse(text) as { status?: string }) : {};
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    throw new Error(
      res.status === 404
        ? "Pagamento não encontrado."
        : "Não foi possível consultar o pagamento no momento.",
    );
  }

  const status = typeof data.status === "string" ? data.status : "UNKNOWN";
  const paid = status === "approved";

  return { status, paid };
}
