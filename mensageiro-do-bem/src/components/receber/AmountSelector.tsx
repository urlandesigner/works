"use client";

import { PAYMENT_AMOUNT_OPTIONS } from "@/constants/receber";

type AmountSelectorProps = {
  value: number;
  onChange: (next: number) => void;
};

export function AmountSelector({ value, onChange }: AmountSelectorProps) {
  return (
    <section
      className="mt-10 rounded-2xl border border-[var(--paper-edge)] bg-[var(--paper)] px-5 py-6 shadow-[var(--shadow-ticket)] sm:px-6 sm:py-7"
      aria-labelledby="amount-selector-heading"
    >
      <h2
        id="amount-selector-heading"
        className="font-serif text-[1.35rem] font-semibold leading-tight text-[var(--ink)] sm:text-[1.5rem]"
      >
        {PAYMENT_AMOUNT_OPTIONS.length > 1
          ? "Escolha como você quer participar"
          : "Sua participação"}
      </h2>

      <div
        className={
          PAYMENT_AMOUNT_OPTIONS.length > 1
            ? "mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3"
            : "mt-5 mx-auto grid max-w-sm grid-cols-1 gap-2.5"
        }
      >
        {PAYMENT_AMOUNT_OPTIONS.map((option) => {
          const selected = option.value === value;
          const recommended = Boolean(option.recommended);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-2xl border px-3 py-3 text-left transition ${
                selected
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_0_0_1px_rgba(198,94,82,0.25)]"
                  : "border-[var(--stroke)] bg-[var(--paper-warm)] hover:border-[var(--accent)]/35"
              }`}
              aria-pressed={selected}
            >
              <span className="block text-base font-semibold text-[var(--ink)]">
                {option.label}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-[var(--muted)]">
                {option.meaning}
              </span>
              {recommended ? (
                <span className="mt-1.5 inline-flex rounded-full border border-[var(--accent)]/30 bg-[var(--paper)] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[var(--accent-mid)]">
                  recomendado
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {PAYMENT_AMOUNT_OPTIONS.length > 1 ? (
        <p className="mt-4 text-xs text-[var(--muted)]">
          Você pode seguir com R$1 — ou escolher ir um pouco além.
        </p>
      ) : (
        <p className="mt-4 text-center text-xs text-[var(--muted)]">
          Pagamento único de R$1 via PIX.
        </p>
      )}
    </section>
  );
}
