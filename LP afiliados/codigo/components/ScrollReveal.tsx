"use client";

import { useEffect } from "react";

/**
 * Revelação no scroll, por enhancement — nunca por CSS puro.
 *
 * DUAS TENTATIVAS ANTERIORES FALHARAM, e as duas de forma silenciosa:
 *
 * 1. `animation-timeline: view()` protegida por @supports. No Chrome
 *    (que SUPORTA a propriedade, então o @supports não protegia nada) o
 *    range resolveu para -435% e a página inteira abaixo do hero ficou
 *    em opacity 0 — preço e CTA final invisíveis.
 * 2. IntersectionObserver. Correto no papel, mas o callback não é
 *    entregue quando a aba está ocluída/em segundo plano, e aí o
 *    conteúdo escondido nunca era revelado.
 *
 * O padrão comum às duas falhas: esconder primeiro e depender de um
 * mecanismo assíncrono para reaparecer. Aqui a verificação é SÍNCRONA
 * (getBoundingClientRect num listener de scroll passivo), que é o
 * mecanismo mais difícil de quebrar do navegador, e ainda por cima:
 *
 * - o CSS deixa tudo VISÍVEL por padrão; só o JS esconde;
 * - só esconde o que está abaixo da dobra na montagem, então nada que
 *   já esteja à vista pisca;
 * - uma checagem roda imediatamente após esconder;
 * - um temporizador de segurança revela TUDO depois de 4s, aconteça o
 *   que acontecer. Numa página de venda, conteúdo invisível é conversão
 *   zero: o efeito é descartável, a legibilidade não.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dobra = window.innerHeight * 0.9;
    const pendentes = new Set(
      Array.from(document.querySelectorAll<HTMLElement>(".reveal")).filter(
        (el) => el.getBoundingClientRect().top > dobra,
      ),
    );

    if (pendentes.size === 0) return;

    for (const el of pendentes) el.classList.add("will-reveal");

    const revelar = (el: HTMLElement) => {
      el.classList.add("is-visible");
      pendentes.delete(el);
    };

    const checar = () => {
      // Gatilho quando o topo do elemento passa de 88% da altura da
      // tela: o elemento já entrou o suficiente para a animação ser
      // percebida como resposta ao scroll, não como atraso.
      const limite = window.innerHeight * 0.88;
      for (const el of pendentes) {
        if (el.getBoundingClientRect().top < limite) revelar(el);
      }
      if (pendentes.size === 0) desligar();
    };

    const revelarTudo = () => {
      for (const el of Array.from(pendentes)) revelar(el);
      desligar();
    };

    function desligar() {
      window.removeEventListener("scroll", checar);
      window.removeEventListener("resize", checar);
      clearTimeout(seguranca);
    }

    window.addEventListener("scroll", checar, { passive: true });
    window.addEventListener("resize", checar, { passive: true });
    const seguranca = setTimeout(revelarTudo, 4000);

    checar();

    return desligar;
  }, []);

  return null;
}
