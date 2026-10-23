"use client";

import { useEffect } from "react";
import { CONVERSION_SEND_TO, reportarCliqueNoCheckout } from "@/lib/ads";

/**
 * Ouve o clique no CTA por DELEGAÇÃO, no documento — em vez de pôr um
 * onClick dentro do CTAButton.
 *
 * O motivo é de bundle, não de estilo: `CTAButton` importa `content`.
 * Transformá-lo em client component arrastaria a camada de conteúdo
 * inteira (headline, FAQ, análise) para o JavaScript do navegador,
 * duplicando texto que já está no HTML. O README registra "bundle do
 * cliente sem o texto do content" como propriedade verificada; este
 * componente preserva isso — ele não importa `content`, só escuta.
 *
 * O alvo é `a[data-cta="checkout"]`, marcado no CTAButton. `closest`
 * cobre o clique nos filhos do botão (o rótulo e a seta são <span>).
 */
export function CheckoutClickTracker() {
  useEffect(() => {
    if (!CONVERSION_SEND_TO) return;

    const aoClicar = (evento: MouseEvent) => {
      const alvo = evento.target as HTMLElement | null;
      if (alvo?.closest('a[data-cta="checkout"]')) reportarCliqueNoCheckout();
    };

    document.addEventListener("click", aoClicar);
    return () => document.removeEventListener("click", aoClicar);
  }, []);

  return null;
}
