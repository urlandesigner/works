/**
 * Google Ads — identificadores e disparo de conversão.
 *
 * POR QUE ISTO EXISTE, e não é "só analytics":
 *
 * Numa LP de afiliado a venda acontece no checkout de TERCEIRO, fora do
 * nosso domínio. O Google Ads nunca vê essa venda. Sem nenhum sinal de
 * conversão, o Smart Bidding (Maximize conversions, tCPA, tROAS) não tem
 * o que otimizar e a campanha vira leilão às cegas — só resta CPC manual
 * mirando clique, que é a métrica errada.
 *
 * A conversão possível aqui é o CLIQUE DE SAÍDA para o checkout. Não é
 * venda, e não deve ser confundida com venda: é o melhor sinal que a
 * página consegue emitir honestamente. A receita real continua vindo do
 * relatório do Digistore24 — a conversão do Ads serve para o algoritmo
 * aprender QUEM clica, não para medir faturamento.
 *
 * Nada é enviado enquanto as variáveis não existirem. Sem elas, nenhum
 * script de terceiro entra na página: zero requisição, zero cookie, zero
 * impacto em LCP. Isso é intencional — a LP precisa continuar publicável
 * antes de existir conta de anúncios.
 *
 * Como preencher (`.env.production`, ou Environment Variables na
 * hospedagem):
 *
 *   NEXT_PUBLIC_GOOGLE_ADS_ID=AW-1234567890
 *   NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=AbC-D1efGhIjKl2M3n
 *
 * Os dois saem de Google Ads → Goals → Conversions → nova ação de
 * conversão do tipo "Website", categoria "Outros" (NÃO "Compra": não há
 * compra confirmada aqui), contagem "Uma" por clique. O rótulo aparece
 * no trecho de código que o Ads mostra, depois da barra em `send_to`.
 *
 * `NEXT_PUBLIC_` é obrigatório: com `output: 'export'` o valor é
 * embutido no bundle em tempo de build. Trocar a conta exige rebuild.
 */

export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || null;

const CONVERSION_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?.trim() || null;

/**
 * O identificador completo que o gtag espera em `send_to`.
 * null quando falta qualquer uma das duas metades — meia configuração
 * dispararia evento que o Ads descarta em silêncio, que é pior que
 * não disparar.
 */
export const CONVERSION_SEND_TO =
  GOOGLE_ADS_ID && CONVERSION_LABEL
    ? `${GOOGLE_ADS_ID}/${CONVERSION_LABEL}`
    : null;

type Gtag = (
  command: "event" | "config" | "js",
  target: string | Date,
  params?: Record<string, unknown>,
) => void;

declare global {
  interface Window {
    gtag?: Gtag;
    dataLayer?: unknown[];
  }
}

/**
 * Registra o clique de saída como conversão.
 *
 * Não precisa de `event_callback` nem de segurar a navegação: o CTA
 * abre em nova aba (`target="_blank"`), então esta página continua viva
 * e o beacon completa sozinho. Prender o clique num callback só
 * introduziria atraso perceptível e risco de o visitante ficar preso se
 * o gtag falhar.
 */
export function reportarCliqueNoCheckout(): void {
  if (!CONVERSION_SEND_TO) return;
  window.gtag?.("event", "conversion", { send_to: CONVERSION_SEND_TO });
}
