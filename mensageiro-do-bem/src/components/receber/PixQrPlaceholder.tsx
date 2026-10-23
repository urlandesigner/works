/**
 * QR ilustrativo (não codifica dados reais). Apenas visual para a simulação.
 */
export function PixQrPlaceholder() {
  return (
    <figure className="mx-auto flex w-full max-w-[220px] flex-col items-center gap-3">
      <div
        className="relative w-full overflow-hidden rounded-xl border border-[var(--paper-edge)] bg-white p-4 shadow-[var(--shadow-ticket)]"
        aria-hidden
      >
        <svg
          viewBox="0 0 100 100"
          className="aspect-square w-full text-[var(--ink)]"
          role="img"
        >
          <title>QR Code ilustrativo</title>
          <rect width="100" height="100" fill="#fdfcfa" />
          {/* Cantos estilo QR */}
          <path
            fill="currentColor"
            d="M8 8h28v28H8V8zm4 4v20h20V12H12zm4 4h12v12H16V16zm36-12h28v28H44V8zm4 4v20h20V12H48zm4 4h12v12H52V16zM8 64h28v28H8V64zm4 4v20h20V68H12zm4 4h12v12H16V72z"
          />
          <rect x="44" y="44" width="12" height="12" fill="currentColor" />
          <rect x="60" y="44" width="8" height="8" fill="currentColor" />
          <rect x="76" y="44" width="16" height="8" fill="currentColor" />
          <rect x="44" y="60" width="8" height="16" fill="currentColor" />
          <rect x="56" y="60" width="12" height="8" fill="currentColor" />
          <rect x="76" y="56" width="8" height="12" fill="currentColor" />
          <rect x="88" y="56" width="8" height="8" fill="currentColor" />
          <rect x="68" y="72" width="8" height="8" fill="currentColor" />
          <rect x="80" y="72" width="16" height="12" fill="currentColor" />
          <rect x="44" y="80" width="20" height="12" fill="currentColor" />
          <rect x="68" y="84" width="12" height="8" fill="currentColor" />
        </svg>
      </div>
      <figcaption className="text-center text-[0.7rem] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
        Ilustração · não é um PIX real
      </figcaption>
    </figure>
  );
}
