"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { PrimaryCta } from "@/components/landing/PrimaryCta";
import { ShareMessageButton } from "@/components/mensagem/ShareMessageButton";
import { MESSAGE_CONTINUITY_LINE, SHARE_INVITE_LINE } from "@/constants/messages";
import { formatMensagemMoment } from "@/lib/format-mensagem-moment";

type RevealProps = {
  delayMs: number;
  children: ReactNode;
  className?: string;
};

function Reveal({ delayMs, children, className = "" }: RevealProps) {
  const style = {
    "--fade-delay": `${delayMs}ms`,
  } as CSSProperties;

  return (
    <div className={`mensagem-soft-fade ${className}`} style={style}>
      {children}
    </div>
  );
}

type MensagemAnimatedProps = {
  messageId: string;
  body: string;
  contributionAmount?: number | null;
};

/** Pausa curta (0.8-1.5s) + revelação em fade-in suave, sem libs. */
export function MensagemAnimated({
  messageId,
  body,
  contributionAmount,
}: MensagemAnimatedProps) {
  const [ready, setReady] = useState(false);
  const [momentLine, setMomentLine] = useState("");
  const [momentIso, setMomentIso] = useState("");

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ms = reduced
      ? 0
      : 800 + Math.floor(Math.random() * 700);

    const t = window.setTimeout(() => {
      const now = new Date();
      setMomentLine(formatMensagemMoment(now));
      setMomentIso(now.toISOString());
      setReady(true);
    }, ms);
    return () => window.clearTimeout(t);
  }, [messageId]);

  const normalizedBody = body.replace(/\n{2,}/g, "\n").trim();
  const shareText = `${normalizedBody}\n\n${SHARE_INVITE_LINE}`;
  const amountLabel =
    typeof contributionAmount === "number"
      ? new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(contributionAmount)
      : null;

  if (!ready) {
    return (
      <div
        className="mx-auto flex min-h-[14rem] w-full max-w-xl flex-col items-center justify-center px-4 text-center sm:min-h-[16rem]"
        aria-busy="true"
      >
        <p
          className="mensagem-preparing font-serif text-lg leading-relaxed text-[var(--muted)] sm:text-xl"
          role="status"
          aria-live="polite"
        >
          Sua mensagem chegou…
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl text-center md:max-w-2xl lg:max-w-3xl">
      <Reveal delayMs={0}>
        <div>
          <time
            dateTime={momentIso}
            className="block font-sans text-[0.75rem] font-medium tracking-[0.06em] text-[var(--muted)]/70 sm:text-[0.8125rem]"
          >
            {momentLine}
          </time>
          <h1 className="mt-5 font-serif text-[1.9rem] font-medium leading-[1.2] tracking-[-0.02em] text-[var(--ink)] md:mt-6 md:text-[2.2rem]">
            Uma mensagem para você.
          </h1>
        </div>
      </Reveal>

      <Reveal delayMs={120} className="mt-12 sm:mt-14">
        <p className="mb-3 font-sans text-sm font-medium text-[var(--ink)]/85 sm:text-[0.95rem]">
          Talvez isso seja o que você precisava hoje:
        </p>
        <div className="mx-auto max-w-2xl rounded-3xl border border-[var(--stroke)] bg-[var(--paper)]/78 px-6 py-7 shadow-[var(--shadow-ticket)] sm:px-8 sm:py-8 lg:max-w-3xl">
          <p className="whitespace-pre-line font-serif text-[1.14rem] font-normal leading-[1.7] text-[var(--ink)]/92 sm:text-[1.3rem] sm:leading-[1.75]">
            {normalizedBody}
          </p>
        </div>
      </Reveal>

      <Reveal delayMs={460} className="mt-14 sm:mt-16">
        <div className="flex flex-col items-center gap-6">
          <p className="text-sm leading-relaxed text-[var(--muted)]/90">
            {amountLabel
              ? `Seu gesto de ${amountLabel} também ajuda a fazer isso acontecer.`
              : "Esse gesto também ajuda alguém."}
          </p>
          <PrimaryCta
            href="/receber"
            variant="solid"
            className="w-full !bg-[#C9785C] [background-image:none] text-white shadow-[0_4px_24px_-6px_rgba(201,120,92,0.55),0_1px_0_0_rgba(255,255,255,0.2)_inset] hover:!brightness-[1.06] hover:shadow-[0_6px_28px_-6px_rgba(201,120,92,0.5)] focus-visible:outline-[#C9785C] sm:w-auto"
          >
            Receber outra mensagem
          </PrimaryCta>
          <ShareMessageButton
            shareText={shareText}
            variant="soft"
            forceCopy
            idleLabel="Copiar mensagem"
          />

          <p className="text-sm text-[var(--muted)]/90">
            {MESSAGE_CONTINUITY_LINE}
          </p>
        </div>
      </Reveal>
    </div>
  );
}
