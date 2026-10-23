# Requisitos do Produto

## Natureza e Acesso
- Ferramenta interna e pessoal da UD Labs.
- Usuário único (administrador/dono). Sem clientes, sem multiusuário, sem permissões ou roles.
- Login simples, apenas para proteger o acesso. Sem cadastro público, sem convite de usuários, sem recuperação de senha via UI no MVP.

## Fonte de Dados do MVP
- Exclusivamente Google Analytics 4.
- Sem SEO, Search Console, uptime ou IA nesta versão.
- A leitura na UI vem do Supabase; o GA4 é sincronizado em background.

## Lente Temporal Padrão
- Comparação padrão: últimos 7 dias vs 7 dias anteriores.
- Toda variação exibida usa essa base.

## Papéis das Telas (contrato)
- Home (Visão Geral) = central operacional do portfólio. Compara e sinaliza; não aprofunda.
- Dashboard do Site = visão analítica detalhada de um site. Aprofunda; não compara entre sites.
- Regra anti-duplicação: a Home mostra sinal (variação, sparkline, status); o Site mostra substância (valores absolutos, tendência, dimensões).

## Métricas do MVP
GA4:
- Usuários (activeUsers)
- Sessões (sessions)
- Visualizações (screenPageViews)
- Conversões (eventos-chave)

Derivadas / internas:
- Crescimento = variação % do período atual vs período anterior equivalente
- Total de sites (contagem interna)

Terminologia: "Visitantes" = "Usuários" (mesma métrica). Usar sempre "Usuários".

## Dimensões do MVP
- Data (date)
- Página (pagePath + pageTitle) — apenas em "Principais Páginas"
- Canal / Origem (sessionDefaultChannelGroup) — apenas em "Origem de Tráfego"

## Critérios de Atenção (Home)
Em ordem de prioridade:
1. Problemas técnicos: sem sync, erro de integração GA4, ausência de dados.
2. Quedas relevantes: queda > 30% vs período anterior.
3. Crescimentos relevantes: aumento > 50% vs período anterior.

Sites sem sinal aparecem na seção "Estáveis", rebaixada.

## Telas do MVP
1. Login — simples, proteção de acesso.
2. Visão Geral (Home) — central operacional do portfólio.
3. Lista de Sites — gestão + status de sync.
4. Cadastro / Edição de Site.
5. Dashboard do Site — analítico detalhado.
6. Configurações — conexão GA4, sync por site, sair.

## Cadastro de Sites
- Obrigatórios: Nome, URL, GA4 Property ID.
- Opcionais: Cliente (rótulo/metadado, não dá acesso), Segmento, Status.

## Visão Geral (Home) — conteúdo
- Contadores de atenção (técnicos, quedas, picos).
- "Precisam de atenção": por site → motivo, variação (7 vs 7), sparkline, último sync. Ordenada pelos critérios de atenção.
- "Estáveis": lista secundária recolhida.
- Resumo de portfólio rebaixado (total de sites, última atualização).
- NÃO exibe: valores absolutos detalhados, Sessões/Visualizações por site, Principais Páginas.

## Dashboard do Site — conteúdo
- Cabeçalho + período (herdado da Home).
- Cards: Usuários, Sessões, Visualizações, Conversões (valor absoluto + variação 7 vs 7).
- Gráfico de tendência diário (métrica primária: Usuários).
- Origem de Tráfego (canal): Canal, Usuários, Sessões, Conversões (+ variação 7 vs 7); ordenado por Usuários desc. Objetivo: entender rapidamente de onde vêm os usuários e as conversões. Sem atribuição avançada, campanhas, UTMs detalhadas ou funis.
- Principais Páginas (pagePath): Página, Visualizações, % do total; ordenado por Visualizações desc; Top 10 + "ver mais".
- Status / frescor de sync do site.
- A aba de Conversões detalhada (funil/eventos) é Fase 2 (fora do MVP).

## Fora do MVP
- Dispositivo, país/cidade, lista de eventos.
- Atribuição avançada, campanhas, UTMs detalhadas, funis.
- Funil / detalhe de conversões (Fase 2).
- SEO, Search Console, uptime, monitoramento técnico, IA.
- Multiusuário, clientes, permissões, área do cliente, relatórios externos.
- Sort de tabelas e seletor de métrica no gráfico.

Observação de implementação:
- o produto já oferece retry manual de sync por site para suporte operacional;
- isso não muda a regra de produto de que a atualização recorrente principal continua sendo automática, via sync inicial + cron diário.
