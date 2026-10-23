"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DEFAULT_PAYMENT_AMOUNT,
  PAYMENT_AMOUNT_OPTIONS,
  RECEBER_EXPECTATION,
  RECEBER_PAYMENT_RECIPIENT_HINT,
} from "@/constants/receber";
import { pickRandomMessage } from "@/lib/messages";
import {
  clearPaymentSession,
  readPaymentSession,
  writePaymentSession,
} from "@/lib/payment-session";
import { AmountSelector } from "./AmountSelector";

type CreatePaymentResponse = {
  paymentId: string;
  qrImageSrc: string;
  payload: string;
};

type MercadoPagoCreatePixResponse = {
  paymentId?: string;
  amount?: number;
  qrCode?: string;
  qrCodeBase64?: string;
  status?: string;
  payload?: string;
  error?: string;
};

/** Mensagem curta para o usuário — sem URL/corpo de API (evita vazar detalhes técnicos). */
function describePaymentApiError(
  data: { error?: string },
  fallback: string,
): string {
  const raw = typeof data.error === "string" ? data.error.trim() : "";
  if (!raw) return fallback;
  const firstLine = raw.split("\n")[0]?.trim() ?? raw;
  return firstLine.length > 280 ? `${firstLine.slice(0, 277)}…` : firstLine;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function stepsForAmount(): readonly string[] {
  return [
    "Abra o PIX do seu banco.",
    "Use o QR Code ou copie o código.",
    "Depois, confirme aqui para abrir sua mensagem.",
  ] as const;
}

function normalizeMercadoPixResponse(
  data: MercadoPagoCreatePixResponse,
): CreatePaymentResponse {
  const paymentId = typeof data.paymentId === "string" ? data.paymentId : "";
  const payload =
    typeof data.qrCode === "string" && data.qrCode.trim().length > 0
      ? data.qrCode
      : typeof data.payload === "string"
        ? data.payload
        : "";
  const qrCodeBase64 =
    typeof data.qrCodeBase64 === "string" ? data.qrCodeBase64 : "";
  if (!paymentId || !payload || !qrCodeBase64) {
    throw new Error(
      "Tivemos um pequeno problema ao preparar seu pagamento. Tente novamente.",
    );
  }
  return {
    paymentId,
    payload,
    qrImageSrc: `data:image/jpeg;base64,${qrCodeBase64}`,
  };
}

function PaymentStatusCard({
  title,
  description,
  hint,
  tone = "neutral",
}: {
  title: string;
  description: string;
  hint?: string;
  tone?: "neutral" | "warning" | "error";
}) {
  const toneClasses =
    tone === "error"
      ? "border-[var(--accent)]/30 bg-[var(--accent-soft)]"
      : tone === "warning"
        ? "border-[var(--stroke-strong)] bg-[var(--paper-warm)]"
        : "border-[var(--stroke)] bg-[var(--paper)]";

  return (
    <section
      className={`w-full max-w-sm rounded-2xl border px-3 py-2.5 text-left shadow-sm sm:px-3.5 sm:py-3 ${toneClasses}`}
      role="status"
      aria-live="polite"
    >
      <h3 className="font-sans text-sm font-semibold leading-snug text-[var(--ink)]">
        {title}
      </h3>
      <p className="mt-1 text-sm leading-snug text-[var(--muted)]">{description}</p>
      {hint ? (
        <p className="mt-1.5 text-xs leading-snug text-[var(--muted)]/90">{hint}</p>
      ) : null}
    </section>
  );
}

export function ReceberView() {
  const router = useRouter();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [payment, setPayment] = useState<CreatePaymentResponse | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(
    DEFAULT_PAYMENT_AMOUNT,
  );
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [checking, setChecking] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  /** Cobrança ainda não confirmada — mostra copy amigável em vez de “Status: PENDING”. */
  const [awaitingPaymentConfirm, setAwaitingPaymentConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pixSectionHighlight, setPixSectionHighlight] = useState(false);
  const pixPaymentSectionRef = useRef<HTMLDivElement>(null);
  const jaEnviouBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!payment) {
      setPixSectionHighlight(false);
      return;
    }
    setPixSectionHighlight(true);
    const t = window.setTimeout(() => setPixSectionHighlight(false), 2200);
    return () => window.clearTimeout(t);
  }, [payment]);

  useLayoutEffect(() => {
    if (!payment || loadError) return;
    const id = window.setTimeout(() => {
      pixPaymentSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);
    return () => window.clearTimeout(id);
  }, [payment, loadError]);

  /** Mantém o CTA visível no mobile quando o bloco de status ganha altura. */
  useLayoutEffect(() => {
    const hasStatus = Boolean(payError || awaitingPaymentConfirm);
    if (!hasStatus) return;
    const id = window.setTimeout(() => {
      jaEnviouBtnRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }, 100);
    return () => window.clearTimeout(id);
  }, [payError, awaitingPaymentConfirm]);

  useEffect(() => {
    setLoadError(null);
    setPayment(null);
    clearPaymentSession();
  }, []);

  const createPaymentForSelectedAmount = useCallback(async () => {
    if (creatingPayment) return;

    const selectedOption = PAYMENT_AMOUNT_OPTIONS.find(
      (o) => o.value === selectedAmount,
    );
    if (!selectedOption) {
      setLoadError("Escolha um dos valores na lista antes de continuar.");
      return;
    }
    const valueToCharge = selectedOption.value;

    setCreatingPayment(true);
    setLoadError(null);
    setPayment(null);
    setPayError(null);
    setAwaitingPaymentConfirm(false);
    try {
      const res = await fetch("/api/create-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: valueToCharge }),
      });
      const data = (await res.json()) as MercadoPagoCreatePixResponse;
      if (!res.ok) {
        throw new Error(
          describePaymentApiError(
            data,
            "Não conseguimos gerar o PIX agora. Toque em Continuar de novo.",
          ),
        );
      }
      const normalized = normalizeMercadoPixResponse(data);
      writePaymentSession({
        paymentId: normalized.paymentId,
        paymentStatus: "pending",
        createdAt: new Date().toISOString(),
        amount: valueToCharge,
        paymentProvider: "mercado-pago",
      });
      setPayment(normalized);
    } catch (e) {
      const rawMsg =
        e instanceof Error ? e.message : "Não foi possível gerar o PIX.";
      const msg =
        rawMsg.includes("Mercado Pago") || rawMsg.includes("preparar seu pagamento")
          ? "Tivemos um problema ao gerar seu PIX. Toque em Continuar para tentar de novo."
          : rawMsg;
      setLoadError(msg);
    } finally {
      setCreatingPayment(false);
    }
  }, [creatingPayment, selectedAmount]);

  const handleCopy = useCallback(async () => {
    if (!payment?.payload) return;
    try {
      await navigator.clipboard.writeText(payment.payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [payment?.payload]);

  const handlePaid = async () => {
    const paymentId =
      payment?.paymentId?.trim() ||
      (typeof window !== "undefined"
        ? readPaymentSession()?.paymentId?.trim() ?? ""
        : "");
    if (!paymentId) return;
    const session = typeof window !== "undefined" ? readPaymentSession() : null;
    const statusProvider = session?.paymentProvider ?? "mercado-pago";
    setChecking(true);
    setPayError(null);
    setAwaitingPaymentConfirm(false);
    try {
      const res = await fetch(
        `/api/payment-status?id=${encodeURIComponent(paymentId)}&provider=${encodeURIComponent(statusProvider)}`,
      );
      const data = (await res.json()) as {
        paid?: boolean;
        status?: string;
        error?: string;
      };
      if (!res.ok) {
        setAwaitingPaymentConfirm(false);
        setPayError(
          data.error ??
            (res.status === 503
              ? "Estamos com uma instabilidade momentânea. Daqui a pouco, toque em “Já enviei” de novo."
              : "Ainda não conseguimos confirmar. Quando o PIX sair no app do banco, toque em “Já enviei” outra vez."),
        );
        return;
      }
      if (data.paid) {
        setAwaitingPaymentConfirm(false);
        const message = pickRandomMessage();
        const prev = readPaymentSession();
        const createdAt =
          prev?.paymentId === paymentId && prev.createdAt
            ? prev.createdAt
            : new Date().toISOString();
        writePaymentSession({
          paymentId,
          paymentStatus: "confirmed",
          createdAt,
          amount: prev?.amount,
          paymentProvider: prev?.paymentProvider ?? statusProvider,
          messageId: message.id,
        });
        router.push(`/mensagem?id=${encodeURIComponent(message.id)}`);
        return;
      }
      setAwaitingPaymentConfirm(true);
    } catch {
      setAwaitingPaymentConfirm(false);
      setPayError(
        "A conexão oscilou. Confira a internet e toque em “Já enviei” de novo.",
      );
    } finally {
      setChecking(false);
    }
  };

  const retryLoad = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-full px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14">
      <div className="mx-auto max-w-xl">
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-[var(--muted)] underline-offset-4 transition hover:text-[var(--accent-mid)] hover:underline"
        >
          ← Voltar ao início
        </Link>

        <header className="mt-8 text-center animate-fade-up opacity-0 [animation-delay:80ms] [animation-fill-mode:forwards]">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
            Quase lá
          </p>
          <h1 className="mt-3 font-serif text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)] sm:text-[2rem]">
            {RECEBER_EXPECTATION.title}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-base leading-relaxed text-[var(--ink)]/90 sm:text-lg">
            {RECEBER_EXPECTATION.subtitle}
          </p>
          <p className="mt-3 text-center text-xs font-medium text-[var(--muted)] sm:text-[0.8125rem]">
            {RECEBER_EXPECTATION.quickHint}
          </p>
        </header>

        <AmountSelector
          value={selectedAmount}
          onChange={(next) => {
            setSelectedAmount(next);
            setPayment(null);
            setPayError(null);
            setAwaitingPaymentConfirm(false);
          }}
        />

        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-center text-sm leading-relaxed text-[var(--muted)]">
            Esse pequeno gesto já começa a fazer diferença
          </p>
          <button
            type="button"
            disabled={creatingPayment}
            aria-busy={creatingPayment}
            onClick={createPaymentForSelectedAmount}
            className="inline-flex min-h-[3.25rem] w-full max-w-sm items-center justify-center rounded-full bg-[#C9785C] px-8 py-3.5 text-center text-[0.9375rem] font-semibold tracking-wide text-white shadow-[0_4px_24px_-6px_rgba(201,120,92,0.55),0_1px_0_0_rgba(255,255,255,0.2)_inset] transition duration-200 hover:!brightness-[1.06] hover:shadow-[0_6px_28px_-6px_rgba(201,120,92,0.5)] disabled:cursor-not-allowed disabled:opacity-55 motion-safe:data-[loading=true]:animate-pulse"
            data-loading={creatingPayment ? "true" : undefined}
          >
            {creatingPayment ? "Gerando seu PIX..." : "Continuar"}
          </button>
          {PAYMENT_AMOUNT_OPTIONS.length > 1 ? (
            <p className="text-center text-xs text-[var(--muted)]">
              Troque o valor quando quiser, sem complicação.
            </p>
          ) : null}
        </div>

        <ol className="animate-fade-up mt-10 space-y-3 rounded-2xl border border-dashed border-[var(--stroke-strong)] bg-[var(--paper)] px-5 py-6 opacity-0 shadow-[var(--shadow-ticket)] [animation-delay:140ms] [animation-fill-mode:forwards] sm:px-6">
          <li className="text-sm font-semibold leading-relaxed text-[var(--ink)] sm:text-[0.9375rem]">
            Como enviar
          </li>
          {stepsForAmount().map((line, i) => (
            <li
              key={i}
              className="flex gap-3 text-sm leading-relaxed text-[var(--ink)] sm:text-[0.9375rem]"
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent-mid)]"
                aria-hidden
              >
                {i + 1}
              </span>
              <span className="pt-0.5">{line}</span>
            </li>
          ))}
        </ol>

        {loadError && (
          <div
            className="mt-8 rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-5 py-4 text-center text-sm text-[var(--ink)]"
            role="alert"
          >
            <p className="whitespace-pre-wrap break-words text-left">
              {loadError}
            </p>
            <button
              type="button"
              onClick={retryLoad}
              className="mt-3 text-sm font-semibold text-[var(--accent-mid)] underline-offset-2 hover:underline"
            >
              Atualizar e tentar de novo
            </button>
          </div>
        )}

        {payment && !loadError && (
          <div
            ref={pixPaymentSectionRef}
            className={`scroll-mt-6 rounded-2xl transition-[outline,outline-offset] duration-500 motion-reduce:transition-none ${
              pixSectionHighlight
                ? "outline outline-2 outline-offset-2 outline-[#C9785C]/35"
                : "outline outline-2 outline-transparent outline-offset-2"
            }`}
            aria-label="Pagamento PIX"
          >
            <p className="mt-7 text-center text-sm font-medium text-[var(--ink)]/85">
              Você escolheu contribuir com {formatCurrency(selectedAmount)}
            </p>
            <section
              className="mt-8 rounded-2xl border border-[var(--paper-edge)] bg-[var(--paper-warm)]/90 px-5 py-6 shadow-[var(--shadow-ticket)] sm:px-6 sm:py-7"
              aria-labelledby="valor-heading"
            >
              <h2
                id="valor-heading"
                className="text-center font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]"
              >
                Seu gesto
              </h2>
              <p className="mt-2 text-center font-serif text-3xl font-semibold text-[var(--accent-mid)]">
                {formatCurrency(selectedAmount)}
              </p>
              <p className="mt-1 text-center text-xs text-[var(--muted)]">
                Leva poucos segundos. Sem cadastro.
              </p>

              <div className="mt-6 border-t border-[var(--stroke)] pt-6">
                <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Código PIX copia e cola
                </p>
                <p className="mt-3 break-all rounded-xl border border-[var(--stroke)] bg-white/90 px-4 py-3 text-left font-mono text-[0.7rem] leading-relaxed text-[var(--ink)] sm:text-[0.75rem]">
                  {payment.payload || "Código indisponível no momento."}
                </p>
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-full border border-[var(--stroke-strong)] bg-[var(--paper)] px-6 py-2.5 text-sm font-semibold text-[var(--accent-mid)] shadow-sm transition hover:bg-[var(--accent-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]/35"
                  >
                    {copied ? "Copiado!" : "Copiar código"}
                  </button>
                </div>
              </div>
            </section>

            <section
              className="mt-7 rounded-2xl border border-dashed border-[var(--stroke-strong)] bg-[var(--paper)] px-5 py-8 shadow-[var(--shadow-ticket)] sm:mt-8 sm:px-6"
              aria-labelledby="qr-heading"
            >
              <h2
                id="qr-heading"
                className="text-center font-serif text-lg font-semibold text-[var(--ink)]"
              >
                QR Code
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-center text-sm text-[var(--muted)]">
                Escaneie com o app do seu banco e finalize quando quiser.
              </p>
              <div
                className="mx-auto mt-5 max-w-md rounded-xl border border-[var(--stroke)] bg-[var(--paper-warm)]/90 px-4 py-3 text-center shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset] sm:px-5"
                role="note"
              >
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  {RECEBER_PAYMENT_RECIPIENT_HINT}
                </p>
              </div>
              <div className="mt-8 flex min-h-[200px] items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element -- data URL da API / qrcode */}
                <img
                  src={payment.qrImageSrc}
                  alt="QR Code PIX"
                  className="max-w-[240px] rounded-xl border border-[var(--paper-edge)] bg-white p-2 shadow-[var(--shadow-ticket)]"
                />
              </div>
            </section>
          </div>
        )}

        <div className="mt-6 flex w-full flex-col items-center gap-2 pb-1 sm:mt-10 sm:gap-3 sm:pb-0">
          {payError ? (
            <PaymentStatusCard
              title="Não deu certo desta vez"
              description={payError}
              hint="Nada foi perdido: confira o PIX no banco e tente “Já enviei” quando estiver pago."
              tone="error"
            />
          ) : null}
          {awaitingPaymentConfirm ? (
            <PaymentStatusCard
              title="Ainda não apareceu por aqui 💭"
              description='Quando o pagamento aparecer como concluído no seu banco, toque em “Já enviei” novamente.'
              tone="warning"
            />
          ) : null}
          <button
            ref={jaEnviouBtnRef}
            type="button"
            disabled={creatingPayment || !payment?.paymentId || checking}
            aria-busy={checking}
            onClick={handlePaid}
            className="inline-flex min-h-[3.25rem] w-full max-w-sm shrink-0 items-center justify-center rounded-full px-8 py-3.5 text-center text-[0.9375rem] font-semibold tracking-wide text-white shadow-[0_4px_24px_-6px_rgba(201,120,92,0.55),0_1px_0_0_rgba(255,255,255,0.2)_inset] transition duration-200 hover:!brightness-[1.06] hover:shadow-[0_6px_28px_-6px_rgba(201,120,92,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9785C] enabled:cursor-pointer enabled:bg-[#C9785C] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[18rem]"
            data-loading={checking ? "true" : undefined}
          >
            {checking ? "Verificando pagamento..." : "Já enviei"}
          </button>
          <p className="max-w-xs text-center text-xs leading-relaxed text-[var(--muted)]">
            {RECEBER_EXPECTATION.microcopy}
          </p>
        </div>
      </div>
    </div>
  );
}
