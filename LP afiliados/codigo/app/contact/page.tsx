import type { Metadata } from "next";
import { content } from "@/content";
import { LegalShell } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: `Contact — ${content.seo.title.split(":")[0]}`,
  description:
    "How to reach the people who write this site, and where to go for order and refund questions.",
};

/**
 * Contato.
 *
 * Sem formulário, de propósito: formulário implica coletar dados, e a
 * política de privacidade afirma que este site não coleta nada. Um
 * `mailto:` mantém as duas páginas verdadeiras ao mesmo tempo, e não
 * adiciona campo nem validação a manter.
 *
 * Metade da página é redirecionamento honesto: a maioria de quem escreve
 * para site de afiliado quer falar de PEDIDO, e quem resolve isso é o
 * vendedor. Dizer isso na cara evita a expectativa errada.
 */
export default function ContactPage() {
  const { contactEmail, siteName } = content.legal;

  return (
    <LegalShell title="Contact">
      <p>
        {siteName} is run by a small independent team. You can reach us at{" "}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. We read every
        message and usually reply within a few business days.
      </p>

      <h2>Good reasons to write</h2>
      <ul>
        <li>
          Something on this page is wrong, out of date, or unclear — tell us and
          we will check it and correct it.
        </li>
        <li>A question about how we researched the product.</li>
        <li>Questions about our privacy policy or terms of use.</li>
      </ul>

      <h2>What we cannot help with</h2>
      <p>
        We are not the seller. We have no access to orders, payments, shipping,
        or the money-back guarantee, and we cannot look up, change, cancel, or
        refund a purchase. If your question is about an order you placed, please
        contact {content.product.vendor} — the support details are on their
        website and on your order confirmation email. Writing to us first only
        delays the answer.
      </p>

      <h2>Medical questions</h2>
      <p>
        We cannot give medical advice, and it would be irresponsible to try.
        Whether a supplement is appropriate for you — especially alongside
        prescription medication or a diagnosed condition — is a question for
        your doctor or pharmacist, who knows your history.
      </p>
    </LegalShell>
  );
}
