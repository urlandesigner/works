"use client";

import { useCallback, useState } from "react";

type ShareMessageButtonProps = {
  shareText: string;
  shareTitle?: string;
  idleLabel?: string;
  forceCopy?: boolean;
  /** `soft` = botão secundário discreto; `minimal` = link em caixa alta (legado). */
  variant?: "minimal" | "soft";
};

const DEFAULT_SHARE_TITLE = "Mensageiro do Bem";

export function ShareMessageButton({
  shareText,
  shareTitle = DEFAULT_SHARE_TITLE,
  idleLabel = "Compartilhar com alguém",
  forceCopy = false,
  variant = "minimal",
}: ShareMessageButtonProps) {
  const [hint, setHint] = useState<"idle" | "copied" | "shared">("idle");

  const handle = useCallback(async () => {
    try {
      if (!forceCopy && typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
        });
        setHint("shared");
        window.setTimeout(() => setHint("idle"), 2200);
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setHint("copied");
        window.setTimeout(() => setHint("idle"), 2200);
      }
    } catch {
      setHint("idle");
    }
  }, [forceCopy, shareText, shareTitle]);

  const label =
    hint === "copied"
      ? "Mensagem copiada"
      : hint === "shared"
        ? "Obrigado"
        : idleLabel;

  const className =
    variant === "soft"
      ? "rounded-full border border-[var(--stroke-strong)] bg-[var(--paper)]/75 px-7 py-2.5 text-sm font-medium tracking-normal text-[var(--muted)] shadow-sm transition hover:border-[var(--accent)]/30 hover:bg-[var(--accent-soft)] hover:text-[var(--accent-mid)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]/35 active:scale-[0.98]"
      : "text-[0.65rem] font-medium uppercase tracking-[0.35em] text-[var(--muted)]/55 transition hover:text-[var(--accent-mid)]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]/40";

  return (
    <button type="button" onClick={handle} className={className}>
      {label}
    </button>
  );
}
