"use client";

import { useEffect, useState } from "react";

/**
 * Único client component da página.
 *
 * Visível só no meio da página: aparece quando o CTA do hero sai da
 * tela e some quando o CTA final entra — dois botões idênticos
 * empilhados são ruído exatamente na seção que fecha a venda.
 * Progressive enhancement: sem JS, o CTA do hero e o final continuam
 * funcionando.
 *
 * Recebe href/label por props em vez de importar o content: importar
 * aqui arrastaria o conteúdo INTEIRO (análise, FAQ, depoimentos) para
 * o bundle do navegador, duplicando o que já está no HTML estático.
 *
 * Recebe ids em vez de refs para não obrigar o hero (server component)
 * a virar client.
 */
export function StickyMobileCTA({
  href,
  label,
  showAfterId,
  hideWhenVisibleId,
}: {
  href: string;
  label: string;
  /** O sticky só aparece depois que este elemento sai da tela. */
  showAfterId: string;
  /** O sticky some enquanto este elemento está na tela. */
  hideWhenVisibleId?: string;
}) {
  const [heroOut, setHeroOut] = useState(false);
  const [finalCtaInView, setFinalCtaInView] = useState(false);

  useEffect(() => {
    const start = document.getElementById(showAfterId);
    if (!start) return;

    const observers: IntersectionObserver[] = [];

    const startObserver = new IntersectionObserver(([entry]) =>
      setHeroOut(!entry.isIntersecting),
    );
    startObserver.observe(start);
    observers.push(startObserver);

    const end = hideWhenVisibleId
      ? document.getElementById(hideWhenVisibleId)
      : null;
    if (end) {
      const endObserver = new IntersectionObserver(([entry]) =>
        setFinalCtaInView(entry.isIntersecting),
      );
      endObserver.observe(end);
      observers.push(endObserver);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, [showAfterId, hideWhenVisibleId]);

  const visible = heroOut && !finalCtaInView;

  return (
    <div
      // aria-hidden quando oculto: o leitor de tela não anuncia um CTA
      // duplicado, já que o mesmo link existe no hero e no CTA final.
      aria-hidden={!visible}
      className={[
        // Barra escura, não branca: ela flutua sobre seções claras E
        // escuras, e um fundo branco sobre a seção de preço (escura)
        // parece elemento solto de outra página.
        "fixed inset-x-0 bottom-0 z-50 border-t border-white/10",
        "bg-dark/95 p-3 backdrop-blur sm:hidden",
        "transition-transform duration-200",
        visible ? "translate-y-0" : "pointer-events-none translate-y-full",
      ].join(" ")}
    >
      <a
        href={href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        tabIndex={visible ? undefined : -1}
        // text-dark pelo mesmo motivo do CTAButton: o botão é lima, e
        // branco sobre lima dá 1.15:1.
        className="flex min-h-[52px] w-full items-center justify-center rounded-lg bg-cta px-6 font-semibold text-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
      >
        {label}
      </a>
    </div>
  );
}
