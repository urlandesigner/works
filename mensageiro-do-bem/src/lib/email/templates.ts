import { MESSAGE_REINFORCEMENT } from "@/constants/messages";

export type EmailTemplate = {
  subject: string;
  previewText: string;
  html: string;
  text: string;
};

type BaseEmailOptions = {
  eyebrow: string;
  title: string;
  intro: string;
  body: string;
  closing: string;
  ctaLabel?: string;
  ctaHref?: string;
  footerNote?: string;
};

type PaymentConfirmedEmailInput = {
  recipientName?: string;
  amountLabel: string;
  messageTitle: string;
  messageBody: string;
  messageClosing: string;
  messageUrl?: string;
};

type MessageGiftEmailInput = {
  recipientName?: string;
  senderName?: string;
  note?: string;
  redeemUrl?: string;
};

type ComeBackEmailInput = {
  recipientName?: string;
  messageUrl?: string;
};

type PreviewEmail = {
  id: string;
  name: string;
  description: string;
  template: EmailTemplate;
};

const BRAND = {
  background: "#f3ece2",
  panel: "#fdf9f3",
  panelWarm: "#faf5ec",
  ink: "#4a433c",
  muted: "#7d7268",
  stroke: "#e0d5c8",
  accent: "#c65e52",
  accentDeep: "#b54d42",
  glow: "#ead8c4",
} as const;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function paragraphize(value: string): string {
  return escapeHtml(value)
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.replace(/\n/g, "<br />"))
    .join("</p><p style=\"margin:0 0 18px;\">");
}

function createBaseEmailTemplate({
  eyebrow,
  title,
  intro,
  body,
  closing,
  ctaLabel,
  ctaHref,
  footerNote,
}: BaseEmailOptions): EmailTemplate {
  const safeEyebrow = escapeHtml(eyebrow);
  const safeTitle = escapeHtml(title);
  const safeIntro = escapeHtml(intro);
  const safeClosing = escapeHtml(closing);
  const safeFooterNote = escapeHtml(
    footerNote ??
      "Mensageiro do Bem. Palavras curtas, carinho inteiro, no momento certo.",
  );
  const safeCtaLabel = ctaLabel ? escapeHtml(ctaLabel) : "";
  const safeCtaHref = ctaHref?.trim() ? ctaHref.trim() : "";

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.background};font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;color:${BRAND.ink};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${safeIntro}</div>
    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="background:${BRAND.background};margin:0;padding:24px 0;width:100%;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="width:100%;max-width:640px;margin:0 auto;padding:0 18px;">
            <tr>
              <td>
                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="background:${BRAND.panel};border:1px solid ${BRAND.stroke};border-radius:28px;overflow:hidden;box-shadow:0 14px 40px rgba(74,67,60,0.10);">
                  <tr>
                    <td style="padding:0 0 18px;background:radial-gradient(circle at top, ${BRAND.glow} 0%, ${BRAND.panel} 58%);">
                      <div style="padding:36px 34px 10px;">
                        <p style="margin:0 0 18px;font-size:11px;line-height:1.6;letter-spacing:0.28em;text-transform:uppercase;font-weight:700;color:${BRAND.muted};">${safeEyebrow}</p>
                        <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:42px;line-height:0.98;font-weight:600;letter-spacing:-0.04em;color:${BRAND.ink};">${safeTitle}</h1>
                        <p style="margin:22px 0 0;font-size:17px;line-height:1.8;color:${BRAND.muted};">${safeIntro}</p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 34px 34px;">
                      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="background:${BRAND.panelWarm};border:1px solid ${BRAND.stroke};border-radius:24px;">
                        <tr>
                          <td style="padding:26px 24px;font-size:18px;line-height:1.9;color:${BRAND.ink};">
                            <p style="margin:0 0 18px;">${paragraphize(body)}</p>
                            <p style="margin:26px 0 0;font-size:16px;line-height:1.8;color:${BRAND.muted};">${safeClosing}</p>
                          </td>
                        </tr>
                      </table>
                      ${
                        safeCtaHref && safeCtaLabel
                          ? `<table role="presentation" cellPadding="0" cellSpacing="0" style="margin:28px auto 0;">
                        <tr>
                          <td align="center" style="border-radius:999px;background:${BRAND.accent};">
                            <a href="${escapeHtml(safeCtaHref)}" style="display:inline-block;padding:15px 28px;border-radius:999px;font-size:14px;line-height:1.2;font-weight:700;letter-spacing:0.03em;text-decoration:none;color:#fffaf7;background:linear-gradient(180deg, ${BRAND.accent} 0%, ${BRAND.accentDeep} 100%);">${safeCtaLabel}</a>
                          </td>
                        </tr>
                      </table>`
                          : ""
                      }
                      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="margin-top:24px;">
                        <tr>
                          <td style="padding-top:22px;border-top:1px solid ${BRAND.stroke};font-size:13px;line-height:1.8;color:${BRAND.muted};">
                            ${safeFooterNote}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const textParts = [
    eyebrow.toUpperCase(),
    "",
    title,
    "",
    intro,
    "",
    body,
    "",
    closing,
    ctaLabel && safeCtaHref ? "" : null,
    ctaLabel && safeCtaHref ? `${ctaLabel}: ${safeCtaHref}` : null,
    "",
    safeFooterNote,
  ].filter(Boolean);

  return {
    subject: title,
    previewText: intro,
    html,
    text: textParts.join("\n"),
  };
}

