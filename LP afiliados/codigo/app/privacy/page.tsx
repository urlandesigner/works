import type { Metadata } from "next";
import { content } from "@/content";
import { LegalShell } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: `Privacy Policy — ${content.seo.title.split(":")[0]}`,
  description:
    "What this site collects, what it does not, and how advertising cookies are used.",
};

/**
 * Política de privacidade.
 *
 * Escrita para o que a página REALMENTE faz — não é modelo genérico
 * copiado. Se um dia entrar formulário, ou outro script de terceiro,
 * este texto precisa mudar junto. Política que descreve coleta que não
 * existe é tão ruim quanto política ausente: as duas mostram que
 * ninguém leu.
 */
export default function PrivacyPage() {
  const { contactEmail, siteName } = content.legal;

  return (
    <LegalShell title="Privacy Policy">
      <p>
        {siteName} is an independent review site. This page explains what
        information is and is not collected when you visit.
      </p>

      <h2>What we do not collect</h2>
      <p>
        There is no sign-up form, no newsletter, and no account on this site. We
        never ask for your name, email address, phone number, mailing address,
        or payment details, and we have no way to receive them.
      </p>
      <p>
        When you click through to the retailer, you leave this site entirely.
        Anything you enter there — including payment information — goes to
        {" "}{content.product.vendor} and is covered by their privacy policy, not
        this one. We never see it.
      </p>

      <h2>Advertising cookies</h2>
      <p>
        We run ads. When advertising is active, this site loads Google&apos;s
        tag (gtag.js), which sets cookies in your browser so Google can tell
        whether a visit came from one of our ads and whether that visit clicked
        through to the retailer. We use this only to measure which ads work.
      </p>
      <p>
        We do not use it to build a profile of you, and we do not sell or share
        personal information. How Google handles the data it collects is
        described in{" "}
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google&apos;s policy for sites that use its services
        </a>
        . You can block or delete these cookies in your browser settings at any
        time; the page works normally without them.
      </p>

      <h2>Server logs</h2>
      <p>
        Like any website, our host records standard technical data when a page
        is served — IP address, browser type, referring page, and timestamp.
        These logs exist for security and troubleshooting and are not used to
        identify individual visitors.
      </p>

      <h2>Your rights</h2>
      <p>
        If you live in California, the CCPA/CPRA gives you the right to know
        what personal information a business collects about you, to request its
        deletion, and to opt out of its sale or sharing. We do not sell or share
        personal information, and we hold no account data to delete. If you
        believe we hold information about you, write to us and we will respond.
      </p>

      <h2>Children</h2>
      <p>
        This site is intended for adults and is not directed at children under
        13. We do not knowingly collect information from them.
      </p>

      <h2>Changes</h2>
      <p>
        If what we collect changes, this page changes with it, and the date at
        the top is updated.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
      </p>
    </LegalShell>
  );
}
