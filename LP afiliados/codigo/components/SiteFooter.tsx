import Link from "next/link";
import { content } from "@/content";

const LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/contact", label: "Contact" },
];

/**
 * Rodapé legal.
 *
 * TENSÃO DELIBERADA com a regra "sem links que dispersem" do CLAUDE.md.
 * A regra continua valendo para o corpo da página — estes três são a
 * exceção padrão, e existem por três motivos concretos:
 *
 * 1. Landing Page Experience (Quality Score) premia transparência.
 *    Afiliado de suplemento é categoria vigiada; página sem identidade
 *    nem contato é o perfil clássico de reprovação.
 * 2. Com o gtag ativo a página grava cookie — política de privacidade
 *    vira exigência legal (CCPA/CPRA no tráfego dos EUA).
 * 3. Quem procura essas páginas já está avaliando confiança. Não achar
 *    custa mais conversão do que o link custa em dispersão.
 *
 * Mitigações: tipografia pequena, sem destaque, depois do CTA final e
 * da divulgação — fora do caminho de quem está convertendo. Nenhum link
 * externo aqui: só rotas internas, das quais se volta.
 */
export function SiteFooter() {
  return (
    <footer className="tone-dark border-t border-line">
      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-5 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {content.legal.lastUpdated.split(", ").at(-1)}{" "}
          {content.legal.siteName}
        </p>

        {/* min-h de 44px em cada link: no mobile isto é alvo de toque,
            não texto decorativo (WCAG 2.5.5). */}
        <nav className="flex flex-wrap gap-x-6 gap-y-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-[44px] items-center rounded-sm hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
