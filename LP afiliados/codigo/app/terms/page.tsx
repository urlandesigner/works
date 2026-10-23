import type { Metadata } from "next";
import { content } from "@/content";
import { LegalShell } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: `Terms of Use — ${content.seo.title.split(":")[0]}`,
  description:
    "What this site is, what it is not, and the limits of the information published here.",
};

/**
 * Termos de uso.
 *
 * O ponto que realmente importa aqui não é blindagem jurídica — é
 * deixar registrado, por escrito, que este site NÃO é o vendedor. Essa
 * é a distinção que evita expectativa errada sobre pedido, garantia e
 * devolução, e é o que um revisor de política do Google Ads procura numa
 * página de afiliado.
 */
export default function TermsPage() {
  const { contactEmail, siteName } = content.legal;

  return (
    <LegalShell title="Terms of Use">
      <p>
        By using {siteName}, you agree to what follows. If you disagree with any
        of it, please stop using the site.
      </p>

      <h2>What this site is</h2>
      <p>
        This is an independent review site. We are not {content.product.vendor},
        we are not affiliated with them beyond the affiliate relationship
        disclosed below, and we do not speak for them. Nothing here is an
        official statement from the manufacturer.
      </p>

      <h2>We are not the seller</h2>
      <p>
        We do not sell, stock, ship, or handle any product. Every purchase
        happens on the retailer&apos;s own checkout, under their terms. Orders,
        payment, shipping, the money-back guarantee, refunds, and customer
        support are entirely theirs — we cannot look up, change, or cancel an
        order, and we cannot issue a refund. For anything involving a purchase,
        contact {content.product.vendor} directly.
      </p>

      <h2>Affiliate relationship</h2>
      <p>
        {content.affiliateDisclosure.text}
      </p>

      <h2>Not medical advice</h2>
      <p>
        {content.healthDisclaimer?.text}
      </p>
      <p>
        Nothing on this site replaces a consultation with a qualified
        professional who knows your medical history. Never delay or stop
        prescribed treatment because of something you read here.
      </p>

      <h2>Accuracy and results</h2>
      <p>
        We write what we can verify at the time of writing, from the product
        label and the manufacturer&apos;s published material, and we say plainly
        when something is unverified. Even so, formulas, prices, package
        contents, and guarantee terms change without notice, and the
        retailer&apos;s page is always the authority — check it before you buy.
      </p>
      <p>
        Individual results vary. Nothing here is a promise of any specific
        outcome.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        This site is provided as is. To the extent permitted by law, we are not
        liable for any loss arising from your use of the information published
        here or from any purchase made through a link on this site.
      </p>

      <h2>Content ownership</h2>
      <p>
        The text and layout of this site are ours. Product names, trademarks,
        and product photography belong to their respective owners and appear
        here for identification and review.
      </p>

      <h2>Changes</h2>
      <p>
        These terms may be updated. The date at the top reflects the last
        revision.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
      </p>
    </LegalShell>
  );
}
