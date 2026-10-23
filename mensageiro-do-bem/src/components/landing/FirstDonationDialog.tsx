"use client";

import { useEffect, useState } from "react";

/** Chave canônica: uma vez visto, o modal não reabre após refresh ou nova visita. */
export const MENSAGEIRO_PRIMEIRA_AJUDA_VISTO_STORAGE_KEY =
  "mensageiro_primeira_ajuda_visto" as const;

/** Chave antiga (compatibilidade com versões que já gravaram “já viu”). */
const MENSAGEIRO_PRIMEIRA_AJUDA_POPUP_LEGACY_KEY =
  "mensageiro_primeira_ajuda_popup_visto" as const;

type FirstDonationDialogProps = {
  show: boolean;
};

function hasSeenPrimeiraAjudaPopup(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const ls = window.localStorage;
    return (
      ls.getItem(MENSAGEIRO_PRIMEIRA_AJUDA_VISTO_STORAGE_KEY) === "1" ||
      ls.getItem(MENSAGEIRO_PRIMEIRA_AJUDA_POPUP_LEGACY_KEY) === "1"
    );
  } catch {
    return false;
  }
}

function markPrimeiraAjudaPopupSeen(): void {
  try {
    const ls = window.localStorage;
    ls.setItem(MENSAGEIRO_PRIMEIRA_AJUDA_VISTO_STORAGE_KEY, "1");
    ls.setItem(MENSAGEIRO_PRIMEIRA_AJUDA_POPUP_LEGACY_KEY, "1");
  } catch {
    /* private mode / quota */
  }
}

export function FirstDonationDialog({ show }: FirstDonationDialogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!show) return;
    if (hasSeenPrimeiraAjudaPopup()) return;
    setOpen(true);
  }, [show]);

  const dismiss = () => {
    markPrimeiraAjudaPopupSeen();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(33,28,23,0.35)] p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-donation-title"
    >
      <div className="w-full max-w-md rounded-3xl border border-[var(--stroke)] bg-[var(--paper)] p-6 shadow-[0_24px_60px_-25px_rgba(64,46,35,0.45)] sm:p-7">
        <h3
          id="first-donation-title"
          className="font-serif text-[1.45rem] font-semibold leading-tight tracking-[-0.015em] text-[var(--ink)]"
        >
          🎉 A primeira ajuda aconteceu
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] sm:text-[0.95rem]">
          Pequenos gestos já estão se transformando em algo real. Obrigado por
          fazer parte disso.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Essa é só a primeira de muitas 🙏
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2.5 font-sans text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-mid)]"
          >
            Continuar
          </button>
          <a
            href="/receber"
            onClick={markPrimeiraAjudaPopupSeen}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--stroke-strong)] bg-[var(--paper-warm)] px-5 py-2.5 font-sans text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--accent)]/35 hover:bg-[var(--accent-soft)]"
          >
            Receber outra mensagem
          </a>
        </div>
      </div>
    </div>
  );
}