export function buildPaymentConfirmedEmailTemplate({
  recipientName,
  amountLabel,
  messageTitle,
  messageBody,
  messageClosing,
  messageUrl,
}: PaymentConfirmedEmailInput): EmailTemplate {
  const name = recipientName?.trim() || "você";
  return {
    ...createBaseEmailTemplate({
      eyebrow: "Pagamento confirmado",
      title: `${name}, sua mensagem já está pronta.`,
      intro: `Seu gesto de ${amountLabel} foi confirmado. Agora é hora de abrir a sua pausa de carinho.`,
      body: `${messageTitle}\n\n${messageBody}\n\n${MESSAGE_REINFORCEMENT}`,
      closing: messageClosing,
      ctaLabel: messageUrl ? "Abrir minha mensagem" : undefined,
      ctaHref: messageUrl,
      footerNote:
        "Obrigada por sustentar um projeto que transforma pequenos gestos em respiro real no meio do dia.",
    }),
    subject: "Sua mensagem do Mensageiro do Bem chegou",
    previewText: `Pagamento confirmado. Sua mensagem já pode ser aberta agora.`,
  };
}

export function buildMessageGiftEmailTemplate({
  recipientName,
  senderName,
  note,
  redeemUrl,
}: MessageGiftEmailInput): EmailTemplate {
  const name = recipientName?.trim() || "você";
  const sender = senderName?.trim() || "Alguém que gosta de você";
  const safeNote = note?.trim()
    ? `\n\nRecado de ${sender}:\n${note.trim()}`
    : "";

  return {
    ...createBaseEmailTemplate({
      eyebrow: "Um carinho chegou",
      title: `${name}, tem uma mensagem esperando por você.`,
      intro: `${sender} enviou um gesto delicado para tornar o seu dia um pouco mais leve.`,
      body: `Não precisa responder correndo, nem estar no melhor momento.\n\nBasta abrir quando sentir que essa pausa cabe no seu peito.${safeNote}`,
      closing: "Abra com calma. O carinho continua aqui.",
      ctaLabel: redeemUrl ? "Receber minha mensagem" : undefined,
      ctaHref: redeemUrl,
      footerNote:
        "Mensageiro do Bem existe para fazer o cuidado caber em poucos segundos, sem perder profundidade.",
    }),
    subject: "Você recebeu um gesto de carinho",
    previewText: `${sender} enviou uma mensagem especial para você.`,
  };
}

export function buildComeBackEmailTemplate({
  recipientName,
  messageUrl,
}: ComeBackEmailInput): EmailTemplate {
  const name = recipientName?.trim() || "você";

  return {
    ...createBaseEmailTemplate({
      eyebrow: "Volte quando quiser",
      title: `${name}, talvez hoje caiba mais uma palavra boa.`,
      intro:
        "Tem dias em que a gente não precisa de solução completa. Só de uma frase certa, na hora certa.",
      body: "Se o dia apertou, volta aqui.\n\nO Mensageiro do Bem continua sendo esse lugar pequeno, mas sincero, para te encontrar com alguma delicadeza no meio do caminho.",
      closing: "Quando quiser respirar um pouco melhor, a porta continua aberta.",
      ctaLabel: messageUrl ? "Quero receber outra mensagem" : undefined,
      ctaHref: messageUrl,
      footerNote:
        "Você está recebendo este e-mail porque já abriu uma mensagem do Mensageiro do Bem antes.",
    }),
    subject: "Uma nova pausa de carinho para o seu dia",
    previewText: "Se hoje estiver pesado, talvez uma mensagem curta já ajude.",
  };
}

export function getEmailTemplatePreviews(): PreviewEmail[] {
  return [
    {
      id: "payment-confirmed",
      name: "Confirmação com entrega da mensagem",
      description:
        "Template transacional principal para quando o PIX for confirmado e a pessoa puder abrir a mensagem.",
      template: buildPaymentConfirmedEmailTemplate({
        recipientName: "Ana",
        amountLabel: "R$10,00",
        messageTitle: "Para você, agora.",
        messageBody:
          "Hoje não precisa ser perfeito.\n\nBasta ser seu — com calma, com coragem do tamanho que couber no peito.\n\nO mundo continua girando, e você, aos poucos, também segue.",
        messageClosing: "Guarda esse carinho.",
        messageUrl: "https://mensageirodobem.com/mensagem?id=m01",
      }),
    },
    {
      id: "gift-message",
      name: "Presente de carinho",
      description:
        "Template para presente ou indicação pessoal, com espaço para um recado curto de quem enviou.",
      template: buildMessageGiftEmailTemplate({
        recipientName: "Rafael",
        senderName: "Camila",
        note:
          "Pensei em você hoje e quis te mandar algo pequeno, mas cheio de cuidado.",
        redeemUrl: "https://mensageirodobem.com/receber",
      }),
    },
    {
      id: "come-back",
      name: "Reativação suave",
      description:
        "Template de retorno, mantendo o tom leve do produto sem parecer uma cobrança comercial.",
      template: buildComeBackEmailTemplate({
        recipientName: "Julia",
        messageUrl: "https://mensageirodobem.com/receber",
      }),
    },
  ];
}
