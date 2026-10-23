type SealedLetterProps = {
  /** Reduz a escala para usos secundários (ex.: CTA final). */
  size?: "lg" | "sm";
  className?: string;
};

/**
 * Carta lacrada feita em puro CSS — âncora visual da marca "Mensageiro".
 * Um papel dobrado espiando de um envelope, com lacre de cera em formato de coração.
 */
export function SealedLetter({ size = "lg", className = "" }: SealedLetterProps) {
  const scale = size === "lg" ? "w-[15rem] sm:w-[17rem]" : "w-[9rem]";

  return (
    <div
      className={`relative ${scale} ${className}`}
      role="img"
      aria-label="Uma carta lacrada esperando para ser aberta"
    >
      {/* Halo quente atrás da carta */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--glow-2)] blur-3xl opacity-70"
        aria-hidden
      />

      <div className="animate-letter-float">
        <div className="relative aspect-[7/5] w-full">
          {/* Papel espiando por cima do envelope */}
          <div className="absolute inset-x-[14%] -top-[26%] h-[78%] rotate-[-1deg] rounded-t-md rounded-b-sm border border-[var(--paper-edge)] bg-gradient-to-b from-white to-[var(--paper-warm)] shadow-[0_10px_30px_-14px_rgba(74,67,60,0.45)]">
            <div className="space-y-[7px] px-[16%] pt-[18%]">
              <span className="block h-[3px] w-[72%] rounded-full bg-[var(--ink)]/12" />
              <span className="block h-[3px] w-[90%] rounded-full bg-[var(--ink)]/10" />
              <span className="block h-[3px] w-[60%] rounded-full bg-[var(--ink)]/10" />
            </div>
          </div>

          {/* Corpo do envelope */}
          <div className="absolute inset-0 overflow-hidden rounded-xl border border-[var(--paper-edge)] bg-gradient-to-b from-[var(--paper)] to-[#f3e8da] shadow-[var(--shadow-ticket),0_30px_60px_-28px_rgba(74,67,60,0.4)]">
            {/* Abas laterais (formam o "V" do envelope) */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(115deg, rgba(74,67,60,0.05) 0%, transparent 42%), linear-gradient(245deg, rgba(74,67,60,0.05) 0%, transparent 42%)",
              }}
              aria-hidden
            />
            {/* Aba inferior em V */}
            <div
              className="absolute inset-x-0 bottom-0 h-[58%]"
              style={{
                background: "linear-gradient(180deg, transparent, rgba(74,67,60,0.04))",
                clipPath: "polygon(0 100%, 50% 26%, 100% 100%)",
              }}
              aria-hidden
            />
            {/* Linha do vinco superior */}
            <div
              className="absolute inset-x-0 top-0 h-[55%]"
              style={{ clipPath: "polygon(0 0, 50% 72%, 100% 0)" }}
              aria-hidden
            >
              <div className="h-full w-full bg-gradient-to-b from-[#f7eee2] to-transparent" />
            </div>
          </div>

          {/* Lacre de cera */}
          <div className="absolute left-1/2 top-[46%] flex h-[28%] w-[28%] -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-[#d6786c] via-[var(--accent)] to-[var(--accent-mid)] shadow-[0_6px_16px_-4px_rgba(181,77,66,0.6),inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-3px_6px_rgba(120,40,32,0.45)] ring-2 ring-[var(--accent-mid)]/30">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-[52%] w-[52%] text-[var(--accent-foreground)]/90 drop-shadow-[0_1px_1px_rgba(120,40,32,0.5)]"
              aria-hidden
            >
              <path
                d="M12 20.5S3.5 14.7 3.5 9.2a4.7 4.7 0 0 1 8.5-2.8 4.7 4.7 0 0 1 8.5 2.8c0 5.5-8.5 11.3-8.5 11.3Z"
                fill="currentColor"
              />
            </svg>
            {/* Brilho que percorre o lacre */}
            <span
              className="animate-seal-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/55 blur-[2px]"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </div>
  );
}
