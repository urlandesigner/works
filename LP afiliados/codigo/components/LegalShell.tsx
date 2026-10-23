import Link from "next/link";
import { content } from "@/content";
import { SiteFooter } from "@/components/SiteFooter";

type Props = {
  title: string;
  children: React.ReactNode;
};

/**
 * Moldura das páginas legais (/privacy, /terms, /contact).
 *
 * Tom CLARO e coluna estreita, ao contrário da LP: aqui ninguém está
 * sendo persuadido, está lendo. Papel quente + serifada é o formato mais
 * confortável para texto corrido longo, e o contraste com a LP escura
 * deixa óbvio que se saiu do funil.
 *
 * Sem CTA e sem sticky, de propósito. Enfiar botão de compra numa
 * política de privacidade é exatamente o sinal de má-fé que o Google
 * Ads procura em página de afiliado.
 *
 * O link de volta é o único caminho de retorno além do botão do
 * navegador — e precisa existir: visitante que chega ao rodapé, clica em
 * "Privacy" e não acha a saída, sai do site.
 */
export function LegalShell({ title, children }: Props) {
  return (
    <>
      <main className="tone-light flex-1">
        <div className="mx-auto max-w-2xl px-5 py-16 sm:py-20">
          <Link
            href="/"
            className="eyebrow inline-flex items-center gap-2 rounded-sm text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span aria-hidden="true">←</span> Back to the review
          </Link>

          <h1 className="font-display mt-6 text-4xl text-heading uppercase sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-muted">
            Last updated: {content.legal.lastUpdated}
          </p>

          {/* space-y no container, e não margem em cada parágrafo: o
              ritmo do texto legal fica igual em todas as três páginas
              sem depender de quem escreveu o conteúdo. */}
          <div className="mt-10 space-y-5 leading-relaxed text-body [&_a]:text-accent [&_a]:underline [&_h2]:font-display [&_h2]:pt-5 [&_h2]:text-2xl [&_h2]:text-heading [&_h2]:uppercase [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
            {children}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
