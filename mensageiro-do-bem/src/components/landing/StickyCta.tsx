"use client";

import { useEffect, useState } from "react";
import { PrimaryCta } from "./PrimaryCta";

/**
 * Barra de CTA fixa no rodapé — só no mobile e só depois que o usuário
 * rola além do hero. Reaproveita o PrimaryCta (mesma transição para /receber).
 */
export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="animate-sticky-rise fixed inset-x-0 bottom-0 z-[120] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:hidden">
      <div className="mx-auto max-w-sm rounded-full border border-[var(--stroke)] bg-[var(--paper)]/85 p-1.5 shadow-[0_-2px_30px_-10px_rgba(74,67,60,0.35)] backdrop-blur-md">
        <PrimaryCta href="/receber" className="w-full">
          Quero minha mensagem · a partir de R$1
        </PrimaryCta>
      </div>
    </div>
  );
}
